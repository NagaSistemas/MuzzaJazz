const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Mock data para testes
let mockReservas = [];
let mockEventos = [];
let mockPrecos = {
  interna_sexta: 35,
  interna_sabado: 50,
  externa: 35,
  crianca_desconto: 50
};

// Rotas de teste
app.get('/api/config/precos/:data?', (req, res) => {
  res.json({ tipo: 'padrao', precos: mockPrecos });
});

app.post('/api/config/precos', (req, res) => {
  mockPrecos = { ...mockPrecos, ...req.body };
  res.json({ success: true, message: 'Preços atualizados' });
});

app.get('/api/config/capacidade/:data?', (req, res) => {
  res.json({
    capacidade: { interna: 40, externa: 60 },
    disponivel: { interna: 35, externa: 55 }
  });
});

app.post('/api/reservas', (req, res) => {
  const reserva = {
    id: Date.now().toString(),
    ...req.body,
    status: 'pendente',
    criadoEm: new Date().toISOString()
  };
  mockReservas.push(reserva);
  res.json({ success: true, id: reserva.id, reserva });
});

app.get('/api/reservas', (req, res) => {
  res.json({ success: true, reservas: mockReservas });
});

// Admin mock
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'muzza2023') {
    res.json({ 
      success: true, 
      token: 'mock-token',
      admin: { username: 'admin', nome: 'Administrador' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    metricas: {
      reservasHoje: mockReservas.length,
      receitaHoje: mockReservas.reduce((sum, r) => sum + (r.valor || 0), 0),
      ocupacao: 25,
      proximasChegadas: 3
    }
  });
});

// Eventos
app.get('/api/eventos', (req, res) => {
  res.json({ success: true, eventos: mockEventos });
});

app.post('/api/eventos', (req, res) => {
  const evento = {
    id: Date.now().toString(),
    ...req.body,
    criadoEm: new Date().toISOString()
  };
  mockEventos.push(evento);
  res.json({ success: true, id: evento.id, evento });
});

app.delete('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  mockEventos = mockEventos.filter(e => e.id !== id);
  res.json({ success: true });
});

// Servir páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/login.html'));
});

app.listen(PORT, () => {
  console.log('🎵 Muzza Jazz - Servidor de Teste');
  console.log(`📱 Site: http://localhost:${PORT}`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log('👤 Login: admin | 🔑 Senha: muzza2023');
  console.log('🔧 Servidor mock - sem Firebase');
});