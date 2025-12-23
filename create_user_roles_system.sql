-- Script para criar sistema de roles de usuário (Admin vs Usuário Normal)
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. ADICIONAR CAMPO ROLE NA TABELA CLIENTS
-- ============================================

-- Adicionar coluna role se não existir
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_clients_role ON public.clients(role);

-- ============================================
-- 2. ATUALIZAR POLÍTICAS RLS PARA COMPANIES
-- ============================================

-- Remover política antiga
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;

-- Nova política que permite admins verem todas as empresas
CREATE POLICY "Users can view companies (with admin support)" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin pode ver todas as empresas
            EXISTS (
                SELECT 1 FROM public.clients 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
            OR
            -- Usuário normal vê apenas suas empresas ou empresas onde é colaborador
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

-- ============================================
-- 3. ATUALIZAR POLÍTICAS RLS PARA EMPLOYEES
-- ============================================

-- Remover política antiga
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;

-- Nova política que permite admins verem todos os colaboradores
CREATE POLICY "Users can view employees (with admin support)" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin pode ver todos os colaboradores
            EXISTS (
                SELECT 1 FROM public.clients 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
            OR
            -- Usuário normal vê apenas seus próprios dados ou colaboradores de suas empresas
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
-- 4. MARCAR USUÁRIOS EXISTENTES COMO ADMIN (OPCIONAL)
-- ============================================

-- Descomente e ajuste os emails abaixo para marcar usuários específicos como admin
-- UPDATE public.clients 
-- SET role = 'admin'
-- WHERE email IN ('mariomayerlefilho@live.com', 'outro-admin@email.com');

-- ============================================
-- 5. FUNÇÃO HELPER PARA VERIFICAR SE É ADMIN
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
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN public.clients.role IS 'Role do usuário: user (padrão) ou admin (pode ver todos os dados)';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Verifica se um usuário é admin';

