@echo off
echo ========================================
echo    MUZZA JAZZ CLUB - INICIALIZACAO
echo ========================================
echo.
echo Instalando dependencias...
call npm install
echo.
echo Iniciando servidor na porta 3001...
echo.
echo Frontend: http://localhost:3001
echo Admin: http://localhost:3001/admin/login.html
echo.
echo Credenciais Admin:
echo Usuario: admin
echo Senha: muzza2024
echo.
echo ========================================
node server.js