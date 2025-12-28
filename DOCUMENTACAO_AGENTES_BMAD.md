# 📚 Documentação Completa dos Agentes BMAD

## 🎯 Visão Geral

O sistema BMAD (Behavior, Model, Agent, Data) é composto por **18 agentes especializados** que trabalham em conjunto para processar comandos de voz/texto e executar ações no sistema 4Prospera Connect.

---

## 🔄 Fluxo de Processamento (12 Etapas)

Cada comando passa por **12 etapas sequenciais** no `BMADOrchestrator`:

1. **Validação Inicial** (SupervisorAgent)
2. **Classificação de Intenção** (VoiceIntentAgent)
3. **Validação de Permissões** (PermissionAgent)
4. **Coleta de Contexto** (ContextAgent)
5. **Otimização de Memória (Antes)** (MemoryResourceAgent)
6. **Execução de Ação** (Agentes de Domínio ou DatabaseQueryAgent)
7. **Geração de Visualizações** (DataVisualizationAgent)
8. **Geração de Feedback** (FeedbackAgent)
9. **Otimização de Memória (Depois)** (MemoryResourceAgent)
10. **Validação Final** (SupervisorAgent)
11. **Geração de Sugestões** (SuggestionAgent)
12. **Atualização de Histórico** (MemoryResourceAgent)

---

## 📋 Lista Completa de Agentes

### 1. 🛡️ SupervisorAgent
**Responsabilidade:** Monitora e valida todas as ações em cada etapa do fluxo BMAD

**Ações:**
- `validateInitial(text)` - Valida entrada inicial (tamanho, formato)
- `validateIntent(intentResult)` - Valida intenção classificada (confidence, formato)
- `validatePermission(permissionResult)` - Valida resultado de verificação de permissões
- `validateContext(contextResult)` - Valida contexto coletado
- `validateQueryResult(queryResult)` - Valida resultado de consultas ao banco
- `validateActionResult(actionResult)` - Valida resultado de ações de domínio
- `validateVisualizations(visualizations)` - Valida visualizações geradas
- `validateFinal(finalData)` - Validação final completa (relevância, completude)
- `calculateRelevance(question, answer, actionResult)` - Calcula relevância entre pergunta e resposta
- `calculateCompleteness(data)` - Calcula completude da resposta
- `attemptCorrection(validationResult)` - Tenta corrigir erros detectados

**Quando é chamado:**
- ✅ **Sempre** - Em TODAS as etapas do fluxo (1, 2, 3, 4, 6, 7, 10)
- ✅ Após cada ação importante para garantir qualidade

---

### 2. 🎤 VoiceIntentAgent
**Responsabilidade:** Classifica a intenção do usuário e extrai parâmetros do comando

**Ações:**
- `classifyIntent(text, user)` - Classifica a intenção do comando
- `extractParams(text, intent)` - Extrai parâmetros (CNPJ, CPF, ID, nome, email)

**Intenções suportadas:**
- `create_company`, `list_companies`, `update_company`, `delete_company`, `get_company_stats`
- `create_employee`, `list_employees`, `update_employee`, `delete_employee`
- `create_campaign`, `list_campaigns`, `activate_campaign`, `pause_campaign`
- `list_prospects`, `enrich_prospect`, `qualify_prospect`, `calculate_score`
- `query_database`, `search_data`, `get_all_data`, `know_all_data`
- `query_companies_without_employees` (especial)

**Quando é chamado:**
- ✅ **Etapa 2** - Classificação de intenção no fluxo principal

---

### 3. 🔐 PermissionAgent
**Responsabilidade:** Verifica se o usuário tem permissão para executar a ação

**Ações:**
- `checkPermission(intent, user, params)` - Verifica permissões baseadas em role

**Permissões por Role:**
- **Admin do Banco:** Todas as ações
- **Admin do Cliente:** Gerenciar colaboradores, listar empresas
- **Usuário Normal:** Apenas leitura e consultas

**Quando é chamado:**
- ✅ **Etapa 3** - Verificação de permissões no fluxo principal

---

### 4. 📦 ContextAgent
**Responsabilidade:** Coleta contexto do usuário, página e dados relevantes

**Ações:**
- `collectContext(user, additionalContext)` - Coleta contexto completo

**Contexto coletado:**
- `userContext`: userId, email, role, companyId, userType
- `pageContext`: pathname, search params
- `dataContext`: Dados adicionais do contexto

**Quando é chamado:**
- ✅ **Etapa 4** - Coleta de contexto no fluxo principal

---

