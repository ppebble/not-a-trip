# Requirements Document

## Introduction

프로필 페이지(`/profile/[id]`)에서 현재 하드코딩된 유저 이름 `'순례자'` 대신 실제 유저 정보(이름, 프로필 이미지, 가입일)를 DB에서 조회하여 표시한다. `GET /api/users/[id]` API Route를 신규 구현하고, `useUserInfo(userId)` React Query 훅을 추가하며, 본인 프로필과 타인 프로필을 구분하여 본인에게만 편집 버튼을 노출한다.

## Glossary

- **Profile_Page**: `/profile/[id]` 경로의 유저 프로필 페이지 (`src/app/profile/[id]/page.tsx`)
- **User_Info_API**: `GET /api/users/[id]` 엔드포인트 — 유저 기본 정보를 반환하는 API Route
- **UserInfo**: 유저 기본 정보 객체 — `id`, `name`, `image`, `createdAt` 필드를 포함
- **useUserInfo**: `UserInfo`를 조회하는 React Query 커스텀 훅
- **Session**: NextAuth.js가 제공하는 현재 로그인 유저의 세션 정보
- **Owner**: 프로필 페이지의 URL 파라미터 `id`와 Session의 `user.id`가 일치하는 경우 — 본인 프로필

## Requirements

### Requirement 1: 유저 기본 정보 API 구현

**User Story:** As a 프로필 페이지 방문자, I want 유저의 실제 이름과 프로필 이미지를 볼 수 있기를, so that 누구의 프로필인지 명확히 알 수 있다.

#### Acceptance Criteria

1. WHEN `GET /api/users/[id]` 요청이 수신되면, THE User_Info_API SHALL MongoDB `users` 컬렉션에서 해당 `id`에 해당하는 유저를 조회한다.
2. WHEN 유저가 존재하면, THE User_Info_API SHALL `id`, `name`, `image`, `createdAt` 필드를 포함한 JSON 응답을 HTTP 200으로 반환한다.
3. IF 요청된 `id`에 해당하는 유저가 존재하지 않으면, THEN THE User_Info_API SHALL HTTP 404와 `{ error: '유저를 찾을 수 없습니다' }` 응답을 반환한다.
4. IF 서버 내부 오류가 발생하면, THEN THE User_Info_API SHALL HTTP 500과 `{ error: '유저 정보 조회에 실패했습니다' }` 응답을 반환한다.
5. THE User_Info_API SHALL 응답에 비밀번호(`password`), 이메일(`email`) 등 민감한 필드를 포함하지 않는다.

### Requirement 2: useUserInfo 훅 구현

**User Story:** As a 프론트엔드 개발자, I want React Query 훅으로 유저 정보를 조회하기를, so that 로딩 상태와 에러 처리를 일관되게 관리할 수 있다.

#### Acceptance Criteria

1. THE useUserInfo SHALL `userId` 파라미터를 받아 `GET /api/users/[id]` 엔드포인트를 호출한다.
2. WHEN `userId`가 빈 문자열이거나 `undefined`이면, THE useUserInfo SHALL API 요청을 실행하지 않는다.
3. WHEN API 요청이 성공하면, THE useUserInfo SHALL `UserInfo` 타입의 데이터를 반환한다.
4. IF API 요청이 실패하면, THEN THE useUserInfo SHALL 에러 상태를 반환한다.
5. THE useUserInfo SHALL `userKeys.info(userId)` 쿼리 키를 사용하여 기존 `userKeys` 팩토리와 일관성을 유지한다.

### Requirement 3: 프로필 페이지에서 실제 유저 정보 표시

**User Story:** As a 프로필 페이지 방문자, I want 실제 유저 이름과 프로필 이미지를 보기를, so that 하드코딩된 `'순례자'` 대신 정확한 정보를 확인할 수 있다.

#### Acceptance Criteria

1. THE Profile_Page SHALL `useUserInfo(userId)` 훅을 사용하여 유저 정보를 조회한다.
2. WHEN 유저 정보 로딩이 완료되면, THE Profile_Page SHALL 유저의 실제 `name`을 프로필 헤더에 표시한다.
3. WHEN 유저의 `image`가 존재하면, THE Profile_Page SHALL 해당 이미지를 프로필 사진으로 표시한다.
4. WHEN 유저의 `image`가 존재하지 않으면, THE Profile_Page SHALL 기본 아이콘(`AppIcon name="profile-front"`)을 표시한다.
5. WHEN 유저의 `createdAt`이 존재하면, THE Profile_Page SHALL 가입일을 `YYYY년 MM월 가입` 형식으로 표시한다.
6. WHILE 유저 정보를 로딩 중이면, THE Profile_Page SHALL 기존 스켈레톤 UI를 유지한다.

### Requirement 4: 본인 프로필 vs 타인 프로필 구분

**User Story:** As a 로그인한 유저, I want 내 프로필에서만 편집 버튼을 보기를, so that 타인의 프로필을 실수로 수정하려는 시도를 방지할 수 있다.

#### Acceptance Criteria

1. THE Profile_Page SHALL NextAuth.js `useSession` 훅으로 현재 로그인 유저의 Session을 조회한다.
2. WHEN Session의 `user.id`와 URL 파라미터 `userId`가 일치하면, THE Profile_Page SHALL 프로필 헤더에 편집 버튼을 표시한다.
3. WHEN Session의 `user.id`와 URL 파라미터 `userId`가 일치하지 않으면, THE Profile_Page SHALL 편집 버튼을 표시하지 않는다.
4. WHEN 로그인하지 않은 상태에서 프로필 페이지를 방문하면, THE Profile_Page SHALL 편집 버튼을 표시하지 않는다.
5. THE Profile_Page SHALL 편집 버튼 클릭 시 `/profile/edit` 경로로 이동한다.

### Requirement 5: API 라우트 상수 등록

**User Story:** As a 프론트엔드 개발자, I want API 경로를 중앙에서 관리하기를, so that URL 변경 시 한 곳만 수정하면 된다.

#### Acceptance Criteria

1. THE User_Info_API SHALL `src/lib/api-routes.ts`의 `API_ROUTES.USERS` 객체에 `INFO: (id: string) => \`/api/users/\${id}\`` 항목으로 등록된다.
2. THE useUserInfo SHALL `API_ROUTES.USERS.INFO(userId)` 상수를 사용하여 엔드포인트를 호출한다.
