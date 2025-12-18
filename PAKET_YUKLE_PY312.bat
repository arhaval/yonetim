@echo off
echo ========================================
echo Python 3.12 Paket Yukleme
echo ========================================
echo.

REM Python 3.12 kontrolu
py -3.12 --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python 3.12 bulunamadi!
    echo Lutfen Python 3.12'yi kurun.
    pause
    exit /b 1
)

echo Python 3.12 bulundu!
py -3.12 --version
echo.

echo ========================================
echo Paketler yukleniyor...
echo ========================================
echo.
echo Bu islem bir kac dakika surebilir.
echo Lutfen bekleyin...
echo.

REM python-dotenv yukle
echo [1/2] python-dotenv yukleniyor...
py -3.12 -m pip install python-dotenv
if errorlevel 1 (
    echo HATA: python-dotenv yuklenemedi!
    pause
    exit /b 1
)
echo [OK] python-dotenv yuklendi!
echo.

REM instagrapi yukle
echo [2/2] instagrapi yukleniyor...
echo Bu biraz zaman alabilir, lutfen bekleyin...
py -3.12 -m pip install instagrapi
if errorlevel 1 (
    echo.
    echo HATA: instagrapi yuklenemedi!
    echo.
    pause
    exit /b 1
)
echo [OK] instagrapi yuklendi!
echo.

echo ========================================
echo BASARILI! Tum paketler yuklendi!
echo ========================================
echo.
echo Kontrol ediliyor...
py -3.12 -c "import instagrapi; import dotenv; print('Tum paketler hazir!')"
if errorlevel 1 (
    echo UYARI: Paketler yuklu gibi gorunuyor ama import edilemiyor!
    pause
    exit /b 1
)

echo.
echo ========================================
echo HAZIR! Script calistirmaya hazir!
echo ========================================
echo.
echo Simdi CALISTIR_PY312.bat dosyasini calistirabilirsiniz.
echo.
pause

