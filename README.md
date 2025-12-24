# 🛒 Bobo Validades

Sistema completo de gestão de produtos com controle de validades, rebaixas e relatórios.

## 🚀 Funcionalidades

### 📦 **Gestão de Produtos**
- Cadastro completo de produtos
- Scanner de código de barras
- Controle de validades
- Sistema de rebaixas (1ª e 2ª rebaixa)
- Gestão por sessões/categorias

### 🔍 **Busca e Filtros**
- Busca inteligente com sugestões
- Filtros por sessão/categoria
- Filtros por status (vencidos, vencendo)
- Filtros por dias até vencimento
- Histórico de buscas recentes

### 📊 **Relatórios e Dashboard**
- Dashboard com estatísticas em tempo real
- Gráficos de produtos por sessão
- Insights de eficiência do estoque
- Alertas de produtos críticos
- Exportação de relatórios em PDF

### 🔧 **Funcionalidades Avançadas**
- Ações em lote (edição/exclusão múltipla)
- Interface responsiva (mobile-first)
- PWA (Progressive Web App)
- Modo offline com sincronização
- Autenticação segura

## 🛠️ Tecnologias

- **React 18** + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui**
- **Supabase** (Backend)
- **Vite** (Build tool)
- **PWA** (Progressive Web App)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/lumiguelx/gerenciador_validade.git
cd gerenciador_validade

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Execute o projeto
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📱 Build para Produção

```bash
npm run build
npm run preview
```

## 🎨 Interface

- Design moderno e responsivo
- Tema claro/escuro
- Componentes acessíveis
- Experiência mobile otimizada

## 📊 Funcionalidades do Dashboard

- Estatísticas em tempo real
- Gráficos interativos
- Alertas de produtos vencendo
- Relatórios exportáveis
- Insights de performance

---

Desenvolvido com ❤️ usando React e TypeScript