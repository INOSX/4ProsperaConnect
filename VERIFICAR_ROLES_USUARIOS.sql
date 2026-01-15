-- ============================================
-- SCRIPT DE VERIFICAÇÃO DE ROLES DOS USUÁRIOS
-- Execute este script no Supabase SQL Editor
-- Data: 15/01/2026
-- ============================================

-- 1️⃣ ESTATÍSTICAS GERAIS DE ROLES
-- ============================================
SELECT 
    '📊 RESUMO GERAL DE ROLES' as secao,
    '' as email,
    '' as name,
    role,
    COUNT(*) as total_usuarios,
    CASE 
        WHEN role = 'admin' THEN '✅ Admin (acesso total)'
        WHEN role = 'user' THEN '❌ User (acesso restrito)'
        ELSE '⚠️ Role indefinido'
    END as status_acesso
FROM public.clients
GROUP BY role
ORDER BY role;

-- ============================================

-- 2️⃣ LISTA COMPLETA DE TODOS OS USUÁRIOS
-- ============================================
SELECT 
    '👥 LISTA DE TODOS OS USUÁRIOS' as secao,
    email,
    COALESCE(name, 'Sem nome') as name,
    COALESCE(role, 'NULL') as role,
    user_id,
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅ Admin'
        WHEN role = 'user' THEN '❌ User'
        ELSE '⚠️ Indefinido'
    END as status_acesso
FROM public.clients
ORDER BY created_at DESC;

-- ============================================

-- 3️⃣ USUÁRIOS COM ROLE 'USER' OU NULL (Precisam ser admin)
-- ============================================
SELECT 
    '⚠️ USUÁRIOS QUE PRECISAM SER ADMIN' as secao,
    email,
    COALESCE(name, 'Sem nome') as name,
    COALESCE(role, 'NULL') as role_atual,
    user_id,
    created_at
FROM public.clients
WHERE role = 'user' OR role IS NULL
ORDER BY created_at DESC;

-- ============================================

-- 4️⃣ VERIFICAÇÃO ESPECÍFICA DA FABIANA
-- ============================================
SELECT 
    '🔍 VERIFICAÇÃO FABIANA BISPO' as secao,
    email,
    COALESCE(name, 'Sem nome') as name,
    COALESCE(role, 'NULL') as role,
    user_id,
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅ ESTÁ COMO ADMIN - OK!'
        WHEN role = 'user' THEN '❌ AINDA É USER - PRECISA ATUALIZAR'
        ELSE '⚠️ ROLE INDEFINIDO - PRECISA ATUALIZAR'
    END as status
FROM public.clients
WHERE email = 'fabiana.bispo@foursys.com.br';

-- ============================================

-- 5️⃣ TOTAL DE USUÁRIOS ADMIN vs USER
-- ============================================
SELECT 
    '📈 TOTALIZADOR' as secao,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as total_users,
    SUM(CASE WHEN role IS NULL THEN 1 ELSE 0 END) as total_sem_role,
    COUNT(*) as total_geral,
    ROUND(
        (SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100), 
        2
    ) as percentual_admins
FROM public.clients;

-- ============================================

-- 6️⃣ ÚLTIMOS 10 USUÁRIOS CRIADOS
-- ============================================
SELECT 
    '🆕 ÚLTIMOS 10 USUÁRIOS CRIADOS' as secao,
    email,
    COALESCE(name, 'Sem nome') as name,
    COALESCE(role, 'NULL') as role,
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅'
        WHEN role = 'user' THEN '❌'
        ELSE '⚠️'
    END as status
FROM public.clients
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- IMPORTANTE: Se houver usuários com role 'user' ou NULL,
-- execute o script abaixo para marcar todos como admin:
-- ============================================

/*
-- ⚠️ DESCOMENTE E EXECUTE APENAS SE HOUVER USUÁRIOS NÃO-ADMIN

UPDATE public.clients 
SET role = 'admin'
WHERE role = 'user' OR role IS NULL;

-- Verificar quantos foram atualizados
SELECT 
    'Atualização concluída!' as resultado,
    role,
    COUNT(*) as total
FROM public.clients
GROUP BY role;
*/

-- ============================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ============================================
