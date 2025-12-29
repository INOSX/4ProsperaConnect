# 🏛️ Padrão NEX/FLX/AGX/OPX/ORDX - Documentação Completa

## 📖 Visão Geral

O padrão **NEX/FLX/AGX/OPX/ORDX** é uma arquitetura de agentes especializados desenvolvida para o sistema 4Prospera Connect. Este padrão organiza os agentes em cinco categorias funcionais distintas, cada uma com um propósito específico no processamento de comandos e execução de ações.

---

## 🎯 Filosofia do Padrão

O padrão NEX/FLX/AGX/OPX/ORDX foi criado para substituir a nomenclatura genérica "BMAD" (Behavior, Model, Agent, Data) por uma classificação mais precisa e descritiva baseada nas funções reais de cada agente no sistema.

### Princípios Fundamentais

1. **Especialização por Função**: Cada agente é classificado pela sua função primária no sistema
2. **Clareza Semântica**: Os nomes das categorias refletem diretamente o papel de cada agente
3. **Organização Hierárquica**: A estrutura permite fácil identificação e manutenção
4. **Escalabilidade**: Facilita a adição de novos agentes seguindo o padrão estabelecido

---

## 🔷 NEX - Nexus (Conexão, Orquestração)

**Significado**: Nexus (latim) = conexão, ponto de ligação, centro de convergência

### Definição

**NEX** representa o **orquestrador central** do sistema, responsável por coordenar e conectar todos os outros agentes. É o ponto central que gerencia o fluxo completo de processamento.

### Características

- ✅ **Orquestração Central**: Coordena todos os agentes do sistema
- ✅ **Gerenciamento de Fluxo**: Controla as 12 etapas do processamento
- ✅ **Conexão entre Agentes**: Facilita a comunicação entre diferentes tipos de agentes
- ✅ **Ponto Único de Entrada**: Recebe comandos e distribui para os agentes apropriados

### Agentes NEX

| Agente | Responsabilidade |
|--------|------------------|
| **NEXOrchestrator** | Orquestrador principal que coordena todos os agentes e gerencia o fluxo completo de processamento |

### Exemplo de Uso

```javascript
// O NEXOrchestrator recebe o comando e orquestra todo o processamento
const orchestrator = new NEXOrchestrator()
const result = await orchestrator.processCommand(text, user, context)
```

### Logs

```
[NEX:Orchestrator] 🚀 Starting command processing
[NEX:Orchestrator] 📋 Step 1/12: Initial validation
[NEX:Orchestrator] ✅ Command processing finished successfully
```

---

## 📐 ORDX - Ordo (Ordem, Workflow Estruturado)

**Significado**: Ordo (latim) = ordem, organização, estrutura, sequência

### Definição

**ORDX** representa agentes responsáveis por **estruturar, validar e organizar** o fluxo de processamento. Estes agentes garantem que tudo esteja em ordem antes, durante e depois da execução.

### Características

- ✅ **Validação e Controle**: Garantem qualidade e consistência
- ✅ **Estruturação de Dados**: Organizam informações de forma estruturada
- ✅ **Workflow Management**: Gerenciam a ordem e sequência de operações
- ✅ **Controle de Acesso**: Verificam permissões e regras

### Agentes ORDX

| Agente | Responsabilidade |
|--------|------------------|
| **SupervisorAgent** | Monitora e valida todas as ações em cada etapa do fluxo |
| **PermissionAgent** | Verifica permissões do usuário para executar ações |
| **ContextAgent** | Coleta e estrutura contexto do usuário, página e dados |
| **MemoryResourceAgent** | Gerencia memória e histórico de forma organizada |

### Exemplo de Uso

```javascript
// ORDX agents garantem ordem e validação
const supervisor = new SupervisorAgent()
const validation = await supervisor.validateInitial(text)

const permission = new PermissionAgent()
const allowed = await permission.checkPermission(intent, user, params)
```

### Logs

