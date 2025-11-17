@echo off
chcp 65001 >nul 2>&1
cls

echo ========================================
echo JVX DESENVOLVIMENTO - INICIALIZADOR
echo ========================================
echo.

REM Navegar para o diretório do projeto
cd /d "%~dp0"

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js nao encontrado!
    echo.
    echo 📝 Instale o Node.js primeiro:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules\" (
    echo Instalando dependencias...
    echo Isso pode levar alguns minutos...
    echo.
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
    echo Dependencias instaladas!
    echo.
) else (
    echo Dependencias OK
    echo.
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo Arquivo .env nao encontrado!
    echo Criando .env...
    copy .env.example .env >nul 2>&1
    echo .env criado!
    echo.
)

echo.
echo ========================================
echo INICIANDO SERVIDORES
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Abrindo 2 janelas...
echo NAO FECHE as janelas do servidor!
echo.

REM Iniciar backend
start "JVX Backend" cmd /k "cd /d "%~dp0" && echo BACKEND (Express.js) && echo. && node server.js"
timeout /t 2 /nobreak >nul 2>&1

REM Iniciar frontend
start "JVX Frontend" cmd /k "cd /d "%~dp0" && echo FRONTEND (Vite + React) && echo. && npm run dev"
timeout /t 2 /nobreak >nul 2>&1

echo.
echo ========================================
echo PRONTO!
echo ========================================
echo.
echo Acesse: http://localhost:5173
echo.
echo Usuario Master:
echo   Login: jvxadmin
echo   Senha: admin123
echo.
echo Usuario Desenvolvedor:
echo   Login: leandro.dev
echo   Senha: dev123
echo.
echo ========================================
echo.
pause
