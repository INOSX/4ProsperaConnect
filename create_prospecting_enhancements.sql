-- Script para criar melhorias na prospecção de CNPJs
-- Execute este script no SQL Editor do Supabase após create_banking_solution_tables.sql

-- ============================================
-- 1. NOVAS TABELAS DE PROSPECÇÃO
-- ============================================

-- Tabela de vínculo entre prospects e fontes de dados
CREATE TABLE IF NOT EXISTS public.prospect_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'database', 'external_api')),
    source_id UUID NOT NULL,
    enrichment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'processing', 'completed', 'failed')),
    last_enriched_at TIMESTAMP WITH TIME ZONE,
    data_mapping JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de configurações de APIs externas
CREATE TABLE IF NOT EXISTS public.external_api_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_provider TEXT NOT NULL CHECK (api_provider IN ('receita_federal', 'serasa', 'credit_bureau', 'social_media')),
    api_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INTEGER DEFAULT 100,
    last_call_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de histórico de enriquecimento
CREATE TABLE IF NOT EXISTS public.prospect_enrichment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    source_id UUID NOT NULL,
    enrichment_type TEXT NOT NULL CHECK (enrichment_type IN ('upload', 'database', 'external_api')),
    data_before JSONB DEFAULT '{}',
    data_after JSONB DEFAULT '{}',
    enriched_fields TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de métricas detalhadas de scoring
CREATE TABLE IF NOT EXISTS public.prospect_scoring_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    conversion_probability DECIMAL(5,2),
    ltv_estimate DECIMAL(15,2),
    churn_risk DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    financial_health_score DECIMAL(5,2),
    combined_score DECIMAL(5,2),
    scoring_version TEXT DEFAULT '1.0',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prospect_id)
);

