import pool from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export class UserController {
  async create(req, res) {
    const {
      nome,
      email,
      telefone,
      senha,
      cpf,
      tipo,
      instrumentos,
      localizacao,
      descricao,
    } = req.body;

    try {
      if (!nome || !email || !telefone || !senha || !cpf || !tipo) {
        return res
          .status(400)
          .json({ message: "Todos os campos são obrigatórios." });
      }

      if (senha.length < 6) {
        return res
          .status(400)
          .json({ message: "A senha deve ter pelo menos 6 caracteres." });
      }

      if (!/^[0-9]{11}$/.test(cpf)) {
        return res
          .status(400)
          .json({ message: "CPF inválido. Deve conter 11 dígitos numéricos." });
      }

      if (!["comum", "musico"].includes(tipo)) {
        return res.status(400).json({ message: "Tipo de usuário inválido." });
      }

      const [usuariosExistentes] = await pool.query(
        "SELECT cpf, email FROM usuario WHERE email = ? OR cpf = ?",
        [email, cpf]
      );

      if (usuariosExistentes.length > 0) {
        const conflito =
          usuariosExistentes[0].email === email ? "E-mail" : "CPF";
        return res.status(409).json({ message: `${conflito} já cadastrado.` });
      }

      const hashSenha = await bcrypt.hash(senha, 12);

      await pool.query(
        `INSERT INTO usuario (cpf, nome, email, senha, telefone, tipo)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [cpf, nome.trim(), email.trim(), hashSenha, telefone.trim(), tipo]
      );

      if (tipo === "musico") {
        await pool.query(
          `INSERT INTO musico (cpf_usuario, instrumentos, localizacao, descricao, avaliacao)
        VALUES (?, ?, ?, ?, 0.00)`,
          [cpf, instrumentos.trim(), localizacao.trim(), descricao.trim()]
        );
      }

      return res
        .status(201)
        .json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao cadastrar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async getByCpf(req, res) {
    const { cpf } = req.params;
    try {
      const [usuarios] = await pool.query(
        `
        SELECT 
          u.cpf, 
          u.nome, 
          u.email, 
          u.telefone, 
          u.tipo,
          m.instrumentos,
          m.avaliacao,
          m.localizacao,
          m.descricao
        FROM usuario u
        LEFT JOIN musico m ON u.cpf = m.cpf_usuario
        WHERE u.cpf = ?
        `,
        [cpf]
      );
      const user = usuarios[0];
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(`❌ Erro ao buscar usuário com CPF ${cpf}:`, error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async read(req, res) {
    try {
      const cpfLogado = req.user?.cpf;

      const [usuarios] = await pool.query(`
        SELECT 
          u.cpf, 
          u.nome, 
          u.email, 
          u.telefone, 
          u.tipo,
          m.instrumentos,
          m.avaliacao,
          m.localizacao,
          m.descricao
        FROM usuario u
        LEFT JOIN musico m ON u.cpf = m.cpf_usuario
        WHERE u.tipo = 'musico'
      `);

      const listaFiltrada = cpfLogado
        ? usuarios.filter((u) => u.cpf !== cpfLogado)
        : usuarios;

      if (listaFiltrada.length === 0) {
        return res.status(200).json({ message: "Nenhum músico encontrado." });
      }

      return res.status(200).json(listaFiltrada);
    } catch (error) {
      console.error("❌ Erro ao buscar músicos:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
      const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [
        email,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const usuario = rows[0];

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ message: "Senha incorreta." });
      }

      const token = jwt.sign(
        {
          cpf: usuario.cpf,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      const { senha: _, ...dadoDoUsuario } = usuario;

      return res.status(200).json({
        message: "Login realizado com sucesso!",
        usuario: dadoDoUsuario,
        token,
      });
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async update(req, res) {
    const { nome, telefone, senha } = req.body;
    const { cpf } = req.user;

    try {
      const [rows] = await pool.query("SELECT * FROM usuario WHERE cpf = ?", [
        cpf,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      let novaSenha = rows[0].senha;
      if (senha) {
        if (senha.length < 6) {
          return res
            .status(400)
            .json({ message: "A senha deve ter pelo menos 6 caracteres." });
        }
        novaSenha = await bcrypt.hash(senha, 10);
      }

      const campos = [];
      const valores = [];

      if (nome) {
        campos.push("nome = ?");
        valores.push(nome);
      }
      if (telefone) {
        campos.push("telefone = ?");
        valores.push(telefone);
      }
      if (senha) {
        campos.push("senha = ?");
        valores.push(novaSenha);
      }

      if (campos.length === 0) {
        return res
          .status(400)
          .json({ message: "Nenhum campo para atualizar." });
      }

      valores.push(cpf);

      await pool.query(
        `UPDATE usuario SET ${campos.join(", ")} WHERE cpf = ?`,
        valores
      );

      const [updatedRows] = await pool.query(
        "SELECT * FROM usuario WHERE cpf = ?",
        [cpf]
      );

      const usuarioAtualizado = updatedRows[0];
      const { senha: _, ...dadoDoUsuarioAtualizado } = usuarioAtualizado;

      return res.status(200).json({
        message: "Dados atualizados com sucesso!",
        usuario: dadoDoUsuarioAtualizado,
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async delete(req, res) {
    const { cpf } = req.user;
    try {
      const [rows] = await pool.query("SELECT * FROM usuario WHERE cpf = ?", [
        cpf,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      await pool.query("DELETE FROM usuario WHERE cpf = ?", [cpf]);

      return res.status(200).json({ message: "Usuário excluído com sucesso." });
    } catch (error) {
      console.error("❌ Erro ao excluir usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
}
