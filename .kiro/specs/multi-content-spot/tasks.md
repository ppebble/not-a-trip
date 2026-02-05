# Implementation Plan: Multi-Content Spot (다중 작품 연결 스팟)

## Overview

기존 `RelatedContentForm` 컴포넌트를 확장하여 다중 콘텐츠 추가, 순서 변경, 중복 방지 기능을 구현하고, 스팟 상세 페이지에서 모든 연결된 콘텐츠를 효과적으로 표시합니다.

## 완료된 Tasks

- [x] 1. 유틸리티 함수 및 타입 정의
  - [x] 1.1 콘텐츠 관련 유틸리티 함수 구현
    - `src/lib/content-utils.ts` 파일 생성
    - `normalizeContentName`, `isDuplicateContent`, `reorderContents`, `removeContentAtIndex` 함수 구현
    - _Requirements: 4.3, 2.1, 1.3_

- [x] 2. RelatedContentItem 컴포넌트 구현
  - [x] 2.1 RelatedContentItem 컴포넌트 생성
    - 개별 콘텐츠 항목 표시 (타입 아이콘, 이름, 연도, 추가정보)
    - 삭제 버튼 및 드래그 핸들 구현
    - _Requirements: 1.3, 2.3, 3.4_

- [x] 3. RelatedContentForm 컴포넌트 확장
  - [x] 3.1 다중 콘텐츠 목록 표시 기능 구현
  - [x] 3.2 콘텐츠 추가 기능 구현 (중복 검사, 강제 추가 옵션)
  - [x] 3.3 콘텐츠 삭제 기능 구현
  - [x] 3.4 드래그 앤 드롭 순서 변경 기능 구현
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 4.1, 4.2, 6.3_

- [x] 4. 스팟 수정 페이지 연동
  - [x] 4.1 기존 콘텐츠 로드 기능 구현
    - _Requirements: 5.1_
  - [x] 4.2 수정 저장 기능 구현
    - _Requirements: 5.2, 5.3_

## 진행 중인 Tasks

- [x] 5. RelatedContentSection 컴포넌트 구현
  - [x] 5.1 RelatedContentSection 컴포넌트 생성
    - `src/components/spot/RelatedContentSection.tsx` 파일 생성
    - 관련 콘텐츠 그리드 레이아웃 구현
    - 초기 3개 표시 및 "더보기" 버튼 구현
    - 확장 시 모든 콘텐츠 표시
    - 빈 배열일 때 섹션 숨김
    - _Requirements: 3.1, 3.2, 3.3, 6.2_

- [x] 6. 스팟 상세 페이지 연동
  - [x] 6.1 SpotDetailPage에 RelatedContentSection 통합
    - 스팟 상세 페이지에 RelatedContentSection 추가
    - relatedContent 배열 전달
    - 기존 단일 콘텐츠 표시 로직 제거
    - _Requirements: 3.1, 3.4_

- [x] 7. 빈 콘텐츠 처리
  - [x] 7.1 빈 relatedContent 배열 처리 구현
    - 스팟 등록 시 빈 배열 허용
    - 스팟 상세 페이지에서 빈 배열 시 섹션 숨김
    - _Requirements: 6.1, 6.2_

- [x] 8. 콘텐츠 타입 아이콘 이미지 전환
  - [x] 8.1 아이콘 이미지 에셋 준비
    - `public/icons/content-types/` 디렉토리 생성
    - 각 ContentType별 SVG 아이콘 파일 생성 (anime, movie, drama, sports_team, artist, game, other)
    - 각 SpotCategory별 SVG 아이콘 파일 생성 (animation, sports, movie_drama, music, game, other)
    - 각 ExternalLinkType별 SVG 아이콘 파일 생성 (official, ticket, schedule, sns, other)
    - _New Requirement_

  - [x] 8.2 ContentTypeIcon 컴포넌트 생성
    - `src/components/common/ContentTypeIcon.tsx` 파일 생성
    - ContentType을 받아 해당 SVG 아이콘을 렌더링
    - size prop으로 크기 조절 가능
    - fallback으로 기존 이모티콘 표시
    - _New Requirement_

  - [x] 8.3 기존 이모티콘 사용 부분 교체
    - `RelatedContentItem.tsx`의 이모티콘을 ContentTypeIcon으로 교체
    - `RelatedContentForm.tsx`의 이모티콘을 ContentTypeIcon으로 교체
    - `CATEGORY_CONFIG`, `CONTENT_TYPE_CONFIG`, `LINK_TYPE_CONFIG`의 icon 필드를 이미지 경로로 변경
    - _New Requirement_

  - [x] 8.4 SpotCategory 아이콘 이미지 적용
    - 지도 마커, 카테고리 필터 등에서 사용하는 카테고리 아이콘 교체
    - CategoryIcon 컴포넌트 생성 또는 ContentTypeIcon 확장
    - _New Requirement_

