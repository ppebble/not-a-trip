'use client'

import { useState } from 'react'
import { RelatedContentSection } from '@/components/spot/RelatedContentSection'
import { RelatedContent } from '@/types'

// 테스트용 샘플 데이터
const SAMPLE_CONTENTS: RelatedContent[] = [
  {
    name: '청춘 돼지는 바니걸 선배의 꿈을 꾸지 않는다',
    type: 'anime',
    year: 2018,
    additionalInfo: '시즌 1',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1301/93586.jpg',
  },
  {
    name: '도쿄구울',
    type: 'anime',
    year: 2014,
    additionalInfo: '시즌 1',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/5/64449.jpg',
  },
  { name: '원피스', type: 'anime', year: 1999 },
  { name: '너의 이름은', type: 'movie', year: 2016 },
  { name: 'FC 도쿄', type: 'sports_team', additionalInfo: 'J리그' },
  { name: 'YOASOBI', type: 'artist', year: 2019 },
  { name: '페르소나 5', type: 'game', year: 2016 },
]

export default function RelatedContentSectionTestPage() {
  const [contentCount, setContentCount] = useState(6)

  const displayContents = SAMPLE_CONTENTS.slice(0, contentCount)

  return (
    <div className="min-h-screen bg-navy-50 p-8 pt-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold text-navy-800">
          🧪 RelatedContentSection 테스트
        </h1>
        <p className="mb-6 text-sm text-navy-500">
          스팟 상세 페이지의 관련 콘텐츠 섹션 컴포넌트 테스트
        </p>

        {/* 컨트롤 패널 */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-medium text-navy-700">테스트 컨트롤</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContentCount(0)}
              className={`rounded px-3 py-1.5 text-sm ${contentCount === 0 ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
            >
              0개 (빈 배열)
            </button>
            <button
              onClick={() => setContentCount(1)}
              className={`rounded px-3 py-1.5 text-sm ${contentCount === 1 ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
            >
              1개
            </button>
            <button
              onClick={() => setContentCount(3)}
              className={`rounded px-3 py-1.5 text-sm ${contentCount === 3 ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
            >
              3개 (기본 표시)
            </button>
            <button
              onClick={() => setContentCount(4)}
              className={`rounded px-3 py-1.5 text-sm ${contentCount === 4 ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
            >
              4개 (더보기 표시)
            </button>
            <button
              onClick={() => setContentCount(7)}
              className={`rounded px-3 py-1.5 text-sm ${contentCount === 7 ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
            >
              7개 (전체)
            </button>
          </div>
          <p className="mt-3 text-sm text-navy-500">
            현재 콘텐츠 수: <strong>{contentCount}개</strong>
            {contentCount > 3 && ` (더보기: +${contentCount - 3})`}
          </p>
        </div>

        {/* 테스트 케이스 설명 */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-800">테스트 케이스</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>
              • <strong>0개:</strong> 섹션이 완전히 숨겨져야 함 (Req 6.2)
            </li>
            <li>
              • <strong>1~3개:</strong> 모든 콘텐츠 표시, 더보기 버튼 없음
            </li>
            <li>
              • <strong>4개 이상:</strong> 3개만 표시, 더보기 버튼 표시 (Req
              3.2)
            </li>
            <li>
              • <strong>더보기 클릭:</strong> 모든 콘텐츠 표시 (Req 3.3)
            </li>
          </ul>
        </div>

        {/* RelatedContentSection 컴포넌트 */}
        {contentCount === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-navy-200 p-8 text-center text-navy-400">
            빈 배열 - 섹션이 렌더링되지 않음 ✅
          </div>
        ) : (
          <RelatedContentSection contents={displayContents} />
        )}
      </div>
    </div>
  )
}
