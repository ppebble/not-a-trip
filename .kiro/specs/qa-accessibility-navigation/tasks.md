# Implementation Plan: QA Accessibility and Keyboard Navigation

## Overview

Fix semantic heading, focus, accessible-name, and contrast risks on representative spot and route pages without replacing native semantics with ARIA patches.

## Tasks

- [x] 1. Fix heading hierarchy
  - [x] 1.1 Audit representative spot detail and route detail heading structure
  - [x] 1.2 Ensure exactly one page-content `h1` and no skipped levels
  - [x] 1.3 Add heading regression tests for duplicate `h1` and skipped levels
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Fix keyboard focus order
  - [x] 2.1 Remove decorative/map internals from tab order unless they are named controls
  - [x] 2.2 Ensure non-native focusable elements have role, name, and keyboard activation
  - [x] 2.3 Add or document skip/leave behavior for interactive map regions
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Ensure accessible names and contrast triage
  - [x] 3.1 Add accessible names for icon-only buttons and controls
  - [x] 3.2 Triage low-contrast candidates and fix confirmed user-visible text contrast
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 4. Checkpoint
  - [x] 4.1 Run targeted accessibility/heading tests
  - [x] 4.2 Document map accessibility decisions

