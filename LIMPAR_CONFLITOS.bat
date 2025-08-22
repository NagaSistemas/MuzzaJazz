@echo off
echo Limpando conflitos de merge...

powershell -Command "(Get-Content 'index.html') -replace '<<<<<<< HEAD.*?>>>>>>> [a-f0-9]+', '' | Set-Content 'index.html'"

echo Conflitos removidos!
pause