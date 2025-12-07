import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { autenticarToken } from "../utils/authenticationToken.js";
// import {
//   solicitarRedefinicaoSenha,
//   resetarSenha,
// } from "../controllers/recuperarsenhaController.js";

const routes = Router();
const userController = new UserController();

/**
 * Rota POST /register
 * Cadastra um novo usuário na base de dados
 */

routes.post("/register", userController.create);

/**
 * Rota GET /
 * Lista todos os usuários
 */

routes.get("/users", userController.read);

/**
 * Rota GET /
 * Lista um usuario especifico pelo CPF
 */
routes.get("/users/:cpf", userController.getByCpf);

/**
 * POST /login
 * Autentica o usuário e retorna um token JWT.
 */
routes.post("/login", userController.login);

/**
 * PUT /profile
 * Atualiza os dados de um usuario especifico
 */
routes.put("/profile/:cpf", autenticarToken, userController.update);

/**
 * DELETE /profile
 * Deleta os dados de um usuario especifico
 */
routes.delete("/profile/:cpf", autenticarToken, userController.delete);

export default routes;
