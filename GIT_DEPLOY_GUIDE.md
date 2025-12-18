# 🚀 Guia de Deploy - Bobo Validades

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Vercel
- Git instalado no seu computador
- Node.js instalado

## 🔧 Passo 1: Preparar o Projeto

### 1.1 Verificar se o .gitignore está correto
```bash
# Verificar se existe o arquivo .gitignore
cat .gitignore
```

### 1.2 Instalar dependências (se necessário)
```bash
npm install
```

### 1.3 Testar build local
```bash
npm run build
```

## 📦 Passo 2: Criar Repositório no GitHub

### 2.1 Acessar GitHub
1. Vá para https://github.com
2. Clique em "New repository" (botão verde)
3. Configure:
   - **Repository name**: `bobo-validades`
   - **Description**: `Sistema de Controle de Validades - Gestão de Produtos`
   - **Visibility**: ✅ Private (repositório privado)
   - **Initialize**: ❌ NÃO marcar nenhuma opção (README, .gitignore, license)
4. Clique em "Create repository"

### 2.2 Copiar URL do repositório
Após criar, copie a URL que aparece (algo como):
```
https://github.com/SEU_USUARIO/bobo-validades.git
```

## 🔄 Passo 3: Inicializar Git e Fazer Push

### 3.1 Abrir terminal na pasta do projeto
```bash
# Navegar até a pasta do projeto
cd caminho/para/seu/projeto
```

### 3.2 Inicializar Git
```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: initial commit - Bobo Validades system"

# Renomear branch para main
git branch -M main

# Adicionar repositório remoto (substitua pela SUA URL)
git remote add origin https://github.com/SEU_USUARIO/bobo-validades.git

# Fazer push inicial
git push -u origin main
```

## 🌐 Passo 4: Deploy no Vercel

### 4.1 Acessar Vercel
1. Vá para https://vercel.com
2. Faça login com sua conta GitHub

### 4.2 Importar Projeto
1. Clique em "New Project"
2. Selecione "Import Git Repository"
3. Encontre seu repositório `bobo-validades`
4. Clique em "Import"

### 4.3 Configurar Deploy
1. **Framework Preset**: Vite (deve detectar automaticamente)
2. **Root Directory**: `.` (raiz do projeto)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 4.4 Configurar Variáveis de Ambiente
1. Na seção "Environment Variables", adicione:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

**⚠️ IMPORTANTE**: Use as mesmas variáveis do seu projeto atual!

### 4.5 Fazer Deploy
1. Clique em "Deploy"
2. Aguarde o build completar (2-3 minutos)
3. Seu projeto estará disponível em uma URL como: `https://bobo-validades-xxx.vercel.app`

## 🔄 Passo 5: Substituir Projeto Existente no Vercel

### 5.1 Se você já tem um projeto no Vercel:
1. Vá para o dashboard do Vercel
2. Encontre seu projeto antigo
3. Clique em "Settings"
4. Vá para "Git"
5. Clique em "Disconnect" para desconectar o repositório antigo
6. Conecte o novo repositório `bobo-validades`

### 5.2 Ou deletar projeto antigo:
1. Vá para "Settings" > "Advanced"
2. Clique em "Delete Project"
3. Confirme a exclusão
4. Crie um novo projeto seguindo o Passo 4

## 🔧 Passo 6: Configurações Adicionais

### 6.1 Domínio Personalizado (Opcional)
1. No Vercel, vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### 6.2 Configurar Redirects (se necessário)
Criar arquivo `vercel.json` na raiz:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📱 Passo 7: Testar Deploy

### 7.1 Verificar funcionalidades:
- ✅ Login/Cadastro
- ✅ Adicionar produtos
- ✅ Filtros e busca
- ✅ Exportar PDF
- ✅ Painel admin (se aplicável)

### 7.2 Verificar responsividade:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔄 Passo 8: Workflow de Desenvolvimento

### 8.1 Para futuras atualizações:
```bash
# Fazer alterações no código
# Adicionar arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar nova funcionalidade"

# Push para GitHub
git push origin main
```

### 8.2 Deploy automático:
- O Vercel fará deploy automático a cada push para `main`
- Você receberá notificações por email
- Pode acompanhar o progresso no dashboard

## 🛠️ Comandos Úteis

```bash
# Ver status do Git
git status

# Ver histórico de commits
git log --oneline

# Criar nova branch para feature
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Merge de branch
git merge feature/nova-funcionalidade

# Ver repositórios remotos
git remote -v
```

## 🆘 Solução de Problemas

### Build falha no Vercel:
1. Verificar se `npm run build` funciona localmente
2. Verificar variáveis de ambiente
3. Verificar logs de build no Vercel

### Erro de autenticação Git:
```bash
# Configurar credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Erro de permissão:
```bash
# Usar token de acesso pessoal do GitHub
# Configurar em: GitHub > Settings > Developer settings > Personal access tokens
```

## ✅ Checklist Final

- [ ] Repositório privado criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Funcionalidades testadas
- [ ] URL de produção funcionando

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs no Vercel Dashboard
2. Testar build local: `npm run build`
3. Verificar variáveis de ambiente
4. Consultar documentação do Vercel: https://vercel.com/docs

---

🎉 **Parabéns! Seu projeto Bobo Validades está no ar!**