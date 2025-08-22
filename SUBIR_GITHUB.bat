@echo off
echo ========================================
echo SUBINDO MUZZA JAZZ PARA GITHUB
echo ========================================
echo.

echo Repositorio: https://github.com/NagaSistemas/MuzzaJazz
echo.

echo 1. Inicializando Git...
git init

echo.
echo 2. Adicionando arquivos...
git add .

echo.
echo 3. Fazendo commit...
git commit -m "Projeto Muzza Jazz - Configuracao para producao"

echo.
echo 4. Configurando branch main...
git branch -M main

echo.
echo 5. Adicionando repositorio remoto...
git remote add origin https://github.com/NagaSistemas/MuzzaJazz.git

echo.
echo 6. Fazendo push...
git push -u origin main

echo.
echo ========================================
echo PROJETO ENVIADO PARA GITHUB!
echo ========================================
echo.
echo Proximo passo:
echo 1. Conecte o repositorio no Railway
echo 2. Railway fara deploy automatico
echo 3. Execute DEPLOY_FINAL.bat
echo 4. Upload frontend para Hostinger
echo.
pause