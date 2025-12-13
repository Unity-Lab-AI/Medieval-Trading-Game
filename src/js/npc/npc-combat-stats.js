//
// NPC COMBAT STATS - Stat generation based on type, location, and difficulty
//
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
//

const NPCCombatStats = {
    // Base stats by NPC type (before modifiers)
    // HP = Health, ATK = Attack, DEF = Defense, SPD = Speed
    BASE_STATS: {
        // Tier 1: Civilians (weak)
        merchant: { health: 15, attack: 2, defense: 0, speed: 3, tier: 1, goldDrop: [5, 20], xp: 3 },
        traveler: { health: 20, attack: 3, defense: 1, speed: 5, tier: 1, goldDrop: [3, 15], xp: 5 },
        farmer: { health: 18, attack: 2, defense: 1, speed: 3, tier: 1, goldDrop: [2, 10], xp: 3 },
        innkeeper: { health: 20, attack: 2, defense: 1, speed: 2, tier: 1, goldDrop: [10, 30], xp: 4 },
        baker: { health: 15, attack: 2, defense: 0, speed: 2, tier: 1, goldDrop: [5, 15], xp: 3 },
        beggar: { health: 10, attack: 1, defense: 0, speed: 2, tier: 1, goldDrop: [0, 3], xp: 1 },
        drunk: { health: 12, attack: 3, defense: 0, speed: 1, tier: 1, goldDrop: [1, 5], xp: 2 },
        pilgrim: { health: 15, attack: 1, defense: 0, speed: 3, tier: 1, goldDrop: [5, 20], xp: 3 },
        courier: { health: 18, attack: 2, defense: 1, speed: 7, tier: 1, goldDrop: [5, 15], xp: 4 },

        // Tier 2: Workers & Support (medium-weak)
        blacksmith: { health: 35, attack: 11, defense: 5, speed: 3, tier: 2, goldDrop: [15, 40], xp: 15 },
        apothecary: { health: 25, attack: 5, defense: 4, speed: 3, tier: 2, goldDrop: [10, 30], xp: 10 },
        healer: { health: 30, attack: 4, defense: 3, speed: 2, tier: 2, goldDrop: [10, 25], xp: 8 },
        miner: { health: 32, attack: 10, defense: 5, speed: 3, tier: 2, goldDrop: [8, 25], xp: 12 },
        fisherman: { health: 25, attack: 6, defense: 3, speed: 4, tier: 2, goldDrop: [5, 20], xp: 8 },
        sailor: { health: 30, attack: 8, defense: 4, speed: 5, tier: 2, goldDrop: [10, 30], xp: 12 },
        elder: { health: 20, attack: 2, defense: 2, speed: 1, tier: 2, goldDrop: [20, 50], xp: 10 },

        // Tier 2: Fighters (medium)
        guard: { health: 40, attack: 12, defense: 6, speed: 6, tier: 2, goldDrop: [10, 40], xp: 20 },
        captain: { health: 60, attack: 18, defense: 10, speed: 5, tier: 2, goldDrop: [25, 60], xp: 35 },
        sergeant: { health: 50, attack: 15, defense: 8, speed: 5, tier: 2, goldDrop: [15, 45], xp: 25 },
        hunter: { health: 35, attack: 14, defense: 4, speed: 7, tier: 2, goldDrop: [10, 35], xp: 18 },
        scout: { health: 30, attack: 10, defense: 3, speed: 9, tier: 2, goldDrop: [8, 25], xp: 15 },

        // Tier 3: Outlaws (dangerous)
        bandit: { health: 50, attack: 16, defense: 5, speed: 8, tier: 3, goldDrop: [20, 60], xp: 30 },
        thief: { health: 35, attack: 13, defense: 6, speed: 9, tier: 3, goldDrop: [15, 50], xp: 25 },
        robber: { health: 45, attack: 15, defense: 4, speed: 6, tier: 3, goldDrop: [25, 70], xp: 28 },
        smuggler: { health: 40, attack: 12, defense: 5, speed: 7, tier: 3, goldDrop: [30, 80], xp: 25 },
        assassin: { health: 45, attack: 22, defense: 3, speed: 10, tier: 3, goldDrop: [40, 100], xp: 40 },
        pirate: { health: 55, attack: 17, defense: 6, speed: 7, tier: 3, goldDrop: [30, 90], xp: 35 },

        // Tier 3: Monsters (from combat-system)
        wolf: { health: 25, attack: 10, defense: 2, speed: 8, tier: 3, goldDrop: [0, 5], xp: 15 },
        skeleton: { health: 30, attack: 8, defense: 4, speed: 5, tier: 3, goldDrop: [5, 15], xp: 18 },
        goblin: { health: 20, attack: 7, defense: 2, speed: 7, tier: 3, goldDrop: [5, 20], xp: 12 },
        orc: { health: 60, attack: 15, defense: 8, speed: 4, tier: 3, goldDrop: [15, 40], xp: 35 },
        ghost: { health: 35, attack: 12, defense: 0, speed: 6, tier: 3, goldDrop: [0, 10], xp: 25 },
        troll: { health: 80, attack: 18, defense: 10, speed: 3, tier: 3, goldDrop: [20, 50], xp: 45 },
        giant_rat: { health: 15, attack: 5, defense: 1, speed: 6, tier: 3, goldDrop: [0, 3], xp: 5 },

        // Tier 4: Bosses (very dangerous)
        bandit_chief: { health: 150, attack: 30, defense: 12, speed: 5, tier: 4, goldDrop: [100, 300], xp: 100 },
        dark_lord: { health: 200, attack: 35, defense: 15, speed: 6, tier: 4, goldDrop: [200, 500], xp: 150 },
        dragon_wyrmling: { health: 120, attack: 25, defense: 12, speed: 7, tier: 4, goldDrop: [150, 400], xp: 120 },
        rat_king: { health: 80, attack: 20, defense: 8, speed: 5, tier: 4, goldDrop: [30, 80], xp: 60 },
        shadow_guardian: { health: 180, attack: 32, defense: 14, speed: 5, tier: 4, goldDrop: [150, 400], xp: 130 },
        malachar: { health: 300, attack: 45, defense: 20, speed: 4, tier: 4, goldDrop: [500, 1000], xp: 250 },
        malachar_echo: { health: 220, attack: 38, defense: 16, speed: 5, tier: 4, goldDrop: [250, 600], xp: 180 },
        black_ledger_guard: { health: 70, attack: 22, defense: 10, speed: 6, tier: 3, goldDrop: [40, 100], xp: 50 },
        pirate_scout: { health: 45, attack: 14, defense: 5, speed: 8, tier: 3, goldDrop: [20, 50], xp: 25 },
        cave_spider: { health: 30, attack: 12, defense: 3, speed: 9, tier: 3, goldDrop: [0, 10], xp: 18 },
        dungeon_keeper: { health: 100, attack: 25, defense: 12, speed: 4, tier: 4, goldDrop: [80, 200], xp: 80 },
        frost_elemental: { health: 90, attack: 20, defense: 15, speed: 3, tier: 4, goldDrop: [50, 150], xp: 70 },

        // named dungeon bosses - the big bad bastards
        grimfang: { health: 150, attack: 30, defense: 12, speed: 9, tier: 4, goldDrop: [100, 300], xp: 100 },
        scorathax: { health: 350, attack: 50, defense: 25, speed: 5, tier: 4, goldDrop: [800, 1500], xp: 300 },
        blackheart: { health: 220, attack: 30, defense: 13, speed: 6, tier: 4, goldDrop: [200, 500], xp: 140 },
        captain_blacktide: { health: 200, attack: 28, defense: 12, speed: 7, tier: 4, goldDrop: [150, 400], xp: 120 },
        guildmaster_crimson: { health: 250, attack: 32, defense: 14, speed: 5, tier: 4, goldDrop: [200, 500], xp: 150 },
        frost_lord: { health: 180, attack: 28, defense: 16, speed: 4, tier: 4, goldDrop: [150, 400], xp: 130 },
        alpha_wolf: { health: 100, attack: 24, defense: 10, speed: 8, tier: 4, goldDrop: [60, 150], xp: 65 },
        goblin_king: { health: 180, attack: 22, defense: 12, speed: 6, tier: 4, goldDrop: [200, 500], xp: 100 },
        dragon: { health: 400, attack: 55, defense: 30, speed: 5, tier: 4, goldDrop: [1000, 2500], xp: 350 },
        necromancer: { health: 120, attack: 28, defense: 8, speed: 5, tier: 4, goldDrop: [80, 200], xp: 80 },
        // Doom world bosses
        greedy_won: { health: 500, attack: 50, defense: 25, speed: 4, tier: 4, goldDrop: [1000, 2500], xp: 500 },
        cache_guardian: { health: 180, attack: 30, defense: 14, speed: 2, tier: 4, goldDrop: [100, 300], xp: 100 },
        shadow_lieutenant: { health: 200, attack: 35, defense: 15, speed: 6, tier: 4, goldDrop: [150, 350], xp: 120 },
        shadow_lieutenant_frost: { health: 220, attack: 34, defense: 18, speed: 5, tier: 4, goldDrop: [250, 600], xp: 140 },
        shadow_lieutenant_forge: { health: 240, attack: 32, defense: 20, speed: 4, tier: 4, goldDrop: [250, 600], xp: 140 },

        // quest-specific enemies - the meat grinders
        city_guard: { health: 60, attack: 16, defense: 10, speed: 5, tier: 2, goldDrop: [15, 45], xp: 30 },
        corrupted_archdruid: { health: 280, attack: 38, defense: 18, speed: 5, tier: 4, goldDrop: [200, 600], xp: 160 },
        shadow_king: { health: 600, attack: 60, defense: 35, speed: 5, tier: 4, goldDrop: [1500, 4000], xp: 800 },

        // Default fallback
        default: { health: 25, attack: 8, defense: 3, speed: 5, tier: 2, goldDrop: [5, 20], xp: 10 }
    },

    // Path danger levels for encounter variety
    PATH_DANGER: {
        safe: { encounterChance: 0.05, types: ['traveler', 'merchant', 'pilgrim', 'courier'] },
        normal: { encounterChance: 0.10, types: ['traveler', 'merchant', 'drunk', 'beggar', 'thief'] },
        dangerous: { encounterChance: 0.20, types: ['bandit', 'thief', 'robber', 'wolf', 'smuggler'] },
        deadly: { encounterChance: 0.30, types: ['bandit', 'assassin', 'orc', 'skeleton', 'ghost'] }
    },

    // Daily encounter limit
    MAX_ENCOUNTERS_PER_DAY: 2,
    encountersToday: 0,
    lastEncounterDay: 0,

    // has midnight passed? reset the encounter tally - new day, new meat
    checkDailyReset() {
        const currentDay = typeof TimeSystem !== 'undefined' ? TimeSystem.getDay() : 1;
        if (currentDay !== this.lastEncounterDay) {
            this.encountersToday = 0;
            this.lastEncounterDay = currentDay;
        }
    },

    // Can we have more encounters today?
    canHaveEncounter() {
        this.checkDailyReset();
        return this.encountersToday < this.MAX_ENCOUNTERS_PER_DAY;
    },

    // Record an encounter
    recordEncounter() {
        this.checkDailyReset();
        this.encountersToday++;
        console.log(`⚔️ Encounter ${this.encountersToday}/${this.MAX_ENCOUNTERS_PER_DAY} today`);
    },

    // roll the dice - summon a hostile soul from the danger tier (or return nothing)
    getRandomEncounter(dangerLevel = 'normal') {
        if (!this.canHaveEncounter()) {
            return null; // No more encounters today
        }

        const danger = this.PATH_DANGER[dangerLevel] || this.PATH_DANGER.normal;

        // Roll for encounter
        if (Math.random() > danger.encounterChance) {
            return null; // No encounter this time
        }

        // Pick random enemy type from danger level
        const enemyType = danger.types[Math.floor(Math.random() * danger.types.length)];
        const location = game?.currentLocation?.id || 'greendale';

        this.recordEncounter();

        return {
            type: enemyType,
            stats: this.getStats(enemyType, location),
            dangerLevel: dangerLevel,
            isCombat: ['bandit', 'thief', 'robber', 'wolf', 'assassin', 'orc', 'skeleton', 'ghost', 'smuggler'].includes(enemyType)
        };
    },

    // Location difficulty multipliers
    LOCATION_MULTIPLIERS: {
        // Tier 1: Safe zones (1.0x)
        greendale: { health: 1.0, attack: 1.0, defense: 1.0, gold: 0.8, xp: 0.8 },
        vineyard_village: { health: 1.0, attack: 1.0, defense: 1.0, gold: 0.8, xp: 0.8 },
        riverwood: { health: 1.0, attack: 1.0, defense: 1.0, gold: 0.9, xp: 0.9 },
        wheat_farm: { health: 1.0, attack: 1.0, defense: 1.0, gold: 0.7, xp: 0.7 },
        orchard_farm: { health: 1.0, attack: 1.0, defense: 1.0, gold: 0.7, xp: 0.7 },

        // Tier 2: Towns & cities (1.1-1.2x)
        royal_capital: { health: 1.2, attack: 1.15, defense: 1.15, gold: 1.2, xp: 1.1 },
        northern_outpost: { health: 1.2, attack: 1.2, defense: 1.15, gold: 1.1, xp: 1.1 },
        jade_harbor: { health: 1.15, attack: 1.1, defense: 1.1, gold: 1.15, xp: 1.1 },
        western_watch: { health: 1.15, attack: 1.15, defense: 1.1, gold: 1.1, xp: 1.0 },
        sunhaven: { health: 1.1, attack: 1.05, defense: 1.05, gold: 1.0, xp: 1.0 },

        // Tier 3: Dangerous regions (1.3-1.5x)
        ironforge_city: { health: 1.4, attack: 1.35, defense: 1.3, gold: 1.2, xp: 1.3 },
        stonebridge: { health: 1.35, attack: 1.3, defense: 1.25, gold: 1.2, xp: 1.25 },
        frostholm_village: { health: 1.3, attack: 1.25, defense: 1.2, gold: 1.1, xp: 1.2 },
        darkwood_village: { health: 1.35, attack: 1.3, defense: 1.2, gold: 1.15, xp: 1.25 },
        smugglers_cove: { health: 1.4, attack: 1.4, defense: 1.2, gold: 1.3, xp: 1.3 },

        // Tier 4: Dungeons & caves (1.5-2.0x)
        shadow_dungeon: { health: 1.8, attack: 1.6, defense: 1.5, gold: 1.5, xp: 1.6 },
        forest_dungeon: { health: 1.6, attack: 1.5, defense: 1.4, gold: 1.4, xp: 1.5 },
        deep_cavern: { health: 1.7, attack: 1.55, defense: 1.45, gold: 1.45, xp: 1.55 },
        crystal_cave: { health: 1.5, attack: 1.4, defense: 1.3, gold: 1.5, xp: 1.4 },
        ruins_of_eldoria: { health: 1.9, attack: 1.7, defense: 1.6, gold: 1.6, xp: 1.7 },
        frozen_cave: { health: 1.6, attack: 1.5, defense: 1.4, gold: 1.3, xp: 1.5 },

        // Default for unknown locations
        default: { health: 1.0, attack: 1.0, defense: 1.0, gold: 1.0, xp: 1.0 }
    },

    // Game difficulty multipliers
    DIFFICULTY_MULTIPLIERS: {
        easy: {
            health: 0.7,
            attack: 0.7,
            defense: 0.8,
            gold: 0.8,
            xp: 0.8,
            description: 'Enemies are weaker, less rewarding'
        },
        normal: {
            health: 1.0,
            attack: 1.0,
            defense: 1.0,
            gold: 1.0,
            xp: 1.0,
            description: 'Balanced challenge and rewards'
        },
        hard: {
            health: 1.5,
            attack: 1.3,
            defense: 1.2,
            gold: 1.3,
            xp: 1.5,
            description: 'Tougher enemies, better rewards'
        },
        deadly: {
            health: 2.0,
            attack: 1.6,
            defense: 1.4,
            gold: 1.8,
            xp: 2.0,
            description: 'Extreme difficulty, maximum rewards'
        }
    },

    // Special abilities by NPC type
    SPECIAL_ABILITIES: {
        guard: 'shield_bash',      // Increases defense next turn
        captain: 'rally',          // Boosts own attack
        assassin: 'backstab',      // High damage vs low defense
        ghost: 'phasing',          // 50% chance to avoid physical attacks
        troll: 'regenerate',       // Heals 5 HP per turn
        dragon_wyrmling: 'firebreath', // Area damage
        thief: 'dodge',            // Higher evade chance
        scout: 'precise_shot',     // Ignores some defense
        malachar: 'shadow_blast'   // Multi-target damage
    },

    // calculate power level for any hostile puppet - base stats scaled by location and difficulty
    getStats(npcType, location = null, difficulty = null) {
        // fetch this enemy type's foundation stats - every hollow soul starts somewhere
        const baseStats = this.BASE_STATS[npcType] || this.BASE_STATS.default;

        // adjust for location difficulty - some places breed stronger monsters
        const locMult = location
            ? (this.LOCATION_MULTIPLIERS[location] || this.LOCATION_MULTIPLIERS.default)
            : this.LOCATION_MULTIPLIERS.default;

        // player's chosen difficulty affects enemy strength - easy mode weakens them, hard mode empowers
        const gameDifficulty = difficulty || game?.settings?.difficulty || 'normal';
        const diffMult = this.DIFFICULTY_MULTIPLIERS[gameDifficulty] || this.DIFFICULTY_MULTIPLIERS.normal;

        // multiply everything together - forge the final stat block
        const stats = {
            health: Math.round(baseStats.health * locMult.health * diffMult.health),
            maxHealth: Math.round(baseStats.health * locMult.health * diffMult.health),
            attack: Math.round(baseStats.attack * locMult.attack * diffMult.attack),
            defense: Math.round(baseStats.defense * locMult.defense * diffMult.defense),
            speed: baseStats.speed, // Speed doesn't scale with location/difficulty
            tier: baseStats.tier,

            // Rewards
            goldDrop: this._calculateGoldDrop(baseStats.goldDrop, locMult.gold, diffMult.gold),
            xpReward: Math.round(baseStats.xp * locMult.xp * diffMult.xp),

            // Special ability (if any)
            specialAbility: this.SPECIAL_ABILITIES[npcType] || null,

            // Meta
            npcType: npcType,
            location: location,
            difficulty: gameDifficulty
        };

        return stats;
    },

    // how much gold does this corpse carry? calculate loot with location scaling
    _calculateGoldDrop(baseRange, locMult, diffMult) {
        const min = Math.round(baseRange[0] * locMult * diffMult);
        const max = Math.round(baseRange[1] * locMult * diffMult);
        return { min, max };
    },

    // Roll actual gold drop from range
    rollGoldDrop(goldDropRange) {
        const { min, max } = goldDropRange;
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    // assemble the player's combat prowess - mirror the enemy stat format
    getPlayerStats() {
        const player = game?.player;
        if (!player) {
            return { health: 100, maxHealth: 100, attack: 10, defense: 5, speed: 5 };
        }

        // Base stats
        let attack = 10;
        let defense = 5;
        let speed = 5;

        // layer on attribute modifiers - strength fuels damage, endurance grants resilience
        const attrs = player.attributes || {};
        attack += (attrs.strength || 5) * 2;
        defense += (attrs.endurance || 5);
        speed += Math.floor((attrs.agility || 5) / 2);

        // add gear bonuses if the equipment system exists - armor and weapons matter
        if (typeof EquipmentSystem !== 'undefined' && EquipmentSystem.getStatBonuses) {
            const equipBonus = EquipmentSystem.getStatBonuses();
            attack += equipBonus.attack || 0;
            defense += equipBonus.defense || 0;
            speed += equipBonus.speed || 0;
        }

        // inject combat skill bonuses if the system tracks them - trained fighters hit harder
        if (typeof CombatSystem !== 'undefined' && CombatSystem.getSkillBonuses) {
            const skillBonus = CombatSystem.getSkillBonuses();
            attack += skillBonus.attack || 0;
            defense += skillBonus.defense || 0;
        }

        return {
            health: player.stats?.health || 100,
            maxHealth: player.stats?.maxHealth || 100,
            attack: attack,
            defense: defense,
            speed: speed
        };
    },

    // Compare player vs NPC (for UI display)
    getStatComparison(npcType, location) {
        const playerStats = this.getPlayerStats();
        const npcStats = this.getStats(npcType, location);

        return {
            player: playerStats,
            npc: npcStats,
            advantage: {
                health: playerStats.health > npcStats.health ? 'player' : 'npc',
                attack: playerStats.attack > npcStats.attack ? 'player' : 'npc',
                defense: playerStats.defense > npcStats.defense ? 'player' : 'npc',
                speed: playerStats.speed > npcStats.speed ? 'player' : 'npc'
            },
            winChance: this._estimateWinChance(playerStats, npcStats)
        };
    },

    // Rough estimate of player win chance
    _estimateWinChance(playerStats, npcStats) {
        const playerPower = playerStats.attack + playerStats.defense + (playerStats.health / 10);
        const npcPower = npcStats.attack + npcStats.defense + (npcStats.health / 10);
        const ratio = playerPower / (playerPower + npcPower);
        return Math.round(ratio * 100);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.NPCCombatStats = NPCCombatStats;
}

console.log('⚔️ NPCCombatStats loaded - NPC stat generation ready');
