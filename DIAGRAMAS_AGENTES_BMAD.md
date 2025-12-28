# 📊 Diagramas Mermaid - Todos os Agentes BMAD

Este documento contém diagramas Mermaid detalhados para cada um dos 18 agentes do sistema BMAD.

---

## 1. 🛡️ SupervisorAgent

**Responsabilidade:** Monitora e valida todas as ações em cada etapa do fluxo BMAD

```mermaid
flowchart TD
    Start([SupervisorAgent]) --> ValidateInitial[validateInitial<br/>Validação Inicial]
    
    ValidateInitial --> CheckText{Texto<br/>válido?}
    CheckText -->|Não| Reject1[❌ Rejeitado:<br/>Texto vazio/inválido]
    CheckText -->|Sim| CheckLength{Tamanho<br/>> 1000?}
    CheckLength -->|Sim| Reject2[❌ Rejeitado:<br/>Texto muito longo]
    CheckLength -->|Não| Approve1[✅ Aprovado:<br/>qualityScore: 100]
    
    Start --> ValidateIntent[validateIntent<br/>Validação de Intenção]
    ValidateIntent --> CheckIntent{Intent<br/>presente?}
    CheckIntent -->|Não| Reject3[❌ Rejeitado:<br/>Intent não identificado]
    CheckIntent -->|Sim| CheckConfidence{Confiança<br/>>= 0.5?}
    CheckConfidence -->|Não| Reject4[❌ Rejeitado:<br/>Confiança baixa]
    CheckConfidence -->|Sim| Approve2[✅ Aprovado:<br/>qualityScore: confidence * 100]
    
    Start --> ValidatePermission[validatePermission<br/>Validação de Permissão]
    ValidatePermission --> CheckPermission{Resultado<br/>válido?}
    CheckPermission -->|Não| Reject5[❌ Rejeitado:<br/>Resultado inválido]
    CheckPermission -->|Sim| CheckAllowed{Permissão<br/>concedida?}
    CheckAllowed -->|Não| Reject6[❌ Rejeitado:<br/>Permissão negada]
    CheckAllowed -->|Sim| Approve3[✅ Aprovado:<br/>qualityScore: 100]
    
    Start --> ValidateContext[validateContext<br/>Validação de Contexto]
    ValidateContext --> CheckContext{Contexto<br/>presente?}
    CheckContext -->|Não| Reject7[❌ Rejeitado:<br/>Contexto não coletado]
    CheckContext -->|Sim| CheckData{Tem dados<br/>mínimos?}
    CheckData -->|Não| Approve4[⚠️ Aprovado com avisos:<br/>qualityScore: 40]
    CheckData -->|Sim| Approve5[✅ Aprovado:<br/>qualityScore: 80]
    
    Start --> ValidateQueryResult[validateQueryResult<br/>Validação de Query]
    ValidateQueryResult --> CheckQuery{Resultado<br/>presente?}
    CheckQuery -->|Não| Reject8[❌ Rejeitado:<br/>Resultado vazio]
    CheckQuery -->|Sim| CheckError{Tem<br/>erro?}
    CheckError -->|Sim| Reject9[❌ Rejeitado:<br/>Erro no resultado]
    CheckError -->|Não| CheckCount{É contagem?}
    CheckCount -->|Sim| Approve6[✅ Aprovado:<br/>qualityScore: 90]
    CheckCount -->|Não| CheckResults{Tem resultados<br/>ou summary?}
    CheckResults -->|Sim| Approve7[✅ Aprovado:<br/>qualityScore: 70-90]
    CheckResults -->|Não| Approve8[⚠️ Aprovado:<br/>qualityScore: 50]
    
    Start --> ValidateActionResult[validateActionResult<br/>Validação de Ação]
    ValidateActionResult --> CheckAction{Resultado<br/>presente?}
    CheckAction -->|Não| Reject10[❌ Rejeitado:<br/>Resultado vazio]
    CheckAction -->|Sim| CheckActionError{Tem<br/>erro?}
    CheckActionError -->|Sim| Reject11[❌ Rejeitado:<br/>Erro no resultado]
    CheckActionError -->|Não| CheckSuccess{Success<br/>= true?}
    CheckSuccess -->|Sim| Approve9[✅ Aprovado:<br/>qualityScore: 90]
    CheckSuccess -->|Não| Approve10[⚠️ Aprovado:<br/>qualityScore: 50]
    
    Start --> ValidateVisualizations[validateVisualizations<br/>Validação de Visualizações]
    ValidateVisualizations --> CheckVizArray{É array<br/>válido?}
    CheckVizArray -->|Não| Reject12[❌ Rejeitado:<br/>Formato inválido]
    CheckVizArray -->|Sim| CheckVizStructure{Todas têm<br/>estrutura válida?}
    CheckVizStructure -->|Não| Approve11[⚠️ Aprovado:<br/>qualityScore: 40]
    CheckVizStructure -->|Sim| Approve12[✅ Aprovado:<br/>qualityScore: 85]
    
    Start --> ValidateFinal[validateFinal<br/>Validação Final]
    ValidateFinal --> CalcRelevance[calculateRelevance<br/>Calcula Relevância]
    CalcRelevance --> CalcCompleteness[calculateCompleteness<br/>Calcula Completude]
    CalcCompleteness --> CheckQuality{QualityScore<br/>>= threshold?}
    CheckQuality -->|Não| AttemptCorrection[attemptCorrection<br/>Tenta Correção]
    AttemptCorrection --> Reject13[❌ Rejeitado:<br/>Correção falhou]
    CheckQuality -->|Sim| Approve13[✅ Aprovado:<br/>Validação final OK]
    
    style Start fill:#fff3cd
    style Approve1 fill:#d4edda
    style Approve2 fill:#d4edda
    style Approve3 fill:#d4edda
    style Approve4 fill:#fff3cd
    style Approve5 fill:#d4edda
    style Approve6 fill:#d4edda
    style Approve7 fill:#d4edda
    style Approve8 fill:#fff3cd
    style Approve9 fill:#d4edda
    style Approve10 fill:#fff3cd
    style Approve11 fill:#fff3cd
    style Approve12 fill:#d4edda
    style Approve13 fill:#d4edda
    style Reject1 fill:#f8d7da
    style Reject2 fill:#f8d7da
    style Reject3 fill:#f8d7da
    style Reject4 fill:#f8d7da
    style Reject5 fill:#f8d7da
    style Reject6 fill:#f8d7da
    style Reject7 fill:#f8d7da
    style Reject8 fill:#f8d7da
    style Reject9 fill:#f8d7da
    style Reject10 fill:#f8d7da
    style Reject11 fill:#f8d7da
    style Reject12 fill:#f8d7da
    style Reject13 fill:#f8d7da
```

