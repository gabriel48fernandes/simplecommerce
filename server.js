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
import pedidosRoutes from "./routes/pedidos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


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
app.use(express.static(path.join(__dirname, "frontend/loja")));
app.use("/admin", express.static(path.join(__dirname, "frontend/admin")));

// =====================
// ROTAS API
// =====================
app.use("/auth", authRoutes);
app.use("/produtos", produtosRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/carrinho", carrinhoRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", authRoutes); // Reutiliza rotas de auth para admin

// =====================
// ROTA PRINCIPAL
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "loja", "index.html"));
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
// FALLBACK (para rotas não encontradas)
// =====================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "loja", "index.html"));
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ SimpleCommerce rodando em http://localhost:${PORT}`);
});