```
[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO INICIAL ==========
[ORDX:PermissionAgent] 🔐 ========== VERIFICANDO PERMISSÕES ==========
[ORDX:ContextAgent] 📦 ========== COLETANDO CONTEXTO ==========
[ORDX:MemoryResourceAgent] 🧹 ========== OTIMIZAÇÃO DE MEMÓRIA ==========
```

---

## 🌊 FLX - Fluxus (Fluxo Contínuo)

**Significado**: Fluxus (latim) = fluxo, corrente, movimento contínuo

### Definição

**FLX** representa agentes responsáveis por **gerenciar o fluxo de informações e decisões** no sistema. Estes agentes processam dados de forma contínua e dinâmica, criando um fluxo suave de informações.

### Características

- ✅ **Processamento Contínuo**: Trabalham com fluxos de dados
- ✅ **Classificação e Planejamento**: Analisam e planejam ações
- ✅ **Sugestões Dinâmicas**: Geram sugestões baseadas no contexto
- ✅ **Fluxo de Decisões**: Facilitam a tomada de decisões

### Agentes FLX

| Agente | Responsabilidade |
|--------|------------------|
| **VoiceIntentAgent** | Classifica intenções e extrai parâmetros dos comandos |
| **QueryPlanningAgent** | Planeja consultas dinâmicas usando IA |
| **SuggestionAgent** | Gera sugestões de próximas ações baseadas no contexto |

### Exemplo de Uso

```javascript
// FLX agents gerenciam o fluxo de informações
const voiceIntent = new VoiceIntentAgent()
const intentResult = await voiceIntent.classifyIntent(text, user)

const queryPlanning = new QueryPlanningAgent()
const plan = await queryPlanning.planQuery(userQuery, intent, context)
```

### Logs

```
[FLX:VoiceIntentAgent] 🔍 ========== CLASSIFICANDO INTENÇÃO ==========
[FLX:QueryPlanningAgent] 🧠 ========== INICIANDO PLANEJAMENTO DE QUERY ==========
[FLX:SuggestionAgent] 💡 ========== GERANDO SUGESTÕES ==========
```

---

## ⚡ AGX - Agens (Aquele que Age)

**Significado**: Agens (latim) = aquele que age, executor, agente de ação

### Definição

**AGX** representa agentes responsáveis por **executar ações específicas de domínio**. Estes são os agentes que realmente "fazem coisas" no sistema, executando operações CRUD e ações de negócio.

### Características

- ✅ **Execução de Ações**: Realizam operações concretas no sistema
- ✅ **Domínio Específico**: Cada agente é especializado em um domínio
- ✅ **Operações CRUD**: Criar, ler, atualizar e deletar entidades
- ✅ **Ações de Negócio**: Executam lógicas de negócio específicas

### Agentes AGX

| Agente | Responsabilidade |
|--------|------------------|
| **CompanyActionAgent** | Gerencia ações relacionadas a empresas |
| **EmployeeActionAgent** | Gerencia ações relacionadas a colaboradores |
| **CampaignActionAgent** | Gerencia ações relacionadas a campanhas de marketing |
| **ProspectingActionAgent** | Gerencia ações relacionadas a prospecção de clientes |
| **BenefitActionAgent** | Gerencia ações relacionadas a benefícios |
| **ProductActionAgent** | Gerencia ações relacionadas a produtos financeiros |
| **IntegrationActionAgent** | Gerencia ações relacionadas a integrações externas |

### Exemplo de Uso

```javascript
// AGX agents executam ações de domínio
const companyAgent = new CompanyActionAgent()
const companies = await companyAgent.list(params, user, context)

const employeeAgent = new EmployeeActionAgent()
const newEmployee = await employeeAgent.create(params, user, context)
```

### Logs

```
[AGX:CompanyActionAgent] 🏢 ========== LISTANDO EMPRESAS ==========
[AGX:EmployeeActionAgent] 👥 ========== CRIANDO COLABORADOR ==========
[AGX:CampaignActionAgent] 📢 ========== ATIVANDO CAMPANHA ==========
```

---

