-- Script para criar dados mockados para o módulo de Gestão de Pessoas
-- Execute este script no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)
-- IMPORTANTE: Execute primeiro o script create_banking_solution_tables.sql

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN
        RAISE EXCEPTION 'A tabela companies não existe. Execute primeiro o script create_banking_solution_tables.sql';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
        RAISE EXCEPTION 'A tabela employees não existe. Execute primeiro o script create_banking_solution_tables.sql';
    END IF;
END $$;

-- ============================================
-- DADOS MOCKADOS DE EMPRESAS
-- ============================================

-- Limpar dados existentes (opcional - comentar se quiser manter dados existentes)
-- DELETE FROM public.employee_benefits;
-- DELETE FROM public.company_benefits;
-- DELETE FROM public.employees;
-- DELETE FROM public.companies WHERE cnpj IN ('12345678000190', '98765432000111', '11223344000155', '55667788000199');

-- Empresas mockadas
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '12345678000190',
  'Silva & Associados LTDA',
  'Silva Associados',
  'LTDA',
  'contato@silvaassociados.com.br',
  '(11) 3456-7890',
  '{"street": "Av. Paulista, 1000", "city": "São Paulo", "state": "SP", "zipcode": "01310-100"}'::jsonb,
  'fully_banked',
  8,
  'Consultoria',
  500000.00,
  '2020-01-15',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '12345678000190')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '98765432000111',
  'TechStart Soluções Tecnológicas MEI',
  'TechStart',
  'MEI',
  'contato@techstart.com.br',
  '(11) 3456-7891',
  '{"street": "Rua das Flores, 200", "city": "São Paulo", "state": "SP", "zipcode": "01234-567"}'::jsonb,
  'partial',
  3,
  'Tecnologia',
  180000.00,
  '2021-03-20',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '98765432000111')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '11223344000155',
  'Serviços Express EIRELI',
  'Serviços Express',
  'EIRELI',
  'contato@servicosexpress.com.br',
  '(11) 3456-7892',
  '{"street": "Av. Faria Lima, 1500", "city": "São Paulo", "state": "SP", "zipcode": "01452-000"}'::jsonb,
  'fully_banked',
  12,
  'Serviços',
  350000.00,
  '2019-06-10',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '11223344000155')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '55667788000199',
  'Comércio Digital LTDA',
  'Comércio Digital',
  'LTDA',
  'contato@comerciodigital.com.br',
  '(11) 3456-7893',
  '{"street": "Rua Augusta, 500", "city": "São Paulo", "state": "SP", "zipcode": "01305-000"}'::jsonb,
  'partial',
  5,
  'Varejo',
  250000.00,
  '2022-02-28',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '55667788000199')
ON CONFLICT (cnpj) DO NOTHING;

-- ============================================
-- DADOS MOCKADOS DE COLABORADORES
-- ============================================

-- Colaboradores da Silva & Associados LTDA
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11122233344',
  'Roberto Alves',
  'roberto.alves@silvaassociados.com.br',
  '(11) 98765-1111',
  'Gerente de Vendas',
  'Vendas',
  '2023-01-15',
  8000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '22233344455',
  'Juliana Lima',
  'juliana.lima@silvaassociados.com.br',
  '(11) 98765-2222',
  'Analista Financeiro',
  'Financeiro',
  '2023-03-20',
  5500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '33344455566',
  'Carlos Mendes',
  'carlos.mendes@silvaassociados.com.br',
  '(11) 98765-3333',
  'Consultor Sênior',
  'Consultoria',
  '2022-08-10',
  9500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '44455566677',
  'Ana Paula Santos',
  'ana.santos@silvaassociados.com.br',
  '(11) 98765-4444',
  'Analista de RH',
  'Recursos Humanos',
  '2023-06-01',
  4800.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '55566677788',
  'Fernando Costa',
  'fernando.costa@silvaassociados.com.br',
  '(11) 98765-5555',
  'Desenvolvedor',
  'TI',
  '2023-09-15',
  6500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '66677788899',
  'Mariana Oliveira',
  'mariana.oliveira@silvaassociados.com.br',
  '(11) 98765-6666',
  'Assistente Administrativo',
  'Administração',
  '2024-01-10',
  3500.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '77788899900',
  'Ricardo Silva',
  'ricardo.silva@silvaassociados.com.br',
  '(11) 98765-7777',
  'Vendedor',
  'Vendas',
  '2023-11-20',
  4200.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '88899900011',
  'Patricia Rocha',
  'patricia.rocha@silvaassociados.com.br',
  '(11) 98765-8888',
  'Coordenadora de Projetos',
  'Consultoria',
  '2022-05-15',
  7200.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT (company_id, cpf) DO NOTHING;

-- Colaboradores da TechStart MEI
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '99900011122',
  'Lucas Ferreira',
  'lucas.ferreira@techstart.com.br',
  '(11) 98765-9999',
  'Desenvolvedor Full Stack',
  'TI',
  '2023-04-01',
  7000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '98765432000111'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '00011122233',
  'Gabriela Martins',
  'gabriela.martins@techstart.com.br',
  '(11) 98765-0000',
  'Designer UX/UI',
  'Design',
  '2023-07-10',
  5500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '98765432000111'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11122233344',
  'Thiago Souza',
  'thiago.souza@techstart.com.br',
  '(11) 98765-1112',
  'Product Owner',
  'Produto',
  '2022-12-01',
  8500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '98765432000111'
