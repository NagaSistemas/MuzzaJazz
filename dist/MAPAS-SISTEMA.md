# Sistema de Mapas de Mesas - Muzza Jazz

## Funcionalidades Implementadas

### Admin (Dashboard)
✅ Upload de imagens para Firebase Storage
✅ Preview das imagens antes de salvar
✅ Suporte para Área Interna e Externa
✅ Limite de 5MB por arquivo
✅ Formatos aceitos: JPG, PNG, GIF

### Cliente (Site de Reservas)
✅ Botão "Ver Mapa" ao selecionar área
✅ Modal com imagem em tela cheia
✅ Botão X no canto superior direito para fechar
✅ Fechar ao clicar fora do modal
✅ Carregamento automático dos mapas do Firebase

## Como Usar

### Admin - Fazer Upload dos Mapas

1. Acesse o painel admin: `/admin/login.html`
2. Vá em **Configurações** > **Mapas**
3. Clique em "Escolher arquivo" para cada área
4. Selecione a imagem do mapa (máx 5MB)
5. Visualize o preview
6. Clique em "Salvar Mapas"

### Cliente - Visualizar Mapas

1. Acesse o formulário de reserva
2. Selecione uma **Data**
3. Selecione uma **Área** (Interna ou Externa)
4. O campo "Número da Mesa" aparecerá
5. Clique no botão **"Ver Mapa"**
6. O mapa abrirá em modal
7. Clique no **X** ou fora do modal para fechar

## Arquitetura Técnica

### Backend
- **Rota**: `/api/storage/upload-mapa`
- **Método**: POST (multipart/form-data)
- **Biblioteca**: Multer
- **Storage**: Firebase Storage
- **Permissões**: Público (leitura)

### Frontend Admin
- **Arquivo**: `admin/dashboard.html`
- **Script**: `admin/dashboard.js`
- **Upload**: FormData com fetch API

### Frontend Cliente
- **Arquivo**: `index.html`
- **Script**: `js/mapas-viewer.js`
- **Modal**: Tailwind CSS + JavaScript

## Estrutura Firebase

### Storage
```
/mapas
  ├── interno-{timestamp}.jpg
  └── externo-{timestamp}.jpg
```

### Firestore
```
/config/mapas
  ├── mapaInterno: "https://storage.googleapis.com/..."
  └── mapaExterno: "https://storage.googleapis.com/..."
```

## Variáveis de Ambiente (Railway)

Certifique-se de que está configurado:
- ✅ `FIREBASE_STORAGE_BUCKET` = `muzza-2fb33.firebasestorage.app`

## Dependências

### Backend
```json
{
  "multer": "^2.0.2",
  "firebase-admin": "^12.0.0"
}
```

## Fluxo de Dados

1. **Admin faz upload** → Multer processa → Firebase Storage salva
2. **Firebase Storage** → Retorna URL pública
3. **Backend salva URL** → Firestore `/config/mapas`
4. **Cliente carrega** → Fetch da API → Exibe no modal

## Segurança

- ✅ Validação de tipo de arquivo (apenas imagens)
- ✅ Limite de tamanho (5MB)
- ✅ URLs públicas (somente leitura)
- ✅ Autenticação admin para upload

## Melhorias Futuras

- [ ] Compressão automática de imagens
- [ ] Crop/resize antes do upload
- [ ] Histórico de versões dos mapas
- [ ] Zoom na imagem do modal
- [ ] Download do mapa em PDF
