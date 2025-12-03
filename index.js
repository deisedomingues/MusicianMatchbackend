import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import pool from "./database/connection.js";
import musicoRoutes from "./routes/musicoRoutes.js";
import avaliacaoRoutes from "./routes/avaliacaoRoutes.js"; 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

pool.getConnection()
  .then(() => console.log("✅ Conectado ao MySQL com sucesso!"))
  .catch(err => console.error("❌ Erro ao conectar ao MySQL:", err));

app.use(routes);
app.use(musicoRoutes);
app.use(avaliacaoRoutes);

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
