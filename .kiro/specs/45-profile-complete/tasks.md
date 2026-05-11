# Implementation Plan: 프로필 페이지 활동 허브 완성

## Overview

프로필 페이지를 5개 섹션(활동/기여/커뮤니티/보관함/관리) 허브로 재설계한다. 8개 신규 GET API + 1개 PUT API를 구현하고, React Query 훅을 확장하며, 기존 `/settings/account` 페이지를 관리 섹션에 통합한다. 헤더 프로필 링크를 수정하고 리다이렉트를 설정한다.

## Tasks

- [x] 1. API 상수 등록 및 타입 정의
  - [x] 1.1 API_ROUTES.USERS 확장
    - `src/lib/api-routes.ts`의 USERS 객체에 ROUTES, BOOKMARKS, COMPLETIONS, REPORTS, SUPPLEMENTS, STATUS_REPORTS, POSTS, COMMENTS, UPDATE 추가
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_
  - [x] 1.2 프로필 관련 타입 정의
    - `src/types/index.ts`에 ExtendedUserStats, UserRoute, UserBookmark, UserCompletion, UserReport, UserSupplement, UserStatusReport, UserPost, UserComment 인터페이스 추가
    - ProfileSection 타입 정의: `'activity' | 'contribution' | 'community' | 'collection' | 'management'`
    - _Requirements: 2.1, 8.4, 8.5, 9.1~9.8_

- [x] 2. API Routes 구현 — GET 엔드포인트
  - [x] 2.1 GET /api/users/[id]/routes 구현
    - `src/app/api/users/[id]/routes/route.ts` 생성
    - `routes` 컬렉션에서 `authorId`로 필터링, 이름/스팟수/북마크수/생성일 반환
    - _Requirements: 9.1_
  - [x] 2.2 GET /api/users/[id]/bookmarks 구현
    - `src/app/api/users/[id]/bookmarks/route.ts` 생성
    - `route_bookmarks` 컬렉션에서 `userId`로 필터링, routes와 조인하여 코스 정보 반환
    - _Requirements: 9.2_
  - [x] 2.3 GET /api/users/[id]/completions 구현
    - `src/app/api/users/[id]/completions/route.ts` 생성
    - `route_completions` 컬렉션에서 `userId`로 필터링, routes와 조인하여 코스명/스팟수/완주일 반환
    - _Requirements: 9.3_
  - [x] 2.4 GET /api/users/[id]/reports 구현
    - `src/app/api/users/[id]/reports/route.ts` 생성
    - `spot_reports` 컬렉션에서 `reporterId`로 필터링, 스팟명/상태/제보일 반환
    - _Requirements: 9.4_
  - [x] 2.5 GET /api/users/[id]/supplements 구현
    - `src/app/api/users/[id]/supplements/route.ts` 생성
    - `spot_supplements` 컬렉션에서 `contributorId`로 필터링, 스팟명/유형/상태/신청일 반환
    - _Requirements: 9.5_
  - [x] 2.6 GET /api/users/[id]/status-reports 구현
    - `src/app/api/users/[id]/status-reports/route.ts` 생성
    - `spot_status_reports` 컬렉션에서 `reporterId`로 필터링, 스팟명/신고상태/처리여부/신고일 반환
    - _Requirements: 9.6_
  - [x] 2.7 GET /api/users/[id]/posts 구현
    - `src/app/api/users/[id]/posts/route.ts` 생성
    - `posts` 컬렉션에서 `userId`로 필터링, 제목/내용미리보기(100자)/조회수/댓글수/작성일 반환
    - _Requirements: 9.7_
  - [x] 2.8 GET /api/users/[id]/comments 구현
    - `src/app/api/users/[id]/comments/route.ts` 생성
    - `comments` 컬렉션에서 `userId`로 필터링, posts와 조인하여 게시글제목/내용미리보기(80자)/작성일 반환
    - _Requirements: 9.8_
  - [ ]* 2.9 GET 엔드포인트 속성 테스트
    - **Property 8: API 유저 데이터 필터링 정확성**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

- [x] 3. API Routes 구현 — PUT 엔드포인트 및 통계 확장
  - [x] 3.1 PUT /api/users/[id] 구현
    - `src/app/api/users/[id]/route.ts` 수정 (기존 GET에 PUT 핸들러 추가)
    - 세션 검증 → 권한 확인(403) → 유효성 검사(400) → 업데이트 → 응답
    - 이름: 빈 문자열/공백만 거부, 50자 제한
    - _Requirements: 9.9, 9.10, 9.11_
  - [x] 3.2 GET /api/users/[id]/stats 확장
    - 기존 stats 엔드포인트에 completedRoutes, registeredSpots, reportCount, postCount 필드 추가
    - route_completions, spots, spot_reports, posts 컬렉션에서 각각 count 집계
    - _Requirements: 8.4, 8.5_
  - [ ]* 3.3 PUT 엔드포인트 속성 테스트 — 이름 유효성
    - **Property 6: 프로필 이름 유효성 검사**
    - **Validates: Requirements 7.5**
  - [ ]* 3.4 PUT 엔드포인트 속성 테스트 — 권한 검증
    - **Property 10: 프로필 업데이트 권한 검증**
    - **Validates: Requirements 9.10**
  - [ ]* 3.5 PUT 엔드포인트 속성 테스트 — 라운드트립
    - **Property 9: 프로필 업데이트 라운드트립**
    - **Validates: Requirements 9.9**

