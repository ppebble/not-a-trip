import * as fc from 'fast-check'
import { formatJoinDate } from '@/lib/profile-utils'

describe('Feature: 37-profile-user-info, Property 5: 가입일 포맷 일관성', () => {
  it('유효한 날짜 입력은 항상 YYYY년 MM월 가입 형식으로 반환된다', () => {
    fc.assert(
      fc.property(
        fc
          .date()
          .filter(
            (date) =>
              !Number.isNaN(date.getTime()) &&
              date.getFullYear() >= 1000 &&
              date.getFullYear() <= 9999
          ),
        (date) => {
          const result = formatJoinDate(date.toISOString())
          const expectedYear = String(date.getFullYear())
          const expectedMonth = String(date.getMonth() + 1).padStart(2, '0')

          expect(result).toMatch(/^\d{4}년 \d{2}월 가입$/)
          expect(result).toContain(expectedYear)
          expect(result).toContain(expectedMonth)
        }
      ),
      { numRuns: 100 }
    )
  })
})
