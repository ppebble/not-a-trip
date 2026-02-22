# Implementation Plan: Pilgrimage Gallery

## Overview

커뮤니티 페이지를 사진 기반 순례 갤러리로 전면 개편합니다. 기존 CheckIn 시스템과 ComparisonViewer 컴포넌트를 재활용하면서, Masonry 그리드 레이아웃과 탭 기반 네비게이션을 새로 구현합니다.

## Tasks

- [x] 1. 라우트 및 네비게이션 설정
  - [x] 1.1 `/gallery` 라우트 생성 및 기본 페이지 구조 설정
    - `src/app/gallery/page.tsx` 생성
    - 기본 레이아웃 및 Suspense 경계 설정
    - _Requirements: 1.2_
  - [x] 1.2 `/community`에서 `/gallery`로 리다이렉트 설정
    - `src/app/community/page.tsx`에 리다이렉트 로직 추가 또는 Next.js redirects 설정
    - _Requirements: 1.3_
  - [x] 1.3 Header 컴포넌트의 네비게이션 메뉴 명칭 변경
    - "커뮤니티" → "순례 갤러리"로 변경
    - 링크 경로 `/community` → `/gallery`로 변경
    - _Requirements: 1.1_

- [x] 2. 갤러리 헤더 및 통계 컴포넌트 구현
  - [x] 2.1 GalleryHeader 컴포넌트 구현
    - `src/components/gallery/GalleryHeader.tsx` 생성
    - 페이지 제목 "순례 갤러리", 부제목 "오타쿠들의 발자취" 표시
    - 총 인증 수, 오늘 인증 수 통계 표시
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 2.2 갤러리 통계 API 엔드포인트 구현
    - `src/app/api/checkins/stats/route.ts` 생성
    - totalCheckIns, todayCheckIns 반환
    - _Requirements: 5.3_
  - [ ]\* 2.3 Property 5 테스트: 통계 데이터 표시 정확성
    - **Property 5: 통계 데이터 표시 정확성**
    - **Validates: Requirements 5.3**

- [x] 3. 탭 네비게이션 구현
  - [x] 3.1 GalleryTabs 컴포넌트 구현
    - `src/components/gallery/GalleryTabs.tsx` 생성
    - "실시간 피드", "명예의 전당", "작품별" 세 개 탭 구현
    - URL 쿼리 파라미터로 탭 상태 관리
    - _Requirements: 3.1_
  - [x] 3.2 탭별 콘텐츠 영역 컴포넌트 구현
    - `src/components/gallery/GalleryContent.tsx` 생성
    - activeTab에 따라 적절한 콘텐츠 렌더링
    - _Requirements: 3.1_

- [x] 4. Checkpoint - 기본 구조 검증
  - 갤러리 페이지 기본 구조가 올바르게 렌더링되는지 확인
  - 탭 전환이 정상 작동하는지 확인
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

- [x] 5. Masonry 그리드 및 ComparisonCard 구현
  - [x] 5.1 MasonryGrid 컴포넌트 구현
    - `src/components/gallery/MasonryGrid.tsx` 생성
    - CSS Grid 기반 반응형 Masonry 레이아웃 (모바일 2열, 태블릿 3열, 데스크톱 4열)
    - _Requirements: 2.1_
  - [x] 5.2 ComparisonCard 컴포넌트 구현
    - `src/components/gallery/ComparisonCard.tsx` 생성
    - 기존 ComparisonViewer 통합
    - 유저 닉네임, 스팟 이름, 뱃지 아이콘 표시
    - 호버 시 스케일 애니메이션 및 오버레이
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ]\* 5.3 Property 1 테스트: ComparisonCard 필수 정보 표시
    - **Property 1: ComparisonCard 필수 정보 표시**
    - **Validates: Requirements 2.3, 6.4**
  - [ ]\* 5.4 Property 6 테스트: CheckIn 데이터 모델 호환성
    - **Property 6: CheckIn 데이터 모델 호환성**
    - **Validates: Requirements 6.1**

