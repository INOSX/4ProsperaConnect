# Diagnóstico de Acesso - Usuária fabiana.bispo@foursys.com.br

## 🔍 Problema Identificado

A usuária **fabiana.bispo@foursys.com.br** não consegue acessar o módulo de prospecção e ao entrar na página de Gestão de Pessoas aparece que não há empresas cadastradas.

## 📋 Análise Técnica

### 1. Sistema de Permissões (RLS - Row Level Security)

A plataforma utiliza um sistema de permissões baseado em **roles** e **Row Level Security** do Supabase:

#### **Roles Existentes:**
- `admin` (Admin do Banco): Acesso completo a todos os dados
- `user` (Usuário Normal): Acesso restrito apenas às suas próprias empresas

#### **Problema Principal:**
A usuária Fabiana está com o role `user` (padrão), o que significa que ela SÓ consegue ver:
- Empresas onde ela é `owner` (`owner_user_id = seu_user_id`)
- Empresas onde ela é colaboradora (cadastrada na tabela `employees`)

### 2. Políticas RLS Ativas

#### **Tabela `companies`** (Gestão de Pessoas):
```sql
-- Política atual (create_admin_full_access_rls_v2.sql)
CREATE POLICY "View companies based on role" ON public.companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Admin do Banco vê todas ✅
            public.is_admin(auth.uid())
            OR
            -- Admin do Cliente vê empresas onde é admin
            public.is_company_admin_any(auth.uid()) AND EXISTS (...)
            OR
            -- Colaborador normal vê empresas onde trabalha ❌
            (owner_user_id = auth.uid() OR EXISTS (...))
        )
    );
```

#### **Tabela `prospects`** (Prospecção):
```sql
-- Política atual (create_admin_full_access_rls_v2.sql, linha 236)
CREATE POLICY "Only bank admin can view prospects" ON public.prospects
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())  -- ❌ APENAS ADMINS
    );
```

#### **Tabela `unbanked_companies`** (Empresas Não Bancarizadas):
```sql
-- Política atual (linha 328)
CREATE POLICY "Only bank admin can view unbanked companies" ON public.unbanked_companies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())  -- ❌ APENAS ADMINS
    );
```

#### **Tabela `cpf_clients`** (Clientes CPF):
```sql
-- Política atual (linha 282)
CREATE POLICY "Only bank admin can view cpf clients" ON public.cpf_clients
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        public.is_admin(auth.uid())  -- ❌ APENAS ADMINS
    );
```

### 3. Por que Fabiana não vê nada?

1. **Gestão de Pessoas (Companies):**
   - Ela não é `admin` (role = 'user')
   - Ela não está cadastrada como `owner` de nenhuma empresa
   - Ela não está cadastrada como colaboradora (`employees`) de nenhuma empresa
   - **Resultado:** ❌ Nenhuma empresa aparece

2. **Módulo de Prospecção:**
   - Tabelas `prospects`, `unbanked_companies` e `cpf_clients` exigem role `admin`
   - Ela tem role `user`
   - **Resultado:** ❌ Acesso negado pelo RLS

## ✅ Solução

### Opção 1: Tornar Fabiana Admin (RECOMENDADO)

Se você quer que **TODOS** os usuários vejam **TODOS** os dados da plataforma, você deve marcá-los como `admin`.

#### **Passo a Passo:**

1. **Acesse o Supabase SQL Editor**
   - URL: https://dytuwutsjjxxmyefrfed.supabase.co
   - Vá em: SQL Editor (menu lateral)

2. **Execute este SQL:**

```sql
-- Marcar Fabiana como admin
UPDATE public.clients 
SET role = 'admin'
WHERE email = 'fabiana.bispo@foursys.com.br';

-- Verificar se foi atualizado
SELECT id, user_id, email, name, role 
FROM public.clients 
WHERE email = 'fabiana.bispo@foursys.com.br';
```

3. **Peça para Fabiana:**
   - Fazer logout da plataforma
   - Fazer login novamente
   - Agora ela verá TODAS as empresas e módulos

