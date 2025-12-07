// backend/controllers/avaliacaoController.js
import pool from "../database/connection.js";

export class AvaliacaoController {
  // Criar nova avaliação (POST /avaliacoes)
  async create(req, res) {
    try {
      const { cpf_contratante, cpf_musico, nota, comentario, id_contratacao } = req.body;

      if (!cpf_contratante || !cpf_musico || !nota || !id_contratacao) {
        return res.status(400).json({ message: "Dados incompletos." });
      }

      // 1. Inserir avaliação vinculada à contratação
      const insertQuery = `
        INSERT INTO Avaliacao (cpf_contratante, cpf_musico, nota, comentario, id_contratacao)
        VALUES (?, ?, ?, ?, ?)
      `;
      await pool.query(insertQuery, [
        cpf_contratante,
        cpf_musico,
        nota,
        comentario || null,
        id_contratacao,
      ]);

      // 2. Atualizar média de avaliação do músico
      const selectQuery = `
        SELECT AVG(nota) AS media
        FROM Avaliacao
        WHERE cpf_musico = ?
      `;
      const [result] = await pool.query(selectQuery, [cpf_musico]);
      const novaMedia = Number(result[0].media || 0).toFixed(2);

      const updateMusicoQuery = `
        UPDATE musico
        SET avaliacao = ?
        WHERE cpf_usuario = ?
      `;
      await pool.query(updateMusicoQuery, [novaMedia, cpf_musico]);

      // 3. Marcar contratação como avaliada
      const updateContratacaoQuery = `
        UPDATE Contratacao
        SET avaliado = 1
        WHERE id = ?
      `;
      await pool.query(updateContratacaoQuery, [id_contratacao]);

      return res.status(201).json({ message: "Avaliação enviada!" });
    } catch (err) {
      console.error("Erro ao criar avaliação:", err);
      return res.status(500).json({ message: "Erro ao criar avaliação." });
    }
  }

  // Listar avaliações de um músico (GET /avaliacoes/musico/:cpf)
  async readByMusico(req, res) {
    try {
      const { cpf } = req.params;

      const [rows] = await pool.query(
        `SELECT a.*, u.nome AS contratante_nome
         FROM Avaliacao a
         LEFT JOIN usuario u ON a.cpf_contratante = u.cpf
         WHERE a.cpf_musico = ?
         ORDER BY a.created_at DESC`,
        [cpf]
      );

      return res.status(200).json(rows);
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
      return res.status(500).json({ message: "Erro ao buscar avaliações." });
    }
  }
}
