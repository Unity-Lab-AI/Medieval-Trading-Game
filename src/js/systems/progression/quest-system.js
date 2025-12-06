// ═══════════════════════════════════════════════════════════════
// QUEST SYSTEM - tasks that pretend to matter
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// QUEST FILES:
// - main-quests.js: 35 Main Story Quests (The Shadow Rising & Black Ledger)
// - side-quests.js: 50 Regional Side Quests (Combat & Trade Chains)
// - doom-quests.js: 15 Doom World Quests + Greedy Won Boss
// ═══════════════════════════════════════════════════════════════

const QuestSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 📋 QUEST METADATA CATEGORIES - for classification and filtering 💀
    // ═══════════════════════════════════════════════════════════════
    QUEST_TYPES: Object.freeze({
        MAIN: 'main',     // Main story quests (35 total across 5 acts)
        SIDE: 'side',     // Regional side quests (50 total, 2 chains per region)
        DOOM: 'doom'      // Doom world quests (15 total + Greedy Won boss)
    }),

    QUEST_SUBTYPES: Object.freeze({
        COMBAT: 'combat',     // Combat-focused quests (kill, defeat, protect)
        TRADE: 'trade',       // Trade-focused quests (buy, sell, deliver)
        EXPLORE: 'explore',   // Exploration quests (discover, investigate)
        DIALOGUE: 'dialogue', // Talk-focused quests (negotiate, persuade)
        COLLECT: 'collect',   // Collection quests (gather items)
        ESCORT: 'escort',     // Protection/escort quests
        BOSS: 'boss'          // Boss fight quests
    }),

    QUEST_DIFFICULTIES: Object.freeze({
        EASY: 'easy',         // Starter quests, low risk
        MEDIUM: 'medium',     // Standard difficulty
        HARD: 'hard',         // Challenging, requires preparation
        DEADLY: 'deadly',     // Boss fights, high risk
        NIGHTMARE: 'nightmare' // Doom world end-game
    }),

    // 🖤 Helper: Get quest category info 💀
    getQuestCategory(quest) {
        return {
            type: quest?.type || this.QUEST_TYPES.SIDE,
            subtype: quest?.subtype || null,
            difficulty: quest?.difficulty || this.QUEST_DIFFICULTIES.MEDIUM,
            chain: quest?.chain || null,
            act: quest?.act || null,
            region: quest?.location || null
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 📋 STATE - tracking your endless servitude
    // ═══════════════════════════════════════════════════════════════
    initialized: false,
    activeQuests: {},
    completedQuests: [],
    failedQuests: [],
    discoveredQuests: [], // quests the player knows about (shows details in log)
    questCompletionTimes: {}, // when quests were completed (for cooldowns and display)
    questLogOpen: false,

    // 🖤 TRACKED QUEST - the one quest to rule them all (only one at a time)
    trackedQuestId: null,
    questMarkerElement: null,
    trackerHidden: false, // 🖤💀 Track if user manually hid the tracker widget 💀

    // ═══════════════════════════════════════════════════════════════
    // 🎒 QUEST ITEMS - special items that exist only for quests
    // ═══════════════════════════════════════════════════════════════
    // these weigh nothing and can't be dropped because we're not monsters
    questItems: {
        // delivery packages
        greendale_package: { name: 'Package for Ironforge', description: 'Sealed merchant goods', quest: 'delivery_ironforge', icon: '📦' },
        ironforge_ore_sample: { name: 'Ore Sample', description: 'High quality iron ore sample', quest: 'ore_quality_check', icon: '⛏️' },
        silk_shipment: { name: 'Silk Shipment', description: 'Delicate silk fabric from Jade Harbor', quest: 'silk_delivery', icon: '🧵' },
        medicine_bundle: { name: 'Medicine Bundle', description: 'Urgently needed medical supplies', quest: 'urgent_medicine', icon: '💊' },
        secret_letter: { name: 'Sealed Letter', description: 'A letter with a wax seal - do not open', quest: 'secret_message', icon: '✉️' },
        royal_decree: { name: 'Royal Decree', description: 'Official document from the Capital', quest: 'royal_summons', icon: '📜' },

        // dungeon artifacts
        blade_of_virtue: { name: 'Blade of Virtue', description: 'A legendary sword pulled from the Shadow Tower', quest: 'retrieve_blade', icon: '⚔️' },
        crystal_heart: { name: 'Crystal Heart', description: 'A pulsing gem from the Crystal Cave', quest: 'crystal_retrieval', icon: '💎' },
        ancient_tome: { name: 'Ancient Tome', description: 'Forbidden knowledge from the ruins', quest: 'forbidden_knowledge', icon: '📕' },
        dragon_scale: { name: 'Dragon Scale', description: 'Proof of a legendary kill', quest: 'dragon_slayer', icon: '🐉' },
        shadow_essence: { name: 'Shadow Essence', description: 'Dark energy from Malachar', quest: 'defeat_malachar', icon: '🖤' },
        frozen_tear: { name: 'Frozen Tear', description: 'Ice crystal from the Frost Lord', quest: 'defeat_frost_lord', icon: '❄️' },

        // evidence/proof items
        bandit_insignia: { name: 'Bandit Insignia', description: 'Proof of bandits eliminated', quest: 'bandit_cleanup', icon: '🏴' },
        wolf_pelts: { name: 'Wolf Pelts', description: 'Quality pelts from dangerous wolves', quest: 'wolf_hunt', icon: '🐺' },
        goblin_ears: { name: 'Goblin Ears', description: 'Disgusting but required proof', quest: 'goblin_menace', icon: '👂' },

        // special quest keys
        shadow_key: { name: 'Shadow Key', description: 'Opens the inner sanctum', quest: 'shadow_tower_chain', icon: '🗝️' },
        mine_pass: { name: 'Mining Pass', description: 'Authorization to enter deep mines', quest: 'deep_mine_access', icon: '🎫' },
        guild_token: { name: 'Guild Token', description: 'Proof of guild membership', quest: 'join_guild', icon: '🏅' },

        // main story quest items (Act 1: The Shadow Rising)
        shipping_manifest: { name: 'Shipping Manifest', description: 'Coded manifest revealing suspicious cargo shipments', quest: 'act1_quest5', icon: '📋' },
        traders_journal: { name: "Trader's Journal", description: 'Final entries mention the Shadow Tower and The Black Ledger', quest: 'act1_quest6', icon: '📖' }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💰 REWARD BALANCING TIERS - so players don't get rich too fast
    // ═══════════════════════════════════════════════════════════════
    // These define acceptable reward ranges by difficulty tier
    // Quests should stay within these bounds for balanced progression
    rewardTiers: {
        easy: {
            gold: { min: 20, max: 80 },
            experience: { min: 15, max: 40 },
            reputation: { min: 5, max: 15 },
            maxItemValue: 100,        // don't give items worth more than this
            maxItemQuantity: 5,       // don't give more than this many of any item
            description: 'Starter quests, simple tasks'
        },
        medium: {
            gold: { min: 50, max: 200 },
            experience: { min: 30, max: 100 },
            reputation: { min: 10, max: 30 },
            maxItemValue: 500,
            maxItemQuantity: 5,
            description: 'Standard quests requiring travel or moderate challenge'
        },
        hard: {
            gold: { min: 150, max: 400 },
            experience: { min: 75, max: 200 },
            reputation: { min: 20, max: 50 },
            maxItemValue: 1500,
            maxItemQuantity: 3,
            description: 'Challenging quests with combat or dungeon exploration'
        },
        legendary: {
            gold: { min: 500, max: 2000 },
            experience: { min: 300, max: 750 },
            reputation: { min: 50, max: 100 },
            maxItemValue: 10000,      // legendary items allowed
            maxItemQuantity: 2,
            description: 'Epic boss fights and story finales'
        }
    },

    // Chain order multipliers - earlier quests in a chain give less
    // to prevent rushing through early quests for big rewards
    chainOrderMultiplier: {
        1: 0.8,   // First quest in chain gives 80% rewards
        2: 0.9,   // Second gives 90%
        3: 1.0,   // Third gives full rewards
        4: 1.0,
        5: 1.1,   // Fifth and later give 110% (building to climax)
        6: 1.2    // Final quests give 120%
    },

    // Validate quest rewards against tier limits
    validateRewards(questId) {
        const quest = this.quests[questId];
        if (!quest) return { valid: false, error: 'Quest not found' };

        const tier = this.rewardTiers[quest.difficulty] || this.rewardTiers.medium;
        const rewards = quest.rewards || {};
        const warnings = [];

        // Check gold
        if (rewards.gold) {
            if (rewards.gold < tier.gold.min) {
                warnings.push(`Gold (${rewards.gold}) below tier minimum (${tier.gold.min})`);
            }
            if (rewards.gold > tier.gold.max) {
                warnings.push(`Gold (${rewards.gold}) exceeds tier maximum (${tier.gold.max})`);
            }
        }

        // Check experience
        if (rewards.experience) {
            if (rewards.experience < tier.experience.min) {
                warnings.push(`XP (${rewards.experience}) below tier minimum (${tier.experience.min})`);
            }
            if (rewards.experience > tier.experience.max) {
                warnings.push(`XP (${rewards.experience}) exceeds tier maximum (${tier.experience.max})`);
            }
        }

        // Check reputation
        if (rewards.reputation) {
            if (rewards.reputation > tier.reputation.max) {
                warnings.push(`Reputation (${rewards.reputation}) exceeds tier maximum (${tier.reputation.max})`);
            }
        }

        return {
            valid: warnings.length === 0,
            questId,
            difficulty: quest.difficulty,
            tier,
            warnings,
            rewards
        };
    },

    // Get scaled rewards based on chain position
    getScaledRewards(questId) {
        const quest = this.quests[questId];
        if (!quest || !quest.rewards) return quest?.rewards || {};

        const chainOrder = quest.chainOrder || 3; // default to no scaling
        const multiplier = this.chainOrderMultiplier[Math.min(chainOrder, 6)] || 1.0;

        const scaled = { ...quest.rewards };
        if (scaled.gold) scaled.gold = Math.round(scaled.gold * multiplier);
        if (scaled.experience) scaled.experience = Math.round(scaled.experience * multiplier);
        // Don't scale reputation or items - those are fixed

        return scaled;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📚 QUEST DATABASE - every damn task in this godforsaken realm
    // ═══════════════════════════════════════════════════════════════
    // 🖤 Main story quests (35 quests) are loaded from main-quests.js via loadExternalQuests() 💀
    // 🖤 Side quests (50 quests) are loaded from side-quests.js via loadExternalQuests() 💀
    // 🖤 Doom quests (15 quests) are loaded from doom-quests.js via loadExternalQuests() 💀
    // 🖤 Only LOCATION-SPECIFIC quests remain hardcoded below 💀
    quests: {
        // ═══════════════════════════════════════════════════════════
        // 🌾 GREENDALE QUESTS - starter zone, farming community
        // ═══════════════════════════════════════════════════════════
        greendale_herbs: {
            id: 'greendale_herbs',
            name: 'Healing Herbs',
            description: 'The apothecary needs healing herbs for medicine.',
            giver: 'apothecary',
            giverName: 'Helena the Healer',
            location: 'greendale',
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'herbs', count: 5, current: 0, description: 'Gather 5 healing herbs' }
            ],
            rewards: { gold: 40, items: { potion: 2 }, reputation: 10, experience: 20 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 1, // days
            prerequisite: null,
            dialogue: {
                offer: "I'm running low on herbs, and the sick keep coming. Could you gather 5 healing herbs? I'll make it worth your while.",
                progress: "Still gathering? The herb patches are east of the village, near the forest edge.",
                complete: "Perfect specimens! Here's your payment, and some potions - you might need them out there."
            }
        },

        greendale_wheat: {
            id: 'greendale_wheat',
            name: 'Wheat for the Mill',
            description: 'The miller needs 20 wheat to keep the village fed.',
            giver: 'merchant',
            giverName: 'Thomas the Miller',
            location: 'greendale',
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'wheat', count: 20, current: 0, description: 'Gather 20 wheat' }
            ],
            rewards: { gold: 60, items: { bread: 5 }, reputation: 10, experience: 25 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "The harvest was poor this season. I need 20 wheat to keep bread on everyone's table. Can you help?",
                progress: "Any luck finding wheat? Try the farms south of town, or buy from traveling merchants.",
                complete: "This will keep us fed for weeks! Here - fresh bread, and coin for your trouble."
            }
        },

        greendale_delivery_ironforge: {
            id: 'greendale_delivery_ironforge',
            name: 'Package to Ironforge',
            description: 'Deliver a merchant package to the blacksmith in Ironforge City.',
            giver: 'merchant',
            giverName: 'Merchant Giles',
            location: 'greendale',
            type: 'delivery',
            difficulty: 'medium',
            objectives: [
                { type: 'carry', item: 'greendale_package', count: 1, current: 0, description: 'Carry the package' },
                { type: 'visit', location: 'ironforge_city', completed: false, description: 'Travel to Ironforge City' },
                { type: 'talk', npc: 'blacksmith', completed: false, description: 'Deliver to blacksmith' }
            ],
            rewards: { gold: 80, reputation: 15, experience: 40 },
            givesQuestItem: 'greendale_package',
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 1,
            prerequisite: null,
            dialogue: {
                offer: "I've got a package that needs to reach the blacksmith in Ironforge City. Time-sensitive goods. Can you make the delivery?",
                progress: "The blacksmith's name is Grimjaw. Surly fellow, but he pays well.",
                complete: "Delivered on time! You're reliable. Here's your cut."
            }
        },

        greendale_rat_problem: {
            id: 'greendale_rat_problem',
            name: 'Rat Problem',
            description: 'Giant rats infest the inn storehouse. Clear them out.',
            giver: 'innkeeper',
            giverName: 'Martha the Innkeep',
            location: 'riverside_inn', // 🖤💀 Fixed: Innkeeper is at the inn!
            type: 'combat',
            difficulty: 'easy',
            objectives: [
                { type: 'defeat', enemy: 'giant_rat', count: 5, current: 0, description: 'Kill 5 giant rats' }
            ],
            rewards: { gold: 35, items: { food: 3 }, reputation: 10, experience: 30 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 3,
            prerequisite: null,
            dialogue: {
                offer: "Damn rats are in the storehouse again! Big ones too. Clear 'em out and I'll feed you for free.",
                progress: "Still rats in there? Hit 'em hard - they bite back.",
                complete: "Finally! No more squeaking at night. Here, eat up - you've earned it."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ⚒️ IRONFORGE CITY QUESTS - mining/smithing hub
        // ═══════════════════════════════════════════════════════════
        ironforge_ore: {
            id: 'ironforge_ore',
            name: 'Iron in the Fire',
            description: 'The blacksmith needs iron ore for a special commission.',
            giver: 'blacksmith',
            giverName: 'Grimjaw the Smith',
            location: 'ironforge_city',
            type: 'collect',
            difficulty: 'medium',
            objectives: [
                { type: 'collect', item: 'iron_ore', count: 10, current: 0, description: 'Gather 10 iron ore' }
            ],
            rewards: { gold: 120, items: { sword: 1 }, reputation: 20, experience: 60 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "Got a big order but I'm short on ore. Bring me 10 iron ore and I'll forge you something special.",
                progress: "The mines to the north have the best ore. Watch out for creatures down there.",
                complete: "Quality stuff! Here - I forged this blade. Consider it a bonus for good work."
            }
        },

        ironforge_bandit_hunt: {
            id: 'ironforge_bandit_hunt',
            name: 'Bandit Bounty',
            description: 'Bandits raid the trade routes. Eliminate them.',
            giver: 'guard',
            giverName: 'Captain Aldric',
            location: 'ironforge_city',
            type: 'combat',
            difficulty: 'hard',
            objectives: [
                { type: 'defeat', enemy: 'bandit', count: 5, current: 0, description: 'Kill 5 bandits' },
                { type: 'collect', item: 'bandit_insignia', count: 3, current: 0, description: 'Collect 3 insignias as proof' }
            ],
            rewards: { gold: 200, reputation: 30, experience: 100 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 3,
            prerequisite: null,
            dialogue: {
                offer: "Bandits are bleeding the trade routes dry. 5 gold per head, plus a bonus for insignias. You in?",
                progress: "They camp in the forests between towns. Hit fast, hit hard.",
                complete: "Five dead bandits. The roads are safer. Here's your bounty."
            }
        },

        ironforge_coal_run: {
            id: 'ironforge_coal_run',
            name: 'Coal for the Forge',
            description: 'The forge is running low on coal.',
            giver: 'blacksmith',
            giverName: 'Grimjaw the Smith',
            location: 'ironforge_city',
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'coal', count: 15, current: 0, description: 'Gather 15 coal' }
            ],
            rewards: { gold: 50, reputation: 10, experience: 30 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 1,
            prerequisite: null,
            dialogue: {
                offer: "Forge is hungry. Need coal. 15 lumps. You get coin. Simple.",
                progress: "Coal. Mines. Get it.",
                complete: "Good coal. Fire burns hot now. Take payment."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 🌊 JADE HARBOR QUESTS - exotic trade hub
        // ═══════════════════════════════════════════════════════════
        jade_silk_delivery: {
            id: 'jade_silk_delivery',
            name: 'Silk Delivery',
            description: 'Deliver precious silk to the Royal Capital.',
            giver: 'merchant',
            giverName: 'Mei Lin',
            location: 'jade_harbor',
            type: 'delivery',
            difficulty: 'medium',
            objectives: [
                { type: 'carry', item: 'silk_shipment', count: 1, current: 0, description: 'Carry silk shipment' },
                { type: 'visit', location: 'royal_capital', completed: false, description: 'Travel to Royal Capital' },
                { type: 'talk', npc: 'merchant', completed: false, description: 'Deliver to noble merchant' }
            ],
            rewards: { gold: 150, items: { silk: 2 }, reputation: 20, experience: 60 },
            givesQuestItem: 'silk_shipment',
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "Finest silk needs to reach the Capital. Nobles pay premium for on-time delivery. Interested?",
                progress: "Handle with care! That silk is worth more than most houses.",
                complete: "Safe delivery. The nobles are pleased. Your reputation grows."
            }
        },

        jade_fish_feast: {
            id: 'jade_fish_feast',
            name: 'Fresh Catch',
            description: 'The inn is hosting a feast. They need fresh fish from Jade Harbor.',
            giver: 'innkeeper',
            giverName: 'Madame Chen',
            location: 'silk_road_inn', // 🖤💀 Fixed: Innkeeper is at Silk Road Inn (connects to jade_harbor)
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'fish', count: 15, current: 0, description: 'Catch 15 fish' }
            ],
            rewards: { gold: 45, items: { ale: 3 }, reputation: 10, experience: 25 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 1,
            prerequisite: null,
            dialogue: {
                offer: "Big feast tonight! Need fish - lots of it. 15 should do. Quick now!",
                progress: "The docks have fishermen selling catch. Or try your luck in the water.",
                complete: "Just in time! Here's payment, and drink with us tonight!"
            }
        },

        jade_smuggler_intel: {
            id: 'jade_smuggler_intel',
            name: 'Smuggler\'s Cove',
            description: 'Investigate the smuggler operations at the cove.',
            giver: 'guard',
            giverName: 'Harbor Master Chen',
            location: 'jade_harbor',
            type: 'exploration',
            difficulty: 'hard',
            objectives: [
                { type: 'visit', location: 'smugglers_cove', completed: false, description: 'Find Smuggler\'s Cove' },
                { type: 'explore', dungeon: 'smugglers_cove', rooms: 5, current: 0, description: 'Investigate the hideout' },
                { type: 'defeat', enemy: 'smuggler', count: 3, current: 0, description: 'Deal with guards' }
            ],
            rewards: { gold: 250, items: { exotic_goods: 2 }, reputation: 35, experience: 120 },
            timeLimit: null,
            repeatable: false,
            prerequisite: null,
            dialogue: {
                offer: "Smugglers operate from a hidden cove. Find it, see what they're moving. If you have to fight... so be it.",
                progress: "Follow the rocky coast south. The cove is hidden but not invisible.",
                complete: "Valuable intel. We'll shut them down. Keep what you found - call it hazard pay."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 👑 ROYAL CAPITAL QUESTS - political intrigue
        // ═══════════════════════════════════════════════════════════
        capital_royal_delivery: {
            id: 'capital_royal_delivery',
            name: 'Royal Summons',
            description: 'Deliver a royal decree to the elder of Greendale.',
            giver: 'guard',
            giverName: 'Royal Herald',
            location: 'royal_capital',
            type: 'delivery',
            difficulty: 'medium',
            objectives: [
                { type: 'carry', item: 'royal_decree', count: 1, current: 0, description: 'Carry the decree' },
                { type: 'visit', location: 'greendale', completed: false, description: 'Return to Greendale' },
                { type: 'talk', npc: 'elder', completed: false, description: 'Deliver to Elder Morin' }
            ],
            rewards: { gold: 100, reputation: 25, experience: 50 },
            givesQuestItem: 'royal_decree',
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: false,
            prerequisite: null,
            dialogue: {
                offer: "The crown has a message for Elder Morin of Greendale. Deliver it promptly and discretely.",
                progress: "Royal business waits for no one. Make haste.",
                complete: "The crown appreciates swift messengers. You may prove useful again."
            }
        },

        capital_noble_wine: {
            id: 'capital_noble_wine',
            name: 'Noble Tastes',
            description: 'A noble requires fine wine from Sunhaven.',
            giver: 'merchant',
            giverName: 'Lord Ashworth\'s Steward',
            location: 'royal_capital',
            type: 'collect',
            difficulty: 'medium',
            objectives: [
                { type: 'visit', location: 'sunhaven', completed: false, description: 'Travel to Sunhaven' },
                { type: 'collect', item: 'wine', count: 5, current: 0, description: 'Acquire 5 bottles of wine' },
                { type: 'talk', npc: 'merchant', completed: false, description: 'Return to the Steward' }
            ],
            rewards: { gold: 180, reputation: 20, experience: 70 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 3,
            prerequisite: null,
            dialogue: {
                offer: "Lord Ashworth desires Sunhaven's finest wine. Five bottles. Price is no object - quality is.",
                progress: "The vineyards of Sunhaven produce the realm's best vintage.",
                complete: "Excellent selection. Lord Ashworth will be pleased. Your discretion is noted."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ☀️ SUNHAVEN QUESTS - wine country, coastal
        // ═══════════════════════════════════════════════════════════
        sunhaven_harvest: {
            id: 'sunhaven_harvest',
            name: 'Harvest Help',
            description: 'The vineyard needs help bringing in the grape harvest.',
            giver: 'merchant',
            giverName: 'Vintner Rosa',
            location: 'sunhaven',
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'grapes', count: 30, current: 0, description: 'Harvest 30 bunches of grapes' }
            ],
            rewards: { gold: 50, items: { wine: 2 }, reputation: 15, experience: 35 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 5,
            prerequisite: null,
            dialogue: {
                offer: "Harvest season and we're short-handed! Help gather grapes and I'll pay well - plus some wine for yourself.",
                progress: "The vines are heavy with fruit. Just pick carefully!",
                complete: "A wonderful harvest! Here's your pay, and a taste of what those grapes become."
            }
        },

        sunhaven_lighthouse: {
            id: 'sunhaven_lighthouse',
            name: 'Light the Way',
            description: 'The lighthouse keeper needs oil to keep ships safe.',
            giver: 'villager',
            giverName: 'Old Samuel',
            location: 'sunhaven',
            type: 'collect',
            difficulty: 'easy',
            objectives: [
                { type: 'collect', item: 'oil', count: 5, current: 0, description: 'Gather 5 barrels of oil' }
            ],
            rewards: { gold: 40, reputation: 10, experience: 25 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "The lighthouse runs on oil. Ships wreck without it. Help an old man keep the light burning?",
                progress: "Merchants sell oil, or you can render it from fish. Whatever works.",
                complete: "The light will burn bright tonight. Ships will find safe harbor. Thank you."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // ❄️ FROSTHOLM QUESTS - northern frontier
        // ═══════════════════════════════════════════════════════════
        frostholm_furs: {
            id: 'frostholm_furs',
            name: 'Winter Pelts',
            description: 'The furrier needs quality pelts for winter gear.',
            giver: 'merchant',
            giverName: 'Bjorn the Furrier',
            location: 'frostholm',
            type: 'collect',
            difficulty: 'medium',
            objectives: [
                { type: 'collect', item: 'furs', count: 8, current: 0, description: 'Collect 8 quality furs' }
            ],
            rewards: { gold: 100, items: { warm_cloak: 1 }, reputation: 15, experience: 50 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "Winter's coming and I need furs. Good ones. Wolves, bears - whatever you can hunt.",
                progress: "The forests are dangerous but full of game. Hunt well.",
                complete: "Fine pelts! Here's a cloak from my best stock. You'll need it up here."
            }
        },

        frostholm_wolf_hunt: {
            id: 'frostholm_wolf_hunt',
            name: 'Wolf Pack',
            description: 'A wolf pack threatens the village. Hunt them down.',
            giver: 'guard',
            giverName: 'Huntmaster Erik',
            location: 'frostholm',
            type: 'combat',
            difficulty: 'hard',
            objectives: [
                { type: 'defeat', enemy: 'wolf', count: 8, current: 0, description: 'Kill 8 wolves' },
                { type: 'defeat', enemy: 'alpha_wolf', count: 1, current: 0, description: 'Kill the alpha' }
            ],
            rewards: { gold: 180, items: { wolf_pelts: 3 }, reputation: 25, experience: 90 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 5,
            prerequisite: null,
            dialogue: {
                offer: "Wolves killed two hunters last week. The pack is bold. We need someone to thin their numbers.",
                progress: "Follow the howls. The alpha is the key - kill it and the pack scatters.",
                complete: "The alpha's dead. The pack will disperse. Frostholm sleeps safer tonight."
            }
        },

        frostholm_frost_lord: {
            id: 'frostholm_frost_lord',
            name: 'The Frost Lord',
            description: 'An ancient ice elemental awakens in the Frozen Cave. Destroy it.',
            giver: 'elder',
            giverName: 'Sage Helga',
            location: 'frostholm',
            type: 'boss',
            difficulty: 'legendary',
            objectives: [
                { type: 'visit', location: 'frozen_cave', completed: false, description: 'Enter the Frozen Cave' },
                { type: 'explore', dungeon: 'frozen_cave', rooms: 8, current: 0, description: 'Reach the inner sanctum' },
                { type: 'defeat', enemy: 'frost_lord', count: 1, current: 0, description: 'Defeat the Frost Lord' },
                { type: 'collect', item: 'frozen_tear', count: 1, current: 0, description: 'Claim the Frozen Tear' }
            ],
            rewards: { gold: 800, items: { frozen_tear: 1, ice_blade: 1 }, reputation: 80, experience: 400 },
            givesQuestItem: 'frozen_tear',
            timeLimit: null,
            repeatable: false,
            prerequisite: 'frostholm_wolf_hunt',
            dialogue: {
                offer: "The Frost Lord stirs. An elemental of ancient power. If it fully awakens, endless winter will consume us all.",
                progress: "The Frozen Cave... I sense immense cold emanating from within.",
                complete: "You've done the impossible. The Frozen Tear... it holds the Frost Lord's power. Guard it well."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 🏗️ STONEBRIDGE QUESTS - construction/quarry town
        // ═══════════════════════════════════════════════════════════
        stonebridge_quarry: {
            id: 'stonebridge_quarry',
            name: 'Stone for the Bridge',
            description: 'The bridge needs repair. Gather quality stone.',
            giver: 'merchant',
            giverName: 'Mason Gerald',
            location: 'stonebridge',
            type: 'collect',
            difficulty: 'medium',
            objectives: [
                { type: 'collect', item: 'stone', count: 20, current: 0, description: 'Quarry 20 stone blocks' }
            ],
            rewards: { gold: 80, reputation: 15, experience: 45 },
            timeLimit: null,
            repeatable: true,
            repeatCooldown: 2,
            prerequisite: null,
            dialogue: {
                offer: "The old bridge is crumbling. I need good stone - 20 blocks. The quarry's open to those who work.",
                progress: "Swing that pickaxe! Quality stone doesn't quarry itself.",
                complete: "Solid work! These blocks will hold for centuries."
            }
        },

        stonebridge_goblin_menace: {
            id: 'stonebridge_goblin_menace',
            name: 'Goblin Menace',
            description: 'Goblins raid from the Shadow Dungeon. Clear them out.',
            giver: 'guard',
            giverName: 'Sergeant Thom',
            location: 'stonebridge',
            type: 'combat',
            difficulty: 'hard',
            objectives: [
                { type: 'defeat', enemy: 'goblin', count: 10, current: 0, description: 'Kill 10 goblins' },
                { type: 'collect', item: 'goblin_ears', count: 5, current: 0, description: 'Collect proof (ears)' }
            ],
            rewards: { gold: 150, reputation: 25, experience: 80 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 4,
            prerequisite: null,
            dialogue: {
                offer: "Goblins from the Shadow Dungeon. Vile creatures. Ten dead ones, five sets of ears as proof. That's the bounty.",
                progress: "They lurk in the dungeon entrance. Nasty but cowardly - kill a few and the rest scatter.",
                complete: "Ears don't lie. Good hunting. The roads are safer."
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 🏰 DUNGEON QUESTS - special dungeon-related missions
        // ═══════════════════════════════════════════════════════════
        dungeon_ancient_tome: {
            id: 'dungeon_ancient_tome',
            name: 'Forbidden Knowledge',
            description: 'An ancient tome lies deep in the Ruins of Eldoria. Retrieve it.',
            giver: 'elder',
            giverName: 'Scholar Aldwin',
            location: 'royal_capital',
            type: 'exploration',
            difficulty: 'hard',
            objectives: [
                { type: 'visit', location: 'ruins_of_eldoria', completed: false, description: 'Find the Ruins' },
                { type: 'explore', dungeon: 'ruins_of_eldoria', rooms: 7, current: 0, description: 'Navigate the ruins' },
                { type: 'collect', item: 'ancient_tome', count: 1, current: 0, description: 'Retrieve the tome' }
            ],
            rewards: { gold: 300, items: { ancient_tome: 1 }, reputation: 40, experience: 150 },
            givesQuestItem: 'ancient_tome',
            timeLimit: null,
            repeatable: false,
            prerequisite: null,
            dialogue: {
                offer: "The Ruins of Eldoria contain an ancient tome of forgotten magic. Dangerous, yes, but the knowledge... invaluable.",
                progress: "The ruins are filled with traps and guardians. Tread carefully.",
                complete: "The tome! Centuries of lost knowledge, recovered! You have my eternal gratitude."
            }
        },

        dungeon_dragon_slayer: {
            id: 'dungeon_dragon_slayer',
            name: 'Dragon Slayer',
            description: 'A dragon nests in the Deep Cavern. Slay it and claim its scale.',
            giver: 'guard',
            giverName: 'Knight Commander Vance',
            location: 'royal_capital',
            type: 'boss',
            difficulty: 'legendary',
            objectives: [
                { type: 'visit', location: 'deep_cavern', completed: false, description: 'Enter the Deep Cavern' },
                { type: 'explore', dungeon: 'deep_cavern', rooms: 10, current: 0, description: 'Find the dragon\'s lair' },
                { type: 'defeat', enemy: 'dragon', count: 1, current: 0, description: 'Slay the dragon' },
                { type: 'collect', item: 'dragon_scale', count: 1, current: 0, description: 'Claim a scale' }
            ],
            rewards: { gold: 2000, items: { dragon_scale: 1, dragonbone_blade: 1 }, reputation: 100, experience: 750 },
            givesQuestItem: 'dragon_scale',
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_tower_assault',
            dialogue: {
                offer: "You've proven yourself against Malachar. Now... a dragon terrorizes the realm. Only a true hero could face such a beast.",
                progress: "The dragon hoards treasure in the deepest cavern. Bring fire resistance. Lots of it.",
                complete: "A dragon slain! You are legend now. The realm will sing of this for generations!"
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 🔁 REPEATABLE DAILY/WEEKLY QUESTS
        // ═══════════════════════════════════════════════════════════
        daily_trade_route: {
            id: 'daily_trade_route',
            name: 'Trade Route Runner',
            description: 'Complete a trade between any two major cities.',
            giver: 'merchant',
            giverName: 'Trader\'s Guild',
            location: 'any',
            type: 'trade',
            difficulty: 'easy',
            objectives: [
                { type: 'trade', count: 1, current: 0, description: 'Complete a trade of 100g or more' }
            ],
            rewards: { gold: 25, reputation: 5, experience: 15 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 1,
            prerequisite: null,
            dialogue: {
                offer: "The guild rewards active traders. Complete a significant trade today for a bonus.",
                progress: "Buy low, sell high. That's the trader's way.",
                complete: "A profitable day! The guild appreciates your contribution."
            }
        },

        weekly_bounty: {
            id: 'weekly_bounty',
            name: 'Weekly Bounty',
            description: 'Defeat enemies threatening the realm.',
            giver: 'guard',
            giverName: 'Bounty Board',
            location: 'any',
            type: 'combat',
            difficulty: 'medium',
            objectives: [
                { type: 'defeat', enemy: 'any', count: 15, current: 0, description: 'Defeat 15 enemies' }
            ],
            rewards: { gold: 100, reputation: 20, experience: 75 },
            timeLimit: null, // No time limits - complete at your own pace
            repeatable: true,
            repeatCooldown: 7,
            prerequisite: null,
            dialogue: {
                offer: "Weekly bounty: 15 threats eliminated, 100 gold reward. Simple as that.",
                progress: "Bandits, wolves, goblins - they all count. Keep fighting.",
                complete: "Fifteen down. The realm is safer. Here's your bounty."
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION - waking up this beast
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) {
            console.log('📜 QuestSystem already awake and judging you');
            return this;
        }

        console.log('📜 QuestSystem dragging itself out of bed...');

        // 🖤 LOAD EXTERNAL QUEST FILES (v0.90+)
        this.loadExternalQuests();

        this.loadQuestProgress();
        this.createQuestLogUI();
        this.setupEventListeners();
        this.initialized = true;

        // 🖤💀 CRITICAL: Initialize quest tracker to ensure visibility on page load! 💀
        setTimeout(() => {
            this.updateQuestTracker();
        }, 500);

        // Count quests by type
        const mainCount = Object.values(this.quests).filter(q => q.type === 'main').length;
        const sideCount = Object.values(this.quests).filter(q => q.type === 'side').length;
        const doomCount = Object.values(this.quests).filter(q => q.type === 'doom').length;
        const otherCount = Object.keys(this.quests).length - mainCount - sideCount - doomCount;

        console.log(`📜 QuestSystem ready - ${Object.keys(this.quests).length} total quests:`);
        console.log(`   🎭 Main Story: ${mainCount} | 🗺️ Side: ${sideCount} | 💀 Doom: ${doomCount} | 📋 Other: ${otherCount}`);
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📦 LOAD EXTERNAL QUEST FILES - The Great Quest Unification
    // ═══════════════════════════════════════════════════════════════
    loadExternalQuests() {
        console.log('📦 Loading external quest files...');

        // 🎭 MAIN QUESTS (35 quests - The Shadow Rising & Black Ledger)
        if (typeof MainQuests !== 'undefined') {
            let mainLoaded = 0;
            // Load all acts
            for (let act = 1; act <= 5; act++) {
                const actData = MainQuests[`act${act}`];
                if (actData?.quests) {
                    for (const [questId, quest] of Object.entries(actData.quests)) {
                        this.quests[questId] = quest;
                        mainLoaded++;
                    }
                }
            }
            // Store wealth gates reference
            this.wealthGates = MainQuests.wealthGates;
            this.storyInfo = MainQuests.storyInfo;
            console.log(`   🎭 MainQuests loaded: ${mainLoaded} quests across 5 acts`);
        } else {
            console.warn('   ⚠️ MainQuests not found - main story quests unavailable');
        }

        // 🗺️ SIDE QUESTS (50 quests - Regional Combat & Trade Chains)
        if (typeof SideQuests !== 'undefined') {
            let sideLoaded = 0;
            const sideQuestsList = SideQuests.getAllQuests?.() || [];
            for (const quest of sideQuestsList) {
                this.quests[quest.id] = quest;
                sideLoaded++;
            }
            // Store side quest metadata
            this.sideQuestInfo = SideQuests.sideQuestInfo;
            console.log(`   🗺️ SideQuests loaded: ${sideLoaded} quests in ${SideQuests.sideQuestInfo?.totalChains || 14} chains`);
        } else {
            console.warn('   ⚠️ SideQuests not found - regional side quests unavailable');
        }

        // 💀 DOOM QUESTS (15 quests + Greedy Won Boss)
        if (typeof DoomQuests !== 'undefined') {
            let doomLoaded = 0;
            const doomQuestsList = DoomQuests.getAllQuests?.() || [];
            for (const quest of doomQuestsList) {
                this.quests[quest.id] = quest;
                doomLoaded++;
            }
            // Store doom world references
            this.doomInfo = DoomQuests.doomInfo;
            this.doomEconomy = DoomQuests.doomEconomy;
            this.doomLocations = DoomQuests.doomLocations;
            this.doomItems = DoomQuests.doomItems;
            this.greedyWon = DoomQuests.greedyWon;
            console.log(`   💀 DoomQuests loaded: ${doomLoaded} quests + Greedy Won boss`);
        } else {
            console.warn('   ⚠️ DoomQuests not found - Doom World content unavailable');
        }

        console.log('📦 External quest loading complete');
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 PERSISTENCE - because losing progress would be too merciful
    // ═══════════════════════════════════════════════════════════════

    // 🖤💀 RESET ALL QUEST STATE - called on New Game to clear old data 💀
    resetAllQuests() {
        console.log('📜 Resetting all quest state for new game...');
        this.activeQuests = {};
        this.completedQuests = [];
        this.failedQuests = [];
        this.discoveredQuests = [];
        this.questCompletionTimes = {};
        this.trackedQuestId = null;

        // Clear quest items from player
        if (typeof game !== 'undefined' && game.player) {
            game.player.questItems = {};
        }

        // Clear from localStorage
        try {
            localStorage.removeItem('medievalTradingGameQuests');
            console.log('📜 Quest localStorage cleared');
        } catch (e) {
            console.warn('📜 Could not clear quest localStorage:', e);
        }

        // Update UI
        this.updateQuestLogUI();
        this.updateQuestTracker();

        console.log('📜 Quest state reset complete - fresh start! 🖤');
    },

    saveQuestProgress() {
        const saveData = {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            failedQuests: this.failedQuests,
            discoveredQuests: this.discoveredQuests,
            questCompletionTimes: this.questCompletionTimes,
            questItemInventory: this.getQuestItemInventory(),
            // 🖤 v0.90+ Save tracked quest
            trackedQuestId: this.trackedQuestId,
            // 🖤💀 SAVE TRACKER VISIBILITY STATE 💀
            trackerHidden: this.trackerHidden || false
        };
        try {
            localStorage.setItem('medievalTradingGameQuests', JSON.stringify(saveData));
        } catch (e) {
            // 🖤 Storage full or blocked - quest save will retry next time
        }
    },

    loadQuestProgress() {
        try {
            const saved = localStorage.getItem('medievalTradingGameQuests');
            if (saved) {
                const data = JSON.parse(saved);
                this.activeQuests = data.activeQuests || {};
                this.completedQuests = data.completedQuests || [];
                this.failedQuests = data.failedQuests || [];
                this.discoveredQuests = data.discoveredQuests || [];
                this.questCompletionTimes = data.questCompletionTimes || {};
                // 🖤💀 RESTORE TRACKER VISIBILITY STATE 💀
                this.trackerHidden = data.trackerHidden === true;
                // 🖤 v0.90+ Restore tracked quest
                if (data.trackedQuestId && this.activeQuests[data.trackedQuestId]) {
                    this.trackedQuestId = data.trackedQuestId;
                    console.log(`🎯 Restored tracked quest: ${this.activeQuests[data.trackedQuestId].name}`);
                    // 🖤 Schedule marker update after maps are rendered 💀
                    setTimeout(() => {
                        this.updateQuestMapMarker();
                        this.updateQuestTracker();
                    }, 1000);
                }

                // Log quest metrics
                const mainCount = this.completedQuests.filter(q => q.startsWith('act')).length;
                const sideCount = this.completedQuests.filter(q =>
                    q.includes('_vermin_') || q.includes('_farm_') || q.includes('_pirates_') ||
                    q.includes('_wine_') || q.includes('_wars_') || q.includes('_steel_') ||
                    q.includes('_smugglers_') || q.includes('_silk_') || q.includes('_guard_') ||
                    q.includes('_noble_') || q.includes('_wolves_') || q.includes('_fur_') ||
                    q.includes('_bandits_') || q.includes('_pioneer_')).length;
                const doomCount = this.completedQuests.filter(q => q.startsWith('doom_')).length;

                console.log(`📜 Loaded quest progress from the abyss:`);
                console.log(`   📋 Active: ${Object.keys(this.activeQuests).length} | Completed: ${this.completedQuests.length}`);
                console.log(`   🎭 Main: ${mainCount}/35 | 🗺️ Side: ${sideCount}/50 | 💀 Doom: ${doomCount}/15`);
            }
        } catch (e) {
            // 🖤 Corrupt quest data - nuke and start fresh
            localStorage.removeItem('medievalTradingGameQuests');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎒 QUEST ITEM HANDLING - weightless burdens
    // ═══════════════════════════════════════════════════════════════
    getQuestItemInventory() {
        const items = {};
        for (const questId in this.activeQuests) {
            const quest = this.activeQuests[questId];
            if (quest.givesQuestItem) {
                items[quest.givesQuestItem] = true;
            }
        }
        return items;
    },

    hasQuestItem(itemId) {
        return this.questItems[itemId] && this.getQuestItemInventory()[itemId];
    },

    isQuestItem(itemId) {
        return !!this.questItems[itemId];
    },

    getQuestItemWeight(itemId) {
        // quest items weigh nothing - small mercy in this cruel world
        return this.isQuestItem(itemId) ? 0 : null;
    },

    canDropItem(itemId) {
        // quest items can't be dropped - you're stuck with them
        return !this.isQuestItem(itemId);
    },

    giveQuestItem(questId) {
        const quest = this.quests[questId];
        if (quest?.givesQuestItem) {
            const itemId = quest.givesQuestItem;
            const itemInfo = this.questItems[itemId];

            // 🖤 Actually ADD the quest item to player's quest inventory! 💀
            if (typeof game !== 'undefined' && game.player) {
                if (!game.player.questItems) {
                    game.player.questItems = {};
                }
                game.player.questItems[itemId] = (game.player.questItems[itemId] || 0) + 1;

                // 🖤 Emit item-received for consistency 💀
                document.dispatchEvent(new CustomEvent('item-received', {
                    detail: { item: itemId, quantity: 1, isQuestItem: true }
                }));
            }

            if (itemInfo && typeof addMessage === 'function') {
                addMessage(`📦 Received quest item: ${itemInfo.name}`, 'success');
            }
            return true;
        }
        return false;
    },

    removeQuestItem(questId) {
        const quest = this.activeQuests[questId] || this.quests[questId];
        if (quest?.givesQuestItem) {
            const itemId = quest.givesQuestItem;

            // 🖤 Actually REMOVE the quest item from player's quest inventory! 💀
            if (typeof game !== 'undefined' && game.player?.questItems?.[itemId]) {
                delete game.player.questItems[itemId];
            }
            return true;
        }
        return false;
    },

    // 🖤 Helper: Check if NPC type matches objective (handles arrays) 💀
    _npcMatchesObjective(npcType, objectiveNpc) {
        if (Array.isArray(objectiveNpc)) {
            return objectiveNpc.includes(npcType);
        }
        return objectiveNpc === npcType;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📜 QUEST MANAGEMENT - the bureaucracy of adventure
    // ═══════════════════════════════════════════════════════════════
    assignQuest(questId, giverNPC = null) {
        const quest = this.quests[questId];
        if (!quest) {
            console.warn(`📜 Quest "${questId}" doesn't exist - nice try`);
            return { success: false, error: 'Quest not found' };
        }

        if (this.activeQuests[questId]) {
            return { success: false, error: 'Quest already active', quest: this.activeQuests[questId] };
        }

        if (this.completedQuests.includes(questId) && !quest.repeatable) {
            return { success: false, error: 'Quest already completed' };
        }

        if (quest.prerequisite && !this.completedQuests.includes(quest.prerequisite)) {
            return { success: false, error: 'Prerequisite not met', prerequisite: quest.prerequisite };
        }

        // check cooldown for repeatable quests
        if (quest.repeatable && quest.repeatCooldown) {
            const lastCompletion = this.getLastCompletionTime(questId);
            if (lastCompletion) {
                const cooldownMs = quest.repeatCooldown * 24 * 60 * 60 * 1000;
                if (Date.now() - lastCompletion < cooldownMs) {
                    return { success: false, error: 'Quest on cooldown' };
                }
            }
        }

        // 🖤 Clone the quest into existence - it lives in your log now, forever
        const activeQuest = {
            ...JSON.parse(JSON.stringify(quest)),
            assignedAt: Date.now(),
            assignedBy: giverNPC?.name || quest.giverName || quest.giver
            // 💀 No expiresAt - quests don't expire, take your sweet time loser
        };

        // 🖤 Handle dynamic location quests - use player's current location 💀
        if (quest.dynamicLocation && typeof game !== 'undefined' && game.currentLocation) {
            activeQuest.location = game.currentLocation.id;
            console.log(`📜 Dynamic quest location set to: ${activeQuest.location}`);
        }

        // 🖤 Null check - objectives might be fucked up 💀
        if (!activeQuest.objectives || !Array.isArray(activeQuest.objectives)) {
            console.warn(`⚠️ Quest ${questId} has invalid objectives array`);
            activeQuest.objectives = [];
        }

        activeQuest.objectives.forEach(obj => {
            if (obj.current !== undefined) obj.current = 0;
            if (obj.completed !== undefined) obj.completed = false;
        });

        this.activeQuests[questId] = activeQuest;

        // mark quest as discovered
        this.discoverQuest(questId);

        // give quest item if applicable
        if (quest.givesQuestItem) {
            this.giveQuestItem(questId);
        }

        this.saveQuestProgress();

        if (typeof addMessage === 'function') {
            addMessage(`New Quest: ${quest.name}`, 'success');
        }

        document.dispatchEvent(new CustomEvent('quest-started', { detail: { quest: activeQuest } }));
        // 🖤 Also emit quest-assigned - PeoplePanel waits for this 💀
        document.dispatchEvent(new CustomEvent('quest-assigned', { detail: { quest: activeQuest, questId } }));
        this.updateQuestLogUI();

        return { success: true, quest: activeQuest };
    },

    checkProgress(questId) {
        const quest = this.activeQuests[questId];
        if (!quest) {
            if (this.completedQuests.includes(questId)) return { status: 'completed', questId };
            if (this.failedQuests.includes(questId)) return { status: 'failed', questId };
            return { status: 'not_started', questId };
        }

        let completedObjectives = 0;
        const totalObjectives = quest.objectives.length;

        quest.objectives.forEach(obj => {
            if (obj.type === 'collect' || obj.type === 'defeat' || obj.type === 'buy' || obj.type === 'trade' || obj.type === 'sell') {
                if ((obj.current || 0) >= obj.count) completedObjectives++;
            } else if (obj.type === 'explore') {
                if ((obj.current || 0) >= obj.rooms) completedObjectives++;
            } else if (obj.completed) {
                completedObjectives++;
            }
        });

        return {
            status: completedObjectives === totalObjectives ? 'ready_to_complete' : 'in_progress',
            questId,
            quest,
            progress: `${completedObjectives}/${totalObjectives}`,
            objectives: quest.objectives,
            timeRemaining: quest.expiresAt ? quest.expiresAt - Date.now() : null
        };
    },

    updateProgress(type, data) {
        let questUpdated = false;

        for (const questId in this.activeQuests) {
            const quest = this.activeQuests[questId];

            for (const objective of quest.objectives) {
                if (objective.type !== type) continue;

                let updated = false;

                switch (type) {
                    case 'collect':
                        if (data.item === objective.item) {
                            objective.current = Math.min((objective.current || 0) + (data.count || 1), objective.count);
                            updated = true;
                        }
                        break;

                    case 'buy':
                        objective.current = Math.min((objective.current || 0) + 1, objective.count);
                        updated = true;
                        break;

                    case 'trade':
                        // 🖤 FIX: Check minValue requirement if specified 💀
                        const tradeValue = data.value || 0;
                        const minValue = objective.minValue || 0;
                        if (tradeValue >= minValue) {
                            objective.current = Math.min((objective.current || 0) + 1, objective.count);
                            updated = true;
                            console.log(`📜 Trade objective progress: ${tradeValue}g trade (min: ${minValue}g) - ${objective.current}/${objective.count}`);
                        } else {
                            console.log(`📜 Trade too small: ${tradeValue}g < ${minValue}g minimum`);
                        }
                        break;

                    case 'defeat':
                        if (data.enemy === objective.enemy || data.enemy === 'any' || objective.enemy === 'any') {
                            objective.current = Math.min((objective.current || 0) + (data.count || 1), objective.count);
                            updated = true;
                        }
                        break;

                    case 'visit':
                    case 'travel': // 🖤💀 Travel is alias for visit - doom quests use this 💀
                        // 🖤 Support both 'location' and 'to' properties for objectives 💀
                        const targetLocation = objective.location || objective.to;
                        if (data.location === targetLocation) {
                            objective.completed = true;
                            updated = true;
                        }
                        break;

                    case 'talk':
                        if (data.npc === objective.npc || data.npcType === objective.npc) {
                            objective.completed = true;
                            updated = true;
                            // 🖤💀 If this talk objective gives an item, add it to correct inventory 💀
                            if (objective.givesItem && typeof game !== 'undefined' && game.player) {
                                const isQuestItemGiven = this.isQuestItem(objective.givesItem);
                                const itemName = isQuestItemGiven && this.questItems[objective.givesItem]?.name
                                    ? this.questItems[objective.givesItem].name
                                    : objective.givesItem.replace(/_/g, ' ');

                                if (isQuestItemGiven) {
                                    // Quest item goes to questItems
                                    if (!game.player.questItems) game.player.questItems = {};
                                    game.player.questItems[objective.givesItem] = (game.player.questItems[objective.givesItem] || 0) + 1;
                                } else {
                                    // Regular item goes to inventory
                                    if (!game.player.inventory) game.player.inventory = {};
                                    game.player.inventory[objective.givesItem] = (game.player.inventory[objective.givesItem] || 0) + 1;
                                }

                                if (typeof addMessage === 'function') {
                                    addMessage(`📜 Received: ${itemName}`, 'quest');
                                }

                                // 🎯 Dispatch item-received event for quest progress tracking
                                document.dispatchEvent(new CustomEvent('item-received', {
                                    detail: { item: objective.givesItem, quantity: 1, source: 'quest_talk', isQuestItem: isQuestItemGiven }
                                }));
                            }
                        }
                        break;

                    case 'explore':
                        if (data.dungeon === objective.dungeon) {
                            objective.current = Math.min((objective.current || 0) + (data.rooms || 1), objective.rooms);
                            updated = true;
                        }
                        break;

                    // 🖤💀 Investigate objective - search a location, may give items 💀
                    case 'investigate':
                        if (data.location === objective.location) {
                            objective.completed = true;
                            updated = true;
                            // 🖤💀 If investigating gives an item, add to inventory 💀
                            if (objective.givesItem && typeof game !== 'undefined' && game.player) {
                                if (!game.player.inventory) game.player.inventory = {};
                                game.player.inventory[objective.givesItem] = (game.player.inventory[objective.givesItem] || 0) + 1;
                                if (typeof addMessage === 'function') {
                                    addMessage(`🔍 Found: ${objective.givesItem.replace(/_/g, ' ')}`, 'quest');
                                }
                            }
                        }
                        break;

                    case 'carry':
                        if (typeof game !== 'undefined' && game.player?.inventory) {
                            if (game.player.inventory[objective.item] >= objective.count) {
                                objective.current = objective.count;
                                updated = true;
                            }
                        }
                        break;

                    // 🖤 Gold objective - check if player has accumulated enough wealth 💀
                    case 'gold':
                        if (typeof game !== 'undefined' && game.player) {
                            const playerGold = game.player.gold || 0;
                            if (playerGold >= objective.amount) {
                                objective.current = objective.amount;
                                objective.completed = true;
                                updated = true;
                            } else {
                                objective.current = playerGold;
                            }
                        }
                        break;

                    // 🖤 Sell objective - track items sold 💀
                    case 'sell':
                        if (data.item === objective.item || !objective.item) {
                            objective.current = Math.min((objective.current || 0) + (data.count || 1), objective.count);
                            updated = true;
                        }
                        break;

                    // 🖤 Decision objective - player made a choice 💀
                    case 'decision':
                        if (objective.choices && objective.choices.includes(data.choice)) {
                            objective.completed = true;
                            objective.choiceMade = data.choice;
                            updated = true;
                        }
                        break;
                }

                if (updated) {
                    questUpdated = true;
                    console.log(`📜 Quest progress: ${quest.name} - ${objective.description || objective.type}`);
                }
            }
        }

        if (questUpdated) {
            this.saveQuestProgress();
            this.updateQuestLogUI();
            this.updateQuestTracker(); // 🖤 FIX: Update tracker widget when progress changes 💀
            this.updateQuestMapMarker(); // 🎯 FIX: Update map marker when objectives complete - moves to next objective location! 💀
            this.checkForAutoComplete();
        }
    },

    checkForAutoComplete() {
        for (const questId in this.activeQuests) {
            const progress = this.checkProgress(questId);
            if (progress.status === 'ready_to_complete') {
                const quest = this.activeQuests[questId];

                // 🖤 Track which quests were already marked ready to avoid spam 💀
                if (!quest._wasReadyNotified) {
                    quest._wasReadyNotified = true;

                    if (typeof addMessage === 'function') {
                        addMessage(`Quest "${quest.name}" ready to turn in!`, 'info');
                    }

                    // 🖤 Emit quest-ready event for NPCVoice to extend conversation 💀
                    document.dispatchEvent(new CustomEvent('quest-ready', {
                        detail: { quest, questId }
                    }));
                }
            }
        }
    },

    completeQuest(questId) {
        const quest = this.activeQuests[questId];
        if (!quest) return { success: false, error: 'Quest not active' };

        const progress = this.checkProgress(questId);
        if (progress.status !== 'ready_to_complete') {
            return { success: false, error: 'Objectives not complete', progress };
        }

        // 🖤 Validate collection objectives - but SKIP if quest requires selling/trading those items! 💀
        // This prevents false "missing items" errors when quest asked player to sell the items
        for (const obj of quest.objectives || []) {
            if (obj.type === 'collect' && obj.item) {
                // 🎯 Check if quest has sell/trade objective for the SAME item
                const hasSellObjective = quest.objectives.some(o =>
                    (o.type === 'sell' || o.type === 'trade') && o.item === obj.item
                );

                // 💀 If quest requires selling/trading the item, don't check inventory!
                if (hasSellObjective) {
                    console.log(`🎯 Quest has sell/trade objective for ${obj.item} - skipping inventory check`);
                    continue;
                }

                // 🖤 Normal collection quest - verify player has items
                // 🎯 Quest items are in questItems inventory, regular items in inventory
                const isQuestItemCheck = this.isQuestItem(obj.item);
                const playerHas = isQuestItemCheck
                    ? (game?.player?.questItems?.[obj.item] || 0)
                    : (game?.player?.inventory?.[obj.item] || 0);

                if (playerHas < obj.count) {
                    console.log(`❌ Quest validation failed: need ${obj.count}x ${obj.item}, player has ${playerHas} (isQuestItem: ${isQuestItemCheck})`);
                    return {
                        success: false,
                        error: 'missing_collection_items',
                        item: obj.item,
                        required: obj.count,
                        playerHas: playerHas,
                        message: `Player needs ${obj.count}x ${obj.item} but only has ${playerHas}`
                    };
                }
            }
        }

        // Use scaled rewards based on chain position for balanced progression
        const baseRewards = quest.rewards || {};
        const scaledRewards = this.getScaledRewards(questId);
        const rewards = { ...baseRewards, ...scaledRewards };

        const rewardsGiven = { gold: 0, items: {}, reputation: 0, experience: 0 };

        if (typeof game !== 'undefined' && game.player) {
            if (rewards.gold) {
                // 🖤💀 Use GoldManager to sync ALL gold displays across the game! 💰
                const newGold = (game.player.gold || 0) + rewards.gold;
                if (typeof GoldManager !== 'undefined' && GoldManager.setGold) {
                    GoldManager.setGold(newGold, `Quest reward: ${quest.name}`);
                } else {
                    game.player.gold = newGold;
                }
                rewardsGiven.gold = rewards.gold;
            }

            if (rewards.items) {
                for (const [item, qty] of Object.entries(rewards.items)) {
                    // don't add quest items to regular inventory
                    if (!this.isQuestItem(item)) {
                        game.player.inventory = game.player.inventory || {};
                        game.player.inventory[item] = (game.player.inventory[item] || 0) + qty;
                        // 🖤 Emit item-received for quest progress tracking 💀
                        document.dispatchEvent(new CustomEvent('item-received', {
                            detail: { item, quantity: qty, source: 'quest_reward' }
                        }));
                    }
                    rewardsGiven.items[item] = qty;
                }
            }

            if (rewards.experience) {
                game.player.experience = (game.player.experience || 0) + rewards.experience;
                rewardsGiven.experience = rewards.experience;
            }
        }

        if (rewards.reputation && typeof NPCRelationshipSystem !== 'undefined') {
            NPCRelationshipSystem.modifyReputation(quest.giver, rewards.reputation);
            rewardsGiven.reputation = rewards.reputation;
        }

        // remove quest item if applicable
        this.removeQuestItem(questId);

        // track completion time for cooldowns
        this.setLastCompletionTime(questId);

        delete this.activeQuests[questId];
        if (!this.completedQuests.includes(questId)) {
            this.completedQuests.push(questId);
        }

        this.saveQuestProgress();

        if (typeof addMessage === 'function') {
            addMessage(`Quest Complete: ${quest.name}!`, 'success');
            if (rewardsGiven.gold) addMessage(`+${rewardsGiven.gold} gold`, 'success');
            if (rewardsGiven.experience) addMessage(`+${rewardsGiven.experience} XP`, 'success');
            if (rewardsGiven.reputation) addMessage(`+${rewardsGiven.reputation} reputation`, 'success'); // 🖤💀 FIXED: Show rep reward message
            for (const [item, qty] of Object.entries(rewardsGiven.items)) {
                addMessage(`+${qty}x ${item}`, 'success');
            }
            // 🖤💀 SEGWAY: Show completion dialogue to explain what happens next! 💀
            if (quest.dialogue?.complete) {
                addMessage(`💬 "${quest.dialogue.complete}"`, 'info');
            }
        }

        document.dispatchEvent(new CustomEvent('quest-completed', { detail: { quest, rewards: rewardsGiven } }));
        // 🖤 Bridge to EventBus - FactionSystem and ReputationSystem listen here 💀
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest-completed', { quest, rewards: rewardsGiven });
            EventBus.emit('quest:completed', { quest, rewards: rewardsGiven });
        }
        this.updateQuestLogUI();

        // 🖤 Auto-offer next quest in chain - keep the story moving! 💀
        if (quest.nextQuest && this.quests[quest.nextQuest]) {
            const nextQuest = this.quests[quest.nextQuest];
            console.log(`📜 Next quest in chain: ${quest.nextQuest} (${nextQuest.name})`);

            // 🦇 Auto-start the next quest if it's a main story quest
            if (nextQuest.type === 'main' || quest.type === 'main') {
                // 🖤💀 Use assignQuest, not startQuest (which doesn't exist!)
                const startResult = this.assignQuest(quest.nextQuest);
                if (startResult && startResult.success) {
                    // 🖤 Auto-track main story quests so wayfinder always points the way
                    this.trackQuest(quest.nextQuest);
                    if (typeof addMessage === 'function') {
                        addMessage(`📜 New Quest: ${nextQuest.name}`, 'info');
                    }
                }
            } else {
                // 🦇 Side quests - just notify player it's available
                if (typeof addMessage === 'function') {
                    addMessage(`📜 New quest available: ${nextQuest.name}`, 'info');
                }
            }
        }

        return { success: true, quest, rewards: rewardsGiven, nextQuest: quest.nextQuest };
    },

    failQuest(questId) {
        const quest = this.activeQuests[questId];
        if (!quest) return { success: false, error: 'Quest not active' };

        this.removeQuestItem(questId);
        delete this.activeQuests[questId];
        if (!this.failedQuests.includes(questId)) {
            this.failedQuests.push(questId);
        }

        this.saveQuestProgress();

        if (typeof addMessage === 'function') {
            addMessage(`Quest Failed: ${quest.name}`, 'danger');
        }

        document.dispatchEvent(new CustomEvent('quest-failed', { detail: { quest } }));
        // 🖤 Bridge to EventBus - ReputationSystem listens for quest:failed 💀
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest-failed', { quest });
            EventBus.emit('quest:failed', { quest });
        }
        this.updateQuestLogUI();

        return { success: true, quest };
    },

    // ⚰️ abandonQuest() RIP - quests are ETERNAL, no backing out now
    // 🖤 you signed up for this shit, now finish it... eventually

    // cooldown tracking - stores in both localStorage and questCompletionTimes
    getLastCompletionTime(questId) {
        // check our tracked times first
        if (this.questCompletionTimes && this.questCompletionTimes[questId]) {
            return this.questCompletionTimes[questId];
        }
        // fallback to localStorage
        try {
            const times = JSON.parse(localStorage.getItem('questCompletionTimes') || '{}');
            return times[questId] || null;
        } catch (e) {
            return null;
        }
    },

    setLastCompletionTime(questId) {
        const now = Date.now();
        // store in our tracked times for UI display
        this.questCompletionTimes = this.questCompletionTimes || {};
        this.questCompletionTimes[questId] = now;
        // also store in localStorage for persistence
        try {
            const times = JSON.parse(localStorage.getItem('questCompletionTimes') || '{}');
            times[questId] = now;
            localStorage.setItem('questCompletionTimes', JSON.stringify(times));
        } catch (e) {
            // 🖤 Storage full or blocked - completion time lost but not critical
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🤖 NPC/API INTEGRATION - what the AI needs to know
    // ═══════════════════════════════════════════════════════════════
    getQuestsForNPC(npcType, location) {
        // 🖤 Check if in doom world for doom quest visibility 💀
        const inDoom = (typeof game !== 'undefined' && game.inDoomWorld) ||
                       (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive);

        return Object.values(this.quests).filter(quest => {
            // 🖤💀 Use _npcMatchesObjective for flexible NPC matching (handles arrays too!)
            if (!this._npcMatchesObjective(npcType, quest.giver)) return false;
            if (quest.location && quest.location !== location && quest.location !== 'any') return false;
            if (this.activeQuests[quest.id]) return false;
            if (this.completedQuests.includes(quest.id) && !quest.repeatable) return false;
            if (quest.prerequisite && !this.completedQuests.includes(quest.prerequisite)) return false;

            // 🖤💀 DOOM QUEST VISIBILITY - Hide doom quests when not in doom world
            if (quest.isDoom && !inDoom) return false;
            // 🖤💀 Hide normal quests when IN doom world (only doom quests available there)
            if (!quest.isDoom && inDoom) return false;

            return true;
        });
    },

    getActiveQuestsForNPC(npcType, location = null) {
        return Object.values(this.activeQuests).filter(quest => {
            // 🖤💀 Use _npcMatchesObjective for flexible NPC matching
            if (!this._npcMatchesObjective(npcType, quest.giver)) return false;
            // 🖤 LOCATION CHECK: Only show quests from NPCs at THIS location (fixes multiple merchants issue)
            if (location && quest.location && quest.location !== location && quest.location !== 'any') return false;
            return true;
        });
    },

    getQuestContextForNPC(npcType, location) {
        const available = this.getQuestsForNPC(npcType, location);
        const active = this.getActiveQuestsForNPC(npcType, location);
        const readyToComplete = active.filter(q => this.checkProgress(q.id).status === 'ready_to_complete');

        // also find quests where this NPC is the delivery TARGET (not the giver)
        const deliveriesToReceive = Object.values(this.activeQuests).filter(q => {
            // look for talk objectives that target this NPC type (handles arrays)
            return q.objectives?.some(obj =>
                obj.type === 'talk' && this._npcMatchesObjective(npcType, obj.npc) && !obj.completed
            );
        });

        let context = '\n[QUESTS YOU CAN OFFER OR CHECK]\n';

        // === READY TO COMPLETE (highest priority) ===
        if (readyToComplete.length > 0) {
            context += '\n🎉 READY TO COMPLETE (player finished these - reward them!):\n';
            readyToComplete.forEach(q => {
                context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                context += `Quest: "${q.name}" (ID: ${q.id})\n`;
                context += `Type: ${q.type}\n`;

                // check if it's a delivery quest that needs item taken
                if (q.type === 'delivery' && q.givesQuestItem) {
                    const itemInfo = this.questItems[q.givesQuestItem];
                    context += `⚠️ DELIVERY QUEST - Take the item first!\n`;
                    context += `  1. Say something like "Ah, you have the ${itemInfo?.name || q.givesQuestItem}!"\n`;
                    context += `  2. Use: {takeQuestItem:${q.givesQuestItem}}\n`;
                    context += `  3. Then: {completeQuest:${q.id}}\n`;
                    context += `  Combined example: "The package! Finally. {takeQuestItem:${q.givesQuestItem}}{completeQuest:${q.id}}"\n`;
                }
                // check if it's a collection quest
                else if (q.type === 'collect') {
                    const collectObj = q.objectives.find(o => o.type === 'collect');
                    if (collectObj) {
                        context += `⚠️ COLLECTION QUEST - Take the items first!\n`;
                        context += `  1. Say something acknowledging the items\n`;
                        context += `  2. Use: {takeCollection:${collectObj.item},${collectObj.count}}\n`;
                        context += `  3. Then: {completeQuest:${q.id}}\n`;
                        context += `  Combined: "Excellent! ${collectObj.count} ${collectObj.item}. {takeCollection:${collectObj.item},${collectObj.count}}{completeQuest:${q.id}}"\n`;
                    }
                } else {
                    context += `  Just use: {completeQuest:${q.id}}\n`;
                }
                context += `Completion dialogue: "${q.dialogue?.complete || 'Well done!'}"\n`;
                context += `Rewards: ${q.rewards.gold}g`;
                if (q.rewards.items) context += `, ${Object.entries(q.rewards.items).map(([k,v]) => `${v}x ${k}`).join(', ')}`;
                context += '\n';
            });
        }

        // === DELIVERIES TO RECEIVE (this NPC is the destination) ===
        if (deliveriesToReceive.length > 0) {
            context += '\n📦 DELIVERIES COMING TO YOU (player may be delivering):\n';
            deliveriesToReceive.forEach(q => {
                const talkObj = q.objectives.find(o => o.type === 'talk' && this._npcMatchesObjective(npcType, o.npc));
                if (!talkObj) return;

                context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                context += `Quest: "${q.name}" (ID: ${q.id})\n`;
                context += `From: ${q.giverName} in ${q.location}\n`;

                if (q.givesQuestItem) {
                    const itemInfo = this.questItems[q.givesQuestItem];
                    context += `Player should have: ${itemInfo?.name || q.givesQuestItem} ${itemInfo?.icon || '📦'}\n`;
                    context += `To accept delivery:\n`;
                    context += `  1. Use: {confirmDelivery:${q.id},${q.givesQuestItem}}\n`;
                    context += `  This marks your objective complete and takes the item.\n`;
                    context += `  The player must return to ${q.giverName} to finish the quest.\n`;
                    context += `Example: "Ah, the delivery from ${q.giverName}! {confirmDelivery:${q.id},${q.givesQuestItem}} Much appreciated."\n`;
                } else {
                    context += `To mark delivery complete: {confirmDelivery:${q.id}}\n`;
                }
            });
        }

        // === IN PROGRESS ===
        if (active.length > 0) {
            const inProgress = active.filter(q => this.checkProgress(q.id).status === 'in_progress');
            if (inProgress.length > 0) {
                context += '\n⏳ IN PROGRESS (ask about their progress):\n';
                inProgress.forEach(q => {
                    const progress = this.checkProgress(q.id);
                    context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    context += `Quest: "${q.name}" (${q.id})\n`;
                    context += `Progress: ${progress.progress}\n`;

                    // show detailed objective status
                    if (progress.objectives) {
                        context += `Objectives:\n`;
                        progress.objectives.forEach(obj => {
                            let status = '';
                            let done = false;
                            if (obj.count !== undefined) {
                                status = `${obj.current || 0}/${obj.count}`;
                                done = (obj.current || 0) >= obj.count;
                            } else if (obj.rooms !== undefined) {
                                status = `${obj.current || 0}/${obj.rooms} rooms`;
                                done = (obj.current || 0) >= obj.rooms;
                            } else {
                                status = obj.completed ? '✓' : '○';
                                done = obj.completed;
                            }
                            context += `  ${done ? '✓' : '○'} ${obj.description || obj.type}: ${status}\n`;
                        });
                    }
                    context += `Progress dialogue: "${q.dialogue?.progress || 'How goes the task?'}"\n`;
                });
            }
        }

        // === AVAILABLE TO OFFER ===
        if (available.length > 0) {
            context += '\n📋 AVAILABLE TO OFFER (use {assignQuest:questId}):\n';
            available.forEach(q => {
                context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                context += `Quest: "${q.name}"\n`;
                context += `ID: ${q.id}\n`;
                context += `Type: ${q.type} | Difficulty: ${q.difficulty}\n`;

                // show what kind of quest this is
                if (q.type === 'delivery' && q.givesQuestItem) {
                    const itemInfo = this.questItems[q.givesQuestItem];
                    context += `📦 DELIVERY QUEST - You give them: ${itemInfo?.name || q.givesQuestItem}\n`;
                    context += `  (Item is given automatically when you assign the quest)\n`;
                } else if (q.type === 'collect') {
                    const collectObj = q.objectives?.find(o => o.type === 'collect');
                    if (collectObj) {
                        context += `🎒 COLLECTION QUEST - They must bring you: ${collectObj.count}x ${collectObj.item}\n`;
                    }
                } else if (q.type === 'combat') {
                    const defeatObj = q.objectives?.find(o => o.type === 'defeat');
                    if (defeatObj) {
                        context += `⚔️ COMBAT QUEST - They must defeat: ${defeatObj.count}x ${defeatObj.enemy}\n`;
                    }
                } else if (q.type === 'boss') {
                    context += `👹 BOSS QUEST - Dangerous dungeon mission\n`;
                } else if (q.type === 'exploration') {
                    context += `🗺️ EXPLORATION QUEST - Dungeon delving required\n`;
                }

                // show objectives summary
                if (q.objectives && q.objectives.length > 0) {
                    context += `Objectives: ${q.objectives.map(o => o.description || `${o.type}`).join(' → ')}\n`;
                }

                context += `Rewards: ${q.rewards.gold}g`;
                if (q.rewards.experience) context += `, ${q.rewards.experience} XP`;
                if (q.rewards.items) context += `, items: ${Object.entries(q.rewards.items).map(([k,v]) => `${v}x ${k}`).join(', ')}`;
                context += '\n';

                // 🦇 timeLimit is DEAD - take your damn time
                if (q.prerequisite) {
                    const prereq = this.quests[q.prerequisite];
                    context += `⚠️ Requires completing "${prereq?.name || q.prerequisite}" first\n`;
                }

                context += `To offer: {assignQuest:${q.id}}\n`;
                context += `Offer dialogue: "${q.dialogue?.offer || 'I have a task for you.'}"\n`;
            });
        }

        if (available.length === 0 && active.length === 0 && deliveriesToReceive.length === 0) {
            context += '\nNo quests available from you right now.\n';
        }

        return context;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 UI - because even suffering needs a pretty interface
    // ═══════════════════════════════════════════════════════════════

    // discover a quest (makes it visible in the log with details)
    discoverQuest(questId) {
        if (!this.discoveredQuests.includes(questId)) {
            this.discoveredQuests.push(questId);
            this.saveQuestProgress();
            console.log(`📜 Quest discovered: ${this.quests[questId]?.name || questId}`);
        }
    },

    // get quest chains for organizing the UI
    getQuestChains() {
        const chains = {};
        Object.values(this.quests).forEach(quest => {
            const chainName = quest.chain || 'side_quests';
            if (!chains[chainName]) {
                chains[chainName] = {
                    name: this.getChainDisplayName(chainName),
                    quests: [],
                    type: quest.type === 'main' ? 'main' : 'side'
                };
            }
            chains[chainName].quests.push(quest);
        });

        // sort quests within chains by chainOrder
        Object.values(chains).forEach(chain => {
            chain.quests.sort((a, b) => (a.chainOrder || 999) - (b.chainOrder || 999));
        });

        return chains;
    },

    getChainDisplayName(chainId) {
        const chainNames = {
            'shadow_rising': '⭐ The Shadow Rising',
            'greendale': '🌾 Greendale Tales',
            'ironforge': '⚒️ Ironforge Duties',
            'jade_harbor': '🚢 Jade Harbor Intrigue',
            'royal_capital': '👑 Royal Affairs',
            'sunhaven': '☀️ Sunhaven Stories',
            'frostholm': '❄️ Frostholm Legends',
            'stonebridge': '🌉 Stonebridge Matters',
            'dungeons': '🏰 Dungeon Delving',
            'repeatable': '🔄 Daily Tasks',
            'side_quests': '📋 Miscellaneous'
        };
        return chainNames[chainId] || chainId;
    },

    // get progress stats for display
    getProgress() {
        const total = Object.keys(this.quests).length;
        const completed = this.completedQuests.length;
        const active = Object.keys(this.activeQuests).length;
        const discovered = this.discoveredQuests.length;
        const percentage = Math.round((completed / total) * 100);
        return { total, completed, active, discovered, percentage };
    },

    createQuestLogUI() {
        // remove existing if present
        const existing = document.getElementById('quest-overlay');
        if (existing) existing.remove();

        // create the overlay matching achievement style
        const overlay = document.createElement('div');
        overlay.id = 'quest-overlay';
        overlay.className = 'quest-overlay';
        overlay.innerHTML = `
            <div class="quest-panel">
                <div class="quest-panel-header">
                    <h2 class="quest-panel-title">📋 Quest Log</h2>
                    <button class="close-quest-panel" onclick="QuestSystem.hideQuestLog()">×</button>
                </div>

                <div class="quest-progress">
                    <span id="quest-progress-text">0 / 0 (0%)</span>
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" id="quest-progress-fill" style="width: 0%"></div>
                    </div>
                </div>

                <div class="quest-categories">
                    <button class="quest-category-btn active" onclick="QuestSystem.filterQuests(this, 'all')">All</button>
                    <button class="quest-category-btn" onclick="QuestSystem.filterQuests(this, 'active')">Active</button>
                    <button class="quest-category-btn" onclick="QuestSystem.filterQuests(this, 'available')">Available</button>
                    <button class="quest-category-btn" onclick="QuestSystem.filterQuests(this, 'main')">Main Story</button>
                    <button class="quest-category-btn" onclick="QuestSystem.filterQuests(this, 'side')">Side Quests</button>
                    <button class="quest-category-btn" onclick="QuestSystem.filterQuests(this, 'completed')">Completed</button>
                </div>

                <div class="quest-grid" id="quest-grid">
                    <!-- quest cards go here -->
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.updateQuestLogUI();
    },

    updateQuestLogUI() {
        // update progress bar
        const progress = this.getProgress();
        const progressText = document.getElementById('quest-progress-text');
        const progressFill = document.getElementById('quest-progress-fill');

        if (progressText) {
            progressText.textContent = `${progress.completed} / ${progress.total} Completed (${progress.percentage}%)`;
        }
        if (progressFill) {
            progressFill.style.width = `${progress.percentage}%`;
        }

        // update grid with current filter
        this.populateQuestGrid(this.currentFilter || 'all');
        this.updateQuestTracker();
    },

    currentFilter: 'all',

    filterQuests(button, category) {
        // update active button
        document.querySelectorAll('.quest-category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        this.currentFilter = category;
        this.populateQuestGrid(category);
    },

    populateQuestGrid(category = 'all') {
        const grid = document.getElementById('quest-grid');
        if (!grid) return;

        grid.innerHTML = '';

        // get all quests organized by chain
        const chains = this.getQuestChains();
        let questsToShow = [];

        // 🖤 O(1) lookups - convert arrays to Sets for this loop (performance fix)
        const completedSet = new Set(this.completedQuests);
        const failedSet = new Set(this.failedQuests);
        const discoveredSet = new Set(this.discoveredQuests);

        // 🖤💀 Check if player has EVER entered doom world - hide doom quests until then (NO SPOILERS!)
        const hasEnteredDoom = this._hasEnteredDoomWorld ||
                               (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.hasEverEntered) ||
                               localStorage.getItem('mtg_hasEnteredDoom') === 'true';

        // filter based on category
        Object.entries(chains).forEach(([chainId, chain]) => {
            chain.quests.forEach(quest => {
                // 🖤💀 HIDE DOOM QUESTS until player has entered doom world - no spoilers!
                const isDoomQuest = quest.isDoom || quest.id?.startsWith('doom_');
                if (isDoomQuest && !hasEnteredDoom) {
                    return; // Skip this quest entirely - player hasn't discovered doom yet
                }

                const isActive = !!this.activeQuests[quest.id];
                const isCompleted = completedSet.has(quest.id);
                const isFailed = failedSet.has(quest.id);
                const isDiscovered = discoveredSet.has(quest.id) || isActive || isCompleted;
                const isMain = quest.type === 'main';

                // 🖤 filter logic - sorting through the chaos
                let show = false;
                const hasMetGiver = this.hasMetNPC(quest.giver);
                const isAvailable = !isActive && !isCompleted && !isFailed && hasMetGiver && this.canStartQuest(quest.id);

                switch (category) {
                    case 'all':
                        show = true;
                        break;
                    case 'active':
                        show = isActive;
                        break;
                    case 'available':
                        // 🦇 only show quests from NPCs we've actually met, you antisocial loser
                        show = isAvailable;
                        break;
                    case 'main':
                        show = isMain;
                        break;
                    case 'side':
                        show = !isMain;
                        break;
                    case 'completed':
                        show = isCompleted;
                        break;
                }

                if (show) {
                    questsToShow.push({
                        quest,
                        chain: chainId,
                        chainName: chain.name,
                        isActive,
                        isCompleted,
                        isFailed,
                        isDiscovered,
                        isMain,
                        isAvailable // 🖤 track if quest is actually available from a met NPC
                    });
                }
            });
        });

        // sort: active first, then completed, then undiscovered
        questsToShow.sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            if (a.isCompleted && !b.isCompleted) return -1;
            if (!a.isCompleted && b.isCompleted) return 1;
            if (a.isDiscovered && !b.isDiscovered) return -1;
            if (!a.isDiscovered && b.isDiscovered) return 1;
            if (a.isMain && !b.isMain) return -1;
            if (!a.isMain && b.isMain) return 1;
            return (a.quest.chainOrder || 999) - (b.quest.chainOrder || 999);
        });

        // 🖤 render cards - birthing quest UI into existence
        questsToShow.forEach(({ quest, chainName, isActive, isCompleted, isFailed, isDiscovered, isMain, isAvailable }) => {
            const card = this.createQuestCard(quest, chainName, isActive, isCompleted, isFailed, isDiscovered, isMain, isAvailable);
            grid.appendChild(card);
        });

        if (questsToShow.length === 0) {
            grid.innerHTML = '<div class="no-quests">No quests match this filter</div>';
        }
    },

    createQuestCard(quest, chainName, isActive, isCompleted, isFailed, isDiscovered, isMain, isAvailable) {
        const card = document.createElement('div');

        // 🦇 determine card state class - what sad state is this quest in?
        let stateClass = 'undiscovered';
        if (isActive) stateClass = 'active';
        else if (isCompleted) stateClass = 'completed';
        else if (isFailed) stateClass = 'failed';
        else if (isAvailable) stateClass = 'available'; // 🖤 actually available from a met NPC
        else if (isDiscovered) stateClass = 'discovered'; // 💀 discovered but not available yet

        card.className = `quest-card ${stateClass} ${isMain ? 'main-quest' : ''} ${quest.difficulty || ''}`;

        // 🖤 Add click handler to open unified quest info panel 💀
        if (isActive || isCompleted || isDiscovered || isAvailable) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.showQuestInfoPanel(quest.id);
            });
        }

        // get quest icon based on type
        const icon = this.getQuestIcon(quest);

        // undiscovered quests show minimal info
        if (!isDiscovered && !isActive && !isCompleted) {
            card.innerHTML = `
                <div class="quest-card-icon">${isMain ? '⭐' : '❓'}</div>
                <div class="quest-card-name">${chainName}</div>
                <div class="quest-card-description">??? Undiscovered ???</div>
                <div class="quest-card-footer">
                    <div class="quest-rarity rarity-${quest.difficulty || 'easy'}">${(quest.difficulty || 'UNKNOWN').toUpperCase()}</div>
                    <div class="quest-locked-badge">HIDDEN</div>
                </div>
            `;
            return card;
        }

        // active quest - show progress
        if (isActive) {
            const activeQuest = this.activeQuests[quest.id];
            const progress = this.checkProgress(quest.id);

            const objectivesHTML = activeQuest.objectives.map(obj => {
                let progressText = '';
                let isDone = false;

                if (obj.count !== undefined) {
                    progressText = `${obj.current || 0}/${obj.count}`;
                    isDone = (obj.current || 0) >= obj.count;
                } else if (obj.rooms !== undefined) {
                    progressText = `${obj.current || 0}/${obj.rooms}`;
                    isDone = (obj.current || 0) >= obj.rooms;
                } else {
                    progressText = obj.completed ? '✓' : '○';
                    isDone = obj.completed;
                }

                return `<div class="quest-objective ${isDone ? 'done' : ''}">${isDone ? '✓' : '○'} ${obj.description || this.getObjectiveText(obj)} ${progressText}</div>`;
            }).join('');

            card.innerHTML = `
                <div class="quest-card-icon">${icon}</div>
                <div class="quest-card-name">${isMain ? '⭐ ' : ''}${quest.name}</div>
                <div class="quest-card-description">${quest.description}</div>
                <div class="quest-objectives-mini">${objectivesHTML}</div>
                <div class="quest-card-footer">
                    <div class="quest-rarity rarity-${quest.difficulty || 'easy'}">${(quest.difficulty || 'EASY').toUpperCase()}</div>
                    ${progress.status === 'ready_to_complete'
                        ? '<div class="quest-ready-badge">READY!</div>'
                        : '<div class="quest-active-badge">IN PROGRESS</div>'
                    }
                </div>
                ${activeQuest.expiresAt ? `<div class="quest-timer">⏰ ${this.formatTimeRemaining(activeQuest.expiresAt - Date.now())}</div>` : ''}
            `;
            return card;
        }

        // completed quest
        if (isCompleted) {
            const completedAt = this.questCompletionTimes[quest.id];
            const dateStr = completedAt ? new Date(completedAt).toLocaleDateString() : '';

            card.innerHTML = `
                <div class="quest-card-icon">${icon}</div>
                <div class="quest-card-name">${isMain ? '⭐ ' : ''}${quest.name}</div>
                <div class="quest-card-description">${quest.description}</div>
                <div class="quest-card-footer">
                    <div class="quest-rarity rarity-${quest.difficulty || 'easy'}">${(quest.difficulty || 'EASY').toUpperCase()}</div>
                    <div class="quest-completed-badge">✓ COMPLETED</div>
                </div>
                ${dateStr ? `<div class="quest-date">Completed on ${dateStr}</div>` : ''}
            `;
            return card;
        }

        // failed quest
        if (isFailed) {
            card.innerHTML = `
                <div class="quest-card-icon">${icon}</div>
                <div class="quest-card-name">${isMain ? '⭐ ' : ''}${quest.name}</div>
                <div class="quest-card-description">${quest.description}</div>
                <div class="quest-card-footer">
                    <div class="quest-rarity rarity-${quest.difficulty || 'easy'}">${(quest.difficulty || 'EASY').toUpperCase()}</div>
                    <div class="quest-failed-badge">✗ FAILED</div>
                </div>
            `;
            return card;
        }

        // available/discovered quest
        const prereqMet = !quest.prerequisite || this.completedQuests.includes(quest.prerequisite);
        const prereqQuest = quest.prerequisite ? this.quests[quest.prerequisite] : null;

        card.innerHTML = `
            <div class="quest-card-icon">${icon}</div>
            <div class="quest-card-name">${isMain ? '⭐ ' : ''}${quest.name}</div>
            <div class="quest-card-description">${quest.description}</div>
            <div class="quest-info-mini">
                <span>📍 ${this.getLocationDisplayName(quest.location)}</span>
                <span>👤 ${quest.giverName || quest.giver}</span>
            </div>
            <div class="quest-rewards-mini">
                ${quest.rewards.gold ? `<span>💰 ${quest.rewards.gold}g</span>` : ''}
                ${quest.rewards.experience ? `<span>⭐ ${quest.rewards.experience} XP</span>` : ''}
            </div>
            <div class="quest-card-footer">
                <div class="quest-rarity rarity-${quest.difficulty || 'easy'}">${(quest.difficulty || 'EASY').toUpperCase()}</div>
                ${prereqMet
                    ? '<div class="quest-available-badge">AVAILABLE</div>'
                    : `<div class="quest-locked-badge">🔒 Requires: ${prereqQuest?.name || quest.prerequisite}</div>`
                }
            </div>
        `;

        return card;
    },

    getQuestIcon(quest) {
        const icons = {
            'main': '⭐',
            'delivery': '📦',
            'collect': '🎒',
            'combat': '⚔️',
            'boss': '👹',
            'exploration': '🗺️',
            'talk': '💬',
            'repeatable': '🔄',
            'side': '📋'
        };
        return icons[quest.type] || '📜';
    },

    getLocationDisplayName(locationId) {
        const names = {
            'greendale': 'Greendale',
            'ironforge_city': 'Ironforge City',
            'jade_harbor': 'Jade Harbor',
            'royal_capital': 'Royal Capital',
            'sunhaven': 'Sunhaven',
            'frostholm': 'Frostholm',
            'stonebridge': 'Stonebridge',
            'shadow_tower': 'Shadow Tower',
            'crystal_cave': 'Crystal Cave',
            'frost_peak': 'Frost Peak',
            'any': 'Any Location'
        };
        return names[locationId] || locationId;
    },

    // 🖤 Get icon for quest type 💀
    getQuestTypeIcon(questType) {
        const icons = {
            'main': '⚔️',
            'side': '📜',
            'doom': '💀',
            'trade': '💰',
            'combat': '🗡️',
            'exploration': '🗺️',
            'delivery': '📦',
            'escort': '🛡️',
            'bounty': '🎯',
            'mystery': '🔮',
            'repeatable': '🔄'
        };
        return icons[questType] || '📋';
    },

    getObjectiveText(objective) {
        switch (objective.type) {
            case 'collect': return `Collect ${objective.item}`;
            case 'defeat': return `Defeat ${objective.enemy}`;
            case 'visit': return `Visit ${objective.location}`;
            case 'travel': return `Travel to ${objective.to || objective.location}`; // 🖤💀 Doom quests use travel 💀
            case 'talk': return `Talk to ${objective.npc}`;
            case 'buy': return 'Make a purchase';
            case 'trade': return 'Complete a trade';
            case 'carry': return `Carry ${objective.item}`;
            case 'explore': return `Explore ${objective.dungeon}`;
            case 'investigate': return `Search ${objective.location}`; // 🖤💀 Investigation objectives 💀
            default: return objective.type;
        }
    },

    formatTimeRemaining(ms) {
        if (ms <= 0) return 'EXPIRED';
        const hours = Math.floor(ms / 3600000);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    },

    // 🖤💀 QUEST TRACKER STATE - track expanded/minimized mode 💀
    trackerExpanded: false,
    expandedChains: {}, // Track which chains are expanded in chain view

    updateQuestTracker() {
        let tracker = document.getElementById('quest-tracker');
        if (!tracker) {
            tracker = document.createElement('div');
            tracker.id = 'quest-tracker';
            tracker.className = 'quest-tracker';
            document.body.appendChild(tracker);
        }

        const activeQuestCount = Object.keys(this.activeQuests).length;

        // 🖤 Don't show if user manually hid it
        if (this.trackerHidden) {
            tracker.classList.add('hidden');
            return;
        }

        tracker.classList.remove('hidden');

        // 🖤 Position quest tracker below player info panel (side-panel) - ONLY if not dragged 💀
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel && !tracker.dataset.userDragged) {
            const sidePanelRect = sidePanel.getBoundingClientRect();
            tracker.style.top = (sidePanelRect.bottom + 10) + 'px';
            tracker.style.right = (window.innerWidth - sidePanelRect.right) + 'px';
            tracker.style.left = 'auto';
        }

        // 🖤💀 BUILD THE QUEST CHAIN VIEW 💀
        const chainHTML = this.buildQuestChainView();

        tracker.innerHTML = `
            <div class="tracker-header">
                <span class="drag-grip">⋮⋮</span>
                <span class="tracker-title">Quest Chain 🔗</span>
                <button class="tracker-expand-btn" onclick="QuestSystem.toggleTrackerExpand()" title="${this.trackerExpanded ? 'Minimize' : 'Expand'}">
                    ${this.trackerExpanded ? '▼' : '▲'}
                </button>
                <button class="tracker-close" onclick="QuestSystem.hideQuestTracker()" title="Close">×</button>
            </div>
            <div class="tracker-content ${this.trackerExpanded ? 'expanded' : 'minimized'}">
                ${chainHTML}
            </div>
        `;

        // 🖤 Setup dragging - must re-attach after innerHTML changes
        if (typeof DraggablePanels !== 'undefined') {
            this.setupTrackerDragging(tracker);
        }

        // 🎯 Add tracker styles
        this.addTrackerStyles();

        // 🖤💀 SYNC panel button state with actual tracker visibility 💀
        if (typeof PanelManager !== 'undefined' && PanelManager.updateToolbarButtons) {
            PanelManager.updateToolbarButtons();
        }
    },

    // 🖤💀 BUILD QUEST CHAIN VISUALIZATION 💀
    buildQuestChainView() {
        // 🦇 Group quests intelligently
        const chains = {
            'shadow_rising': [],  // Main story
            'doom_world': [],     // Doom quests
            'greendale': [],      // Location quests
            'ironforge': [],
            'jade_harbor': [],
            'sunhaven': [],
            'frostholm': [],
            'royal_capital': [],
            'riverside': [],
            'repeatable': []      // Trading/daily quests
        };

        const allQuests = { ...this.quests };

        // Build chain structure
        for (const [questId, quest] of Object.entries(allQuests)) {
            // 🖤 Priority: explicit chain > location-based > repeatable > misc
            if (quest.chain === 'shadow_rising') {
                chains['shadow_rising'].push({ ...quest, id: questId });
            } else if (quest.chain === 'doom_world' || quest.isDoom || questId.startsWith('doom_')) {
                chains['doom_world'].push({ ...quest, id: questId });
            } else if (quest.location) {
                // Group by location
                const loc = quest.location.toLowerCase();
                if (loc.includes('greendale') || loc === 'riverside_inn') {
                    chains['greendale'].push({ ...quest, id: questId });
                } else if (loc.includes('ironforge')) {
                    chains['ironforge'].push({ ...quest, id: questId });
                } else if (loc.includes('jade')) {
                    chains['jade_harbor'].push({ ...quest, id: questId });
                } else if (loc.includes('sunhaven')) {
                    chains['sunhaven'].push({ ...quest, id: questId });
                } else if (loc.includes('frost')) {
                    chains['frostholm'].push({ ...quest, id: questId });
                } else if (loc.includes('royal') || loc.includes('capital')) {
                    chains['royal_capital'].push({ ...quest, id: questId });
                } else if (quest.repeatable) {
                    chains['repeatable'].push({ ...quest, id: questId });
                } else {
                    chains['repeatable'].push({ ...quest, id: questId });
                }
            } else if (quest.repeatable) {
                chains['repeatable'].push({ ...quest, id: questId });
            } else {
                chains['repeatable'].push({ ...quest, id: questId });
            }
        }

        // Sort each chain - main story by act/order, others alphabetically
        chains['shadow_rising'].sort((a, b) => {
            const actA = a.act || 0;
            const actB = b.act || 0;
            if (actA !== actB) return actA - actB;
            return (a.actOrder || 0) - (b.actOrder || 0);
        });

        chains['doom_world'].sort((a, b) => (a.actOrder || 0) - (b.actOrder || 0));

        // Sort location quests alphabetically
        for (const loc of ['greendale', 'ironforge', 'jade_harbor', 'sunhaven', 'frostholm', 'royal_capital', 'riverside', 'repeatable']) {
            chains[loc].sort((a, b) => a.name.localeCompare(b.name));
        }

        // 🖤 Build HTML for each non-empty chain
        let html = '';
        const chainOrder = ['shadow_rising', 'doom_world', 'greendale', 'ironforge', 'jade_harbor', 'sunhaven', 'frostholm', 'royal_capital', 'repeatable'];

        for (const chainName of chainOrder) {
            const quests = chains[chainName];
            if (quests.length === 0) continue;

            // 🖤💀 FIX: Only show chains that have at least one ACTIVE or COMPLETED quest 💀
            // NO "discovered but not started" - Gee doesn't want those as they're still spoilers!
            // Only show quests the player is WORKING ON or HAS FINISHED.
            const engagedQuests = quests.filter(quest => {
                const isCompleted = this.completedQuests.includes(quest.id);
                const isActive = !!this.activeQuests[quest.id];
                // 🖤 STRICT: Only active or completed - NOT just discovered! 💀
                return isCompleted || isActive;
            });

            // 🖤 Skip chains where player has NO engaged quests 💀
            if (engagedQuests.length === 0) continue;

            const chainExpanded = this.expandedChains[chainName] || false;
            const chainDisplayName = this.getChainDisplayName(chainName);

            // Count quest statuses in this chain
            const completedCount = engagedQuests.filter(q => this.completedQuests.includes(q.id)).length;
            const activeCount = engagedQuests.filter(q => this.activeQuests[q.id]).length;
            const totalCount = engagedQuests.length;

            // 🖤 Auto-expand chains with active quests
            const hasActiveQuest = activeCount > 0;

            html += `
                <div class="chain-section ${chainExpanded ? 'expanded' : ''} ${hasActiveQuest ? 'has-active' : ''}">
                    <div class="chain-header" onclick="event.stopPropagation(); QuestSystem.toggleChainExpand('${chainName}')">
                        <span class="chain-arrow">${chainExpanded ? '▼' : '▶'}</span>
                        <span class="chain-name">${chainDisplayName}</span>
                        <span class="chain-progress ${activeCount > 0 ? 'active' : ''}">${completedCount}/${totalCount}</span>
                    </div>
                    <div class="chain-quests ${chainExpanded ? 'visible' : 'hidden'}">
                        ${this.buildChainQuestList(engagedQuests)}
                    </div>
                </div>
            `;
        }

        return html || '<div class="no-quests">No active quests</div>';
    },

    // 🖤💀 BUILD QUEST LIST FOR A CHAIN 💀
    // NOTE: Only receives ENGAGED quests (completed or active) - NO discovered-only spoilers!
    buildChainQuestList(quests) {
        return quests.map((quest, index) => {
            const isCompleted = this.completedQuests.includes(quest.id);
            const isActive = !!this.activeQuests[quest.id];
            const isTracked = this.trackedQuestId === quest.id;
            const isExpanded = this._expandedQuestId === quest.id; // 🖤💀 NEW: Check if this quest is expanded

            // 🦇 Determine quest status for styling - only active or completed possible here!
            let status = 'active';
            let statusIcon = '📍';
            let statusClass = 'quest-active';

            if (isCompleted) {
                status = 'completed';
                statusIcon = '✅';
                statusClass = 'quest-completed';
            } else if (isActive) {
                const progress = this.checkProgress(quest.id);
                if (progress.status === 'ready_to_complete') {
                    status = 'ready';
                    statusIcon = '🎉';
                    statusClass = 'quest-ready';
                }
                // else: uses default active status set above
            }

            // 🖤 Build connector line (except for first quest)
            const connector = index > 0 ? '<div class="quest-connector">│</div>' : '';

            // 🖤💀 FIX: Show details INLINE when this specific quest is clicked/expanded 💀
            const showDetails = isExpanded && (isActive || isCompleted);

            // 🖤💀 Build quest row with expand arrow indicator for inline details
            const isRepeatable = quest.repeatable;
            const expandArrow = (isActive || isCompleted) ? `<span class="quest-expand-arrow" onclick="event.stopPropagation(); QuestSystem.handleChainQuestExpand('${quest.id}')">${isExpanded ? '▼' : '▶'}</span>` : '';

            // 🖤💀 Bullseye badge toggles tracking - clickable!
            const trackingBadge = isTracked
                ? `<span class="tracked-badge clickable" onclick="event.stopPropagation(); QuestSystem.untrackQuest(); QuestSystem.updateQuestTracker();" title="Untrack quest">🎯</span>`
                : '';

            return `
                ${connector}
                <div class="chain-quest ${statusClass} ${isTracked ? 'tracked' : ''} ${isRepeatable ? 'repeatable' : ''} ${isExpanded ? 'expanded' : ''}"
                     onclick="event.stopPropagation(); QuestSystem.showQuestInfo('${quest.id}')"
                     data-quest-id="${quest.id}">
                    <div class="quest-row-header">
                        ${expandArrow}
                        <span class="quest-status-icon">${statusIcon}</span>
                        <span class="quest-chain-name">${quest.name}</span>
                        ${isRepeatable && !isActive && !isCompleted ? '<span class="repeat-icon">🔄</span>' : ''}
                        ${trackingBadge}
                    </div>
                    ${showDetails ? this.buildQuestDetailsInline(quest) : ''}
                </div>
            `;
        }).join('');
    },

    // 🖤💀 BUILD INLINE QUEST DETAILS (shows inside tracker, not overlay) 💀
    buildQuestDetailsInline(quest) {
        const activeQuest = this.activeQuests[quest.id];
        const isCompleted = this.completedQuests.includes(quest.id);

        if (isCompleted) {
            // Completed quest - show completion message + rewards earned
            return `<div class="quest-details-inline completed-details">
                <div class="detail-complete-msg">✓ Quest Complete!</div>
                ${quest.rewards ? `<div class="detail-rewards">Rewards: ${quest.rewards.gold || 0}g${quest.rewards.experience ? `, ${quest.rewards.experience}xp` : ''}</div>` : ''}
            </div>`;
        }

        if (!activeQuest) return '';

        // Active quest - show objectives + actions
        const objectives = activeQuest.objectives || [];
        const objHTML = objectives.map(obj => {
            const isCountBased = ['collect', 'defeat', 'buy', 'trade', 'sell'].includes(obj.type);
            const isExplore = obj.type === 'explore';
            const isComplete = isCountBased ? (obj.current || 0) >= obj.count :
                               isExplore ? (obj.current || 0) >= obj.rooms :
                               obj.completed;
            const icon = isComplete ? '✅' : '⬜';
            const countText = obj.count ? ` (${obj.current || 0}/${obj.count})` :
                              obj.rooms ? ` (${obj.current || 0}/${obj.rooms})` : '';
            return `<div class="detail-objective ${isComplete ? 'done' : ''}">${icon} ${obj.description}${countText}</div>`;
        }).join('');

        // 🖤💀 NO TRACK BUTTON - bullseye badge handles tracking! 💀

        return `<div class="quest-details-inline">
            <div class="detail-objectives">${objHTML}</div>
        </div>`;
    },

    // 🖤💀 BUILD QUEST DETAILS (for expanded view) 💀
    buildQuestDetails(quest) {
        const activeQuest = this.activeQuests[quest.id];
        if (!activeQuest) {
            // Completed quest - just show completion message
            return `<div class="quest-details completed-details">
                <span class="detail-complete-msg">✓ Quest Complete</span>
            </div>`;
        }

        // Active quest - show objectives
        const objectives = activeQuest.objectives || [];
        const objHTML = objectives.slice(0, 3).map(obj => {
            const isCountBased = ['collect', 'defeat', 'buy', 'trade', 'sell'].includes(obj.type);
            const isExplore = obj.type === 'explore';
            const isComplete = isCountBased ? (obj.current || 0) >= obj.count :
                               isExplore ? (obj.current || 0) >= obj.rooms :
                               obj.completed;
            const icon = isComplete ? '✓' : '○';
            const countText = obj.count ? ` ${obj.current || 0}/${obj.count}` :
                              obj.rooms ? ` ${obj.current || 0}/${obj.rooms}` : '';
            return `<div class="detail-objective ${isComplete ? 'done' : ''}">${icon} ${obj.description}${countText}</div>`;
        }).join('');

        return `<div class="quest-details">${objHTML}</div>`;
    },

    // 🖤💀 HANDLE CLICK ON QUEST CARD - Opens full quest details panel 💀
    handleChainQuestClick(questId, status) {
        // This function is no longer used - clicking quest card calls showQuestInfo directly
        this.showQuestInfo(questId);
    },

    // 🖤💀 HANDLE CLICK ON EXPAND ARROW - Toggles inline details 💀
    handleChainQuestExpand(questId) {
        // 🖤 Toggle this quest's expanded state INLINE (no overlay!)
        if (this._expandedQuestId === questId) {
            // Clicking same quest - collapse it
            this._expandedQuestId = null;
        } else {
            // Expand this quest's details inline
            this._expandedQuestId = questId;
        }
        // Refresh tracker to show/hide details
        this.updateQuestTracker();
    },

    // 🖤💀 TOGGLE CHAIN EXPAND/COLLAPSE 💀
    toggleChainExpand(chainName) {
        this.expandedChains[chainName] = !this.expandedChains[chainName];
        this.updateQuestTracker();
    },

    // 🖤💀 TOGGLE TRACKER EXPAND/MINIMIZE 💀
    toggleTrackerExpand() {
        this.trackerExpanded = !this.trackerExpanded;
        this.updateQuestTracker();
    },

    // 🖤💀 GET DISPLAY NAME FOR CHAIN 💀
    getChainDisplayName(chainName) {
        const names = {
            'shadow_rising': '⚔️ Shadow Rising (Main Story)',
            'doom_world': '💀 Doom World',
            'greendale': '🌾 Greendale',
            'ironforge': '⚒️ Ironforge City',
            'jade_harbor': '🌊 Jade Harbor',
            'sunhaven': '☀️ Sunhaven',
            'frostholm': '❄️ Frostholm',
            'royal_capital': '👑 Royal Capital',
            'riverside': '🏠 Riverside',
            'repeatable': '🔄 Repeatable Tasks',
            'misc': '📋 Miscellaneous',
            'side': '🌟 Side Quests',
            'daily': '🔄 Daily Tasks'
        };
        return names[chainName] || `📜 ${chainName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    },

    // 🖤 Add styles for the improved tracker
    addTrackerStyles() {
        if (document.getElementById('quest-tracker-styles')) return;

        const style = document.createElement('style');
        style.id = 'quest-tracker-styles';
        // 🖤💀 QUEST CHAIN TRACKER STYLES 💀
        style.textContent = `
            /* 🖤 Expand button */
            .tracker-expand-btn {
                background: rgba(79, 195, 247, 0.2);
                border: none;
                border-radius: 3px;
                color: #4fc3f7;
                cursor: pointer;
                padding: 2px 6px;
                font-size: 10px;
                margin-right: 4px;
            }
            .tracker-expand-btn:hover {
                background: rgba(79, 195, 247, 0.4);
            }

            /* 🖤 Content modes */
            .tracker-content.minimized {
                max-height: 200px;
                overflow-y: auto;
            }
            .tracker-content.expanded {
                max-height: 400px;
                overflow-y: auto;
            }

            /* 🔗 Chain Section */
            .chain-section {
                margin-bottom: 2px;
            }
            .chain-header {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                background: rgba(30, 30, 50, 0.8);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .chain-header:hover {
                background: rgba(50, 50, 80, 0.9);
            }
            .chain-arrow {
                font-size: 10px;
                color: #4fc3f7;
                width: 12px;
            }
            .chain-name {
                flex: 1;
                font-size: 11px;
                font-weight: bold;
                color: #ffd700;
            }
            .chain-progress {
                font-size: 10px;
                color: #888;
                padding: 1px 6px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }

            /* 🔗 Chain Quest List */
            .chain-quests {
                padding-left: 12px;
                border-left: 2px solid rgba(79, 195, 247, 0.2);
                margin-left: 8px;
            }
            .chain-quests.hidden {
                display: none;
            }
            .chain-quests.visible {
                display: block;
            }

            /* 📍 Quest Connector Lines */
            .quest-connector {
                color: rgba(79, 195, 247, 0.3);
                font-size: 10px;
                padding-left: 4px;
                line-height: 0.8;
            }

            /* 📜 Individual Quest in Chain */
            .chain-quest {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .chain-quest:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            /* Quest Status Styling */
            /* 🖤💀 Discovered: Quest known but not yet started 💀 */
            .chain-quest.quest-discovered {
                opacity: 0.85;
                background: rgba(255, 193, 7, 0.08);
                border-left: 2px solid rgba(255, 193, 7, 0.4);
            }
            .chain-quest.quest-discovered .quest-chain-name {
                color: #ffc107;
            }
            .chain-quest.quest-active {
                background: rgba(79, 195, 247, 0.1);
                border-left: 3px solid #4fc3f7;
            }
            .chain-quest.quest-active .quest-chain-name {
                color: #4fc3f7;
            }
            .chain-quest.quest-ready {
                background: rgba(129, 199, 132, 0.15);
                border-left: 3px solid #81c784;
            }
            .chain-quest.quest-ready .quest-chain-name {
                color: #81c784;
            }
            .chain-quest.quest-completed {
                opacity: 0.6;
            }
            .chain-quest.quest-completed .quest-chain-name {
                color: #81c784;
                text-decoration: line-through;
            }

            /* Tracked quest highlight */
            .chain-quest.tracked {
                background: rgba(255, 215, 0, 0.15) !important;
                border: 1px solid rgba(255, 215, 0, 0.4);
            }
            .tracked-badge {
                font-size: 10px;
            }

            /* Quest status icons */
            .quest-status-icon {
                font-size: 12px;
                width: 16px;
                text-align: center;
            }
            .quest-chain-name {
                font-size: 11px;
                flex: 1;
            }

            /* Quest details (expanded view) */
            .quest-details {
                width: 100%;
                padding: 4px 0 4px 22px;
                font-size: 10px;
            }
            .detail-objective {
                color: #888;
                padding: 1px 0;
            }
            .detail-objective.done {
                color: #81c784;
                text-decoration: line-through;
                opacity: 0.7;
            }
            .detail-complete-msg {
                color: #81c784;
                font-style: italic;
            }

            /* No quests message */
            .no-quests {
                text-align: center;
                padding: 20px;
                color: #666;
                font-style: italic;
            }

            /* Chain with active quest indicator */
            .chain-section.has-active .chain-header {
                border-left: 3px solid #4fc3f7;
            }
            .chain-progress.active {
                background: rgba(79, 195, 247, 0.3);
                color: #4fc3f7;
            }

            /* Repeatable quest icon */
            .repeat-icon {
                font-size: 10px;
                opacity: 0.7;
            }

            /* 🖤💀 NEW: Quest row header (contains arrow + icon + name) 💀 */
            .quest-row-header {
                display: flex;
                align-items: center;
                gap: 4px;
                width: 100%;
            }
            .quest-expand-arrow {
                font-size: 8px;
                color: #666;
                width: 10px;
                flex-shrink: 0;
            }
            .chain-quest.expanded .quest-expand-arrow {
                color: #4fc3f7;
            }

            /* 🖤💀 NEW: Inline quest details (shows inside tracker) 💀 */
            .quest-details-inline {
                width: 100%;
                padding: 8px 4px 8px 24px;
                margin-top: 4px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                border-left: 2px solid #4fc3f7;
            }
            .quest-details-inline .detail-objectives {
                margin-bottom: 8px;
            }
            .quest-details-inline .detail-objective {
                font-size: 10px;
                color: #aaa;
                padding: 2px 0;
            }
            .quest-details-inline .detail-objective.done {
                color: #81c784;
                text-decoration: line-through;
                opacity: 0.7;
            }
            .quest-details-inline .detail-complete-msg {
                color: #81c784;
                font-weight: bold;
            }
            .quest-details-inline .detail-rewards {
                color: #ffd700;
                font-size: 10px;
                margin-top: 4px;
            }
            .quest-details-inline .detail-actions {
                display: flex;
                gap: 4px;
                margin-top: 6px;
            }
            .inline-track-btn {
                padding: 4px 8px;
                font-size: 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .inline-track-btn.track {
                background: rgba(79, 195, 247, 0.3);
                color: #4fc3f7;
            }
            .inline-track-btn.track:hover {
                background: rgba(79, 195, 247, 0.5);
            }
            .inline-track-btn.untrack {
                background: rgba(244, 67, 54, 0.3);
                color: #f44336;
            }
            .inline-track-btn.untrack:hover {
                background: rgba(244, 67, 54, 0.5);
            }

            /* 🖤 Expanded quest highlight */
            .chain-quest.expanded {
                background: rgba(79, 195, 247, 0.1) !important;
            }

            /* 🖤 Completed inline details */
            .quest-details-inline.completed-details {
                border-left-color: #81c784;
            }
        `;
        document.head.appendChild(style);
    },

    showQuestLog() {
        if (!document.getElementById('quest-overlay')) {
            this.createQuestLogUI();
        }
        const overlay = document.getElementById('quest-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.questLogOpen = true;
            this.updateQuestLogUI();
        }
    },

    hideQuestLog() {
        const overlay = document.getElementById('quest-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.questLogOpen = false;
        }
    },

    // 🖤 Hide the quest tracker widget (user can reopen via panel toolbar or Q key)
    hideQuestTracker() {
        const tracker = document.getElementById('quest-tracker');
        if (tracker) {
            tracker.classList.add('hidden');
            this.trackerHidden = true;
            this.saveQuestProgress(); // 🖤💀 PERSIST tracker state 💀
            // 🖤 Update panel button state 💀
            if (typeof PanelManager !== 'undefined' && PanelManager.updateToolbarButtons) {
                PanelManager.updateToolbarButtons();
            }
            console.log('🖤 Quest tracker hidden - find it in the Panels toolbar or press Q');
        }
    },

    // 🖤 Show the quest tracker widget
    showQuestTracker() {
        this.trackerHidden = false;
        this.updateQuestTracker(); // This will recreate/show it
        this.saveQuestProgress(); // 🖤💀 PERSIST tracker state 💀
        // 🖤 Update panel button state 💀
        if (typeof PanelManager !== 'undefined' && PanelManager.updateToolbarButtons) {
            PanelManager.updateToolbarButtons();
        }
        console.log('🖤 Quest tracker revealed from the shadows');
    },

    // 🖤 Toggle quest tracker visibility
    toggleQuestTracker() {
        const tracker = document.getElementById('quest-tracker');
        if (tracker && !tracker.classList.contains('hidden') && !this.trackerHidden) {
            this.hideQuestTracker();
        } else {
            this.showQuestTracker();
        }
    },

    toggleQuestLog() {
        const overlay = document.getElementById('quest-overlay');
        if (overlay && overlay.classList.contains('active')) {
            this.hideQuestLog();
        } else {
            this.showQuestLog();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎯 QUEST TRACKING - one quest to rule them all
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Track a quest - shows it in the widget and on the map
    trackQuest(questId) {
        if (!this.activeQuests[questId]) {
            console.warn(`🖤 Can't track quest ${questId} - not active`);
            return false;
        }

        // 💀 Untrack current quest first
        if (this.trackedQuestId && this.trackedQuestId !== questId) {
            this.untrackQuest();
        }

        this.trackedQuestId = questId;
        console.log(`🎯 Now tracking quest: ${this.activeQuests[questId].name}`);

        // 🦇 Update the tracker widget to show only this quest
        this.updateQuestTracker();

        // 🖤 Add glowing marker on map for quest destination
        this.updateQuestMapMarker();

        // 💀 Fire event for other systems
        document.dispatchEvent(new CustomEvent('quest-tracked', {
            detail: { questId, quest: this.activeQuests[questId] }
        }));

        return true;
    },

    // 🖤 Untrack current quest
    untrackQuest() {
        if (!this.trackedQuestId) return;

        const oldQuestId = this.trackedQuestId;
        this.trackedQuestId = null;

        // 💀 Remove the map marker
        this.removeQuestMapMarker();

        // 🦇 Update tracker widget
        this.updateQuestTracker();

        console.log(`🎯 Stopped tracking quest`);

        document.dispatchEvent(new CustomEvent('quest-untracked', {
            detail: { questId: oldQuestId }
        }));
    },

    // 🖤 Toggle tracking for a quest
    toggleTrackQuest(questId) {
        if (this.trackedQuestId === questId) {
            this.untrackQuest();
        } else {
            this.trackQuest(questId);
        }
    },

    // 🎯 Get the target location for the tracked quest
    getTrackedQuestLocation() {
        if (!this.trackedQuestId) return null;

        const quest = this.activeQuests[this.trackedQuestId];
        if (!quest || !quest.objectives) return null;

        // 🎯 Check if ALL objectives are complete - if so, point to turn-in location
        const progress = this.checkProgress(this.trackedQuestId);
        if (progress.status === 'ready_to_complete') {
            // Quest ready to turn in - go to turn-in location!
            return quest.turnInLocation || quest.location;
        }

        // 🖤 Find the first incomplete objective with a location
        for (const obj of quest.objectives) {
            if (obj.completed) continue;

            // 🎯 PRIORITY 1: If objective has explicit location field, use it (works for ANY type!)
            if (obj.location) {
                return obj.location;
            }

            // 💀 Visit/travel objective has direct location
            if ((obj.type === 'visit' || obj.type === 'travel') && obj.location) {
                return obj.location;
            }

            // 🦇 Talk objective - need to find where that NPC is
            if (obj.type === 'talk' && obj.npc) {
                // Use objective's location if specified, otherwise quest location
                if (obj.location) {
                    return obj.location;
                } else if (quest.location) {
                    return quest.location;
                } else if (typeof game !== 'undefined' && game.currentLocation) {
                    return game.currentLocation.id;
                }
            }

            // 💀 Explore dungeon - return the dungeon location
            if (obj.type === 'explore' && obj.dungeon) {
                return obj.dungeon;
            }

            // 🖤 Collect/buy/sell/trade - use objective location if specified, otherwise quest location
            if (obj.type === 'collect' || obj.type === 'buy' || obj.type === 'sell' || obj.type === 'trade') {
                return obj.location || quest.location;
            }
        }

        // 💀 Fallback to quest giver location for turn-in
        return quest.turnInLocation || quest.location;
    },

    // 🖤 Get quest info for a specific location (for tooltips) 💀
    getQuestInfoForLocation(locationId) {
        if (!this.trackedQuestId) return null;

        const quest = this.activeQuests[this.trackedQuestId];
        if (!quest || !quest.objectives) return null;

        const targetLocation = this.getTrackedQuestLocation();
        if (targetLocation !== locationId) return null;

        // 🖤 Find the current objective description 💀
        let currentObjective = null;
        for (const obj of quest.objectives) {
            if (!obj.completed) {
                // 🖤 Use description if available, otherwise fall back to getObjectiveText
                currentObjective = obj.description || this.getObjectiveText(obj);
                break;
            }
        }

        return {
            questName: quest.name,
            questId: quest.id,
            objective: currentObjective,
            isTracked: true,
            isDoom: quest.isDoom || quest.id?.startsWith('doom_') // 🖤💀 Flag for doom quest styling
        };
    },

    // 🖤 Update the glowing quest marker on the map
    updateQuestMapMarker() {
        // 💀 Remove old marker first
        this.removeQuestMapMarker();

        const targetLocation = this.getTrackedQuestLocation();
        console.log(`🎯 updateQuestMapMarker called - target: ${targetLocation}, trackedQuestId: ${this.trackedQuestId}`);
        if (!targetLocation) {
            console.log('🎯 No target location found for quest marker');
            return;
        }

        // 🖤 Add animation styles first - needed either way 💀
        this.addQuestMarkerStyles();

        // 🦇 Get the location element on BOTH maps (main world map AND travel panel mini-map)
        // Main map uses .map-location, travel panel uses .mini-map-location
        const mainMapLocationEl = document.querySelector(`.map-location[data-location-id="${targetLocation}"]`);
        const miniMapLocationEl = document.querySelector(`.mini-map-location[data-location-id="${targetLocation}"]`);

        // 🖤 Debug: Check if map containers exist 💀
        const mainMapContainer = document.getElementById('world-map-html');
        const miniMapContainer = document.getElementById('travel-mini-map');
        console.log(`🎯 Map containers: main=${!!mainMapContainer}, mini=${!!miniMapContainer}`);
        console.log(`🎯 Location elements found: main=${!!mainMapLocationEl}, mini=${!!miniMapLocationEl}`);

        // 🖤 Add marker to MAIN WORLD MAP if location is visible 💀
        if (mainMapLocationEl) {
            this.addQuestMarkerToElement(mainMapLocationEl, 'main');
            console.log(`🎯 Quest marker attached to main map location: ${targetLocation}`);
        } else {
            // Location is HIDDEN/UNEXPLORED on main map - create floating marker
            console.log(`🎯 Creating floating marker for main map (location not found)`);
            this.createFloatingQuestMarker(targetLocation, 'main');
        }

        // 🖤 Add marker to TRAVEL PANEL MINI-MAP if location is visible 💀
        if (miniMapLocationEl) {
            this.addQuestMarkerToElement(miniMapLocationEl, 'mini');
            console.log(`🎯 Quest marker attached to mini map location: ${targetLocation}`);
        } else {
            // Location is HIDDEN/UNEXPLORED on mini map - create floating marker
            console.log(`🎯 Creating floating marker for mini map (location not found)`);
            this.createFloatingQuestMarker(targetLocation, 'mini');
        }
    },

    // 🖤 Add quest marker to a specific location element 💀
    // Gold for normal quests, ORANGE for doom quests
    addQuestMarkerToElement(locationEl, mapType = 'main') {
        const marker = document.createElement('div');
        marker.className = `quest-target-marker quest-marker-${mapType}`;
        marker.innerHTML = '🎯';

        // 🖤💀 Check if tracked quest is a doom quest - use ORANGE instead of gold
        const trackedQuest = this.activeQuests[this.trackedQuestId];
        const isDoomQuest = trackedQuest?.isDoom || this.trackedQuestId?.startsWith('doom_');
        const glowColor = isDoomQuest ? 'orange' : 'gold';
        const glowRgba = isDoomQuest ? 'rgba(255, 140, 0, ' : 'rgba(255, 215, 0, ';

        const fontSize = mapType === 'mini' ? '16px' : '20px';
        const topOffset = mapType === 'mini' ? '-12px' : '-15px';

        marker.style.cssText = `
            position: absolute;
            top: ${topOffset};
            left: 50%;
            transform: translateX(-50%);
            font-size: ${fontSize};
            filter: drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 15px ${glowColor});
            animation: quest-marker-bounce 1s ease-in-out infinite;
            pointer-events: none;
            z-index: 100;
        `;

        // 🦇 Add glow effect to the location itself - orange for doom, gold for normal
        locationEl.classList.add('quest-target-glow');
        locationEl.classList.toggle('doom-quest-glow', isDoomQuest);
        locationEl.style.boxShadow = `0 0 20px 10px ${glowRgba}0.6), 0 0 40px 20px ${glowRgba}0.3)`;
        locationEl.style.animation = isDoomQuest ? 'doom-quest-location-pulse 2s ease-in-out infinite' : 'quest-location-pulse 2s ease-in-out infinite';

        // 💀 Append marker to the location
        locationEl.style.position = 'absolute';
        locationEl.appendChild(marker);

        // Store reference for cleanup
        if (mapType === 'main') {
            this.questMarkerElement = marker;
        } else {
            this.questMiniMarkerElement = marker;
        }
    },

    // 🖤 Create a floating quest marker for unexplored locations 💀
    createFloatingQuestMarker(locationId, mapType = 'main') {
        // Get location data from GameWorld
        const location = typeof GameWorld !== 'undefined' ? GameWorld.locations?.[locationId] : null;
        if (!location || !location.mapPosition) {
            console.log(`🎯 Quest target "${locationId}" has no map position`);
            return;
        }

        // 🦇 Find the correct map container based on mapType
        let mapContainer;
        if (mapType === 'mini') {
            mapContainer = document.getElementById('travel-mini-map') ||
                          document.querySelector('.travel-mini-map');
        } else {
            // 🖤 Main map uses world-map-html as the container 💀
            mapContainer = document.getElementById('world-map-html') ||
                          document.querySelector('.world-map-html');
        }

        if (!mapContainer) {
            console.log(`🎯 No ${mapType} map container found for floating quest marker`);
            return;
        }

        // 🖤 Scale position based on map type 💀
        let scaledPos = { ...location.mapPosition };

        if (mapType === 'main') {
            // Main map uses GameWorldRenderer scaling
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.scalePosition) {
                scaledPos = GameWorldRenderer.scalePosition(location.mapPosition);
            }
        } else {
            // 🖤 Mini map uses RAW coordinates directly - no scaling needed! 💀
            // TravelPanelMap.createLocationElement uses location.mapPosition.x/y directly
            // The map container size is 800x600 and coordinates fit within that range
            scaledPos = { ...location.mapPosition };
            console.log(`🎯 Mini map floating marker at raw position: (${scaledPos.x}, ${scaledPos.y})`);
        }

        if (!scaledPos) return;

        // 🖤💀 Check if tracked quest is a doom quest - use ORANGE instead of gold
        const trackedQuest = this.activeQuests[this.trackedQuestId];
        const isDoomQuest = trackedQuest?.isDoom || this.trackedQuestId?.startsWith('doom_');
        const glowColor = isDoomQuest ? 'orange' : 'gold';
        const glowRgba = isDoomQuest ? 'rgba(255, 140, 0, ' : 'rgba(255, 215, 0, ';

        // 🦇 Determine sizes based on map type
        const fontSize = mapType === 'mini' ? '18px' : '28px';
        const glowSize = mapType === 'mini' ? '25px' : '40px';

        // 🦇 Create floating marker element
        const marker = document.createElement('div');
        marker.className = `quest-target-marker floating-quest-marker floating-quest-marker-${mapType}`;
        if (isDoomQuest) marker.classList.add('doom-quest-marker');
        marker.innerHTML = '🎯';
        marker.style.cssText = `
            position: absolute;
            left: ${scaledPos.x}px;
            top: ${scaledPos.y}px;
            transform: translate(-50%, -50%);
            font-size: ${fontSize};
            filter: drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 15px ${glowColor});
            animation: quest-marker-float-bounce 1s ease-in-out infinite;
            pointer-events: none;
            z-index: 150;
        `;

        // 🖤 Create a glowing circle underneath to show the unexplored destination 💀
        const glow = document.createElement('div');
        glow.className = `quest-target-glow-circle quest-glow-${mapType}`;
        if (isDoomQuest) glow.classList.add('doom-quest-glow');
        glow.style.cssText = `
            position: absolute;
            left: ${scaledPos.x}px;
            top: ${scaledPos.y}px;
            transform: translate(-50%, -50%);
            width: ${glowSize};
            height: ${glowSize};
            border-radius: 50%;
            background: radial-gradient(circle, ${glowRgba}0.4) 0%, ${glowRgba}0.1) 50%, transparent 70%);
            box-shadow: 0 0 30px 15px ${glowRgba}0.4), 0 0 60px 30px ${glowRgba}0.2);
            animation: ${isDoomQuest ? 'doom-quest-location-pulse' : 'quest-location-pulse'} 2s ease-in-out infinite;
            pointer-events: none;
            z-index: 140;
        `;

        mapContainer.appendChild(glow);
        mapContainer.appendChild(marker);

        // Store references for cleanup based on map type
        if (mapType === 'main') {
            this.questMarkerElement = marker;
            this.questGlowElement = glow;
        } else {
            this.questMiniMarkerElement = marker;
            this.questMiniGlowElement = glow;
        }

        console.log(`🎯 Floating quest marker (${mapType}) created at unexplored location: ${locationId} (${scaledPos.x}, ${scaledPos.y})`);
    },

    // 💀 Remove the quest map marker from BOTH maps
    removeQuestMapMarker() {
        // 🦇 Remove the MAIN map marker element
        if (this.questMarkerElement && this.questMarkerElement.parentNode) {
            this.questMarkerElement.remove();
        }
        this.questMarkerElement = null;

        // 🖤 Remove MAIN map floating glow circle (for unexplored locations) 💀
        if (this.questGlowElement && this.questGlowElement.parentNode) {
            this.questGlowElement.remove();
        }
        this.questGlowElement = null;

        // 🦇 Remove the MINI map marker element
        if (this.questMiniMarkerElement && this.questMiniMarkerElement.parentNode) {
            this.questMiniMarkerElement.remove();
        }
        this.questMiniMarkerElement = null;

        // 🖤 Remove MINI map floating glow circle 💀
        if (this.questMiniGlowElement && this.questMiniGlowElement.parentNode) {
            this.questMiniGlowElement.remove();
        }
        this.questMiniGlowElement = null;

        // 🦇 Also clean up any orphaned floating markers from BOTH maps
        document.querySelectorAll('.floating-quest-marker, .quest-target-glow-circle, .quest-target-marker').forEach(el => el.remove());

        // 🖤 Remove glow from all location elements (both .map-location and .mini-map-location)
        document.querySelectorAll('.quest-target-glow').forEach(el => {
            el.classList.remove('quest-target-glow');
            el.style.boxShadow = '';
            el.style.animation = '';
        });
    },

    // 🖤 Add CSS for quest marker animations
    addQuestMarkerStyles() {
        if (document.getElementById('quest-marker-styles')) return;

        const style = document.createElement('style');
        style.id = 'quest-marker-styles';
        style.textContent = `
            @keyframes quest-marker-bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-8px); }
            }
            @keyframes quest-marker-float-bounce {
                0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                50% { transform: translate(-50%, -50%) translateY(-12px); }
            }
            @keyframes quest-marker-glow {
                0%, 100% {
                    filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px gold) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
                }
                50% {
                    filter: drop-shadow(0 0 18px gold) drop-shadow(0 0 30px gold) drop-shadow(0 0 45px rgba(255, 215, 0, 0.7));
                }
            }
            @keyframes quest-location-pulse {
                0%, 100% {
                    box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.6), 0 0 40px 20px rgba(255, 215, 0, 0.3);
                }
                50% {
                    box-shadow: 0 0 30px 15px rgba(255, 215, 0, 0.8), 0 0 60px 30px rgba(255, 215, 0, 0.4);
                }
            }
            /* 💀 DOOM QUEST ANIMATIONS - ORANGE instead of gold */
            @keyframes doom-quest-location-pulse {
                0%, 100% {
                    box-shadow: 0 0 20px 10px rgba(255, 140, 0, 0.6), 0 0 40px 20px rgba(255, 140, 0, 0.3);
                }
                50% {
                    box-shadow: 0 0 30px 15px rgba(255, 140, 0, 0.8), 0 0 60px 30px rgba(255, 140, 0, 0.4);
                }
            }
            @keyframes doom-quest-marker-glow {
                0%, 100% {
                    filter: drop-shadow(0 0 12px orange) drop-shadow(0 0 20px orange) drop-shadow(0 0 30px rgba(255, 140, 0, 0.5));
                }
                50% {
                    filter: drop-shadow(0 0 18px orange) drop-shadow(0 0 30px orange) drop-shadow(0 0 45px rgba(255, 140, 0, 0.7));
                }
            }
            .quest-target-glow {
                z-index: 35 !important; /* 🖤 ABOVE weather (15) so quest targets are visible 💀 */
            }
            .doom-quest-glow {
                z-index: 35 !important;
            }
            /* 🖤 Floating marker for unexplored quest locations - extra bounce for visibility 💀 */
            .floating-quest-marker {
                animation: quest-marker-float-bounce 1s ease-in-out infinite, quest-marker-glow 2s ease-in-out infinite !important;
            }
            .floating-quest-marker.doom-quest-marker {
                animation: quest-marker-float-bounce 1s ease-in-out infinite, doom-quest-marker-glow 2s ease-in-out infinite !important;
            }
        `;
        document.head.appendChild(style);
    },

    // 🎯 Unified Quest Info Panel - used for ALL quest displays 🖤💀
    // Options: { isNewQuest: bool, onClose: function, showTrackButton: bool }
    showQuestInfoPanel(questId = null, options = {}) {
        const qId = questId || this.trackedQuestId;
        if (!qId) return;

        const quest = this.activeQuests[qId] || this.quests[qId];
        if (!quest) return;

        // 🖤 Store onClose callback for later
        this._questInfoPanelOnClose = options.onClose || null;

        // 💀 Remove existing panel
        const existing = document.getElementById('quest-info-panel');
        if (existing) existing.remove();

        const progress = this.checkProgress(qId);
        // 🖤 Get location from quest data, not just tracked quest 💀
        const targetLocation = quest.location || this.getTrackedQuestLocation();

        // 🖤 Store the displayed quest's target location for "Show on Map" button 💀
        this._displayedQuestTargetLocation = targetLocation;
        const locationName = targetLocation ? this.getLocationDisplayName(targetLocation) : 'Unknown';

        // 🖤 Determine header based on context
        const isNewQuest = options.isNewQuest || false;
        const headerTitle = isNewQuest ? '📜 New Quest!' : quest.name;
        const headerClass = isNewQuest ? 'quest-info-header new-quest' : 'quest-info-header';

        // 🖤 Build rewards string
        const rewardParts = [];
        if (quest.rewards?.gold) rewardParts.push(`💰 ${quest.rewards.gold}g`);
        if (quest.rewards?.experience) rewardParts.push(`⭐ ${quest.rewards.experience}xp`);
        if (quest.rewards?.reputation) rewardParts.push(`👑 +${quest.rewards.reputation} rep`);
        const rewardsStr = rewardParts.length > 0 ? rewardParts.join(' • ') : 'None';

        // 🖤 Create the unified info panel
        const panel = document.createElement('div');
        panel.id = 'quest-info-panel';
        panel.className = 'quest-info-panel' + (isNewQuest ? ' new-quest-panel' : '');
        panel.innerHTML = `
            <div class="${headerClass}">
                <span class="quest-info-icon">${this.getQuestTypeIcon(quest.type)}</span>
                <h3>${isNewQuest ? quest.name : headerTitle}</h3>
                <button class="quest-info-close" onclick="QuestSystem.hideQuestInfoPanel()">×</button>
            </div>
            ${isNewQuest ? '<div class="quest-info-new-banner">✨ Quest Started! ✨</div>' : ''}
            <div class="quest-info-body">
                <p class="quest-info-desc">${quest.description}</p>
                ${targetLocation ? `
                <div class="quest-info-section">
                    <strong>📍 Location:</strong> ${locationName}
                </div>
                ` : ''}
                <div class="quest-info-section">
                    <strong>📋 Objectives:</strong>
                    <ul class="quest-info-objectives">
                        ${quest.objectives.map(obj => `
                            <li class="${obj.completed ? 'completed' : ''}">
                                ${obj.completed ? '✅' : '⬜'} ${obj.description}
                                ${obj.count ? ` (${obj.current || 0}/${obj.count})` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="quest-info-section">
                    <strong>💎 Rewards:</strong>
                    <span class="quest-rewards">${rewardsStr}</span>
                </div>
                <div class="quest-info-status">
                    Status: <span class="status-${progress.status}">${progress.status.replace(/_/g, ' ')}</span>
                </div>
            </div>
            <div class="quest-info-actions">
                ${this.trackedQuestId === qId
                    ? `<button class="quest-action-btn" onclick="QuestSystem.untrackQuest(); QuestSystem.hideQuestInfoPanel();">🚫 Untrack</button>`
                    : `<button class="quest-action-btn primary" onclick="QuestSystem.trackQuest('${qId}'); QuestSystem.hideQuestInfoPanel();">🎯 Track Quest</button>`
                }
                <button class="quest-action-btn" onclick="QuestSystem.showOnMapAndClose();">🗺️ Show on Map</button>
                ${isNewQuest ? `<button class="quest-action-btn primary" onclick="QuestSystem.hideQuestInfoPanel();">✅ Got it!</button>` : ''}
            </div>
        `;

        // 🦇 Style the panel
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            max-width: 90vw;
            background: linear-gradient(180deg, rgba(40, 40, 70, 0.98) 0%, rgba(25, 25, 45, 0.98) 100%);
            border: 2px solid #ffd700;
            border-radius: 12px;
            padding: 0;
            z-index: 1500;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            color: #fff;
            font-size: 14px;
        `;

        document.body.appendChild(panel);

        // 🖤 Add panel styles
        this.addQuestInfoPanelStyles();
    },

    // 💀 Hide the quest info panel and call onClose callback if set
    hideQuestInfoPanel() {
        const panel = document.getElementById('quest-info-panel');
        if (panel) panel.remove();

        // 🖤 Call onClose callback if it was set 💀
        if (this._questInfoPanelOnClose) {
            const callback = this._questInfoPanelOnClose;
            this._questInfoPanelOnClose = null; // Clear it first to prevent loops
            callback();
        }
    },

    // 🖤 Center the map on the quest target location
    centerMapOnQuestTarget() {
        const targetLocation = this.getTrackedQuestLocation();
        if (!targetLocation) {
            console.log('🎯 No quest target to center on');
            return;
        }

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.centerOnLocation) {
            GameWorldRenderer.centerOnLocation(targetLocation);
            console.log(`🎯 Centered map on ${targetLocation}`);
        }
    },

    // 🖤 Show on Map button - centers map and closes panel WITHOUT triggering onClose callback 💀
    showOnMapAndClose() {
        // 🖤 Clear the callback BEFORE closing so it doesn't trigger
        this._questInfoPanelOnClose = null;

        // 🖤 Get the displayed quest's target location (stored when panel was opened)
        const targetLocation = this._displayedQuestTargetLocation;

        // 🖤 Center map on the quest's location (not just tracked quest!)
        if (targetLocation && typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.centerOnLocation) {
            GameWorldRenderer.centerOnLocation(targetLocation);
            console.log(`🗺️ Centered map on quest location: ${targetLocation} 💀`);
        } else {
            console.log('🗺️ No target location to center on');
        }

        // 🖤 Clear the stored location
        this._displayedQuestTargetLocation = null;

        // 🖤 Close the panel (callback already cleared, won't trigger)
        const panel = document.getElementById('quest-info-panel');
        if (panel) panel.remove();
    },

    // 🦇 Get display name for a location
    getLocationDisplayName(locationId) {
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            const loc = GameWorld.locations[locationId];
            if (loc) return loc.name;
        }
        // 💀 Fallback: prettify the ID
        return locationId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    // 🖤 Add styles for quest info panel
    addQuestInfoPanelStyles() {
        if (document.getElementById('quest-info-panel-styles')) return;

        const style = document.createElement('style');
        style.id = 'quest-info-panel-styles';
        style.textContent = `
            .quest-info-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 15px;
                background: linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, transparent 100%);
                border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 10px 10px 0 0;
            }
            .quest-info-header h3 {
                flex: 1;
                margin: 0;
                font-size: 16px;
                color: #ffd700;
            }
            .quest-info-icon { font-size: 24px; }
            .quest-info-close {
                background: transparent;
                border: none;
                border-radius: 4px;
                width: 28px;
                height: 28px;
                color: #888;
                cursor: pointer;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .quest-info-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
            .quest-info-body { padding: 15px; }
            .quest-info-desc {
                color: #ccc;
                margin-bottom: 15px;
                line-height: 1.4;
                font-style: italic;
            }
            .quest-info-section {
                margin-bottom: 12px;
            }
            .quest-info-section strong {
                color: #4fc3f7;
                display: block;
                margin-bottom: 5px;
            }
            .quest-info-objectives {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .quest-info-objectives li {
                padding: 4px 0;
                color: #ddd;
            }
            .quest-info-objectives li.completed {
                color: #81c784;
                text-decoration: line-through;
            }
            .quest-rewards { color: #ffd700; }
            .quest-info-status {
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                text-align: center;
            }
            .quest-info-status .ready_to_complete { color: #81c784; font-weight: bold; }
            .quest-info-status .in_progress { color: #ffc107; }
            .quest-info-actions {
                display: flex;
                gap: 10px;
                padding: 12px 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .quest-info-actions button {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid rgba(79, 195, 247, 0.5);
                border-radius: 6px;
                background: rgba(79, 195, 247, 0.2);
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            .quest-info-actions button:hover {
                background: rgba(79, 195, 247, 0.4);
                border-color: #4fc3f7;
            }

            /* 🖤 New Quest Panel Styles 💀 */
            .quest-info-panel.new-quest-panel {
                border-color: #90EE90;
                box-shadow: 0 0 30px rgba(144, 238, 144, 0.4), 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            .quest-info-header.new-quest {
                background: linear-gradient(90deg, rgba(144, 238, 144, 0.3) 0%, transparent 100%);
                border-bottom-color: rgba(144, 238, 144, 0.3);
            }
            .quest-info-header.new-quest h3 {
                color: #90EE90;
            }
            .quest-info-new-banner {
                text-align: center;
                padding: 8px;
                background: linear-gradient(90deg, transparent, rgba(144, 238, 144, 0.2), transparent);
                color: #90EE90;
                font-weight: bold;
                font-size: 14px;
                animation: quest-new-pulse 2s ease-in-out infinite;
            }
            @keyframes quest-new-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            .quest-action-btn {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid rgba(79, 195, 247, 0.5);
                border-radius: 6px;
                background: rgba(79, 195, 247, 0.2);
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            .quest-action-btn:hover {
                background: rgba(79, 195, 247, 0.4);
                border-color: #4fc3f7;
            }
            .quest-action-btn.primary {
                background: rgba(144, 238, 144, 0.3);
                border-color: rgba(144, 238, 144, 0.6);
            }
            .quest-action-btn.primary:hover {
                background: rgba(144, 238, 144, 0.5);
                border-color: #90EE90;
            }
            .status-ready_to_complete { color: #81c784; font-weight: bold; }
            .status-in_progress { color: #ffc107; }
            .status-not_started { color: #888; }
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎧 EVENT LISTENERS - watching your every move
    // ═══════════════════════════════════════════════════════════════
    setupEventListeners() {
        // 🖤 Fixed: accept both 'item' and 'itemId' for backwards compatibility 💀
        document.addEventListener('item-received', (e) => {
            const itemId = e.detail.item || e.detail.itemId;
            this.updateProgress('collect', { item: itemId, count: e.detail.quantity || 1 });
        });

        document.addEventListener('item-purchased', (e) => {
            this.updateProgress('buy', { item: e.detail.itemId });
        });

        document.addEventListener('trade-completed', (e) => {
            // 🖤 FIX: trade-cart-panel dispatches 'total' not 'value' 💀
            this.updateProgress('trade', { value: e.detail.total || e.detail.value || 100 });
        });

        document.addEventListener('enemy-defeated', (e) => {
            this.updateProgress('defeat', { enemy: e.detail.enemyType, count: 1 });
        });

        // 🖤 Fixed: was 'location-changed' but travel fires 'player-location-changed' 💀
        document.addEventListener('player-location-changed', (e) => {
            // 🖤💀 CRITICAL FIX: Event detail uses locationId, not location!
            this.updateProgress('visit', { location: e.detail.locationId });
            this.updateProgress('travel', { location: e.detail.locationId }); // 🖤💀 Also trigger travel objectives 💀
        });

        // 🖤💀 NPC interaction event - DON'T auto-complete talk objectives just from opening chat! 💀
        // Talk objectives should only complete when player performs quest action (turn-in, accept, etc.)
        document.addEventListener('npc-interaction', (e) => {
            // 🖤 Only complete talk objectives if this is a quest-related interaction
            // For now, we'll let quest actions (askAboutQuest, completeQuest, etc.) handle completion
            // This event can be used for other tracking purposes
            console.log(`👥 NPC interaction: ${e.detail.npcType} (${e.detail.npcName})`);
        });

        // 🖤💀 Investigation events - searching areas for clues/items 💀
        document.addEventListener('area-investigated', (e) => {
            this.updateProgress('investigate', { location: e.detail.location || e.detail.area });
        });

        document.addEventListener('dungeon-room-explored', (e) => {
            this.updateProgress('explore', { dungeon: e.detail.dungeon, rooms: 1 });
        });

        // 🖤 Gold changes - check wealth gate objectives 💀
        document.addEventListener('gold-changed', (e) => {
            this.updateProgress('gold', { amount: e.detail.newAmount || e.detail.gold });
        });

        // 🖤 Item sold - for sell objectives 💀
        document.addEventListener('item-sold', (e) => {
            this.updateProgress('sell', { item: e.detail.itemId || e.detail.item, count: e.detail.quantity || 1 });
        });

        // 🖤 Player made a decision - for choice quests 💀
        document.addEventListener('player-decision', (e) => {
            this.updateProgress('decision', { choice: e.detail.choice });
        });

        // 🖤 Refresh quest markers when world map overlay is shown 💀
        const worldMapOverlay = document.getElementById('world-map-overlay');
        if (worldMapOverlay) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        const isActive = worldMapOverlay.classList.contains('active');
                        if (isActive && this.trackedQuestId) {
                            // 🎯 Map is now visible - refresh markers
                            setTimeout(() => this.updateQuestMapMarker(), 100);
                        }
                    }
                });
            });
            observer.observe(worldMapOverlay, { attributes: true });
        }

        // 💀 No expiration check - quests are IMMORTAL, unlike my sleep schedule
    },

    // 🖤 Setup dragging for the quest tracker panel
    setupTrackerDragging(tracker) {
        const header = tracker.querySelector('.tracker-header');
        if (!header) return;

        // 🦇 Always re-attach listeners since innerHTML destroys them
        header.onmousedown = (e) => {
            // Don't drag if clicking buttons
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('tracker-expand') || e.target.classList.contains('tracker-close')) return;
            e.preventDefault();
            e.stopPropagation();
            DraggablePanels.startDrag(e, tracker);
        };

        header.ontouchstart = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('tracker-expand') || e.target.classList.contains('tracker-close')) return;
            e.preventDefault();
            e.stopPropagation();
            DraggablePanels.startDrag(e, tracker);
        };

        // 💀 Load saved position ONLY on first setup
        if (!tracker.dataset.draggable) {
            tracker.dataset.draggable = 'true';
            const positions = DraggablePanels.getAllPositions();
            if (positions['quest-tracker']) {
                const pos = positions['quest-tracker'];
                tracker.style.position = 'fixed';
                tracker.style.left = pos.left;
                tracker.style.top = pos.top;
                tracker.style.right = 'auto';
                tracker.style.bottom = 'auto';
                // 🖤 If there's a saved position, user dragged it before - respect that 💀
                tracker.dataset.userDragged = 'true';
            }
            console.log('🖤 Quest tracker drag setup complete');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 UTILITIES - misc bullshit
    // ═══════════════════════════════════════════════════════════════
    getStatus() {
        return {
            active: Object.keys(this.activeQuests).length,
            completed: this.completedQuests.length,
            failed: this.failedQuests.length,
            total: Object.keys(this.quests).length
        };
    },

    getMainQuestProgress() {
        const mainQuests = Object.values(this.quests).filter(q => q.type === 'main');
        const completed = mainQuests.filter(q => this.completedQuests.includes(q.id));
        return {
            total: mainQuests.length,
            completed: completed.length,
            currentChapter: completed.length + 1
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🦇 NPC MET CHECK - have you even talked to this person, you hermit?
    // ═══════════════════════════════════════════════════════════════
    hasMetNPC(npcId) {
        // 🖤 Check if player has interacted with this NPC via relationships
        if (typeof NPCRelationshipSystem !== 'undefined') {
            const rel = NPCRelationshipSystem.relationships?.[npcId];
            if (rel) return true;
        }

        // 🦇 fallback - check if we've discovered any quests from this NPC
        // (means we must have talked to them at some point)
        for (const questId of this.discoveredQuests) {
            const quest = this.quests[questId];
            if (quest && quest.giver === npcId) return true;
        }

        // 💀 also check active and completed quests
        for (const questId of [...Object.keys(this.activeQuests), ...this.completedQuests]) {
            const quest = this.quests[questId] || this.activeQuests[questId];
            if (quest && quest.giver === npcId) return true;
        }

        return false;
    },

    // 🔮 Check if player can actually start this quest (prereqs met, not already done)
    canStartQuest(questId) {
        const quest = this.quests[questId];
        if (!quest) return false;

        // 💀 already active or completed? nope
        if (this.activeQuests[questId]) return false;
        if (this.completedQuests.includes(questId) && !quest.repeatable) return false;

        // 🖤 check prerequisites - did you do the homework?
        if (quest.prerequisite) {
            if (!this.completedQuests.includes(quest.prerequisite)) return false;
        }

        // 🦇 check required quests array
        if (quest.requiredQuests) {
            for (const reqId of quest.requiredQuests) {
                if (!this.completedQuests.includes(reqId)) return false;
            }
        }

        return true;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL BINDING - infecting the window object
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.QuestSystem = QuestSystem;
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => QuestSystem.init());
    } else {
        QuestSystem.init();
    }
}

console.log('📜 QuestSystem loaded... your suffering awaits');
