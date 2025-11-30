// ═══════════════════════════════════════════════════════════════
// 📜 QUEST SYSTEM - the chains that bind you to this damn game
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// every task, every fetch quest, every "go kill 10 rats" moment
// all flows through the NPCs who pretend to give a shit about you
// quest items weigh nothing because even the game pities you
// ═══════════════════════════════════════════════════════════════

const QuestSystem = {
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
        guild_token: { name: 'Guild Token', description: 'Proof of guild membership', quest: 'join_guild', icon: '🏅' }
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
    quests: {
        // ═══════════════════════════════════════════════════════════
        // 🌟 MAIN STORY QUEST CHAIN - The Shadow Rising
        // ═══════════════════════════════════════════════════════════
        main_prologue: {
            id: 'main_prologue',
            name: 'A New Beginning',
            description: 'Establish yourself as a trader. Complete your first trade and speak with the village elder.',
            giver: 'elder',
            giverName: 'Elder Morin',
            location: 'greendale',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 1,
            difficulty: 'easy',
            objectives: [
                { type: 'buy', count: 1, current: 0, description: 'Make your first purchase' },
                { type: 'talk', npc: 'elder', completed: false, description: 'Speak with Elder Morin' }
            ],
            rewards: { gold: 25, reputation: 10, experience: 20 },
            timeLimit: null,
            repeatable: false,
            prerequisite: null,
            nextQuest: 'main_rumors',
            dialogue: {
                offer: "Welcome to Greendale, young one. Before we discuss important matters, prove yourself as a trader. Make a purchase, then return to me.",
                progress: "Have you completed a trade yet? The merchants await your coin.",
                complete: "Good. You have the makings of a capable trader. Now, let me tell you of darker things..."
            }
        },

        main_rumors: {
            id: 'main_rumors',
            name: 'Whispers of Darkness',
            // 🖤 REBALANCED: First go SOUTH to Sunhaven, not north to Ironforge!
            description: 'Strange rumors speak of darkness in the realm. Travel to Sunhaven in the south and speak with the harbor master about strange shipments.',
            giver: 'elder',
            giverName: 'Elder Morin',
            location: 'greendale',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 2,
            difficulty: 'easy',
            objectives: [
                { type: 'visit', location: 'sunhaven', completed: false, description: 'Travel to Sunhaven (south)' },
                { type: 'talk', npc: 'merchant', completed: false, description: 'Speak with Harbor Master' }
            ],
            rewards: { gold: 50, reputation: 15, experience: 40 },
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_prologue',
            nextQuest: 'main_eastern_clues',
            dialogue: {
                offer: "Dark rumors reach my ears. Strange shipments pass through Sunhaven to the south. Travel there - the harbor master may know more.",
                progress: "Have you reached Sunhaven yet? The southern coast holds secrets.",
                complete: "What did the harbor master say? The trail leads east..."
            }
        },

        // 🦇 NEW QUEST: Follow clues to the Eastern zone
        main_eastern_clues: {
            id: 'main_eastern_clues',
            name: 'Eastern Whispers',
            description: 'The trail leads to Jade Harbor in the east. Find the smuggler who knows about the dark shipments.',
            giver: 'merchant',
            giverName: 'Harbor Master Rosa',
            location: 'sunhaven',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 3,
            difficulty: 'medium',
            objectives: [
                { type: 'visit', location: 'smugglers_cove', completed: false, description: 'Find Smuggler\'s Cove (via coastal_cave back path or 1000g toll)' },
                { type: 'talk', npc: 'merchant', completed: false, description: 'Speak with the smuggler contact' }
            ],
            rewards: { gold: 150, reputation: 20, experience: 75 },
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_rumors',
            nextQuest: 'main_investigation',
            dialogue: {
                offer: "Dark cargo passes through here, bound for the east. Seek Smuggler's Cove - you can reach it through the coastal caves if you can't afford the eastern toll.",
                progress: "The smugglers are secretive. Approach carefully.",
                complete: "So the darkness flows north from here... to Ironforge. You'll need gold to pay the northern toll - 10,000 gold."
            }
        },

        main_investigation: {
            id: 'main_investigation',
            name: 'Into the Shadows',
            // 💀 This quest requires 10,000g northern toll OR the player to have saved up from trading
            description: 'The trail leads to Ironforge City in the north. Investigate the abandoned mines and find evidence of dark activity. (Requires 10,000g passage fee)',
            giver: 'merchant',
            giverName: 'The Smuggler',
            location: 'smugglers_cove',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 4,
            difficulty: 'medium',
            objectives: [
                { type: 'visit', location: 'ironforge_city', completed: false, description: 'Travel to Ironforge City (10,000g toll)' },
                { type: 'explore', dungeon: 'abandoned_mines', rooms: 5, current: 0, description: 'Explore 5 rooms of the mines' },
                { type: 'collect', item: 'shadow_essence', count: 1, current: 0, description: 'Find evidence of dark magic' }
            ],
            rewards: { gold: 500, items: { potion: 5 }, reputation: 30, experience: 150 },
            givesQuestItem: 'shadow_essence',
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_eastern_clues',
            nextQuest: 'main_preparation',
            dialogue: {
                offer: "The dark cargo came from Ironforge's old mines. Something evil stirs there. You'll need 10,000 gold to pass the northern toll - time to start trading seriously.",
                progress: "Be careful in those mines. Dark things dwell in the deep places.",
                complete: "Shadow essence... by the gods. This confirms our fears. The dark wizard Malachar has returned."
            }
        },

        main_preparation: {
            id: 'main_preparation',
            name: 'Preparing for War',
            description: 'Gather supplies for the assault on the Shadow Tower. The blacksmith needs iron ore, the apothecary needs herbs.',
            giver: 'guard',
            giverName: 'Captain Aldric',
            location: 'ironforge_city',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 5, // 💀 Updated chain order
            difficulty: 'medium',
            objectives: [
                { type: 'collect', item: 'iron_ore', count: 15, current: 0, description: 'Gather 15 iron ore' },
                { type: 'collect', item: 'herbs', count: 10, current: 0, description: 'Gather 10 healing herbs' },
                { type: 'talk', npc: 'blacksmith', completed: false, description: 'Deliver ore to blacksmith' },
                { type: 'talk', npc: 'apothecary', completed: false, description: 'Deliver herbs to apothecary' }
            ],
            rewards: { gold: 300, items: { sword: 1, potion: 5 }, reputation: 25, experience: 100 },
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_investigation',
            nextQuest: 'main_western_approach',
            dialogue: {
                offer: "We must prepare. The blacksmith needs ore for weapons, the apothecary needs herbs for medicine. Gather these supplies - war is coming.",
                progress: "Do you have the supplies? Every moment we delay, Malachar grows stronger.",
                complete: "Excellent work. The blacksmith forged you a blade. But the Shadow Tower lies in the Western Wilds... you'll need 50,000 gold."
            }
        },

        // ⚰️ NEW QUEST: Western approach - the final toll gate
        main_western_approach: {
            id: 'main_western_approach',
            name: 'The Western Gate',
            description: 'The Shadow Tower lies in the Western Wilds. Amass 50,000 gold to pay the passage fee, or find another way through trading and exploration.',
            giver: 'guard',
            giverName: 'Captain Aldric',
            location: 'ironforge_city',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 6,
            difficulty: 'hard',
            objectives: [
                { type: 'gold', amount: 50000, current: 0, description: 'Amass 50,000 gold for western passage' },
                { type: 'visit', location: 'western_outpost', completed: false, description: 'Reach Western Watch outpost' }
            ],
            rewards: { gold: 1000, reputation: 40, experience: 200 },
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_preparation',
            nextQuest: 'main_shadow_key',
            dialogue: {
                offer: "The Shadow Tower lies beyond the Western Watch. The toll is steep - 50,000 gold. Trade wisely, or you'll never reach Malachar.",
                progress: "Have you gathered the gold? The western frontier is expensive to cross.",
                complete: "You've amassed a fortune. Now pay the toll and find the Shadow Key."
            }
        },

        main_shadow_key: {
            id: 'main_shadow_key',
            name: 'The Shadow Key',
            // ⚰️ Shadow Tower is in the Western Wilds (50k toll zone)
            description: 'Find the Shadow Key hidden in the Crystal Cave of the Western Wilds. Without it, the inner sanctum of the Shadow Tower cannot be breached.',
            giver: 'guard',
            giverName: 'Frontier Captain',
            location: 'western_outpost',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 7,
            difficulty: 'hard',
            objectives: [
                { type: 'visit', location: 'druid_grove', completed: false, description: 'Consult the druids about the key' },
                { type: 'explore', dungeon: 'forest_dungeon', rooms: 8, current: 0, description: 'Navigate the Overgrown Crypt' },
                { type: 'collect', item: 'shadow_key', count: 1, current: 0, description: 'Retrieve the Shadow Key' }
            ],
            rewards: { gold: 2000, items: { crystal_heart: 1 }, reputation: 50, experience: 300 },
            givesQuestItem: 'shadow_key',
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_western_approach',
            nextQuest: 'main_tower_assault',
            dialogue: {
                offer: "The Shadow Key is hidden in the Overgrown Crypt. The druids of the grove may know more. Find it, or the Shadow Tower remains sealed.",
                progress: "The crypt is treacherous. Many have entered, few returned. Be cautious.",
                complete: "The Shadow Key! You've done what countless others could not. Now... only the final battle remains."
            }
        },

        main_tower_assault: {
            id: 'main_tower_assault',
            name: 'The Shadow Tower',
            // ⚰️ Final quest - in the Western Wilds endgame zone
            description: 'Assault the Shadow Tower in the depths of the Western Wilds and defeat the dark wizard Malachar once and for all.',
            giver: 'guard',
            giverName: 'Frontier Captain',
            location: 'western_outpost',
            type: 'main',
            chain: 'shadow_rising',
            chainOrder: 8,
            difficulty: 'legendary',
            objectives: [
                { type: 'visit', location: 'shadow_dungeon', completed: false, description: 'Enter the Shadow Dungeon' },
                { type: 'explore', dungeon: 'shadow_dungeon', rooms: 10, current: 0, description: 'Descend to the depths' },
                { type: 'defeat', enemy: 'malachar', count: 1, current: 0, description: 'Defeat Malachar' },
                { type: 'collect', item: 'blade_of_virtue', count: 1, current: 0, description: 'Claim the Blade of Virtue' }
            ],
            rewards: { gold: 10000, items: { blade_of_virtue: 1, dark_staff: 1 }, reputation: 100, experience: 1000 },
            givesQuestItem: 'blade_of_virtue',
            timeLimit: null,
            repeatable: false,
            prerequisite: 'main_shadow_key',
            nextQuest: null,
            dialogue: {
                offer: "The time has come. Take the Shadow Key, descend into the Shadow Dungeon, and end Malachar's reign of terror. The realm is counting on you.",
                progress: "Steel your resolve. Malachar awaits in the dungeon's depths.",
                complete: "You've done it... Malachar is defeated! You are the savior of the realm! The Blade of Virtue is yours by right."
            }
        },

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
            description: 'Giant rats infest the village storehouse. Clear them out.',
            giver: 'innkeeper',
            giverName: 'Martha the Innkeep',
            location: 'greendale',
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
            name: 'Silk Road Express',
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
            description: 'The inn is hosting a feast. They need fresh fish.',
            giver: 'innkeeper',
            giverName: 'Captain Wong',
            location: 'jade_harbor',
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
        this.loadQuestProgress();
        this.createQuestLogUI();
        this.setupEventListeners();
        this.initialized = true;
        console.log(`📜 QuestSystem ready - ${Object.keys(this.quests).length} quests to make you suffer`);
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 PERSISTENCE - because losing progress would be too merciful
    // ═══════════════════════════════════════════════════════════════
    saveQuestProgress() {
        const saveData = {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            failedQuests: this.failedQuests,
            discoveredQuests: this.discoveredQuests,
            questCompletionTimes: this.questCompletionTimes,
            questItemInventory: this.getQuestItemInventory()
        };
        try {
            localStorage.setItem('medievalTradingGameQuests', JSON.stringify(saveData));
        } catch (e) {
            console.error('📜 Save failed - your progress screams into the void:', e);
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
                console.log(`📜 Loaded ${Object.keys(this.activeQuests).length} active, ${this.completedQuests.length} completed quests from the abyss`);
            }
        } catch (e) {
            console.error('📜 Load failed - starting fresh, like your hopes:', e);
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
            if (itemInfo && typeof addMessage === 'function') {
                addMessage(`Received quest item: ${itemInfo.name}`, 'success');
            }
            // quest items are tracked in the quest itself, not regular inventory
            return true;
        }
        return false;
    },

    removeQuestItem(questId) {
        const quest = this.activeQuests[questId] || this.quests[questId];
        if (quest?.givesQuestItem) {
            // item removed when quest completes
            return true;
        }
        return false;
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
            if (obj.type === 'collect' || obj.type === 'defeat' || obj.type === 'buy' || obj.type === 'trade') {
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
                    case 'trade':
                        objective.current = Math.min((objective.current || 0) + 1, objective.count);
                        updated = true;
                        break;

                    case 'defeat':
                        if (data.enemy === objective.enemy || data.enemy === 'any' || objective.enemy === 'any') {
                            objective.current = Math.min((objective.current || 0) + (data.count || 1), objective.count);
                            updated = true;
                        }
                        break;

                    case 'visit':
                        if (data.location === objective.location) {
                            objective.completed = true;
                            updated = true;
                        }
                        break;

                    case 'talk':
                        if (data.npc === objective.npc || data.npcType === objective.npc) {
                            objective.completed = true;
                            updated = true;
                        }
                        break;

                    case 'explore':
                        if (data.dungeon === objective.dungeon) {
                            objective.current = Math.min((objective.current || 0) + (data.rooms || 1), objective.rooms);
                            updated = true;
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
            this.checkForAutoComplete();
        }
    },

    checkForAutoComplete() {
        for (const questId in this.activeQuests) {
            const progress = this.checkProgress(questId);
            if (progress.status === 'ready_to_complete') {
                if (typeof addMessage === 'function') {
                    addMessage(`Quest "${this.activeQuests[questId].name}" ready to turn in!`, 'info');
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

        // Validate all collection objectives have items BEFORE completing
        // This prevents NPCs from completing quests when player doesn't have items
        for (const obj of quest.objectives || []) {
            if (obj.type === 'collect' && obj.item) {
                const playerHas = game?.player?.inventory?.[obj.item] || 0;
                if (playerHas < obj.count) {
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
                game.player.gold = (game.player.gold || 0) + rewards.gold;
                rewardsGiven.gold = rewards.gold;
            }

            if (rewards.items) {
                for (const [item, qty] of Object.entries(rewards.items)) {
                    // don't add quest items to regular inventory
                    if (!this.isQuestItem(item)) {
                        game.player.inventory = game.player.inventory || {};
                        game.player.inventory[item] = (game.player.inventory[item] || 0) + qty;
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
            for (const [item, qty] of Object.entries(rewardsGiven.items)) {
                addMessage(`+${qty}x ${item}`, 'success');
            }
        }

        document.dispatchEvent(new CustomEvent('quest-completed', { detail: { quest, rewards: rewardsGiven } }));
        this.updateQuestLogUI();

        // auto-offer next quest in chain
        if (quest.nextQuest) {
            console.log(`📜 Next quest in chain: ${quest.nextQuest}`);
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
            console.error('📜 Failed to save completion time:', e);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🤖 NPC/API INTEGRATION - what the AI needs to know
    // ═══════════════════════════════════════════════════════════════
    getQuestsForNPC(npcType, location) {
        return Object.values(this.quests).filter(quest => {
            if (quest.giver !== npcType) return false;
            if (quest.location && quest.location !== location && quest.location !== 'any') return false;
            if (this.activeQuests[quest.id]) return false;
            if (this.completedQuests.includes(quest.id) && !quest.repeatable) return false;
            if (quest.prerequisite && !this.completedQuests.includes(quest.prerequisite)) return false;
            return true;
        });
    },

    getActiveQuestsForNPC(npcType) {
        return Object.values(this.activeQuests).filter(quest => {
            return quest.giver === npcType;
        });
    },

    getQuestContextForNPC(npcType, location) {
        const available = this.getQuestsForNPC(npcType, location);
        const active = this.getActiveQuestsForNPC(npcType);
        const readyToComplete = active.filter(q => this.checkProgress(q.id).status === 'ready_to_complete');

        // also find quests where this NPC is the delivery TARGET (not the giver)
        const deliveriesToReceive = Object.values(this.activeQuests).filter(q => {
            // look for talk objectives that target this NPC type
            return q.objectives?.some(obj =>
                obj.type === 'talk' && obj.npc === npcType && !obj.completed
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
                const talkObj = q.objectives.find(o => o.type === 'talk' && o.npc === npcType);
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

        // filter based on category
        Object.entries(chains).forEach(([chainId, chain]) => {
            chain.quests.forEach(quest => {
                const isActive = !!this.activeQuests[quest.id];
                const isCompleted = this.completedQuests.includes(quest.id);
                const isFailed = this.failedQuests.includes(quest.id);
                const isDiscovered = this.discoveredQuests.includes(quest.id) || isActive || isCompleted;
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

    getObjectiveText(objective) {
        switch (objective.type) {
            case 'collect': return `Collect ${objective.item}`;
            case 'defeat': return `Defeat ${objective.enemy}`;
            case 'visit': return `Visit ${objective.location}`;
            case 'talk': return `Talk to ${objective.npc}`;
            case 'buy': return 'Make a purchase';
            case 'trade': return 'Complete a trade';
            case 'carry': return `Carry ${objective.item}`;
            case 'explore': return `Explore ${objective.dungeon}`;
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

    updateQuestTracker() {
        let tracker = document.getElementById('quest-tracker');
        if (!tracker) {
            tracker = document.createElement('div');
            tracker.id = 'quest-tracker';
            tracker.className = 'quest-tracker';
            document.body.appendChild(tracker);
        }

        const activeQuestCount = Object.keys(this.activeQuests).length;

        // 🖤 Don't show if user manually hid it or no active quests
        if (activeQuestCount === 0 || this.trackerHidden) {
            tracker.classList.add('hidden');
            return;
        }

        tracker.classList.remove('hidden');

        // 🖤 Position quest tracker below player info panel (side-panel)
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel && !tracker.dataset.draggable) {
            const sidePanelRect = sidePanel.getBoundingClientRect();
            tracker.style.top = (sidePanelRect.bottom + 10) + 'px'; // 10px gap below side panel
        }

        // 🎯 If a quest is tracked, show only that quest prominently
        if (this.trackedQuestId && this.activeQuests[this.trackedQuestId]) {
            const quest = this.activeQuests[this.trackedQuestId];
            const progress = this.checkProgress(quest.id);
            const targetLocation = this.getTrackedQuestLocation();
            const locationName = targetLocation ? this.getLocationDisplayName(targetLocation) : '';

            // 🖤 Build quest selector dropdown options
            const otherQuests = Object.values(this.activeQuests).filter(q => q.id !== this.trackedQuestId);
            const questSelectorOptions = otherQuests.map(q =>
                `<option value="${q.id}">${this.getQuestTypeIcon(q.type)} ${q.name}</option>`
            ).join('');

            tracker.innerHTML = `
                <div class="tracker-header">
                    <span class="drag-grip" style="opacity:0.5;pointer-events:none;">⋮⋮</span>
                    <span style="flex:1;pointer-events:none;">🎯 Tracked Quest</span>
                    <button class="tracker-expand" onclick="QuestSystem.showQuestLog()" title="Open Quest Log" style="background:rgba(79,195,247,0.3);border:none;border-radius:4px;padding:2px 8px;color:white;cursor:pointer;font-size:12px;">📋</button>
                    <button class="tracker-close" onclick="QuestSystem.hideQuestTracker()" title="Close" style="background:rgba(244,67,54,0.8);border:none;border-radius:50%;width:20px;height:20px;color:white;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;margin-left:4px;">×</button>
                </div>
                <div class="tracker-tracked-quest" onclick="QuestSystem.showQuestInfoPanel('${quest.id}')">
                    <div class="tracker-quest-title">
                        <span class="tracker-quest-icon">${this.getQuestTypeIcon(quest.type)}</span>
                        <span class="tracker-quest-name">${quest.name}</span>
                    </div>
                    ${locationName ? `<div class="tracker-quest-location">📍 ${locationName}</div>` : ''}
                    <div class="tracker-quest-objectives">
                        ${quest.objectives.filter(o => !o.completed).slice(0, 2).map(obj => `
                            <div class="tracker-objective">
                                ⬜ ${obj.description}${obj.count ? ` (${obj.current || 0}/${obj.count})` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="tracker-quest-footer">
                        <span class="tracker-quest-progress ${progress.status}">${progress.progress}</span>
                        <button class="tracker-untrack-btn" onclick="event.stopPropagation(); QuestSystem.untrackQuest();" title="Untrack">🚫</button>
                    </div>
                </div>
                ${activeQuestCount > 1 ? `
                    <div class="tracker-quest-selector">
                        <select id="tracker-quest-select" onchange="QuestSystem.trackQuest(this.value)">
                            <option value="" disabled selected>🔄 Switch quest (${activeQuestCount - 1} more)...</option>
                            ${questSelectorOptions}
                        </select>
                    </div>
                ` : ''}
            `;
        } else {
            // 💀 No tracked quest - show list of quests with track buttons
            const activeQuestsList = Object.values(this.activeQuests).slice(0, 3);

            tracker.innerHTML = `
                <div class="tracker-header">
                    <span class="drag-grip" style="opacity:0.5;pointer-events:none;">⋮⋮</span>
                    <span style="flex:1;pointer-events:none;display:flex;flex-direction:column;line-height:1.2;" onclick="QuestSystem.showQuestLog()">
                        <span style="font-size:10px;opacity:0.7;">Tracked</span>
                        <span>📋 Quests</span>
                    </span>
                    <button class="tracker-expand" onclick="QuestSystem.showQuestLog()" title="Open Quest Log" style="background:rgba(79,195,247,0.3);border:none;border-radius:4px;padding:2px 8px;color:white;cursor:pointer;font-size:12px;">▼</button>
                    <button class="tracker-close" onclick="QuestSystem.hideQuestTracker()" title="Close" style="background:rgba(244,67,54,0.8);border:none;border-radius:50%;width:20px;height:20px;color:white;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;margin-left:4px;">×</button>
                </div>
                <div class="tracker-quests">
                    ${activeQuestsList.map(quest => {
                        const progress = this.checkProgress(quest.id);
                        return `
                            <div class="tracker-quest ${progress.status === 'ready_to_complete' ? 'ready' : ''}" onclick="QuestSystem.showQuestInfoPanel('${quest.id}')">
                                <button class="tracker-track-btn" onclick="event.stopPropagation(); QuestSystem.trackQuest('${quest.id}');" title="Track this quest">🎯</button>
                                <span class="tracker-quest-name">${quest.name}</span>
                                <span class="tracker-quest-progress">${progress.progress}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${activeQuestCount > 3 ? `<div class="tracker-more" onclick="QuestSystem.showQuestLog()">+${activeQuestCount - 3} more...</div>` : ''}
            `;
        }

        // 🖤 Setup dragging - must re-attach after innerHTML changes
        if (typeof DraggablePanels !== 'undefined') {
            this.setupTrackerDragging(tracker);
        }

        // 🎯 Add tracker styles
        this.addTrackerStyles();
    },

    // 🖤 Add styles for the improved tracker
    addTrackerStyles() {
        if (document.getElementById('quest-tracker-styles')) return;

        const style = document.createElement('style');
        style.id = 'quest-tracker-styles';
        style.textContent = `
            .tracker-tracked-quest {
                padding: 10px;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 6px;
                margin: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .tracker-tracked-quest:hover {
                background: rgba(255, 215, 0, 0.2);
                border-color: rgba(255, 215, 0, 0.5);
            }
            .tracker-quest-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 6px;
            }
            .tracker-quest-icon { font-size: 16px; }
            .tracker-quest-location {
                font-size: 11px;
                color: #4fc3f7;
                margin-bottom: 6px;
            }
            .tracker-quest-objectives {
                font-size: 11px;
                color: #ccc;
            }
            .tracker-objective {
                padding: 2px 0;
            }
            .tracker-quest-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                padding-top: 6px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .tracker-quest-progress {
                font-size: 11px;
                color: #888;
            }
            .tracker-quest-progress.ready_to_complete {
                color: #81c784;
                font-weight: bold;
            }
            .tracker-untrack-btn, .tracker-track-btn {
                background: rgba(100, 100, 100, 0.3);
                border: none;
                border-radius: 4px;
                padding: 2px 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            .tracker-untrack-btn:hover {
                background: rgba(244, 67, 54, 0.5);
            }
            .tracker-track-btn:hover {
                background: rgba(255, 215, 0, 0.5);
            }
            .tracker-more {
                text-align: center;
                font-size: 11px;
                color: #4fc3f7;
                padding: 6px;
                cursor: pointer;
            }
            .tracker-more:hover {
                text-decoration: underline;
            }
            .tracker-quest {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            /* 🖤 Quest selector dropdown */
            .tracker-quest-selector {
                padding: 6px 8px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .tracker-quest-selector select {
                width: 100%;
                padding: 6px 8px;
                background: rgba(30, 30, 50, 0.9);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 4px;
                color: #ccc;
                font-size: 11px;
                cursor: pointer;
            }
            .tracker-quest-selector select:hover {
                border-color: rgba(79, 195, 247, 0.6);
            }
            .tracker-quest-selector select:focus {
                outline: none;
                border-color: #4fc3f7;
            }
            .tracker-quest-selector select option {
                background: #1a1a2e;
                color: #fff;
                padding: 8px;
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
            console.log('🖤 Quest tracker hidden - find it in the Panels toolbar or press Q');
        }
    },

    // 🖤 Show the quest tracker widget
    showQuestTracker() {
        this.trackerHidden = false;
        this.updateQuestTracker(); // This will recreate/show it
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

        // 🖤 Find the first incomplete objective with a location
        for (const obj of quest.objectives) {
            if (obj.completed) continue;

            // 💀 Visit objective has direct location
            if (obj.type === 'visit' && obj.location) {
                return obj.location;
            }

            // 🦇 Talk objective - need to find where that NPC is
            if (obj.type === 'talk' && obj.npc) {
                // NPCs are typically at the quest giver location or specific spots
                // For now, use the quest's location as fallback
                return quest.location;
            }

            // 💀 Explore dungeon - return the dungeon location
            if (obj.type === 'explore' && obj.dungeon) {
                return obj.dungeon;
            }

            // 🖤 Collect items - player needs to find them, maybe at quest location
            if (obj.type === 'collect') {
                return quest.location;
            }
        }

        // 💀 Fallback to quest giver location for turn-in
        return quest.location;
    },

    // 🖤 Update the glowing quest marker on the map
    updateQuestMapMarker() {
        // 💀 Remove old marker first
        this.removeQuestMapMarker();

        const targetLocation = this.getTrackedQuestLocation();
        if (!targetLocation) return;

        // 🦇 Get the location element on the map
        const locationEl = document.querySelector(`.map-location[data-location-id="${targetLocation}"]`);
        if (!locationEl) {
            console.log(`🎯 Quest target location "${targetLocation}" not visible on map yet`);
            return;
        }

        // 🖤 Create the quest marker overlay
        this.questMarkerElement = document.createElement('div');
        this.questMarkerElement.className = 'quest-target-marker';
        this.questMarkerElement.innerHTML = '🎯';
        this.questMarkerElement.style.cssText = `
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 15px gold);
            animation: quest-marker-bounce 1s ease-in-out infinite;
            pointer-events: none;
            z-index: 100;
        `;

        // 🦇 Add glow effect to the location itself
        locationEl.classList.add('quest-target-glow');
        locationEl.style.boxShadow = '0 0 20px 10px rgba(255, 215, 0, 0.6), 0 0 40px 20px rgba(255, 215, 0, 0.3)';
        locationEl.style.animation = 'quest-location-pulse 2s ease-in-out infinite';

        // 💀 Append marker to the location
        locationEl.style.position = 'absolute'; // ensure positioning context
        locationEl.appendChild(this.questMarkerElement);

        // 🖤 Add animation styles if not exists
        this.addQuestMarkerStyles();

        console.log(`🎯 Quest marker placed at ${targetLocation}`);
    },

    // 💀 Remove the quest map marker
    removeQuestMapMarker() {
        // 🦇 Remove the marker element
        if (this.questMarkerElement && this.questMarkerElement.parentNode) {
            this.questMarkerElement.remove();
        }
        this.questMarkerElement = null;

        // 🖤 Remove glow from all locations
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
            @keyframes quest-location-pulse {
                0%, 100% {
                    box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.6), 0 0 40px 20px rgba(255, 215, 0, 0.3);
                }
                50% {
                    box-shadow: 0 0 30px 15px rgba(255, 215, 0, 0.8), 0 0 60px 30px rgba(255, 215, 0, 0.4);
                }
            }
            .quest-target-glow {
                z-index: 15 !important;
            }
        `;
        document.head.appendChild(style);
    },

    // 🎯 Show quest info panel for tracked quest
    showQuestInfoPanel(questId = null) {
        const qId = questId || this.trackedQuestId;
        if (!qId) return;

        const quest = this.activeQuests[qId] || this.quests[qId];
        if (!quest) return;

        // 💀 Remove existing panel
        const existing = document.getElementById('quest-info-panel');
        if (existing) existing.remove();

        const progress = this.checkProgress(qId);
        const targetLocation = this.getTrackedQuestLocation();
        const locationName = targetLocation ? this.getLocationDisplayName(targetLocation) : 'Unknown';

        // 🖤 Create the info panel
        const panel = document.createElement('div');
        panel.id = 'quest-info-panel';
        panel.className = 'quest-info-panel';
        panel.innerHTML = `
            <div class="quest-info-header">
                <span class="quest-info-icon">${this.getQuestTypeIcon(quest.type)}</span>
                <h3>${quest.name}</h3>
                <button class="quest-info-close" onclick="QuestSystem.hideQuestInfoPanel()">×</button>
            </div>
            <div class="quest-info-body">
                <p class="quest-info-desc">${quest.description}</p>
                <div class="quest-info-section">
                    <strong>🎯 Go to:</strong> ${locationName}
                </div>
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
                    <strong>💰 Rewards:</strong>
                    <span class="quest-rewards">
                        ${quest.rewards.gold ? `${quest.rewards.gold}g` : ''}
                        ${quest.rewards.experience ? ` ${quest.rewards.experience}xp` : ''}
                        ${quest.rewards.reputation ? ` +${quest.rewards.reputation} rep` : ''}
                    </span>
                </div>
                <div class="quest-info-status">
                    Status: <span class="${progress.status}">${progress.status.replace(/_/g, ' ')}</span>
                </div>
            </div>
            <div class="quest-info-actions">
                ${this.trackedQuestId === qId
                    ? `<button onclick="QuestSystem.untrackQuest()">🚫 Untrack</button>`
                    : `<button onclick="QuestSystem.trackQuest('${qId}')">🎯 Track Quest</button>`
                }
                <button onclick="QuestSystem.centerMapOnQuestTarget()">🗺️ Show on Map</button>
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

    // 💀 Hide the quest info panel
    hideQuestInfoPanel() {
        const panel = document.getElementById('quest-info-panel');
        if (panel) panel.remove();
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
                background: rgba(244, 67, 54, 0.8);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                color: white;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .quest-info-close:hover { background: #f44336; }
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
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎧 EVENT LISTENERS - watching your every move
    // ═══════════════════════════════════════════════════════════════
    setupEventListeners() {
        document.addEventListener('item-received', (e) => {
            this.updateProgress('collect', { item: e.detail.itemId, count: e.detail.quantity });
        });

        document.addEventListener('item-purchased', (e) => {
            this.updateProgress('buy', { item: e.detail.itemId });
        });

        document.addEventListener('trade-completed', (e) => {
            this.updateProgress('trade', { value: e.detail.value || 100 });
        });

        document.addEventListener('enemy-defeated', (e) => {
            this.updateProgress('defeat', { enemy: e.detail.enemyType, count: 1 });
        });

        document.addEventListener('location-changed', (e) => {
            this.updateProgress('visit', { location: e.detail.location });
        });

        document.addEventListener('npc-interaction', (e) => {
            this.updateProgress('talk', { npc: e.detail.npcType });
        });

        document.addEventListener('dungeon-room-explored', (e) => {
            this.updateProgress('explore', { dungeon: e.detail.dungeon, rooms: 1 });
        });

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
