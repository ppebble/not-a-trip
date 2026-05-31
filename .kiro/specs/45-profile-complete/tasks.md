# Implementation Plan: 프로필 페이지 활동 허브 완성

## Overview

프로필 페이지를 활동, 기여, 커뮤니티, 보관함, 관리 5개 섹션의 활동 허브로 재설계한다. 사용자별 GET API 8개와 프로필 수정 PUT API를 추가하고, React Query 훅을 확장하며, 기존 `/settings/account` 흐름을 프로필 관리 섹션으로 통합한다.

## Tasks

- [x] 1. API 상수와 타입 정의
  - `API_ROUTES.USERS`에 ROUTES, BOOKMARKS, COMPLETIONS, REPORTS, SUPPLEMENTS, STATUS_REPORTS, POSTS, COMMENTS, UPDATE 추가
  - `ExtendedUserStats`, `UserRoute`, `UserBookmark`, `UserCompletion`, `UserReport`, `UserSupplement`, `UserStatusReport`, `UserPost`, `UserComment` 타입 추가
  - `ProfileSection`을 `activity | contribution | community | collection | management`로 정의

- [x] 2. 사용자별 GET API 구현
  - routes, bookmarks, completions, reports, supplements, status-reports, posts, comments 엔드포인트 구현
  - 각 엔드포인트에서 `userId` 필터와 필요한 projection 적용
  - 빈 결과는 빈 배열로 반환

- [x] 3. 프로필 수정 PUT API 구현
  - 세션 권한 확인
  - 이름 공백/길이 제한 검증
  - 이미지 URL 업데이트 처리
  - 권한 없음, 잘못된 입력, DB 오류 응답 분리

- [x] 4. React Query 훅 확장
  - 사용자별 목록 조회 훅 추가
  - 프로필 업데이트 mutation 추가
  - query key factory 정리

- [x] 5. 프로필 페이지 구조 개편
  - 5개 섹션 내비게이션 추가
  - 활동/기여/커뮤니티/보관함/관리 섹션별 빈 상태와 owner action 제공
  - owner가 아닐 때 관리 섹션 숨김

- [x] 6. `/settings/account` 리다이렉트
  - 로그인 사용자는 `/profile/{session.user.id}?section=management`로 이동
  - 비로그인 사용자는 로그인 페이지로 이동

- [x] 7. 최종 검증
  - `npm run type-check`
  - 주요 프로필 흐름 수동 확인

## Notes

- 향후 좋아요한 장면, 제보한 시설, 뱃지 상세 등 추가 섹션을 같은 구조로 확장할 수 있다.
