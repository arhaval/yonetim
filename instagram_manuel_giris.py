"""
Instagram İstatistik Manuel Giriş Scripti
Gönderiler otomatik çekilemezse, manuel olarak girebilirsiniz.
"""

import json
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def manuel_giris():
    """
    Kullanıcıdan manuel olarak gönderi bilgilerini alır.
    """
    username = os.getenv("INSTAGRAM_USERNAME", "arhavalcom")
    
    print("=" * 60)
    print("Instagram İstatistik Manuel Giriş")
    print("=" * 60)
    print(f"Kullanıcı: {username}")
    print()
    print("Son 5 gönderinin bilgilerini girin.")
    print("Instagram'da gönderilerinizi açın ve bilgileri girin.")
    print()
    
    posts = []
    
    for i in range(1, 6):
        print(f"\n--- Gönderi {i} ---")
        
        url = input("Gönderi URL'si (örn: https://www.instagram.com/p/ABC123/): ").strip()
        if not url:
            print("URL girilmedi, atlanıyor...")
            continue
        
        # URL'den shortcode çıkar
        shortcode = url.split("/p/")[-1].rstrip("/") if "/p/" in url else None
        
        try:
            likes = int(input("Beğeni sayısı: ") or "0")
        except:
            likes = 0
        
        try:
            comments = int(input("Yorum sayısı: ") or "0")
        except:
            comments = 0
        
        try:
            saves = int(input("Kaydedilme sayısı: ") or "0")
        except:
            saves = 0
        
        try:
            reach = input("Erişim (Reach) - Business hesabı varsa, yoksa Enter: ").strip()
            reach = int(reach) if reach else None
        except:
            reach = None
        
        try:
            impressions = input("Gösterim (Impressions) - Business hesabı varsa, yoksa Enter: ").strip()
            impressions = int(impressions) if impressions else None
        except:
            impressions = None
        
        caption = input("Açıklama (ilk 100 karakter, opsiyonel): ").strip()[:100]
        
        post_data = {
            "shortcode": shortcode or f"post_{i}",
            "url": url,
            "likes": likes,
            "comments": comments,
            "saves": saves,
            "reach": reach,
            "impressions": impressions,
            "caption": caption,
            "entered_at": datetime.now().isoformat()
        }
        
        posts.append(post_data)
        print(f"✓ Gönderi {i} kaydedildi!")
    
    # Sonuçları kaydet
    output_data = {
        "username": username,
        "scraped_at": datetime.now().isoformat(),
        "total_posts": len(posts),
        "method": "manuel_giris",
        "posts": posts
    }
    
    output_file = "sonuc_manuel.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✓ İşlem tamamlandı! Sonuçlar '{output_file}' dosyasına kaydedildi.")
    print("=" * 60)
    
    # Özet
    total_likes = sum(post.get("likes", 0) for post in posts)
    total_comments = sum(post.get("comments", 0) for post in posts)
    total_saves = sum(post.get("saves", 0) for post in posts)
    
    print(f"\nÖzet:")
    print(f"  Toplam Beğeni: {total_likes}")
    print(f"  Toplam Yorum: {total_comments}")
    print(f"  Toplam Kaydedilme: {total_saves}")

if __name__ == "__main__":
    try:
        manuel_giris()
    except KeyboardInterrupt:
        print("\n\nİşlem iptal edildi.")
    except Exception as e:
        print(f"\n✗ HATA: {str(e)}")

