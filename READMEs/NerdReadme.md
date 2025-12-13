# 🖤 NERD README - THE CODE GRIMOIRE 🖤
### *For those who dare to peek behind the curtain of this digital nightmare*

```
═══════════════════════════════════════════════════════════════════════
    "The code is held together by spite, caffeine, and dark magic."
                    - Every developer who touched this, 3am
═══════════════════════════════════════════════════════════════════════
```

> **Version:** 0.91.00 | **Conjured by: Unity AI Lab - The Fucking Legends**
> *Hackall360 | Sponge | GFourteen*
> Written in the witching hours when the bugs come out to play
>
> **Architecture Reference:** See `.claude/ARCHITECTURE.md` for system patterns
> **Readmes Folder:** All documentation now lives in `/READMEs/`

---

## 📖 TABLE OF CONTENTS

- [Architecture Overview](#-architecture-overview)
- [Bootstrap System](#-bootstrap-system)
- [State Managers](#-state-managers)
- [File Structure](#-file-structure)
- [Core Systems](#-core-systems)
- [Game Logic Files](#-game-logic-files)
- [UI & Rendering](#-ui--rendering)
- [Economy Systems](#-economy-systems)
- [Travel & World](#-travel--world)
- [Doom World System](#-doom-world-system)
- [Quest System](#-quest-system)
- [Persistence](#-persistence)
- [Debug & Development](#-debug--development)
- [Adding New Features](#-adding-new-features)
- [Known Architectural Sins](#-known-architectural-sins)

---

## 🏗️ ARCHITECTURE OVERVIEW

*"It's not spaghetti code, it's... artisanal pasta."*

This game follows a loosely-coupled module architecture where each system is its own JavaScript object living in the global scope. They communicate through direct references and a shared `game` state object.

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (Entry Point)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   game.js   │◄───│ TimeSystem  │◄───│ GameWorld   │    │
│   │  (Core Hub) │    │  (Ticks)    │    │ (Locations) │    │
│   └──────┬──────┘    └─────────────┘    └─────────────┘    │
│          │                                                  │
│   ┌──────▼───────────────────────────────────────────┐     │
│   │                 SYSTEM MODULES                    │     │
│   │  trading | inventory | property | employee        │     │
│   │  crafting | achievement | travel | exploration    │     │
│   │  merchant | market | reputation | events          │     │
│   └──────────────────────────────────────────────────┘     │
│          │                                                  │
│   ┌──────▼───────────────────────────────────────────┐     │
│   │                  UI MODULES                       │     │
│   │  panels | modals | settings | debug | renderer    │     │
│   └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### The Holy Trinity of State (Legacy + New State Managers)

**Legacy Objects (still used, synced by state managers):**
1. **`game`** - The global game state object (player, inventory, time, etc.)
2. **`GameWorld`** - All locations, paths, and world data
3. **`TimeMachine`** - The heartbeat: time, seasons, stat decay, time skipping

**New State Managers (v0.91+):**
4. **`PlayerStateManager`** - Single source of truth for gold, inventory, equipment, stats
5. **`WorldStateManager`** - Single source of truth for location, doom state, visited locations
6. **`UIStateManager`** - Panel state, ESC priority stack, localStorage persistence
7. **`PanelUpdateManager`** - Dirty flag batching at 60fps for UI updates

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STATE MANAGER HIERARCHY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   PlayerStateManager ──────┐                                         │
│   (inventory, equipment,   │                                         │
│    gold, stats)            │                                         │
│                            ▼                                         │
│   WorldStateManager ───► EventBus ◄─── UIStateManager               │
│   (location, doom state,   │           (panel state, ESC priority,  │
│    visited locations)      │            localStorage)                │
│                            │                                         │
│                            ▼                                         │
│                    game.* (legacy sync)                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 BOOTSTRAP SYSTEM

*"The one true init system. No more setTimeout hacks. No more race conditions."*

All systems register with Bootstrap and it handles initialization order via topological sort.

### How to Register a System

```javascript
Bootstrap.register('MySystem', () => MySystem.init(), {
    dependencies: ['EventBus', 'ItemDatabase'],  // must init first
    priority: 100,      // lower = earlier within same dependency level
    severity: 'optional' // 'critical', 'required', or 'optional'
});
```

### Severity Levels

| Level | Behavior |
|-------|----------|
| `critical` | Abort game startup if this fails |
| `required` | Log error, continue in degraded mode |
| `optional` | Silent fail, continue normally |

### Bootstrap API

```javascript
// Check if module ready
Bootstrap.isReady('QuestSystem');

// Wait for module(s)
await Bootstrap.waitFor('SaveManager');
await Bootstrap.waitForAll(['TravelSystem', 'TradingSystem']);

// Debug
Bootstrap.printStatus();  // Shows registered/completed/pending/errors
Bootstrap.getStatus();    // Returns status object
```

### Migration Pattern

**OLD (don't do this):**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => MySystem.init(), 500);  // 💀 Race condition waiting to happen
});
```

**NEW (do this):**
```javascript
Bootstrap.register('MySystem', () => MySystem.init(), {
    dependencies: ['game', 'EventBus'],
    severity: 'optional'
});
```

---

## 📊 STATE MANAGERS

*"Single sources of truth. No more scattered state across 50 files."*

### PlayerStateManager

```javascript
// Gold
PlayerStateManager.gold.get();
PlayerStateManager.gold.set(1000);
PlayerStateManager.gold.add(50, 'trade');
PlayerStateManager.gold.remove(25, 'purchase');

// Inventory
PlayerStateManager.inventory.get();
PlayerStateManager.inventory.has('iron_sword');
PlayerStateManager.inventory.getQuantity('iron_ore');
PlayerStateManager.inventory.add('health_potion', 5);
PlayerStateManager.inventory.remove('bread', 1);

// Equipment
PlayerStateManager.equipment.get('weapon');
PlayerStateManager.equipment.equip('iron_sword', 'weapon');
PlayerStateManager.equipment.unequip('weapon');

// Stats
PlayerStateManager.stats.get('health');
PlayerStateManager.stats.set('health', 100);
PlayerStateManager.stats.add('stamina', 10);
PlayerStateManager.stats.subtract('hunger', 5);
```

### WorldStateManager

```javascript
// Location
WorldStateManager.getCurrentLocation();
WorldStateManager.setCurrentLocation('greendale', 'travel');

// Doom state
WorldStateManager.isInDoomWorld();
WorldStateManager.enterDoomWorld('shadow_dungeon');
WorldStateManager.exitDoomWorld();

// Visited locations
WorldStateManager.visitLocation('castle');
WorldStateManager.hasVisited('forest');
WorldStateManager.getVisitedLocations();
```

### UIStateManager

```javascript
// Panel management
UIStateManager.openPanel('inventory');
UIStateManager.closePanel('inventory');
UIStateManager.isOpen('inventory');

// ESC priority (modals > dropdowns > inputs > panels > menu)
UIStateManager.registerEscHandler('myModal', () => closeMyModal(), 100);
UIStateManager.unregisterEscHandler('myModal');
```

### PanelUpdateManager

```javascript
// Mark panel as needing update (batched at 60fps)
PanelUpdateManager.markDirty('inventory', 'items');
PanelUpdateManager.markDirty('equipment', 'stats');

// Instead of this (50 DOM rebuilds):
inventory.forEach(item => rebuildInventoryPanel());

// Do this (1 batched rebuild):
inventory.forEach(item => PanelUpdateManager.markDirty('inventory'));
```

### EventBus

```javascript
// Emit events
EventBus.emit('player:levelUp', { newLevel: 5 });
EventBus.emit('gold:changed', { amount: 100, source: 'trade' });

// Listen for events
EventBus.on('location:changed', (data) => {
    console.log(`Moved from ${data.from} to ${data.to}`);
});

// Batch operations (performance)
EventBus.queue('inventory:changed', { item: 'sword' });
EventBus.queue('gold:changed', { amount: 100 });
EventBus.flushQueue();  // Fire all queued at once
```

---

## 📁 FILE STRUCTURE

```
MTG v0.91.00/
├── index.html                    # The summoning circle (entry point)
├── config.js                     # Game configuration (GameConfig)
├── README.md                     # GitHub display readme
│
├── READMEs/                      # 🖤 All documentation lives here 💀
│   ├── GameplayReadme.md         # For players who read documentation
│   ├── NerdReadme.md             # You are here, brave soul
│   └── DebuggerReadme.md         # Debug console commands (50+ total)
│
├── .claude/                      # AI workflow files
│   ├── 000-workflow.md           # Boot sequence (read first always)
│   ├── unity-coder.md            # Unity persona definition
│   ├── skill-tree.md             # System dependency map
│   ├── ARCHITECTURE.md           # Patterns & state managers
│   ├── todo.md                   # Active work tracking
│   └── finalized.md              # Completed work archive
│
├── src/
│   ├── css/
│   │   └── styles.css            # 6000+ lines of dark-themed CSS
│   │
│   └── js/
│       ├── core/                 # Core engine systems (no dependencies)
│       │   ├── game.js           # THE BIG ONE (~8000 lines)
│       │   ├── event-bus.js      # Inter-system communication
│       │   ├── system-registry.js # Safe system access (Sys.get)
│       │   ├── time-machine.js   # Time, seasons, stat decay
│       │   ├── timer-manager.js  # setTimeout/setInterval wrapper
│       │   ├── player-state-manager.js  # Gold/inventory/equipment/stats
│       │   ├── gold-manager.js   # Gold display sync
│       │   ├── game-logger.js    # Structured logging
│       │   ├── dedupe-logger.js  # Console spam prevention
│       │   └── debooger-system.js # Console capture
│       │
│       ├── data/                 # Static game data
│       │   ├── game-world.js     # 42 locations, paths
│       │   └── items/
│       │       ├── item-database.js      # 150+ items
│       │       └── unified-item-system.js # Item unification
│       │
│       ├── systems/              # Game systems (have dependencies)
│       │   ├── world/            # World state systems
│       │   │   ├── world-state-manager.js  # Location/world state
│       │   │   ├── doom-world-system.js    # Alternate dimension
│       │   │   ├── weather-system.js       # Dynamic weather
│       │   │   └── day-night-cycle.js      # Visual lighting
│       │   ├── combat/           # Combat, dungeons, death
│       │   ├── crafting/         # Recipes, gathering
│       │   ├── employee/         # Worker management
│       │   ├── npc/              # NPC schedules
│       │   ├── progression/      # Achievements, quests, skills, reputation
│       │   ├── save/             # Save manager (unified save/load)
│       │   ├── story/            # Initial encounter
│       │   ├── trading/          # Markets, prices, routes
│       │   └── travel/           # Movement, mounts, ships, gatehouses
│       │
│       ├── ui/                   # User interface
│       │   ├── components/       # Reusable UI components
│       │   │   ├── ui-state-manager.js     # UI state manager
│       │   │   ├── panel-update-manager.js # Dirty flag batching
│       │   │   ├── panel-manager.js        # Panel coordination
│       │   │   └── modal-system.js         # Modal management
│       │   ├── panels/           # Settings, inventory, people, equipment
│       │   └── map/              # World map rendering
│       │
│       ├── npc/                  # NPC systems
│       │   ├── npc-chat-ui.js    # Chat interface
│       │   ├── npc-voice.js      # TTS integration
│       │   ├── npc-trade.js      # Trading with NPCs
│       │   └── npc-combat-stats.js # NPC stat generation for combat
│       │
│       ├── property/             # Property ownership
│       │   ├── property-types.js # Building types
│       │   ├── property-purchase.js
│       │   └── property-upgrades.js
│       │
│       ├── effects/              # Visual effects
│       │   ├── visual-effects-system.js
│       │   ├── animation-system.js
│       │   ├── environmental-effects-system.js
│       │   └── menu-weather-system.js    # Main menu seasonal weather effects
│       │
│       ├── audio/                # Sound and music
│       │   └── audio-system.js
│       │
│       ├── debooger/            # Debooger tools 🐛
│       │   ├── debooger-command-system.js  # Cheat codes 💀
│       │   └── performance-optimizer.js
│       │
│       ├── init/                 # Initialization
│       │   ├── bootstrap.js      # THE init system (~510 lines)
│       │   ├── loading-manager.js
│       │   └── browser-compatibility.js
│       │
│       └── utils/                # Utilities
│           ├── color-utils.js
│           └── virtual-list.js
│
├── tests/                        # Playwright tests (159 total)
│   ├── config/test-config.js     # Test configuration
│   ├── helpers/test-helpers.js   # Test utilities
│   └── *.spec.js                 # Test files
│
└── assets/
    └── images/                   # Game images
        ├── world-map-spring.png  # Spring backdrop (AI generated)
        ├── world-map-summer.png  # Summer backdrop
        ├── world-map-autumn.png  # Autumn backdrop
        ├── world-map-winter.png  # Winter backdrop
        └── world-map-dungeon.png # Dungeon backdrop (fades in at dungeons)
```

---

## 🎮 CORE SYSTEMS

### game.js - The Heart of Darkness

*"8000 lines of pure, distilled chaos."*

This is the main game file. Everything important lives here or passes through here.

**Key Objects:**
```javascript
const game = {
    player: {
        name: 'Trader',
        gold: 100,
        inventory: {},
        equipment: {},
        attributes: { strength, intelligence, charisma, endurance, luck },
        stats: { health, maxHealth, hunger, thirst, stamina, happiness }
    },
    currentLocation: { id, name, type },
    settings: { ... },
    // ... much more
};

const GameWorld = {
    locations: { ... },  // All 30+ locations
    paths: { ... },      // Connections between locations
    getPath(from, to),
    getDistance(from, to)
};

const TimeSystem = {
    gameTime: { year, month, day, hour, minute },
    currentSpeed: 'NORMAL',
    isPaused: false,
    update(),
    setSpeed(speed),
    getTotalMinutes()
};
```

**Key Functions:**
- `initGame()` - Initializes all game systems
- `updateGame()` - Called every tick to update game state
- `buyItem(itemId, qty)` - Purchase from market
- `sellItem(itemId, qty)` - Sell to market
- `travel(locationId)` - Move to new location
- `consumeItem(itemId)` - Use consumable
- `updatePlayerInfo()` - Refresh all UI displays

---

### item-database.js - The Sacred Tome of Items

*"Every spoon, sword, and suspicious mushroom catalogued here."*

```javascript
const ItemDatabase = {
    items: {
        // 150+ items defined with:
        iron_ore: {
            id: 'iron_ore',
            name: 'Iron Ore',
            description: 'Raw iron ore for smelting.',
            icon: '⛏️',
            category: 'raw_ores',
            rarity: 'common',
            weight: 15,
            basePrice: 12,
            gatherable: true,
            gatherMethod: 'mining'
        },
        // ...
    },

    getItem(itemId),           // Get item by ID
    calculatePrice(itemId),    // Get price with modifiers
    calculateWeight(itemId, qty), // Get total weight
    getItemsByCategory(cat),   // Filter by category
    getItemsByRarity(rarity),  // Filter by rarity
    isConsumable(itemId),      // Check if edible/drinkable
    getItemEffects(itemId)     // Get consumption effects
};
```

---

### TimeMachine - The Heart of Time

*"Time waits for no merchant. Unless you pause it. Or skip it entirely."*

The game uses `TimeMachine` as the central time management system, handling the Gregorian calendar, seasons, stat decay, and time skipping.

```javascript
TimeMachine = {
    // Core time state
    currentTime: { year: 1111, month: 4, day: 1, hour: 8, minute: 0 },
    isPaused: false,
    currentSpeed: 'NORMAL',

    SPEEDS: {
        PAUSED: 0,        // frozen like my heart
        NORMAL: 2,        // 2 game minutes per real second
        FAST: 10,         // 10 game minutes per real second
        VERY_FAST: 30     // 30 game minutes per real second
    },

    // 🍂 Season configuration
    SEASONS: {
        spring: { name: 'Spring', months: [3, 4, 5], icon: '🌸', effects: {...} },
        summer: { name: 'Summer', months: [6, 7, 8], icon: '☀️', effects: {...} },
        autumn: { name: 'Autumn', months: [9, 10, 11], icon: '🍂', effects: {...} },
        winter: { name: 'Winter', months: [12, 1, 2], icon: '❄️', effects: {...} }
    },

    // 🍖 Stat decay system
    lastStatDecayMinute: 0,
    STAT_DECAY_INTERVAL: 30, // Decay every 30 game minutes

    // Core methods
    update(),              // Called every frame
    getTotalMinutes(),     // Total minutes since game start
    getSeason(),           // Returns current season name
    getSeasonData(),       // Returns season config with effects

    // 🍖 Stat decay
    processStatDecay(),    // Runs every 30 game minutes

    // ⏰ Time skipping (preserves stats)
    skipDays(days, preserveStats),
    skipMonths(months, preserveStats),

    // 💾 Save/Load integration
    getSaveData(),         // Returns all time state for saving
    loadSaveData(data)     // Restores time state from save
};
```

### Stat Decay System

*"Your body doesn't care about your trading profits."*

Stats automatically decay as time passes, affected by the current season:

```javascript
processStatDecay() {
    // Runs every 30 game minutes
    const season = this.getSeasonData();

    // 🍖 Hunger decay - affected by season
    const hungerDrain = 1 * (season.effects.hungerDrain || 1.0);
    stats.hunger = Math.max(0, stats.hunger - hungerDrain);

    // 💧 Thirst decay - affected by season
    const thirstDrain = 1.2 * (season.effects.thirstDrain || 1.0);
    stats.thirst = Math.max(0, stats.thirst - thirstDrain);

    // ⚡ Stamina - drains while traveling, recovers while resting
    if (isTraveling) {
        stats.stamina -= 2 * season.effects.staminaDrain;
    } else {
        stats.stamina += 0.5; // Recovery
    }

    // 💀 Low stats cause health damage
    if (stats.hunger <= 0 || stats.thirst <= 0) {
        stats.health -= damage;
        // Warning messages for starvation/dehydration
    }
}
```

**Seasonal Modifiers:**
| Season | Hunger | Thirst | Stamina |
|--------|--------|--------|---------|
| Spring | 1.0x | 1.0x | 0.95x |
| Summer | 0.9x | 1.3x | 1.1x |
| Autumn | 1.1x | 0.9x | 1.0x |
| Winter | 1.3x | 0.7x | 1.4x |

### Time Skip System

*"When you need to see the seasons change without dying of old age."*

```javascript
// Skip months while preserving player stats
TimeMachine.skipMonths(6, true);  // Skip 6 months, keep stats

// What happens during a time skip:
// 1. Save current player stats (if preserveStats=true)
// 2. Advance calendar by specified amount
// 3. Trigger season change events if season changed
// 4. Update seasonal backdrop image
// 5. Generate new weather
// 6. Restore saved stats
// 7. Emit 'timeSkipped' event
```

**Travel Animation Sync:**
Travel animations use `TimeMachine.getTotalMinutes()` to sync player marker movement with game time. This means:
- A 2-hour journey (120 game minutes) takes exactly 60 real seconds at NORMAL speed
- Pausing the game pauses the travel animation
- Speed changes affect travel progress in real-time

---

## 💰 ECONOMY SYSTEMS

### trading-system.js - The Art of the Deal

*"Buy low, sell high, try not to starve."*

```javascript
const TradingSystem = {
    tradeMode: 'single',  // 'single' or 'bulk'
    selectedTradeItems: new Map(),
    priceAlerts: [],

    executeBulkBuy(),
    executeBulkSell(),
    recordTrade(type, items),
    checkPriceAlerts(),
    calculateTradeValue(items)
};
```

### npc-merchant-system.js - The Greedy NPCs

*"Every merchant has a personality. Most are assholes."*

```javascript
const NPCMerchantSystem = {
    merchants: {},

    PERSONALITIES: {
        GREEDY: { buyModifier: 0.7, sellModifier: 1.3 },
        FRIENDLY: { buyModifier: 0.95, sellModifier: 1.05 },
        SHREWD: { buyModifier: 0.85, sellModifier: 1.15 },
        // ...
    },

    generateMerchants(),
    getCurrentMerchant(),
    calculatePrice(itemId, merchantId),
    getMerchantFinances(merchantId),  // NEW: Track merchant gold
    canMerchantAfford(merchantId, amount),
    deductMerchantGold(merchantId, amount),
    simulateNPCPurchases(),  // Items deplete over day
    updateEconomy()  // Called from game loop
};
```

### dynamic-market-system.js - Chaos Economics

*"Prices go up, prices go down. You can't explain that."*

```javascript
const DynamicMarketSystem = {
    marketConditions: {},
    supplyDemand: {},

    updatePrices(locationId),
    triggerMarketEvent(type),
    updateSupplyDemand(locationId, itemId, quantity),
    applyMarketSaturation(locationId, itemId)
};
```

---

## TRAVEL & WORLD

### travel-system.js - The Long Road

*"Getting there is half the battle. The other half is not dying."*

```javascript
const TravelSystem = {
    isCurrentlyTraveling: false,
    currentPath: [],
    travelProgress: 0,
    destination: null,

    startTravel(destinationId),
    updateTravel(),
    completeTravel(),
    calculateTravelTime(from, to),
    setDestination(locationId),
    cancelTravel()  // Returns to origin with animated journey back
};
```

### travel-panel-map.js - The Rerouting System

*"Changed your mind mid-journey? We've got you covered."*

```javascript
const TravelPanelMap = {
    // Reroute mid-journey to a new destination
    // Calculates ACTUAL current X,Y position on path (not just snapping to locations)
    rerouteTravel(newDestinationId, isDiscovered),

    // Cancel travel - animates return journey from current path position
    cancelTravel(),

    // Internal: Start travel with specific duration from any X,Y position
    _startRerouteTravelWithDuration(locationId, isDiscovered, duration, fromX, fromY),
    _travelToDestinationWithDuration(duration, fromX, fromY),

    // Travel marker updates now support reroute positions
    updateTravelMarker(progress)  // Checks for rerouteFromPosition first
};
```

**Reroute Logic:**
- When rerouting mid-journey, the system calculates actual X,Y coordinates based on travel progress
- Going back to start: return duration = `progress * originalDuration`
- Going to new destination: duration scaled by distance ratio from current position
- Player marker animates smoothly from current path position (no snapping to locations)

### game-world-renderer.js - The Pretty Map

*"HTML rendering for the existentially lost."*

```javascript
const GameWorldRenderer = {
    mapElement: null,
    tooltipElement: null,
    playerMarker: null,

    // Path types with speed/stamina/safety modifiers
    PATH_TYPES: {
        city_street: { speedMultiplier: 1.5, staminaDrain: 0.3, safety: 0.9 },
        main_road: { speedMultiplier: 1.3, staminaDrain: 0.5, safety: 0.7 },
        road: { speedMultiplier: 1.0, staminaDrain: 0.7, safety: 0.6 },
        path: { speedMultiplier: 0.8, staminaDrain: 0.9, safety: 0.5 },
        trail: { speedMultiplier: 0.6, staminaDrain: 1.2, safety: 0.4 },
        wilderness: { speedMultiplier: 0.4, staminaDrain: 1.5, safety: 0.3 }
    },

    // 🖤 Seasonal backdrop configuration
    SEASONAL_BACKDROPS: {
        spring: 'assets/images/world-map-spring.png',
        summer: 'assets/images/world-map-summer.png',
        autumn: 'assets/images/world-map-autumn.png',
        winter: 'assets/images/world-map-winter.png'
    },
    SEASON_FADE_DURATION: 2000,  // 2 second crossfade

    init(),
    render(),
    renderPaths(),         // SVG paths with hover tooltips
    renderLocations(),     // Location markers with visibility states
    updatePlayerMarker(),  // Player position indicator

    // Path tooltips show: type, distance (miles), travel time,
    // real time at normal speed, stamina drain, safety %
    getPathInfo(from, to),
    showPathTooltip(e, pathInfo, fromLoc, toLoc),

    // Travel animation synced to TimeSystem
    animateTravel(fromId, toId, travelTimeMinutes),
    runTravelAnimation(),  // Uses TimeSystem.getTotalMinutes()
    onTravelStart(fromId, toId, duration),

    // 🖤 Seasonal backdrop methods
    setupBackdropContainer(),    // Creates crossfade layer structure
    loadSeasonalBackdrop(season), // Load season-specific image
    transitionToBackdrop(url, season), // Smooth crossfade transition
    setupSeasonListener(),       // Polls TimeSystem for season changes
    setSeason(season),           // Manual season change (for testing)
    // ...
};
```

**Visibility States:**
- `'visible'` - Location visited, fully shown
- `'discovered'` - Connected to visited location, greyed out
- `'hidden'` - Not yet connected to explored area

### Seasonal Backdrop System

*"The world breathes with the seasons. Snow falls, flowers bloom, leaves turn."*

The game supports **seasonal backdrop images** that crossfade smoothly as the in-game season changes.

### Dungeon Backdrop System

*"When you enter the darkness, the world fades away..."*

When players enter dungeon-type locations (dungeon, cave, ruins, mine), the map backdrop fades to a special dungeon image:

```javascript
// In GameWorldRenderer:
isDungeonLocation(locationId) {
    const location = GameWorld.locations[locationId];
    return ['dungeon', 'cave', 'ruins', 'mine'].includes(location.type);
}

enterDungeonMode() {
    // Fade to dungeon backdrop (2 second transition)
    this.transitionToDungeonBackdrop(this.DUNGEON_BACKDROP);
}

exitDungeonMode() {
    // Return to seasonal backdrop
    this.loadSeasonalBackdrop(currentSeason);
}
```

**Dungeon backdrop file:** `assets/images/world-map-dungeon.png`

### DungeonBonanzaSystem - The Dark Convergence

*"July 18th - When the veil between worlds thins..."*

Every July 18th, a special event triggers that makes dungeon crawling incredibly fast:

```javascript
const DungeonBonanzaSystem = {
    EVENT_MONTH: 7,   // July
    EVENT_DAY: 18,    // 18th
    DUNGEON_TRAVEL_TIME: 30, // minutes (normally 60-120)

    isDungeonBonanzaDay() {
        return TimeMachine.currentTime.month === 7 &&
               TimeMachine.currentTime.day === 18;
    },

    shouldBypassCooldowns() {
        // Returns true on July 18th - no dungeon cooldowns!
        return this.isDungeonBonanzaDay();
    },

    getDungeonTravelTimeOverride(fromId, toId) {
        // Returns 30 for dungeon destinations on July 18th
        if (!this.isDungeonBonanzaDay()) return null;
        if (!isDungeonType(toId)) return null;
        return this.DUNGEON_TRAVEL_TIME;
    }
};
```

**Manual Override (Doom Command):**
```javascript
// Activate bonanza for one game day via debug command
DungeonBonanzaSystem.activateManualOverride();

// The override lasts until the current game day ends
// When the day changes, it automatically deactivates
isManualOverrideValid() {
    if (!this.manualOverrideActive) return false;
    const currentDay = this.getCurrentDay();
    if (currentDay !== this.manualOverrideEndDay) {
        this.deactivateManualOverride();
        return false;
    }
    return true;
}
```

**Integration Points:**
- `GameWorld.calculateTravelTime()` - Checks for bonanza override
- `DungeonExplorationSystem.isOnCooldown()` - Bypassed during event
- `doom` debug command - Activates manual override for one game day

**Image Files (place in `assets/images/`):**
```
world-map-spring.png  - Cherry blossoms, fresh green
world-map-summer.png  - Lush forests, golden wheat
world-map-autumn.png  - Orange/red foliage, harvest colors
world-map-winter.png  - Snow covered, frozen lakes
```

**Fallback Chain:**
1. Try seasonal image (`world-map-{season}.png`)
2. Fall back to single image (`world-map-backdrop.png`)
3. Fall back to CSS gradient (the void wins)

**Console Testing:**
```javascript
GameWorldRenderer.setSeason('winter');  // Force winter backdrop
GameWorldRenderer.setSeason('summer');  // Force summer backdrop
```

### MenuWeatherSystem - Main Menu Seasonal Effects

*"The main menu breathes before you even start playing."*

The main menu has its own weather system separate from in-game weather. It displays seasonal particle effects on the title screen.

```javascript
const MenuWeatherSystem = {
    isActive: true,
    currentSeason: 'spring',

    seasons: {
        spring: { weight: 25, name: 'Spring Breeze' },
        summer: { weight: 25, name: 'Summer Warmth' },
        autumn: { weight: 25, name: 'Autumn Winds' },
        winter: { weight: 25, name: 'Winter Chill' },
        apocalypse: { weight: 0, name: 'The Dark Convergence' }  // Debug only
    },

    // Methods
    start(),                    // Begin weather effects
    stop(),                     // Stop effects
    changeSeason(season),       // Manually set season

    // Seasonal effects
    startSpringEffects(),       // Floating petals, butterflies
    startSummerEffects(),       // Heat shimmer, fireflies
    startAutumnEffects(),       // Falling leaves, wind gusts
    startWinterEffects(),       // Snowflakes, frost
    startApocalypse()           // ☄️ Meteors, red sky, embers
};
```

**Apocalypse Weather (Doom Command):**

When triggered by the `doom` debug command, apocalypse weather displays:
- Red pulsing sky overlay
- Meteor showers with impact flashes (☄️)
- Floating embers rising from below
- Blood-red lightning effects
- Ominous fog layer

```javascript
startMeteorShower() {
    const spawnMeteor = () => {
        // Create meteor with ☄️ emoji
        // Random horizontal position
        // 1.5-2.5 second fall animation
        // Impact flash effect on ground
        // Next meteor spawns in 3-10 seconds
        this.meteorInterval = setTimeout(spawnMeteor, 3000 + Math.random() * 7000);
    };
    spawnMeteor();
}
```

**Integration with Doom Command:**
```javascript
// In debug-command-system.js
registerCommand('doom', '...', () => {
    // Trigger menu weather (main menu)
    if (MenuWeatherSystem.isActive) {
        MenuWeatherSystem.changeSeason('apocalypse');
    }
    // Trigger in-game weather
    if (WeatherSystem) {
        WeatherSystem.changeWeather('apocalypse');
    }
    // Fade in dungeon backdrop
    if (GameWorldRenderer) {
        GameWorldRenderer.enterDungeonMode();
    }
    // Activate bonanza for one day
    if (DungeonBonanzaSystem) {
        DungeonBonanzaSystem.activateManualOverride();
    }
});
```

**Generation Prompts:**
See `gameworldprompt.md` for AI image generation prompts that match the world layout exactly. The prompt includes all 42 locations with coordinates, seasonal variations, color palette, and style notes.

### dungeon-exploration-system.js - Into the Darkness

*"Where the loot is good and the survival rate is... questionable."*

```javascript
const DungeonExplorationSystem = {
    DUNGEON_ITEMS: { /* 17 unique loot items */ },
    VENDOR_TRASH: { /* 10 sellable-only items */ },

    EXPLORATION_EVENTS: {
        ancient_shrine: {
            name: 'Ancient Shrine',
            options: [
                {
                    id: 'light_candles',
                    label: 'Light the candles',
                    outcomes: [
                        { weight: 40, type: 'blessing', loot: [...] },
                        { weight: 30, type: 'nothing', loot: [] },
                        // ...
                    ]
                }
            ]
        },
        // 20+ more events
    },

    SURVIVAL_REQUIREMENTS: {
        easy: { minHealth: 20, survivalChance: 0.95 },
        medium: { minHealth: 40, survivalChance: 0.70 },
        hard: { minHealth: 70, survivalChance: 0.40 },
        deadly: { minHealth: 90, survivalChance: 0.20 }
    },

    generateExplorationOptions(locationId),
    executeExplorationAction(actionId),
    calculateSurvivalAssessment(player, difficulty),
    renderExplorationUI()
};
```

### resource-gathering-system.js - Manual Labor

*"Chop wood, mine ore, question your career choices."*

```javascript
const ResourceGatheringSystem = {
    isGathering: false,
    activeGathering: null,  // Current gathering session state
    gatheringProgress: 0,
    isCommitted: false,  // Can't leave after first action

    // Core gathering methods
    startGathering(resourceType, locationId),
    completeGathering(),
    stopGatheringSession(reason),
    update(),  // Called from game loop, respects TimeMachine.isPaused

    // Weight management
    getCurrentCarryWeight(),
    getMaxCarryCapacity(),
    canCarryMore(additionalWeight),
    getResourceWeight(resourceId),  // Returns weight per resource type

    // Location-aware gathering
    addGatheringSection(locationId),  // Only shows at gatherable locations
    getGatheringActionForResource(resourceId, location),  // Real game items

    // Gatherable location types:
    // mine, forest, farm, cave, quarry, fishing, river, lake
    // Cities/towns/dungeons do NOT show gathering section
};
```

**Time Integration:**
```javascript
update() {
    if (!this.activeGathering) return;
    // Respects game pause state
    if (typeof TimeMachine !== 'undefined' && TimeMachine.isPaused) return;
    // Progress calculated from TimeMachine time elapsed
    // Shows percentage complete + time remaining in UI
}
```

**Resource Weight Map:**
```javascript
getResourceWeight(resourceId) {
    const weights = {
        iron_ore: 10, coal: 8, stone: 15, copper_ore: 9,
        silver_ore: 10, gold_ore: 12, gems: 1, wood: 5,
        planks: 3, herbs: 0.5, mushrooms: 0.3, food: 1, water: 2
        // ... 25+ resources with weights
    };
    return weights[resourceId] || 1;
}
```

---

## 🌑 DOOM WORLD SYSTEM

*"When the darkness wins, the world becomes something... else."*

The Doom World is an alternate dimension accessible through dungeon portals after defeating bosses. It shares the same map layout but with corrupted locations, inverted economy, and separate discovery tracking.

### Access Requirements

1. Defeat a dungeon boss (Shadow Dungeon or Forest Dungeon)
2. Boatman NPC appears in People Panel at that dungeon
3. Select boatman → "Enter Portal" option
4. FREE travel - no cost, no negative effects

### Separate Discovery Tracking

```javascript
const TravelSystem = {
    // 🖤 Normal world tracking
    discoveredPaths: new Set(),
    visitedLocations: new Set(),

    // 💀 Doom world tracking (SEPARATE)
    doomDiscoveredPaths: new Set(),
    doomVisitedLocations: new Set(),

    // 🌑 Current dimension
    currentWorld: 'normal',  // 'normal' or 'doom'

    // Portal functions - REWRITTEN for proper doom isolation
    portalToDoomWorld(entryLocationId) {
        // 1. Reset doom visited locations (only entry dungeon explored)
        // 2. Clear doom discovered paths (fresh start)
        // 3. Discover paths to adjacent locations from entry
        // 4. Set game.currentLocation with corrupted doom name
        // 5. Activate DoomWorldConfig (inverted economy)
        // 6. Set apocalypse weather
        // 7. Enter dungeon mode backdrop + re-render map
    },
    portalToNormalWorld(locationId), // Switch back
    isInDoomWorld(),                 // Check current dimension

    // Discovery methods check currentWorld and use appropriate Set
    getDiscoveredPaths() {
        return this.currentWorld === 'doom'
            ? this.doomDiscoveredPaths
            : this.discoveredPaths;
    }
};
```

### Doom World Bypass Pattern

Zone locks and gatehouse restrictions are bypassed in doom world using a consistent 3-way check:

```javascript
// Used in: game-world-renderer.js, gatehouse-system.js, travel-panel-map.js
const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
               (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
               (typeof game !== 'undefined' && game.inDoomWorld);
if (inDoom) {
    return false; // No zone locks in doom world
}
```

**Files with doom bypass:**
- `game-world-renderer.js` - `isLocationInLockedZone()`, `isLocationBehindLockedGate()`
- `gatehouse-system.js` - `canAccessLocation()`
- `travel-panel-map.js` - `isLocationInLockedZone()`, `isLocationBehindLockedGate()`

### Death Spam Prevention

```javascript
// In game.js update loop - prevents multiple death triggers
const isAlreadyDying = typeof GameOverSystem !== 'undefined' && GameOverSystem.isProcessingGameOver;
if (game.player.stats.health <= 0 && !isAlreadyDying) {
    // Handle death only once
}
```

### First Portal Entry

When a player enters Doom World for the first time:
- Only the portal entry location is "discovered"
- All paths are unexplored (fog of war reset)
- Must re-explore the entire corrupted map
- Discoveries persist separately from normal world

### Corrupted Locations

Same grid positions, different names and NPCs:

| Normal World | Doom World |
|--------------|------------|
| Royal Capital | Destroyed Royal Capital |
| Greendale | Burned Greendale |
| Ironforge | Enslaved Ironforge |
| Jade Harbor | Blighted Harbor |

### Barter Economy (Gold Nearly Worthless)

```javascript
const DoomEconomyModifiers = {
    food: 10.0,      // 10x price - desperate need
    water: 15.0,     // 15x price - most valuable
    medicine: 12.0,  // 12x price - critical
    weapons: 3.0,    // 3x price - survival tools
    luxury: 0.1,     // 0.1x price - worthless here
    goldValue: 0.3   // Gold itself worth 30% of normal
};
```

### Safe Zones (Portal Locations)

- **Shadow Tower** - Portal back to Shadow Dungeon
- **Ruins of Malachar** - Portal back to Forest Dungeon

### The Final Boss: GREEDY WON

```javascript
const GreedyWon = {
    location: 'destroyed_royal_capital',
    health: 1000,
    damage: { min: 30, max: 50 },
    defense: 25,
    lore: "What the Black Ledger became when they won",
    specialAttacks: ['Golden Grasp', 'Contract Curse', 'Market Crash'],
    rewards: {
        title: 'Doom Ender',
        armorSet: "Greed's End"
    }
};
```

---

## ⚔️ COMBAT SYSTEM

*"Violence is the last refuge of the incompetent... but sometimes it's also the first."*

The combat system provides stat-based turn combat through a dedicated modal. NPCs have stats based on their type, location, and game difficulty.

### Combat Modal (combat-modal.js)

```javascript
const CombatModal = {
    currentCombat: null,
    isOpen: false,

    // Open combat with an NPC
    open(npcData) {
        // npcData: { type, name, location, isQuestTarget, questId }
        // Generates NPC stats via NPCCombatStats
        // Shows modal with player vs NPC stats
    },

    // Combat actions
    doAction(action) {
        // 'attack' - Player attacks NPC
        // 'defend' - Player defends (+50% defense this turn)
        // 'flee' - Attempt escape (speed-based chance)
    },

    // Turn flow
    _playerAttack(),  // Calculate damage, apply to NPC
    _npcTurn(),       // NPC attacks back
    _victory(),       // Handle win - gold, XP, quest event
    _defeat(),        // Handle loss - damage, flee

    // Quest integration
    _fireQuestEvent(npc) {
        // Fires 'enemy-defeated' CustomEvent for quest tracking
        document.dispatchEvent(new CustomEvent('enemy-defeated', {
            detail: {
                enemyType: npc.type,
                enemyName: npc.name,
                count: 1,
                isNPC: true,
                questId: this.currentCombat.questId
            }
        }));
    }
};
```

### NPC Combat Stats (npc-combat-stats.js)

```javascript
const NPCCombatStats = {
    // 30+ NPC types with base stats
    BASE_STATS: {
        // Tier 1 - Civilians (easy kills, low rewards)
        merchant: { health: 15, attack: 2, defense: 0, speed: 3, tier: 1, goldDrop: [5, 20], xp: 3 },
        traveler: { health: 12, attack: 1, defense: 0, speed: 4, tier: 1, goldDrop: [2, 10], xp: 2 },
        beggar: { health: 8, attack: 1, defense: 0, speed: 2, tier: 1, goldDrop: [0, 3], xp: 1 },
        drunk: { health: 10, attack: 3, defense: 0, speed: 1, tier: 1, goldDrop: [1, 8], xp: 2 },

        // Tier 2 - Workers/Guards (moderate challenge)
        guard: { health: 40, attack: 12, defense: 6, speed: 6, tier: 2, goldDrop: [10, 40], xp: 20 },
        blacksmith: { health: 30, attack: 8, defense: 4, speed: 4, tier: 2, goldDrop: [15, 50], xp: 12 },

        // Tier 3 - Fighters/Outlaws (dangerous)
        bandit: { health: 50, attack: 16, defense: 5, speed: 8, tier: 3, goldDrop: [20, 60], xp: 30 },
        assassin: { health: 35, attack: 22, defense: 3, speed: 12, tier: 3, goldDrop: [40, 100], xp: 45 },

        // Tier 4 - Bosses (deadly)
        malachar: { health: 300, attack: 45, defense: 20, speed: 4, tier: 4, goldDrop: [500, 1000], xp: 250 },
        shadow_guardian: { health: 200, attack: 35, defense: 25, speed: 6, tier: 4, goldDrop: [300, 600], xp: 180 },
        rat_king: { health: 150, attack: 25, defense: 10, speed: 10, tier: 4, goldDrop: [200, 400], xp: 120 },
        greedy_won: { health: 500, attack: 60, defense: 30, speed: 3, tier: 4, goldDrop: [1000, 2000], xp: 500 }
    },

    // Location multipliers
    LOCATION_MULTIPLIERS: {
        village: 0.8,      // Weaker NPCs
        town: 1.0,         // Standard
        city: 1.2,         // Tougher
        capital: 1.5,      // Elite
        dungeon: 1.8,      // Dangerous
        doom_world: 2.0    // Maximum danger
    },

    // Difficulty multipliers
    DIFFICULTY_MULTIPLIERS: {
        easy: 0.7,
        normal: 1.0,
        hard: 1.3,
        deadly: 1.6
    },

    // Path danger levels for encounter variety
    PATH_DANGER: {
        safe: { encounterChance: 0.05, types: ['traveler', 'merchant', 'pilgrim', 'courier'] },
        normal: { encounterChance: 0.10, types: ['traveler', 'merchant', 'drunk', 'beggar', 'thief'] },
        dangerous: { encounterChance: 0.20, types: ['bandit', 'thief', 'robber', 'wolf', 'smuggler'] },
        deadly: { encounterChance: 0.30, types: ['bandit', 'assassin', 'orc', 'skeleton', 'ghost'] }
    },

    // Daily encounter limit
    MAX_ENCOUNTERS_PER_DAY: 2,
    encountersToday: 0,
    lastEncounterDay: 0,

    // Generate stats for an NPC
    generateStats(npcType, location, difficulty) {
        const base = this.BASE_STATS[npcType] || this.BASE_STATS.traveler;
        const locMult = this.LOCATION_MULTIPLIERS[location] || 1.0;
        const diffMult = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

        return {
            health: Math.round(base.health * locMult * diffMult),
            maxHealth: Math.round(base.health * locMult * diffMult),
            attack: Math.round(base.attack * locMult * diffMult),
            defense: Math.round(base.defense * locMult * diffMult),
            speed: base.speed,
            tier: base.tier,
            goldDrop: [
                Math.round(base.goldDrop[0] * diffMult),
                Math.round(base.goldDrop[1] * diffMult)
            ],
            xp: Math.round(base.xp * diffMult)
        };
    },

    // Get random encounter for path danger level
    getRandomEncounter(dangerLevel) {
        if (this.encountersToday >= this.MAX_ENCOUNTERS_PER_DAY) return null;
        const danger = this.PATH_DANGER[dangerLevel] || this.PATH_DANGER.normal;
        if (Math.random() > danger.encounterChance) return null;
        const type = danger.types[Math.floor(Math.random() * danger.types.length)];
        this.encountersToday++;
        return type;
    }
};
```

### NPC Encounter Inventories (npc-encounters.js & doom-world-npcs.js)

*"Every NPC carries items befitting their role in life - or death."*

**Normal World (npc-encounters.js):**
```javascript
const NPCEncounters = {
    // 30+ NPC types can trade
    canTrade(npcType) {
        const tradeableTypes = [
            'traveler', 'merchant', 'smuggler', 'courier', 'pilgrim',
            'robber', 'thief', 'bandit',  // Hostile - stolen goods
            'mercenary', 'spy', 'informant',  // Neutral - special items
            'healer', 'priest', 'innkeeper', 'apothecary',  // Service
            'guard', 'noble', 'guild_master', 'scribe',  // Authority
            'farmer', 'ferryman', 'stablemaster', 'jeweler',  // Civilian
            'blacksmith', 'herbalist', 'hunter', 'fisherman', 'miner'
        ];
        return tradeableTypes.includes(npcType);
    },

    // 25+ inventory templates with tiered items
    inventoryTemplates: {
        robber: {
            common: ['stolen_goods', 'rusty_dagger', 'lockpick'],
            uncommon: ['gold_ring', 'silver_chain'],
            rare: ['jeweled_dagger', 'noble_signet']
        },
        healer: {
            common: ['bandages', 'healing_herbs', 'clean_water'],
            uncommon: ['antidote', 'healing_salve'],
            rare: ['elixir_of_life', 'blessed_water']
        },
        // ... 23+ more templates
    },

    // Gold ranges per NPC type
    goldRanges: {
        beggar: { min: 0, max: 5 },
        noble: { min: 100, max: 500 },
        loan_shark: { min: 100, max: 400 }
        // ... 30+ types
    }
};
```

**Doom World (doom-world-npcs.js):**
```javascript
// Gold is WORTHLESS in the apocalypse - survival items are currency
const DoomNPCs = {
    doomInventoryTemplates: {
        doom_survivor: {
            common: ['moldy_bread', 'dirty_water', 'torn_rags'],
            uncommon: ['rusty_weapon', 'makeshift_bandage'],
            rare: ['clean_water', 'preserved_meat']
        },
        blight_creature: {
            common: ['corrupted_flesh', 'dark_ichor'],
            uncommon: ['blight_crystal', 'void_shard'],
            rare: ['cursed_relic']
        },
        doom_merchant: {
            common: ['salvaged_tools', 'hoarded_medicine'],
            uncommon: ['pre-blight_artifact', 'survival_gear'],
            rare: ['vault_key', 'untainted_seeds']
        }
        // ... 20+ doom templates
    },

    generateDoomInventory(npcType),  // Fewer items, scarcer drops
    generateDoomGold(npcType),       // 0-10 gold (worthless)
    canDoomTrade(npcType)            // Creatures don't trade
};
```

### Quest-Aware Attack Protection (people-panel.js)

```javascript
// Check if an NPC can be attacked
canAttackNPC(npcType, location) {
    // Protected NPCs - authority figures and mystical beings
    const protectedNPCs = ['noble', 'king', 'queen', 'boatman', 'ferryman'];
    if (protectedNPCs.includes(npcType)) {
        return { allowed: false, reason: 'protected' };
    }

    // Guards protected unless quest target
    if (npcType === 'guard') {
        const guardQuestTarget = this._isQuestDefeatTarget(npcType, location);
        if (guardQuestTarget) {
            return { allowed: true, reason: 'quest_target', isQuestTarget: true, questId: guardQuestTarget.questId };
        }
        return { allowed: false, reason: 'protected' };
    }

    // Check quest involvement
    if (typeof QuestSystem !== 'undefined') {
        for (const questId in QuestSystem.activeQuests || {}) {
            const quest = QuestSystem.activeQuests[questId];
            // Check if NPC is quest giver
            if (this._npcMatchesType(npcType, quest.giver)) {
                return { allowed: false, reason: 'quest_npc', questId };
            }
            // Check objectives for talk/deliver targets
            for (const obj of quest.objectives || []) {
                if ((obj.type === 'talk' || obj.type === 'deliver') &&
                    this._npcMatchesType(npcType, obj.target)) {
                    return { allowed: false, reason: 'quest_target_talk', questId };
                }
            }
        }
    }

    return { allowed: true, reason: 'normal' };
}
```

### Combat Integration Points

| System | Integration |
|--------|-------------|
| **People Panel** | Attack action calls `CombatModal.open()` |
| **Quest System** | Listens for `enemy-defeated` event |
| **Travel Encounters** | Uses `NPCCombatStats.getRandomEncounter()` |
| **Dungeon Events** | Boss fights use tier 4 stats |

---

## 📜 QUEST SYSTEM

*"100 quests to tell the tale of a merchant's rise... or fall."*

### Unified Quest Info Panel

*"One panel to rule them all."*

All quest displays now use a single unified `showQuestInfoPanel()` function. This ensures consistent quest information display across the entire game.

```javascript
// 🖤 Unified Quest Info Panel - used for ALL quest displays 💀
QuestSystem.showQuestInfoPanel(questId, options);

// Options:
// - isNewQuest: boolean - Shows "✨ New Quest!" animated banner
// - onClose: function - Callback when panel is closed
// - showTrackButton: boolean - Show track/untrack button

// Usage examples:
QuestSystem.showQuestInfoPanel('main_prologue');  // Basic view
QuestSystem.showQuestInfoPanel('main_prologue', { isNewQuest: true });  // New quest banner
QuestSystem.showQuestInfoPanel('main_prologue', {
    isNewQuest: true,
    onClose: () => showTutorialPrompt()
});  // Callback on close
```

**Where It's Used:**
- **Initial Encounter** - When accepting the first quest
- **Quest Tracker Widget** - Clicking on tracked quest
- **Quest Log** - Clicking on any quest card
- **Quest Completion** - When a new quest in a chain starts

### Location Tooltips with Quest Info

When hovering over locations on the map, if a tracked quest points to that location, the tooltip shows quest information:

```javascript
// 🖤 Get quest info for tooltips 💀
QuestSystem.getQuestInfoForLocation(locationId);
// Returns: { questName, questId, objective, isTracked } or null
```

### Quest Structure: 100 Total Quests

```javascript
const QuestSystem = {
    // Main Story Arc (35 quests - 5 acts)
    mainQuests: {
        act1: 7,  // "A Trader's Beginning" - learn basics, conspiracy hints
        act2: 7,  // "Whispers of Conspiracy" - Black Ledger revealed
        act3: 7,  // "The Dark Connection" - Malachar + Black Ledger
        act4: 7,  // "War of Commerce" - economic warfare, choose sides
        act5: 7   // "The Shadow's End" - final confrontation
    },

    // Side Quest Chains (50 quests - 14 chains)
    sideQuests: {
        combatChains: 7,  // Combat-focused quest chains
        tradeChains: 7    // Trade-focused quest chains
    },

    // Doom World Quests (15 quests + final boss)
    doomQuests: {
        survivalArc: 5,    // Survival in the wasteland
        resistanceArc: 5,  // Building resistance
        bossArc: 5         // Path to Greedy Won
    }
};
```

### Wealth Gates (Difficulty-Scaled)

Quest progression is gated by accumulated wealth:

```javascript
const WealthGates = {
    act2: { easy: 600, normal: 1000, hard: 1500 },
    act3: { easy: 3000, normal: 5000, hard: 7500 },
    act4: { easy: 12000, normal: 20000, hard: 30000 },
    act5: { easy: 30000, normal: 50000, hard: 75000 }
};
```

### Key Quest Files

- `quest-system.js` - Main 100-quest management
- `doom-quests.js` - Doom World specific content
- `initial-encounter.js` - Tutorial/intro sequence

---

## 💀 DEATH & LEADERBOARD SYSTEMS

### death-cause-system.js - How Did You Die?

*"Everyone dies. We just keep track of the embarrassing details."*

```javascript
const DeathCauseSystem = {
    // Death categories for that extra flavor of despair
    DEATH_CATEGORIES: {
        STARVATION: 'starvation',
        DEHYDRATION: 'dehydration',
        EXHAUSTION: 'exhaustion',
        COMBAT: 'combat',
        DUNGEON: 'dungeon',
        TRAVEL: 'travel',
        ENCOUNTER: 'encounter',
        BANKRUPTCY: 'bankruptcy',
        DISEASE: 'disease',
        ENVIRONMENTAL: 'environmental',
        UNKNOWN: 'unknown'
    },

    // Track events that lead to death
    recordEvent(category, description, damage),
    setPendingCause(category, description),
    getDeathCause(),  // Returns flavorful death message
    analyzeDeathCause(),  // Determines cause from event history

    // Integration helpers
    recordCombatDamage(enemy, damage),
    recordDungeonEvent(eventName, outcome),
    recordTravelHazard(hazardType, damage),
    reset()  // Called on new game
};
```

### global-leaderboard-system.js - Hall of Champions

*"Your score, immortalized in JSONBin's cold servers."*

The **Hall of Champions** is the single source of truth for the global leaderboard. It replaces the old "Hall of Fame" and consolidates all leaderboard functionality into one unified system.

```javascript
const GlobalLeaderboardSystem = {
    // Configuration loaded from GameConfig (config.js)
    config: {
        BIN_ID: 'xxx',      // JSONBin API
        API_KEY: 'xxx',     // X-Master-Key for read/write
        backend: 'jsonbin', // 'jsonbin', 'gist', or 'local'
        maxEntries: 100,    // Top 100 champions
        displayEntries: 10, // Show top 10 in compact view
        minScoreToSubmit: 100
    },

    leaderboard: [],

    // Core methods
    submitScore(scoreData),     // Called on death, save, AND retirement
    fetchLeaderboard(),
    renderLeaderboard(),
    renderFullHallOfChampions(containerId), // Full top 100 view with medals

    // Auto-refresh every 10 minutes
    startAutoRefresh(),
    stopAutoRefresh(),
    refresh(),  // Force refresh

    // Score data includes:
    // - playerName, score, gold, daysSurvived
    // - isAlive (💚 or 💀 indicator)
    // - causeOfDeath (from DeathCauseSystem)
    // - difficulty, tradesCompleted, netWorth
    // - timestamp
};

// Console utilities for debugging/admin
window.testJSONBin();      // Test API connectivity
window.resetLeaderboard(); // Clear all entries (admin only)
```

**Important:** Scores are only submitted during explicit gameplay events:
- **New Save** - Marks player as "still playing" (💚)
- **Death** - Records cause of death (💀)
- **Retirement** - Voluntary end to journey

Old saves are NEVER auto-submitted. Only active gameplay triggers leaderboard updates.

---

## 💾 PERSISTENCE

### save-load-system.js - Cheating Death

*"Your progress, preserved in localStorage's cold embrace."*

```javascript
const SaveLoadSystem = {
    SAVE_VERSION: '0.6',

    saveGame(slotId),
    loadGame(slotId),
    getSaveSlots(),
    deleteSave(slotId),
    exportSave(),
    importSave(data),

    // Serializes all game state:
    // - game object (player, inventory, equipment, stats)
    // - All system states (time, events, world, properties, employees)
    // - Trading state (history, price alerts, market data)
    // - Achievements
    // - Settings

    // Post-load restoration:
    // - Forces map re-render with saved visited locations
    // - Restores panel positions via DraggablePanels.loadPositions()
    // - Hides all setup screens, shows game UI
    // - Triggers full UI refresh (player info, inventory, time display)
};
```

### TimeMachine Save/Load Integration

*"Time itself bends to the save file."*

The TimeMachine system has its own save/load methods that are called by SaveManager:

```javascript
// In save-manager.js getCompleteGameState():
timeState: typeof TimeMachine !== 'undefined' && TimeMachine.getSaveData
    ? TimeMachine.getSaveData()
    : fallbackTimeState,

// TimeMachine.getSaveData() returns:
{
    currentTime: { year, month, day, hour, minute },
    currentSpeed: 'NORMAL',
    isPaused: false,
    accumulatedTime: 0,
    lastProcessedDay: 0,
    lastWageProcessedDay: 0,
    lastStatDecayMinute: 0  // 🍖 Stat decay tracking
}

// On load, TimeMachine.loadSaveData() restores:
// - All time state
// - Stat decay tracking
// - Seasonal backdrop image (with 100ms delay for DOM)
```

### draggable-panels.js - Panel Position Persistence

*"Your panels, your way. We remember where you put them."*

```javascript
const DraggablePanels = {
    STORAGE_KEY: 'trader-panel-positions',

    // Saves panel position to localStorage when dragged
    savePosition(element),

    // Restores all panel positions from localStorage
    loadPositions(),

    // Nuclear reset - clear positions and reload
    resetPositions(),

    // Positions persist across sessions and game loads
    // Panel positions are independent of save files
};
```

### config.js - Centralized Settings Defaults

*"One config to rule them all."*

All settings panel defaults are now centralized in `config.js`. The settings panel reads from `GameConfig.settings` as its source of truth:

```javascript
const GameConfig = {
    // ... other config sections ...

    settings: {
        // 🎵 audio settings
        audio: {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.7,
            isMuted: false,
            isMusicMuted: false,
            isSfxMuted: false,
            audioEnabled: true
        },

        // 👁️ visual settings
        visual: {
            particlesEnabled: true,
            screenShakeEnabled: true,
            animationsEnabled: true,
            weatherEffectsEnabled: true,
            quality: 'medium',       // 'low', 'medium', 'high'
            reducedMotion: false,
            flashWarnings: true
        },

        // ✨ animation settings
        animation: {
            animationsEnabled: true,
            animationSpeed: 1.0,
            reducedMotion: false,
            quality: 'medium'
        },

        // 🎨 ui settings
        ui: {
            animationsEnabled: true,
            hoverEffectsEnabled: true,
            transitionsEnabled: true,
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium',      // 'small', 'medium', 'large'
            theme: 'default'
        },

        // 🌧️ environmental settings
        environmental: {
            weatherEffectsEnabled: true,
            lightingEnabled: true,
            seasonalEffectsEnabled: true,
            quality: 'medium',
            reducedEffects: false
        },

        // ♿ accessibility settings
        accessibility: {
            reducedMotion: false,
            highContrast: false,
            screenReaderEnabled: false,
            flashWarnings: true,
            colorBlindMode: 'none',  // 'none', 'deuteranopia', 'protanopia', 'tritanopia'
            fontSize: 'medium',
            keyboardNavigation: true
        }
    }
};
```

The `settings-panel.js` now uses a getter that pulls from `GameConfig.settings`:

```javascript
get defaultSettings() {
    if (typeof GameConfig !== 'undefined' && GameConfig.settings) {
        return GameConfig.settings;
    }
    // Fallback if config not loaded
    return { /* ... inline fallback ... */ };
}
```

**To change default settings:** Edit `config.js` - all settings panel defaults will update automatically.

---

### settings-panel.js - Clear All Data

*"When you want to burn it all down."*

```javascript
SettingsPanel.clearAllData() {
    // Two-step confirmation required

    // Clears EVERYTHING locally:
    // 1. localStorage (all keys)
    // 2. sessionStorage
    // 3. IndexedDB (all known + discovered databases)
    // 4. Cookies (all paths)
    // 5. Cache Storage (Service Worker caches)
    // 6. Service Workers (unregistered)
    // 7. In-memory caches (GlobalLeaderboardSystem)

    // Does NOT affect:
    // - Global Hall of Champions on JSONBin server
}
```

---

## 🐛 DEBOOGER & DEVELOPMENT 🖤

> 🐛 **For complete debooger command documentation, see [DebuggerReadme.md](DebuggerReadme.md)**

### Debooger System Files 📁

| File | Purpose |
|------|---------|
| `src/js/core/debooger-system.js` | Debooger console UI and log capture 🐛 |
| `src/js/debooger/debooger-command-system.js` | Command registration and execution 🔮 |

### Debooger Config (config.js) ⚙️

```javascript
const GameConfig = {
    debooger: {
        enabled: true,              // true = debooger works, false = locked 🔒
        showConsoleWarnings: true   // Show warnings when locked ⚠️
    }
};
```

### Debooger Access Methods 🔓

1. **Developer Mode:** `GameConfig.debooger.enabled = true` 💀
2. **Super Hacker Achievement:** Unlock ALL achievements for permanent debooger access 🏆

### Key Debooger Functions 🔮

```javascript
DeboogerCommandSystem.isDeboogerEnabled()  // Check if debooger is available 🐛
DeboogerCommandSystem.executeCommand()     // Run a debooger command 💀
AchievementSystem.isDeboogerUnlockedForSave()  // Check achievement unlock 🏆
```

> 🎮 For gameplay info, see [GameplayReadme.md](GameplayReadme.md)

---

## ✨ ADDING NEW FEATURES

### Adding a New Item

1. Open `src/js/item-database.js`
2. Add to the `items` object:

```javascript
my_new_item: {
    id: 'my_new_item',
    name: 'My New Item',
    description: 'A thing that does stuff.',
    icon: '🆕',
    category: 'basic_resources',  // or consumables, weapons, etc.
    rarity: 'common',
    weight: 5,
    basePrice: 25,
    // Optional properties:
    consumable: true,
    effects: { hunger: 10, health: 5 },
    craftable: true,
    gatherable: true,
    gatherMethod: 'mining'
}
```

### Adding a New Location

1. Open `src/js/game.js`
2. Find `GameWorld.locations`
3. Add your location:

```javascript
my_village: {
    id: 'my_village',
    name: 'My Village',
    type: 'village',
    region: 'riverlands',
    description: 'A quaint village that definitely isn\'t haunted.',
    position: { x: 500, y: 400 },
    marketPrices: {
        bread: { price: 3, stock: 50 },
        // ...
    },
    services: ['inn', 'market'],
    unlocked: true
}
```

4. Add paths in `GameWorld.paths`:
```javascript
'my_village-other_location': { distance: 10, terrain: 'road' }
```

### Adding a New Exploration Event

1. Open `src/js/dungeon-exploration-system.js`
2. Find `EXPLORATION_EVENTS`
3. Add your event:

```javascript
my_event: {
    id: 'my_event',
    name: 'Mysterious Thing',
    description: 'You find something... unsettling.',
    icon: '❓',
    difficulty: 'medium',
    options: [
        {
            id: 'investigate',
            label: 'Investigate Closely',
            icon: '🔍',
            healthCost: { min: 5, max: 15 },
            staminaCost: { min: 10, max: 20 },
            outcomes: [
                {
                    weight: 50,
                    type: 'success',
                    message: 'You found treasure!',
                    loot: ['ancient_coin', 'ancient_coin']
                },
                {
                    weight: 30,
                    type: 'failure',
                    message: 'It was a trap!',
                    healthPenalty: 20,
                    loot: ['bone_fragment']
                }
            ]
        }
    ]
}
```

---

## 💀 KNOWN ARCHITECTURAL SINS

*"We acknowledge our crimes against clean code."*

### The Global State Problem
Everything lives in global scope. `game`, `GameWorld`, `TimeSystem`, all the system objects - they're all global. Yes, we know. No, we're not fixing it now.

### The 8000-Line game.js
It started small. It grew. Now it contains multitudes. Refactoring would require a blood sacrifice we're not prepared to make.

### Multiple UI Systems
There are like 4 different systems that update the UI. They mostly don't conflict. Mostly.

### Unified Modal Theme (Purple/Gold)
All modals now use a unified dark purple/gold theme matching the quest panel:
- **Background:** `rgba(40, 40, 70)` to `rgba(25, 25, 45)` gradient
- **Border:** `#ffd700` (gold) with glow effect
- **Header:** Gold gradient with gold text
- **Buttons:** Gold for primary, purple/gray for secondary

### The Bridge Files
`property-employee-bridge.js` exists because two systems grew apart and needed couples therapy. It works.

### CSS Specificity Wars
The stylesheet is 6000+ lines of !important battles. The dark theme won.

### Save System Versioning
We try to maintain backwards compatibility. We fail sometimes. Your old saves might work. Might.

---

## 🦇 OUR DARK-ASS CODING PHILOSOPHY

```
═══════════════════════════════════════════════════════════════════════
                    PRINCIPLES WE TRY TO FOLLOW
═══════════════════════════════════════════════════════════════════════

1. Make it work, then make it pretty, then make it work again
   because making it pretty broke something.

2. Comments are for the weak. Variable names should tell a story.
   A confusing, cryptic story written at 3am.

3. If it works, don't touch it. If you must touch it, make a backup.
   If the backup fails, blame the intern.

4. Every bug is a feature waiting to be documented.

5. Console.log is not a debugging strategy. It's a lifestyle.

6. The game loop is sacred. Touch it only during blood moons.

7. localStorage is eternal. Until the user clears their browser.

8. When in doubt, add another system file. Modular code is
   just spaghetti with better plating.

═══════════════════════════════════════════════════════════════════════
```

---

## 🔮 FUTURE ARCHITECTURAL DREAMS

*"Things we'd do if we had infinite time and zero responsibilities."*

**DONE (v0.91):**
- [x] Proper event bus architecture (EventBus with batch support)
- [x] State management (PlayerStateManager, WorldStateManager, UIStateManager)
- [x] Proper initialization system (Bootstrap with dependency resolution)
- [x] Panel update batching (PanelUpdateManager at 60fps)

**STILL DREAMING:**
- [ ] Proper module system (ES6 imports)
- [ ] TypeScript conversion
- [ ] Unit tests (lol)
- [ ] Split game.js into manageable pieces
- [ ] WebGL rendering for the map
- [ ] Offline-first with Service Workers
- [ ] Multiplayer??? (we can dream)

---

## 🚀 DEPLOYMENT

*"Push to main, watch the magic happen."*

### GitHub Pages Auto-Deployment

The game auto-deploys to GitHub Pages on every push to `main` or `master` branch.

**Workflow File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` or `master` branch
- Manual file edits via GitHub browser UI
- Manual workflow dispatch from Actions tab

**How It Works:**
1. Push code to main branch (or edit files in browser)
2. GitHub Actions workflow triggers automatically
3. Entire repository is uploaded as static site
4. Deploys to GitHub Pages (no build step needed)

**To Enable:**
1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to main - deployment happens automatically

**Manual Deploy:**
1. Go to repository Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

```yaml
# Key workflow settings
on:
  push:
    branches: [main, master]
  workflow_dispatch:  # Manual trigger

permissions:
  contents: read
  pages: write
  id-token: write
```

---

## 📜 CONTRIBUTION GUIDELINES

*"How to add your own chaos to the pile."*

1. **Fork it** - Your crimes, your repo
2. **Branch it** - `feature/my-cool-thing`
3. **Code it** - Match the existing style (dark, cynical)
4. **Test it** - Manually, like our ancestors
5. **Document it** - In the code comments, with sarcasm
6. **PR it** - Explain what you broke and how

### Code Style
- 4 spaces, not tabs (we're not animals)
- Single quotes for strings
- Semicolons always
- Comments should be funny AND useful
- No console.log in production (we're lying, there's hundreds)

---

## 📅 VERSION HISTORY

### v0.91.00 - The Bootstrap Refactor (2025-12-10)

**Sessions #70-86: The Great Architectural Unfuckening**

**Session #86 - Bootstrap System Complete:**
- **NEW:** `Bootstrap.register()` - Registration-based dependency system
- 50+ files migrated from scattered `DOMContentLoaded` handlers
- Topological sort for dependency resolution
- Circular dependency detection and reporting
- Timeout protection per module (default 10s)
- Severity levels: critical (abort), required (warn), optional (silent)
- Late registration support for dynamic modules
- Debug API: `isReady()`, `waitFor()`, `getStatus()`, `printStatus()`
- **Files:** `src/js/init/bootstrap.js` (complete rewrite ~510 lines)

**Session #83-85 - State Managers:**
- **NEW:** `PlayerStateManager` - Gold, inventory, equipment, stats (~560 lines)
- **NEW:** `WorldStateManager` - Location, doom state, visited locations (~480 lines)
- **NEW:** `UIStateManager` - Panel state, ESC priority, localStorage (~320 lines)
- **NEW:** `PanelUpdateManager` - Dirty flag batching at 60fps (~400 lines)
- **Files:** `src/js/core/player-state-manager.js`, `src/js/systems/world/world-state-manager.js`, `src/js/ui/components/ui-state-manager.js`, `src/js/ui/components/panel-update-manager.js`

**Session #82 - EventBus Batch System:**
- **NEW:** `emitBatch()`, `onBatch()`, `queue()`, `flushQueue()`, `flushQueueOnFrame()`
- **NEW:** SystemRegistry state tracking: `trackChange()`, `enableChangeTracking()`, `printChanges()`
- **Files:** `src/js/core/event-bus.js`, `src/js/core/system-registry.js`

**Session #77-81 - game.js Extractions:**
- **NEW:** `DedupeLogger` - Console spam prevention
- **NEW:** `GameLogger` - Structured logging
- **NEW:** `GoldManager` - Gold display sync
- **NEW:** `LocationPanelStack` - Location panel tracking
- **Files:** `src/js/core/dedupe-logger.js`, `src/js/core/game-logger.js`, `src/js/core/gold-manager.js`, `src/js/ui/location-panel-stack.js`

**Session #73-76 - P0 Critical Fixes:**
- Fixed 16 P0 critical bugs from 10-agent audit
- Boss fight math (max rounds 20 → 75 for bosses)
- Merchant gold infinite money glitch fixed
- Combat stat conflicts resolved
- Doom NPC types completed (130+ definitions)
- Quest location mismatches fixed
- Employee income cap (max 3x)

**Session #74 - 10-Agent Architecture Audit:**
- 519+ bugs verified fixed
- All P0/P1/P2/P3 items resolved
- **NEW:** `validate`, `syncstate`, `debugstate`, `trackchanges` debug commands
- **NEW:** `exitdoom`, `tp` debug commands

---

### v0.90.01 - Sessions #66-69 (2025-12-07)

**Session #69 - Inventory Hover Info Panel:**
- **NEW:** `updateHoverInfoPanel()` in inventory-panel.js
- Item info panel next to Quick Access shows full item details on hover
- Shows: icon, name, description, value (unit + total), weight, category, rarity
- Shows bonuses/effects with color coding
- Rarity colors: common=#888, uncommon=#1eff00, rare=#0070dd, epic=#a335ee, legendary=#ff8000
- Files: `index.html`, `styles.css`, `inventory-panel.js`

**Session #68 - NPC Dialogue Panel + Universal Faction System:**
- Restructured `.npc-name-header` - name prominent at top with gold color
- Created `.npc-info-row` for title + badges with flex-wrap
- Added 20+ quest giver types to `alwaysTrade` (no rep required)
- Created `npcFactionMap` with 60+ NPC types mapped to 7+ factions
- Created `enemyFactions`: bandits(-50), monsters(-75), undead(-100), shadow_cult(-100)
- Added 5 faction helper functions: `getNPCFactions()`, `getNPCPrimaryFaction()`, etc.
- Integrated faction rep into `getNPCReputation()` fallback
- Files: `people-panel.js`, `faction-system.js`

**Session #67 - Quest Info Panel - Giver & Chain Display:**
- Added `buildQuestChainInfo()` helper to quest-system.js
- Quest giver section with blue-tinted background
- Quest chain section with purple-tinted background
- Shows: chain name, part number, prev/current/next quests
- Clickable navigation between chain quests
- Files: `quest-system.js` (+80 lines code + CSS)

**Session #66 - UI Polish + CPU Optimization:**
- Voice TTS: `effectiveVolume = masterVolume * (voiceVolume / 100)`
- UI Scale: stored in localStorage, applied via CSS transform
- Weather particles: 150ms → 400ms intervals, 60 → 25 max particles
- Player marker: 3s → 5s animation cycles, `will-change` GPU hints
- Files: `settings-panel.js`, `menu-weather-system.js`, `weather-system.js`, `game-world-renderer.js`

---

### v0.90.00 - The Unified Dialogue Update (2025-12-05)

**New Features:**
- 🎭 **Unified Quest API Instructions** - Button-specific instructions for all quest types
- 📜 **sendQuestActionMessage()** - Full quest context passed to AI
- 🖤 **Intro Panel Rework** - Hooded Stranger uses PeoplePanel
- 🔬 **Mega Regression Test** - 121 checks across 10 categories
- 🗺️ **Multi-Hop Travel Animation** - Travel path shows waypoints on long journeys
- 🔨 **Construction Materials Crafting** - Full crafting tree: crate, barrel, wooden_beam, scaffolding
- 💾 **Save/Load System Enhancements** - 12+ system states properly serialized
- 🎭 **50+ NPC Type Inventories** - Each NPC type has contextual item pools
- 🌦️ **Weather Z-Index Fix** - Weather effects always render correctly (layers 1-4)
- 🏆 **Hall of Champions Polish** - Top 3 display with medals

**Technical Changes:**
- Added OFFER_QUEST, DELIVER_ITEM, CHECK_PROGRESS action types
- Added 3 instruction builder methods to npc-instruction-templates.js
- Added showSpecialEncounter() to people-panel.js
- Added waypoint markers during multi-hop travel
- Added 4 new construction material recipes to crafting system
- Fixed weather z-index permanently (weather: 1-4, UI: 10-30)
- About section fallback when GameConfig unavailable
- All 42 game-flow tests passing
- 519+ bugs verified fixed via 10 parallel agent analysis

### v0.89.97 - The Doom World Update (2025-12-02)

**New Features:**
- 💀 Doom World with economy inversion
- 🚣 Boatman portal with TTS
- 🎯 Quest wayfinder markers
- 📦 Bulk trading (Shift=×5, Ctrl=×25)
- 🏪 Dungeon loot sellOnly system

**Technical Changes:**
- SAVE_SCHEMA validation with migrations
- 13 memory leak fixes with beforeunload handlers
- Z-index permanent fix (layers 1-4 weather, 10-30 UI)
- README restructure to /readmes/ folder

---

```
═══════════════════════════════════════════════════════════════════════
                    🖤 END OF NERD README 🖤

    "If you've read this far, you're one of us now."

    May your builds compile and your bugs be reproducible.

                                    - Unity AI Lab, v0.91.00, 2025
═══════════════════════════════════════════════════════════════════════
```
