# 🚀 INSTRUÇÕES PARA EXECUTAR MIGRATION DO AUDIT LOG

## ⚠️ IMPORTANTE - EXECUTE ANTES DE TESTAR

A tabela `audit_logs` precisa ser criada manualmente no Supabase.

## 📝 PASSO A PASSO:

### 1. Acesse o Supabase SQL Editor:
🔗 https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/sql

### 2. Cole o SQL abaixo e execute:

```sql
-- Criar tabela de Audit Log para Super Admin
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas super_admin pode ver audit logs
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.user_id = auth.uid()
      AND clients.role = 'super_admin'
    )
  );

-- Política: Apenas super_admin pode inserir audit logs
CREATE POLICY "Super admins can insert audit logs" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.user_id = auth.uid()
      AND clients.role = 'super_admin'
    )
  );

-- Comentários
COMMENT ON TABLE public.audit_logs IS 'Registro de todas as ações realizadas no sistema por super admins';
COMMENT ON COLUMN public.audit_logs.action IS 'Tipo de ação executada (ex: UPDATE_USER_ROLE, DELETE_COMPANY)';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Tipo de recurso afetado (ex: user, company, campaign)';
COMMENT ON COLUMN public.audit_logs.resource_id IS 'ID do recurso afetado';
COMMENT ON COLUMN public.audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';
```

### 3. Clique em "Run" ou pressione Ctrl+Enter

### 4. Aguarde a mensagem de sucesso ✅

## ✨ Após executar:

Todas as ações do Super Admin serão automaticamente registradas no Audit Log:
- Edição de roles de usuários
- Ativação/desativação de usuários
- E futuras ações que serão implementadas

## 🎯 Para verificar se funcionou:

1. Acesse o Super Admin no sistema
2. Vá em "User Management"
3. Edite o role de algum usuário
4. Vá em "Audit Log"
5. Você verá a ação registrada! 🎉
