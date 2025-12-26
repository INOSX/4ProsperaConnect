-- Script para implementar sistema completo de permissões Admin (Versão 2 - com Admin do Cliente)
-- Execute este script no SQL Editor do Supabase APÓS executar create_company_admin_system.sql
-- Este script substitui e atualiza create_admin_full_access_rls.sql

-- ============================================
-- 1. FUNÇÕES HELPER (se não existirem)
-- ============================================

-- Verificar se é Admin do Banco
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.clients 
        WHERE id = user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é Admin do Cliente de uma empresa específica
CREATE OR REPLACE FUNCTION public.is_company_admin(user_id UUID, company_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.employees 
        WHERE platform_user_id = user_id 
        AND company_id = company_id_param
        AND is_company_admin = true
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é Admin do Cliente de qualquer empresa
CREATE OR REPLACE FUNCTION public.is_company_admin_any(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.employees 
        WHERE platform_user_id = user_id 
        AND is_company_admin = true
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ATUALIZAR POLÍTICAS RLS PARA COMPANIES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admin or user can view companies" ON public.companies;
DROP POLICY IF EXISTS "Only admin can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admin or user can update companies" ON public.companies;
DROP POLICY IF EXISTS "Admin or user can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies (with admin support)" ON public.companies;

-- SELECT: Admin do Banco vê todas OU Admin do Cliente vê empresas onde é admin OU colaborador vê empresas onde trabalha
CREATE POLICY "View companies based on role" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin do Banco vê todas
            public.is_admin(auth.uid())
            OR
            -- Admin do Cliente vê empresas onde é admin
            public.is_company_admin_any(auth.uid()) AND EXISTS (
                SELECT 1 FROM public.employees 
                WHERE company_id = companies.id 
                AND platform_user_id = auth.uid()
                AND is_company_admin = true
                AND is_active = true
            )
            OR
            -- Colaborador normal vê empresas onde trabalha
            (
                owner_user_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.employees 
                    WHERE company_id = companies.id 
                    AND platform_user_id = auth.uid()
                    AND is_active = true
                )
            )
        )
    );

-- INSERT: APENAS Admin do Banco pode criar (com owner_user_id = NULL)
CREATE POLICY "Only bank admin can insert companies" ON public.companies
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid()) AND
        owner_user_id IS NULL  -- Empresas criadas por admins não têm owner
    );

-- UPDATE: Admin do Banco pode editar qualquer OU Admin do Cliente pode editar empresas onde é admin
CREATE POLICY "Update companies based on role" ON public.companies
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            public.is_company_admin(auth.uid(), companies.id)
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            public.is_company_admin(auth.uid(), companies.id)
        )
    );

-- DELETE: Apenas Admin do Banco pode deletar
CREATE POLICY "Only bank admin can delete companies" ON public.companies
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- ============================================
-- 3. ATUALIZAR POLÍTICAS RLS PARA EMPLOYEES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admin or user can view employees" ON public.employees;
DROP POLICY IF EXISTS "Admin or user can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Admin or user can update employees" ON public.employees;
DROP POLICY IF EXISTS "Admin or user can delete employees" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees (with admin support)" ON public.employees;

-- SELECT: Admin do Banco vê todos OU Admin do Cliente vê colaboradores das empresas onde é admin OU colaborador vê seus dados
CREATE POLICY "View employees based on role" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin do Banco vê todos
            public.is_admin(auth.uid())
            OR
            -- Admin do Cliente vê colaboradores das empresas onde é admin
            (
                public.is_company_admin_any(auth.uid()) AND
                public.is_company_admin(auth.uid(), employees.company_id)
            )
            OR
            -- Colaborador normal vê apenas seus próprios dados
            platform_user_id = auth.uid()
        )
    );

-- INSERT: Admin do Banco pode criar em qualquer empresa OU Admin do Cliente pode criar apenas em empresas onde é admin
CREATE POLICY "Insert employees based on role" ON public.employees
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Admin do Banco pode criar em qualquer empresa
            public.is_admin(auth.uid())
            OR
            -- Admin do Cliente pode criar apenas em empresas onde é admin
            (
                public.is_company_admin_any(auth.uid()) AND
                public.is_company_admin(auth.uid(), employees.company_id)
            )
        )
        -- Validação adicional: não permitir que admin do banco seja adicionado como employee
        AND NOT public.is_admin(employees.platform_user_id)
    );

