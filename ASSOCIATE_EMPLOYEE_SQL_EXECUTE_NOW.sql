-- ============================================================================
-- IMPORTANTE: EXECUTE ESTE SQL NO SUPABASE SQL EDITOR AGORA!
-- ============================================================================
-- 
-- Este SQL associa o usuário company_employee@www.com a um employee específico
-- (João Silva da empresa TechSolutions) setando o platform_user_id.
--
-- Sem isso, o redirecionamento automático não funcionará.
--
-- ============================================================================

-- Associar company_employee@www.com ao João Silva da TechSolutions
UPDATE public.employees
SET platform_user_id = (
  SELECT user_id 
  FROM public.clients 
  WHERE email = 'company_employee@www.com'
)
WHERE cpf = '123.456.789-01'
AND company_id = (
  SELECT id 
  FROM public.companies 
  WHERE cnpj = '12.345.678/0001-90'
);

-- Verificar se a associação funcionou
SELECT 
  e.id as employee_id,
  e.name,
  e.cpf,
  e.platform_user_id,
  c.email as user_email,
  comp.company_name
FROM public.employees e
LEFT JOIN public.clients c ON e.platform_user_id = c.user_id
LEFT JOIN public.companies comp ON e.company_id = comp.id
WHERE e.cpf = '123.456.789-01';
