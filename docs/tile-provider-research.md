# Tile provider research

## Context

SkeelerMap uses Leaflet (plain, not react-leaflet) with a `tilesProvider.ts` abstraction for the tile layer. The goal was to find a tile provider that is:

- Free, with no risk of unexpected billing
- Suitable for a non-commercial, free public app
- Compatible with Leaflet's standard XYZ raster tile layer (drop-in swap in `tilesProvider.ts`)

The original provider was **CartoDB (Positron/Voyager)**. The reason for evaluating alternatives was a claim in a previous conversation that CartoDB's terms prohibited SkeelerMap's usage. After double-checking the actual sources (`carto.com/basemaps` and the GitHub README), this turned out to be incorrect: CartoDB's commercial restriction is explicitly scoped to commercial use. SkeelerMap, being non-commercial and free, is not in violation.

---

## Services evaluated

### OpenStreetMap (`tile.openstreetmap.org`)

- **Type:** Raster XYZ tiles
- **Free tier:** Yes — no API key required
- **Commercial restriction:** None explicit, but heavy users may be blocked. Commercial services and donation-seeking apps are warned that access can be withdrawn. Non-commercial, low-traffic apps are tolerated.
- **Leaflet compatibility:** Drop-in XYZ URL, no extra dependencies
- **Conclusion:** ✅ **Suitable for now.** A reasonable option for a small non-commercial app. No ToS violation. Risk is reliability, not compliance: OSM may rate-limit or block if traffic grows significantly. Chosen as the current provider.

---

### OpenFreeMap

- **Type:** Vector tiles only (MapLibre style URL)
- **Free tier:** No account, no API key, no published rate limits. Explicitly free for all use including commercial.
- **Commercial restriction:** None.
- **Leaflet compatibility:** ⚠️ **Not a drop-in.** Requires two additional dependencies: `maplibre-gl` (~210 kB gzipped) and `@maplibre/maplibre-gl-leaflet` (tiny). MapLibre renders in a canvas layer underneath Leaflet, with Leaflet handling events and updating MapLibre behind the scenes. This can result in slower perceived performance on mobile. Total added bundle size: ~210 kB gzipped.
- **Conclusion:** ⚠️ **Viable but not a simple swap.** Best free option with no ToS concerns. The integration complexity and bundle size cost make it a non-trivial change, and the project is maintained by a single developer (reliability not guaranteed). Worth revisiting if the current provider becomes a problem.

---

### CartoDB (Positron / Voyager)

- **Type:** Raster XYZ tiles
- **Free tier:** No — free public use is not permitted without an approved grant or enterprise license
- **Commercial restriction:** Enterprise license required for commercial use
- **Non-commercial restriction:** Free use is restricted to CARTO enterprise customers and approved non-profit grantees only. The CARTO grants program requires formal non-profit status — having a non-commercial project is not sufficient.
- **Leaflet compatibility:** Drop-in XYZ URL, no extra dependencies
- **Conclusion:** ❌ **Not suitable.** Despite the tile URLs being widely used and no API key being required, the LICENSE.md in the CartoDB basemap-styles repo explicitly states that access to CARTO's tile services is not available for free public use. Using these tiles without an enterprise license or an approved grant is a ToS violation.

---

### Stadia Maps

- **Type:** Raster and vector tiles
- **Free tier:** 2,500 credits/month (~150–250 map loads). Free tier is explicitly for development, evaluation, and non-commercial use only.
- **Commercial restriction:** Any public app or for-profit use requires a paid plan.
- **Leaflet compatibility:** XYZ raster tiles work as drop-in; API key required
- **Conclusion:** ❌ **Not suitable.** Free tier quota is too small for a live app (~150–250 loads/month). Paid plans start around $10–20/month, which conflicts with the "free only" constraint.

---

### MapTiler Cloud

- **Type:** Raster and vector tiles
- **Free tier:** 100,000 monthly API requests / 5,000 map sessions. Free tier is explicitly limited to non-commercial use and R&D.
- **Commercial restriction:** Non-commercial only on free tier. Paid plans start at $25/month.
- **Leaflet compatibility:** XYZ raster tiles work as drop-in; API key required
- **Conclusion:** ❌ **Not suitable.** While the quota is more generous than Stadia, the non-commercial restriction on the free tier is ambiguous for a public production app. Paying is not an option per the project's constraints.

---

### Mapbox

- **Type:** Raster and vector tiles
- **Free tier:** ~50,000 map loads/month. Commercial use explicitly allowed on free tier.
- **Commercial restriction:** None on free tier — pay-as-you-go above the threshold.
- **Spending cap:** **None.** Mapbox does not offer the ability to cap monthly billing. The only way to prevent charges is to manually delete API tokens, which takes maps offline entirely.
- **Leaflet compatibility:** XYZ raster tiles work as drop-in; API key required
- **Conclusion:** ❌ **Not suitable.** Despite a generous free tier and permissive commercial terms, the complete absence of a spending cap creates unbounded billing risk. Incompatible with the "no payment, ever" constraint.

---

## Current decision

**Continue using CartoDB** (already in use, no ToS violation, no extra setup) with **OSM as a fallback** if CartoDB's tiles become unavailable.

Switching providers is intentionally low-effort: the `tilesProvider.ts` abstraction means any XYZ provider is a one-line change. OpenFreeMap remains the best long-term option if a more robust free provider is ever needed, at the cost of adding ~210 kB to the bundle and a more complex tile layer integration.

---

## Notes on `tilesProvider.ts` architecture

To support both XYZ raster providers and MapLibre-based providers (like OpenFreeMap) in the future, the provider object should use a `type` discriminator:

```typescript
// XYZ raster provider (CartoDB, OSM, etc.)
export const tilesProvider = {
  type: 'xyz',
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
} as const;

// MapLibre provider (OpenFreeMap)
// export const tilesProvider = {
//   type: 'maplibre',
//   styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
// } as const;
```

The branching logic lives in `createTileLayer()` in `useMapInit.ts`, so `useMapInit` itself does not need to change when switching providers.
