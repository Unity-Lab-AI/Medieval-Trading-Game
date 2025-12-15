# SKILL-TREE.md - THE SYSTEM GRIMOIRE

---

```
═══════════════════════════════════════════════════════════════════════
    "Know the systems before you fuck with them."
                        - The First Rule of Not Breaking Everything
═══════════════════════════════════════════════════════════════════════
```

> **Version:** 0.91.10 | **Last Updated:** Check git blame

---

## THE HOLY TRINITY

These three objects are the heart of everything. Touch with extreme care.

```
┌─────────────────────────────────────────────────────────────────┐
│  game              │  GameWorld         │  TimeMachine          │
│  (Player State)    │  (World State)     │  (Time State)         │
├────────────────────┼────────────────────┼───────────────────────┤
│  player.gold       │  locations         │  currentTime          │
│  player.inventory  │  paths             │  currentSpeed         │
│  player.stats      │  weather           │  isPaused             │
│  player.equipment  │  season            │  stat decay           │
│  currentLocation   │  visibility        │  time skip            │
└────────────────────┴────────────────────┴───────────────────────┘
```

---

## SYSTEM DEPENDENCY MAP

### TIER 0 - Core (Don't Touch Unless You Must)

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `game` | `core/game.js` | NONE | The 8000-line beast. Everything depends on this. |
| `GameWorld` | `data/game-world.js` | NONE | 42 locations, all paths, world state |
| `TimeMachine` | `core/time-machine.js` | NONE | Calendar, seasons, stat decay |
| `EventBus` | `core/event-bus.js` | NONE | Inter-system communication |
| `SystemRegistry` | `core/system-registry.js` | NONE | Safe system access (Sys.get) |

### TIER 1 - Foundation Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `ItemDatabase` | `data/items/item-database.js` | NONE | 150+ item definitions |
| `TimeSystem` | `core/time-system.js` | TimeMachine | Gregorian calendar wrapper |
| `EventManager` | `core/event-manager.js` | NONE | DOM event tracking |
| `TimerManager` | `core/timer-manager.js` | NONE | setTimeout/setInterval wrapper |

### TIER 2 - Player Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `PlayerStateManager` | `core/player-state-manager.js` | game | **NEW #79-80** Single source of truth for player state |
| `GoldManager` | `core/gold-manager.js` | game | **Extracted #77** Centralized gold tracking |
| `InventorySystem` | (in game.js) | game, ItemDatabase | Player inventory management |
| `EquipmentSystem` | `ui/panels/equipment-panel.js` | game, ItemDatabase | Gear slots |
| `SkillSystem` | `systems/progression/skill-system.js` | game | XP, levels, skills |
| `AchievementSystem` | `systems/progression/achievement-system.js` | game, multiple | Achievement tracking |

### TIER 3 - World Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `WorldStateManager` | `systems/world/world-state-manager.js` | GameWorld, TravelSystem, DoomWorldSystem | **NEW #83** Single source of truth for location/world state |
| `TravelSystem` | `systems/travel/travel-system.js` | GameWorld, TimeMachine | Movement, pathfinding |
| `WeatherSystem` | `systems/world/weather-system.js` | TimeMachine, GameWorld | Dynamic weather |
| `DayNightCycle` | `systems/world/day-night-cycle.js` | TimeMachine | Visual lighting |
| `CityEventSystem` | `systems/world/city-event-system.js` | GameWorld, TimeMachine | Random city events |

### TIER 4 - Economy Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `TradingSystem` | `systems/trading/trading-system.js` | game, ItemDatabase | Buy/sell core |
| `DynamicMarketSystem` | `systems/trading/dynamic-market-system.js` | TradingSystem | Price fluctuations |
| `MerchantRankSystem` | `systems/trading/merchant-rank-system.js` | game, TradingSystem | Merchant reputation |
| `TradeRouteSystem` | `systems/trading/trade-route-system.js` | TravelSystem, TradingSystem | Automated trade routes |
| `MarketPriceHistory` | `systems/trading/market-price-history.js` | DynamicMarketSystem | Price tracking |

### TIER 5 - Property & Employee Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `PropertySystem` | `property/property-system-facade.js` | game, GameWorld | Property ownership |
| `PropertyTypes` | `property/property-types.js` | PropertySystem | Building definitions |
| `EmployeeSystem` | `systems/employee/employee-system.js` | PropertySystem | Worker management |
| `CompanionSystem` | `systems/employee/companion-system.js` | game, TravelSystem | Travel companions |
| `PropertyEmployeeBridge` | `systems/employee/property-employee-bridge.js` | Both | Couples therapy for systems |

