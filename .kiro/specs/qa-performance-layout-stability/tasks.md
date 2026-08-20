# Implementation Plan: QA Performance and Layout Stability

## Overview

Reduce route/map/content/spot perceived load risk by prioritizing stable layout reservations, lazy-loading below-fold media, and budget checks that expose regressions.

## Tasks

- [x] 1. Stabilize `/routes` layout
  - [x] 1.1 Audit route cards, filters, headers, and image containers for missing dimensions
  - [x] 1.2 Reserve stable card/image/skeleton dimensions to keep CLS below 0.1
  - [x] 1.3 Add regression tests for route card layout dimensions where practical
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Bound spot detail transfer
  - [x] 2.1 Lazy-load non-critical below-fold spot images
  - [x] 2.2 Ensure responsive image sizes match viewport needs
  - [x] 2.3 Bound retry/fallback behavior for failed images
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Document and enforce local budgets
  - [x] 3.1 Add or update budget docs/scripts for route JS, CLS, transfer, and long-task signals
  - [x] 3.2 Ensure QA report can surface long-task and load regressions without hiding functional failures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3_

- [x] 4. Checkpoint
  - [x] 4.1 Run targeted layout/performance tests and existing route budget checks
  - [x] 4.2 Run build-relevant validation

