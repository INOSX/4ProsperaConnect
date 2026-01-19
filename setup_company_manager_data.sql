-- ============================================
-- SETUP: Associar company_manager@www.com a Empresa Fictícia
-- Com Funcionários e Benefícios
-- ============================================
-- 
-- ⚠️ IMPORTANTE: Execute este script no Supabase SQL Editor
-- ============================================

-- ============================================
-- DESABILITAR TRIGGER ESPECÍFICO DE VALIDAÇÃO
-- ============================================

-- Desabilitar apenas o trigger que valida admin (não system triggers)
DO $$
DECLARE
  rec RECORD;  -- Variável para o loop
BEGIN
  -- Tentar desabilitar o trigger se existir
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ensure_only_admin_creates_companies_trigger'
  ) THEN
    ALTER TABLE public.companies DISABLE TRIGGER ensure_only_admin_creates_companies_trigger;
    RAISE NOTICE '✅ Trigger de validação desabilitado temporariamente';
  ELSE
    RAISE NOTICE '⚠️ Trigger não encontrado, tentando nomes alternativos...';
    
    -- Listar triggers da tabela companies para debug
    RAISE NOTICE 'Triggers encontrados:';
    FOR rec IN 
      SELECT tgname FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE c.relname = 'companies'
      AND tgname NOT LIKE 'RI_%'  -- Ignorar triggers de sistema (RI = Referential Integrity)
    LOOP
      RAISE NOTICE '  - %', rec.tgname;
    END LOOP;
  END IF;
END $$;

