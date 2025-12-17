# 📋 Como Ver os Logs do Vercel

## Método 1: Via Dashboard do Vercel (Mais Fácil)

1. **Acesse o painel do Vercel:**
   - https://vercel.com/dashboard
   - Faça login se necessário

2. **Selecione seu projeto:**
   - Clique no projeto **4prosperaconnect** (ou o nome do seu projeto)

3. **Acesse a aba "Logs":**
   - No menu superior, clique em **"Logs"**
   - OU vá em **"Deployments"** → Clique no último deploy → Aba **"Logs"**

4. **Filtre pelos logs da função:**
   - Os logs aparecerão em tempo real
   - Procure por mensagens que contenham: `Supabase Storage API`, `Storage API called`, `ensureBucket`, etc.

---

## Método 2: Via Deployments (Mais Detalhado)

1. **Acesse o projeto no Vercel**

2. **Vá em "Deployments"** (no menu lateral ou superior)

3. **Clique no último deploy** (o mais recente)

4. **Na página do deploy, você verá:**
   - **"Functions"** - Lista de funções serverless
   - **"Logs"** - Logs do deploy
   - **"Build Logs"** - Logs da build

5. **Para ver logs de runtime:**
   - Clique em **"Functions"**
   - Procure por `api/supabase/storage`
   - Clique nele para ver os logs dessa função específica

---

## Método 3: Via Vercel CLI (Terminal)

Se você tem o Vercel CLI instalado:

```bash
# Ver logs em tempo real
vercel logs

# Ver logs de uma função específica
vercel logs --follow

# Ver logs de produção
vercel logs --prod
```

---

## O que procurar nos logs:

Quando você tentar fazer upload, procure por estas mensagens:

- `Storage API called:` - Confirma que a API foi chamada
- `Supabase Storage API - Debug:` - Mostra se as credenciais foram encontradas
- `Admin client initialized successfully` - Confirma que o cliente Supabase foi criado
- `ensureBucket called for userId:` - Confirma que está tentando criar/verificar o bucket
- `Bucket created successfully:` - Confirma que o bucket foi criado
- `Supabase admin API error:` - Mostra o erro se algo falhar

---

## Se não encontrar os logs:

1. **Verifique se o deploy foi concluído:**
   - Vá em "Deployments"
   - O último deploy deve estar com status "Ready" (verde)

2. **Aguarde alguns minutos:**
   - Às vezes os logs demoram alguns segundos para aparecer

3. **Tente fazer uma nova requisição:**
   - Faça upload novamente
   - Os logs aparecerão em tempo real

4. **Verifique se está no projeto correto:**
   - Certifique-se de estar no projeto **4prosperaconnect** (ou o nome correto)

---

## URL Direto (se você souber o ID do projeto):

```
https://vercel.com/[seu-time]/[seu-projeto]/logs
```

Exemplo:
```
https://vercel.com/inosx/4prosperaconnect/logs
```

---

**Última atualização**: 17/12/2025

