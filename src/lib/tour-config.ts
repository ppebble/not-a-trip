import type { TourStep } from '@/hooks/useOnboarding'

export const MAP_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="category-filter"]',
    title: '카테고리 필터',
    description: '원하는 카테고리를 선택하여 스팟을 필터링할 수 있어요',
    placement: 'bottom',
  },
  {
    target: '[data-tour="search-input"]',
    title: '스팟 검색',
    description: '작품명이나 장소명으로 스팟을 검색해보세요',
    placement: 'bottom',
  },
  {
    target: '[data-tour="map-marker"]',
    title: '마커 클릭',
    description: '지도의 마커를 클릭하면 스팟 상세 정보를 볼 수 있어요',
    placement: 'top',
  },
]

export const ROUTE_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="start-route"]',
    title: '코스 시작',
    description: '코스 시작 버튼을 누르면 가이드 모드가 시작됩니다',
    placement: 'top',
  },
]

export const GALLERY_PAGE_STEPS: TourStep[] = [
  {
    target: '[data-tour="upload-checkin"]',
    title: '인증샷 업로드',
    description: '스팟에서 찍은 인증샷을 업로드하고 공유해보세요',
    placement: 'bottom',
  },
]

export const ROUTE_DETAIL_STEPS: TourStep[] = [
  {
    target: '[data-tour="route-map"]',
    title: '코스 지도',
    description: '코스에 포함된 스팟들의 위치를 지도에서 확인할 수 있어요',
    placement: 'bottom',
  },
  {
    target: '[data-tour="start-route-btn"]',
    title: '코스 시작',
    description: '코스 시작 버튼을 누르면 순서대로 스팟을 방문할 수 있어요',
    placement: 'top',
  },
  {
    target: '[data-tour="route-spots"]',
    title: '코스 순서',
    description: '코스에 포함된 스팟 목록을 순서대로 확인해보세요',
    placement: 'top',
  },
]
