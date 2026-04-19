import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ title: string }>
}

/**
 * /community/media/[title] → /contents/[title] 리다이렉트
 * 기존 community/media 페이지를 /contents/[name]으로 이관
 */
export default async function MediaPilgrimagePage({ params }: PageProps) {
  const { title } = await params
  redirect(`/contents/${title}`)
}
