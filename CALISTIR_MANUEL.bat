@echo off
echo ========================================
echo Instagram Manuel Veri Girisi
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
py -3.12 -c "import dotenv" >nul 2>&1
if errorlevel 1 (
    echo python-dotenv yukleniyor...
    py -3.12 -m pip install python-dotenv
)

echo.
echo ========================================
echo Script calistiriliyor...
echo ========================================
echo.
echo Instagram'da gonderilerinizi acin ve bilgileri girin.
echo.

REM Scripti calistir
py -3.12 instagram_manuel_giris.py

echo.
echo ========================================
echo Sonuclar 'sonuc_manuel.json' dosyasina kaydedildi!
echo ========================================
pause

