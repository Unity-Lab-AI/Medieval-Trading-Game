// 
//  REGIONAL SIDE QUESTS - Combat & Trade Chains 
// 
// Version: 0.91.10 | Unity AI Lab
// 14 Quest Chains (2 per region) | ~50 Total Quests
// Combat chains: Fight threats, protect civilians
// Trade chains: Economic opportunities, merchant relationships
// 

const SideQuests = {
    // 
    //  SIDE QUEST METADATA
    // 
    sideQuestInfo: {
        totalChains: 14,
        chainsPerRegion: 2,
        chainTypes: ['combat', 'trade'],
        totalQuests: 50,
        regions: ['greendale', 'sunhaven', 'ironforge', 'jade_harbor', 'royal_capital', 'frostholm', 'western_territories']
    },

    // 
    //  GREENDALE - Starter Region
    // 
    greendale: {
        regionName: 'Greendale',
        description: 'The peaceful farming community where your journey began.',

        // COMBAT CHAIN: The Vermin Menace (3 quests)
        combatChain: {
            chainId: 'greendale_vermin',
            chainName: 'The Vermin Menace',
            description: 'Giant rats threaten the grain stores. Someone must deal with them.',
            totalQuests: 3,
            requiredAct: 1,

            quests: {
                greendale_vermin_1: {
                    id: 'greendale_vermin_1',
                    name: 'Rat Problem',
                    description: 'The cellar beneath the inn has become infested with giant rats. Clear them out before they ruin the food stores.',
                    giver: 'innkeeper',
                    giverName: 'Martha the Innkeeper',
                    location: 'riverside_inn',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'greendale_vermin',
                    chainOrder: 1,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'kill', target: 'giant_rat', count: 5, current: 0, description: 'Kill 5 giant rats in the cellar' }
                    ],
                    rewards: { gold: 30, reputation: 8, experience: 25 },
                    prerequisite: null,
                    nextQuest: 'greendale_vermin_2',
                    dialogue: {
                        offer: "Please, help! Giant rats have taken over my cellar! They're eating through everything. I'll pay you to clear them out - five should be enough to scare off the rest.",
                        progress: "Have you dealt with those rats yet? I can hear them scurrying about at night!",
                        complete: "Bless you! But wait... these rats were unusually large. Where could they have come from?"
                    }
                },

                greendale_vermin_2: {
                    id: 'greendale_vermin_2',
                    name: 'The Rat King',
                    description: 'The giant rats came from somewhere. Track them to their source and deal with whatever is creating them.',
                    giver: 'elder',
                    giverName: 'Elder Morin',
                    location: 'greendale',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'greendale_vermin',
                    chainOrder: 2,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'investigate', location: 'rat_tunnels', completed: false, description: 'Track the rats to their source' },
                        { type: 'kill', target: 'rat_king', count: 1, current: 0, description: 'Defeat the Rat King' }
                    ],
                    rewards: { gold: 75, reputation: 15, experience: 50, item: 'rat_king_tail' },
                    prerequisite: 'greendale_vermin_1',
                    nextQuest: 'greendale_vermin_3',
                    dialogue: {
                        offer: "Those rats you killed were unnatural - too large, too aggressive. I've heard tales of a creature called the Rat King. Find where they came from and end this threat.",
                        progress: "Have you found the source of the rats? The farmers are worried they'll return.",
                        complete: "The Rat King is dead! You've done Greendale a great service. But we must ensure this never happens again."
                    }
                },

                greendale_vermin_3: {
                    id: 'greendale_vermin_3',
                    name: 'Pest Free',
                    description: 'With the Rat King dead, help the village permanently secure their grain stores against future infestations.',
                    giver: 'farmer',
                    giverName: 'Thomas the Farmer',
                    location: 'greendale',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'greendale_vermin',
                    chainOrder: 3,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'collect', item: 'iron_bars', count: 5, current: 0, description: 'Collect 5 iron bars for reinforcement' },
                        { type: 'deliver', item: 'iron_bars', to: 'farmer', count: 5, current: 0, description: 'Deliver iron bars to Thomas' }
                    ],
                    rewards: {
                        gold: 100,
                        reputation: 20,
                        experience: 75,
                        unlocks: 'greendale_grain_bonus',
                        achievementTitle: 'Pest Controller'
                    },
                    prerequisite: 'greendale_vermin_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "The Rat King is gone, but we need to make sure nothing like this happens again. If you can bring me iron bars, I'll reinforce the grain stores. This village will never fear vermin again!",
                        progress: "Have you found the iron bars? The blacksmith in Ironforge might have some.",
                        complete: "The grain stores are now secure! Greendale owes you a debt. From now on, you'll get better prices on grain here - consider it our thanks."
                    }
                }
            }
        },

        // TRADE CHAIN: Farm to Market (3 quests)
        tradeChain: {
            chainId: 'greendale_farm',
            chainName: 'Farm to Market',
            description: 'Help establish Greendale as a regional supplier of quality grain.',
            totalQuests: 3,
            requiredAct: 1,

            quests: {
                greendale_farm_1: {
                    id: 'greendale_farm_1',
                    name: 'Wheat for the Mill',
                    description: 'The miller needs wheat to demonstrate his new grinding technique. Help gather a good supply.',
                    giver: 'miller',
                    giverName: 'Old Gus the Miller',
                    location: 'wheat_farm',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'greendale_farm',
                    chainOrder: 1,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'collect', item: 'wheat', count: 20, current: 0, description: 'Collect 20 wheat' },
                        { type: 'deliver', item: 'wheat', to: 'miller', count: 20, current: 0, description: 'Deliver wheat to Old Gus' }
                    ],
                    rewards: { gold: 35, reputation: 10, experience: 30 },
                    prerequisite: null,
                    nextQuest: 'greendale_farm_2',
                    dialogue: {
                        offer: "Ah, a trader! I've developed a new grinding technique that produces finer flour than anywhere in the realm. But I need wheat to demonstrate - 20 should do it. Buy from the local farmers, they'll appreciate the business.",
                        progress: "Got that wheat yet? My millstones are ready to prove their worth!",
                        complete: "Perfect! Watch this... *grinds wheat* See how fine? This flour will make Greendale famous!"
                    }
                },

                greendale_farm_2: {
                    id: 'greendale_farm_2',
                    name: "The Miller's Secret",
                    description: 'Old Gus wants to share his special flour recipe, but needs rare ingredients to perfect it.',
                    giver: 'miller',
                    giverName: 'Old Gus the Miller',
                    location: 'wheat_farm',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'greendale_farm',
                    chainOrder: 2,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'buy', item: 'herbs', count: 5, current: 0, description: 'Buy 5 rare herbs from apothecary' },
                        { type: 'deliver', item: 'herbs', to: 'miller', count: 5, current: 0, description: 'Deliver herbs to Old Gus' }
                    ],
                    rewards: {
                        gold: 60,
                        reputation: 15,
                        experience: 45,
                        items: { special_flour: 10 }
                    },
                    prerequisite: 'greendale_farm_1',
                    nextQuest: 'greendale_farm_3',
                    dialogue: {
                        offer: "Between you and me... my flour can be even better. There's a blend of herbs that, when mixed just right, makes bread that practically sells itself. Find me 5 rare herbs - try the apothecary in Sunhaven.",
                        progress: "Found those herbs? The secret recipe awaits!",
                        complete: "Excellent! *carefully blends* Here - take this first batch of special flour. 10 bags, fresh from my special blend! Now go make Greendale famous - sell these at a premium in the capital!"
                    }
                },

                greendale_farm_3: {
                    id: 'greendale_farm_3',
                    name: 'Regional Supplier',
                    description: 'With the special flour recipe, establish Greendale as the premier grain supplier to major cities.',
                    giver: 'elder',
                    giverName: 'Elder Morin',
                    location: 'greendale',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'greendale_farm',
                    chainOrder: 3,
                    difficulty: 'medium',
                    requiredAct: 1,
                    objectives: [
                        { type: 'sell', item: 'special_flour', count: 10, minProfit: 100, current: 0, description: 'Sell 10 special flour for profit (min 10g each)' },
                        { type: 'visit', location: 'royal_capital', completed: false, description: 'Establish trade contact in Royal Capital' }
                    ],
                    rewards: {
                        gold: 200,
                        reputation: 30,
                        experience: 100,
                        unlocks: 'greendale_trade_route',
                        achievementTitle: 'Grain Baron'
                    },
                    prerequisite: 'greendale_farm_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You've proven yourself a capable trader. Now let's make Greendale famous. Take our special flour to the capital - sell it at a premium. Once the nobility tastes it, orders will flow back to us!",
                        progress: "Have you sold the flour in the capital? The farmers are eager to hear of your success.",
                        complete: "Wonderful! Greendale is now known as the finest grain supplier in the land. You've helped build something that will last generations. The trade route is yours to use - enjoy the profits."
                    }
                }
            }
        }
    },

    // 
    //  SUNHAVEN - Southern Port
    // 
    sunhaven: {
        regionName: 'Sunhaven',
        description: 'A bustling southern port known for wine, fish, and occasional pirate trouble.',

        // COMBAT CHAIN: Pirates of the South (4 quests)
        combatChain: {
            chainId: 'sunhaven_pirates',
            chainName: 'Pirates of the South',
            description: 'Pirates threaten Sunhaven\'s shipping. Drive them from these waters.',
            totalQuests: 4,
            requiredAct: 1,

            quests: {
                sunhaven_pirates_1: {
                    id: 'sunhaven_pirates_1',
                    name: 'Dock Brawl',
                    description: 'Pirate scouts have been spotted on the docks. Confront them before they report back to their captain.',
                    giver: 'harbormaster',
                    giverName: 'Harbormaster Reeds',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'sunhaven_pirates',
                    chainOrder: 1,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'kill', target: 'pirate_scout', count: 3, current: 0, description: 'Fight off 3 pirate scouts' }
                    ],
                    rewards: { gold: 50, reputation: 12, experience: 40 },
                    prerequisite: null,
                    nextQuest: 'sunhaven_pirates_2',
                    dialogue: {
                        offer: "Those sea rats are back! I've spotted their scouts on the east dock. If they report back, a raid will follow. Take them out before they escape - there's coin in it for you.",
                        progress: "Have you dealt with those scouts? Every moment they live, our harbor is in danger.",
                        complete: "That'll teach them! But they'll be back with more. We need to find their hideout and end this."
                    }
                },

                sunhaven_pirates_2: {
                    id: 'sunhaven_pirates_2',
                    name: 'The Hidden Cove',
                    description: 'Find where the pirates are hiding their ships. The coast is riddled with coves - search them all if you must.',
                    giver: 'guard',
                    giverName: 'Sergeant Marina',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'sunhaven_pirates',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 1,
                    objectives: [
                        { type: 'investigate', location: 'coastal_caves', completed: false, description: 'Search the coastal caves' },
                        { type: 'investigate', location: 'hidden_cove', completed: false, description: 'Find the pirate hideout' },
                        { type: 'kill', target: 'pirate', count: 5, current: 0, description: 'Clear the cove guards' }
                    ],
                    rewards: { gold: 100, reputation: 20, experience: 75, item: 'pirate_map' },
                    prerequisite: 'sunhaven_pirates_1',
                    nextQuest: 'sunhaven_pirates_3',
                    dialogue: {
                        offer: "Good work with those scouts. Now we need to find where they're hiding. There's a series of coves along the southern coast - the pirates must be using one. Find it, clear their guards, and report back.",
                        progress: "Any luck finding that cove? Check the southern coastline carefully.",
                        complete: "You found it! And this map shows their patrol routes. Now we know where Captain Blacktide hides. Time to end this."
                    }
                },

                sunhaven_pirates_3: {
                    id: 'sunhaven_pirates_3',
                    name: 'Captain Blacktide',
                    description: 'Infiltrate the pirate stronghold and defeat their notorious captain.',
                    giver: 'guard',
                    giverName: 'Sergeant Marina',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'sunhaven_pirates',
                    chainOrder: 3,
                    difficulty: 'medium',
                    requiredAct: 1,
                    isBossQuest: true,
                    objectives: [
                        { type: 'kill', target: 'pirate', count: 8, current: 0, description: 'Fight through 8 pirates' },
                        { type: 'kill', target: 'captain_blacktide', count: 1, current: 0, description: 'Defeat Captain Blacktide' }
                    ],
                    rewards: {
                        gold: 250,
                        reputation: 35,
                        experience: 150,
                        item: 'blacktide_cutlass'
                    },
                    prerequisite: 'sunhaven_pirates_2',
                    nextQuest: 'sunhaven_pirates_4',
                    dialogue: {
                        offer: "This is it. Blacktide himself is in that cove. He's a dangerous fighter - killed three of my best men last year. But with him gone, the pirates will scatter. Are you ready?",
                        progress: "Have you faced Blacktide yet? Don't underestimate him.",
                        complete: "Blacktide is dead! I can hardly believe it. Take his cutlass as proof - and reward. But there's one more thing to do..."
                    }
                },

                sunhaven_pirates_4: {
                    id: 'sunhaven_pirates_4',
                    name: 'Safe Harbors',
                    description: 'With Blacktide dead, hunt down the remaining pirates to ensure Sunhaven\'s waters are truly safe.',
                    giver: 'harbormaster',
                    giverName: 'Harbormaster Reeds',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'sunhaven_pirates',
                    chainOrder: 4,
                    difficulty: 'medium',
                    requiredAct: 1,
                    objectives: [
                        { type: 'kill', target: 'pirate', count: 10, current: 0, description: 'Hunt down 10 remaining pirates' },
                        { type: 'destroy', target: 'pirate_ship', count: 2, current: 0, description: 'Destroy 2 pirate ships' }
                    ],
                    rewards: {
                        gold: 400,
                        reputation: 50,
                        experience: 200,
                        unlocks: 'sunhaven_safe_harbors',
                        achievementTitle: 'Pirate Hunter'
                    },
                    prerequisite: 'sunhaven_pirates_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "Blacktide's death has thrown the pirates into chaos, but some still lurk in our waters. Hunt them down and destroy their ships. When you're done, Sunhaven will be the safest port on the coast!",
                        progress: "Keep at it! Every pirate you kill makes our waters safer.",
                        complete: "The harbor is secure! You've done what no one else could. From now on, merchant ships will pay premium prices to dock here - and you'll get a cut of that. Welcome to the protector's life."
                    }
                }
            }
        },

        // TRADE CHAIN: Wine Country (3 quests)
        tradeChain: {
            chainId: 'sunhaven_wine',
            chainName: 'Wine Country',
            description: 'Learn the vintner\'s art and establish yourself in the wine trade.',
            totalQuests: 3,
            requiredAct: 1,

            quests: {
                sunhaven_wine_1: {
                    id: 'sunhaven_wine_1',
                    name: 'Harvest Help',
                    description: 'The local vintner needs grapes for this season\'s vintage. Help with the harvest.',
                    giver: 'vintner',
                    giverName: 'Isabella Vintara',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'sunhaven_wine',
                    chainOrder: 1,
                    difficulty: 'easy',
                    requiredAct: 1,
                    objectives: [
                        { type: 'collect', item: 'grapes', count: 30, current: 0, description: 'Gather 30 grapes from the vineyards' }
                    ],
                    rewards: { gold: 40, reputation: 10, experience: 30 },
                    prerequisite: null,
                    nextQuest: 'sunhaven_wine_2',
                    dialogue: {
                        offer: "Ah, another pair of hands! The harvest season is upon us and I need grapes - good ones, from the hillside vineyards. Bring me 30 and I'll make it worth your while.",
                        progress: "Have you gathered those grapes? The crushing vats await!",
                        complete: "Excellent specimens! These will make a fine vintage. Stay a while - I'll teach you something about the art of wine."
                    }
                },

                sunhaven_wine_2: {
                    id: 'sunhaven_wine_2',
                    name: "The Vintner's Art",
                    description: 'Isabella offers to teach you the secrets of winemaking. Help her create a masterpiece vintage.',
                    giver: 'vintner',
                    giverName: 'Isabella Vintara',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'sunhaven_wine',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 1,
                    objectives: [
                        { type: 'collect', item: 'oak_barrel', count: 3, current: 0, description: 'Obtain 3 oak barrels' },
                        { type: 'collect', item: 'honey', count: 5, current: 0, description: 'Collect 5 honey for sweetening' },
                        { type: 'deliver', to: 'vintner', completed: false, description: 'Bring materials to Isabella' }
                    ],
                    rewards: {
                        gold: 80,
                        reputation: 18,
                        experience: 60,
                        item: 'winemaking_recipe',
                        unlocks: 'can_craft_wine'
                    },
                    prerequisite: 'sunhaven_wine_1',
                    nextQuest: 'sunhaven_wine_3',
                    dialogue: {
                        offer: "You have potential. I'll teach you my family's winemaking secrets, but first I need materials - oak barrels for aging, and honey for my special recipe. The barrels come from the cooper in Ironforge, honey from Greendale beekeepers.",
                        progress: "Have you gathered the materials? Great wine cannot be rushed, but it does require ingredients.",
                        complete: "Perfect! Now watch closely... *demonstrates winemaking* There. You now know the Vintara method. This knowledge is priceless - use it well."
                    }
                },

                sunhaven_wine_3: {
                    id: 'sunhaven_wine_3',
                    name: 'Royal Vintage',
                    description: 'Create and deliver a special vintage to the Royal Capital. Success will establish your reputation in high society.',
                    giver: 'vintner',
                    giverName: 'Isabella Vintara',
                    // FIX CRITICAL-011: Add turnIn fields so quest can be completed
                    turnInNpc: 'vintner',
                    turnInNpcName: 'Isabella Vintara',
                    turnInLocation: 'sunhaven',
                    location: 'sunhaven',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'sunhaven_wine',
                    chainOrder: 3,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'craft', item: 'royal_vintage_wine', count: 5, current: 0, description: 'Craft 5 Royal Vintage wines' },
                        { type: 'deliver', item: 'royal_vintage_wine', to: 'noble', location: 'royal_capital', count: 5, current: 0, description: 'Deliver wine to the Royal Capital nobles' }
                    ],
                    rewards: {
                        gold: 300,
                        reputation: 40,
                        experience: 150,
                        unlocks: 'royal_wine_contract',
                        achievementTitle: 'Royal Vintner'
                    },
                    prerequisite: 'sunhaven_wine_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You've learned well. Now for your final test - create a vintage worthy of royalty and deliver it to the capital yourself. If the nobles approve, you'll have contracts for life. I believe in you.",
                        progress: "The wine must be perfect. Have you crafted and delivered it yet?",
                        complete: "The nobles are raving about 'your' wine! Well, our wine. You've done it - you're now an official supplier to the crown. The profits will be substantial. I'm proud of you."
                    }
                }
            }
        }
    },

    // 
    //  IRONFORGE - Industrial City
    // 
    ironforge: {
        regionName: 'Ironforge',
        description: 'The industrial heart of the realm, famous for its smiths and mines.',

        // COMBAT CHAIN: Forge Wars (4 quests)
        combatChain: {
            chainId: 'ironforge_wars',
            chainName: 'Forge Wars',
            description: 'Something threatens Ironforge\'s mines and forges. Investigate and eliminate the threat.',
            totalQuests: 4,
            requiredAct: 2,

            quests: {
                ironforge_wars_1: {
                    id: 'ironforge_wars_1',
                    name: 'Mine Infestation',
                    description: 'Creatures have overrun the lower mines. Clear them out so work can resume.',
                    giver: 'blacksmith',
                    giverName: 'Forgemaster Grimm',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'ironforge_wars',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'kill', target: 'cave_spider', count: 8, current: 0, description: 'Kill 8 cave spiders' },
                        { type: 'kill', target: 'rock_beetle', count: 5, current: 0, description: 'Kill 5 rock beetles' }
                    ],
                    rewards: { gold: 150, reputation: 25, experience: 100 },
                    prerequisite: null,
                    nextQuest: 'ironforge_wars_2',
                    dialogue: {
                        offer: "The lower mines are crawling with vermin - spiders and beetles that came from gods know where. My miners won't go down there until it's clear. Handle it and I'll pay you well.",
                        progress: "Are the mines clear yet? Production is suffering every day.",
                        complete: "The miners can return! But something's not right... creatures don't just appear like that. Someone's been sabotaging us."
                    }
                },

                ironforge_wars_2: {
                    id: 'ironforge_wars_2',
                    name: 'Saboteur Hunt',
                    description: 'Someone has been sabotaging the forges. Find evidence of who\'s behind it.',
                    giver: 'guard',
                    giverName: 'Captain Ironside',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'ironforge_wars',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'investigate', location: 'damaged_forge', completed: false, description: 'Examine the damaged forge' },
                        { type: 'collect', item: 'saboteur_clue', count: 3, current: 0, description: 'Find 3 pieces of evidence' },
                        { type: 'investigate', location: 'rival_guild_symbol', completed: false, description: 'Identify the saboteurs' }
                    ],
                    rewards: { gold: 200, reputation: 30, experience: 125, item: 'rival_guild_evidence' },
                    prerequisite: 'ironforge_wars_1',
                    nextQuest: 'ironforge_wars_3',
                    dialogue: {
                        offer: "Three forges have exploded in as many weeks. That's not accident - that's sabotage. Someone wants Ironforge to fail. Find evidence. Check the damaged forge, talk to witnesses, look for patterns.",
                        progress: "Found anything? We need to know who we're dealing with.",
                        complete: "The Crimson Anvil guild! Those bastards set up shop in the old mines and they're trying to destroy our business. This means war."
                    }
                },

                ironforge_wars_3: {
                    id: 'ironforge_wars_3',
                    name: 'The Rival Guild',
                    description: 'Confront the Crimson Anvil saboteurs in their hideout.',
                    giver: 'guard',
                    giverName: 'Captain Ironside',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'ironforge_wars',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 2,
                    isBossQuest: true,
                    objectives: [
                        { type: 'travel', to: 'old_mines', completed: false, description: 'Find the Crimson Anvil hideout' },
                        { type: 'kill', target: 'crimson_anvil_thug', count: 10, current: 0, description: 'Fight through their guards' },
                        { type: 'kill', target: 'guildmaster_crimson', count: 1, current: 0, description: 'Defeat Guildmaster Crimson' }
                    ],
                    rewards: {
                        gold: 400,
                        reputation: 45,
                        experience: 200,
                        item: 'crimson_anvil_hammer'
                    },
                    prerequisite: 'ironforge_wars_2',
                    nextQuest: 'ironforge_wars_4',
                    dialogue: {
                        offer: "We know where they hide. The old mines east of the city. Take some men and root them out. Their leader, Guildmaster Crimson, must answer for what he's done.",
                        progress: "Have you found Crimson yet? Don't let him escape.",
                        complete: "Crimson is dead and his guild is broken! But some escaped. We must make sure they can never threaten Ironforge again."
                    }
                },

                ironforge_wars_4: {
                    id: 'ironforge_wars_4',
                    name: 'Ironclad Peace',
                    description: 'Hunt down the remaining Crimson Anvil members and decide their fate.',
                    giver: 'blacksmith',
                    giverName: 'Forgemaster Grimm',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'ironforge_wars',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 2,
                    isChoiceQuest: true,
                    objectives: [
                        { type: 'kill', target: 'crimson_anvil_survivor', count: 8, current: 0, description: 'Hunt down 8 survivors' },
                        { type: 'choice', options: ['destroy', 'negotiate'], completed: false, description: 'Choose their fate' }
                    ],
                    choiceRewards: {
                        destroy: {
                            gold: 600,
                            reputation: 60,
                            experience: 250,
                            unlocks: 'ironforge_fear_bonus',
                            achievementTitle: 'Forge Defender'
                        },
                        negotiate: {
                            gold: 400,
                            reputation: 80,
                            experience: 250,
                            unlocks: 'crimson_anvil_ally',
                            achievementTitle: 'Forge Diplomat'
                        }
                    },
                    rewards: null, // Set based on choice
                    prerequisite: 'ironforge_wars_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "The survivors are scattered, leaderless. You could hunt them all down and end this forever. Or... some say they could be convinced to join us, bringing their skills to strengthen Ironforge. What will you choose?",
                        progress: "Have you made your choice? The survivors await judgment.",
                        completeDestroy: "It's done. The Crimson Anvil is no more. Ironforge will never be threatened by them again. You've earned your place here.",
                        completeNegotiate: "A bold choice. The survivors have agreed to join us in exchange for amnesty. Their smithing secrets are now ours. Some call it weakness - I call it wisdom."
                    }
                }
            }
        },

        // TRADE CHAIN: Steel Magnate (4 quests)
        tradeChain: {
            chainId: 'ironforge_steel',
            chainName: 'Steel Magnate',
            description: 'Rise from raw ore trader to weapons empire owner.',
            totalQuests: 4,
            requiredAct: 2,

            quests: {
                ironforge_steel_1: {
                    id: 'ironforge_steel_1',
                    name: 'Iron in the Fire',
                    description: 'The forgemaster needs iron ore for a special commission. Gather it from the mines.',
                    giver: 'blacksmith',
                    giverName: 'Forgemaster Grimm',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'ironforge_steel',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'collect', item: 'iron_ore', count: 10, current: 0, description: 'Collect 10 iron ore' },
                        { type: 'deliver', item: 'iron_ore', to: 'blacksmith', count: 10, current: 0, description: 'Deliver ore to Forgemaster Grimm' }
                    ],
                    rewards: { gold: 120, reputation: 20, experience: 80 },
                    prerequisite: null,
                    nextQuest: 'ironforge_steel_2',
                    dialogue: {
                        offer: "I've got a commission for the king's guard - finest steel armor. But I need iron ore, and my usual suppliers are behind. Get me 10 quality chunks and I'll remember it.",
                        progress: "Got that ore? Time is iron in this business.",
                        complete: "Quality stuff! This'll make fine steel. You know, you've got an eye for materials. I could use someone like you in my supply chain."
                    }
                },

                ironforge_steel_2: {
                    id: 'ironforge_steel_2',
                    name: 'Coal for the Forge',
                    description: 'High-quality steel needs coal. Lots of it.',
                    giver: 'blacksmith',
                    giverName: 'Forgemaster Grimm',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'ironforge_steel',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'collect', item: 'coal', count: 15, current: 0, description: 'Collect 15 coal' },
                        { type: 'deliver', item: 'coal', to: 'blacksmith', count: 15, current: 0, description: 'Deliver coal to the forge' }
                    ],
                    rewards: {
                        gold: 150,
                        reputation: 22,
                        experience: 90,
                        item: 'master_smith_contact'
                    },
                    prerequisite: 'ironforge_steel_1',
                    nextQuest: 'ironforge_steel_3',
                    dialogue: {
                        offer: "Steel's only as good as the fire that forges it. I need coal - 15 loads of the good stuff. The deep mines have the best, but any quality coal will do.",
                        progress: "The forges grow cold waiting for that coal.",
                        complete: "Now we're talking! With this coal, I can forge steel that'll last centuries. I'm giving you a contact - my master smith. He'll be useful for what comes next."
                    }
                },

                ironforge_steel_3: {
                    id: 'ironforge_steel_3',
                    name: "The Master's Commission",
                    description: 'Commission a legendary weapon from the master smith. It will require rare materials.',
                    giver: 'blacksmith',
                    giverName: 'Master Smith Harken',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'ironforge_steel',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 2,
                    objectives: [
                        { type: 'collect', item: 'star_metal', count: 2, current: 0, description: 'Find 2 star metal ingots (rare)' },
                        { type: 'collect', item: 'dragon_scale', count: 1, current: 0, description: 'Obtain 1 dragon scale' },
                        { type: 'pay', gold: 1000, completed: false, description: 'Pay 1000g commission fee' }
                    ],
                    rewards: {
                        gold: 0, // You're paying for this one
                        reputation: 35,
                        experience: 175,
                        item: 'legendary_weapon'
                    },
                    prerequisite: 'ironforge_steel_2',
                    nextQuest: 'ironforge_steel_4',
                    dialogue: {
                        offer: "Grimm spoke highly of you. I can forge you a weapon of legend - something that will make kingdoms envious. But it requires star metal, a dragon scale, and 1000 gold. Bring me these, and I'll create something magnificent.",
                        progress: "Legendary weapons require legendary patience. And legendary materials.",
                        complete: "It is done. *presents weapon* This blade has no equal in the realm. Wield it with honor - and let others see what Ironforge can create."
                    }
                },

                ironforge_steel_4: {
                    id: 'ironforge_steel_4',
                    name: 'Arms Dealer',
                    description: 'Use your legendary weapon as proof of quality to establish a weapons trading empire.',
                    giver: 'blacksmith',
                    giverName: 'Forgemaster Grimm',
                    location: 'ironforge_city',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'ironforge_steel',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 2,
                    objectives: [
                        { type: 'show', item: 'legendary_weapon', to: 'noble', location: 'royal_capital', completed: false, description: 'Display your weapon to Royal Capital nobles' },
                        { type: 'sell', item: 'weapons', count: 20, minTotal: 5000, current: 0, description: 'Sell 20 weapons for at least 5000g total' },
                        { type: 'establish', contract: 'arms_supplier', completed: false, description: 'Sign exclusive arms supply contract' }
                    ],
                    rewards: {
                        gold: 2000,
                        reputation: 70,
                        experience: 350,
                        unlocks: 'ironforge_arms_empire',
                        achievementTitle: 'Steel Magnate'
                    },
                    prerequisite: 'ironforge_steel_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "That weapon proves what we can do. Now leverage it. Show it to the nobles, demonstrate our quality, and secure arms contracts. You could become the biggest weapons dealer in the realm.",
                        progress: "Building an empire takes time. Keep pushing those sales.",
                        complete: "You've done it! The royal guard, three noble houses, and the merchant guild all buy from your network now. You're not just a trader anymore - you're the Steel Magnate. Ironforge is proud to call you partner."
                    }
                }
            }
        }
    },

    // 
    //  JADE HARBOR - Eastern Port
    // 
    jade_harbor: {
        regionName: 'Jade Harbor',
        description: 'An exotic eastern port known for silk, jade, and smuggling operations.',

        // COMBAT CHAIN: Smuggler's Justice (3 quests)
        combatChain: {
            chainId: 'jade_smugglers',
            chainName: "Smuggler's Justice",
            description: 'A smuggling ring threatens legitimate trade. Bring them to justice.',
            totalQuests: 3,
            requiredAct: 2,

            quests: {
                jade_smugglers_1: {
                    id: 'jade_smugglers_1',
                    name: 'Dock Disputes',
                    description: 'Smugglers are intimidating honest merchants. Put a stop to their harassment.',
                    giver: 'harbormaster',
                    giverName: 'Harbormaster Chen',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'jade_smugglers',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'kill', target: 'smuggler_thug', count: 6, current: 0, description: 'Beat up 6 smuggler thugs' }
                    ],
                    rewards: { gold: 125, reputation: 22, experience: 90 },
                    prerequisite: null,
                    nextQuest: 'jade_smugglers_2',
                    dialogue: {
                        offer: "These smugglers think they own the docks. They shake down honest merchants for 'protection' money. I need someone to show them they don't control this harbor. Make them bleed.",
                        progress: "Still seeing those thugs around. Keep hitting them.",
                        complete: "That got their attention! But they're just muscle. The real operation runs deeper. We need to find who's pulling the strings."
                    }
                },

                jade_smugglers_2: {
                    id: 'jade_smugglers_2',
                    name: 'The Contraband Ring',
                    description: 'Infiltrate the smuggler network to find their leader.',
                    giver: 'merchant',
                    giverName: 'Silk Merchant Wei',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'jade_smugglers',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'infiltrate', location: 'smuggler_warehouse', completed: false, description: 'Find and enter the smuggler warehouse' },
                        { type: 'collect', item: 'smuggler_ledger', count: 1, current: 0, description: 'Steal their accounting ledger' },
                        { type: 'kill', target: 'smuggler_guard', count: 4, current: 0, description: 'Fight your way out' }
                    ],
                    rewards: {
                        gold: 200,
                        reputation: 30,
                        experience: 125,
                        item: 'smuggler_ledger'
                    },
                    prerequisite: 'jade_smugglers_1',
                    nextQuest: 'jade_smugglers_3',
                    dialogue: {
                        offer: "I know where they store their contraband - an old warehouse by the fish market. If you can get in there and find their ledger, we'll know everything. But be careful - they guard it well.",
                        progress: "Have you found that ledger yet? It's the key to bringing them down.",
                        complete: "This ledger shows everything! Their boss, their buyers, their routes. Now we can end them for good."
                    }
                },

                jade_smugglers_3: {
                    id: 'jade_smugglers_3',
                    name: 'Smuggler Boss',
                    description: 'With the evidence in hand, confront and defeat the smuggling kingpin.',
                    giver: 'guard',
                    giverName: 'Commander Feng',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'jade_smugglers',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 2,
                    isBossQuest: true,
                    objectives: [
                        { type: 'travel', to: 'smuggler_hideout', completed: false, description: 'Find the kingpin\'s hideout' },
                        { type: 'kill', target: 'smuggler', count: 8, current: 0, description: 'Fight through the guards' },
                        { type: 'kill', target: 'kingpin_shadow', count: 1, current: 0, description: 'Defeat Kingpin Shadow' }
                    ],
                    rewards: {
                        gold: 500,
                        reputation: 55,
                        experience: 225,
                        unlocks: 'jade_harbor_safe_trade',
                        achievementTitle: 'Smuggler Hunter'
                    },
                    prerequisite: 'jade_smugglers_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "The ledger reveals everything. Their boss calls himself 'Shadow' - real original. He operates from a ship in the east cove. Take him down and the whole operation collapses.",
                        progress: "Shadow still breathes. Finish it.",
                        complete: "Shadow is dead and his network is shattered! Jade Harbor's legitimate merchants can breathe easy now. You've earned their respect - and gratitude. Expect favorable prices in your future dealings here."
                    }
                }
            }
        },

        // TRADE CHAIN: Silk Road (4 quests)
        tradeChain: {
            chainId: 'jade_silk',
            chainName: 'Silk Road',
            description: 'Establish dominance over the lucrative eastern silk trade.',
            totalQuests: 4,
            requiredAct: 2,

            quests: {
                jade_silk_1: {
                    id: 'jade_silk_1',
                    name: 'Silk Road Express',
                    description: 'Make your first silk delivery to prove you can handle the delicate cargo.',
                    giver: 'merchant',
                    giverName: 'Silk Merchant Wei',
                    // FIX CRITICAL-012: Add turnIn fields so quest can be completed
                    turnInNpc: 'merchant',
                    turnInNpcName: 'Silk Merchant Wei',
                    turnInLocation: 'jade_harbor',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'jade_silk',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'buy', item: 'silk', count: 10, maxPrice: 50, current: 0, description: 'Buy 10 silk bolts (max 50g each)' },
                        { type: 'deliver', item: 'silk', to: 'tailor', location: 'royal_capital', count: 10, current: 0, description: 'Deliver to Royal Capital tailor' }
                    ],
                    rewards: { gold: 175, reputation: 25, experience: 100 },
                    prerequisite: null,
                    nextQuest: 'jade_silk_2',
                    dialogue: {
                        offer: "Silk is gold in thread form - light, valuable, and in constant demand. I need a reliable carrier. Buy 10 bolts from my warehouse and deliver them to my contact in the capital. Handle them well - damaged silk is worthless.",
                        progress: "Silk waiting in the capital. Have you made the delivery?",
                        complete: "Delivered in perfect condition! The tailor was impressed. You've got potential in this trade. Let me introduce you to some contacts..."
                    }
                },

                jade_silk_2: {
                    id: 'jade_silk_2',
                    name: 'Eastern Contacts',
                    description: 'Build relationships with the eastern merchant families.',
                    giver: 'merchant',
                    giverName: 'Silk Merchant Wei',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'jade_silk',
                    chainOrder: 2,
                    difficulty: 'medium',
                    requiredAct: 2,
                    objectives: [
                        { type: 'visit', location: 'chen_estate', completed: false, description: 'Visit the Chen family estate' },
                        { type: 'gift', item: 'wine', to: 'chen_patriarch', count: 5, current: 0, description: 'Gift 5 fine wines to the patriarch' },
                        { type: 'buy', item: 'jade', count: 3, specialPrice: true, current: 0, description: 'Purchase jade at insider prices' }
                    ],
                    rewards: {
                        gold: 250,
                        reputation: 35,
                        experience: 150,
                        unlocks: 'eastern_merchant_contacts'
                    },
                    prerequisite: 'jade_silk_1',
                    nextQuest: 'jade_silk_3',
                    dialogue: {
                        offer: "The silk trade is controlled by the great families. I'll introduce you to the Chens - bring them a gift of fine wine, show respect, and they'll give you access to prices no outsider sees.",
                        progress: "Have you met with the Chens? First impressions are everything.",
                        complete: "They accepted you! That's rare for an outsider. The jade you purchased at their prices is worth triple elsewhere. This is how fortunes are made in the east."
                    }
                },

                jade_silk_3: {
                    id: 'jade_silk_3',
                    name: 'The Jade Auction',
                    description: 'Participate in the famous Jade Harbor auction and win a rare item.',
                    giver: 'merchant',
                    giverName: 'Auctioneer Ming',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'jade_silk',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 2,
                    objectives: [
                        { type: 'attend', event: 'jade_auction', completed: false, description: 'Attend the Jade Harbor auction' },
                        { type: 'bid', minGold: 2000, completed: false, description: 'Win an auction (min bid 2000g)' },
                        { type: 'acquire', item: 'emperors_jade', count: 1, current: 0, description: 'Acquire the Emperor\'s Jade' }
                    ],
                    rewards: {
                        gold: 0, // You're spending here
                        reputation: 50,
                        experience: 200,
                        item: 'emperors_jade'
                    },
                    prerequisite: 'jade_silk_2',
                    nextQuest: 'jade_silk_4',
                    dialogue: {
                        offer: "The monthly auction is the heart of Jade Harbor's trade. Rare items from across the world. With your contacts, you can compete with the big traders. Win the Emperor's Jade - it'll mark you as a serious player.",
                        progress: "The auction awaits. Have you secured your prize?",
                        complete: "The Emperor's Jade is yours! Every merchant in the east now knows your name. You're no longer an outsider - you're one of us."
                    }
                },

                jade_silk_4: {
                    id: 'jade_silk_4',
                    name: 'Trade Empire East',
                    description: 'Leverage your reputation to dominate the eastern commerce routes.',
                    giver: 'merchant',
                    giverName: 'Silk Merchant Wei',
                    location: 'jade_harbor',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'jade_silk',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'establish', route: 'jade_to_capital', completed: false, description: 'Establish Jade-Capital trade route' },
                        { type: 'profit', minGold: 10000, current: 0, description: 'Earn 10,000g in eastern trade' },
                        { type: 'contract', merchant: 'eastern_families', count: 3, current: 0, description: 'Secure 3 exclusive family contracts' }
                    ],
                    rewards: {
                        gold: 3000,
                        reputation: 80,
                        experience: 400,
                        unlocks: 'jade_trade_empire',
                        achievementTitle: 'Silk Emperor'
                    },
                    prerequisite: 'jade_silk_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You've earned your place among the eastern merchants. Now claim it. Establish permanent routes, secure exclusive contracts, and build an empire that will last generations. The silk road awaits its new master.",
                        progress: "An empire isn't built in a day. Keep expanding your network.",
                        complete: "Magnificent! You control more eastern trade than any outsider in history. The silk flows through your hands, the jade passes through your vaults. You are the Silk Emperor. I'm proud to have started you on this path."
                    }
                }
            }
        }
    },

    // 
    //  ROYAL CAPITAL - Central Hub
    // 
    royal_capital: {
        regionName: 'Royal Capital',
        description: 'The seat of power, where nobility and commerce intersect.',

        // COMBAT CHAIN: Royal Guard (4 quests)
        combatChain: {
            chainId: 'capital_guard',
            chainName: 'Royal Guard',
            description: 'Protect the crown from threats both common and noble.',
            totalQuests: 4,
            requiredAct: 3,

            quests: {
                capital_guard_1: {
                    id: 'capital_guard_1',
                    name: 'Street Justice',
                    description: 'A gang of thieves has been terrorizing the market district. Bring them to justice.',
                    giver: 'guard',
                    giverName: 'Captain Aldric',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'capital_guard',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 3,
                    objectives: [
                        { type: 'kill', target: 'street_thief', count: 8, current: 0, description: 'Catch 8 thieves' },
                        { type: 'recover', item: 'stolen_goods', count: 5, current: 0, description: 'Recover 5 stolen items' }
                    ],
                    rewards: { gold: 300, reputation: 35, experience: 175 },
                    prerequisite: null,
                    nextQuest: 'capital_guard_2',
                    dialogue: {
                        offer: "The market district has become a haven for thieves. My guards are stretched thin. I need someone with your... skills... to clean up the streets. Catch the thieves, recover what you can.",
                        progress: "The thieves still plague us. Keep hunting them.",
                        complete: "The merchants can breathe easier now. But these thieves were too organized. Someone's directing them. Stay alert."
                    }
                },

                capital_guard_2: {
                    id: 'capital_guard_2',
                    name: 'The Assassin Plot',
                    description: 'Uncover a plot to assassinate a member of the nobility.',
                    giver: 'guard',
                    giverName: 'Captain Aldric',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'capital_guard',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'investigate', location: 'thieves_guild', completed: false, description: 'Infiltrate the thieves guild' },
                        { type: 'collect', item: 'assassination_orders', count: 1, current: 0, description: 'Find the assassination orders' },
                        { type: 'warn', npc: 'noble', completed: false, description: 'Warn the target' }
                    ],
                    rewards: {
                        gold: 500,
                        reputation: 50,
                        experience: 250,
                        unlocks: 'noble_favor'
                    },
                    prerequisite: 'capital_guard_1',
                    nextQuest: 'capital_guard_3',
                    dialogue: {
                        offer: "Those thieves led us to something worse. There's a plot to kill Duke Valdric. He's harsh but fair - his death would throw the realm into chaos. Find the assassins' orders and warn him.",
                        progress: "Have you found proof of the plot? Time is short.",
                        complete: "The Duke lives, thanks to you! He's in your debt now. That's worth more than gold in this city. But the assassins are still out there..."
                    }
                },

                capital_guard_3: {
                    id: 'capital_guard_3',
                    name: 'Palace Defense',
                    description: 'The assassins make their move. Defend the palace from attack.',
                    giver: 'guard',
                    giverName: 'Duke Valdric',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'capital_guard',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 3,
                    isBossQuest: true,
                    objectives: [
                        { type: 'kill', target: 'assassin', count: 12, current: 0, description: 'Repel 12 assassins' },
                        { type: 'protect', npc: 'duke', duration: 300, completed: false, description: 'Protect the Duke for 5 minutes' },
                        { type: 'kill', target: 'master_assassin', count: 1, current: 0, description: 'Defeat the Master Assassin' }
                    ],
                    rewards: {
                        gold: 1000,
                        reputation: 75,
                        experience: 400,
                        item: 'royal_defender_medal'
                    },
                    prerequisite: 'capital_guard_2',
                    nextQuest: 'capital_guard_4',
                    dialogue: {
                        offer: "They're coming tonight. I won't hide like a coward. Stand with me and my guards. When they come, we'll show them what happens to those who threaten the crown.",
                        progress: "Hold the line! Don't let them through!",
                        complete: "The Master Assassin is dead! You fought like a lion. The palace stands because of you. There's only one proper way to reward such valor..."
                    }
                },

                capital_guard_4: {
                    id: 'capital_guard_4',
                    name: "Knight's Honor",
                    description: 'For your service to the crown, receive the ultimate reward - knighthood.',
                    giver: 'noble',
                    giverName: 'Duke Valdric',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'capital_guard',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'attend', event: 'knighting_ceremony', completed: false, description: 'Attend the knighting ceremony' },
                        { type: 'swear', oath: 'knight_oath', completed: false, description: 'Swear the knight\'s oath' }
                    ],
                    rewards: {
                        gold: 2500,
                        reputation: 100,
                        experience: 500,
                        title: 'Sir',
                        unlocks: 'noble_status',
                        achievementTitle: 'Knight of the Realm'
                    },
                    prerequisite: 'capital_guard_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You have proven your worth beyond any doubt. It is time. Attend the ceremony in the throne room. Before the court and crown, you will be knighted.",
                        progress: "The court awaits your presence in the throne room.",
                        complete: "Rise, Sir Knight! You are now a knight of the realm, with all the privileges and responsibilities that entails. Lands, title, and the eternal gratitude of the crown. Serve with honor."
                    }
                }
            }
        },

        // TRADE CHAIN: Noble Commerce (4 quests)
        tradeChain: {
            chainId: 'capital_noble',
            chainName: 'Noble Commerce',
            description: 'Navigate the treacherous waters of noble business dealings.',
            totalQuests: 4,
            requiredAct: 3,

            quests: {
                capital_noble_1: {
                    id: 'capital_noble_1',
                    name: 'Noble Tastes',
                    description: 'Supply the nobility with their favorite indulgence - fine wine.',
                    giver: 'noble',
                    giverName: 'Lady Seraphina',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'capital_noble',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 3,
                    objectives: [
                        { type: 'deliver', item: 'fine_wine', to: 'noble', count: 10, current: 0, description: 'Deliver 10 fine wines to nobles' }
                    ],
                    rewards: { gold: 400, reputation: 40, experience: 200 },
                    prerequisite: null,
                    nextQuest: 'capital_noble_2',
                    dialogue: {
                        offer: "Darling, my cellars are simply *empty*. I need fine wine - Sunhaven vintage preferably. Bring me 10 bottles and I'll make sure you meet all the right people.",
                        progress: "Still waiting for that wine, darling. A lady does get thirsty.",
                        complete: "Divine! You have exquisite taste. Now, let me introduce you to the Auction House..."
                    }
                },

                capital_noble_2: {
                    id: 'capital_noble_2',
                    name: 'The Auction House',
                    description: 'Learn to navigate the capital\'s exclusive auction scene.',
                    giver: 'merchant',
                    giverName: 'Auctioneer Graves',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'capital_noble',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'attend', event: 'capital_auction', count: 3, current: 0, description: 'Attend 3 auctions' },
                        { type: 'bid', minTotal: 5000, current: 0, description: 'Spend at least 5000g on auction items' },
                        { type: 'sell', location: 'auction', minProfit: 3000, current: 0, description: 'Earn 3000g profit selling at auction' }
                    ],
                    rewards: {
                        gold: 1000,
                        reputation: 55,
                        experience: 275,
                        unlocks: 'auction_membership'
                    },
                    prerequisite: 'capital_noble_1',
                    nextQuest: 'capital_noble_3',
                    dialogue: {
                        offer: "Lady Seraphina speaks highly of you. The auction house is where fortunes are made and lost in a single evening. Learn its ways - attend, buy, sell. Master the rhythm and you'll never want for gold.",
                        progress: "Keep attending. Keep learning. The patterns reveal themselves to the patient.",
                        complete: "You've developed a keen eye and steady nerve. You're ready for the inner circle. Here - your permanent membership. The private auctions await."
                    }
                },

                capital_noble_3: {
                    id: 'capital_noble_3',
                    name: 'Royal Contract',
                    description: 'Compete for the exclusive right to supply the royal household.',
                    giver: 'steward',
                    giverName: 'Royal Steward Aldwin',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'capital_noble',
                    chainOrder: 3,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'submit', item: 'trade_proposal', completed: false, description: 'Submit a trade proposal to the crown' },
                        { type: 'demonstrate', item: 'sample_goods', count: 20, current: 0, description: 'Provide 20 sample goods' },
                        { type: 'outbid', competitor: 'rival_merchant', completed: false, description: 'Outcompete rival merchant' }
                    ],
                    rewards: {
                        gold: 2000,
                        reputation: 70,
                        experience: 350,
                        unlocks: 'royal_supplier_status'
                    },
                    prerequisite: 'capital_noble_2',
                    nextQuest: 'capital_noble_4',
                    dialogue: {
                        offer: "The royal household's current supplier is... inadequate. We're accepting proposals for a new exclusive contract. Submit your proposal, demonstrate quality, and outperform your competitors. The rewards are substantial.",
                        progress: "The competition is fierce. Show us why you're the best choice.",
                        complete: "Congratulations. You are now the official supplier to the royal household. Your goods will grace the king's table. This contract alone will make you wealthy."
                    }
                },

                capital_noble_4: {
                    id: 'capital_noble_4',
                    name: 'Merchant Prince',
                    description: 'Ascend to the highest tier of legitimate commerce in the realm.',
                    giver: 'noble',
                    giverName: 'The Merchant Council',
                    location: 'royal_capital',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'capital_noble',
                    chainOrder: 4,
                    difficulty: 'very_hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'wealth', minGold: 100000, current: 0, description: 'Amass 100,000g wealth' },
                        { type: 'reputation', minRep: 500, current: 0, description: 'Achieve 500 reputation' },
                        { type: 'seat', council: 'merchant_council', completed: false, description: 'Claim seat on Merchant Council' }
                    ],
                    rewards: {
                        gold: 5000,
                        reputation: 150,
                        experience: 750,
                        title: 'Merchant Prince',
                        unlocks: 'merchant_council_seat',
                        achievementTitle: 'Merchant Prince'
                    },
                    prerequisite: 'capital_noble_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You've risen from nothing to supplying the crown itself. There's only one step higher - a seat on the Merchant Council. We set trade policy for the entire realm. Prove your worth with wealth and reputation, and the seat is yours.",
                        progress: "The council awaits someone of true stature. Build your empire.",
                        complete: "Welcome, Merchant Prince. You now shape the commerce of nations. The wealth of kingdoms flows through your decisions. Use this power wisely - or don't. The choice is yours."
                    }
                }
            }
        }
    },

    // 
    //  FROSTHOLM - Northern Wilderness
    // 
    frostholm: {
        regionName: 'Frostholm',
        description: 'A harsh northern frontier where only the strongest survive.',

        // COMBAT CHAIN: Winter Wolves (4 quests)
        combatChain: {
            chainId: 'frostholm_wolves',
            chainName: 'Winter Wolves',
            description: 'Protect the northern settlements from wolf pack attacks.',
            totalQuests: 4,
            requiredAct: 3,

            quests: {
                frostholm_wolves_1: {
                    id: 'frostholm_wolves_1',
                    name: 'Wolf Pack',
                    description: 'Wolves have been attacking villagers. Thin their numbers.',
                    giver: 'huntmaster',
                    giverName: 'Huntmaster Bjorn',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'frostholm_wolves',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 3,
                    objectives: [
                        { type: 'kill', target: 'winter_wolf', count: 8, current: 0, description: 'Kill 8 wolves threatening the village' }
                    ],
                    rewards: { gold: 250, reputation: 30, experience: 150, item: 'wolf_pelt' },
                    prerequisite: null,
                    nextQuest: 'frostholm_wolves_2',
                    dialogue: {
                        offer: "The wolves are hungrier than usual this winter. They've taken two children already. Hunt them down - kill eight at least. That should give us some breathing room.",
                        progress: "More wolves howl in the night. Keep hunting.",
                        complete: "Eight wolves dead. Good. But they're not acting natural - something's driving them this close to civilization. We need to find out what."
                    }
                },

                frostholm_wolves_2: {
                    id: 'frostholm_wolves_2',
                    name: 'Alpha Hunt',
                    description: 'Track down the wolf pack\'s alpha to understand their unusual behavior.',
                    giver: 'huntmaster',
                    giverName: 'Huntmaster Bjorn',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'frostholm_wolves',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'track', target: 'alpha_wolf', completed: false, description: 'Follow the alpha wolf\'s trail' },
                        { type: 'investigate', location: 'wolf_den', completed: false, description: 'Find the pack\'s den' },
                        { type: 'kill', target: 'alpha_wolf', count: 1, current: 0, description: 'Kill the alpha wolf' }
                    ],
                    rewards: {
                        gold: 400,
                        reputation: 45,
                        experience: 225,
                        item: 'alpha_wolf_fang'
                    },
                    prerequisite: 'frostholm_wolves_1',
                    nextQuest: 'frostholm_wolves_3',
                    dialogue: {
                        offer: "I've found tracks - bigger than any normal wolf. An alpha, and an old one. If we kill it, the pack will scatter. Track it to its den and end this.",
                        progress: "The alpha still lives. Follow those tracks deeper into the wilderness.",
                        complete: "The alpha is dead! But... look at these claw marks around the den. These aren't wolf marks. Something bigger drove the pack from their territory. Something ancient."
                    }
                },

                frostholm_wolves_3: {
                    id: 'frostholm_wolves_3',
                    name: 'The Frost Lord',
                    description: 'Face the legendary beast that drove the wolves from their home.',
                    giver: 'sage',
                    giverName: 'Sage Freya',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'frostholm_wolves',
                    chainOrder: 3,
                    difficulty: 'very_hard',
                    requiredAct: 3,
                    isBossQuest: true,
                    objectives: [
                        { type: 'travel', to: 'frozen_cave', completed: false, description: 'Find the Frost Lord\'s lair' },
                        { type: 'kill', target: 'frost_elemental', count: 5, current: 0, description: 'Fight through 5 frost elementals' },
                        { type: 'kill', target: 'frost_lord', count: 1, current: 0, description: 'Defeat the Frost Lord' }
                    ],
                    rewards: {
                        gold: 1500,
                        reputation: 80,
                        experience: 450,
                        item: 'frost_lords_heart'
                    },
                    prerequisite: 'frostholm_wolves_2',
                    nextQuest: 'frostholm_wolves_4',
                    dialogue: {
                        offer: "The Frost Lord... I thought it was legend. An ancient beast of pure winter, slumbering for centuries. Something has awakened it. Face it in its frozen cave, or the north will never know peace.",
                        progress: "The Frost Lord's cave lies beyond the glacier. Are you prepared?",
                        complete: "The Frost Lord falls! I... I didn't think it possible. You carry its frozen heart - proof of the impossible. The north will sing of this for generations."
                    }
                },

                frostholm_wolves_4: {
                    id: 'frostholm_wolves_4',
                    name: "Winter's End",
                    description: 'With the Frost Lord dead, secure the northern territories permanently.',
                    giver: 'elder',
                    giverName: 'Elder Thorvald',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'frostholm_wolves',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'clear', location: 'northern_passes', completed: false, description: 'Clear the northern mountain passes' },
                        { type: 'establish', outpost: 'frost_watch', completed: false, description: 'Establish Frost Watch outpost' }
                    ],
                    rewards: {
                        gold: 2500,
                        reputation: 100,
                        experience: 500,
                        unlocks: 'frostholm_protector',
                        title: 'Winter\'s Bane',
                        achievementTitle: 'Winter\'s Bane'
                    },
                    prerequisite: 'frostholm_wolves_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You've done what no one could. But the north needs more than a hero - it needs security. Help us clear the passes and establish a permanent watch. Make this land safe for generations to come.",
                        progress: "The passes must be cleared. The outpost must rise.",
                        complete: "Frost Watch stands! The north is secure. You are Winter's Bane - the one who ended the age of fear. This land owes you everything. May your name be blessed by snow and stone."
                    }
                }
            }
        },

        // TRADE CHAIN: Fur Trade (3 quests)
        tradeChain: {
            chainId: 'frostholm_fur',
            chainName: 'Fur Trade',
            description: 'Establish dominance in the lucrative northern fur trade.',
            totalQuests: 3,
            requiredAct: 3,

            quests: {
                frostholm_fur_1: {
                    id: 'frostholm_fur_1',
                    name: 'Winter Pelts',
                    description: 'Collect quality furs to start your northern trade operation.',
                    giver: 'huntmaster',
                    giverName: 'Huntmaster Bjorn',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'frostholm_fur',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 3,
                    objectives: [
                        { type: 'collect', item: 'quality_fur', count: 8, current: 0, description: 'Collect 8 quality furs' }
                    ],
                    rewards: { gold: 200, reputation: 25, experience: 125 },
                    prerequisite: null,
                    nextQuest: 'frostholm_fur_2',
                    dialogue: {
                        offer: "Furs from the north are worth their weight in gold down south. Nobles pay fortunes for winter wolf pelts. Collect 8 quality furs and I'll show you how this trade works.",
                        progress: "Need more furs. Hunt the white wolves - their pelts fetch the best prices.",
                        complete: "Fine pelts! Now let me introduce you to the furrier's guild. They control who trades what up here."
                    }
                },

                frostholm_fur_2: {
                    id: 'frostholm_fur_2',
                    name: "The Furrier's Network",
                    description: 'Build relationships with the northern hunting families.',
                    giver: 'merchant',
                    giverName: 'Furrier Olga',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'frostholm_fur',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 3,
                    objectives: [
                        { type: 'visit', location: 'hunting_camps', count: 3, current: 0, description: 'Visit 3 hunting camps' },
                        { type: 'trade', with: 'hunter_families', minTotal: 2000, current: 0, description: 'Trade 2000g worth with families' },
                        { type: 'earn', item: 'family_tokens', count: 3, current: 0, description: 'Earn 3 family trust tokens' }
                    ],
                    rewards: {
                        gold: 500,
                        reputation: 45,
                        experience: 250,
                        unlocks: 'northern_hunting_contacts'
                    },
                    prerequisite: 'frostholm_fur_1',
                    nextQuest: 'frostholm_fur_3',
                    dialogue: {
                        offer: "The best furs come from the old families - they've hunted these lands for generations. Visit their camps, trade fairly, earn their trust. They don't deal with just anyone.",
                        progress: "The families are slow to trust outsiders. Be patient and fair.",
                        complete: "Three family tokens! That's unprecedented for an outsider. You've earned access to the finest furs in the north. Now you're ready to dominate this trade."
                    }
                },

                frostholm_fur_3: {
                    id: 'frostholm_fur_3',
                    name: 'Northern Monopoly',
                    description: 'Establish exclusive control over the northern fur trade.',
                    giver: 'merchant',
                    giverName: 'Furrier Olga',
                    location: 'frostholm_village',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'frostholm_fur',
                    chainOrder: 3,
                    difficulty: 'very_hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'contract', merchant: 'hunting_families', count: 5, current: 0, description: 'Secure 5 exclusive hunting contracts' },
                        { type: 'sell', item: 'premium_fur', count: 50, minProfit: 10000, current: 0, description: 'Sell 50 premium furs for 10,000g+ profit' },
                        { type: 'establish', route: 'frostholm_capital', completed: false, description: 'Establish Frostholm-Capital fur route' }
                    ],
                    rewards: {
                        gold: 5000,
                        reputation: 100,
                        experience: 600,
                        unlocks: 'northern_fur_monopoly',
                        achievementTitle: 'Fur Baron'
                    },
                    prerequisite: 'frostholm_fur_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "You have the families' trust. Now lock it in. Exclusive contracts, premium routes, total control. When nobles want fur, they'll come to you. Build your monopoly.",
                        progress: "A monopoly takes time to build. Keep securing those contracts.",
                        complete: "You've done it! Every quality fur from the north passes through your hands. The noble houses compete for your favor. You are the Fur Baron - unchallenged master of the northern trade."
                    }
                }
            }
        }
    },

    // 
    //  WESTERN TERRITORIES - Frontier
    // 
    western_territories: {
        regionName: 'Western Territories',
        description: 'The wild frontier where law is scarce and opportunity abundant.',

        // COMBAT CHAIN: Frontier Defense (4 quests)
        combatChain: {
            chainId: 'western_bandits',
            chainName: 'Frontier Defense',
            description: 'Protect the frontier from bandit raids.',
            totalQuests: 4,
            requiredAct: 4,

            quests: {
                western_bandits_1: {
                    id: 'western_bandits_1',
                    name: 'Bandit Bounty',
                    description: 'Bandits plague the western roads. Hunt them for bounty.',
                    giver: 'sergeant',
                    giverName: 'Sergeant Hawkins',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'western_bandits',
                    chainOrder: 1,
                    difficulty: 'hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'kill', target: 'road_bandit', count: 10, current: 0, description: 'Kill 10 road bandits' },
                        { type: 'collect', item: 'bounty_proof', count: 10, current: 0, description: 'Collect 10 bounty proofs' }
                    ],
                    rewards: { gold: 500, reputation: 40, experience: 250 },
                    prerequisite: null,
                    nextQuest: 'western_bandits_2',
                    dialogue: {
                        offer: "The roads out here are death traps. Bandits hit every caravan that comes through. There's a bounty on their heads - 50 gold per proof of kill. Interested?",
                        progress: "More bandits still roam. Keep hunting.",
                        complete: "Ten bounties collected! You've made the roads a bit safer. But these bandits have a headquarters somewhere. Find it and we can end this for good."
                    }
                },

                western_bandits_2: {
                    id: 'western_bandits_2',
                    name: 'The Outlaw Camp',
                    description: 'Locate the bandit headquarters.',
                    giver: 'sergeant',
                    giverName: 'Sergeant Hawkins',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'western_bandits',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'interrogate', target: 'captured_bandit', completed: false, description: 'Interrogate a captured bandit' },
                        { type: 'investigate', location: 'canyon_entrance', completed: false, description: 'Find the canyon hideout entrance' },
                        { type: 'scout', location: 'bandit_camp', completed: false, description: 'Scout the camp defenses' }
                    ],
                    rewards: {
                        gold: 750,
                        reputation: 50,
                        experience: 325,
                        item: 'bandit_camp_map'
                    },
                    prerequisite: 'western_bandits_1',
                    nextQuest: 'western_bandits_3',
                    dialogue: {
                        offer: "We've captured one of them. Make him talk - find out where they're hiding. Then scout the location. We need to know what we're dealing with before we strike.",
                        progress: "Have you found their camp yet? Time is running out.",
                        complete: "A fortified canyon camp. They've got maybe fifty men. This won't be easy. But it's time to end their reign of terror."
                    }
                },

                western_bandits_3: {
                    id: 'western_bandits_3',
                    name: 'Bandit Chief',
                    description: 'Assault the bandit stronghold and defeat their leader.',
                    giver: 'sergeant',
                    giverName: 'Sergeant Hawkins',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'western_bandits',
                    chainOrder: 3,
                    difficulty: 'very_hard',
                    requiredAct: 4,
                    isBossQuest: true,
                    objectives: [
                        { type: 'assault', location: 'bandit_stronghold', completed: false, description: 'Lead assault on the stronghold' },
                        { type: 'kill', target: 'bandit', count: 20, current: 0, description: 'Fight through 20 bandits' },
                        { type: 'kill', target: 'bandit_chief_redhawk', count: 1, current: 0, description: 'Defeat Chief Redhawk' }
                    ],
                    rewards: {
                        gold: 2000,
                        reputation: 75,
                        experience: 500,
                        item: 'redhawks_bow'
                    },
                    prerequisite: 'western_bandits_2',
                    nextQuest: 'western_bandits_4',
                    dialogue: {
                        offer: "It's time. We're assaulting the canyon at dawn. I need you to lead the charge. Chief Redhawk is mine - but you'll have to cut through his men to give me a shot at him. Ready?",
                        progress: "The assault is underway! Keep pushing forward!",
                        complete: "Redhawk is dead! The bandit army is shattered. The frontier breathes easier tonight. But we need to make sure this never happens again."
                    }
                },

                western_bandits_4: {
                    id: 'western_bandits_4',
                    name: 'Safe Passage',
                    description: 'Establish permanent security along the frontier roads.',
                    giver: 'sergeant',
                    giverName: 'Sergeant Hawkins',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'combat',
                    chain: 'western_bandits',
                    chainOrder: 4,
                    difficulty: 'hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'clear', location: 'western_roads', completed: false, description: 'Clear remaining bandits from roads' },
                        { type: 'establish', outpost: 'road_patrols', count: 3, current: 0, description: 'Establish 3 patrol stations' },
                        { type: 'recruit', unit: 'frontier_guards', count: 12, current: 0, description: 'Recruit 12 frontier guards' }
                    ],
                    rewards: {
                        gold: 3500,
                        reputation: 100,
                        experience: 600,
                        unlocks: 'western_safe_passage',
                        title: 'Frontier Marshal',
                        achievementTitle: 'Frontier Marshal'
                    },
                    prerequisite: 'western_bandits_3',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "The chief is dead but stragglers remain. Hunt them down, then help me establish patrol stations along the main routes. We'll make these roads the safest in the realm.",
                        progress: "Keep patrolling. Every bandit caught is a caravan saved.",
                        complete: "The frontier is secure! Three patrol stations, trained guards, and roads safe enough for children to travel. You're the Frontier Marshal now - protector of the west. The settlers will remember your name."
                    }
                }
            }
        },

        // TRADE CHAIN: Pioneer Trade (3 quests)
        tradeChain: {
            chainId: 'western_pioneer',
            chainName: 'Pioneer Trade',
            description: 'Establish trade networks in the untamed frontier.',
            totalQuests: 3,
            requiredAct: 4,

            quests: {
                western_pioneer_1: {
                    id: 'western_pioneer_1',
                    name: 'Supply Run',
                    description: 'The frontier outpost desperately needs supplies. Deliver them.',
                    giver: 'general_store',
                    giverName: 'Quartermaster Burke',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'western_pioneer',
                    chainOrder: 1,
                    difficulty: 'medium',
                    requiredAct: 4,
                    objectives: [
                        { type: 'deliver', item: 'food_supplies', count: 20, current: 0, description: 'Deliver 20 food supplies' },
                        { type: 'deliver', item: 'medicine', count: 10, current: 0, description: 'Deliver 10 medicine' },
                        { type: 'deliver', item: 'tools', count: 15, current: 0, description: 'Deliver 15 tools' }
                    ],
                    rewards: { gold: 600, reputation: 35, experience: 200 },
                    prerequisite: null,
                    nextQuest: 'western_pioneer_2',
                    dialogue: {
                        offer: "The outpost is running low on everything. The last supply caravan was hit by bandits. We need food, medicine, and tools - whatever you can bring. Name your price.",
                        progress: "Still waiting on those supplies. People are getting desperate.",
                        complete: "You've saved lives today. The settlers won't forget this. If you're interested, there's more opportunity out here..."
                    }
                },

                western_pioneer_2: {
                    id: 'western_pioneer_2',
                    name: 'Frontier Economy',
                    description: 'Help build a sustainable local economy for the frontier settlements.',
                    giver: 'general_store',
                    giverName: 'Quartermaster Burke',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'western_pioneer',
                    chainOrder: 2,
                    difficulty: 'hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'establish', facility: 'trading_post', completed: false, description: 'Establish a trading post' },
                        { type: 'recruit', merchant: 'frontier_trader', count: 3, current: 0, description: 'Recruit 3 frontier traders' },
                        { type: 'trade', minTotal: 5000, current: 0, description: 'Generate 5000g in local trade' }
                    ],
                    rewards: {
                        gold: 1500,
                        reputation: 60,
                        experience: 350,
                        unlocks: 'frontier_trading_post'
                    },
                    prerequisite: 'western_pioneer_1',
                    nextQuest: 'western_pioneer_3',
                    dialogue: {
                        offer: "The frontier needs more than supply runs - it needs a real economy. Help me establish a trading post, recruit merchants, get commerce flowing. We'll build something that lasts.",
                        progress: "Keep building that trade network. Every transaction strengthens the frontier.",
                        complete: "Look at it! A real trading post, merchants coming and going. The frontier isn't just surviving anymore - it's thriving. You built this."
                    }
                },

                western_pioneer_3: {
                    id: 'western_pioneer_3',
                    name: 'Western Tycoon',
                    description: 'Establish yourself as the dominant force in frontier commerce.',
                    giver: 'general_store',
                    giverName: 'Quartermaster Burke',
                    location: 'stonebridge',
                    type: 'side',
                    subtype: 'trade',
                    chain: 'western_pioneer',
                    chainOrder: 3,
                    difficulty: 'very_hard',
                    requiredAct: 4,
                    objectives: [
                        { type: 'establish', route: 'frontier_supply_line', completed: false, description: 'Establish permanent supply line from capital' },
                        { type: 'profit', minGold: 20000, current: 0, description: 'Earn 20,000g in frontier trade' },
                        { type: 'develop', settlement: 'western_town', completed: false, description: 'Help frontier outpost grow into town' }
                    ],
                    rewards: {
                        gold: 7500,
                        reputation: 125,
                        experience: 750,
                        unlocks: 'western_trade_empire',
                        title: 'Western Tycoon',
                        achievementTitle: 'Western Tycoon'
                    },
                    prerequisite: 'western_pioneer_2',
                    nextQuest: null,
                    isChainFinal: true,
                    dialogue: {
                        offer: "The trading post is just the beginning. Establish permanent supply lines, dominate the frontier trade, help this outpost grow into a real town. You could own the west.",
                        progress: "The frontier is growing. Keep investing in its future.",
                        complete: "What was once a desperate outpost is now a thriving town - and you own half of it. The Western Tycoon, they call you. Every wagon heading west pays tribute to your empire. You've conquered the frontier without firing a shot."
                    }
                }
            }
        }
    },

    // 
    //  UTILITY METHODS
    // 

    /**
     * Get all side quests as a flat array
     * @returns {Array} All side quest objects
     */
    getAllQuests() {
        const allQuests = [];
        const regions = Object.keys(this).filter(key =>
            typeof this[key] === 'object' &&
            this[key].combatChain &&
            this[key].tradeChain
        );

        for (const region of regions) {
            // Add combat chain quests
            const combatQuests = Object.values(this[region].combatChain.quests);
            allQuests.push(...combatQuests);

            // Add trade chain quests
            const tradeQuests = Object.values(this[region].tradeChain.quests);
            allQuests.push(...tradeQuests);
        }

        return allQuests;
    },

    /**
     * Get a specific quest by ID
     * @param {string} questId - The quest ID
     * @returns {Object|null} The quest object or null
     */
    getQuestById(questId) {
        const allQuests = this.getAllQuests();
        return allQuests.find(q => q.id === questId) || null;
    },

    /**
     * Get all quests for a specific region
     * @param {string} regionId - The region ID
     * @returns {Array} Array of quest objects
     */
    getQuestsForRegion(regionId) {
        const region = this[regionId];
        if (!region || !region.combatChain || !region.tradeChain) return [];

        return [
            ...Object.values(region.combatChain.quests),
            ...Object.values(region.tradeChain.quests)
        ];
    },

    /**
     * Get all combat chain quests
     * @returns {Array} All combat side quests
     */
    getCombatQuests() {
        const combatQuests = [];
        const regions = Object.keys(this).filter(key =>
            typeof this[key] === 'object' && this[key].combatChain
        );

        for (const region of regions) {
            combatQuests.push(...Object.values(this[region].combatChain.quests));
        }

        return combatQuests;
    },

    /**
     * Get all trade chain quests
     * @returns {Array} All trade side quests
     */
    getTradeQuests() {
        const tradeQuests = [];
        const regions = Object.keys(this).filter(key =>
            typeof this[key] === 'object' && this[key].tradeChain
        );

        for (const region of regions) {
            tradeQuests.push(...Object.values(this[region].tradeChain.quests));
        }

        return tradeQuests;
    },

    /**
     * Get chain final quests (reward achievement titles)
     * @returns {Array} All chain-ending quests
     */
    getChainFinals() {
        return this.getAllQuests().filter(q => q.isChainFinal);
    },

    /**
     * Get quests available for a given act
     * @param {number} actNumber - The current act
     * @returns {Array} Quests available in this act
     */
    getQuestsForAct(actNumber) {
        return this.getAllQuests().filter(q => q.requiredAct <= actNumber);
    },

    /**
     * Get quest chains summary
     * @returns {Array} Summary of all chains
     */
    getChainsSummary() {
        const chains = [];
        const regions = Object.keys(this).filter(key =>
            typeof this[key] === 'object' &&
            this[key].combatChain &&
            this[key].tradeChain
        );

        for (const region of regions) {
            chains.push({
                region: this[region].regionName,
                combatChain: {
                    id: this[region].combatChain.chainId,
                    name: this[region].combatChain.chainName,
                    questCount: this[region].combatChain.totalQuests,
                    requiredAct: this[region].combatChain.requiredAct
                },
                tradeChain: {
                    id: this[region].tradeChain.chainId,
                    name: this[region].tradeChain.chainName,
                    questCount: this[region].tradeChain.totalQuests,
                    requiredAct: this[region].tradeChain.requiredAct
                }
            });
        }

        return chains;
    }
};

// Export for use in quest system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SideQuests;
}
