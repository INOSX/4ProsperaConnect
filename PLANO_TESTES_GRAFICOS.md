# 🧪 Plano de Testes - Novos Tipos de Gráficos
**Sistema**: 4Prospera Connect - NEXUS Agent  
**Versão**: 1.0  
**Data**: 2025-01-04  
**Feature**: Gráficos Pizza, Linha, Área e Barras

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Ambiente de Teste](#ambiente-de-teste)
3. [Pré-requisitos](#pré-requisitos)
4. [Casos de Teste](#casos-de-teste)
5. [Matriz de Testes](#matriz-de-testes)
6. [Critérios de Aceitação](#critérios-de-aceitação)
7. [Relatório de Bugs](#relatório-de-bugs)

---

## 🎯 Visão Geral

### Objetivo
Validar a implementação de 4 tipos de gráficos no módulo especialista:
- **Gráfico de Barras** (Bar Chart)
- **Gráfico de Pizza** (Pie Chart)
- **Gráfico de Linha** (Line Chart)
- **Gráfico de Área** (Area Chart)

### Escopo
- Detecção automática de tipo de gráfico
- Detecção por palavra-chave do usuário
- Sugestão via QueryPlanningAgent (IA)
- Renderização visual correta
- Responsividade e animações

### Fora do Escopo
- Performance de queries SQL
- Testes de carga
- Testes de segurança
- Testes mobile (apenas desktop)

---

## 🌐 Ambiente de Teste

### URL de Teste
```
https://4prosperaconnect.vercel.app/specialist
```

### Credenciais
- **Usuário**: [Seu usuário]
- **Senha**: [Sua senha]

### Navegadores Suportados
- ✅ Chrome 120+ (recomendado)
- ✅ Edge 120+
- ✅ Firefox 120+
- ⚠️ Safari (não testado)

### Ferramentas Necessárias
- DevTools do navegador (F12)
- Screenshot tool (Windows: Win + Shift + S)

---

## ✅ Pré-requisitos

### Antes de Iniciar os Testes

1. **Verificar Deploy**
   - [ ] Build do Vercel finalizado com sucesso
   - [ ] Branch `main` está atualizado
   - [ ] Commit `3eb6d79` está deployado

2. **Preparar Ambiente**
   - [ ] Navegador com cache limpo (Ctrl + Shift + Del)
   - [ ] Console do DevTools aberto (F12)
   - [ ] Zoom do navegador em 100%

3. **Conectar Avatar**
   - [ ] Acessar `/specialist`
   - [ ] Clicar em "Conectar Especialista"
   - [ ] Avatar Bryan Tech Expert conectado
   - [ ] Status: "Conectado" visível

4. **Verificar Dados**
   - [ ] Banco tem pelo menos 5 empresas cadastradas
   - [ ] Empresas têm colaboradores vinculados
   - [ ] Dados visíveis via query: "Mostre as empresas"

---

## 🧪 Casos de Teste

### CT001 - Gráfico de Barras (Detecção Automática)

**Prioridade**: Alta  
**Tipo**: Funcional  
**Pré-condição**: Avatar conectado, dados disponíveis

#### Passos:
1. Enviar query: `"Mostre o número de colaboradores por empresa"`
2. Aguardar resposta do avatar
3. Observar gráfico renderizado

#### Resultado Esperado:
- ✅ Gráfico de **BARRAS** vertical aparece sob o avatar
- ✅ Badge superior mostra: **"BARRAS"**
- ✅ Eixo X: nomes das empresas
- ✅ Eixo Y: quantidade de colaboradores
- ✅ Barras com cores diferentes (roxo, rosa, laranja, verde, azul)
- ✅ Transparência do fundo permite ver parte do avatar
- ✅ Footer mostra: Total, Máximo, Média
- ✅ Console mostra: `🎯 Dados categóricos ou agrupamento → BARRAS`

#### Critérios de Falha:
- ❌ Gráfico não aparece
- ❌ Tipo errado (Pizza, Linha, Área)
- ❌ Eixos sem labels
- ❌ Cores todas iguais

---

### CT002 - Gráfico de Pizza (Palavra-chave Explícita)

**Prioridade**: Alta  
**Tipo**: Funcional  
**Pré-condição**: Avatar conectado, dados disponíveis

#### Passos:
1. Enviar query: `"Mostre um gráfico de pizza com colaboradores por empresa"`
2. Aguardar resposta do avatar
3. Observar gráfico renderizado

#### Resultado Esperado:
- ✅ Gráfico de **PIZZA** circular aparece sob o avatar
- ✅ Badge superior mostra: **"PIZZA"**
- ✅ Cada empresa é uma fatia com cor diferente
- ✅ Sem eixos (pizza não tem eixos X/Y)
- ✅ Hover sobre fatia mostra: nome da empresa + quantidade
- ✅ Footer mostra: Total, Máximo, Média
- ✅ Console mostra: `🎯 Usuário pediu PIZZA explicitamente`

#### Critérios de Falha:
- ❌ Mostra Barras ao invés de Pizza
- ❌ Fatias sem cores diferentes
- ❌ Tooltip não funciona
- ❌ Eixos aparecem (erro de configuração)

---

### CT003 - Gráfico de Linha (Palavra-chave Explícita)

**Prioridade**: Alta  
**Tipo**: Funcional  
**Pré-condição**: Avatar conectado, dados disponíveis

#### Passos:
1. Enviar query: `"Mostre um gráfico de linha com colaboradores por empresa"`
2. Aguardar resposta do avatar
3. Observar gráfico renderizado

#### Resultado Esperado:
- ✅ Gráfico de **LINHA** aparece sob o avatar
- ✅ Badge superior mostra: **"LINHA"**
- ✅ Linha conectando todos os pontos
- ✅ Pontos visíveis nas intersecções (círculos)
- ✅ **SEM preenchimento** abaixo da linha
- ✅ Cor da linha: roxo (#8b5cf6)
- ✅ Eixos X e Y visíveis com labels
- ✅ Footer mostra: Total, Máximo, Média
- ✅ Console mostra: `🎯 Usuário pediu LINHA explicitamente`

#### Critérios de Falha:
- ❌ Mostra Área com preenchimento (erro: deveria ser Linha)
- ❌ Linha desconectada ou tracejada
- ❌ Pontos não aparecem
- ❌ Cores erradas

---

### CT004 - Gráfico de Área (Palavra-chave Explícita)

**Prioridade**: Alta  
**Tipo**: Funcional  
**Pré-condição**: Avatar conectado, dados disponíveis

#### Passos:
1. Enviar query: `"Mostre um gráfico de área com colaboradores por empresa"`
2. Aguardar resposta do avatar
3. Observar gráfico renderizado

#### Resultado Esperado:
- ✅ Gráfico de **ÁREA** aparece sob o avatar
- ✅ Badge superior mostra: **"ÁREA"**
- ✅ Linha com **preenchimento gradiente** abaixo
- ✅ Preenchimento transparente (permite ver avatar)
- ✅ Curvas **suaves** (não angulares)
- ✅ Cor: roxo com gradiente (#6366f1 → transparente)
- ✅ Eixos X e Y visíveis
- ✅ Footer mostra: Total, Máximo, Média
- ✅ Console mostra: `🎯 Usuário pediu ÁREA explicitamente`

#### Critérios de Falha:
- ❌ Sem preenchimento (erro: deveria ter)
- ❌ Preenchimento opaco (deve ser transparente)
- ❌ Linha angular/rígida (deve ser suave)
- ❌ Badge errado

---

### CT005 - Detecção Automática de Pizza (Poucos Dados)

**Prioridade**: Média  
**Tipo**: Funcional  
**Pré-condição**: Banco com 2-6 empresas cadastradas

#### Passos:
1. Verificar que há entre 2 e 6 empresas no banco
2. Enviar query: `"Mostre colaboradores por empresa"` (sem mencionar tipo)
3. Aguardar resposta do avatar
4. Observar tipo de gráfico escolhido

#### Resultado Esperado:
- ✅ Sistema **PODE** escolher Pizza automaticamente (2-6 dados)
- ✅ Badge mostra: **"PIZZA"** 
- ✅ Console mostra: `🎯 Poucos dados categóricos (X) → PIZZA`
- ✅ OU sistema escolhe Barras (também aceitável)

#### Critérios de Falha:
- ❌ Erro ao renderizar
- ❌ Gráfico não aparece

**Nota**: Este teste é de comportamento esperado, não obrigatório. Pizza é SUGERIDA para 2-6 dados, mas Barras também é válido.

---

### CT006 - Detecção Automática de Área (Palavra-chave)

**Prioridade**: Média  
**Tipo**: Funcional  
**Pré-condição**: Avatar conectado, dados disponíveis

#### Passos:
1. Enviar query: `"Mostre o crescimento de colaboradores por empresa"`
2. Aguardar resposta
3. Observar tipo de gráfico

#### Resultado Esperado:
- ✅ Sistema detecta palavra "crescimento"
- ✅ Escolhe gráfico de **ÁREA** automaticamente
- ✅ Badge mostra: **"ÁREA"**
- ✅ Console mostra: `🎯 Dados temporais com tendência → ÁREA`

#### Variações de Teste:
- `"Mostre a evolução de colaboradores"`
- `"Mostre a tendência de colaboradores"`
- `"Mostre o aumento de colaboradores"`

---

### CT007 - Sugestão do QueryPlanningAgent (IA)

**Prioridade**: Baixa  
**Tipo**: Integração  
**Pré-condição**: Avatar conectado, OpenAI configurada

#### Passos:
1. Enviar query: `"Distribua os colaboradores por empresa em um gráfico"`
2. Abrir console e procurar por: `suggestedChartType`
3. Verificar se OpenAI sugeriu um tipo

#### Resultado Esperado:
- ✅ Console mostra: `🎯 Tipo de gráfico sugerido pelo QueryPlanner: bar`
- ✅ Sistema usa a sugestão da IA
- ✅ Gráfico renderizado corresponde à sugestão

#### Critérios de Falha:
- ❌ `suggestedChartType: undefined` (IA não sugeriu)
- ❌ Sistema ignora sugestão da IA
- ❌ Erro na chamada OpenAI

---

### CT008 - Título do Gráfico Inteligente

**Prioridade**: Baixa  
**Tipo**: UX  
**Pré-condição**: Avatar conectado

#### Passos:
1. Enviar query: `"Número de colaboradores por empresa"`
2. Verificar título do gráfico

#### Resultado Esperado:
- ✅ Título: **"Colaboradores por Empresa"** (curto e claro)
- ✅ **NÃO** deve aparecer: "Esta consulta agrupa os dados da tabela..."
- ✅ Título truncado se muito longo (>60 chars)

#### Critérios de Falha:
- ❌ Título técnico demais
- ❌ Título muito longo (não truncado)
- ❌ Título "undefined" ou "null"

---

### CT009 - Estatísticas no Footer

**Prioridade**: Baixa  
**Tipo**: Funcional  
**Pré-condição**: Gráfico renderizado

#### Passos:
1. Renderizar qualquer gráfico (Barras, Pizza, Linha ou Área)
2. Verificar footer do gráfico

#### Resultado Esperado:
- ✅ Footer mostra 3 colunas:
  - **Total**: Número total de registros
  - **Máximo**: Maior valor do eixo Y
  - **Média**: Média dos valores (arredondada)
- ✅ Valores numéricos corretos
- ✅ Labels em português

#### Critérios de Falha:
- ❌ Footer vazio
- ❌ Valores incorretos (não batem com dados)
- ❌ Labels em inglês

---

### CT010 - Hover Tooltip

**Prioridade**: Baixa  
**Tipo**: Interação  
**Pré-condição**: Gráfico renderizado

#### Passos:
1. Renderizar qualquer gráfico
2. Passar mouse sobre os dados (barra, fatia, ponto)
3. Verificar tooltip

#### Resultado Esperado:
- ✅ Tooltip aparece em fundo escuro semi-transparente
- ✅ Mostra nome completo (sem truncar)
- ✅ Mostra valor exato
- ✅ Tooltip segue o mouse
- ✅ Desaparece ao sair

#### Critérios de Falha:
- ❌ Tooltip não aparece
- ❌ Mostra "undefined" ou valores errados
- ❌ Tooltip fica "presa" na tela

---

### CT011 - Transparência do Fundo

**Prioridade**: Média  
**Tipo**: Visual  
**Pré-condição**: Avatar conectado, gráfico renderizado

#### Passos:
1. Renderizar qualquer gráfico
2. Observar se o avatar Bryan é visível através do gráfico

#### Resultado Esperado:
- ✅ Fundo do gráfico é semi-transparente
- ✅ Avatar Bryan parcialmente visível através do gráfico
- ✅ Glassmorphism aplicado (blur + transparência)
- ✅ Dados do gráfico ainda legíveis

#### Critérios de Falha:
- ❌ Fundo 100% opaco (não vê avatar)
- ❌ Fundo 100% transparente (não vê container)
- ❌ Dados ilegíveis por excesso de transparência

---

### CT012 - Animação de Entrada

**Prioridade**: Baixa  
**Tipo**: Visual  
**Pré-condição**: Avatar conectado

#### Passos:
1. Enviar query que gera gráfico
2. Observar aparição do gráfico

#### Resultado Esperado:
- ✅ Gráfico **não** aparece instantaneamente
- ✅ Animação de entrada (fade + slide up)
- ✅ Duração: ~700ms
- ✅ Transição suave

#### Critérios de Falha:
- ❌ Gráfico aparece de forma abrupta
- ❌ Animação muito lenta (>2s)
- ❌ Animação entrecortada

---

### CT013 - Posicionamento do Gráfico

**Prioridade**: Alta  
**Tipo**: Layout  
**Pré-condição**: Avatar conectado

#### Passos:
1. Renderizar gráfico
2. Verificar posicionamento em relação ao avatar

#### Resultado Esperado:
- ✅ Gráfico aparece **embaixo do avatar**
- ✅ Não cobre o rosto do Bryan
- ✅ Centralizado horizontalmente
- ✅ Margem de 16px do fundo (`bottom-4`)
- ✅ Largura máxima: `max-w-2xl`

#### Critérios de Falha:
- ❌ Gráfico cobre rosto do avatar
- ❌ Desalinhado (não centralizado)
- ❌ Muito perto do fundo (sem margem)
- ❌ Muito largo (ultrapassa limites)

---

### CT014 - Múltiplas Queries Sequenciais

**Prioridade**: Média  
**Tipo**: Integração  
**Pré-condição**: Avatar conectado

#### Passos:
1. Enviar query 1: `"Mostre um gráfico de barras"`
2. Aguardar renderização
3. Enviar query 2: `"Mostre um gráfico de pizza"` (NOVA query)
4. Verificar se gráfico anterior é substituído

#### Resultado Esperado:
- ✅ Gráfico 1 (Barras) aparece corretamente
- ✅ Gráfico 2 (Pizza) **substitui** o anterior
- ✅ Apenas 1 gráfico visível por vez
- ✅ Sem "acúmulo" de gráficos

#### Critérios de Falha:
- ❌ 2 gráficos aparecem ao mesmo tempo
- ❌ Gráfico anterior não desaparece
- ❌ Erro ao renderizar segundo gráfico

---

### CT015 - Gráfico com Dados Vazios

**Prioridade**: Média  
**Tipo**: Edge Case  
**Pré-condição**: Avatar conectado

#### Passos:
1. Enviar query que retorna 0 resultados: `"Mostre colaboradores da empresa inexistente"`
2. Verificar comportamento

#### Resultado Esperado:
- ✅ Avatar responde: "Não encontrei dados"
- ✅ **Nenhum gráfico** é renderizado
- ✅ Console mostra: `⚠️ Sem dados para renderizar`
- ✅ Sem erros JavaScript

#### Critérios de Falha:
- ❌ Gráfico vazio aparece
- ❌ Erro JavaScript no console
- ❌ Avatar trava

---

## 📊 Matriz de Testes

| ID | Caso de Teste | Tipo Gráfico | Prioridade | Status | Observações |
|----|---------------|--------------|------------|--------|-------------|
| CT001 | Barras (Auto) | Bar | Alta | ⬜ Não Testado | - |
| CT002 | Pizza (Explícito) | Pie | Alta | ⬜ Não Testado | - |
| CT003 | Linha (Explícito) | Line | Alta | ⬜ Não Testado | - |
| CT004 | Área (Explícito) | Area | Alta | ⬜ Não Testado | - |
| CT005 | Pizza (Auto) | Pie | Média | ⬜ Não Testado | Comportamento sugerido |
| CT006 | Área (Palavra-chave) | Area | Média | ⬜ Não Testado | - |
| CT007 | Sugestão IA | Vários | Baixa | ⬜ Não Testado | - |
| CT008 | Título Inteligente | Vários | Baixa | ⬜ Não Testado | - |
| CT009 | Footer Stats | Vários | Baixa | ⬜ Não Testado | - |
| CT010 | Tooltip Hover | Vários | Baixa | ⬜ Não Testado | - |
| CT011 | Transparência | Vários | Média | ⬜ Não Testado | - |
| CT012 | Animação | Vários | Baixa | ⬜ Não Testado | - |
| CT013 | Posicionamento | Vários | Alta | ⬜ Não Testado | - |
| CT014 | Múltiplas Queries | Vários | Média | ⬜ Não Testado | - |
| CT015 | Dados Vazios | Nenhum | Média | ⬜ Não Testado | - |

**Legenda:**
- ⬜ Não Testado
- ✅ Passou
- ❌ Falhou
- ⚠️ Bloqueado

---

## ✅ Critérios de Aceitação

### Mínimo para Aprovação (MVP)
Para a feature ser considerada **APROVADA**, deve atender:

1. **Funcionalidade Básica** (Obrigatório)
   - [ ] CT001 - Barras (Auto) = ✅ Passou
   - [ ] CT002 - Pizza (Explícito) = ✅ Passou
   - [ ] CT003 - Linha (Explícito) = ✅ Passou
   - [ ] CT004 - Área (Explícito) = ✅ Passou
   - [ ] CT013 - Posicionamento = ✅ Passou

2. **Visual** (Obrigatório)
   - [ ] CT011 - Transparência = ✅ Passou
   - [ ] Todos os gráficos renderizam corretamente
   - [ ] Avatar não é coberto

3. **Sem Erros Críticos**
   - [ ] Nenhum erro JavaScript no console
   - [ ] Sem travamentos do avatar
   - [ ] Sem perda de dados

### Desejável (Não Bloqueante)
- [ ] CT005 - Pizza (Auto)
- [ ] CT006 - Área (Palavra-chave)
- [ ] CT007 - Sugestão IA
- [ ] CT010 - Tooltip Hover
- [ ] CT012 - Animação

---

## 🐛 Relatório de Bugs

### Template de Bug Report

```markdown
**ID do Bug**: BUG-XXX
**Caso de Teste**: CTXXX
**Prioridade**: Alta/Média/Baixa
**Status**: Aberto/Em Análise/Resolvido

**Descrição**:
[Descreva o problema encontrado]

**Passos para Reproduzir**:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado**:
[O que deveria acontecer]

**Resultado Atual**:
[O que está acontecendo]

**Evidências**:
- Screenshot: [anexar]
- Console log: [colar]
- Vídeo: [link se disponível]

**Ambiente**:
- Navegador: [Chrome 120]
- SO: [Windows 11]
- URL: [https://...]
- Data/Hora: [2025-01-04 10:30]
```

### Bugs Conhecidos
_Lista vazia - preencher durante os testes_

---

## 📈 Métricas de Qualidade

### Cobertura de Testes
- **Total de Casos**: 15
- **Prioridade Alta**: 5 (33%)
- **Prioridade Média**: 6 (40%)
- **Prioridade Baixa**: 4 (27%)

### Metas de Aprovação
- ✅ **100%** dos casos Alta prioridade devem passar
- ✅ **80%** dos casos Média prioridade devem passar
- ✅ **50%** dos casos Baixa prioridade devem passar

---

## 📝 Checklist de Execução

### Antes de Começar
- [ ] Deploy do Vercel concluído
- [ ] Navegador preparado (cache limpo)
- [ ] Console aberto (F12)
- [ ] Avatar Bryan conectado
- [ ] Documento de testes aberto

### Durante os Testes
- [ ] Anotar resultados na Matriz de Testes
- [ ] Capturar screenshots de falhas
- [ ] Copiar logs do console
- [ ] Registrar bugs encontrados

### Após os Testes
- [ ] Atualizar status de todos os casos
- [ ] Calcular taxa de aprovação
- [ ] Criar relatório executivo
- [ ] Comunicar resultados

---

## 🎯 Próximos Passos

### Se APROVADO (80%+ dos testes passam)
1. ✅ Marcar feature como "Pronto para Produção"
2. ✅ Comunicar sucesso ao time
3. ✅ Preparar documentação de usuário
4. ✅ Planejar treinamento

### Se REPROVADO (< 80% dos testes passam)
1. ❌ Levantar todos os bugs críticos
2. ❌ Priorizar correções
3. ❌ Aguardar novo deploy
4. ❌ Re-testar casos que falharam

---

## 📞 Contatos

**Desenvolvedor**: [Seu nome]  
**QA Lead**: [Nome do QA]  
**Product Owner**: [Nome do PO]  

---

**Última Atualização**: 2025-01-04  
**Versão do Documento**: 1.0
