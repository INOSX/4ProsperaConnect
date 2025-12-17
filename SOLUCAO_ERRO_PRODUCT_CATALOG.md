# Solução para Erro: relation "public.product_catalog" does not exist

## Problema Identificado

O erro ocorre porque a tabela `recommendations` estava sendo criada **ANTES** da tabela `product_catalog`, mas ela tem uma foreign key que referencia `product_catalog`. Mesmo com `CREATE TABLE IF NOT EXISTS`, o PostgreSQL precisa que a tabela referenciada exista quando a foreign key é criada.

## Solução Aplicada

✅ **Corrigi a ordem no script `create_banking_solution_tables.sql`**:
- Agora `product_catalog` é criada **ANTES** de `recommendations`
- Adicionei índices para `product_catalog`
- Adicionei índice para a foreign key em `recommendations`

## Como Resolver Agora

### Opção 1: Executar o Script Corrigido (Recomendado)

1. Execute o script `create_banking_solution_tables.sql` **completo** novamente no Supabase SQL Editor
2. O script agora cria as tabelas na ordem correta
3. Depois execute `create_mock_data.sql`

### Opção 2: Criar Apenas a Tabela Product Catalog Primeiro

Se você quiser criar apenas a tabela que está faltando primeiro:

1. Execute o script `create_product_catalog_table.sql` que criei
2. Depois execute o resto do `create_banking_solution_tables.sql`

### Opção 3: Verificar e Criar Manualmente

Execute este SQL para verificar se a tabela existe:

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'product_catalog'
);
```

Se retornar `false`, execute:

```sql
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
```

## Verificação Final

Após executar os scripts, verifique se todas as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'prospects', 'companies', 'employees', 'campaigns', 
  'recommendations', 'product_catalog', 'data_connections'
)
ORDER BY table_name;
```

Você deve ver todas as 7 tabelas listadas.

