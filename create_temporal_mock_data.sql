-- ============================================================
-- 🎉 SCRIPT PARA CRIAR DADOS TEMPORAIS (PARTY-MODE!) 🎉
-- ============================================================
--
-- Este script cria dados de empresas e colaboradores distribuídos
-- ao longo de múltiplos meses para permitir análises temporais
-- e gráficos de evolução/tendência.
--
-- IMPORTANTE: Execute este script APÓS create_banking_solution_tables.sql
--
-- Execute no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)
-- ============================================================

-- ============================================
-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🧹 Limpando dados existentes...';
END $$;

-- Desabilitar triggers temporariamente para performance
SET session_replication_role = 'replica';

-- Limpar dados de teste antigos (CUIDADO: isso apaga tudo!)
TRUNCATE TABLE public.employee_benefits CASCADE;
TRUNCATE TABLE public.company_benefits CASCADE;
TRUNCATE TABLE public.employees CASCADE;
TRUNCATE TABLE public.companies CASCADE;

-- Reabilitar triggers
SET session_replication_role = 'origin';

DO $$
BEGIN
    RAISE NOTICE '✅ Dados existentes limpos!';
END $$;

-- ============================================
-- 2. CRIAR EMPRESAS COM DATAS VARIADAS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🏢 Criando empresas distribuídas ao longo de 12 meses...';
END $$;

