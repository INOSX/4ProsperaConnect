#!/bin/bash

echo "========================================"
echo "  Deploy 4Prospera Connect"
echo "========================================"
echo ""

# Verificar se está na branch develop
echo "[1/6] Verificando branch atual..."
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
    echo ""
    echo "[ERRO] Você precisa estar na branch develop!"
    echo "Branch atual: $current_branch"
    echo ""
    exit 1
fi

echo "[OK] Branch develop detectada"
echo ""

# Verificar se há mudanças não commitadas
echo "[2/6] Verificando mudanças não commitadas..."
if ! git diff --quiet; then
    echo ""
    echo "[AVISO] Há mudanças não commitadas!"
    read -p "Deseja continuar mesmo assim? (S/N): " continue
    if [ "$continue" != "S" ] && [ "$continue" != "s" ]; then
        echo "Deploy cancelado."
        exit 1
    fi
fi

echo "[OK] Nenhuma mudança pendente"
echo ""

# Fazer push de develop
echo "[3/6] Fazendo push de develop..."
if ! git push origin develop; then
    echo ""
    echo "[ERRO] Falha ao fazer push de develop!"
    exit 1
fi

echo "[OK] Push de develop concluído"
echo ""

# Mudar para main
echo "[4/6] Mudando para branch main..."
if ! git checkout main; then
    echo ""
    echo "[ERRO] Falha ao mudar para branch main!"
    exit 1
fi

# Atualizar main
echo "[5/6] Atualizando main..."
if ! git pull origin main; then
    echo ""
    echo "[ERRO] Falha ao atualizar main!"
    exit 1
fi

# Fazer merge de develop
echo "[6/6] Fazendo merge de develop em main..."
if ! git merge develop; then
    echo ""
    echo "[ERRO] Falha ao fazer merge! Resolva os conflitos manualmente."
    exit 1
fi

# Push para main (dispara deploy)
echo ""
echo "[DEPLOY] Fazendo push para main (dispara deploy no Vercel)..."
if ! git push origin main; then
    echo ""
    echo "[ERRO] Falha ao fazer push para main!"
    exit 1
fi

# Voltar para develop
echo ""
echo "[FINALIZANDO] Voltando para develop..."
git checkout develop

echo ""
echo "========================================"
echo "  Deploy concluído com sucesso!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "1. Verifique o Vercel Dashboard: https://vercel.com"
echo "2. Aguarde o deploy completar"
echo "3. Teste em produção: https://4prosperaconnect.vercel.app"
echo ""

