@echo off
echo ========================================
echo DEPLOY FINAL - MUZZA JAZZ CONFIGURADO
echo ========================================
echo.

echo URL Railway: https://muzzajazz-production.up.railway.app/api
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
echo 3. Renomeando login.html para index.html no admin...
if exist "deploy\admin-painel\login.html" (
    ren "deploy\admin-painel\login.html" "index.html"
    echo ✓ login.html renomeado para index.html
)

echo.
echo ========================================
echo PRONTO PARA UPLOAD!
echo ========================================
echo.
echo HOSTINGER:
echo - deploy\site-principal\     → muzzajazz.com.br/public_html/
echo - deploy\admin-painel\       → admin.muzzajazz.com.br/public_html/
echo.
echo URL Railway já configurada: https://muzzajazz-production.up.railway.app/api
echo.
pause