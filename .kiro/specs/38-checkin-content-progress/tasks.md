# Implementation Plan: 체크인 콘텐츠 진행률 계산

## Overview

`spot_content_relations` 컬렉션 기반으로 유저의 작품별 진행률을 계산하는 로직을 구현한다.
`src/lib/progress-utils.ts` 신규 파일을 생성하고, 체크인 API와 progress API를 교체한다.

## Tasks

- [ ] 1. `progress-utils.ts` 핵심 유틸리티 구현
  - `src/lib/progress-utils.ts` 파일 생성
  - `fetchTotalSpotsMap()`: `spot_content_relations`에서 `status: 'active'`인 문서를 `contentName`별 distinct `spotId` 수로 집계하는 MongoDB aggregate 파이프라인 구현
  - `fetchCheckedSpotsMap(userId)`: `checkins`에서 `migrationStatus: { $ne: 'unresolved' }` + `contentName` 존재 조건으로 필터링 후 `contentName`별 distinct `spotId` 수 집계
  - `mergeProgressMaps(totalSpotsMap, checkedSpotsMap)`: 두 Map을 병합하여 `ContentProgress[]` 반환, `checkedSpots === 0` 항목 제외, `Math.round((checkedSpots / totalSpots) * 100)` 공식 적용
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 2.1, 2.2, 2.3_

  - [ ]* 1.1 Property 1 테스트 작성: 총 스팟 수 집계 정확성
    - `__tests__/checkin-content-progress/progress-utils.property.test.ts` 생성
    - `fc.record`로 `SpotContentRelation` 문서 생성기 구현 (`status: fc.constantFrom('active', 'expired', 'scheduled', 'archived')`)
    - `fetchTotalSpotsMap` 로직을 인메모리로 재현하여 DB 모킹 결과와 비교 검증
    - **Property 1: 총 스팟 수 집계 정확성 (active + distinct)**
    - **Validates: Requirements 1.1, 2.1, 2.2, 2.3**

  - [ ]* 1.2 Property 2 테스트 작성: 인증 스팟 수 집계 정확성
    - `fc.record`로 `CheckIn` 문서 생성기 구현 (`migrationStatus: fc.constantFrom('resolved', 'unresolved', null)`)
    - `fetchCheckedSpotsMap` 로직을 인메모리로 재현하여 DB 모킹 결과와 비교 검증
    - **Property 2: 인증 스팟 수 집계 정확성 (unresolved 제외 + distinct)**
    - **Validates: Requirements 1.2, 1.6, 4.3**

  - [ ]* 1.3 Property 3 테스트 작성: 진행률 범위 및 공식 준수
    - `fc.nat({ max: 1000 }).chain(...)` 생성기로 `(checkedSpots, totalSpots)` 쌍 생성 (`totalSpots > 0`, `checkedSpots <= totalSpots`)
    - `Math.round((checkedSpots / totalSpots) * 100)` 결과가 항상 0 이상 100 이하 정수임을 검증
    - **Property 3: 진행률 범위 및 공식 준수**
    - **Validates: Requirements 1.3**

  - [ ]* 1.4 Property 4 테스트 작성: 0% 작품 제외 필터링
    - `mergeProgressMaps` 출력 배열에 `checkedSpots === 0`인 항목이 없음을 검증
    - **Property 4: 0% 작품 제외 필터링**
    - **Validates: Requirements 1.4, 3.2**

- [ ] 2. Checkpoint — 유틸리티 테스트 통과 확인
  - 모든 테스트가 통과하는지 확인한다. 문제가 있으면 사용자에게 문의한다.

- [ ] 3. `POST /api/checkins` — `updateUserStats` 내 `contentProgress` 계산 로직 교체
  - `src/app/api/checkins/route.ts` 수정
  - `fetchTotalSpotsMap`, `fetchCheckedSpotsMap`, `mergeProgressMaps`를 `progress-utils.ts`에서 import
  - `updateUserStats` 내 `contentProgress: []` TODO를 `Promise.all([fetchTotalSpotsMap(), fetchCheckedSpotsMap(userId)])` + `mergeProgressMaps` 호출로 교체
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 4. `GET /api/users/[id]/progress` — `spot_content_relations` 기반으로 전면 교체
  - `src/app/api/users/[id]/progress/route.ts` 수정
  - 기존 `spots.relatedContent` 기반 로직 제거
  - `fetchTotalSpotsMap`, `fetchCheckedSpotsMap`, `mergeProgressMaps` 호출로 교체
  - 결과를 `progress desc` 순으로 정렬 후 `{ progress: ContentProgress[], total: progress.length }` 반환
  - try-catch로 DB 오류 시 HTTP 500 + 한국어 오류 메시지 반환
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

  - [ ]* 4.1 Property 5 테스트 작성: 진행률 내림차순 정렬
    - `__tests__/checkin-content-progress/progress-utils.property.test.ts`에 추가
    - 임의의 `ContentProgress[]` 배열에 정렬 함수 적용 후 인접 항목 `a[i].progress >= a[i+1].progress` 검증
    - **Property 5: 진행률 내림차순 정렬**
    - **Validates: Requirements 3.3**

  - [ ]* 4.2 progress API 단위 테스트 작성
    - `__tests__/checkin-content-progress/progress-api.unit.test.ts` 생성
    - 정상 응답 형태 `{ progress: ContentProgress[], total: number }` 검증
    - DB 오류 모킹 시 HTTP 500 + 한국어 메시지 반환 검증
    - `mergeProgressMaps` 빈 입력 시 빈 배열 반환 검증
    - `checkedSpots === totalSpots`일 때 `progress === 100` 검증
    - _Requirements: 3.4, 3.5_

- [ ] 5. Final Checkpoint — 전체 테스트 통과 및 동작 확인
  - `npm run type-check`로 타입 오류 없음 확인
  - 모든 테스트가 통과하는지 확인한다. 문제가 있으면 사용자에게 문의한다.

## Notes

- `*` 표시 서브태스크는 선택 사항으로 MVP 구현 시 건너뛸 수 있음
- PBT는 fast-check 사용, 최소 100회 반복
- `fetchTotalSpotsMap`과 `fetchCheckedSpotsMap`은 `Promise.all`로 병렬 실행하여 성능 최적화
- `contentName`이 없는 체크인은 `$match: { contentName: { $exists: true, $ne: null } }` 조건으로 자동 제외
- `totalSpots === 0`인 contentName은 `mergeProgressMaps`에서 totalSpotsMap 기준 순회로 자동 제외
