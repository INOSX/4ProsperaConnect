# Módulo Especialista IA - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura NEX/FLX/AGX/OPX/ORDX](#arquitetura-nexflxagxopxordx)
3. [Funcionalidades](#funcionalidades)
4. [Como Usar](#como-usar)
5. [Comandos Disponíveis](#comandos-disponíveis)
6. [Sistema de Vetorização](#sistema-de-vetorização)
7. [Agentes NEX/FLX/AGX/OPX/ORDX](#agentes-nexflxagxopxordx)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Módulo Especialista IA** é um assistente virtual inteligente que permite interagir com toda a plataforma 4Prospera Connect usando **comandos de voz**. O especialista utiliza a arquitetura **NEX/FLX/AGX/OPX/ORDX** para processar comandos, executar ações e fornecer insights sobre seus dados.

### Características Principais

- ✅ **Comandos de Voz**: Interaja naturalmente usando sua voz
- ✅ **Execução de Ações**: Execute todas as ações da plataforma via voz
- ✅ **Consultas ao Banco**: Faça perguntas complexas sobre seus dados
- ✅ **Busca Semântica**: Encontre informações usando linguagem natural
- ✅ **Visualizações Automáticas**: Gráficos e tabelas gerados automaticamente
- ✅ **Sugestões Inteligentes**: Receba sugestões de próximas ações

---

## 🏗️ Arquitetura NEX/FLX/AGX/OPX/ORDX

O sistema utiliza o padrão **NEX/FLX/AGX/OPX/ORDX**, que organiza os agentes em cinco categorias funcionais:

> 📖 **Documentação completa do padrão**: [`PADRAO_NEX_FLX_AGX_OPX_ORDX.md`](../PADRAO_NEX_FLX_AGX_OPX_ORDX.md)

### 🔷 NEX (Nexus - Orquestração)
- **NEXOrchestrator**: Orquestrador central que coordena todos os agentes

### 📐 ORDX (Ordo - Ordem, Workflow Estruturado)
- **SupervisorAgent**: Validação e monitoramento
- **PermissionAgent**: Verificação de permissões
- **ContextAgent**: Coleta de contexto
- **MemoryResourceAgent**: Gerenciamento de memória

### 🌊 FLX (Fluxus - Fluxo Contínuo)
- **VoiceIntentAgent**: Classificação de intenções
- **QueryPlanningAgent**: Planejamento de queries com IA
- **SuggestionAgent**: Geração de sugestões

### ⚡ AGX (Agens - Aquele que Age)
- **CompanyActionAgent**: Gestão de empresas
- **EmployeeActionAgent**: Gestão de colaboradores
- **CampaignActionAgent**: Gestão de campanhas
- **ProspectingActionAgent**: Prospecção de clientes
- **BenefitActionAgent**: Gestão de benefícios
- **ProductActionAgent**: Produtos financeiros
- **IntegrationActionAgent**: Integrações externas

### 🔧 OPX (Opus - Obra, Execução, Trabalho)
- **DatabaseQueryAgent**: Consultas SQL e busca semântica
- **DatabaseKnowledgeAgent**: Conhecimento do banco
- **DataVisualizationAgent**: Geração de visualizações
- **FeedbackAgent**: Geração de respostas com IA
- **VectorSearchService**: Busca vetorial
- **EmbeddingGenerator**: Geração de embeddings

---

## 🚀 Funcionalidades

### 1. Comandos de Voz

Fale naturalmente com o especialista:

- **"Listar todas as empresas"**
- **"Criar um novo colaborador chamado João Silva"**
- **"Mostrar estatísticas da empresa Messiax"**
- **"Encontrar empresas similares à Messiax"**

### 2. Execução de Ações

O especialista pode executar todas as ações da plataforma:

- ✅ Criar, editar, deletar empresas
- ✅ Gerenciar colaboradores
- ✅ Criar e gerenciar campanhas
- ✅ Qualificar e enriquecer prospects
- ✅ Gerenciar benefícios e produtos
- ✅ Sincronizar integrações

### 3. Consultas ao Banco de Dados

Faça perguntas complexas:

- **"Quantas empresas temos cadastradas?"**
- **"Quais colaboradores trabalham na área de tecnologia?"**
- **"Mostre os prospects com maior potencial de conversão"**
- **"Quais empresas não têm colaboradores ativos?"**

### 4. Busca Semântica

Encontre informações usando linguagem natural:

- **"Encontrar empresas de tecnologia"**
- **"Mostrar prospects interessados em produtos financeiros"**
- **"Empresas similares à Messiax"**

### 5. Visualizações Automáticas

O especialista gera visualizações automaticamente:

- 📊 Gráficos de barras
- 📈 Gráficos de linha
- 🥧 Gráficos de pizza
- 📋 Tabelas de dados
- 🎴 Cards de métricas

---

## 📖 Como Usar

### Passo 1: Acessar o Módulo

1. Na página inicial, clique no card **"Especialista IA"**
2. Ou acesse diretamente: `/specialist`

### Passo 2: Conectar o Especialista

1. Clique no botão **"Conectar"**
2. Aguarde a conexão (alguns segundos)
3. O avatar do especialista aparecerá no vídeo

### Passo 3: Fazer Perguntas

1. Clique no botão **"Enviar Áudio"** (ou "Falar com Especialista")
2. Fale seu comando ou pergunta
3. Clique novamente para parar a gravação
4. Aguarde a resposta do especialista

### Passo 4: Ver Resultados

- **Histórico**: Veja comandos e respostas no histórico
- **Visualizações**: Gráficos e tabelas aparecem automaticamente
- **Sugestões**: Receba sugestões de próximas ações

---

## 🎤 Comandos Disponíveis

### Gestão de Empresas

```
"Listar todas as empresas"
"Criar uma nova empresa chamada Messiax com CNPJ 12345678000190"
"Mostrar estatísticas da empresa Messiax"
"Editar a empresa Messiax"
"Deletar a empresa com ID abc123"
```

### Gestão de Colaboradores

```
"Listar colaboradores da empresa Messiax"
"Criar colaborador João Silva com email joao@messiax.com"
"Mostrar detalhes do colaborador João Silva"
"Editar colaborador João Silva"
"Deletar colaborador com ID xyz789"
```

### Prospecção

```
"Listar todos os prospects"
"Enriquecer o prospect com ID abc123"
"Qualificar prospect como qualificado"
"Calcular score do prospect abc123"
"Recomendar produtos para o prospect abc123"
```

### Campanhas

```
"Listar campanhas"
"Criar campanha de email marketing"
"Pausar campanha abc123"
"Ativar campanha abc123"
"Mostrar métricas da campanha abc123"
```

### Consultas ao Banco

```
"Quantas empresas temos?"
"Quais colaboradores trabalham em tecnologia?"
"Mostrar prospects com maior potencial"
"Empresas sem colaboradores ativos"
"Clientes CPF interessados em produtos financeiros"
```

### Busca Semântica

```
"Encontrar empresas similares à Messiax"
"Mostrar prospects interessados em tecnologia"
"Empresas do setor financeiro"
"Clientes com alto potencial de conversão"
```

---

## 🔍 Sistema de Vetorização

O sistema utiliza **vetorização de dados** para busca semântica:

### Como Funciona

1. **Dados são vetorizados** usando OpenAI Embeddings
2. **Queries são convertidas** em embeddings
3. **Busca por similaridade** usando pgvector
4. **Resultados ordenados** por relevância

### Vetorização Automática

- ✅ Novos dados são vetorizados automaticamente via triggers SQL
- ✅ Atualizações são sincronizadas automaticamente
- ✅ Processamento em batch para eficiência

### Gerenciar Vetorização

Acesse `/vectorization` para:

- Ver status da vetorização
- Processar registros pendentes
- Vetorizar tabelas específicas
- Vetorizar todos os dados

---

## 🤖 Agentes NEX/FLX/AGX/OPX/ORDX

O sistema possui **18 agentes especializados** organizados em 5 categorias:

### 🔷 NEX (Nexus - Orquestração)

1. **NEXOrchestrator**: Orquestrador central que coordena todos os agentes

### 📐 ORDX (Ordo - Ordem, Workflow Estruturado)

2. **SupervisorAgent**: Monitora e valida todas as etapas
3. **PermissionAgent**: Valida permissões do usuário
4. **ContextAgent**: Coleta contexto da página e dados
5. **MemoryResourceAgent**: Monitoramento de memória e histórico

### 🌊 FLX (Fluxus - Fluxo Contínuo)

6. **VoiceIntentAgent**: Classifica intenções dos comandos
7. **QueryPlanningAgent**: Planeja consultas dinâmicas usando IA
8. **SuggestionAgent**: Sugestões de próximas ações

### ⚡ AGX (Agens - Aquele que Age)

9. **CompanyActionAgent**: Gestão de empresas
10. **EmployeeActionAgent**: Gestão de colaboradores
11. **CampaignActionAgent**: Gestão de campanhas
12. **ProspectingActionAgent**: Prospecção de clientes
13. **BenefitActionAgent**: Gestão de benefícios
14. **ProductActionAgent**: Produtos financeiros
15. **IntegrationActionAgent**: Integrações de dados

### 🔧 OPX (Opus - Obra, Execução, Trabalho)

16. **DatabaseQueryAgent**: Consultas SQL e busca vetorial
17. **DatabaseKnowledgeAgent**: Conhecimento do schema do banco
18. **DataVisualizationAgent**: Geração de visualizações
19. **FeedbackAgent**: Geração de respostas com IA
20. **VectorSearchService**: Busca semântica vetorial
21. **EmbeddingGenerator**: Geração de embeddings

---

## 🔧 Fluxo de Processamento

### 1. Captura de Voz
```
Usuário fala → ASR transcreve → Texto enviado
```

### 2. [NEX] Orquestração
```
[NEX] NEXOrchestrator recebe comando → Inicia processamento
```

### 3. [ORDX] Validação e Estruturação
```
[ORDX] SupervisorAgent valida → [ORDX] PermissionAgent verifica → [ORDX] ContextAgent coleta contexto
```

### 4. [FLX] Classificação e Planejamento
```
[FLX] VoiceIntentAgent classifica → [FLX] QueryPlanningAgent planeja (se necessário)
```

### 5. [AGX/OPX] Execução
```
[AGX] ActionAgent específico executa OU [OPX] DatabaseQueryAgent executa query
```

### 6. [OPX] Processamento Técnico
```
[OPX] DataVisualizationAgent gera visualizações → [OPX] FeedbackAgent gera resposta
```

### 7. [FLX] Sugestões
```
[FLX] SuggestionAgent gera sugestões de próximas ações
```

### 8. [ORDX] Finalização
```
[ORDX] SupervisorAgent valida final → [ORDX] MemoryResourceAgent atualiza histórico
```

---

## 🛠️ Troubleshooting

### Problema: Especialista não conecta

**Solução:**
1. Verifique sua conexão com a internet
2. Verifique se as chaves API estão configuradas
3. Tente recarregar a página
4. Verifique o console do navegador para erros

### Problema: Comandos não são reconhecidos

**Solução:**
1. Fale claramente e próximo ao microfone
2. Use comandos simples e diretos
3. Verifique se o avatar está conectado
4. Tente reformular o comando

### Problema: Visualizações não aparecem

**Solução:**
1. Verifique se a consulta retornou dados
2. Alguns comandos não geram visualizações
3. Tente comandos que listam dados (ex: "Listar empresas")

### Problema: Busca semântica não funciona

**Solução:**
1. Verifique se os dados foram vetorizados
2. Acesse `/vectorization` e processe pendentes
3. Execute "Vetorizar Todos os Dados" se necessário

---

## 📚 Recursos Adicionais

### Documentação Técnica

- [Arquitetura NEX/FLX/AGX/OPX/ORDX](./IMPLEMENTACAO_NEX_RESUMO.md)
- [Sistema de Vetorização](./GUIA_VETORIZACAO.md)
- [Integração OpenAI](./GUIA_INTEGRACAO_EMBEDDINGS.md)

### Guias Rápidos

- [Como Vetorizar Dados](./COMO_VETORIZAR_DADOS.md)
- [Configuração Inicial](./GUIA_VETORIZACAO.md)

### Suporte

- Consulte a documentação técnica
- Verifique os logs no console do navegador
- Entre em contato com o suporte técnico

---

## 🎓 Exemplos Práticos

### Exemplo 1: Listar Empresas

**Comando:** "Listar todas as empresas"

**Resultado:**
- Lista de empresas exibida em tabela
- Resposta verbal do especialista
- Sugestões de próximas ações

### Exemplo 2: Criar Colaborador

**Comando:** "Criar colaborador João Silva com email joao@messiax.com na empresa Messiax"

**Resultado:**
- Colaborador criado com sucesso
- Confirmação verbal
- Sugestão de adicionar mais colaboradores

### Exemplo 3: Busca Semântica

**Comando:** "Encontrar empresas similares à Messiax"

**Resultado:**
- Busca semântica executada
- Empresas similares listadas
- Score de similaridade exibido

---

## 🔐 Permissões

O sistema respeita as permissões do usuário:

- **Admin do Banco**: Acesso total
- **Admin do Cliente**: Gestão de colaboradores e benefícios
- **Usuário Normal**: Consultas e visualizações

---

## 📊 Métricas e Performance

- **Tempo de Resposta**: < 3 segundos (média)
- **Precisão de Intenções**: > 90%
- **Taxa de Sucesso**: > 95%

---

## 🚀 Próximas Melhorias

- [ ] Suporte a múltiplos idiomas
- [ ] Comandos complexos multi-etapa
- [ ] Integração com calendário
- [ ] Relatórios automáticos
- [ ] Análise preditiva

---

**Versão:** 1.0.0  
**Última Atualização:** 2024  
**Autor:** Sistema 4Prospera Connect

