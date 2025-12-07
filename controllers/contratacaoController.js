import pool from "../database/connection.js";

export class ContratacaoController {
  async create(req, res) {
    try {
      let {
        cpf_contratante,
        cpf_musico,
        nome_musico,
        nome_contratante,
        instrumentos,
        data_evento,
        horario,
        localizacao,
        observacoes,
        status = "pendente",
      } = req.body;

      if (!cpf_contratante || !cpf_musico) {
        return res.status(400).json({
          message: "cpf_contratante e cpf_musico são obrigatórios.",
        });
      }

      if (!nome_musico) {
        const [rowsM] = await pool.query(
          "SELECT nome FROM usuario WHERE cpf = ? LIMIT 1",
          [cpf_musico]
        );
        nome_musico = rowsM[0]?.nome || null;
      }

      if (!nome_contratante) {
        const [rowsC] = await pool.query(
          "SELECT nome FROM usuario WHERE cpf = ? LIMIT 1",
          [cpf_contratante]
        );
        nome_contratante = rowsC[0]?.nome || null;
      }

      const query = `
        INSERT INTO Contratacao
          (cpf_contratante, cpf_musico, nome_contratante, nome_musico, instrumentos,
           data_evento, horario, localizacao, observacoes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        cpf_contratante,
        cpf_musico,
        nome_contratante || null,
        nome_musico || null,
        instrumentos || null,
        data_evento || null,
        horario || null,
        localizacao || null,
        observacoes || null,
        status,
      ];

      const [result] = await pool.query(query, params);

      return res.status(201).json({
        message: "Contratação criada com sucesso!",
        id: result.insertId,
      });
    } catch (error) {
      console.error("Erro ao criar contratação:", error);
      return res.status(500).json({
        message: "Erro ao criar contratação.",
        error: error.message,
      });
    }
  }

  async readAll(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM Contratacao
        ORDER BY created_at DESC
      `);

      const result = [];
      for (const c of rows) {
        const [musicoRows] = await pool.query(
          "SELECT telefone, email FROM usuario WHERE cpf = ? LIMIT 1",
          [c.cpf_musico]
        );
        if (musicoRows[0]) {
          const rawTel = musicoRows[0].telefone || "";
          const cleanTel = rawTel.replace(/\D/g, "");
          c.telefone_musico = cleanTel; // <- da tabela usuario
          c.telefone_musico_whatsapp = `55${cleanTel}`;
          c.email_musico = musicoRows[0].email; // <- da tabela usuario
        }
        result.push(c);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao listar contratações:", error);
      return res.status(500).json({
        message: "Erro ao listar contratações.",
        error: error.message,
      });
    }
  }

  async readById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        "SELECT * FROM Contratacao WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Contratação não encontrada." });
      }

      const contratacao = rows[0];

      const [musicoRows] = await pool.query(
        "SELECT telefone, email FROM usuario WHERE cpf = ? LIMIT 1",
        [contratacao.cpf_musico]
      );
      if (musicoRows[0]) {
        const rawTel = musicoRows[0].telefone || "";
        const cleanTel = rawTel.replace(/\D/g, "");
        contratacao.telefone_musico = cleanTel;
        contratacao.telefone_musico_whatsapp = `55${cleanTel}`;
        contratacao.email_musico = musicoRows[0].email;
      }

      return res.status(200).json(contratacao);
    } catch (error) {
      console.error("Erro ao buscar contratação:", error);
      return res.status(500).json({
        message: "Erro ao buscar contratação.",
        error: error.message,
      });
    }
  }

  async readByMusico(req, res) {
    try {
      const { cpf } = req.params;
      const [rows] = await pool.query(
        "SELECT * FROM Contratacao WHERE cpf_musico = ? ORDER BY created_at DESC",
        [cpf]
      );

      const result = [];
      for (const c of rows) {
        const [musicoRows] = await pool.query(
          "SELECT telefone, email FROM usuario WHERE cpf = ? LIMIT 1",
          [c.cpf_musico]
        );
        if (musicoRows[0]) {
          const rawTel = musicoRows[0].telefone || "";
          const cleanTel = rawTel.replace(/\D/g, "");
          c.telefone_musico = cleanTel;
          c.telefone_musico_whatsapp = `55${cleanTel}`;
          c.email_musico = musicoRows[0].email;
        }
        result.push(c);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao listar contratações do músico:", error);
      return res.status(500).json({
        message: "Erro ao listar contratações do músico.",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "DELETE FROM Contratacao WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Contratação não encontrada." });
      }

      return res.status(200).json({ message: "Contratação excluída com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir contratação:", error);
      return res.status(500).json({
        message: "Erro ao excluir contratação.",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status é obrigatório." });
      }

      const [result] = await pool.query(
        "UPDATE Contratacao SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Contratação não encontrada." });
      }

      return res.status(200).json({ message: "Status atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar contratação:", error);
      return res.status(500).json({
        message: "Erro ao atualizar contratação.",
        error: error.message,
      });
    }
  }
}

export default new ContratacaoController();
