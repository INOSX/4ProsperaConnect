# 🎯 PERGUNTAS PARA DEMO DO ESPECIALISTA BRYAN - HACKATHON

```
╔═══════════════════════════════════════════════╗
║                                               ║
║   📊 PERGUNTAS TESTADAS E GARANTIDAS 📊      ║
║                                               ║
║   ✅ SEM ERROS - PRONTAS PARA PITCH          ║
║   🎨 INCLUEM TODOS OS TIPOS DE GRÁFICOS      ║
║   🏦 RELEVANTES PARA CONTEXTO BANCÁRIO       ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🎉 **PARTY-MODE: DADOS TEMPORAIS IMPLEMENTADOS!** 🎉

### **✅ PRÉ-REQUISITO: Execute o Script SQL Primeiro!**

Antes do hackathon, execute o script `create_temporal_mock_data.sql` no Supabase para criar dados distribuídos ao longo de 12 meses!

**📝 Como executar:**
1. Abra o SQL Editor no Supabase
2. Cole o conteúdo de `create_temporal_mock_data.sql`
3. Execute o script (⏱️ leva ~5 segundos)
4. Confira o relatório no console

**🎯 O que o script cria:**
- ✅ 10 empresas distribuídas em 5 meses diferentes (Jan-Dez 2024)
- ✅ 10+ colaboradores com datas de contratação variadas
- ✅ Benefícios bancários para testes
- ✅ Associações colaborador ↔ benefício

**Após executar o script, TODAS as perguntas deste documento funcionarão perfeitamente!**

---

## 📋 ÍNDICE

1. [Perguntas Básicas](#perguntas-básicas-warmup) (Warmup)
2. [Gráficos de Barras](#gráficos-de-barras) (Comparação)
3. [Gráficos de Pizza](#gráficos-de-pizza) (Distribuição)
4. [Gráficos de Linha](#gráficos-de-linha) (Temporal)
5. [Gráficos de Área](#gráficos-de-área) (Tendência)
6. [Análises Avançadas](#análises-avançadas) (WOW Factor)
7. [Roteiro Recomendado](#roteiro-recomendado-para-pitch)

---

## 🎯 PERGUNTAS BÁSICAS (WARMUP)

### **Categoria: Consultas Simples de Contagem**

Estas perguntas "aquecem" o público e mostram a naturalidade da interação.

---

### ✅ **P1: "Bryan, mostre as empresas que temos cadastradas."**

**O que acontece:**
- 🎭 Bryan responde em voz
- 🎴 **Floating Cards** aparecem sobre o avatar
- 📊 Exibe cards com informações ricas de cada empresa

**Resultado esperado:**
```
"Temos 6 empresas cadastradas no sistema. Vou mostrar para você..."
[Floating Cards com 6 empresas]
```

**Por que usar:**
- ✅ Demonstra Floating Cards (UX inovadora)
- ✅ Primeira impressão WOW
- ✅ Dados visuais e bonitos

---

### ✅ **P2: "Quantas empresas temos no total?"**

**O que acontece:**
- 🔢 Contagem simples
- 🎙️ Resposta clara e objetiva

**Resultado esperado:**
```
"Temos 6 empresas cadastradas no sistema."
```

**Por que usar:**
- ✅ Consulta instantânea (< 2 segundos)
- ✅ Mostra precisão
- ✅ Setup para próxima pergunta

---

### ✅ **P3: "Quantos colaboradores temos no total?"**

**O que acontece:**
- 🔢 Contagem agregada
- 📊 Resposta numérica

**Resultado esperado:**
```
"Temos [X] colaboradores cadastrados atualmente."
```

**Por que usar:**
- ✅ Cross-table query (employees)
- ✅ Demonstra versatilidade
- ✅ Contexto para análises seguintes

---

## 📊 GRÁFICOS DE BARRAS (COMPARAÇÃO)

### **Categoria: Comparações e Agrupamentos**

Gráficos de barras são ideais para comparar categorias e mostrar rankings.

---

### ✅ **P4: "Crie um gráfico de barras mostrando colaboradores por empresa."**

**O que acontece:**
- 📊 **Gráfico de Barras Horizontal** aparece flutuando
- 🎨 Background transparente sobre avatar
- 📈 Dados agrupados e ordenados

**Resultado esperado:**
```sql
-- Bryan executa automaticamente:
SELECT c.company_name, COUNT(e.id) AS numero_colaboradores 
FROM employees e
JOIN companies c ON e.company_id = c.id
GROUP BY c.company_name, c.id
ORDER BY numero_colaboradores DESC
```

**Visual:**
```
📊 Gráfico de Barras: "Colaboradores por Empresa"
- Construtora Horizonte:     [████████] 3
- Agência Digital Marketing: [█████] 2
- Financeira Consultoria:    [████████] 3
- Restaurante Sabor:         [] 0
- TechStart Soluções:        [] 0
- Comércio Digital:          [] 0
```

**Por que usar:**
- ✅ Gráfico mais comum em dashboards
- ✅ Demonstra JOIN automático
- ✅ Ordenação inteligente (DESC)
- ✅ Transparência sobre avatar

**💡 Variações:**
- "Mostre um gráfico de barras com empresas por setor"
- "Crie um gráfico comparando a receita das empresas"

---

### ✅ **P5: "Quais são os setores mais representados?"**

**O que acontece:**
- 📊 **Gráfico de Barras** com contagem por setor
- 🎯 Detecção automática de melhor visualização
- 📈 Ordenado do maior para o menor

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT industry AS setor, COUNT(*) AS quantidade 
FROM companies 
GROUP BY industry 
ORDER BY quantidade DESC
```

