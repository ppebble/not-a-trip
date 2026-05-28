# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-05-29
- Primary product surfaces: landing `/welcome`, map `/map`, content discovery, gallery/check-in, route planning, spot detail/reporting.
- Evidence reviewed:
  - `src/app/globals.css` — CSS variable color tokens and semantic roles.
  - `tailwind.config.ts` — Tailwind token exposure.
  - `src/components/layout/Header.tsx` and `HeaderAuthControls.tsx` — global navigation color usage.
  - `src/components/landing/*` — landing hero, cards, CTA, and theme behavior.
  - `.kiro/specs/22-landing-page/design.md`, `.kiro/specs/23-landing-page-polish/design.md`, `.kiro/specs/27-theme-selector-menu/design.md` — prior landing/theme intent.
  - External travel references reviewed on 2026-05-29: Airbnb-style warm coral accents, Expedia-style blue/gold trust/excitement, and general travel palettes using neutral backgrounds with teal/coral/amber accents.

## Brand
- Personality: fan-travel companion, warm, exploratory, trustworthy, slightly playful.
- Trust signals: readable map/data UI, stable CTA hierarchy, clear categories, restrained motion, consistent semantic tokens.
- Avoid: one-note purple surfaces, every button having a different color, low-contrast pastel text, hard-edged heavy typography, neon overload.

## Product goals
- Goals:
  - Help fans discover real-world places connected to works, artists, teams, and scenes.
  - Make map exploration, route following, and check-in proof feel connected.
  - Keep the interface approachable in both light and dark modes.
- Non-goals:
  - Do not turn the app into a generic travel agency booking interface.
  - Do not replace category colors with arbitrary decorative colors per component.
- Success signals:
  - Primary actions remain obvious.
  - Cards feel varied but not chaotic.
  - Light/dark modes share the same brand logic.

## Personas and jobs
- Primary personas:
  - Fan traveler planning a location visit.
  - Casual browser looking for places from a favorite work.
  - Community contributor uploading proof/check-ins.
- User jobs:
  - Search by work/place.
  - Browse by category.
  - Follow a route.
  - Save/report/verify a spot.
- Key contexts of use: mobile-first travel planning, outdoor navigation, quick browsing before/while traveling.

## Information architecture
- Primary navigation: home, map, contents, gallery, routes, spot registration, profile/auth.
- Core routes/screens: `/welcome`, `/map`, `/contents`, `/gallery`, `/routes`, `/spots/[id]`, `/reports`.
- Content hierarchy: value proposition → search/discovery → category/story cards → social proof → conversion CTA.

## Design principles
- Principle 1: One dominant action color, multiple supporting travel hues.
- Principle 2: Semantic tokens first; component-specific colors only for category/status meaning.
- Principle 3: Surfaces should feel continuous across scroll sections, not like isolated panels.
- Tradeoffs: keep purple/indigo brand recognition, but balance it with teal for discovery and sunset for warm travel moments.

## Visual language
- Color:
  - Primary: Harbor Indigo for core actions, focus, route/navigation confidence.
  - Secondary: Sea Teal for discovery, map, category exploration, hover states.
  - Sunset: warm accent for admin/special states, passport/check-in warmth, subtle highlights.
  - Background: restrained stone/off-white in light mode, deep slate/navy in dark mode; borders must stay visibly darker than warm surfaces.
  - Category/content colors: related but varied; use category tokens rather than ad hoc Tailwind colors.
- Typography: Pretendard/system; prefer `font-semibold`, relaxed line height, and slight negative tracking on large display text.
- Spacing/layout rhythm: mobile-first, generous card padding, section rhythm of 16–24 spacing units.
- Shape/radius/elevation: rounded cards (`1rem–1.5rem`), soft shadows, avoid sharp rectangular panels on marketing surfaces.
- Motion: subtle hover lift and fade/slide; respect reduced motion.
- Imagery/iconography: real spot images first, mascot/icons as supportive cues.

## Components
- Existing components to reuse:
  - `ThemeSelector`, `Header`, `CTAButton`, landing cards, `ProofCard`, category/content token configs.
- New/changed components:
  - `LandingThemeProvider` for landing theme parity without full session/query providers.
- Variants and states:
  - Primary button: indigo.
  - Secondary/support action: teal or neutral surface.
  - Warm/special accent: sunset.
  - Category chips/cards: category tokens.
- Token/component ownership:
  - Global palette lives in `src/app/globals.css`.
  - Tailwind token exposure lives in `tailwind.config.ts`.
  - Do not hardcode new brand hex colors in components unless SVG/gradient limitations require it.

## Accessibility
- Target standard: practical WCAG AA contrast for text and controls.
- Keyboard/focus behavior: use visible focus rings based on primary token.
- Contrast/readability: pastel fills must pair with dark enough foreground tokens.
- Screen-reader semantics: preserve route/section labels and button labels.
- Reduced motion and sensory considerations: avoid essential information in animation only.

## Responsive behavior
- Supported breakpoints/devices: mobile-first through desktop.
- Layout adaptations: stack cards on mobile; preserve CTA reachability.
- Touch/hover differences: hover color/lift should be enhancement only.

## Interaction states
- Loading: skeleton/shimmer on neutral/accent surfaces.
- Empty: mascot/icon plus clear recovery action.
- Error: danger token, concise recovery path.
- Success: secondary/sunset can support positive/check-in moments without replacing primary action hierarchy.
- Disabled: reduce opacity and preserve text contrast where possible.
- Offline/slow network: keep fallback content visible and avoid blank marketing sections.

## Content voice
- Tone: warm, direct, fan-aware, not corporate.
- Terminology: use “장소”, “스팟”, “코스”, “인증”, “여권” consistently.
- Microcopy rules: prefer conversational guidance over command-heavy phrasing.

## Implementation constraints
- Framework/styling system: Next.js App Router, Tailwind, CSS variables, `next-themes`.
- Design-token constraints: use semantic tokens (`background`, `surface`, `main-text`, `sub-text`) and role tokens (`primary`, `secondary`, `sunset`).
- Performance constraints: avoid adding runtime color libraries or heavy visual dependencies.
- Compatibility constraints: dark mode is class-based; landing must not force `.dark`.
- Test/screenshot expectations: token changes require static token tests plus type/lint/build verification; visual screenshots are recommended for future pixel-level work.

## Open questions
- [ ] Should the mascot/logo asset itself be recolored to match Harbor Indigo/Sea Teal/Sunset? Owner: design/product. Impact: stronger brand consistency.
- [ ] Should admin-only surfaces keep sunset accents or move to a stricter utility/status palette? Owner: product. Impact: admin IA clarity.
