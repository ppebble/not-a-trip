# Implementation Plan: Landing Social Proof Real Data

## Overview

랜딩 페이지 소셜프루프 섹션이 실제 DB 스팟 데이터를 표시하도록 전환한다.
`GET /api/spots/showcase` 신규 API 엔드포인트를 생성하고, `fetchProofImages` 함수를 DB 직접 접근에서 HTTP 호출 방식으로 교체한다.
TypeScript + Next.js App Router 기반으로 구현하며, `REAL_SPOT_PHOTO_FALLBACKS` 해결 로직과 graceful degradation을 포함한다.

## Tasks

- [ ] 1. GET /api/spots/showcase 엔드포인트 구현
  - `src/app/api/spots/showcase/route.ts` 파일 생성
  - `ShowcaseSpotItem` 인터페이스 정의 (`id`, `name`, `category`, `thumbnailUrl`)
  - `SpotDocument` 내부 타입 정의
  - `isPlaceholderPhoto` 유틸 함수 구현 (picsum.photos/seed/ 또는 /icons/ 경로 판별)
  - `resolveThumbnailUrl` 함수 구현: 실제 사진 → REAL_SPOT_PHOTO_FALLBACKS → null 우선순위
  - 6개 카테고리를 `Promise.all`로 병렬 조회, 카테고리당 최대 8개 조회 후 4개로 슬라이스
  - MongoDB 정렬: 실제 사진 스팟 우선 (`$cond` 정렬 필드 활용)
  - `thumbnailUrl`이 null/empty인 스팟 응답에서 제외
  - DB 조회 실패 시 HTTP 500 + `{ error: "Failed to fetch showcase spots" }` 반환
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 1.1 Property 1 테스트: API 응답 객체는 항상 필수 필드를 포함한다
    - **Property 1: API 응답 객체는 항상 필수 필드를 포함한다**
    - `resolveThumbnailUrl`을 거쳐 생성된 모든 `ShowcaseSpotItem`은 `id`, `name`, `category`, `thumbnailUrl` 필드를 모두 포함하며 `thumbnailUrl`은 non-null, non-empty
    - `src/app/api/spots/showcase/__tests__/route.test.ts` 파일에 fast-check 속성 테스트 작성
    - **Validates: Requirements 1.2, 5.5**

  - [ ]* 1.2 Property 2 테스트: 실제 사진 스팟은 플레이스홀더 스팟보다 항상 앞에 온다
    - **Property 2: 실제 사진 스팟은 플레이스홀더 스팟보다 항상 앞에 온다**
    - 임의 스팟 배열에 대해 정렬 후 실제 사진 스팟이 플레이스홀더 스팟보다 앞에 위치하는지 검증
    - **Validates: Requirements 1.3, 5.1**

  - [ ]* 1.3 Property 3 테스트: 카테고리당 반환 스팟 수는 최대 4개를 초과하지 않는다
    - **Property 3: 카테고리당 반환 스팟 수는 최대 4개를 초과하지 않는다**
    - 임의 개수의 스팟이 존재하더라도 카테고리별 결과 배열 길이가 항상 4 이하인지 검증
    - **Validates: Requirements 1.4, 5.2**

  - [ ]* 1.4 Property 6 테스트: REAL_SPOT_PHOTO_FALLBACKS 해결 로직은 올바르게 동작한다
    - **Property 6: REAL_SPOT_PHOTO_FALLBACKS 해결 로직은 올바르게 동작한다**
    - 임의 spotId + photoUrl 조합에 대해 `resolveThumbnailUrl`이 우선순위(실제 사진 → Wikimedia → null)를 항상 따르는지 검증
    - **Validates: Requirements 5.4**

- [ ] 2. fetchProofImages 함수를 API 호출 방식으로 교체
  - `src/components/landing/data/fetchShowcaseSpots.ts`의 `fetchProofImages` 함수 수정
  - `ShowcaseSpotItem` 타입 import (또는 로컬 정의)
  - `iconFallback` 상수 정의 (6개 카테고리 아이콘 경로)
  - `process.env.NEXTAUTH_URL || 'http://localhost:3000'`으로 base URL 구성
  - `fetch(`${baseUrl}/api/spots/showcase`, { next: { revalidate: 3600 } })` 호출
  - 응답을 `Record<SpotCategory, string[]>` 형태로 변환
  - 플레이스홀더 URL 필터링 (`isPlaceholderPhoto` 재사용)
  - API 실패(네트워크 오류 또는 non-2xx) 시 `console.warn` 후 `iconFallback` 반환
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.5_

  - [ ]* 2.1 Property 4 테스트: fetchProofImages 변환 결과는 항상 올바른 Record 형태다
    - **Property 4: fetchProofImages 변환 결과는 항상 올바른 Record 형태다**
    - 임의 `ShowcaseSpotItem[]` 배열에 대해 변환 결과가 항상 6개 카테고리 키를 포함하는 `Record<SpotCategory, string[]>` 형태인지 검증
    - `src/components/landing/data/__tests__/fetchProofImages.test.ts` 파일에 fast-check 속성 테스트 작성
    - **Validates: Requirements 2.2**

  - [ ]* 2.2 Property 5 테스트: 플레이스홀더 URL은 fetchProofImages 결과에 포함되지 않는다
    - **Property 5: 플레이스홀더 URL은 fetchProofImages 결과에 포함되지 않는다**
    - 플레이스홀더 URL이 포함된 임의 API 응답에 대해 변환 결과에 플레이스홀더 URL이 없는지 검증
    - **Validates: Requirements 2.5, 4.4**

  - [ ]* 2.3 단위 테스트: fetchProofImages 함수 동작 검증
    - 정상 API 응답 → 올바른 Record 변환 확인
    - API 실패(non-2xx) → iconFallback 반환 + console.warn 호출 확인
    - NEXTAUTH_URL 환경 변수 → 올바른 base URL 사용 확인
    - _Requirements: 2.1, 2.4, 2.6_

- [ ] 3. Checkpoint — 모든 테스트 통과 확인
  - `npm run type-check` 실행하여 TypeScript 오류 없음 확인
  - `npm test -- --testPathPattern="showcase|fetchProofImages"` 실행하여 신규 테스트 통과 확인
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

- [ ] 4. Property 7 테스트: 라운드로빈 배분 검증
  - `src/components/landing/__tests__/SocialProofSection.test.ts` 파일 생성
  - **Property 7: 라운드로빈 배분은 카테고리 내 카드 순서를 따른다**
  - 임의 N개 카드와 M개 이미지(M > 0)에 대해 k번째 카드의 이미지가 `images[k % M]`인지 검증
  - `getExtendedData` 함수를 테스트 가능하도록 export 또는 별도 유틸로 분리
  - **Validates: Requirements 3.4**

- [ ] 5. 최종 Checkpoint — 통합 검증
  - `npm run type-check` 전체 타입 오류 없음 확인
  - 전체 테스트 스위트 실행하여 기존 테스트 회귀 없음 확인
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

## Notes

- `*` 표시 서브태스크는 선택 사항으로 MVP 구현 시 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능성 확보
- Checkpoint 태스크에서 사용자가 직접 앱을 실행하여 소셜프루프 섹션에 실제 스팟 사진이 표시되는지 확인
- `SocialProofSection`, `ProofCard`, `WelcomePage`, `proofData.ts`는 변경 불필요 (design.md 참조)
- Property 테스트는 fast-check 라이브러리 사용 (프로젝트 기존 설정)