## 🔧 OPX - Opus (Obra, Execução, Trabalho)

**Significado**: Opus (latim) = obra, trabalho, execução, resultado

### Definição

**OPX** representa agentes responsáveis por **executar trabalhos técnicos e especializados**. Estes agentes realizam operações complexas que requerem conhecimento técnico profundo e processamento avançado.

### Características

- ✅ **Execução Técnica**: Realizam operações técnicas complexas
- ✅ **Processamento Avançado**: Usam IA, algoritmos e técnicas avançadas
- ✅ **Geração de Resultados**: Produzem outputs formatados e processados
- ✅ **Especialização Técnica**: Requerem conhecimento técnico profundo

### Agentes OPX

| Agente | Responsabilidade |
|--------|------------------|
| **DatabaseQueryAgent** | Executa consultas ao banco (SQL, busca semântica, agregações) |
| **DatabaseKnowledgeAgent** | Conhece o schema do banco, tecnologias e como operar |
| **DataVisualizationAgent** | Gera visualizações de dados (gráficos, tabelas, cards) |
| **FeedbackAgent** | Gera resposta textual interpretada para o usuário usando IA |
| **VectorSearchService** | Realiza buscas semânticas usando embeddings vetoriais |
| **EmbeddingGenerator** | Gera embeddings vetoriais usando OpenAI Embeddings API |

### Exemplo de Uso

```javascript
// OPX agents executam trabalhos técnicos especializados
const databaseQuery = new DatabaseQueryAgent()
const results = await databaseQuery.query(text, user, context, params)

const visualization = new DataVisualizationAgent()
const charts = await visualization.generateVisualizations(actionResult, intent)
```

### Logs

```
[OPX:DatabaseQueryAgent] 🔍 ========== PROCESSANDO CONSULTA ==========
[OPX:DataVisualizationAgent] 📊 ========== GERANDO VISUALIZAÇÕES ==========
[OPX:FeedbackAgent] 💬 ========== GERANDO FEEDBACK ==========
[OPX:VectorSearchService] 🔍 ========== BUSCA SEMÂNTICA ==========
```

---

## 🔄 Fluxo de Processamento com NEX/FLX/AGX/OPX/ORDX

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    NEX:Orchestrator                         │
│              (Orquestração Central)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ORDX: Validação e Estruturação      │
        │  - SupervisorAgent (validação)        │
        │  - PermissionAgent (permissões)       │
        │  - ContextAgent (contexto)            │
        │  - MemoryResourceAgent (memória)      │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   FLX: Fluxo de Informações           │
        │  - VoiceIntentAgent (classificação)   │
        │  - QueryPlanningAgent (planejamento)   │
        │  - SuggestionAgent (sugestões)         │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   AGX: Execução de Ações             │
        │  - CompanyActionAgent                 │
        │  - EmployeeActionAgent                │
        │  - CampaignActionAgent                │
        │  - ProspectingActionAgent             │
        │  - BenefitActionAgent                 │
        │  - ProductActionAgent                 │
        │  - IntegrationActionAgent             │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   OPX: Execução Técnica              │
        │  - DatabaseQueryAgent                 │
        │  - DatabaseKnowledgeAgent             │
        │  - DataVisualizationAgent             │
        │  - FeedbackAgent                      │
        │  - VectorSearchService                │
        │  - EmbeddingGenerator                 │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ORDX: Validação Final              │
        │  - SupervisorAgent (validação final)    │
        │  - MemoryResourceAgent (atualização)  │
        └───────────────────────────────────────┘
