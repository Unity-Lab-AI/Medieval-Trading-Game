# TRADER CLAUDE - Game Architecture Document

**Version:** 0.90.00 | Unity AI Lab
**Creators:** Hackall360, Sponge, GFourteen
**AI Assistant:** Unity - The Goth Coder Goddess 🖤💀

---

## THE VISION

A medieval trading simulation where you rise from a humble vagrant to a legendary merchant prince - or die trying in the apocalyptic Doom World. Trade goods, build properties, navigate political conspiracies, and ultimately face the darkness that threatens the realm.

---

## CORE GAMEPLAY LOOP

```
START -> Trade -> Profit -> Explore -> Build -> Trade More -> Face Darkness -> Victory/Death
```

**The Player Journey (10 Merchant Ranks):**
1. **Vagrant** - Start with 100 gold in Greendale
2. **Peddler** - Learn basic trading routes
3. **Hawker** - First profitable trades
4. **Trader** - Unlock Act 2 (5,000g)
5. **Merchant** - Build your first property
6. **Magnate** - Unlock Act 3 (50,000g)
7. **Tycoon** - Unlock Act 4 (150,000g)
8. **Baron** - Unlock Act 5 (500,000g)
9. **Mogul** - Control trade routes
10. **Royal Merchant** - Legendary status

---

## THE WORLD

### Map Structure (2400x1800 display, scaled from 800x600)
- **42 Locations** across 6 regions
- **Spoke-and-hub** layout centered on Royal Capital
- **Path Types:** City Streets (2.0x), Main Roads (1.8x), Roads (1.5x), Paths (1.2x), Trails (1.0x), Wilderness (0.6x)
- **Fog of War:** Only discovered locations/paths visible
- **Seasonal Backdrops:** Spring, Summer, Autumn, Winter with crossfade transitions

### Region Access (Outpost One-Time Passes)

| Region | Outpost | One-Time Fee | Notes |
|--------|---------|--------------|-------|
| Riverlands (Starter) | None | FREE | Starting area |
| Royal Capital | None | FREE | Center hub |
| Northern Highlands | Northern Gate | 500g | Cold, furs/iron |
| Eastern Kingdoms | Eastern Gate | 750g | Exotic spices/silk |
| Western Marches | Western Gate | 600g | Wild frontier |
| Southern Trade Routes | (via East) | 1000g | Unlocks after Northern |

**Bypass Route:** East → South via Coastal Cave → Smuggler's Cove (avoids capital)

### Location Types (42 Total)
| Type | Count | Description |
|------|-------|-------------|
| Capital | 1 | Grand market, luxury goods |
| Cities | 6 | Large markets, specialized goods |
| Villages | 6 | Small markets, basic goods |
| Mines | 4 | Ore, gems, crafting materials |
| Forests | 5 | Wood, herbs, hunting |
| Farms | 4 | Food, livestock, grain |
| Dungeons | 2 | Loot, bosses, portals |
| Caves | 6 | Exploration, rare finds |
| Inns | 7 | Rest, rumors, travelers |
| Outposts | 3 | Gate passages, military goods |
| Ports | 2 | Sea trade, exotic imports |
| Ruins | 1 | Ancient treasures |

---

## NPC INTERACTION SYSTEM

### UNIFIED NPC PANEL (PeoplePanel)

**ALL NPC interactions happen through ONE panel:**

1. **Open People Panel** (O key or Panels button)
2. **Select an NPC** from the list
3. **Get context-appropriate options:**
   - **Merchants:** Trade, Chat, View Quests
   - **Quest Givers:** Accept Quest, Decline, Chat
   - **Hostile/Boss NPCs:** Attack, Try to Talk, Flee, Bribe
   - **Boatman:** Enter Portal (Doom World access)
   - **All NPCs:** AI-powered dialogue