### 5. 🧠 DatabaseKnowledgeAgent
**Responsabilidade:** Conhece o schema do banco, tecnologias e como operar

**Ações:**
- `getTableInfo(tableName)` - Obtém informações de uma tabela específica
- `getAvailableTables()` - Lista todas as tabelas disponíveis
- `getTechnologies()` - Obtém informações sobre tecnologias (Supabase, pgvector, OpenAI)
- `hasVectorSearch(tableName)` - Verifica se tabela tem busca vetorial
- `getQueryGuidance(queryType, tableName)` - Obtém orientação para tipo de query
- `suggestQueryApproach(userQuery, intent)` - Sugere abordagem para consulta

**Quando é chamado:**
- ✅ **Internamente** - Por QueryPlanningAgent para planejar consultas
- ✅ **Sempre que necessário** - Para obter conhecimento do banco

---

### 6. 🧠 QueryPlanningAgent
**Responsabilidade:** Usa IA (OpenAI) para planejar consultas dinâmicas no banco

**Ações:**
- `planQuery(userQuery, intent, context)` - Planeja consulta usando IA
- `callOpenAIForPlanning(prompt)` - Chama OpenAI Chat API para planejar
- `buildPlanningPrompt(userQuery, schema, technologies, availableTables, context)` - Constrói prompt
- `fallbackPlanning(userQuery, intent)` - Planejamento usando heurísticas (fallback)

**Interações com IA:**
- 🤖 **OpenAI Chat API** (`/api/openai/chat`) - Para planejar consultas
- Model: `gpt-4o-mini`
- Response format: JSON

**Quando é chamado:**
- ✅ **Internamente** - Por DatabaseQueryAgent antes de executar consultas
- ✅ **Sempre** - Para consultas que precisam de planejamento dinâmico

---

### 7. 🔍 DatabaseQueryAgent
**Responsabilidade:** Executa consultas ao banco de dados (SQL, busca semântica, agregações)

**Ações principais:**
- `query(text, user, context, params)` - Método principal para consultas
- `executeQuery(intent, params, user, context)` - Executa query baseada em intent
- `executePlannedQuery(queryPlan, text, user, params)` - Executa query baseada em plano da IA
- `executeDynamicGroupBy(queryPlan, user, params)` - Executa agrupamento dinâmico
- `executeDynamicAggregate(queryPlan, user, params)` - Executa agregação dinâmica

**Ações específicas:**
- `handleCountQuery(text, user, params)` - Consultas de contagem
- `handleAggregateQuery(text, user, params)` - Consultas agregadas (média, soma, etc)
- `handleTimeSeriesQuery(text, user, params)` - Consultas temporais (gráficos)
- `handleCompaniesWithoutEmployeesQuery(text, user, params)` - Empresas sem colaboradores
- `executeSQLQuery(text, user, params)` - Executa SQL direto
- `getAllData(user, context)` - Obtém todos os dados (busca semântica)

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `query_database`, `search_data`, `get_all_data`, `know_all_data`
- ✅ **Etapa 6** - Para intents que começam com `query_` ou `search_`

---

### 8. 🏢 CompanyActionAgent
**Responsabilidade:** Gerencia ações relacionadas a empresas

**Ações:**
- `create(params, user, context)` - Criar empresa
- `list(params, user, context)` - Listar empresas
- `update(params, user, context)` - Atualizar empresa
- `delete(params, user, context)` - Deletar empresa
- `getStats(params, user, context)` - Obter estatísticas da empresa

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `create_company`, `list_companies`, `update_company`, `delete_company`, `get_company_stats`

---

### 9. 👥 EmployeeActionAgent
**Responsabilidade:** Gerencia ações relacionadas a colaboradores

**Ações:**
- `create(params, user, context)` - Criar colaborador
- `list(params, user, context)` - Listar colaboradores
- `update(params, user, context)` - Atualizar colaborador
- `delete(params, user, context)` - Deletar colaborador

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `create_employee`, `list_employees`, `update_employee`, `delete_employee`

---

### 10. 📢 CampaignActionAgent
**Responsabilidade:** Gerencia ações relacionadas a campanhas de marketing

**Ações:**
- `create(params, user, context)` - Criar campanha
- `list(params, user, context)` - Listar campanhas
- `update(params, user, context)` - Atualizar campanha
- `delete(params, user, context)` - Deletar campanha
- `activate(params, user, context)` - Ativar campanha
- `pause(params, user, context)` - Pausar campanha

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `create_campaign`, `list_campaigns`, `update_campaign`, `delete_campaign`, `activate_campaign`, `pause_campaign`

