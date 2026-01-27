# Implementation Plan: Zustand 전역 상태 관리 리팩토링

## Overview

컴포넌트 로컬 상태를 zustand 전역 스토어로 이전하여 상태 관리를 개선합니다.

## 관련 문서

- 요구사항: #[[file:.kiro/specs/zustand-global-state/requirements.md]]
- 설계: #[[file:.kiro/specs/zustand-global-state/design.md]]
- 기존 스토어: #[[file:src/stores/mapStore.ts]]

## Tasks

- [ ] 1. 좋아요 상태 전역 관리
  - [ ] 1.1 likeStore 생성
    - `src/stores/likeStore.ts` 생성
    - likedSceneIds, isLoadingLikes 상태 정의
    - setLikedSceneIds, addLikedScene, removeLikedScene, toggleLikedScene 액션 구현
    - selector 함수 제공 (useLikedSceneIds, useIsLoadingLikes)
    - _Requirements: 1.1_
  - [ ] 1.2 SceneGallery에 likeStore 적용
    - `src/components/spot/SceneGallery.tsx` 수정
    - 로컬 상태 likedSceneIds, isLoadingLikes를 likeStore로 교체
    - useEffect에서 likeStore.setLikedSceneIds 호출
    - handleLike에서 likeStore.toggleLikedScene 호출
    - _Requirements: 1.2, 1.3_
  - [ ] 1.3 SceneImageModal에 likeStore 적용
    - `src/components/spot/SceneImageModal.tsx` 수정
    - props로 받던 likedSceneIds를 likeStore에서 직접 참조
    - _Requirements: 1.2_

- [ ] 2. 인증 UI 상태 전역 관리
  - [ ] 2.1 authStore 생성
    - `src/stores/authStore.ts` 생성
    - isLoggingOut, authError 상태 정의
    - setLoggingOut, setAuthError, clearAuthError 액션 구현
    - selector 함수 제공
    - _Requirements: 2.1, 2.2_
  - [ ] 2.2 useAuth 훅에 authStore 적용
    - `src/hooks/useAuth.ts` 수정
    - 로컬 상태 isLoggingOut, error를 authStore로 교체
    - 기존 인터페이스 유지 (하위 호환성)
    - _Requirements: 2.3_

- [ ] 3. 카테고리 필터 상태 전역 관리
  - [ ] 3.1 filterStore 생성
    - `src/stores/filterStore.ts` 생성
    - selectedCategories 상태 정의
    - setSelectedCategories, toggleCategory, clearCategories 액션 구현
    - selector 함수 제공
    - _Requirements: 3.1_
  - [ ] 3.2 CategoryFilter에 filterStore 적용
    - `src/components/map/CategoryFilter.tsx` 수정
    - props로 받던 selectedCategories를 filterStore로 교체
    - onChange 콜백 대신 filterStore.toggleCategory 직접 호출
    - _Requirements: 3.2_
  - [ ] 3.3 PilgrimageMap에 filterStore 적용
    - `src/components/map/PilgrimageMap.tsx` 수정
    - 로컬 상태 selectedCategories를 filterStore로 교체
    - useSpots 훅에 filterStore.selectedCategories 전달
    - _Requirements: 3.3_

- [ ] 4. 코드 정리 및 검증
  - [ ] 4.1 불필요한 로컬 상태 코드 제거
    - 마이그레이션 완료된 컴포넌트에서 사용하지 않는 로컬 상태 제거
    - 불필요한 props 제거
    - _Requirements: 코드 품질_
  - [ ] 4.2 스토어 index.ts 생성
    - `src/stores/index.ts` 생성
    - 모든 스토어 re-export
    - _Requirements: 코드 품질_

- [ ] 5. Checkpoint - 전역 상태 관리 검증
  - 좋아요 상태가 페이지 이동 후에도 유지되는지 확인
  - 카테고리 필터가 지도와 동기화되는지 확인
  - 로그아웃 상태가 전역으로 관리되는지 확인
  - 빌드 및 타입 체크 통과 확인

## Notes

- 기존 mapStore, uiStore 패턴을 따라 일관성 유지
- devtools 미들웨어로 디버깅 용이성 확보
- selector 함수로 불필요한 리렌더링 방지
- 하위 호환성을 위해 기존 인터페이스 유지
