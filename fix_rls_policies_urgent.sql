-- Script URGENTE para corrigir políticas RLS que estão bloqueando acesso
-- Execute este script no SQL Editor do Supabase
-- Este script remove políticas existentes e recria com as correções

-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PROSPECTS
-- ============================================

-- Remover TODAS as políticas existentes de prospects (se existirem)
DROP POLICY IF EXISTS "Users can view their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can view prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete prospects" ON public.prospects;

-- Criar políticas corrigidas (sem acesso a auth.users)
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

