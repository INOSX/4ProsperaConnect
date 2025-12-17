# 🗑️ Como Deletar um Usuário do Banco de Dados

## 📋 Opções Disponíveis

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. **Acesse o painel do Supabase:**
   - https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed
   - Vá em **SQL Editor**

2. **Execute o SQL abaixo** (substitua `USER_ID_AQUI` pelo ID do usuário):

```sql
-- Deletar usuário e todos os dados relacionados (cascata)
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que você quer deletar

DELETE FROM auth.users 
WHERE id = 'USER_ID_AQUI';
```

**⚠️ IMPORTANTE**: 
- Como a tabela `clients` tem `ON DELETE CASCADE` configurado, ao deletar o usuário em `auth.users`, todos os registros relacionados em `clients` serão deletados automaticamente.
- Isso também deleta os recursos OpenAI (assistents e vectorstores) se houver lógica de limpeza.

---

### Opção 2: Deletar apenas o registro do cliente (manter usuário)

Se você quiser deletar apenas o registro do cliente mas manter o usuário autenticado:

```sql
-- Deletar apenas o registro do cliente
DELETE FROM public.clients 
WHERE user_id = 'USER_ID_AQUI';
```

---

### Opção 3: Deletar usuário e limpar recursos OpenAI

Se você quiser deletar o usuário E limpar os recursos OpenAI associados:

```sql
-- 1) Buscar IDs dos recursos OpenAI do cliente
SELECT 
    id,
    user_id,
    openai_assistant_id,
    vectorstore_id
FROM public.clients
WHERE user_id = 'USER_ID_AQUI';

-- 2) Anotar os IDs (assistant_id e vectorstore_id)

-- 3) Deletar o usuário (isso deleta o cliente automaticamente por CASCADE)
DELETE FROM auth.users 
WHERE id = 'USER_ID_AQUI';

-- 4) (Opcional) Se quiser deletar os recursos OpenAI manualmente via API,
-- você precisaria fazer isso via código ou API da OpenAI
-- Os recursos OpenAI não são deletados automaticamente ao deletar o usuário
```

---

## 🔍 Como Encontrar o ID do Usuário

### Método 1: Via SQL Editor

```sql
-- Listar todos os usuários com seus emails
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### Método 2: Via Table Editor do Supabase

1. Acesse **Table Editor** no painel do Supabase
2. Vá em **Authentication** → **Users**
3. Encontre o usuário pelo email
4. Copie o `id` do usuário

### Método 3: Via Tabela clients

```sql
-- Listar usuários que têm clientes cadastrados
SELECT 
    c.id as client_id,
    c.user_id,
    c.name,
    c.email,
    u.email as user_email,
    u.created_at as user_created_at
FROM public.clients c
JOIN auth.users u ON u.id = c.user_id
ORDER BY c.created_at DESC;
```

---

## ⚠️ Avisos Importantes

### 1. **Cascata de Deletação**
- Ao deletar um usuário em `auth.users`, o Supabase automaticamente deleta:
  - Registros relacionados em `public.clients` (devido ao `ON DELETE CASCADE`)
  - Sessões de autenticação
  - Tokens de refresh

### 2. **Recursos OpenAI NÃO são deletados automaticamente**
- Os assistentes e vectorstores criados na OpenAI **NÃO são deletados automaticamente**
- Se você quiser deletá-los, precisa fazer via API da OpenAI ou código
- Eles continuarão existindo na conta OpenAI e podem gerar custos

### 3. **Dados em outras tabelas**
- Se houver outras tabelas com referências ao `user_id`, verifique se têm `ON DELETE CASCADE` configurado
- Caso contrário, você precisará deletar manualmente ou ajustar as foreign keys

---

## 🧹 Script Completo de Limpeza (Opcional)

Se você quiser fazer uma limpeza completa (usuário + cliente + recursos OpenAI):

```sql
-- 1) Buscar informações do cliente
DO $$
DECLARE
    v_user_id UUID := 'USER_ID_AQUI'; -- Substitua pelo ID do usuário
    v_assistant_id TEXT;
    v_vectorstore_id TEXT;
BEGIN
    -- Buscar IDs dos recursos OpenAI
    SELECT openai_assistant_id, vectorstore_id
    INTO v_assistant_id, v_vectorstore_id
    FROM public.clients
    WHERE user_id = v_user_id;
    
    -- Mostrar informações
    RAISE NOTICE 'Cliente encontrado:';
    RAISE NOTICE '  Assistant ID: %', v_assistant_id;
    RAISE NOTICE '  Vectorstore ID: %', v_vectorstore_id;
    
    -- Deletar o usuário (cliente será deletado automaticamente)
    DELETE FROM auth.users WHERE id = v_user_id;
    
    RAISE NOTICE 'Usuário deletado com sucesso!';
    RAISE NOTICE 'NOTA: Recursos OpenAI (assistant e vectorstore) precisam ser deletados manualmente via API da OpenAI';
END $$;
```

---

## 📝 Exemplo Prático

### Deletar usuário pelo email:

```sql
-- 1) Encontrar o ID do usuário pelo email
SELECT id, email 
FROM auth.users 
WHERE email = 'usuario@exemplo.com';

-- 2) Deletar o usuário (use o ID retornado acima)
DELETE FROM auth.users 
WHERE id = 'ID_RETORNADO_ACIMA';
```

---

## 🔗 Links Úteis

- [Painel do Projeto Supabase](https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed)
- [SQL Editor](https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/sql)
- [Table Editor - Users](https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/auth/users)

---

**Última atualização**: 17/12/2025