-- UPDATE: Admin do Banco pode editar qualquer OU Admin do Cliente pode editar colaboradores das empresas onde é admin OU colaborador edita seus dados
CREATE POLICY "Update employees based on role" ON public.employees
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                public.is_company_admin_any(auth.uid()) AND
                public.is_company_admin(auth.uid(), employees.company_id)
            )
            OR
            platform_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                public.is_company_admin_any(auth.uid()) AND
                public.is_company_admin(auth.uid(), employees.company_id)
            )
            OR
            platform_user_id = auth.uid()
        )
        -- Validação adicional: não permitir que admin do banco seja adicionado como employee
        AND NOT public.is_admin(employees.platform_user_id)
    );

-- DELETE: Admin do Banco pode deletar qualquer OU Admin do Cliente pode deletar colaboradores das empresas onde é admin (exceto outros admins)
CREATE POLICY "Delete employees based on role" ON public.employees
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                public.is_company_admin_any(auth.uid()) AND
                public.is_company_admin(auth.uid(), employees.company_id) AND
                -- Admin do Cliente não pode deletar outros admins
                NOT (employees.is_company_admin = true AND employees.platform_user_id != auth.uid())
            )
        )
    );

-- ============================================
-- 4. POLÍTICAS RLS PARA DATA_CONNECTIONS (sem mudanças - apenas Admin do Banco)
-- ============================================

-- Manter políticas existentes (já estão corretas)
-- Apenas Admin do Banco pode criar/editar/deletar conexões

-- ============================================
-- 5. POLÍTICAS RLS PARA PROSPECTS (apenas Admin do Banco)
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admin or user can view prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admin or user can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admin or user can update prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admin or user can delete prospects" ON public.prospects;

-- SELECT: Apenas Admin do Banco pode ver
CREATE POLICY "Only bank admin can view prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- INSERT: Apenas Admin do Banco pode criar
CREATE POLICY "Only bank admin can insert prospects" ON public.prospects
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- UPDATE: Apenas Admin do Banco pode editar
CREATE POLICY "Only bank admin can update prospects" ON public.prospects
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- DELETE: Apenas Admin do Banco pode deletar
CREATE POLICY "Only bank admin can delete prospects" ON public.prospects
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- ============================================
-- 6. POLÍTICAS RLS PARA CPF_CLIENTS (apenas Admin do Banco)
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admin or user can view cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Admin or user can insert cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Admin or user can update cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Admin or user can delete cpf clients" ON public.cpf_clients;

-- SELECT: Apenas Admin do Banco pode ver
CREATE POLICY "Only bank admin can view cpf clients" ON public.cpf_clients
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- INSERT: Apenas Admin do Banco pode criar
CREATE POLICY "Only bank admin can insert cpf clients" ON public.cpf_clients
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- UPDATE: Apenas Admin do Banco pode editar
CREATE POLICY "Only bank admin can update cpf clients" ON public.cpf_clients
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- DELETE: Apenas Admin do Banco pode deletar
CREATE POLICY "Only bank admin can delete cpf clients" ON public.cpf_clients
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- ============================================
-- 7. POLÍTICAS RLS PARA UNBANKED_COMPANIES (apenas Admin do Banco)
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admin or user can view unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Admin or user can insert unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Admin or user can update unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Admin or user can delete unbanked companies" ON public.unbanked_companies;

-- SELECT: Apenas Admin do Banco pode ver
CREATE POLICY "Only bank admin can view unbanked companies" ON public.unbanked_companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- INSERT: Apenas Admin do Banco pode criar
CREATE POLICY "Only bank admin can insert unbanked companies" ON public.unbanked_companies
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- UPDATE: Apenas Admin do Banco pode editar
CREATE POLICY "Only bank admin can update unbanked companies" ON public.unbanked_companies
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- DELETE: Apenas Admin do Banco pode deletar
CREATE POLICY "Only bank admin can delete unbanked companies" ON public.unbanked_companies
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- ============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION public.is_admin(UUID) IS 'Verifica se um usuário é Admin do Banco';
COMMENT ON FUNCTION public.is_company_admin(UUID, UUID) IS 'Verifica se um usuário é Admin do Cliente de uma empresa específica';
COMMENT ON FUNCTION public.is_company_admin_any(UUID) IS 'Verifica se um usuário é Admin do Cliente de qualquer empresa';

