@echo off
echo ========================================
echo   Starting PixelBeats Music Player
echo ========================================
echo Opening in Chrome / Default Browser...
start "" "http://localhost:8000"
echo Starting Backend API Server on http://localhost:8000 ...
python backend/main.py
pause

