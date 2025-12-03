import mysql from "mysql2/promise"; 
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

try {
  const connection = await pool.getConnection();
  console.log("✅ Conectado ao MySQL com sucesso!");
  connection.release();
} catch (error) {
  console.error("❌ Erro ao conectar ao MySQL:", error.message);
}

export default pool;
