import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const totalPedidos = await pool.query(`
      SELECT COUNT(*) FROM pedidos
    `);

    const faturamentoTotal = await pool.query(`
      SELECT COALESCE(SUM(total), 0) 
      FROM pedidos
      WHERE status != 'cancelado'
    `);

    const faturamentoMes = await pool.query(`
      SELECT COALESCE(SUM(total), 0)
      FROM pedidos
      WHERE DATE_TRUNC('month', criado_em) = DATE_TRUNC('month', CURRENT_DATE)
      AND status != 'cancelado'
    `);

    const totalClientes = await pool.query(`
      SELECT COUNT(*) 
      FROM usuarios
      WHERE role = 'user'
    `);

    const estoqueBaixo = await pool.query(`
      SELECT COUNT(*)
      FROM produtos
      WHERE quantidade < 5
    `);

    const ticketMedio = await pool.query(`
      SELECT COALESCE(AVG(total), 0)
      FROM pedidos
    `);

    res.json({
      totalPedidos: Number(totalPedidos.rows[0].count),
      faturamentoTotal: Number(faturamentoTotal.rows[0].coalesce),
      faturamentoMes: Number(faturamentoMes.rows[0].coalesce),
      totalClientes: Number(totalClientes.rows[0].count),
      estoqueBaixo: Number(estoqueBaixo.rows[0].count),
      ticketMedio: Number(ticketMedio.rows[0].coalesce)
    });

  } catch (err) {
    console.error("Erro dashboard:", err);
    res.status(500).json({ erro: "Erro ao carregar dashboard" });
  }
});

export default router;