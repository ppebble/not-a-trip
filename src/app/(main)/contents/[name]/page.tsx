import { Metadata } from 'next'
import { ContentHubClient } from '@/components/content/ContentHubClient'
import {
  DEFAULT_SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getDefaultOgImage,
} from '@/lib/seo/metadata'

interface ContentHubPageProps {
  params: Promise<{ name: string }>
}

/**
 * 작품 허브 페이지 메타데이터 생성
 * SEO를 위한 동적 title/description 설정
 */
export async function generateMetadata({
  params,
}: ContentHubPageProps): Promise<Metadata> {
  const { name } = await params
  const contentName = decodeURIComponent(name)
  const canonicalUrl = getCanonicalUrl(
    `/contents/${encodeURIComponent(contentName)}`
  )
  const title = `${contentName} 작품 허브`
  const description = `${contentName} 관련 성지순례 스팟, 코스, 인증 정보를 한눈에 확인하세요.`

  return {
    title,
    description,
    keywords: [
      contentName,
      '작품 허브',
      '작품별 성지순례',
      ...DEFAULT_SEO_KEYWORDS,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: SITE_NAME,
      images: [getDefaultOgImage()],
    },
  }
}

/**
 * 작품 허브 페이지 서버 컴포넌트
 * URL의 인코딩된 작품명을 디코딩하여 ContentHubClient에 전달
 * 뒤로가기 로직은 ContentHubClient 내부에서 처리:
 * - history.length > 1이면 router.back()
 * - 아니면 /contents로 이동
 * - 버튼 레이블: "작품 목록으로"
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export default async function ContentHubPage({ params }: ContentHubPageProps) {
  const { name } = await params
  const contentName = decodeURIComponent(name)

  return <ContentHubClient contentName={contentName} />
}
