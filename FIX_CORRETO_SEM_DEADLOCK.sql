-- ==========================================
-- FIX CORRETO - SEM DEADLOCK CIRCULAR
-- ==========================================

-- 1. REMOVER TODAS AS POLICIES
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins can update all clients" ON public.clients;

-- 2. POLICY SIMPLES: TODOS lêem SEU PRÓPRIO registro (SEM subquery)
CREATE POLICY "Users can view own client data" 
ON public.clients
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 3. POLICY SIMPLES: TODOS podem atualizar SEU PRÓPRIO registro
CREATE POLICY "Users can update own client data" 
ON public.clients
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
  id,
  user_id,
  name,
  role,
  created_at,
  CASE 
    WHEN role = 'super_admin' THEN '✅ VOCÊ É SUPER ADMIN!'
    ELSE '❌ Role: ' || role
  END as status
FROM public.clients
WHERE user_id = auth.uid();
