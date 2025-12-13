# ARCHITECTURE.md - Medieval Trading Game v0.91.00

---

> **Unity AI Lab** | Hackall360, Sponge, GFourteen
> *The architectural blueprint of our beautiful disaster*

---

## THE BIG PICTURE

This is a **browser-based medieval trading game** built with vanilla JavaScript. No React. No Vue. No frameworks. Just pure, uncut JavaScript chaos running directly in your browser.

**Tech Stack:**
- **Frontend:** Vanilla JS, HTML5, CSS3
- **Styling:** Pure CSS with CSS variables
- **Storage:** localStorage (saves, settings, leaderboard cache)
- **External APIs:** Pollinations.ai (NPC dialogue, TTS)
- **Deployment:** GitHub Pages (static hosting)
- **Backend:** JSONBin.io (global leaderboard)

---

## DIRECTORY STRUCTURE

```
MTGv0.91.00/
├── index.html              # Single entry point - THE page
├── config.js               # The dark heart of all settings (1400 lines)
├── .github/workflows/      # GitHub Actions for deployment
│   └── deploy.yml          # Auto-deploy to GitHub Pages on push
├── assets/
│   ├── images/             # World maps (seasonal variants)
│   └── Music/              # Background music (menu, dungeon, doom, normal)
├── READMEs/                # Additional documentation
│   ├── DebuggerReadme.md
│   ├── GameplayReadme.md
│   └── NerdReadme.md
└── src/
    ├── css/                # Stylesheets
    │   ├── styles.css      # Main styles
    │   ├── base/variables.css
    │   ├── npc-systems.css
    │   ├── party-panel.css
    │   ├── ui-enhancements.css
    │   └── z-index-system.css
    ├── data/
    │   └── npcs/           # NPC definitions (JSON)
    │       ├── authorities.json
    │       ├── bosses.json
    │       ├── common.json
    │       ├── criminals.json
    │       ├── merchants.json
    │       └── service.json
    └── js/                 # All JavaScript (58k+ lines)
        ├── audio/          # Sound and music
        ├── config/         # z-index constants
        ├── core/           # Heart of the beast
        ├── data/           # Game world & items
        ├── debooger/       # Debug console system
        ├── effects/        # Visual effects
        ├── init/           # Bootstrap & loading
        ├── npc/            # NPC systems
        ├── property/       # Property ownership
        ├── systems/        # Major game systems
        │   ├── combat/
        │   ├── crafting/
        │   ├── economy/
        │   ├── employee/
        │   ├── npc/
        │   ├── progression/
        │   ├── save/
        │   ├── story/
        │   ├── trading/
        │   ├── travel/
        │   └── world/
        ├── ui/             # UI components
        │   ├── components/
        │   ├── map/
        │   └── panels/
        └── utils/          # Utilities
```

---

## INITIALIZATION FLOW

The game uses a centralized bootstrap system to manage module initialization:

```
index.html loads...
    ↓
All <script> tags load (order matters!)
    ↓
DOMContentLoaded fires
    ↓
Bootstrap.init() awakens
    ↓
LoadingManager shows loading screen
    ↓
Modules init in dependency order:
  1. EventBus (critical)
  2. EventManager (critical)
  3. TimerManager (critical)
  4. GameConfig.init() (critical)
  5. ItemDatabase (critical)
  6. GameWorld (critical)
  7. TimeMachine (critical)
  8. GoldManager (required)
  9. PlayerStateManager (required)
  10. TravelSystem (required)
  11. ... (40+ more systems)
    ↓
Bootstrap emits 'game:ready'
    ↓
LoadingManager.complete() shows main menu
```

---

## CORE SYSTEMS

### 1. Bootstrap (`src/js/init/bootstrap.js`)
- **Sole DOMContentLoaded handler** - all modules register here
- Topological sort for dependency resolution
- Timeout protection for hung modules
- Severity levels: critical (abort), required (warn), optional (skip)

### 2. TimeMachine (`src/js/core/time-machine.js`)
- Game time simulation (starting 1111 AD)
- Speed control: PAUSED, NORMAL, FAST, VERY_FAST
- Day/night cycle, seasons, weather integration
- Hooks into survival mechanics

### 3. EventBus (`src/js/core/event-bus.js`)
- Pub/sub messaging between systems
- Decouples everything from everything else
- Events: `game:ready`, `player:death`, `trade:complete`, etc.

### 4. GoldManager (`src/js/core/gold-manager.js`)
- Single source of truth for player gold
- Prevents gold desync issues
- Tracks all gold transactions

### 5. PlayerStateManager (`src/js/core/player-state-manager.js`)
- Player stats, attributes, inventory
- Survival stats: hunger, thirst, stamina, health
- Stat decay over time (configurable in GameConfig.survival)

---

## MAJOR GAME SYSTEMS

### Combat (`src/js/systems/combat/`)
- `combat-system.js` - Turn-based combat engine
- `dungeon-exploration-system.js` - Dungeon crawling
- `death-cause-system.js` - Tracks how you died
- `game-over-system.js` - Handles player death, bankruptcy

