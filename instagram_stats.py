"""
Instagram İstatistik Çekme Scripti
instagrapi kütüphanesini kullanarak Instagram hesabından detaylı istatistik çeker.
"""

import os
import json
from datetime import datetime
from dotenv import load_dotenv
from instagrapi import Client
from instagrapi.exceptions import LoginRequired, PleaseWaitFewMinutes, ChallengeRequired

# .env dosyasını yükle
load_dotenv()

def login_to_instagram(username, password):
    """
    Instagram hesabına giriş yapar.
    
    Args:
        username: Instagram kullanıcı adı
        password: Instagram şifresi
    
    Returns:
        Client: Giriş yapılmış Instagram client objesi
    """
    try:
        # Client ayarları - daha az şüpheli görünmek için
        cl = Client()
        
        # Delay ekle (çok hızlı istek göndermemek için)
        import time
        time.sleep(2)
        
        # Session dosyası varsa yükle (daha önce başarılı giriş yapıldıysa)
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
        
        # Yeni giriş yap - retry mekanizması ile
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Giriş denemesi {attempt + 1}/{max_retries}...")
                cl.login(username, password)
                
                # Session'ı kaydet (bir sonraki sefer için)
                try:
                    cl.dump_settings(session_file)
                    print(f"✓ Session kaydedildi: {session_file}")
                except:
                    pass
                
                print(f"✓ Başarıyla giriş yapıldı: {username}")
                return cl
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5  # 5, 10, 15 saniye bekle
                    print(f"⚠ Hata: {str(e)}")
                    print(f"⏳ {wait_time} saniye bekleyip tekrar denenecek...")
                    time.sleep(wait_time)
                else:
                    raise e
    except ChallengeRequired as e:
        raise Exception(f"Güvenlik doğrulaması gerekli. Lütfen Instagram uygulamasından giriş yapın ve tekrar deneyin. Hata: {str(e)}")
    except PleaseWaitFewMinutes as e:
        raise Exception(f"Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin. Hata: {str(e)}")
    except Exception as e:
        error_msg = str(e)
        if "blacklist" in error_msg.lower() or "ip address" in error_msg.lower():
            raise Exception(f"IP adresiniz geçici olarak engellenmiş. ÇÖZÜM: 1) VPN kullanın, 2) Birkaç saat bekleyin, 3) Farklı bir ağ kullanın. Detaylar: INSTAGRAM_GIRIS_SORUNLARI.md")
        raise Exception(f"Giriş yapılamadı: {str(e)}")

def get_user_media(cl, username, limit=5):
    """
    Kullanıcının son gönderilerini çeker.
    
    Args:
        cl: Instagram client objesi
        username: Instagram kullanıcı adı
        limit: Çekilecek gönderi sayısı (varsayılan: 5)
    
    Returns:
        list: Gönderi listesi
    """
    try:
        # Önce user_id'yi al
        try:
            user_id = cl.user_id_from_username(username)
        except Exception as e:
            print(f"⚠ user_id_from_username hatası: {str(e)}")
            # Alternatif yöntem dene
            try:
                user_info = cl.user_info_by_username(username)
                user_id = user_info.pk
            except Exception as e2:
                raise Exception(f"Kullanıcı bilgisi alınamadı: {str(e2)}")
        
        # Farklı yöntemlerle gönderileri çekmeyi dene
        media = None
        
        # Yöntem 1: user_medias (varsayılan)
        try:
            media = cl.user_medias(user_id, amount=limit)
            print(f"✓ {len(media)} gönderi bulundu (yöntem 1)")
            return media
        except Exception as e1:
            print(f"⚠ Yöntem 1 başarısız: {str(e1)[:100]}")
        
        # Yöntem 2: user_medias_v1
        try:
            media = cl.user_medias_v1(user_id, amount=limit)
            print(f"✓ {len(media)} gönderi bulundu (yöntem 2)")
            return media
        except Exception as e2:
            print(f"⚠ Yöntem 2 başarısız: {str(e2)[:100]}")
        
        # Yöntem 3: user_medias_gql
        try:
            media = cl.user_medias_gql(user_id, amount=limit)
            print(f"✓ {len(media)} gönderi bulundu (yöntem 3)")
            return media
        except Exception as e3:
            print(f"⚠ Yöntem 3 başarısız: {str(e3)[:100]}")
        
        # Hiçbiri çalışmadıysa hata fırlat
        if media is None or len(media) == 0:
            raise Exception("Tüm yöntemler başarısız oldu. Instagram API'si değişmiş olabilir.")
        
        return media
    except Exception as e:
        print(f"⚠ Gönderiler çekilemedi: {str(e)}")
        # Boş liste döndür, script devam etsin
        return []

def get_media_insights(cl, media_id):
    """
    Bir gönderinin detaylı istatistiklerini çeker.
    
    Args:
        cl: Instagram client objesi
        media_id: Gönderi ID'si
    
    Returns:
        dict: İstatistik verileri
    """
    try:
        insights = cl.media_insights(media_id)
        return insights
    except Exception as e:
        # Eğer insights çekilemezse, temel bilgileri döndür
        print(f"⚠ Gönderi {media_id} için insights çekilemedi: {str(e)}")
        return None

