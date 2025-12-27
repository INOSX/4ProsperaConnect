/**
 * DatabaseQueryAgent - Consultas ao banco de dados com busca SQL e vetorial
 */
import { supabase } from '../../services/supabase'
import VectorSearchService from '../services/VectorSearchService.js'

export default class DatabaseQueryAgent {
  constructor() {
    this.vectorSearch = new VectorSearchService()
  }

  async query(text, user, context, params) {
    try {
      // Decidir estratégia: SQL vs Vetorial vs Híbrida
      const strategy = this.determineSearchStrategy(text)
      
      if (strategy === 'vector' || strategy === 'hybrid') {
        // Usar busca vetorial
        const vectorResults = await this.vectorSearch.semanticSearch(text, null, 10)
        
        if (strategy === 'vector') {
          return {
            success: true,
            results: vectorResults.results || [],
            summary: vectorResults.summary || 'Resultados encontrados',
            vectorSearchUsed: true
          }
        }
        
        // Híbrida: combinar com SQL se necessário
        const sqlResults = await this.executeSQLQuery(text, user)
        return {
          success: true,
          results: this.combineResults(vectorResults.results, sqlResults),
          summary: `Encontrados ${vectorResults.results.length + sqlResults.length} resultados`,
          vectorSearchUsed: true
        }
      } else {
        // Usar SQL tradicional
        const sqlResults = await this.executeSQLQuery(text, user)
        return {
          success: true,
          results: sqlResults,
          summary: `Encontrados ${sqlResults.length} resultados`,
          vectorSearchUsed: false
        }
      }
    } catch (error) {
      console.error('Error in DatabaseQueryAgent:', error)
      return {
        success: false,
        error: error.message,
        results: []
      }
    }
  }

  determineSearchStrategy(text) {
    const lowerText = text.toLowerCase()
    
    // Palavras que indicam busca semântica
    const semanticKeywords = ['similar', 'parecido', 'relacionado', 'semelhante', 'perfil', 'potencial']
    const hasSemantic = semanticKeywords.some(kw => lowerText.includes(kw))
    
    // Palavras que indicam busca estruturada
    const structuredKeywords = ['quantas', 'quantos', 'total', 'soma', 'média', 'contar']
    const hasStructured = structuredKeywords.some(kw => lowerText.includes(kw))
    
    if (hasSemantic && hasStructured) return 'hybrid'
    if (hasSemantic) return 'vector'
    return 'sql'
  }

  async executeSQLQuery(text, user) {
    try {
      // Por enquanto, retorna resultados básicos
      // Em produção, usaria um gerador de SQL com LLM
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(10)
      
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('SQL query error:', error)
      return []
    }
  }

  combineResults(vectorResults, sqlResults) {
    // Combinar e deduplicar resultados
    const combined = [...sqlResults]
    const sqlIds = new Set(sqlResults.map(r => r.id))
    
    vectorResults.forEach(result => {
      if (!sqlIds.has(result.record_id)) {
        combined.push({
          ...result.metadata,
          id: result.record_id,
          _fromVector: true
        })
      }
    })
    
    return combined
  }
}

