import { Metadata } from 'next'
import { ContentListClient } from '@/components/content/ContentListClient'
import { fetchDiscoverableContents } from '@/lib/content-list'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '콘텐츠 탐색 | Not a Trip',
  description:
    '애니메이션, 게임, 아티스트 콘텐츠를 탐색하고 관련 성지순례 스팟을 찾아보세요.',
}

export default async function ContentsPage() {
  const initialContents = await fetchDiscoverableContents()

  return <ContentListClient initialContents={initialContents} />
}
