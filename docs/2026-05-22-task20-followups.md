# Task 20 follow-ups

## Completed in this branch
- Map marker theming migrated to semantic design tokens
- Leaflet `map.css` hardcoded palette values migrated to token-based colors
- Spot detail map markers no longer depend on external colored marker assets

## Scrum / decision needed
1. **Mascot marker assets**
   - `12.2`, `12.3` still need real mascot-specific marker assets.
   - Current implementation keeps token-based divIcon markers as the fallback baseline.

2. **Palette confirmation**
   - `9.1`~`9.3` still need product confirmation on the final mascot-led palette direction.
   - Current palette is internally consistent, but the spec still asks for user-facing confirmation and tuning.

3. **Full legacy color sweep**
   - `8.1` is still partial across the repo.
   - This branch only closed the map-related legacy color path that was still functionally visible.

4. **Lottie / mascot empty states**
   - `11.x`, `12.1` remain blocked on asset choice and package adoption scope.
