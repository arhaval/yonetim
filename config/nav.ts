import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Mic, 
  Video, 
  FileText, 
  DollarSign, 
  CreditCard, 
  BarChart3, 
  Share2,
  Plus,
  LogOut,
  Settings,
  CheckCircle
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export type NavSection = {
  title?: string
  items: NavItem[]
}

export const adminNav: NavSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Yayıncılar', href: '/streamers', icon: Video },
      { title: 'Ekip Üyeleri', href: '/team', icon: Users },
      { title: 'İçerik Üreticileri', href: '/content-creators', icon: FileText },
      { title: 'Seslendirmenler', href: '/voice-actors', icon: Mic },
    ]
  },
  {
    items: [
      { title: 'Yayınlar', href: '/streams', icon: Video },
      { title: 'İçerik Merkezi', href: '/content-production', icon: FileText },
    ]
  },
  {
    items: [
      { title: 'Finansal', href: '/financial', icon: DollarSign },
      { title: 'Ödemeler', href: '/payments', icon: CreditCard },
      { title: 'Raporlar', href: '/reports', icon: BarChart3 },
      { title: 'Sosyal Medya', href: '/social-media', icon: Share2 },
    ]
  }
]

export const streamerNav: NavSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/streamer-dashboard', icon: LayoutDashboard },
      { title: 'Yeni Yayın Ekle', href: '/streamer-dashboard?action=new', icon: Plus },
      { title: 'Ödemelerim', href: '/streamer-dashboard#payments', icon: CreditCard },
    ]
  }
]

export const creatorNav: NavSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/creator-dashboard', icon: LayoutDashboard },
      { title: 'Metin Gönder', href: '/voiceover-scripts/new', icon: Plus },
      { title: 'Gönderilenler', href: '/creator-dashboard#scripts', icon: FileText },
    ]
  }
]

export const voiceActorNav: NavSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/voice-actor-dashboard', icon: LayoutDashboard },
      { title: 'Gelen İşler', href: '/voice-actor-dashboard#pending', icon: FileText },
      { title: 'Teslim Ettiklerim', href: '/voice-actor-dashboard#completed', icon: CheckCircle },
      { title: 'Ödemelerim', href: '/voice-actor-dashboard#payments', icon: CreditCard },
    ]
  }
]

export const teamNav: NavSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/team-dashboard', icon: LayoutDashboard },
      { title: 'Ödemelerim', href: '/team-dashboard#payments', icon: CreditCard },
    ]
  }
]

// Helper to get nav by role
export function getNavByRole(role: 'admin' | 'streamer' | 'creator' | 'voiceActor' | 'team'): NavSection[] {
  switch (role) {
    case 'admin':
      return adminNav
    case 'streamer':
      return streamerNav
    case 'creator':
      return creatorNav
    case 'voiceActor':
      return voiceActorNav
    case 'team':
      return teamNav
    default:
      return []
  }
}

