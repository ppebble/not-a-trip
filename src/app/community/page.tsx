import { redirect } from 'next/navigation'

/**
 * 커뮤니티 페이지 리다이렉트
 * 기존 /community 경로를 /gallery로 리다이렉트하여 하위 호환성 유지
 * Requirements 1.3: THE Gallery_System SHALL redirect requests from `/community` to `/gallery` for backward compatibility
 */
export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 쿼리 파라미터 보존하여 리다이렉트
  const resolvedParams = await searchParams
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === 'string') {
      params.set(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v))
    }
  }

  const queryString = params.toString()
  const redirectUrl = queryString ? `/gallery?${queryString}` : '/gallery'

  redirect(redirectUrl)
}
