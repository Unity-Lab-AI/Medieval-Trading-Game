// ═══════════════════════════════════════════════════════════════
// NPC ENCOUNTER SYSTEM - strangers with opinions to share
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const NPCEncounterSystem = {
    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION - tuning the chaos frequency
    // ═══════════════════════════════════════════════════════════

    config: {
        // encounter chances (0-1)
        travelEncounterChance: 0.3, // 30% chance per travel
        locationArrivalChance: 0.2, // 20% chance when arriving at location
        randomEventChance: 0.15, // 15% chance during random events

        // cooldown to prevent spam (in minutes)
        encounterCooldown: 30,

        // maximum active encounters
        maxActiveEncounters: 1
    },

    // ═══════════════════════════════════════════════════════════
    // state - tracking encounters and cooldowns
    // ═══════════════════════════════════════════════════════════

    lastEncounterTime: 0,
    activeEncounters: [],
    encounterHistory: [],

    // ═══════════════════════════════════════════════════════════
    // encounter types - different kinds of random NPCs
    // ═══════════════════════════════════════════════════════════

    encounterTypes: {
        // the road is never safe - strangers lurk in shadow
        road: {
            friendly: [
                { type: 'traveler', weight: 30, minRep: -50 },
                { type: 'courier', weight: 15, minRep: -20 },
                { type: 'merchant', weight: 20, minRep: 0 },
                { type: 'pilgrim', weight: 10, minRep: -100 }
            ],
            neutral: [
                { type: 'mercenary', weight: 20, minRep: -30 },
                { type: 'smuggler', weight: 15, minRep: -50 },
                { type: 'spy', weight: 10, minRep: -20 }
            ],
            hostile: [
                { type: 'robber', weight: 25, minRep: -100 },
                { type: 'thief', weight: 20, minRep: -100 }
            ]
        },

        // every location holds souls waiting to speak or strike
        location: {
            tavern: [
                { type: 'innkeeper', weight: 30, minRep: -30 },
                { type: 'drunk', weight: 25, minRep: -100 },
                { type: 'traveler', weight: 20, minRep: -50 },
                { type: 'informant', weight: 15, minRep: -20 },
                { type: 'mercenary', weight: 10, minRep: -40 }
            ],
            market: [
                { type: 'general_store', weight: 25, minRep: -20 },
                { type: 'jeweler', weight: 15, minRep: 0 },
                { type: 'thief', weight: 10, minRep: -60 },
                { type: 'beggar', weight: 20, minRep: -100 },
                { type: 'town_crier', weight: 15, minRep: -100 }
            ],
            temple: [
                { type: 'priest', weight: 40, minRep: -100 },
                { type: 'healer', weight: 30, minRep: -50 },
                { type: 'scholar', weight: 20, minRep: -30 },
                { type: 'beggar', weight: 10, minRep: -100 }
            ],
            guild: [
                { type: 'guild_master', weight: 30, minRep: 20 },
                { type: 'mercenary', weight: 25, minRep: -20 },
                { type: 'scribe', weight: 20, minRep: -10 },
                { type: 'courier', weight: 15, minRep: -30 },
                { type: 'spy', weight: 10, minRep: 0 }
            ],
            gate: [
                { type: 'stablemaster', weight: 25, minRep: -40 },
                { type: 'traveler', weight: 25, minRep: -100 },
                { type: 'beggar', weight: 20, minRep: -100 },
                { type: 'smuggler', weight: 15, minRep: -50 },
                { type: 'courier', weight: 15, minRep: -30 }
            ],
            docks: [
                { type: 'ferryman', weight: 30, minRep: -50 },
                { type: 'smuggler', weight: 25, minRep: -40 },
                { type: 'traveler', weight: 20, minRep: -100 },
                { type: 'thief', weight: 15, minRep: -60 },
                { type: 'merchant', weight: 10, minRep: -20 }
            ],
            noble_district: [
                { type: 'noble', weight: 35, minRep: 30 },
                { type: 'scribe', weight: 25, minRep: 10 },
                { type: 'scholar', weight: 20, minRep: 0 },
                { type: 'spy', weight: 15, minRep: 20 },
                { type: 'loan_shark', weight: 5, minRep: -100 }
            ]
        },

        // when chaos reigns, special souls emerge from the shadows
        event: {
            festival: [
                { type: 'drunk', weight: 30, minRep: -100 },
                { type: 'traveler', weight: 25, minRep: -100 },
                { type: 'town_crier', weight: 20, minRep: -100 },
                { type: 'thief', weight: 15, minRep: -60 },
                { type: 'noble', weight: 10, minRep: 20 }
            ],
            plague: [
                { type: 'healer', weight: 40, minRep: -100 },
                { type: 'priest', weight: 30, minRep: -100 },
                { type: 'apothecary', weight: 20, minRep: -20 },
                { type: 'beggar', weight: 10, minRep: -100 }
            ],
            war: [
                { type: 'mercenary', weight: 35, minRep: -100 },
                { type: 'courier', weight: 25, minRep: -50 },
                { type: 'smuggler', weight: 20, minRep: -40 },
                { type: 'spy', weight: 15, minRep: -20 },
                { type: 'healer', weight: 5, minRep: -100 }
            ],
            trade_boom: [
                { type: 'merchant', weight: 35, minRep: -100 },
                { type: 'jeweler', weight: 20, minRep: 0 },
                { type: 'traveler', weight: 20, minRep: -100 },
                { type: 'thief', weight: 15, minRep: -50 },
                { type: 'loan_shark', weight: 10, minRep: -100 }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════
    // initialization - awakening the encounter system
    // ═══════════════════════════════════════════════════════════

    init() {
        this.hookIntoGameSystems();
        console.log('🎭 NPCEncounterSystem: Initialized - strangers now await on every road');
    },

    hookIntoGameSystems() {
        // hook into travel completion
        if (typeof TravelSystem !== 'undefined') {
            const originalOnArrival = TravelSystem.onArrival;
            TravelSystem.onArrival = (destination) => {
                if (originalOnArrival) originalOnArrival.call(TravelSystem, destination);
                this.checkLocationArrivalEncounter(destination);
            };
        }

        // hook into city events
        if (typeof CityEventSystem !== 'undefined') {
            const originalTriggerEvent = CityEventSystem.triggerEvent;
            CityEventSystem.triggerEvent = (locationId, event) => {
                if (originalTriggerEvent) originalTriggerEvent.call(CityEventSystem, locationId, event);
                this.checkEventEncounter(locationId, event);
            };
        }

        console.log('🎭 NPCEncounterSystem: Hooked into game systems');
    },

    // ═══════════════════════════════════════════════════════════
    // encounter triggers - checking if encounters should happen
    // ═══════════════════════════════════════════════════════════

    checkTravelEncounter(fromLocation, toLocation) {
        if (!this.canTriggerEncounter()) return null;

        if (Math.random() > this.config.travelEncounterChance) return null;

        // determine encounter type based on route danger
        const danger = this.getRouteDanger(fromLocation, toLocation);
        const category = danger > 0.7 ? 'hostile' : (danger > 0.4 ? 'neutral' : 'friendly');

        const encounter = this.selectEncounter('road', category);
        if (encounter) {
            this.triggerEncounter(encounter, 'road');
        }

        return encounter;
    },

    checkLocationArrivalEncounter(destination) {
        if (!this.canTriggerEncounter()) return null;

        if (Math.random() > this.config.locationArrivalChance) return null;

        // determine location type
        const locationType = this.getLocationType(destination);
        const encounterList = this.encounterTypes.location[locationType];

        if (!encounterList) return null;

        const encounter = this.selectFromWeightedList(encounterList);
        if (encounter) {
            this.triggerEncounter(encounter, locationType);
        }

        return encounter;
    },

    checkEventEncounter(locationId, event) {
        if (!this.canTriggerEncounter()) return null;

        if (Math.random() > this.config.randomEventChance) return null;

        const eventType = event?.type || 'festival';
        const encounterList = this.encounterTypes.event[eventType];

        if (!encounterList) return null;

        const encounter = this.selectFromWeightedList(encounterList);
        if (encounter) {
            this.triggerEncounter(encounter, eventType);
        }

        return encounter;
    },

    canTriggerEncounter() {
        // No random encounters during tutorial - only scripted forceEncounter allowed
        if (typeof TutorialManager !== 'undefined' && TutorialManager.isActive) {
            return false;
        }

        // enough time passed since last encounter? enforce the cooldown
        const currentTime = typeof TimeSystem !== 'undefined'
            ? TimeSystem.getTotalMinutes()
            : Date.now() / 60000;

        if (currentTime - this.lastEncounterTime < this.config.encounterCooldown) {
            return false;
        }

        // too many hollow souls already active? prevent encounter spam
        if (this.activeEncounters.length >= this.config.maxActiveEncounters) {
            return false;
        }

        return true;
    },

    // ═══════════════════════════════════════════════════════════
    // encounter selection - choosing which NPC appears
    // ═══════════════════════════════════════════════════════════

    selectEncounter(context, category) {
        const contextEncounters = this.encounterTypes[context];
        if (!contextEncounters) return null;

        const categoryList = contextEncounters[category];
        if (!categoryList) return null;

        return this.selectFromWeightedList(categoryList);
    },

    selectFromWeightedList(list) {
        // filter by reputation
        const playerRep = this.getPlayerReputation();
        const eligible = list.filter(e => playerRep >= (e.minRep || -100));

        if (eligible.length === 0) return null;

        // weighted random selection
        const totalWeight = eligible.reduce((sum, e) => sum + (e.weight || 1), 0);
        let random = Math.random() * totalWeight;

        for (const encounter of eligible) {
            random -= (encounter.weight || 1);
            if (random <= 0) {
                return encounter;
            }
        }

        return eligible[eligible.length - 1];
    },

    // ═══════════════════════════════════════════════════════════
    // encounter execution - actually triggering the encounter
    // ═══════════════════════════════════════════════════════════

    triggerEncounter(encounter, context) {
        console.log(`🎭 Triggering ${encounter.type} encounter in ${context}`);

        // freeze the world - this moment matters
        this.pauseTimeForEncounter();

        // stamp the encounter time - track when this puppet manifested
        this.lastEncounterTime = typeof TimeSystem !== 'undefined'
            ? TimeSystem.getTotalMinutes()
            : Date.now() / 60000;

        // conjure the NPC data for this encounter - give the puppet form
        const npcData = this.generateEncounterNPC(encounter.type, context);

        // register this encounter in active memory - the void remembers
        this.activeEncounters.push({
            id: `encounter_${Date.now()}`,
            npc: npcData,
            context: context,
            timestamp: Date.now()
        });

        // archive this meeting in the history log - permanent record of who crossed paths
        this.encounterHistory.push({
            type: encounter.type,
            context: context,
            timestamp: Date.now()
        });

        // keep history limited
        if (this.encounterHistory.length > 50) {
            this.encounterHistory = this.encounterHistory.slice(-50);
        }

        // dispatch encounter-started for quest objective tracking (encounter type)
        document.dispatchEvent(new CustomEvent('encounter-started', {
            detail: { encounter_type: encounter.type, context: context, npc: npcData.type || npcData.name }
        }));

        // show encounter dialog
        this.showEncounterDialog(npcData, context);
    },

    // halt the march of time - give this encounter your full attention
    // FIX: use interrupt system to properly save and restore user's preferred speed
    pauseTimeForEncounter() {
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.pauseForInterrupt) {
                // new interrupt system - handles nested interrupts and user preferred speed
                TimeSystem.pauseForInterrupt('encounter');
            } else if (!TimeSystem.isPaused) {
                // Fallback for old API
                this.wasTimePaused = false;
                this.previousSpeed = TimeSystem.currentSpeed;
                TimeSystem.setSpeed('PAUSED');
                console.log('🎭 Time paused for encounter');
            } else {
                this.wasTimePaused = true;
            }
        }
    },

    // release time from its cage - the encounter has ended
    // FIX: use interrupt system to restore user's preferred speed
    resumeTimeAfterEncounter() {
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.resumeFromInterrupt) {
                // new interrupt system - restores previous speed from stack
                TimeSystem.resumeFromInterrupt('encounter');
            } else if (!this.wasTimePaused) {
                // Fallback for old API
                const speedToRestore = this.previousSpeed || 'NORMAL';
                TimeSystem.setSpeed(speedToRestore);
                console.log('🎭 Time resumed after encounter, speed:', speedToRestore);
            }
        }
    },

    generateEncounterNPC(type, context) {
        const persona = typeof NPCPersonaDatabase !== 'undefined'
            ? NPCPersonaDatabase.getPersona(type)
            : null;

        // generate a unique name
        const name = this.generateNPCName(type);

        // get location context
        const location = game?.currentLocation;

        const npcData = {
            id: `encounter_npc_${Date.now()}`,
            name: name,
            type: type,
            personality: persona?.personality || 'friendly',
            speakingStyle: persona?.speakingStyle || 'casual',
            voice: persona?.voice || 'nova',
            voiceInstructions: persona?.voiceInstructions || '',
            context: context,
            location: location?.name || 'the road',
            isEncounter: true,
            greetings: persona?.greetings || ["Hello there."]
        };

        // some souls carry treasures - give them items to barter
        if (this.canTrade(type)) {
            npcData.canTrade = true;
            npcData.inventory = this.generateTravelerInventory(type);
            npcData.gold = this.generateTravelerGold(type);
        }

        return npcData;
    },

    // can this soul engage in capitalism's cold embrace?
    canTrade(type) {
        // Most encounter NPCs can trade - criminals fence stolen goods, service NPCs sell their wares
        const tradingTypes = [
            // Original traders
            'traveler', 'merchant', 'smuggler', 'courier', 'pilgrim', 'tutorial_trader',
            // Hostile (fence stolen goods)
            'robber', 'thief', 'bandit',
            // Neutral professionals
            'mercenary', 'spy', 'informant',
            // Service providers
            'healer', 'priest', 'innkeeper', 'apothecary', 'general_store',
            // Authority (some trade)
            'guard', 'noble', 'guild_master', 'scribe',
            // Civilians
            'farmer', 'ferryman', 'stablemaster', 'jeweler', 'blacksmith',
            'herbalist', 'hunter', 'fisherman', 'miner'
        ];
        return tradingTypes.includes(type);
    },

    // fill their pockets with survival and sin - what do wanderers carry?
    generateTravelerInventory(type) {
        const inventoryTemplates = {
            // ═══════════════════════════════════════════════════════════
            // TRAVELERS & MERCHANTS - the original five
            // ═══════════════════════════════════════════════════════════
            traveler: {
                common: ['bread', 'water_skin', 'torch', 'rope', 'bandage'],
                uncommon: ['health_potion', 'rations', 'map_fragment', 'compass'],
                rare: ['antidote', 'lockpick', 'silver_coin_pouch']
            },
            // FIX CRITICAL-004: Tutorial trader for tutorial quest encounters
            tutorial_trader: {
                common: ['bread', 'water_skin', 'bandage', 'torch', 'rope'],
                uncommon: ['health_potion', 'stamina_potion', 'rations'],
                rare: ['antidote', 'map_fragment']
            },
            merchant: {
                common: ['bread', 'salt', 'cloth', 'candle', 'soap'],
                uncommon: ['spices', 'silk', 'dye', 'leather', 'iron_ingot'],
                rare: ['silver_ring', 'jeweled_dagger', 'rare_spices', 'fine_wine']
            },
            smuggler: {
                common: ['lockpick', 'rope', 'dark_cloak', 'dagger'],
                uncommon: ['poison', 'forged_documents', 'smoke_bomb', 'thieves_tools'],
                rare: ['contraband_goods', 'stolen_jewels', 'rare_poison']
            },
            courier: {
                common: ['sealed_letter', 'rations', 'water_skin', 'map'],
                uncommon: ['stamina_potion', 'good_boots', 'whistle', 'signal_flare'],
                rare: ['urgent_package', 'coded_message', 'royal_seal']
            },
            pilgrim: {
                common: ['holy_water', 'prayer_beads', 'bread', 'candle'],
                uncommon: ['healing_salve', 'blessed_bandage', 'incense', 'scripture'],
                rare: ['holy_relic', 'blessed_amulet', 'sacred_text']
            },

            // ═══════════════════════════════════════════════════════════
            // HOSTILE - criminals with stolen goods, little survival supplies
            // ═══════════════════════════════════════════════════════════
            robber: {
                common: ['dagger', 'rope', 'dark_cloak', 'lockpick'],
                uncommon: ['stolen_purse', 'stolen_jewelry', 'iron_sword', 'mask'],
                rare: ['stolen_gems', 'noble_signet_ring', 'poison_vial']
            },
            thief: {
                common: ['lockpick', 'dagger', 'dark_cloak', 'thieves_tools'],
                uncommon: ['smoke_bomb', 'grappling_hook', 'stolen_coins', 'forged_key'],
                rare: ['master_lockpick', 'stolen_artifact', 'invisibility_cloak']
            },
            bandit: {
                common: ['iron_sword', 'leather_armor', 'rope', 'torch'],
                uncommon: ['stolen_goods', 'ale', 'bandage', 'shield'],
                rare: ['stolen_treasure', 'bandit_insignia', 'gold_teeth']
            },

            // ═══════════════════════════════════════════════════════════
            // NEUTRAL PROFESSIONALS - tools of their trade
            // ═══════════════════════════════════════════════════════════
            mercenary: {
                common: ['iron_sword', 'shield', 'bandage', 'rations'],
                uncommon: ['steel_sword', 'chainmail', 'health_potion', 'whetstone'],
                rare: ['battle_trophy', 'mercenary_contract', 'fine_armor']
            },
            spy: {
                common: ['dark_cloak', 'dagger', 'coded_notes', 'ink'],
                uncommon: ['forged_documents', 'poison', 'disguise_kit', 'cipher_wheel'],
                rare: ['secret_orders', 'noble_seal', 'assassination_contract']
            },
            informant: {
                common: ['parchment', 'ink', 'candle', 'bread'],
                uncommon: ['coded_message', 'city_map', 'bribe_coins', 'whistle'],
                rare: ['blackmail_evidence', 'secret_ledger', 'noble_correspondence']
            },

            // ═══════════════════════════════════════════════════════════
            // SERVICE PROVIDERS - tools and supplies of their trade
            // ═══════════════════════════════════════════════════════════
            healer: {
                common: ['bandage', 'healing_herbs', 'clean_cloth', 'water_skin'],
                uncommon: ['health_potion', 'antidote', 'healing_salve', 'splint'],
                rare: ['rare_medicine', 'surgical_tools', 'plague_cure']
            },
            priest: {
                common: ['holy_water', 'prayer_beads', 'candle', 'scripture'],
                uncommon: ['incense', 'blessed_oil', 'holy_symbol', 'healing_salve'],
                rare: ['holy_relic', 'sacred_text', 'blessed_amulet']
            },
            innkeeper: {
                common: ['ale', 'bread', 'cheese', 'candle'],
                uncommon: ['wine', 'meat', 'room_key', 'lantern'],
                rare: ['fine_wine', 'secret_ledger', 'hidden_key']
            },
            apothecary: {
                common: ['healing_herbs', 'mortar_pestle', 'vial', 'bandage'],
                uncommon: ['health_potion', 'antidote', 'sleeping_draught', 'pain_killer'],
                rare: ['rare_medicine', 'plague_cure', 'elixir_of_life']
            },
            general_store: {
                common: ['rope', 'torch', 'candle', 'soap', 'salt'],
                uncommon: ['lantern', 'backpack', 'bedroll', 'cooking_pot'],
                rare: ['fine_tools', 'rare_goods', 'imported_items']
            },

            // ═══════════════════════════════════════════════════════════
            // AUTHORITY FIGURES - official items, quality gear
            // ═══════════════════════════════════════════════════════════
            guard: {
                common: ['iron_sword', 'shield', 'torch', 'whistle'],
                uncommon: ['chainmail', 'handcuffs', 'city_badge', 'rations'],
                rare: ['guard_captain_seal', 'steel_sword', 'fine_armor']
            },
            noble: {
                common: ['fine_clothes', 'perfume', 'wine', 'jewelry'],
                uncommon: ['gold_coins', 'silk_handkerchief', 'signet_ring', 'letter_of_credit'],
                rare: ['noble_seal', 'land_deed', 'family_heirloom']
            },
            guild_master: {
                common: ['guild_badge', 'parchment', 'ink', 'seal_wax'],
                uncommon: ['guild_contract', 'gold_coins', 'fine_clothes', 'ledger'],
                rare: ['guild_charter', 'master_tools', 'trade_license']
            },
            scribe: {
                common: ['parchment', 'ink', 'quill', 'candle'],
                uncommon: ['seal_wax', 'magnifying_glass', 'blank_book', 'letter_case'],
                rare: ['rare_manuscript', 'ancient_text', 'coded_cipher']
            },

            // ═══════════════════════════════════════════════════════════
            // CIVILIANS - poor supplies, trade goods of their profession
            // ═══════════════════════════════════════════════════════════
            beggar: {
                common: ['worn_clothes', 'begging_cup', 'crust_of_bread'],
                uncommon: ['copper_coins', 'found_trinket', 'tattered_blanket'],
                rare: ['hidden_coins', 'stolen_item', 'lucky_charm']
            },
            drunk: {
                common: ['ale', 'empty_bottle', 'bread_crumbs'],
                uncommon: ['wine', 'flask', 'gambling_dice', 'copper_coins'],
                rare: ['fine_wine', 'lost_jewelry', 'drunken_confession']
            },
            farmer: {
                common: ['bread', 'vegetables', 'eggs', 'grain'],
                uncommon: ['cheese', 'milk_jug', 'seeds', 'farm_tools'],
                rare: ['prize_animal', 'rare_seeds', 'land_deed']
            },
            ferryman: {
                common: ['rope', 'oar', 'lantern', 'fish'],
                uncommon: ['boat_ticket', 'navigation_chart', 'fishing_net'],
                rare: ['ancient_coin', 'treasure_map', 'smuggled_goods']
            },
            stablemaster: {
                common: ['horse_brush', 'oats', 'rope', 'horseshoe'],
                uncommon: ['saddle', 'bridle', 'horse_medicine', 'carrot'],
                rare: ['fine_saddle', 'horse_deed', 'racing_trophy']
            },
            jeweler: {
                common: ['magnifying_glass', 'small_gems', 'silver_wire', 'polishing_cloth'],
                uncommon: ['gold_ring', 'gemstone', 'jewelry_tools', 'silver_chain'],
                rare: ['rare_gem', 'masterwork_jewelry', 'diamond']
            },
            blacksmith: {
                common: ['iron_bar', 'coal', 'tongs', 'hammer'],
                uncommon: ['steel_bar', 'iron_sword', 'horseshoe', 'nails'],
                rare: ['fine_steel', 'masterwork_blade', 'rare_ore']
            },
            herbalist: {
                common: ['healing_herbs', 'mushrooms', 'berries', 'roots'],
                uncommon: ['rare_herbs', 'herbal_tea', 'poultice', 'herb_guide'],
                rare: ['magical_herb', 'ancient_remedy', 'herb_of_immortality']
            },
            hunter: {
                common: ['bow', 'arrows', 'skinning_knife', 'rope'],
                uncommon: ['furs', 'meat', 'animal_trap', 'tracking_guide'],
                rare: ['rare_pelt', 'trophy_antlers', 'beast_fang']
            },
            fisherman: {
                common: ['fishing_rod', 'bait', 'fish', 'net'],
                uncommon: ['pearls', 'large_fish', 'fish_trap', 'salt'],
                rare: ['rare_fish', 'giant_pearl', 'treasure_catch']
            },
            miner: {
                common: ['pickaxe', 'torch', 'coal', 'iron_ore'],
                uncommon: ['silver_ore', 'lantern', 'mining_helmet', 'rope'],
                rare: ['gold_ore', 'rare_gems', 'ancient_artifact']
            },
            town_crier: {
                common: ['bell', 'scroll', 'ink', 'torch'],
                uncommon: ['town_decree', 'megaphone', 'news_ledger', 'city_map'],
                rare: ['royal_proclamation', 'secret_message', 'bribe_evidence']
            },
            loan_shark: {
                common: ['ledger', 'gold_coins', 'contract', 'ink'],
                uncommon: ['debt_note', 'collection_list', 'thugs_whistle', 'interest_chart'],
                rare: ['blackmail_evidence', 'property_deed', 'noble_debt']
            },
            scholar: {
                common: ['book', 'parchment', 'ink', 'quill'],
                uncommon: ['rare_book', 'magnifying_glass', 'ancient_map', 'research_notes'],
                rare: ['ancient_tome', 'lost_knowledge', 'magical_scroll']
            }
        };

        const template = inventoryTemplates[type] || inventoryTemplates.traveler;
        // inventory must be OBJECT {itemId: quantity} not array - NPCTradeWindow expects this format
        const inventory = {};

        // the basics - bread, water, the mundane necessities of existence
        const commonCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < commonCount && template.common.length > 0; i++) {
            const item = template.common[Math.floor(Math.random() * template.common.length)];
            inventory[item] = (inventory[item] || 0) + 1 + Math.floor(Math.random() * 3);
        }

        // something slightly special - the uncommon treasures they've found
        const uncommonCount = Math.random() > 0.3 ? (Math.random() > 0.5 ? 2 : 1) : 0;
        for (let i = 0; i < uncommonCount && template.uncommon.length > 0; i++) {
            const item = template.uncommon[Math.floor(Math.random() * template.uncommon.length)];
            inventory[item] = (inventory[item] || 0) + 1;
        }

        // jackpot - a rare prize hidden among their wares (20% chance)
        if (Math.random() < 0.2 && template.rare.length > 0) {
            const item = template.rare[Math.floor(Math.random() * template.rare.length)];
            inventory[item] = (inventory[item] || 0) + 1;
        }

        return inventory;
    },

    // how much coin weighs down their purse? depends on their trade
    generateTravelerGold(type) {
        const goldRanges = {
            // Original traders
            traveler: { min: 10, max: 50 },
            tutorial_trader: { min: 25, max: 75 }, // FIX CRITICAL-004: Friendly tutorial trader
            merchant: { min: 50, max: 200 },
            smuggler: { min: 30, max: 150 },
            courier: { min: 15, max: 40 },
            pilgrim: { min: 5, max: 25 },

            // Hostile - stolen gold
            robber: { min: 20, max: 100 },
            thief: { min: 15, max: 80 },
            bandit: { min: 25, max: 120 },

            // Neutral professionals
            mercenary: { min: 40, max: 150 },
            spy: { min: 30, max: 100 },
            informant: { min: 10, max: 50 },

            // Service providers
            healer: { min: 20, max: 80 },
            priest: { min: 5, max: 30 },
            innkeeper: { min: 30, max: 100 },
            apothecary: { min: 25, max: 90 },
            general_store: { min: 40, max: 120 },

            // Authority
            guard: { min: 15, max: 50 },
            noble: { min: 100, max: 500 },
            guild_master: { min: 80, max: 300 },
            scribe: { min: 10, max: 40 },

            // Civilians
            beggar: { min: 0, max: 5 },
            drunk: { min: 2, max: 15 },
            farmer: { min: 10, max: 40 },
            ferryman: { min: 15, max: 50 },
            stablemaster: { min: 20, max: 60 },
            jeweler: { min: 50, max: 200 },
            blacksmith: { min: 30, max: 100 },
            herbalist: { min: 15, max: 50 },
            hunter: { min: 10, max: 40 },
            fisherman: { min: 8, max: 35 },
            miner: { min: 15, max: 60 },
            town_crier: { min: 5, max: 20 },
            loan_shark: { min: 100, max: 400 },
            scholar: { min: 15, max: 60 }
        };

        const range = goldRanges[type] || goldRanges.traveler;
        return Math.floor(range.min + Math.random() * (range.max - range.min));
    },

    generateNPCName(type) {
        const firstNames = {
            male: ['Aldric', 'Bjorn', 'Cedric', 'Dorian', 'Edmund', 'Fergus', 'Garrett', 'Henrik', 'Ivan', 'Jakob', 'Klaus', 'Lothar', 'Magnus', 'Nikolai', 'Oscar', 'Piotr', 'Quentin', 'Roland', 'Stefan', 'Theron', 'Ulric', 'Viktor', 'Wilhelm', 'Xavier', 'Yorick', 'Zoran'],
            female: ['Agatha', 'Brenna', 'Cordelia', 'Daria', 'Elena', 'Freya', 'Greta', 'Helena', 'Ingrid', 'Jasmine', 'Katya', 'Luna', 'Mira', 'Nadia', 'Olga', 'Petra', 'Quinn', 'Rosa', 'Sofia', 'Thea', 'Ursula', 'Vera', 'Wanda', 'Xena', 'Yelena', 'Zara']
        };

        const titles = {
            innkeeper: ['the Keeper', 'Warmhearth', 'Goodale', 'Brewster'],
            blacksmith: ['Ironhand', 'Steelforge', 'Hammerfist', 'the Smith'],
            noble: ['von', 'de', 'of House', 'Lord/Lady'],
            priest: ['Father', 'Sister', 'Brother', 'the Devoted'],
            robber: ['the Shadowed', 'Blackhand', 'the Blade', 'Silent'],
            thief: ['Quickfingers', 'the Shadow', 'Lightfoot', 'Whisper'],
            merchant: ['the Trader', 'Goldpouch', 'Fairprice', 'the Merchant'],
            mercenary: ['the Blade', 'Bloodaxe', 'Shieldbreaker', 'the Veteran'],
            traveler: ['the Wanderer', 'Farstrider', 'the Pilgrim', 'Roadwise'],
            drunk: ['', '', 'the Merry', 'Tankard']
        };

        // determine gender (50/50 for most types, weighted for some)
        const femaleWeighted = ['innkeeper', 'healer', 'tailor', 'apothecary'];
        const maleWeighted = ['blacksmith', 'robber', 'mercenary', 'drunk'];

        let gender;
        if (femaleWeighted.includes(type)) {
            gender = Math.random() > 0.3 ? 'female' : 'male';
        } else if (maleWeighted.includes(type)) {
            gender = Math.random() > 0.3 ? 'male' : 'female';
        } else {
            gender = Math.random() > 0.5 ? 'male' : 'female';
        }

        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const titleList = titles[type] || [''];
        const title = titleList[Math.floor(Math.random() * titleList.length)];

        if (type === 'noble') {
            const houseName = ['Blackwood', 'Ravenscroft', 'Goldwyn', 'Silvermere', 'Thornwood'][Math.floor(Math.random() * 5)];
            return `${firstName} ${title} ${houseName}`;
        }

        return title ? `${firstName} ${title}` : firstName;
    },

    // show encounter dialog with API TTS for greeting
    async showEncounterDialog(npcData, context) {
        // get greeting from NPC data or embedded data - no generic garbage
        const npcType = npcData.type || npcData.id;
        let fallbackGreeting = npcData.greetings?.[Math.floor(Math.random() * npcData.greetings.length)];
        if (!fallbackGreeting && typeof NPC_EMBEDDED_DATA !== 'undefined' && NPC_EMBEDDED_DATA[npcType]?.greetings?.length) {
            const spec = NPC_EMBEDDED_DATA[npcType];
            fallbackGreeting = spec.greetings[Math.floor(Math.random() * spec.greetings.length)];
        }
        if (!fallbackGreeting) fallbackGreeting = null;

        // OLLAMA handles all speech when active — embedded data only when OLLAMA is off
        const ollamaActive = typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem._ollamaAvailable;
        let greeting = fallbackGreeting;
        let useAPIVoice = false;

        try {
            if (ollamaActive) {
                console.log(`🎭 OLLAMA encounter greeting for ${npcData.type}...`);

                const activeQuests = typeof QuestSystem !== 'undefined' && QuestSystem.activeQuests
                    ? Object.values(QuestSystem.activeQuests).map(q => ({
                        id: q.id,
                        name: q.name,
                        giver: q.giver,
                        objectives: q.objectives?.map(o => ({ type: o.type, description: o.description, completed: o.completed }))
                    }))
                    : [];

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    npcData,
                    `You just encountered a traveler on the ${context}. Greet them briefly in character. Be ${npcData.personality || 'friendly'}.`,
                    [],
                    {
                        action: 'encounter_greeting',
                        context: context,
                        npcType: npcData.type,
                        activeQuests: activeQuests,
                        playerLocation: typeof game !== 'undefined' ? game.currentLocation?.id : null
                    }
                );

                if (response && response.text) {
                    greeting = response.text;
                    useAPIVoice = true;
                } else {
                    // OLLAMA on but returned empty — greeting stays as embedded data
                    console.warn(`🎭 OLLAMA encounter empty for ${npcData.type}`);
                }
            }
        } catch (e) {
            // OLLAMA on but errored — greeting stays as embedded data
            console.warn('🎭 Encounter OLLAMA greeting error:', e);
        }

        // create context message
        const contextMessages = {
            road: `You encounter ${npcData.name} on the road.`,
            tavern: `${npcData.name} approaches you at the tavern.`,
            market: `${npcData.name} catches your attention in the market.`,
            gate: `${npcData.name} stops you at the gate.`,
            temple: `${npcData.name} greets you in the temple.`,
            guild: `${npcData.name} notices you in the guild hall.`,
            docks: `${npcData.name} hails you at the docks.`,
            noble_district: `${npcData.name} acknowledges your presence.`,
            festival: `${npcData.name} approaches during the festivities.`,
            trade_boom: `${npcData.name} sees opportunity in you.`
        };

        const contextMsg = contextMessages[context] || `You meet ${npcData.name}.`;

        // give the player choices - talk, trade, or walk away
        const buttons = [
            {
                text: '🗨️ Talk',
                className: 'primary',
                onClick: () => {
                    ModalSystem.hide();
                    this.startEncounterConversation(npcData);
                }
            }
        ];

        // can we haggle with this soul? add the trade option
        if (npcData.canTrade) {
            buttons.push({
                text: '💰 Trade',
                className: 'secondary',
                onClick: () => {
                    ModalSystem.hide();
                    this.startEncounterTrade(npcData);
                }
            });
        }

        buttons.push({
            text: '👋 Ignore',
            onClick: () => {
                ModalSystem.hide();
                this.dismissEncounter(npcData.id);
            }
        });

        // show modal with option to talk, trade, or ignore
        if (typeof ModalSystem !== 'undefined') {
            const tradeHint = npcData.canTrade
                ? `<p style="margin-top: 0.5rem; color: #7a7; font-size: 0.9em;">This traveler has items to trade.</p>`
                : '';

            ModalSystem.show({
                title: '🎭 Encounter',
                content: `
                    <p style="margin-bottom: 1rem;">${contextMsg}</p>
                    <p style="font-style: italic; color: #a0a0c0;">"${greeting}"</p>
                    ${tradeHint}
                    <p style="margin-top: 1rem; color: #8a8aaa;">What would you like to do?</p>
                `,
                buttons: buttons
            });

            // play TTS after modal shows
            if (useAPIVoice && typeof NPCVoiceChatSystem !== 'undefined') {
                setTimeout(() => {
                    NPCVoiceChatSystem.playVoice(greeting, npcData.voice || 'nova');
                }, 300);
            }
        } else {
            // fallback - just open chat directly
            this.startEncounterConversation(npcData);
        }
    },

    // start conversation - PeoplePanel has ALL the actions (trade, quest, attack, etc.)
    // NPCChatUI only had Hello/News/Directions - that's garbage for encounters!
    startEncounterConversation(npcData) {
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.showSpecialEncounter) {
            // use PeoplePanel's encounter mode - has trade, attack, give gold, quests, etc.
            PeoplePanel.showSpecialEncounter(npcData, {
                introText: this._getEncounterIntroText(npcData),
                disableChat: false,  // Allow freeform chat
                disableBack: false,  // Allow backing out
                playVoice: true      // Play TTS greeting
            });
        } else if (typeof PeoplePanel !== 'undefined' && PeoplePanel.showNPC) {
            // fallback to regular NPC view
            PeoplePanel.showNPC(npcData);
        } else if (typeof NPCChatUI !== 'undefined') {
            // last resort fallback - limited actions
            NPCChatUI.open(npcData);
        }
    },

    // generate intro text for encounter based on NPC type
    _getEncounterIntroText(npcData) {
        const type = npcData.type || 'stranger';
        const name = npcData.name || 'A stranger';

        const intros = {
            merchant: `${name} approaches with goods to trade, their pack jingling with wares...`,
            bandit: `${name} blocks your path, hand resting on their weapon...`,
            traveler: `${name} spots you on the road and waves in greeting...`,
            guard: `${name} steps forward, eyeing you with professional suspicion...`,
            beggar: `${name} shuffles toward you, hand outstretched...`,
            noble: `${name} approaches with an air of importance...`,
            farmer: `${name} pauses from their work to greet you...`,
            pilgrim: `${name} clasps their hands in prayer and bows slightly...`,
            adventurer: `${name} sizes you up with the practiced eye of a fellow traveler...`,
            default: `${name} approaches you on the road...`
        };

        return intros[type] || intros.default;
    },

    startEncounterTrade(npcData) {
        console.log('🎭 Starting encounter trade with', npcData.name);
        console.log('🎭 NPC inventory:', npcData.inventory);
        console.log('🎭 NPC gold:', npcData.gold);

        // open the market interface - let capitalism flow
        if (typeof NPCTradeWindow !== 'undefined') {
            NPCTradeWindow.open(npcData);
        } else if (typeof openTradeWindow === 'function') {
            openTradeWindow(npcData);
        } else {
            // no trade window - graceful fallback to conversation
            console.warn('🎭 Trade window unavailable, starting conversation');
            this.startEncounterConversation(npcData);
        }
    },

    dismissEncounter(encounterId) {
        this.activeEncounters = this.activeEncounters.filter(e => e.id !== encounterId);
        this.resumeTimeAfterEncounter();
        console.log('🎭 Encounter dismissed');
    },

    // the stranger fades back into the void - encounter over
    endEncounter(npcId) {
        this.activeEncounters = this.activeEncounters.filter(e => e.npc?.id !== npcId);
        this.resumeTimeAfterEncounter();
        console.log('🎭 Encounter ended');
    },

    // ═══════════════════════════════════════════════════════════
    // helper functions - utilities for encounter logic
    // ═══════════════════════════════════════════════════════════

    getRouteDanger(from, to) {
        // calculate route danger based on distance and terrain
        if (typeof GameWorld === 'undefined') return 0.5;

        const fromLoc = GameWorld.locations?.[from?.id || from];
        const toLoc = GameWorld.locations?.[to?.id || to];

        if (!fromLoc || !toLoc) return 0.5;

        // base danger on distance
        const distance = this.calculateDistance(fromLoc, toLoc);
        let danger = Math.min(distance / 500, 0.5);

        // increase danger for certain location types
        const dangerousTypes = ['dungeon', 'wilderness', 'ruins', 'forest'];
        if (dangerousTypes.includes(fromLoc.type) || dangerousTypes.includes(toLoc.type)) {
            danger += 0.3;
        }

        return Math.min(danger, 1);
    },

    calculateDistance(loc1, loc2) {
        if (!loc1?.position || !loc2?.position) return 100;

        const dx = (loc1.position.x || 0) - (loc2.position.x || 0);
        const dy = (loc1.position.y || 0) - (loc2.position.y || 0);

        return Math.sqrt(dx * dx + dy * dy);
    },

    getLocationType(location) {
        if (!location) return 'market';

        const type = location.type || location.id || '';
        const name = (location.name || '').toLowerCase();

        // infer location type from name/type
        if (name.includes('inn') || name.includes('tavern')) return 'tavern';
        if (name.includes('market') || name.includes('bazaar')) return 'market';
        if (name.includes('temple') || name.includes('church')) return 'temple';
        if (name.includes('guild')) return 'guild';
        if (name.includes('gate') || name.includes('entrance')) return 'gate';
        if (name.includes('dock') || name.includes('port') || name.includes('harbor')) return 'docks';
        if (name.includes('castle') || name.includes('manor') || name.includes('palace')) return 'noble_district';

        // default based on location type
        const typeMap = {
            city: 'market',
            town: 'market',
            village: 'tavern',
            port: 'docks',
            castle: 'noble_district',
            temple: 'temple',
            guild: 'guild'
        };

        return typeMap[type] || 'market';
    },

    getPlayerReputation() {
        if (typeof CityReputationSystem === 'undefined') return 0;

        const locationId = game?.currentLocation?.id;
        if (!locationId) return 0;

        return CityReputationSystem.getReputation?.(locationId) || 0;
    },

    // ═══════════════════════════════════════════════════════════
    // manual triggers - for testing and scripted events
    // ═══════════════════════════════════════════════════════════

    spawnRandomEncounter(context = 'road', type = null) {
        const contextEncounters = this.encounterTypes[context];
        if (!contextEncounters) {
            // unknown context - return null, caller handles it
            console.warn('🎭 Unknown encounter context:', context);
            return null;
        }

        let encounter;
        if (type) {
            encounter = { type: type };
        } else {
            // pick random category
            const categories = Object.keys(contextEncounters);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            encounter = this.selectFromWeightedList(contextEncounters[randomCategory]);
        }

        if (encounter) {
            // bypass cooldown for manual triggers
            this.lastEncounterTime = 0;
            this.triggerEncounter(encounter, context);
        }

        return encounter;
    },

    // spawn specific NPC type for testing
    testEncounter(type) {
        return this.spawnRandomEncounter('road', type);
    },

    // Force a specific encounter - used by tutorial system for scripted NPC meetings
    forceEncounter(npcData, options = {}) {
        const context = options.context || 'road';
        const bypassCooldown = options.bypassCooldown !== false;

        // Bypass cooldown for forced encounters
        if (bypassCooldown) {
            this.lastEncounterTime = 0;
        }

        // If npcData is just an NPC type string, generate full NPC data
        let fullNpcData = npcData;
        if (typeof npcData === 'string') {
            fullNpcData = this.generateEncounterNPC(npcData, context);
        } else if (!npcData.id) {
            fullNpcData = {
                ...npcData,
                id: npcData.id || `forced_npc_${Date.now()}`
            };
        }

        console.log(`🎭 Forcing encounter with: ${fullNpcData.name || fullNpcData.type || 'Unknown NPC'}`);

        // Pause time for encounter
        this.pauseTimeForEncounter();

        // Update timestamp
        this.lastEncounterTime = typeof TimeSystem !== 'undefined'
            ? TimeSystem.getTotalMinutes()
            : Date.now() / 60000;

        // Register encounter
        this.activeEncounters.push({
            id: `forced_encounter_${Date.now()}`,
            npc: fullNpcData,
            context: context,
            timestamp: Date.now(),
            forced: true
        });

        // Show encounter dialog
        this.showEncounterDialog(fullNpcData, context);

        // Emit event for quest tracking
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('npc:encounter', {
                npcId: fullNpcData.id,
                npcType: fullNpcData.type,
                npcName: fullNpcData.name,
                forced: true
            });
        }

        return fullNpcData;
    },

    // FIX: refresh trader inventories at 8am daily
    // called by DynamicMarketSystem.performDailyRefresh()
    refreshTraderInventories() {
        // first, clean up stale encounters older than 1 hour
        const ONE_HOUR = 60 * 60 * 1000;
        this.activeEncounters = this.activeEncounters.filter(e => Date.now() - e.timestamp < ONE_HOUR);

        // Essential survival items all traders should have
        const ESSENTIAL_ITEMS = ['water', 'bread', 'food', 'meat', 'ale'];

        // Refresh any active encounters that are merchants/traders
        for (const encounter of this.activeEncounters) {
            // check npc.type not encounter.type - data is nested
            const npcType = encounter.npc?.type || encounter.type;
            if (encounter.inventory || npcType === 'merchant' || npcType === 'smuggler') {
                // Reset inventory with fresh survival items
                encounter.inventory = encounter.inventory || {};

                for (const itemId of ESSENTIAL_ITEMS) {
                    encounter.inventory[itemId] = 3 + Math.floor(Math.random() * 7); // 3-10 items
                }

                // Reset gold
                encounter.gold = encounter.maxGold || 200 + Math.floor(Math.random() * 300);
            }
        }

        console.log('🎭 NPCEncounterSystem: Trader inventories refreshed for new day');
    }
};

// ═══════════════════════════════════════════════════════════════
// global access - easy encounter triggers
// ═══════════════════════════════════════════════════════════════

window.spawnNPCEncounter = function(context, type) {
    return NPCEncounterSystem.spawnRandomEncounter(context, type);
};

window.testNPCChat = function(type) {
    return NPCEncounterSystem.testEncounter(type || 'traveler');
};

// ═══════════════════════════════════════════════════════════════
// initialization - awaken the encounter system
// ═══════════════════════════════════════════════════════════════

// register with Bootstrap
Bootstrap.register('NPCEncounterSystem', () => NPCEncounterSystem.init(), {
    dependencies: ['NPCManager', 'TravelSystem', 'EventBus'],
    priority: 60,
    severity: 'optional'
});

console.log('🎭 NPC Encounter System loaded - strangers await in every shadow');
