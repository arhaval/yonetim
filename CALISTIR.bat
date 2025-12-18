@echo off
echo ========================================
echo Instagram Istatistik Scripti
echo ========================================
echo.

REM Python'un yuklu olup olmadigini kontrol et
python --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python yuklu degil!
    echo Lutfen Python'u yukleyin: https://www.python.org/downloads/
    echo Kurulum sirasinda "Add Python to PATH" secenegini isaretleyin.
    pause
    exit /b 1
)

echo Python bulundu!
echo.

REM Gerekli paketleri yukle
echo Gerekli paketler yukleniyor...
python -m pip install --upgrade pip
python -m pip install instagrapi python-dotenv

echo.
echo ========================================
echo Script calistiriliyor...
echo ========================================
echo.

REM Scripti calistir
python instagram_stats.py

echo.
echo ========================================
pause

