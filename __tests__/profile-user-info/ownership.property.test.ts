import * as fc from 'fast-check'
import { isProfileOwner } from '@/lib/profile-utils'

describe('Feature: 37-profile-user-info, Property 6: 편집 버튼 소유권 조건', () => {
  it('sessionUserId와 urlUserId가 정확히 같을 때만 owner로 판정한다', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 24 }), {
          nil: undefined,
        }),
        fc.option(fc.string({ minLength: 1, maxLength: 24 }), {
          nil: undefined,
        }),
        (sessionUserId, urlUserId) => {
          expect(isProfileOwner(sessionUserId, urlUserId)).toBe(
            !!sessionUserId && !!urlUserId && sessionUserId === urlUserId
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
