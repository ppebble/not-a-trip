# 랜딩 모바일 가로 오버플로우 QA 리포트

- 실행일: 2026-06-21
- 대상: 로컬 개발 서버 `http://127.0.0.1:3100`
- 범위: 랜딩 진입(`/` -> `/welcome`), 직접 `/welcome`, 히어로/스토리/소셜 증거/전환 CTA, 모바일 세로·가로·초협폭 viewport
- 기준 handoff:
  - `docs/session-handoffs/2026-06-04-landing-image-regression.md`: 브라우저 레벨 검증 없이 랜딩 수정을 완료로 선언하지 말 것.
  - `docs/session-handoffs/2026-06-08-qa-hardening-specs.md`: 실제 사용자 페르소나 기반 Playwright 검증을 유지할 것.

## 결론

모바일에서 오른쪽 빈 공간으로 가로 스크롤되는 결함을 재현했고 수정했다.

- 재현 신호: iPhone SE 320px visual viewport에서 `document.scrollWidth=560`, `visualViewport.width=320`, 초과 폭 `+240px`.
- 핵심 원인: 히어로 장식 블롭과 플로팅/슬라이더 계열의 off-canvas 요소가 모바일 layout viewport를 오염시켰다.
- 수정 후 신호: 6개 페르소나 전부 `maxOverflowPx=0`, `maxLayoutViewportDriftPx=0`, `maxScrollX=0`.

## 재정립된 테스트 케이스

| ID | 페르소나 | 경로/상태 | 행위 | 기대 신호 |
| --- | --- | --- | --- | --- |
| P1 | iPhone SE 신규 방문자 | `/` first visit redirect | 히어로 로드 후 우측 강제 스크롤 시도 | 문서 폭과 visual viewport 일치, `scrollX=0` |
| P2 | Android compact 스토리 탐색자 | `/welcome` | 스토리텔링 섹션까지 세로 스크롤 | 섹션 전환 후에도 가로 오버플로우 없음 |
| P3 | iPhone modern 소셜 스와이퍼 | `/welcome` | 소셜 증거 영역까지 이동 후 카드 드래그 | carousel clone/off-canvas 카드가 문서 폭을 키우지 않음 |
| P4 | Fold 초협폭 접근성 사용자 | `/welcome`, reduced motion | 최하단까지 이동 | 280px 초협폭에서도 빈 우측 스크롤 없음 |
| P5 | 모바일 landscape 사용자 | `/welcome` | 중간 스크롤로 floating CTA 노출 조건 유도 | fixed CTA가 오염된 layout viewport 폭을 물려받지 않음 |
| P6 | 악의적/실수성 장문 입력자 | `/welcome` | 초장문·이모지·instruction-like 검색어 입력 | 입력값이 페이지 폭을 확장하지 않음 |

## 실행 명령

```bash
npm run dev -- -p 3100
npm run qa:landing-mobile-overflow
```

## 실행 결과

`npm run qa:landing-mobile-overflow`:

| ID | 결과 | maxOverflowPx | maxLayoutViewportDriftPx | maxScrollX |
| --- | --- | ---: | ---: | ---: |
| P1 | PASS | 0 | 0 | 0 |
| P2 | PASS | 0 | 0 | 0 |
| P3 | PASS | 0 | 0 | 0 |
| P4 | PASS | 0 | 0 | 0 |
| P5 | PASS | 0 | 0 | 0 |
| P6 | PASS | 0 | 0 | 0 |

원본 JSON 증거:

- `.omx/ultraqa/artifacts/landing-mobile-overflow-results.json`

## 회귀 방지 규칙

1. 모바일 폭 검증에서 `window.innerWidth`만 신뢰하지 않는다. overflow로 layout viewport가 이미 오염되면 false green이 된다.
2. `visualViewport.width`, `documentElement.clientWidth`, `document/body scrollWidth`, 실제 `window.scrollTo(9999, y)` 후 `scrollX`를 함께 본다.
3. 랜딩에서 absolute decorative blob, off-canvas carousel clone, fixed bottom CTA는 문서 폭을 확장하면 안 된다.
4. Playwright 없는 단위 테스트만으로 이 결함을 완료 처리하지 않는다.

## 잔여 리스크

- 이 리포트는 로컬 Chromium 기반 검증이다. iOS Safari 실기기 rubber-band 감각은 운영 배포 후 별도 스모크로 한 번 더 확인하는 것이 안전하다.
- 기존 handoff의 이미지 optimizer 500, 온보딩 overlay 차단 등은 본 리포트의 직접 수정 범위가 아니다.
