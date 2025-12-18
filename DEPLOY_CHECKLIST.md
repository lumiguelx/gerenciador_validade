# ✅ Checklist de Deploy - Bobo Validades

## 📋 Pré-Deploy

### Verificações Locais
- [ ] Projeto roda localmente sem erros (`npm run dev`)
- [ ] Build funciona corretamente (`npm run build`)
- [ ] Todas as funcionalidades testadas
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Arquivo `.env.example` atualizado

### Arquivos de Configuração
- [ ] `.gitignore` criado e configurado
- [ ] `vercel.json` configurado
- [ ] `README.md` atualizado
- [ ] `package.json` com scripts corretos

## 🐙 GitHub

### Repositório
- [ ] Conta GitHub ativa
- [ ] Repositório privado criado: `bobo-validades`
- [ ] Repositório NÃO inicializado (sem README, .gitignore, license)
- [ ] URL do repositório copiada

### Git Local
- [ ] Git instalado e configurado
- [ ] Credenciais Git configuradas:
  ```bash
  git config --global user.name "Seu Nome"
  git config --global user.email "seu@email.com"
  ```
- [ ] Repositório inicializado (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Commit inicial feito
- [ ] Push para GitHub realizado

## 🚀 Vercel

### Conta e Projeto
- [ ] Conta Vercel ativa (login com GitHub)
- [ ] Projeto importado do GitHub
- [ ] Framework detectado como "Vite"

### Configurações de Build
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Install Command**: `npm install`
- [ ] **Root Directory**: `.` (raiz)

### Variáveis de Ambiente
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Valores copiados do projeto atual/Supabase

### Deploy
- [ ] Primeiro deploy realizado
- [ ] Build bem-sucedido (sem erros)
- [ ] URL de produção funcionando
- [ ] Deploy automático configurado (push → deploy)

## 🧪 Testes Pós-Deploy

### Funcionalidades Básicas
- [ ] Página carrega corretamente
- [ ] Login/cadastro funcionando
- [ ] Dashboard carrega
- [ ] Adicionar produto funciona
- [ ] Busca e filtros funcionam
- [ ] Exportar PDF funciona

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Performance
- [ ] Carregamento rápido (< 3s)
- [ ] Navegação fluida
- [ ] Sem erros no console

### PWA (Progressive Web App)
- [ ] Manifest.json carregando
- [ ] Service Worker funcionando
- [ ] Instalável no mobile/desktop

## 🔧 Configurações Avançadas (Opcional)

### Domínio Personalizado
- [ ] Domínio adquirido
- [ ] DNS configurado
- [ ] SSL/HTTPS funcionando

### Monitoramento
- [ ] Analytics configurado
- [ ] Error tracking configurado
- [ ] Performance monitoring ativo

### SEO
- [ ] Meta tags configuradas
- [ ] Open Graph configurado
- [ ] Sitemap gerado

## 🔄 Workflow de Desenvolvimento

### Fluxo de Trabalho
- [ ] Branch `main` protegida
- [ ] Pull requests configurados
- [ ] Deploy automático funcionando
- [ ] Rollback testado

### Comandos Essenciais Testados
```bash
# Desenvolvimento
npm run dev

# Build e teste
npm run build
npm run preview

# Deploy
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

## 📞 Suporte e Documentação

### Documentação
- [ ] README.md completo
- [ ] Guia de deploy criado
- [ ] Comentários no código
- [ ] Variáveis documentadas

### Backup e Segurança
- [ ] Código versionado no Git
- [ ] Backup das variáveis de ambiente
- [ ] Credenciais seguras
- [ ] Acesso de admin testado

## 🎉 Finalização

### Comunicação
- [ ] Equipe notificada sobre novo deploy
- [ ] URL de produção compartilhada
- [ ] Credenciais de acesso fornecidas
- [ ] Treinamento realizado (se necessário)

### Monitoramento Inicial
- [ ] Primeiras 24h monitoradas
- [ ] Logs verificados
- [ ] Performance acompanhada
- [ ] Feedback coletado

---

## 🆘 Em Caso de Problemas

### Build Falha
1. Verificar logs no Vercel
2. Testar `npm run build` localmente
3. Verificar dependências no `package.json`
4. Verificar variáveis de ambiente

### Deploy Falha
1. Verificar permissões do GitHub
2. Verificar configurações do Vercel
3. Verificar branch correta (`main`)
4. Verificar se repositório não está vazio

### Aplicação Não Funciona
1. Verificar variáveis de ambiente
2. Verificar console do navegador
3. Verificar logs do Vercel
4. Verificar conexão com Supabase

### Contatos de Suporte
- **Vercel**: https://vercel.com/support
- **GitHub**: https://support.github.com
- **Supabase**: https://supabase.com/support

---

✅ **Deploy concluído com sucesso!**
🌐 **URL de Produção**: `https://seu-projeto.vercel.app`