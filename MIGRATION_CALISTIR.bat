@echo off
REM Pencereyi açık tut
title Prisma Migration Calistirma

echo ========================================
echo Prisma Migration Calistirma
echo ========================================
echo.

REM Proje klasorune git
cd /d "%~dp0"
echo Calisma klasoru: %CD%
echo.

REM Node.js kontrolu
where node >nul 2>&1
if errorlevel 1 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen Node.js yukleyin: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js bulundu!
node --version
echo.

REM npm kontrolu
where npm >nul 2>&1
if errorlevel 1 (
    echo HATA: npm bulunamadi!
    pause
    exit /b 1
)
echo [OK] npm bulundu!
echo.

echo [1/4] Prisma schema kontrol ediliyor...
if not exist "prisma\schema.prisma" (
    echo HATA: prisma\schema.prisma dosyasi bulunamadi!
    echo.
    pause
    exit /b 1
)
echo [OK] Schema dosyasi bulundu!
echo.

echo [2/4] .env dosyasi kontrol ediliyor...
if not exist ".env" (
    echo UYARI: .env dosyasi bulunamadi!
    echo DATABASE_URL tanimli olmalidir.
    echo.
) else (
    echo [OK] .env dosyasi bulundu!
)
echo.

echo [3/4] Database migration calistiriliyor...
echo NOT: Bu islem database'i guncelleyecek.
echo Lutfen bekleyin, bu biraz zaman alabilir...
echo.
echo ========================================
npx prisma db push
set MIGRATION_EXIT=%ERRORLEVEL%
echo ========================================
echo.

if %MIGRATION_EXIT% NEQ 0 (
    echo.
    echo ========================================
    echo HATA: Migration basarisiz oldu!
    echo ========================================
    echo.
    echo Kontrol edin:
    echo 1. DATABASE_URL .env dosyasinda dogru mu?
    echo 2. Database calisiyor mu?
    echo 3. Internet baglantisi var mi?
    echo 4. Supabase connection string dogru mu?
    echo.
    echo Hata detaylari yukarida gorunuyor.
    echo.
    pause
    exit /b 1
)
echo [OK] Migration basarili!
echo.

echo [4/4] Prisma Client yeniden generate ediliyor...
echo Lutfen bekleyin...
echo.
npx prisma generate
if errorlevel 1 (
    echo.
    echo ========================================
    echo HATA: Prisma generate basarisiz oldu!
    echo ========================================
    echo.
    pause
    exit /b 1
)
echo [OK] Prisma Client generate edildi!
echo.

echo ========================================
echo BASARILI! Migration tamamlandi!
echo ========================================
echo.
echo Indexler olusturuldu ve database guncellendi.
echo Performans iyilestirmeleri aktif!
echo.
echo Sonraki adimlar:
echo 1. npm run build
echo 2. npm start (test icin)
echo 3. Canliya al
echo.
echo ========================================
pause

