# Implementation Plan: Content Hub IA

## Overview

서비스의 정보 구조(IA)를 재구성하여 작품 중심 탐색 흐름을 대표 경로로 승격시킨다. API 레이어부터 시작하여 페이지, 컴포넌트, 통합, 테스트 순서로 구현한다.

## Tasks

- [x] 1. GET /api/contents API 구현
  - [x] 1.1 작품 목록 조회 API Route 생성
    - `src/app/api/contents/route.ts` 생성
    - `spot_content_relations` 컬렉션에서 MongoDB aggregation으로 작품별 spotCount 집계
    - `$match` (status: 'active') → `$group` (contentName, contentType별) → `$sort` (spotCount 내림차순)
    - 대표 이미지는 기존 content-images API 패턴 활용
    - 응답 형식: `{ contents: ContentListItem[], total: number }`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.2 작품 목록 API 단위 테스트 작성
    - 정상 응답, 빈 결과, DB 에러 시나리오 테스트
    - _Requirements: 2.1_

- [x] 2. GET /api/contents/[name]/courses API 구현
  - [x] 2.1 작품 관련 코스 조회 API Route 생성
    - `src/app/api/contents/[name]/courses/route.ts` 생성
    - `routes` 컬렉션에서 `relatedContentNames` 필드로 매칭
    - `{ isPublic: true, relatedContentNames: contentName }` 조건 쿼리
    - 응답 형식: `{ courses: Route[], total: number }`
    - 존재하지 않는 작품명 시 빈 배열 반환
    - _Requirements: 3.4, 3.5_

  - [ ]* 2.2 작품 코스 API 단위 테스트 작성
    - 정상 응답, 작품 없음, DB 에러 시나리오 테스트
    - _Requirements: 3.4_

- [x] 3. 작품 목록 페이지 구현 (/contents)
  - [x] 3.1 작품 목록 서버 컴포넌트 페이지 생성
    - `src/app/(main)/contents/page.tsx` 생성
    - 서버 사이드에서 `/api/contents` 호출하여 초기 데이터 fetch
    - ContentListClient에 initialContents props 전달
    - 페이지 메타데이터 설정 (title, description)
    - _Requirements: 2.1_

  - [x] 3.2 ContentListClient 클라이언트 컴포넌트 구현
    - `src/components/content/ContentListClient.tsx` 생성
    - typeFilter 상태 (전체/애니메이션/영화/드라마/스포츠 팀/아티스트/게임/기타)
    - searchQuery 상태 (작품명 검색, 대소문자 무시)
    - 클라이언트 사이드 필터링 로직 구현
    - 빈 상태 안내 메시지 ("등록된 작품이 없습니다", "조건에 맞는 작품이 없습니다" + 필터 초기화)
    - 그리드 레이아웃 (반응형: 모바일 2열, 태블릿 3열, 데스크톱 4열)
    - _Requirements: 2.2, 2.5, 2.6, 2.7_

- [x] 4. ContentCard 컴포넌트 구현
  - [x] 4.1 작품 카드 컴포넌트 생성
    - `src/components/content/ContentCard.tsx` 생성
    - 작품명, 타입 라벨, 스팟 수, 대표 이미지 표시
    - 카드 클릭 시 `/contents/${encodeURIComponent(contentName)}` 이동
    - 이미지 로드 실패 시 플레이스홀더 아이콘 표시 (기존 패턴 유지)
    - 접근성: alt 텍스트, 키보드 네비게이션
    - _Requirements: 2.3, 2.4_

- [x] 5. Checkpoint — API 및 목록 페이지 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 작품 목록 페이지 접근 가능 여부 확인
  - API 응답 정상 동작 확인

- [x] 6. 작품 허브 페이지 확장 (ContentHubClient)
  - [x] 6.1 ContentHubClient 컴포넌트 구현
    - `src/components/content/ContentHubClient.tsx` 생성 (기존 ContentSpotsClient 확장)
    - 섹션 구조: 개요 → 대표 스팟 → 관련 코스 → 최근 인증 → 전체 스팟 보기 링크
    - 개요 섹션: 작품명, 타입, 연도, 대표 이미지, 총 스팟 수, 총 인증 수
    - 대표 스팟 섹션: 인증 수(checkInCount) 기준 상위 3개 스팟 카드 표시
    - 스팟 3개 미만 시 전체 스팟을 대표 스팟으로 표시
    - 관련 코스 섹션: `/api/contents/[name]/courses` 호출, 없으면 섹션 숨김
    - 최근 인증 섹션: 기존 `/api/checkins?contentName=X&limit=6` 활용, 없으면 안내 메시지
    - 전체 스팟 보기 링크 → 기존 지도+목록 뷰 이동
    - 에러 처리: 각 섹션별 graceful degradation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 6.2 작품 허브 페이지 라우트 연결
    - 기존 `/contents/[name]` 페이지에서 ContentHubClient 사용하도록 수정
    - 뒤로가기 버튼 구현: history.length > 1이면 router.back(), 아니면 `/contents` 이동
    - 뒤로가기 버튼 레이블: "작품 목록으로"
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. 헤더 네비게이션 수정
  - [x] 7.1 Header에 "작품 탐색" 링크 추가
    - `src/components/layout/Header.tsx` 수정
    - 데스크톱 네비게이션: "홈" 다음 위치에 "작품 탐색" 링크 추가
    - 모바일 드롭다운 메뉴: "홈" 다음 위치에 "작품 탐색" 항목 추가
    - 클릭 시 `/contents` 경로로 이동
    - 활성 상태 판단: `pathname.startsWith('/contents')`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 8. 랜딩 페이지 EntryPointSection 추가
  - [x] 8.1 EntryPointSection 컴포넌트 구현
    - `src/components/landing/EntryPointSection.tsx` 생성
    - 3개 진입점: "작품으로 찾기"(/contents), "코스로 따라가기"(/routes), "인증 둘러보기"(/gallery)
    - 각 진입점에 아이콘, 제목, 간단한 설명 포함
    - 반응형: 모바일 세로 스택, 태블릿 이상 가로 병렬
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 8.2 랜딩 페이지에 EntryPointSection 배치
    - 랜딩 페이지 (`/welcome`)에서 HeroSection 아래에 EntryPointSection 추가
    - _Requirements: 4.1_

