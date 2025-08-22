# Configuração Firebase

## Service Account

Para conectar ao Firebase, coloque o arquivo `serviceAccountKey.json` nesta pasta.

### Como obter:

1. Vá no Console Firebase: https://console.firebase.google.com/
2. Selecione seu projeto: **muzza-2fb33**
3. Vá em "Configurações do projeto" (ícone engrenagem)
4. Aba "Contas de serviço"
5. Clique em "Gerar nova chave privada"
6. Salve o arquivo como `serviceAccountKey.json` nesta pasta

### Estrutura esperada:
```
backend/firebase/
├── init.js
├── config.js
├── mock.js
├── serviceAccountKey.json  ← Coloque aqui
└── README.md
```

### Firestore Rules

Configure as regras no Console Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```