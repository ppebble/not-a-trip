# Implementation Plan: 지도 앱 딥링크 수정

## Overview

카카오맵/네이버 지도의 딥링크 URL(`kakaomap://`, `nmap://`)을 웹 URL(`https://`)로 변경하고, DirectionsButton의 이모지 아이콘을 실제 브랜드 아이콘 이미지로 교체한다. 변경 파일은 `src/lib/directions.ts`, `src/components/common/DirectionsButton.tsx`, 아이콘 에셋 2개.

각 Task는 독립적인 Issue → 브랜치 → 구현 → PR → 머지 단위로 실행된다.

## Tasks

- [x] 1. 카카오맵/네이버 지도 URL을 웹 URL로 변경
  - [x] 1.1 `src/lib/directions.ts`에서 카카오맵/네이버 URL 생성 로직 수정
    - 카카오맵: `kakaomap://route?ep=...` → `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`
    - 네이버: `nmap://route/walk?...` → `https://map.naver.com/v5/directions/-/-/-/walk?c=${lng},${lat},15,0,0,0,dh`
    - `destinationName` 미제공 시 빈 문자열 사용 (기존 로직 유지)
    - Google Maps, Apple Maps URL은 변경하지 않음
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 6.1, 6.2_

  - [ ]* 1.2 `src/lib/__tests__/directions.test.ts`에 Property 1 테스트 작성
    - **Property 1: 카카오맵 URL 형식 정확성**
    - 랜덤 좌표/이름 생성 → URL이 `https://map.kakao.com/link/to/`로 시작하고 lat, lng 포함 검증
    - **Validates: Requirements 1.1, 1.2, 3.1**

  - [ ]* 1.3 `src/lib/__tests__/directions.test.ts`에 Property 2 테스트 작성
    - **Property 2: 네이버 지도 URL 형식 정확성**
    - 랜덤 좌표 생성 → URL이 `https://map.naver.com/v5/directions/-/-/-/walk`로 시작하고 lng, lat 포함 검증
    - **Validates: Requirements 2.1, 2.2, 3.2**

  - [ ]* 1.4 `src/lib/__tests__/directions.test.ts`에 Property 3 테스트 작성
    - **Property 3: 웹 URL 스킴만 사용 (딥링크 금지)**
    - 랜덤 좌표/이름 생성 → 카카오맵 URL이 `kakaomap://`으로 시작하지 않고, 네이버 URL이 `nmap://`으로 시작하지 않으며, 둘 다 `https://`로 시작하는지 검증
    - **Validates: Requirements 1.4, 2.3**

  - [ ]* 1.5 `src/lib/__tests__/directions.test.ts`에 Property 4 테스트 작성
    - **Property 4: 좌표 라운드트립**
    - 랜덤 좌표/이름 생성 → 카카오맵/네이버 URL에서 좌표를 파싱하면 원래 좌표와 일치하는지 검증
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 1.6 `src/lib/__tests__/directions.test.ts`에 unit test 작성
    - 카카오맵 이름 미제공 시 빈 문자열 사용 확인 (Requirement 1.3)
    - Google Maps URL 형식 변경 없음 확인 (Requirement 6.1)
    - Apple Maps URL 형식 변경 없음 확인 (Requirement 6.2)

- [x] 2. 아이콘 에셋 추가 및 DirectionsButton 수정
  - [x] 2.1 `public/icons/kakao-map.png`, `public/icons/naver-map.png` 아이콘 에셋 추가
    - 카카오맵, 네이버 지도 브랜드 아이콘 이미지 파일 배치
    - _Requirements: 4.2, 5.2_

  - [x] 2.2 `src/components/common/DirectionsButton.tsx`에서 이모지를 Image 컴포넌트로 교체
    - `next/image` import 추가
    - 카카오맵: `'🟡'` → `<Image src="/icons/kakao-map.png" alt="카카오맵" width={18} height={18} />`
    - 네이버: `'🟢'` → `<Image src="/icons/naver-map.png" alt="네이버 지도" width={18} height={18} />`
    - 아이콘 크기는 기존 메뉴 아이콘과 일관되게 18×18
    - _Requirements: 4.1, 4.3, 5.1, 5.3, 6.3_

  - [ ]* 2.3 `src/components/common/__tests__/DirectionsButton.test.tsx`에 컴포넌트 테스트 작성
    - 카카오맵/네이버 지도 메뉴 항목에 Image 컴포넌트가 렌더링되는지 확인
    - 각 지도 앱 클릭 시 올바른 URL로 `window.open` 호출되는지 확인
    - _Requirements: 4.1, 5.1, 6.3_

- [x] 3. Checkpoint — 사용자 검증
  - 모든 테스트 통과 확인 (`npm run test`, `npm run type-check`)
  - 사용자에게 변경사항 검증 요청:
    - 국내 스팟 길찾기 → 카카오맵/네이버 지도 클릭 시 웹 페이지 정상 열림
    - 메뉴에서 이모지 대신 브랜드 아이콘 표시 확인
    - Google Maps, Apple Maps 기존 동작 유지 확인
  - 문제 발생 시 사용자와 논의

## Notes

- `*` 표시된 Task는 선택사항이며 빠른 구현을 위해 건너뛸 수 있음
- 변경 파일: `src/lib/directions.ts`, `src/components/common/DirectionsButton.tsx`
- 추가 에셋: `public/icons/kakao-map.png`, `public/icons/naver-map.png`
- 테스트 파일: `src/lib/__tests__/directions.test.ts`, `src/components/common/__tests__/DirectionsButton.test.tsx`
- PBT 라이브러리: `fast-check` (프로젝트에 이미 설치됨)
- 기존 `DirectionsUrls` 인터페이스 변경 없음
