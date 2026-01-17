-- ============================================
-- SISTEMA DE HIERARQUIA DE ROLES (4 NÍVEIS)
-- ============================================
-- Este script cria uma hierarquia de permissões com 4 níveis:
-- 1. super_admin: Mario (controle total do sistema)
-- 2. bank_manager: Gestores do banco (admin da plataforma)
-- 3. company_manager: Gestores de empresas (responsáveis por suas empresas)
-- 4. company_employee: Colaboradores das empresas (funcionários)
--
-- Execute no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. ATUALIZAR CAMPO ROLE NA TABELA CLIENTS
-- ============================================

-- PASSO 1: Remover constraint antiga primeiro
ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_role_check;

-- PASSO 2: Migrar roles existentes para os novos valores
UPDATE public.clients 
SET role = CASE 
    WHEN role = 'admin' THEN 'bank_manager'
    WHEN role = 'user' THEN 'company_employee'
    WHEN role IS NULL THEN 'company_employee'
    WHEN role NOT IN ('super_admin', 'bank_manager', 'company_manager', 'company_employee') THEN 'company_employee'
    ELSE role
END;

-- PASSO 3: Atualizar coluna role com os novos valores
ALTER TABLE public.clients 
ALTER COLUMN role TYPE TEXT,
ALTER COLUMN role SET DEFAULT 'company_employee';

-- PASSO 4: Adicionar nova constraint com os 4 níveis
ALTER TABLE public.clients 
ADD CONSTRAINT clients_role_check 
CHECK (role IN ('super_admin', 'bank_manager', 'company_manager', 'company_employee'));

-- Comentário atualizado
COMMENT ON COLUMN public.clients.role IS 
'Hierarquia de roles:
- super_admin: Controle total do sistema (Mario)
- bank_manager: Gestores do banco (admins da plataforma)
- company_manager: Gestores de empresas (responsáveis por empresas)
- company_employee: Colaboradores das empresas (funcionários)';

-- ============================================
-- 2. FUNÇÕES HELPER PARA VERIFICAR ROLES
-- ============================================

-- Dropar funções antigas para recriar com novos parâmetros
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_bank_manager(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_company_manager(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_company_employee(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;

-- Função: Verificar se é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.clients 
        WHERE user_id = check_user_id 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_super_admin(UUID) IS 
'Verifica se um usuário é Super Admin (controle total)';

-- Função: Verificar se é Bank Manager (Gestor do Banco)
CREATE OR REPLACE FUNCTION public.is_bank_manager(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.clients 
        WHERE user_id = check_user_id 
        AND role IN ('super_admin', 'bank_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_bank_manager(UUID) IS 
'Verifica se um usuário é Gestor do Banco ou Super Admin';

-- Função: Verificar se é Company Manager (Gestor de Empresa)
CREATE OR REPLACE FUNCTION public.is_company_manager(check_user_id UUID, check_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super Admin e Bank Manager também são considerados gestores
    IF public.is_bank_manager(check_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se é gestor da empresa específica
    RETURN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = check_company_id 
        AND owner_user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_company_manager(UUID, UUID) IS 
'Verifica se um usuário é gestor de uma empresa específica';

-- Função: Verificar se é Company Employee (Colaborador)
CREATE OR REPLACE FUNCTION public.is_company_employee(check_user_id UUID, check_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.employees 
        WHERE company_id = check_company_id 
        AND platform_user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_company_employee(UUID, UUID) IS 
'Verifica se um usuário é colaborador de uma empresa específica';

-- Função: Obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.clients
    WHERE user_id = check_user_id;
    
    RETURN COALESCE(user_role, 'company_employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role(UUID) IS 
'Retorna o role de um usuário';

-- ============================================
-- 3. ATUALIZAR POLÍTICAS RLS - COMPANIES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies (with admin support)" ON public.companies;
DROP POLICY IF EXISTS "View companies based on role" ON public.companies;

-- Nova política de SELECT para companies
CREATE POLICY "View companies by role hierarchy" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Super Admin e Bank Manager veem todas as empresas
            public.is_bank_manager(auth.uid())
            OR
            -- Company Manager vê suas próprias empresas
            owner_user_id = auth.uid()
            OR
            -- Colaboradores veem empresas onde trabalham
            public.is_company_employee(auth.uid(), id)
        )
    );

-- Política de INSERT
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
CREATE POLICY "Insert companies by role" ON public.companies
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Apenas Super Admin e Bank Manager podem criar empresas
            public.is_bank_manager(auth.uid())
        )
    );

-- Política de UPDATE
DROP POLICY IF EXISTS "Users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Update companies based on role" ON public.companies;
CREATE POLICY "Update companies by role" ON public.companies
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Super Admin e Bank Manager podem atualizar qualquer empresa
            public.is_bank_manager(auth.uid())
            OR
            -- Company Manager pode atualizar sua própria empresa
            owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_bank_manager(auth.uid())
            OR
            owner_user_id = auth.uid()
        )
    );

-- Política de DELETE
DROP POLICY IF EXISTS "Users can delete companies" ON public.companies;
CREATE POLICY "Delete companies by role" ON public.companies
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Apenas Super Admin pode deletar empresas
            public.is_super_admin(auth.uid())
        )
    );

-- ============================================
-- 4. ATUALIZAR POLÍTICAS RLS - EMPLOYEES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees (with admin support)" ON public.employees;
DROP POLICY IF EXISTS "View employees based on role" ON public.employees;

-- SELECT
CREATE POLICY "View employees by role hierarchy" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Bank Manager vê todos os colaboradores
            public.is_bank_manager(auth.uid())
            OR
            -- Company Manager vê colaboradores de suas empresas
            public.is_company_manager(auth.uid(), company_id)
            OR
            -- Colaborador vê apenas seus próprios dados
            platform_user_id = auth.uid()
        )
    );

