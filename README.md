# Imobiliária Kazavel CRM

Sistema de CRM para imobiliária desenvolvido com Next.js e Express.

## Stack Tecnológica

### Frontend
- **TypeScript** - Lógica e tipagem
- **Tailwind CSS** - Estilização
- **Next.js** - React com SSR (otimização de carregamento e SEO)
- **Shadcn/ui** - Componentes prontos
- **React Query/TanStack Query** - Gerenciamento de cache e chamadas de API
- **Zod** - Validação de dados backend e frontend

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework para criar API REST

### Banco de Dados
- **Supabase** - Banco de dados e autenticação

## Instalação

1. Instale as dependências de todos os projetos:
```bash
npm run install:all
```

2. Configure as variáveis de ambiente:
   - Copie `env.example` para `.env` em `frontend/` e `backend/`
   - Preencha com suas credenciais do Supabase:
     - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no frontend
     - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no backend

## Execução

Para rodar frontend e backend simultaneamente:
```bash
npm run dev
```

Para rodar apenas o frontend:
```bash
npm run dev:frontend
```

Para rodar apenas o backend:
```bash
npm run dev:backend
```

## Build

Para build de produção:
```bash
npm run build
```
