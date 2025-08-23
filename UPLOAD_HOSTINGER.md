# 📤 Upload Frontend - Hostinger

## 📁 Arquivos para Upload

### Raiz do Site
```
index.html
```

### Pasta /css/
```
css/styles.css
```

### Pasta /js/
```
js/main.js
js/config.js
js/calendar.js
```

### Pasta /admin/
```
admin/login.html
admin/dashboard.html
admin/dashboard.js
admin/calendar-admin.js
```

### Pasta /images/
```
images/ (toda a pasta com todas as imagens)
```

### Pasta /pagamento/
```
pagamento/sucesso.html
pagamento/erro.html
```

## ⚠️ NÃO Subir
- `backend/` (fica no Railway)
- `node_modules/`
- `.git/`
- `*.md` (arquivos de documentação)
- `test-api.js`
- `railway.json`
- `Procfile`

## 🔧 Estrutura Final na Hostinger
```
public_html/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── config.js
│   └── calendar.js
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── dashboard.js
│   └── calendar-admin.js
├── images/
│   └── (todas as imagens)
└── pagamento/
    ├── sucesso.html
    └── erro.html
```

## ✅ Verificação Pós-Upload
1. Acessar: https://muzzajazz.com.br
2. Verificar console: API_BASE_URL deve apontar para Railway
3. Testar admin: https://muzzajazz.com.br/admin/login.html