/**
 * API para enriquecer clientes CPF com dados de múltiplas fontes
 * - APIs externas (Receita Federal, Serasa)
 * - Uploads de planilhas
 * - Conexões de banco de dados
 */

import { supabase } from '../../../src/services/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { clientIds, sourceConfigs } = req.body

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'clientIds array is required'
      })
    }

    if (!sourceConfigs || !Array.isArray(sourceConfigs) || sourceConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'sourceConfigs array is required'
      })
    }

    // Buscar clientes CPF
    const { data: clients, error: fetchError } = await supabase
      .from('cpf_clients')
      .select('*')
      .in('id', clientIds)

    if (fetchError) throw fetchError

    const enrichedClients = []

    // Processar cada cliente
    for (const client of clients) {
      let enrichedData = { ...client }

      // Processar cada fonte de dados
      for (const sourceConfig of sourceConfigs) {
        const { sourceType, sourceId, fieldMapping } = sourceConfig

        try {
          if (sourceType === 'external_api') {
            // Enriquecer com APIs externas
            enrichedData = await enrichWithExternalAPI(client, sourceId, enrichedData)
          } else if (sourceType === 'upload') {
            // Enriquecer com dados de upload
            enrichedData = await enrichWithUpload(client, sourceId, fieldMapping, enrichedData)
          } else if (sourceType === 'database') {
            // Enriquecer com dados de banco de dados
            enrichedData = await enrichWithDatabase(client, sourceId, fieldMapping, enrichedData)
          }
        } catch (sourceError) {
          console.error(`Error enriching from ${sourceType}:`, sourceError)
          // Continuar com outras fontes mesmo se uma falhar
        }
      }

      // Recalcular score após enriquecimento
      const calculateResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/cpf-clients/calculate-potential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: enrichedData })
      })

      if (calculateResponse.ok) {
        const { scores } = await calculateResponse.json()
        if (scores && scores[0]) {
          enrichedData.conversion_potential_score = scores[0].conversion_potential_score
          enrichedData.conversion_probability = scores[0].conversion_probability
          enrichedData.recommended_action = scores[0].recommended_action
          enrichedData.priority = scores[0].priority
        }
      }

      // Atualizar cliente no banco
      const { data: updatedClient, error: updateError } = await supabase
        .from('cpf_clients')
        .update({
          ...enrichedData,
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating client:', updateError)
      } else {
        enrichedClients.push(updatedClient)
      }
    }

    return res.status(200).json({
      success: true,
      message: `Enriched ${enrichedClients.length} clients`,
      clients: enrichedClients
    })
  } catch (error) {
    console.error('Error enriching CPF clients:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to enrich clients'
    })
  }
}

/**
 * Enriquecer com API externa
 */
async function enrichWithExternalAPI(client, apiProvider, currentData) {
  const enriched = { ...currentData }

  try {
    // Simular chamadas às APIs externas
    // Em produção, fazer chamadas reais baseadas no apiProvider
    if (apiProvider === 'receita_federal') {
      // Mock: dados da Receita Federal
      enriched.market_signals = {
        ...(enriched.market_signals || {}),
        cnpj_exists: false,
        business_registration: null
      }
    } else if (apiProvider === 'serasa') {
      // Mock: dados do Serasa
      if (!enriched.credit_score) {
        enriched.credit_score = 650 + Math.floor(Math.random() * 150)
      }
      if (!enriched.payment_history) {
        enriched.payment_history = ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)]
      }
    } else if (apiProvider === 'credit_bureau') {
      // Mock: dados do Bureau de Crédito
      enriched.consumption_profile = {
        ...(enriched.consumption_profile || {}),
        credit_history: 'active',
        restrictions: false
      }
    } else if (apiProvider === 'social_media') {
      // Mock: dados de redes sociais
      enriched.digital_presence_score = 50 + Math.floor(Math.random() * 50)
      enriched.social_media_activity = Math.floor(Math.random() * 100)
    }
  } catch (error) {
    console.error('Error enriching with external API:', error)
  }

  return enriched
}

/**
 * Enriquecer com dados de upload
 */
async function enrichWithUpload(client, uploadId, fieldMapping, currentData) {
  const enriched = { ...currentData }

  try {
    // Buscar dados do upload
    const { data: upload, error } = await supabase
      .from('data_sources_new')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (error) throw error

    // Em produção, buscar dados reais do arquivo e mapear campos
    // Por enquanto, apenas atualizar indicadores
    enriched.has_business_indicators = true
    enriched.business_activity_score = Math.min((enriched.business_activity_score || 0) + 10, 100)
  } catch (error) {
    console.error('Error enriching with upload:', error)
  }

  return enriched
}

/**
 * Enriquecer com dados de banco de dados
 */
async function enrichWithDatabase(client, connectionId, fieldMapping, currentData) {
  const enriched = { ...currentData }

  try {
    // Buscar configuração da conexão
    const { data: connection, error } = await supabase
      .from('data_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (error) throw error

    // Em produção, conectar ao banco e buscar dados
    // Por enquanto, apenas atualizar indicadores
    enriched.has_business_indicators = true
    enriched.business_activity_score = Math.min((enriched.business_activity_score || 0) + 15, 100)
  } catch (error) {
    console.error('Error enriching with database:', error)
  }

  return enriched
}

