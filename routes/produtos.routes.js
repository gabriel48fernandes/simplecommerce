import express from "express";
import { pool } from "../db.js";
import { autenticarToken, apenasAdmin } from "../middleware/auth.js";

const router = express.Router();

// ========== DESTAQUES ==========
async function getDestaques(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nome,
        p.preco,
        p.preco_promocional,
        p.quantidade,
        p.categoria_id,
        c.nome AS categoria,
        (
          SELECT url FROM imagens_produto 
          WHERE produto_id = p.id 
          ORDER BY principal DESC, id ASC
          LIMIT 1
        ) AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.destaque = true
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
}

// ========== LANÇAMENTOS ==========
async function getLancamentos(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nome,
        p.preco,
        p.preco_promocional,
        p.quantidade,
        p.categoria_id,
        c.nome AS categoria,
        (
          SELECT url FROM imagens_produto 
          WHERE produto_id = p.id 
          ORDER BY principal DESC, id ASC
          LIMIT 1
        ) AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      ORDER BY p.id DESC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
}

/* =========================
   GET /produtos (LISTAR + BUSCA)
========================= */
router.get("/", async (req, res) => {
  try {
    const { search, categoria, categorias, precoMin, precoMax, promo } = req.query;

    let query = `
      SELECT 
        p.id,
        p.nome,
        p.preco,
        p.preco_promocional,
        p.quantidade,
        p.categoria_id,
        c.nome AS categoria,
        (
          SELECT url FROM imagens_produto 
          WHERE produto_id = p.id 
          ORDER BY principal DESC, id ASC
          LIMIT 1
        ) AS imagem
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE 1=1
    `;

    const values = [];
    let index = 1;

    // 🔍 busca por nome
    if (search) {
      query += ` AND p.nome ILIKE $${index}`;
      values.push(`%${search}%`);
      index++;
    }

    // 📦 filtro por categoria (suporta um ou vários ids)
    const categoriasRaw = [];

    if (categoria) {
      if (Array.isArray(categoria)) {
        categoriasRaw.push(...categoria);
      } else {
        categoriasRaw.push(...String(categoria).split(",").map(s => s.trim()));
      }
    }

    if (categorias) {
      if (Array.isArray(categorias)) {
        categoriasRaw.push(...categorias);
      } else {
        categoriasRaw.push(...String(categorias).split(",").map(s => s.trim()));
      }
    }

    const categoriaIds = categoriasRaw
      .map(item => parseInt(item, 10))
      .filter(Number.isInteger);

    if (categoriaIds.length > 0) {
      query += ` AND p.categoria_id = ANY($${index}::int[])`;
      values.push(categoriaIds);
      index++;
    }

    // 💰 preço mínimo
    if (precoMin !== undefined && precoMin !== "") {
      const precoMinNum = Number(precoMin);
      if (!Number.isNaN(precoMinNum)) {
        query += ` AND p.preco >= $${index}`;
        values.push(precoMinNum);
        index++;
      }
    }

    // 💰 preço máximo
    if (precoMax !== undefined && precoMax !== "") {
      const precoMaxNum = Number(precoMax);
      if (!Number.isNaN(precoMaxNum)) {
        query += ` AND p.preco <= $${index}`;
        values.push(precoMaxNum);
        index++;
      }
    }

    // 🔥 promoção
    if (promo === "true") {
      query += ` AND p.preco_promocional IS NOT NULL AND p.preco_promocional < p.preco`;
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

      // 🔥 Converter imagem simples para array de imagens
      const imagens = p.imagem 
        ? [{ url: p.imagem, principal: true }]
        : [];

      return {
        ...p,
        imagem: p.imagem,
        imagens: imagens,
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
   GET /produtos/preco-max
========================= */
router.get("/preco-max", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT MAX(preco) AS max FROM produtos
    `);

    res.json({
      max: Number(result.rows[0].max) || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar preço máximo" });
  }
});

router.get("/destaques", getDestaques);
router.get("/lancamentos", getLancamentos);

/* =========================
   GET /produtos/:id
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 PRODUTO
    const produtoResult = await pool.query(`
      SELECT 
        p.*,
        c.nome AS categoria
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.id = $1
    `, [id]);

    if (produtoResult.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const produto = produtoResult.rows[0];

    // 🖼️ IMAGENS
    const imagensResult = await pool.query(`
      SELECT url, principal
      FROM imagens_produto
      WHERE produto_id = $1
      ORDER BY principal DESC
    `, [id]);

    // 🎯 VARIAÇÕES (BRUTO)
    const variacoesResult = await pool.query(`
      SELECT tipo, valor
      FROM produto_variacoes
      WHERE produto_id = $1
    `, [id]);

    // 🧠 ORGANIZA VARIAÇÕES (🔥 IMPORTANTE)
    const variacoesOrganizadas = {};

    variacoesResult.rows.forEach(v => {
      if (!variacoesOrganizadas[v.tipo]) {
        variacoesOrganizadas[v.tipo] = [];
      }
      variacoesOrganizadas[v.tipo].push(v.valor);
    });

    // 📦 ITENS (estoque por combinação)
    const itensResult = await pool.query(`
      SELECT variacao_1, variacao_2, estoque
      FROM produto_itens
      WHERE produto_id = $1
    `, [id]);

    // 💰 PROMOÇÃO
    const preco = Number(produto.preco);
    const precoPromocional = Number(produto.preco_promocional);

    const temPromocao =
      precoPromocional && precoPromocional < preco;

    const percentualDesconto = temPromocao
      ? Math.round(((preco - precoPromocional) / preco) * 100)
      : null;

    res.json({
      ...produto,
      imagens: imagensResult.rows,
      variacoes: variacoesOrganizadas,
      itens: itensResult.rows,
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
router.post("/", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { nome, preco, preco_promocional, quantidade, categoria_id, imagens } = req.body;


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

    if (imagens && imagens.length > 0) {
      for (let i = 0; i < imagens.length; i++) {
        const img = imagens[i];

        await pool.query(
          `
      INSERT INTO imagens_produto (produto_id, url, principal)
      VALUES ($1, $2, $3)
      `,
          [produtoId, img.url, i === 0] // primeira = principal
        );
      }
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
router.put("/:id", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 AGORA RECEBE ARRAY DE IMAGENS
    const {
      nome,
      preco,
      preco_promocional,
      quantidade,
      categoria_id,
      imagens // ← mudou aqui
    } = req.body;

    if (!nome || preco == null || quantidade == null || !categoria_id) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    // 🧱 ATUALIZA PRODUTO
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

    // 🖼️ ATUALIZA IMAGENS (MODO PROFISSIONAL)
    if (imagens && Array.isArray(imagens)) {

      // 🧹 REMOVE TODAS AS IMAGENS ANTIGAS
      await pool.query(
        `DELETE FROM imagens_produto WHERE produto_id = $1`,
        [id]
      );

      // ➕ INSERE NOVAS IMAGENS
      for (let i = 0; i < imagens.length; i++) {
        const img = imagens[i];

        await pool.query(
          `
          INSERT INTO imagens_produto (produto_id, url, principal)
          VALUES ($1, $2, $3)
          `,
          [
            id,
            img.url,
            i === 0 // 🔥 primeira imagem = principal
          ]
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
router.delete("/:id", autenticarToken, apenasAdmin, async (req, res) => {
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
