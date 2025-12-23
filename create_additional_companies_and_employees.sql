-- Script para adicionar mais empresas e colaboradores mockados
-- Execute este script no SQL Editor do Supabase
-- Este script adiciona mais empresas e colaboradores para testar a lista de empresas

-- ============================================
-- EMPRESAS ADICIONAIS
-- ===========================================

-- Empresa 5: Consultoria Financeira
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '22334455000166',
  'Financeira Consultoria e Assessoria LTDA',
  'Financeira Consultoria',
  'LTDA',
  'contato@financeiraconsultoria.com.br',
  '(11) 3456-7894',
  '{"street": "Av. Brigadeiro Faria Lima, 2000", "city": "São Paulo", "state": "SP", "zipcode": "01452-001"}'::jsonb,
  'fully_banked',
  15,
  'Consultoria Financeira',
  750000.00,
  '2018-05-12',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '22334455000166')
ON CONFLICT (cnpj) DO NOTHING;

-- Empresa 6: Marketing Digital
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '33445566000177',
  'Agência Digital Marketing Pro ME',
  'Marketing Pro',
  'ME',
  'contato@marketingpro.com.br',
  '(11) 3456-7895',
  '{"street": "Rua Oscar Freire, 300", "city": "São Paulo", "state": "SP", "zipcode": "01426-001"}'::jsonb,
  'partial',
  6,
  'Marketing Digital',
  320000.00,
  '2021-08-15',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '33445566000177')
ON CONFLICT (cnpj) DO NOTHING;

-- Empresa 7: Construção Civil
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '44556677000188',
  'Construtora Horizonte LTDA',
  'Horizonte Construções',
  'LTDA',
  'contato@horizonteconstrucoes.com.br',
  '(11) 3456-7896',
  '{"street": "Av. Eng. Luís Carlos Berrini, 1000", "city": "São Paulo", "state": "SP", "zipcode": "04571-000"}'::jsonb,
  'fully_banked',
  25,
  'Construção Civil',
  1200000.00,
  '2017-11-20',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '44556677000188')
ON CONFLICT (cnpj) DO NOTHING;

-- Empresa 8: Restaurante
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, address, banking_status, employee_count, industry, annual_revenue, registration_date, owner_user_id)
SELECT 
  '66778899000100',
  'Restaurante Sabor Brasileiro EIRELI',
  'Sabor Brasileiro',
  'EIRELI',
  'contato@saborbrasileiro.com.br',
  '(11) 3456-7897',
  '{"street": "Rua dos Três Irmãos, 500", "city": "São Paulo", "state": "SP", "zipcode": "05407-000"}'::jsonb,
  'partial',
  10,
  'Alimentação',
  450000.00,
  '2020-09-10',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE cnpj = '66778899000100')
ON CONFLICT (cnpj) DO NOTHING;

-- ============================================
-- COLABORADORES ADICIONAIS
-- ===========================================

-- Colaboradores para Financeira Consultoria (Empresa 5)
DO $$
DECLARE
  company_id_var UUID;
  user_id_var UUID;
BEGIN
  SELECT id INTO company_id_var FROM public.companies WHERE cnpj = '22334455000166' LIMIT 1;
  SELECT id INTO user_id_var FROM auth.users LIMIT 1;
  
  IF company_id_var IS NOT NULL THEN
    -- Gerente Financeiro
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Roberto Silva',
      'roberto.silva@financeiraconsultoria.com.br',
      '11122233344',
      'Gerente Financeiro',
      'Financeiro',
      '2018-06-01',
      8500.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'roberto.silva@financeiraconsultoria.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Analista Financeiro
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Patricia Costa',
      'patricia.costa@financeiraconsultoria.com.br',
      '22233344455',
      'Analista Financeiro',
      'Financeiro',
      '2019-02-15',
      5500.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'patricia.costa@financeiraconsultoria.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Consultor Sênior
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Carlos Mendes',
      'carlos.mendes@financeiraconsultoria.com.br',
      '33344455566',
      'Consultor Sênior',
      'Consultoria',
      '2018-08-20',
      12000.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'carlos.mendes@financeiraconsultoria.com.br')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Colaboradores para Marketing Pro (Empresa 6)
