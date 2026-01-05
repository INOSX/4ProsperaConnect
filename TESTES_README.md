# 📚 Documentação de Testes - Gráficos

Este diretório contém toda a documentação necessária para testar os novos tipos de gráficos implementados no NEXUS Agent.

---

## 📄 Documentos Disponíveis

### 1. 📋 **PLANO_TESTES_GRAFICOS.md** 
**Para quem?** QA, Testadores, Desenvolvedores  
**Quando usar?** Testes formais e completos

**Conteúdo:**
- 15 casos de teste detalhados
- Passos de execução passo-a-passo
- Critérios de aceitação claros
- Matriz de testes completa
- Template de relatório de bugs
- Métricas de qualidade

**Tempo estimado:** 30-45 minutos

---

### 2. ⚡ **SCRIPTS_TESTES_RAPIDOS.md**
**Para quem?** Qualquer pessoa  
**Quando usar?** Validação rápida, smoke tests

**Conteúdo:**
- 4 scripts de execução rápida
- Queries prontas para copiar/colar
- Checklist de verificação visual
- Template de resultado
- Critérios de aprovação simplificados

**Tempo estimado:** 10 minutos

---

### 3. 🎨 **CHECKLIST_VISUAL_GRAFICOS.md**
**Para quem?** Testadores visuais, Designers  
**Quando usar?** Validação de UX/UI, durante testes

**Conteúdo:**
- Representações visuais (ASCII art)
- Características de cada tipo de gráfico
- Comparação lado-a-lado
- Guia de cores e estilos
- Lista de bugs visuais comuns

**Tempo estimado:** Referência durante testes

---

## 🚀 Começando

### Teste Rápido (10 min)
```bash
1. Abra: SCRIPTS_TESTES_RAPIDOS.md
2. Execute o "Script 1: Validação Básica"
3. Marque ✅ ou ❌ para cada query
4. Se todos passarem = APROVADO!
```

### Teste Completo (45 min)
```bash
1. Abra: PLANO_TESTES_GRAFICOS.md
2. Execute todos os 15 casos de teste
3. Preencha a Matriz de Testes
4. Calcule taxa de aprovação
5. Gere relatório final
```

### Referência Visual (contínuo)
```bash
1. Abra: CHECKLIST_VISUAL_GRAFICOS.md
2. Mantenha lado-a-lado com navegador
3. Compare gráficos renderizados com exemplos
4. Verifique cores, formas, comportamentos
```

---

## 🎯 Fluxo Recomendado

### Para Primeira Vez
1. ✅ Execute **Scripts Rápidos** primeiro
2. ✅ Se passou, pule para uso normal
3. ❌ Se falhou, execute **Plano Completo**
4. 📸 Use **Checklist Visual** para comparar

### Para Re-testes (após bug fix)
1. ✅ Localize caso que falhou no **Plano Completo**
2. ✅ Re-execute apenas aquele caso
3. ✅ Se passar, marque como resolvido

### Para Testes de Regressão
1. ✅ Execute **Scripts Rápidos** (10 min)
2. ✅ Se passou, feature ainda funciona
3. ❌ Se falhou, executar **Plano Completo**

---

## 📊 Tipos de Gráficos Testados

### Gráfico de Barras 📊
- Comparações categóricas
- Distribuições
- Agrupamentos
- **Query exemplo:** "Mostre colaboradores por empresa"

### Gráfico de Pizza 🥧
- Distribuição percentual
- Poucos dados (2-6 categorias)
- Proporções
- **Query exemplo:** "Mostre gráfico de pizza..."

### Gráfico de Linha 📈
- Séries temporais
- Evolução ao longo do tempo
- Tendências simples
- **Query exemplo:** "Mostre gráfico de linha..."

### Gráfico de Área 🏔️
- Séries temporais com ênfase
- Crescimento/tendência
- Evolução destacada
- **Query exemplo:** "Mostre crescimento de..."

---

## 🔍 Como Reportar Bugs

### 1. Identificou um bug?
```bash
1. Abra: PLANO_TESTES_GRAFICOS.md
2. Vá até seção "Relatório de Bugs"
3. Copie o template
4. Preencha todos os campos
5. Capture evidências (screenshots + console)
```

### 2. Template Rápido
```markdown
**Bug**: [Descrição curta]
**Caso**: CT00X
**Prioridade**: Alta/Média/Baixa

**Passos**:
1. [Como reproduzir]

**Esperado**: [O que deveria acontecer]
**Atual**: [O que está acontecendo]

**Evidências**: [screenshots/logs]
```

---

## 📈 Métricas de Qualidade

### Feature é APROVADA se:
- ✅ 100% dos testes de **Alta prioridade** passam (5 casos)
- ✅ 80% dos testes de **Média prioridade** passam (5 de 6)
- ✅ 50% dos testes de **Baixa prioridade** passam (2 de 4)

### Feature é REPROVADA se:
- ❌ Qualquer teste **Alta prioridade** falha
- ❌ < 80% dos testes **Média prioridade** passam
- ❌ Erro crítico encontrado (trava, perda de dados)

---

## 🛠️ Troubleshooting

### "Gráfico não aparece"
1. Verifique console (F12) por erros
2. Hard refresh: Ctrl + Shift + R
3. Limpe cache do navegador
4. Verifique se avatar está conectado

### "Tipo errado de gráfico"
1. Verifique palavra-chave na query
2. Use tipo explícito: "Mostre gráfico de pizza..."
3. Verifique console: veja qual tipo foi detectado
4. Confirme que deploy está completo (2-3 min)

### "Cores erradas ou todas iguais"
1. Hard refresh: Ctrl + Shift + R
2. Limpe cache: Ctrl + Shift + Del
3. Verifique console por erros do Chart.js
4. Compare com CHECKLIST_VISUAL_GRAFICOS.md

---

## 📞 Suporte

### Documentação Técnica
- `FloatingChart.jsx` - Componente de renderização
- `DataVisualizationAgent.js` - Lógica de detecção
- `QueryPlanningAgent.js` - Sugestão via IA

### Dúvidas?
1. Consulte `CHECKLIST_VISUAL_GRAFICOS.md` para referência visual
2. Execute `SCRIPTS_TESTES_RAPIDOS.md` para validação rápida
3. Consulte `PLANO_TESTES_GRAFICOS.md` para detalhes

---

## 🎉 Aprovação

### Quando feature for APROVADA:
1. ✅ Marque todos os casos como "Passou"
2. ✅ Calcule taxa de aprovação (deve ser ≥ 80%)
3. ✅ Comunique time
4. ✅ Feature pronta para produção!

### Quando feature for REPROVADA:
1. ❌ Liste todos os bugs encontrados
2. ❌ Priorize correções (Alta → Média → Baixa)
3. ❌ Aguarde novo deploy
4. ❌ Re-execute apenas casos que falharam

---

**Última Atualização**: 2025-01-04  
**Versão**: 1.0  
**Feature**: Gráficos Pizza, Linha, Área, Barras
