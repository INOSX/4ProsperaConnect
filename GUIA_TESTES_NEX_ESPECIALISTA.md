# 🧪 Guia de Testes - Agentes BMAD e Especialista IA

Este guia lista os próximos passos para testar e validar o sistema de agentes BMAD e o Especialista IA.

---

## 📋 Pré-requisitos

- [ ] Aplicação rodando em produção: `https://4prosperaconnect.vercel.app`
- [ ] Usuário autenticado com permissões adequadas
- [ ] Console do navegador aberto (F12) para ver logs
- [ ] Dados de teste no banco (empresas, colaboradores, etc.)

---

## 🎯 Próximos Passos de Teste

### 1️⃣ Testes Básicos de Consultas

#### Teste 1: Consulta de Contagem Simples
**Comando de voz:**
```
"Quantas empresas temos cadastradas?"
```

**O que verificar:**
- [ ] Logs mostram: `[BMAD:VoiceIntentAgent] ✅ Intent classified`
- [ ] Logs mostram: `[BMAD:DatabaseQueryAgent] 📋 Detected: Count query`
- [ ] Resposta correta é exibida
- [ ] Visualização de card é mostrada
- [ ] Avatar fala a resposta

**Logs esperados:**
```
[BMAD:Orchestrator] 🚀 Starting command processing
[BMAD:VoiceIntentAgent] ✅ Intent classified: query_database
[BMAD:DatabaseQueryAgent] 📋 Detected: Count query
[BMAD:Orchestrator] ✅ Command processing finished successfully
```

---

#### Teste 2: Consulta de Agregação
**Comando de voz:**
```
"Qual a média de colaboradores por empresa?"
```

**O que verificar:**
- [ ] Logs mostram detecção de agregação
- [ ] Cálculo correto da média
- [ ] Resposta específica e clara
- [ ] Visualização de card com a média

**Logs esperados:**
```
[BMAD:DatabaseQueryAgent] 📋 Detected: Aggregate query
[BMAD:DatabaseQueryAgent] ✅ Aggregate query result
```

---

#### Teste 3: Consulta sobre Empresas sem Colaboradores
**Comando de voz:**
```
"Existem empresas sem colaborador cadastrado?"
```

**O que verificar:**
- [ ] Logs mostram: `[BMAD:VoiceIntentAgent] ✅ Intent classified (companies without employees)`
- [ ] Logs mostram: `[BMAD:DatabaseQueryAgent] 🏢 Handling companies without employees query`
- [ ] Resposta específica (ex: "Sim, existem X empresas...")
- [ ] Lista de empresas sem colaboradores (se houver)

**Logs esperados:**
```
[BMAD:VoiceIntentAgent] ✅ Intent classified (companies without employees)
[BMAD:DatabaseQueryAgent] 🏢 Handling companies without employees query
[BMAD:DatabaseQueryAgent] ✅ Companies without employees query result
```

---

#### Teste 4: Consulta de Gráfico Temporal
**Comando de voz:**
```
"Mostre um gráfico de cadastramento de empresas por período"
```

**O que verificar:**
- [ ] Logs mostram detecção de time series
- [ ] Gráfico de linha é gerado
- [ ] Dados são exibidos corretamente
- [ ] Avatar explica o gráfico

**Logs esperados:**
```
[BMAD:DatabaseQueryAgent] 📋 Detected: Time series query
[BMAD:DataVisualizationAgent] 📊 Creating time series chart
```

---

### 2️⃣ Testes de Busca Semântica

#### Teste 5: Busca Semântica Básica
**Comando de voz:**
```
"Buscar empresas do setor financeiro"
```

**O que verificar:**
- [ ] Logs mostram uso de busca vetorial
- [ ] Resultados relevantes são retornados
- [ ] Resumo é gerado

**Logs esperados:**
```
[BMAD:VectorSearchService] 🔍 Semantic search
[BMAD:VectorSearchService] ✅ Found X similar results
```

---

#### Teste 6: Busca com Fallback
**Comando de voz:**
```
"Listar todas as empresas"
```

