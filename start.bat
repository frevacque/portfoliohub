@echo off
REM Script de lancement PortfolioHub (Windows)
REM Usage: Double-cliquer sur start.bat

echo.
echo ========================================
echo   PORTFOLIOHUB - Demarrage
echo ========================================
echo.

REM Vérifier MongoDB
echo Verification de MongoDB...
sc query MongoDB | find "RUNNING" > nul
if %errorlevel% neq 0 (
    echo MongoDB n'est pas en cours d'execution
    echo Demarrage de MongoDB...
    net start MongoDB
    timeout /t 3 > nul
)
echo [OK] MongoDB actif
echo.

REM Démarrer le backend
echo Demarrage du backend...
start "PortfolioHub Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo [OK] Backend lance (port 8001)
timeout /t 5 > nul
echo.

REM Démarrer le frontend
echo Demarrage du frontend...
start "PortfolioHub Frontend" cmd /k "cd /d %~dp0frontend && npm start"
echo [OK] Frontend lance (port 3000)
echo.

echo ========================================
echo   Application lancee avec succes!
echo ========================================
echo.
echo   Acces: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
echo (Les fenetres Backend et Frontend resteront ouvertes)
pause > nul
