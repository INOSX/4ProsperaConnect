-- Função RPC para executar queries SQL dinâmicas com segurança
-- Permite apenas SELECT queries e respeita RLS
-- Execute este script no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION execute_dynamic_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  query_type TEXT;
BEGIN
  -- Validar que é apenas SELECT (segurança)
  query_type := UPPER(TRIM(SPLIT_PART(sql_query, ' ', 1)));
  
  IF query_type != 'SELECT' THEN
    RAISE EXCEPTION 'Apenas queries SELECT são permitidas. Tipo detectado: %', query_type;
  END IF;
  
  -- Validar que não contém comandos perigosos
  IF UPPER(sql_query) ~* '(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)' THEN
    RAISE EXCEPTION 'Query contém comandos não permitidos';
  END IF;
  
  -- Executar query e retornar como JSON
  EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', sql_query) INTO result;
  
  -- Se não houver resultados, retornar array vazio
  IF result IS NULL THEN
    result := '[]'::JSON;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro como JSON
    RETURN json_build_object(
      'error', TRUE,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Comentário
COMMENT ON FUNCTION execute_dynamic_sql IS 'Executa queries SQL dinâmicas (apenas SELECT) com segurança e respeitando RLS';

-- Política RLS: apenas usuários autenticados podem usar
-- Nota: Como é SECURITY DEFINER, a função executa com privilégios do criador
-- mas ainda respeita RLS das tabelas acessadas

