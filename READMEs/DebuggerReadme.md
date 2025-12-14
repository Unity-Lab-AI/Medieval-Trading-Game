# 🖤 DEBOOGER README - The Secret Arts of Game Manipulation 🖤🐛
## Medieval Trading Game - Debooger Console Documentation

**Version:** 0.91.04 - Ollama AI Integration
**Last Updated:** 2025-12-13
**Access:** Click the 🐛 Debooger button (bottom-right) OR set `GameConfig.debooger.enabled = true`
**Total Commands:** 55+

> *"In the darkness of code, we inject our forbidden commands..."* 🖤💀🦇

---

> *"Every developer needs a backdoor. This is yours."* - Unity AI Lab

---

## COMPLETE COMMAND LIST (A-Z)

All 55 debug commands in alphabetical order:

| # | Command | Description |
|---|---------|-------------|
| 1 | `advancetime <hours>` | Advance time by hours |
| 2 | `autumn` | Jump to start of Autumn (September 1) |
| 3 | `bonanzastatus` | Check if Dungeon Bonanza (July 18th) event is active |
| 4 | `clear` | Clear the debug console |
| 5 | `clearinventory` | Clear player inventory |
| 6 | `clearleaderboard` | Clear all entries from the Hall of Champions |
| 7 | `debugstate` | Show state manager values (PlayerState, WorldState, UIState) |
| 8 | `doom` | ☄️ Trigger apocalypse: weather, dungeon backdrop, bonanza for 1 day |
| 9 | `dungeonmode [on/off]` | Toggle dungeon backdrop manually |
| 10 | `encounter [type]` | Spawn random encounter |
| 11 | `exitdoom` | Exit doom world and return to normal world |
| 12 | `gamestate` | Show current game state |
| 13 | `geecashnow` | Add 1000 gold (respects carry weight) |
| 14 | `givegold <amount>` | Add gold to player |
| 15 | `giveitem <itemId> [qty]` | Add item to inventory |
| 16 | `giveproperty <type>` | Give property to player |
| 17 | `heal` | Fully heal player |
| 18 | `help` | Show all available commands |
| 19 | `hidemap` | Reset map to only show visited locations |
| 20 | `listachievements` | List all achievements |
| 21 | `listitems` | List all item IDs |
| 22 | `listlocations` | List all locations |
| 23 | `listnpctypes` | List all NPC encounter types |
| 24 | `merchant` | Spawn merchant encounter |
| 25 | `refreshleaderboard` | Force refresh Hall of Champions display |
| 26 | `reload` | Reload the game |
| 27 | `resetachievements` | Reset all achievements |
| 28 | `revealmap` | Reveal entire world map (all 42 locations) |
| 29 | `setgold <amount>` | Set gold to exact amount |
| 30 | `setseason <season>` | Jump to specific season (spring/summer/autumn/winter) |
| 31 | `setstat <stat> <value>` | Set player stat value |
| 32 | `showgold` | Show gold from all sources |
| 33 | `showleaderboard` | Show all leaderboard entries in console |
| 34 | `showtime` | Show current time and season info |
| 35 | `skipday` | Skip forward 1 day (preserves stats) |
| 36 | `skipdays <n>` | Skip forward N days (preserves stats) |
| 37 | `skipmonth` | Skip forward 1 month (preserves stats) |
| 38 | `skipmonths <n>` | Skip forward N months (preserves stats) |
| 39 | `skip6months` | Skip forward 6 months (preserves stats) |
| 40 | `smuggler` | Spawn smuggler encounter (rare items) |
| 41 | `spring` | Jump to start of Spring (March 1) |
| 42 | `summer` | Jump to start of Summer (June 1) |
| 43 | `syncstate` | Force sync state managers with legacy game object |
| 44 | `teleport <locationId>` | Teleport to location (alias: `tp`) |
| 45 | `testachievement` | Test achievement popup (unlocks 3 random) |
| 46 | `tp <locationId>` | Teleport to location (shortcut) |
| 47 | `trackchanges [on/off]` | Enable/disable state change tracking |
| 48 | `trader` | Spawn random trader encounter |
| 49 | `triggerbonanza` | Set date to July 18th to activate Dungeon Bonanza |
| 50 | `unlockachievement <id>` | Unlock specific achievement |
| 51 | `unlockall` | Unlock ALL achievements (triggers Super Hacker!) |
| 52 | `validate` | Validate state consistency between managers and game.* |
| 53 | `verifyeconomy` | Verify circular economy chains |
| 54 | `weather <type>` | Change weather (clear, rain, storm, fog, snow, apocalypse) |
| 55 | `winter` | Jump to start of Winter (December 1) |

