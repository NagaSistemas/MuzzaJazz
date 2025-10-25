const express = require('express');
const router = express.Router();

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
            const { data, area, numeroMesa, adultos, criancas } = req.body;
            
            if (numeroMesa) {
                const reservasSnapshot = await db.collection('reservas')
                    .where('data', '==', data)
                    .where('area', '==', area)
                    .where('numeroMesa', '==', numeroMesa)
                    .where('status', '==', 'pago')
                    .get();
                
                if (!reservasSnapshot.empty) {
                    return res.status(400).json({ error: 'Mesa já reservada para esta data' });
                }
            }
            
            const mesasSnapshot = await db.collection('mesas')
                .where('status', '==', 'ativa')
                .where('area', '==', area)
                .get();
            
            let capacidadeTotal = 0;
            mesasSnapshot.forEach(doc => {
                capacidadeTotal += doc.data().capacidade || 0;
            });
            
            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .where('area', '==', area)
                .where('status', '==', 'pago')
                .get();
            
            let ocupacaoAtual = 0;
            reservasSnapshot.forEach(doc => {
                const r = doc.data();
                ocupacaoAtual += (r.adultos || 0) + (r.criancas || 0);
            });
            
            const totalPessoas = (adultos || 0) + (criancas || 0);
            if (ocupacaoAtual + totalPessoas > capacidadeTotal) {
                return res.status(400).json({ 
                    error: 'Capacidade excedida',
                    disponivel: capacidadeTotal - ocupacaoAtual
                });
            }
            
            const reserva = {
                ...req.body,
                id: Date.now().toString(),
                status: 'pago',
                dataCriacao: new Date().toISOString(),
                dataPagamento: new Date().toISOString()
            };
            
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