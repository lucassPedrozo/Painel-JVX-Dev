@echo off
echo ========================================
echo JVX DESENVOLVIMENTO - INICIALIZADOR SIMPLES
echo ========================================
echo.

REM Ir para o diretorio do script
cd /d "%~dp0"

echo Diretorio: %CD%
echo.

REM Verificar Node.js
echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)
echo OK!
echo.

REM Verificar node_modules
echo Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO ao instalar!
        pause
        exit /b 1
    )
)
echo OK!
echo.

REM Verificar .env
echo Verificando .env...
if not exist ".env" (
    echo Criando .env...
    copy .env.example .env
)
echo OK!
echo.

echo ========================================
echo INICIANDO SERVIDORES
echo ========================================
echo.
echo Abrindo 2 janelas...
echo - Backend (porta 3001)
echo - Frontend (porta 5173)
echo.

REM Iniciar backend
start "Backend" cmd /k "cd /d "%~dp0" && node server.js"
timeout /t 2 /nobreak >nul

REM Iniciar frontend
start "Frontend" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo PRONTO!
echo ========================================
echo.
echo Acesse: http://localhost:5173
echo Login: jvxadmin / admin123
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
