-- Script URGENTE para corrigir políticas RLS que estão bloqueando acesso
-- Execute este script no SQL Editor do Supabase ANTES de qualquer outra coisa

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PROSPECTS
-- ============================================

-- Remover política problemática que tenta acessar auth.users
DROP POLICY IF EXISTS "Users can view their own prospects" ON public.prospects;

-- Criar política corrigida (sem acesso a auth.users)
CREATE POLICY "Users can view their own prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- Adicionar políticas de INSERT, UPDATE e DELETE
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
-- VERIFICAÇÃO RÁPIDA
-- ============================================

-- Testar se a política funciona
SELECT 
    'Política de prospects corrigida!' as status,
    COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'prospects'
AND policyname = 'Users can view their own prospects';

