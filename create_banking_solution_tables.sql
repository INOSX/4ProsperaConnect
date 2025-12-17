-- Script para criar as tabelas da solução bancária PME
-- Execute este script no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)

-- ============================================
-- 1. TABELAS DE PROSPECÇÃO E QUALIFICAÇÃO
-- ============================================

-- Tabela de prospects (potenciais clientes CNPJ)
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cpf TEXT NOT NULL,
    cnpj TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    score DECIMAL(5,2) DEFAULT 0.00,
    qualification_status TEXT NOT NULL DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'rejected', 'converted')),
    market_signals JSONB DEFAULT '{}',
    behavior_data JSONB DEFAULT '{}',
    consumption_profile JSONB DEFAULT '{}',
    conversion_probability DECIMAL(5,2),
    priority INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de mapeamento CPF → CNPJ/MEI
CREATE TABLE IF NOT EXISTS public.cpf_to_cnpj_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cpf TEXT NOT NULL,
    cnpj TEXT,
    company_name TEXT,
    company_type TEXT CHECK (company_type IN ('MEI', 'PME', 'EIRELI', 'LTDA', 'SA')),
    relationship_type TEXT CHECK (relationship_type IN ('owner', 'partner', 'employee', 'consultant')),
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sinais de mercado
CREATE TABLE IF NOT EXISTS public.market_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('transaction', 'consumption', 'behavior', 'market_trend', 'external_data')),
    signal_data JSONB NOT NULL,
    strength DECIMAL(3,2) DEFAULT 0.00 CHECK (strength >= 0 AND strength <= 1),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de critérios de qualificação
CREATE TABLE IF NOT EXISTS public.qualification_criteria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    criteria_rules JSONB NOT NULL,
    weights JSONB DEFAULT '{}',
    thresholds JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 2. TABELAS DE EMPRESAS E COLABORADORES
-- ============================================

-- Tabela de empresas (PMEs/MEIs)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cnpj TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    company_type TEXT CHECK (company_type IN ('MEI', 'PME', 'EIRELI', 'LTDA', 'SA')),
    email TEXT,
    phone TEXT,
    address JSONB,
    banking_status TEXT DEFAULT 'partial' CHECK (banking_status IN ('not_banked', 'partial', 'fully_banked')),
    products_contracted JSONB DEFAULT '[]',
    employee_count INTEGER DEFAULT 0,
    annual_revenue DECIMAL(15,2),
    industry TEXT,
    registration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_user_id UUID REFERENCES auth.users(id)
);

-- Tabela de colaboradores
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    cpf TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    department TEXT,
    hire_date DATE,
    salary DECIMAL(10,2),
    has_platform_access BOOLEAN DEFAULT FALSE,
    platform_user_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, cpf)
);

-- Tabela de benefícios oferecidos pelas empresas
CREATE TABLE IF NOT EXISTS public.company_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    benefit_type TEXT NOT NULL CHECK (benefit_type IN ('health_insurance', 'meal_voucher', 'transportation', 'financial_product', 'education', 'wellness', 'other')),
    name TEXT NOT NULL,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    eligibility_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de benefícios ativos por colaborador
CREATE TABLE IF NOT EXISTS public.employee_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_benefit_id UUID NOT NULL REFERENCES public.company_benefits(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
    activation_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    usage_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, company_benefit_id)
);

-- ============================================
-- 3. TABELAS DE CAMPANHAS E RECOMENDAÇÕES
-- ============================================

-- IMPORTANTE: Criar product_catalog PRIMEIRO porque recommendations referencia ela
-- Tabela de catálogo de produtos
CREATE TABLE IF NOT EXISTS public.product_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('account', 'credit', 'investment', 'insurance', 'benefit', 'service')),
    category TEXT,
    target_audience TEXT[] DEFAULT '{}',
    requirements JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    pricing JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('prospect_conversion', 'product_recommendation', 'benefit_activation', 'retention', 'upsell')),
    target_segment JSONB NOT NULL,
    products_recommended JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de recomendações (criada DEPOIS de product_catalog)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('prospect', 'company', 'employee')),
    target_id UUID NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('product', 'service', 'benefit', 'action')),
    product_id UUID REFERENCES public.product_catalog(id),
    title TEXT NOT NULL,
    description TEXT,
    reasoning TEXT,
    priority INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    acceptance_tracked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABELAS DE INTEGRAÇÃO DE DADOS
-- ============================================

-- Tabela de conexões com bases de dados externas
CREATE TABLE IF NOT EXISTS public.data_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('api', 'csv', 'excel', 'database', 'google_sheets')),
    connection_config JSONB NOT NULL,
    credentials_encrypted TEXT,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de jobs de sincronização
