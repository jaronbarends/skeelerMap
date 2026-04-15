# Requirements

## MVP scope

### Core features

- [ ] Full-screen map (Leaflet) centered on user location
- [ ] User location dot marker
- [ ] Add segment flow
  - [ ] Drawing mode with control points
  - [ ] Road-following polyline between consecutive points
  - [ ] 5-option rating picker
  - [ ] Segment saved in rating color on confirm
  - [ ] Cancel clears all drawn points/lines
  - [ ] Creation requires login (when logged out, show login/register prompt)
- [ ] Segment selection and editing
  - [ ] Tap segment to select (thicker stroke, endpoint dots, panel)
  - [ ] Panel shows length, edit, delete, close
  - [ ] Edit rating (rating picker, current rating indicated)
  - [ ] Delete with confirmation prompt
  - [ ] Close deselects without changes
- [ ] Segments persist across sessions (local storage for MVP, BaaS later)
- [ ] Location button — centers map on user
- [ ] Default map center (Netherlands) when location unavailable

### Pages (MVP)

- / — map view (the entire app for now)

### Not in MVP

- Store segments in a BaaS
- FAQ or other pages
- Drag-to-edit segment endpoints (v1.1)
- Auto-follow location mode
- Zoom-based visual scaling
- Legend / info panel
- Logo / branding
- keyboard shortcuts (esc to cancel, delete to delete segment in edit mode)

---

## Design constraints

- Primary test device: iPhone SE (small screen — UI decisions must be validated here)
- Full-screen map at all times — no persistent chrome
- Minimize clicks — every interaction step must earn its place
- Stored segment data is routed geometry only (not original control points)
