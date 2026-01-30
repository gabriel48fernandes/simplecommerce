// 🔥 SEMPRE PRIMEIRO
import "dotenv/config";

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

// IMPORTAR ROTAS
import produtosRoutes from "./routes/produtos.routes.js";
// depois você pode criar categoriasRoutes, etc

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// =====================
// ROTAS PRINCIPAIS
// =====================

// Rota raiz (teste da API)
app.get("/", (req, res) => {
  res.json({ message: "🚀 API SimpleCommerce rodando" });
});

// Teste de conexão com banco
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "conectado",
      hora: result.rows[0].now,
    });
  } catch (error) {
    console.error("❌ ERRO DB:", error);
    res.status(500).json({
      status: "erro",
      message: error.message,
    });
  }
});

// Debug de ambiente (apenas desenvolvimento)
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
// futuramente:
// app.use("/categorias", categoriasRoutes);

// =====================
// START SERVER
// =====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ SimpleCommerce API rodando em http://localhost:${PORT}`);
});
