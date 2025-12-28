/**
 * DatabaseKnowledgeAgent - Conhece o schema do banco de dados e tecnologias usadas
 * Este agente mantém conhecimento sobre:
 * - Schema do banco de dados (tabelas, colunas, relacionamentos)
 * - Tecnologias usadas (Supabase, pgvector, OpenAI Embeddings)
 * - Estrutura do banco vetorial
 * - Como operar no banco de dados
 */
export default class DatabaseKnowledgeAgent {
  constructor() {
    // Schema do banco de dados
    this.databaseSchema = {
      companies: {
        table: 'companies',
        description: 'Tabela de empresas cadastradas',
        columns: {
          id: 'UUID - Identificador único',
          company_name: 'TEXT - Nome da empresa',
          trade_name: 'TEXT - Nome fantasia',
          cnpj: 'TEXT - CNPJ da empresa',
          company_type: 'TEXT - Tipo de empresa',
          email: 'TEXT - Email de contato',
          phone: 'TEXT - Telefone',
          address: 'JSONB - Endereço completo',
          industry: 'TEXT - Setor/ramo',
          annual_revenue: 'NUMERIC - Receita anual',
          created_at: 'TIMESTAMP - Data de cadastro',
          updated_at: 'TIMESTAMP - Data de atualização'
        },
        relationships: {
          employees: 'has_many - Uma empresa tem muitos colaboradores',
          company_benefits: 'has_many - Uma empresa tem muitos benefícios'
        }
      },
      employees: {
        table: 'employees',
        description: 'Tabela de colaboradores',
        columns: {
          id: 'UUID - Identificador único',
          company_id: 'UUID - ID da empresa (FK)',
          name: 'TEXT - Nome do colaborador',
          cpf: 'TEXT - CPF',
          email: 'TEXT - Email',
          phone: 'TEXT - Telefone',
          position: 'TEXT - Cargo',
          salary: 'NUMERIC - Salário',
          hire_date: 'DATE - Data de contratação',
          is_active: 'BOOLEAN - Se está ativo',
          created_at: 'TIMESTAMP - Data de cadastro'
        },
        relationships: {
          company: 'belongs_to - Um colaborador pertence a uma empresa'
        }
      },
      prospects: {
        table: 'prospects',
        description: 'Tabela de prospects (clientes potenciais)',
        columns: {
          id: 'UUID - Identificador único',
          name: 'TEXT - Nome',
          cpf_cnpj: 'TEXT - CPF ou CNPJ',
          email: 'TEXT - Email',
          phone: 'TEXT - Telefone',
          score: 'NUMERIC - Score de qualificação',
          market_signals: 'JSONB - Sinais de mercado',
          consumption_profile: 'JSONB - Perfil de consumo',
          created_at: 'TIMESTAMP - Data de cadastro'
        }
      },
      data_embeddings: {
        table: 'data_embeddings',
        description: 'Tabela de embeddings vetoriais para busca semântica',
        columns: {
          id: 'UUID - Identificador único',
          table_name: 'TEXT - Nome da tabela origem',
          record_id: 'UUID - ID do registro origem',
          chunk_text: 'TEXT - Texto vetorizado',
          embedding: 'VECTOR(1536) - Embedding vetorial (OpenAI text-embedding-3-small)',
          metadata: 'JSONB - Metadados adicionais',
          created_at: 'TIMESTAMP - Data de criação'
        },
        indexes: {
          embedding: 'HNSW index para busca por similaridade'
        }
      }
    }

    // Tecnologias usadas
    this.technologies = {
      database: {
        name: 'Supabase (PostgreSQL)',
        version: 'PostgreSQL 15+',
        features: ['RLS (Row Level Security)', 'pgvector extension', 'JSONB support']
      },
      vectorization: {
        name: 'OpenAI Embeddings',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        description: 'Gera embeddings vetoriais de 1536 dimensões para busca semântica'
      },
      vectorSearch: {
        name: 'pgvector',
        indexType: 'HNSW',
        similarityFunction: 'cosine_similarity',
        description: 'Busca por similaridade usando índice HNSW'
      },
      searchStrategy: {
        semantic: 'Busca semântica usando embeddings vetoriais',
        sql: 'Busca SQL tradicional',
        hybrid: 'Combinação de busca semântica + SQL'
      }
    }

    // Funções disponíveis no banco
    this.availableFunctions = {
      semantic_search: {
        name: 'semantic_search',
        description: 'Função RPC para busca semântica usando embeddings',
        parameters: {
          query_embedding: 'VECTOR(1536) - Embedding da query',
          table_filter: 'TEXT - Filtro opcional por tabela',
          similarity_threshold: 'NUMERIC - Threshold de similaridade (0.7 padrão)',
          result_limit: 'INTEGER - Limite de resultados (10 padrão)'
        }
      },
      match_documents: {
        name: 'match_documents',
        description: 'Função alternativa para busca semântica',
        parameters: {
          query_embedding: 'VECTOR(1536)',
          match_threshold: 'NUMERIC',
          match_count: 'INTEGER'
        }
      }
    }
  }

