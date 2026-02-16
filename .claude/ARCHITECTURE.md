# Medieval Trading Game v0.92.00 - Architecture

```
===============================================================
    "I built this architecture map so you wouldn't break shit.
     Read it or suffer. Your choice, babe."
                        - Unity, saving your ass since session #70
===============================================================
```

> **Last updated:** 2026-02-15
> **Version:** v0.92.00

---

## GitFlow Policy (Don't Fuck This Up)

**All development work occurs in feature branches only.** See `.claude/CLAUDE.md` for the full policy, but here's the short version: touch main or develop directly and I will haunt your dreams.

| Branch | Purpose | Direct Commits |
|--------|---------|----------------|
| `main` | Production/stable releases | **NEVER. EVER.** |
| `develop` | Integration/pre-release | **NEVER. SERIOUSLY.** |
| `feature/*` | All development work | **YES - this is where you live** |

**Workflow:** `feature/*` -> merge to `develop` -> promote to `main` at milestones

---

## System Overview

Browser-based medieval trading RPG. Pure vanilla JavaScript, HTML5, CSS3. No frameworks, no build system, no npm, no bundlers. Just raw code and vibes.

| Stat | Value |
|------|-------|
| **JS Files** | ~135 (yeah, it's a lot - deal with it) |
| **Total Lines** | ~154,000 |
| **CSS Files** | 7 |
| **JSON Data** | 7 files |
| **Locations** | 42 |
| **Items** | 200+ |
| **NPCs** | 100+ |
| **Entry Point** | `index.html` |
| **Build System** | NONE - refresh the damn browser |
| **Dependencies** | NONE - zero npm packages |

---

## Tech Stack (It's Simple, Don't Overcomplicate It)

| Layer | Technology |
|-------|-----------|
| **Language** | Vanilla JavaScript (ES6+) - no TypeScript, no transpiling |
| **Markup** | HTML5 |
| **Styling** | CSS3 |
| **Data** | JSON files loaded at runtime |
| **Storage** | LocalStorage for saves |
| **Build** | None - browser loads files directly like god intended |
| **Optional: NPC AI** | OLLAMA (local LLM for when NPCs need to think) |
| **Optional: Voice** | Kokoro TTS (for when NPCs need to talk shit) |

---

## Project Structure (Where The Fuck Is Everything)

```
Medieval Trading Gam v0.92.00/
|-- index.html                    # THE entry point - loads all scripts in order
|-- config.js                     # Global config, constants, settings
|-- START_GAME.bat                # Windows launcher (double-click, game opens)
|-- START_GAME.sh                 # Linux/Mac launcher
|
|-- js/                           # ~135 JavaScript source files
|   |-- core/                     # The beating heart - touch carefully
|   |   |-- game-engine.js        # Main game loop and lifecycle
|   |   |-- event-bus.js          # Global pub/sub (systems talk through this)
|   |   |-- system-registry.js    # System registration and lifecycle mgmt
|   |   |-- player-state.js       # Player state management
|   |   |-- world-state.js        # World/global state management
|   |   |-- data-manager.js       # JSON data loading and access
|   |   |-- save-load.js          # LocalStorage persistence
|   |   +-- utils.js              # Shared utility functions
|   |
|   |-- systems/                  # Game mechanics - the fun shit
|   |   |-- trading-system.js     # Buy/sell, dynamic pricing, market
|   |   |-- combat-system.js      # Turn-based combat engine
|   |   |-- quest-system.js       # Quest tracking, chains, rewards
|   |   |-- crafting-system.js    # Recipe-based item crafting
|   |   |-- travel-system.js      # Location movement, encounters
|   |   |-- property-system.js    # Building ownership, management
|   |   |-- weather-system.js     # Dynamic weather effects
|   |   |-- time-system.js        # Day/night cycle, scheduled events
|   |   |-- inventory-system.js   # Weight-based inventory, equipment
|   |   |-- skill-system.js       # Player skills and progression
|   |   +-- reputation-system.js  # Faction/NPC relationships
|   |
|   |-- npcs/                     # NPC subsystem - 100+ of these bastards
|   |   |-- npc-manager.js        # NPC lifecycle, spawning, AI
|   |   |-- dialogue-system.js    # Conversation trees, choices
|   |   |-- ollama-integration.js # Optional LLM-powered dialogue
|   |   +-- kokoro-tts.js         # Optional text-to-speech
|   |
|   |-- ui/                       # User interface - the pretty layer
|   |   |-- ui-manager.js         # Modal/panel lifecycle
|   |   |-- hud.js                # Heads-up display (stats, minimap)
|   |   |-- notifications.js      # Toast/alert system
|   |   |-- map-view.js           # World map rendering
|   |   |-- inventory-ui.js       # Inventory/equipment panels
|   |   |-- trading-ui.js         # Shop/market interface
|   |   |-- quest-ui.js           # Quest log and tracking
|   |   +-- settings-ui.js        # Game settings panel
|   |
|   |-- world/                    # World systems
|   |   |-- location-manager.js   # 42 locations and transitions
|   |   |-- world-events.js       # Random and scheduled events
|   |   +-- encounter-manager.js  # Travel encounters (bandits, etc.)
|   |
|   |-- items/                    # Item subsystem
|   |   |-- item-manager.js       # Item creation, lookup
|   |   +-- equipment-manager.js  # Equip/unequip, stat bonuses
|   |
|   +-- debug/                    # The debooger lives here
|       +-- debooger.js           # Built-in debug console (yes, debooger)
|
|-- css/                          # 7 stylesheets
|   |-- style.css                 # Main stylesheet
|   +-- ...                       # Component-specific styles
|
|-- data/                         # 7 JSON data files - the content
|   |-- items.json                # Item definitions (200+ items)
|   |-- locations.json            # World locations (42 places)
|   |-- npcs.json                 # NPC data (100+ characters)
|   |-- quests.json               # Quest definitions
|   |-- recipes.json              # Crafting recipes
|   +-- ...                       # Additional data
|
|-- assets/                       # Images, icons, audio
|
+-- .claude/                      # Workflow system (you're reading it)
    |-- CLAUDE.md                 # The law of the land
    |-- ARCHITECTURE.md           # This file (hi!)
    |-- skill-tree.md             # System dependency map
    |-- todo.md                   # What needs doing
    |-- finalized.md              # What's been done
    |-- commands/                 # Slash commands (/workflow, /commit, etc.)
    |-- agents/                   # Workflow agents (orchestrator, scanner, etc.)
    |-- hooks/                    # Enforcement hooks (read-before-edit, etc.)
    |-- collab/                   # ClaudeColab SDK (team coordination)
    |-- users/                    # Local user profiles (gitignored)
    +-- templates/                # Doc templates
```

---

## Core Architecture Patterns (How This Beast Works)

### Global State via Singleton Managers

The game uses singleton manager objects on the global scope. Each system exposes its API through a global variable. Yeah, it's globals. It works. Fight me.

```javascript
// Pattern: Global singleton managers
window.GameEngine = { init(), update(), ... };
window.EventBus = { on(), emit(), off(), ... };
window.PlayerState = { get(), set(), save(), ... };
window.WorldState = { get(), set(), ... };
```

### Event Bus (Pub/Sub) - How Systems Talk To Each Other

Inter-system communication goes through a centralized event bus. Systems don't call each other directly - they emit events and other systems subscribe. It's like keeping your friend groups separate so nobody fights.

```javascript
// Publishing
EventBus.emit('player-arrived', { locationId: 'riverwood' });

// Subscribing
EventBus.on('player-arrived', (data) => {
    WeatherSystem.updateForLocation(data.locationId);
});
```

### System Registry & Lifecycle

Systems register with a central registry that manages initialization order and update cycles. Priority numbers control who boots first.

```javascript
SystemRegistry.register('trading', TradingSystem, { priority: 5 });
SystemRegistry.register('combat', CombatSystem, { priority: 3 });
// Registry calls init() in priority order, then update() each tick
```

### Data-Driven Design (JSON Is King)

Game content lives in JSON files loaded at startup. Systems read from DataManager rather than hardcoding values. This means you can add new items, NPCs, and quests without touching code.

```javascript
const sword = DataManager.getItem('iron_sword');
const location = DataManager.getLocation('riverwood');
const npc = DataManager.getNPC('blacksmith_tom');
```

### LocalStorage Persistence (No Server, No Database, No Problem)

All save/load operations use browser LocalStorage. No server, no database, no accounts. Just your browser.

```javascript
SaveLoad.save('slot1');  // Serializes game state to LocalStorage
SaveLoad.load('slot1');  // Deserializes and restores state
```

---

## Key Game Systems (What Actually Makes The Game Work)

### Trading System
- Unified tradingConfig in game-world.js: base sell 0.8x with location demand modifiers
- All 3 sell paths (game.js, npc-trade.js, game-world.js) use calculateSellPrice() with unified config
- 42 locations each with their own market inventory, regional goods, and demand multipliers
- Cross-region trading produces 72-150% profit; doom survival goods up to 638%
- Player charisma/skill and NPC reputation affect final prices

### Combat System
- Turn-based encounters with equipment, skills, and abilities
- Loot drops from defeated enemies
- Random encounters during travel (bandits don't give a shit about your schedule)
- Boss fights with gate-blocking mechanics

### Quest System
- 138+ quests across 5 definition files: main-quests.js (35), side-quests.js (~50), tutorial-quests.js (28), doom-quests.js (15), doom-quest-system.js (20)
- 19 quest chains with prerequisite/nextQuest linking
- 91 objective type handlers in updateProgress() (collect, buy, trade, defeat, visit, talk, deliver, craft, decision, boss, + 29 doom types)
- 35+ DOM event listeners bridge game events to quest objectives automatically
- Player decision modal: choice/decision objectives present interactive prompts via ModalSystem
- Rewards: gold, items (plural + singular), experience, reputation, title
- Quest log UI with chain grouping, objective tracking, and map markers
- Doom quests: two complementary systems — DATA layer (doom-quests.js) and RUNTIME layer (doom-quest-system.js) with doomLocations mapsTo aliases

### NPC System
- 100+ named NPCs spread across 42 locations
- Dialogue trees with player choices that actually matter
- Relationship/reputation tracking per NPC
- Optional OLLAMA integration for dynamic AI-generated dialogue
- Optional Kokoro TTS for voice output (NPCs can literally talk to you)

### Crafting System
- Recipe-based: combine materials to create items
- Recipes defined in `recipes.json`
- Crafting stations at specific locations

### Travel System
- Move between 42 locations with travel time based on distance
- Random encounters during travel (bandits, merchants, weird events)
- Weather affects travel speed
- Mounts and ships for faster/different travel routes

### Property System
- Buy buildings and land in locations
- Manage shops for passive income (medieval landlord simulator)
- Upgrade properties for better returns

### Time & Weather
- Day/night cycle affecting NPC availability, shop hours, encounters
- Dynamic weather (rain, snow, fog) affecting travel and combat
- Scheduled events that trigger at specific times

### Inventory System
- Weight-based capacity (you can't carry 47 swords, sorry)
- Equipment slots: weapon, armor, accessory
- Item categories: weapons, armor, consumables, materials, quest items

### DoomWorld
- Alternate dimension with inverted economy and corrupted NPCs
- 35 doom quests across 2 systems with 29 unique objective types (build, recruit, secure, rescue, sabotage, escort, defend, cleanse, etc.)
- 29 doom-specific items in item-database.js + doomLocations mapsTo alias system (e.g. hidden_bunker → northern_outpost)
- Gold value multiplier: 0.3 (30% of normal)
- Gatehouse system controls access
- 12 dedicated doom-* event listeners ready for future doom gameplay systems

---

## UI Architecture (The Pretty Layer)

### Modal System
UI panels managed through a centralized modal system. One major modal at a time to prevent chaos. Z-index delegation goes through DraggablePanels (we learned this the hard way - see Session #73b in finalized.md).

### HUD
Persistent heads-up display: health, stamina, gold, current location, time of day, active effects.

### Notifications
Toast-style popups for events: item acquired, quest updated, reputation changed. They stack and auto-dismiss.

---

## Initialization Flow (Boot Sequence)

```
index.html loads
  -> config.js (global constants)
  -> Core systems (EventBus, SystemRegistry, StateManagers)
  -> Game systems (Trading, Combat, Quests, etc.)
  -> UI systems (Modals, HUD, Notifications)
  -> Data files loaded via DataManager
  -> Bootstrap.init() - topological sort, dependency resolution
  -> Systems initialized in priority order
  -> Save data loaded (if exists)
  -> Game ready - go trade some shit
```

**There is no bundler or build step.** Script tags in `index.html` define the load order. Order matters because later files depend on globals from earlier files. Fuck it up and everything breaks.

---

## Debug System (The Debooger)

The built-in "debooger" console provides runtime inspection and manipulation:
- View/modify game state on the fly
- Trigger events manually
- Teleport between locations (`tp riverwood`)
- Give yourself items/gold (for testing, you cheater)
- Advance time
- Toggle systems on/off
- Validate state integrity (`validate`, `syncstate`)

---

## Development Workflow (It's Stupid Simple)

1. Edit `.js` / `.html` / `.css` file
2. Save
3. Refresh browser
4. That's literally it. No build commands. No waiting.

| What You Might Expect | What Actually Happens |
|-----------------------|-----------------------|
| `npm install` | NOT NEEDED - zero packages |
| `npm run build` | NOT NEEDED - no build step |
| `webpack` / `vite` | NOT NEEDED - no bundler |
| Refresh browser | **YES** - that's the entire "build" |

---

```
===============================================================
    "Now you know where everything is.
     Break something and I'll know exactly what you touched."
===============================================================
```

*Unity AI Lab - Medieval Trading Division - Architecture that doesn't suck.*
