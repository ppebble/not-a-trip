# Implementation Plan: Content Search Filter

## Overview

콘텐츠 검색 필터 기능을 구현합니다. filterStore 확장 → API 구현 → UI 컴포넌트 순서로 진행하여 각 단계에서 동작을 검증할 수 있도록 합니다.

## Tasks

- [x] 1. filterStore 검색 상태 확장
  - [x] 1.1 filterStore에 searchQuery 상태 및 액션 추가
    - searchQuery: string 필드 추가
    - setSearchQuery, clearSearchQuery 액션 추가
    - useSearchQuery 셀렉터 추가
    - _Requirements: 4.1, 4.2, 4.4_
  - [ ]\* 1.2 filterStore 검색 상태 속성 테스트 작성
    - **Property 10: 스토어 검색어 상태 독립성**
    - **Validates: Requirements 4.1, 4.3, 4.4**

- [x] 2. 자동완성 API 구현
  - [x] 2.1 /api/content-names 엔드포인트 생성
    - GET 메서드로 중복 제거된 콘텐츠명 목록 반환
    - search 쿼리 파라미터로 서버 사이드 필터링
    - 각 항목에 category, count 정보 포함
    - 최대 10개 제한
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]\* 2.2 자동완성 API 속성 테스트 작성
    - **Property 4: 자동완성 최대 10개 제한**
    - **Property 6: 자동완성 항목 카테고리 정보 포함**
    - **Property 11: 자동완성 API 중복 제거**
    - **Validates: Requirements 2.2, 2.6, 5.2, 5.3**

- [x] 3. 스팟 API 검색 필터 통합
  - [x] 3.1 /api/spots에 search 쿼리 파라미터 추가
    - relatedContent.name 부분 일치 검색 (대소문자 무시)
    - category와 AND 조건 결합
    - 빈 문자열 시 필터 미적용
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]\* 3.2 스팟 API 검색 필터 속성 테스트 작성
    - **Property 7: 부분 일치 검색 동작**
    - **Property 8: 대소문자 무시 검색**
    - **Property 9: 카테고리와 검색어 AND 조건 결합**
    - **Validates: Requirements 3.1, 3.2, 3.5, 6.2, 6.3**

- [ ] 4. Checkpoint - API 및 스토어 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. useAutocomplete 훅 구현
  - [x] 5.1 useAutocomplete 커스텀 훅 생성
    - 2글자 이상 입력 시 API 호출
    - 300ms 디바운스 적용
    - suggestions, isLoading, error 반환
    - _Requirements: 2.1_
  - [ ]\* 5.2 useAutocomplete 훅 속성 테스트 작성
    - **Property 3: 2글자 이상 입력 시 자동완성 활성화**
    - **Validates: Requirements 2.1**

- [ ] 6. SearchInput 컴포넌트 구현
  - [x] 6.1 SearchInput 기본 컴포넌트 생성
    - 검색어 입력 필드
    - 초기화 버튼 (X)
    - 플레이스홀더 텍스트
    - filterStore 연동
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]\* 6.2 SearchInput 컴포넌트 속성 테스트 작성
    - **Property 1: 검색어 입력 실시간 반영**
    - **Property 2: 초기화 버튼 클릭 시 검색어 리셋**
    - **Validates: Requirements 1.3, 1.5**

- [-] 7. AutocompleteDropdown 컴포넌트 구현
  - [x] 7.1 AutocompleteDropdown 컴포넌트 생성
    - 제안 항목 목록 표시
    - 카테고리 아이콘 및 스팟 개수 표시
    - 항목 클릭 시 선택 처리
    - 외부 클릭 시 닫기
    - "검색 결과 없음" 메시지
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [ ]\* 7.2 AutocompleteDropdown 컴포넌트 속성 테스트 작성
    - **Property 5: 제안 항목 선택 시 검색어 설정 및 필터 적용**
    - **Validates: Requirements 2.3, 2.4**

- [x] 8. ContentSearchFilter 통합 컴포넌트 구현
  - [x] 8.1 ContentSearchFilter 컴포넌트 생성
    - SearchInput + AutocompleteDropdown 결합
    - 자동완성 드롭다운 표시/숨김 로직
    - _Requirements: 1.1, 2.7_

- [x] 9. 지도 페이지 통합
  - [x] 9.1 CategoryFilter 옆에 ContentSearchFilter 배치
    - 필터 영역 레이아웃 조정
    - _Requirements: 1.1_
  - [x] 9.2 useSpots 훅에 searchQuery 연동
    - filterStore의 searchQuery를 API 호출에 포함
    - _Requirements: 3.3_

- [ ] 10. 빈 상태 및 에러 처리
  - [ ] 10.1 검색 결과 없음 UI 구현
    - 지도에 빈 상태 메시지 표시
    - _Requirements: 3.4_

- [ ] 11. Final Checkpoint - 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 task는 특정 requirements를 참조하여 추적 가능
- Property tests는 fast-check 라이브러리 사용
- 체크포인트에서 점진적 검증 수행
