# Implementation Plan: QA Scene Image File Format Validation

## Overview

Keep binary signature authoritative: real PNG files pass despite unreliable browser MIME, fake PNG files fail, and users receive precise localized errors.

## Tasks

- [x] 1. Accept real PNG despite unreliable MIME
  - [x] 1.1 Client extension fallback allows image files with unreliable/generic MIME
  - [x] 1.2 Server binary signature detection accepts valid PNG binary with `.png`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Reject binary mismatches authoritatively
  - [x] 2.1 Reject `.png` files with JPEG magic bytes
  - [x] 2.2 Reject PNG MIME with unsupported/non-PNG binary signature
  - [x] 2.3 Reject unknown binary signatures unless an explicit safe rule exists
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Tighten validation messages and auth precedence
  - [x] 3.1 Confirm size errors, unsupported-format errors, mismatch errors, and auth-required states are distinct
  - [x] 3.2 Add missing UI/API tests for message precedence if coverage is incomplete
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Complete regression coverage
  - [x] 4.1 Valid PNG with incorrect MIME
  - [x] 4.2 Fake PNG/JPEG binary mismatch
  - [x] 4.3 Supported extension/MIME/binary agreement cases
  - [x] 4.4 Scene upload UI extension fallback before server validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Checkpoint
  - [x] 5.1 Run upload validation and scene upload UI tests

