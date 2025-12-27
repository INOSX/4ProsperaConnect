/**
 * Configurações dos agentes BMAD
 */
export const bmadConfig = {
  // Configurações do SupervisorAgent
  supervisor: {
    minQualityScore: 70,
    maxRetries: 3,
    enableAutoCorrection: true
  },

  // Configurações do VoiceIntentAgent
  voiceIntent: {
    minConfidence: 0.5,
    useLLM: true,
    llmModel: 'gpt-4'
  },

  // Configurações do DatabaseQueryAgent
  databaseQuery: {
    maxResults: 1000,
    queryTimeout: 30000, // 30 segundos
    enableVectorSearch: true,
    enableHybridSearch: true
  },

  // Configurações do MemoryResourceAgent
  memory: {
    maxHistoryMessages: 50,
    maxTokensPerRequest: 4000,
    memoryThreshold: 80, // porcentagem
    autoCleanupThreshold: 100
  },

  // Configurações do SuggestionAgent
  suggestion: {
    maxSuggestions: 5,
    minRelevance: 60
  },

  // Configurações de vetorização
  vectorization: {
    embeddingModel: 'text-embedding-3-large',
    embeddingDimensions: 3072,
    chunkSize: 500, // tokens
    tablesToVectorize: [
      'companies',
      'employees',
      'prospects',
      'campaigns',
      'cpf_clients',
      'unbanked_companies'
    ]
  }
}

export default bmadConfig

