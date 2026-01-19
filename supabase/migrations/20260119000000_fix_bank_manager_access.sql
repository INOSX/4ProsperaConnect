-- ==========================================
-- FIX: Bank Manager Access to Companies
-- ==========================================
-- Migration: Allow bank_manager to view all companies
-- Roles hierarchy:
-- - super_admin: full access
-- - bank_manager: view all companies (READ)
-- - company_manager: view only own company
-- - company_employee: view only own data

-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Bank managers can view all clients" ON public.clients;

-- 2. POLICY: Users can view their own data
CREATE POLICY "Users can view own client data" 
ON public.clients
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. POLICY: Super Admin can view ALL clients
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

-- 4. POLICY: Bank Manager can view ALL clients (READ ONLY)
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

-- 5. POLICY: Super Admin can UPDATE all clients
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

-- 6. POLICY: Super Admin can DELETE clients
CREATE POLICY "Super admins can delete clients" 
ON public.clients
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role = 'super_admin'
  )
);

-- 7. POLICY: Super Admin can INSERT clients
CREATE POLICY "Super admins can insert clients" 
ON public.clients
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients AS c
    WHERE c.user_id = auth.uid() 
    AND c.role = 'super_admin'
  )
);

-- Log de sucesso
DO $$ BEGIN 
  RAISE NOTICE '✅ RLS Policies atualizadas: bank_manager pode visualizar todas as empresas'; 
END $$;
