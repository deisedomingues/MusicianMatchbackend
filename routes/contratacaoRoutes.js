// backend/routes/contratacaoRoutes.js
import { Router } from "express";
import { ContratacaoController } from "../controllers/contratacaoController.js";

const router = Router();
const controller = new ContratacaoController();

// POST /contratacoes
router.post("/", controller.create.bind(controller));

// GET /contratacoes
router.get("/", controller.readAll.bind(controller));

// GET /contratacoes/:id
router.get("/:id", controller.readById.bind(controller));

// GET /contratacoes/musico/:cpf
router.get("/musico/:cpf", controller.readByMusico.bind(controller));

// PUT /contratacoes/:id
router.put("/:id", controller.update.bind(controller));

// DELETE /contratacoes/:id
router.delete("/:id", controller.delete.bind(controller));

export default router;
