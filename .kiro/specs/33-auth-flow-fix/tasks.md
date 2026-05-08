# Implementation Plan: 인증 플로우 UX 개선

## Overview

인증 업로드 유저의 전환 경로(Funnel)에 존재하는 3가지 결함을 수정한다:
1. LoginRequiredModal 자체 완결형 리팩토링 (로그인 전환 통일)
2. SpotSearchModal 검색 결과에 작품명(contentName) 표시
3. 인증 완료 후 CTA(다음 행동 유도) 버튼 추가

기술 스택: TypeScript, Next.js 15, Jest + @testing-library/react, fast-check

## Tasks

- [x] 1. LoginRequiredModal 리팩토링
  - [x] 1.1 LoginRequiredModal 인터페이스 및 내부 로직 변경
    - `onConfirm` prop 제거, `callbackUrl?: string`과 `onClose?: () => void` prop 추가
    - 내부에서 `useRouter` + `usePathname` 사용하여 확인 버튼 클릭 시 `/auth/signin?callbackUrl={encodeURIComponent(pathname)}` 이동 구현
    - `callbackUrl` prop이 전달되면 해당 값 사용, 없으면 `usePathname()` 결과 사용
    - `usePathname()` 반환값이 null인 경우 기본값 `/` 사용
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 CheckInButton, FloatingActionButton에서 LoginRequiredModal 사용 수정
    - CheckInButton에서 `onConfirm` prop 전달 제거
    - FloatingActionButton에서 `onConfirm` prop 전달 제거
    - 모달 닫기 동작은 `onClose` prop으로 전환
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. SpotPin 타입 확장 및 API 매핑 수정
  - [x] 2.1 SpotPin 타입에 contentName 필드 추가
    - `src/types/index.ts`의 `SpotPin` 인터페이스에 `contentName?: string` 추가
    - _Requirements: 2.4_

  - [x] 2.2 GET /api/spots 응답 매핑에 contentName 추가
    - `src/app/api/spots/route.ts`의 매핑 로직에서 `spot.relatedContent?.[0]?.name`을 `contentName`으로 추출
    - relatedContent가 비어있거나 없는 경우 undefined 반환
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 3. SpotSearchModal 검색 결과에 contentName 표시
  - [x] 3.1 SpotSearchModal UI에 작품명 표시 추가
    - 검색 결과 항목에 `contentName` 표시 영역 추가
    - `contentName`이 없는 경우 작품명 영역 비표시, 카테고리만 표시
    - 검색 결과 매핑 시 API 응답의 `contentName` 필드 포함
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. QuickCheckIn 완료 화면 CTA 추가
  - [x] 4.1 QuickCheckIn 완료 단계에 CTA 버튼 구현
    - "내 인증 보기" 버튼 → `/gallery?tab=my` 이동
    - "같은 작품 더 보기" 버튼 → `/contents/{contentName}` 이동 (contentName이 있을 때만 표시)
    - "확인" 버튼 → `onClose()` 호출하여 모달 닫기
    - 선택된 relation에서 contentName 추출하여 사용
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

- [x] 5. CheckInModal 성공 상태 CTA 추가
  - [x] 5.1 CheckInModal 인증 성공 후 CTA UI 구현
    - 인증 성공 콜백 호출 후 다음 행동 유도 UI 표시
    - QuickCheckIn과 동일한 CTA 패턴 적용 ("내 인증 보기", "같은 작품 더 보기", "확인")
    - _Requirements: 3.3_

- [x] 6. Checkpoint — 중간 검증
  - 모든 구현 완료 확인, `npm run type-check` 통과 확인
  - 사용자에게 변경사항 검증 요청

- [ ] 7. Property-Based Tests 작성
  - [ ]* 7.1 Property 1: callbackUrl 구성 정확성 테스트
    - **Property 1: callbackUrl 구성 정확성**
    - 임의의 pathname 문자열에 대해 생성되는 URL이 `/auth/signin?callbackUrl={encodeURIComponent(pathname)}` 형태인지 검증
    - fast-check 사용, 최소 100회 반복
    - **Validates: Requirements 1.3**

  - [ ]* 7.2 Property 2: contentName 매핑 정확성 테스트
    - **Property 2: contentName 매핑 정확성**
    - 임의의 relatedContent 배열에 대해 `relatedContent[0].name`이 `contentName`으로 정확히 추출되는지 검증
    - relatedContent가 비어있거나 없는 경우 `contentName`이 undefined인지 검증
    - fast-check 사용, 최소 100회 반복
    - **Validates: Requirements 2.1, 2.3, 2.4**

  - [ ]* 7.3 Property 3: 작품 페이지 CTA URL 생성 정확성 테스트
    - **Property 3: 작품 페이지 CTA URL 생성 정확성**
    - 임의의 contentName 문자열에 대해 CTA 링크가 `/contents/{contentName}` 형태인지 검증
    - fast-check 사용, 최소 100회 반복
    - **Validates: Requirements 3.5**

- [ ] 8. 단위 테스트 작성
  - [ ]* 8.1 LoginRequiredModal 단위 테스트
    - 확인 버튼 클릭 시 `router.push`가 올바른 URL로 호출되는지 확인
    - `callbackUrl` prop 전달 시 해당 값 사용 확인
    - 모달이 닫힌 상태에서 렌더링되지 않는지 확인
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 8.2 SpotSearchModal 단위 테스트
    - 검색 결과에 `contentName`이 표시되는지 확인
    - `contentName`이 없는 결과에서 작품명 영역이 비어있는지 확인
    - _Requirements: 2.1, 2.3_

  - [ ]* 8.3 QuickCheckIn 완료 화면 단위 테스트
    - "내 인증 보기" 버튼이 `/gallery?tab=my` 링크를 가지는지 확인
    - contentName이 있을 때 "같은 작품 더 보기" 버튼 표시 확인
    - contentName이 없을 때 "같은 작품 더 보기" 버튼 숨김 확인
    - "확인" 버튼 클릭 시 `onClose` 호출 확인
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [ ]* 8.4 CheckInModal 성공 상태 단위 테스트
    - 인증 성공 후 CTA UI가 표시되는지 확인
    - _Requirements: 3.3_

- [x] 9. Checkpoint — 최종 통합 검증
  - 모든 테스트 통과 확인 (`npm run test`), 사용자에게 변경사항 검증 요청
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 Task는 specific requirements를 참조하여 추적 가능
- Checkpoints에서 증분 검증 수행
- Property tests는 fast-check 라이브러리 사용 (프로젝트에 이미 설치됨)
- 단위 테스트는 Jest + @testing-library/react 사용