---

## 2. 🎤 VoiceIntentAgent

**Responsabilidade:** Classifica a intenção do usuário e extrai parâmetros do comando

```mermaid
flowchart TD
    Start([VoiceIntentAgent]) --> ClassifyIntent[classifyIntent<br/>Classifica Intenção]
    
    ClassifyIntent --> Normalize[Normalizar texto<br/>para lowercase]
    Normalize --> CheckTemporal{Comparação<br/>temporal?}
    
    CheckTemporal -->|Sim| TemporalIntent[✅ Intent: query_database<br/>confidence: 0.95]
    
    CheckTemporal -->|Não| CheckCompaniesWithout{Empresas sem<br/>colaboradores?}
    CheckCompaniesWithout -->|Sim| CompaniesIntent[✅ Intent: query_database<br/>confidence: 0.95]
    
    CheckCompaniesWithout -->|Não| CheckQueryKeywords{Palavras-chave<br/>de query?}
    CheckQueryKeywords -->|Sim| QueryIntent[✅ Intent: query_database<br/>confidence: 0.9]
    
    CheckQueryKeywords -->|Não| MatchPatterns[Buscar padrões<br/>de intenção]
    MatchPatterns --> FoundPattern{Padrão<br/>encontrado?}
    FoundPattern -->|Sim| PatternIntent[✅ Intent encontrado<br/>confidence: 0.8]
    
    FoundPattern -->|Não| Fallback[⚠️ Fallback:<br/>query_database<br/>confidence: 0.6]
    
    TemporalIntent --> ExtractParams
    CompaniesIntent --> ExtractParams
    QueryIntent --> ExtractParams
    PatternIntent --> ExtractParams
    Fallback --> ExtractParams
    
    ExtractParams[extractParams<br/>Extrai Parâmetros] --> ExtractCNPJ[Extrair CNPJ<br/>regex: \d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}]
    ExtractCNPJ --> ExtractCPF[Extrair CPF<br/>regex: \d{3}\.?\d{3}\.?\d{3}-?\d{2}]
    ExtractCPF --> ExtractID[Extrair ID<br/>regex: id:?\s*(\w+)]
    ExtractID --> ExtractName[Extrair Nome<br/>após palavras-chave]
    ExtractName --> ExtractEmail[Extrair Email<br/>regex: email padrão]
    
    ExtractEmail --> ReturnResult[📤 Retorna Resultado:<br/>intent, params, confidence]
    
    style Start fill:#e1f5ff
    style TemporalIntent fill:#d4edda
    style CompaniesIntent fill:#d4edda
    style QueryIntent fill:#d4edda
    style PatternIntent fill:#d4edda
    style Fallback fill:#fff3cd
    style ReturnResult fill:#d4edda
```

---

## 3. 🔐 PermissionAgent

**Responsabilidade:** Verifica se o usuário tem permissão para executar a ação