- [x] 9. AutocompleteDropdown "작품 페이지로 이동" 링크 추가
  - [x] 9.1 자동완성 드롭다운에 작품 페이지 링크 추가
    - 기존 AutocompleteDropdown 컴포넌트 수정
    - 각 작품 항목에 "작품 페이지로 이동" 링크 추가
    - 링크 클릭 시 `/contents/${encodeURIComponent(contentName)}` 이동
    - 기존 onSelect 동작(지도 필터링) 유지
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Checkpoint — UI 통합 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 헤더 네비게이션 동작 확인
  - 랜딩 페이지 진입점 확인
  - 자동완성 링크 동작 확인
  - 작품 허브 페이지 섹션 구조 확인

- [ ] 11. Property-Based Tests 작성 (6개 속성)
  - [ ]* 11.1 Property 1: 헤더 활성 상태 판별 테스트
    - **Property 1: 헤더 활성 상태 판별**
    - 다양한 pathname에 대해 `/contents`로 시작하는 경우에만 활성 상태 true 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 1.4**

  - [ ]* 11.2 Property 2: 작품 카드 링크 URL 인코딩 테스트
    - **Property 2: 작품 카드 링크 URL 인코딩**
    - 한글, 영문, 특수문자 포함 작품명에 대해 encodeURIComponent 정확성 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 2.4, 5.2**

  - [ ]* 11.3 Property 3: 작품 타입 필터 정확성 테스트
    - **Property 3: 작품 타입 필터 정확성**
    - 랜덤 작품 목록 + 랜덤 타입 필터에 대해 필터링 결과 정확성 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 2.5**

  - [ ]* 11.4 Property 4: 작품명 검색 필터 정확성 테스트
    - **Property 4: 작품명 검색 필터 정확성**
    - 랜덤 작품 목록 + 랜덤 검색 쿼리에 대해 대소문자 무시 검색 정확성 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 2.6**

  - [ ]* 11.5 Property 5: 대표 스팟 선정 로직 테스트
    - **Property 5: 대표 스팟 선정 로직**
    - 랜덤 스팟 목록에 대해 인증 수 기준 상위 3개 선정 정확성 검증
    - 스팟 3개 미만 시 전체 스팟 표시 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 11.6 Property 6: 뒤로가기 네비게이션 결정 로직 테스트
    - **Property 6: 뒤로가기 네비게이션 결정 로직**
    - 랜덤 history.length에 대해 router.back() vs `/contents` 이동 결정 검증
    - fast-check으로 최소 100회 반복
    - **Validates: Requirements 6.2, 6.3**

- [ ] 12. 단위 테스트 작성
  - [ ]* 12.1 Header 컴포넌트 테스트
    - "작품 탐색" 링크 존재 및 위치 확인
    - 활성 상태 스타일 확인
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 12.2 ContentCard 컴포넌트 테스트
    - 필수 정보(작품명, 타입, 스팟 수, 이미지) 렌더링 확인
    - 링크 URL 정확성 확인
    - _Requirements: 2.3, 2.4_

  - [ ]* 12.3 EntryPointSection 컴포넌트 테스트
    - 3개 진입점 렌더링 확인
    - 각 링크 href 정확성 확인
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 12.4 뒤로가기 버튼 및 빈 상태 테스트
    - 뒤로가기 버튼 레이블 "작품 목록으로" 확인
    - 빈 상태 메시지 렌더링 확인
    - _Requirements: 6.4, 2.7, 3.7_

- [x] 13. Final Checkpoint — 통합 검증
  - Ensure all tests pass, ask the user if questions arise.
  - `npm run type-check` 통과 확인
  - 전체 테스트 스위트 통과 확인
  - 작품 목록 → 작품 허브 → 뒤로가기 흐름 검증
  - 헤더/랜딩/자동완성 진입점 동작 검증
  - 모바일/데스크톱 반응형 레이아웃 확인

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 Task는 specific requirements를 참조하여 추적 가능
- Checkpoint에서 사용자가 직접 앱을 실행하여 기능 테스트
- Property tests는 fast-check 라이브러리 사용 (프로젝트에 이미 설치됨)
- 기존 ContentSpotsClient를 확장하는 방식으로 ContentHubClient 구현
- 기존 `/api/checkins` API를 재사용하여 최근 인증 섹션 구현
