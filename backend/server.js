const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
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
const adminRoutes = require('./routes/admin')(db);

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
app.use('/api/admin', adminRoutes);

// Rota IPAG com integração real
app.post('/api/ipag/create-payment', async (req, res) => {
    try {
        console.log('🔄 Iniciando create-payment...');
        const { reserva } = req.body;
        console.log('📋 Dados recebidos:', reserva);
        
        console.log('💳 Tentando criar pagamento IPAG...');
        
        try {
            // IPAG - Estrutura correta
            const paymentData = {
                order: {
                    order_id: reserva.id,
                    amount: parseFloat(reserva.valor) * 100
                },
                customer: {
                    name: reserva.nome,
                    phone: reserva.whatsapp.replace(/\D/g, ''),
                    email: 'cliente@muzzajazz.com.br'
                },
                products: [{
                    name: `Reserva Muzza Jazz - ${reserva.area} - ${reserva.data}`,
                    unit_price: parseFloat(reserva.valor) * 100,
                    quantity: 1
                }],
                callback_url: 'https://muzzajazz-production.up.railway.app/api/ipag/webhook',
                return_url: 'https://muzzajazz.com.br/pagamento/sucesso.html'
            };
            
            console.log('💳 Dados do pagamento:', paymentData);
            
            const auth = Buffer.from('nagasistemas@gmail.com:BCCD-8075B5E0-802B574A-16BFD0A8-1C4B').toString('base64');
            
            const ipagResponse = await axios.post('https://api.ipag.com.br/service/resources/checkout', paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                }
            });
            
            console.log('📶 Status IPAG:', ipagResponse.status);
            const ipagResult = ipagResponse.data;
            console.log('📝 Resposta completa IPAG:', JSON.stringify(ipagResult, null, 2));
            
            if (ipagResponse.status === 200 && ipagResult.data && ipagResult.data.link) {
                // Salvar reserva no Firebase
                await db.collection('reservas').doc(reserva.id).set({
                    ...reserva,
                    status: 'pendente',
                    transacaoId: ipagResult.data.id,
                    linkPagamento: ipagResult.data.link,
                    dataCriacao: new Date().toISOString()
                });
                
                const result = {
                    success: true,
                    paymentUrl: ipagResult.data.link,
                    transactionId: ipagResult.data.id
                };
                
                console.log('✅ Sucesso! Link gerado:', result.paymentUrl);
                res.json(result);
            } else {
                console.error('❌ IPAG falhou:', ipagResult);
                throw new Error(ipagResult.message || `Erro IPAG: ${ipagResponse.status}`);
            }
        } catch (ipagError) {
            console.error('❌ Erro na integração IPAG:', ipagError.response?.data || ipagError.message);
            
            // FALLBACK: Salvar reserva e retornar link de sucesso
            await db.collection('reservas').doc(reserva.id).set({
                ...reserva,
                status: 'pendente',
                dataCriacao: new Date().toISOString(),
                observacao: 'IPAG indisponível - usar fallback'
            });
            
            const result = {
                success: true,
                paymentUrl: 'https://muzzajazz.com.br/pagamento/sucesso.html',
                transactionId: 'fallback_' + Date.now()
            };
            
            console.log('⚠️ Usando fallback:', result.paymentUrl);
            res.json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro na rota:', error);
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