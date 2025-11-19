@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   JVX DESENVOLVIMENTO - DIAGNÓSTICO
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/6] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
) else (
    echo ✓ Node.js instalado
)

echo.
echo [2/6] Verificando npm...
npm --version
if errorlevel 1 (
    echo ❌ npm não encontrado!
) else (
    echo ✓ npm instalado
)

echo.
echo [3/6] Verificando dependências...
if exist "node_modules\" (
    echo ✓ node_modules existe
) else (
    echo ❌ node_modules não encontrado - Execute: npm install
)

echo.
echo [4/6] Verificando arquivo .env...
if exist ".env" (
    echo ✓ Arquivo .env existe
) else (
    echo ❌ Arquivo .env não encontrado - Copie .env.example para .env
)

echo.
echo [5/6] Verificando estrutura de pastas...
if exist "src\" (echo ✓ src/) else (echo ❌ src/)
if exist "database\" (echo ✓ database/) else (echo ❌ database/)
if exist "scripts\" (echo ✓ scripts/) else (echo ❌ scripts/)
if exist "docs\" (echo ✓ docs/) else (echo ❌ docs/)

echo.
echo [6/6] Testando conexão com banco de dados...
call npm run test-db

echo.
echo ========================================
echo   DIAGNÓSTICO CONCLUÍDO
echo ========================================
echo.
pause
