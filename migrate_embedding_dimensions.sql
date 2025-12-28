-- Script de migração para corrigir a dimensão dos embeddings
-- Execute este script no SQL Editor do Supabase APÓS executar create_vectorization_system.sql
-- Este script altera a coluna embedding de vector(1536) para vector(3072)

-- ============================================
-- 1. VERIFICAR DIMENSÃO ATUAL (opcional, apenas para diagnóstico)
-- ============================================
-- Execute esta query para verificar a dimensão atual:
-- SELECT 
--     column_name, 
--     data_type,
--     udt_name
-- FROM information_schema.columns 
-- WHERE table_name = 'data_embeddings' 
-- AND column_name = 'embedding';

-- ============================================
-- 2. BACKUP DOS DADOS EXISTENTES (opcional)
-- ============================================
-- Se você já tem embeddings na tabela, faça backup antes:
-- CREATE TABLE IF NOT EXISTS data_embeddings_backup AS 
-- SELECT * FROM public.data_embeddings;

-- ============================================
-- 3. REMOVER ÍNDICE HNSW ANTIGO (se existir)
-- ============================================
DROP INDEX IF EXISTS idx_data_embeddings_embedding;

-- ============================================
-- 4. ALTERAR COLUNA EMBEDDING PARA 3072 DIMENSÕES
-- ============================================
-- Nota: Esta operação pode falhar se houver dados existentes com dimensão diferente
-- Se isso acontecer, você precisará limpar os dados primeiro ou migrar manualmente

-- Primeiro, vamos tentar alterar diretamente
DO $$
BEGIN
    -- Verificar se a coluna existe e qual é sua dimensão atual
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'data_embeddings' 
        AND column_name = 'embedding'
    ) THEN
        -- Tentar alterar a coluna
        -- Se a tabela estiver vazia ou tiver apenas NULLs, isso funcionará
        ALTER TABLE public.data_embeddings 
        ALTER COLUMN embedding TYPE vector(3072);
        
        RAISE NOTICE 'Coluna embedding alterada para vector(3072) com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna embedding não encontrada. Execute create_vectorization_system.sql primeiro.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Se falhar, provavelmente há dados com dimensão diferente
        RAISE NOTICE 'Erro ao alterar coluna: %. Limpando embeddings antigos e tentando novamente...', SQLERRM;
        
        -- Limpar embeddings antigos (eles serão regenerados)
        UPDATE public.data_embeddings 
        SET embedding = NULL 
        WHERE embedding IS NOT NULL;
        
        -- Tentar novamente
        ALTER TABLE public.data_embeddings 
        ALTER COLUMN embedding TYPE vector(3072);
        
        RAISE NOTICE 'Coluna embedding alterada para vector(3072) após limpar dados antigos.';
END $$;

-- ============================================
-- 5. RECRIAR ÍNDICE HNSW COM DIMENSÃO CORRETA
-- ============================================
CREATE INDEX IF NOT EXISTS idx_data_embeddings_embedding 
    ON public.data_embeddings 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================
-- 6. VERIFICAR SE A ALTERAÇÃO FOI BEM-SUCEDIDA
-- ============================================
-- Execute esta query para confirmar:
-- SELECT 
--     column_name, 
--     data_type,
--     udt_name,
--     (SELECT COUNT(*) FROM public.data_embeddings WHERE embedding IS NOT NULL) as embeddings_count
-- FROM information_schema.columns 
-- WHERE table_name = 'data_embeddings' 
-- AND column_name = 'embedding';

-- ============================================
-- 7. ATUALIZAR FUNÇÃO SEMANTIC_SEARCH (se necessário)
-- ============================================
-- A função já deve estar atualizada no create_vectorization_system.sql,
-- mas vamos garantir que está correta:
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
-- CONCLUSÃO
-- ============================================
-- Após executar este script:
-- 1. A coluna embedding estará configurada para 3072 dimensões
-- 2. Os embeddings antigos (se houver) terão sido limpos (serão NULL)
-- 3. Execute "Vetorizar Todos os Dados" na página de vetorização para regenerar os embeddings

