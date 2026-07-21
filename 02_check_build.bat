@echo off
chcp 65001 > nul
cd /d "%~dp0"
if not exist node_modules (
  echo Packages are not installed. Run 00_install_and_start.bat first.
  pause
  exit /b 1
)
call npm run lint
if errorlevel 1 (
  echo Lint check failed.
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)
echo Lint and build completed successfully.
pause
