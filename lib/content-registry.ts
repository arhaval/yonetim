/**
 * İçerik Kayıt Sistemi - Helper Fonksiyonları
 * 
 * Bu modül, içerikleri editör, ses ve üretici arasında bağlayan
 * içerik kayıt sisteminin yardımcı fonksiyonlarını içerir.
 */

// Durum türleri
export type ContentRegistryStatus =
  | 'DRAFT'        // Taslak - henüz başlanmadı
  | 'SCRIPT_READY' // Metin hazır - seslendirme bekliyor
  | 'VOICE_READY'  // Ses hazır - kurgu bekliyor
  | 'EDITING'      // Kurgu aşamasında
  | 'REVIEW'       // İnceleme bekliyor
  | 'PUBLISHED'    // Yayınlandı
  | 'ARCHIVED'     // Arşivlendi

// Durum bilgileri
export const STATUS_INFO: Record<ContentRegistryStatus, {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}> = {
  DRAFT: {
    label: 'Taslak',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'İçerik henüz başlanmadı',
    icon: '📝',
  },
  SCRIPT_READY: {
    label: 'Metin Hazır',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Metin hazır, seslendirme bekliyor',
    icon: '📄',
  },
  VOICE_READY: {
    label: 'Ses Hazır',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Ses hazır, kurgu bekliyor',
    icon: '🎙️',
  },
  EDITING: {
    label: 'Kurgu',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Kurgu aşamasında',
    icon: '🎬',
  },
  REVIEW: {
    label: 'İnceleme',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'İnceleme bekliyor',
    icon: '👀',
  },
  PUBLISHED: {
    label: 'Yayınlandı',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'İçerik yayınlandı',
    icon: '✅',
  },
  ARCHIVED: {
    label: 'Arşiv',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    description: 'İçerik arşivlendi',
    icon: '📦',
  },
}

// Durum geçişleri
export const STATUS_TRANSITIONS: Record<ContentRegistryStatus, ContentRegistryStatus[]> = {
  DRAFT: ['SCRIPT_READY', 'ARCHIVED'],
  SCRIPT_READY: ['VOICE_READY', 'DRAFT', 'ARCHIVED'],
  VOICE_READY: ['EDITING', 'SCRIPT_READY', 'ARCHIVED'],
  EDITING: ['REVIEW', 'VOICE_READY', 'ARCHIVED'],
  REVIEW: ['PUBLISHED', 'EDITING', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'],
}

// Platform seçenekleri
export const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'twitch', label: 'Twitch', icon: '🎮' },
  { value: 'other', label: 'Diğer', icon: '🌐' },
]

// İçerik türü seçenekleri
export const CONTENT_TYPES = [
  { value: 'uzun', label: 'Uzun Video', description: '10+ dakika' },
  { value: 'kisa', label: 'Kısa Video', description: '1-10 dakika' },
  { value: 'reels', label: 'Reels/Shorts', description: '60 saniyeye kadar' },
  { value: 'podcast', label: 'Podcast', description: 'Ses içeriği' },
  { value: 'canli', label: 'Canlı Yayın', description: 'Stream içeriği' },
]

/**
 * Durum bilgisini al
 */
export function getStatusInfo(status: ContentRegistryStatus) {
  return STATUS_INFO[status] || STATUS_INFO.DRAFT
}

/**
 * Durumdan geçilebilecek durumları al
 */
export function getAllowedTransitions(currentStatus: ContentRegistryStatus): ContentRegistryStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Durum geçişinin geçerli olup olmadığını kontrol et
 */
export function isValidTransition(
  currentStatus: ContentRegistryStatus,
  newStatus: ContentRegistryStatus
): boolean {
  const allowed = getAllowedTransitions(currentStatus)
  return allowed.includes(newStatus)
}

/**
 * Platform bilgisini al
 */
export function getPlatformInfo(platform: string) {
  return PLATFORMS.find(p => p.value === platform) || { value: platform, label: platform, icon: '🌐' }
}

/**
 * İçerik türü bilgisini al
 */
export function getContentTypeInfo(contentType: string) {
  return CONTENT_TYPES.find(t => t.value === contentType) || { value: contentType, label: contentType, description: '' }
}

