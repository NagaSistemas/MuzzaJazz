const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Mock data
const mockData = {
    precos: {
        interna: { sexta: 35, sabado: 50 },
        externa: { todos: 35 },
        criancas: { desconto: 0.5 }
    },
    reservas: [],
    mesas: { capacidade: 100 }
};

// Routes
app.get('/api/config/precos', (req, res) => {
    res.json(mockData.precos);
});

app.get('/api/precos', (req, res) => {
    res.json(mockData.precos);
});

app.get('/api/reservas', (req, res) => {
    res.json(mockData.reservas);
});

app.post('/api/reservas', (req, res) => {
    const reserva = { id: Date.now(), ...req.body };
    mockData.reservas.push(reserva);
    res.json({ success: true, reserva });
});

app.get('/api/mesas/capacidade/:data', (req, res) => {
    res.json({ disponivel: true, capacidade: mockData.mesas.capacidade });
});

app.get('/api/eventos', (req, res) => {
    res.json([]);
});

app.get('/', (req, res) => {
    res.json({ status: 'Backend funcionando!', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
});