const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
    origin: [
        'https://muzzajazz.com.br',
        'https://admin.muzzajazz.com.br',
        'http://localhost:3001',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());

console.log('Usando variáveis de ambiente...');
const serviceAccount = {
    type: process.env.type || "service_account",
    project_id: process.env.project_id || "muzza-2fb33",
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key?.replace(/\\n/g, '\n'),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri || "https://accounts.google.com/o/oauth2/auth",
    token_uri: process.env.token_uri || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain || "googleapis.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://muzza-2fb33-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

const eventosRoutes = require('./routes/eventos')(db);
const precosRoutes = require('./routes/precos')(db);
const reservasRoutes = require('./routes/reservas')(db);
const mesasRoutes = require('./routes/mesas')(db);
const configRoutes = require('./routes/config')(db);

app.use('/api/eventos', eventosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/mesas', mesasRoutes);

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log(`Backend Firebase rodando em http://localhost:${PORT}`);
    console.log('Firebase Admin inicializado com sucesso');
});