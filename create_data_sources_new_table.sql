-- Script para criar a tabela data_sources_new no Supabase
-- Execute este script no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)

-- Tabela para armazenar metadados de arquivos enviados pelos clientes
CREATE TABLE IF NOT EXISTS public.data_sources_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'xls')),
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    column_names TEXT[] NOT NULL DEFAULT '{}',
    column_types TEXT[] NOT NULL DEFAULT '{}',
    file_size BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_data_sources_new_client_id ON public.data_sources_new(client_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_new_created_at ON public.data_sources_new(created_at);
CREATE INDEX IF NOT EXISTS idx_data_sources_new_filename ON public.data_sources_new(filename);

-- RLS (Row Level Security)
ALTER TABLE public.data_sources_new ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas os data sources de seus próprios clientes
CREATE POLICY "Users can view their own data sources" ON public.data_sources_new
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = data_sources_new.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- Política: usuários podem inserir data sources para seus próprios clientes
CREATE POLICY "Users can insert their own data sources" ON public.data_sources_new
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = data_sources_new.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- Política: usuários podem atualizar seus próprios data sources
CREATE POLICY "Users can update their own data sources" ON public.data_sources_new
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = data_sources_new.client_id
            AND clients.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = data_sources_new.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- Política: usuários podem deletar seus próprios data sources
CREATE POLICY "Users can delete their own data sources" ON public.data_sources_new
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = data_sources_new.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- Verificar se a tabela foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'data_sources_new';

