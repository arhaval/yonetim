import { redirect } from 'next/navigation'

export default async function VoiceActorsPage() {
  // Seslendirmenler artık ekip sayfasında gösteriliyor
  redirect('/team')
}

