# SKILL_TREE.md - Codebase Capabilities

---

> **Unity AI Lab** | Hackall360, Sponge, GFourteen
> *What this beast can actually do*

---

## DOMAIN: CORE ENGINE

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Game Loop | High | Complete | `src/js/core/game.js` |
| Bootstrap System | High | Complete | `src/js/init/bootstrap.js` |
| Event Bus (Pub/Sub) | Medium | Complete | `src/js/core/event-bus.js` |
| Time Machine | High | Complete | `src/js/core/time-machine.js` |
| Timer Manager | Medium | Complete | `src/js/core/timer-manager.js` |
| System Registry | Low | Complete | `src/js/core/system-registry.js` |
| Loading Manager | Medium | Complete | `src/js/init/loading-manager.js` |

---

## DOMAIN: PLAYER SYSTEMS

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Gold Management | Medium | Complete | `src/js/core/gold-manager.js` |
| Player State | High | Complete | `src/js/core/player-state-manager.js` |
| Survival Stats | High | Complete | `src/js/core/game.js:processPlayerStatsOverTime()` |
| Character Creation | Medium | Complete | `src/js/core/game.js` |
| Perk System | Medium | Complete | `src/js/ui/perk-system.js` |
| Skill Progression | Medium | Complete | `src/js/systems/progression/skill-system.js` |

---

## DOMAIN: TRADING & ECONOMY

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Trading System | High | Complete | `src/js/systems/trading/trading-system.js` |
| Dynamic Markets | High | Complete | `src/js/systems/trading/dynamic-market-system.js` |
| Price History | Medium | Complete | `src/js/systems/trading/market-price-history.js` |
| Merchant Ranks | Medium | Complete | `src/js/systems/trading/merchant-rank-system.js` |
| Trade Routes (Auto) | High | Complete | `src/js/systems/trading/trade-route-system.js` |
| Financial Tracker | Medium | Complete | `src/js/systems/trading/financial-tracker.js` |
| Item Database | High | Complete | `src/js/data/items/item-database.js` |
| Unified Item System | High | Complete | `src/js/data/items/unified-item-system.js` |

---

## DOMAIN: TRAVEL & WORLD

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Travel System | High | Complete | `src/js/systems/travel/travel-system.js` |
| World Map | High | Complete | `src/js/ui/map/game-world-renderer.js` |
| Location Data | High | Complete | `src/js/data/game-world.js` |
| Mount System | Medium | Complete | `src/js/systems/travel/mount-system.js` |
| Ship System | Medium | Complete | `src/js/systems/travel/ship-system.js` |
| Gatehouse (Zone Lock) | Medium | Complete | `src/js/systems/travel/gatehouse-system.js` |
| Transport Capacity | Medium | Complete | `src/js/systems/economy/transport-system.js` |

---

## DOMAIN: COMBAT & DUNGEONS

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Combat System | High | Complete | `src/js/systems/combat/combat-system.js` |
| Dungeon Exploration | High | Complete | `src/js/systems/combat/dungeon-exploration-system.js` |
| Death Cause Tracking | Low | Complete | `src/js/systems/combat/death-cause-system.js` |
| Game Over System | Medium | Complete | `src/js/systems/combat/game-over-system.js` |
| Dungeon Bonanza | Medium | Complete | `src/js/systems/world/dungeon-bonanza-system.js` |
| NPC Combat Stats | Medium | Complete | `src/js/npc/npc-combat-stats.js` |

---