- [x] 6. 실시간 피드 탭 구현
  - [x] 6.1 실시간 피드 컴포넌트 구현
    - `src/components/gallery/FeedTab.tsx` 생성
    - 최신순 정렬된 체크인 목록 표시
    - 무한 스크롤 구현
    - _Requirements: 3.2, 2.5_
  - [x] 6.2 useCheckInFeed 훅 구현
    - `src/hooks/useCheckInFeed.ts` 생성
    - 페이지네이션 및 무한 스크롤 로직
    - 기존 `/api/checkins` 엔드포인트 활용
    - _Requirements: 3.2, 6.3_
  - [ ]\* 6.3 Property 2 테스트: 실시간 피드 최신순 정렬
    - **Property 2: 실시간 피드 최신순 정렬**
    - **Validates: Requirements 3.2**

- [x] 7. 명예의 전당 탭 구현
  - [x] 7.1 랭킹 API 엔드포인트 구현
    - `src/app/api/checkins/ranking/route.ts` 생성
    - 이번 주 인증 많은 스팟 랭킹
    - 좋아요 많은 인증샷 랭킹
    - _Requirements: 3.3_
  - [x] 7.2 RankingList 컴포넌트 구현
    - `src/components/gallery/RankingList.tsx` 생성
    - 스팟 랭킹, 인증샷 랭킹 표시
    - _Requirements: 3.3_
  - [x] 7.3 명예의 전당 탭 컴포넌트 구현
    - `src/components/gallery/HallOfFameTab.tsx` 생성
    - RankingList 통합
    - _Requirements: 3.3_

- [x] 8. 작품별 탭 구현
  - [x] 8.1 ContentGrid 컴포넌트 구현
    - `src/components/gallery/ContentGrid.tsx` 생성
    - 작품 포스터 카드 그리드 레이아웃
    - _Requirements: 3.4_
  - [x] 8.2 작품별 필터링 기능 구현
    - 작품 선택 시 해당 작품 체크인만 필터링
    - URL 쿼리 파라미터로 선택된 작품 관리
    - _Requirements: 3.5_
  - [x] 8.3 작품별 탭 컴포넌트 구현
    - `src/components/gallery/ContentTab.tsx` 생성
    - ContentGrid와 필터링된 피드 통합
    - _Requirements: 3.4, 3.5_
  - [ ]\* 8.4 Property 3 테스트: 콘텐츠별 필터링 정확성
    - **Property 3: 콘텐츠별 필터링 정확성**
    - **Validates: Requirements 3.5**

- [x] 9. Checkpoint - 탭 기능 검증
  - 세 개 탭이 모두 정상 작동하는지 확인
  - 무한 스크롤, 랭킹, 필터링 기능 검증
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

- [x] 10. 순례 인증 플로우 구현
  - [x] 10.1 FloatingActionButton 컴포넌트 구현
    - `src/components/gallery/FloatingActionButton.tsx` 생성
    - "+ 순례 인증하기" 버튼
    - 비인증 사용자 로그인 리다이렉트 처리
    - _Requirements: 4.1, 4.6_
  - [x] 10.2 SpotSearchModal 컴포넌트 구현
    - `src/components/gallery/SpotSearchModal.tsx` 생성
    - "어떤 스팟을 다녀오셨나요?" 프롬프트
    - 스팟 이름/콘텐츠 제목 검색 기능
    - _Requirements: 4.2, 4.3_
  - [ ]\* 10.3 Property 4 테스트: 스팟 검색 결과 정확성
    - **Property 4: 스팟 검색 결과 정확성**
    - **Validates: Requirements 4.3**
  - [x] 10.4 인증 플로우 통합
    - 스팟 선택 → 기존 CheckInModal 연결
    - 씬 이미지 선택 옵션 제공
    - _Requirements: 4.4, 4.5_

- [x] 11. 공지사항 이동 및 정리
  - [x] 11.1 공지사항 섹션 푸터/프로필로 이동
    - 메인 탭에서 공지사항 제거
    - 푸터 또는 마이페이지에 공지사항 링크 추가
    - _Requirements: 3.6_

- [x] 12. Final Checkpoint - 전체 기능 검증
  - 모든 기능이 정상 작동하는지 확인
  - 기존 체크인 데이터와 호환성 검증
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 기존 CheckIn API, ComparisonViewer, CheckInModal 컴포넌트를 최대한 재활용
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
