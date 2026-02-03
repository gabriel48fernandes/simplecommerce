// 🔥 SEMPRE PRIMEIRO
import "dotenv/config";

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

import path from "path";
import { fileURLToPath } from "url";

// =====================
// CONFIG PATH (ESM)
// =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// APP
// =====================
const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());

// servir arquivos estáticos (FRONTEND)
app.use(express.static(path.join(__dirname, "frontend")));

// =====================
// IMPORTAR ROTAS
// =====================
import produtosRoutes from "./routes/produtos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";

// =====================
// ROTAS PRINCIPAIS
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Teste DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "conectado",
      hora: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "erro",
      message: error.message,
    });
  }
});

// Debug env
app.get("/debug-env", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_STARTS_WITH: process.env.DATABASE_URL?.slice(0, 30),
  });
});

// =====================
// ROTAS DO SISTEMA
// =====================
app.use("/produtos", produtosRoutes);
app.use("/categorias", categoriasRoutes);

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ SimpleCommerce rodando em http://localhost:${PORT}`);
});
