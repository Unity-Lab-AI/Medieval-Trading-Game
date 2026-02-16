//
//  DOOM WORLD QUESTS - The Apocalyptic Reality
//
// Version: 0.92.00 | Unity AI Lab
// 15 Doom World Exclusive Quests + Greedy Won Boss
// Survival, Resistance, and Boss arcs
// Access via defeating dungeon bosses (Shadow Tower/Ruins of Malachar)
//
// ── SYSTEM RELATIONSHIP ──────────────────────────────────────────────
// This file is the DATA LAYER for doom quests. It defines:
//   - doomInfo, doomEconomy, doomLocations, doomItems (world metadata)
//   - 15 quests across 3 arcs: survival (5), resistance (5), boss (5)
//   - Loaded into QuestSystem via DoomQuests.getAllQuests() at quest-system.js:936
//
// The COMPANION file is doom-quest-system.js (RUNTIME LAYER), which defines:
//   - 12 main story quests (3 acts) + 8 standalone side quests (20 total)
//   - Loaded via DoomQuestSystem.registerDoomQuests() at quest-system.js
//
// ZERO quest ID overlap between files. They are COMPLEMENTARY:
//   - This file: doom_survival_1-5, doom_resistance_1-5, doom_boss_1-5
//   - Runtime file: doom_arrival, doom_fallen_throne, doom_lost_children, etc.
//   - Combined: 35 total doom quests
// ─────────────────────────────────────────────────────────────────────
//

