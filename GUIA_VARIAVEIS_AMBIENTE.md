# 🔐 Guia de Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE: Segurança das Variáveis

### Por que `SUPABASE_ANON_KEY` é segura para expor?

**✅ É SEGURO** expor `SUPABASE_ANON_KEY` no frontend porque:

1. **É uma chave pública**: O Supabase foi projetado para que essa chave seja pública
2. **RLS protege os dados**: O Row Level Security (RLS) do Supabase garante que mesmo com a chave, ninguém acessa dados sem autenticação
3. **Padrão da indústria**: Todos os projetos Supabase expõem essa chave no frontend
4. **Documentação oficial**: A própria documentação do Supabase recomenda usar no frontend

**❌ NÃO é seguro** expor `OPENAI_API_KEY` porque:

1. **Chave privada**: Qualquer pessoa que tiver pode usar e gerar custos na sua conta
2. **Sem proteção**: Não há RLS ou sistema de permissões
3. **Detecção automática**: A OpenAI detecta e revoga chaves expostas publicamente
4. **Custos**: Pode gerar custos ilimitados na sua conta

### Resumo Rápido

| Variável | Segura no Frontend? | Onde Usar |
|----------|---------------------|-----------|
| `SUPABASE_URL` | ✅ SIM | Frontend + Backend |
| `SUPABASE_ANON_KEY` | ✅ SIM | Frontend + Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ NÃO | Apenas Backend (API Routes) |
| `OPENAI_API_KEY` | ❌ NÃO | Apenas Backend (API Routes) |
| `HEYGEN_API_KEY` | ❌ NÃO | Apenas Backend (API Routes) |

---

## 📍 Onde Configurar

**IMPORTANTE**: As variáveis de ambiente devem ser configuradas no **Vercel**, não no Supabase.

- ✅ **Vercel**: Onde a aplicação roda (frontend + backend)
- ❌ **Supabase**: Já tem suas próprias credenciais configuradas

**Por que no Vercel?**
- As variáveis no Vercel são acessíveis apenas no servidor (API Routes) ou injetadas no build do frontend
- Variáveis sensíveis (`OPENAI_API_KEY`, `SERVICE_ROLE_KEY`) ficam apenas no servidor
- Variáveis seguras (`SUPABASE_ANON_KEY`) podem ser injetadas no frontend com segurança

---

## 🎯 Variáveis Necessárias

### 🔒 Segurança: Variáveis Seguras vs Sensíveis

**IMPORTANTE**: Nem todas as variáveis são iguais em termos de segurança!

#### ✅ Variáveis SEGURAS (podem ser expostas no frontend)

Estas variáveis são **públicas** e podem ser incluídas no código JavaScript do frontend:

```env
SUPABASE_URL=https://dytuwutsjjxxmyefrfed.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTU3MjUsImV4cCI6MjA4MTQ5MTcyNX0.RwG2Cb7EItvoQz_VLVDJ0Vqu4lkJ_yb5IN-JLIF-g7o
```

**Por que são seguras?**
- `SUPABASE_ANON_KEY` é uma chave **pública/anônima** do Supabase
- Ela já tem **RLS (Row Level Security)** configurado no banco
- Mesmo que alguém veja no código, não pode acessar dados sem autenticação
- É o padrão do Supabase expor essa chave no frontend

#### ⚠️ Variáveis SENSÍVEIS (NUNCA expor no frontend)

Estas variáveis são **secretas** e devem ser usadas APENAS no backend (API serverless):

```env
# ⚠️ SENSÍVEL - Apenas Backend (API Routes)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ

# ⚠️ SENSÍVEL - Apenas Backend (API Routes)
OPENAI_API_KEY=sua-chave-openai-aqui
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# ⚠️ SENSÍVEL - Apenas Backend (API Routes)
HEYGEN_API_KEY=sua-chave-heygen-aqui
```