CREATE TABLE IF NOT EXISTS public.data_sync_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES public.data_connections(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fontes de dados externas mapeadas
CREATE TABLE IF NOT EXISTS public.external_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES public.data_connections(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    data_structure JSONB NOT NULL,
    field_mapping JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para prospects
CREATE INDEX IF NOT EXISTS idx_prospects_cpf ON public.prospects(cpf);
CREATE INDEX IF NOT EXISTS idx_prospects_cnpj ON public.prospects(cnpj);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON public.prospects(score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(qualification_status);
CREATE INDEX IF NOT EXISTS idx_prospects_priority ON public.prospects(priority DESC);

-- Índices para mapeamento CPF-CNPJ
CREATE INDEX IF NOT EXISTS idx_cpf_cnpj_mapping_cpf ON public.cpf_to_cnpj_mapping(cpf);
CREATE INDEX IF NOT EXISTS idx_cpf_cnpj_mapping_cnpj ON public.cpf_to_cnpj_mapping(cnpj);

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(banking_status);

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_employees_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON public.employees(cpf);
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(platform_user_id);

-- Índices para benefícios
CREATE INDEX IF NOT EXISTS idx_company_benefits_company ON public.company_benefits(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_employee ON public.employee_benefits(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_status ON public.employee_benefits(status);

-- Índices para product_catalog
CREATE INDEX IF NOT EXISTS idx_product_catalog_code ON public.product_catalog(product_code);
CREATE INDEX IF NOT EXISTS idx_product_catalog_type ON public.product_catalog(product_type);
CREATE INDEX IF NOT EXISTS idx_product_catalog_active ON public.product_catalog(is_active);

-- Índices para campanhas
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- Índices para recomendações
CREATE INDEX IF NOT EXISTS idx_recommendations_target ON public.recommendations(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON public.recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_product ON public.recommendations(product_id);

-- Índices para integrações
CREATE INDEX IF NOT EXISTS idx_data_connections_status ON public.data_connections(status);
CREATE INDEX IF NOT EXISTS idx_data_sync_jobs_connection ON public.data_sync_jobs(connection_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_jobs_status ON public.data_sync_jobs(status);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpf_to_cnpj_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_data_sources ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (serão refinadas conforme roles)
-- Prospects: usuários autenticados podem ver prospects que criaram
CREATE POLICY "Users can view their own prospects" ON public.prospects
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- INSERT: Usuários autenticados podem criar prospects
CREATE POLICY "Users can insert prospects" ON public.prospects
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários podem atualizar prospects que criaram
CREATE POLICY "Users can update their prospects" ON public.prospects
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- DELETE: Usuários podem deletar prospects que criaram
CREATE POLICY "Users can delete their prospects" ON public.prospects
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- Companies: owner e colaboradores da empresa
CREATE POLICY "Users can view their companies" ON public.companies
    FOR SELECT USING (
        owner_user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.employees WHERE company_id = companies.id AND platform_user_id = auth.uid())
    );

-- ============================================
-- POLÍTICAS RLS - EMPLOYEES
-- ============================================

-- SELECT: Próprio colaborador ou owner da empresa
CREATE POLICY "Users can view employees" ON public.employees
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.companies WHERE id = employees.company_id AND owner_user_id = auth.uid())
        )
    );

-- INSERT: Apenas owner da empresa pode adicionar colaboradores
CREATE POLICY "Users can insert employees" ON public.employees
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    );

-- UPDATE: Próprio colaborador ou owner da empresa
CREATE POLICY "Users can update employees" ON public.employees
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            platform_user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.companies 
                WHERE id = employees.company_id 
                AND owner_user_id = auth.uid()
            )
        )
    );

-- DELETE: Apenas owner da empresa (soft delete via is_active)
CREATE POLICY "Users can delete employees" ON public.employees
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = employees.company_id 
            AND owner_user_id = auth.uid()
        )
    );

-- Employee Benefits: próprio colaborador ou empresa
CREATE POLICY "Users can view employee benefits" ON public.employee_benefits
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert employee benefits" ON public.employee_benefits
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.companies c ON e.company_id = c.id
            WHERE e.id = employee_benefits.employee_id
            AND c.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update employee benefits" ON public.employee_benefits
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.employees WHERE id = employee_benefits.employee_id AND platform_user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.employees e 
                    JOIN public.companies c ON e.company_id = c.id 
                    WHERE e.id = employee_benefits.employee_id AND c.owner_user_id = auth.uid())
        )
    );

-- ============================================
-- POLÍTICAS RLS - DATA_CONNECTIONS
-- ============================================

-- SELECT: Criador pode ver suas conexões
CREATE POLICY "Users can view their data connections" ON public.data_connections
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert data connections" ON public.data_connections
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their data connections" ON public.data_connections
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their data connections" ON public.data_connections
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- POLÍTICAS RLS - RECOMMENDATIONS
-- ============================================

