const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Rotas básicas para teste
app.get('/api/config/precos', (req, res) => {
    res.json({
        interna: { sexta: 35, sabado: 50 },
        externa: { todos: 35 },
        criancas: { desconto: 0.5 }
    });
});

app.get('/api/reservas', (req, res) => {
    res.json([]);
});

app.post('/api/reservas', (req, res) => {
    res.json({ success: true, message: 'Reserva recebida' });
});

app.get('/api/mesas/capacidade/:data', (req, res) => {
    res.json({ disponivel: true, capacidade: 100 });
});

app.get('/', (req, res) => {
    res.json({ status: 'Backend funcionando!', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Backend simples rodando em http://localhost:${PORT}`);
});