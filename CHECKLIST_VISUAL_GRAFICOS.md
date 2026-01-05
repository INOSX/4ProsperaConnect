# 🎨 Checklist Visual - Tipos de Gráficos

**Use este documento lado-a-lado com o navegador durante os testes**

---

## 📊 Gráfico de BARRAS

### Características Visuais

```
┌──────────────────────────────────────┐
│  📊  Título do Gráfico      BARRAS   │
├──────────────────────────────────────┤
│                                      │
│     ██          Barras verticais     │
│     ██    ██    Cores variadas       │
│  ██ ██ ██ ██    Sem preenchimento    │
│  ██ ██ ██ ██                         │
│  ──────────────                      │
│  E1 E2 E3 E4                         │
│                                      │
├──────────────────────────────────────┤
│ Total: 8 │ Máximo: 8 │ Média: 3     │
└──────────────────────────────────────┘
```

### ✅ Checklist
- [ ] Barras **verticais** (não horizontais)
- [ ] **Múltiplas cores** (roxo, rosa, laranja, verde, azul)
- [ ] Eixo X visível com **labels** (nomes das empresas)
- [ ] Eixo Y visível com **números** (quantidade)
- [ ] Badge superior: **"BARRAS"**
- [ ] Fundo semi-transparente (vejo avatar)
- [ ] Footer com 3 estatísticas

### ❌ Erros Comuns
- ❌ Todas as barras da mesma cor
- ❌ Eixos sem labels
- ❌ Fundo 100% opaco
- ❌ Badge mostra outro tipo

---

## 🍕 Gráfico de PIZZA

### Características Visuais

```
┌──────────────────────────────────────┐
│  🥧  Título do Gráfico      PIZZA    │
├──────────────────────────────────────┤
│                                      │
│          ╱───╲                       │
│        ╱   ┃   ╲  Círculo completo  │
│       │────┼────│  Fatias coloridas  │
│        ╲   ┃   ╱  Cada = 1 empresa  │
│          ╲───╱                       │
│                                      │
│     SEM eixos X/Y                    │
│                                      │
├──────────────────────────────────────┤
│ Total: 8 │ Máximo: 8 │ Média: 3     │
└──────────────────────────────────────┘
```

### ✅ Checklist
- [ ] Formato **circular** (não retangular)
- [ ] Cada fatia com **cor diferente**
- [ ] **SEM eixos** X ou Y (pizza não tem eixos!)
- [ ] Badge superior: **"PIZZA"**
- [ ] Hover mostra tooltip com nome + valor
- [ ] Fundo semi-transparente
- [ ] Footer com 3 estatísticas

### ❌ Erros Comuns
- ❌ Aparece eixos X/Y (erro: é pizza!)
- ❌ Todas as fatias da mesma cor
- ❌ Não é circular
- ❌ Tooltip não funciona

---

## 📈 Gráfico de LINHA

### Características Visuais

```
┌──────────────────────────────────────┐
│  📈  Título do Gráfico      LINHA    │
├──────────────────────────────────────┤
│                                      │
│       ●───●       Linha conectada    │
│      ╱     ╲      Pontos visíveis    │
│     ●       ●     SEM preenchimento  │
│    ╱         ╲    Cor: roxo          │
│   ●───────────●                      │
│   ──────────────                     │
│   E1 E2 E3 E4                        │
│                                      │
├──────────────────────────────────────┤
│ Total: 8 │ Máximo: 8 │ Média: 3     │
└──────────────────────────────────────┘
```

