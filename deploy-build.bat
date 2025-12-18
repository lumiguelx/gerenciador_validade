@echo off
echo Fazendo build local e deploy manual...
echo.
echo 1. Instalando dependencias
npm install
echo.
echo 2. Fazendo build do projeto
npm run build
echo.
echo 3. Deploy da pasta dist
vercel --prod dist
echo.
pause