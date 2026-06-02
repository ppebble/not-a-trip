/** @jest-environment jsdom */

/// <reference types="@testing-library/jest-dom" />

import * as fc from 'fast-check'
import { render, cleanup, within } from '@testing-library/react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import type { ExtendedUserStats } from '@/types/profile'

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/components/common/AppIcon', () => ({
  AppIcon: () => <div data-testid="app-icon" />,
}))

const emptyStats: ExtendedUserStats = {
  userId: 'user-1',
  totalCheckIns: 0,
  uniqueSpots: 0,
  badgeCount: 0,
  contentProgress: [],
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  completedRoutes: 0,
  registeredSpots: 0,
  reportCount: 0,
  postCount: 0,
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function accessibleTextPattern(value: string): RegExp {
  const escapedParts = value.trim().split(/\s+/).map(escapeRegExp)
  return new RegExp(`^${escapedParts.join('\\s+')}$`)
}

describe('Feature: 37-profile-user-info, Property 4: user name rendering', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders every valid userInfo.name as the profile heading', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((name) => name.trim().length > 0),
        (name) => {
          const { container, unmount } = render(
            <ProfileHeader
              userInfo={{
                id: 'user-1',
                name,
                image: null,
                createdAt: '2026-01-01T00:00:00.000Z',
              }}
              stats={emptyStats}
              isOwner={false}
              onEditClick={() => {}}
            />
          )

          expect(
            within(container).getByRole('heading', {
              name: accessibleTextPattern(name),
            })
          ).toBeInTheDocument()
          unmount()
        }
      ),
      { numRuns: 50 }
    )
  })
})
