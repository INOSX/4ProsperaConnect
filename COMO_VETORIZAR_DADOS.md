# Como Vetorizar os Dados Existentes

## 🎯 Forma Mais Simples (Recomendada)

### Passo 1: Acesse a Página de Vetorização

1. Abra seu navegador
2. Acesse: `http://localhost:3000/vectorization` (ou sua URL de produção)
3. Você verá um painel com botões e estatísticas

### Passo 2: Clique em "Vetorizar Todos os Dados"

1. No painel, você verá um botão grande azul: **"Vetorizar Todos os Dados"**
2. Clique nele
3. Confirme quando perguntado
4. Aguarde alguns minutos (depende da quantidade de dados)

### Passo 3: Pronto!

Os dados serão vetorizados automaticamente. Você verá o progresso na tela.

---

## 🔧 Outras Formas de Fazer

### Opção 2: Via Console do Navegador

1. Abra o console do navegador (F12)
2. Cole este código:

```javascript
fetch('/api/vectorization/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'vectorizeAll'
  })
})
.then(r => r.json())
.then(data => console.log('Resultado:', data))
```

### Opção 3: Via Código no Projeto

Crie um arquivo temporário `vetorizar.js` na raiz do projeto:

```javascript
import VectorizationService from './src/services/vectorizationService'

async function vetorizar() {
  console.log('Iniciando vetorização...')
  const result = await VectorizationService.vectorizeAll()
  console.log('Concluído!', result)
}

vetorizar()
```

---

## 📊 O Que Acontece Quando Você Vetoriza?

1. **Busca todos os dados** das tabelas:
   - `companies` (Empresas)
   - `employees` (Colaboradores)
   - `prospects` (Prospects)
   - `cpf_clients` (Clientes CPF)
   - `unbanked_companies` (Empresas Não Bancarizadas)

2. **Cria textos semânticos** de cada registro
   - Exemplo: "Messiax 12345678000190 Tecnologia Software"

3. **Gera embeddings** usando OpenAI
   - Cada texto vira um vetor de 3072 números
   - Custo: ~$0.00013 por embedding

4. **Salva na tabela** `data_embeddings`
   - Permite busca semântica depois

---

## ⚠️ Importante

- **Primeira vez**: Pode demorar alguns minutos dependendo da quantidade de dados
- **Custo**: Cada embedding custa ~$0.00013 (muito barato)
- **Uma vez só**: Você só precisa fazer isso uma vez para dados existentes
- **Novos dados**: Serão vetorizados automaticamente quando você processar pendentes

---

## 🔄 Depois da Primeira Vetorização

Após vetorizar todos os dados uma vez, você só precisa:

1. **Processar Registros Pendentes** (botão no painel)
   - Isso processa novos dados que foram criados/atualizados
   - Execute periodicamente (ex: uma vez por dia)

2. **Ou configurar processamento automático** (opcional)
   - Criar um cron job para processar pendentes automaticamente

---

## ❓ Dúvidas?

- **"Quanto tempo demora?"** → Depende da quantidade de dados. 100 registros = ~1 minuto
- **"Quanto custa?"** → ~$0.00013 por registro. 1000 registros = ~$0.13
- **"Preciso fazer de novo?"** → Não, apenas uma vez. Depois só processar pendentes
- **"Como sei se funcionou?"** → Veja o status no painel. Deve mostrar "Vetorizados: X"

