-- Script para criar dados mockados de produtos bancários
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute primeiro create_banking_solution_tables.sql e create_employee_products_table.sql

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_catalog') THEN
        RAISE EXCEPTION 'A tabela product_catalog não existe. Execute primeiro o script create_banking_solution_tables.sql';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employee_products') THEN
        RAISE EXCEPTION 'A tabela employee_products não existe. Execute primeiro o script create_employee_products_table.sql';
    END IF;
END $$;

-- ============================================
-- PRODUTOS BANCÁRIOS MOCKADOS
-- ============================================

-- Limpar produtos existentes (opcional - comentar se quiser manter)
-- DELETE FROM public.employee_products;
-- DELETE FROM public.product_catalog WHERE product_code LIKE 'INS-%' OR product_code LIKE 'CAP-%' OR product_code LIKE 'PRE-%';

-- Seguros
INSERT INTO public.product_catalog (product_code, name, description, product_type, category, target_audience, features, pricing, is_active)
VALUES
  ('INS-001', 'Seguro de Vida', 'Seguro de vida individual com cobertura de até R$ 200.000', 'insurance', 'life_insurance',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Cobertura de morte natural e acidental", "Sem carência", "Prêmio mensal a partir de R$ 30"]'::jsonb,
   '{"min_premium": 30, "max_coverage": 200000, "coverage_type": "death"}'::jsonb,
   true),
  
  ('INS-002', 'Seguro Previdência Privada', 'Plano de previdência privada com aportes flexíveis', 'insurance', 'pension',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Aportes mensais a partir de R$ 100", "Rentabilidade atrelada ao CDI", "Resgate parcial permitido"]'::jsonb,
   '{"min_monthly_contribution": 100, "yield": "CDI + 1%", "management_fee": 0.5}'::jsonb,
   true),
  
  ('INS-003', 'Seguro Residencial', 'Seguro residencial com cobertura completa', 'insurance', 'home_insurance',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Cobertura para incêndio, roubo e danos", "Assistência 24h", "Prêmio mensal a partir de R$ 50"]'::jsonb,
   '{"min_premium": 50, "coverage_types": ["fire", "theft", "damage"]}'::jsonb,
   true),

-- Títulos de Capitalização
  ('CAP-001', 'Título de Capitalização - Poupança Plus', 'Título de capitalização com sorteios mensais e resgate garantido', 'investment', 'capitalization',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Sorteios mensais de prêmios", "Resgate do valor investido após 24 meses", "Aplicação mínima de R$ 50/mês"]'::jsonb,
   '{"min_monthly_investment": 50, "term_months": 24, "yield": "100% do valor aplicado + prêmios"}'::jsonb,
   true),
  
  ('CAP-002', 'Título de Capitalização - Super Sorte', 'Título com sorteios semanais e resgate flexível', 'investment', 'capitalization',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Sorteios semanais", "Resgate a partir de 12 meses", "Aplicação mínima de R$ 30/mês"]'::jsonb,
   '{"min_monthly_investment": 30, "term_months": 12, "yield": "100% do valor aplicado + prêmios"}'::jsonb,
   true),

-- Previdência
  ('PRE-001', 'Previdência Complementar - VGBL', 'VGBL com tributação regressiva e resgate flexível', 'investment', 'pension',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Tributação regressiva", "Deduções no IR", "Resgate após 2 anos"]'::jsonb,
   '{"min_monthly_contribution": 100, "tax_regime": "regressive", "min_term_years": 2}'::jsonb,
   true),
  
  ('PRE-002', 'Previdência Complementar - PGBL', 'PGBL com dedução no IR e resgate programado', 'investment', 'pension',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Dedução de até 12% da renda no IR", "Resgate programado", "Aportes a partir de R$ 100/mês"]'::jsonb,
   '{"min_monthly_contribution": 100, "ir_deduction_percent": 12, "tax_regime": "progressive"}'::jsonb,
   true),

