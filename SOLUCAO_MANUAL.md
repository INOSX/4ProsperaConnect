# 🚨 MARIO - EXECUTE ISSO MANUALMENTE! 🚨

## POR QUE O CLI NÃO FUNCIONA:

1. ❌ `supabase db push` → Migration history dessinchronizado
2. ❌ `exec_sql RPC` → Não existe no seu projeto
3. ❌ `fetch API` → Problema de rede/SSL

## ÚNICA SOLUÇÃO QUE FUNCIONA:

### ✅ COPIAR E COLAR NO SUPABASE SQL EDITOR

---

## PASSO A PASSO (2 MINUTOS):

### 1️⃣ Abra o Supabase
```
https://supabase.com/dashboard
→ Projeto: 4Prospera Connect
→ SQL Editor (menu esquerdo)
→ New Query
```

### 2️⃣ Copie APENAS este SQL:

```sql
-- REMOVER POLICIES ANTIGAS
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins can update all clients" ON public.clients;

-- POLICY: Usuário lê seu próprio registro
CREATE POLICY "Users can view own client data" 
ON public.clients FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- POLICY: Super Admin lê TODOS os registros
CREATE POLICY "Super admins can view all clients" 
ON public.clients FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() AND c.role = 'super_admin'
  )
);

-- POLICY: Super Admin atualiza TODOS os registros
CREATE POLICY "Super admins can update all clients" 
ON public.clients FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() AND c.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() AND c.role = 'super_admin'
  )
);
```

### 3️⃣ Clique em **RUN** (ou Ctrl+Enter)

### 4️⃣ Verifique se deu certo:
```sql
SELECT * FROM public.clients WHERE user_id = auth.uid();
```

Se retornar SEU registro → ✅ FUNCIONOU!

### 5️⃣ Recarregue a página do app (Ctrl+Shift+R)

---

## ISSO VAI RESOLVER:

✅ `useSuperAdmin` conseguirá ler seu registro  
✅ O card Super Admin vai aparecer  
✅ A página de usuários vai carregar  

---

# EXECUTE MANUALMENTE AGORA! ⚡

**Tempo:** 1 minuto  
**Onde:** Supabase SQL Editor  
**O que:** Cole o SQL acima e clique RUN  

Depois me diga se funcionou!
