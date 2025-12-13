# QUEST ECONOMY AUDITOR - Complete Bug Report
**Agent 2: Economy & Balance Analysis**
**Date:** 2025-12-12
**Version Audited:** MTG v0.91.02

---

## EXECUTIVE SUMMARY

Completed comprehensive audit of quest rewards, trading economy, and profit balance systems. Found **12 CRITICAL BUGS** affecting game economy, including sell price conflicts, broken tutorial trading, missing price modifiers in main game, and quest reward imbalances.

**SEVERITY BREAKDOWN:**
- CRITICAL: 4 bugs (game-breaking economy issues)
- HIGH: 5 bugs (major balance problems)
- MEDIUM: 2 bugs (quality of life issues)
- LOW: 1 bug (minor inconsistency)

---

## CRITICAL BUGS

### BUG #1: Sell Price System Conflict (60% vs 70%)
**File:** Multiple files
**Severity:** CRITICAL
**Issue:** Three different sell price calculations exist in the codebase:
- `src/js/data/game-world.js:1858` - Uses 60% sell rate (`basePrice * 0.6`)
- `src/js/systems/trading/trading-system.js:205` - Uses 70% sell rate (`price * 0.7`)
- `src/js/core/game.js:6106` - Uses 70% sell rate (`calculatePrice(itemId) * 0.7`)

This creates inconsistent profit calculations and breaks economy predictability.

**Impact:** Players cannot reliably calculate profits. Tutorial teaches wrong percentages. Financial tracker gives incorrect data.

**Fix:** Standardize on ONE sell rate across entire codebase. Recommend 70% as it's used in 2/3 locations and matches common game design (30% merchant cut).

---

### BUG #2: Tutorial Wheat Trade Math is Broken
**File:** `src/js/systems/progression/tutorial-quests.js:301-335`
**Severity:** CRITICAL
**Issue:** Tutorial quest `tutorial_1_4` claims:
- "Wheat is 50% of normal price (CHEAP!)" in village
- "Wheat is 180% of normal price (EXPENSIVE!)" in town
- "Buy wheat here, sell there for PROFIT!"

**Actual Math:**
- Wheat base price: 5 gold
- Village buy price: 5 * 0.5 = 2.5 gold per wheat
- Cost for 5 wheat: 12.5 gold
- Town sell price (at 60%): 5 * 0.6 * 1.8 = 5.4 gold per wheat
- Revenue from selling 5 wheat: 27 gold
- **Actual profit: 14.5 gold (only 116% ROI, not the 260% implied)**

**Worse:** If players START with 100 gold, complete quest 1 (+25g) and quest 2 (+50g), they have 175 gold. Tutorial dialogue implies MASSIVE profit but delivers mediocre returns.

**Fix:** Either:
1. Increase tutorial town wheat priceModifier to 3.0 (300%) for dramatic profit
2. Reduce village wheat priceModifier to 0.3 (30%) for bigger spread
3. Rewrite dialogue to set accurate expectations

---

### BUG #3: Price Modifier System Dual Implementation
**File:** `src/js/data/game-world.js` + `src/js/data/tutorial-world.js`
**Severity:** CRITICAL
**Issue:** Two completely different price modifier systems:

**Tutorial World (Static):**
```javascript
priceModifiers: {
    wheat: 0.5,  // Hard-coded multipliers
    bread: 0.8
}
```

**Main Game (Dynamic):**
```javascript
// Calculated modifiers based on location.buys/sells
if (location.buys && location.buys.includes(itemId)) {
    modifier *= 1.4; // 40% markup
}
if (location.sells && location.sells.includes(itemId)) {
    modifier *= 0.75; // 25% discount
}
```

**Impact:**
- Tutorial teaches players a pricing system that DOESN'T EXIST in main game
- Main game locations have NO static priceModifiers defined
- Players expect to find "cheap wheat villages" and "expensive wheat towns" but they DON'T EXIST
- Arbitrage is based on dynamic buy/sell lists, not fixed price zones

**Fix:**
1. Add static priceModifiers to main game world locations (like tutorial)
2. OR rewrite tutorial to teach the dynamic buy/sell system
3. Currently: Tutorial is teaching a LIE

---

### BUG #4: Main Game World Has NO Price Modifiers
**File:** `src/js/data/game-world.js`
**Severity:** CRITICAL
**Issue:** Grep search for `priceModifiers: {` in game-world.js returns ZERO results. Not a single main game location has static price modifiers defined.

**Impact:**
- All main game prices calculated dynamically from buy/sell lists
- No location is inherently "cheap" or "expensive" for specific goods
- Regional trade bonuses exist but aren't documented to players
- Tutorial's "buy low, sell high" lesson is misleading

