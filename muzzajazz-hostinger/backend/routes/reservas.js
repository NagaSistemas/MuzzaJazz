const express = require('express');
const router = express.Router();

const STATUS_OCUPAM_MESA = ['manual', 'pago'];

function normalizarNumeroMesa(valor) {
    const numero = parseInt(valor, 10);
    return Number.isInteger(numero) ? numero : null;
}

function normalizarMesasReserva(reserva = {}) {
    const lista = [];

    if (Array.isArray(reserva.mesasSelecionadas)) {
        reserva.mesasSelecionadas.forEach(numero => {
            const normalizado = normalizarNumeroMesa(numero);
            if (normalizado !== null) lista.push(normalizado);
        });
    }

    const principal = normalizarNumeroMesa(reserva.numeroMesa);
    if (principal !== null) lista.push(principal);

    const extra = normalizarNumeroMesa(reserva.mesaExtra);
    if (extra !== null) lista.push(extra);

    return [...new Set(lista)];
}

module.exports = (db) => {
    // GET /api/reservas - Buscar todas as reservas
    router.get('/', async (req, res) => {
        try {
            const snapshot = await db.collection('reservas').get();
            const reservas = [];
            snapshot.forEach(doc => {
                reservas.push({ id: doc.id, ...doc.data() });
            });
            res.json({ reservas });
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // POST /api/reservas - Criar nova reserva
    router.post('/', async (req, res) => {
        try {
            const { data, area, numeroMesa, mesaExtra, adultos, criancas } = req.body;

            if (!data || !area) {
                return res.status(400).json({ error: 'Data e área são obrigatórias' });
            }

            const mesaPrincipalNumero = normalizarNumeroMesa(numeroMesa);
            const mesaExtraNumero = normalizarNumeroMesa(mesaExtra);

            if (mesaPrincipalNumero === null) {
                return res.status(400).json({ error: 'Selecione pelo menos uma mesa válida' });
            }

            if (mesaExtraNumero !== null && mesaExtraNumero === mesaPrincipalNumero) {
                return res.status(400).json({ error: 'As mesas selecionadas precisam ser diferentes' });
            }

            const mesasSnapshot = await db.collection('mesas')
                .where('status', '==', 'ativa')
                .where('area', '==', area)
                .get();

            if (mesasSnapshot.empty) {
                return res.status(400).json({ error: 'Não existem mesas ativas para esta área' });
            }

            const mesasArea = [];
            mesasSnapshot.forEach(doc => {
                mesasArea.push({ id: doc.id, ...doc.data() });
            });

            const encontrarMesa = (numero) => mesasArea.find(m => Number(m.numero) === numero);

            const mesasSelecionadas = [mesaPrincipalNumero, mesaExtraNumero]
                .filter((numero, index, arr) => numero !== null && arr.indexOf(numero) === index);

            const detalhesMesas = [];
            for (const numero of mesasSelecionadas) {
                const mesaEncontrada = encontrarMesa(numero);
                if (!mesaEncontrada) {
                    return res.status(400).json({ error: `Mesa ${numero} não encontrada ou inativa para esta área` });
                }
                detalhesMesas.push(mesaEncontrada);
            }

            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .where('area', '==', area)
                .get();

            const reservasMesmoPeriodo = [];
            reservasSnapshot.forEach(doc => reservasMesmoPeriodo.push({ id: doc.id, ...doc.data() }));

            const reservasQueOcupamMesa = reservasMesmoPeriodo.filter(reservaExistente =>
                STATUS_OCUPAM_MESA.includes((reservaExistente.status || '').toLowerCase())
            );

            const totalPessoas = (adultos || 0) + (criancas || 0);
            const capacidadeSelecionada = detalhesMesas.reduce((sum, mesa) => sum + (mesa.capacidade || 0), 0);

            if (totalPessoas > capacidadeSelecionada) {
                const mensagem = mesasSelecionadas.length === 1
                    ? 'Capacidade da mesa excedida. Selecione uma segunda mesa da mesma área.'
                    : 'Capacidade combinada das mesas excedida.';

                return res.status(400).json({
                    error: mensagem,
                    capacidadeDisponivel: capacidadeSelecionada,
                    necessario: totalPessoas
                });
            }

            // Verificar conflito por mesa
            const conflitoMesa = reservasQueOcupamMesa.some(reservaExistente => {
                const mesasReserva = normalizarMesasReserva(reservaExistente);
                return mesasSelecionadas.some(numero => mesasReserva.includes(numero));
            });

            if (conflitoMesa) {
                return res.status(400).json({ error: 'Uma das mesas selecionadas já está reservada para esta data' });
            }

            // Capacidade total da área
            const capacidadeTotalArea = mesasArea.reduce((sum, mesa) => sum + (mesa.capacidade || 0), 0);
            const ocupacaoAtual = reservasQueOcupamMesa.reduce((sum, reserva) => {
                return sum + (parseInt(reserva.adultos, 10) || 0) + (parseInt(reserva.criancas, 10) || 0);
            }, 0);

            if (ocupacaoAtual + totalPessoas > capacidadeTotalArea) {
                return res.status(400).json({
                    error: 'Capacidade da área excedida',
                    disponivel: Math.max(capacidadeTotalArea - ocupacaoAtual, 0)
                });
            }

            const statusSolicitado = (req.body.status || 'manual').toLowerCase();
            const statusFinal = statusSolicitado === 'pago' ? 'pago' : 'manual';
            const agora = new Date().toISOString();

            const reserva = {
                ...req.body,
                id: Date.now().toString(),
                status: statusFinal,
                numeroMesa: mesaPrincipalNumero,
                mesaExtra: mesaExtraNumero,
                mesasSelecionadas,
                dataCriacao: agora
            };

            if (statusFinal === 'pago') {
                reserva.dataPagamento = agora;
            }

            await db.collection('reservas').doc(reserva.id).set(reserva);
            res.json({ success: true, message: 'Reserva criada com sucesso', id: reserva.id });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // PUT /api/reservas/:id - Atualizar reserva (para reembolsos)
    router.put('/:id', async (req, res) => {
        try {
            await db.collection('reservas').doc(req.params.id).update(req.body);
            res.json({ success: true, message: 'Reserva atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // DELETE /api/reservas/:id - Remover reserva
    router.delete('/:id', async (req, res) => {
        try {
            await db.collection('reservas').doc(req.params.id).delete();
            res.json({ success: true, message: 'Reserva removida com sucesso' });
        } catch (error) {
            console.error('Erro ao remover reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};