-- SELECT: Usuários autenticados podem ver recomendações
CREATE POLICY "Users can view recommendations" ON public.recommendations
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- INSERT: Usuários autenticados podem criar recomendações
CREATE POLICY "Users can insert recommendations" ON public.recommendations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários autenticados podem atualizar recomendações
CREATE POLICY "Users can update recommendations" ON public.recommendations
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- POLÍTICAS RLS - CAMPAIGNS
-- ============================================

-- SELECT: Usuários podem ver campanhas que criaram
CREATE POLICY "Users can view campaigns" ON public.campaigns
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- INSERT: Usuários autenticados podem criar campanhas
CREATE POLICY "Users can insert campaigns" ON public.campaigns
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários podem atualizar campanhas que criaram
CREATE POLICY "Users can update their campaigns" ON public.campaigns
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- DELETE: Usuários podem deletar campanhas que criaram
CREATE POLICY "Users can delete their campaigns" ON public.campaigns
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- POLÍTICAS RLS - COMPANY_BENEFITS
-- ============================================

-- SELECT: Owner da empresa pode ver benefícios
CREATE POLICY "Users can view company benefits" ON public.company_benefits
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

-- INSERT: Owner da empresa pode criar benefícios
CREATE POLICY "Users can insert company benefits" ON public.company_benefits
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

-- UPDATE: Owner da empresa pode atualizar benefícios
CREATE POLICY "Users can update company benefits" ON public.company_benefits
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

-- DELETE: Owner da empresa pode deletar benefícios
CREATE POLICY "Users can delete company benefits" ON public.company_benefits
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_benefits.company_id
            AND owner_user_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS RLS - PRODUCT_CATALOG
-- ============================================

-- SELECT: Todos podem ver produtos ativos
CREATE POLICY "Anyone can view active products" ON public.product_catalog
    FOR SELECT
    USING (is_active = true);

-- INSERT/UPDATE/DELETE: Apenas via service role (não exposto via RLS)
-- Em produção, você pode criar políticas específicas para admins

-- ============================================
-- POLÍTICAS RLS - MARKET_SIGNALS
-- ============================================

-- SELECT: Usuários podem ver sinais de mercado dos seus prospects
CREATE POLICY "Users can view market signals" ON public.market_signals
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = market_signals.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- INSERT: Via API ou sistema (não diretamente pelo usuário)
CREATE POLICY "Users can insert market signals" ON public.market_signals
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = market_signals.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- ============================================
-- POLÍTICAS RLS - QUALIFICATION_CRITERIA
-- ============================================

-- SELECT: Usuários podem ver critérios que criaram
CREATE POLICY "Users can view qualification criteria" ON public.qualification_criteria
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- INSERT: Usuários autenticados podem criar critérios
CREATE POLICY "Users can insert qualification criteria" ON public.qualification_criteria
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuários podem atualizar critérios que criaram
CREATE POLICY "Users can update qualification criteria" ON public.qualification_criteria
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- POLÍTICAS RLS - CPF_TO_CNPJ_MAPPING
-- ============================================

-- SELECT: Todos os usuários autenticados podem ver (dados públicos de mapeamento)
CREATE POLICY "Users can view cpf to cnpj mapping" ON public.cpf_to_cnpj_mapping
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE: Apenas via sistema/API (não diretamente pelo usuário)

-- ============================================
-- POLÍTICAS RLS - DATA_SYNC_JOBS
-- ============================================

-- SELECT: Usuários podem ver jobs de suas conexões
CREATE POLICY "Users can view data sync jobs" ON public.data_sync_jobs
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.data_connections
            WHERE id = data_sync_jobs.connection_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- INSERT: Via sistema/API
CREATE POLICY "System can insert data sync jobs" ON public.data_sync_jobs
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS - EXTERNAL_DATA_SOURCES
-- ============================================

-- SELECT: Usuários podem ver fontes de suas conexões
CREATE POLICY "Users can view external data sources" ON public.external_data_sources
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.data_connections
            WHERE id = external_data_sources.connection_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- INSERT/UPDATE: Via sistema/API
CREATE POLICY "Users can manage external data sources" ON public.external_data_sources
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.data_connections
            WHERE id = external_data_sources.connection_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.data_connections
            WHERE id = external_data_sources.connection_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- ============================================
-- 7. EXTENSÕES DAS TABELAS EXISTENTES
-- ============================================

-- Adicionar campos à tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS prospect_id UUID REFERENCES public.prospects(id),
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('individual', 'company', 'employee'));

-- Adicionar campo à tabela data_sources_new
ALTER TABLE public.data_sources_new
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('upload', 'external_api', 'integration')) DEFAULT 'upload';

-- Índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_prospect ON public.clients(prospect_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_type ON public.clients(user_type);
CREATE INDEX IF NOT EXISTS idx_data_sources_source_type ON public.data_sources_new(source_type);

-- ============================================
-- 8. FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

