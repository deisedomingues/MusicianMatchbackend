import connection from "../database/connection.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// Configuração do nodemailer (lembre de criar as variáveis no .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const solicitarRedefinicaoSenha = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email é obrigatório." });

  try {
    const [rows] = await connection.query(
      "SELECT cpf, nome FROM Usuario WHERE email = ?",
      [email]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado." });

    const usuario = rows[0];

    const token = uuidv4();
    const expiracao = new Date(Date.now() + 60 * 60 * 1000);

    await connection.query(
      `INSERT INTO ResetSenhaTokens (cpf_usuario, token, expiracao, usado) VALUES (?, ?, ?, FALSE)`,
      [usuario.cpf, token, expiracao]
    );

    const link = `frontend://auth/redefinir-senha?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Redefinição de senha",
      html: `
        <p>Olá, ${usuario.nome},</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo para continuar:</p>
        <a href="${link}">${link}</a>
        <p>Este link é válido por 1 hora.</p>
      `,
    });

    return res.json({
      message: "Email enviado com sucesso para redefinição de senha.",
    });
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const resetarSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha)
    return res
      .status(400)
      .json({ message: "Token e nova senha são obrigatórios." });
  if (novaSenha.length < 6)
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres." });

  try {
    const [rows] = await connection.query(
      "SELECT cpf_usuario, expiracao, usado FROM ResetSenhaTokens WHERE token = ?",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Token inválido." });

    const record = rows[0];

    if (record.usado)
      return res.status(400).json({ message: "Token já foi usado." });

    const agora = new Date();
    if (agora > record.expiracao)
      return res.status(400).json({ message: "Token expirado." });

    const hashSenha = await bcrypt.hash(novaSenha, 10);
    await connection.query("UPDATE Usuario SET senha = ? WHERE cpf = ?", [
      hashSenha,
      record.cpf_usuario,
    ]);

    await connection.query(
      "UPDATE ResetSenhaTokens SET usado = TRUE WHERE token = ?",
      [token]
    );

    return res.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};
