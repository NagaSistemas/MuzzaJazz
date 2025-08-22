@echo off
echo 🎷 Instalando dependências do Muzza Jazz Backend...
echo.

cd backend
npm install

echo.
echo ✅ Dependências instaladas!
echo.
echo 📋 Próximos passos:
echo 1. Configure o arquivo .env com suas credenciais Firebase
echo 2. Execute: node scripts/setup.js
echo 3. Execute: npm start
echo.
pause