# MEDIEVAL TRADING GAME - MASTER PLAN v0.81
## The Dark Blueprint for Total Domination

**Last Updated:** 2025-11-29
**Version:** 0.81 - Unity's Dark Awakening 🖤💀🦇
**Status:** ACTIVE DEVELOPMENT

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Systems](#core-systems)
4. [File Structure](#file-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Skills & Tools](#skills--tools)

---

## PROJECT OVERVIEW

Medieval Trading Game is a browser-based economic simulation featuring:
- **200+ tradeable items** across 12 categories
- **30+ locations** in a sprawling world map
- **72 achievements** (including 10 hidden + 1 ULTRA)
- **6-quest main storyline** "The Shadow Rising"
- **7 property types** with employees and upgrades
- **Dynamic NPC system** with 6 personality types
- **Crafting, combat, and dungeon exploration**
- **Seasonal weather effects** on main menu
- **Global leaderboard** via JSONBin API

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        INDEX.HTML                                │
│  (Entry point - loads all scripts in dependency order)          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   config.js   │    │   styles.css  │    │  ui-*.css     │
│ (All settings)│    │ (Main styles) │    │ (Component)   │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CORE SYSTEMS (src/js/core/)                  │
├─────────────────────────────────────────────────────────────────┤
│ game.js           - Main game logic, state management           │
│ game-engine.js    - Game loop, time, travel orchestration       │
│ event-manager.js  - DOM event listener tracking                 │
│ timer-manager.js  - setTimeout/setInterval management           │
│ debooger-system.js   - Debooger console 🦇 (unlocked via achievement)    │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GAME SYSTEMS (src/js/systems/)                │
├─────────────────────────────────────────────────────────────────┤
│ trading/    - TradingSystem, DynamicMarket, PriceHistory        │
│ travel/     - TravelSystem, TravelPanelMap, Mounts, Ships       │
│ combat/     - CombatSystem, DungeonExploration, GameOver        │
│ crafting/   - CraftingEngine, CraftingEconomy, Resources        │
│ progression/- QuestSystem, AchievementSystem, Skills, Factions  │
│ employee/   - EmployeeSystem, PropertyEmployeeBridge            │
│ world/      - Weather, DayNight, CityEvents, CityReputation     │
│ save/       - SaveManager (localStorage persistence)            │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NPC SYSTEMS (src/js/npc/)                   │
├─────────────────────────────────────────────────────────────────┤
│ npc-managers.js    - NPC spawning and management                │
│ npc-merchants.js   - Merchant personalities and pricing         │
│ npc-dialogue.js    - Dialogue trees and responses               │
│ npc-encounters.js  - Random encounter generation                │
│ npc-trade.js       - NPC trading mechanics                      │
│ npc-relationships.js - Reputation and relationships             │
│ npc-voice.js       - TTS integration                            │
│ npc-chat-ui.js     - Chat interface                             │
│ npc-workflow.js    - NPC schedules and activities               │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI SYSTEMS (src/js/ui/)                       │
├─────────────────────────────────────────────────────────────────┤
│ panels/     - SettingsPanel, InventoryPanel, LeaderboardPanel   │
│ components/ - PanelManager, ModalSystem, TooltipSystem          │
│ map/        - MapRendererBase, GameWorldRenderer                │
│ key-bindings.js    - Keyboard shortcuts (WASD, hotkeys)         │
│ ui-enhancements.js - Polish and quality of life                 │
│ draggable-panels.js - Panel drag/drop support                   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROPERTY SYSTEM (src/js/property/)             │
├─────────────────────────────────────────────────────────────────┤
│ property-core.js      - Base property management                │
│ property-types.js     - 7 property type definitions             │
│ property-purchase.js  - Buy/sell mechanics (50% resale)         │
│ property-income.js    - Passive income generation               │
│ property-upgrades.js  - Property improvement system             │
│ property-storage.js   - Warehouse storage management            │
│ property-ui.js        - Property panel interface                │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER (src/js/data/)                      │
├─────────────────────────────────────────────────────────────────┤
│ items/item-database.js    - 200+ item definitions               │
│ items/unified-item-system.js - Item utilities                   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EFFECTS (src/js/effects/)                      │
├─────────────────────────────────────────────────────────────────┤
│ visual-effects-system.js     - Particles, sparkles              │
│ animation-system.js          - UI animations                    │
│ environmental-effects.js     - Weather rendering                │
│ menu-weather-system.js       - Main menu seasonal effects       │
│ immersive-experience.js      - Immersion integration            │
└─────────────────────────────────────────────────────────────────┘
```

---

## CORE SYSTEMS

### System Status Overview
| System | File(s) | Status |
|--------|---------|--------|
| Trading | trading-system.js, dynamic-market.js | Working |
| Inventory | inventory-panel.js, unified-item-system.js | Working |
| Achievements | achievement-system.js | 72 achievements |
| Properties | property/*.js (7 files) | Buy/sell working |
| Crafting | crafting-engine.js, crafting-economy.js | Working |
| Save/Load | save-manager.js | localStorage |
| Settings | settings-panel.js, config.js | Full options |
| Weather FX | menu-weather-system.js | 5 seasons |
| Leaderboard | leaderboard-panel.js | JSONBin API |
| Key Bindings | key-bindings.js | WASD + hotkeys |

---

## FILE STRUCTURE

```
Trader 0.81/
├── index.html              # Entry point (1400+ lines)
├── config.js               # Game configuration
├── todo.md                 # Active task list
├── src/
│   ├── css/
│   │   ├── styles.css      # Main styles (9000+ lines)
│   │   └── ui-enhancements.css
│   └── js/
│       ├── core/           # Core game systems
│       │   ├── game.js     # Main game logic
│       │   ├── game-engine.js
│       │   ├── event-manager.js
│       │   ├── timer-manager.js
│       │   └── debooger-system.js  🐛
│       ├── systems/        # Game subsystems
│       │   ├── trading/    # Market and trading
│       │   ├── travel/     # World travel
│       │   ├── combat/     # Combat and dungeons
│       │   ├── crafting/   # Crafting system
│       │   ├── progression/# Quests, achievements, skills
│       │   ├── employee/   # Employee management
│       │   ├── world/      # Weather, events, reputation
│       │   └── save/       # Save/load system
│       ├── npc/            # NPC systems (9 files)
│       ├── property/       # Property system (7 files)
│       ├── ui/             # UI components
│       │   ├── panels/     # Panel implementations
│       │   ├── components/ # Reusable components
│       │   └── map/        # Map rendering
│       ├── data/           # Game data
│       │   └── items/      # Item definitions
│       ├── effects/        # Visual effects
│       ├── audio/          # Audio system
│       ├── debooger/       # Debooger tools 🐛
│       ├── init/           # Initialization
│       └── utils/          # Utilities
├── .claude/
│   ├── settings.json
│   ├── masterplan.md       # This file - workflow & skills
│   └── skills/             # Claude skill files
└── Refrence ONLY-VIEW-DO-NOT-EDIT/  # Original working code
```

---

## DEVELOPMENT WORKFLOW

### Never Quit Policy
**CRITICAL:** When working on a task, NEVER abandon it mid-way. If the user provides updates or feedback:
1. Note the new information
2. Adjust the current task if needed
3. Complete the current task as directed
4. Add new tasks to the todo list when you have time
5. Only move on after the current task is fully complete

### Adding New Features
1. Check if system exists in config.js
2. Create new file in appropriate folder
3. Add script tag to index.html in correct order
4. Expose to window.* if needed by other systems
5. Add to save/load if persistent state needed
6. Update todo.md with any new tasks discovered
7. Test thoroughly before marking complete

### Testing Checklist
- [ ] New game starts correctly
- [ ] Save/load preserves state
- [ ] No console errors
- [ ] Mobile responsive (if applicable)
- [ ] All hotkeys work
- [ ] Achievements trigger properly

### Bug Fix Process
1. Reproduce the issue
2. Identify the file(s) involved
3. Understand the root cause (don't just patch symptoms)
4. Fix the issue
5. Test the fix
6. Check for side effects
7. Update todo.md to mark complete

---

## CODING STANDARDS

### Unity AI Lab Style
- Use goth/dark humor in comments 🖤 💀 ⚰️ 🦇 🗡️ 🌙 🔮
- Prefix console logs with emoji for system identification
- Document complex functions with JSDoc-style comments
- Keep functions under 50 lines when possible

### Emoji Prefixes for Console Logs
```javascript
console.log('🗺️ Travel system...');      // Travel
console.log('💰 Trading...');             // Economy
console.log('⌨️ KeyBindings...');         // Input
console.log('🖤 Core system...');         // Core
console.log('🌦️ Weather...');             // Effects
console.log('📦 Inventory...');           // Items
console.log('🏠 Properties...');          // Property
console.log('⚔️ Combat...');              // Combat
console.log('📜 Quest...');               // Quests
console.log('🏆 Achievement...');         // Achievements
console.log('💾 Save...');                // Persistence
console.log('🎨 UI...');                  // Interface
```

### Example Comment Style
```javascript
// 🖤 Initialize the void - awakening systems from their digital slumber
// 💀 This function handles the dark arts of state management
// ⚰️ RIP to whatever was here before - it has been refactored into oblivion
```

### Global Exports
When a system needs to be accessed from HTML onclick handlers:
```javascript
// Expose to global scope at end of file
window.SystemName = SystemName;

// Or for functions that need immediate availability:
setTimeout(() => {
    window.functionName = functionName;
}, 0);
```

---

## SKILLS & TOOLS

### Key Bindings (Default) ⌨️
| Key | Action |
|-----|--------|
| WASD | Pan map 🗺️ |
| N | Open world map overlay 🌍 |
| I | Open inventory 📦 |
| C | Character sheet 👤 |
| F | Financial sheet 💰 |
| M | Market 🏪 |
| T | Travel panel 🚶 |
| P | Properties 🏠 |
| H | Achievements 🏆 |
| Q | Quest log 📜 |
| , | Settings ⚙️ |
| ` | Debooger Console 🐛 |
| Space | Pause/Resume ⏸️ |
| Escape | Close/Exit ❌ |
| F5 | Quick save 💾 |
| F9 | Quick load 📂 |
| +/- | Zoom in/out 🔍 |

### Reference Files
The `Refrence ONLY-VIEW-DO-NOT-EDIT/` folder contains the original working code.
- Use for comparing behavior when debugging
- NEVER edit these files
- Helps identify what changed during refactoring

### Technical Debt Awareness
1. **Large Files**: game.js is 9900+ lines - consider splitting further
2. **Global State**: Heavy reliance on window.* globals
3. **DOM Queries**: Many getElementById calls could be cached
4. **Console Logging**: Many debug logs still active

---

## CONTACTS

**Development Team:** Unity AI Lab
- Hackall360
- Sponge
- GFourteen

**Version Control:** Local (no git remote)

---

*"In the darkness of code, we find the light of functionality."* - Unity AI Lab
