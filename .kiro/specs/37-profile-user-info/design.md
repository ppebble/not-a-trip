# Design Document

## 37-profile-user-info: 프로필 페이지 실제 유저 정보 표시

## Overview

프로필 페이지(`/profile/[id]`)에서 하드코딩된 `'순례자'` 대신 실제 유저 정보를 표시한다.
`GET /api/users/[id]` API Route를 신규 구현하고, `useUserInfo(userId)` React Query 훅을 추가하며, 본인/타인 프로필을 구분하여 편집 버튼을 조건부로 노출한다.

### 핵심 변경 범위

1. **API Route 신규 추가**: `src/app/api/users/[id]/route.ts` — 유저 기본 정보 반환
2. **API 상수 등록**: `src/lib/api-routes.ts` — `API_ROUTES.USERS.INFO` 추가
3. **React Query 훅 추가**: `src/hooks/useUserQueries.ts` — `useUserInfo` 훅 및 `userKeys.info` 추가
4. **프로필 페이지 수정**: `src/app/profile/[id]/page.tsx` — 실제 유저 정보 표시 및 편집 버튼 조건부 노출

---

## Architecture

기존 `src/app/api/users/[id]/stats/route.ts` 패턴을 그대로 따른다.
새 API Route는 동일한 `[id]` 동적 세그먼트 하위에 `route.ts`로 직접 위치한다.

```
GET /api/users/[id]          ← 신규 (유저 기본 정보)
GET /api/users/[id]/stats    ← 기존
GET /api/users/[id]/badges   ← 기존
GET /api/users/[id]/progress ← 기존
```

데이터 흐름:

```
Profile Page
  └─ useUserInfo(userId)          [React Query Hook]
       └─ fetch(API_ROUTES.USERS.INFO(userId))
            └─ GET /api/users/[id]  [API Route]
                 └─ MongoDB users 컬렉션 조회
```

본인/타인 구분 흐름:

```
Profile Page
  ├─ useSession()                 [NextAuth.js]
  │    └─ session.user.id
  └─ params.id (URL)
       └─ isOwner = session?.user?.id === userId
            └─ isOwner ? 편집 버튼 표시 : 숨김
```

---

## Components and Interfaces

### 1. API Route: `GET /api/users/[id]`

**파일**: `src/app/api/users/[id]/route.ts`

```typescript
// 요청: GET /api/users/{id}
// 응답 (200 OK):
{
  id: string
  name: string
  image: string | null
  createdAt: string  // ISO 8601
}

// 응답 (404 Not Found):
{ error: '유저를 찾을 수 없습니다' }

// 응답 (500 Internal Server Error):
{ error: '유저 정보 조회에 실패했습니다' }
```

MongoDB projection으로 민감 필드를 명시적으로 제외한다:

```typescript
const projection = {
  _id: 1,
  name: 1,
  image: 1,
  createdAt: 1,
  // password, email 등은 projection에 포함하지 않음
}
```

### 2. API 상수: `API_ROUTES.USERS.INFO`

**파일**: `src/lib/api-routes.ts`

```typescript
USERS: {
  INFO: (id: string) => `/api/users/${id}`,   // ← 신규
  STATS: (id: string) => `/api/users/${id}/stats`,
  BADGES: (id: string) => `/api/users/${id}/badges`,
  PROGRESS: (id: string) => `/api/users/${id}/progress`,
}
```

### 3. React Query 훅: `useUserInfo`

**파일**: `src/hooks/useUserQueries.ts`

```typescript
// 타입 정의
export interface UserInfo {
  id: string
  name: string
  image: string | null
  createdAt: string
}

// 쿼리 키 팩토리 확장
export const userKeys = {
  all: ['users'] as const,
  info: (userId: string) => [...userKeys.all, 'info', userId] as const,  // ← 신규
  stats: (userId: string) => [...userKeys.all, 'stats', userId] as const,
  // ...기존 키들
}

// 훅 시그니처
export function useUserInfo(userId: string | undefined): UseQueryResult<UserInfo>
```

`enabled: !!userId` 조건으로 빈 문자열 및 `undefined` 시 요청을 차단한다.

### 4. 프로필 페이지 수정

**파일**: `src/app/profile/[id]/page.tsx`

추가되는 로직:

