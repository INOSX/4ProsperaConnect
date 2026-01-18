-- Migration: Adicionar coluna is_active na tabela clients
-- Data: 2025-01-18
-- Descrição: Adiciona controle de status ativo/inativo para usuários

-- 1. Adicionar coluna is_active (padrão: true)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- 2. Atualizar usuários existentes para ativo
UPDATE public.clients
SET is_active = true
WHERE is_active IS NULL;

-- 3. Adicionar comentário
COMMENT ON COLUMN public.clients.is_active IS 'Indica se o usuário está ativo (true) ou inativo (false)';

-- 4. Criar índice para melhor performance em queries de usuários ativos
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients(is_active);

-- 5. Log da migration
DO $$
BEGIN
  RAISE NOTICE '✅ Coluna is_active adicionada com sucesso à tabela clients';
  RAISE NOTICE '✅ Todos os usuários existentes marcados como ativos';
  RAISE NOTICE '✅ Índice criado para otimizar queries';
END $$;