### TIER 6 - NPC Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `NPCMerchantSystem` | `npc/npc-merchants.js` | game, ItemDatabase | Merchant NPCs |
| `NPCDialogueSystem` | `npc/npc-dialogue.js` | game, QuestSystem | AI dialogue |
| `NPCVoiceChatSystem` | `npc/npc-voice.js` | NPCDialogueSystem | TTS integration |
| `NPCRelationships` | `npc/npc-relationships.js` | game | NPC reputation |
| `NPCScheduleSystem` | `systems/npc/npc-schedule-system.js` | TimeMachine | NPC locations by time |
| `NPCCombatStats` | `npc/npc-combat-stats.js` | game | Combat stat generation |

### TIER 7 - Combat & Dungeon Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `CombatSystem` | `systems/combat/combat-system.js` | game, NPCCombatStats | Turn-based combat |
| `CombatModal` | `ui/components/combat-modal.js` | CombatSystem | Combat UI |
| `DungeonExplorationSystem` | (large file) | game, ItemDatabase | Dungeon events |
| `DungeonBonanzaSystem` | `systems/world/dungeon-bonanza-system.js` | TimeMachine | July 18th event |
| `GameOverSystem` | `systems/combat/game-over-system.js` | game | Death handling |
| `DeathCauseSystem` | `systems/combat/death-cause-system.js` | GameOverSystem | Death tracking |

### TIER 8 - Quest Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `QuestSystem` | `systems/progression/quest-system.js` | game, multiple | 100 quests |
| `DoomQuests` | `systems/progression/doom-quests.js` | QuestSystem | Doom World quests |
| `SideQuests` | `systems/progression/side-quests.js` | QuestSystem | Side content |
| `InitialEncounter` | `systems/story/initial-encounter.js` | QuestSystem | Tutorial/intro |

### TIER 9 - Doom World Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `DoomWorldSystem` | `systems/world/doom-world-system.js` | TravelSystem | Alternate dimension |
| `DoomWorldConfig` | `data/doom-world-config.js` | DoomWorldSystem | Economy inversion |
| `DoomWorldNPCs` | `data/doom-world-npcs.js` | NPCMerchantSystem | Corrupted NPCs |

### TIER 10 - UI Systems

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `UIStateManager` | `ui/components/ui-state-manager.js` | NONE | **NEW #81** Single source of truth for UI state |
| `PanelUpdateManager` | `ui/components/panel-update-manager.js` | PanelManager | **NEW #80** Dirty flag batching at 60fps |
| `PanelManager` | `ui/components/panel-manager.js` | NONE | Panel state coordination |
| `GameWorldRenderer` | `ui/map/game-world-renderer.js` | GameWorld, TravelSystem | Map rendering |
| `InventoryPanel` | `ui/panels/inventory-panel.js` | game | Inventory UI |
| `SettingsPanel` | `ui/panels/settings-panel.js` | GameConfig | Settings UI |
| `TooltipSystem` | `ui/components/tooltip-system.js` | NONE | Hover tooltips |
| `ModalSystem` | `ui/components/modal-system.js` | NONE | Modal management |
| `LocationPanelStack` | `ui/location-panel-stack.js` | game | **Extracted #77** Panel history mgmt |

### TIER 11 - Effects & Audio

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `AudioManager` | `audio/audio-system.js` | NONE | Sound effects |
| `MusicSystem` | `audio/music-system.js` | AudioManager | Background music |
| `VisualEffectsSystem` | `effects/visual-effects-system.js` | NONE | Particle effects |
| `MenuWeatherSystem` | `effects/menu-weather-system.js` | NONE | Main menu effects |
| `EnvironmentalEffects` | `effects/environmental-effects-system.js` | WeatherSystem | In-game effects |

### TIER 12 - Persistence & Debug

