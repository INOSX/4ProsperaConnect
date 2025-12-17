# 🔗 Configurar URLs de Redirecionamento no Supabase

## Problema

Os emails de confirmação enviados pelo Supabase estão usando `localhost` ao invés das URLs corretas do ambiente (preview ou production).

## Solução

Configure as URLs no painel do Supabase. Isso é feito em **Authentication > URL Configuration**.

---

## 📋 Passo a Passo

### 1. Acesse o Painel do Supabase

1. Acesse: https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed
2. Faça login na sua conta
3. No menu lateral, clique em **Authentication**
4. Clique em **URL Configuration** (ou vá em **Settings** → **URL Configuration**)

### 2. Configure a Site URL

A **Site URL** é a URL principal da sua aplicação. Configure para a URL de **Production**:

```
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app
```

**⚠️ IMPORTANTE**: Não inclua a barra final (`/`) na URL.

### 3. Configure as Redirect URLs

As **Redirect URLs** são todas as URLs permitidas para redirecionamento após autenticação. Adicione **todas** as URLs que você usa:

**⚠️ IMPORTANTE**: A aplicação usa a rota `/auth/callback` para processar confirmações de email. Certifique-se de incluir essa rota nas URLs permitidas.

#### URLs de Production:
```
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app/**
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app/auth/callback
```

#### URLs de Preview (Vercel):
```
https://4prosperaconnect-*.vercel.app/**
https://4prosperaconnect-*.vercel.app/auth/callback
```

**OU** adicione URLs específicas de preview:
```
https://4prosperaconnect-e1ddq8k4j-inosx.vercel.app/**
https://4prosperaconnect-e1ddq8k4j-inosx.vercel.app/auth/callback
```

#### URL de Desenvolvimento Local (opcional):
```
http://localhost:5173/**
http://localhost:5173/auth/callback
```

### 4. Configuração Recomendada

**Site URL:**
```
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app
```

**Redirect URLs (uma por linha):**
```
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app/**
https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app/auth/callback
https://4prosperaconnect-*.vercel.app/**
https://4prosperaconnect-*.vercel.app/auth/callback
http://localhost:5173/**
http://localhost:5173/auth/callback
```

**Explicação:**
- `**` significa "qualquer caminho" (ex: `/auth/callback`, `/login`, etc.)
- `*` no domínio permite qualquer subdomínio do Vercel (preview deployments)
- URLs de localhost são úteis para desenvolvimento local

### 5. Salvar as Configurações

1. Clique em **Save** ou **Update**
2. Aguarde alguns segundos para as mudanças serem aplicadas

---

## 🔄 Como Funciona

### Fluxo de Confirmação de Email

1. **Usuário se registra** → Supabase envia email de confirmação
2. **Email contém link** → Link aponta para: `https://[SUA-URL]/auth/callback?token=...`
3. **Usuário clica no link** → É redirecionado para sua aplicação
4. **Aplicação processa token** → Confirma o email e autentica o usuário

### Onde o Link é Gerado

O Supabase usa a **Site URL** como base para gerar os links de confirmação. Se estiver configurado como `localhost`, todos os emails terão links para `localhost`.

---

## 🧪 Testar a Configuração

### 1. Teste de Registro

1. Acesse sua aplicação em produção ou preview
2. Crie uma nova conta
3. Verifique o email recebido
4. O link deve apontar para a URL correta (não `localhost`)

### 2. Teste de Confirmação

1. Clique no link do email
2. Você deve ser redirecionado para sua aplicação
3. O email deve ser confirmado automaticamente
4. Você deve estar logado na aplicação

---

## 🛠️ Configuração Avançada (Opcional)

### Usar URLs Diferentes por Ambiente

Se você quiser URLs diferentes para cada ambiente, pode configurar no código:

```javascript
// src/services/supabase.js
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/auth/callback'
  }
  // Fallback para produção
  return 'https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app/auth/callback'
}

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: getRedirectUrl()
  }
})
```

**⚠️ NOTA**: A configuração no painel do Supabase é mais importante e deve ser feita primeiro.

---

## 📝 Checklist

- [ ] Acessei o painel do Supabase
- [ ] Configurei a **Site URL** para a URL de produção
- [ ] Adicionei todas as **Redirect URLs** necessárias (production, preview, localhost)
- [ ] Salvei as configurações
- [ ] Testei o registro de um novo usuário
- [ ] Verifiquei que o email contém a URL correta
- [ ] Testei o clique no link de confirmação

---

## ❓ Problemas Comuns

### Link ainda aponta para localhost

**Solução**: 
1. Verifique se salvou as configurações no Supabase
2. Aguarde alguns minutos (pode levar tempo para propagar)
3. Limpe o cache do navegador
4. Teste com um novo registro

### Erro "Invalid redirect URL"

**Solução**: 
1. Verifique se a URL está na lista de **Redirect URLs** permitidas
2. Certifique-se de que a URL está exatamente como configurada (com ou sem `/` no final)
3. Use `**` para permitir qualquer caminho

### Preview deployments não funcionam

**Solução**: 
1. Adicione o padrão `https://4prosperaconnect-*.vercel.app/**` nas Redirect URLs
2. Ou adicione cada URL de preview individualmente

---

## 🔗 Links Úteis

- [Documentação Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts#redirect-urls)
- [Documentação Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Painel do Projeto](https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed)

---

## 📌 URLs do Projeto

**Production:**
- URL: `https://4prosperaconnect-2f0gzn9n6-inosx.vercel.app`

**Preview (exemplo):**
- URL: `https://4prosperaconnect-e1ddq8k4j-inosx.vercel.app`

**Localhost (desenvolvimento):**
- URL: `http://localhost:5173`

---

**Última atualização**: 16/12/2025