-- Janeiro 2024 (2 empresas)
INSERT INTO public.companies (
    cnpj, 
    company_name, 
    trade_name, 
    company_type, 
    email, 
    phone, 
    banking_status, 
    employee_count, 
    industry, 
    annual_revenue, 
    created_at,
    owner_user_id
)
VALUES
  -- Empresa 1: Janeiro
  (
    '11111111000111', 
    'Construtora Horizonte LTDA', 
    'Horizonte Construções', 
    'LTDA', 
    'contato@horizonteconstrucoes.com.br', 
    '(11) 3456-1001', 
    'fully_banked', 
    45, 
    'Construção', 
    2500000.00,
    '2024-01-15 10:30:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  -- Empresa 2: Janeiro
  (
    '22222222000122', 
    'Agência Digital Marketing', 
    'Digital Marketing', 
    'LTDA', 
    'contato@digitalmarketing.com.br', 
    '(11) 3456-2002', 
    'partial', 
    12, 
    'Marketing', 
    800000.00,
    '2024-01-25 14:20:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Março 2024 (2 empresas)
INSERT INTO public.companies (
    cnpj, company_name, trade_name, company_type, email, phone, banking_status, 
    employee_count, industry, annual_revenue, created_at, owner_user_id
)
VALUES
  -- Empresa 3: Março
  (
    '33333333000133', 
    'TechStart Soluções de Software LTDA', 
    'TechStart', 
    'LTDA', 
    'contato@techstart.com.br', 
    '(11) 3456-3003', 
    'fully_banked', 
    28, 
    'Tecnologia', 
    1800000.00,
    '2024-03-10 09:15:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  -- Empresa 4: Março
  (
    '44444444000144', 
    'Restaurante Sabor & Cia', 
    'Sabor & Cia', 
    'LTDA', 
    'contato@saborecia.com.br', 
    '(11) 3456-4004', 
    'not_banked', 
    8, 
    'Alimentação', 
    450000.00,
    '2024-03-22 16:45:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Junho 2024 (2 empresas)
INSERT INTO public.companies (
    cnpj, company_name, trade_name, company_type, email, phone, banking_status, 
    employee_count, industry, annual_revenue, created_at, owner_user_id
)
VALUES
  -- Empresa 5: Junho
  (
    '55555555000155', 
    'Consultoria Financeira Expert', 
    'Expert Finance', 
    'EIRELI', 
    'contato@expertfinance.com.br', 
    '(11) 3456-5005', 
    'fully_banked', 
    18, 
    'Consultoria', 
    1200000.00,
    '2024-06-05 11:20:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  -- Empresa 6: Junho
  (
    '66666666000166', 
    'Comércio Digital Brasil LTDA', 
    'Digital Brasil', 
    'LTDA', 
    'contato@digitalbrasil.com.br', 
    '(11) 3456-6006', 
    'partial', 
    22, 
    'Comércio', 
    950000.00,
    '2024-06-18 13:30:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Setembro 2024 (2 empresas)
INSERT INTO public.companies (
    cnpj, company_name, trade_name, company_type, email, phone, banking_status, 
    employee_count, industry, annual_revenue, created_at, owner_user_id
)
VALUES
  -- Empresa 7: Setembro
  (
    '77777777000177', 
    'Indústria de Embalagens Silva', 
    'Embalagens Silva', 
    'SA', 
    'contato@embalagensilva.com.br', 
    '(11) 3456-7007', 
    'fully_banked', 
    65, 
    'Indústria', 
    3500000.00,
    '2024-09-12 08:45:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  -- Empresa 8: Setembro
  (
    '88888888000188', 
    'Academia Fitness Plus', 
    'Fitness Plus', 
    'LTDA', 
    'contato@fitnessplus.com.br', 
    '(11) 3456-8008', 
    'partial', 
    15, 
    'Saúde e Bem-Estar', 
    600000.00,
    '2024-09-25 15:10:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Dezembro 2024 (2 empresas)
INSERT INTO public.companies (
    cnpj, company_name, trade_name, company_type, email, phone, banking_status, 
    employee_count, industry, annual_revenue, created_at, owner_user_id
)
VALUES
  -- Empresa 9: Dezembro
  (
    '99999999000199', 
    'Advocacia Rocha e Associados', 
    'Rocha Advocacia', 
    'EIRELI', 
    'contato@rochaadvocacia.com.br', 
    '(11) 3456-9009', 
    'fully_banked', 
    10, 
    'Serviços Jurídicos', 
    750000.00,
    '2024-12-08 10:00:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  -- Empresa 10: Dezembro
  (
    '10101010000110', 
    'Logística Express Transportes', 
    'Express Transportes', 
    'LTDA', 
    'contato@expresstransportes.com.br', 
    '(11) 3456-1010', 
    'partial', 
    32, 
    'Logística', 
    1400000.00,
    '2024-12-20 12:30:00+00',
    (SELECT id FROM auth.users LIMIT 1)
  );

DO $$
BEGIN
    RAISE NOTICE '✅ 10 empresas criadas distribuídas em 5 meses!';
END $$;

-- ============================================
-- 3. CRIAR COLABORADORES COM DATAS VARIADAS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '👥 Criando colaboradores com datas de contratação variadas...';
END $$;

-- Colaboradores da Construtora Horizonte (Empresa 1)
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11111111111',
  'Carlos Mendes',
  'carlos.mendes@horizonteconstrucoes.com.br',
  '(11) 98111-1111',
  'Engenheiro Civil',
  'Engenharia',
  '2024-01-20',
  12000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '11111111000111';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11111111112',
  'Ana Paula Souza',
  'ana.souza@horizonteconstrucoes.com.br',
  '(11) 98111-1112',
  'Gerente de Projetos',
  'Projetos',
  '2024-02-15',
  10000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '11111111000111';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11111111113',
  'Roberto Lima',
  'roberto.lima@horizonteconstrucoes.com.br',
  '(11) 98111-1113',
  'Mestre de Obras',
  'Obras',
  '2024-04-10',
  6500.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '11111111000111';

-- Colaboradores da Agência Digital Marketing (Empresa 2)
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '22222222221',
  'Juliana Costa',
  'juliana.costa@digitalmarketing.com.br',
  '(11) 98222-2221',
  'Designer Gráfico',
  'Criação',
  '2024-02-01',
  5500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '22222222000122';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '22222222222',
  'Pedro Santos',
  'pedro.santos@digitalmarketing.com.br',
  '(11) 98222-2222',
  'Analista de Marketing',
  'Marketing',
  '2024-05-20',
  6000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '22222222000122';

-- Colaboradores da TechStart (Empresa 3)
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '33333333331',
  'Rafael Oliveira',
  'rafael.oliveira@techstart.com.br',
  '(11) 98333-3331',
  'Desenvolvedor Full Stack',
  'Tecnologia',
  '2024-03-15',
  9000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '33333333000133';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '33333333332',
  'Mariana Silva',
  'mariana.silva@techstart.com.br',
  '(11) 98333-3332',
  'Product Manager',
  'Produto',
  '2024-06-10',
  11000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '33333333000133';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '33333333333',
  'Lucas Ferreira',
  'lucas.ferreira@techstart.com.br',
  '(11) 98333-3333',
  'UX Designer',
  'Design',
  '2024-09-05',
  7500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '33333333000133';

-- Mais colaboradores para outras empresas...
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '55555555551',
  'Fernanda Almeida',
  'fernanda.almeida@expertfinance.com.br',
  '(11) 98555-5551',
  'Consultora Financeira Senior',
  'Consultoria',
  '2024-06-15',
  13000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '55555555000155';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '77777777771',
  'Ricardo Barbosa',
  'ricardo.barbosa@embalagensilva.com.br',
  '(11) 98777-7771',
  'Supervisor de Produção',
  'Produção',
  '2024-09-20',
  7000.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '77777777000177';

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '99999999991',
  'Beatriz Rocha',
  'beatriz.rocha@rochaadvocacia.com.br',
  '(11) 98999-9991',
  'Advogada Associada',
  'Jurídico',
  '2024-12-15',
  9500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '99999999000199';

DO $$
BEGIN
    RAISE NOTICE '✅ Colaboradores criados com datas de contratação distribuídas!';
END $$;

-- ============================================
-- 4. CRIAR BENEFÍCIOS BANCÁRIOS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '💳 Criando benefícios bancários (financial_product)...';
END $$;

-- Benefícios para Construtora Horizonte
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'financial_product',
  'Cartão Corporativo',
  'Cartão corporativo para despesas empresariais',
  '{"provider": "Banco Partner", "limit": 50000, "currency": "BRL"}'::jsonb,
  '{"min_position": "Gerente"}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '11111111000111';

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'financial_product',
  'Conta Salário Digital',
  'Conta salário digital para colaboradores',
  '{"provider": "Banco Partner", "account_type": "salary"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '11111111000111';

-- Benefícios para TechStart
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'financial_product',
  'Cartão Benefícios Flex',
  'Cartão multi-benefícios flexível',
  '{"provider": "Banco Partner", "monthly_amount": 800, "currency": "BRL"}'::jsonb,
  '{"min_hire_days": 90}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '33333333000133';

-- Benefícios para Consultoria Expert
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'financial_product',
  'Investimento Empresarial',
  'Conta de investimento para aplicações empresariais',
  '{"provider": "Banco Partner", "yield": "CDI + 1.2%"}'::jsonb,
  '{"min_position": "Gerente"}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '55555555000155';

DO $$
BEGIN
    RAISE NOTICE '✅ Benefícios bancários criados!';
END $$;

-- ============================================
-- 5. ASSOCIAR COLABORADORES AOS BENEFÍCIOS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🔗 Associando colaboradores aos benefícios...';
END $$;

-- Colaboradores da Construtora Horizonte com benefícios
INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date, usage_data)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '30 days',
  '{}'::jsonb
FROM public.employees e
JOIN public.companies c ON e.company_id = c.id
JOIN public.company_benefits cb ON cb.company_id = c.id
WHERE c.cnpj = '11111111000111' 
  AND e.cpf IN ('11111111111', '11111111112')
  AND cb.benefit_type = 'financial_product';

-- Colaboradores da TechStart com benefícios
INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date, usage_data)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '90 days',
  '{}'::jsonb
FROM public.employees e
JOIN public.companies c ON e.company_id = c.id
JOIN public.company_benefits cb ON cb.company_id = c.id
WHERE c.cnpj = '33333333000133' 
  AND e.cpf IN ('33333333331', '33333333332')
  AND cb.benefit_type = 'financial_product';

DO $$
BEGIN
    RAISE NOTICE '✅ Colaboradores associados aos benefícios!';
END $$;

-- ============================================
-- 6. VERIFICAÇÃO E RELATÓRIO FINAL
-- ============================================

DO $$
DECLARE
    company_count INTEGER;
    employee_count INTEGER;
    benefit_count INTEGER;
    active_benefit_count INTEGER;
    month_distribution TEXT;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO company_count FROM public.companies;
    SELECT COUNT(*) INTO employee_count FROM public.employees;
    SELECT COUNT(*) INTO benefit_count FROM public.company_benefits;
    SELECT COUNT(*) INTO active_benefit_count FROM public.employee_benefits WHERE status = 'active';
    
    -- Distribuição por mês
    SELECT string_agg(month_year || ': ' || count::text || ' empresas', ', ')
    INTO month_distribution
    FROM (
        SELECT 
            TO_CHAR(created_at, 'Mon/YYYY') as month_year,
            COUNT(*) as count
        FROM public.companies
        GROUP BY TO_CHAR(created_at, 'Mon/YYYY'), DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
    ) subq;
    
    -- Relatório
    RAISE NOTICE '';
    RAISE NOTICE '╔═══════════════════════════════════════════════╗';
    RAISE NOTICE '║                                               ║';
    RAISE NOTICE '║   ✅ DADOS TEMPORAIS CRIADOS COM SUCESSO! ✅  ║';
    RAISE NOTICE '║                                               ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMO:';
    RAISE NOTICE '  🏢 Empresas criadas: %', company_count;
    RAISE NOTICE '  👥 Colaboradores criados: %', employee_count;
    RAISE NOTICE '  💳 Benefícios bancários criados: %', benefit_count;
    RAISE NOTICE '  ✅ Benefícios ativos (colaboradores): %', active_benefit_count;
    RAISE NOTICE '';
    RAISE NOTICE '📅 DISTRIBUIÇÃO TEMPORAL:';
    RAISE NOTICE '  %', month_distribution;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TESTES RECOMENDADOS:';
    RAISE NOTICE '  1. "Mostre um gráfico de linha com a evolução de cadastros de empresas"';
    RAISE NOTICE '  2. "Crie um gráfico de área mostrando a evolução de colaboradores"';
    RAISE NOTICE '  3. "Gráfico de linha com contratações por mês"';
    RAISE NOTICE '  4. "Quantos colaboradores têm benefícios do banco?"';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRONTO PARA O PITCH! 🚀';
    RAISE NOTICE '';
END $$;
