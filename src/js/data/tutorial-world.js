// ═══════════════════════════════════════════════════════════════
// TUTORIAL WORLD - The Pocket Dimension of Learning
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
//
// This is our isolated training sandbox - 5 locations designed
// specifically to teach noobs without fucking up the main world.
// Price modifiers are rigged to guarantee profitable trades.
// It's basically tutorial on easy mode before the real shit.
// ═══════════════════════════════════════════════════════════════

const TutorialWorld = {
    // ═══════════════════════════════════════════════════════════════
    //  WORLD METADATA - Info About This Pocket Dimension
    // ═══════════════════════════════════════════════════════════════
    regionInfo: {
        id: 'tutorial',
        name: 'Training Grounds',
        description: 'A safe training area where new merchants learn the ways of trade, travel, and combat before entering the real world.',
        isolated: true, // Cannot travel to/from main world directly
        mapBackground: 'tutorial-map-bg.png'
    },

    // ═══════════════════════════════════════════════════════════════
    //  THE MAP - 5 Locations To Learn All The Things
    // ═══════════════════════════════════════════════════════════════
    locations: {
        // ═══════════════════════════════════════════════════════════
        //  TUTORIAL VILLAGE - Where The Journey Begins
        //  Spawn point. Cheap wheat. Meet Elara. Baby's first location.
        // ═══════════════════════════════════════════════════════════
        tutorial_village: {
            id: 'tutorial_village',
            name: 'Tutorial Village',
            region: 'tutorial',
            type: 'village',
            description: 'A peaceful training village where Merchant Elara teaches aspiring traders. The market sells basic goods at low prices - perfect for learning arbitrage.',
            population: 50,
            marketSize: 'small',
            travelCost: { base: 0 }, // Free to leave
            connections: ['tutorial_town', 'tutorial_forest'],
            mapPosition: { x: 75, y: 525 }, // Bottom-left corner - moved 50% closer to edge

            // ALL goods CHEAP here - sell in tutorial_town for profit
            sells: ['bread', 'wheat', 'water', 'vegetables', 'eggs', 'fish', 'meat', 'herbs', 'leather', 'tools', 'rope', 'torch', 'bandages'],
            buys: ['bread', 'wheat', 'water', 'vegetables', 'eggs', 'fish', 'meat', 'herbs', 'leather', 'tools', 'rope', 'torch', 'bandages'],

            // Price modifiers - all goods cheap here (BUY HERE)
            priceModifiers: {
                wheat: 0.5,
                bread: 0.8,
                water: 0.8,
                vegetables: 0.7,
                eggs: 0.8,
                fish: 0.7,
                meat: 0.7,
                herbs: 0.6,
                leather: 0.7,
                tools: 0.8,
                rope: 0.8,
                torch: 0.8,
                bandages: 0.8
            },

            npcs: ['tutorial_guide', 'merchant', 'farmer'],

            // Tutorial-specific flags
            isTutorialLocation: true,
            tutorialPhase: 'start',

            // Exploration config (simple, safe exploration)
            exploration: {
                available: false, // No exploration in starting village
                dungeonId: null
            }
        },

        // ═══════════════════════════════════════════════════════════
        //  TUTORIAL TOWN - Where You SELL The Wheat
        //  180% wheat price = free money. This is where arbitrage pays off.
        // ═══════════════════════════════════════════════════════════
        tutorial_town: {
            id: 'tutorial_town',
            name: 'Tutorial Town',
            region: 'tutorial',
            type: 'town',
            description: 'A bustling market town that imports grain from the countryside. Wheat sells here for premium prices! Trader Marcus teaches the art of the deal.',
            population: 150,
            marketSize: 'medium',
            travelCost: { base: 2 },
            connections: ['tutorial_village', 'tutorial_forest', 'tutorial_arena'],
            mapPosition: { x: 725, y: 525 }, // Bottom-right corner - moved 50% closer to edge

            // ALL goods EXPENSIVE here - sell here for profit
            sells: ['bread', 'wheat', 'water', 'vegetables', 'eggs', 'fish', 'meat', 'herbs', 'leather', 'tools', 'rope', 'torch', 'bandages', 'leather_armor'],
            buys: ['bread', 'wheat', 'water', 'vegetables', 'eggs', 'fish', 'meat', 'herbs', 'leather', 'tools', 'rope', 'torch', 'bandages'],

            // Price modifiers - all goods expensive here (SELL HERE for 10%+ profit)
            priceModifiers: {
                wheat: 1.8,
                bread: 1.3,
                water: 1.2,
                vegetables: 1.5,
                eggs: 1.2,
                fish: 1.4,
                meat: 1.4,
                herbs: 1.5,
                leather: 1.3,
                tools: 1.2,
                rope: 1.2,
                torch: 1.2,
                bandages: 1.2
            },

            npcs: ['tutorial_merchant', 'guard', 'blacksmith'],

            isTutorialLocation: true,
            tutorialPhase: 'trading',

            exploration: {
                available: false,
                dungeonId: null
            }
        },

        // ═══════════════════════════════════════════════════════════
        //  TUTORIAL FOREST - Spooky Trees & Druid Wisdom
        //  Learn exploration, meet the Warden, find herbs. Very chill.
        // ═══════════════════════════════════════════════════════════
        tutorial_forest: {
            id: 'tutorial_forest',
            name: 'Tutorial Forest',
            region: 'tutorial',
            type: 'forest',
            description: 'A peaceful forest on the outskirts of the training grounds. The Forest Warden teaches exploration and prepares travelers for road encounters.',
            population: 10,
            marketSize: 'none',
            travelCost: { base: 3 },
            connections: ['tutorial_village', 'tutorial_town', 'tutorial_arena'],
            mapPosition: { x: 400, y: 280 }, // Center - mystical forest clearing

            sells: ['herbs', 'mushrooms', 'berries', 'wood'],
            buys: ['bread', 'water', 'torch', 'rope'],

            priceModifiers: {
                herbs: 0.6,
                mushrooms: 0.5,
                wood: 0.4
            },

            npcs: ['tutorial_warden', 'herbalist'],

            isTutorialLocation: true,
            tutorialPhase: 'travel',

            // Safe exploration - easy loot, no real danger
            exploration: {
                available: true,
                dungeonId: 'tutorial_forest_dungeon',
                difficulty: 'tutorial',
                rooms: 3,
                lootTable: ['herbs', 'mushrooms', 'bandages', 'small_gold_pouch'],
                enemyChance: 0.2, // Low enemy chance
                possibleEnemies: ['tutorial_dummy'] // Only training dummies
            }
        },

        // ═══════════════════════════════════════════════════════════
        //  TUTORIAL ARENA - The School Of Getting Your Ass Kicked
        //  Dane lives here. Training dummies die here. Git gud here.
        // ═══════════════════════════════════════════════════════════
        tutorial_arena: {
            id: 'tutorial_arena',
            name: 'Tutorial Arena',
            region: 'tutorial',
            type: 'arena',
            description: 'The combat training grounds where Combat Trainer Dane teaches the art of battle. Practice against training dummies and sparring partners before facing real danger.',
            population: 20,
            marketSize: 'small',
            travelCost: { base: 2 },
            connections: ['tutorial_town', 'tutorial_forest', 'tutorial_dungeon'],
            mapPosition: { x: 725, y: 60 }, // Top-right corner - moved 50% closer to edge

            // Combat supplies
            sells: ['iron_sword', 'wooden_shield', 'leather_armor', 'health_potion', 'bandages'],
            buys: ['monster_parts', 'trophy', 'old_weapons'],

            priceModifiers: {
                health_potion: 0.7, // Cheap potions for training
                bandages: 0.5,
                iron_sword: 0.8
            },

            npcs: ['tutorial_trainer', 'weapon_vendor', 'healer'],

            isTutorialLocation: true,
            tutorialPhase: 'combat',

            // Arena has practice fights, not exploration
            exploration: {
                available: false,
                dungeonId: null
            },

            // Special arena features
            arenaFeatures: {
                trainingDummies: true,
                sparringPartners: true,
                healingStation: true // Free healing after fights
            }
        },

        // ═══════════════════════════════════════════════════════════
        //  TUTORIAL DUNGEON - The Final Exam From Hell
        //  Beat the boss, prove you're not a noob anymore. Graduation!
        // ═══════════════════════════════════════════════════════════
        tutorial_dungeon: {
            id: 'tutorial_dungeon',
            name: 'Tutorial Dungeon',
            region: 'tutorial',
            type: 'dungeon',
            description: 'An old bandit hideout converted into a training dungeon. The Tutorial Bandit Chief awaits at the end - defeat them to prove your worth!',
            population: 0,
            marketSize: 'none',
            travelCost: { base: 3 },
            connections: ['tutorial_arena'],
            mapPosition: { x: 75, y: 60 }, // Top-left corner - moved 50% closer to edge

            sells: [], // No market in dungeon
            buys: [],

            npcs: [], // Enemies only

            isTutorialLocation: true,
            tutorialPhase: 'boss',

            // Dungeon exploration config
            exploration: {
                available: true,
                dungeonId: 'tutorial_bandit_lair',
                difficulty: 'tutorial',
                rooms: 5,
                lootTable: ['gold_coins', 'health_potion', 'bandages', 'iron_sword', 'leather_armor'],
                enemyChance: 0.5,
                possibleEnemies: ['tutorial_fighter', 'tutorial_brute'],
                boss: {
                    id: 'tutorial_boss',
                    name: 'Tutorial Bandit Chief',
                    requiredForCompletion: false // Can skip for tutorial, quest handles it
                }
            },

            // Dungeon-specific config
            dungeonConfig: {
                lighting: 'dim',
                ambience: 'cave',
                allowRetreat: true, // Can escape if things go bad
                respawnOnDeath: true // Don't game-over in tutorial
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  TRAVEL ROUTES - The Roads Between Locations
    //  Mostly safe, designed to teach travel without killing noobs
    // ═══════════════════════════════════════════════════════════════
    routes: {
        village_to_town: {
            from: 'tutorial_village',
            to: 'tutorial_town',
            distance: 2,
            travelTime: 30, // 30 minutes game time
            encounterChance: 0, // No random encounters on first route
            terrain: 'road',
            description: 'A well-maintained road connecting the village to town.'
        },
        village_to_forest: {
            from: 'tutorial_village',
            to: 'tutorial_forest',
            distance: 3,
            travelTime: 45,
            encounterChance: 0.1, // Slight chance for scripted encounter
            terrain: 'path',
            description: 'A forest path winding through the trees.'
        },
        town_to_forest: {
            from: 'tutorial_town',
            to: 'tutorial_forest',
            distance: 2,
            travelTime: 30,
            encounterChance: 0,
            terrain: 'road',
            description: 'A merchant road skirting the forest edge.'
        },
        forest_to_arena: {
            from: 'tutorial_forest',
            to: 'tutorial_arena',
            distance: 2,
            travelTime: 30,
            encounterChance: 0,
            terrain: 'path',
            description: 'A path leading to the training grounds.'
        },
        town_to_arena: {
            from: 'tutorial_town',
            to: 'tutorial_arena',
            distance: 1,
            travelTime: 15,
            encounterChance: 0,
            terrain: 'road',
            description: 'A short road to the arena.'
        },
        arena_to_dungeon: {
            from: 'tutorial_arena',
            to: 'tutorial_dungeon',
            distance: 2,
            travelTime: 30,
            encounterChance: 0.3, // Might meet a bandit scout
            scriptedEncounter: 'tutorial_bandit_scout', // Optional warning encounter
            terrain: 'path',
            description: 'A dark path leading to the old bandit hideout.'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  HELPER FUNCTIONS - The API for This Pocket Dimension
    // ═══════════════════════════════════════════════════════════════

    // Dump all locations as an array
    getAllLocations() {
        return Object.values(this.locations);
    },

    // Yoink a location by ID
    getLocation(locationId) {
        return this.locations[locationId] || null;
    },

    // Where does the noob spawn? Right here.
    getStartingLocation() {
        return this.locations.tutorial_village;
    },

    // What can you travel to from here?
    getConnections(locationId) {
        const location = this.getLocation(locationId);
        if (!location) return [];
        return location.connections.map(id => this.getLocation(id)).filter(Boolean);
    },

    // Get the route info between two places
    getRoute(fromId, toId) {
        const routeKey = `${fromId}_to_${toId}`;
        const reverseKey = `${toId}_to_${fromId}`;
        return this.routes[routeKey] || this.routes[reverseKey] || null;
    },

    // Is this one of our tutorial locations?
    isTutorialLocation(locationId) {
        const location = this.getLocation(locationId);
        return location ? location.isTutorialLocation === true : false;
    },

    // What's the price multiplier for this item here? (rigged prices lol)
    getPriceModifier(locationId, itemId) {
        const location = this.getLocation(locationId);
        if (!location || !location.priceModifiers) return 1.0;
        return location.priceModifiers[itemId] || 1.0;
    },

    // Can you walk from A to B? Check their connections.
    canTravel(fromId, toId) {
        const from = this.getLocation(fromId);
        if (!from) return false;
        return from.connections.includes(toId);
    }
};

// ═══════════════════════════════════════════════════════════════
//  GLOBAL ACCESS - Share This Pocket Dimension With Everyone
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.TutorialWorld = TutorialWorld;
}

// CommonJS export for the module nerds
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialWorld;
}