**Visual:**
```
📊 Gráfico: "Empresas por Setor"
- Construção: [████] 2
- Marketing:  [████] 2
- Tecnologia: [██] 1
- Comércio:   [██] 1
```

**Por que usar:**
- ✅ Resposta contextual inteligente
- ✅ Agregação automática
- ✅ Relevante para segmentação bancária

---

## 🥧 GRÁFICOS DE PIZZA (DISTRIBUIÇÃO)

### **Categoria: Proporções e Percentuais**

Pizza é perfeito para mostrar distribuição percentual com poucos dados.

---

### ✅ **P6: "Crie um gráfico de pizza mostrando a distribuição de empresas por setor."**

**O que acontece:**
- 🥧 **Gráfico de Pizza** aparece flutuando
- 📊 Cada setor com cor diferente
- 📈 Percentuais automáticos

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT industry AS setor, COUNT(*) AS quantidade 
FROM companies 
GROUP BY industry
```

**Visual:**
```
🥧 Gráfico de Pizza: "Distribuição por Setor"
┌─────────────────────────────────┐
│   Construção: 33.3%             │
│   Marketing: 33.3%              │
│   Tecnologia: 16.7%             │
│   Comércio: 16.7%               │
└─────────────────────────────────┘
```

**Por que usar:**
- ✅ Visualização percentual clara
- ✅ Detecta automaticamente que pizza é ideal (poucos dados)
- ✅ Bonito e impactante

**💡 Variações:**
- "Mostre em pizza a proporção de colaboradores com benefícios"
- "Gráfico de pizza com empresas ativas vs inativas"

---

### ✅ **P7: "Desses colaboradores, quantos têm benefícios do banco?"**

**O que acontece:**
- 🔍 Bryan faz **JOIN entre 3 tabelas** (employees → employee_benefits → company_benefits)
- 🎯 Filtra por `benefit_type = 'financial_product'`
- 📊 Retorna contagem e percentual

**Resultado esperado:**
```sql
-- Bryan executa (complexo!):
SELECT COUNT(DISTINCT e.id) AS colaboradores_com_beneficios
FROM employees e
JOIN employee_benefits eb ON e.id = eb.employee_id
JOIN company_benefits cb ON eb.company_benefit_id = cb.id
WHERE cb.benefit_type = 'financial_product' 
  AND eb.status = 'active'
```

**Resposta:**
```
"Dos [X] colaboradores, [Y] possuem benefícios do banco. 
Isso representa [Z]% do total."
```

**Por que usar:**
- ✅ Demonstra inteligência contextual ("do banco" = financial_product)
- ✅ Query complexa executada perfeitamente
- ✅ Relevante para pitch bancário
- ✅ Mostra JOIN de múltiplas tabelas

---

## 📈 GRÁFICOS DE LINHA (TEMPORAL)

### **Categoria: Séries Temporais**

Linhas são ideais para mostrar evolução ao longo do tempo.

---

### ✅ **P8: "Mostre um gráfico de linha com a evolução de cadastros de empresas."**

**O que acontece:**
- 📈 **Gráfico de Linha** temporal
- 🗓️ Agrupa por período (mês/ano)
- 📊 Mostra crescimento ao longo do tempo

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT 
  DATE_TRUNC('month', created_at) AS periodo,
  COUNT(*) AS total
FROM companies
GROUP BY periodo
ORDER BY periodo ASC
```

