const express = require('express');
const admin = require('firebase-admin');

module.exports = function(db) {
    const router = express.Router();

// GET - Buscar URLs dos mapas
router.get('/', async (req, res) => {
    try {
        const doc = await db.collection('config').doc('mapas').get();
        if (doc.exists) {
            res.json({ mapas: doc.data() });
        } else {
            res.json({ mapas: { mapaInterno: '', mapaExterno: '' } });
        }
    } catch (error) {
        console.error('Erro ao buscar mapas:', error);
        res.status(500).json({ error: 'Erro ao buscar mapas' });
    }
});

// POST - Salvar URLs dos mapas
router.post('/', async (req, res) => {
    try {
        const { mapaInterno, mapaExterno } = req.body;
        
        await db.collection('config').doc('mapas').set({
            mapaInterno: mapaInterno || '',
            mapaExterno: mapaExterno || '',
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar mapas:', error);
        res.status(500).json({ error: 'Erro ao salvar mapas' });
    }
});

    return router;
};
