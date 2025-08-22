const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middlewares
app.use(express.json());
app.use(express.static(__dirname));

// Arquivos de persistência
const DATA_DIR = path.join(__dirname, 'data');
const RESERVAS_FILE = path.join(DATA_DIR, 'reservas.json');
const EVENTOS_FILE = path.join(DATA_DIR, 'eventos.json');
const PRECOS_FILE = path.join(DATA_DIR, 'precos.json');

// Criar diretório data se não existir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Funções de persistência
function loadData(file, defaultData) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (error) {
    console.warn(`Erro ao carregar ${file}:`, error.message);
  }
  return defaultData;
}

function saveData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erro ao salvar ${file}:`, error.message);
  }
}

// Carregar dados persistidos
let mockReservas = loadData(RESERVAS_FILE, []);
let mockEventos = loadData(EVENTOS_FILE, []);
let mockPrecos = loadData(PRECOS_FILE, {
  interna_sexta: 35,
  interna_sabado: 50,
  externa: 35,
  crianca_desconto: 50
});

// Rotas de configuração
app.get('/api/config/precos/:data?', (req, res) => {
  res.json({ tipo: 'padrao', precos: mockPrecos });
});

app.post('/api/config/precos', (req, res) => {
  mockPrecos = { ...mockPrecos, ...req.body };
  saveData(PRECOS_FILE, mockPrecos);
  res.json({ success: true, message: 'Preços atualizados' });
});

app.get('/api/config/capacidade/:data?', (req, res) => {
  res.json({
    capacidade: { interna: 40, externa: 60 },
    disponivel: { interna: 35, externa: 55 }
  });
});

// Rotas de reservas
app.post('/api/reservas', (req, res) => {
  const { nome, whatsapp, data, adultos, criancas, area, valor } = req.body;
  
  // Validação básica
  if (!nome || !whatsapp || !data || !adultos || !area || valor === undefined) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
  }
  
  if (typeof adultos !== 'number' || adultos < 1 || adultos > 20) {
    return res.status(400).json({ success: false, message: 'Número de adultos inválido' });
  }
  
  if (criancas && (typeof criancas !== 'number' || criancas < 0 || criancas > 20)) {
    return res.status(400).json({ success: false, message: 'Número de crianças inválido' });
  }
  
  if (!['interna', 'externa'].includes(area)) {
    return res.status(400).json({ success: false, message: 'Área inválida' });
  }
  
  const reserva = {
    id: Date.now().toString(),
    nome: String(nome).trim(),
    whatsapp: String(whatsapp).trim(),
    data,
    adultos: Number(adultos),
    criancas: Number(criancas) || 0,
    area,
    valor: Number(valor),
    status: 'pendente',
    criadoEm: new Date().toISOString()
  };
  mockReservas.push(reserva);
  saveData(RESERVAS_FILE, mockReservas);
  res.json({ success: true, id: reserva.id, reserva });
});

app.get('/api/reservas', (req, res) => {
  res.json({ success: true, reservas: mockReservas });
});

// Rotas de eventos
app.get('/api/eventos', (req, res) => {
  res.json({ success: true, eventos: mockEventos });
});

app.post('/api/eventos', (req, res) => {
  const { data, nome, tipo } = req.body;
  
  // Validação básica
  if (!data || !nome || !tipo) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
  }
  
  if (!['gratuito', 'especial'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo de evento inválido' });
  }
  
  const evento = {
    id: Date.now().toString(),
    data,
    nome: String(nome).trim(),
    tipo,
    precoInterna: Number(req.body.precoInterna) || 0,
    precoExterna: Number(req.body.precoExterna) || 0,
    tipoCrianca: req.body.tipoCrianca || '50',
    precoPersonalizadoCrianca: Number(req.body.precoPersonalizadoCrianca) || 0,
    descricao: req.body.descricao ? String(req.body.descricao).trim() : '',
    criadoEm: new Date().toISOString()
  };
  mockEventos.push(evento);
  saveData(EVENTOS_FILE, mockEventos);
  console.log('Evento criado:', evento);
  res.json({ success: true, id: evento.id, evento });
});

app.put('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { data, nome, tipo } = req.body;
  const eventoIndex = mockEventos.findIndex(e => e.id === id);
  
  if (eventoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Evento não encontrado' });
  }
  
  // Validação básica
  if (!data || !nome || !tipo) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
  }
  
  if (!['gratuito', 'especial'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo de evento inválido' });
  }
  
  mockEventos[eventoIndex] = {
    ...mockEventos[eventoIndex],
    data,
    nome: String(nome).trim(),
    tipo,
    precoInterna: Number(req.body.precoInterna) || 0,
    precoExterna: Number(req.body.precoExterna) || 0,
    tipoCrianca: req.body.tipoCrianca || '50',
    precoPersonalizadoCrianca: Number(req.body.precoPersonalizadoCrianca) || 0,
    descricao: req.body.descricao ? String(req.body.descricao).trim() : '',
    atualizadoEm: new Date().toISOString()
  };
  saveData(EVENTOS_FILE, mockEventos);
  console.log('Evento atualizado:', mockEventos[eventoIndex]);
  res.json({ success: true, evento: mockEventos[eventoIndex] });
});

app.delete('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  mockEventos = mockEventos.filter(e => e.id !== id);
  saveData(EVENTOS_FILE, mockEventos);
  console.log('Evento excluído:', id);
  res.json({ success: true });
});

// Credenciais admin via variáveis de ambiente
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'muzza2023';

// Rotas admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      token: 'mock-token',
      admin: { username: ADMIN_USERNAME, nome: 'Administrador' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.get('/api/admin/precos', (req, res) => {
  res.json({
    success: true,
    precos: mockPrecos
  });
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

// Servir páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/login.html'));
});

app.listen(PORT, () => {
  console.log('🎵 Muzza Jazz - Servidor Simples');
  console.log(`📱 Site: http://localhost:${PORT}`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`👤 Login: ${ADMIN_USERNAME} | 🔑 Senha: ${ADMIN_PASSWORD}`);
  console.log('✅ Todas as rotas funcionando');
});