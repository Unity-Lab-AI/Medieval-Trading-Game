// 
// COMBAT SYSTEM - when words fail, blades speak
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const CombatSystem = {
    // 
    // UTILITIES - Security first, bitches
    // 

    // Sanitize enemy names or get XSS fucked - security before blood
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    // 
    // CONFIGURATION
    //
    config: {
        baseDamage: 10,
        baseDefense: 5,
        critChance: 0.1,
        critMultiplier: 2.0,
        fleeChance: 0.6,
        minDamage: 1,
        maxRounds: 20,
        // boss fights need extended rounds or your weak ass will time out before the kill
        bossMaxRounds: 75
    },

    // The current bloodbath - who's dying right now
    activeCombat: null,
    combatLog: [],
    isProcessingAction: false, // Lock this shit - one murder at a time

    // 
    // ENEMY DEFINITIONS
    // 
    enemies: {
        // Common enemies
        bandit: {
            id: 'bandit',
            name: 'Bandit',
            icon: '🗡️',
            health: 30,
            attack: 8,
            defense: 3,
            speed: 5,
            goldDrop: { min: 5, max: 25 },
            loot: ['rusty_sword', 'leather_scraps', 'bandages'],
            xpReward: 15
        },
        wolf: {
            id: 'wolf',
            name: 'Wild Wolf',
            icon: '🐺',
            health: 25,
            attack: 10,
            defense: 2,
            speed: 8,
            goldDrop: { min: 0, max: 5 },
            loot: ['wolf_pelt', 'bone_fragment', 'raw_meat'],
            xpReward: 10
        },
        thief: {
            id: 'thief',
            name: 'Thief',
            icon: '🥷',
            health: 20,
            attack: 6,
            defense: 4,
            speed: 10,
            goldDrop: { min: 10, max: 50 },
            loot: ['lockpick', 'dagger', 'stolen_goods'],
            xpReward: 12
        },
        skeleton: {
            id: 'skeleton',
            name: 'Skeleton Warrior',
            icon: '💀',
            health: 35,
            attack: 12,
            defense: 5,
            speed: 4,
            goldDrop: { min: 0, max: 15 },
            loot: ['bone_fragment', 'rusted_medallion', 'ancient_coin'],
            xpReward: 20
        },
        goblin: {
            id: 'goblin',
            name: 'Goblin',
            icon: '👺',
            health: 15,
            attack: 5,
            defense: 2,
            speed: 7,
            goldDrop: { min: 3, max: 12 },
            loot: ['goblin_ear', 'crude_dagger', 'shiny_rock'],
            xpReward: 8
        },
        // Stronger enemies
        orc: {
            id: 'orc',
            name: 'Orc Warrior',
            icon: '👹',
            health: 60,
            attack: 18,
            defense: 8,
            speed: 4,
            goldDrop: { min: 20, max: 60 },
            loot: ['orc_tooth', 'crude_axe', 'iron_ore'],
            xpReward: 35
        },
        ghost: {
            id: 'ghost',
            name: 'Vengeful Spirit',
            icon: '👻',
            health: 40,
            attack: 15,
            defense: 0, // Can't be defended against
            speed: 12,
            goldDrop: { min: 0, max: 0 },
            loot: ['ectoplasm', 'spirit_essence', 'cursed_mirror'],
            xpReward: 30,
            special: 'phasing' // Ignores some defense
        },
        troll: {
            id: 'troll',
            name: 'Cave Troll',
            icon: '🧌',
            health: 100,
            attack: 25,
            defense: 15,
            speed: 2,
            goldDrop: { min: 30, max: 100 },
            loot: ['troll_hide', 'giant_club', 'troll_blood'],
            xpReward: 60,
            special: 'regeneration' // Heals each turn
        },
        dragon_wyrmling: {
            id: 'dragon_wyrmling',
            name: 'Dragon Wyrmling',
            icon: '🐉',
            health: 80,
            attack: 30,
            defense: 12,
            speed: 6,
            goldDrop: { min: 100, max: 300 },
            loot: ['dragon_scale', 'dragon_tooth', 'fire_essence'],
            xpReward: 100,
            special: 'firebreath'
        },

        // ═══════════════════════════════════════════════════════════════
        // QUEST ENEMIES - these bastards are tied to specific missions
        // ═══════════════════════════════════════════════════════════════

        // Greendale vermin quest chain
        giant_rat: {
            id: 'giant_rat',
            name: 'Giant Rat',
            icon: '🐀',
            health: 15,
            attack: 5,
            defense: 1,
            speed: 6,
            goldDrop: { min: 0, max: 3 },
            loot: ['rat_tail', 'raw_meat'],
            xpReward: 5
        },
        rat_king: {
            id: 'rat_king',
            name: 'Rat King',
            icon: '👑🐀',
            health: 80,
            attack: 20,
            defense: 8,
            speed: 5,
            goldDrop: { min: 30, max: 80 },
            loot: ['rat_king_tail', 'rat_crown', 'ancient_coin'],
            xpReward: 60,
            special: 'summon_rats',
            isBoss: true
        },

        // Sunhaven pirate quest chain
        pirate: {
            id: 'pirate',
            name: 'Pirate',
            icon: '🏴‍☠️',
            health: 55,
            attack: 17,
            defense: 6,
            speed: 7,
            goldDrop: { min: 30, max: 90 },
            loot: ['pirate_bandana', 'cutlass', 'rum'],
            xpReward: 35
        },
        pirate_scout: {
            id: 'pirate_scout',
            name: 'Pirate Scout',
            icon: '🔭',
            health: 45,
            attack: 14,
            defense: 5,
            speed: 8,
            goldDrop: { min: 20, max: 50 },
            loot: ['pirate_bandana', 'spyglass'],
            xpReward: 25
        },
        captain_blacktide: {
            id: 'captain_blacktide',
            name: 'Captain Blacktide',
            icon: '☠️',
            health: 200,
            attack: 28,
            defense: 12,
            speed: 7,
            goldDrop: { min: 150, max: 400 },
            loot: ['blacktide_cutlass', 'pirate_coat', 'treasure_map'],
            xpReward: 120,
            special: 'pistol_shot',
            isBoss: true
        },

        // Ironforge quest chain
        cave_spider: {
            id: 'cave_spider',
            name: 'Cave Spider',
            icon: '🕷️',
            health: 30,
            attack: 12,
            defense: 3,
            speed: 9,
            goldDrop: { min: 0, max: 10 },
            loot: ['spider_silk', 'venom_sac'],
            xpReward: 18
        },
        rock_beetle: {
            id: 'rock_beetle',
            name: 'Rock Beetle',
            icon: '🪲',
            health: 40,
            attack: 8,
            defense: 12,
            speed: 2,
            goldDrop: { min: 0, max: 8 },
            loot: ['chitin_shell', 'rock_fragment'],
            xpReward: 15
        },
        crimson_anvil_thug: {
            id: 'crimson_anvil_thug',
            name: 'Crimson Anvil Thug',
            icon: '🔨',
            health: 50,
            attack: 16,
            defense: 7,
            speed: 6,
            goldDrop: { min: 20, max: 60 },
            loot: ['iron_bar', 'guild_emblem'],
            xpReward: 30
        },
        crimson_anvil_survivor: {
            id: 'crimson_anvil_survivor',
            name: 'Crimson Anvil Survivor',
            icon: '⚒️',
            health: 40,
            attack: 14,
            defense: 6,
            speed: 7,
            goldDrop: { min: 15, max: 45 },
            loot: ['iron_bar'],
            xpReward: 25
        },
        guildmaster_crimson: {
            id: 'guildmaster_crimson',
            name: 'Guildmaster Crimson',
            icon: '🔥⚒️',
            health: 250,
            attack: 32,
            defense: 14,
            speed: 5,
            goldDrop: { min: 200, max: 500 },
            loot: ['crimson_anvil_hammer', 'guild_charter', 'masterwork_ore'],
            xpReward: 150,
            special: 'hammer_slam',
            isBoss: true
        },

        // Jade smugglers quest chain
        smuggler_thug: {
            id: 'smuggler_thug',
            name: 'Smuggler Thug',
            icon: '🗡️',
            health: 42,
            attack: 13,
            defense: 5,
            speed: 7,
            goldDrop: { min: 25, max: 70 },
            loot: ['contraband', 'smuggler_coin'],
            xpReward: 22
        },
        smuggler_guard: {
            id: 'smuggler_guard',
            name: 'Smuggler Guard',
            icon: '🛡️🗡️',
            health: 55,
            attack: 15,
            defense: 8,
            speed: 6,
            goldDrop: { min: 30, max: 80 },
            loot: ['contraband', 'guard_key'],
            xpReward: 28
        },
        smuggler: {
            id: 'smuggler',
            name: 'Smuggler',
            icon: '🏴‍☠️',
            health: 48,
            attack: 14,
            defense: 6,
            speed: 7,
            goldDrop: { min: 35, max: 90 },
            loot: ['contraband', 'stolen_goods'],
            xpReward: 25
        },
        kingpin_shadow: {
            id: 'kingpin_shadow',
            name: 'Kingpin Shadow',
            icon: '👤🗡️',
            health: 200,
            attack: 28,
            defense: 14,
            speed: 6,
            goldDrop: { min: 300, max: 700 },
            loot: ['shadow_blade', 'kingpin_ring', 'vault_key'],
            xpReward: 120,
            special: 'backstab',
            isBoss: true
        },

        // Royal capital crime quests
        street_thief: {
            id: 'street_thief',
            name: 'Street Thief',
            icon: '🏃',
            health: 25,
            attack: 8,
            defense: 3,
            speed: 12,
            goldDrop: { min: 10, max: 30 },
            loot: ['stolen_purse', 'lockpick'],
            xpReward: 12
        },
        assassin: {
            id: 'assassin',
            name: 'Assassin',
            icon: '🗡️🌑',
            health: 65,
            attack: 25,
            defense: 8,
            speed: 11,
            goldDrop: { min: 50, max: 150 },
            loot: ['poison_vial', 'assassin_blade', 'dark_hood'],
            xpReward: 55,
            special: 'poison_strike'
        },
        master_assassin: {
            id: 'master_assassin',
            name: 'Master Assassin',
            icon: '💀🗡️',
            health: 150,
            attack: 38,
            defense: 12,
            speed: 10,
            goldDrop: { min: 200, max: 500 },
            loot: ['master_blade', 'assassin_contract', 'shadow_cloak'],
            xpReward: 110,
            special: 'death_mark'
        },

        // Northern wolf quests
        winter_wolf: {
            id: 'winter_wolf',
            name: 'Winter Wolf',
            icon: '🐺❄️',
            health: 45,
            attack: 16,
            defense: 6,
            speed: 9,
            goldDrop: { min: 15, max: 40 },
            loot: ['wolf_pelt', 'wolf_fang'],
            xpReward: 20
        },
        alpha_wolf: {
            id: 'alpha_wolf',
            name: 'Alpha Wolf',
            icon: '🐺👑',
            health: 100,
            attack: 24,
            defense: 10,
            speed: 8,
            goldDrop: { min: 60, max: 150 },
            loot: ['alpha_pelt', 'alpha_fang', 'beast_heart'],
            xpReward: 65,
            special: 'howl',
            isBoss: true
        },

        // Bandit quests
        road_bandit: {
            id: 'road_bandit',
            name: 'Road Bandit',
            icon: '🏴',
            health: 38,
            attack: 12,
            defense: 5,
            speed: 7,
            goldDrop: { min: 20, max: 50 },
            loot: ['stolen_goods', 'bandit_mask'],
            xpReward: 18
        },
        bandit_chief_redhawk: {
            id: 'bandit_chief_redhawk',
            name: 'Chief Redhawk',
            icon: '🦅🏴',
            health: 180,
            attack: 26,
            defense: 12,
            speed: 7,
            goldDrop: { min: 200, max: 500 },
            loot: ['redhawk_blade', 'bandit_treasury', 'chief_medallion'],
            xpReward: 100,
            special: 'rallying_cry',
            isBoss: true
        },

        // Doom World lieutenants
        shadow_lieutenant_frost: {
            id: 'shadow_lieutenant_frost',
            name: 'Frost Lieutenant',
            icon: '❄️💀',
            health: 220,
            attack: 34,
            defense: 18,
            speed: 5,
            goldDrop: { min: 250, max: 600 },
            loot: ['frozen_shadow_crystal', 'frost_command_insignia'],
            xpReward: 140,
            special: 'frost_shadow'
        },
        shadow_lieutenant_forge: {
            id: 'shadow_lieutenant_forge',
            name: 'Forge Lieutenant',
            icon: '🔥💀',
            health: 240,
            attack: 32,
            defense: 20,
            speed: 4,
            goldDrop: { min: 250, max: 600 },
            loot: ['burning_shadow_crystal', 'forge_command_insignia'],
            xpReward: 140,
            special: 'shadow_flame'
        },

        // Frostholm quest chain
        frost_elemental: {
            id: 'frost_elemental',
            name: 'Frost Elemental',
            icon: '❄️',
            health: 90,
            attack: 20,
            defense: 15,
            speed: 3,
            goldDrop: { min: 50, max: 150 },
            loot: ['ice_shard', 'frozen_core'],
            xpReward: 70,
            special: 'frost_aura'
        },
        frost_lord: {
            id: 'frost_lord',
            name: 'Frost Lord',
            icon: '🥶👑',
            health: 180,
            attack: 28,
            defense: 16,
            speed: 4,
            goldDrop: { min: 150, max: 400 },
            loot: ['frozen_heart', 'ice_crown', 'frost_blade'],
            xpReward: 130,
            special: 'ice_breath',
            isBoss: true
        },

        // ═══════════════════════════════════════════════════════════════
        // TUTORIAL ENEMIES - Baby's first punching bags
        // These exist so noobs can learn to fight without dying
        // ═══════════════════════════════════════════════════════════════

        tutorial_dummy: {
            id: 'tutorial_dummy',
            name: 'Training Dummy',
            icon: '🎯',
            health: 30,
            attack: 2,
            defense: 0,
            speed: 1,
            goldDrop: { min: 0, max: 0 },
            loot: [],
            xpReward: 10,
            isTutorial: true
        },
        tutorial_fighter: {
            id: 'tutorial_fighter',
            name: 'Sparring Partner',
            icon: '🥊',
            health: 50,
            attack: 8,
            defense: 5,
            speed: 5,
            goldDrop: { min: 0, max: 0 },
            loot: [],
            xpReward: 25,
            isTutorial: true
        },
        tutorial_brute: {
            id: 'tutorial_brute',
            name: 'Arena Brute',
            icon: '💪',
            health: 80,
            attack: 15,
            defense: 3,
            speed: 3,
            goldDrop: { min: 10, max: 10 },
            loot: [],
            xpReward: 40,
            isTutorial: true
        },
        tutorial_boss: {
            id: 'tutorial_boss',
            name: 'Bandit Chief',
            icon: '🏴‍☠️',
            health: 120,
            attack: 18,
            defense: 8,
            speed: 6,
            goldDrop: { min: 50, max: 50 },
            loot: ['iron_sword', 'leather_armor', 'health_potion'],
            xpReward: 100,
            special: 'rallying_cry',
            isBoss: true,
            isTutorial: true
        },

        // ═══════════════════════════════════════════════════════════════
        // DUNGEON BOSSES - the big bastards that guard the good shit
        // ═══════════════════════════════════════════════════════════════

        malachar: {
            id: 'malachar',
            name: 'Malachar the Dark',
            icon: '🌑',
            health: 300,
            attack: 45,
            defense: 20,
            speed: 4,
            goldDrop: { min: 500, max: 1000 },
            loot: ['shadow_essence', 'dark_crystal', 'malachars_robe'],
            xpReward: 250,
            special: 'shadow_blast',
            isBoss: true
        },
        grimfang: {
            id: 'grimfang',
            name: 'Grimfang the Alpha',
            icon: '🐺💀',
            health: 150,
            attack: 30,
            defense: 12,
            speed: 9,
            goldDrop: { min: 100, max: 300 },
            loot: ['alpha_pelt', 'fang_necklace', 'beast_heart'],
            xpReward: 100,
            special: 'pack_howl',
            isBoss: true
        },
        scorathax: {
            id: 'scorathax',
            name: 'Scorathax the Ancient',
            icon: '🐲',
            health: 350,
            attack: 50,
            defense: 25,
            speed: 5,
            goldDrop: { min: 800, max: 1500 },
            loot: ['dragon_scale', 'ancient_fang', 'dragon_heart'],
            xpReward: 300,
            special: 'inferno',
            isBoss: true
        },
        blackheart: {
            id: 'blackheart',
            name: 'Captain Blackheart',
            icon: '💀🏴‍☠️',
            health: 220,
            attack: 30,
            defense: 13,
            speed: 6,
            goldDrop: { min: 200, max: 500 },
            loot: ['blackheart_saber', 'pirate_treasure', 'cursed_compass'],
            xpReward: 140,
            special: 'cutlass_fury',
            isBoss: true
        },

        // ═══════════════════════════════════════════════════════════════
        // DOOM WORLD ENEMIES - shadow realm nightmares that want you dead
        // ═══════════════════════════════════════════════════════════════

        shadow_guard: {
            id: 'shadow_guard',
            name: 'Shadow Guard',
            icon: '🛡️🌑',
            health: 70,
            attack: 20,
            defense: 10,
            speed: 6,
            goldDrop: { min: 40, max: 100 },
            loot: ['shadow_essence', 'corrupted_blade'],
            xpReward: 50
        },
        shadow_elite: {
            id: 'shadow_elite',
            name: 'Shadow Elite',
            icon: '⚔️🌑',
            health: 90,
            attack: 25,
            defense: 12,
            speed: 7,
            goldDrop: { min: 60, max: 150 },
            loot: ['shadow_essence', 'elite_insignia', 'dark_steel'],
            xpReward: 65
        },
        shadow_lieutenant: {
            id: 'shadow_lieutenant',
            name: 'Shadow Lieutenant',
            icon: '👁️🌑',
            health: 200,
            attack: 35,
            defense: 15,
            speed: 6,
            goldDrop: { min: 150, max: 350 },
            loot: ['shadow_blade', 'lieutenant_badge', 'void_crystal'],
            xpReward: 120,
            special: 'shadow_strike',
            isBoss: true
        },
        cellar_horror: {
            id: 'cellar_horror',
            name: 'Cellar Horror',
            icon: '👁️‍🗨️',
            health: 80,
            attack: 18,
            defense: 8,
            speed: 4,
            goldDrop: { min: 20, max: 60 },
            loot: ['horror_ichor', 'twisted_bone'],
            xpReward: 45
        },
        plague_horror: {
            id: 'plague_horror',
            name: 'Plague Horror',
            icon: '☠️🦠',
            health: 120,
            attack: 24,
            defense: 10,
            speed: 3,
            goldDrop: { min: 40, max: 100 },
            loot: ['plague_sample', 'corrupted_flesh', 'antidote'],
            xpReward: 70,
            special: 'plague_breath'
        },
        cache_guardian: {
            id: 'cache_guardian',
            name: 'Cache Guardian',
            icon: '🗿',
            health: 180,
            attack: 30,
            defense: 14,
            speed: 2,
            goldDrop: { min: 100, max: 300 },
            loot: ['guardian_core', 'ancient_gold', 'relic_fragment'],
            xpReward: 100,
            special: 'treasure_shield',
            isBoss: true
        },
        greedy_won: {
            id: 'greedy_won',
            name: 'Greedy Won',
            icon: '💰👑',
            health: 500,
            attack: 50,
            defense: 25,
            speed: 4,
            goldDrop: { min: 1000, max: 2500 },
            loot: ['crown_of_greed', 'endless_purse', 'golden_heart'],
            xpReward: 500,
            special: 'gold_beam',
            isBoss: true
        },

        // ═══════════════════════════════════════════════════════════════
        // ADDITIONAL ENEMIES - fill the roster with more things to murder
        // ═══════════════════════════════════════════════════════════════

        dark_lord: {
            id: 'dark_lord',
            name: 'The Dark Lord',
            icon: '👑🌑',
            health: 800,
            attack: 75,
            defense: 40,
            speed: 6,
            goldDrop: { min: 2000, max: 5000 },
            loot: ['dark_crown', 'shadow_blade', 'soul_gem', 'dark_lord_armor'],
            xpReward: 1000,
            special: 'doom_aura',
            isBoss: true
        },
        bandit_chief: {
            id: 'bandit_chief',
            name: 'Bandit Chief',
            icon: '🏴👑',
            health: 160,
            attack: 24,
            defense: 11,
            speed: 7,
            goldDrop: { min: 180, max: 450 },
            loot: ['bandit_crown', 'chief_blade', 'stolen_treasury'],
            xpReward: 90,
            special: 'rally_bandits',
            isBoss: true
        },
        dragon: {
            id: 'dragon',
            name: 'Ancient Dragon',
            icon: '🐉',
            health: 400,
            attack: 55,
            defense: 30,
            speed: 5,
            goldDrop: { min: 1000, max: 2500 },
            loot: ['dragon_scale', 'dragon_heart', 'dragon_treasure', 'ancient_fang'],
            xpReward: 350,
            special: 'inferno_breath',
            isBoss: true
        },
        necromancer: {
            id: 'necromancer',
            name: 'Necromancer',
            icon: '💀🧙',
            health: 120,
            attack: 28,
            defense: 8,
            speed: 5,
            goldDrop: { min: 80, max: 200 },
            loot: ['dark_staff', 'skull_goblet', 'necrotic_essence', 'spell_tome'],
            xpReward: 80,
            special: 'summon_undead',
            isBoss: true
        },
        goblin_king: {
            id: 'goblin_king',
            name: 'Goblin King',
            icon: '👺👑',
            health: 180,
            attack: 22,
            defense: 12,
            speed: 6,
            goldDrop: { min: 200, max: 500 },
            loot: ['goblin_crown', 'goblin_scepter', 'hoard_gold', 'goblin_ears'],
            xpReward: 100,
            special: 'goblin_swarm',
            isBoss: true
        },
        captured_bandit: {
            id: 'captured_bandit',
            name: 'Captured Bandit',
            icon: '⛓️',
            health: 20,
            attack: 2,
            defense: 1,
            speed: 2,
            goldDrop: { min: 0, max: 5 },
            loot: ['rope', 'torn_cloth'],
            xpReward: 5,
            special: 'surrender',
            nonHostile: true
        },
        pirate_ship: {
            id: 'pirate_ship',
            name: 'Pirate Ship',
            icon: '🏴‍☠️⛵',
            health: 500,
            attack: 40,
            defense: 30,
            speed: 3,
            goldDrop: { min: 500, max: 1500 },
            loot: ['ship_cargo', 'pirate_flag', 'cannon_parts', 'treasure_map'],
            xpReward: 200,
            special: 'broadside',
            isVehicle: true,
            isBoss: true
        },

        // ═══════════════════════════════════════════════════════════════
        // MORE QUEST ENEMIES - because quests need killable targets
        // ═══════════════════════════════════════════════════════════════

        city_guard: {
            id: 'city_guard',
            name: 'City Guard',
            icon: '🛡️⚔️',
            health: 60,
            attack: 16,
            defense: 10,
            speed: 5,
            goldDrop: { min: 15, max: 45 },
            loot: ['guard_badge', 'standard_sword', 'city_rations'],
            xpReward: 30,
            special: 'backup_call'
        },
        corrupted_archdruid: {
            id: 'corrupted_archdruid',
            name: 'Corrupted Archdruid',
            icon: '🌳💀',
            health: 280,
            attack: 38,
            defense: 18,
            speed: 5,
            goldDrop: { min: 200, max: 600 },
            loot: ['corrupted_staff', 'dark_acorns', 'druid_tome', 'nature_essence'],
            xpReward: 160,
            special: 'nature_corruption',
            isBoss: true
        },
        shadow_king: {
            id: 'shadow_king',
            name: 'The Shadow King',
            icon: '👑🌑',
            health: 600,
            attack: 60,
            defense: 35,
            speed: 5,
            goldDrop: { min: 1500, max: 4000 },
            loot: ['shadow_crown', 'kings_blade', 'void_crystal', 'realm_key'],
            xpReward: 800,
            special: 'shadow_domain',
            isBoss: true
        }
    },

    // 
    // INITIALIZATION
    // 
    init() {
        console.log('CombatSystem: Ready for battle!');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Hook into violence triggers - death calls from everywhere
        if (typeof EventBus !== 'undefined') {
            EventBus.on('encounter-combat', (data) => this.startCombat(data));
            EventBus.on('robbery-resist', (data) => this.startRobberyDefense(data));
        }
    },

    // 
    // PLAYER STATS CALCULATION
    // 
    getPlayerCombatStats() {
        const player = game?.player;
        if (!player) return { attack: 10, defense: 5, health: 100, speed: 5 };

        let attack = this.config.baseDamage;
        let defense = this.config.baseDefense;
        let speed = 5;

        // Strength makes you hit harder - simple fucking math
        if (player.attributes) {
            attack += (player.attributes.strength || 0) * 2;
            defense += (player.attributes.endurance || 0);
            speed += (player.attributes.agility || 0);
        }

        // Armor and weapons make the difference between living and bleeding out
        if (player.equipment && typeof EquipmentSystem !== 'undefined') {
            const bonuses = EquipmentSystem.getTotalBonuses?.() || {};
            attack += bonuses.attack || 0;
            defense += bonuses.defense || 0;
            speed += bonuses.speed || 0;
        }

        // Practice makes you lethal - every fight teaches
        if (player.skills?.combat) {
            attack += Math.floor(player.skills.combat / 10);
            defense += Math.floor(player.skills.combat / 20);
        }

        return {
            attack: Math.max(1, attack),
            defense: Math.max(0, defense),
            health: player.stats?.health || 100,
            maxHealth: player.stats?.maxHealth || 100,
            speed: Math.max(1, speed)
        };
    },

    // 
    // COMBAT INITIATION
    // 
    startCombat(options) {
        const enemyId = options.enemyId || 'bandit';

        // Use NPCCombatStats for location and difficulty scaling when available
        // Falls back to local enemy definitions if NPCCombatStats doesn't have this enemy
        let enemy = null;
        const currentLocation = game?.currentLocation?.id || 'greendale';

        if (typeof NPCCombatStats !== 'undefined' && NPCCombatStats.BASE_STATS[enemyId]) {
            // Use NPCCombatStats for proper scaling
            const scaledStats = NPCCombatStats.getStats(enemyId, currentLocation);
            enemy = {
                id: enemyId,
                name: this.enemies[enemyId]?.name || enemyId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: this.enemies[enemyId]?.icon || '👹',
                health: scaledStats.health,
                attack: scaledStats.attack,
                defense: scaledStats.defense,
                speed: scaledStats.speed,
                goldDrop: scaledStats.goldDrop,
                loot: this.enemies[enemyId]?.loot || [],
                xpReward: scaledStats.xpReward,
                special: scaledStats.specialAbility || this.enemies[enemyId]?.special,
                category: options.category || (scaledStats.tier >= 4 ? 'boss' : 'enemy'),
                isBoss: options.isBoss || scaledStats.tier >= 4
            };
            console.log(`⚔️ Enemy ${enemyId} stats from NPCCombatStats (location: ${currentLocation})`);
        } else {
            // Fallback to local enemy definitions
            enemy = this.enemies[enemyId];
        }

        if (!enemy) {
            console.error(`Unknown enemy: ${enemyId}`);
            return null;
        }

        // Make the enemy match your level - fair fights or brutal ones
        const scaledEnemy = this.scaleEnemy(enemy, options.level || 1);

        this.activeCombat = {
            enemy: { ...scaledEnemy, currentHealth: scaledEnemy.health },
            player: this.getPlayerCombatStats(),
            round: 0,
            state: 'active',
            options: options
        };

        this.combatLog = [];
        this.addCombatLog(`Combat begins! You face a ${scaledEnemy.name}!`);

        // Throw up the battle screen - time to fucking fight
        this.showCombatUI();

        return this.activeCombat;
    },

    scaleEnemy(enemy, level) {
        const scaleFactor = 1 + (level - 1) * 0.15;
        return {
            ...enemy,
            health: Math.round(enemy.health * scaleFactor),
            attack: Math.round(enemy.attack * scaleFactor),
            defense: Math.round(enemy.defense * scaleFactor),
            goldDrop: {
                min: Math.round(enemy.goldDrop.min * scaleFactor),
                max: Math.round(enemy.goldDrop.max * scaleFactor)
            },
            xpReward: Math.round(enemy.xpReward * scaleFactor)
        };
    },

    // 
    // COMBAT ACTIONS
    // 
    playerAttack() {
        // Lock check - no button spamming you impatient fuck
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;
        if (this.isProcessingAction) return; // Already swinging, calm down
        this.isProcessingAction = true;

        const combat = this.activeCombat;
        combat.round++;

        // Swing your weapon - steel meets flesh
        const playerDamage = this.calculateDamage(
            combat.player.attack,
            combat.enemy.defense,
            combat.enemy.special === 'phasing'
        );

        combat.enemy.currentHealth -= playerDamage.damage;

        if (playerDamage.crit) {
            this.addCombatLog(`💥 CRITICAL HIT! You deal ${playerDamage.damage} damage!`);
        } else {
            this.addCombatLog(`You attack for ${playerDamage.damage} damage.`);
        }

        // Did you kill it? Check the corpse
        if (combat.enemy.currentHealth <= 0) {
            this.victory();
            return;
        }

        // Still breathing? Now it's their turn to hurt you
        this.enemyTurn();
    },

    playerDefend() {
        // Lock check - you can't defend twice at once
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;
        if (this.isProcessingAction) return; // Shield's already up
        this.isProcessingAction = true;

        const combat = this.activeCombat;
        combat.round++;

        // Turtle up - temporarily double your armor
        const originalDefense = combat.player.defense;
        combat.player.defense *= 2;

        this.addCombatLog(`🛡️ You raise your guard, doubling your defense!`);

        // Emit defend action for quest tracking
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat:action', { action: 'defend', round: combat.round });
        }
        document.dispatchEvent(new CustomEvent('combat-action', {
            detail: { action: 'defend', round: combat.round }
        }));

        // Let the enemy take their swing while you hide
        this.enemyTurn();

        // Defense bonus fades - back to normal armor
        combat.player.defense = originalDefense;
    },

    playerFlee() {
        // Lock check - you're either running or you're not
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;
        if (this.isProcessingAction) return; // Already booking it
        this.isProcessingAction = true;

        const combat = this.activeCombat;

        // Run like hell - faster than them means better odds
        let fleeChance = this.config.fleeChance;
        const speedDiff = combat.player.speed - combat.enemy.speed;
        fleeChance += speedDiff * 0.05;
        fleeChance = Math.max(0.2, Math.min(0.9, fleeChance));

        if (Math.random() < fleeChance) {
            this.addCombatLog(`🏃 You successfully flee from combat!`);
            this.endCombat('fled');
        } else {
            this.addCombatLog(`You failed to escape!`);
            // They catch you - now you eat a free hit for being a coward
            this.enemyTurn();
        }
    },

    useItem(itemId) {
        // Lock check - chug one healing potion at a time
        if (!this.activeCombat || this.activeCombat.state !== 'active') return;
        if (this.isProcessingAction) return; // Already drinking
        this.isProcessingAction = true;

        const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
        // Invalid item? Unlock and bail - don't softlock the player
        if (!item || !item.consumable) {
            this.isProcessingAction = false;
            return;
        }

        // Consume the fucking thing - pray it helps
        const hasItem = typeof PlayerStateManager !== 'undefined'
            ? PlayerStateManager.inventory.has(itemId)
            : (game.player.inventory[itemId] > 0);

        if (hasItem) {
            const effects = item.effects || {};

            if (effects.health) {
                const healed = Math.min(effects.health,
                    this.activeCombat.player.maxHealth - game.player.stats.health);

                // Apply healing through PlayerStateManager if available
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.add('health', healed, 'combat_consumable');
                } else {
                    game.player.stats.health += healed;
                }
                this.activeCombat.player.health = game.player.stats.health;
                this.addCombatLog(`🧪 You use ${item.name} and heal ${healed} HP!`);
            }

            // Remove consumed item from inventory
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.inventory.remove(itemId, 1, 'combat_consumable');
            } else {
                game.player.inventory[itemId]--;
                const newTotal = game.player.inventory[itemId] || 0;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }

                // EventBus fallback
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('inventory:item:removed', {
                        itemId: itemId,
                        quantity: 1,
                        newTotal: newTotal,
                        reason: 'combat_consumable'
                    });
                }
            }

            // Emit use item action for quest tracking
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('combat:action', { action: 'use_item', itemId, itemName: item.name });
            }
            document.dispatchEvent(new CustomEvent('combat-action', {
                detail: { action: 'use_item', itemId, itemName: item.name }
            }));

            this.updateCombatUI();
        }

        // CRITICAL FIX: Reset action lock so player can take another action
        // Without this, player is softlocked after using ANY item in combat
        this.isProcessingAction = false;
    },

    //
    // ENEMY AI
    // 
    enemyTurn() {
        const combat = this.activeCombat;
        if (!combat || combat.state !== 'active') return;

        // Some monsters heal - because fuck you that's why
        if (combat.enemy.special === 'regeneration') {
            const heal = Math.round(combat.enemy.health * 0.05);
            combat.enemy.currentHealth = Math.min(
                combat.enemy.health,
                combat.enemy.currentHealth + heal
            );
            this.addCombatLog(`🩹 The ${combat.enemy.name} regenerates ${heal} HP!`);
        }

        // Pick a target - you or your companions bleed
        const aliveCompanions = combat.player.companions?.filter(c => c.health > 0) || [];
        const alivePartyMembers = aliveCompanions.length + 1; // +1 for player

        let target = 'player';
        let targetName = game.player?.name || 'You';
        let targetDefense = combat.player.defense;

        // Coin flip: attack you or attack your friends
        if (aliveCompanions.length > 0 && Math.random() < 0.5) {
            const randomCompanion = aliveCompanions[Math.floor(Math.random() * aliveCompanions.length)];
            target = randomCompanion.id;
            targetName = randomCompanion.name;
            targetDefense = Math.floor(combat.player.defense / 2) + (randomCompanion.defense || 0);
        }

        const enemyDamage = this.calculateDamage(
            combat.enemy.attack,
            targetDefense,
            false
        );

        // Damage lands - somebody bleeds
        if (target === 'player') {
            game.player.stats.health -= enemyDamage.damage;
            combat.player.health = game.player.stats.health;
        } else {
            // Your companion takes the hit - they're bleeding for you
            if (typeof CompanionSystem !== 'undefined') {
                const companion = CompanionSystem.getCompanion(target);
                if (companion) {
                    companion.health = Math.max(0, companion.health - enemyDamage.damage);

                    // Companion death - someone you trusted just died for you
                    if (companion.health <= 0) {
                        this.addCombatLog(`💀 ${companion.name} has fallen in battle!`);
                    }

                    // Companion died? Recalc stats - you just got weaker
                    combat.player = this.getPlayerCombatStats();
                }
            }
        }

        if (enemyDamage.crit) {
            this.addCombatLog(`💀 ${combat.enemy.name} lands a CRITICAL HIT on ${targetName} for ${enemyDamage.damage} damage!`);
        } else {
            this.addCombatLog(`🔪 ${combat.enemy.name} attacks ${targetName} for ${enemyDamage.damage} damage.`);
        }

        // Are you dead yet? Check your pulse
        if (game.player.stats.health <= 0) {
            game.player.stats.health = 0;
            this.defeat();
            return;
        }

        // Refresh the battle display with fresh blood
        this.updateCombatUI();

        // Fight dragging on? Boss fights get more rounds because they have way more fucking HP
        const isBoss = combat.enemy.category === 'boss' || combat.enemy.isBoss;
        const maxRounds = isBoss ? this.config.bossMaxRounds : this.config.maxRounds;
        if (combat.round >= maxRounds) {
            this.addCombatLog(`The battle drags on... both combatants retreat.`);
            this.endCombat('draw');
        }

        // Unlock action - your turn again, make it count
        this.isProcessingAction = false;
    },

    // 
    // DAMAGE CALCULATION
    // 
    calculateDamage(attack, defense, ignoreDefense = false) {
        // Roll the damage dice - chaos makes it real
        let damage = attack * (0.8 + Math.random() * 0.4);

        // Armor reduces pain (unless you're fighting ghosts)
        if (!ignoreDefense) {
            const reduction = defense / (defense + 20); // Diminishing returns
            damage *= (1 - reduction);
        }

        // Critical strike - when luck meets violence
        const crit = Math.random() < this.config.critChance;
        if (crit) {
            damage *= this.config.critMultiplier;
        }

        damage = Math.max(this.config.minDamage, Math.round(damage));

        return { damage, crit };
    },

    // 
    // COMBAT RESOLUTION
    // 
    victory() {
        const combat = this.activeCombat;
        combat.state = 'victory';

        // Enemy is dead - fucking DEAD
        combat.enemy.currentHealth = 0;

        this.addCombatLog(`🏆 Victory! You defeated the ${combat.enemy.name}!`);
        this.addCombatLog(`❤️ Enemy health: 0 / ${combat.enemy.health}`);
        this.addCombatLog(`❤️ Your health: ${combat.player.health} / ${combat.player.maxHealth}`);

        // Loot the corpse - violence pays in gold
        const goldReward = Math.floor(
            combat.enemy.goldDrop.min +
            Math.random() * (combat.enemy.goldDrop.max - combat.enemy.goldDrop.min)
        );

        if (goldReward > 0) {
            game.player.gold += goldReward;
            this.addCombatLog(`💰 You found ${goldReward} gold!`);
        }

        // Every kill makes you stronger - learn from blood
        if (combat.enemy.xpReward && game.player.experience !== undefined) {
            game.player.experience += combat.enemy.xpReward;
            this.addCombatLog(`✨ Gained ${combat.enemy.xpReward} XP!`);

            // Did you level up? Growth through slaughter
            if (typeof checkLevelUp === 'function') {
                checkLevelUp();
            }
        }

        // Every fight makes you better at fighting - learn through violence
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.skills.improve('combat', 1, 'combat_victory');
        } else if (game.player.skills) {
            game.player.skills.combat = (game.player.skills.combat || 0) + 1;
        }

        // Check the body for treasure - dead enemies drop shit
        if (combat.enemy.loot && combat.enemy.loot.length > 0) {
            // Coin flip for each item - RNG is cruel
            combat.enemy.loot.forEach(itemId => {
                if (Math.random() < 0.5) {
                    // Add loot to inventory through PlayerStateManager if available
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.inventory.add(itemId, 1, 'combat_loot');
                    } else {
                        if (!game.player.inventory[itemId]) {
                            game.player.inventory[itemId] = 0;
                        }
                        game.player.inventory[itemId]++;
                        const newTotal = game.player.inventory[itemId];

                        // EventBus fallback
                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('inventory:item:added', {
                                itemId: itemId,
                                quantity: 1,
                                newTotal: newTotal,
                                reason: 'combat_loot'
                            });
                        }
                    }

                    // Alert the quest system - loot counts for objectives
                    document.dispatchEvent(new CustomEvent('item-received', {
                        detail: { item: itemId, quantity: 1, source: 'combat_loot' }
                    }));
                    const item = typeof ItemDatabase !== 'undefined' ?
                        ItemDatabase.getItem(itemId) : { name: itemId };
                    this.addCombatLog(`📦 Looted: ${item?.name || itemId}`);
                }
            });
        }

        // Broadcast the kill - quests need to know you murdered this thing
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('enemy-defeated', {
                enemyType: combat.enemy.id,
                enemyName: combat.enemy.name,
                count: 1
            });
        }

        // Legacy event broadcast - backwards compatibility for old code
        document.dispatchEvent(new CustomEvent('enemy-defeated', {
            detail: { enemyType: combat.enemy.id, count: 1 }
        }));

        // Boss kill tracking - when gatekeepers die, new areas unlock
        const bossIds = ['grimfang', 'scorathax', 'malachar', 'dark_lord', 'bandit_chief',
                        'frost_lord', 'rat_king', 'captain_blacktide', 'guildmaster_crimson',
                        'blackheart', 'shadow_lieutenant', 'greedy_won', 'cache_guardian',
                        'alpha_wolf', 'goblin_king', 'necromancer', 'dragon', 'pirate_ship',
                        'bandit_chief_redhawk', 'shadow_lieutenant_frost', 'shadow_lieutenant_forge'];
        if (bossIds.includes(combat.enemy.id)) {
            if (!game.player.defeatedBosses) {
                game.player.defeatedBosses = [];
            }
            if (!game.player.defeatedBosses.includes(combat.enemy.id)) {
                game.player.defeatedBosses.push(combat.enemy.id);
                this.addCombatLog(`💀 BOSS SLAIN: ${combat.enemy.name}!`);
                addMessage(`⚔️ You have defeated ${combat.enemy.name}! New areas may now be accessible.`);
                console.log('💀 Boss defeated and tracked:', combat.enemy.id, 'Total bosses killed:', game.player.defeatedBosses);

                // Emit boss-specific event for quests and achievements
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('boss-defeated', {
                        bossId: combat.enemy.id,
                        bossName: combat.enemy.name,
                        totalDefeated: game.player.defeatedBosses.length
                    });
                }
            }
        }

        // Did this kill unlock anything? Check achievements
        if (typeof AchievementSystem !== 'undefined') {
            AchievementSystem.checkAchievement?.('first_blood');
            AchievementSystem.incrementStat?.('enemies_defeated', 1);
        }

        this.updateCombatUI();
        this.showVictoryUI();
    },

    defeat() {
        const combat = this.activeCombat;
        combat.state = 'defeat';

        // You're fucking dead - zero health, zero hope
        game.player.stats.health = 0;
        combat.player.health = 0;

        this.addCombatLog(`💀 Defeat! The ${combat.enemy.name} has bested you!`);
        this.addCombatLog(`❤️ Your health: 0 / ${combat.player.maxHealth}`);

        // Broadcast your death - the world needs to know you failed
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat-defeat', { enemy: combat.enemy.id });
        }

        // Show your corpse on screen - death needs display
        this.updateCombatUI();
        this.showDefeatUI();
    },

    endCombat(result) {
        // Unlock the action system - combat's over
        this.isProcessingAction = false;

        if (this.activeCombat) {
            this.activeCombat.state = result;
        }

        // Refresh the stat display with your battered body
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }

        // Did you die? Trigger the death sequence
        const playerDied = result === 'defeat' && game.player.stats.health <= 0;

        // Wait a beat, then close - let the result sink in
        setTimeout(() => {
            this.closeCombatUI();
            this.activeCombat = null;

            // Unpause the world - time flows again
            if (typeof TimeSystem !== 'undefined' && TimeSystem.isPaused) {
                TimeSystem.resume();
            }

            // Player died? Check for tutorial respawn or trigger game over
            if (playerDied) {
                // Tutorial mode: respawn instead of game over
                const inTutorial = typeof TutorialManager !== 'undefined' && TutorialManager.isActive;
                const respawnOnDeath = inTutorial && TutorialManager.config?.respawnOnDeath !== false;

                if (respawnOnDeath) {
                    // Tutorial respawn - heal and try again
                    game.player.stats.health = Math.floor((game.player.stats.maxHealth || 100) * 0.5);
                    if (typeof addMessage === 'function') {
                        addMessage('💫 You were knocked out but recovered! The training master patched you up.');
                    }
                    if (typeof updatePlayerStats === 'function') {
                        updatePlayerStats();
                    }
                    // Emit event for quest tracking
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('tutorial:respawn', { reason: 'combat_defeat' });
                    }
                    console.log('🎓 Tutorial respawn triggered - player healed to 50%');
                } else {
                    // Mark cause of death - slain in battle
                    if (typeof DeathCauseSystem !== 'undefined') {
                        DeathCauseSystem.recordCause('combat', 'slain in combat');
                    }
                    // Roll credits on your failure
                    if (typeof handlePlayerDeath === 'function') {
                        handlePlayerDeath('slain in combat');
                    } else if (typeof GameOverSystem !== 'undefined') {
                        GameOverSystem.triggerGameOver('slain in combat');
                    }
                }
            }
        }, 2000);
    },

    // 
    // COMBAT UI
    // 
    showCombatUI() {
        // Clear any old battle UI first - fresh canvas
        const existing = document.getElementById('combat-overlay');
        if (existing) existing.remove();

        const combat = this.activeCombat;

        const overlay = document.createElement('div');
        overlay.id = 'combat-overlay';
        overlay.innerHTML = `
            <div class="combat-container">
                <div class="combat-header">
                    <h2>Combat!</h2>
                    <span class="combat-round">Round ${combat.round}</span>
                </div>

                <div class="combat-arena">
                    <div class="combatant player-side">
                        <div class="combatant-icon">🧑‍🦱</div>
                        <div class="combatant-name">${game.player?.name || 'You'}</div>
                        <div class="health-bar">
                            <div class="health-fill player-health" style="width: ${(combat.player.health / combat.player.maxHealth) * 100}%"></div>
                        </div>
                        <div class="health-text">${combat.player.health} / ${combat.player.maxHealth} HP</div>
                        <div class="combatant-stats">
                            <span>${combat.player.attack}</span>
                            <span>🛡️ ${combat.player.defense}</span>
                        </div>
                    </div>

                    <div class="combat-vs">VS</div>

                    <div class="combatant enemy-side">
                        <div class="combatant-icon">${combat.enemy.icon}</div>
                        <div class="combatant-name">${combat.enemy.name}</div>
                        <div class="health-bar">
                            <div class="health-fill enemy-health" style="width: ${(combat.enemy.currentHealth / combat.enemy.health) * 100}%"></div>
                        </div>
                        <div class="health-text">${combat.enemy.currentHealth} / ${combat.enemy.health} HP</div>
                        <div class="combatant-stats">
                            <span>${combat.enemy.attack}</span>
                            <span>🛡️ ${combat.enemy.defense}</span>
                        </div>
                    </div>
                </div>

                <div class="combat-log" id="combat-log-display">
                    ${this.combatLog.map(msg => `<div class="log-entry">${this.escapeHtml(msg)}</div>`).join('')}
                </div>

                <div class="combat-actions" id="combat-actions">
                    <button class="combat-btn attack-btn" onclick="CombatSystem.playerAttack()">Attack</button>
                    <button class="combat-btn defend-btn" onclick="CombatSystem.playerDefend()">🛡️ Defend</button>
                    <button class="combat-btn flee-btn" onclick="CombatSystem.playerFlee()">🏃 Flee</button>
                    <button class="combat-btn item-btn" onclick="CombatSystem.showItemMenu()">🧪 Items</button>
                </div>
            </div>
        `;

        // Add styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 900; /* Z-INDEX STANDARD: Critical overlays (combat) */
        `;

        // Load the battle styles - make it pretty (and deadly)
        this.injectCombatStyles();

        document.body.appendChild(overlay);

        // Freeze time - the world stops when you fight
        if (typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('PAUSED');
        }
    },

    updateCombatUI() {
        const combat = this.activeCombat;
        if (!combat) return;

        // Refresh all the battle stats - show the carnage
        const playerHealth = document.querySelector('.player-health');
        const enemyHealth = document.querySelector('.enemy-health');
        const playerText = document.querySelector('.player-side .health-text');
        const enemyText = document.querySelector('.enemy-side .health-text');
        const roundText = document.querySelector('.combat-round');

        if (playerHealth) {
            playerHealth.style.width = `${(combat.player.health / combat.player.maxHealth) * 100}%`;
        }
        if (enemyHealth) {
            enemyHealth.style.width = `${(combat.enemy.currentHealth / combat.enemy.health) * 100}%`;
        }
        if (playerText) {
            playerText.textContent = `${combat.player.health} / ${combat.player.maxHealth} HP`;
        }
        if (enemyText) {
            enemyText.textContent = `${combat.enemy.currentHealth} / ${combat.enemy.health} HP`;
        }
        if (roundText) {
            roundText.textContent = `Round ${combat.round}`;
        }

        // Refresh the battle log - sanitize to prevent XSS bullshit
        const logDisplay = document.getElementById('combat-log-display');
        if (logDisplay) {
            logDisplay.innerHTML = this.combatLog.map(msg =>
                `<div class="log-entry">${this.escapeHtml(msg)}</div>`
            ).join('');
            logDisplay.scrollTop = logDisplay.scrollHeight;
        }
    },

    showVictoryUI() {
        const actions = document.getElementById('combat-actions');
        if (actions) {
            actions.innerHTML = `
                <div class="victory-message">🏆 VICTORY!</div>
                <button class="combat-btn" onclick="CombatSystem.endCombat('victory')">Continue</button>
            `;
        }
    },

    showDefeatUI() {
        const actions = document.getElementById('combat-actions');
        if (actions) {
            actions.innerHTML = `
                <div class="defeat-message">💀 DEFEAT</div>
                <button class="combat-btn" onclick="CombatSystem.endCombat('defeat')">Continue</button>
            `;
        }
    },

    showItemMenu() {
        // Display potions and shit you can chug mid-battle
        const consumables = [];

        // get inventory via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        for (const [itemId, qty] of Object.entries(inventory)) {
            if (qty <= 0) continue;
            const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
            if (item?.consumable && item.effects?.health) {
                consumables.push({ itemId, item, qty });
            }
        }

        if (consumables.length === 0) {
            this.addCombatLog('No usable items!');
            this.updateCombatUI();
            return;
        }

        const actions = document.getElementById('combat-actions');
        if (actions) {
            let html = '<div class="item-menu">';
            consumables.forEach(({ itemId, item, qty }) => {
                html += `<button class="combat-btn item-use-btn" onclick="CombatSystem.useItem('${itemId}')">${item.icon || '🧪'} ${item.name} (${qty})</button>`;
            });
            html += `<button class="combat-btn back-btn" onclick="CombatSystem.updateCombatUI(); CombatSystem.restoreActions()">Back</button>`;
            html += '</div>';
            actions.innerHTML = html;
        }
    },

    restoreActions() {
        const actions = document.getElementById('combat-actions');
        if (actions && this.activeCombat?.state === 'active') {
            actions.innerHTML = `
                <button class="combat-btn attack-btn" onclick="CombatSystem.playerAttack()">Attack</button>
                <button class="combat-btn defend-btn" onclick="CombatSystem.playerDefend()">🛡️ Defend</button>
                <button class="combat-btn flee-btn" onclick="CombatSystem.playerFlee()">🏃 Flee</button>
                <button class="combat-btn item-btn" onclick="CombatSystem.showItemMenu()">🧪 Items</button>
            `;
        }
    },

    closeCombatUI() {
        const overlay = document.getElementById('combat-overlay');
        if (overlay) overlay.remove();
    },

    addCombatLog(message) {
        this.combatLog.push(message);
        // Only keep recent history - old blood doesn't matter
        if (this.combatLog.length > 10) {
            this.combatLog.shift();
        }
    },

    injectCombatStyles() {
        if (document.getElementById('combat-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'combat-system-styles';
        style.textContent = `
            .combat-container {
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid rgba(79, 195, 247, 0.5);
                border-radius: 12px;
                padding: 20px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 0 50px rgba(79, 195, 247, 0.3);
            }
            .combat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            }
            .combat-header h2 {
                margin: 0;
                color: #ff6b6b;
            }
            .combat-round {
                color: #4fc3f7;
                font-size: 14px;
            }
            .combat-arena {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            .combatant {
                flex: 1;
                text-align: center;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            .combatant-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            .combatant-name {
                color: #fff;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .health-bar {
                height: 12px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            .health-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            .player-health {
                background: linear-gradient(90deg, #4caf50, #8bc34a);
            }
            .enemy-health {
                background: linear-gradient(90deg, #f44336, #ff5722);
            }
            .health-text {
                color: #888;
                font-size: 12px;
            }
            .combatant-stats {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 10px;
                color: #aaa;
                font-size: 13px;
            }
            .combat-vs {
                font-size: 24px;
                font-weight: bold;
                color: #ff6b6b;
            }
            .combat-log {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 20px;
                max-height: 120px;
                overflow-y: auto;
            }
            .log-entry {
                color: #ddd;
                font-size: 13px;
                padding: 3px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .log-entry:last-child {
                border-bottom: none;
            }
            .combat-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .combat-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.2s;
            }
            .attack-btn {
                background: linear-gradient(180deg, #f44336, #c62828);
                color: white;
            }
            .defend-btn {
                background: linear-gradient(180deg, #2196f3, #1565c0);
                color: white;
            }
            .flee-btn {
                background: linear-gradient(180deg, #ff9800, #e65100);
                color: white;
            }
            .item-btn {
                background: linear-gradient(180deg, #4caf50, #2e7d32);
                color: white;
            }
            .combat-btn:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
            }
            .victory-message {
                color: #4caf50;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .defeat-message {
                color: #f44336;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .item-menu {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }
            .item-use-btn {
                background: linear-gradient(180deg, #9c27b0, #6a1b9a);
                color: white;
            }
            .back-btn {
                background: linear-gradient(180deg, #607d8b, #455a64);
                color: white;
            }
        `;
        document.head.appendChild(style);
    },

    // 
    // QUICK COMBAT (Auto-resolve without UI)
    // 
    quickCombat(enemyId, playerAdvantage = 0) {
        const enemy = this.enemies[enemyId];
        if (!enemy) return { result: 'error', message: 'Unknown enemy' };

        const player = this.getPlayerCombatStats();
        const playerPower = player.attack + player.defense + (playerAdvantage * 10);
        const enemyPower = enemy.attack + enemy.defense;

        // Math decides who lives and who dies - fast resolution
        const winChance = playerPower / (playerPower + enemyPower);
        const roll = Math.random();

        if (roll < winChance) {
            // Victory - you won without the full battle UI
            const goldReward = Math.floor(
                enemy.goldDrop.min + Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min)
            );
            const damage = Math.floor(enemy.attack * (0.2 + Math.random() * 0.3));

            game.player.gold += goldReward;
            game.player.stats.health = Math.max(1, game.player.stats.health - damage);

            // Broadcast the kill event for quest tracking
            document.dispatchEvent(new CustomEvent('enemy-defeated', {
                detail: { enemyType: enemyId, count: 1 }
            }));

            return {
                result: 'victory',
                gold: goldReward,
                damage: damage,
                message: `You defeated the ${enemy.name}! Gained ${goldReward} gold, took ${damage} damage.`
            };
        } else {
            // Defeat - you got your ass kicked offscreen
            const damage = Math.floor(enemy.attack * (0.3 + Math.random() * 0.4));
            const goldLost = Math.min(game.player.gold, Math.floor(game.player.gold * 0.1));

            game.player.stats.health = Math.max(1, game.player.stats.health - damage);
            game.player.gold -= goldLost;

            return {
                result: 'defeat',
                goldLost: goldLost,
                damage: damage,
                message: `The ${enemy.name} overpowered you! Lost ${goldLost} gold, took ${damage} damage.`
            };
        }
    },

    //
    // ROBBERY DEFENSE (Special combat for robbery events)
    //
    startRobberyDefense(options) {
        const numBandits = options.bandits || 1;

        // More bandits = harder fight - scale the threat
        const scaledBandit = {
            ...this.enemies.bandit,
            name: numBandits > 1 ? `${numBandits} Bandits` : 'Bandit',
            health: this.enemies.bandit.health * numBandits,
            attack: this.enemies.bandit.attack + (numBandits - 1) * 3,
            goldDrop: {
                min: this.enemies.bandit.goldDrop.min * numBandits,
                max: this.enemies.bandit.goldDrop.max * numBandits
            }
        };

        return this.startCombat({
            enemyId: 'bandit',
            customEnemy: scaledBandit,
            context: 'robbery'
        });
    }
};

// 
// GLOBAL EXPOSURE
// 
window.CombatSystem = CombatSystem;

// register with Bootstrap
Bootstrap.register('CombatSystem', () => CombatSystem.init(), {
    dependencies: ['game', 'PlayerStateManager', 'EventBus'],
    priority: 50,
    severity: 'required'
});

console.log('CombatSystem loaded');
