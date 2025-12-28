# Guia de Configuração: Recuperação de Senha no Supabase

Este guia explica como configurar o Supabase para que o fluxo de recuperação de senha funcione corretamente.

## 📋 Pré-requisitos

- Acesso ao Dashboard do Supabase
- Projeto 4Prospera Connect criado no Supabase
- URL de produção: `https://4prosperaconnect-e7osun5be-inosx.vercel.app`

---

## 🔧 Passo 1: Configurar URL de Redirecionamento

### 1.1 Acessar Configurações de Autenticação

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto **4Prospera Connect**
3. No menu lateral, clique em **Authentication**
4. Clique na aba **URL Configuration**

### 1.2 Adicionar URLs de Redirecionamento

Na seção **Redirect URLs**, adicione as seguintes URLs (uma por linha):

**URLs de Production:**
```
https://4prosperaconnect.vercel.app/**
https://4prosperaconnect.vercel.app/auth/callback
```

**URLs de Preview:**
```
https://4prosperaconnect-e7osun5be-inosx.vercel.app/**
https://4prosperaconnect-e7osun5be-inosx.vercel.app/auth/callback
```

**URLs com Wildcard (para futuros previews):**
```
https://4prosperaconnect-*.vercel.app/**
https://4prosperaconnect-*.vercel.app/auth/callback
```

**URLs de Desenvolvimento Local:**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

**Importante:**
- Adicione todas as URLs acima
- O `**` permite qualquer caminho após o domínio
- O `*` permite qualquer subdomínio de preview do Vercel
- Clique em **Save** após adicionar todas as URLs

### 1.3 Configurar Site URL

Na seção **Site URL**, defina a URL de **Production** (principal):

```
https://4prosperaconnect.vercel.app
```

**Nota:** O Supabase usará esta URL como base para gerar links de email. As URLs de preview também funcionarão porque estão nas Redirect URLs.

---

## 📧 Passo 2: Configurar Email Templates

### 2.1 Acessar Email Templates

1. No menu **Authentication**, clique na aba **Email Templates**
2. Você verá vários templates disponíveis

### 2.2 Configurar Template de Recuperação de Senha

1. Clique no template **Reset Password**
2. Você verá o editor de template com variáveis disponíveis

### 2.3 Template Recomendado para Reset Password

Substitua o conteúdo do template pelo seguinte:

**Subject:**
```
Redefinir sua senha - 4Prospera Connect
```

**Body (HTML):**
```html
<h2>Redefinir Senha</h2>
<p>Olá,</p>
<p>Recebemos uma solicitação para redefinir a senha da sua conta no 4Prospera Connect.</p>
<p>Clique no botão abaixo para redefinir sua senha:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Redefinir Senha
  </a>
</p>
<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p><strong>Este link expira em 1 hora.</strong></p>
<p>Se você não solicitou esta alteração, ignore este email.</p>
<p>---</p>
<p>Equipe 4Prospera Connect</p>
```

**Body (Text/Plain):**
```
Redefinir Senha

Olá,

Recebemos uma solicitação para redefinir a senha da sua conta no 4Prospera Connect.

Clique no link abaixo para redefinir sua senha:
{{ .ConfirmationURL }}

Este link expira em 1 hora.

Se você não solicitou esta alteração, ignore este email.

---
Equipe 4Prospera Connect
```

### 2.4 Salvar Template

1. Clique em **Save** após editar o template
2. O template será salvo automaticamente

---

## 📨 Passo 3: Configurar Email Provider

### Opção A: Usar Email Provider do Supabase (Recomendado para Desenvolvimento)

O Supabase oferece um serviço de email básico gratuito, mas com limitações:

1. No menu **Authentication**, clique na aba **Providers**
2. Role até a seção **Email**
3. O provider de email já está habilitado por padrão
4. **Limitação:** Emails podem ir para spam ou ter limitações de entrega

### Opção B: Configurar SMTP Customizado (Recomendado para Produção)

Para produção, é recomendado usar um serviço SMTP confiável:

