-- ==========================================
-- EXECUTAR NO SQL EDITOR DO SUPABASE
-- ==========================================
-- Copie e cole este SQL no Dashboard do Supabase
-- SQL Editor -> New Query -> Colar -> Run

-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "Bank managers can view all clients" ON public.clients;

-- 2. CRIAR POLICY: Bank Manager pode visualizar TODAS as empresas
CREATE POLICY "Bank managers can view all clients" 
ON public.clients
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role IN ('bank_manager', 'super_admin')
  )
);

-- Verificar policies ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;
