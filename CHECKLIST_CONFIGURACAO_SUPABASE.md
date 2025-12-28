# ✅ Checklist Rápido: Configuração Supabase para Recuperação de Senha

## 🎯 Objetivo
Configurar o Supabase para que o fluxo de recuperação de senha funcione corretamente.

---

## 📋 Checklist Passo a Passo

### 1️⃣ Acessar Dashboard do Supabase
- [ ] Acesse: https://app.supabase.com
- [ ] Faça login na sua conta
- [ ] Selecione o projeto **4Prospera Connect**

### 2️⃣ Configurar URLs de Redirecionamento
- [ ] No menu lateral, clique em **Authentication**
- [ ] Clique na aba **URL Configuration**
- [ ] Na seção **Site URL**, defina a URL de **Production**:
  ```
  https://4prosperaconnect.vercel.app
  ```
- [ ] Na seção **Redirect URLs**, adicione (uma por linha):
  ```
  https://4prosperaconnect.vercel.app/**
  https://4prosperaconnect.vercel.app/auth/callback
  https://4prosperaconnect-e7osun5be-inosx.vercel.app/**
  https://4prosperaconnect-e7osun5be-inosx.vercel.app/auth/callback
  https://4prosperaconnect-*.vercel.app/**
  https://4prosperaconnect-*.vercel.app/auth/callback
  http://localhost:3000/**
  http://localhost:3000/auth/callback
  ```
- [ ] Clique em **Save**

### 3️⃣ Configurar Email Template de Recuperação
- [ ] No menu **Authentication**, clique na aba **Email Templates**
- [ ] Clique no template **Reset Password**
- [ ] **Subject**: Altere para:
  ```
  Redefinir sua senha - 4Prospera Connect
  ```
- [ ] **Body (HTML)**: Use o template do arquivo `CONFIGURAR_RECUPERACAO_SENHA_SUPABASE.md`
- [ ] Clique em **Save**

### 4️⃣ Configurar Email Provider

#### Opção A: Usar Email do Supabase (Desenvolvimento)
- [ ] No menu **Authentication** > **Providers**
- [ ] Verifique se **Email** está habilitado
- [ ] ✅ Pronto! (mas pode ter limitações)

#### Opção B: Configurar SMTP (Produção - Recomendado)
- [ ] Escolha um provedor SMTP (SendGrid, Resend, Mailgun, etc.)
- [ ] Crie uma conta e obtenha as credenciais SMTP
- [ ] No menu **Authentication** > **Providers**
- [ ] Role até **Email** e clique em **Configure SMTP settings**
- [ ] Preencha os campos:
  - **SMTP Host**: (ex: `smtp.sendgrid.net`)
  - **SMTP Port**: `587`
  - **SMTP User**: (seu username)
  - **SMTP Password**: (sua senha/API key)
  - **Sender Email**: `noreply@4prosperaconnect.com` (ou seu domínio)
  - **Sender Name**: `4Prospera Connect`
- [ ] Clique em **Save**

### 5️⃣ Testar o Fluxo
- [ ] Acesse: `https://4prosperaconnect-e7osun5be-inosx.vercel.app/forgot-password`
- [ ] Digite um email válido cadastrado
- [ ] Clique em "Enviar Link de Recuperação"
- [ ] Verifique se recebeu o email (verifique também spam)
- [ ] Clique no link do email
- [ ] Verifique se redireciona para `/reset-password`
- [ ] Defina uma nova senha
- [ ] Teste fazer login com a nova senha

---

## 🔍 Verificação Rápida

### URLs Configuradas Corretamente?
Execute este teste:
1. Acesse o Supabase Dashboard
2. Vá em **Authentication** > **URL Configuration**
3. Verifique se:
   - ✅ Site URL está configurado (não é `localhost`)
   - ✅ Redirect URLs incluem `/auth/callback`
   - ✅ URLs de produção estão na lista

### Email Template Configurado?
1. Vá em **Authentication** > **Email Templates**
2. Clique em **Reset Password**
3. Verifique se:
   - ✅ Subject está personalizado
   - ✅ Body contém `{{ .ConfirmationURL }}`
   - ✅ Template foi salvo

### Email Provider Funcionando?
1. Vá em **Authentication** > **Providers**
2. Verifique se:
   - ✅ Email está habilitado
   - ✅ SMTP está configurado (se aplicável)
   - ✅ Credenciais estão corretas

---

## 🚨 Problemas Comuns

### ❌ Email não está sendo enviado
**Solução:**
1. Verifique se o email provider está configurado
2. Verifique os logs: **Logs** > **Auth Logs**
3. Se usar SMTP, teste as credenciais
4. Verifique a pasta de spam

### ❌ Link de recuperação não funciona
**Solução:**
1. Verifique se a URL está nas **Redirect URLs**
2. Verifique se o link no email está correto
3. Verifique se o token não expirou (1 hora)

### ❌ Redirecionamento para página errada
**Solução:**
1. Verifique se a URL em `ForgotPasswordForm.jsx` está correta
2. Verifique se `/reset-password` está no `App.jsx`
3. Verifique se `AuthCallback.jsx` lida com `type=recovery`

---

## 📞 Links Úteis

- **Dashboard Supabase**: https://app.supabase.com
- **Documentação Auth**: https://supabase.com/docs/guides/auth
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates
- **SMTP Config**: https://supabase.com/docs/guides/auth/auth-smtp

---

## ✅ Status Final

Após completar todos os passos:
- [ ] URLs configuradas
- [ ] Email template configurado
- [ ] Email provider configurado
- [ ] Teste de recuperação funcionando
- [ ] Teste de redefinição funcionando

**🎉 Pronto! O fluxo de recuperação de senha está configurado!**

