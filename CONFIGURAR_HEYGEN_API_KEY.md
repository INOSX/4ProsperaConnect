# 🔑 Como Configurar a HeyGen API Key no Vercel

## ❌ Problema Identificado

O avatar Bryan não está conectando porque a **HeyGen API Key não está configurada** nas variáveis de ambiente do Vercel.

### Erro no Console:
```
POST https://4prosperaconnect.vercel.app/api/heygen/proxy 500 (Internal Server Error)
Access to fetch at 'https://api.heygen.com/v1/streaming.new' has been blocked by CORS
```

---

## ✅ Solução: Adicionar a API Key no Vercel

### Passo 1: Obter a API Key da HeyGen

1. Acesse: https://app.heygen.com/
2. Faça login na sua conta
3. Vá em **Settings** → **API**
4. Copie a **API Key**

---

### Passo 2: Adicionar no Vercel

#### Opção A: Via Interface Web

1. Acesse: https://vercel.com/inosx
2. Clique no projeto: **4ProsperaConnect**
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add Variable**
5. Preencha:
   - **Name**: `HEYGEN_API_KEY`
   - **Value**: Cole a API Key copiada
   - **Environment**: Marque **Production**, **Preview**, **Development**
6. Clique em **Save**
7. **IMPORTANTE**: Vá em **Deployments** e clique em **Redeploy** no último deploy

---

#### Opção B: Via CLI do Vercel

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Adicionar a variável
vercel env add HEYGEN_API_KEY

# Quando perguntado:
# - What's the value of HEYGEN_API_KEY?
#   Cole a API Key
# - Add HEYGEN_API_KEY to which Environments?
#   Selecione: Production, Preview, Development

# 4. Redeployer
vercel --prod
```

---

### Passo 3: Verificar Configuração

Após adicionar e redeployar, teste:

1. Acesse: https://4prosperaconnect.vercel.app/specialist
2. Clique em "Conectar Especialista"
3. Abra o Console (F12)
4. Verifique os logs:
   - ✅ **Se funcionar**: Verá `✅ Session token obtained`
   - ❌ **Se falhar**: Verá `❌ Error` e me envie os logs

---

## 🔍 Debug: Verificar se a API Key está correta

Se após configurar ainda der erro, verifique:

### 1. Formato da API Key
- A API Key da HeyGen geralmente começa com letras/números
- Exemplo: `NzA4ZjM5YzktMTYxYy00OWY...`
- **NÃO** deve ter espaços antes/depois

### 2. Testar Diretamente
```bash
# Substitua YOUR_API_KEY pela sua chave
curl -X GET https://api.heygen.com/v2/avatars \
  -H "X-Api-Key: YOUR_API_KEY"
```

**Resposta esperada**: Lista de avatares em JSON  
**Se der 401**: A API Key está inválida

---

## 🐛 Logs de Debug

Após configurar e redeployar, me envie os logs do console completos se ainda houver erro.

### O que procurar nos logs:

✅ **Sucesso**:
```
✅ Session token obtained: eyJ0b2tlbiI6...
🔵 Creating StreamingAvatar with token: eyJ0b2tlbiI6...
✅ createStartAvatar succeeded
```

❌ **Falha**:
```
POST https://4prosperaconnect.vercel.app/api/heygen/proxy 500
⚠️ Failed to list avatars, response not ok
❌ Error creating avatar session
```

---

## 📝 Checklist

- [ ] API Key obtida do HeyGen
- [ ] API Key adicionada no Vercel (Production, Preview, Development)
- [ ] Projeto redesployado
- [ ] Cache do browser limpo (Ctrl + Shift + R)
- [ ] Teste realizado

---

## 🆘 Se Ainda Não Funcionar

Me envie:
1. **Screenshot** da tela de Environment Variables do Vercel
2. **Logs completos** do console (F12)
3. Confirmação de que redesployou

---

## 📚 Referências

- [HeyGen API Docs](https://docs.heygen.com/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