```mermaid
flowchart TD
    Start([PermissionAgent]) --> CheckPermission[checkPermission<br/>Verifica Permissão]
    
    CheckPermission --> GetUserRole[Obter role<br/>do usuário]
    GetUserRole --> CheckRole{Role do<br/>usuário?}
    
    CheckRole -->|Admin do Banco| AdminBank[✅ Todas as ações<br/>permitidas]
    
    CheckRole -->|Admin do Cliente| AdminClient{Intent<br/>permitido?}
    AdminClient -->|Gerenciar colaboradores| Allow1[✅ Permitido]
    AdminClient -->|Listar empresas| Allow2[✅ Permitido]
    AdminClient -->|Outros| Deny1[❌ Negado]
    
    CheckRole -->|Usuário Normal| NormalUser{Intent<br/>permitido?}
    NormalUser -->|Leitura| Allow3[✅ Permitido]
    NormalUser -->|Consultas| Allow4[✅ Permitido]
    NormalUser -->|Escrita| Deny2[❌ Negado]
    
    AdminBank --> ReturnAllowed[📤 Retorna:<br/>allowed: true]
    Allow1 --> ReturnAllowed
    Allow2 --> ReturnAllowed
    Allow3 --> ReturnAllowed
    Allow4 --> ReturnAllowed
    Deny1 --> ReturnDenied[📤 Retorna:<br/>allowed: false]
    Deny2 --> ReturnDenied
    
    style Start fill:#e1f5ff
    style AdminBank fill:#d4edda
    style Allow1 fill:#d4edda
    style Allow2 fill:#d4edda
    style Allow3 fill:#d4edda
    style Allow4 fill:#d4edda
    style ReturnAllowed fill:#d4edda
    style Deny1 fill:#f8d7da
    style Deny2 fill:#f8d7da
    style ReturnDenied fill:#f8d7da
```

---

## 4. 📦 ContextAgent

**Responsabilidade:** Coleta contexto do usuário, página e dados relevantes

```mermaid
flowchart TD
    Start([ContextAgent]) --> CollectContext[collectContext<br/>Coleta Contexto]
    
    CollectContext --> CollectUser[Coletar UserContext:<br/>userId, email, role,<br/>companyId, userType]
    CollectUser --> CollectPage[Coletar PageContext:<br/>pathname, search params]
    CollectPage --> CollectData[Coletar DataContext:<br/>Dados adicionais]
    
    CollectData --> BuildContext[Construir objeto<br/>contextResult]
    BuildContext --> ReturnContext[📤 Retorna:<br/>userContext,<br/>pageContext,<br/>dataContext]
    
    style Start fill:#e1f5ff
    style ReturnContext fill:#d4edda
```

---

## 5. 🧠 DatabaseKnowledgeAgent

**Responsabilidade:** Conhece o schema do banco, tecnologias e como operar

```mermaid
flowchart TD
    Start([DatabaseKnowledgeAgent]) --> GetTableInfo[getTableInfo<br/>Obtém Info da Tabela]
    GetTableInfo --> ReturnTableInfo[📤 Retorna:<br/>estrutura da tabela]
    
    Start --> GetAvailableTables[getAvailableTables<br/>Lista Tabelas]
    GetAvailableTables --> ReturnTables[📤 Retorna:<br/>array de tabelas]
    
    Start --> GetTechnologies[getTechnologies<br/>Obtém Tecnologias]
    GetTechnologies --> ReturnTech[📤 Retorna:<br/>Supabase, pgvector,<br/>OpenAI info]
    
    Start --> HasVectorSearch[hasVectorSearch<br/>Verifica Busca Vetorial]
    HasVectorSearch --> CheckVector{Tabela tem<br/>busca vetorial?}
    CheckVector -->|Sim| ReturnTrue[📤 Retorna: true]
    CheckVector -->|Não| ReturnFalse[📤 Retorna: false]
    
    Start --> GetQueryGuidance[getQueryGuidance<br/>Obtém Orientação]
    GetQueryGuidance --> ReturnGuidance[📤 Retorna:<br/>orientação para query]
    
    Start --> SuggestQueryApproach[suggestQueryApproach<br/>Sugere Abordagem]
    SuggestQueryApproach --> ReturnSuggestion[📤 Retorna:<br/>sugestão de abordagem]
    
    style Start fill:#d1ecf1
    style ReturnTableInfo fill:#d4edda
    style ReturnTables fill:#d4edda
    style ReturnTech fill:#d4edda
    style ReturnTrue fill:#d4edda
    style ReturnFalse fill:#fff3cd
    style ReturnGuidance fill:#d4edda
    style ReturnSuggestion fill:#d4edda
```

---

## 6. 🧠 QueryPlanningAgent

**Responsabilidade:** Usa IA (OpenAI) para planejar consultas dinâmicas no banco

