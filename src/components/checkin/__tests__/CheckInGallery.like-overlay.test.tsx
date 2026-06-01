/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import { CheckIn } from '@/types'
import { CheckInGallery } from '../CheckInGallery'

let mockCheckins: CheckIn[] = []

jest.mock('@/hooks/useGalleryQueries', () => ({
  useCheckInGallery: () => ({
    data: {
      checkins: mockCheckins,
      total: mockCheckins.length,
      page: 1,
      limit: 12,
    },
    isLoading: false,
  }),
}))

jest.mock('@/lib/device-id', () => ({
  getDeviceId: () => 'device-1',
}))

jest.mock('../CheckInDetailModal', () => ({
  CheckInDetailModal: () => <div data-testid="checkin-detail-modal" />,
}))

jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockImage({ fill: _fill, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

function createCheckIn(id: string, likeCount: number): CheckIn {
  return {
    id,
    spotId: `spot-${id}`,
    userId: `user-${id}`,
    userName: `사용자 ${id}`,
    photoUrl: `https://example.com/${id}.jpg`,
    visitedAt: new Date('2026-05-01T00:00:00.000Z'),
    likeCount,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
  }
}

describe('CheckInGallery like overlay', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = fetchMock as never
    mockCheckins = [
      createCheckIn('CHECKIN-001', 7),
      createCheckIn('CHECKIN-002', 2),
    ]
    fetchMock.mockImplementation((input: string) =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          liked: input.includes('CHECKIN-001'),
          likeCount: input.includes('CHECKIN-001') ? 7 : 2,
        }),
      })
    )
  })

  afterEach(() => {
    mockCheckins = []
  })

  test('uses filled and outline heart icons from viewer like state', async () => {
    render(<CheckInGallery />)

    await waitFor(() => {
      expect(
        screen.getByTestId('checkin-like-indicator-CHECKIN-001')
      ).toHaveAttribute('data-liked', 'true')
      expect(
        screen.getByTestId('checkin-like-indicator-CHECKIN-002')
      ).toHaveAttribute('data-liked', 'false')
    })

    expect(screen.queryByText('❤️')).not.toBeInTheDocument()
    expect(screen.queryByText('♡')).not.toBeInTheDocument()
  })
})
