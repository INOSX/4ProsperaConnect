# Guia de Uso - Dashboard de Prospecção

## 📊 Visão Geral

O Dashboard de Prospecção é a página principal para gerenciar e qualificar potenciais clientes CNPJ/MEI. Esta página permite visualizar métricas, identificar oportunidades e tomar decisões baseadas em dados.

---

## 🎯 Acessando a Página

**URL:** `/prospecting` ou clique em "Prospecção" no menu lateral

---

## 📋 Elementos da Interface

### 1. **Cabeçalho da Página**

No topo da página, você encontra:

- **Título:** "Dashboard de Prospecção"
- **Subtítulo:** "Identifique e qualifique potenciais clientes CNPJ"
- **Botões de Ação:**
  - **"Enriquecer Prospects"** (ícone de refresh): Inicia o wizard para enriquecer prospects selecionados com dados de múltiplas fontes
  - **"Ver Lista Completa"** (ícone de gráfico): Navega para a lista completa de todos os prospects

### 2. **Cards de Métricas (KPIs)**

Sete cards exibem métricas principais. **💡 Dica:** Passe o mouse sobre o ícone de informação (ℹ️) em cada card para ver uma explicação detalhada da métrica.

#### 📊 **Total de Prospects**
- **O que mostra:** Número total de prospects cadastrados no sistema
- **Como usar:** Clique para ver detalhes ou filtrar

#### ✅ **Qualificados**
- **O que mostra:** Quantidade de prospects que foram qualificados (status: qualified)
- **Cor:** Verde
- **Como usar:** Indica prospects prontos para abordagem comercial

#### ⏳ **Pendentes**
- **O que mostra:** Prospects aguardando qualificação
- **Cor:** Amarelo
- **Como usar:** Prospects que precisam de análise ou enriquecimento

#### ❌ **Rejeitados**
- **O que mostra:** Prospects que foram rejeitados
- **Cor:** Vermelho
- **Como usar:** Prospects que não atendem aos critérios

#### 📈 **Score Médio**
- **O que mostra:** Média de scores de todos os prospects
- **Escala:** 0-100
- **Como usar:** Indica a qualidade geral do pipeline de prospecção

#### 💰 **LTV Médio**
- **O que mostra:** Lifetime Value (Valor ao Longo do Tempo) médio estimado
- **Formato:** R$ Xk ou R$ XM
- **Como usar:** Indica o valor potencial médio de cada prospect

#### ⚠️ **Risco Churn Médio**
- **O que mostra:** Risco médio de perda de cliente (churn)
- **Formato:** Percentual (0-100%)
- **Cores:**
  - Verde: < 30% (baixo risco)
  - Amarelo: 30-60% (risco médio)
  - Vermelho: > 60% (alto risco)
- **Como usar:** Ajuda a priorizar prospects com menor risco de churn

### 3. **Gráficos e Visualizações**

#### 📊 **Distribuição de Scores** (Gráfico Interativo)

- **O que mostra:** Quantidade de prospects em cada faixa de score
- **Tipos de Gráfico Disponíveis:**
  - **Barras** (padrão): Visualização em barras horizontais
  - **Linha**: Gráfico de linha mostrando a distribuição
  - **Pizza**: Gráfico de pizza com percentuais
- **Como alternar:** Clique nos ícones no canto superior direito do card do gráfico
- **Faixas:**
  - 0-20: Vermelho (baixa qualidade)
  - 21-40: Laranja (qualidade baixa-média)
  - 41-60: Amarelo (qualidade média)
  - 61-80: Verde (boa qualidade)
  - 81-100: Verde escuro (excelente qualidade)
- **Como usar:** 
  - Identifique onde estão concentrados seus prospects
  - Foque em mover prospects para faixas superiores
  - Identifique oportunidades de melhoria
  - Experimente diferentes tipos de gráfico para diferentes insights

#### 💵 **Métricas de Valor**

Três métricas financeiras importantes:

1. **LTV Total Estimado**
   - Soma de todos os LTVs dos prospects
   - Formato: R$ X.XXM (milhões)
   - **Como usar:** Indica o valor total potencial do pipeline

2. **LTV Médio por Prospect**
   - Média de LTV por prospect individual
   - **Como usar:** Compara com benchmarks do mercado

3. **Taxa de Qualificação**
   - Percentual de prospects qualificados sobre o total
   - **Como usar:** Mede a eficiência do processo de qualificação

### 4. **Tabela de Prospects em Destaque**

Lista os prospects com maior prioridade ou melhor score.

**Colunas:**
- **NOME:** Nome do prospect
- **CPF:** CPF do prospect
- **SCORE:** Score de 0-100 (cores indicam qualidade)
- **STATUS:** Badge colorido com o status atual
- **PRIORIDADE:** Barra de progresso de 0-10

**Como interagir:**
- **Clique em qualquer linha** para ver detalhes completos do prospect
- A linha muda de cor ao passar o mouse (hover) indicando que é clicável
- Os prospects são ordenados por prioridade (maior primeiro)
- Você será redirecionado para `/prospecting/:id` ao clicar

