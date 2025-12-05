const express = require('express');
const axios = require('axios');
const { randomUUID } = require('crypto');

const SANDBOX_URL = 'https://sandbox.ipag.com.br';
const PRODUCTION_URL = 'https://api.ipag.com.br';
const DEFAULT_RETURN_URL = 'https://muzzajazz.com.br/pagamento/sucesso.html';
const CHECKOUT_COLLECTION = 'ipag_checkout_intents';

const SUCCESS_ACTIONS = [
    'PaymentLinkPaymentSucceeded',
    'PaymentLinkCaptureSucceeded',
    'PaymentLinkPaymentApproved',
    'ChargePaymentSucceeded',
    'TransactionCaptured',
    'TransactionPaymentSucceeded',
    'TransactionApproved'
];
const FAILURE_ACTIONS = [
    'PaymentLinkPaymentFailed',
    'PaymentLinkPaymentCanceled',
    'ChargePaymentFailed',
    'TransactionCanceled',
    'TransactionDenied',
    'TransactionPaymentFailed',
    'TransactionFailed'
];
const SUCCESS_STATUS_TOKENS = [
    'captured',
    'paid',
    'approved',
    'completed',
    'succeeded',
    'success',
    'confirmed',
    'pago',
    'aprovado',
    'aprovada',
    'capturado',
    'confirmado'
];
const FAILURE_STATUS_TOKENS = [
    'failed',
    'canceled',
    'cancelled',
    'denied',
    'refused',
    'chargeback',
    'disputed',
    'rejected',
    'cancelado',
    'recusado',
    'falhou_pagamento',
    'estornado',
    'negado',
    'nao_aprovado'
];
const SUCCESS_STATUS_CODES = ['8', '00', '0', '02'];
const FAILURE_STATUS_CODES = ['4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '99'];
const PROTECTED_RESERVA_STATUS = new Set(['pago', 'manual', 'reembolsado', 'cancelado']);

const SUCCESS_ACTION_SET = new Set(SUCCESS_ACTIONS.map(a => a.toLowerCase()));
const FAILURE_ACTION_SET = new Set(FAILURE_ACTIONS.map(a => a.toLowerCase()));
const SUCCESS_TOKEN_SET = new Set(SUCCESS_STATUS_TOKENS.map(a => a.toLowerCase()));
const FAILURE_TOKEN_SET = new Set(FAILURE_STATUS_TOKENS.map(a => a.toLowerCase()));
const SUCCESS_CODE_SET = new Set(SUCCESS_STATUS_CODES.map(a => a.toLowerCase()));
const FAILURE_CODE_SET = new Set(FAILURE_STATUS_CODES.map(a => a.toLowerCase()));

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
    ipagStatusCode: checkoutDoc.ipagStatusCode || null,
    paymentLink: checkoutDoc.paymentLink || null,
    amount: checkoutDoc.amount,
    environment: checkoutDoc.environment,
    updatedAt: checkoutDoc.updatedAt || checkoutDoc.createdAt,
    expiresAt: checkoutDoc.expiresAt || null,
    customer: checkoutDoc.customer || null
});

const normalizeStatusToken = (value) => {
    if (value === null || value === undefined) return '';
    return value.toString().trim().toLowerCase();
};

const normalizarNumeroMesa = (valor) => {
    const numero = parseInt(valor, 10);
    return Number.isInteger(numero) ? numero : null;
};

const buildMesasSelecionadas = (reserva = {}) => {
    const baseLista = Array.isArray(reserva.mesasSelecionadas)
        ? reserva.mesasSelecionadas.map(normalizarNumeroMesa).filter(numero => numero !== null)
        : [];
    const principal = normalizarNumeroMesa(reserva.numeroMesa);
    const extra = normalizarNumeroMesa(reserva.mesaExtra);

    if (principal !== null) baseLista.push(principal);
    if (extra !== null) baseLista.push(extra);

    return [...new Set(baseLista)];
};

const shouldPreserveStatus = (status = '') => PROTECTED_RESERVA_STATUS.has(status.toLowerCase());

