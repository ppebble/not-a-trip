# Implementation Plan: Multi-Content Spot (다중 작품 연결 스팟)

## Overview

기존 `RelatedContentForm` 컴포넌트를 확장하여 다중 콘텐츠 추가, 순서 변경, 중복 방지 기능을 구현하고, 스팟 상세 페이지에서 모든 연결된 콘텐츠를 효과적으로 표시합니다.

## Tasks

- [x] 1. 유틸리티 함수 및 타입 정의
  - [x] 1.1 콘텐츠 관련 유틸리티 함수 구현
    - `src/lib/content-utils.ts` 파일 생성
    - `normalizeContentName` 함수 구현 (대소문자 무시, 공백 제거)
    - `isDuplicateContent` 함수 구현 (중복 검사)
    - `reorderContents` 함수 구현 (순서 변경)
    - `removeContentAtIndex` 함수 구현 (삭제)
    - _Requirements: 4.3, 2.1, 1.3_

  - [ ]\* 1.2 유틸리티 함수 속성 테스트 작성
    - **Property 6: 중복 검사 정규화**
    - **Property 2: 콘텐츠 삭제 정확성**
    - **Property 3: 순서 변경 불변성**
    - **Validates: Requirements 4.1, 4.3, 1.3, 2.1**

- [x] 2. RelatedContentItem 컴포넌트 구현
  - [x] 2.1 RelatedContentItem 컴포넌트 생성
    - `src/components/spot/RelatedContentItem.tsx` 파일 생성
    - 개별 콘텐츠 항목 표시 (타입 아이콘, 이름, 연도, 추가정보)
    - 삭제 버튼 구현
    - 드래그 핸들 구현
    - 드래그 앤 드롭 이벤트 핸들러 연결
    - _Requirements: 1.3, 2.3, 3.4_

  - [ ]\* 2.2 RelatedContentItem 단위 테스트 작성
    - 렌더링 테스트 (모든 필드 표시 확인)
    - 삭제 버튼 클릭 이벤트 테스트
    - **Property 5: 콘텐츠 렌더링 완전성**
    - **Validates: Requirements 3.4**

- [ ] 3. RelatedContentForm 컴포넌트 확장
  - [ ] 3.1 다중 콘텐츠 목록 표시 기능 구현
    - 기존 `RelatedContentForm` 컴포넌트 수정
    - 추가된 콘텐츠 목록을 `RelatedContentItem`으로 렌더링
    - 콘텐츠 개수 표시
    - 빈 상태 안내 메시지 표시
    - _Requirements: 1.2, 1.4, 6.3_

  - [ ] 3.2 콘텐츠 추가 기능 구현
    - 새 콘텐츠 추가 폼 구현
    - 추가 완료 후 폼 초기화 및 추가 버튼 표시
    - 중복 검사 및 경고 메시지 표시
    - 강제 추가 옵션 제공
    - _Requirements: 1.1, 4.1, 4.2_

  - [ ] 3.3 콘텐츠 삭제 기능 구현
    - 삭제 버튼 클릭 시 해당 항목만 삭제
    - 삭제 확인 없이 즉시 삭제 (되돌리기 가능하도록 상태 관리)
    - _Requirements: 1.3_

  - [ ] 3.4 드래그 앤 드롭 순서 변경 기능 구현
    - HTML5 Drag and Drop API 사용
    - 드래그 시작/종료 상태 관리
    - 드롭 위치에 따른 순서 변경
    - 시각적 피드백 (드래그 중인 항목 표시)
    - _Requirements: 2.1, 2.2_

  - [ ]\* 3.5 RelatedContentForm 속성 테스트 작성
    - **Property 1: 콘텐츠 추가 불변성**
    - **Validates: Requirements 1.2, 5.3**

- [ ] 4. Checkpoint - 폼 컴포넌트 검증
  - 모든 테스트 통과 확인
  - 스팟 등록 페이지에서 다중 콘텐츠 추가 동작 확인
  - 사용자에게 질문이 있으면 문의

- [ ] 5. 스팟 수정 페이지 연동
  - [ ] 5.1 기존 콘텐츠 로드 기능 구현
    - 스팟 수정 페이지에서 기존 relatedContent 배열 로드
    - RelatedContentForm에 초기값으로 전달
    - _Requirements: 5.1_

  - [ ] 5.2 수정 저장 기능 구현
    - 기존 콘텐츠 유지 및 새 콘텐츠 추가 저장
    - API 호출 시 전체 relatedContent 배열 전송
    - _Requirements: 5.2, 5.3_

  - [ ]\* 5.3 데이터 라운드트립 테스트 작성
    - **Property 7: 데이터 로드 라운드트립**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 6. RelatedContentSection 컴포넌트 구현
  - [ ] 6.1 RelatedContentSection 컴포넌트 생성
    - `src/components/spot/RelatedContentSection.tsx` 파일 생성
    - 관련 콘텐츠 그리드 레이아웃 구현
    - 초기 3개 표시 및 "더보기" 버튼 구현
    - 확장 시 모든 콘텐츠 표시
    - 빈 배열일 때 섹션 숨김
    - _Requirements: 3.1, 3.2, 3.3, 6.2_

  - [ ]\* 6.2 RelatedContentSection 속성 테스트 작성
    - **Property 4: 콘텐츠 표시 개수 제한 및 확장**
    - **Validates: Requirements 3.2, 3.3**

- [ ] 7. 스팟 상세 페이지 연동
  - [ ] 7.1 SpotDetailPage에 RelatedContentSection 통합
    - 스팟 상세 페이지에 RelatedContentSection 추가
    - relatedContent 배열 전달
    - 기존 단일 콘텐츠 표시 로직 제거
    - _Requirements: 3.1, 3.4_

- [ ] 8. 빈 콘텐츠 처리
  - [ ] 8.1 빈 relatedContent 배열 처리 구현
    - 스팟 등록 시 빈 배열 허용
    - 스팟 상세 페이지에서 빈 배열 시 섹션 숨김
    - _Requirements: 6.1, 6.2_

- [ ] 9. Final Checkpoint - 전체 기능 검증
  - 모든 테스트 통과 확인
  - 스팟 등록/수정/상세 페이지 전체 플로우 확인
  - 사용자에게 질문이 있으면 문의

## Notes

- `*` 표시된 태스크는 선택적 테스트 태스크입니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- 속성 테스트는 fast-check 라이브러리를 사용하여 최소 100회 반복 실행합니다
