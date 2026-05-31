# 구현 계획: 체크인 콘텐츠 진행률 계산

## 개요

`spot_content_relations`와 `checkins` 데이터를 기반으로 콘텐츠별 방문 진행률을 계산한다. `src/lib/progress-utils.ts`를 만들고 기존 체크인 API의 진행률 계산을 공용 유틸리티로 대체한다.

## Tasks

- [x] 1. 진행률 유틸리티 구현
  - `fetchTotalSpotsMap()`: active 관계에서 콘텐츠별 전체 스팟 수 집계
  - `fetchCheckedSpotsMap(userId)`: unresolved가 아닌 체크인만 콘텐츠별 방문 스팟으로 집계
  - `mergeProgressMaps(totalSpotsMap, checkedSpotsMap)`: 진행률 배열 생성
  - 0% 콘텐츠는 응답에서 제외

- [x] 2. 속성 기반 테스트 작성
  - 전체 스팟 집계 정확성 검증
  - unresolved 체크인 제외 검증
  - 진행률 범위와 반올림 공식 검증
  - 0% 콘텐츠 필터링 검증

- [x] 3. Progress API 연결
  - DB 집계 오류는 HTTP 500과 한국어 오류 메시지 반환
  - 진행률 내림차순 정렬
  - 응답 형태 `{ progress: ContentProgress[], total: number }` 유지

- [x] 4. 최종 검증
  - `npm run type-check`
  - 관련 단위 테스트 통과

## Notes

- `fetchTotalSpotsMap`과 `fetchCheckedSpotsMap`은 `Promise.all`로 병렬 실행 가능하다.
- `contentName`이 없는 체크인은 자동 제외한다.