```mermaid
flowchart TD
    Start([QueryPlanningAgent]) --> PlanQuery[planQuery<br/>Planeja Query]
    
    PlanQuery --> GetKnowledge[Obter conhecimento<br/>do banco]
    GetKnowledge --> GetSchema[Obter schema<br/>DatabaseKnowledgeAgent]
    GetSchema --> GetTech[Obter tecnologias<br/>DatabaseKnowledgeAgent]
    GetTech --> GetTables[Obter tabelas<br/>disponíveis]
    
    GetTables --> BuildPrompt[buildPlanningPrompt<br/>Construir Prompt]
    BuildPrompt --> CallOpenAI[callOpenAIForPlanning<br/>Chamar OpenAI]
    
    CallOpenAI --> OpenAIAPI[🤖 OpenAI Chat API<br/>/api/openai/chat<br/>Model: gpt-4o-mini]
    OpenAIAPI --> ParseResponse[Parsear resposta<br/>JSON do plano]
    
    ParseResponse --> CheckPlan{Plano<br/>válido?}
    CheckPlan -->|Sim| ReturnPlan[📤 Retorna Plano:<br/>queryType, tables,<br/>strategy, sqlQuery, etc]
    
    CheckPlan -->|Não| Fallback[fallbackPlanning<br/>Usar heurísticas]
    Fallback --> ReturnFallback[📤 Retorna Plano<br/>Fallback]
    
    style Start fill:#d1ecf1
    style OpenAIAPI fill:#e7d4f8
    style ReturnPlan fill:#d4edda
    style ReturnFallback fill:#fff3cd
```

---

## 7. 🔍 DatabaseQueryAgent

**Responsabilidade:** Executa consultas ao banco de dados (SQL, busca semântica, agregações)

```mermaid
flowchart TD
    Start([DatabaseQueryAgent]) --> Query[query<br/>Método Principal]
    
    Query --> PlanWithAI[Consultar QueryPlanningAgent<br/>para planejar com IA]
    PlanWithAI --> CheckPlan{Plano<br/>disponível?}
    
    CheckPlan -->|Sim| ExecutePlanned[executePlannedQuery<br/>Executar Plano]
    CheckPlan -->|Não| SemanticFallback[Busca semântica<br/>genérica]
    
    ExecutePlanned --> CheckSQL{Plano tem<br/>sqlQuery?}
    
    CheckSQL -->|Sim| ExecuteRPC[🔧 Executar via RPC<br/>execute_dynamic_sql]
    ExecuteRPC --> RPCResult{Resultado<br/>RPC?}
    RPCResult -->|Sucesso| FormatSQL[Formatar resultados<br/>SQL]
    RPCResult -->|Erro| DynamicFallback[Fallback:<br/>métodos dinâmicos]
    
    CheckSQL -->|Não| CheckStrategy{Estratégia<br/>do plano?}
    
    CheckStrategy -->|semantic| SemanticSearch[🔍 VectorSearchService<br/>semanticSearch]
    SemanticSearch --> GenerateEmbedding[Gerar embedding<br/>OpenAI Embeddings API]
    GenerateEmbedding --> VectorSearch[Busca vetorial<br/>pgvector]
    VectorSearch --> FormatVector[Formatar resultados<br/>vetoriais]
    
    CheckStrategy -->|hybrid| HybridSearch[🔀 Busca Híbrida<br/>SQL + Vector]
    HybridSearch --> CombineResults[Combinar resultados]
    
    CheckStrategy -->|sql| ExecuteRPC
    
    DynamicFallback --> CheckGroupBy{Precisa<br/>GROUP BY?}
    CheckGroupBy -->|Sim| ExecuteGroupBy[executeDynamicGroupBy<br/>Agrupamento dinâmico]
    CheckGroupBy -->|Não| CheckAggregate{Precisa<br/>agregação?}
    CheckAggregate -->|Sim| ExecuteAggregate[executeDynamicAggregate<br/>Agregação dinâmica]
    
    FormatSQL --> ReturnResults[📤 Retorna Resultado:<br/>results, summary,<br/>chartConfig]
    FormatVector --> ReturnResults
    CombineResults --> ReturnResults
    ExecuteGroupBy --> ReturnResults
    ExecuteAggregate --> ReturnResults
    SemanticFallback --> ReturnResults
    
    style Start fill:#d1ecf1
    style ExecuteRPC fill:#d4edda
    style SemanticSearch fill:#d1ecf1
    style GenerateEmbedding fill:#e7d4f8
    style HybridSearch fill:#fff3cd
    style ReturnResults fill:#d4edda
```

---

## 8. 🏢 CompanyActionAgent

**Responsabilidade:** Gerencia ações relacionadas a empresas

```mermaid
flowchart TD
    Start([CompanyActionAgent]) --> Create[create<br/>Criar Empresa]
    Create --> SupabaseInsert[INSERT INTO companies<br/>Supabase]
    SupabaseInsert --> ReturnCreated[📤 Retorna:<br/>empresa criada]
    
    Start --> List[list<br/>Listar Empresas]
    List --> SupabaseSelect[SELECT FROM companies<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de empresas]
    
    Start --> Update[update<br/>Atualizar Empresa]
    Update --> SupabaseUpdate[UPDATE companies<br/>Supabase]
    SupabaseUpdate --> ReturnUpdated[📤 Retorna:<br/>empresa atualizada]
    
    Start --> Delete[delete<br/>Deletar Empresa]
    Delete --> SupabaseDelete[DELETE FROM companies<br/>Supabase]
    SupabaseDelete --> ReturnDeleted[📤 Retorna:<br/>sucesso]
    
    Start --> GetStats[getStats<br/>Obter Estatísticas]
    GetStats --> CalculateStats[Calcular estatísticas<br/>da empresa]
    CalculateStats --> ReturnStats[📤 Retorna:<br/>estatísticas]
    
    style Start fill:#e1f5ff
    style ReturnCreated fill:#d4edda
    style ReturnList fill:#d4edda
    style ReturnUpdated fill:#d4edda
    style ReturnDeleted fill:#d4edda
    style ReturnStats fill:#d4edda
```

