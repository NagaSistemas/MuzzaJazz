@echo off
echo ========================================
echo PREPARANDO DEPLOY PARA PRODUCAO
echo ========================================
echo.

echo 1. Criando pasta de deploy...
if exist "deploy" rmdir /s /q deploy
mkdir deploy
mkdir deploy\frontend
mkdir deploy\backend

echo.
echo 2. Copiando arquivos do FRONTEND...
xcopy /E /I /Y "admin" "deploy\frontend\admin"
xcopy /E /I /Y "css" "deploy\frontend\css"
xcopy /E /I /Y "js" "deploy\frontend\js"
xcopy /E /I /Y "images" "deploy\frontend\images"
copy "index.html" "deploy\frontend\"
copy "*.md" "deploy\frontend\" 2>nul

echo.
echo 3. Copiando arquivos do BACKEND...
xcopy /E /I /Y "backend" "deploy\backend"

echo.
echo 4. Criando arquivo de configuracao...
echo // CONFIGURE ESTA URL APOS DEPLOY NO RAILWAY > deploy\frontend\js\config-production.js
echo const API_CONFIG = { >> deploy\frontend\js\config-production.js
echo     production: 'https://SEU-BACKEND-RAILWAY.up.railway.app/api' >> deploy\frontend\js\config-production.js
echo }; >> deploy\frontend\js\config-production.js

echo.
echo ========================================
echo ARQUIVOS PREPARADOS!
echo ========================================
echo.
echo FRONTEND: deploy\frontend\ (upload para Hostinger)
echo BACKEND: deploy\backend\ (upload para Railway)
echo.
echo PROXIMOS PASSOS:
echo 1. Deploy backend no Railway
echo 2. Copie a URL gerada
echo 3. Edite js\config.js com a URL
echo 4. Upload frontend para Hostinger
echo.
pause