HUD UI components

- TopBar: presentational top bar showing turn and resources. Container `TopBarContainer` reads from `useGame()` and maps human player science/culture to resources.
- ResourceBadge: small pill badge for a resource value and optional delta.
- NextTurnControl: button with keyboard support. Container `NextTurnControlContainer` dispatches `END_TURN`.
- LeftPanel: presentational research list. Container `LeftPanelContainer` filters available tech and dispatches `SET_RESEARCH`.
- Minimap: clickable overview. Container `MinimapContainer` calls `useCamera().centerOn`.
- ContextPanel: presentational panel for selected context and actions.

Styles: tokens live in `src/styles.css` under CSS variables (`--color-*`).

