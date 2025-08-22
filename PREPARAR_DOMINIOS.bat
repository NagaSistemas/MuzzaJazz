@echo off
echo ========================================
echo PREPARANDO DEPLOY PARA DOMINIOS MUZZA JAZZ
echo ========================================
echo.

echo Criando estrutura para:
echo - Site: https://muzzajazz.com.br
echo - Admin: https://admin.muzzajazz.com.br
echo.

if exist "deploy" rmdir /s /q deploy
mkdir deploy
mkdir deploy\site-principal
mkdir deploy\admin-painel
mkdir deploy\backend

echo.
echo 1. Preparando SITE PRINCIPAL (muzzajazz.com.br)...
copy "index.html" "deploy\site-principal\"
xcopy /E /I /Y "css" "deploy\site-principal\css"
xcopy /E /I /Y "js" "deploy\site-principal\js"
xcopy /E /I /Y "images" "deploy\site-principal\images"

echo.
echo 2. Preparando ADMIN PAINEL (admin.muzzajazz.com.br)...
xcopy /E /I /Y "admin\*" "deploy\admin-painel\"
xcopy /E /I /Y "css" "deploy\admin-painel\css"
xcopy /E /I /Y "js" "deploy\admin-painel\js"

echo.
echo 3. Preparando BACKEND (Railway)...
xcopy /E /I /Y "backend" "deploy\backend"

echo.
echo ========================================
echo ARQUIVOS PREPARADOS!
echo ========================================
echo.
echo ESTRUTURA CRIADA:
echo.
echo deploy\site-principal\     → Upload para muzzajazz.com.br
echo deploy\admin-painel\       → Upload para admin.muzzajazz.com.br  
echo deploy\backend\            → Upload para Railway
echo.
echo PROXIMOS PASSOS:
echo 1. Deploy backend no Railway
echo 2. Edite js\config.js com URL do Railway
echo 3. Upload site-principal para muzzajazz.com.br
echo 4. Upload admin-painel para admin.muzzajazz.com.br
echo.
pause