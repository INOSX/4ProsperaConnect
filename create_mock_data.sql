-- Script para criar dados mockados para desenvolvimento
-- Execute este script no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)
-- IMPORTANTE: Execute primeiro o script create_banking_solution_tables.sql

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_catalog') THEN
        RAISE EXCEPTION 'A tabela product_catalog não existe. Execute primeiro o script create_banking_solution_tables.sql';
    END IF;
END $$;

-- ============================================
-- DADOS MOCKADOS DE PROSPECÇÃO
-- ============================================

-- Prospects mockados
INSERT INTO public.prospects (cpf, name, email, phone, score, qualification_status, market_signals, behavior_data, consumption_profile, conversion_probability, priority, created_by)
VALUES
  ('12345678901', 'João Silva', 'joao.silva@email.com', '(11) 98765-4321', 85, 'qualified', 
   '{"high_transaction_volume": true, "frequent_activity": true, "business_activity": true}'::jsonb,
   '{"transaction_count": 45, "avg_transaction_value": 15000}'::jsonb,
   '{"category": "business", "pattern": "growth"}'::jsonb,
   0.85, 9, (SELECT id FROM auth.users LIMIT 1)),
  
  ('23456789012', 'Maria Santos', 'maria.santos@email.com', '(11) 97654-3210', 72, 'qualified',
   '{"high_transaction_volume": true, "business_activity": true}'::jsonb,
   '{"transaction_count": 32, "avg_transaction_value": 12000}'::jsonb,
   '{"category": "business", "pattern": "stable"}'::jsonb,
   0.72, 7, (SELECT id FROM auth.users LIMIT 1)),
  
  ('34567890123', 'Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 96543-2109', 58, 'pending',
   '{"frequent_activity": true}'::jsonb,
   '{"transaction_count": 18, "avg_transaction_value": 8000}'::jsonb,
   '{"category": "mixed", "pattern": "growth"}'::jsonb,
   0.58, 5, (SELECT id FROM auth.users LIMIT 1)),
  
  ('45678901234', 'Ana Costa', 'ana.costa@email.com', '(11) 95432-1098', 45, 'pending',
   '{}'::jsonb,
   '{"transaction_count": 12, "avg_transaction_value": 5000}'::jsonb,
   '{"category": "personal", "pattern": "stable"}'::jsonb,
   0.45, 3, (SELECT id FROM auth.users LIMIT 1)),
  
  ('56789012345', 'Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 94321-0987', 90, 'qualified',
   '{"high_transaction_volume": true, "frequent_activity": true, "business_activity": true, "growth_trend": true}'::jsonb,
   '{"transaction_count": 60, "avg_transaction_value": 25000}'::jsonb,
   '{"category": "business", "pattern": "growth"}'::jsonb,
   0.90, 10, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Mapeamento CPF-CNPJ mockado
INSERT INTO public.cpf_to_cnpj_mapping (cpf, cnpj, company_name, company_type, relationship_type, is_active)
VALUES
  ('12345678901', '12345678000190', 'Silva & Associados LTDA', 'LTDA', 'owner', true),
  ('23456789012', '23456789000123', 'Santos Comércio ME', 'MEI', 'owner', true),
  ('56789012345', '56789012000145', 'Ferreira Consultoria EIRELI', 'EIRELI', 'owner', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- DADOS MOCKADOS DE EMPRESAS
-- ============================================

-- Empresas mockadas
INSERT INTO public.companies (cnpj, company_name, trade_name, company_type, email, phone, banking_status, employee_count, industry, annual_revenue, owner_user_id)
VALUES
  ('12345678000190', 'Silva & Associados LTDA', 'Silva Associados', 'LTDA', 'contato@silvaassociados.com.br', '(11) 3456-7890', 'fully_banked', 25, 'Consultoria', 500000.00, (SELECT id FROM auth.users LIMIT 1)),
  ('23456789000123', 'Santos Comércio ME', 'Santos Comércio', 'MEI', 'contato@santoscomercio.com.br', '(11) 3456-7891', 'partial', 3, 'Comércio', 120000.00, (SELECT id FROM auth.users LIMIT 1)),
  ('56789012000145', 'Ferreira Consultoria EIRELI', 'Ferreira Consult', 'EIRELI', 'contato@ferreiraconsult.com.br', '(11) 3456-7892', 'fully_banked', 15, 'Consultoria', 800000.00, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (cnpj) DO NOTHING;

-- Colaboradores mockados
INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '11122233344',
  'Roberto Alves',
  'roberto.alves@silvaassociados.com.br',
  '(11) 98765-1111',
  'Gerente de Vendas',
  'Vendas',
  '2023-01-15',
  8000.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.employees (company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, is_active)
SELECT 
  c.id,
  '22233344455',
  'Juliana Lima',
  'juliana.lima@silvaassociados.com.br',
  '(11) 98765-2222',
  'Analista Financeiro',
  'Financeiro',
  '2023-03-20',
  5500.00,
  true,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

-- Benefícios mockados
INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'health_insurance',
  'Plano de Saúde',
  'Plano de saúde empresarial para todos os colaboradores',
  '{"provider": "Unimed", "coverage": "Nacional"}'::jsonb,
  '{"min_hire_days": 90}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_benefits (company_id, benefit_type, name, description, configuration, eligibility_rules, is_active)
SELECT 
  c.id,
  'meal_voucher',
  'Vale Alimentação',
  'Vale alimentação de R$ 500/mês',
  '{"amount": 500, "currency": "BRL"}'::jsonb,
  '{}'::jsonb,
  true
FROM public.companies c WHERE c.cnpj = '12345678000190'
ON CONFLICT DO NOTHING;

-- ============================================
-- DADOS MOCKADOS DE PRODUTOS
-- ============================================

-- Catálogo de produtos mockado
INSERT INTO public.product_catalog (product_code, name, description, product_type, category, target_audience, features, pricing, is_active)
VALUES
  ('ACC-001', 'Conta Empresarial', 'Conta corrente empresarial com tarifas reduzidas', 'account', 'banking', ARRAY['PME', 'MEI'], 
   '["Sem tarifa de manutenção", "Cartão empresarial", "Extrato online"]'::jsonb,
   '{"monthly_fee": 0, "transaction_fee": 0.5}'::jsonb,
   true),
  
  ('CRD-001', 'Crédito Empresarial', 'Linha de crédito para capital de giro', 'credit', 'lending',
   ARRAY['PME', 'MEI'],
   '["Aprovação rápida", "Taxa competitiva", "Sem garantias para valores menores"]'::jsonb,
   '{"interest_rate": 1.5, "min_amount": 10000, "max_amount": 500000}'::jsonb,
   true),
  
  ('INV-001', 'Investimento Empresarial', 'Aplicações financeiras para empresas', 'investment', 'investments',
   ARRAY['PME'],
   '["Liquidez diária", "Rentabilidade acima da poupança"]'::jsonb,
   '{"min_amount": 5000, "yield": "CDI + 0.5%"}'::jsonb,
   true),
  
  ('BEN-001', 'Vale Alimentação', 'Benefício de vale alimentação para colaboradores', 'benefit', 'benefits',
   ARRAY['PME', 'MEI'],
   '["Cartão recarregável", "Aceito em diversos estabelecimentos"]'::jsonb,
   '{"monthly_cost_per_employee": 50}'::jsonb,
   true),
  
  ('BEN-002', 'Plano de Saúde', 'Plano de saúde empresarial', 'benefit', 'benefits',
   ARRAY['PME'],
   '["Cobertura nacional", "Diversos planos disponíveis"]'::jsonb,
   '{"monthly_cost_per_employee": 300}'::jsonb,
   true)
ON CONFLICT (product_code) DO NOTHING;

-- ============================================
-- DADOS MOCKADOS DE CAMPANHAS
-- ============================================

-- Campanhas mockadas
-- Verificar se as tabelas existem antes de inserir
DO $$
DECLARE
    acc_product_id UUID;
    ben1_product_id UUID;
    ben2_product_id UUID;
    first_user_id UUID;
BEGIN
    -- Verificar se as tabelas existem
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') AND
       EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_catalog') THEN
        
        -- Buscar IDs dos produtos
        SELECT id INTO acc_product_id FROM public.product_catalog WHERE product_code = 'ACC-001' LIMIT 1;
        SELECT id INTO ben1_product_id FROM public.product_catalog WHERE product_code = 'BEN-001' LIMIT 1;
        SELECT id INTO ben2_product_id FROM public.product_catalog WHERE product_code = 'BEN-002' LIMIT 1;
        SELECT id INTO first_user_id FROM auth.users LIMIT 1;
        
        -- Inserir campanhas apenas se os produtos existirem
        IF acc_product_id IS NOT NULL AND first_user_id IS NOT NULL THEN
            INSERT INTO public.campaigns (name, description, campaign_type, target_segment, products_recommended, status, start_date, end_date, created_by)
            VALUES
              ('Campanha PMEs Qualificadas', 'Campanha para prospects qualificados com score alto', 'prospect_conversion',
               '{"min_score": 70, "status": "qualified"}'::jsonb,
               to_jsonb(ARRAY[acc_product_id::text]),
               'active',
               CURRENT_DATE,
               CURRENT_DATE + INTERVAL '30 days',
               first_user_id)
            ON CONFLICT DO NOTHING;
        END IF;
        
        IF ben1_product_id IS NOT NULL AND ben2_product_id IS NOT NULL AND first_user_id IS NOT NULL THEN
            INSERT INTO public.campaigns (name, description, campaign_type, target_segment, products_recommended, status, start_date, end_date, created_by)
            VALUES
              ('Ativação de Benefícios', 'Campanha para empresas ativarem benefícios para colaboradores', 'benefit_activation',
               '{"employee_count": {"min": 10}}'::jsonb,
               to_jsonb(ARRAY[ben1_product_id::text, ben2_product_id::text]),
               'active',
               CURRENT_DATE,
               CURRENT_DATE + INTERVAL '60 days',
               first_user_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- ============================================
-- ATUALIZAR PROSPECTS COM CNPJ
-- ============================================

UPDATE public.prospects p
SET cnpj = m.cnpj
FROM public.cpf_to_cnpj_mapping m
WHERE p.cpf = m.cpf AND m.is_active = true AND p.cnpj IS NULL;

