"""
Instagram Gönderi Linkinden İstatistik Çekme Scripti
Gönderi linkini verin, istatistikleri çeksin.
"""

import os
import json
import re
import requests
from datetime import datetime
from dotenv import load_dotenv
from instagrapi import Client
from instagrapi.exceptions import LoginRequired

load_dotenv()

def extract_shortcode_from_url(url):
    """
    Instagram URL'sinden shortcode çıkarır.
    
    Örnekler:
    - https://www.instagram.com/p/ABC123/ -> ABC123
    - https://www.instagram.com/reel/XYZ789/ -> XYZ789
    """
    patterns = [
        r'/p/([A-Za-z0-9_-]+)',
        r'/reel/([A-Za-z0-9_-]+)',
        r'/tv/([A-Za-z0-9_-]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def get_media_from_link(cl, url):
    """
    Instagram gönderi linkinden medya bilgilerini çeker.
    
    Args:
        cl: Instagram client objesi
        url: Instagram gönderi URL'si
    
    Returns:
        dict: Gönderi istatistikleri
    """
    try:
        shortcode = extract_shortcode_from_url(url)
        if not shortcode:
            raise Exception("URL'den shortcode çıkarılamadı. Geçerli bir Instagram linki girin.")
        
        print(f"Shortcode bulundu: {shortcode}")
        
        # Farklı yöntemlerle medya bilgilerini çek
        media = None
        method_used = None
        
        # Yöntem 1: media_info (shortcode ile)
        try:
            media = cl.media_info(shortcode)
            method_used = "media_info"
            print(f"  ✓ Yöntem 1 başarılı: media_info")
        except Exception as e1:
            print(f"  ⚠ Yöntem 1 başarısız: {str(e1)[:80]}")
            
            # Yöntem 2: media_id ile
            try:
                media_id = cl.media_id(shortcode)
                media = cl.media_info(media_id)
                method_used = "media_info_by_id"
                print(f"  ✓ Yöntem 2 başarılı: media_info_by_id")
            except Exception as e2:
                print(f"  ⚠ Yöntem 2 başarısız: {str(e2)[:80]}")
                
                # Yöntem 3: media_pk_from_code ile
                try:
                    media_pk = cl.media_pk_from_code(shortcode)
                    media = cl.media_info(media_pk)
                    method_used = "media_pk_from_code"
                    print(f"  ✓ Yöntem 3 başarılı: media_pk_from_code")
                except Exception as e3:
                    print(f"  ⚠ Yöntem 3 başarısız: {str(e3)[:80]}")
                    raise Exception(f"Tüm yöntemler başarısız. Instagram API'si değişmiş olabilir.")
        
        if not media:
            raise Exception("Medya bilgisi alınamadı.")
        
        # İstatistikleri çıkar - hata yönetimi ile
        try:
            media_id = media.pk if hasattr(media, 'pk') else None
            media_type = getattr(media, 'media_type', None)
            taken_at = None
            if hasattr(media, 'taken_at') and media.taken_at:
                try:
                    taken_at = datetime.fromtimestamp(media.taken_at).isoformat()
                except:
                    pass
            
            caption = ""
            if hasattr(media, 'caption_text') and media.caption_text:
                caption = media.caption_text[:200] + "..." if len(media.caption_text) > 200 else media.caption_text
            
            likes = getattr(media, 'like_count', 0) or 0
            comments = getattr(media, 'comment_count', 0) or 0
            saves = getattr(media, 'saved_count', None) or 0
            plays = getattr(media, 'play_count', None) or 0
            
        except Exception as e:
            print(f"  ⚠ İstatistik çıkarılırken hata: {str(e)[:80]}")
            # Minimum bilgilerle devam et
            media_id = None
            media_type = None
            taken_at = None
            caption = ""
            likes = 0
            comments = 0
            saves = 0
            plays = 0
        
        stats = {
            "shortcode": shortcode,
            "url": url,
            "media_id": media_id,
            "media_type": media_type,
            "taken_at": taken_at,
            "caption": caption,
            "likes": likes,
            "comments": comments,
            "saves": saves,
            "plays": plays,
            "reach": None,
            "impressions": None,
            "method_used": method_used
        }
        
        # Insights çekmeyi dene (Business/Creator hesabı gerektirir)
        if media_id:
            try:
                insights = cl.media_insights(media_id)
                if insights and isinstance(insights, dict):
                    stats["reach"] = insights.get("reach", insights.get("accounts_engaged", None))
                    stats["impressions"] = insights.get("impressions", insights.get("profile_visits", None))
                    stats["saves"] = insights.get("saves", stats.get("saves", 0))
            except Exception as e:
                print(f"  ⚠ Insights çekilemedi: {str(e)[:80]}")
        
        return stats
        
    except Exception as e:
        # Hata durumunda minimum bilgilerle döndür
        shortcode = extract_shortcode_from_url(url)
        return {
            "shortcode": shortcode or "unknown",
            "url": url,
            "error": str(e)[:200],
            "likes": 0,
            "comments": 0,
            "saves": 0
        }

def login_to_instagram():
    """
    Instagram'a giriş yapar (session varsa kullanır).
    """
    username = os.getenv("INSTAGRAM_USERNAME")
    password = os.getenv("INSTAGRAM_PASSWORD")
    
    if not username or not password:
        raise Exception("INSTAGRAM_USERNAME ve INSTAGRAM_PASSWORD .env dosyasında tanımlı olmalıdır!")
    
    cl = Client()
    
    # Session dosyası varsa yükle
    session_file = f"{username}_session.json"
    if os.path.exists(session_file):
        try:
            cl.load_settings(session_file)
            print(f"✓ Önceki session yüklendi: {username}")
            # Session geçerli mi kontrol et
            try:
                cl.get_timeline_feed()
                print(f"✓ Session geçerli, giriş yapıldı: {username}")
                return cl
            except:
                print("⚠ Session geçersiz, yeni giriş yapılıyor...")
        except:
            print("⚠ Session yüklenemedi, yeni giriş yapılıyor...")
    
    # Yeni giriş yap
    print(f"Giriş yapılıyor: {username}...")
    cl.login(username, password)
    
    # Session'ı kaydet
    try:
        cl.dump_settings(session_file)
        print(f"✓ Session kaydedildi")
    except:
        pass
    
    print(f"✓ Başarıyla giriş yapıldı: {username}")
    return cl

def main():
    """
    Ana fonksiyon: Gönderi linklerinden istatistik çeker.
    """
    try:
        print("=" * 60)
        print("Instagram Gönderi Linkinden İstatistik Çekme")
        print("=" * 60)
        print()
        
        # Giriş yap
        cl = login_to_instagram()
        
        # Gönderi linklerini al - önce dosyadan, yoksa kullanıcıdan
        urls = []
        
        # Önce dosyadan oku
        link_file = "instagram_linkler.txt"
        if os.path.exists(link_file):
            print(f"'{link_file}' dosyasından linkler okunuyor...")
            try:
                with open(link_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        # Boş satırları ve yorumları atla
                        if line and not line.startswith("#") and "instagram.com" in line:
                            urls.append(line)
                            print(f"  ✓ Link bulundu: {line[:50]}...")
            except Exception as e:
                print(f"⚠ Dosya okunamadı: {str(e)}")
        
        # Dosyada link yoksa kullanıcıdan al
        if not urls:
            print()
            print("Instagram gönderi linklerini girin.")
            print("Her linkten sonra Enter'a basın.")
            print("Bitirmek için boş bırakıp Enter'a basın.")
            print()
            print("VEYA: 'instagram_linkler.txt' dosyasına linkleri yazın!")
            print()
            print("Örnek linkler:")
            print("  https://www.instagram.com/p/ABC123/")
            print("  https://www.instagram.com/reel/XYZ789/")
            print()
            
            while True:
                url = input("Gönderi linki (veya Enter ile bitir): ").strip()
                if not url:
                    break
                if "instagram.com" in url:
                    urls.append(url)
                    print(f"✓ Link eklendi ({len(urls)}. link)")
                else:
                    print("⚠ Geçerli bir Instagram linki girin!")
        
        if not urls:
            print("\n⚠ Hiç link bulunamadı!")
            print(f"\n💡 İPUCU: '{link_file}' dosyasına linkleri yazın, script otomatik okuyacak!")
            return 1
        
        print(f"\n{len(urls)} gönderi işleniyor...")
        print("-" * 60)
        
        results = []
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] İşleniyor: {url}")
            try:
                stats = get_media_from_link(cl, url)
                results.append(stats)
                print(f"  ✓ Beğeni: {stats['likes']}, Yorum: {stats['comments']}, Kaydedilme: {stats['saves']}")
            except Exception as e:
                print(f"  ✗ Hata: {str(e)[:100]}")
                results.append({
                    "url": url,
                    "error": str(e)[:200]
                })
        
        # Sonuçları kaydet
        output_data = {
            "username": os.getenv("INSTAGRAM_USERNAME", "arhavalcom"),
            "scraped_at": datetime.now().isoformat(),
            "total_posts": len(results),
            "method": "link_based",
            "posts": results
        }
        
        output_file = "sonuc_link.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print("\n" + "=" * 60)
        print(f"✓ İşlem tamamlandı! Sonuçlar '{output_file}' dosyasına kaydedildi.")
        print("=" * 60)
        
        # Özet
        successful = [r for r in results if "error" not in r]
        total_likes = sum(post.get("likes", 0) for post in successful)
        total_comments = sum(post.get("comments", 0) for post in successful)
        total_saves = sum(post.get("saves", 0) for post in successful)
        
        print(f"\nÖzet:")
        print(f"  Başarılı: {len(successful)}/{len(results)}")
        print(f"  Toplam Beğeni: {total_likes}")
        print(f"  Toplam Yorum: {total_comments}")
        print(f"  Toplam Kaydedilme: {total_saves}")
        
    except KeyboardInterrupt:
        print("\n\nİşlem iptal edildi.")
        return 1
    except Exception as e:
        print(f"\n✗ HATA: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