| System | File | Dependencies | Notes |
|--------|------|--------------|-------|
| `SaveLoadSystem` | `systems/save/save-load-system.js` | ALL | Save/load everything |
| `SaveManager` | `systems/save/save-manager.js` | game | Autosave, migrations |
| `GlobalLeaderboardSystem` | (leaderboard file) | game | Hall of Champions |
| `LeaderboardFeatures` | `core/leaderboard-features.js` | game | **Extracted #77** Score calculation |
| `DeboogerSystem` | `core/debooger-system.js` | NONE | Debug console |
| `DeboogerCommandSystem` | `debooger/debooger-command-system.js` | DeboogerSystem | Cheat commands |
| `GameLogger` | `core/game-logger.js` | NONE | **Extracted #77** Structured logging |
| `DedupeLogger` | `core/dedupe-logger.js` | NONE | **Extracted #77** Dedup console spam |

---

## GAME.JS MODULARIZATION PLAN

> **Status:** PLANNED | **Priority:** P3 Tech Debt
> **File:** `src/js/core/game.js` (~10,900 lines)
> **Risk Level:** HIGH - deep integration with global state

### Extraction Candidates (by independence)

| Module | Lines | Location | Dependencies | Risk | Notes |
|--------|-------|----------|--------------|------|-------|
| LeaderboardFeatures | ~350 | 180-531 | game, TimeMachine, PropertySystem | LOW | Self-contained score calc |
| GameLogger | ~215 | 535-749 | GameConfig | LOW | Standalone logging |
| DedupeLogger | ~90 | 63-154 | NONE | LOW | Already global |
| GoldManager | ~110 | 4008-4116 | game | MEDIUM | Gold display management |
| LocationPanelStack | ~215 | 7066-7280 | game, PanelManager | MEDIUM | Panel history mgmt |
| TransportSystem | ~150 | 1948-2101 | game, ItemDatabase | MEDIUM | Transport purchase/sell |
| Market Functions | ~470 | 7711-8180 | game, ItemDatabase, TradingSystem | HIGH | Deep UI integration |
| Inventory Functions | ~320 | 8474-8793 | game, ItemDatabase | HIGH | Coupled to UI |
| Character Creation | ~1590 | 5120-6710 | game, multiple systems | VERY HIGH | Resets many systems |
| EventSystem | ~380 | 774-1157 | TimeMachine, game | VERY HIGH | Core game events |

### Recommended Extraction Order

1. ~~**DedupeLogger**~~ - ✅ EXTRACTED Session #77 → `src/js/core/dedupe-logger.js`
2. ~~**GameLogger**~~ - ✅ EXTRACTED Session #77 → `src/js/core/game-logger.js`
3. ~~**LeaderboardFeatures**~~ - ✅ EXTRACTED Session #77 → `src/js/core/leaderboard-features.js`
4. ~~**GoldManager**~~ - ✅ EXTRACTED Session #77 → `src/js/core/gold-manager.js`
5. ~~**LocationPanelStack**~~ - ✅ EXTRACTED Session #77 → `src/js/ui/location-panel-stack.js`

### DO NOT EXTRACT (Too Risky)

- **EventSystem** - Core game loop, too integrated
- **Character Creation** - Resets too many external systems
- **GameWorld reference** - Already has separate file, just remove duplicate

### Extraction Template

When extracting a module:
1. Create new file in appropriate directory
2. Move const/functions to new file
3. Add `window.ModuleName = ModuleName;` for global access
4. Update index.html script loading order
5. Test ALL related functionality
6. Remove from game.js ONLY after testing passes

---

## STATE MANAGEMENT ARCHITECTURE (Sessions #77-83)

