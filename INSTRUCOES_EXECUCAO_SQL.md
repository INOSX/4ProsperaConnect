# Instruções para Execução dos Scripts SQL

## Ordem de Execução OBRIGATÓRIA

⚠️ **IMPORTANTE**: Execute os scripts na ordem abaixo. Não pule etapas!

### 1. Criar Tabelas (OBRIGATÓRIO PRIMEIRO)

Execute o script `create_banking_solution_tables.sql` no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo completo do arquivo `create_banking_solution_tables.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a confirmação de sucesso

Este script cria todas as tabelas necessárias:
- Tabelas de prospecção (`prospects`, `cpf_to_cnpj_mapping`, `market_signals`, `qualification_criteria`)
- Tabelas de empresas (`companies`, `employees`, `company_benefits`, `employee_benefits`)
- Tabelas de campanhas (`campaigns`, `recommendations`, `product_catalog`)
- Tabelas de integrações (`data_connections`, `data_sync_jobs`, `external_data_sources`)
- Extensões nas tabelas existentes (`clients`, `data_sources_new`)

### 2. Inserir Dados Mockados (OPCIONAL)

**SOMENTE** após executar o script de criação de tabelas, execute o script `create_mock_data.sql`:

1. No SQL Editor do Supabase, crie uma nova query
2. Cole o conteúdo completo do arquivo `create_mock_data.sql`
3. Clique em **Run**

Este script insere dados de exemplo para desenvolvimento e testes:
- Prospects mockados com diferentes scores e status
- Empresas e colaboradores de exemplo
- Benefícios configurados
- Catálogo de produtos
- Campanhas de exemplo

## Verificação

Após executar os scripts, verifique se as tabelas foram criadas:

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

Você deve ver todas as 7 tabelas listadas acima.

## Solução de Problemas

### Erro: "relation does not exist"

Se você receber um erro como `ERROR: 42P01: relation "public.product_catalog" does not exist`:

1. **Pare imediatamente** a execução do script
2. Verifique se executou o script `create_banking_solution_tables.sql` primeiro
3. Execute o script de criação de tabelas novamente
4. Só então execute o script de dados mockados

### Erro: "duplicate key value"

Se você receber erros de chave duplicada ao executar o script de mock data:

- Isso é normal se você já executou o script antes
- Os comandos `ON CONFLICT DO NOTHING` evitam duplicatas
- Você pode ignorar esses erros ou executar apenas as partes que faltam

### Verificar se uma tabela existe

Para verificar se uma tabela específica existe:

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'product_catalog'
);
```

Se retornar `true`, a tabela existe. Se retornar `false`, você precisa executar o script de criação de tabelas.

## Notas Importantes

- O script de criação de tabelas é **idempotente** (pode ser executado múltiplas vezes sem problemas)
- O script de dados mockados também é seguro para executar múltiplas vezes (usa `ON CONFLICT DO NOTHING`)
- Se você já tem dados nas tabelas, os scripts não vão sobrescrever dados existentes
- Os dados mockados são apenas para desenvolvimento - não use em produção sem revisar