- [x] 4. Checkpoint — API 레이어 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. React Query 훅 확장
  - [x] 5.1 쿼리 키 팩토리 및 신규 훅 추가
    - `src/hooks/useUserQueries.ts`에 userKeys 확장 (routes, bookmarks, completions, reports, supplements, statusReports, posts, comments)
    - useUserRoutes, useUserBookmarks, useUserCompletions, useUserReports, useUserSupplements, useUserStatusReports, useUserPosts, useUserComments 훅 구현
    - 각 훅에 `enabled` 파라미터로 lazy loading 지원
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  - [x] 5.2 useUpdateProfile mutation 훅 추가
    - `src/hooks/useUserQueries.ts`에 useMutation 기반 useUpdateProfile 훅 구현
    - 성공 시 userKeys.info 쿼리 무효화
    - _Requirements: 9.9_

- [x] 6. 프로필 페이지 에러 수정 및 헤더 링크 변경
  - [x] 6.1 Header 프로필 링크 수정
    - `src/components/layout/Header.tsx` 수정
    - 데스크톱: `href="/settings/account"` → `href={`/profile/${user.id}`}`
    - 모바일 메뉴: `href="/settings/account"` → `href={`/profile/${user.id}`}`, 텍스트 "계정 설정" → "마이페이지"
    - _Requirements: 1.2, 1.3, 1.4_
  - [x] 6.2 프로필 페이지 기존 에러 수정
    - `src/app/profile/[id]/page.tsx`의 기존 렌더링 에러 확인 및 수정
    - _Requirements: 1.1_
  - [ ]* 6.3 헤더 링크 속성 테스트
    - **Property 1: 헤더 프로필 링크 정확성**
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 7. 프로필 페이지 재구조화 — 네비게이션 컴포넌트
  - [x] 7.1 SectionNavigation 컴포넌트 구현
    - `src/components/profile/SectionNavigation.tsx` 생성
    - 5개 섹션 탭 (활동/기여/커뮤니티/보관함/관리), 가로 스크롤 지원
    - `isOwner === false`일 때 "관리" 탭 미표시
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 7.2 SubTabNavigation 컴포넌트 구현
    - `src/components/profile/SubTabNavigation.tsx` 생성
    - 각 섹션 내 하위 탭 전환 UI (재사용 가능한 범용 컴포넌트)
    - _Requirements: 2.2_
  - [x] 7.3 ProfileHeader 컴포넌트 리팩토링
    - `src/components/profile/ProfileHeader.tsx` 수정 또는 신규 생성
    - ExtendedUserStats 기반 통계 표시 (총 인증, 방문 스팟, 배지, 완주 코스, 등록 스팟, 제보, 게시글)
    - Owner일 때만 "편집" 버튼 표시
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 7.4 프로필 페이지 메인 레이아웃 재구성
    - `src/app/profile/[id]/page.tsx` 전면 리팩토링
    - URL 쿼리 파라미터 `?section=` 지원, 기본값 'activity'
    - ProfileHeader + SectionNavigation + 섹션 콘텐츠 구조
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_
  - [ ]* 7.5 Owner 전용 UI 가시성 속성 테스트
    - **Property 2: Owner 전용 UI 가시성**
    - **Validates: Requirements 2.4, 2.5, 2.6, 3.4, 8.2, 8.3**
  - [ ]* 7.6 섹션 네비게이션 상태 일관성 속성 테스트
    - **Property 3: 섹션 네비게이션 상태 일관성**
    - **Validates: Requirements 2.2**

- [x] 8. 활동 섹션 구현
  - [x] 8.1 ActivitySection 컴포넌트 구현
    - `src/components/profile/sections/ActivitySection.tsx` 생성
    - 하위 탭: 인증 갤러리 | 코스 완주 | 트로피 룸 | 진행 현황
    - 인증 갤러리: 기존 `CheckInGallery` 컴포넌트 재사용
    - 코스 완주: useUserCompletions 훅으로 완주 목록 표시 (코스명, 완주일, 스팟수)
    - 트로피 룸: 기존 `TrophyRoom` 컴포넌트 재사용
    - 진행 현황: 기존 `ContentProgressCard` 컴포넌트 재사용
    - Owner일 때 인증 갤러리에 삭제 버튼 표시
    - 각 탭 빈 상태 메시지 및 Owner 액션 링크 포함
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 11.1, 11.2, 11.3_

