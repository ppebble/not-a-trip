import { Metadata } from 'next'
import { ContentListClient } from '@/components/content/ContentListClient'
import { fetchDiscoverableContents } from '@/lib/content-list'
import {
  DEFAULT_SEO_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getDefaultOgImage,
} from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '콘텐츠 탐색',
  description:
    '애니메이션, 게임, 아티스트 콘텐츠를 탐색하고 관련 성지순례 스팟을 찾아보세요.',
  keywords: ['콘텐츠 탐색', '작품별 성지순례', ...DEFAULT_SEO_KEYWORDS],
  alternates: {
    canonical: getCanonicalUrl('/contents'),
  },
  openGraph: {
    title: `콘텐츠 탐색 | ${SITE_NAME}`,
    description:
      '애니메이션, 게임, 아티스트 콘텐츠를 탐색하고 관련 성지순례 스팟을 찾아보세요.',
    url: getCanonicalUrl('/contents'),
    type: 'website',
    siteName: SITE_NAME,
    images: [getDefaultOgImage()],
  },
}

export default async function ContentsPage() {
  const initialContents = await fetchDiscoverableContents()

  return <ContentListClient initialContents={initialContents} />
}
