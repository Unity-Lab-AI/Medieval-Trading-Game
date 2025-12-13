# Old/Deprecated Files

These files are no longer active in the game. They were moved here on 2025-12-02 during a dead code cleanup.

## Deprecated Files (Replaced by time-machine.js)

| File | Reason | Replaced By |
|------|--------|-------------|
| `game-engine.js` | Old game loop system | `time-machine.js` |
| `time-system.js` | Old time tracking | `time-machine.js` |

## Files Restored to Active Codebase (2025-12-02)

The following doom world files were restored and are now actively loaded:
- `doom-world-config.js` → `src/js/data/`
- `doom-world-npcs.js` → `src/js/data/`
- `doom-npc-instruction-templates.js` → `src/js/npc/`
- `doom-quest-system.js` → `src/js/systems/progression/`

These files are now part of the Doom World feature!

---

The remaining files here (game-engine.js, time-system.js) can be deleted if you're confident they won't be needed.
