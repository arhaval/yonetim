@echo off
echo ========================================
echo Kurulum Kontrol Scripti
echo ========================================
echo.

echo [1/4] Python kontrol ediliyor...
python --version
if errorlevel 1 (
    echo    [X] Python bulunamadi!
    goto :hata
) else (
    echo    [OK] Python yuklu
)
echo.

echo [2/4] instagrapi paketi kontrol ediliyor...
python -c "import instagrapi; print('    [OK] instagrapi yuklu')" 2>nul
if errorlevel 1 (
    echo    [X] instagrapi yuklu degil!
    echo    Yukleniyor...
    python -m pip install instagrapi
    if errorlevel 1 (
        echo    [X] instagrapi yuklenemedi!
        goto :hata
    ) else (
        echo    [OK] instagrapi yuklendi
    )
) else (
    echo    [OK] instagrapi yuklu
)
echo.

echo [3/4] python-dotenv paketi kontrol ediliyor...
python -c "import dotenv; print('    [OK] python-dotenv yuklu')" 2>nul
if errorlevel 1 (
    echo    [X] python-dotenv yuklu degil!
    echo    Yukleniyor...
    python -m pip install python-dotenv
    if errorlevel 1 (
        echo    [X] python-dotenv yuklenemedi!
        goto :hata
    ) else (
        echo    [OK] python-dotenv yuklendi
    )
) else (
    echo    [OK] python-dotenv yuklu
)
echo.

echo [4/4] .env dosyasi kontrol ediliyor...
if exist .env (
    echo    [OK] .env dosyasi bulundu
) else (
    echo    [X] .env dosyasi bulunamadi!
    echo    Lutfen .env dosyasi olusturun.
    goto :hata
)
echo.

echo ========================================
echo [BASARILI] Tum kontroller gecti!
echo ========================================
echo.
echo Script calistirmaya hazir!
echo CALISTIR.bat dosyasina cift tiklayarak baslayabilirsiniz.
echo.
pause
exit /b 0

:hata
echo.
echo ========================================
echo [HATA] Kurulum tamamlanamadi!
echo ========================================
echo.
echo Lutfen hatalari duzeltin ve tekrar deneyin.
echo.
pause
exit /b 1

