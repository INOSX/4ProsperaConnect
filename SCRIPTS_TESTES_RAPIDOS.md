# ⚡ Scripts de Testes Rápidos - Gráficos

**Tempo Estimado**: 10 minutos  
**Objetivo**: Validação rápida dos 4 tipos de gráficos

---

## 🚀 Setup Inicial (1 minuto)

```bash
1. Acesse: https://4prosperaconnect.vercel.app/specialist
2. Faça login
3. Clique em "Conectar Especialista"
4. Aguarde Bryan Tech Expert conectar
5. Abra Console (F12)
```

---

## 📋 Script 1: Validação Básica (4 tipos)
**Tempo**: 5 minutos

### Query 1: Barras
```
Envie: "Mostre o número de colaboradores por empresa"
```
**Verificar**:
- [ ] Gráfico de BARRAS aparece
- [ ] Badge: "BARRAS"
- [ ] Múltiplas cores
- [ ] Console: `→ BARRAS`

---

### Query 2: Pizza
```
Envie: "Mostre um gráfico de pizza com colaboradores por empresa"
```
**Verificar**:
- [ ] Gráfico de PIZZA aparece
- [ ] Badge: "PIZZA"
- [ ] Fatias coloridas
- [ ] Console: `pediu PIZZA explicitamente`

---

### Query 3: Linha
```
Envie: "Mostre um gráfico de linha com colaboradores por empresa"
```
**Verificar**:
- [ ] Gráfico de LINHA aparece
- [ ] Badge: "LINHA"
- [ ] Linha conectada + pontos
- [ ] SEM preenchimento
- [ ] Console: `pediu LINHA explicitamente`

---

### Query 4: Área
```
Envie: "Mostre um gráfico de área com colaboradores por empresa"
```
**Verificar**:
- [ ] Gráfico de ÁREA aparece
- [ ] Badge: "ÁREA"
- [ ] Linha + preenchimento gradiente
- [ ] Curvas suaves
- [ ] Console: `pediu ÁREA explicitamente`

---

## 📊 Script 2: Detecção Automática
**Tempo**: 3 minutos

### Teste 1: Palavra-chave "crescimento"
```
Envie: "Mostre o crescimento de colaboradores por empresa"
```
**Esperado**: Gráfico de ÁREA (auto-detectado)  
**Console**: `tendência → ÁREA`

---

### Teste 2: Poucos dados (se aplicável)
```
Envie: "Mostre colaboradores por empresa"
```
**Se 2-6 empresas**: PODE mostrar PIZZA  
**Se 7+ empresas**: DEVE mostrar BARRAS  
**Ambos são válidos**

---

## 🎨 Script 3: Validação Visual
**Tempo**: 2 minutos

### Checklist Visual

1. **Transparência**
   - [ ] Vejo parte do avatar através do gráfico?
   - [ ] Fundo não está 100% opaco?

2. **Posicionamento**
   - [ ] Gráfico está embaixo do avatar?
   - [ ] NÃO cobre o rosto do Bryan?
   - [ ] Centralizado?

3. **Footer**
   - [ ] Mostra: Total, Máximo, Média?
   - [ ] Valores numéricos corretos?

4. **Hover**
   - [ ] Tooltip aparece ao passar mouse?
   - [ ] Mostra nome + valor?
   - [ ] Fundo escuro semi-transparente?

5. **Animação**
   - [ ] Gráfico "sobe" suavemente ao aparecer?
   - [ ] Transição não é abrupta?

---

## ⚡ Script 4: Testes de Integração
**Tempo**: 2 minutos

### Teste 1: Múltiplas Queries
```
1. Envie: "Mostre gráfico de barras"
2. Aguarde aparecer
3. Envie: "Mostre gráfico de pizza"
4. Verificar: Barras desapareceu? Pizza substituiu?
```
**Esperado**: Apenas 1 gráfico por vez

---

### Teste 2: Query sem dados
```
Envie: "Mostre colaboradores da empresa XYZ123 que não existe"
```
**Esperado**:
- [ ] Avatar responde: "Não encontrei..."
- [ ] NENHUM gráfico aparece
- [ ] Sem erro no console

---

## 🐛 Critérios de FALHA

**CRÍTICO** (bloqueia aprovação):
- ❌ Qualquer erro JavaScript no console
- ❌ Avatar trava ou desconecta
- ❌ Gráfico não aparece quando deveria
- ❌ Gráfico cobre rosto do avatar

**MÉDIO** (não ideal, mas não bloqueia):
- ⚠️ Badge com tipo errado
- ⚠️ Cores todas iguais
- ⚠️ Tooltip não funciona
- ⚠️ Título muito técnico

**BAIXO** (cosmético):
- ⚠️ Animação muito rápida/lenta
- ⚠️ Transparência não ideal
- ⚠️ Alinhamento levemente off

---

## ✅ Aprovação Rápida

### Mínimo para APROVAR:
```
✅ Query 1 (Barras) = Passou
✅ Query 2 (Pizza) = Passou  
✅ Query 3 (Linha) = Passou
✅ Query 4 (Área) = Passou
✅ Nenhum erro crítico
```

**Se todos passaram**: ✅ **APROVADO**  
**Se 1 falhou**: ⚠️ Investigar  
**Se 2+ falharam**: ❌ Reprovar, corrigir e re-testar

---

## 📝 Template de Resultado

Copie e preencha:

```
=== RESULTADO DOS TESTES ===
Data/Hora: [____]
Testador: [____]

SCRIPT 1: Validação Básica
- [ ] Barras: ✅ Passou / ❌ Falhou
- [ ] Pizza: ✅ Passou / ❌ Falhou
- [ ] Linha: ✅ Passou / ❌ Falhou
- [ ] Área: ✅ Passou / ❌ Falhou

SCRIPT 2: Detecção Automática
- [ ] Palavra-chave: ✅ / ❌
- [ ] Poucos dados: ✅ / ❌ / N/A

SCRIPT 3: Validação Visual
- [ ] Transparência: ✅ / ❌
- [ ] Posicionamento: ✅ / ❌
- [ ] Footer: ✅ / ❌
- [ ] Hover: ✅ / ❌
- [ ] Animação: ✅ / ❌

SCRIPT 4: Integração
- [ ] Múltiplas queries: ✅ / ❌
- [ ] Sem dados: ✅ / ❌

ERROS ENCONTRADOS:
[Liste aqui qualquer bug]

RESULTADO FINAL: ✅ APROVADO / ❌ REPROVADO
```

---

## 🎯 Próximos Passos

### Se APROVADO:
1. ✅ Preencher matriz completa em `PLANO_TESTES_GRAFICOS.md`
2. ✅ Comunicar time
3. ✅ Feature pronta para produção

### Se REPROVADO:
1. ❌ Listar bugs encontrados
2. ❌ Criar issues no GitHub
3. ❌ Aguardar correções
4. ❌ Re-executar este script

---

**Dúvidas?** Consulte `PLANO_TESTES_GRAFICOS.md` para casos detalhados.
