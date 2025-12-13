// ═══════════════════════════════════════════════════════════════
// TUTORIAL NPCS - The Cast of Characters Who Hand-Hold Noobs
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
//
// These magnificent bastards are ACTORS in our tutorial play.
// All their dialogue is pre-written so we don't wait for any API.
// They teach, they trade, they fight - all to make noobs less noob.
// ═══════════════════════════════════════════════════════════════

const TutorialNPCs = {
    // ═══════════════════════════════════════════════════════════════
    //  THE TUTORIAL SQUAD - NPC Definitions
    // ═══════════════════════════════════════════════════════════════

    npcs: {
        // ═══════════════════════════════════════════════════════════
        //  MERCHANT ELARA - The Tutorial Mom Everyone Deserves
        //  Patient, wise, will explain things 47 times if needed
        // ═══════════════════════════════════════════════════════════
        tutorial_guide: {
            id: 'tutorial_guide',
            type: 'tutorial_guide',
            name: 'Merchant Elara',
            title: 'Master Trader',
            category: 'tutorial',
            location: 'tutorial_village',

            // Visual/voice config
            portrait: 'elara', // Portrait image reference
            voice: 'nova', // TTS voice (if used)

            // Personality
            personality: 'warm_mentor',
            speakingStyle: 'Encouraging, patient, knowledgeable. Explains concepts clearly without being condescending. Gets excited when teaching.',
            background: 'Once the most successful merchant in the realm. Now retired to train the next generation. Has seen everything, done everything.',
            traits: ['patient', 'wise', 'encouraging', 'experienced'],

            // Appearance description for dialogue context
            appearance: 'A kind-eyed woman in her 50s with silver-streaked hair tied back. Wears practical but quality merchant clothes. Always has a warm smile.',

            // Services and interactions
            services: ['quest', 'advice', 'tutorial'],
            canTrade: false, // Not a merchant, just a guide
            canFight: false,

            // Pre-written greetings (no API call)
            greetings: [
                "Ah, there you are! Ready to learn the ways of trade?",
                "Welcome back, apprentice! What shall we cover today?",
                "Good to see you! A merchant's work is never done - but that's the fun of it!",
                "*smiles warmly* Every great trader started exactly where you are now."
            ],

            farewells: [
                "Go forth and prosper, apprentice!",
                "Remember - buy low, sell high. The rest is just details!",
                "I believe in you. Now go make some gold!",
                "May your purse be heavy and your cart be full!"
            ],

            // Tutorial-specific dialogue (used by quest system)
            tutorialDialogue: {
                welcome: "Welcome, young one! I'm Elara, and I'll teach you everything you need to know about being a successful merchant. This world is full of opportunity - and danger. Let's start with the basics!",

                pauseLesson: "Time waits for no one in this world - hunger grows, thirst increases, and opportunities pass. But YOU can pause time itself! Press the SPACE key or click the pause button at the top of the screen.",

                speedLesson: "Sometimes you'll want time to move faster - during travel, or when waiting for merchants to restock. Use the speed dropdown next to the pause button. Try changing it to FAST or VERY FAST!",

                marketLesson: "The Market is where fortunes are made! Press the M key or click the Market button to see what goods are available. Browse around - notice how each item has a buy price and a sell price.",

                inventoryLesson: "Everything you own is stored in your inventory. Press I or click the Inventory button to see your belongings. You'll find the item you just bought, plus food and water for survival.",

                tradingSecret: "HERE'S THE SECRET TO WEALTH: Different towns pay different prices! Wheat is cheap here in the village because farmers grow it nearby. But in Tutorial Town? They'll pay more! Buy 5 wheat, travel there, and sell it for profit. This is arbitrage - the trader's best friend.",

                peopleLesson: "Press P or click People to see everyone at your location. You can talk to them, trade with them, and get quests from them!",

                questLesson: "You've been completing quests this whole time! Press Q to see your Quest Log. It shows active quests, completed quests, and your progress. You can track a quest to see it on your main screen!",

                achievementLesson: "Your deeds are recorded for posterity! Open the Achievements panel to see your accomplishments. Achievements unlock as you play - trading milestones, combat victories, exploration discoveries, and more!",

                survivalLesson: "See those bars on the left? Hunger and Thirst! They decrease over time. If they empty, you start losing health and eventually DIE. Open your inventory (I) and consume food and water to stay alive!",

                storyIntro: "You've learned so much! Now hear this: The realm is in danger. An ancient wizard named MALACHAR stirs in the Shadow Tower, and a secret merchant cabal called THE BLACK LEDGER funds his return. Your goal is to grow wealthy enough to stop them both!",

                lootLesson: "Not all items are equal! Items come in rarities: Common (white), Uncommon (green), Rare (blue), Epic (purple), and Legendary (gold). Better gear means better stats. Check your equipment - I have a gift for you!",

                saveLesson: "Don't lose your progress! Click the Settings/Menu button to find the Save option. The game also auto-saves periodically, but manual saves let you create restore points before risky decisions.",

                graduation: "CONGRATULATIONS! You've completed your training. You'll now be transported to the real world - GREENDALE, where the adventure begins. A mysterious Hooded Stranger awaits you there with an important quest. May fortune favor you, merchant! GO FORTH AND CONQUER!"
            },

            // Tips Elara can give randomly
            randomTips: [
                "Keep an eye on market prices - they change based on supply and demand!",
                "Always carry food and water before long journeys.",
                "Reputation matters. Treat people well and doors will open.",
                "Don't be afraid to haggle - but know when to walk away.",
                "Mounts make travel faster but cost gold to maintain.",
                "Properties can generate passive income while you're away."
            ]
        },

        // ═══════════════════════════════════════════════════════════
        //  TRADER MARCUS - The "Buy Low Sell High" Preacher
        //  This guy fucks with spreadsheets. Teaches arbitrage basics.
        // ═══════════════════════════════════════════════════════════
        tutorial_merchant: {
            id: 'tutorial_merchant',
            type: 'tutorial_merchant',
            name: 'Trader Marcus',
            title: 'Merchant Guild Representative',
            category: 'tutorial',
            location: 'tutorial_town',

            portrait: 'marcus',
            voice: 'onyx',

            personality: 'shrewd_friendly',
            speakingStyle: 'Business-minded but fair. Always talks about profit margins and market trends. Respects good traders.',
            background: 'A successful merchant who joined Elara\'s tutorial program to help train new traders. Knows every price in every city.',
            traits: ['shrewd', 'fair', 'knowledgeable', 'business-minded'],

            appearance: 'A well-dressed man in his 40s with a calculating gaze but friendly demeanor. Always has a ledger tucked under his arm.',

            services: ['trade', 'quest', 'market_info'],
            canTrade: true,
            canFight: false,

            // What Marcus buys/sells (tutorial pricing)
            inventory: {
                sells: ['tools', 'rope', 'torch', 'bandages'],
                buys: ['wheat', 'vegetables', 'bread', 'fish'],
                buyPriceMultiplier: 1.5, // Pays well for goods
                sellPriceMultiplier: 0.9 // Sells slightly cheap
            },

            greetings: [
                "Ah, a trader from the village! Let's see what you've brought.",
                "Business is business - what can I do for you?",
                "*flips through ledger* Another merchant! Welcome to the market.",
                "You've got the look of someone who understands profit. Let's trade!"
            ],

            farewells: [
                "May your margins be healthy!",
                "Profit is the fruit of wisdom. Go cultivate it!",
                "Remember - location, location, location!",
                "Trade well, friend!"
            ],

            tutorialDialogue: {
                profitCongrats: "You made a PROFIT! This is the core of trading - buy where goods are cheap, sell where they're expensive. Do this across the realm and you'll be rich!",

                travelIntro: "You've got the trading instinct! But to find the best deals, you need to TRAVEL. Press T or click the Travel button to see the world map. You can click on any location to see details and travel there.",

                marketTips: "Each town has different prices based on what they produce and what they need. Coastal towns have cheap fish. Farming villages have cheap grain. Cities need everything but charge more!",

                supplyDemand: "Watch for market events - shortages raise prices, surpluses lower them. A smart trader anticipates these shifts!"
            },

            marketKnowledge: [
                "Wheat is cheap in farming villages, expensive in cities.",
                "Fish sells best far from the coast.",
                "Luxury goods only find buyers among the wealthy.",
                "Raw materials are cheap at the source but heavy to transport."
            ]
        },

        // ═══════════════════════════════════════════════════════════
        //  COMBAT TRAINER DANE - The "Hit Them Harder" Life Coach
        //  This absolute unit will teach you to throw hands proper
        // ═══════════════════════════════════════════════════════════
        tutorial_trainer: {
            id: 'tutorial_trainer',
            type: 'tutorial_trainer',
            name: 'Combat Trainer Dane',
            title: 'Arena Master',
            category: 'tutorial',
            location: 'tutorial_arena',

            portrait: 'dane',
            voice: 'dan',

            personality: 'drill_sergeant',
            speakingStyle: 'Direct, no-nonsense, but encouraging. Pushes you to do better. Celebrates your victories enthusiastically.',
            background: 'Former captain of the royal guard. Now trains new fighters in the art of survival combat.',
            traits: ['disciplined', 'encouraging', 'tough', 'experienced'],

            appearance: 'A muscular man with a shaved head and numerous scars. Wears practical leather armor. Moves with military precision.',

            services: ['combat_training', 'quest', 'sparring'],
            canTrade: false,
            canFight: true, // Can spar with player

            // Combat stats (for sparring)
            combatStats: {
                health: 100,
                attack: 15,
                defense: 10,
                level: 3
            },

            greetings: [
                "Ready to train? Get your guard up!",
                "*cracks knuckles* Let's see what you've got!",
                "A merchant who can fight is a merchant who survives. Let's begin!",
                "The roads are dangerous. I'll make sure you're prepared."
            ],

            farewells: [
                "Keep practicing! Strength comes from repetition.",
                "Remember - defense wins fights, not just attacks.",
                "Stay sharp out there!",
                "You're getting better. Don't die on me now!"
            ],

            tutorialDialogue: {
                combatIntro: "Trading is profitable, but the roads are dangerous. You need to know how to FIGHT! I've set up a training dummy. When combat starts, click ATTACK to strike. Watch the health bars and win!",

                defenseLesson: "Now face a real opponent - my sparring partner. They hit harder than a dummy! When you DEFEND, you take less damage that turn. Use it when your health is low or when facing a big attack. Try it!",

                healingLesson: "Here are some Health Potions - they'll save your life! In combat, click ITEMS to use consumables. Potions heal you instantly. Face the Arena Brute and use a potion when your health drops!",

                bossIntro: "You've learned Attack, Defend, and Items. Now face a BOSS! The Bandit Chief is tougher than anything you've fought. Use everything you've learned. Boss fights have more rounds and better loot. FIGHT!",

                victoryBoss: "INCREDIBLE! You defeated your first boss! Boss fights are the ultimate challenge - they guard dungeons and drop rare loot. You're becoming a true warrior-merchant!"
            },

            combatTips: [
                "Watch enemy attack patterns. Some telegraph their big hits.",
                "Potions can be used anytime - don't wait until you're almost dead!",
                "Better armor means more defense. Better weapons mean more attack.",
                "Some enemies resist certain damage types. Adapt your strategy!",
                "Running away is sometimes the smartest choice."
            ]
        },

        // ═══════════════════════════════════════════════════════════
        //  FOREST WARDEN - The Cryptic Druid Who Speaks in Riddles
        //  Teaches exploration. Lives in the trees. Probably eats bark.
        // ═══════════════════════════════════════════════════════════
        tutorial_warden: {
            id: 'tutorial_warden',
            type: 'tutorial_warden',
            name: 'Forest Warden',
            title: 'Guide of the Wilds',
            category: 'tutorial',
            location: 'tutorial_forest',

            portrait: 'warden',
            voice: 'echo',

            personality: 'wise_nature',
            speakingStyle: 'Calm, speaks in metaphors about nature. Knows every path and every danger in the wild.',
            background: 'Has lived in these forests for decades. Knows every trail, every creature, every danger.',
            traits: ['wise', 'calm', 'observant', 'protective'],

            appearance: 'A weathered figure in green and brown clothes that blend with the forest. Sharp eyes that miss nothing.',

            services: ['exploration_tips', 'quest', 'navigation'],
            canTrade: false,
            canFight: false,

            greetings: [
                "*emerges from the trees* Welcome to my forest, traveler.",
                "The forest speaks to those who listen. What brings you here?",
                "*nods* Another soul seeking the wild's secrets.",
                "Careful where you step. The forest rewards the cautious."
            ],

            farewells: [
                "May the forest guide your path.",
                "Watch the shadows. They watch back.",
                "Return when you seek more wisdom.",
                "The wild remembers those who respect it."
            ],

            tutorialDialogue: {
                arrivalMessage: "You made it! Notice how time passed during travel? Your hunger and thirst increased too. Always carry food and water when traveling far!",

                encounterIntro: "The roads are full of travelers - merchants, bandits, adventurers. Sometimes they'll approach you with offers or threats. Let me arrange a... demonstration. A friendly trader will approach you shortly.",

                encounterComplete: "You handled that well! Random encounters can be opportunities OR dangers. You can trade, talk, fight, or flee depending on the situation. Always assess before acting!",

                explorationIntro: "Every location hides secrets! Press E or click the Explore button to search for treasures, enemies, and mysteries. The forest has old ruins with valuable loot. Give it a try!",

                explorationComplete: "You found something! Exploration is risky but rewarding. Dungeons have multiple rooms with escalating challenges. Now, let's teach you to FIGHT!"
            },

            forestWisdom: [
                "The forest provides for those who know where to look.",
                "Every creature has a pattern. Learn it and survive.",
                "The darkest paths often hold the richest rewards.",
                "Nature doesn't care about your plans. Adapt or perish."
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL ENEMIES - The Punching Bags of Learning
    // ═══════════════════════════════════════════════════════════════
    enemies: {
        // Training Dummy - A literal punching bag. Can't lose to this.
        // If you die to this, uninstall the game and touch grass.
        tutorial_dummy: {
            id: 'tutorial_dummy',
            name: 'Training Dummy',
            type: 'training',
            category: 'tutorial_enemy',
            description: 'A wooden dummy used for combat training. It won\'t fight back much.',

            // Combat stats (very weak)
            stats: {
                health: 30,
                maxHealth: 30,
                attack: 2,
                defense: 0,
                speed: 1
            },

            level: 1,
            experienceReward: 10,
            goldReward: 0,

            // Behavior flags
            behavior: {
                passive: true, // Barely fights back
                alwaysHits: false,
                canCrit: false,
                canDodge: false
            },

            // Visual
            portrait: 'dummy',

            // Combat dialogue
            combatDialogue: {
                intro: "*the dummy wobbles menacingly*",
                attack: "*swings stiffly*",
                hurt: "*creaks*",
                defeat: "*falls apart into pieces*"
            }
        },

        // Sparring Partner - Actually fights back! Teaches "maybe don't
        // just spam attack like a monkey" by hitting you in the face.
        tutorial_fighter: {
            id: 'tutorial_fighter',
            name: 'Sparring Partner',
            type: 'sparring',
            category: 'tutorial_enemy',
            description: 'One of Dane\'s sparring partners. Will give you a real fight, but won\'t kill you.',

            stats: {
                health: 50,
                maxHealth: 50,
                attack: 8,
                defense: 5,
                speed: 5
            },

            level: 2,
            experienceReward: 25,
            goldReward: 0,

            behavior: {
                passive: false,
                alwaysHits: false,
                canCrit: false,
                canDodge: true,
                merciful: true // Won't deal killing blow
            },

            portrait: 'fighter',

            combatDialogue: {
                intro: "Let's see what you've learned! *raises fists*",
                attack: "Here it comes!",
                hurt: "Good hit!",
                lowHealth: "You're doing well! Don't let up!",
                defeat: "*taps out* You got me! Well fought!"
            }
        },

        // Arena Brute - The big boi who forces you to use potions.
        // Hits like a truck to teach "hey dumbass, drink your potions"
        tutorial_brute: {
            id: 'tutorial_brute',
            name: 'Arena Brute',
            type: 'training',
            category: 'tutorial_enemy',
            description: 'A large, slow fighter. Hits hard but telegraphs attacks.',

            stats: {
                health: 80,
                maxHealth: 80,
                attack: 15,
                defense: 3,
                speed: 3
            },

            level: 3,
            experienceReward: 40,
            goldReward: 10,

            behavior: {
                passive: false,
                alwaysHits: false,
                canCrit: true, // Can crit to force potion use
                canDodge: false,
                merciful: true
            },

            portrait: 'brute',

            combatDialogue: {
                intro: "*cracks neck* Time to feel some pain!",
                attack: "RAAAAH!",
                bigAttack: "*winds up for a huge swing*",
                hurt: "*grunts*",
                lowHealth: "You're tougher than you look!",
                defeat: "*crashes to the ground* Ughhh... good fight..."
            }
        },

        // Tutorial Boss - The Final Exam. Multiple phases, hits hard,
        // drops actual loot. If you beat this, congrats - you're ready.
        tutorial_boss: {
            id: 'tutorial_boss',
            name: 'Tutorial Bandit Chief',
            type: 'boss',
            category: 'tutorial_enemy',
            description: 'The leader of a small bandit gang. Your first real boss fight!',

            stats: {
                health: 120,
                maxHealth: 120,
                attack: 12,
                defense: 8,
                speed: 6
            },

            level: 4,
            experienceReward: 100,
            goldReward: 50,

            isBoss: true,

            behavior: {
                passive: false,
                alwaysHits: false,
                canCrit: true,
                canDodge: true,
                hasPhases: true, // Boss phases
                merciful: false // This one's for real (but you respawn in tutorial)
            },

            // Boss phases
            phases: [
                { healthPercent: 100, message: "You dare challenge ME?!" },
                { healthPercent: 50, message: "*gets serious* You're better than I expected..." },
                { healthPercent: 25, message: "NO! I won't be beaten by a rookie!" }
            ],

            portrait: 'bandit_chief',

            combatDialogue: {
                intro: "Well well, fresh meat! *draws sword* This'll be quick.",
                attack: "Take THIS!",
                bigAttack: "*charges forward with a powerful strike*",
                hurt: "Grr! Lucky hit!",
                phase2: "*wipes blood* Okay, playtime's over!",
                lowHealth: "Impossible! HOW?!",
                defeat: "*collapses* You... you actually did it... *coughs*"
            },

            // Loot drops
            lootTable: [
                { item: 'iron_sword', chance: 0.5 },
                { item: 'leather_armor', chance: 0.5 },
                { item: 'health_potion', chance: 1.0, quantity: 2 },
                { item: 'gold_coins', chance: 1.0, quantity: 50 }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  HELPER FUNCTIONS - The Utility Belt of NPC Management
    // ═══════════════════════════════════════════════════════════════

    // Yoink an NPC by their ID
    getNPC(npcId) {
        return this.npcs[npcId] || null;
    },

    // Fetch an enemy definition for combat summoning
    getEnemy(enemyId) {
        return this.enemies[enemyId] || null;
    },

    // Dump the entire tutorial cast
    getAllNPCs() {
        return Object.values(this.npcs);
    },

    // Get all the enemies we can throw at players
    getAllEnemies() {
        return Object.values(this.enemies);
    },

    // Find NPCs chilling at a specific location
    getNPCsAtLocation(locationId) {
        return Object.values(this.npcs).filter(npc => npc.location === locationId);
    },

    // Pick a random greeting (keeps things fresh)
    getGreeting(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc || !npc.greetings || npc.greetings.length === 0) {
            return "Hello, traveler.";
        }
        return npc.greetings[Math.floor(Math.random() * npc.greetings.length)];
    },

    // Pick a random goodbye (variety is the spice of life)
    getFarewell(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc || !npc.farewells || npc.farewells.length === 0) {
            return "Farewell.";
        }
        return npc.farewells[Math.floor(Math.random() * npc.farewells.length)];
    },

    // Grab specific tutorial dialogue for quest use
    getTutorialDialogue(npcId, dialogueKey) {
        const npc = this.getNPC(npcId);
        if (!npc || !npc.tutorialDialogue) return null;
        return npc.tutorialDialogue[dialogueKey] || null;
    },

    // Inject all tutorial NPCs into the game's NPC system
    registerAll() {
        if (typeof NPCManager === 'undefined') {
            console.warn('🎓 NPCManager not found - cannot register tutorial NPCs');
            return false;
        }

        let registered = 0;
        for (const npc of this.getAllNPCs()) {
            if (NPCManager.register(npc)) {
                registered++;
            }
        }

        console.log(`🎓 Registered ${registered} tutorial NPCs`);
        return true;
    },

    // Remove all tutorial NPCs from the game (cleanup duty)
    unregisterAll() {
        if (typeof NPCManager === 'undefined') return false;

        let unregistered = 0;
        for (const npc of this.getAllNPCs()) {
            if (NPCManager.unregister(npc.id)) {
                unregistered++;
            }
        }

        console.log(`🎓 Unregistered ${unregistered} tutorial NPCs`);
        return true;
    }
};

// ═══════════════════════════════════════════════════════════════
//  GLOBAL ACCESS - Share the love (and NPCs) with the world
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.TutorialNPCs = TutorialNPCs;
}

// CommonJS export for the module nerds
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialNPCs;
}
