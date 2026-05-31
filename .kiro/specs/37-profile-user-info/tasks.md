# 구현 계획: 프로필 페이지 실제 유저 정보 표시

## 개요

`/profile/[id]` 페이지의 하드코딩된 기본 사용자 정보를 제거하고, `GET /api/users/[id]` API와 `useUserInfo` 훅을 통해 실제 사용자 정보를 표시한다. 본인 프로필 여부에 따라 편집 버튼 노출을 제어한다.

## Tasks

- [x] 1. API 상수와 사용자 정보 API 구현
  - `API_ROUTES.USERS.INFO(id)` 추가
  - `src/app/api/users/[id]/route.ts` 생성
  - MongoDB에서 `_id`, `name`, `image`, `createdAt`만 조회
  - `password`, `email` 등 민감 필드 제외
  - 사용자가 없으면 404, DB 오류는 500 반환

- [x] 2. API 응답 안전성 테스트
  - 필수 필드 `id`, `name`, `image`, `createdAt` 검증
  - 민감 필드가 응답에 포함되지 않는지 검증

- [x] 3. `useUserInfo` 훅 추가
  - `enabled: !!userId` 조건으로 빈 요청 차단
  - API 실패 시 오류 throw

- [x] 4. 프로필 페이지 적용
  - 하드코딩 사용자명 제거
  - `formatJoinDate(createdAt)`로 가입일 표시
  - 본인 프로필일 때만 편집 버튼 표시
  - 로딩/오류/빈 상태 처리

## Verification

- API 단위 테스트 통과
- 프로필 페이지 타입 검사 통과
- 로그인 사용자와 타 사용자 프로필 표시 차이 확인
