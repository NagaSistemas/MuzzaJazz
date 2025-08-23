# ✅ Checklist Rápido de Testes

## 🚀 Teste Rápido (5 minutos)

### 1. Verificar API Online
```bash
# Abrir no navegador ou usar curl
https://muzzajazz-production.up.railway.app/api/health
```
**Esperado**: `{"status": "ok", "timestamp": "..."}`

### 2. Testar Site Principal
- **URL**: https://muzzajazz.com.br
- **Verificar**: 
  - [ ] Site carrega
  - [ ] Preços aparecem (R$ 35/50)
  - [ ] Calendário funciona
  - [ ] Console sem erros

### 3. Testar Admin
- **URL**: https://muzzajazz.com.br/admin/login.html
- **Login**: admin / muzza2024
- **Verificar**:
  - [ ] Login funciona
  - [ ] Dashboard carrega
  - [ ] Reservas aparecem

### 4. Teste de Reserva
- [ ] Preencher formulário
- [ ] Selecionar data
- [ ] Escolher área
- [ ] Clicar "CONCLUIR RESERVA"
- [ ] Redireciona para IPAG

## 🔧 Comandos Úteis

### Testar API via JavaScript (Console do Navegador)
```javascript
// Verificar configuração
console.log('API URL:', API_BASE_URL);

// Testar endpoint
fetch('https://muzzajazz-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log);

// Verificar eventos
fetch('https://muzzajazz-production.up.railway.app/api/eventos')
  .then(r => r.json())
  .then(data => console.log('Eventos:', data));
```

### Verificar Logs Railway
```bash
# Se tiver Railway CLI instalado
railway logs --follow
```

## 🐛 Problemas Comuns

### ❌ Site não carrega
- Verificar se Hostinger está online
- Limpar cache do navegador (Ctrl+F5)

### ❌ API não responde
- Verificar se Railway está online
- Verificar URL da API no config.js

### ❌ Eventos não aparecem dourados
- Aguardar carregamento completo (até 10s)
- Verificar console por erros

### ❌ Admin não carrega reservas
- Verificar se Firebase está configurado
- Verificar credenciais no Railway

## 📱 Teste Mobile

### WhatsApp
- Enviar link do site via WhatsApp
- Testar reserva pelo WhatsApp WebView

### Responsividade
- Redimensionar janela do navegador
- Testar em diferentes tamanhos

## 🎯 Teste de Produção Completo

### Reserva Real
1. Fazer reserva com dados reais
2. Processar pagamento no IPAG
3. Verificar se aparece no admin
4. Confirmar webhook funcionando

### Sincronização
1. Alterar preço no admin
2. Aguardar 60 segundos
3. Verificar atualização no site

## 📊 Métricas de Sucesso

- **Tempo de carregamento**: < 3 segundos
- **Taxa de erro**: 0%
- **Responsividade**: Funciona em mobile
- **Pagamento**: Redireciona corretamente
- **Admin**: Todas as funções operacionais

---

**Status**: ⏳ Aguardando testes
**Última verificação**: Pendente