// backend/index.js
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import pool from "./database/connection.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Testa conexão com MySQL
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");
    conn.release();
  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  }
})();

// Usa todas as rotas centralizadas
app.use(routes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
