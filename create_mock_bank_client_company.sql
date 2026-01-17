-- ============================================
-- SCRIPT PARA CRIAR CLIENTE EMPRESA FICTÍCIO
-- ============================================
-- Este script cria um cliente do banco (gestor) e sua empresa
-- Dados fictícios para testes - não usar emails reais

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Você precisará substituir o UUID do user_id por um usuário real do auth.users

-- ============================================
-- PASSO 1: CRIAR EMPRESA FICTÍCIA
-- ============================================

-- Inserir empresa fictícia (PME de tecnologia)
INSERT INTO public.companies (
    cnpj,
    company_name,
    trade_name,
    company_type,
    email,
    phone,
    address,
    banking_status,
    products_contracted,
    employee_count,
    annual_revenue,
    industry,
    registration_date,
    is_active,
    owner_user_id
) VALUES (
    '12.345.678/0001-99',  -- CNPJ fictício
    'TechSolutions Desenvolvimento de Software LTDA',  -- Razão social
    'TechSolutions',  -- Nome fantasia
    'LTDA',  -- Tipo de empresa
    'contato@techsolutions-ficticio.com.br',  -- Email fictício
    '(11) 98765-4321',  -- Telefone fictício
    '{"street": "Rua das Inovações", "number": "123", "complement": "Sala 45", "neighborhood": "Centro Empresarial", "city": "São Paulo", "state": "SP", "zip_code": "01234-567"}'::jsonb,  -- Endereço
    'partial',  -- Status bancário: parcialmente bancarizado
    '["conta_corrente_pj", "cartao_corporativo"]'::jsonb,  -- Produtos contratados
    15,  -- Número de colaboradores
    1200000.00,  -- Faturamento anual: R$ 1,2 milhões
    'Tecnologia da Informação',  -- Setor
    '2020-03-15',  -- Data de registro
    true,  -- Empresa ativa
    NULL  -- owner_user_id será preenchido depois de criar o cliente
) RETURNING id;

-- Guardar o ID da empresa (copiar da saída acima para usar abaixo)
-- Substitua 'COMPANY_ID_AQUI' pelo UUID retornado acima

-- ============================================
-- PASSO 2: CRIAR CLIENTE DO BANCO (GESTOR)
-- ============================================

-- IMPORTANTE: Substitua 'USER_ID_AQUI' por um UUID de um usuário real do auth.users
-- Você pode buscar um usuário com: SELECT id, email FROM auth.users LIMIT 5;

INSERT INTO public.clients (
    user_id,
    client_code,
    name,
    email,
    openai_assistant_id,
    vectorstore_id,
    company_id,
    user_type
) VALUES (
    'USER_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo UUID de um usuário real do auth.users
    'CLI-TECH-001',  -- Código do cliente
    'João Silva Santos',  -- Nome do gestor
    'joao.silva@techsolutions-ficticio.com.br',  -- Email fictício do gestor
    NULL,  -- Assistant ID (será criado quando usar IA)
    NULL,  -- Vectorstore ID (será criado quando usar IA)
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa criada acima
    'company'  -- Tipo de usuário: empresa
) RETURNING id, client_code, name;

-- ============================================
-- PASSO 3: ATUALIZAR OWNER DA EMPRESA
-- ============================================

-- Atualizar o owner_user_id da empresa com o user_id do cliente
UPDATE public.companies
SET owner_user_id = 'USER_ID_AQUI'  -- ⚠️ SUBSTITUIR pelo mesmo USER_ID usado acima
WHERE cnpj = '12.345.678/0001-99';

-- ============================================
-- PASSO 4: ADICIONAR ALGUNS COLABORADORES FICTÍCIOS
-- ============================================

-- Colaborador 1: Gerente de TI
INSERT INTO public.employees (
    company_id,
    cpf,
    name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    has_platform_access,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    '123.456.789-01',  -- CPF fictício
    'Maria Oliveira Costa',
    'maria.oliveira@techsolutions-ficticio.com.br',
    '(11) 98765-1111',
    'Gerente de TI',
    'Tecnologia',
    '2020-06-01',
    8500.00,
    false,
    true
);

