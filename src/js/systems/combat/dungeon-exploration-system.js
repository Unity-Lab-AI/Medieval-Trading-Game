// 
// DUNGEON EXPLORATION SYSTEM - greed meets darkness
// 
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

console.log('🏚️ DungeonExplorationSystem crawling out of the shadows...');

const DungeonExplorationSystem = {
    // 
    //  EXPLORATION LOOT - trinkets worth dying for (or getting close)
    // 
    // these are the juicy collectibles that only exist in dark scary places
    // merchants will buy them because they're too scared to get them themselves

    EXPLORATION_LOOT: {
        // === COMMON DUNGEON FINDS (50-150 gold) ===
        ancient_coin: {
            id: 'ancient_coin',
            name: 'Ancient Coin',
            description: 'A coin from a forgotten era. Collectors pay well for these tarnished memories.',
            icon: '🪙',
            category: 'treasure',
            rarity: 'common',
            weight: 0.1,
            basePrice: 65,
            stackable: true,
            loreText: 'The face on this coin belongs to a king nobody remembers. How comforting.'
        },
        dusty_tome: {
            id: 'dusty_tome',
            name: 'Dusty Tome',
            description: 'An ancient book. Most pages are illegible, but scholars still want it.',
            icon: '📕',
            category: 'treasure',
            rarity: 'common',
            weight: 2,
            basePrice: 85,
            stackable: true,
            loreText: 'Chapter 1: How to Not Die in Dungeons. The rest of the pages are missing. Ominous.'
        },
        rusted_medallion: {
            id: 'rusted_medallion',
            name: 'Rusted Medallion',
            description: 'A corroded medallion with barely visible engravings.',
            icon: '🎖️',
            category: 'treasure',
            rarity: 'common',
            weight: 0.3,
            basePrice: 55,
            stackable: true,
            loreText: 'Awarded for bravery. Or stupidity. Hard to tell the difference down here.'
        },
        bone_fragment: {
            id: 'bone_fragment',
            name: 'Mysterious Bone Fragment',
            description: 'A fragment of something that was once alive. Alchemists pay for these.',
            icon: '🦴',
            category: 'treasure',
            rarity: 'common',
            weight: 0.2,
            basePrice: 45,
            stackable: true,
            loreText: 'From what creature? Best not to ask. Best not to know.'
        },
        cave_mushroom: {
            id: 'cave_mushroom',
            name: 'Glowing Cave Mushroom',
            description: 'A bioluminescent fungus from deep caves. Apothecaries value its properties.',
            icon: '🍄',
            category: 'treasure',
            rarity: 'common',
            weight: 0.1,
            basePrice: 40,
            stackable: true,
            consumable: true,
            effects: { health: 5, happiness: -5 },
            loreText: 'Edible, probably. The hallucinations are just a bonus feature.'
        },

        // === UNCOMMON FINDS (150-350 gold) ===
        skull_goblet: {
            id: 'skull_goblet',
            name: 'Skull Goblet',
            description: 'A drinking vessel made from... you know what? Nevermind. Worth gold.',
            icon: '💀',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 1,
            basePrice: 175,
            stackable: true,
            loreText: 'Drink from your enemies. Very metal. Very unsanitary.'
        },
        enchanted_quill: {
            id: 'enchanted_quill',
            name: 'Enchanted Quill',
            description: 'A quill that never runs dry. Scribes would kill for this. Some have.',
            icon: '🪶',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 0.1,
            basePrice: 220,
            stackable: true,
            loreText: 'Infinite ink but questionable spelling. Magic has priorities.'
        },
        obsidian_shard: {
            id: 'obsidian_shard',
            name: 'Obsidian Shard',
            description: 'A sharp fragment of volcanic glass. Used in dark rituals or fancy letter openers.',
            icon: '🔮',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 185,
            stackable: true,
            loreText: 'Cuts through reality almost as well as it cuts through fingers.'
        },
        silver_candelabra: {
            id: 'silver_candelabra',
            name: 'Silver Candelabra',
            description: 'An ornate candle holder. Probably haunted. Definitely valuable.',
            icon: '🕯️',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 3,
            basePrice: 280,
            stackable: false,
            loreText: 'The candles relight themselves at midnight. Just a coincidence, surely.'
        },
        ancient_seal: {
            id: 'ancient_seal',
            name: 'Ancient Wax Seal',
            description: 'A seal from a noble house that no longer exists. Historians pay premium.',
            icon: '📜',
            category: 'treasure',
            rarity: 'uncommon',
            weight: 0.2,
            basePrice: 195,
            stackable: true,
            loreText: 'House Darkvein: "In Shadow We Trust." They should have trusted in walls.'
        },

        // === RARE FINDS (350-700 gold) ===
        cursed_mirror: {
            id: 'cursed_mirror',
            name: 'Cursed Mirror',
            description: 'Shows your reflection... slightly delayed. Collectors find this fascinating.',
            icon: '🪞',
            category: 'treasure',
            rarity: 'rare',
            weight: 2,
            basePrice: 450,
            stackable: false,
            loreText: 'Your reflection smiles when you dont. How delightfully concerning.'
        },
        dragon_scale: {
            id: 'dragon_scale',
            name: 'Dragon Scale',
            description: 'A single scale from a dragon. Armor smiths dream of these.',
            icon: '🐉',
            category: 'treasure',
            rarity: 'rare',
            weight: 1,
            basePrice: 550,
            stackable: true,
            loreText: 'The dragon who lost this probably wants it back. Run faster.'
        },
        spirit_lantern: {
            id: 'spirit_lantern',
            name: 'Spirit Lantern',
            description: 'A lantern that glows without fuel. The light whispers sometimes.',
            icon: '🏮',
            category: 'treasure',
            rarity: 'rare',
            weight: 1.5,
            basePrice: 480,
            stackable: false,
            loreText: 'It lights your way and judges your life choices. Multifunctional.'
        },
        demon_tooth: {
            id: 'demon_tooth',
            name: 'Demon Tooth',
            description: 'A fang from something that shouldnt exist. Warlocks collect these.',
            icon: '🦷',
            category: 'treasure',
            rarity: 'rare',
            weight: 0.3,
            basePrice: 520,
            stackable: true,
            loreText: 'Still warm. Always warm. Why is it still warm?!'
        },
        void_crystal: {
            id: 'void_crystal',
            name: 'Void Crystal',
            description: 'A crystal that absorbs light. Looking too long causes existential dread.',
            icon: '💎',
            category: 'treasure',
            rarity: 'rare',
            weight: 0.5,
            basePrice: 625,
            stackable: true,
            loreText: 'Stare into the void, the void stares back, then charges you rent.'
        },

        // === EPIC FINDS (700-1500 gold) ===
        lich_phylactery_fragment: {
            id: 'lich_phylactery_fragment',
            name: 'Phylactery Fragment',
            description: 'A piece of a lichs soul container. Necromancers pay... a lot.',
            icon: '⚱️',
            category: 'treasure',
            rarity: 'epic',
            weight: 0.5,
            basePrice: 950,
            stackable: true,
            loreText: 'Contains 3% of an evil soul. Still more soul than most tax collectors.'
        },
        ancient_crown: {
            id: 'ancient_crown',
            name: 'Forgotten Kings Crown',
            description: 'A crown from a dynasty erased from history. The gems alone are worth a fortune.',
            icon: '👑',
            category: 'treasure',
            rarity: 'epic',
            weight: 1,
            basePrice: 1200,
            stackable: false,
            loreText: 'Wearing it gives you delusions of grandeur. Or maybe thats just ambition.'
        },
        blood_ruby: {
            id: 'blood_ruby',
            name: 'Blood Ruby',
            description: 'A ruby that pulses like a heartbeat. Its origin is best left unexplored.',
            icon: '❤️',
            category: 'treasure',
            rarity: 'epic',
            weight: 0.2,
            basePrice: 1100,
            stackable: true,
            loreText: 'Beats in time with your heart. Stops when you stop. Comforting.'
        },
        shadow_cloak_remnant: {
            id: 'shadow_cloak_remnant',
            name: 'Shadow Cloak Remnant',
            description: 'Fabric woven from actual darkness. Tailors have no idea what to do with it.',
            icon: '🧥',
            category: 'treasure',
            rarity: 'epic',
            weight: 0.1,
            basePrice: 875,
            stackable: true,
            loreText: 'Makes you 40% more mysterious, 60% more likely to trip in daylight.'
        },

        // === LEGENDARY FINDS (1500+ gold) ===
        tear_of_eternity: {
            id: 'tear_of_eternity',
            name: 'Tear of Eternity',
            description: 'A crystallized tear from an immortal being. Worth more than most kingdoms.',
            icon: '💧',
            category: 'treasure',
            rarity: 'legendary',
            weight: 0.1,
            basePrice: 2500,
            stackable: true,
            loreText: 'An immortal cried once. Just once. This is all that remains of that moment.'
        },
        world_shard: {
            id: 'world_shard',
            name: 'World Shard',
            description: 'A fragment of reality itself. Mages theorize about these. Fools touch them.',
            icon: '🌍',
            category: 'treasure',
            rarity: 'legendary',
            weight: 0.3,
            basePrice: 3500,
            stackable: false,
            loreText: 'Contains a piece of a world that might have been. Or might yet be. Time is weird.'
        },

        // 
        //  VENDOR TRASH TRINKETS - worthless to you, gold to merchants
        // 
        // these exist solely to pad your pockets via merchant sympathy
        // no use, no purpose, just cold hard profit potential

        tarnished_spoon: {
            id: 'tarnished_spoon',
            name: 'Tarnished Silver Spoon',
            description: 'A spoon so tarnished even the rats wont eat with it. Merchants buy anything.',
            icon: '🥄',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 0.1,
            basePrice: 12,
            stackable: true,
            vendorOnly: true,
            loreText: 'Born with silver spoon. Died with tarnished one. Such is life in the dungeon.'
        },
        broken_pottery: {
            id: 'broken_pottery',
            name: 'Broken Pottery Shards',
            description: 'Fragments of ancient pottery. Worthless to you, fascinating to collectors.',
            icon: '🏺',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 0.5,
            basePrice: 8,
            stackable: true,
            vendorOnly: true,
            loreText: 'Once held wine for kings. Now holds disappointment for adventurers.'
        },
        moth_eaten_tapestry: {
            id: 'moth_eaten_tapestry',
            name: 'Moth-Eaten Tapestry Scrap',
            description: 'A tattered piece of fabric depicting... something. Moths ate the good parts.',
            icon: '🧵',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 0.3,
            basePrice: 15,
            stackable: true,
            vendorOnly: true,
            loreText: 'Shows half a horse and what might be a cloud. Or a sheep. Art is subjective.'
        },
        cracked_lens: {
            id: 'cracked_lens',
            name: 'Cracked Monocle Lens',
            description: 'A shattered lens from some nobles eyepiece. See the world fractured.',
            icon: '🔍',
            category: 'vendor_trash',
            rarity: 'uncommon',
            weight: 0.05,
            basePrice: 25,
            stackable: true,
            vendorOnly: true,
            loreText: 'The noble who wore this saw their death coming. Didnt help much.'
        },
        bent_candlestick: {
            id: 'bent_candlestick',
            name: 'Bent Brass Candlestick',
            description: 'Someone used this as a weapon. The dent proves it worked. Once.',
            icon: '🕯️',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 1.5,
            basePrice: 18,
            stackable: true,
            vendorOnly: true,
            loreText: 'In the darkness, everything is a weapon. This one has a skull-shaped dent.'
        },
        rusty_lockbox: {
            id: 'rusty_lockbox',
            name: 'Empty Rusty Lockbox',
            description: 'The lock rusted shut years ago. Whatever was inside is long gone.',
            icon: '📦',
            category: 'vendor_trash',
            rarity: 'uncommon',
            weight: 2,
            basePrice: 35,
            stackable: false,
            vendorOnly: true,
            loreText: 'The real treasure was the futile hope you felt trying to open it.'
        },
        faded_love_letter: {
            id: 'faded_love_letter',
            name: 'Faded Love Letter',
            description: 'The ink has bled into obscurity. The romance is deader than its writer.',
            icon: '💌',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 0.01,
            basePrice: 5,
            stackable: true,
            vendorOnly: true,
            loreText: 'Dearest... something. I love your... smudge. Forever yours... ink blob.'
        },
        chipped_tea_set: {
            id: 'chipped_tea_set',
            name: 'Chipped Tea Set Piece',
            description: 'Part of an ornate tea set. The chip makes it worthless. Almost.',
            icon: '🍵',
            category: 'vendor_trash',
            rarity: 'uncommon',
            weight: 0.4,
            basePrice: 28,
            stackable: true,
            vendorOnly: true,
            loreText: 'Fine dining in the dungeon lasted until the first skeleton attack.'
        },
        corroded_belt_buckle: {
            id: 'corroded_belt_buckle',
            name: 'Corroded Belt Buckle',
            description: 'Ornate but ruined. The belt rotted centuries ago.',
            icon: '🔗',
            category: 'vendor_trash',
            rarity: 'common',
            weight: 0.2,
            basePrice: 10,
            stackable: true,
            vendorOnly: true,
            loreText: 'Held up someones pants in life. Holds up nothing in death.'
        },
        crumbling_journal: {
            id: 'crumbling_journal',
            name: 'Crumbling Journal',
            description: 'Pages fall apart when touched. The last entry reads: "They are coming—"',
            icon: '📓',
            category: 'vendor_trash',
            rarity: 'uncommon',
            weight: 0.5,
            basePrice: 22,
            stackable: true,
            vendorOnly: true,
            loreText: 'Day 47: Still lost. Day 48: Found exit! Day 49: It was a trap. Day 50: [blank]'
        }
    },

    // 
    //  EXPLORATION EVENTS - choices that define your doom
    // 
    // each event has choices, each choice has consequences
    // some paths lead to glory, others to an unmarked grave

    EXPLORATION_EVENTS: {
        // === DUNGEON EVENTS ===
        dungeon_altar: {
            id: 'dungeon_altar',
            name: 'The Forgotten Altar',
            description: 'A crumbling altar sits in the darkness, ancient offerings scattered around it. Something watches from the shadows.',
            icon: '⛩️',
            locationType: ['dungeon'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'pray',
                    text: '🙏 Pray at the altar',
                    preview: 'Risk: Low health drain. Could receive blessing or curse.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 5, max: 10 },
                    //  Outcome weight distribution (must total 100): 
                    // 40% blessing - reward the faithful with health + decent loot
                    // 35% neutral - gods are AFK, you get participation trophy (dusty tome)
                    // 25% curse - dark gods demand sacrifice, health penalty but consolation loot
                    // This creates a risk/reward that slightly favors the player while keeping tension high
                    outcomes: [
                        { weight: 40, type: 'blessing', message: 'The altar glows warmly. You feel... blessed? Weird.', healthBonus: 20, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'neutral', message: 'Nothing happens. The gods are busy or just dont care.', loot: ['dusty_tome'] },
                        { weight: 25, type: 'curse', message: 'A cold chill runs through you. That was definitely a curse.', healthPenalty: 15, loot: ['bone_fragment', 'bone_fragment', 'bone_fragment'] }
                    ]
                },
                {
                    id: 'loot_offerings',
                    text: '💰 Steal the offerings',
                    preview: 'Risk: Moderate health drain. Guaranteed loot but may anger spirits.',
                    healthCost: { min: 10, max: 25 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 50, type: 'success', message: 'You pocket the valuables. The spirits are too dead to stop you.', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion', 'obsidian_shard', 'tarnished_spoon', 'bent_candlestick'] },
                        { weight: 30, type: 'partial', message: 'A spectral hand slaps yours! You grab what you can.', healthPenalty: 10, loot: ['ancient_coin', 'bone_fragment', 'broken_pottery'] },
                        { weight: 20, type: 'disaster', message: 'VERY angry spirits! You flee with minor burns.', healthPenalty: 25, loot: ['bone_fragment', 'moth_eaten_tapestry'] }
                    ]
                },
                {
                    id: 'leave_it',
                    text: '🚪 Leave it alone',
                    preview: 'Risk: None. But no reward either. Coward.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You walk away. Smart? Yes. Boring? Also yes.', loot: [] }
                    ]
                }
            ]
        },

        dungeon_chest: {
            id: 'dungeon_chest',
            name: 'The Suspicious Chest',
            description: 'A wooden chest sits conspicuously in the middle of the room. Its not even dusty. Thats suspicious.',
            icon: '📦',
            locationType: ['dungeon', 'ruins'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'open_carefully',
                    text: '🔓 Open carefully',
                    preview: 'Risk: Low. Patient approach, decent rewards.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 60, type: 'success', message: 'No traps! Just loot! Today is a good day.', loot: ['ancient_coin', 'dusty_tome', 'rusted_medallion', 'cracked_lens', 'chipped_tea_set'] },
                        { weight: 30, type: 'trap', message: 'A small needle pricks your finger. Ow.', healthPenalty: 5, loot: ['ancient_coin', 'ancient_coin', 'faded_love_letter'] },
                        { weight: 10, type: 'rare', message: 'A hidden compartment reveals extra treasure!', loot: ['skull_goblet', 'ancient_seal', 'ancient_coin', 'rusty_lockbox'] }
                    ]
                },
                {
                    id: 'smash_open',
                    text: '💪 Smash it open',
                    preview: 'Risk: Moderate. Fast but dangerous. Very you.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 40, type: 'success', message: 'SMASH! Loot everywhere! Violence IS the answer!', loot: ['ancient_coin', 'ancient_coin', 'bone_fragment', 'bone_fragment', 'broken_pottery', 'bent_candlestick'] },
                        { weight: 35, type: 'trap', message: 'Poison gas! You hold your breath but still inhale some.', healthPenalty: 15, loot: ['ancient_coin', 'corroded_belt_buckle'] },
                        { weight: 25, type: 'disaster', message: 'The chest was a mimic! Well, WAS a mimic. Its dead now. You are hurt.', healthPenalty: 25, loot: ['demon_tooth', 'moth_eaten_tapestry'] }
                    ]
                },
                {
                    id: 'kick_and_run',
                    text: '🦵 Kick it and run',
                    preview: 'Risk: Variable. Chaotic. Could go either way.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 25, max: 35 },
                    outcomes: [
                        { weight: 50, type: 'funny', message: 'It was just a normal chest. It falls over. Loot spills. You feel silly.', loot: ['ancient_coin', 'dusty_tome', 'tarnished_spoon', 'broken_pottery'] },
                        { weight: 30, type: 'trap', message: 'Arrows shoot out! You dodge most of them!', healthPenalty: 10, loot: ['ancient_coin', 'faded_love_letter'] },
                        { weight: 20, type: 'hilarious', message: 'The chest screams and runs away! What?! You find dropped coins.', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'crumbling_journal'] }
                    ]
                }
            ]
        },

        dungeon_well: {
            id: 'dungeon_well',
            name: 'The Wishing Well',
            description: 'A stone well sits in the chamber. Coins glitter at the bottom. You hear faint whispers rising from the depths.',
            icon: '⛲',
            locationType: ['dungeon', 'ruins', 'cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'toss_coin',
                    text: '🪙 Toss a coin and make a wish',
                    preview: 'Risk: Costs 10 gold. Wishes may or may not come true. Spoiler: they wont.',
                    goldCost: 10,
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 25, type: 'granted', message: 'Your coin glows! Something rises from the well!', loot: ['enchanted_quill', 'ancient_coin', 'ancient_coin', 'void_crystal'] },
                        { weight: 30, type: 'neutral', message: 'The coin sinks. Silence. Well, at least you made a wish.', loot: ['tarnished_spoon'] },
                        { weight: 25, type: 'bonus', message: 'All the coins in the well fly up! Free money!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'cracked_lens', 'corroded_belt_buckle'] },
                        { weight: 10, type: 'cursed', message: 'The well laughs. YOUR coin comes back. Wet. And... warm?', healthPenalty: 5, goldBonus: 10, loot: ['bone_fragment', 'faded_love_letter'] },
                        { weight: 10, type: 'legendary', message: 'THE WELL ERUPTS! A treasure lost for ages surfaces!', loot: ['tear_of_eternity', 'ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'climb_down',
                    text: '🧗 Climb down into the well',
                    preview: 'Risk: High health/stamina drain. But SO much treasure potential.',
                    healthCost: { min: 15, max: 35 },
                    staminaCost: { min: 30, max: 50 },
                    outcomes: [
                        { weight: 20, type: 'jackpot', message: 'Treasure! So many coins! And something... shinier!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet', 'void_crystal', 'blood_ruby'] },
                        { weight: 35, type: 'success', message: 'You grab handfuls of coins. Your pockets are heavy.', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'rusted_medallion', 'rusty_lockbox', 'bent_candlestick'] },
                        { weight: 25, type: 'scary', message: 'Something grabs your ankle! You climb up FAST.', healthPenalty: 20, loot: ['ancient_coin', 'ancient_coin', 'chipped_tea_set'] },
                        { weight: 15, type: 'monster', message: 'Theres something living down here! Fight!', healthPenalty: 35, loot: ['demon_tooth', 'bone_fragment', 'ancient_coin', 'spirit_lantern'] },
                        { weight: 5, type: 'legendary_find', message: 'At the very bottom, wrapped in ancient cloth, something GLOWS!', loot: ['world_shard', 'ancient_coin', 'ancient_coin', 'ancient_seal'] }
                    ]
                },
                {
                    id: 'drink_water',
                    text: '💧 Drink from the well',
                    preview: 'Risk: Unknown. Its dungeon water. This is a bad idea.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 20, type: 'healing', message: 'Its... actually refreshing? Magical healing water!', healthBonus: 30, loot: [] },
                        { weight: 30, type: 'neutral', message: 'Tastes like regular water. What did you expect?', loot: [] },
                        { weight: 30, type: 'sick', message: 'That was NOT water. You feel terrible.', healthPenalty: 15, loot: [] },
                        { weight: 20, type: 'weird', message: 'You see visions of treasure! And also your own grave. Neat.', loot: ['cave_mushroom', 'cave_mushroom'] }
                    ]
                }
            ]
        },

        // === CAVE EVENTS ===
        cave_narrow_passage: {
            id: 'cave_narrow_passage',
            name: 'The Narrow Passage',
            description: 'A crack in the cave wall leads somewhere. You cant see whats on the other side, but you smell... gold? Can you smell gold?',
            icon: '🕳️',
            locationType: ['cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'squeeze_through',
                    text: '🐍 Squeeze through',
                    preview: 'Risk: Moderate health/stamina. Claustrophobia not included.',
                    healthCost: { min: 10, max: 25 },
                    staminaCost: { min: 25, max: 40 },
                    outcomes: [
                        { weight: 35, type: 'treasure_room', message: 'A hidden chamber! Untouched for centuries!', loot: ['void_crystal', 'ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 30, type: 'success', message: 'You find a small cache of valuables. Worth the scrapes.', loot: ['ancient_coin', 'ancient_coin', 'cave_mushroom', 'cave_mushroom'] },
                        { weight: 20, type: 'stuck', message: 'You get stuck briefly. Panic. Then freedom. Mostly.', healthPenalty: 10, loot: ['cave_mushroom'] },
                        { weight: 15, type: 'collapse', message: 'Rocks shift! You scramble back, bruised but alive.', healthPenalty: 20, loot: [] }
                    ]
                },
                {
                    id: 'widen_passage',
                    text: 'Try to widen it',
                    preview: 'Risk: High stamina drain. Requires patience. Do you have patience?',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 35, max: 50 },
                    toolRequired: 'pickaxe',
                    outcomes: [
                        { weight: 40, type: 'success', message: 'Patient work pays off! A larger chamber awaits!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard', 'obsidian_shard'] },
                        { weight: 35, type: 'partial', message: 'You make progress but get tired. Some loot at least.', loot: ['ancient_coin', 'cave_mushroom'] },
                        { weight: 25, type: 'noise', message: 'The noise attracts cave bats! They leave... gifts.', healthPenalty: 5, loot: ['bone_fragment', 'bone_fragment', 'cave_mushroom'] }
                    ]
                },
                {
                    id: 'listen_closely',
                    text: '👂 Listen at the crack',
                    preview: 'Risk: None. Information is power. Or paranoia.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'info', message: 'You hear dripping water. Nothing dangerous.', loot: [] },
                        { weight: 30, type: 'warning', message: 'You hear growling. Good thing you didnt go in!', loot: [] },
                        { weight: 20, type: 'discovery', message: 'A gold coin rolls out! Something pushed it!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 10, type: 'creepy', message: 'You hear whispering. In YOUR name. Time to leave.', loot: [] }
                    ]
                }
            ]
        },

        cave_underground_lake: {
            id: 'cave_underground_lake',
            name: 'The Underground Lake',
            description: 'A still, black lake stretches before you. Bioluminescent creatures give it an eerie glow. Something shimmers beneath the surface.',
            icon: '🌊',
            locationType: ['cave'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'dive_deep',
                    text: '🏊 Dive into the depths',
                    preview: 'Risk: Very high. Drowning is a real concern. But the treasure...',
                    healthCost: { min: 20, max: 45 },
                    staminaCost: { min: 40, max: 60 },
                    outcomes: [
                        { weight: 20, type: 'legendary', message: 'At the bottom! A chest! You grab everything!', loot: ['tear_of_eternity', 'ancient_coin', 'ancient_coin', 'void_crystal'] },
                        { weight: 30, type: 'success', message: 'You find a submerged shrine with offerings!', loot: ['spirit_lantern', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'close_call', message: 'Something brushes your leg! You surface FAST.', healthPenalty: 15, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'monster', message: 'A lake creature attacks! You barely escape!', healthPenalty: 35, loot: ['dragon_scale'] }
                    ]
                },
                {
                    id: 'skim_surface',
                    text: '🎣 Search the shallows',
                    preview: 'Risk: Moderate. Safer but less rewarding. For cowards.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 40, type: 'success', message: 'You find coins and trinkets washed to the shore!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 35, type: 'decent', message: 'Some glowing mushrooms and a few coins.', loot: ['cave_mushroom', 'cave_mushroom', 'ancient_coin'] },
                        { weight: 25, type: 'surprise', message: 'A pearl! Right there in the shallow water!', loot: ['void_crystal', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'throw_stone',
                    text: '🪨 Throw a stone to test depth',
                    preview: 'Risk: None. Scientific approach. Very responsible.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 50, type: 'nothing', message: 'Plop. Its deep. Now you know.', loot: [] },
                        { weight: 30, type: 'disturb', message: 'The stone wakes something. It throws the stone BACK.', healthPenalty: 5, loot: [] },
                        { weight: 20, type: 'lucky', message: 'Your stone hits something metal! It floats up!', loot: ['silver_candelabra'] }
                    ]
                }
            ]
        },

        // === RUINS EVENTS ===
        ruins_library: {
            id: 'ruins_library',
            name: 'The Collapsed Library',
            description: 'Shelves of ancient books lie scattered. Most are rotted, but some look... valuable. And possibly cursed.',
            icon: '📚',
            locationType: ['ruins'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_thoroughly',
                    text: '🔍 Search methodically',
                    preview: 'Risk: Low health, moderate stamina. Patience finds treasures.',
                    healthCost: { min: 5, max: 10 },
                    staminaCost: { min: 20, max: 35 },
                    outcomes: [
                        { weight: 40, type: 'scholar', message: 'You find several valuable manuscripts!', loot: ['dusty_tome', 'dusty_tome', 'enchanted_quill', 'ancient_seal'] },
                        { weight: 35, type: 'decent', message: 'A few readable books and some coins hidden in pages.', loot: ['dusty_tome', 'ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'cursed_book', message: 'One book bites you. Literally. Still valuable though.', healthPenalty: 10, loot: ['dusty_tome', 'dusty_tome', 'bone_fragment'] }
                    ]
                },
                {
                    id: 'grab_and_go',
                    text: '🏃 Grab whatever looks valuable',
                    preview: 'Risk: Variable. Speed vs quality. Your call, speedster.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 35, type: 'lucky', message: 'Your random grabbing finds a rare tome!', loot: ['dusty_tome', 'dusty_tome', 'ancient_seal'] },
                        { weight: 40, type: 'average', message: 'Mostly worthless... mostly.', loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 25, type: 'trap', message: 'You trigger a magical ward! Zap!', healthPenalty: 15, loot: ['bone_fragment'] }
                    ]
                },
                {
                    id: 'check_desks',
                    text: '🗄️ Search the scholars desks',
                    preview: 'Risk: Low. Scholars always hide the good stuff.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 20 },
                    outcomes: [
                        { weight: 35, type: 'secret', message: 'A hidden drawer! Personal collection!', loot: ['enchanted_quill', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'normal', message: 'Notes, quills, and some coins. Scholars lived well.', loot: ['ancient_coin', 'ancient_coin', 'dusty_tome'] },
                        { weight: 25, type: 'ghost', message: 'A ghostly scholar appears! "THATS MY DESK!" You run.', healthPenalty: 5, loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        ruins_throne_room: {
            id: 'ruins_throne_room',
            name: 'The Fallen Throne',
            description: 'A crumbling throne sits atop a dais. The crown is gone, but the room still reeks of ancient power... and ancient traps.',
            icon: '🪑',
            locationType: ['ruins', 'dungeon'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'sit_throne',
                    text: '👑 Sit upon the throne',
                    preview: 'Risk: High. Either very rewarding or very deadly. No middle ground.',
                    healthCost: { min: 10, max: 30 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 25, type: 'crowned', message: 'A spectral voice names you worthy! Treasure appears!', loot: ['ancient_crown', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'test', message: 'The throne tests you. You pass. Barely.', healthPenalty: 15, loot: ['blood_ruby', 'ancient_seal'] },
                        { weight: 25, type: 'rejection', message: 'NOT WORTHY! The throne zaps you off!', healthPenalty: 30, loot: ['bone_fragment', 'bone_fragment'] },
                        { weight: 20, type: 'nothing', message: 'Its just an old chair. Uncomfortable too.', loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'search_room',
                    text: '🔎 Search the throne room',
                    preview: 'Risk: Moderate. Thorough is better than reckless. Usually.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 25, max: 40 },
                    outcomes: [
                        { weight: 35, type: 'hidden', message: 'Behind a tapestry! A royal stash!', loot: ['ancient_seal', 'ancient_coin', 'ancient_coin', 'silver_candelabra'] },
                        { weight: 35, type: 'decent', message: 'You find scattered valuables.', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 30, type: 'trap', message: 'Floor trap! The royals were paranoid!', healthPenalty: 20, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'check_throne',
                    text: '🔧 Examine the throne mechanism',
                    preview: 'Risk: Low. Intelligence over bravado. How boring of you.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 40, type: 'mechanism', message: 'A hidden compartment! The king hid stuff!', loot: ['blood_ruby', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'info', message: 'You find a safe way to access the treasury hint.', loot: ['ancient_seal', 'ancient_coin'] },
                        { weight: 25, type: 'spring', message: 'You accidentally trigger a mechanism. Coins spray everywhere!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                }
            ]
        },

        // === MINE EVENTS (for deep mines) ===
        mine_dig_spot: {
            id: 'mine_dig_spot',
            name: 'Promising Dig Site',
            description: 'The rock here glitters differently. Could be a vein of something valuable... or just pyrite. Fools gold for fools.',
            icon: '',
            locationType: ['mine', 'cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'dig_carefully',
                    text: 'Dig carefully',
                    preview: 'Risk: High stamina drain. Mining is hard work.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 35, max: 50 },
                    toolRequired: 'pickaxe',
                    outcomes: [
                        { weight: 30, type: 'gold_vein', message: 'GOLD! An actual gold vein! Your patience pays off!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 35, type: 'gems', message: 'Gemstones! Several valuable crystals!', loot: ['void_crystal', 'obsidian_shard', 'obsidian_shard'] },
                        { weight: 25, type: 'common', message: 'Just regular ore, but still worth something.', loot: ['ancient_coin', 'ancient_coin', 'broken_pottery'] },
                        { weight: 10, type: 'collapse', message: 'Unstable! Small cave-in! You escape with minor injuries.', healthPenalty: 20, loot: ['ancient_coin', 'corroded_belt_buckle'] }
                    ]
                },
                {
                    id: 'blast_it',
                    text: '💥 Use explosives',
                    preview: 'Risk: Variable. Big boom = big rewards or big problems.',
                    healthCost: { min: 10, max: 30 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 25, type: 'jackpot', message: 'BOOM! Everything valuable is now accessible!', loot: ['void_crystal', 'obsidian_shard', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'success', message: 'Good blast! Some valuables uncovered.', loot: ['obsidian_shard', 'ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'too_much', message: 'Too much powder! Your ears ring and youre bruised.', healthPenalty: 20, loot: ['ancient_coin', 'ancient_coin', 'bent_candlestick'] },
                        { weight: 15, type: 'disaster', message: 'Major cave-in! You barely escape!', healthPenalty: 35, loot: ['bone_fragment', 'broken_pottery'] }
                    ]
                },
                {
                    id: 'assess_first',
                    text: '🔍 Assess the geology first',
                    preview: 'Risk: None. Knowledge before action. Very sensible.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'wisdom', message: 'Your assessment reveals the best dig spot!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'warning', message: 'Unstable area. You mark it and move on safely.', loot: ['ancient_coin', 'crumbling_journal'] },
                        { weight: 25, type: 'find', message: 'You spot a loose gem right on the surface!', loot: ['obsidian_shard'] }
                    ]
                }
            ]
        },

        // 
        //  NEW DUNGEON EVENTS - more ways to die or get rich
        // 

        dungeon_skeleton_hoard: {
            id: 'dungeon_skeleton_hoard',
            name: 'The Skeleton Kings Treasury',
            description: 'A chamber filled with bones and gold. A skeletal figure sits motionless on a throne of skulls, clutching a treasure chest.',
            icon: '💀',
            locationType: ['dungeon'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'fight_skeleton',
                    text: 'Challenge the Skeleton King',
                    preview: 'Risk: EXTREME. He didnt get that throne by being friendly.',
                    healthCost: { min: 30, max: 55 },
                    staminaCost: { min: 35, max: 50 },
                    outcomes: [
                        { weight: 20, type: 'legendary_victory', message: 'YOU DEFEATED THE SKELETON KING! His hoard is yours!', loot: ['ancient_crown', 'blood_ruby', 'void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'victory', message: 'A brutal fight, but you prevail! The treasure is yours!', loot: ['skull_goblet', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'demon_tooth'] },
                        { weight: 30, type: 'pyrrhic', message: 'You win... barely. Grab what you can before you collapse.', healthPenalty: 25, loot: ['ancient_coin', 'ancient_coin', 'bone_fragment', 'bone_fragment'] },
                        { weight: 15, type: 'defeat', message: 'The King rises! You flee, barely escaping with your life.', healthPenalty: 40, loot: ['bone_fragment'] }
                    ]
                },
                {
                    id: 'sneak_treasure',
                    text: '🤫 Sneak past and grab what you can',
                    preview: 'Risk: Moderate. Hope hes a heavy sleeper. Do skeletons sleep?',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 25, max: 40 },
                    outcomes: [
                        { weight: 30, type: 'perfect_heist', message: 'Like a shadow! You empty your bag with treasure!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet', 'rusty_lockbox'] },
                        { weight: 35, type: 'partial', message: 'He stirred! You grab a handful and RUN!', loot: ['ancient_coin', 'ancient_coin', 'bent_candlestick'] },
                        { weight: 25, type: 'caught', message: 'HE SAW YOU! A bony hand grabs your ankle!', healthPenalty: 20, loot: ['ancient_coin', 'bone_fragment'] },
                        { weight: 10, type: 'secret', message: 'While sneaking, you find a HIDDEN cache he missed!', loot: ['tear_of_eternity', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'pay_respects',
                    text: '🙇 Kneel and pay respects',
                    preview: 'Risk: Unknown. Maybe dead kings appreciate manners?',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 25, type: 'blessed', message: 'The King nods! He tosses you a reward for your respect!', loot: ['ancient_crown', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'ignored', message: 'He doesnt move. You back away slowly. Smart choice.', loot: ['faded_love_letter', 'tarnished_spoon'] },
                        { weight: 25, type: 'gift', message: '"Take this, mortal. Now LEAVE." He hands you something.', loot: ['void_crystal', 'ancient_seal'] },
                        { weight: 10, type: 'cursed', message: 'He laughs. You feel... wrong. Cursed, perhaps.', healthPenalty: 15, loot: ['bone_fragment', 'bone_fragment', 'demon_tooth'] }
                    ]
                }
            ]
        },

        cave_glowing_pool: {
            id: 'cave_glowing_pool',
            name: 'The Luminescent Pool',
            description: 'A pool of water glows an unnatural blue. Strange plants grow around it. Coins and offerings litter the bottom.',
            icon: '✨',
            locationType: ['cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'dive_for_treasure',
                    text: '🏊 Dive for the offerings',
                    preview: 'Risk: High health/stamina. The glow might be radioactive. Worth it.',
                    healthCost: { min: 15, max: 35 },
                    staminaCost: { min: 30, max: 45 },
                    outcomes: [
                        { weight: 25, type: 'jackpot', message: 'The pool loves you! Treasure fills your arms!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'void_crystal', 'enchanted_quill'] },
                        { weight: 35, type: 'good', message: 'Handfuls of coins and a few interesting trinkets!', loot: ['ancient_coin', 'ancient_coin', 'chipped_tea_set', 'tarnished_spoon'] },
                        { weight: 25, type: 'mutation', message: 'The water BURNS! You grab what you can and scramble out!', healthPenalty: 20, loot: ['ancient_coin', 'cave_mushroom', 'cave_mushroom'] },
                        { weight: 15, type: 'guardian', message: 'Something GRABS you from below! You fight free!', healthPenalty: 30, loot: ['demon_tooth', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'drink_water',
                    text: '💧 Drink the glowing water',
                    preview: 'Risk: UNKNOWN. This is either genius or suicide.',
                    healthCost: { min: 0, max: 15 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 20, type: 'empowered', message: 'POWER SURGES THROUGH YOU! You feel... incredible!', healthBonus: 40, loot: [] },
                        { weight: 30, type: 'healing', message: 'The water heals your wounds! Its magical!', healthBonus: 25, loot: ['cave_mushroom'] },
                        { weight: 25, type: 'visions', message: 'You see visions! One shows where treasure is hidden!', loot: ['ancient_coin', 'ancient_coin', 'ancient_seal'] },
                        { weight: 25, type: 'poison', message: 'That was NOT water! Your insides rebel!', healthPenalty: 25, loot: [] }
                    ]
                },
                {
                    id: 'harvest_plants',
                    text: '🌿 Harvest the strange plants',
                    preview: 'Risk: Low. Plants dont bite. Usually.',
                    healthCost: { min: 5, max: 10 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 40, type: 'rare_herbs', message: 'Valuable alchemical ingredients! Apothecaries will pay well!', loot: ['cave_mushroom', 'cave_mushroom', 'cave_mushroom', 'cave_mushroom'] },
                        { weight: 35, type: 'mixed', message: 'Some useful herbs and a few coins in the roots!', loot: ['cave_mushroom', 'cave_mushroom', 'ancient_coin', 'corroded_belt_buckle'] },
                        { weight: 25, type: 'carnivorous', message: 'THE PLANT BITES BACK! You harvest it anyway.', healthPenalty: 10, loot: ['cave_mushroom', 'demon_tooth'] }
                    ]
                }
            ]
        },

        ruins_hidden_vault: {
            id: 'ruins_hidden_vault',
            name: 'The Sealed Vault',
            description: 'Behind a collapsed wall, you find a metal door with ancient runes. Something valuable lies beyond. Something protected.',
            icon: '🚪',
            locationType: ['ruins', 'dungeon'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'force_door',
                    text: '💪 Force the door open',
                    preview: 'Risk: HIGH. Brute force vs ancient magic. Classic.',
                    healthCost: { min: 20, max: 40 },
                    staminaCost: { min: 40, max: 60 },
                    outcomes: [
                        { weight: 20, type: 'legendary', message: 'THE VAULT OPENS! Its stuffed with treasures!', loot: ['world_shard', 'ancient_crown', 'void_crystal', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'success', message: 'With a CRACK, the door gives way! Treasure inside!', loot: ['blood_ruby', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet'] },
                        { weight: 30, type: 'trapped', message: 'TRAP! The door was rigged! Worth it though!', healthPenalty: 25, loot: ['ancient_coin', 'ancient_coin', 'ancient_seal'] },
                        { weight: 20, type: 'collapse', message: 'The whole wall comes down! You dive for safety!', healthPenalty: 35, loot: ['broken_pottery', 'bent_candlestick'] }
                    ]
                },
                {
                    id: 'study_runes',
                    text: '📖 Study the runes first',
                    preview: 'Risk: Low. Knowledge is power. Or at least less dying.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 30, type: 'solution', message: 'You decipher the code! The vault opens safely!', loot: ['spirit_lantern', 'ancient_coin', 'ancient_coin', 'enchanted_quill'] },
                        { weight: 35, type: 'partial', message: 'You bypass most traps. One still triggers.', healthPenalty: 10, loot: ['ancient_coin', 'ancient_coin', 'dusty_tome'] },
                        { weight: 25, type: 'lore', message: 'The runes tell a story. And hint at treasure elsewhere.', loot: ['dusty_tome', 'ancient_seal', 'crumbling_journal'] },
                        { weight: 10, type: 'forbidden', message: 'WARNING: DO NOT OPEN. You feel this is important.', loot: ['dusty_tome'] }
                    ]
                },
                {
                    id: 'search_around',
                    text: '🔍 Search the area instead',
                    preview: 'Risk: Low. Maybe someone already opened it once.',
                    healthCost: { min: 5, max: 10 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 35, type: 'dropped', message: 'Previous looters dropped things while fleeing! Score!', loot: ['ancient_coin', 'ancient_coin', 'rusty_lockbox', 'moth_eaten_tapestry'] },
                        { weight: 30, type: 'bones', message: 'Skeleton of previous adventurer. They had stuff.', loot: ['ancient_coin', 'bone_fragment', 'corroded_belt_buckle', 'faded_love_letter'] },
                        { weight: 25, type: 'hidden', message: 'A loose stone hides a small cache!', loot: ['void_crystal', 'ancient_coin'] },
                        { weight: 10, type: 'nothing', message: 'The area is picked clean. Only dust remains.', loot: ['broken_pottery'] }
                    ]
                }
            ]
        },

        mine_abandoned_shaft: {
            id: 'mine_abandoned_shaft',
            name: 'The Abandoned Mineshaft',
            description: 'An old shaft descends into darkness. Mining equipment lies scattered. The owners left in a hurry. Why?',
            icon: '🕳️',
            locationType: ['mine'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'descend_deep',
                    text: '⬇️ Descend into the depths',
                    preview: 'Risk: VERY HIGH. Whatever scared the miners is still down there.',
                    healthCost: { min: 25, max: 50 },
                    staminaCost: { min: 40, max: 60 },
                    outcomes: [
                        { weight: 15, type: 'motherlode', message: 'UNTOUCHED VEIN! They never got this far! JACKPOT!', loot: ['tear_of_eternity', 'void_crystal', 'void_crystal', 'obsidian_shard', 'obsidian_shard'] },
                        { weight: 25, type: 'rich_find', message: 'Abandoned carts full of ore! All yours now!', loot: ['obsidian_shard', 'obsidian_shard', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'monster', message: 'NOW you know why they left! FIGHT OR DIE!', healthPenalty: 30, loot: ['demon_tooth', 'bone_fragment', 'ancient_coin'] },
                        { weight: 30, type: 'collapse', message: 'The shaft groans and FALLS! You barely escape!', healthPenalty: 35, loot: ['ancient_coin', 'broken_pottery'] }
                    ]
                },
                {
                    id: 'salvage_equipment',
                    text: '🔧 Salvage the abandoned equipment',
                    preview: 'Risk: Low. Tools are tools. Even rusty ones have value.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 20, max: 35 },
                    outcomes: [
                        { weight: 40, type: 'tools', message: 'Quality equipment! Still usable after some polish!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard', 'bent_candlestick'] },
                        { weight: 35, type: 'pockets', message: 'The miners left their belongings. Finders keepers.', loot: ['ancient_coin', 'ancient_coin', 'faded_love_letter', 'corroded_belt_buckle'] },
                        { weight: 25, type: 'stash', message: 'Hidden in a crate: someones personal stash!', loot: ['ancient_coin', 'ancient_coin', 'skull_goblet'] }
                    ]
                },
                {
                    id: 'investigate_exit',
                    text: '👀 Investigate why they fled',
                    preview: 'Risk: Medium. Knowledge is valuable. Sometimes deadly.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 30, type: 'clue', message: 'A journal explains: gas leak. Its safe now. They left gold!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'crumbling_journal'] },
                        { weight: 30, type: 'warning', message: 'Signs of monster activity. You know to be careful now.', loot: ['dusty_tome', 'bone_fragment'] },
                        { weight: 25, type: 'safe', message: 'Cave-in blocked the danger. You can search safely!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 15, type: 'too_curious', message: 'You investigated too far. Something investigated back.', healthPenalty: 20, loot: ['demon_tooth'] }
                    ]
                }
            ]
        },

        // 
        //  SETTLEMENT EVENTS - towns, villages, cities, capital
        // 

        town_market_stall: {
            id: 'town_market_stall',
            name: 'Abandoned Market Stall',
            description: 'A merchant seems to have left in a hurry. Their stall remains unattended with goods still on display.',
            icon: '🏪',
            locationType: ['town', 'village', 'city', 'capital'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'browse_goods',
                    text: '👀 Browse the abandoned goods',
                    preview: 'Risk: None. Just looking around.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'find', message: 'You find some forgotten coins under the counter!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'merchant_returns', message: 'The merchant returns! They thank you for watching the stall.', goldBonus: 15, loot: [] },
                        { weight: 20, type: 'nothing', message: 'Nothing of value here. The merchant took everything important.', loot: [] }
                    ]
                },
                {
                    id: 'ask_around',
                    text: '🗣️ Ask locals about the merchant',
                    preview: 'Risk: None. Information gathering.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'rumor', message: 'A local tells you the merchant hid valuables behind the loose brick!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'warning', message: 'They say the merchant fled from debt collectors. Best not get involved.', loot: [] },
                        { weight: 25, type: 'tip', message: 'Someone mentions a reward poster. You collect the finder fee!', goldBonus: 25, loot: [] }
                    ]
                }
            ]
        },

        town_back_alley: {
            id: 'town_back_alley',
            name: 'Suspicious Back Alley',
            description: 'A narrow alleyway between buildings. Shady figures linger in the shadows. Could be dangerous... or profitable.',
            icon: '🌑',
            locationType: ['town', 'city', 'capital'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'investigate',
                    text: '🔍 Investigate carefully',
                    preview: 'Risk: Moderate. Could encounter trouble.',
                    healthCost: { min: 0, max: 15 },
                    staminaCost: { min: 10, max: 20 },
                    outcomes: [
                        { weight: 35, type: 'stash', message: 'You find a hidden stash behind loose bricks!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 30, type: 'mugging', message: 'Thugs try to mug you! You fight them off.', healthPenalty: 10, loot: ['ancient_coin', 'bone_fragment'] },
                        { weight: 20, type: 'informant', message: 'A shady figure offers valuable information for a price.', loot: ['dusty_tome'] },
                        { weight: 15, type: 'nothing', message: 'Just rats and garbage. The shadows were just shadows.', loot: [] }
                    ]
                },
                {
                    id: 'bribe_locals',
                    text: '💰 Bribe someone for info (20 gold)',
                    preview: 'Risk: Costs gold. Might get good intel.',
                    goldCost: 20,
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 50, type: 'good_info', message: 'They point you to a hidden cache. Worth every coin!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet'] },
                        { weight: 30, type: 'partial', message: 'Useful info but not as good as promised.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'scammed', message: 'They take your money and disappear. Classic.', loot: [] }
                    ]
                },
                {
                    id: 'walk_away',
                    text: '🚶 Leave quickly',
                    preview: 'Risk: None. Discretion is the better part of valor.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You walk away. Sometimes the smart move is no move.', loot: [] }
                    ]
                }
            ]
        },

        town_tavern_rumor: {
            id: 'town_tavern_rumor',
            name: 'Tavern Gossip',
            description: 'The local tavern is buzzing with gossip. Drunken patrons are loose with secrets.',
            icon: '🍺',
            locationType: ['town', 'village', 'city', 'capital'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'buy_drinks',
                    text: '🍻 Buy a round of drinks (15 gold)',
                    preview: 'Risk: Costs gold. Loosen tongues.',
                    goldCost: 15,
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'treasure_map', message: 'A drunk sailor gives you a treasure location!', loot: ['ancient_seal', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'gossip', message: 'Useful rumors about local merchant prices.', goldBonus: 30, loot: [] },
                        { weight: 25, type: 'fight', message: 'Someone takes offense to your questions. Bar fight!', healthPenalty: 5, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'eavesdrop',
                    text: '👂 Listen quietly',
                    preview: 'Risk: None. Patient observation.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 45, type: 'overhear', message: 'You overhear merchants discussing hidden goods!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing_useful', message: 'Just complaints about weather and taxes.', loot: [] },
                        { weight: 20, type: 'noticed', message: 'Someone notices you listening. Awkward.', loot: [] }
                    ]
                }
            ]
        },

        village_abandoned_house: {
            id: 'village_abandoned_house',
            name: 'Abandoned Cottage',
            description: 'An old cottage at the edge of the village stands empty. Locals say it is haunted.',
            icon: '🏚️',
            locationType: ['village', 'town'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_inside',
                    text: '🏠 Search the cottage',
                    preview: 'Risk: Low. Might be dusty.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'find_cache', message: 'Under the floorboards! The previous owner left valuables!', loot: ['ancient_coin', 'ancient_coin', 'dusty_tome', 'tarnished_spoon'] },
                        { weight: 30, type: 'just_dust', message: 'Nothing but dust and cobwebs. The ghosts took everything.', loot: ['broken_pottery'] },
                        { weight: 20, type: 'ghost', message: 'A friendly ghost! It points you to hidden coins!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 10, type: 'angry_ghost', message: 'An angry spirit! You flee with minor scratches.', healthPenalty: 5, loot: [] }
                    ]
                },
                {
                    id: 'check_garden',
                    text: '🌿 Check the overgrown garden',
                    preview: 'Risk: None. Herbs might still grow.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'herbs', message: 'Valuable herbs grow wild here!', loot: ['cave_mushroom', 'cave_mushroom'] },
                        { weight: 30, type: 'buried', message: 'Something buried! A small lockbox!', loot: ['ancient_coin', 'ancient_coin', 'rusty_lockbox'] },
                        { weight: 20, type: 'nothing', message: 'Just weeds. Very persistent weeds.', loot: [] }
                    ]
                }
            ]
        },

        city_sewers: {
            id: 'city_sewers',
            name: 'City Sewer Entrance',
            description: 'A grate leads down into the city sewers. Valuables get washed down here... along with worse things.',
            icon: '🕳️',
            locationType: ['city', 'capital'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'descend',
                    text: '⬇️ Climb down into the sewers',
                    preview: 'Risk: Moderate. Rats and worse lurk below.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 30, type: 'treasure', message: 'You find washed-away valuables caught in a grate!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet', 'tarnished_spoon'] },
                        { weight: 30, type: 'rats', message: 'Giant rats! You fight them off and find their hoard.', healthPenalty: 10, loot: ['ancient_coin', 'ancient_coin', 'bone_fragment', 'bone_fragment'] },
                        { weight: 25, type: 'smuggler_cache', message: 'A smugglers secret stash! Jackpot!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 15, type: 'lost', message: 'You get lost and barely find your way out.', healthPenalty: 15, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'fish_with_stick',
                    text: '🎣 Fish around with a stick',
                    preview: 'Risk: None. See what you can snag.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'catch', message: 'You hook something valuable!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'junk', message: 'Just garbage and old boots.', loot: ['broken_pottery'] },
                        { weight: 20, type: 'ring', message: 'A gold ring! Someone will miss this!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                }
            ]
        },

        capital_noble_district: {
            id: 'capital_noble_district',
            name: 'Noble District Opportunity',
            description: 'The wealthy live here. A noble lady has dropped her purse near a fountain.',
            icon: '👑',
            locationType: ['capital', 'city'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'return_purse',
                    text: '💝 Return the purse',
                    preview: 'Risk: None. Do the right thing.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 60, type: 'reward', message: 'The noble rewards your honesty handsomely!', goldBonus: 50, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'big_reward', message: 'She is the Dukes daughter! Massive reward!', goldBonus: 100, loot: ['ancient_seal'] },
                        { weight: 10, type: 'rude', message: 'She snatches it without thanks. Nobles...', loot: [] }
                    ]
                },
                {
                    id: 'keep_purse',
                    text: '💰 Keep the purse',
                    preview: 'Risk: Moderate. Quick profit but risky.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 50, type: 'success', message: 'You pocket the contents and slip away!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'caught', message: 'A guard sees you! You talk your way out barely.', healthPenalty: 5, loot: ['ancient_coin'] },
                        { weight: 20, type: 'very_caught', message: 'Guards chase you! You escape but drop most of it.', healthPenalty: 10, loot: [] }
                    ]
                }
            ]
        },

        // 
        //  WILDERNESS EVENTS - forests, farms
        // 

        forest_hidden_grove: {
            id: 'forest_hidden_grove',
            name: 'Hidden Grove',
            description: 'You stumble upon a secluded clearing. Unusual plants grow here, untouched by civilization.',
            icon: '🌳',
            locationType: ['forest'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'gather_herbs',
                    text: '🌿 Gather rare herbs',
                    preview: 'Risk: Low. Natural treasures await.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 50, type: 'herbs', message: 'Valuable medicinal herbs! Apothecaries will pay well!', loot: ['cave_mushroom', 'cave_mushroom', 'cave_mushroom', 'ancient_coin'] },
                        { weight: 30, type: 'rare_find', message: 'A glowing mushroom! Extremely rare!', loot: ['void_crystal', 'cave_mushroom'] },
                        { weight: 20, type: 'bees', message: 'Disturbed a beehive! Worth it for the honey though.', healthPenalty: 5, loot: ['ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'search_shrine',
                    text: '⛩️ Examine the old shrine',
                    preview: 'Risk: Low. Ancient offerings might remain.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'offerings', message: 'Ancient offerings left by travelers!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 35, type: 'blessing', message: 'The forest spirit blesses you!', healthBonus: 15, loot: [] },
                        { weight: 25, type: 'nothing', message: 'The shrine is empty. Someone got here first.', loot: [] }
                    ]
                }
            ]
        },

        forest_bandit_camp: {
            id: 'forest_bandit_camp',
            name: 'Abandoned Bandit Camp',
            description: 'A recently abandoned campsite. The bandits left in a hurry, leaving things behind.',
            icon: '⛺',
            locationType: ['forest'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'search_camp',
                    text: '🔍 Search the camp thoroughly',
                    preview: 'Risk: Moderate. Bandits might return.',
                    healthCost: { min: 0, max: 15 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 35, type: 'loot', message: 'Their stash! Gold and stolen goods!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet', 'ancient_seal'] },
                        { weight: 30, type: 'weapons', message: 'Weapons and armor left behind!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 20, type: 'bandits_return', message: 'Bandits return! You fight and flee!', healthPenalty: 15, loot: ['ancient_coin', 'bone_fragment'] },
                        { weight: 15, type: 'trap', message: 'They left traps! You trigger one.', healthPenalty: 10, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'quick_grab',
                    text: 'Grab what you can and run',
                    preview: 'Risk: Low. Fast in, fast out.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 50, type: 'some_loot', message: 'You grab coins and run!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'good_grab', message: 'Quick hands snatch the valuables!', loot: ['ancient_coin', 'ancient_coin', 'skull_goblet'] },
                        { weight: 15, type: 'nothing', message: 'Panic grab results in... a dirty pot.', loot: ['broken_pottery'] }
                    ]
                }
            ]
        },

        farm_old_barn: {
            id: 'farm_old_barn',
            name: 'Old Barn',
            description: 'A weathered barn on the edge of the farm. The farmer says nobody has been inside for years.',
            icon: '🏚️',
            locationType: ['farm', 'village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'explore_barn',
                    text: '🚪 Explore the barn',
                    preview: 'Risk: Low. Watch for rotting floors.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'hidden_stash', message: 'Under the hay! A hidden cache from the old days!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'rusty_lockbox'] },
                        { weight: 30, type: 'tools', message: 'Old farming tools worth something to collectors!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'nothing', message: 'Just hay, dust, and disappointed chickens.', loot: [] },
                        { weight: 10, type: 'floor_collapse', message: 'The floor gives way! Minor bruises.', healthPenalty: 5, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'check_loft',
                    text: '⬆️ Climb to the loft',
                    preview: 'Risk: Low. Good vantage point.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 45, type: 'chest', message: 'An old chest! Someone hid this decades ago!', loot: ['ancient_coin', 'ancient_coin', 'dusty_tome', 'ancient_seal'] },
                        { weight: 35, type: 'birds', message: 'Just bird nests. But one has a shiny coin!', loot: ['ancient_coin'] },
                        { weight: 20, type: 'nothing', message: 'Empty. The view is nice though.', loot: [] }
                    ]
                }
            ]
        },

        farm_well: {
            id: 'farm_well',
            name: 'Old Farm Well',
            description: 'An old well that the farm no longer uses. Locals say things get dropped in there.',
            icon: '⛲',
            locationType: ['farm', 'village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'lower_bucket',
                    text: '🪣 Lower a bucket',
                    preview: 'Risk: None. See what you can fish up.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'coins', message: 'Coins! People made wishes here!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'junk', message: 'Just waterlogged garbage.', loot: ['broken_pottery'] },
                        { weight: 25, type: 'jewelry', message: 'A ring! Someone lost this years ago!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                },
                {
                    id: 'climb_down',
                    text: '🧗 Climb down (risky)',
                    preview: 'Risk: Moderate. Could get stuck.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 25, max: 35 },
                    outcomes: [
                        { weight: 30, type: 'treasure', message: 'At the bottom! A locked chest!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet'] },
                        { weight: 35, type: 'some_finds', message: 'You grab what is within reach.', loot: ['ancient_coin', 'ancient_coin', 'bone_fragment'] },
                        { weight: 20, type: 'slip', message: 'You slip and scrape yourself climbing back up.', healthPenalty: 10, loot: ['ancient_coin'] },
                        { weight: 15, type: 'stuck', message: 'Almost got stuck! Scary experience.', healthPenalty: 5, loot: [] }
                    ]
                }
            ]
        },

        // 
        //  PORT EVENTS - docks and harbors
        // 

        port_docks: {
            id: 'port_docks',
            name: 'Busy Dockside',
            description: 'The docks are busy with sailors and cargo. Things fall off ships all the time...',
            icon: '⚓',
            locationType: ['port'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_between_crates',
                    text: '📦 Search between crates',
                    preview: 'Risk: Low. Cargo falls off all the time.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 45, type: 'fallen_cargo', message: 'Fallen cargo! Finders keepers!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'exotic', message: 'Exotic goods from far lands!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 25, type: 'nothing', message: 'Just rope and fish smell.', loot: [] }
                    ]
                },
                {
                    id: 'talk_to_sailors',
                    text: '🗣️ Chat with sailors',
                    preview: 'Risk: None. Sailors know things.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'tip', message: 'A sailor tells you about unclaimed cargo!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'stories', message: 'Just tall tales and sea stories.', loot: [] },
                        { weight: 25, type: 'gift', message: 'A sailor gives you a souvenir from his travels!', loot: ['ancient_seal', 'ancient_coin'] }
                    ]
                }
            ]
        },

        port_smuggler_contact: {
            id: 'port_smuggler_contact',
            name: 'Suspicious Sailor',
            description: 'A rough-looking sailor catches your eye. He seems to be selling something under the table.',
            icon: '🏴‍☠️',
            locationType: ['port'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'approach',
                    text: '🤝 Make contact',
                    preview: 'Risk: Moderate. Could be a setup.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'deal', message: 'He has smuggled goods at discount prices!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'skull_goblet', 'obsidian_shard'] },
                        { weight: 30, type: 'info', message: 'He sells you information about a hidden cache!', loot: ['ancient_coin', 'ancient_coin', 'ancient_seal'] },
                        { weight: 20, type: 'scam', message: 'Its a scam! You lose some coins but escape.', loot: [] },
                        { weight: 10, type: 'guards', message: 'Guards! Its a sting! You talk your way out.', healthPenalty: 5, loot: [] }
                    ]
                },
                {
                    id: 'report_him',
                    text: 'Report to guards',
                    preview: 'Risk: None. Law-abiding citizen reward.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 60, type: 'reward', message: 'The guards reward you for the tip!', goldBonus: 40, loot: [] },
                        { weight: 30, type: 'share', message: 'They share the confiscated goods with you!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 10, type: 'nothing', message: 'They dont care. Corruption runs deep here.', loot: [] }
                    ]
                }
            ]
        },

        // 
        // MINE EVENTS (supplementary to existing)
        // 

        mine_abandoned_shaft: {
            id: 'mine_abandoned_shaft',
            name: 'Abandoned Mine Shaft',
            description: 'An old shaft that was sealed off years ago. The seal has crumbled away.',
            icon: '🕳️',
            locationType: ['mine'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'enter_shaft',
                    text: '⬇️ Enter the old shaft',
                    preview: 'Risk: High. Could collapse.',
                    healthCost: { min: 10, max: 30 },
                    staminaCost: { min: 30, max: 45 },
                    outcomes: [
                        { weight: 25, type: 'motherload', message: 'They sealed it because it was TOO valuable! Gems everywhere!', loot: ['void_crystal', 'void_crystal', 'obsidian_shard', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'decent', message: 'Old equipment and some ore samples.', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 25, type: 'collapse', message: 'Partial collapse! You escape with scrapes!', healthPenalty: 20, loot: ['ancient_coin'] },
                        { weight: 15, type: 'gas', message: 'Bad air! You retreat quickly!', healthPenalty: 15, loot: [] }
                    ]
                },
                {
                    id: 'peek_inside',
                    text: '👀 Just look inside',
                    preview: 'Risk: Low. Cautious approach.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'spot_something', message: 'You spot something shiny just inside!', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 40, type: 'danger_signs', message: 'You see why it was sealed. Smart to stay out.', loot: [] },
                        { weight: 20, type: 'old_equipment', message: 'Abandoned tools near the entrance.', loot: ['ancient_coin', 'broken_pottery'] }
                    ]
                }
            ]
        },

        // === CITY/PORT EVENTS - Urban Exploration ===
        harbor_warehouse: {
            id: 'harbor_warehouse',
            name: 'The Harbor Warehouse',
            description: 'A dimly lit warehouse filled with stacked crates and barrels. Some shipments are marked with strange symbols.',
            icon: '📦',
            locationType: ['city', 'port'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_crates',
                    text: '🔍 Search the suspicious crates',
                    preview: 'Risk: Low. Might find evidence... or trouble.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 50, type: 'manifest', message: 'A shipping manifest slips from between two crates. The entries are coded - definitely suspicious.', loot: ['shipping_manifest'] },
                        { weight: 30, type: 'valuables', message: '"Agricultural supplies" that clink like coins. You pocket a few loose items.', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'nothing', message: 'Just farming tools and sacks of grain. Boring but legitimate.', loot: [] }
                    ]
                },
                {
                    id: 'check_ledger',
                    text: '📋 Check the warehouse ledger',
                    preview: 'Risk: None. Official records might reveal patterns.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 60, type: 'clues', message: 'Monthly deliveries, always paid in advance. Always the same coded name: "The Black Ledger". Interesting...', loot: ['shipping_manifest'] },
                        { weight: 40, type: 'normal', message: 'Standard trade logs. Nothing suspicious here.', loot: [] }
                    ]
                },
                {
                    id: 'leave_quick',
                    text: '🚪 Leave before someone sees you',
                    preview: 'Risk: None. Better safe than sorry.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You slip out quietly. Sometimes discretion really is the better part of valor.', loot: [] }
                    ]
                }
            ]
        },

        //
        // INN EVENTS - rest, rumors, and revelry
        //

        inn_traveler_tales: {
            id: 'inn_traveler_tales',
            name: 'Traveler Tales',
            description: 'A grizzled traveler sits alone in the corner, nursing an ale. They look like they have stories to tell.',
            icon: '🧳',
            locationType: ['inn'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'listen_stories',
                    text: '👂 Listen to their stories',
                    preview: 'Risk: None. Free entertainment.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'treasure_hint', message: 'They mention a hidden cache near the old mill!', loot: ['ancient_coin', 'ancient_coin', 'dusty_tome'] },
                        { weight: 35, type: 'boring', message: 'Just tall tales and exaggerations. Entertaining though.', loot: [] },
                        { weight: 25, type: 'map', message: 'They sketch you a map to a forgotten ruin!', loot: ['ancient_seal', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'buy_drink',
                    text: '🍺 Buy them a drink (10 gold)',
                    preview: 'Risk: Costs gold. Loosens tongues.',
                    goldCost: 10,
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 50, type: 'good_info', message: 'Grateful for the drink, they share valuable trade secrets!', goldBonus: 40, loot: [] },
                        { weight: 30, type: 'gift', message: 'They insist you take this as thanks!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 20, type: 'scam', message: 'They drink up and disappear. Classic.', loot: [] }
                    ]
                }
            ]
        },

        inn_gambling_den: {
            id: 'inn_gambling_den',
            name: 'Back Room Gambling',
            description: 'A door in the back leads to a private room. The sound of dice and coins carries through the crack.',
            icon: '🎲',
            locationType: ['inn'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'join_game',
                    text: '🎰 Join the game (50 gold buy-in)',
                    preview: 'Risk: High variance. Could win big or lose everything.',
                    goldCost: 50,
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 20, type: 'jackpot', message: 'LUCKY STREAK! You clean out the table!', goldBonus: 200, loot: [] },
                        { weight: 30, type: 'win', message: 'You walk away a winner!', goldBonus: 75, loot: [] },
                        { weight: 30, type: 'lose', message: 'The dice betray you. Better luck next time.', loot: [] },
                        { weight: 15, type: 'big_lose', message: 'Cleaned out! At least you kept your pants.', loot: [] },
                        { weight: 5, type: 'cheat_caught', message: 'Someone accuses you of cheating! Bar fight!', healthPenalty: 15, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'observe',
                    text: '👀 Just watch and learn',
                    preview: 'Risk: None. Study the players.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'learn', message: 'You notice one player cheating. They pay you to stay quiet.', goldBonus: 30, loot: [] },
                        { weight: 30, type: 'nothing', message: 'Just a normal game. Boring but educational.', loot: [] },
                        { weight: 20, type: 'dropped', message: 'A player drops coins in their excitement!', loot: ['ancient_coin', 'ancient_coin'] }
                    ]
                }
            ]
        },

        //
        // VILLAGE EVENTS - rural charm and local secrets
        //

        village_elder_wisdom: {
            id: 'village_elder_wisdom',
            name: 'Village Elder',
            description: 'The village elder sits on a worn bench, watching the world go by. They say the old ones know secrets.',
            icon: '👴',
            locationType: ['village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'ask_wisdom',
                    text: '🙏 Ask for wisdom',
                    preview: 'Risk: None. Elders love to talk.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'secret', message: 'They whisper of buried treasure behind the old church!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'blessing', message: 'They bless your journey. You feel invigorated!', healthBonus: 10, loot: [] },
                        { weight: 25, type: 'rambling', message: 'Just stories about the good old days. Nice but useless.', loot: [] }
                    ]
                },
                {
                    id: 'offer_gift',
                    text: '🎁 Offer a small gift (15 gold)',
                    preview: 'Risk: Costs gold. Shows respect.',
                    goldCost: 15,
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 50, type: 'grateful', message: 'Touched by your kindness, they give you a family heirloom!', loot: ['ancient_seal', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'blessing', message: 'They speak ancient words of protection. You feel safer.', healthBonus: 15, loot: [] },
                        { weight: 15, type: 'insulted', message: 'They think you are trying to bribe them. Awkward.', loot: [] }
                    ]
                }
            ]
        },

        village_local_trade: {
            id: 'village_local_trade',
            name: 'Village Market Day',
            description: 'Its market day! Locals have set up stalls selling homemade goods and surplus produce.',
            icon: '🏪',
            locationType: ['village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'browse_stalls',
                    text: '🛒 Browse the stalls',
                    preview: 'Risk: None. Might find a bargain.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 45, type: 'bargain', message: 'You find an excellent deal on local crafts!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Nothing catches your eye today.', loot: [] },
                        { weight: 20, type: 'rare_find', message: 'An old farmer is selling antique items cheap!', loot: ['ancient_seal', 'rusted_medallion', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'help_vendor',
                    text: '💪 Help a struggling vendor',
                    preview: 'Risk: Low stamina drain. Good karma.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 50, type: 'paid', message: 'They insist on paying you for your help!', goldBonus: 25, loot: [] },
                        { weight: 30, type: 'gift', message: 'They give you free goods as thanks!', loot: ['ancient_coin', 'ancient_coin', 'cave_mushroom'] },
                        { weight: 20, type: 'nothing', message: 'Just a thank you. Virtue is its own reward.', loot: [] }
                    ]
                }
            ]
        },

        //
        // OUTPOST EVENTS - military life and frontier dangers
        //

        outpost_guard_duty: {
            id: 'outpost_guard_duty',
            name: 'Volunteer Guard Duty',
            description: 'The guards look exhausted. The captain offers coin for anyone willing to take a watch shift.',
            icon: '🛡️',
            locationType: ['outpost'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'take_watch',
                    text: '⚔️ Take a guard shift',
                    preview: 'Risk: Moderate stamina drain. Guaranteed pay.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 25, max: 40 },
                    outcomes: [
                        { weight: 40, type: 'uneventful', message: 'Quiet night. Easy money.', goldBonus: 30, loot: [] },
                        { weight: 30, type: 'skirmish', message: 'Bandits tested the walls! You helped repel them!', healthPenalty: 10, goldBonus: 60, loot: ['ancient_coin', 'bone_fragment'] },
                        { weight: 20, type: 'discovery', message: 'You spot smugglers! The captain rewards you handsomely!', goldBonus: 50, loot: ['ancient_seal'] },
                        { weight: 10, type: 'attack', message: 'A serious raid! You fight bravely but take wounds!', healthPenalty: 25, goldBonus: 80, loot: ['ancient_coin', 'ancient_coin', 'demon_tooth'] }
                    ]
                },
                {
                    id: 'report_intel',
                    text: '📋 Share travel intelligence',
                    preview: 'Risk: None. Information has value.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'useful', message: 'Your information helps them! Small reward.', goldBonus: 20, loot: [] },
                        { weight: 30, type: 'very_useful', message: 'Critical intel! The captain is very grateful!', goldBonus: 40, loot: ['ancient_coin'] },
                        { weight: 20, type: 'known', message: 'They already knew. At least you tried.', loot: [] }
                    ]
                }
            ]
        },

        outpost_training_yard: {
            id: 'outpost_training_yard',
            name: 'Training Yard',
            description: 'Soldiers practice combat in the yard. A grizzled sergeant offers to spar with travelers.',
            icon: '⚔️',
            locationType: ['outpost'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'spar',
                    text: '🗡️ Accept the challenge',
                    preview: 'Risk: Health/stamina drain. Learn from the best.',
                    healthCost: { min: 10, max: 25 },
                    staminaCost: { min: 20, max: 35 },
                    outcomes: [
                        { weight: 30, type: 'win', message: 'You win! The sergeant is impressed and shares fighting tips!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'lose_gracefully', message: 'You lose but learn valuable techniques.', loot: ['ancient_coin'] },
                        { weight: 20, type: 'draw', message: 'Evenly matched! Mutual respect earned.', goldBonus: 15, loot: [] },
                        { weight: 10, type: 'crushing', message: 'Brutal defeat. But you wont make those mistakes again.', healthPenalty: 10, loot: [] }
                    ]
                },
                {
                    id: 'watch_learn',
                    text: '👀 Watch and learn',
                    preview: 'Risk: None. Observe the masters.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 60, type: 'learn', message: 'You pick up some useful combat moves!', loot: [] },
                        { weight: 30, type: 'noticed', message: 'The sergeant notices your interest and gives pointers.', loot: ['ancient_coin'] },
                        { weight: 10, type: 'recruited', message: 'They try to recruit you! You politely decline but get supplies.', loot: ['ancient_coin', 'ancient_coin'] }
                    ]
                }
            ]
        },

        //
        // More mine events for ore extraction and hazards
        //

        mine_ore_vein: {
            id: 'mine_ore_vein',
            name: 'Rich Ore Vein',
            description: 'A glittering vein of ore runs through the rock wall. This could be valuable... if you can extract it.',
            icon: '💎',
            locationType: ['mine'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'extract_ore',
                    text: '⛏️ Extract the ore carefully',
                    preview: 'Risk: High stamina drain. Mining takes effort.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 30, max: 45 },
                    toolRequired: 'pickaxe',
                    outcomes: [
                        { weight: 30, type: 'rich_vein', message: 'HIGH QUALITY ORE! This will fetch a premium!', loot: ['obsidian_shard', 'obsidian_shard', 'obsidian_shard', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'decent', message: 'Solid haul of ore. Good day in the mines.', loot: ['obsidian_shard', 'obsidian_shard', 'ancient_coin'] },
                        { weight: 20, type: 'mixed', message: 'Some ore, some useless rock. It happens.', loot: ['obsidian_shard', 'ancient_coin'] },
                        { weight: 10, type: 'collapse', message: 'The wall shifts! You grab what you can and retreat!', healthPenalty: 15, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'chip_sample',
                    text: '🔨 Take a small sample',
                    preview: 'Risk: Low. Quick assessment.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 50, type: 'sample', message: 'A nice sample. Worth something to assayers.', loot: ['obsidian_shard', 'ancient_coin'] },
                        { weight: 30, type: 'surprise', message: 'The sample reveals a hidden gem pocket!', loot: ['void_crystal', 'ancient_coin'] },
                        { weight: 20, type: 'worthless', message: 'Fools gold. It happens to the best of us.', loot: [] }
                    ]
                }
            ]
        },

        mine_tool_cache: {
            id: 'mine_tool_cache',
            name: 'Miners Tool Cache',
            description: 'An old tool shed sits near the mine entrance. Previous workers left equipment behind.',
            icon: '🔧',
            locationType: ['mine'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_tools',
                    text: '🔍 Search through the tools',
                    preview: 'Risk: None. Tools have value.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'good_find', message: 'Quality tools! Still functional!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'average', message: 'Some useful items, mostly rusted junk.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'hidden', message: 'Someone hid coins inside a tool handle!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                },
                {
                    id: 'sharpen_tools',
                    text: '🪓 Sharpen your own tools',
                    preview: 'Risk: Low stamina. Better efficiency later.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 70, type: 'sharpened', message: 'Your tools are now in better condition!', loot: [] },
                        { weight: 30, type: 'find', message: 'While sharpening, you notice a coin under the bench!', loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        //
        // ADDITIONAL FOREST EVENTS - nature, hunting, and woodland mysteries
        //

        forest_herb_patch: {
            id: 'forest_herb_patch',
            name: 'Wild Herb Patch',
            description: 'A clearing filled with medicinal plants. Apothecaries would pay well for these.',
            icon: '🌿',
            locationType: ['forest'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'gather_herbs',
                    text: '🌱 Gather medicinal herbs',
                    preview: 'Risk: Low. Nature provides.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 45, type: 'rich_harvest', message: 'A bounty of healing herbs!', loot: ['cave_mushroom', 'cave_mushroom', 'cave_mushroom', 'cave_mushroom'] },
                        { weight: 35, type: 'decent', message: 'A fair gathering. Enough to sell.', loot: ['cave_mushroom', 'cave_mushroom', 'ancient_coin'] },
                        { weight: 20, type: 'rare', message: 'A rare moonpetal! Extremely valuable!', loot: ['void_crystal', 'cave_mushroom'] }
                    ]
                },
                {
                    id: 'search_area',
                    text: '🔍 Search the surrounding area',
                    preview: 'Risk: None. Might find more than plants.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'cache', message: 'Someone buried something here!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Just plants and bugs. Nature is nice though.', loot: ['cave_mushroom'] },
                        { weight: 25, type: 'bones', message: 'Old bones with valuables still attached.', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                }
            ]
        },

        forest_animal_trail: {
            id: 'forest_animal_trail',
            name: 'Animal Trail',
            description: 'Fresh tracks lead deeper into the forest. Could be prey... or predator.',
            icon: '🦌',
            locationType: ['forest'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'follow_tracks',
                    text: '🐾 Follow the tracks',
                    preview: 'Risk: Moderate. What you hunt might hunt back.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 20, max: 35 },
                    outcomes: [
                        { weight: 30, type: 'deer', message: 'A deer! Easy prey! Fresh meat and hide!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'boar', message: 'A boar charges! You bring it down after a fight!', healthPenalty: 10, loot: ['ancient_coin', 'ancient_coin', 'bone_fragment'] },
                        { weight: 25, type: 'wolf', message: 'Wolves! You fight them off!', healthPenalty: 15, loot: ['bone_fragment', 'bone_fragment', 'demon_tooth'] },
                        { weight: 20, type: 'nothing', message: 'The trail goes cold. Waste of time.', loot: [] }
                    ]
                },
                {
                    id: 'set_trap',
                    text: '🪤 Set a trap and wait',
                    preview: 'Risk: Low. Patience required.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 25, max: 35 },
                    outcomes: [
                        { weight: 40, type: 'catch', message: 'Your trap catches something! Dinner and pelts!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Nothing took the bait. Better luck next time.', loot: [] },
                        { weight: 25, type: 'surprise', message: 'A rare silver fox! Worth a fortune!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_seal'] }
                    ]
                }
            ]
        },

        forest_timber_camp: {
            id: 'forest_timber_camp',
            name: 'Abandoned Timber Camp',
            description: 'An old logging operation left behind. Equipment and supplies scattered about.',
            icon: '🪓',
            locationType: ['forest'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_camp',
                    text: '🔍 Search the camp',
                    preview: 'Risk: Low. Loggers leave things behind.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 20 },
                    outcomes: [
                        { weight: 40, type: 'supplies', message: 'Leftover supplies! Food, coins, useful items!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'tools', message: 'Quality logging tools. Worth selling.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'stash', message: 'Pay stash hidden under a log! Finders keepers!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'check_logs',
                    text: '🪵 Check the stacked logs',
                    preview: 'Risk: Low. Might find something hidden.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 45, type: 'nothing', message: 'Just logs. Very log-like.', loot: [] },
                        { weight: 35, type: 'nest', message: 'A birds nest with shiny things! Birds collect coins?', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'hollow', message: 'A hollow log! Someone hid valuables inside!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                }
            ]
        },

        //
        // ADDITIONAL FARM EVENTS - rural life and agricultural adventures
        //

        farm_crop_field: {
            id: 'farm_crop_field',
            name: 'Overgrown Field',
            description: 'An abandoned field with crops gone wild. Nature reclaims what was planted.',
            icon: '🌾',
            locationType: ['farm'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'harvest_wild',
                    text: '🌾 Harvest what remains',
                    preview: 'Risk: Low stamina. Free produce!',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 45, type: 'good_harvest', message: 'Wild vegetables and grain! Edible and sellable!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'basic', message: 'Some edible plants. Better than nothing.', loot: ['ancient_coin'] },
                        { weight: 20, type: 'rare', message: 'Wild herbs among the crops! Valuable!', loot: ['cave_mushroom', 'cave_mushroom', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'search_scarecrow',
                    text: '👀 Check the old scarecrow',
                    preview: 'Risk: None. Scarecrows dont bite.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'pockets', message: 'The scarecrows pockets have coins! Farmers joke?', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Just straw and old clothes.', loot: [] },
                        { weight: 25, type: 'hidden', message: 'Inside the straw! A small lockbox!', loot: ['ancient_coin', 'ancient_coin', 'rusty_lockbox'] }
                    ]
                }
            ]
        },

        farm_livestock_pen: {
            id: 'farm_livestock_pen',
            name: 'Abandoned Livestock Pen',
            description: 'Empty animal pens with scattered feed and old equipment.',
            icon: '🐄',
            locationType: ['farm'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'search_pen',
                    text: '🔍 Search the pens',
                    preview: 'Risk: None. Animals are long gone.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'equipment', message: 'Farming equipment worth selling!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'hidden_coins', message: 'Coins dropped in the hay over the years!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'nothing', message: 'Just old hay and animal smell.', loot: [] }
                    ]
                },
                {
                    id: 'check_trough',
                    text: '🪣 Check the water trough',
                    preview: 'Risk: None. People drop things.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 45, type: 'coins', message: 'Coins at the bottom! Farmers made wishes here.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Just murky water and algae.', loot: [] },
                        { weight: 20, type: 'ring', message: 'A wedding ring! Someone will miss this... or not.', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                }
            ]
        },

        farm_windmill: {
            id: 'farm_windmill',
            name: 'Old Windmill',
            description: 'A weathered windmill creaks in the breeze. The miller is long gone.',
            icon: '🏭',
            locationType: ['farm', 'village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'explore_inside',
                    text: '🚪 Explore inside',
                    preview: 'Risk: Low. Watch for unstable floors.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 20 },
                    outcomes: [
                        { weight: 35, type: 'millers_stash', message: 'The miller hid his savings! Found it!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'equipment', message: 'Milling equipment. Worth something to collectors.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'rats', message: 'Rats! They scatter but you find their shiny hoarde!', loot: ['ancient_coin', 'ancient_coin', 'bone_fragment'] },
                        { weight: 10, type: 'collapse', message: 'Floor gives way! Minor fall.', healthPenalty: 5, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'climb_top',
                    text: '⬆️ Climb to the top',
                    preview: 'Risk: Moderate. Good view... if you survive.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 40, type: 'view', message: 'Amazing view! You spot something valuable below!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'nest', message: 'Bird nest with shiny coins they collected!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'slip', message: 'You slip but grab on! Heart pounding, you descend.', healthPenalty: 5, loot: [] }
                    ]
                }
            ]
        },

        //
        // ADDITIONAL CAVE EVENTS - deep exploration and magical phenomena
        //

        cave_crystal_chamber: {
            id: 'cave_crystal_chamber',
            name: 'Crystal Chamber',
            description: 'A cavern lined with glowing crystals of various colors. The air hums with energy.',
            icon: '💎',
            locationType: ['cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'harvest_crystals',
                    text: '💎 Harvest the crystals',
                    preview: 'Risk: Moderate. Crystals can be unstable.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 20, max: 35 },
                    outcomes: [
                        { weight: 30, type: 'jackpot', message: 'Perfect specimens! Mages will pay handsomely!', loot: ['void_crystal', 'void_crystal', 'obsidian_shard', 'ancient_coin'] },
                        { weight: 35, type: 'good', message: 'Several quality crystals extracted!', loot: ['void_crystal', 'obsidian_shard', 'ancient_coin'] },
                        { weight: 20, type: 'shatter', message: 'Some crystals shatter on extraction. Still got a few.', loot: ['obsidian_shard', 'ancient_coin'] },
                        { weight: 15, type: 'feedback', message: 'Energy feedback! The crystal zaps you!', healthPenalty: 15, loot: ['void_crystal'] }
                    ]
                },
                {
                    id: 'meditate',
                    text: '🧘 Meditate among the crystals',
                    preview: 'Risk: Unknown. Magical phenomena possible.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 30, type: 'energized', message: 'Power flows through you! You feel incredible!', healthBonus: 25, loot: [] },
                        { weight: 35, type: 'vision', message: 'You see a vision of hidden treasure!', loot: ['ancient_seal', 'ancient_coin'] },
                        { weight: 20, type: 'nothing', message: 'Peaceful but uneventful. The crystals hum quietly.', loot: [] },
                        { weight: 15, type: 'nightmare', message: 'Dark visions assault your mind! You flee!', healthPenalty: 10, loot: [] }
                    ]
                }
            ]
        },

        cave_underground_river: {
            id: 'cave_underground_river',
            name: 'Underground River',
            description: 'A river flows through the darkness. Who knows what it carries from the depths?',
            icon: '🌊',
            locationType: ['cave'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'wade_shallow',
                    text: '🚶 Wade through the shallows',
                    preview: 'Risk: Moderate. Cold and slippery.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 35, type: 'treasure', message: 'Coins washed down from somewhere! Free money!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'some', message: 'A few coins and interesting rocks.', loot: ['ancient_coin', 'ancient_coin', 'obsidian_shard'] },
                        { weight: 20, type: 'slip', message: 'You slip on rocks! Bruised but okay.', healthPenalty: 10, loot: ['ancient_coin'] },
                        { weight: 15, type: 'creature', message: 'Something brushes your leg! You scramble out!', healthPenalty: 5, loot: [] }
                    ]
                },
                {
                    id: 'fish_river',
                    text: '🎣 Fish in the river',
                    preview: 'Risk: Low. Cave fish are... different.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 40, type: 'fish', message: 'Strange but edible cave fish!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'treasure', message: 'Your hook catches something metallic!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 20, type: 'nothing', message: 'Nothing biting today.', loot: [] },
                        { weight: 10, type: 'big_one', message: 'A HUGE cave fish! Worth a fortune to collectors!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_seal'] }
                    ]
                }
            ]
        },

        cave_ancient_painting: {
            id: 'cave_ancient_painting',
            name: 'Ancient Cave Paintings',
            description: 'Prehistoric art adorns the walls. Someone left offerings here thousands of years ago.',
            icon: '🎨',
            locationType: ['cave'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'study_paintings',
                    text: '📖 Study the paintings',
                    preview: 'Risk: None. History lesson.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'map', message: 'The paintings show a map! You recognize a location!', loot: ['ancient_seal', 'ancient_coin'] },
                        { weight: 35, type: 'nothing', message: 'Interesting but not valuable. Nice art though.', loot: [] },
                        { weight: 25, type: 'clue', message: 'A painted X marks a spot on the floor!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'search_offerings',
                    text: '🔍 Search the old offerings',
                    preview: 'Risk: Low. Ancient people left things.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 35, type: 'artifacts', message: 'Ancient artifacts! Museums pay for these!', loot: ['ancient_seal', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'coins', message: 'Ancient coins! Still valuable!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'bones', message: 'Just old bones and pottery shards.', loot: ['bone_fragment', 'ancient_coin'] },
                        { weight: 10, type: 'cursed', message: 'You disturb something. A chill runs through you.', healthPenalty: 5, loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        //
        // CAPITAL EVENTS - royal opportunities and intrigue
        //

        capital_royal_audience: {
            id: 'capital_royal_audience',
            name: 'Royal Audience Chamber',
            description: 'The throne room doors stand open. Nobles mill about seeking favor. Perhaps you could petition the crown.',
            icon: '👑',
            locationType: ['capital'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'petition_crown',
                    text: '📜 Present a petition',
                    preview: 'Risk: Low. Costs gold but could gain favor.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    goldCost: 50,
                    outcomes: [
                        { weight: 35, type: 'favor', message: 'The crown looks favorably upon you! A small grant is awarded.', goldReward: 200, loot: ['ancient_seal'] },
                        { weight: 40, type: 'noted', message: 'Your petition is noted. Perhaps something will come of it.', loot: ['dusty_tome'] },
                        { weight: 25, type: 'dismissed', message: 'Dismissed! The court has no time for commoners today.', loot: [] }
                    ]
                },
                {
                    id: 'observe_nobles',
                    text: '👀 Observe the nobility',
                    preview: 'Risk: None. Watch and learn.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'gossip', message: 'You overhear valuable gossip about trade routes!', loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 35, type: 'contact', message: 'A minor noble notices you. A potential business contact!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'nothing', message: 'Boring political discussions. Nothing useful.', loot: [] }
                    ]
                },
                {
                    id: 'leave_quietly',
                    text: '🚪 Leave quietly',
                    preview: 'Risk: None. Not your scene.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You slip away. The court games are not for you today.', loot: [] }
                    ]
                }
            ]
        },

        capital_grand_market: {
            id: 'capital_grand_market',
            name: 'The Grand Market',
            description: 'The capitals legendary marketplace. Merchants from across the realm hawk exotic wares. Deals await the cunning.',
            icon: '🏪',
            locationType: ['capital'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'hunt_bargains',
                    text: '🔍 Hunt for bargains',
                    preview: 'Risk: Low. Spend time, maybe find deals.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 30, type: 'great_deal', message: 'Incredible find! A merchant is desperate to sell!', loot: ['silver_candelabra', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'good_deal', message: 'Some decent finds at fair prices.', loot: ['ancient_coin', 'ancient_coin', 'dusty_tome'] },
                        { weight: 30, type: 'nothing', message: 'Prices are high today. Nothing worth buying.', loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'exotic_imports',
                    text: '🌍 Browse exotic imports',
                    preview: 'Risk: Low. Foreign goods from distant lands.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 25, type: 'rare_find', message: 'A rare artifact from the eastern kingdoms!', loot: ['ancient_seal', 'enchanted_quill'] },
                        { weight: 45, type: 'interesting', message: 'Interesting wares, though pricey.', loot: ['ancient_coin', 'dusty_tome'] },
                        { weight: 30, type: 'junk', message: 'Mostly tourist trinkets. Not worth it.', loot: [] }
                    ]
                },
                {
                    id: 'quick_browse',
                    text: '👁️ Quick look around',
                    preview: 'Risk: None. Just passing through.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 70, type: 'nothing', message: 'A brief tour. Nothing catches your eye.', loot: [] },
                        { weight: 30, type: 'luck', message: 'You spot a coin on the ground!', loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        capital_banking_district: {
            id: 'capital_banking_district',
            name: 'Banking District',
            description: 'Massive stone buildings house the realms wealth. Money changers and investment opportunities abound.',
            icon: '🏦',
            locationType: ['capital'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'investment_opportunity',
                    text: '📈 Seek investment opportunities',
                    preview: 'Risk: Medium. Could gain or lose gold.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    goldCost: 100,
                    outcomes: [
                        { weight: 30, type: 'profit', message: 'Excellent investment! Your gold multiplies!', goldReward: 250, loot: [] },
                        { weight: 40, type: 'modest', message: 'A modest return on your investment.', goldReward: 130, loot: [] },
                        { weight: 30, type: 'loss', message: 'The venture failed. Your investment is lost.', loot: [] }
                    ]
                },
                {
                    id: 'money_changer',
                    text: '💱 Visit money changers',
                    preview: 'Risk: Low. Exchange foreign currency.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'good_rate', message: 'Favorable exchange rates today!', goldReward: 25, loot: ['ancient_coin'] },
                        { weight: 40, type: 'normal', message: 'Standard rates. Nothing special.', loot: ['ancient_coin'] },
                        { weight: 20, type: 'scam', message: 'The money changer tried to shortchange you! You caught them.', loot: [] }
                    ]
                },
                {
                    id: 'observe_wealthy',
                    text: '👀 Observe the wealthy',
                    preview: 'Risk: None. See how the other half lives.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 50, type: 'inspiration', message: 'You learn some business tactics from watching.', loot: ['dusty_tome'] },
                        { weight: 50, type: 'nothing', message: 'Rich people doing rich people things. Boring.', loot: [] }
                    ]
                }
            ]
        },

        //
        // TOWN/CITY EVENTS - urban exploration
        //

        town_noble_district: {
            id: 'town_noble_district',
            name: 'Noble District',
            description: 'Grand manors line the streets. Guards patrol but opportunities exist for the clever.',
            icon: '🏰',
            locationType: ['city', 'capital', 'town'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'seek_employment',
                    text: '💼 Seek noble employment',
                    preview: 'Risk: Low. Nobles always need help.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 35, type: 'hired', message: 'A noble hires you for a task! Good pay!', goldReward: 75, loot: ['ancient_coin'] },
                        { weight: 40, type: 'maybe', message: 'Leave your name. They might call on you.', loot: ['ancient_coin'] },
                        { weight: 25, type: 'dismissed', message: 'The nobles have no need for your services.', loot: [] }
                    ]
                },
                {
                    id: 'explore_gardens',
                    text: '🌹 Explore the gardens',
                    preview: 'Risk: Low. Public gardens are beautiful.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 30, type: 'find', message: 'Someone dropped something valuable in the hedges!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 40, type: 'peaceful', message: 'A peaceful stroll. You feel refreshed.', healthBonus: 5, loot: [] },
                        { weight: 30, type: 'nothing', message: 'Just flowers and fountains. Pretty though.', loot: [] }
                    ]
                },
                {
                    id: 'case_the_area',
                    text: '🔍 Case the area',
                    preview: 'Risk: Medium. Guards might notice.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 30, type: 'intel', message: 'You note patrol patterns and entry points.', loot: ['dusty_tome'] },
                        { weight: 40, type: 'nothing', message: 'Too many guards. Not worth the risk.', loot: [] },
                        { weight: 30, type: 'caught', message: 'A guard questions you! You talk your way out.', healthPenalty: 5, loot: [] }
                    ]
                }
            ]
        },

        town_tavern_rumors: {
            id: 'town_tavern_rumors',
            name: 'Tavern Rumors',
            description: 'The tavern buzzes with gossip. Locals share stories over ale. Information is currency here.',
            icon: '🍺',
            locationType: ['town', 'village', 'city', 'capital'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'buy_rounds',
                    text: '🍻 Buy a round of drinks',
                    preview: 'Risk: Low. Costs gold, loosens tongues.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    goldCost: 15,
                    outcomes: [
                        { weight: 40, type: 'great_info', message: 'Drunk locals spill valuable secrets!', loot: ['dusty_tome', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'some_info', message: 'You hear some useful gossip.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 25, type: 'nothing', message: 'Just drunken rambling. Waste of gold.', loot: [] }
                    ]
                },
                {
                    id: 'listen_quietly',
                    text: '👂 Listen quietly',
                    preview: 'Risk: None. Free information.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 30, type: 'overheard', message: 'You overhear a merchant discussing a shipment!', loot: ['ancient_coin', 'dusty_tome'] },
                        { weight: 45, type: 'gossip', message: 'Local gossip. Interesting but not valuable.', loot: ['ancient_coin'] },
                        { weight: 25, type: 'nothing', message: 'Too noisy to hear anything useful.', loot: [] }
                    ]
                },
                {
                    id: 'ask_barkeep',
                    text: '🗣️ Ask the barkeep',
                    preview: 'Risk: Low. They know everyone.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 35, type: 'helpful', message: 'The barkeep shares valuable local knowledge!', loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 40, type: 'directions', message: 'They point you to someone who might help.', loot: ['ancient_coin'] },
                        { weight: 25, type: 'busy', message: 'Too busy to chat. Try later.', loot: [] }
                    ]
                }
            ]
        },

        //
        // INN EVENTS - rest and opportunity
        //

        inn_back_room_deals: {
            id: 'inn_back_room_deals',
            name: 'Back Room Dealings',
            description: 'Shady characters gather in the back room. Deals are made here that never see daylight.',
            icon: '🤫',
            locationType: ['inn'],
            difficulty: 'hard',
            choices: [
                {
                    id: 'join_game',
                    text: '🎲 Join the game',
                    preview: 'Risk: High. Gambling with dangerous folk.',
                    healthCost: { min: 0, max: 20 },
                    staminaCost: { min: 10, max: 15 },
                    goldCost: 50,
                    outcomes: [
                        { weight: 30, type: 'big_win', message: 'Lady luck smiles! You clean them out!', goldReward: 200, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'small_win', message: 'You win some, you lose some. Net positive.', goldReward: 75, loot: [] },
                        { weight: 25, type: 'lose', message: 'Bad luck. You lose your stake.', loot: [] },
                        { weight: 10, type: 'cheater', message: 'You catch someone cheating! A fight breaks out!', healthPenalty: 15, loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'seek_info',
                    text: '🔍 Seek black market info',
                    preview: 'Risk: Medium. These folk dont trust easy.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 35, type: 'contact', message: 'A fence offers to buy questionable goods.', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'tip', message: 'Someone mentions a vulnerable merchant.', loot: ['dusty_tome'] },
                        { weight: 30, type: 'suspicious', message: 'They dont trust you. No information shared.', loot: [] }
                    ]
                },
                {
                    id: 'leave_alone',
                    text: '🚪 Leave them alone',
                    preview: 'Risk: None. Smart move.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You walk away. Some doors are best left closed.', loot: [] }
                    ]
                }
            ]
        },

        //
        // PORT EVENTS - maritime adventures
        //

        port_dock_work: {
            id: 'port_dock_work',
            name: 'Dock Work',
            description: 'Ships load and unload constantly. Strong backs are always needed on the docks.',
            icon: '📦',
            locationType: ['port'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'load_cargo',
                    text: '💪 Help load cargo',
                    preview: 'Risk: Low. Honest work, honest pay.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 25, max: 35 },
                    outcomes: [
                        { weight: 50, type: 'good_pay', message: 'Hard work but good pay!', goldReward: 40, loot: ['ancient_coin'] },
                        { weight: 30, type: 'tip', message: 'The captain tips you extra for good work!', goldReward: 60, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 20, type: 'find', message: 'You find something interesting in a crate!', loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                },
                {
                    id: 'inspect_cargo',
                    text: '🔍 Inspect arriving cargo',
                    preview: 'Risk: Low. See whats coming in.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 35, type: 'opportunity', message: 'You spot valuable goods being unloaded!', loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 40, type: 'nothing_special', message: 'Standard trade goods. Nothing exciting.', loot: ['ancient_coin'] },
                        { weight: 25, type: 'suspicious', message: 'Smuggled goods! You know who to tell...', loot: ['ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'rest_by_docks',
                    text: '🌊 Rest by the water',
                    preview: 'Risk: None. Watch the ships.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 5 },
                    outcomes: [
                        { weight: 60, type: 'peaceful', message: 'A peaceful moment watching the sea.', healthBonus: 5, loot: [] },
                        { weight: 40, type: 'find', message: 'You spot something washed up on the dock!', loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        port_ship_cargo_check: {
            id: 'port_ship_cargo_check',
            name: 'Ship Cargo Inspection',
            description: 'A merchant ship has docked. The captain is looking for someone to verify the cargo manifest.',
            icon: '📋',
            locationType: ['port'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'official_check',
                    text: '📝 Official cargo check',
                    preview: 'Risk: Low. Legitimate work.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 40, type: 'bonus', message: 'Everything checks out! The captain is pleased!', goldReward: 50, loot: ['ancient_coin'] },
                        { weight: 35, type: 'standard', message: 'Boring but pays well.', goldReward: 30, loot: [] },
                        { weight: 25, type: 'discrepancy', message: 'You find missing items! The captain rewards your honesty!', goldReward: 75, loot: ['ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'skim_goods',
                    text: '🤫 Skim some goods',
                    preview: 'Risk: High. Theft is risky.',
                    healthCost: { min: 0, max: 25 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 35, type: 'success', message: 'You pocket some valuable items!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 35, type: 'caught', message: 'Almost caught! You drop everything and run!', healthPenalty: 10, loot: [] },
                        { weight: 30, type: 'clean', message: 'Too many eyes watching. Not worth the risk.', loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'decline',
                    text: '🚫 Decline the job',
                    preview: 'Risk: None. Not interested.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'pass', message: 'You have better things to do.', loot: [] }
                    ]
                }
            ]
        },

        port_sailor_recruitment: {
            id: 'port_sailor_recruitment',
            name: 'Sailor Recruitment',
            description: 'Ships are always looking for crew. A voyage could mean adventure and profit.',
            icon: '⛵',
            locationType: ['port'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'sign_up',
                    text: '✍️ Sign up for a voyage',
                    preview: 'Risk: Medium. Sea voyages are dangerous.',
                    healthCost: { min: 10, max: 30 },
                    staminaCost: { min: 30, max: 45 },
                    outcomes: [
                        { weight: 30, type: 'profitable', message: 'Excellent voyage! You return with good pay and spoils!', goldReward: 100, loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 40, type: 'normal', message: 'Standard voyage. Hard work but decent pay.', goldReward: 50, loot: ['ancient_coin'] },
                        { weight: 20, type: 'rough', message: 'Storms and hardship. You barely make it back.', healthPenalty: 15, goldReward: 30, loot: [] },
                        { weight: 10, type: 'treasure', message: 'You discover hidden cargo! Bonus payment!', goldReward: 150, loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] }
                    ]
                },
                {
                    id: 'ask_destinations',
                    text: '🗺️ Ask about destinations',
                    preview: 'Risk: None. Information gathering.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'useful', message: 'You learn about profitable trade routes!', loot: ['dusty_tome'] },
                        { weight: 50, type: 'vague', message: 'Sailors are secretive about their routes.', loot: [] }
                    ]
                },
                {
                    id: 'stay_on_land',
                    text: '🚶 Stay on dry land',
                    preview: 'Risk: None. The sea is not for everyone.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 0 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You prefer solid ground under your feet.', loot: [] }
                    ]
                }
            ]
        },

        //
        // OUTPOST EVENTS - military frontier
        //

        outpost_scout_report: {
            id: 'outpost_scout_report',
            name: 'Scout Report Duty',
            description: 'The commander needs scouts to survey the surrounding area and report back.',
            icon: '🔭',
            locationType: ['outpost'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'volunteer',
                    text: '🏃 Volunteer for scouting',
                    preview: 'Risk: Medium. Enemies lurk beyond walls.',
                    healthCost: { min: 5, max: 25 },
                    staminaCost: { min: 25, max: 35 },
                    outcomes: [
                        { weight: 35, type: 'success', message: 'Successful reconnaissance! The commander rewards you!', goldReward: 60, loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'discovery', message: 'You discover an enemy camp! Valuable intel!', goldReward: 80, loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 25, type: 'ambush', message: 'Ambushed! You fight your way back!', healthPenalty: 15, loot: ['bone_fragment', 'ancient_coin'] },
                        { weight: 10, type: 'treasure', message: 'You find an abandoned cache in the wilderness!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'rusted_medallion'] }
                    ]
                },
                {
                    id: 'study_maps',
                    text: '🗺️ Study the maps instead',
                    preview: 'Risk: None. Indoor work.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 50, type: 'insight', message: 'You notice something others missed on the maps!', goldReward: 25, loot: ['dusty_tome'] },
                        { weight: 50, type: 'nothing', message: 'Standard cartography. Nothing special.', loot: [] }
                    ]
                },
                {
                    id: 'decline_duty',
                    text: '🚫 Decline the duty',
                    preview: 'Risk: None. Not your job.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 0 },
                    outcomes: [
                        { weight: 100, type: 'pass', message: 'You have other priorities.', loot: [] }
                    ]
                }
            ]
        },

        outpost_supply_run: {
            id: 'outpost_supply_run',
            name: 'Supply Run',
            description: 'The outpost needs supplies from a nearby settlement. A delivery escort is needed.',
            icon: '🛒',
            locationType: ['outpost'],
            difficulty: 'medium',
            choices: [
                {
                    id: 'escort_supplies',
                    text: '🛡️ Escort the supplies',
                    preview: 'Risk: Medium. Bandits target supply wagons.',
                    healthCost: { min: 5, max: 20 },
                    staminaCost: { min: 20, max: 30 },
                    outcomes: [
                        { weight: 40, type: 'smooth', message: 'Uneventful journey. The garrison is grateful!', goldReward: 45, loot: ['ancient_coin'] },
                        { weight: 30, type: 'bandits', message: 'Bandits attack! You fight them off!', healthPenalty: 10, goldReward: 70, loot: ['ancient_coin', 'ancient_coin', 'bone_fragment'] },
                        { weight: 20, type: 'bonus', message: 'You find a merchant along the way with good deals!', goldReward: 40, loot: ['ancient_coin', 'ancient_coin', 'rusted_medallion'] },
                        { weight: 10, type: 'ambush', message: 'Heavy ambush! Supplies lost!', healthPenalty: 20, loot: ['bone_fragment'] }
                    ]
                },
                {
                    id: 'help_load',
                    text: '📦 Help load at the outpost',
                    preview: 'Risk: Low. Manual labor.',
                    healthCost: { min: 0, max: 5 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 60, type: 'paid', message: 'Honest work for honest pay.', goldReward: 25, loot: [] },
                        { weight: 40, type: 'tip', message: 'The quartermaster tips you for good work!', goldReward: 40, loot: ['ancient_coin'] }
                    ]
                },
                {
                    id: 'pass',
                    text: '🚶 Not interested',
                    preview: 'Risk: None. Skip this one.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 0, max: 0 },
                    outcomes: [
                        { weight: 100, type: 'skip', message: 'You move on to other opportunities.', loot: [] }
                    ]
                }
            ]
        },

        //
        // VILLAGE EVENTS - rural life
        //

        village_rumor_mill: {
            id: 'village_rumor_mill',
            name: 'Village Rumor Mill',
            description: 'The village well is where everyone gathers to gossip. The old women know everything.',
            icon: '🗣️',
            locationType: ['village'],
            difficulty: 'easy',
            choices: [
                {
                    id: 'chat_elders',
                    text: '👵 Chat with the elders',
                    preview: 'Risk: None. Old folks love to talk.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 35, type: 'treasure_rumor', message: 'They speak of hidden treasure in the old ruins!', loot: ['dusty_tome', 'ancient_coin'] },
                        { weight: 35, type: 'local_news', message: 'You learn about local events and opportunities.', loot: ['ancient_coin'] },
                        { weight: 30, type: 'rambling', message: 'Just complaints about the youth. Nothing useful.', loot: [] }
                    ]
                },
                {
                    id: 'help_fetch',
                    text: '🪣 Help fetch water',
                    preview: 'Risk: None. Earn goodwill.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 50, type: 'grateful', message: 'The villagers are grateful! One shares a secret!', loot: ['ancient_coin', 'ancient_coin'] },
                        { weight: 50, type: 'thanks', message: 'Simple thanks. Good karma at least.', healthBonus: 5, loot: [] }
                    ]
                },
                {
                    id: 'listen_quietly',
                    text: '👂 Eavesdrop',
                    preview: 'Risk: Low. Quiet observation.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 40, type: 'useful', message: 'You overhear something valuable!', loot: ['dusty_tome'] },
                        { weight: 40, type: 'gossip', message: 'Just village drama. Entertaining though.', loot: [] },
                        { weight: 20, type: 'caught', message: 'They notice you listening. Awkward.', loot: [] }
                    ]
                }
            ]
        },

        //
        // BOSS ENCOUNTER EVENTS - the ultimate test of exploration
        // These trigger boss fights after sufficient exploration progress
        //

        boss_malachar: {
            id: 'boss_malachar',
            name: 'The Dark Lords Chamber',
            description: 'A massive door of black iron stands before you. Ancient runes pulse with malevolent energy. Beyond lies Malachar, the Dark Lord himself.',
            icon: '👹',
            locationType: ['dungeon'],
            difficulty: 'deadly',
            requiresExplorationCount: 8,
            isBossEncounter: true,
            bossId: 'malachar',
            choices: [
                {
                    id: 'challenge_boss',
                    text: '⚔️ Challenge Malachar',
                    preview: 'Risk: EXTREME. This is a boss fight. Prepare to die or be legend.',
                    healthCost: { min: 50, max: 100 },
                    staminaCost: { min: 40, max: 60 },
                    outcomes: [
                        { weight: 30, type: 'victory', message: 'MALACHAR IS DEFEATED! The Dark Lord falls! His hoard is yours!', triggerBossDefeat: 'malachar', loot: ['blade_of_virtue', 'void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'pyrrhic', message: 'You defeat Malachar but at great cost. Worth it.', triggerBossDefeat: 'malachar', healthPenalty: 50, loot: ['void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'defeat', message: 'Malachar is too powerful! You barely escape with your life!', healthPenalty: 80, loot: ['bone_fragment'] }
                    ]
                },
                {
                    id: 'prepare_first',
                    text: '🛡️ Scout and prepare',
                    preview: 'Risk: Low. Wisdom before valor.',
                    healthCost: { min: 5, max: 15 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 50, type: 'intel', message: 'You observe his patterns. Next time you will be ready.', loot: ['dusty_tome'] },
                        { weight: 30, type: 'spotted', message: 'He senses you! A blast of dark energy!', healthPenalty: 20, loot: [] },
                        { weight: 20, type: 'weakness', message: 'You discover a weakness! The blade of virtue can harm him!', loot: ['ancient_seal'] }
                    ]
                },
                {
                    id: 'retreat',
                    text: '🚪 Retreat for now',
                    preview: 'Risk: None. Live to fight another day.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 10, max: 10 },
                    outcomes: [
                        { weight: 100, type: 'safe', message: 'You back away slowly. The door remains. He waits.', loot: [] }
                    ]
                }
            ]
        },

        boss_grimfang: {
            id: 'boss_grimfang',
            name: 'The Alphas Den',
            description: 'Wolf bones litter the cave floor. A massive shape moves in the darkness. Grimfang, alpha of the Bloodmoon Pack, has caught your scent.',
            icon: '🐺',
            locationType: ['dungeon', 'forest'],
            difficulty: 'hard',
            requiresExplorationCount: 4,
            isBossEncounter: true,
            bossId: 'alpha_wolf',
            choices: [
                {
                    id: 'fight_alpha',
                    text: '⚔️ Fight Grimfang',
                    preview: 'Risk: HIGH. Alpha wolves dont go down easy.',
                    healthCost: { min: 30, max: 60 },
                    staminaCost: { min: 30, max: 45 },
                    outcomes: [
                        { weight: 35, type: 'victory', message: 'GRIMFANG IS SLAIN! The pack scatters without their alpha!', triggerBossDefeat: 'alpha_wolf', loot: ['demon_tooth', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'bloody_win', message: 'You kill Grimfang but his fangs found their mark.', triggerBossDefeat: 'alpha_wolf', healthPenalty: 30, loot: ['demon_tooth', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'driven_off', message: 'Grimfang drives you back! You escape with wounds.', healthPenalty: 40, loot: ['bone_fragment'] }
                    ]
                },
                {
                    id: 'use_meat',
                    text: '🥩 Distract with meat',
                    preview: 'Risk: Low. Wolves love food.',
                    healthCost: { min: 0, max: 10 },
                    staminaCost: { min: 10, max: 15 },
                    outcomes: [
                        { weight: 40, type: 'distracted', message: 'Grimfang is distracted! You slip past and grab treasure!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 35, type: 'unimpressed', message: 'He ignores the meat. He wants YOUR meat.', healthPenalty: 15, loot: [] },
                        { weight: 25, type: 'pack_comes', message: 'The meat attracts the whole pack! RUN!', healthPenalty: 25, loot: [] }
                    ]
                }
            ]
        },

        boss_frost_lord: {
            id: 'boss_frost_lord',
            name: 'The Frozen Throne',
            description: 'Ice covers everything. Your breath freezes. On a throne of glacial ice sits the Frost Lord, elemental of eternal winter.',
            icon: '❄️',
            locationType: ['cave'],
            difficulty: 'hard',
            requiresExplorationCount: 6,
            isBossEncounter: true,
            bossId: 'frost_lord',
            choices: [
                {
                    id: 'challenge_frost',
                    text: '⚔️ Challenge the Frost Lord',
                    preview: 'Risk: VERY HIGH. Cold burns worse than fire.',
                    healthCost: { min: 40, max: 80 },
                    staminaCost: { min: 35, max: 50 },
                    outcomes: [
                        { weight: 30, type: 'victory', message: 'THE FROST LORD SHATTERS! His frozen tear remains!', triggerBossDefeat: 'frost_lord', loot: ['void_crystal', 'obsidian_shard', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'frostbitten', message: 'Victory! But the cold has marked you forever.', triggerBossDefeat: 'frost_lord', healthPenalty: 40, loot: ['void_crystal', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'frozen', message: 'Too cold! You retreat before becoming an ice sculpture!', healthPenalty: 50, loot: [] }
                    ]
                },
                {
                    id: 'offer_warmth',
                    text: '🔥 Offer fire as tribute',
                    preview: 'Risk: Unknown. Elementals are unpredictable.',
                    healthCost: { min: 10, max: 20 },
                    staminaCost: { min: 15, max: 20 },
                    outcomes: [
                        { weight: 30, type: 'amused', message: 'He finds your flame amusing. Takes tribute, lets you live.', loot: ['obsidian_shard', 'ancient_coin'] },
                        { weight: 40, type: 'angry', message: 'FIRE?! He HATES fire! Ice shards fly!', healthPenalty: 30, loot: [] },
                        { weight: 30, type: 'curious', message: 'He examines the fire. While distracted, you grab loot.', loot: ['void_crystal', 'ancient_coin', 'ancient_coin'] }
                    ]
                }
            ]
        },

        boss_dragon: {
            id: 'boss_dragon',
            name: 'The Dragons Hoard',
            description: 'Mountains of gold. Rivers of gems. And atop it all, a dragon the size of a house. Scorathax the Ancient opens one baleful eye.',
            icon: '🐉',
            locationType: ['cave'],
            difficulty: 'deadly',
            requiresExplorationCount: 10,
            isBossEncounter: true,
            bossId: 'dragon',
            choices: [
                {
                    id: 'fight_dragon',
                    text: '⚔️ FIGHT THE DRAGON',
                    preview: 'Risk: LEGENDARY. Dragon slayers are rare for a reason.',
                    healthCost: { min: 60, max: 120 },
                    staminaCost: { min: 50, max: 70 },
                    outcomes: [
                        { weight: 20, type: 'dragonslayer', message: 'IMPOSSIBLE! YOU SLEW THE DRAGON! LEGENDARY!!!', triggerBossDefeat: 'dragon', loot: ['dragon_scale', 'blood_ruby', 'void_crystal', 'void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 30, type: 'wounded_victory', message: 'THE DRAGON FALLS! But so do you... almost. Worth it.', triggerBossDefeat: 'dragon', healthPenalty: 70, loot: ['dragon_scale', 'void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 50, type: 'roasted', message: 'FIRE! So much fire! You flee, barely alive, smelling of smoke.', healthPenalty: 90, loot: [] }
                    ]
                },
                {
                    id: 'negotiate',
                    text: '💬 Attempt to negotiate',
                    preview: 'Risk: Variable. Dragons love riddles and gold.',
                    healthCost: { min: 0, max: 30 },
                    staminaCost: { min: 10, max: 20 },
                    goldCost: 100,
                    outcomes: [
                        { weight: 25, type: 'amused', message: 'The dragon is amused! He lets you take SOME treasure.', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'void_crystal'] },
                        { weight: 35, type: 'bored', message: 'BORING! He breathes fire in your direction. As a warning.', healthPenalty: 20, loot: [] },
                        { weight: 25, type: 'riddle', message: 'He asks a riddle! You answer correctly! He honors the deal!', loot: ['blood_ruby', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 15, type: 'insulted', message: '100 GOLD?! THATS ALL?! He is DEEPLY insulted!', healthPenalty: 40, loot: [] }
                    ]
                },
                {
                    id: 'sneak_treasure',
                    text: '🤫 Sneak and grab treasure',
                    preview: 'Risk: HIGH. Dragons have excellent hearing.',
                    healthCost: { min: 10, max: 40 },
                    staminaCost: { min: 30, max: 45 },
                    outcomes: [
                        { weight: 25, type: 'success', message: 'Like a shadow! You fill your pockets and escape!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'void_crystal'] },
                        { weight: 35, type: 'partial', message: 'He stirs! You grab what you can and RUN!', loot: ['ancient_coin', 'ancient_coin', 'ancient_coin'] },
                        { weight: 40, type: 'caught', message: 'HE WAKES! Fire everywhere! You escape singed!', healthPenalty: 35, loot: ['ancient_coin'] }
                    ]
                }
            ]
        },

        //
        // DOOM PORTAL EVENTS - gateways to the corrupted world
        //

        doom_portal_activation: {
            id: 'doom_portal_activation',
            name: 'The Doom Portal',
            description: 'A swirling vortex of dark energy pulses before you. Through it, you see a twisted reflection of the world - corrupted, dying, ruled by GREED. The Boatman awaits.',
            icon: '🌀',
            locationType: ['dungeon'],
            difficulty: 'deadly',
            requiresBossDefeated: true,
            isDoomPortal: true,
            choices: [
                {
                    id: 'enter_portal',
                    text: '🌀 Enter the Doom World',
                    preview: 'Risk: UNKNOWN. Another world awaits. There may be no return.',
                    healthCost: { min: 20, max: 40 },
                    staminaCost: { min: 30, max: 40 },
                    outcomes: [
                        { weight: 100, type: 'transport', message: 'The portal consumes you. Reality twists. You emerge in... the Doom World.', triggerDoomWorld: true, loot: [] }
                    ]
                },
                {
                    id: 'speak_boatman',
                    text: '💀 Speak with the Boatman',
                    preview: 'Risk: None. He knows things.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 10 },
                    outcomes: [
                        { weight: 50, type: 'warning', message: '"The Doom World is death, traveler. GREED rules there. Gold is worthless. Only survival matters." He grins.', loot: [] },
                        { weight: 30, type: 'hint', message: '"Bring food and water. Much food. Much water. Gold cannot buy life where we go."', loot: [] },
                        { weight: 20, type: 'cryptic', message: '"I have ferried many. None return the same. Most dont return at all." He laughs.', loot: [] }
                    ]
                },
                {
                    id: 'turn_back',
                    text: '🚪 Turn back',
                    preview: 'Risk: None. The portal will wait.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'retreat', message: 'You step away from the portal. It pulses, waiting. The Boatman nods.', loot: [] }
                    ]
                }
            ]
        },

        doom_return_portal: {
            id: 'doom_return_portal',
            name: 'Portal Home',
            description: 'A faint shimmer in the corrupted air. A way back to the normal world. But is it safe? Can you trust anything in the Doom World?',
            icon: '✨',
            locationType: ['dungeon'],
            difficulty: 'medium',
            isDoomWorldOnly: true,
            choices: [
                {
                    id: 'return_home',
                    text: '🏠 Return to the normal world',
                    preview: 'Risk: Low. Escape this nightmare.',
                    healthCost: { min: 10, max: 20 },
                    staminaCost: { min: 15, max: 25 },
                    outcomes: [
                        { weight: 70, type: 'safe_return', message: 'The portal accepts you. Reality stabilizes. You are HOME.', triggerReturnFromDoom: true, loot: [] },
                        { weight: 20, type: 'rough_transit', message: 'The transit is rough. You arrive battered but alive.', triggerReturnFromDoom: true, healthPenalty: 15, loot: [] },
                        { weight: 10, type: 'trapped', message: 'The portal flickers! Not yet stable! Try again later.', loot: [] }
                    ]
                },
                {
                    id: 'stay_doom',
                    text: '💀 Stay in the Doom World',
                    preview: 'Risk: HIGH. More to explore... more to survive.',
                    healthCost: { min: 0, max: 0 },
                    staminaCost: { min: 5, max: 5 },
                    outcomes: [
                        { weight: 100, type: 'stay', message: 'You turn away from salvation. The Doom World calls to you.', loot: [] }
                    ]
                }
            ]
        }
    },

    //
    //  BOSS ENCOUNTERS - the big bads that guard the good loot
    // 
    // These spawn at specific locations after exploration threshold
    // Defeating them fires 'enemy-defeated' for quest completion

    BOSS_ENCOUNTERS: {
        // Shadow Tower Boss - Malachar the Dark Lord
        malachar: {
            id: 'malachar',
            name: 'Malachar the Dark Lord',
            title: 'Dark Lord',
            location: 'shadow_tower',
            requiredExplorations: 8, // Must explore 8 rooms before boss appears
            health: 500,
            damage: { min: 25, max: 45 },
            defense: 20,
            icon: '👹',
            voice: 'onyx',
            personality: 'dark_lord',
            description: 'An ancient evil awakens. Malachar, the Dark Lord who has terrorized the realm for centuries, stands before you. His eyes burn with malevolent power.',
            taunt: 'Foolish mortal... you dare enter MY domain? Your soul will feed my darkness for eternity!',
            defeatMessage: 'IMPOSSIBLE! I am eternal! I am... *dissolves into shadows*',
            victoryMessage: 'Malachar the Dark Lord has been vanquished! The realm is saved!',
            rewards: { gold: 1000, items: ['blade_of_virtue', 'dark_staff', 'ancient_coin', 'ancient_coin', 'ancient_coin', 'void_crystal'] },
            questEnemy: 'malachar'
        },

        // Frozen Cave Boss - The Frost Lord
        frost_lord: {
            id: 'frost_lord',
            name: 'The Frost Lord',
            title: 'Elemental of Eternal Winter',
            location: 'frozen_cave',
            requiredExplorations: 6,
            health: 400,
            damage: { min: 20, max: 40 },
            defense: 25,
            icon: '❄️',
            voice: 'ash',
            personality: 'frost_lord',
            description: 'The air freezes around you. An elemental being of pure ice and cold materializes - the Frost Lord, harbinger of endless winter.',
            taunt: 'The cold... eternal... Your warmth fades... Winter comes for all...',
            defeatMessage: 'The ice... shatters... but winter... never truly... dies...',
            victoryMessage: 'The Frost Lord crumbles! The Frozen Tear remains - the last of his power!',
            rewards: { gold: 800, items: ['frozen_tear', 'ice_blade', 'void_crystal', 'ancient_coin', 'ancient_coin'] },
            questEnemy: 'frost_lord'
        },

        // Deep Cavern Boss - Ancient Dragon
        dragon: {
            id: 'dragon',
            name: 'Scorathax the Ancient',
            title: 'Ancient Dragon',
            location: 'deep_cavern',
            requiredExplorations: 10,
            health: 800,
            damage: { min: 35, max: 60 },
            defense: 30,
            icon: '🐉',
            voice: 'onyx',
            personality: 'dragon',
            description: 'Mountains of gold and bones surround the largest creature you have ever seen. Scorathax, an ancient dragon, opens one massive eye.',
            taunt: 'Mortal... you dare address ME? I have burned kingdoms. Your gold... it will be mine. As will your BONES!',
            defeatMessage: 'Impossible... I have lived... for millennia... *massive crash*',
            victoryMessage: 'THE DRAGON IS SLAIN! You are legend! Songs will be sung of this day!',
            rewards: { gold: 2000, items: ['dragon_scale', 'dragonbone_blade', 'blood_ruby', 'void_crystal', 'void_crystal', 'ancient_coin', 'ancient_coin', 'ancient_coin'] },
            questEnemy: 'dragon'
        },

        // Forest Dungeon Boss - Alpha Wolf
        alpha_wolf: {
            id: 'alpha_wolf',
            name: 'Grimfang',
            title: 'Alpha of the Bloodmoon Pack',
            location: 'forest_dungeon',
            requiredExplorations: 4,
            health: 200,
            damage: { min: 15, max: 30 },
            defense: 10,
            icon: '🐺',
            voice: 'ballad',
            personality: 'alpha_wolf',
            description: 'A massive wolf emerges from the shadows. Grimfang, the alpha of the dreaded Bloodmoon Pack, snarls with primal fury.',
            taunt: '*HOWWWWL* This forest is MINE! Your blood will feed my pack!',
            defeatMessage: '*whimper* The pack... will... remember...',
            victoryMessage: 'Grimfang falls! The alpha is dead - the pack will scatter!',
            rewards: { gold: 180, items: ['wolf_pelts', 'wolf_pelts', 'wolf_pelts', 'demon_tooth', 'ancient_coin'] },
            questEnemy: 'alpha_wolf'
        },

        // Bandit Camp Boss - Bandit Chief
        bandit_chief: {
            id: 'bandit_chief',
            name: 'Scarhand Viktor',
            title: 'Bandit Chief',
            location: 'bandit_camp',
            requiredExplorations: 3,
            health: 250,
            damage: { min: 18, max: 32 },
            defense: 15,
            icon: '🗡️',
            voice: 'onyx',
            personality: 'bandit_chief',
            description: 'A scarred brute of a man blocks your path. Scarhand Viktor, the infamous bandit chief, draws two wicked blades.',
            taunt: 'Another hero come to die? Your gold or your life - actually, I\'ll take BOTH!',
            defeatMessage: 'You... you got lucky... *collapses*',
            victoryMessage: 'Scarhand Viktor is defeated! The bandit threat is ended!',
            rewards: { gold: 350, items: ['bandit_insignia', 'bandit_insignia', 'bandit_insignia', 'ancient_coin', 'ancient_coin', 'steel_sword'] },
            questEnemy: 'bandit'
        },

        // Goblin Warren Boss
        goblin_king: {
            id: 'goblin_king',
            name: 'Griknak the Goblin King',
            title: 'King of the Warren',
            location: 'shadow_dungeon',
            requiredExplorations: 5,
            health: 180,
            damage: { min: 12, max: 25 },
            defense: 8,
            icon: '👺',
            voice: 'fable',
            personality: 'goblin_king',
            description: 'A goblin wearing a crude crown made of bones cackles madly. Griknak, self-proclaimed King of the Warren, points at you.',
            taunt: 'HEHEHEHE! Fresh meat for Griknak! Shiny human! KILL KILL KILL!',
            defeatMessage: 'Nooo! My shinies! My kingdom! HISSSS! *flees into darkness*',
            victoryMessage: 'The Goblin King is defeated! His hoard is yours!',
            rewards: { gold: 200, items: ['goblin_ears', 'goblin_ears', 'goblin_ears', 'goblin_ears', 'goblin_ears', 'ancient_coin', 'ancient_coin', 'skull_goblet'] },
            questEnemy: 'goblin'
        },

        // Smuggler's Cove Boss
        smuggler_boss: {
            id: 'smuggler_boss',
            name: 'Captain Blackheart',
            title: 'Smuggler Lord',
            location: 'smugglers_cove',
            requiredExplorations: 4,
            health: 220,
            damage: { min: 15, max: 28 },
            defense: 12,
            icon: '🏴‍☠️',
            voice: 'dan',
            personality: 'smuggler_boss',
            description: 'A weathered sailor with an eyepatch blocks the cavern exit. Captain Blackheart, lord of the smugglers, draws a cutlass.',
            taunt: 'You\'ve seen too much, friend. Can\'t let you leave. Nothing personal.',
            defeatMessage: 'Should\'ve... stayed retired... *cough*',
            victoryMessage: 'Captain Blackheart is finished! The smuggling ring is broken!',
            rewards: { gold: 300, items: ['exotic_goods', 'exotic_goods', 'ancient_coin', 'ancient_coin', 'blood_ruby'] },
            isBoss: true,
            questEnemy: 'smuggler'
        },

        // Giant Rat - for easy rat quest
        giant_rat_queen: {
            id: 'giant_rat_queen',
            name: 'The Rat Queen',
            title: 'Queen of the Warren',
            location: 'sewer', // generic dungeon
            requiredExplorations: 2,
            health: 100,
            damage: { min: 8, max: 15 },
            defense: 5,
            icon: '🐀',
            voice: 'echo',
            personality: 'rat_queen',
            description: 'A rat the size of a large dog hisses at you. The Rat Queen protects her disgusting brood.',
            taunt: '*SCREEEEEECH* *bares teeth*',
            defeatMessage: '*squeak* *dies*',
            victoryMessage: 'The Rat Queen is dead! The infestation should slow now.',
            rewards: { gold: 50, items: ['bone_fragment', 'bone_fragment', 'ancient_coin'] },
            isBoss: true,
            questEnemy: 'giant_rat'
        }
    },

    // Track boss defeats and exploration progress per location
    bossProgress: {},
    defeatedBosses: {},

    // 
    //  DIFFICULTY SCALING - distance from safety = more pain
    // 

    DIFFICULTY_MULTIPLIERS: {
        tutorial: { healthMult: 0.5, staminaMult: 0.5, lootMult: 1.2, goldMult: 1.0 },
        easy: { healthMult: 0.7, staminaMult: 0.7, lootMult: 0.8, goldMult: 0.8 },
        medium: { healthMult: 1.0, staminaMult: 1.0, lootMult: 1.0, goldMult: 1.0 },
        hard: { healthMult: 1.5, staminaMult: 1.3, lootMult: 1.3, goldMult: 1.3 },
        deadly: { healthMult: 2.0, staminaMult: 1.5, lootMult: 1.8, goldMult: 1.8 }
    },

    // Capital distance = difficulty (how far from civilization's warm embrace)
    REGION_DIFFICULTY: {
        capital: 'easy',
        starter: 'easy',
        eastern: 'medium',
        southern: 'medium',
        western: 'hard',
        northern: 'hard'
    },

    // 
    //  SURVIVAL REQUIREMENTS - gear up or die trying
    // 
    // minimum equipment needed to not instantly regret your decisions

    SURVIVAL_REQUIREMENTS: {
        easy: {
            minHealth: 20,
            minStamina: 15,
            recommendedArmor: 0,
            recommendedWeapon: 0,
            survivalChance: 0.95, // naked newbies can survive... barely
            warningText: 'Even a naked fool can survive here. Probably.'
        },
        medium: {
            minHealth: 40,
            minStamina: 30,
            recommendedArmor: 10,
            recommendedWeapon: 5,
            survivalChance: 0.7, // need some gear
            warningText: 'Bring a weapon. And maybe pants. Armor helps.'
        },
        hard: {
            minHealth: 70,
            minStamina: 50,
            recommendedArmor: 25,
            recommendedWeapon: 15,
            survivalChance: 0.4, // fully geared can handle it
            warningText: 'Full gear or full regret. Your choice, hero.'
        },
        deadly: {
            minHealth: 90,
            minStamina: 70,
            recommendedArmor: 40,
            recommendedWeapon: 25,
            survivalChance: 0.2, // even geared its rough
            warningText: 'Even legends die here. Often. Painfully.'
        }
    },

    // 
    // COOLDOWN TRACKING - even dungeons need beauty sleep
    // 

    //  12-hour cooldown ensures dungeons feel special, not farmable 
    // Balancing act: long enough to prevent exploitation, short enough to keep players engaged
    // Players can still explore multiple locations, just not spam the same one repeatedly
    COOLDOWN_HOURS: 12,
    locationCooldowns: {},

    // 
    //  CORE METHODS - the gears that grind the bones
    // 

    init() {
        console.log('🏚️ DungeonExplorationSystem: Rising from the crypt...');

        // Load cooldowns from storage
        this.loadCooldowns();

        //  Load boss progress
        this.loadBossProgress();

        // Register exploration loot in ItemDatabase
        this.registerExplorationLoot();

        console.log('🏚️ DungeonExplorationSystem: Ready to plunder');
        console.log(`👹 Bosses loaded: ${Object.keys(this.BOSS_ENCOUNTERS).length}`);
    },

    // Register our special loot items in the main ItemDatabase
    registerExplorationLoot() {
        if (typeof ItemDatabase !== 'undefined') {
            Object.entries(this.EXPLORATION_LOOT).forEach(([id, item]) => {
                if (!ItemDatabase.items[id]) {
                    ItemDatabase.items[id] = item;
                }
            });
            console.log(`🏚️ Registered ${Object.keys(this.EXPLORATION_LOOT).length} exploration loot items`);
        }
    },

    // Check if a location is explorable - ALL locations can be explored!
    isExplorableLocation(location) {
        // All location types can be explored - each has its own events
        const explorableTypes = [
            'dungeon', 'cave', 'ruins', 'mine',      // Dangerous locations
            'town', 'village', 'city', 'capital',    // Settlements
            'forest', 'farm', 'port', 'shrine',      // Other locations
            'castle', 'market', 'inn'                // Special locations
        ];
        return location && location.type && explorableTypes.includes(location.type);
    },

    // Get difficulty for a location based on region and type
    getLocationDifficulty(location) {
        if (!location) return 'medium';

        const regionDiff = this.REGION_DIFFICULTY[location.region] || 'medium';

        // Settlement types are always easy - civilized areas
        const safeTypes = ['town', 'village', 'city', 'capital', 'farm', 'port'];
        if (safeTypes.includes(location.type)) {
            return 'easy';
        }

        // Forest is medium at most
        if (location.type === 'forest') {
            return regionDiff === 'hard' ? 'medium' : 'easy';
        }

        // Special locations can override - dungeons are harder
        if (location.type === 'dungeon') {
            // Dungeons are always at least medium
            if (regionDiff === 'easy') return 'medium';
            if (regionDiff === 'medium') return 'hard';
            if (regionDiff === 'hard') return 'deadly';
        }

        return regionDiff;
    },

    // Check if location is on cooldown
    // Optional: pass isQuestExploration=true to bypass cooldown for quest-related explorations
    isOnCooldown(locationId, isQuestExploration = false) {
        // Quest explorations NEVER have cooldowns - player needs to progress!
        if (isQuestExploration) {
            return false;
        }

        // Dungeon Bonanza (July 18th) bypasses all cooldowns!
        if (typeof DungeonBonanzaSystem !== 'undefined' && DungeonBonanzaSystem.shouldBypassCooldowns()) {
            console.log('💀 Dark Convergence active - dungeon cooldowns bypassed!');
            return false;
        }

        const lastExplored = this.locationCooldowns[locationId];
        if (!lastExplored) return false;

        const now = Date.now();
        const hoursPassed = (now - lastExplored) / (1000 * 60 * 60);

        return hoursPassed < this.COOLDOWN_HOURS;
    },

    // Get remaining cooldown time
    getCooldownRemaining(locationId) {
        const lastExplored = this.locationCooldowns[locationId];
        if (!lastExplored) return 0;

        const now = Date.now();
        const hoursPassed = (now - lastExplored) / (1000 * 60 * 60);
        const remaining = this.COOLDOWN_HOURS - hoursPassed;

        return Math.max(0, remaining);
    },

    // Set cooldown for a location
    setCooldown(locationId) {
        this.locationCooldowns[locationId] = Date.now();
        this.saveCooldowns();
    },

    // Save cooldowns to localStorage
    saveCooldowns() {
        try {
            localStorage.setItem('dungeonCooldowns', JSON.stringify(this.locationCooldowns));
        } catch (e) {
            console.warn('🏚️ Failed to save cooldowns:', e);
        }
    },

    // Load cooldowns from localStorage
    loadCooldowns() {
        try {
            const saved = localStorage.getItem('dungeonCooldowns');
            if (saved) {
                this.locationCooldowns = JSON.parse(saved);
                // Clean up old cooldowns
                const now = Date.now();
                Object.keys(this.locationCooldowns).forEach(key => {
                    const hoursPassed = (now - this.locationCooldowns[key]) / (1000 * 60 * 60);
                    if (hoursPassed > this.COOLDOWN_HOURS * 2) {
                        delete this.locationCooldowns[key];
                    }
                });
            }
        } catch (e) {
            console.warn('🏚️ Failed to load cooldowns:', e);
            this.locationCooldowns = {};
        }
    },

    // Get available events for a location type
    getEventsForLocation(locationType) {
        return Object.values(this.EXPLORATION_EVENTS).filter(event =>
            event.locationType.includes(locationType)
        );
    },

    // 
    //  SURVIVAL CHECK METHODS - are you ready for this?
    // 

    // Get player's total armor defense value
    getPlayerArmorValue(playerStats) {
        let totalArmor = 0;

        // get equipment via PlayerStateManager or fallback
        const equipment = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.equipment.getAll()
            : (game?.player?.equipment || {});

        if (Object.keys(equipment).length > 0) {
            // Check each equipment slot for defense values
            if (equipment.armor) {
                const armorItem = ItemDatabase?.getItem?.(equipment.armor);
                totalArmor += armorItem?.defense || 10;
            }
            if (equipment.helmet) {
                const helmetItem = ItemDatabase?.getItem?.(equipment.helmet);
                totalArmor += helmetItem?.defense || 5;
            }
            if (equipment.shield) {
                const shieldItem = ItemDatabase?.getItem?.(equipment.shield);
                totalArmor += shieldItem?.defense || 8;
            }
            if (equipment.boots) {
                const bootsItem = ItemDatabase?.getItem?.(equipment.boots);
                totalArmor += bootsItem?.defense || 3;
            }
            if (equipment.gloves) {
                const glovesItem = ItemDatabase?.getItem?.(equipment.gloves);
                totalArmor += glovesItem?.defense || 2;
            }
        }

        return totalArmor;
    },

    // Get player's weapon damage value
    getPlayerWeaponValue(playerStats) {
        let totalDamage = 0;

        // get equipment via PlayerStateManager or fallback
        const equipment = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.equipment.getAll()
            : (game?.player?.equipment || {});

        if (equipment.weapon) {
            const weaponItem = ItemDatabase?.getItem?.(equipment.weapon);
            totalDamage += weaponItem?.damage || 5;
        }

        // Base unarmed damage
        return totalDamage || 2;
    },

    // Calculate survival assessment for a location
    calculateSurvivalAssessment(location, playerStats) {
        const difficulty = this.getLocationDifficulty(location);
        const requirements = this.SURVIVAL_REQUIREMENTS[difficulty] || this.SURVIVAL_REQUIREMENTS.medium;

        const currentHealth = playerStats?.stats?.health || 100;
        const currentStamina = playerStats?.stats?.stamina || 100;
        const playerArmor = this.getPlayerArmorValue(playerStats);
        const playerWeapon = this.getPlayerWeaponValue(playerStats);

        // Calculate readiness percentages
        const healthReadiness = Math.min(100, (currentHealth / requirements.minHealth) * 100);
        const staminaReadiness = Math.min(100, (currentStamina / requirements.minStamina) * 100);
        const armorReadiness = requirements.recommendedArmor > 0
            ? Math.min(100, (playerArmor / requirements.recommendedArmor) * 100)
            : 100;
        const weaponReadiness = requirements.recommendedWeapon > 0
            ? Math.min(100, (playerWeapon / requirements.recommendedWeapon) * 100)
            : 100;

        // Overall survival chance
        const avgReadiness = (healthReadiness + staminaReadiness + armorReadiness + weaponReadiness) / 4;
        const adjustedSurvivalChance = Math.min(0.99, requirements.survivalChance * (avgReadiness / 100));

        // Determine survival tier
        let survivalTier, tierColor, tierIcon;
        if (avgReadiness >= 100) {
            survivalTier = 'READY';
            tierColor = '#00ff00';
            tierIcon = '';
        } else if (avgReadiness >= 75) {
            survivalTier = 'PREPARED';
            tierColor = '#88ff00';
            tierIcon = '👍';
        } else if (avgReadiness >= 50) {
            survivalTier = 'RISKY';
            tierColor = '#ffcc00';
            tierIcon = '⚠️';
        } else if (avgReadiness >= 25) {
            survivalTier = 'DANGEROUS';
            tierColor = '#ff6600';
            tierIcon = '🔥';
        } else {
            survivalTier = 'SUICIDAL';
            tierColor = '#ff0000';
            tierIcon = '💀';
        }

        return {
            difficulty,
            requirements,
            current: {
                health: currentHealth,
                stamina: currentStamina,
                armor: playerArmor,
                weapon: playerWeapon
            },
            readiness: {
                health: healthReadiness,
                stamina: staminaReadiness,
                armor: armorReadiness,
                weapon: weaponReadiness,
                overall: avgReadiness
            },
            survivalChance: adjustedSurvivalChance,
            survivalTier,
            tierColor,
            tierIcon,
            warningText: requirements.warningText,
            canSurvive: avgReadiness >= 50 // At least 50% ready to have a chance
        };
    },

    // Calculate expected drain based on player stats
    calculateExpectedDrain(choice, playerStats, difficulty) {
        const diffMult = this.DIFFICULTY_MULTIPLIERS[difficulty] || this.DIFFICULTY_MULTIPLIERS.medium;

        // Base costs
        const minHealth = Math.round(choice.healthCost.min * diffMult.healthMult);
        const maxHealth = Math.round(choice.healthCost.max * diffMult.healthMult);
        const minStamina = Math.round(choice.staminaCost.min * diffMult.staminaMult);
        const maxStamina = Math.round(choice.staminaCost.max * diffMult.staminaMult);

        // Player modifiers (endurance reduces drain, equipment helps)
        const endurance = playerStats.attributes?.endurance || 5;
        const enduranceMod = 1 - (endurance - 5) * 0.05; // 5% reduction per point above 5

        // Equipment bonuses
        let armorBonus = 0;
        if (playerStats.equipment) {
            if (playerStats.equipment.armor) armorBonus += 0.1;
            if (playerStats.equipment.helmet) armorBonus += 0.05;
            if (playerStats.equipment.shield) armorBonus += 0.05;
        }

        const healthMod = Math.max(0.3, enduranceMod - armorBonus);
        const staminaMod = Math.max(0.3, enduranceMod);

        return {
            health: {
                min: Math.round(minHealth * healthMod),
                max: Math.round(maxHealth * healthMod),
                current: playerStats.stats?.health || 100,
                survivable: (playerStats.stats?.health || 100) > maxHealth * healthMod
            },
            stamina: {
                min: Math.round(minStamina * staminaMod),
                max: Math.round(maxStamina * staminaMod),
                current: playerStats.stats?.stamina || 100,
                survivable: (playerStats.stats?.stamina || 100) > maxStamina * staminaMod
            },
            goldCost: choice.goldCost || 0,
            toolRequired: choice.toolRequired || null,
            difficulty: difficulty,
            overallRisk: this.calculateRiskLevel(maxHealth * healthMod, maxStamina * staminaMod, playerStats)
        };
    },

    // Calculate overall risk level for display
    calculateRiskLevel(maxHealthDrain, maxStaminaDrain, playerStats) {
        const healthPercent = maxHealthDrain / (playerStats.stats?.health || 100);
        const staminaPercent = maxStaminaDrain / (playerStats.stats?.stamina || 100);

        const avgRisk = (healthPercent + staminaPercent) / 2;

        if (avgRisk > 0.7) return { level: 'DEADLY', color: '#ff0000', emoji: '💀' };
        if (avgRisk > 0.5) return { level: 'DANGEROUS', color: '#ff6600', emoji: '⚠️' };
        if (avgRisk > 0.3) return { level: 'RISKY', color: '#ffcc00', emoji: '' };
        if (avgRisk > 0.15) return { level: 'MODERATE', color: '#00cc00', emoji: '✓' };
        return { level: 'SAFE', color: '#00ff00', emoji: '😎' };
    },

    // Execute an exploration choice
    executeChoice(event, choice, location, playerStats) {
        const difficulty = this.getLocationDifficulty(location);
        const diffMult = this.DIFFICULTY_MULTIPLIERS[difficulty];

        //  Get equipment bonuses for combat
        let defenseBonus = 0;
        let damageReduction = 0;
        let luckBonus = 0;
        if (typeof EquipmentSystem !== 'undefined') {
            defenseBonus = EquipmentSystem.getTotalBonus('defense');
            damageReduction = Math.floor(defenseBonus / 5); // every 5 defense = 1 less damage
            luckBonus = EquipmentSystem.getTotalBonus('luck');
        }

        // Calculate actual costs (reduced by equipment)
        const healthCost = Math.max(0, Math.round(
            (choice.healthCost.min + Math.random() * (choice.healthCost.max - choice.healthCost.min))
            * diffMult.healthMult
        ) - damageReduction);
        const staminaCost = Math.round(
            (choice.staminaCost.min + Math.random() * (choice.staminaCost.max - choice.staminaCost.min))
            * diffMult.staminaMult
        );

        // Select outcome based on weights (with quest override)
        const outcome = this.selectOutcome(choice.outcomes, event, choice);

        // Calculate final health/stamina changes
        let totalHealthLoss = healthCost + (outcome.healthPenalty || 0);
        let totalHealthGain = outcome.healthBonus || 0;
        let totalStaminaLoss = staminaCost;

        // Gold handling
        let goldChange = (outcome.goldBonus || 0) - (choice.goldCost || 0);

        // Generate loot with difficulty multiplier + luck bonus + gatheringDifficulty + tool bonus
        const luckMultiplier = 1 + (luckBonus / 20); // every 20 luck = 100% more loot chance
        const gatheringDifficulty = location.gatheringDifficulty || 1.0; // higher = better loot
        const toolBonus = this.getToolEfficiencyBonus(choice, playerStats); // tool efficiency
        const totalLootMult = diffMult.lootMult * luckMultiplier * gatheringDifficulty * toolBonus;
        const loot = this.generateLoot(outcome.loot || [], totalLootMult, location.type);

        // Calculate loot value
        let lootValue = 0;
        loot.forEach(item => {
            const itemData = ItemDatabase?.getItem?.(item.id) || this.EXPLORATION_LOOT[item.id];
            if (itemData) {
                lootValue += (itemData.basePrice || 0) * item.quantity;
            }
        });

        return {
            success: true,
            event: event,
            choice: choice,
            outcome: outcome,
            difficulty: difficulty,
            healthLost: totalHealthLoss,
            healthGained: totalHealthGain,
            staminaLost: totalStaminaLoss,
            goldChange: goldChange,
            loot: loot,
            lootValue: Math.round(lootValue * diffMult.goldMult),
            message: outcome.message
        };
    },

    // Select outcome based on weights
    selectOutcome(outcomes, event = null, choice = null) {
        //  QUEST OVERRIDE: Strange Cargo quest requires shipping_manifest
        // If the quest is active and we're at harbor_warehouse, force the manifest outcome
        if (event && event.id === 'harbor_warehouse') {
            const hasStrangeCargoQuest = typeof QuestSystem !== 'undefined' &&
                QuestSystem.hasActiveQuest?.('act1_quest5');

            if (hasStrangeCargoQuest) {
                // Find the outcome that gives shipping_manifest
                const manifestOutcome = outcomes.find(o =>
                    o.loot && o.loot.includes('shipping_manifest')
                );

                if (manifestOutcome) {
                    console.log('🎯 Quest override: forcing shipping_manifest outcome for Strange Cargo quest');
                    return manifestOutcome;
                }
            }
        }

        // Normal random selection based on weights
        const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
        let random = Math.random() * totalWeight;

        for (const outcome of outcomes) {
            random -= outcome.weight;
            if (random <= 0) return outcome;
        }

        return outcomes[0];
    },

    // Generate loot items with quantities
    // Now supports location-specific bonus loot from ExplorationConfig.LOCATION_LOOT_TABLES
    generateLoot(lootIds, multiplier = 1, locationType = null) {
        const loot = {};

        // Process base loot from outcome
        lootIds.forEach(id => {
            // Chance for extra items based on multiplier
            let quantity = 1;
            if (multiplier > 1 && Math.random() < (multiplier - 1)) {
                quantity = 2;
            }

            if (loot[id]) {
                loot[id] += quantity;
            } else {
                loot[id] = quantity;
            }
        });

        // Add bonus loot from location-specific loot tables (scaled by multiplier)
        // Higher multiplier = better chance for bonus loot
        if (locationType && typeof ExplorationConfig !== 'undefined' && ExplorationConfig.getLootForLocationType) {
            // Chance for bonus loot: 20% base + (multiplier - 1) * 30%
            const bonusChance = 0.2 + Math.max(0, multiplier - 1) * 0.3;
            if (Math.random() < bonusChance) {
                const bonusItem = ExplorationConfig.getLootForLocationType(locationType, multiplier);
                if (bonusItem) {
                    if (loot[bonusItem]) {
                        loot[bonusItem] += 1;
                    } else {
                        loot[bonusItem] = 1;
                    }
                }
            }

            // High multiplier (2.0+) gives second bonus chance
            if (multiplier >= 2.0 && Math.random() < 0.3) {
                const bonusItem2 = ExplorationConfig.getLootForLocationType(locationType, multiplier);
                if (bonusItem2) {
                    if (loot[bonusItem2]) {
                        loot[bonusItem2] += 1;
                    } else {
                        loot[bonusItem2] = 1;
                    }
                }
            }
        }

        return Object.entries(loot).map(([id, quantity]) => ({ id, quantity }));
    },

    // Apply results to player
    applyResults(results) {
        if (typeof game === 'undefined' || !game.player) {
            return false;
        }

        // Apply health changes through PlayerStateManager
        if (results.healthLost > 0) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.stats.subtract('health', results.healthLost, 'dungeon_damage');
            } else {
                game.player.stats.health = Math.max(1, game.player.stats.health - results.healthLost);
            }
            if (typeof DeathCauseSystem !== 'undefined') {
                const eventType = results.eventType || 'generic';
                DeathCauseSystem.recordDungeonEvent(eventType, {
                    damage: results.healthLost,
                    dungeon: this.currentDungeon?.name || 'unknown dungeon'
                });
            }
        }
        if (results.healthGained > 0) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.stats.add('health', results.healthGained, 'dungeon_heal');
            } else {
                game.player.stats.health = Math.min(
                    game.player.stats.maxHealth || 100,
                    game.player.stats.health + results.healthGained
                );
            }
        }

        // Apply stamina loss
        if (results.staminaLost > 0) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.stats.subtract('stamina', results.staminaLost, 'dungeon_explore');
            } else {
                game.player.stats.stamina = Math.max(0, game.player.stats.stamina - results.staminaLost);
            }
        }

        // Apply gold change through PlayerStateManager
        if (results.goldChange && results.goldChange !== 0) {
            if (typeof PlayerStateManager !== 'undefined') {
                if (results.goldChange > 0) {
                    PlayerStateManager.gold.add(results.goldChange, 'dungeon_loot');
                } else {
                    PlayerStateManager.gold.remove(Math.abs(results.goldChange), 'dungeon_loss');
                }
            } else {
                game.player.gold = Math.max(0, (game.player.gold || 0) + results.goldChange);
                if (typeof GoldManager !== 'undefined') {
                    GoldManager.setGold(game.player.gold);
                }
                const goldEl = document.getElementById('player-gold');
                if (goldEl) {
                    goldEl.textContent = game.player.gold;
                }
            }
        }

        // Add loot to inventory through PlayerStateManager
        if (results.loot && results.loot.length > 0) {
            results.loot.forEach(item => {
                const isQuestItem = typeof QuestSystem !== 'undefined' && QuestSystem.isQuestItem?.(item.id);

                if (isQuestItem) {
                    if (!game.player.questItems) game.player.questItems = {};
                    game.player.questItems[item.id] = (game.player.questItems[item.id] || 0) + item.quantity;
                } else {
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.inventory.add(item.id, item.quantity, 'dungeon_loot');
                    } else {
                        if (!game.player.inventory) game.player.inventory = {};
                        game.player.inventory[item.id] = (game.player.inventory[item.id] || 0) + item.quantity;
                    }
                }

                // Emit item-received for quest progress tracking
                document.dispatchEvent(new CustomEvent('item-received', {
                    detail: { item: item.id, quantity: item.quantity, source: 'dungeon_loot', isQuestItem }
                }));
            });
        }

        // Update all displays
        if (typeof updatePlayerStats === 'function') updatePlayerStats();
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        if (typeof InventorySystem !== 'undefined' && InventorySystem.updateInventoryDisplay) {
            InventorySystem.updateInventoryDisplay();
        }

        // Also trigger a full UI refresh
        if (typeof game !== 'undefined' && game.updateUI) {
            game.updateUI();
        }

        // Check for NPC encounter spawn from exploration outcome
        if (results.outcome?.spawnNPC) {
            this.spawnNPCFromExploration(results.outcome.spawnNPC, results);
        }

        return true;
    },

    // Spawn an NPC encounter from exploration outcomes
    spawnNPCFromExploration(npcConfig, results) {
        // npcConfig can be: string (npcId), or object { npcId, chance, message }
        let npcId, chance, message;

        if (typeof npcConfig === 'string') {
            npcId = npcConfig;
            chance = 1.0; // 100% if just string
            message = null;
        } else {
            npcId = npcConfig.npcId;
            chance = npcConfig.chance || 0.5;
            message = npcConfig.message;
        }

        // Roll for chance
        if (Math.random() > chance) {
            console.log(`NPC spawn chance failed (${chance * 100}%)`);
            return;
        }

        // Show encounter message
        if (message && typeof game !== 'undefined' && game.addMessage) {
            game.addMessage(message, 'event');
        }

        // Trigger NPC encounter if system exists
        if (typeof NPCInteractionSystem !== 'undefined' && NPCInteractionSystem.startEncounter) {
            NPCInteractionSystem.startEncounter(npcId);
            console.log(`Spawned NPC encounter: ${npcId}`);
        } else if (typeof game !== 'undefined' && game.addMessage) {
            // Fallback message if no NPC system
            const npcName = npcId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            game.addMessage(`You encounter a ${npcName}!`, 'event');
        }

        // Fire event for other systems to hook into
        document.dispatchEvent(new CustomEvent('npc-encounter-spawned', {
            detail: {
                npcId: npcId,
                source: 'exploration',
                explorationId: results.event?.id,
                locationId: results.locationId
            }
        }));
    },

    // 
    //  UI METHODS - making the darkness look pretty
    // 

    // Show exploration panel for a location
    showExplorationPanel(locationId) {
        console.log('🏚️ showExplorationPanel called with locationId:', locationId);

        const location = this.getLocation(locationId);
        if (!location) {
            console.error('🏚️ Location not found:', locationId);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('Location not found!', 'error');
            }
            return;
        }

        if (!this.isExplorableLocation(location)) {
            console.log('🏚️ Location is not explorable:', location.type);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('This location cannot be explored.', 'warning');
            }
            return;
        }

        // Check cooldown BEFORE playing music
        if (this.isOnCooldown(locationId)) {
            const remaining = this.getCooldownRemaining(locationId);
            const hours = Math.floor(remaining);
            const minutes = Math.round((remaining - hours) * 60);
            this.showCooldownMessage(location, hours, minutes);
            return;
        }

        // Get available events BEFORE playing music
        const events = this.getEventsForLocation(location.type);
        if (events.length === 0) {
            console.log('🏚️ No events for location type:', location.type);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('No exploration events available here.', 'info');
            }
            return;
        }

        console.log('🏚️ Rendering exploration UI for', location.name, 'with', events.length, 'events');

        //  FIXED: Play dungeon music AFTER all validation passes 
        if (typeof MusicSystem !== 'undefined') {
            MusicSystem.playDungeonMusic();
        }

        // Pick a random event
        const event = events[Math.floor(Math.random() * events.length)];
        const difficulty = this.getLocationDifficulty(location);

        this.renderExplorationUI(location, event, difficulty);
    },

    // Get location from GameWorld
    getLocation(locationId) {
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            return GameWorld.locations[locationId];
        }
        if (typeof game !== 'undefined' && game.world?.locations) {
            return game.world.locations[locationId];
        }
        return null;
    },

    // Render the exploration UI
    renderExplorationUI(location, event, difficulty) {
        console.log('🏚️ renderExplorationUI called:', location?.name, event?.name, difficulty);

        const playerStats = typeof game !== 'undefined' ? game.player : {};
        const diffMult = this.DIFFICULTY_MULTIPLIERS[difficulty];

        // Calculate survival assessment
        const survival = this.calculateSurvivalAssessment(location, playerStats);
        console.log('🏚️ Survival calculated:', survival?.survivalTier);

        // Get the exploration overlay from HTML (it MUST exist in index.html)
        let overlay = document.getElementById('exploration-overlay');
        if (!overlay) {
            console.error('🏚️ CRITICAL: #exploration-overlay not found in HTML! Check index.html');
            return;
        }
        console.log('🏚️ Overlay element found in DOM');

        // Build survival assessment HTML
        const survivalHTML = `
            <div class="survival-assessment" style="background: ${survival.tierColor}15; border: 1px solid ${survival.tierColor}40; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                <div class="survival-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="survival-title" style="font-weight: bold; color: ${survival.tierColor};">
                        ${survival.tierIcon} Survival Assessment: ${survival.survivalTier}
                    </span>
                    <span class="survival-chance" style="color: ${survival.tierColor};">
                        ${Math.round(survival.survivalChance * 100)}% survival odds
                    </span>
                </div>
                <div class="survival-bars" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div class="readiness-item">
                        <span style="font-size: 0.85em;">❤️ Health: ${survival.current.health}/${survival.requirements.minHealth} needed</span>
                        <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${survival.readiness.health >= 100 ? '#4caf50' : survival.readiness.health >= 50 ? '#ff9800' : '#f44336'}; height: 100%; width: ${Math.min(100, survival.readiness.health)}%;"></div>
                        </div>
                    </div>
                    <div class="readiness-item">
                        <span style="font-size: 0.85em;">Stamina: ${survival.current.stamina}/${survival.requirements.minStamina} needed</span>
                        <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${survival.readiness.stamina >= 100 ? '#4caf50' : survival.readiness.stamina >= 50 ? '#ff9800' : '#f44336'}; height: 100%; width: ${Math.min(100, survival.readiness.stamina)}%;"></div>
                        </div>
                    </div>
                    <div class="readiness-item">
                        <span style="font-size: 0.85em;">🛡️ Armor: ${survival.current.armor}/${survival.requirements.recommendedArmor} recommended</span>
                        <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${survival.readiness.armor >= 100 ? '#4caf50' : survival.readiness.armor >= 50 ? '#ff9800' : '#f44336'}; height: 100%; width: ${Math.min(100, survival.readiness.armor)}%;"></div>
                        </div>
                    </div>
                    <div class="readiness-item">
                        <span style="font-size: 0.85em;">Weapon: ${survival.current.weapon}/${survival.requirements.recommendedWeapon} recommended</span>
                        <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${survival.readiness.weapon >= 100 ? '#4caf50' : survival.readiness.weapon >= 50 ? '#ff9800' : '#f44336'}; height: 100%; width: ${Math.min(100, survival.readiness.weapon)}%;"></div>
                        </div>
                    </div>
                </div>
                <div class="survival-warning" style="margin-top: 10px; font-style: italic; color: #888; font-size: 0.85em;">
                    "${survival.warningText}"
                </div>
            </div>
        `;

        // Build choices HTML
        const choicesHTML = event.choices.map(choice => {
            const drain = this.calculateExpectedDrain(choice, playerStats, difficulty);
            const risk = drain.overallRisk;

            // Check if player can afford this choice
            const canAfford = (!choice.goldCost || (playerStats.gold || 0) >= choice.goldCost);
            const hasStamina = drain.stamina.survivable;
            const hasHealth = drain.health.survivable;
            const hasTool = !choice.toolRequired || this.playerHasTool(choice.toolRequired);
            const canChoose = canAfford && hasStamina && hasHealth && hasTool;

            return `
                <div class="exploration-choice ${canChoose ? '' : 'disabled'}"
                     data-choice-id="${choice.id}"
                     style="border-left: 4px solid ${risk.color};">
                    <div class="choice-header">
                        <span class="choice-text">${choice.text}</span>
                        <span class="risk-badge" style="background: ${risk.color}20; color: ${risk.color};">
                            ${risk.emoji} ${risk.level}
                        </span>
                    </div>
                    <div class="choice-preview">${choice.preview}</div>
                    <div class="choice-costs">
                        <span class="cost health-cost" title="Health drain">
                            ❤️ ${drain.health.min}-${drain.health.max}
                            ${!hasHealth ? '<span class="warning">(FATAL!)</span>' : ''}
                        </span>
                        <span class="cost stamina-cost" title="Stamina drain">
                            ${drain.stamina.min}-${drain.stamina.max}
                            ${!hasStamina ? '<span class="warning">(Exhausting!)</span>' : ''}
                        </span>
                        ${choice.goldCost ? `<span class="cost gold-cost" title="Gold required">
                            💰 ${choice.goldCost}
                            ${!canAfford ? '<span class="warning">(Cant afford!)</span>' : ''}
                        </span>` : ''}
                        ${choice.toolRequired ? `<span class="cost tool-cost" title="Tool required">
                            🔧 ${choice.toolRequired}
                            ${!hasTool ? '<span class="warning">(Missing!)</span>' : ''}
                        </span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Get content container inside the overlay
        const contentContainer = overlay.querySelector('#exploration-overlay-content') || overlay.querySelector('.exploration-modal-content');

        // Build the exploration UI content
        const explorationHTML = `
            <div class="exploration-header">
                <span class="exploration-icon">${event.icon}</span>
                <div class="exploration-title-section">
                    <h2>${event.name}</h2>
                    <div class="exploration-location">
                        📍 ${location.name}
                        <span class="difficulty-badge difficulty-${difficulty}">${difficulty.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div class="exploration-description">
                <p>${event.description}</p>
            </div>

            ${survivalHTML}

            <div class="player-status-bar">
                <span class="status-item">❤️ ${playerStats.stats?.health || 100}/${playerStats.stats?.maxHealth || 100}</span>
                <span class="status-item">⚡ ${playerStats.stats?.stamina || 100}/${playerStats.stats?.maxStamina || 100}</span>
                <span class="status-item">💰 ${playerStats.gold || 0}</span>
            </div>

            <div class="exploration-choices">
                <h3>What do you do?</h3>
                ${choicesHTML}
            </div>

            <div class="exploration-footer">
                <button class="btn-secondary" onclick="DungeonExplorationSystem.closeExploration()">
                    🚪 Leave (Coward's way out)
                </button>
            </div>
        `;

        // Set content
        if (contentContainer) {
            contentContainer.innerHTML = explorationHTML;
        } else {
            // Fallback - set on overlay directly with wrapper
            overlay.innerHTML = `
                <div class="exploration-modal-content">
                    <button class="exploration-close-btn" onclick="DungeonExplorationSystem.closeExploration()">&times;</button>
                    ${explorationHTML}
                </div>
            `;
        }

        // SHOW THE OVERLAY - force visibility with inline styles to override any CSS
        overlay.classList.remove('hidden');
        overlay.classList.add('active');
        overlay.style.cssText = `
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 100000 !important;
            background: rgba(0, 0, 0, 0.9) !important;
            justify-content: center !important;
            align-items: center !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        `;

        console.log('🏚️ Exploration overlay opened:', event.name, 'at', location.name);

        // Store event data for click handler
        this._currentEvent = event;
        this._currentLocation = location;
        this._currentDifficulty = difficulty;

        // Use event delegation - single handler on overlay catches all choice clicks
        // Remove old handler first to prevent duplicates
        overlay.onclick = null;
        overlay.onclick = (e) => {
            console.log('🏚️ Overlay clicked, target:', e.target.className);

            // Find if we clicked on a choice or inside one
            const choiceEl = e.target.closest('.exploration-choice:not(.disabled)');
            if (choiceEl) {
                const choiceId = choiceEl.dataset.choiceId;
                console.log('🏚️ Choice clicked via delegation!', choiceId);

                const choice = this._currentEvent?.choices?.find(c => c.id === choiceId);
                console.log('🏚️ Choice data found:', !!choice);

                if (choice) {
                    e.stopPropagation();
                    this.handleChoiceSelection(this._currentLocation, this._currentEvent, choice, this._currentDifficulty);
                }
            }
        };

        // Also set pointer-events on all choices
        const choiceElements = overlay.querySelectorAll('.exploration-choice:not(.disabled)');
        console.log('🏚️ Found', choiceElements.length, 'clickable choices');
        choiceElements.forEach((el) => {
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'pointer';
        });
    },

    // Check if player has required tool
    playerHasTool(toolId) {
        if (typeof game === 'undefined' || !game.player) return false;

        // Check inventory via PlayerStateManager
        const hasInInventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.has(toolId)
            : (game.player.inventory && game.player.inventory[toolId] > 0);

        if (hasInInventory) return true;

        // Check equipped tool
        if (game.player.equippedTool === toolId) return true;

        // Check tools object
        if (game.player.tools && game.player.tools[toolId]) return true;

        return false;
    },

    // Get tool efficiency bonus for exploration
    // Having the right tool for the job increases loot yield
    getToolEfficiencyBonus(choice, playerStats) {
        let bonus = 1.0; // base multiplier

        // Tool efficiency mapping - which tools help which exploration types
        const toolBonuses = {
            pickaxe: ['mine', 'cave', 'dungeon'],      // mining/digging explorations
            axe: ['forest', 'farm'],                   // woodcutting/clearing
            fishing_rod: ['port', 'cave'],             // fishing/water explorations
            rope: ['cave', 'dungeon', 'ruins'],        // climbing/descending
            torch: ['dungeon', 'cave', 'mine'],        // dark places
            lantern: ['dungeon', 'cave', 'mine'],      // better light source
            shovel: ['farm', 'ruins', 'dungeon']       // digging/excavation
        };

        // Check player's equipped/owned tools
        const playerTools = [];
        if (playerStats.equippedTool) playerTools.push(playerStats.equippedTool);
        if (playerStats.tools) {
            Object.keys(playerStats.tools).forEach(t => {
                if (playerStats.tools[t]) playerTools.push(t);
            });
        }
        if (playerStats.inventory) {
            Object.keys(playerStats.inventory).forEach(item => {
                if (toolBonuses[item] && playerStats.inventory[item] > 0) {
                    playerTools.push(item);
                }
            });
        }

        // Check if any tool matches the choice's tool requirement
        if (choice.toolRequired && playerTools.includes(choice.toolRequired)) {
            bonus += 0.25; // 25% bonus for having required tool
        }

        // Additional bonuses for having helpful tools (even if not required)
        // Based on location type in the exploration event
        const eventLocTypes = choice.locationType || [];
        playerTools.forEach(tool => {
            const helpfulFor = toolBonuses[tool] || [];
            eventLocTypes.forEach(locType => {
                if (helpfulFor.includes(locType)) {
                    bonus += 0.1; // 10% bonus per helpful tool
                }
            });
        });

        // Cap bonus at 2.0 (100% extra)
        return Math.min(2.0, bonus);
    },

    // Handle choice selection
    handleChoiceSelection(location, event, choice, difficulty) {
        const results = this.executeChoice(event, choice, location,
            typeof game !== 'undefined' ? game.player : {});

        // Set cooldown
        this.setCooldown(location.id);

        // Apply results
        this.applyResults(results);

        //  Increment boss progress for this location
        this.incrementBossProgress(location.id);

        // Fire dungeon-room-explored event for quest tracking
        const exploreEvent = new CustomEvent('dungeon-room-explored', {
            detail: { dungeon: location.id, rooms: 1 }
        });
        document.dispatchEvent(exploreEvent);

        // Fire location-investigated event for investigate quest objectives
        // This fires for search/investigate type explorations
        const investigateEvent = new CustomEvent('location-investigated', {
            detail: {
                location: location.id,
                area: event.id,
                locationType: location.type,
                explorationId: event.id
            }
        });
        document.dispatchEvent(investigateEvent);

        // Fire area-investigated for quest-system.js investigate objective listener
        document.dispatchEvent(new CustomEvent('area-investigated', {
            detail: { location: location.id, area: event.id }
        }));

        // Fire exploration-complete event with full details for advanced quest tracking
        const explorationCompleteEvent = new CustomEvent('exploration-complete', {
            detail: {
                explorationId: event.id,
                locationId: location.id,
                locationType: location.type,
                choiceId: choice.id,
                outcome: results.outcome,
                loot: results.loot,
                isBossEncounter: event.isBossEncounter || false,
                bossId: event.bossId || null
            }
        });
        document.dispatchEvent(explorationCompleteEvent);

        // Show results
        this.showResultsUI(results);

        // Log to message system
        if (typeof addMessage === 'function') {
            addMessage(`🏚️ ${results.message}`);
            if (results.loot.length > 0) {
                const lootNames = results.loot.map(l => {
                    const item = ItemDatabase?.getItem?.(l.id) || this.EXPLORATION_LOOT[l.id];
                    return `${item?.icon || '📦'} ${item?.name || l.id} x${l.quantity}`;
                }).join(', ');
                addMessage(`Found: ${lootNames}`);
            }
        }

        //  Check if boss should now appear
        if (this.shouldBossAppear(location.id)) {
            const boss = this.getBossForLocation(location.id);
            if (boss) {
                setTimeout(() => {
                    if (typeof addMessage === 'function') {
                        addMessage(`👹 ${boss.name} has awakened!`, 'danger');
                    }
                    this.showBossEncounter(location.id);
                }, 2000); // Show boss after 2 seconds
            }
        }
    },

    // Show results UI
    showResultsUI(results) {
        const overlay = document.getElementById('exploration-overlay');
        if (!overlay) return;

        const lootHTML = results.loot.length > 0
            ? results.loot.map(l => {
                const item = ItemDatabase?.getItem?.(l.id) || this.EXPLORATION_LOOT[l.id];
                const rarityColor = ItemDatabase?.getItemRarityColor?.(l.id) || '#888';
                return `
                    <div class="loot-item" style="border-color: ${rarityColor};">
                        <span class="loot-icon">${item?.icon || '📦'}</span>
                        <div class="loot-info">
                            <span class="loot-name" style="color: ${rarityColor};">${item?.name || l.id}</span>
                            <span class="loot-quantity">x${l.quantity}</span>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="no-loot">No loot found... the void gives nothing today.</p>';

        // Find the content container - try multiple selectors
        const contentContainer = overlay.querySelector('#exploration-overlay-content')
            || overlay.querySelector('.exploration-modal-content')
            || overlay.querySelector('.overlay-content');

        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div class="exploration-results">
                <h2>${results.outcome.type === 'disaster' ? '💀 Disaster!' :
                      results.outcome.type === 'legendary' ? '🌟 Legendary Find!' :
                      results.outcome.type === 'success' ? '✨ Success!' : '📜 Result'}</h2>

                <div class="result-message">
                    <p>${results.message}</p>
                </div>

                <div class="result-stats">
                    ${results.healthLost > 0 ? `<span class="stat-loss">❤️ -${results.healthLost}</span>` : ''}
                    ${results.healthGained > 0 ? `<span class="stat-gain">❤️ +${results.healthGained}</span>` : ''}
                    ${results.staminaLost > 0 ? `<span class="stat-loss">-${results.staminaLost}</span>` : ''}
                    ${results.goldChange > 0 ? `<span class="stat-gain">💰 +${results.goldChange}</span>` : ''}
                    ${results.goldChange < 0 ? `<span class="stat-loss">💰 ${results.goldChange}</span>` : ''}
                </div>

                <div class="result-loot">
                    <h3>🎒 Loot Acquired</h3>
                    <div class="loot-grid">
                        ${lootHTML}
                    </div>
                    ${results.lootValue > 0 ? `<p class="loot-value">Total value: ~${results.lootValue} gold</p>` : ''}
                </div>

                <div class="result-footer">
                    <p class="cooldown-notice">This location will refresh in ${this.COOLDOWN_HOURS} hours.</p>
                    <button class="btn-primary" onclick="DungeonExplorationSystem.closeExploration()">
                        Continue
                    </button>
                </div>
            </div>
        `;
    },

    // Show cooldown message
    showCooldownMessage(location, hours, minutes) {
        let overlay = document.getElementById('exploration-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'exploration-overlay';
            overlay.className = 'overlay';
            document.getElementById('overlay-container')?.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="overlay-content exploration-content cooldown-content">
                <button class="overlay-close" onclick="DungeonExplorationSystem.closeExploration()">×</button>

                <div class="cooldown-message">
                    <span class="cooldown-icon"></span>
                    <h2>Location Exhausted</h2>
                    <p>${location.name} has been thoroughly explored recently.</p>
                    <p>The darkness needs time to replenish its treasures... and its monsters.</p>
                    <div class="cooldown-timer">
                        <span class="time-remaining">${hours}h ${minutes}m</span>
                        <span class="time-label">until refresh</span>
                    </div>
                    <button class="btn-secondary" onclick="DungeonExplorationSystem.closeExploration()">
                        Return Later
                    </button>
                </div>
            </div>
        `;

        overlay.classList.add('active');
    },

    // Close exploration UI
    closeExploration() {
        const overlay = document.getElementById('exploration-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            overlay.style.cssText = ''; // Clear ALL inline styles so CSS takes over
        }

        //  Return to normal world music when leaving exploration
        if (typeof MusicSystem !== 'undefined') {
            // Check if we're in doom world
            const isDoom = typeof game !== 'undefined' && game.player?.isDoomWorld;
            if (isDoom) {
                MusicSystem.playDoomMusic();
            } else {
                MusicSystem.playNormalMusic();
            }
        }
    },

    // Track exploration section collapsed state -  DEFAULT TO COLLAPSED
    explorationSectionCollapsed: true,

    // Calculate enhanced difficulty based on gear, stats, rep, location type, and NPCs
    calculateEnhancedDifficulty(location, event, playerStats) {
        let difficultyScore = 0;
        const baseDifficulty = this.getLocationDifficulty(location);
        const eventDifficulty = event.difficulty || 'medium';

        // Base difficulty from region
        const difficultyValues = { easy: 1, medium: 2, hard: 3, deadly: 4 };
        difficultyScore += difficultyValues[baseDifficulty] || 2;
        difficultyScore += difficultyValues[eventDifficulty] || 2;

        // Player stat modifiers (reduce difficulty)
        const stats = playerStats?.stats || {};
        const attributes = playerStats?.attributes || {};

        // Health/stamina reduce difficulty
        if (stats.health >= 80) difficultyScore -= 0.5;
        if (stats.stamina >= 80) difficultyScore -= 0.5;

        // Attributes help
        if (attributes.strength >= 8) difficultyScore -= 0.3;
        if (attributes.endurance >= 8) difficultyScore -= 0.3;
        if (attributes.luck >= 8) difficultyScore -= 0.2;

        // Equipment bonuses
        const armorValue = this.getPlayerArmorValue(playerStats);
        const weaponValue = this.getPlayerWeaponValue(playerStats);
        if (armorValue >= 20) difficultyScore -= 0.5;
        if (weaponValue >= 15) difficultyScore -= 0.5;

        // Reputation with location faction (if applicable)
        if (typeof ReputationSystem !== 'undefined' && location.faction) {
            const rep = ReputationSystem.getReputation?.(location.faction) || 0;
            if (rep >= 50) difficultyScore -= 0.3;
            if (rep >= 100) difficultyScore -= 0.3;
            if (rep < -50) difficultyScore += 0.5;
        }

        // NPCs at location can affect difficulty
        if (typeof NPCManager !== 'undefined' && NPCManager.getActiveNPCs) {
            const npcs = NPCManager.getActiveNPCs(location.id) || [];
            const hostileNPCs = npcs.filter(npc => npc.hostile || npc.disposition === 'hostile');
            const friendlyNPCs = npcs.filter(npc => npc.friendly || npc.disposition === 'friendly');
            difficultyScore += hostileNPCs.length * 0.2;
            difficultyScore -= friendlyNPCs.length * 0.1;
        }

        // Clamp to valid range
        difficultyScore = Math.max(1, Math.min(5, difficultyScore));

        // Return difficulty tier
        if (difficultyScore <= 1.5) return { tier: 'easy', color: '#4caf50', label: 'Easy' };
        if (difficultyScore <= 2.5) return { tier: 'medium', color: '#ff9800', label: 'Medium' };
        if (difficultyScore <= 3.5) return { tier: 'hard', color: '#f44336', label: 'Hard' };
        return { tier: 'deadly', color: '#9c27b0', label: 'Deadly' };
    },

    // Get all exploration events available at this specific location
    getAvailableEventsForLocation(location) {
        if (!location || !location.type) return [];

        const locationType = location.type;
        const events = Object.values(this.EXPLORATION_EVENTS).filter(event => {
            // Event must include this location type
            return event.locationType && event.locationType.includes(locationType);
        });

        return events;
    },

    // Toggle exploration section collapse -  Collapse to just a button, not full header
    toggleExplorationSection() {
        this.explorationSectionCollapsed = !this.explorationSectionCollapsed;
        const content = document.getElementById('exploration-section-content');
        const fullHeader = document.getElementById('exploration-full-header');
        const collapsedBtn = document.getElementById('exploration-collapsed-btn');

        if (this.explorationSectionCollapsed) {
            // Collapse to just "Explore" button
            if (content) content.style.display = 'none';
            if (fullHeader) fullHeader.style.display = 'none';
            if (collapsedBtn) collapsedBtn.style.display = 'block';
        } else {
            // Expand to full view
            if (content) content.style.display = 'block';
            if (fullHeader) fullHeader.style.display = 'flex';
            if (collapsedBtn) collapsedBtn.style.display = 'none';
        }
    },

    // Add explore button to location panel
    addExploreButton(locationId) {
        const location = this.getLocation(locationId);
        console.log('🏚️ addExploreButton called for:', locationId, 'type:', location?.type);

        if (!location) {
            console.log('🏚️ No location found for:', locationId);
            return;
        }

        if (!this.isExplorableLocation(location)) {
            console.log('🏚️ Location not explorable:', location.type, '- adding anyway for visibility');
        }

        const locationPanel = document.getElementById('location-panel');
        if (!locationPanel) {
            console.log('🏚️ No location-panel element found');
            return;
        }

        // Remove existing exploration section
        const existingSection = document.getElementById('exploration-section');
        if (existingSection) existingSection.remove();

        // Get available events for THIS specific location type
        const availableEvents = this.getAvailableEventsForLocation(location);
        console.log('🏚️ Available events for', location.type + ':', availableEvents.length);

        // Create exploration section
        const section = document.createElement('div');
        section.id = 'exploration-section';
        section.className = 'location-exploration-section';

        const difficulty = this.getLocationDifficulty(location);
        const playerStats = typeof game !== 'undefined' ? game.player : {};
        const survival = this.calculateSurvivalAssessment(location, playerStats);
        const onCooldown = this.isOnCooldown(locationId);

        // Build section content with collapsible header
        //  Two states: collapsed (just button) vs expanded (full header + content)
        let contentHTML = `
            <!-- Collapsed state: Just a simple Explore button -->
            <button id="exploration-collapsed-btn"
                    style="display: ${this.explorationSectionCollapsed ? 'block' : 'none'};
                           width: 100%; padding: 10px 15px; margin: 5px 0;
                           background: linear-gradient(135deg, #1a3a4a 0%, #0d2030 100%);
                           border: 1px solid #4fc3f7; border-radius: 6px;
                           color: #4fc3f7; font-weight: bold; cursor: pointer;
                           display: flex; align-items: center; justify-content: center; gap: 8px;"
                    onclick="DungeonExplorationSystem.toggleExplorationSection()">
                🏚️ Explore (${availableEvents.length} areas)
            </button>

            <!-- Expanded state: Full header with details -->
            <div id="exploration-full-header" class="exploration-header"
                 style="display: ${this.explorationSectionCollapsed ? 'none' : 'flex'}; justify-content: space-between; align-items: center; margin-bottom: 10px; cursor: pointer;"
                 onclick="DungeonExplorationSystem.toggleExplorationSection()">
                <h3 style="color: #4fc3f7; margin: 0; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.8em; width: 16px;">▼</span>
                    🏚️ Exploration
                    <span class="difficulty-badge difficulty-${difficulty}" style="font-size: 0.8em; padding: 2px 8px; border-radius: 4px; background: ${this.getDifficultyColor(difficulty)}; color: #fff;">
                        ${difficulty.toUpperCase()}
                    </span>
                </h3>
                <span style="color: #888; font-size: 0.85em;">${availableEvents.length} areas</span>
            </div>
            <div id="exploration-section-content" style="display: ${this.explorationSectionCollapsed ? 'none' : 'block'};">
        `;

        if (onCooldown) {
            const remaining = this.getCooldownRemaining(locationId);
            const hours = Math.floor(remaining);
            const minutes = Math.round((remaining - hours) * 60);
            contentHTML += `
                <div class="cooldown-notice" style="background: #333; border-left: 4px solid #ff9800; padding: 12px; margin: 10px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #ff9800;">This location needs time to respawn new treasures and threats.</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">Available in: <strong>${hours}h ${minutes}m</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #888; font-style: italic;">
                        "Even the darkness needs a nap between victims."
                    </p>
                </div>
            `;
        } else if (availableEvents.length === 0) {
            // No events for this location type
            contentHTML += `
                <div style="padding: 15px; text-align: center; color: #888;">
                    <p style="margin: 0;">🔍 Nothing interesting to explore here right now.</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.85em; font-style: italic;">Try dungeons, caves, ruins, or mines for adventure!</p>
                </div>
            `;
        } else {
            // Show survival preview
            contentHTML += `
                <div class="survival-preview" style="background: ${survival.tierColor}15; border: 1px solid ${survival.tierColor}40; border-radius: 8px; padding: 12px; margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: bold; color: ${survival.tierColor};">
                            ${survival.tierIcon} ${survival.survivalTier}
                        </span>
                        <span style="color: ${survival.tierColor};">
                            ~${Math.round(survival.survivalChance * 100)}% survival
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.85em;">
                        <span>❤️ ${survival.current.health}/${survival.requirements.minHealth}</span>
                        <span>${survival.current.stamina}/${survival.requirements.minStamina}</span>
                        <span>🛡️ ${survival.current.armor}/${survival.requirements.recommendedArmor}</span>
                        <span>${survival.current.weapon}/${survival.requirements.recommendedWeapon}</span>
                    </div>
                </div>
            `;

            // Scrollable list of available exploration areas
            contentHTML += `
                <div class="exploration-areas-list" style="max-height: 200px; overflow-y: auto; margin: 10px 0; border: 1px solid rgba(79, 195, 247, 0.2); border-radius: 6px;">
            `;

            availableEvents.forEach(event => {
                const eventDiff = this.calculateEnhancedDifficulty(location, event, playerStats);
                const canExplore = survival.canSurvive;

                contentHTML += `
                    <div class="exploration-area-item"
                         data-event-id="${event.id}"
                         style="
                            padding: 10px 12px;
                            border-bottom: 1px solid rgba(79, 195, 247, 0.1);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            cursor: ${canExplore ? 'pointer' : 'not-allowed'};
                            opacity: ${canExplore ? '1' : '0.5'};
                            transition: background 0.2s ease;
                         "
                         onmouseenter="this.style.background='rgba(79, 195, 247, 0.1)'"
                         onmouseleave="this.style.background='transparent'"
                    >
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.3em;">${event.icon}</span>
                            <div>
                                <div style="font-weight: bold; color: #e0e0e0;">${event.name}</div>
                                <div style="font-size: 0.8em; color: #888; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${event.description.substring(0, 50)}...
                                </div>
                            </div>
                        </div>
                        <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.75em; background: ${eventDiff.color}30; color: ${eventDiff.color}; border: 1px solid ${eventDiff.color}50;">
                            ${eventDiff.label}
                        </span>
                    </div>
                `;
            });

            contentHTML += `</div>`;

            // Explore button - random exploration
            const btnDisabled = !survival.canSurvive;
            contentHTML += `
                <button
                    id="explore-location-btn"
                    class="explore-btn ${btnDisabled ? 'disabled' : ''}"
                    style="
                        width: 100%;
                        padding: 12px;
                        background: ${btnDisabled ? '#333' : `linear-gradient(180deg, ${this.getDifficultyColor(difficulty)} 0%, ${this.getDifficultyColorDark(difficulty)} 100%)`};
                        border: 1px solid ${btnDisabled ? '#555' : this.getDifficultyColor(difficulty)};
                        border-radius: 6px;
                        color: ${btnDisabled ? '#666' : '#fff'};
                        font-size: 1.1em;
                        cursor: ${btnDisabled ? 'not-allowed' : 'pointer'};
                        transition: all 0.2s ease;
                        margin-top: 10px;
                    "
                    ${btnDisabled ? 'disabled' : ''}
                >
                    ${btnDisabled ? '💀 Too Weak to Explore' : '🎲 Random Exploration'}
                </button>
            `;

            if (btnDisabled) {
                contentHTML += `
                    <p style="text-align: center; color: #f44336; font-size: 0.85em; margin-top: 8px;">
                        ⚠️ You need better gear or more health/stamina to survive here!
                    </p>
                `;
            }
        }

        contentHTML += `</div>`; // Close exploration-section-content

        section.innerHTML = contentHTML;
        section.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(79, 195, 247, 0.2);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        `;

        // Find where to insert - after rest options or region unlocks
        const restOptions = locationPanel.querySelector('.location-rest-options');
        const regionUnlocks = locationPanel.querySelector('.region-unlocks');
        const insertAfter = regionUnlocks || restOptions || locationPanel.querySelector('.location-details');

        if (insertAfter && insertAfter.parentNode) {
            insertAfter.parentNode.insertBefore(section, insertAfter.nextSibling);
        } else {
            locationPanel.appendChild(section);
        }

        // Attach event listeners for exploration areas
        section.querySelectorAll('.exploration-area-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!survival.canSurvive) return;
                const eventId = item.dataset.eventId;
                this.showSpecificExplorationPanel(locationId, eventId);
            });
        });

        // Attach random exploration button
        const randomBtn = section.querySelector('#explore-location-btn');
        if (randomBtn && survival.canSurvive) {
            randomBtn.addEventListener('click', () => {
                this.showExplorationPanel(locationId);
            });
        }
    },

    // Show exploration panel for a specific event
    // isQuestExploration flag bypasses cooldown for quest-related explorations
    showSpecificExplorationPanel(locationId, eventId, isQuestExploration = false) {
        console.log('🏚️ showSpecificExplorationPanel called:', locationId, eventId);

        const location = this.getLocation(locationId);
        if (!location) {
            console.error('🏚️ Location not found for specific exploration:', locationId);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('Location not found!', 'error');
            }
            return;
        }
        console.log('🏚️ Location found:', location.name, 'type:', location.type);

        const event = this.EXPLORATION_EVENTS[eventId];
        if (!event) {
            console.error('🏚️ Event not found:', eventId);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('Exploration event not found!', 'error');
            }
            return;
        }
        console.log('🏚️ Event found:', event.name, 'locationType:', event.locationType);

        // Check if this event is quest-related (has questRequired or is in QUEST_EXPLORATIONS)
        const isQuestEvent = isQuestExploration || event.questRequired || event.isQuestExploration;

        // Check cooldown (quest explorations bypass)
        if (this.isOnCooldown(locationId, isQuestEvent)) {
            console.log('🏚️ Location on cooldown');
            const remaining = this.getCooldownRemaining(locationId);
            const hours = Math.floor(remaining);
            const minutes = Math.round((remaining - hours) * 60);
            this.showCooldownMessage(location, hours, minutes);
            return;
        }

        // Verify event is valid for this location type
        if (!event.locationType || !event.locationType.includes(location.type)) {
            console.error('🏚️ Event not valid for location type:', location.type, 'event expects:', event.locationType);
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.showToast('This event is not available here.', 'warning');
            }
            return;
        }

        console.log('🏚️ All checks passed, rendering exploration UI');
        const difficulty = this.getLocationDifficulty(location);
        this.renderExplorationUI(location, event, difficulty);
    },

    // Get difficulty color
    getDifficultyColor(difficulty) {
        const colors = {
            easy: '#4caf50',
            medium: '#ff9800',
            hard: '#f44336',
            deadly: '#9c27b0'
        };
        return colors[difficulty] || '#888';
    },

    // Get darker difficulty color
    getDifficultyColorDark(difficulty) {
        const colors = {
            easy: '#388e3c',
            medium: '#f57c00',
            hard: '#d32f2f',
            deadly: '#7b1fa2'
        };
        return colors[difficulty] || '#666';
    },

    // 
    //  BOSS ENCOUNTER METHODS - face your doom
    // 

    // Get boss for current location (if any)
    getBossForLocation(locationId) {
        return Object.values(this.BOSS_ENCOUNTERS).find(boss => boss.location === locationId);
    },

    // Check if boss should appear (exploration threshold met)
    shouldBossAppear(locationId) {
        const boss = this.getBossForLocation(locationId);
        if (!boss) return false;

        // Already defeated this boss?
        if (this.defeatedBosses[boss.id]) return false;

        // Check exploration progress
        const progress = this.bossProgress[locationId] || 0;
        return progress >= boss.requiredExplorations;
    },

    // Increment exploration progress for location
    incrementBossProgress(locationId) {
        if (!this.bossProgress[locationId]) {
            this.bossProgress[locationId] = 0;
        }
        this.bossProgress[locationId]++;
        console.log(`👹 Boss progress for ${locationId}: ${this.bossProgress[locationId]}`);

        // Check if boss should now appear
        const boss = this.getBossForLocation(locationId);
        if (boss && this.bossProgress[locationId] >= boss.requiredExplorations && !this.defeatedBosses[boss.id]) {
            console.log(`👹 BOSS ENCOUNTER UNLOCKED: ${boss.name}!`);
        }
    },

    // Show boss encounter UI
    showBossEncounter(locationId) {
        const boss = this.getBossForLocation(locationId);
        if (!boss) return;

        const overlay = document.getElementById('exploration-overlay');
        if (!overlay) return;

        // Initialize boss combat state
        this.activeBoss = {
            ...boss,
            currentHealth: boss.health,
            playerTurn: true
        };

        const bossHealthPercent = 100;

        overlay.querySelector('.overlay-content').innerHTML = `
            <div class="boss-encounter">
                <div class="boss-intro">
                    <h2 style="color: #f44336; text-shadow: 0 0 20px #f44336;">👹 BOSS ENCOUNTER!</h2>
                    <div class="boss-icon" style="font-size: 4em; margin: 20px 0;">${boss.icon}</div>
                    <h3 style="color: #ff9800;">${boss.name}</h3>
                    <p style="color: #888; font-style: italic;">${boss.title}</p>
                </div>

                <div class="boss-description" style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p>${boss.description}</p>
                </div>

                <div class="boss-taunt" style="background: rgba(244,67,54,0.2); border-left: 4px solid #f44336; padding: 15px; margin: 15px 0;">
                    <p style="color: #ff9800; font-style: italic;">"${boss.taunt}"</p>
                </div>

                <div class="boss-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                    <div style="text-align: center; padding: 10px; background: rgba(244,67,54,0.2); border-radius: 8px;">
                        <span style="font-size: 1.5em;">❤️</span>
                        <p style="margin: 5px 0;">Health: ${boss.health}</p>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(255,152,0,0.2); border-radius: 8px;">
                        <span style="font-size: 1.5em;"></span>
                        <p style="margin: 5px 0;">Damage: ${boss.damage.min}-${boss.damage.max}</p>
                    </div>
                </div>

                <div class="boss-actions" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button class="boss-fight-btn" onclick="DungeonExplorationSystem.startBossFight('${boss.id}')"
                        style="padding: 15px 30px; background: linear-gradient(180deg, #f44336, #c62828); border: none; border-radius: 8px; color: white; font-size: 1.2em; cursor: pointer;">
                        FIGHT!
                    </button>
                    <button class="boss-flee-btn" onclick="DungeonExplorationSystem.fleeBoss()"
                        style="padding: 15px 30px; background: linear-gradient(180deg, #666, #444); border: none; border-radius: 8px; color: white; font-size: 1.2em; cursor: pointer;">
                        🏃 Flee
                    </button>
                </div>
            </div>
        `;

        overlay.classList.add('active');

        // Generate and play boss dialogue using NPCDialogueSystem
        this.playBossDialogue(boss, 'firstMeeting');
    },

    // Play boss dialogue using the unified NPCDialogueSystem
    async playBossDialogue(boss, context = 'firstMeeting') {
        // Use NPCDialogueSystem if available for dynamic dialogue
        if (typeof NPCDialogueSystem !== 'undefined') {
            try {
                const dialogue = await NPCDialogueSystem.generateBossDialogue(
                    boss.personality || boss.id,
                    context,
                    {
                        name: boss.name,
                        voice: boss.voice,
                        description: boss.description,
                        taunt: boss.taunt
                    }
                );

                // Update the taunt display with generated dialogue
                const tauntElement = document.querySelector('.boss-taunt p');
                if (tauntElement && dialogue.text) {
                    tauntElement.textContent = `"${dialogue.text}"`;
                }

                // Speak the dialogue
                await NPCDialogueSystem.speakDialogue(dialogue);
                console.log(`👹 Boss dialogue generated: ${dialogue.text}`);
            } catch (error) {
                console.warn('👹 Dynamic dialogue failed, using fallback:', error);
                // Fallback to static taunt via old system
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.playVoice(boss.taunt, boss.voice);
                }
            }
        } else if (typeof NPCVoiceChatSystem !== 'undefined') {
            // Fallback: play static taunt if NPCDialogueSystem not available
            NPCVoiceChatSystem.playVoice(boss.taunt, boss.voice);
        }
    },

    // Start the boss fight
    startBossFight(bossId) {
        const boss = this.BOSS_ENCOUNTERS[bossId];
        if (!boss) return;

        this.activeBoss = {
            ...boss,
            currentHealth: boss.health,
            playerTurn: true
        };

        this.showBossCombatUI();
    },

    // Show boss combat UI
    showBossCombatUI() {
        const boss = this.activeBoss;
        if (!boss) return;

        const overlay = document.getElementById('exploration-overlay');
        if (!overlay) return;

        const player = typeof game !== 'undefined' ? game.player : { health: 100, stats: { health: 100 } };
        const playerHealth = player.health || player.stats?.health || 100;
        const maxPlayerHealth = player.stats?.maxHealth || 100;

        const bossHealthPercent = Math.max(0, (boss.currentHealth / boss.health) * 100);
        const playerHealthPercent = Math.max(0, (playerHealth / maxPlayerHealth) * 100);

        // Get player attack power from equipment
        let playerAttack = 10; // base damage
        let playerDefense = 0;
        if (typeof EquipmentSystem !== 'undefined') {
            playerAttack += EquipmentSystem.getTotalBonus('attack') || 0;
            playerAttack += EquipmentSystem.getTotalBonus('damage') || 0;
            playerDefense = EquipmentSystem.getTotalBonus('defense') || 0;
        }

        overlay.querySelector('.overlay-content').innerHTML = `
            <div class="boss-combat">
                <h2 style="color: #f44336; text-align: center;">BATTLE: ${boss.name}</h2>

                <div class="combat-arena" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <!-- Player Side -->
                    <div class="player-side" style="text-align: center; padding: 15px; background: rgba(76,175,80,0.2); border-radius: 8px;">
                        <h3 style="color: #4caf50;">🧙 You</h3>
                        <div class="health-bar" style="background: #333; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                            <div style="width: ${playerHealthPercent}%; height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a);"></div>
                        </div>
                        <p>❤️ ${playerHealth} / ${maxPlayerHealth}</p>
                        <p style="font-size: 0.8em; color: #888;">ATK: ${playerAttack} | 🛡️ DEF: ${playerDefense}</p>
                    </div>

                    <!-- Boss Side -->
                    <div class="boss-side" style="text-align: center; padding: 15px; background: rgba(244,67,54,0.2); border-radius: 8px;">
                        <h3 style="color: #f44336;">${boss.icon} ${boss.name}</h3>
                        <div class="health-bar" style="background: #333; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                            <div style="width: ${bossHealthPercent}%; height: 100%; background: linear-gradient(90deg, #f44336, #ff5722);"></div>
                        </div>
                        <p>❤️ ${boss.currentHealth} / ${boss.health}</p>
                        <p style="font-size: 0.8em; color: #888;">DMG: ${boss.damage.min}-${boss.damage.max} | 🛡️ DEF: ${boss.defense}</p>
                    </div>
                </div>

                <div id="combat-log" style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; max-height: 100px; overflow-y: auto; margin: 15px 0;">
                    <p style="color: #888; margin: 0;">The battle begins...</p>
                </div>

                <div class="combat-actions" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="DungeonExplorationSystem.bossAttack()"
                        style="padding: 12px 25px; background: linear-gradient(180deg, #f44336, #c62828); border: none; border-radius: 8px; color: white; font-size: 1.1em; cursor: pointer;">
                        Attack
                    </button>
                    <button onclick="DungeonExplorationSystem.bossDefend()"
                        style="padding: 12px 25px; background: linear-gradient(180deg, #2196f3, #1565c0); border: none; border-radius: 8px; color: white; font-size: 1.1em; cursor: pointer;">
                        🛡️ Defend
                    </button>
                    <button onclick="DungeonExplorationSystem.bossHeal()"
                        style="padding: 12px 25px; background: linear-gradient(180deg, #4caf50, #2e7d32); border: none; border-radius: 8px; color: white; font-size: 1.1em; cursor: pointer;">
                        💚 Heal
                    </button>
                    <button onclick="DungeonExplorationSystem.fleeBoss()"
                        style="padding: 12px 25px; background: linear-gradient(180deg, #666, #444); border: none; border-radius: 8px; color: white; font-size: 1.1em; cursor: pointer;">
                        🏃 Flee
                    </button>
                </div>
            </div>
        `;
    },

    // Player attacks boss
    bossAttack() {
        if (!this.activeBoss) return;

        const player = typeof game !== 'undefined' ? game.player : { health: 100 };

        // Calculate player damage
        let playerAttack = 10;
        if (typeof EquipmentSystem !== 'undefined') {
            playerAttack += EquipmentSystem.getTotalBonus('attack') || 0;
            playerAttack += EquipmentSystem.getTotalBonus('damage') || 0;
        }

        // Random variance
        const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
        let damage = Math.round(playerAttack * variance);

        // Apply boss defense
        damage = Math.max(1, damage - Math.floor(this.activeBoss.defense / 3));

        this.activeBoss.currentHealth -= damage;
        this.addCombatLog(`You strike for ${damage} damage!`, '#4caf50');

        // Check for boss defeat
        if (this.activeBoss.currentHealth <= 0) {
            this.bossDefeated();
            return;
        }

        // Boss counter-attack
        setTimeout(() => this.bossCounterAttack(), 500);
    },

    // Boss attacks player
    bossCounterAttack(defending = false) {
        if (!this.activeBoss) return;

        const boss = this.activeBoss;
        let damage = boss.damage.min + Math.floor(Math.random() * (boss.damage.max - boss.damage.min));

        // Apply player defense
        let playerDefense = 0;
        if (typeof EquipmentSystem !== 'undefined') {
            playerDefense = EquipmentSystem.getTotalBonus('defense') || 0;
        }

        // If defending, double defense
        if (defending) {
            playerDefense *= 2;
            this.addCombatLog(`You brace for impact! (DEF x2)`, '#2196f3');
        }

        damage = Math.max(1, damage - Math.floor(playerDefense / 3));

        // Apply damage to player
        if (typeof game !== 'undefined' && game.player) {
            game.player.health = Math.max(0, (game.player.health || 100) - damage);

            this.addCombatLog(`${boss.name} strikes for ${damage} damage!`, '#f44336');

            // Check for player defeat
            if (game.player.health <= 0) {
                this.playerDefeated();
                return;
            }
        }

        // Update UI
        this.showBossCombatUI();
    },

    // Player defends (reduces next attack damage)
    bossDefend() {
        this.addCombatLog(`You raise your guard...`, '#2196f3');
        setTimeout(() => this.bossCounterAttack(true), 500);
    },

    // Player uses healing item - handled through PlayerStateManager
    bossHeal() {
        if (typeof game !== 'undefined' && game.player) {
            const healingItems = ['health_potion', 'bread', 'cheese', 'apple', 'cooked_meat'];
            let healed = false;

            for (const itemId of healingItems) {
                // Check inventory via PlayerStateManager or fallback
                const hasItem = typeof PlayerStateManager !== 'undefined' ?
                    PlayerStateManager.inventory.has(itemId) :
                    (game.player.inventory && game.player.inventory[itemId] > 0);

                if (hasItem) {
                    const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
                    const healAmount = item?.effects?.health || 20;

                    // Heal via PlayerStateManager or fallback
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.stats.add('health', healAmount, 'dungeon_boss_heal');
                        PlayerStateManager.inventory.remove(itemId, 1, 'dungeon_boss_heal');
                    } else {
                        game.player.health = Math.min(
                            game.player.stats?.maxHealth || 100,
                            (game.player.health || 0) + healAmount
                        );
                        game.player.inventory[itemId]--;
                        if (game.player.inventory[itemId] <= 0) delete game.player.inventory[itemId];

                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('inventory:item:removed', {
                                itemId: itemId,
                                quantity: 1,
                                newTotal: game.player.inventory[itemId] || 0,
                                reason: 'dungeon_heal'
                            });
                        }
                    }

                    this.addCombatLog(`You use ${item?.name || itemId} and heal ${healAmount} HP!`, '#4caf50');
                    healed = true;
                    break;
                }
            }

            if (!healed) {
                this.addCombatLog(`No healing items! The boss attacks!`, '#ff9800');
            }

            setTimeout(() => this.bossCounterAttack(), 500);
        }
    },

    // Add message to combat log
    addCombatLog(message, color = '#fff') {
        const log = document.getElementById('combat-log');
        if (log) {
            const p = document.createElement('p');
            p.style.color = color;
            p.style.margin = '5px 0';
            p.textContent = message;
            log.appendChild(p);
            log.scrollTop = log.scrollHeight;
        }
    },

    // Boss defeated!
    bossDefeated() {
        const boss = this.activeBoss;
        if (!boss) return;

        // Mark boss as defeated
        this.defeatedBosses[boss.id] = true;

        // Fire enemy-defeated event for quest system
        const defeatEvent = new CustomEvent('enemy-defeated', {
            detail: { enemyType: boss.questEnemy, count: 1 }
        });
        document.dispatchEvent(defeatEvent);
        console.log(`👹 Boss defeated! Fired enemy-defeated for: ${boss.questEnemy}`);

        // Also fire for the boss id itself
        if (boss.questEnemy !== boss.id) {
            const bossEvent = new CustomEvent('enemy-defeated', {
                detail: { enemyType: boss.id, count: 1 }
            });
            document.dispatchEvent(bossEvent);
        }

        // Give rewards through PlayerStateManager
        if (typeof game !== 'undefined' && game.player) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.add(boss.rewards.gold, 'boss_defeat');
            } else {
                game.player.gold = (game.player.gold || 0) + boss.rewards.gold;
            }

            // Add items to inventory (check if quest item vs regular item)
            boss.rewards.items.forEach(itemId => {
                const isQuestItem = typeof QuestSystem !== 'undefined' && QuestSystem.isQuestItem?.(itemId);

                if (isQuestItem) {
                    if (!game.player.questItems) game.player.questItems = {};
                    game.player.questItems[itemId] = (game.player.questItems[itemId] || 0) + 1;
                    console.log(`📦 Quest item found in boss loot: ${itemId}`);
                } else {
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.inventory.add(itemId, 1, 'boss_loot');
                    } else {
                        if (!game.player.inventory) game.player.inventory = {};
                        game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + 1;
                    }
                }

                document.dispatchEvent(new CustomEvent('item-received', {
                    detail: { item: itemId, quantity: 1, source: 'boss_loot', isQuestItem }
                }));
            });
        }

        // Show victory screen
        const overlay = document.getElementById('exploration-overlay');
        if (overlay) {
            overlay.querySelector('.overlay-content').innerHTML = `
                <div class="boss-victory" style="text-align: center;">
                    <h2 style="color: #ffd700; text-shadow: 0 0 30px #ffd700; font-size: 2em;">🏆 VICTORY! 🏆</h2>
                    <div style="font-size: 4em; margin: 20px 0;">${boss.icon}</div>
                    <h3 style="color: #4caf50;">${boss.victoryMessage}</h3>

                    <div class="boss-defeat-message" style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #ff9800; font-style: italic;">"${boss.defeatMessage}"</p>
                    </div>

                    <div class="boss-rewards" style="background: rgba(255,215,0,0.2); border: 2px solid #ffd700; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h4 style="color: #ffd700;">🎁 Rewards</h4>
                        <p style="font-size: 1.5em; color: #ffd700;">💰 ${boss.rewards.gold} Gold</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px;">
                            ${boss.rewards.items.map(itemId => {
                                const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
                                return `<span style="background: rgba(0,0,0,0.5); padding: 8px 12px; border-radius: 6px;">${item?.icon || '📦'} ${item?.name || itemId}</span>`;
                            }).join('')}
                        </div>
                    </div>

                    <button onclick="DungeonExplorationSystem.closeExploration()"
                        style="padding: 15px 40px; background: linear-gradient(180deg, #ffd700, #ff8c00); border: none; border-radius: 8px; color: #000; font-size: 1.2em; font-weight: bold; cursor: pointer;">
                        Claim Victory!
                    </button>
                </div>
            `;
        }

        // Play boss defeat dialogue using NPCDialogueSystem
        this.playBossDialogue(boss, 'defeat');

        // Update displays
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();

        // Clear active boss
        this.activeBoss = null;

        // Log to message system
        if (typeof addMessage === 'function') {
            addMessage(`🏆 ${boss.name} has been defeated!`, 'success');
            addMessage(`💰 Gained ${boss.rewards.gold} gold!`);
        }

        // Save boss progress
        this.saveBossProgress();
    },

    // Player defeated by boss
    playerDefeated() {
        const boss = this.activeBoss;

        const overlay = document.getElementById('exploration-overlay');
        if (overlay) {
            overlay.querySelector('.overlay-content').innerHTML = `
                <div class="boss-defeat" style="text-align: center;">
                    <h2 style="color: #f44336; text-shadow: 0 0 20px #f44336;">💀 DEFEATED 💀</h2>
                    <div style="font-size: 4em; margin: 20px 0;">${boss?.icon || '👹'}</div>
                    <h3 style="color: #888;">${boss?.name || 'The Boss'} has slain you...</h3>

                    <p style="color: #f44336; margin: 20px 0;">You lost consciousness and were dragged back to safety by a passing traveler.</p>
                    <p style="color: #888;">Some of your gold was lost...</p>

                    <button onclick="DungeonExplorationSystem.closeExploration()"
                        style="padding: 15px 40px; background: linear-gradient(180deg, #666, #444); border: none; border-radius: 8px; color: white; font-size: 1.2em; cursor: pointer;">
                        Accept Defeat
                    </button>
                </div>
            `;
        }

        // Lose gold through PlayerStateManager when defeated
        if (typeof game !== 'undefined' && game.player) {
            const currentGold = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.gold.get() : (game.player.gold || 0);
            const goldLoss = Math.floor(currentGold * 0.1);

            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.remove(goldLoss, 'boss_defeat_loss');
                PlayerStateManager.stats.set('health', 1, 'boss_defeat'); // Barely alive
            } else {
                game.player.gold = Math.max(0, currentGold - goldLoss);
                game.player.health = 1;
            }

            if (typeof addMessage === 'function') {
                addMessage(`💀 You were defeated by ${boss?.name || 'the boss'}!`, 'danger');
                addMessage(`💰 Lost ${goldLoss} gold...`);
            }
        }

        this.activeBoss = null;
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
    },

    // Flee from boss
    fleeBoss() {
        const boss = this.activeBoss;

        // Take some damage for fleeing
        if (typeof game !== 'undefined' && game.player && boss) {
            const fleeDamage = Math.floor(boss.damage.min * 0.5);
            game.player.health = Math.max(1, (game.player.health || 100) - fleeDamage);

            if (typeof addMessage === 'function') {
                addMessage(`🏃 You flee from ${boss.name}! Took ${fleeDamage} damage escaping.`, 'warning');
            }
        }

        this.activeBoss = null;
        this.closeExploration();
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
    },

    // Save boss progress to localStorage
    saveBossProgress() {
        try {
            localStorage.setItem('dungeonBossProgress', JSON.stringify(this.bossProgress));
            localStorage.setItem('dungeonDefeatedBosses', JSON.stringify(this.defeatedBosses));
        } catch (e) {
            console.warn('Could not save boss progress:', e);
        }
    },

    // Load boss progress from localStorage
    loadBossProgress() {
        try {
            const progress = localStorage.getItem('dungeonBossProgress');
            const defeated = localStorage.getItem('dungeonDefeatedBosses');
            if (progress) this.bossProgress = JSON.parse(progress);
            if (defeated) this.defeatedBosses = JSON.parse(defeated);
        } catch (e) {
            console.warn('Could not load boss progress:', e);
        }
    },

    // Get boss progress for save system
    getBossState() {
        return {
            bossProgress: this.bossProgress,
            defeatedBosses: this.defeatedBosses
        };
    },

    // Load boss state from save system
    loadBossState(state) {
        if (state) {
            this.bossProgress = state.bossProgress || {};
            this.defeatedBosses = state.defeatedBosses || {};
        }
    },

    // Reset all exploration state for new game
    resetForNewGame() {
        console.log('DungeonExplorationSystem resetting for new game...');

        // Clear boss progress and defeated bosses
        this.bossProgress = {};
        this.defeatedBosses = {};

        // Clear active boss if any
        this.activeBoss = null;

        // Clear localStorage
        try {
            localStorage.removeItem('dungeonBossProgress');
            localStorage.removeItem('dungeonDefeatedBosses');
        } catch (e) {
            console.warn('Could not clear dungeon localStorage:', e);
        }

        // Close any open exploration overlay
        this.closeExploration();

        console.log('DungeonExplorationSystem reset complete!');
    },

    //
    // TRIGGER SPECIFIC EXPLORATION EVENT - called by ExplorationPanel
    //
    triggerExplorationEvent(explorationId, locationId) {
        console.log(`🏚️ triggerExplorationEvent called: ${explorationId} at ${locationId}`);

        // get the event data
        const event = this.EXPLORATION_EVENTS[explorationId];
        if (!event) {
            console.warn(`🏚️ Exploration event not found: ${explorationId}`);
            console.log('🏚️ Available events:', Object.keys(this.EXPLORATION_EVENTS).slice(0, 10));
            if (typeof game !== 'undefined' && game.addMessage) {
                game.addMessage(`This exploration (${explorationId}) is not yet implemented.`, 'info');
            }
            return false;
        }
        console.log(`🏚️ Event found:`, event.name, 'locationType:', event.locationType);

        // get the location
        const location = this.getLocation(locationId);
        if (!location) {
            console.warn(`🏚️ Location not found: ${locationId}`);
            return false;
        }
        console.log(`🏚️ Location found:`, location.name, 'type:', location.type);

        // check if location type matches event's allowed types
        if (event.locationType && !event.locationType.includes(location.type)) {
            console.warn(`🏚️ Event ${explorationId} not valid for location type ${location.type}`);
            console.log(`🏚️ Event allows:`, event.locationType, 'but location is:', location.type);
            if (typeof game !== 'undefined' && game.addMessage) {
                game.addMessage(`This exploration is not available at ${location.name}.`, 'warning');
            }
            return false;
        }
        console.log(`🏚️ Location type check passed`);

        // play dungeon music
        if (typeof MusicSystem !== 'undefined') {
            MusicSystem.playDungeonMusic();
        }

        // get difficulty and render UI
        const difficulty = this.getLocationDifficulty(location);
        console.log(`🏚️ About to call renderExplorationUI with difficulty:`, difficulty);
        this.renderExplorationUI(location, event, difficulty);
        console.log(`🏚️ renderExplorationUI completed`);

        return true;
    },

    //
    // GET ALL EVENTS FOR LOCATION TYPE - returns array of event IDs
    //
    getEventIdsForLocationType(locationType) {
        return Object.keys(this.EXPLORATION_EVENTS).filter(eventId => {
            const event = this.EXPLORATION_EVENTS[eventId];
            return event.locationType && event.locationType.includes(locationType);
        });
    }
};

// Expose globally
window.DungeonExplorationSystem = DungeonExplorationSystem;

// register with Bootstrap
Bootstrap.register('DungeonExplorationSystem', () => DungeonExplorationSystem.init(), {
    dependencies: ['CombatSystem', 'TravelSystem', 'ItemDatabase'],
    priority: 75,
    severity: 'optional'
});

console.log('🏚️ DungeonExplorationSystem loaded - may the loot be ever in your favor');
