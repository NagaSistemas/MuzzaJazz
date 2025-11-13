const express = require('express');
const axios = require('axios');
const { randomUUID } = require('crypto');

const SANDBOX_URL = 'https://sandbox.ipag.com.br';
const PRODUCTION_URL = 'https://api.ipag.com.br';
const DEFAULT_RETURN_URL = 'https://muzzajazz.com.br/pagamento/sucesso.html';
const CHECKOUT_COLLECTION = 'ipag_checkout_intents';

const SUCCESS_ACTIONS = ['PaymentLinkPaymentSucceeded'];
const FAILURE_ACTIONS = ['PaymentLinkPaymentFailed'];
const SUCCESS_STATUSES = ['captured', 'paid', 'approved'];
const FAILURE_STATUSES = ['failed', 'canceled', 'cancelled', 'denied'];

const sanitizeDigits = (value = '') => value.replace(/\D/g, '');

const normalizeCurrency = (value) => {
    const number = typeof value === 'string'
        ? parseFloat(value.replace(',', '.'))
        : Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        throw new Error('Valor da reserva inválido para o checkout.');
    }

    return Number(number.toFixed(2));
};

const buildCustomerPayload = (reserva) => {
    const fullName = [reserva.nome, reserva.sobrenome].filter(Boolean).join(' ').trim();
    const phone = sanitizeDigits(reserva.whatsapp || reserva.telefone || '');
    const taxReceipt = sanitizeDigits(reserva.documento || reserva.tax_receipt || '');

    const customer = {
        name: fullName || 'Cliente Muzza Jazz',
        email: reserva.email,
        phone: phone || undefined,
        tax_receipt: taxReceipt || undefined
    };

    Object.keys(customer).forEach((key) => {
        if (customer[key] === undefined || customer[key] === '') {
            delete customer[key];
        }
    });

    return customer;
};

const buildCheckoutPayload = (reserva, config, orderId, amount) => {
    const safeArea = reserva.area || 'area-desconhecida';
    const description = `Reserva Muzza Jazz - ${safeArea} - ${reserva.data || 'data não informada'}`;

    return {
        customer: buildCustomerPayload(reserva),
        order: {
            order_id: orderId,
            amount,
            description,
            return_url: config.returnUrl
        },
        products: [{
            name: description,
            unit_price: amount,
            quantity: 1,
            sku: safeArea
        }],
        installment_setting: {
            max_installments: reserva.maxParcelas || 1,
            interest_free_installments: Math.min(reserva.parcelasSemJuros || 1, reserva.maxParcelas || 1)
        },
        metadata: {
            data: reserva.data,
            area: safeArea,
            mesa: reserva.numeroMesa || null,
            origem: 'muzza-jazz'
        },
        callback_url: config.webhookUrl,
        currency: 'BRL'
    };
};

const parseCheckoutResponse = (payload = {}) => {
    const dataLayer = payload.data || payload.attributes || payload;
    const attributes = dataLayer?.attributes || dataLayer;

    return {
        id: dataLayer?.id || attributes?.id || null,
        token: attributes?.token || dataLayer?.token || null,
        link: attributes?.link || dataLayer?.link || null,
        createdAt: attributes?.created_at || dataLayer?.created_at || null,
        expiresAt: attributes?.expires_at || dataLayer?.expires_at || null,
        raw: payload
    };
};

const formatCheckoutStatus = (checkoutDoc = {}) => ({
    orderId: checkoutDoc.orderId,
    status: checkoutDoc.status,
    ipagStatus: checkoutDoc.ipagStatus || null,
    paymentLink: checkoutDoc.paymentLink || null,
    amount: checkoutDoc.amount,
    environment: checkoutDoc.environment,
    updatedAt: checkoutDoc.updatedAt || checkoutDoc.createdAt,
    expiresAt: checkoutDoc.expiresAt || null,
    customer: checkoutDoc.customer || null
});

