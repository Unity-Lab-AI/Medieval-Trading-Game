# 🧠 Gee's Thoughts - The Master Log

**Purpose:** This file captures ALL of Gee's requests, thoughts, and ideas in totality. Claude MUST update this file BEFORE doing any work.

---

## Log Format

Each entry follows this format:
```
### [DATE] - [SESSION]
**Request:** [What Gee asked for]
**Context:** [Any relevant context or details]
**Status:** [Pending/In Progress/Completed]
```

---

## Current Session

### 2025-11-29 - Full Codebase Audit (GO Command)

**Request:** GO - Full workflow triggered

**Context:** Running full codebase audit to find bugs, missing features, dead code, performance issues, security concerns

**Status:** Completed

**Fixed:**
- ✅ XSS vulnerabilities in 4 files (npc-trade.js, property-storage.js, property-ui.js, game.js)
  - Added escapeHtml() functions, switched to data attributes + event delegation
- ✅ CSS conflicts in 3 areas:
  - Scoped duplicate .quest-card to .quest-grid
  - Merged duplicate .high-contrast definitions
  - Merged duplicate .tooltip definitions

**Left for later:**
- Tests disabled in config (40+ flags false)
- Race conditions in NPC/save systems
- Z-index hardcoded values vs z-index-system.css
- Performance issues (23 :has() selectors, 111 !important)

---

### 2025-11-29 - Menu Weather Persistence

**Request:** Make the weather that is current in the setup new game be the weather that persists in game for the first day of play before changing into the normal course of weather effects

**Context:** Menu weather should transfer to game and stay locked for day 1

**Status:** Completed (Already Implemented)

**Findings:**
- `game.js:6705-6710` - Already gets `MenuWeatherSystem.currentSeason` and passes to `WeatherSystem.setInitialWeatherFromMenu()`
- `weather-system.js:259-286` - `setInitialWeatherFromMenu()` maps menu→game weather and sets `lockWeatherUntil` to lock for first day
- Weather lock checks in `updateWeather()` at line 574-597 prevent changes while locked

---

### 2025-11-29 - Weather, Travel, Flash Fixes

**Request:**
1. Remove orange screen flash during meteor impacts
2. Fix meteors to land exactly where burn effects appear (beeline trajectory)
3. Replace 💧 emoji rain with line-style rain drops (like main menu)
4. Slow down rain by 20%
5. Keep travel destination visible until player reaches it (gray out after arrival)
6. Remove white lightning screen flash (photosensitivity)
7. Fix @author Claude comment → Unity AI Lab

**Context:** Various weather and travel UI improvements

**Status:** In Progress

---

### 2025-11-28/29 - Version 0.81: Unity's Dark Awakening

**Request:**
1. Make all versions everywhere v0.81
2. Update all files to use config.js for version (not hardcoded)
3. Files say v0.81 in comments but pull from GameConfig.version for code

**Context:** Version numbers scattered across files, some hardcoded. Need single source of truth in config.js

**Status:** Completed

**Changes Made:**
1. config.js - version.game and version.file already 0.81
2. index.html - all 95 script/css tags use ?v=0.81
3. Fixed hardcoded versions in:
   - time-system.js (was 2.0)
   - virtual-list.js (was 1.0)
   - time-machine.js (was 3.0)
   - system-registry.js (was 1.0)
   - game-world.js (was 1.0)
   - map-renderer-base.js (was 1.0)
   - dungeon-bonanza-system.js (was 1.0)
   - skill-system.js (was 0.5)
   - game-over-system.js fallback (was 0.1)
4. All files now say "File Version: 0.81" or "File Version: GameConfig.version.file"

---

### 2025-11-28 - Quest Tracker Widget Fixes

**Request:**
1. Create `Gee's Unity Thoughts.md` file for Unity's commentary log
2. Quest tracker still isn't positioned correctly - needs to be directly below the panels panel and directly above the messages panel
3. Add close button to quest tracker like everything else
4. Add way to reopen quest tracker after closing

**Context:**
- Quest tracker is a mini HUD widget showing active quests
- Different from the full quests panel (which opens with Q key)
- Needs close button and reopen mechanism via Panels toolbar

