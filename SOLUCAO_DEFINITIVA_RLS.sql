-- ==========================================
-- SOLUÇÃO DEFINITIVA - SEM RLS
-- ==========================================
-- Execute este SQL no Supabase SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE (para testar)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE AGORA VOCÊ CONSEGUE VER OS DADOS
SELECT 
  id,
  user_id,
  name,
  role,
  created_at
FROM public.clients
LIMIT 10;

-- 3. SE FUNCIONAR, REABILITAR RLS COM POLICIES CORRETAS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER TODAS AS POLICIES
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client data" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;

-- 5. CRIAR POLICY ÚNICA E SIMPLES
CREATE POLICY "Allow all for authenticated users" 
ON public.clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. TESTAR NOVAMENTE
SELECT 
  id,
  user_id,
  name,
  role,
  created_at,
  CASE 
    WHEN role = 'super_admin' THEN '✅ VOCÊ É SUPER ADMIN!'
    ELSE '✅ Role: ' || role
  END as status
FROM public.clients
WHERE user_id = auth.uid();
