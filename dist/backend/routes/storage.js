const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');

module.exports = (db) => {
    const router = express.Router();
    const bucket = admin.storage().bucket();
    
    // Configurar multer para upload em memória
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Apenas imagens são permitidas'));
            }
        }
    });

    // Upload de mapa
    router.post('/upload-mapa', upload.single('mapa'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            const { area } = req.body;
            const fileName = `mapas/${area}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
                public: true
            });

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            // Salvar URL no Firestore
            await db.collection('config').doc('mapas').set({
                [`mapa${area.charAt(0).toUpperCase() + area.slice(1)}`]: publicUrl,
                atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            res.json({ success: true, url: publicUrl });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