---

## 9. 👥 EmployeeActionAgent

**Responsabilidade:** Gerencia ações relacionadas a colaboradores

```mermaid
flowchart TD
    Start([EmployeeActionAgent]) --> Create[create<br/>Criar Colaborador]
    Create --> SupabaseInsert[INSERT INTO employees<br/>Supabase]
    SupabaseInsert --> ReturnCreated[📤 Retorna:<br/>colaborador criado]
    
    Start --> List[list<br/>Listar Colaboradores]
    List --> SupabaseSelect[SELECT FROM employees<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de colaboradores]
    
    Start --> Update[update<br/>Atualizar Colaborador]
    Update --> SupabaseUpdate[UPDATE employees<br/>Supabase]
    SupabaseUpdate --> ReturnUpdated[📤 Retorna:<br/>colaborador atualizado]
    
    Start --> Delete[delete<br/>Deletar Colaborador]
    Delete --> SupabaseDelete[DELETE FROM employees<br/>Supabase]
    SupabaseDelete --> ReturnDeleted[📤 Retorna:<br/>sucesso]
    
    style Start fill:#e1f5ff
    style ReturnCreated fill:#d4edda
    style ReturnList fill:#d4edda
    style ReturnUpdated fill:#d4edda
    style ReturnDeleted fill:#d4edda
```

---

## 10. 📢 CampaignActionAgent

**Responsabilidade:** Gerencia ações relacionadas a campanhas de marketing

```mermaid
flowchart TD
    Start([CampaignActionAgent]) --> Create[create<br/>Criar Campanha]
    Create --> SupabaseInsert[INSERT INTO campaigns<br/>Supabase]
    SupabaseInsert --> ReturnCreated[📤 Retorna:<br/>campanha criada]
    
    Start --> List[list<br/>Listar Campanhas]
    List --> SupabaseSelect[SELECT FROM campaigns<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de campanhas]
    
    Start --> Update[update<br/>Atualizar Campanha]
    Update --> SupabaseUpdate[UPDATE campaigns<br/>Supabase]
    SupabaseUpdate --> ReturnUpdated[📤 Retorna:<br/>campanha atualizada]
    
    Start --> Delete[delete<br/>Deletar Campanha]
    Delete --> SupabaseDelete[DELETE FROM campaigns<br/>Supabase]
    SupabaseDelete --> ReturnDeleted[📤 Retorna:<br/>sucesso]
    
    Start --> Activate[activate<br/>Ativar Campanha]
    Activate --> SupabaseUpdateStatus[UPDATE campaigns<br/>SET status = 'active']
    SupabaseUpdateStatus --> ReturnActivated[📤 Retorna:<br/>campanha ativada]
    
    Start --> Pause[pause<br/>Pausar Campanha]
    Pause --> SupabasePauseStatus[UPDATE campaigns<br/>SET status = 'paused']
    SupabasePauseStatus --> ReturnPaused[📤 Retorna:<br/>campanha pausada]
    
    style Start fill:#e1f5ff
    style ReturnCreated fill:#d4edda
    style ReturnList fill:#d4edda
    style ReturnUpdated fill:#d4edda
    style ReturnDeleted fill:#d4edda
    style ReturnActivated fill:#d4edda
    style ReturnPaused fill:#d4edda
```

---

## 11. 🎯 ProspectingActionAgent

**Responsabilidade:** Gerencia ações relacionadas a prospecção de clientes

```mermaid
flowchart TD
    Start([ProspectingActionAgent]) --> List[list<br/>Listar Prospects]
    List --> SupabaseSelect[SELECT FROM prospects<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de prospects]
    
    Start --> Enrich[enrich<br/>Enriquecer Prospect]
    Enrich --> FetchExternalData[Buscar dados externos<br/>APIs de enriquecimento]
    FetchExternalData --> SupabaseUpdate[UPDATE prospects<br/>com dados enriquecidos]
    SupabaseUpdate --> ReturnEnriched[📤 Retorna:<br/>prospect enriquecido]
    
    Start --> Qualify[qualify<br/>Qualificar Prospect]
    Qualify --> CalculateScore[Calcular score<br/>de qualificação]
    CalculateScore --> SupabaseUpdateScore[UPDATE prospects<br/>SET score]
    SupabaseUpdateScore --> ReturnQualified[📤 Retorna:<br/>prospect qualificado]
    
    Start --> CalculateScore[calculateScore<br/>Calcular Score]
    CalculateScore --> ReturnScore[📤 Retorna:<br/>score calculado]
    
    Start --> RecommendProducts[recommendProducts<br/>Recomendar Produtos]
    RecommendProducts --> AnalyzeProspect[Analisar prospect<br/>e histórico]
    AnalyzeProspect --> MatchProducts[Fazer match<br/>com produtos]
    MatchProducts --> ReturnRecommendations[📤 Retorna:<br/>produtos recomendados]
    
    style Start fill:#e1f5ff
    style ReturnList fill:#d4edda
    style ReturnEnriched fill:#d4edda
    style ReturnQualified fill:#d4edda
    style ReturnScore fill:#d4edda
    style ReturnRecommendations fill:#d4edda
```

