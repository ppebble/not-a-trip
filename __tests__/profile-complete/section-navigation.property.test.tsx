/** @jest-environment jsdom */

/// <reference types="@testing-library/jest-dom" />

import * as fc from 'fast-check'
import { fireEvent, render, cleanup, within } from '@testing-library/react'
import { SectionNavigation } from '@/components/profile/SectionNavigation'
import type { ProfileSection } from '@/types/profile'

const NON_MANAGEMENT_SECTIONS: ProfileSection[] = [
  'activity',
  'contribution',
  'community',
  'collection',
]

describe('Feature: 45-profile-complete, Property 2: Owner 전용 UI 가시성', () => {
  afterEach(() => {
    cleanup()
  })

  it('비오너는 management 탭을 볼 수 없고 owner는 5개 탭을 본다', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ProfileSection>(...NON_MANAGEMENT_SECTIONS),
        (activeSection) => {
          const onSectionChange = jest.fn()

          const ownerRender = render(
            <SectionNavigation
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              isOwner={true}
            />
          )
          expect(ownerRender.getAllByRole('button')).toHaveLength(5)
          ownerRender.unmount()

          const nonOwnerRender = render(
            <SectionNavigation
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              isOwner={false}
            />
          )
          expect(nonOwnerRender.getAllByRole('button')).toHaveLength(4)
          nonOwnerRender.unmount()
        }
      ),
      { numRuns: 20 }
    )
  })
})

describe('Feature: 45-profile-complete, Property 3: 섹션 네비게이션 상태 일관성', () => {
  afterEach(() => {
    cleanup()
  })

  it('activeSection과 aria-current가 일치하고 클릭 시 올바른 section key를 전달한다', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ProfileSection>(...NON_MANAGEMENT_SECTIONS),
        (activeSection) => {
          const onSectionChange = jest.fn()
          const { container, getAllByRole, unmount } = render(
            <SectionNavigation
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              isOwner={false}
            />
          )

          const buttons = getAllByRole('button')
          const current = within(container).getByRole('button', {
            current: 'page',
          })
          const expectedIndex = NON_MANAGEMENT_SECTIONS.indexOf(activeSection)

          expect(current).toBe(buttons[expectedIndex])

          fireEvent.click(buttons[0])
          expect(onSectionChange).toHaveBeenCalledWith('activity')

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  })
})
