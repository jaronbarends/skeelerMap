# Leaflet map breakage after Fast Refresh / HMR (CSS modules)

This document describes the bug we hit when editing map-related files under Next.js Fast Refresh, how we fixed it, and how to resolve merge conflicts without regressing the fix.

## Symptoms

After **saving** `MapView.tsx`, `MapView.module.css`, or imported map hooks (Fast Refresh / HMR), the map could appear **broken**:

1. **The map could no longer be dragged** reliably (interaction felt dead or inconsistent).
2. **Clicking a segment** could still change visuals (for example a **thicker polyline**), but **`SegmentDetailsPanel` did not appear** — as if selection state and map events were out of sync with what you saw.
3. **Scrollbars** (vertical and sometimes horizontal) and sometimes a **large dark band under the map** — as if the map container had **no height** while the parent still looked tall.

Endpoint drag markers could **disappear** or feel unreliable after HMR — same class of issue (DOM / icon styling no longer tied to the expected CSS).

## Root cause (why it felt unrelated)

**Leaflet measures and lays out using real DOM geometry.**  
`L.map(container)` expects the container to be a **real box** with **non-zero size** and a **correct positioning context** (typically: parent `position: relative`, map root `position: absolute; inset: 0;`, or equivalent).

**Next.js Fast Refresh + CSS modules** can produce a window where:

- The **React tree** re-renders and hooks re-run,
- but there is a temporary **mismatch** between **old JS references** and **new CSS module class hashes** (or the reverse), or styles do not land on the Leaflet root **atomically** as expected.

Practical outcome: the Leaflet root (`div.leaflet-container` inside your container) could end up effectively **`position: static` with `height: 0px`**, while the parent layout still _looked_ full height. Then:

- you see the **`main` background** as a **dark band** (“black strip”),
- **hit-testing / dragging** partially fails,
- **events / state** feel “half broken” (polyline styling might still update via Leaflet layer objects, while the UI chain above feels inconsistent).

This is the kind of bug that **does not** show up after a hard refresh — only after **HMR stress** (repeatedly saving map-related files).

## Fix (design decision)

**Put Leaflet-critical layout on the map container inline; keep the CSS module class only for non-critical / decorative rules.**

1. **`style={containerStyle}`** in `MapView.tsx` carries **`position`**, **`inset`**, and **`z-index`** so **hash drift / module chunk mismatch** cannot strip those from the element Leaflet mounts into.
2. **`className={styles.container}`** remains so the shell can still use the CSS-module workflow (and a short comment in `MapView.module.css` documents why critical layout is not defined there). The `.container` rule may be empty except for that comment, or hold **only** styling that does not need to survive the same HMR hazard (for example decorative tweaks that are not required for Leaflet’s initial sizing).

In `MapView.tsx`:

- `containerStyle`: `position: 'absolute'`, `inset: 0`, `zIndex: 'var(--z-map)'`.
- Return: `<div ref={containerRef} className={styles.container} style={containerStyle} />`.

In `MapView.module.css`, `.container` does **not** duplicate those properties; the file explains that critical layout lives inline.

**Important:** the reliability guarantee is the **inline** trio — not “duplicate in CSS for safety,” but **single source of truth in TS** for what Leaflet must always see.

## Related fixes from the same incident

### Scrollbars from viewport overflow

`MapUIContainer` had a **`min-height: 100lvh` style constraint** that, together with a header, led to **viewport + content overflow** → scrollbars.

The container should keep stacking context and z-index tokens, but **avoid** forcing full viewport min-height in a way that fights the rest of the layout. Current pattern: `position: relative; height: 100%; min-height: 100%;` with `--z-map`, `--z-fab`, `--z-panel`.

**Merge tip:** if another branch reintroduces `min-height: 100lvh` (or similar), treat it as **high risk** for scrollbar regressions unless there is an explicit layout requirement.

### `invalidateSize` on resize

After layout changes Leaflet must re-measure. `useMapInit` uses a **`ResizeObserver`** on the container that calls `map.invalidateSize()`, plus a **`requestAnimationFrame`** `invalidateSize()` after init.

**Merge tip:** if another branch also adds resize logic, **consolidate** to one observer and one clear invalidate strategy — duplicate observers are a common merge hazard.

### Endpoint markers (`L.divIcon`) less dependent on CSS modules

`createControlMarkerIcon` in `useInitSegmentEventHandlers.ts` builds **inline-styled** HTML for the marker, with border color from `mapColors.rating`, and uses `className: ''` on `L.divIcon`, so markers are not tied to a module class that HMR might desynchronize.

**Merge tip:** `.controlMarker` in `MapView.module.css` may remain for readability, but **runtime-critical marker styling intentionally lives in inline HTML** — do not force it back to module-only classes without a strong reason.

## Merge conflict playbook

Conflicts will mostly appear in files that touch **layout**, **map init**, or **selection markers**.

### `src/components/map/MapView.tsx`

- **Always keep** `containerStyle` and `style={containerStyle}` on the map root `div` (with or without `className={styles.container}`).
- If the other branch adds hooks or props: merge that logic around the existing pattern, but **do not** remove the inline layout in favor of “CSS only” for `position` / `inset` / `z-index` on this element.

### `src/components/map/MapView.module.css`

- **Do not** move the critical trio (`position`, `inset`, `z-index`) back to `.container` as the **only** definition — that reintroduces the HMR failure mode.
- `.container` may hold non-critical rules only; if a merge adds full layout to `.container`, keep the **inline** `containerStyle` in `MapView.tsx` anyway unless you have verified a different HMR-safe approach.

### `src/components/map/MapUIContainer.module.css` (and any layout in `.tsx`)

- Watch conflicts on `height` / `min-height` and z-index tokens.
- Be skeptical of `100lvh` / `100dvh` “fixes” unless the design explicitly needs that viewport unit.

### `src/components/map/useMapInit.ts`

- Avoid duplicate resize mechanisms.
- Keep post-init `invalidateSize()` (rAF) + `ResizeObserver` behavior as the baseline unless you replace it with an equivalent, single path.

### `src/components/map/useInitSegmentEventHandlers.ts`

- In `createEndpointIcon`, **keep** inline-styled HTML and `className: ''` on `divIcon` unless you have another **HMR-safe** approach.

## Verification after merge (~5 minutes, high signal)

1. Start the dev server and open the map page.
2. Edit and save **in sequence** (each save triggers HMR):
   - `MapView.tsx`
   - `MapView.module.css`
   - `useMapInit.ts`
   - `useInitSegmentEventHandlers.ts`
3. After each save, check:
   - pan/drag works,
   - segment click / details flow works,
   - no new scrollbars,
   - no dark strip under the map,
   - endpoint markers visible when a segment is selected.

If something regresses: DevTools → inspect the **outer map container** (`ref={containerRef}`): it should have **absolute + inset 0** and **non-zero height** inside the `position: relative` parent.
