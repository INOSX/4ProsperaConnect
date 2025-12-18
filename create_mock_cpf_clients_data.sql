-- Script para inserir dados mockados na tabela cpf_clients
-- Execute este script no SQL Editor do Supabase após create_cpf_clients_table.sql

-- ============================================
-- DADOS MOCKADOS: CPF_CLIENTS
-- ============================================

-- Obter o primeiro usuário para created_by
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado. Crie um usuário primeiro.';
    END IF;

    -- Inserir 25 clientes CPF mockados com diferentes perfis
    INSERT INTO public.cpf_clients (
        cpf, name, email, phone, birth_date, address,
        transaction_volume, transaction_frequency, average_transaction_value, monthly_revenue_estimate,
        business_activity_score, has_business_indicators, business_category, estimated_employees,
        consumption_profile, credit_score, payment_history, banking_products,
        market_signals, digital_presence_score, social_media_activity,
        conversion_potential_score, conversion_probability, recommended_action, priority,
        status, last_analyzed_at, notes, created_by
    ) VALUES
    -- Alto Potencial (Score 80-95)
    (
        '12345678901', 'João Silva', 'joao.silva@email.com', '(11) 98765-4321', '1985-05-15',
        '{"street": "Rua das Flores, 123", "city": "São Paulo", "state": "SP", "zip": "01234-567"}'::jsonb,
        45000.00, 28, 1607.14, 45000.00,
        85.00, TRUE, 'Comércio Eletrônico', 3,
        '{"category": "high_value", "preferences": ["technology", "business"]}'::jsonb, 750, 'excellent',
        '["conta_corrente", "cartao_credito", "investimentos"]'::jsonb,
        '{"high_transaction_volume": true, "business_patterns": true, "growth_trend": true}'::jsonb,
        75.00, 45, 88.50, 92.00, 'contact_immediately', 9,
        'identified', NOW() - INTERVAL '2 days', 'Cliente com alto volume transacional e indicadores empresariais claros', first_user_id
    ),
    (
        '23456789012', 'Maria Santos', 'maria.santos@email.com', '(21) 97654-3210', '1990-08-22',
        '{"street": "Av. Atlântica, 456", "city": "Rio de Janeiro", "state": "RJ", "zip": "22021-000"}'::jsonb,
        38000.00, 25, 1520.00, 38000.00,
        82.00, TRUE, 'Consultoria', 2,
        '{"category": "professional", "preferences": ["services", "consulting"]}'::jsonb, 720, 'excellent',
        '["conta_corrente", "cartao_credito", "poupanca"]'::jsonb,
        '{"professional_activity": true, "consistent_revenue": true}'::jsonb,
        70.00, 35, 85.00, 88.00, 'contact_this_week', 8,
        'identified', NOW() - INTERVAL '1 day', 'Perfil profissional com receita consistente', first_user_id
    ),
    (
        '34567890123', 'Carlos Oliveira', 'carlos.oliveira@email.com', '(11) 96543-2109', '1988-03-10',
        '{"street": "Rua Augusta, 789", "city": "São Paulo", "state": "SP", "zip": "01305-100"}'::jsonb,
        52000.00, 32, 1625.00, 52000.00,
        90.00, TRUE, 'Tecnologia', 5,
        '{"category": "tech_entrepreneur", "preferences": ["technology", "innovation"]}'::jsonb, 780, 'excellent',
        '["conta_corrente", "cartao_credito", "investimentos", "emprestimo"]'::jsonb,
        '{"tech_startup": true, "high_growth": true, "digital_native": true}'::jsonb,
        95.00, 80, 92.00, 95.00, 'contact_immediately', 10,
        'contacted', NOW() - INTERVAL '5 hours', 'Startup em crescimento, alto potencial', first_user_id
    ),
    (
        '45678901234', 'Ana Costa', 'ana.costa@email.com', '(48) 95432-1098', '1992-11-30',
        '{"street": "Av. Beira Mar, 321", "city": "Florianópolis", "state": "SC", "zip": "88015-700"}'::jsonb,
        35000.00, 22, 1590.91, 35000.00,
        78.00, TRUE, 'Serviços', 2,
        '{"category": "service_provider", "preferences": ["services", "local_business"]}'::jsonb, 680, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"local_business": true, "seasonal_patterns": true}'::jsonb,
        65.00, 30, 80.00, 82.00, 'contact_this_month', 7,
        'identified', NOW() - INTERVAL '3 days', 'Negócio local com bom volume', first_user_id
    ),
    (
        '56789012345', 'Pedro Ferreira', 'pedro.ferreira@email.com', '(31) 94321-0987', '1987-07-18',
        '{"street": "Rua da Bahia, 654", "city": "Belo Horizonte", "state": "MG", "zip": "30160-012"}'::jsonb,
        48000.00, 30, 1600.00, 48000.00,
        86.00, TRUE, 'Varejo', 4,
        '{"category": "retail", "preferences": ["retail", "commerce"]}'::jsonb, 740, 'excellent',
        '["conta_corrente", "cartao_credito", "poupanca", "investimentos"]'::jsonb,
        '{"retail_activity": true, "high_frequency": true, "customer_base": true}'::jsonb,
        72.00, 50, 87.00, 90.00, 'contact_immediately', 9,
        'contacted', NOW() - INTERVAL '1 day', 'Varejista com alto volume e frequência', first_user_id
    ),
    
    -- Médio-Alto Potencial (Score 65-79)
    (
        '67890123456', 'Fernanda Lima', 'fernanda.lima@email.com', '(11) 93210-9876', '1991-04-25',
        '{"street": "Rua Oscar Freire, 987", "city": "São Paulo", "state": "SP", "zip": "01426-001"}'::jsonb,
        25000.00, 18, 1388.89, 25000.00,
        70.00, TRUE, 'Moda', 1,
        '{"category": "fashion", "preferences": ["fashion", "retail"]}'::jsonb, 650, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"fashion_business": true, "social_media_active": true}'::jsonb,
        80.00, 60, 72.00, 75.00, 'contact_this_month', 6,
        'identified', NOW() - INTERVAL '4 days', 'Negócio de moda com presença digital', first_user_id
    ),
    (
        '78901234567', 'Roberto Alves', 'roberto.alves@email.com', '(21) 92109-8765', '1986-09-12',
        '{"street": "Av. Copacabana, 147", "city": "Rio de Janeiro", "state": "RJ", "zip": "22020-001"}'::jsonb,
        22000.00, 16, 1375.00, 22000.00,
        68.00, TRUE, 'Alimentação', 2,
        '{"category": "food_service", "preferences": ["food", "restaurant"]}'::jsonb, 620, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"food_service": true, "delivery_active": true}'::jsonb,
        55.00, 40, 69.00, 72.00, 'contact_this_month', 5,
        'identified', NOW() - INTERVAL '5 days', 'Restaurante com delivery ativo', first_user_id
    ),
    (
        '89012345678', 'Juliana Rocha', 'juliana.rocha@email.com', '(85) 91098-7654', '1993-12-05',
        '{"street": "Av. Beira Mar, 258", "city": "Fortaleza", "state": "CE", "zip": "60165-121"}'::jsonb,
        28000.00, 20, 1400.00, 28000.00,
        73.00, TRUE, 'Turismo', 2,
        '{"category": "tourism", "preferences": ["tourism", "services"]}'::jsonb, 660, 'good',
        '["conta_corrente", "cartao_credito", "poupanca"]'::jsonb,
        '{"tourism_business": true, "seasonal": true}'::jsonb,
        60.00, 35, 74.00, 77.00, 'contact_this_month', 6,
        'identified', NOW() - INTERVAL '6 days', 'Agência de turismo com sazonalidade', first_user_id
    ),
    (
        '90123456789', 'Lucas Martins', 'lucas.martins@email.com', '(41) 90987-6543', '1989-06-20',
        '{"street": "Rua XV de Novembro, 369", "city": "Curitiba", "state": "PR", "zip": "80020-310"}'::jsonb,
        30000.00, 21, 1428.57, 30000.00,
        75.00, TRUE, 'Educação', 3,
        '{"category": "education", "preferences": ["education", "services"]}'::jsonb, 670, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"education_business": true, "recurring_revenue": true}'::jsonb,
        65.00, 25, 76.00, 79.00, 'contact_this_month', 7,
        'identified', NOW() - INTERVAL '2 days', 'Escola/cursos com receita recorrente', first_user_id
    ),
    (
        '01234567890', 'Patricia Souza', 'patricia.souza@email.com', '(51) 89876-5432', '1990-02-14',
        '{"street": "Av. Borges de Medeiros, 741", "city": "Porto Alegre", "state": "RS", "zip": "90020-020"}'::jsonb,
        26000.00, 19, 1368.42, 26000.00,
        71.00, TRUE, 'Saúde', 2,
        '{"category": "health", "preferences": ["health", "services"]}'::jsonb, 640, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"health_business": true, "professional": true}'::jsonb,
        50.00, 20, 72.00, 75.00, 'contact_this_month', 6,
        'identified', NOW() - INTERVAL '7 days', 'Clínica ou consultório', first_user_id
    ),
    
    -- Médio Potencial (Score 50-64)
    (
        '11122233344', 'Ricardo Gomes', 'ricardo.gomes@email.com', '(11) 88765-4321', '1984-01-08',
        '{"street": "Rua Consolação, 852", "city": "São Paulo", "state": "SP", "zip": "01302-000"}'::jsonb,
        15000.00, 12, 1250.00, 15000.00,
        58.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 580, 'fair',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"moderate_activity": true}'::jsonb,
        40.00, 15, 60.00, 63.00, 'monitor', 4,
        'identified', NOW() - INTERVAL '10 days', 'Atividade moderada, monitorar', first_user_id
    ),
    (
        '22233344455', 'Camila Dias', 'camila.dias@email.com', '(21) 87654-3210', '1992-05-19',
        '{"street": "Rua do Ouvidor, 963", "city": "Rio de Janeiro", "state": "RJ", "zip": "20040-030"}'::jsonb,
        18000.00, 14, 1285.71, 18000.00,
        62.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 600, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"moderate_activity": true, "growing": true}'::jsonb,
        45.00, 20, 63.00, 66.00, 'monitor', 5,
        'identified', NOW() - INTERVAL '8 days', 'Crescimento moderado', first_user_id
    ),
    (
        '33344455566', 'Marcos Ribeiro', 'marcos.ribeiro@email.com', '(31) 86543-2109', '1985-10-03',
        '{"street": "Av. Afonso Pena, 159", "city": "Belo Horizonte", "state": "MG", "zip": "30130-009"}'::jsonb,
        12000.00, 10, 1200.00, 12000.00,
        55.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 560, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        35.00, 10, 57.00, 60.00, 'monitor', 3,
        'identified', NOW() - INTERVAL '12 days', 'Baixa atividade, monitorar', first_user_id
    ),
    (
        '44455566677', 'Beatriz Araújo', 'beatriz.araujo@email.com', '(48) 85432-1098', '1991-08-27',
        '{"street": "Rua Felipe Schmidt, 741", "city": "Florianópolis", "state": "SC", "zip": "88010-001"}'::jsonb,
        20000.00, 15, 1333.33, 20000.00,
        65.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 610, 'good',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"moderate_activity": true}'::jsonb,
        48.00, 18, 66.00, 69.00, 'monitor', 5,
        'identified', NOW() - INTERVAL '9 days', 'Atividade moderada', first_user_id
    ),
    (
        '55566677788', 'Felipe Cardoso', 'felipe.cardoso@email.com', '(11) 84321-0987', '1988-12-15',
        '{"street": "Rua Augusta, 258", "city": "São Paulo", "state": "SP", "zip": "01305-100"}'::jsonb,
        16000.00, 13, 1230.77, 16000.00,
        59.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 590, 'fair',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"moderate_activity": true}'::jsonb,
        42.00, 15, 61.00, 64.00, 'monitor', 4,
        'identified', NOW() - INTERVAL '11 days', 'Atividade moderada', first_user_id
    ),
    
    -- Baixo-Médio Potencial (Score 35-49)
    (
        '66677788899', 'Gabriela Nunes', 'gabriela.nunes@email.com', '(21) 83210-9876', '1994-03-22',
        '{"street": "Rua do Catete, 369", "city": "Rio de Janeiro", "state": "RJ", "zip": "22220-000"}'::jsonb,
        8000.00, 8, 1000.00, 8000.00,
        42.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 520, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        30.00, 8, 45.00, 48.00, 'low_priority', 2,
        'identified', NOW() - INTERVAL '15 days', 'Baixa atividade', first_user_id
    ),
    (
        '77788899900', 'Thiago Lopes', 'thiago.lopes@email.com', '(31) 82109-8765', '1987-11-07',
        '{"street": "Rua da Bahia, 147", "city": "Belo Horizonte", "state": "MG", "zip": "30160-012"}'::jsonb,
        10000.00, 9, 1111.11, 10000.00,
        48.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 540, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        32.00, 10, 49.00, 52.00, 'low_priority', 3,
        'identified', NOW() - INTERVAL '14 days', 'Baixa atividade', first_user_id
    ),
    (
        '88899900011', 'Isabela Castro', 'isabela.castro@email.com', '(48) 81098-7654', '1993-07-29',
        '{"street": "Av. Beira Mar Norte, 258", "city": "Florianópolis", "state": "SC", "zip": "88015-700"}'::jsonb,
        9000.00, 8, 1125.00, 9000.00,
        44.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 530, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        28.00, 7, 46.00, 49.00, 'low_priority', 2,
        'identified', NOW() - INTERVAL '16 days', 'Baixa atividade', first_user_id
    ),
    (
        '99900011122', 'Rafael Mendes', 'rafael.mendes@email.com', '(85) 80987-6543', '1989-04-11',
        '{"street": "Av. Beira Mar, 147", "city": "Fortaleza", "state": "CE", "zip": "60165-121"}'::jsonb,
        11000.00, 10, 1100.00, 11000.00,
        50.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 550, 'fair',
        '["conta_corrente", "cartao_credito"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        38.00, 12, 51.00, 54.00, 'low_priority', 3,
        'identified', NOW() - INTERVAL '13 days', 'Baixa atividade', first_user_id
    ),
    (
        '00011122233', 'Larissa Freitas', 'larissa.freitas@email.com', '(41) 79876-5432', '1992-09-16',
        '{"street": "Rua XV de Novembro, 852", "city": "Curitiba", "state": "PR", "zip": "80020-310"}'::jsonb,
        13000.00, 11, 1181.82, 13000.00,
        53.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 570, 'fair',
        '["conta_corrente"]'::jsonb,
        '{"low_activity": true}'::jsonb,
        40.00, 12, 54.00, 57.00, 'low_priority', 4,
        'identified', NOW() - INTERVAL '17 days', 'Baixa atividade', first_user_id
    ),
    
    -- Convertidos (para demonstrar histórico)
    (
        '98765432100', 'Bruno Carvalho', 'bruno.carvalho@email.com', '(11) 78765-4321', '1986-06-24',
        '{"street": "Rua Haddock Lobo, 741", "city": "São Paulo", "state": "SP", "zip": "01414-000"}'::jsonb,
        60000.00, 35, 1714.29, 60000.00,
        95.00, TRUE, 'Tecnologia', 8,
        '{"category": "tech_company", "preferences": ["technology", "innovation"]}'::jsonb, 800, 'excellent',
        '["conta_corrente", "cartao_credito", "investimentos", "emprestimo", "conta_empresa"]'::jsonb,
        '{"tech_company": true, "high_growth": true, "converted": true}'::jsonb,
        98.00, 90, 98.00, 100.00, 'converted', 10,
        'converted', NOW() - INTERVAL '30 days', 'Convertido para CNPJ - Empresa de tecnologia', first_user_id
    ),
    (
        '87654321099', 'Mariana Torres', 'mariana.torres@email.com', '(21) 77654-3210', '1990-01-31',
        '{"street": "Av. Atlântica, 963", "city": "Rio de Janeiro", "state": "RJ", "zip": "22021-000"}'::jsonb,
        42000.00, 28, 1500.00, 42000.00,
        88.00, TRUE, 'Consultoria', 4,
        '{"category": "consulting", "preferences": ["services", "consulting"]}'::jsonb, 760, 'excellent',
        '["conta_corrente", "cartao_credito", "investimentos", "conta_empresa"]'::jsonb,
        '{"consulting_firm": true, "converted": true}'::jsonb,
        85.00, 50, 90.00, 95.00, 'converted', 9,
        'converted', NOW() - INTERVAL '25 days', 'Convertido para CNPJ - Consultoria', first_user_id
    ),
    (
        '76543210988', 'Gustavo Rocha', 'gustavo.rocha@email.com', '(31) 76543-2109', '1988-08-13',
        '{"street": "Rua da Bahia, 258", "city": "Belo Horizonte", "state": "MG", "zip": "30160-012"}'::jsonb,
        55000.00, 32, 1718.75, 55000.00,
        92.00, TRUE, 'Varejo', 6,
        '{"category": "retail", "preferences": ["retail", "commerce"]}'::jsonb, 780, 'excellent',
        '["conta_corrente", "cartao_credito", "investimentos", "conta_empresa"]'::jsonb,
        '{"retail_company": true, "converted": true}'::jsonb,
        88.00, 70, 94.00, 97.00, 'converted', 10,
        'converted', NOW() - INTERVAL '20 days', 'Convertido para CNPJ - Varejo', first_user_id
    ),
    
    -- Rejeitados (baixo potencial)
    (
        '65432109877', 'Vanessa Almeida', 'vanessa.almeida@email.com', '(48) 75432-1098', '1995-02-18',
        '{"street": "Rua Felipe Schmidt, 369", "city": "Florianópolis", "state": "SC", "zip": "88010-001"}'::jsonb,
        5000.00, 5, 1000.00, 5000.00,
        30.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 480, 'poor',
        '["conta_corrente"]'::jsonb,
        '{"very_low_activity": true}'::jsonb,
        20.00, 5, 32.00, 35.00, 'reject', 1,
        'rejected', NOW() - INTERVAL '20 days', 'Baixo potencial - rejeitado', first_user_id
    ),
    (
        '54321098766', 'Daniel Pereira', 'daniel.pereira@email.com', '(85) 74321-0987', '1991-10-26',
        '{"street": "Av. Beira Mar, 741", "city": "Fortaleza", "state": "CE", "zip": "60165-121"}'::jsonb,
        6000.00, 6, 1000.00, 6000.00,
        35.00, FALSE, NULL, 0,
        '{"category": "individual", "preferences": ["general"]}'::jsonb, 500, 'poor',
        '["conta_corrente"]'::jsonb,
        '{"very_low_activity": true}'::jsonb,
        22.00, 6, 37.00, 40.00, 'reject', 1,
        'rejected', NOW() - INTERVAL '18 days', 'Baixo potencial - rejeitado', first_user_id
    )
    ON CONFLICT (cpf) DO NOTHING;

    RAISE NOTICE 'Dados mockados inseridos com sucesso!';
END $$;

