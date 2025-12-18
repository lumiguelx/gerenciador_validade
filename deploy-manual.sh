#!/bin/bash

# 🚀 Deploy Manual - Bobo Validades

echo "🚀 Deploy Manual - Bobo Validades"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}📋 Há mudanças não commitadas:${NC}"
    git status --short
    echo ""
    read -p "Deseja fazer commit das mudanças? (s/n): " commit_changes
    
    if [ "$commit_changes" = "s" ]; then
        read -p "Digite a mensagem do commit: " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: manual deploy update"
        fi
        
        git add .
        git commit -m "$commit_msg"
        
        echo ""
        read -p "Deseja fazer push para GitHub? (s/n): " push_changes
        if [ "$push_changes" = "s" ]; then
            echo -e "${YELLOW}📤 Enviando para GitHub...${NC}"
            git push origin main
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Push realizado com sucesso${NC}"
            else
                echo -e "${RED}❌ Erro ao fazer push${NC}"
                exit 1
            fi
        fi
    fi
else
    echo -e "${GREEN}✅ Repositório está limpo${NC}"
fi

echo ""
echo -e "${YELLOW}🔨 Fazendo build local...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Fazendo deploy para Vercel...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy manual concluído com sucesso!${NC}"
    echo -e "${GREEN}🌐 URL: https://bobo-validades.vercel.app${NC}"
else
    echo -e "${RED}❌ Deploy falhou!${NC}"
    exit 1
fi