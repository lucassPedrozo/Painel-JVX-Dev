@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   JVX DESENVOLVIMENTO - INICIAR PROJETO
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/5] Verificando dependências...
if not exist "node_modules\" (
    echo Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependências já instaladas
)

echo.
echo [3/5] Verificando arquivo .env...
if not exist ".env" (
    echo ⚠ Arquivo .env não encontrado!
    echo Copiando .env.example para .env...
    copy .env.example .env >nul
    echo.
    echo ⚠ IMPORTANTE: Configure o arquivo .env com suas credenciais!
    echo.
    pause
)
echo ✓ Arquivo .env encontrado

echo.
echo [4/5] Testando conexão com banco de dados...
call npm run test-db
if errorlevel 1 (
    echo.
    echo ❌ Erro na conexão com o banco!
    echo.
    echo Verifique:
    echo   1. O XAMPP está aberto?
    echo   2. O MySQL está rodando?
    echo   3. O banco 'worksdb' existe?
    echo   4. As credenciais no .env estão corretas?
    echo.
    pause
    exit /b 1
)

echo.
echo [5/5] Iniciando servidores...
echo.
echo ✓ Backend: http://localhost:3001
echo ✓ Frontend: http://localhost:5173
echo.
echo Login: jvxadmin / admin123
echo.
echo ========================================
echo   SERVIDORES INICIADOS COM SUCESSO!
echo ========================================
echo.
echo Pressione Ctrl+C para parar os servidores
echo.

start "JVX Backend" cmd /k "cd /d %~dp0.. && npm run server"
timeout /t 3 >nul
start "JVX Frontend" cmd /k "cd /d %~dp0.. && npm run dev"

echo.
echo Aguarde alguns segundos e acesse:
echo http://localhost:5173
echo.
pause
