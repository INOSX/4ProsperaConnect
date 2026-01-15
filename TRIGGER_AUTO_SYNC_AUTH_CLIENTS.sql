-- ============================================
-- TRIGGER AUTOMÁTICO: Auth.users → Public.clients
-- ============================================
-- Este trigger garante que SEMPRE que um usuário for criado
-- no auth.users, um registro correspondente seja criado
-- automaticamente em public.clients com role = 'admin'
-- Data: 15/01/2026
-- ============================================

-- 1️⃣ CRIAR FUNÇÃO QUE SERÁ EXECUTADA PELO TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_name TEXT;
    v_client_code TEXT;
BEGIN
    -- Extrair nome do metadata ou usar email como fallback
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Gerar código único do cliente
    v_client_code := 'CLI-' || UPPER(SUBSTRING(MD5(NEW.id::text || NEW.email) FROM 1 FOR 8));
    
    -- Inserir novo cliente na tabela clients
    INSERT INTO public.clients (
        user_id,
        client_code,
        name,
        email,
        role,  -- ✅ SEMPRE ADMIN POR PADRÃO
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_client_code,
        v_name,
        NEW.email,
        'admin',  -- ✅ TODOS OS NOVOS USUÁRIOS COMO ADMIN
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;  -- Evitar erro se já existir
    
    RAISE NOTICE '✅ Cliente criado automaticamente para usuário: % (%)', NEW.email, v_name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================

-- 2️⃣ CRIAR TRIGGER QUE MONITORA INSERÇÕES EM auth.users
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================

-- 3️⃣ COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Função de trigger que cria automaticamente um registro em public.clients sempre que um novo usuário é criado em auth.users. Marca todos os novos usuários como admin por padrão.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Trigger que executa handle_new_user() após cada inserção em auth.users, garantindo sincronização automática com public.clients';

-- ============================================

-- 4️⃣ TESTAR O TRIGGER (SIMULAÇÃO)
-- ============================================
-- ATENÇÃO: Não execute esta seção em produção
-- Isso é apenas para teste em ambiente de desenvolvimento

/*
-- Simular criação de um usuário de teste
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste@exemplo.com',
    crypt('senha123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Usuario Teste"}'::jsonb,
    NOW(),
    NOW()
);

-- Verificar se o cliente foi criado automaticamente
SELECT 
    'TESTE DO TRIGGER' as secao,
    email,
    name,
    role,
    client_code
FROM public.clients
WHERE email = 'teste@exemplo.com';
*/

-- ============================================

-- 5️⃣ VERIFICAR SE O TRIGGER FOI CRIADO COM SUCESSO
-- ============================================
SELECT 
    '✅ VERIFICAÇÃO DO TRIGGER' as secao,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ TRIGGER ATIVO'
        ELSE '⚠️ TRIGGER NÃO ENCONTRADO'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================

-- 6️⃣ VERIFICAR A FUNÇÃO
-- ============================================
SELECT 
    '✅ VERIFICAÇÃO DA FUNÇÃO' as secao,
    routine_name,
    routine_type,
    data_type,
    CASE 
        WHEN routine_name = 'handle_new_user' THEN '✅ FUNÇÃO CRIADA'
        ELSE '⚠️ FUNÇÃO NÃO ENCONTRADA'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- ============================================
-- FIM DO SCRIPT DE TRIGGER AUTOMÁTICO
-- ============================================

-- ============================================
-- IMPORTANTE: Após executar este script:
-- ============================================
-- 1. Todos os NOVOS usuários criados via signup serão automaticamente
--    inseridos em public.clients com role = 'admin'
-- 2. Para usuários EXISTENTES que não têm registro em clients,
--    execute o script SINCRONIZAR_AUTH_CLIENTS.sql
-- 3. O trigger NÃO afeta usuários já existentes, apenas novos
-- ============================================
