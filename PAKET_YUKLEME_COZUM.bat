@echo off
echo ========================================
echo Paket Yukleme Cozumu
echo ========================================
echo.

echo [1/3] python-dotenv yukleniyor...
python -m pip install python-dotenv
if errorlevel 1 (
    echo HATA: python-dotenv yuklenemedi!
    pause
    exit /b 1
)
echo.

echo [2/3] instagrapi icin uyumlu surum deneniyor...
echo NOT: Python 3.14 cok yeni, bazı paketler henuz uyumlu degil.
echo Alternatif yukleme yontemi deneniyor...
python -m pip install --no-build-isolation instagrapi
if errorlevel 1 (
    echo.
    echo ========================================
    echo UYARI: instagrapi yuklenemedi!
    echo ========================================
    echo.
    echo Python 3.14.2 cok yeni bir surum ve instagrapi
    echo paketinin bazı bagimliliklari henuz uyumlu degil.
    echo.
    echo COZUM: Python 3.11 veya 3.12 kullanmaniz onerilir.
    echo.
    echo Python 3.12 indirme:
    echo https://www.python.org/downloads/release/python-3120/
    echo.
    echo Kurulum sirasinda:
    echo - "Add Python to PATH" secenegini isaretleyin
    echo - Eski Python'u kaldirmayin, yeni surumu ekleyin
    echo.
    pause
    exit /b 1
)
echo.

echo [3/3] Kontrol ediliyor...
python -c "import dotenv; print('python-dotenv: OK')"
python -c "import instagrapi; print('instagrapi: OK')"
if errorlevel 1 (
    echo HATA: Paketler yuklenmis gibi gorunuyor ama import edilemiyor!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BASARILI! Tum paketler yuklendi!
echo ========================================
echo.
pause