const montarReservaBase = (reserva = {}, orderId, amount, timestamp) => ({
    ...reserva,
    id: orderId,
    numeroMesa: normalizarNumeroMesa(reserva.numeroMesa),
    mesaExtra: normalizarNumeroMesa(reserva.mesaExtra),
    mesasSelecionadas: buildMesasSelecionadas(reserva),
    valor: amount,
    gateway: 'ipag',
    origem: reserva.origem || 'checkout-site',
    dataCriacao: reserva.dataCriacao || timestamp,
    dataAtualizacao: timestamp
});

const buildUltimoCheckoutSnapshot = (meta = {}, status, timestamp) => ({
    orderId: meta.orderId || null,
    checkoutId: meta.checkoutId || meta.id || null,
    token: meta.token || null,
    paymentLink: meta.paymentLink || meta.link || null,
    environment: meta.environment || null,
    status,
    atualizadoEm: timestamp
});

const resolveActionInfo = (event = {}, payload = {}) => {
    const candidates = [
        event.action,
        event.type,
        event.event,
        payload.action,
        payload.event,
        payload.attributes?.action,
        event.attributes?.action,
        event.data?.action
    ];
    const raw = candidates.find(Boolean) || '';
    return {
        raw,
        normalized: normalizeStatusToken(raw)
    };
};

const resolveOrderId = (payload = {}, event = {}) => {
    const transaction = payload.transaction || event.transaction || {};
    const transactionAttributes = transaction.attributes || {};
    const candidates = [
        payload.order_id,
        payload.order?.order_id,
        payload.reference,
        payload.id,
        transaction.order_id,
        transactionAttributes.order_id,
        transactionAttributes.transaction_order_id,
        event.order_id,
        event.attributes?.order_id,
        payload.attributes?.order_id
    ];
    const candidate = candidates.find((value) => value !== undefined && value !== null);
    return candidate ? candidate.toString() : null;
};

const resolveStatusInfo = (payload = {}, event = {}) => {
    const transaction = payload.transaction || event.transaction || {};
    const transactionAttributes = transaction.attributes || {};
    const statusObjects = [
        payload.status,
        payload.payment_status,
        payload.state,
        payload.ipagStatus,
        payload.status_pagamento,
        payload.statusPagamento,
        payload.resultado,
        payload.attributes?.status,
        payload.attributes?.status_pagamento,
        transaction.status,
        transactionAttributes.status,
        event.status,
        event.attributes?.status
    ];

    let statusTextRaw = '';
    let statusCodeRaw = '';

    statusObjects.forEach((entry) => {
        if (!entry) return;
        if (typeof entry === 'object') {
            if (!statusTextRaw && entry.message) statusTextRaw = entry.message;
            if (!statusCodeRaw && (entry.code !== undefined)) statusCodeRaw = entry.code;
            if (!statusTextRaw && typeof entry.status === 'string') statusTextRaw = entry.status;
        } else {
            if (!statusTextRaw) statusTextRaw = entry;
            if (!statusCodeRaw) statusCodeRaw = entry;
        }
    });

    const fallbackCodes = [
        payload.status_code,
        payload.payment_status_code,
        payload.payment_code,
        payload.status_pagamento,
        transaction.status_code,
        transactionAttributes.status_code
    ];
    if (!statusCodeRaw) {
        const fallback = fallbackCodes.find((value) => value !== undefined && value !== null);
        if (fallback !== undefined) statusCodeRaw = fallback;
    }

    const normalizedText = normalizeStatusToken(statusTextRaw);
    const normalizedCode = normalizeStatusToken(statusCodeRaw);

    return {
        statusTextRaw,
        statusCodeRaw,
        statusText: normalizedText,
        statusCode: normalizedCode
    };
};

