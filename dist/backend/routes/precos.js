const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // GET /api/config/precos - Buscar preços
    router.get('/', async (req, res) => {
        try {
            const doc = await db.collection('configuracoes').doc('precos').get();
            if (doc.exists) {
                res.json({ tipo: 'padrao', precos: doc.data() });
            } else {
                res.json({ 
                    tipo: 'padrao',
                    precos: {
                        interna_sexta: 35, 
                        interna_sabado: 50, 
                        externa: 35, 
                        crianca_desconto: 50 
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao buscar preços:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // GET /api/config/precos/:data - Buscar preços para data específica
    router.get('/:data', async (req, res) => {
        try {
            const data = req.params.data;
            
            // Verificar se há evento especial nesta data
            const eventoSnapshot = await db.collection('eventos').where('data', '==', data).get();
            
            if (!eventoSnapshot.empty) {
                const evento = eventoSnapshot.docs[0].data();
                return res.json({
                    tipo: 'evento_especial',
                    evento: evento,
                    precos: {
                        interna_sexta: evento.precoInterna || 0,
                        interna_sabado: evento.precoInterna || 0,
                        externa: evento.precoExterna || 0,
                        crianca_desconto: evento.tipoCrianca === 'gratuito' ? 0 : 
                                         evento.tipoCrianca === 'personalizado' ? -1 : 
                                         parseInt(evento.tipoCrianca) || 50,
                        crianca_preco_fixo: evento.precoPersonalizadoCrianca || 0
                    }
                });
            }
            
            // Preços padrão se não há evento especial
            const doc = await db.collection('configuracoes').doc('precos').get();
            if (doc.exists) {
                res.json({ tipo: 'padrao', precos: doc.data() });
            } else {
                res.json({ 
                    tipo: 'padrao',
                    precos: {
                        interna_sexta: 35, 
                        interna_sabado: 50, 
                        externa: 35, 
                        crianca_desconto: 50 
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao buscar preços por data:', error);
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