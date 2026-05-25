# Implementation Plan: Security and Abuse Prevention

## Overview

Spec 42 covers API throttling, spam prevention, NSFW moderation, upload abuse protection, authentication security, and input sanitization.

This task document reflects the current codebase state:

- rate limiting, spam guard, upload abuse protection, NSFW moderation hook, and sanitization are already implemented
- the remaining follow-up work is concentrated in auth-security completion and explicit verification coverage

## Tasks

- [x] 1. API rate limiting baseline
  - middleware IP sliding-window throttling
  - write-endpoint sliding-window throttling
  - `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Spam guard baseline
  - duplicate check-in delay guard
  - rapid comment/report/post throttles
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. NSFW moderation baseline
  - upload moderation handoff with 5-second timeout
  - block high-score images
  - allow pending review when moderation service is unavailable
  - security logging for moderation outcomes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Upload abuse baseline
  - SHA-256 fingerprinting
  - duplicate fingerprint reuse within 24 hours
  - hourly upload limit
  - authenticated upload enforcement
  - fingerprint metadata persistence
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Auth security baseline
  - 24-hour JWT/session max age
  - failed-login lockout tracking
  - 15-minute lockout after 5 failures in 5 minutes
  - successful-login security logging
  - _Requirements: 5.1, 5.3_

- [x] 6. Auth security completion
  - [x] 6.1 Add requirements-based lockout status response
    - expose reason and unlock time before credential sign-in
    - _Requirements: 5.4_
  - [x] 6.2 Track login contexts for new IP/device detection
    - persist active login contexts
    - log new IP/device sign-ins
    - _Requirements: 5.5_
  - [x] 6.3 Add security warning for 3+ active distinct IP contexts
    - _Requirements: 5.6_
  - [x] 6.4 Make inactivity/reauth coverage explicit
    - use 24-hour session expiry as the hard reauthentication boundary
    - log reauthentication after 30+ day inactivity at the next successful login
    - _Requirements: 5.2_

- [x] 7. Input sanitization baseline
  - strip script/html
  - escape Mongo-style operators
  - sanitize register/checkin/post/comment/report payloads
  - http/https-only URL sanitization
  - server-side sanitization logs
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Verification checkpoint
  - targeted auth-security tests
  - targeted sanitization/rate-limit regression checks
  - `npm run type-check`

## Notes

- Spec 42 is complete once Task 6 and Task 8 are verified.
- The upload/auth/sign-in UX should remain backward compatible while exposing clearer lockout feedback.
