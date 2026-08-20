# Implementation Plan: QA Authenticated Scene Image Upload

## Overview

Make scene upload authentication state deterministic in the UI, accept real PNG uploads after authentication, reject fake PNG files after authentication, and keep the flow end-to-end testable without hidden bypasses.

## Tasks

- [x] 1. Stabilize authenticated upload state
  - [x] 1.1 Inspect session/auth hooks used by scene upload modal and spot detail CTA
  - [x] 1.2 Show explicit loading/retry/auth-required states before file selection
  - [x] 1.3 Disable or redirect upload CTA when `/api/auth/session` has no user
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Verify valid PNG upload path
  - [x] 2.1 Ensure client validation allows valid `.png` files with unreliable MIME
  - [x] 2.2 Ensure server validation accepts valid PNG binary signature under policy limits
  - [x] 2.3 Ensure success or pending-review UI state is explicit after upload
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Verify fake PNG rejection path
  - [x] 3.1 Ensure fake PNG/JPEG-byte mismatch is rejected after authentication
  - [x] 3.2 Ensure mismatch errors are localized and do not expose stack details
  - [x] 3.3 Ensure unauthenticated users see auth errors before validation errors
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Add regression coverage
  - [x] 4.1 Add upload modal tests for loading/auth/file-selection state gates
  - [x] 4.2 Reuse upload validation tests for valid PNG and fake PNG paths
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Checkpoint
  - [x] 5.1 Run targeted upload/auth tests
  - [x] 5.2 Run type-check and lint-relevant validation

