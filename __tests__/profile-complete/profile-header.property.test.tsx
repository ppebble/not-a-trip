/** @jest-environment jsdom */

/// <reference types="@testing-library/jest-dom" />

import * as fc from 'fast-check'
import { render, cleanup, within } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import type { ExtendedUserStats } from '@/types/profile'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

jest.mock('@/components/common/AppIcon', () => ({
  AppIcon: () => <div data-testid="app-icon" />,
}))

describe('Feature: 45-profile-complete, Property 7: 프로필 헤더 데이터 완전성', () => {
  afterEach(() => {
    cleanup()
  })

  it('헤더는 통계 7종과 기본 유저 정보를 누락 없이 렌더링한다', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 1000 }), {
          minLength: 7,
          maxLength: 7,
        }),
        (values) => {
          const stats: ExtendedUserStats = {
            userId: 'user-1',
            totalCheckIns: values[0],
            uniqueSpots: values[1],
            badgeCount: values[2],
            contentProgress: [],
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            completedRoutes: values[3],
            registeredSpots: values[4],
            reportCount: values[5],
            postCount: values[6],
          }

          const { container, getAllByText, unmount } = render(
            <ProfileHeader
              userInfo={{
                id: 'user-1',
                name: '테스트 유저',
                image: null,
                createdAt: '2026-01-01T00:00:00.000Z',
              }}
              stats={stats}
              isOwner={true}
              onEditClick={() => {}}
            />
          )

          expect(
            within(container).getByRole('heading', { name: '테스트 유저' })
          ).toBeInTheDocument()
          expect(within(container).getAllByRole('button')).toHaveLength(1)

          for (const value of values) {
            expect(getAllByText(String(value)).length).toBeGreaterThan(0)
          }

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  })
})
