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
        'https://admin.muzzajazz.com.br',
        'https://muzzajazz-production.up.railway.app',
        'http://localhost:3001',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());

// Inicializar Firebase Admin
let firebaseConfig;

if (process.env.NODE_ENV === 'production') {
    // Produção: usar variáveis de ambiente
    firebaseConfig = {
        credential: admin.credential.cert({
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        }),
        databaseURL: "https://muzza-2fb33-default-rtdb.firebaseio.com"
    };
} else {
    // Desenvolvimento: usar arquivo local
    const serviceAccount = require('./firebase/serviceAccountKey.json');
    firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://muzza-2fb33-default-rtdb.firebaseio.com"
    };
}

admin.initializeApp(firebaseConfig);

const db = admin.firestore();

// Importar rotas
const eventosRoutes = require('./routes/eventos')(db);
const precosRoutes = require('./routes/precos')(db);
const reservasRoutes = require('./routes/reservas')(db);
const mesasRoutes = require('./routes/mesas')(db);

// Importar rota de configurações
const configRoutes = require('./routes/config')(db);

// Usar rotas
app.use('/api/eventos', eventosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/mesas', mesasRoutes);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log(`Backend Firebase rodando em http://localhost:${PORT}`);
    console.log('Firebase Admin inicializado com sucesso');
});