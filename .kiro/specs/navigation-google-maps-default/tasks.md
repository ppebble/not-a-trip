# Implementation Plan: 해외 스팟 Google Maps 바로 열기

## Overview

`isKoreanCoordinates()` 순수 함수를 추가하고, `DirectionsButton` 컴포넌트에 국내/해외 조건 분기를 적용한다. 변경 파일은 2개(`directions.ts`, `DirectionsButton.tsx`), 테스트 파일 2개 추가.

## Tasks

- [ ] 1. `isKoreanCoordinates` 함수 구현 및 테스트
  - [ ] 1.1 `src/lib/directions.ts`에 `KOREA_BOUNDARY` 상수와 `isKoreanCoordinates()` 함수 추가
    - `KOREA_BOUNDARY` 상수 정의 (lat: 33.0~38.7, lng: 124.5~132.0)
    - `isKoreanCoordinates(lat, lng): boolean` 순수 함수 export
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 `src/lib/__tests__/directions.test.ts`에 property-based test 작성
    - **Property 1: 좌표 경계 분류 정확성 (Boundary classification biconditional)**
    - 랜덤 좌표 생성 → `isKoreanCoordinates` 결과가 범위 조건과 일치하는지 검증
    - **Validates: Requirements 1.2, 1.3, 4.4**

  - [ ]* 1.3 `src/lib/__tests__/directions.test.ts`에 property-based test 작성
    - **Property 2: Google Maps URL에 좌표 포함**
    - 랜덤 좌표/이름 생성 → `generateDirectionsUrls` Google Maps URL에 좌표 포함 검증
    - **Validates: Requirements 2.2**

  - [ ]* 1.4 `src/lib/__tests__/directions.test.ts`에 edge case unit test 작성
    - 제주도 (33.4, 126.5) → 국내 분류 확인
    - 울릉도 (37.5, 130.9) → 국내 분류 확인
    - 후쿠오카 (33.6, 130.4) → 해외 분류 확인
    - 쓰시마 (34.4, 129.3) → 해외 분류 확인
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 2. `DirectionsButton` 컴포넌트 수정 및 테스트
  - [ ] 2.1 `src/components/common/DirectionsButton.tsx`에 국내/해외 조건 분기 추가
    - `isKoreanCoordinates` import
    - `isDomestic` 변수로 국내/해외 판별
    - 해외: 클릭 시 `openDirections(urls.google)` 직접 호출, 메뉴 표시 안 함
    - 국내: 기존 `setIsOpen` 토글 동작 유지
    - `aria-haspopup`, `aria-expanded`는 국내일 때만 설정
    - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3_

  - [ ]* 2.2 `src/components/common/__tests__/DirectionsButton.test.tsx`에 컴포넌트 동작 테스트 작성
    - 해외 좌표 → 클릭 시 메뉴 없이 Google Maps 열림 확인
    - 국내 좌표 → 클릭 시 선택 메뉴 표시 확인
    - _Requirements: 2.1, 3.1_

- [ ] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 변경 파일: `src/lib/directions.ts`, `src/components/common/DirectionsButton.tsx`
- 테스트 파일: `src/lib/__tests__/directions.test.ts`, `src/components/common/__tests__/DirectionsButton.test.tsx`
- PBT 라이브러리: `fast-check` (프로젝트에 이미 설치됨)