**O que verificar:**
- [ ] Se busca vetorial falhar, usa fallback
- [ ] Resultados são retornados mesmo com fallback
- [ ] Logs mostram qual estratégia foi usada

---

### 3️⃣ Testes de Validação e Supervisão

#### Teste 7: Verificar Logs do Supervisor
**Ação:**
Execute qualquer consulta e verifique os logs do SupervisorAgent

**O que verificar:**
- [ ] `[BMAD:SupervisorAgent] 🔍 Validating initial input`
- [ ] `[BMAD:SupervisorAgent] ✅ Intent validation passed`
- [ ] `[BMAD:SupervisorAgent] ✅ Permission validation passed`
- [ ] `[BMAD:SupervisorAgent] ✅ Query validation passed`
- [ ] `[BMAD:SupervisorAgent] ✅ Final validation passed`

**Logs esperados:**
```
[BMAD:SupervisorAgent] ✅ Initial validation passed
[BMAD:SupervisorAgent] ✅ Intent validation passed
[BMAD:SupervisorAgent] ✅ Permission validation passed
[BMAD:SupervisorAgent] ✅ Query validation passed
[BMAD:SupervisorAgent] ✅ Final validation passed
```

---

#### Teste 8: Verificar Qualidade das Respostas
**Ação:**
Execute várias consultas e verifique se as respostas são relevantes

**O que verificar:**
- [ ] Respostas não são genéricas
- [ ] Respostas respondem diretamente à pergunta
- [ ] Quality score é adequado (> 70)
- [ ] Supervisor valida corretamente

---

### 4️⃣ Testes de Visualizações

#### Teste 9: Visualização de Card
**Comando:**
```
"Quantas empresas temos?"
```

**O que verificar:**
- [ ] Card é exibido com o número correto
- [ ] Visualização é clara e legível

---

#### Teste 10: Visualização de Tabela
**Comando:**
```
"Listar as primeiras 5 empresas"
```

