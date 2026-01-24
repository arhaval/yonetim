export function getCookie(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  try {
    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1]
    return value
  } catch (error) {
    console.error(`Error reading cookie ${name}:`, error)
    return undefined
  }
}

export function getUserCookies() {
  return {
    userId: getCookie('user-id'),
    voiceActorId: getCookie('voice-actor-id'),
    teamMemberId: getCookie('team-member-id'),
    userRole: getCookie('user-role'),
  }
}
