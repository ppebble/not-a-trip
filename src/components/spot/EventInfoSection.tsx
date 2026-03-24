'use client'

import { ExternalLink, SECTION_HEADERS, SECTION_ICONS } from '@/types'
import { ExternalLinkCard } from './ExternalLinkCard'

/**
 * EventInfoSection 컴포넌트 Props
 */
interface EventInfoSectionProps {
  /** 스팟 ID */
  spotId: string
  /** 카테고리 (sports, music, game) */
  category: 'sports' | 'music' | 'game'
  /** 외부 링크 목록 */
  externalLinks: ExternalLink[]
}

/**
 * EventInfoSection 컴포넌트
 *
 * 스포츠/음악 카테고리용 이벤트 정보 섹션입니다.
 * 외부 링크 카드를 그리드 레이아웃으로 표시합니다.
 *
 * Requirements:
 * - 3.1: 공식 일정 페이지 외부 링크 표시
 * - 3.2: 티켓 예매 사이트 외부 링크 표시
 * - 5.2: 카테고리별 헤더 텍스트 (경기 일정/공연 정보)
 * - 5.4: 빈 상태 메시지 표시
 */
export function EventInfoSection({
  category,
  externalLinks,
}: EventInfoSectionProps) {
  // 카테고리별 헤더 텍스트
  const headerText = SECTION_HEADERS.events[category] || '이벤트 정보'
  const headerIcon = SECTION_ICONS.events

  // 카테고리별 빈 상태 메시지
  const emptyMessages: Record<string, { title: string; description: string }> =
    {
      sports: {
        title: '등록된 경기 정보가 없습니다',
        description: '공식 홈페이지나 티켓 예매 링크를 추가해보세요!',
      },
      music: {
        title: '등록된 공연 정보가 없습니다',
        description: '공연장 홈페이지나 예매 링크를 추가해보세요!',
      },
      game: {
        title: '등록된 e스포츠 정보가 없습니다',
        description: '대회 일정이나 스트리밍 링크를 추가해보세요!',
      },
    }

  const emptyMessage = emptyMessages[category] || emptyMessages.sports

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">{headerIcon}</span>
          <h2 className="text-2xl font-bold text-gray-900">{headerText}</h2>
        </div>

        {/* 설명 텍스트 */}
        <p className="mb-4 text-sm text-gray-500">
          {category === 'sports' &&
            '경기 일정 확인 및 티켓 예매를 위한 링크입니다.'}
          {category === 'music' &&
            '공연 일정 확인 및 티켓 예매를 위한 링크입니다.'}
          {category === 'game' && 'e스포츠 대회 일정 및 관련 정보 링크입니다.'}
        </p>

        {/* 외부 링크 그리드 또는 빈 상태 */}
        {externalLinks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {externalLinks.map((link) => (
              <ExternalLinkCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-3 text-3xl">📅</div>
            <p className="text-gray-600">{emptyMessage.title}</p>
            <p className="mt-1 text-sm text-gray-500">
              {emptyMessage.description}
            </p>
          </div>
        )}

        {/* 팁 메시지 */}
        {externalLinks.length > 0 && (
          <div className="bg-navy-50 mt-6 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="text-navy-800 text-sm font-medium">팁</p>
                <p className="text-navy-600 text-sm">
                  {category === 'sports' &&
                    '경기 당일은 혼잡할 수 있으니 미리 예매하세요!'}
                  {category === 'music' &&
                    '인기 공연은 빠르게 매진되니 예매 일정을 확인하세요!'}
                  {category === 'game' &&
                    '대회 일정에 맞춰 방문하면 특별한 경험을 할 수 있어요!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
