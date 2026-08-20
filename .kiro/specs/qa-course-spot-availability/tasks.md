# Implementation Plan: QA Course Spot Availability Classification

## Overview

Centralize route spot availability classification so available spots are not shown as lost by default, explicit unavailable states remain visible, and seed validation prevents missing references.

## Tasks

- [x] 1. Centralize availability classification
  - [x] 1.1 Add shared route spot availability helper
  - [x] 1.2 Treat active status aliases as available
  - [x] 1.3 Do not classify missing optional status aliases as lost by default
  - _Requirements: 1.1, 1.2, 3.1_

- [x] 2. Preserve explicit unavailable states
  - [x] 2.1 Treat removed/closed/lost/unavailable aliases as unavailable
  - [x] 2.2 Preserve mixed route order and status distinction in API classification data
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Harden API projections and seed validation
  - [x] 3.1 Project enough status fields from `/api/routes/[id]`
  - [x] 3.2 Ensure route seed/validation fails missing spot IDs before user-facing all-lost pages
  - [x] 3.3 Add or update tests for active, unavailable, null, unknown, and missing ID cases
  - _Requirements: 1.3, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint
  - [x] 4.1 Run route spot availability tests and route validation checks

