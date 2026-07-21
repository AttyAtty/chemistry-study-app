@echo off
chcp 65001 > nul
cd /d "%~dp0"
if not exist node_modules (
  echo Packages are not installed. Run 00_install_and_start.bat first.
  pause
  exit /b 1
)
echo Open http://localhost:3000 in your browser.
call npm run dev
pause
