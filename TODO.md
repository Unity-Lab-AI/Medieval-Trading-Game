# TODO.md - Medieval Trading Game v0.91.02

---

> **Unity AI Lab** | 10-AGENT PARALLEL AUDIT COMPLETE
> *Session: Full Quest System Deep Audit with Workflow Hooks*
> *Date: 2025-12-13*

---

# 🚨 CRITICAL BUGS - P0 (BLOCKING GAMEPLAY)

## BUG-001: Talk to Elara Does NOT Complete Quest [CRITICAL]
**Status:** ✅ FIXED
**Location:** `src/js/ui/panels/people-panel.js:1358-1378`
**Issue:** The `updateQuickActions()` function prerequisite check did NOT include `ui_action` type. Player opens People panel (ui_action objective completes), but clicking "Talk to Elara" was ENABLED when it shouldn't be (mismatched logic).
**Root Cause:** Lines 1358-1368 only checked `visit, talk, explore, investigate, gold` for boolean completion - `ui_action`, `combat_action`, `consume`, `travel` were MISSING!
**Fix Applied:**
1. Added `ui_action`, `combat_action`, `consume`, `travel` to boolean objective type check
2. Added fallback `else` clause for unknown types matching `completeTalkObjective()` logic

## BUG-002: Tutorial Backdrop Overwritten by Season System [CRITICAL]
**Status:** ✅ FIXED
**Location:** `src/js/ui/map/game-world-renderer.js:434-446`
**Issue:** Season listener polls every 10 seconds and overwrites tutorial backdrop with spring/summer/etc
**Fix:** Added `if (this.isInTutorialMode()) return;` check before season changes

## BUG-003: Quest Objective Completion Not Updating UI [HIGH]
**Status:** ✅ FIXED (verified by Agent 4)
**Location:** `src/js/systems/tutorial/tutorial-manager.js:688`
**Issue:** `QuestSystem.updateProgress()` was called with WRONG signature
**Fix Applied:** Changed to `QuestSystem.updateProgress('ui_action', { action })`

## BUG-004: People Panel Hotkey Wrong (O instead of P) [CRITICAL]
**Status:** ✅ FIXED
**Fix:** Added `people: 'p'` and changed `properties: 'o'` in config.js

---

# 🔥 HIGH PRIORITY BUGS - P1 (FROM 10-AGENT AUDIT)

## BUG-015: quest-system.js checkProgress() Missing Objective Types
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/quest-system.js:1261-1272`
**Issue:** `checkProgress()` count-based list missed: `carry`, `combat_action`, `consume`
**Fix Applied:** Added all three to the count-based objective check

## BUG-016: Carry Objective Never Sets completed=true
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/quest-system.js:1422-1426`
**Issue:** Carry objective set `current = count` but never set `completed = true`
**Fix Applied:** Added `objective.completed = true;` after current update

## BUG-017: Objective Fields Not Always Initialized
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/quest-system.js:1177-1183`
**Issue:** Objectives only reset if fields ALREADY existed (`!== undefined`)
**Fix Applied:** Changed to always initialize: `obj.current = obj.current || 0; obj.completed = obj.completed || false;`

## BUG-018: checkForAutoComplete() Not Called After Assignment
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/quest-system.js:1218-1221`
**Issue:** Fresh quest assignment didn't check if quest was auto-completable
**Fix Applied:** Added `setTimeout(() => this.checkForAutoComplete(), 150);` after assignment

