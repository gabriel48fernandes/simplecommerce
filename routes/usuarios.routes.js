import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT id, nome, email, role
      FROM usuarios
    `;

    const valores = [];

    if (search) {
      query += `
        WHERE nome ILIKE $1
        OR email ILIKE $1
        OR CAST(id AS TEXT) ILIKE $1
      `;
      valores.push(`%${search}%`);
    }

    query += " ORDER BY id DESC";

    const clientes = await pool.query(query, valores);

    res.json(clientes.rows);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuários" });
  }
});
export default router;