-- Colaborador 2: Desenvolvedor Sênior
INSERT INTO public.employees (
    company_id,
    cpf,
    name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    has_platform_access,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    '234.567.890-12',  -- CPF fictício
    'Pedro Henrique Almeida',
    'pedro.almeida@techsolutions-ficticio.com.br',
    '(11) 98765-2222',
    'Desenvolvedor Sênior',
    'Tecnologia',
    '2021-01-15',
    7000.00,
    false,
    true
);

-- Colaborador 3: Analista Financeiro
INSERT INTO public.employees (
    company_id,
    cpf,
    name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    has_platform_access,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    '345.678.901-23',  -- CPF fictício
    'Ana Paula Rodrigues',
    'ana.rodrigues@techsolutions-ficticio.com.br',
    '(11) 98765-3333',
    'Analista Financeiro',
    'Financeiro',
    '2021-08-20',
    5500.00,
    false,
    true
);

-- ============================================
-- PASSO 5: ADICIONAR BENEFÍCIOS DA EMPRESA
-- ============================================

-- Benefício 1: Vale Refeição
INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    'meal_voucher',
    'Vale Refeição',
    'Cartão de benefício alimentação com R$ 30,00 por dia útil',
    '{"daily_value": 30.00, "provider": "Alelo", "card_type": "refeicao"}'::jsonb,
    '{"minimum_hours_per_day": 6, "probation_period_days": 90}'::jsonb,
    true
);

-- Benefício 2: Vale Transporte
INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    'transportation',
    'Vale Transporte',
    'Vale transporte para deslocamento casa-trabalho',
    '{"provider": "ValeTransporte SP", "calculation": "automatic"}'::jsonb,
    '{"exclude_from_salary": true}'::jsonb,
    true
);

-- Benefício 3: Plano de Saúde
INSERT INTO public.company_benefits (
    company_id,
    benefit_type,
    name,
    description,
    configuration,
    eligibility_rules,
    is_active
) VALUES (
    'COMPANY_ID_AQUI',  -- ⚠️ SUBSTITUIR pelo ID da empresa
    'health_insurance',
    'Plano de Saúde',
    'Plano de saúde empresarial com cobertura nacional',
    '{"provider": "Unimed", "plan_type": "enfermaria", "coparticipation": false}'::jsonb,
    '{"probation_period_days": 180, "dependent_coverage": true}'::jsonb,
    true
);

-- ============================================
-- PASSO 6: VERIFICAR DADOS CRIADOS
-- ============================================

-- Verificar empresa criada
SELECT 
    id,
    cnpj,
    company_name,
    trade_name,
    employee_count,
    annual_revenue,
    banking_status,
    is_active
FROM public.companies 
WHERE cnpj = '12.345.678/0001-99';

-- Verificar cliente criado
SELECT 
    id,
    client_code,
    name,
    email,
    user_type,
    company_id
FROM public.clients 
WHERE client_code = 'CLI-TECH-001';

-- Verificar colaboradores criados
SELECT 
    id,
    name,
    position,
    department,
    salary,
    is_active
FROM public.employees 
WHERE company_id = 'COMPANY_ID_AQUI';  -- ⚠️ SUBSTITUIR pelo ID da empresa

-- Verificar benefícios criados
SELECT 
    id,
    benefit_type,
    name,
    description,
    is_active
FROM public.company_benefits 
WHERE company_id = 'COMPANY_ID_AQUI';  -- ⚠️ SUBSTITUIR pelo ID da empresa

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================

/*
PASSOS PARA EXECUTAR:

1. Buscar um user_id válido:
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

2. Executar o PASSO 1 (criar empresa) e copiar o ID retornado

3. Substituir todos os 'COMPANY_ID_AQUI' pelo ID da empresa

4. Substituir todos os 'USER_ID_AQUI' pelo ID do usuário escolhido

5. Executar os demais passos em sequência

6. Verificar os dados criados com as queries do PASSO 6

OBSERVAÇÕES:
- Todos os dados são fictícios (CNPJs, CPFs, emails)
- Os emails não são reais para evitar envio de mensagens
- A empresa está com status 'partial' (parcialmente bancarizada)
- Já possui 3 colaboradores e 3 benefícios configurados
- Faturamento anual de R$ 1,2 milhões
- Setor de Tecnologia da Informação
*/
