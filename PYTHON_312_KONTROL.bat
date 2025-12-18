@echo off
echo ========================================
echo Python 3.12 Kurulum Kontrolu
echo ========================================
echo.

echo Python surumleri kontrol ediliyor...
echo.

py --list

echo.
echo ========================================
echo Python 3.12 Kontrolu
echo ========================================
echo.

py -3.12 --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python 3.12 kurulu degil!
    echo.
    echo LUTFEN:
    echo 1. Python 3.12 installer dosyasini calistirin
    echo 2. "Add Python 3.12 to PATH" secenegini isaretleyin
    echo 3. "Install Now" butonuna tiklayin
    echo 4. Kurulum bitince bu scripti tekrar calistirin
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Python 3.12 kurulu!
    py -3.12 --version
    echo.
    echo ========================================
    echo Paketler yukleniyor...
    echo ========================================
    echo.
    
    echo [1/2] python-dotenv yukleniyor...
    py -3.12 -m pip install python-dotenv
    if errorlevel 1 (
        echo HATA: python-dotenv yuklenemedi!
        pause
        exit /b 1
    )
    echo [OK] python-dotenv yuklendi!
    echo.
    
    echo [2/2] instagrapi yukleniyor...
    py -3.12 -m pip install instagrapi
    if errorlevel 1 (
        echo HATA: instagrapi yuklenemedi!
        pause
        exit /b 1
    )
    echo [OK] instagrapi yuklendi!
    echo.
    
    echo ========================================
    echo BASARILI! Tum paketler yuklendi!
    echo ========================================
    echo.
    echo Scripti calistirmak icin:
    echo py -3.12 instagram_stats.py
    echo.
    echo Veya CALISTIR_PY312.bat dosyasini kullanin.
    echo.
)

pause