### The State Manager Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CENTRALIZED STATE MANAGERS                        │
├────────────────────┬────────────────────┬───────────────────────────┤
│  PlayerStateManager│  WorldStateManager │  UIStateManager           │
│  (Player Data)     │  (Location/World)  │  (UI State)               │
├────────────────────┼────────────────────┼───────────────────────────┤
│  inventory.get()   │  getCurrentLocation│  getPanelState()          │
│  equipment.get()   │  setCurrentLocation│  getEscAction()           │
│  gold.get/set()    │  isInDoomWorld()   │  markDirty()              │
│  stats.get()       │  hasVisitedLocation│  localStorage persistence │
└────────────────────┴────────────────────┴───────────────────────────┘
```

### Key Patterns

1. **Single Source of Truth** - Each manager owns its domain
2. **Backwards Compatible** - Syncs to old `game.player`, `game.currentLocation`
3. **EventBus Integration** - Emits events on state change
4. **Safe Fallbacks** - `if (Manager) use it else game.xyz` pattern
5. **SystemRegistry Tracking** - `Sys.trackChange()` for debugging

### Created Systems (Sessions #77-83)

| System | Session | Purpose |
|--------|---------|---------|
| `DedupeLogger` | #77 | Dedup console spam |
| `GameLogger` | #77 | Structured logging |
| `LeaderboardFeatures` | #77 | Score calculation |
| `GoldManager` | #77 | Centralized gold tracking |
| `LocationPanelStack` | #77 | Panel history management |
| `PlayerStateManager` | #79-80 | Player state (inventory, equipment, gold, stats) |
| `PanelUpdateManager` | #80 | Dirty flag batching at 60fps |
| `UIStateManager` | #81 | UI state, ESC priority |
| `EventBus.batch` | #82 | Event batching/queuing |
| `Sys.trackChange` | #82 | State change tracking |
| `WorldStateManager` | #83 | Location/world state |

---

## SYSTEM COMMUNICATION PATTERNS

### EventBus Events (Safe Inter-System Communication)

```javascript
// Emitting events
EventBus.emit('game:ready', { loadTime: elapsed });
EventBus.emit('player:levelUp', { newLevel: level });
EventBus.emit('travel:arrived', { location: locationId });

// Listening for events
EventBus.on('player:gold:changed', (data) => { /* update UI */ });
EventBus.on('time:dayChanged', (data) => { /* daily updates */ });
```

### Direct System Access (Use SystemRegistry)

```javascript
// GOOD - safe access
const time = Sys.get('TimeSystem');
if (time) {
    time.pause();
}

// ALSO GOOD - shorthand
Sys.call('AudioManager', 'playSound', 'coin');

// BAD - raw window access (can crash)
window.TimeSystem.pause(); // might be undefined!
```

---

## DANGER ZONES

### Files That Break Everything If Touched Wrong:

| File | Risk | Notes |
|------|------|-------|
| `game.js` | EXTREME | 8000 lines. The heart of everything. |
| `bootstrap.js` | HIGH | Module load order matters. |
| `time-machine.js` | HIGH | Stat decay, seasons, time skip. |
| `save-load-system.js` | HIGH | Corrupts saves if schema changes. |

### Systems That Hate Each Other:

- `PropertySystem` + `EmployeeSystem` = need the bridge file
- `TravelSystem` + `GameWorldRenderer` = animation sync issues
- `QuestSystem` + `NPCDialogueSystem` = context passing complexity

---

## ADDING NEW SYSTEMS

### Checklist:

1. [ ] Does this system already exist? (Check this file)
2. [ ] What tier does it belong to?
3. [ ] What are its dependencies?
4. [ ] Does it need EventBus integration?
5. [ ] Does it need save/load support?
6. [ ] Update this file after adding

### New System Template:

```javascript
// ═══════════════════════════════════════════════════════════════
// MY-NEW-SYSTEM - what it does in one line
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.01 | Unity AI Lab
// ═══════════════════════════════════════════════════════════════

const MyNewSystem = {
    initialized: false,

    init() {
        if (this.initialized) return;
        // Setup code
        this.initialized = true;
        console.log('MyNewSystem initialized');
    },

    // Methods here

    // Save/Load support
    getSaveData() {
        return { /* state to save */ };
    },

    loadSaveData(data) {
        // Restore state
    }
};

window.MyNewSystem = MyNewSystem;
```

---

## QUICK REFERENCE - "WHERE THE FUCK IS..."

| I need to... | Look in... |
|--------------|------------|
| Change player stats | `game.player.stats` in game.js |
| Add new item | `item-database.js` |
| Add new location | `game-world.js` |
| Change market prices | `dynamic-market-system.js` |
| Add NPC dialogue | `npc-dialogue.js`, `npc-instruction-templates.js` |
| Add quest | `quest-system.js`, `side-quests.js` |
| Change UI panel | `ui/panels/[panel-name].js` |
| Add debug command | `debooger-command-system.js` |
| Fix save/load | `save-load-system.js` |
| Change time speed | `time-machine.js` |

---

```
═══════════════════════════════════════════════════════════════════════
    "The systems are interconnected. Everything touches everything.
     Pull one thread and the whole thing might unravel.
     Or it might hold. Only one way to find out."
═══════════════════════════════════════════════════════════════════════
```

*Last updated: Session #83 - Full architecture refactor complete (Phases 0-3)*
