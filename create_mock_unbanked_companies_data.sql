-- Script para inserir dados mockados de empresas não bancarizadas
-- Execute este script no SQL Editor do Supabase após create_unbanked_companies_table.sql

DO $$
DECLARE
    user_id UUID;
    i INTEGER;
    cnpj_val TEXT;
    company_name_val TEXT;
    trade_name_val TEXT;
    company_type_val TEXT;
    banking_status_val TEXT;
    products_contracted_val JSONB;
    potential_products_val JSONB;
    identification_score_val DECIMAL(5,2);
    revenue_estimate_val DECIMAL(15,2);
    employee_count_val INTEGER;
    industry_val TEXT;
    contact_info_val JSONB;
    status_val TEXT;
    priority_val INTEGER;
BEGIN
    -- Obter um user_id existente
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user found in auth.users. Please create a user first.';
    END IF;

    -- Empresas Não Bancarizadas (banking_status = 'not_banked')
    FOR i IN 1..20 LOOP
        cnpj_val := LPAD((10000000000000 + i)::TEXT, 14, '0');
        company_name_val := 'Empresa ' || i || ' LTDA';
        trade_name_val := 'Empresa ' || i;
        company_type_val := CASE (i % 4) 
            WHEN 0 THEN 'MEI' 
            WHEN 1 THEN 'PME' 
            WHEN 2 THEN 'LTDA' 
            ELSE 'EIRELI' 
        END;
        banking_status_val := 'not_banked';
        products_contracted_val := '[]'::jsonb;
        potential_products_val := jsonb_build_array('conta_corrente', 'cartao_credito', 'emprestimo', 'investimentos');
        identification_score_val := (RANDOM() * 40 + 60)::DECIMAL(5,2); -- 60-100
        revenue_estimate_val := (RANDOM() * 500000 + 50000)::DECIMAL(15,2);
        employee_count_val := (RANDOM() * 20 + 1)::INTEGER;
        industry_val := CASE (i % 5)
            WHEN 0 THEN 'Comércio'
            WHEN 1 THEN 'Serviços'
            WHEN 2 THEN 'Tecnologia'
            WHEN 3 THEN 'Saúde'
            ELSE 'Alimentação'
        END;
        contact_info_val := jsonb_build_object(
            'email', 'empresa' || i || '@example.com',
            'phone', '(11) 9' || LPAD((80000000 + i)::TEXT, 8, '0'),
            'address', jsonb_build_object(
                'street', 'Rua Exemplo ' || i,
                'city', 'São Paulo',
                'state', 'SP',
                'zip', LPAD((1000000 + i)::TEXT, 8, '0')
            )
        );
        status_val := CASE 
            WHEN i % 7 = 0 THEN 'contacted'
            WHEN i % 10 = 0 THEN 'converted'
            ELSE 'identified'
        END;
        priority_val := CASE 
            WHEN identification_score_val >= 85 THEN (RANDOM() * 2 + 8)::INTEGER
            WHEN identification_score_val >= 70 THEN (RANDOM() * 2 + 6)::INTEGER
            ELSE (RANDOM() * 3 + 3)::INTEGER
        END;

        INSERT INTO public.unbanked_companies (
            cnpj, company_name, trade_name, company_type, banking_status,
            products_contracted, potential_products, identification_score,
            revenue_estimate, employee_count, industry, contact_info,
            status, priority, created_by
        ) VALUES (
            cnpj_val, company_name_val, trade_name_val, company_type_val, banking_status_val,
            products_contracted_val, potential_products_val, identification_score_val,
            revenue_estimate_val, employee_count_val, industry_val, contact_info_val,
            status_val, priority_val, user_id
        ) ON CONFLICT (cnpj) DO NOTHING;
    END LOOP;

    -- Empresas Subexploradas (banking_status = 'partial')
    FOR i IN 21..40 LOOP
        cnpj_val := LPAD((20000000000000 + i)::TEXT, 14, '0');
        company_name_val := 'Empresa ' || i || ' LTDA';
        trade_name_val := 'Empresa ' || i;
        company_type_val := CASE (i % 4) 
            WHEN 0 THEN 'MEI' 
            WHEN 1 THEN 'PME' 
            WHEN 2 THEN 'LTDA' 
            ELSE 'EIRELI' 
        END;
        banking_status_val := 'partial';
        products_contracted_val := jsonb_build_array('conta_corrente'); -- Apenas conta corrente
        potential_products_val := jsonb_build_array('cartao_credito', 'emprestimo', 'investimentos', 'seguro');
        identification_score_val := (RANDOM() * 35 + 50)::DECIMAL(5,2); -- 50-85
        revenue_estimate_val := (RANDOM() * 800000 + 100000)::DECIMAL(15,2);
        employee_count_val := (RANDOM() * 15 + 2)::INTEGER;
        industry_val := CASE (i % 5)
            WHEN 0 THEN 'Comércio'
            WHEN 1 THEN 'Serviços'
            WHEN 2 THEN 'Tecnologia'
            WHEN 3 THEN 'Saúde'
            ELSE 'Alimentação'
        END;
        contact_info_val := jsonb_build_object(
            'email', 'empresa' || i || '@example.com',
            'phone', '(11) 9' || LPAD((80000000 + i)::TEXT, 8, '0'),
            'address', jsonb_build_object(
                'street', 'Rua Exemplo ' || i,
                'city', 'São Paulo',
                'state', 'SP',
                'zip', LPAD((1000000 + i)::TEXT, 8, '0')
            )
        );
        status_val := CASE 
            WHEN i % 6 = 0 THEN 'contacted'
            WHEN i % 9 = 0 THEN 'converted'
            ELSE 'identified'
        END;
        priority_val := CASE 
            WHEN identification_score_val >= 75 THEN (RANDOM() * 2 + 7)::INTEGER
            WHEN identification_score_val >= 60 THEN (RANDOM() * 2 + 5)::INTEGER
            ELSE (RANDOM() * 3 + 2)::INTEGER
        END;

        INSERT INTO public.unbanked_companies (
            cnpj, company_name, trade_name, company_type, banking_status,
            products_contracted, potential_products, identification_score,
            revenue_estimate, employee_count, industry, contact_info,
            status, priority, created_by
        ) VALUES (
            cnpj_val, company_name_val, trade_name_val, company_type_val, banking_status_val,
            products_contracted_val, potential_products_val, identification_score_val,
            revenue_estimate_val, employee_count_val, industry_val, contact_info_val,
            status_val, priority_val, user_id
        ) ON CONFLICT (cnpj) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Inserted 40 mock unbanked companies';
END;
$$;

