// backend/routes/avaliacoes.js
import { Router } from "express";
import { AvaliacaoController } from "../controllers/avaliacaoController.js";

const router = Router();
const controller = new AvaliacaoController();

router.post("/", controller.create.bind(controller));
router.get("/musico/:cpf", controller.readByMusico.bind(controller));

export default router;
