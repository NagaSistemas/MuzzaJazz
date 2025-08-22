@echo off
echo 🎷 Iniciando Muzza Jazz Club - Servidor de Desenvolvimento
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale em: https://nodejs.org
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist node_modules (
    echo 📦 Instalando dependências...
    npm install express cors
)

REM Iniciar servidor
echo 🚀 Iniciando servidor...
echo.
node server-dev.js

pause