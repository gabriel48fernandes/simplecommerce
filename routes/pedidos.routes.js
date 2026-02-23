import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ==========================
// FINALIZAR PEDIDO
// ==========================
router.post("/finalizar", async (req, res) => {
  const { usuario_id } = req.body;

  try {
    // 1️⃣ Buscar carrinho do usuário
    const carrinhoResult = await pool.query(
      "SELECT * FROM carrinhos WHERE usuario_id = $1",
      [usuario_id]
    );

    if (carrinhoResult.rows.length === 0) {
      return res.status(400).json({ erro: "Carrinho não encontrado" });
    }

    const carrinho = carrinhoResult.rows[0];

    // 2️⃣ Buscar itens do carrinho
    const itensResult = await pool.query(
      `SELECT ci.*, p.preco
       FROM carrinho_itens ci
       JOIN produtos p ON p.id = ci.produto_id
       WHERE ci.carrinho_id = $1`,
      [carrinho.id]
    );

    const itens = itensResult.rows;

    if (itens.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio" });
    }

    // 3️⃣ Calcular total
    let total = 0;
    itens.forEach(item => {
      total += item.preco * item.quantidade;
    });

    // 4️⃣ Criar pedido
    const pedidoResult = await pool.query(
      `INSERT INTO pedidos (usuario_id, total, status)
       VALUES ($1, $2, 'pendente')
       RETURNING *`,
      [usuario_id, total]
    );

    const pedido = pedidoResult.rows[0];

    // 5️⃣ Inserir pedido_itens
    for (const item of itens) {
      await pool.query(
        `INSERT INTO pedido_itens
         (pedido_id, produto_id, quantidade, preco)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.produto_id, item.quantidade, item.preco]
      );
    }

    // 6️⃣ Limpar carrinho
    await pool.query(
      "DELETE FROM carrinho_itens WHERE carrinho_id = $1",
      [carrinho.id]
    );

    res.json({ mensagem: "Pedido finalizado com sucesso!" });

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    res.status(500).json({ erro: "Erro ao finalizar pedido" });
  }
});

router.get("/", async (req, res) => {
  try {
    const pedidos = await pool.query(`
      SELECT p.id, u.nome, p.total, p.status, p.criado_em
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.id DESC
    `);

    res.json(pedidos.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

export default router;