-- Investimentos
  ('INV-002', 'CDB - Capital de Giro', 'CDB com liquidez diária e rentabilidade atrativa', 'investment', 'fixed_income',
   ARRAY['PME', 'MEI', 'Employee'],
   '["Liquidez diária", "Rentabilidade CDI + 0.8%", "Aplicação mínima de R$ 1.000"]'::jsonb,
   '{"min_amount": 1000, "yield": "CDI + 0.8%", "liquidity": "daily"}'::jsonb,
   true),
  
  ('INV-003', 'Tesouro Direto - Empresarial', 'Acesso facilitado ao Tesouro Direto para empresas', 'investment', 'treasury',
   ARRAY['PME'],
   '["Acesso via plataforma digital", "Diversos títulos disponíveis", "Aplicação mínima de R$ 100"]'::jsonb,
   '{"min_amount": 100, "available_titles": ["SELIC", "IPCA+", "Prefixado"]}'::jsonb,
   true),

-- Crédito Consignado
  ('CRD-002', 'Crédito Consignado - Colaboradores', 'Crédito consignado com desconto em folha de pagamento', 'credit', 'payroll_deduction',
   ARRAY['Employee'],
   '["Taxa reduzida", "Desconto automático em folha", "Até 30% da renda"]'::jsonb,
   '{"interest_rate": 1.2, "max_percent_income": 30, "min_amount": 500, "max_amount": 50000}'::jsonb,
   true),

-- Conta Corrente
  ('ACC-002', 'Conta Corrente Pessoa Física', 'Conta corrente com tarifas reduzidas para colaboradores', 'account', 'checking',
   ARRAY['Employee'],
   '["Sem tarifa de manutenção", "Cartão de débito gratuito", "Transferências ilimitadas"]'::jsonb,
   '{"monthly_fee": 0, "debit_card_fee": 0, "unlimited_transfers": true}'::jsonb,
   true)
ON CONFLICT (product_code) DO NOTHING;

-- ============================================
-- ATRIBUIR PRODUTOS AOS COLABORADORES
-- ============================================

-- Atribuir seguros de vida a alguns colaboradores
WITH ranked_employees AS (
  SELECT 
    e.id,
    e.company_id,
    e.hire_date,
    ROW_NUMBER() OVER (PARTITION BY e.company_id ORDER BY e.id) as rn
  FROM public.employees e
  WHERE e.is_active = true
    AND e.hire_date <= CURRENT_DATE - INTERVAL '30 days'
)
INSERT INTO public.employee_products (employee_id, product_id, contract_number, status, contract_date, monthly_value, contract_details)
SELECT 
  re.id,
  p.id,
  'INS-' || LPAD((ROW_NUMBER() OVER (ORDER BY re.id))::text, 6, '0'),
  'active',
  re.hire_date + INTERVAL '30 days',
  35.00,
  '{"coverage_amount": 150000, "beneficiary": "Família"}'::jsonb
FROM ranked_employees re
CROSS JOIN public.product_catalog p
WHERE p.product_code = 'INS-001'
  AND MOD(re.rn, 2) = 0  -- Aproximadamente 50% dos colaboradores
ON CONFLICT DO NOTHING;

-- Atribuir títulos de capitalização
WITH ranked_employees AS (
  SELECT 
    e.id,
    e.company_id,
    e.hire_date,
    ROW_NUMBER() OVER (PARTITION BY e.company_id ORDER BY e.id) as rn
  FROM public.employees e
  WHERE e.is_active = true
    AND e.hire_date <= CURRENT_DATE - INTERVAL '60 days'
),
numbered_employees AS (
  SELECT 
    re.*,
    ROW_NUMBER() OVER (ORDER BY re.id) as global_rn
  FROM ranked_employees re
  WHERE MOD(re.rn, 3) = 0  -- Aproximadamente 33% dos colaboradores
)
INSERT INTO public.employee_products (employee_id, product_id, contract_number, status, contract_date, monthly_value, contract_details)
SELECT 
  ne.id,
  p.id,
  'CAP-' || LPAD(ne.global_rn::text, 6, '0'),
  'active',
  ne.hire_date + INTERVAL '60 days',
  50.00,
  jsonb_build_object('term_months', 24, 'participation_number', 'CAP' || LPAD(ne.global_rn::text, 8, '0'))
FROM numbered_employees ne
CROSS JOIN public.product_catalog p
WHERE p.product_code = 'CAP-001'
ON CONFLICT DO NOTHING;

