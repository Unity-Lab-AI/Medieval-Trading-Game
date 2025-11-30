// ═══════════════════════════════════════════════════════════════
// 📚 ITEM DATABASE - the sacred tome of all tradeable things
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// every item that exists in this cruel medieval economy lives here
// (spoiler: most of them are overpriced)

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
        ARMOR: 'armor'
    },

    // ✨ Rarity levels - how special is your junk?
    rarity: {
        common: { name: 'Common', color: '#888888' },
        uncommon: { name: 'Uncommon', color: '#00ff00' },
        rare: { name: 'Rare', color: '#0080ff' },
        epic: { name: 'Epic', color: '#800080' },
        legendary: { name: 'Legendary', color: '#ff8000' },
        // Uppercase aliases for backward compatibility
        COMMON: { name: 'Common', color: '#888888' },
        UNCOMMON: { name: 'Uncommon', color: '#00ff00' },
        RARE: { name: 'Rare', color: '#0080ff' },
        EPIC: { name: 'Epic', color: '#800080' },
        LEGENDARY: { name: 'Legendary', color: '#ff8000' }
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
            basePrice: 60
        },
        armor: {
            id: 'armor',
            name: 'Armor',
            description: 'Protective equipment.',
            icon: '🛡️',
            category: 'weapons',
            rarity: 'uncommon',
            weight: 15,
            basePrice: 80
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
            description: 'Warm clothing for cold climates.',
            icon: '🧥',
            category: 'luxury',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 60
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
            basePrice: 60,
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
            description: 'Oil lamp for illumination.',
            icon: '🪔',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 18
        },
        torch: {
            id: 'torch',
            name: 'Torch',
            description: 'Burning torch for light and fire.',
            icon: '🔦',
            category: 'tools',
            rarity: 'common',
            weight: 1,
            basePrice: 3
        },
        compass: {
            id: 'compass',
            name: 'Compass',
            description: 'Navigation tool for travelers.',
            icon: '🧭',
            category: 'tools',
            rarity: 'rare',
            weight: 0.3,
            basePrice: 75
        },
        spyglass: {
            id: 'spyglass',
            name: 'Spyglass',
            description: 'Telescope for spotting distant things.',
            icon: '🔭',
            category: 'tools',
            rarity: 'rare',
            weight: 2,
            basePrice: 90
        },
        backpack: {
            id: 'backpack',
            name: 'Backpack',
            description: 'Sturdy pack for carrying goods.',
            icon: '🎒',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 20,
            carryBonus: 10
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
            basePrice: 1500
        },
        dragon_scale: {
            id: 'dragon_scale',
            name: 'Dragon Scale',
            description: 'Legendary scale from an ancient dragon.',
            icon: '🐉',
            category: 'luxury',
            rarity: 'legendary',
            weight: 1,
            basePrice: 2500
        },
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
            craftable: true
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
            craftable: true
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
            description: 'Solid iron plate armor.',
            icon: '🛡️',
            category: 'armor',
            rarity: 'uncommon',
            weight: 25,
            basePrice: 200,
            defense: 40,
            craftable: true
        },

        // === CLOTHING ===
        simple_clothes: {
            id: 'simple_clothes',
            name: 'Simple Clothes',
            description: 'Basic linen clothing.',
            icon: '👕',
            category: 'basic_resources',
            rarity: 'common',
            weight: 2,
            basePrice: 25,
            craftable: true
        },
        fine_clothes: {
            id: 'fine_clothes',
            name: 'Fine Clothes',
            description: 'Elegant silk garments.',
            icon: '👗',
            category: 'luxury',
            rarity: 'rare',
            weight: 2,
            basePrice: 120,
            craftable: true
        },
        silk_garments: {
            id: 'silk_garments',
            name: 'Silk Garments',
            description: 'Luxurious silk clothing.',
            icon: '🥻',
            category: 'luxury',
            rarity: 'rare',
            weight: 1,
            basePrice: 150,
            craftable: true
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
            durability: 200
        },
        scythe: {
            id: 'scythe',
            name: 'Scythe',
            description: 'Farming tool for harvesting grain.',
            icon: '🔪',
            category: 'tools',
            rarity: 'common',
            weight: 5,
            basePrice: 30,
            toolType: 'farming',
            craftable: true,
            durability: 150
        },
        fishing_rod: {
            id: 'fishing_rod',
            name: 'Fishing Rod',
            description: 'Tool for catching fish.',
            icon: '🎣',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 25,
            toolType: 'fishing',
            craftable: true,
            durability: 100
        },
        steel_pickaxe: {
            id: 'steel_pickaxe',
            name: 'Steel Pickaxe',
            description: 'High-quality mining tool.',
            icon: '⛏️',
            category: 'tools',
            rarity: 'rare',
            weight: 7,
            basePrice: 85,
            toolType: 'mining',
            craftable: true,
            durability: 250
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
            craftable: true
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
            category: 'luxury',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 45,
            craftable: true
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
            description: 'Sturdy wooden staff for travel.',
            icon: '🦯',
            category: 'tools',
            rarity: 'common',
            weight: 2,
            basePrice: 15,
            craftable: true
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
            description: 'Fine cloak befitting nobility.',
            icon: '🧥',
            category: 'luxury',
            rarity: 'rare',
            weight: 3,
            basePrice: 120,
            craftable: true
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