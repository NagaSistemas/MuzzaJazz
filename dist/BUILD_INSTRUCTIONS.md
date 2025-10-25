# 🚀 Build do Projeto Muzza Jazz

## 📦 Arquivos para Deploy

### 🌐 Frontend (Hostinger)
**Subir estes arquivos:**
```
📁 Raiz do site:
├── index.html
├── pagamento/
│   ├── sucesso.html
│   └── erro.html
├── js/
│   ├── config.js
│   └── main.js
├── css/
│   └── styles.css
├── images/
│   └── [todas as imagens]
└── admin/
    ├── login.html
    ├── dashboard.html
    ├── dashboard.js
    └── [outros arquivos admin]
```

### ⚙️ Backend (Railway)
**Push estes arquivos:**
```
📁 backend/
├── server.js
├── package.json (com axios)
├── routes/
│   ├── eventos.js
│   ├── precos.js
│   ├── reservas.js
│   ├── mesas.js
│   └── config.js
└── [outros arquivos backend]
```

## 🔧 Comandos de Build

### 1. Backend (Railway)
```bash
# No diretório backend/
git add .
git commit -m "Fix IPAG integration"
git push origin main
```

### 2. Frontend (Hostinger)
**Via FTP/cPanel:**
1. Upload `index.html`
2. Upload pasta `js/`
3. Upload pasta `pagamento/`
4. Upload pasta `admin/`
5. Upload pasta `css/`
6. Upload pasta `images/`

## ✅ Verificação Pós-Deploy

### Backend
```bash
# Verificar se Railway está online
curl https://muzzajazz-production.up.railway.app/api/health
```

### Frontend
```bash
# Verificar se site carrega
curl https://muzzajazz.com.br
```

## 🧪 Teste Final
1. **Site**: https://muzzajazz.com.br
2. **Preencher formulário**
3. **Clicar "CONCLUIR RESERVA"**
4. **Deve redirecionar para IPAG real**

## 📋 Status Atual
- ✅ Backend: Estrutura IPAG corrigida
- ✅ Frontend: Override funcionando
- ✅ API: Respondendo corretamente
- 🔄 **Aguardando deploy final**