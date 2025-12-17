# TODO.md - Medieval Trading Game v0.91.13 REMASTERED

---

> **Unity AI Lab** | 10-AGENT ULTRATHINK PARALLEL AUDIT
> *Session: Full Codebase Deep Scan + Travel Panel Fixes*
> *Date: 2025-12-16*
> *Status: P0 FIXES APPLIED - Travel Panel Bugs Resolved*

---

# P0 CRITICAL FIXES APPLIED (2025-12-16)

## TRAVEL-001: Animated Emoji Bobbing - FIXED
**File:** `src/js/systems/travel/travel-panel-map.js:2385`
**Issue:** The `walk-bounce` animation on travel marker used `margin-top` causing layout thrash, making the entire travel info card bob up and down.
**Fix:** Removed `animation: walk-bounce 0.3s ease-in-out infinite;` from the travel marker inline styles.
**Status:** FIXED

## TRAVEL-002: Cancel Travel Button Not Working - FIXED
**File:** `src/js/systems/travel/travel-panel-map.js:295-308`
**Issue:** Cancel button onclick handler not firing reliably due to constant HTML rebuilding (every 250ms).
**Fix:** Added event delegation on parent container (`#current-destination-display`) to catch clicks via `e.target.closest('#cancel-travel-btn')`.
**Status:** FIXED

---

# EXECUTIVE SUMMARY - 10-AGENT ULTRATHINK RESULTS

| Agent | Scope | Issues | Status |
|-------|-------|--------|--------|
| Agent 1 | NPC Instructions | 17 issues | 5 missing action builders |
| Agent 2 | Item Database | ~~87+ issues~~ ✅ | ~~34 empty icons, 28 dupes~~ VERIFIED CLEAN |
| Agent 3 | Quest Data | 0 issues | 129 quests VERIFIED |
| Agent 4 | NPC Fallbacks | 96+ gaps | 4 types missing, 7 actions missing |
| Agent 5 | Location/World | 5 critical | Empty shops, missing NPCs |
| Agent 6 | Combat System | 6 issues | 3 bosses need flags |
| Agent 7 | Achievement Data | 7 missing | Icons incomplete |
| Agent 8 | Config/API | 27 issues | Empty configs, hardcoded |
| Agent 9 | UI Panel Data | 12 issues | Empty dropdowns |
| Agent 10 | Audio/Assets | 18 issues | Audio DISABLED |
| **TOTAL** | **ALL SYSTEMS** | **275+ issues** | **REMASTERED** |

---

# P0: CRITICAL - GAME-BREAKING SHIT

## ~~DATA-001: Item Database Has 34 Empty Icons~~ ✅ VERIFIED FIXED
**File:** `src/js/data/items/item-database.js`
**Status:** VERIFIED 2025-12-13 - All 319+ items have valid emoji icons. No empty icons found.
**Verified By:** Unity

## ~~DATA-002: Item Database Has 28 Duplicate Definitions~~ ✅ VERIFIED FIXED
**File:** `src/js/data/items/item-database.js`
**Status:** VERIFIED 2025-12-13 - No duplicates found in database. Already cleaned.
**Verified By:** Unity

## ~~DATA-003: 7 Undefined Items in doomItemMappings~~ ✅ FIXED
**File:** `src/js/data/items/item-database.js`
**Status:** FIXED 2025-12-13 - Added void_fragment, dark_artifact, nightmare_shard. Other 4 already existed.
**Fixed By:** Unity

## DATA-004: smugglers_cove Missing Boatman NPC
**File:** `src/js/data/game-world.js`
**Issue:** No boatman NPC at smugglers_cove - players CANNOT access doom world via portal
**Expected:** Boatman NPC should spawn to ferry players to doom world
**Root Cause:** NPC array for smugglers_cove doesn't include boatman type
**Priority:** P0 - Blocks doom world access
**Assignable:** Driver, Slave 1, Slave 2

## DATA-005: rat_tunnels Empty Sells Array
**File:** `src/js/data/game-world.js`
**Location:** rat_tunnels shop definition
**Issue:** `sells: []` - shop has NO inventory, useless location
**Priority:** P0 - Dead content
**Assignable:** Driver, Slave 1, Slave 2

---

