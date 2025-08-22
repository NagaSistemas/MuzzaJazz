# 🎷 Muzza Jazz Club - Guia de Configuração

## ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

### 🔴 **URGENTE - Corrigir antes da produção:**

1. **Credenciais expostas** - Senhas hardcoded no código
2. **Vulnerabilidades de segurança** - XSS, CSRF, injeção de código
3. **Dependências vulneráveis** - Pacotes com falhas de segurança

## 🚀 **Passos para deixar funcional:**

### 1. **Configurar Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais reais
# NUNCA commitar o arquivo .env!
```

### 2. **Instalar Dependências do Backend**
```bash
cd backend
npm install
```

### 3. **Configurar Firebase**
- Criar projeto no Firebase Console
- Gerar chave de serviço
- Substituir credenciais no arquivo `.env`
- **REMOVER** o arquivo `serviceAccountKey.json` (credenciais expostas!)

### 4. **Corrigir Vulnerabilidades de Segurança**

#### **JavaScript (main.js):**
- Sanitizar logs (linha 194-195)
- Adicionar autorização nas rotas (linhas 110, 461)
- Remover alerts em produção (linha 368)

#### **Backend:**
- Implementar CSRF protection
- Adicionar validação de entrada
- Sanitizar dados do usuário
- Implementar autenticação adequada

### 5. **Atualizar Dependências**
```bash
# Atualizar pacotes vulneráveis
npm audit fix
npm update
```

### 6. **Configurar HTTPS**
Para produção, sempre usar HTTPS:
```javascript
// Adicionar no servidor
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## 🛡️ **Checklist de Segurança:**

- [ ] Remover credenciais hardcoded
- [ ] Implementar sanitização de entrada
- [ ] Adicionar proteção CSRF
- [ ] Configurar HTTPS
- [ ] Atualizar dependências vulneráveis
- [ ] Implementar rate limiting
- [ ] Adicionar logs de segurança
- [ ] Configurar headers de segurança

## 📦 **Deploy para Produção:**

### **Netlify (Frontend):**
1. Conectar repositório
2. Configurar build: `npm run build`
3. Pasta de publicação: `dist` ou raiz
4. Configurar redirects no `netlify.toml`

### **Heroku/Railway (Backend):**
1. Configurar variáveis de ambiente
2. Adicionar `Procfile`: `web: node server.js`
3. Configurar domínio personalizado

## 🔧 **Comandos Úteis:**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

## 📞 **Suporte:**
- WhatsApp: +55 62 99838-0208
- Email: contato@muzzajazz.com

---
**⚠️ IMPORTANTE:** Nunca commitar arquivos `.env` ou credenciais reais!