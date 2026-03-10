import express from "express";

const router = express.Router();

router.post("/calcular", async (req, res) => {
    try {
        const { cepDestino } = req.body;
        console.log("TOKEN:", process.env.MELHOR_ENVIO_TOKEN);

        const response = await fetch(
            "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: { postal_code: "95660000" },
                    to: { postal_code: cepDestino },
                    products: [
                        {
                            id: "1",
                            width: 15,
                            height: 10,
                            length: 20,
                            weight: 1,
                            insurance_value: 100,
                            quantity: 1
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        const opcoes = data
            .filter(opcao => !opcao.error) // remove erros
            .map(opcao => ({
                transportadora: opcao.company.name,
                servico: opcao.name,
                preco: opcao.price,
                prazo: opcao.delivery_time
            }));

        res.json(opcoes);

    } catch (error) {
        console.error("Erro frete:", error);
        res.status(500).json({ erro: "Erro ao calcular frete" });
    }
});

export default router;