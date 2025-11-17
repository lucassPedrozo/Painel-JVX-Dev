@echo off
echo ========================================
echo DIAGNOSTICO DO SISTEMA
echo ========================================
echo.

REM Ir para o diretorio
cd /d "%~dp0"

echo 1. DIRETORIO ATUAL
echo -------------------
echo %CD%
echo.

echo 2. NODE.JS
echo ----------
where node
node --version
echo.

echo 3. NPM
echo ------
where npm
npm --version
echo.

echo 4. ARQUIVOS IMPORTANTES
echo -----------------------
if exist "package.json" (echo [OK] package.json) else (echo [FALTA] package.json)
if exist "server.js" (echo [OK] server.js) else (echo [FALTA] server.js)
if exist ".env" (echo [OK] .env) else (echo [FALTA] .env)
if exist ".env.example" (echo [OK] .env.example) else (echo [FALTA] .env.example)
if exist "node_modules\" (echo [OK] node_modules) else (echo [FALTA] node_modules)
echo.

echo 5. SCRIPTS
echo ----------
if exist "scripts\testar-conexao-db.js" (echo [OK] testar-conexao-db.js) else (echo [FALTA] testar-conexao-db.js)
echo.

echo 6. PORTAS EM USO
echo ----------------
echo Verificando porta 3001...
netstat -ano | findstr :3001
if errorlevel 1 (echo Porta 3001: LIVRE) else (echo Porta 3001: EM USO)
echo.
echo Verificando porta 5173...
netstat -ano | findstr :5173
if errorlevel 1 (echo Porta 5173: LIVRE) else (echo Porta 5173: EM USO)
echo.

echo 7. PROCESSOS NODE
echo -----------------
tasklist | findstr node.exe
if errorlevel 1 (echo Nenhum processo Node rodando) else (echo Processos Node encontrados acima)
echo.

echo 8. TESTE DE CONEXAO COM BANCO
echo ------------------------------
node scripts\testar-conexao-db.js
echo.

echo ========================================
echo DIAGNOSTICO COMPLETO
echo ========================================
echo.
pause
