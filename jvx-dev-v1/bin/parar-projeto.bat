@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   JVX DESENVOLVIMENTO - PARAR PROJETO
echo ========================================
echo.

echo Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1

if errorlevel 1 (
    echo ⚠ Nenhum processo Node.js encontrado
) else (
    echo ✓ Processos Node.js finalizados
)

echo.
echo ========================================
echo   PROJETO PARADO COM SUCESSO!
echo ========================================
echo.
pause