-- INSERT
DROP POLICY IF EXISTS "Users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Insert employees based on role" ON public.employees;
CREATE POLICY "Insert employees by role" ON public.employees
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Bank Manager pode adicionar em qualquer empresa
            public.is_bank_manager(auth.uid())
            OR
            -- Company Manager pode adicionar em suas empresas
            public.is_company_manager(auth.uid(), company_id)
        )
    );

-- UPDATE
DROP POLICY IF EXISTS "Users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Update employees based on role" ON public.employees;
CREATE POLICY "Update employees by role" ON public.employees
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            public.is_bank_manager(auth.uid())
            OR
            public.is_company_manager(auth.uid(), company_id)
            OR
            platform_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            public.is_bank_manager(auth.uid())
            OR
            public.is_company_manager(auth.uid(), company_id)
            OR
            platform_user_id = auth.uid()
        )
    );

-- DELETE
DROP POLICY IF EXISTS "Users can delete employees" ON public.employees;
DROP POLICY IF EXISTS "Delete employees based on role" ON public.employees;
CREATE POLICY "Delete employees by role" ON public.employees
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Apenas Super Admin e Bank Manager podem deletar
            public.is_bank_manager(auth.uid())
            OR
            -- Company Manager pode deletar de suas empresas
            public.is_company_manager(auth.uid(), company_id)
        )
    );

-- ============================================
-- 5. ATUALIZAR FUNÇÃO is_admin EXISTENTE
-- ============================================

-- Atualizar função is_admin para compatibilidade com código existente
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- is_admin agora retorna TRUE para super_admin e bank_manager
    RETURN public.is_bank_manager(check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin(UUID) IS 
'[LEGACY] Verifica se é Super Admin ou Bank Manager. Use is_bank_manager() para novos códigos.';

-- ============================================
-- 6. DEFINIR SUPER ADMIN
-- ============================================

-- Atualizar Mario como Super Admin
UPDATE public.clients 
SET role = 'super_admin'
WHERE email = 'mariomayerlefilho@live.com';

-- Se não existir, avisar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.clients WHERE email = 'mariomayerlefilho@live.com') THEN
        RAISE NOTICE 'AVISO: Usuario mariomayerlefilho@live.com nao encontrado na tabela clients';
        RAISE NOTICE 'Execute o script depois que o usuario fizer login pela primeira vez';
    ELSE
        RAISE NOTICE 'Super Admin definido: mariomayerlefilho@live.com';
    END IF;
