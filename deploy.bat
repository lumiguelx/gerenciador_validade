@echo off
echo 🚀 Deploy Bobo Validades - Windows
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado. Por favor, instale o Git primeiro.
    pause
    exit /b 1
)
echo ✅ Git encontrado

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 📦 Instalando dependências...
call npm install

echo.
echo 🔨 Testando build...
call npm run build
if errorlevel 1 (
    echo ❌ Build falhou! Corrija os erros antes de continuar.
    pause
    exit /b 1
)
echo ✅ Build bem-sucedido

echo.
echo 📝 Configure seu repositório GitHub:
echo 1. Acesse https://github.com/new
echo 2. Crie um repositório PRIVADO chamado 'bobo-validades'
echo 3. NÃO inicialize com README, .gitignore ou license
echo.
set /p repo_url="Cole a URL do seu repositório: "

if "%repo_url%"=="" (
    echo ❌ URL do repositório não fornecida
    pause
    exit /b 1
)

echo.
echo 📤 Preparando para enviar código...

REM Verificar se já é um repositório Git
if not exist ".git" (
    echo ✅ Inicializando repositório Git
    git init
)

REM Adicionar todos os arquivos
git add .

REM Fazer commit
set /p commit_msg="Digite uma mensagem de commit (ou pressione Enter para usar padrão): "
if "%commit_msg%"=="" set commit_msg=feat: initial commit - Bobo Validades system

git commit -m "%commit_msg%"

REM Configurar branch main
git branch -M main

REM Adicionar remote
git remote remove origin >nul 2>&1
git remote add origin %repo_url%

REM Push para GitHub
echo.
echo 🚀 Enviando código para GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Erro ao enviar código para GitHub
    echo Verifique:
    echo - Se a URL do repositório está correta
    echo - Se você tem permissão para fazer push
    echo - Se suas credenciais Git estão configuradas
    pause
    exit /b 1
)

echo.
echo ✅ Código enviado com sucesso para GitHub!
echo.
echo 🌐 Próximos passos para deploy no Vercel:
echo 1. Acesse https://vercel.com
echo 2. Faça login com sua conta GitHub
echo 3. Clique em 'New Project'
echo 4. Selecione o repositório 'bobo-validades'
echo 5. Configure as variáveis de ambiente:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo 6. Clique em 'Deploy'
echo.
echo 📖 Consulte GIT_DEPLOY_GUIDE.md para instruções detalhadas
echo.
echo 🎉 Deploy preparado com sucesso!
echo.
pause