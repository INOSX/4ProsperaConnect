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
    console.log('[BMAD:QueryPlanningAgent] 🧠 ========== INICIANDO PLANEJAMENTO DE QUERY ==========')
    console.log('[BMAD:QueryPlanningAgent] 📝 Input:', {
      userQuery: userQuery?.substring(0, 200),
      intent: intent,
      contextKeys: Object.keys(context || {})
    })
    
    try {
      // Obter conhecimento do banco
      console.log('[BMAD:QueryPlanningAgent] 📚 Obtendo conhecimento do banco...')
      const schema = this.knowledgeAgent.databaseSchema
      const technologies = this.knowledgeAgent.getTechnologies()
      const availableTables = this.knowledgeAgent.getAvailableTables()
      
      console.log('[BMAD:QueryPlanningAgent] 📚 Conhecimento obtido:', {
        tablesCount: availableTables.length,
        tables: availableTables,
        hasSchema: !!schema,
        hasTechnologies: !!technologies
      })

      // Construir prompt para OpenAI
      console.log('[BMAD:QueryPlanningAgent] 🔨 Construindo prompt para OpenAI...')
      const prompt = this.buildPlanningPrompt(userQuery, schema, technologies, availableTables, context)
      console.log('[BMAD:QueryPlanningAgent] 📄 Prompt construído (tamanho:', prompt.length, 'caracteres)')

      // Chamar OpenAI para planejar a query
      console.log('[BMAD:QueryPlanningAgent] 🤖 Chamando OpenAI para planejar query...')
      const plan = await this.callOpenAIForPlanning(prompt)

      console.log('[BMAD:QueryPlanningAgent] ✅ ========== PLANO GERADO COM SUCESSO ==========')
      console.log('[BMAD:QueryPlanningAgent] 📋 Plano completo:', JSON.stringify(plan, null, 2))
      console.log('[BMAD:QueryPlanningAgent] 📊 Resumo do plano:', {
        queryType: plan.queryType,
        tables: plan.tables,
        strategy: plan.strategy,
        groupBy: plan.groupBy,
        aggregationType: plan.aggregationType,
        confidence: plan.confidence,
        description: plan.description?.substring(0, 100)
      })

      return plan
    } catch (error) {
      console.error('[BMAD:QueryPlanningAgent] ❌ ========== ERRO NO PLANEJAMENTO ==========')
      console.error('[BMAD:QueryPlanningAgent] ❌ Erro:', error)
      console.error('[BMAD:QueryPlanningAgent] ❌ Stack:', error.stack)
      
      // Fallback: usar heurísticas simples
      console.log('[BMAD:QueryPlanningAgent] 🔄 Usando fallback (heurísticas)...')
      const fallbackPlan = this.fallbackPlanning(userQuery, intent)
      console.log('[BMAD:QueryPlanningAgent] 🔄 Plano fallback gerado:', JSON.stringify(fallbackPlan, null, 2))
      return fallbackPlan
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
1. Analise a consulta do usuário detalhadamente
2. Determine o tipo de consulta (count, aggregate, timeSeries, semantic, sql, crossTable, list, groupBy)
3. Identifique quais tabelas são necessárias
4. Determine a estratégia de busca (semantic, sql, hybrid)
5. Se for busca semântica, indique se precisa gerar embedding
6. Se for agregação ou agrupamento, especifique:
   - Campo para agrupar (groupBy)
   - Tipo de agregação (count, sum, avg, max, min)
   - Campos a selecionar
7. Se for consulta temporal, indique como agrupar por período
8. Forneça instruções detalhadas de execução que permitam executar a query dinamicamente

IMPORTANTE: Você deve gerar a QUERY SQL COMPLETA e EXECUTÁVEL que responda à pergunta do usuário.
A query deve ser válida para PostgreSQL/Supabase e considerar RLS (Row Level Security).

RESPONDA APENAS EM JSON NO SEGUINTE FORMATO:
{
  "queryType": "count|aggregate|timeSeries|semantic|sql|crossTable|list|groupBy",
  "tables": ["table1", "table2"],
  "strategy": "semantic|sql|hybrid",
  "needsEmbedding": true|false,
  "aggregationType": "avg|sum|count|max|min|groupBy|null",
  "groupBy": "nome_do_campo|null",
  "selectFields": ["campo1", "campo2"],
  "filters": [{"field": "campo", "operator": "=", "value": "valor"}],
  "timeGrouping": "month|year|day|null",
  "description": "Descrição detalhada do que a consulta deve fazer",
  "sqlQuery": "SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...",
  "executionSteps": ["passo1", "passo2", "passo3"],
  "expectedResultFormat": "array|object|count|chart"
}

O campo "sqlQuery" é OBRIGATÓRIO quando strategy for "sql" ou queryType for "sql", "aggregate", "groupBy", "timeSeries" ou "count".
A query SQL deve ser completa, válida e pronta para execução no Supabase.
Se for consulta de agrupamento (groupBy), a query deve incluir GROUP BY e ORDER BY apropriados.
Se for consulta temporal (timeSeries), use DATE_TRUNC para agrupar por período.
Se for consulta de contagem, use COUNT(*) ou COUNT(campo).
Se for consulta agregada, use AVG, SUM, MAX, MIN conforme necessário.
  }

  /**
   * Chama OpenAI para planejar a query
   */
  async callOpenAIForPlanning(prompt) {
    console.log('[BMAD:QueryPlanningAgent] 🌐 Preparando requisição para OpenAI API...')
    const startTime = Date.now()
    
    try {
      const requestBody = {
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
      }
      
      console.log('[BMAD:QueryPlanningAgent] 📤 Enviando requisição:', {
        model: requestBody.model,
        temperature: requestBody.temperature,
        messagesCount: requestBody.messages.length,
        promptLength: prompt.length
      })
      
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const requestTime = Date.now() - startTime
      console.log('[BMAD:QueryPlanningAgent] 📥 Resposta recebida em', requestTime + 'ms, status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[BMAD:QueryPlanningAgent] ❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText?.substring(0, 200)
        })
        throw new Error(`OpenAI API error: ${response.status} - ${errorText?.substring(0, 100)}`)
      }

      const data = await response.json()
      console.log('[BMAD:QueryPlanningAgent] 📦 Dados recebidos:', {
        hasChoices: !!data.choices,
        choicesCount: data.choices?.length || 0,
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      })
      
      const rawPlan = JSON.parse(data.choices[0].message.content)
      console.log('[BMAD:QueryPlanningAgent] 📋 Plano bruto da IA:', JSON.stringify(rawPlan, null, 2))

      const finalPlan = {
        queryType: rawPlan.queryType || 'sql',
        tables: rawPlan.tables || [],
        strategy: rawPlan.strategy || 'sql',
        needsEmbedding: rawPlan.needsEmbedding || false,
        aggregationType: rawPlan.aggregationType || null,
        groupBy: rawPlan.groupBy || null,
        selectFields: rawPlan.selectFields || [],
        filters: rawPlan.filters || [],
        timeGrouping: rawPlan.timeGrouping || null,
        description: rawPlan.description || '',
        sqlQuery: rawPlan.sqlQuery || null, // Query SQL completa gerada pela IA
        executionSteps: rawPlan.executionSteps || [],
        expectedResultFormat: rawPlan.expectedResultFormat || 'array',
        approach: rawPlan.approach || rawPlan.description || '',
        confidence: 0.8
      }
      
      // Log da query SQL gerada pela IA
      if (finalPlan.sqlQuery) {
        console.log('[BMAD:QueryPlanningAgent] 📝 Query SQL gerada pela IA:', finalPlan.sqlQuery)
      } else if (finalPlan.strategy === 'sql' || ['sql', 'aggregate', 'groupBy', 'timeSeries', 'count'].includes(finalPlan.queryType)) {
        console.warn('[BMAD:QueryPlanningAgent] ⚠️ Query SQL não foi gerada pela IA, mas deveria ter sido gerada')
      }
      
      const totalTime = Date.now() - startTime
      console.log('[BMAD:QueryPlanningAgent] ✅ Plano processado em', totalTime + 'ms')
      console.log('[BMAD:QueryPlanningAgent] 📊 Plano final formatado:', JSON.stringify(finalPlan, null, 2))

      return finalPlan
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error('[BMAD:QueryPlanningAgent] ❌ Erro após', totalTime + 'ms:', error)
      console.error('[BMAD:QueryPlanningAgent] ❌ Detalhes do erro:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      })
      throw error
    }
  }

  /**
   * Fallback: planejamento usando heurísticas
   */
  fallbackPlanning(userQuery, intent) {
    console.log('[BMAD:QueryPlanningAgent] ⚠️ ========== USANDO FALLBACK (HEURÍSTICAS) ==========')
    console.log('[BMAD:QueryPlanningAgent] ⚠️ Input para fallback:', { userQuery: userQuery?.substring(0, 100), intent })
    
    const lowerQuery = userQuery.toLowerCase()
    console.log('[BMAD:QueryPlanningAgent] 🔍 Buscando sugestões de abordagem...')
    const suggestions = this.knowledgeAgent.suggestQueryApproach(userQuery, intent)
    console.log('[BMAD:QueryPlanningAgent] 💡 Sugestões encontradas:', suggestions.length, 'sugestões')

    if (suggestions.length > 0) {
      const suggestion = suggestions[0]
      console.log('[BMAD:QueryPlanningAgent] ✅ Usando primeira sugestão:', JSON.stringify(suggestion, null, 2))
      
      const fallbackPlan = {
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
      
      console.log('[BMAD:QueryPlanningAgent] 📋 Plano fallback gerado:', JSON.stringify(fallbackPlan, null, 2))
      return fallbackPlan
    }

    // Default: busca semântica
    console.log('[BMAD:QueryPlanningAgent] 🔄 Nenhuma sugestão encontrada, usando padrão (busca semântica)')
    const defaultPlan = {
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
    console.log('[BMAD:QueryPlanningAgent] 📋 Plano padrão:', JSON.stringify(defaultPlan, null, 2))
    return defaultPlan
  }
}