**Cores dos Scores:**
- 🟢 Verde: Score ≥ 70 (alta qualidade)
- 🟡 Amarelo: Score 50-69 (qualidade média)
- 🔴 Vermelho: Score < 50 (baixa qualidade)

**Status Badges:**
- 🟢 **Qualificado:** Pronto para abordagem comercial
- 🟡 **Pendente:** Aguardando análise/qualificação
- 🔴 **Rejeitado:** Não atende aos critérios
- 🔵 **Convertido:** Já se tornou cliente

---

## 🎮 Ações Disponíveis

### 1. **Enriquecer Prospects**

**Como fazer:**
1. Clique no botão **"Enriquecer Prospects"** no topo
2. Você será redirecionado para o Wizard de Enriquecimento
3. Siga os passos:
   - **Passo 1:** Selecione os prospects que deseja enriquecer
   - **Passo 2:** Escolha as fontes de dados (uploads, conexões, APIs)
   - **Passo 3:** Configure o mapeamento de campos
   - **Passo 4:** Revise as configurações
   - **Passo 5:** Execute e acompanhe o progresso

**O que acontece:**
- Os prospects selecionados são enriquecidos com dados de múltiplas fontes
- Scores podem ser recalculados automaticamente
- Novos dados são adicionados aos prospects

### 2. **Ver Lista Completa**

**Como fazer:**
1. Clique no botão **"Ver Lista Completa"**
2. Você será redirecionado para `/prospecting/list`

**O que você pode fazer na lista:**
- Buscar prospects por nome, CPF ou email
- Filtrar por status, score, LTV, churn risk
- Selecionar múltiplos prospects
- Enriquecer prospects selecionados em massa
- Ver detalhes de cada prospect

### 3. **Ver Detalhes de um Prospect**

**Como fazer:**
1. Clique em qualquer linha da tabela "Prospects em Destaque"
2. Você será redirecionado para `/prospecting/:id`

**O que você pode fazer na página de detalhes:**
- Ver todas as informações do prospect
- **Aba "Visão Geral":** Dados básicos, score, status, sinais de mercado
- **Aba "Enriquecimento":** Histórico de enriquecimentos, fontes de dados utilizadas
- **Aba "Scoring Detalhado":** Breakdown completo do score (conversão, LTV, churn, engagement)
- **Aba "Dados Externos":** Dados de APIs externas (Receita Federal, Serasa, etc.)
- Qualificar o prospect
- Gerar recomendações de produtos
- Enriquecer o prospect individualmente

### 4. **Interagir com o Avatar**

**Como o Avatar Funciona:**

O avatar HeyGen está integrado com o sistema de prospecção e tem acesso inteligente aos dados da página atual. Quando você está em páginas de prospecção (`/prospecting`, `/prospecting/list`, `/prospecting/:id`), o sistema automaticamente:

1. **Detecta a página atual** - Identifica se você está no dashboard, lista ou detalhes
2. **Busca contexto relevante** - Coleta estatísticas e dados do prospect atual (se aplicável)
3. **Formata para o avatar** - Prepara as informações em um formato que o avatar pode usar
4. **Inclui na resposta** - O avatar recebe esse contexto junto com sua pergunta

**Como fazer:**
1. Conecte o avatar HeyGen no painel lateral (se ainda não conectado)
2. Faça perguntas sobre prospecção usando o microfone ou digite
3. O avatar responderá com contexto dos dados de prospecção

**Exemplos de perguntas:**
- "Quantos prospects qualificados temos?"
- "Qual o score médio dos prospects?"
- "Quais são os prospects com maior LTV?"
- "Qual o risco de churn do prospect João Silva?"
- "Me mostre os prospects pendentes de qualificação"
- "Qual a taxa de qualificação atual?"
- "Quantos prospects estão pendentes?"

**O que o avatar sabe automaticamente:**

**No Dashboard (`/prospecting`):**
- Total de prospects
- Número de qualificados, pendentes, rejeitados
- Score médio
- LTV médio estimado
- Risco médio de churn

**Na Lista (`/prospecting/list`):**
- Todas as estatísticas do dashboard
- Filtros aplicados
- Prospects visíveis na lista

**Nos Detalhes (`/prospecting/:id`):**
- Todas as estatísticas gerais
- **Dados do prospect atual:**
  - Nome, CPF, CNPJ
  - Score e probabilidade de conversão
  - LTV estimado e risco de churn
  - Status de qualificação
  - Prioridade
  - Número de fontes de dados utilizadas
  - Status de enriquecimento

**Tecnicamente:**
- O sistema usa `ProspectingContextService` para buscar dados
- O contexto é formatado em texto estruturado
- O avatar recebe esse contexto junto com sua pergunta
- O assistente OpenAI usa o contexto para responder de forma precisa

---

## 🔄 Fluxo de Trabalho Recomendado

