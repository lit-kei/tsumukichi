@echo off

git checkout main
git add .
git commit -m "update"
git push origin main

echo The process has finished..
pause