# 📧 Como Desativar a Verificação de Email no Supabase

## 📋 Passo a Passo

### 1. Acesse o Painel do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **4prosperaconnect** (ou o projeto correto)

### 2. Vá para Authentication Settings

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Settings"** (ou "Configurações")
3. Você verá várias opções de configuração de autenticação

### 3. Desative a Verificação de Email

1. Procure pela seção **"Email Auth"** ou **"Email Authentication"**
2. Encontre a opção **"Enable email confirmations"** ou **"Confirm email"**
3. **Desmarque** essa opção (toggle OFF)
4. Clique em **"Save"** ou **"Salvar"**

### 4. Configurações Adicionais (Opcional)

Você também pode ajustar:

- **"Enable email signup"**: Deixe ativado para permitir cadastro por email
- **"Enable email login"**: Deixe ativado para permitir login por email
- **"Secure email change"**: Pode deixar como está

### 5. Salvar e Testar

1. Após desativar, clique em **"Save"**
2. Teste criando uma nova conta
3. O usuário deve poder fazer login imediatamente sem precisar confirmar o email

---

## ⚠️ Importante

### Segurança

- **Desativar a verificação de email reduz a segurança** da aplicação
- Usuários podem se cadastrar com emails inválidos ou de outras pessoas
- Recomenda-se manter ativado em produção para maior segurança

### Alternativa: Modo de Desenvolvimento

Se você está em desenvolvimento/testes, pode:
1. Desativar temporariamente para facilitar testes
2. Reativar antes de ir para produção
3. Ou usar emails de teste que não precisam de confirmação

---

## 🔄 Como Reativar (se necessário)

1. Siga os mesmos passos acima
2. **Marque** a opção **"Enable email confirmations"** (toggle ON)
3. Clique em **"Save"**

---

## 📝 Nota sobre o Código

O código atual já está preparado para funcionar com ou sem verificação de email:
- Se a verificação estiver ativada: usuário precisa confirmar email antes de fazer login
- Se a verificação estiver desativada: usuário pode fazer login imediatamente após o registro

---

## 🎯 URL Direta

Você pode acessar diretamente:
```
https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/auth/settings
```

Substitua `dytuwutsjjxxmyefrfed` pelo ID do seu projeto se necessário.

---

**Última atualização**: 17/12/2025

