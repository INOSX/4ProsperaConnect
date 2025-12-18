-- Script para criar dados mockados de APIs externas
-- Execute este script no SQL Editor do Supabase após create_prospecting_enhancements.sql

-- ============================================
-- 1. DADOS MOCKADOS DE EXTERNAL_API_INTEGRATIONS
-- ============================================

-- Inserir configurações de APIs externas (mockadas)
INSERT INTO public.external_api_integrations (api_provider, api_config, is_active, rate_limit, created_by)
VALUES
  (
    'receita_federal',
    '{"api_key": "mock_key_rf_123", "base_url": "https://api.receitafederal.gov.br", "timeout": 30}'::jsonb,
    true,
    100,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'serasa',
    '{"api_key": "mock_key_serasa_456", "base_url": "https://api.serasa.com.br", "timeout": 30}'::jsonb,
    true,
    200,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'credit_bureau',
    '{"api_key": "mock_key_bureau_789", "base_url": "https://api.creditbureau.com.br", "timeout": 30}'::jsonb,
    true,
    150,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'social_media',
    '{"api_key": "mock_key_social_012", "base_url": "https://api.socialmedia.com.br", "timeout": 60}'::jsonb,
    true,
    50,
    (SELECT id FROM auth.users LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. DADOS MOCKADOS DE PROSPECT_SCORING_METRICS
-- ============================================

-- Atualizar prospects existentes com métricas mockadas
DO $$
DECLARE
  prospect_record RECORD;
  conversion_prob DECIMAL;
  ltv_est DECIMAL;
  churn_risk_val DECIMAL;
  engagement_score DECIMAL;
  financial_health DECIMAL;
  combined_score DECIMAL;
BEGIN
  FOR prospect_record IN SELECT id, score FROM public.prospects LIMIT 10
  LOOP
    -- Calcular métricas baseadas no score existente
    conversion_prob := LEAST(prospect_record.score + (RANDOM() * 20 - 10), 100);
    ltv_est := 10000 + (prospect_record.score * 1000) + (RANDOM() * 50000);
    churn_risk_val := GREATEST(100 - prospect_record.score + (RANDOM() * 20 - 10), 0);
    engagement_score := prospect_record.score * 0.8 + (RANDOM() * 20);
    financial_health := prospect_record.score * 0.9 + (RANDOM() * 10);
    combined_score := (
      conversion_prob * 0.35 +
      (ltv_est / 10000) * 0.30 +
      (100 - churn_risk_val) * 0.20 +
      engagement_score * 0.15
    );

    -- Inserir ou atualizar métricas
    INSERT INTO public.prospect_scoring_metrics (
      prospect_id,
      conversion_probability,
      ltv_estimate,
      churn_risk,
      engagement_score,
      financial_health_score,
      combined_score,
      scoring_version
    )
    VALUES (
      prospect_record.id,
      conversion_prob,
      ltv_est,
      churn_risk_val,
      engagement_score,
      financial_health,
      combined_score,
      '1.0'
    )
    ON CONFLICT (prospect_id) DO UPDATE SET
      conversion_probability = EXCLUDED.conversion_probability,
      ltv_estimate = EXCLUDED.ltv_estimate,
      churn_risk = EXCLUDED.churn_risk,
      engagement_score = EXCLUDED.engagement_score,
      financial_health_score = EXCLUDED.financial_health_score,
      combined_score = EXCLUDED.combined_score,
      calculated_at = NOW(),
      updated_at = NOW();

    -- Atualizar tabela prospects
    UPDATE public.prospects
    SET
      ltv_estimate = ltv_est,
      churn_risk = churn_risk_val,
      enrichment_status = 'enriched',
      last_enriched_at = NOW(),
      data_sources_count = 1 + (RANDOM() * 3)::INTEGER
    WHERE id = prospect_record.id;
  END LOOP;
END $$;

-- ============================================
-- 3. DADOS MOCKADOS DE PROSPECT_DATA_SOURCES
-- ============================================

-- Vincular fontes de dados aos prospects
DO $$
DECLARE
  prospect_record RECORD;
  source_id_val UUID;
  source_types TEXT[] := ARRAY['upload', 'database', 'external_api'];
  source_type_val TEXT;
BEGIN
  FOR prospect_record IN SELECT id, created_by FROM public.prospects LIMIT 10
  LOOP
    -- Criar vínculo com fonte de upload (se existir)
    SELECT id INTO source_id_val
    FROM public.data_sources_new
    WHERE is_available_for_prospecting = true
    LIMIT 1;

    IF source_id_val IS NOT NULL THEN
      INSERT INTO public.prospect_data_sources (
        prospect_id,
        source_type,
        source_id,
        enrichment_status,
        last_enriched_at,
        created_by
      )
      VALUES (
        prospect_record.id,
        'upload',
        source_id_val,
        'completed',
        NOW(),
        prospect_record.created_by
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Criar vínculo com API externa
    SELECT id INTO source_id_val
    FROM public.external_api_integrations
    WHERE is_active = true
    ORDER BY RANDOM()
    LIMIT 1;

    IF source_id_val IS NOT NULL THEN
      INSERT INTO public.prospect_data_sources (
        prospect_id,
        source_type,
        source_id,
        enrichment_status,
        last_enriched_at,
        created_by
      )
      VALUES (
        prospect_record.id,
        'external_api',
        source_id_val,
        'completed',
        NOW(),
        prospect_record.created_by
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 4. DADOS MOCKADOS DE PROSPECT_ENRICHMENT_HISTORY
-- ============================================

-- Criar histórico de enriquecimento para alguns prospects
DO $$
DECLARE
  prospect_record RECORD;
  source_id_val UUID;
  data_before JSONB;
  data_after JSONB;
  enriched_fields TEXT[];
BEGIN
  FOR prospect_record IN 
    SELECT 
      p.id,
      p.name,
      p.email,
      p.phone,
      p.score,
      p.market_signals,
      p.behavior_data,
      p.consumption_profile,
      p.created_by
    FROM public.prospects p
    INNER JOIN public.prospect_data_sources pds ON p.id = pds.prospect_id
    LIMIT 5
  LOOP
    -- Buscar uma fonte vinculada
    SELECT source_id INTO source_id_val
    FROM public.prospect_data_sources
    WHERE prospect_id = prospect_record.id
    LIMIT 1;

    IF source_id_val IS NOT NULL THEN
      -- Dados antes
      data_before := jsonb_build_object(
        'name', prospect_record.name,
        'email', prospect_record.email,
        'phone', prospect_record.phone,
        'score', prospect_record.score
      );

      -- Dados depois (simulando enriquecimento)
      data_after := jsonb_build_object(
        'name', prospect_record.name,
        'email', COALESCE(prospect_record.email, 'enriched_' || prospect_record.name || '@example.com'),
        'phone', COALESCE(prospect_record.phone, '(11) 99999-9999'),
        'score', prospect_record.score + 5,
        'market_signals', jsonb_build_object(
          'enriched', true,
          'source', 'external_api'
        )
      );

      -- Campos enriquecidos
      enriched_fields := ARRAY['email', 'phone', 'score', 'market_signals'];

      INSERT INTO public.prospect_enrichment_history (
        prospect_id,
        source_id,
        enrichment_type,
        data_before,
        data_after,
        enriched_fields,
        created_by
      )
      VALUES (
        prospect_record.id,
        source_id_val,
        'external_api',
        data_before,
        data_after,
        enriched_fields,
        prospect_record.created_by
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 5. ATUALIZAR DATA_SOURCES_NEW E DATA_CONNECTIONS
-- ============================================

-- Marcar alguns uploads como disponíveis para prospecção
UPDATE public.data_sources_new
SET is_available_for_prospecting = true
WHERE id IN (
  SELECT id FROM public.data_sources_new
  WHERE is_available_for_prospecting IS NULL
  LIMIT 5
);

-- Marcar algumas conexões como disponíveis para prospecção
UPDATE public.data_connections
SET is_available_for_prospecting = true
WHERE id IN (
  SELECT id FROM public.data_connections
  WHERE is_available_for_prospecting IS NULL
  LIMIT 3
);