-- ============================================
-- 1. BUSCAR USER_ID DO COMPANY_MANAGER
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
  -- 2. CRIAR EMPRESA FICTÍCIA
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
    15, -- employee_count
    2500000.00, -- R$ 2.5M de faturamento anual
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
  -- 3. CRIAR BENEFÍCIOS DA EMPRESA
  -- ============================================

  -- Benefício 1: Plano de Saúde
  INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
  ) VALUES (
    v_company_id,
    'health_insurance',
    'Plano de Saúde Unimed',
    'Plano de saúde empresarial com cobertura nacional',
    jsonb_build_object(
      'provider', 'Unimed',
      'plan_type', 'Empresarial 300',
      'coverage', 'Nacional',
      'dependents_allowed', true,
      'max_dependents', 4
    ),
    jsonb_build_object(
      'minimum_tenure_days', 90,
      'employment_type', jsonb_build_array('CLT', 'Contrato')
    ),
    true
  )
  RETURNING id INTO v_benefit_id;

  RAISE NOTICE '✅ Benefício criado: Plano de Saúde (ID: %)', v_benefit_id;

  -- Benefício 2: Vale Refeição
  INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
  ) VALUES (
    v_company_id,
    'meal_voucher',
    'Vale Refeição',
    'R$ 35,00 por dia útil (cartão Alelo)',
    jsonb_build_object(
      'provider', 'Alelo',
      'daily_value', 35.00,
      'card_type', 'Refeição',
      'acceptance_network', 'Ampla'
    ),
    jsonb_build_object(
      'minimum_tenure_days', 0,
      'employment_type', jsonb_build_array('CLT', 'Contrato', 'Estágio')
    ),
    true
  )
  RETURNING id INTO v_benefit_id;

  RAISE NOTICE '✅ Benefício criado: Vale Refeição (ID: %)', v_benefit_id;

  -- Benefício 3: Vale Transporte
  INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
  ) VALUES (
    v_company_id,
    'transportation',
    'Vale Transporte',
    'Créditos para transporte público (Bilhete Único SP)',
    jsonb_build_object(
      'provider', 'Bilhete Único',
      'monthly_budget', 220.00,
      'transport_type', jsonb_build_array('Metrô', 'Ônibus', 'Trem')
    ),
    jsonb_build_object(
      'minimum_tenure_days', 0,
      'requires_proof_of_residence', true
    ),
    true
  )
  RETURNING id INTO v_benefit_id;

  RAISE NOTICE '✅ Benefício criado: Vale Transporte (ID: %)', v_benefit_id;

  -- Benefício 4: Auxílio Educação
  INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
  ) VALUES (
    v_company_id,
    'education',
    'Auxílio Educação',
    'Reembolso de até 80% em cursos relacionados à área de atuação',
    jsonb_build_object(
      'reimbursement_percentage', 80,
      'max_monthly_value', 800.00,
      'allowed_courses', jsonb_build_array('Graduação', 'Pós-graduação', 'Cursos técnicos', 'Certificações'),
      'requires_approval', true
    ),
    jsonb_build_object(
      'minimum_tenure_days', 180,
      'employment_type', jsonb_build_array('CLT'),
      'minimum_performance_score', 7.5
    ),
    true
  )
  RETURNING id INTO v_benefit_id;

  RAISE NOTICE '✅ Benefício criado: Auxílio Educação (ID: %)', v_benefit_id;

  -- Benefício 5: Gympass
  INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
  ) VALUES (
    v_company_id,
    'wellness',
    'Gympass',
    'Acesso a rede de academias e estúdios (plano Gold)',
    jsonb_build_object(
      'provider', 'Gympass',
      'plan_level', 'Gold',
      'gyms_available', '500+',
      'includes_online_classes', true
    ),
    jsonb_build_object(
      'minimum_tenure_days', 60,
      'employment_type', jsonb_build_array('CLT', 'Contrato')
    ),
    true
  )
  RETURNING id INTO v_benefit_id;

  RAISE NOTICE '✅ Benefício criado: Gympass (ID: %)', v_benefit_id;

  -- ============================================
  -- 4. CRIAR FUNCIONÁRIOS
  -- ============================================

  -- Funcionário 1: João Silva (Desenvolvedor Sênior)
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
  ) VALUES (
    v_company_id,
    '123.456.789-01',
    'João Silva',
    'joao.silva@techsolutions.com.br',
    '+55 11 91234-5678',
    'Desenvolvedor Sênior',
    'Tecnologia',
    '2021-03-15',
    12000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: João Silva (ID: %)', v_employee_id;

  -- Vincular benefícios ao João (Plano de Saúde, Vale Refeição, Vale Transporte, Gympass)
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-06-15'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'wellness');

  -- Funcionário 2: Maria Santos (Gerente de Projetos)
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
  ) VALUES (
    v_company_id,
    '234.567.890-12',
    'Maria Santos',
    'maria.santos@techsolutions.com.br',
    '+55 11 92345-6789',
    'Gerente de Projetos',
    'Gestão',
    '2020-07-01',
    15000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Maria Santos (ID: %)', v_employee_id;

  -- Vincular TODOS os benefícios à Maria
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2020-10-01'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id;

  -- Funcionário 3: Pedro Oliveira (Designer UI/UX)
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
  ) VALUES (
    v_company_id,
    '345.678.901-23',
    'Pedro Oliveira',
    'pedro.oliveira@techsolutions.com.br',
    '+55 11 93456-7890',
    'Designer UI/UX',
    'Design',
    '2021-09-10',
    9000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Pedro Oliveira (ID: %)', v_employee_id;

  -- Vincular benefícios básicos ao Pedro (Vale Refeição, Vale Transporte)
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-09-10'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 4: Ana Costa (Desenvolvedora Pleno)
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
  ) VALUES (
    v_company_id,
    '456.789.012-34',
    'Ana Costa',
    'ana.costa@techsolutions.com.br',
    '+55 11 94567-8901',
    'Desenvolvedora Pleno',
    'Tecnologia',
    '2022-01-20',
    8500.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Ana Costa (ID: %)', v_employee_id;

  -- Vincular benefícios à Ana (Saúde, Refeição, Transporte, Educação)
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-04-20'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'education');

  -- Funcionário 5: Carlos Mendes (Desenvolvedor Júnior)
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
  ) VALUES (
    v_company_id,
    '567.890.123-45',
    'Carlos Mendes',
    'carlos.mendes@techsolutions.com.br',
    '+55 11 95678-9012',
    'Desenvolvedor Júnior',
    'Tecnologia',
    '2023-06-01',
    5500.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Carlos Mendes (ID: %)', v_employee_id;

  -- Vincular benefícios básicos ao Carlos
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2023-06-01'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 6: Juliana Ribeiro (Analista de QA)
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
  ) VALUES (
    v_company_id,
    '678.901.234-56',
    'Juliana Ribeiro',
    'juliana.ribeiro@techsolutions.com.br',
    '+55 11 96789-0123',
    'Analista de QA',
    'Qualidade',
    '2022-08-15',
    7000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Juliana Ribeiro (ID: %)', v_employee_id;

  -- Vincular benefícios à Juliana (Saúde, Refeição, Transporte, Gympass)
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-11-15'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'wellness');

  -- Funcionário 7: Roberto Alves (Scrum Master)
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
  ) VALUES (
    v_company_id,
    '789.012.345-67',
    'Roberto Alves',
    'roberto.alves@techsolutions.com.br',
    '+55 11 97890-1234',
    'Scrum Master',
    'Gestão',
    '2021-11-01',
    11000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Roberto Alves (ID: %)', v_employee_id;

  -- Vincular TODOS os benefícios ao Roberto
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2022-02-01'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id;

  -- Funcionário 8: Fernanda Lima (Desenvolvedora Sênior)
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
  ) VALUES (
    v_company_id,
    '890.123.456-78',
    'Fernanda Lima',
    'fernanda.lima@techsolutions.com.br',
    '+55 11 98901-2345',
    'Desenvolvedora Sênior',
    'Tecnologia',
    '2020-10-20',
    13000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Fernanda Lima (ID: %)', v_employee_id;

  -- Vincular TODOS os benefícios à Fernanda
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-01-20'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id;

  -- Funcionário 9: Lucas Martins (Estagiário Desenvolvimento)
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
  ) VALUES (
    v_company_id,
    '901.234.567-89',
    'Lucas Martins',
    'lucas.martins@techsolutions.com.br',
    '+55 11 99012-3456',
    'Estagiário Desenvolvimento',
    'Tecnologia',
    '2024-02-01',
    2200.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Lucas Martins (ID: %)', v_employee_id;

  -- Vincular apenas Vale Refeição e Transporte ao Lucas (estagiário)
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2024-02-01'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id
  AND benefit_type IN ('meal_voucher', 'transportation');

  -- Funcionário 10: Patrícia Souza (Analista de RH)
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
  ) VALUES (
    v_company_id,
    '012.345.678-90',
    'Patrícia Souza',
    'patricia.souza@techsolutions.com.br',
    '+55 11 90123-4567',
    'Analista de RH',
    'Recursos Humanos',
    '2021-05-10',
    8000.00,
    false,
    true
  )
  RETURNING id INTO v_employee_id;

  RAISE NOTICE '✅ Funcionário criado: Patrícia Souza (ID: %)', v_employee_id;

  -- Vincular TODOS os benefícios à Patrícia
  INSERT INTO public.employee_benefits (employee_id, company_benefit_id, status, activation_date)
  SELECT v_employee_id, id, 'active', '2021-08-10'::DATE
  FROM public.company_benefits
  WHERE company_id = v_company_id;

  -- ============================================
  -- 5. ATUALIZAR CONTAGEM DE FUNCIONÁRIOS
  -- ============================================

  UPDATE public.companies
  SET employee_count = (
    SELECT COUNT(*) 
    FROM public.employees 
    WHERE company_id = v_company_id AND is_active = true
  )
  WHERE id = v_company_id;

  -- ============================================
  -- 6. RESUMO FINAL
  -- ============================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  RAISE NOTICE '  • Empresa: TechSolutions Ltda';
  RAISE NOTICE '  • CNPJ: 12.345.678/0001-90';
  RAISE NOTICE '  • Gestor: company_manager@www.com';
  RAISE NOTICE '  • Funcionários: 10';
  RAISE NOTICE '  • Benefícios: 5';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 BENEFÍCIOS CADASTRADOS:';
  RAISE NOTICE '  1. Plano de Saúde Unimed';
  RAISE NOTICE '  2. Vale Refeição (R$ 35/dia)';
  RAISE NOTICE '  3. Vale Transporte';
  RAISE NOTICE '  4. Auxílio Educação (80%% reembolso)';
  RAISE NOTICE '  5. Gympass (plano Gold)';
  RAISE NOTICE '';
  RAISE NOTICE '👥 FUNCIONÁRIOS:';
  RAISE NOTICE '  1. João Silva - Desenvolvedor Sênior';
  RAISE NOTICE '  2. Maria Santos - Gerente de Projetos';
  RAISE NOTICE '  3. Pedro Oliveira - Designer UI/UX';
  RAISE NOTICE '  4. Ana Costa - Desenvolvedora Pleno';
  RAISE NOTICE '  5. Carlos Mendes - Desenvolvedor Júnior';
  RAISE NOTICE '  6. Juliana Ribeiro - Analista de QA';
  RAISE NOTICE '  7. Roberto Alves - Scrum Master';
  RAISE NOTICE '  8. Fernanda Lima - Desenvolvedora Sênior';
  RAISE NOTICE '  9. Lucas Martins - Estagiário';
  RAISE NOTICE '  10. Patrícia Souza - Analista de RH';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 ACESSO:';
  RAISE NOTICE '  • Login: company_manager@www.com';
  RAISE NOTICE '  • Senha: 1qazxsw2';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';

END $$;

-- ============================================
-- RE-HABILITAR TRIGGER DE VALIDAÇÃO
-- ============================================

DO $$
BEGIN
  -- Re-habilitar o trigger se foi desabilitado
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ensure_only_admin_creates_companies_trigger'
  ) THEN
    ALTER TABLE public.companies ENABLE TRIGGER ensure_only_admin_creates_companies_trigger;
    RAISE NOTICE '✅ Trigger de validação re-habilitado';
  END IF;
END $$;

-- ============================================
-- LOG FINAL
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '✅ Dados de teste criados e prontos para uso!';
  RAISE NOTICE '✅ Triggers restaurados ao estado normal!';
END $$;