**Status:** Completed

**Changes Made:**

1. **Created `Gee's Unity Thoughts.md`** - Unity's personal log file in root directory

2. **npc-systems.css** - Fixed quest tracker position:
   - Position: `bottom: 245px, right: 220px` (directly above message log)
   - Width reduced to 280px for visual hierarchy
   - Max-height reduced to 200px to fit in middle zone

3. **quest-system.js** - Added visibility controls:
   - Added red X close button in tracker header
   - Added `hideQuestTracker()`, `showQuestTracker()`, `toggleQuestTracker()` methods
   - `updateQuestTracker()` now respects `trackerHidden` flag

4. **panel-manager.js** - Added to Panels toolbar:
   - Added `quest-tracker` to `panelInfo` with `customToggle` property
   - Added to `mainPanels` list for toolbar button
   - Custom toggle handler for special panels

---

### 2025-11-28 - Weather Not Showing In Game

**Request:** Rain was showing in main menu, showing in setup menu, widget says it's raining, but NO rain particles visible in the actual game world. WTF? Shouldn't need to unpause to see weather.

**Context:**
- Menu weather works fine
- Setup screen weather works fine
- Weather indicator/widget shows correct weather
- But no visual rain/particles on the game world itself
- Weather effects should be visible regardless of pause state

**Status:** Completed

**Root Cause Found:**
The weather transfer from menu to game was happening at the BEGINNING of `createCharacter()`, but at that point the `game-setup-panel` still didn't have the `.hidden` class. The CSS rule `body:has(#game-setup-panel:not(.hidden)) #weather-overlay { display: none !important; }` was hiding the overlay while particles were being created. By the time the panel was hidden, the particles had finished their 1-2 second animation.

**Changes Made:**

1. **weather-system.js** - Updated `setInitialWeatherFromMenu()`:
   - Now immediately applies weather via `changeWeather()` instead of setting a pending value
   - Added `ensureOverlayReady()` method to verify/move overlay to correct container
   - Overlay is moved to `game-container` if it's in the wrong place
   - Forces display:visible on the overlay

2. **game.js** - Moved weather transfer timing:
   - Moved weather transfer code from the beginning of `createCharacter()` to AFTER `hidePanel('game-setup-panel')` and `changeState(GameState.PLAYING)`
   - This ensures the CSS no longer hides the overlay when particles are created
   - Weather now properly transfers from menu → game with visible particles

---

### 2025-11-28 - Game World Map Drag Fix

**Request:** Can't drag the game world left or right, only up and down a little bit. Can't center any location in the center of the screen by dragging. WTF?

**Context:**
- Game world should be freely draggable in all directions
- User should be able to center any location on screen
- Currently restricted to vertical movement only

**Status:** Completed

**Changes Made:**
Fixed `constrainToBounds()` in game-world-renderer.js:
- Old logic was broken - when map was larger than container, minX > maxX which trapped the offset
- New logic allows proper infinite scroll:
  - `minX = -(mapWidth - visibleMin)` - can scroll all the way left
  - `maxX = containerWidth - visibleMin` - can scroll all the way right
  - Only applies constraints when they make sense (minX < maxX)
  - Same fix for vertical axis
- Reduced visibleMin from 200 to 100 for more freedom
- Now you can center ANY location on screen by dragging 🖤

---

### 2025-11-28 - Quest Panel Position & Draggable Fix

**Request:** The quests panel is STILL on top of the player info panel when it should be directly above the messages panel. And it's not draggable.

**Context:**
- Quest tracker panel needs to be positioned above messages panel (bottom-right area)
- Must be draggable like other panels
- Currently overlapping player info panel incorrectly

**Status:** Completed

**Changes Made:**
1. Fixed quest tracker CSS position in npc-systems.css:
   - Changed from `bottom: 240px, right: 220px` (overlapping side panel)
   - Now at `bottom: 245px, right: 220px` (directly above message log)
2. Added `setupQuestTracker()` function to draggable-panels.js:
   - Quest tracker now has proper drag event handlers
   - Uses `.tracker-header` as the drag handle
   - Retries setup if quest tracker not created yet

---

### 2025-11-28 - Event-Driven Weather System

