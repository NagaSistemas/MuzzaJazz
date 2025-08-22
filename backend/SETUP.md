# 🔥 Setup Firebase - Muzza Jazz

## 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Nome: `muzza-jazz-club`
4. Ative Google Analytics (opcional)

## 2. Configurar Firestore

1. No painel lateral: **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste"
4. Selecione localização (preferencialmente `southamerica-east1`)

## 3. Gerar Chave de Serviço

1. Vá em **Configurações do projeto** (ícone engrenagem)
2. Aba **Contas de serviço**
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON

## 4. Configurar Variáveis de Ambiente

Abra o arquivo `.env` e preencha com os dados do JSON baixado:

```env
PORT=3001
JWT_SECRET=muzza_jazz_secret_key_2024
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-chave-privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-project.iam.gserviceaccount.com
NAGAPAY_API_URL=https://api.nagapay.com
NAGAPAY_WEBHOOK_SECRET=webhook_secret_key
```

## 5. Instalar Dependências e Testar

```bash
cd backend
npm install
npm run dev
```

## 6. Testar APIs

- **Site:** http://localhost:3001
- **Admin:** http://localhost:3001/admin
- **API Test:** http://localhost:3001/api/reservas

## ✅ Pronto para Testes!

Após configurar o Firebase, o backend estará funcional.