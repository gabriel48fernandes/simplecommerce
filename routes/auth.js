import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const result = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1 AND senha = $2",
    [email, senha]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ erro: "Login inválido" });
  }

  // token simples (por enquanto)
  const token = Buffer.from(email).toString("base64");

  res.json({ token });
});

export default router;
