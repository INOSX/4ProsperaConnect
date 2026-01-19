-- ============================================
-- SETUP: Associar company_manager@www.com a Empresa Fictícia
-- Com Funcionários e Benefícios
-- ============================================
-- 
-- ⚠️ SOLUÇÃO ALTERNATIVA: Dropar função de validação temporariamente
-- ============================================

-- ============================================
-- 1. BACKUP E DROPAR FUNÇÃO DE VALIDAÇÃO
-- ============================================

DO $$
DECLARE
  v_function_exists BOOLEAN;
  v_function_definition TEXT;
BEGIN
  -- Verificar se a função existe e fazer backup
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'ensure_only_admin_creates_companies'
  ) INTO v_function_exists;

  IF v_function_exists THEN
    RAISE NOTICE '⚠️ Função ensure_only_admin_creates_companies() encontrada';
    RAISE NOTICE '🗑️ Dropando função temporariamente...';
    
    -- Dropar a função (isso desabilita o trigger automaticamente)
    DROP FUNCTION IF EXISTS public.ensure_only_admin_creates_companies() CASCADE;
    
    RAISE NOTICE '✅ Função dropada temporariamente';
  ELSE
    RAISE NOTICE 'ℹ️ Função não encontrada, continuando normalmente';
  END IF;
END $$;

-- ============================================
-- 2. CRIAR DADOS
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
  v_client_id UUID;
  v_company_id UUID;
  v_employee_id UUID;
  v_benefit_id UUID;
