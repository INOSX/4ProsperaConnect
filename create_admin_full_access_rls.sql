-- Script para implementar sistema completo de permissões Admin
-- Execute este script no SQL Editor do Supabase
-- Este script atualiza todas as políticas RLS e adiciona triggers para garantir que apenas admins possam criar empresas e conexões

-- ============================================
-- 1. FUNÇÃO HELPER PARA VERIFICAR SE É ADMIN
-- ============================================

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

-- ============================================
-- 2. ATUALIZAR POLÍTICAS RLS PARA COMPANIES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view companies (with admin support)" ON public.companies;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their companies" ON public.companies;

-- SELECT: Admin vê todas OU cliente vê apenas suas empresas (onde é owner ou colaborador)
CREATE POLICY "Admin or user can view companies" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin pode ver todas as empresas
            public.is_admin(auth.uid())
            OR
            -- Cliente vê apenas suas empresas ou empresas onde é colaborador
            (
                owner_user_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.employees 
                    WHERE company_id = companies.id 
                    AND platform_user_id = auth.uid()
                )
            )
        )
    );

-- INSERT: APENAS ADMIN pode criar (com owner_user_id = NULL)
CREATE POLICY "Only admin can insert companies" ON public.companies
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid()) AND
        owner_user_id IS NULL  -- Empresas criadas por admins não têm owner
    );

-- UPDATE: Admin pode editar qualquer empresa OU cliente edita apenas suas
CREATE POLICY "Admin or user can update companies" ON public.companies
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            owner_user_id = auth.uid()
        )
    );

-- DELETE: Admin pode deletar qualquer empresa OU cliente deleta apenas suas
CREATE POLICY "Admin or user can delete companies" ON public.companies
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            owner_user_id = auth.uid()
        )
    );

-- ============================================
-- 3. ATUALIZAR POLÍTICAS RLS PARA EMPLOYEES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view employees (with admin support)" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete employees" ON public.employees;

-- SELECT: Admin vê todos OU cliente vê seus colaboradores
CREATE POLICY "Admin or user can view employees" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin pode ver todos os colaboradores
            public.is_admin(auth.uid())
            OR
            -- Cliente vê apenas seus próprios dados ou colaboradores de suas empresas
            (
                platform_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.companies 
                    WHERE id = employees.company_id 
                    AND owner_user_id = auth.uid()
                )
            )
        )
    );

-- INSERT: Admin pode criar em qualquer empresa OU cliente apenas em suas empresas
CREATE POLICY "Admin or user can insert employees" ON public.employees
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Admin pode criar em qualquer empresa
            public.is_admin(auth.uid())
            OR
            -- Cliente apenas em suas empresas
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
        -- Validação adicional: não permitir que admin seja adicionado como employee
        AND NOT public.is_admin(employees.platform_user_id)
    );

-- UPDATE: Admin pode editar qualquer colaborador OU cliente apenas seus
CREATE POLICY "Admin or user can update employees" ON public.employees
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                platform_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.companies 
                    WHERE id = employees.company_id 
                    AND owner_user_id = auth.uid()
                )
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                platform_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.companies 
                    WHERE id = employees.company_id 
                    AND owner_user_id = auth.uid()
                )
            )
        )
        -- Validação adicional: não permitir que admin seja adicionado como employee
        AND NOT public.is_admin(employees.platform_user_id)
    );

-- DELETE: Admin pode deletar qualquer colaborador OU cliente apenas seus
CREATE POLICY "Admin or user can delete employees" ON public.employees
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            (
                platform_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.companies 
                    WHERE id = employees.company_id 
                    AND owner_user_id = auth.uid()
                )
            )
        )
    );

-- ============================================
-- 4. POLÍTICAS RLS PARA DATA_CONNECTIONS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can insert data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can update their data connections" ON public.data_connections;
DROP POLICY IF EXISTS "Users can delete their data connections" ON public.data_connections;

-- SELECT: Admin vê todas OU cliente vê apenas suas conexões (se existirem)
CREATE POLICY "Admin or user can view data connections" ON public.data_connections
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin pode ver todas as conexões
            public.is_admin(auth.uid())
            OR
            -- Cliente vê apenas suas conexões (se existirem)
            created_by = auth.uid()
        )
    );

