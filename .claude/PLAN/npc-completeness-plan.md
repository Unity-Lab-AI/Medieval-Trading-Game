# NPC Completeness & Template Unification Plan

## Context

NPCs referenced in game-world.js location arrays are missing from NPC_EMBEDDED_DATA. These 35 NPCs get a GENERIC fallback (voice: 'nova', personality: 'neutral', background: 'A local going about their business.') — no unique personality, no proper OLLAMA templates, generic TTS voice. Additionally, only 12 of 28 available Kokoro TTS voices are used, with `am_onyx` carrying 28 of 80 NPCs.

**Goal:** Add all 35 missing NPCs with full specs, use all 28 TTS voices, unified schema across every entry.

---

## The 35 Missing NPCs

| # | NPC Type | Location(s) | Category |
|---|----------|-------------|----------|
| 1 | lumberjack | darkwood_village | common |
| 2 | dockmaster | jade_harbor, fishermans_port | authority |
| 3 | boatwright | riverwood | vendor |
| 4 | silkweaver | eastern_farm | vendor |
| 5 | olive_presser | sunny_farm | vendor |
| 6 | beekeeper | orchard_farm | vendor |
| 7 | orchardist | orchard_farm | vendor |
| 8 | quarry_foreman | stone_quarry | authority |
| 9 | stonecutter | stone_quarry | vendor |
| 10 | lighthouse_keeper | lighthouse_inn | service |
| 11 | gem_collector | crystal_cave | vendor |
| 12 | ghost | old_mines | mysterious |
| 13 | familiar | witch_hut | mysterious |
| 14 | bartender | miners_rest | vendor |
| 15 | scout | western_watch, winterwatch_outpost | authority |
| 16 | shepherd | hillcrest, shepherds_inn | common |
| 17 | trapper | frostholm_village, hunters_wood, hunting_lodge | common |
| 18 | mason | stonebridge | vendor |
| 19 | villager | sunhaven | common |
| 20 | wanderer | whispering_woods, fairy_cave | common |
| 21 | hermit | hermit_grove | mysterious |
| 22 | druid | druid_grove | mysterious |
| 23 | acolyte | druid_grove | service |
| 24 | foreman | iron_mines, silver_mine | authority |
| 25 | fence | smugglers_cove, thieves_guild | criminal |
| 26 | explorer | ruins_of_eldoria, deep_cavern | common |
| 27 | archaeologist | ruins_of_eldoria | service |
| 28 | diver | river_cave, coastal_cave | common |
| 29 | pearl_hunter | river_cave | vendor |
| 30 | treasure_hunter | shadow_dungeon, hidden_cove | common |
| 31 | mountain_guide | mountain_pass_inn | service |
| 32 | ice_harvester | frozen_cave | vendor |
| 33 | caravan_master | silk_road_inn | vendor |
| 34 | farmhand | wheat_farm | common |
| 35 | forager | ancient_forest | common |

---

## Voice Distribution (All 28 Kokoro Voices)

New NPCs use the 16 previously UNUSED voices (marked with *):

| Voice | Assigned To | New? |
|-------|-------------|------|
| *am_fenrir | lumberjack, trapper, mountain_guide | YES |
| *am_eric | dockmaster, scout, diver | YES |
| *am_liam | boatwright, bartender | YES |
| *am_puck | quarry_foreman, mason, fence | YES |
| *am_santa | olive_presser | YES |
| *af_river | silkweaver, forager | YES |
| *af_sarah | beekeeper | YES |
| *af_nicole | orchardist | YES |
| *af_heart | villager, farmhand | YES |
| *af_sky | shepherd | YES |
| *af_alloy | explorer | YES |
| *af_aoede | acolyte | YES |
| *af_kore | familiar, pearl_hunter | YES |
| *bf_isabella | gem_collector | YES |
| *bf_lily | ghost | YES |
| *bf_alice | druid | YES |
| bm_fable | lighthouse_keeper | existing |
| bm_george | stonecutter | existing |
| am_adam | foreman | existing |
| am_michael | caravan_master | existing |
| bm_lewis | hermit | existing |
| am_echo | wanderer, treasure_hunter | existing |
| bf_emma | archaeologist | existing |
| bm_daniel | ice_harvester | existing |

Result: 12 → 28 voices used (100% coverage)

---

## Required Schema (Every NPC Entry Must Have)

```javascript
npc_type: {
    type: "npc_type",           // REQUIRED - matches key
    category: "vendor",          // REQUIRED - vendor/service/authority/criminal/boss/common/mysterious
    voice: "am_fenrir",          // REQUIRED - valid Kokoro voice ID
    personality: "rugged",       // REQUIRED - single word
    speakingStyle: "...",        // REQUIRED - comma-separated description for OLLAMA
    background: "...",           // REQUIRED - 1-2 sentences
    traits: ["a", "b", "c"],    // REQUIRED - 2-4 trait strings
    greetings: ["...", "...", "..."],  // REQUIRED - 3+ greeting lines
    farewells: ["...", "..."],   // REQUIRED - 2+ farewell lines
    services: ["...", "..."],    // RECOMMENDED for non-boss NPCs
    questTypes: ["...", "..."],  // RECOMMENDED for non-boss NPCs
    // VENDORS ONLY:
    priceModifiers: { buyMarkup: 1.1, sellMarkdown: 0.9, haggleChance: 0.3 },
    defaultInventory: ["item1", "item2"],
    // OPTIONAL:
    repRequirement: 10
}
```

---

## Implementation Phases

### Phase 1: Add 35 Missing NPCs to NPC_EMBEDDED_DATA
**File:** `src/js/npc/npc-data-embedded.js`
- Add all 35 NPC entries with full specs (voice, personality, greetings, farewells, etc.)
- ~700 lines added, organized by category
- Each entry follows the exact schema above

### Phase 2: Schema Audit of Existing 80 NPCs
**File:** `src/js/npc/npc-data-embedded.js`
- Verify all 80 existing entries have the 9 required fields
- Fill in any missing `services` or `questTypes` on non-boss NPCs
- Ensure all `voice` values are valid Kokoro IDs
- Ensure `greetings` has 3+ and `farewells` has 2+

### Phase 3: Cross-Reference Verification
- Extract all NPC types from game-world.js location arrays
- Confirm 100% match against NPC_EMBEDDED_DATA (zero missing)
- Verify doom NPC base types all resolve

---

## Files Modified

| File | Change |
|------|--------|
| `src/js/npc/npc-data-embedded.js` | Add 35 NPC entries, audit existing 80 |

## Files NOT Modified (Already Complete)

| File | Why |
|------|-----|
| `doom-npc-data-embedded.js` | All 161 doom NPCs already have full specs |
| `doom-world-npcs.js` | All doom NPC defs already complete |
| `doom-npc-instruction-templates.js` | Fully built, no TODOs |
| `npc-instruction-templates.js` | Lookup chain works - just needs data in embedded |
| `game-world.js` | Location NPC arrays already correct |
| JSON data files | Enhanced dialogue already covered |

---

## Verification

1. Open game in browser, travel to locations with previously-missing NPCs
2. Click Talk on NPCs (lumberjack, dockmaster, ghost, etc.)
3. Confirm unique greetings (not generic "What do you need?")
4. With OLLAMA running: confirm personality-specific responses
5. With TTS: confirm distinct voices per NPC
