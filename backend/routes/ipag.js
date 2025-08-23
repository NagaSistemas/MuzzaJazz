const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const IPAG_CONFIG = {
        apiKey: 'BCCD-8075B5E0-802B574A-16BFD0A8-1C4B',
        apiId: 'nagasistemas@gmail.com',
        baseUrl: 'https://api.ipag.com.br'
    };

    // Criar transação IPAG
    router.post('/create-payment', async (req, res) => {
        try {
            const { reserva } = req.body;
            
            const paymentData = {
                amount: parseFloat(reserva.valor) * 100, // IPAG usa centavos
                callback_url: 'https://admin.muzzajazz.com.br/api/ipag/webhook',
                return_url: 'https://muzzajazz.com.br/pagamento/sucesso',
                return_type: 'redirect',
                order_id: reserva.id,
                customer: {
                    name: reserva.nome,
                    phone: reserva.whatsapp.replace(/\D/g, ''),
                    email: 'cliente@muzzajazz.com.br'
                },
                products: [{
                    name: `Reserva Muzza Jazz - ${reserva.area} - ${reserva.data}`,
                    unit_price: parseFloat(reserva.valor) * 100,
                    quantity: 1,
                    description: `${reserva.adultos} adultos, ${reserva.criancas} crianças`
                }],
                payment: {
                    methods: ['pix', 'creditcard']
                }
            };

            const response = await fetch(`${IPAG_CONFIG.baseUrl}/service/resources/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${IPAG_CONFIG.apiId}:${IPAG_CONFIG.apiKey}`).toString('base64')}`
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();
            
            if (response.ok && result.data) {
                // Salvar reserva com status pendente
                await db.collection('reservas').doc(reserva.id).set({
                    ...reserva,
                    status: 'pendente',
                    transacaoId: result.data.id,
                    linkPagamento: result.data.link,
                    dataCriacao: new Date().toISOString()
                });

                res.json({
                    success: true,
                    paymentUrl: result.data.link,
                    transactionId: result.data.id
                });
            } else {
                throw new Error(result.message || 'Erro ao criar pagamento');
            }
        } catch (error) {
            console.error('Erro IPAG:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Webhook IPAG
    router.post('/webhook', async (req, res) => {
        try {
            const notification = req.body;
            console.log('Webhook IPAG recebido:', notification);

            if (notification.status === 'paid') {
                // Atualizar reserva como paga
                await db.collection('reservas').doc(notification.order_id).update({
                    status: 'pago',
                    dataPagamento: new Date().toISOString(),
                    dadosPagamento: notification
                });
                console.log(`Reserva ${notification.order_id} confirmada como paga`);
            }

            res.status(200).send('OK');
        } catch (error) {
            console.error('Erro no webhook:', error);
            res.status(500).send('Error');
        }
    });

    return router;
};