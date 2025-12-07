// backend/routes/index.js

import { Router } from "express";
import userRoutes from "./userRoutes.js";
import contratacaoRoutes from "./contratacaoRoutes.js";
import avaliacaoRoutes from "./avaliacaoRoutes.js";
import musicoRoutes from "./musicoRoutes.js";

const routes = Router();

// Rota inicial de teste
routes.get("/", (req, res) => {
  return res.json("Back - MusicianMatch");
});

// Rotas de usuários
routes.use(userRoutes);

// Rotas de contratações
routes.use("/contratacoes", contratacaoRoutes);

// Rotas de avaliações
routes.use("/avaliacoes", avaliacaoRoutes);

// Rotas de músicos
routes.use("/musicos", musicoRoutes);

export default routes;
