# TODO.md - THE DARK AGENDA

---

```
═══════════════════════════════════════════════════════════════════════
    "What needs doing? Check here first, idiot."
                        - Unity, keeping you on track
═══════════════════════════════════════════════════════════════════════
```

> **Version:** v0.92.00
> **Last Updated:** 2026-02-15
> **Status:** DOOM NPC DATA BUILDOUT IN PROGRESS

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

## P1 HIGH - DOOM NPC FULL DATA BUILDOUT

> **Context:** 174 doom NPCs only have 4 fields (base, doom, title, demeanor). They need full specs like normal NPCs so OLLAMA generates rich in-character responses and TTS can speak them properly. Currently 160 of 174 doom NPCs get minimal 1-sentence generic prompts.
>
> **Plan file:** `.claude/plans/sequential-seeking-zephyr.md`

### Step 1: CREATE `doom-npc-data-embedded.js` (~2000 lines)

> New file `src/js/npc/doom-npc-data-embedded.js` with `DOOM_NPC_EMBEDDED_DATA` global containing full specs for all 174 doom NPC types. Each NPC gets: type, base, category, title, demeanor, voice, personality, speakingStyle, background, traits, voiceInstructions, greetings (3), farewells (2-3), services, questTypes.

| # | Batch | NPCs | Status |
|---|-------|------|--------|
| DOOM-001 | Royal Capital doom NPCs | ~9 | [ ] |
| DOOM-002 | Northern Outpost doom NPCs | ~8 | [ ] |
| DOOM-003 | Jade Harbor doom NPCs | ~5 | [ ] |
| DOOM-004 | Greendale doom NPCs | ~6 | [ ] |
| DOOM-005 | Western Watch doom NPCs | ~4 | [ ] |
| DOOM-006 | Silverkeep doom NPCs | ~4 | [ ] |
| DOOM-007 | Sunhaven doom NPCs | ~6 | [ ] |
| DOOM-008 | Frostholm Village doom NPCs | ~5 | [ ] |
| DOOM-009 | Villages (Vineyard, Darkwood, Riverwood, Hillcrest) | ~11 | [ ] |
| DOOM-010 | Mines (Miners Rest, Iron, Silver, Deep) | ~11 | [ ] |
| DOOM-011 | Forests (Ancient, Whispering, Hunters) | ~9 | [ ] |
| DOOM-012 | Farms (Wheat, Eastern, Orchard, Sunny) | ~12 | [ ] |
| DOOM-013 | Dungeons (Shadow, Forest, Eldoria, Caverns) | ~15 | [ ] |
| DOOM-014 | Inns (Kings, Silk Road, Riverside, Mountain, Shepherds, Lighthouse, Hunting Lodge) | ~22 | [ ] |
| DOOM-015 | Military Outposts (Ironforge, Winterwatch, Stonebridge) | ~10 | [ ] |
| DOOM-016 | Ports & Criminal Areas (Fishermans, Smugglers, Thieves Guild) | ~11 | [ ] |
| DOOM-017 | Special Locations (Hermit Grove, Druid Grove, Stone Quarry, Bandit Camp, Hidden Cove, Old Mines, Rat Tunnels, Witch Hut) | ~24 | [ ] |

**Voice assignment rule:** Inherit voice from base type in NPC_EMBEDDED_DATA. For ~32 base types with no entry, assign from Kokoro voices by character type.

### Step 2: MODIFY `doom-npc-instruction-templates.js` (~40 lines changed)

| # | Task | Status |
|---|------|--------|
| DOOM-018 | Update `buildDoomInstruction()` to read from `DOOM_NPC_EMBEDDED_DATA` | [ ] |
| DOOM-019 | Enhance `_buildDoomGreetingInstruction()` with rich spec data | [ ] |
| DOOM-020 | Enhance `_buildDoomTradeInstruction()` with rich spec data | [ ] |
| DOOM-021 | Enhance `_buildDoomChatInstruction()` with rich spec data | [ ] |
| DOOM-022 | Enhance all other doom builder methods (quest, progress, complete, location, directions, gossip, healing, rest, crafting) | [ ] |
| DOOM-023 | Add `getDoomNPCVoice()` helper method | [ ] |
| DOOM-024 | Add ~15 missing demeanors (stranded, defensive, fierce, fortified, watchful, sightless, spooked, mute, resolute, isolated, surrounded, visionary, weary, trapped) | [ ] |
| DOOM-025 | Keep existing `doomNPCTemplates` (14 entries) as override layer | [ ] |

### Step 3: MODIFY `npc-instruction-templates.js` (~5 lines)