---

### 11. 🎯 ProspectingActionAgent
**Responsabilidade:** Gerencia ações relacionadas a prospecção de clientes

**Ações:**
- `list(params, user, context)` - Listar prospects
- `enrich(params, user, context)` - Enriquecer prospect com dados
- `qualify(params, user, context)` - Qualificar prospect
- `calculateScore(params, user, context)` - Calcular score de qualificação
- `recommendProducts(params, user, context)` - Recomendar produtos para prospect

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `list_prospects`, `enrich_prospect`, `qualify_prospect`, `calculate_score`, `recommend_products`

---

### 12. 💰 BenefitActionAgent
**Responsabilidade:** Gerencia ações relacionadas a benefícios

**Ações:**
- `create(params, user, context)` - Criar benefício
- `list(params, user, context)` - Listar benefícios
- `update(params, user, context)` - Atualizar benefício
- `delete(params, user, context)` - Deletar benefício

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `create_benefit`, `list_benefits`, `update_benefit`, `delete_benefit`

---

### 13. 📦 ProductActionAgent
**Responsabilidade:** Gerencia ações relacionadas a produtos financeiros

**Ações:**
- `list(params, user, context)` - Listar produtos
- `recommend(params, user, context)` - Recomendar produto para colaborador

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `list_products`, `recommend_product`

---

### 14. 🔌 IntegrationActionAgent
**Responsabilidade:** Gerencia ações relacionadas a integrações externas

**Ações:**
- `sync(params, user, context)` - Sincronizar dados de integração
- `testConnection(params, user, context)` - Testar conexão com serviço externo

**Quando é chamado:**
- ✅ **Etapa 6** - Para intents: `sync_integration`, `test_connection`

---

### 15. 📊 DataVisualizationAgent
**Responsabilidade:** Gera visualizações de dados (gráficos, tabelas, cards)

**Ações:**
- `generateVisualizations(actionResult, intent)` - Gera visualizações baseadas no resultado

**Tipos de visualização:**
- `chart` - Gráficos (line, bar, pie)
- `table` - Tabelas de dados
- `card` - Cards com métricas

**Quando é chamado:**
- ✅ **Etapa 7** - Após execução de ação, para gerar visualizações

---

### 16. 💬 FeedbackAgent
**Responsabilidade:** Gera resposta textual para o usuário

**Ações:**
- `generateFeedback(originalText, actionResult, visualizations, intentResult)` - Gera feedback baseado no resultado

**Quando é chamado:**
- ✅ **Etapa 8** - Após geração de visualizações, para criar resposta ao usuário

---

### 17. 💡 SuggestionAgent
**Responsabilidade:** Gera sugestões de próximas ações baseadas no contexto

**Ações:**
- `generateSuggestions(text, intentResult, actionResult, history)` - Gera sugestões de próximas ações

**Quando é chamado:**
- ✅ **Etapa 11** - Antes de finalizar, para sugerir próximas ações ao usuário

---

### 18. 🧠 MemoryResourceAgent
**Responsabilidade:** Monitora e otimiza memória e histórico de conversação

**Ações:**
- `optimizeBeforeProcessing()` - Otimiza memória antes de processar
- `optimizeAfterProcessing(feedback)` - Otimiza memória após processar
- `updateHistory(entry)` - Atualiza histórico de conversação
- `getConversationHistory()` - Obtém histórico recente (últimas 10 mensagens)
- `estimateMemoryUsage()` - Estima uso de memória
- `cleanupCache()` - Limpa cache quando necessário

**Quando é chamado:**
- ✅ **Etapa 5** - Otimização antes de processar
- ✅ **Etapa 9** - Otimização após processar
- ✅ **Etapa 11** - Para obter histórico ao gerar sugestões
- ✅ **Etapa 12** - Para atualizar histórico

---

## 🔗 Serviços Auxiliares

### VectorSearchService
**Responsabilidade:** Realiza buscas semânticas usando embeddings vetoriais

**Ações:**
- `semanticSearch(query, tableName, limit)` - Busca semântica usando embeddings
- `fallbackVectorSearch(queryEmbedding, tableName, limit)` - Fallback de busca vetorial
- `fallbackSearch(query, tableName, limit)` - Fallback genérico (API calls)
- `hybridSearch(query, filters, limit)` - Busca híbrida (vetorial + SQL)
- `crossTableSearch(query, tableNames, limit)` - Busca entre múltiplas tabelas

**Quando é chamado:**
- ✅ **Internamente** - Por DatabaseQueryAgent para buscas semânticas

---