**Por que são sensíveis?**
- `SUPABASE_SERVICE_ROLE_KEY`: Bypassa RLS, acesso total ao banco
- `OPENAI_API_KEY`: Se exposta, pode ser usada por qualquer pessoa e gerar custos na sua conta
- `HEYGEN_API_KEY`: Se exposta, pode ser usada por qualquer pessoa e gerar custos na sua conta do HeyGen

**✅ Solução**: Use API Routes do Vercel para chamadas que precisam dessas chaves. O projeto já tem o proxy configurado em `/api/heygen/proxy` que usa a chave de forma segura no backend.

---

## 🚀 Como Configurar no Vercel

### Passo 1: Acesse o Painel do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto **4Prospera Connect**

### Passo 2: Configure as Variáveis de Ambiente

1. No projeto, vá em **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Adicione cada variável:

#### Variáveis SEGURAS (Frontend + Backend)

**✅ SUPABASE_URL** - Pode ser exposta no frontend
- **Name**: `SUPABASE_URL`
- **Value**: `https://dytuwutsjjxxmyefrfed.supabase.co`
- **Environment**: Marque **Production**, **Preview** e **Development**
- Clique em **Save**

**✅ SUPABASE_ANON_KEY** - Pode ser exposta no frontend
- **Name**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTU3MjUsImV4cCI6MjA4MTQ5MTcyNX0.RwG2Cb7EItvoQz_VLVDJ0Vqu4lkJ_yb5IN-JLIF-g7o`
- **Environment**: Marque **Production**, **Preview** e **Development**
- Clique em **Save**

#### Variáveis SENSÍVEIS (Apenas Backend - API Routes)

**⚠️ SUPABASE_SERVICE_ROLE_KEY** - NUNCA expor no frontend
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ`
- **Environment**: Marque **Production**, **Preview** e **Development**
- **⚠️ IMPORTANTE**: Esta variável só será acessível nas API Routes do Vercel (backend), não no frontend
- Clique em **Save**

