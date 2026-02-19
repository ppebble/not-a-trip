# Implementation Plan: 성지순례 인증 시스템 (Pilgrimage Check-in)

## Overview

기존 커뮤니티 게시판을 장소 기반 인증(Check-in) 시스템으로 전면 개편합니다. 씬 인증샷, 뱃지/업적, 유저 프로필 트로피 룸을 구현합니다.

## Tasks

### Phase 1: 데이터 모델 및 API 기반

- [ ] 1. 데이터 모델 및 타입 정의
  - [ ] 1.1 CheckIn 타입 정의
    - `src/types/checkin.ts` 파일 생성
    - CheckIn, CheckInInput 인터페이스 정의
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ] 1.2 Badge 타입 정의
    - Badge, BadgeCondition, UserBadge 인터페이스 정의
    - 기본 뱃지 목록 상수 정의
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 1.3 UserStats 타입 정의
    - UserStats, ContentProgress 인터페이스 정의
    - _Requirements: 3.3_

  - [ ] 1.4 DB 컬렉션 추가
    - `src/lib/db.ts`에 CHECKINS, BADGES, USER_BADGES, USER_STATS 컬렉션 추가
    - _Requirements: 1.3_

- [ ] 2. Check-in API 구현
  - [ ] 2.1 인증 생성 API (POST /api/checkins)
    - 이미지 URL, spotId, 방문일, 코멘트 저장
    - 유저 통계 자동 업데이트
    - _Requirements: 1.1, 1.3_

  - [ ] 2.2 인증 목록 조회 API (GET /api/checkins)
    - spotId 또는 userId로 필터링
    - 최신순/인기순 정렬
    - 페이지네이션 지원
    - _Requirements: 1.5, 5.1_

  - [ ] 2.3 인증 삭제 API (DELETE /api/checkins/[id])
    - 본인 인증만 삭제 가능
    - 통계 자동 업데이트
    - _Requirements: 1.3_

- [ ] 3. Badge API 구현
  - [ ] 3.1 뱃지 목록 조회 API (GET /api/badges)
    - 전체 뱃지 목록 반환
    - _Requirements: 4.5_

  - [ ] 3.2 유저 뱃지 조회 API (GET /api/users/[id]/badges)
    - 획득한 뱃지 목록 반환
    - _Requirements: 3.1_

  - [ ] 3.3 뱃지 획득 조건 체크 로직
    - 인증 생성 시 자동 호출
    - 조건 만족 시 뱃지 자동 부여
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4. User Stats API 구현
  - [ ] 4.1 유저 통계 조회 API (GET /api/users/[id]/stats)
    - 총 인증 수, 방문 스팟 수, 뱃지 수 반환
    - _Requirements: 3.3_

  - [ ] 4.2 콘텐츠별 진행률 조회 API (GET /api/users/[id]/progress)
    - 작품별 인증 진행률 반환
    - _Requirements: 3.2_

### Phase 2: UI 컴포넌트 구현

- [ ] 5. 인증 UI 컴포넌트
  - [ ] 5.1 CheckInButton 컴포넌트
    - 스팟 상세 페이지에 표시되는 "순례 인증" 버튼
    - 로그인 필요 시 로그인 유도
    - _Requirements: 1.1_

  - [ ] 5.2 CheckInModal 컴포넌트
    - 이미지 업로드, 방문일 선택, 코멘트 입력
    - 씬 이미지와 비교 미리보기
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 5.3 ComparisonViewer 컴포넌트
    - 슬라이더 모드: 드래그로 두 이미지 비교
    - 좌우 비교 모드: 나란히 표시
    - 모바일 터치 제스처 지원
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 5.4 CheckInGallery 컴포넌트
    - 스팟별/유저별 인증샷 갤러리
    - 무한 스크롤 또는 페이지네이션
    - _Requirements: 1.5, 5.3_

- [ ] 6. 프로필 UI 컴포넌트
  - [ ] 6.1 UserProfilePage 페이지
    - `src/app/profile/[id]/page.tsx` 생성
    - 유저 정보, 통계, 뱃지, 인증 갤러리 표시
    - _Requirements: 3.1, 3.3_

  - [ ] 6.2 TrophyRoom 컴포넌트
    - 획득한 뱃지 그리드 표시
    - 미획득 뱃지는 흐리게 표시
    - _Requirements: 3.1_

  - [ ] 6.3 BadgeCard 컴포넌트
    - 뱃지 아이콘, 이름, 설명 표시
    - 획득 여부에 따른 스타일 변경
    - 진행률 표시 (미획득 시)
    - _Requirements: 4.5_

  - [ ] 6.4 ContentProgressCard 컴포넌트
    - 작품별 인증 진행률 표시
    - 프로그레스 바 UI
    - _Requirements: 3.2_

- [ ] 7. 뱃지 알림 컴포넌트
  - [ ] 7.1 BadgeEarnedModal 컴포넌트
    - 뱃지 획득 시 축하 모달
    - 애니메이션 효과
    - _Requirements: 4.4_

### Phase 3: 스팟 페이지 연동

- [ ] 8. 스팟 상세 페이지 개편
  - [ ] 8.1 인증 섹션 추가
    - 기존 커뮤니티 섹션을 인증 갤러리로 교체
    - CheckInButton, CheckInGallery 통합
    - _Requirements: 5.1, 5.3, 6.2_

  - [ ] 8.2 인증 현황 표시
    - 총 인증 수 표시
    - 최근 인증샷 미리보기
    - _Requirements: 5.1_

- [ ] 9. 지도 연동
  - [ ] 9.1 인증 수 기반 마커 스타일
    - 인증 수가 많은 스팟 강조 표시
    - _Requirements: 5.2_

### Phase 4: 기존 커뮤니티 정리

- [ ] 10. 커뮤니티 기능 전환
  - [ ] 10.1 자유게시판 숨김/제한
    - 공지사항/FAQ 용도로만 제한
    - _Requirements: 6.1_

  - [ ] 10.2 스팟별 게시판 → 인증 갤러리 전환
    - 기존 라우트 리다이렉트
    - _Requirements: 6.2_

  - [ ] 10.3 작품별 페이지 개편
    - 성지 목록 및 인증 현황 중심으로 변경
    - _Requirements: 6.3_

## 기본 뱃지 목록

| 코드                | 이름            | 조건                |
| ------------------- | --------------- | ------------------- |
| first_step          | 첫 발자국       | 첫 인증샷 업로드    |
| explorer_10         | 탐험가          | 10개 스팟 인증      |
| explorer_50         | 베테랑 탐험가   | 50개 스팟 인증      |
| {content}\_half     | {작품명} 탐험가 | 해당 작품 50% 인증  |
| {content}\_complete | {작품명} 정복자 | 해당 작품 100% 인증 |

## Notes

- 이미지 업로드는 기존 `/api/upload` API 활용
- 뱃지 아이콘은 SVG로 제작하여 `/public/icons/badges/` 에 저장
- 모바일 UX는 Phase 2의 mobile-first-ux spec과 연계하여 개선

</content>
