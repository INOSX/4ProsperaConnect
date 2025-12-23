-- Script para verificar se as políticas RLS estão usando as funções SECURITY DEFINER
-- Execute este script no SQL Editor do Supabase

-- Verificar se as políticas estão usando as funções
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
WHERE tablename = 'employee_products'
ORDER BY policyname;

-- Verificar se as políticas contêm referências às funções
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%check_employee_company_access%' OR qual LIKE '%check_employee_self_access%' 
        THEN '✅ Usa função SECURITY DEFINER'
        WHEN with_check LIKE '%check_employee_company_access%' OR with_check LIKE '%check_employee_self_access%'
        THEN '✅ Usa função SECURITY DEFINER'
        ELSE '❌ NÃO usa função (pode causar recursão)'
    END as status
FROM pg_policies
WHERE tablename = 'employee_products'
ORDER BY policyname;