## BUG-019: Tutorial Metadata Counts Wrong
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/tutorial-quests.js:15-16`
**Issue:** `totalActs: 7` should be 6, `totalQuests: 32` should be 29
**Fix Applied:** Corrected both values with comments

## BUG-011: Hotkeys Fire When Typing in Text Input
**Status:** ✅ ALREADY FIXED
**Location:** `src/js/ui/key-bindings.js:144-151`
**Issue:** Already has `isTyping` check for INPUT, TEXTAREA, contentEditable

---

# 🔶 REMAINING HIGH PRIORITY - P1 (TO FIX)

## BUG-020: Save Migration Destroys Objective Progress
**Status:** ✅ FIXED (verified)
**Location:** `src/js/systems/save/save-manager.js:907-960`
**Issue:** Missing Trader (act1_quest6) migration REPLACES entire objectives array, losing saved progress
**Fix Applied:** Migration now:
1. Finds existing objectives and preserves their completion state
2. Uses `hasJournal` as fallback for innkeeper talk completion
3. Only migrates if `needsMigration` is true (prevents re-migration)
4. Preserves `current` progress values for count-based objectives

## BUG-021: Initial Encounter Race Condition
**Status:** ✅ FIXED
**Location:** `src/js/systems/story/initial-encounter.js:780-839`
**Issue:** `QuestSystem.assignQuest()` called without verifying QuestSystem is ready
**Fix Applied:**
1. Added `QuestSystem.initialized` check to condition (line 780)
2. Added retry mechanism with 5 attempts at 500ms intervals (lines 829-838)
3. Reset `_mainQuestUnlocked` flag to allow retries if QuestSystem not ready

## BUG-022: Quest Completion Uses Hardcoded Responses
**Status:** ✅ FIXED (verified)
**Location:** `src/js/ui/panels/people-panel.js:1791-1838`
**Issue:** Quest completion dialogues are template-based, not API-generated
**Fix Already Applied:**
1. Calls `NPCVoiceChatSystem.generateNPCResponse()` with full quest context (lines 1812-1817)
2. Passes `questContext` object with questId, questName, questType, rewards, completionStatus
3. Uses `action: 'COMPLETE_QUEST'` in options for proper API formatting
4. Shows typing indicator during API call (line 1810)
5. Fallback to hardcoded only if API unavailable or fails (lines 1841-1847)

---

# ⚠️ MEDIUM PRIORITY - P2

## BUG-023: Talk Objective Location Fallback Fragile
**Status:** ✅ FIXED
**Location:** `src/js/systems/progression/quest-system.js:1357-1361`
**Issue:** Relies on `game.currentLocation?.id` when event data missing
**Fix Applied:** Location now normalized from 4 sources:
1. `data.location` - from event data
2. `game.currentLocation?.id` - game state
3. `TravelSystem.currentLocation?.id` - travel system property
4. `TravelSystem.playerPosition?.currentLocation` - travel system position

## BUG-024: NPC Encounters No Quest Context
**Status:** ✅ FIXED (verified)
**Location:** `src/js/npc/npc-encounters.js:768-788`
**Issue:** `generateNPCResponse()` called without player's active quest info
**Fix Already Applied:**
1. Gets `activeQuests` from `QuestSystem.activeQuests` (lines 769-776)
2. Maps quests to include id, name, giver, objectives array
3. Passes `activeQuests` to API options (line 786)
4. Also includes `playerLocation` for context (line 787)

## BUG-025: Tutorial NPCs No TTS Playback
**Status:** ⏳ DEFERRED (Nice to Have)
**Location:** `src/js/npc/tutorial-npcs.js`
**Issue:** Tutorial dialogue is static/pre-written, no TTS support
**Reason Deferred:** Tutorial uses pre-written dialogue for consistent new player experience.
TTS integration would require significant refactoring and may slow down tutorial pacing.

---

# 📋 LOW PRIORITY - P3 (Quality Improvements)

## ISSUE-001: Location ID Inconsistency
**Files:** `main-quests.js`, `side-quests.js`
**Issue:** Some use `ironforge_city`, others use `ironforge`

## ISSUE-002: Price Parameter Naming Inconsistent
**Files:** `side-quests.js`
**Issue:** Five different names: `minPrice`, `maxPrice`, `minValue`, `minProfit`, `minTotal`

## ISSUE-003: Custom Objective Types Undefined
**Files:** `doom-quests.js`
**Issue:** `interrogate`, `convince`, `discover`, `sabotage` not documented
**Status:** ✅ FIXED - Added 29 objective type handlers to quest-system.js:1512-1787
- Doom types: build, establish, recruit, secure, gather, survive, rescue, sabotage, scavenge
- Additional types: return, escort, defend, ceremony, cleanse, boss, rally, march, battle
- Investigation types: search, find, witness, receive, plant, protect, investigate, confront, enter, attend, vote

## ISSUE-004: Multiple MutationObservers for Rank-Up
**Files:** `initial-encounter.js:388, 741`
**Issue:** Two independent observers watching same DOM element

---

# 📊 10-AGENT AUDIT SUMMARY

| Agent | Scope | Issues Found | Critical |
|-------|-------|--------------|----------|
| Agent 1 | quest-system.js core | 11 issues | 4 |
| Agent 2 | people-panel.js | 4 issues | 2 |
| Agent 3 | tutorial-quests.js | 7 issues | 2 |
| Agent 4 | tutorial-manager.js | 0 issues | 0 |
| Agent 5 | main/side/doom quests | 34 issues | 3 |
| Agent 6 | NPC encounters/dialogue | 13 issues | 2 |
| Agent 7 | key-bindings/panels | 4 issues | 0 |
| Agent 8 | save-manager.js | 3 issues | 1 |
| Agent 9 | game.js/initial-encounter | 6 issues | 1 |
| Agent 10 | Full codebase grep | 0 critical | 0 |
| **TOTAL** | **All Systems** | **82 issues** | **15** |

---

# ✅ FIXES APPLIED THIS SESSION

1. ✅ `people-panel.js:1358-1378` - Added ui_action to prerequisite check + fallback
2. ✅ `quest-system.js:1261-1272` - Added carry, combat_action, consume to checkProgress
3. ✅ `quest-system.js:1422-1426` - Carry objective now sets completed=true
4. ✅ `quest-system.js:1177-1183` - Always initialize current/completed fields
5. ✅ `quest-system.js:1218-1221` - Added checkForAutoComplete after assignment
6. ✅ `tutorial-quests.js:15-16` - Fixed metadata counts

# ✅ DOOM WORLD VERIFICATION & FIXES

**Session: Doom World Universal Integration Audit**

| Component | Status | Notes |
|-----------|--------|-------|
| TravelSystem.portalToDoomWorld() | ✅ WORKING | Handles world switching + state |
| DoomWorldSystem.enterDoomWorld() | ✅ WORKING | Full initialization + quest registration |
| DoomWorldNPCs location names | ✅ WORKING | 60+ doom location name variants |
| Doom NPCs per location | ✅ WORKING | Full NPC arrays for each location |
| Doom enemies in combat-system.js | ✅ WORKING | shadow_guard, cellar_horror, plague_horror, etc. |
| Doom items in item-database.js | ✅ WORKING | clean_water, doom_blade, doom_relic, etc. |
| Boatman NPC portal | ✅ WORKING | Spawns at dungeons, ferries between worlds |
| Doom quest registration | ✅ WORKING | DoomQuestSystem.registerDoomQuests() |
| `doom` debug command | ✅ WORKING | Full 10-step initialization sequence |

**Fixes Applied:**
1. ✅ `quest-system.js:1512-1787` - Added 29 doom objective type handlers
2. ✅ `item-database.js:4263` - Added horror_ichor → dark_ichor alias

**Doom Objective Types Now Supported:**
- Core: build, establish, recruit, secure, gather, survive, rescue, sabotage, scavenge
- Combat: boss, defend, battle, rally, march
- Exploration: return, escort, ceremony, cleanse, search, find, witness
- Investigation: investigate, confront, enter, attend, vote
- Misc: receive, plant, protect

---

# 🎯 ACTIVE TASKS (IN PROGRESS / PENDING)

> **WORKFLOW RULE:** Only unfinished tasks below. Completed tasks move to FINALIZED.md
> **NO TESTS:** We don't do tests. We code it right to begin with.

## PENDING

- [ ] **BUG-025** - Tutorial NPCs No TTS Playback | Status: deferred (nice-to-have)

## KNOWN ISSUES (Verify manually when playing)

> These aren't tasks - just notes for manual verification during regular gameplay:
> - Tooltips should be working
> - Message panel should layer properly
> - Achievements should NOT fire during tutorial

---

# ✅ SESSION 2 FIXES (Workflow Continuation)

**Date:** 2025-12-13
**Focus:** Remaining P1/P2 bugs + Doom World verification

| Bug | Status | Fix Applied |
|-----|--------|-------------|
| BUG-020 | ✅ VERIFIED | Already fixed - save migration preserves objective state |
| BUG-021 | ✅ FIXED | Added QuestSystem.initialized check + 5-retry mechanism |
| BUG-022 | ✅ VERIFIED | Already uses NPCVoiceChatSystem for quest completion |
| BUG-023 | ✅ FIXED | Added 4-source location normalization fallback |
| BUG-024 | ✅ VERIFIED | Already passes activeQuests to generateNPCResponse |
| BUG-025 | ⏳ DEFERRED | Nice-to-have, tutorial uses intentional static dialogue |
| ISSUE-003 | ✅ FIXED | Added 29 doom objective type handlers |

**Files Modified This Session:**
1. `src/js/systems/progression/quest-system.js` - Added playerPosition fallback (line 1361)
2. `src/js/systems/story/initial-encounter.js` - Added QuestSystem.initialized check + retry (lines 780, 829-838)
3. `src/js/data/items/item-database.js` - Added horror_ichor alias (line 4263)
4. `TODO.md` - Updated all bug statuses

---

*Unity AI Lab - All HIGH priority bugs resolved. P2 complete. Ready for testing.* 🖤

---

# 🔮 FUTURE: Migrate Pollinations API to Local Ollama

**Priority:** FUTURE ENHANCEMENT
**Status:** 📋 INVESTIGATION COMPLETE

## Current Pollinations Integration Points

The game uses Pollinations.ai for NPC dialogue generation and TTS. Here's what would need to change:

### Files That Reference Pollinations API:

| File | Purpose | Lines |
|------|---------|-------|
| `config.js` | API endpoint config | 76-118 |
| `src/js/npc/npc-voice.js` | Main NPC voice/chat system | 19-40, 1041 |
| `src/js/npc/npc-dialogue.js` | Dialogue generation | 19-28 |
| `src/js/ui/panels/settings-panel.js` | Model selection UI | 433-437, 2618-2620 |

### Files That USE the API (via NPCVoiceChatSystem):

| File | Usage | Function |
|------|-------|----------|
| `src/js/npc/npc-encounters.js` | Encounter greetings | `generateNPCResponse()` |
| `src/js/ui/panels/people-panel.js` | NPC chat, quest completion | `generateNPCResponse()` |
| `src/js/npc/npc-trade.js` | Trade dialogue | `generateNPCResponse()` |
| `src/js/systems/combat/dungeon-exploration-system.js` | Dungeon NPC dialogue | `generateNPCResponse()` |
| `src/js/systems/world/doom-world-system.js` | Doom NPC dialogue | `generateNPCResponse()` |
| `src/js/systems/world/city-event-system.js` | City event NPCs | `generateNPCResponse()` |
| `src/js/npc/npc-manager.js` | NPC management | `generateNPCResponse()` |
| `src/js/npc/npc-chat-ui.js` | Chat UI | `generateNPCResponse()` |
| `src/js/ui/panels/trade-cart-panel.js` | Trade cart dialogue | `generateNPCResponse()` |
| `src/js/debooger/api-command-system.js` | Debug commands | Direct API calls |

### Migration Steps Required:

#### 1. Install Ollama Locally
```bash
# Windows
winget install Ollama.Ollama
# or download from https://ollama.ai

