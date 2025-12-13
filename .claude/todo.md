# TODO.md - THE DARK AGENDA

---

```
═══════════════════════════════════════════════════════════════════════
    "What needs doing? Check here first, idiot."
                        - Unity, keeping you on track
═══════════════════════════════════════════════════════════════════════
```

> **Current Session:** #87
> **Last Updated:** 2025-12-10
> **Status:** CLEAN SLATE - All P0/P1/P2/P3 Complete

---

## HOW TO USE THIS FILE

### Status Tags:
- `[ ]` - Not started
- `[~]` - In progress
- `[x]` - Done (move to finalized.md)
- `[!]` - Blocked/needs input
- `[?]` - Needs investigation

### Priority:
- `[P0]` - Do this NOW (crash bugs, exploits)
- `[P1]` - Do this TODAY (broken features)
- `[P2]` - Do this SOON (should fix)
- `[P3]` - Backlog

---

## ACTIVE WORK

> Nothing pending. Clean slate ready for new bugs/features.

---

## BACKLOG

> Low priority items to address when touching affected systems.

- Code cleanup: dead code removal when touching affected files
- Documentation: update comments during feature work
- Performance: profile before optimizing

---

## BLOCKED

- (Nothing currently blocked)

---

## NOTES

```
Session #86 Notes:
- BOOTSTRAP REFACTOR COMPLETE - 50+ files migrated
- Down from 66 DOMContentLoaded handlers to 1 central Bootstrap
- All P0/P1/P2/P3 from 10-agent audits resolved
- State managers complete: PlayerStateManager, WorldStateManager, UIStateManager
- Architecture docs complete: skill-tree.md, ARCHITECTURE.md

Session History (See finalized.md for details):
- #86: Bootstrap refactor, unity-coder.md
- #85: Event naming, WorldStateManager migration
- #84: 10-agent final sweep, 11 P0 fixes
- #83: WorldStateManager, ARCHITECTURE.md, Phase 4 complete
- #82: EventBus batch, SystemRegistry tracking
- #81: UIStateManager
- #80: PanelUpdateManager, equipment migration
- #79: Inventory migration (20 files)
- #78: PlayerStateManager, TransportSystem extraction
- #77: 5 game.js extractions
- #76: Doom & UI fixes
- #75: Quest & combat fixes
- #74: 10-agent audit, user requests
- #73: 16 P0 critical fixes
- #71-72: Massive audit & tech debt
- #70: Workflow system creation
```

---

## QUICK REFERENCE - FIX ORDER

When bugs come in, prioritize like this:

1. **P0 CRASH** - Game won't load, immediate crash
2. **P0 DATA LOSS** - Save corruption, progress lost
3. **P0 EXPLOITS** - Infinite money, invincibility
4. **P1 BROKEN** - Feature doesn't work at all
5. **P2 WRONG** - Feature works but incorrectly
6. **P3 UGLY** - Works fine but looks/feels bad

---

```
═══════════════════════════════════════════════════════════════════════
    "A TODO list is a contract with your future self.
     Don't be a dick to future you."
═══════════════════════════════════════════════════════════════════════
```

*Active task tracking for MTG development - Clean Slate Edition*