module.exports = (db) => {
    const router = express.Router();
    const checkoutCollection = db.collection(CHECKOUT_COLLECTION);

    const getIpagConfig = () => {
        const env = (process.env.IPAG_ENV || process.env.NODE_ENV || 'production').toLowerCase();
        const baseUrl = process.env.IPAG_BASE_URL || (env === 'production' ? PRODUCTION_URL : SANDBOX_URL);
        const apiId = process.env.IPAG_API_ID;
        const apiKey = process.env.IPAG_API_KEY;

        if (!apiId || !apiKey) {
            throw new Error('IPAG_API_ID e IPAG_API_KEY não configurados.');
        }

        const webhookUrl = process.env.IPAG_WEBHOOK_URL || process.env.PUBLIC_API_BASE_URL
            || process.env.PUBLIC_API_URL || '';

        return {
            apiId,
            apiKey,
            authToken: Buffer.from(`${apiId}:${apiKey}`).toString('base64'),
            apiVersion: process.env.IPAG_API_VERSION || '2',
            baseUrl,
            environment: baseUrl.includes('sandbox') ? 'sandbox' : 'production',
            returnUrl: process.env.IPAG_RETURN_URL || DEFAULT_RETURN_URL,
            webhookUrl: webhookUrl
                ? webhookUrl
                : `${process.env.API_BASE_URL || ''}/api/ipag/webhook`
        };
    };

    const sendIpagRequest = async (config, path, body) => {
        const url = `${config.baseUrl}${path}`;
        return axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${config.authToken}`,
                'x-api-version': config.apiVersion
            },
            timeout: Number(process.env.IPAG_TIMEOUT_MS || 15000)
        });
    };

    router.get('/health', (req, res) => {
        try {
            const config = getIpagConfig();
            res.json({
                status: 'ok',
                environment: config.environment,
                returnUrl: config.returnUrl
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    router.get('/status/:orderId', async (req, res) => {
        try {
            const { orderId } = req.params;
            const checkoutSnap = await checkoutCollection.doc(orderId).get();

            if (!checkoutSnap.exists) {
                return res.status(404).json({ error: 'Checkout não encontrado.' });
            }

            const reservaSnap = await db.collection('reservas').doc(orderId).get();

            res.json({
                orderId,
                checkout: formatCheckoutStatus(checkoutSnap.data()),
                reserva: reservaSnap.exists ? {
                    status: reservaSnap.data().status,
                    nome: reservaSnap.data().nome,
                    dataPagamento: reservaSnap.data().dataPagamento || null
                } : null
            });
        } catch (error) {
            console.error('Erro ao consultar status IPAG:', error);
            res.status(500).json({ error: 'Falha ao consultar status do pedido.' });
        }
    });

    router.post('/create-payment', async (req, res) => {
        try {
            const { reserva } = req.body || {};

            if (!reserva) {
                return res.status(400).json({ error: 'Dados da reserva não enviados.' });
            }

            if (!reserva.nome || !reserva.whatsapp || !reserva.data || !reserva.area) {
                return res.status(400).json({ error: 'Campos obrigatórios da reserva estão incompletos.' });
            }

            if (!reserva.email) {
                return res.status(400).json({ error: 'E-mail é obrigatório para o pagamento.' });
            }

            if (!reserva.documento) {
                return res.status(400).json({ error: 'CPF ou CNPJ é obrigatório para o pagamento.' });
            }

            const config = getIpagConfig();
            const amount = normalizeCurrency(reserva.valor);
            const orderId = (reserva.id || randomUUID()).toString();
            const checkoutRef = checkoutCollection.doc(orderId);
            const existingCheckout = await checkoutRef.get();

            if (existingCheckout.exists) {
                const existingData = existingCheckout.data();

                if (existingData.status === 'paid') {
                    return res.status(409).json({ error: 'Este pedido já foi pago.' });
                }

                if (existingData.status === 'pending' && existingData.paymentLink) {
                    return res.json({
                        success: true,
                        reused: true,
                        paymentUrl: existingData.paymentLink,
                        orderId,
                        checkoutId: existingData.checkoutId || existingData.ipagId || null,
                        token: existingData.token || null
                    });
                }
            }

            const payload = buildCheckoutPayload(reserva, config, orderId, amount);
            const response = await sendIpagRequest(config, '/service/resources/checkout', payload);
            const checkoutInfo = parseCheckoutResponse(response.data);

            if (!checkoutInfo.link) {
                throw new Error('IPAG não retornou o link de pagamento.');
            }

            const customerSummary = buildCustomerPayload(reserva);
            const now = new Date().toISOString();

            await checkoutRef.set({
                orderId,
                checkoutId: checkoutInfo.id,
                token: checkoutInfo.token,
                paymentLink: checkoutInfo.link,
                amount,
                currency: 'BRL',
                status: 'pending',
                ipagStatus: 'pending',
                environment: config.environment,
                expiresAt: checkoutInfo.expiresAt || null,
                createdAt: now,
                updatedAt: now,
                customer: customerSummary,
                reserva: {
                    ...reserva,
                    id: orderId,
                    status: 'aguardando_pagamento'
                },
                ipagPayload: checkoutInfo.raw
            });

            res.json({
                success: true,
                paymentUrl: checkoutInfo.link,
                orderId,
                checkoutId: checkoutInfo.id,
                token: checkoutInfo.token,
                expiresAt: checkoutInfo.expiresAt || null,
                environment: config.environment
            });
        } catch (error) {
            console.error('Erro ao criar checkout IPAG:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Não foi possível gerar o link de pagamento.',
                details: error.response?.data || error.message
            });
        }
    });

    router.post('/webhook', async (req, res) => {
        const acknowledge = () => res.status(200).json({ received: true });

        try {
            const event = req.body || {};
            const action = (event.action || event.type || '').toString();
            const payload = event.data || event.attributes || event;
            const orderData = payload?.order || {};
            const orderId = payload?.order_id || orderData?.order_id || payload?.reference || payload?.id;
            const status = (payload?.status || payload?.payment_status || '').toLowerCase();

            if (!orderId) {
                console.warn('Webhook IPAG sem order_id:', event);
                return acknowledge();
            }

            const checkoutRef = checkoutCollection.doc(orderId);
            const checkoutSnap = await checkoutRef.get();

            if (!checkoutSnap.exists) {
                console.warn('Webhook IPAG sem checkout registrado:', orderId);
                return acknowledge();
            }

            const succeeded = SUCCESS_ACTIONS.includes(action) || SUCCESS_STATUSES.includes(status);
            const failed = FAILURE_ACTIONS.includes(action) || FAILURE_STATUSES.includes(status);
            const newStatus = succeeded ? 'paid' : failed ? 'failed' : status || 'unknown';
            const now = new Date().toISOString();

            await checkoutRef.set({
                status: newStatus,
                ipagStatus: status || action || 'unknown',
                lastEvent: action || null,
                updatedAt: now,
                ipagPayload: payload,
                ipagTransactionId: payload?.transaction_id || payload?.id || null
            }, { merge: true });

            if (succeeded) {
                const reservaPayload = checkoutSnap.data().reserva || {};
                await db.collection('reservas').doc(orderId).set({
                    ...reservaPayload,
                    status: 'pago',
                    dataPagamento: now,
                    gateway: 'ipag',
                    ipagTransactionId: payload?.transaction_id || payload?.id || null,
                    ipagStatus: status || action || 'captured',
                    dadosPagamento: payload
                }, { merge: true });
            }

            acknowledge();
        } catch (error) {
            console.error('Erro ao processar webhook IPAG:', error);
            acknowledge();
        }
    });

    router.post('/webhooks/register', async (req, res) => {
        try {
            const adminToken = process.env.INTERNAL_ADMIN_TOKEN;
            if (!adminToken) {
                return res.status(400).json({ error: 'INTERNAL_ADMIN_TOKEN não configurado.' });
            }

            const providedToken = req.headers['x-internal-token'] || req.body?.token;
            if (providedToken !== adminToken) {
                return res.status(401).json({ error: 'Token inválido.' });
            }

            const config = getIpagConfig();
            const targetUrl = req.body?.url || config.webhookUrl;

            if (!targetUrl) {
                return res.status(400).json({ error: 'URL do webhook não informada.' });
            }

            const payload = {
                url: targetUrl,
                http_method: req.body?.http_method || 'POST',
                description: req.body?.description || 'Webhook Muzza Jazz - Checkout',
                actions: req.body?.actions || [...SUCCESS_ACTIONS, ...FAILURE_ACTIONS]
            };

            const response = await sendIpagRequest(config, '/service/resources/webhooks', payload);

            res.json({
                success: true,
                result: response.data
            });
        } catch (error) {
            console.error('Erro ao registrar webhook IPAG:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Falha ao registrar webhook no IPAG.',
                details: error.response?.data || error.message
            });
        }
    });

    return router;
};
