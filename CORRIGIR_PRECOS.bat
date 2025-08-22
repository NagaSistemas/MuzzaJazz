@echo off
echo ========================================
echo CORRIGINDO SISTEMA DE PRECOS - MUZZA JAZZ
echo ========================================
echo.

echo 1. Parando servidores existentes...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Iniciando backend Firebase (porta 3002)...
cd backend
start "Backend Firebase" cmd /k "node server.js"
timeout /t 3 >nul

echo.
echo 3. Iniciando servidor principal (porta 3001)...
cd ..
start "Servidor Principal" cmd /k "node server.js"
timeout /t 3 >nul

echo.
echo 4. Testando APIs...
echo Testando API de precos...
curl -s http://localhost:3001/api/config/precos > nul
if %errorlevel% equ 0 (
    echo ✓ API de precos funcionando
) else (
    echo ✗ Erro na API de precos
)

echo.
echo 5. Abrindo sistema...
start http://localhost:3001
start http://localhost:3001/admin/login.html

echo.
echo ========================================
echo SISTEMA CORRIGIDO E INICIADO!
echo ========================================
echo.
echo Site: http://localhost:3001
echo Admin: http://localhost:3001/admin/login.html
echo.
echo INSTRUCOES:
echo 1. Acesse o admin e configure os precos
echo 2. Os precos agora serao salvos no Firebase
echo 3. O site carregara os precos da API automaticamente
echo 4. Nao havera mais conflitos entre localStorage e Firebase
echo.
pause