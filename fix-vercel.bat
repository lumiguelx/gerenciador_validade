@echo off
echo Reconfigurando Vercel CLI...
echo.
echo 1. Fazendo logout do Vercel CLI
vercel logout
echo.
echo 2. Fazendo login novamente
vercel login
echo.
echo 3. Vinculando projeto novamente
vercel link --yes
echo.
echo 4. Fazendo deploy
vercel --prod
echo.
pause