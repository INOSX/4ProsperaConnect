/**
 * DatabaseVectorizationService - Vetoriza o banco de dados para busca semântica
 */
import { supabase } from '../../../services/supabase'
import EmbeddingGenerator from '../utils/embeddingGenerator.js'

export default class DatabaseVectorizationService {
  constructor() {
    this.tablesToVectorize = [
      'companies',
      'employees',
      'prospects',
      'campaigns',
      'cpf_clients',
      'unbanked_companies'
    ]
    this.embeddingGenerator = new EmbeddingGenerator('text-embedding-3-large')
  }

  /**
   * Vetoriza todos os dados existentes
   */
  async vectorizeAll() {
    try {
      let totalEmbeddings = 0

      for (const tableName of this.tablesToVectorize) {
        const count = await this.vectorizeTable(tableName)
        totalEmbeddings += count
      }

      return {
        success: true,
        embeddingsCreated: totalEmbeddings
      }
    } catch (error) {
      console.error('Error vectorizing database:', error)
      return {
        success: false,
        error: error.message,
        embeddingsCreated: 0
      }
    }
  }

  /**
   * Vetoriza uma tabela específica
   */
  async vectorizeTable(tableName) {
    try {
      // Buscar todos os registros da tabela
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1000) // Limitar para não sobrecarregar

      if (error) throw error
      if (!data || data.length === 0) return 0

      let embeddingsCreated = 0

      // Preparar textos para vetorização em batch
      const textsToVectorize = []
      const recordsData = []

      for (const record of data) {
        const chunkText = this.createSemanticText(record, tableName)
        textsToVectorize.push(chunkText)
        recordsData.push({
          record,
          chunkText,
          metadata: this.extractMetadata(record, tableName)
        })
      }

      // Gerar embeddings em batch
      try {
        const embeddings = await this.embeddingGenerator.generateBatch(textsToVectorize)
        
        // Salvar embeddings na tabela data_embeddings
        for (let i = 0; i < recordsData.length; i++) {
          const { record, chunkText, metadata } = recordsData[i]
          const embedding = embeddings[i]

          const embeddingRecord = {
            table_name: tableName,
            record_id: record.id,
            chunk_text: chunkText,
            embedding: embedding, // Vetor será salvo como vector type no Supabase
            metadata: metadata
          }

          try {
            await supabase
              .from('data_embeddings')
              .upsert(embeddingRecord, { onConflict: 'table_name,record_id' })
              .catch((e) => {
                console.warn(`Error saving embedding for ${tableName}:${record.id}:`, e)
              })
            
            embeddingsCreated++
          } catch (e) {
            console.warn(`Error saving embedding for ${tableName}:${record.id}:`, e)
          }
        }
      } catch (error) {
        console.error(`Error generating embeddings for table ${tableName}:`, error)
        // Continuar mesmo se houver erro, para não bloquear todo o processo
      }

      return embeddingsCreated
    } catch (error) {
      console.error(`Error vectorizing table ${tableName}:`, error)
      return 0
    }
  }

  /**
   * Cria texto semântico a partir de um registro
   */
  createSemanticText(record, tableName) {
    const parts = []

    if (record.name || record.company_name) {
      parts.push(`Nome: ${record.name || record.company_name}`)
    }
    if (record.description) {
      parts.push(`Descrição: ${record.description}`)
    }
    if (record.email) {
      parts.push(`Email: ${record.email}`)
    }
    if (record.cnpj) {
      parts.push(`CNPJ: ${record.cnpj}`)
    }
    if (record.cpf) {
      parts.push(`CPF: ${record.cpf}`)
    }

    // Adicionar campos específicos por tabela
    if (tableName === 'companies' && record.industry) {
      parts.push(`Setor: ${record.industry}`)
    }
    if (tableName === 'employees' && record.department) {
      parts.push(`Departamento: ${record.department}`)
    }
    if (tableName === 'prospects' && record.score) {
      parts.push(`Score: ${record.score}`)
    }

    return parts.join('. ')
  }

  /**
   * Extrai metadados relevantes do registro
   */
  extractMetadata(record, tableName) {
    const metadata = {
      table_name: tableName,
      record_id: record.id
    }

    // Campos comuns
    if (record.name) metadata.name = record.name
    if (record.company_name) metadata.company_name = record.company_name
    if (record.email) metadata.email = record.email
    if (record.cnpj) metadata.cnpj = record.cnpj
    if (record.created_at) metadata.created_at = record.created_at

    return metadata
  }

  /**
   * Sincroniza um registro específico (chamado por triggers)
   */
  async syncRecord(tableName, recordId, record) {
    try {
      const chunkText = this.createSemanticText(record, tableName)
      
      // Gerar embedding
      const embedding = await this.embeddingGenerator.generateEmbedding(chunkText)
      
      const embeddingRecord = {
        table_name: tableName,
        record_id: recordId,
        chunk_text: chunkText,
        embedding: embedding,
        metadata: this.extractMetadata(record, tableName),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('data_embeddings')
        .upsert(embeddingRecord, { onConflict: 'table_name,record_id' })
        .catch(() => {})

      return { success: true }
    } catch (error) {
      console.error(`Error syncing record ${tableName}:${recordId}:`, error)
      return { success: false, error: error.message }
    }
  }
}

