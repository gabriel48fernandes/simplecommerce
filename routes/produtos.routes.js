import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /produtos
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
      LEFT JOIN imagens_produto i 
        ON i.produto_id = p.id
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error("❌ ERRO PRODUTOS:", error);
    res.status(500).json({
      status: "erro",
      message: "Erro ao buscar produtos"
    });
  }
});

export default router;
