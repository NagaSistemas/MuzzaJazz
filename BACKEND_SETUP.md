# 🔧 Backend Setup - Muzza Jazz Club

## ✅ PROBLEMAS RESOLVIDOS:

### 1. **Firebase Configurado**
- ✅ Configuração segura via variáveis de ambiente
- ✅ Teste de conexão automático
- ✅ Credenciais não expostas no código

### 2. **Rotas Funcionais**
- ✅ `/api/reservas` - CRUD completo com validação
- ✅ `/api/config/precos` - Preços dinâmicos
- ✅ `/api/config/capacidade` - Controle de lotação
- ✅ `/api/eventos` - Eventos especiais
- ✅ `/api/admin` - Autenticação JWT
- ✅ `/api/webhook` - Confirmação de pagamentos

### 3. **Validação Implementada**
- ✅ Joi para validação de esquemas
- ✅ Sanitização de entrada com validator
- ✅ Validação de capacidade em tempo real

### 4. **Segurança Adicionada**
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Sanitização automática de inputs
- ✅ JWT para autenticação

## 🚀 COMO USAR:

### 1. **Instalar Dependências**
```bash
# Execute o script de instalação
./backend/install.bat

# OU manualmente:
cd backend
npm install
```

### 2. **Configurar Firebase**
```bash
# Edite o arquivo .env com suas credenciais reais:
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="sua-chave-privada"
FIREBASE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
```

### 3. **Executar Setup Inicial**
```bash
cd backend
node scripts/setup.js
```

### 4. **Iniciar Servidor**
```bash
npm start
```

## 🔐 **Credenciais Padrão:**
- **Usuário:** admin
- **Senha:** muzza2023

## 📡 **APIs Disponíveis:**

### **Reservas:**
- `POST /api/reservas` - Criar reserva
- `GET /api/reservas` - Listar reservas
- `PUT /api/reservas/:id/status` - Atualizar status

### **Configurações:**
- `GET /api/config/precos/:data?` - Obter preços
- `GET /api/config/capacidade/:data?` - Verificar capacidade
- `POST /api/config/precos` - Salvar preços (auth)

### **Eventos:**
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Criar evento (auth)
- `DELETE /api/eventos/:id` - Deletar evento (auth)

### **Admin:**
- `POST /api/admin/login` - Login
- `GET /api/admin/dashboard` - Métricas (auth)
- `GET /api/admin/mesas` - Listar mesas (auth)

## ⚡ **Melhorias Implementadas:**
- Verificação automática de capacidade
- Preços dinâmicos por data/evento
- Autenticação JWT real
- Validação robusta de dados
- Rate limiting para segurança
- Logs estruturados
- Fallback para desenvolvimento

## 🎯 **Próximos Passos:**
1. Configurar Firebase com suas credenciais
2. Testar todas as rotas
3. Implementar sistema de pagamento
4. Deploy para produção