---

## 12. 💰 BenefitActionAgent

**Responsabilidade:** Gerencia ações relacionadas a benefícios

```mermaid
flowchart TD
    Start([BenefitActionAgent]) --> Create[create<br/>Criar Benefício]
    Create --> SupabaseInsert[INSERT INTO benefits<br/>Supabase]
    SupabaseInsert --> ReturnCreated[📤 Retorna:<br/>benefício criado]
    
    Start --> List[list<br/>Listar Benefícios]
    List --> SupabaseSelect[SELECT FROM benefits<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de benefícios]
    
    Start --> Update[update<br/>Atualizar Benefício]
    Update --> SupabaseUpdate[UPDATE benefits<br/>Supabase]
    SupabaseUpdate --> ReturnUpdated[📤 Retorna:<br/>benefício atualizado]
    
    Start --> Delete[delete<br/>Deletar Benefício]
    Delete --> SupabaseDelete[DELETE FROM benefits<br/>Supabase]
    SupabaseDelete --> ReturnDeleted[📤 Retorna:<br/>sucesso]
    
    style Start fill:#e1f5ff
    style ReturnCreated fill:#d4edda
    style ReturnList fill:#d4edda
    style ReturnUpdated fill:#d4edda
    style ReturnDeleted fill:#d4edda
```

---

## 13. 📦 ProductActionAgent

**Responsabilidade:** Gerencia ações relacionadas a produtos financeiros

```mermaid
flowchart TD
    Start([ProductActionAgent]) --> List[list<br/>Listar Produtos]
    List --> SupabaseSelect[SELECT FROM products<br/>Supabase]
    SupabaseSelect --> ReturnList[📤 Retorna:<br/>array de produtos]
    
    Start --> Recommend[recommend<br/>Recomendar Produto]
    Recommend --> AnalyzeEmployee[Analisar perfil<br/>do colaborador]
    AnalyzeEmployee --> MatchProduct[Fazer match<br/>com produtos]
    MatchProduct --> ReturnRecommendation[📤 Retorna:<br/>produto recomendado]
    
    style Start fill:#e1f5ff
    style ReturnList fill:#d4edda
    style ReturnRecommendation fill:#d4edda
```

---

## 14. 🔌 IntegrationActionAgent

**Responsabilidade:** Gerencia ações relacionadas a integrações externas

```mermaid
flowchart TD
    Start([IntegrationActionAgent]) --> Sync[sync<br/>Sincronizar Dados]
    Sync --> ConnectExternal[Conectar com<br/>serviço externo]
    ConnectExternal --> FetchData[Buscar dados<br/>da integração]
    FetchData --> SyncSupabase[Sincronizar com<br/>Supabase]
    SyncSupabase --> ReturnSynced[📤 Retorna:<br/>dados sincronizados]
    
    Start --> TestConnection[testConnection<br/>Testar Conexão]
    TestConnection --> PingExternal[Fazer ping<br/>no serviço externo]
    PingExternal --> CheckResponse{Resposta<br/>OK?}
    CheckResponse -->|Sim| ReturnSuccess[📤 Retorna:<br/>conexão OK]
    CheckResponse -->|Não| ReturnError[📤 Retorna:<br/>erro de conexão]
    
    style Start fill:#e1f5ff
    style ReturnSynced fill:#d4edda
    style ReturnSuccess fill:#d4edda
    style ReturnError fill:#f8d7da
```

---

## 15. 📊 DataVisualizationAgent

**Responsabilidade:** Gera visualizações de dados (gráficos, tabelas, cards)

