-- Script para criar a tabela clients no Supabase
-- Execute este script no SQL Editor do Supabase (dytuwutsjjxxmyefrfed)

-- Tabela para armazenar clientes e suas integrações com OpenAI
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    openai_assistant_id TEXT,
    vectorstore_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON public.clients(client_code);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus próprios clientes
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: usuários podem inserir seus próprios clientes
CREATE POLICY "Users can insert their own clients" ON public.clients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seus próprios clientes
CREATE POLICY "Users can update their own clients" ON public.clients
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem deletar seus próprios clientes
CREATE POLICY "Users can delete their own clients" ON public.clients
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verificar se a tabela foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'clients';

