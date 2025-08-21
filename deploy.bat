@echo off
echo Deploying to both GitHub repositories...
echo.

echo Pushing to raihaan123/BerseMuka (Netlify frontend)...
git push origin main

echo.
echo Pushing to zaydmahdaly00/BerseMuka (Railway backend)...
git push railway main

echo.
echo ✅ Deployment complete!
echo Frontend will deploy to berse.app via Netlify
echo Backend will deploy to api.berse.app via Railway
echo.
pause