END $$;

-- ============================================
-- 7. ATUALIZAR GESTOR TECHSOLUTIONS
-- ============================================

-- Atualizar o gestor da TechSolutions para company_manager
DO $$
BEGIN
    UPDATE public.clients 
    SET role = 'company_manager'
    WHERE email = 'gestor.da.empresa@techsolutions.com.br';
    
    IF FOUND THEN
        RAISE NOTICE 'Gestor TechSolutions atualizado para company_manager';
    ELSE
        RAISE NOTICE 'Gestor TechSolutions nao encontrado (sera atualizado quando o usuario fizer login)';
    END IF;
END $$;

-- ============================================
-- 8. VIEW PARA VISUALIZAR HIERARQUIA
-- ============================================

CREATE OR REPLACE VIEW public.user_roles_hierarchy AS
SELECT 
    c.id as client_id,
    c.user_id,
    c.email,
    c.name,
    c.role,
    CASE 
        WHEN c.role = 'super_admin' THEN 1
        WHEN c.role = 'bank_manager' THEN 2
        WHEN c.role = 'company_manager' THEN 3
        WHEN c.role = 'company_employee' THEN 4
        ELSE 5
    END as role_level,
    CASE 
        WHEN c.role = 'super_admin' THEN 'Controle total do sistema'
        WHEN c.role = 'bank_manager' THEN 'Gestor do banco (admin plataforma)'
        WHEN c.role = 'company_manager' THEN 'Gestor de empresa'
        WHEN c.role = 'company_employee' THEN 'Colaborador de empresa'
        ELSE 'Indefinido'
    END as role_description,
    comp.id as company_id,
    comp.company_name,
    comp.cnpj
FROM public.clients c
LEFT JOIN public.companies comp ON comp.owner_user_id = c.user_id
ORDER BY role_level, c.name;

COMMENT ON VIEW public.user_roles_hierarchy IS 
'View que mostra a hierarquia de roles dos usuários';

-- ============================================
-- 9. RESUMO DA HIERARQUIA
-- ============================================

SELECT 
    '========================================' as linha
UNION ALL
SELECT 'HIERARQUIA DE ROLES CRIADA'
UNION ALL
SELECT '========================================'
UNION ALL
SELECT ''
UNION ALL
SELECT '1. SUPER_ADMIN (Nivel 1):'
UNION ALL
SELECT '   - Mario (mariomayerlefilho@live.com)'
UNION ALL
SELECT '   - Controle total do sistema'
UNION ALL
SELECT ''
UNION ALL
SELECT '2. BANK_MANAGER (Nivel 2):'
UNION ALL
SELECT '   - Gestores do banco'
UNION ALL
SELECT '   - Admin da plataforma'
UNION ALL
SELECT '   - Veem todas as empresas'
UNION ALL
SELECT ''
UNION ALL
SELECT '3. COMPANY_MANAGER (Nivel 3):'
UNION ALL
SELECT '   - Gestores de empresas'
UNION ALL
SELECT '   - Responsaveis por suas empresas'
UNION ALL
SELECT '   - Gerenciam colaboradores'
UNION ALL
SELECT ''
UNION ALL
SELECT '4. COMPANY_EMPLOYEE (Nivel 4):'
UNION ALL
SELECT '   - Colaboradores das empresas'
UNION ALL
SELECT '   - Funcionarios'
UNION ALL
SELECT '   - Acesso limitado aos seus dados'
UNION ALL
SELECT ''
UNION ALL
SELECT '========================================';

-- Verificar roles criados
SELECT 
    role,
    COUNT(*) as total_usuarios,
    STRING_AGG(name || ' (' || email || ')', ', ') as usuarios
FROM public.clients
GROUP BY role
ORDER BY 
    CASE 
        WHEN role = 'super_admin' THEN 1
        WHEN role = 'bank_manager' THEN 2
        WHEN role = 'company_manager' THEN 3
        WHEN role = 'company_employee' THEN 4
        ELSE 5
    END;
