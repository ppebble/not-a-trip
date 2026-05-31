# Requirements Document

## Introduction

Not a Trip을 외부 사용자에게 공개(publishing)하기 전에, 기능 추가가 아니라 출시 실패를 만들 수 있는 잔여 정리 항목을 체계적으로 잠근다. 현재 저장소에는 배포 검증(spec 44), 보안/오남용 방지(spec 42), 운영 도구(spec 43), 실제 이미지/콘텐츠 정리(spec 47)가 이미 존재하므로, 본 spec은 이를 다시 구현하지 않는다. 대신 퍼블리싱 직전 반드시 통과해야 하는 문서, 설정, 데이터, UI, 빌드, 런타임 검증의 마감 기준을 정의한다.

이 작업의 핵심은 "보기에 그럴듯한 미완성"을 제거하는 것이다. 깨진 문서 인코딩, stale handoff/status, placeholder 데이터, 임시 개발 링크, 누락된 환경 변수, 빌드 경고, 모바일 주요 여정의 막힘을 퍼블리싱 전에 식별하고 정리한다.

## Glossary

- **Publishing_Readiness_Check**: 퍼블리싱 전 최종 정리 상태를 확인하는 전체 점검 절차.
- **Release_Blocker**: 퍼블리싱을 진행하면 사용자 영향, 데이터 손상, 보안 노출, 서비스 중단을 만들 수 있는 문제.
- **Cleanup_Backlog**: 퍼블리싱 전에 처리하거나 명시적으로 defer 해야 하는 정리 항목 목록.
- **Placeholder_Content**: dummy, sample, lorem ipsum, placeholder 이미지, 임시 문구, 테스트 전용 링크처럼 실제 서비스 품질을 대표하지 않는 콘텐츠.
- **Mojibake_Document**: 문자 인코딩이 깨져 원문 의미를 신뢰할 수 없는 문서.
- **Public_Critical_Path**: 비로그인 방문자가 랜딩, 지도, 스팟 상세, 코스, 커뮤니티, 로그인/프로필 진입까지 이동하는 주요 공개 경로.
- **Operational_Readiness**: 배포 후 장애 감지, 로그 확인, 롤백 판단, 환경 변수 검증이 가능한 상태.
- **Launch_Gate_Report**: 퍼블리싱 전 통과/보류/차단 항목과 검증 증거를 기록하는 최종 보고서.

## Requirements

### Requirement 1: 퍼블리싱 범위와 차단 기준 고정

**User Story:** As a project owner, I want a fixed publishing readiness scope, so that cleanup work does not expand endlessly and the release decision is based on explicit blockers.

#### Acceptance Criteria

1. THE Publishing_Readiness_Check SHALL define the target release surface before cleanup begins.
2. THE Publishing_Readiness_Check SHALL classify each finding as `blocker`, `must-fix-before-publish`, `defer-with-owner`, or `no-action`.
3. IF a finding can expose secrets, break authentication, corrupt user data, or block the Public_Critical_Path, THEN THE Publishing_Readiness_Check SHALL classify it as `blocker`.
4. IF a finding is cosmetic but visible on a high-traffic public page, THEN THE Publishing_Readiness_Check SHALL classify it at least as `must-fix-before-publish` unless explicitly deferred.
5. THE Launch_Gate_Report SHALL list every deferred item with reason, owner, and safest follow-up action.
6. THE cleanup scope SHALL NOT include unrelated feature expansion unless that expansion is required to remove a Release_Blocker.

---

### Requirement 2: 문서와 handoff 정리

**User Story:** As the next maintainer, I want publishing documents to be readable and current, so that release work is not guided by broken or stale instructions.

#### Acceptance Criteria

1. WHEN scanning release-critical documents, THE Publishing_Readiness_Check SHALL identify Mojibake_Document files whose meaning cannot be trusted.
2. IF a Mojibake_Document is release-critical and the original text is recoverable from Git history, THEN the cleanup SHALL restore the readable version from verified history.
3. IF a Mojibake_Document is not recoverable, THEN the cleanup SHALL either delete it or replace it with a concise readable summary that clearly states the source limitation.
4. THE cleanup SHALL verify that `docs/session-handoffs/README.md`, `status.md`, `todo.md`, and `workflow.md` do not contradict current Git history.
5. THE cleanup SHALL keep dated handoff files factual and SHALL NOT rewrite historical handoffs except to correct factual errors.
6. THE Launch_Gate_Report SHALL include the final documentation status and any documents intentionally left unchanged.

---

### Requirement 3: placeholder, dummy, and test-only content removal

**User Story:** As a public visitor, I want to see production-quality content, so that the service does not look unfinished or fake at launch.

#### Acceptance Criteria

1. WHEN scanning source, seed data, and public pages, THE Publishing_Readiness_Check SHALL identify Placeholder_Content exposed to public users.
2. IF Placeholder_Content appears on landing, map, spot detail, route, course, community, or profile entry pages, THEN the cleanup SHALL replace it with production-safe content or remove the exposed surface.
3. IF a placeholder image domain or sample image is still required for local development, THEN the cleanup SHALL ensure it is not used by production data or public fallback paths.
4. THE cleanup SHALL verify that real spot/media cards use source-grounded images where the UI represents a specific place.
5. THE cleanup SHALL verify that test-only navigation links, debug pages, and temporary admin affordances are hidden from public production navigation.
6. THE Launch_Gate_Report SHALL list remaining non-production content, if any, and classify each item by release risk.