#### **Para marcar TODOS os usuários como admin de uma vez:**

```sql
-- Marcar todos os usuários existentes como admin
UPDATE public.clients 
SET role = 'admin'
WHERE role = 'user' OR role IS NULL;

-- Verificar quantos foram atualizados
SELECT 
    role, 
    COUNT(*) as total 
FROM public.clients 
GROUP BY role;
```

### Opção 2: Modificar as Políticas RLS (NÃO RECOMENDADO)

Se você quiser que **todos** os usuários vejam tudo **SEM** precisar ser admin, você precisaria modificar TODAS as políticas RLS para remover a verificação de `is_admin()`.

**⚠️ ATENÇÃO:** Esta abordagem remove a segmentação de dados e pode não ser adequada para produção.

### Opção 3: Cadastrar Fabiana como Colaboradora

Se você quiser manter o role `user` mas dar acesso às empresas, você precisa:

1. Cadastrar Fabiana como colaboradora de cada empresa
2. Isso é trabalhoso e ela só verá as empresas onde for cadastrada
3. Ela ainda **NÃO** terá acesso ao módulo de prospecção (que é exclusivo de admins)

## 📊 Estrutura da Tabela `clients`

```sql
-- Coluna role foi adicionada pelo script create_user_roles_system.sql
role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
```

## 🔐 Verificações Importantes

### 1. Verificar role atual de Fabiana:

```sql
SELECT 
    id,
    user_id, 
    email, 
    name,
    role,
    created_at
FROM public.clients 
WHERE email = 'fabiana.bispo@foursys.com.br';
```

### 2. Verificar empresas que ela tem acesso (se tiver):

```sql
-- Empresas onde ela é owner
SELECT 
    c.id,
    c.company_name,
    c.cnpj,
    c.owner_user_id
FROM public.companies c
INNER JOIN public.clients cl ON cl.user_id = c.owner_user_id
WHERE cl.email = 'fabiana.bispo@foursys.com.br';

-- Empresas onde ela é colaboradora
SELECT 
    c.id,
    c.company_name,
    c.cnpj,
    e.name as employee_name,
    e.is_company_admin
FROM public.companies c
INNER JOIN public.employees e ON e.company_id = c.id
INNER JOIN public.clients cl ON cl.user_id = e.platform_user_id
WHERE cl.email = 'fabiana.bispo@foursys.com.br'
AND e.is_active = true;
```

### 3. Listar todos os usuários e seus roles:

```sql
SELECT 
    email,
    name,
    role,
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅ Admin (acesso total)'
        ELSE '❌ User (acesso restrito)'
    END as status_acesso
FROM public.clients
ORDER BY created_at DESC;
```

## 🎯 Recomendação Final

**Para o cenário atual onde você quer que TODOS os usuários vejam TODOS os dados:**

1. Execute o SQL da Opção 1 para marcar todos como `admin`
2. Peça para os usuários fazerem logout/login
3. Verifique se o problema foi resolvido

**Scripts SQL já criados que implementam este sistema:**
- ✅ `create_user_roles_system.sql` - Adiciona role aos clientes
- ✅ `create_admin_full_access_rls_v2.sql` - Políticas RLS com suporte a admin
- ✅ `create_company_admin_system.sql` - Admin de empresa (diferente de admin do banco)

## 📝 Notas Adicionais

- O sistema foi projetado para ambientes multi-tenant onde cada empresa vê apenas seus dados
- Para um banco que quer ver dados de todas as empresas clientes, o role `admin` é apropriado
- As políticas RLS garantem segurança no nível do banco de dados
- API routes usam `service_role_key` para bypassar RLS quando necessário

---

**Data do Diagnóstico:** 15/01/2026
**Usuária Afetada:** fabiana.bispo@foursys.com.br
**Problema:** Sem acesso ao módulo de prospecção e gestão de pessoas
**Causa Raiz:** Role = 'user' (deveria ser 'admin' para acesso completo)
**Solução:** Executar UPDATE para alterar role para 'admin'
