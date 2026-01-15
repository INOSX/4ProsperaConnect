-- ============================================
-- SOLUÇÃO ALTERNATIVA: Edge Function para Sincronização
-- ============================================
-- Como não temos permissão para criar triggers em auth.users,
-- vamos usar uma abordagem alternativa com webhook do Supabase
-- Data: 15/01/2026
-- ============================================

-- ⚠️ IMPORTANTE: Este trigger NÃO FUNCIONA devido a restrições de permissão
-- O trigger direto em auth.users requer permissões de superusuário
-- Use a solução alternativa abaixo

-- ============================================
-- SOLUÇÃO 1: Sincronizar Usuários Existentes (EXECUTE ISTO)
-- ============================================

-- Este script sincroniza TODOS os usuários que já existem
-- Execute isto AGORA para corrigir os usuários já criados

DO $$
DECLARE
    v_count INTEGER := 0;
    v_user RECORD;
BEGIN
    RAISE NOTICE '🔄 Iniciando sincronização de usuários...';
    
    -- Inserir usuários que existem no auth mas não em clients
    FOR v_user IN 
        SELECT 
            au.id as user_id,
            au.email,
            COALESCE(
                au.raw_user_meta_data->>'full_name',
                au.raw_user_meta_data->>'name', 
                SPLIT_PART(au.email, '@', 1)
            ) as name,
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
            role,
            created_at
        ) VALUES (
            v_user.user_id,
            'CLI-' || UPPER(SUBSTRING(MD5(v_user.user_id::text || v_user.email) FROM 1 FOR 8)),
            v_user.name,
            v_user.email,
            'admin',  -- ✅ Todos como ADMIN
            v_user.created_at
        );
        
        v_count := v_count + 1;
        RAISE NOTICE '✅ Cliente criado: % (%) - Total: %', v_user.email, v_user.name, v_count;
    END LOOP;
    
    RAISE NOTICE '📊 Sincronização concluída! Total de clientes criados: %', v_count;
    
    IF v_count = 0 THEN
        RAISE NOTICE '✅ Todos os usuários já estão sincronizados!';
    END IF;
END $$;

-- ============================================

-- Marcar TODOS como admin (incluindo os que já existiam)
UPDATE public.clients 
SET role = 'admin'
WHERE role = 'user' OR role IS NULL;

-- ============================================

-- VERIFICAR RESULTADO FINAL
SELECT 
    '📈 RELATÓRIO FINAL' as secao,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.clients) as total_clients,
    (SELECT COUNT(*) FROM public.clients WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM public.clients WHERE role = 'user') as total_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.clients) 
        THEN '✅ SINCRONIZADO COM SUCESSO'
        ELSE '⚠️ AINDA DESSINCRONIZADO'
    END as status_final;

-- ============================================

-- LISTAR TODOS OS USUÁRIOS SINCRONIZADOS
SELECT 
    '👥 TODOS OS USUÁRIOS' as secao,
    email,
    name,
    role,
    client_code,
    created_at
FROM public.clients
ORDER BY created_at DESC;

-- ============================================
-- FIM DO SCRIPT DE SINCRONIZAÇÃO
-- ============================================