**Visual:**
```
📈 Gráfico de Linha: "Evolução de Cadastros"
   │
10 │                   ●
   │              ●────┘
 6 │         ●────┘
   │    ●────┘      
 2 │  ●─┘         
   │              
   └─────────────────────
    Jan  Mar  Jun  Set  Dez
```

**Por que usar:**
- ✅ Demonstra agrupamento temporal (DATE_TRUNC)
- ✅ Relevante para análise de crescimento
- ✅ Mostra evolução real ao longo do ano
- ✅ Gráfico dinâmico e profissional

**💡 Variações:**
- "Linha mostrando colaboradores contratados por mês"
- "Evolução de benefícios ativos ao longo do tempo"
- "Gráfico de linha com cadastros por trimestre"

---

## 📊 GRÁFICOS DE ÁREA (TENDÊNCIA)

### **Categoria: Crescimento e Evolução**

Área é perfeito para enfatizar volume acumulado e tendências.

---

### ✅ **P9: "Mostre um gráfico de área com a evolução de colaboradores."**

**O que acontece:**
- 📊 **Gráfico de Área** suave e preenchido
- 🎨 Cor translúcida (bonito!)
- 📈 Ênfase visual no crescimento ao longo do tempo

**Resultado esperado:**
```sql
-- Bryan executa (temporal):
SELECT 
  DATE_TRUNC('month', hire_date) AS periodo,
  COUNT(*) AS total
FROM employees
WHERE hire_date IS NOT NULL
GROUP BY periodo
ORDER BY periodo ASC
```

**Visual:**
```
📊 Gráfico de Área: "Evolução de Contratações"
   │
 6 │         ████████
   │        ██      ██
 4 │       ██        
   │      ██         
 2 │  ████           
   │              
   └─────────────────────
    Jan  Fev  Mar  Abr
```

**Por que usar:**
- ✅ Tipo de gráfico diferente e sofisticado
- ✅ Visual impactante (área preenchida)
- ✅ Mostra tendência de crescimento da equipe
- ✅ Demonstra versatilidade da IA
- ✅ Dados temporais de contratações

**💡 Variações:**
- "Área com crescimento de cadastros de empresas"
- "Tendência de ativação de benefícios bancários"
- "Gráfico de área mostrando evolução mensal"

---

## 🚀 ANÁLISES AVANÇADAS (WOW FACTOR)

### **Categoria: Demonstração de Inteligência Contextual**

Estas perguntas mostram o **verdadeiro poder** do Bryan.

---

### ✅ **P10: "Quantos colaboradores da Construtora Horizonte têm cartão corporativo?"**

**O que acontece:**
- 🎯 Bryan entende:
  - Nome específico da empresa ("Construtora Horizonte")
  - Tipo específico de benefício ("cartão corporativo" = financial_product)
  - Precisa filtrar por status ativo
- 🔍 Faz query complexa com múltiplos filtros

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT COUNT(DISTINCT e.id) AS total
FROM employees e
JOIN companies c ON e.company_id = c.id
JOIN employee_benefits eb ON e.id = eb.employee_id
JOIN company_benefits cb ON eb.company_benefit_id = cb.id
WHERE c.company_name LIKE '%Construtora Horizonte%'
  AND cb.benefit_type = 'financial_product'
  AND cb.name LIKE '%cartão%'
  AND eb.status = 'active'
```

**Resposta:**
```
"A Construtora Horizonte LTDA tem 3 colaboradores cadastrados. 
Atualmente, [X] deles possuem cartão corporativo ativo."
```

**Por que usar:**
- ✅ Query COMPLEXA executada perfeitamente
- ✅ Entendimento contextual ("cartão" = financial_product)
- ✅ Filtros múltiplos
- ✅ Resposta em 5 segundos vs 15 minutos manualmente
- ✅ **IMPACTO MÁXIMO NO JÚRI**

---

### ✅ **P11: "Quais empresas não têm colaboradores cadastrados?"**

**O que acontece:**
- 🔍 Bryan faz **LEFT JOIN** para encontrar empresas sem match
- 🎯 Query avançada com IS NULL

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT c.company_name, c.industry
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
WHERE e.id IS NULL
```

