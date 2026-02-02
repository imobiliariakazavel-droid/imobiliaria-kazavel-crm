# Guia Rápido de Deploy na Vercel

## Checklist Pré-Deploy

- [x] ✅ Arquivo `vercel.json` configurado
- [x] ✅ Arquivo `.vercelignore` criado
- [x] ✅ README atualizado com instruções

## Passos para Deploy

### 1. Variáveis de Ambiente Necessárias

Configure estas variáveis no Dashboard da Vercel (Settings > Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Deploy via Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (detectado automaticamente)
5. Adicione as variáveis de ambiente
6. Clique em "Deploy"

### 3. Deploy via CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# No diretório raiz do projeto
vercel

# Para produção
vercel --prod
```

## Estrutura do Projeto

```
imobiliaria-kazavel-crm/
├── frontend/          # Aplicação Next.js (deployado na Vercel)
├── backend/           # Backend Express (não necessário para deploy)
├── vercel.json        # Configuração do Vercel
└── .vercelignore      # Arquivos ignorados no deploy
```

## Notas Importantes

- **IMPORTANTE**: Configure o **Root Directory** como `frontend` nas configurações do projeto no Dashboard da Vercel (Settings > General > Root Directory). Isso NÃO deve estar no `vercel.json`
- O backend Express não é necessário para o deploy, pois o frontend usa Supabase diretamente
- A Vercel fará build automático a cada push na branch principal
- Certifique-se de configurar as variáveis de ambiente antes do primeiro deploy

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json` do frontend
- Certifique-se de que o Node.js versão está compatível (Next.js 14 requer Node 18+)

### Variáveis de Ambiente não funcionam
- Verifique se as variáveis começam com `NEXT_PUBLIC_` para serem expostas ao cliente
- Faça um novo deploy após adicionar/modificar variáveis

### Erro 404 em rotas
- Verifique se o `middleware.ts` está configurado corretamente
- Certifique-se de que as rotas estão na pasta `app/`
