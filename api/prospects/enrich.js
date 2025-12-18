/**
 * API Route para enriquecer prospects com múltiplas fontes de dados
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const adminClient = getAdminClient()

  try {
    // GET: Obter status de um job
    if (req.method === 'GET') {
      const { jobId } = req.query

      if (!jobId) {
        return res.status(400).json({ error: 'jobId is required' })
      }

      const { data: job, error } = await adminClient
        .from('prospect_enrichment_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error

      return res.status(200).json({
        success: true,
        job
      })
    }

    // POST: Criar novo job de enriquecimento
    if (req.method === 'POST') {
      const { prospectIds, sourceConfigs, userId } = req.body

      if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
        return res.status(400).json({ error: 'prospectIds array is required' })
      }

      if (!sourceConfigs || !Array.isArray(sourceConfigs) || sourceConfigs.length === 0) {
        return res.status(400).json({ error: 'sourceConfigs array is required' })
      }

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' })
      }

      // Criar job de enriquecimento
      const { data: job, error: jobError } = await adminClient
        .from('prospect_enrichment_jobs')
        .insert({
          prospect_ids: prospectIds,
          source_ids: sourceConfigs.map(sc => sc.sourceId),
          status: 'pending',
          progress: 0,
          created_by: userId
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Processar enriquecimento de forma assíncrona (simulado)
      // Em produção, isso seria feito em background job
      processEnrichmentAsync(adminClient, job.id, prospectIds, sourceConfigs, userId)
        .catch(error => {
          console.error('Error processing enrichment:', error)
        })

      return res.status(201).json({
        success: true,
        jobId: job.id,
        message: 'Enriquecimento iniciado'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error in enrich API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process enrichment request'
    })
  }
}

// Função para processar enriquecimento de forma assíncrona
async function processEnrichmentAsync(adminClient, jobId, prospectIds, sourceConfigs, userId) {
  try {
    // Atualizar status para running
    await adminClient
      .from('prospect_enrichment_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        progress: 0
      })
      .eq('id', jobId)

    const results = {
      enriched: 0,
      failed: 0,
      details: []
    }

    // Processar cada prospect
    for (let i = 0; i < prospectIds.length; i++) {
      const prospectId = prospectIds[i]
      const progress = Math.round((i / prospectIds.length) * 100)

      try {
        // Buscar prospect atual
        const { data: prospect, error: prospectError } = await adminClient
          .from('prospects')
          .select('*')
          .eq('id', prospectId)
          .single()

        if (prospectError || !prospect) {
          results.failed++
          results.details.push({
            prospectId,
            error: 'Prospect not found'
          })
          continue
        }

        const dataBefore = {
          name: prospect.name,
          email: prospect.email,
          phone: prospect.phone,
          score: prospect.score,
          market_signals: prospect.market_signals,
          behavior_data: prospect.behavior_data,
          consumption_profile: prospect.consumption_profile
        }

        // Processar cada fonte de dados
        for (const sourceConfig of sourceConfigs) {
          try {
            await enrichFromSource(adminClient, prospectId, sourceConfig, userId)
          } catch (sourceError) {
            console.error(`Error enriching from source ${sourceConfig.sourceId}:`, sourceError)
          }
        }

        // Buscar prospect atualizado
        const { data: updatedProspect } = await adminClient
          .from('prospects')
          .select('*')
          .eq('id', prospectId)
          .single()

        const dataAfter = {
          name: updatedProspect.name,
          email: updatedProspect.email,
          phone: updatedProspect.phone,
          score: updatedProspect.score,
          market_signals: updatedProspect.market_signals,
          behavior_data: updatedProspect.behavior_data,
          consumption_profile: updatedProspect.consumption_profile
        }

        // Registrar histórico
        const enrichedFields = Object.keys(dataAfter).filter(
          key => JSON.stringify(dataBefore[key]) !== JSON.stringify(dataAfter[key])
        )

        if (enrichedFields.length > 0) {
          for (const sourceConfig of sourceConfigs) {
            await adminClient
              .from('prospect_enrichment_history')
              .insert({
                prospect_id: prospectId,
                source_id: sourceConfig.sourceId,
                enrichment_type: sourceConfig.sourceType,
                data_before: dataBefore,
                data_after: dataAfter,
                enriched_fields: enrichedFields,
                created_by: userId
              })
          }
        }

        results.enriched++
        results.details.push({
          prospectId,
          success: true,
          enrichedFields
        })

        // Atualizar progresso
        await adminClient
          .from('prospect_enrichment_jobs')
          .update({ progress })
          .eq('id', jobId)
      } catch (error) {
        results.failed++
        results.details.push({
          prospectId,
          error: error.message
        })
      }
    }

    // Atualizar status final
    await adminClient
      .from('prospect_enrichment_jobs')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        results
      })
      .eq('id', jobId)

    // Atualizar prospects
    await adminClient
      .from('prospects')
      .update({
        enrichment_status: 'enriched',
        last_enriched_at: new Date().toISOString()
      })
      .in('id', prospectIds)
  } catch (error) {
    console.error('Error in async enrichment:', error)
    await adminClient
      .from('prospect_enrichment_jobs')
      .update({
        status: 'failed',
        error_log: error.message
      })
      .eq('id', jobId)
  }
}

// Função para enriquecer de uma fonte específica
async function enrichFromSource(adminClient, prospectId, sourceConfig, userId) {
  const { sourceType, sourceId, fieldMapping } = sourceConfig

  // Buscar prospect
  const { data: prospect } = await adminClient
    .from('prospects')
    .select('*')
    .eq('id', prospectId)
    .single()

  if (!prospect) return

  let enrichmentData = {}

  if (sourceType === 'upload') {
    // Enriquecer de upload (simulado - em produção, buscar dados do arquivo)
    // Por enquanto, apenas vincular a fonte
    enrichmentData = {
      // Dados seriam buscados do arquivo CSV/Excel
    }
  } else if (sourceType === 'database') {
    // Enriquecer de banco de dados (simulado)
    // Em produção, conectar ao banco e buscar dados
    enrichmentData = {
      // Dados seriam buscados da conexão
    }
  } else if (sourceType === 'external_api') {
    // Enriquecer de API externa
    const { data: apiConfig } = await adminClient
      .from('external_api_integrations')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (apiConfig) {
      // Chamar API externa (mockado por enquanto)
      enrichmentData = await callExternalAPI(apiConfig, prospect)
    }
  }

  // Aplicar mapeamento de campos
  const updates = {}
  if (fieldMapping) {
    for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
      if (enrichmentData[sourceField] !== undefined) {
        updates[targetField] = enrichmentData[sourceField]
      }
    }
  } else {
    // Mapeamento automático básico
    if (enrichmentData.name) updates.name = enrichmentData.name
    if (enrichmentData.email) updates.email = enrichmentData.email
    if (enrichmentData.phone) updates.phone = enrichmentData.phone
  }

  // Atualizar prospect
  if (Object.keys(updates).length > 0) {
    await adminClient
      .from('prospects')
      .update(updates)
      .eq('id', prospectId)

    // Vincular fonte de dados
    await adminClient
      .from('prospect_data_sources')
      .upsert({
        prospect_id: prospectId,
        source_type: sourceType,
        source_id: sourceId,
        enrichment_status: 'completed',
        last_enriched_at: new Date().toISOString(),
        data_mapping: fieldMapping || {},
        created_by: userId
      }, {
        onConflict: 'prospect_id,source_type,source_id'
      })
  }
}

// Função para chamar API externa (mockada)
async function callExternalAPI(apiConfig, prospect) {
  // Em produção, fazer chamada real à API
  // Por enquanto, retornar dados mockados
  const mockData = {
    name: prospect.name,
    email: `enriched_${prospect.email || 'email@example.com'}`,
    phone: prospect.phone,
    score_credito: Math.floor(Math.random() * 100),
    situacao: 'ATIVA'
  }

  return mockData
}

