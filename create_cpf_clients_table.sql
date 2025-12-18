-- Script para criar a tabela cpf_clients no Supabase
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: CPF_CLIENTS
-- ============================================
-- Armazena clientes CPF com potencial de se tornarem CNPJ/MEI

CREATE TABLE IF NOT EXISTS public.cpf_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cpf TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address JSONB,
    
    -- Dados transacionais e comportamentais
    transaction_volume DECIMAL(15,2) DEFAULT 0,
    transaction_frequency INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2),
    monthly_revenue_estimate DECIMAL(15,2),
    
    -- Indicadores de potencial empresarial
    business_activity_score DECIMAL(5,2) DEFAULT 0,
    has_business_indicators BOOLEAN DEFAULT FALSE,
    business_category TEXT,
    estimated_employees INTEGER DEFAULT 0,
    
    -- Dados de consumo e perfil
    consumption_profile JSONB DEFAULT '{}',
    credit_score INTEGER,
    payment_history TEXT CHECK (payment_history IN ('excellent', 'good', 'fair', 'poor')),
    banking_products JSONB DEFAULT '[]',
    
    -- Sinais de mercado
    market_signals JSONB DEFAULT '{}',
    digital_presence_score DECIMAL(5,2),
    social_media_activity INTEGER DEFAULT 0,
    
    -- Scoring de conversão
    conversion_potential_score DECIMAL(5,2) DEFAULT 0,
    conversion_probability DECIMAL(5,2),
    recommended_action TEXT,
    priority INTEGER DEFAULT 0,
    
    -- Status e tracking
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'contacted', 'converted', 'rejected')),
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cpf_clients_cpf ON public.cpf_clients(cpf);
CREATE INDEX IF NOT EXISTS idx_cpf_clients_score ON public.cpf_clients(conversion_potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_cpf_clients_status ON public.cpf_clients(status);
CREATE INDEX IF NOT EXISTS idx_cpf_clients_priority ON public.cpf_clients(priority DESC);
CREATE INDEX IF NOT EXISTS idx_cpf_clients_created_by ON public.cpf_clients(created_by);

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.cpf_clients ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios clientes CPF
CREATE POLICY "Users can view their own cpf clients" ON public.cpf_clients
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

-- Política: Usuários podem inserir clientes CPF
CREATE POLICY "Users can insert cpf clients" ON public.cpf_clients
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuários podem atualizar seus próprios clientes CPF
CREATE POLICY "Users can update their own cpf clients" ON public.cpf_clients
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Política: Usuários podem deletar seus próprios clientes CPF
CREATE POLICY "Users can delete their own cpf clients" ON public.cpf_clients
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_cpf_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cpf_clients_updated_at
    BEFORE UPDATE ON public.cpf_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_cpf_clients_updated_at();

-- Verificar se a tabela foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'cpf_clients';

