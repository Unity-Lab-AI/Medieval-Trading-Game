// ═══════════════════════════════════════════════════════════════
// ITEM DATABASE - the sacred tome of all tradeable darkness
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('📚 Item Database emerging from the depths of localStorage...');

const ItemDatabase = {
    // 🏷️ Item categories - organizing the chaos
    categories: {
        CURRENCY: 'currency',
        CONSUMABLES: 'consumables',
        BASIC_RESOURCES: 'basic_resources',
        RAW_ORES: 'raw_ores',
        TOOLS: 'tools',
        LUXURY: 'luxury',
        WEAPONS: 'weapons',
        ARMOR: 'armor',
        DUNGEON_LOOT: 'dungeon_loot',  // 🖤 Sell-only trash from dungeons 💀
        TREASURE: 'treasure'            // 🦇 Valuable finds from events/dungeons
    },

    // ✨ Rarity levels - how special is your junk?
    // 🖤 Cleaned up - lowercase only, getRarity() handles case-insensitive lookup 💀
    rarity: {
        common: { name: 'Common', color: '#888888' },
        uncommon: { name: 'Uncommon', color: '#00ff00' },
        rare: { name: 'Rare', color: '#0080ff' },
        epic: { name: 'Epic', color: '#800080' },
        legendary: { name: 'Legendary', color: '#ff8000' }
    },

    // 🦇 Case-insensitive rarity lookup for backwards compatibility
    getRarity(rarityKey) {
        if (!rarityKey) return this.rarity.common;
        const key = String(rarityKey).toLowerCase();
        return this.rarity[key] || this.rarity.common;
    },

    // Item definitions
    items: {
        // === CURRENCY ===
        gold: {
            id: 'gold',
            name: 'Gold Coins',
            description: 'Standard currency used throughout the realm. Each coin weighs almost nothing.',
            icon: '💰',
            category: 'currency',
            rarity: 'common',
            // 🖤 Gold weight is INTENTIONALLY this low 💀
            // 0.0001 means 10,000 gold coins = 1 weight unit
            // This is a DESIGN CHOICE so gold doesn't fuck up your inventory capacity
            // Don't "fix" this unless Gee says so - gold needs to be light as air
            weight: 0.0001, // Very light - 10,000 gold = 1 weight unit
            basePrice: 1, // 1 gold = 1 gold (for reference)
            stackable: true,
            tradeable: true
        },

        // Basic resources
        food: {
            id: 'food',
            name: 'Food',
            description: 'Basic sustenance for survival.',
            icon: '🍖',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 5,
            consumable: true,
            effects: {
                hunger: 20,
                health: 5
            }
        },
        water: {
            id: 'water',
            name: 'Water',
            description: 'Clean drinking water.',
            icon: '💧',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 2,
            consumable: true,
            effects: {
                thirst: 25,
                health: 2
            }
        },
        bread: {
            id: 'bread',
            name: 'Bread',
            description: 'Freshly baked bread.',
            icon: '🍞',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 3,
            consumable: true,
            effects: {
                hunger: 15,
                health: 3
            }
        },

        // Resources
        wood: {
            id: 'wood',
            name: 'Wood',
            description: 'Basic building material.',
            icon: '🪵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 5,
            basePrice: 8
        },
        stone: {
            id: 'stone',
            name: 'Stone',
            description: 'Basic building material.',
            icon: '🪨',
            category: 'basic_resources',
            rarity: 'common',
            weight: 10,
            basePrice: 5
        },
        iron_ore: {
            id: 'iron_ore',
            name: 'Iron Ore',
            description: 'Raw iron ore for smelting.',
            icon: '⛏️',
            category: 'raw_ores',
            rarity: 'common',
            weight: 15,
            basePrice: 12
        },
        coal: {
            id: 'coal',
            name: 'Coal',
            description: 'Fuel for fires and furnaces.',
            icon: '⚫',
            category: 'basic_resources',
            rarity: 'common',
            weight: 8,
            basePrice: 6
        },

        // Tools - equippable with bonuses
        hammer: {
            id: 'hammer',
            name: 'Hammer',
            description: 'Basic tool for construction.',
            icon: '🔨',
            category: 'tools',
            rarity: 'common',
            weight: 3,
            basePrice: 15,
            toolType: 'construction',
            durability: 100,
            equipSlot: 'tool',
            bonuses: { crafting: 2, construction: 5 }
        },
        axe: {
            id: 'axe',
            name: 'Axe',
            description: 'Tool for chopping wood.',
            icon: '🪓',
            category: 'tools',
            rarity: 'common',
            weight: 4,
            basePrice: 20,
            toolType: 'woodcutting',
            durability: 120,
            equipSlot: 'tool',
            bonuses: { gathering: 2, woodcutting: 5 }
        },
        pickaxe: {
            id: 'pickaxe',
            name: 'Pickaxe',
            description: 'Tool for mining.',
            icon: '⛏️',
            category: 'tools',
            rarity: 'common',
            weight: 6,
            basePrice: 25,
            toolType: 'mining',
            durability: 100,
            equipSlot: 'tool',
            bonuses: { gathering: 2, mining: 5 }
        },

        // Weapons - equippable with combat bonuses
        sword: {
            id: 'sword',
            name: 'Sword',
            description: 'Basic weapon for defense.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'common',
            weight: 5,
            basePrice: 50,
            damage: 10,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 5, damage: 10 }
        },
        spear: {
            id: 'spear',
            name: 'Spear',
            description: 'Simple throwing weapon.',
            icon: '🔱',
            category: 'weapons',
            rarity: 'common',
            weight: 4,
            basePrice: 30,
            damage: 8,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 4, damage: 8 }
        },
        bow: {
            id: 'bow',
            name: 'Bow',
            description: 'Ranged weapon.',
            icon: '🏹',
            category: 'weapons',
            rarity: 'common',
            weight: 3,
            basePrice: 40,
            damage: 7,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 3, damage: 7, luck: 1 }
        },

        // Luxury goods
        silk: {
            id: 'silk',
            name: 'Silk',
            description: 'Expensive luxury fabric.',
            icon: '🧵',
            category: 'luxury',
            rarity: 'rare',
            weight: 1,
            basePrice: 100
        },
        // Trade goods
        fish: {
            id: 'fish',
            name: 'Fish',
            description: 'Fresh fish from local waters.',
            icon: '🐟',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 8,
            consumable: true,
            effects: {
                hunger: 12,
                health: 4
            }
        },
        ale: {
            id: 'ale',
            name: 'Ale',
            description: 'Local brewed ale.',
            icon: '🍺',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 10,
            consumable: true,
            effects: {
                happiness: 10,
                health: 3
            }
        },
        timber: {
            id: 'timber',
            name: 'Timber',
            description: 'Processed wood for construction.',
            icon: '🪵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 6,
            basePrice: 12
        },
        grain: {
            id: 'grain',
            name: 'Grain',
            description: 'Basic food staple.',
            icon: '🌾',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 6,
            consumable: true,
            effects: {
                hunger: 8
            }
        },
        livestock: {
            id: 'livestock',
            name: 'Livestock',
            description: 'Live animals for trade.',
            icon: '🐄',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 50,
            basePrice: 80
        },
        tools: {
            id: 'tools',
            name: 'Tools',
            description: 'Various tools and equipment.',
            icon: '🔧',
            category: 'tools',
            rarity: 'common',
            weight: 8,
            basePrice: 25
        },
        weapons: {
            id: 'weapons',
            name: 'Weapons',
            description: 'Various weapons and armor.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 10,
            basePrice: 60,
            // 🖤💀 EQUIPPABLE: Generic weapon bundle 💀
            equipSlot: 'weapon',
            equipType: 'weapon',
            damage: 15,
            bonuses: { attack: 5, damage: 15 }
        },
        armor: {
            id: 'armor',
            name: 'Armor',
            description: 'Protective equipment.',
            icon: '🛡️',
            category: 'armor',  // 🖤 Fixed: was 'weapons', now 'armor' 💀
            rarity: 'uncommon',
            weight: 15,
            basePrice: 80,
            // 🖤💀 EQUIPPABLE: Generic armor set 💀
            equipSlot: 'body',
            equipType: 'armor',
            bonuses: { defense: 15 }
        },
        luxury_goods: {
            id: 'luxury_goods',
            name: 'Luxury Goods',
            description: 'High-end luxury items.',
            icon: '👑',
            category: 'luxury',
            rarity: 'rare',
            weight: 5,
            basePrice: 150
        },
        furs: {
            id: 'furs',
            name: 'Furs',
            description: 'Animal pelts for trade.',
            icon: '🦊',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 35
        },
        minerals: {
            id: 'minerals',
            name: 'Minerals',
            description: 'Various mineral resources.',
            icon: '💎',
            category: 'raw_ores',
            rarity: 'uncommon',
            weight: 12,
            basePrice: 45
        },
        ice_goods: {
            id: 'ice_goods',
            name: 'Ice Goods',
            description: 'Goods from frozen regions.',
            icon: '🧊',
            category: 'luxury',
            rarity: 'rare',
            weight: 4,
            basePrice: 60
        },
        crystals: {
            id: 'crystals',
            name: 'Crystals',
            description: 'Magical crystals.',
            icon: '🔮',
            category: 'luxury',
            rarity: 'epic',
            weight: 0.5,
            basePrice: 300
        },
        magic_items: {
            id: 'magic_items',
            name: 'Magic Items',
            description: 'Items with magical properties.',
            icon: '🪄',
            category: 'luxury',
            rarity: 'epic',
            weight: 2,
            basePrice: 500
        },
        rare_gems: {
            id: 'rare_gems',
            name: 'Rare Gems',
            description: 'Extremely valuable gemstones.',
            icon: '💠',
            category: 'luxury',
            rarity: 'legendary',
            weight: 0.1,
            basePrice: 800
        },
        tea: {
            id: 'tea',
            name: 'Tea',
            description: 'Dried tea leaves.',
            icon: '🍵',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 20,
            consumable: true,
            effects: {
                happiness: 5,
                health: 2
            }
        },
        honey: {
            id: 'honey',
            name: 'Honey',
            description: 'Sweet golden honey.',
            icon: '🍯',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 15,
            consumable: true,
            effects: {
                happiness: 8,
                health: 3
            }
        },
        fruits: {
            id: 'fruits',
            name: 'Fruits',
            description: 'Fresh seasonal fruits.',
            icon: '🍎',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 10,
            consumable: true,
            effects: {
                hunger: 10,
                health: 5
            }
        },
        jade: {
            id: 'jade',
            name: 'Jade',
            description: 'Precious green stone.',
            icon: '💚',
            category: 'luxury',
            rarity: 'epic',
            weight: 0.3,
            basePrice: 400
        },
        porcelain: {
            id: 'porcelain',
            name: 'Porcelain',
            description: 'Delicate ceramic goods.',
            icon: '🏺',
            category: 'luxury',
            rarity: 'rare',
            weight: 2,
            basePrice: 250
        },
        imperial_goods: {
            id: 'imperial_goods',
            name: 'Imperial Goods',
            description: 'Goods from the imperial court.',
            icon: '👑',
            category: 'luxury',
            rarity: 'epic',
            weight: 3,
            basePrice: 600
        },
        documents: {
            id: 'documents',
            name: 'Documents',
            description: 'Official documents and papers.',
            icon: '📄',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0.1,
            basePrice: 100
        },
        services: {
            id: 'services',
            name: 'Services',
            description: 'Professional services.',
            icon: '🤝',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0,
            basePrice: 75
        },
        artifacts: {
            id: 'artifacts',
            name: 'Artifacts',
            description: 'Ancient and valuable artifacts.',
            icon: '🏺',
            category: 'luxury',
            rarity: 'legendary',
            weight: 5,
            basePrice: 1000
        },
        rare_treasures: {
            id: 'rare_treasures',
            name: 'Rare Treasures',
            description: 'Extremely valuable treasures.',
            icon: '🏆',
            category: 'luxury',
            rarity: 'legendary',
            weight: 10,
            basePrice: 2000
        },
        imperial_favors: {
            id: 'imperial_favors',
            name: 'Imperial Favors',
            description: 'Favors from the imperial court.',
            icon: '👑',
            category: 'luxury',
            rarity: 'legendary',
            weight: 0,
            basePrice: 5000
        },

        // === 💎 TREASURE - Event rewards & valuable finds ===
        rare_gem: {
            id: 'rare_gem',
            name: 'Rare Gem',
            description: 'A beautiful gemstone that catches the light. Highly prized by collectors and jewelers.',
            icon: '💎',
            category: 'treasure',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 150,
            stackable: true,
            tradeable: true,
            sellOnly: false  // 🖤 Merchants will buy this - it's valuable 💀
        },
        ancient_coin: {
            id: 'ancient_coin',
            name: 'Ancient Coin',
            description: 'A coin from a long-forgotten empire. Collectors pay handsomely for these.',
            icon: '🪙',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 0.05,
            basePrice: 75,
            stackable: true,
            tradeable: true,
            sellOnly: false
        },
        golden_idol: {
            id: 'golden_idol',
            name: 'Golden Idol',
            description: 'A small golden statue of an unknown deity. Worth a fortune to the right buyer.',
            icon: '🗿',
            category: 'treasure',
            rarity: 'epic',
            weight: 2,
            basePrice: 500,
            stackable: false,
            tradeable: true,
            sellOnly: false
        },
        enchanted_crystal: {
            id: 'enchanted_crystal',
            name: 'Enchanted Crystal',
            description: 'A crystal pulsing with magical energy. Mages and alchemists covet these.',
            icon: '🔮',
            category: 'treasure',
            rarity: 'epic',
            weight: 0.5,
            basePrice: 350,
            stackable: true,
            tradeable: true,
            sellOnly: false
        },
        dragon_scale: {
            id: 'dragon_scale',
            name: 'Dragon Scale',
            description: 'A scale from a great wyrm. Nearly indestructible and worth a king\'s ransom.',
            icon: '🐉',
            category: 'treasure',
            rarity: 'legendary',
            weight: 1,
            basePrice: 1000,
            stackable: true,
            tradeable: true,
            sellOnly: false
        },

        // === 🗑️ DUNGEON LOOT - Sell-only trash from dungeons ===
        // 🖤 Merchants will NOT sell these - only buy them from players 💀
        rusty_dagger: {
            id: 'rusty_dagger',
            name: 'Rusty Dagger',
            description: 'A corroded blade. Worthless for combat but can be sold for scrap.',
            icon: '🗡️',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.5,
            basePrice: 3,
            stackable: true,
            tradeable: true,
            sellOnly: true  // 🖤 Merchants buy but don't sell 💀
        },
        tattered_cloth: {
            id: 'tattered_cloth',
            name: 'Tattered Cloth',
            description: 'Torn fabric from dungeon denizens. Only good for rags.',
            icon: '🧵',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.2,
            basePrice: 1,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        broken_armor: {
            id: 'broken_armor',
            name: 'Broken Armor Piece',
            description: 'Damaged armor scrap. Blacksmiths might pay a little for the metal.',
            icon: '🛡️',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 3,
            basePrice: 5,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        monster_bone: {
            id: 'monster_bone',
            name: 'Monster Bone',
            description: 'A bone from some fell creature. Alchemists use these in potions.',
            icon: '🦴',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.5,
            basePrice: 4,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        monster_fang: {
            id: 'monster_fang',
            name: 'Monster Fang',
            description: 'A sharp tooth from a dangerous beast. Trophy hunters collect these.',
            icon: '🦷',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 0.2,
            basePrice: 12,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        cursed_trinket: {
            id: 'cursed_trinket',
            name: 'Cursed Trinket',
            description: 'A dark bauble radiating faint malice. Collectors of the occult may want this.',
            icon: '📿',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 0.3,
            basePrice: 20,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        dark_essence: {
            id: 'dark_essence',
            name: 'Dark Essence',
            description: 'Concentrated shadow energy from a defeated foe. Mages pay well for this.',
            icon: '🌑',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 35,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        ancient_relic: {
            id: 'ancient_relic',
            name: 'Ancient Relic',
            description: 'A mysterious artifact from a bygone age. Scholars would pay handsomely to study it.',
            icon: '⚱️',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 1,
            basePrice: 50,
            stackable: false,
            tradeable: true,
            sellOnly: true
        },
        demon_horn: {
            id: 'demon_horn',
            name: 'Demon Horn',
            description: 'A horn from a creature of the abyss. Extremely rare and valuable to the right buyer.',
            icon: '👹',
            category: 'dungeon_loot',
            rarity: 'epic',
            weight: 0.8,
            basePrice: 100,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },

        // === 🗡️ ENEMY LOOT - Combat drops (sell-only) ===
        // 🖤 These drop from enemies in combat - merchants buy but don't sell 💀
        rusty_sword: {
            id: 'rusty_sword',
            name: 'Rusty Sword',
            description: 'A corroded blade from a bandit. Worth little but can be melted down.',
            icon: '⚔️',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 2,
            basePrice: 5,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        leather_scraps: {
            id: 'leather_scraps',
            name: 'Leather Scraps',
            description: 'Torn leather pieces. Useful for basic repairs or crafting.',
            icon: '🥾',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.3,
            basePrice: 2,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        wolf_pelt: {
            id: 'wolf_pelt',
            name: 'Wolf Pelt',
            description: 'A thick fur pelt from a wild wolf. Tanners pay well for these.',
            icon: '🐺',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 1,
            basePrice: 15,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        bone_fragment: {
            id: 'bone_fragment',
            name: 'Bone Fragment',
            description: 'A piece of bone from a fallen creature. Alchemists use these.',
            icon: '🦴',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.2,
            basePrice: 3,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        raw_meat: {
            id: 'raw_meat',
            name: 'Raw Meat',
            description: 'Fresh meat from a beast. Cook it before eating.',
            icon: '🥩',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 1,
            basePrice: 5,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        lockpick: {
            id: 'lockpick',
            name: 'Lockpick',
            description: 'A thief\'s tool. Useful for opening locked chests.',
            icon: '🔓',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 0.1,
            basePrice: 10,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        stolen_goods: {
            id: 'stolen_goods',
            name: 'Stolen Goods',
            description: 'Items taken from a thief. Questionable origin but still valuable.',
            icon: '💼',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 25,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        rusted_medallion: {
            id: 'rusted_medallion',
            name: 'Rusted Medallion',
            description: 'An old medallion from a skeleton warrior. Collectors may want it.',
            icon: '🎖️',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 0.2,
            basePrice: 20,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        goblin_ear: {
            id: 'goblin_ear',
            name: 'Goblin Ear',
            description: 'Proof of a goblin kill. Some towns offer bounties for these.',
            icon: '👂',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.1,
            basePrice: 5,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        crude_dagger: {
            id: 'crude_dagger',
            name: 'Crude Dagger',
            description: 'A poorly made blade. Only good for scrap metal.',
            icon: '🔪',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.5,
            basePrice: 3,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        shiny_rock: {
            id: 'shiny_rock',
            name: 'Shiny Rock',
            description: 'A rock that caught a goblin\'s eye. Worthless but amusing.',
            icon: '🪨',
            category: 'dungeon_loot',
            rarity: 'common',
            weight: 0.5,
            basePrice: 1,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        orc_tooth: {
            id: 'orc_tooth',
            name: 'Orc Tooth',
            description: 'A large tusk from an orc. Intimidating and valuable.',
            icon: '🦷',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 0.3,
            basePrice: 15,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        crude_axe: {
            id: 'crude_axe',
            name: 'Crude Axe',
            description: 'An orc\'s brutal weapon. Heavy but worth something.',
            icon: '🪓',
            category: 'dungeon_loot',
            rarity: 'uncommon',
            weight: 4,
            basePrice: 12,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        ectoplasm: {
            id: 'ectoplasm',
            name: 'Ectoplasm',
            description: 'Ghostly residue from a spirit. Mages pay well for this.',
            icon: '👻',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 40,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        spirit_essence: {
            id: 'spirit_essence',
            name: 'Spirit Essence',
            description: 'Concentrated spiritual energy. Extremely rare and valuable.',
            icon: '✨',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 60,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        cursed_mirror: {
            id: 'cursed_mirror',
            name: 'Cursed Mirror',
            description: 'A mirror haunted by a spirit. Collectors of the occult want these.',
            icon: '🪞',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 1,
            basePrice: 75,
            stackable: false,
            tradeable: true,
            sellOnly: true
        },
        troll_hide: {
            id: 'troll_hide',
            name: 'Troll Hide',
            description: 'Thick regenerating hide from a troll. Armorers prize this.',
            icon: '🧌',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 5,
            basePrice: 80,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        giant_club: {
            id: 'giant_club',
            name: 'Giant Club',
            description: 'A massive club from a troll. Too heavy for most but impressive.',
            icon: '🏏',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 10,
            basePrice: 50,
            stackable: false,
            tradeable: true,
            sellOnly: true
        },
        troll_blood: {
            id: 'troll_blood',
            name: 'Troll Blood',
            description: 'Blood with regenerative properties. Alchemists need this.',
            icon: '🩸',
            category: 'dungeon_loot',
            rarity: 'rare',
            weight: 0.5,
            basePrice: 100,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        dragon_tooth: {
            id: 'dragon_tooth',
            name: 'Dragon Tooth',
            description: 'A fang from a young dragon. Incredibly hard and valuable.',
            icon: '🦷',
            category: 'dungeon_loot',
            rarity: 'epic',
            weight: 1,
            basePrice: 200,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },
        fire_essence: {
            id: 'fire_essence',
            name: 'Fire Essence',
            description: 'Crystallized dragon fire. Burns eternally. Mages covet this.',
            icon: '🔥',
            category: 'dungeon_loot',
            rarity: 'epic',
            weight: 0.2,
            basePrice: 250,
            stackable: true,
            tradeable: true,
            sellOnly: true
        },

        // === MISSING ITEMS - Village Resources ===
        herbs: {
            id: 'herbs',
            name: 'Herbs',
            description: 'Medicinal and culinary herbs from the countryside.',
            icon: '🌿',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 8,
            consumable: true,
            effects: {
                health: 10
            }
        },
        logs: {
            id: 'logs',
            name: 'Logs',
            description: 'Raw timber logs for processing.',
            icon: '🪵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 15,
            basePrice: 6
        },
        seeds: {
            id: 'seeds',
            name: 'Seeds',
            description: 'Various seeds for planting crops.',
            icon: '🌱',
            category: 'basic_resources',
            rarity: 'common',
            weight: 0.5,
            basePrice: 4
        },
        wool: {
            id: 'wool',
            name: 'Wool',
            description: 'Soft wool from sheep, used for clothing.',
            icon: '🐑',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 12
        },
        clay: {
            id: 'clay',
            name: 'Clay',
            description: 'Raw clay for pottery and bricks.',
            icon: '🏺',
            category: 'basic_resources',
            rarity: 'common',
            weight: 8,
            basePrice: 5
        },

        // === MISSING ITEMS - Town Resources ===
        meat: {
            id: 'meat',
            name: 'Meat',
            description: 'Fresh meat from local butchers.',
            icon: '🥩',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 12,
            consumable: true,
            effects: {
                hunger: 25,
                health: 8
            }
        },
        vegetables: {
            id: 'vegetables',
            name: 'Vegetables',
            description: 'Fresh vegetables from local farms.',
            icon: '🥕',
            category: 'consumables',
            rarity: 'common',
            weight: 1.5,
            basePrice: 6,
            consumable: true,
            effects: {
                hunger: 12,
                health: 6
            }
        },
        cheese: {
            id: 'cheese',
            name: 'Cheese',
            description: 'Aged cheese from local dairies.',
            icon: '🧀',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 15,
            consumable: true,
            effects: {
                hunger: 18,
                health: 5
            }
        },
        arrows: {
            id: 'arrows',
            name: 'Arrows',
            description: 'Bundle of arrows for archery.',
            icon: '🏹',
            category: 'weapons',
            rarity: 'common',
            weight: 1,
            basePrice: 10,
            damage: 5
        },

        // === MISSING ITEMS - City Resources ===
        copper_ore: {
            id: 'copper_ore',
            name: 'Copper Ore',
            description: 'Raw copper ore for smelting.',
            icon: '🟤',
            category: 'raw_ores',
            rarity: 'common',
            weight: 12,
            basePrice: 10
        },
        tin: {
            id: 'tin',
            name: 'Tin',
            description: 'Tin ore used for bronze making.',
            icon: '⚪',
            category: 'raw_ores',
            rarity: 'uncommon',
            weight: 10,
            basePrice: 18
        },
        bricks: {
            id: 'bricks',
            name: 'Bricks',
            description: 'Fired clay bricks for construction.',
            icon: '🧱',
            category: 'basic_resources',
            rarity: 'common',
            weight: 20,
            basePrice: 15
        },
        mortar: {
            id: 'mortar',
            name: 'Mortar',
            description: 'Building mortar for stonework.',
            icon: '🪣',
            category: 'basic_resources',
            rarity: 'common',
            weight: 10,
            basePrice: 8
        },
        nails: {
            id: 'nails',
            name: 'Nails',
            description: 'Iron nails for construction.',
            icon: '📌',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 12
        },

        // === MISSING ITEMS - Northern Specialties ===
        winter_clothing: {
            id: 'winter_clothing',
            name: 'Winter Clothing',
            description: 'Warm clothing for cold climates. Protects against harsh weather.',
            icon: '🧥',
            category: 'armor',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 60,
            // 🖤💀 EQUIPPABLE: Body slot - weather protection 💀
            equipSlot: 'body',
            equipType: 'clothing',
            stats: { coldResist: 10, weatherProtection: 5 }
        },
        iron_bar: {
            id: 'iron_bar',
            name: 'Iron Bar',
            description: 'Smelted iron bar ready for smithing.',
            icon: '🔩',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 8,
            basePrice: 35
        },
        steel_bar: {
            id: 'steel_bar',
            name: 'Steel Bar',
            description: 'High-quality steel for weapons and armor.',
            icon: '⚙️',
            category: 'basic_resources',
            rarity: 'rare',
            weight: 10,
            basePrice: 100
        },

        // === MISSING ITEMS - Eastern/Trade Specialties ===
        spices: {
            id: 'spices',
            name: 'Spices',
            description: 'Exotic spices from distant lands.',
            icon: '🌶️',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.5,
            basePrice: 40
        },
        gems: {
            id: 'gems',
            name: 'Gems',
            description: 'Precious gemstones mined from the earth.',
            icon: '💎',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.2,
            basePrice: 150
        },
        exotic_goods: {
            id: 'exotic_goods',
            name: 'Exotic Goods',
            description: 'Rare items from faraway lands.',
            icon: '🎭',
            category: 'luxury',
            rarity: 'rare',
            weight: 3,
            basePrice: 120
        },
        trade_goods: {
            id: 'trade_goods',
            name: 'Trade Goods',
            description: 'Assorted goods popular with merchants.',
            icon: '📦',
            category: 'basic_resources',
            rarity: 'common',
            weight: 5,
            basePrice: 25
        },

        // === MISSING ITEMS - Capital/Royal Specialties ===
        royal_goods: {
            id: 'royal_goods',
            name: 'Royal Goods',
            description: 'Fine goods fit for nobility.',
            icon: '👑',
            category: 'luxury',
            rarity: 'epic',
            weight: 2,
            basePrice: 300
        },
        royal_favors: {
            id: 'royal_favors',
            name: 'Royal Favors',
            description: 'Tokens of favor from the royal court.',
            icon: '🎖️',
            category: 'luxury',
            rarity: 'legendary',
            weight: 0,
            basePrice: 5000
        },

        // === MISSING ITEMS - Food and Drink ===
        mead: {
            id: 'mead',
            name: 'Mead',
            description: 'Sweet honey wine, a favorite in taverns.',
            icon: '🍯',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 18,
            consumable: true,
            effects: {
                happiness: 15,
                health: 2
            }
        },
        wine: {
            id: 'wine',
            name: 'Wine',
            description: 'Fine wine for celebrations.',
            icon: '🍷',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 25,
            consumable: true,
            effects: {
                happiness: 20,
                health: 1
            }
        },

        // === MISSING ITEMS - Medical/Special ===
        medical_plants: {
            id: 'medical_plants',
            name: 'Medical Plants',
            description: 'Rare medicinal plants for healing.',
            icon: '🌺',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 30,
            consumable: true,
            effects: {
                health: 25
            }
        },
        luxury_items: {
            id: 'luxury_items',
            name: 'Luxury Items',
            description: 'Exquisite luxury items for the wealthy.',
            icon: '💍',
            category: 'luxury',
            rarity: 'rare',
            weight: 1,
            basePrice: 200
        },
        information: {
            id: 'information',
            name: 'Information',
            description: 'Valuable intelligence and rumors.',
            icon: '📜',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0,
            basePrice: 50
        },
        jewelry: {
            id: 'jewelry',
            name: 'Jewelry',
            description: 'Fine jewelry and precious ornaments.',
            icon: '💍',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.2,
            basePrice: 180
        },

        // === EXPANDED ITEMS - More Weapons ===
        dagger: {
            id: 'dagger',
            name: 'Dagger',
            description: 'A sharp, concealable blade.',
            icon: '🗡️',
            category: 'weapons',
            rarity: 'common',
            weight: 1,
            basePrice: 15,
            damage: 8,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 3, damage: 8, speed: 2 }
        },
        crossbow: {
            id: 'crossbow',
            name: 'Crossbow',
            description: 'Powerful ranged weapon with high accuracy.',
            icon: '🏹',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 6,
            basePrice: 85, // 🖤 Balanced: 25 damage uncommon ranged, same tier as longsword 💀
            damage: 25,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 8, damage: 25, luck: 2 }
        },
        longsword: {
            id: 'longsword',
            name: 'Longsword',
            description: 'A well-balanced blade for knights.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 4,
            basePrice: 85,
            damage: 35,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 12, damage: 35, defense: 3 }
        },
        battleaxe: {
            id: 'battleaxe',
            name: 'Battleaxe',
            description: 'Heavy two-handed axe for warriors.',
            icon: '🪓',
            category: 'weapons',
            rarity: 'rare',
            weight: 8,
            basePrice: 110,
            damage: 45,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 15, damage: 45, strength: 3 }
        },
        warhammer: {
            id: 'warhammer',
            name: 'Warhammer',
            description: 'Crushing weapon that can break armor.',
            icon: '🔨',
            category: 'weapons',
            rarity: 'rare',
            weight: 10,
            basePrice: 95,
            damage: 40,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 12, damage: 40, strength: 5 }
        },
        lance: {
            id: 'lance',
            name: 'Lance',
            description: 'Cavalry weapon for mounted combat.',
            icon: '🎯',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 7,
            basePrice: 70,
            damage: 30,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 10, damage: 30, speed: 3 }
        },

        // === EXPANDED ITEMS - Armor Sets ===
        leather_armor: {
            id: 'leather_armor',
            name: 'Leather Armor',
            description: 'Light armor made from hardened leather.',
            icon: '🦺',
            category: 'armor',
            rarity: 'common',
            weight: 8,
            basePrice: 45,
            defense: 10,
            equipSlot: 'body',
            equipType: 'armor',
            bonuses: { defense: 10, speed: 1 }
        },
        chainmail: {
            id: 'chainmail',
            name: 'Chainmail',
            description: 'Armor made of interlocking metal rings.',
            icon: '🛡️',
            category: 'armor',
            rarity: 'uncommon',
            weight: 15,
            basePrice: 120,
            defense: 25,
            equipSlot: 'body',
            equipType: 'armor',
            bonuses: { defense: 25, endurance: 2 }
        },
        plate_armor: {
            id: 'plate_armor',
            name: 'Plate Armor',
            description: 'Heavy full-plate armor for knights.',
            icon: '🛡️',
            category: 'armor',
            rarity: 'rare',
            weight: 30,
            basePrice: 250,
            defense: 50,
            equipSlot: 'body',
            equipType: 'armor',
            bonuses: { defense: 50, endurance: 5, speed: -2 }
        },
        shield: {
            id: 'shield',
            name: 'Shield',
            description: 'Wooden shield reinforced with iron.',
            icon: '🛡️',
            category: 'armor',
            rarity: 'common',
            weight: 6,
            basePrice: 30,
            defense: 8,
            equipSlot: 'offhand',
            equipType: 'shield',
            bonuses: { defense: 8, block: 10 }
        },
        helmet: {
            id: 'helmet',
            name: 'Helmet',
            description: 'Iron helmet to protect the head.',
            icon: '⛑️',
            category: 'armor',
            rarity: 'common',
            weight: 3,
            basePrice: 25,
            defense: 5,
            equipSlot: 'head',
            equipType: 'helmet',
            bonuses: { defense: 5, perception: 1 }
        },

        // === EXPANDED ITEMS - Accessories & Gear ===
        leather_boots: {
            id: 'leather_boots',
            name: 'Leather Boots',
            description: 'Sturdy boots for traveling.',
            icon: '👢',
            category: 'armor',
            rarity: 'common',
            weight: 2,
            basePrice: 20,
            equipSlot: 'feet',
            equipType: 'boots',
            bonuses: { speed: 2, travel: 5 }
        },
        iron_boots: {
            id: 'iron_boots',
            name: 'Iron Boots',
            description: 'Heavy armored boots.',
            icon: '👢',
            category: 'armor',
            rarity: 'uncommon',
            weight: 5,
            basePrice: 55,
            equipSlot: 'feet',
            equipType: 'boots',
            bonuses: { defense: 5, speed: -1 }
        },
        leather_gloves: {
            id: 'leather_gloves',
            name: 'Leather Gloves',
            description: 'Simple gloves for work and travel.',
            icon: '🧤',
            category: 'armor',
            rarity: 'common',
            weight: 1,
            basePrice: 12,
            equipSlot: 'hands',
            equipType: 'gloves',
            bonuses: { crafting: 2, gathering: 1 }
        },
        blacksmith_gloves: {
            id: 'blacksmith_gloves',
            name: 'Blacksmith Gloves',
            description: 'Heat-resistant gloves for metalwork.',
            icon: '🧤',
            category: 'armor',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 35,
            equipSlot: 'hands',
            equipType: 'gloves',
            bonuses: { crafting: 5, smithing: 10 }
        },
        silver_ring: {
            id: 'silver_ring',
            name: 'Silver Ring',
            description: 'A simple silver band that brings luck.',
            icon: '💍',
            category: 'accessory',
            rarity: 'uncommon',
            weight: 0.1,
            basePrice: 50,
            equipSlot: 'accessory1',
            equipType: 'ring',
            bonuses: { luck: 3, charisma: 1 }
        },
        gold_ring: {
            id: 'gold_ring',
            name: 'Gold Ring',
            description: 'An elegant gold ring of wealth.',
            icon: '💍',
            category: 'accessory',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 150,
            equipSlot: 'accessory1',
            equipType: 'ring',
            bonuses: { luck: 5, charisma: 3, tradingDiscount: 5 }
        },
        merchants_amulet: {
            id: 'merchants_amulet',
            name: "Merchant's Amulet",
            description: 'An amulet blessed for successful trades.',
            icon: '📿',
            category: 'accessory',
            rarity: 'rare',
            weight: 0.2,
            basePrice: 200,
            equipSlot: 'accessory2',
            equipType: 'amulet',
            bonuses: { charisma: 5, tradingDiscount: 10, luck: 2 }
        },
        travelers_cloak: {
            id: 'travelers_cloak',
            name: "Traveler's Cloak",
            description: 'A warm cloak that speeds journeys.',
            icon: '🧥',
            category: 'accessory',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 65,
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { speed: 5, travel: 10, endurance: 2 }
        },
        miners_helmet: {
            id: 'miners_helmet',
            name: "Miner's Helmet",
            description: 'Helmet with lantern for dark places.',
            icon: '⛑️',
            category: 'armor',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 40,
            equipSlot: 'head',
            equipType: 'helmet',
            bonuses: { mining: 5, perception: 3 }
        },
        fishing_hat: {
            id: 'fishing_hat',
            name: 'Fishing Hat',
            description: 'Wide-brimmed hat favored by anglers.',
            icon: '🎩',
            category: 'accessory',
            rarity: 'common',
            weight: 0.5,
            basePrice: 15,
            equipSlot: 'head',
            equipType: 'hat',
            bonuses: { fishing: 5, luck: 1 }
        },
        sturdy_backpack: {
            id: 'sturdy_backpack',
            name: 'Sturdy Backpack',
            description: 'Large backpack for hauling goods.',
            icon: '🎒',
            category: 'accessory',
            rarity: 'common',
            weight: 2,
            basePrice: 30,
            equipSlot: 'accessory2',
            equipType: 'accessory',
            bonuses: { carryCapacity: 20 }
        },

        // === EXPANDED ITEMS - More Food & Drink ===
        mutton: {
            id: 'mutton',
            name: 'Mutton',
            description: 'Roasted sheep meat.',
            icon: '🍖',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 14,
            consumable: true,
            effects: { hunger: 28, health: 10 }
        },
        pork: {
            id: 'pork',
            name: 'Pork',
            description: 'Salted pork from local farms.',
            icon: '🥓',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 13,
            consumable: true,
            effects: { hunger: 26, health: 9 }
        },
        apples: {
            id: 'apples',
            name: 'Apples',
            description: 'Fresh crisp apples.',
            icon: '🍎',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 5,
            consumable: true,
            effects: { hunger: 10, health: 5 }
        },
        berries: {
            id: 'berries',
            name: 'Berries',
            description: 'Wild berries from the forest.',
            icon: '🫐',
            category: 'consumables',
            rarity: 'common',
            weight: 0.3,
            basePrice: 4,
            consumable: true,
            effects: { hunger: 8, health: 6 }
        },
        mushrooms: {
            id: 'mushrooms',
            name: 'Mushrooms',
            description: 'Edible forest mushrooms.',
            icon: '🍄',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 8,
            consumable: true,
            effects: { hunger: 12, health: 4 }
        },
        nuts: {
            id: 'nuts',
            name: 'Nuts',
            description: 'Nutritious nuts and seeds.',
            icon: '🥜',
            category: 'consumables',
            rarity: 'common',
            weight: 0.4,
            basePrice: 6,
            consumable: true,
            effects: { hunger: 15, health: 3 }
        },
        butter: {
            id: 'butter',
            name: 'Butter',
            description: 'Fresh churned butter.',
            icon: '🧈',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 10,
            consumable: true,
            effects: { hunger: 8 }
        },
        milk: {
            id: 'milk',
            name: 'Milk',
            description: 'Fresh cow milk.',
            icon: '🥛',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 7,
            consumable: true,
            effects: { hunger: 12, health: 4 }
        },
        eggs: {
            id: 'eggs',
            name: 'Eggs',
            description: 'Fresh chicken eggs.',
            icon: '🥚',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 6,
            consumable: true,
            effects: { hunger: 14, health: 5 }
        },
        soup: {
            id: 'soup',
            name: 'Soup',
            description: 'Hot vegetable soup.',
            icon: '🍲',
            category: 'consumables',
            rarity: 'common',
            weight: 1.5,
            basePrice: 9,
            consumable: true,
            effects: { hunger: 22, health: 8 }
        },
        stew: {
            id: 'stew',
            name: 'Stew',
            description: 'Hearty meat stew.',
            icon: '🍛',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 16,
            consumable: true,
            effects: { hunger: 30, health: 12 }
        },
        rum: {
            id: 'rum',
            name: 'Rum',
            description: 'Strong spirits from the coast.',
            icon: '🍾',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 22,
            consumable: true,
            effects: { happiness: 18, health: -2 }
        },
        cider: {
            id: 'cider',
            name: 'Cider',
            description: 'Apple cider from local orchards.',
            icon: '🍺',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 12,
            consumable: true,
            effects: { happiness: 12, hunger: 5 }
        },

        // === EXPANDED ITEMS - Crafting Materials ===
        leather: {
            id: 'leather',
            name: 'Leather',
            description: 'Tanned animal hide.',
            icon: '🦌',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 18
        },
        rope: {
            id: 'rope',
            name: 'Rope',
            description: 'Strong hemp rope.',
            icon: '🪢',
            category: 'basic_resources',
            rarity: 'common',
            weight: 3,
            basePrice: 8
        },
        canvas: {
            id: 'canvas',
            name: 'Canvas',
            description: 'Heavy cloth for tents and sails.',
            icon: '🏕️',
            category: 'basic_resources',
            rarity: 'common',
            weight: 4,
            basePrice: 12
        },
        glue: {
            id: 'glue',
            name: 'Glue',
            description: 'Adhesive made from bones.',
            icon: '🧪',
            category: 'basic_resources',
            rarity: 'common',
            weight: 0.5,
            basePrice: 6
        },
        wax: {
            id: 'wax',
            name: 'Wax',
            description: 'Beeswax for candles and sealing.',
            icon: '🕯️',
            category: 'basic_resources',
            rarity: 'common',
            weight: 1,
            basePrice: 10
        },
        dye: {
            id: 'dye',
            name: 'Dye',
            description: 'Colorful textile dye.',
            icon: '🎨',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 14
        },
        ink: {
            id: 'ink',
            name: 'Ink',
            description: 'Writing ink made from soot.',
            icon: '🖋️',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 0.3,
            basePrice: 16
        },
        parchment: {
            id: 'parchment',
            name: 'Parchment',
            description: 'Prepared animal skin for writing.',
            icon: '📜',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 0.2,
            basePrice: 20
        },
        salt: {
            id: 'salt',
            name: 'Salt',
            description: 'Precious salt for preserving food.',
            icon: '🧂',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 25
        },
        oil: {
            id: 'oil',
            name: 'Oil',
            description: 'Lamp oil for lighting.',
            icon: '🛢️',
            category: 'basic_resources',
            rarity: 'common',
            weight: 3,
            basePrice: 11
        },
        lamp: {
            id: 'lamp',
            name: 'Lamp',
            description: 'Oil lamp for illumination. Helpful in caves and dungeons.',
            icon: '🪔',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 18,
            // 🖤💀 EQUIPPABLE: Off-hand light source 💀
            equipSlot: 'offhand',
            equipType: 'lantern',
            stats: { perception: 2, dungeonBonus: 5 }
        },
        torch: {
            id: 'torch',
            name: 'Torch',
            description: 'Burning torch for light and fire. Essential for dark places.',
            icon: '🔦',
            category: 'tools',
            rarity: 'common',
            weight: 1,
            basePrice: 3,
            // 🖤💀 EQUIPPABLE: Off-hand light source 💀
            equipSlot: 'offhand',
            equipType: 'lantern',
            stats: { perception: 1, dungeonBonus: 3 }
        },
        compass: {
            id: 'compass',
            name: 'Compass',
            description: 'Navigation tool for travelers. Never get lost again.',
            icon: '🧭',
            category: 'tools',
            rarity: 'rare',
            weight: 0.3,
            basePrice: 75,
            // 🖤💀 EQUIPPABLE: Accessory for navigation 💀
            equipSlot: 'accessory1',
            equipType: 'trinket',
            stats: { navigation: 5, travelSpeed: 2 }
        },
        spyglass: {
            id: 'spyglass',
            name: 'Spyglass',
            description: 'Telescope for spotting distant things. See dangers before they see you.',
            icon: '🔭',
            category: 'tools',
            rarity: 'rare',
            weight: 2,
            basePrice: 90,
            // 🖤💀 EQUIPPABLE: Tool for scouting 💀
            equipSlot: 'tool',
            equipType: 'tool',
            stats: { perception: 5, scouting: 3 }
        },
        backpack: {
            id: 'backpack',
            name: 'Backpack',
            description: 'Sturdy pack for carrying goods. Increases carry capacity.',
            icon: '🎒',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 20,
            carryBonus: 10,
            // 🖤💀 EQUIPPABLE: Accessory for carrying 💀
            equipSlot: 'accessory2',
            equipType: 'accessory',
            stats: { carryCapacity: 10 }
        },

        // === EXPANDED ITEMS - Luxury & Rare ===
        perfume: {
            id: 'perfume',
            name: 'Perfume',
            description: 'Exotic fragrances from the east.',
            icon: '💐',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.2,
            basePrice: 85
        },
        mirror: {
            id: 'mirror',
            name: 'Mirror',
            description: 'Polished silver mirror.',
            icon: '🪞',
            category: 'luxury',
            rarity: 'rare',
            weight: 3,
            basePrice: 95
        },
        tapestry: {
            id: 'tapestry',
            name: 'Tapestry',
            description: 'Decorative woven wall hanging.',
            icon: '🖼️',
            category: 'luxury',
            rarity: 'rare',
            weight: 5,
            basePrice: 160
        },
        musical_instrument: {
            id: 'musical_instrument',
            name: 'Musical Instrument',
            description: 'Fine lute or flute for entertainment.',
            icon: '🎸',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 65
        },
        book: {
            id: 'book',
            name: 'Book',
            description: 'Rare illuminated manuscript.',
            icon: '📖',
            category: 'luxury',
            rarity: 'rare',
            weight: 2,
            basePrice: 120
        },
        religious_relic: {
            id: 'religious_relic',
            name: 'Religious Relic',
            description: 'Sacred artifact from the temple.',
            icon: '✝️',
            category: 'luxury',
            rarity: 'epic',
            weight: 1,
            basePrice: 280
        },
        crown: {
            id: 'crown',
            name: 'Crown',
            description: 'Ornate crown fit for nobility.',
            icon: '👑',
            category: 'luxury',
            rarity: 'legendary',
            weight: 2,
            basePrice: 1500,
            // 🖤💀 EQUIPPABLE: Head slot - royalty flex 💀
            equipSlot: 'head',
            equipType: 'crown',
            bonuses: { charisma: 15, reputation: 10, luck: 5 }
        },
        // 🖤 dragon_scale REMOVED - duplicate of line 592 in treasure section 💀
        phoenix_feather: {
            id: 'phoenix_feather',
            name: 'Phoenix Feather',
            description: 'Magical feather that never burns.',
            icon: '🪶',
            category: 'luxury',
            rarity: 'legendary',
            weight: 0.1,
            basePrice: 3000
        },

        // === CRAFTING MATERIALS ===
        planks: {
            id: 'planks',
            name: 'Planks',
            description: 'Processed wood planks ready for construction.',
            icon: '🪵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 4,
            basePrice: 16,
            craftable: true
        },
        // 🖤 Construction Materials - Planks → Building Items 💀
        crate: {
            id: 'crate',
            name: 'Wooden Crate',
            description: 'Sturdy wooden crate for storing and transporting goods.',
            icon: '📦',
            category: 'building_materials',
            rarity: 'common',
            weight: 8,
            basePrice: 35,
            craftable: true
        },
        barrel: {
            id: 'barrel',
            name: 'Barrel',
            description: 'Wooden barrel for storing liquids and dry goods.',
            icon: '🛢️',
            category: 'building_materials',
            rarity: 'common',
            weight: 12,
            basePrice: 45,
            craftable: true
        },
        wooden_beam: {
            id: 'wooden_beam',
            name: 'Wooden Beam',
            description: 'Strong wooden beam for structural support in buildings.',
            icon: '🪵',
            category: 'building_materials',
            rarity: 'common',
            weight: 10,
            basePrice: 25,
            craftable: true
        },
        scaffolding: {
            id: 'scaffolding',
            name: 'Scaffolding',
            description: 'Building scaffolding used for construction projects. Can be deconstructed for materials.',
            icon: '🏗️',
            category: 'building_materials',
            rarity: 'uncommon',
            weight: 25,
            basePrice: 120,
            craftable: true
        },
        flour: {
            id: 'flour',
            name: 'Flour',
            description: 'Ground wheat flour for baking.',
            icon: '🌾',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 8,
            craftable: true
        },
        wheat: {
            id: 'wheat',
            name: 'Wheat',
            description: 'Raw wheat grain from farms.',
            icon: '🌾',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 5,
            gatherable: true,
            gatherMethod: 'farming'
        },
        gold_ore: {
            id: 'gold_ore',
            name: 'Gold Ore',
            description: 'Precious gold ore that can be refined into coins.',
            icon: '✨',
            category: 'raw_ores',
            rarity: 'rare',
            weight: 20,
            basePrice: 60,
            gatherable: true,
            gatherMethod: 'mining'
        },
        hide: {
            id: 'hide',
            name: 'Animal Hide',
            description: 'Raw animal hide for tanning.',
            icon: '🦌',
            category: 'basic_resources',
            rarity: 'common',
            weight: 3,
            basePrice: 10,
            gatherable: true,
            gatherMethod: 'hunting'
        },
        flax: {
            id: 'flax',
            name: 'Flax',
            description: 'Flax plant for making linen.',
            icon: '🌾',
            category: 'basic_resources',
            rarity: 'common',
            weight: 1,
            basePrice: 4,
            gatherable: true,
            gatherMethod: 'farming'
        },
        thread: {
            id: 'thread',
            name: 'Thread',
            description: 'Spun thread for sewing.',
            icon: '🧵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 0.1,
            basePrice: 3,
            craftable: true
        },
        linen: {
            id: 'linen',
            name: 'Linen',
            description: 'Woven linen cloth.',
            icon: '🧵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 1.5,
            basePrice: 15,
            craftable: true
        },
        wool_cloth: {
            id: 'wool_cloth',
            name: 'Wool Cloth',
            description: 'Warm wool fabric.',
            icon: '🧶',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 18,
            craftable: true
        },
        cloth: {
            id: 'cloth',
            name: 'Cloth',
            description: 'General purpose fabric.',
            icon: '🧵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 1,
            basePrice: 12,
            craftable: true
        },

        // === WEAPONS (Crafted) ===
        iron_sword: {
            id: 'iron_sword',
            name: 'Iron Sword',
            description: 'Well-forged iron blade.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 5,
            basePrice: 85,
            damage: 30,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Weapon slot 💀
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 10, damage: 30 }
        },
        steel_sword: {
            id: 'steel_sword',
            name: 'Steel Sword',
            description: 'High-quality steel blade.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'rare',
            weight: 5,
            basePrice: 180,
            damage: 50,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Weapon slot 💀
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 18, damage: 50, speed: 1 }
        },

        // === LEGENDARY WEAPONS (Achievement Rewards) ===
        blade_of_the_hacker: {
            id: 'blade_of_the_hacker',
            name: '💻 Blade of the Hacker',
            description: 'A legendary digital blade that glitches reality itself. Awarded for completing ALL achievements. +100 Attack, +100 Damage, +50 to all stats. Unstoppable.',
            icon: '🗡️',
            category: 'weapons',
            rarity: 'legendary',
            weight: 0,  // Weightless - it exists outside physics
            basePrice: 999999,  // Priceless - cannot be sold
            damage: 100,
            equipSlot: 'weapon',
            equipType: 'weapon',
            special: true,  // Cannot be dropped/sold
            unique: true,   // Only one can exist
            bonuses: {
                attack: 100,
                damage: 100,
                defense: 50,
                luck: 50,
                gathering: 50,
                crafting: 50,
                speed: 25,
                strength: 25
            },
            lore: 'Forged in the fires of a thousand debooger sessions 💀, this blade cuts through code and flesh alike. Only those who have proven themselves worthy by mastering every challenge may wield it.',
            visualEffect: 'glitch'  // Special visual effect when equipped
        },

        // === ARMOR (Crafted) ===
        iron_armor: {
            id: 'iron_armor',
            name: 'Iron Armor',
            description: 'Solid iron plate armor. Heavy but protective.',
            icon: '🛡️',
            category: 'armor',
            rarity: 'uncommon',
            weight: 25,
            basePrice: 200,
            defense: 40,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot 💀
            equipSlot: 'body',
            equipType: 'armor',
            bonuses: { defense: 40, endurance: 3, speed: -1 }
        },

        // === CLOTHING ===
        simple_clothes: {
            id: 'simple_clothes',
            name: 'Simple Clothes',
            description: 'Basic linen clothing.',
            icon: '👕',
            category: 'armor',  // 🖤 Changed to armor for equipment system 💀
            rarity: 'common',
            weight: 2,
            basePrice: 25,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot - basic clothing 💀
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { charisma: 1 }
        },
        fine_clothes: {
            id: 'fine_clothes',
            name: 'Fine Clothes',
            description: 'Elegant silk garments.',
            icon: '👗',
            category: 'armor',  // 🖤 Changed to armor for equipment system 💀
            rarity: 'rare',
            weight: 2,
            basePrice: 120,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot - fancy clothing 💀
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { charisma: 8, reputation: 5, tradingDiscount: 3 }
        },
        silk_garments: {
            id: 'silk_garments',
            name: 'Silk Garments',
            description: 'Luxurious silk clothing.',
            icon: '🥻',
            category: 'armor',  // 🖤 Changed to armor for equipment system 💀
            rarity: 'rare',
            weight: 1,
            basePrice: 150,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot - luxury clothing 💀
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { charisma: 10, reputation: 8, luck: 2 }
        },

        // === FOOD (Crafted) ===
        pie: {
            id: 'pie',
            name: 'Pie',
            description: 'Delicious fruit pie.',
            icon: '🥧',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 1.5,
            basePrice: 22,
            consumable: true,
            effects: {
                hunger: 35,
                health: 10,
                happiness: 15
            },
            craftable: true
        },

        // === TOOLS (Crafted) ===
        iron_tools: {
            id: 'iron_tools',
            name: 'Iron Tools',
            description: 'Sturdy iron tools for various tasks.',
            icon: '🔧',
            category: 'tools',
            rarity: 'uncommon',
            weight: 6,
            basePrice: 55,
            craftable: true,
            durability: 200,
            // 🖤💀 EQUIPPABLE: Tool slot 💀
            equipSlot: 'tool',
            equipType: 'tool',
            bonuses: { crafting: 3, gathering: 2 }
        },
        scythe: {
            id: 'scythe',
            name: 'Scythe',
            description: 'Farming tool for harvesting grain. Essential for farmers.',
            icon: '🔪',
            category: 'tools',
            rarity: 'common',
            weight: 5,
            basePrice: 30,
            toolType: 'farming',
            craftable: true,
            durability: 150,
            // 🖤💀 EQUIPPABLE: Tool slot 💀
            equipSlot: 'tool',
            bonuses: { gathering: 3, farming: 5 }
        },
        fishing_rod: {
            id: 'fishing_rod',
            name: 'Fishing Rod',
            description: 'Tool for catching fish. A patient angler never goes hungry.',
            icon: '🎣',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 25,
            toolType: 'fishing',
            craftable: true,
            durability: 100,
            // 🖤💀 EQUIPPABLE: Tool slot 💀
            equipSlot: 'tool',
            bonuses: { gathering: 2, fishing: 5 }
        },
        steel_pickaxe: {
            id: 'steel_pickaxe',
            name: 'Steel Pickaxe',
            description: 'High-quality mining tool. Mines ore faster and lasts longer.',
            icon: '⛏️',
            category: 'tools',
            rarity: 'rare',
            weight: 7,
            basePrice: 85,
            toolType: 'mining',
            craftable: true,
            durability: 250,
            // 🖤💀 EQUIPPABLE: Tool slot - better than regular pickaxe 💀
            equipSlot: 'tool',
            bonuses: { gathering: 4, mining: 8 }
        },
        simple_tools: {
            id: 'simple_tools',
            name: 'Simple Tools',
            description: 'Basic wooden and stone tools.',
            icon: '🔨',
            category: 'tools',
            rarity: 'common',
            weight: 4,
            basePrice: 12,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Tool slot - basic starter tools 💀
            equipSlot: 'tool',
            equipType: 'tool',
            bonuses: { crafting: 1, gathering: 1 }
        },

        // === MATERIALS (Processed) ===
        copper_bar: {
            id: 'copper_bar',
            name: 'Copper Bar',
            description: 'Smelted copper ingot.',
            icon: '🟤',
            category: 'basic_resources',
            rarity: 'common',
            weight: 6,
            basePrice: 28,
            craftable: true
        },
        gold_bar: {
            id: 'gold_bar',
            name: 'Gold Bar',
            description: 'Refined gold ingot.',
            icon: '🟡',
            category: 'raw_ores',
            rarity: 'rare',
            weight: 10,
            basePrice: 150,
            craftable: true
        },
        iron_nails: {
            id: 'iron_nails',
            name: 'Iron Nails',
            description: 'Small iron nails for construction.',
            icon: '📌',
            category: 'basic_resources',
            rarity: 'common',
            weight: 0.5,
            basePrice: 8,
            craftable: true
        },
        gemstone: {
            id: 'gemstone',
            name: 'Gemstone',
            description: 'Cut and polished gemstone.',
            icon: '💎',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 100,
            gatherable: true,
            gatherMethod: 'mining'
        },

        // === COMPLEX ITEMS ===
        furniture: {
            id: 'furniture',
            name: 'Furniture',
            description: 'Well-crafted wooden furniture.',
            icon: '🪑',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 30,
            basePrice: 180,
            craftable: true
        },

        // === RAW RESOURCES (Additional) ===
        burlap_sack: {
            id: 'burlap_sack',
            name: 'Burlap Sack',
            description: 'Rough fabric sack for storage.',
            icon: '🛍️',
            category: 'basic_resources',
            rarity: 'common',
            weight: 0.5,
            basePrice: 5,
            craftable: true
        },
        military_rations: {
            id: 'military_rations',
            name: 'Military Rations',
            description: 'Preserved food for soldiers.',
            icon: '🥫',
            category: 'consumables',
            rarity: 'common',
            weight: 1,
            basePrice: 15,
            consumable: true,
            effects: {
                hunger: 30,
                health: 8
            },
            craftable: true
        },
        bandages: {
            id: 'bandages',
            name: 'Bandages',
            description: 'Medical bandages for treating wounds.',
            icon: '🩹',
            category: 'consumables',
            rarity: 'common',
            weight: 0.2,
            basePrice: 8,
            consumable: true,
            effects: {
                health: 20
            },
            craftable: true
        },
        various_coins: {
            id: 'various_coins',
            name: 'Various Coins',
            description: 'Mix of different currency coins.',
            icon: '🪙',
            category: 'currency',
            rarity: 'common',
            weight: 0.5,
            basePrice: 20
        },
        trade_contract: {
            id: 'trade_contract',
            name: 'Trade Contract',
            description: 'Legal contract for trade agreements.',
            icon: '📜',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0.1,
            basePrice: 50,
            craftable: true
        },
        merchant_ledger: {
            id: 'merchant_ledger',
            name: 'Merchant Ledger',
            description: 'Accounting book for tracking trades.',
            icon: '📒',
            category: 'tools',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 35,
            craftable: true
        },
        scales: {
            id: 'scales',
            name: 'Scales',
            description: 'Balance scales for measuring goods.',
            icon: '⚖️',
            category: 'tools',
            rarity: 'common',
            weight: 3,
            basePrice: 28,
            craftable: true
        },
        lute: {
            id: 'lute',
            name: 'Lute',
            description: 'Stringed musical instrument.',
            icon: '🎻',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 75,
            craftable: true
        },
        colorful_clothes: {
            id: 'colorful_clothes',
            name: 'Colorful Clothes',
            description: 'Bright, eye-catching garments.',
            icon: '👘',
            category: 'armor',  // 🖤 Changed to armor for equipment system 💀
            rarity: 'uncommon',
            weight: 2,
            basePrice: 45,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot - flashy clothing 💀
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { charisma: 5, happiness: 3, luck: 1 }
        },
        tale_scrolls: {
            id: 'tale_scrolls',
            name: 'Tale Scrolls',
            description: 'Written stories and legends.',
            icon: '📜',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0.3,
            basePrice: 20,
            craftable: true
        },
        old_books: {
            id: 'old_books',
            name: 'Old Books',
            description: 'Ancient tomes of knowledge.',
            icon: '📚',
            category: 'luxury',
            rarity: 'rare',
            weight: 2,
            basePrice: 100,
            craftable: true
        },
        walking_staff: {
            id: 'walking_staff',
            name: 'Walking Staff',
            description: 'Sturdy wooden staff for travel. Helps with balance and can ward off wild animals.',
            icon: '🦯',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 15,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Can be equipped in tool slot for travel bonuses 💀
            equipType: 'staff',
            equipSlot: 'tool',
            stats: {
                speed: 1,        // 🦇 Slightly faster travel
                defense: 1,      // 🖤 Can fend off weak attackers
                stamina: 5       // 💀 Helps with long journeys
            }
        },
        wisdom_scrolls: {
            id: 'wisdom_scrolls',
            name: 'Wisdom Scrolls',
            description: 'Scrolls containing ancient wisdom.',
            icon: '📜',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.2,
            basePrice: 80,
            craftable: true
        },
        holy_symbol: {
            id: 'holy_symbol',
            name: 'Holy Symbol',
            description: 'Sacred religious icon.',
            icon: '✝️',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 50,
            craftable: true
        },
        prayer_beads: {
            id: 'prayer_beads',
            name: 'Prayer Beads',
            description: 'Beads for meditation and prayer.',
            icon: '📿',
            category: 'luxury',
            rarity: 'common',
            weight: 0.2,
            basePrice: 20,
            craftable: true
        },
        incense: {
            id: 'incense',
            name: 'Incense',
            description: 'Fragrant incense for rituals.',
            icon: '🪔',
            category: 'consumables',
            rarity: 'common',
            weight: 0.1,
            basePrice: 12,
            consumable: true,
            effects: {
                happiness: 10
            },
            craftable: true
        },
        holy_water: {
            id: 'holy_water',
            name: 'Holy Water',
            description: 'Blessed water from the temple.',
            icon: '💧',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 25,
            consumable: true,
            effects: {
                health: 15,
                happiness: 5
            },
            craftable: true
        },
        religious_texts: {
            id: 'religious_texts',
            name: 'Religious Texts',
            description: 'Sacred religious writings.',
            icon: '📖',
            category: 'luxury',
            rarity: 'rare',
            weight: 2,
            basePrice: 90,
            craftable: true
        },
        war_horse_deed: {
            id: 'war_horse_deed',
            name: 'War Horse Deed',
            description: 'Ownership papers for a war horse.',
            icon: '🐴',
            category: 'luxury',
            rarity: 'rare',
            weight: 0.1,
            basePrice: 500
        },
        noble_cloak: {
            id: 'noble_cloak',
            name: 'Noble Cloak',
            description: 'Fine cloak befitting nobility. Impresses merchants and nobles alike.',
            icon: '🧥',
            category: 'armor',
            rarity: 'rare',
            weight: 3,
            basePrice: 120,
            craftable: true,
            // 🖤💀 EQUIPPABLE: Body slot - charisma boost 💀
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { charisma: 5, reputation: 3, defense: 3 }
        },

        // === 💀 DOOM WORLD SPECIFIC ITEMS 💀 ===
        // 🖤 Corrupted food - survival items from the apocalypse 💀
        tainted_bread: {
            id: 'tainted_bread',
            name: 'Tainted Bread',
            description: "Moldy bread from the doom world. It'll keep you alive... barely.",
            icon: '🍞',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 30,  // 🖤 10x normal bread price in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                hunger: 10,
                health: -2  // 🖤 Slightly poisonous 💀
            }
        },
        void_water: {
            id: 'void_water',
            name: 'Void Water',
            description: 'Dark, murky water from corrupted wells. Desperate times call for desperate measures.',
            icon: '💧',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 30,  // 🖤 15x normal water price in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                thirst: 20,
                health: -1
            }
        },
        shadow_rations: {
            id: 'shadow_rations',
            name: 'Shadow Rations',
            description: 'Preserved food from before the darkness. Old, but edible.',
            icon: '🥫',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 150,  // 🖤 10x military rations in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                hunger: 25,
                health: 5
            }
        },
        corrupted_meat: {
            id: 'corrupted_meat',
            name: 'Corrupted Meat',
            description: 'Meat from a beast touched by darkness. Cook it well... or don\'t.',
            icon: '🥩',
            category: 'consumables',
            rarity: 'common',
            weight: 2,
            basePrice: 120,  // 🖤 10x normal meat in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                hunger: 20,
                health: -5
            }
        },

        // 🖤 Dark potions - medicine in the apocalypse 💀
        void_essence_potion: {
            id: 'void_essence_potion',
            name: 'Void Essence',
            description: 'A bubbling black liquid that radiates cold. Alchemists claim it can heal... or kill.',
            icon: '🧪',
            category: 'consumables',
            rarity: 'rare',
            weight: 0.5,
            basePrice: 300,  // 🖤 12x medicine price in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                health: 40,
                happiness: -10  // 🖤 Tastes like death 💀
            }
        },
        shadow_elixir: {
            id: 'shadow_elixir',
            name: 'Shadow Elixir',
            description: 'A shimmering dark potion that pulses with unnatural life. Desperate healers brew these.',
            icon: '⚗️',
            category: 'consumables',
            rarity: 'epic',
            weight: 0.3,
            basePrice: 600,  // 🖤 Premium doom medicine 💀
            consumable: true,
            doomOnly: true,
            effects: {
                health: 60,
                stamina: 20,
                hunger: 10
            }
        },
        corruption_cure: {
            id: 'corruption_cure',
            name: 'Corruption Cure',
            description: 'A rare antidote that cleanses the body of shadow poison. Worth its weight in gold... literally.',
            icon: '💊',
            category: 'consumables',
            rarity: 'legendary',
            weight: 0.2,
            basePrice: 1000,
            consumable: true,
            doomOnly: true,
            effects: {
                health: 80,
                happiness: 20,
                thirst: 15,
                hunger: 15
            }
        },

        // 🖤 Cursed weapons - doom world arsenal 💀
        shadow_blade: {
            id: 'shadow_blade',
            name: 'Shadow Blade',
            description: 'A sword forged in darkness. It whispers to you when held.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'rare',
            weight: 4,
            basePrice: 180,  // 🖤 3x weapon price in doom 💀
            damage: 45,
            equipSlot: 'weapon',
            equipType: 'weapon',
            doomOnly: true,
            bonuses: { attack: 15, damage: 45, dark_damage: 10 }
        },
        void_dagger: {
            id: 'void_dagger',
            name: 'Void Dagger',
            description: 'A blade that seems to absorb light itself. Silent and deadly.',
            icon: '🗡️',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 90,
            damage: 35,
            equipSlot: 'weapon',
            equipType: 'weapon',
            doomOnly: true,
            bonuses: { attack: 12, damage: 35, speed: 5, stealth: 10 }
        },
        cursed_axe: {
            id: 'cursed_axe',
            name: 'Cursed Axe',
            description: 'A massive axe dripping with malevolent energy. Heavy with the weight of countless souls.',
            icon: '🪓',
            category: 'weapons',
            rarity: 'epic',
            weight: 10,
            basePrice: 330,
            damage: 60,
            equipSlot: 'weapon',
            equipType: 'weapon',
            doomOnly: true,
            bonuses: { attack: 20, damage: 60, strength: 8, life_drain: 5 }
        },

        // 🖤 Shadow materials - crafting in the darkness 💀
        void_crystal: {
            id: 'void_crystal',
            name: 'Void Crystal',
            description: 'A crystallized shard of pure darkness. It hums with otherworldly power.',
            icon: '🔮',
            category: 'basic_resources',
            rarity: 'rare',
            weight: 0.3,
            basePrice: 200,
            doomOnly: true,
            craftable: true
        },
        shadow_cloth: {
            id: 'shadow_cloth',
            name: 'Shadow Cloth',
            description: 'Fabric woven from the threads of night itself. Light cannot touch it.',
            icon: '🧵',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 80,
            doomOnly: true,
            craftable: true
        },
        dark_iron: {
            id: 'dark_iron',
            name: 'Dark Iron',
            description: 'Iron ore corrupted by the doom. Stronger than steel, but at what cost?',
            icon: '⚫',
            category: 'raw_ores',
            rarity: 'rare',
            weight: 15,
            basePrice: 120,
            doomOnly: true,
            craftable: true
        },
        blighted_wood: {
            id: 'blighted_wood',
            name: 'Blighted Wood',
            description: 'Timber from corrupted forests. It never rots, but it never truly lives either.',
            icon: '🪵',
            category: 'basic_resources',
            rarity: 'common',
            weight: 6,
            basePrice: 40,
            doomOnly: true
        },
        cursed_leather: {
            id: 'cursed_leather',
            name: 'Cursed Leather',
            description: 'Hide from doom-touched beasts. Unnaturally durable and unsettlingly cold.',
            icon: '🦌',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 90,
            doomOnly: true,
            craftable: true
        },

        // 🖤 Doom-specific consumables - survival necessities 💀
        shadow_torch: {
            id: 'shadow_torch',
            name: 'Shadow Torch',
            description: 'A torch that burns with black flame. It provides light, but the wrong kind.',
            icon: '🔦',
            category: 'tools',
            rarity: 'common',
            weight: 1,
            basePrice: 15,
            doomOnly: true,
            // 🖤💀 EQUIPPABLE: Off-hand doom light source 💀
            equipSlot: 'offhand',
            equipType: 'lantern',
            stats: { perception: 2, dungeonBonus: 5, dark_resistance: 3 }
        },
        void_salt: {
            id: 'void_salt',
            name: 'Void Salt',
            description: 'Black salt harvested from the dead seas. Preserves food... and sanity.',
            icon: '🧂',
            category: 'basic_resources',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 100,  // 🖤 4x normal salt in doom 💀
            doomOnly: true
        },
        corrupted_herbs: {
            id: 'corrupted_herbs',
            name: 'Corrupted Herbs',
            description: 'Plants twisted by darkness. Still medicinal, but their effects are... unpredictable.',
            icon: '🌿',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 96,  // 🖤 12x medicine price in doom 💀
            consumable: true,
            doomOnly: true,
            effects: {
                health: 15,
                hunger: -5
            }
        },

        // === QUEST ITEMS - Required for storyline ===
        potion: {
            id: 'potion',
            name: 'Potion',
            description: 'A mysterious healing elixir brewed by alchemists.',
            icon: '🧪',
            category: 'consumables',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 25,
            consumable: true,
            effects: {
                health: 35,
                hunger: 5
            }
        },
        grapes: {
            id: 'grapes',
            name: 'Grapes',
            description: 'Sweet, sun-ripened grapes from the vineyard.',
            icon: '🍇',
            category: 'consumables',
            rarity: 'common',
            weight: 0.5,
            basePrice: 8,
            consumable: true,
            effects: {
                hunger: 8,
                health: 3,
                happiness: 5
            }
        },
        warm_cloak: {
            id: 'warm_cloak',
            name: 'Warm Cloak',
            description: 'A thick fur-lined cloak that protects against the harshest winter winds.',
            icon: '🧥',
            category: 'armor',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 75,
            equipSlot: 'body',
            equipType: 'clothing',
            bonuses: { defense: 5, endurance: 8, cold_resistance: 20 }
        },
        ice_blade: {
            id: 'ice_blade',
            name: 'Ice Blade',
            description: 'A legendary blade forged from eternal ice. It never melts and chills all it touches.',
            icon: '🗡️',
            category: 'weapons',
            rarity: 'epic',
            weight: 4,
            basePrice: 500,
            damage: 55,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 18, damage: 55, cold_damage: 15, speed: 3 },
            lore: 'Forged in the frozen heart of Frostholm by the legendary Frost Lord himself.'
        },
        dragonbone_blade: {
            id: 'dragonbone_blade',
            name: 'Dragonbone Blade',
            description: 'A massive blade carved from the bones of an ancient dragon. Radiates primal power.',
            icon: '⚔️',
            category: 'weapons',
            rarity: 'legendary',
            weight: 8,
            basePrice: 2000,
            damage: 85,
            equipSlot: 'weapon',
            equipType: 'weapon',
            bonuses: { attack: 30, damage: 85, fire_damage: 25, strength: 10, intimidation: 15 },
            lore: 'Only the mightiest warriors who have slain a dragon may wield this terrible weapon.',
            special: true,
            unique: true
        }
    },

    // Initialize item database
    init() {
        // Initialize any dynamic items or modifications
        console.log('Item Database initialized');
    },

    // Get item by ID
    getItem(itemId) {
        return this.items[itemId] || null;
    },

    // Calculate item price with modifiers
    calculatePrice(itemId, modifiers = {}) {
        const item = this.getItem(itemId);
        if (!item) return 0;

        let price = item.basePrice || 0;

        // 🖤💀 DOOM WORLD ECONOMY 💀🖤
        // When in doom world, apply apocalyptic price modifiers
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);

        if (inDoom && typeof DoomWorldNPCs !== 'undefined') {
            // Check for exact item match in doom economy
            let doomModifier = DoomWorldNPCs.economyModifiers[itemId];

            // If no exact match, check by category/type
            if (!doomModifier && item.category) {
                doomModifier = DoomWorldNPCs.economyModifiers[item.category];
            }

            // Check item type as fallback
            if (!doomModifier && item.type) {
                doomModifier = DoomWorldNPCs.economyModifiers[item.type];
            }

            // Apply doom modifier (defaults to 1.0 if no match - neutral)
            if (doomModifier) {
                price *= doomModifier;
            }
        }

        // Apply location multiplier
        if (modifiers.locationMultiplier) {
            price *= modifiers.locationMultiplier;
        }

        // Apply quality multiplier
        if (modifiers.qualityMultiplier) {
            price *= modifiers.qualityMultiplier;
        }

        // Apply rarity modifier
        if (modifiers.rarityMultiplier) {
            price *= modifiers.rarityMultiplier;
        }

        // Apply random fluctuation
        if (modifiers.fluctuation) {
            price *= (1 + (Math.random() - 0.5) * modifiers.fluctuation);
        }

        return Math.round(price);
    },

    // Calculate item weight
    calculateWeight(itemId, quantity = 1) {
        const item = this.getItem(itemId);
        if (!item) return 0;

        return (item.weight || 0) * quantity;
    },

    // Get all items by category
    getItemsByCategory(category) {
        const items = [];
        for (const [id, item] of Object.entries(this.items)) {
            if (item.category === category) {
                items.push({ id, ...item });
            }
        }
        return items;
    },

    // Get all items by rarity
    getItemsByRarity(rarity) {
        const items = [];
        for (const [id, item] of Object.entries(this.items)) {
            if (item.rarity === rarity) {
                items.push({ id, ...item });
            }
        }
        return items;
    },

    // Format item name for display
    formatItemName(itemId) {
        const item = this.getItem(itemId);
        return item ? item.name : itemId;
    },

    // Get item icon
    getItemIcon(itemId) {
        const item = this.getItem(itemId);
        return item ? item.icon : '📦';
    },

    // Check if item is consumable
    isConsumable(itemId) {
        const item = this.getItem(itemId);
        return item ? item.consumable || false : false;
    },

    // Check if item is a tool
    isTool(itemId) {
        const item = this.getItem(itemId);
        return item ? item.toolType ? true : false : false;
    },

    // Check if item is a weapon
    isWeapon(itemId) {
        const item = this.getItem(itemId);
        return item ? item.damage ? true : false : false;
    },

    // Get item effects
    getItemEffects(itemId) {
        const item = this.getItem(itemId);
        return item ? item.effects || {} : {};
    },

    // Get rarity info object from rarity string key
    getRarityInfo(rarityKey) {
        if (!rarityKey) return this.rarity.common;
        return this.rarity[rarityKey] || this.rarity[rarityKey.toLowerCase()] || this.rarity.common;
    },

    // Get rarity color for an item
    getItemRarityColor(itemId) {
        const item = this.getItem(itemId);
        if (!item || !item.rarity) return '#888888';
        const rarityInfo = this.getRarityInfo(item.rarity);
        return rarityInfo ? rarityInfo.color : '#888888';
    },

    // Generate random item for loot/rewards
    generateRandomItem(rarity = null, category = null) {
        let possibleItems = Object.values(this.items);

        // Filter by category if specified
        if (category) {
            possibleItems = possibleItems.filter(item => item.category === category);
        }

        // Filter by rarity if specified
        if (rarity) {
            possibleItems = possibleItems.filter(item => item.rarity === rarity);
        }

        // Weight towards common items
        const weightedItems = possibleItems.map(item => {
            let weight = 1;
            if (item.rarity === 'common') weight = 10;
            else if (item.rarity === 'uncommon') weight = 5;
            else if (item.rarity === 'rare') weight = 2;
            else if (item.rarity === 'epic') weight = 1;
            else if (item.rarity === 'legendary') weight = 0.1;
            
            return { item, weight };
        });

        // Select random item based on weights
        const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const { item, weight } of weightedItems) {
            random -= weight;
            if (random <= 0) {
                return item.id;
            }
        }

        return possibleItems[0].id; // Fallback
    }
};

// Expose ItemDatabase globally
window.ItemDatabase = ItemDatabase;
console.log('✅ ItemDatabase exposed globally!', typeof window.ItemDatabase);

// Initialize item database when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ItemDatabase.init();
    });
} else {
    // DOM already loaded, init immediately
    ItemDatabase.init();
}