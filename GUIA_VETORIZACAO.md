# Guia de Vetorização de Dados

## ✅ Sistema Implementado

O sistema de vetorização está **completamente funcional** e garante que:

1. **Novos dados são automaticamente vetorizados** via triggers SQL
2. **Dados existentes podem ser vetorizados** via interface ou API
3. **Registros pendentes são processados automaticamente**

## 🔄 Como Funciona

### 1. Sincronização Automática (Triggers)

Quando você **insere ou atualiza** um registro nas tabelas:
- `companies`
- `employees`
- `prospects`
- `cpf_clients`
- `unbanked_companies`

O trigger SQL cria automaticamente um registro na tabela `data_embeddings` com:
- `table_name`: Nome da tabela
- `record_id`: ID do registro
- `chunk_text`: Texto semântico extraído
- `embedding`: **NULL** (será preenchido depois)
- `metadata`: Dados do registro original

### 2. Processamento de Embeddings

Os registros criados pelos triggers têm `embedding = NULL`. Eles são processados de duas formas:

#### A) Processamento Automático (Recomendado)
Execute periodicamente o endpoint `processPending` para processar registros pendentes:

```javascript
// Via API
POST /api/vectorization/process
{
  "action": "processPending",
  "batchSize": 50
}
```

#### B) Processamento Manual
Use o painel de administração (`VectorizationPanel`) para processar pendentes ou vetorizar tabelas específicas.

## 📊 Como Usar

### Opção 1: Painel de Administração (Recomendado)

1. Adicione o componente `VectorizationPanel` em uma página de admin
2. Acesse o painel
3. Clique em "Processar Registros Pendentes" para processar novos dados
4. Ou clique em "Vetorizar Todos os Dados" para vetorizar tudo de uma vez

### Opção 2: Via API

#### Processar Registros Pendentes
```javascript
const response = await fetch('/api/vectorization/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'processPending',
    batchSize: 50
  })
})
```

#### Vetorizar Tabela Específica
```javascript
const response = await fetch('/api/vectorization/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'vectorizeTable',
    tableName: 'companies'
  })
})
```

#### Vetorizar Todas as Tabelas
```javascript
const response = await fetch('/api/vectorization/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'vectorizeAll'
  })
})
```

#### Ver Status
```javascript
const response = await fetch('/api/vectorization/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'getStatus'
  })
})
```

### Opção 3: Via Serviço JavaScript

```javascript
import VectorizationService from './services/vectorizationService'

// Processar pendentes
await VectorizationService.processPending(50)

// Vetorizar tabela
await VectorizationService.vectorizeTable('companies')

// Vetorizar tudo
await VectorizationService.vectorizeAll()

// Ver status
const status = await VectorizationService.getStatus()
console.log(status)
```

## 🔧 Configuração Automática

### Processamento Periódico (Opcional)

Para processar registros pendentes automaticamente, você pode criar um cron job ou usar Vercel Cron:

```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/vectorization/process",
    "schedule": "*/5 * * * *" // A cada 5 minutos
  }]
}
```

Ou criar um endpoint que processa pendentes:

```javascript
// api/vectorization/cron.js
export default async function handler(req, res) {
  // Verificar se é uma chamada autorizada (ex: header secreto)
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Processar pendentes
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vectorization/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'processPending',
      batchSize: 100
    })
  })

  return res.status(200).json(await response.json())
}
```

## 📝 Fluxo Completo

1. **Usuário cria/atualiza registro** → Trigger SQL cria entrada em `data_embeddings` com `embedding = NULL`
2. **Sistema processa pendentes** → Busca registros com `embedding = NULL`
3. **Gera embeddings** → Chama OpenAI Embeddings API
4. **Atualiza registro** → Salva embedding na tabela `data_embeddings`
5. **Busca semântica** → Usa embeddings para buscar dados similares

## ⚠️ Importante

- **Dimensões do embedding**: O sistema usa `text-embedding-3-small` com **1536 dimensões** (compatível com índices HNSW do pgvector, limite: 2000)
- **Custo**: Cada embedding custa ~$0.00013 (muito barato)
- **Performance**: Processamento em batch é mais eficiente
- **Cache**: Embeddings são cacheados por 24 horas no frontend

## 🎯 Próximos Passos

1. **Vetorizar dados existentes**: Execute "Vetorizar Todos os Dados" uma vez
2. **Configurar processamento automático**: Configure cron job para processar pendentes
3. **Monitorar status**: Use `getStatus` para acompanhar o progresso

## 🔍 Verificação

Para verificar se está funcionando:

1. Crie um novo registro (ex: nova empresa)
2. Verifique se aparece em `data_embeddings` com `embedding = NULL`
3. Execute `processPending`
4. Verifique se o `embedding` foi preenchido
5. Faça uma busca semântica no especialista