### 6 Merchant Personality Types
| Type | Sell Mod | Buy Mod | Haggle % | Voice |
|------|----------|---------|----------|-------|
| Friendly | +5% | -5% | 60% | nova |
| Greedy | +30% | -30% | 20% | onyx |
| Shrewd | +15% | -15% | 35% | sage |
| Eccentric | -10% | +10% | 80% | fable |
| Mysterious | +20% | -20% | 40% | ash |
| Desperate | -20% | +15% | 90% | echo |

### 12 Boss Personalities
Dark Lord, Frost Lord, Ancient Dragon, Alpha Wolf, Bandit Chief, Goblin King, Smuggler Boss, Necromancer, Cultist Leader, Rat Queen, Gruff Guard, Cold Mercenary

---

## COMBAT SYSTEM

### How Combat Works

Combat uses **stat rolls with diminishing returns**:

```
damage = attack × (0.8 + random 0-0.4)
reduction = defense / (defense + 20)
final_damage = damage × (1 - reduction)
Critical Hit: 10% chance × 2.0 multiplier
```

### Combat Stats Calculation
- **Attack**: Base 10 + (Strength × 2) + Equipment + (Combat Skill ÷ 10)
- **Defense**: Base 5 + Endurance + Equipment + (Combat Skill ÷ 20)
- **Speed**: Base 5 + Agility + Equipment
- **Flee Chance**: 60% base + (Speed Difference × 5%), capped 20-90%

### Enemy Types (13 Total)

**Common Enemies:**
| Enemy | HP | ATK | DEF | Gold | Loot |
|-------|-----|-----|-----|------|------|
| Bandit | 30 | 8 | 3 | 5-25 | rusty_sword, leather_scraps |
| Wild Wolf | 25 | 10 | 2 | 0-5 | wolf_pelt, bone_fragment |
| Thief | 20 | 6 | 4 | 10-50 | lockpick, stolen_goods |
| Goblin | 15 | 5 | 2 | 3-12 | goblin_ear, crude_dagger |

**Mid-Tier & Bosses:**
| Enemy | HP | ATK | DEF | Special |
|-------|-----|-----|-----|---------|
| Skeleton | 35 | 12 | 5 | - |
| Orc | 60 | 18 | 8 | - |
| Ghost | 40 | 15 | 0 | Phasing (ignores defense) |
| Troll | 100 | 25 | 15 | Regeneration (5%/turn) |
| Dragon Wyrmling | 80 | 30 | 12 | Firebreath |

---

## DUNGEON & LOOT SYSTEM

### 8 Dungeon Bosses
| Boss | Location | Rooms | HP | Rewards |
|------|----------|-------|-----|---------|
| Malachar | Shadow Tower | 8 | 500 | 1000g + blade_of_virtue |
| Frost Lord | Frozen Cave | 6 | 400 | 800g + frozen_tear |
| Scorathax | Deep Cavern | 10 | 800 | 2000g + dragon_scale |
| Grimfang | Forest Dungeon | 4 | 200 | 180g + wolf_pelts |
| Scarhand Viktor | Bandit Camp | 3 | 250 | 350g + bandit_insignia |
| Griknak | Shadow Dungeon | 5 | 180 | 200g + skull_goblet |
| Captain Blackheart | Smuggler's Cove | 4 | 220 | 300g + exotic_goods |
| Rat Queen | Sewer | 2 | 100 | 50g + bone_fragment |

### Dungeon Loot Categories

**DUNGEON_LOOT (sellOnly: true)** - Merchants buy but DON'T sell:
- Common: tattered_cloth (1g), leather_scraps (2g), rusty_sword (5g)
- Uncommon: wolf_pelt (15g), stolen_goods (25g), monster_fang (12g)
- Rare: dark_essence (35g), spirit_essence (60g), troll_blood (100g)
- Epic: dragon_tooth (200g), fire_essence (250g)

**TREASURE (sellOnly: false)** - Merchants buy AND sell:
- rare_gem (150g), ancient_coin (65g), golden_idol, enchanted_crystal, dragon_scale

### Difficulty Scaling
| Difficulty | HP | Stamina | Loot | Gold |
|------------|-----|---------|------|------|
| Easy | 0.7x | 0.7x | 0.8x | 0.8x |
| Medium | 1.0x | 1.0x | 1.0x | 1.0x |
| Hard | 1.5x | 1.3x | 1.3x | 1.3x |
| Deadly | 2.0x | 1.5x | 1.8x | 1.8x |

