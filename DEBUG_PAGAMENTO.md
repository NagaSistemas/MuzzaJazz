# 🔍 Debug Pagamento IPAG

## ✅ APIs Online Confirmadas
- Health: ✅ 
- Eventos: ✅
- Preços: ✅

## 🧪 Próximos Testes

### 1. Testar Endpoint IPAG
```bash
curl -X POST https://muzzajazz-production.up.railway.app/api/ipag/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "reserva": {
      "id": "test123",
      "nome": "Teste",
      "whatsapp": "(62) 99999-9999",
      "data": "2024-12-25",
      "adultos": 2,
      "criancas": 0,
      "area": "interna",
      "valor": 100
    }
  }'
```

### 2. Verificar Console do Site
1. Abrir: https://muzzajazz.com.br
2. F12 → Console
3. Verificar se `API_BASE_URL` está correto
4. Tentar fazer reserva e ver erros

### 3. Verificar Logs Railway
```bash
railway logs --follow
```

## 🔧 Possíveis Problemas

### A. Credenciais IPAG
- Verificar se são de produção
- Testar com Postman/Insomnia

### B. CORS
- Verificar se muzzajazz.com.br está liberado

### C. Firebase
- Verificar variáveis de ambiente no Railway

## 📋 Checklist Debug
- [ ] Endpoint `/api/ipag/create-payment` responde
- [ ] Console do site sem erros
- [ ] Logs do Railway mostram requisição
- [ ] Credenciais IPAG válidas