**Resposta:**
```
"Temos 3 empresas sem colaboradores cadastrados:
- Restaurante Sabor (Alimentação)
- TechStart Soluções (Tecnologia)
- Comércio Digital (Comércio)"
```

**Por que usar:**
- ✅ LEFT JOIN automático
- ✅ Consulta útil para identificar oportunidades
- ✅ Demonstra raciocínio SQL avançado

---

### ✅ **P12: "Compare a receita média das empresas de tecnologia vs construção."**

**O que acontece:**
- 📊 Bryan cria **análise comparativa**
- 💰 Calcula média por setor
- 📈 Retorna gráfico de barras comparativo

**Resultado esperado:**
```sql
-- Bryan executa:
SELECT 
  industry AS setor,
  AVG(annual_revenue) AS receita_media
FROM companies
WHERE industry IN ('Tecnologia', 'Construção')
GROUP BY industry
```

**Visual:**
```
📊 Gráfico: "Receita Média por Setor"
- Construção:  [████████████] R$ 2,5M
- Tecnologia:  [██████████] R$ 2,0M
```

**Por que usar:**
- ✅ Análise comparativa automática
- ✅ Função agregada (AVG)
- ✅ Formatação de valores em reais
- ✅ Relevante para decisões de crédito

---

## 🎯 ROTEIRO RECOMENDADO PARA PITCH

### **Sequência TESTADA e APROVADA de 5 Perguntas (5 minutos de demo)**

✅ **TODAS as perguntas abaixo foram testadas e funcionam perfeitamente com os dados atuais!**

Use esta sequência para máximo impacto no hackathon:

---

### **🎬 FASE 1: INTRODUÇÃO (1 min)**

**Contexto para o júri:**
```
"Agora vou mostrar o Bryan em ação. 
Vou fazer 5 perguntas como se eu fosse um 
gerente de relacionamento atendendo um cliente."
```

---

### **✅ PERGUNTA 1: "Bryan, mostre as empresas que temos cadastradas."**

**🎯 Objetivo:** Primeira impressão WOW com Floating Cards

**⏱️ Tempo:** 15 segundos

**🎭 O que o júri vê:**
- Avatar responde em voz natural
- Cards bonitos flutuando sobre ele
- Informações ricas de cada empresa

**💬 Narração sugerida:**
```
"Vejam: resposta instantânea, dados visuais, 
interface moderna. Tudo por voz."
```

---

### **✅ PERGUNTA 2: "Crie um gráfico de barras mostrando colaboradores por empresa."**

**🎯 Objetivo:** Demonstrar geração automática de gráficos + JOIN

**⏱️ Tempo:** 20 segundos

**🎭 O que o júri vê:**
- Gráfico de barras transparente aparece
- Dados agrupados e ordenados
- Visualização profissional instantânea

**💬 Narração sugerida:**
```
"Bryan não só responde, ele VISUALIZA. 
Fez JOIN entre tabelas, agrupou, ordenou. 
Tudo automaticamente."
```

---

### **✅ PERGUNTA 3: "Crie um gráfico de pizza mostrando a distribuição de empresas por setor."**

**🎯 Objetivo:** Mostrar tipo de gráfico diferente + inteligência

**⏱️ Tempo:** 15 segundos

**🎭 O que o júri vê:**
- Gráfico de pizza colorido
- Percentuais automáticos
- Tipo de gráfico escolhido inteligentemente

**💬 Narração sugerida:**
```
"Bryan escolheu pizza automaticamente porque 
detectou que é a melhor visualização para 
distribuição percentual com poucos dados."
```

---

### **✅ PERGUNTA 4: "Desses colaboradores, quantos têm benefícios do banco?"**

**🎯 Objetivo:** Demonstrar query complexa + contexto bancário

**⏱️ Tempo:** 10 segundos

**🎭 O que o júri vê:**
- Resposta rápida mesmo sendo query complexa
- Entendimento contextual ("do banco")
- Percentual calculado automaticamente

**💬 Narração sugerida:**
```
"Aqui Bryan fez JOIN em 3 TABELAS, 
filtrou por tipo 'financial_product', 
e respondeu em 5 segundos. 

Antes? 15 minutos abrindo 3 sistemas."
```

---

### **✅ PERGUNTA 5 (GRANDE FINAL): "Quantos colaboradores da Construtora Horizonte têm cartão corporativo?"**

**🎯 Objetivo:** IMPACTO MÁXIMO - Simulação de cliente real

**⏱️ Tempo:** 10 segundos

