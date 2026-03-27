# Design reference

## Design philosophy

- Full-screen map at all times — no persistent chrome
- UI surfaces appear contextually, triggered by user actions
- Designed for outdoor mobile use: large tap targets, high contrast controls
- Primary test device: iPhone SE
- UI language: Dutch (no internationalization needed)

---

## FAB buttons (floating action buttons)

- Position: bottom-right, vertically stacked
- Appearance: large circular buttons, near-black fill, high contrast
- Spacing: generous gap between buttons
- Rationale for right alignment: follows mobile design conventions (e.g. Android FAB, iOS primary actions)

### Buttons (top to bottom)

- Add segment: `FaPlus`
- User location: `FaLocationCrosshairs`

---

## Panels

- Position: top of screen
- Rationale: avoids overlapping FAB buttons at bottom-right
- Appearance: dark background, high contrast text
- Structure: title (left) + close button (right), instruction text below

### Close button

- Icon: `FaPlus` rotated 45° via CSS
- Position: top-right of panel

---

## Segment creation panel

### Drawing mode (step 1)

- Title: "Segment toevoegen"
- Instruction text: "Klik minstens 2 punten om een segment te maken"

### Rating mode (step 2)

- Instruction text updates to: "Kies kwaliteit om op te slaan"
- Five rating cards displayed in a horizontal row, equal width, filling panel
- Each card: emoji + star count + label
- Open question: are rating cards visible (greyed out) from step 1,
  or do they only appear at step 2? (test both on iPhone SE)

### Rating labels (Dutch)

| Rating | Label    |
| ------ | -------- |
| ★      | Kansloos |
| ★★     | Slecht   |
| ★★★    | Redelijk |
| ★★★★   | Goed     |
| ★★★★★  | Geweldig |

---

## Rating colors

- 5 ratings, each with a distinct color
- Colors carried over from PoC — extract as design tokens during setup
- Colors must be distinguishable from each other and from the map background

---

## Segment selection panel

- Appears at top when user taps an existing segment
- Shows: segment length, edit button, delete button, close button
- Edit icon: `FaPenToSquare`
- Delete icon: `FaRegTrashCan`
- Close icon: `FaPlus` rotated 45°

---

## Icons

FontAwesome 6 (React package: `react-icons/fa6`)

| Purpose        | Icon                   |
| -------------- | ---------------------- |
| Add segment    | `FaPlus`               |
| User location  | `FaLocationCrosshairs` |
| Edit segment   | `FaPenToSquare`        |
| Delete segment | `FaRegTrashCan`        |
| Close panel    | `FaPlus` rotated 45°   |

---

## Open design questions

- Rating card visibility during drawing mode (test both options on iPhone SE)
- How to indicate current rating in edit panel
