-- Script para criar tabela de relacionamento entre colaboradores e produtos bancários
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: EMPLOYEE_PRODUCTS
-- ============================================
-- Armazena produtos bancários contratados por colaboradores

CREATE TABLE IF NOT EXISTS public.employee_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.product_catalog(id) ON DELETE CASCADE,
    contract_number TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
    contract_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    monthly_value DECIMAL(10,2),
    contract_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, product_id, contract_number)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employee_products_employee ON public.employee_products(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_products_product ON public.employee_products(product_id);
CREATE INDEX IF NOT EXISTS idx_employee_products_status ON public.employee_products(status);

-- Habilitar RLS
ALTER TABLE public.employee_products ENABLE ROW LEVEL SECURITY;

-- Política: colaboradores podem ver seus próprios produtos
CREATE POLICY "Employees can view their products" ON public.employee_products
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = employee_products.employee_id
            AND platform_user_id = auth.uid()
        )
    );

-- Política: empresas podem ver produtos de seus colaboradores
CREATE POLICY "Companies can view employee products" ON public.employee_products
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.companies c ON e.company_id = c.id
            WHERE e.id = employee_products.employee_id
            AND c.owner_user_id = auth.uid()
        )
    );

-- Política: empresas podem inserir produtos para seus colaboradores
CREATE POLICY "Companies can insert employee products" ON public.employee_products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.companies c ON e.company_id = c.id
            WHERE e.id = employee_products.employee_id
            AND c.owner_user_id = auth.uid()
        )
    );

-- Política: empresas podem atualizar produtos de seus colaboradores
CREATE POLICY "Companies can update employee products" ON public.employee_products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.companies c ON e.company_id = c.id
            WHERE e.id = employee_products.employee_id
            AND c.owner_user_id = auth.uid()
        )
    );

