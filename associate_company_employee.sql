-- ============================================
-- Associar company_employee@www.com a um funcionário
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
  v_employee_id UUID;
  v_company_id UUID;
BEGIN
  -- Buscar o user_id do company_employee@www.com
  SELECT user_id INTO v_user_id
  FROM public.clients
  WHERE email = 'company_employee@www.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Usuário company_employee@www.com não encontrado!';
  END IF;

  RAISE NOTICE '✅ User ID encontrado: %', v_user_id;

  -- Buscar a empresa TechSolutions
  SELECT id INTO v_company_id
  FROM public.companies
  WHERE cnpj = '12.345.678/0001-90';

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION '❌ Empresa TechSolutions não encontrada!';
  END IF;

  RAISE NOTICE '✅ Company ID: %', v_company_id;

  -- Pegar o primeiro employee disponível (João Silva)
  SELECT id INTO v_employee_id
  FROM public.employees
  WHERE company_id = v_company_id
  AND cpf = '123.456.789-01'
  LIMIT 1;

  IF v_employee_id IS NULL THEN
    RAISE EXCEPTION '❌ Employee João Silva não encontrado!';
  END IF;

  RAISE NOTICE '✅ Employee ID: %', v_employee_id;

  -- Associar o user_id ao employee
  UPDATE public.employees
  SET platform_user_id = v_user_id
  WHERE id = v_employee_id;

  RAISE NOTICE '✅ Employee associado ao usuário company_employee@www.com';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ASSOCIAÇÃO CONCLUÍDA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '👤 Login: company_employee@www.com';
  RAISE NOTICE '🏢 Empresa: TechSolutions Ltda';
  RAISE NOTICE '👔 Funcionário: João Silva';
  RAISE NOTICE '========================================';

END $$;