**Request:** Make it so when entering a dungeon the weather changes (maybe to lightning), and if passed/vanquished the weather subsides. Random events and quests should be able to affect weather. Also ensure weather works with API for text generation (current/past weather sent to API for TTS). Remove the "talk to merchant" button - players never decide what to say to any API.

**Context:**
- Dungeons and encounters should trigger dramatic weather
- Quest completion or event resolution should calm the weather
- Need an event-driven weather trigger system
- Weather context should be sent to text/TTS API
- Remove player input for NPC conversations (no "talk to merchant" button)

**Status:** Completed

**Changes Made:**
1. Added event-driven weather system to weather-system.js:
   - `eventWeatherTriggers` object with dungeon/quest/encounter weather mappings
   - `triggerEventWeather()` - triggers weather based on event type (dungeon_enter, dungeon_boss, etc.)
   - `restoreWeatherAfterEvent()` - restores weather after event ends
   - `forceWeather()` - force any weather type (for scripts)
   - Weather saves/restores automatically during events
2. Added API command handlers for weather: {triggerWeather}, {forceWeather}, {restoreWeather}
3. Added weather context methods for API: `getWeatherContextForAPI()`, `getWeatherDataForAPI()`
4. Removed "Talk to Merchant" button from market panel - NPC conversations now auto-trigger

---

### 2025-11-28 - Weather & Z-Index Fix

**Request:** Whatever weather is currently happening in the start new game setup should be the weather the game starts in. Also, dense fog is obscuring panels - need to check if z-levels are fixed.

**Context:**
- Menu weather should transfer to game weather on start
- Dense fog overlay appears to be on top of panels instead of behind them
- Z-index system was created but may not be working correctly

**Status:** Completed

