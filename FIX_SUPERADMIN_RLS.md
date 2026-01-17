# 🚨 FIX URGENTE - Super Admin RLS Policies

## PROBLEMA:
A tabela `clients` pode não ter a policy correta para o super_admin ler TODOS os registros.

## SOLUÇÃO RÁPIDA:

### PASSO 1: Abrir Supabase SQL Editor
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **4Prospera Connect**
3. No menu lateral, clique em **SQL Editor**

### PASSO 2: Executar o SQL
1. Clique em **New Query**
2. Cole o conteúdo do arquivo `fix_superadmin_rls.sql`
3. Clique em **RUN** ou pressione `Ctrl+Enter`

### PASSO 3: Verificar
Execute esta query para ver se funcionou:

```sql
SELECT * FROM public.clients;
```

Se retornar os 8 usuários, está funcionando!

### PASSO 4: Testar no App
1. Recarregue a página `superadmin/users`
2. Abra o Console (F12)
3. Veja se aparece:
   ```
   🔍 Carregando usuários... { page: 1, ... }
   ✅ Usuários carregados: { users: [...], total: 8, pages: 1 }
   ```

## ALTERNATIVA (se não funcionar):

Execute esta query SIMPLIFICADA:

```sql
-- Desabilitar RLS temporariamente para testar
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
```

**ATENÇÃO:** Isso remove a segurança! Use APENAS para testar.

## DEBUG:

Abra o Console (F12) e veja o erro exato:
- Se for "permission denied" → É problema de RLS
- Se for "relation does not exist" → É problema de schema
- Se for outro erro → Cole aqui o erro completo

---

**Execute o SQL agora e me diga o resultado!**
