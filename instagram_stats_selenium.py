"""
Instagram İstatistik Çekme Scripti (Selenium Alternatifi)
instagrapi çalışmazsa bu alternatif scripti kullanın.
Selenium ile Instagram'dan veri çeker.
"""

import os
import json
import time
from datetime import datetime
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

def check_selenium_alternative():
    """
    Selenium alternatifini kontrol eder ve kurulum talimatları verir.
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        return True
    except ImportError:
        print("=" * 60)
        print("SELENIUM ALTERNATIFI")
        print("=" * 60)
        print()
        print("instagrapi yüklenemedi. Alternatif olarak Selenium kullanabilirsiniz.")
        print()
        print("KURULUM:")
        print("1. pip install selenium")
        print("2. ChromeDriver indirin: https://chromedriver.chromium.org/")
        print("3. ChromeDriver'ı PATH'e ekleyin veya script klasörüne koyun")
        print()
        print("NOT: Selenium daha yavaş çalışır ve Chrome gerektirir.")
        print("=" * 60)
        return False

def main():
    """
    Ana fonksiyon - Selenium alternatifi için talimatlar
    """
    print("=" * 60)
    print("Instagram İstatistik Scripti - Alternatif Yöntem")
    print("=" * 60)
    print()
    
    if not check_selenium_alternative():
        print()
        print("ÖNERİ: instagrapi'yi yüklemeyi deneyin:")
        print("  python -m pip install instagrapi")
        print()
        print("Eğer yüklenemezse, Python 3.12 kullanmanız önerilir.")
        return 1
    
    print("Selenium yüklü! Ancak bu script henüz tamamlanmadı.")
    print("Lütfen instagrapi'yi yüklemeyi deneyin veya Python 3.12 kullanın.")
    return 0

if __name__ == "__main__":
    exit(main())

