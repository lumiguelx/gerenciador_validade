#!/bin/bash

# 🚀 Script de Deploy - Bobo Validades
# Este script automatiza o processo de deploy

echo "🚀 Iniciando processo de deploy do Bobo Validades..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não está instalado. Por favor, instale o Git primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git encontrado${NC}"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado ($(node --version))${NC}"
echo ""

# Verificar se já existe repositório Git
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Repositório Git já existe${NC}"
    read -p "Deseja continuar? (s/n): " continue
    if [ "$continue" != "s" ]; then
        echo "Deploy cancelado."
        exit 0
    fi
else
    echo -e "${GREEN}✅ Inicializando novo repositório Git${NC}"
    git init
fi

echo ""
echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔨 Testando build..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou! Corrija os erros antes de continuar.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build bem-sucedido${NC}"
echo ""

# Solicitar URL do repositório
echo "📝 Configure seu repositório GitHub:"
echo "1. Acesse https://github.com/new"
echo "2. Crie um repositório PRIVADO chamado 'bobo-validades'"
echo "3. NÃO inicialize com README, .gitignore ou license"
echo ""
read -p "Cole a URL do seu repositório (ex: https://github.com/usuario/bobo-validades.git): " repo_url

if [ -z "$repo_url" ]; then
    echo -e "${RED}❌ URL do repositório não fornecida${NC}"
    exit 1
fi

echo ""
echo "📤 Preparando para enviar código..."

# Adicionar todos os arquivos
git add .

# Fazer commit
echo ""
read -p "Digite uma mensagem de commit (ou pressione Enter para usar padrão): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="feat: initial commit - Bobo Validades system"
fi

git commit -m "$commit_msg"

# Configurar branch main
git branch -M main

# Adicionar remote (verificar se já existe)
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' já existe, atualizando...${NC}"
    git remote set-url origin "$repo_url"
else
    git remote add origin "$repo_url"
fi

# Push para GitHub
echo ""
echo "🚀 Enviando código para GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Código enviado com sucesso para GitHub!${NC}"
    echo ""
    echo "🌐 Próximos passos para deploy no Vercel:"
    echo "1. Acesse https://vercel.com"
    echo "2. Faça login com sua conta GitHub"
    echo "3. Clique em 'New Project'"
    echo "4. Selecione o repositório 'bobo-validades'"
    echo "5. Configure as variáveis de ambiente:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "6. Clique em 'Deploy'"
    echo ""
    echo "📖 Consulte GIT_DEPLOY_GUIDE.md para instruções detalhadas"
    echo ""
    echo -e "${GREEN}🎉 Deploy preparado com sucesso!${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao enviar código para GitHub${NC}"
    echo "Verifique:"
    echo "- Se a URL do repositório está correta"
    echo "- Se você tem permissão para fazer push"
    echo "- Se suas credenciais Git estão configuradas"
    exit 1
fi
