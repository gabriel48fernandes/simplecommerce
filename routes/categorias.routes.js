// ============================================
// ROTA: /categorias
// GET / POST / PUT / DELETE
// ============================================

import express from "express"
import { pool } from "../db.js"
import { autenticarToken, apenasAdmin } from "../middleware/auth.js"

const router = express.Router()

/* =========================
   GET /categorias
   Suporta ?search= para busca por nome
========================= */
router.get("/", async (req, res) => {
  try {
    const { search } = req.query

    let query  = `SELECT id, nome, imagem_url FROM categorias WHERE 1=1`
    const values = []

    if (search) {
      values.push(`%${search}%`)
      query += ` AND nome ILIKE $${values.length}`
    }

    query += ` ORDER BY id`

    const result = await pool.query(query, values)
    res.json(result.rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao buscar categorias" })
  }
})

/* =========================
   GET /categorias/:id
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT id, nome, imagem_url FROM categorias WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Categoria não encontrada" })
    }

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao buscar categoria" })
  }
})

/* =========================
   POST /categorias
   Body: { nome, imagem_url? }
========================= */
router.post("/", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { nome, imagem_url } = req.body

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "Nome da categoria é obrigatório" })
    }

    // Verifica se já existe categoria com o mesmo nome
    const existe = await pool.query(
      `SELECT id FROM categorias WHERE LOWER(nome) = LOWER($1)`,
      [nome.trim()]
    )

    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: "Já existe uma categoria com este nome" })
    }

    const result = await pool.query(
      `INSERT INTO categorias (nome, imagem_url)
       VALUES ($1, $2)
       RETURNING id, nome, imagem_url`,
      [nome.trim(), imagem_url || null]
    )

    res.status(201).json({
      mensagem: "Categoria criada com sucesso",
      categoria: result.rows[0],
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao criar categoria" })
  }
})

/* =========================
   PUT /categorias/:id
   Body: { nome?, imagem_url? }
========================= */
router.put("/:id", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { id }          = req.params
    const { nome, imagem_url } = req.body

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "Nome da categoria é obrigatório" })
    }

    // Verifica se categoria existe
    const existe = await pool.query(
      `SELECT id FROM categorias WHERE id = $1`,
      [id]
    )

    if (existe.rows.length === 0) {
      return res.status(404).json({ erro: "Categoria não encontrada" })
    }

    // Verifica conflito de nome com outra categoria
    const conflito = await pool.query(
      `SELECT id FROM categorias WHERE LOWER(nome) = LOWER($1) AND id != $2`,
      [nome.trim(), id]
    )

    if (conflito.rows.length > 0) {
      return res.status(409).json({ erro: "Já existe outra categoria com este nome" })
    }

    const result = await pool.query(
      `UPDATE categorias
       SET nome = $1, imagem_url = $2
       WHERE id = $3
       RETURNING id, nome, imagem_url`,
      [nome.trim(), imagem_url ?? null, id]
    )

    res.json({
      mensagem: "Categoria atualizada com sucesso",
      categoria: result.rows[0],
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao atualizar categoria" })
  }
})

/* =========================
   DELETE /categorias/:id
   Bloqueia se houver produtos vinculados
========================= */
router.delete("/:id", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Verifica se há produtos usando essa categoria
    const produtos = await pool.query(
      `SELECT COUNT(*) AS total FROM produtos WHERE categoria_id = $1`,
      [id]
    )

    const total = parseInt(produtos.rows[0].total, 10)

    if (total > 0) {
      return res.status(400).json({
        erro: `Não é possível excluir. Existem ${total} produto(s) vinculado(s) a esta categoria.`,
      })
    }

    const result = await pool.query(
      `DELETE FROM categorias WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Categoria não encontrada" })
    }

    res.json({ mensagem: "Categoria excluída com sucesso" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao excluir categoria" })
  }
})

export default router