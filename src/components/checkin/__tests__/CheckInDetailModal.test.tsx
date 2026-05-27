/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { CheckIn } from '@/types'
import { CheckInDetailModal } from '../CheckInDetailModal'

jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockImage({ fill: _fill, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

jest.mock('next/link', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockLink(props: any) {
    return <a {...props} />
  }
})

jest.mock('../ComparisonViewer', () => ({
  ComparisonViewer: ({ userPhotoUrl }: { userPhotoUrl: string }) => (
    <div data-testid="comparison-viewer">{userPhotoUrl}</div>
  ),
}))

const baseCheckIn: CheckIn = {
  id: 'CHECKIN-001',
  spotId: 'spot-1',
  userId: 'user-1',
  userName: '테스터',
  photoUrl: 'https://example.com/checkin.jpg',
  visitedAt: new Date('2026-05-01T00:00:00.000Z'),
  comment: '멋진 장소였어요',
  likeCount: 5,
  contentName: '슬램덩크',
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
}

describe('CheckInDetailModal', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = fetchMock as never
    fetchMock.mockImplementation((input: string) => {
      if (input.includes('/api/spots/spot-1/courses')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            courses: [{ id: 'route-1', name: '서울 코스' }],
          }),
        })
      }

      if (input.includes('/api/spots/spot-1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ name: '서울타워' }),
        })
      }

      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'not found' }),
      })
    })
  })

  test('renders immediately when a full check-in object is provided', async () => {
    render(<CheckInDetailModal checkIn={baseCheckIn} onClose={jest.fn()} />)

    expect(
      screen.getByRole('dialog', { name: '인증 상세 보기' })
    ).toBeInTheDocument()
    expect(screen.getByText('테스터')).toBeInTheDocument()
    expect(screen.getByText('멋진 장소였어요')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('📍 서울타워')).toBeInTheDocument()
      expect(screen.getByText('🎬 슬램덩크')).toBeInTheDocument()
      expect(screen.getByText('🗺️ 서울 코스')).toBeInTheDocument()
    })

    expect(fetchMock).not.toHaveBeenCalledWith('/api/checkins/CHECKIN-001')
  })

  test('loads check-in detail by id and supports retry after an error', async () => {
    fetchMock.mockReset()
    fetchMock
      .mockImplementationOnce(async () => ({
        ok: false,
        json: async () => ({ error: '임시 오류' }),
      }))
      .mockImplementationOnce(async () => ({
        ok: true,
        json: async () => baseCheckIn,
      }))
      .mockImplementation((input: string) => {
        if (input.includes('/api/spots/spot-1/courses')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ courses: [] }),
          })
        }

        if (input.includes('/api/spots/spot-1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ name: '서울타워' }),
          })
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'unknown' }),
        })
      })

    render(<CheckInDetailModal checkInId="CHECKIN-001" onClose={jest.fn()} />)

    expect(
      screen.getByText('인증 정보를 불러오는 중입니다…')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('임시 오류')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('테스터')).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/checkins/CHECKIN-001')
  })

  test('closes on Escape and restores focus to the trigger element on unmount', async () => {
    const onClose = jest.fn()

    function TestHost() {
      const [open, setOpen] = useState(false)
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            열기 버튼
          </button>
          {open && (
            <CheckInDetailModal
              checkIn={baseCheckIn}
              onClose={() => {
                onClose()
                setOpen(false)
              }}
            />
          )}
        </div>
      )
    }

    render(<TestHost />)
    const opener = screen.getByRole('button', { name: '열기 버튼' })

    act(() => {
      opener.focus()
    })
    fireEvent.click(opener)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: '인증 상세 닫기' })
      ).toHaveFocus()
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '열기 버튼' })).toHaveFocus()
    })
  })
})
