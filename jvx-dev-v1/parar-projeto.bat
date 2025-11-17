@echo off
chcp 65001 >nul
cls

echo ═══════════════════════════════════════════════════════════
echo    JVX DESENVOLVIMENTO - PARAR SERVIDORES
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 Parando servidores Node.js...
echo.

REM Matar processos Node.js
taskkill /F /IM node.exe >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Servidores parados com sucesso!
) else (
    echo ⚠️  Nenhum servidor Node.js em execucao
)

echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
