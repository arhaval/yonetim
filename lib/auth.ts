import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

export async function getUserByEmail(email: string) {
  // Email'i normalize et (küçük harfe çevir ve trim yap)
  const normalizedEmail = email.toLowerCase().trim()
  
  return prisma.user.findUnique({
    where: { email: normalizedEmail },
  })
}

export async function getStreamerByEmail(email: string) {
  // Email'i normalize et (case-insensitive arama için)
  const normalizedEmail = email.toLowerCase().trim()
  
  return prisma.streamer.findUnique({
    where: { email: normalizedEmail },
  })
}

export async function getContentCreatorByEmail(email: string) {
  // Email'i normalize et (case-insensitive arama için)
  const normalizedEmail = email.toLowerCase().trim()
  
  // PostgreSQL'de case-insensitive arama için raw query kullan
  // veya tüm creator'ları çekip filtrele (PostgreSQL'de de case-sensitive olabilir)
  try {
    // Önce exact match dene (normalize edilmiş email ile)
    const exactMatch = await prisma.contentCreator.findUnique({
      where: { email: normalizedEmail },
    })
    
    if (exactMatch) {
      return exactMatch
    }
    
    // Eğer bulamazsak, tüm creator'ları çekip JavaScript'te filtrele
    // (PostgreSQL'de email unique constraint case-sensitive olabilir)
    const allCreators = await prisma.contentCreator.findMany({
      where: { email: { not: null } },
    })
    
    // Normalize edilmiş email ile karşılaştır
    const creator = allCreators.find(
      c => c.email && c.email.toLowerCase().trim() === normalizedEmail
    )
    
    return creator || null
  } catch (error) {
    console.error('Error in getContentCreatorByEmail:', error)
    // Fallback: tüm creator'ları çekip filtrele
    const allCreators = await prisma.contentCreator.findMany({
      where: { email: { not: null } },
    })
    
    const creator = allCreators.find(
      c => c.email && c.email.toLowerCase().trim() === normalizedEmail
    )
    
    return creator || null
  }
}

export async function getVoiceActorByEmail(email: string) {
  // Email'i normalize et (case-insensitive arama için)
  const normalizedEmail = email.toLowerCase().trim()
  
  // SQLite'da case-insensitive arama için önce exact match deneyelim
  // Eğer bulamazsak, tüm seslendirmenleri çekip JavaScript'te filtreleyelim
  const voiceActor = await prisma.voiceActor.findUnique({
    where: { email: normalizedEmail },
  })
  
  if (voiceActor) {
    return voiceActor
  }
  
  // Eğer exact match bulamazsak, tüm seslendirmenleri çekip filtrele
  // (Eski kayıtlar için - yeni kayıtlar zaten normalize edilmiş olacak)
  const allVoiceActors = await prisma.voiceActor.findMany({
    where: { email: { not: null } },
  })
  
  return allVoiceActors.find(
    va => va.email && va.email.toLowerCase().trim() === normalizedEmail
  ) || null
}

export async function getTeamMemberByEmail(email: string) {
  // Email'i normalize et (case-insensitive arama için)
  const normalizedEmail = email.toLowerCase().trim()
  
  // SQLite'da case-insensitive arama için önce exact match deneyelim
  return prisma.teamMember.findUnique({
    where: { email: normalizedEmail },
  })
}
