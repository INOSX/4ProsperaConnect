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

  console.log(`[generateBatch] Processing ${texts.length} texts in batches of ${batchSize}`)

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    console.log(`[generateBatch] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(texts.length/batchSize)} (${batch.length} texts)`)
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: batch,
      dimensions: 3072
    })
    
    const batchEmbeddings = response.data.map(item => item.embedding)
    console.log(`[generateBatch] Generated ${batchEmbeddings.length} embeddings, first embedding length: ${batchEmbeddings[0]?.length}`)
    allEmbeddings.push(...batchEmbeddings)
  }

  console.log(`[generateBatch] Total embeddings generated: ${allEmbeddings.length}`)
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
        console.log(`[vectorizeTable] 🔍 Fetching records from table: ${tableName}`)
        const { data: records, error: fetchError, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })

        if (fetchError) {
          console.error(`[vectorizeTable] ❌ Error fetching ${tableName}:`, {
            error: fetchError,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
            code: fetchError.code
          })
          throw fetchError
        }

        console.log(`[vectorizeTable] 📊 Query result for ${tableName}:`, {
          recordsFound: records?.length || 0,
          count: count,
          hasData: !!records,
          isArray: Array.isArray(records),
          firstRecord: records?.[0] ? {
            id: records[0].id,
            keys: Object.keys(records[0])
          } : null
        })

        if (!records || records.length === 0) {
          console.log(`[vectorizeTable] ⚠️ No records found in table: ${tableName}`)
          return res.status(200).json({
            success: true,
            processed: 0,
            total: 0,
            message: `Nenhum registro encontrado na tabela ${tableName}. Verifique se a tabela existe e contém dados.`
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
        console.log(`[vectorizeTable] Generating embeddings for ${texts.length} texts from ${tableName}...`)
        const embeddings = await generateBatch(texts)
        console.log(`[vectorizeTable] Generated ${embeddings.length} embeddings`, {
          firstEmbeddingLength: embeddings[0]?.length,
          firstEmbeddingType: typeof embeddings[0],
          firstEmbeddingIsArray: Array.isArray(embeddings[0])
        })

        // Salvar embeddings
        let processed = 0
        let errors = []
        
        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          const embedding = embeddings[i]
          const text = texts[i]

          // Validar embedding
          if (!embedding || !Array.isArray(embedding)) {
            console.error(`[vectorizeTable] Invalid embedding for record ${record.id}:`, {
              embeddingType: typeof embedding,
              isArray: Array.isArray(embedding),
              embeddingLength: embedding?.length
            })
            errors.push({ recordId: record.id, error: 'Invalid embedding format' })
            continue
          }
          
          if (embedding.length !== 3072) {
            console.warn(`[vectorizeTable] Embedding dimension mismatch for record ${record.id}: expected 3072, got ${embedding.length}`)
          }

          // Limitar tamanho do metadata para evitar payload muito grande
          const limitedMetadata = {
            id: record.id,
            ...(record.company_name && { company_name: record.company_name }),
            ...(record.name && { name: record.name }),
            ...(record.email && { email: record.email }),
            ...(record.cnpj && { cnpj: record.cnpj }),
            ...(record.cpf && { cpf: record.cpf })
          }

          const embeddingRecord = {
            table_name: tableName,
            record_id: record.id,
            chunk_text: text.substring(0, 10000), // Limitar tamanho do texto
            embedding: embedding, // Array direto
            metadata: limitedMetadata
          }

          if (i < 3 || i % 50 === 0) {
            console.log(`[vectorizeTable] Upserting record ${i+1}/${records.length} from ${tableName} (ID: ${record.id})`, {
              embeddingLength: embedding.length,
              textLength: text.length,
              metadataSize: JSON.stringify(limitedMetadata).length
            })
          }

          // Tentar upsert
          try {
            const { data: upsertData, error: upsertError } = await supabase
              .from('data_embeddings')
              .upsert(embeddingRecord, { onConflict: 'table_name,record_id' })
              .select()

            if (upsertError) {
              throw upsertError
            }

            // Verificar se realmente foi salvo
            if (!upsertData || upsertData.length === 0) {
              console.warn(`[vectorizeTable] ⚠️ Upsert returned no data for ${tableName}:${record.id}`)
              errors.push({ 
                recordId: record.id, 
                error: 'Upsert returned no data'
              })
              continue
            }

            processed++
            if (i < 3 || i % 50 === 0) {
              console.log(`[vectorizeTable] ✅ Successfully upserted record ${i+1}/${records.length} from ${tableName} (ID: ${record.id})`, {
                upsertData: upsertData[0] ? { 
                  id: upsertData[0].id, 
                  table_name: upsertData[0].table_name,
                  hasEmbedding: !!upsertData[0].embedding
                } : null
              })
            }
          } catch (upsertError) {
            console.error(`[vectorizeTable] ❌ Error upserting embedding for ${tableName}:${record.id}:`, {
              error: upsertError,
              message: upsertError.message,
              details: upsertError.details,
              hint: upsertError.hint,
              code: upsertError.code,
              embeddingRecordSize: JSON.stringify(embeddingRecord).length,
              embeddingLength: embedding.length,
              chunkTextLength: text.length,
              metadataSize: JSON.stringify(limitedMetadata).length,
              embeddingType: typeof embedding,
              embeddingIsArray: Array.isArray(embedding),
              embeddingSample: embedding?.slice(0, 3)
            })
            errors.push({ 
              recordId: record.id, 
              error: upsertError.message || 'Unknown error',
              details: upsertError.details,
              code: upsertError.code
            })
          }
        }
        
        if (errors.length > 0) {
          console.warn(`[vectorizeTable] ${errors.length} errors occurred while processing ${tableName}:`, errors.slice(0, 5))
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
            console.log(`[vectorizeAll] Processing table: ${tableName}`)
            
            // Buscar todos os registros da tabela diretamente
            const { data: records, error: fetchError } = await supabase
              .from(tableName)
              .select('*')

            if (fetchError) {
              console.error(`[vectorizeAll] Error fetching ${tableName}:`, fetchError)
              results.push({
                table: tableName,
                success: false,
                processed: 0,
                error: fetchError.message
              })
              continue
            }

            if (!records || records.length === 0) {
              console.log(`[vectorizeAll] ⚠️ No records found in table: ${tableName}`)
              console.log(`[vectorizeAll] Query result:`, { 
                hasData: !!records, 
                dataLength: records?.length,
                isArray: Array.isArray(records)
              })
              results.push({
                table: tableName,
                success: true,
                processed: 0,
                total: 0,
                message: `Nenhum registro encontrado na tabela ${tableName}. Verifique se a tabela existe e contém dados.`
              })
              continue
            }

            console.log(`[vectorizeAll] ✅ Found ${records.length} records in ${tableName}`, {
              firstRecordId: records[0]?.id,
              firstRecordKeys: Object.keys(records[0] || {}),
              sampleRecord: records[0] ? {
                id: records[0].id,
                ...(records[0].name && { name: records[0].name }),
                ...(records[0].company_name && { company_name: records[0].company_name }),
                ...(records[0].email && { email: records[0].email })
              } : null
            })

            // Criar textos semânticos
            const texts = records.map(record => {
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

            // Filtrar textos vazios
            const validTexts = texts.filter(t => t && t.length > 0)
            if (validTexts.length === 0) {
              console.log(`[vectorizeAll] No valid texts generated for ${tableName}`)
              results.push({
                table: tableName,
                success: true,
                processed: 0,
                total: records.length,
                message: `Nenhum texto válido gerado para ${tableName}`
              })
              continue
            }

            console.log(`[vectorizeAll] Generating embeddings for ${validTexts.length} texts from ${tableName}`)

            // Gerar embeddings em batch
            const embeddings = await generateBatch(validTexts)
            console.log(`[vectorizeAll] Generated ${embeddings.length} embeddings for ${tableName}`)

            // Salvar embeddings
            let processed = 0
            let errors = []
            
            for (let i = 0; i < records.length; i++) {
              const record = records[i]
              const text = texts[i]
              
              // Encontrar o embedding correspondente (pode ser diferente se alguns textos foram filtrados)
              const textIndex = validTexts.indexOf(text)
              if (textIndex === -1 || !text || text.length === 0) {
                console.warn(`[vectorizeAll] Skipping record ${record.id} from ${tableName} - no valid text`)
                continue
              }
              
              const embedding = embeddings[textIndex]
              
              // Validar embedding
              if (!embedding || !Array.isArray(embedding)) {
                console.error(`[vectorizeAll] Invalid embedding for record ${record.id} from ${tableName}:`, {
                  embeddingType: typeof embedding,
                  isArray: Array.isArray(embedding),
                  embeddingLength: embedding?.length
                })
                errors.push({ recordId: record.id, error: 'Invalid embedding format' })
                continue
              }
              
              if (embedding.length !== 3072) {
                console.warn(`[vectorizeAll] Embedding dimension mismatch for record ${record.id}: expected 3072, got ${embedding.length}`)
              }

              // Validar formato do embedding antes de enviar
              if (!Array.isArray(embedding) || embedding.length !== 3072) {
                console.error(`[vectorizeAll] Invalid embedding format for record ${record.id}:`, {
                  isArray: Array.isArray(embedding),
                  length: embedding?.length,
                  expectedLength: 3072,
                  firstFew: embedding?.slice(0, 5)
                })
                errors.push({ recordId: record.id, error: `Invalid embedding: expected array of 3072, got ${embedding?.length || 'null'}` })
                continue
              }

              // Limitar tamanho do metadata para evitar payload muito grande
              const limitedMetadata = {
                id: record.id,
                ...(record.company_name && { company_name: record.company_name }),
                ...(record.name && { name: record.name }),
                ...(record.email && { email: record.email }),
                ...(record.cnpj && { cnpj: record.cnpj }),
                ...(record.cpf && { cpf: record.cpf })
              }

              const embeddingRecord = {
                table_name: tableName,
                record_id: record.id,
                chunk_text: text.substring(0, 10000), // Limitar tamanho do texto
                embedding: embedding, // Array direto - Supabase/pgvector aceita array
                metadata: limitedMetadata
              }

              if (i < 3 || i % 50 === 0) {
                console.log(`[vectorizeAll] Upserting record ${i+1}/${records.length} from ${tableName} (ID: ${record.id})`, {
                  embeddingLength: embedding.length,
                  textLength: text.length,
                  metadataSize: JSON.stringify(limitedMetadata).length,
                  embeddingFirstFew: embedding.slice(0, 3)
                })
              }
              
              // Tentar upsert
              try {
                const { data: upsertData, error: upsertError } = await supabase
                  .from('data_embeddings')
                  .upsert(embeddingRecord, { onConflict: 'table_name,record_id' })
                  .select()

                if (upsertError) {
                  throw upsertError
                }

                // Verificar se realmente foi salvo
                if (!upsertData || upsertData.length === 0) {
                  console.warn(`[vectorizeAll] ⚠️ Upsert returned no data for ${tableName}:${record.id}`)
                  errors.push({ 
                    recordId: record.id, 
                    error: 'Upsert returned no data'
                  })
                  continue
                }

                processed++
                if (processed % 10 === 0 || i < 3) {
                  console.log(`[vectorizeAll] ✅ Successfully upserted record ${i+1}/${records.length} from ${tableName} (ID: ${record.id})`, {
                    upsertData: upsertData[0] ? { 
                      id: upsertData[0].id, 
                      table_name: upsertData[0].table_name,
                      hasEmbedding: !!upsertData[0].embedding
                    } : null
                  })
                }
              } catch (upsertError) {
                console.error(`[vectorizeAll] ❌ Error upserting embedding for ${tableName}:${record.id}:`, {
                  error: upsertError,
                  message: upsertError.message,
                  details: upsertError.details,
                  hint: upsertError.hint,
                  code: upsertError.code,
                  embeddingRecordSize: JSON.stringify(embeddingRecord).length,
                  embeddingLength: embedding.length,
                  chunkTextLength: text.length,
                  metadataSize: JSON.stringify(limitedMetadata).length,
                  embeddingType: typeof embedding,
                  embeddingIsArray: Array.isArray(embedding),
                  embeddingSample: embedding?.slice(0, 3)
                })
                errors.push({ 
                  recordId: record.id, 
                  error: upsertError.message || 'Unknown error',
                  details: upsertError.details,
                  code: upsertError.code
                })
              }
            }
            
            if (errors.length > 0) {
              console.warn(`[vectorizeAll] ${errors.length} errors occurred while processing ${tableName}:`, errors.slice(0, 5))
            }

            console.log(`[vectorizeAll] Processed ${processed} of ${records.length} records from ${tableName}`)

            results.push({
              table: tableName,
              success: true,
              processed,
              total: records.length,
              message: `Vetorizados ${processed} de ${records.length} registros da tabela ${tableName}`
            })
          } catch (error) {
            console.error(`[vectorizeAll] Error processing ${tableName}:`, error)
            results.push({
              table: tableName,
              success: false,
              processed: 0,
              error: error.message || 'Erro desconhecido'
            })
          }
        }

        const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0)
        const successfulTables = results.filter(r => r.success).length
        const failedTables = results.filter(r => !r.success).length

        console.log(`[vectorizeAll] Completed: ${totalProcessed} total records, ${successfulTables} successful tables, ${failedTables} failed tables`)

        return res.status(200).json({
          success: true,
          results,
          totalProcessed,
          successfulTables,
          failedTables,
          message: `Vetorização completa. Total: ${totalProcessed} registros processados de ${successfulTables} tabelas`
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