#### 3.1 Escolher Provedor SMTP

Opções recomendadas:
- **SendGrid** (gratuito até 100 emails/dia)
- **Mailgun** (gratuito até 5.000 emails/mês)
- **Amazon SES** (muito barato)
- **Resend** (moderno, fácil de usar)

#### 3.2 Configurar SMTP no Supabase

1. No menu **Authentication**, clique na aba **Providers**
2. Role até a seção **Email**
3. Clique em **Configure SMTP settings**
4. Preencha os campos:

**Para SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [sua API key do SendGrid]
Sender Email: noreply@4prosperaconnect.com
Sender Name: 4Prospera Connect
```

**Para Resend:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [sua API key do Resend]
Sender Email: noreply@4prosperaconnect.com
Sender Name: 4Prospera Connect
```

**Para Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [seu username do Mailgun]
SMTP Password: [sua senha do Mailgun]
Sender Email: noreply@4prosperaconnect.com
Sender Name: 4Prospera Connect
```

5. Clique em **Save**

---

## ✅ Passo 4: Verificar Configurações

### 4.1 Checklist de Verificação

- [ ] URLs de redirecionamento configuradas
- [ ] Site URL configurado
- [ ] Template de email de recuperação de senha configurado
- [ ] Email provider configurado (SMTP ou Supabase)
- [ ] Testar envio de email de recuperação

### 4.2 Testar o Fluxo

1. Acesse: `https://4prosperaconnect-e7osun5be-inosx.vercel.app/forgot-password`
2. Digite um email válido cadastrado
3. Clique em "Enviar Link de Recuperação"
4. Verifique se o email foi recebido (verifique também a pasta de spam)
5. Clique no link do email
6. Verifique se redireciona para `/reset-password`
7. Defina uma nova senha
8. Verifique se consegue fazer login com a nova senha

---

## 🔍 Troubleshooting

### Problema: Email não está sendo enviado

**Soluções:**
1. Verifique se o email provider está configurado corretamente
2. Verifique os logs no Supabase Dashboard > Logs > Auth Logs
3. Se usar SMTP, verifique se as credenciais estão corretas
4. Verifique se o email não está na pasta de spam

### Problema: Link de recuperação não funciona

**Soluções:**
1. Verifique se a URL de redirecionamento está configurada corretamente
2. Verifique se o link no email contém a URL correta
3. Verifique se o token não expirou (tokens expiram em 1 hora por padrão)

### Problema: Redirecionamento para página errada

**Soluções:**
1. Verifique se a URL em `ForgotPasswordForm.jsx` está correta:
   ```javascript
   const redirectUrl = `${window.location.origin}/auth/callback?type=recovery`
   ```
2. Verifique se o `AuthCallback.jsx` está lidando com `type=recovery`
3. Verifique se a rota `/reset-password` está configurada no `App.jsx`

### Problema: Sessão expirada ao redefinir senha

**Soluções:**
1. O link de recuperação expira em 1 hora
2. Solicite um novo link de recuperação
3. Verifique se o usuário está clicando no link dentro do prazo

---

## 📝 Configurações Adicionais Recomendadas

### Configurar Rate Limiting

1. No menu **Authentication** > **Policies**
2. Configure rate limiting para prevenir abuso:
   - Máximo de 3 tentativas de recuperação por hora por IP
   - Máximo de 5 tentativas de recuperação por dia por email

### Configurar Expiração de Token

1. No menu **Authentication** > **Settings**
2. Configure **JWT expiry** para 3600 segundos (1 hora)
3. Configure **Refresh token expiry** conforme necessário

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca exponha credenciais SMTP** no código frontend
2. **Use variáveis de ambiente** para configurações sensíveis
3. **Configure rate limiting** para prevenir abuso
4. **Monitore logs** de autenticação regularmente
5. **Use HTTPS** em produção (já configurado no Vercel)

---

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Verifique o console do navegador para erros
3. Verifique a documentação do Supabase
4. Entre em contato com o suporte do Supabase se necessário

---

**Última atualização:** Dezembro 2024