### ✅ Checklist
- [ ] Linha **conectando** todos os pontos
- [ ] Pontos **visíveis** (círculos pequenos)
- [ ] **SEM preenchimento** abaixo da linha (importante!)
- [ ] Cor: roxo (#8b5cf6)
- [ ] Badge superior: **"LINHA"**
- [ ] Eixos X e Y visíveis
- [ ] Linha **contínua** (não tracejada)
- [ ] Fundo semi-transparente

### ❌ Erros Comuns
- ❌ **TEM preenchimento** (erro: deveria ser Área!)
- ❌ Pontos não aparecem
- ❌ Linha desconectada ou tracejada
- ❌ Cores erradas

---

## 🏔️ Gráfico de ÁREA

### Características Visuais

```
┌──────────────────────────────────────┐
│  🏔️  Título do Gráfico      ÁREA     │
├──────────────────────────────────────┤
│                                      │
│       ●───●       Linha no topo      │
│      ╱█████╲      Preenchimento!    │
│     ●███████●     Gradiente suave    │
│    ╱█████████╲    Transparente      │
│   ●███████████●   Curvas suaves      │
│   ──────────────                     │
│   E1 E2 E3 E4                        │
│                                      │
├──────────────────────────────────────┤
│ Total: 8 │ Máximo: 8 │ Média: 3     │
└──────────────────────────────────────┘
```

### ✅ Checklist
- [ ] Linha no topo + **preenchimento gradiente** abaixo
- [ ] Preenchimento **transparente** (vejo avatar através)
- [ ] Curvas **suaves** (não angulares/rígidas)
- [ ] Cor: roxo com gradiente para transparente
- [ ] Badge superior: **"ÁREA"**
- [ ] Eixos X e Y visíveis
- [ ] Pontos nas intersecções
- [ ] Gradiente de cima (mais escuro) para baixo (mais claro)

### ❌ Erros Comuns
- ❌ **SEM preenchimento** (erro: deveria ser Linha!)
- ❌ Preenchimento 100% opaco (deve ser transparente)
- ❌ Linha angular/rígida (deve ser suave)
- ❌ Cor sólida ao invés de gradiente

---

## 🎨 Comparação Lado-a-Lado

| Característica | Barras | Pizza | Linha | Área |
|----------------|--------|-------|-------|------|
| **Forma** | Retângulos | Círculo | Linha | Linha + Fill |
| **Preenchimento** | ❌ Não | N/A | ❌ Não | ✅ Sim |
| **Eixos X/Y** | ✅ Sim | ❌ Não | ✅ Sim | ✅ Sim |
| **Pontos** | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Múltiplas Cores** | ✅ Sim | ✅ Sim | ❌ Não | ❌ Não |
| **Transparência Fill** | N/A | N/A | N/A | ✅ Sim |
| **Curvas Suaves** | N/A | N/A | Leve | ✅ Forte |

---

## 🔍 Guia de Identificação Rápida

### Como saber qual tipo é?

#### 1️⃣ Tem retângulos verticais?
→ **BARRAS**

#### 2️⃣ É redondo/circular?
→ **PIZZA**

#### 3️⃣ É linha SEM preenchimento?
→ **LINHA**

#### 4️⃣ É linha COM preenchimento gradiente?
→ **ÁREA**

---

## 📐 Elementos Comuns (Todos os Tipos)

### ✅ Devem ter:
- [ ] **Badge** no canto superior direito
- [ ] **Título** centralizado no topo
- [ ] **Footer** com 3 estatísticas:
  - Total (quantidade de registros)
  - Máximo (maior valor)
  - Média (valor médio arredondado)
- [ ] **Fundo semi-transparente** (glassmorphism)
- [ ] **Blur** no fundo (backdrop-blur-lg)
- [ ] **Bordas arredondadas** (rounded-2xl)
- [ ] **Sombra** (shadow-2xl)
- [ ] **Animação de entrada** (fade + slide up)

### ✅ Comportamentos:
- [ ] Hover mostra **tooltip** com dados
- [ ] Tooltip fundo escuro semi-transparente
- [ ] Tooltip mostra nome completo + valor
- [ ] Gráfico **centralizado** horizontalmente
- [ ] Gráfico **embaixo do avatar** (não cobre rosto)
- [ ] Distância do fundo: 16px (bottom-4)
- [ ] Largura máxima: max-w-2xl

---

## 🎯 Cores Padrão

### Barras e Pizza (Múltiplas)
1. 🟣 Roxo: `rgba(99, 102, 241, 0.8)`
2. 🟪 Roxo claro: `rgba(139, 92, 246, 0.8)`
3. 🩷 Rosa: `rgba(236, 72, 153, 0.8)`
4. 🧡 Laranja: `rgba(251, 146, 60, 0.8)`
5. 💚 Verde: `rgba(34, 197, 94, 0.8)`
6. 💙 Azul: `rgba(59, 130, 246, 0.8)`
7. 💜 Roxo médio: `rgba(168, 85, 247, 0.8)`
8. ❤️ Vermelho: `rgba(244, 63, 94, 0.8)`

### Linha
- Linha: 🟣 Roxo `rgba(139, 92, 246, 1)`
- Pontos: 🟣 Roxo com borda branca

### Área
- Linha: 🟣 Roxo `rgba(99, 102, 241, 1)`
- Preenchimento: 🟣 Roxo transparente `rgba(99, 102, 241, 0.3)`
- Pontos: 🟣 Roxo com borda branca

---

## 🐛 Bugs Visuais a Procurar

### CRÍTICOS (Falha Grave)
- ❌ Gráfico cobre o rosto do avatar
- ❌ Fundo 100% opaco (não vejo nada do avatar)
- ❌ Gráfico não aparece quando deveria
- ❌ Badge mostra tipo errado (ex: Barras mas é Pizza)

### MÉDIOS (Problema Notável)
- ⚠️ Cores todas iguais (deve ser variado)
- ⚠️ Sem eixos quando deveria ter
- ⚠️ Com eixos quando NÃO deveria ter
- ⚠️ Tooltip não funciona
- ⚠️ Footer vazio ou com valores errados

### BAIXOS (Cosmético)
- ⚠️ Transparência muito alta ou muito baixa
- ⚠️ Animação muito rápida/lenta
- ⚠️ Título truncado incorretamente
- ⚠️ Alinhamento levemente off

---

## 📸 Checklist de Screenshots

Se encontrar bug, capture:
- [ ] Screenshot do gráfico completo
- [ ] Screenshot do console (F12)
- [ ] Screenshot do DevTools (Network se erro de API)
- [ ] Screenshot do tooltip (se bug de hover)
- [ ] Screenshot do footer (se bug de estatísticas)

---

## ✅ Aprovação Final

### Para APROVAR feature:
```
✅ Barras renderiza corretamente
✅ Pizza renderiza corretamente
✅ Linha renderiza corretamente
✅ Área renderiza corretamente
✅ Badges corretos em todos
✅ Transparência funciona
✅ Avatar não é coberto
✅ Sem erros no console
```

**Se todos ✅**: Feature APROVADA! 🎉  
**Se qualquer ❌**: Reportar bug e re-testar após correção

---

**Imprima este documento ou mantenha aberto durante os testes!**
