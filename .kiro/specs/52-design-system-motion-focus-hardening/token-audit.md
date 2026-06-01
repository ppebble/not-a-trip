# Spec 52 Design Token Audit and Enforcement Follow-up

## Status

- Design_Token_Contract: `deferred`
- Raw utility enforcement: `deferred`
- Owner: frontend/design-system maintainers before the release-candidate UI freeze.
- Verification path: this document is locked by `src/lib/design-system-motion-focus.test.ts` so the deferral cannot silently disappear.

This result is derived via logical deduction: the repository has semantic Tailwind tokens in `tailwind.config.ts`, but existing component surfaces still contain broad raw palette/state utility usage. Replacing every repeated visual pattern in this launch slice would be a cross-surface design-system migration, not a safe accessibility hardening patch.

## Hotspot Inventory

Measured with a repository grep for raw color utilities (`bg-*`, `text-*`, `border-*`) from non-semantic palettes plus `shadow-*` usage in the requested surfaces.

| Surface | Matches | Files | Risk |
| --- | ---: | ---: | --- |
| `src/components/admin` | 239 | 13 | Highest drift risk: status badges, moderation buttons, error panels, and table/list states encode raw severity colors repeatedly. |
| `src/components/checkin` | 112 | 8 | Modal/card social states and gallery overlays mix raw neutral/red/white classes with semantic tokens. |
| `src/components/mobile` | 15 | 5 | Smaller surface, but overlay/chrome controls can diverge from modal and persistent-nav semantics. |
| `src/components/profile` | 112 | 11 | Badge/progress/community cards contain repeated raw neutral surfaces and state colors. |

## Deferred Enforcement Mechanism

1. Add a design-token lint gate that scans `className` strings for banned raw semantic classes outside primitive/component-token files.
2. Start in warning/report mode for `admin`, `checkin`, `mobile`, and `profile` so existing debt is visible without blocking urgent release fixes.
3. Convert to blocking mode after primitive ownership is clear for:
   - severity/status badges,
   - destructive/confirm buttons,
   - empty/error panels,
   - modal/card surfaces,
   - overlay/chrome controls.
4. Allowed utility categories must remain unblocked: layout, spacing, sizing, grid/flex, typography scale, responsive variants, and arbitrary z-indexes that are not color/surface/shadow semantics.
5. Semantic token classes remain allowed: `primary`, `secondary`, `sunset`, `surface`, `accent-surface`, `background`, `main-text`, `sub-text`, `muted`, `border`, `danger`, and `danger-surface`.

## Primitive Consolidation Targets

- Reuse or create exactly one status/severity badge primitive before replacing admin report badges.
- Reuse or create exactly one action button primitive with variants for primary, secondary, destructive, ghost, and disabled states.
- Reuse or create exactly one empty/error panel primitive for list and form failure states.
- Reuse existing modal/card shells before introducing any new surface primitive.

## Explicit Non-goals for This Patch

- Do not rewrite all admin/profile/check-in class strings in one release-hardening commit.
- Do not add a duplicate Button/Card/Badge primitive without consolidating at least one existing repeated pattern.
- Do not block raw layout utilities; this enforcement concerns color, surface, shadow, and state semantics only.

## Remaining Unenforced Scope

Raw palette and one-off shadow/state utilities remain present in the hotspot surfaces above. The release-safe fix in this spec is to centralize keyboard focus and reduced-motion behavior now, while making token drift measurable and owned instead of pretending it is solved.