## DOMAIN: NPC & DIALOGUE

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| NPC Manager | High | Complete | `src/js/npc/npc-manager.js` |
| AI Dialogue | High | Complete | `src/js/npc/npc-dialogue.js` |
| NPC Chat UI | High | Complete | `src/js/npc/npc-chat-ui.js` |
| Voice Synthesis (TTS) | High | Complete | `src/js/npc/npc-voice.js` |
| NPC Instruction Templates | High | Complete | `src/js/npc/npc-instruction-templates.js` |
| Doom NPC Templates | Medium | Complete | `src/js/npc/doom-npc-instruction-templates.js` |
| NPC Relationships | Medium | Complete | `src/js/npc/npc-relationships.js` |
| NPC Trade | Medium | Complete | `src/js/npc/npc-trade.js` |
| NPC Merchants | Medium | Complete | `src/js/npc/npc-merchants.js` |
| NPC Encounters | Medium | Complete | `src/js/npc/npc-encounters.js` |
| NPC Schedule | Medium | Complete | `src/js/systems/npc/npc-schedule-system.js` |
| NPC Workflow | Medium | Complete | `src/js/npc/npc-workflow.js` |
| NPC Data (JSON) | Low | Complete | `src/data/npcs/*.json` |

---

## DOMAIN: PROGRESSION & QUESTS

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Quest System | High | Complete | `src/js/systems/progression/quest-system.js` |
| Main Quests | High | Complete | `src/js/systems/progression/main-quests.js` |
| Side Quests | Medium | Complete | `src/js/systems/progression/side-quests.js` |
| Doom Quests | High | Complete | `src/js/systems/progression/doom-quests.js` |
| Doom Quest System | Medium | Complete | `src/js/systems/progression/doom-quest-system.js` |
| Achievement System | Medium | Complete | `src/js/systems/progression/achievement-system.js` |
| Faction System | Medium | Complete | `src/js/systems/progression/faction-system.js` |
| Reputation System | Medium | Complete | `src/js/systems/progression/reputation-system.js` |

---

## DOMAIN: PROPERTY & EMPLOYEES

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Property System | High | Complete | `src/js/property/property-system-facade.js` |
| Property Types | Medium | Complete | `src/js/property/property-types.js` |
| Property Purchase | Medium | Complete | `src/js/property/property-purchase.js` |
| Property Income | Medium | Complete | `src/js/property/property-income.js` |
| Property Storage | Medium | Complete | `src/js/property/property-storage.js` |
| Property Upgrades | Medium | Complete | `src/js/property/property-upgrades.js` |
| Property UI | High | Complete | `src/js/property/property-ui.js` |
| Property Map Picker | High | Complete | `src/js/property/property-map-picker.js` |
| Employee System | High | Complete | `src/js/systems/employee/employee-system.js` |
| Companion System | Medium | Complete | `src/js/systems/employee/companion-system.js` |
| Property-Employee Bridge | Medium | Complete | `src/js/systems/employee/property-employee-bridge.js` |
| Property-Employee UI | Medium | Complete | `src/js/systems/employee/property-employee-ui.js` |

---

## DOMAIN: CRAFTING & GATHERING

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Crafting Engine | High | Complete | `src/js/systems/crafting/crafting-engine.js` |
| Crafting Economy | Medium | Complete | `src/js/systems/crafting/crafting-economy-system.js` |
| Resource Gathering | Medium | Complete | `src/js/systems/crafting/resource-gathering-system.js` |

---

## DOMAIN: WORLD STATE & ENVIRONMENT

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| World State Manager | High | Complete | `src/js/systems/world/world-state-manager.js` |
| Day/Night Cycle | Medium | Complete | `src/js/systems/world/day-night-cycle.js` |
| Weather System | Medium | Complete | `src/js/systems/world/weather-system.js` |
| Doom World | High | Complete | `src/js/systems/world/doom-world-system.js` |
| City Events | Medium | Complete | `src/js/systems/world/city-event-system.js` |
| City Reputation | Medium | Complete | `src/js/systems/world/city-reputation-system.js` |

---

