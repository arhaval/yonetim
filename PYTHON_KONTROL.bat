@echo off
echo ========================================
echo Python Kontrol Scripti
echo ========================================
echo.

echo 1. Python komutunu kontrol ediliyor...
python --version 2>nul
if errorlevel 1 (
    echo    [X] python komutu calismiyor
) else (
    echo    [OK] python komutu calisiyor
    python --version
)
echo.

echo 2. Python3 komutunu kontrol ediliyor...
python3 --version 2>nul
if errorlevel 1 (
    echo    [X] python3 komutu calismiyor
) else (
    echo    [OK] python3 komutu calisiyor
    python3 --version
)
echo.

echo 3. Python konumu araniyor...
where python 2>nul
if errorlevel 1 (
    echo    [X] Python bulunamadi
) else (
    echo    [OK] Python bulundu
    where python
)
echo.

echo 4. Program Files'da Python araniyor...
if exist "C:\Program Files\Python*" (
    echo    [OK] Program Files'da Python klasoru bulundu
    dir "C:\Program Files\Python*" /b
) else (
    echo    [X] Program Files'da Python klasoru bulunamadi
)
echo.

echo 5. AppData'da Python araniyor...
if exist "%LOCALAPPDATA%\Programs\Python" (
    echo    [OK] AppData'da Python klasoru bulundu
    dir "%LOCALAPPDATA%\Programs\Python" /b
) else (
    echo    [X] AppData'da Python klasoru bulunamadi
)
echo.

echo ========================================
echo Kontrol tamamlandi!
echo ========================================
echo.
echo Eger Python yuklu degilse:
echo 1. https://www.python.org/downloads/ adresinden indirin
echo 2. Kurulum sirasinda "Add Python to PATH" secenegini isaretleyin
echo 3. Bilgisayari yeniden baslatin
echo.
pause