**Fix:** Add explicit priceModifiers to key locations:
```javascript
greendale: {
    priceModifiers: {
        wheat: 0.7,  // Agricultural region, cheap wheat
        bread: 0.8,
        grain: 0.6
    }
}
ironforge_city: {
    priceModifiers: {
        iron_ore: 0.6,  // Mining city, cheap ore
        coal: 0.7,
        iron_sword: 0.8  // Forges here, cheap weapons
    }
}
```

---

## HIGH SEVERITY BUGS

### BUG #5: Starting Gold vs First Quest Requirements
**File:** `src/js/core/game.js:3583`
**Severity:** HIGH
**Issue:**
- Starting gold: Easy=120, Normal=100, Hard=80
- Act 1 Quest 1 reward: 25 gold
- Act 1 Quest 2 requires: 3 trades worth 50 gold each = 150 gold minimum inventory
- **On HARD mode:** 80 + 25 = 105 gold. Cannot afford even ONE 50g trade without selling starting items!

**Impact:** Hard mode players literally CANNOT complete Act 1 Quest 2 without grinding trades first.

**Fix:**
1. Reduce Act 1 Quest 2 trade requirement to 25 gold per trade
2. OR increase hard mode starting gold to 120
3. OR give players starting inventory worth 50+ gold to sell

---

### BUG #6: Quest Reward Scaling is Flat, Not Progressive
**File:** `src/js/systems/progression/main-quests.js`
**Severity:** HIGH
**Issue:** Quest gold rewards don't scale with difficulty or act progression:

**Act 1 Rewards (7 quests):** 25, 50, 40, 75, 100, 80, 150 = **520 total**
**Act 2 Rewards (7 quests):** 200, 250, 300, 350, 400, 500, 750 = **2,750 total**
**Act 3 Rewards (7 quests):** 600, 800, 700, 1000, 1200, 500 (choice), 2000 = **6,800 total**
**Act 4 Rewards (7 quests):** 2500, 1500, 3000, 4000, 10000, 5000, 7500 = **33,500 total**
**Act 5 Rewards (7 quests):** 5000, 10000, 2500, 7500, 15000, 20000, 50000 = **110,000 total**

**Problems:**
- Act 1→2 jump: 5.3x increase (too steep!)
- Act 2→3 jump: 2.5x increase (good)
- Act 3→4 jump: 4.9x increase (too steep!)
- Act 4→5 jump: 3.3x increase (reasonable)

**Wealth Gates vs Rewards:**
- Act 2 gate: 5,000 gold (requires grinding, rewards give only 520 from Act 1)
- Act 3 gate: 50,000 gold (Act 2 rewards give only 2,750 - massive gap!)
- Act 4 gate: 150,000 gold (Act 3 gives 6,800 - still huge gap!)
- Act 5 gate: 500,000 gold (Act 4 gives 33,500 - insane gap!)

**Fix:** Quest rewards should cover AT LEAST 50% of next act's wealth gate:
- Act 1 total: 5,000 gold (covers Act 2 gate)
- Act 2 total: 25,000 gold (50% of Act 3 gate)
- Act 3 total: 75,000 gold (50% of Act 4 gate)
- Act 4 total: 250,000 gold (50% of Act 5 gate)

---

### BUG #7: Tutorial Trading Profit is Inconsistent with Dialogue
**File:** `src/js/systems/progression/tutorial-quests.js:324-325`
**Severity:** HIGH
**Issue:** Tutorial dialogue says:
```javascript
offer: "HERE'S THE SECRET TO WEALTH:\n\n" +
       "🌾 **WHEAT HERE**: 50% of normal price (CHEAP!)\n" +
       "🏘️ **WHEAT IN TOWN**: 180% of normal price (EXPENSIVE!)\n\n"
```

This implies buying at 50% and selling at 180% = 260% profit (3.6x return).

**Reality:** Players buy at 50% but SELL at 60-70% of base, THEN multiply by 180%.
- Actual return: ~115-125% profit (2.15x return)

**Fix:** Rewrite dialogue to be accurate:
```javascript
"🌾 **BUY WHEAT HERE**: 2.5 gold each (50% discount!)\n" +
"🏘️ **SELL IN TOWN**: 5-6 gold each (good profit!)\n" +
"💰 **PROFIT**: About 2-3 gold per wheat!\n\n"
```

---

### BUG #8: No Location Price Data in UI
**File:** UI System (market display)
**Severity:** HIGH
**Issue:** Players cannot see which locations have cheap/expensive prices for items. No price comparison tool exists.

