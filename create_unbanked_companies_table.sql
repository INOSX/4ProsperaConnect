-- Script para criar a tabela unbanked_companies no Supabase
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: UNBANKED_COMPANIES
-- ============================================
-- Armazena empresas CNPJ identificadas que não são clientes do banco
-- ou que são subexploradas (baixo uso de serviços bancários)

CREATE TABLE IF NOT EXISTS public.unbanked_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cnpj TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    company_type TEXT CHECK (company_type IN ('MEI', 'PME', 'EIRELI', 'LTDA', 'SA')),
    
    -- Status bancário
    banking_status TEXT NOT NULL DEFAULT 'not_banked' CHECK (banking_status IN ('not_banked', 'partial', 'fully_banked')),
    
    -- Produtos bancários
    products_contracted JSONB DEFAULT '[]',
    potential_products JSONB DEFAULT '[]',
    
    -- Scoring e potencial
    identification_score DECIMAL(5,2) DEFAULT 0,
    revenue_estimate DECIMAL(15,2),
    employee_count INTEGER DEFAULT 0,
    industry TEXT,
    
    -- Informações de contato
    contact_info JSONB DEFAULT '{}',
    
    -- Fontes de dados
    data_sources JSONB DEFAULT '[]',
    
    -- Status e tracking
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'contacted', 'converted', 'rejected')),
    priority INTEGER DEFAULT 0,
    notes TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_unbanked_companies_cnpj ON public.unbanked_companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_banking_status ON public.unbanked_companies(banking_status);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_identification_score ON public.unbanked_companies(identification_score DESC);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_status ON public.unbanked_companies(status);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_priority ON public.unbanked_companies(priority DESC);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_industry ON public.unbanked_companies(industry);
CREATE INDEX IF NOT EXISTS idx_unbanked_companies_created_by ON public.unbanked_companies(created_by);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.unbanked_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unbanked companies" ON public.unbanked_companies
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert their own unbanked companies" ON public.unbanked_companies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own unbanked companies" ON public.unbanked_companies
    FOR UPDATE USING (
        created_by = auth.uid() OR
        created_by IS NULL
    ) WITH CHECK (
        created_by = auth.uid() OR
        created_by IS NULL
    );

CREATE POLICY "Users can delete their own unbanked companies" ON public.unbanked_companies
    FOR DELETE USING (
        created_by = auth.uid() OR
        created_by IS NULL
    );

-- ============================================
-- TRIGGER PARA updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_unbanked_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unbanked_companies_updated_at
    BEFORE UPDATE ON public.unbanked_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_unbanked_companies_updated_at();