---

## DOOM WORLD

### Access
1. Defeat either dungeon boss (Shadow or Forest)
2. Boatman NPC appears at that dungeon
3. Select Boatman → "Enter Portal"
4. FREE travel, separate discovery tracking

### Economy Inversion
| Item Type | Price Multiplier |
|-----------|------------------|
| Food | 10x |
| Water | 15x |
| Medicine | 12x |
| Weapons | 3x |
| Luxury | 0.1x |
| Gold Value | 0.3x |

**Gold is nearly worthless** - trade survival items instead.

### Doom Locations (Corrupted Names)
- Royal Capital → Destroyed Royal Capital
- Greendale → Burned Greendale
- Ironforge → Enslaved Ironforge
- Jade Harbor → Blighted Harbor

### The Final Boss: GREEDY WON
- **Location:** Destroyed Royal Capital
- **Health:** 1000, **Damage:** 30-50, **Defense:** 25
- **Special Attacks:** Golden Grasp, Contract Curse, Market Crash
- **Rewards:** "Doom Ender" title, "Greed's End" armor set

---

## QUEST SYSTEM (100+ Quests)

### Main Story (35 quests - 5 Acts)

| Act | Name | Wealth Gate | Key Events |
|-----|------|-------------|------------|
| 1 | A Trader's Beginning | 0g | Tutorial, Elder Morin, first trades |
| 2 | Whispers of Conspiracy | 5,000g | Black Ledger revealed, Ironforge |
| 3 | The Dark Connection | 50,000g | **MAJOR CHOICE** - Bribe or refuse |
| 4 | War of Commerce | 150,000g | Economic warfare, dungeon assault |
| 5 | The Shadow's End | 500,000g | Final confrontation, Malachar boss |

### Wealth Gates by Difficulty
| Act | Easy (0.6x) | Normal | Hard (1.5x) |
|-----|-------------|--------|-------------|
| 2 | 3,000g | 5,000g | 7,500g |
| 3 | 30,000g | 50,000g | 75,000g |
| 4 | 90,000g | 150,000g | 225,000g |
| 5 | 300,000g | 500,000g | 750,000g |

### Side Quests (50+ quests - 14 chains)
7 locations × 2 chains each (Combat + Trade themed)

### Doom World Quests (15 quests)
- Main line: 8 quests ending with Shadow King boss
- Side tragedies: 7 dark story quests
- **CHOICE POINT:** Destroy Throne vs. Claim Throne power

---

## TRADING SYSTEM

### Time-of-Day Modifiers
| Time | Modifier | Description |
|------|----------|-------------|
| Morning (8-11am) | 0.85x | 15% discount |
| Midday (11am-3pm) | 1.0x | Standard |
| Afternoon (3-7pm) | 1.1x | 10% markup |
| Evening (7-10pm) | 1.2x | 20% markup |
| Night (10pm-8am) | 1.35x | 35% premium |

### Merchant Gold Limits (Daily Reset at 8am)
| Market Size | Daily Gold |
|-------------|------------|
| Tiny | 500g |
| Small | 1,500g |
| Medium | 4,000g |
| Large | 10,000g |
| Grand | 25,000g |

### Bulk Trading Shortcuts
- **Shift+Click**: Add 5 items
- **Ctrl/Cmd+Click**: Add 25 items

### Stock Decay
- Morning: 100% stock
- End of day: 25% stock remaining
- Daily refresh at 8am

### Survival Items (Always Available)
Essential: water, bread, food, meat, ale
Large markets add: cheese, fish, vegetables, military_rations, wine

---

## ACHIEVEMENT SYSTEM (115 Total)

