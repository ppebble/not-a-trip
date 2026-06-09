# Implementation Plan: QA Image Rendering and Optimizer Stability

## Overview

Remove local/uploaded image optimizer 500s, provide stable fallback rendering, and add test coverage so `/_next/image` regressions are caught before release.

## Tasks

- [x] 1. Audit image rendering paths
  - [x] 1.1 Locate `next/image` usage for local icons, mascot/category assets, content covers, route cards, and spot detail media
  - [x] 1.2 Identify assets that should bypass the optimizer via safe static rendering
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [x] 2. Harden local and uploaded image rendering
  - [x] 2.1 Render fragile local UI assets without optimizer when needed
  - [x] 2.2 Add stable fallback image handling for missing/unreadable uploaded covers
  - [x] 2.3 Reserve dimensions/aspect ratios to avoid layout shift when images load or fail
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3_

- [x] 3. Add observability and regression checks
  - [x] 3.1 Add bounded logging/diagnostics for unique image failures where the app controls fallback
  - [x] 3.2 Add tests proving core image components avoid broken optimizer paths and preserve fallback dimensions
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint
  - [x] 4.1 Run targeted image/component tests
  - [x] 4.2 Run build or smoke check for image routes if feasible

