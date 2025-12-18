@echo off
echo ========================================
echo Hizli Cozum - Paket Yukleme
echo ========================================
echo.

echo [1/2] python-dotenv yukleniyor...
python -m pip install python-dotenv
if errorlevel 1 (
    echo HATA: python-dotenv yuklenemedi!
    pause
    exit /b 1
)
echo [OK] python-dotenv yuklendi!
echo.

echo [2/2] instagrapi yukleme deneniyor...
echo NOT: Python 3.14 icin uyumluluk sorunu olabilir.
echo.
python -m pip install --upgrade pip setuptools wheel
python -m pip install instagrapi --no-cache-dir
if errorlevel 1 (
    echo.
    echo ========================================
    echo UYARI: instagrapi yuklenemedi!
    echo ========================================
    echo.
    echo Python 3.14.2 cok yeni ve instagrapi paketi
    echo henuz tam uyumlu degil.
    echo.
    echo COZUM SECENEKLERI:
    echo.
    echo 1. Python 3.12 kur (ONERILEN)
    echo    - PYTHON_312_KURULUM.md dosyasina bak
    echo    - https://www.python.org/downloads/release/python-3120/
    echo.
    echo 2. Bir kac hafta bekle (paketler guncellenebilir)
    echo.
    echo 3. Alternatif yontem kullan
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo BASARILI! Tum paketler yuklendi!
echo ========================================
echo.
echo Scripti calistirmak icin: CALISTIR.bat
echo.
pause