**O que verificar:**
- [ ] Tabela é exibida corretamente
- [ ] Dados não têm objetos complexos (sem erro React #31)
- [ ] Colunas são legíveis

---

#### Teste 11: Visualização de Gráfico
**Comando:**
```
"Mostre um gráfico de barras com as empresas"
```

**O que verificar:**
- [ ] Gráfico é renderizado
- [ ] Dados estão corretos
- [ ] Gráfico é interativo (se aplicável)

---

### 5️⃣ Testes de Fluxo Completo

#### Teste 12: Fluxo Completo de Consulta
**Comando:**
```
"Quantas empresas temos e qual a média de colaboradores?"
```

**O que verificar:**
- [ ] Todos os agentes são executados na ordem correta
- [ ] Logs mostram todas as etapas (Step 1/12 até Step 12/12)
- [ ] Tempo de processamento é registrado
- [ ] Resumo final é exibido

**Logs esperados:**
```
[BMAD:Orchestrator] 📋 Step 1/12: Initial validation
[BMAD:Orchestrator] 📋 Step 2/12: Intent classification
...
[BMAD:Orchestrator] 📋 Step 12/12: Updating conversation history
[BMAD:Orchestrator] ✅ Command processing finished successfully in Xms
[BMAD:Orchestrator] 📊 Summary: { intent, qualityScore, visualizations, ... }
```

---

#### Teste 13: Teste de Erro e Recuperação
**Comando:**
```
"Buscar dados que não existem"
```

**O que verificar:**
- [ ] Erro é tratado graciosamente
- [ ] Mensagem de erro é clara
- [ ] Sistema não quebra
- [ ] Logs mostram o erro

---

### 6️⃣ Testes de Performance

#### Teste 14: Tempo de Resposta
**Ação:**
Execute várias consultas e verifique o tempo de processamento

**O que verificar:**
- [ ] Tempo de processamento < 5 segundos para consultas simples
- [ ] Tempo de processamento < 10 segundos para consultas complexas
- [ ] Logs mostram tempo total

---

#### Teste 15: Múltiplas Consultas Sequenciais
**Ação:**
Execute 5 consultas seguidas rapidamente

**O que verificar:**
- [ ] Sistema processa todas sem problemas
- [ ] Memória é otimizada entre consultas
- [ ] Histórico é mantido corretamente

---

## 🔍 Checklist de Validação

### Agentes BMAD
- [ ] VoiceIntentAgent classifica intenções corretamente
- [ ] PermissionAgent valida permissões
- [ ] ContextAgent coleta contexto
- [ ] DatabaseQueryAgent executa consultas corretamente
- [ ] DataVisualizationAgent gera visualizações
- [ ] FeedbackAgent gera respostas claras
- [ ] SupervisorAgent valida todas as etapas
- [ ] SuggestionAgent gera sugestões relevantes
- [ ] MemoryResourceAgent otimiza memória

### Especialista IA
- [ ] Avatar conecta corretamente
- [ ] Áudio é capturado (microfone)
- [ ] Transcrição funciona (Whisper)
- [ ] Respostas são faladas pelo avatar
- [ ] Visualizações são exibidas
- [ ] Histórico de comandos funciona

### Logs e Debugging
- [ ] Todos os agentes geram logs
- [ ] Logs são claros e informativos
- [ ] Erros são logados corretamente
- [ ] Performance é medida

---

## 🐛 Problemas Conhecidos e Soluções

### Problema: "ID da empresa não fornecido"
**Causa:** Consulta sendo classificada como `get_company_stats` em vez de `query_database`
**Solução:** Verificar logs do VoiceIntentAgent - deve classificar como `query_database`

### Problema: "Vectors must have the same length"
**Causa:** Embeddings com dimensões diferentes
**Solução:** Já corrigido - validação de dimensões adicionada

### Problema: Erro React #31
**Causa:** Objetos sendo renderizados diretamente
**Solução:** Já corrigido - JSON.stringify adicionado

### Problema: Resposta genérica
**Causa:** SupervisorAgent não validando corretamente
**Solução:** Verificar logs do SupervisorAgent e qualidade das respostas

---

## 📊 Métricas para Acompanhar

### Taxa de Sucesso
- Consultas que retornam resultados corretos
- Consultas que falham
- Consultas que precisam de correção

### Qualidade das Respostas
- Quality score médio
- Relevância das respostas
- Precisão das visualizações

### Performance
- Tempo médio de processamento
- Tempo por tipo de consulta
- Uso de memória

---

## 🎯 Próximos Passos Prioritários

1. **Testar consultas sobre empresas sem colaboradores**
   - Verificar se detecção está funcionando
   - Verificar se resposta é específica

2. **Validar logs de todos os agentes**
   - Garantir que todos os agentes estão sendo executados
   - Verificar se logs são claros

3. **Testar diferentes tipos de consultas**
   - Contagem, agregação, busca semântica, gráficos
   - Verificar se cada tipo funciona corretamente

4. **Validar visualizações**
   - Cards, tabelas, gráficos
   - Verificar se dados são exibidos corretamente

5. **Testar fluxo completo**
   - Do comando de voz até a resposta final
   - Verificar todas as etapas

---

## 📝 Como Reportar Problemas

Ao encontrar um problema:

1. **Copie os logs do console** (F12 > Console)
2. **Anote o comando de voz usado**
3. **Descreva o comportamento esperado vs. atual**
4. **Inclua screenshots se relevante**

Exemplo:
```
Comando: "Quantas empresas temos?"
Logs: [copiar logs aqui]
Comportamento esperado: Mostrar número de empresas
Comportamento atual: Erro "ID da empresa não fornecido"
```

---

## 🔗 Links Úteis

- **Produção**: https://4prosperaconnect.vercel.app
- **Especialista**: https://4prosperaconnect.vercel.app/specialist
- **Vercel Dashboard**: https://vercel.com
- **Supabase Dashboard**: https://app.supabase.com

---

**Última atualização:** Dezembro 2024

