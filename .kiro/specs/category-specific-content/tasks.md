# Implementation Plan: 카테고리별 콘텐츠 섹션

## Overview

스팟 상세 페이지에서 카테고리에 따라 적합한 콘텐츠 섹션을 표시합니다. 애니메이션/영화/드라마는 "작품 속 장면", 스포츠/음악은 "이벤트 정보" 섹션을 표시합니다.

## 관련 문서

- 프로젝트 컨텍스트: #[[file:.kiro/steering/project-context.md]]
- 기존 타입 정의: #[[file:src/types/index.ts]]
- 스팟 상세 페이지: #[[file:src/app/spots/[id]/page.tsx]]
- 스팟 폼 컴포넌트: #[[file:src/components/spot/SpotForm.tsx]]

## Tasks

- [ ] 1. 데이터 모델 확장
  - [ ] 1.1 ExternalLink 타입 정의
    - `src/types/index.ts`에 ExternalLink, ExternalLinkType 타입 추가
    - LINK_TYPE_CONFIG 상수 정의 (아이콘, 색상, 라벨)
    - _Requirements: 2.1, 2.2_
  - [ ] 1.2 Spot 모델에 externalLinks 필드 추가
    - `externalLinks?: ExternalLink[]` 필드 추가
    - 기존 Spot 인터페이스 확장
    - _Requirements: 2.1_
  - [ ] 1.3 카테고리별 섹션 매핑 상수 정의
    - CATEGORY_SECTIONS 상수 정의
    - SECTION_HEADERS 상수 정의
    - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [ ] 2. 외부 링크 컴포넌트 구현
  - [ ] 2.1 ExternalLinkCard 컴포넌트 생성
    - `src/components/spot/ExternalLinkCard.tsx` 생성
    - 링크 타입별 아이콘/색상 표시
    - 새 탭에서 열기 기능
    - _Requirements: 2.3, 2.4_
  - [ ] 2.2 ExternalLinkForm 컴포넌트 생성
    - `src/components/spot/ExternalLinkForm.tsx` 생성
    - 링크 타입 선택 드롭다운
    - URL 입력 및 유효성 검사
    - 링크 추가/삭제 기능
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. 이벤트 정보 섹션 구현
  - [ ] 3.1 EventInfoSection 컴포넌트 생성
    - `src/components/spot/EventInfoSection.tsx` 생성
    - 외부 링크 카드 그리드 레이아웃
    - 카테고리별 헤더 텍스트 (경기 일정/공연 정보)
    - 빈 상태 메시지 표시
    - _Requirements: 3.1, 3.2, 5.2, 5.4_
  - [ ] 3.2 SpotContentSection 컨테이너 컴포넌트 생성
    - `src/components/spot/SpotContentSection.tsx` 생성
    - 카테고리에 따라 SceneGallery 또는 EventInfoSection 렌더링
    - game 카테고리는 둘 다 표시
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. 스팟 상세 페이지 업데이트
  - [ ] 4.1 스팟 상세 페이지에 SpotContentSection 적용
    - `src/app/spots/[id]/page.tsx` 수정
    - 기존 SceneGallery를 SpotContentSection으로 교체
    - _Requirements: 1.1, 1.2_
  - [ ] 4.2 카테고리별 섹션 아이콘 적용
    - 섹션 헤더에 카테고리 아이콘 표시
    - _Requirements: 5.3_

- [ ] 5. 스팟 등록/수정 폼 업데이트
  - [ ] 5.1 SpotForm에 외부 링크 섹션 추가
    - `src/components/spot/SpotForm.tsx` 수정
    - sports/music 카테고리 선택 시 외부 링크 폼 표시
    - _Requirements: 4.1_
  - [ ] 5.2 외부 링크 유효성 검사 추가
    - URL 형식 검증 (https:// 필수)
    - 최대 10개 링크 제한
    - 중복 URL 방지
    - _Requirements: 3.4_

- [ ] 6. API 업데이트
  - [ ] 6.1 스팟 등록/수정 API에 externalLinks 처리 추가
    - `src/app/api/spots/route.ts` 수정 (POST)
    - `src/app/api/spots/[id]/route.ts` 수정 (PUT)
    - externalLinks 필드 저장
    - _Requirements: 3.3_
  - [ ] 6.2 외부 링크 유효성 검사 미들웨어
    - URL 형식 검증
    - 링크 개수 제한 (최대 10개)
    - _Requirements: 3.4_

- [ ] 7. 기존 스팟 데이터에 샘플 외부 링크 추가
  - [ ] 7.1 seed-real-spots.ts 업데이트
    - 스포츠 스팟에 공식 홈페이지, 티켓 예매 링크 추가
    - 음악 스팟에 공연장 홈페이지, 예매 링크 추가
    - _Requirements: 2.1, 3.1, 3.2_

- [ ] 8. Checkpoint - 카테고리별 콘텐츠 섹션 확인
  - 애니메이션/영화 스팟에서 작품 속 장면 섹션 표시 확인
  - 스포츠/음악 스팟에서 이벤트 정보 섹션 표시 확인
  - 외부 링크 추가/삭제 기능 테스트
  - 사용자 피드백 수렴

## Notes

- 1단계(MVP)에서는 외부 링크만 제공, 실시간 API 연동은 향후 확장
- 기존 SceneGallery 컴포넌트는 유지하고 SpotContentSection에서 조건부 렌더링
- 외부 링크는 새 탭에서 열어 사용자 경험 유지
- URL 유효성 검사는 클라이언트/서버 양쪽에서 수행

## 예시 외부 링크 데이터

### 스포츠 스팟 (캄프 누)

```typescript
externalLinks: [
  {
    id: '1',
    type: 'official',
    label: 'FC 바르셀로나 공식',
    url: 'https://www.fcbarcelona.com',
  },
  {
    id: '2',
    type: 'ticket',
    label: '티켓 예매',
    url: 'https://www.fcbarcelona.com/en/tickets',
  },
  {
    id: '3',
    type: 'schedule',
    label: '경기 일정',
    url: 'https://www.fcbarcelona.com/en/football/first-team/schedule',
  },
]
```

### 음악 스팟 (도쿄돔)

```typescript
externalLinks: [
  {
    id: '1',
    type: 'official',
    label: '도쿄돔 공식',
    url: 'https://www.tokyo-dome.co.jp',
  },
  {
    id: '2',
    type: 'schedule',
    label: '이벤트 일정',
    url: 'https://www.tokyo-dome.co.jp/dome/schedule/',
  },
  { id: '3', type: 'ticket', label: '티켓 예매 (e+)', url: 'https://eplus.jp' },
]
```
