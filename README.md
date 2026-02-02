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

## Deploy na Vercel

O projeto está configurado para deploy na Vercel. Siga os passos abaixo:

### 1. Preparação

1. Certifique-se de que o projeto está no GitHub, GitLab ou Bitbucket
2. Faça login na [Vercel](https://vercel.com)

### 2. Deploy

#### Opção A: Deploy via Dashboard da Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub/GitLab/Bitbucket
4. A Vercel detectará automaticamente que é um projeto Next.js
5. Configure as seguintes opções:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (será executado dentro do diretório frontend)
   - **Output Directory**: `.next` (padrão do Next.js)
   - **Install Command**: `npm install`

#### Opção B: Deploy via CLI

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. No diretório raiz do projeto, execute:
```bash
vercel
```

3. Siga as instruções do CLI

### 3. Configurar Variáveis de Ambiente

Após o primeiro deploy, configure as variáveis de ambiente na Vercel:

1. Acesse o projeto no Dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Selecione os ambientes (Production, Preview, Development)
5. Clique em **Save**
6. Faça um novo deploy para aplicar as variáveis

### 4. Domínio Personalizado (Opcional)

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar o DNS

### Notas Importantes

- **IMPORTANTE**: Configure o **Root Directory** como `frontend` nas configurações do projeto no Dashboard da Vercel (Settings > General > Root Directory)
- O arquivo `vercel.json` está configurado com os comandos de build
- O backend Express não é necessário para o deploy, pois o frontend usa o Supabase diretamente
- Certifique-se de que todas as variáveis de ambiente estão configuradas antes do deploy
- A Vercel fará o build automaticamente a cada push na branch principal