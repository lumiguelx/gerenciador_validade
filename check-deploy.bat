@echo off
echo Verificando status do deploy...
echo.
echo 1. Ultimo commit enviado:
git log --oneline -1
echo.
echo 2. Status do repositorio:
git status
echo.
echo 3. Verificar se o deploy automatico esta funcionando em:
echo https://vercel.com/lumiguelx/bobo-validades
echo.
echo 4. Site de producao:
echo https://bobo-validades.vercel.app/
echo.
pause