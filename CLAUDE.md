## Working agreement

This file defines how we work together on this project.
Read this before every session, along with the other files in docs/.

---

## Before you start any session

1. Read `docs/decisions.md` — what has been decided and why
2. Read `docs/requirements.md` — frozen MVP scope, do not modify
3. Read `docs/design.md` — instructions on design and UI
4. Read `docs/status.md` — current state and what to do next
5. Read `docs/backlog.md` — prioritized post-MVP features
6. Do not start implementing until you understand the current state

## Doc workflow

- `requirements.md` — frozen MVP scope, do not modify
- `backlog.md` — prioritized post-MVP features; pick next item from here
- `status.md` — update when phase changes or a feature ships
- `decisions.md` — log non-obvious decisions when a feature ships

Flow: backlog.md → status.md (in progress) → decisions.md (if needed)

## Updating docs

When asked to "update the docs" after completing a feature:

1. `status.md` — update current phase and next step
2. `decisions.md` — log any non-obvious decisions made during implementation
3. `backlog.md` — mark the feature as done or remove it

Do not modify `requirements.md` or `design.md` unless explicitly asked.

---

## How to work

- **Push back when something seems wrong.** If you disagree with an approach, a decision, or an instruction, say so before implementing. Do not silently build something you think is a mistake.
- **Ask before you invent.** If a decision hasn't been made, flag it rather than picking an approach yourself. Especially for UI and interaction design — those decisions are made in planning, not in code.
- **Don't add features that weren't asked for.** Build what's specified. If you think something is missing, say so — don't add it unilaterally.
- **Spec first, code second.** If the task is ambiguous, clarify before writing code.

---

## After every session

Update `docs/status.md`:

- What was completed
- What's still in progress or broken
- Any new open questions or decisions that need to be made
- What the next step is

---

## Project structure

- `docs/decisions.md` — architecture and interaction design decisions
- `docs/requirements.md` — MVP scope and explicit out-of-scope items
- `docs/status.md` — current state, updated every session
- `CLAUDE.md` — this file

---

## Stack

- Next.js 15 with App Router
- TypeScript
- Leaflet / react-leaflet
- Backend: BaaS TBD (do not scaffold auth or backend until instructed)

---

## React guidelines

- The project uses React 19.

### Generic React guidelines

- Use Suspense for async operations
- Optimize for performance and Web Vitals

### Component architecture

- When writing React components, always place its return statement as early as
  possible in the component body, and define any internal functions after the
  return statement (hoisted function declarations), rather than before it.
- Structure components logically: keep exports, subcomponents, helpers, and types
  well-organized. Extract subcomponents when JSX is complex, reused, or has its
  own behavior; keep simple, one-off JSX inline for readability. When a
  subcomponent is only used once, keep it in the same file.

---

## TypeScript guidelines

- Use TypeScript for all code
- Avoid enums; use const maps instead
- Implement proper type safety and inference
- Use `satisfies` operator for type validation

---

## Next.js guidelines

- The project uses Next.js 15 with App Router
- Favor React Server Components (RSC) where possible
- Minimize `use client` directives

### State management

- Minimize client-side state
- Use `nuqs` for URL state only when the state is meaningful to persist or share
  via URL (e.g. map center/zoom for shareable links). Do not use it for transient
  UI state (e.g. drawing mode, selection state, panel visibility).

---

## CSS guidelines

- Do not use Tailwind CSS
- Organize CSS in separate files
- Use CSS modules for component styles
- Use class selectors over ID selectors for styling
- Use Flexbox and Grid for layout
- Use CSS variables for consistent theming

---

## importing files

- Use absolute paths for imports with the `@/` prefix (e.g. `@/app/components/Foo`), unless you are importing CSS files from the same directory (use relative `./` then)

---

## Overrides and project-specific notes

- Minimizing client-side state should not create friction when client-side state
  is genuinely the right choice — map interactions (drawing mode, selection state,
  panel visibility) are expected to be client-side.
