# Próximos Passos - Sistema de Permissões Atualizado

## ⚠️ IMPORTANTE: Você ainda não executou nada

Como você mencionou que ainda não executou nada, aqui estão os próximos passos na ordem correta:

## 1. Executar Scripts SQL no Supabase (Ordem Importante)

### Passo 1.1: Script Base (se ainda não executou)
```sql
-- Execute primeiro: create_user_roles_system.sql
-- Este script cria o campo 'role' na tabela clients
```

### Passo 1.2: Script de Admin do Cliente (NOVO)
```sql
-- Execute: create_company_admin_system.sql
-- Este script adiciona o campo is_company_admin na tabela employees
-- E cria funções helper para verificar Admin do Cliente
```

### Passo 1.3: Script de Políticas RLS Atualizado (NOVO - CRIADO)
```sql
-- Execute: create_admin_full_access_rls_v2.sql
-- Este script atualiza as políticas RLS para incluir Admin do Cliente
-- IMPORTANTE: Este script substitui o create_admin_full_access_rls.sql anterior
-- ✅ ARQUIVO JÁ CRIADO
```

### Passo 1.4: Script de Constraints (se ainda não executou)
```sql
-- Execute: create_admin_constraints.sql
-- Este script cria triggers para validações
```

## 2. Atualizar Código Frontend e Backend

Após executar os scripts SQL, será necessário atualizar:

### 2.1 APIs
- `api/employees/index.js` - Adicionar verificação de Admin do Cliente
- Rotas de Prospecção - Proteger para apenas Admin do Banco
- Rotas de Campanhas - Proteger para apenas Admin do Banco

### 2.2 Frontend - Utils
- `src/utils/permissions.js` - Adicionar funções para Admin do Cliente

### 2.3 Frontend - Componentes
- Componentes de Gestão de Colaboradores
- Componentes de Prospecção (proteger rotas)
- Componentes de Campanhas (proteger rotas)
- Sidebar (mostrar/ocultar links)

### 2.4 Rotas
- Criar `CompanyAdminRoute` e `BankAdminRoute`
- Atualizar `src/App.jsx`

## 3. Testes

Após implementação:
1. Testar Admin do Banco (acesso total)
2. Testar Admin do Cliente (acesso limitado à empresa)
3. Testar Colaborador Normal (acesso básico)
4. Verificar que Prospecção e Campanhas são apenas para Admin do Banco
5. Verificar que Gestão de Colaboradores funciona para Admin do Banco e Admin do Cliente

## 4. Marcar Usuários como Admin do Cliente

Para marcar um colaborador como Admin do Cliente:

```sql
-- Marcar colaborador como admin da empresa
UPDATE public.employees 
SET is_company_admin = true
WHERE id = 'ID_DO_EMPLOYEE_AQUI';

-- Ou marcar pelo platform_user_id e company_id
UPDATE public.employees 
SET is_company_admin = true
WHERE platform_user_id = 'USER_ID_AQUI'
AND company_id = 'COMPANY_ID_AQUI';
```

## Resumo das Mudanças Necessárias

### O que já foi criado (mas precisa ser ajustado):
- ✅ Scripts SQL base (precisam ser atualizados)
- ✅ APIs de companies e connections (precisam ajustes menores)
- ✅ Componentes de integrações (precisam ajustes menores)

### O que precisa ser criado/atualizado:
- ✅ Script SQL para Admin do Cliente (`create_company_admin_system.sql` - CRIADO)
- ✅ Script SQL atualizado de RLS (`create_admin_full_access_rls_v2.sql` - CRIADO)
- ⏳ APIs de employees (atualizar)
- ⏳ Proteção de rotas de Prospecção
- ⏳ Proteção de rotas de Campanhas
- ⏳ Componentes de proteção de rotas
- ⏳ Utils de permissões atualizados

## Ordem de Execução Recomendada

1. **Primeiro**: Execute `create_company_admin_system.sql` no Supabase
2. **Segundo**: Aguarde a criação do script `create_admin_full_access_rls_v2.sql` (será criado em seguida)
3. **Terceiro**: Execute `create_admin_full_access_rls_v2.sql` no Supabase
4. **Quarto**: Aguarde as atualizações de código que serão feitas
5. **Quinto**: Teste o sistema completo
