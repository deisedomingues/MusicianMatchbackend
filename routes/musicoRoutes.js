import { Router } from "express";
import pool from "../database/connection.js";

const routes = Router();

/**
 * GET /musicos
 * Lista todos os músicos com dados do usuário
 */
routes.get("/musicos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.cpf,
        u.nome,
        u.email,
        m.instrumentos,
        m.localizacao,
        m.descricao AS bio,
        m.avaliacao AS nota_media
      FROM usuario u
      INNER JOIN musico m ON u.cpf = m.cpf_usuario
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar músicos:", err);
    res.status(500).json({ error: "Erro ao buscar músicos" });
  }
});

/**
 * GET /musicos/:cpf
 * Busca um músico específico pelo CPF
 */
routes.get("/musicos/:cpf", async (req, res) => {
  const { cpf } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.cpf,
        u.nome,
        u.email,
        m.instrumentos,
        m.localizacao,
        m.descricao AS bio,
        m.avaliacao AS nota_media
      FROM usuario u
      INNER JOIN musico m ON u.cpf = m.cpf_usuario
      WHERE u.cpf = ?
    `, [cpf]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Músico não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar músico:", err);
    res.status(500).json({ error: "Erro ao buscar músico" });
  }
});

export default routes;
