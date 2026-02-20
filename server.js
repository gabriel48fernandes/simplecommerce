// =====================
// ENV (sempre primeiro)
// =====================
import "dotenv/config";

// =====================
// IMPORTS
// =====================
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import produtosRoutes from "./routes/produtos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import carrinhoRoutes from "./routes/carrinho.routes.js";

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

// =====================
// STATIC (FRONTEND)
// =====================
app.use(express.static(path.join(__dirname, "frontend")));

// =====================
// ROTAS API
// =====================
app.use("/auth", authRoutes);
app.use("/produtos", produtosRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/carrinho", carrinhoRoutes);

// =====================
// ROTA PRINCIPAL
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// =====================
// TESTE DB
// =====================
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

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ SimpleCommerce rodando em http://localhost:${PORT}`);
});