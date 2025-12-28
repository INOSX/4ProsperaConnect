# Instruções para Executar Função RPC de SQL Dinâmica

## Problema Identificado

O sistema estava gerando queries SQL corretas via IA, mas não as executava diretamente. Em vez disso, tentava fazer agrupamento manual, o que não funcionava para queries complexas com `CASE WHEN`, `DATE_TRUNC`, etc.

## Solução Implementada

Foi criada uma função RPC no Supabase (`execute_dynamic_sql`) que permite executar queries SQL dinâmicas com segurança:
- ✅ Apenas permite queries SELECT
- ✅ Bloqueia comandos perigosos (DROP, DELETE, UPDATE, etc.)
- ✅ Respeita RLS (Row Level Security)
- ✅ Retorna resultados como JSON

## Passo a Passo

### 1. Executar o Script SQL no Supabase

1. Acesse o **SQL Editor** do Supabase:
   - https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql

2. Abra o arquivo `create_execute_dynamic_sql_rpc.sql` e copie todo o conteúdo

3. Cole no SQL Editor e clique em **Run** (ou pressione Ctrl+Enter)

4. Verifique se a função foi criada com sucesso:
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'execute_dynamic_sql';
   ```

### 2. Testar a Função (Opcional)

Execute uma query de teste:

```sql
SELECT execute_dynamic_sql(
  'SELECT CASE WHEN EXTRACT(MONTH FROM created_at) <= 6 THEN ''1º Semestre'' ELSE ''2º Semestre'' END AS semestre, COUNT(*) AS quantidade FROM companies GROUP BY semestre ORDER BY semestre'
);
```

Deve retornar um JSON com os resultados agrupados por semestre.

### 3. Verificar Permissões

A função usa `SECURITY DEFINER`, o que significa que executa com os privilégios do criador, mas ainda respeita RLS das tabelas. Isso garante que:
- Usuários só veem dados que têm permissão (via RLS)
- A função não pode ser usada para modificar dados
- Apenas queries SELECT são permitidas

## O Que Mudou no Código

O `DatabaseQueryAgent` agora:
1. **Prioriza** a execução direta da SQL query gerada pela IA via RPC
2. **Usa fallback** para métodos dinâmicos apenas se a RPC falhar
3. **Formata corretamente** os resultados para visualizações

## Resultado Esperado

Agora, quando você perguntar:
> "Compare o número de empresas cadastradas no primeiro semestre com o segundo semestre"

O sistema irá:
1. ✅ A IA gerar a SQL query correta
2. ✅ Executar a SQL diretamente via RPC
3. ✅ Retornar os dados corretos agrupados por semestre
4. ✅ Gerar visualizações apropriadas
5. ✅ Responder de forma natural e interpretada

## Troubleshooting

### Erro: "function execute_dynamic_sql does not exist"
- Execute o script SQL no Supabase
- Verifique se está no schema correto (`public`)

### Erro: "permission denied"
- Verifique se o usuário está autenticado
- Verifique as políticas RLS das tabelas

### Erro: "Query contém comandos não permitidos"
- A função bloqueia comandos perigosos (DROP, DELETE, etc.)
- Verifique se a query gerada pela IA é apenas SELECT

### Resultados vazios
- Verifique se há dados na tabela
- Verifique se as políticas RLS permitem acesso aos dados
- Verifique os logs do console para ver a query SQL gerada