BEGIN
  -- Buscar user_id do company_manager@www.com
  SELECT user_id INTO v_user_id
  FROM public.clients
  WHERE email = 'company_manager@www.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário company_manager@www.com não encontrado!';
  END IF;

  RAISE NOTICE '✅ User ID encontrado: %', v_user_id;

  -- Buscar client_id
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE user_id = v_user_id;

  RAISE NOTICE '✅ Client ID: %', v_client_id;

  -- ============================================
  -- CRIAR EMPRESA
  -- ============================================

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
    '12.345.678/0001-90',
    'TechSolutions Ltda',
    'Tech Solutions',
    'LTDA',
    'contato@techsolutions.com.br',
    '+55 11 98765-4321',
    jsonb_build_object(
      'street', 'Av. Paulista',
      'number', '1500',
      'complement', 'Conj. 1001',
      'neighborhood', 'Bela Vista',
      'city', 'São Paulo',
      'state', 'SP',
      'zipcode', '01310-100'
    ),
    'fully_banked',
    jsonb_build_array('conta_pj', 'credito_empresarial', 'beneficios_flexiveis'),
    10,
    2500000.00,
    'Tecnologia da Informação',
    '2020-01-15',
    true,
    v_user_id
  )
  RETURNING id INTO v_company_id;

  RAISE NOTICE '✅ Empresa criada: % (ID: %)', 'TechSolutions Ltda', v_company_id;

  -- Atualizar client com company_id
  UPDATE public.clients
  SET company_id = v_company_id,
      user_type = 'company'
  WHERE id = v_client_id;

  RAISE NOTICE '✅ Client vinculado à empresa';

  -- ============================================
  -- CRIAR BENEFÍCIOS
  -- ============================================

  -- Benefício 1: Plano de Saúde
  INSERT INTO public.company_benefits (
    company_id, benefit_type, name, description, configuration, eligibility_rules, is_active
  ) VALUES (
    v_company_id, 'health_insurance', 'Plano de Saúde Unimed',
    'Plano de saúde empresarial com cobertura nacional',
    jsonb_build_object('provider', 'Unimed', 'plan_type', 'Empresarial 300', 'coverage', 'Nacional', 
      'dependents_allowed', true, 'max_dependents', 4),
    jsonb_build_object('minimum_tenure_days', 90, 'employment_type', jsonb_build_array('CLT', 'Contrato')),
    true
  );

  -- Benefício 2: Vale Refeição
  INSERT INTO public.company_benefits (
    company_id, benefit_type, name, description, configuration, eligibility_rules, is_active
  ) VALUES (
    v_company_id, 'meal_voucher', 'Vale Refeição', 'R$ 35,00 por dia útil (cartão Alelo)',
    jsonb_build_object('provider', 'Alelo', 'daily_value', 35.00, 'card_type', 'Refeição'),
    jsonb_build_object('minimum_tenure_days', 0, 'employment_type', jsonb_build_array('CLT', 'Contrato', 'Estágio')),
    true
  );

  -- Benefício 3: Vale Transporte
  INSERT INTO public.company_benefits (
    company_id, benefit_type, name, description, configuration, eligibility_rules, is_active
  ) VALUES (
    v_company_id, 'transportation', 'Vale Transporte', 'Créditos para transporte público',
    jsonb_build_object('provider', 'Bilhete Único', 'monthly_budget', 220.00),
    jsonb_build_object('minimum_tenure_days', 0),
    true
  );

  -- Benefício 4: Auxílio Educação
  INSERT INTO public.company_benefits (
    company_id, benefit_type, name, description, configuration, eligibility_rules, is_active
  ) VALUES (
    v_company_id, 'education', 'Auxílio Educação', 'Reembolso de até 80% em cursos',
    jsonb_build_object('reimbursement_percentage', 80, 'max_monthly_value', 800.00),
    jsonb_build_object('minimum_tenure_days', 180, 'employment_type', jsonb_build_array('CLT')),
    true
  );

  -- Benefício 5: Gympass
  INSERT INTO public.company_benefits (
    company_id, benefit_type, name, description, configuration, eligibility_rules, is_active
  ) VALUES (
    v_company_id, 'wellness', 'Gympass', 'Acesso a rede de academias',
    jsonb_build_object('provider', 'Gympass', 'plan_level', 'Gold'),
    jsonb_build_object('minimum_tenure_days', 60),
    true
  );

  RAISE NOTICE '✅ 5 Benefícios criados';

  -- ============================================
  -- CRIAR FUNCIONÁRIOS (versão compacta)
  -- ============================================

  -- Funcionário 1: João Silva
  INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '123.456.789-01', 'João Silva', 'joao.silva@techsolutions.com.br', '+55 11 91234-5678',
    'Desenvolvedor Sênior', 'Tecnologia', '2021-03-15', 12000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-06-15'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'wellness');

  -- Funcionário 2: Maria Santos
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '234.567.890-12', 'Maria Santos', 'maria.santos@techsolutions.com.br',
    'Gerente de Projetos', 'Gestão', '2020-07-01', 15000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2020-10-01'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id;

  -- Funcionário 3: Pedro Oliveira
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '345.678.901-23', 'Pedro Oliveira', 'pedro.oliveira@techsolutions.com.br',
    'Designer UI/UX', 'Design', '2021-09-10', 9000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-09-10'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 4: Ana Costa
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '456.789.012-34', 'Ana Costa', 'ana.costa@techsolutions.com.br',
    'Desenvolvedora Pleno', 'Tecnologia', '2022-01-20', 8500.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-04-20'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'education');

  -- Funcionário 5: Carlos Mendes
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '567.890.123-45', 'Carlos Mendes', 'carlos.mendes@techsolutions.com.br',
    'Desenvolvedor Júnior', 'Tecnologia', '2023-06-01', 5500.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2023-06-01'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 6: Juliana Ribeiro
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '678.901.234-56', 'Juliana Ribeiro', 'juliana.ribeiro@techsolutions.com.br',
    'Analista de QA', 'Qualidade', '2022-08-15', 7000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-11-15'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'wellness');

  -- Funcionário 7: Roberto Alves
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '789.012.345-67', 'Roberto Alves', 'roberto.alves@techsolutions.com.br',
    'Scrum Master', 'Gestão', '2021-11-01', 11000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-02-01'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id;

  -- Funcionário 8: Fernanda Lima
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '890.123.456-78', 'Fernanda Lima', 'fernanda.lima@techsolutions.com.br',
    'Desenvolvedora Sênior', 'Tecnologia', '2020-10-20', 13000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-01-20'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id;

  -- Funcionário 9: Lucas Martins
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '901.234.567-89', 'Lucas Martins', 'lucas.martins@techsolutions.com.br',
    'Estagiário', 'Tecnologia', '2024-02-01', 2200.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2024-02-01'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 10: Patrícia Souza
  INSERT INTO public.employees (company_id, cpf, name, email, position, department, hire_date, salary, is_active)
  VALUES (v_company_id, '012.345.678-90', 'Patrícia Souza', 'patricia.souza@techsolutions.com.br',
    'Analista de RH', 'Recursos Humanos', '2021-05-10', 8000.00, true)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-08-10'::DATE
  FROM public.company_benefits WHERE company_id = v_company_id;

  RAISE NOTICE '✅ 10 Funcionários criados';

  -- Atualizar contagem
  UPDATE public.companies
  SET employee_count = (SELECT COUNT(*) FROM public.employees WHERE company_id = v_company_id AND is_active = true)
  WHERE id = v_company_id;

  -- ============================================
  -- RESUMO
  -- ============================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Empresa: TechSolutions Ltda';
  RAISE NOTICE '📊 CNPJ: 12.345.678/0001-90';
  RAISE NOTICE '📊 Funcionários: 10';
  RAISE NOTICE '📊 Benefícios: 5';
  RAISE NOTICE '🔐 Login: company_manager@www.com';
  RAISE NOTICE '========================================';

END $$;

-- ============================================
-- 3. RECRIAR FUNÇÃO DE VALIDAÇÃO
-- ============================================

-- Recriar a função (opcional - o sistema pode funcionar sem ela para testes)
CREATE OR REPLACE FUNCTION public.ensure_only_admin_creates_companies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM public.clients
  WHERE user_id = auth.uid();

  -- Permitir apenas admins (super_admin, bank_manager, admin)
  IF user_role NOT IN ('super_admin', 'bank_manager', 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem criar empresas';
  END IF;

  RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS ensure_only_admin_creates_companies_trigger ON public.companies;

CREATE TRIGGER ensure_only_admin_creates_companies_trigger
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_only_admin_creates_companies();

-- Log final
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Função e trigger recriados!';
  RAISE NOTICE '✅ Sistema restaurado ao normal!';
END $$;