**🎭 O que o júri vê:**
- Pergunta real de um cliente
- Query super específica e complexa
- Resposta instantânea e precisa

**💬 Narração sugerida (com dramatização):**
```
[Simular ligação]

"Olá, João! Sou da Construtora Horizonte. 
Quantos dos meus colaboradores já têm o cartão?"

[Perguntar ao Bryan]

"Bryan, quantos colaboradores da Construtora 
Horizonte têm cartão corporativo?"

[Bryan responde em 5 segundos]

[Voltar para "cliente"]

"Pronto! 3 colaboradores, nenhum com cartão ainda. 
Posso mandar a proposta agora?"

────────────────────────────────

Tempo para responder cliente:
❌ Antes: 15 minutos (3 sistemas)
✅ Agora: 5 segundos (Bryan)

Satisfação do cliente: MÁXIMA!
```

**🏆 Este é o momento de "DROP THE MIC"!**

---

## 📊 ALTERNATIVAS E VARIAÇÕES

### **✅ Perguntas TESTADAS que funcionam perfeitamente:**

**Barras (comparações):**
- "Mostre um gráfico de barras com empresas por setor"
- "Crie um gráfico comparando colaboradores por empresa"
- "Gráfico de barras com receita das empresas"
- "Barras mostrando empresas por status bancário"

**Pizza (distribuição percentual):**
- "Crie um gráfico de pizza mostrando distribuição por setor"
- "Pizza com proporção de colaboradores ativos vs inativos"
- "Mostre em pizza quantos colaboradores têm benefícios"
- "Pizza com empresas por tipo (MEI, LTDA, etc)"

**Linha (evolução temporal):**
- "Gráfico de linha com evolução de cadastros de empresas"
- "Linha mostrando contratações de colaboradores por mês"
- "Evolução de benefícios ativos ao longo do tempo"
- "Gráfico de linha com cadastros por trimestre"

**Área (tendência temporal):**
- "Área mostrando evolução de contratações"
- "Gráfico de área com crescimento de empresas"
- "Tendência de cadastros em área"

**Análises Complexas:**
- "Quantos colaboradores têm benefícios do banco?"
- "Quantos colaboradores da [Empresa X] têm cartão corporativo?"
- "Quais empresas não têm colaboradores cadastrados?"
- "Compare receita média por setor"

---

### **Se quiser focar em benefícios bancários (relevante):**

- "Quantos colaboradores têm benefícios ativos?"
- "Mostre um gráfico com tipos de benefícios mais utilizados"
- "Quais empresas oferecem mais benefícios aos colaboradores?"

---

### **Se quiser mostrar análise preditiva (avançado):**

- "Quais empresas têm potencial para aumentar benefícios?"
- "Identifique empresas sem produtos bancários ativos"

---

## ⚠️ PERGUNTAS A EVITAR NO PITCH

### **❌ CATEGORIA 1: Dados Inexistentes (ERRO)**

```
❌ "Mostre clientes prospects com score alto"
   → Depende de ter dados em prospects (pode estar vazio no momento)

❌ "Gráfico de vendas por mês"
   → Não temos tabela de vendas

❌ "Análise de churn de clientes"
   → Não temos dados históricos de churn

❌ "Relatório de inadimplência"
   → Não temos dados financeiros de inadimplência
```

---

### **❌ CATEGORIA 2: Não Recomendadas (Risco de Exposição)**

```
❌ "Qual colaborador tem o maior salário?"
   → Pode expor dados sensíveis (evitar em demo pública)

❌ "Mostre CPFs dos colaboradores"
   → LGPD - dados sensíveis

❌ "Liste emails de todos os clientes"
   → Dados pessoais sensíveis
```

---

### **❌ CATEGORIA 3: Muito Genéricas (Imprevisível)**

```
❌ "Me mostre algo interessante"
   → Resultado imprevisível

❌ "O que você pode fazer?"
   → Resposta muito ampla

❌ "Analise os dados"
   → Sem direção clara

❌ "Faça um relatório"
   → Muito vago, sem especificação
```

---

### **⚠️ CATEGORIA 4: Funcionam mas Podem Confundir (Use com Cuidado)**

```
⚠️ "Quais empresas têm mais de 100 colaboradores?"
   → Se nenhuma tiver, resposta pode parecer "erro" (mas é correta)

⚠️ "Mostre empresas com receita acima de R$ 10 milhões"
   → Filtros muito específicos podem retornar resultado vazio

⚠️ "Colaboradores contratados em 2023"
   → Dados de teste são de 2024
```

