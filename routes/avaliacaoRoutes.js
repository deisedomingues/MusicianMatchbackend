// backend/routes/avaliacaoRoutes.js
import { Router } from "express";
import { AvaliacaoController } from "../controllers/avaliacaoController.js";

const router = Router();
const controller = new AvaliacaoController();

// Rota base GET /avaliacoes → só para não dar erro "Cannot GET"
router.get("/", (req, res) => {
  res.json({ message: "Use /avaliacoes/musico/:cpf ou POST /avaliacoes" });
});

// POST /avaliacoes
router.post("/", controller.create.bind(controller));

// GET /avaliacoes/musico/:cpf
router.get("/musico/:cpf", controller.readByMusico.bind(controller));

export default router;
