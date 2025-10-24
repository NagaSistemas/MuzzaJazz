# Muzza Jazz Club

**Jazz da Floresta - Para quem ama Jazz. Para quem vai amar.**

## Sobre o Projeto

O Muzza Jazz Club é uma plataforma completa de reservas online para um clube de jazz localizado em meio à natureza, em Pirenópolis, Goiás. O sistema combina a elegância do jazz com tecnologia moderna, oferecendo experiência completa de reservas e gestão administrativa.

## Estrutura do Projeto

```
Muzza Jazz/
├── index.html              # Site principal
├── server.js               # Servidor principal (proxy)
├── package.json            # Dependências do projeto
├── admin/                  # Painel administrativo
│   ├── login.html         # Login do admin
│   ├── dashboard.html     # Dashboard principal
│   ├── dashboard.js       # Lógica do admin
│   └── calendar-admin.js  # Calendário administrativo
├── backend/               # API Backend
│   ├── server.js         # Servidor Node.js + Express
│   ├── package.json      # Dependências backend
│   └── routes/           # Rotas da API
│       ├── eventos.js    # Gestão de eventos
│       ├── precos.js     # Configuração de preços
│       ├── reservas.js   # Sistema de reservas
│       └── mesas.js      # Controle de mesas
├── css/
│   └── styles.css        # Estilos customizados
├── js/
│   ├── main.js          # JavaScript principal
│   └── calendar.js      # Calendário de reservas
├── images/              # Imagens do site
│   ├── logo.jpg
│   ├── ambiente-*.jpg
│   ├── carrossel-*.jpg
│   └── ...
└── README.md           # Este arquivo
```

## Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos customizados com variáveis CSS
- **JavaScript ES6+** - Interatividade e funcionalidades
- **Tailwind CSS** - Framework CSS utilitário
- **Font Awesome** - Ícones
- **Glider.js** - Carrossel de imagens
- **Google Fonts** - Tipografia (Playfair Display, Raleway)
- **jsPDF** - Geração de relatórios em PDF

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Firebase Admin SDK** - Banco de dados
- **CORS** - Controle de acesso

### Banco de Dados
- **Firebase Firestore** - Banco NoSQL em tempo real
- **Collections**: reservas, eventos, mesas, precos

## Funcionalidades

### 🎵 Site Principal
- **Hero Section** - Apresentação impactante
- **Sistema de Reservas** - Formulário completo com validações
- **Calendário Interativo** - Seleção de datas disponíveis
- **Cálculo Automático** - Preços dinâmicos por área e data
- **Controle de Capacidade** - Baseado em mesas cadastradas
- **Validação em Tempo Real** - Verificação de disponibilidade
- **Design Responsivo** - Otimizado para todos os dispositivos

### 🎛️ Painel Administrativo
- **Dashboard Completo** - Métricas em tempo real
- **Gestão de Reservas** - Visualizar, filtrar e gerenciar
- **Sistema de Reembolsos** - Controle de status de pagamento
- **Relatórios Financeiros** - Análises detalhadas com export PDF
- **Configuração de Preços** - Preços por área e eventos especiais
- **Gestão de Mesas** - Controle de capacidade por área
- **Eventos Especiais** - Preços customizados por data
- **Sistema NagaPay** - Controle de recebíveis

### 🔧 Sistema Backend
- **API RESTful** - Endpoints organizados
- **Integração Firebase** - Sincronização em tempo real
- **Validações** - Controle de dados e segurança
- **Logs Detalhados** - Monitoramento de operações

## Paleta de Cores

- **Dourado Muzza**: `#D4AF37` - Cor principal, elegância
- **Borgonha**: `#8B0000` - Sofisticação
- **Escuro Muzza**: `#1A120B` - Background principal
- **Madeira**: `#5D4037` - Elementos naturais
- **Creme**: `#F5F5DC` - Textos e contrastes

## Credenciais de Acesso

### Painel Administrativo
- **URL**: `/admin/login.html`
- **Usuário**: `admin`
- **Senha**: `muzza2024`

## Como Executar

### 1. Instalar Dependências
```bash
# Dependências principais
npm install

# Dependências do backend
cd backend
npm install
cd ..
```

### 2. Executar Servidores
```bash
# Terminal 1: Servidor principal (porta 3000)
npm start

# Terminal 2: API Backend (porta 3001)
cd backend
npm start
```

### 3. Acessar Sistema
- **Site**: `http://localhost:3000`
- **Admin**: `http://localhost:3000/admin/login.html`
- **API**: `http://localhost:3001/api/`

## Estrutura da API

### Endpoints Principais
- `GET/POST /api/reservas` - Gestão de reservas
- `GET/POST /api/eventos` - Eventos especiais
- `GET/POST /api/mesas` - Controle de mesas
- `GET/POST /api/config/precos` - Configuração de preços
- `GET /api/mesas/capacidade/:data` - Verificar disponibilidade

## Banco de Dados Firebase

### Collections
- **reservas** - Dados das reservas dos clientes
- **eventos** - Eventos especiais com preços customizados
- **mesas** - Controle de capacidade por área
- **precos** - Configurações de preços padrão

## Recursos Implementados

- ✅ Sistema completo de reservas online
- ✅ Painel administrativo funcional
- ✅ Integração com Firebase
- ✅ Controle de capacidade por mesas
- ✅ Relatórios financeiros com PDF
- ✅ Sistema de reembolsos
- ✅ Eventos especiais
- ✅ Design responsivo
- ✅ Validações em tempo real
- ✅ Sistema de recebíveis

## Próximos Passos

- [ ] Integração com iPag (sistema de pagamento)
- [ ] Notificações por email
- [ ] Sistema de newsletter
- [ ] Otimização SEO
- [ ] PWA (Progressive Web App)
- [ ] Backup automático

## Contato

**Muzza Jazz Club**
- 📍 Rodovia GO 225, KM 02 - IPEC, Goiás
- 📱 WhatsApp: +55 62 99838-0208
- 🌐 [Ver no Maps](https://maps.app.goo.gl/hfSYWpn6ngNRAhNfA)

---

*"Aprecie a vida" é nosso único pré-requisito*