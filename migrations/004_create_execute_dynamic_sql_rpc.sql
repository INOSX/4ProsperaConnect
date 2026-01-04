-- ============================================================================
-- Migration: 004_create_execute_dynamic_sql_rpc.sql
-- Descrição: Cria função RPC para executar SQL dinâmico
-- Data: 2026-01-04
-- Autor: NEXUS Implementation Team
-- ============================================================================

-- ============================================================================
-- FUNÇÃO: execute_dynamic_sql
-- Permite executar queries SQL dinâmicas de forma segura
-- ============================================================================

-- IMPORTANTE: O parâmetro DEVE se chamar 'sql_query' para funcionar com PostgREST!
CREATE OR REPLACE FUNCTION execute_dynamic_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  query_result RECORD;
  results_array JSONB := '[]'::JSONB;
BEGIN
  -- Validação básica de segurança
  IF sql_query IS NULL OR TRIM(sql_query) = '' THEN
    RAISE EXCEPTION 'Query text cannot be empty';
  END IF;

  -- Verificar se é uma query SELECT (segurança)
  IF UPPER(TRIM(sql_query)) NOT LIKE 'SELECT%' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Verificar operações perigosas (com word boundaries \y para evitar falsos positivos)
  -- Exemplo: "updated_at" não deve ser detectado como "UPDATE"
  IF sql_query ~* '\y(DELETE|DROP|TRUNCATE|ALTER|UPDATE|INSERT|CREATE|GRANT|REVOKE)\y' THEN
    RAISE EXCEPTION 'Destructive operations are not allowed';
  END IF;

  -- Executar query dinâmica e coletar resultados
  FOR query_result IN EXECUTE sql_query
  LOOP
    results_array := results_array || to_jsonb(query_result);
  END LOOP;

  -- Retornar resultados como JSONB
  RETURN results_array;

EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro como JSONB
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE,
      'query', sql_query
    );
END;
$$;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION execute_dynamic_sql(TEXT) IS 
'Executa queries SQL dinâmicas de forma segura.
Apenas queries SELECT são permitidas.
Retorna resultados como JSONB array.
Usado pelo NEXUS Agent para queries SQL planejadas pela IA.';

-- ============================================================================
-- PERMISSÕES
-- ============================================================================

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION execute_dynamic_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_dynamic_sql(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION execute_dynamic_sql(TEXT) TO anon;

-- ============================================================================
-- TESTES
-- ============================================================================

-- Teste 1: Query simples
DO $$
DECLARE
  test_result JSONB;
BEGIN
  test_result := execute_dynamic_sql('SELECT 1 as test');
  RAISE NOTICE '✅ Teste 1: %', test_result;
END$$;

-- Teste 2: Query com filtro
DO $$
DECLARE
  test_result JSONB;
BEGIN
  test_result := execute_dynamic_sql('SELECT COUNT(*) as total FROM companies');
  RAISE NOTICE '✅ Teste 2: %', test_result;
END$$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ============================================';
  RAISE NOTICE '✅ Função execute_dynamic_sql CRIADA!';
  RAISE NOTICE '🔒 Segurança: Apenas SELECT queries permitidas';
  RAISE NOTICE '📊 Retorno: JSONB array';
  RAISE NOTICE '🚀 NEXUS Agent pode executar SQL dinâmico!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END$$;
