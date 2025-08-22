@echo off
echo 🎷 Iniciando Muzza Jazz Backend...
echo.

cd backend

echo 📦 Instalando dependências...
npm install

echo.
echo 🔧 Executando setup inicial...
node scripts/setup.js

echo.
echo 🚀 Iniciando servidor...
npm start