import express from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";

const router = express.Router();

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const paymentClient = new Payment(mpConfig);

router.post("/pix", async (req, res) => {

  const { pedido_id, valor } = req.body;

  try {

    const payment = await paymentClient.create({
      body: {

        transaction_amount: Number(valor),

        description: `Pedido #${pedido_id}`,

        payment_method_id: "pix",

        payer: {
          email: "teste@teste.com",
        },

        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()

      },
    });

    const tx = payment.point_of_interaction.transaction_data;

    res.json({
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64
    });

  } catch (err) {

    console.error("Erro ao gerar PIX:", err);

    res.status(500).json({
      erro: "Erro ao gerar PIX"
    });

  }

});

export default router;