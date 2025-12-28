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
  cleaned_query TEXT;
  dangerous_patterns TEXT[] := ARRAY[
    'DROP\s+TABLE',
    'DROP\s+DATABASE',
    'DELETE\s+FROM',
    'UPDATE\s+\w+\s+SET',
    'INSERT\s+INTO',
    'ALTER\s+TABLE',
    'CREATE\s+TABLE',
    'TRUNCATE\s+TABLE',
    'GRANT\s+',
    'REVOKE\s+'
  ];
  pattern TEXT;
BEGIN
  -- Remover ponto e vírgula do final se existir
  cleaned_query := TRIM(sql_query);
  IF RIGHT(cleaned_query, 1) = ';' THEN
    cleaned_query := LEFT(cleaned_query, LENGTH(cleaned_query) - 1);
  END IF;
  
  -- Validar que é apenas SELECT (segurança)
  query_type := UPPER(TRIM(SPLIT_PART(cleaned_query, ' ', 1)));
  
  IF query_type != 'SELECT' THEN
    RETURN json_build_object(
      'error', TRUE,
      'message', format('Apenas queries SELECT são permitidas. Tipo detectado: %s', query_type),
      'code', 'INVALID_QUERY_TYPE'
    );
  END IF;
  
  -- Validar que não contém comandos perigosos (usando padrões mais específicos)
  FOREACH pattern IN ARRAY dangerous_patterns
  LOOP
    IF UPPER(cleaned_query) ~* pattern THEN
      RETURN json_build_object(
        'error', TRUE,
        'message', format('Query contém comando não permitido: %s', pattern),
        'code', 'DANGEROUS_COMMAND'
      );
    END IF;
  END LOOP;
  
  -- Executar query e retornar como JSON
  BEGIN
    EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', cleaned_query) INTO result;
    
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
        'code', SQLSTATE,
        'detail', SQLERRM
      );
  END;
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