DO $$
DECLARE
  company_id_var UUID;
  user_id_var UUID;
BEGIN
  SELECT id INTO company_id_var FROM public.companies WHERE cnpj = '33445566000177' LIMIT 1;
  SELECT id INTO user_id_var FROM auth.users LIMIT 1;
  
  IF company_id_var IS NOT NULL THEN
    -- Diretor de Marketing
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Ana Paula Santos',
      'ana.santos@marketingpro.com.br',
      '44455566677',
      'Diretora de Marketing',
      'Marketing',
      '2021-09-01',
      9500.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'ana.santos@marketingpro.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Designer Gráfico
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Lucas Oliveira',
      'lucas.oliveira@marketingpro.com.br',
      '55566677788',
      'Designer Gráfico',
      'Criação',
      '2021-10-15',
      4500.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'lucas.oliveira@marketingpro.com.br')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Colaboradores para Horizonte Construções (Empresa 7)
DO $$
DECLARE
  company_id_var UUID;
  user_id_var UUID;
BEGIN
  SELECT id INTO company_id_var FROM public.companies WHERE cnpj = '44556677000188' LIMIT 1;
  SELECT id INTO user_id_var FROM auth.users LIMIT 1;
  
  IF company_id_var IS NOT NULL THEN
    -- Engenheiro Civil
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Fernando Almeida',
      'fernando.almeida@horizonteconstrucoes.com.br',
      '66677788899',
      'Engenheiro Civil',
      'Engenharia',
      '2017-12-01',
      11000.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'fernando.almeida@horizonteconstrucoes.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Arquiteto
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Mariana Ferreira',
      'mariana.ferreira@horizonteconstrucoes.com.br',
      '77788899900',
      'Arquiteta',
      'Projetos',
      '2018-03-10',
      9800.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'mariana.ferreira@horizonteconstrucoes.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Mestre de Obras
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'João Batista',
      'joao.batista@horizonteconstrucoes.com.br',
      '88899900011',
      'Mestre de Obras',
      'Obras',
      '2018-01-15',
      6500.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'joao.batista@horizonteconstrucoes.com.br')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Colaboradores para Sabor Brasileiro (Empresa 8)
DO $$
DECLARE
  company_id_var UUID;
  user_id_var UUID;
BEGIN
  SELECT id INTO company_id_var FROM public.companies WHERE cnpj = '66778899000100' LIMIT 1;
  SELECT id INTO user_id_var FROM auth.users LIMIT 1;
  
  IF company_id_var IS NOT NULL THEN
    -- Chef de Cozinha
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Ricardo Sousa',
      'ricardo.sousa@saborbrasileiro.com.br',
      '99900011122',
      'Chef de Cozinha',
      'Cozinha',
      '2020-10-01',
      7200.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'ricardo.sousa@saborbrasileiro.com.br')
    ON CONFLICT (email) DO NOTHING;
    
    -- Garçom
    INSERT INTO public.employees (name, email, cpf, position, department, hire_date, salary, is_active, company_id, platform_user_id)
    SELECT 
      'Juliana Rocha',
      'juliana.rocha@saborbrasileiro.com.br',
      '00011122233',
      'Garçonete',
      'Atendimento',
      '2020-11-15',
      2800.00,
      true,
      company_id_var,
      user_id_var
    WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE email = 'juliana.rocha@saborbrasileiro.com.br')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Atualizar contagem de colaboradores nas empresas
UPDATE public.companies 
SET employee_count = (
  SELECT COUNT(*) 
  FROM public.employees 
  WHERE employees.company_id = companies.id AND employees.is_active = true
)
WHERE cnpj IN ('22334455000166', '33445566000177', '44556677000188', '66778899000100');

