-- Script para corrigir políticas RLS da tabela cpf_clients
-- Este script permite que o admin client (service role) acesse todos os dados

-- 1. Desabilitar RLS temporariamente para recriar políticas
ALTER TABLE public.cpf_clients DISABLE ROW LEVEL SECURITY;

-- 2. Dropar todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can insert cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can update their own cpf clients" ON public.cpf_clients;
DROP POLICY IF EXISTS "Users can delete their own cpf clients" ON public.cpf_clients;

-- 3. Reabilitar RLS
ALTER TABLE public.cpf_clients ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas que permitem acesso via service role (admin client)
-- O service role key bypassa RLS automaticamente, mas essas políticas são para clientes regulares

-- Política: Usuários podem ver seus próprios clientes CPF ou clientes sem created_by
CREATE POLICY "Users can view their own cpf clients" ON public.cpf_clients
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- Política: Usuários podem inserir clientes CPF
CREATE POLICY "Users can insert cpf clients" ON public.cpf_clients
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuários podem atualizar seus próprios clientes CPF
CREATE POLICY "Users can update their own cpf clients" ON public.cpf_clients
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Política: Usuários podem deletar seus próprios clientes CPF
CREATE POLICY "Users can delete their own cpf clients" ON public.cpf_clients
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- 5. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'cpf_clients'
ORDER BY policyname;