ON CONFLICT (company_id, cpf) DO NOTHING;

-- Colaboradores da Serviços Express EIRELI
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '22233344455',
  'Amanda Rodrigues',
  'amanda.rodrigues@servicosexpress.com.br',
  '(11) 98765-2223',
  'Gerente de Operações',
  'Operações',
  '2021-09-15',
  9000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '11223344000155'
ON CONFLICT (company_id, cpf) DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '33344455566',
  'Bruno Almeida',
  'bruno.almeida@servicosexpress.com.br',
  '(11) 98765-3334',
  'Supervisor de Atendimento',
  'Atendimento',
  '2022-02-20',
  5800.00,
  false,
  true
FROM public.companies c WHERE c.cnpj = '11223344000155'
ON CONFLICT (company_id, cpf) DO NOTHING;

-- Colaboradores da Comércio Digital LTDA
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '44455566677',
  'Camila Barbosa',
  'camila.barbosa@comerciodigital.com.br',
  '(11) 98765-4445',
  'Gerente de E-commerce',
  'Vendas',
  '2022-11-01',
  7500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '55667788000199'
ON CONFLICT (company_id, cpf) DO NOTHING;

-- ============================================
-- DADOS MOCKADOS DE BENEFÍCIOS
-- ============================================

-- Benefícios da Silva & Associados LTDA
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'health_insurance',
  'Plano de Saúde Unimed',
  'Plano de saúde empresarial Unimed com cobertura nacional',
  '{"provider": "Unimed", "coverage": "Nacional", "plan_type": "Empresarial"}'::jsonb,
  '{"min_hire_days": 90}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'meal_voucher',
  'Vale Alimentação Alelo',
  'Vale alimentação de R$ 500/mês via cartão Alelo',
  '{"provider": "Alelo", "amount": 500, "currency": "BRL", "reload_frequency": "monthly"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'transportation',
  'Vale Transporte',
  'Vale transporte para deslocamento',
  '{"amount": 300, "currency": "BRL", "reload_frequency": "monthly"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'wellness',
  'Gympass',
  'Acesso a academias e atividades físicas via Gympass',
  '{"provider": "Gympass", "plan_type": "Corporate"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'financial_product',
  'Seguro de Vida',
  'Seguro de vida em grupo',
  '{"provider": "Porto Seguro", "coverage_amount": 50000}'::jsonb,
  '{"min_hire_days": 30}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

-- Benefícios da TechStart MEI
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'meal_voucher',
  'Vale Refeição Sodexo',
  'Vale refeição de R$ 400/mês',
  '{"provider": "Sodexo", "amount": 400, "currency": "BRL"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '98765432000111'
ON CONFLICT DO NOTHING;

-- Benefícios da Serviços Express EIRELI
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'health_insurance',
  'Plano de Saúde Bradesco',
  'Plano de saúde Bradesco Saúde',
  '{"provider": "Bradesco Saúde", "coverage": "Regional"}'::jsonb,
  '{"min_hire_days": 60}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '11223344000155'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'education',
  'Auxílio Educação',
  'Auxílio para cursos e capacitação de até R$ 500/mês',
  '{"max_amount": 500, "currency": "BRL", "reimbursement": true}'::jsonb,
  '{"min_hire_days": 180}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '11223344000155'
ON CONFLICT DO NOTHING;

-- ============================================
-- ATRIBUIÇÃO DE BENEFÍCIOS AOS COLABORADORES
-- ============================================

-- Atribuir benefícios aos colaboradores da Silva & Associados
INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '90 days'
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '12345678000190'
  AND e.hire_date <= CURRENT_DATE - INTERVAL '90 days'
  AND cb.benefit_type = 'health_insurance'
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '12345678000190'
  AND cb.benefit_type IN ('meal_voucher', 'transportation', 'wellness')
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '30 days'
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '12345678000190'
  AND e.hire_date <= CURRENT_DATE - INTERVAL '30 days'
  AND cb.benefit_type = 'financial_product'
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

-- Atribuir benefícios aos colaboradores da TechStart
INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '98765432000111'
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

-- Atribuir benefícios aos colaboradores da Serviços Express
INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '60 days'
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '11223344000155'
  AND e.hire_date <= CURRENT_DATE - INTERVAL '60 days'
  AND cb.benefit_type = 'health_insurance'
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
SELECT 
  e.id,
  cb.id,
  'active',
  e.hire_date + INTERVAL '180 days'
FROM public.employees e
CROSS JOIN public.company_benefits cb
JOIN public.companies c ON e.company_id = c.id AND cb.company_id = c.id
WHERE c.cnpj = '11223344000155'
  AND e.hire_date <= CURRENT_DATE - INTERVAL '180 days'
  AND cb.benefit_type = 'education'
ON CONFLICT (employee_id, company_benefit_id) DO NOTHING;

-- ============================================
-- ATUALIZAR CONTADOR DE COLABORADORES
-- ============================================

UPDATE public.companies c
SET employee_count = (
  SELECT COUNT(*) 
  FROM public.employees e 
  WHERE e.company_id = c.id AND e.is_active = true
)
WHERE c.cnpj IN ('12345678000190', '98765432000111', '11223344000155', '55667788000199');

-- ============================================
-- MENSAGEM DE CONCLUSÃO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Dados mockados criados com sucesso!';
    RAISE NOTICE 'Empresas: 4';
    RAISE NOTICE 'Colaboradores: 15';
    RAISE NOTICE 'Benefícios: 8';
END $$;

