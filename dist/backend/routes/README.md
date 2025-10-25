# 📁 Rotas da API

## Estrutura

```
routes/
├── eventos.js    # Rotas para eventos especiais
├── precos.js     # Rotas para configuração de preços
└── README.md     # Este arquivo
```

## Rotas Disponíveis

### 🎵 Eventos (`/api/eventos`)
- `GET /` - Buscar todos os eventos
- `POST /` - Salvar evento
- `DELETE /:id` - Remover evento

### 💰 Preços (`/api/config/precos`)
- `GET /` - Buscar preços configurados
- `POST /` - Salvar preços

## Como Adicionar Novas Rotas

1. Crie arquivo em `routes/nome.js`
2. Exporte função que recebe `db`
3. Importe no `server.js`
4. Use com `app.use('/api/rota', require('./routes/nome')(db))`