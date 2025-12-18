@echo off
echo ========================================
echo Python 3.14 ile Devam Etme
echo ========================================
echo.

echo Python 3.14.2 ile instagrapi yuklemeyi deniyoruz...
echo.

REM python-dotenv yukle
echo [1/2] python-dotenv yukleniyor...
python -m pip install python-dotenv
if errorlevel 1 (
    echo HATA: python-dotenv yuklenemedi!
    pause
    exit /b 1
)
echo [OK] python-dotenv yuklendi!
echo.

REM instagrapi yuklemeyi dene
echo [2/2] instagrapi yukleniyor...
echo NOT: Bu biraz zaman alabilir ve basarisiz olabilir.
echo.
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
    echo 1. Python 3.12 kur (PYTHON_312_ALTERNATIF_INDIRME.bat)
    echo 2. Bir kac hafta bekle (paketler guncellenebilir)
    echo 3. Alternatif yontem kullan (Selenium vb.)
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