-- Tabela de jobs assíncronos de enriquecimento
CREATE TABLE IF NOT EXISTS public.prospect_enrichment_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_ids UUID[] NOT NULL,
    source_ids UUID[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    results JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 2. CAMPOS ADICIONAIS EM TABELAS EXISTENTES
-- ============================================

-- Adicionar campos novos na tabela prospects
ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS ltv_estimate DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS churn_risk DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS enrichment_status TEXT CHECK (enrichment_status IN ('not_enriched', 'enriching', 'enriched', 'failed')),
ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_sources_count INTEGER DEFAULT 0;

-- Adicionar campos novos na tabela data_sources_new
ALTER TABLE public.data_sources_new
ADD COLUMN IF NOT EXISTS is_available_for_prospecting BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS prospecting_field_mapping JSONB DEFAULT '{}';

-- Adicionar campos novos na tabela data_connections
ALTER TABLE public.data_connections
ADD COLUMN IF NOT EXISTS is_available_for_prospecting BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS prospecting_table_mapping JSONB DEFAULT '{}';

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para prospect_data_sources
CREATE INDEX IF NOT EXISTS idx_prospect_data_sources_prospect ON public.prospect_data_sources(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_data_sources_source ON public.prospect_data_sources(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_prospect_data_sources_status ON public.prospect_data_sources(enrichment_status);

-- Índices para external_api_integrations
CREATE INDEX IF NOT EXISTS idx_external_api_provider ON public.external_api_integrations(api_provider);
CREATE INDEX IF NOT EXISTS idx_external_api_active ON public.external_api_integrations(is_active);

-- Índices para prospect_enrichment_history
CREATE INDEX IF NOT EXISTS idx_enrichment_history_prospect ON public.prospect_enrichment_history(prospect_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_history_created ON public.prospect_enrichment_history(created_at DESC);

-- Índices para prospect_scoring_metrics
CREATE INDEX IF NOT EXISTS idx_scoring_metrics_prospect ON public.prospect_scoring_metrics(prospect_id);
CREATE INDEX IF NOT EXISTS idx_scoring_metrics_combined ON public.prospect_scoring_metrics(combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_metrics_ltv ON public.prospect_scoring_metrics(ltv_estimate DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_metrics_churn ON public.prospect_scoring_metrics(churn_risk);

-- Índices para prospect_enrichment_jobs
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON public.prospect_enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_created ON public.prospect_enrichment_jobs(created_at DESC);

-- Índices adicionais para prospects
CREATE INDEX IF NOT EXISTS idx_prospects_ltv ON public.prospects(ltv_estimate DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_churn ON public.prospects(churn_risk);
CREATE INDEX IF NOT EXISTS idx_prospects_enrichment_status ON public.prospects(enrichment_status);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.prospect_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_enrichment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_scoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_enrichment_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prospect_data_sources
CREATE POLICY "Users can view their prospect data sources" ON public.prospect_data_sources
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.prospects
                WHERE id = prospect_data_sources.prospect_id
                AND (created_by = auth.uid() OR created_by IS NULL)
            )
        )
    );

CREATE POLICY "Users can insert prospect data sources" ON public.prospect_data_sources
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_data_sources.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

CREATE POLICY "Users can update their prospect data sources" ON public.prospect_data_sources
    FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_data_sources.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    )
    WITH CHECK (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_data_sources.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

CREATE POLICY "Users can delete their prospect data sources" ON public.prospect_data_sources
    FOR DELETE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_data_sources.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- Políticas RLS para external_api_integrations
CREATE POLICY "Users can view their API integrations" ON public.external_api_integrations
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert API integrations" ON public.external_api_integrations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their API integrations" ON public.external_api_integrations
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their API integrations" ON public.external_api_integrations
    FOR DELETE
    USING (created_by = auth.uid() OR created_by IS NULL);

-- Políticas RLS para prospect_enrichment_history
CREATE POLICY "Users can view enrichment history" ON public.prospect_enrichment_history
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_enrichment_history.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

CREATE POLICY "Users can insert enrichment history" ON public.prospect_enrichment_history
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_enrichment_history.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- Políticas RLS para prospect_scoring_metrics
CREATE POLICY "Users can view scoring metrics" ON public.prospect_scoring_metrics
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_scoring_metrics.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

CREATE POLICY "Users can insert scoring metrics" ON public.prospect_scoring_metrics
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_scoring_metrics.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

CREATE POLICY "Users can update scoring metrics" ON public.prospect_scoring_metrics
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_scoring_metrics.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prospects
            WHERE id = prospect_scoring_metrics.prospect_id
            AND (created_by = auth.uid() OR created_by IS NULL)
        )
    );

-- Políticas RLS para prospect_enrichment_jobs
CREATE POLICY "Users can view their enrichment jobs" ON public.prospect_enrichment_jobs
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            created_by IS NULL
        )
    );

CREATE POLICY "Users can insert enrichment jobs" ON public.prospect_enrichment_jobs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their enrichment jobs" ON public.prospect_enrichment_jobs
    FOR UPDATE
    USING (created_by = auth.uid() OR created_by IS NULL)
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- ============================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Trigger para prospect_data_sources
CREATE TRIGGER update_prospect_data_sources_updated_at
    BEFORE UPDATE ON public.prospect_data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para external_api_integrations
CREATE TRIGGER update_external_api_integrations_updated_at
    BEFORE UPDATE ON public.external_api_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para prospect_scoring_metrics
CREATE TRIGGER update_prospect_scoring_metrics_updated_at
    BEFORE UPDATE ON public.prospect_scoring_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar data_sources_count em prospects
CREATE OR REPLACE FUNCTION update_prospect_data_sources_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.prospects
        SET data_sources_count = (
            SELECT COUNT(*) FROM public.prospect_data_sources
            WHERE prospect_id = NEW.prospect_id
        )
        WHERE id = NEW.prospect_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.prospects
        SET data_sources_count = (
            SELECT COUNT(*) FROM public.prospect_data_sources
            WHERE prospect_id = OLD.prospect_id
        )
        WHERE id = OLD.prospect_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de fontes de dados
CREATE TRIGGER update_prospect_data_sources_count_trigger
    AFTER INSERT OR DELETE ON public.prospect_data_sources
    FOR EACH ROW EXECUTE FUNCTION update_prospect_data_sources_count();

