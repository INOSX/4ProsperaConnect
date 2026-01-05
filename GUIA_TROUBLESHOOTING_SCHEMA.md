# 🔧 Guia de Troubleshooting - Erros de Schema

**Referência Rápida** para resolver erros relacionados a schema do banco de dados no NEXUS Agent.

---

## 🚨 Sintomas Comuns

### Erro 42703: Column does not exist

```
❌ Erro: column c.company_benefits does not exist
❌ Código: 42703
```

**Causa**: A IA está gerando SQL com uma coluna que não existe no banco.

**Checklist de Diagnóstico**:
- [ ] A coluna realmente existe no PostgreSQL?
- [ ] A tabela está no `DatabaseKnowledgeAgent.js`?
- [ ] As colunas estão corretas no schema?
- [ ] Há typos (company_benefit vs company_benefits)?

---

### Erro 42P01: Table does not exist

```
❌ Erro: relation "employee_benefits" does not exist
❌ Código: 42P01
```

**Causa**: A IA está tentando fazer JOIN com uma tabela que não existe.

**Checklist de Diagnóstico**:
- [ ] A tabela foi criada no banco?
- [ ] A tabela está em `DatabaseKnowledgeAgent.databaseSchema`?
- [ ] O nome da tabela está correto (plural/singular)?

---

### Erro: "Agrupamento por X ainda não suportado"

```
❌ Agrupamento por null na tabela employees ainda não suportado
```

**Causa**: O fallback está recebendo `groupBy: 'null'` (string) ao invés de `groupBy: null`.

**Checklist de Diagnóstico**:
- [ ] O `QueryPlanningAgent` está retornando JSON válido?
- [ ] O parsing do JSON está convertendo strings?
- [ ] O fallback está lidando com edge cases?

---

## 🔍 Passo a Passo para Diagnóstico

### 1. Verificar Logs do Console

Procure por:
```javascript
[OPX:DatabaseQueryAgent] ❌ Erro: column X does not exist
[OPX:DatabaseQueryAgent] ❌ Código: 42703
[OPX:DatabaseQueryAgent] 📝 Query SQL: SELECT ...
```

### 2. Comparar SQL Gerada vs. Schema Real

**Abra o SQL Editor do Supabase**:
```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver colunas de uma tabela específica
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'company_benefits';
```

### 3. Verificar `DatabaseKnowledgeAgent.js`

**Abra**: `src/services/bmad/agents/DatabaseKnowledgeAgent.js`

**Procure por**:
```javascript
this.databaseSchema = {
  companies: { /* ... */ },
  employees: { /* ... */ },
  // A tabela problemática está aqui?
}
```

### 4. Comparar: Banco vs. Código

| Tabela no Banco | Está no Código? | Colunas Corretas? |
|----------------|-----------------|-------------------|
| companies      | ✅              | ✅                |
| employees      | ✅              | ✅                |
| company_benefits | ❌ (FALTA!)  | N/A               |

**Se falta**: Adicione a tabela ao schema.

---

## ✅ Soluções Rápidas

### Solução 1: Adicionar Tabela ao Schema

**Exemplo**: Adicionar `company_benefits`

```javascript
// src/services/bmad/agents/DatabaseKnowledgeAgent.js

this.databaseSchema = {
  // ... tabelas existentes ...
  
  // ✅ ADICIONAR NOVA TABELA
  company_benefits: {
    table: 'company_benefits',
    description: 'Tabela de benefícios oferecidos pelas empresas',
    columns: {
      id: 'UUID - Identificador único',
      company_id: 'UUID - ID da empresa (FK)',
      benefit_type: 'TEXT - Tipo de benefício',
      name: 'TEXT - Nome do benefício',
      // ... outras colunas
    },
    relationships: {
      company: 'belongs_to - Pertence a uma empresa',
      employee_benefits: 'has_many - Pode estar ativo para muitos colaboradores'
    },
    notes: 'Notas importantes sobre como usar esta tabela'
  }
}
```

### Solução 2: Adicionar Coluna Faltante

```javascript
employees: {
  table: 'employees',
  columns: {
    id: 'UUID - Identificador único',
    // ... colunas existentes ...
    
    // ✅ ADICIONAR COLUNA FALTANTE
    department: 'TEXT - Departamento do colaborador',
  }
}
```

### Solução 3: Corrigir Relacionamento

```javascript
employees: {
  table: 'employees',
  relationships: {
    company: 'belongs_to - Pertence a uma empresa',
    
    // ✅ ADICIONAR RELACIONAMENTO FALTANTE
    employee_benefits: 'has_many - Pode ter muitos benefícios ativos'
  }
}
```

### Solução 4: Adicionar Notas para JOINs Complexos

