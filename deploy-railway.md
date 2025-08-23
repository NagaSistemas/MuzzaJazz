# 🚀 Deploy no Railway - Passo a Passo

## 📋 Pré-requisitos
- Conta no Railway
- Repositório Git configurado
- Variáveis de ambiente do Firebase

## 🔧 Configuração do Projeto

### 1. Arquivos Criados
- ✅ `railway.json` - Configuração do Railway
- ✅ `Procfile` - Comando de inicialização
- ✅ `backend/server.js` - Rota `/api/health` adicionada

### 2. Estrutura Esperada
```
Muzza Jazz/
├── backend/
│   ├── server.js          # ✅ Com rota health
│   ├── package.json       # ✅ Configurado
│   └── routes/            # ✅ Todas as rotas
├── railway.json           # ✅ Novo
└── Procfile              # ✅ Novo
```

## 🚀 Deploy no Railway

### Opção 1: Via GitHub
1. Fazer push do código para GitHub
2. Conectar repositório no Railway
3. Configurar variáveis de ambiente
4. Deploy automático

### Opção 2: Via Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

## 🔑 Variáveis de Ambiente Necessárias

No painel do Railway, configurar:
```
FIREBASE_PROJECT_ID=muzza-2fb33
FIREBASE_PRIVATE_KEY_ID=sua_private_key_id
FIREBASE_PRIVATE_KEY=sua_private_key
FIREBASE_CLIENT_EMAIL=seu_client_email
FIREBASE_CLIENT_ID=seu_client_id
PORT=3001
```

## ✅ Verificação Pós-Deploy

### 1. Testar Health Check
```
https://seu-projeto.up.railway.app/api/health
```
**Esperado**: `{"status":"ok","timestamp":"...","service":"Muzza Jazz API"}`

### 2. Testar Endpoints
```
https://seu-projeto.up.railway.app/api/eventos
https://seu-projeto.up.railway.app/api/config/precos
```

### 3. Verificar Logs
```bash
railway logs --follow
```

## 🐛 Troubleshooting

### Deploy Falha
- Verificar `railway.json` está correto
- Verificar `Procfile` existe
- Verificar `backend/package.json` tem script "start"

### API não responde
- Verificar variáveis de ambiente
- Verificar logs de erro
- Verificar se Firebase está configurado

### CORS Error
- Verificar se domínio está na lista de origins
- Verificar se CORS está habilitado

## 📝 Comandos Úteis

```bash
# Ver status do projeto
railway status

# Ver logs em tempo real
railway logs --follow

# Abrir no navegador
railway open

# Redeploy
railway up --detach
```

---

**Próximo passo**: Após deploy bem-sucedido, testar todos os endpoints conforme `GUIA_TESTES_PRODUCAO.md`