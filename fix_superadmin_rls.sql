-- Garantir que super_admin pode ler TODOS os registros de clients
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover policies antigas se existirem
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins full access to clients" ON public.clients;

-- 2. Criar policy para super_admin ler TODOS os clients
CREATE POLICY "Super admins can view all clients" 
ON public.clients
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role = 'super_admin'
  )
);

-- 3. Criar policy para super_admin atualizar TODOS os clients
CREATE POLICY "Super admins can update all clients" 
ON public.clients
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role = 'super_admin'
  )
);

-- 4. Verificar policies criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY policyname;
