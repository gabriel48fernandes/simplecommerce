import express from "express";
import { pool } from "../db.js";
import { autenticarToken, apenasAdmin } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET /banners (LISTAR)
========================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM banners
      WHERE ativo = true
      ORDER BY ordem ASC, id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar banners" });
  }
});


/* =========================
   POST /banners (CRIAR)
========================= */
router.post("/", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { titulo, imagem_url, link } = req.body;

    if (!imagem_url) {
      return res.status(400).json({
        erro: "Imagem é obrigatória"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO banners (titulo, imagem_url, link)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [titulo || null, imagem_url, link || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar banner" });
  }
});


/* =========================
   DELETE /banners/:id
========================= */
router.delete("/:id", autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM banners WHERE id = $1`,
      [id]
    );

    res.json({ mensagem: "Banner deletado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar banner" });
  }
});

export default router;