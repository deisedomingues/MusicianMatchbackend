import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import pool from "./database/connection.js";
import musicoRoutes from "./routes/musicoRoutes.js";
import avaliacaoRoutes from "./routes/avaliacaoRoutes.js";

const app = express();

// Render (e outros serviços) geralmente fornecem a porta via variável de ambiente
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Testa conexão com MySQL
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");
    conn.release(); // libera a conexão para não ficar presa
  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  }
})();

// Rotas
app.use(routes);
app.use(musicoRoutes);
app.use(avaliacaoRoutes);

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
