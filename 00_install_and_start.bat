@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================
echo Chemica setup and start
echo ========================================
where node > nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 20.9 or later, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing packages...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo Starting development server...
echo Open http://localhost:3000 in your browser.
call npm run dev
pause