- [x] 9. 기여 섹션 구현
  - [x] 9.1 ContributionSection 컴포넌트 구현
    - `src/components/profile/sections/ContributionSection.tsx` 생성
    - 하위 탭: 등록한 스팟 | 신규 제보 | 정보보완 | 상태신고
    - 등록한 스팟: 기존 useUserReportedSpots 훅 활용 (이름, 주소, 카테고리, 등록일)
    - 신규 제보: useUserReports 훅 (스팟명, 제보일, 처리상태 뱃지)
    - 정보보완: useUserSupplements 훅 (스팟명, 보완유형, 신청일, 처리상태)
    - 상태신고: useUserStatusReports 훅 (스팟명, 신고상태, 신고일, 처리여부)
    - 각 탭 빈 상태 메시지 및 Owner 액션 링크 포함
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 11.2, 11.3_

- [x] 10. 커뮤니티 섹션 구현
  - [x] 10.1 CommunitySection 컴포넌트 구현
    - `src/components/profile/sections/CommunitySection.tsx` 생성
    - 하위 탭: 내 게시글 | 내 댓글
    - 내 게시글: useUserPosts 훅 (제목/미리보기, 작성일, 조회수, 댓글수), 클릭 시 `/community/posts/{postId}` 이동
    - 내 댓글: useUserComments 훅 (내용 미리보기, 작성일, 원문 게시글 링크), 클릭 시 `/community/posts/{postId}` 이동
    - 각 탭 빈 상태 메시지 및 Owner 액션 링크 포함
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.2, 11.3_
  - [ ]* 10.2 상세 페이지 네비게이션 속성 테스트
    - **Property 5: 상세 페이지 네비게이션 정확성**
    - **Validates: Requirements 5.4, 5.7, 6.6**

- [x] 11. 보관함 섹션 구현
  - [x] 11.1 CollectionSection 컴포넌트 구현
    - `src/components/profile/sections/CollectionSection.tsx` 생성
    - 하위 탭: 내가 만든 코스 | 저장한 코스
    - 내가 만든 코스: useUserRoutes 훅 (이름, 스팟수, 생성일, 북마크수), 클릭 시 `/routes/{routeId}` 이동
    - 저장한 코스: useUserBookmarks 훅 (이름, 작성자, 스팟수), 클릭 시 `/routes/{routeId}` 이동
    - 각 탭 빈 상태 메시지 및 Owner 액션 링크 ("코스 만들기" → `/routes/create`, "코스 탐색하기" → `/routes`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 11.2, 11.3_
  - [ ]* 11.2 목록 항목 필드 완전성 속성 테스트
    - **Property 4: 목록 항목 필드 완전성**
    - **Validates: Requirements 3.3, 3.6, 4.3, 4.5, 4.7, 4.9, 5.3, 5.6, 6.3, 6.5**

- [x] 12. Checkpoint — UI 섹션 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. 관리 섹션 구현
  - [x] 13.1 ManagementSection 컴포넌트 구현
    - `src/components/profile/sections/ManagementSection.tsx` 생성
    - 하위 탭: 프로필 편집 | 계정 연동 | 알림 설정
    - 프로필 편집: 이름/이미지 변경 폼, useUpdateProfile mutation 사용, 유효성 검사 (빈 이름 거부, 50자 제한)
    - 계정 연동: 기존 `AccountSettingsContent` 로직 재사용 (useLinkedAccounts 훅, OAuth 프로바이더 연결/해제, 비밀번호 설정)
    - 알림 설정: 푸시 알림 구독/해제 토글
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  - [ ]* 13.2 프로필 헤더 데이터 완전성 속성 테스트
    - **Property 7: 프로필 헤더 데이터 완전성**
    - **Validates: Requirements 8.1, 8.4, 8.5**

- [x] 14. /settings/account 리다이렉트 구현
  - [x] 14.1 리다이렉트 페이지 구현
    - `src/app/settings/account/page.tsx` 수정
    - 로그인 상태: `/profile/{session.user.id}?section=management`로 리다이렉트
    - 비로그인 상태: `/auth/signin?callbackUrl=/settings/account`로 리다이렉트
    - _Requirements: 10.1, 10.2_
  - [ ]* 14.2 리다이렉트 속성 테스트
    - **Property 11: /settings/account 리다이렉트**
    - **Validates: Requirements 10.1**
  - [ ]* 14.3 빈 상태 Owner 액션 링크 속성 테스트
    - **Property 12: 빈 상태 Owner 액션 링크**
    - **Validates: Requirements 11.2, 11.3**

- [x] 15. 최종 Checkpoint — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 프로필 페이지 전체 렌더링 확인 (로그인/비로그인)
  - 5개 섹션 전환 및 데이터 로딩 확인
  - 헤더 프로필 링크 동작 확인
  - `/settings/account` 리다이렉트 동작 확인
  - 프로필 편집 폼 제출 → API 호출 → UI 업데이트 흐름 확인

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 Task는 독립적으로 커밋 가능한 단위로 구성됨
- Property 테스트는 `fast-check` 라이브러리 사용 (프로젝트 기존 의존성)
- 기존 컴포넌트 재사용: CheckInGallery, TrophyRoom, ContentProgressCard, useLinkedAccounts
- 확장 가능 구조: 향후 "내가 추가한 장면", "좋아요한 장면", "제보한 시설" 탭 추가 가능 (Requirement 12)
