import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { autenticarToken, apenasAdmin } from "../middleware/auth.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não definido no .env");
  process.exit(1);
}

const router = express.Router();

/* =========================
   REGISTRO
========================= */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, nome, email, role`,
      [nome, email, senhaHash]
    );

    const usuario = result.rows[0];

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({ token, usuario });

  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ erro: "Erro ao registrar usuário" });
  }
});


/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Login inválido" });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Login inválido" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});
router.get("/clientes", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const clientes = await pool.query(`
      SELECT id, nome, email, role
      FROM usuarios
      ORDER BY id
    `);

    res.json(clientes.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

export default router;