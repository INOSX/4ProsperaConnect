-- ============================================
-- COPIE E COLE NO SQL CONSOLE DO SUPABASE
-- ============================================
-- Associar company_employee@www.com ao João Silva da TechSolutions
-- ============================================

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

-- Verificar
SELECT 
  e.id,
  e.name as employee_name,
  e.email as employee_email,
  c.email as client_email,
  c.role as client_role,
  co.company_name
FROM public.employees e
LEFT JOIN public.clients c ON c.user_id = e.platform_user_id
LEFT JOIN public.companies co ON co.id = e.company_id
WHERE e.cpf = '123.456.789-01';
