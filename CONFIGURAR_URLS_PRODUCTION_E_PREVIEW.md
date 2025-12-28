# 🔗 Configurar URLs de Production e Preview no Supabase

Este guia explica como configurar tanto a URL de **Production** quanto a URL de **Preview** no Supabase.

## 📋 URLs do Projeto

- **Production**: `https://4prosperaconnect.vercel.app`
- **Preview**: `https://4prosperaconnect-e7osun5be-inosx.vercel.app`

---

## 🎯 Passo a Passo

### 1. Acessar Configurações de Autenticação

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto **4Prospera Connect**
3. No menu lateral, clique em **Authentication**
4. Clique na aba **URL Configuration**

### 2. Configurar Site URL (Production)

Na seção **Site URL**, defina a URL de **Production**:

```
https://4prosperaconnect.vercel.app
```

**Por que usar Production?**
- O Supabase usa esta URL como base para gerar links de email
- Emails de recuperação de senha terão links apontando para production
- Isso é o comportamento padrão recomendado

### 3. Adicionar Redirect URLs

Na seção **Redirect URLs**, adicione **todas** as URLs abaixo (uma por linha):

#### URLs de Production:
```
https://4prosperaconnect.vercel.app/**
https://4prosperaconnect.vercel.app/auth/callback
```

#### URLs de Preview (específica):
```
https://4prosperaconnect-e7osun5be-inosx.vercel.app/**
https://4prosperaconnect-e7osun5be-inosx.vercel.app/auth/callback
```

#### URLs com Wildcard (para futuros previews):
```
https://4prosperaconnect-*.vercel.app/**
https://4prosperaconnect-*.vercel.app/auth/callback
```

#### URLs de Desenvolvimento Local:
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### 4. Salvar Configurações

1. Clique em **Save** ou **Update**
2. Aguarde alguns segundos para as mudanças serem aplicadas

---

## ✅ Resultado

Após configurar:

- ✅ **Production** (`https://4prosperaconnect.vercel.app`) funcionará
- ✅ **Preview** (`https://4prosperaconnect-e7osun5be-inosx.vercel.app`) funcionará
- ✅ **Futuros previews** do Vercel funcionarão automaticamente (graças ao wildcard `*`)
- ✅ **Desenvolvimento local** funcionará

---

## 🔍 Como Funciona

### Site URL vs Redirect URLs

- **Site URL**: URL principal usada como base para gerar links de email
- **Redirect URLs**: Lista de URLs permitidas para redirecionamento após autenticação

### Por que usar Wildcard?

O padrão `https://4prosperaconnect-*.vercel.app/**` permite que:
- Qualquer preview deployment do Vercel funcione automaticamente
- Não precise adicionar cada novo preview manualmente
- O `*` corresponde a qualquer string (ex: `e7osun5be-inosx`, `abc123-def456`, etc.)

### Fluxo de Recuperação de Senha

1. Usuário solicita recuperação em **qualquer URL** (production ou preview)
2. O código detecta automaticamente a URL atual: `window.location.origin`
3. Supabase envia email com link apontando para a URL de **production** (Site URL)
4. Usuário clica no link → redireciona para production
5. Se o usuário estava em preview, pode voltar para preview após redefinir senha

---

## 🧪 Testar Ambas as URLs

### Teste em Production:
1. Acesse: `https://4prosperaconnect.vercel.app/forgot-password`
2. Solicite recuperação de senha
3. Verifique se o email tem link para production
4. Teste o fluxo completo

### Teste em Preview:
1. Acesse: `https://4prosperaconnect-e7osun5be-inosx.vercel.app/forgot-password`
2. Solicite recuperação de senha
3. O email terá link para production (normal)
4. Após redefinir, pode voltar para preview se necessário

---

## 📝 Checklist Final

- [ ] Site URL configurado para production: `https://4prosperaconnect.vercel.app`
- [ ] Redirect URLs incluem production: `https://4prosperaconnect.vercel.app/**`
- [ ] Redirect URLs incluem preview específico: `https://4prosperaconnect-e7osun5be-inosx.vercel.app/**`
- [ ] Redirect URLs incluem wildcard: `https://4prosperaconnect-*.vercel.app/**`
- [ ] Redirect URLs incluem localhost: `http://localhost:3000/**`
- [ ] Todas as URLs incluem `/auth/callback`
- [ ] Configurações foram salvas
- [ ] Teste em production funcionando
- [ ] Teste em preview funcionando

---

## 🚨 Notas Importantes

1. **Site URL sempre aponta para Production**
   - Isso é intencional e recomendado
   - Links de email sempre apontam para production
   - Isso garante consistência

2. **Redirect URLs permitem ambas**
   - Tanto production quanto preview podem receber redirecionamentos
   - O código detecta automaticamente a URL atual

3. **Wildcard para Previews Futuros**
   - O padrão `*` permite que novos previews funcionem automaticamente
   - Não precisa adicionar cada preview manualmente

4. **Desenvolvimento Local**
   - Sempre inclua localhost nas Redirect URLs
   - Isso permite testar localmente

---

## 🔗 Links Úteis

- [Documentação Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts#redirect-urls)
- [Dashboard Supabase](https://app.supabase.com)

---

**Última atualização:** Dezembro 2024

