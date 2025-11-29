// ═══════════════════════════════════════════════════════════════
// 🎭 NPC ENCOUNTER SYSTEM - random souls appearing in your path
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// strangers on the road, mysterious figures in taverns, beggars at gates
// every journey brings new faces with opinions to share

const NPCEncounterSystem = {
    // ═══════════════════════════════════════════════════════════
    // 🔧 CONFIGURATION - tuning the frequency of random encounters
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
    // 📊 STATE - tracking encounters and cooldowns
    // ═══════════════════════════════════════════════════════════

    lastEncounterTime: 0,
    activeEncounters: [],
    encounterHistory: [],

    // ═══════════════════════════════════════════════════════════
    // 🎲 ENCOUNTER TYPES - different kinds of random NPCs
    // ═══════════════════════════════════════════════════════════

    encounterTypes: {
        // 🛣️ The road is never safe - who will you meet in the wilderness? 🦇
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

        // 🏰 Every location holds souls waiting to speak or strike 👥
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

        // ⚡ When chaos reigns, special souls emerge from the shadows 🎭
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
    // 🚀 INITIALIZATION - awakening the encounter system
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
    // 🎲 ENCOUNTER TRIGGERS - checking if encounters should happen
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
        // check cooldown
        const currentTime = typeof TimeSystem !== 'undefined'
            ? TimeSystem.getTotalMinutes()
            : Date.now() / 60000;

        if (currentTime - this.lastEncounterTime < this.config.encounterCooldown) {
            return false;
        }

        // check max active encounters
        if (this.activeEncounters.length >= this.config.maxActiveEncounters) {
            return false;
        }

        return true;
    },

    // ═══════════════════════════════════════════════════════════
    // 🎯 ENCOUNTER SELECTION - choosing which NPC appears
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
    // 🎭 ENCOUNTER EXECUTION - actually triggering the encounter
    // ═══════════════════════════════════════════════════════════

    triggerEncounter(encounter, context) {
        console.log(`🎭 Triggering ${encounter.type} encounter in ${context}`);

        // ⏸️ Freeze the world - this moment matters 🕰️
        this.pauseTimeForEncounter();

        // update timing
        this.lastEncounterTime = typeof TimeSystem !== 'undefined'
            ? TimeSystem.getTotalMinutes()
            : Date.now() / 60000;

        // generate NPC data
        const npcData = this.generateEncounterNPC(encounter.type, context);

        // add to active encounters
        this.activeEncounters.push({
            id: `encounter_${Date.now()}`,
            npc: npcData,
            context: context,
            timestamp: Date.now()
        });

        // add to history
        this.encounterHistory.push({
            type: encounter.type,
            context: context,
            timestamp: Date.now()
        });

        // keep history limited
        if (this.encounterHistory.length > 50) {
            this.encounterHistory = this.encounterHistory.slice(-50);
        }

        // show encounter dialog
        this.showEncounterDialog(npcData, context);
    },

    // ⏸️ Halt the march of time - give this encounter your full attention 💀
    pauseTimeForEncounter() {
        if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
            this.wasTimePaused = false;
            TimeSystem.isPaused = true;
            console.log('🎭 Time paused for encounter');
        } else {
            this.wasTimePaused = true;
        }
    },

    // ▶️ Release time from its cage - the encounter has ended 🕰️
    resumeTimeAfterEncounter() {
        if (typeof TimeSystem !== 'undefined' && !this.wasTimePaused) {
            TimeSystem.isPaused = false;
            console.log('🎭 Time resumed after encounter');
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

        // 💼 Some souls carry treasures - give them items to barter 🎒
        if (this.canTrade(type)) {
            npcData.canTrade = true;
            npcData.inventory = this.generateTravelerInventory(type);
            npcData.gold = this.generateTravelerGold(type);
        }

        return npcData;
    },

    // 💱 Can this soul engage in capitalism's cold embrace? 💰
    canTrade(type) {
        const tradingTypes = ['traveler', 'merchant', 'smuggler', 'courier', 'pilgrim'];
        return tradingTypes.includes(type);
    },

    // 🎒 Fill their pockets with survival and sin - what do wanderers carry? 🗡️
    generateTravelerInventory(type) {
        const inventoryTemplates = {
            traveler: {
                common: ['bread', 'water_skin', 'torch', 'rope', 'bandage'],
                uncommon: ['health_potion', 'rations', 'map_fragment', 'compass'],
                rare: ['antidote', 'lockpick', 'silver_coin_pouch']
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
            }
        };

        const template = inventoryTemplates[type] || inventoryTemplates.traveler;
        const inventory = [];

        // 📦 The basics - bread, water, the mundane necessities of existence 🍞
        const commonCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < commonCount && template.common.length > 0; i++) {
            const item = template.common[Math.floor(Math.random() * template.common.length)];
            inventory.push({
                id: item,
                quantity: 1 + Math.floor(Math.random() * 3)
            });
        }

        // ✨ Something slightly special - the uncommon treasures they've found 🔮
        const uncommonCount = Math.random() > 0.3 ? (Math.random() > 0.5 ? 2 : 1) : 0;
        for (let i = 0; i < uncommonCount && template.uncommon.length > 0; i++) {
            const item = template.uncommon[Math.floor(Math.random() * template.uncommon.length)];
            inventory.push({
                id: item,
                quantity: 1
            });
        }

        // 💎 Jackpot - a rare prize hidden among their wares (20% chance) 🎰
        if (Math.random() < 0.2 && template.rare.length > 0) {
            const item = template.rare[Math.floor(Math.random() * template.rare.length)];
            inventory.push({
                id: item,
                quantity: 1
            });
        }

        return inventory;
    },

    // 💰 How much coin weighs down their purse? Depends on their trade 💸
    generateTravelerGold(type) {
        const goldRanges = {
            traveler: { min: 10, max: 50 },
            merchant: { min: 50, max: 200 },
            smuggler: { min: 30, max: 150 },
            courier: { min: 15, max: 40 },
            pilgrim: { min: 5, max: 25 }
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

    showEncounterDialog(npcData, context) {
        // get an appropriate greeting message
        const greeting = npcData.greetings?.[Math.floor(Math.random() * npcData.greetings.length)]
            || "Greetings, traveler.";

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

        // 🎮 Give the player choices - talk, trade, or walk away 🚪
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

        // 💱 Can we haggle with this soul? Add the trade option 🤝
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
        } else {
            // fallback - just open chat directly
            this.startEncounterConversation(npcData);
        }
    },

    startEncounterConversation(npcData) {
        if (typeof NPCChatUI !== 'undefined') {
            NPCChatUI.open(npcData);
        }
    },

    startEncounterTrade(npcData) {
        console.log('🎭 Starting encounter trade with', npcData.name);
        console.log('🎭 NPC inventory:', npcData.inventory);
        console.log('🎭 NPC gold:', npcData.gold);

        // 💼 Open the market interface - let capitalism flow 💸
        if (typeof NPCTradeWindow !== 'undefined') {
            NPCTradeWindow.open(npcData);
        } else if (typeof openTradeWindow === 'function') {
            openTradeWindow(npcData);
        } else {
            // 🦇 No trade window - graceful fallback to conversation
            console.warn('🎭 Trade window unavailable, starting conversation');
            this.startEncounterConversation(npcData);
        }
    },

    dismissEncounter(encounterId) {
        this.activeEncounters = this.activeEncounters.filter(e => e.id !== encounterId);
        this.resumeTimeAfterEncounter();
        console.log('🎭 Encounter dismissed');
    },

    // 👋 The stranger fades back into the void - encounter over 🌫️
    endEncounter(npcId) {
        this.activeEncounters = this.activeEncounters.filter(e => e.npc?.id !== npcId);
        this.resumeTimeAfterEncounter();
        console.log('🎭 Encounter ended');
    },

    // ═══════════════════════════════════════════════════════════
    // 🛠️ HELPER FUNCTIONS - utilities for encounter logic
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
    // 📢 MANUAL TRIGGERS - for testing and scripted events
    // ═══════════════════════════════════════════════════════════

    spawnRandomEncounter(context = 'road', type = null) {
        const contextEncounters = this.encounterTypes[context];
        if (!contextEncounters) {
            // 🦇 Unknown context - return null, caller handles it
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
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL ACCESS - easy encounter triggers
// ═══════════════════════════════════════════════════════════════

window.spawnNPCEncounter = function(context, type) {
    return NPCEncounterSystem.spawnRandomEncounter(context, type);
};

window.testNPCChat = function(type) {
    return NPCEncounterSystem.testEncounter(type || 'traveler');
};

// ═══════════════════════════════════════════════════════════════
// 🚀 INITIALIZATION - awaken the encounter system
// ═══════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => NPCEncounterSystem.init(), 800);
    });
} else {
    setTimeout(() => NPCEncounterSystem.init(), 800);
}

console.log('🎭 NPC Encounter System loaded - strangers await in every shadow');
