const admin = require('firebase-admin');
const path = require('path');

// Configuração do Firebase Admin
let serviceAccount;

// Tentar usar arquivo de credenciais primeiro
try {
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Usando serviceAccountKey.json');
} catch (error) {
  // Fallback para variáveis de ambiente
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
  };
  console.log('✅ Usando variáveis de ambiente');
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };