-- ==========================================
-- FIX DEFINITIVO: RLS POLICIES COM JWT
-- ==========================================
-- Solução final para recursão infinita usando JWT claims

-- 1. CRIAR FUNÇÃO PARA ATUALIZAR JWT COM ROLE
CREATE OR REPLACE FUNCTION public.handle_updated_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar user_metadata no auth.users com a nova role
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role)
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 2. CRIAR TRIGGER PARA ATUALIZAR JWT QUANDO ROLE MUDAR
DROP TRIGGER IF EXISTS on_client_role_updated ON public.clients;

CREATE TRIGGER on_client_role_updated
  AFTER INSERT OR UPDATE OF role ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_user_role();

-- 3. ATUALIZAR ROLES EXISTENTES NO JWT (UMA VEZ)
DO $$
DECLARE
  client_record RECORD;
BEGIN
  FOR client_record IN SELECT user_id, role FROM public.clients
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(client_record.role)
    )
    WHERE id = client_record.user_id;
  END LOOP;
  
  RAISE NOTICE '✅ % roles atualizadas no JWT', (SELECT COUNT(*) FROM public.clients);
END $$;

-- 4. REMOVER POLICY RECURSIVA
DROP POLICY IF EXISTS "Unified select policy for all roles" ON public.clients;

-- 5. CRIAR NOVA POLICY USANDO JWT (SEM RECURSÃO!)
CREATE POLICY "Unified select policy for all roles" 
ON public.clients
FOR SELECT 
TO authenticated
USING (
  -- Ver próprios dados
  auth.uid() = user_id
  OR
  -- OU é admin (lê do JWT, SEM SELECT!)
  (auth.jwt()->>'role')::text IN ('super_admin', 'bank_manager', 'admin')
);

-- 6. GRANT
GRANT EXECUTE ON FUNCTION public.handle_updated_user_role() TO authenticated;

-- 7. COMENTAR FUNÇÃO ANTIGA (manter por compatibilidade)
COMMENT ON FUNCTION public.get_user_role() IS 
'DEPRECATED: Usar auth.jwt()->>"role" em vez desta função para evitar recursão';

-- Log de sucesso
DO $$ BEGIN 
  RAISE NOTICE '✅ RLS Policies com JWT implementadas com sucesso!'; 
  RAISE NOTICE '✅ Trigger criado: roles serão sincronizadas automaticamente'; 
  RAISE NOTICE '✅ SEM RECURSÃO: auth.jwt()->>"role" ao invés de SELECT';
END $$;
