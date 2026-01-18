-- ==========================================
-- FIX URGENTE - RLS POLICIES PARA CLIENTS
-- ==========================================
-- Migration: Fix RLS policies to allow users to read their own data
-- and super_admin to read/update all data

-- 1. REMOVER TODAS AS POLICIES ANTIGAS
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.clients;

-- 2. CRIAR POLICY PARA CADA USUÁRIO LER SEU PRÓPRIO REGISTRO
CREATE POLICY "Users can view own client data" 
ON public.clients
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. CRIAR POLICY PARA SUPER ADMIN LER TODOS OS REGISTROS
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

-- 4. CRIAR POLICY PARA SUPER ADMIN ATUALIZAR TODOS OS REGISTROS
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
