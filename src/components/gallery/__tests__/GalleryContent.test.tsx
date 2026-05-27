/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { GalleryContent } from '../GalleryContent'
import { CheckIn } from '@/types'

const sampleCheckIn: CheckIn = {
  id: 'CHECKIN-001',
  spotId: 'spot-1',
  userId: 'user-1',
  userName: '테스터',
  photoUrl: 'https://example.com/checkin.jpg',
  visitedAt: new Date('2026-05-01T00:00:00.000Z'),
  likeCount: 3,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
}

jest.mock('../FeedTab', () => ({
  FeedTab: ({
    onCheckInClick,
  }: {
    onCheckInClick: (checkIn: CheckIn) => void
  }) => (
    <button type="button" onClick={() => onCheckInClick(sampleCheckIn)}>
      feed-open
    </button>
  ),
}))

jest.mock('../HallOfFameTab', () => ({
  HallOfFameTab: ({
    onCheckInClick,
  }: {
    onCheckInClick: (checkInId: string) => void
  }) => (
    <button type="button" onClick={() => onCheckInClick('CHECKIN-777')}>
      hall-open
    </button>
  ),
}))

jest.mock('../ContentTab', () => ({
  ContentTab: () => <div>content-tab</div>,
}))

jest.mock('@/components/checkin/CheckInDetailModal', () => ({
  CheckInDetailModal: ({
    checkIn,
    checkInId,
    onClose,
  }: {
    checkIn?: CheckIn
    checkInId?: string
    onClose: () => void
  }) => (
    <div>
      <div data-testid="detail-props">{checkIn?.id ?? checkInId}</div>
      <button type="button" onClick={onClose}>
        close-modal
      </button>
    </div>
  ),
}))

describe('GalleryContent', () => {
  test('opens the detail modal with full check-in data from the feed tab', () => {
    render(<GalleryContent activeTab="feed" />)

    fireEvent.click(screen.getByRole('button', { name: 'feed-open' }))

    expect(screen.getByTestId('detail-props')).toHaveTextContent('CHECKIN-001')
  })

  test('opens the detail modal with checkInId from hall of fame and closes it', () => {
    render(<GalleryContent activeTab="hall-of-fame" />)

    fireEvent.click(screen.getByRole('button', { name: 'hall-open' }))
    expect(screen.getByTestId('detail-props')).toHaveTextContent('CHECKIN-777')

    fireEvent.click(screen.getByRole('button', { name: 'close-modal' }))
    expect(screen.queryByTestId('detail-props')).not.toBeInTheDocument()
  })
})
