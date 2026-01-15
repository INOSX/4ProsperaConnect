-- ============================================
-- SCRIPT DE SINCRONIZAÇÃO: Authentication → Clients
-- ============================================
-- Este script identifica usuários que existem no auth.users
-- mas NÃO existem na tabela public.clients e cria os registros faltantes
-- Data: 15/01/2026
-- ============================================

-- 1️⃣ VERIFICAR DIFERENÇA: Authentication vs Clients
-- ============================================
SELECT 
    '🔍 USUÁRIOS NO AUTHENTICATION MAS NÃO EM CLIENTS' as secao,
    au.email,
    au.id as auth_user_id,
    au.created_at as auth_created_at,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '⚠️ Email não confirmado'
    END as status_email
FROM auth.users au
LEFT JOIN public.clients cl ON cl.user_id = au.id
WHERE cl.id IS NULL  -- Usuários que NÃO estão na tabela clients
ORDER BY au.created_at DESC;

-- ============================================

-- 2️⃣ ESTATÍSTICAS: Comparação Authentication vs Clients
-- ============================================
SELECT 
    '📊 ESTATÍSTICAS DE SINCRONIZAÇÃO' as secao,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.clients) as total_clients,
    (SELECT COUNT(*) FROM auth.users au 
     LEFT JOIN public.clients cl ON cl.user_id = au.id 
     WHERE cl.id IS NULL) as usuarios_faltando,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.clients) 
        THEN '✅ SINCRONIZADO'
        ELSE '❌ DESSINCRONIZADO'
    END as status_sincronizacao;

-- ============================================

-- 3️⃣ SINCRONIZAR: Criar registros em clients para usuários do Authentication
-- ============================================
-- ⚠️ ESTE INSERT CRIA OS REGISTROS FALTANTES

DO $$
DECLARE
    v_count INTEGER;
    v_user RECORD;
BEGIN
    -- Inserir usuários que existem no auth mas não em clients
    FOR v_user IN 
        SELECT 
            au.id as user_id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'name', 
                     SPLIT_PART(au.email, '@', 1)) as name,
            au.created_at
        FROM auth.users au
        LEFT JOIN public.clients cl ON cl.user_id = au.id
        WHERE cl.id IS NULL
    LOOP
        -- Gerar código único do cliente
        INSERT INTO public.clients (
            user_id,
            client_code,
            name,
            email,
            role,  -- Marcar como admin por padrão
            created_at
        ) VALUES (
            v_user.user_id,
            'CLI-' || UPPER(SUBSTRING(MD5(v_user.user_id::text || v_user.email) FROM 1 FOR 8)),
            v_user.name,
            v_user.email,
            'admin',  -- ✅ Todos os novos usuários como ADMIN
            v_user.created_at
        );
        
        RAISE NOTICE '✅ Cliente criado: % (%)', v_user.email, v_user.name;
    END LOOP;
    
    -- Contar quantos foram criados
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '📊 Total de clientes criados: %', v_count;
END $$;

-- ============================================

-- 4️⃣ VERIFICAR RESULTADO DA SINCRONIZAÇÃO
-- ============================================
SELECT 
    '✅ VERIFICAÇÃO PÓS-SINCRONIZAÇÃO' as secao,
    email,
    COALESCE(name, 'Sem nome') as name,
    role,
    client_code,
    created_at
FROM public.clients
ORDER BY created_at DESC;

-- ============================================

-- 5️⃣ MARCAR TODOS COMO ADMIN (se ainda houver users)
-- ============================================
UPDATE public.clients 
SET role = 'admin'
WHERE role = 'user' OR role IS NULL;

-- ============================================

-- 6️⃣ RELATÓRIO FINAL
-- ============================================
SELECT 
    '📈 RELATÓRIO FINAL' as secao,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.clients) as total_clients_agora,
    (SELECT COUNT(*) FROM public.clients WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM public.clients WHERE role = 'user') as total_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.clients) 
        THEN '✅ SINCRONIZADO COM SUCESSO'
        ELSE '⚠️ AINDA DESSINCRONIZADO'
    END as status_final;

-- ============================================

-- 7️⃣ VERIFICAR FABIANA ESPECIFICAMENTE
-- ============================================
SELECT 
    '🔍 STATUS FINAL DA FABIANA' as secao,
    cl.email,
    cl.name,
    cl.role,
    cl.client_code,
    au.email_confirmed_at,
    CASE 
        WHEN cl.role = 'admin' THEN '✅ PRONTA PARA USAR - ADMIN'
        ELSE '❌ AINDA PRECISA SER ADMIN'
    END as status
FROM public.clients cl
INNER JOIN auth.users au ON au.id = cl.user_id
WHERE cl.email = 'fabiana.bispo@foursys.com.br';

-- ============================================
-- FIM DO SCRIPT DE SINCRONIZAÇÃO
-- ============================================
