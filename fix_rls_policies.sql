-- Script para corrigir as políticas RLS que estão bloqueando acesso
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PROSPECTS
-- ============================================

-- Remover TODAS as políticas existentes de prospects (se existirem)
DROP POLICY IF EXISTS "Users can view their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can view prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete prospects" ON public.prospects;

-- Criar políticas mais permissivas para desenvolvimento
-- (Em produção, você deve refinar essas políticas)

-- SELECT: Usuários autenticados podem ver prospects que criaram
CREATE POLICY "Users can view their own prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- INSERT: Usuários autenticados podem criar prospects
CREATE POLICY "Users can insert prospects" ON public.prospects
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários podem atualizar prospects que criaram
CREATE POLICY "Users can update their prospects" ON public.prospects
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- DELETE: Usuários podem deletar prospects que criaram
CREATE POLICY "Users can delete their prospects" ON public.prospects
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA COMPANIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;

CREATE POLICY "Users can view companies" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            owner_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.employees 
                WHERE company_id = companies.id 
                AND platform_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert companies" ON public.companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their companies" ON public.companies
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA EMPLOYEES
-- ============================================

DROP POLICY IF EXISTS "Users can view employees" ON public.employees;

CREATE POLICY "Users can view employees" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert employees" ON public.employees
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update employees" ON public.employees
    FOR UPDATE
    USING (
        platform_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        platform_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    );

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA EMPLOYEE_BENEFITS
-- ============================================

DROP POLICY IF EXISTS "Users can view employee benefits" ON public.employee_benefits;

CREATE POLICY "Users can view employee benefits" ON public.employee_benefits
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM public.employees 
                WHERE id = employee_benefits.employee_id 
                AND platform_user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.employees e
                JOIN public.companies c ON e.company_id = c.id
                WHERE e.id = employee_benefits.employee_id 
                AND c.owner_user_id = auth.uid()
            )
        )
    );

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA DATA_CONNECTIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view their data connections" ON public.data_connections;

CREATE POLICY "Users can view their data connections" ON public.data_connections
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert data connections" ON public.data_connections
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their data connections" ON public.data_connections
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their data connections" ON public.data_connections
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- POLÍTICAS PARA PRODUCT_CATALOG
-- ============================================

-- Permitir que todos vejam produtos ativos
DROP POLICY IF EXISTS "Anyone can view active products" ON public.product_catalog;
DROP POLICY IF EXISTS "Admins can manage products" ON public.product_catalog;

CREATE POLICY "Anyone can view active products" ON public.product_catalog
    FOR SELECT
    USING (is_active = true);

-- ============================================
-- POLÍTICAS PARA RECOMMENDATIONS
-- ============================================

-- Adicionar políticas para recommendations se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'recommendations' 
        AND policyname = 'Users can view recommendations'
    ) THEN
        CREATE POLICY "Users can view recommendations" ON public.recommendations
            FOR SELECT
            USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- ============================================
-- POLÍTICAS PARA CAMPAIGNS
-- ============================================

-- Adicionar políticas para campaigns se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'campaigns' 
        AND policyname = 'Users can view campaigns'
    ) THEN
        CREATE POLICY "Users can view campaigns" ON public.campaigns
            FOR SELECT
            USING (
                auth.uid() IS NOT NULL AND (
                    created_by = auth.uid() OR
                    created_by IS NULL
                )
            );
    END IF;
END $$;

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
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('prospects', 'companies', 'employees', 'employee_benefits', 'data_connections')
ORDER BY tablename, policyname;

