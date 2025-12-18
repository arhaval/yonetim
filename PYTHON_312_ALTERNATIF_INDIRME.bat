@echo off
echo ========================================
echo Python 3.12 Alternatif Indirme Yontemleri
echo ========================================
echo.

echo YONTEM 1: Microsoft Store
echo --------------------------
echo 1. Microsoft Store'u acin
echo 2. "Python 3.12" arayin
echo 3. Python 3.12'yi yukleyin
echo.
echo Microsoft Store'u acmak icin: ms-windows-store://
echo.

echo YONTEM 2: Winget (PowerShell'de)
echo --------------------------
echo 1. PowerShell'i yonetici olarak acin
echo 2. Su komutu calistirin:
echo    winget install Python.Python.3.12
echo.

echo YONTEM 3: Direkt Link
echo --------------------------
echo Tarayicinizda su linke gidin:
echo https://www.python.org/ftp/python/3.12.12/python-3.12.12-amd64.exe
echo.
echo Dosyayi indirip calistirin.
echo.

echo ========================================
echo Hangi yontemi kullanmak istersiniz?
echo ========================================
echo.
echo 1 - Microsoft Store'u ac
echo 2 - PowerShell'de winget komutunu goster
echo 3 - Direkt indirme linkini ac
echo 4 - Cikis
echo.

choice /c 1234 /n /m "Seciminiz: "

if errorlevel 4 exit /b 0
if errorlevel 3 (
    start https://www.python.org/ftp/python/3.12.12/python-3.12.12-amd64.exe
    echo Indirme linki acildi!
    pause
    exit /b 0
)
if errorlevel 2 (
    echo.
    echo PowerShell'i yonetici olarak acin ve su komutu calistirin:
    echo winget install Python.Python.3.12
    echo.
    pause
    exit /b 0
)
if errorlevel 1 (
    start ms-windows-store://
    echo Microsoft Store acildi! "Python 3.12" arayin.
    pause
    exit /b 0
)

