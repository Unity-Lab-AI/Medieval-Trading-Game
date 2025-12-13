// 
// CRAFTING ECONOMY SYSTEM - capitalism through creation
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const CraftingSystem = {
    //  Production facilities - where the magic happens
    facilities: {
        NONE: 'none',           // No facility needed (hand crafting)
        FARM: 'farm',           // Growing crops
        MINE: 'mine',           // Mining ores
        FOREST: 'forest',       // Logging wood
        FISHERY: 'fishery',     // Catching fish
        SAWMILL: 'sawmill',     // Wood → Planks
        SMITHY: 'smithy',       // Ore → Metal goods
        BAKERY: 'bakery',       // Flour → Bread
        BREWERY: 'brewery',     // Grain → Ale/Beer
        KITCHEN: 'kitchen',     // Cooking meals
        WORKSHOP: 'workshop',   // Crafting tools
        MILL: 'mill',           // Grain → Flour
        SMELTER: 'smelter',     // Ore → Bars
        MINT: 'mint',           // Gold ore → Coins
        TANNERY: 'tannery',     // Hide → Leather
        WEAVER: 'weaver',       // Wool/Flax → Cloth
        TAILOR: 'tailor',       // Cloth → Clothes
        ARMORY: 'armory'        // Metal → Armor/Weapons
    },

    // Item tiers (production complexity)
    tiers: {
        T0_RAW: 0,              // Raw resources (gathered/harvested)
        T1_PROCESSED: 1,        // First processing step
        T2_REFINED: 2,          // Second processing step
        T3_FINISHED: 3          // Final products
    },

    // Crafting recipes - Defines how items are made
    recipes: {
        // === TIER 1: Basic Processing ===

        // Wood processing
        planks: {
            output: { item: 'planks', quantity: 4 },
            inputs: [
                { item: 'timber', quantity: 1 }
            ],
            facility: 'sawmill',
            time: 5, // minutes
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        // Mining/Smelting
        iron_bar: {
            output: { item: 'iron_bar', quantity: 1 },
            inputs: [
                { item: 'iron_ore', quantity: 2 }
            ],
            facility: 'smelter',
            time: 10,
            tier: 1,
            skillRequired: 0,
            skillGain: 2
        },

        copper_bar: {
            output: { item: 'copper_bar', quantity: 1 },
            inputs: [
                { item: 'copper_ore', quantity: 2 }
            ],
            facility: 'smelter',
            time: 8,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        // Steel requires iron + coal (advanced smelting)
        steel_bar: {
            output: { item: 'steel_bar', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'coal', quantity: 3 }
            ],
            facility: 'smelter',
            time: 20,
            tier: 2,
            skillRequired: 5,
            skillGain: 4
        },

        gold_coins: {
            output: { item: 'gold', quantity: 100 },
            inputs: [
                { item: 'gold_ore', quantity: 1 }
            ],
            facility: 'mint',
            time: 15,
            tier: 1,
            skillRequired: 5,
            skillGain: 3
        },

        // Textile processing
        linen: {
            output: { item: 'linen', quantity: 2 },
            inputs: [
                { item: 'flax', quantity: 3 }
            ],
            facility: 'weaver',
            time: 10,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        wool_cloth: {
            output: { item: 'wool_cloth', quantity: 2 },
            inputs: [
                { item: 'wool', quantity: 3 }
            ],
            facility: 'weaver',
            time: 12,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        leather: {
            output: { item: 'leather', quantity: 1 },
            inputs: [
                { item: 'hide', quantity: 2 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'tannery',
            time: 20,
            tier: 1,
            skillRequired: 0,
            skillGain: 2
        },

        // Food processing
        flour: {
            output: { item: 'flour', quantity: 2 },
            inputs: [
                { item: 'wheat', quantity: 3 }
            ],
            facility: 'mill',
            time: 5,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        bread: {
            output: { item: 'bread', quantity: 3 },
            inputs: [
                { item: 'flour', quantity: 2 },
                { item: 'water', quantity: 1 }
            ],
            facility: 'bakery',
            time: 15,
            tier: 1,
            skillRequired: 0,
            skillGain: 2
        },

        ale: {
            output: { item: 'ale', quantity: 4 },
            inputs: [
                { item: 'wheat', quantity: 3 },
                { item: 'water', quantity: 2 }
            ],
            facility: 'brewery',
            time: 30,
            tier: 1,
            skillRequired: 2,
            skillGain: 2
        },

        cheese: {
            output: { item: 'cheese', quantity: 2 },
            inputs: [
                { item: 'milk', quantity: 4 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 40,
            tier: 1,
            skillRequired: 1,
            skillGain: 2
        },

        // === TIER 2: Advanced Processing ===

        // Weapons
        iron_sword: {
            output: { item: 'iron_sword', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 3 },
                { item: 'timber', quantity: 1 }
            ],
            facility: 'smithy',
            time: 30,
            tier: 2,
            skillRequired: 5,
            skillGain: 5
        },

        steel_sword: {
            output: { item: 'steel_sword', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 3 },
                { item: 'timber', quantity: 1 },
                { item: 'leather', quantity: 1 }
            ],
            facility: 'armory',
            time: 45,
            tier: 2,
            skillRequired: 15,
            skillGain: 8
        },

        // Armor
        leather_armor: {
            output: { item: 'leather_armor', quantity: 1 },
            inputs: [
                { item: 'leather', quantity: 8 },
                { item: 'thread', quantity: 10 }
            ],
            facility: 'workshop',
            time: 40,
            tier: 2,
            skillRequired: 5,
            skillGain: 5
        },

        iron_armor: {
            output: { item: 'iron_armor', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 10 },
                { item: 'leather', quantity: 3 }
            ],
            facility: 'armory',
            time: 60,
            tier: 2,
            skillRequired: 10,
            skillGain: 8
        },

        // Clothing
        simple_clothes: {
            output: { item: 'simple_clothes', quantity: 1 },
            inputs: [
                { item: 'linen', quantity: 3 },
                { item: 'thread', quantity: 5 }
            ],
            facility: 'tailor',
            time: 20,
            tier: 2,
            skillRequired: 0,
            skillGain: 2
        },

        fine_clothes: {
            output: { item: 'fine_clothes', quantity: 1 },
            inputs: [
                { item: 'silk', quantity: 2 },
                { item: 'thread', quantity: 5 },
                { item: 'dye', quantity: 1 }
            ],
            facility: 'tailor',
            time: 40,
            tier: 2,
            skillRequired: 10,
            skillGain: 5
        },

        // Food combinations
        stew: {
            output: { item: 'stew', quantity: 4 },
            inputs: [
                { item: 'meat', quantity: 2 },
                { item: 'vegetables', quantity: 3 },
                { item: 'water', quantity: 2 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 25,
            tier: 2,
            skillRequired: 2,
            skillGain: 3
        },

        pie: {
            output: { item: 'pie', quantity: 2 },
            inputs: [
                { item: 'flour', quantity: 2 },
                { item: 'fruits', quantity: 3 },
                { item: 'butter', quantity: 1 }
            ],
            facility: 'bakery',
            time: 30,
            tier: 2,
            skillRequired: 5,
            skillGain: 4
        },

        // Tools
        iron_tools: {
            output: { item: 'iron_tools', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'timber', quantity: 2 }
            ],
            facility: 'smithy',
            time: 25,
            tier: 2,
            skillRequired: 3,
            skillGain: 3
        },

        // === TIER 3: Complex Items ===

        furniture: {
            output: { item: 'furniture', quantity: 1 },
            inputs: [
                { item: 'planks', quantity: 10 },
                { item: 'iron_nails', quantity: 20 },
                { item: 'cloth', quantity: 2 }
            ],
            facility: 'workshop',
            time: 60,
            tier: 3,
            skillRequired: 10,
            skillGain: 10
        },

        jewelry: {
            output: { item: 'jewelry', quantity: 1 },
            inputs: [
                { item: 'gold_bar', quantity: 1 },
                { item: 'gemstone', quantity: 1 }
            ],
            facility: 'workshop',
            time: 45,
            tier: 3,
            skillRequired: 15,
            skillGain: 12
        },

        // === ADDITIONAL TIER 1 RECIPES ===
        thread: {
            output: { item: 'thread', quantity: 5 },
            inputs: [
                { item: 'wool', quantity: 1 }
            ],
            facility: 'none',
            time: 5,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        cloth: {
            output: { item: 'cloth', quantity: 2 },
            inputs: [
                { item: 'linen', quantity: 1 }
            ],
            facility: 'weaver',
            time: 8,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        iron_nails: {
            output: { item: 'iron_nails', quantity: 10 },
            inputs: [
                { item: 'iron_bar', quantity: 1 }
            ],
            facility: 'smithy',
            time: 10,
            tier: 1,
            skillRequired: 2,
            skillGain: 1
        },

        gold_bar: {
            output: { item: 'gold_bar', quantity: 1 },
            inputs: [
                { item: 'gold_ore', quantity: 3 }
            ],
            facility: 'smelter',
            time: 30,
            tier: 1,
            skillRequired: 10,
            skillGain: 5
        },

        // === ADDITIONAL TIER 2 RECIPES ===
        scythe: {
            output: { item: 'scythe', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'timber', quantity: 1 }
            ],
            facility: 'smithy',
            time: 20,
            tier: 2,
            skillRequired: 3,
            skillGain: 3
        },

        fishing_rod: {
            output: { item: 'fishing_rod', quantity: 1 },
            inputs: [
                { item: 'timber', quantity: 1 },
                { item: 'thread', quantity: 5 }
            ],
            facility: 'workshop',
            time: 15,
            tier: 2,
            skillRequired: 1,
            skillGain: 2
        },

        steel_pickaxe: {
            output: { item: 'steel_pickaxe', quantity: 1 },
            inputs: [
                { item: 'steel_bar', quantity: 2 },
                { item: 'timber', quantity: 1 }
            ],
            facility: 'smithy',
            time: 35,
            tier: 2,
            skillRequired: 12,
            skillGain: 6
        },

        simple_clothes: {
            output: { item: 'simple_clothes', quantity: 1 },
            inputs: [
                { item: 'linen', quantity: 3 },
                { item: 'thread', quantity: 5 }
            ],
            facility: 'tailor',
            time: 20,
            tier: 2,
            skillRequired: 0,
            skillGain: 2
        },

        silk_garments: {
            output: { item: 'silk_garments', quantity: 1 },
            inputs: [
                { item: 'silk', quantity: 3 },
                { item: 'thread', quantity: 8 },
                { item: 'dye', quantity: 1 }
            ],
            facility: 'tailor',
            time: 50,
            tier: 2,
            skillRequired: 12,
            skillGain: 6
        },

        noble_cloak: {
            output: { item: 'noble_cloak', quantity: 1 },
            inputs: [
                { item: 'fine_clothes', quantity: 1 },
                { item: 'fur', quantity: 2 },
                { item: 'dye', quantity: 1 }
            ],
            facility: 'tailor',
            time: 60,
            tier: 2,
            skillRequired: 15,
            skillGain: 8
        },

        military_rations: {
            output: { item: 'military_rations', quantity: 5 },
            inputs: [
                { item: 'meat', quantity: 2 },
                { item: 'bread', quantity: 3 },
                { item: 'salt', quantity: 1 }
            ],
            facility: 'kitchen',
            time: 20,
            tier: 2,
            skillRequired: 2,
            skillGain: 2
        },

        bandages: {
            output: { item: 'bandages', quantity: 5 },
            inputs: [
                { item: 'linen', quantity: 1 },
                { item: 'herbs', quantity: 1 }
            ],
            facility: 'none',
            time: 10,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        burlap_sack: {
            output: { item: 'burlap_sack', quantity: 3 },
            inputs: [
                { item: 'flax', quantity: 2 },
                { item: 'thread', quantity: 3 }
            ],
            facility: 'weaver',
            time: 8,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        // === TOOLS AND INSTRUMENTS ===
        lute: {
            output: { item: 'lute', quantity: 1 },
            inputs: [
                { item: 'timber', quantity: 3 },
                { item: 'thread', quantity: 10 }
            ],
            facility: 'workshop',
            time: 40,
            tier: 2,
            skillRequired: 8,
            skillGain: 5
        },

        scales: {
            output: { item: 'scales', quantity: 1 },
            inputs: [
                { item: 'iron_bar', quantity: 2 },
                { item: 'timber', quantity: 1 }
            ],
            facility: 'smithy',
            time: 25,
            tier: 2,
            skillRequired: 5,
            skillGain: 3
        },

        walking_staff: {
            output: { item: 'walking_staff', quantity: 1 },
            inputs: [
                { item: 'timber', quantity: 1 }
            ],
            facility: 'workshop',
            time: 10,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        simple_tools: {
            output: { item: 'simple_tools', quantity: 1 },
            inputs: [
                { item: 'timber', quantity: 2 },
                { item: 'stone', quantity: 3 }
            ],
            facility: 'workshop',
            time: 15,
            tier: 1,
            skillRequired: 0,
            skillGain: 2
        },

        // === WRITING AND SCHOLARLY ITEMS ===
        merchant_ledger: {
            output: { item: 'merchant_ledger', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 20 },
                { item: 'leather', quantity: 1 },
                { item: 'ink', quantity: 1 }
            ],
            facility: 'workshop',
            time: 30,
            tier: 2,
            skillRequired: 5,
            skillGain: 4
        },

        trade_contract: {
            output: { item: 'trade_contract', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 3 },
                { item: 'ink', quantity: 1 },
                { item: 'wax', quantity: 1 }
            ],
            facility: 'none',
            time: 15,
            tier: 1,
            skillRequired: 3,
            skillGain: 2
        },

        tale_scrolls: {
            output: { item: 'tale_scrolls', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 5 },
                { item: 'ink', quantity: 1 }
            ],
            facility: 'none',
            time: 25,
            tier: 2,
            skillRequired: 5,
            skillGain: 3
        },

        old_books: {
            output: { item: 'old_books', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 30 },
                { item: 'leather', quantity: 2 },
                { item: 'ink', quantity: 2 }
            ],
            facility: 'workshop',
            time: 60,
            tier: 3,
            skillRequired: 10,
            skillGain: 8
        },

        wisdom_scrolls: {
            output: { item: 'wisdom_scrolls', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 10 },
                { item: 'ink', quantity: 2 },
                { item: 'wax', quantity: 1 }
            ],
            facility: 'none',
            time: 45,
            tier: 2,
            skillRequired: 12,
            skillGain: 6
        },

        religious_texts: {
            output: { item: 'religious_texts', quantity: 1 },
            inputs: [
                { item: 'parchment', quantity: 25 },
                { item: 'ink', quantity: 3 },
                { item: 'gold_bar', quantity: 1 }
            ],
            facility: 'workshop',
            time: 90,
            tier: 3,
            skillRequired: 15,
            skillGain: 10
        },

        // === RELIGIOUS ITEMS ===
        holy_symbol: {
            output: { item: 'holy_symbol', quantity: 1 },
            inputs: [
                { item: 'silver_bar', quantity: 1 },
                { item: 'gemstone', quantity: 1 }
            ],
            facility: 'workshop',
            time: 30,
            tier: 2,
            skillRequired: 8,
            skillGain: 5
        },

        prayer_beads: {
            output: { item: 'prayer_beads', quantity: 1 },
            inputs: [
                { item: 'timber', quantity: 1 },
                { item: 'thread', quantity: 2 }
            ],
            facility: 'none',
            time: 10,
            tier: 1,
            skillRequired: 0,
            skillGain: 1
        },

        incense: {
            output: { item: 'incense', quantity: 5 },
            inputs: [
                { item: 'herbs', quantity: 3 },
                { item: 'spices', quantity: 1 }
            ],
            facility: 'none',
            time: 15,
            tier: 1,
            skillRequired: 2,
            skillGain: 2
        },

        holy_water: {
            output: { item: 'holy_water', quantity: 3 },
            inputs: [
                { item: 'water', quantity: 3 },
                { item: 'salt', quantity: 1 },
                { item: 'herbs', quantity: 1 }
            ],
            facility: 'none',
            time: 20,
            tier: 1,
            skillRequired: 5,
            skillGain: 2
        },

        // === CLOTHING AND ACCESSORIES ===
        colorful_clothes: {
            output: { item: 'colorful_clothes', quantity: 1 },
            inputs: [
                { item: 'linen', quantity: 3 },
                { item: 'dye', quantity: 3 },
                { item: 'thread', quantity: 5 }
            ],
            facility: 'tailor',
            time: 30,
            tier: 2,
            skillRequired: 6,
            skillGain: 4
        }
    },

    // Resource gathering definitions
    gathering: {
        timber: {
            method: 'logging',
            location: 'forest',
            tool: null, // Can gather bare-handed
            toolBonus: { item: 'axe', multiplier: 3 },
            baseYield: 1,
            time: 10,
            skill: 'woodcutting'
        },

        wheat: {
            method: 'farming',
            location: 'farm',
            tool: null,
            toolBonus: { item: 'scythe', multiplier: 2 },
            baseYield: 3,
            time: 5,
            skill: 'farming',
            seasonal: true
        },

        iron_ore: {
            method: 'mining',
            location: 'mine',
            tool: null,
            toolBonus: { item: 'pickaxe', multiplier: 3 },
            baseYield: 1,
            time: 15,
            skill: 'mining'
        },

        gold_ore: {
            method: 'mining',
            location: 'mine',
            tool: 'pickaxe', // Required
            toolBonus: { item: 'steel_pickaxe', multiplier: 2 },
            baseYield: 1,
            time: 30,
            skill: 'mining',
            rare: true
        },

        fish: {
            method: 'fishing',
            location: 'water',
            tool: null,
            toolBonus: { item: 'fishing_rod', multiplier: 4 },
            baseYield: 1,
            time: 20,
            skill: 'fishing'
        }
    },

    // Economic pricing model
    // Base price calculation: Raw material cost + Processing cost + Profit margin
    calculateItemPrice(itemId) {
        const recipe = this.recipes[itemId];

        if (!recipe) {
            // Raw material - use base gathering cost
            return this.getGatheringCost(itemId);
        }

        // Calculate total input cost
        let inputCost = 0;
        recipe.inputs.forEach(input => {
            const inputPrice = this.calculateItemPrice(input.item);
            inputCost += inputPrice * input.quantity;
        });

        // Add processing cost based on time and facility
        const processingCost = recipe.time * 2; // 2 gold per minute of processing

        // Add profit margin (30% for T1, 40% for T2, 50% for T3)
        const profitMargins = [1.3, 1.4, 1.5, 1.6];
        const margin = profitMargins[recipe.tier] || 1.3;

        return Math.round((inputCost + processingCost) * margin);
    },

    // Base gathering cost (opportunity cost)
    getGatheringCost(itemId) {
        const gathering = this.gathering[itemId];

        if (!gathering) {
            return 10; // Default price for non-gatherable items
        }

        // Cost = Time investment
        const timeCost = gathering.time * 1; // 1 gold per minute of gathering time

        // Rarity modifier
        const rarityBonus = gathering.rare ? 2 : 1;

        return Math.round(timeCost * rarityBonus * gathering.baseYield);
    },

    // Craft an item
    craftItem(recipeId, quantity = 1) {
        const recipe = this.recipes[recipeId];

        if (!recipe) {
            return { success: false, message: 'Recipe not found!' };
        }

        // Check if player has required facility access
        // Check if player has required materials
        // Check if player has required skill
        // This will be implemented in the game logic

        return {
            success: true,
            output: recipe.output,
            time: recipe.time * quantity
        };
    }
};

// Initialize pricing when loaded
window.CraftingSystem = CraftingSystem;
