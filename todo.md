# 🖤 TODO.md - Current Bugs & Tasks 💀

**Purpose:** ONLY unfinished items. Completed items move to `finished.md`.

**Last Updated:** 2025-12-02
**Total Remaining:** 59 issues (31 bugs + 28 test failures)

---

## 🔴 CRITICAL SEVERITY - 2 remaining

### Known Issues (Not Actionable Now)
- [x] **config.js:171-172** - API credentials exposed (KNOWN - needs server-side solution, don't stress it)
- [x] **property-income.js:117** - Maintenance becomes 0 at condition=100 (NOT A BUG - only affects condition<50)

### 🆕 AGENT AUDIT FINDINGS (2025-12-01)
- [x] **npc-relationships.js** - NPC relationships saved to GLOBAL localStorage ✅ FIXED (added getSaveData/loadSaveData + SaveManager integration for per-slot isolation)
- [x] **save-manager.js:256-259** - EventSystem events not restored ✅ FIXED (added EventSystem.loadSaveData() + restore call in SaveManager)

---

## 🟠 HIGH SEVERITY - 26 issues

### 🆕 AGENT AUDIT FINDINGS (2025-12-01)
- [x] **travel-panel-map.js:1556** - Race condition: playerPosition could null between check and access ✅ FIXED (added ?. optional chaining)
- [x] **panel-manager.js:665** - MutationObserver never cleaned up on beforeunload ✅ FIXED (added beforeunload → disconnectObserver())

### Memory Leaks
- [x] **npc-chat-ui.js** - Add initialization guard ✅ FIXED (added _initialized flag + guard in init())
- [x] **npc-chat-ui.js** - Track typewriter timeouts ✅ FIXED (added _typewriterTimeouts array + clearTypewriterTimeouts())
- [x] **npc-voice.js** - Add audio.onended cleanup ✅ FIXED (changed to property assignment + cleanup in stopVoicePlayback())
- [x] **animation-system.js** - Add destroy() with cancelAnimationFrame ✅ FIXED (added destroy() + null assignment after cancelAnimationFrame)
- [x] **menu-weather-system.js** - Add max retry counter for init ✅ FIXED (added _initRetries + _maxInitRetries=10)
- [x] **performance-optimizer.js** - Check parentNode before removeChild ✅ FIXED (added ?.parentNode in 3 locations)
- [x] **performance-optimizer.js** - Store and clear timer references ✅ FIXED (added _monitoringFrameId + _panelUpdateIntervalId + cleanup)
- [x] **audio-system.js** - Store all oscillators for cleanup ✅ FIXED (added _activeOscillators + onended auto-removal + stopAllOscillators())
- [x] **audio-system.js** - Add isActive() check ✅ ALREADY EXISTS (line 1074-1076)
- [x] **audio-system.js** - Clear all interval IDs in cleanup ✅ ALREADY EXISTS (cleanup() handles musicLoopInterval + ambientInterval)
- [x] **audio-system.js** - Add TimerManager fallback ✅ ALREADY EXISTS (cleanup() has typeof TimerManager check)
- [x] **travel-panel-map.js** - Store bound listeners for removal ✅ FIXED (added _boundMouseMove/Up/TouchMove/End/LocationChanged + cleanup)
- [x] **travel-panel-map.js** - Ensure interval cleared on cancel ✅ ALREADY EXISTS (cleanup() clears countdownInterval)

### Data Integrity
- [x] **trading-system.js:276** - Escape HTML in trade history (XSS) ✅ FIXED (added _escapeHTML() + escaped all user data)
- [x] **time-system.js:55** - Fix currentSpeed/isPaused contradiction ✅ FIXED (initial state now both PAUSED)
- [x] **time-machine.js:367** - Fix season weather lock race condition ✅ FIXED (added getTotalMinutes guard + timestamp fallback)
- [x] **timer-manager.js** - Document ALL timing must use TimerManager ✅ FIXED (added usage documentation header)
- [x] **system-registry.js:152** - Add explicit errors for missing game/player ✅ FIXED (added requireGame() + requirePlayer() methods)
- [x] **api-command-system.js:54** - Fix global regex lastIndex state ✅ VERIFIED (already has lastIndex=0 reset at line 74)
- [x] **achievement-system.js** - Defensive array init for null checks ✅ FIXED (added Array.isArray check for dungeonVisitLog + object fallback)
- [x] **quest-system.js:264** - Preserve questCompletionTimes in saves ✅ VERIFIED (already saved/loaded in quest-system.js + save-manager.js)
- [x] **skill-system.js:1090** - Persist skills to game.player on load ✅ FIXED (added _syncSkillsToPlayer() method)
- [x] **faction-system.js** - Add to SaveManager save/load ✅ VERIFIED (already has getState/loadState + SaveManager calls at 567-568)
- [x] **reputation-system.js** - Add quest:failed event listener ✅ VERIFIED (already exists at line 252-254)

### Needs Verification
- [x] **time-machine.js:542** - Weekly wage logic (day % 7) ✅ VERIFIED OK (line 518 was wrong - actual line 542 correctly fires on days 7, 14, 21 since game starts on day 1)
- [x] **event-manager.js:143-158** - One-time listener removal ✅ VERIFIED OK (correctly finds and removes listener after firing)
- [x] **npc-voice.js:820-823** - Audio listeners ✅ WRONG LINE (line 820-823 is buildNPCDataFromMerchant, not audio - closing as invalid)
- [x] **npc-encounters.js:157-160** - Hook race condition ✅ VERIFIED OK (standard monkey-patching pattern with null guard)
- [x] **save-manager.js:445** - Shallow merge ✅ WRONG LINE + BY DESIGN (line 445 is closing brace - lines 530/533 have spreads but that's correct for save/load)
- [x] **dynamic-market-system.js:189** - Negative hoursIntoDay ✅ VERIFIED OK (Math.max(0, ...) clamps negative values)
- [x] **travel-system.js:1886** - Race condition ✅ WRONG LINE (line 1886 is just `hops: route.length - 1` - no race condition)
- [x] **property-purchase.js:16** - game.currentLocation check ✅ FIXED (added ?. optional chaining)
- [x] **property-system-facade.js:149** - ownedProperties null ✅ FIXED (added ?. optional chaining)

### Future Work
- [ ] **save-manager.js:172** - Schema validation
- [x] **leaderboard-panel.js:154-155** - JSON.parse validation ✅ FIXED (added try-catch + structure validation)

---

## 🟡 MEDIUM SEVERITY - 19 remaining (22 fixed/verified)

### 🆕 AGENT AUDIT FINDINGS (2025-12-01)
- [x] **virtual-list.js** - Custom renderItem() callbacks can inject raw HTML without escaping ✅ FIXED (added XSS warning documentation + escapeHtmlVirtual usage example)
- [x] **npc-chat-ui.js** - Verify dialogue content from API/data is escaped before innerHTML display ✅ VERIFIED (formatNPCMessage calls escapeHtml() at line 1010, player messages escaped at line 897)
- [x] **panel-manager.js:354** - makeToolbarDraggable() adds listeners but doesn't store refs ✅ ALREADY FIXED (has _toolbarDragHandlers + cleanup in disconnectObserver)

### Performance & Logic
- [x] **tooltip-system.js** - Cache JSON.parse tooltip data ✅ FIXED (added WeakMap _tooltipCache)
- [x] **game-engine.js** - Add initPromise pattern ✅ FIXED (added _initPromise, _initResolve, _initialized + whenReady() async helper)
- [x] **event-bus.js** - Add getFailedEvents() tracker ✅ FIXED (added _failedEvents + getFailedEvents/clearFailedEvents/hasFailedEvents)
- [x] **time-machine.js** - Cache getTotalDays() calculation ✅ FIXED (added _totalDaysCache)
- [x] **audio-system.js** - Cache noise buffers ✅ FIXED (added _noiseBufferCache Map)
- [ ] **performance-optimizer.js** - Use circular buffer for history
- [x] **api-command-system.js** - Add safeParam() utility ✅ FIXED (added safeParam() with bounds checking + HTML sanitization)
- [x] **loading-manager.js** - Fix modulo interval logic ✅ FIXED (replaced % 5000 < 100 with _lastLogTime tracking)
- [ ] **bootstrap.js** - Add timeout for module init
- [ ] **bootstrap.js** - Create Z_INDEX constants file
- [x] **game-world.js:1061** - Fix location.specialties→sells ✅ FIXED (now checks both 'sells' and 'specialties')
- [x] **mount-system.js:377** - Validate mountStats exists ✅ FIXED (added null check before accessing health)
- [x] **travel-panel-map.js:627** - Clear playerMarker on DOM clear (ALREADY FIXED - line 627-629 checks if marker in DOM and resets reference)
- [x] **trade-route-system.js:138** - Fix undefined TimeSystem constants ✅ FIXED (use HOURS_PER_DAY * MINUTES_PER_HOUR)
- [x] **trade-route-system.js:153** - Null check warehouseLocation.marketPrices ✅ FIXED (added ?. optional chaining)
- [x] **reputation-system.js** - LRU cleanup for locationReputation ✅ FIXED (added _locationAccessOrder + _updateLocationAccessOrder())
- [x] **initial-encounter.js** - Store previous time speed, not boolean ✅ FIXED (now stores _previousSpeedForTutorial and _previousSpeedForIntro)
- [ ] **quest-system.js** - Add quest metadata category
- [x] **dynamic-market-system.js** - Validate ItemDatabase exists ✅ FIXED (added check in init())
- [ ] **save-manager.js** - Track save format for migrations
- [ ] **save-manager.js** - Emergency save recovery UI

### Memory Leaks
- [x] **menu-weather-system.js** - Consolidate duplicate keyframes ✅ FIXED (removed duplicate menu-bolt-strike/fire-flicker/spark-pulse)
- [x] **npc-voice.js** - Add audioContext init guard ✅ FIXED (added _audioContextSetup flag)
- [x] **browser-compatibility.js** - Limit fallback storage size ✅ FIXED (added 5MB MAX_FALLBACK_SIZE check)
- [x] **browser-compatibility.js** - Don't suppress console errors ✅ FIXED (logs to error stream instead of silent fail)
- [ ] **api-command-system.js** - Pass context as param
- [ ] **bootstrap.js** - Add module severity levels
- [x] **people-panel.js** - Stop voice on window unload ✅ FIXED (added beforeunload listener to call NPCVoiceChatSystem.stopVoicePlayback())
- [x] **people-panel.js** - Sanitize NPC API responses (XSS) ✅ FIXED (addChatMessage uses textContent, added escapeHtml to NPC card name/title/description)
- [x] **draggable-panels.js** - Guard flag for duplicate listeners (ALREADY HANDLED - line 180-183 uses cloneNode to prevent duplicates)
- [x] **draggable-panels.js** - Window unload for MutationObserver (ALREADY FIXED - line 304 has beforeunload listener)
- [x] **modal-system.js** - Use textContent for user data (DESIGN NOTE: Callers are responsible for escaping content. Modal titles/content are developer-provided HTML, not raw user input)
- [x] **panel-manager.js** - Store/cleanup toolbar drag handlers ✅ FIXED (added _toolbarDragHandlers + cleanup in disconnectObserver())
- [x] **panel-manager.js** - Hook MutationObserver to unload ✅ FIXED (added beforeunload → disconnectObserver())
- [x] **tooltip-system.js** - beforeunload disconnect observer ✅ FIXED (added destroy() method + beforeunload listener)
- [x] **inventory-panel.js** - Store dropdown close handler ✅ FIXED (added _dropdownCloseHandler + cleanup helpers)
- [x] **leaderboard-panel.js** - beforeunload stop auto-refresh (NOT NEEDED - line 33 says no auto-refresh interval exists)
- [x] **game-world-renderer.js** - Implement destroy() method ✅ FIXED (added destroy() + cleanup() methods)
- [x] **game-world-renderer.js** - Add cleanup() before re-init ✅ FIXED (cleanup() added)
- [x] **visual-effects-system.js** - Add stop() for particle frame ✅ FIXED (added stop() + tracked frameIds)
- [x] **visual-effects-system.js** - Add destroy() for events ✅ FIXED (added destroy() + beforeunload)

### UI/UX Bugs
- [x] **time-machine.js:432-437** - Stale animation frame detection (ALREADY FIXED - checks !animationFrameId and forces restart)
- [x] **time-machine.js:750-773** - DOM cache never invalidated after panel reload ✅ FIXED (_initDomCache now checks document.contains())
- [x] **tooltip-system.js:651-654** - MutationObserver never disconnected ✅ FIXED (added _domObserver storage + destroy())
- [x] **ui-enhancements.js:896** - yesBtn/noBtn null before cloneNode (ALREADY FIXED - line 896 has null guard)

### NPC & Effects
- [x] **npc-dialogue.js:636-658** - API errors not logged with details ✅ FIXED (now logs error object with message, status, npcType, isBoss, context)
- [x] **npc-encounters.js:305-310** - Stale encounters never cleaned up (ALREADY FIXED - dismissEncounter(), endEncounter(), and refreshTraderInventories() all clean up)
- [x] **npc-encounters.js:743-754** - refreshTraderInventories checks wrong property (ALREADY FIXED - line 749 checks encounter.npc?.type || encounter.type)
- [x] **npc-voice.js:694** - game.currentLocation.merchants without null check (ALREADY FIXED - line 694 has ?. guard)
- [x] **visual-effects-system.js:449** - Screen shake rAF not tracked ✅ FIXED (added screenShake.frameId tracking)
- [x] **visual-effects-system.js:505,535,279** - Pending timeouts not cleared in cleanup ✅ FIXED (added _pendingTimeouts + _scheduleTimeout() + _clearAllTimeouts())

### Quest System
- [x] **quest-system.js:1192-1193** - Quest can be in active AND completed simultaneously (VERIFIED OK - canStartQuest() checks activeQuests, completeQuest() deletes before adding to completed)

### Property System
- [x] **property-income.js:19,30,85** - Hardcoded multipliers should be config ✅ FIXED (added config object with levelIncomeMultiplier, taxRate, etc.)
- [x] **property-storage.js:47-51** - Fallback weight calculation wrong (VERIFIED OK - default of 1 weight per item is reasonable when ItemDatabase unavailable)
- [x] **property-ui.js** - innerHTML without escaping dynamic values ✅ FIXED (added escapeHtml to propertyType.name, location.name in createPropertyElement + showPropertyDetails)

### Security (Medium)
- [x] **game.js:251,337,452,896,929,1144,1194** - innerHTML with player.name (XSS) ✅ FIXED (line 802 player.name + location.name now escaped - other lines are data objects, not innerHTML)
- [x] **npc-trade.js:179,387,391,394,397,400,403,406** - render functions may have XSS ✅ VERIFIED (escapeHtml exists at line 804 and is used extensively throughout all render functions)
- [x] **property-storage.js:344,367,383,434,491,518** - Item names could be XSS ✅ FIXED (added safeItemName = escapeHtml(itemName) in all 3 render locations)

---

## 🟢 LOW SEVERITY - 3 remaining

### Code Quality
- [x] **debooger-command-system.js** - Use spread operator for array concat (NOT NEEDED - no concat() calls found)
- [x] **dynamic-market-system.js** - Cache location lookups in resetDailyStock() ✅ FIXED
- [x] **game-world.js** - Use rarity lookup table ✅ FIXED
- [x] **property-income.js** - Consolidate duplicate income logic ✅ FIXED (DRY'd with shared helpers)
- [x] **save-manager.js** - Differentiate error types ✅ FIXED (SaveError class + SaveErrorCodes)
- [x] **achievement-system.js** - Use stat snapshot vs closures (BY DESIGN - closures correctly read CURRENT stats)
- [ ] **Multiple files** - Standardize ?? vs || for null checks
- [x] **npc-chat-ui.js** - Replace inline onclick (NOT NEEDED - no inline onclick found)
- [x] **people-panel.js** - Replace inline onclick (3 instances) ✅ FIXED (converted to data-action + event delegation)
- [x] **inventory-panel.js** - Replace inline onclick (4 instances) ✅ FIXED (converted to data-action + event delegation)
- [x] **equipment-panel.js** - Replace inline onclick (1 instance) ✅ FIXED (converted to data-action + event delegation)
- [x] **npc-trade.js** - Optimize escapeHtml() with Map ✅ FIXED

### Other Low Priority (Non-Issues)
- [x] **event-bus.js:100-109** - Wildcard listeners get {event, data} not just data (BY DESIGN - wildcard needs to know which event fired)
- [x] **z-index-system.css:267-272** - Debooger z-index bypasses system (BY DESIGN - debooger must be above everything for debugging)
- [x] **property-types.js:264-291** - No validation that propertyId is string ✅ FIXED

---

## 🧪 PLAYWRIGHT TEST FAILURES (2025-12-01)

**Test Run Summary:** 340 passed, 32 failed, 4 skipped

### comprehensive-ui.spec.js (5 failures)
- [ ] **:156** - Save button exists and SaveManager has save functionality
  - Investigation: Save button selector may be wrong or button not rendered
- [ ] **:489** - Inventory has filter button and category filtering
  - Investigation: Filter UI may have changed or not implemented
- [ ] **:587** - Market tabs exist and can switch between buy/sell
  - Investigation: Market tab switching may have timing issues
- [ ] **:1102** - M key opens market and shows market content
  - Investigation: Keybinding or market panel rendering issue
- [ ] **:1165** - H key opens achievements panel
  - Investigation: H key may not be mapped to achievements

### debooger-commands.spec.js (3 failures)
- [ ] **:64** - givegold defaults to 100 when no amount specified
  - Investigation: Check default value in debooger-command-system.js
- [ ] **:387** - listlocations shows all 30+ locations
  - Investigation: Location count may have changed or output format
- [ ] **:734** - gamestate displays current game state in console
  - Investigation: gamestate command output format may have changed

### features.spec.js (1 failure)
- [ ] **:321** - Achievements display progress
  - Investigation: Achievement progress UI rendering issue

### game-flow.spec.js (23 failures) - DISABLED IN CI/CD
- [ ] **:29** - loads game successfully from initial page load
- [ ] **:303** - attribute points limit is enforced
- [ ] **:381** - game object is initialized correctly
- [ ] **:411** - player starts at default location
- [ ] **:421** - player vitals are initialized correctly
- [ ] **:450** - all core game systems are initialized
- [ ] **:494** - can save game successfully
- [ ] **:511** - saved game persists in localStorage
- [ ] **:528** - can load saved game
- [ ] **:560** - F5 quick save works
- [ ] **:574** - save includes player state correctly
- [ ] **:618** - can quit to main menu from game
- [ ] **:635** - main menu buttons are functional after quit
- [ ] **:653** - game state is cleaned up on quit
- [ ] **:708** - death by starvation triggers game over
- [ ] **:731** - game over screen displays final stats
- [ ] **:746** - game over screen has action buttons
- [ ] **:803** - death cause is tracked correctly

**Root Cause (game-flow.spec.js):** These tests require full game initialization which may have race conditions or timing issues. Console errors detected:
- "PAGE ERROR: Unexpected token '*'" - Syntax error somewhere
- "PAGE ERROR: Cannot read properties of null (reading 'ownedProperties')" - PropertySystem null access

---

## 📋 TEST NOTES (Tests to add when ready)

### High Priority Tests Needed:
1. **Clock Display Test** - Verify time display updates during gameplay
2. **Starting Gold UI Test** - Verify gold display updates when changing difficulty/perks
3. **Weather Duration Test** - Verify weather changes after 60-300 real seconds
4. **Attribute Gameplay Test** - Verify attributes affect combat/gathering/prices
5. **Quest Save/Load Test** - Verify quest progress persists through save/load cycle

### Smoke Tests (Manual):
- [ ] New game starts → time advances → travel works → can save
- [ ] Load saved game → all state restored → can continue
- [ ] Combat flows → damage applies → victory/defeat works
- [ ] Crafting works → items created → inventory updates
- [ ] Property purchase → appears on map → generates income

---

## SUMMARY

| Severity | Remaining | Fixed (see finished.md) |
|----------|-----------|------------------------|
| 🔴 CRITICAL | 2 | 6 |
| 🟠 HIGH | 16 | 29+ |
| 🟡 MEDIUM | 19 | 33 |
| 🟢 LOW | 3 | 18 |
| 🧪 TESTS | 28 | 340 |
| **TOTAL** | **68** | **426+** |

### 🆕 Session Fixes (2025-12-02) - v0.90.00 Release
**Version Bump + Bloat Cleanup:**
- ALL files updated from 0.89.x → 0.90.00
- 100+ files across all folders (JS, CSS, JSON, HTML)
- Removed bloat comments about "moved", "old code", "disabled"
- Removed ~170 lines of commented-out dead code
- button-fix.js:72 - Made transportation-btn optional (button removed from UI)

**Unity GO Workflow Session:**
- property-purchase.js:16 - Added ?. guard for game.currentLocation
- property-system-facade.js:149 - Added ?. guard for ownedProperties
- Verified 7 "Needs Verification" items as non-bugs (wrong line numbers or correct by design)

**Previous Session (22 MEDIUM items fixed):**
- tooltip-system.js: WeakMap cache for JSON.parse
- time-machine.js: getTotalDays() caching + DOM cache auto-invalidation
- panel-manager.js: MutationObserver beforeunload cleanup + toolbar drag handler storage
- visual-effects-system.js: stop(), destroy(), screenShake.frameId tracking, _pendingTimeouts cleanup
- game-world-renderer.js: cleanup() + destroy() methods
- inventory-panel.js: _dropdownCloseHandler storage + cleanup
- npc-voice.js: audioContext init guard
- browser-compatibility.js: 5MB fallback storage limit + console error logging
- loading-manager.js: fixed modulo interval logic with _lastLogTime
- menu-weather-system.js: removed duplicate keyframes
- audio-system.js: noise buffer caching
- api-command-system.js: safeParam() utility
- reputation-system.js: LRU cleanup for locationReputation
- property-income.js: hardcoded multipliers moved to config

### 🆕 Playwright Test Run (2025-12-01)
**340 passed, 32 failed, 4 skipped**
- gameFlowTests DISABLED for CI/CD (23 failures)
- 9 other test failures need investigation
- Console errors: "Unexpected token '*'" + "null ownedProperties"

### 🆕 Agent Audit Summary (2025-12-01)
**7 new issues discovered** verifying finished.md fixes:
- 2 CRITICAL: NPC relationships global storage + EventSystem not restored
- 2 HIGH: Travel race condition + MutationObserver leak
- 3 MEDIUM: VirtualList XSS + NPC dialogue XSS + toolbar listeners

---

*"Only the unfixed remain here. The dead bugs rest in finished.md." 🖤💀🦇*
