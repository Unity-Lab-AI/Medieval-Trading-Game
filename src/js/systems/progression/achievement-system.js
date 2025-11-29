// ═══════════════════════════════════════════════════════════════
// 🏆 ACHIEVEMENT SYSTEM - validation through virtual trophies
// ═══════════════════════════════════════════════════════════════
// because real accomplishments are overrated, here's some pixel ones
// at least these ones give dopamine hits
// File Version: GameConfig.version.file
// Game Version: 0.2
// Made by Unity AI Lab - Hackall360, Sponge, GFourteen

const AchievementSystem = {
    // 🎖️ Achievement data - every flex you can earn
    achievements: {
        // --- WEALTH ACHIEVEMENTS ---
        first_gold: {
            id: 'first_gold',
            name: 'First Coin',
            description: 'Earn your first gold coin',
            icon: '💰',
            category: 'wealth',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => game.player && game.player.gold >= 1
        },
        merchant_apprentice: {
            id: 'merchant_apprentice',
            name: 'Merchant Apprentice',
            description: 'Accumulate 1,000 gold',
            icon: '💰',
            category: 'wealth',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => game.player && game.player.gold >= 1000
        },
        merchant_master: {
            id: 'merchant_master',
            name: 'Merchant Master',
            description: 'Accumulate 10,000 gold',
            icon: '💎',
            category: 'wealth',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => game.player && game.player.gold >= 10000
        },
        trade_tycoon: {
            id: 'trade_tycoon',
            name: 'Trade Tycoon',
            description: 'Accumulate 50,000 gold',
            icon: '👑',
            category: 'wealth',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => game.player && game.player.gold >= 50000
        },

        // --- MERCHANT RANK ACHIEVEMENTS ---
        rank_vagrant: {
            id: 'rank_vagrant',
            name: 'Humble Beginnings',
            description: 'Start your journey as a vagrant',
            icon: '🥺',
            category: 'wealth',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.id === 'vagrant'
        },
        rank_peddler: {
            id: 'rank_peddler',
            name: 'First Steps',
            description: 'Become a Peddler with 500 gold in wealth',
            icon: '🧳',
            category: 'wealth',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 2
        },
        rank_hawker: {
            id: 'rank_hawker',
            name: 'Street Smart',
            description: 'Become a Hawker with 2,000 gold in wealth',
            icon: '🛒',
            category: 'wealth',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 3
        },
        rank_trader: {
            id: 'rank_trader',
            name: 'Legitimate Business',
            description: 'Become a Trader with 5,000 gold in wealth',
            icon: '⚖️',
            category: 'wealth',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 4
        },
        rank_merchant: {
            id: 'rank_merchant',
            name: 'Rising Star',
            description: 'Become a Merchant with 15,000 gold in wealth',
            icon: '💼',
            category: 'wealth',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 5
        },
        rank_magnate: {
            id: 'rank_magnate',
            name: 'Power Player',
            description: 'Become a Magnate with 50,000 gold in wealth',
            icon: '🏛️',
            category: 'wealth',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 6
        },
        rank_tycoon: {
            id: 'rank_tycoon',
            name: 'Industrial Giant',
            description: 'Become a Tycoon with 150,000 gold in wealth',
            icon: '🏭',
            category: 'wealth',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 7
        },
        rank_baron: {
            id: 'rank_baron',
            name: 'Noble Commerce',
            description: 'Become a Trade Baron with 500,000 gold in wealth',
            icon: '👑',
            category: 'wealth',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 8
        },
        rank_mogul: {
            id: 'rank_mogul',
            name: 'Empire Builder',
            description: 'Become a Merchant Mogul with 1,500,000 gold in wealth',
            icon: '🌟',
            category: 'wealth',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 9
        },
        rank_royal_merchant: {
            id: 'rank_royal_merchant',
            name: 'Royal Favor',
            description: 'Become a Royal Merchant with 5,000,000 gold in wealth',
            icon: '👸',
            category: 'wealth',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.currentRank?.level >= 10
        },

        // --- QUEST ACHIEVEMENTS ---
        first_quest: {
            id: 'first_quest',
            name: 'Adventurer\'s Call',
            description: 'Complete your first quest',
            icon: '📜',
            category: 'quests',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.length >= 1
        },
        quest_helper: {
            id: 'quest_helper',
            name: 'Helpful Hero',
            description: 'Complete 10 quests',
            icon: '🦸',
            category: 'quests',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.length >= 10
        },
        quest_master: {
            id: 'quest_master',
            name: 'Questmaster',
            description: 'Complete 50 quests',
            icon: '🏅',
            category: 'quests',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.length >= 50
        },
        main_quest_complete: {
            id: 'main_quest_complete',
            name: 'Hero of the Realm',
            description: 'Complete the main quest by defeating Malachar',
            icon: '⚔️',
            category: 'quests',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.includes('main_tower_assault')
        },
        dragon_slayer: {
            id: 'dragon_slayer',
            name: 'Dragonslayer',
            description: 'Slay the legendary dragon',
            icon: '🐉',
            category: 'quests',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.includes('legendary_dragon_slayer')
        },
        frost_vanquisher: {
            id: 'frost_vanquisher',
            name: 'Frost Vanquisher',
            description: 'Defeat the Frost Lord and end the eternal winter',
            icon: '❄️',
            category: 'quests',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof QuestSystem !== 'undefined' && QuestSystem.completedQuests?.includes('frostholm_frost_lord')
        },

        // --- BOSS DEFEAT ACHIEVEMENTS ---
        boss_slayer: {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat your first dungeon boss',
            icon: '👹',
            category: 'combat',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof DungeonExplorationSystem !== 'undefined' && Object.keys(DungeonExplorationSystem.defeatedBosses || {}).length >= 1
        },
        boss_hunter: {
            id: 'boss_hunter',
            name: 'Boss Hunter',
            description: 'Defeat 5 dungeon bosses',
            icon: '💀',
            category: 'combat',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof DungeonExplorationSystem !== 'undefined' && Object.keys(DungeonExplorationSystem.defeatedBosses || {}).length >= 5
        },
        all_bosses: {
            id: 'all_bosses',
            name: 'Champion of the Realm',
            description: 'Defeat all dungeon bosses',
            icon: '🏆',
            category: 'combat',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof DungeonExplorationSystem !== 'undefined' && Object.keys(DungeonExplorationSystem.defeatedBosses || {}).length >= 8
        },

        // --- TRADING ACHIEVEMENTS ---
        first_trade: {
            id: 'first_trade',
            name: 'First Deal',
            description: 'Complete your first trade',
            icon: '🤝',
            category: 'trading',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.tradesCompleted >= 1
        },
        savvy_trader: {
            id: 'savvy_trader',
            name: 'Savvy Trader',
            description: 'Complete 50 trades',
            icon: '📊',
            category: 'trading',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.tradesCompleted >= 50
        },
        trading_legend: {
            id: 'trading_legend',
            name: 'Trading Legend',
            description: 'Complete 200 trades',
            icon: '⭐',
            category: 'trading',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.tradesCompleted >= 200
        },
        profit_margin: {
            id: 'profit_margin',
            name: 'Profit Margin',
            description: 'Make 500 gold profit in a single trade',
            icon: '📈',
            category: 'trading',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.highestProfit >= 500
        },

        // --- TRAVEL ACHIEVEMENTS ---
        first_journey: {
            id: 'first_journey',
            name: 'Start Your Journey',
            description: 'Begin your first travel to another location',
            icon: '🗺️',
            category: 'travel',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.journeysStarted >= 1
        },
        world_explorer: {
            id: 'world_explorer',
            name: 'World Explorer',
            description: 'Visit all locations in the realm',
            icon: '🌍',
            category: 'travel',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                const totalLocations = typeof GameWorld !== 'undefined' && GameWorld.locations ? Object.keys(GameWorld.locations).length : 45;
                return AchievementSystem.stats.locationsVisited >= totalLocations;
            }
        },
        road_warrior: {
            id: 'road_warrior',
            name: 'Road Warrior',
            description: 'Travel 1,000 miles',
            icon: '🏃',
            category: 'travel',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.distanceTraveled >= 1000
        },
        frequent_traveler: {
            id: 'frequent_traveler',
            name: 'Frequent Traveler',
            description: 'Complete 100 journeys',
            icon: '🚶',
            category: 'travel',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.journeysCompleted >= 100
        },

        // --- SURVIVAL ACHIEVEMENTS ---
        survivor: {
            id: 'survivor',
            name: 'Survivor',
            description: 'Survive 10 hostile encounters',
            icon: '🛡️',
            category: 'survival',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.encountersSurvived >= 10
        },
        bandit_hunter: {
            id: 'bandit_hunter',
            name: 'Bandit Hunter',
            description: 'Defeat 20 bandit encounters',
            icon: '⚔️',
            category: 'survival',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.banditsDefeated >= 20
        },
        lucky_escape: {
            id: 'lucky_escape',
            name: 'Lucky Escape',
            description: 'Escape from danger with less than 10 gold remaining',
            icon: '🍀',
            category: 'survival',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.narrowEscapes >= 1
        },

        // --- COLLECTION ACHIEVEMENTS ---
        pack_rat: {
            id: 'pack_rat',
            name: 'Pack Rat',
            description: 'Carry 50 different items in your inventory',
            icon: '🎒',
            category: 'collection',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (!game.player || !game.player.inventory) return false;
                return Object.keys(game.player.inventory).length >= 50;
            }
        },
        rare_collector: {
            id: 'rare_collector',
            name: 'Rare Collector',
            description: 'Own 10 rare or legendary items',
            icon: '💎',
            category: 'collection',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.rareItemsOwned >= 10
        },
        hoarder: {
            id: 'hoarder',
            name: 'Hoarder',
            description: 'Have 1,000 total items in inventory',
            icon: '📦',
            category: 'collection',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (!game.player || !game.player.inventory) return false;
                return Object.values(game.player.inventory).reduce((sum, qty) => sum + qty, 0) >= 1000;
            }
        },

        // --- TIME ACHIEVEMENTS ---
        veteran_trader: {
            id: 'veteran_trader',
            name: 'Veteran Trader',
            description: 'Play for 10 in-game days',
            icon: '📅',
            category: 'time',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof TimeSystem !== 'undefined' && TimeSystem.getTotalDays() >= 10
        },
        year_of_trading: {
            id: 'year_of_trading',
            name: 'Year of Trading',
            description: 'Play for 1 in-game year (365 days)',
            icon: '🎂',
            category: 'time',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => typeof TimeSystem !== 'undefined' && TimeSystem.getTotalDays() >= 365
        },

        // --- SPECIAL ACHIEVEMENTS ---
        lucky_strike: {
            id: 'lucky_strike',
            name: 'Lucky Strike',
            description: 'Find hidden treasure during travel',
            icon: '✨',
            category: 'special',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.treasuresFound >= 1
        },
        rags_to_riches: {
            id: 'rags_to_riches',
            name: 'Rags to Riches',
            description: 'Go from less than 10 gold to over 5,000 gold',
            icon: '📊',
            category: 'special',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.ragsToRiches
        },
        perfect_haggle: {
            id: 'perfect_haggle',
            name: 'Perfect Haggle',
            description: 'Buy an item at 50% below market price',
            icon: '🎯',
            category: 'special',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.perfectHaggles >= 1
        },
        generous_soul: {
            id: 'generous_soul',
            name: 'Generous Soul',
            description: 'Give away 1,000 gold worth of items or money',
            icon: '❤️',
            category: 'special',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.goldGivenAway >= 1000
        },

        // --- LUXURY ACHIEVEMENTS ---
        first_luxury: {
            id: 'first_luxury',
            name: 'Taste of Luxury',
            description: 'Acquire your first luxury item',
            icon: '💎',
            category: 'luxury',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.luxuryItemsOwned >= 1
        },
        luxury_collector: {
            id: 'luxury_collector',
            name: 'Luxury Collector',
            description: 'Own 10 different luxury items',
            icon: '👑',
            category: 'luxury',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.uniqueLuxuryItems >= 10
        },
        silk_merchant: {
            id: 'silk_merchant',
            name: 'Silk Merchant',
            description: 'Trade 100 silk items',
            icon: '🧵',
            category: 'luxury',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.silkTraded >= 100
        },
        jewel_connoisseur: {
            id: 'jewel_connoisseur',
            name: 'Jewel Connoisseur',
            description: 'Own gems or jewelry worth 5,000 gold',
            icon: '💍',
            category: 'luxury',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.jewelryValue >= 5000
        },
        wine_aficionado: {
            id: 'wine_aficionado',
            name: 'Wine Aficionado',
            description: 'Collect 50 bottles of fine wine',
            icon: '🍷',
            category: 'luxury',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.wineCollected >= 50
        },
        spice_baron: {
            id: 'spice_baron',
            name: 'Spice Baron',
            description: 'Trade 500 units of exotic spices',
            icon: '🌶️',
            category: 'luxury',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.spicesTraded >= 500
        },
        living_in_luxury: {
            id: 'living_in_luxury',
            name: 'Living in Luxury',
            description: 'Have 50,000 gold worth of luxury items at once',
            icon: '🏰',
            category: 'luxury',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.totalLuxuryValue >= 50000
        },

        // --- EQUIPMENT/GEAR ACHIEVEMENTS ---
        first_weapon: {
            id: 'first_weapon',
            name: 'Armed and Ready',
            description: 'Acquire your first weapon',
            icon: '⚔️',
            category: 'equipment',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.weaponsOwned >= 1
        },
        first_armor: {
            id: 'first_armor',
            name: 'Protected',
            description: 'Acquire your first piece of armor',
            icon: '🛡️',
            category: 'equipment',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.armorOwned >= 1
        },
        fully_equipped: {
            id: 'fully_equipped',
            name: 'Fully Equipped',
            description: 'Have a weapon, armor, and accessory equipped',
            icon: '🎖️',
            category: 'equipment',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.fullyEquipped
        },
        master_armorer: {
            id: 'master_armorer',
            name: 'Master Armorer',
            description: 'Own 20 different pieces of equipment',
            icon: '⚒️',
            category: 'equipment',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.uniqueEquipmentOwned >= 20
        },
        legendary_gear: {
            id: 'legendary_gear',
            name: 'Legendary Gear',
            description: 'Acquire a legendary quality item',
            icon: '✨',
            category: 'equipment',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.legendaryItemsOwned >= 1
        },
        walking_arsenal: {
            id: 'walking_arsenal',
            name: 'Walking Arsenal',
            description: 'Own 10 different weapons',
            icon: '🗡️',
            category: 'equipment',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.uniqueWeaponsOwned >= 10
        },

        // --- CRAFTING ACHIEVEMENTS ---
        first_craft: {
            id: 'first_craft',
            name: 'Apprentice Crafter',
            description: 'Craft your first item',
            icon: '🔨',
            category: 'crafting',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.itemsCrafted >= 1
        },
        journeyman_crafter: {
            id: 'journeyman_crafter',
            name: 'Journeyman Crafter',
            description: 'Craft 25 items',
            icon: '🛠️',
            category: 'crafting',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.itemsCrafted >= 25
        },
        master_crafter: {
            id: 'master_crafter',
            name: 'Master Crafter',
            description: 'Craft 100 items',
            icon: '⚙️',
            category: 'crafting',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.itemsCrafted >= 100
        },
        legendary_craftsman: {
            id: 'legendary_craftsman',
            name: 'Legendary Craftsman',
            description: 'Craft 500 items',
            icon: '🏆',
            category: 'crafting',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.itemsCrafted >= 500
        },
        tier2_crafter: {
            id: 'tier2_crafter',
            name: 'Quality Craftsman',
            description: 'Craft 10 tier 2 (uncommon) items',
            icon: '🔷',
            category: 'crafting',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.tier2ItemsCrafted >= 10
        },
        tier3_crafter: {
            id: 'tier3_crafter',
            name: 'Expert Craftsman',
            description: 'Craft 10 tier 3 (rare) items',
            icon: '🔶',
            category: 'crafting',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.tier3ItemsCrafted >= 10
        },
        legendary_creator: {
            id: 'legendary_creator',
            name: 'Legendary Creator',
            description: 'Craft a legendary quality item',
            icon: '⭐',
            category: 'crafting',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.legendaryItemsCrafted >= 1
        },
        blacksmith: {
            id: 'blacksmith',
            name: 'Blacksmith',
            description: 'Craft 20 metal items (weapons, armor, tools)',
            icon: '🔥',
            category: 'crafting',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.metalItemsCrafted >= 20
        },
        alchemist: {
            id: 'alchemist',
            name: 'Alchemist',
            description: 'Craft 20 potions or medicines',
            icon: '⚗️',
            category: 'crafting',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.potionsCrafted >= 20
        },
        tailor: {
            id: 'tailor',
            name: 'Tailor',
            description: 'Craft 20 cloth or leather items',
            icon: '🧥',
            category: 'crafting',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.clothItemsCrafted >= 20
        },

        // --- PROPERTY ACHIEVEMENTS ---
        first_property: {
            id: 'first_property',
            name: 'Property Owner',
            description: 'Purchase your first property',
            icon: '🏠',
            category: 'property',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.propertiesOwned >= 1
        },
        landlord: {
            id: 'landlord',
            name: 'Landlord',
            description: 'Own 3 properties',
            icon: '🏘️',
            category: 'property',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.propertiesOwned >= 3
        },
        real_estate_mogul: {
            id: 'real_estate_mogul',
            name: 'Real Estate Mogul',
            description: 'Own 10 properties',
            icon: '🏰',
            category: 'property',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.propertiesOwned >= 10
        },
        first_employee: {
            id: 'first_employee',
            name: 'First Hire',
            description: 'Hire your first employee',
            icon: '👤',
            category: 'property',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.employeesHired >= 1
        },
        employer: {
            id: 'employer',
            name: 'Employer',
            description: 'Have 5 employees working for you',
            icon: '👥',
            category: 'property',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.currentEmployees >= 5
        },
        business_empire: {
            id: 'business_empire',
            name: 'Business Empire',
            description: 'Have 20 employees across all properties',
            icon: '🏢',
            category: 'property',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.currentEmployees >= 20
        },
        property_upgrader: {
            id: 'property_upgrader',
            name: 'Property Upgrader',
            description: 'Upgrade a property to level 3',
            icon: '📈',
            category: 'property',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.maxPropertyLevel >= 3
        },
        warehouse_king: {
            id: 'warehouse_king',
            name: 'Warehouse King',
            description: 'Have 10,000 storage capacity across all properties',
            icon: '📦',
            category: 'property',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.totalStorageCapacity >= 10000
        },

        // --- HIDDEN ACHIEVEMENTS ---
        // These are secrets - players discover them through unique gameplay
        dungeon_crawler: {
            id: 'dungeon_crawler',
            name: 'Dungeon Crawler',
            description: 'Visit dungeons 50 times within 5 years',
            icon: '💀',
            category: 'hidden',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.dungeonVisitsIn5Years >= 50
        },
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Complete 100 trades between midnight and 5am',
            icon: '🦉',
            category: 'hidden',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.nightTrades >= 100
        },
        marathon_trader: {
            id: 'marathon_trader',
            name: 'Marathon Trader',
            description: 'Play for 24 in-game hours without resting',
            icon: '☕',
            category: 'hidden',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.longestNoRestStreak >= 1440
        },
        penny_pincher: {
            id: 'penny_pincher',
            name: 'Penny Pincher',
            description: 'Accumulate 10,000 gold without ever spending more than 100 gold at once',
            icon: '🪙',
            category: 'hidden',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.pennyPincherEligible && game.player && game.player.gold >= 10000
        },
        ghost_trader: {
            id: 'ghost_trader',
            name: 'Ghost Trader',
            description: 'Visit every location without being spotted by bandits',
            icon: '👻',
            category: 'hidden',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.stealthyExplorer
        },
        sunrise_sunset: {
            id: 'sunrise_sunset',
            name: 'Sunrise to Sunset',
            description: 'Complete a trade at exactly sunrise and sunset on the same day',
            icon: '🌅',
            category: 'hidden',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.sunriseSunsetTrade
        },
        full_moon_fortune: {
            id: 'full_moon_fortune',
            name: 'Full Moon Fortune',
            description: 'Earn 1,000 gold profit during a full moon night',
            icon: '🌕',
            category: 'hidden',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.fullMoonProfit >= 1000
        },
        returning_customer: {
            id: 'returning_customer',
            name: 'Returning Customer',
            description: 'Trade with the same merchant 50 times',
            icon: '🔄',
            category: 'hidden',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => AchievementSystem.stats.maxMerchantTrades >= 50
        },
        speed_runner: {
            id: 'speed_runner',
            name: 'Speed Runner',
            description: 'Reach 10,000 gold within the first 30 in-game days',
            icon: '⚡',
            category: 'hidden',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => {
                const days = typeof TimeSystem !== 'undefined' ? TimeSystem.getTotalDays() : 999;
                return days <= 30 && game.player && game.player.gold >= 10000;
            }
        },
        completionist: {
            id: 'completionist',
            name: 'Completionist',
            description: 'Unlock all non-hidden achievements',
            icon: '🎯',
            category: 'hidden',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            condition: () => {
                const nonHidden = Object.values(AchievementSystem.achievements).filter(a => !a.hidden && a.id !== 'completionist');
                return nonHidden.every(a => a.unlocked);
            }
        },

        // ═══════════════════════════════════════════════════════════
        // 🏛️ FACTION REPUTATION ACHIEVEMENTS - 5 solid milestones 🖤
        // ═══════════════════════════════════════════════════════════

        first_faction_friend: {
            id: 'first_faction_friend',
            name: 'Making Friends',
            description: 'Reach Friendly (25) reputation with any faction',
            icon: '🤝',
            category: 'faction',
            rarity: 'common',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (typeof FactionSystem === 'undefined') return false;
                return Object.keys(FactionSystem.factions).some(f => FactionSystem.getReputation(f) >= 25);
            }
        },
        faction_diplomat: {
            id: 'faction_diplomat',
            name: 'Faction Diplomat',
            description: 'Reach Honored (50) with 3 different factions',
            icon: '🕊️',
            category: 'faction',
            rarity: 'uncommon',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (typeof FactionSystem === 'undefined') return false;
                return Object.keys(FactionSystem.factions).filter(f => FactionSystem.getReputation(f) >= 50).length >= 3;
            }
        },
        reputation_maxed: {
            id: 'reputation_maxed',
            name: 'Perfect Standing',
            description: 'Reach maximum reputation (100) with any faction',
            icon: '💯',
            category: 'faction',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (typeof FactionSystem === 'undefined') return false;
                return Object.keys(FactionSystem.factions).some(f => FactionSystem.getReputation(f) >= 100);
            }
        },
        universal_respect: {
            id: 'universal_respect',
            name: 'Universal Respect',
            description: 'Reach maximum reputation (100) with ALL factions',
            icon: '🏆',
            category: 'faction',
            rarity: 'legendary',
            unlocked: false,
            unlockedAt: null,
            condition: () => {
                if (typeof FactionSystem === 'undefined') return false;
                return Object.keys(FactionSystem.factions).every(f => FactionSystem.getReputation(f) >= 100);
            }
        },
        redemption_arc: {
            id: 'redemption_arc',
            name: 'Redemption Arc',
            description: 'Recover from Hated (-75) to Friendly (25) with any faction',
            icon: '🔄',
            category: 'faction',
            rarity: 'rare',
            unlocked: false,
            unlockedAt: null,
            condition: () => AchievementSystem.stats.redemptionArcCompleted
        },

        // --- ULTRA ACHIEVEMENT - THE FINAL REWARD ---
        // This is THE achievement. The end game. The ultimate flex.
        super_hacker: {
            id: 'super_hacker',
            name: '💻 SUPER HACKER 💻',
            description: 'Unlock EVERY achievement in the game. Debug console unlocked. Legendary reward granted.',
            icon: '🔓',
            category: 'ultra',
            rarity: 'ultra',  // New rarity tier above legendary
            unlocked: false,
            unlockedAt: null,
            hidden: true,
            isUltra: true,  // Special flag for ultra achievements
            reward: {
                item: 'blade_of_the_hacker',
                unlockDebug: true
            },
            condition: () => {
                // Must have ALL other achievements unlocked (except this one)
                const allOthers = Object.values(AchievementSystem.achievements).filter(
                    a => a.id !== 'super_hacker'
                );
                return allOthers.every(a => a.unlocked);
            }
        }
    },

    // 📊 statistics tracking - quantifying your mediocrity since day one
    // every number here is a monument to your obsession
    stats: {
        // trading stats - receipts of your capitalism addiction
        tradesCompleted: 0,
        highestProfit: 0,
        nightTrades: 0,
        maxMerchantTrades: 0,
        merchantTradeCount: {},

        // travel stats - proof you can't sit still
        locationsVisited: 0,
        uniqueLocationsVisited: new Set(),
        distanceTraveled: 0,
        journeysStarted: 0,    // 🖤 tracks when you BEGIN a journey
        journeysCompleted: 0,
        dungeonVisits: 0,
        dungeonVisitsIn5Years: 0,
        dungeonVisitLog: [],

        // combat/survival stats - violence isn't the answer but sometimes it's the only option
        encountersSurvived: 0,
        banditsDefeated: 0,
        narrowEscapes: 0,
        banditEncounters: 0,
        stealthyExplorer: true,

        // collection stats - hoarding is self care actually
        rareItemsOwned: 0,
        treasuresFound: 0,

        // luxury stats - pretending you have taste
        luxuryItemsOwned: 0,
        uniqueLuxuryItems: 0,
        silkTraded: 0,
        jewelryValue: 0,
        wineCollected: 0,
        spicesTraded: 0,
        totalLuxuryValue: 0,

        // equipment stats - dress to kill (literally)
        weaponsOwned: 0,
        armorOwned: 0,
        fullyEquipped: false,
        uniqueEquipmentOwned: 0,
        legendaryItemsOwned: 0,
        uniqueWeaponsOwned: 0,

        // crafting stats - making things is cheaper than therapy
        itemsCrafted: 0,
        tier2ItemsCrafted: 0,
        tier3ItemsCrafted: 0,
        legendaryItemsCrafted: 0,
        metalItemsCrafted: 0,
        potionsCrafted: 0,
        clothItemsCrafted: 0,

        // property stats - playing landlord simulator within a trading simulator
        propertiesOwned: 0,
        employeesHired: 0,
        currentEmployees: 0,
        maxPropertyLevel: 0,
        totalStorageCapacity: 0,

        // special/hidden stats - the secrets you don't know you're keeping
        ragsToRiches: false,
        perfectHaggles: 0,
        goldGivenAway: 0,
        longestNoRestStreak: 0,
        currentNoRestStreak: 0,
        pennyPincherEligible: true,
        maxSinglePurchase: 0,
        sunriseTrade: false,
        sunsetTrade: false,
        sunriseSunsetTrade: false,
        lastTradeDay: -1,
        fullMoonProfit: 0,
        fullMoonProfitToday: 0
    },

    // 🎉 Achievement popup queue system
    pendingAchievements: [],
    isShowingPopup: false,
    wasGamePaused: false,

    // wake up this monument to your gaming addiction
    init() {
        console.log('🏆 Achievement System awakened from its slumber... time to validate your existence');
        this.checkAchievements();
    },

    // check all achievements - wrapped in try-catch cuz errors at 3am hit different
    // collects all newly unlocked achievements like pokemon cards of sadness
    checkAchievements() {
        if (!game.player) return;

        const newlyUnlocked = [];

        for (const [id, achievement] of Object.entries(this.achievements)) {
            try {
                if (!achievement.unlocked && achievement.condition()) {
                    // Mark as unlocked but don't show popup yet
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    newlyUnlocked.push(achievement);

                    // Grant any rewards for this achievement
                    this.grantAchievementRewards(achievement);

                    console.log(`Achievement unlocked: ${achievement.name}`);
                }
            } catch (err) {
                // dont let one broken achievement check crash everything lol
                console.warn(`Achievement check failed for ${id}:`, err.message);
            }
        }

        // If any achievements were unlocked, queue them and show popup
        if (newlyUnlocked.length > 0) {
            this.saveProgress();
            this.queueAchievementPopups(newlyUnlocked);
        }
    },

    // Unlock a single achievement directly (for manual unlocks)
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();

        // Handle special rewards for achievements
        this.grantAchievementRewards(achievement);

        // Save progress
        this.saveProgress();

        // Queue and show popup
        this.queueAchievementPopups([achievement]);

        console.log(`Achievement unlocked: ${achievement.name}`);
    },

    // Grant rewards for achievements that have them
    grantAchievementRewards(achievement) {
        if (!achievement.reward) return;

        // Grant item reward
        if (achievement.reward.item && game.player) {
            const itemId = achievement.reward.item;
            if (!game.player.inventory[itemId]) {
                game.player.inventory[itemId] = 0;
            }
            game.player.inventory[itemId] += 1;
            console.log(`🎁 Achievement reward: Received ${itemId}!`);

            // Show message to player
            if (typeof addMessage === 'function') {
                addMessage(`🎁 Achievement Reward: You received the legendary ${itemId}!`);
            }
        }

        // Unlock debug console for this save
        if (achievement.reward.unlockDebug) {
            // Store in game state that debug is unlocked for this save
            if (game.player) {
                game.player.debugUnlocked = true;
            }
            console.log('🔓 DEBUG CONSOLE UNLOCKED! You are now a Super Hacker!');

            if (typeof addMessage === 'function') {
                addMessage('🔓 DEBUG CONSOLE UNLOCKED! Press ` to access debug commands!');
            }
        }
    },

    // Check if debug is unlocked for current save (via Super Hacker achievement)
    isDebugUnlockedForSave() {
        // Check if player has debugUnlocked flag
        if (game.player && game.player.debugUnlocked) {
            return true;
        }
        // Also check if super_hacker achievement is unlocked
        const superHacker = this.achievements.super_hacker;
        return superHacker && superHacker.unlocked;
    },

    // Queue achievements for popup display
    queueAchievementPopups(achievements) {
        // Add to pending queue
        this.pendingAchievements.push(...achievements);

        // If not already showing a popup, start showing
        if (!this.isShowingPopup) {
            this.showNextAchievementPopup();
        }
    },

    // Show the next achievement popup in the queue
    showNextAchievementPopup() {
        if (this.pendingAchievements.length === 0) {
            this.isShowingPopup = false;
            // Resume game if we paused it
            if (!this.wasGamePaused && typeof TimeSystem !== 'undefined') {
                TimeSystem.setSpeed('NORMAL');
            }
            return;
        }

        this.isShowingPopup = true;

        // Pause the game (remember if it was already paused)
        if (typeof TimeSystem !== 'undefined') {
            this.wasGamePaused = TimeSystem.isPaused;
            if (!this.wasGamePaused) {
                TimeSystem.setSpeed('PAUSED');
            }
        }

        // Get all pending achievements to show count
        const totalPending = this.pendingAchievements.length;
        const achievement = this.pendingAchievements.shift();

        this.showAchievementPopup(achievement, totalPending);
    },

    // Show the achievement popup overlay
    showAchievementPopup(achievement, remainingCount) {
        // Remove any existing popup
        const existingPopup = document.getElementById('achievement-popup-overlay');
        if (existingPopup) existingPopup.remove();

        // Get rarity colors
        const rarityColors = {
            common: { bg: '#4a5568', border: '#718096', glow: 'rgba(113, 128, 150, 0.5)' },
            uncommon: { bg: '#2f855a', border: '#48bb78', glow: 'rgba(72, 187, 120, 0.5)' },
            rare: { bg: '#2b6cb0', border: '#4299e1', glow: 'rgba(66, 153, 225, 0.6)' },
            legendary: { bg: '#b7791f', border: '#ecc94b', glow: 'rgba(236, 201, 75, 0.7)' },
            ultra: { bg: '#6b21a8', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.9)' }  // Purple for ULTRA
        };
        const colors = rarityColors[achievement.rarity] || rarityColors.common;

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = 'achievement-popup-overlay';
        overlay.innerHTML = `
            <div class="achievement-popup-backdrop"></div>
            <div class="achievement-popup-container">
                <div class="achievement-popup-header">
                    <div class="achievement-popup-stars">★ ★ ★</div>
                    <h2>🏆 ACHIEVEMENT UNLOCKED!</h2>
                    <div class="achievement-popup-stars">★ ★ ★</div>
                </div>
                <div class="achievement-popup-content">
                    <div class="achievement-popup-icon-wrapper">
                        <div class="achievement-popup-icon">${achievement.icon}</div>
                        <div class="achievement-popup-icon-glow"></div>
                    </div>
                    <div class="achievement-popup-name">${achievement.name}</div>
                    <div class="achievement-popup-description">${achievement.description}</div>
                    <div class="achievement-popup-rarity rarity-${achievement.rarity}">
                        ${achievement.rarity.toUpperCase()}
                    </div>
                    <div class="achievement-popup-category">
                        Category: ${achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </div>
                </div>
                <div class="achievement-popup-footer">
                    ${remainingCount > 1
                        ? `<div class="achievement-popup-more">+${remainingCount - 1} more achievement${remainingCount > 2 ? 's' : ''} unlocked!</div>`
                        : ''}
                    <button id="achievement-popup-continue-btn" class="achievement-popup-btn">
                        ${remainingCount > 1 ? '➡️ Next Achievement' : '✓ Continue'}
                    </button>
                    <div class="achievement-popup-hint">Press ENTER or click to continue</div>
                </div>
            </div>
        `;

        // Style the overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 900; /* Z-INDEX STANDARD: Critical overlays (achievements) */
            display: flex;
            align-items: center;
            justify-content: center;
            animation: achievementFadeIn 0.3s ease-out;
        `;

        document.body.appendChild(overlay);

        // Add styles if not present
        this.addAchievementPopupStyles();

        // Add click handler to continue button
        const continueBtn = document.getElementById('achievement-popup-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeAchievementPopup());
        }

        // Add keyboard handler for Enter/Escape/Space
        this._popupKeyHandler = (e) => {
            if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.closeAchievementPopup();
            }
        };
        document.addEventListener('keydown', this._popupKeyHandler, true);

        // Add click on backdrop to close
        const backdrop = overlay.querySelector('.achievement-popup-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeAchievementPopup());
        }

        // Also add message to game log
        if (typeof addMessage === 'function') {
            addMessage(`🏆 Achievement Unlocked: ${achievement.name}`);
        }

        // Play sound if available
        if (typeof AudioSystem !== 'undefined' && AudioSystem.play) {
            AudioSystem.play('achievement');
        }
    },

    // Close the current achievement popup and show next (if any)
    closeAchievementPopup() {
        // Remove keyboard handler
        if (this._popupKeyHandler) {
            document.removeEventListener('keydown', this._popupKeyHandler, true);
            this._popupKeyHandler = null;
        }

        // Animate out and remove
        const overlay = document.getElementById('achievement-popup-overlay');
        if (overlay) {
            overlay.style.animation = 'achievementFadeOut 0.2s ease-in';
            setTimeout(() => {
                overlay.remove();
                // Show next achievement or finish
                this.showNextAchievementPopup();
            }, 200);
        } else {
            this.showNextAchievementPopup();
        }
    },

    // Add CSS styles for the achievement popup
    addAchievementPopupStyles() {
        if (document.getElementById('achievement-popup-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'achievement-popup-styles';
        styles.textContent = `
            @keyframes achievementFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes achievementFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            @keyframes achievementSlideIn {
                from { transform: scale(0.8) translateY(-30px); opacity: 0; }
                to { transform: scale(1) translateY(0); opacity: 1; }
            }

            @keyframes achievementIconPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes achievementGlow {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }

            @keyframes achievementShine {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }

            @keyframes starTwinkle {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }

            .achievement-popup-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(5px);
            }

            .achievement-popup-container {
                position: relative;
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%);
                border: 3px solid #ffd700;
                border-radius: 16px;
                padding: 30px 40px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow:
                    0 0 30px rgba(255, 215, 0, 0.4),
                    0 0 60px rgba(255, 215, 0, 0.2),
                    inset 0 0 30px rgba(255, 215, 0, 0.1);
                animation: achievementSlideIn 0.4s ease-out;
            }

            .achievement-popup-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .achievement-popup-header h2 {
                color: #ffd700;
                font-size: 24px;
                margin: 0;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
                background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: achievementShine 3s linear infinite;
            }

            .achievement-popup-stars {
                color: #ffd700;
                font-size: 14px;
                letter-spacing: 5px;
                animation: starTwinkle 1.5s ease-in-out infinite;
            }

            .achievement-popup-content {
                padding: 20px 0;
            }

            .achievement-popup-icon-wrapper {
                position: relative;
                display: inline-block;
                margin-bottom: 15px;
            }

            .achievement-popup-icon {
                font-size: 72px;
                line-height: 1;
                position: relative;
                z-index: 2;
                animation: achievementIconPulse 2s ease-in-out infinite;
                filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
            }

            .achievement-popup-icon-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 1;
                animation: achievementGlow 2s ease-in-out infinite;
            }

            .achievement-popup-name {
                font-size: 28px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 10px;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }

            .achievement-popup-description {
                font-size: 16px;
                color: #b8c5d6;
                margin-bottom: 15px;
                line-height: 1.5;
            }

            .achievement-popup-rarity {
                display: inline-block;
                padding: 6px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }

            .achievement-popup-rarity.rarity-common {
                background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
                color: #e2e8f0;
                border: 1px solid #718096;
            }

            .achievement-popup-rarity.rarity-uncommon {
                background: linear-gradient(180deg, #2f855a 0%, #22543d 100%);
                color: #9ae6b4;
                border: 1px solid #48bb78;
            }

            .achievement-popup-rarity.rarity-rare {
                background: linear-gradient(180deg, #2b6cb0 0%, #2c5282 100%);
                color: #90cdf4;
                border: 1px solid #4299e1;
            }

            .achievement-popup-rarity.rarity-legendary {
                background: linear-gradient(180deg, #b7791f 0%, #975a16 100%);
                color: #faf089;
                border: 1px solid #ecc94b;
                box-shadow: 0 0 15px rgba(236, 201, 75, 0.5);
            }

            /* 💻 ULTRA RARITY - the ultimate achievement style 💻 */
            .achievement-popup-rarity.rarity-ultra {
                background: linear-gradient(180deg, #7c3aed 0%, #6b21a8 50%, #4c1d95 100%);
                color: #e9d5ff;
                border: 2px solid #a855f7;
                box-shadow: 0 0 25px rgba(168, 85, 247, 0.8), 0 0 50px rgba(168, 85, 247, 0.4);
                animation: ultra-pulse 2s ease-in-out infinite;
                text-transform: uppercase;
                font-weight: bold;
                letter-spacing: 2px;
            }

            @keyframes ultra-pulse {
                0%, 100% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.8), 0 0 50px rgba(168, 85, 247, 0.4); }
                50% { box-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 80px rgba(168, 85, 247, 0.6); }
            }

            /* Ultra achievement container gets special treatment */
            .achievement-popup-container.ultra-achievement {
                border: 3px solid #a855f7;
                box-shadow: 0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2);
                animation: ultra-glow 3s ease-in-out infinite;
            }

            @keyframes ultra-glow {
                0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2); }
                50% { box-shadow: 0 0 50px rgba(168, 85, 247, 0.9), inset 0 0 30px rgba(168, 85, 247, 0.4); }
            }

            .achievement-popup-category {
                font-size: 12px;
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .achievement-popup-footer {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 215, 0, 0.2);
            }

            .achievement-popup-more {
                color: #ffd700;
                font-size: 14px;
                margin-bottom: 15px;
                animation: starTwinkle 1s ease-in-out infinite;
            }

            .achievement-popup-btn {
                background: linear-gradient(180deg, #ffd700 0%, #b8860b 100%);
                color: #1a1a2e;
                border: none;
                padding: 12px 40px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            }

            .achievement-popup-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
                background: linear-gradient(180deg, #ffe44d 0%, #daa520 100%);
            }

            .achievement-popup-btn:active {
                transform: translateY(0);
            }

            .achievement-popup-hint {
                margin-top: 12px;
                font-size: 11px;
                color: #4a5568;
            }
        `;

        document.head.appendChild(styles);
    },

    // Legacy notification (small corner popup) - kept for compatibility
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-rarity rarity-${achievement.rarity}">${achievement.rarity.toUpperCase()}</div>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Animate in
        TimerManager.setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 5 seconds
        TimerManager.setTimeout(() => {
            notification.classList.remove('show');
            TimerManager.setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);

        // Also add message to game log
        if (typeof addMessage === 'function') {
            addMessage(`🏆 Achievement Unlocked: ${achievement.name}`);
        }
    },

    // Track trade completion
    trackTrade(profit) {
        AchievementSystem.stats.tradesCompleted++;
        if (profit > AchievementSystem.stats.highestProfit) {
            AchievementSystem.stats.highestProfit = profit;
        }
        if (profit >= 500) {
            this.checkAchievements();
        }
        this.checkAchievements();
    },

    // Track location visit
    trackLocationVisit(locationId) {
        AchievementSystem.stats.uniqueLocationsVisited.add(locationId);
        AchievementSystem.stats.locationsVisited = AchievementSystem.stats.uniqueLocationsVisited.size;
        this.checkAchievements();
    },

    // 🖤 Track journey START - when you begin traveling (for Start Your Journey achievement)
    trackJourneyStart(destinationId) {
        AchievementSystem.stats.journeysStarted++;
        console.log(`🗺️ Journey started to ${destinationId}! Total journeys started: ${AchievementSystem.stats.journeysStarted}`);
        this.checkAchievements();
    },

    // Track journey completion
    trackJourney(distance) {
        AchievementSystem.stats.journeysCompleted++;
        AchievementSystem.stats.distanceTraveled += distance;
        this.checkAchievements();
    },

    // Track encounter survival
    trackEncounter(encounterType, survived) {
        if (survived) {
            AchievementSystem.stats.encountersSurvived++;
            if (encounterType === 'bandits' || encounterType === 'highwaymen') {
                AchievementSystem.stats.banditsDefeated++;
            }
        }

        // Check for narrow escape
        if (survived && game.player && game.player.gold < 10) {
            AchievementSystem.stats.narrowEscapes++;
        }

        this.checkAchievements();
    },

    // Track treasure found
    trackTreasure() {
        AchievementSystem.stats.treasuresFound++;
        this.checkAchievements();
    },

    // Track rags to riches
    trackRagsToRiches() {
        if (!AchievementSystem.stats.ragsToRiches && game.player) {
            if (game.player.gold >= 5000) {
                // Check transaction history to see if they were ever below 10
                AchievementSystem.stats.ragsToRiches = true;
                this.checkAchievements();
            }
        }
    },

    // Get achievement progress
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        const percentage = Math.round((unlocked / total) * 100);

        return { total, unlocked, percentage };
    },

    // Get achievements by category
    getByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    },

    // Get unlocked achievements
    getUnlocked() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    },

    // Get locked achievements
    getLocked() {
        return Object.values(this.achievements).filter(a => !a.unlocked);
    },

    // engrave your accomplishments into browser memory forever
    saveProgress() {
        const saveData = {
            achievements: {},
            stats: {
                ...this.stats,
                uniqueLocationsVisited: Array.from(AchievementSystem.stats.uniqueLocationsVisited)
            }
        };

        // Save only unlocked status and unlock time
        for (const [id, achievement] of Object.entries(this.achievements)) {
            saveData.achievements[id] = {
                unlocked: achievement.unlocked,
                unlockedAt: achievement.unlockedAt
            };
        }

        localStorage.setItem('achievementProgress', JSON.stringify(saveData));
    },

    // resurrect your past glory from the localStorage crypt
    loadProgress() {
        const saved = localStorage.getItem('achievementProgress');
        if (!saved) return;

        try {
            const saveData = JSON.parse(saved);

            // Restore achievement unlock status
            if (saveData.achievements) {
                for (const [id, data] of Object.entries(saveData.achievements)) {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = data.unlocked;
                        this.achievements[id].unlockedAt = data.unlockedAt;
                    }
                }
            }

            // Restore stats
            if (saveData.stats) {
                this.stats = {
                    ...this.stats,
                    ...saveData.stats,
                    uniqueLocationsVisited: new Set(saveData.stats.uniqueLocationsVisited || [])
                };
                AchievementSystem.stats.locationsVisited = AchievementSystem.stats.uniqueLocationsVisited.size;
            }

            console.log('Achievement progress loaded');
        } catch (error) {
            console.error('Error loading achievement progress:', error);
        }
    },

    // nuke everything and start fresh - like ctrl+z for your entire existence
    reset() {
        for (const achievement of Object.values(this.achievements)) {
            achievement.unlocked = false;
            achievement.unlockedAt = null;
        }

        this.stats = {
            // Trading stats
            tradesCompleted: 0,
            highestProfit: 0,
            nightTrades: 0,
            maxMerchantTrades: 0,
            merchantTradeCount: {},

            // Travel stats
            locationsVisited: 0,
            uniqueLocationsVisited: new Set(),
            distanceTraveled: 0,
            journeysStarted: 0,
            journeysCompleted: 0,
            dungeonVisits: 0,
            dungeonVisitsIn5Years: 0,
            dungeonVisitLog: [],

            // Combat/survival stats
            encountersSurvived: 0,
            banditsDefeated: 0,
            narrowEscapes: 0,
            banditEncounters: 0,
            stealthyExplorer: true,

            // Collection stats
            rareItemsOwned: 0,
            treasuresFound: 0,

            // Luxury stats
            luxuryItemsOwned: 0,
            uniqueLuxuryItems: 0,
            silkTraded: 0,
            jewelryValue: 0,
            wineCollected: 0,
            spicesTraded: 0,
            totalLuxuryValue: 0,

            // Equipment stats
            weaponsOwned: 0,
            armorOwned: 0,
            fullyEquipped: false,
            uniqueEquipmentOwned: 0,
            legendaryItemsOwned: 0,
            uniqueWeaponsOwned: 0,

            // Crafting stats
            itemsCrafted: 0,
            tier2ItemsCrafted: 0,
            tier3ItemsCrafted: 0,
            legendaryItemsCrafted: 0,
            metalItemsCrafted: 0,
            potionsCrafted: 0,
            clothItemsCrafted: 0,

            // Property stats
            propertiesOwned: 0,
            employeesHired: 0,
            currentEmployees: 0,
            maxPropertyLevel: 0,
            totalStorageCapacity: 0,

            // Special/hidden stats
            ragsToRiches: false,
            perfectHaggles: 0,
            goldGivenAway: 0,
            longestNoRestStreak: 0,
            currentNoRestStreak: 0,
            pennyPincherEligible: true,
            maxSinglePurchase: 0,
            sunriseTrade: false,
            sunsetTrade: false,
            sunriseSunsetTrade: false,
            lastTradeDay: -1,
            fullMoonProfit: 0,
            fullMoonProfitToday: 0
        };

        this.saveProgress();
        console.log('All achievements reset');
    }
};

// ===== UI FUNCTIONS =====
// where we pretend the interface doesn't cause us pain

// summon the achievement shrine from the void
function openAchievementPanel() {
    const overlay = document.getElementById('achievement-overlay');
    if (overlay) {
        overlay.classList.add('active');
        populateAchievements();
        updateAchievementProgress();
    }
}

// banish the achievement panel back to the shadow realm
function closeAchievementPanel() {
    const overlay = document.getElementById('achievement-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// fill the panel with your digital trophies of desperation
function populateAchievements(category = 'all') {
    const grid = document.getElementById('achievement-grid');
    if (!grid) return;

    grid.innerHTML = '';

    let achievements = Object.values(AchievementSystem.achievements);

    // Filter by category
    if (category !== 'all') {
        achievements = achievements.filter(a => a.category === category);
    }

    // Sort: unlocked first, then by category
    achievements.sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return a.category.localeCompare(b.category);
    });

    // Create achievement cards
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;

        const unlockedDate = achievement.unlockedAt
            ? new Date(achievement.unlockedAt).toLocaleDateString()
            : '';

        card.innerHTML = `
            <div class="achievement-card-icon">${achievement.icon}</div>
            <div class="achievement-card-name">${achievement.name}</div>
            <div class="achievement-card-description">${achievement.description}</div>
            <div class="achievement-card-footer">
                <div class="achievement-rarity rarity-${achievement.rarity}">${achievement.rarity.toUpperCase()}</div>
                ${achievement.unlocked
                    ? `<div class="achievement-unlocked-badge">UNLOCKED</div>`
                    : `<div class="achievement-locked-badge">LOCKED</div>`
                }
            </div>
            ${achievement.unlocked && unlockedDate
                ? `<div class="achievement-date">Unlocked on ${unlockedDate}</div>`
                : ''
            }
        `;

        grid.appendChild(card);
    });
}

// Filter achievements by category - called by onclick handlers cuz EventManager is being a lil brat
// like when ur code works in ur head but not in reality... story of my life tbh
function filterAchievements(button, category) {
    // yeet the active class from all buttons like they ghosted me
    const categoryButtons = document.querySelectorAll('.achievement-category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));

    // crown the clicked button as the chosen one
    button.classList.add('active');

    // summon the achievements for this dark ritual... i mean category
    populateAchievements(category);
}

// Update achievement progress display
function updateAchievementProgress() {
    const progress = AchievementSystem.getProgress();
    const progressText = document.getElementById('achievement-progress-text');
    const progressFill = document.getElementById('achievement-progress-fill');

    if (progressText) {
        progressText.textContent = `${progress.unlocked} / ${progress.total} (${progress.percentage}%)`;
    }

    if (progressFill) {
        progressFill.style.width = `${progress.percentage}%`;
    }
}

// Setup achievement category buttons
function setupAchievementCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.achievement-category-btn');

    categoryButtons.forEach(button => {
        EventManager.addEventListener(button, 'click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Get category
            const category = button.getAttribute('data-category');

            // Populate achievements for this category
            populateAchievements(category);
        });
    });
}

// Initialize on game load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            AchievementSystem.loadProgress();
            AchievementSystem.init();
            setupAchievementCategoryButtons();
        }, 200);
    });
} else {
    setTimeout(() => {
        AchievementSystem.loadProgress();
        AchievementSystem.init();
        setupAchievementCategoryButtons();
    }, 200);
}