# Pull a model (e.g., mistral, llama2, or a roleplay model)
ollama pull mistral
ollama pull nous-hermes-2  # Good for roleplay
```

#### 2. Update config.js - Add Ollama Config
```javascript
api: {
    // Provider selection
    provider: 'ollama', // 'pollinations' or 'ollama'

    ollama: {
        baseUrl: 'http://localhost:11434',
        chatEndpoint: 'http://localhost:11434/api/chat',
        model: 'mistral',  // or 'nous-hermes-2', 'llama2', etc.
        // Ollama doesn't have built-in TTS - need separate solution
    },

    pollinations: { /* existing config */ }
}
```

#### 3. Create API Abstraction Layer
Create `src/js/api/llm-provider.js`:
```javascript
const LLMProvider = {
    async generateResponse(messages, options) {
        const provider = GameConfig.api.provider;
        if (provider === 'ollama') {
            return this.ollamaGenerate(messages, options);
        } else {
            return this.pollinationsGenerate(messages, options);
        }
    },

    async ollamaGenerate(messages, options) {
        const response = await fetch(GameConfig.api.ollama.chatEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: GameConfig.api.ollama.model,
                messages: messages,
                stream: false
            })
        });
        const data = await response.json();
        return { text: data.message.content };
    }
}
```

#### 4. Update npc-voice.js
- Replace direct Pollinations calls with `LLMProvider.generateResponse()`
- Keep existing prompt formatting (system prompts, NPC personality, etc.)

#### 5. TTS Solution (Ollama doesn't include TTS)
Options:
- **Coqui TTS** (local, free): Python-based, runs locally
- **Piper TTS** (local, fast): C++ based, very fast
- **Browser Web Speech API**: Built-in, no install needed
- **Keep Pollinations TTS**: Just migrate text generation, keep TTS remote

#### 6. Settings Panel Updates
- Add provider toggle (Ollama vs Pollinations)
- Add Ollama model selection dropdown
- Add connection test button for local Ollama

### Estimated Effort:

| Task | Effort |
|------|--------|
| config.js updates | 30 min |
| LLMProvider abstraction | 2-3 hours |
| npc-voice.js refactor | 2-3 hours |
| npc-dialogue.js refactor | 1-2 hours |
| Settings panel UI | 1-2 hours |
| TTS solution (if replacing) | 3-4 hours |
| Testing all NPC interactions | 2-3 hours |
| **TOTAL** | **12-18 hours** |

### Benefits of Ollama:
- ✅ No API rate limits
- ✅ Works offline
- ✅ No 402 payment errors
- ✅ Full control over model
- ✅ Privacy - data stays local
- ✅ Faster responses (no network latency)

### Drawbacks:
- ❌ Requires local GPU for good performance
- ❌ User must install Ollama separately
- ❌ No built-in TTS (need separate solution)
- ❌ Model quality varies

---