def extract_media_stats(cl, media):
    """
    Gönderi verilerinden istatistikleri çıkarır.
    
    Args:
        cl: Instagram client objesi
        media: Gönderi objesi
    
    Returns:
        dict: İstatistik verileri
    """
    stats = {
        "media_id": media.pk,
        "shortcode": media.code,
        "url": f"https://www.instagram.com/p/{media.code}/",
        "taken_at": datetime.fromtimestamp(media.taken_at).isoformat() if media.taken_at else None,
        "caption": media.caption_text[:100] + "..." if media.caption_text and len(media.caption_text) > 100 else (media.caption_text or ""),
        "likes": media.like_count or 0,
        "comments": media.comment_count or 0,
        "saves": getattr(media, 'saved_count', None) or 0,
        "reach": None,
        "impressions": None
    }
    
    # Insights çekmeyi dene (Business/Creator hesabı gerektirir)
    try:
        insights = get_media_insights(cl, media.pk)
        if insights:
            # Insights formatı değişebilir, bu yüzden farklı formatları kontrol et
            if isinstance(insights, dict):
                stats["reach"] = insights.get("reach", insights.get("accounts_engaged", None))
                stats["impressions"] = insights.get("impressions", insights.get("profile_visits", None))
                stats["saves"] = insights.get("saves", stats.get("saves", 0))
    except Exception as e:
        print(f"⚠ Gönderi {media.code} için insights alınamadı (Business/Creator hesabı gerekebilir): {str(e)}")
    
    return stats

def main():
    """
    Ana fonksiyon: Instagram istatistiklerini çeker ve JSON dosyasına kaydeder.
    """
    try:
        # .env dosyasından bilgileri oku
        username = os.getenv("INSTAGRAM_USERNAME")
        password = os.getenv("INSTAGRAM_PASSWORD")
        
        if not username or not password:
            raise Exception("INSTAGRAM_USERNAME ve INSTAGRAM_PASSWORD .env dosyasında tanımlı olmalıdır!")
        
        print("=" * 50)
        print("Instagram İstatistik Çekme Scripti")
        print("=" * 50)
        print(f"Kullanıcı: {username}")
        print("-" * 50)
        
        # Giriş yap
        cl = login_to_instagram(username, password)
        
        # Son 5 gönderiyi çek
        media_list = get_user_media(cl, username, limit=5)
        
        if not media_list or len(media_list) == 0:
            print("\n⚠ Hiç gönderi bulunamadı!")
            print("Bu durum şu nedenlerden kaynaklanabilir:")
            print("1. Hesapta gönderi yok")
            print("2. Instagram API'si değişmiş olabilir")
            print("3. Hesap gizli olabilir")
            print("\nTemel kullanıcı bilgilerini çekmeyi deniyoruz...")
            
            # En azından kullanıcı bilgilerini çek
            try:
                user_info = cl.user_info_by_username(username)
                results = [{
                    "username": username,
                    "follower_count": getattr(user_info, 'follower_count', None),
                    "following_count": getattr(user_info, 'following_count', None),
                    "media_count": getattr(user_info, 'media_count', None),
                    "note": "Gönderiler çekilemedi, sadece kullanıcı bilgileri alındı"
                }]
            except Exception as e:
                print(f"⚠ Kullanıcı bilgileri de alınamadı: {str(e)}")
                results = []
        else:
            # Her gönderi için istatistikleri çek
            results = []
            print("\nGönderiler işleniyor...")
            print("-" * 50)
            
            for i, media in enumerate(media_list, 1):
                try:
                    media_code = getattr(media, 'code', getattr(media, 'shortcode', f"post_{i}"))
                    print(f"[{i}/{len(media_list)}] Gönderi işleniyor: {media_code}")
                    stats = extract_media_stats(cl, media)
                    results.append(stats)
                    print(f"  ✓ Beğeni: {stats['likes']}, Yorum: {stats['comments']}, Kaydedilme: {stats['saves']}")
                except Exception as e:
                    print(f"  ✗ Hata: {str(e)[:100]}")
                    try:
                        media_id = getattr(media, 'pk', getattr(media, 'id', f"unknown_{i}"))
                        media_code = getattr(media, 'code', getattr(media, 'shortcode', f"post_{i}"))
                        results.append({
                            "media_id": media_id,
                            "shortcode": media_code,
                            "url": f"https://www.instagram.com/p/{media_code}/" if media_code else None,
                            "error": str(e)[:200]
                        })
                    except:
                        results.append({
                            "error": f"Gönderi {i} işlenemedi: {str(e)[:200]}"
                        })
        
        # Sonuçları JSON dosyasına kaydet
        output_data = {
            "username": username,
            "scraped_at": datetime.now().isoformat(),
            "total_posts": len(results),
            "posts": results
        }
        
        output_file = "sonuc.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print("\n" + "=" * 50)
        print(f"✓ İşlem tamamlandı! Sonuçlar '{output_file}' dosyasına kaydedildi.")
        print("=" * 50)
        
        # Özet bilgileri göster
        total_likes = sum(post.get("likes", 0) for post in results)
        total_comments = sum(post.get("comments", 0) for post in results)
        total_saves = sum(post.get("saves", 0) for post in results)
        
        print(f"\nÖzet:")
        print(f"  Toplam Beğeni: {total_likes}")
        print(f"  Toplam Yorum: {total_comments}")
        print(f"  Toplam Kaydedilme: {total_saves}")
        
    except Exception as e:
        print(f"\n✗ HATA: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

