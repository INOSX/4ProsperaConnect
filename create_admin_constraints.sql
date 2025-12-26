-- Script para criar constraints e triggers adicionais para o sistema de Admin
-- Execute este script no SQL Editor do Supabase APÓS executar create_admin_full_access_rls.sql

-- ============================================
-- 1. TRIGGER PARA GARANTIR owner_user_id = NULL QUANDO ADMIN CRIA EMPRESA
-- ============================================

-- Este trigger já está em create_admin_full_access_rls.sql, mas incluímos aqui para referência
-- Se já existe, não causará erro devido ao DROP IF EXISTS

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

-- ============================================
-- 2. TRIGGER PARA PREVENIR ADMIN COMO EMPLOYEE
-- ============================================

-- Este trigger já está em create_admin_full_access_rls.sql, mas incluímos aqui para referência

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
-- 3. TRIGGER PARA GARANTIR QUE APENAS ADMINS CRIEM DATA_CONNECTIONS
-- ============================================

-- Este trigger é uma camada adicional de segurança além das políticas RLS
CREATE OR REPLACE FUNCTION public.ensure_only_admin_creates_connections()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não é admin, rejeitar
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Apenas administradores podem criar conexões de banco de dados';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_only_admin_creates_connections ON public.data_connections;
CREATE TRIGGER trigger_ensure_only_admin_creates_connections
    BEFORE INSERT ON public.data_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_only_admin_creates_connections();

-- ============================================
-- 4. TRIGGER PARA GARANTIR QUE APENAS ADMINS EXECUTEM SINCRONIZAÇÕES
-- ============================================

-- Verificar se a tabela data_sync_jobs existe antes de criar o trigger
CREATE OR REPLACE FUNCTION public.ensure_only_admin_runs_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não é admin, rejeitar
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Apenas administradores podem executar sincronizações de dados';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se a tabela existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'data_sync_jobs'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_ensure_only_admin_runs_sync ON public.data_sync_jobs;
        CREATE TRIGGER trigger_ensure_only_admin_runs_sync
            BEFORE INSERT ON public.data_sync_jobs
            FOR EACH ROW
            EXECUTE FUNCTION public.ensure_only_admin_runs_sync();
    END IF;
END $$;

-- ============================================
-- 5. TRIGGER PARA GARANTIR QUE APENAS ADMINS CRIEM EMPRESAS
-- ============================================

-- Este trigger é uma camada adicional de segurança além das políticas RLS
CREATE OR REPLACE FUNCTION public.ensure_only_admin_creates_companies()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não é admin, rejeitar
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Apenas administradores podem criar empresas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_only_admin_creates_companies ON public.companies;
CREATE TRIGGER trigger_ensure_only_admin_creates_companies
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_only_admin_creates_companies();

-- ============================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION public.ensure_admin_companies_no_owner() IS 'Garante que empresas criadas por admins tenham owner_user_id = NULL';
COMMENT ON FUNCTION public.prevent_admin_as_employee() IS 'Previne que admins sejam adicionados como colaboradores';
COMMENT ON FUNCTION public.ensure_only_admin_creates_connections() IS 'Garante que apenas admins possam criar conexões de banco de dados';
COMMENT ON FUNCTION public.ensure_only_admin_runs_sync() IS 'Garante que apenas admins possam executar sincronizações';
COMMENT ON FUNCTION public.ensure_only_admin_creates_companies() IS 'Garante que apenas admins possam criar empresas';

