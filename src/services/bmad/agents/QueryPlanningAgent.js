/**
 * QueryPlanningAgent - Usa IA para planejar consultas dinâmicas no banco de dados
 * Este agente consulta OpenAI para determinar:
 * - Que tipo de consulta executar
 * - Quais tabelas usar
 * - Como estruturar a query
 * - Se deve usar busca vetorial, SQL ou híbrida
 */
import DatabaseKnowledgeAgent from './DatabaseKnowledgeAgent.js'

export default class QueryPlanningAgent {
  constructor() {
    this.knowledgeAgent = new DatabaseKnowledgeAgent()
  }

  /**
   * Planeja uma consulta usando IA
   */
  async planQuery(userQuery, intent, context = {}) {
    console.log('[BMAD:QueryPlanningAgent] 🧠 Planning query with AI:', userQuery?.substring(0, 100))
    
    try {
      // Obter conhecimento do banco
      const schema = this.knowledgeAgent.databaseSchema
      const technologies = this.knowledgeAgent.getTechnologies()
      const availableTables = this.knowledgeAgent.getAvailableTables()

      // Construir prompt para OpenAI
      const prompt = this.buildPlanningPrompt(userQuery, schema, technologies, availableTables, context)

      // Chamar OpenAI para planejar a query
      const plan = await this.callOpenAIForPlanning(prompt)

      console.log('[BMAD:QueryPlanningAgent] ✅ Query plan generated:', plan)

      return plan
    } catch (error) {
      console.error('[BMAD:QueryPlanningAgent] ❌ Error planning query:', error)
      
      // Fallback: usar heurísticas simples
      return this.fallbackPlanning(userQuery, intent)
    }
  }

  /**
   * Constrói o prompt para OpenAI
   */
  buildPlanningPrompt(userQuery, schema, technologies, availableTables, context) {
    return `Você é um especialista em bancos de dados PostgreSQL com Supabase e pgvector.

CONTEXTO DO BANCO DE DADOS:
- Banco: Supabase (PostgreSQL) com extensão pgvector
- Busca vetorial: OpenAI text-embedding-3-small (1536 dimensões)
- Tabelas disponíveis: ${availableTables.join(', ')}

SCHEMA DAS PRINCIPAIS TABELAS:
${JSON.stringify(schema, null, 2)}

TECNOLOGIAS:
- Vector Search: pgvector com índice HNSW
- Embeddings: OpenAI text-embedding-3-small (1536 dims)
- Função RPC: semantic_search(query_embedding, table_filter, similarity_threshold, result_limit)

CONSULTA DO USUÁRIO: "${userQuery}"

INSTRUÇÕES:
1. Analise a consulta do usuário
2. Determine o tipo de consulta (count, aggregate, timeSeries, semantic, crossTable, list)
3. Identifique quais tabelas são necessárias
4. Determine a estratégia de busca (semantic, sql, hybrid)
5. Se for busca semântica, indique se precisa gerar embedding
6. Se for SQL, sugira a estrutura da query (mas não gere SQL completo por segurança)
7. Se for consulta temporal, indique como agrupar por período

RESPONDA APENAS EM JSON NO SEGUINTE FORMATO:
{
  "queryType": "count|aggregate|timeSeries|semantic|sql|crossTable|list",
  "tables": ["table1", "table2"],
  "strategy": "semantic|sql|hybrid",
  "needsEmbedding": true|false,
  "aggregationType": "avg|sum|count|max|min|null",
  "timeGrouping": "month|year|day|null",
  "description": "Descrição do que a consulta deve fazer",
  "approach": "Como executar esta consulta"
}`
  }

  /**
   * Chama OpenAI para planejar a query
   */
  async callOpenAIForPlanning(prompt) {
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em planejamento de consultas de banco de dados. Responda APENAS em JSON válido, sem markdown, sem explicações adicionais.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const plan = JSON.parse(data.choices[0].message.content)

      return {
        queryType: plan.queryType || 'sql',
        tables: plan.tables || [],
        strategy: plan.strategy || 'sql',
        needsEmbedding: plan.needsEmbedding || false,
        aggregationType: plan.aggregationType || null,
        timeGrouping: plan.timeGrouping || null,
        description: plan.description || '',
        approach: plan.approach || '',
        confidence: 0.8
      }
    } catch (error) {
      console.error('[BMAD:QueryPlanningAgent] Error calling OpenAI:', error)
      throw error
    }
  }

  /**
   * Fallback: planejamento usando heurísticas
   */
  fallbackPlanning(userQuery, intent) {
    console.log('[BMAD:QueryPlanningAgent] ⚠️ Using fallback planning')
    
    const lowerQuery = userQuery.toLowerCase()
    const suggestions = this.knowledgeAgent.suggestQueryApproach(userQuery, intent)

    if (suggestions.length > 0) {
      const suggestion = suggestions[0]
      return {
        queryType: suggestion.type,
        tables: suggestion.tables || [],
        strategy: suggestion.type === 'semantic' ? 'semantic' : 'sql',
        needsEmbedding: suggestion.requiresEmbedding || false,
        aggregationType: suggestion.type === 'aggregate' ? 'avg' : null,
        timeGrouping: suggestion.type === 'timeSeries' ? 'month' : null,
        description: suggestion.approach || '',
        approach: suggestion.approach || '',
        confidence: 0.6
      }
    }

    // Default: busca semântica
    return {
      queryType: 'semantic',
      tables: [],
      strategy: 'semantic',
      needsEmbedding: true,
      aggregationType: null,
      timeGrouping: null,
      description: 'Busca semântica genérica',
      approach: 'Usar busca vetorial com embeddings',
      confidence: 0.5
    }
  }
}

