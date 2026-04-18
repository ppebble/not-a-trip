import { ContentSpotsClient } from '@/components/content/ContentSpotsClient'

interface ContentSpotsPageProps {
  params: Promise<{ name: string }>
}

/**
 * 작품별 스팟 모아보기 서버 컴포넌트
 * URL의 인코딩된 작품명을 디코딩하여 클라이언트 컴포넌트에 전달
 * Requirements: 4.1
 */
export default async function ContentSpotsPage({
  params,
}: ContentSpotsPageProps) {
  const { name } = await params
  const contentName = decodeURIComponent(name)

  return <ContentSpotsClient contentName={contentName} />
}
