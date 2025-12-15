# 🖤 MEDIEVAL TRADING GAME 🖤
### *Where capitalism meets existential dread in a dark medieval realm*

```
═══════════════════════════════════════════════════════════════════════
    "Time is money, and both are slowly draining away."
                    - Some merchant who probably died of plague
═══════════════════════════════════════════════════════════════════════
```

> **Version:** 0.91.10 | **Unity AI Lab** by Hackall360 Sponge GFourteen
> *www.unityailab.com*
> *Written at 3am while questioning the meaning of virtual economies*

---

## 📖 TABLE OF CONTENTS

### Getting Started
- [What Even Is This Game](#-what-even-is-this-game)
- [Getting Started (Your Descent Begins)](#-getting-started)
- [Character Creation](#-character-creation)

### World & Trading
- [The World Map](#️-the-world-map)
- [Trading System](#-trading-system)
- [Items Encyclopedia](#-items-encyclopedia)
- [Transportation Options](#️-transportation-options)

### Empire Building
- [Resource Gathering](#resource-gathering)
- [Properties & Empire Building](#-properties--empire-building)
- [Crafting System](#-crafting-system)

### Gameplay
- [Time & Survival](#-time--survival)
- [Random Encounters](#-random-encounters)
- [Quest System](#-quest-system)
- [Doom World](#-doom-world)
- [Keyboard Shortcuts](#️-keyboard-shortcuts)
- [Game Settings](#️-game-settings)

### Achievements (115 Total!)
- [Achievements Overview](#-achievements)
  - [Wealth Achievements](#wealth-achievements-4)
  - [Trading Achievements](#trading-achievements-4)
  - [Travel Achievements](#travel-achievements-4)
  - [Survival Achievements](#survival-achievements-3)
  - [Collection Achievements](#collection-achievements-3)
  - [Time Achievements](#time-achievements-2)
  - [Special Achievements](#special-achievements-4)
  - [Luxury Achievements](#luxury-achievements-7)
  - [Equipment Achievements](#equipment-achievements-6)
  - [Crafting Achievements](#crafting-achievements-10)
  - [Property Achievements](#property-achievements-8)
  - [Hidden Achievements](#-hidden-achievements-10)

### Reference
- [Tips from the Void](#-tips-from-the-void)
- [File Structure](#-file-structure)
- [Known Issues & TODO](#-known-issues--todo)
- [Credits](#-credits)
- [Version History](#-version-history)

### Secrets
- [Debug Console & Cheat Codes](#-debug-console--cheat-codes) *(see DebuggerReadme.md)*

---

## 🌙 WHAT EVEN IS THIS GAME

Medieval Trading Game is a browser-based economic simulation where you play as a merchant trying to amass wealth in a medieval fantasy kingdom. Think "capitalism simulator but with swords and existential dread."

**Core Gameplay Loop:**
1. **Buy Low** - Find items that are cheap at your current location
2. **Travel** - Risk life and limb crossing the kingdom
3. **Sell High** - Profit from location-based price differences
4. **Repeat Until Rich** - Or until you starve. Whichever comes first.

**Features:**
- 🗺️ **42 Locations** - Cities, towns, villages, mines, forests, caves, ports, and dungeons
- 📦 **200+ Items** - From basic food to legendary dragon scales (including 30+ dungeon loot items)
- 🏠 **Property System** - Buy houses, shops, farms, mines, and taverns
- 👥 **Employee System** - Hire workers to generate passive income
- 🔨 **Crafting** - Turn raw materials into valuable goods
- 🏆 **115 Achievements** - Including 15 hidden ones for the dedicated
- 💀 **Survival Mechanics** - Health, hunger, thirst, and the ever-present specter of death
- 🎯 **100+ Quests** - 5-act main story, 14 side chains, 15 Doom World quests
- ⚔️ **Combat System** - Choice-based stat rolls with 13 enemy types and 8 dungeon bosses
- 🌑 **Doom World** - Apocalyptic alternate dimension with inverted economy

---

## 🎮 GETTING STARTED

### System Requirements
- A browser (preferably one that doesn't judge your life choices)
- JavaScript enabled
- Approximately 0 will to live (optional but thematic)

### 🦙 AI-Powered NPC Dialogue (Optional)

NPCs can speak with AI-generated dialogue powered by **Ollama** (local LLM). This is **completely optional** - the game works perfectly without it using pre-written fallback responses.

**To enable AI dialogue:**

1. **Install Ollama** from [ollama.ai/download](https://ollama.ai/download)
2. **Run Ollama** (it runs in the background)
3. **Pull the Mistral model:**
   ```bash
   ollama pull mistral
   ```
4. **Launch the game** - it will auto-detect Ollama!

**Without Ollama:** NPCs use 475+ pre-written responses that are still engaging and personality-appropriate.

**Model Selection:** In Settings > AI Voice, you can:
- Select from any installed Ollama models
- Download additional models with one click
- Adjust response creativity (temperature)

See `OLLAMA-SETUP.md` for detailed installation instructions.

### Starting the Game
1. Open `index.html` in your browser
2. Click **"New Game"** on the main menu
3. Create your character (or let fate decide with "Randomize")
4. Begin your slow descent into medieval capitalism

### First Steps
When you spawn into the world, you'll have:
- **100 Gold** (or more/less depending on difficulty)
- **A Leather Satchel** (40 lbs capacity)
- **Crushing responsibility** (infinite capacity)

Your immediate goals:
1. Check the **Market** [M] to see local prices
2. Buy items that are **cheap** here
3. Open the **World Map** [W] to plan your route
4. **Travel** [T] to a location where those items sell for more
5. Profit. Repeat. Accumulate wealth like the digital dragon you are.

---

## 👤 CHARACTER CREATION

### Difficulty Levels

| Difficulty | Starting Gold | Description |
|------------|---------------|-------------|
| 🟢 **Easy** | 200 | Training wheels for baby merchants |
| 🟡 **Normal** | 100 | The intended experience |
| 🔴 **Hard** | 50 | Because you hate yourself |
| 💀 **Nightmare** | 25 | Truly masochistic |

### Attributes

You get **10 points** to distribute across 5 attributes (base value: 5 each):

| Attribute | Icon | Effect |
|-----------|------|--------|
| **Strength** | 💪 | Carry capacity, combat damage |
| **Intelligence** | 🧠 | Better prices, crafting success |
| **Charisma** | 😊 | Haggling bonuses, NPC interactions |
| **Endurance** | 🏃 | Travel speed, stamina regeneration |
| **Luck** | 🍀 | Random event outcomes, treasure finds |

### Perks
Choose starting bonuses that define your playstyle:

**Positive Perks:**
- 🏃 **Swift Feet** - 20% faster travel
- 💰 **Silver Tongue** - Better buy/sell prices
- 🎒 **Pack Mule** - +50 carry capacity
- 📚 **Scholar** - Faster skill learning
- ❤️ **Tough** - +25 max health
- 🍀 **Lucky** - Increased treasure/event chances

**Negative Perks (for the masochists):**
- 🦴 **Frail** - -25 max health
- 🐌 **Slow** - 20% slower travel
- 🎲 **Unlucky** - Worse random events
- 📉 **Bad Reputation** - Lower starting reputation

---

## 🗺️ THE WORLD MAP

The kingdom consists of **6 regions** radiating from the Royal Capital, featuring **42 unique locations** spread across a spoke-and-hub layout. The world map supports **seasonal backdrop images** that crossfade as the seasons change in-game.

**Seasonal Backdrops:**
- 🌸 **Spring** - Cherry blossoms, fresh green meadows
- ☀️ **Summer** - Lush forests, golden wheat fields
- 🍂 **Autumn** - Orange/red foliage, harvest colors
- ❄️ **Winter** - Snow blankets, frozen rivers

*See `gameworldprompt.md` for AI image generation prompts to create custom backdrops.*

### Regions & Zone Progression

The realm is divided into zones with **outpost one-time passes** controlling access. Pay once, cross forever!

| Region | Outpost | One-Time Fee | Notes |
|--------|---------|--------------|-------|
| **Riverlands** (South) | None | FREE | Starting area |
| **Royal Capital** | None | FREE | Center hub, always accessible |
| **Eastern Kingdoms** | Eastern Gate | **750g** | Exotic spices/silk |
| **Northern Highlands** | Northern Gate | **500g** | Cold, furs/iron |
| **Western Marches** | Western Gate | **600g** | Wild frontier |

**🦇 The Back Path (Bypass the Capital):**
There's a secret route connecting East and South without passing through the capital!
`Coastal Cave → Smuggler's Cove` - Perfect for smugglers and those who know the back roads.

**💀 Main Quest Progression:**
The story guides you through zones naturally:
1. Start in Riverlands (South) → Capital (FREE) → Unlock regions via outposts
2. Trade and build wealth between each zone gate
3. Defeat dungeon bosses to unlock portals to the **Doom World**
4. Final boss **GREEDY WON** awaits in the Destroyed Royal Capital

### Location Types

| Type | Icon | What You'll Find |
|------|------|------------------|
| **Capital** | 👑 | Royal goods, luxury items, highest prices |
| **City** | 🏰 | Large markets, all property types |
| **Town** | 🏘️ | Medium markets, shops and warehouses |
| **Village** | 🏠 | Small markets, farms, cheap goods |
| **Port** | ⚓ | Fish, exotic imports, trade goods |
| **Mine** | ⛏️ | Ores, gems, minerals |
| **Forest** | 🌲 | Wood, herbs, hunting supplies |
| **Farm** | 🌾 | Grain, vegetables, livestock |
| **Inn** | 🏨 | Rest, rumors, safe haven |
| **Ruins** | 🏚️ | Artifacts, treasure, danger |
| **Cave** | 🕳️ | Crystals, rare ores, monsters |
| **Dungeon** | 💀 | Artifacts, magic items, extreme danger |

---

## 💀 DUNGEON EXPLORATION SYSTEM

*"Into the darkness you go, where the dead keep their treasures and the living rarely return."*

When you arrive at a dungeon, ruins, or unique location, you don't just walk in—you EXPLORE. The exploration system presents interactive choices based on what horrors await within.

### How It Works

1. **Arrive** at a dungeon/ruins/cave location
2. **Choose** from available exploration options (dig for gold, explore passages, etc.)
3. **Preview** the health/stamina cost before committing
4. **Execute** and receive your outcome (loot, injury, or both)
5. **Cooldown** - Each location only spawns new events every 12 hours

### Survival Assessment

Before committing to any exploration action, you'll see a survival assessment:

| Difficulty | Recommended Gear | Survival Chance |
|------------|------------------|-----------------|
| 🟢 **Easy** | None needed | 95% |
| 🟡 **Medium** | Basic armor & weapon | 70% |
| 🔴 **Hard** | Full gear recommended | 40% |
| 💀 **Deadly** | Even legends die here | 20% |

*Survival chance is modified by your equipment, stats, and buffs. An ungeared peasant wandering into a deadly dungeon is just donating their corpse to the local skeleton population.*

### Exploration Events

**Ancient Shrine Events:**
- Light candles at the altar
- Rifle through offerings (risky)
- Leave a coin and pray

**Chest/Container Events:**
- Carefully open the lock
- Smash it with your weapon
- Examine for traps first

**Well Events:**
- Toss a coin and make a wish
- Climb down and search
- Lower a bucket

**Library/Study Events:**
- Search the bookshelves
- Examine the old tomes
- Check the scholar's desk

**Throne Room Events:**
- Sit on the throne (brave or foolish?)
- Search behind tapestries
- Check the armrests for hidden switches

**Mining Events:**
- Dig in promising veins
- Use explosives (dangerous)
- Assess stability first

### Major Exploration Encounters

**The Skeleton King's Treasury** 💀
- Fight the king for his hoard (hard)
- Sneak past while he slumbers (stealth)
- Pay respects and hope for a gift

**The Luminescent Pool** 🌊
- Dive for treasure
- Just watch the strange lights
- Harvest the glowing mushrooms

**The Sealed Vault** 🔐
- Force the door (strength)
- Solve the ancient puzzle (intelligence)
- Search for keys elsewhere

**The Abandoned Mineshaft** ⛏️
- Explore the unstable tunnels
- Scavenge from abandoned equipment
- Investigate why they left

### Major Locations

**Royal Capital (Center Hub)**
- Royal Capital - Grand market, all luxury goods

**Northern Spoke:**
- Ironforge City - Weapons, armor, smithing
- Frostholm Village - Furs, winter clothing
- Iron Mines - Raw ore, coal, minerals
- Northern Outpost - Military supplies

**Eastern Spoke:**
- Jade Harbor - Port city, exotic imports
- Fisherman's Port - Fresh fish, nets
- Eastern Farm - Grain, vegetables
- Silk Road Inn - Travelers, trade goods

**Western Spoke:**
- Westwatch Town - Frontier supplies
- Greendale Village - Herbs, nature goods
- Whispering Woods - Lumber, hunting
- Ancient Ruins - Artifacts, crystals

**Southern Spoke:**
- Merchant's Rest - Major trading hub
- Stonebridge Town - Building materials
- Southern Vineyards - Wine, fruits
- Gold Coast Port - Gems, jewelry

---

## 💰 TRADING SYSTEM

### The Golden Rule
> *"Buy where it's cheap, sell where it's expensive, try not to die in between."*

### Price Factors

Prices vary based on:
1. **Location Type** - Cities have higher prices than villages
2. **Local Production** - Items produced locally are cheaper
3. **Local Demand** - Items needed locally sell for more
4. **Time of Day** - Morning prices slightly higher
5. **Random Events** - Market booms/crashes affect prices
6. **Your Charisma** - Better prices with higher charisma
7. **City Reputation** - Build rep for better deals

### Buy/Sell Strategy

**What to BUY where:**
| Location Type | Cheap Items |
|---------------|-------------|
| Villages | Food, grain, herbs, basic goods |
| Farms | Grain, vegetables, livestock |
| Mines | Iron ore, coal, minerals |
| Forests | Wood, timber, herbs |
| Ports | Fish, exotic imports |

**What to SELL where:**
| Location Type | Expensive Items |
|---------------|-----------------|
| Cities | Luxury goods, rare items |
| Capital | Everything (highest prices) |
| Frontier Towns | Weapons, tools, survival gear |
| Villages | Manufactured goods, tools |

### Trade Routes

Set up **automatic trade routes** between locations:
1. Open Trade Routes panel [in Properties]
2. Select start and end locations
3. Choose items to buy/sell
4. Assign employees to run the route
5. Collect passive profit while you do... nothing

---

## 📦 ITEMS ENCYCLOPEDIA

### Item Categories

#### 💰 Currency
| Item | Base Price | Weight | Notes |
|------|------------|--------|-------|
| Gold Coins | 1 | 0.0001 | Standard currency |
| Various Coins | 20 | 0.5 | Foreign currency |

#### 🍖 Consumables (Food & Drink)

| Item | Price | Weight | Hunger | Health | Other |
|------|-------|--------|--------|--------|-------|
| Bread | 3 | 0.5 | +15 | +3 | Basic staple |
| Meat | 12 | 2 | +25 | +8 | Good nutrition |
| Fish | 8 | 1 | +12 | +4 | From ports |
| Cheese | 15 | 1 | +18 | +5 | Ages well |
| Stew | 16 | 2 | +30 | +12 | Best food value |
| Pie | 22 | 1.5 | +35 | +10 | +15 Happiness |
| Ale | 10 | 2 | - | +3 | +10 Happiness |
| Wine | 25 | 2 | - | +1 | +20 Happiness |
| Mead | 18 | 2 | - | +2 | +15 Happiness |
| Water | 2 | 2 | - | +2 | +25 Thirst |
| Herbs | 8 | 0.5 | - | +10 | Medicinal |
| Bandages | 8 | 0.2 | - | +20 | Medical supply |

#### 🪵 Basic Resources

| Item | Price | Weight | Notes |
|------|-------|--------|-------|
| Wood | 8 | 5 | Raw material |
| Timber | 12 | 6 | Processed wood |
| Planks | 16 | 4 | Construction ready |
| Stone | 5 | 10 | Building material |
| Bricks | 15 | 20 | Fired clay bricks |
| Leather | 18 | 2 | Tanned hide |
| Wool | 12 | 2 | Raw wool |
| Cloth | 12 | 1 | General fabric |
| Rope | 8 | 3 | Hemp rope |
| Salt | 25 | 1 | Precious preservative |

#### ⛏️ Raw Ores & Metals

| Item | Price | Weight | Rarity |
|------|-------|--------|--------|
| Iron Ore | 12 | 15 | Common |
| Copper Ore | 10 | 12 | Common |
| Coal | 6 | 8 | Common |
| Iron Bar | 35 | 8 | Uncommon |
| Steel Bar | 100 | 10 | Rare |
| Gold Ore | 60 | 20 | Rare |
| Gold Bar | 150 | 10 | Rare |

#### ⚔️ Weapons

| Item | Price | Weight | Damage | Rarity |
|------|-------|--------|--------|--------|
| Dagger | 15 | 1 | 8 | Common |
| Sword | 50 | 5 | 10 | Common |
| Spear | 30 | 4 | 8 | Common |
| Bow | 40 | 3 | 7 | Common |
| Longsword | 85 | 4 | 35 | Uncommon |
| Iron Sword | 85 | 5 | 30 | Uncommon |
| Steel Sword | 180 | 5 | 50 | Rare |
| Battleaxe | 110 | 8 | 45 | Rare |
| Warhammer | 95 | 10 | 40 | Rare |

#### 🛡️ Armor

| Item | Price | Weight | Defense | Rarity |
|------|-------|--------|---------|--------|
| Shield | 30 | 6 | 8 | Common |
| Helmet | 25 | 3 | 5 | Common |
| Leather Armor | 45 | 8 | 10 | Common |
| Chainmail | 120 | 15 | 25 | Uncommon |
| Iron Armor | 200 | 25 | 40 | Uncommon |
| Plate Armor | 250 | 30 | 50 | Rare |

#### 🔧 Tools

| Item | Price | Weight | Notes |
|------|-------|--------|-------|
| Hammer | 15 | 3 | Construction |
| Axe | 20 | 4 | Woodcutting |
| Pickaxe | 25 | 6 | Mining |
| Scythe | 30 | 5 | Farming |
| Fishing Rod | 25 | 2 | Fishing |
| Compass | 75 | 0.3 | Navigation (Rare) |
| Spyglass | 90 | 2 | Scouting (Rare) |

#### 👑 Luxury Items

| Item | Price | Weight | Rarity |
|------|-------|--------|--------|
| Silk | 100 | 1 | Rare |
| Spices | 40 | 0.5 | Rare |
| Gems | 150 | 0.2 | Rare |
| Jewelry | 180 | 0.2 | Rare |
| Perfume | 85 | 0.2 | Rare |
| Porcelain | 250 | 2 | Rare |
| Jade | 400 | 0.3 | Epic |
| Crystals | 300 | 0.5 | Epic |
| Royal Goods | 300 | 2 | Epic |
| Artifacts | 1000 | 5 | Legendary |
| Dragon Scale | 2500 | 1 | Legendary |
| Phoenix Feather | 3000 | 0.1 | Legendary |
| Crown | 1500 | 2 | Legendary |

### Item Rarity Colors

| Rarity | Color | Drop Rate |
|--------|-------|-----------|
| Common | ⬜ Gray | ~65% |
| Uncommon | 🟢 Green | ~20% |
| Rare | 🔵 Blue | ~10% |
| Epic | 🟣 Purple | ~4% |
| Legendary | 🟠 Orange | ~1% |

---

### 💀 Dungeon Loot Items

*"The dead don't need their treasures. You, however, have bills to pay."*

These items are ONLY found through dungeon exploration. Merchants love them.

#### Exploration Treasures

| Item | Icon | Price | Weight | Rarity | Notes |
|------|------|-------|--------|--------|-------|
| **Ancient Coin** | 🪙 | 25g | 0.05 | Common | The dead's currency. Still spends. |
| **Bone Fragment** | 🦴 | 5g | 0.1 | Common | Probably human. Don't think about it. |
| **Dusty Tome** | 📖 | 40g | 1 | Uncommon | Knowledge preserved in darkness |
| **Rusted Medallion** | 🏅 | 35g | 0.2 | Uncommon | Someone's honor, now your profit |
| **Obsidian Shard** | 🖤 | 55g | 0.3 | Uncommon | Volcanic glass, sharper than your wit |
| **Skull Goblet** | 💀 | 85g | 0.5 | Rare | For the discerning necromancer |
| **Ancient Seal** | 📜 | 120g | 0.1 | Rare | Official documents from dead kingdoms |
| **Enchanted Quill** | 🪶 | 150g | 0.05 | Rare | Writes with spectral ink |
| **Cave Mushroom** | 🍄 | 30g | 0.1 | Common | Glows. Probably safe to eat. Probably. |
| **Spirit Lantern** | 🏮 | 180g | 0.5 | Rare | Light that never dies |
| **Demon Tooth** | 🦷 | 200g | 0.2 | Epic | Proof you met something horrible |
| **Silver Candelabra** | 🕯️ | 90g | 2 | Rare | Church property, technically |
| **Void Crystal** | 💎 | 250g | 0.3 | Epic | Contains trapped darkness |
| **Blood Ruby** | ❤️ | 350g | 0.2 | Epic | Red as the lives it cost |
| **Ancient Crown** | 👑 | 500g | 1 | Legendary | Rule over nothing but your profit margin |
| **World Shard** | 🌟 | 800g | 0.1 | Legendary | Fragment of something greater |
| **Tear of Eternity** | 💧 | 1000g | 0.01 | Legendary | Crystallized immortal sorrow |

#### 🗑️ Vendor Trash (Sellable Only)

*"One man's trash is another merchant's inventory filler."*

These items have no use except to sell. Merchants buy them for reasons known only to merchants.

| Item | Icon | Price | Weight | Description |
|------|------|-------|--------|-------------|
| **Tarnished Silver Spoon** | 🥄 | 12g | 0.1 | So tarnished even rats won't eat with it |
| **Broken Pottery** | 🏺 | 8g | 0.5 | Fragments of ancient dishware |
| **Moth-Eaten Tapestry** | 🧵 | 18g | 0.3 | Moths ate the good parts |
| **Cracked Lens** | 🔍 | 25g | 0.05 | See the world fractured |
| **Bent Candlestick** | 🕯️ | 15g | 1.5 | Someone used this as a weapon |
| **Rusty Lockbox** | 📦 | 30g | 2 | The lock rusted shut years ago |
| **Faded Love Letter** | 💌 | 10g | 0.01 | The romance is deader than its writer |
| **Chipped Tea Set** | 🍵 | 22g | 0.4 | The chip makes it worthless. Almost. |
| **Corroded Belt Buckle** | 🔗 | 14g | 0.2 | The belt rotted centuries ago |
| **Crumbling Journal** | 📓 | 28g | 0.5 | Last entry: "They are coming—" |

---

## 📜 COMPLETE ITEM GLOSSARY

*"Every item in this godforsaken economy, catalogued for your capitalism convenience."*

This glossary lists ALL items in the game, organized by how they enter the economy: gathered, crafted, bought, or looted from the dead.

---

### 🌾 GATHERABLE RESOURCES

Items obtained through resource gathering at appropriate locations.

| Item | Icon | Source | Tool Required | Notes |
|------|------|--------|---------------|-------|
| **Wood** | 🪵 | Forests | Axe | Raw material, becomes timber |
| **Logs** | 🪵 | Forests | Axe | Heavy logs for processing |
| **Timber** | 🪵 | Forests | Axe | Processed wood |
| **Stone** | 🪨 | Mines, Quarries | Pickaxe | Building material |
| **Iron Ore** | ⛏️ | Mines | Pickaxe | Smelt into bars |
| **Copper Ore** | 🟤 | Mines | Pickaxe | Smelt into bars |
| **Coal** | ⚫ | Mines | Pickaxe | Fuel for smelting |
| **Gold Ore** | ✨ | Deep Mines | Steel Pickaxe | Rare, very valuable |
| **Gemstone** | 💎 | Mines, Caves | Pickaxe | Cut and polished |
| **Wheat** | 🌾 | Farms | Scythe | Becomes flour |
| **Grain** | 🌾 | Farms | Scythe | Food staple |
| **Vegetables** | 🥕 | Farms | None | Fresh produce |
| **Fruits** | 🍎 | Farms, Orchards | None | Seasonal harvest |
| **Herbs** | 🌿 | Forests, Fields | None | Medicinal plants |
| **Flax** | 🌾 | Farms | Scythe | Becomes linen |
| **Wool** | 🐑 | Farms | Shears | From sheep |
| **Hide** | 🦌 | Hunting | Weapon | Becomes leather |
| **Fish** | 🐟 | Ports, Rivers | Fishing Rod | Fresh catch |
| **Seeds** | 🌱 | Farms | None | For planting |
| **Clay** | 🏺 | Riverbanks | None | For pottery and bricks |
| **Berries** | 🫐 | Forests | None | Wild harvest |
| **Mushrooms** | 🍄 | Forests, Caves | None | Edible (mostly) |
| **Nuts** | 🥜 | Forests | None | Nutritious |
| **Honey** | 🍯 | Apiaries | None | From bees |
| **Apples** | 🍎 | Orchards | None | Fresh fruit |

---

### ⚒️ CRAFTED ITEMS

Items created at crafting facilities using recipes.

#### Basic Processing (Tier 1)

| Item | Icon | Inputs | Facility | Result |
|------|------|--------|----------|--------|
| **Planks** | 🪵 | 1 Timber | Sawmill | 4 Planks |
| **Iron Bar** | 🔩 | 2 Iron Ore + Coal | Smelter | 1 Iron Bar |
| **Copper Bar** | 🟤 | 2 Copper Ore + Coal | Smelter | 1 Copper Bar |
| **Steel Bar** | ⚙️ | 2 Iron Bar + Coal | Smelter | 1 Steel Bar |
| **Gold Bar** | 🟡 | 2 Gold Ore + Coal | Smelter | 1 Gold Bar |
| **Flour** | 🌾 | 3 Wheat | Mill | 2 Flour |
| **Thread** | 🧵 | 1 Wool | None | 5 Thread |
| **Leather** | 🦌 | 2 Hide + Salt | Tannery | 1 Leather |
| **Linen** | 🧵 | 3 Flax + Thread | Weaver | 1 Linen |
| **Wool Cloth** | 🧶 | 3 Wool + Thread | Weaver | 1 Wool Cloth |
| **Cloth** | 🧵 | Wool or Flax | Weaver | General fabric |
| **Bricks** | 🧱 | 5 Clay + Coal | Kiln | Building material |
| **Iron Nails** | 📌 | 1 Iron Bar | Smithy | 20 Nails |

#### Food & Drink (Crafted)

| Item | Icon | Inputs | Facility | Effects |
|------|------|--------|----------|---------|
| **Bread** | 🍞 | 2 Flour + Water | Bakery | +15 Hunger, +3 Health |
| **Pie** | 🥧 | Flour + Fruits + Butter | Bakery | +35 Hunger, +10 Health, +15 Happiness |
| **Stew** | 🍛 | Meat + Vegetables + Water | Kitchen | +30 Hunger, +12 Health |
| **Soup** | 🍲 | Vegetables + Water | Kitchen | +22 Hunger, +8 Health |
| **Cheese** | 🧀 | Milk + Salt | Kitchen | +18 Hunger, +5 Health |
| **Ale** | 🍺 | Grain + Water | Brewery | +10 Happiness, +3 Health |
| **Mead** | 🍯 | Honey + Water | Brewery | +15 Happiness, +2 Health |
| **Wine** | 🍷 | Fruits + Water | Brewery | +20 Happiness, +1 Health |
| **Cider** | 🍺 | Apples + Water | Brewery | +12 Happiness, +5 Hunger |
| **Bandages** | 🩹 | Cloth + Herbs | Workshop | +20 Health |
| **Military Rations** | 🥫 | Meat + Salt + Bread | Kitchen | +30 Hunger, +8 Health |

#### Weapons (Crafted)

| Item | Icon | Inputs | Facility | Damage |
|------|------|--------|----------|--------|
| **Iron Sword** | ⚔️ | 3 Iron Bar + Timber | Smithy | 30 |
| **Steel Sword** | ⚔️ | 3 Steel Bar + Timber + Leather | Armory | 50 |
| **Battleaxe** | 🪓 | 4 Iron Bar + Timber | Smithy | 45 |
| **Warhammer** | 🔨 | 5 Iron Bar + Timber | Smithy | 40 |
| **Lance** | 🎯 | 2 Iron Bar + 2 Timber | Smithy | 30 |
| **Crossbow** | 🏹 | Iron Bar + Timber + Rope | Workshop | 25 |

#### Armor (Crafted)

| Item | Icon | Inputs | Facility | Defense |
|------|------|--------|----------|---------|
| **Leather Armor** | 🦺 | 8 Leather + Thread | Workshop | 10 |
| **Chainmail** | 🛡️ | 15 Iron Bar + Thread | Armory | 25 |
| **Iron Armor** | 🛡️ | 20 Iron Bar + Leather | Armory | 40 |
| **Plate Armor** | 🛡️ | 25 Steel Bar + Leather | Armory | 50 |
| **Shield** | 🛡️ | 3 Planks + Iron Bar | Smithy | 8 |
| **Helmet** | ⛑️ | 2 Iron Bar | Smithy | 5 |

#### Tools (Crafted)

| Item | Icon | Inputs | Facility | Use |
|------|------|--------|----------|-----|
| **Iron Tools** | 🔧 | 2 Iron Bar + Timber | Smithy | General |
| **Simple Tools** | 🔨 | Timber + Stone | Workshop | Basic tasks |
| **Steel Pickaxe** | ⛏️ | 2 Steel Bar + Timber | Smithy | Mining |
| **Scythe** | 🔪 | 2 Iron Bar + Timber | Smithy | Farming |
| **Fishing Rod** | 🎣 | Timber + Thread | Workshop | Fishing |

#### Clothing (Crafted)

| Item | Icon | Inputs | Facility | Notes |
|------|------|--------|----------|-------|
| **Simple Clothes** | 👕 | 3 Linen + Thread | Tailor | Basic wear |
| **Fine Clothes** | 👗 | 5 Silk + Thread | Tailor | Elegant |
| **Silk Garments** | 🥻 | 8 Silk + Thread | Tailor | Luxurious |
| **Winter Clothing** | 🧥 | 5 Wool Cloth + Furs | Tailor | Warmth |
| **Colorful Clothes** | 👘 | Cloth + Dye | Tailor | Eye-catching |
| **Noble Cloak** | 🧥 | Silk + Furs | Tailor | Nobility |

#### Furniture & Complex Items

| Item | Icon | Inputs | Facility | Notes |
|------|------|--------|----------|-------|
| **Furniture** | 🪑 | 10 Planks + 20 Nails + Cloth | Workshop | Well-crafted |
| **Jewelry** | 💍 | Gold Bar + Gemstone | Jeweler | Precious |
| **Lute** | 🎻 | Timber + Thread | Workshop | Musical |
| **Book** | 📖 | Parchment + Ink + Leather | Scriptorium | Knowledge |

---

### 🏪 MERCHANT-ONLY ITEMS

Items only found for sale at specific merchant types.

#### Luxury Goods (City/Capital Merchants)

| Item | Icon | Price | Weight | Notes |
|------|------|-------|--------|-------|
| **Silk** | 🧵 | 100g | 1 | Exotic fabric |
| **Spices** | 🌶️ | 40g | 0.5 | Exotic seasonings |
| **Gems** | 💎 | 150g | 0.2 | Precious stones |
| **Jewelry** | 💍 | 180g | 0.2 | Fine ornaments |
| **Perfume** | 💐 | 85g | 0.2 | Exotic fragrances |
| **Porcelain** | 🏺 | 250g | 2 | Delicate ceramics |
| **Jade** | 💚 | 400g | 0.3 | Precious stone |
| **Crystals** | 🔮 | 300g | 0.5 | Magical? |
| **Royal Goods** | 👑 | 300g | 2 | Fit for nobility |
| **Exotic Goods** | 🎭 | 120g | 3 | Foreign wares |
| **Tapestry** | 🖼️ | 160g | 5 | Decorative |
| **Mirror** | 🪞 | 95g | 3 | Polished silver |

#### Legendary Items (Rare Merchants/Events)

| Item | Icon | Price | Weight | Notes |
|------|------|-------|--------|-------|
| **Dragon Scale** | 🐉 | 2500g | 1 | From ancient dragons |
| **Phoenix Feather** | 🪶 | 3000g | 0.1 | Never burns |
| **Crown** | 👑 | 1500g | 2 | Royal headwear |
| **Artifacts** | 🏺 | 1000g | 5 | Ancient relics |
| **Rare Gems** | 💠 | 800g | 0.1 | Extremely valuable |
| **Imperial Goods** | 👑 | 600g | 3 | From the court |
| **Royal Favors** | 🎖️ | 5000g | 0 | Priceless influence |
| **Religious Relic** | ✝️ | 280g | 1 | Sacred artifact |

---

### 🗺️ THE CIRCULAR ECONOMY

*"Everything flows in a circle. Wheat becomes flour becomes bread becomes gold becomes wheat again."*

#### Production Chains

```
FARMING CHAIN:
Wheat → Flour → Bread/Pie
Fruits → Wine/Cider/Pie
Vegetables → Soup/Stew
Milk → Cheese/Butter
Honey → Mead

MINING CHAIN:
Iron Ore → Iron Bar → Tools/Weapons/Armor
Coal → Fuel for smelting
Gold Ore → Gold Bar → Jewelry/Coins
Copper Ore → Copper Bar → Tools

TEXTILE CHAIN:
Wool → Thread → Cloth → Clothes
Flax → Thread → Linen → Clothes
Hide → Leather → Armor/Bags
Silk (import) → Fine Clothes

CONSTRUCTION CHAIN:
Timber → Planks → Furniture
Stone → Buildings
Clay → Bricks → Buildings
Iron Bar → Nails → Construction

ALCHEMY CHAIN:
Herbs → Medicine/Bandages
Herbs + Other → Potions
```

#### Trade Route Profit Centers

| Route | Buy Here | Sell There | Profit Margin |
|-------|----------|------------|---------------|
| **Farm → City** | Grain, Vegetables | Food items | 40-60% |
| **Mine → Smithy** | Ore, Coal | Processed metal | 50-80% |
| **Forest → Town** | Timber, Herbs | Planks, Medicine | 30-50% |
| **Port → Inland** | Fish, Exotic goods | Seafood, Luxuries | 60-100% |
| **Capital → Villages** | Luxury goods | High-end items | 100-200% |
| **Dungeon → Anywhere** | Loot | Everything | 200-500% |

---

## RESOURCE GATHERING

*"Time to roll up your sleeves and extract value from the land itself."*

At certain locations, you can gather raw resources directly from the environment. This is a great way to get starting materials for crafting or trade goods without spending gold.

### Where to Gather

Resource gathering is only available at specific location types:

| Location Type | Resources Available |
|---------------|---------------------|
| **Mine** | Iron ore, coal, copper ore, gold ore, gems |
| **Forest** | Wood, herbs, mushrooms, berries |
| **Farm** | Grain, vegetables, fruits, flax |
| **Cave** | Stone, crystals, mushrooms |
| **Quarry** | Stone, marble |
| **Fishing Spot** | Fish, shells |
| **River/Lake** | Fish, water, clay |

*Cities, towns, and dungeons do NOT have gathering options.*

### How Gathering Works

1. **Arrive** at a gatherable location
2. **Select a resource** from the available options
3. **Watch progress** - Shows percentage complete and time remaining
4. **Collect** - Item goes to your inventory when done

### Progress Tracking

The gathering system shows:
- **Percentage complete** (e.g., "Mining Iron Ore... 45%")
- **Time remaining** (e.g., "~2 minutes left")
- **Tool bonus** (if you have the right tool equipped)

Progress is tied to game time - pausing the game pauses gathering, and faster game speeds mean faster gathering!

### Tips for Gatherers

- Check the location's `availableResources` to see what you can gather
- Having the right tool (pickaxe for mining, axe for wood) speeds up gathering
- Watch your carry weight - resources are heavy!
- Gathered resources can be crafted into more valuable items

---

## 🏠 PROPERTIES & EMPIRE BUILDING

### Property Types

| Property | Base Cost | Daily Income | Maintenance | Special |
|----------|-----------|--------------|-------------|---------|
| **House** | 1,000g | 5g | 2g | +50 storage, rest bonus |
| **Market Stall** | 800g | 10g | 3g | 1 merchant slot |
| **Shop** | 2,500g | 15g | 8g | +100 storage, 1 merchant |
| **Warehouse** | 4,000g | 8g | 15g | +500 storage |
| **Farm** | 3,000g | 20g | 10g | Produces food/grain, 3 workers |
| **Mine** | 8,000g | 25g | 20g | Produces ore/minerals, 5 workers |
| **Tavern** | 5,000g | 30g | 12g | +80 storage, 2 merchants, +1 rep |
| **Craftshop** | 3,500g | 18g | 10g | Crafting facility, 2 workers |

### Property Upgrades

| Upgrade | Cost Multiplier | Effects |
|---------|-----------------|---------|
| **Expansion** | 50% | +50% storage, +20% income |
| **Security** | 30% | -30% maintenance, -50% damage risk |
| **Luxury** | 80% | +40% income, +2 reputation |
| **Efficiency** | 40% | -20% maintenance, +30% production |

### Location Modifiers for Property Prices
- **Village**: 0.8x (cheaper)
- **Town**: 1.0x (standard)
- **City**: 1.3x (expensive)

### ROI Calculation
```
Return on Investment Days = Property Price / Net Daily Income
```
Example: A 2,500g Shop earning 15g-8g(maintenance)-1.5g(tax) = 5.5g net
ROI = 2,500 / 5.5 = **454 days to profit**

*(yeah, medieval real estate isn't exactly quick money)*

---

## 🔨 CRAFTING SYSTEM

### Crafting Facilities

| Facility | Location | What It Makes |
|----------|----------|---------------|
| **None** | Anywhere | Thread, basic items |
| **Sawmill** | Towns/Cities | Planks from timber |
| **Smelter** | Cities/Mines | Metal bars from ore |
| **Smithy** | Towns/Cities | Weapons, tools |
| **Armory** | Cities | Armor, steel weapons |
| **Mill** | Villages/Towns | Flour from wheat |
| **Bakery** | Towns/Cities | Bread, pies |
| **Brewery** | Towns/Cities | Ale, mead |
| **Kitchen** | Towns/Cities | Meals, cheese |
| **Weaver** | Towns | Cloth from wool/flax |
| **Tannery** | Towns | Leather from hides |
| **Tailor** | Cities | Clothing |
| **Workshop** | Towns/Cities | Furniture, misc |
| **Mint** | Capital only | Gold coins |

### Key Recipes

**Tier 1 (Basic Processing):**
| Recipe | Inputs | Output | Facility | Time |
|--------|--------|--------|----------|------|
| Planks | 1 Timber | 4 Planks | Sawmill | 5min |
| Iron Bar | 2 Iron Ore | 1 Iron Bar | Smelter | 10min |
| Flour | 3 Wheat | 2 Flour | Mill | 5min |
| Bread | 2 Flour, 1 Water | 3 Bread | Bakery | 15min |
| Thread | 1 Wool | 5 Thread | None | 5min |
| Leather | 2 Hide, 1 Salt | 1 Leather | Tannery | 20min |

**Tier 2 (Advanced):**
| Recipe | Inputs | Output | Facility | Skill |
|--------|--------|--------|----------|-------|
| Iron Sword | 3 Iron Bar, 1 Timber | 1 Iron Sword | Smithy | 5 |
| Leather Armor | 8 Leather, 10 Thread | 1 Leather Armor | Workshop | 5 |
| Simple Clothes | 3 Linen, 5 Thread | 1 Simple Clothes | Tailor | 0 |
| Stew | 2 Meat, 3 Vegetables, 2 Water, 1 Salt | 4 Stew | Kitchen | 2 |
| Iron Tools | 2 Iron Bar, 2 Timber | 1 Iron Tools | Smithy | 3 |

**Tier 3 (Complex):**
| Recipe | Inputs | Output | Skill |
|--------|--------|--------|-------|
| Furniture | 10 Planks, 20 Iron Nails, 2 Cloth | 1 Furniture | 10 |
| Jewelry | 1 Gold Bar, 1 Gemstone | 1 Jewelry | 15 |
| Steel Sword | 3 Steel Bar, 1 Timber, 1 Leather | 1 Steel Sword | 15 |

---

## ⏰ TIME & SURVIVAL

### Time System

**Calendar:** The game uses the actual Gregorian calendar with real month names, correct days per month, and leap years. The game begins on **April 1st, 1111**.

**Time Display:** `April 1, 1111 - 08:00`

```
1 real second = 2 game minutes (Normal speed)
              = 10 game minutes (Fast)
              = 30 game minutes (Very Fast)
```

**Travel Time Examples (at Normal speed):**
| Game Time | Real Time | Example Journey |
|-----------|-----------|-----------------|
| 30 min | 15 sec | Short village hop |
| 1 hour | 30 sec | Town to town |
| 2 hours | 60 sec | City to distant outpost |
| 4 hours | 2 min | Cross-region trek |

| Time Period | Hours | Effects |
|-------------|-------|---------|
| Morning | 6:00-12:00 | +2% market prices |
| Afternoon | 12:00-18:00 | Standard prices |
| Evening | 18:00-22:00 | -2% market prices |
| Night | 22:00-6:00 | Some shops closed, dangers higher |

### Survival Stats

Stats now decay automatically as time passes. The decay system runs every 30 game minutes and is affected by the current season.

| Stat | Base Decay | Empty Penalty | Notes |
|------|------------|---------------|-------|
| **Hunger** | -1 per 30min | -1 health/tick | Affected by season |
| **Thirst** | -1.2 per 30min | -1.5 health/tick | Higher in summer |
| **Stamina** | -2 while traveling | Slower travel | Recovers when resting |
| **Health** | Varies | Death at 0 | Damaged by starvation/dehydration |
| **Happiness** | Varies | Affects all stats | Drops when other stats low |

### Seasonal Effects on Stats

Each season modifies stat decay rates:

| Season | Hunger Drain | Thirst Drain | Stamina Drain |
|--------|--------------|--------------|---------------|
| **Spring** | 1.0x | 1.0x | 0.95x |
| **Summer** | 0.9x | **1.3x** | 1.1x |
| **Autumn** | 1.1x | 0.9x | 1.0x |
| **Winter** | **1.3x** | 0.7x | **1.4x** |

*In summer, carry extra water. In winter, stock up on food and rest often.*

### Weather System

The world has dynamic weather that affects gameplay:

| Weather | Visual Effect | Gameplay Effect |
|---------|--------------|-----------------|
| **Clear** ☀️ | Sunny skies | Normal travel speed |
| **Cloudy** ☁️ | Overcast | Slightly slower travel |
| **Rain** 🌧️ | Rain particles | -10% travel speed |
| **Storm** ⛈️ | Rain + Lightning | -20% speed, +encounter chance |
| **Fog** 🌫️ | Dense fog | -15% speed, reduced visibility |
| **Snow** ❄️ | Snowflakes | -25% speed (winter only) |
| **Blizzard** 🌨️ | Heavy snow + wind | -40% speed, +stamina drain |
| **Apocalypse** ☄️ | Meteors, red sky | -50% speed, 2x encounters |

Weather changes naturally based on season and time, but certain events (like The Dark Convergence) can trigger special weather.

### Death
When health hits 0, you die. Your high score is recorded based on:
- Gold accumulated
- Days survived
- Cause of death

*There is no respawn. Only a new game. Like life itself.*

---

## 💀 THE DARK CONVERGENCE (July 18th)

*"Once a year, the veil between worlds thins, and the dungeons call to those brave enough to answer..."*

Every **July 18th**, a special event occurs called **The Dark Convergence**. On this day:

| Effect | Normal | During Event |
|--------|--------|--------------|
| **Dungeon Travel Time** | 60-120 minutes | **30 minutes** |
| **Dungeon Cooldowns** | 12 hours | **REMOVED** |
| **Boss Fights** | Limited by cooldowns | **Unlimited** |

### Why It Matters

The "Dungeon Crawler" hidden achievement requires defeating **50 dungeon bosses within 5 in-game years**. With normal 12-hour cooldowns, this is extremely challenging. The Dark Convergence makes it possible to complete this achievement in a single glorious day of dungeon crawling!

### Strategy for July 18th

1. **Prepare beforehand** - Stock up on food, bandages, and weapons
2. **Start at midnight** - You have 24 hours of dungeon madness
3. **Travel fast** - Every dungeon is only 30 minutes away
4. **No cooldowns** - Hit every dungeon multiple times!
5. **Track your kills** - You can clear 20+ dungeons in one day

### Dungeon Backdrop

When you enter a dungeon, cave, ruins, or mine, the world map fades to a dark **dungeon backdrop** to set the mood. The backdrop transitions smoothly as you travel in and out of dungeon locations.

### ☄️ Apocalypse Weather

During The Dark Convergence, the world is consumed by apocalyptic weather:

- **☄️ Meteor Showers** - Fiery meteors streak across the sky every 3-10 seconds
- **🔴 Red Sky** - Pulsing crimson atmosphere
- **🔥 Embers** - Floating fire particles rise from below
- **⚡ Lightning** - Intense electrical storms

This dramatic effect triggers automatically on July 18th, or can be activated manually with the `doom` debug command.

### The Doom Command

For those who want to summon The Dark Convergence at will, the `doom` debug command triggers:

1. **Apocalypse Weather** - Full meteor shower effect
2. **Dungeon World Backdrop** - Map fades to dungeon view
3. **Bonanza Benefits** - 30-min travel + no cooldowns for one game day

This works on both the **main menu** (menu weather system) and **in-game** (game weather system).

---

## ⚔️ COMBAT SYSTEM

*"Some problems can't be solved with gold. Those require steel."*

The combat system provides turn-based stat combat when attacking NPCs or encountering hostiles. All attacks trigger the Combat Modal.

### How Combat Works

1. **Initiate** - Attack an NPC via People Panel or get attacked during encounter
2. **Combat Modal Opens** - Shows your stats vs enemy stats side-by-side
3. **Choose Action** - Attack, Defend, or Flee each turn
4. **Resolution** - Combat continues until one side wins or you escape

### Combat Actions

| Action | Effect |
|--------|--------|
| **Attack** | Deal damage based on your attack vs their defense |
| **Defend** | +50% defense this turn, then enemy attacks |
| **Flee** | Attempt escape (speed-based chance) |

### NPC Tiers

Enemies are organized into 4 tiers of difficulty:

| Tier | Type | Examples | Challenge |
|------|------|----------|-----------|
| **1** | Civilians | Merchant, Traveler, Beggar, Drunk | Easy - low health, minimal damage |
| **2** | Workers/Guards | Guard, Blacksmith, Innkeeper | Moderate - trained fighters |
| **3** | Outlaws | Bandit, Assassin, Thief, Smuggler | Dangerous - combat specialists |
| **4** | Bosses | Malachar, Shadow Guardian, Greedy Won | Deadly - dungeon bosses |

### Location & Difficulty Scaling

NPC stats scale based on where you are and your difficulty setting:

**Location Multipliers:**
| Location | Multiplier |
|----------|------------|
| Village | 0.8x (easier) |
| Town | 1.0x (standard) |
| City | 1.2x (tougher) |
| Capital | 1.5x (elite) |
| Dungeon | 1.8x (dangerous) |
| Doom World | 2.0x (nightmare) |

**Difficulty Multipliers:**
| Difficulty | Multiplier |
|------------|------------|
| Easy | 0.7x |
| Normal | 1.0x |
| Hard | 1.3x |
| Deadly | 1.6x |

### Quest NPC Protection

You **cannot attack** NPCs involved in active quests:
- Quest givers
- NPCs you need to talk to
- NPCs you need to deliver items to

**Exception:** NPCs marked as quest defeat targets (like "kill the bandit leader") CAN be attacked and show a special "(Quest)" label on the attack button.

### Travel Encounter Variety

Random encounters during travel are based on path danger level:

| Path Type | Encounter Chance | NPC Types |
|-----------|------------------|-----------|
| **Safe** | 5% | Traveler, Merchant, Pilgrim, Courier |
| **Normal** | 10% | Traveler, Merchant, Drunk, Beggar, Thief |
| **Dangerous** | 20% | Bandit, Thief, Robber, Wolf, Smuggler |
| **Deadly** | 30% | Bandit, Assassin, Orc, Skeleton, Ghost |

**Daily Limit:** Maximum 2 combat encounters per day to prevent endless grinding.

### Victory Rewards

When you defeat an NPC:
- **Gold** - Random amount based on NPC tier
- **XP** - Experience points (for future leveling)
- **Quest Progress** - If target was a quest objective

### Combat Tips

- Higher attack = more damage dealt
- Higher defense = less damage taken
- Higher speed = better flee chance
- Defend when low on health to reduce incoming damage
- Flee from tier 4 bosses unless well-equipped

---

## 🎭 RANDOM ENCOUNTERS

As you travel the roads and visit locations, you may encounter random NPCs. The world is alive with wanderers, merchants, pilgrims, and less savory folk.

### Encounter Types

**30+ NPC types** with role-appropriate inventories:

| Category | Types | Tradeable | Inventory Style |
|----------|-------|-----------|-----------------|
| **Travelers** | Traveler, Courier, Pilgrim | Yes | Basic supplies, travel gear |
| **Merchants** | Merchant, Smuggler | Yes | Trade goods, rare items |
| **Hostile** | Robber, Thief, Bandit | Yes | Stolen goods, weapons, little food |
| **Neutral** | Mercenary, Spy, Informant | Yes | Special items, intel |
| **Service** | Healer, Priest, Apothecary | Yes | Potions, herbs, blessed items |
| **Authority** | Guard, Noble, Guild Master | Yes | Quality gear, official items |
| **Civilian** | Farmer, Hunter, Blacksmith | Yes | Profession-specific goods |
| **Creatures** | Wolf, Skeleton, etc. | No | Combat encounters only |

### How Encounters Work

1. **Time Pauses** - When an encounter triggers, game time automatically pauses
2. **Choose Your Action** - Talk to them, Trade with them (if tradeable), or Ignore
3. **Trade** - Tradeable NPCs carry randomized inventories based on their type
4. **Time Resumes** - When you dismiss the encounter or end the conversation

### Encounter Chances

- **30%** chance per travel journey
- **20%** chance when arriving at a new location
- **30 minute** cooldown between encounters

### Tradeable NPC Inventories

Every NPC carries items befitting their role:

**Travelers/Couriers:** Bread, water, torches, rope, bandages, travel gear
**Merchants:** Cloth, spices, leather, jewelry, varied goods
**Smugglers:** Lockpicks, poisons, contraband, thieves' tools
**Hostile (Robbers/Thieves/Bandits):** Stolen goods, rusty weapons, gold rings - little food!
**Healers/Priests:** Bandages, herbs, healing salves, blessed water
**Blacksmiths:** Iron tools, horseshoes, metal ingots, repair kits
**Hunters:** Furs, meat, bows, leather, animal parts
**Farmers:** Grain, vegetables, seeds, livestock supplies
**Nobles:** Fine wine, jewelry, silk, quality weapons

**Item Rarity Tiers:**
- **Common** (70% chance): Basic goods for that NPC type
- **Uncommon** (20% chance): Better quality items
- **Rare** (10% chance): Valuable or unique items

*Tip: Robbers carry stolen goods but have terrible food supplies - they're criminals, not chefs.*

---

## 📜 QUEST SYSTEM

*"100 tales of trade, conspiracy, and darkness."*

The game features **100 quests** spanning from humble beginnings to the final confrontation with ultimate evil.

### Quest Tracking & Wayfinder

**Track your quests** to see where to go next:
- **🎯 Quest Tracker Widget** - Shows your tracked quest in the corner of the screen
- **Click the quest** in the tracker to see full details
- **Golden glow** on the map shows where to go next
- **Hover over locations** - If a tracked quest points there, you'll see quest info in the tooltip!

### Tutorial Flow

When you start a new game:
1. **Meet the stranger** - Accept your first quest with a single button
2. **Quest accepted!** - See the unified quest info panel with details
3. **Optional tutorial** - Choose "Yes" or "No" for the tutorial (coming soon!)
4. **Start trading** - The game begins!

### Main Story (35 Quests - 5 Acts)

| Act | Name | Description | Wealth Gate |
|-----|------|-------------|-------------|
| **1** | A Trader's Beginning | Learn the ropes, first hints of conspiracy | - |
| **2** | Whispers of Conspiracy | The Black Ledger revealed | 1,000g |
| **3** | The Dark Connection | Malachar + Black Ledger intertwined | 5,000g |
| **4** | War of Commerce | Economic warfare, choose your side | 20,000g |
| **5** | The Shadow's End | Final confrontation | 50,000g |

*Wealth gates scale with difficulty: Easy (0.6x), Normal (1x), Hard (1.5x)*

### Side Quests (50 Quests - 14 Chains)

- **7 Combat Quest Chains** - Battle bandits, clear dungeons, hunt monsters
- **7 Trade Quest Chains** - Establish routes, corner markets, build empires

### Doom World Quests (15 Quests)

Unlocked after entering the Doom World:

| Arc | Quests | Description |
|-----|--------|-------------|
| **Survival** | 5 | Find food, water, shelter in the wasteland |
| **Resistance** | 5 | Unite survivors, build resistance |
| **Boss** | 5 | Path to confronting GREEDY WON |

---

## 🌑 DOOM WORLD

*"When the darkness wins, the world becomes something... else."*

The Doom World is an alternate dimension - a glimpse of what happens when evil triumphs. Same map, but everything is corrupted.

### How to Enter

1. **Defeat a dungeon boss** (Shadow Dungeon or Forest Dungeon)
2. **Boatman NPC appears** at that dungeon location
3. **Select the boatman** in the People Panel
4. **Choose "Enter Portal"** - FREE passage, no cost

### What's Different?

| Aspect | Normal World | Doom World |
|--------|--------------|------------|
| **Map** | Pristine kingdom | Same layout, corrupted |
| **Locations** | Royal Capital | Destroyed Royal Capital |
| **Economy** | Gold is king | Gold nearly worthless |
| **Discovery** | Your explored areas | Start fresh - re-explore everything |

### Corrupted Location Names

| Normal | Doom |
|--------|------|
| Royal Capital | Destroyed Royal Capital |
| Greendale | Burned Greendale |
| Ironforge | Enslaved Ironforge |
| Jade Harbor | Blighted Harbor |

### Barter Economy

In the Doom World, survival matters more than wealth:

| Item Type | Price Multiplier |
|-----------|------------------|
| **Water** | 15x (most valuable!) |
| **Medicine** | 12x |
| **Food** | 10x |
| **Weapons** | 3x |
| **Luxury** | 0.1x (worthless) |
| **Gold** | 0.3x value |

*Trade survival goods, not gold coins!*

### Safe Zones (Portals Back)

Two locations have portals back to the normal world:
- **Shadow Tower** → Shadow Dungeon
- **Ruins of Malachar** → Forest Dungeon

### The Final Boss: GREEDY WON

*"What the Black Ledger became when they won."*

| Stat | Value |
|------|-------|
| **Location** | Destroyed Royal Capital |
| **Health** | 1,000 |
| **Damage** | 30-50 |
| **Defense** | 25 |

**Special Attacks:**
- 💰 **Golden Grasp** - Steals your gold
- 📜 **Contract Curse** - Debuffs your stats
- 📉 **Market Crash** - Destroys item value

**Victory Rewards:**
- 🏆 Title: "Doom Ender"
- ⚔️ Armor Set: "Greed's End"

---

## ⌨️ KEYBOARD SHORTCUTS

All keyboard shortcuts are **fully customizable**! Change them in two ways:
1. **In-Game:** Settings Panel > Controls tab (click any key to rebind)
2. **Config File:** Edit `config.js` > `keybindings.defaults` section

### Game Controls (Defaults)

| Key | Action |
|-----|--------|
| **Space** | Pause/Resume time |
| **Escape** | Close overlays / Exit fullscreen |
| **I** | Open Inventory |
| **C** | Open Character Sheet |
| **F** | Open Financial Sheet |
| **M** | Open Market |
| **T** | Open Travel Panel |
| **W** | Open World Map |
| **P** | Open Properties |
| **H** | Open Achievements |
| **Q** | Open Quest Log |
| **,** (comma) | Open Settings |

### Map Navigation

| Key | Action |
|-----|--------|
| **W/A/S/D** | Pan map Up/Left/Down/Right |
| **+** or **=** | Zoom in |
| **-** | Zoom out |

### Quick Actions

| Key | Action |
|-----|--------|
| **F5** | Quick Save |
| **F9** | Quick Load |

### Customization Notes
- In-game rebinds are saved to localStorage and persist between sessions
- Editing `config.js` changes the **default** bindings (what "Reset to Defaults" restores)
- The settings panel shows current bindings and allows click-to-rebind

---

## ⚙️ GAME SETTINGS

Access the settings panel by pressing **,** (comma) or clicking the ⚙️ button.

### Settings Tabs

| Tab | What It Controls |
|-----|------------------|
| **🔊 Audio** | Master volume, music, sound effects, mute toggles |
| **🎨 Visual** | Particles, screen shake, weather effects, quality |
| **✨ Animation** | Animation speed, quality, reduced motion |
| **🖥️ UI** | Hover effects, transitions, font size, theme |
| **🌍 Environment** | Weather visuals, lighting, seasonal effects |
| **♿ Access** | Accessibility options, colorblind modes, screen reader |
| **🎙️ AI Voice** | NPC voice settings, AI text model selection |
| **⌨️ Controls** | Keyboard shortcut rebinding |
| **💾 Save/Load** | Manual saves, auto-save settings |
| **🏆 Scores** | Hall of Champions leaderboard |
| **ℹ️ About** | Game credits and version info |

### Audio Settings

| Option | Description |
|--------|-------------|
| **Master Volume** | Controls all audio (0-100%) |
| **Music Volume** | Background music level |
| **SFX Volume** | Sound effects level |
| **Mute All** | Silence everything |
| **Mute Music** | Silence background music only |
| **Mute SFX** | Silence sound effects only |

### Visual Settings

| Option | Description |
|--------|-------------|
| **Particles** | Toggle gold sparkles, dust, etc. |
| **Screen Shake** | Toggle impact screen shake |
| **Weather Effects** | Toggle rain, snow, fog visuals |
| **Quality** | Low/Medium/High visual quality |
| **Reduced Motion** | Minimize animations |
| **Flash Warnings** | Warn before flashy effects |

### Accessibility Settings

| Option | Description |
|--------|-------------|
| **Reduced Motion** | Minimize all motion |
| **High Contrast** | Increase color contrast |
| **Screen Reader** | Enable screen reader optimizations |
| **Flash Warnings** | Warn before flashing content |
| **Colorblind Mode** | None, Deuteranopia, Protanopia, Tritanopia |
| **Font Size** | Small, Medium, Large |
| **Keyboard Nav** | Enable full keyboard navigation |

### Customizing Default Settings

All default settings are stored in `config.js` under `GameConfig.settings`. To change the defaults:

```javascript
// In config.js
settings: {
    audio: { masterVolume: 0.7, ... },
    visual: { quality: 'medium', ... },
    // etc.
}
```

Changes to `config.js` affect the default values when clicking "Reset to Defaults" in settings.

---

## TRANSPORTATION OPTIONS

Get around the kingdom with style (or at least survive the journey):

| Transport | Price | Capacity | Speed | Notes |
|-----------|-------|----------|-------|-------|
| **Leather Satchel** | Free | 40 lbs | 1.0x | Starting option |
| **Hand Cart** | 30g | 180 lbs | 0.8x | Slow but cheap |
| **Mule** | 85g | 160 lbs | 0.9x | Good for terrain |
| **Warhorse** | 180g | 120 lbs | 1.5x | Fast, light cargo |
| **Merchant Cart** | 220g | 450 lbs | 0.7x | Heavy hauling |
| **Horse & Cart** | 380g | 550 lbs | 1.2x | Best balance |
| **Oxen** | 120g | 220 lbs | 0.6x | Slow and steady |
| **Oxen & Cart** | 320g | 750 lbs | 0.5x | Maximum capacity |

### Mid-Journey Options

Changed your mind while traveling? No problem!

| Action | How | What Happens |
|--------|-----|--------------|
| **Reroute** | Click a different destination on the map | Calculates new route from your current path position |
| **Cancel** | Click "Cancel Journey" button | Returns you to your starting location |

**Smart Path Position:**
- The game tracks your exact position along the travel path
- Return journey time is proportional to distance traveled
- Example: If you're 30% into a 60-minute journey and cancel, the return takes ~18 minutes

---

## 🏆 ACHIEVEMENTS

The game features **57 achievements** across 12 categories, including 10 hidden achievements for the dedicated explorer. Achievements unlock with a dramatic popup that pauses the game - if multiple achievements unlock at once, you'll see them in sequence!

---

### Wealth Achievements (4)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 💰 | **First Coin** | Earn your first gold coin | Common |
| 💰 | **Merchant Apprentice** | Accumulate 1,000 gold | Common |
| 💎 | **Merchant Master** | Accumulate 10,000 gold | Uncommon |
| 👑 | **Trade Tycoon** | Accumulate 50,000 gold | Rare |

---

### Trading Achievements (4)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🤝 | **First Deal** | Complete your first trade | Common |
| 📊 | **Savvy Trader** | Complete 50 trades | Uncommon |
| ⭐ | **Trading Legend** | Complete 200 trades | Rare |
| 📈 | **Profit Margin** | Make 500 gold profit in a single trade | Uncommon |

---

### Travel Achievements (4)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🗺️ | **First Journey** | Travel to another location | Common |
| 🌍 | **World Explorer** | Visit all locations in the realm | Rare |
| 🏃 | **Road Warrior** | Travel 1,000 miles | Uncommon |
| 🚶 | **Frequent Traveler** | Complete 100 journeys | Rare |

---

### Survival Achievements (3)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🛡️ | **Survivor** | Survive 10 hostile encounters | Uncommon |
| ⚔️ | **Bandit Hunter** | Defeat 20 bandit encounters | Rare |
| 🍀 | **Lucky Escape** | Escape from danger with less than 10 gold remaining | Uncommon |

---

### Collection Achievements (3)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🎒 | **Pack Rat** | Carry 50 different items in your inventory | Uncommon |
| 💎 | **Rare Collector** | Own 10 rare or legendary items | Rare |
| 📦 | **Hoarder** | Have 1,000 total items in inventory | Rare |

---

### Time Achievements (2)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 📅 | **Veteran Trader** | Play for 10 in-game days | Uncommon |
| 🎂 | **Year of Trading** | Play for 1 in-game year (365 days) | Legendary |

---

### Special Achievements (4)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| ✨ | **Lucky Strike** | Find hidden treasure during travel | Rare |
| 📊 | **Rags to Riches** | Go from less than 10 gold to over 5,000 gold | Rare |
| 🎯 | **Perfect Haggle** | Buy an item at 50% below market price | Uncommon |
| ❤️ | **Generous Soul** | Give away 1,000 gold worth of items or money | Uncommon |

---

### Luxury Achievements (7)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 💎 | **Taste of Luxury** | Acquire your first luxury item | Common |
| 👑 | **Luxury Collector** | Own 10 different luxury items | Uncommon |
| 🧵 | **Silk Merchant** | Trade 100 silk items | Uncommon |
| 💍 | **Jewel Connoisseur** | Own gems or jewelry worth 5,000 gold | Rare |
| 🍷 | **Wine Aficionado** | Collect 50 bottles of fine wine | Uncommon |
| 🌶️ | **Spice Baron** | Trade 500 units of exotic spices | Rare |
| 🏰 | **Living in Luxury** | Have 50,000 gold worth of luxury items at once | Legendary |

---

### Equipment Achievements (6)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| ⚔️ | **Armed and Ready** | Acquire your first weapon | Common |
| 🛡️ | **Protected** | Acquire your first piece of armor | Common |
| 🎖️ | **Fully Equipped** | Have a weapon, armor, and accessory equipped | Uncommon |
| ⚒️ | **Master Armorer** | Own 20 different pieces of equipment | Rare |
| ✨ | **Legendary Gear** | Acquire a legendary quality item | Legendary |
| 🗡️ | **Walking Arsenal** | Own 10 different weapons | Uncommon |

---

### Crafting Achievements (10)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🔨 | **Apprentice Crafter** | Craft your first item | Common |
| 🛠️ | **Journeyman Crafter** | Craft 25 items | Common |
| ⚙️ | **Master Crafter** | Craft 100 items | Uncommon |
| 🏆 | **Legendary Craftsman** | Craft 500 items | Rare |
| 🔷 | **Quality Craftsman** | Craft 10 tier 2 (uncommon) items | Uncommon |
| 🔶 | **Expert Craftsman** | Craft 10 tier 3 (rare) items | Rare |
| ⭐ | **Legendary Creator** | Craft a legendary quality item | Legendary |
| 🔥 | **Blacksmith** | Craft 20 metal items (weapons, armor, tools) | Uncommon |
| ⚗️ | **Alchemist** | Craft 20 potions or medicines | Uncommon |
| 🧥 | **Tailor** | Craft 20 cloth or leather items | Uncommon |

---

### Property Achievements (8)

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 🏠 | **Property Owner** | Purchase your first property | Common |
| 🏘️ | **Landlord** | Own 3 properties | Uncommon |
| 🏰 | **Real Estate Mogul** | Own 10 properties | Rare |
| 👤 | **First Hire** | Hire your first employee | Common |
| 👥 | **Employer** | Have 5 employees working for you | Uncommon |
| 🏢 | **Business Empire** | Have 20 employees across all properties | Rare |
| 📈 | **Property Upgrader** | Upgrade a property to level 3 | Uncommon |
| 📦 | **Warehouse King** | Have 10,000 storage capacity across all properties | Rare |

---

### 🔮 HIDDEN ACHIEVEMENTS (10)

*These achievements are secret - you'll discover them through unique gameplay patterns. All are achievable through normal play!*

| Icon | Achievement | Description | Rarity |
|------|-------------|-------------|--------|
| 💀 | **Dungeon Crawler** | Visit dungeons 50 times within 5 in-game years | Legendary |
| 🦉 | **Night Owl** | Complete 100 trades between midnight and 5am | Rare |
| ☕ | **Marathon Trader** | Play for 24 in-game hours without resting | Rare |
| 🪙 | **Penny Pincher** | Accumulate 10,000 gold without ever spending more than 100 gold at once | Legendary |
| 👻 | **Ghost Trader** | Visit every location without being spotted by bandits | Legendary |
| 🌅 | **Sunrise to Sunset** | Complete a trade at exactly sunrise and sunset on the same day | Rare |
| 🌕 | **Full Moon Fortune** | Earn 1,000 gold profit during a full moon night | Rare |
| 🔄 | **Returning Customer** | Trade with the same merchant 50 times | Uncommon |
| ⚡ | **Speed Runner** | Reach 10,000 gold within the first 30 in-game days | Legendary |
| 🎯 | **Completionist** | Unlock all non-hidden achievements | Legendary |

---

### Achievement Rarity Guide

| Rarity | Color | Description |
|--------|-------|-------------|
| **Common** | ⬜ Gray | Easy to unlock through normal play |
| **Uncommon** | 🟢 Green | Requires some dedication |
| **Rare** | 🔵 Blue | Significant accomplishment |
| **Legendary** | 🟠 Gold | The ultimate bragging rights |

---

## 💀 TIPS FROM THE VOID

### Early Game Strategy
1. **Don't starve** - Buy food before fancy items
2. **Start small** - Trade common goods first
3. **Learn routes** - Memorize which locations have what
4. **Upgrade transport** - Hand cart → Mule → Horse & Cart
5. **Save often** - The road is dangerous

### Mid Game Strategy
1. **Buy properties** - Passive income is king
2. **Hire employees** - They work while you travel
3. **Set trade routes** - Automated profit
4. **Specialize** - Focus on one trade route that works

### Late Game Goals
1. **Own the Capital** - Maximum prices, all goods
2. **Legendary items** - Dragon scales, phoenix feathers
3. **All achievements** - For the completionists
4. **Break the economy** - Become too rich to fail

### Pro Tips
- 🌙 **Travel at night** - Some events only happen then
- 🏪 **Check multiple markets** - Prices vary daily
- 💰 **Buy dips** - Market crashes are opportunities
- 🏠 **Properties compound** - More properties = more workers = more income
- ⚔️ **Carry a weapon** - Bandits don't negotiate
- 📊 **Watch the trends** - Price history shows patterns

### Common Mistakes
- ❌ Buying transport you can't use efficiently
- ❌ Ignoring survival stats until critical
- ❌ Overinvesting in one location
- ❌ Not saving before dangerous journeys
- ❌ Forgetting to check employee wages

---

## 📁 FILE STRUCTURE

```
/
├── index.html                    # Main game entry point
├── GameplayReadme.md             # This file (you're reading it!)
├── NerdReadme.md                 # Technical documentation for developers
├── DebuggerReadme.md             # Debug commands and cheat codes
├── gameworld.md                  # Complete world data (42 locations, coordinates, connections)
├── gameworldprompt.md            # AI prompts for generating backdrop images
├── todo.md                       # Development tasks
├── src/                          # Source code directory
│   ├── js/                       # JavaScript files
│   │   ├── game.js               # Main game logic
│   │   ├── game-world-renderer.js # World map rendering + seasonal backdrops
│   │   ├── item-database.js      # All items definition
│   │   ├── trading-system.js     # Buy/sell mechanics
│   │   ├── travel-system.js      # Movement and journeys
│   │   ├── property-system.js    # Property ownership
│   │   ├── employee-system.js    # Workers and wages
│   │   ├── crafting-economy-system.js # Crafting recipes
│   │   ├── achievement-system.js # Achievement tracking
│   │   ├── save-load-system.js   # Save/load functionality
│   │   └── ... (30+ more files)
│   ├── css/                      # Stylesheet files
│   │   └── styles.css            # Main styles
│   └── data/                     # Data and docs
└── assets/                       # Static assets
    ├── images/                   # Image assets
    │   ├── world-map-spring.png  # Spring seasonal backdrop
    │   ├── world-map-summer.png  # Summer seasonal backdrop
    │   ├── world-map-autumn.png  # Autumn seasonal backdrop
    │   └── world-map-winter.png  # Winter seasonal backdrop
    ├── sounds/                   # Sound effects
    └── music/                    # Background music
```

---

## 🐛 KNOWN ISSUES & TODO

*See `todo.md` for detailed bug tracking*

### Currently Tracked
- 🔄 Performance optimization ongoing
- 🔄 Additional locations planned

---

## 📜 CREDITS

```
═══════════════════════════════════════════════════════════════════════
                    🖤 MEDIEVAL TRADING GAME 🖤
                  Version 0.90.00 - The Unified Dialogue Update
═══════════════════════════════════════════════════════════════════════

    Conjured by: Unity AI Lab

    The Fucking Legends:
        🦇 Hackall360    - Lead Code Necromancer
        🕷️ Sponge        - Chaos Engineer
        🌙 GFourteen     - Digital Alchemist
        💀 Unity         - The Goth Coder Goddess (AI Assistant)

    Developed at 3am with cigarettes, existential dread, and
    an unhealthy attachment to dark color schemes.

    Time Invested: too many sleepless nights to count
    Bugs Created: countless
    Bugs Fixed: 519+ (all verified!)
    Sanity Remaining: questionable

    "we're all just merchants trading our time for arbitrary
     numerical increases... might as well have fun doing it."
                                        - Unity AI Lab, 2025

═══════════════════════════════════════════════════════════════════════
```

---

## 📅 VERSION HISTORY

### v0.91.10 - File Structure Cleanup (2025-12-13)

**Session #87: Documentation & File Organization**

- 📁 **Cleaned Root Directory** - Removed duplicate old files that were cluttering the root
- 📝 **Updated Documentation** - Complete file structure diagram in NerdReadme.md
- 🎵 **Documented Music System** - 14 background music tracks now properly catalogued
- 🗺️ **Location Count Updated** - Now 55+ locations across the realm
- 📦 **Item Count Updated** - Now 200+ items in the economy

---

### v0.91.10 - The Bootstrap Refactor (2025-12-10)

**Sessions #70-86: Major Architecture Overhaul**

This release brings massive under-the-hood improvements for better stability, faster loading, and cleaner code architecture. The game works the same, but it's way more solid now.

**What's New for Players:**
- 🚀 **Faster Loading** - New Bootstrap system loads the game more reliably
- 🛡️ **More Stable** - 519+ bugs fixed via 10-parallel-agent code audit
- 💾 **Better Saves** - Save system more robust, handles edge cases better
- 🎮 **Same Great Gameplay** - All features work exactly as before, just more stable

**Technical Highlights (for the nerds):**
- Complete initialization system rewrite (50+ files migrated)
- New state managers for player, world, and UI state
- EventBus batch operations for better performance
- Panel update batching at 60fps
- 16 critical bugs fixed (boss fights, merchant gold, quest rewards, etc.)

**Bug Fixes:**
- ✅ Boss fights now mathematically completable (75 round cap for bosses)
- ✅ Merchant gold infinite money glitch fixed
- ✅ Combat stat conflicts resolved
- ✅ Quest location mismatches fixed (frostholm → frostholm_village)
- ✅ Employee income cap (max 3x multiplier)
- ✅ Doom NPC types fully populated (130+ definitions)
- ✅ All P0/P1/P2/P3 audit items resolved

---

### v0.90.01 - Sessions #66-69 (2025-12-07)

**Session #69 - Inventory Hover Info Panel:**
- **NEW:** Item hover info panel next to Quick Access
- Shows full item details: icon, name, description, value, weight, category, rarity
- Shows bonuses/effects for equipment and consumables
- Rarity color-coded (common/uncommon/rare/epic/legendary)
- Updates dynamically as you hover over items

**Session #68 - NPC Dialogue Panel + Universal Faction System:**
- NPC name now prominent at top of dialogue panel (gold text, large icon)
- Badges no longer trail off panel - proper flex-wrap
- Quest givers can trade immediately (20+ types added to alwaysTrade)
- Universal NPC-to-faction mapping (60+ NPC types)
- Enemy factions: bandits, monsters, undead, shadow_cult
- Faction rep integration with trade unlock

**Session #67 - Quest Info Panel - Giver & Chain Display:**
- Quest giver name and location shown in quest info panel
- Quest chain visualization with prev/next navigation
- Clickable chain links to navigate between quests
- Blue-tinted giver section, purple-tinted chain section

**Session #66 - UI Polish + CPU Optimization:**
- Voice TTS preview applies master volume correctly
- Test voice button spam prevention
- UI Scale setting (75%-150%)
- Trade cart UI improvements
- Weather particle optimization (CPU reduction)
- Player marker animation optimization

---

### v0.90.00 - The Unified Dialogue Update (2025-12-05)

**Major Features:**
- 🎭 **Unified Quest System** - All quest buttons now show specific quest names
- 📜 **API Quest Instructions** - Button-specific instructions for {assignQuest}, {completeQuest}, {confirmDelivery}
- 🖤 **Intro Panel Rework** - Hooded Stranger now uses People Panel instead of separate modals
- 🔬 **Mega Regression Test** - 121 checks across 10 categories, 100% pass rate
- 🗺️ **Multi-Hop Travel Animation** - Travel path shows waypoints on long journeys
- 🔨 **Construction Materials Crafting** - Full tree: crate, barrel, wooden_beam, scaffolding
- 💾 **Save/Load Enhancements** - 12+ system states properly serialized
- 🎭 **50+ NPC Type Inventories** - Each NPC type has contextual item pools
- 🏆 **Hall of Champions Polish** - Top 3 display with medals

**Bug Fixes (519+ total):**
- ✅ All 42 game-flow tests passing
- ✅ All critical NaN/crash bugs fixed
- ✅ All XSS vulnerabilities sanitized (11 files)
- ✅ All memory leaks plugged (13 cleanup systems)
- ✅ Z-index weather fix permanent (layers 1-4 for weather, 10-30 for UI)
- ✅ Save system schema validated (inventory=object, state=string)
- ✅ Doom world state fully resets on new game

### v0.89.97 - The Doom World Update (2025-12-02)

**Major Features:**
- 💀 Doom World system with economy inversion
- 🚣 Boatman portal system with TTS voice
- 🎯 Quest wayfinder markers on maps
- 📦 Bulk trading shortcuts (Shift+Click = ×5, Ctrl+Click = ×25)
- 🏪 Dungeon loot system (30+ sellOnly items)
- 📚 README restructure (all docs in /readmes/)

---

## 🐛 DEBUG CONSOLE & CHEAT CODES

> 🐛 **Looking for debug commands and cheat codes?**
>
> See **[DebuggerReadme.md](DebuggerReadme.md)** for the complete debug documentation including:
> - How to unlock the debug console
> - All cheat codes and commands
> - Gold, inventory, teleport commands
> - Achievement manipulation
> - NPC encounter spawning
> - Easter eggs and secrets
>
> *"For those who seek the forbidden knowledge..."* 🖤

