@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13; irm https://hanzo.sh/install.ps1 | iex"
exit /b %ERRORLEVEL%