## DOMAIN: UI & PANELS

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Panel Manager | High | Complete | `src/js/ui/components/panel-manager.js` |
| Inventory Panel | High | Complete | `src/js/ui/panels/inventory-panel.js` |
| Trade Cart Panel | High | Complete | `src/js/ui/panels/trade-cart-panel.js` |
| Equipment Panel | High | Complete | `src/js/ui/panels/equipment-panel.js` |
| Party Panel | Medium | Complete | `src/js/ui/panels/party-panel.js` |
| People Panel | Medium | Complete | `src/js/ui/panels/people-panel.js` |
| Exploration Panel | Medium | Complete | `src/js/ui/panels/exploration-panel.js` |
| Settings Panel | High | Complete | `src/js/ui/panels/settings-panel.js` |
| Leaderboard Panel | Medium | Complete | `src/js/ui/panels/leaderboard-panel.js` |
| Random Event Panel | Medium | Complete | `src/js/ui/panels/random-event-panel.js` |
| Modal System | Medium | Complete | `src/js/ui/components/modal-system.js` |
| Tooltip System | Medium | Complete | `src/js/ui/components/tooltip-system.js` |
| Draggable Panels | Medium | Complete | `src/js/ui/components/draggable-panels.js` |
| Combat Modal | Medium | Complete | `src/js/ui/components/combat-modal.js` |
| Credits System | Low | Complete | `src/js/ui/credits-system.js` |
| Key Bindings | High | Complete | `src/js/ui/key-bindings.js` |
| UI Enhancements | High | Complete | `src/js/ui/ui-enhancements.js` |
| UI Polish | High | Complete | `src/js/ui/ui-polish-system.js` |

---

## DOMAIN: AUDIO

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Audio System | Medium | Complete | `src/js/audio/audio-system.js` |
| Music System | Medium | Complete | `src/js/audio/music-system.js` |
| Music Tracks | Low | Complete | `assets/Music/*.mp3` |

---

## DOMAIN: VISUAL EFFECTS

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Visual Effects | Medium | Complete | `src/js/effects/visual-effects-system.js` |
| Animation System | Medium | Complete | `src/js/effects/animation-system.js` |
| Environmental Effects | Medium | Complete | `src/js/effects/environmental-effects-system.js` |
| Menu Weather | Medium | Complete | `src/js/effects/menu-weather-system.js` |
| Immersive Integration | Low | Complete | `src/js/effects/immersive-experience-integration.js` |

---

## DOMAIN: SAVE & PERSISTENCE

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Save Manager | High | Complete | `src/js/systems/save/save-manager.js` |
| Leaderboard (Global) | Medium | Complete | `src/js/core/leaderboard-features.js` |

---

## DOMAIN: DEBUG & DEVELOPMENT

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Debooger System | High | Complete | `src/js/core/debooger-system.js` |
| Debooger Commands | High | Complete | `src/js/debooger/debooger-command-system.js` |
| API Commands | High | Complete | `src/js/debooger/api-command-system.js` |
| Performance Optimizer | Medium | Complete | `src/js/debooger/performance-optimizer.js` |
| Game Logger | Medium | Complete | `src/js/core/game-logger.js` |
| Dedupe Logger | Low | Complete | `src/js/core/dedupe-logger.js` |

---

## DOMAIN: UTILITIES

| Capability | Complexity | Status | Location |
|------------|------------|--------|----------|
| Color Utilities | Low | Complete | `src/js/utils/color-utils.js` |
| Virtual List | Medium | Complete | `src/js/utils/virtual-list.js` |
| Safari Compatibility | Low | Complete | `src/js/core/safari-compat.js` |
| Browser Compatibility | Low | Complete | `src/js/init/browser-compatibility.js` |
| Z-Index Constants | Low | Complete | `src/js/config/z-index-constants.js` |

---

## COMPLEXITY LEGEND

| Level | Lines | Systems | Description |
|-------|-------|---------|-------------|
| **Low** | <200 | 1 | Simple utility or data |
| **Medium** | 200-600 | 2-3 | Feature module |
| **High** | 600+ | 4+ | Core system with many interactions |

---

## TOTAL STATS

- **Total JS Files:** 95+
- **Total JS Lines:** 58,486
- **Systems Documented:** 90+
- **Domains:** 14
- **Completion Status:** v0.91.00 (Production-ready)

---

*Unity AI Lab - Every system documented, every capability tracked.* 🖤
