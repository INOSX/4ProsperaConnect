-- ============================================
-- SCRIPT PARA CRIAR USUARIO GESTOR + EMPRESA FICTICIA
-- ============================================
-- Este script cria um novo usuario no auth.users SEM enviar email
-- e depois cria a empresa, cliente e colaboradores
--
-- IMPORTANTE: Execute no SQL Editor do Supabase
-- ============================================

DO $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_client_id UUID;
    v_encrypted_password TEXT;
    v_identity_id UUID;
BEGIN
    -- Desabilitar temporariamente os triggers que podem interferir
    ALTER TABLE public.companies DISABLE TRIGGER trigger_ensure_admin_companies_no_owner;
    
    -- ====================
    -- CRIAR USUARIO NO AUTH
    -- ====================
    -- Gerar UUID para o novo usuario
    v_user_id := gen_random_uuid();
    v_identity_id := gen_random_uuid();
    
    -- Senha: TechSolutions@2024 (criptografada)
    -- NOTA: A senha sera 'TechSolutions@2024'
    v_encrypted_password := crypt('TechSolutions@2024', gen_salt('bf'));
    
    -- Inserir usuario diretamente no auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'gestor.da.empresa@techsolutions.com.br',
        v_encrypted_password,
        NOW(), -- Email ja confirmado
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}',
        '{"name":"Joao Silva Santos","role":"gestor"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    RAISE NOTICE 'Usuario criado com ID: %', v_user_id;
    RAISE NOTICE 'Email: gestor.da.empresa@techsolutions.com.br';
    RAISE NOTICE 'Senha: TechSolutions@2024';
    
    -- Criar identity para o usuario
    INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_identity_id,
        v_identity_id,
        v_user_id,
        format('{"sub":"%s","email":"%s"}', v_user_id, 'gestor.da.empresa@techsolutions.com.br')::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Identity criada para o usuario';
    
    -- ====================
    -- CRIAR EMPRESA
    -- ====================
    INSERT INTO public.companies (
        cnpj,
        company_name,
        trade_name,
        company_type,
        email,
        phone,
        address,
        banking_status,
        products_contracted,
        employee_count,
        annual_revenue,
        industry,
        registration_date,
        is_active,
        owner_user_id
    ) VALUES (
        '12.345.678/0001-99',
        'TechSolutions Desenvolvimento de Software LTDA',
        'TechSolutions',
        'LTDA',
        'contato@techsolutions-ficticio.com.br',
        '(11) 98765-4321',
        '{"street": "Rua das Inovacoes", "number": "123", "complement": "Sala 45", "neighborhood": "Centro Empresarial", "city": "Sao Paulo", "state": "SP", "zip_code": "01234-567"}'::jsonb,
        'partial',
        '["conta_corrente_pj", "cartao_corporativo"]'::jsonb,
        15,
        1200000.00,
        'Tecnologia da Informacao',
        '2020-03-15',
        true,
        v_user_id
    )
    ON CONFLICT (cnpj) DO UPDATE SET owner_user_id = EXCLUDED.owner_user_id
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE 'Empresa criada com ID: %', v_company_id;
    
    -- ====================
    -- CRIAR CLIENTE
    -- ====================
    INSERT INTO public.clients (
        user_id,
        client_code,
        name,
        email,
        company_id,
        user_type
    ) VALUES (
        v_user_id,
        'CLI-TECH-001',
        'Joao Silva Santos',
        'gestor.da.empresa@techsolutions.com.br',
        v_company_id,
        'company'
    )
    ON CONFLICT (client_code) DO UPDATE SET 
        company_id = EXCLUDED.company_id,
        user_id = EXCLUDED.user_id,
        email = EXCLUDED.email
    RETURNING id INTO v_client_id;
    
    RAISE NOTICE 'Cliente criado com ID: %', v_client_id;
    
    -- ====================
    -- CRIAR COLABORADORES
    -- ====================
    INSERT INTO public.employees (
        company_id,
        cpf,
        name,
        email,
        phone,
        position,
        department,
        hire_date,
        salary,
        has_platform_access,
        is_active
    ) VALUES
        (v_company_id, '123.456.789-01', 'Maria Oliveira Costa', 'maria.oliveira@techsolutions-ficticio.com.br', '(11) 98765-1111', 'Gerente de TI', 'Tecnologia', '2020-06-01', 8500.00, false, true),
        (v_company_id, '234.567.890-12', 'Pedro Henrique Almeida', 'pedro.almeida@techsolutions-ficticio.com.br', '(11) 98765-2222', 'Desenvolvedor Senior', 'Tecnologia', '2021-01-15', 7000.00, false, true),
        (v_company_id, '345.678.901-23', 'Ana Paula Rodrigues', 'ana.rodrigues@techsolutions-ficticio.com.br', '(11) 98765-3333', 'Analista Financeiro', 'Financeiro', '2021-08-20', 5500.00, false, true)
    ON CONFLICT (company_id, cpf) DO NOTHING;
    
    RAISE NOTICE 'Colaboradores criados: 3';
    
    -- ====================
    -- CRIAR BENEFICIOS
    -- ====================
    INSERT INTO public.company_benefits (
        company_id,
        benefit_type,
        name,
        description,
        configuration,
        eligibility_rules,
        is_active
    ) VALUES
        (v_company_id, 'meal_voucher', 'Vale Refeicao', 
         'Cartao de beneficio alimentacao com R$ 30,00 por dia util', 
         '{"daily_value": 30.00, "provider": "Alelo", "card_type": "refeicao"}'::jsonb,
         '{"minimum_hours_per_day": 6, "probation_period_days": 90}'::jsonb, 
         true),
        (v_company_id, 'transportation', 'Vale Transporte', 
         'Vale transporte para deslocamento casa-trabalho',
         '{"provider": "ValeTransporte SP", "calculation": "automatic"}'::jsonb,
         '{"exclude_from_salary": true}'::jsonb, 
         true),
        (v_company_id, 'health_insurance', 'Plano de Saude', 
         'Plano de saude empresarial com cobertura nacional',
         '{"provider": "Unimed", "plan_type": "enfermaria", "coparticipation": false}'::jsonb,
         '{"probation_period_days": 180, "dependent_coverage": true}'::jsonb, 
         true);
    
    RAISE NOTICE 'Beneficios criados: 3';
    
    -- ====================
    -- RESUMO
    -- ====================
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUCESSO! Cliente Empresa Ficticio Criado';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'CREDENCIAIS DE LOGIN:';
    RAISE NOTICE 'Email: gestor.da.empresa@techsolutions.com.br';
    RAISE NOTICE 'Senha: TechSolutions@2024';
    RAISE NOTICE '';
    RAISE NOTICE 'IDs Criados:';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Company ID: %', v_company_id;
    RAISE NOTICE 'Client ID: %', v_client_id;
    RAISE NOTICE '========================================';
    
    -- Reabilitar os triggers
    ALTER TABLE public.companies ENABLE TRIGGER trigger_ensure_admin_companies_no_owner;
    
END $$;

-- ============================================
-- VERIFICAR DADOS CRIADOS
-- ============================================

-- Usuario criado
SELECT 
    'USUARIO AUTH' as tipo,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'name' as nome
FROM auth.users 
WHERE email = 'gestor.da.empresa@techsolutions.com.br';

-- Empresa criada
SELECT 
    'EMPRESA' as tipo,
    id,
    cnpj,
    company_name,
    trade_name,
    employee_count,
    annual_revenue,
    banking_status
FROM public.companies 
WHERE cnpj = '12.345.678/0001-99';

-- Cliente criado
SELECT 
    'CLIENTE' as tipo,
    id,
    client_code,
    name,
    email,
    user_type
FROM public.clients 
WHERE client_code = 'CLI-TECH-001';

-- Colaboradores
SELECT 
    'COLABORADOR' as tipo,
    name,
    position,
    department,
    salary
FROM public.employees
WHERE company_id = (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-99')
ORDER BY salary DESC;

-- Beneficios
SELECT 
    'BENEFICIO' as tipo,
    name,
    benefit_type,
    description
FROM public.company_benefits
WHERE company_id = (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-99');
