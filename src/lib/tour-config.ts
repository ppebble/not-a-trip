import type { TourStep } from '@/hooks/useOnboarding'

export const MAP_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="category-filter"]',
    title: '🎯 카테고리 필터',
    description:
      '애니메이션, 영화/드라마, 스포츠 등 원하는 카테고리를 선택하면 해당 스팟만 지도에 표시됩니다. 여러 카테고리를 동시에 선택할 수도 있어요!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="search-input"]',
    title: '🔍 스팟 검색',
    description:
      '작품명(예: 봇치 더 록), 장소명, 아티스트명으로 검색하면 관련 스팟을 빠르게 찾을 수 있어요. 입력하면 자동완성 추천이 나타납니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="map-marker"]',
    title: '📍 지도 탐색',
    description:
      '지도 위의 마커를 클릭하면 스팟의 상세 정보를 확인할 수 있어요. 사진, 작품 속 장면, 주변 편의시설 정보까지 한눈에 볼 수 있습니다.',
    placement: 'top',
  },
]

export const ROUTE_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="start-route"]',
    title: '🗺️ 나만의 순례 코스 만들기',
    description:
      '여기서 새로운 순례 코스를 만들 수 있어요! 좋아하는 스팟들을 모아 나만의 코스를 구성하고, 다른 순례자들과 공유해보세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="route-content"]',
    title: '📋 코스 둘러보기',
    description:
      '공식 추천 코스, 인기 코스, 전체 코스 목록에서 관심 있는 코스를 선택해보세요. 코스를 클릭하면 상세 정보와 스팟 순서를 확인할 수 있어요.',
    placement: 'top',
  },
]

export const ROUTE_DETAIL_STEPS: TourStep[] = [
  {
    target: '[data-tour="route-start-btn"]',
    title: '🚀 코스 시작하기',
    description:
      '이 버튼을 누르면 가이드 모드가 시작됩니다! 각 스팟을 순서대로 방문하며 GPS 기반 인증을 할 수 있어요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="route-spot-list"]',
    title: '📍 스팟 순서 확인',
    description:
      '코스에 포함된 스팟들의 순서와 이동 거리/시간을 확인할 수 있어요. 코스 시작 후에는 각 스팟에서 인증하기 버튼이 활성화됩니다.',
    placement: 'top',
  },
]

export const GALLERY_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="upload-checkin"]',
    title: '📸 순례 인증하기',
    description:
      '성지순례 스팟에 방문했다면 이 버튼을 눌러 인증샷을 업로드해보세요! GPS로 위치를 확인하고, 인증 뱃지도 획득할 수 있어요.',
    placement: 'top',
  },
]