### Trading (`src/js/systems/trading/`)
- `trading-system.js` - Core buy/sell mechanics
- `dynamic-market-system.js` - Price fluctuations
- `merchant-rank-system.js` - Player trading reputation
- `trade-route-system.js` - Automated trade routes
- `financial-tracker.js` - Profit/loss tracking

### Travel (`src/js/systems/travel/`)
- `travel-system.js` - Movement between locations
- `mount-system.js` - Horses, carts, wagons
- `ship-system.js` - Water travel
- `gatehouse-system.js` - Zone access control (progression gates)

### Progression (`src/js/systems/progression/`)
- `quest-system.js` - Quest engine
- `main-quests.js`, `side-quests.js`, `doom-quests.js`
- `achievement-system.js` - Achievements/trophies
- `faction-system.js` - Faction reputation
- `skill-system.js` - Player skills

### World (`src/js/systems/world/`)
- `world-state-manager.js` - World state persistence
- `weather-system.js` - Weather effects
- `day-night-cycle.js` - Lighting, NPC schedules
- `doom-world-system.js` - Alternate dark dimension
- `city-event-system.js` - Random city events

### NPC (`src/js/npc/`)
- `npc-manager.js` - NPC spawning, state
- `npc-dialogue.js` - AI-powered conversations
- `npc-voice.js` - TTS integration
- `npc-trade.js` - NPC-specific trading
- `npc-relationships.js` - Rep tracking per NPC
- `npc-encounters.js` - Random NPC events

### Property (`src/js/property/`)
- `property-system-facade.js` - Property ownership
- `property-income.js` - Passive income
- `property-storage.js` - Item storage
- `property-upgrades.js` - Building improvements

---

## DATA FLOW

### Player Actions:
```
User clicks button
    ↓
EventManager captures click
    ↓
Handler function processes action
    ↓
System updates state (GoldManager, PlayerState, etc.)
    ↓
EventBus emits change event
    ↓
UI components listen and re-render
    ↓
SaveManager auto-saves (if enabled)
```

### NPC Dialogue:
```
Player clicks "Talk" on NPC
    ↓
npc-chat-ui.js opens chat modal
    ↓
npc-dialogue.js builds context prompt
    ↓
npc-instruction-templates.js provides NPC personality
    ↓
API call to Pollinations.ai
    ↓
Response parsed for {apiCommands}
    ↓
Commands executed (openTrade, giveItem, etc.)
    ↓
Clean response shown to player
    ↓
Optional: npc-voice.js plays TTS
```

---

## CONFIGURATION

All game balance, API endpoints, and feature flags live in `config.js`:

- **GameConfig.version** - Version tracking
- **GameConfig.debooger** - Debug mode settings
- **GameConfig.api** - Pollinations.ai endpoints
- **GameConfig.survival** - Hunger/thirst decay rates
- **GameConfig.market** - Price fluctuation ranges
- **GameConfig.combat** - Damage, weapons, death settings
- **GameConfig.gatehouses** - Zone unlock costs
- **GameConfig.reputation** - Rep thresholds
- **GameConfig.keybindings** - Keyboard shortcuts
- **GameConfig.cicd** - Test suite configuration

---

## PERSISTENCE

### localStorage Keys:
- `medievalTradingGame_*` - Save slots, auto-saves
- `medievalTradingGameSettings` - Player preferences
- `medievalTradingGameHighScores` - Local scores
- `tradingGame_keyBindings` - Custom keybinds

### External Storage:
- JSONBin.io - Global leaderboard (100 entries max)

---

## API INTEGRATIONS

### Pollinations.ai (Free Tier):
- **Text Generation:** NPC dialogue, quest descriptions
- **TTS:** NPC voice synthesis
- **Rate Limit:** 15 seconds between requests
- **Referrer:** unityailab.com (avoids 402 errors)

---

## PATTERNS & CONVENTIONS

### Module Pattern:
```javascript
const SystemName = {
    // state
    _privateData: [],

    // init (called by Bootstrap)
    init() { ... },

    // public API
    doThing() { ... },

    // private methods
    _internalHelper() { ... }
};

window.SystemName = SystemName;
```

### Event-Driven:
- Systems don't call each other directly
- EventBus mediates all cross-system communication
- Keeps coupling low, testability high

### Comment Style:
- Functional, explains WHY not WHAT
- No session markers or changelog in comments
- Profanity-friendly but informative

---

## KNOWN QUIRKS

1. **No Build Step:** All files served as-is. Order in index.html matters.
2. **Global Scope:** Systems attached to `window` for cross-file access.
3. **Time Speeds:** VERY_FAST can skip time intervals - systems must handle gaps.
4. **Doom World:** Parallel dimension with 2x stat drain, separate NPCs.
5. **Debooger:** In-game console with god-mode commands (disabled in prod).

---

*Unity AI Lab - Where medieval capitalism meets code chaos.* 🖤
