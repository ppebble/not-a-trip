# Implementation Plan: Landing Social Proof Real Data

## Overview

랜딩 페이지 소셜 프루프 섹션을 실제 DB 스팟 데이터 기반으로 표시한다. `GET /api/spots/showcase` API를 추가하고, `fetchProofImages`가 DB 직접 접근 대신 HTTP API를 사용하도록 전환한다.

## Tasks

- [x] 1. `GET /api/spots/showcase` 엔드포인트 구현
  - `src/app/api/spots/showcase/route.ts` 생성
  - `ShowcaseSpotItem` 타입 정의: `id`, `name`, `category`, `thumbnailUrl`
  - placeholder 이미지 필터링
  - 실제 사진, curated fallback, null 순서로 썸네일 결정
  - 카테고리별 병렬 조회 후 최대 4개로 균형 조정
  - DB 오류 시 HTTP 500 반환

- [x] 2. API 속성 테스트 작성
  - 응답 객체 필수 필드 검증
  - 실제 사진이 placeholder보다 우선되는지 검증
  - 카테고리별 결과 수 제한 검증
  - fallback 우선순위 검증

- [x] 3. `fetchProofImages` 전환
  - showcase API 응답을 `Record<SpotCategory, string[]>`로 변환
  - placeholder URL이 결과에 섞이지 않도록 필터링
  - `NEXTAUTH_URL` 기반 base URL 처리

- [x] 4. 랜딩 소셜 프루프 적용
  - 카드별 스팟 이미지가 유지되도록 데이터 매핑
  - 체크인 사진은 사용자 실제 사진으로 우선 표시

- [x] 5. 최종 검증
  - `npm run type-check`
  - showcase 및 fetchProofImages 테스트 통과

## Notes

- 소셜 프루프 하단 영역은 특정 스팟 카드이므로 임의 카테고리 이미지를 주입하지 않는다.
- 임의 이미지 풀은 상단 취향 추천 영역에만 제한적으로 사용한다.
