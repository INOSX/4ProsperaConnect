-- Script COMPLETO para corrigir TODAS as políticas RLS
-- Execute este script no SQL Editor do Supabase
-- Este script remove TODAS as políticas existentes e recria com as correções

-- ============================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================

-- Prospects
DROP POLICY IF EXISTS "Users can view their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can view prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete prospects" ON public.prospects;

-- Companies
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their companies" ON public.companies;

-- Employees
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete employees" ON public.employees;

-- Employee Benefits
DROP POLICY IF EXISTS "Users can view employee benefits" ON public.employee_benefits;
DROP POLICY IF EXISTS "Users can insert employee benefits" ON public.employee_benefits;
DROP POLICY IF EXISTS "Users can update employee benefits" ON public.employee_benefits;

-- Data Connections
DROP POLICY IF EXISTS "Users can view their data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can insert data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can update their data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can delete their data connections" ON public.data_connections;

-- Recommendations
DROP POLICY IF EXISTS "Users can view recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can insert recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can update recommendations" ON public.recommendations;

-- Campaigns
DROP POLICY IF EXISTS "Users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their campaigns" ON public.campaigns;

-- Company Benefits
DROP POLICY IF EXISTS "Users can view company benefits" ON public.company_benefits;
DROP POLICY IF EXISTS "Users can insert company benefits" ON public.company_benefits;
DROP POLICY IF EXISTS "Users can update company benefits" ON public.company_benefits;
DROP POLICY IF EXISTS "Users can delete company benefits" ON public.company_benefits;

-- Product Catalog
DROP POLICY IF EXISTS "Anyone can view active products" ON public.product_catalog;
DROP POLICY IF EXISTS "Admins can manage products" ON public.product_catalog;

-- ============================================
-- RECRIAR POLÍTICAS CORRIGIDAS
-- ============================================

-- ============================================
-- PROSPECTS
-- ============================================

CREATE POLICY "Users can view their own prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert prospects" ON public.prospects
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their prospects" ON public.prospects
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their prospects" ON public.prospects
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- COMPANIES
-- ============================================

CREATE POLICY "Users can view their companies" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            owner_user_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.employees WHERE company_id = companies.id AND platform_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert companies" ON public.companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their companies" ON public.companies
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their companies" ON public.companies
    FOR DELETE
    USING (owner_user_id = auth.uid());

-- ============================================
-- EMPLOYEES
-- ============================================

CREATE POLICY "Users can view employees" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.companies WHERE id = employees.company_id AND owner_user_id = auth.uid())
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
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete employees" ON public.employees
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    );

-- ============================================
-- EMPLOYEE_BENEFITS
-- ============================================

CREATE POLICY "Users can view employee benefits" ON public.employee_benefits
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert employee benefits" ON public.employee_benefits
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.companies c ON e.company_id = c.id
            WHERE e.id = employee_benefits.employee_id
            AND c.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update employee benefits" ON public.employee_benefits
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    );

-- ============================================
-- DATA_CONNECTIONS
-- ============================================

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
-- RECOMMENDATIONS
-- ============================================

CREATE POLICY "Users can view recommendations" ON public.recommendations
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert recommendations" ON public.recommendations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update recommendations" ON public.recommendations
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- CAMPAIGNS
-- ============================================

CREATE POLICY "Users can view campaigns" ON public.campaigns
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert campaigns" ON public.campaigns
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their campaigns" ON public.campaigns
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their campaigns" ON public.campaigns
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- COMPANY_BENEFITS
-- ============================================

CREATE POLICY "Users can view company benefits" ON public.company_benefits
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert company benefits" ON public.company_benefits
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update company benefits" ON public.company_benefits
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete company benefits" ON public.company_benefits
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

-- ============================================
-- PRODUCT_CATALOG
-- ============================================

CREATE POLICY "Anyone can view active products" ON public.product_catalog
    FOR SELECT
    USING (is_active = true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 
    'Políticas RLS corrigidas com sucesso!' as status,
    COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('prospects', 'companies', 'employees', 'employee_benefits', 'data_connections', 'recommendations', 'campaigns', 'company_benefits', 'product_catalog');

