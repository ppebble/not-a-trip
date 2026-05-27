# Tasks: 40-spot-quality-workflow

## 1. Duplicate detector hardening
- [x] Extend nearby duplicate API payload with duplicate/proximity details and totals
- [x] Fix client duplicate-check consumption so nearby warnings are actually respected
- [x] Persist duplicate suspicion on submitted spot reports for admin prioritization

## 2. Lifecycle management
- [x] Normalize lifecycle transition handling to repository spot IDs
- [x] Keep lifecycle history query/write paths aligned with stored spot IDs

## 3. Quality reports for existing spots
- [x] Add spot quality report domain/service layer
- [x] Add per-spot GET/POST API for quality report summary and submission
- [x] Enforce 24h duplicate submission rejection by reporter/type/spot
- [x] Mark urgent review when same-type reports accumulate

## 4. SLA tracking
- [x] Implement deadline evaluation helpers and SLA exceeded state projection
- [x] Add aggregate SLA stats for admin dashboard summary
- [x] Surface pending quality report count in admin dashboard data

## 5. Supplement request workflow
- [x] Add admin supplement request creation/listing API
- [x] Add contributor response API
- [x] Expire overdue supplement requests and refresh spot quality flags

## 6. Closure detection and spot surfacing
- [x] Sync closure suspicion / urgent review / pending supplement counters onto spots
- [x] Add admin quality report review API with close/reopen handling
- [x] Expose quality flags from spot list/detail APIs
- [x] Surface closure / supplement / urgent-review badges on spot detail
- [x] Dim closed spots on the map pin layer

## 7. Verification
- [x] Add focused tests for quality report processor
- [x] Add focused route tests for spot quality report APIs
- [x] Update dashboard summary tests for quality/SLA additions
- [x] Pass targeted Jest runs
- [x] Pass `npm run type-check`
