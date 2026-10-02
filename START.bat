@echo off
chcp 65001 >nul 2>&1
title OpenCut Classic - Starting...

:: ─── Set up environment paths ───
set "PATH=%~dp0node_modules\.bin;%USERPROFILE%\.proto\shims;%USERPROFILE%\.proto\bin;%PATH%"

echo.
echo   ╔══════════════════════════════════════════╗
echo   ║       🎬  OpenCut Classic Editor         ║
echo   ║                                          ║
echo   ║   Starting dev server...                 ║
echo   ║   Browser will open automatically.       ║
echo   ║                                          ║
echo   ║   Press Ctrl+C to stop the server.       ║
echo   ╚══════════════════════════════════════════╝
echo.

:: ─── Open browser after a short delay ───
start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000"

:: ─── Start the dev server ───
cd /d "%~dp0apps\web"
next dev