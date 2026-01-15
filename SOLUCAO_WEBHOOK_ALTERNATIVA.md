# Solução para Sincronização Automática de Usuários

## ❌ Problema: Trigger em auth.users não funciona

O erro `must be owner of relation users` acontece porque:
- A tabela `auth.users` pertence ao schema `auth` do Supabase
- Apenas o superusuário do PostgreSQL pode criar triggers nesta tabela
- Usuários normais (mesmo admins) não têm essa permissão

## ✅ Solução em 2 Etapas

### ETAPA 1: Sincronizar Usuários Existentes (AGORA) ⚡

Execute o script `SYNC_USERS_SIMPLE.sql` no Supabase SQL Editor.

Este script:
- ✅ Sincroniza TODOS os usuários de auth.users para public.clients
- ✅ Marca TODOS como admin
- ✅ Não precisa de permissões especiais
- ✅ Funciona imediatamente

**Resultado esperado:**
```
status_final: "✅ SINCRONIZADO COM SUCESSO"
```

---

### ETAPA 2: Configurar Webhook do Supabase (Automação Futura)

Para garantir que novos usuários sejam sincronizados automaticamente:

#### Opção A: Database Webhook (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - Vá em: Database → Webhooks
   - Clique em "Create a new hook"

2. **Configure o Webhook:**
   - **Name:** `sync_new_users_to_clients`
   - **Table:** `auth.users`
   - **Events:** `INSERT`
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** (sua edge function - veja abaixo)

3. **Crie uma Edge Function para processar:**

```javascript
// supabase/functions/sync-user-to-clients/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Extrair dados do usuário
    const userId = record.id
    const email = record.email
    const name = record.raw_user_meta_data?.full_name 
      || record.raw_user_meta_data?.name 
      || email.split('@')[0]
    
    // Gerar código do cliente
    const clientCode = 'CLI-' + crypto.randomUUID().substring(0, 8).toUpperCase()
    
    // Inserir em clients
    const { error } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: userId,
        client_code: clientCode,
        name: name,
        email: email,
        role: 'admin' // ✅ Sempre admin
      })
    
    if (error && error.code !== '23505') { // Ignorar erro de duplicata
      console.error('Error creating client:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

#### Opção B: Corrigir o Código (Mais Simples)

Modificar `ClientService.createClient()` para **sempre** criar o registro em clients, mesmo se OpenAI falhar.

Vou criar um patch para o código em seguida.

---

## 🎯 Para Resolver AGORA

Execute apenas o **ETAPA 1** (script `SYNC_USERS_SIMPLE.sql`):

1. Abra o Supabase SQL Editor
2. Cole o conteúdo de `SYNC_USERS_SIMPLE.sql`
3. Execute (Run)
4. Verifique se todos os usuários foram sincronizados

Depois que isso estiver funcionando, a Fabiana e todos os outros usuários terão acesso imediato.

---

## ✅ Verificação Final

Após executar o script, verifique:

```sql
-- Ver todos os usuários sincronizados
SELECT 
    email,
    name,
    role,
    created_at
FROM public.clients
ORDER BY created_at DESC;

-- Verificar se está sincronizado
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.clients) as clients,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.clients)
        THEN '✅ OK'
        ELSE '❌ FALTA SINCRONIZAR'
    END as status;
```

---

## 📝 Resumo

| Solução | Status | Quando Usar |
|---------|--------|-------------|
| `SYNC_USERS_SIMPLE.sql` | ✅ Funciona | **EXECUTE AGORA** - Sincroniza existentes |
| Database Webhook | ⚙️ Opcional | Para automação futura |
| Corrigir Código | ⚙️ Opcional | Solução permanente no código |
| Trigger em auth.users | ❌ Não funciona | Requer permissões especiais |

**Recomendação:** Execute `SYNC_USERS_SIMPLE.sql` agora para resolver o problema imediato!
