# Migração de Dimensão dos Embeddings

## Problema Identificado

O erro `column cannot have more than 2000 dimensions for hnsw index` indica que o pgvector limita índices HNSW a 2000 dimensões. O código estava tentando usar `text-embedding-3-large` com 3072 dimensões, o que excede esse limite.

## Solução Adotada

Mudamos para usar `text-embedding-3-small` com **1536 dimensões**, que:
- ✅ Está dentro do limite HNSW (2000 dimensões)
- ✅ Permite criar índices HNSW para buscas rápidas
- ✅ Oferece boa qualidade de embeddings
- ✅ É mais econômico que o modelo large

## Solução

Execute o script de migração `migrate_embedding_dimensions.sql` no SQL Editor do Supabase para corrigir a dimensão da coluna `embedding`.

### Passos para Resolver

1. **Acesse o Supabase Dashboard**
   - Vá para o projeto no Supabase
   - Navegue até "SQL Editor"

2. **Execute o Script de Migração**
   - Abra o arquivo `migrate_embedding_dimensions.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run" para executar

3. **Verifique se a Migração Foi Bem-Sucedida**
   - O script irá:
     - Remover o índice HNSW antigo (se existir)
     - Garantir que a coluna `embedding` está configurada para `vector(1536)`
     - Recriar o índice HNSW com a dimensão correta (1536)
     - Atualizar a função `semantic_search` para usar 1536 dimensões

4. **Regenere os Embeddings**
   - Após a migração, acesse a página de vetorização
   - Clique em "Vetorizar Todos os Dados"
   - Os embeddings serão regenerados usando `text-embedding-3-small` com 1536 dimensões

## O que o Script Faz

- **Remove o índice antigo**: Para permitir a alteração da coluna (se necessário)
- **Garante dimensão correta**: Configura a coluna `embedding` para `vector(1536)` (compatível com HNSW)
- **Limpa embeddings antigos**: Se houver dados com dimensão incorreta, eles serão limpos (definidos como NULL)
- **Recria o índice HNSW**: Com 1536 dimensões para otimizar buscas semânticas
- **Atualiza funções**: Garante que `semantic_search` use 1536 dimensões

## Verificação

Após executar o script, você pode verificar se funcionou executando esta query no SQL Editor:

```sql
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'data_embeddings' 
AND column_name = 'embedding';
```

A coluna `embedding` deve mostrar `vector` como tipo, e a dimensão deve ser 1536.

## Notas Importantes

- ⚠️ **Backup**: Se você já tem embeddings na tabela, eles serão limpos durante a migração. Isso é necessário porque embeddings com dimensão diferente não podem ser convertidos automaticamente.
- ✅ **Regeneração**: Após a migração, execute "Vetorizar Todos os Dados" para regenerar todos os embeddings com a dimensão correta.
- 🔄 **Triggers**: Os triggers continuarão funcionando normalmente após a migração, criando registros com `embedding = NULL` que serão processados pelo backend.

## Detecção Automática

O código agora detecta automaticamente esse problema:
- Antes de processar qualquer vetorização, verifica se a dimensão está correta
- Se detectar incompatibilidade, retorna um erro claro com instruções
- Durante o processamento, captura erros de dimensão e fornece mensagens detalhadas

## Suporte

Se você encontrar problemas durante a migração:
1. Verifique os logs do Supabase para mensagens de erro específicas
2. Certifique-se de que a extensão `vector` está habilitada
3. Verifique se você tem permissões para alterar a estrutura da tabela
4. Se necessário, execute `create_vectorization_system.sql` novamente antes da migração