### EmbeddingGenerator
**Responsabilidade:** Gera embeddings vetoriais usando OpenAI Embeddings API

**Ações:**
- `generateEmbedding(text)` - Gera embedding único
- `generateBatch(texts)` - Gera embeddings em batch
- `clearCache()` - Limpa cache de embeddings
- `getCacheSize()` - Obtém tamanho do cache

**Interações com IA:**
- 🤖 **OpenAI Embeddings API** (`/api/openai/embeddings`) - Para gerar embeddings
- Model: `text-embedding-3-small` (1536 dimensões)

**Quando é chamado:**
- ✅ **Internamente** - Por VectorSearchService para gerar embeddings de queries

---

## 📊 Fluxo Completo de Execução

```
1. Usuário fala/comanda
   ↓
2. BMADOrchestrator.processCommand(text, user, context)
   ↓
3. SupervisorAgent.validateInitial() ✅
   ↓
4. VoiceIntentAgent.classifyIntent() → SupervisorAgent.validateIntent() ✅
   ↓
5. PermissionAgent.checkPermission() → SupervisorAgent.validatePermission() ✅
   ↓
6. ContextAgent.collectContext() → SupervisorAgent.validateContext() ✅
   ↓
7. MemoryResourceAgent.optimizeBeforeProcessing()
   ↓
8. [EXECUÇÃO DE AÇÃO]
   ├─ DatabaseQueryAgent.query() → QueryPlanningAgent.planQuery() → OpenAI Chat API
   │  └─ VectorSearchService.semanticSearch() → EmbeddingGenerator.generateEmbedding() → OpenAI Embeddings API
   ├─ OU CompanyActionAgent.create/list/update/delete/getStats()
   ├─ OU EmployeeActionAgent.create/list/update/delete()
   ├─ OU CampaignActionAgent.create/list/update/delete/activate/pause()
   ├─ OU ProspectingActionAgent.list/enrich/qualify/calculateScore/recommendProducts()
   ├─ OU BenefitActionAgent.create/list/update/delete()
   ├─ OU ProductActionAgent.list/recommend()
   └─ OU IntegrationActionAgent.sync/testConnection()
   ↓
9. SupervisorAgent.validateQueryResult() OU validateActionResult() ✅
   ↓
10. DataVisualizationAgent.generateVisualizations()
    ↓
11. SupervisorAgent.validateVisualizations() ✅
    ↓
12. FeedbackAgent.generateFeedback()
    ↓
13. MemoryResourceAgent.optimizeAfterProcessing()
    ↓
14. SupervisorAgent.validateFinal() → attemptCorrection() (se necessário)
    ↓
15. SuggestionAgent.generateSuggestions() → MemoryResourceAgent.getConversationHistory()
    ↓
16. MemoryResourceAgent.updateHistory()
    ↓
17. Retorna resultado completo ao usuário
```

---

## 🤖 Interações com IAs

### OpenAI Chat API
**Agente:** QueryPlanningAgent
**Endpoint:** `/api/openai/chat`
**Model:** `gpt-4o-mini`
**Uso:** Planejar consultas dinâmicas ao banco de dados
**Quando:** Antes de executar consultas complexas

### OpenAI Embeddings API
**Agente:** EmbeddingGenerator (usado por VectorSearchService)
**Endpoint:** `/api/openai/embeddings`
**Model:** `text-embedding-3-small`
**Dimensões:** 1536
**Uso:** Gerar embeddings vetoriais para busca semântica
**Quando:** Durante buscas semânticas no banco de dados

---

## 📈 Estatísticas

- **Total de Agentes:** 18
- **Total de Ações:** ~60+ métodos
- **Etapas no Fluxo:** 12
- **Validações do Supervisor:** 8 tipos diferentes
- **Interações com IA:** 2 (Chat + Embeddings)
- **Agentes de Domínio:** 7 (Company, Employee, Campaign, Prospecting, Benefit, Product, Integration)

---

## 🔍 Rastreamento

Todos os agentes possuem logs detalhados no console seguindo o padrão:
```
[BMAD:AgentName] 🔍 ========== AÇÃO ==========
[BMAD:AgentName] 📝 Input: { ... }
[BMAD:AgentName] 🔄 Processamento...
[BMAD:AgentName] ✅ ========== CONCLUSÃO ==========
[BMAD:AgentName] 📤 Resultado: { ... }
```

Isso permite rastrear **TUDO**: todas as chamadas, interações com IAs e suas respostas.

---

**Última atualização:** 2024
**Versão do Sistema:** BMAD v1.0

