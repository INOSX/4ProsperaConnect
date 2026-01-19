-- ============================================================================
-- SQL SIMPLIFICADO: Vincular company_employee@www.com agora
-- ============================================================================

-- OPÇÃO 1: Vincular por CPF (mais confiável)
SELECT public.link_employee_by_cpf(
  'company_employee@www.com',
  '123.456.789-01'
);

-- OPÇÃO 2: Se a opção 1 não funcionar, use o UPDATE direto:
UPDATE public.employees
SET 
  platform_user_id = (
    SELECT user_id 
    FROM public.clients 
    WHERE email = 'company_employee@www.com'
  ),
  has_platform_access = TRUE
WHERE cpf = '123.456.789-01';

-- Verificar se funcionou:
SELECT 
  e.id,
  e.name,
  e.email,
  e.cpf,
  e.has_platform_access,
  c.email as user_email,
  c.role as user_role
FROM public.employees e
LEFT JOIN public.clients c ON e.platform_user_id = c.user_id
WHERE e.cpf = '123.456.789-01';