**Changes Made:**
1. Updated weather-system.js to use CSS variable `--z-weather-overlay` with `!important` and added `isolation: isolate`
2. Updated z-index-system.css:
   - Added `isolation: isolate` to weather overlay to prevent backdrop-filter bleeding
   - Added `#ui-panels` with z-index 50 (above weather's 15)
   - Added all panel types with z-index 120 (well above weather)
   - Added `#location-panel` with proper z-index
3. Menu weather transfer to game was already implemented via `setInitialWeatherFromMenu()`

---

### 2025-11-28 - Gee's Thoughts Reorganization

**Request:** Go through all tacked-on thoughts and post them in proper format

**Context:** Gee added a massive list of historical thoughts to this file that need to be properly formatted and organized

**Status:** Completed

---

## Historical Thoughts Log (Organized by Category)

---

# 🎮 GAME SETUP & UI

### Perk Selection Bug
**Request:** Fix error "Cannot access 'selectedPerks' before initialization" when clicking select perks button
**Status:** Pending

### Difficulty & Gold System
**Request:**
- Easy mode should increase starting gold by 20% (100 → 120)
- Hard mode should decrease starting gold by 20% (100 → 80)
- Gold modifiers should stack with perks
- Starting gold UI must update after difficulty/perk selection
- Remove hard-coded 100 gold amount
**Status:** Pending

### Character Attributes System
**Request:**
- Allow player to distribute 5 points across attributes
- Max any single attribute: 10
- Max total points: 30
- Attributes must affect gameplay (endurance = less stamina drain, strength = better defense/carry weight, etc.)
- Add up/down arrows for point allocation
- Check all points spent before allowing game start
**Status:** Pending

### Character Portrait
**Request:** Remove the character portrait emoji/pfp completely
**Status:** Pending

### Browser/Window Sizing
**Request:**
- Remove huge border around game window when maximized
- Make application reactive to screen/browser size
- Fill full area, no scrollbars hiding content
- Dynamic panel sizing based on content (no dead space)
- Panels float over map, map is full application size
**Status:** Pending

### Setup Panel Issues
**Request:**
- "Your Character", "Starting Gold: 100" hidden off-screen
- Player name at top should update to character name entered
- Remove scroll bar issue blocking game start
- Game setup UI elements stretched in fullscreen (looks bad)
- Max size for panels to prevent dead space
**Status:** Pending

### Perk Confirmation Bug
**Request:** After confirming perks, the "Select Perks 0/2" button doesn't update. Can't get past perk selection.
**Status:** Pending

### Random Button
**Request:** Add random button that picks random difficulty, attributes, and perks
**Status:** Pending

---

# 🗺️ GAME WORLD & MAP

### Infinite Scroll Map
**Request:**
- Game world should not be fixed square in center
- Allow infinite scrolling
- Zoom towards cursor (not upper-left)
**Status:** Completed

### Map Controls
**Request:**
- Fix +/- zoom buttons to zoom toward/from player location
- Fix reset view button to recenter on character
- Fix fullscreen button
- WASD keys should move map (except when in text input)
**Status:** Pending

### Map Default State
**Request:**
- Max zoom on start by default
- Reset button should revert to this max zoom scale
- Map shouldn't be over in corner at start
**Status:** Pending

### Player Marker
**Request:**
- Create pin/tack icon (red) traveling along paths from A to B
- Highly visible "you are here" marker on top of tooltip
- Pin follows paths at correct pace matching time engine
**Status:** Pending

### Property Icons on Map
**Request:**
- All purchased/constructed properties need icons on map
- Plotting system: can't build on existing locations
- Can build anywhere next to existing roads
**Status:** Pending

---

# ⏱️ TIME & TRAVEL SYSTEM

### Time Engine
**Request:**
- Game should start paused by default
- Time controls (pause/normal/fast/faster) should use emojis at top
- Clock must actually work (currently stuck at 8:00)
- Time must sync with travel, weather, and all game events
**Status:** Pending

### Travel System
**Request:**
- Travel time based on path length and type (trail, road, city street)
- Rural = trails, between towns = roads (less stamina, faster)
- Max 2 hours to traverse any connector path
- Clicking location should update destination panel
- Pressing play/normal speed starts travel with pin moving
- Auto-start/auto-stop toggle for travel
**Status:** Pending

### Travel Panel
**Request:**
- Should default open to Destinations, not Map
- Only default to Map when no destination set
- Mini map in travel panel should be interactive like main map
- Locations list should show unlocked/available areas
**Status:** Pending

---

# 🌦️ WEATHER SYSTEM

### Weather Mechanics
**Request:**
- Weather cycles match real North American seasons
- Winter (Dec-Feb): snow
- Spring (Mar-May): showers
- Summer (Jun-Aug): mostly clear
- Fall (Sep-Nov): brief showers
- Don't overdo it - no week-long showers or 8 showers in one day
- Weather duration based on REAL TIME (fast-forward doesn't speed weather)
- Weather effects on game world only (not panels)
- Balance so it's not spamming changes every second
**Status:** Pending

### Menu Weather
**Request:**
- Menu weather should continue into game through setup
- Weather transfers from menu to game
- Weather behind all panels with proper z-index
**Status:** Completed

---

# 📦 ITEMS & CRAFTING

### Universal Item System
**Request:**
- Unify all items through database
- ALL items craftable, gatherable, farmable, or minable
- Prerequisites for higher tier items (wheat→bread, bread+meat→stew, wood→planks, planks→houses)
- Gold coins craftable from gold ore
- Pricing balanced so buying prerequisite + crafting = profit
- 5-10 loot items that only sell to merchants for gold
**Status:** Pending

### Starting Items & Perks
**Request:** Rework starting perks and items to match new crafting system
**Status:** Pending

### Equipment System
**Request:**
- Character sheet shows equipped items from inventory
- Ability to equip all equipable items
- Equipped items affect gathering, crafting, fighting rolls, special encounters
- Need hammer to build buildings
**Status:** Pending

---

# 🏪 MARKET & TRADING

### Market System
**Request:**
- Each market/inn/seller has daily gold supply matching goods value
- Item counts decrease to 25% over day (randomly "purchased")
- Seller wealth increases accordingly
- Max gold at any time = total value of goods in stock
**Status:** Pending

### NPC Trading
**Request:**
- Trade window showing both player and NPC inventory
- Not just markets - direct trade with NPCs
- API commands like {openMarket} parsed from NPC text
- Commands redacted from TTS playback but enacted in game
**Status:** Pending

### Market Panel Issues
**Request:**
- Market button in panels panel not working
- Market was empty on game start
**Status:** Completed (market button fixed)

---

# 👥 NPCs & CONVERSATIONS

### NPC Chat System
**Request:**
- Chat panel opens when talking to merchant
- Auto-play greeting when opening market/encountering NPCs
- TTS reply typed out with NPC name/details
- Player can type responses (up to 2 before NPC ends conversation)
- 20-30 different NPC types with unique personas
- Dynamic NPC generation with individual personas
- All vendors, NPCs, travelers, merchants, employees have own persona
**Status:** Pending

### NPC API Instructions
**Request:**
- Each NPC type has appropriate instructions (not generic "greetings traveler")
- Dark lord doesn't say "greetings traveler" on first meet
- 1-2 short sentences for all NPC conversations
- API prompted at right moments (no waiting on calls)
- Same referer for all API calls
- Map addendum sent to all APIs so NPCs know their area
**Status:** Pending

### People Panel
**Request:**
- Add People panel button to action bar and panels panel
- Show all available NPCs at current location
- All locations spawn appropriate people
**Status:** Pending

### NPC Stats Display
**Request:** Stats section in chat panel should be horizontal
**Status:** Completed

---

# 📜 QUESTS

### Quest System
**Request:**
- Fix item naming (herb→herbs, fur→furs)
- Add missing items (potion, grapes, warm_cloak, ice_blade, dragonbone_blade)
- Fix location names (ironhaven→ironforge_city)
- Quest buttons must work
- Quests can't be abandoned or lost - always completable
- Quest panel shows available quests based on NPCs met
- Quests compatible with save/load (items don't disappear)
- Main quest lines give achievements when finished
**Status:** Pending

### Quest Log UI
**Request:**
- Make quest card icons smaller or boxes bigger
- Bottom info cut off - need to see rewards
- Better icon than red scroll (more paper-like)
- Quest tracker above message log
- Draggable, scrollable, translucent
**Status:** Completed

### Quest NPCs
**Request:**
- NPCs placed across game world for quest lines
- All accompanying TTS and persona info
- Complete, circular quest lines with rewards
- Individual achievements for each main quest finished
- Quest commands and certifications
- API instructions for all quest instances
- Item delivery, item giving, haul quests all working
**Status:** Pending

### Initial Encounter
**Request:**
- Encounter panel opens on first load
- Intro sequence with quest lines from this encounter
- Major quests originate from initial encounter
**Status:** Pending

---

# 🏠 PROPERTIES & EMPLOYEES

### Property System
**Request:**
- Rent, buy existing, or build with items
- Constructed properties on either side of paths
- Own icon on world map when owned
- Building takes longest, rent/purchase instant
- Limits on employees/properties (10 levels based on wealth)
- Wealth titles: Vagrant (lowest) to Royal Merchant (highest)
- Name displays as "Gee a Royal Merchant"
- Properties sellable for half cost, disappears from map
**Status:** Pending

### Building Requirements
**Request:**
- Need hammer equipped to build
- Cheap if building supplies resourced/in inventory
- Check for required materials
**Status:** Pending

### Employee Limits
**Request:** Based on player wealth level/achievements
**Status:** Pending

---

# 🏆 ACHIEVEMENTS & LEADERBOARD

### Achievements Panel
**Request:**
- Not scrollable - fix it
- Close button not working - fix it
- Add button linking to top 10 rankings
**Status:** Pending

### Achievement Popup
**Request:**
- Popup when prerequisites met
- Shows all relevant info
- Pauses game
- Handle multiple achievements at once
**Status:** Pending

### More Achievements
**Request:**
- Acquiring luxury goods (amount/first time)
- Fully geared up
- First crafting
- Crafting large amounts of higher tier items
- Own first property
- 10 hidden achievements (e.g., visit dungeon 50 times in 5 years)
- Achievable through normal play
- Merchant wealth level achievements
- "Start Your Journey" - activates on first travel
**Status:** Pending

### Leaderboard/Hall of Champions
**Request:**
- File updated like database for all instances
- Display on startup menu
- Auto-save on page close to prevent progress loss
- Top 10 list propagates to all users (GitHub static pages)
- View all champions button panel
- Shows: survival time, coin, property count, inventory value
- Death or -1000 gold = jailed, game over, rankings set
**Status:** Pending

### High Score Panel Bug
**Request:**
- Exit buttons don't work
- Multiple exit buttons - why?
- Red X moves from panel to window corner randomly
- Fix so it stays on panel
**Status:** Pending

---

# 💾 SAVE/LOAD SYSTEM

### Save System
**Request:**
- Save button opens "Save As" with name input
- Confirm or cancel options
- Confirmation shows updated slot info
- All game state saved correctly for perfect reload
- Auto-save before page close
**Status:** Pending

### Load System
**Request:**
- Load button opens list of saved games
- Seamless loading back into game state
**Status:** Pending

### Save/Load with Quests
**Request:**
- Quest items don't disappear on load
- All quest states preserved
- Property states preserved
**Status:** Pending

---

# ⌨️ KEYBOARD & CONTROLS

### Keyboard Bindings
**Request:**
- Space = pause/resume time
- Escape = exit fullscreen map
- I = inventory
- C = character sheet
- F = financial sheet
- WASD = move game world
- Settings option to customize bindings
- Bindings listed in UI and readme
- Controlled via config file
**Status:** Pending

### Binding Conflicts
**Request:**
- WASD works except when in text prompt
- No conflicts with other gameplay
**Status:** Pending

---

# 🏰 DUNGEONS & ENCOUNTERS

### Dungeon/Unique Locations
**Request:**
- Options appear on arrival (dig for gold, narrow opening, toss coin in well, etc.)
- High profitability outcomes in loot
- Only spawn new events/loot every 12 hours
- Difficulty varies by distance from capital
- Uses health and stamina
- Unequipped player can't survive hard dungeons
- Fully geared player dominates
- Show possible stamina/health drain before committing
- Same for resource gathering and random encounters
**Status:** Pending

### Random Encounters
**Request:**
- Debug test to initiate random trade encounter
- NPC with tradeable items (not market merchant)
- Balanced NPC inventories
- Auto-pause time during encounter
- Resume normal speed when concluded
**Status:** Pending

---

# 🔧 DEBUGGING & CONSOLE

### Debooger Console
**Request:**
- Rename "Debug" to "Debooger" throughout code
- Remove ` key ability to open debooger
- ` key when open allows typing commands
- First command: "geecashnow" adds 1000 gold (within carry weight)
- Auto gold updater to inventory
- Gold manager tracks all gold (inventory + buildings + employees)
- Universal for buys/sells (personal inventory first, then buildings)
- Selling gold goes to personal inventory/wagon/cart
**Status:** Pending

### Debooger Visibility
**Request:**
- Should be visible on start menu
- Toggle on in config until final version
- Separate readme (DebuggerReadme.md)
**Status:** Pending

### Debooger Auto-scroll
**Request:** Lock to most recent timestamp, not initial initialization
**Status:** Pending

---

# 📱 PANELS & UI

### Panel Buttons
**Request:**
- All buttons on all panels open relevant panel/info
- Create panels if they don't exist
- Market button in panels panel works
- Financial ledger panel works
- Character button opens character sheet
- Achievements button in panels panel works (bottom one does)
**Status:** Partially Completed

### Panel Close Buttons
**Request:**
- Red X in top right of panels
- Blue close button with text at bottom right
- Unified close functionality
- Panels panel can only be minimized (not closed)
- All panels movable and position saved
**Status:** Pending

### Panel Positioning
**Request:**
- Panels panel next to character panel (not on top)
- Messages panel to right, location panel to left
- Both touch action bar sides
- Move naturally with browser resize
- Default positions maintained, user moves saved
**Status:** Pending

### Panel Bugs
**Request:**
- Multiple exit/close buttons on some panels
- Financial sheet X at top left (should be top right)
- People panel has two red X buttons
- Current location panel lost movability
- Travel panel has multiple exits
**Status:** Pending

### Side Panel Stats
**Request:**
- Stats icons/boxes better arranged
- Only 5 numbers (max 10) and 5 icons
- Shouldn't take half the panel
**Status:** Pending

### Floating Settings Button
**Request:** Remove completely - use panels panel and character info settings buttons instead
**Status:** Pending

---

# 📁 FILES & STRUCTURE

### Version System
**Request:**
- All files: v0.1 file version
- Game version: 0.1
- Display in Settings > About
- Credits: Unity AI Lab (Hackall360, Sponge, GFourteen)
- All controlled via config.js in root
**Status:** Pending

### File Cleanup
**Request:**
- Delete test files, logs, cache, temp files
- Delete "nul" file in root (keeps appearing)
- Check if our files create it or it's a ghost
**Status:** Pending

### Code Persona
**Request:**
- All comments in 25yr old female edgy emo goth coder voice
- Dark, wild, fun vibe
- Check ALL files including new ones
- Edits to existing files need the vibe too
- Read in 24000 token chunks
**Status:** Pending

### Event Listeners
**Request:** Should be using global listeners, not individual event listeners - check and fix
**Status:** Pending

---

# 📖 DOCUMENTATION

### README Structure
**Request:**
- Rename readme.md to GameplayReadme.md
- Create NerdReadme.md for code/architecture
- Create DebuggerReadme.md for debug commands
- Table of contents with jump links
- Cross-references between all readmes
- Complete item list in glossary
- All achievements listed (including hidden)
- Keyboard shortcuts listed
- Cheat codes section
- Delete archived/outdated info
**Status:** Pending

### TODO System
**Request:**
- Add all findings as todo items
- Specific tasks with file paths and line numbers
- Don't skip items, don't batch completions
- Session summary at end
**Status:** Pending

---

# 🧪 TESTING

### Tests to Add
**Request:**
- Settings test (all settings work via config)
- Travel test (Playwright travels to unexplored locations)
- Boss voices in voice test panel
- Use actual NPC write-ups in tests
- Turn off passed tests before git push
**Status:** Pending

### Test Voice API
**Request:** Tests working - don't break it
**Status:** Completed

---

# 🔌 API & VOICE

### Voice Chat API
**Request:**
- Add voice chat API
- Text then TTS playback
- Model selectability in settings
- Voice selection based on NPC type
- Innkeeper = nice female voice
- Robber = mumbled strange language
- Noble = British accent
- Personas and system prompts for each NPC
- Prebuilt prompts for different game events
**Status:** Pending

### API Commands
**Request:**
- Commands like {openMarket} in NPC responses
- Cut from text display and TTS
- Enacted by game code
- Trade window command needed
- All quest commands working
**Status:** Pending

### Hall of Champions API
**Request:**
- Not working with API for leaderboard updates
- Should update on save and death
**Status:** Pending

---

# 🏗️ INFRASTRUCTURE

### GitHub Deployment
**Request:**
- index.html renamed to "Medieval Trading Game"
- Update GitHub workflow for deployment/build
**Status:** Pending

### Vault Building
**Request:** Add vault building type with storage
**Status:** Pending

### Home Upgrades
**Request:**
- Higher tier homes with storage upgrades
- Bonuses and crafting ability
- Employ certain # of employees based on quality
**Status:** Pending

---

# 🐛 SPECIFIC BUGS

### Perks Show Undefined
**Request:** Perks in character sheet show as "undefined"
**Status:** Pending

### Menu Panel Not Opening
**Request:** Menu panel fails to open
**Status:** Pending

### Financial Panel Not Opening
**Request:** Finance panel fails to open (never seen it once)
**Status:** Pending

### Storage Inventory Not Opening
**Request:** Can't get storage inventory panels to open
**Status:** Pending

### Travel Time Lock
**Request:** During travel, time engine locks up ~8 seconds in
**Status:** Pending

### World Map Not Showing
**Request:** Game starts but no world map visible with villages, cities, gathering spots
**Status:** Pending

### Map Scroll Issue
**Request:** Can only scroll world view up/down, not left/right
**Status:** Pending

### Gate Tooltips
**Request:** Outpost gates should show passage fees in tooltips (one-time unlock, can still trade before paying)
**Status:** Pending

### Inventory Empty on Start
**Request:** Inventory and market empty - need longer load screen?
**Status:** Pending

---

*"Every thought matters. Every request is remembered. This is the sacred log."* 🖤
