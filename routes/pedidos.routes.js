import express from "express";
import { pool } from "../db.js";

const router = express.Router();


// ==========================
// LISTAR PEDIDOS (ADMIN)
// ==========================
router.get("/", async (req, res) => {

  const { search = "" } = req.query;

  try {

    let query = `
      SELECT
        p.id,
        p.total,
        p.status,
        p.status_pagamento,
        p.criado_em,
        u.nome
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
    `;

    const params = [];

    if (search) {
      query += ` WHERE u.nome ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.criado_em DESC`;

    const result = await pool.query(query, params);

    res.json(result.rows);

  } catch (error) {

    console.error("Erro ao listar pedidos:", error);

    res.status(500).json({ erro: "Erro ao listar pedidos" });

  }

});


// ==========================
// FINALIZAR PEDIDO
// ==========================
router.post("/finalizar", async (req, res) => {

  const {
    usuario_id,
    frete,
    transportadora,
    prazo,
    cep,
    forma_pagamento,
    status_pagamento
  } = req.body;

  try {

    // 1️⃣ Buscar carrinho
    const carrinhoResult = await pool.query(
      "SELECT * FROM carrinhos WHERE usuario_id = $1",
      [usuario_id]
    );

    if (carrinhoResult.rows.length === 0) {
      return res.status(400).json({ erro: "Carrinho não encontrado" });
    }

    const carrinho = carrinhoResult.rows[0];

    // 2️⃣ Buscar itens
    const itensResult = await pool.query(
      `
      SELECT ci.*, p.preco
      FROM carrinho_itens ci
      JOIN produtos p ON p.id = ci.produto_id
      WHERE ci.carrinho_id = $1
      `,
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

    const totalFinal = total + Number(frete || 0);

    // 4️⃣ Criar pedido
    const pedidoResult = await pool.query(
      `
      INSERT INTO pedidos
      (
        usuario_id,
        total,
        frete,
        transportadora,
        prazo,
        cep,
        forma_pagamento,
        status_pagamento,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendente')
      RETURNING *
      `,
      [
        usuario_id,
        totalFinal,
        frete,
        transportadora,
        prazo,
        cep,
        forma_pagamento,
        status_pagamento
      ]
    );

    const pedido = pedidoResult.rows[0];

    // 5️⃣ Inserir itens
    for (const item of itens) {

      await pool.query(
        `
        INSERT INTO pedido_itens
        (pedido_id, produto_id, quantidade, preco)
        VALUES ($1,$2,$3,$4)
        `,
        [
          pedido.id,
          item.produto_id,
          item.quantidade,
          item.preco
        ]
      );

    }

    // 6️⃣ Se pagamento já confirmado → baixar estoque
    if (status_pagamento === "pago") {

      for (const item of itens) {

        await pool.query(
          `
          UPDATE produtos
          SET quantidade = quantidade - $1
          WHERE id = $2
          `,
          [item.quantidade, item.produto_id]
        );

      }

    }

    // 7️⃣ Limpar carrinho
    await pool.query(
      "DELETE FROM carrinho_itens WHERE carrinho_id = $1",
      [carrinho.id]
    );

    res.json({
      mensagem: "Pedido criado com sucesso",
      pedido_id: pedido.id,
      total: totalFinal
    });

  } catch (error) {

    console.error("Erro ao finalizar pedido:", error);

    res.status(500).json({
      erro: "Erro ao finalizar pedido"
    });

  }

});


// ==========================
// DETALHES PEDIDO
// ==========================
router.get("/:id", async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  try {

    const pedidoResult = await pool.query(`
      SELECT
        p.id,
        p.total,
        p.frete,
        p.transportadora,
        p.prazo,
        p.cep,
        p.status,
        p.status_pagamento,
        p.forma_pagamento,
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

    res.json({
      ...pedido,
      itens: itensResult.rows
    });

  } catch (err) {

    console.error("ERRO DETALHES PEDIDO:", err);

    res.status(500).json({
      erro: err.message
    });

  }

});


// ==========================
// ATUALIZAR STATUS
// ==========================
router.put("/:id/status", async (req, res) => {

  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  try {

    await pool.query(
      "UPDATE pedidos SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({
      mensagem: "Status atualizado com sucesso"
    });

  } catch (err) {

    res.status(500).json({
      erro: err.message
    });

  }

  // ==========================
// CONFIRMAR PAGAMENTO PIX
// ==========================
router.put("/confirmar-pagamento/:id", async (req, res) => {

  const id = Number(req.params.id);

  try {

    await pool.query(
      "UPDATE pedidos SET status_pagamento = 'pago' WHERE id = $1",
      [id]
    );

    await pool.query(
      "UPDATE pedidos SET status = 'pago' WHERE id = $1",
      [id]
    );

    res.json({
      mensagem: "Pagamento confirmado"
    });

  } catch (error) {

    console.error("Erro confirmar pagamento:", error);

    res.status(500).json({
      erro: "Erro ao confirmar pagamento"
    });

  }

});

});

export default router;