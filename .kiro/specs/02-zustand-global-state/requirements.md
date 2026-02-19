# Requirements: Zustand 전역 상태 관리 리팩토링

## Overview

현재 컴포넌트 로컬 상태로 관리되고 있는 상태들 중 전역으로 관리하면 효율적인 항목들을 zustand 스토어로 이전합니다.

## 관련 문서

- 프로젝트 컨텍스트: #[[file:.kiro/steering/project-context.md]]
- 기존 스토어: #[[file:src/stores/mapStore.ts]], #[[file:src/stores/uiStore.ts]]
- 인증 훅: #[[file:src/hooks/useAuth.ts]]
- 장면 갤러리: #[[file:src/components/spot/SceneGallery.tsx]]

## User Stories

### US-1: 좋아요 상태 전역 관리

**As a** 사용자
**I want** 좋아요한 장면 ID가 전역으로 관리되기를
**So that** 페이지 이동 후에도 좋아요 상태가 유지되고, 불필요한 API 호출이 줄어듭니다

#### Acceptance Criteria

- 1.1 좋아요한 장면 ID를 전역 스토어에서 관리한다
- 1.2 SceneGallery에서 로컬 상태 대신 전역 스토어를 사용한다
- 1.3 좋아요 토글 시 전역 스토어가 업데이트된다
- 1.4 페이지 이동 후에도 좋아요 상태가 유지된다

### US-2: 인증 상태 전역 관리

**As a** 개발자
**I want** 인증 관련 로딩/에러 상태가 전역으로 관리되기를
**So that** 여러 컴포넌트에서 일관된 인증 상태를 참조할 수 있습니다

#### Acceptance Criteria

- 2.1 로그아웃 진행 상태(isLoggingOut)를 전역 스토어에서 관리한다
- 2.2 인증 에러 상태를 전역 스토어에서 관리한다
- 2.3 useAuth 훅에서 전역 스토어를 활용한다

### US-3: 카테고리 필터 상태 전역 관리

**As a** 사용자
**I want** 선택한 카테고리 필터가 전역으로 관리되기를
**So that** 지도와 다른 컴포넌트 간 필터 상태가 동기화됩니다

#### Acceptance Criteria

- 3.1 선택된 카테고리 필터를 전역 스토어에서 관리한다
- 3.2 CategoryFilter 컴포넌트에서 전역 스토어를 사용한다
- 3.3 useSpots 훅에서 전역 필터 상태를 참조한다

## Technical Requirements

### TR-1: 스토어 구조

- 기존 mapStore, uiStore 패턴을 따른다
- devtools 미들웨어를 사용한다
- selector 함수를 제공한다

### TR-2: 성능 최적화

- 불필요한 리렌더링을 방지하기 위해 selector를 활용한다
- 상태 업데이트는 최소 단위로 수행한다

## Out of Scope

- persist 미들웨어 (로컬 스토리지 저장)
- 서버 상태 관리 (React Query가 담당)
