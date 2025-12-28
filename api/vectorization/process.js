/**
 * API Route para processar vetorização de dados
 * Processa registros pendentes e gera embeddings reais
 */
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Inicializar Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Inicializar OpenAI
function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: {
      'OpenAI-Project': process.env.OPENAI_PROJECT_ID || 'proj_rRapPtQ3Q0EOtuqYNUcVglYk',
    },
  })
}

const openai = initializeOpenAI()

// Embedding Generator simplificado para uso no servidor
async function generateEmbedding(text) {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 3072
  })

  return response.data[0].embedding
}

async function generateBatch(texts) {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  // Processar em batches de 100
  const batchSize = 100
  const allEmbeddings = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: batch,
      dimensions: 3072
    })
    allEmbeddings.push(...response.data.map(item => item.embedding))
  }

  return allEmbeddings
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validar configurações
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (supabaseError) {
    return res.status(500).json({ 
      error: 'Supabase not configured',
      details: supabaseError.message 
    })
  }

  try {
    const { action, ...params } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action is required' })
    }

    switch (action) {
      case 'processPending': {
        // Processa registros que foram criados pelos triggers mas ainda não têm embedding
        const { batchSize = 50 } = params

        console.log('Processing pending embeddings...')

        // Buscar registros sem embedding
        const { data: pendingRecords, error: fetchError } = await supabase
          .from('data_embeddings')
          .select('*')
          .is('embedding', null)
          .limit(batchSize)

        if (fetchError) {
          throw fetchError
        }

        if (!pendingRecords || pendingRecords.length === 0) {
          return res.status(200).json({
            success: true,
            processed: 0,
            message: 'Nenhum registro pendente para processar'
          })
        }

        // Gerar embeddings em batch
        const texts = pendingRecords.map(record => record.chunk_text)
        const embeddings = await generateBatch(texts)

        // Atualizar registros com embeddings
        let processed = 0
        for (let i = 0; i < pendingRecords.length; i++) {
          const record = pendingRecords[i]
          const embedding = embeddings[i]

          const { error: updateError } = await supabase
            .from('data_embeddings')
            .update({
              embedding: embedding,
              updated_at: new Date().toISOString()
            })
            .eq('id', record.id)

          if (!updateError) {
            processed++
          } else {
            console.error(`Error updating embedding for record ${record.id}:`, updateError)
          }
        }

        return res.status(200).json({
          success: true,
          processed,
          total: pendingRecords.length,
          message: `Processados ${processed} de ${pendingRecords.length} registros`
        })
      }

      case 'vectorizeTable': {
        // Vetoriza todos os dados de uma tabela específica
        const { tableName } = params

        if (!tableName) {
          return res.status(400).json({ error: 'tableName is required' })
        }

        console.log(`Vectorizing table: ${tableName}`)

        // Buscar todos os registros da tabela
        const { data: records, error: fetchError } = await supabase
          .from(tableName)
          .select('*')

        if (fetchError) {
          throw fetchError
        }

        if (!records || records.length === 0) {
          return res.status(200).json({
            success: true,
            processed: 0,
            message: `Nenhum registro encontrado na tabela ${tableName}`
          })
        }

        // Criar textos semânticos
        const texts = records.map(record => {
          // Criar texto semântico baseado na tabela
          if (tableName === 'companies') {
            return `${record.company_name || ''} ${record.cnpj || ''} ${record.trade_name || ''} ${record.industry || ''}`.trim()
          } else if (tableName === 'employees') {
            return `${record.name || ''} ${record.email || ''} ${record.department || ''} ${record.position || ''}`.trim()
          } else if (tableName === 'prospects') {
            return `${record.name || ''} ${record.cpf || ''} ${record.cnpj || ''} ${record.email || ''} ${record.market_signals || ''}`.trim()
          } else if (tableName === 'cpf_clients') {
            return `${record.name || ''} ${record.cpf || ''} ${record.email || ''} ${record.business_category || ''} ${record.notes || ''}`.trim()
          } else if (tableName === 'unbanked_companies') {
            return `${record.company_name || ''} ${record.cnpj || ''} ${record.industry || ''} ${record.notes || ''}`.trim()
          }
          return JSON.stringify(record)
        })

        // Gerar embeddings em batch
        const embeddings = await generateBatch(texts)

        // Salvar embeddings
        let processed = 0
        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          const embedding = embeddings[i]
          const text = texts[i]

          const embeddingRecord = {
            table_name: tableName,
            record_id: record.id,
            chunk_text: text,
            embedding: embedding,
            metadata: record
          }

          const { error: upsertError } = await supabase
            .from('data_embeddings')
            .upsert(embeddingRecord, { onConflict: 'table_name,record_id' })

          if (!upsertError) {
            processed++
          } else {
            console.error(`Error upserting embedding for ${tableName}:${record.id}:`, upsertError)
          }
        }

        return res.status(200).json({
          success: true,
          processed,
          total: records.length,
          message: `Vetorizados ${processed} de ${records.length} registros da tabela ${tableName}`
        })
      }

      case 'vectorizeAll': {
        // Vetoriza todas as tabelas configuradas
        const tables = ['companies', 'employees', 'prospects', 'cpf_clients', 'unbanked_companies']
        const results = []

        for (const tableName of tables) {
          try {
            // Chamar recursivamente para cada tabela
            const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/vectorization/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'vectorizeTable',
                tableName
              })
            })

            const result = await response.json()
            results.push({
              table: tableName,
              ...result
            })
          } catch (error) {
            results.push({
              table: tableName,
              success: false,
              error: error.message
            })
          }
        }

        const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0)

        return res.status(200).json({
          success: true,
          results,
          totalProcessed,
          message: `Vetorização completa. Total: ${totalProcessed} registros processados`
        })
      }

      case 'getStatus': {
        // Retorna status da vetorização
        try {
          const { data: allRecords, error } = await supabase
            .from('data_embeddings')
            .select('table_name, embedding')

          if (error) {
            // Se a tabela não existir, retornar status vazio
            if (error.message?.includes('relation') || error.message?.includes('does not exist') || error.code === 'PGRST116') {
              return res.status(200).json({
                success: true,
                total: 0,
                withEmbedding: 0,
                pending: 0,
                byTable: {},
                message: 'Tabela data_embeddings ainda não foi criada. Execute o script SQL primeiro.'
              })
            }
            throw error
          }

          const total = allRecords?.length || 0
          const withEmbedding = allRecords?.filter(r => r.embedding !== null && r.embedding !== undefined).length || 0
          const pending = total - withEmbedding

          // Contar por tabela
          const byTable = {}
          allRecords?.forEach(record => {
            if (!byTable[record.table_name]) {
              byTable[record.table_name] = { total: 0, withEmbedding: 0, pending: 0 }
            }
            byTable[record.table_name].total++
            if (record.embedding !== null && record.embedding !== undefined) {
              byTable[record.table_name].withEmbedding++
            } else {
              byTable[record.table_name].pending++
            }
          })

          return res.status(200).json({
            success: true,
            total,
            withEmbedding,
            pending,
            byTable
          })
        } catch (statusError) {
          console.error('Error in getStatus:', statusError)
          // Se a tabela não existir, retornar status vazio
          if (statusError.message?.includes('relation') || statusError.message?.includes('does not exist') || statusError.code === 'PGRST116') {
            return res.status(200).json({
              success: true,
              total: 0,
              withEmbedding: 0,
              pending: 0,
              byTable: {},
              message: 'Tabela data_embeddings ainda não foi criada. Execute o script SQL primeiro.'
            })
          }
          throw statusError
        }
      }

      default:
        return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (error) {
    console.error('Error in vectorization API:', error)
    // Garantir que sempre retornamos JSON válido
    const errorResponse = {
      success: false,
      error: error.message || 'Internal server error'
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.stack
      errorResponse.fullError = error.toString()
    }
    
    return res.status(500).json(errorResponse)
  }
}
