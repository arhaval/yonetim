@echo off
echo ========================================
echo Windows Task Scheduler Hizli Kurulum
echo ========================================
echo.
echo Bu script, Instagram istatistik scriptini
echo otomatik calistirmak icin Task Scheduler
echo gorevi olusturacak.
echo.
echo Kurulum yapiliyor...
echo.

REM Task Scheduler'a görev oluştur
schtasks /create /tn "Instagram Istatistik Cekme" /tr "%~dp0OTOMATIK_CALISTIR.bat" /sc daily /st 09:00 /ru "SYSTEM" /f /rl highest

if errorlevel 1 (
    echo.
    echo HATA: Task olusturulamadi!
    echo Manuel olarak Task Scheduler'dan olusturmaniz gerekebilir.
    echo.
    echo Adimlar:
    echo 1. Windows + R -^> taskschd.msc
    echo 2. Create Basic Task
    echo 3. Program: %~dp0OTOMATIK_CALISTIR.bat
    echo 4. Zamanlama: Gunluk 09:00
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo BASARILI!
echo ========================================
echo.
echo Task Scheduler gorevi olusturuldu!
echo.
echo Gorev detaylari:
echo - Isim: Instagram Istatistik Cekme
echo - Zamanlama: Her gun 09:00
echo - Script: OTOMATIK_CALISTIR.bat
echo.
echo Gorevi gormek icin:
echo Windows + R -^> taskschd.msc
echo.
echo Gorevi test etmek icin:
echo Task Scheduler'da gorevi bul, sag tik -^> Run
echo.
pause

