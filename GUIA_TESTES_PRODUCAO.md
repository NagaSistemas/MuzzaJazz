# 🧪 Guia de Testes - Muzza Jazz (Produção)

## 📋 Configuração Atual
- **Frontend**: Hostinger (muzzajazz.com.br)
- **Backend**: Railway (muzzajazz-production.up.railway.app)
- **Detecção Automática**: Sistema detecta ambiente por domínio

## 🔧 URLs de Teste

### Frontend (Hostinger)
- **Site Principal**: https://muzzajazz.com.br
- **Admin Login**: https://muzzajazz.com.br/admin/login.html
- **Dashboard**: https://muzzajazz.com.br/admin/dashboard.html

### Backend (Railway)
- **API Base**: https://muzzajazz-production.up.railway.app/api
- **Health Check**: https://muzzajazz-production.up.railway.app/api/health

## 🧪 Roteiro de Testes

### 1. Teste de Conectividade
```bash
# Verificar se API está online
curl https://muzzajazz-production.up.railway.app/api/health

# Verificar eventos
curl https://muzzajazz-production.up.railway.app/api/eventos

# Verificar preços
curl https://muzzajazz-production.up.railway.app/api/config/precos
```

### 2. Teste do Site Principal

#### ✅ Carregamento Inicial
- [ ] Site carrega corretamente
- [ ] Preços são exibidos (R$ 35/50)
- [ ] Calendário renderiza
- [ ] Eventos especiais aparecem dourados

#### ✅ Sistema de Reservas
- [ ] Preencher nome e WhatsApp
- [ ] Selecionar data no calendário
- [ ] Escolher área (interna/externa)
- [ ] Ajustar quantidade de pessoas
- [ ] Verificar cálculo do total
- [ ] Submeter formulário
- [ ] Redirecionamento para IPAG

### 3. Teste do Painel Admin

#### ✅ Login
- **URL**: https://muzzajazz.com.br/admin/login.html
- **Usuário**: `admin`
- **Senha**: `muzza2024`

#### ✅ Dashboard
- [ ] Carregamento das reservas
- [ ] Filtro por status (apenas "pago")
- [ ] Métricas atualizadas
- [ ] Gráficos funcionando

#### ✅ Gestão de Eventos
- [ ] Criar evento especial
- [ ] Definir preços customizados
- [ ] Salvar e verificar no site
- [ ] Calendário atualiza automaticamente

#### ✅ Configuração de Preços
- [ ] Alterar preços padrão
- [ ] Salvar configurações
- [ ] Verificar atualização no site

### 4. Teste de Pagamento IPAG

#### ✅ Fluxo Completo
1. **Criar Reserva**:
   - Preencher formulário
   - Clicar "CONCLUIR RESERVA"
   - Verificar redirecionamento

2. **Pagamento IPAG**:
   - Tela de pagamento carrega
   - Dados da reserva corretos
   - Processar pagamento teste

3. **Webhook**:
   - Status atualizado no Firebase
   - Reserva aparece no admin

### 5. Teste de Sincronização

#### ✅ Admin ↔ Site
- [ ] Alterar preço no admin
- [ ] Verificar atualização no site (60s)
- [ ] Criar evento no admin
- [ ] Verificar no calendário do site

#### ✅ Cache e Fallback
- [ ] Desconectar internet
- [ ] Site usa cache local
- [ ] Reconectar e sincronizar

## 🐛 Problemas Comuns e Soluções

### 1. API não responde (Cannot GET /api/health)
```javascript
// Verificar no console do navegador
console.log('API Base URL:', API_BASE_URL);
```
**Soluções**:
- Verificar se Railway está online
- Fazer redeploy no Railway
- Verificar variáveis de ambiente
- Verificar logs: `railway logs --follow`

### 2. Eventos não aparecem dourados
```javascript
// Forçar atualização visual
window.forcarAtualizacaoEventos();
```
**Solução**: Aguardar carregamento completo

### 3. Pagamento não redireciona
- Verificar credenciais IPAG
- Verificar webhook configurado
- Verificar logs do Railway

### 4. Admin não carrega reservas
- Verificar filtro de status
- Verificar conexão Firebase
- Verificar console de erros

## 📊 Monitoramento

### Logs do Railway
```bash
# Acessar logs em tempo real
railway logs --follow
```

### Console do Navegador
```javascript
// Verificar configuração
console.log('Ambiente:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('API URL:', API_BASE_URL);

// Verificar eventos carregados
console.log('Eventos:', window.eventosEspeciais);

// Verificar preços
console.log('Preços:', precosAtuais);
```

## 🔄 Atualizações

### Frontend (Hostinger)
1. Upload dos arquivos via FTP/cPanel
2. Verificar cache do navegador (Ctrl+F5)
3. Testar em modo anônimo

### Backend (Railway)
1. Push para repositório Git
2. Deploy automático
3. Verificar logs de deploy

## 📱 Teste em Dispositivos

### Desktop
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] WhatsApp WebView

## 🚨 Checklist Final

### Antes de Liberar
- [ ] Todos os testes passaram
- [ ] Pagamento IPAG funcionando
- [ ] Admin acessível
- [ ] Eventos especiais visíveis
- [ ] Responsividade OK
- [ ] Performance aceitável

### Pós-Deploy
- [ ] Monitorar logs por 1 hora
- [ ] Testar reserva real
- [ ] Verificar webhook IPAG
- [ ] Confirmar sincronização admin

## 📞 Contatos de Emergência

- **IPAG Suporte**: suporte@ipag.com.br
- **Railway Status**: https://railway.app/status
- **Hostinger Suporte**: Via painel de controle

---

**Última atualização**: $(date)
**Versão**: 1.0