```mermaid
flowchart TD
    Start([DataVisualizationAgent]) --> GenerateViz[generateVisualizations<br/>Gera Visualizações]
    
    GenerateViz --> CheckActionResult{ActionResult<br/>presente?}
    CheckActionResult -->|Não| ReturnEmpty[📤 Retorna:<br/>array vazio]
    
    CheckActionResult -->|Sim| CheckCount{É contagem?}
    CheckCount -->|Sim| CreateCard[📴 Criar Card<br/>visualizationData]
    CreateCard --> ReturnCard[📤 Retorna:<br/>card visualization]
    
    CheckCount -->|Não| CheckAggregate{É agregação<br/>agrupada?}
    CheckAggregate -->|Sim| CheckChartConfig{Tem<br/>chartConfig?}
    CheckChartConfig -->|Sim| CreateChart[📊 Criar Gráfico<br/>BarChart/LineChart/PieChart]
    CreateChart --> ReturnChart[📤 Retorna:<br/>chart visualization]
    
    CheckAggregate -->|Não| CheckTimeSeries{É série<br/>temporal?}
    CheckTimeSeries -->|Sim| CreateLineChart[📈 Criar LineChart<br/>com dados temporais]
    CreateLineChart --> ReturnLineChart[📤 Retorna:<br/>line chart]
    
    CheckTimeSeries -->|Não| CheckResults{Tem<br/>resultados?}
    CheckResults -->|Sim| CreateTable[📋 Criar Tabela<br/>com resultados]
    CreateTable --> ReturnTable[📤 Retorna:<br/>table visualization]
    
    CheckResults -->|Não| ReturnEmpty
    
    style Start fill:#d1ecf1
    style CreateCard fill:#d4edda
    style CreateChart fill:#d4edda
    style CreateLineChart fill:#d4edda
    style CreateTable fill:#d4edda
    style ReturnCard fill:#d4edda
    style ReturnChart fill:#d4edda
    style ReturnLineChart fill:#d4edda
    style ReturnTable fill:#d4edda
    style ReturnEmpty fill:#fff3cd
```

---

## 16. 💬 FeedbackAgent

**Responsabilidade:** Gera resposta textual para o usuário usando IA

```mermaid
flowchart TD
    Start([FeedbackAgent]) --> GenerateFeedback[generateFeedback<br/>Gera Feedback]
    
    GenerateFeedback --> CheckSuccess{ActionResult<br/>sucesso?}
    CheckSuccess -->|Não| ReturnError[📤 Retorna:<br/>feedback de erro]
    
    CheckSuccess -->|Sim| CheckIntent{Tipo de<br/>Intent?}
    
    CheckIntent -->|query_database| GenerateInterpreted[generateInterpretedResponse<br/>Gerar Resposta Interpretada]
    GenerateInterpreted --> BuildPrompt[Construir prompt<br/>com pergunta e dados]
    BuildPrompt --> CallOpenAI[🤖 OpenAI Chat API<br/>/api/openai/chat<br/>Model: gpt-4o-mini]
    CallOpenAI --> ParseResponse[Parsear resposta<br/>interpretada]
    ParseResponse --> ReturnInterpreted[📤 Retorna:<br/>resposta interpretada]
    
    CheckIntent -->|create_*| CreateMessage[Gerar mensagem:<br/>"X criado com sucesso!"]
    CreateMessage --> ReturnCreate[📤 Retorna:<br/>mensagem de criação]
    
    CheckIntent -->|list_*| ListMessage[Gerar mensagem:<br/>"Encontrei N X"]
    ListMessage --> ReturnList[📤 Retorna:<br/>mensagem de listagem]
    
    CheckIntent -->|update_*| UpdateMessage[Gerar mensagem:<br/>"X atualizado com sucesso!"]
    UpdateMessage --> ReturnUpdate[📤 Retorna:<br/>mensagem de atualização]
    
    CheckIntent -->|delete_*| DeleteMessage[Gerar mensagem:<br/>"X removido com sucesso!"]
    DeleteMessage --> ReturnDelete[📤 Retorna:<br/>mensagem de remoção]
    
    CheckIntent -->|other| GenericMessage[Gerar mensagem:<br/>"Ação executada com sucesso!"]
    GenericMessage --> ReturnGeneric[📤 Retorna:<br/>mensagem genérica]
    
    ReturnInterpreted --> AddVoiceConfig[Adicionar voiceConfig:<br/>speed, pitch]
    ReturnCreate --> AddVoiceConfig
    ReturnList --> AddVoiceConfig
    ReturnUpdate --> AddVoiceConfig
    ReturnDelete --> AddVoiceConfig
    ReturnGeneric --> AddVoiceConfig
    
    AddVoiceConfig --> ReturnFinal[📤 Retorna Feedback Final:<br/>text, voiceConfig,<br/>visualizations]
    
    style Start fill:#d1ecf1
    style CallOpenAI fill:#e7d4f8
    style ReturnInterpreted fill:#d4edda
    style ReturnCreate fill:#d4edda
    style ReturnList fill:#d4edda
    style ReturnUpdate fill:#d4edda
    style ReturnDelete fill:#d4edda
    style ReturnGeneric fill:#d4edda
    style ReturnFinal fill:#d4edda
    style ReturnError fill:#f8d7da
```

---

## 17. 💡 SuggestionAgent

**Responsabilidade:** Gera sugestões de próximas ações baseadas no contexto

