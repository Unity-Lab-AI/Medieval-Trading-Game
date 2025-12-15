// 
// FACTION SYSTEM - loyalty is a currency here
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const FactionSystem = {
    //
    // CONFIGURATION
    //
    playerFactionRep: {},
    discoveredFactions: new Set(), // Only show factions player has encountered

    //  Reputation thresholds - scaled to -100 to +100 for sanity
    // -100 to +100 - simple math for complex hatred and fragile devotion 
    repLevels: {
        hated: { min: -100, max: -75, name: 'Hated', icon: '💀', color: '#8b0000' },
        hostile: { min: -75, max: -50, name: 'Hostile', icon: '', color: '#ff0000' },
        unfriendly: { min: -50, max: -25, name: 'Unfriendly', icon: '😠', color: '#ff6600' },
        neutral: { min: -25, max: 25, name: 'Neutral', icon: '😐', color: '#888888' },
        friendly: { min: 25, max: 50, name: 'Friendly', icon: '😊', color: '#66bb66' },
        honored: { min: 50, max: 75, name: 'Honored', icon: '🤝', color: '#44aa44' },
        revered: { min: 75, max: 90, name: 'Revered', icon: '', color: '#22cc22' },
        exalted: { min: 90, max: 101, name: 'Exalted', icon: '👑', color: '#ffd700' }
    },

    // 
    // FACTION DEFINITIONS
    // 
    factions: {
        merchants_guild: {
            id: 'merchants_guild',
            name: "Merchant's Guild",
            icon: '⚖️',
            description: 'The powerful trade organization that controls commerce in major cities.',
            headquarters: 'royal_capital',
            rivals: ['thieves_guild', 'smugglers'],
            allies: ['noble_houses', 'city_guard'],
            benefits: {
                friendly: { priceDiscount: 0.05, description: '5% better prices at guild shops' },
                honored: { priceDiscount: 0.10, specialItems: true, description: '10% discount, access to rare goods' },
                revered: { priceDiscount: 0.15, bulkDeals: true, description: '15% discount, bulk trade deals' },
                exalted: { priceDiscount: 0.20, exclusiveAccess: true, guildHall: true, description: '20% discount, guild hall access, exclusive contracts' }
            },
            penalties: {
                unfriendly: { priceIncrease: 0.10, description: '10% price increase' },
                hostile: { priceIncrease: 0.25, limitedStock: true, description: '25% increase, limited stock' },
                hated: { banned: true, description: 'Banned from guild shops' }
            }
        },

        thieves_guild: {
            id: 'thieves_guild',
            name: "Thieves' Guild",
            icon: '🗡️',
            description: 'A shadowy network of rogues, pickpockets, and information brokers.',
            headquarters: 'jade_harbor',
            rivals: ['merchants_guild', 'city_guard'],
            allies: ['smugglers'],
            benefits: {
                friendly: { fenceDiscount: 0.10, description: 'Better fence prices for stolen goods' },
                honored: { lockpicks: true, safePassage: true, description: 'Free lockpicks, safe passage in slums' },
                revered: { heistTips: true, ambushWarnings: true, description: 'Heist opportunities, bandit warnings' },
                exalted: { masterThief: true, shadowNetwork: true, description: 'Master thief training, shadow network access' }
            },
            penalties: {
                unfriendly: { pickpocketRisk: 0.10, description: '10% chance to be pickpocketed in cities' },
                hostile: { pickpocketRisk: 0.25, ambushRisk: true, description: '25% pickpocket risk, may be ambushed' },
                hated: { bounty: 100, assassinRisk: true, description: 'Bounty placed, assassins may target you' }
            }
        },

        noble_houses: {
            id: 'noble_houses',
            name: 'Noble Houses',
            icon: '🏰',
            description: 'The aristocratic families that rule the kingdom.',
            headquarters: 'royal_capital',
            rivals: ['peasant_union', 'thieves_guild'],
            allies: ['merchants_guild', 'city_guard', 'royal_court'],
            benefits: {
                friendly: { nobleAccess: true, description: 'Access to noble districts' },
                honored: { courtInvitations: true, titlePrefix: 'Esquire', description: 'Court invitations, minor title' },
                revered: { landGrants: true, titlePrefix: 'Sir/Dame', description: 'Land grants available, knighthood' },
                exalted: { royalAudience: true, titlePrefix: 'Lord/Lady', description: 'Royal audience, lordship title' }
            },
            penalties: {
                unfriendly: { nobleDistrictBan: true, description: 'Barred from noble districts' },
                hostile: { taxIncrease: 0.20, description: '20% additional taxes' },
                hated: { arrest: true, description: 'Arrest on sight in noble areas' }
            }
        },

        city_guard: {
            id: 'city_guard',
            name: 'City Guard',
            icon: '🛡️',
            description: 'The law enforcement of the realm.',
            headquarters: 'northern_outpost',
            rivals: ['thieves_guild', 'smugglers', 'bandits'],
            allies: ['merchants_guild', 'noble_houses'],
            benefits: {
                friendly: { fasterTravel: true, description: 'Guards help you travel faster' },
                honored: { escortService: true, bountyBoard: true, description: 'Guard escorts, bounty hunting jobs' },
                revered: { deputyStatus: true, jailFreeCard: true, description: 'Deputy status, one-time jail release' },
                exalted: { captainRank: true, guardCommand: true, description: 'Honorary captain, command guards' }
            },
            penalties: {
                unfriendly: { searchChance: 0.20, description: '20% chance to be searched at gates' },
                hostile: { fines: true, harassedByGuards: true, description: 'Random fines, guard harassment' },
                hated: { arrestOnSight: true, description: 'Wanted criminal - arrest on sight' }
            }
        },

        smugglers: {
            id: 'smugglers',
            name: 'Smugglers Ring',
            icon: '📦',
            description: 'Underground traders dealing in contraband and tax-free goods.',
            headquarters: 'jade_harbor',
            rivals: ['city_guard', 'merchants_guild'],
            allies: ['thieves_guild'],
            benefits: {
                friendly: { contrabandAccess: true, description: 'Access to contraband goods' },
                honored: { taxFree: true, secretRoutes: true, description: 'Tax-free trading, secret routes' },
                revered: { smugglerCaches: true, borderCrossing: true, description: 'Hidden caches, easy border crossing' },
                exalted: { smugglerKing: true, network: true, description: 'Run your own smuggling operation' }
            },
            penalties: {
                unfriendly: { overpriced: true, description: 'Contraband costs 50% more' },
                hostile: { noContraband: true, description: 'No access to contraband' },
                hated: { ratted: true, description: 'Guards informed of your activities' }
            }
        },

        mages_circle: {
            id: 'mages_circle',
            name: "Mages' Circle",
            icon: '🔮',
            description: 'The arcane practitioners who control magical knowledge.',
            headquarters: 'royal_capital',
            rivals: ['church_of_light'],
            allies: ['noble_houses'],
            benefits: {
                friendly: { enchantDiscount: 0.10, description: '10% off enchantments' },
                honored: { spellScrolls: true, magicIdentify: true, description: 'Spell scroll access, free item identification' },
                revered: { apprenticeStatus: true, enchantAccess: true, description: 'Mage apprenticeship, enchanting services' },
                exalted: { archmageAudience: true, artifacts: true, description: 'Archmage counsel, artifact access' }
            },
            penalties: {
                unfriendly: { noEnchants: true, description: 'No enchanting services' },
                hostile: { cursed: true, description: 'May be cursed when visiting mage towers' },
                hated: { magicBan: true, description: 'Banned from all magical services' }
            }
        },

        farmers_collective: {
            id: 'farmers_collective',
            name: 'Farmers Collective',
            icon: '🌾',
            description: 'The hardworking folk who feed the kingdom.',
            headquarters: 'greendale',
            rivals: ['noble_houses'],
            allies: ['merchants_guild'],
            benefits: {
                friendly: { foodDiscount: 0.10, description: '10% off food items' },
                honored: { harvestInfo: true, bulkFood: true, description: 'Harvest predictions, bulk food deals' },
                revered: { farmAccess: true, cropSharing: true, description: 'Farm worker access, crop sharing' },
                exalted: { landowner: true, farmNetwork: true, description: 'Farm ownership opportunities' }
            },
            penalties: {
                unfriendly: { foodMarkup: 0.15, description: '15% food price increase' },
                hostile: { foodShortage: true, description: 'May refuse to sell food' },
                hated: { farmBan: true, description: 'Banned from farming communities' }
            }
        }
    },

    //
    // UNIVERSAL NPC-TO-FACTION MAPPING
    // Every NPC, boss, and enemy belongs to at least one faction
    //
    npcFactionMap: {
        // Merchants Guild members - traders, shop owners, craftsmen
        merchant: ['merchants_guild'],
        general_store: ['merchants_guild'],
        baker: ['merchants_guild', 'farmers_collective'],
        blacksmith: ['merchants_guild'],
        jeweler: ['merchants_guild', 'noble_houses'],
        tailor: ['merchants_guild'],
        apothecary: ['merchants_guild', 'mages_circle'],
        banker: ['merchants_guild', 'noble_houses'],
        guild_master: ['merchants_guild'],
        innkeeper: ['merchants_guild'],

        // Farmers Collective - agricultural workers
        farmer: ['farmers_collective'],
        fisherman: ['farmers_collective'],
        herbalist: ['farmers_collective', 'mages_circle'],
        woodcutter: ['farmers_collective'],
        hunter: ['farmers_collective'],
        druid: ['farmers_collective', 'mages_circle'],

        // City Guard - law enforcement
        guard: ['city_guard'],
        captain: ['city_guard', 'noble_houses'],
        watchman: ['city_guard'],
        soldier: ['city_guard'],

        // Noble Houses - aristocracy
        noble: ['noble_houses'],
        royal_advisor: ['noble_houses'],
        lord: ['noble_houses'],
        lady: ['noble_houses'],
        chieftain: ['noble_houses'],
        elder: ['noble_houses', 'farmers_collective'],

        // Mages Circle - magic users
        mage: ['mages_circle'],
        wizard: ['mages_circle'],
        sorcerer: ['mages_circle'],
        priest: ['mages_circle'],
        scholar: ['mages_circle'],
        alchemist: ['mages_circle'],

        // Thieves Guild - criminals and rogues
        thief: ['thieves_guild'],
        spy: ['thieves_guild'],
        pickpocket: ['thieves_guild'],
        fence: ['thieves_guild'],
        assassin: ['thieves_guild'],
        informant: ['thieves_guild'],

        // Smugglers Ring - underground traders
        smuggler: ['smugglers', 'thieves_guild'],
        pirate: ['smugglers'],
        ferryman: ['smugglers', 'merchants_guild'],
        sailor: ['smugglers', 'merchants_guild'],
        boatman: ['smugglers'],

        // Service NPCs - multiple or no faction
        healer: ['mages_circle'],
        traveler: [],  // Neutral, no faction
        courier: ['merchants_guild'],
        barkeep: ['merchants_guild'],
        drunk: [],
        beggar: [],
        stablemaster: ['merchants_guild'],
        explorer: [],
        adventurer: [],

        // Religious/Scholarly
        acolyte: ['mages_circle'],
        sage: ['mages_circle', 'noble_houses'],
        herald: ['noble_houses'],
        bard: ['merchants_guild'],

        // Miners & Quarry workers
        miner: ['farmers_collective'],
        quarry_foreman: ['farmers_collective', 'merchants_guild'],
        foreman: ['farmers_collective', 'merchants_guild'],
        stonecutter: ['farmers_collective'],
        mason: ['merchants_guild'],
        gem_collector: ['merchants_guild'],

        // Agricultural specialists
        farmhand: ['farmers_collective'],
        shepherd: ['farmers_collective'],
        miller: ['farmers_collective', 'merchants_guild'],
        vintner: ['farmers_collective', 'merchants_guild'],
        orchardist: ['farmers_collective'],
        olive_presser: ['farmers_collective'],
        beekeeper: ['farmers_collective'],
        silkweaver: ['merchants_guild', 'farmers_collective'],
        lumberjack: ['farmers_collective'],

        // Wilderness/Outdoor
        trapper: ['farmers_collective'],
        forager: ['farmers_collective'],
        scout: ['city_guard'],
        mountain_guide: [],
        hermit: [],
        wanderer: [],

        // Maritime/Coastal
        dockmaster: ['merchants_guild', 'smugglers'],
        boatwright: ['merchants_guild'],
        lighthouse_keeper: [],
        diver: ['smugglers'],
        pearl_hunter: ['merchants_guild'],

        // Military
        sergeant: ['city_guard'],

        // Explorers/Scholars
        archaeologist: ['mages_circle'],
        treasure_hunter: ['thieves_guild'],

        // Trade/Transport
        caravan_master: ['merchants_guild'],
        villager: ['farmers_collective'],

        witch: ['mages_circle'],  // Practitioners of dark arts

        // Enemies and Bosses - hostile factions
        bandit: ['bandits'],
        bandit_chief: ['bandits'],
        bandit_leader: ['bandits'],
        goblin: ['monsters'],
        wolf: ['monsters'],
        skeleton: ['undead'],
        zombie: ['undead'],
        necromancer: ['undead', 'mages_circle'],
        dragon: ['monsters'],
        troll: ['monsters'],
        ogre: ['monsters'],
        ghost: ['undead'],
        vampire: ['undead'],
        cultist: ['shadow_cult'],
        shadow_knight: ['shadow_cult'],
        malachar: ['shadow_cult'],  // Main antagonist
        doom_lord: ['shadow_cult'],
        frost_lord: ['monsters'],
        dark_mage: ['shadow_cult', 'mages_circle']
    },

    // Enemy factions - these are hostile to the player by default
    enemyFactions: {
        bandits: {
            id: 'bandits',
            name: 'Bandits',
            icon: '🗡️',
            description: 'Highway robbers and thieves who prey on travelers.',
            defaultRep: -50
        },
        monsters: {
            id: 'monsters',
            name: 'Wild Monsters',
            icon: '👹',
            description: 'Feral creatures and beasts that threaten civilization.',
            defaultRep: -75
        },
        undead: {
            id: 'undead',
            name: 'The Undead',
            icon: '💀',
            description: 'Risen corpses and dark spirits.',
            defaultRep: -100
        },
        shadow_cult: {
            id: 'shadow_cult',
            name: 'Shadow Cult',
            icon: '🖤',
            description: 'Followers of darkness seeking to plunge the world into shadow.',
            defaultRep: -100
        }
    },

    // Get faction(s) for an NPC type
    getNPCFactions(npcType) {
        return this.npcFactionMap[npcType] || [];
    },

    // Get primary faction for an NPC (first in list)
    getNPCPrimaryFaction(npcType) {
        const factions = this.getNPCFactions(npcType);
        return factions.length > 0 ? factions[0] : null;
    },

    // Check if NPC is in a specific faction
    isNPCInFaction(npcType, factionId) {
        const factions = this.getNPCFactions(npcType);
        return factions.includes(factionId);
    },

    // Get all NPCs in a faction
    getNPCsInFaction(factionId) {
        const npcs = [];
        for (const [npcType, factions] of Object.entries(this.npcFactionMap)) {
            if (factions.includes(factionId)) {
                npcs.push(npcType);
            }
        }
        return npcs;
    },

    // Check if NPC type is an enemy
    isEnemy(npcType) {
        const factions = this.getNPCFactions(npcType);
        return factions.some(f => this.enemyFactions[f]);
    },

    //
    // INITIALIZATION
    //
    init() {
        console.log('FactionSystem: Establishing allegiances...');

        // Load discovered factions from save
        this.loadDiscoveredFactions();

        // Everyone starts neutral - innocence dies fast in this world
        for (const factionId of Object.keys(this.factions)) {
            if (this.playerFactionRep[factionId] === undefined) {
                this.playerFactionRep[factionId] = 0;
            }
        }

        this.setupEventListeners();
        this.injectStyles();
        this.createFactionPanel();

        console.log('FactionSystem: Ready');
    },

    setupEventListeners() {
        if (typeof EventBus !== 'undefined') {
            // Listen for trade events
            EventBus.on('trade-completed', (data) => this.onTradeCompleted(data));

            // Listen for quest completion
            EventBus.on('quest-completed', (data) => this.onQuestCompleted(data));

            // Listen for crime events
            EventBus.on('crime-committed', (data) => this.onCrimeCommitted(data));
        }
    },

    // 
    // REPUTATION MANAGEMENT
    // 
    getReputation(factionId) {
        return this.playerFactionRep[factionId] || 0;
    },

    getReputationLevel(factionId) {
        const rep = this.getReputation(factionId);

        for (const [levelId, level] of Object.entries(this.repLevels)) {
            if (rep >= level.min && rep < level.max) {
                return { id: levelId, ...level, currentRep: rep };
            }
        }

        return { id: 'neutral', ...this.repLevels.neutral, currentRep: rep };
    },

    // Discover a faction (adds to visible list)
    discoverFaction(factionId) {
        if (!this.factions[factionId] && !this.enemyFactions[factionId]) return;
        if (!this.discoveredFactions.has(factionId)) {
            this.discoveredFactions.add(factionId);
            console.log(`Discovered faction: ${factionId}`);
            this.saveDiscoveredFactions();
        }
    },

    // Get all discovered factions (ones player has interacted with)
    getDiscoveredFactions() {
        return Array.from(this.discoveredFactions);
    },

    // Save discovered factions to localStorage
    saveDiscoveredFactions() {
        try {
            localStorage.setItem('discoveredFactions', JSON.stringify(Array.from(this.discoveredFactions)));
        } catch (e) { /* silent */ }
    },

    // Load discovered factions from localStorage
    loadDiscoveredFactions() {
        try {
            const saved = localStorage.getItem('discoveredFactions');
            if (saved) {
                this.discoveredFactions = new Set(JSON.parse(saved));
            }
        } catch (e) { /* silent */ }
    },

    // Reset for new game
    resetForNewGame() {
        this.playerFactionRep = {};
        this.discoveredFactions = new Set();
        try {
            localStorage.removeItem('discoveredFactions');
        } catch (e) { /* silent */ }
        console.log('FactionSystem reset for new game');
    },

    modifyReputation(factionId, amount, reason = '') {
        const faction = this.factions[factionId];
        if (!faction) return;

        // Auto-discover faction when rep changes
        this.discoverFaction(factionId);

        const oldRep = this.playerFactionRep[factionId] || 0;
        const oldLevel = this.getReputationLevel(factionId);

        // Clamp the hate - even gods have limits on love and loathing
        this.playerFactionRep[factionId] = Math.max(-100, Math.min(100, oldRep + amount));

        const newLevel = this.getReputationLevel(factionId);

        // Announce change
        if (typeof addMessage === 'function') {
            const sign = amount >= 0 ? '+' : '';
            addMessage(`${faction.icon} ${faction.name}: ${sign}${amount} reputation${reason ? ' (' + reason + ')' : ''}`, amount >= 0 ? 'success' : 'warning');
        }

        // Check for level change
        if (oldLevel.id !== newLevel.id) {
            this.onReputationLevelChanged(factionId, oldLevel, newLevel);
        }

        // Apply rival/ally effects
        this.applyFactionRelationships(factionId, amount);

        // Fire event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('faction-rep-changed', {
                factionId,
                oldRep,
                newRep: this.playerFactionRep[factionId],
                amount,
                reason
            });
        }
    },

    applyFactionRelationships(factionId, amount) {
        const faction = this.factions[factionId];
        if (!faction) return;

        // Allies gain smaller amount
        if (faction.allies) {
            faction.allies.forEach(allyId => {
                if (this.factions[allyId]) {
                    const allyAmount = Math.floor(amount * 0.3);
                    if (allyAmount !== 0) {
                        this.playerFactionRep[allyId] = (this.playerFactionRep[allyId] || 0) + allyAmount;
                    }
                }
            });
        }

        // Rivals lose reputation
        if (faction.rivals) {
            faction.rivals.forEach(rivalId => {
                if (this.factions[rivalId]) {
                    const rivalAmount = Math.floor(-amount * 0.5);
                    if (rivalAmount !== 0) {
                        this.playerFactionRep[rivalId] = (this.playerFactionRep[rivalId] || 0) + rivalAmount;
                    }
                }
            });
        }
    },

    onReputationLevelChanged(factionId, oldLevel, newLevel) {
        const faction = this.factions[factionId];
        if (!faction) return;

        if (typeof addMessage === 'function') {
            if (newLevel.min > oldLevel.min) {
                addMessage(`🎉 Your standing with ${faction.name} has improved to ${newLevel.name}!`, 'success');
            } else {
                addMessage(`⚠️ Your standing with ${faction.name} has dropped to ${newLevel.name}.`, 'warning');
            }
        }

        // Unlock/remove benefits
        this.updateFactionBenefits(factionId);
    },

    // 
    // Every action echoes in the void - I see what you do, and I remember 
    // 
    onTradeCompleted(data) {
        // Trade buys loyalty - gold speaks louder than blood in this realm
        const location = data.location || game?.currentLocation?.id;
        const value = data.totalValue || 0;
        const npcType = data.npcType || data.merchantType;

        // Every 50 gold buys a sliver of respect - reputation through transaction
        if (value >= 50) {
            const repGain = Math.min(5, Math.floor(value / 50)); // Cap at 5 per trade
            this.modifyReputation('merchants_guild', repGain, 'successful trade');
        }

        //  Trading with specific NPC types affects their faction
        if (npcType) {
            this.onTradeWithNPCType(npcType, value);
        }

        //  Location-based faction rep
        this.onTradeAtLocation(location, value);
    },

    //  Trading with specific NPC types
    onTradeWithNPCType(npcType, value) {
        if (value < 25) return; // minimum trade value for rep

        const repGain = Math.min(3, Math.floor(value / 75)); // smaller gains, cap at 3

        switch (npcType) {
            case 'blacksmith':
            case 'miner':
                this.modifyReputation('merchants_guild', repGain, 'smithing trade');
                break;
            case 'farmer':
            case 'baker':
                this.modifyReputation('farmers_collective', repGain, 'farm goods trade');
                break;
            case 'apothecary':
            case 'herbalist':
                this.modifyReputation('mages_circle', Math.ceil(repGain / 2), 'potion trade');
                break;
            case 'jeweler':
            case 'noble':
                this.modifyReputation('noble_houses', repGain, 'luxury trade');
                break;
            case 'ferryman':
            case 'sailor':
                //  These folks know the smugglers...
                if (Math.random() < 0.3) {
                    this.modifyReputation('smugglers', 1, 'dockside dealings');
                }
                break;
            case 'thief':
            case 'spy':
                this.modifyReputation('thieves_guild', repGain, 'shady trade');
                this.modifyReputation('city_guard', -1, 'suspicious activity');
                break;
        }
    },

    //  Location-based faction rep gains
    onTradeAtLocation(location, value) {
        if (value < 100) return;

        const repGain = Math.min(2, Math.floor(value / 150));

        //  Trading in major cities helps that region's faction
        const locationFactions = {
            'royal_capital': ['noble_houses', 'merchants_guild'],
            'jade_harbor': ['merchants_guild', 'smugglers'],
            'northern_outpost': ['city_guard', 'merchants_guild'],
            'greendale': ['farmers_collective'],
            'sunhaven': ['farmers_collective', 'merchants_guild'],
            'western_watch': ['merchants_guild'],
            'silverkeep': ['noble_houses']
        };

        const factions = locationFactions[location];
        if (factions) {
            factions.forEach(factionId => {
                this.modifyReputation(factionId, repGain, `trade in ${location}`);
            });
        }
    },

    onQuestCompleted(data) {
        //  Quest completion - significant rep gains
        if (data.factionRewards) {
            for (const [factionId, amount] of Object.entries(data.factionRewards)) {
                this.modifyReputation(factionId, amount, 'quest completed');
            }
        }

        //  Default rep gain for any quest completion
        const questGiver = data.quest?.giver;
        if (questGiver) {
            this.onQuestForNPCType(questGiver, data.quest);
        }
    },

    //  Quest completion for specific NPC types
    onQuestForNPCType(npcType, quest) {
        const difficulty = quest?.difficulty || 'easy';
        const repGain = { easy: 2, medium: 4, hard: 6, legendary: 10 }[difficulty] || 3;

        switch (npcType) {
            case 'guard':
                this.modifyReputation('city_guard', repGain, 'helped guards');
                break;
            case 'merchant':
            case 'innkeeper':
                this.modifyReputation('merchants_guild', repGain, 'helped merchant');
                break;
            case 'elder':
            case 'noble':
                this.modifyReputation('noble_houses', repGain, 'served nobility');
                break;
            case 'farmer':
                this.modifyReputation('farmers_collective', repGain, 'helped farmers');
                break;
            case 'apothecary':
            case 'priest':
                this.modifyReputation('mages_circle', repGain, 'aided mages');
                break;
            case 'thief':
            case 'spy':
                this.modifyReputation('thieves_guild', repGain, 'did shady work');
                break;
        }
    },

    onCrimeCommitted(data) {
        const crimeType = data.type;

        //  Crimes affect factions (scaled for -100 to 100)
        switch (crimeType) {
            case 'theft':
                this.modifyReputation('city_guard', -5, 'theft');
                this.modifyReputation('thieves_guild', 2, 'theft');
                break;
            case 'assault':
                this.modifyReputation('city_guard', -10, 'assault');
                break;
            case 'smuggling':
                this.modifyReputation('city_guard', -8, 'smuggling');
                this.modifyReputation('smugglers', 5, 'smuggling');
                this.modifyReputation('merchants_guild', -3, 'smuggling');
                break;
            case 'murder':
                this.modifyReputation('city_guard', -25, 'murder');
                this.modifyReputation('noble_houses', -15, 'murder');
                break;
        }
    },

    // 
    // Sins can be washed away - if your pockets are deep enough
    // 

    // Bribe your way back into their good graces - guilt is just a price tag
    bribeFaction(factionId, goldAmount) {
        const faction = this.factions[factionId];
        if (!faction) return { success: false, error: 'Invalid faction' };

        const currentRep = this.getReputation(factionId);
        if (currentRep >= 0) {
            return { success: false, error: 'Reputation already positive' };
        }

        if (typeof game !== 'undefined' && game.player) {
            if (game.player.gold < goldAmount) {
                return { success: false, error: 'Not enough gold' };
            }

            // 100 gold per 5 points of forgiveness - redemption has a price
            const repGain = Math.min(Math.abs(currentRep), Math.floor(goldAmount / 20));
            game.player.gold -= goldAmount;
            this.modifyReputation(factionId, repGain, 'bribe');

            return { success: true, repGained: repGain, goldSpent: goldAmount };
        }

        return { success: false, error: 'Game not available' };
    },

    //  Gift items to recover rep
    giftToFaction(factionId, itemValue) {
        const currentRep = this.getReputation(factionId);

        //  Gifts work even for positive rep, just less effective
        const multiplier = currentRep < 0 ? 1.5 : 0.5;
        const repGain = Math.floor((itemValue / 50) * multiplier);

        if (repGain > 0) {
            this.modifyReputation(factionId, Math.min(repGain, 5), 'gift');
            return { success: true, repGained: Math.min(repGain, 5) };
        }

        return { success: false, error: 'Gift value too low' };
    },

    // Daily rep decay/recovery (call this each game day)
    applyDailyRepChanges() {
        //  Extreme rep slowly moves toward neutral over time
        // This ensures no permanent lock-out
        for (const factionId of Object.keys(this.factions)) {
            const rep = this.getReputation(factionId);

            // Very negative rep slowly recovers (1 point per day if below -50)
            if (rep < -50) {
                this.playerFactionRep[factionId] = rep + 1;
            }

            // Very positive rep slowly decays if you don't maintain it
            if (rep > 75) {
                this.playerFactionRep[factionId] = rep - 0.5;
            }
        }
    },

    // 
    // Loyalty brings gifts, hatred brings ruin - your choices echo forever
    // 
    getFactionBenefits(factionId) {
        const faction = this.factions[factionId];
        const level = this.getReputationLevel(factionId);
        if (!faction) return null;

        // Kindness begins at 25 - below that, you're just another stranger
        if (level.currentRep >= 25 && faction.benefits) {
            const tiers = ['exalted', 'revered', 'honored', 'friendly'];
            for (const tier of tiers) {
                if (faction.benefits[tier] && level.currentRep >= this.repLevels[tier].min) {
                    return { tier, ...faction.benefits[tier] };
                }
            }
        }

        return null;
    },

    getFactionPenalties(factionId) {
        const faction = this.factions[factionId];
        const level = this.getReputationLevel(factionId);
        if (!faction) return null;

        // Consequences begin at -25 - sink lower and the world turns hostile
        if (level.currentRep < -25 && faction.penalties) {
            const tiers = ['hated', 'hostile', 'unfriendly'];
            for (const tier of tiers) {
                if (faction.penalties[tier] && level.currentRep < this.repLevels[tier].max) {
                    return { tier, ...faction.penalties[tier] };
                }
            }
        }

        return null;
    },

    getPriceModifier(factionId) {
        const benefits = this.getFactionBenefits(factionId);
        const penalties = this.getFactionPenalties(factionId);

        if (benefits?.priceDiscount) {
            return 1 - benefits.priceDiscount;
        }
        if (penalties?.priceIncrease) {
            return 1 + penalties.priceIncrease;
        }

        return 1.0;
    },

    isBannedFromFaction(factionId) {
        const penalties = this.getFactionPenalties(factionId);
        return penalties?.banned || penalties?.arrestOnSight || false;
    },

    updateFactionBenefits(factionId) {
        // This would update UI or game state based on new benefits
        // For now, just log
        const benefits = this.getFactionBenefits(factionId);
        const penalties = this.getFactionPenalties(factionId);

        if (benefits) {
            console.log(`🏛️ Active benefits from ${factionId}:`, benefits);
        }
        if (penalties) {
            console.log(`🏛️ Active penalties from ${factionId}:`, penalties);
        }
    },

    //
    // UI - Draggable Panel
    //
    createFactionPanel() {
        // Don't create if already exists
        if (document.getElementById('faction-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'faction-panel';
        panel.className = 'panel faction-panel-container';
        panel.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            max-width: 90vw;
            max-height: 70vh;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid rgba(79, 195, 247, 0.5);
            border-radius: 12px;
            overflow: hidden;
            display: none;
            flex-direction: column;
        `;

        panel.innerHTML = `
            <div class="faction-panel-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
                cursor: move;
                user-select: none;
            ">
                <h3 style="margin: 0; color: #4fc3f7; font-size: 16px;">Faction Reputation</h3>
                <button class="faction-panel-close" style="
                    background: rgba(244, 67, 54, 0.3);
                    border: 1px solid #f44336;
                    color: #f44336;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                ">X</button>
            </div>
            <div class="faction-panel-content" style="
                overflow-y: auto;
                padding: 12px;
                flex: 1;
            ">
                <div class="faction-list-empty" style="
                    text-align: center;
                    color: #888;
                    padding: 20px;
                    font-style: italic;
                ">You haven't encountered any factions yet. Explore the world and interact with NPCs to discover factions.</div>
            </div>
        `;

        document.body.appendChild(panel);

        // Close button handler
        panel.querySelector('.faction-panel-close').onclick = () => {
            this.hideFactionPanel();
        };

        // Make draggable after centering calculation
        setTimeout(() => {
            const rect = panel.getBoundingClientRect();
            panel.style.left = ((window.innerWidth - rect.width) / 2) + 'px';
            panel.style.transform = 'none';

            if (typeof DraggablePanels !== 'undefined') {
                DraggablePanels.makeDraggable(panel);
            }
        }, 10);

        console.log('FactionSystem: Panel created');
    },

    // Show the faction panel with current discovered factions
    showFactionPanel() {
        let panel = document.getElementById('faction-panel');
        if (!panel) {
            this.createFactionPanel();
            panel = document.getElementById('faction-panel');
        }

        if (!panel) {
            console.error('🏛️ FactionSystem: Failed to create faction panel!');
            return;
        }

        // Update content with discovered factions
        this.updateFactionPanelContent();

        // Show panel
        panel.style.display = 'flex';

        // Bring to front using DraggablePanels if available, otherwise set z-index directly
        if (typeof DraggablePanels !== 'undefined' && DraggablePanels.bringToFront) {
            DraggablePanels.bringToFront(panel);
        } else {
            // Fallback z-index if DraggablePanels not available
            panel.style.zIndex = '1500';
        }

        console.log('🏛️ FactionSystem: Panel shown', { display: panel.style.display, zIndex: panel.style.zIndex });
    },

    // Hide the faction panel
    hideFactionPanel() {
        const panel = document.getElementById('faction-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    },

    // Toggle faction panel visibility
    toggleFactionPanel() {
        console.log('🏛️ FactionSystem: toggleFactionPanel() called');
        const panel = document.getElementById('faction-panel');
        console.log('🏛️ FactionSystem: Panel found:', !!panel, panel ? panel.style.display : 'N/A');
        if (panel && panel.style.display !== 'none') {
            this.hideFactionPanel();
        } else {
            this.showFactionPanel();
        }
    },

    // Update the faction panel content with current discovered factions
    updateFactionPanelContent() {
        const panel = document.getElementById('faction-panel');
        if (!panel) return;

        const content = panel.querySelector('.faction-panel-content');
        if (!content) return;

        const discovered = this.getDiscoveredFactions();

        if (discovered.length === 0) {
            content.innerHTML = `
                <div class="faction-list-empty" style="
                    text-align: center;
                    color: #888;
                    padding: 20px;
                    font-style: italic;
                ">You haven't encountered any factions yet. Explore the world and interact with NPCs to discover factions.</div>
            `;
            return;
        }

        let factionsHTML = '';
        for (const factionId of discovered) {
            const faction = this.factions[factionId] || this.enemyFactions[factionId];
            if (!faction) continue;

            const level = this.getReputationLevel(factionId);
            const rep = this.getReputation(factionId);
            const benefits = this.getFactionBenefits(factionId);
            const penalties = this.getFactionPenalties(factionId);

            // Calculate progress to next level
            const nextLevel = this.getNextLevel(level.id);
            const progress = nextLevel ?
                ((rep - level.min) / (nextLevel.min - level.min)) * 100 : 100;

            factionsHTML += `
                <div class="faction-card" style="
                    background: rgba(40, 40, 70, 0.4);
                    border: 1px solid rgba(79, 195, 247, 0.2);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 10px;
                ">
                    <div class="faction-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span class="faction-icon" style="font-size: 20px;">${faction.icon}</span>
                        <span class="faction-name" style="color: #fff; font-weight: bold; font-size: 14px;">${faction.name}</span>
                    </div>
                    <div class="faction-description" style="color: #888; font-size: 11px; margin-bottom: 8px;">${faction.description}</div>
                    <div class="faction-standing" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span class="standing-icon" style="font-size: 16px;">${level.icon}</span>
                        <span class="standing-name" style="font-weight: bold; color: ${level.color};">${level.name}</span>
                        <span class="standing-rep" style="color: #666; font-size: 11px;">(${rep})</span>
                    </div>
                    <div class="faction-progress-bar" style="
                        height: 5px;
                        background: rgba(0, 0, 0, 0.4);
                        border-radius: 3px;
                        overflow: hidden;
                        margin-bottom: 6px;
                    ">
                        <div class="faction-progress-fill" style="width: ${Math.max(0, Math.min(100, progress))}%; height: 100%; background: ${level.color};"></div>
                    </div>
                    ${benefits ? `<div class="faction-benefit" style="color: #4caf50; font-size: 11px;">${benefits.description}</div>` : ''}
                    ${penalties ? `<div class="faction-penalty" style="color: #f44336; font-size: 11px;">Warning: ${penalties.description}</div>` : ''}
                </div>
            `;
        }

        content.innerHTML = factionsHTML;
    },

    // Legacy overlay method - still available for quick view
    showFactionOverlay() {
        const existing = document.getElementById('faction-panel-overlay');
        if (existing) {
            existing.remove();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'faction-panel-overlay';
        overlay.className = 'faction-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        let factionsHTML = '';
        for (const [factionId, faction] of Object.entries(this.factions)) {
            const level = this.getReputationLevel(factionId);
            const rep = this.getReputation(factionId);
            const benefits = this.getFactionBenefits(factionId);
            const penalties = this.getFactionPenalties(factionId);

            // Calculate progress to next level
            const nextLevel = this.getNextLevel(level.id);
            const progress = nextLevel ?
                ((rep - level.min) / (nextLevel.min - level.min)) * 100 : 100;

            factionsHTML += `
                <div class="faction-card">
                    <div class="faction-header">
                        <span class="faction-icon">${faction.icon}</span>
                        <span class="faction-name">${faction.name}</span>
                    </div>
                    <div class="faction-description">${faction.description}</div>
                    <div class="faction-standing">
                        <span class="standing-icon">${level.icon}</span>
                        <span class="standing-name" style="color: ${level.color}">${level.name}</span>
                        <span class="standing-rep">(${rep})</span>
                    </div>
                    <div class="faction-progress-bar">
                        <div class="faction-progress-fill" style="width: ${Math.max(0, Math.min(100, progress))}%; background: ${level.color}"></div>
                    </div>
                    ${benefits ? `<div class="faction-benefit">${benefits.description}</div>` : ''}
                    ${penalties ? `<div class="faction-penalty">Warning: ${penalties.description}</div>` : ''}
                </div>
            `;
        }

        overlay.innerHTML = `
            <div class="faction-panel">
                <div class="faction-panel-header">
                    <h2>Faction Standings</h2>
                    <button class="faction-close" onclick="this.closest('.faction-overlay').remove()">X</button>
                </div>
                <div class="faction-list">
                    ${factionsHTML}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    getNextLevel(currentLevelId) {
        const levels = Object.entries(this.repLevels);
        const currentIndex = levels.findIndex(([id]) => id === currentLevelId);
        if (currentIndex < levels.length - 1) {
            return { id: levels[currentIndex + 1][0], ...levels[currentIndex + 1][1] };
        }
        return null;
    },

    injectStyles() {
        if (document.getElementById('faction-styles')) return;

        const style = document.createElement('style');
        style.id = 'faction-styles';
        style.textContent = `
            .faction-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 700; /* Z-INDEX STANDARD: System modals */
            }
            .faction-panel {
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid rgba(79, 195, 247, 0.5);
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .faction-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            }
            .faction-panel-header h2 {
                margin: 0;
                color: #4fc3f7;
            }
            .faction-close {
                background: rgba(244, 67, 54, 0.3);
                border: 1px solid #f44336;
                color: #f44336;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
            }
            .faction-list {
                padding: 15px;
                display: grid;
                gap: 15px;
            }
            .faction-card {
                background: rgba(40, 40, 70, 0.4);
                border: 1px solid rgba(79, 195, 247, 0.2);
                border-radius: 8px;
                padding: 15px;
            }
            .faction-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            .faction-icon {
                font-size: 24px;
            }
            .faction-name {
                color: #fff;
                font-weight: bold;
                font-size: 16px;
            }
            .faction-description {
                color: #888;
                font-size: 12px;
                margin-bottom: 10px;
            }
            .faction-standing {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            .standing-icon {
                font-size: 18px;
            }
            .standing-name {
                font-weight: bold;
            }
            .standing-rep {
                color: #666;
                font-size: 12px;
            }
            .faction-progress-bar {
                height: 6px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            .faction-progress-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            .faction-benefit {
                color: #4caf50;
                font-size: 12px;
                margin-top: 5px;
            }
            .faction-penalty {
                color: #f44336;
                font-size: 12px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    },

    //
    // SAVE/LOAD
    //
    getState() {
        return {
            playerFactionRep: { ...this.playerFactionRep },
            discoveredFactions: Array.from(this.discoveredFactions || [])
        };
    },

    loadState(state) {
        if (state?.playerFactionRep) {
            this.playerFactionRep = { ...state.playerFactionRep };
        }
        if (state?.discoveredFactions) {
            this.discoveredFactions = new Set(state.discoveredFactions);
        }
    },

    // 
    // Debug commands - bend fate itself, if you dare 
    // 
    setReputation(factionId, amount) {
        if (this.factions[factionId]) {
            this.playerFactionRep[factionId] = Math.max(-100, Math.min(100, amount));
            console.log(`🐛 Set ${factionId} rep to ${this.playerFactionRep[factionId]}`);
            return true;
        }
        return false;
    },

    //  Set ALL factions to a specific value
    setAllRep(amount) {
        const clamped = Math.max(-100, Math.min(100, amount));
        for (const factionId of Object.keys(this.factions)) {
            this.playerFactionRep[factionId] = clamped;
        }
        console.log(`🐛 Set ALL faction rep to ${clamped}`);
        return true;
    },

    //  Max negative rep with everyone (for testing recovery)
    maxHated() {
        return this.setAllRep(-100);
    },

    //  Max positive rep with everyone
    maxExalted() {
        return this.setAllRep(100);
    },

    //  Random rep values for testing
    randomizeRep() {
        for (const factionId of Object.keys(this.factions)) {
            this.playerFactionRep[factionId] = Math.floor(Math.random() * 201) - 100;
        }
        console.log('🐛 Randomized all faction rep');
        return true;
    },

    //  Show all rep values
    showAllRep() {
        console.log('═══ FACTION REPUTATION ═══');
        for (const [factionId, faction] of Object.entries(this.factions)) {
            const rep = this.getReputation(factionId);
            const level = this.getReputationLevel(factionId);
            console.log(`${faction.icon} ${faction.name}: ${rep} (${level.name})`);
        }
        return this.playerFactionRep;
    },

    //  Test recovery from -100 (simulate playing)
    simulateRecovery(factionId, days = 50) {
        const startRep = this.getReputation(factionId);
        console.log(`🔄 Simulating ${days} days of recovery for ${factionId} (start: ${startRep})`);

        for (let i = 0; i < days; i++) {
            // Daily natural recovery
            this.applyDailyRepChanges();
            // Simulate some trading (2-5 rep per day)
            this.modifyReputation(factionId, Math.floor(Math.random() * 4) + 2, 'simulated activity');
        }

        const endRep = this.getReputation(factionId);
        console.log(`🔄 After ${days} days: ${endRep} (gained ${endRep - startRep})`);
        return { start: startRep, end: endRep, gained: endRep - startRep };
    },

    listFactions() {
        return Object.keys(this.factions);
    }
};

// 
// GLOBAL EXPOSURE
// 
window.FactionSystem = FactionSystem;

// register with Bootstrap
Bootstrap.register('FactionSystem', () => FactionSystem.init(), {
    dependencies: ['game', 'EventBus'],
    priority: 54,
    severity: 'optional'
});

console.log('🏛️ FactionSystem loaded');
