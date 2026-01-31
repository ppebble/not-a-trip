# Design Document: Multi-Content Spot (다중 작품 연결 스팟)

## Overview

이 기능은 하나의 스팟에 여러 관련 콘텐츠(작품)를 연결할 수 있도록 UI/UX를 개선합니다. 기존 `RelatedContentForm` 컴포넌트를 확장하여 다중 콘텐츠 추가, 순서 변경, 중복 방지 기능을 구현하고, 스팟 상세 페이지에서 모든 연결된 콘텐츠를 효과적으로 표시합니다.

## Architecture

```mermaid
graph TB
    subgraph "스팟 등록/수정 폼"
        SF[SpotForm]
        RCF[RelatedContentForm]
        RCI[RelatedContentItem]
        RCA[RelatedContentAddForm]
    end

    subgraph "스팟 상세 페이지"
        SDP[SpotDetailPage]
        RCS[RelatedContentSection]
        RCG[RelatedContentGrid]
    end

    subgraph "데이터 흐름"
        RC[RelatedContent[]]
    end

    SF --> RCF
    RCF --> RCI
    RCF --> RCA
    RCF --> RC

    SDP --> RCS
    RCS --> RCG
    RC --> RCS
```

## Components and Interfaces

### 1. RelatedContentForm (확장)

기존 컴포넌트를 확장하여 다음 기능을 추가합니다:

```typescript
interface RelatedContentFormProps {
  value: RelatedContent[]
  onChange: (contents: RelatedContent[]) => void
  maxItems?: number // 최대 추가 가능 개수 (기본값: 20)
}

// 내부 상태
interface RelatedContentFormState {
  isAdding: boolean
  newContent: Partial<RelatedContent>
  draggedIndex: number | null
  duplicateWarning: string | null
}
```

### 2. RelatedContentItem (신규)

개별 콘텐츠 항목을 표시하고 드래그 앤 드롭을 지원하는 컴포넌트:

```typescript
interface RelatedContentItemProps {
  content: RelatedContent
  index: number
  onRemove: () => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  isDragging: boolean
  isDragOver: boolean
}
```

### 3. RelatedContentSection (신규)

스팟 상세 페이지에서 관련 콘텐츠를 표시하는 섹션 컴포넌트:

```typescript
interface RelatedContentSectionProps {
  contents: RelatedContent[]
  initialDisplayCount?: number // 기본값: 3
}

interface RelatedContentSectionState {
  isExpanded: boolean
}
```

## Data Models

기존 데이터 모델을 그대로 사용합니다:

```typescript
// 기존 타입 (변경 없음)
interface RelatedContent {
  name: string
  type: ContentType
  year?: number
  additionalInfo?: string
}

type ContentType =
  | 'anime'
  | 'movie'
  | 'drama'
  | 'sports_team'
  | 'artist'
  | 'game'
  | 'other'
```

### 중복 검사 유틸리티

```typescript
/**
 * 콘텐츠 이름 정규화 (중복 검사용)
 */
function normalizeContentName(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * 중복 콘텐츠 검사
 */
function isDuplicateContent(
  contents: RelatedContent[],
  newName: string
): boolean {
  const normalizedNew = normalizeContentName(newName)
  return contents.some((c) => normalizeContentName(c.name) === normalizedNew)
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: 콘텐츠 추가 불변성

_For any_ 기존 RelatedContent 배열과 새로운 유효한 RelatedContent 항목에 대해, 추가 연산 후 결과 배열은 기존의 모든 항목과 새 항목을 포함해야 한다.

**Validates: Requirements 1.2, 5.3**

### Property 2: 콘텐츠 삭제 정확성

_For any_ RelatedContent 배열과 유효한 인덱스에 대해, 해당 인덱스의 항목을 삭제하면 결과 배열의 길이는 1 감소하고, 삭제된 항목을 제외한 모든 항목이 원래 순서대로 유지되어야 한다.

**Validates: Requirements 1.3**

### Property 3: 순서 변경 불변성

_For any_ RelatedContent 배열과 두 개의 유효한 인덱스에 대해, 순서 변경(reorder) 연산 후 결과 배열은 원본과 동일한 항목들을 포함하고 길이가 동일해야 한다 (내용물 보존, 순서만 변경).

**Validates: Requirements 2.1**

### Property 4: 콘텐츠 표시 개수 제한 및 확장

_For any_ 4개 이상의 RelatedContent 배열에 대해, 초기 표시 상태에서는 정확히 3개만 표시되고, 확장 상태에서는 모든 항목이 표시되어야 한다.

**Validates: Requirements 3.2, 3.3**

### Property 5: 콘텐츠 렌더링 완전성

_For any_ RelatedContent 항목에 대해, 렌더링 결과는 해당 항목의 name, type을 포함해야 하고, year와 additionalInfo가 존재하면 이들도 포함해야 한다.

**Validates: Requirements 3.4**

### Property 6: 중복 검사 정규화

_For any_ 문자열 name에 대해, 대소문자를 변경하거나 앞뒤에 공백을 추가해도 정규화 함수는 동일한 결과를 반환해야 한다. 또한, 정규화된 이름이 기존 배열에 존재하면 중복으로 감지되어야 한다.

**Validates: Requirements 4.1, 4.3**

### Property 7: 데이터 로드 라운드트립

_For any_ 유효한 Spot 데이터에 대해, 수정 폼에 로드한 후 변경 없이 저장하면 원본 relatedContent 배열과 동일한 데이터가 유지되어야 한다.

**Validates: Requirements 5.1, 5.2**

## Error Handling

### 입력 검증 오류

| 오류 상황            | 처리 방법                             |
| -------------------- | ------------------------------------- |
| 빈 콘텐츠 이름       | 추가 버튼 비활성화, 에러 메시지 표시  |
| 중복 콘텐츠          | 경고 메시지 표시, 강제 추가 옵션 제공 |
| 최대 개수 초과       | 추가 버튼 비활성화, 안내 메시지 표시  |
| 잘못된 드래그 인덱스 | 연산 무시, 원본 상태 유지             |

### API 오류

| 오류 상황      | 처리 방법                          |
| -------------- | ---------------------------------- |
| 스팟 로드 실패 | 에러 메시지 표시, 재시도 버튼 제공 |
| 스팟 저장 실패 | 에러 메시지 표시, 입력 데이터 유지 |

## Testing Strategy

### 단위 테스트

- `normalizeContentName` 함수: 다양한 입력에 대한 정규화 결과 확인
- `isDuplicateContent` 함수: 중복 검사 로직 확인
- `RelatedContentItem` 컴포넌트: 렌더링 및 이벤트 핸들링 확인
- `RelatedContentSection` 컴포넌트: 초기 표시 개수 및 확장 기능 확인

### 속성 기반 테스트

- **Property 1-3**: 배열 연산의 정확성 검증 (fast-check 사용)
- **Property 6**: 문자열 정규화 함수의 멱등성 검증
- **Property 7**: 데이터 라운드트립 검증

### 통합 테스트

- 스팟 등록 플로우: 여러 콘텐츠 추가 후 저장
- 스팟 수정 플로우: 기존 콘텐츠 로드, 수정, 저장
- 스팟 상세 페이지: 다중 콘텐츠 표시 및 확장

### 테스트 라이브러리

- **단위 테스트**: Jest + React Testing Library
- **속성 기반 테스트**: fast-check (최소 100회 반복)
- **E2E 테스트**: Playwright (선택적)
