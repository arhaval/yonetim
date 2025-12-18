@echo off
echo ========================================
echo Instagram Link Cekici
echo ========================================
echo.

REM Python 3.12 kontrolu
py -3.12 --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python 3.12 bulunamadi!
    pause
    exit /b 1
)

echo Python 3.12 bulundu!
py -3.12 --version
echo.

REM Paket kontrolu
py -3.12 -c "import instagrapi; import dotenv" >nul 2>&1
if errorlevel 1 (
    echo Paketler yuklu degil, yukleniyor...
    py -3.12 -m pip install instagrapi python-dotenv
    if errorlevel 1 (
        echo HATA: Paketler yuklenemedi!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Script calistiriliyor...
echo ========================================
echo.

REM Scripti calistir
py -3.12 instagram_link_cekici.py

echo.
echo ========================================
pause