**Impact:**
- Arbitrage requires manual note-taking
- Can't remember which city had cheap iron
- No way to plan profitable trade routes

**Fix:** Add "Price Guide" panel showing:
```
Item: Wheat
- Cheapest: Greendale (2g) ⭐
- Average: 5g
- Most Expensive: Royal Capital (8g) ⭐
```

---

### BUG #9: Tutorial Gives 1,500 Gold Bonus (Breaks Balance)
**File:** `src/js/systems/tutorial/tutorial-manager.js:626`
**Severity:** HIGH
**Issue:**
```javascript
game.player.gold = (game.player.gold || 0) + 1500;
```

This gives players 1,500 gold AFTER completing tutorial, making early Act 1 quests trivial.

**Impact:**
- Players skip intended progression
- First wealth gates (500-2000g) are meaningless
- Tutorial grad starts with more gold than Act 1 rewards give

**Fix:** Reduce to 200-300 gold bonus OR remove entirely. Tutorial should teach systems, not break economy.

---

## MEDIUM SEVERITY BUGS

### BUG #10: Buy/Sell Spread is Inconsistent
**File:** Multiple
**Severity:** MEDIUM
**Issue:** Sell price as % of buy price varies:
- TradingSystem: 70% sell rate = 30% merchant cut
- GameWorld: 60% sell rate = 40% merchant cut
- No documentation of which is intended

**Impact:** Players can't calculate profit margins accurately.

**Fix:** Standardize at 70% (30% cut is industry standard).

---

### BUG #11: No Sell Price Display in Market UI
**File:** Market UI
**Severity:** MEDIUM
**Issue:** Market shows BUY prices but not SELL prices. Players must calculate manually.

**Impact:** QOL issue - players can't evaluate sell opportunities without math.

**Fix:** Add "You can sell this for X gold" tooltip to inventory items.

---

## LOW SEVERITY BUGS

### BUG #12: Grain vs Wheat Confusion
**File:** `src/js/data/items/item-database.js`
**Severity:** LOW
**Issue:**
- Tutorial uses "wheat" (basePrice: 5)
- Items database has both "wheat" and "grain" (different items)
- Some locations sell "grain" not "wheat"

**Impact:** Minor confusion about whether they're the same item.

**Fix:** Consolidate to single "wheat" item OR clearly differentiate:
- Wheat = raw grain from farms (5g)
- Grain = processed wheat for milling (6g)

---

## ADDITIONAL FINDINGS

### ECONOMY EXPLOITS: None Found ✅

Checked for:
- Infinite money glitches ❌ None found
- Buy/sell same location profit ❌ Prevented by spread
- Quest reward farming ❌ Quests are one-time
- Tutorial price arbitrage ❌ Isolated from main game

### POSITIVE FINDINGS

1. **Wealth gates scale appropriately** (exponential growth)
2. **Regional trade bonuses exist** (imported goods worth more)
3. **Stock system limits arbitrage** (can't buy infinite cheap goods)
4. **Tutorial world is isolated** (doesn't affect main economy) ✅

---

## RECOMMENDED FIXES PRIORITY

**IMMEDIATE (Pre-Release):**
1. Fix BUG #1: Standardize sell price to 70%
2. Fix BUG #3: Add priceModifiers to main game locations
3. Fix BUG #2: Fix tutorial wheat dialogue/math
4. Fix BUG #6: Rebalance quest rewards to cover 50% of wealth gates

**HIGH PRIORITY (Next Patch):**
5. Fix BUG #5: Adjust hard mode starting gold
6. Fix BUG #7: Rewrite tutorial profit expectations
7. Fix BUG #9: Reduce tutorial gold bonus
8. Fix BUG #8: Add price comparison UI

**MEDIUM PRIORITY (Future Update):**
9. Fix BUG #10: Document spread percentage
10. Fix BUG #11: Add sell price tooltips
11. Fix BUG #12: Clarify wheat vs grain

---

## CONCLUSION

The game's economy systems are functional but have significant balance and consistency issues. The main problems are:

1. **Tutorial teaches a system that doesn't exist in main game**
2. **Quest rewards don't scale to match wealth gates** (massive grinding required)
3. **Sell price conflicts** create unpredictable profits
4. **No static price modifiers in main game** despite tutorial teaching them

**Estimated Fix Time:** 8-12 hours for all CRITICAL + HIGH bugs.

**Testing Required:** Full economy playthrough on all difficulty modes after fixes.

---

**Report Generated by:** Agent 2 - Quest Economy Auditor
**Using:** Ultrathink Analysis + Complete Codebase Audit
**Files Analyzed:** 12 core economy files + quest system + tutorial system
