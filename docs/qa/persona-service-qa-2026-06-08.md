# 실제 사용자 페르소나 기반 서비스 QA 리포트

- 실행일: 2026-06-08
- 대상: 로컬 개발 서버 `http://127.0.0.1:3000`
- 방식: 코드 단위 테스트가 아니라 Playwright 브라우저로 실제 사용자가 서비스를 이용하는 흐름을 수행
- 중단 기준: 같은 차단 결함이 반복되어 이후 흐름을 강제로 우회하면 "실제 사용자 이용" 조건을 훼손하는 지점에서 중단
- 원본 증거:
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`
  - `.omx/ultraqa/artifacts/persona-service-qa-cycle2-run.json`
  - `.omx/ultraqa/persona-service-qa-report.md`
  - `.omx/ultraqa/persona-service-qa-cycle2.md`
  - `.omx/ultraqa/artifacts/*.png`

## 결론

현재 서비스는 실제 사용자 관점의 품질 게이트를 통과하지 못한다.

가장 치명적인 문제는 온보딩 오버레이가 핵심 CTA 클릭을 가로막는 것이다. 이 결함 때문에 익명 사용자와 모바일 사용자가 코스 상세/코스 시작 흐름에서 즉시 막힌다. 추가로 Next 이미지 최적화 요청이 다수 500으로 실패하고, 신규 가입 후 이미지 업로드 세션이 안정적으로 이어지지 않으며, `/routes` 페이지의 CLS가 0.232로 기준치를 넘는다.

## 페르소나 및 시나리오 결과

| ID | 페르소나 | 실제 이용 흐름 | 결과 | 핵심 증거 |
| --- | --- | --- | --- | --- |
| P1 | 익명 애니 순례 입문자 | `/welcome` -> `/routes` -> 우지 유포니엄 현지 체험 확장 코스 카드 클릭 | FAIL | 온보딩 `role="dialog"` 오버레이가 카드 클릭을 가로막아 timeout |
| P2 | 390px 모바일 관광객 | `/routes/ROUTE-109` -> `코스 시작` 클릭 | FAIL | 온보딩 오버레이가 CTA 클릭을 가로막아 timeout |
| P3 | 신규 가입 장면 이미지 기여자 | 회원가입/로그인 -> `REAL-ANI-050` 장면 PNG 업로드 | FAIL | 업로드 성공 신호 없음, 네트워크 이미지 500 다수 |
| P4 | 키보드/스크린리더 의존 사용자 | 스팟 상세 페이지 키보드 탐색 및 접근성 점검 | FAIL | `h1` 2개, heading level 2 -> 4 건너뜀, Leaflet DIV 등 비의미 focus 대상 노출 |
| P5 | 악의적/실수성 업로더 | `.png` 확장자에 JPEG magic byte 파일 업로드 | BLOCKED/FAIL | 업로드 검증까지 도달하지 못하고 로그인 요구 메시지 노출 |
| P6 | 성능에 민감한 실제 사용자 | 주요 페이지 로딩/CLS/네트워크 측정 | FAIL | 3초 초과 페이지 다수, `/routes` CLS 0.232, 스팟 상세 transfer 약 25MB |
| C2 | 재검증 사용자 | 가입/세션 확인 + 코스 시작 재시도 | FAIL | 세션 확인 불안정, 온보딩 오버레이 차단 반복 |

## 치명도별 발견 사항

### 1. [HIGH] 온보딩 오버레이가 핵심 사용자 흐름을 차단

증상:
- `/routes`에서 코스 카드 클릭이 실제 사용자 클릭으로 처리되지 않는다.
- `/routes/ROUTE-109`에서 `코스 시작` 버튼 클릭도 막힌다.
- Playwright가 감지한 차단 요소:
  - `div role="dialog" aria-modal="true" class="fixed inset-0 z-[9999]"`
  - `aria-describedby="onboarding-tooltip-0"`
  - 전체 화면 overlay가 pointer event를 점유한다.

영향:
- 신규/익명/모바일 사용자가 코스 탐색과 시작이라는 최상위 전환 흐름에서 이탈한다.
- 가이드 UI가 제품의 핵심 행동을 설명하는 수준을 넘어, 실제 입력을 방해한다.

권장 수정:
- 온보딩이 떠 있는 상태에서도 target CTA 클릭을 proxy/forward 하거나, 첫 사용자 행동 전 명확한 닫기/건너뛰기 control을 제공한다.
- 오버레이 외부 클릭/ESC/닫기 버튼이 키보드와 포인터 모두에서 안정적으로 동작해야 한다.
- 온보딩 표시 여부를 페이지 진입마다 반복하지 않도록 persistence를 검증한다.

증거 파일:
- `.omx/ultraqa/artifacts/p1-error-2026-06-08T11-30-18-767Z.png`
- `.omx/ultraqa/artifacts/p2-error-2026-06-08T11-30-18-767Z.png`

### 2. [HIGH] 이미지 최적화 요청이 다수 500으로 실패

증상:
- Dev server 로그에 다음 형태의 오류가 반복된다.
  - `upstream image response failed ... TypeError: handleRequest is not a function`
- 실패 URL 예시:
  - `/_next/image?url=/icons/mascot/mascot-lookout.webp...`
  - `/_next/image?url=/icons/ui/settings.webp...`
  - `/_next/image?url=/icons/categories/animation.webp...`
  - `/_next/image?url=/uploads/contents/covers/anime-*.webp...`

영향:
- 실제 사용자는 깨진 이미지, 느린 화면, 불필요한 재시도/대기 시간을 겪는다.
- 성능 측정에서 network error와 transfer 비용이 커진다.

권장 수정:
- Next 이미지 최적화 경로와 현재 런타임/미들웨어 조합에서 `handleRequest` 참조가 깨지는 원인을 우선 조사한다.
- 로컬 정적 asset까지 `next/image` optimizer를 통과시키는 현재 구성이 필요한지 재검토한다.
- 이미지 fallback과 optimizer 비활성/정적 serve 전략을 페이지별로 분리한다.

### 3. [HIGH] 신규 가입 후 이미지 업로드 가능 상태가 안정적으로 보장되지 않음

증상:
- 실제 브라우저 흐름에서 신규 사용자 생성 후 장면 이미지 업로드를 시도했으나 성공 신호를 확인하지 못했다.
- 재검증 사이클에서 서버 로그는 credentials callback/user auth를 남겼지만, 테스트 컨텍스트의 세션 확인은 `null`이었다.
- fake PNG 업로드 시나리오도 파일 검증 단계가 아니라 로그인 요구 메시지에서 막혔다.

영향:
- 작품 속 장면 이미지 추가라는 핵심 기여 흐름이 신규 사용자에게 불안정하다.
- 파일 validation 수정 여부를 실제 UI에서 끝까지 검증할 수 없다.

권장 수정:
- 회원가입 직후 자동 로그인/세션 전파 여부를 명확히 정의한다.
- 로그인 성공 후 업로드 CTA가 활성화되는 조건과 `/api/auth/session` 상태가 일치하는지 검증한다.
- 업로드 모달 진입 시 인증이 없으면 사전에 CTA를 막고, 파일 선택 이후 뒤늦게 실패시키지 않는다.

증거 파일:
- `.omx/ultraqa/artifacts/p3-scene-upload-2026-06-08T11-30-18-767Z.png`
- `.omx/ultraqa/artifacts/p5-fake-upload-2026-06-08T11-30-18-767Z.png`

### 4. [HIGH/MEDIUM] 주요 페이지 성능과 CLS가 기준 미달

측정값:

| Page | Status | Load time | CLS | Long tasks | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/welcome` | 200 | 2193ms | 0.070 | 3 | 약 5.67MB |
| `/map` | 200 | 6559ms | 0.000 | 2 | 측정값 변동 |
| `/contents` | 200 | 5902ms | 0.033 | 4 | 측정값 변동 |
| `/routes` | 200 | 5740ms | 0.232 | 2 | 측정값 변동 |
| `/spots/REAL-ANI-050` | 200 | 4044ms | 0.034 | 3 | 약 25MB |

문제:
- 3초를 넘는 페이지가 다수다.
- `/routes` CLS 0.232는 사용자 체감 기준에서 명백히 나쁘다.
- 스팟 상세는 transfer가 과도하다.

권장 수정:
- above-the-fold 이미지 크기 예약(width/height/aspect-ratio)과 skeleton height를 고정한다.
- `/routes` 카드/이미지/필터 영역의 lazy load와 layout placeholder를 점검한다.
- 스팟 상세에서 불필요한 이미지 원본/대형 asset 전송을 줄인다.

### 5. [MEDIUM] 접근성 구조가 불안정함

증상:
- 스팟 상세에서 `h1`이 2개 감지됐다.
- heading level이 2에서 4로 건너뛰는 구간이 있다.
- 키보드 focus trail에 Leaflet 내부 `DIV`와 label 없는 focusable 요소가 노출된다.

영향:
- 스크린리더 사용자는 페이지 구조를 안정적으로 파악하기 어렵다.
- 키보드 사용자는 지도/장식 영역에서 불필요하게 갇히거나 길을 잃을 수 있다.

권장 수정:
- 페이지당 주 `h1` 하나 원칙을 강제한다.
- heading hierarchy를 1 -> 2 -> 3 순서로 재정렬한다.
- 지도/장식 DIV는 필요하지 않으면 focus 대상에서 제거하고, 필요한 control에는 이름을 부여한다.

## 잔여 리스크

- 이 리포트는 로컬 개발 서버 기준이다. 운영 CDN/이미지 설정에서는 증상이 달라질 수 있으나, 현재 개발 환경에서 재현되는 500과 UX 차단은 릴리즈 전 반드시 제거해야 한다.
- 업로드 PNG MIME 수정은 단위 테스트로는 통과했지만, 실제 UI 흐름에서는 인증/세션 문제 때문에 끝까지 검증하지 못했다.
- 생성된 QA 계정/데이터는 로컬 DB에 남아 있을 수 있다. 예: `qa.scene.*`, `qa.hostile.*`, `qa.cycle2.*` 계열.

## 우선순위 수정 순서

1. 온보딩 overlay pointer/keyboard 차단 제거.
2. Next image optimizer 500 원인 제거.
3. 회원가입/로그인 직후 업로드 세션 보장.
4. `/routes` CLS와 주요 페이지 3초 초과 로딩 개선.
5. heading/focus/accessibility 구조 정리.
6. 실제 UI에서 PNG 정상 업로드와 fake PNG rejection 재검증.

## 사용한 실행 증거

- 개발 서버: `npm run dev`
- 브라우저 QA: Playwright Chromium, viewport desktop/mobile 혼합
- 리포트 원본:
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`
  - `.omx/ultraqa/artifacts/persona-service-qa-cycle2-run.json`
- 스크린샷:
  - `.omx/ultraqa/artifacts/p1-error-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/p2-error-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/p3-scene-upload-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/p5-fake-upload-2026-06-08T11-30-18-767Z.png`
