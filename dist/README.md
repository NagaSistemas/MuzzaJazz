# Muzza Jazz Club - Distribuição para Hostinger

Versão otimizada para upload na Hostinger.

## Estrutura
```
dist/
├── index.html          # Página principal
├── .htaccess          # Configurações Apache
├── admin/             # Painel administrativo (13 arquivos)
├── css/               # Estilos (1 arquivo)
├── js/                # Scripts (6 arquivos)
└── images/            # Imagens (2 arquivos)
```

## Instruções de Upload

### 1. Acesso FTP/File Manager
- Acesse o painel da Hostinger
- Vá em File Manager ou use FTP

### 2. Upload dos Arquivos
- Faça upload de TODOS os arquivos desta pasta
- Mantenha a estrutura de pastas
- Substitua arquivos existentes se necessário

### 3. Permissões
- Arquivos: 644
- Pastas: 755

### 4. Backend API
O sistema usa a API hospedada no Railway:
- URL: https://muzzajazz-production.up.railway.app/api
- Já configurado nos arquivos JS

## Arquivos Incluídos

### Frontend (23 arquivos)
- 1 HTML principal
- 13 arquivos admin (HTML + JS)
- 1 CSS
- 6 JavaScript
- 2 imagens
- 1 .htaccess

### Não Incluído
- Backend (hospedado no Railway)
- node_modules
- Arquivos de desenvolvimento

## Funcionalidades
✅ Sistema de reservas online
✅ Painel administrativo completo
✅ Integração com Firebase via API
✅ Responsivo para mobile
✅ Otimizado para SEO

## Suporte
Para dúvidas sobre o sistema, consulte o README.md principal do projeto.

---
**Última atualização:** 2024
**Versão:** 1.2.0
