# 🔧 TROUBLESHOOTING: Cliente Não Encontrado

## ❌ ERRO

```
❌ Erro ao inicializar assistente: Error: Cliente não encontrado. Por favor, faça logout e login novamente.
```

---

## 🔍 DIAGNÓSTICO

### **Sintomas:**
- Avatar Bryan conecta corretamente
- Session criada com sucesso
- Erro ocorre ANTES do avatar conectar
- Console mostra: `Cliente não encontrado`

### **Causa Raiz:**
A tabela `public.clients` está vazia ou não contém o registro do usuário autenticado.

---

## ✅ SOLUÇÃO RÁPIDA

### **PASSO 1: Verificar se o problema existe**

```sql
-- Verificar quantidade de clientes
SELECT COUNT(*) as total FROM public.clients;

-- Verificar se seu usuário tem cliente
SELECT c.* 
FROM public.clients c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'seu-email@exemplo.com';
```

**Se retornar 0:** O problema é confirmado!

---

### **PASSO 2: Recriar o Cliente**

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
SET session_replication_role = 'replica';

-- Recriar cliente (substitua os valores)
INSERT INTO public.clients (
  id,
  user_id,
  client_code,
  name,
  email,
  openai_assistant_id,
  role,
  user_type,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'),
  'CLIENT-001',
  'Seu Nome',
  'seu-email@exemplo.com',
  'asst_default_prospera_connect',
  'admin',
  'individual',
  NOW(),
  NOW()
);

-- Reabilitar RLS
SET session_replication_role = 'origin';
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;

-- Verificar se foi criado
SELECT * FROM public.clients WHERE email = 'seu-email@exemplo.com';
```

---

### **PASSO 3: Recarregar a Aplicação**

1. Feche todas as abas da aplicação
2. Abra novamente
3. Faça login (se necessário)
4. Tente conectar o especialista

---

## 🛡️ PREVENÇÃO

### **1. Backup da Tabela Clients**

Antes de executar scripts que limpam dados, sempre faça backup:

```sql
-- Backup
CREATE TABLE public.clients_backup AS 
SELECT * FROM public.clients;

-- Restaurar se necessário
TRUNCATE TABLE public.clients;
INSERT INTO public.clients 
SELECT * FROM public.clients_backup;
```

---

### **2. Scripts SQL Seguros**

Ao criar scripts de limpeza de dados, **NUNCA** inclua a tabela `clients`:

```sql
-- ❌ MAL:
TRUNCATE TABLE public.clients CASCADE;

-- ✅ BOM:
-- Limpar apenas dados de teste
TRUNCATE TABLE public.companies CASCADE;
TRUNCATE TABLE public.employees CASCADE;
-- ... outras tabelas de DADOS, não de CONFIGURAÇÃO
```

---

### **3. Validação no Código**

O código já tem validação, mas você pode melhorar:

```javascript
// Em SpecialistModule.jsx ou FloatingSpecialist.jsx

const clientResult = await ClientService.getClientByUserId(user.id)
if (!clientResult.success || !clientResult.client) {
  // ANTES: throw new Error('Cliente não encontrado...')
  
  // MELHOR: Tentar recriar automaticamente
  console.warn('Cliente não encontrado. Tentando recriar...')
  
  try {
    await ClientService.createClient({
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      role: 'user',
      userType: 'individual'
    })
    
    console.log('✅ Cliente recriado automaticamente')
    // Retry buscar o cliente
  } catch (error) {
    throw new Error('Cliente não encontrado. Por favor, faça logout e login novamente.')
  }
}
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

Quando o erro ocorrer, verifique nesta ordem:

- [ ] Usuário está autenticado? (`user` existe?)
- [ ] Tabela `clients` existe? (`SELECT * FROM public.clients LIMIT 1`)
- [ ] Cliente do usuário existe? (`SELECT * FROM clients WHERE user_id = '...'`)
- [ ] RLS está permitindo acesso? (teste com `SET session_replication_role = 'replica'`)
- [ ] `openai_assistant_id` está configurado? (não pode ser `NULL`)

---

## 🔍 LOGS ÚTEIS

### **No Console do Browser:**

```
❌ Erro ao inicializar assistente: Error: Cliente não encontrado
```

### **Query SQL para Debug:**

```sql
-- Ver todos os dados relevantes
SELECT 
  u.id as user_id,
  u.email,
  c.id as client_id,
  c.client_code,
  c.openai_assistant_id,
  c.role,
  c.user_type
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE u.email = 'seu-email@exemplo.com';
```

Se `client_id` estiver `NULL`: **Cliente não existe!**

---

## 📚 ARQUIVOS RELACIONADOS

```
src/components/specialist/SpecialistModule.jsx (linha 207-209)
src/components/layout/FloatingSpecialist.jsx (linha 263)
src/services/ClientService.js
```

---

## 🎯 RESUMO

```
PROBLEMA: Tabela clients vazia
CAUSA: Script SQL ou limpeza manual apagou registros
SOLUÇÃO: Recriar registro do cliente via SQL
PREVENÇÃO: Nunca limpar tabelas de configuração (clients, users, etc)
```

---

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   💡 DICA: Sempre verifique a tabela clients antes       ║
║      de executar scripts que limpam dados!               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```