- [x] 9. Checkpoint - 전체 기능 검증
  - 스팟 등록/수정/상세 페이지 전체 플로우 확인
  - 아이콘 이미지 렌더링 확인
  - 사용자에게 질문이 있으면 문의

- [ ] 10. 관련 콘텐츠 대표 이미지 기능
  - [x] 10.1 RelatedContent 타입에 imageUrl 필드 추가
    - `src/types/spot.ts`의 RelatedContent 인터페이스에 imageUrl 필드 추가
    - _New Requirement_

  - [x] 10.2 대표 이미지 원형 뱃지 표시 구현
    - RelatedContentSection에서 이미지가 있으면 원형 뱃지로 표시
    - RelatedContentItem에서도 이미지 표시 지원
    - 이미지 없으면 기존 ContentTypeIcon 표시
    - _New Requirement_

  - [ ] 10.3 관리자 전용 콘텐츠 이미지 관리 페이지 구현
    - `src/app/admin/content-images/page.tsx` 생성
    - 콘텐츠 목록 조회 및 이미지 업로드 UI
    - 관리자 권한 체크 (role === 'admin')
    - _New Requirement_

  - [ ] 10.4 콘텐츠 이미지 업로드 API 구현
    - `src/app/api/admin/content-images/route.ts` 생성
    - 관리자 권한 검증
    - 이미지 업로드 및 콘텐츠 imageUrl 업데이트
    - _New Requirement_

  - [ ] 10.5 콘텐츠 마스터 데이터 관리
    - 콘텐츠 이름별 대표 이미지 저장 (MongoDB 컬렉션)
    - 스팟 등록 시 기존 콘텐츠 이미지 자동 적용
    - _New Requirement_

## 선택적 테스트 Tasks

- [ ]\* T1. 유틸리티 함수 속성 테스트 작성
  - **Property 6: 중복 검사 정규화**
  - **Property 2: 콘텐츠 삭제 정확성**
  - **Property 3: 순서 변경 불변성**
  - **Validates: Requirements 4.1, 4.3, 1.3, 2.1**

- [ ]\* T2. RelatedContentItem 단위 테스트 작성
  - 렌더링 테스트 (모든 필드 표시 확인)
  - 삭제 버튼 클릭 이벤트 테스트
  - **Property 5: 콘텐츠 렌더링 완전성**
  - **Validates: Requirements 3.4**

- [ ]\* T3. RelatedContentForm 속성 테스트 작성
  - **Property 1: 콘텐츠 추가 불변성**
  - **Validates: Requirements 1.2, 5.3**

- [ ]\* T4. 데이터 라운드트립 테스트 작성
  - **Property 7: 데이터 로드 라운드트립**
  - **Validates: Requirements 5.1, 5.2**

- [ ]\* T5. RelatedContentSection 속성 테스트 작성
  - **Property 4: 콘텐츠 표시 개수 제한 및 확장**
  - **Validates: Requirements 3.2, 3.3**

## Notes

- `*` 표시된 태스크는 선택적 테스트 태스크입니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- Task 8은 새로 추가된 아이콘 이미지 전환 작업입니다
- 속성 테스트는 fast-check 라이브러리를 사용하여 최소 100회 반복 실행합니다
