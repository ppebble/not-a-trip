# Implementation Plan: Map Hover Tooltip

## Overview

지도 마커(SpotPin)에 마우스 호버 시 간단한 스팟 정보를 표시하는 툴팁 기능을 구현합니다. react-leaflet의 Tooltip 컴포넌트를 활용하고, 기존 SpotPin의 호버 상태를 재사용합니다.

## Tasks

- [ ] 1. HoverTooltip 컴포넌트 구현
  - [ ] 1.1 HoverTooltip 컴포넌트 생성
    - `src/components/map/HoverTooltip.tsx` 파일 생성
    - react-leaflet의 Tooltip 컴포넌트 래핑
    - 스팟 이름, 카테고리 아이콘/라벨, 썸네일 표시
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 1.2 HoverTooltip 스타일링 추가
    - 페이드인/아웃 애니메이션 (150ms)
    - navy 테마 색상 적용
    - 마커 위쪽 위치 및 화살표 스타일
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 5.4_

- [ ] 2. SpotPin 컴포넌트 수정
  - [ ] 2.1 HoverTooltip 통합
    - SpotPin에 HoverTooltip 조건부 렌더링 추가
    - isHovered 상태에 따라 툴팁 표시/숨김
    - 클릭 시 툴팁 숨김 처리
    - _Requirements: 1.1, 2.1, 2.2_
  - [ ] 2.2 모바일 터치 로직 구현
    - 터치 디바이스 감지 로직 추가
    - 터치 카운트 상태 관리
    - 첫 터치: 툴팁 표시, 두 번째 터치: SpotPreview 열기
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3. Checkpoint - 기능 동작 확인
  - 모든 기능이 정상 동작하는지 확인
  - `npm run type-check` 및 `npm run build` 실행
  - 사용자에게 질문이 있으면 문의

- [ ]\* 4. 테스트 작성
  - [ ]\* 4.1 HoverTooltip 단위 테스트 작성
    - 다양한 스팟 데이터로 렌더링 테스트
    - 썸네일 유무에 따른 분기 테스트
    - 카테고리별 아이콘/라벨 표시 테스트
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  - [ ]\* 4.2 Property 1 속성 테스트 작성
    - **Property 1: 호버 상태와 툴팁 표시 동기화**
    - **Validates: Requirements 1.1, 2.1**
  - [ ]\* 4.3 Property 2 속성 테스트 작성
    - **Property 2: 툴팁 콘텐츠 정확성**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  - [ ]\* 4.4 Property 3 속성 테스트 작성
    - **Property 3: 모바일 터치 카운트 동작**
    - **Validates: Requirements 4.1, 4.3**

- [ ] 5. Final Checkpoint - 최종 확인
  - 모든 테스트 통과 확인
  - 코드 품질 검사 (`npm run lint`, `npm run type-check`)
  - 사용자에게 질문이 있으면 문의

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 기존 SpotPin의 호버 상태(isHovered)를 재사용하여 중복 로직 방지
- react-leaflet의 Tooltip 컴포넌트를 활용하여 Leaflet과 자연스럽게 통합
- 모바일 터치 로직은 터치 디바이스 감지 후 분기 처리
