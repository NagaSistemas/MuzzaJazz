# Muzza Jazz Club - Backend

## Configuração Inicial

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar Firebase:**
   - Criar projeto no Firebase Console
   - Gerar chave de serviço (Service Account Key)
   - Atualizar `.env` com as credenciais

3. **Configurar dados iniciais:**
```bash
node scripts/setup.js
```

4. **Iniciar servidor:**
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

## Endpoints da API

### Reservas
- `POST /api/reservas` - Criar reserva
- `GET /api/reservas` - Listar reservas
- `PUT /api/reservas/:id/status` - Atualizar status

### Admin
- `POST /api/admin/login` - Login admin
- `GET /api/admin/dashboard` - Métricas
- `GET /api/admin/mesas` - Listar mesas
- `POST /api/admin/mesas` - Criar mesa

### Configurações
- `GET /api/config/precos/:data?` - Obter preços
- `POST /api/config/precos` - Salvar preços
- `GET /api/config/capacidade/:data?` - Obter capacidade

### Webhook
- `POST /api/webhook/nagapay` - Webhook pagamentos

## Estrutura do Banco (Firebase)

### Coleções:
- `admins` - Usuários administrativos
- `reservas` - Reservas dos clientes
- `mesas` - Configuração de mesas
- `configuracoes` - Preços e configurações
- `eventos` - Eventos especiais

## Login Padrão
- **Usuário:** admin
- **Senha:** muzza2023