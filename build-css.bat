@echo off
echo 🎨 Gerando CSS do Tailwind...

REM Verificar se Tailwind está instalado
if not exist node_modules\tailwindcss (
    echo ❌ Tailwind não encontrado! Instalando...
    npm install -D tailwindcss
)

REM Gerar CSS
echo 📦 Compilando CSS...
node node_modules\tailwindcss\lib\cli.js -i src/input.css -o css/tailwind.css

echo ✅ CSS gerado em css/tailwind.css
pause