const resolveTransactionId = (payload = {}, event = {}) => {
    const transaction = payload.transaction || event.transaction || {};
    const transactionAttributes = transaction.attributes || {};
    return (
        payload.transaction_id ||
        payload.id_transacao ||
        transaction.transaction_id ||
        transaction.id ||
        transactionAttributes.transaction_id ||
        transactionAttributes.id ||
        null
    );
};

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

    const cancelIpagTransaction = async (config, identifiers = {}, amount, merchantId) => {
        const params = {};
        if (identifiers.id) params.id = identifiers.id;
        else if (identifiers.uuid) params.uuid = identifiers.uuid;
        else if (identifiers.tid) params.tid = identifiers.tid;
        else if (identifiers.orderId) params.order_id = identifiers.orderId;

        if (!Object.keys(params).length) {
            throw new Error('Informe id, uuid, tid ou orderId para cancelar a transacao.');
        }

        if (amount !== undefined && amount !== null) {
            const numericAmount = Number(amount);
            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                throw new Error('Valor de cancelamento invalido.');
            }
            params.amount = Number(numericAmount.toFixed(2));
        }

        const merchant = merchantId || process.env.IPAG_MERCHANT_ID;
        if (merchant) {
            params.merchant_id = merchant;
        }

        const url = `${config.baseUrl}/service/cancel`;
        return axios.post(url, {}, {
            params,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${config.authToken}`,
                'x-api-version': config.apiVersion
            },
            timeout: Number(process.env.IPAG_TIMEOUT_MS || 15000)
        });
    };

    const aplicarStatusWebhookNaReserva = async ({
        orderId,
        reservaPayload = {},
        checkoutData = {},
        novoStatus,
        statusTexto,
        payload,
        succeeded,
        failed,
        timestamp
    }) => {
        if (!orderId) return;
        const reservaRef = db.collection('reservas').doc(orderId);
        let snapshot = await reservaRef.get();

        if (!snapshot.exists && Object.keys(reservaPayload).length) {
            const reservaBase = montarReservaBase(
                reservaPayload,
                orderId,
                checkoutData.amount,
                timestamp
            );
            await reservaRef.set({
                ...reservaBase,
                status: succeeded ? 'pago' : 'aguardando_pagamento',
                ultimoCheckout: buildUltimoCheckoutSnapshot(
                    {
                        orderId,
                        checkoutId: checkoutData.checkoutId || checkoutData.ipagId,
                        token: checkoutData.token,
                        paymentLink: checkoutData.paymentLink || checkoutData.link,
                        environment: checkoutData.environment
                    },
                    succeeded ? 'paid' : novoStatus,
                    timestamp
                )
            }, { merge: true });
            snapshot = await reservaRef.get();
        }

        const atual = snapshot.exists ? snapshot.data() : {};
        const statusAtual = atual.status || '';
        const updates = {
            ultimoCheckout: {
                ...(atual.ultimoCheckout || {}),
                status: novoStatus,
                atualizadoEm: timestamp,
                ipagStatus: statusTexto || null,
                ipagTransactionId: payload?.transaction_id || payload?.id || null
            }
        };

        if (succeeded) {
            updates.status = 'pago';
            updates.dataPagamento = timestamp;
            updates.gateway = 'ipag';
            updates.ipagTransactionId = payload?.transaction_id || payload?.id || null;
            updates.ipagStatus = statusTexto || 'captured';
            updates.dadosPagamento = payload;
        } else if (failed && !shouldPreserveStatus(statusAtual)) {
            updates.status = 'falhou_pagamento';
        }

        if (!snapshot.exists && !Object.keys(reservaPayload).length) {
            updates.status = succeeded ? 'pago' : updates.status || 'aguardando_pagamento';
        }

        await reservaRef.set(updates, { merge: true });
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

    router.post('/cancel', async (req, res) => {
        try {
            const { orderId, id, uuid, tid, amount, merchantId } = req.body || {};
            const config = getIpagConfig();

            const identifiers = { id, uuid, tid, orderId };
            let checkoutData = null;
            let checkoutRef = null;

            if (orderId) {
                checkoutRef = checkoutCollection.doc(orderId);
                const snapshot = await checkoutRef.get();
                if (snapshot.exists) {
                    checkoutData = snapshot.data();
                    if (!identifiers.id && !identifiers.uuid && !identifiers.tid && checkoutData.ipagTransactionId) {
                        identifiers.id = checkoutData.ipagTransactionId;
                    }
                    if (!identifiers.orderId && checkoutData.orderId) {
                        identifiers.orderId = checkoutData.orderId;
                    }
                }
            }

            if (!identifiers.id && !identifiers.uuid && !identifiers.tid && !identifiers.orderId) {
                return res.status(400).json({ error: 'Envie id, uuid, tid ou orderId da transacao.' });
            }

            const response = await cancelIpagTransaction(config, identifiers, amount, merchantId);
            const statusInfo = response.data?.status || {};
            const message = statusInfo.message || statusInfo.status || null;
            const code = statusInfo.code !== undefined ? statusInfo.code : null;
            const canceled = (code && code.toString() === '3') || (message || '').toString().toLowerCase().includes('cancel');
            const now = new Date().toISOString();

            if (checkoutRef) {
                await checkoutRef.set({
                    status: canceled ? 'canceled' : 'cancel_requested',
                    ipagStatus: message,
                    ipagStatusCode: code,
                    updatedAt: now,
                    canceledAt: canceled ? now : null,
                    cancelAmount: amount || response.data?.amount || null,
                    ipagCancelPayload: response.data,
                    ipagTransactionId: identifiers.id || identifiers.uuid || identifiers.tid || identifiers.orderId || checkoutData?.ipagTransactionId || null
                }, { merge: true });
            }

            if (orderId) {
                const reservaRef = db.collection('reservas').doc(orderId);
                await reservaRef.set({
                    status: canceled ? 'reembolsado' : 'reembolso_pendente',
                    dataReembolso: canceled ? now : null,
                    ultimoCheckout: {
                        ...(checkoutData?.ultimoCheckout || {}),
                        status: canceled ? 'canceled' : 'cancel_requested',
                        ipagStatus: message || null,
                        atualizadoEm: now
                    }
                }, { merge: true });
            }

            res.json({
                success: true,
                canceled,
                status: { code, message },
                ipag: response.data
            });
        } catch (error) {
            console.error('Erro ao cancelar IPAG:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Falha ao cancelar a transacao.',
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
            const actionInfo = resolveActionInfo(event, payload);
            const statusInfo = resolveStatusInfo(payload, event);
            const orderId =
                resolveOrderId(payload, event) ||
                payload?.order?.order_id ||
                payload?.order_id ||
                payload?.reference ||
                event.id;
            const statusToken = statusInfo.statusText;
            const statusCodeToken = statusInfo.statusCode;

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

            const succeeded = SUCCESS_ACTION_SET.has(actionInfo.normalized)
                || SUCCESS_TOKEN_SET.has(statusToken)
                || SUCCESS_CODE_SET.has(statusCodeToken);
            const failed = FAILURE_ACTION_SET.has(actionInfo.normalized)
                || FAILURE_TOKEN_SET.has(statusToken)
                || FAILURE_CODE_SET.has(statusCodeToken);
            const fallbackStatus = statusToken || statusCodeToken || actionInfo.normalized || 'unknown';
            const newStatus = succeeded ? 'paid' : failed ? 'failed' : fallbackStatus;
            const now = new Date().toISOString();
            const ipagTransactionId = resolveTransactionId(payload, event);

            await checkoutRef.set({
                status: newStatus,
                ipagStatus: statusInfo.statusTextRaw || statusInfo.statusCodeRaw || action || 'unknown',
                ipagStatusCode: statusInfo.statusCodeRaw || null,
                lastEvent: actionInfo.raw || action || null,
                updatedAt: now,
                ipagPayload: payload,
                ipagTransactionId: ipagTransactionId || payload?.id || null
            }, { merge: true });

            const reservaPayload = checkoutSnap.data().reserva || {};
            const reservaStatusAtualizado = succeeded
                ? 'pago'
                : failed
                    ? 'falhou_pagamento'
                    : (reservaPayload.status || 'aguardando_pagamento');

            await checkoutRef.set({
                reserva: {
                    ...reservaPayload,
                    status: reservaStatusAtualizado,
                    dataPagamento: succeeded ? now : reservaPayload.dataPagamento || null
                },
                reservaStatus: reservaStatusAtualizado,
                reservaAtualizadaEm: now
            }, { merge: true });

            await aplicarStatusWebhookNaReserva({
                orderId,
                reservaPayload,
                checkoutData: checkoutSnap.data(),
                novoStatus: newStatus,
                statusTexto: statusInfo.statusTextRaw || statusInfo.statusCodeRaw || action || null,
                payload,
                succeeded,
                failed,
                timestamp: now
            });

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
