# MaxReport Pro

Sistema de Relatórios Técnicos para Manutenção de Equipamentos 4x4 Hitachi.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript 5** - JavaScript type-safe
- **Tailwind CSS 4** - Estilização utility-first
- **shadcn/ui** - Componentes UI acessíveis
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (produção)
- **Zustand** - Gerenciamento de estado
- **PptxGenJS** - Exportação para PowerPoint

## 📋 Funcionalidades

- ✅ Criação e edição de relatórios de manutenção
- ✅ Gestão de equipamentos
- ✅ Upload e edição de fotos com anotações
- ✅ Exportação para PowerPoint (PPTX)
- ✅ Exportação para HTML
- ✅ Exportação/Importação de dados em JSON
- ✅ Múltiplos usuários
- ✅ Tema claro/escuro

## 🏃‍♂️ Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Configurar banco de dados
cp .env.example .env
bun run db:push

# Iniciar servidor de desenvolvimento
bun run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy no Render

### Opção 1: Usando Blueprint (Recomendado)

1. Faça push do código para um repositório GitHub
2. Acesse [render.com](https://render.com) e crie uma conta
3. No dashboard, clique em **"New"** → **" Blueprint"**
4. Conecte seu repositório GitHub
5. Selecione o repositório do MaxReport Pro
6. O Render detectará automaticamente o arquivo `render.yaml`
7. Clique em **"Apply"** para criar os serviços

### Opção 2: Manual

#### Passo 1: Criar Banco de Dados PostgreSQL

1. No Render, clique em **"New"** → **"PostgreSQL"**
2. Configure:
   - Name: `maxreport-db`
   - Database: `maxreport`
   - User: (automático)
   - Region: Oregon (ou São Paulo para Brasil)
   - Plan: Free

#### Passo 2: Criar Web Service

1. No Render, clique em **"New"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:
   - Name: `maxreport-pro`
   - Runtime: `Node`
   - Build Command: `bun install && bun run db:generate && bun run db:push && bun run build`
   - Start Command: `bun run start`
   - Plan: Free

4. Adicione as variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `BUN_VERSION` | `1.3.4` |
| `DATABASE_URL` | (Internal Database URL do PostgreSQL) |
| `DIRECT_DATABASE_URL` | (Internal Database URL do PostgreSQL) |
| `NEXTAUTH_SECRET` | (clique em "Generate") |
| `NEXTAUTH_URL` | `https://seu-app.onrender.com` |

### Após o Deploy

1. Acesse seu app em `https://seu-app.onrender.com`
2. Faça login com um dos usuários padrão:
   - **Nome:** Claudio, Valdemar, Jandelson, Rafael ou Saulo
   - **Senha:** `2026`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js (App Router)
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── auth/              # Componentes de autenticação
│   ├── reports/           # Componentes de relatórios
│   └── views/             # Visualizações
├── hooks/                  # React hooks customizados
└── lib/                    # Utilitários e configurações
    ├── store.ts           # Estado global (Zustand)
    ├── db.ts              # Cliente Prisma
    └── utils.ts           # Funções utilitárias
```

## 🔧 Scripts Disponíveis

```bash
bun run dev          # Servidor de desenvolvimento
bun run build        # Build de produção
bun run start        # Iniciar servidor de produção
bun run lint         # Verificar código com ESLint
bun run db:push      # Sincronizar schema com banco
bun run db:generate  # Gerar cliente Prisma
bun run db:studio    # Abrir Prisma Studio
```

## 🌍 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão com PostgreSQL (com pgbouncer) |
| `DIRECT_DATABASE_URL` | URL direta do PostgreSQL (sem pgbouncer) |
| `NEXTAUTH_SECRET` | Chave secreta para NextAuth.js |
| `NEXTAUTH_URL` | URL base da aplicação |
| `NODE_ENV` | Ambiente (development/production) |

## 📝 Licença

Projeto privado - Zamine

---

Desenvolvido com ❤️ para gerenciamento de manutenção de equipamentos
