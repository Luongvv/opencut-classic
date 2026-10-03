@echo off

setlocal

title OpenCut Classic Video Editor

cd /d "%~dp0"



set "PATH=%~dp0node_modules\.bin;%USERPROFILE%\.proto\shims;%USERPROFILE%\.proto\bin;%PATH%"



echo ========================================

echo    OpenCut Classic Video Editor

echo    Dang khoi dong server...

echo    Trinh duyet se tu dong mo sau 8 giay.

echo    (De tat ung dung: dong cua so nay hoac an Ctrl+C)

echo ========================================

echo.



start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000"



cd /d "%~dp0apps\web"

node "%~dp0node_modules\next\dist\bin\next" dev --webpack



if errorlevel 1 (

    echo.

    echo [ERROR] Server da dung hoac gap loi.

    pause

)