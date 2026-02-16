// ═══════════════════════════════════════════════════════════════
// PROPERTY TYPES - the blueprint of ownership in shadows
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyTypes = {
    // property types - various flavors of ownership
    types: {
        house: {
            id: 'house',
            name: 'House',
            description: 'A basic residence providing storage and rest.',
            basePrice: 1000,
            baseIncome: 5,
            maintenanceCost: 2,
            storageBonus: 50,
            restBonus: true,
            tier: 1,
            upgradeTo: 'cottage',
            icon: '🏠'
        },
        cottage: {
            id: 'cottage',
            name: 'Cottage',
            description: 'A cozy upgraded home with a small crafting area.',
            basePrice: 3000,
            baseIncome: 10,
            maintenanceCost: 5,
            storageBonus: 100,
            restBonus: true,
            tier: 2,
            upgradeTo: 'manor',
            upgradeFrom: 'house',
            craftingStation: true,
            icon: '🏡'
        },
        manor: {
            id: 'manor',
            name: 'Manor',
            description: 'A grand residence with servant quarters and workshop.',
            basePrice: 8000,
            baseIncome: 25,
            maintenanceCost: 15,
            storageBonus: 250,
            restBonus: true,
            tier: 3,
            upgradeTo: 'estate',
            upgradeFrom: 'cottage',
            craftingStation: true,
            workerSlots: 2,
            reputationBonus: 1,
            icon: '🏰'
        },
        estate: {
            id: 'estate',
            name: 'Estate',
            description: 'A sprawling estate with full staff quarters, workshop, and prestige.',
            basePrice: 20000,
            baseIncome: 60,
            maintenanceCost: 35,
            storageBonus: 500,
            restBonus: true,
            tier: 4,
            upgradeFrom: 'manor',
            craftingStation: true,
            workerSlots: 4,
            reputationBonus: 3,
            icon: '🏯'
        },
        shop: {
            id: 'shop',
            name: 'Shop',
            description: 'A small retail space for selling goods.',
            basePrice: 2500,
            baseIncome: 15,
            maintenanceCost: 8,
            storageBonus: 100,
            merchantSlots: 1,
            icon: '🏪'
        },
        warehouse: {
            id: 'warehouse',
            name: 'Warehouse',
            description: 'Large storage facility for goods and materials.',
            basePrice: 4000,
            baseIncome: 8,
            maintenanceCost: 15,
            storageBonus: 500,
            icon: '🏭'
        },
        farm: {
            id: 'farm',
            name: 'Farm',
            description: 'Agricultural land that produces food and resources.',
            basePrice: 3000,
            baseIncome: 20,
            maintenanceCost: 10,
            production: { food: 5, grain: 3 },
            workerSlots: 3,
            icon: '🌾'
        },
        mine: {
            id: 'mine',
            name: 'Mine',
            description: 'Mining operation that extracts valuable resources.',
            basePrice: 8000,
            baseIncome: 25,
            maintenanceCost: 20,
            production: { stone: 8, iron_ore: 3, coal: 5 },
            workerSlots: 5,
            icon: '⛏️'
        },
        tavern: {
            id: 'tavern',
            name: 'Tavern',
            description: 'Public house that generates income from patrons.',
            basePrice: 5000,
            baseIncome: 30,
            maintenanceCost: 12,
            storageBonus: 80,
            merchantSlots: 2,
            reputationBonus: 1,
            icon: '🍺'
        },
        market_stall: {
            id: 'market_stall',
            name: 'Market Stall',
            description: 'Small stall for trading goods in markets.',
            basePrice: 800,
            baseIncome: 10,
            maintenanceCost: 3,
            merchantSlots: 1,
            icon: '🏪'
        },
        craftshop: {
            id: 'craftshop',
            name: 'Craftshop',
            description: 'Workshop for crafting and selling goods.',
            basePrice: 3500,
            baseIncome: 18,
            maintenanceCost: 10,
            production: {},
            workerSlots: 2,
            icon: '🔨'
        },
        vault: {
            id: 'vault',
            name: 'Vault',
            description: 'Heavily fortified storage for gold and valuables. Protects against theft.',
            basePrice: 10000,
            baseIncome: 0,
            maintenanceCost: 25,
            storageBonus: 200,
            goldCapacity: 50000,
            theftProtection: 0.9,
            icon: '🏦'
        }
    },

    // property upgrades - make your property less terrible
    upgrades: {
        expansion: {
            id: 'expansion',
            name: 'Expansion',
            description: 'Increases property size and capacity.',
            costMultiplier: 0.5,
            effects: { storageBonus: 1.5, incomeBonus: 1.2 },
            icon: '📏'
        },
        security: {
            id: 'security',
            name: 'Security',
            description: 'Reduces maintenance costs and damage risk.',
            costMultiplier: 0.3,
            effects: { maintenanceReduction: 0.3, damageReduction: 0.5 },
            icon: '🔒'
        },
        luxury: {
            id: 'luxury',
            name: 'Luxury',
            description: 'Increases income and reputation.',
            costMultiplier: 0.8,
            effects: { incomeBonus: 1.4, reputationBonus: 2 },
            icon: '✨'
        },
        efficiency: {
            id: 'efficiency',
            name: 'Efficiency',
            description: 'Reduces maintenance costs and increases production.',
            costMultiplier: 0.4,
            effects: { maintenanceReduction: 0.2, productionBonus: 1.3 },
            icon: '⚡'
        }
    },

    // construction times in game minutes
    constructionTimes: {
        house: 3 * 24 * 60,        // 3 days
        cottage: 5 * 24 * 60,      // 5 days (upgrade from house)
        manor: 10 * 24 * 60,       // 10 days (upgrade from cottage)
        estate: 21 * 24 * 60,      // 21 days (upgrade from manor)
        market_stall: 1 * 24 * 60, // 1 day
        shop: 5 * 24 * 60,         // 5 days
        warehouse: 7 * 24 * 60,    // 7 days
        farm: 10 * 24 * 60,        // 10 days
        tavern: 7 * 24 * 60,       // 7 days
        craftshop: 5 * 24 * 60,    // 5 days
        mine: 14 * 24 * 60,        // 14 days
        vault: 21 * 24 * 60        // 21 days - secure construction takes time
    },

    // materials needed to build each property type
    buildingMaterials: {
        house: { wood: 20, stone: 10 },
        cottage: { wood: 30, stone: 20, furniture: 5 },
        manor: { wood: 60, stone: 50, iron: 10, furniture: 15 },
        estate: { wood: 100, stone: 80, iron: 25, furniture: 30, steel: 10 },
        market_stall: { wood: 10 },
        shop: { wood: 30, stone: 20, iron: 5 },
        warehouse: { wood: 50, stone: 40, iron: 10 },
        farm: { wood: 40, stone: 15, tools: 5 },
        tavern: { wood: 35, stone: 25, iron: 5, furniture: 10 },
        craftshop: { wood: 25, stone: 20, iron: 15, tools: 10 },
        mine: { wood: 60, stone: 30, iron: 30, tools: 20 },
        vault: { stone: 100, iron: 50, steel: 20, tools: 15 }
    },

    // production limits per property type
    productionLimits: {
        farm: { food: 20, grain: 15 },
        mine: { stone: 30, iron_ore: 15, coal: 20 },
        craftshop: { tools: 10, weapons: 5 },
        tavern: { ale: 25, food: 15 },
        warehouse: {},
        shop: {},
        house: {},
        cottage: {},
        manor: {},
        estate: {},
        market_stall: {},
        vault: {}
    },

    // properties available by location type
    locationProperties: {
        village: ['house', 'cottage', 'farm', 'market_stall'],
        town: ['house', 'cottage', 'manor', 'shop', 'warehouse', 'tavern', 'craftshop'],
        city: ['house', 'cottage', 'manor', 'estate', 'shop', 'warehouse', 'tavern', 'craftshop', 'mine', 'vault']
    },

    // upgrade restrictions by property type
    upgradeRestrictions: {
        efficiency: ['farm', 'mine', 'craftshop', 'tavern'],
        luxury: ['shop', 'tavern', 'warehouse', 'manor', 'estate'],
        expansion: ['house', 'cottage', 'manor', 'estate', 'shop', 'warehouse', 'farm', 'mine', 'tavern', 'craftshop', 'vault'],
        security: ['shop', 'warehouse', 'mine', 'tavern', 'vault', 'manor', 'estate']
    },

    // getters for compatibility with PropertySystem
    get(typeId) {
        // validate typeId is a string to prevent object key coercion bugs
        if (typeof typeId !== 'string') return null;
        return this.types[typeId] || null;
    },

    getUpgrade(upgradeId) {
        // validate upgradeId is a string
        if (typeof upgradeId !== 'string') return null;
        return this.upgrades[upgradeId] || null;
    },

    getConstructionTime(typeId) {
        return this.constructionTimes[typeId] || 5 * 24 * 60;
    },

    getBuildingMaterials(typeId) {
        return this.buildingMaterials[typeId] || {};
    },

    getProductionLimits(typeId) {
        return this.productionLimits[typeId] || {};
    },

    getLocationProperties(locationType) {
        return this.locationProperties[locationType] || this.locationProperties.village;
    },

    isUpgradeAvailable(upgradeId, propertyTypeId) {
        const allowed = this.upgradeRestrictions[upgradeId];
        return !allowed || allowed.includes(propertyTypeId);
    }
};

// expose to global scope for compatibility
window.PropertyTypes = PropertyTypes;
