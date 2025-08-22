@echo off
echo 🎵 Iniciando Muzza Jazz Server...
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Instalar dependências se não existirem
if not exist node_modules (
    echo 📦 Instalando dependências...
    npm install express
)

REM Iniciar o servidor
echo 🚀 Iniciando servidor...
node server-simple.js

pause