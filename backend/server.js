const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: [
        'https://muzzajazz.com.br',
        'https://www.muzzajazz.com.br',
        'https://admin.muzzajazz.com.br',
        'https://muzzajazz-production.up.railway.app',
        'http://localhost:3001',
        'http://localhost:3000',
        'file://'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Inicializar Firebase Admin usando variáveis de ambiente
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "muzza-2fb33",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  universe_domain: "googleapis.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://muzza-2fb33-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Importar rotas
const eventosRoutes = require('./routes/eventos')(db);
const precosRoutes = require('./routes/precos')(db);
const reservasRoutes = require('./routes/reservas')(db);
const mesasRoutes = require('./routes/mesas')(db);

// Importar rota de configurações
const configRoutes = require('./routes/config')(db);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Muzza Jazz API'
    });
});

// Test IPAG route
app.get('/api/ipag/test', (req, res) => {
    res.json({ 
        status: 'IPAG route working',
        timestamp: new Date().toISOString()
    });
});

// Usar rotas
app.use('/api/eventos', eventosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/mesas', mesasRoutes);

// Rota IPAG diretamente no server (temporário para debug)
app.post('/api/ipag/create-payment', async (req, res) => {
    try {
        console.log('🔄 Criando pagamento IPAG...');
        const { reserva } = req.body;
        console.log('📋 Dados da reserva:', reserva);
        
        const IPAG_CONFIG = {
            apiKey: 'BCCD-8075B5E0-802B574A-16BFD0A8-1C4B',
            apiId: 'nagasistemas@gmail.com',
            baseUrl: 'https://api.ipag.com.br'
        };
        
        const paymentData = {
            amount: parseFloat(reserva.valor) * 100,
            callback_url: 'https://muzzajazz-production.up.railway.app/api/ipag/webhook',
            return_url: 'https://muzzajazz.com.br/pagamento/sucesso.html',
            return_type: 'redirect',
            order_id: reserva.id,
            customer: {
                name: reserva.nome,
                phone: reserva.whatsapp.replace(/\D/g, ''),
                email: 'cliente@muzzajazz.com.br'
            },
            products: [{
                name: `Reserva Muzza Jazz - ${reserva.area} - ${reserva.data}`,
                unit_price: parseFloat(reserva.valor) * 100,
                quantity: 1,
                description: `${reserva.adultos} adultos, ${reserva.criancas} crianças`
            }],
            payment: {
                methods: ['pix', 'creditcard']
            }
        };
        
        console.log('💳 Dados do pagamento:', paymentData);
        
        const response = await fetch(`${IPAG_CONFIG.baseUrl}/service/resources/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${IPAG_CONFIG.apiId}:${IPAG_CONFIG.apiKey}`).toString('base64')}`
            },
            body: JSON.stringify(paymentData)
        });
        
        console.log('📶 Status da resposta IPAG:', response.status);
        const result = await response.json();
        console.log('📝 Resposta IPAG:', result);
        
        if (response.ok && result.data) {
            // Salvar reserva com status pendente
            await db.collection('reservas').doc(reserva.id).set({
                ...reserva,
                status: 'pendente',
                transacaoId: result.data.id,
                linkPagamento: result.data.link,
                dataCriacao: new Date().toISOString()
            });
            
            res.json({
                success: true,
                paymentUrl: result.data.link,
                transactionId: result.data.id
            });
        } else {
            throw new Error(result.message || 'Erro ao criar pagamento');
        }
    } catch (error) {
        console.error('Erro IPAG:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ipag/webhook', async (req, res) => {
    try {
        const notification = req.body;
        console.log('Webhook IPAG recebido:', notification);
        
        if (notification.status === 'paid') {
            await db.collection('reservas').doc(notification.order_id).update({
                status: 'pago',
                dataPagamento: new Date().toISOString(),
                dadosPagamento: notification
            });
            console.log(`Reserva ${notification.order_id} confirmada como paga`);
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Error');
    }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log(`Backend Firebase rodando em http://localhost:${PORT}`);
    console.log('Firebase Admin inicializado com sucesso');
});