//
// EXPLORATION CONFIG - location-specific exploration options
//
// Version: 0.91.10 | Unity AI Lab
// This file maps each location type to its available explorations
// Quest explorations are separate and unlocked by active quests
//

console.log('Exploration config crawling from the shadows...');

const ExplorationConfig = {
    // exploration options by location TYPE - what shows up in the explore panel
    // each location type has a set of explorations appropriate to that type

    LOCATION_EXPLORATIONS: {
        // === DUNGEONS - the darkest places with the best loot ===
        dungeon: {
            name: 'Dungeon',
            icon: '🏚️',
            description: 'Dark corridors filled with treasure and terror',
            explorations: [
                'dungeon_altar',
                'dungeon_chest',
                'dungeon_well',
                'dungeon_skeleton_hoard',
                'ruins_throne_room',
                'ruins_hidden_vault'
            ],
            // unique explorations only at specific dungeon locations
            locationSpecific: {
                shadow_dungeon: ['boss_malachar', 'doom_portal_activation'],
                forest_dungeon: ['boss_grimfang', 'doom_portal_activation']
            }
        },

        // === CAVES - underground mysteries ===
        cave: {
            name: 'Cave',
            icon: '🕳️',
            description: 'Underground passages with hidden treasures',
            explorations: [
                'cave_narrow_passage',
                'cave_underground_lake',
                'cave_glowing_pool',
                'cave_crystal_chamber',
                'cave_underground_river',
                'cave_ancient_painting',
                'mine_dig_spot',
                'dungeon_well'
            ],
            locationSpecific: {
                frozen_cave: ['ice_crystal_harvest', 'boss_frost_lord'],
                deep_cavern: ['boss_scorathax', 'deep_mining_expedition'],
                crystal_cave: ['crystal_formation_study', 'gem_extraction'],
                river_cave: ['pearl_diving', 'underground_fishing'],
                coastal_cave: ['pirate_treasure_hunt', 'tidal_pool_search'],
                fairy_grotto: ['fairy_encounter', 'magical_herb_harvest']
            }
        },

        // === MINES - ore and danger ===
        mine: {
            name: 'Mine',
            icon: '⛏️',
            description: 'Tunnels rich with ore and peril',
            explorations: [
                'mine_dig_spot',
                'mine_abandoned_shaft',
                'mine_ore_vein',
                'mine_tool_cache',
                'cave_narrow_passage'
            ],
            locationSpecific: {
                iron_mines: ['iron_vein_discovery', 'miner_guild_work'],
                silver_mine: ['silver_vein_discovery', 'gem_pocket_search'],
                deep_mine: ['gold_vein_discovery', 'dangerous_deep_descent'],
                stone_quarry: ['stone_block_extraction', 'fossil_discovery']
            }
        },

        // === FORESTS - nature's bounty and beasts ===
        forest: {
            name: 'Forest',
            icon: '🌲',
            description: 'Woodlands full of herbs, timber, and wildlife',
            explorations: [
                'forest_hidden_grove',
                'forest_bandit_camp',
                'forest_herb_patch',
                'forest_animal_trail',
                'forest_timber_camp'
            ],
            locationSpecific: {
                ancient_forest: ['ancient_tree_discovery', 'forest_spirit_encounter'],
                whispering_woods: ['magical_herb_search', 'will_o_wisp_chase'],
                hunters_wood: ['big_game_hunt', 'trapper_cache'],
                hermit_grove: ['hermit_wisdom', 'rare_herb_collection'],
                druid_grove: ['druid_ritual_observation', 'sacred_plant_harvest']
            }
        },

        // === FARMS - agricultural abundance ===
        farm: {
            name: 'Farm',
            icon: '🌾',
            description: 'Cultivated lands with crops and livestock',
            explorations: [
                'farm_old_barn',
                'farm_well',
                'farm_crop_field',
                'farm_livestock_pen',
                'farm_windmill'
            ],
            locationSpecific: {
                wheat_farm: ['grain_mill_work', 'scarecrow_mystery'],
                eastern_farm: ['silk_worm_tending', 'tea_cultivation'],
                orchard_farm: ['fruit_picking', 'beehive_harvest'],
                sunny_farm: ['olive_pressing', 'grape_harvest']
            }
        },

        // === RUINS - ancient secrets ===
        ruins: {
            name: 'Ruins',
            icon: '🏛️',
            description: 'Crumbling remnants of ancient civilization',
            explorations: [
                'ruins_library',
                'ruins_throne_room',
                'ruins_hidden_vault',
                'dungeon_altar',
                'dungeon_chest'
            ],
            locationSpecific: {
                ruins_of_eldoria: ['elven_artifact_search', 'ancient_tome_recovery', 'archaeological_dig']
            }
        },

        // === CITIES - urban exploration ===
        city: {
            name: 'City',
            icon: '🏙️',
            description: 'Bustling urban centers with opportunities',
            explorations: [
                'town_market_stall',
                'town_back_alley',
                'town_tavern_rumors',
                'town_noble_district'
            ],
            locationSpecific: {
                jade_harbor: ['dock_work', 'exotic_goods_hunt', 'sailor_tales'],
                greendale: ['elder_morin_wisdom', 'market_day_deals'],
                silverkeep: ['jeweler_apprentice', 'noble_intrigue'],
                sunhaven: ['wine_tasting', 'fishmarket_bargains'],
                ironforge_city: ['smithy_work', 'weapon_appraisal', 'armor_fitting']
            }
        },

        // === CAPITAL - royal opportunities ===
        capital: {
            name: 'Royal Capital',
            icon: '👑',
            description: 'The seat of power with prestigious opportunities',
            explorations: [
                'town_market_stall',
                'town_back_alley',
                'town_noble_district',
                'capital_royal_audience',
                'capital_grand_market',
                'capital_banking_district'
            ],
            locationSpecific: {
                royal_capital: ['royal_merchant_license', 'noble_patronage', 'doom_artifact_exchange']
            }
        },

        // === VILLAGES - rural charm ===
        village: {
            name: 'Village',
            icon: '🏘️',
            description: 'Small settlements with local opportunities',
            explorations: [
                'town_market_stall',
                'village_elder_wisdom',
                'village_local_trade',
                'village_rumor_mill'
            ],
            locationSpecific: {
                frostholm_village: ['chieftain_blessing', 'fur_trading_post'],
                vineyard_village: ['wine_cellar_tour', 'grape_stomping'],
                darkwood_village: ['lumber_mill_work', 'woodcarving_lessons'],
                riverwood: ['boat_building', 'river_fishing'],
                hillcrest: ['shepherd_tales', 'wool_trading'],
                miners_rest: ['miner_tales', 'tool_repair']
            }
        },

        // === INNS - rest and rumors ===
        inn: {
            name: 'Inn',
            icon: '🏨',
            description: 'Places of rest with travelers and tales',
            explorations: [
                'inn_traveler_tales',
                'inn_gambling_den',
                'inn_back_room_deals',
                'town_tavern_rumors'
            ],
            locationSpecific: {
                kings_inn: ['bard_performance', 'noble_gossip'],
                silk_road_inn: ['caravan_news', 'exotic_merchant_meeting'],
                riverside_inn: ['fisherman_stories', 'river_guide'],
                mountain_pass_inn: ['mountain_guide_hire', 'avalanche_warnings'],
                shepherds_inn: ['pastoral_tales', 'wool_merchant'],
                lighthouse_inn: ['maritime_legends', 'shipwreck_maps'],
                hunting_lodge: ['trophy_trading', 'big_game_contracts']
            }
        },

        // === PORTS - maritime ventures ===
        port: {
            name: 'Port',
            icon: '⚓',
            description: 'Harbors with maritime opportunities',
            explorations: [
                'port_dock_work',
                'port_smuggler_contact',
                'port_ship_cargo_check',
                'port_sailor_recruitment'
            ],
            locationSpecific: {
                fishermans_port: ['fishing_expedition', 'pearl_merchant', 'net_mending'],
                smugglers_cove: ['contraband_deal', 'pirate_contact', 'boss_blackheart']
            }
        },

        // === OUTPOSTS - military and frontier ===
        outpost: {
            name: 'Outpost',
            icon: '🏰',
            description: 'Military posts guarding the frontier',
            explorations: [
                'outpost_guard_duty',
                'outpost_scout_report',
                'outpost_supply_run',
                'outpost_training_yard'
            ],
            locationSpecific: {
                northern_outpost: ['northern_patrol', 'frost_resistance_training'],
                western_watch: ['frontier_scouting', 'bandit_bounties'],
                winterwatch_outpost: ['arctic_survival', 'northern_trade_escort']
            }
        }
    },

    // quest-triggered explorations - only available when quest is active
    // format: questId -> exploration events unlocked
    QUEST_EXPLORATIONS: {
        // Act 1 quests
        'act1_quest1': ['greendale_first_steps'],
        'act1_quest2': ['market_investigation'],
        'act1_quest3': ['trade_route_survey'],
        'act1_quest5': ['harbor_warehouse_search'],

        // Act 2 quests
        'act2_quest1': ['ledger_investigation'],
        'act2_quest3': ['ironforge_conspiracy'],

        // Act 3 quests
        'act3_quest4': ['frost_cave_seal_search'],

        // Act 4 quests
        'act4_quest2': ['economic_warfare_sabotage'],

        // Act 5 quests
        'act5_quest3': ['malachar_confrontation'],

        // Side quest chains
        'greendale_vermin_2': ['rat_tunnel_investigation'],
        'ironforge_sabotage_1': ['forge_damage_assessment'],
        'sunhaven_smuggler_1': ['smuggler_cove_infiltration']
    },

    // NPC-unlocked explorations - specific NPCs unlock special exploration options
    // format: npcId -> { explorations: [...], requirement: optional condition }
    NPC_EXPLORATIONS: {
        // Merchants unlock trade-related explorations
        'traveling_merchant': { explorations: ['merchant_caravan_deals'], description: 'Trade secrets from the road' },
        'exotic_merchant': { explorations: ['exotic_goods_appraisal'], description: 'Rare goods identification' },

        // Guides unlock dangerous area explorations
        'mountain_guide': { explorations: ['guided_mountain_pass', 'avalanche_safe_route'], description: 'Safe passage through treacherous terrain' },
        'cave_guide': { explorations: ['guided_cave_expedition'], description: 'Expert navigation underground' },
        'forest_ranger': { explorations: ['ranger_tracking_lesson', 'wildlife_observation'], description: 'Learn the ways of the wild' },

        // Specialists unlock skill-based explorations
        'master_smith': { explorations: ['forge_apprenticeship', 'weapon_enhancement'], description: 'Smithing opportunities' },
        'alchemist': { explorations: ['alchemy_assistance', 'potion_ingredient_hunt'], description: 'Alchemical pursuits' },
        'herbalist': { explorations: ['herb_identification_training', 'rare_plant_search'], description: 'Botanical knowledge' },

        // Shady characters unlock illegal explorations
        'smuggler': { explorations: ['contraband_opportunity', 'smuggler_route_info'], description: 'Illicit dealings' },
        'fence': { explorations: ['stolen_goods_sale', 'theft_contract'], description: 'Black market access' },
        'pirate_captain': { explorations: ['pirate_treasure_map', 'coastal_raid'], description: 'Nautical villainy' },

        // Knowledge NPCs unlock lore explorations
        'scholar': { explorations: ['ancient_text_study', 'historical_research'], description: 'Academic pursuits' },
        'librarian': { explorations: ['archive_deep_dive', 'rare_manuscript_search'], description: 'Library secrets' },
        'sage': { explorations: ['prophecy_interpretation', 'magical_lore_study'], description: 'Mystical knowledge' },

        // Military NPCs unlock combat explorations
        'guard_captain': { explorations: ['patrol_duty', 'bounty_hunting'], description: 'Military service' },
        'veteran_soldier': { explorations: ['combat_training', 'war_stories'], description: 'Battle experience' },
        'mercenary': { explorations: ['mercenary_contract', 'dangerous_escort'], description: 'Sword for hire work' }
    },

    // Quest NPCs that unlock special one-time explorations when active
    QUEST_NPC_EXPLORATIONS: {
        'elder_morin': { quest: 'act1_quest1', explorations: ['greendale_elder_guidance'] },
        'harbormaster_vex': { quest: 'act1_quest5', explorations: ['harbor_manifest_search'] },
        'master_ironhand': { quest: 'act2_quest3', explorations: ['ironforge_saboteur_hunt'] },
        'lord_ashworth': { quest: 'act4_quest2', explorations: ['noble_conspiracy_intel'] },
        'boatman': { quest: null, explorations: ['doom_world_passage'] } // always available at boatman
    },

    // exploration cooldowns by type (in game minutes)
    EXPLORATION_COOLDOWNS: {
        default: 60,           // 1 hour default
        dungeon: 120,          // 2 hours for dungeons
        cave: 90,              // 1.5 hours for caves
        mine: 120,             // 2 hours for mines (hard work!)
        forest: 45,            // 45 min for forests
        farm: 30,              // 30 min for farms
        ruins: 120,            // 2 hours for ruins
        city: 30,              // 30 min for cities
        capital: 30,           // 30 min for capital
        village: 45,           // 45 min for villages
        inn: 60,               // 1 hour for inns
        port: 60,              // 1 hour for ports
        outpost: 90            // 1.5 hours for outposts
    },

    // location-specific loot tables - weighted by rarity
    // uses ONLY items from DungeonExplorationSystem.EXPLORATION_LOOT
    LOCATION_LOOT_TABLES: {
        // Dungeons - dark artifacts and ancient treasures
        dungeon: {
            common: ['ancient_coin', 'dusty_tome', 'bone_fragment', 'rusted_medallion'],
            uncommon: ['skull_goblet', 'obsidian_shard', 'ancient_seal', 'silver_candelabra'],
            rare: ['void_crystal', 'demon_tooth', 'cursed_mirror', 'spirit_lantern'],
            epic: ['lich_phylactery_fragment', 'shadow_cloak_remnant', 'blood_ruby'],
            legendary: ['tear_of_eternity', 'world_shard']
        },

        // Caves - crystals, mushrooms, underground treasures
        cave: {
            common: ['ancient_coin', 'cave_mushroom', 'bone_fragment'],
            uncommon: ['obsidian_shard', 'ancient_seal'],
            rare: ['void_crystal', 'spirit_lantern'],
            epic: ['blood_ruby'],
            legendary: ['tear_of_eternity']
        },

        // Mines - ore, gems, miner relics
        mine: {
            common: ['ancient_coin', 'rusted_medallion', 'bone_fragment'],
            uncommon: ['obsidian_shard', 'silver_candelabra'],
            rare: ['void_crystal', 'dragon_scale'],
            epic: ['blood_ruby', 'ancient_crown'],
            legendary: ['world_shard']
        },

        // Forests - natural items, hidden caches
        forest: {
            common: ['ancient_coin', 'cave_mushroom', 'bone_fragment'],
            uncommon: ['enchanted_quill', 'ancient_seal'],
            rare: ['demon_tooth', 'spirit_lantern'],
            epic: ['shadow_cloak_remnant'],
            legendary: ['tear_of_eternity']
        },

        // Farms - simple finds, hidden valuables
        farm: {
            common: ['ancient_coin', 'rusted_medallion'],
            uncommon: ['ancient_seal', 'enchanted_quill'],
            rare: ['spirit_lantern'],
            epic: [],
            legendary: []
        },

        // Ruins - scholarly artifacts, ancient history
        ruins: {
            common: ['ancient_coin', 'dusty_tome', 'rusted_medallion'],
            uncommon: ['ancient_seal', 'enchanted_quill', 'silver_candelabra'],
            rare: ['cursed_mirror', 'void_crystal'],
            epic: ['ancient_crown', 'lich_phylactery_fragment'],
            legendary: ['world_shard', 'tear_of_eternity']
        },

        // Cities - trade goods, urban treasures
        city: {
            common: ['ancient_coin', 'rusted_medallion'],
            uncommon: ['enchanted_quill', 'silver_candelabra'],
            rare: ['cursed_mirror'],
            epic: ['ancient_crown'],
            legendary: []
        },

        // Capital - noble artifacts, political relics
        capital: {
            common: ['ancient_coin', 'dusty_tome'],
            uncommon: ['ancient_seal', 'enchanted_quill', 'silver_candelabra'],
            rare: ['cursed_mirror', 'spirit_lantern'],
            epic: ['ancient_crown', 'shadow_cloak_remnant'],
            legendary: ['tear_of_eternity']
        },

        // Villages - simple rural finds
        village: {
            common: ['ancient_coin', 'rusted_medallion'],
            uncommon: ['ancient_seal'],
            rare: [],
            epic: [],
            legendary: []
        },

        // Inns - traveler leavings, hidden stashes
        inn: {
            common: ['ancient_coin', 'dusty_tome', 'rusted_medallion'],
            uncommon: ['enchanted_quill', 'ancient_seal'],
            rare: ['spirit_lantern'],
            epic: [],
            legendary: []
        },

        // Ports - maritime treasures, smuggled goods
        port: {
            common: ['ancient_coin', 'rusted_medallion'],
            uncommon: ['skull_goblet', 'ancient_seal'],
            rare: ['cursed_mirror', 'demon_tooth'],
            epic: ['blood_ruby'],
            legendary: ['world_shard']
        },

        // Outposts - military relics, frontier finds
        outpost: {
            common: ['ancient_coin', 'rusted_medallion', 'bone_fragment'],
            uncommon: ['ancient_seal', 'obsidian_shard'],
            rare: ['demon_tooth'],
            epic: ['shadow_cloak_remnant'],
            legendary: []
        },

        // DOOM WORLD - corrupted treasures, darker finds
        // Higher chance for rare/epic items but more dangerous
        doom_dungeon: {
            common: ['bone_fragment', 'ancient_coin'],
            uncommon: ['skull_goblet', 'obsidian_shard', 'demon_tooth'],
            rare: ['void_crystal', 'demon_tooth', 'cursed_mirror'],
            epic: ['lich_phylactery_fragment', 'shadow_cloak_remnant', 'blood_ruby'],
            legendary: ['tear_of_eternity', 'world_shard']
        },
        doom_cave: {
            common: ['bone_fragment', 'cave_mushroom'],
            uncommon: ['obsidian_shard', 'skull_goblet'],
            rare: ['void_crystal', 'demon_tooth'],
            epic: ['blood_ruby', 'lich_phylactery_fragment'],
            legendary: ['world_shard']
        },
        doom_ruins: {
            common: ['bone_fragment', 'dusty_tome'],
            uncommon: ['skull_goblet', 'ancient_seal', 'obsidian_shard'],
            rare: ['void_crystal', 'cursed_mirror', 'spirit_lantern'],
            epic: ['ancient_crown', 'lich_phylactery_fragment', 'shadow_cloak_remnant'],
            legendary: ['world_shard', 'tear_of_eternity']
        },
        doom_city: {
            common: ['ancient_coin', 'bone_fragment'],
            uncommon: ['skull_goblet', 'obsidian_shard'],
            rare: ['demon_tooth', 'cursed_mirror'],
            epic: ['shadow_cloak_remnant', 'blood_ruby'],
            legendary: ['tear_of_eternity']
        }
    },

    // get loot for a location type with weighted rarity
    // Automatically uses doom_ prefix tables when in doom world
    getLootForLocationType(locationType, difficultyMultiplier = 1) {
        // Check if we're in doom world - use doom-specific loot tables
        const inDoomWorld = typeof game !== 'undefined' && game.inDoomWorld;
        let tableKey = locationType;

        if (inDoomWorld) {
            // Try doom-specific table first (doom_dungeon, doom_cave, etc)
            const doomKey = `doom_${locationType}`;
            if (this.LOCATION_LOOT_TABLES[doomKey]) {
                tableKey = doomKey;
            }
        }

        const table = this.LOCATION_LOOT_TABLES[tableKey];
        if (!table) return 'ancient_coin'; // fallback

        // weighted rarity selection based on difficulty
        const roll = Math.random() * 100 * difficultyMultiplier;
        let rarity;
        if (roll >= 98) rarity = 'legendary';
        else if (roll >= 90) rarity = 'epic';
        else if (roll >= 70) rarity = 'rare';
        else if (roll >= 40) rarity = 'uncommon';
        else rarity = 'common';

        // get items for that rarity, fall back to lower if empty
        let items = table[rarity] || [];
        if (items.length === 0) items = table.rare || [];
        if (items.length === 0) items = table.uncommon || [];
        if (items.length === 0) items = table.common || [];

        // random item from the pool
        return items[Math.floor(Math.random() * items.length)] || 'ancient_coin';
    },

    // exploration requirements (tool, skill level, etc)
    EXPLORATION_REQUIREMENTS: {
        // Mining explorations
        mine_dig_spot: { tool: 'pickaxe', minSkill: { mining: 1 } },
        mine_abandoned_shaft: { tool: 'pickaxe', minSkill: { mining: 3 } },
        mine_ore_vein: { tool: 'pickaxe', minSkill: { mining: 2 } },
        mine_tool_cache: { tool: 'torch' },

        // Forest explorations
        forest_timber_harvest: { tool: 'axe', minSkill: { woodcutting: 1 } },
        forest_timber_camp: { tool: 'axe' },
        forest_herb_patch: { minSkill: { herbalism: 1 } },
        forest_animal_trail: { tool: 'rope' },

        // Cave explorations
        cave_narrow_passage: { minStats: { agility: 3 } },
        cave_underground_river: { tool: 'rope', minStats: { strength: 3 } },
        cave_crystal_chamber: { tool: 'pickaxe', tool2: 'torch' },

        // Dungeon explorations
        dungeon_skeleton_hoard: { minStats: { strength: 5 }, minLevel: 5 },
        dungeon_altar: { minStats: { intelligence: 3 } },
        dungeon_well: { tool: 'rope' },

        // Ruins explorations
        ruins_hidden_vault: { minStats: { intelligence: 4 } },
        ruins_library: { minStats: { intelligence: 3 } },

        // Social explorations
        capital_royal_audience: { minRank: 'merchant', minReputation: 20 },
        port_smuggler_contact: { minReputation: -10 },  // need bad rep for smugglers!
        inn_gambling_den: { minGold: 50 },

        // NPC GUIDE REQUIREMENTS - dangerous explorations that need a guide
        guided_mountain_pass: { requiresNPC: 'mountain_guide', npcDescription: 'Hire a mountain guide at the inn' },
        guided_cave_expedition: { requiresNPC: 'cave_guide', npcDescription: 'Find a cave guide to lead you' },
        avalanche_safe_route: { requiresNPC: 'mountain_guide', npcDescription: 'Only a guide knows the safe paths' },

        // Boss encounters - high requirements
        boss_malachar: { minLevel: 15, minStats: { strength: 8, intelligence: 6 }, requiresExplorationCount: 8 },
        boss_grimfang: { minLevel: 10, minStats: { strength: 7 }, requiresExplorationCount: 4 },
        boss_frost_lord: { minLevel: 12, minStats: { strength: 6, endurance: 5 }, requiresExplorationCount: 6 },
        boss_dragon: { minLevel: 20, minStats: { strength: 10, endurance: 8 }, requiresExplorationCount: 10 },

        // Doom world explorations - high danger
        doom_portal_activation: { minLevel: 10, minStats: { intelligence: 5 }, requiresBossDefeated: true },
        doom_return_portal: { minGold: 100 } // costs gold to return
    },

    // helper methods

    // get all available explorations for a location
    getExplorationsForLocation(locationId, locationType) {
        const typeConfig = this.LOCATION_EXPLORATIONS[locationType];
        if (!typeConfig) {
            console.warn(`No exploration config for location type: ${locationType}`);
            return [];
        }

        // start with base explorations for this type
        let explorations = [...(typeConfig.explorations || [])];

        // add location-specific ones if they exist
        if (typeConfig.locationSpecific && typeConfig.locationSpecific[locationId]) {
            explorations = explorations.concat(typeConfig.locationSpecific[locationId]);
        }

        return explorations;
    },

    // get quest-unlocked explorations for current active quests
    getQuestExplorations(activeQuestIds) {
        let questExplorations = [];
        for (const questId of activeQuestIds) {
            if (this.QUEST_EXPLORATIONS[questId]) {
                questExplorations = questExplorations.concat(this.QUEST_EXPLORATIONS[questId]);
            }
        }
        return questExplorations;
    },

    // check if player meets requirements for an exploration
    canDoExploration(explorationId, player, locationId = null) {
        const req = this.EXPLORATION_REQUIREMENTS[explorationId];
        if (!req) return { canDo: true, reason: null };

        // check tool (supports tool and tool2 for multiple requirements)
        if (req.tool) {
            const hasTool = player.inventory?.some(item =>
                item.id === req.tool || item.id?.includes(req.tool)
            );
            if (!hasTool) {
                return { canDo: false, reason: `Requires ${req.tool}` };
            }
        }
        if (req.tool2) {
            const hasTool2 = player.inventory?.some(item =>
                item.id === req.tool2 || item.id?.includes(req.tool2)
            );
            if (!hasTool2) {
                return { canDo: false, reason: `Also requires ${req.tool2}` };
            }
        }

        // check skill
        if (req.minSkill) {
            for (const [skill, level] of Object.entries(req.minSkill)) {
                if ((player.skills?.[skill] || 0) < level) {
                    return { canDo: false, reason: `Requires ${skill} level ${level}` };
                }
            }
        }

        // check stats
        if (req.minStats) {
            for (const [stat, value] of Object.entries(req.minStats)) {
                if ((player.attributes?.[stat] || player.stats?.[stat] || 0) < value) {
                    return { canDo: false, reason: `Requires ${stat} ${value}` };
                }
            }
        }

        // check level
        if (req.minLevel && (player.level || 1) < req.minLevel) {
            return { canDo: false, reason: `Requires level ${req.minLevel}` };
        }

        // check gold
        if (req.minGold && (player.gold || 0) < req.minGold) {
            return { canDo: false, reason: `Requires ${req.minGold} gold` };
        }

        // check rank
        if (req.minRank) {
            const rankOrder = ['vagrant', 'peddler', 'hawker', 'trader', 'merchant', 'magnate', 'tycoon', 'baron', 'mogul', 'royal_merchant'];
            const playerRankIndex = rankOrder.indexOf(player.rank?.toLowerCase() || 'vagrant');
            const requiredRankIndex = rankOrder.indexOf(req.minRank.toLowerCase());
            if (playerRankIndex < requiredRankIndex) {
                return { canDo: false, reason: `Requires ${req.minRank} rank` };
            }
        }

        // check reputation
        if (req.minReputation !== undefined) {
            const playerRep = player.reputation || 0;
            if (req.minReputation >= 0 && playerRep < req.minReputation) {
                return { canDo: false, reason: `Requires reputation ${req.minReputation}+` };
            }
            if (req.minReputation < 0 && playerRep > req.minReputation) {
                return { canDo: false, reason: `Requires reputation ${req.minReputation} or lower` };
            }
        }

        // check NPC guide requirement
        if (req.requiresNPC) {
            // Check if the required NPC is at the current location
            let npcPresent = false;
            if (locationId && typeof GameWorld !== 'undefined') {
                const locationNPCs = GameWorld.locations?.[locationId]?.npcs || [];
                npcPresent = locationNPCs.includes(req.requiresNPC);
            }
            if (!npcPresent) {
                return { canDo: false, reason: req.npcDescription || `Requires ${req.requiresNPC.replace(/_/g, ' ')}` };
            }
        }

        // check exploration count requirement (for bosses)
        if (req.requiresExplorationCount) {
            // Get completed exploration count for this location
            let explorationCount = 0;
            if (typeof ExplorationPanel !== 'undefined' && locationId) {
                const completed = ExplorationPanel.completedExplorations?.[locationId] || [];
                explorationCount = completed.length;
            }
            if (explorationCount < req.requiresExplorationCount) {
                return { canDo: false, reason: `Complete ${req.requiresExplorationCount} explorations first (${explorationCount}/${req.requiresExplorationCount})` };
            }
        }

        // check boss defeated requirement (for doom portal)
        if (req.requiresBossDefeated) {
            let bossDefeated = false;
            if (typeof game !== 'undefined' && game.player?.defeatedBosses?.length > 0) {
                bossDefeated = true;
            }
            if (!bossDefeated) {
                return { canDo: false, reason: 'Defeat a boss first' };
            }
        }

        return { canDo: true, reason: null };
    },

    // get cooldown for a location type
    getCooldown(locationType) {
        return this.EXPLORATION_COOLDOWNS[locationType] || this.EXPLORATION_COOLDOWNS.default;
    },

    // Get NPC-unlocked explorations for a location based on present NPCs
    getNPCExplorations(locationId) {
        const npcExplorations = [];

        // Get NPCs at this location
        let locationNPCs = [];
        if (typeof GameWorld !== 'undefined' && GameWorld.locations?.[locationId]?.npcs) {
            locationNPCs = GameWorld.locations[locationId].npcs;
        }

        // Check each NPC for unlocked explorations
        for (const npcId of locationNPCs) {
            const npcConfig = this.NPC_EXPLORATIONS[npcId];
            if (npcConfig && npcConfig.explorations) {
                npcExplorations.push(...npcConfig.explorations.map(exp => ({
                    id: exp,
                    source: 'npc',
                    npcId: npcId,
                    description: npcConfig.description
                })));
            }

            // Check quest-specific NPC explorations
            const questNpcConfig = this.QUEST_NPC_EXPLORATIONS[npcId];
            if (questNpcConfig) {
                // If no quest requirement or quest is active, add explorations
                const questActive = !questNpcConfig.quest ||
                    (typeof QuestSystem !== 'undefined' && QuestSystem.hasActiveQuest?.(questNpcConfig.quest));
                if (questActive) {
                    npcExplorations.push(...questNpcConfig.explorations.map(exp => ({
                        id: exp,
                        source: 'quest_npc',
                        npcId: npcId,
                        questId: questNpcConfig.quest
                    })));
                }
            }
        }

        return npcExplorations;
    },

    // Get all explorations for a location including NPC-based ones
    getAllExplorationsForLocation(locationId, locationType) {
        // Get base location explorations
        const baseExplorations = this.getExplorationsForLocation(locationId, locationType);

        // Get NPC-unlocked explorations
        const npcExplorations = this.getNPCExplorations(locationId);

        // Combine without duplicates
        const allExplorations = [...baseExplorations];
        for (const npcExp of npcExplorations) {
            if (!allExplorations.includes(npcExp.id)) {
                allExplorations.push(npcExp.id);
            }
        }

        return allExplorations;
    },

    // Exploration cost scaling by difficulty (for balance)
    EXPLORATION_COSTS: {
        // Health costs by difficulty tier
        healthCosts: {
            safe: { min: 0, max: 5 },
            easy: { min: 2, max: 10 },
            medium: { min: 5, max: 20 },
            hard: { min: 10, max: 35 },
            deadly: { min: 20, max: 50 }
        },
        // Stamina costs by difficulty
        staminaCosts: {
            safe: { min: 5, max: 10 },
            easy: { min: 10, max: 20 },
            medium: { min: 15, max: 30 },
            hard: { min: 25, max: 45 },
            deadly: { min: 35, max: 60 }
        },
        // Gold costs (optional entry fees)
        goldCosts: {
            safe: 0,
            easy: 0,
            medium: 5,
            hard: 15,
            deadly: 30
        }
    },

    // Reward scaling vs gathering - explorations should be higher risk/reward
    EXPLORATION_VS_GATHERING: {
        // Exploration rewards ~2x gathering but with health/stamina cost
        // Gathering: slow, safe, predictable
        // Exploration: fast, risky, variable
        rewardMultiplier: 2.0,      // exploration gives 2x value vs same-time gathering
        riskMultiplier: 1.5,        // but costs 1.5x more health/stamina
        cooldownPenalty: 1.2        // and 20% longer cooldowns than gathering
    },

    // Get balanced costs for an exploration based on its difficulty
    getBalancedCosts(explorationId, locationType) {
        // Default to medium difficulty
        let difficulty = 'medium';

        // Check if exploration has defined difficulty in EXPLORATION_EVENTS
        if (typeof DungeonExplorationSystem !== 'undefined') {
            const eventData = DungeonExplorationSystem.EXPLORATION_EVENTS?.[explorationId];
            if (eventData?.difficulty) {
                difficulty = eventData.difficulty;
            }
        }

        // Location type modifiers
        const dangerousTypes = ['dungeon', 'cave', 'mine', 'ruins'];
        const safeTypes = ['farm', 'village', 'inn'];

        if (dangerousTypes.includes(locationType) && difficulty === 'medium') {
            difficulty = 'hard';
        } else if (safeTypes.includes(locationType) && difficulty === 'medium') {
            difficulty = 'easy';
        }

        return {
            health: this.EXPLORATION_COSTS.healthCosts[difficulty] || this.EXPLORATION_COSTS.healthCosts.medium,
            stamina: this.EXPLORATION_COSTS.staminaCosts[difficulty] || this.EXPLORATION_COSTS.staminaCosts.medium,
            gold: this.EXPLORATION_COSTS.goldCosts[difficulty] || 0,
            difficulty: difficulty
        };
    }
};

// expose globally
if (typeof window !== 'undefined') {
    window.ExplorationConfig = ExplorationConfig;
}

console.log('Exploration config loaded - ready to guide the lost souls');
