# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-26
- Primary product surfaces: `/welcome`, `/contents`, `/map`, `/routes`, `/spots/[id]`
- Evidence reviewed: live production pages, public API inventory, `src/components/landing`, `src/components/layout/Header.tsx`, `src/app/globals.css`, design tokens in `tailwind.config.ts`, repository QA reports, prior landing/theme specs under `.kiro/specs`

## Brand

- Personality: knowledgeable, calm, fan-aware, practical
- Trust signals: real-place photography, clear work-to-place relationships, map context, route duration and difficulty, visible information provenance when available
- Avoid: fabricated community momentum, decorative sections without a user job, repeated install prompts, game-like terminology before the information value is clear

## Product goals

- Goals: help fans find real places connected to works and prepare a visit with useful context
- Non-goals: presenting Not a Trip as a social network before sustained community activity exists; making PWA installation a primary conversion goal
- Success signals: search or curated discovery leads to a content, spot, map, or route detail; users can understand what information is available before signing in

## Personas and jobs

- Primary personas: first-time fan traveler, location researcher, itinerary planner
- User jobs: find a place by work or name; understand where it is; compare relevant places; follow a practical route
- Key contexts of use: trip research on desktop, in-transit lookup on mobile, on-site map use

## Information architecture

- Primary navigation: home, works, places/map, curated routes
- Secondary navigation: check-ins, place contribution, account and settings
- Core routes/screens: `/welcome`, `/contents`, `/contents/[name]`, `/map`, `/spots/[id]`, `/routes`, `/routes/[id]`
- Content hierarchy: search intent -> work/place context -> visit information -> map/route action -> optional contribution

## Design principles

- Information before participation: show useful public data before asking users to sign in, install, upload, or post.
- Evidence before social proof: community activity is displayed only when it comes from real production records.
- One section, one job: avoid repeating the same discovery choices through chips, cards, process diagrams, and floating prompts.
- Map as a view, not the whole identity: map exploration supports the information architecture rather than replacing it.
- Tradeoffs: retain the mascot as a restrained brand accent, but do not use it as filler in every section.

## Visual language

- Color: existing Harbor Indigo primary, Sea Teal secondary, Sunset accent, and neutral semantic tokens; neutral surfaces carry most informational content
- Typography: Pretendard with strong Korean readability, concise headings, and comfortable body line height
- Spacing/layout rhythm: compact editorial sections with a maximum content width; avoid full-screen height unless the user job benefits
- Shape/radius/elevation: existing rounded cards with lower shadow emphasis for information surfaces
- Motion: optional and short; content must remain visible when motion libraries fail or reduced motion is requested
- Imagery/iconography: real location images first, work covers second, mascot only as a small brand accent

## Components

- Existing components to reuse: `LandingHeader`, `HeroSection`, `EntryPointSection`, `StorytellingSection`, `CategoryCard`, semantic design tokens
- New/changed components: `InformationStandardsSection`; information-first variants of hero and entry-point copy
- Variants and states: real empty states must not be replaced with fictional testimonials
- Token/component ownership: palette variables remain in `src/app/globals.css`; Tailwind exposure remains in `tailwind.config.ts`; components use semantic and category tokens instead of new raw colors

## Accessibility

- Target standard: WCAG 2.1 AA for core public discovery flows
- Keyboard/focus behavior: all search, chips, cards, and links remain keyboard reachable with visible focus states
- Contrast/readability: semantic text and surface tokens; no text rendered only through imagery
- Screen-reader semantics: one `h1`, ordered section headings, descriptive labels, decorative mascots hidden
- Reduced motion and sensory considerations: content is immediately visible without animation and respects reduced-motion preference

## Responsive behavior

- Supported breakpoints/devices: 280px minimum defensive width, 390px primary mobile, tablet, 1440px desktop
- Layout adaptations: single-column mobile cards, bounded horizontal content, desktop grids without off-canvas document overflow
- Touch/hover differences: touch does not depend on hover; targets remain at least 44px where practical

## Interaction states

- Loading: preserve layout and show useful text before deferred visual content
- Empty: state the absence honestly and point to available information paths
- Error: keep navigation and retry context available
- Success: route users to a concrete content, place, map, or route result
- Disabled: explain why an action is unavailable
- Offline/slow network: retain PWA support as infrastructure, not primary landing-page promotion

## Content voice

- Tone: direct, factual, concise, fan-aware without exaggerated enthusiasm
- Terminology: use `작품`, `장소`, `스팟`, `코스`, `방문 정보`; reserve `인증` for real user check-ins
- Microcopy rules: describe what the user will see after an action; do not imply user counts or testimonials without production data

## Implementation constraints

- Framework/styling system: Next.js App Router, React, Tailwind CSS, existing semantic tokens
- Design-token constraints: no raw color utility expansion without updating the repository token baseline
- Performance constraints: server-render useful public text; dynamically load only non-critical interaction and animation
- Compatibility constraints: preserve `/` first-visit routing, returning-user `/map` routing, authentication behavior, and public SEO metadata
- Test/screenshot expectations: targeted Jest contracts, lint, type-check, build, 390px and 1440px screenshots, horizontal overflow check

## Open questions

- [ ] Define which spot fields qualify as verified and how the last-reviewed date is exposed / product owner / trust labeling
- [ ] Decide when real check-in volume is sufficient to restore community proof on the landing page / product owner / social proof
- [ ] Validate the primary navigation reduction in the next independent work unit / frontend / global IA