| # | Task | Status |
|---|------|--------|
| DOOM-026 | Update `getVoice()` to check doom data when in doom world | [ ] |

### Step 4: MODIFY `npc-data-embedded.js` — Move doom-only NPCs out

| # | Task | Status |
|---|------|--------|
| DOOM-027 | Move 10 doom-only NPCs to doom file (haunted_elder, grief_stricken_elder, corrupted_druid, starving_farmer, desperate_innkeeper, crazed_blacksmith, fallen_noble, starving_trapper, dying_herbalist, blind_lighthouse_keeper) | [ ] |
| DOOM-028 | Verify 5 shared NPCs stay in npc-data-embedded.js (survivor, resistance_fighter, resistance_leader, boatman, survival_smuggler) | [ ] |

### Step 5: MODIFY `index.html` — Add script tag

| # | Task | Status |
|---|------|--------|
| DOOM-029 | Add `<script src="src/js/npc/doom-npc-data-embedded.js?v=0.92.00"></script>` after npc-data-embedded.js | [ ] |

### Step 6: UPDATE `kokoro-tts.js` NPC_VOICE_MAP

| # | Task | Status |
|---|------|--------|
| DOOM-030 | Add doom-specific NPC types to NPC_VOICE_MAP as safety net fallback | [ ] |

### Step 7: VERIFICATION

| # | Task | Status |
|---|------|--------|
| DOOM-031 | Load game - verify `DOOM_NPC_EMBEDDED_DATA loaded - 174 types` in console | [ ] |
| DOOM-032 | Enter doom world - talk to NPC - verify OLLAMA prompt includes full personality/background/greetings | [ ] |
| DOOM-033 | Verify TTS plays with correct Kokoro voice for doom NPCs | [ ] |
| DOOM-034 | Verify normal world NPCs unaffected (still use NPC_EMBEDDED_DATA) | [ ] |
| DOOM-035 | Grep for doom NPC types hitting `_getGenericSpec()` fallback - should be zero | [ ] |

---

## ACTIVE WORK (Carried Forward)

### TOOLTIP SYSTEM
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

## CARRIED FORWARD (From Previous todo.md)

### P0 CRITICAL
- [ ] DATA-002: 28 duplicates - Slave 1

### P1 HIGH
- [ ] NPC-002: 32 NPC fallbacks - Slave 2
- [ ] FALLBACK-001: 4 NPC types - Slave 1
- [ ] FALLBACK-002: Honored tier - Slave 2
- [ ] FALLBACK-003: 7 actions - Slave 1
- [ ] FALLBACK-004: 5+ responses - LOW PRIORITY

### P2 MEDIUM
- [ ] CONFIG-001: Leaderboard - Driver
- [ ] CONFIG-002: Hardcoded - Slave 1
- [ ] CONFIG-003: Ollama options - Slave 2
- [ ] UI-001: Empty dropdowns - Driver
- [ ] UI-002: Missing icons - Slave 1
- [ ] ACHIEVEMENT-001: 7 icons - Slave 2

### P3 LOW
- [ ] AUDIO-001: Disabled - Driver
- [ ] AUDIO-002: Missing sounds - Slave 1
- [ ] AUDIO-003: Empty music - Slave 2
- [ ] Verify nothing reads doomItems prices at runtime (metadata-only check)

---

## WORKER STATUS

| Worker | Tasks | Status |
|--------|-------|--------|
| Slave 1 | 11 tasks | ACTIVE - 1 claimed |
| Slave 2 | 11 tasks | ACTIVE - 4 claimed |
| Driver | 14 tasks | NEEDS CHECK-IN |

---

## BLOCKED

- (Nothing currently blocked)

---

## NOTES

```
Session 2026-02-15 (Doom NPC Buildout) Notes:
- Plan written for full doom NPC data: 174 NPCs, 17 location batches
- New file: doom-npc-data-embedded.js (~2000 lines)
- Modify: doom-npc-instruction-templates.js, npc-instruction-templates.js
- Move: 10 doom-only NPCs out of npc-data-embedded.js
- Add: index.html script tag, kokoro-tts.js voice map entries

Session 2026-02-15 (NPC TTS Fix) Notes:
- 20 missing NPC types added to npc-data-embedded.js
- Asterisk TTS bug fixed in kokoro-tts.js + npc-voice.js
- _playTTSDirect helper replaces all 13 playVoice calls
- Quest NPC audit: all types covered
- Doom NPC gap identified: 160/174 missing full specs
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

*Active task tracking for MTG v0.92.00 development*