-- INSERT: APENAS ADMIN pode criar conexões
CREATE POLICY "Only admin can insert data connections" ON public.data_connections
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- UPDATE: APENAS ADMIN pode atualizar conexões
CREATE POLICY "Only admin can update data connections" ON public.data_connections
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- DELETE: APENAS ADMIN pode deletar conexões
CREATE POLICY "Only admin can delete data connections" ON public.data_connections
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())
    );

-- ============================================
-- 5. POLÍTICAS RLS PARA PROSPECTS
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their prospects" ON public.prospects;

-- SELECT: Admin vê todos OU cliente vê apenas seus
CREATE POLICY "Admin or user can view prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- INSERT: Admin pode criar sem restrições OU cliente cria normalmente
CREATE POLICY "Admin or user can insert prospects" ON public.prospects
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Admin pode editar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can update prospects" ON public.prospects
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- DELETE: Admin pode deletar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can delete prospects" ON public.prospects
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- ============================================
-- 6. POLÍTICAS RLS PARA CPF_CLIENTS
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can insert cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can update their cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can delete their cpf clients" ON public.cpf_clients;

-- SELECT: Admin vê todos OU cliente vê apenas seus
CREATE POLICY "Admin or user can view cpf clients" ON public.cpf_clients
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- INSERT: Admin pode criar sem restrições OU cliente cria normalmente
CREATE POLICY "Admin or user can insert cpf clients" ON public.cpf_clients
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Admin pode editar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can update cpf clients" ON public.cpf_clients
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- DELETE: Admin pode deletar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can delete cpf clients" ON public.cpf_clients
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- ============================================
-- 7. POLÍTICAS RLS PARA UNBANKED_COMPANIES
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Users can insert unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Users can update their unbanked companies" ON public.unbanked_companies;
DROP POLICY IF EXISTS "Users can delete their unbanked companies" ON public.unbanked_companies;

-- SELECT: Admin vê todos OU cliente vê apenas seus
CREATE POLICY "Admin or user can view unbanked companies" ON public.unbanked_companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- INSERT: Admin pode criar sem restrições OU cliente cria normalmente
CREATE POLICY "Admin or user can insert unbanked companies" ON public.unbanked_companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Admin pode editar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can update unbanked companies" ON public.unbanked_companies
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- DELETE: Admin pode deletar qualquer OU cliente apenas seus
CREATE POLICY "Admin or user can delete unbanked companies" ON public.unbanked_companies
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_admin(auth.uid())
            OR
            created_by = auth.uid() OR created_by IS NULL
        )
    );

-- ============================================
-- 8. TRIGGERS PARA GARANTIR COMPORTAMENTO CORRETO
-- ============================================

-- Trigger para garantir que empresas criadas por admins tenham owner_user_id = NULL
CREATE OR REPLACE FUNCTION public.ensure_admin_companies_no_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o usuário é admin, garantir que owner_user_id seja NULL
    IF public.is_admin(auth.uid()) THEN
        NEW.owner_user_id := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_admin_companies_no_owner ON public.companies;
CREATE TRIGGER trigger_ensure_admin_companies_no_owner
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_admin_companies_no_owner();

-- Trigger para prevenir que admins sejam adicionados como employees
CREATE OR REPLACE FUNCTION public.prevent_admin_as_employee()
RETURNS TRIGGER AS $$
BEGIN
    -- Se platform_user_id é admin, rejeitar
    IF public.is_admin(NEW.platform_user_id) THEN
        RAISE EXCEPTION 'Admins não podem ser adicionados como colaboradores';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_admin_as_employee ON public.employees;
CREATE TRIGGER trigger_prevent_admin_as_employee
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_admin_as_employee();

-- ============================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION public.is_admin(UUID) IS 'Verifica se um usuário é admin';
COMMENT ON FUNCTION public.ensure_admin_companies_no_owner() IS 'Garante que empresas criadas por admins tenham owner_user_id = NULL';
COMMENT ON FUNCTION public.prevent_admin_as_employee() IS 'Previne que admins sejam adicionados como colaboradores';