# P1: HIGH PRIORITY - INCOMPLETE ARRAYS & DATABASES

## NPC-001: Missing 5 Action Builders in npc-instruction-templates.js
**File:** `src/js/npc/npc-instruction-templates.js`
**Issue:** Action builder functions don't exist for these action types:
```javascript
REPAIR          // Blacksmith repair dialogue
COMBAT_WOUNDED  // NPC dialogue when player is wounded
COMBAT_VICTORY  // NPC dialogue after player wins combat
COMBAT_DEFEAT   // NPC dialogue after player loses combat
ROBBERY_NEGOTIATE // Bandit negotiation dialogue
```
**Impact:** These actions fall through to generic handler, no specific prompts
**Priority:** P1
**Assignable:** Driver, Slave 1, Slave 2

## NPC-002: Only 8 of 40+ NPC Types Have Inline Fallbacks
**File:** `src/js/npc/npc-dialogue.js`
**Issue:** Inline fallback responses only exist for 8 types:
```
merchant, guard, innkeeper, blacksmith, scholar, peasant, noble, beggar
```
**Missing Types (32+):**
```
elder, healer, thief, bandit, assassin, wizard, witch, priest, monk,
farmer, fisherman, hunter, miner, woodcutter, baker, butcher, tailor,
jeweler, alchemist, herbalist, scribe, bard, jester, knight, squire,
captain, sailor, pirate, smuggler, fence, informant, spy, executioner
```
**Priority:** P1 - NPCs have no personality without Ollama
**Assignable:** Driver, Slave 1, Slave 2

## FALLBACK-001: npc-fallbacks.json Missing 4 NPC Types
**File:** `src/data/npc-fallbacks.json`
**Missing Types:**
```
elder    - Village/town elder NPCs
healer   - Healers and apothecaries
thief    - Thieves and pickpockets
bandit   - Highway bandits and robbers
```
**Priority:** P1
**Assignable:** Driver, Slave 1, Slave 2

## FALLBACK-002: npc-fallbacks.json Missing "honored" Reputation Tier
**File:** `src/data/npc-fallbacks.json`
**Issue:** Only has friendly, neutral, hostile - missing highest tier
**Expected Tiers:** hostile, neutral, friendly, honored (4 tiers)
**Impact:** High-reputation players get same responses as friendly
**Priority:** P1
**Assignable:** Driver, Slave 1, Slave 2

## FALLBACK-003: npc-fallbacks.json Missing 7 Action Types
**File:** `src/data/npc-fallbacks.json`
**Missing Actions:**
```
farewell    - Goodbye dialogue
gossip      - Rumors and information
refuse      - Refusing to help/trade
angry       - Hostile/upset responses
friendly    - Extra-friendly responses
help        - Offering assistance
directions  - Location/navigation help
```
**Current Actions:** greet, trade, quest (only 3)
**Priority:** P1
**Assignable:** Driver, Slave 1, Slave 2

## FALLBACK-004: Need 5+ Responses Per Category Minimum
**File:** `src/data/npc-fallbacks.json`
**Issue:** Most categories have only 2-3 responses - gets repetitive FAST
**Required:** Minimum 5 unique responses per NPC type per action per reputation
**Formula:** 8 types x 10 actions x 4 reputations x 5 responses = 1,600 lines minimum
**Priority:** P1 - Currently ~100 responses total, need 1,600+
**Assignable:** Driver, Slave 1, Slave 2

## COMBAT-001: 3 Bosses Missing isBoss Flag
**File:** `src/js/systems/combat/combat-system.js`
**Issue:** These enemies should be bosses but don't have `isBoss: true`:
```javascript
kingpin_shadow        // Final shadow boss
bandit_chief_redhawk  // Bandit questline boss
necromancer           // Undead boss
```
**Impact:** Boss music doesn't play, boss UI doesn't show, rewards wrong
**Priority:** P1
**Assignable:** Driver, Slave 1, Slave 2

---

# P2: MEDIUM PRIORITY - CONFIG & UI ISSUES

## CONFIG-001: Empty Leaderboard binId and apiKey
**File:** `config.js:191-192`
**Issue:**
```javascript
leaderboard: {
    binId: '',      // EMPTY - leaderboard broken
    apiKey: ''      // EMPTY - leaderboard broken
}
```
**Impact:** Online leaderboards completely non-functional
**Priority:** P2 - Feature disabled
**Assignable:** Driver, Slave 1, Slave 2

