# 🚀 Processo de Deploy - 4Prospera Connect

Este documento descreve o processo correto para fazer deploy das mudanças para produção.

## 📋 Fluxo de Trabalho

### 1. Desenvolvimento (Branch: `develop`)
- Todas as mudanças são feitas na branch `develop`
- Commits e pushes são feitos para `develop`
- Testes e validações são feitos nesta branch

### 2. Deploy para Produção (Branch: `main`)
- Após validar em `develop`, fazer merge para `main`
- O merge para `main` automaticamente atualiza o ambiente de produção
- O Vercel detecta mudanças em `main` e faz deploy automático

---

## 🔄 Processo Passo a Passo

### Passo 1: Desenvolvimento em `develop`

```bash
# Certifique-se de estar na branch develop
git checkout develop

# Faça suas mudanças e commits
git add .
git commit -m "feat: descrição da mudança"
git push origin develop
```

### Passo 2: Merge para `main`

```bash
# Mude para a branch main
git checkout main

# Atualize a branch main
git pull origin main

# Faça merge da develop
git merge develop

# Push para main (isso dispara o deploy)
git push origin main
```

### Passo 3: Verificar Deploy

1. Acesse o [Vercel Dashboard](https://vercel.com)
2. Verifique se o deploy foi iniciado automaticamente
3. Aguarde o deploy completar
4. Teste em produção: `https://4prosperaconnect.vercel.app`

---

## ⚠️ Importante

### ✅ Sempre fazer:
- [ ] Commits e pushes em `develop` primeiro
- [ ] Testar mudanças em `develop` antes de merge
- [ ] Merge para `main` apenas quando estiver pronto para produção
- [ ] Verificar se o deploy foi bem-sucedido no Vercel

### ❌ Nunca fazer:
- [ ] Commits diretos em `main` (exceto hotfixes críticos)
- [ ] Merge para `main` sem testar em `develop`
- [ ] Push para `main` sem fazer merge de `develop`

---

## 🔧 Scripts Úteis

### Script de Deploy Rápido

Crie um arquivo `deploy.sh` (ou `deploy.bat` no Windows) para automatizar:

**Linux/Mac (`deploy.sh`):**
```bash
#!/bin/bash

echo "🚀 Iniciando processo de deploy..."

# Verificar se está na branch develop
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
    echo "❌ Erro: Você precisa estar na branch develop"
    exit 1
fi

# Fazer push de develop
echo "📤 Fazendo push de develop..."
git push origin develop

# Mudar para main
echo "🔄 Mudando para branch main..."
git checkout main

# Atualizar main
echo "⬇️ Atualizando main..."
git pull origin main

# Fazer merge de develop
echo "🔀 Fazendo merge de develop em main..."
git merge develop

# Push para main (dispara deploy)
echo "🚀 Fazendo push para main (dispara deploy)..."
git push origin main

# Voltar para develop
echo "🔙 Voltando para develop..."
git checkout develop

echo "✅ Deploy concluído! Verifique o Vercel Dashboard."
```

**Windows (`deploy.bat`):**
```batch
@echo off
echo 🚀 Iniciando processo de deploy...

REM Verificar se está na branch develop
git branch --show-current | findstr /C:"develop" >nul
if errorlevel 1 (
    echo ❌ Erro: Você precisa estar na branch develop
    exit /b 1
)

REM Fazer push de develop
echo 📤 Fazendo push de develop...
git push origin develop

REM Mudar para main
echo 🔄 Mudando para branch main...
git checkout main

REM Atualizar main
echo ⬇️ Atualizando main...
git pull origin main

REM Fazer merge de develop
echo 🔀 Fazendo merge de develop em main...
git merge develop

REM Push para main (dispara deploy)
echo 🚀 Fazendo push para main (dispara deploy)...
git push origin main

REM Voltar para develop
echo 🔙 Voltando para develop...
git checkout develop

echo ✅ Deploy concluído! Verifique o Vercel Dashboard.
```

---

## 📝 Checklist de Deploy

Antes de fazer merge para `main`:

- [ ] Todas as mudanças foram commitadas em `develop`
- [ ] Push foi feito para `develop`
- [ ] Testes foram realizados em `develop`
- [ ] Código foi revisado
- [ ] Documentação foi atualizada (se necessário)
- [ ] Variáveis de ambiente estão configuradas no Vercel
- [ ] Pronto para produção

Após merge para `main`:

- [ ] Merge foi feito com sucesso
- [ ] Push para `main` foi realizado
- [ ] Deploy no Vercel foi iniciado
- [ ] Deploy foi concluído com sucesso
- [ ] Teste em produção foi realizado
- [ ] Tudo está funcionando corretamente

---

## 🐛 Hotfixes (Correções Urgentes)

Para correções urgentes que precisam ir direto para produção:

```bash
# Criar branch de hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-fix

# Fazer correções
# ... fazer mudanças ...

# Commit e push
git add .
git commit -m "fix: descrição do hotfix"
git push origin hotfix/nome-do-fix

# Merge para main
git checkout main
git merge hotfix/nome-do-fix
git push origin main

# Merge de volta para develop
git checkout develop
git merge hotfix/nome-do-fix
git push origin develop

# Deletar branch de hotfix
git branch -d hotfix/nome-do-fix
git push origin --delete hotfix/nome-do-fix
```

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com
- **GitHub Repository**: https://github.com/INOSX/4ProsperaConnect
- **Produção**: https://4prosperaconnect.vercel.app

---

## 📚 Convenções de Commit

Use mensagens de commit descritivas:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, ponto e vírgula, etc.
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Tarefas de manutenção

Exemplo:
```bash
git commit -m "feat: adicionar página de recuperação de senha"
git commit -m "fix: corrigir erro de validação no formulário"
git commit -m "docs: atualizar guia de configuração do Supabase"
```

---

**Última atualização:** Dezembro 2024

