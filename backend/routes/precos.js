const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // GET /api/config/precos - Buscar preços
    router.get('/', async (req, res) => {
        try {
            const doc = await db.collection('configuracoes').doc('precos').get();
            if (doc.exists) {
                res.json(doc.data());
            } else {
                res.json({ 
                    interna_sexta: 0, 
                    interna_sabado: 0, 
                    externa: 0, 
                    crianca_desconto: 50 
                });
            }
        } catch (error) {
            console.error('Erro ao buscar preços:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // POST /api/config/precos - Salvar preços
    router.post('/', async (req, res) => {
        try {
            await db.collection('configuracoes').doc('precos').set(req.body);
            res.json({ success: true, message: 'Preços salvos com sucesso' });
        } catch (error) {
            console.error('Erro ao salvar preços:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};