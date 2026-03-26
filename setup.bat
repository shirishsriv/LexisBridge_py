@echo off
echo Setting up LexisBridge Legal Assistant...

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install Node.js and npm first.
    pause
    exit /b
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit the .env file and add your GEMINI_API_KEY.
)

echo Setup complete! Run 'npm run dev' to start the application.
pause
