@echo off
echo 🎷 MUZZA JAZZ CLUB - INICIANDO SISTEMA
echo =====================================
echo.

echo 📦 1. Instalando dependências...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Erro na instalação
    pause
    exit /b 1
)

echo.
echo 🔧 2. Configurando banco de dados...
call node scripts/setup.js
if errorlevel 1 (
    echo ❌ Erro no setup
    pause
    exit /b 1
)

echo.
echo 🚀 3. Iniciando servidor...
echo.
echo ✅ Sistema pronto!
echo 🌐 Site: http://localhost:3001
echo 🔐 Admin: http://localhost:3001/admin
echo 👤 Login: admin / Senha: muzza2023
echo.
call npm start