// backend/routes/userRoutes.js
import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { autenticarToken } from "../utils/authenticationToken.js";

const router = Router();
const userController = new UserController();

/**
 * POST /register
 * Cadastra um novo usuário
 */
router.post("/register", userController.create);

/**
 * GET /users
 * Lista todos os usuários
 */
router.get("/users", userController.read);

/**
 * GET /users/:cpf
 * Busca um usuário específico pelo CPF
 */
router.get("/users/:cpf", userController.getByCpf);

/**
 * POST /login
 * Autentica o usuário e retorna um token JWT
 */
router.post("/login", userController.login);

/**
 * PUT /profile/:cpf
 * Atualiza os dados de um usuário específico
 */
router.put("/profile/:cpf", autenticarToken, userController.update);

/**
 * DELETE /profile/:cpf
 * Deleta os dados de um usuário específico
 */
router.delete("/profile/:cpf", autenticarToken, userController.delete);

export default router;
