@echo off
echo Enter your DATABASE_PUBLIC_URL from Railway Postgres Variables:
set /p DATABASE_URL=

echo.
echo Running migration with provided database URL...
npx prisma migrate deploy

echo.
echo Migration complete! Check Railway Postgres Data tab for tables.
pause