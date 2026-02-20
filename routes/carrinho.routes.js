import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/* =========================
   ADICIONAR AO CARRINHO
========================= */
router.post("/add", async (req, res) => {
  try {
    const { usuario_id, produto_id } = req.body;

    if (!usuario_id || !produto_id) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    let carrinho = await pool.query(
      "SELECT id FROM carrinhos WHERE usuario_id = $1",
      [usuario_id]
    );

    if (carrinho.rows.length === 0) {
      carrinho = await pool.query(
        "INSERT INTO carrinhos (usuario_id) VALUES ($1) RETURNING id",
        [usuario_id]
      );
    }

    const carrinho_id = carrinho.rows[0].id;

    const itemExiste = await pool.query(
      "SELECT id FROM carrinho_itens WHERE carrinho_id = $1 AND produto_id = $2",
      [carrinho_id, produto_id]
    );

    if (itemExiste.rows.length > 0) {
      await pool.query(
        "UPDATE carrinho_itens SET quantidade = quantidade + 1 WHERE id = $1",
        [itemExiste.rows[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO carrinho_itens (carrinho_id, produto_id, quantidade) VALUES ($1, $2, 1)",
        [carrinho_id, produto_id]
      );
    }

    res.json({ mensagem: "Produto adicionado ao carrinho" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao adicionar ao carrinho" });
  }
});


/* =========================
   LISTAR CARRINHO
========================= */
router.get("/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const carrinho = await pool.query(
      "SELECT id FROM carrinhos WHERE usuario_id = $1",
      [usuario_id]
    );

    if (carrinho.rows.length === 0) {
      return res.json([]);
    }

    const carrinho_id = carrinho.rows[0].id;

    const itens = await pool.query(`
      SELECT 
        ci.id,
        ci.quantidade,
        p.nome,
        p.preco,
        p.preco_promocional,
        i.url AS imagem
      FROM carrinho_itens ci
      JOIN produtos p ON ci.produto_id = p.id
      LEFT JOIN imagens_produto i ON i.produto_id = p.id
      WHERE ci.carrinho_id = $1
    `, [carrinho_id]);

    res.json(itens.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar carrinho" });
  }
});


/* =========================
   REMOVER ITEM
========================= */
router.delete("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM carrinho_itens WHERE id = $1",
      [id]
    );

    res.json({ mensagem: "Item removido" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao remover item" });
  }
});

export default router;