```

### Fluxo Detalhado (12 Etapas)

1. **ORDX**: Validação Inicial (SupervisorAgent)
2. **FLX**: Classificação de Intenção (VoiceIntentAgent)
3. **ORDX**: Validação de Permissões (PermissionAgent)
4. **ORDX**: Coleta de Contexto (ContextAgent)
5. **ORDX**: Otimização de Memória (Antes) (MemoryResourceAgent)
6. **AGX/OPX**: Execução de Ação (Agentes de Domínio ou DatabaseQueryAgent)
7. **OPX**: Geração de Visualizações (DataVisualizationAgent)
8. **OPX**: Geração de Feedback (FeedbackAgent)
9. **ORDX**: Otimização de Memória (Depois) (MemoryResourceAgent)
10. **ORDX**: Validação Final (SupervisorAgent)
11. **FLX**: Geração de Sugestões (SuggestionAgent)
12. **ORDX**: Atualização de Histórico (MemoryResourceAgent)

---

## 📊 Resumo por Categoria

| Categoria | Quantidade | Função Principal | Exemplo |
|-----------|-----------|------------------|---------|
| **NEX** | 1 | Orquestração | NEXOrchestrator |
| **ORDX** | 4 | Ordem/Validação | SupervisorAgent, PermissionAgent, ContextAgent, MemoryResourceAgent |
| **FLX** | 3 | Fluxo/Planejamento | VoiceIntentAgent, QueryPlanningAgent, SuggestionAgent |
| **AGX** | 7 | Ação/Domínio | CompanyActionAgent, EmployeeActionAgent, etc. |
| **OPX** | 6 | Execução Técnica | DatabaseQueryAgent, DataVisualizationAgent, etc. |
| **TOTAL** | **21** | - | - |

---

## 🎨 Convenções de Nomenclatura

### Logs

Todos os logs seguem o padrão:
```
[CATEGORIA:AgentName] 🎯 Mensagem
```

Exemplos:
- `[NEX:Orchestrator] 🚀 Starting command processing`
- `[ORDX:SupervisorAgent] 🔍 Validating initial input`
- `[FLX:VoiceIntentAgent] ✅ Intent classified`
- `[AGX:CompanyActionAgent] 🏢 Listing companies`
- `[OPX:DatabaseQueryAgent] 🔍 Processing query`

### Imports

```javascript
// NEX
import NEXOrchestrator from './services/bmad/bmadOrchestrator'

// ORDX
import SupervisorAgent from './agents/SupervisorAgent'
import PermissionAgent from './agents/PermissionAgent'

// FLX
import VoiceIntentAgent from './agents/VoiceIntentAgent'
import QueryPlanningAgent from './agents/QueryPlanningAgent'

// AGX
import CompanyActionAgent from './agents/CompanyActionAgent'
import EmployeeActionAgent from './agents/EmployeeActionAgent'

// OPX
import DatabaseQueryAgent from './agents/DatabaseQueryAgent'
import DataVisualizationAgent from './agents/DataVisualizationAgent'
```

---

## 🔍 Identificando a Categoria de um Agente

Para identificar a categoria de um novo agente, pergunte:

1. **É o orquestrador central?** → **NEX**
2. **Valida, estrutura ou organiza?** → **ORDX**
3. **Gerencia fluxo, classifica ou planeja?** → **FLX**
4. **Executa ações de domínio/negócio?** → **AGX**
5. **Executa trabalhos técnicos especializados?** → **OPX**

---

## 📚 Referências

- **Documentação Completa dos Agentes**: `DOCUMENTACAO_AGENTES_BMAD.md`
- **Diagramas Mermaid**: `DIAGRAMAS_AGENTES_BMAD.md`
- **Fluxo Completo**: `FLUXO_ESPECIALISTA_BMAD.md`
- **Módulo Especialista IA**: `docs/MODULO_ESPECIALISTA_IA.md`

---

## 🚀 Benefícios do Padrão

1. **Clareza**: Fácil identificação da função de cada agente
2. **Organização**: Estrutura lógica e hierárquica
3. **Manutenibilidade**: Facilita manutenção e extensão
4. **Documentação**: Nomenclatura auto-explicativa
5. **Escalabilidade**: Padrão claro para adicionar novos agentes
6. **Debugging**: Logs categorizados facilitam identificação de problemas

---

**Última atualização:** Janeiro 2025  
**Versão do Padrão:** NEX/FLX/AGX/OPX/ORDX v1.0