-- Atribuir previdência privada
WITH ranked_employees AS (
  SELECT 
    e.id,
    e.company_id,
    e.hire_date,
    ROW_NUMBER() OVER (PARTITION BY e.company_id ORDER BY e.id) as rn
  FROM public.employees e
  WHERE e.is_active = true
    AND e.hire_date <= CURRENT_DATE - INTERVAL '90 days'
    AND e.salary >= 5000  -- Apenas colaboradores com salário >= R$ 5.000
),
numbered_employees AS (
  SELECT 
    re.*,
    ROW_NUMBER() OVER (ORDER BY re.id) as global_rn
  FROM ranked_employees re
  WHERE MOD(re.rn, 4) = 0  -- Aproximadamente 25% dos elegíveis
)
INSERT INTO public.employee_products (employee_id, product_id, contract_number, status, contract_date, monthly_value, contract_details)
SELECT 
  ne.id,
  p.id,
  'PRE-' || LPAD(ne.global_rn::text, 6, '0'),
  'active',
  ne.hire_date + INTERVAL '90 days',
  150.00,
  '{"contribution_type": "monthly", "target_amount": 50000}'::jsonb
FROM numbered_employees ne
CROSS JOIN public.product_catalog p
WHERE p.product_code = 'PRE-001'
ON CONFLICT DO NOTHING;

-- Atribuir crédito consignado
WITH ranked_employees AS (
  SELECT 
    e.id,
    e.company_id,
    e.salary,
    ROW_NUMBER() OVER (PARTITION BY e.company_id ORDER BY e.id) as rn
  FROM public.employees e
  WHERE e.is_active = true
    AND e.hire_date <= CURRENT_DATE - INTERVAL '90 days'
),
numbered_employees AS (
  SELECT 
    re.*,
    ROW_NUMBER() OVER (ORDER BY re.id) as global_rn,
    CASE 
      WHEN re.salary * 0.15 < 500 THEN 500
      WHEN re.salary * 0.15 > 2000 THEN 2000
      ELSE re.salary * 0.15
    END as monthly_value
  FROM ranked_employees re
  WHERE MOD(re.rn, 5) = 0  -- Aproximadamente 20% dos colaboradores
)
INSERT INTO public.employee_products (employee_id, product_id, contract_number, status, contract_date, monthly_value, contract_details)
SELECT 
  ne.id,
  p.id,
  'CRD-' || LPAD(ne.global_rn::text, 6, '0'),
  'active',
  CURRENT_DATE - INTERVAL '45 days',
  ne.monthly_value,
  jsonb_build_object(
    'loan_amount', (ne.monthly_value * 12),
    'installments', 12
  )
FROM numbered_employees ne
CROSS JOIN public.product_catalog p
WHERE p.product_code = 'CRD-002'
ON CONFLICT DO NOTHING;

-- Atribuir contas correntes
WITH ranked_employees AS (
  SELECT 
    e.id,
    e.company_id,
    e.hire_date,
    ROW_NUMBER() OVER (PARTITION BY e.company_id ORDER BY e.id) as rn
  FROM public.employees e
  WHERE e.is_active = true
),
numbered_employees AS (
  SELECT 
    re.*,
    ROW_NUMBER() OVER (ORDER BY re.id) as global_rn
  FROM ranked_employees re
  WHERE MOD(re.rn, 2) = 1  -- Aproximadamente 50% dos colaboradores
)
INSERT INTO public.employee_products (employee_id, product_id, contract_number, status, contract_date, monthly_value, contract_details)
SELECT 
  ne.id,
  p.id,
  'ACC-' || LPAD(ne.global_rn::text, 6, '0'),
  'active',
  ne.hire_date,
  0.00,
  '{"account_type": "checking", "debit_card": true}'::jsonb
FROM numbered_employees ne
CROSS JOIN public.product_catalog p
WHERE p.product_code = 'ACC-002'
ON CONFLICT DO NOTHING;

-- ============================================
-- MENSAGEM DE CONCLUSÃO
-- ============================================

DO $$
DECLARE
    product_count INTEGER;
    employee_product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.product_catalog WHERE product_code LIKE 'INS-%' OR product_code LIKE 'CAP-%' OR product_code LIKE 'PRE-%' OR product_code LIKE 'INV-%' OR product_code LIKE 'CRD-%' OR product_code LIKE 'ACC-%';
    SELECT COUNT(*) INTO employee_product_count FROM public.employee_products;
    
    RAISE NOTICE 'Produtos bancários mockados criados com sucesso!';
    RAISE NOTICE 'Produtos no catálogo: %', product_count;
    RAISE NOTICE 'Produtos atribuídos a colaboradores: %', employee_product_count;
END $$;

