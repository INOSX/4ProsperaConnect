-- Script para criar sistema de vetorização do banco de dados
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. HABILITAR EXTENSÃO PGVECTOR
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. CRIAR TABELA DE EMBEDDINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.data_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(3072), -- text-embedding-3-large usa 3072 dimensões
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_name, record_id)
);

-- ============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_data_embeddings_table_record 
    ON public.data_embeddings(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_data_embeddings_embedding 
    ON public.data_embeddings 
    USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- 4. FUNÇÃO PARA VETORIZAR REGISTRO
-- ============================================
CREATE OR REPLACE FUNCTION vectorize_record()
RETURNS TRIGGER AS $$
DECLARE
    chunk_text_value TEXT;
BEGIN
    -- Criar texto semântico baseado na tabela
    IF TG_TABLE_NAME = 'companies' THEN
        chunk_text_value := COALESCE(NEW.company_name::text, '') || ' ' || 
                           COALESCE(NEW.cnpj::text, '') || ' ' || 
                           COALESCE(NEW.trade_name::text, '') || ' ' || 
                           COALESCE(NEW.industry::text, '');
    ELSIF TG_TABLE_NAME = 'employees' THEN
        chunk_text_value := COALESCE(NEW.name::text, '') || ' ' || 
                           COALESCE(NEW.email::text, '') || ' ' || 
                           COALESCE(NEW.department::text, '') || ' ' || 
                           COALESCE(NEW.position::text, '');
    ELSIF TG_TABLE_NAME = 'prospects' THEN
        chunk_text_value := COALESCE(NEW.name::text, '') || ' ' || 
                           COALESCE(NEW.cpf::text, '') || ' ' || 
                           COALESCE(NEW.cnpj::text, '') || ' ' || 
                           COALESCE(NEW.email::text, '') || ' ' || 
                           COALESCE(NEW.market_signals::text, '');
    ELSIF TG_TABLE_NAME = 'cpf_clients' THEN
        chunk_text_value := COALESCE(NEW.name::text, '') || ' ' || 
                           COALESCE(NEW.cpf::text, '') || ' ' || 
                           COALESCE(NEW.email::text, '') || ' ' || 
                           COALESCE(NEW.business_category::text, '') || ' ' || 
                           COALESCE(NEW.notes::text, '');
    ELSIF TG_TABLE_NAME = 'unbanked_companies' THEN
        chunk_text_value := COALESCE(NEW.company_name::text, '') || ' ' || 
                           COALESCE(NEW.cnpj::text, '') || ' ' || 
                           COALESCE(NEW.industry::text, '') || ' ' || 
                           COALESCE(NEW.notes::text, '');
    ELSE
        chunk_text_value := COALESCE(NEW.name::text, NEW.company_name::text, '');
    END IF;

    -- Criar registro com embedding NULL (será preenchido pelo backend)
    INSERT INTO public.data_embeddings (table_name, record_id, chunk_text, embedding, metadata)
    VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TRIM(chunk_text_value),
        NULL, -- Embedding será gerado pelo backend
        jsonb_build_object(
            'id', NEW.id,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        ) || to_jsonb(NEW) -- Incluir todos os campos do registro
    )
    ON CONFLICT (table_name, record_id) 
    DO UPDATE SET
        chunk_text = EXCLUDED.chunk_text,
        metadata = EXCLUDED.metadata,
        embedding = NULL, -- Resetar embedding para ser regenerado
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CRIAR TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ============================================

-- Trigger para companies
DROP TRIGGER IF EXISTS vectorize_company_on_insert ON public.companies;
CREATE TRIGGER vectorize_company_on_insert
    AFTER INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

DROP TRIGGER IF EXISTS vectorize_company_on_update ON public.companies;
CREATE TRIGGER vectorize_company_on_update
    AFTER UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

-- Trigger para employees
DROP TRIGGER IF EXISTS vectorize_employee_on_insert ON public.employees;
CREATE TRIGGER vectorize_employee_on_insert
    AFTER INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

DROP TRIGGER IF EXISTS vectorize_employee_on_update ON public.employees;
CREATE TRIGGER vectorize_employee_on_update
    AFTER UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

-- Trigger para prospects
DROP TRIGGER IF EXISTS vectorize_prospect_on_insert ON public.prospects;
CREATE TRIGGER vectorize_prospect_on_insert
    AFTER INSERT ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

DROP TRIGGER IF EXISTS vectorize_prospect_on_update ON public.prospects;
CREATE TRIGGER vectorize_prospect_on_update
    AFTER UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION vectorize_record();

-- ============================================
-- 6. FUNÇÃO HELPER PARA BUSCA VETORIAL
-- ============================================
CREATE OR REPLACE FUNCTION semantic_search(
    query_embedding vector(3072),
    table_filter TEXT DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7,
    result_limit INT DEFAULT 10
)
RETURNS TABLE (
    record_id UUID,
    table_name TEXT,
    chunk_text TEXT,
    similarity FLOAT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.record_id,
        de.table_name,
        de.chunk_text,
        1 - (de.embedding <=> query_embedding) as similarity,
        de.metadata
    FROM public.data_embeddings de
    WHERE 
        (table_filter IS NULL OR de.table_name = table_filter)
        AND de.embedding IS NOT NULL
        AND (1 - (de.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. POLÍTICAS RLS (se necessário)
-- ============================================
-- As políticas RLS devem respeitar as mesmas regras das tabelas originais
-- Por enquanto, permitir acesso autenticado
ALTER TABLE public.data_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view embeddings"
    ON public.data_embeddings
    FOR SELECT
    USING (auth.role() = 'authenticated');

