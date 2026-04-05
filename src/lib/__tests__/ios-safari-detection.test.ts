import fc from 'fast-check'
import { isIosSafari } from '@/lib/pwa-utils'

/**
 * Property 4: iOS Safari UA 감지 정확성
 * Validates: Requirements 6.2
 *
 * For any User-Agent 문자열에 대해, iOS Safari 감지 함수는
 * `iphone`, `ipad`, `ipod` 키워드가 포함된 UA에서만 `true`를 반환해야 하며,
 * Android, Chrome, Firefox 등 비-iOS UA에서는 `false`를 반환해야 한다.
 */

const IOS_KEYWORDS = ['iphone', 'ipad', 'ipod'] as const

/** iOS 키워드를 포함하지 않는 안전한 문자열 생성 */
const nonIosStringArbitrary = fc
  .string({ minLength: 0, maxLength: 200 })
  .filter((s) => {
    const lower = s.toLowerCase()
    return !IOS_KEYWORDS.some((kw) => lower.includes(kw))
  })

/** 실제 iOS Safari UA 문자열 샘플 */
const realIosUAs = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
]

/** 실제 비-iOS UA 문자열 샘플 */
const realNonIosUAs = [
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
]

describe('iOS Safari UA 감지 Property Tests', () => {
  // Feature: pwa-setup, Property 4: iOS Safari UA 감지 정확성
  test('Property 4: iOS 키워드가 포함된 UA는 항상 true를 반환한다', () => {
    fc.assert(
      fc.property(
        nonIosStringArbitrary,
        fc.constantFrom(...IOS_KEYWORDS),
        nonIosStringArbitrary,
        (prefix, keyword, suffix) => {
          const ua = `${prefix}${keyword}${suffix}`
          return isIosSafari(ua) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: pwa-setup, Property 4: iOS Safari UA 감지 정확성
  test('Property 4: iOS 키워드가 없는 UA는 항상 false를 반환한다', () => {
    fc.assert(
      fc.property(nonIosStringArbitrary, (ua) => {
        return isIosSafari(ua) === false
      }),
      { numRuns: 100 }
    )
  })

  // Feature: pwa-setup, Property 4: iOS Safari UA 감지 정확성
  test('Property 4: 대소문자 혼합 iOS 키워드도 감지한다', () => {
    const mixedCaseKeyword = fc.constantFrom(
      'iPhone',
      'IPHONE',
      'IPhone',
      'iPHONE',
      'iPad',
      'IPAD',
      'IPad',
      'iPAD',
      'iPod',
      'IPOD',
      'IPod',
      'iPOD'
    )

    fc.assert(
      fc.property(
        nonIosStringArbitrary,
        mixedCaseKeyword,
        nonIosStringArbitrary,
        (prefix, keyword, suffix) => {
          const ua = `${prefix}${keyword}${suffix}`
          return isIosSafari(ua) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  // 실제 UA 문자열 검증 (엣지 케이스)
  test('Property 4 Edge Case: 실제 iOS Safari UA 문자열에서 true 반환', () => {
    for (const ua of realIosUAs) {
      expect(isIosSafari(ua)).toBe(true)
    }
  })

  test('Property 4 Edge Case: 실제 비-iOS UA 문자열에서 false 반환', () => {
    for (const ua of realNonIosUAs) {
      expect(isIosSafari(ua)).toBe(false)
    }
  })

  test('Property 4 Edge Case: 빈 문자열에서 false 반환', () => {
    expect(isIosSafari('')).toBe(false)
  })
})
