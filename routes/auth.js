import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* =========================
   REGISTRO DE USUÁRIO
========================= */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    // Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    // 🔐 Cria hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, nome, email, role`,
      [nome, email, senhaHash]
    );

    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: result.rows[0]
    });

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

    // 🔍 Busca usuário pelo email
    const result = await pool.query(
      "SELECT id, nome, email, senha, role FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Login inválido" });
    }

    const usuario = result.rows[0];

    // 🔐 Compara senha digitada com hash
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Login inválido" });
    }

    const token = Buffer.from(usuario.email).toString("base64");

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

export default router;
