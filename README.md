# 🫀 Clube do ECG

Plataforma de aprendizado contínuo em eletrocardiografia, focada em raciocínio clínico e conduta prática para estudantes e médicos recém-formados.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Video Player**: React Player
- **Deploy**: Vercel (recomendado)

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Páginas de autenticação
│   ├── (dashboard)/       # Páginas autenticadas
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Componentes Shadcn/UI
│   ├── layout/            # Sidebar, Header
│   ├── courses/           # Cards, Lista de aulas
│   ├── player/            # Video player
│   └── quiz/              # Sistema de quiz
├── lib/
│   ├── supabase/          # Cliente Supabase
│   └── utils.ts           # Utilidades
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── hooks/                 # Custom hooks
```

## 🛠️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie `.env.example` para `.env.local`
3. Preencha as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 3. Criar tabelas no banco

Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase.

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📚 Funcionalidades

### ✅ Implementado
- [x] Landing page
- [x] Login/Cadastro com email e Google
- [x] Dashboard com cursos em andamento
- [x] Listagem de cursos
- [x] Página de detalhes do curso
- [x] Player de vídeo com controles
- [x] Sistema de quiz com feedback
- [x] Layout responsivo com sidebar
- [x] Tema dark moderno

### 🚧 Próximos passos
- [ ] Integração completa com Supabase
- [ ] Sistema de assinaturas (Stripe/Hotmart)
- [ ] Upload de vídeos (Panda Video)
- [ ] Certificados
- [ ] Gamificação
- [ ] PWA / App mobile

## 🎨 Design System

O projeto usa um tema dark com cores:

- **Primary**: Vermelho (#ef4444) - representa o coração/ECG
- **Background**: Escuro com tons azulados
- **Accent**: Gradientes de vermelho

## 📦 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Verificar linting
```

## 🚀 Deploy

### Vercel (recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

### Outras opções
- Netlify
- Railway
- AWS Amplify

## 📄 Licença

Projeto privado - Todos os direitos reservados.

---

Desenvolvido com ❤️ para o Clube do ECG
