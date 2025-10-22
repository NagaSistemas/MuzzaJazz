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