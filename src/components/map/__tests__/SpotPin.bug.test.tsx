/**
 * @jest-environment jsdom
 */

/**
 * Bug Condition Exploration Test - 근접 핀 호버 안정성
 *
 * Property 1: Bug Condition - 근접 핀 이벤트 충돌
 * z-index 간격과 debounce 타이밍이 근접 핀 간 이벤트 충돌을
 * 방지하기에 충분한지 검증합니다.
 *
 * Bug Condition:
 *   input.component == "SpotPin"
 *   AND input.nearbyPinCount >= 2
 *   AND input.mouseMoveBetweenPins == true
 *   AND debounceWindow < mouseTransitionTime
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 FAIL (버그 존재 확인)
 *
 * Requirements: 2.7, 2.8
 */

// ============================================
// Test Suite (소스코드 분석 기반)
// ============================================

describe('SpotPin Bug Condition Exploration - 근접 핀 호버 안정성', () => {
  let sourceCode: string

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )
  })

  /**
   * Property 1-1: Z_INDEX.hovered가 충분히 커야 한다 (5000 이상)
   *
   * 현재 Z_INDEX = { base: 0, selected: 500, hovered: 1000 }
   * 근접 핀 간 z-index 충돌을 방지하려면 간격이 더 넓어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (hovered=1000, 부족)
   */
  test('Z_INDEX.hovered가 5000 이상이어야 한다', () => {
    // Z_INDEX 상수에서 hovered 값 추출
    const hoveredMatch = sourceCode.match(/hovered\s*:\s*(\d+)/)
    expect(hoveredMatch).not.toBeNull()
    const hoveredValue = parseInt(hoveredMatch![1], 10)
    expect(hoveredValue).toBeGreaterThanOrEqual(10000)
  })

  /**
   * Property 1-2: 호버/선택 이원 상태가 호버 단일 상태로 통합되어야 한다
   *
   * 이전에는 isSelected와 isHovered가 분리되어 있어
   * 호버 후 이전 핀이 선택 상태로 남는 문제가 있었다.
   * 호버 단일 상태로 통합하여 마우스 이탈 시 완전히 원래 상태로 복원되어야 한다.
   *
   * EXPECTED: 수정 후 PASS (selectedSpotId가 호버에서 사용되지 않음)
   */
  test('handleMouseOver에서 setSelectedSpot을 호출하지 않아야 한다', () => {
    const mouseOverSection = sourceCode
      .split('handleMouseOver')[1]
      ?.split('handleMouseOut')[0]
    expect(mouseOverSection).toBeDefined()
    expect(mouseOverSection).not.toContain('setSelectedSpot')
  })

  /**
   * Property 1-3: mouseover debounce가 80ms 이상이어야 한다
   *
   * 현재 50ms는 핀 간 전환 시 너무 짧아 이벤트 연쇄가 발생한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (50ms, 너무 짧음)
   */
  test('mouseover debounce 타이밍이 80ms 이상이어야 한다', () => {
    // handleMouseOver 내 setTimeout 타이밍 추출
    // 패턴: hoverTimeoutRef.current = setTimeout(() => { ... }, XX)
    const mouseOverSection = sourceCode
      .split('handleMouseOver')[1]
      ?.split('handleMouseOut')[0]
    expect(mouseOverSection).toBeDefined()

    // 멀티라인 setTimeout 패턴 매칭: }, XX) 형태로 마지막 인자 추출
    const timeoutMatch = mouseOverSection?.match(
      /setTimeout\s*\([\s\S]*?,\s*(\d+)\s*\)/
    )
    expect(timeoutMatch).not.toBeNull()
    const debounceMs = parseInt(timeoutMatch![1], 10)
    expect(debounceMs).toBeGreaterThanOrEqual(80)
  })

  /**
   * Property 1-4: mouseout debounce가 200ms 이상이어야 한다
   *
   * 현재 150ms는 핀 간 전환 시 안정성이 부족하다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (150ms, 부족)
   */
  test('mouseout debounce 타이밍이 200ms 이상이어야 한다', () => {
    // handleMouseOut 함수 영역에서 setTimeout의 두 번째 인자 추출
    const mouseOutSection = sourceCode.split('handleMouseOut')[1]
    expect(mouseOutSection).toBeDefined()

    const timeoutMatch = mouseOutSection?.match(
      /setTimeout\s*\([^,]+,\s*(\d+)\s*\)/
    )
    expect(timeoutMatch).not.toBeNull()
    const debounceMs = parseInt(timeoutMatch![1], 10)
    expect(debounceMs).toBeGreaterThanOrEqual(200)
  })

  /**
   * Property 1-5: SpotPreview에서 setPreviewHovered로 호버 상태를 관리해야 한다
   *
   * SpotPreview가 마우스 이벤트를 가로채서 핀의 mouseout을 강제 유발하는
   * 현상을 방지하기 위해 setPreviewHovered로 호버 상태를 관리하고,
   * SpotPin의 mouseout 핸들러에서 isPreviewHoveredRef를 체크해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (setPreviewHovered 미사용 또는 mouseout에서 체크 미흡)
   */
  test('SpotPreview에서 setPreviewHovered로 호버 상태를 관리해야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const previewSource = fs.readFileSync(
      path.resolve(__dirname, '../SpotPreview.tsx'),
      'utf-8'
    )

    // SpotPreview에서 setPreviewHovered를 사용하는지 확인
    const hasSetPreviewHovered = previewSource.includes('setPreviewHovered')
    expect(hasSetPreviewHovered).toBe(true)

    // SpotPin의 mouseout 핸들러에서 isPreviewHoveredRef를 체크하는지 확인
    const mouseOutSection = sourceCode.split('handleMouseOut')[1]
    expect(mouseOutSection).toBeDefined()
    expect(mouseOutSection).toContain('isPreviewHoveredRef')
  })
})
