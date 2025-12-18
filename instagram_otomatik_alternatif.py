"""
Instagram İstatistik Çekme - Alternatif Otomatik Yöntem
Web scraping ile Instagram'dan direkt veri çeker (instagrapi olmadan)
"""

import os
import json
import re
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_media_stats_from_url(url):
    """
    Instagram gönderi URL'sinden web scraping ile veri çeker.
    """
    try:
        # URL'den shortcode çıkar
        shortcode = None
        patterns = [
            r'/p/([A-Za-z0-9_-]+)',
            r'/reel/([A-Za-z0-9_-]+)',
            r'/tv/([A-Za-z0-9_-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                shortcode = match.group(1)
                break
        
        if not shortcode:
            return {"error": "URL'den shortcode çıkarılamadı"}
        
        # Instagram public sayfasına istek at
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Instagram embed endpoint'i kullan
        embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
        
        print(f"Veri çekiliyor: {shortcode}...")
        response = requests.get(embed_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}: Sayfa alınamadı"}
        
        html = response.text
        
        # JSON-LD veya script tag'lerinden veri çıkar
        # Instagram embed sayfasında meta tag'ler var
        stats = {
            "shortcode": shortcode,
            "url": url,
            "likes": 0,
            "comments": 0,
            "saves": 0,
            "error": None
        }
        
        # Meta tag'lerden veri çekmeyi dene
        # Instagram embed sayfası sınırlı bilgi verir
        # Daha iyi sonuç için Instagram Graph API gerekir
        
        # Alternatif: Instagram Graph API kullan
        # Bu için Facebook Developer hesabı ve uygulama gerekiyor
        
        return {
            "shortcode": shortcode,
            "url": url,
            "note": "Web scraping ile sınırlı veri çekilebilir. Instagram Graph API önerilir.",
            "likes": 0,
            "comments": 0,
            "saves": 0
        }
        
    except Exception as e:
        return {"error": str(e)[:200]}

def main():
    """
    Ana fonksiyon
    """
    print("=" * 60)
    print("Instagram Otomatik Veri Çekme - Alternatif Yöntem")
    print("=" * 60)
    print()
    print("⚠ NOT: Bu yöntem sınırlıdır.")
    print("Instagram verilerini çekmek için Instagram Graph API kullanılmalıdır.")
    print()
    print("Instagram Graph API için:")
    print("1. Facebook Developer hesabı oluşturun")
    print("2. Instagram Business hesabınızı bağlayın")
    print("3. Access Token alın")
    print()
    print("Detaylar: INSTAGRAM_GRAPH_API_REHBERI.md")
    print()
    
    # Link dosyasından oku
    link_file = "instagram_linkler.txt"
    urls = []
    
    if os.path.exists(link_file):
        with open(link_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "instagram.com" in line:
                    urls.append(line)
    
    if not urls:
        print("⚠ 'instagram_linkler.txt' dosyasında link bulunamadı!")
        return 1
    
    print(f"{len(urls)} link işleniyor...")
    print("-" * 60)
    
    results = []
    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] {url}")
        stats = get_media_stats_from_url(url)
        results.append(stats)
        if "error" not in stats:
            print(f"  ✓ İşlendi")
        else:
            print(f"  ✗ Hata: {stats.get('error', 'Bilinmeyen hata')}")
    
    # Sonuçları kaydet
    output_data = {
        "username": os.getenv("INSTAGRAM_USERNAME", "arhavalcom"),
        "scraped_at": datetime.now().isoformat(),
        "total_posts": len(results),
        "method": "web_scraping_alternative",
        "note": "Bu yöntem sınırlıdır. Instagram Graph API kullanılmalıdır.",
        "posts": results
    }
    
    output_file = "sonuc_alternatif.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Sonuçlar '{output_file}' dosyasına kaydedildi.")
    print("=" * 60)
    print()
    print("💡 ÖNERİ: Instagram Graph API kullanın!")
    print("   Detaylar: INSTAGRAM_GRAPH_API_REHBERI.md")
    
    return 0

if __name__ == "__main__":
    exit(main())