const DoomQuests = {
    // 
    //  DOOM WORLD METADATA
    // 
    doomInfo: {
        name: 'The Doom World',
        description: 'An apocalyptic alternate reality where Malachar won and the world fell to darkness. Only the strongest survive.',
        totalQuests: 15,
        bosses: 1, // Greedy Won
        arcs: ['survival', 'resistance', 'boss'],
        accessRequirement: 'Defeat either Shadow Tower Guardian or Ruins Guardian',
        safeZones: ['shadow_dungeon', 'forest_dungeon'],
        exitMethod: 'Return to dungeon safe zones'
    },

    // 
    //  DOOM WORLD ECONOMY
    // 
    doomEconomy: {
        // Price multipliers in Doom World
        priceMultipliers: {
            food: 10.0,
            water: 15.0,
            medicine: 12.0,
            weapons: 3.0,
            armor: 3.5,
            tools: 5.0,
            luxury: 0.1,
            jewelry: 0.15,
            silk: 0.2,
            wine: 0.1
        },

        // Gold has reduced value
        goldValueMultiplier: 0.3,

        // Barter system preferences
        barterPreferences: ['food', 'water', 'medicine', 'weapons'],

        // Get doom price for an item
        getDoomPrice(basePrice, itemType) {
            const multiplier = this.priceMultipliers[itemType] || 1.0;
            return Math.floor(basePrice * multiplier);
        },

        // Get gold purchasing power
        getGoldValue(goldAmount) {
            return Math.floor(goldAmount * this.goldValueMultiplier);
        }
    },

    //
    //  DOOM WORLD LOCATIONS
    //
    // Locations prefixed with doom_ are visual overlays of real game-world locations.
    // Three entries use `mapsTo` — these are phantom quest locations that don't exist
    // in game-world.js. The quest-system.js travel and investigate handlers resolve
    // mapsTo aliases so objectives targeting e.g. "hidden_bunker" complete when the
    // player arrives at the real "northern_outpost" location.
    //
    doomLocations: {
        doom_greendale: {
            normalName: 'Greendale',
            doomName: 'Burned Greendale',
            description: 'The once-peaceful farming village is now charred ruins. Ash drifts through empty streets.',
            hasMarket: true,
            marketName: 'Ash Market',
            safeZone: false,
            threats: ['shadow_spawn', 'desperate_survivors']
        },
        doom_sunhaven: {
            normalName: 'Sunhaven',
            doomName: 'Drowned Sunhaven',
            description: 'The southern port lies half-submerged, monsters lurking in the flooded streets.',
            hasMarket: true,
            marketName: 'Flotsam Market',
            safeZone: false,
            threats: ['sea_horrors', 'plague_carriers']
        },
        doom_ironforge: {
            normalName: 'Ironforge',
            doomName: 'Enslaved Ironforge',
            description: 'The great forges still burn, but now they craft weapons for Malachar\'s armies.',
            hasMarket: true,
            marketName: 'Slave Market',
            safeZone: false,
            threats: ['shadow_overseers', 'corrupted_workers']
        },
        doom_jade_harbor: {
            normalName: 'Jade Harbor',
            doomName: 'Blighted Harbor',
            description: 'Disease has ravaged the eastern port. The jade is tarnished with corruption.',
            hasMarket: true,
            marketName: 'Plague Market',
            safeZone: false,
            threats: ['plague_zombies', 'corrupted_merchants']
        },
        doom_royal_capital: {
            normalName: 'Royal Capital',
            doomName: 'Destroyed Royal Capital',
            description: 'The seat of power is now a throne of darkness. Greedy Won rules from the ruined palace.',
            hasMarket: true,
            marketName: 'Doom Market',
            safeZone: false,
            threats: ['shadow_elite', 'greedy_won'],
            isBossLocation: true
        },
        doom_frostholm: {
            normalName: 'Frostholm',
            doomName: 'Eternal Frostholm',
            description: 'Endless blizzards rage through the north. The cold itself has become malevolent.',
            hasMarket: true,
            marketName: 'Frozen Market',
            safeZone: false,
            threats: ['frost_wraiths', 'ice_elementals']
        },
        doom_western: {
            normalName: 'Western Territories',
            doomName: 'Shadow Wastes',
            description: 'The frontier has become a wasteland of shadows and despair.',
            hasMarket: false,
            safeZone: false,
            threats: ['shadow_beasts', 'lost_souls']
        },
        shadow_dungeon: {
            normalName: 'Shadow Dungeon',
            doomName: 'The Shadow Throne (Safe Zone)',
            description: 'The dungeon you conquered. Its guardian dead, the dark throne offers sanctuary.',
            hasMarket: false,
            safeZone: true,
            hasPortal: true,
            portalDestination: 'normal_world'
        },
        forest_dungeon: {
            normalName: 'Ruins of Malachar',
            doomName: 'Ruins of Malachar (Safe Zone)',
            description: 'The ancient ruins you cleared. Here, the doom cannot reach you.',
            hasMarket: false,
            safeZone: true,
            hasPortal: true,
            portalDestination: 'normal_world'
        },
        // Phantom locations — quest objectives reference these IDs, mapsTo resolves to real locations
        resistance_hideout: {
            normalName: "Smuggler's Cove",
            doomName: 'Resistance Hideout',
            description: 'A hidden resistance base in the old smuggling tunnels. Commander Vera runs operations from here.',
            hasMarket: false,
            safeZone: true,
            mapsTo: 'smugglers_cove',
            threats: []
        },
        hidden_bunker: {
            normalName: 'Northern Outpost',
            doomName: 'The Hidden Bunker',
            description: 'The resistance command center, fortified deep within the northern outpost. General Aldric leads from here.',
            hasMarket: false,
            safeZone: true,
            mapsTo: 'northern_outpost',
            threats: []
        },
        doom_core: {
            normalName: 'Royal Capital',
            doomName: 'The Doom Core',
            description: 'The heart of the apocalypse itself. Where Greedy Won draws power from the doom anchor.',
            hasMarket: false,
            safeZone: false,
            mapsTo: 'royal_capital',
            isBossLocation: true,
            threats: ['doom_anchor', 'shadow_elite', 'greedy_won']
        }
    },

    //
    //  DOOM WORLD EXCLUSIVE ITEMS
    //
    // NOTE: basePrice values here are METADATA ONLY — they are NOT used at runtime.
    // Actual game prices come from ItemDatabase.getItem() in item-database.js.
    // These values may differ significantly from ItemDatabase prices.
    //
    doomItems: {
        doom_rations: {
            id: 'doom_rations',
            name: 'Doom Rations',
            type: 'food',
            description: 'Concentrated survival food. Tastes terrible, keeps you alive.',
            basePrice: 100,
            doomOnly: true,
            healing: 50
        },
        shadow_steel: {
            id: 'shadow_steel',
            name: 'Shadow Steel',
            type: 'crafting',
            description: 'Metal infused with darkness. Incredibly strong but corrupting.',
            basePrice: 500,
            doomOnly: true
        },
        essence_of_despair: {
            id: 'essence_of_despair',
            name: 'Essence of Despair',
            type: 'alchemy',
            description: 'Bottled hopelessness. Useful for dark rituals.',
            basePrice: 300,
            doomOnly: true
        },
        survivors_journal: {
            id: 'survivors_journal',
            name: "Survivor's Journal",
            type: 'lore',
            description: 'Chronicles of those who lived through the apocalypse.',
            basePrice: 50,
            doomOnly: true,
            readable: true
        },
        blighted_sword: {
            id: 'blighted_sword',
            name: 'Blighted Sword',
            type: 'weapon',
            description: 'A weapon corrupted by doom. Powerful but dangerous.',
            basePrice: 1000,
            doomOnly: true,
            damage: 45,
            corruption: 5
        },
        blighted_armor: {
            id: 'blighted_armor',
            name: 'Blighted Armor',
            type: 'armor',
            description: 'Armor twisted by darkness. Offers great protection at a cost.',
            basePrice: 1500,
            doomOnly: true,
            defense: 35,
            corruption: 10
        },
        greeds_end_set: {
            id: 'greeds_end_set',
            name: "Greed's End Set",
            type: 'legendary_armor',
            description: 'Legendary armor forged from Greedy Won\'s remains. The ultimate doom trophy.',
            basePrice: 10000,
            doomOnly: true,
            defense: 50,
            special: 'immune_to_gold_theft'
        }
    },

    // 
    //  SURVIVAL ARC (5 Quests)
    // Theme: Learn to survive in the apocalypse
    // 
    survivalArc: {
        arcName: 'Survival',
        arcDescription: 'Learn the basics of staying alive in the Doom World.',
        totalQuests: 5,

        quests: {
            doom_survival_1: {
                id: 'doom_survival_1',
                name: 'First Breath',
                description: 'Find clean water in this poisoned world. Without it, you won\'t last a day.',
                giver: 'survivor',
                giverName: 'Gasping Survivor',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'survival',
                arcOrder: 1,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'ruined_well', completed: false, description: 'Check the village well (contaminated)' },
                    { type: 'investigate', location: 'hidden_spring', completed: false, description: 'Find the hidden spring' },
                    { type: 'collect', item: 'clean_water', count: 5, current: 0, description: 'Collect 5 clean water' }
                ],
                rewards: {
                    gold: 100, // Doom gold, worth less
                    reputation: 15,
                    experience: 150,
                    item: 'water_purifier'
                },
                prerequisite: null,
                nextQuest: 'doom_survival_2',
                dialogue: {
                    offer: "*coughing* Water... the wells are poisoned. But there's... a spring... in the old forest. If it still exists. Please... find it... or we all die.",
                    progress: "Did you... find water? My throat... burns...",
                    complete: "Clean water! We can survive another day. But food... we need food too. The doom has killed everything."
                }
            },

            doom_survival_2: {
                id: 'doom_survival_2',
                name: 'Daily Bread',
                description: 'Secure a food supply. The doom has killed most crops, but something must remain.',
                giver: 'survivor',
                giverName: 'Hungry Elder',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'survival',
                arcOrder: 2,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'sealed_cellar', completed: false, description: 'Find a sealed cellar with preserved food' },
                    { type: 'collect', item: 'preserved_food', count: 10, current: 0, description: 'Gather 10 preserved food' },
                    { type: 'kill', target: 'cellar_horror', count: 1, current: 0, description: 'Clear the creature guarding the cellar' }
                ],
                rewards: {
                    gold: 150,
                    reputation: 20,
                    experience: 200,
                    item: 'doom_rations'
                },
                prerequisite: 'doom_survival_1',
                nextQuest: 'doom_survival_3',
                dialogue: {
                    offer: "Water alone won't save us. There were cellars... sealed before the doom came. If any food remains, it's there. But... things live in the dark now. Be careful.",
                    progress: "Any luck finding food? The children are so hungry...",
                    complete: "Food! Actual food! You've bought us time. But we can't stay exposed like this. We need shelter... real shelter."
                }
            },

            doom_survival_3: {
                id: 'doom_survival_3',
                name: 'Shelter from Darkness',
                description: 'Find or create a defensible shelter. The nights here are deadly.',
                giver: 'survivor',
                giverName: 'Veteran Survivor',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'survival',
                arcOrder: 3,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'intact_building', completed: false, description: 'Find an intact building' },
                    { type: 'collect', item: 'barricade_materials', count: 15, current: 0, description: 'Gather 15 barricade materials' },
                    { type: 'build', structure: 'safe_house', completed: false, description: 'Fortify the building' }
                ],
                rewards: {
                    gold: 200,
                    reputation: 25,
                    experience: 250,
                    unlocks: 'doom_safe_house'
                },
                prerequisite: 'doom_survival_2',
                nextQuest: 'doom_survival_4',
                dialogue: {
                    offer: "I've survived six months in this hell. Listen to me: the nights will kill you. Find a solid building, board it up, make it defensible. Without shelter, nothing else matters.",
                    progress: "Have you found shelter? The sun is setting...",
                    complete: "A real safe house! We can rest, regroup, plan. You've given us something we haven't had in months - hope. But people are getting sick..."
                }
            },

            doom_survival_4: {
                id: 'doom_survival_4',
                name: 'Medicine Run',
                description: 'Disease is spreading. Find medical supplies before it claims more lives.',
                giver: 'survivor',
                giverName: 'Sick Healer',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'survival',
                arcOrder: 4,
                difficulty: 'very_hard',
                doomOnly: true,
                objectives: [
                    { type: 'travel', to: 'doom_sunhaven', completed: false, description: 'Journey to Drowned Sunhaven' },
                    { type: 'investigate', location: 'flooded_apothecary', completed: false, description: 'Find the flooded apothecary' },
                    { type: 'collect', item: 'medicine', count: 15, current: 0, description: 'Gather 15 medicine' },
                    { type: 'kill', target: 'plague_horror', count: 1, current: 0, description: 'Defeat the Plague Horror' }
                ],
                rewards: {
                    gold: 300,
                    reputation: 35,
                    experience: 350,
                    item: 'plague_resistance_potion'
                },
                prerequisite: 'doom_survival_3',
                nextQuest: 'doom_survival_5',
                dialogue: {
                    offer: "*coughing blood* I was a healer... before. Now I'm dying of the same plague I'd treat. Sunhaven had an apothecary... if any medicine survived the flooding, it's there. Please... save the others.",
                    progress: "Did you find medicine? More people are falling ill...",
                    complete: "Medicine! I can... I can save them now. You've done more than survive - you've given us a future. But to truly live, we need allies..."
                }
            },

            doom_survival_5: {
                id: 'doom_survival_5',
                name: 'Survival Expert',
                description: 'Establish a sustainable survival camp for the doom refugees.',
                giver: 'survivor',
                giverName: 'Veteran Survivor',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'survival',
                arcOrder: 5,
                difficulty: 'very_hard',
                doomOnly: true,
                isArcFinal: true,
                objectives: [
                    { type: 'establish', facility: 'water_collection', completed: false, description: 'Set up water collection system' },
                    { type: 'establish', facility: 'food_garden', completed: false, description: 'Create a protected food garden' },
                    { type: 'establish', facility: 'medical_station', completed: false, description: 'Build a medical station' },
                    { type: 'recruit', unit: 'doom_survivor', count: 10, current: 0, description: 'Gather 10 survivors' }
                ],
                rewards: {
                    gold: 500,
                    reputation: 50,
                    experience: 500,
                    unlocks: 'doom_survivor_camp',
                    achievementTitle: 'Doom Survivor'
                },
                prerequisite: 'doom_survival_4',
                nextQuest: 'doom_resistance_1',
                dialogue: {
                    offer: "We have water, food, shelter, medicine. But it's all temporary. To truly survive, we need systems - sustainable ones. Help me build a real camp, gather more survivors. We'll create a beacon of hope in this darkness.",
                    progress: "Keep building. Every improvement is another day we survive.",
                    complete: "Look at what we've built! A real community, sustainable and defensible. You're not just a survivor - you're a leader. The resistance needs people like you..."
                }
            }
        }
    },

    // 
    // RESISTANCE ARC (5 Quests)
    // Theme: Join the fight against the doom
    // 
    resistanceArc: {
        arcName: 'Resistance',
        arcDescription: 'Join the underground resistance fighting against the doom.',
        totalQuests: 5,

        quests: {
            doom_resistance_1: {
                id: 'doom_resistance_1',
                name: 'Finding Hope',
                description: 'Rumors speak of resistance fighters. Find them.',
                giver: 'survivor',
                giverName: 'Whispering Man',
                location: 'doom_greendale',
                type: 'doom',
                arc: 'resistance',
                arcOrder: 1,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'resistance_signs', count: 3, current: 0, description: 'Find 3 resistance symbols' },
                    { type: 'follow', trail: 'resistance_trail', completed: false, description: 'Follow the trail' },
                    { type: 'contact', npc: 'resistance_scout', completed: false, description: 'Make contact with a scout' }
                ],
                rewards: {
                    gold: 200,
                    reputation: 30,
                    experience: 300,
                    unlocks: 'resistance_contact'
                },
                prerequisite: 'doom_survival_5',
                nextQuest: 'doom_resistance_2',
                dialogue: {
                    offer: "*whispers* They say there's a resistance. Fighters who haven't given up. Look for the symbols - a torch in a circle. Follow them. If you find them... tell them we're here. Tell them there's still hope.",
                    progress: "Have you found the resistance? We need them...",
                    complete: "You found them! The resistance is real! Now... now maybe we can fight back."
                }
            },

            doom_resistance_2: {
                id: 'doom_resistance_2',
                name: 'Supply the Cause',
                description: 'The resistance needs weapons to fight. Deliver arms to their hideout.',
                giver: 'resistance_fighter',
                giverName: 'Commander Vera',
                location: 'resistance_hideout',
                type: 'doom',
                arc: 'resistance',
                arcOrder: 2,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'travel', to: 'doom_ironforge', completed: false, description: 'Journey to Enslaved Ironforge' },
                    { type: 'steal', item: 'shadow_weapons', count: 20, current: 0, description: 'Steal 20 weapons from the forges' },
                    { type: 'deliver', item: 'shadow_weapons', to: 'resistance', count: 20, current: 0, description: 'Deliver weapons to the resistance' }
                ],
                rewards: {
                    gold: 400,
                    reputation: 45,
                    experience: 400,
                    item: 'blighted_sword'
                },
                prerequisite: 'doom_resistance_1',
                nextQuest: 'doom_resistance_3',
                dialogue: {
                    offer: "So you're the survivor who built that camp. Impressive. We're the resistance - what's left of it. We need weapons. Ironforge still produces them, but for the enemy. Steal what you can and bring them here.",
                    progress: "Have you acquired the weapons? Every blade counts.",
                    complete: "Twenty weapons! Now we can arm more fighters. You've proven yourself. Time to strike back."
                }
            },

            doom_resistance_3: {
                id: 'doom_resistance_3',
                name: 'Strike Back',
                description: 'Lead a sabotage mission against a shadow operation.',
                giver: 'resistance_fighter',
                giverName: 'Commander Vera',
                location: 'resistance_hideout',
                type: 'doom',
                arc: 'resistance',
                arcOrder: 3,
                difficulty: 'very_hard',
                doomOnly: true,
                objectives: [
                    { type: 'infiltrate', location: 'shadow_supply_depot', completed: false, description: 'Infiltrate the shadow supply depot' },
                    { type: 'sabotage', target: 'supply_crates', count: 10, current: 0, description: 'Destroy 10 supply crates' },
                    { type: 'kill', target: 'shadow_guard', count: 12, current: 0, description: 'Fight through 12 shadow guards' },
                    { type: 'escape', location: 'depot', completed: false, description: 'Escape the depot' }
                ],
                rewards: {
                    gold: 600,
                    reputation: 55,
                    experience: 500,
                    item: 'resistance_insignia'
                },
                prerequisite: 'doom_resistance_2',
                nextQuest: 'doom_resistance_4',
                dialogue: {
                    offer: "Time to hurt them. There's a supply depot feeding Greedy Won's forces. Destroy it. Kill everyone who gets in your way. Show them the resistance isn't dead.",
                    progress: "The depot still stands. Strike harder.",
                    complete: "The depot burns! Their supply line is crippled. You've done what none of us could. It's time you met our leader..."
                }
            },

            doom_resistance_4: {
                id: 'doom_resistance_4',
                name: 'The Resistance Leader',
                description: 'Meet the mysterious commander of the resistance.',
                giver: 'resistance_fighter',
                giverName: 'Commander Vera',
                location: 'resistance_hideout',
                type: 'doom',
                arc: 'resistance',
                arcOrder: 4,
                difficulty: 'hard',
                doomOnly: true,
                objectives: [
                    { type: 'travel', to: 'hidden_bunker', completed: false, description: 'Journey to the hidden bunker' },
                    { type: 'prove', test: 'loyalty_test', completed: false, description: 'Pass the loyalty test' },
                    { type: 'meet', npc: 'resistance_leader', completed: false, description: 'Meet General Aldric (Duke Valdric\'s brother)' }
                ],
                rewards: {
                    gold: 500,
                    reputation: 65,
                    experience: 550,
                    unlocks: 'inner_circle_access',
                    title: 'Resistance Champion'
                },
                prerequisite: 'doom_resistance_3',
                nextQuest: 'doom_resistance_5',
                dialogue: {
                    offer: "The General wants to meet you. That's... unprecedented. He doesn't meet just anyone. Follow me to the bunker. And be ready for anything - he tests everyone.",
                    progress: "The General is waiting. Don't keep him.",
                    complete: "General Aldric: 'So you're the one causing Greedy Won so much trouble. I was Duke Valdric's brother... before. Now I lead what's left. You've earned a place in our inner circle. We have one final mission...'"
                }
            },

            doom_resistance_5: {
                id: 'doom_resistance_5',
                name: 'Rally the Survivors',
                description: 'Unite all doom settlements under the resistance banner.',
                giver: 'resistance_leader',
                giverName: 'General Aldric',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'resistance',
                arcOrder: 5,
                difficulty: 'very_hard',
                doomOnly: true,
                isArcFinal: true,
                objectives: [
                    { type: 'visit', location: 'doom_survivor_camps', count: 5, current: 0, description: 'Visit 5 survivor camps' },
                    { type: 'convince', npc: 'camp_leaders', count: 5, current: 0, description: 'Convince 5 camp leaders to join' },
                    { type: 'establish', alliance: 'unified_resistance', completed: false, description: 'Form the Unified Resistance' }
                ],
                rewards: {
                    gold: 1000,
                    reputation: 80,
                    experience: 750,
                    unlocks: 'unified_resistance',
                    achievementTitle: 'Resistance Hero'
                },
                prerequisite: 'doom_resistance_4',
                nextQuest: 'doom_boss_1',
                dialogue: {
                    offer: "Scattered survivors can't defeat Greedy Won. But united? We have a chance. Travel to every camp, convince them to join us. Form a coalition. Then... we take the fight to the capital.",
                    progress: "How many camps have joined? We need everyone.",
                    complete: "The Unified Resistance! For the first time since the doom fell, we stand together. Now there's only one thing left to do - kill Greedy Won and end this nightmare."
                }
            }
        }
    },

    // 
    //  BOSS ARC (5 Quests) - Culminating in GREEDY WON
    // Theme: Prepare for and defeat the doom's master
    // 
    bossArc: {
        arcName: 'The Final Battle',
        arcDescription: 'Prepare for the assault on Greedy Won and end the doom.',
        totalQuests: 5,

        quests: {
            doom_boss_1: {
                id: 'doom_boss_1',
                name: 'Shadow Lieutenant',
                description: 'Defeat one of Greedy Won\'s lieutenants to weaken his forces.',
                giver: 'resistance_leader',
                giverName: 'General Aldric',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'boss',
                arcOrder: 1,
                difficulty: 'very_hard',
                doomOnly: true,
                isBossQuest: true,
                objectives: [
                    { type: 'investigate', location: 'lieutenant_territory', completed: false, description: 'Find the Shadow Lieutenant\'s territory' },
                    { type: 'kill', target: 'shadow_elite', count: 15, current: 0, description: 'Defeat 15 shadow elite' },
                    { type: 'kill', target: 'shadow_lieutenant', count: 1, current: 0, description: 'Kill the Shadow Lieutenant' }
                ],
                rewards: {
                    gold: 1500,
                    reputation: 70,
                    experience: 800,
                    item: 'lieutenants_badge'
                },
                prerequisite: 'doom_resistance_5',
                nextQuest: 'doom_boss_2',
                dialogue: {
                    offer: "Greedy Won has three lieutenants who enforce his will. Kill one, and we weaken him. There's one operating from Blighted Harbor. Hunt him down.",
                    progress: "The lieutenant still lives. Our forces grow restless.",
                    complete: "The lieutenant is dead! Greedy Won felt that blow. Two more remain, but this proves it - he can be hurt. We can win this."
                }
            },

            doom_boss_2: {
                id: 'doom_boss_2',
                name: 'The Dark Arsenal',
                description: 'Find legendary weapons capable of hurting Greedy Won.',
                giver: 'resistance_fighter',
                giverName: 'Sage Remnant',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'boss',
                arcOrder: 2,
                difficulty: 'very_hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'ancient_cache', completed: false, description: 'Find the ancient weapon cache' },
                    { type: 'solve', puzzle: 'cache_seal', completed: false, description: 'Solve the protective seal' },
                    { type: 'acquire', item: 'doom_slayer_blade', count: 1, current: 0, description: 'Claim the Doom Slayer Blade' },
                    { type: 'kill', target: 'cache_guardian', count: 1, current: 0, description: 'Defeat the cache guardian' }
                ],
                rewards: {
                    gold: 1000,
                    reputation: 75,
                    experience: 850,
                    item: 'doom_slayer_blade'
                },
                prerequisite: 'doom_boss_1',
                nextQuest: 'doom_boss_3',
                dialogue: {
                    offer: "Normal weapons won't truly harm Greedy Won - he's become something beyond mortal. But there are weapons from the old world, sealed away against such threats. Find the cache beneath Eternal Frostholm.",
                    progress: "Have you found the weapons? Without them, we cannot win.",
                    complete: "The Doom Slayer Blade! This weapon was forged to kill beings like Greedy Won. With this, you have a chance. But you'll need more than one fighter..."
                }
            },

            doom_boss_3: {
                id: 'doom_boss_3',
                name: 'Doom Champion',
                description: 'Defeat the remaining lieutenants to isolate Greedy Won.',
                giver: 'resistance_leader',
                giverName: 'General Aldric',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'boss',
                arcOrder: 3,
                difficulty: 'very_hard',
                doomOnly: true,
                isBossQuest: true,
                objectives: [
                    { type: 'kill', target: 'shadow_lieutenant_frost', count: 1, current: 0, description: 'Kill the Frost Lieutenant in Eternal Frostholm' },
                    { type: 'kill', target: 'shadow_lieutenant_forge', count: 1, current: 0, description: 'Kill the Forge Lieutenant in Enslaved Ironforge' }
                ],
                rewards: {
                    gold: 3000,
                    reputation: 90,
                    experience: 1200,
                    title: 'Doom Champion',
                    item: 'champions_mantle'
                },
                prerequisite: 'doom_boss_2',
                nextQuest: 'doom_boss_4',
                dialogue: {
                    offer: "Two lieutenants remain. Kill them both, and Greedy Won stands alone. No reinforcements, no champions, just him and us. This is your moment.",
                    progress: "The lieutenants still command their forces. Destroy them.",
                    complete: "Both lieutenants are dead! You're the Doom Champion now - the one who broke Greedy Won's power structure. He's alone. Vulnerable. It's time to end this."
                }
            },

            doom_boss_4: {
                id: 'doom_boss_4',
                name: 'The Source',
                description: 'Discover what sustains the doom and how to end it.',
                giver: 'resistance_fighter',
                giverName: 'Sage Remnant',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'boss',
                arcOrder: 4,
                difficulty: 'very_hard',
                doomOnly: true,
                objectives: [
                    { type: 'investigate', location: 'doom_core', completed: false, description: 'Find the doom\'s source' },
                    { type: 'collect', item: 'doom_knowledge', count: 5, current: 0, description: 'Gather 5 pieces of doom knowledge' },
                    { type: 'discover', secret: 'doom_anchor', completed: false, description: 'Discover the doom anchor' }
                ],
                rewards: {
                    gold: 2000,
                    reputation: 85,
                    experience: 1000,
                    unlocks: 'doom_anchor_knowledge'
                },
                prerequisite: 'doom_boss_3',
                nextQuest: 'doom_boss_5',
                dialogue: {
                    offer: "The doom didn't just happen - something sustains it. A source, an anchor. Find it. Understand it. Without that knowledge, killing Greedy Won might not end anything.",
                    progress: "Have you found the source? We must understand our enemy.",
                    complete: "The doom anchor! It's in the palace, fused with Greedy Won himself. He IS the doom now. When he dies, the doom dies with him. Everything depends on the final battle."
                }
            },

            doom_boss_5: {
                id: 'doom_boss_5',
                name: "Doom's End",
                description: 'Assault the Destroyed Royal Capital and destroy Greedy Won.',
                giver: 'resistance_leader',
                giverName: 'General Aldric',
                location: 'hidden_bunker',
                type: 'doom',
                arc: 'boss',
                arcOrder: 5,
                difficulty: 'legendary',
                doomOnly: true,
                isBossQuest: true,
                isFinalBoss: true,
                isArcFinal: true,
                objectives: [
                    { type: 'assault', location: 'doom_royal_capital', completed: false, description: 'Lead the assault on the Destroyed Capital' },
                    { type: 'kill', target: 'shadow_elite', count: 25, current: 0, description: 'Fight through 25 shadow elite' },
                    { type: 'kill', target: 'greedy_won', count: 1, current: 0, description: 'DESTROY GREEDY WON' }
                ],
                rewards: {
                    gold: 25000, // Doom gold
                    reputation: 200,
                    experience: 5000,
                    title: 'Doom Ender',
                    item: 'greeds_end_set',
                    unlocks: 'doom_world_fast_travel',
                    achievementTitle: 'Greed Defeated'
                },
                prerequisite: 'doom_boss_4',
                nextQuest: null,
                dialogue: {
                    offer: "This is it. The final battle. The unified resistance marches on the capital. You lead the charge. Find Greedy Won in his throne room and end him. End the doom. End this nightmare forever.",
                    progress: "The battle rages! Greedy Won awaits in his throne!",
                    complete: "GREEDY WON IS DEAD! The doom... look! It's fading! The sky... I can see the sky! You did it! The Doom Ender - the one who saved our world. This victory will echo through eternity!"
                }
            }
        }
    },

    // 
    //  GREEDY WON - CENTRAL DOOM BOSS
    // 
    greedyWon: {
        id: 'greedy_won',
        name: 'Greedy Won',
        title: 'The Avatar of Avarice',
        location: 'doom_royal_capital',
        description: 'The twisted manifestation of unchecked greed - what the Black Ledger became when they got everything they wanted.',

        lore: `In the normal world, the Black Ledger was stopped. But in this timeline, they won.
Their leader ascended, fusing with the accumulated greed of a thousand corrupt merchants.
What emerged was no longer human - a grotesque fusion of gold, contracts, and suffering.
Greedy Won is both the ruler of this doomed world and the anchor that sustains the apocalypse.
Kill him, and the doom ends. Fail, and it spreads forever.`,

        appearance: 'A massive humanoid figure composed of melted gold coins, screaming contracts, and the tortured souls of those he\'s consumed. His eyes are burning ledger entries. His crown is made of broken dreams.',

        stats: {
            health: 1000,
            damage: { min: 30, max: 50 },
            defense: 25,
            speed: 'slow',
            phases: 3
        },

        specialAttacks: {
            golden_grasp: {
                name: 'Golden Grasp',
                description: 'Steals player gold during the fight.',
                damage: 20,
                effect: 'Steals 10% of player\'s gold',
                cooldown: 15
            },
            contract_curse: {
                name: 'Contract Curse',
                description: 'Applies damage over time.',
                damage: 5,
                effect: 'DoT: 5 damage per second for 10 seconds',
                cooldown: 20
            },
            market_crash: {
                name: 'Market Crash',
                description: 'Reduces player\'s maximum health temporarily.',
                damage: 15,
                effect: 'Reduces max HP by 20% for 30 seconds',
                cooldown: 30
            },
            hostile_takeover: {
                name: 'Hostile Takeover',
                description: 'Phase 2+ ability. Summons shadow merchants.',
                damage: 0,
                effect: 'Summons 3 Shadow Merchants (50 HP each)',
                cooldown: 45
            },
            bankruptcy: {
                name: 'Bankruptcy',
                description: 'Phase 3 ultimate. Massive damage if player has gold.',
                damage: 100,
                effect: 'Damage scales with player\'s gold (more gold = more damage)',
                cooldown: 60
            }
        },

        phases: {
            phase1: {
                healthThreshold: 1000,
                name: 'The Merchant King',
                abilities: ['golden_grasp', 'contract_curse'],
                behavior: 'Slow, methodical attacks. Tests the player.'
            },
            phase2: {
                healthThreshold: 600,
                name: 'The Hungry Void',
                abilities: ['golden_grasp', 'contract_curse', 'market_crash', 'hostile_takeover'],
                behavior: 'More aggressive. Summons minions. Faster attacks.'
            },
            phase3: {
                healthThreshold: 300,
                name: 'The Final Debt',
                abilities: ['golden_grasp', 'contract_curse', 'market_crash', 'hostile_takeover', 'bankruptcy'],
                behavior: 'Desperate. Uses all abilities. Bankruptcy becomes available.'
            }
        },

        rewards: {
            gold: 25000,
            title: 'Doom Ender',
            armor: 'greeds_end_set',
            achievement: 'Greed Defeated',
            unlocks: ['doom_world_fast_travel', 'doom_world_complete']
        },

        dialogue: {
            encounter: "MORE! I NEED MORE! Your gold, your goods, your SOUL! Everything has a price, and I will COLLECT!",
            phase2: "You think you can bankrupt ME?! I AM COMMERCE INCARNATE! I AM THE DEAL THAT CANNOT BE REFUSED!",
            phase3: "NO! My empire... my beautiful empire... YOU WILL PAY THE ULTIMATE PRICE!",
            defeat: "The... the ledger... closes... all debts... paid... in... full...",
            victory: "Your assets have been... LIQUIDATED. Another soul for my collection. The doom... EXPANDS."
        }
    },

    // 
    //  UTILITY METHODS
    // 

    /**
     * Get all doom quests as a flat array
     * @returns {Array} All doom quest objects
     */
    getAllQuests() {
        return [
            ...Object.values(this.survivalArc.quests),
            ...Object.values(this.resistanceArc.quests),
            ...Object.values(this.bossArc.quests)
        ];
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
     * Get quests for a specific arc
     * @param {string} arcName - 'survival', 'resistance', or 'boss'
     * @returns {Array} Array of quest objects
     */
    getQuestsForArc(arcName) {
        const arcMap = {
            survival: this.survivalArc.quests,
            resistance: this.resistanceArc.quests,
            boss: this.bossArc.quests
        };
        return arcMap[arcName] ? Object.values(arcMap[arcName]) : [];
    },

    /**
     * Get doom location info
     * @param {string} locationId - The location ID
     * @returns {Object|null} Location data
     */
    getDoomLocation(locationId) {
        return this.doomLocations[locationId] || null;
    },

    /**
     * Check if location is safe zone
     * @param {string} locationId - The location ID
     * @returns {boolean}
     */
    isSafeZone(locationId) {
        const location = this.doomLocations[locationId];
        return location ? location.safeZone : false;
    },

    /**
     * Get doom price for item
     * @param {number} basePrice - Normal world price
     * @param {string} itemType - Type of item
     * @returns {number} Doom world price
     */
    getDoomPrice(basePrice, itemType) {
        return this.doomEconomy.getDoomPrice(basePrice, itemType);
    },

    /**
     * Get Greedy Won boss data
     * @returns {Object} Boss configuration
     */
    getGreedyWon() {
        return this.greedyWon;
    },

    /**
     * Get arc summary
     * @returns {Array} Summary of all arcs
     */
    getArcsSummary() {
        return [
            {
                id: 'survival',
                name: this.survivalArc.arcName,
                description: this.survivalArc.arcDescription,
                questCount: Object.keys(this.survivalArc.quests).length
            },
            {
                id: 'resistance',
                name: this.resistanceArc.arcName,
                description: this.resistanceArc.arcDescription,
                questCount: Object.keys(this.resistanceArc.quests).length
            },
            {
                id: 'boss',
                name: this.bossArc.arcName,
                description: this.bossArc.arcDescription,
                questCount: Object.keys(this.bossArc.quests).length
            }
        ];
    },

    /**
     * Get all doom exclusive items
     * @returns {Object} Doom items catalog
     */
    getDoomItems() {
        return this.doomItems;
    }
};

// Export for use in quest system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoomQuests;
}
