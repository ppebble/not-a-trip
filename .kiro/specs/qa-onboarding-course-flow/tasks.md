# Implementation Plan: QA Onboarding and Course Start Flow

## Overview

Prevent onboarding coach marks from blocking route browsing and course-start interactions. The fix must preserve onboarding guidance while keeping underlying route actions reachable and accessible.

## Tasks

- [x] 1. Make route onboarding non-blocking
  - [x] 1.1 Inspect current onboarding overlay semantics and pointer-event behavior on `/routes` and `/routes/[id]`
  - [x] 1.2 Replace blocking modal semantics with coach-mark semantics when underlying route interaction must remain available
  - [x] 1.3 Ensure highlighted route-card clicks either pass through to the card or trigger equivalent navigation
  - _Requirements: 1.1, 1.2, 1.3, 3.4_

- [x] 2. Keep mobile course-start CTA reachable
  - [x] 2.1 Ensure `/routes/ROUTE-109` `肄붿뒪 ?쒖옉` can be activated at 390x844 without overlay interception
  - [x] 2.2 Add deterministic dismiss/skip behavior and same-profile persistence after dismissal
  - [x] 2.3 Restore focus to a meaningful page element after close/skip/Escape
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Add regression coverage
  - [x] 3.1 Add route onboarding behavior tests for non-modal semantics and click reachability
  - [x] 3.2 Add mobile course-start/dismiss persistence tests at component or behavior level
  - _Requirements: 1.4, 2.1, 3.1, 3.2, 3.3_

- [x] 4. Checkpoint
  - [x] 4.1 Run targeted tests for onboarding/route flow
  - [x] 4.2 Run type-check and lint-relevant validation

