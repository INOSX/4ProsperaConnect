-- Script para criar APENAS a tabela product_catalog
-- Execute este script primeiro se você receber erro de tabela não encontrada
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/sql

-- Criar tabela product_catalog
CREATE TABLE IF NOT EXISTS public.product_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('account', 'credit', 'investment', 'insurance', 'benefit', 'service')),
    category TEXT,
    target_audience TEXT[] DEFAULT '{}',
    requirements JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    pricing JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_product_catalog_code ON public.product_catalog(product_code);
CREATE INDEX IF NOT EXISTS idx_product_catalog_type ON public.product_catalog(product_type);
CREATE INDEX IF NOT EXISTS idx_product_catalog_active ON public.product_catalog(is_active);

-- Habilitar RLS
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;

-- Política básica: todos podem ver produtos ativos
CREATE POLICY "Anyone can view active products" ON public.product_catalog
    FOR SELECT
    USING (is_active = true);

-- Política: apenas admins podem inserir/atualizar/deletar
CREATE POLICY "Admins can manage products" ON public.product_catalog
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Verificar se foi criada
SELECT 
    'Tabela product_catalog criada com sucesso!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_catalog';

