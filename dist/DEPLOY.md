# Guia de Deploy - Muzza Jazz

## Railway (Backend)

O Railway detecta automaticamente os commits no GitHub e faz deploy automático.

**Status:** ✅ Deploy automático configurado
**URL:** https://muzzajazz-production.up.railway.app

### Verificar Deploy
```bash
curl https://muzzajazz-production.up.railway.app/api/health
```

## Hostinger (Frontend)

### 1. Arquivo Pronto
- ✅ `muzzajazz-hostinger.zip` criado na raiz do projeto

### 2. Upload para Hostinger
1. Acesse o painel da Hostinger
2. Vá em **Gerenciador de Arquivos**
3. Navegue até `public_html`
4. Faça upload do arquivo `muzzajazz-hostinger.zip`
5. Extraia o arquivo no servidor
6. Mova os arquivos da pasta `dist` para `public_html`

### 3. Estrutura no Servidor
```
public_html/
├── index.html
├── server.js
├── package.json
├── admin/
├── backend/
├── css/
├── js/
└── images/
```

### 4. Configurar Node.js na Hostinger
1. Acesse **Configurações Avançadas** > **Node.js**
2. Versão: 18.x ou superior
3. Arquivo de entrada: `server.js`
4. Instalar dependências:
```bash
npm install
cd backend && npm install
```

## Variáveis de Ambiente (Railway)

Certifique-se de que as seguintes variáveis estão configuradas no Railway:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `PORT` (automático)

## URLs Finais

- **Site:** https://muzzajazz.com.br
- **Admin:** https://muzzajazz.com.br/admin/login.html
- **API:** https://muzzajazz-production.up.railway.app/api

## Credenciais Admin

- **Usuário:** admin
- **Senha:** muzza2024
