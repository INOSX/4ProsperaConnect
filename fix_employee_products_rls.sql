-- Script para corrigir políticas RLS da tabela employee_products
-- Execute este script no SQL Editor do Supabase
-- Este script corrige a recursão infinita nas políticas RLS

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS
-- ============================================

DROP POLICY IF EXISTS "Employees can view their products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can view employee products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can insert employee products" ON public.employee_products;
DROP POLICY IF EXISTS "Companies can update employee products" ON public.employee_products;

-- ============================================
-- CRIAR POLÍTICAS CORRIGIDAS (SEM RECURSÃO)
-- ============================================

-- Política: colaboradores podem ver seus próprios produtos
-- Usa apenas platform_user_id diretamente, sem verificar employees
CREATE POLICY "Employees can view their products" ON public.employee_products
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = employee_products.employee_id
            AND platform_user_id = auth.uid()
            -- Limitar a verificação apenas ao que é necessário
            LIMIT 1
        )
    );

-- Política: empresas podem ver produtos de seus colaboradores
-- Usa uma abordagem mais direta para evitar recursão
CREATE POLICY "Companies can view employee products" ON public.employee_products
    FOR SELECT
    USING (
        EXISTS (
            -- Verificar diretamente se o employee pertence a uma company do usuário
            -- sem fazer JOIN que pode causar recursão
            SELECT 1 
            FROM public.employees e
            WHERE e.id = employee_products.employee_id
            AND EXISTS (
                SELECT 1 
                FROM public.companies c
                WHERE c.id = e.company_id
                AND c.owner_user_id = auth.uid()
                LIMIT 1
            )
            LIMIT 1
        )
    );

-- Política: empresas podem inserir produtos para seus colaboradores
CREATE POLICY "Companies can insert employee products" ON public.employee_products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.employees e
            WHERE e.id = employee_products.employee_id
            AND EXISTS (
                SELECT 1 
                FROM public.companies c
                WHERE c.id = e.company_id
                AND c.owner_user_id = auth.uid()
                LIMIT 1
            )
            LIMIT 1
        )
    );

-- Política: empresas podem atualizar produtos de seus colaboradores
CREATE POLICY "Companies can update employee products" ON public.employee_products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.employees e
            WHERE e.id = employee_products.employee_id
            AND EXISTS (
                SELECT 1 
                FROM public.companies c
                WHERE c.id = e.company_id
                AND c.owner_user_id = auth.uid()
                LIMIT 1
            )
            LIMIT 1
        )
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

