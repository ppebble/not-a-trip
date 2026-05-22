# 2026-05-22 Task 20 mascot asset follow-up

## 이번 구현 완료
- 공용 `MascotLoader` 추가
- `SpotLoadingSkeleton`을 마스코트 프레임 로더 기반으로 전환
- `MascotIllustration` 자산 경로 공용화
- `SpotPin`, `SpotMarkerLayer`, `SpotDetailMap`의 이미지 fallback을 실제 마스코트/지도 자산 기반으로 보강

## 남은 결정/보류
### 1. Lottie 전용 플레이어 도입
- spec 11.1은 `@lottiefiles/dotlottie-react` 또는 동급 플레이어 도입을 전제로 함
- 현재 저장소 운영 규칙상 새 dependency는 별도 결정 없이 추가하지 않음
- 그래서 이번에는 의존성 없는 `MascotLoader`로 로딩 UX를 먼저 완료함

### 2. CurrentLocationMarker 에셋화
- 현재 코드베이스에서 독립된 `CurrentLocationMarker` 컴포넌트는 확인되지 않음
- 실제 사용자 위치 마커 렌더링 지점을 먼저 특정한 뒤 task 12.3을 별도 이슈로 이어가는 것이 안전함

### 3. 베이스 팔레트 최종 확정
- task 9.x는 사용자 피드백과 시각 결정이 필요한 범위라 구현만으로 닫을 수 없음
