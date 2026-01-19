-- ============================================================================
-- FUNÇÃO AUXILIAR: Vincular employee manualmente
-- ============================================================================
-- 
-- Use esta função para vincular manualmente um employee a um usuário
-- quando o trigger automático não funcionar (ex: emails diferentes).
--
-- ============================================================================

-- Função para vincular employee por email
CREATE OR REPLACE FUNCTION public.link_employee_by_email(
  p_user_email TEXT,
  p_employee_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_employee_id UUID;
  v_result JSONB;
BEGIN
  -- Buscar user_id
  SELECT user_id INTO v_user_id
  FROM public.clients
  WHERE email = p_user_email
  AND role = 'company_employee';
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado ou não é company_employee'
    );
  END IF;
  
  -- Buscar employee_id
  SELECT id INTO v_employee_id
  FROM public.employees
  WHERE email = p_employee_email
  AND platform_user_id IS NULL;
  
  IF v_employee_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Employee não encontrado ou já vinculado'
    );
  END IF;
  
  -- Vincular
  UPDATE public.employees
  SET platform_user_id = v_user_id,
      has_platform_access = TRUE,
      updated_at = NOW()
  WHERE id = v_employee_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'employee_id', v_employee_id,
    'user_id', v_user_id,
    'message', 'Employee vinculado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para vincular employee por CPF
CREATE OR REPLACE FUNCTION public.link_employee_by_cpf(
  p_user_email TEXT,
  p_employee_cpf TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_employee_id UUID;
  v_result JSONB;
BEGIN
  -- Buscar user_id
  SELECT user_id INTO v_user_id
  FROM public.clients
  WHERE email = p_user_email
  AND role = 'company_employee';
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado ou não é company_employee'
    );
  END IF;
  
  -- Buscar employee_id
  SELECT id INTO v_employee_id
  FROM public.employees
  WHERE cpf = p_employee_cpf
  AND platform_user_id IS NULL;
  
  IF v_employee_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Employee não encontrado ou já vinculado'
    );
  END IF;
  
  -- Vincular
  UPDATE public.employees
  SET platform_user_id = v_user_id,
      has_platform_access = TRUE,
      updated_at = NOW()
  WHERE id = v_employee_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'employee_id', v_employee_id,
    'user_id', v_user_id,
    'message', 'Employee vinculado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EXEMPLOS DE USO
-- ============================================================================

-- Vincular por email:
-- SELECT public.link_employee_by_email(
--   'company_employee@www.com',
--   'joao.silva@techsolutions.com.br'
-- );

-- Vincular por CPF:
-- SELECT public.link_employee_by_cpf(
--   'company_employee@www.com',
--   '123.456.789-01'
-- );
