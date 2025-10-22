const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// GET - Listar todos os cupons
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('cupons').get();
        const cupons = [];
        snapshot.forEach(doc => {
            cupons.push({ id: doc.id, ...doc.data() });
        });
        res.json({ cupons });
    } catch (error) {
        console.error('Erro ao buscar cupons:', error);
        res.status(500).json({ error: 'Erro ao buscar cupons' });
    }
});

// POST - Criar ou atualizar cupom
router.post('/', async (req, res) => {
    try {
        const { id, codigo, desconto, ativo } = req.body;
        
        const cupomData = {
            codigo: codigo.toUpperCase(),
            desconto: parseFloat(desconto),
            ativo: ativo !== false,
            criadoEm: admin.firestore.FieldValue.serverTimestamp()
        };

        if (id) {
            await db.collection('cupons').doc(id).set(cupomData, { merge: true });
        } else {
            await db.collection('cupons').add(cupomData);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar cupom:', error);
        res.status(500).json({ error: 'Erro ao salvar cupom' });
    }
});

// DELETE - Remover cupom
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('cupons').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover cupom:', error);
        res.status(500).json({ error: 'Erro ao remover cupom' });
    }
});

// GET - Validar cupom
router.get('/validar/:codigo', async (req, res) => {
    try {
        const codigo = req.params.codigo.toUpperCase();
        const snapshot = await db.collection('cupons')
            .where('codigo', '==', codigo)
            .where('ativo', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.json({ valido: false });
        }

        const cupom = snapshot.docs[0].data();
        res.json({ 
            valido: true, 
            desconto: cupom.desconto,
            codigo: cupom.codigo
        });
    } catch (error) {
        console.error('Erro ao validar cupom:', error);
        res.status(500).json({ error: 'Erro ao validar cupom' });
    }
});

module.exports = router;
