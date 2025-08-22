const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Servir arquivos estáticos
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Rotas principais
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});



// Preços em memória (simulando banco de dados)
let precosPadrao = {
    interna_sexta: 35,
    interna_sabado: 50,
    externa: 35,
    crianca_desconto: 50 // 50% de desconto
};

// API para obter preços
app.get('/api/config/precos/:data?', (req, res) => {
    res.json({
        tipo: 'padrao',
        precos: precosPadrao
    });
});

// API para atualizar preços
app.post('/api/config/precos', (req, res) => {
    const { interna_sexta, interna_sabado, externa, crianca_desconto } = req.body;
    
    if (interna_sexta !== undefined && interna_sexta !== null) precosPadrao.interna_sexta = Number(interna_sexta);
    if (interna_sabado !== undefined && interna_sabado !== null) precosPadrao.interna_sabado = Number(interna_sabado);
    if (externa !== undefined && externa !== null) precosPadrao.externa = Number(externa);
    if (crianca_desconto !== undefined && crianca_desconto !== null) precosPadrao.crianca_desconto = Number(crianca_desconto);
    
    console.log('Preços atualizados:', precosPadrao);
    res.json({ success: true, precos: precosPadrao });
});

app.get('/api/config/capacidade/:data?', (req, res) => {
    res.json({
        disponivel: {
            interna: 50,
            externa: 100
        }
    });
});

app.post('/api/reservas', (req, res) => {
    console.log('Nova reserva:', req.body);
    res.json({ success: true, message: 'Reserva recebida com sucesso!' });
});

// API para obter preços atuais (para admin)
app.get('/api/admin/precos', (req, res) => {
    res.json(precosPadrao);
});

// Catch all - SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎷 Muzza Jazz Club rodando em http://localhost:${PORT}`);
    console.log(`📱 Admin: http://localhost:${PORT}/admin`);
});