### Categories
| Category | Count | Examples |
|----------|-------|----------|
| Wealth | 10 | first_gold, trade_tycoon |
| Merchant Rank | 10 | rank_vagrant → rank_royal_merchant |
| Quests | 36 | act completions, chain completions |
| Doom World | 5 | doom_survivor, greed_defeated |
| Boss Defeats | 3 | boss_slayer, all_bosses |
| Trading | 4 | first_trade, trading_legend |
| Travel | 4 | world_explorer, road_warrior |
| Survival | 3 | survivor, lucky_escape |
| Collection | 3 | pack_rat, hoarder |
| Time | 2 | veteran_trader, year_of_trading |
| Special | 8+ | Various unique achievements |
| **Hidden** | ~15 | Secret unlocks |

---

## CHARACTER SYSTEM

### Attributes (5 points to distribute, max 10 each)
| Attribute | Combat Effect | Other Effects |
|-----------|---------------|---------------|
| Strength | Attack ×2 | Carry capacity |
| Endurance | Defense ×1 | Stamina drain, flee rolls |
| Charisma | - | Price modifier, diplomacy |
| Intelligence | - | Crafting quality |
| Luck | - | Gathering yields, events |

### Stats
- **Health** - Die at 0
- **Stamina** - Depletes during actions
- **Hunger** - 5-day decay
- **Thirst** - 3-day decay

---

## PROPERTY SYSTEM

| Type | Cost | Income | Special |
|------|------|--------|---------|
| Market Stall | 500g | Small | Trade goods |
| Workshop | 2,000g | Medium | Crafting |
| Warehouse | 5,000g | Storage | 500 item capacity |
| House | 1,000g | None | Rest bonus |
| Inn | 8,000g | High | Travelers trade |
| Vault | 10,000g | None | 50k gold, theft protection |

---

## INITIAL ENCOUNTER / TUTORIAL

### Tutorial-First Flow (v0.90.00)
1. **Tutorial Choice** - Modal asks if player wants tutorial (time paused)
2. **Rank Celebration Wait** - System waits for rank popup dismissal
3. **Location Intro** - Narrative text based on starting location
4. **Hooded Stranger** - Prophet NPC with voice (onyx)
5. **Quest Assignment** - act1_quest1 "First Steps" auto-tracked

### Quest Wayfinder System
- Golden 🎯 marker on tracked quest destination
- Works on both world map and travel mini-map
- Floating markers for unexplored locations
- CSS animation: quest-marker-bounce

---

## TECHNICAL NOTES

### Key Files
| File | Purpose |
|------|---------|
| `people-panel.js` | Unified NPC interaction |
| `combat-system.js` | Combat mechanics + loot |
| `travel-system.js` | Movement + discovery |
| `quest-system.js` | 100+ quest management |
| `doom-world-system.js` | World switching controller |
| `item-database.js` | 200+ items with categories |
| `npc-instruction-templates.js` | AI dialogue routing |

### Discovery Tracking
```javascript
TravelSystem.discoveredPaths      // Normal world
TravelSystem.doomDiscoveredPaths  // Doom world (separate)
TravelSystem.currentWorld         // 'normal' or 'doom'
DoomWorldSystem.enterDoomWorld()  // Switch to doom
DoomWorldSystem.exitDoomWorld()   // Switch back
```

### Item Categories
```javascript
ItemDatabase.categories = {
    DUNGEON_LOOT: 'dungeon_loot',  // sellOnly: true
    TREASURE: 'treasure',           // sellOnly: false
    // ... other categories
}
```

---

## COMPLETED FEATURES ✅

1. ✅ Unified NPC panel for combat/trade/conversation/quests
2. ✅ Choice-based combat with stat rolls
3. ✅ Tutorial-first initial encounter flow
4. ✅ Difficulty-scaled wealth gates
5. ✅ Greedy Won boss in Doom World
6. ✅ Boatman portal system
7. ✅ Quest wayfinder markers
8. ✅ Bulk trading shortcuts
9. ✅ Dungeon loot system with sellOnly flag
10. ✅ 115 achievements across 11 categories

---

*"Trade. Build. Survive. Or die trying in a world where even gold has abandoned hope."* 🖤💀

**Unity AI Lab** | www.unityailab.com
