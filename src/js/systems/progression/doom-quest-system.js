// ═══════════════════════════════════════════════════════════════
// DOOM QUEST SYSTEM - Tales of tragedy and survival 💀🔥
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Every quest is a story of loss. Every victory comes with grief.
// The doom broke the world - these quests reflect that horror.
// Unlocked after defeating the first boss and meeting the Ferryman.
// ═══════════════════════════════════════════════════════════════

const DoomQuestSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 💀 DOOM MAIN STORY QUESTS
    // ═══════════════════════════════════════════════════════════════
    mainQuests: {
        // ═══════════════════════════════════════════════════════════
        // ACT 1: ARRIVAL IN THE DOOM
        // ═══════════════════════════════════════════════════════════
        doom_arrival: {
            id: 'doom_arrival',
            name: 'Through the Veil',
            description: 'The Ferryman has brought you across to the other world. What was once the kingdom now lies in ruins. The Shadow Throne has conquered all. Find survivors and learn what happened.',
            giver: 'boatman',
            giverName: 'The Ferryman',
            turnInNpc: 'haunted_elder',
            turnInLocation: 'greendale',
            location: 'shadow_dungeon', // Entry point - wherever boatman spawns
            type: 'main',
            difficulty: 'hard',
            isDoom: true,
            objectives: [
                { type: 'visit', location: 'greendale', completed: false, description: 'Journey to Greendale Ashes' },
                { type: 'talk', npc: 'haunted_elder', completed: false, description: 'Speak with the Haunted Elder', givesItem: 'survivor_journal' }
            ],
            rewards: { items: { food: 10, water: 5 }, experience: 200 },
            nextQuest: 'doom_fallen_throne',
            questLine: 'doom_main'
        },

        doom_fallen_throne: {
            id: 'doom_fallen_throne',
            name: 'The Fallen Throne',
            description: 'The Elder speaks of the Royal Capital - now called the Fallen Throne. The king is dead, but something far worse sits on his throne. You must see it for yourself.',
            giver: 'haunted_elder',
            giverName: 'Elder Morin (Haunted)',
            turnInNpc: 'grief_stricken_elder',
            turnInLocation: 'royal_capital',
            location: 'greendale',
            type: 'main',
            difficulty: 'hard',
            isDoom: true,
            objectives: [
                { type: 'visit', location: 'royal_capital', completed: false, description: 'Enter the Fallen Throne' },
                { type: 'talk', npc: 'grief_stricken_elder', completed: false, description: 'Find the Royal Scholar' },
                { type: 'explore', area: 'throne_room', completed: false, description: 'Witness the Shadow Throne' }
            ],
            rewards: { items: { bandages: 5, torch: 3 }, experience: 300 },
            nextQuest: 'doom_resistance',
            prerequisite: 'doom_arrival',
            questLine: 'doom_main'
        },

        doom_resistance: {
            id: 'doom_resistance',
            name: 'Embers of Resistance',
            description: 'Not all have submitted to the darkness. A resistance fights from the shadows. The Scholar tells of survivors gathering at Smuggler\'s Sanctuary. Find them. Join them. Or die alone.',
            giver: 'grief_stricken_elder',
            giverName: 'Scholar Aldwin (Broken)',
            turnInNpc: 'survival_smuggler',
            turnInLocation: 'smugglers_cove',
            location: 'royal_capital',
            type: 'main',
            difficulty: 'hard',
            isDoom: true,
            objectives: [
                { type: 'visit', location: 'smugglers_cove', completed: false, description: 'Travel to Smuggler\'s Sanctuary' },
                { type: 'talk', npc: 'survival_smuggler', completed: false, description: 'Meet the Resistance Leader' },
                { type: 'collect', item: 'resistance_token', count: 1, current: 0, description: 'Receive the Resistance Token' }
            ],
            rewards: { items: { iron_sword: 1, food: 15 }, experience: 350 },
            nextQuest: 'doom_supply_run',
            prerequisite: 'doom_fallen_throne',
            questLine: 'doom_main'
        },

        // ═══════════════════════════════════════════════════════════
        // ACT 2: SURVIVAL AND SACRIFICE
        // ═══════════════════════════════════════════════════════════
        doom_supply_run: {
            id: 'doom_supply_run',
            name: 'The Last Harvest',
            description: 'The Resistance is starving. The Blighted Fields might still have untainted crops. But the corruption spreads, and creatures hunt those who venture into the open. This is a suicide mission - but someone has to go.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'very_hard',
            objectives: [
                { type: 'visit', location: 'wheat_farm', completed: false, description: 'Reach the Blighted Fields' },
                { type: 'collect', item: 'untainted_grain', count: 20, current: 0, description: 'Salvage untainted grain' },
                { type: 'survive', encounter: 'blight_creatures', completed: false, description: 'Survive the Blight Creatures' },
                { type: 'return', location: 'smugglers_cove', completed: false, description: 'Return to the Sanctuary' }
            ],
            rewards: { items: { medical_plants: 10 }, experience: 500, reputation: { resistance: 50 } },
            nextQuest: 'doom_medicine_run',
            prerequisite: 'doom_resistance',
            questLine: 'doom_main',
            triggerEvent: 'blight_creature_ambush'
        },

        doom_medicine_run: {
            id: 'doom_medicine_run',
            name: 'The Plague Doctor',
            description: 'A plague spreads through the Sanctuary. The old apothecary in Ironforge Ruins might have medicine - if he\'s still alive, and if his mind hasn\'t completely broken.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'very_hard',
            objectives: [
                { type: 'visit', location: 'ironforge_city', completed: false, description: 'Journey to Ironforge Ruins' },
                { type: 'talk', npc: 'plague_apothecary', completed: false, description: 'Find the Plague Doctor' },
                { type: 'collect', item: 'plague_cure', count: 10, current: 0, description: 'Obtain plague medicine' },
                { type: 'return', location: 'smugglers_cove', completed: false, description: 'Return before it\'s too late' }
            ],
            rewards: { items: { plague_cure: 5 }, experience: 600 },
            nextQuest: 'doom_the_choice',
            prerequisite: 'doom_supply_run',
            questLine: 'doom_main',
            triggerEvent: 'plague_timer' // Time limit event
        },

        doom_the_choice: {
            id: 'doom_the_choice',
            name: 'Sophie\'s Burden',
            description: 'There isn\'t enough medicine for everyone. The children, the elderly, the fighters - only one group can be saved. The Resistance looks to you to make the impossible choice.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'legendary',
            isChoice: true,
            objectives: [
                {
                    type: 'choice',
                    options: [
                        { id: 'save_children', label: 'Save the children', consequence: 'Children survive, elders and some fighters die' },
                        { id: 'save_fighters', label: 'Save the fighters', consequence: 'Fighters survive, children and elders die' },
                        { id: 'save_elders', label: 'Save the elders (knowledge)', consequence: 'Elders survive with ancient knowledge, children and fighters die' }
                    ],
                    description: 'Make the impossible choice'
                }
            ],
            rewards: { experience: 800, karma: 'varies' },
            nextQuest: 'doom_aftermath',
            prerequisite: 'doom_medicine_run',
            questLine: 'doom_main',
            majorChoice: true
        },

        // ═══════════════════════════════════════════════════════════
        // ACT 3: STRIKING BACK
        // ═══════════════════════════════════════════════════════════
        doom_aftermath: {
            id: 'doom_aftermath',
            name: 'Bury the Dead',
            description: 'Those who died deserve a proper burial. But graves attract scavengers - both human and otherwise. Protect the burial party as they lay the dead to rest.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'hard',
            objectives: [
                { type: 'escort', target: 'burial_party', location: 'stone_quarry', description: 'Escort the burial party to the Bone Quarry' },
                { type: 'defend', encounter: 'grave_robbers', waves: 3, description: 'Defend against scavengers' },
                { type: 'ceremony', completed: false, description: 'Attend the burial ceremony' }
            ],
            rewards: { items: { food: 10 }, experience: 400, karma: 'honored' },
            nextQuest: 'doom_war_council',
            prerequisite: 'doom_the_choice',
            questLine: 'doom_main'
        },

        doom_war_council: {
            id: 'doom_war_council',
            name: 'Council of the Damned',
            description: 'The Resistance leaders gather. The druids, the soldiers, the smugglers - all that\'s left of civilization. Together, they must form a plan to strike at the Shadow Throne.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'hard',
            objectives: [
                { type: 'gather', npcs: ['corrupted_druid', 'last_guard', 'survival_smuggler'], description: 'Gather the council members' },
                { type: 'attend', event: 'war_council', description: 'Attend the War Council' },
                { type: 'vote', decision: 'attack_plan', description: 'Choose the attack strategy' }
            ],
            rewards: { experience: 500, title: 'Resistance Commander' },
            nextQuest: 'doom_corrupted_grove',
            prerequisite: 'doom_aftermath',
            questLine: 'doom_main'
        },

        doom_corrupted_grove: {
            id: 'doom_corrupted_grove',
            name: 'The Corrupted Circle',
            description: 'Before attacking the Shadow Throne, you must sever its connection to the land. The druids\' grove - now corrupted - channels darkness into the world. Cleanse it or destroy it.',
            giver: 'corrupted_druid',
            giverName: 'Archdruid Theron (Corrupted)',
            location: 'druid_grove',
            type: 'main',
            difficulty: 'legendary',
            objectives: [
                { type: 'visit', location: 'druid_grove', completed: false, description: 'Enter the Corrupted Circle' },
                { type: 'cleanse', targets: 5, current: 0, description: 'Cleanse or destroy the corruption nodes' },
                { type: 'boss', enemy: 'corrupted_archdruid', completed: false, description: 'Face the Corrupted Archdruid' }
            ],
            rewards: { items: { purified_essence: 1 }, experience: 1000 },
            nextQuest: 'doom_final_march',
            prerequisite: 'doom_war_council',
            questLine: 'doom_main'
        },

        doom_final_march: {
            id: 'doom_final_march',
            name: 'The Final March',
            description: 'The time has come. The Resistance marches on the Fallen Throne. Many will die. All might die. But if no one fights, humanity dies anyway. Forward, into the darkness.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'main',
            difficulty: 'legendary',
            objectives: [
                { type: 'rally', troops: true, description: 'Rally the Resistance forces' },
                { type: 'march', path: ['stonebridge', 'royal_capital'], description: 'March to the Fallen Throne' },
                { type: 'battle', encounter: 'shadow_army', description: 'Break through the Shadow Army' }
            ],
            rewards: { experience: 1500 },
            nextQuest: 'doom_shadow_throne',
            prerequisite: 'doom_corrupted_grove',
            questLine: 'doom_main'
        },

        doom_shadow_throne: {
            id: 'doom_shadow_throne',
            name: 'The Shadow Throne',
            description: 'You stand before the Shadow Throne. The entity that ended the world awaits. Everything has led to this moment. Win, and perhaps the world can heal. Lose, and darkness eternal.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'royal_capital',
            type: 'main',
            difficulty: 'legendary',
            isFinalBoss: true,
            objectives: [
                { type: 'enter', location: 'throne_room', description: 'Enter the Throne Room' },
                { type: 'boss', enemy: 'shadow_king', completed: false, description: 'Defeat the Shadow King' },
                { type: 'choice', options: [
                    { id: 'destroy_throne', label: 'Destroy the Throne', consequence: 'End the darkness, but the power is lost forever' },
                    { id: 'claim_throne', label: 'Claim the Throne', consequence: 'Take the power, but risk corruption' }
                ], description: 'Decide the fate of the Shadow Throne' }
            ],
            rewards: { experience: 5000, title: 'Shadow\'s End', items: { doom_artifact: 1 } },
            questLine: 'doom_main',
            prerequisite: 'doom_final_march',
            endings: ['doom_ending_light', 'doom_ending_dark']
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💔 DOOM SIDE QUESTS - Tales of personal tragedy
    // ═══════════════════════════════════════════════════════════════
    sideQuests: {
        // ═══════════════════════════════════════════════════════════
        // GREENDALE ASHES - Farm tragedy
        // ═══════════════════════════════════════════════════════════
        doom_lost_children: {
            id: 'doom_lost_children',
            name: 'Empty Cradles',
            description: 'A mother in Greendale Ashes hasn\'t stopped searching for her children since the doom began. Everyone knows they\'re dead. She refuses to believe it. Perhaps finding their remains would give her peace... or break her completely.',
            giver: 'starving_farmer',
            giverName: 'Margaret the Mad',
            location: 'greendale',
            type: 'tragedy',
            difficulty: 'medium',
            objectives: [
                { type: 'search', locations: ['wheat_farm', 'riverside_inn', 'vineyard_village'], description: 'Search for signs of the children' },
                { type: 'find', item: 'childs_toy', count: 1, description: 'Find what remains' },
                { type: 'choice', options: [
                    { id: 'tell_truth', label: 'Tell her the truth', consequence: 'She breaks down but begins to heal' },
                    { id: 'lie_hope', label: 'Lie - say they escaped', consequence: 'She keeps searching forever' }
                ], description: 'Decide what to tell the mother' }
            ],
            rewards: { items: { food: 5 }, experience: 200, karma: 'varies' }
        },

        doom_mercy_killing: {
            id: 'doom_mercy_killing',
            name: 'A Merciful End',
            description: 'The plague has taken the old miller. He begs for death as the corruption spreads through his body. His family can\'t do it. He asks a stranger - you.',
            giver: 'desperate_innkeeper',
            giverName: 'Innkeeper Greta',
            location: 'greendale',
            type: 'tragedy',
            difficulty: 'easy',
            objectives: [
                { type: 'visit', location: 'wheat_farm', description: 'Find the dying miller' },
                { type: 'choice', options: [
                    { id: 'mercy_kill', label: 'Grant him mercy', consequence: 'He dies peacefully, family mourns but understands' },
                    { id: 'let_suffer', label: 'Refuse - let nature decide', consequence: 'He suffers for three more days, family resents you' },
                    { id: 'find_cure', label: 'Try to find a cure', consequence: 'You fail. He dies in agony. But you tried.' }
                ], description: 'Make the final choice' }
            ],
            rewards: { experience: 150, karma: 'varies' }
        },

        // ═══════════════════════════════════════════════════════════
        // IRONFORGE RUINS - Forge of despair
        // ═══════════════════════════════════════════════════════════
        doom_the_last_sword: {
            id: 'doom_the_last_sword',
            name: 'The Last Sword',
            description: 'The crazed blacksmith works day and night forging weapons. He believes if he forges enough, he can arm an army to defeat the darkness. He hasn\'t slept in weeks. He\'s killing himself at the forge.',
            giver: 'crazed_blacksmith',
            giverName: 'Grimm the Smith',
            location: 'ironforge_city',
            type: 'tragedy',
            difficulty: 'medium',
            objectives: [
                { type: 'gather', items: { iron_ore: 20, coal: 10 }, description: 'Bring him materials to continue' },
                { type: 'talk', npc: 'crazed_blacksmith', times: 3, description: 'Check on him over time' },
                { type: 'choice', options: [
                    { id: 'let_work', label: 'Let him work until he drops', consequence: 'He dies at the forge, but leaves a legendary weapon' },
                    { id: 'force_rest', label: 'Force him to rest', consequence: 'He lives, but never forgives you for stopping him' },
                    { id: 'work_together', label: 'Help him forge', consequence: 'Share the burden, save him, complete his work together' }
                ], description: 'Decide his fate' }
            ],
            rewards: { items: { legendary_sword: 1 }, experience: 400 },
            choiceRewards: {
                let_work: { items: { doom_blade: 1 } },
                force_rest: { reputation: { ironforge: 50 } },
                work_together: { items: { partner_blade: 1 }, skill: { smithing: 2 } }
            }
        },

        // ═══════════════════════════════════════════════════════════
        // FALLEN THRONE - Nobility's fall
        // ═══════════════════════════════════════════════════════════
        doom_crown_of_thorns: {
            id: 'doom_crown_of_thorns',
            name: 'The Crown of Thorns',
            description: 'The fallen noble was once a prince. His family is dead. His kingdom is ash. He wears a crown of thorns as penance for surviving. He wants you to find his sister\'s body in the ruins.',
            giver: 'fallen_noble',
            giverName: 'Prince Aldric the Broken',
            location: 'royal_capital',
            type: 'tragedy',
            difficulty: 'hard',
            objectives: [
                { type: 'search', location: 'royal_capital', area: 'princess_tower', description: 'Search the Princess Tower' },
                { type: 'find', item: 'princess_remains', description: 'Find what remains of Princess Elara' },
                { type: 'return', to: 'fallen_noble', description: 'Return to Prince Aldric' }
            ],
            rewards: { items: { royal_ring: 1 }, experience: 350 },
            aftermath: 'prince_suicide' // Tragic consequence
        },

        // ═══════════════════════════════════════════════════════════
        // FROSTHOLM GRAVES - Frozen tragedy
        // ═══════════════════════════════════════════════════════════
        doom_frozen_family: {
            id: 'doom_frozen_family',
            name: 'Ice and Ashes',
            description: 'A trapper found his family frozen in their cabin. He can\'t bring himself to bury them. The cold preserves them perfectly - he visits them every day. This can\'t continue.',
            giver: 'starving_trapper',
            giverName: 'Old Erik',
            location: 'frostholm_village',
            type: 'tragedy',
            difficulty: 'medium',
            objectives: [
                { type: 'visit', location: 'frozen_cave', description: 'Visit the frozen cabin' },
                { type: 'witness', scene: 'frozen_family', description: 'See what Erik sees every day' },
                { type: 'choice', options: [
                    { id: 'bury_them', label: 'Help him bury them', consequence: 'He mourns properly and begins to heal' },
                    { id: 'let_visit', label: 'Let him keep visiting', consequence: 'He eventually freezes to death beside them' },
                    { id: 'burn_cabin', label: 'Burn the cabin (force closure)', consequence: 'He hates you, but survives' }
                ], description: 'Decide how to help Erik' }
            ],
            rewards: { items: { furs: 5 }, experience: 250 }
        },

        // ═══════════════════════════════════════════════════════════
        // SMUGGLER'S SANCTUARY - Underground deals
        // ═══════════════════════════════════════════════════════════
        doom_the_traitor: {
            id: 'doom_the_traitor',
            name: 'The Informant',
            description: 'Someone in the Sanctuary is feeding information to the Shadow forces. People have died because of the leaks. Find the traitor. But be warned - the traitor might have reasons.',
            giver: 'survival_smuggler',
            giverName: 'Captain Vex',
            location: 'smugglers_cove',
            type: 'investigation',
            difficulty: 'hard',
            objectives: [
                { type: 'investigate', suspects: ['desperate_merchant', 'ruthless_fence', 'stranded_merchant'], description: 'Investigate the suspects' },
                { type: 'gather', evidence: 3, description: 'Find evidence' },
                { type: 'confront', npc: 'the_traitor', description: 'Confront the traitor' }
            ],
            rewards: { experience: 400, reputation: { resistance: 100 } },
            twist: 'traitor_is_saving_family' // The traitor is trading info to protect their captive family
        },

        // ═══════════════════════════════════════════════════════════
        // DRUID GROVE - Nature's corruption
        // ═══════════════════════════════════════════════════════════
        doom_last_seed: {
            id: 'doom_last_seed',
            name: 'The Last Seed',
            description: 'A dying herbalist in the Corrupted Circle guards the last uncorrupted seed - the only hope for nature to ever recover. She\'s too weak to plant it herself. The corruption is consuming her.',
            giver: 'dying_herbalist',
            giverName: 'Sage Willow',
            location: 'druid_grove',
            type: 'hope',
            difficulty: 'very_hard',
            objectives: [
                { type: 'receive', item: 'last_seed', description: 'Receive the Last Seed from Sage Willow' },
                { type: 'find', location: 'uncorrupted_soil', description: 'Find uncorrupted soil (rumors say the Fairy Grotto might have some)' },
                { type: 'plant', item: 'last_seed', description: 'Plant the seed' },
                { type: 'protect', duration: '3_days', description: 'Protect the seedling for 3 days' }
            ],
            rewards: { experience: 600, title: 'Hope Bearer', items: { blessing_of_nature: 1 } },
            aftermath: 'sage_willow_death' // She dies peacefully after passing on the seed
        },

        // ═══════════════════════════════════════════════════════════
        // LIGHTHOUSE INN - Coastal horror
        // ═══════════════════════════════════════════════════════════
        doom_what_the_light_showed: {
            id: 'doom_what_the_light_showed',
            name: 'What the Light Revealed',
            description: 'The lighthouse keeper blinded himself. He refuses to say what he saw when the light swept over the water that night. But something is coming from the sea. We need to know what.',
            giver: 'blind_lighthouse_keeper',
            giverName: 'Keeper Jonas',
            location: 'lighthouse_inn',
            type: 'horror',
            difficulty: 'hard',
            objectives: [
                { type: 'investigate', location: 'lighthouse_quarters', description: 'Search the keeper\'s quarters for his journal', givesItem: 'keepers_journal' },
                { type: 'collect', item: 'keepers_journal', count: 1, current: 0, description: 'Obtain the journal' },
                { type: 'choice', options: [
                    { id: 'light_beacon', label: 'Light the beacon again', consequence: 'See what comes. Face the truth.' },
                    { id: 'destroy_beacon', label: 'Destroy the lighthouse', consequence: 'Whatever it is, it can\'t find us in the dark' },
                    { id: 'keep_secret', label: 'Keep the secret', consequence: 'Some truths are too terrible to share' }
                ], description: 'Decide what to do with the knowledge' }
            ],
            rewards: { experience: 350 },
            horror: true
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 QUEST SYSTEM UTILITIES
    // ═══════════════════════════════════════════════════════════════

    isInDoomWorld() {
        return (typeof game !== 'undefined' && game.inDoomWorld === true) ||
               (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
               (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive);
    },

    getQuest(questId) {
        return this.mainQuests[questId] || this.sideQuests[questId] || null;
    },

    getAvailableQuests(locationId) {
        if (!this.isInDoomWorld()) return [];

        const available = [];

        // Check main quests
        Object.values(this.mainQuests).forEach(quest => {
            if (quest.location === locationId && this._meetsPrerequisites(quest)) {
                available.push(quest);
            }
        });

        // Check side quests
        Object.values(this.sideQuests).forEach(quest => {
            if (quest.location === locationId && this._meetsPrerequisites(quest)) {
                available.push(quest);
            }
        });

        return available;
    },

    _meetsPrerequisites(quest) {
        if (!quest.prerequisite) return true;

        // Check if prerequisite quest is completed
        if (typeof QuestSystem !== 'undefined') {
            return QuestSystem.isQuestCompleted(quest.prerequisite);
        }
        return false;
    },

    // Get doom-specific quest dialogue
    getQuestDialogue(questId, stage) {
        const quest = this.getQuest(questId);
        if (!quest) return null;

        // Doom dialogue is always bleak
        const dialogueStages = {
            offer: `The darkness grows. ${quest.description} Will you help... or let us all die?`,
            progress: `Still fighting? Good. We need fighters. The dead don't fight back.`,
            complete: `You did it. We live another day. But tomorrow brings new horrors.`,
            fail: `You failed. More will die. That's the way of the doom.`
        };

        return dialogueStages[stage] || dialogueStages.offer;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔗 QUEST SYSTEM INTEGRATION
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Register all doom quests with the main QuestSystem
    // Called when entering doom world for the first time
    registerDoomQuests() {
        if (typeof QuestSystem === 'undefined') {
            console.warn('💀 QuestSystem not available - cannot register doom quests');
            return;
        }

        console.log('💀 Registering doom quests with QuestSystem...');

        // Add isDoom flag to all quests and register them
        const allDoomQuests = { ...this.mainQuests, ...this.sideQuests };

        Object.entries(allDoomQuests).forEach(([questId, quest]) => {
            // Mark as doom quest
            quest.isDoom = true;

            // Add turnInNpc if not set (defaults to giver)
            if (!quest.turnInNpc) {
                quest.turnInNpc = quest.giver;
            }

            // Register with main QuestSystem if not already there
            if (!QuestSystem.quests[questId]) {
                QuestSystem.quests[questId] = quest;
                console.log(`💀 Registered doom quest: ${quest.name}`);
            }
        });

        console.log(`💀 Registered ${Object.keys(allDoomQuests).length} doom quests`);
    },

    // 🖤 Get quests for a specific NPC (for People Panel)
    getQuestsForNPC(npcType, locationId) {
        if (!this.isInDoomWorld()) return [];

        const quests = [];
        const allDoomQuests = { ...this.mainQuests, ...this.sideQuests };

        Object.values(allDoomQuests).forEach(quest => {
            // Quest giver matches
            if (quest.giver === npcType && this._meetsPrerequisites(quest)) {
                // Check if not already active or completed
                if (typeof QuestSystem !== 'undefined') {
                    const isActive = QuestSystem.activeQuests?.[quest.id];
                    const isCompleted = QuestSystem.completedQuests?.includes(quest.id);
                    if (!isActive && !isCompleted) {
                        quests.push({ ...quest, canAccept: true });
                    }
                } else {
                    quests.push({ ...quest, canAccept: true });
                }
            }

            // Turn-in NPC matches
            if (quest.turnInNpc === npcType) {
                if (typeof QuestSystem !== 'undefined') {
                    const activeQuest = QuestSystem.activeQuests?.[quest.id];
                    if (activeQuest && QuestSystem.areObjectivesComplete?.(quest.id)) {
                        quests.push({ ...quest, canTurnIn: true });
                    }
                }
            }
        });

        return quests;
    },

    // 🖤 Start the intro doom quest (from Boatman)
    startIntroQuest() {
        if (typeof QuestSystem === 'undefined') return false;

        // Register quests first if not done
        this.registerDoomQuests();

        // 🖤💀 Start the intro quest - use assignQuest, not startQuest!
        const result = QuestSystem.assignQuest('doom_arrival');
        if (result && result.success) {
            QuestSystem.trackQuest('doom_arrival');
            if (typeof addMessage === 'function') {
                addMessage('💀 New Quest: Through the Veil', 'warning');
                addMessage('The Ferryman has given you a task. Find survivors in this ruined world.', 'info');
            }
            return true;
        }
        return false;
    },

    // 🖤 Get quest context for NPC instruction templates (API TTS)
    getQuestContextForNPC(npcType, locationId) {
        const context = {
            availableQuests: [],
            activeQuests: [],
            completableQuests: [],
            hasQuests: false
        };

        if (!this.isInDoomWorld()) return context;

        const allDoomQuests = { ...this.mainQuests, ...this.sideQuests };

        Object.values(allDoomQuests).forEach(quest => {
            // Quests this NPC can give
            if (quest.giver === npcType && this._meetsPrerequisites(quest)) {
                if (typeof QuestSystem !== 'undefined') {
                    const isActive = QuestSystem.activeQuests?.[quest.id];
                    const isCompleted = QuestSystem.completedQuests?.includes(quest.id);
                    if (!isActive && !isCompleted) {
                        context.availableQuests.push({
                            id: quest.id,
                            name: quest.name,
                            description: quest.description,
                            type: quest.type,
                            difficulty: quest.difficulty
                        });
                    }
                }
            }

            // Active quests from this NPC
            if (quest.giver === npcType) {
                if (typeof QuestSystem !== 'undefined') {
                    const activeQuest = QuestSystem.activeQuests?.[quest.id];
                    if (activeQuest) {
                        const objectives = activeQuest.objectives || quest.objectives || [];
                        const completed = objectives.filter(o => o.completed).length;
                        const total = objectives.length;
                        context.activeQuests.push({
                            id: quest.id,
                            name: quest.name,
                            progress: `${completed}/${total} objectives complete`,
                            objectives: objectives
                        });
                    }
                }
            }

            // Quests completable at this NPC
            if (quest.turnInNpc === npcType) {
                if (typeof QuestSystem !== 'undefined') {
                    const activeQuest = QuestSystem.activeQuests?.[quest.id];
                    if (activeQuest && QuestSystem.areObjectivesComplete?.(quest.id)) {
                        context.completableQuests.push({
                            id: quest.id,
                            name: quest.name,
                            rewards: quest.rewards
                        });
                    }
                }
            }
        });

        context.hasQuests = context.availableQuests.length > 0 ||
                           context.activeQuests.length > 0 ||
                           context.completableQuests.length > 0;

        return context;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY
// ═══════════════════════════════════════════════════════════════
window.DoomQuestSystem = DoomQuestSystem;

console.log('💀 DoomQuestSystem loaded - Tales of tragedy await...');
