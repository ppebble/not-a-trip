# Requirements Document

## Introduction

출시 화면에 노출되는 dummy naming과 production/runtime console logging 위험을 정리하거나 명확히 추적한다. 이 spec은 code review Low Finding 9와 10을 launch content/runtime hygiene 영역으로 분리한다.

This result is derived via logical deduction: `PROOF_DUMMY_DATA` 같은 이름은 launch-facing content를 fixture로 오해하게 만들고, runtime console logging은 incident signal을 흐리게 하거나 운영 맥락을 노출할 수 있다. Low finding이므로 High finding 해결 전 publish approval을 대체하지 않지만 추적 없이 폐기하면 안 된다.

## Source Evidence

- Review finding: Low 9, landing proof data still uses dummy naming for release-facing content.
- Review finding: Low 10, console logging is widespread in server/runtime paths.
- Affected example: `src/components/landing/data/proofData.ts`.
- Warning category: `no-console` across API routes, server utilities, sitemap, auth/checkin/post/user paths, and DB utilities.

## Glossary

- **Launch_Facing_Content**: public landing, proof, showcase, or onboarding UI에 표시되는 실제 출시 대상 콘텐츠.
- **Fixture_Naming**: dummy, sample, test, placeholder 등 production intent를 약화시키는 이름.
- **Runtime_Logger**: environment-aware levels and structured metadata를 제공하는 production-safe logging wrapper.
- **Console_Exception**: tests, scripts, local diagnostics처럼 `console` 사용이 허용되는 제한된 영역.

## Requirements

### Requirement 1: launch-facing proof data는 fixture naming을 사용하지 않아야 한다

**User Story:** As a content maintainer, I want launch proof data to be named as production content, so that future contributors do not treat it as disposable dummy data.

#### Acceptance Criteria

1. THE remediation SHALL rename `PROOF_DUMMY_DATA` to a launch-facing name such as `PROOF_SPOT_CARDS` or `LANDING_PROOF_CARDS`, or document a deferral.
2. IF renamed now, THEN every import, export, test name, and reference SHALL be updated consistently.
3. THE renamed symbol SHALL reflect the data's actual UI purpose, not its historical placeholder status.
4. THE remediation SHALL NOT change displayed content unless required by the rename or a separate content requirement.
5. Verification_Evidence SHALL include targeted tests or type-check evidence proving references remain valid.

---

### Requirement 2: remaining placeholder or dummy content must be classified by launch risk

**User Story:** As a release reviewer, I want residual dummy wording to be visible, so that launch-facing surfaces do not accidentally ship fixture language.

#### Acceptance Criteria

1. THE remediation SHALL scan changed landing proof data and nearby public content for fixture naming or dummy wording.
2. IF remaining fixture naming is public-facing or likely to mislead maintainers, THEN it SHALL be renamed or documented as a follow-up.
3. IF a dummy term is test-only, THEN it SHALL remain isolated to tests/fixtures/scripts.
4. THE final summary SHALL list any remaining Fixture_Naming and classify it as public-facing, internal-only, or test-only.
5. Low finding deferral SHALL NOT be used to hide public-facing placeholder content that affects launch trust.

---

### Requirement 3: production/runtime console logging needs a logger strategy

**User Story:** As an operator, I want runtime logs to be structured and environment-aware, so that production incidents are not buried in noisy console output.

#### Acceptance Criteria

1. THE remediation SHALL either introduce a Runtime_Logger wrapper or file a concrete follow-up for one.
2. IF introduced now, THEN the wrapper SHALL support environment-aware levels and structured metadata.
3. IF introduced now, THEN migration SHALL start with high-signal server/runtime paths rather than tests or scripts.
4. IF deferred, THEN THE follow-up SHALL identify affected runtime areas and expected migration order.
5. THE remediation SHALL preserve legitimate Console_Exception usage in tests/scripts/local diagnostics.

---

### Requirement 4: no-console warning handling must be explicit

**User Story:** As a release maintainer, I want `no-console` warning noise classified, so that operational logging debt is visible and cannot mask real incidents.

#### Acceptance Criteria

1. THE remediation SHALL run or reference lint output that identifies remaining `no-console` warnings.
2. Remaining runtime `console` usage SHALL be classified by risk or assigned to the Runtime_Logger follow-up.
3. THE remediation SHALL NOT globally disable `no-console` to make lint look cleaner.
4. THE final summary SHALL classify logging hygiene status as `fixed`, `partially-fixed`, or `deferred`.
5. Low finding status SHALL NOT block publish if High findings are fixed and logging follow-up is recorded.
