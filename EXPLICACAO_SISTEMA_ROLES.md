# Sistema de Roles (Admin vs Usuário) - Explicação

## Problema Identificado

Diferentes usuários estavam vendo empresas diferentes na mesma página porque:

1. **Políticas RLS (Row Level Security)**: As políticas do Supabase filtram os dados baseados no `owner_user_id`
2. **Cada empresa pertence a um usuário**: Empresas são criadas com `owner_user_id` apontando para o usuário que as criou
3. **Filtro automático**: As políticas RLS permitem que usuários vejam apenas:
   - Empresas onde são `owner` (`owner_user_id = auth.uid()`)
   - Empresas onde são colaboradores (através da tabela `employees`)

## Solução Implementada

### 1. Sistema de Roles
- Adicionado campo `role` na tabela `clients` com valores: `'user'` (padrão) ou `'admin'`
- Admins podem ver **todas** as empresas cadastradas no sistema
- Usuários normais continuam vendo apenas suas próprias empresas

### 2. Políticas RLS Atualizadas
- **Companies**: Admins podem ver todas as empresas, usuários normais veem apenas as suas
- **Employees**: Admins podem ver todos os colaboradores, usuários normais veem apenas os seus

### 3. Página de Perfil
- Criada página `/profile` para cada usuário visualizar e gerenciar seu perfil
- Mostra informações do usuário, role atual, e permite alternar role (em desenvolvimento)

### 4. API Route para Clientes
- Criada `/api/clients` para atualizar dados do cliente, incluindo o `role`

## Como Marcar um Usuário como Admin

### Opção 1: Via SQL (Recomendado)

Execute no Supabase SQL Editor:

```sql
-- Marcar usuário específico como admin pelo email
UPDATE public.clients 
SET role = 'admin'
WHERE email = 'mariomayerlefilho@live.com';

-- Ou marcar pelo user_id
UPDATE public.clients 
SET role = 'admin'
WHERE user_id = 'SEU_USER_ID_AQUI';
```

### Opção 2: Via Página de Perfil (Desenvolvimento)

Na página de perfil (`/profile`), há um botão para alternar role (apenas em modo desenvolvimento).

## Scripts SQL Necessários

1. **Execute primeiro**: `create_user_roles_system.sql`
   - Adiciona campo `role` na tabela `clients`
   - Atualiza políticas RLS para suportar admins
   - Cria função helper `is_admin()`

2. **Depois marque os admins**: Use o SQL acima para marcar usuários específicos como admin

## Verificação

Após executar os scripts e marcar usuários como admin:

1. Faça login como usuário admin
2. Acesse `/companies`
3. Você deve ver **todas** as empresas cadastradas no sistema
4. O badge "Admin" deve aparecer no topo da página

## Estrutura de Dados

### Tabela `clients`
```sql
role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
```

### Política RLS para Companies
```sql
-- Admin pode ver todas as empresas
EXISTS (
    SELECT 1 FROM public.clients 
    WHERE id = auth.uid() 
    AND role = 'admin'
)
OR
-- Usuário normal vê apenas suas empresas
(owner_user_id = auth.uid() OR ...)
```

## Segurança

- Apenas admins podem ver todas as empresas
- Usuários normais continuam com acesso restrito
- Políticas RLS garantem segurança no nível do banco de dados
- API routes usam service role key para bypassar RLS quando necessário

