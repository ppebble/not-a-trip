# Kiro Spec Audit — 2026-05-26

## 범위

- 대상: `.kiro/specs/*/tasks.md`
- 원칙: task 문서는 현재 구현 상태와 맞지 않는 항목을 그대로 신뢰하지 않고, 코드와 테스트를 기준으로 검증한다.
- 결론: 일부 오래된 task 문서는 후속 spec과 실제 구현에 의해 stale 상태가 되었고, 그대로는 코드와 1:1 대응하지 않는다.

## 이미 완료되었거나 정리된 spec

### Spec 38 — 체크인 콘텐츠 진행률

상태: 완료. task 문서의 stale 항목을 현재 구현 상태에 맞춰 정리했다.

근거:
- `src/lib/progress-utils.ts` 구현 존재
- progress API 연결 완료
- 관련 테스트 통과
- `npm run type-check` 통과

조치:
- `.kiro/specs/38-checkin-content-progress/tasks.md`를 현재 구현 내용에 맞게 정리

### Spec 39 — 랜딩 소셜 프루프 실제 데이터

상태: 대부분 구현 완료. showcase fallback 동작과 실제 사진 우선순위를 확인했다.

근거:
- `src/app/api/spots/showcase/helpers.ts`의 `resolveThumbnailUrl()` 로직 확인
- placeholder 외부 URL은 결과에서 제외
- fallback 우선순위 테스트 보강
- `npm run type-check` 통과

조치:
- `.kiro/specs/39-landing-social-proof-real-data/tasks.md`를 현재 구현 내용에 맞게 정리

### Spec 20 — 마스코트 디자인 시스템

상태: 색상 시스템과 지도 마커 통합은 상당 부분 완료. 마스코트 자산 최종화와 잔여 하드코딩 색상 제거는 추가 확인이 필요하다.

근거:
- 시맨틱 CSS 변수와 Tailwind 토큰이 존재
- 주요 UI와 지도 마커가 토큰 기반으로 이동됨
- 일부 자산/디자인 최종 결정은 별도 검토 필요

조치:
- `.kiro/specs/20-mascot-design-system/tasks.md`를 현재 상태 기준으로 재작성

### Spec 37 — 프로필 유저 정보

상태: 실제 사용자 정보 표시 흐름 구현 완료.

근거:
- 사용자 정보 API와 `useUserInfo` 훅 존재
- 프로필 페이지에서 하드코딩 사용자 정보 제거

조치:
- `.kiro/specs/37-profile-user-info/tasks.md` 정리

### Spec 45 — 프로필 활동 허브

상태: 주요 기능 구현 완료. 일부 선택형 property test 항목은 유지보수 우선순위에 따라 별도 판단이 필요하다.

근거:
- 사용자별 API, React Query 훅, 프로필 섹션 구조 존재
- `/settings/account` 리다이렉트 흐름 존재

조치:
- `.kiro/specs/45-profile-complete/tasks.md` 정리

## 남은 주의사항

- 오래된 task 문서는 구현보다 우선하지 않는다.
- 후속 작업 전에는 task 문서보다 실제 코드, 테스트, 최신 requirements 문서를 먼저 확인한다.
- property test로 표시된 선택형 항목은 제품 위험도와 변경 범위를 기준으로 다시 우선순위를 매긴다.
- 외부 자산이나 디자인 결정이 필요한 항목은 구현 완료로 간주하지 않는다.
