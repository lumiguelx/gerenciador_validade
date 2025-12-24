# 🛒 Bobo Validades

Sistema completo de gestão de produtos com controle de validades, rebaixas e relatórios.

![Bobo Validades](public/og-image.png)

## 🚀 Funcionalidades

### 👤 **Autenticação**
- Login e cadastro de usuários
- Autenticação segura com Supabase
- Controle de acesso por perfil (Admin/Usuário)

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

### 📊 **Relatórios e Insights**
- Dashboard com estatísticas em tempo real
- Gráficos de produtos por sessão
- Insights de eficiência do estoque
- Alertas de produtos críticos
- Exportação de relatórios em PDF

### 🔧 **Funcionalidades Avançadas**
- Ações em lote (edição/exclusão múltipla)
- Paginação inteligente
- Modo offline com sincronização
- Interface responsiva (mobile-first)
- Atalhos de teclado
- PWA (Progressive Web App)

### 👨‍💼 **Painel Administrativo**
- Visualização de todos os usuários
- Gestão de produtos de múltiplos usuários
- Estatísticas globais
- Controle de permissões

## 🛠️ Tecnologias

### **Frontend**
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **React Router** - Roteamento
- **Date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs
- **Sonner** - Notificações toast

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

### **Deploy e DevOps**
- **Vercel** - Hospedagem e CI/CD
- **GitHub** - Controle de versão
- **PWA** - Progressive Web App

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/bobo-validades.git
cd bobo-validades
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📱 Build e Deploy

### Build local
```bash
npm run build
npm run preview
```

### Deploy no Vercel
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

Consulte o arquivo `GIT_DEPLOY_GUIDE.md` para instruções detalhadas.

## 🗂️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── BarcodeScanner.tsx
│   ├── SmartSearch.tsx
│   ├── BulkActions.tsx
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Auth.tsx        # Login/Cadastro
│   ├── Dashboard.tsx   # Dashboard principal
│   └── NewProduct.tsx  # Cadastro de produtos
├── config/             # Configurações
│   ├── env.ts          # Variáveis de ambiente
│   └── theme.ts        # Tema da aplicação
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente Supabase
├── lib/                # Utilitários
└── shared/             # Componentes compartilhados
```

## 🎨 Design System

### Cores Principais
- **Verde Esmeralda**: `#10b981` - Cor primária
- **Cinza Neutro**: `#64748b` - Textos secundários
- **Branco**: `#ffffff` - Fundo principal
- **Vermelho**: `#ef4444` - Alertas e erros
- **Âmbar**: `#f59e0b` - Avisos

### Tipografia
- **Font Family**: Inter (Google Fonts)
- **Tamanhos**: 12px, 14px, 16px, 18px, 24px, 32px

## 📊 Banco de Dados

### Tabelas Principais

#### `products`
- `id` (UUID, PK)
- `product_name` (TEXT)
- `product_brand` (TEXT) - Sessão/Categoria
- `barcode` (TEXT, nullable)
- `expiry_date` (DATE)
- `quantity` (INTEGER)
- `status` (ENUM: normal, primeira_rebaixa, segunda_rebaixa)
- `user_id` (UUID, FK)
- `created_at` (TIMESTAMP)

#### `user_profiles`
- `id` (UUID, PK)
- `email` (TEXT)
- `role` (ENUM: user, admin)
- `created_at` (TIMESTAMP)

### Políticas RLS (Row Level Security)
- Usuários só veem seus próprios produtos
- Admins podem ver produtos de todos os usuários
- Políticas de INSERT, UPDATE, DELETE por usuário

## 🔐 Segurança

- **Autenticação**: Supabase Auth
- **Autorização**: Row Level Security (RLS)
- **Validação**: Validação client-side e server-side
- **Headers de Segurança**: Configurados no Vercel
- **HTTPS**: Forçado em produção

## 📈 Performance

- **Code Splitting**: Lazy loading de rotas
- **Bundle Optimization**: Vite + Rollup
- **Image Optimization**: Vercel Image Optimization
- **Caching**: Service Worker para PWA
- **Compression**: Gzip/Brotli no Vercel

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting com ESLint
npm run type-check   # Verificação de tipos TypeScript
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.



