# Deploy para Produção - Muzza Jazz

## 🚀 Arquitetura de Produção
- **Frontend**: Hostinger (arquivos estáticos)
- **Backend**: Railway (Node.js + Firebase)

## 📋 Preparação dos Arquivos

### 1. Backend para Railway
Arquivos necessários no Railway:
- `backend/` (pasta completa)
- `package.json` do backend
- Variáveis de ambiente

### 2. Frontend para Hostinger
Arquivos necessários na Hostinger:
- Todos os arquivos exceto `backend/`
- `js/main.js` modificado para apontar para Railway
- `admin/dashboard.js` modificado para apontar para Railway

## 🔧 Configurações Necessárias

### Railway (Backend)
1. Criar projeto no Railway
2. Conectar repositório ou fazer upload
3. Configurar variáveis de ambiente
4. Deploy automático

### Hostinger (Frontend)
1. Upload via File Manager ou FTP
2. Configurar domínio
3. Testar conectividade com Railway

## 📝 Próximos Passos
1. Modificar URLs da API no frontend
2. Configurar CORS no backend
3. Preparar arquivos para upload
4. Configurar variáveis de ambiente