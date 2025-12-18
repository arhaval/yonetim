@echo off
REM Bu script Windows Task Scheduler ile otomatik çalıştırılabilir
REM Günlük/haftalık otomatik Instagram istatistik çekme için kullanılır

cd /d "%~dp0"

REM Python'un yuklu olup olmadigini kontrol et
python --version >nul 2>&1
if errorlevel 1 (
    echo [%date% %time%] HATA: Python bulunamadi! >> instagram_auto_log.txt
    exit /b 1
)

REM Scripti calistir ve loglara yaz
echo [%date% %time%] Instagram istatistik scripti baslatiliyor... >> instagram_auto_log.txt
python instagram_stats.py >> instagram_auto_log.txt 2>&1

if errorlevel 1 (
    echo [%date% %time%] HATA: Script basarisiz oldu! >> instagram_auto_log.txt
    exit /b 1
) else (
    echo [%date% %time%] Basarili: Script tamamlandi! >> instagram_auto_log.txt
)

exit /b 0

