import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /produtos
 * Lista todos os produtos (HOME)
 */
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.nome,
        p.preco,
        c.nome AS categoria,
        i.url AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN imagens_produto i ON i.produto_id = p.id
      ORDER BY p.id
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar produtos" });
  }
});

/**
 * GET /produtos/:id
 * Detalhe do produto
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.id,
        p.nome,
        p.preco,
        c.nome AS categoria,
        i.url AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN imagens_produto i ON i.produto_id = p.id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

export default router;
