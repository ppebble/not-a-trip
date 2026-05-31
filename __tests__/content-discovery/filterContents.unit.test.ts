import { filterContents } from '@/components/content/ContentListClient'
import type { ContentListItem } from '@/lib/content-discovery'

const contents: ContentListItem[] = [
  {
    contentName: '주술회전',
    contentType: 'anime',
    spotCount: 3,
    imageUrl: '/jJK.webp',
  },
  {
    contentName: '리그 오브 레전드',
    contentType: 'game',
    spotCount: 2,
    imageUrl: '/lol.webp',
  },
  {
    contentName: 'BTS',
    contentType: 'artist',
    spotCount: 2,
    imageUrl: '/bts.webp',
  },
  {
    contentName: 'FC 바르셀로나',
    contentType: 'sports_team',
    spotCount: 1,
    imageUrl: '/barcelona.webp',
  },
  {
    contentName: '일본 애니메이션 역사',
    contentType: 'anime',
    spotCount: 1,
    imageUrl: '/anime-history.webp',
  },
]

describe('filterContents', () => {
  it('콘텐츠 탐색 대상이 아닌 스포츠팀을 제외한다', () => {
    const result = filterContents(contents, 'all', '')

    expect(result.map((item) => item.contentName)).toEqual([
      '주술회전',
      '리그 오브 레전드',
      'BTS',
    ])
  })

  it('작품이 아닌 주제형 애니메이션 항목을 제외한다', () => {
    const result = filterContents(contents, 'anime', '')

    expect(result.map((item) => item.contentName)).toEqual(['주술회전'])
  })

  it('탐색 대상 타입 필터와 검색어를 함께 적용한다', () => {
    const result = filterContents(contents, 'game', '리그')

    expect(result).toEqual([contents[1]])
  })
})