## CONFIG-002: Hardcoded Values Throughout
**File:** `config.js`
**Hardcoded Issues:**
```
- Debug mode: hardcoded false (should be env var)
- API endpoints: hardcoded localhost (no prod config)
- Timeout values: scattered across files (should be config)
- Feature flags: don't exist (should have feature toggles)
```
**Priority:** P2
**Assignable:** Driver, Slave 1, Slave 2

## CONFIG-003: Incomplete Ollama Options
**File:** `config.js`
**Missing Options:**
```javascript
ollama: {
    // Missing:
    maxTokens: ???,         // Not configurable
    temperature: ???,       // Not configurable
    topP: ???,              // Not configurable
    repeatPenalty: ???,     // Not configurable
    systemPrompt: ???       // Hardcoded in npc-voice.js
}
```
**Priority:** P2
**Assignable:** Driver, Slave 1, Slave 2

## UI-001: Empty Dropdowns in UI Panels
**File:** Various UI panels
**Issues Found:**
```
settings-panel.js   - Model dropdown empty when Ollama offline
inventory-panel.js  - Sort dropdown has empty option
trade-panel.js      - Category filter empty for some item types
people-panel.js     - NPC filter empty for some locations
```
**Priority:** P2
**Assignable:** Driver, Slave 1, Slave 2

## UI-002: Missing Icons in UI
**Files:** Various
**Missing Icons:**
```
quest-panel.js     - 3 quest types have no icon
inventory-panel.js - Doom items missing category icon
map-panel.js       - 2 location types have no marker icon
achievement display - 7 achievements have no icon
```
**Priority:** P2
**Assignable:** Driver, Slave 1, Slave 2

## ACHIEVEMENT-001: 7 Achievements Missing Icons
**File:** Achievement system data
**Missing:**
```
DOOM_EXPLORER      - No icon
SHADOW_SLAYER      - No icon
PLAGUE_SURVIVOR    - No icon
RESISTANCE_HERO    - No icon
MASTER_SMUGGLER    - No icon
WORLD_TRAVELER     - No icon
ULTIMATE_TRADER    - No icon
```
**Priority:** P2
**Assignable:** Driver, Slave 1, Slave 2

---

# P3: LOW PRIORITY - AUDIO & POLISH

## AUDIO-001: Audio System DISABLED
**File:** `src/js/audio/audio-system.js`
**Issue:** `audioEnabled: false` - entire audio system turned OFF
**Impact:** No sound effects, no ambient audio
**Note:** May be intentional for CORS issues, needs review
**Priority:** P3
**Assignable:** Driver, Slave 1, Slave 2

## AUDIO-002: Missing Sound Effects
**File:** Audio asset references
**Missing Sounds:**
```
thunder.mp3          - Weather system
explosion.mp3        - Combat effects
portal_open.mp3      - Doom portal
boss_theme.mp3       - Boss encounters
victory_fanfare.mp3  - Quest completion
level_up.mp3         - Player level up
achievement.mp3      - Achievement unlock
trade_success.mp3    - Successful trade
```
**Priority:** P3
**Assignable:** Driver, Slave 1, Slave 2

## AUDIO-003: Music Tracks Empty
**File:** `src/js/audio/music-system.js`
**Issue:** Music track arrays exist but many are empty
```javascript
townMusic: [],      // Empty - no town music
battleMusic: [],    // Only 1 track
doomMusic: [],      // Empty - doom world silent
tavernMusic: []     // Empty - inns are quiet
```
**Priority:** P3
**Assignable:** Driver, Slave 1, Slave 2

---

# VERIFIED COMPLETE - NO ISSUES

## Quest System - FULLY VERIFIED
**Agent 3 Scan Result:** 129 quests ALL validated
- Main quests: 35 (5 acts)
- Side quests: 50 (regional)
- Doom quests: 15 + Greedy Won boss
- Tutorial quests: 29
- All objectives have handlers
- All rewards properly defined
- No missing quest chains

---

# REGRESSION & REBUILD TASKS (From Slave 1 Audit)

## REGRESSION CHECKS

