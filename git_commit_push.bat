@echo off
cd /d C:\Users\jgustavo\Desktop\botellas
git add -A
git commit -m "chore: point backend to jg-server via dotenv; add docs"
git push
exit /b %errorlevel%