```mermaid
flowchart TD
    Start([SuggestionAgent]) --> GenerateSuggestions[generateSuggestions<br/>Gera Sugestões]
    
    GenerateSuggestions --> GetHistory[Obter histórico<br/>MemoryResourceAgent]
    GetHistory --> AnalyzeContext[Analisar contexto:<br/>text, intent, actionResult]
    
    AnalyzeContext --> CheckIntent{Tipo de<br/>Intent?}
    
    CheckIntent -->|query_database| SuggestQueries[Sugerir queries<br/>relacionadas]
    SuggestQueries --> ReturnQuerySuggestions[📤 Retorna:<br/>sugestões de queries]
    
    CheckIntent -->|list_companies| SuggestCompanyActions[Sugerir ações<br/>de empresas]
    SuggestCompanyActions --> ReturnCompanySuggestions[📤 Retorna:<br/>sugestões de empresas]
    
    CheckIntent -->|list_employees| SuggestEmployeeActions[Sugerir ações<br/>de colaboradores]
    SuggestEmployeeActions --> ReturnEmployeeSuggestions[📤 Retorna:<br/>sugestões de colaboradores]
    
    CheckIntent -->|other| SuggestGeneric[Sugerir ações<br/>genéricas]
    SuggestGeneric --> ReturnGenericSuggestions[📤 Retorna:<br/>sugestões genéricas]
    
    style Start fill:#d1ecf1
    style ReturnQuerySuggestions fill:#d4edda
    style ReturnCompanySuggestions fill:#d4edda
    style ReturnEmployeeSuggestions fill:#d4edda
    style ReturnGenericSuggestions fill:#d4edda
```

---

## 18. 🧠 MemoryResourceAgent

**Responsabilidade:** Monitora e otimiza memória e histórico de conversação

```mermaid
flowchart TD
    Start([MemoryResourceAgent]) --> OptimizeBefore[optimizeBeforeProcessing<br/>Otimização Antes]
    OptimizeBefore --> CheckMemoryUsage[Verificar uso<br/>de memória]
    CheckMemoryUsage --> EstimateUsage[estimateMemoryUsage<br/>Estimar uso]
    EstimateUsage --> CheckThreshold{Uso ><br/>threshold?}
    CheckThreshold -->|Sim| CleanupCache[cleanupCache<br/>Limpar cache]
    CheckThreshold -->|Não| Continue[Continuar<br/>processamento]
    CleanupCache --> Continue
    
    Start --> OptimizeAfter[optimizeAfterProcessing<br/>Otimização Depois]
    OptimizeAfter --> CheckMemoryAfter[Verificar uso<br/>após processamento]
    CheckMemoryAfter --> CleanupIfNeeded[Limpar se<br/>necessário]
    CleanupIfNeeded --> ReturnOptimized[📤 Retorna:<br/>otimizado]
    
    Start --> UpdateHistory[updateHistory<br/>Atualizar Histórico]
    UpdateHistory --> AddEntry[Adicionar entrada<br/>ao histórico]
    AddEntry --> TrimHistory[Manter apenas<br/>últimas 10 mensagens]
    TrimHistory --> ReturnUpdated[📤 Retorna:<br/>histórico atualizado]
    
    Start --> GetHistory[getConversationHistory<br/>Obter Histórico]
    GetHistory --> ReturnHistory[📤 Retorna:<br/>últimas 10 mensagens]
    
    style Start fill:#d1ecf1
    style Continue fill:#d4edda
    style ReturnOptimized fill:#d4edda
    style ReturnUpdated fill:#d4edda
    style ReturnHistory fill:#d4edda
```

---

## 📊 Resumo dos Agentes

| # | Agente | Responsabilidade Principal | Interações com IA |
|---|--------|---------------------------|-------------------|
| 1 | SupervisorAgent | Validação e monitoramento | ❌ |
| 2 | VoiceIntentAgent | Classificação de intenções | ❌ |
| 3 | PermissionAgent | Verificação de permissões | ❌ |
| 4 | ContextAgent | Coleta de contexto | ❌ |
| 5 | DatabaseKnowledgeAgent | Conhecimento do banco | ❌ |
| 6 | QueryPlanningAgent | Planejamento de queries | ✅ OpenAI Chat |
| 7 | DatabaseQueryAgent | Execução de queries | ❌ |
| 8 | CompanyActionAgent | Gestão de empresas | ❌ |
| 9 | EmployeeActionAgent | Gestão de colaboradores | ❌ |
| 10 | CampaignActionAgent | Gestão de campanhas | ❌ |
| 11 | ProspectingActionAgent | Prospecção de clientes | ❌ |
| 12 | BenefitActionAgent | Gestão de benefícios | ❌ |
| 13 | ProductActionAgent | Produtos financeiros | ❌ |
| 14 | IntegrationActionAgent | Integrações externas | ❌ |
| 15 | DataVisualizationAgent | Geração de visualizações | ❌ |
| 16 | FeedbackAgent | Geração de feedback | ✅ OpenAI Chat |
| 17 | SuggestionAgent | Geração de sugestões | ❌ |
| 18 | MemoryResourceAgent | Gerenciamento de memória | ❌ |

---

**Última atualização:** 2024  
**Versão do Sistema:** BMAD v1.0

