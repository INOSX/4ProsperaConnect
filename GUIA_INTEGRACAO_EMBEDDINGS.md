# Guia de Integração - OpenAI Embeddings API

## ✅ O que foi implementado

A integração com OpenAI Embeddings API foi **completamente implementada**. Você não precisa fazer nada adicional além do que está descrito abaixo.

### Arquivos Criados/Atualizados

1. **`api/openai/embeddings.js`** - Nova API route para gerar embeddings
   - Endpoint: `/api/openai/embeddings`
   - Ações: `generateEmbedding` e `generateBatch`
   - Usa a mesma chave API que já está configurada (`OPENAI_API_KEY`)

2. **`src/services/bmad/utils/embeddingGenerator.js`** - Atualizado
   - Agora chama a API route real em vez de usar placeholders
   - Cache de embeddings (24 horas)
   - Suporte a batch processing

3. **`src/services/bmad/services/DatabaseVectorizationService.js`** - Atualizado
   - Agora usa EmbeddingGenerator real
   - Gera embeddings reais ao vetorizar dados

4. **`src/services/bmad/services/VectorSearchService.js`** - Atualizado
   - Converte queries em embeddings reais
   - Busca semântica funcional

## 🔧 O que você precisa fazer

### 1. Verificar Variável de Ambiente (Já deve estar configurada)

A variável `OPENAI_API_KEY` já deve estar configurada no seu Vercel/projeto, pois você já usa OpenAI para outras funcionalidades. Se não estiver:

- **Vercel**: Vá em Settings → Environment Variables
- Adicione: `OPENAI_API_KEY` com sua chave da OpenAI

### 2. Executar Script SQL no Supabase (OBRIGATÓRIO)

Execute o script `create_vectorization_system.sql` no SQL Editor do Supabase:

```sql
-- O script cria:
-- 1. Extensão pgvector
-- 2. Tabela data_embeddings
-- 3. Índices para performance
-- 4. Triggers para sincronização automática
-- 5. Função semantic_search para buscas
```

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de `create_vectorization_system.sql`
4. Execute o script

### 3. Vetorizar Dados Existentes (Opcional, mas Recomendado)

Após executar o script SQL, você pode vetorizar os dados existentes. Isso pode ser feito de duas formas:

#### Opção A: Via Interface (quando implementar)
Criar um botão/endpoint para executar a vetorização inicial

#### Opção B: Via Código (temporário)
```javascript
import DatabaseVectorizationService from './services/bmad/services/DatabaseVectorizationService'

const vectorizationService = new DatabaseVectorizationService()
const result = await vectorizationService.vectorizeAll()
console.log(`Vetorizados ${result.embeddingsCreated} registros`)
```

## 🎯 Como Funciona Agora

### Geração de Embeddings
1. Quando você chama `EmbeddingGenerator.generateEmbedding(text)`
2. Ele faz uma requisição para `/api/openai/embeddings`
3. A API route chama OpenAI Embeddings API
4. Retorna o embedding real (1536 dimensões usando text-embedding-3-small)
5. Embedding é cacheado por 24 horas

### Vetorização de Dados
1. `DatabaseVectorizationService.vectorizeAll()` busca todos os dados
2. Cria textos semânticos de cada registro
3. Gera embeddings em batch (eficiente)
4. Salva na tabela `data_embeddings` com tipo `vector`

### Busca Semântica
1. Usuário faz pergunta: "Encontrar empresas similares à Messiax"
2. `VectorSearchService` converte pergunta em embedding
3. Busca similaridade no pgvector usando função `semantic_search`
4. Retorna resultados ordenados por relevância semântica

## 📊 Status Atual

- ✅ API route criada e funcional
- ✅ EmbeddingGenerator integrado com OpenAI
- ✅ DatabaseVectorizationService usando embeddings reais
- ✅ VectorSearchService usando embeddings reais
- ⚠️ **Pendente**: Executar script SQL no Supabase
- ⚠️ **Pendente**: Vetorizar dados existentes (opcional)

## 🚀 Próximos Passos

1. **Execute o script SQL** (`create_vectorization_system.sql`) no Supabase
2. **Teste a geração de embeddings** fazendo uma consulta no módulo especialista
3. **Vetorize dados existentes** quando quiser (pode ser feito depois)

## 💡 Notas Importantes

- A chave `OPENAI_API_KEY` já deve estar configurada (você já usa OpenAI)
- O script SQL precisa ser executado apenas uma vez
- A vetorização inicial pode demorar dependendo da quantidade de dados
- Os triggers garantem que novos dados sejam vetorizados automaticamente
- O cache de embeddings reduz custos e melhora performance

## 🔍 Verificação

Para verificar se está funcionando:

1. Execute o script SQL
2. Faça uma consulta no especialista: "Listar empresas"
3. Verifique no console se há erros
4. Se funcionar, a integração está completa!

