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
  return prisma.user.findUnique({
    where: { email },
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
  
  // SQLite case-insensitive arama yapamadığı için tüm creator'ları çekip filtrele
  const allCreators = await prisma.contentCreator.findMany({
    where: { email: { not: null } },
  })
  
  // Normalize edilmiş email ile karşılaştır
  const creator = allCreators.find(
    c => c.email && c.email.toLowerCase().trim() === normalizedEmail
  )
  
  if (creator) {
    return creator
  }
  
  // Eğer bulamazsak, exact match deneyelim (belki veritabanında normalize edilmemiş)
  const exactMatch = await prisma.contentCreator.findUnique({
    where: { email: normalizedEmail },
  })
  
  return exactMatch || null
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
