'use client'

import { SpotCategory, CATEGORY_SECTIONS, ExternalLink } from '@/types'
import SceneGallery from './SceneGallery'
import { EventInfoSection } from './EventInfoSection'

/**
 * SpotContentSection 컴포넌트 Props
 */
interface SpotContentSectionProps {
  /** 스팟 ID */
  spotId: string
  /** 스팟 카테고리 */
  category: SpotCategory
  /** 외부 링크 목록 (이벤트 섹션용) */
  externalLinks?: ExternalLink[]
}

/**
 * SpotContentSection 컨테이너 컴포넌트
 *
 * 카테고리에 따라 적절한 콘텐츠 섹션을 렌더링합니다.
 * - animation, movie_drama: SceneGallery (작품 속 장면)
 * - sports, music: EventInfoSection (이벤트 정보)
 * - game: 둘 다 표시
 * - other: 일반 정보 (현재는 빈 상태)
 *
 * Requirements:
 * - 1.1: animation/movie_drama → 작품 속 장면 섹션
 * - 1.2: sports/music → 이벤트 정보 섹션
 * - 1.3: game → 둘 다 표시
 * - 1.4: other → 일반 정보 섹션
 */
export function SpotContentSection({
  spotId,
  category,
  externalLinks = [],
}: SpotContentSectionProps) {
  // 카테고리별 표시할 섹션 결정
  const sections = CATEGORY_SECTIONS[category] || ['info']

  // 이벤트 섹션을 표시할 수 있는 카테고리인지 확인
  const isEventCategory = (
    cat: SpotCategory
  ): cat is 'sports' | 'music' | 'game' => {
    return cat === 'sports' || cat === 'music' || cat === 'game'
  }

  return (
    <div className="space-y-6">
      {/* 작품 속 장면 섹션 (scenes) */}
      {sections.includes('scenes') && (
        <SceneGallery spotId={spotId} category={category} />
      )}

      {/* 이벤트 정보 섹션 (events) */}
      {sections.includes('events') && isEventCategory(category) && (
        <EventInfoSection
          spotId={spotId}
          category={category}
          externalLinks={externalLinks}
        />
      )}

      {/* 일반 정보 섹션 (info) - other 카테고리용 */}
      {sections.includes('info') && (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <h2 className="text-2xl font-bold text-gray-900">정보</h2>
            </div>
            <p className="text-sm text-gray-500">
              이 장소에 대한 추가 정보가 곧 제공될 예정입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
