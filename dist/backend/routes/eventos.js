const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // GET /api/eventos - Buscar todos os eventos
    router.get('/', async (req, res) => {
        try {
            const snapshot = await db.collection('eventos').get();
            const eventos = [];
            snapshot.forEach(doc => {
                eventos.push({ id: doc.id, ...doc.data() });
            });
            res.json({ eventos });
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // POST /api/eventos - Salvar evento
    router.post('/', async (req, res) => {
        try {
            const evento = {
                ...req.body,
                id: req.body.id || Date.now().toString(),
                dataCriacao: new Date().toISOString()
            };
            await db.collection('eventos').doc(evento.id).set(evento);
            res.json({ success: true, message: 'Evento salvo com sucesso', evento });
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // DELETE /api/eventos/:id - Remover evento
    router.delete('/:id', async (req, res) => {
        try {
            await db.collection('eventos').doc(req.params.id).delete();
            res.json({ success: true, message: 'Evento removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover evento:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // PUT /api/eventos/:id - Atualizar evento
    router.put('/:id', async (req, res) => {
        try {
            const evento = {
                ...req.body,
                dataAtualizacao: new Date().toISOString()
            };
            await db.collection('eventos').doc(req.params.id).update(evento);
            res.json({ success: true, message: 'Evento atualizado com sucesso', evento });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};