# 🫀 Clube do ECG

[![CI](https://github.com/juanleirojl/clubedoecg/actions/workflows/ci.yml/badge.svg)](https://github.com/juanleirojl/clubedoecg/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

> **Domine o ECG no plantão com clareza e confiança.**  
> Plataforma de aprendizado do Método CAMPOS-ECG™, criado pela Dra. Antonina Campos.

---

## 🚀 Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript 5 |
| **Estilização** | Tailwind CSS 4 + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **State** | Zustand |
| **Vídeo** | Panda Video |
| **Deploy** | Vercel |
| **CI/CD** | GitHub Actions |

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js)
│   ├── (auth)/            # Páginas de autenticação
│   ├── (dashboard)/       # Páginas autenticadas
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── venda/             # Página de vendas
│   └── links/             # Link in bio
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── layout/            # Sidebar, Header
│   ├── courses/           # Cards, Lista de aulas
│   ├── player/            # Video player (Panda)
│   └── quiz/              # Sistema de quiz
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── constants.ts       # Constantes globais
│   ├── env.ts             # Validação de env vars
│   └── utils.ts           # Utilidades
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

---

## 🛠️ Configuração Local

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/juanleirojl/clubedoecg.git
cd clubedoecg
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o banco de dados

Execute os scripts SQL em `supabase/` no SQL Editor do Supabase:

1. `schema.sql` - Estrutura base
2. `create-courses-complete.sql` - Tabelas de cursos
3. `admin-setup.sql` - Configuração de admin

### 5. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento com hot reload |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar servidor de produção |
| `npm run lint` | Verificar ESLint |
| `npm run build:analyze` | Analisar bundle size |

---

## 🔒 Segurança

- ✅ Headers de segurança configurados (CSP, X-Frame-Options, etc)
- ✅ Autenticação via Supabase Auth
- ✅ RLS (Row Level Security) no banco
- ✅ Validação de variáveis de ambiente
- ✅ Rate limiting na API

---

## 📊 Performance

- ✅ Imagens otimizadas (AVIF/WebP)
- ✅ Cache de assets estáticos (1 ano)
- ✅ Lazy loading de componentes
- ✅ Font display swap
- ✅ Preconnect para recursos externos
- ✅ SSR com cache (unstable_cache)

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push na `main`!

### Variáveis de Ambiente no Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

---

## 🎨 Design System

### Cores da Marca

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#9d1915` | Vermelho (ação, destaque) |
| Secondary | `#7db975` | Verde (sucesso, positivo) |
| Light | `#f5f4ec` | Bege claro (fundos) |
| Cream | `#fbefce` | Creme (cards claros) |
| Dark | `#0a0505` | Fundo escuro |

---

## 📝 Roadmap

### ✅ Implementado
- [x] Landing page + Página de vendas
- [x] Sistema de login/cadastro
- [x] Dashboard com cursos
- [x] Player de vídeo (Panda Video)
- [x] Sistema de quiz
- [x] Painel administrativo
- [x] SEO completo (sitemap, robots, OG)
- [x] PWA Manifest
- [x] CI/CD com GitHub Actions

### 🚧 Em Desenvolvimento
- [ ] Sistema de pagamentos (Hotmart)
- [ ] Certificados
- [ ] Gamificação completa
- [ ] App mobile (React Native)
- [ ] Notificações push

---

## 👩‍⚕️ Sobre

Criado por **Dra. Antonina Campos** - Médica Residente em Cardiologia, especialista em interpretação clínica do ECG aplicada ao plantão.

---

## 📄 Licença

Projeto privado - Todos os direitos reservados © 2024 Clube do ECG

---

<p align="center">
  Desenvolvido com ❤️ para médicos que querem dominar o ECG
</p>
