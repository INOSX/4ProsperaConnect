-- Script para criar sistema de Admin do Cliente
-- Execute este script no SQL Editor do Supabase APÓS executar create_admin_full_access_rls.sql

-- ============================================
-- 1. ADICIONAR CAMPO is_company_admin NA TABELA EMPLOYEES
-- ============================================

-- Adicionar coluna is_company_admin se não existir
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN DEFAULT FALSE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_employees_company_admin 
ON public.employees(platform_user_id, is_company_admin) 
WHERE is_company_admin = true;

-- Criar índice adicional para buscar empresas onde usuário é admin
CREATE INDEX IF NOT EXISTS idx_employees_company_admin_company 
ON public.employees(company_id, is_company_admin) 
WHERE is_company_admin = true;

-- ============================================
-- 2. FUNÇÕES HELPER PARA VERIFICAR ADMIN DO CLIENTE
-- ============================================

-- Verificar se usuário é admin de uma empresa específica
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

-- Verificar se usuário é admin de qualquer empresa
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

-- Obter lista de empresas onde usuário é admin
CREATE OR REPLACE FUNCTION public.get_company_admin_companies(user_id UUID)
RETURNS TABLE(company_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT e.company_id
    FROM public.employees e
    WHERE e.platform_user_id = user_id
    AND e.is_company_admin = true
    AND e.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN public.employees.is_company_admin IS 'Indica se o colaborador é admin da empresa (responsável pela manutenção da área da empresa na plataforma)';
COMMENT ON FUNCTION public.is_company_admin(UUID, UUID) IS 'Verifica se um usuário é admin de uma empresa específica';
COMMENT ON FUNCTION public.is_company_admin_any(UUID) IS 'Verifica se um usuário é admin de qualquer empresa';
COMMENT ON FUNCTION public.get_company_admin_companies(UUID) IS 'Retorna lista de IDs das empresas onde o usuário é admin';

