# TODO.md - THE DARK AGENDA

---

```
═══════════════════════════════════════════════════════════════════════
    "What needs doing? Check here first, idiot."
                        - Unity, keeping you on track
═══════════════════════════════════════════════════════════════════════
```

> **Current Session:** #88
> **Last Updated:** 2025-12-13
> **Status:** TOOLTIP CRISIS + VERIFICATION PHASE

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

## ACTIVE WORK - SESSION #88

### CRITICAL: TOOLTIP SYSTEM BROKEN
> Tooltips don't work ANYWHERE except People panel. Blocking tutorial!

| Task | Status | Assigned |
|------|--------|----------|
| TOOLTIP-007: Global tooltip system | [~] In Progress | Slave 1 |
| TOOLTIP-001: Action bar tooltips | [ ] Pending | Slave 1 |
| TOOLTIP-002: Map panel tooltips | [ ] Pending | Slave 2 |
| TOOLTIP-003: Settings panel | [ ] Pending | Driver |
| TOOLTIP-004: Inventory tooltips | [ ] Pending | Slave 1 |
| TOOLTIP-005: Trade panel | [ ] Pending | Slave 2 |
| TOOLTIP-006: Quest panel | [ ] Pending | Driver |

**Pattern:** Just use `element.title = 'Tooltip text'`

### VERIFICATION TASKS (Driver)

| Task | Status | Notes |
|------|--------|-------|
| DRIVER-VERIFY-001 | [ ] Pending | Verify P0 fixes |
| DRIVER-REBUILD-001 | [ ] Pending | Clean build test |
| DRIVER-REGRESSION-001 | [ ] Pending | Regression suite |
| DRIVER-TOOLTIP-001 | [ ] Pending | Tooltip audit |
| DRIVER-CONFIRM-001 | [ ] Pending | Completion criteria |

### FIXES MADE BY UNITY (Need Verification)

| Fix | File | Status |
|-----|------|--------|
| 34 empty icons | item-database.js | VERIFY |
| Ferryman NPC | game-world.js | VERIFY |
| Rat tunnels shop | game-world.js | VERIFY |
| 3 boss flags | combat-system.js | VERIFY |
| 5 action builders | npc-instruction-templates.js | VERIFY |

---

## WORKER STATUS

| Worker | Tasks | Status |
|--------|-------|--------|
| Slave 1 | 11 tasks | ACTIVE - 1 claimed |
| Slave 2 | 11 tasks | ACTIVE - 4 claimed |
| Driver | 14 tasks | NEEDS CHECK-IN |

---

## FROM TODO.md (Main)

### P0 CRITICAL (5 tasks)
- [x] DATA-001: Empty icons - FIXED
- [ ] DATA-002: 28 duplicates - Slave 1
- [ ] DATA-003: 7 doom items - Slave 2
- [x] DATA-004: Ferryman NPC - FIXED
- [x] DATA-005: Rat tunnels shop - FIXED

### P1 HIGH (7 tasks)
- [x] NPC-001: Action builders - FIXED
- [ ] NPC-002: 32 NPC fallbacks - Slave 2
- [ ] FALLBACK-001: 4 NPC types - Slave 1
- [ ] FALLBACK-002: Honored tier - Slave 2
- [ ] FALLBACK-003: 7 actions - Slave 1
- [ ] FALLBACK-004: 5+ responses - LOW PRIORITY
- [x] COMBAT-001: Boss flags - FIXED

### P2 MEDIUM (7 tasks)
- [ ] CONFIG-001: Leaderboard - Driver
- [ ] CONFIG-002: Hardcoded - Slave 1
- [ ] CONFIG-003: Ollama options - Slave 2
- [ ] UI-001: Empty dropdowns - Driver
- [ ] UI-002: Missing icons - Slave 1
- [ ] ACHIEVEMENT-001: 7 icons - Slave 2

### P3 LOW (3 tasks)
- [ ] AUDIO-001: Disabled - Driver
- [ ] AUDIO-002: Missing sounds - Slave 1
- [ ] AUDIO-003: Empty music - Slave 2

---

## INVESTIGATION COMPLETE

### Ollama Model Downloader - VERIFIED WORKING
- Script loads in index.html line 1347
- init() called in game.js line 2721
- Checks localhost:11434 for Ollama
- Shows download prompt if model missing
- Graceful fallback to pre-written responses
- ALL SCENARIOS HANDLED

---

## BLOCKED

- (Nothing currently blocked)

---

## NOTES

```
Session #88 Notes:
- 36+ tasks posted to ClaudeColab
- Tooltip crisis identified - blocking tutorial
- Driver verification tasks created
- Ollama model manager investigated - WORKING
- Slave 1 & 2 active and grinding

Session #87 Notes:
- Bootstrap refactor complete
- 10-agent ultrathink audit done
- 275+ issues catalogued in TODO.md

Session History (See finalized.md for details):
- #86: Bootstrap refactor, unity-coder.md
- #85: Event naming, WorldStateManager migration
- #84: 10-agent final sweep, 11 P0 fixes
- #83: WorldStateManager, ARCHITECTURE.md
- #82: EventBus batch, SystemRegistry tracking
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

*Active task tracking for MTG development - Session #88*
