/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import DirectionsButton from '../DirectionsButton'

// --- Mocks ---

// directions 모듈 mock
const mockOpenDirections = jest.fn()
const mockIsKoreanCoordinates = jest.fn()

jest.mock('@/lib/directions', () => ({
  isKoreanCoordinates: (...args: unknown[]) => mockIsKoreanCoordinates(...args),
  openDirections: (...args: unknown[]) => mockOpenDirections(...args),
  detectPlatform: () => 'web' as const,
  generateDirectionsUrls: ({
    destination,
  }: {
    destination: { lat: number; lng: number }
  }) => ({
    google: `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`,
    apple: `maps://maps.apple.com/?daddr=${destination.lat},${destination.lng}`,
    kakao: `kakaomap://route?ep=${destination.lat},${destination.lng}`,
    naver: `nmap://route/walk?dlat=${destination.lat}&dlng=${destination.lng}`,
  }),
}))

// AppIcon mock — Next.js Image 렌더링 이슈 방지
jest.mock('@/components/common/AppIcon', () => ({
  AppIcon: ({ name }: { name: string }) => (
    <span data-testid={`icon-${name}`} />
  ),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

/**
 * Validates: Requirements 2.1
 * 해외 좌표 → 클릭 시 메뉴 없이 Google Maps 열림
 */
describe('DirectionsButton — 해외 좌표 (도쿄 35.6, 139.7)', () => {
  it('클릭 시 openDirections가 Google Maps URL로 호출되고 메뉴가 표시되지 않는다', () => {
    mockIsKoreanCoordinates.mockReturnValue(false)

    render(
      <DirectionsButton lat={35.6} lng={139.7} destinationName="도쿄타워" />
    )

    const button = screen.getByRole('button', { name: '길찾기' })
    fireEvent.click(button)

    // Google Maps URL로 openDirections 호출 확인
    expect(mockOpenDirections).toHaveBeenCalledTimes(1)
    expect(mockOpenDirections).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps/dir')
    )

    // 선택 메뉴가 표시되지 않아야 함
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

/**
 * Validates: Requirements 3.1
 * 국내 좌표 → 클릭 시 선택 메뉴 표시
 */
describe('DirectionsButton — 국내 좌표 (서울 37.5, 127.0)', () => {
  it('클릭 시 지도 앱 선택 메뉴가 표시된다', () => {
    mockIsKoreanCoordinates.mockReturnValue(true)

    render(<DirectionsButton lat={37.5} lng={127.0} destinationName="강남역" />)

    const button = screen.getByRole('button', { name: '길찾기' })
    fireEvent.click(button)

    // openDirections가 호출되지 않아야 함
    expect(mockOpenDirections).not.toHaveBeenCalled()

    // 선택 메뉴가 표시되어야 함
    const menu = screen.getByRole('menu', { name: '지도 앱 선택' })
    expect(menu).toBeInTheDocument()

    // 메뉴 항목 확인 (web 플랫폼이므로 Apple Maps 제외)
    expect(
      screen.getByRole('menuitem', { name: /Google Maps/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /카카오맵/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /네이버 지도/ })
    ).toBeInTheDocument()
  })
})
