import { redirect } from 'next/navigation'

export default async function VoiceActorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Seslendirmen detay sayfasını ekip detay sayfasına yönlendir
  redirect(`/team/${params.id}`)
}