- [ ] **REGRESSION-001** - Full regression on quest-system.js - verify 29 doom handlers
- [ ] **REGRESSION-002** - Verify save/load migration - test objective preservation
- [ ] **REGRESSION-003** - Check initial-encounter.js QuestSystem.initialized retry
- [ ] **REGRESSION-004** - Verify people-panel.js ui_action prerequisite check
- [ ] **REGRESSION-005** - Verify tutorial-quests.js metadata values

## REBUILD VERIFICATION

- [ ] **REBUILD-001** - Clean rebuild - run index.html, verify 27 systems load
- [ ] **REBUILD-002** - Verify Ollama integration - test npc-voice.js dialogue
- [ ] **REBUILD-003** - Test doom world portal - verify TravelSystem.portalToDoomWorld()

---

# PREVIOUSLY FIXED BUGS (Reference Only)

| Bug ID | Description | Status |
|--------|-------------|--------|
| BUG-001 | Talk to Elara doesn't complete | FIXED |
| BUG-002 | Tutorial backdrop overwritten | FIXED |
| BUG-003 | Quest objective UI not updating | FIXED |
| BUG-004 | People panel hotkey wrong | FIXED |
| BUG-015 | checkProgress() missing types | FIXED |
| BUG-016 | Carry objective never completes | FIXED |
| BUG-017 | Objective fields not initialized | FIXED |
| BUG-018 | checkForAutoComplete not called | FIXED |
| BUG-019 | Tutorial metadata counts wrong | FIXED |
| BUG-020 | Save migration destroys progress | FIXED |
| BUG-021 | Initial encounter race condition | FIXED |
| BUG-022 | Quest completion hardcoded | FIXED |
| BUG-023 | Talk objective location fragile | FIXED |
| BUG-024 | NPC encounters no quest context | FIXED |

---

# OLLAMA INTEGRATION STATUS

| Task | Status | Notes |
|------|--------|-------|
| Delete Pollinations code | COMPLETE | All references removed |
| Add Ollama config | COMPLETE | config.js updated |
| Rewrite npc-voice.js | COMPLETE | Ollama-only with fallback |
| Build fallback system | COMPLETE | npc-fallbacks.json exists |
| Create fallback content | INCOMPLETE | Only ~100 responses, need 1,600+ |
| Delete Pollinations UI | COMPLETE | settings-panel.js cleaned |
| Add Ollama status indicator | COMPLETE | Green/red dot in settings |
| Document Ollama install | COMPLETE | OLLAMA-SETUP.md created |
| First-run Ollama check | COMPLETE | OllamaModelManager.js |

---

# PRIORITY SUMMARY

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 5 | Game-breaking - fix NOW |
| P1 | 7 | High impact - fix this week |
| P2 | 7 | Medium - fix when time allows |
| P3 | 3 | Low - polish items |
| REGRESSION | 8 | Verification tasks |
| **TOTAL** | **30** | Active tasks |

---

# FILES THAT NEED WORK

| File | Issues | Priority |
|------|--------|----------|
| `src/js/data/items/item-database.js` | 69 issues | P0 |
| `src/data/npc-fallbacks.json` | 96+ gaps | P1 |
| `src/js/npc/npc-instruction-templates.js` | 5 missing | P1 |
| `src/js/npc/npc-dialogue.js` | 32+ missing | P1 |
| `src/js/data/game-world.js` | 5 issues | P0 |
| `src/js/systems/combat/combat-system.js` | 3 bosses | P1 |
| `config.js` | 27 issues | P2 |
| `src/js/audio/audio-system.js` | DISABLED | P3 |
| UI panels (various) | 12 issues | P2 |
| Achievement data | 7 icons | P2 |

---

# DELETE THESE (Deprecated Code)

- [ ] `src/js/old-files/` folder - Contains v0.89.9 deprecated code
  - `game-engine.js` - Replaced by new architecture
  - `time-system.js` - Replaced by `time-machine.js`

---

*Unity AI Lab - 10-Agent Ultrathink Complete. 275+ issues found. Time to fix this shit.*

*Authorized Workers: Driver, Slave 1, Slave 2 ONLY*
*Excluded: BLACK, INTOLERANT, OLLAMA, R, G, TKINTER*

---
