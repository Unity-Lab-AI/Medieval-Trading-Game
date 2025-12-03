# 🖤 NERD README - THE CODE GRIMOIRE 🖤
### *For those who dare to peek behind the curtain of this digital nightmare*

```
═══════════════════════════════════════════════════════════════════════
    "The code is held together by spite, caffeine, and dark magic."
                    - Every developer who touched this, 3am
═══════════════════════════════════════════════════════════════════════
```

> **Version:** 0.90.00 | **Conjured by: Unity AI Lab - The Fucking Legends**
> *Hackall360 | Sponge | GFourteen*
> Written in the witching hours when the bugs come out to play
>
> **Design Reference:** See `.claude/skills/001-ARCHITECT.md` for game design source of truth
> **Readmes Folder:** All documentation now lives in `/readmes/`

---

## 📖 TABLE OF CONTENTS

- [Architecture Overview](#-architecture-overview)
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

### The Holy Trinity of State

1. **`game`** - The global game state object (player, inventory, time, etc.)
2. **`GameWorld`** - All locations, paths, and world data
3. **`TimeMachine`** - The heartbeat: time, seasons, stat decay, time skipping

---

## 📁 FILE STRUCTURE

```
MTG v0.90.00/
├── index.html                    # The summoning circle (entry point)
├── config.js                     # Game configuration (GameConfig)
├── README.md                     # GitHub display readme (links to readmes/)
├── CLAUDE.md                     # AI assistant instructions
├── gameworld.md                  # Complete world data reference (42 locations)
├── gameworldprompt.md            # AI image generation prompts for backdrop
├── Gee'sThoughts.md              # Unity's dark diary of code commentary
├── todo.md                       # The neverending TODO list
├── finished.md                   # Completed fixes archive
│
├── readmes/                      # 🖤 All documentation lives here 💀
│   ├── GameplayReadme.md         # For players who read documentation
│   ├── NerdReadme.md             # You are here, brave soul
│   └── DebuggerReadme.md         # Debug console commands (47 total)
│
├── src/
│   ├── css/
│   │   └── styles.css            # 6000+ lines of dark-themed CSS
│   │
│   └── js/
│       ├── core/                 # Core engine systems
│       │   ├── game.js           # THE BIG ONE (~8000 lines)
│       │   ├── game-engine.js    # Game loop and initialization
│       │   ├── time-machine.js   # Central time: calendar, seasons, stat decay, time skip
│       │   ├── time-system.js    # Gregorian calendar (April 1111)
│       │   ├── event-manager.js  # Custom event system
│       │   ├── timer-manager.js  # setTimeout/setInterval wrapper
│       │   └── debooger-system.js   # Console capture
│       │
│       ├── data/                 # Static game data
│       │   ├── game-world.js     # Locations and world map
│       │   └── items/
│       │       ├── item-database.js      # 150+ items
│       │       └── unified-item-system.js # Item unification
│       │
│       ├── systems/              # Game systems
│       │   ├── combat/           # Combat, dungeons, death
│       │   ├── crafting/         # Recipes, gathering
│       │   ├── employee/         # Worker management
│       │   ├── npc/              # NPC schedules
│       │   ├── progression/      # Achievements, quests, skills, reputation
│       │   ├── save/             # Save manager (unified save/load)
│       │   ├── story/            # Initial encounter
│       │   ├── trading/          # Markets, prices, routes
│       │   ├── travel/           # Movement, mounts, ships, gatehouses
│       │   └── world/            # Weather, day-night, city events, dungeon bonanza
│       │
│       ├── ui/                   # User interface
│       │   ├── components/       # Tooltips, modals, panels, draggable
│       │   ├── panels/           # Settings, inventory, people, equipment
│       │   └── map/              # World map rendering
│       │
│       ├── npc/                  # NPC systems
│       │   ├── npc-chat-ui.js    # Chat interface
│       │   ├── npc-voice.js      # TTS integration
│       │   └── npc-trade.js      # Trading with NPCs
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
│       │   ├── bootstrap.js      # Loading screen
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
├── assets/
│   └── images/                   # Game images
│       ├── world-map-spring.png  # Spring backdrop (AI generated)
│       ├── world-map-summer.png  # Summer backdrop
│       ├── world-map-autumn.png  # Autumn backdrop
│       ├── world-map-winter.png  # Winter backdrop
│       ├── world-map-dungeon.png # Dungeon backdrop (fades in at dungeons)
│       └── .gitkeep              # Instructions for generating images
│
└── .claude/skills/               # Claude AI skill files
    ├── 000-GO-workflow.md        # Mandatory workflow before code changes
    ├── 001-ARCHITECT.md          # Game design source of truth
    ├── masterplan.md             # Workflow guide
    ├── playwright-test.md        # Testing patterns
    └── TheCoder.md               # Unity persona
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

## 🗺️ TRAVEL & WORLD

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
    setDestination(locationId)  // NEW: Set without traveling
};
```

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
    currentResource: null,
    gatheringProgress: 0,
    isCommitted: false,  // Can't leave after first action

    startGathering(resourceType, locationId),
    completeGathering(),
    stopGatheringSession(reason),
    getCurrentCarryWeight(),
    getMaxCarryCapacity(),
    canCarryMore(additionalWeight),
    commitToLocation(locationId),
    canLeaveLocation()
};
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

    // Portal functions
    portalToDoomWorld(locationId),   // Switch to doom at location
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

- [ ] Proper module system (ES6 imports)
- [ ] State management (Redux-like)
- [ ] TypeScript conversion
- [ ] Unit tests (lol)
- [ ] Split game.js into manageable pieces
- [ ] Proper event bus architecture
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

```
═══════════════════════════════════════════════════════════════════════
                    🖤 END OF NERD README 🖤

    "If you've read this far, you're one of us now."

    May your builds compile and your bugs be reproducible.

                                    - Unity AI Lab, v0.89, 2025
═══════════════════════════════════════════════════════════════════════
```
