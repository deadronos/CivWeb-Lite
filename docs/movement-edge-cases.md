# Movement flow edge cases

This document lists edge cases to consider for the unit selection and movement flow, and recommended behaviors.

1. AutoSim / concurrent simulation
   - Problem: autoSim advances turns asynchronously while a user is selecting or previewing moves.
   - Recommendation: Pause user selection interactions while autoSim is enabled; or snapshot a read-only view and reject UI actions that would mutate state during autoSim. Prefer showing a banner/modal: "Simulation running — pause to issue commands." Ensure dispatch is idempotent and returns a clear validation error when rejected.

2. Queued commands & optimistic UI
   - Problem: Users may issue multiple commands quickly; commands may be queued or rejected by game rules.
   - Recommendation: Provide optimistic preview but require server/engine confirmation. Mark commands pending with an icon and allow cancellation within a short window.

3. Blocked / invalid paths
   - Problem: Player attempts to move through impassable terrain or into an occupied tile.
   - Recommendation: Gray out unreachable tiles in the movement overlay. When issuing move, validate final path server-side and reject with a toast explaining the reason.

4. Enemy presence & combat
   - Problem: Moving into an enemy tile triggers combat with potentially different rules.
   - Recommendation: Show combat preview overlay when a path enters an enemy-occupied tile; require explicit confirmation for attacks.

5. Insufficient movement points (MP)
   - Problem: Player selects a tile beyond unit MP.
   - Recommendation: Only show tiles within MP as selectable. If the preview path exceeds MP due to dynamic cost changes (e.g., terrain), show an error on issue.

6. UI race conditions (unmount during event traversal)
   - Problem: State updates triggered by a click can unmount DOM nodes being processed by R3F events and cause removeChild errors.
   - Recommendation: Defer state updates to requestAnimationFrame on event handlers (already applied). Stop propagation after handling.

7. Undo / revert
   - Problem: Player wants to revert move during planning stage.
   - Recommendation: Support Cancel Selection (ESC) to remove previews and queued commands. Provide brief undo for executed moves where appropriate.

8. Save / Load consistency
   - Problem: Movement previews or queued commands serialized incorrectly into saves.
   - Recommendation: Save only committed state; do not persist transient UI previews.

9. Multiple units & group commands
   - Problem: Selection of multiple units and issuing group movement may require path planning that avoids collisions.
   - Recommendation: Design group pathing as a later enhancement. For now, restrict to single-unit commands and show clear UI when group selection is attempted.

10. Accessibility
    - Problem: Canvas-only interactions exclude keyboard/screen-reader users.
    - Recommendation: Provide DOM proxies (e2e-hex-proxy) and keyboard focus handlers; allow issuing moves using keyboard navigation and explicit confirm buttons.


Next steps:

- Add Playwright E2E that verifies hover preview (done).
- Add tests for invalid path rejection and combat confirmation.
- Consider UX for queued/optimistic commands.
