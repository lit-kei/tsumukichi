@echo off

git checkout local
git add .
git commit -m "local commit"
git push origin local

echo The process has finished..
pause