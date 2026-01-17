-- ============================================
-- SCRIPT SIMPLIFICADO PARA CRIAR CLIENTE EMPRESA FICTICIO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Passo a passo:
--
-- 1. Primeiro, busque um user_id valido executando:
--    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
--
-- 2. Copie um user_id da lista
--
-- 3. Substitua 'USER_ID_AQUI' abaixo pelo user_id copiado
--
-- 4. Execute todo o script
-- ============================================

-- CONFIGURACAO: Substitua pelo user_id real
DO $$
DECLARE
    v_user_id UUID := 'USER_ID_AQUI';  -- SUBSTITUIR AQUI!
    v_company_id UUID;
    v_client_id UUID;
BEGIN
    -- ====================
    -- CRIAR EMPRESA
    -- ====================
    INSERT INTO public.companies (
        cnpj, company_name, trade_name, company_type, email, phone,
        address, banking_status, products_contracted, employee_count,
        annual_revenue, industry, registration_date, is_active, owner_user_id
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
    ON CONFLICT (cnpj) DO UPDATE SET owner_user_id = v_user_id
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE 'Empresa criada/atualizada: %', v_company_id;
    
    -- ====================
    -- CRIAR CLIENTE
    -- ====================
    INSERT INTO public.clients (
        user_id, client_code, name, email, company_id, user_type
    ) VALUES (
        v_user_id,
        'CLI-TECH-001',
        'Joao Silva Santos',
        'joao.silva@techsolutions-ficticio.com.br',
        v_company_id,
        'company'
    )
    ON CONFLICT (client_code) DO UPDATE SET 
        company_id = v_company_id,
        user_id = v_user_id
    RETURNING id INTO v_client_id;
    
    RAISE NOTICE 'Cliente criado/atualizado: %', v_client_id;
    
    -- ====================
    -- CRIAR COLABORADORES
    -- ====================
    INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
    VALUES
        (v_company_id, '123.456.789-01', 'Maria Oliveira Costa', 'maria.oliveira@techsolutions-ficticio.com.br', '(11) 98765-1111', 'Gerente de TI', 'Tecnologia', '2020-06-01', 8500.00, false, true),
        (v_company_id, '234.567.890-12', 'Pedro Henrique Almeida', 'pedro.almeida@techsolutions-ficticio.com.br', '(11) 98765-2222', 'Desenvolvedor Senior', 'Tecnologia', '2021-01-15', 7000.00, false, true),
        (v_company_id, '345.678.901-23', 'Ana Paula Rodrigues', 'ana.rodrigues@techsolutions-ficticio.com.br', '(11) 98765-3333', 'Analista Financeiro', 'Financeiro', '2021-08-20', 5500.00, false, true)
    ON CONFLICT (company_id, cpf) DO NOTHING;
    
    RAISE NOTICE 'Colaboradores criados';
    
    -- ====================
    -- CRIAR BENEFICIOS
    -- ====================
    INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
    VALUES
        (v_company_id, 'meal_voucher', 'Vale Refeicao', 'Cartao de beneficio alimentacao com R$ 30,00 por dia util', 
         '{"daily_value": 30.00, "provider": "Alelo", "card_type": "refeicao"}'::jsonb,
         '{"minimum_hours_per_day": 6, "probation_period_days": 90}'::jsonb, true),
        (v_company_id, 'transportation', 'Vale Transporte', 'Vale transporte para deslocamento casa-trabalho',
         '{"provider": "ValeTransporte SP", "calculation": "automatic"}'::jsonb,
         '{"exclude_from_salary": true}'::jsonb, true),
        (v_company_id, 'health_insurance', 'Plano de Saude', 'Plano de saude empresarial com cobertura nacional',
         '{"provider": "Unimed", "plan_type": "enfermaria", "coparticipation": false}'::jsonb,
         '{"probation_period_days": 180, "dependent_coverage": true}'::jsonb, true);
    
    RAISE NOTICE 'Beneficios criados';
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'SUCESSO! Dados criados:';
    RAISE NOTICE 'Company ID: %', v_company_id;
    RAISE NOTICE 'Client ID: %', v_client_id;
    RAISE NOTICE '====================================';
END $$;

-- Verificar dados criados
SELECT 
    'EMPRESA' as tipo,
    id,
    cnpj as identificacao,
    company_name as nome,
    employee_count as colaboradores,
    annual_revenue as faturamento
FROM public.companies 
WHERE cnpj = '12.345.678/0001-99'

UNION ALL

SELECT 
    'CLIENTE' as tipo,
    id,
    client_code as identificacao,
    name as nome,
    NULL as colaboradores,
    NULL as faturamento
FROM public.clients 
WHERE client_code = 'CLI-TECH-001';

-- Verificar colaboradores
SELECT 
    name as nome,
    position as cargo,
    department as departamento,
    salary as salario
FROM public.employees
WHERE company_id = (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-99')
ORDER BY salary DESC;

-- Verificar beneficios
SELECT 
    name as nome,
    benefit_type as tipo,
    description as descricao
FROM public.company_benefits
WHERE company_id = (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-99');