**⚠️ OPENAI_API_KEY** - NUNCA expor no frontend
- **Name**: `OPENAI_API_KEY`
- **Value**: `sua-chave-openai-aqui` (obtenha em https://platform.openai.com/api-keys)
- **Environment**: Marque **Production**, **Preview** e **Development**
- **⚠️ IMPORTANTE**: 
  - Esta variável só será acessível nas API Routes do Vercel (backend), não no frontend
  - ✅ **Correto**: Usar em `/api/openai/vectorstore.js` e outras API routes
  - ❌ **Errado**: Tentar usar `import.meta.env.OPENAI_API_KEY` no código frontend
  - O código foi corrigido para não expor a chave no frontend
- Clique em **Save**

**⚠️ HEYGEN_API_KEY** - NUNCA expor no frontend (para Avatar HeyGen)
- **Name**: `HEYGEN_API_KEY`
- **Value**: `sua-chave-heygen-aqui` (obtenha em https://app.heygen.com)
- **Environment**: Marque **Production**, **Preview** e **Development**
- **⚠️ IMPORTANTE**: Esta variável só será acessível nas API Routes do Vercel (backend), não no frontend
- **📝 Nota**: 
  - O projeto usa o proxy `/api/heygen/proxy` que já está configurado para usar esta chave de forma segura
  - O `HeyGenStreamingService` faz chamadas através deste proxy, nunca diretamente
  - A chave fica protegida no servidor do Vercel
- Clique em **Save**

### Passo 3: Redeploy

Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. As novas variáveis serão aplicadas

---

## 💻 Configuração para Desenvolvimento Local

### Criar arquivo `.env` na raiz do projeto

Crie um arquivo `.env` (não commitar no Git) com:

```env
# Supabase Configuration
SUPABASE_URL=https://dytuwutsjjxxmyefrfed.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTU3MjUsImV4cCI6MjA4MTQ5MTcyNX0.RwG2Cb7EItvoQz_VLVDJ0Vqu4lkJ_yb5IN-JLIF-g7o

# Service Role (apenas para testes locais)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ

# OpenAI (opcional)
OPENAI_API_KEY=sua-chave-openai-aqui
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# HeyGen Avatar (opcional)
HEYGEN_API_KEY=sua-chave-heygen-aqui
```

**⚠️ IMPORTANTE**: 
- O arquivo `.env` está no `.gitignore` e não será commitado
- Use `config_example.env` como referência (já atualizado)

---

## 🔍 Verificação

### Verificar se as variáveis estão configuradas

#### No Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Verifique se todas as variáveis estão listadas
3. Confirme que estão marcadas para o ambiente correto

#### Verificar Segurança no Frontend:

**✅ O que DEVE aparecer no código JavaScript do frontend:**
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅

**❌ O que NÃO DEVE aparecer no código JavaScript do frontend:**
- `SUPABASE_SERVICE_ROLE_KEY` ❌
- `OPENAI_API_KEY` ❌
- `HEYGEN_API_KEY` ❌

**Como verificar:**
1. Faça o build da aplicação
2. Abra o arquivo JavaScript gerado em `dist/assets/`
3. Procure por "OPENAI_API_KEY" ou "SERVICE_ROLE"
4. Se encontrar, há um problema de segurança!

#### Localmente:
```bash
# Verificar se o arquivo .env existe
cat .env

# Testar se as variáveis estão sendo carregadas
# (dependendo do seu setup)
node -e "console.log(process.env.SUPABASE_URL)"
```

---

## 📋 Checklist de Configuração

- [ ] Variáveis configuradas no Vercel (Production)
- [ ] Variáveis configuradas no Vercel (Preview/Development) - opcional
- [ ] Arquivo `.env` criado localmente (para desenvolvimento)
- [ ] Redeploy feito no Vercel após adicionar variáveis
- [ ] Testado conexão com Supabase

---

## 🆘 Troubleshooting

### Problema: "SUPABASE_URL is required"
**Solução**: Verifique se a variável está configurada no Vercel e fez redeploy.

### Problema: "Supabase admin credentials missing"
**Solução**: Adicione `SUPABASE_SERVICE_ROLE_KEY` no Vercel (apenas para backend).

### Problema: Variáveis não funcionam localmente
**Solução**: 
1. Verifique se o arquivo `.env` existe na raiz
2. Reinicie o servidor de desenvolvimento
3. Verifique se não há espaços extras nas variáveis

### Problema: "OpenAI API key detected in frontend"
**Solução**: 
1. ✅ **Correto**: A chave está configurada no Vercel
2. ✅ **Correto**: A chave é usada apenas em API Routes (`/api/openai/*`)
3. ❌ **Errado**: A chave está sendo exposta no `vite.config.js` ou no código frontend
4. **Ação**: Remova `OPENAI_API_KEY` do `vite.config.js` e use API Routes para todas as chamadas OpenAI

### Problema: "Chave OpenAI vazou e está sendo usada por terceiros"
**Solução**:
1. Revogue a chave imediatamente no painel da OpenAI
2. Gere uma nova chave
3. Atualize no Vercel
4. Verifique que a chave não está no código frontend
5. Use apenas API Routes para chamadas OpenAI

### Problema: "HeyGen Avatar não funciona"
**Solução**:
1. Verifique se `HEYGEN_API_KEY` está configurada no Vercel
2. Confirme que está usando o proxy `/api/heygen/proxy` (já configurado)
3. Verifique os logs do Vercel para erros da API HeyGen
4. A chave deve estar apenas no backend, não no frontend

---

## 📚 Referências

- **Projeto Supabase**: `dytuwutsjjxxmyefrfed`
- **URL do Supabase**: `https://dytuwutsjjxxmyefrfed.supabase.co`
- **Documentação Vercel**: [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Última atualização**: Janeiro 2025

