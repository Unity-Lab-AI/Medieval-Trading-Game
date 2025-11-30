// ═══════════════════════════════════════════════════════════════
// 📦 UNIFIED ITEM SYSTEM - the master item database and handler
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// consolidates all item definitions, crafting, gathering, equipment
// into one unified circular economy of despair and profit

console.log('📦 Unified Item System initializing...');

const UnifiedItemSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 🏷️ ENUMS & CONSTANTS
    // ═══════════════════════════════════════════════════════════════

    // Item categories
    CATEGORY: {
        CURRENCY: 'currency',
        CONSUMABLE: 'consumable',
        RESOURCE: 'resource',
        ORE: 'ore',
        BAR: 'bar',
        TOOL: 'tool',
        WEAPON: 'weapon',
        ARMOR: 'armor',
        ACCESSORY: 'accessory',
        MATERIAL: 'material',
        FOOD: 'food',
        DRINK: 'drink',
        MEDICINE: 'medicine',
        LUXURY: 'luxury',
        DOCUMENT: 'document'
    },

    // Equipment slots
    EQUIP_SLOT: {
        WEAPON: 'weapon',
        OFF_HAND: 'offHand',      // Shield or second weapon
        HEAD: 'head',
        BODY: 'body',
        HANDS: 'hands',
        FEET: 'feet',
        ACCESSORY: 'accessory',
        TOOL: 'tool'             // Active gathering tool
    },

    // Action types for items
    ACTION_TYPE: {
        NONE: 'none',
        USE: 'use',              // Consumables
        EQUIP: 'equip',          // Equipment
        READ: 'read',            // Books/scrolls
        PLANT: 'plant',          // Seeds
        CRAFT: 'craft',          // Crafting materials
        GATHER: 'gather'         // Gathering tools
    },

    // Gathering action types
    GATHER_TYPE: {
        MINING: 'mining',
        WOODCUTTING: 'woodcutting',
        FARMING: 'farming',
        FISHING: 'fishing',
        HERBALISM: 'herbalism',
        HUNTING: 'hunting'
    },

    // Facilities for crafting
    FACILITY: {
        NONE: 'none',
        CAMPFIRE: 'campfire',
        KITCHEN: 'kitchen',
        FORGE: 'forge',
        SMELTER: 'smelter',
        SAWMILL: 'sawmill',
        WORKSHOP: 'workshop',
        TANNERY: 'tannery',
        LOOM: 'loom',
        BREWERY: 'brewery',
        ALCHEMY_TABLE: 'alchemy_table',
        MINT: 'mint',
        ARMORY: 'armory'
    },

    // Rarity tiers with multipliers
    RARITY: {
        COMMON: { name: 'Common', color: '#9e9e9e', priceMultiplier: 1.0, dropWeight: 100 },
        UNCOMMON: { name: 'Uncommon', color: '#4caf50', priceMultiplier: 1.5, dropWeight: 50 },
        RARE: { name: 'Rare', color: '#2196f3', priceMultiplier: 2.5, dropWeight: 20 },
        EPIC: { name: 'Epic', color: '#9c27b0', priceMultiplier: 5.0, dropWeight: 5 },
        LEGENDARY: { name: 'Legendary', color: '#ff9800', priceMultiplier: 10.0, dropWeight: 1 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📊 ITEM METADATA - Enhanced item definitions
    // ═══════════════════════════════════════════════════════════════

    // This extends ItemDatabase with additional metadata
    itemMetadata: {
        // === CURRENCY ===
        gold: {
            actionType: 'none',
            equipSlot: null,
            stackable: true,
            maxStack: 999999
        },

        // === RAW RESOURCES (Gatherable) ===
        wood: {
            actionType: 'craft',
            gatherType: 'woodcutting',
            gatherTime: 30,         // seconds in real time
            gatherYield: { min: 1, max: 3 },
            toolRequired: null,     // Can gather by hand
            toolBonus: 'axe',       // Axe improves yield
            skillType: 'woodcutting',
            skillRequired: 0
        },
        timber: {
            actionType: 'craft',
            gatherType: 'woodcutting',
            gatherTime: 45,
            gatherYield: { min: 1, max: 2 },
            toolRequired: 'axe',
            toolBonus: 'axe',
            skillType: 'woodcutting',
            skillRequired: 1
        },
        stone: {
            actionType: 'craft',
            gatherType: 'mining',
            gatherTime: 40,
            gatherYield: { min: 2, max: 5 },
            toolRequired: null,
            toolBonus: 'pickaxe',
            skillType: 'mining',
            skillRequired: 0
        },
        iron_ore: {
            actionType: 'craft',
            gatherType: 'mining',
            gatherTime: 60,
            gatherYield: { min: 1, max: 3 },
            toolRequired: 'pickaxe',
            toolBonus: 'pickaxe',
            skillType: 'mining',
            skillRequired: 1
        },
        copper_ore: {
            actionType: 'craft',
            gatherType: 'mining',
            gatherTime: 50,
            gatherYield: { min: 1, max: 3 },
            toolRequired: null,
            toolBonus: 'pickaxe',
            skillType: 'mining',
            skillRequired: 0
        },
        gold_ore: {
            actionType: 'craft',
            gatherType: 'mining',
            gatherTime: 120,
            gatherYield: { min: 1, max: 2 },
            toolRequired: 'pickaxe',
            toolBonus: 'steel_pickaxe',
            skillType: 'mining',
            skillRequired: 3
        },
        coal: {
            actionType: 'craft',
            gatherType: 'mining',
            gatherTime: 45,
            gatherYield: { min: 2, max: 4 },
            toolRequired: null,
            toolBonus: 'pickaxe',
            skillType: 'mining',
            skillRequired: 0
        },
        fish: {
            actionType: 'use',
            gatherType: 'fishing',
            gatherTime: 90,
            gatherYield: { min: 1, max: 3 },
            toolRequired: 'fishing_rod',
            toolBonus: 'fishing_rod',
            skillType: 'fishing',
            skillRequired: 0
        },
        wheat: {
            actionType: 'craft',
            gatherType: 'farming',
            gatherTime: 60,
            gatherYield: { min: 3, max: 6 },
            toolRequired: null,
            toolBonus: 'scythe',
            skillType: 'farming',
            skillRequired: 0
        },
        herbs: {
            actionType: 'craft',
            gatherType: 'herbalism',
            gatherTime: 30,
            gatherYield: { min: 1, max: 4 },
            toolRequired: null,
            toolBonus: 'sickle',
            skillType: 'herbalism',
            skillRequired: 0
        },
        flax: {
            actionType: 'craft',
            gatherType: 'farming',
            gatherTime: 45,
            gatherYield: { min: 2, max: 4 },
            toolRequired: null,
            toolBonus: 'sickle',
            skillType: 'farming',
            skillRequired: 0
        },
        wool: {
            actionType: 'craft',
            gatherType: 'farming',
            gatherTime: 30,
            gatherYield: { min: 2, max: 3 },
            toolRequired: null,
            skillType: 'farming',
            skillRequired: 0
        },
        hide: {
            actionType: 'craft',
            gatherType: 'hunting',
            gatherTime: 120,
            gatherYield: { min: 1, max: 2 },
            toolRequired: 'dagger',
            skillType: 'hunting',
            skillRequired: 1
        },

        // === PROCESSED MATERIALS (Crafted) ===
        iron_bar: {
            actionType: 'craft',
            craftedFrom: 'iron_ore',
            craftTime: 60,
            facility: 'smelter'
        },
        copper_bar: {
            actionType: 'craft',
            craftedFrom: 'copper_ore',
            craftTime: 45,
            facility: 'smelter'
        },
        steel_bar: {
            actionType: 'craft',
            craftTime: 90,
            facility: 'smelter'
        },
        gold_bar: {
            actionType: 'craft',
            craftedFrom: 'gold_ore',
            craftTime: 60,
            facility: 'smelter'
        },
        planks: {
            actionType: 'craft',
            craftedFrom: 'timber',
            craftTime: 30,
            facility: 'sawmill'
        },
        leather: {
            actionType: 'craft',
            craftedFrom: 'hide',
            craftTime: 120,
            facility: 'tannery'
        },
        cloth: {
            actionType: 'craft',
            craftTime: 60,
            facility: 'loom'
        },
        linen: {
            actionType: 'craft',
            craftedFrom: 'flax',
            craftTime: 45,
            facility: 'loom'
        },
        flour: {
            actionType: 'craft',
            craftedFrom: 'wheat',
            craftTime: 20,
            facility: 'workshop'
        },

        // === TOOLS (Equipable) ===
        pickaxe: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 100,
            maxDurability: 100,
            efficiency: 1.0,
            gatherBonus: { mining: 1.5 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        steel_pickaxe: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 200,
            maxDurability: 200,
            efficiency: 2.0,
            gatherBonus: { mining: 2.5 },
            repairMaterial: 'steel_bar',
            repairAmount: 50
        },
        axe: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 100,
            maxDurability: 100,
            efficiency: 1.0,
            gatherBonus: { woodcutting: 1.5 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        steel_axe: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 200,
            maxDurability: 200,
            efficiency: 2.0,
            gatherBonus: { woodcutting: 2.5 },
            repairMaterial: 'steel_bar',
            repairAmount: 50
        },
        hammer: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 100,
            maxDurability: 100,
            efficiency: 1.0,
            craftBonus: { smithing: 1.2 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        fishing_rod: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 50,
            maxDurability: 50,
            efficiency: 1.0,
            gatherBonus: { fishing: 2.0 },
            repairMaterial: 'wood',
            repairAmount: 15
        },
        sickle: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 80,
            maxDurability: 80,
            efficiency: 1.0,
            gatherBonus: { farming: 1.5, herbalism: 1.5 },
            repairMaterial: 'iron_bar',
            repairAmount: 20
        },
        scythe: {
            actionType: 'equip',
            equipSlot: 'tool',
            durability: 100,
            maxDurability: 100,
            efficiency: 1.5,
            gatherBonus: { farming: 2.0 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },

        // === WEAPONS (Equipable) ===
        sword: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 10,
            attackSpeed: 1.0,
            durability: 100,
            maxDurability: 100,
            combatBonus: { attack: 10 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        iron_sword: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 15,
            attackSpeed: 1.0,
            durability: 120,
            maxDurability: 120,
            combatBonus: { attack: 15 },
            repairMaterial: 'iron_bar',
            repairAmount: 30
        },
        steel_sword: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 25,
            attackSpeed: 1.0,
            durability: 200,
            maxDurability: 200,
            combatBonus: { attack: 25, critChance: 5 },
            repairMaterial: 'steel_bar',
            repairAmount: 50
        },
        longsword: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 30,
            attackSpeed: 0.8,
            durability: 150,
            maxDurability: 150,
            combatBonus: { attack: 30 },
            twoHanded: true,
            repairMaterial: 'steel_bar',
            repairAmount: 40
        },
        dagger: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 5,
            attackSpeed: 1.5,
            durability: 80,
            maxDurability: 80,
            combatBonus: { attack: 5, critChance: 10 },
            repairMaterial: 'iron_bar',
            repairAmount: 20
        },
        spear: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 12,
            attackSpeed: 0.9,
            range: 2,
            durability: 100,
            maxDurability: 100,
            combatBonus: { attack: 12 },
            repairMaterial: 'wood',
            repairAmount: 25
        },
        bow: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 8,
            attackSpeed: 0.7,
            range: 10,
            durability: 60,
            maxDurability: 60,
            combatBonus: { attack: 8, range: 10 },
            requiresAmmo: 'arrows',
            twoHanded: true,
            repairMaterial: 'wood',
            repairAmount: 15
        },
        crossbow: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 20,
            attackSpeed: 0.4,
            range: 15,
            durability: 100,
            maxDurability: 100,
            combatBonus: { attack: 20, range: 15 },
            requiresAmmo: 'bolts',
            twoHanded: true,
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        battleaxe: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 35,
            attackSpeed: 0.6,
            durability: 180,
            maxDurability: 180,
            combatBonus: { attack: 35 },
            twoHanded: true,
            repairMaterial: 'steel_bar',
            repairAmount: 45
        },
        warhammer: {
            actionType: 'equip',
            equipSlot: 'weapon',
            damage: 40,
            attackSpeed: 0.5,
            durability: 200,
            maxDurability: 200,
            combatBonus: { attack: 40, armorPenetration: 20 },
            twoHanded: true,
            repairMaterial: 'steel_bar',
            repairAmount: 50
        },

        // === ARMOR (Equipable) ===
        leather_armor: {
            actionType: 'equip',
            equipSlot: 'body',
            defense: 10,
            durability: 80,
            maxDurability: 80,
            combatBonus: { defense: 10 },
            speedPenalty: 0,
            repairMaterial: 'leather',
            repairAmount: 20
        },
        chainmail: {
            actionType: 'equip',
            equipSlot: 'body',
            defense: 25,
            durability: 150,
            maxDurability: 150,
            combatBonus: { defense: 25 },
            speedPenalty: 0.05,
            repairMaterial: 'iron_bar',
            repairAmount: 40
        },
        iron_armor: {
            actionType: 'equip',
            equipSlot: 'body',
            defense: 35,
            durability: 180,
            maxDurability: 180,
            combatBonus: { defense: 35 },
            speedPenalty: 0.1,
            repairMaterial: 'iron_bar',
            repairAmount: 45
        },
        plate_armor: {
            actionType: 'equip',
            equipSlot: 'body',
            defense: 50,
            durability: 250,
            maxDurability: 250,
            combatBonus: { defense: 50 },
            speedPenalty: 0.15,
            repairMaterial: 'steel_bar',
            repairAmount: 60
        },
        helmet: {
            actionType: 'equip',
            equipSlot: 'head',
            defense: 8,
            durability: 100,
            maxDurability: 100,
            combatBonus: { defense: 8 },
            repairMaterial: 'iron_bar',
            repairAmount: 25
        },
        shield: {
            actionType: 'equip',
            equipSlot: 'offHand',
            defense: 15,
            blockChance: 20,
            durability: 120,
            maxDurability: 120,
            combatBonus: { defense: 15, blockChance: 20 },
            repairMaterial: 'iron_bar',
            repairAmount: 30
        },

        // === CONSUMABLES (Usable) ===
        bread: {
            actionType: 'use',
            consumeEffect: {
                hunger: 15,
                health: 3
            },
            cooldown: 0
        },
        meat: {
            actionType: 'use',
            consumeEffect: {
                hunger: 25,
                health: 8
            },
            cooldown: 0
        },
        stew: {
            actionType: 'use',
            consumeEffect: {
                hunger: 30,
                health: 12
            },
            cooldown: 0
        },
        pie: {
            actionType: 'use',
            consumeEffect: {
                hunger: 35,
                health: 10,
                happiness: 15
            },
            cooldown: 0
        },
        ale: {
            actionType: 'use',
            consumeEffect: {
                happiness: 10,
                health: 3,
                thirst: 5
            },
            buffEffect: {
                charisma: 1,
                duration: 300  // 5 minutes game time
            },
            cooldown: 60
        },
        wine: {
            actionType: 'use',
            consumeEffect: {
                happiness: 20,
                health: 1
            },
            buffEffect: {
                charisma: 2,
                duration: 600
            },
            cooldown: 60
        },
        mead: {
            actionType: 'use',
            consumeEffect: {
                happiness: 15,
                health: 2,
                stamina: 10
            },
            buffEffect: {
                strength: 1,
                duration: 300
            },
            cooldown: 60
        },
        water: {
            actionType: 'use',
            consumeEffect: {
                thirst: 25,
                health: 2
            },
            cooldown: 0
        },
        bandages: {
            actionType: 'use',
            consumeEffect: {
                health: 20
            },
            cooldown: 30
        },
        herbs: {
            actionType: 'use',
            consumeEffect: {
                health: 10
            },
            cooldown: 10
        },
        medical_plants: {
            actionType: 'use',
            consumeEffect: {
                health: 25
            },
            cooldown: 30
        },
        holy_water: {
            actionType: 'use',
            consumeEffect: {
                health: 15,
                happiness: 5
            },
            buffEffect: {
                luck: 1,
                duration: 600
            },
            cooldown: 120
        },
        military_rations: {
            actionType: 'use',
            consumeEffect: {
                hunger: 30,
                health: 8,
                stamina: 15
            },
            cooldown: 0
        },

        // === ACCESSORIES (Equipable) ===
        backpack: {
            actionType: 'equip',
            equipSlot: 'accessory',
            carryBonus: 50,
            durability: 100,
            maxDurability: 100
        },
        merchant_ledger: {
            actionType: 'equip',
            equipSlot: 'accessory',
            tradeBonus: { priceDiscount: 5 },
            durability: 50,
            maxDurability: 50
        },
        compass: {
            actionType: 'equip',
            equipSlot: 'accessory',
            travelBonus: { speedBonus: 10 },
            durability: 100,
            maxDurability: 100
        },
        lamp: {
            actionType: 'equip',
            equipSlot: 'accessory',
            visionBonus: true,
            durability: 30,
            maxDurability: 30,
            requiresFuel: 'oil'
        },
        torch: {
            actionType: 'use',
            consumeEffect: {},
            duration: 60,  // Burns for 60 game minutes
            visionBonus: true
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔨 COMPLETE CRAFTING RECIPES - Circular Economy
    // ═══════════════════════════════════════════════════════════════

    recipes: {
        // === TIER 0: Raw → Processed ===

        // Metal Processing
        iron_bar: {
            output: { item: 'iron_bar', quantity: 1 },
            inputs: [{ item: 'iron_ore', quantity: 2 }],
            facility: 'smelter',
            time: 60,
            skillType: 'smithing',
            skillRequired: 0,
            skillGain: 2
        },
        copper_bar: {
            output: { item: 'copper_bar', quantity: 1 },
            inputs: [{ item: 'copper_ore', quantity: 2 }],
            facility: 'smelter',
            time: 45,
            skillType: 'smithing',
            skillRequired: 0,
            skillGain: 1
        },
        gold_bar: {
            output: { item: 'gold_bar', quantity: 1 },
            inputs: [{ item: 'gold_ore', quantity: 2 }],
            facility: 'smelter',
            time: 60,
            skillType: 'smithing',
            skillRequired: 3,
            skillGain: 3
        },
        steel_bar: {
            output: { item: 'steel_bar', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'coal', quantity: 3 }
            ],
            facility: 'smelter',
            time: 90,
            skillType: 'smithing',
            skillRequired: 5,
            skillGain: 5
        },

        // Wood Processing
        planks: {
            output: { item: 'planks', quantity: 4 },
            inputs: [{ item: 'timber', quantity: 1 }],
            facility: 'sawmill',
            time: 30,
            skillType: 'woodworking',
            skillRequired: 0,
            skillGain: 1
        },
        nails: {
            output: { item: 'nails', quantity: 20 },
            inputs: [{ item: 'iron_bar', quantity: 1 }],
            facility: 'forge',
            time: 15,
            skillType: 'smithing',
            skillRequired: 1,
            skillGain: 1
        },

        // Textile Processing
        leather: {
            output: { item: 'leather', quantity: 1 },
            inputs: [
                { item: 'hide', quantity: 2 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'tannery',
            time: 120,
            skillType: 'crafting',
            skillRequired: 1,
            skillGain: 2
        },
        cloth: {
            output: { item: 'cloth', quantity: 2 },
            inputs: [{ item: 'wool', quantity: 3 }],
            facility: 'loom',
            time: 45,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 1
        },
        linen: {
            output: { item: 'linen', quantity: 2 },
            inputs: [{ item: 'flax', quantity: 3 }],
            facility: 'loom',
            time: 45,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 1
        },
        thread: {
            output: { item: 'thread', quantity: 5 },
            inputs: [{ item: 'wool', quantity: 1 }],
            facility: 'none',
            time: 15,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 1
        },
        rope: {
            output: { item: 'rope', quantity: 2 },
            inputs: [
                { item: 'flax', quantity: 2 },
                { item: 'thread', quantity: 3 }
            ],
            facility: 'none',
            time: 30,
            skillType: 'crafting',
            skillRequired: 1,
            skillGain: 1
        },

        // Food Processing
        flour: {
            output: { item: 'flour', quantity: 2 },
            inputs: [{ item: 'wheat', quantity: 3 }],
            facility: 'workshop',
            time: 20,
            skillType: 'cooking',
            skillRequired: 0,
            skillGain: 1
        },
        bread: {
            output: { item: 'bread', quantity: 3 },
            inputs: [
                { item: 'flour', quantity: 2 },
                { item: 'water', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 30,
            skillType: 'cooking',
            skillRequired: 0,
            skillGain: 2
        },
        stew: {
            output: { item: 'stew', quantity: 2 },
            inputs: [
                { item: 'meat', quantity: 2 },
                { item: 'vegetables', quantity: 2 },
                { item: 'water', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 45,
            skillType: 'cooking',
            skillRequired: 1,
            skillGain: 2
        },
        pie: {
            output: { item: 'pie', quantity: 1 },
            inputs: [
                { item: 'flour', quantity: 2 },
                { item: 'meat', quantity: 1 },
                { item: 'butter', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 60,
            skillType: 'cooking',
            skillRequired: 3,
            skillGain: 3
        },
        cheese: {
            output: { item: 'cheese', quantity: 2 },
            inputs: [
                { item: 'milk', quantity: 4 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 90,
            skillType: 'cooking',
            skillRequired: 2,
            skillGain: 2
        },

        // Drinks
        ale: {
            output: { item: 'ale', quantity: 4 },
            inputs: [
                { item: 'wheat', quantity: 3 },
                { item: 'water', quantity: 2 }
            ],
            facility: 'brewery',
            time: 120,
            skillType: 'brewing',
            skillRequired: 1,
            skillGain: 2
        },
        wine: {
            output: { item: 'wine', quantity: 2 },
            inputs: [{ item: 'fruits', quantity: 5 }],
            facility: 'brewery',
            time: 180,
            skillType: 'brewing',
            skillRequired: 3,
            skillGain: 3
        },
        mead: {
            output: { item: 'mead', quantity: 3 },
            inputs: [
                { item: 'honey', quantity: 3 },
                { item: 'water', quantity: 2 }
            ],
            facility: 'brewery',
            time: 150,
            skillType: 'brewing',
            skillRequired: 2,
            skillGain: 3
        },

        // === TIER 1: Tools ===
        pickaxe: {
            output: { item: 'pickaxe', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 3 },
                { item: 'wood', quantity: 2 }
            ],
            facility: 'forge',
            time: 45,
            skillType: 'smithing',
            skillRequired: 1,
            skillGain: 2
        },
        steel_pickaxe: {
            output: { item: 'steel_pickaxe', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 3 },
                { item: 'wood', quantity: 2 }
            ],
            facility: 'forge',
            time: 60,
            skillType: 'smithing',
            skillRequired: 5,
            skillGain: 4
        },
        axe: {
            output: { item: 'axe', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'wood', quantity: 2 }
            ],
            facility: 'forge',
            time: 40,
            skillType: 'smithing',
            skillRequired: 1,
            skillGain: 2
        },
        steel_axe: {
            output: { item: 'steel_axe', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 2 },
                { item: 'wood', quantity: 2 }
            ],
            facility: 'forge',
            time: 55,
            skillType: 'smithing',
            skillRequired: 5,
            skillGain: 4
        },
        hammer: {
            output: { item: 'hammer', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'wood', quantity: 1 }
            ],
            facility: 'forge',
            time: 30,
            skillType: 'smithing',
            skillRequired: 0,
            skillGain: 2
        },
        fishing_rod: {
            output: { item: 'fishing_rod', quantity: 1 },
            inputs: [
                { item: 'wood', quantity: 2 },
                { item: 'thread', quantity: 3 }
            ],
            facility: 'none',
            time: 20,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 1
        },
        sickle: {
            output: { item: 'sickle', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 1 },
                { item: 'wood', quantity: 1 }
            ],
            facility: 'forge',
            time: 25,
            skillType: 'smithing',
            skillRequired: 0,
            skillGain: 1
        },
        scythe: {
            output: { item: 'scythe', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'wood', quantity: 3 }
            ],
            facility: 'forge',
            time: 40,
            skillType: 'smithing',
            skillRequired: 2,
            skillGain: 2
        },

        // === TIER 2: Weapons ===
        sword: {
            output: { item: 'sword', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 3 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'forge',
            time: 60,
            skillType: 'smithing',
            skillRequired: 2,
            skillGain: 3
        },
        iron_sword: {
            output: { item: 'iron_sword', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 4 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'forge',
            time: 75,
            skillType: 'smithing',
            skillRequired: 3,
            skillGain: 4
        },
        steel_sword: {
            output: { item: 'steel_sword', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 4 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'forge',
            time: 90,
            skillType: 'smithing',
            skillRequired: 6,
            skillGain: 5
        },
        longsword: {
            output: { item: 'longsword', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 6 },
                { item: 'leather', quantity: 2 }
            ],
            facility: 'forge',
            time: 120,
            skillType: 'smithing',
            skillRequired: 8,
            skillGain: 6
        },
        dagger: {
            output: { item: 'dagger', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 1 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'forge',
            time: 30,
            skillType: 'smithing',
            skillRequired: 1,
            skillGain: 2
        },
        spear: {
            output: { item: 'spear', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'wood', quantity: 3 }
            ],
            facility: 'forge',
            time: 45,
            skillType: 'smithing',
            skillRequired: 1,
            skillGain: 2
        },
        bow: {
            output: { item: 'bow', quantity: 1 },
            inputs: [
                { item: 'wood', quantity: 3 },
                { item: 'thread', quantity: 2 }
            ],
            facility: 'workshop',
            time: 40,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 2
        },
        arrows: {
            output: { item: 'arrows', quantity: 20 },
            inputs: [
                { item: 'wood', quantity: 2 },
                { item: 'iron_bar', quantity: 1 }
            ],
            facility: 'workshop',
            time: 30,
            skillType: 'crafting',
            skillRequired: 1,
            skillGain: 1
        },
        crossbow: {
            output: { item: 'crossbow', quantity: 1 },
            inputs: [
                { item: 'wood', quantity: 4 },
                { item: 'iron_bar', quantity: 3 },
                { item: 'thread', quantity: 2 }
            ],
            facility: 'workshop',
            time: 90,
            skillType: 'crafting',
            skillRequired: 4,
            skillGain: 4
        },
        bolts: {
            output: { item: 'bolts', quantity: 15 },
            inputs: [
                { item: 'wood', quantity: 1 },
                { item: 'iron_bar', quantity: 2 }
            ],
            facility: 'workshop',
            time: 30,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 1
        },
        battleaxe: {
            output: { item: 'battleaxe', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 5 },
                { item: 'wood', quantity: 3 }
            ],
            facility: 'forge',
            time: 100,
            skillType: 'smithing',
            skillRequired: 6,
            skillGain: 5
        },
        warhammer: {
            output: { item: 'warhammer', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 6 },
                { item: 'wood', quantity: 2 }
            ],
            facility: 'forge',
            time: 120,
            skillType: 'smithing',
            skillRequired: 7,
            skillGain: 6
        },

        // === TIER 2: Armor ===
        leather_armor: {
            output: { item: 'leather_armor', quantity: 1 },
            inputs: [
                { item: 'leather', quantity: 5 },
                { item: 'thread', quantity: 3 }
            ],
            facility: 'workshop',
            time: 60,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 3
        },
        chainmail: {
            output: { item: 'chainmail', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 8 }
            ],
            facility: 'armory',
            time: 120,
            skillType: 'smithing',
            skillRequired: 4,
            skillGain: 5
        },
        iron_armor: {
            output: { item: 'iron_armor', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 10 },
                { item: 'leather', quantity: 2 }
            ],
            facility: 'armory',
            time: 150,
            skillType: 'smithing',
            skillRequired: 5,
            skillGain: 6
        },
        plate_armor: {
            output: { item: 'plate_armor', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 12 },
                { item: 'leather', quantity: 3 }
            ],
            facility: 'armory',
            time: 180,
            skillType: 'smithing',
            skillRequired: 8,
            skillGain: 8
        },
        helmet: {
            output: { item: 'helmet', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 3 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'armory',
            time: 45,
            skillType: 'smithing',
            skillRequired: 2,
            skillGain: 2
        },
        shield: {
            output: { item: 'shield', quantity: 1 },
            inputs: [
                { item: 'wood', quantity: 4 },
                { item: 'iron_bar', quantity: 2 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'workshop',
            time: 50,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 3
        },

        // === TIER 3: Currency/Luxury ===
        gold_coins: {
            output: { item: 'gold', quantity: 100 },
            inputs: [{ item: 'gold_bar', quantity: 1 }],
            facility: 'mint',
            time: 30,
            skillType: 'smithing',
            skillRequired: 3,
            skillGain: 2
        },
        jewelry: {
            output: { item: 'jewelry', quantity: 1 },
            inputs: [
                { item: 'gold_bar', quantity: 1 },
                { item: 'gemstone', quantity: 1 }
            ],
            facility: 'workshop',
            time: 90,
            skillType: 'crafting',
            skillRequired: 5,
            skillGain: 5
        },

        // === Clothing ===
        simple_clothes: {
            output: { item: 'simple_clothes', quantity: 1 },
            inputs: [
                { item: 'cloth', quantity: 3 },
                { item: 'thread', quantity: 2 }
            ],
            facility: 'none',
            time: 45,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 2
        },
        fine_clothes: {
            output: { item: 'fine_clothes', quantity: 1 },
            inputs: [
                { item: 'linen', quantity: 4 },
                { item: 'thread', quantity: 3 },
                { item: 'dye', quantity: 1 }
            ],
            facility: 'none',
            time: 90,
            skillType: 'crafting',
            skillRequired: 3,
            skillGain: 4
        },
        silk_garments: {
            output: { item: 'silk_garments', quantity: 1 },
            inputs: [
                { item: 'silk', quantity: 3 },
                { item: 'thread', quantity: 3 },
                { item: 'dye', quantity: 2 }
            ],
            facility: 'none',
            time: 120,
            skillType: 'crafting',
            skillRequired: 5,
            skillGain: 5
        },

        // === Medicine ===
        bandages: {
            output: { item: 'bandages', quantity: 5 },
            inputs: [
                { item: 'cloth', quantity: 2 }
            ],
            facility: 'none',
            time: 10,
            skillType: 'medicine',
            skillRequired: 0,
            skillGain: 1
        },
        medical_plants: {
            output: { item: 'medical_plants', quantity: 2 },
            inputs: [
                { item: 'herbs', quantity: 3 }
            ],
            facility: 'alchemy_table',
            time: 30,
            skillType: 'medicine',
            skillRequired: 1,
            skillGain: 2
        },
        holy_water: {
            output: { item: 'holy_water', quantity: 3 },
            inputs: [
                { item: 'water', quantity: 3 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'none',
            time: 15,
            skillType: 'medicine',
            skillRequired: 0,
            skillGain: 1
        },

        // === Accessories ===
        backpack: {
            output: { item: 'backpack', quantity: 1 },
            inputs: [
                { item: 'leather', quantity: 4 },
                { item: 'thread', quantity: 3 },
                { item: 'rope', quantity: 2 }
            ],
            facility: 'none',
            time: 60,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 3
        },
        torch: {
            output: { item: 'torch', quantity: 5 },
            inputs: [
                { item: 'wood', quantity: 2 },
                { item: 'cloth', quantity: 1 },
                { item: 'oil', quantity: 1 }
            ],
            facility: 'none',
            time: 10,
            skillType: 'crafting',
            skillRequired: 0,
            skillGain: 1
        },
        lamp: {
            output: { item: 'lamp', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'glass', quantity: 1 }
            ],
            facility: 'workshop',
            time: 40,
            skillType: 'crafting',
            skillRequired: 2,
            skillGain: 2
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎒 GATHERING ACTIONS - Time-based resource collection
    // ═══════════════════════════════════════════════════════════════

    gatheringActions: {
        // Mining Actions
        mine_stone: {
            name: 'Mine Stone',
            description: 'Break rocks to collect stone.',
            icon: '🪨',
            gatherType: 'mining',
            outputItem: 'stone',
            baseTime: 30,           // seconds
            baseYield: { min: 2, max: 4 },
            toolRequired: null,
            toolBonus: { pickaxe: 1.5, steel_pickaxe: 2.5 },
            skillType: 'mining',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 5,
            locationTypes: ['mine', 'quarry', 'cave']
        },
        mine_iron: {
            name: 'Mine Iron Ore',
            description: 'Extract iron ore from rocks.',
            icon: '⛏️',
            gatherType: 'mining',
            outputItem: 'iron_ore',
            baseTime: 60,
            baseYield: { min: 1, max: 3 },
            toolRequired: 'pickaxe',
            toolBonus: { pickaxe: 1.5, steel_pickaxe: 2.5 },
            skillType: 'mining',
            skillRequired: 1,
            skillGain: 2,
            staminaCost: 8,
            locationTypes: ['mine', 'cave']
        },
        mine_copper: {
            name: 'Mine Copper Ore',
            description: 'Extract copper ore from rocks.',
            icon: '🟤',
            gatherType: 'mining',
            outputItem: 'copper_ore',
            baseTime: 45,
            baseYield: { min: 1, max: 3 },
            toolRequired: null,
            toolBonus: { pickaxe: 1.5, steel_pickaxe: 2.5 },
            skillType: 'mining',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 6,
            locationTypes: ['mine', 'cave']
        },
        mine_coal: {
            name: 'Mine Coal',
            description: 'Extract coal from the earth.',
            icon: '⚫',
            gatherType: 'mining',
            outputItem: 'coal',
            baseTime: 40,
            baseYield: { min: 2, max: 5 },
            toolRequired: null,
            toolBonus: { pickaxe: 1.5, steel_pickaxe: 2.0 },
            skillType: 'mining',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 5,
            locationTypes: ['mine', 'cave']
        },
        mine_gold: {
            name: 'Mine Gold Ore',
            description: 'Extract precious gold ore.',
            icon: '✨',
            gatherType: 'mining',
            outputItem: 'gold_ore',
            baseTime: 120,
            baseYield: { min: 1, max: 2 },
            toolRequired: 'pickaxe',
            toolBonus: { steel_pickaxe: 2.0 },
            skillType: 'mining',
            skillRequired: 5,
            skillGain: 5,
            staminaCost: 15,
            locationTypes: ['mine']
        },

        // Woodcutting Actions
        chop_wood: {
            name: 'Chop Wood',
            description: 'Cut down trees for wood.',
            icon: '🪵',
            gatherType: 'woodcutting',
            outputItem: 'wood',
            baseTime: 25,
            baseYield: { min: 1, max: 3 },
            toolRequired: null,
            toolBonus: { axe: 1.5, steel_axe: 2.5 },
            skillType: 'woodcutting',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 5,
            locationTypes: ['forest']
        },
        harvest_timber: {
            name: 'Harvest Timber',
            description: 'Fell large trees for timber.',
            icon: '🌲',
            gatherType: 'woodcutting',
            outputItem: 'timber',
            baseTime: 45,
            baseYield: { min: 1, max: 2 },
            toolRequired: 'axe',
            toolBonus: { axe: 1.5, steel_axe: 2.5 },
            skillType: 'woodcutting',
            skillRequired: 2,
            skillGain: 2,
            staminaCost: 10,
            locationTypes: ['forest']
        },

        // Farming Actions
        harvest_wheat: {
            name: 'Harvest Wheat',
            description: 'Collect ripe wheat from fields.',
            icon: '🌾',
            gatherType: 'farming',
            outputItem: 'wheat',
            baseTime: 40,
            baseYield: { min: 3, max: 6 },
            toolRequired: null,
            toolBonus: { sickle: 1.5, scythe: 2.0 },
            skillType: 'farming',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 4,
            locationTypes: ['farm']
        },
        harvest_flax: {
            name: 'Harvest Flax',
            description: 'Gather flax plants for cloth making.',
            icon: '🌿',
            gatherType: 'farming',
            outputItem: 'flax',
            baseTime: 35,
            baseYield: { min: 2, max: 4 },
            toolRequired: null,
            toolBonus: { sickle: 1.5 },
            skillType: 'farming',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 3,
            locationTypes: ['farm']
        },
        shear_sheep: {
            name: 'Shear Sheep',
            description: 'Collect wool from sheep.',
            icon: '🐑',
            gatherType: 'farming',
            outputItem: 'wool',
            baseTime: 20,
            baseYield: { min: 2, max: 3 },
            toolRequired: null,
            skillType: 'farming',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 2,
            locationTypes: ['farm']
        },
        milk_cow: {
            name: 'Milk Cow',
            description: 'Collect fresh milk from cows.',
            icon: '🐄',
            gatherType: 'farming',
            outputItem: 'milk',
            baseTime: 15,
            baseYield: { min: 2, max: 4 },
            toolRequired: null,
            skillType: 'farming',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 2,
            locationTypes: ['farm']
        },
        collect_eggs: {
            name: 'Collect Eggs',
            description: 'Gather eggs from chickens.',
            icon: '🥚',
            gatherType: 'farming',
            outputItem: 'eggs',
            baseTime: 10,
            baseYield: { min: 3, max: 6 },
            toolRequired: null,
            skillType: 'farming',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 1,
            locationTypes: ['farm']
        },

        // Fishing Actions
        fish: {
            name: 'Fish',
            description: 'Catch fish from the water.',
            icon: '🎣',
            gatherType: 'fishing',
            outputItem: 'fish',
            baseTime: 60,
            baseYield: { min: 1, max: 3 },
            toolRequired: 'fishing_rod',
            toolBonus: { fishing_rod: 2.0 },
            skillType: 'fishing',
            skillRequired: 0,
            skillGain: 2,
            staminaCost: 3,
            locationTypes: ['fishing', 'river', 'lake', 'coast']
        },

        // Herbalism Actions
        gather_herbs: {
            name: 'Gather Herbs',
            description: 'Collect medicinal herbs.',
            icon: '🌿',
            gatherType: 'herbalism',
            outputItem: 'herbs',
            baseTime: 25,
            baseYield: { min: 1, max: 4 },
            toolRequired: null,
            toolBonus: { sickle: 1.5 },
            skillType: 'herbalism',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 2,
            locationTypes: ['forest', 'herb']
        },
        forage_vegetables: {
            name: 'Forage Vegetables',
            description: 'Find edible vegetables in the wild.',
            icon: '🥕',
            gatherType: 'herbalism',
            outputItem: 'vegetables',
            baseTime: 30,
            baseYield: { min: 2, max: 5 },
            toolRequired: null,
            skillType: 'herbalism',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 3,
            locationTypes: ['forest', 'farm']
        },
        gather_fruits: {
            name: 'Gather Fruits',
            description: 'Pick ripe fruits from trees and bushes.',
            icon: '🍎',
            gatherType: 'herbalism',
            outputItem: 'fruits',
            baseTime: 20,
            baseYield: { min: 2, max: 4 },
            toolRequired: null,
            skillType: 'herbalism',
            skillRequired: 0,
            skillGain: 1,
            staminaCost: 2,
            locationTypes: ['forest', 'farm']
        },
        collect_honey: {
            name: 'Collect Honey',
            description: 'Carefully harvest honey from beehives.',
            icon: '🍯',
            gatherType: 'herbalism',
            outputItem: 'honey',
            baseTime: 45,
            baseYield: { min: 1, max: 2 },
            toolRequired: null,
            skillType: 'herbalism',
            skillRequired: 2,
            skillGain: 2,
            staminaCost: 5,
            locationTypes: ['forest', 'farm']
        },

        // Hunting Actions
        hunt_game: {
            name: 'Hunt Game',
            description: 'Track and hunt wild animals for meat.',
            icon: '🏹',
            gatherType: 'hunting',
            outputItem: 'meat',
            baseTime: 90,
            baseYield: { min: 2, max: 5 },
            toolRequired: 'bow',
            toolBonus: { bow: 1.5, crossbow: 2.0 },
            skillType: 'hunting',
            skillRequired: 1,
            skillGain: 3,
            staminaCost: 10,
            locationTypes: ['forest', 'wilderness']
        },
        skin_animal: {
            name: 'Skin Animal',
            description: 'Collect hides from hunted animals.',
            icon: '🦊',
            gatherType: 'hunting',
            outputItem: 'hide',
            baseTime: 60,
            baseYield: { min: 1, max: 2 },
            toolRequired: 'dagger',
            skillType: 'hunting',
            skillRequired: 1,
            skillGain: 2,
            staminaCost: 5,
            locationTypes: ['forest', 'wilderness']
        },

        // Water Collection
        collect_water: {
            name: 'Collect Water',
            description: 'Fill containers with fresh water.',
            icon: '💧',
            gatherType: 'herbalism',
            outputItem: 'water',
            baseTime: 15,
            baseYield: { min: 3, max: 5 },
            toolRequired: null,
            skillType: 'herbalism',
            skillRequired: 0,
            skillGain: 0,
            staminaCost: 1,
            locationTypes: ['river', 'lake', 'well', 'town', 'village']
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 PLAYER SKILLS - Track progression
    // ═══════════════════════════════════════════════════════════════

    skills: {
        mining: { name: 'Mining', icon: '⛏️', maxLevel: 10 },
        woodcutting: { name: 'Woodcutting', icon: '🪓', maxLevel: 10 },
        farming: { name: 'Farming', icon: '🌾', maxLevel: 10 },
        fishing: { name: 'Fishing', icon: '🎣', maxLevel: 10 },
        herbalism: { name: 'Herbalism', icon: '🌿', maxLevel: 10 },
        hunting: { name: 'Hunting', icon: '🏹', maxLevel: 10 },
        smithing: { name: 'Smithing', icon: '🔨', maxLevel: 10 },
        crafting: { name: 'Crafting', icon: '🛠️', maxLevel: 10 },
        cooking: { name: 'Cooking', icon: '🍳', maxLevel: 10 },
        brewing: { name: 'Brewing', icon: '🍺', maxLevel: 10 },
        medicine: { name: 'Medicine', icon: '💊', maxLevel: 10 }
    },

    // Experience required per level (cumulative)
    skillXPTable: [0, 100, 250, 500, 900, 1500, 2400, 3800, 5800, 8500, 12000],

    // ═══════════════════════════════════════════════════════════════
    // 🧪 METHODS - System functionality
    // ═══════════════════════════════════════════════════════════════

    // Initialize the system
    init() {
        console.log('📦 Unified Item System initialized');
        console.log(`   - ${Object.keys(this.itemMetadata).length} items with metadata`);
        console.log(`   - ${Object.keys(this.recipes).length} crafting recipes`);
        console.log(`   - ${Object.keys(this.gatheringActions).length} gathering actions`);
        console.log(`   - ${Object.keys(this.skills).length} skill types`);
    },

    // Get complete item data (merges ItemDatabase + metadata)
    getItem(itemId) {
        const baseItem = ItemDatabase?.getItem(itemId) || {};
        const metadata = this.itemMetadata[itemId] || {};
        return { ...baseItem, ...metadata, id: itemId };
    },

    // Get metadata for an item
    getItemMetadata(itemId) {
        return this.itemMetadata[itemId] || null;
    },

    // Get recipe for crafting an item
    getRecipe(itemId) {
        return this.recipes[itemId] || null;
    },

    // Get all recipes that use a specific item as input
    getRecipesUsingItem(itemId) {
        const results = [];
        for (const [recipeId, recipe] of Object.entries(this.recipes)) {
            if (recipe.inputs.some(input => input.item === itemId)) {
                results.push({ recipeId, recipe });
            }
        }
        return results;
    },

    // Get gathering action for an item
    getGatheringAction(outputItem) {
        for (const [actionId, action] of Object.entries(this.gatheringActions)) {
            if (action.outputItem === outputItem) {
                return { actionId, ...action };
            }
        }
        return null;
    },

    // Calculate gathering yield with tool and skill bonuses
    calculateGatherYield(actionId, toolId, skillLevel, perkBonuses = {}) {
        const action = this.gatheringActions[actionId];
        if (!action) return { min: 0, max: 0 };

        let { min, max } = action.baseYield;

        // Tool bonus
        if (toolId && action.toolBonus && action.toolBonus[toolId]) {
            const multiplier = action.toolBonus[toolId];
            min = Math.floor(min * multiplier);
            max = Math.floor(max * multiplier);
        }

        // Skill bonus (10% per level)
        const skillMultiplier = 1 + (skillLevel * 0.1);
        min = Math.floor(min * skillMultiplier);
        max = Math.floor(max * skillMultiplier);

        // Perk bonuses
        if (perkBonuses[action.gatherType]) {
            const perkMultiplier = 1 + (perkBonuses[action.gatherType] / 100);
            min = Math.floor(min * perkMultiplier);
            max = Math.floor(max * perkMultiplier);
        }

        return { min, max };
    },

    // Calculate gathering time with tool efficiency
    calculateGatherTime(actionId, toolId, perkBonuses = {}) {
        const action = this.gatheringActions[actionId];
        if (!action) return 0;

        let time = action.baseTime;

        // Tool efficiency reduces time
        if (toolId) {
            const toolMeta = this.itemMetadata[toolId];
            if (toolMeta && toolMeta.efficiency) {
                time = Math.floor(time / toolMeta.efficiency);
            }
        }

        // Perk bonuses for speed
        if (perkBonuses.gatherSpeed) {
            time = Math.floor(time * (1 - perkBonuses.gatherSpeed / 100));
        }

        return Math.max(time, 5); // Minimum 5 seconds
    },

    // Calculate crafting time
    calculateCraftTime(recipeId, skillLevel, perkBonuses = {}) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return 0;

        let time = recipe.time;

        // Skill reduces time (5% per level above requirement)
        const skillAbove = Math.max(0, skillLevel - recipe.skillRequired);
        const skillMultiplier = 1 - (skillAbove * 0.05);
        time = Math.floor(time * Math.max(0.5, skillMultiplier));

        // Perk bonuses
        if (perkBonuses.craftSpeed) {
            time = Math.floor(time * (1 - perkBonuses.craftSpeed / 100));
        }

        return Math.max(time, 5);
    },

    // Check if player can craft an item
    canCraft(recipeId, inventory, skillLevels = {}, facilities = []) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return { canCraft: false, reason: 'Recipe not found' };

        // Check skill requirement
        const skillLevel = skillLevels[recipe.skillType] || 0;
        if (skillLevel < recipe.skillRequired) {
            return {
                canCraft: false,
                reason: `Requires ${recipe.skillType} level ${recipe.skillRequired}`
            };
        }

        // Check facility
        if (recipe.facility !== 'none' && !facilities.includes(recipe.facility)) {
            return {
                canCraft: false,
                reason: `Requires ${recipe.facility}`
            };
        }

        // Check ingredients
        for (const input of recipe.inputs) {
            const hasAmount = inventory[input.item] || 0;
            if (hasAmount < input.quantity) {
                return {
                    canCraft: false,
                    reason: `Need ${input.quantity} ${input.item} (have ${hasAmount})`
                };
            }
        }

        return { canCraft: true, reason: null };
    },

    // Check if player can gather a resource
    canGather(actionId, equippedTool, skillLevels = {}, currentLocation = null) {
        const action = this.gatheringActions[actionId];
        if (!action) return { canGather: false, reason: 'Action not found' };

        // Check skill requirement
        const skillLevel = skillLevels[action.skillType] || 0;
        if (skillLevel < action.skillRequired) {
            return {
                canGather: false,
                reason: `Requires ${action.skillType} level ${action.skillRequired}`
            };
        }

        // Check tool requirement
        if (action.toolRequired && equippedTool !== action.toolRequired) {
            return {
                canGather: false,
                reason: `Requires ${action.toolRequired}`
            };
        }

        // Check location type
        if (currentLocation && action.locationTypes.length > 0) {
            if (!action.locationTypes.includes(currentLocation.type)) {
                return {
                    canGather: false,
                    reason: `Cannot do this here (need: ${action.locationTypes.join(', ')})`
                };
            }
        }

        return { canGather: true, reason: null };
    },

    // Get equipment bonuses for a slot
    getEquipmentBonuses(itemId) {
        const meta = this.itemMetadata[itemId];
        if (!meta) return {};

        const bonuses = {};

        if (meta.combatBonus) {
            Object.assign(bonuses, meta.combatBonus);
        }
        if (meta.gatherBonus) {
            bonuses.gatherBonus = meta.gatherBonus;
        }
        if (meta.craftBonus) {
            bonuses.craftBonus = meta.craftBonus;
        }
        if (meta.tradeBonus) {
            Object.assign(bonuses, meta.tradeBonus);
        }
        if (meta.carryBonus) {
            bonuses.carryBonus = meta.carryBonus;
        }
        if (meta.travelBonus) {
            Object.assign(bonuses, meta.travelBonus);
        }

        return bonuses;
    },

    // Apply consumable effect to player
    applyConsumableEffect(itemId, playerStats) {
        const meta = this.itemMetadata[itemId];
        if (!meta || meta.actionType !== 'use') return { success: false };

        const effects = {};

        // Apply immediate effects
        if (meta.consumeEffect) {
            for (const [stat, value] of Object.entries(meta.consumeEffect)) {
                effects[stat] = value;
            }
        }

        // Return buff effect separately (to be managed by buff system)
        const buff = meta.buffEffect || null;

        return { success: true, effects, buff };
    },

    // Get skill level from XP
    getSkillLevel(xp) {
        for (let level = this.skillXPTable.length - 1; level >= 0; level--) {
            if (xp >= this.skillXPTable[level]) {
                return level;
            }
        }
        return 0;
    },

    // Get XP needed for next level
    getXPForNextLevel(currentLevel) {
        if (currentLevel >= this.skillXPTable.length - 1) {
            return Infinity; // Max level
        }
        return this.skillXPTable[currentLevel + 1];
    },

    // Get circular economy chain for an item
    getItemChain(itemId) {
        const chain = {
            gatherFrom: null,
            craftedFrom: [],
            craftedInto: [],
            usedFor: []
        };

        // Check if gatherable
        const gatherAction = this.getGatheringAction(itemId);
        if (gatherAction) {
            chain.gatherFrom = gatherAction;
        }

        // Check what it's crafted from
        const recipe = this.recipes[itemId];
        if (recipe) {
            chain.craftedFrom = recipe.inputs.map(i => i.item);
        }

        // Check what it crafts into
        chain.craftedInto = this.getRecipesUsingItem(itemId).map(r => r.recipe.output.item);

        // Check usage type
        const meta = this.itemMetadata[itemId];
        if (meta) {
            if (meta.actionType === 'use') chain.usedFor.push('consume');
            if (meta.actionType === 'equip') chain.usedFor.push('equip');
            if (meta.actionType === 'craft') chain.usedFor.push('crafting material');
        }

        return chain;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔍 CHAIN VERIFICATION - Ensure circular economy is complete
    // ═══════════════════════════════════════════════════════════════

    // Verify a complete production chain
    verifyProductionChain(chainName, steps) {
        const results = { valid: true, steps: [] };

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepResult = { step: step.name, valid: true, issues: [] };

            if (step.type === 'gather') {
                const action = this.gatheringActions[step.actionId];
                if (!action) {
                    stepResult.valid = false;
                    stepResult.issues.push(`Gathering action '${step.actionId}' not found`);
                } else {
                    stepResult.output = action.outputItem;
                    stepResult.time = action.baseTime;
                }
            } else if (step.type === 'craft') {
                const recipe = this.recipes[step.recipeId];
                if (!recipe) {
                    stepResult.valid = false;
                    stepResult.issues.push(`Recipe '${step.recipeId}' not found`);
                } else {
                    stepResult.inputs = recipe.inputs;
                    stepResult.output = recipe.output;
                    stepResult.time = recipe.time;
                    stepResult.facility = recipe.facility;
                }
            } else if (step.type === 'equip') {
                const meta = this.itemMetadata[step.itemId];
                if (!meta || meta.actionType !== 'equip') {
                    stepResult.valid = false;
                    stepResult.issues.push(`Item '${step.itemId}' cannot be equipped`);
                } else {
                    stepResult.slot = meta.equipSlot;
                    stepResult.bonuses = this.getEquipmentBonuses(step.itemId);
                }
            } else if (step.type === 'use') {
                const meta = this.itemMetadata[step.itemId];
                if (!meta || meta.actionType !== 'use') {
                    stepResult.valid = false;
                    stepResult.issues.push(`Item '${step.itemId}' cannot be consumed`);
                } else {
                    stepResult.effects = meta.consumeEffect;
                    stepResult.buff = meta.buffEffect;
                }
            }

            if (!stepResult.valid) results.valid = false;
            results.steps.push(stepResult);
        }

        console.log(`🔍 Chain '${chainName}': ${results.valid ? '✅ VALID' : '❌ INVALID'}`);
        return results;
    },

    // Get all circular economy chains as documentation
    getCircularEconomyChains() {
        return {
            // Ore → Bar → Coins chain
            ore_to_coins: {
                name: 'Ore to Currency',
                description: 'Mine ore, smelt bars, mint coins',
                steps: [
                    { type: 'gather', actionId: 'mine_gold', name: 'Mine Gold Ore' },
                    { type: 'craft', recipeId: 'gold_bar', name: 'Smelt Gold Bar' },
                    { type: 'craft', recipeId: 'gold_coins', name: 'Mint Gold Coins' }
                ]
            },

            // Ore → Bar → Weapon → Equip chain
            ore_to_weapon: {
                name: 'Ore to Combat Weapon',
                description: 'Mine ore, smelt bars, forge weapon, equip for combat',
                steps: [
                    { type: 'gather', actionId: 'mine_iron', name: 'Mine Iron Ore' },
                    { type: 'craft', recipeId: 'iron_bar', name: 'Smelt Iron Bar' },
                    { type: 'craft', recipeId: 'steel_bar', name: 'Make Steel Bar' },
                    { type: 'craft', recipeId: 'steel_sword', name: 'Forge Steel Sword' },
                    { type: 'equip', itemId: 'steel_sword', name: 'Equip Steel Sword' }
                ]
            },

            // Ore → Bar → Armor → Equip chain
            ore_to_armor: {
                name: 'Ore to Armor',
                description: 'Mine ore, smelt bars, forge armor, equip for defense',
                steps: [
                    { type: 'gather', actionId: 'mine_iron', name: 'Mine Iron Ore' },
                    { type: 'craft', recipeId: 'iron_bar', name: 'Smelt Iron Bar' },
                    { type: 'craft', recipeId: 'steel_bar', name: 'Make Steel Bar' },
                    { type: 'craft', recipeId: 'plate_armor', name: 'Forge Plate Armor' },
                    { type: 'equip', itemId: 'plate_armor', name: 'Equip Plate Armor' }
                ]
            },

            // Ore → Bar → Tool → Gather chain
            ore_to_tool: {
                name: 'Ore to Gathering Tool',
                description: 'Mine ore, smelt bars, forge tool, gather more efficiently',
                steps: [
                    { type: 'gather', actionId: 'mine_iron', name: 'Mine Iron Ore' },
                    { type: 'craft', recipeId: 'iron_bar', name: 'Smelt Iron Bar' },
                    { type: 'craft', recipeId: 'steel_bar', name: 'Make Steel Bar' },
                    { type: 'craft', recipeId: 'steel_pickaxe', name: 'Forge Steel Pickaxe' },
                    { type: 'equip', itemId: 'steel_pickaxe', name: 'Equip Steel Pickaxe' }
                ]
            },

            // Wood → Planks → Items chain
            wood_to_items: {
                name: 'Wood to Construction',
                description: 'Harvest wood, process planks, build items',
                steps: [
                    { type: 'gather', actionId: 'harvest_timber', name: 'Harvest Timber' },
                    { type: 'craft', recipeId: 'planks', name: 'Process into Planks' },
                    { type: 'craft', recipeId: 'bow', name: 'Craft Bow' },
                    { type: 'equip', itemId: 'bow', name: 'Equip Bow' }
                ]
            },

            // Food → Cook → Consume chain
            food_to_consume: {
                name: 'Farm to Table',
                description: 'Harvest crops, cook food, consume for stats',
                steps: [
                    { type: 'gather', actionId: 'harvest_wheat', name: 'Harvest Wheat' },
                    { type: 'craft', recipeId: 'flour', name: 'Mill into Flour' },
                    { type: 'craft', recipeId: 'bread', name: 'Bake Bread' },
                    { type: 'use', itemId: 'bread', name: 'Eat Bread' }
                ]
            },

            // Meat stew chain
            meat_stew_chain: {
                name: 'Hunter\'s Stew',
                description: 'Hunt game, forage vegetables, cook stew',
                steps: [
                    { type: 'gather', actionId: 'hunt_game', name: 'Hunt Game' },
                    { type: 'gather', actionId: 'forage_vegetables', name: 'Forage Vegetables' },
                    { type: 'gather', actionId: 'collect_water', name: 'Collect Water' },
                    { type: 'craft', recipeId: 'stew', name: 'Cook Stew' },
                    { type: 'use', itemId: 'stew', name: 'Eat Stew' }
                ]
            },

            // Brewing chain
            brewing_chain: {
                name: 'Brewing Beverages',
                description: 'Farm ingredients, brew drinks, consume for buffs',
                steps: [
                    { type: 'gather', actionId: 'harvest_wheat', name: 'Harvest Wheat' },
                    { type: 'gather', actionId: 'collect_water', name: 'Collect Water' },
                    { type: 'craft', recipeId: 'ale', name: 'Brew Ale' },
                    { type: 'use', itemId: 'ale', name: 'Drink Ale (Charisma Buff)' }
                ]
            },

            // Textile chain
            textile_chain: {
                name: 'Textile Production',
                description: 'Farm fiber, process cloth, craft clothing',
                steps: [
                    { type: 'gather', actionId: 'harvest_flax', name: 'Harvest Flax' },
                    { type: 'craft', recipeId: 'linen', name: 'Process into Linen' },
                    { type: 'craft', recipeId: 'fine_clothes', name: 'Craft Fine Clothes' }
                ]
            },

            // Leather chain
            leather_chain: {
                name: 'Leather Working',
                description: 'Hunt animals, tan hides, craft leather goods',
                steps: [
                    { type: 'gather', actionId: 'skin_animal', name: 'Skin Animal' },
                    { type: 'craft', recipeId: 'leather', name: 'Tan Leather' },
                    { type: 'craft', recipeId: 'leather_armor', name: 'Craft Leather Armor' },
                    { type: 'equip', itemId: 'leather_armor', name: 'Equip Leather Armor' }
                ]
            },

            // Medicine chain
            medicine_chain: {
                name: 'Medicine Crafting',
                description: 'Gather herbs, process medicine, heal',
                steps: [
                    { type: 'gather', actionId: 'gather_herbs', name: 'Gather Herbs' },
                    { type: 'craft', recipeId: 'medical_plants', name: 'Process Medical Plants' },
                    { type: 'use', itemId: 'medical_plants', name: 'Use Medical Plants' }
                ]
            }
        };
    },

    // Verify all chains and return report
    verifyAllChains() {
        const chains = this.getCircularEconomyChains();
        const report = { valid: true, chains: {} };

        for (const [chainId, chain] of Object.entries(chains)) {
            const result = this.verifyProductionChain(chain.name, chain.steps);
            report.chains[chainId] = {
                name: chain.name,
                description: chain.description,
                ...result
            };
            if (!result.valid) report.valid = false;
        }

        console.log(`\n📊 CIRCULAR ECONOMY VERIFICATION: ${report.valid ? '✅ ALL VALID' : '❌ ISSUES FOUND'}`);
        return report;
    },

    // Debooger helper 💀 - print item chain
    deboogerItemChain(itemId) {
        const chain = this.getItemChain(itemId);
        console.log(`\n🔗 Item Chain for '${itemId}':`);

        if (chain.gatherFrom) {
            console.log(`  📍 Can be gathered via: ${chain.gatherFrom.actionId}`);
        }

        if (chain.craftedFrom.length > 0) {
            console.log(`  ⬅️ Crafted from: ${chain.craftedFrom.join(', ')}`);
        }

        if (chain.craftedInto.length > 0) {
            console.log(`  ➡️ Crafts into: ${chain.craftedInto.join(', ')}`);
        }

        if (chain.usedFor.length > 0) {
            console.log(`  ✅ Used for: ${chain.usedFor.join(', ')}`);
        }

        return chain;
    }
};

// Expose globally
window.UnifiedItemSystem = UnifiedItemSystem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UnifiedItemSystem.init());
} else {
    UnifiedItemSystem.init();
}

console.log('📦 Unified Item System loaded!');

// ═══════════════════════════════════════════════════════════════
// 🏭 PRODUCTION QUEUE SYSTEM - Build queues and progress tracking
// ═══════════════════════════════════════════════════════════════

const ProductionQueueSystem = {
    // Active production queues by facility
    queues: {},

    // Active gathering actions
    activeGathering: null,

    // Buff tracking
    activeBuffs: [],

    // Equipment tracking
    equippedItems: {
        weapon: null,
        offHand: null,
        head: null,
        body: null,
        hands: null,
        feet: null,
        accessory: null,
        tool: null
    },

    // Player skill XP (syncs with game state)
    skillXP: {},

    init() {
        console.log('🏭 Production Queue System initializing...');

        // Initialize skill XP tracking
        for (const skillId of Object.keys(UnifiedItemSystem.skills)) {
            this.skillXP[skillId] = 0;
        }

        // Start the update loop
        this.startUpdateLoop();

        console.log('🏭 Production Queue System ready');
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔨 CRAFTING QUEUE METHODS
    // ═══════════════════════════════════════════════════════════════

    // Add item to production queue
    addToQueue(recipeId, quantity = 1, facility = 'none') {
        const recipe = UnifiedItemSystem.getRecipe(recipeId);
        if (!recipe) {
            console.warn(`🏭 Recipe not found: ${recipeId}`);
            return { success: false, reason: 'Recipe not found' };
        }

        // Use recipe's facility if not specified
        const targetFacility = facility || recipe.facility || 'none';

        // Initialize queue for facility if needed
        if (!this.queues[targetFacility]) {
            this.queues[targetFacility] = [];
        }

        // Create queue entry
        const queueEntry = {
            id: `craft_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
            recipeId,
            quantity,
            quantityCompleted: 0,
            facility: targetFacility,
            progress: 0,
            totalTime: recipe.time,
            startTime: null,
            status: 'queued' // queued, in_progress, paused, completed
        };

        this.queues[targetFacility].push(queueEntry);

        console.log(`🏭 Added ${quantity}x ${recipeId} to ${targetFacility} queue`);

        // Start processing if this is the first item
        if (this.queues[targetFacility].length === 1) {
            this.startNextInQueue(targetFacility);
        }

        return { success: true, queueEntry };
    },

    // Start processing next item in queue
    startNextInQueue(facility) {
        const queue = this.queues[facility];
        if (!queue || queue.length === 0) return;

        const current = queue[0];
        if (current.status !== 'queued') return;

        current.status = 'in_progress';
        current.startTime = Date.now();

        console.log(`🏭 Started crafting: ${current.recipeId}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('craftingStarted', {
                recipeId: current.recipeId,
                facility: facility
            });
        }
    },

    // Update all production queues (called each frame)
    updateQueues(deltaTime) {
        for (const [facility, queue] of Object.entries(this.queues)) {
            if (queue.length === 0) continue;

            const current = queue[0];
            if (current.status !== 'in_progress') continue;

            // Calculate progress
            const elapsed = (Date.now() - current.startTime) / 1000; // seconds
            current.progress = Math.min(elapsed / current.totalTime, 1);

            // Check if complete
            if (current.progress >= 1) {
                this.completeCraftingItem(facility);
            }
        }
    },

    // Complete one crafted item
    completeCraftingItem(facility) {
        const queue = this.queues[facility];
        if (!queue || queue.length === 0) return;

        const current = queue[0];
        const recipe = UnifiedItemSystem.getRecipe(current.recipeId);
        if (!recipe) return;

        // Add items to inventory
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.addItem(recipe.output.item, recipe.output.quantity);
        }

        // Remove inputs from inventory
        if (typeof InventorySystem !== 'undefined') {
            for (const input of recipe.inputs) {
                InventorySystem.removeItem(input.item, input.quantity);
            }
        }

        // Award skill XP
        if (recipe.skillGain) {
            this.addSkillXP(recipe.skillType, recipe.skillGain);
        }

        current.quantityCompleted++;

        console.log(`🏭 Crafted: ${recipe.output.quantity}x ${recipe.output.item}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('craftingCompleted', {
                recipeId: current.recipeId,
                itemId: recipe.output.item,
                quantity: recipe.output.quantity
            });
        }

        // Check if all quantity complete
        if (current.quantityCompleted >= current.quantity) {
            queue.shift(); // Remove from queue
            this.startNextInQueue(facility); // Start next
        } else {
            // Reset for next item
            current.progress = 0;
            current.startTime = Date.now();
        }
    },

    // Cancel crafting item
    cancelCrafting(queueId) {
        for (const [facility, queue] of Object.entries(this.queues)) {
            const index = queue.findIndex(q => q.id === queueId);
            if (index !== -1) {
                const removed = queue.splice(index, 1)[0];
                console.log(`🏭 Cancelled: ${removed.recipeId}`);

                if (index === 0 && queue.length > 0) {
                    this.startNextInQueue(facility);
                }
                return true;
            }
        }
        return false;
    },

    // Get queue status for a facility
    getQueueStatus(facility) {
        const queue = this.queues[facility] || [];
        return {
            facility,
            items: queue.length,
            current: queue[0] || null,
            queue: [...queue]
        };
    },

    // Get all queue statuses
    getAllQueueStatuses() {
        const statuses = {};
        for (const facility of Object.keys(this.queues)) {
            statuses[facility] = this.getQueueStatus(facility);
        }
        return statuses;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎒 GATHERING METHODS
    // ═══════════════════════════════════════════════════════════════

    // Start gathering action
    startGathering(actionId) {
        if (this.activeGathering) {
            return { success: false, reason: 'Already gathering' };
        }

        const action = UnifiedItemSystem.gatheringActions[actionId];
        if (!action) {
            return { success: false, reason: 'Action not found' };
        }

        // Check requirements
        const skillLevel = this.getSkillLevel(action.skillType);
        const equippedTool = this.equippedItems.tool;

        const canGather = UnifiedItemSystem.canGather(
            actionId,
            equippedTool,
            this.getSkillLevels()
        );

        if (!canGather.canGather) {
            return { success: false, reason: canGather.reason };
        }

        // Calculate time with bonuses
        const gatherTime = UnifiedItemSystem.calculateGatherTime(
            actionId,
            equippedTool,
            this.getPerkBonuses()
        );

        this.activeGathering = {
            actionId,
            action,
            startTime: Date.now(),
            totalTime: gatherTime * 1000, // Convert to ms
            progress: 0
        };

        console.log(`🎒 Started gathering: ${action.name} (${gatherTime}s)`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('gatheringStarted', {
                actionId,
                action: action.name,
                duration: gatherTime
            });
        }

        return { success: true, duration: gatherTime };
    },

    // Update gathering progress
    updateGathering() {
        if (!this.activeGathering) return;

        const elapsed = Date.now() - this.activeGathering.startTime;
        this.activeGathering.progress = Math.min(elapsed / this.activeGathering.totalTime, 1);

        if (this.activeGathering.progress >= 1) {
            this.completeGathering();
        }
    },

    // Complete gathering action
    completeGathering() {
        if (!this.activeGathering) return;

        const { actionId, action } = this.activeGathering;

        // Calculate yield with bonuses
        const yield_ = UnifiedItemSystem.calculateGatherYield(
            actionId,
            this.equippedItems.tool,
            this.getSkillLevel(action.skillType),
            this.getPerkBonuses()
        );

        // Random amount between min and max
        const amount = Math.floor(Math.random() * (yield_.max - yield_.min + 1)) + yield_.min;

        // Add to inventory
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.addItem(action.outputItem, amount);
        }

        // Award skill XP
        if (action.skillGain) {
            this.addSkillXP(action.skillType, action.skillGain);
        }

        // Reduce tool durability
        if (this.equippedItems.tool) {
            this.reduceDurability('tool', 1);
        }

        console.log(`🎒 Gathered: ${amount}x ${action.outputItem}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('gatheringCompleted', {
                actionId,
                itemId: action.outputItem,
                quantity: amount
            });
        }

        this.activeGathering = null;
    },

    // Cancel gathering
    cancelGathering() {
        if (this.activeGathering) {
            console.log(`🎒 Cancelled gathering: ${this.activeGathering.action.name}`);
            this.activeGathering = null;
            return true;
        }
        return false;
    },

    // Get gathering progress
    getGatheringProgress() {
        if (!this.activeGathering) return null;
        return {
            actionId: this.activeGathering.actionId,
            action: this.activeGathering.action,
            progress: this.activeGathering.progress,
            timeRemaining: Math.max(0, this.activeGathering.totalTime - (Date.now() - this.activeGathering.startTime)) / 1000
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚔️ EQUIPMENT METHODS
    // ═══════════════════════════════════════════════════════════════

    // Equip an item
    equipItem(itemId) {
        const meta = UnifiedItemSystem.getItemMetadata(itemId);
        if (!meta || meta.actionType !== 'equip') {
            return { success: false, reason: 'Item cannot be equipped' };
        }

        const slot = meta.equipSlot;
        if (!slot) {
            return { success: false, reason: 'No equipment slot defined' };
        }

        // Check if item is in inventory
        if (typeof InventorySystem !== 'undefined') {
            const hasItem = InventorySystem.getItemCount(itemId) > 0;
            if (!hasItem) {
                return { success: false, reason: 'Item not in inventory' };
            }
        }

        // Unequip current item in slot
        const previousItem = this.equippedItems[slot];
        if (previousItem) {
            this.unequipItem(slot);
        }

        // Equip new item
        this.equippedItems[slot] = itemId;

        // Remove from inventory
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.removeItem(itemId, 1);
        }

        console.log(`⚔️ Equipped: ${itemId} in ${slot}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('itemEquipped', { itemId, slot });
        }

        return { success: true, previousItem };
    },

    // Unequip an item
    unequipItem(slot) {
        const itemId = this.equippedItems[slot];
        if (!itemId) {
            return { success: false, reason: 'Nothing equipped in slot' };
        }

        // Add back to inventory
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.addItem(itemId, 1);
        }

        this.equippedItems[slot] = null;

        console.log(`⚔️ Unequipped: ${itemId} from ${slot}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('itemUnequipped', { itemId, slot });
        }

        return { success: true, itemId };
    },

    // Get all equipped items
    getEquippedItems() {
        return { ...this.equippedItems };
    },

    // Get total equipment bonuses
    getEquipmentBonuses() {
        const totals = {
            attack: 0,
            defense: 0,
            critChance: 0,
            blockChance: 0,
            armorPenetration: 0,
            range: 0,
            carryBonus: 0,
            speedPenalty: 0,
            gatherBonus: {},
            craftBonus: {},
            priceDiscount: 0,
            speedBonus: 0
        };

        for (const [slot, itemId] of Object.entries(this.equippedItems)) {
            if (!itemId) continue;

            const bonuses = UnifiedItemSystem.getEquipmentBonuses(itemId);

            // Numeric bonuses
            for (const key of ['attack', 'defense', 'critChance', 'blockChance', 'armorPenetration', 'range', 'carryBonus', 'speedPenalty', 'priceDiscount', 'speedBonus']) {
                if (bonuses[key]) {
                    totals[key] += bonuses[key];
                }
            }

            // Gather bonuses (by skill type)
            if (bonuses.gatherBonus) {
                for (const [skill, bonus] of Object.entries(bonuses.gatherBonus)) {
                    totals.gatherBonus[skill] = (totals.gatherBonus[skill] || 1) * bonus;
                }
            }

            // Craft bonuses (by skill type)
            if (bonuses.craftBonus) {
                for (const [skill, bonus] of Object.entries(bonuses.craftBonus)) {
                    totals.craftBonus[skill] = (totals.craftBonus[skill] || 1) * bonus;
                }
            }
        }

        return totals;
    },

    // Reduce durability on equipped item
    reduceDurability(slot, amount = 1) {
        const itemId = this.equippedItems[slot];
        if (!itemId) return;

        // For now just log - full durability tracking would need item instance data
        console.log(`🔧 Durability reduced on ${itemId}: -${amount}`);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧪 CONSUMABLE & BUFF METHODS
    // ═══════════════════════════════════════════════════════════════

    // Use a consumable item
    useConsumable(itemId) {
        const meta = UnifiedItemSystem.getItemMetadata(itemId);
        if (!meta || meta.actionType !== 'use') {
            return { success: false, reason: 'Item cannot be used' };
        }

        // Check if item is in inventory
        if (typeof InventorySystem !== 'undefined') {
            const hasItem = InventorySystem.getItemCount(itemId) > 0;
            if (!hasItem) {
                return { success: false, reason: 'Item not in inventory' };
            }
        }

        // Check cooldown
        const existingBuff = this.activeBuffs.find(b => b.sourceItem === itemId);
        if (existingBuff && meta.cooldown) {
            return { success: false, reason: 'Item is on cooldown' };
        }

        // Apply effects
        const result = UnifiedItemSystem.applyConsumableEffect(itemId, {});

        // Apply immediate effects to game state
        if (result.effects && typeof game !== 'undefined' && game.player) {
            if (result.effects.hunger) game.player.hunger = Math.min(100, (game.player.hunger || 0) + result.effects.hunger);
            if (result.effects.thirst) game.player.thirst = Math.min(100, (game.player.thirst || 0) + result.effects.thirst);
            if (result.effects.health) game.player.health = Math.min(game.player.maxHealth || 100, (game.player.health || 100) + result.effects.health);
            if (result.effects.happiness) game.player.happiness = Math.min(100, (game.player.happiness || 50) + result.effects.happiness);
            if (result.effects.stamina) game.player.stamina = Math.min(100, (game.player.stamina || 100) + result.effects.stamina);
        }

        // Apply buff if present
        if (result.buff) {
            this.addBuff({
                sourceItem: itemId,
                stat: Object.keys(result.buff).find(k => k !== 'duration'),
                value: result.buff[Object.keys(result.buff).find(k => k !== 'duration')],
                duration: result.buff.duration,
                startTime: Date.now()
            });
        }

        // Remove from inventory
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.removeItem(itemId, 1);
        }

        console.log(`🧪 Used: ${itemId}`);

        // Dispatch event
        if (typeof EventManager !== 'undefined') {
            EventManager.emit('itemUsed', { itemId, effects: result.effects });
        }

        return { success: true, effects: result.effects, buff: result.buff };
    },

    // Add a buff
    addBuff(buff) {
        // Check for existing buff of same type - refresh or stack
        const existingIndex = this.activeBuffs.findIndex(b => b.stat === buff.stat);

        if (existingIndex !== -1) {
            // Refresh duration
            this.activeBuffs[existingIndex].startTime = Date.now();
            this.activeBuffs[existingIndex].duration = Math.max(
                this.activeBuffs[existingIndex].duration,
                buff.duration
            );
        } else {
            this.activeBuffs.push(buff);
        }

        console.log(`✨ Buff added: +${buff.value} ${buff.stat} for ${buff.duration}s`);
    },

    // Update buffs (check expiration)
    updateBuffs() {
        const now = Date.now();
        const expired = [];

        this.activeBuffs = this.activeBuffs.filter(buff => {
            const elapsed = (now - buff.startTime) / 1000;
            if (elapsed >= buff.duration) {
                expired.push(buff);
                return false;
            }
            return true;
        });

        for (const buff of expired) {
            console.log(`✨ Buff expired: ${buff.stat}`);
            if (typeof EventManager !== 'undefined') {
                EventManager.emit('buffExpired', buff);
            }
        }
    },

    // Get active buffs
    getActiveBuffs() {
        const now = Date.now();
        return this.activeBuffs.map(buff => ({
            ...buff,
            timeRemaining: Math.max(0, buff.duration - ((now - buff.startTime) / 1000))
        }));
    },

    // Get total buff bonuses
    getBuffBonuses() {
        const bonuses = {};
        for (const buff of this.activeBuffs) {
            bonuses[buff.stat] = (bonuses[buff.stat] || 0) + buff.value;
        }
        return bonuses;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📊 SKILL METHODS
    // ═══════════════════════════════════════════════════════════════

    // Add XP to a skill
    addSkillXP(skillType, amount) {
        if (!this.skillXP[skillType]) {
            this.skillXP[skillType] = 0;
        }

        const oldLevel = this.getSkillLevel(skillType);
        this.skillXP[skillType] += amount;
        const newLevel = this.getSkillLevel(skillType);

        if (newLevel > oldLevel) {
            console.log(`📊 Level up! ${skillType}: ${oldLevel} → ${newLevel}`);
            if (typeof EventManager !== 'undefined') {
                EventManager.emit('skillLevelUp', {
                    skillType,
                    oldLevel,
                    newLevel
                });
            }
        }
    },

    // Get skill level from XP
    getSkillLevel(skillType) {
        return UnifiedItemSystem.getSkillLevel(this.skillXP[skillType] || 0);
    },

    // Get all skill levels
    getSkillLevels() {
        const levels = {};
        for (const skillType of Object.keys(this.skillXP)) {
            levels[skillType] = this.getSkillLevel(skillType);
        }
        return levels;
    },

    // Get skill progress to next level
    getSkillProgress(skillType) {
        const xp = this.skillXP[skillType] || 0;
        const level = this.getSkillLevel(skillType);
        const currentLevelXP = UnifiedItemSystem.skillXPTable[level];
        const nextLevelXP = UnifiedItemSystem.getXPForNextLevel(level);

        if (nextLevelXP === Infinity) {
            return { level, xp, progress: 1, maxed: true };
        }

        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return { level, xp, xpToNext: nextLevelXP - xp, progress, maxed: false };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔄 UPDATE LOOP
    // ═══════════════════════════════════════════════════════════════

    startUpdateLoop() {
        setInterval(() => {
            this.updateQueues();
            this.updateGathering();
            this.updateBuffs();
        }, 100); // 10 updates per second
    },

    // Get combined perk bonuses from player's selected perks
    getPerkBonuses() {
        const bonuses = {};

        // Check if game and player perks exist
        if (typeof game === 'undefined' || !game.player || !game.player.perks) {
            return bonuses;
        }

        const perksDB = window.perks || {};

        // Combine effects from all player perks
        game.player.perks.forEach(perkIdOrObj => {
            const perkId = typeof perkIdOrObj === 'object' ? perkIdOrObj.id : perkIdOrObj;
            const perk = perksDB[perkId];

            if (perk && perk.effects) {
                // Add positive effects
                Object.entries(perk.effects).forEach(([key, value]) => {
                    bonuses[key] = (bonuses[key] || 0) + value;
                });
            }

            if (perk && perk.negativeEffects) {
                // Add negative effects (they're stored as positive values, apply as penalties)
                Object.entries(perk.negativeEffects).forEach(([key, value]) => {
                    bonuses[key] = (bonuses[key] || 0) - value;
                });
            }
        });

        return bonuses;
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            queues: this.queues,
            equippedItems: this.equippedItems,
            activeBuffs: this.activeBuffs,
            skillXP: this.skillXP
        };
    },

    loadSaveData(data) {
        if (data.queues) this.queues = data.queues;
        if (data.equippedItems) this.equippedItems = data.equippedItems;
        if (data.activeBuffs) this.activeBuffs = data.activeBuffs;
        if (data.skillXP) this.skillXP = data.skillXP;
        console.log('🏭 Production Queue System loaded from save');
    }
};

// Expose globally
window.ProductionQueueSystem = ProductionQueueSystem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => ProductionQueueSystem.init(), 100);
    });
} else {
    setTimeout(() => ProductionQueueSystem.init(), 100);
}

console.log('🏭 Production Queue System loaded!');
