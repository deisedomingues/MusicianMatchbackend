// backend/routes/contratacaoRoutes.js
import { Router } from "express";
import { ContratacaoController } from "../controllers/contratacaoController.js";

const router = Router();
const controller = new ContratacaoController();

// Rota base GET /contratacoes → evita erro "Cannot GET /contratacoes"
router.get("/", controller.readAll.bind(controller));

// POST /contratacoes → cria uma contratação
router.post("/", controller.create.bind(controller));

// GET /contratacoes/:id → busca contratação por ID
router.get("/:id", controller.readById.bind(controller));

// GET /contratacoes/musico/:cpf → busca contratações de um músico específico
router.get("/musico/:cpf", controller.readByMusico.bind(controller));

// PUT /contratacoes/:id → atualiza contratação por ID
router.put("/:id", controller.update.bind(controller));

// DELETE /contratacoes/:id → remove contratação por ID
router.delete("/:id", controller.delete.bind(controller));

export default router;