---

### Requirement 4: environment and secret readiness

**User Story:** As an operator, I want the production environment requirements to be explicit and validated, so that publishing does not fail because of missing or unsafe configuration.

#### Acceptance Criteria

1. THE Publishing_Readiness_Check SHALL compare required runtime variables against `.env.example`, Next.js config, authentication config, database usage, storage usage, and observability usage.
2. IF a required production environment variable is missing from `.env.example`, THEN the cleanup SHALL add a documented placeholder without exposing real secrets.
3. IF any `NEXT_PUBLIC_` variable could expose sensitive values, THEN the cleanup SHALL classify it as a Release_Blocker.
4. THE cleanup SHALL verify that production URLs use HTTPS where required, including auth callback URLs and public site URLs.
5. THE cleanup SHALL verify that local-only values such as `localhost`, dummy secrets, or development database names are not required for production behavior.
6. THE Launch_Gate_Report SHALL include an environment checklist with `required`, `optional`, and `not used` status.

---

### Requirement 5: build, type, lint, and test gate

**User Story:** As a release owner, I want deterministic local verification before publishing, so that broken code is not shipped.

#### Acceptance Criteria

1. THE cleanup SHALL run the smallest relevant targeted tests for changed behavior.
2. THE cleanup SHALL run `npm run type-check` before declaring code changes publish-ready.
3. THE cleanup SHALL run `npm run build` before declaring runtime, routing, config, asset, or data-loading changes publish-ready.
4. IF `npm run lint` is unavailable or broken because of framework/tooling drift, THEN the Launch_Gate_Report SHALL record the exact failure and the next-best static checks used.
5. IF any verification command fails, THEN the cleanup SHALL either fix the failure or classify it as a Release_Blocker with evidence.
6. THE Launch_Gate_Report SHALL include exact commands, pass/fail outcomes, and known warning noise.

---

### Requirement 6: public critical path smoke validation

**User Story:** As a first-time user, I want the main public flows to work on mobile and desktop, so that the initial published experience is not blocked.

#### Acceptance Criteria

1. THE Publishing_Readiness_Check SHALL validate the landing page loads without runtime errors.
2. THE Publishing_Readiness_Check SHALL validate that public navigation can reach map, spot detail, route/course, community, login, and profile entry surfaces as applicable.
3. THE Publishing_Readiness_Check SHALL validate mobile viewport behavior for the Public_Critical_Path.
4. IF any public route produces a server error, hydration error, infinite loading state, or missing required data state, THEN the finding SHALL be classified as a Release_Blocker.
5. IF a public route intentionally requires authentication, THEN the route SHALL show a clear login-required path instead of a broken or empty state.
6. THE Launch_Gate_Report SHALL identify which paths were manually or automatically smoke-tested.

---

### Requirement 7: data and media integrity gate

**User Story:** As a content maintainer, I want launch data to be internally consistent, so that public users do not see broken images, invalid routes, or misleading location content.

#### Acceptance Criteria

1. THE Publishing_Readiness_Check SHALL run existing route/media validators when changed data can affect public content.
2. IF a public image URL is broken, unrelated to its represented spot, or blocked by Next image configuration, THEN the cleanup SHALL fix the URL/config or remove the affected public card.
3. THE cleanup SHALL verify that route data references valid spot IDs and does not include impossible ordering or missing coordinates.
4. THE cleanup SHALL verify that public spot cards include the minimum required display fields for their UI context.
5. IF a data issue cannot be fixed before publishing, THEN the affected content SHALL be hidden or explicitly deferred with release-risk classification.
6. THE Launch_Gate_Report SHALL include validator command outcomes for data/media surfaces.

---

### Requirement 8: operational readiness and rollback evidence

**User Story:** As an operator, I want deployment monitoring and rollback instructions ready, so that publishing can be stopped or reversed quickly if production breaks.

#### Acceptance Criteria

1. THE Publishing_Readiness_Check SHALL verify that error monitoring configuration is documented and not dependent on local-only values.
2. THE cleanup SHALL verify that deployment validation scripts or documented manual checks exist for post-publish confirmation.
3. THE Launch_Gate_Report SHALL include the safest rollback path for the target hosting provider or repository workflow.
4. IF Sentry or equivalent observability is intentionally disabled for launch, THEN the Launch_Gate_Report SHALL mark the operational risk explicitly.
5. THE cleanup SHALL verify that known existing warnings are either fixed or documented with impact and owner.
6. THE publishing process SHALL NOT be marked ready unless rollback and post-publish smoke checks are documented.

---

### Requirement 9: final launch gate report

**User Story:** As the person deciding whether to publish, I want one final evidence-backed report, so that the go/no-go decision is auditable.

#### Acceptance Criteria

1. THE cleanup SHALL produce a Launch_Gate_Report before publishing.
2. THE Launch_Gate_Report SHALL include summary status: `ready`, `ready-with-deferrals`, or `blocked`.
3. THE Launch_Gate_Report SHALL include changed files, verification commands, unresolved risks, deferred items, and recommended next action.
4. IF any Release_Blocker remains unresolved, THEN the Launch_Gate_Report SHALL mark status as `blocked`.
5. IF all Release_Blockers are resolved but non-critical deferrals remain, THEN the Launch_Gate_Report SHALL mark status as `ready-with-deferrals`.
6. THE Launch_Gate_Report SHALL be committed with the cleanup changes or explicitly documented as intentionally uncommitted.
