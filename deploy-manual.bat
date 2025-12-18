@echo off
echo 🚀 Deploy Manual - Bobo Validades
echo.

REM Verificar se há mudanças não commitadas
git status --porcelain > nul
if errorlevel 1 (
    echo ❌ Erro ao verificar status do Git
    pause
    exit /b 1
)

REM Mostrar status atual
echo 📋 Status atual do repositório:
git status --short

echo.
set /p commit_changes="Deseja fazer commit das mudanças? (s/n): "

if /i "%commit_changes%"=="s" (
    echo.
    set /p commit_msg="Digite a mensagem do commit: "
    if "%commit_msg%"=="" set commit_msg=feat: manual deploy update
    
    git add .
    git commit -m "%commit_msg%"
    
    echo.
    set /p push_changes="Deseja fazer push para GitHub? (s/n): "
    if /i "%push_changes%"=="s" (
        echo 📤 Enviando para GitHub...
        git push origin main
        if errorlevel 1 (
            echo ❌ Erro ao fazer push
            pause
            exit /b 1
        )
        echo ✅ Push realizado com sucesso
    )
)

echo.
echo 🔨 Fazendo build local...
call npm run build
if errorlevel 1 (
    echo ❌ Build falhou!
    pause
    exit /b 1
)

echo.
echo 🚀 Fazendo deploy para Vercel...
vercel --prod
if errorlevel 1 (
    echo ❌ Deploy falhou!
    pause
    exit /b 1
)

echo.
echo ✅ Deploy manual concluído com sucesso!
echo 🌐 URL: https://bobo-validades.vercel.app
echo.
pause