/**
 * İçerik kaydının tamamlanma yüzdesini hesapla
 */
export function calculateProgress(registry: {
  status: ContentRegistryStatus
  scriptLink?: string | null
  voiceLink?: string | null
  editLink?: string | null
  finalLink?: string | null
  creatorId?: string | null
  voiceActorId?: string | null
  editorId?: string | null
}): number {
  let progress = 0
  const steps = 7 // Toplam adım sayısı

  // Durum bazlı ilerleme
  const statusProgress: Record<ContentRegistryStatus, number> = {
    DRAFT: 0,
    SCRIPT_READY: 1,
    VOICE_READY: 2,
    EDITING: 3,
    REVIEW: 4,
    PUBLISHED: 5,
    ARCHIVED: 5,
  }
  progress += statusProgress[registry.status] || 0

  // Atama bazlı ilerleme
  if (registry.creatorId) progress += 0.3
  if (registry.voiceActorId) progress += 0.3
  if (registry.editorId) progress += 0.4

  // Link bazlı ilerleme (bonus)
  if (registry.scriptLink) progress += 0.2
  if (registry.voiceLink) progress += 0.2
  if (registry.editLink) progress += 0.2
  if (registry.finalLink) progress += 0.4

  return Math.min(Math.round((progress / steps) * 100), 100)
}

/**
 * Sonraki adımı belirle
 */
export function getNextStep(registry: {
  status: ContentRegistryStatus
  creatorId?: string | null
  voiceActorId?: string | null
  editorId?: string | null
  scriptLink?: string | null
  voiceLink?: string | null
}): {
  action: string
  assignee: 'creator' | 'voiceActor' | 'editor' | 'admin'
  description: string
} | null {
  switch (registry.status) {
    case 'DRAFT':
      if (!registry.creatorId) {
        return {
          action: 'İçerik üreticisi ata',
          assignee: 'admin',
          description: 'Bir içerik üreticisi atanmalı',
        }
      }
      return {
        action: 'Metin hazırla',
        assignee: 'creator',
        description: 'İçerik üreticisi metni hazırlamalı',
      }

    case 'SCRIPT_READY':
      if (!registry.voiceActorId) {
        return {
          action: 'Seslendirmen ata',
          assignee: 'admin',
          description: 'Bir seslendirmen atanmalı',
        }
      }
      return {
        action: 'Seslendirme yap',
        assignee: 'voiceActor',
        description: 'Seslendirmen sesi kaydetmeli',
      }

    case 'VOICE_READY':
      if (!registry.editorId) {
        return {
          action: 'Editör ata',
          assignee: 'admin',
          description: 'Bir editör atanmalı',
        }
      }
      return {
        action: 'Kurgu başlat',
        assignee: 'editor',
        description: 'Editör kurguya başlamalı',
      }

    case 'EDITING':
      return {
        action: 'Kurguyu tamamla',
        assignee: 'editor',
        description: 'Editör kurguyu tamamlamalı',
      }

    case 'REVIEW':
      return {
        action: 'İncele ve onayla',
        assignee: 'admin',
        description: 'Admin içeriği incelemeli ve onaylamalı',
      }

    case 'PUBLISHED':
    case 'ARCHIVED':
      return null

    default:
      return null
  }
}

/**
 * Deadline durumunu kontrol et
 */
export function checkDeadlineStatus(deadline: Date | null): {
  status: 'ok' | 'warning' | 'overdue' | 'none'
  daysLeft: number | null
  message: string
} {
  if (!deadline) {
    return { status: 'none', daysLeft: null, message: 'Deadline belirlenmemiş' }
  }

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      status: 'overdue',
      daysLeft: diffDays,
      message: `${Math.abs(diffDays)} gün gecikmiş`,
    }
  }

  if (diffDays <= 2) {
    return {
      status: 'warning',
      daysLeft: diffDays,
      message: diffDays === 0 ? 'Bugün!' : `${diffDays} gün kaldı`,
    }
  }

  return {
    status: 'ok',
    daysLeft: diffDays,
    message: `${diffDays} gün kaldı`,
  }
}