```javascript
employee_benefits: {
  table: 'employee_benefits',
  // ... colunas ...
  notes: `
    IMPORTANTE: Esta é uma tabela de associação.
    
    Para colaboradores COM benefícios:
    JOIN employee_benefits eb ON e.id = eb.employee_id 
    WHERE eb.status = 'active'
    
    Para colaboradores SEM benefícios:
    LEFT JOIN employee_benefits eb ON e.id = eb.employee_id 
    WHERE eb.id IS NULL
    
    Para filtrar por tipo de benefício:
    JOIN company_benefits cb ON eb.company_benefit_id = cb.id
    WHERE cb.benefit_type = 'financial_product'
  `
}
```

---

## 🚀 Deploy das Correções

### Passo 1: Testar Localmente

```bash
# 1. Salvar mudanças em DatabaseKnowledgeAgent.js

# 2. Testar query problemática
npm run dev

# 3. Fazer query por voz
"Quantos colaboradores possuem benefícios?"

# 4. Verificar logs do console
# Deve ver: ✅ SQL executada com sucesso
```

### Passo 2: Commit e Deploy

```bash
# Commit
git add src/services/bmad/agents/DatabaseKnowledgeAgent.js
git commit -m "fix: Adiciona tabela X ao schema do DatabaseKnowledgeAgent"

# Push para develop
git push origin develop

# Merge para main
git checkout main
git merge develop
git push origin main

# Vercel vai fazer deploy automaticamente
```

### Passo 3: Validar em Produção

```bash
# 1. Aguardar 2-3 minutos para deploy do Vercel

# 2. Acessar: https://4prosperaconnect.vercel.app/specialist

# 3. Hard refresh: Ctrl + Shift + R

# 4. Conectar Bryan Tech Expert

# 5. Testar query problemática
```

---

## 🎯 Prevenção: Checklist para Novas Tabelas

Sempre que **criar uma nova tabela** no PostgreSQL:

- [ ] **SQL**: Criar a tabela no banco via `create_X_tables.sql`
- [ ] **Schema**: Adicionar ao `DatabaseKnowledgeAgent.js`
- [ ] **Colunas**: Listar TODAS as colunas com tipos
- [ ] **Relacionamentos**: Documentar FKs (belongs_to, has_many)
- [ ] **Notas**: Adicionar dicas de uso e JOINs comuns
- [ ] **Teste**: Fazer uma query de teste
- [ ] **Deploy**: Commit, push, deploy
- [ ] **Documentação**: Atualizar este guia se necessário

---

## 📚 Referências Rápidas

### Arquivos Importantes:

| Arquivo | Propósito |
|---------|-----------|
| `src/services/bmad/agents/DatabaseKnowledgeAgent.js` | Schema do banco |
| `src/services/bmad/agents/QueryPlanningAgent.js` | Gera SQL usando o schema |
| `src/services/bmad/agents/DatabaseQueryAgent.js` | Executa SQL |
| `create_banking_solution_tables.sql` | Schema real do PostgreSQL |

### Comandos SQL Úteis:

```sql
-- Listar todas as tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver estrutura de uma tabela
\d company_benefits

-- Ver colunas com tipos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'company_benefits';

-- Ver foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='employee_benefits';
```

### Comandos Git Úteis:

```bash
# Ver mudanças
git diff src/services/bmad/agents/DatabaseKnowledgeAgent.js

# Commitar mudança específica
git add src/services/bmad/agents/DatabaseKnowledgeAgent.js
git commit -m "fix: Adiciona tabela X ao schema"

# Ver histórico de mudanças no schema
git log --oneline src/services/bmad/agents/DatabaseKnowledgeAgent.js
```

---

## 🆘 Quando Pedir Ajuda

**Peça ajuda se**:
- ✅ Seguiu todos os passos e o erro persiste
- ✅ Não tem certeza sobre a estrutura do banco
- ✅ O erro é diferente dos listados aqui
- ✅ Precisa adicionar uma tabela muito complexa

**Como pedir ajuda**:
```
1. Descreva o erro (com código PostgreSQL)
2. Cole a query gerada pela IA
3. Cole o schema da tabela no banco (SELECT...)
4. Cole o schema no DatabaseKnowledgeAgent.js
5. Cole os logs completos do console
```

---

## 📖 Ver Também

- [`POSTMORTEM_SCHEMA_BENEFICIOS.md`](./POSTMORTEM_SCHEMA_BENEFICIOS.md) - Análise completa do problema de benefícios
- [`create_banking_solution_tables.sql`](./create_banking_solution_tables.sql) - Schema completo do banco
- [Supabase Docs - Table Schema](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)

---

**Última atualização**: 05/01/2025 03:10 BRT  
**Próxima revisão**: Quando adicionar novas tabelas