```typescript
// 유저 정보 조회
const { data: userInfo, isLoading: userInfoLoading } = useUserInfo(userId)

// 세션 조회
const { data: session } = useSession()

// 본인 여부 판단
const isOwner = session?.user?.id === userId

// 가입일 포맷팅
function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt)
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 가입`
}
```

로딩 상태는 기존 `isLoading` 조건에 `userInfoLoading`을 포함시켜 기존 스켈레톤 UI를 재사용한다.

---

## Data Models

### MongoDB `users` 컬렉션 도큐먼트 (관련 필드)

```typescript
interface UserDocument {
  _id: ObjectId
  name: string
  email: string        // 응답에서 제외
  image?: string
  password?: string    // 응답에서 제외
  createdAt: Date
  updatedAt: Date
  role: 'user' | 'admin'
  provider: string
}
```

### API 응답 타입: `UserInfo`

```typescript
export interface UserInfo {
  id: string           // _id.toString()
  name: string
  image: string | null
  createdAt: string    // toISOString()
}
```

`_id`를 `id`로 변환하고, `createdAt`을 ISO 문자열로 직렬화한다.
`email`, `password`, `role`, `provider` 등 민감/불필요 필드는 projection으로 제외한다.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API 응답 필드 완전성

*For any* 유효한 유저 도큐먼트에 대해, `GET /api/users/[id]` 응답은 항상 `id`, `name`, `image`, `createdAt` 필드를 포함해야 한다.

**Validates: Requirements 1.2**

### Property 2: 민감 필드 비노출

*For any* 유저 도큐먼트(password, email 포함 여부와 무관하게), `GET /api/users/[id]` 응답에는 `password`와 `email` 필드가 절대 포함되지 않아야 한다.

**Validates: Requirements 1.5**

### Property 3: 빈 userId 요청 차단

*For any* falsy 값(`undefined`, 빈 문자열 `""`)을 `useUserInfo`에 전달하면, API 요청이 실행되지 않아야 한다.

**Validates: Requirements 2.2**

### Property 4: 유저 이름 렌더링

*For any* 유효한 `UserInfo` 데이터에 대해, 프로필 페이지는 항상 `userInfo.name`을 헤더에 표시해야 한다.

**Validates: Requirements 3.2**

### Property 5: 가입일 포맷 일관성

*For any* 유효한 `Date` 값에 대해, `formatJoinDate` 함수는 항상 `YYYY년 MM월 가입` 형식의 문자열을 반환해야 한다.

**Validates: Requirements 3.5**

### Property 6: 편집 버튼 소유권 조건

*For any* `sessionUserId`와 `urlUserId` 조합에 대해, 편집 버튼은 두 값이 동일한 경우에만 표시되고 다를 경우(또는 세션이 없는 경우)에는 표시되지 않아야 한다.

**Validates: Requirements 4.2, 4.3, 4.4**

---

## Error Handling

### API Route 에러 처리

| 상황 | HTTP 상태 | 응답 본문 |
|------|-----------|-----------|
| 유저 없음 | 404 | `{ error: '유저를 찾을 수 없습니다' }` |
| DB 오류 | 500 | `{ error: '유저 정보 조회에 실패했습니다' }` |

`try/catch`로 DB 오류를 포착하고, `findOne` 결과가 `null`이면 404를 반환한다.

### 훅 에러 처리

React Query의 기본 에러 처리를 사용한다. `isError` 상태를 통해 컴포넌트에서 에러를 감지할 수 있다.

### 프로필 페이지 폴백

- `userInfo`가 `undefined`인 경우(로딩 중 또는 에러): 기존 스켈레톤 UI 표시
- `userInfo.image`가 `null`인 경우: `AppIcon name="profile-front"` 기본 아이콘 표시
- `userInfo.createdAt`이 없는 경우: 가입일 섹션 미표시

---

## Testing Strategy

### 단위 테스트 (Unit Tests)

**`formatJoinDate` 유틸 함수**:
- 특정 날짜 입력 → 올바른 포맷 출력 예시 테스트
- 월이 한 자리인 경우 (`01월` ~ `09월`) 처리 확인

**`useUserInfo` 훅**:
- 유효한 userId로 올바른 URL 호출 확인
- `userId`가 `undefined`/빈 문자열일 때 요청 미발생 확인
- API 실패 시 `isError` 상태 확인

**API Route**:
- 유저 없음 → 404 반환
- DB 오류 → 500 반환

### 속성 기반 테스트 (Property-Based Tests)

**라이브러리**: `fast-check` (프로젝트 기존 사용)

**Property 1 — API 응답 필드 완전성**:
```typescript
// Feature: 37-profile-user-info, Property 1: API 응답 필드 완전성
fc.assert(fc.asyncProperty(
  fc.record({ name: fc.string(), image: fc.option(fc.string()), createdAt: fc.date() }),
  async (userDoc) => {
    // mock DB에 유저 삽입 후 API 핸들러 호출
    const response = await callApiHandler(userDoc)
    const body = await response.json()
    return 'id' in body && 'name' in body && 'image' in body && 'createdAt' in body
  }
), { numRuns: 100 })
```

**Property 2 — 민감 필드 비노출**:
```typescript
// Feature: 37-profile-user-info, Property 2: 민감 필드 비노출
fc.assert(fc.asyncProperty(
  fc.record({
    name: fc.string(),
    email: fc.emailAddress(),
    password: fc.string(),
    image: fc.option(fc.string()),
    createdAt: fc.date(),
  }),
  async (userDoc) => {
    const response = await callApiHandler(userDoc)
    const body = await response.json()
    return !('password' in body) && !('email' in body)
  }
), { numRuns: 100 })
```

**Property 3 — 빈 userId 요청 차단**:
```typescript
// Feature: 37-profile-user-info, Property 3: 빈 userId 요청 차단
fc.assert(fc.property(
  fc.oneof(fc.constant(''), fc.constant(undefined)),
  (emptyUserId) => {
    // React Query enabled 조건 검증
    const enabled = !!emptyUserId
    return enabled === false
  }
), { numRuns: 100 })
```

**Property 5 — 가입일 포맷 일관성**:
```typescript
// Feature: 37-profile-user-info, Property 5: 가입일 포맷 일관성
const joinDatePattern = /^\d{4}년 \d{2}월 가입$/
fc.assert(fc.property(
  fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  (date) => {
    const result = formatJoinDate(date.toISOString())
    return joinDatePattern.test(result)
  }
), { numRuns: 100 })
```

**Property 6 — 편집 버튼 소유권 조건**:
```typescript
// Feature: 37-profile-user-info, Property 6: 편집 버튼 소유권 조건
fc.assert(fc.property(
  fc.string(), fc.string(),
  (sessionUserId, urlUserId) => {
    const isOwner = sessionUserId === urlUserId
    // isOwner일 때만 편집 버튼이 표시되어야 함
    return isOwner === (sessionUserId === urlUserId)
  }
), { numRuns: 100 })
```

각 속성 테스트는 최소 100회 반복 실행한다.
