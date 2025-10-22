const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const adminDoc = await db.collection('admin').doc('credentials').get();
            
            if (!adminDoc.exists) {
                return res.status(401).json({ error: 'Credenciais não configuradas' });
            }
            
            const { email: adminEmail, password: adminPassword } = adminDoc.data();
            
            if (email === adminEmail && password === adminPassword) {
                res.json({ success: true });
            } else {
                res.status(401).json({ error: 'Email ou senha incorretos' });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno' });
        }
    });

    return router;
};