  /**
   * Obtém informações sobre uma tabela específica
   */
  getTableInfo(tableName) {
    return this.databaseSchema[tableName] || null
  }

  /**
   * Obtém todas as tabelas disponíveis
   */
  getAvailableTables() {
    return Object.keys(this.databaseSchema)
  }

  /**
   * Obtém informações sobre tecnologias usadas
   */
  getTechnologies() {
    return this.technologies
  }

  /**
   * Verifica se uma tabela tem suporte a busca vetorial
   */
  hasVectorSearch(tableName) {
    // Todas as tabelas principais têm embeddings em data_embeddings
    return ['companies', 'employees', 'prospects'].includes(tableName)
  }

  /**
   * Obtém informações sobre como fazer uma consulta específica
   */
  getQueryGuidance(queryType, tableName = null) {
    const guidance = {
      count: {
        description: 'Consultas de contagem',
        approach: 'Usar COUNT() ou buscar todos e contar no código',
        tables: tableName ? [tableName] : this.getAvailableTables()
      },
      aggregate: {
        description: 'Consultas agregadas (média, soma, etc)',
        approach: 'Usar funções agregadas SQL (AVG, SUM, MAX, MIN)',
        example: 'SELECT AVG(salary) FROM employees WHERE company_id = ?'
      },
      timeSeries: {
        description: 'Consultas temporais (gráficos por período)',
        approach: 'Agrupar por período (mês/ano) usando DATE_TRUNC ou agrupar no código',
        example: 'Agrupar created_at por mês/ano'
      },
      semantic: {
        description: 'Busca semântica',
        approach: 'Usar semantic_search RPC ou fallbackVectorSearch',
        requiresEmbedding: true
      },
      crossTable: {
        description: 'Consultas entre múltiplas tabelas',
        approach: 'Usar JOINs SQL ou múltiplas queries',
        example: 'companies JOIN employees ON companies.id = employees.company_id'
      }
    }

    return guidance[queryType] || null
  }

  /**
   * Gera sugestões de como executar uma consulta
   */
  suggestQueryApproach(userQuery, intent) {
    const suggestions = []

    // Analisar a query para sugerir abordagem
    const lowerQuery = userQuery.toLowerCase()

    if (lowerQuery.includes('média') || lowerQuery.includes('average')) {
      suggestions.push({
        type: 'aggregate',
        approach: 'Usar função AVG() do SQL',
        tables: ['employees', 'companies']
      })
    }

    if (lowerQuery.includes('gráfico') || lowerQuery.includes('por período') || lowerQuery.includes('por mês')) {
      suggestions.push({
        type: 'timeSeries',
        approach: 'Agrupar por período usando created_at',
        tables: ['companies', 'employees']
      })
    }

    if (lowerQuery.includes('sem colaborador') || lowerQuery.includes('sem funcionário')) {
      suggestions.push({
        type: 'crossTable',
        approach: 'Buscar todas empresas, depois verificar quais não têm employees',
        tables: ['companies', 'employees'],
        join: 'LEFT JOIN employees ON companies.id = employees.company_id WHERE employees.id IS NULL'
      })
    }

    if (lowerQuery.includes('buscar') || lowerQuery.includes('encontrar') || lowerQuery.includes('procurar')) {
      suggestions.push({
        type: 'semantic',
        approach: 'Usar busca semântica com embeddings',
        requiresEmbedding: true
      })
    }

    return suggestions
  }
}