---

## TABLE OF CONTENTS

1. [Complete Command List](#complete-command-list-a-z)
2. [Unlocking the Debooger Console](#unlocking-the-debooger-console) 🐛
3. [Opening the Console](#opening-the-console) 🔮
4. [Gold & Economy Commands](#gold--economy-commands) 💰
5. [Travel & Location Commands](#travel--location-commands) 🗺️
6. [Time Commands](#time-commands) ⏰
7. [State Manager Debug Commands](#state-manager-debug-commands) 🔧 **(NEW v0.91)**
8. [Achievement Commands](#achievement-commands) 🏆
9. [Leaderboard Commands](#leaderboard-commands) 👑
10. [Item & Inventory Commands](#item--inventory-commands) 📦
11. [NPC & Encounter Commands](#npc--encounter-commands) 👥
12. [Player Stats Commands](#player-stats-commands) 💀
13. [System Commands](#system-commands) ⚙️
14. [Easter Eggs](#easter-eggs) 🦇

---

## UNLOCKING THE DEBOOGER CONSOLE 🐛🔮

The debooger console can be accessed in several ways:

### Method 1: Config File (Developer Mode) 💀
Set `debooger.enabled: true` in `config.js` (root folder). This enables all debooger commands without needing any achievements.

### Method 2: Achievement Unlock (Legitimate) 🏆
Earn the **"Super Hacker"** ULTRA achievement by unlocking ALL other achievements (including the 11 hidden ones). This permanently unlocks debooger mode for that save.

### Method 3: Direct Button Access 🐛
The **🐛 Debooger** button in the bottom-right corner of the screen always opens the console panel. Commands will only execute if debooger is enabled (via config or achievement).

---

## OPENING THE CONSOLE 🔮🖤

Click the **🐛 Debooger** button in the bottom-right corner of the screen. This works on both the main menu and in-game.

The console appears as a green-bordered panel with:
- **Header** - "🐛 DEBOOGER CONSOLE" title and Close button
- **Output log** - Shows console messages with timestamps (green=log, yellow=warn, red=error)
- **Command input** - Type commands here, press Enter to execute
- **Run button** - Alternative to pressing Enter
- **? button** - Shows help

**Features:**
- Auto-scroll to most recent output 📜
- Max 500 entries before cleanup 🧹
- Tab key for autocomplete ⌨️
- Up/Down arrows for command history 🔄

---

## GOLD & ECONOMY COMMANDS

### geecashnow
The classic cheat code. Adds 1000 gold (respects carry weight).
```
> geecashnow
💰 Added 1000 gold! Total: 1100
```

### givegold <amount>
Adds gold to player inventory.
```
> givegold 500
💰 Added 500 gold! Total: 1500
```

### setgold <amount>
Sets your gold to an exact amount.
```
> setgold 10000
💰 Gold set to 10000
```

### showgold
Shows gold from all sources (inventory, bank, properties).
```
> showgold
💰 Gold Summary:
  Inventory: 1,500
  Bank: 5,000
  Total: 6,500
```

### giveproperty <type>
Gives a property to the player.
```
> giveproperty warehouse
🏠 Property added: Warehouse
```

### verifyeconomy
Verifies circular economy chains are functioning.
```
> verifyeconomy
✅ Economy verification complete
```

---

## TRAVEL & LOCATION COMMANDS

### teleport <location_id>
Instantly travel to any location without time passing or stamina cost.
```
> teleport capital
🗺️ Teleported to The Royal Capital

> teleport greendale
🗺️ Teleported to Greendale Village
```

**Valid Location IDs:**
- `capital` - The Royal Capital
- `greendale` - Greendale Village
- `ironhaven` - Ironhaven Fortress
- `jade_harbor` - Jade Harbor
- `mistwood` - Mistwood Forest
- `dragons_peak` - Dragon's Peak
- `frozen_north` - Frozen North
- And 20+ more (use `listlocations` to see all)

### listlocations
Lists all available location IDs.
```
> listlocations
📍 Available locations:
  - capital (The Royal Capital)
  - greendale (Greendale Village)
  - ironhaven (Ironhaven Fortress)
  ...
```

### revealmap
Reveals the entire world map by marking all 42 locations as visited. Lifts the fog of war completely.
```
> revealmap
🗺️ Revealed 42 locations in GameWorld
🗺️ Map re-rendered with all locations visible
🗺️ The fog of war has been lifted! All locations revealed.
```

### hidemap
Resets map visibility to only show visited locations. Essentially undoes `revealmap`.
```
> hidemap
🗺️ Map reset to starting visibility
🗺️ The fog of war returns... only visited locations visible.
```

---

## TIME COMMANDS

### advancetime <hours>
Advances game time by specified hours. **Note:** Stats will decay normally during time advance.
```
> advancetime 24
⏰ Advanced time by 24 hours. It's now Day 2, 08:00

> advancetime 168
⏰ Advanced time by 168 hours. It's now Day 8, 08:00
```

### skipday
Skip forward 1 day while **preserving player stats** (hunger, thirst, health stay the same).
```
> skipday
⏰ Skipped 1 day. Now: April 2, 1111 - 08:00
```

### skipdays <n>
Skip forward N days while preserving stats.
```
> skipdays 7
⏰ Skipped 7 days. Now: April 8, 1111 - 08:00

> skipdays 30
⏰ Skipped 30 days. Now: May 1, 1111 - 08:00
```

### skipmonth
Skip forward 1 month while preserving stats. Triggers season change if applicable.
```
> skipmonth
⏰ Skipped 1 month. Now: May 1, 1111 - 08:00
🍂 Season changed to Spring!
```

### skipmonths <n>
Skip forward N months while preserving stats.
```
> skipmonths 3
⏰ Skipped 3 months. Now: July 1, 1111 - 08:00
☀️ Season changed to Summer!
```

### skip6months
Shortcut to skip 6 months while preserving stats. Great for testing seasonal changes.
```
> skip6months
⏰ Skipped 6 months. Now: October 1, 1111 - 08:00
🍂 Season changed to Autumn!
```

### setseason <season>
Jump directly to a specific season (spring, summer, autumn, winter). Advances time to the appropriate month.
```
> setseason winter
❄️ Season set to Winter! Now: January 1, 1112 - 08:00

> setseason summer
☀️ Season set to Summer! Now: July 1, 1112 - 08:00
```
**Valid seasons:** spring, summer, autumn, winter

### showtime
Display current time, date, and season information.
```
> showtime
⏰ Current Time: April 15, 1111 - 14:30
🌸 Season: Spring
📅 Day 15 of Year 1111
```

---

## DUNGEON BONANZA COMMANDS

*"The Dark Convergence - when the veil between worlds thins..."*

### triggerbonanza
Sets the game date to July 18th to activate the Dungeon Bonanza event immediately.
```
> triggerbonanza
💀 Date set to July 18th - The Dark Convergence begins!
```

### bonanzastatus
Check if the Dungeon Bonanza event is currently active.
```
> bonanzastatus
💀 THE DARK CONVERGENCE IS ACTIVE!
   Dungeon travel: 30 min | Cooldowns: REMOVED
```

### dungeonmode [on/off]
Manually toggle the dungeon backdrop without traveling to a dungeon.
```
> dungeonmode on
Dungeon backdrop enabled

> dungeonmode off
Dungeon backdrop disabled
```

**What is Dungeon Bonanza?**

Every July 18th, "The Dark Convergence" occurs:
- **30-minute dungeon travel** - All travel to dungeons/caves/ruins/mines takes only 30 minutes
- **No cooldowns** - Dungeon exploration cooldowns are completely removed
- **Boss rush day** - Perfect for completing the 50 boss kills achievement in one day!

---

## WEATHER COMMANDS

### weather <type>
Change the current weather to any type.
```
> weather apocalypse
☄️ Changed weather to apocalypse

> weather clear
🌤️ Changed weather to clear

> weather storm
⛈️ Changed weather to storm
```

**Valid weather types:**
- `clear` - Clear skies
- `cloudy` - Overcast
- `rain` - Rainfall
- `storm` - Thunderstorm with lightning
- `fog` - Dense fog
- `snow` - Snowfall
- `blizzard` - Heavy snow
- `apocalypse` - ☄️ Meteors, red sky, lightning (The Dark Convergence)

### doom
The ultimate chaos command! Triggers:
1. **Apocalypse weather** - Meteors, red pulsing sky, embers, lightning
2. **Dungeon world backdrop** - Fades to the dungeon map
3. **Dungeon Bonanza** - 30-min travel, no cooldowns for one game day
4. **Portal to Doom World** - Teleports player to doom dimension
5. **Zone bypass** - All gatehouse/zone restrictions disabled

Works on both main menu AND in-game!
```
> doom
☄️ DOOM ACTIVATED! Menu weather: apocalypse | Game weather: apocalypse | Dungeon backdrop: active | Bonanza: active for 1 day
```

**Doom World Features (Session #57 Fixes):**
- Corrupted location names display on map (e.g., "Destroyed Royal Capital")
- Zone locks completely bypassed (no gatehouse fees in apocalypse)
- Separate discovery tracking from normal world
- Death only triggers game over once (no death spam)

### Season Shortcuts
Quick commands to jump to season start:
```
> spring    → Jump to March 1st (Spring)
> summer    → Jump to June 1st (Summer)
> autumn    → Jump to September 1st (Autumn)
> winter    → Jump to December 1st (Winter)
```

---

## STATE MANAGER DEBUG COMMANDS 🔧

*"When you need to peek under the hood of the new architecture..."*

These commands help debug the state management system added in v0.91.

### validate
Validates state consistency between the new state managers and legacy `game.*` object. Checks for mismatches.
```
> validate
🔍 State Validation:
  ✅ Gold: PlayerStateManager (1500) = game.player.gold (1500)
  ✅ Location: WorldStateManager (capital) = game.currentLocation.id (capital)
  ✅ Doom: WorldStateManager (false) = game.inDoomWorld (false)
```

### debugstate
Shows the current values from all state managers in detail.
```
> debugstate
📊 State Manager Values:

PlayerStateManager:
  gold: 1500
  inventory: { bread: 5, iron_sword: 1 }
  equipment: { weapon: 'iron_sword' }

WorldStateManager:
  location: capital
  inDoomWorld: false
  visitedLocations: ['capital', 'greendale']

UIStateManager:
  openPanels: ['inventory']
  escPriority: []
```

### syncstate
Forces a sync between state managers and the legacy `game.*` object. Useful if something gets out of whack.
```
> syncstate
🔄 State sync complete!
  Synced gold: 1500
  Synced location: capital
  Synced inventory: 6 items
```

### trackchanges [on/off]
Enables or disables state change tracking via SystemRegistry. When enabled, logs all state changes with caller info.
```
> trackchanges on
📝 State change tracking ENABLED

> trackchanges off
📝 State change tracking DISABLED

> trackchanges
📝 State tracking is: ON
   Last 5 changes:
   1. WorldStateManager.setCurrentLocation('greendale') from TravelSystem.completeTravel
   2. PlayerStateManager.gold.remove(50) from TradingSystem.buy
   ...
```

### tp <locationId>
Shortcut alias for `teleport`. Uses WorldStateManager for proper state updates.
```
> tp greendale
🗺️ Teleported to Greendale Village
```

### exitdoom
Exits doom world and returns to normal world. Uses WorldStateManager.exitDoomWorld().
```
> exitdoom
🌍 Exited doom world! Returned to normal reality.
```

---

## ACHIEVEMENT COMMANDS

### unlockachievement <achievement_id>
Unlocks a specific achievement.
```
> unlockachievement first_steps
🏆 Unlocked: First Steps - Begin your trading journey
```

### unlockall
Unlocks ALL achievements (including hidden ones). Triggers Super Hacker!
```
> unlockall
🏆 All 72 achievements unlocked! You absolute legend.
```

### resetachievements
Resets all achievement progress (cannot be undone!).
```
> resetachievements
⚠️ All achievements reset. Starting fresh...
```

### listachievements
Lists all achievements and their status.
```
> listachievements
🏆 Achievements: 45/72 unlocked
  [x] First Steps
  [x] Pocket Change
  [ ] Road Warrior
  ...
```

### testachievement
Tests achievement popup by unlocking 3 random locked achievements.
```
> testachievement
🏆 Testing achievement popups... Unlocking 3 random achievements!
```

---

## LEADERBOARD COMMANDS

### clearleaderboard
Clears all entries from the Hall of Champions.
```
> clearleaderboard
🏆 Hall of Champions cleared!
```

### refreshleaderboard
Force refresh the Hall of Champions display.
```
> refreshleaderboard
🔄 Leaderboard refreshed!
```

### showleaderboard
Show all leaderboard entries in the debug console.
```
> showleaderboard
🏆 Leaderboard entries:
  1. Merchant King - 1,500,000 gold
  2. Trade Master - 1,200,000 gold
  ...
```

---

## ITEM & INVENTORY COMMANDS

### giveitem <item_id> [quantity]
Adds items to your inventory.
```
> giveitem iron_sword 1
📦 Added 1x Iron Sword to inventory

> giveitem bread 50
📦 Added 50x Bread to inventory

> giveitem gold_bar 10
📦 Added 10x Gold Bar to inventory
```

### listitems
Lists all valid item IDs.
```
> listitems
📦 Available items (177 total):
  Resources: wood, stone, iron_ore, copper_ore, coal...
  Food: bread, meat, cheese, fish, vegetables...
  Weapons: iron_sword, steel_sword, bow, crossbow...
  ...
```

### clearinventory
Removes ALL items from inventory (keeps gold).
```
> clearinventory
📦 Inventory cleared! Hope you didn't need that stuff.
```

---

## NPC & ENCOUNTER COMMANDS

### encounter [type]
Triggers a random encounter immediately, optionally of a specific type.
```
> encounter
🎭 Random encounter triggered!
  Type: Wandering Merchant
  Name: Marcus the Trader

> encounter bandit
🎭 Spawned bandit encounter!
```

### trader
Spawns a random trader encounter.
```
> trader
🎭 Spawned trader encounter: Elena the Peddler
```

### merchant
Spawns a merchant encounter.
```
> merchant
🎭 Spawned merchant encounter: Thomas the Trader
```

### smuggler
Spawns a smuggler encounter (rare items).
```
> smuggler
🎭 Spawned smuggler encounter: Shadow Dealer
```

### listnpctypes
Lists all available NPC encounter types.
```
> listnpctypes
👤 NPC Types:
  merchant, blacksmith, innkeeper, guard
  bandit, thief, traveler, pilgrim
  noble, peasant, courier, smuggler
```

---

## PLAYER STATS COMMANDS

### heal
Fully restores health, hunger, thirst, and energy.
```
> heal
💚 Fully healed! Health, hunger, thirst, energy all maxed.
```

### setstat <stat> <value>
Sets a specific stat value.
```
> setstat health 100
💚 Health set to 100

> setstat strength 10
💪 Strength set to 10
```

---

## SYSTEM COMMANDS

### help
Shows all available commands.
```
> help
📋 Debug Commands:
  geecashnow - Add 1000 gold
  givegold <amount> - Add gold
  ...
```

### clear
Clears the debug console output.
```
> clear
(Console cleared)
```

### gamestate
Shows current game state information.
```
> gamestate
📊 Game State:
  Location: The Royal Capital
  Gold: 1,500
  Day: 5
  Time: 14:30
  ...
```

### reload
Reloads the page (same as F5).
```
> reload
🔄 Reloading...
```

---

## EASTER EGGS

### Secret Commands

These hidden commands exist for the truly dedicated:

| Command | Effect |
|---------|--------|
| `iddqd` | Classic DOOM god mode reference |
| `idkfa` | Classic DOOM all weapons reference |
| `konami` | ↑↑↓↓←→←→BA - Something special |
| `matrix` | "There is no spoon" - Visual effect |
| `unity` | Shows a special message from the devs |
| `42` | The answer to everything |
| `xyzzy` | Classic adventure game reference |

### Developer Messages

Type these for fun responses:
- `hello` - Unity says hi
- `bye` - Unity says goodbye
- `love` - Unity appreciates you
- `hate` - Unity is hurt
- `coffee` - Unity needs caffeine

---

## 🦙 OLLAMA AI DEBUGGING

### Checking Ollama Status

Open browser console (F12) and run:

```javascript
// Check if Ollama is running
OllamaModelManager.checkOllamaRunning().then(console.log)
// → true or false

// Get full status
OllamaModelManager.getStatus().then(console.log)
// → { ollamaRunning, hasRequiredModel, installedModels, selectedModel }

// List installed models
OllamaModelManager.getInstalledModels().then(console.log)
// → [{ name: 'mistral:latest', size: 4.1GB, ... }]
```

### Manual Model Commands

```javascript
// Pull a new model (starts download)
OllamaModelManager.pullModel('llama3:8b')

// Switch active model
OllamaModelManager.setActiveModel('llama3:8b')

// Get current model
OllamaModelManager.getSelectedModel()
// → 'mistral'
```

### Testing NPC Dialogue

```javascript
// Test Ollama directly
fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'mistral',
        prompt: 'You are a medieval merchant. Greet a customer.',
        stream: false
    })
}).then(r => r.json()).then(console.log)

// Test NPCVoiceChatSystem
NPCVoiceChatSystem.generateResponse('merchant', 'greet', {})
    .then(console.log)
```

### Ollama Troubleshooting

| Problem | Solution |
|---------|----------|
| "Ollama not running" | Start Ollama: `ollama serve` in terminal |
| Model not found | Pull model: `ollama pull mistral` |
| Slow responses | Try smaller model: `phi:latest` (1.7GB) |
| Download stuck | Check disk space, restart Ollama |

---

## TROUBLESHOOTING 🔧💀

### Console Not Opening? 🐛
1. Make sure you're not in a text input field
2. Try clicking somewhere on the game first
3. Press backtick (`) - it's next to the 1 key
4. Check if "Super Hacker" achievement is unlocked 🏆

### Command Not Working? ⚠️
1. Check spelling (commands are case-insensitive)
2. Make sure you have the right number of arguments
3. Check if the ID exists (use `items`, `locations`, etc.)
4. Some commands require confirmation

### Game Broke After Debooger? 💔
1. Try `heal` to restore stats
2. Use `save` then `reload`
3. Worst case: `reset confirm` (loses ALL progress) ⚰️

---

## NOTES FOR DEVELOPERS 🖤💻

### Adding New Commands 🐛

Commands are defined in `src/js/debooger/debooger-command-system.js`:

```javascript
this.registerCommand('mycommand', 'Description here', (args) => {
    // Command logic
    return '✨ Command executed!';
});
```

### Debooger Console Files 📁

| File | Purpose |
|------|---------|
| `debooger-system.js` | Console UI and output capture 🐛 |
| `debooger-command-system.js` | Command registration and execution 🔮 |
| `debooger-overlay.js` | Visual overlay components 🌙 |

### Console Log Capture 📜

All `console.log`, `console.warn`, and `console.error` calls are captured and displayed in the debooger console with timestamps.

---

## DISCLAIMER 💀⚠️

Using debooger commands may:
- Break achievement progression 🏆
- Corrupt save files (rare) 💾
- Make the game too easy 😴
- Spoil the intended experience 📖

**Use responsibly!** Or don't. We're not your parents. 🖤🦇

---

*"With great power comes great responsibility... but also the ability to spawn 1000 gold bars."* - Unity AI Lab 🖤💀🦇

---

**Files Referenced:**
- `src/js/debooger/debooger-system.js`
- `src/js/debooger/debooger-command-system.js`
- `src/js/core/debooger-system.js`

**See Also:**
- [GameplayReadme.md](GameplayReadme.md) - Full game documentation 📖
- [NerdReadme.md](NerdReadme.md) - Developer documentation 💻
- [todo.md](todo.md) - Current development tasks 📝