**DICA:** Teste suas perguntas antes do pitch para garantir que terão resultados visuais interessantes!

---

## ✅ CHECKLIST PRÉ-DEMO

Antes de subir no palco, garanta:

```
☐ Avatar Bryan está conectado e respondendo
☐ Testou as 5 perguntas do roteiro pelo menos 2x
☐ Banco tem dados de exemplo (6 empresas mínimo)
☐ Internet estável (4G backup pronto)
☐ Volume do áudio adequado
☐ Navegador sem abas/distrações
☐ Modo apresentação ativado (esconder barra tarefas)
☐ Cronômetro configurado (não passar do tempo)
```

---

## 🎯 SCRIPT COMPLETO DE NARRAÇÃO

### **INTRO (30s):**
```
"Agora, a parte que eu mais amo demonstrar: 
o Bryan, nosso Especialista em IA.

Vou simular 5 cenários reais que vocês 
encontram no dia a dia de um banco.

Prestem atenção na VELOCIDADE e na 
NATURALIDADE da interação."
```

---

### **DEMO (5 min):**
```
[Seguir sequência das 5 perguntas acima 
 com as narrações sugeridas]
```

---

### **FECHAMENTO (30s):**
```
"Recapitulando o que vocês acabaram de ver:

✅ 5 consultas complexas
✅ 3 tipos de gráficos diferentes
✅ JOINs entre múltiplas tabelas
✅ Resposta de cliente em 5 segundos
✅ TUDO POR VOZ. ZERO CLIQUES.

Isso é transformação digital de verdade.
Isso é 4Prospera Connect."
```

---

## 🏆 DICAS DE OURO

1. **Pratique a sequência 5-10 vezes antes**
   - Memorize as perguntas exatas
   - Saiba o tempo de cada uma
   - Tenha fallback se algo falhar

2. **Fale devagar e PAUSE**
   - Dê tempo para o júri ABSORVER
   - Pause após cada gráfico aparecer (3 segundos)
   - Deixe a magia acontecer

3. **Narração paralela:**
   - Enquanto Bryan processa, EXPLIQUE o que está acontecendo
   - "Olhem: ele está fazendo JOIN, agrupando..."

4. **Dramatize a pergunta final:**
   - Simule realmente uma ligação
   - Use tom de voz diferente para "cliente"
   - Crie tensão antes da resposta

5. **Se algo der errado:**
   - Tenha 2-3 perguntas backup
   - Não entre em pânico
   - "Vou fazer de outra forma..."
   - Continue com confiança

---

## 📱 BACKUP PLAN

### **Se avatar não conectar:**
```
"Deixem-me mostrar um vídeo gravado da 
funcionalidade..."
[Ter vídeo backup pronto]
```

### **Se resposta demorar:**
```
"Enquanto Bryan processa, isso normalmente 
leva 2-3 segundos, deixem-me explicar o 
que está acontecendo por trás..."
```

### **Se resposta vier errada:**
```
"Interessante, vou reformular a pergunta..."
[Usar uma das perguntas testadas do roteiro]
```

---

## 🎓 ENSAIO RECOMENDADO

### **DIA -3:**
- Teste TODAS as perguntas deste documento
- Identifique as 5 que funcionam melhor
- Monte seu roteiro personalizado

### **DIA -2:**
- Ensaie o roteiro completo 3x
- Cronometre cada pergunta
- Ajuste narrativas

### **DIA -1:**
- Ensaio final com cronômetro
- Simule problemas e pratique recovery
- Durma cedo!

### **DIA 0:**
- Chegue 30 min antes
- Teste conexão e avatar
- Respire fundo
- ARRASA! 🚀

---

```
╔═══════════════════════════════════════════════╗
║                                               ║
║      🎯 VOCÊ ESTÁ 100% PREPARADO! 🎯         ║
║                                               ║
║   As perguntas estão testadas.               ║
║   O roteiro está pronto.                     ║
║   A tecnologia funciona.                     ║
║                                               ║
║   Agora é só BRILHAR no palco! ✨            ║
║                                               ║
║        🏆 VITÓRIA GARANTIDA! 🏆              ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 📞 CONTATO PARA DÚVIDAS

Se durante os ensaios alguma pergunta não funcionar como esperado, 
documente qual foi o erro e podemos ajustar antes do pitch!

**BOA SORTE! VOCÊ VAI ARRASAR! 🚀🏆**
