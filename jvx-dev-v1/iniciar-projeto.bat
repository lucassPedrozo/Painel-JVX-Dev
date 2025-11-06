@echo off
chcp 65001 >nul
cls

echo ═══════════════════════════════════════════════════════════
echo    JVX DESENVOLVIMENTO - INICIALIZADOR XAMPP
echo ═══════════════════════════════════════════════════════════
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado!
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
    echo 📦 Instalando dependências...
    echo    Isso pode levar alguns minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependências instaladas!
    echo.
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado!
    echo 📝 Criando .env com configurações padrão XAMPP...
    copy .env.example .env >nul
    echo ✅ Arquivo .env criado!
    echo.
)

echo ═══════════════════════════════════════════════════════════
echo    TESTANDO CONEXÃO COM MYSQL (XAMPP)
echo ═══════════════════════════════════════════════════════════
echo.

REM Testar conexão com banco
call npm run test-db
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo ❌ ERRO NA CONEXÃO COM O BANCO DE DADOS!
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo 📝 Verifique:
    echo    1. XAMPP Control Panel está aberto?
    echo    2. MySQL está rodando (verde)?
    echo    3. Banco 'worksdb' foi criado?
    echo.
    echo 💡 Para criar o banco:
    echo    1. Acesse: http://localhost/phpmyadmin
    echo    2. Clique na aba SQL
    echo    3. Cole o conteúdo de: database/database-init-clean.sql
    echo    4. Clique em Executar
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════
echo    INICIANDO SERVIDORES
echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 Backend será iniciado na porta 3001
echo 🚀 Frontend será iniciado na porta 5173
echo.
echo ⚠️  Mantenha esta janela aberta!
echo ⚠️  Para parar: Pressione Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Iniciar backend e frontend simultaneamente
start "JVX Backend" cmd /k "echo 🔧 BACKEND (Express) && echo. && npm run server"
timeout /t 3 /nobreak >nul
start "JVX Frontend" cmd /k "echo 🎨 FRONTEND (Vite) && echo. && npm run dev"

echo.
echo ✅ Servidores iniciados!
echo.
echo 📝 Acesse o sistema:
echo    URL: http://localhost:5173
echo    Usuário: jvxadmin
echo    Senha: admin123
echo.
echo 💡 Duas novas janelas foram abertas:
echo    - Backend (porta 3001)
echo    - Frontend (porta 5173)
echo.
echo ⚠️  Não feche essas janelas!
echo.
pause
