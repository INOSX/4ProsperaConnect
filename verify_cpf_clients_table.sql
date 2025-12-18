-- Script para verificar se a tabela cpf_clients existe e tem dados

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'cpf_clients';

-- 2. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cpf_clients'
ORDER BY ordinal_position;

-- 3. Verificar se há dados
SELECT COUNT(*) as total_records
FROM public.cpf_clients;

-- 4. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'cpf_clients';

-- 5. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'cpf_clients';

-- 6. Listar alguns registros (se houver)
SELECT 
    id,
    cpf,
    name,
    conversion_potential_score,
    status,
    created_by
FROM public.cpf_clients
LIMIT 5;

