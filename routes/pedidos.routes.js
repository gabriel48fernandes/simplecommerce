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
  const { search } = req.query;

  try {
    let query = `
      SELECT p.id, u.nome, p.total, p.status, p.criado_em
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
    `;

    const valores = [];

    if (search) {
      query += `
        WHERE 
          u.nome ILIKE $1
          OR CAST(p.id AS TEXT) ILIKE $1
          OR p.status ILIKE $1
      `;
      valores.push(`%${search}%`);
    }

    query += " ORDER BY p.id DESC";

    const pedidos = await pool.query(query, valores);

    res.json(pedidos.rows);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

// ==========================
// DETALHES DO PEDIDO
// ==========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Buscar dados do pedido + cliente
    const pedidoResult = await pool.query(`
      SELECT 
        p.id,
        p.total,
        p.status,
        p.criado_em,
        u.nome
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = $1
    `, [id]);

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const pedido = pedidoResult.rows[0];

    // 2️⃣ Buscar itens do pedido
    const itensResult = await pool.query(`
      SELECT 
        pi.quantidade,
        pi.preco,
        p.nome,
        (
          SELECT url 
          FROM imagens_produto 
          WHERE produto_id = p.id 
          LIMIT 1
        ) AS imagem
      FROM pedido_itens pi
      JOIN produtos p ON p.id = pi.produto_id
      WHERE pi.pedido_id = $1
    `, [id]);

    // 3️⃣ Retornar tudo junto
    res.json({
      ...pedido,
      itens: itensResult.rows
    });

  } catch (err) {
    console.error("ERRO DETALHES PEDIDO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// ==========================
// ATUALIZAR STATUS
// ==========================
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const fluxo = ["pendente", "pago", "enviado", "entregue"];

  try {
    // pegar status atual
    const pedidoAtual = await pool.query(
      "SELECT status FROM pedidos WHERE id = $1",
      [id]
    );

    if (pedidoAtual.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const statusAtual = pedidoAtual.rows[0].status;

    const indexAtual = fluxo.indexOf(statusAtual);
    const indexNovo = fluxo.indexOf(status);

    if (indexNovo !== indexAtual + 1) {
      return res.status(400).json({
        erro: "Fluxo inválido. Siga a ordem correta."
      });
    }

    // SE virar pago → baixar estoque
    if (status === "pago") {

      const itens = await pool.query(`
        SELECT produto_id, quantidade
        FROM pedido_itens
        WHERE pedido_id = $1
      `, [id]);

      for (let item of itens.rows) {
        await pool.query(`
          UPDATE produtos
          SET quantidade = quantidade - $1
          WHERE id = $2
        `, [item.quantidade, item.produto_id]);
      }
    }

    await pool.query(
      "UPDATE pedidos SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({ mensagem: "Status atualizado com sucesso" });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;