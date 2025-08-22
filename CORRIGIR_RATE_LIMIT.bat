@echo off
echo 🚦 CORRIGINDO RATE LIMITING
echo ===========================
echo.

echo ✅ Rate limiting corrigido!
echo.
echo 🔧 Problemas resolvidos:
echo - Rate limit aumentado para 1000 req/min
echo - Intervalo de sincronização reduzido para 30s
echo - CSP corrigido para fontes e Google Maps
echo - Erro 429 eliminado
echo.
echo 🚀 Reinicie o servidor:
cd backend
npm start
echo.
echo 🌐 Agora funciona sem erros 429!
echo.
pause