### **Fluxo 1: Análise Inicial**
1. Acesse o Dashboard de Prospecção
2. Analise os KPIs e métricas
3. Identifique oportunidades (prospects com alto score, baixo churn)
4. Clique em "Ver Lista Completa" para análise detalhada

### **Fluxo 2: Enriquecimento de Prospects**
1. Clique em "Enriquecer Prospects"
2. Selecione os prospects que deseja enriquecer
3. Escolha as fontes de dados disponíveis
4. Configure o mapeamento de campos
5. Execute e aguarde a conclusão
6. Volte ao dashboard para ver métricas atualizadas

### **Fluxo 3: Qualificação e Ação**
1. Na lista de prospects, identifique os com maior prioridade
2. Clique em um prospect para ver detalhes
3. Analise as abas (Scoring, Enriquecimento, Dados Externos)
4. Se necessário, recalcule o score avançado
5. Qualifique o prospect
6. Gere recomendações de produtos
7. Tome ação comercial baseada nos dados

### **Fluxo 4: Monitoramento Contínuo**
1. Acompanhe os KPIs regularmente
2. Monitore a distribuição de scores
3. Acompanhe a taxa de qualificação
4. Use o avatar para fazer perguntas rápidas
5. Ajuste estratégias baseado nas métricas

---

## 💡 Dicas de Uso

### **Priorização de Prospects**
- Foque em prospects com:
  - Score ≥ 70
  - LTV alto
  - Churn risk < 30%
  - Status "Qualificado"

### **Interpretação de Métricas**
- **Score Alto + LTV Alto + Churn Baixo** = Oportunidade Premium
- **Score Médio + LTV Médio** = Oportunidade Padrão
- **Score Baixo ou Churn Alto** = Requer análise mais profunda

### **Uso do Enriquecimento**
- Enriqueça prospects antes de qualificar para ter dados completos
- Use múltiplas fontes para dados mais confiáveis
- Enriqueça em lote para eficiência

### **Interação com Avatar**
- O avatar tem contexto completo quando você está em páginas de prospecção
- Faça perguntas específicas para obter insights
- Use para análises rápidas sem navegar entre páginas

---

## 🚨 Solução de Problemas

### **Métricas não aparecem**
- Verifique se há prospects cadastrados
- Execute o script SQL de dados mockados se necessário
- Recarregue a página

### **Botões não funcionam**
- Verifique se está logado
- Verifique o console do navegador para erros
- Tente recarregar a página

### **Avatar não responde sobre prospecção**
- Verifique se está na página `/prospecting` ou `/prospecting/list` ou `/prospecting/:id`
- Certifique-se de que o avatar está conectado
- Verifique o console para erros

### **Enriquecimento não funciona**
- Verifique se há fontes de dados disponíveis
- Certifique-se de que selecionou pelo menos uma fonte
- Verifique os logs do job de enriquecimento

---

## 📚 Páginas Relacionadas

- **Lista de Prospects** (`/prospecting/list`): Lista completa com filtros avançados
- **Detalhes do Prospect** (`/prospecting/:id`): Informações detalhadas de um prospect
- **Wizard de Enriquecimento** (`/prospecting/enrich`): Fluxo guiado para enriquecer prospects
- **Integrações** (`/integrations`): Configurar fontes de dados
- **Upload de Dados** (`/upload`): Fazer upload de arquivos para usar como fonte

---

## 🎓 Próximos Passos

1. **Explore a Lista Completa:** Use filtros para encontrar prospects específicos
2. **Teste o Enriquecimento:** Enriqueça alguns prospects para ver a diferença
3. **Analise Detalhes:** Clique em prospects para ver todas as informações
4. **Use o Avatar:** Faça perguntas sobre os dados de prospecção
5. **Configure Integrações:** Adicione mais fontes de dados para enriquecimento
6. **Experimente os Gráficos:** Alterne entre barras, linha e pizza para diferentes visualizações
7. **Use os Tooltips:** Passe o mouse sobre os ícones de informação nos cards para entender melhor cada métrica

## 🔍 Funcionalidades Interativas

### **Tooltips nos Cards**
- Passe o mouse sobre o ícone ℹ️ em qualquer card de métrica
- Uma explicação detalhada aparecerá automaticamente
- Útil para entender o que cada métrica significa sem precisar consultar documentação

### **Gráficos Interativos**
- Clique nos ícones no canto superior direito do gráfico de distribuição
- Alterne entre:
  - **Barras:** Melhor para comparar valores entre faixas
  - **Linha:** Melhor para ver tendências ao longo das faixas
  - **Pizza:** Melhor para ver proporções e percentuais

### **Navegação por Clique**
- Clique em qualquer linha da tabela "Prospects em Destaque"
- Você será redirecionado automaticamente para os detalhes do prospect
- A linha muda de cor ao passar o mouse indicando que é clicável
- Use isso para análise rápida de prospects individuais

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique este guia
2. Consulte a documentação técnica (`PROXIMOS_PASSOS_PROSPECCAO.md`)
3. Verifique os logs do console do navegador
4. Entre em contato com a equipe de desenvolvimento

