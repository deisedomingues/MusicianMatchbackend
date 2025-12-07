// backend/routes/avaliacaoRoutes.js
import { Router } from "express";
import { AvaliacaoController } from "../controllers/avaliacaoController.js";

const router = Router();
const controller = new AvaliacaoController();

// Rota base GET /avaliacoes → evita erro "Cannot GET /avaliacoes"
router.get("/", (req, res) => {
  res.json({ message: "Use /avaliacoes/musico/:cpf ou POST /avaliacoes" });
});

// POST /avaliacoes → cria avaliação
router.post("/", controller.create.bind(controller));

// GET /avaliacoes/musico/:cpf → busca avaliações de um músico
router.get("/musico/:cpf", controller.readByMusico.bind(controller));

export default router;
