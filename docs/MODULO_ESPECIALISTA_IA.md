# Módulo Especialista IA - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura BMAD](#arquitetura-bmad)
3. [Funcionalidades](#funcionalidades)
4. [Como Usar](#como-usar)
5. [Comandos Disponíveis](#comandos-disponíveis)
6. [Sistema de Vetorização](#sistema-de-vetorização)
7. [Agentes BMAD](#agentes-bmad)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Módulo Especialista IA** é um assistente virtual inteligente que permite interagir com toda a plataforma 4Prospera Connect usando **comandos de voz**. O especialista utiliza a arquitetura **BMAD (Behavior, Model, Agent, Data)** para processar comandos, executar ações e fornecer insights sobre seus dados.

### Características Principais

- ✅ **Comandos de Voz**: Interaja naturalmente usando sua voz
- ✅ **Execução de Ações**: Execute todas as ações da plataforma via voz
- ✅ **Consultas ao Banco**: Faça perguntas complexas sobre seus dados
- ✅ **Busca Semântica**: Encontre informações usando linguagem natural
- ✅ **Visualizações Automáticas**: Gráficos e tabelas gerados automaticamente
- ✅ **Sugestões Inteligentes**: Receba sugestões de próximas ações

---

## 🏗️ Arquitetura BMAD

O sistema utiliza a metodologia **BMAD (Behavior, Model, Agent, Data)**:

### Behavior (Comportamento)
- Comandos de voz do usuário
- Intenções detectadas
- Parâmetros extraídos

### Model (Modelo)
- LLMs para classificação e geração
- Embeddings para busca semântica
- Modelos de visualização

### Agent (Agentes)
- 16 agentes especializados
- SupervisorAgent para validação
- Agentes de domínio (Company, Employee, etc.)

### Data (Dados)
- Banco de dados vetorizado
- Busca semântica com pgvector
- Visualizações dinâmicas

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

## 🤖 Agentes BMAD

O sistema possui **16 agentes especializados**:

### Agentes de Orquestração

1. **SupervisorAgent**: Monitora e valida todas as etapas
2. **VoiceIntentAgent**: Classifica intenções dos comandos
3. **PermissionAgent**: Valida permissões do usuário
4. **ContextAgent**: Coleta contexto da página e dados

### Agentes de Domínio

5. **CompanyActionAgent**: Gestão de empresas
6. **EmployeeActionAgent**: Gestão de colaboradores
7. **CampaignActionAgent**: Gestão de campanhas
8. **ProspectingActionAgent**: Prospecção de clientes
9. **BenefitActionAgent**: Gestão de benefícios
10. **ProductActionAgent**: Produtos financeiros
11. **IntegrationActionAgent**: Integrações de dados

### Agentes Especializados

12. **DatabaseQueryAgent**: Consultas SQL e busca vetorial
13. **DataVisualizationAgent**: Geração de visualizações
14. **SuggestionAgent**: Sugestões de próximas ações
15. **MemoryResourceAgent**: Monitoramento de memória
16. **FeedbackAgent**: Geração de respostas

---

## 🔧 Fluxo de Processamento

### 1. Captura de Voz
```
Usuário fala → ASR transcreve → Texto enviado
```

### 2. Classificação de Intenção
```
Texto → VoiceIntentAgent → Intenção + Parâmetros
```

### 3. Validação
```
SupervisorAgent valida → PermissionAgent verifica → ContextAgent coleta contexto
```

### 4. Execução
```
ActionAgent específico executa → DatabaseQueryAgent (se necessário)
```

### 5. Visualização
```
DataVisualizationAgent gera → Gráficos/Tabelas exibidos
```

### 6. Resposta
```
FeedbackAgent gera resposta → Avatar fala → Histórico atualizado
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

- [Arquitetura BMAD](./IMPLEMENTACAO_BMAD_RESUMO.md)
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

