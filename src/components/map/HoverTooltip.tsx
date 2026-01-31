'use client'

import { Tooltip } from 'react-leaflet'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'

interface HoverTooltipProps {
  spot: SpotPinType
  isVisible: boolean
}

// 카테고리별 아이콘 가져오기
const getCategoryIcon = (category?: SpotCategory): string => {
  if (!category) return '📍'
  return CATEGORY_CONFIG[category]?.icon || '📍'
}

// 카테고리별 라벨 가져오기
const getCategoryLabel = (category?: SpotCategory): string => {
  if (!category) return '기타'
  return CATEGORY_CONFIG[category]?.label || '기타'
}

// 카테고리별 색상 가져오기
const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return '#2d4a6f'
  return CATEGORY_CONFIG[category]?.color || '#2d4a6f'
}

/**
 * 마커 호버 시 표시되는 툴팁 컴포넌트
 * Leaflet Tooltip을 래핑하여 커스텀 스타일 적용
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export default function HoverTooltip({ spot, isVisible }: HoverTooltipProps) {
  if (!isVisible) return null

  const categoryIcon = getCategoryIcon(spot.category)
  const categoryLabel = getCategoryLabel(spot.category)
  const categoryColor = getCategoryColor(spot.category)
  const hasThumbnail = spot.thumbnailUrl && spot.thumbnailUrl.length > 0

  return (
    <Tooltip
      permanent
      direction="top"
      offset={[0, -10]}
      className="hover-tooltip"
    >
      <div className="hover-tooltip-content">
        {/* 썸네일 또는 카테고리 아이콘 */}
        <div className="hover-tooltip-image">
          {hasThumbnail ? (
            <img
              src={spot.thumbnailUrl}
              alt={spot.name}
              className="hover-tooltip-thumbnail"
              onError={(e) => {
                // 이미지 로드 실패 시 카테고리 아이콘으로 대체
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="hover-tooltip-fallback"
            style={{
              display: hasThumbnail ? 'none' : 'flex',
              backgroundColor: categoryColor,
            }}
          >
            <span className="hover-tooltip-fallback-icon">{categoryIcon}</span>
          </div>
        </div>

        {/* 스팟 정보 */}
        <div className="hover-tooltip-info">
          <h4 className="hover-tooltip-name">{spot.name}</h4>
          <div className="hover-tooltip-category">
            <span className="hover-tooltip-category-icon">{categoryIcon}</span>
            <span className="hover-tooltip-category-label">
              {categoryLabel}
            </span>
          </div>
        </div>
      </div>
    </Tooltip>
  )
}
