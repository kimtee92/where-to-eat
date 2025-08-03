@echo off
:: GitHub Secrets Setup Helper
:: Run: setup-github-secrets.bat

echo.
echo 🔐 GitHub Secrets Setup Helper
echo.
echo This script will help you prepare the values needed for GitHub Secrets.
echo You'll need to manually add these to your GitHub repository.
echo.

echo 📋 Required GitHub Secrets:
echo.

:: Get Heroku API key
echo 1. HEROKU_API_KEY
echo    Get this by running: heroku auth:token
echo    Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
echo.

:: Get app name
set /p HEROKU_APP_NAME="2. Enter your Heroku app name: "
echo    HEROKU_APP_NAME: %HEROKU_APP_NAME%
echo.

:: Get email
set /p HEROKU_EMAIL="3. Enter your Heroku email: "
echo    HEROKU_EMAIL: %HEROKU_EMAIL%
echo.

:: MongoDB URI
echo 4. MONGODB_URI
echo    mongodb+srv://what-to-eat:0VUbXuLcETKw7owt@cluster0.gscqso1.mongodb.net/where-to-eat?retryWrites=true&w=majority
echo.

:: API Keys
set /p CLAUDE_KEY="5. Enter your Claude API Key: "
echo    CLAUDE_API_KEY: %CLAUDE_KEY%
echo.

set /p GOOGLE_KEY="6. Enter your Google Places API Key: "
echo    GOOGLE_PLACES_API_KEY: %GOOGLE_KEY%
echo.

echo.
echo 📝 Summary of secrets to add to GitHub:
echo.
echo Repository: https://github.com/kimtee92/where-to-eat/settings/secrets/actions
echo.
echo HEROKU_API_KEY = [Run: heroku auth:token]
echo HEROKU_APP_NAME = %HEROKU_APP_NAME%
echo HEROKU_EMAIL = %HEROKU_EMAIL%
echo MONGODB_URI = mongodb+srv://what-to-eat:0VUbXuLcETKw7owt@cluster0.gscqso1.mongodb.net/where-to-eat?retryWrites=true&w=majority
echo CLAUDE_API_KEY = %CLAUDE_KEY%
echo GOOGLE_PLACES_API_KEY = %GOOGLE_KEY%
echo.

echo 🚀 Next Steps:
echo 1. Go to: https://github.com/kimtee92/where-to-eat/settings/secrets/actions
echo 2. Click "New repository secret" for each secret above
echo 3. Create your Heroku app: heroku create %HEROKU_APP_NAME%
echo 4. Push to main branch to trigger deployment!
echo.

pause
