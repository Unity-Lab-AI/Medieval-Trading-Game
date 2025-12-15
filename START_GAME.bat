@echo off
chcp 65001 >nul 2>nul
title Medieval Trading Game - AI Voice Server
color 0A
cls

echo.
echo    ================================================================
echo   ^|                                                                ^|
echo   ^|       MEDIEVAL TRADING GAME - AI VOICE EDITION                 ^|
echo   ^|                                                                ^|
echo   ^|                      Unity AI Lab                              ^|
echo   ^|         www.unityailab.com - unityailabcontact@gmail.com       ^|
echo   ^|                                                                ^|
echo    ================================================================
echo.
echo    [*] Checking for server software...
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Python found!
    echo.
    echo    ================================================================
    echo    ^|  GAME SERVER STARTING                                        ^|
    echo    ^|                                                               ^|
    echo    ^|  URL:  http://localhost:8000                                  ^|
    echo    ^|                                                               ^|
    echo    ^|  Press Ctrl+C to stop the server when done playing           ^|
    echo    ================================================================
    echo.
    echo    [*] Opening browser in 2 seconds...
    echo.

    :: Open browser after a short delay
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

    :: Start Python server (suppress verbose output)
    python -m http.server 8000 2>nul
    goto :end
)

:: Check if Python3 is installed (some systems)
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Python3 found!
    echo.
    echo    ================================================================
    echo    ^|  GAME SERVER STARTING                                        ^|
    echo    ^|                                                               ^|
    echo    ^|  URL:  http://localhost:8000                                  ^|
    echo    ^|                                                               ^|
    echo    ^|  Press Ctrl+C to stop the server when done playing           ^|
    echo    ================================================================
    echo.
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"
    python3 -m http.server 8000 2>nul
    goto :end
)

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Node.js found!
    echo.
    echo    ================================================================
    echo    ^|  GAME SERVER STARTING                                        ^|
    echo    ^|                                                               ^|
    echo    ^|  URL:  http://localhost:3000                                  ^|
    echo    ^|                                                               ^|
    echo    ^|  Press Ctrl+C to stop the server when done playing           ^|
    echo    ================================================================
    echo.

    start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
    npx serve -l 3000 --no-clipboard 2>nul
    goto :end
)

:: No server found - fall back to file://
echo    [!] WARNING: No Python or Node.js found!
echo.
echo    ================================================================
echo    ^|  AI VOICES DISABLED                                           ^|
echo    ^|                                                                ^|
echo    ^|  To enable AI voices, install Python:                         ^|
echo    ^|  https://www.python.org/downloads/                            ^|
echo    ^|                                                                ^|
echo    ^|  Opening game without AI voice support...                     ^|
echo    ================================================================
echo.
start "" index.html
timeout /t 5

:end
