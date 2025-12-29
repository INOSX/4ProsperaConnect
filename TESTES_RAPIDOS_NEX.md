# ⚡ Testes Rápidos - NEX/FLX/AGX/OPX/ORDX e Especialista

Lista rápida de comandos para testar o sistema.

---

## 🎤 Comandos de Voz para Testar

### Consultas Básicas
1. `"Quantas empresas temos cadastradas?"`
2. `"Quantos colaboradores temos?"`
3. `"Listar as empresas"`

### Consultas de Agregação
4. `"Qual a média de colaboradores por empresa?"`
5. `"Quantos colaboradores temos no total?"`

### Consultas Específicas
6. `"Existem empresas sem colaborador cadastrado?"`
7. `"Tem alguma empresa que não tem colaborador?"`
8. `"Mostre empresas sem funcionários"`

### Consultas de Gráficos
9. `"Mostre um gráfico de cadastramento de empresas por período"`
10. `"Gráfico de empresas por mês"`

### Busca Semântica
11. `"Buscar empresas do setor financeiro"`
12. `"Encontrar colaboradores com salário alto"`

---

## ✅ Checklist Rápido

Após cada comando, verifique:

- [ ] Console mostra logs dos agentes
- [ ] Resposta é exibida corretamente
- [ ] Avatar fala a resposta
- [ ] Visualização é mostrada (se aplicável)
- [ ] Não há erros no console

---

## 🔍 O que Observar nos Logs

### Logs Esperados (Sucesso)
```
[NEX:Orchestrator] 🚀 Starting command processing
[FLX:VoiceIntentAgent] ✅ Intent classified
[OPX:DatabaseQueryAgent] 📋 Detected: [tipo]
[NEX:Orchestrator] ✅ Command processing finished successfully
```

### Logs de Erro (Problema)
```
[NEX:Orchestrator] ❌ Error in command processing
[OPX:DatabaseQueryAgent] ❌ Error in...
```

---

## 🎯 Teste Prioritário Agora

**Comando:**
```
"Existem empresas sem colaborador cadastrado?"
```

**Verificar:**
1. Logs mostram: `[FLX:VoiceIntentAgent] ✅ Intent classified (companies without employees)`
2. Logs mostram: `[OPX:DatabaseQueryAgent] 🏢 Handling companies without employees query`
3. Resposta é específica (não genérica)
4. Lista de empresas é mostrada (se houver)

---

**Execute este teste primeiro e me informe os resultados!**

