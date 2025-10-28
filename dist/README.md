# Muzza Jazz Club - Distribuição

Versão de produção do sistema Muzza Jazz Club.

## Última Atualização
- **Data**: 2024
- **Versão**: 1.1.0
- **Correções**: Pre-reserva agora bloqueia mesas corretamente

## Estrutura
```
dist/
├── index.html          # Site principal
├── server.js           # Servidor proxy
├── package.json        # Dependências
├── admin/              # Painel administrativo
├── backend/            # API Backend
├── css/                # Estilos
├── js/                 # Scripts
└── images/             # Imagens
```

## Deploy
1. Instalar dependências: `npm install`
2. Instalar backend: `cd backend && npm install`
3. Iniciar servidor: `npm start`
4. Iniciar backend: `cd backend && npm start`

## Portas
- Frontend: 3000
- Backend API: 3001
