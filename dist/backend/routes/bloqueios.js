const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // GET /api/bloqueios - Buscar todos os bloqueios
    router.get('/', async (req, res) => {
        try {
            const snapshot = await db.collection('bloqueios').get();
            const bloqueios = [];
            snapshot.forEach(doc => {
                bloqueios.push({ id: doc.id, ...doc.data() });
            });
            res.json({ bloqueios });
        } catch (error) {
            console.error('Erro ao buscar bloqueios:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // POST /api/bloqueios - Criar/atualizar bloqueio
    router.post('/', async (req, res) => {
        try {
            const { data, bloqueado } = req.body;
            
            await db.collection('bloqueios').doc(data).set({
                data,
                bloqueado,
                atualizadoEm: new Date().toISOString()
            });
            
            res.json({ success: true, message: bloqueado ? 'Data bloqueada' : 'Data desbloqueada' });
        } catch (error) {
            console.error('Erro ao salvar bloqueio:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // DELETE /api/bloqueios/:data - Remover bloqueio
    router.delete('/:data', async (req, res) => {
        try {
            await db.collection('bloqueios').doc(req.params.data).delete();
            res.json({ success: true, message: 'Bloqueio removido' });
        } catch (error) {
            console.error('Erro ao remover bloqueio:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};
