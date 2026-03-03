import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/* =========================
   GET /produtos (LISTAR + BUSCA)
========================= */
router.get("/", async (req, res) => {
  try {

    const { search } = req.query;

    let query = `
      SELECT DISTINCT ON (p.id)
        p.id,
        p.nome,
        p.preco,
        p.preco_promocional,
        p.quantidade,
        p.categoria_id,
        c.nome AS categoria,
        i.url AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN imagens_produto i 
        ON i.produto_id = p.id
    `;

    const values = [];

    if (search) {
      query += ` WHERE p.nome ILIKE $1 `;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY p.id`;

    const result = await pool.query(query, values);

    const produtos = result.rows.map(p => {
      const preco = Number(p.preco);
      const precoPromocional = Number(p.preco_promocional);

      const temPromocao =
        precoPromocional && precoPromocional < preco;

      const percentualDesconto = temPromocao
        ? Math.round(((preco - precoPromocional) / preco) * 100)
        : null;

      return {
        ...p,
        tem_promocao: temPromocao,
        percentual_desconto: percentualDesconto
      };
    });

    res.json(produtos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});
/* =========================
   GET /produtos/:id
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
  SELECT 
    p.id,
    p.nome,
    p.preco,
    p.preco_promocional,
    p.quantidade,
    p.categoria_id,
    c.nome AS categoria,
    i.url AS imagem
  FROM produtos p
  JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN imagens_produto i 
    ON i.produto_id = p.id
  WHERE p.id = $1
  LIMIT 1
`;


    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const p = result.rows[0];

    const preco = Number(p.preco);
    const precoPromocional = Number(p.preco_promocional);

    const temPromocao =
      precoPromocional !== null && precoPromocional < preco;

    const percentualDesconto = temPromocao
      ? Math.round(((preco - precoPromocional) / preco) * 100)
      : null;

    res.json({
      ...p,
      tem_promocao: temPromocao,
      percentual_desconto: percentualDesconto
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

/* =========================
   POST /produtos (CRIAR)
========================= */
router.post("/", async (req, res) => {
  try {
    const { nome, preco, preco_promocional, quantidade, categoria_id, imagem_url } = req.body;


    if (!nome || preco == null || quantidade == null || !categoria_id) {
      return res.status(400).json({
        erro: "Campos obrigatórios não informados",
      });
    }

    const produtoResult = await pool.query(
      `
     INSERT INTO produtos (nome, preco, preco_promocional, quantidade, categoria_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id

      `,
      [nome, preco, preco_promocional || null, quantidade, categoria_id]

    );

    const produtoId = produtoResult.rows[0].id;

    if (imagem_url) {
      await pool.query(
        `
        INSERT INTO imagens_produto (produto_id, url)
        VALUES ($1, $2)
        `,
        [produtoId, imagem_url]
      );
    }

    res.status(201).json({
      mensagem: "Produto cadastrado com sucesso",
      produto_id: produtoId,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar produto" });
  }
});

/* =========================
   PUT /produtos/:id (EDITAR)
========================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, preco_promocional, quantidade, categoria_id, imagem_url } = req.body;

    if (!nome || preco == null || quantidade == null || !categoria_id) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    await pool.query(
      `
      UPDATE produtos
      SET nome = $1,
      preco = $2,
      preco_promocional = $3,
      quantidade = $4,
      categoria_id = $5
      WHERE id = $6

      `,
      [nome, preco, preco_promocional || null, quantidade, categoria_id, id]
    );

    if (imagem_url) {
      const imgExiste = await pool.query(
        `SELECT id FROM imagens_produto WHERE produto_id = $1`,
        [id]
      );

      if (imgExiste.rows.length > 0) {
        await pool.query(
          `
          UPDATE imagens_produto
          SET url = $1
          WHERE produto_id = $2
          `,
          [imagem_url, id]
        );
      } else {
        await pool.query(
          `
          INSERT INTO imagens_produto (produto_id, url)
          VALUES ($1, $2)
          `,
          [id, imagem_url]
        );
      }
    }

    res.json({ mensagem: "Produto atualizado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao editar produto" });
  }
});

/* =========================
   DELETE /produtos/:id
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM imagens_produto WHERE produto_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM produtos WHERE id = $1`,
      [id]
    );

    res.json({ mensagem: "Produto deletado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar produto" });
  }
});

export default router;
