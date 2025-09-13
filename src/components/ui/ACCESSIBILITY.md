Accessibility notes — Unit badges
=================================

This small note documents the expected accessible-name and roles for unit badges used across the HUD
and selection overlays. It is intended for developers who add or modify badge components so automated
Playwright + axe checks remain stable and meaningful.

Guidelines
----------

- Role: badge visuals are rendered as images (SVG or icon fonts). When an icon is purely decorative,
  prefer aria-hidden="true". When the icon conveys semantic information (unit category, unit state),
  expose an accessible name.
- Accessible name pattern: compose a short, human-friendly phrase that includes the context and the
  state. Examples used by tests and automation:

  - "Unit badges: Melee with Moved, Fortified" — summary string used on the container when multiple
    state badges are present.
  - "Melee unit category" — exposed on the unit category badge (role=image).
  - "Moved unit state" — exposed on the moved-state badge (role=image).
  - "Fortified unit state" — exposed on the fortified-state badge (role=image).

- Role attribute: use role="img" for SVG/icon badges and supply an `aria-label` with the exact
  phrase above. Tests rely on `getByRole('img', { name: /Moved/ })` style queries to locate badges.
- Container summary: the containing element that groups multiple badges may expose a concise summary
  (aria-label) that lists present states for screen reader users. Make sure this summary updates with
  state changes.

Best practices
--------------

- Keep labels short but descriptive. Prefer consistent wording across badges so automated
  assertions remain stable (e.g., `State unit state` and `Category unit category`).
- When changing label wording or adding new badge types, update `playwright/tests/accessibility-badges.spec.ts`
  and the `test-results/` baseline if you intentionally change behavior.
- Document any exceptions in the component file as a short JSDoc comment to make it discoverable.

Example (JSX)
--------------

```tsx
// ...inside UnitStateBadge component
return (
  <span role="img" aria-label={`${stateName} unit state`} className="unit-state-badge">
    <Icon />
  </span>
);
```

Where `stateName` is e.g. 'Moved' or 'Fortified'.

End of note.
