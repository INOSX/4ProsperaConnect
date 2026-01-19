-- ============================================================================
-- TRIGGER AUTOMÁTICO: Vincular company_employee ao employee
-- ============================================================================
-- 
-- Este trigger busca automaticamente o employee correspondente quando um
-- novo usuário com role 'company_employee' é criado na tabela clients.
--
-- Busca por:
-- 1. Email (se o employee tiver email cadastrado)
-- 2. CPF (se fornecido nos metadados do usuário)
--
-- ============================================================================

-- Função que vincula automaticamente employee ao user
CREATE OR REPLACE FUNCTION public.auto_link_employee_to_user()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_user_email TEXT;
BEGIN
  -- Só processa se for company_employee
  IF NEW.role = 'company_employee' THEN
    
    -- Buscar email do usuário na tabela auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Buscar employee por email
    IF v_user_email IS NOT NULL THEN
      SELECT id INTO v_employee_id
      FROM public.employees
      WHERE email = v_user_email
      AND platform_user_id IS NULL  -- Só vincula se ainda não tiver usuário
      LIMIT 1;
      
      -- Se encontrou, vincula
      IF v_employee_id IS NOT NULL THEN
        UPDATE public.employees
        SET platform_user_id = NEW.user_id,
            has_platform_access = TRUE
        WHERE id = v_employee_id;
        
        RAISE NOTICE 'Employee % vinculado ao user % (por email)', v_employee_id, NEW.user_id;
        RETURN NEW;
      END IF;
    END IF;
    
    -- Se não encontrou por email, poderia buscar por CPF aqui
    -- (mas precisaria armazenar CPF em algum lugar acessível)
    
    RAISE NOTICE 'Nenhum employee encontrado para vincular ao user %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS auto_link_employee_trigger ON public.clients;
CREATE TRIGGER auto_link_employee_trigger
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_employee_to_user();

-- ============================================================================
-- TESTE DO TRIGGER
-- ============================================================================
-- Para testar, você pode criar um novo employee e depois um novo user:
--
-- 1. Criar employee com email:
-- INSERT INTO public.employees (company_id, cpf, name, email)
-- VALUES (
--   (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-90'),
--   '999.888.777-66',
--   'Maria Teste',
--   'maria.teste@techsolutions.com.br'
-- );
--
-- 2. Criar user no Supabase Auth com email maria.teste@techsolutions.com.br
--
-- 3. Criar client com role company_employee
-- INSERT INTO public.clients (user_id, email, role)
-- VALUES (
--   '[user_id do Supabase Auth]',
--   'maria.teste@techsolutions.com.br',
--   'company_employee'
-- );
--
-- O trigger vai vincular automaticamente!
-- ============================================================================
