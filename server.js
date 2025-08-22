const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const PORT = 3001;

app.use(express.json());

// Middleware para configurar CSP permitindo backend API
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; connect-src 'self' http://localhost:3002; object-src 'none';"
    );
    next();
});

// Proxy para backend Firebase
app.use('/api', async (req, res) => {
    try {
        const backendUrl = `http://localhost:3002${req.originalUrl}`;
        const options = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            options.body = JSON.stringify(req.body);
        }
        
        const response = await fetch(backendUrl, options);
        
        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            res.status(response.status).json({ error: 'Erro no backend' });
        }
    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ error: 'Backend indisponível' });
    }
});

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Firebase permitido no CSP');
});