@echo off
echo ========================================
echo   Deploy 4Prospera Connect
echo ========================================
echo.

REM Verificar se está na branch develop
echo [1/6] Verificando branch atual...
git branch --show-current | findstr /C:"develop" >nul
if errorlevel 1 (
    echo.
    echo [ERRO] Você precisa estar na branch develop!
    echo Branch atual:
    git branch --show-current
    echo.
    pause
    exit /b 1
)

echo [OK] Branch develop detectada
echo.

REM Verificar se há mudanças não commitadas
echo [2/6] Verificando mudanças não commitadas...
git diff --quiet
if errorlevel 1 (
    echo.
    echo [AVISO] Há mudanças não commitadas!
    echo Deseja continuar mesmo assim? (S/N)
    set /p continue=
    if /i not "%continue%"=="S" (
        echo Deploy cancelado.
        pause
        exit /b 1
    )
)

echo [OK] Nenhuma mudança pendente
echo.

REM Fazer push de develop
echo [3/6] Fazendo push de develop...
git push origin develop
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao fazer push de develop!
    pause
    exit /b 1
)

echo [OK] Push de develop concluído
echo.

REM Mudar para main
echo [4/6] Mudando para branch main...
git checkout main
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao mudar para branch main!
    pause
    exit /b 1
)

REM Atualizar main
echo [5/6] Atualizando main...
git pull origin main
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao atualizar main!
    pause
    exit /b 1
)

REM Fazer merge de develop
echo [6/6] Fazendo merge de develop em main...
git merge develop
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao fazer merge! Resolva os conflitos manualmente.
    pause
    exit /b 1
)

REM Push para main (dispara deploy)
echo.
echo [DEPLOY] Fazendo push para main (dispara deploy no Vercel)...
git push origin main
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao fazer push para main!
    pause
    exit /b 1
)

REM Voltar para develop
echo.
echo [FINALIZANDO] Voltando para develop...
git checkout develop

echo.
echo ========================================
echo   Deploy concluído com sucesso!
echo ========================================
echo.
echo Próximos passos:
echo 1. Verifique o Vercel Dashboard: https://vercel.com
echo 2. Aguarde o deploy completar
echo 3. Teste em produção: https://4prosperaconnect.vercel.app
echo.
pause

