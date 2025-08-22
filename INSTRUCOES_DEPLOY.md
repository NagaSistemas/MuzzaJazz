# 🚀 Instruções de Deploy - Muzza Jazz

## 1️⃣ RAILWAY (Backend)

### Preparar Backend:
1. Acesse [railway.app](https://railway.app)
2. Crie novo projeto
3. Conecte GitHub ou faça upload da pasta `backend/`

### Configurar Variáveis:
```
PORT=3002
NODE_ENV=production
FRONTEND_SITE=https://muzzajazz.com.br
FRONTEND_ADMIN=https://admin.muzzajazz.com.br
```

### Arquivos Necessários:
- Toda pasta `backend/`
- `package.json` do backend
- `serviceAccountKey.json` (Firebase)

### Após Deploy:
- Copie a URL gerada (ex: `https://muzza-backend-abc123.up.railway.app`)

## 2️⃣ HOSTINGER (Frontend)

### Domínios:
- **Site Principal**: https://muzzajazz.com.br
- **Admin**: https://admin.muzzajazz.com.br

### Antes do Upload:
1. Edite `js/config.js`:
```javascript
production: 'https://SUA-URL-RAILWAY.up.railway.app/api'
```

### Upload para Hostinger:
1. **Site Principal** (`muzzajazz.com.br`):
   - Upload: `index.html`, `css/`, `js/`, `images/`
   
2. **Admin** (`admin.muzzajazz.com.br`):
   - Upload: `admin/` (renomear para raiz)
   - Copiar: `css/`, `js/` (dependências)

### Estrutura de Upload:

**muzzajazz.com.br/public_html/:**
- `index.html`
- `css/`, `js/`, `images/`

**admin.muzzajazz.com.br/public_html/:**
- Conteúdo da pasta `admin/` na raiz
- `css/`, `js/` (cópias das dependências)

## 3️⃣ TESTE FINAL

1. Acesse seu domínio
2. Teste reservas
3. Teste admin
4. Verifique console do navegador

## ⚠️ IMPORTANTE

- Substitua `https://SUA-URL-RAILWAY.up.railway.app` pela URL real do Railway
- Configure CORS no Railway com seu domínio
- Teste tudo em ambiente local primeiro