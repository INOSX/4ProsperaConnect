-- Script para corrigir políticas RLS da tabela employee_products
-- Versão 2: Usa função de segurança para evitar recursão infinita
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS
-- ============================================

DROP POLICY IF EXISTS "Employees can view their products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can view employee products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can insert employee products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can update employee products" ON public.employee_products;

-- ============================================
-- CRIAR FUNÇÕES DE SEGURANÇA (BYPASS RLS)
-- ============================================

-- Função para verificar se um employee pertence a uma company do usuário
-- Usa SECURITY DEFINER para bypassar RLS e evitar recursão
CREATE OR REPLACE FUNCTION public.check_employee_company_access(
    p_employee_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.employees e
        INNER JOIN public.companies c ON c.id = e.company_id
        WHERE e.id = p_employee_id
        AND c.owner_user_id = p_user_id
        LIMIT 1
    );
END;
$$;

-- Função para verificar se um employee pertence ao próprio usuário
CREATE OR REPLACE FUNCTION public.check_employee_self_access(
    p_employee_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.employees
        WHERE id = p_employee_id
        AND platform_user_id = p_user_id
        LIMIT 1
    );
END;
$$;

-- ============================================
-- CRIAR POLÍTICAS CORRIGIDAS (USANDO FUNÇÕES)
-- ============================================

-- Política: colaboradores podem ver seus próprios produtos
CREATE POLICY "Employees can view their products" ON public.employee_products
    FOR SELECT
    USING (
        public.check_employee_self_access(employee_products.employee_id, auth.uid())
    );

-- Política: empresas podem ver produtos de seus colaboradores
CREATE POLICY "Companies can view employee products" ON public.employee_products
    FOR SELECT
    USING (
        public.check_employee_company_access(employee_products.employee_id, auth.uid())
    );

-- Política: empresas podem inserir produtos para seus colaboradores
CREATE POLICY "Companies can insert employee products" ON public.employee_products
    FOR INSERT
    WITH CHECK (
        public.check_employee_company_access(employee_products.employee_id, auth.uid())
    );

-- Política: empresas podem atualizar produtos de seus colaboradores
CREATE POLICY "Companies can update employee products" ON public.employee_products
    FOR UPDATE
    USING (
        public.check_employee_company_access(employee_products.employee_id, auth.uid())
    );

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as políticas foram criadas
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
WHERE tablename = 'employee_products'
ORDER BY policyname;

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('check_employee_company_access', 'check_employee_self_access')
ORDER BY routine_name;

