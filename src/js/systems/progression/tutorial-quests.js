// ═══════════════════════════════════════════════════════════════
// TUTORIAL QUESTS - Comprehensive Game Teaching System
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// 30+ Tutorial Quests across 7 Acts
// Teaches: EVERY UI element, button, tooltip, system, and mechanic
// ═══════════════════════════════════════════════════════════════

const TutorialQuests = {
    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL METADATA
    // ═══════════════════════════════════════════════════════════════
    tutorialInfo: {
        name: 'Merchant\'s Apprentice',
        totalActs: 6,  // FIX: Acts 0-5 = 6 acts (not 7)
        totalQuests: 28,  // FIX: 3+5+6+5+5+4 = 28 quests (tutorial_0_4 deleted)
        estimatedTime: '20-35 minutes',
        description: 'A comprehensive tutorial that teaches EVERY game mechanic through guided quests. Master trading, travel, combat, survival, and all UI systems before starting your real adventure.'
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 0: WELCOME & BASIC CONTROLS (4 quests)
    //  Theme: Core UI, pause, speed, tooltips
    //  Duration: 3-4 minutes
    // ═══════════════════════════════════════════════════════════════
    act0: {
        name: 'Welcome to the World',
        theme: 'Basic controls, pause, speed, tooltips, UI orientation',
        quests: {
            // 0.1 - Welcome - TWO OBJECTIVES: Open People panel, then talk to Elara
            tutorial_0_1: {
                id: 'tutorial_0_1',
                name: 'Welcome, Apprentice',
                description: 'Learn how to find NPCs. First open the People panel, then talk to Merchant Elara.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 0,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 1,
                difficulty: 'tutorial',
                objectives: [
                    // STEP 1: Open the People panel (must complete first)
                    { type: 'ui_action', action: 'open_people', completed: false, description: 'Press P or click 👥 People button' },
                    // STEP 2: Talk to Elara (simpler text since panel is already open)
                    { type: 'talk', npc: 'tutorial_guide', location: 'tutorial_village', completed: false, description: 'Talk to Merchant Elara' }
                ],
                rewards: { gold: 50, experience: 10 },
                prerequisite: null,
                nextQuest: 'tutorial_0_2',
                dialogue: {
                    offer: "Welcome, young one! I'm Elara, and I'll teach you everything about being a merchant. Let me explain what you see:\n\n" +
                           "📊 **RIGHT PANEL**: Your name, gold, stats, and VITAL BARS (Health ❤️, Hunger 🍖, Thirst 💧, Energy 😴)\n" +
                           "🗺️ **CENTER**: The world map showing your location\n" +
                           "📜 **BOTTOM**: Action buttons for all game features\n" +
                           "⏱️ **TOP**: Time controls and current date\n\n" +
                           "Let's begin your training!",
                    progress: "📋 TO FIND ME:\n1. Press P key OR click 👥 People at the bottom\n2. Find 'Merchant Elara' with a yellow ! marker\n3. Click on me to start talking!",
                    complete: "Excellent! You've taken your first step. Now, let me teach you something crucial - how to PAUSE time when you need a moment to think."
                },
                teachingPoints: ['How to find NPCs', 'People panel (P key)', 'Quest markers (! and ?)', 'Talking to NPCs']
            },

            // 0.2 - Pause the World
            tutorial_0_2: {
                id: 'tutorial_0_2',
                name: 'Pause the World',
                description: 'Learn to pause time using SPACE key or the pause button.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 0,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 2,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'pause_game', completed: false, description: 'Press SPACE or click ⏸️ to pause' },
                    { type: 'ui_action', action: 'unpause_game', completed: false, description: 'Press SPACE again to unpause' }
                ],
                rewards: { gold: 25, experience: 10 },
                prerequisite: 'tutorial_0_1',
                nextQuest: 'tutorial_0_3',
                dialogue: {
                    offer: "Time waits for no one - hunger grows, thirst increases, and opportunities pass. But YOU can pause time itself!\n\n" +
                           "⏸️ **PAUSE BUTTON**: Located in the TOP-LEFT corner\n" +
                           "⌨️ **KEYBOARD**: Press SPACE to toggle pause\n\n" +
                           "When paused, you can still browse menus, read tooltips, and plan your next move. Try it now - pause and unpause the game!",
                    progress: "Press SPACE or click the pause button (⏸️) in the top-left. Then unpause to continue.",
                    complete: "Perfect! Pausing is essential for planning trades, reading quest details, and making decisions without time pressure. Now let's control time SPEED..."
                },
                teachingPoints: ['Pause button location', 'SPACE hotkey', 'What you can do while paused']
            },

            // 0.3 - Time Control
            tutorial_0_3: {
                id: 'tutorial_0_3',
                name: 'Master of Time',
                description: 'Learn to speed up time for travel and waiting.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 0,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 3,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'change_speed', completed: false, description: 'Change game speed using the dropdown' }
                ],
                rewards: { gold: 25, experience: 10 },
                prerequisite: 'tutorial_0_2',
                nextQuest: 'tutorial_1_1',
                dialogue: {
                    offer: "Next to the pause button is the SPEED DROPDOWN. This controls how fast time passes:\n\n" +
                           "🐢 **1x NORMAL**: Real-time, good for active trading\n" +
                           "🐇 **2x FAST**: Double speed, good for short waits\n" +
                           "⚡ **4x FASTER**: Quadruple speed, good for travel\n\n" +
                           "Faster speeds make hunger/thirst drain faster too! Click the dropdown and try changing the speed.",
                    progress: "Click the speed dropdown next to the pause button and select a different speed.",
                    complete: "Wonderful! Use FAST when traveling or waiting for shops to restock. But be careful - time passing means your survival needs increase too! Now let's learn about TRADING!"
                },
                teachingPoints: ['Speed dropdown location', 'Speed levels explained', 'Impact on survival']
            }
            // tutorial_0_4 (Hidden Knowledge) DELETED - tooltip detection was broken beyond repair
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 1: TRADING FUNDAMENTALS (5 quests)
    //  Theme: Market, buying, selling, inventory, profit
    //  Duration: 5-7 minutes
    // ═══════════════════════════════════════════════════════════════
    act1: {
        name: 'The Trader\'s Path',
        theme: 'Market, buying, selling, inventory, profit',
        quests: {
            // 1.1 - The Market
            tutorial_1_1: {
                id: 'tutorial_1_1',
                name: 'The Market',
                description: 'Learn to open and navigate the Market panel.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 1,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 5,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_market', completed: false, description: 'Open Market (press M or click 🏪)' }
                ],
                rewards: { gold: 25, experience: 15 },
                prerequisite: 'tutorial_0_3',
                nextQuest: 'tutorial_1_2',
                dialogue: {
                    offer: "The Market is where fortunes are made! Open it with:\n\n" +
                           "🏪 **BOTTOM BAR**: Click the Market button\n" +
                           "⌨️ **KEYBOARD**: Press 'M'\n\n" +
                           "Inside you'll see:\n" +
                           "📥 **BUY TAB**: Items you can purchase\n" +
                           "📤 **SELL TAB**: Items you can sell\n" +
                           "💰 **PRICES**: Green = good deal, Red = bad deal\n" +
                           "📊 **YOUR GOLD**: Always shown at the top\n\n" +
                           "Open the Market now!",
                    progress: "Press M or click the 🏪 Market button at the bottom of the screen.",
                    complete: "You've found the Market! Notice the BUY and SELL tabs. Each location sells different goods at different prices - that's the key to profit!"
                },
                teachingPoints: ['Market button location', 'M hotkey', 'Buy/Sell tabs', 'Price colors']
            },

            // 1.2 - First Purchase
            tutorial_1_2: {
                id: 'tutorial_1_2',
                name: 'First Purchase',
                description: 'Buy your first item from the market.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 1,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 6,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'buy', count: 1, current: 0, description: 'Purchase any item from the market' }
                ],
                rewards: { gold: 50, experience: 20 },
                prerequisite: 'tutorial_1_1',
                nextQuest: 'tutorial_1_3',
                dialogue: {
                    offer: "Time to spend gold! Here's how to buy:\n\n" +
                           "1️⃣ **CLICK AN ITEM**: Select what you want\n" +
                           "2️⃣ **SET QUANTITY**: Use +/- or type amount\n" +
                           "3️⃣ **CHECK TOTAL**: See total cost before buying\n" +
                           "4️⃣ **CLICK BUY**: Complete the purchase\n\n" +
                           "💡 **TIP**: Wheat is CHEAP here! Buy some - you'll sell it for profit later.\n\n" +
                           "Buy anything to continue.",
                    progress: "In the Market, click an item, set quantity, and click BUY.",
                    complete: "Your first trade! The gold left your pouch, but now you own something of value. Let's check your INVENTORY to see what you have."
                },
                teachingPoints: ['Buying process', 'Quantity selection', 'Total cost display']
            },

            // 1.3 - Your Belongings
            tutorial_1_3: {
                id: 'tutorial_1_3',
                name: 'Your Belongings',
                description: 'Learn to manage your inventory.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 1,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 7,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_inventory', completed: false, description: 'Open Inventory (press I or click 🧺)' }
                ],
                rewards: { gold: 25, experience: 15 },
                prerequisite: 'tutorial_1_2',
                nextQuest: 'tutorial_1_4',
                dialogue: {
                    offer: "Your INVENTORY holds everything you own. Open it with:\n\n" +
                           "🧺 **BOTTOM BAR**: Click the Inventory button\n" +
                           "⌨️ **KEYBOARD**: Press 'I'\n\n" +
                           "Inside you'll see:\n" +
                           "📦 **ITEMS**: Everything you're carrying\n" +
                           "⚖️ **WEIGHT**: How much you're carrying vs max capacity\n" +
                           "🍞 **CONSUMABLES**: Food, water, potions - click to use!\n" +
                           "⚔️ **EQUIPMENT**: Weapons and armor you can equip\n\n" +
                           "Open your inventory now!",
                    progress: "Press I or click the 🧺 Inventory button at the bottom.",
                    complete: "There's your stuff! You can click items to use consumables, or drag equipment to equip it. Notice the WEIGHT at the bottom - Strength stat increases your carry limit!"
                },
                teachingPoints: ['Inventory button', 'I hotkey', 'Weight/capacity', 'Using consumables']
            },

            // 1.4 - Profit Motive (Buy low, travel, sell high)
            tutorial_1_4: {
                id: 'tutorial_1_4',
                name: 'The Profit Motive',
                description: 'Learn the core trading loop - buy low, travel, sell high!',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_merchant',
                turnInNpcName: 'Trader Marcus',
                turnInLocation: 'tutorial_town',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 1,
                actOrder: 4,
                chain: 'tutorial',
                chainOrder: 8,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'collect', item: 'wheat', count: 5, current: 0, description: 'Buy 5 wheat from Tutorial Village' },
                    { type: 'visit', location: 'tutorial_town', completed: false, description: 'Travel to Tutorial Town' },
                    { type: 'sell', item: 'wheat', count: 5, current: 0, description: 'Sell the wheat in Tutorial Town' }
                ],
                rewards: { gold: 100, experience: 50 },
                prerequisite: 'tutorial_1_3',
                nextQuest: 'tutorial_1_5',
                dialogue: {
                    offer: "HERE'S THE SECRET TO WEALTH:\n\n" +
                           "🌾 **WHEAT HERE**: 50% of normal price (CHEAP!)\n" +
                           "🏘️ **WHEAT IN TOWN**: 180% of normal price (EXPENSIVE!)\n\n" +
                           "This is called **ARBITRAGE** - buying where things are cheap and selling where they're expensive!\n\n" +
                           "1️⃣ Buy 5 wheat here (it's half price!)\n" +
                           "2️⃣ Open Travel (T) and go to Tutorial Town\n" +
                           "3️⃣ Sell the wheat there for PROFIT!\n\n" +
                           "Do this across the realm and you'll be rich!",
                    progress: "Buy wheat here, travel to Tutorial Town, sell it there. Watch your gold grow!",
                    complete: "You made a PROFIT! This is the core of trading - buy where goods are cheap, sell where they're expensive. Different locations specialize in different goods!"
                },
                teachingPoints: ['Arbitrage concept', 'Price differences by location', 'Trading loop']
            },

            // 1.5 - Financial Tracking
            tutorial_1_5: {
                id: 'tutorial_1_5',
                name: 'Track Your Wealth',
                description: 'Learn to use the Financial Tracker to monitor your profits.',
                giver: 'tutorial_merchant',
                giverName: 'Trader Marcus',
                turnInNpc: 'tutorial_merchant',
                turnInNpcName: 'Trader Marcus',
                turnInLocation: 'tutorial_town',
                location: 'tutorial_town',
                type: 'tutorial',
                act: 1,
                actOrder: 5,
                chain: 'tutorial',
                chainOrder: 9,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_financial', completed: false, description: 'Open Financial Tracker (press F or click 💰)' }
                ],
                rewards: { gold: 50, experience: 25 },
                prerequisite: 'tutorial_1_4',
                nextQuest: 'tutorial_2_1',
                dialogue: {
                    offer: "A good merchant tracks their money! The FINANCIAL TRACKER shows:\n\n" +
                           "💰 **BOTTOM BAR**: Click the gold coin button\n" +
                           "⌨️ **KEYBOARD**: Press 'F'\n\n" +
                           "It displays:\n" +
                           "📈 **PROFIT/LOSS**: Today, this week, all time\n" +
                           "🛒 **PURCHASES**: What you've bought\n" +
                           "💵 **SALES**: What you've sold\n" +
                           "📊 **TRENDS**: Are you making money over time?\n\n" +
                           "Open it now and see your profit from the wheat trade!",
                    progress: "Press F or click the 💰 Financial button at the bottom.",
                    complete: "Tracking your finances helps you see what trades are profitable! Now let's learn about TRAVELING across the land..."
                },
                teachingPoints: ['Financial tracker button', 'F hotkey', 'Profit tracking', 'Trade history']
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 2: TRAVEL & EXPLORATION (6 quests)
    //  Theme: Travel panel, paths, travel time, wayfinder, map, exploration
    //  Duration: 6-8 minutes
    // ═══════════════════════════════════════════════════════════════
    act2: {
        name: 'The Wanderer\'s Way',
        theme: 'Travel, map controls, paths, wayfinder, exploration',
        quests: {
            // 2.1 - The Road Ahead
            tutorial_2_1: {
                id: 'tutorial_2_1',
                name: 'The Road Ahead',
                description: 'Learn the Travel panel in detail - paths, times, and routes.',
                giver: 'tutorial_merchant',
                giverName: 'Trader Marcus',
                turnInNpc: 'tutorial_merchant',
                turnInNpcName: 'Trader Marcus',
                turnInLocation: 'tutorial_town',
                location: 'tutorial_town',
                type: 'tutorial',
                act: 2,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 10,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_travel', completed: false, description: 'Open Travel panel (press T or click 🗺️)' }
                ],
                rewards: { gold: 25, experience: 15 },
                prerequisite: 'tutorial_1_5',
                nextQuest: 'tutorial_2_2',
                dialogue: {
                    offer: "The TRAVEL PANEL is your gateway to the world! Open it with:\n\n" +
                           "🗺️ **BOTTOM BAR**: Click the Travel/Map button\n" +
                           "⌨️ **KEYBOARD**: Press 'T'\n\n" +
                           "The Travel panel shows:\n" +
                           "📍 **YOUR LOCATION**: Where you are now\n" +
                           "🛣️ **CONNECTED PATHS**: Where you can go directly\n" +
                           "⏱️ **TRAVEL TIME**: How long each trip takes\n" +
                           "💰 **TRAVEL COST**: Gold required for supplies/tolls\n" +
                           "🎯 **DISTANCE**: How far each destination is\n\n" +
                           "Open it now!",
                    progress: "Press T or click the 🗺️ Travel button at the bottom.",
                    complete: "This is your world map! See the LINES connecting locations? Those are paths. Hover over any location to see details like travel time and cost!"
                },
                teachingPoints: ['Travel button', 'T hotkey', 'Connected paths', 'Travel time display', 'Travel cost']
            },

            // 2.2 - Understanding Paths
            tutorial_2_2: {
                id: 'tutorial_2_2',
                name: 'Understanding Paths',
                description: 'Learn how paths, travel time, and routes work.',
                giver: 'tutorial_merchant',
                giverName: 'Trader Marcus',
                turnInNpc: 'tutorial_merchant',
                turnInNpcName: 'Trader Marcus',
                turnInLocation: 'tutorial_town',
                location: 'tutorial_town',
                type: 'tutorial',
                act: 2,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 11,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'hover_location', completed: false, description: 'Hover over a location on the map to see its details' }
                ],
                rewards: { gold: 25, experience: 15 },
                prerequisite: 'tutorial_2_1',
                nextQuest: 'tutorial_2_3',
                dialogue: {
                    offer: "Let me explain PATHS and ROUTES:\n\n" +
                           "🛣️ **WHITE LINES**: Direct paths between connected locations\n" +
                           "📍 **LOCATION DOTS**: Click or hover to see info\n" +
                           "⏱️ **TRAVEL TIME**: Shown in game-hours (e.g., '2h 30m')\n" +
                           "🏃 **FASTER TRAVEL**: Mounts and perks reduce travel time!\n\n" +
                           "**PATH INFO** shows:\n" +
                           "• Distance in miles\n" +
                           "• Terrain type (road, path, forest, etc.)\n" +
                           "• Encounter chance (bandits, traders, etc.)\n\n" +
                           "Hover over a location now to see this info!",
                    progress: "Move your mouse over any location on the travel map to see its tooltip with path information.",
                    complete: "You can see the travel time, distance, and terrain! Longer paths take more time and use more hunger/thirst. Roads are faster than wilderness paths!"
                },
                teachingPoints: ['Path lines', 'Location tooltips', 'Travel time calculation', 'Terrain types', 'Encounter chances']
            },

            // 2.3 - Map Controls
            tutorial_2_3: {
                id: 'tutorial_2_3',
                name: 'Map Mastery',
                description: 'Learn to use map controls - zoom, pan, fullscreen.',
                giver: 'tutorial_merchant',
                giverName: 'Trader Marcus',
                turnInNpc: 'tutorial_merchant',
                turnInNpcName: 'Trader Marcus',
                turnInLocation: 'tutorial_town',
                location: 'tutorial_town',
                type: 'tutorial',
                act: 2,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 12,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'zoom_map', completed: false, description: 'Use the zoom controls (+/-) on the map' }
                ],
                rewards: { gold: 25, experience: 15 },
                prerequisite: 'tutorial_2_2',
                nextQuest: 'tutorial_2_4',
                dialogue: {
                    offer: "The world map has CONTROLS in the corner:\n\n" +
                           "🔍 **+ BUTTON**: Zoom in for detail\n" +
                           "🔍 **- BUTTON**: Zoom out to see more\n" +
                           "⟲ **RESET**: Return to default view\n" +
                           "⛶ **FULLSCREEN**: Make the map bigger\n" +
                           "📍 **CENTER**: Jump back to your location\n\n" +
                           "You can also:\n" +
                           "🖱️ **SCROLL WHEEL**: Zoom in/out\n" +
                           "🖱️ **CLICK & DRAG**: Pan the map\n\n" +
                           "Try the zoom controls now!",
                    progress: "Click the + or - buttons on the map, or use your scroll wheel to zoom.",
                    complete: "Map navigation mastered! In the full game, the world is HUGE - you'll need these controls to find distant destinations!"
                },
                teachingPoints: ['Zoom buttons', 'Reset view', 'Fullscreen', 'Center on player', 'Mouse controls']
            },

            // 2.4 - Quest Wayfinder
            tutorial_2_4: {
                id: 'tutorial_2_4',
                name: 'Following the Path',
                description: 'Learn about the Quest Wayfinder and objective markers.',
                giver: 'tutorial_merchant',
                giverName: 'Trader Marcus',
                turnInNpc: 'tutorial_warden',
                turnInNpcName: 'Forest Warden',
                turnInLocation: 'tutorial_forest',
                location: 'tutorial_town',
                type: 'tutorial',
                act: 2,
                actOrder: 4,
                chain: 'tutorial',
                chainOrder: 13,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'visit', location: 'tutorial_forest', completed: false, description: 'Follow the wayfinder to Tutorial Forest' }
                ],
                rewards: { gold: 50, experience: 25 },
                prerequisite: 'tutorial_2_3',
                nextQuest: 'tutorial_2_5',
                dialogue: {
                    offer: "When you're tracking a quest, a WAYFINDER appears:\n\n" +
                           "🎯 **QUEST MARKER**: A glowing indicator on the map\n" +
                           "⬆️ **ARROW**: Points toward your objective if off-screen\n" +
                           "📍 **DESTINATION**: Highlighted with a pulsing effect\n\n" +
                           "On the QUEST TRACKER (right side of screen):\n" +
                           "👁️ **EYE ICON**: Click to track/untrack a quest\n" +
                           "📍 **LOCATION NAME**: Where you need to go\n\n" +
                           "Your next objective is Tutorial Forest - the wayfinder shows the way! Travel there now.",
                    progress: "Open Travel (T), find Tutorial Forest (look for the wayfinder glow), and travel there.",
                    complete: "You followed the wayfinder! In the main game, quest markers will guide you to NPCs, locations, and objectives. Never get lost!"
                },
                teachingPoints: ['Quest wayfinder', 'Tracking quests', 'Objective markers', 'Eye icon to track']
            },

            // 2.5 - Random Encounters
            tutorial_2_5: {
                id: 'tutorial_2_5',
                name: 'Road Encounters',
                description: 'Learn about random encounters during travel.',
                giver: 'tutorial_warden',
                giverName: 'Forest Warden',
                turnInNpc: 'tutorial_warden',
                turnInNpcName: 'Forest Warden',
                turnInLocation: 'tutorial_forest',
                location: 'tutorial_forest',
                type: 'tutorial',
                act: 2,
                actOrder: 5,
                chain: 'tutorial',
                chainOrder: 14,
                difficulty: 'tutorial',
                triggersEncounter: true,
                encounterType: 'tutorial_trader',
                objectives: [
                    { type: 'encounter', encounter_type: 'any', completed: false, description: 'Experience a road encounter' }
                ],
                rewards: { gold: 75, experience: 30 },
                prerequisite: 'tutorial_2_4',
                nextQuest: 'tutorial_2_6',
                dialogue: {
                    offer: "While traveling, you may encounter others on the road:\n\n" +
                           "🤝 **FRIENDLY TRADERS**: Offer trades or information\n" +
                           "🗣️ **TRAVELERS**: Share rumors or ask for help\n" +
                           "⚔️ **BANDITS**: Demand gold or attack!\n" +
                           "❓ **MYSTERIOUS FIGURES**: Who knows what they want...\n\n" +
                           "When an encounter happens, you'll see options:\n" +
                           "💬 **TALK**: Try diplomacy\n" +
                           "💰 **TRADE**: Exchange goods\n" +
                           "⚔️ **FIGHT**: Combat (if hostile)\n" +
                           "🏃 **FLEE**: Run away\n\n" +
                           "I'll arrange a safe encounter for practice...",
                    progress: "Wait for the encounter to trigger and respond to it.",
                    complete: "You handled that well! Road encounters add excitement and danger to travel. Higher Charisma helps with diplomacy, Luck affects what you encounter!"
                },
                teachingPoints: ['Encounter types', 'Response options', 'Charisma for diplomacy', 'Luck for encounters']
            },

            // 2.6 - Exploration
            tutorial_2_6: {
                id: 'tutorial_2_6',
                name: 'Secrets of the Land',
                description: 'Learn to explore locations for treasures and dungeons.',
                giver: 'tutorial_warden',
                giverName: 'Forest Warden',
                turnInNpc: 'tutorial_warden',
                turnInNpcName: 'Forest Warden',
                turnInLocation: 'tutorial_forest',
                location: 'tutorial_forest',
                type: 'tutorial',
                act: 2,
                actOrder: 6,
                chain: 'tutorial',
                chainOrder: 15,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_explore', completed: false, description: 'Press E or click Explore' },
                    // FIX CRITICAL-005: Use correct dungeonId from tutorial-world.js
                    { type: 'explore', dungeon: 'tutorial_forest_dungeon', rooms: 1, current: 0, description: 'Explore one room' }
                ],
                rewards: { gold: 100, experience: 40, items: { bandages: 3, herbs: 5 } },
                prerequisite: 'tutorial_2_5',
                nextQuest: 'tutorial_3_1',
                dialogue: {
                    offer: "Many locations have hidden secrets! To EXPLORE:\n\n" +
                           "⌨️ **KEYBOARD**: Press 'E'\n" +
                           "🔍 **LOCATION PANEL**: Click the Explore button\n\n" +
                           "Exploration reveals:\n" +
                           "🏛️ **DUNGEONS**: Multi-room areas with enemies and loot\n" +
                           "💎 **TREASURE**: Gold, items, and rare gear\n" +
                           "👹 **ENEMIES**: Creatures guarding the loot\n" +
                           "🚪 **ROOMS**: Move deeper to find better rewards\n\n" +
                           "This forest has old ruins. Try exploring!",
                    progress: "Press E or find the Explore button, then explore at least one room.",
                    complete: "You found something! Exploration is risky but rewarding. Deeper rooms have stronger enemies but better loot. Now let's teach you to FIGHT!"
                },
                teachingPoints: ['Explore button', 'E hotkey', 'Dungeon rooms', 'Loot and enemies', 'Risk vs reward']
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 3: COMBAT (5 quests)
    //  Theme: Combat system, attack, defend, items, boss fights
    //  Duration: 5-6 minutes
    // ═══════════════════════════════════════════════════════════════
    act3: {
        name: 'The Fighter\'s Trial',
        theme: 'Combat, attack, defend, items, boss fights',
        quests: {
            // 3.1 - First Fight
            tutorial_3_1: {
                id: 'tutorial_3_1',
                name: 'First Fight',
                description: 'Learn combat basics against a Training Dummy.',
                giver: 'tutorial_trainer',
                giverName: 'Combat Trainer Dane',
                turnInNpc: 'tutorial_trainer',
                turnInNpcName: 'Combat Trainer Dane',
                turnInLocation: 'tutorial_arena',
                location: 'tutorial_arena',
                type: 'tutorial',
                act: 3,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 16,
                difficulty: 'tutorial',
                triggersCombat: true,
                combatEnemy: 'tutorial_dummy',
                objectives: [
                    { type: 'defeat', enemy: 'tutorial_dummy', count: 1, current: 0, description: 'Defeat the Training Dummy' }
                ],
                rewards: { gold: 50, experience: 35 },
                prerequisite: 'tutorial_2_6',
                nextQuest: 'tutorial_3_2',
                dialogue: {
                    offer: "Welcome to the Arena! Combat is turn-based:\n\n" +
                           "⚔️ **YOUR TURN**: You act first, then the enemy\n" +
                           "❤️ **HEALTH BARS**: Yours (left) vs Enemy (right)\n" +
                           "🎯 **ATTACK**: Deal damage based on Strength + Weapon\n\n" +
                           "The combat screen shows:\n" +
                           "👤 **YOUR STATS**: Health, attack power, defense\n" +
                           "👹 **ENEMY STATS**: Their health and danger level\n" +
                           "📜 **COMBAT LOG**: What happened each turn\n\n" +
                           "Face the Training Dummy and ATTACK to win!",
                    progress: "When combat starts, click ATTACK to damage the dummy until it falls.",
                    complete: "Victory! Combat is simple but strategic. Your damage = Strength + Weapon damage. Now let's learn DEFENSE..."
                },
                teachingPoints: ['Turn-based combat', 'Health bars', 'Attack button', 'Damage calculation']
            },

            // 3.2 - Defense
            tutorial_3_2: {
                id: 'tutorial_3_2',
                name: 'The Art of Defense',
                description: 'Learn to use the Defend action.',
                giver: 'tutorial_trainer',
                giverName: 'Combat Trainer Dane',
                turnInNpc: 'tutorial_trainer',
                turnInNpcName: 'Combat Trainer Dane',
                turnInLocation: 'tutorial_arena',
                location: 'tutorial_arena',
                type: 'tutorial',
                act: 3,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 17,
                difficulty: 'tutorial',
                triggersCombat: true,
                combatEnemy: 'tutorial_fighter',
                objectives: [
                    { type: 'combat_action', action: 'defend', count: 1, current: 0, description: 'Use DEFEND at least once' },
                    { type: 'defeat', enemy: 'tutorial_fighter', count: 1, current: 0, description: 'Defeat the Sparring Partner' }
                ],
                rewards: { gold: 75, experience: 40, items: { leather_armor: 1 } },
                prerequisite: 'tutorial_3_1',
                nextQuest: 'tutorial_3_3',
                dialogue: {
                    offer: "Now face a real opponent! The DEFEND action:\n\n" +
                           "🛡️ **DEFEND BUTTON**: Reduces damage taken this turn\n" +
                           "📊 **REDUCTION**: Usually 50% less damage\n" +
                           "💡 **WHEN TO USE**:\n" +
                           "   • Health is low\n" +
                           "   • Enemy is about to use a big attack\n" +
                           "   • Buying time for potions\n\n" +
                           "Defense + Armor determines damage reduction. Use DEFEND at least once in this fight!",
                    progress: "During combat, click DEFEND at least once. Then defeat the Sparring Partner.",
                    complete: "Smart fighting! Defense is crucial against strong enemies. Here's some armor - equip it to increase your defense permanently!"
                },
                teachingPoints: ['Defend button', 'Damage reduction', 'When to defend', 'Armor importance']
            },

            // 3.3 - Using Items
            tutorial_3_3: {
                id: 'tutorial_3_3',
                name: 'Healing in Battle',
                description: 'Learn to use items during combat.',
                giver: 'tutorial_trainer',
                giverName: 'Combat Trainer Dane',
                turnInNpc: 'tutorial_trainer',
                turnInNpcName: 'Combat Trainer Dane',
                turnInLocation: 'tutorial_arena',
                location: 'tutorial_arena',
                type: 'tutorial',
                act: 3,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 18,
                difficulty: 'tutorial',
                givesQuestItem: { health_potion: 5 },
                triggersCombat: true,
                combatEnemy: 'tutorial_brute',
                objectives: [
                    { type: 'combat_action', action: 'use_item', count: 1, current: 0, description: 'Use a Health Potion in combat' },
                    { type: 'defeat', enemy: 'tutorial_brute', count: 1, current: 0, description: 'Defeat the Arena Brute' }
                ],
                rewards: { gold: 100, experience: 50, items: { health_potion: 5 } },
                prerequisite: 'tutorial_3_2',
                nextQuest: 'tutorial_3_4',
                dialogue: {
                    offer: "Here are Health Potions! To use items in combat:\n\n" +
                           "📦 **ITEMS BUTTON**: Opens your usable items\n" +
                           "❤️ **HEALTH POTION**: Instantly heals HP\n" +
                           "🩹 **BANDAGES**: Heal over time\n" +
                           "⚡ **BUFF ITEMS**: Boost attack/defense temporarily\n\n" +
                           "Using an item takes your turn, so use them wisely!\n\n" +
                           "💡 **TIP**: Don't wait until almost dead - heal at 50% HP!\n\n" +
                           "Face the Arena Brute and use a potion when hurt.",
                    progress: "During combat, click ITEMS and use a Health Potion. Then defeat the Brute.",
                    complete: "You survived! Items can turn defeat into victory. Always carry potions before exploring dungeons or fighting bosses!"
                },
                teachingPoints: ['Items button in combat', 'Potion types', 'Using items takes a turn', 'When to heal']
            },

            // 3.4 - Understanding Stats
            tutorial_3_4: {
                id: 'tutorial_3_4',
                name: 'Know Yourself',
                description: 'Learn about your combat stats and Character Sheet.',
                giver: 'tutorial_trainer',
                giverName: 'Combat Trainer Dane',
                turnInNpc: 'tutorial_trainer',
                turnInNpcName: 'Combat Trainer Dane',
                turnInLocation: 'tutorial_arena',
                location: 'tutorial_arena',
                type: 'tutorial',
                act: 3,
                actOrder: 4,
                chain: 'tutorial',
                chainOrder: 19,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_character', completed: false, description: 'Open Character Sheet (press C or click 👤)' }
                ],
                rewards: { gold: 50, experience: 30 },
                prerequisite: 'tutorial_3_3',
                nextQuest: 'tutorial_3_5',
                dialogue: {
                    offer: "Know your strengths! Open your CHARACTER SHEET:\n\n" +
                           "👤 **BOTTOM BAR**: Click the Character button\n" +
                           "⌨️ **KEYBOARD**: Press 'C'\n\n" +
                           "Your stats affect combat:\n" +
                           "💪 **STRENGTH**: Attack damage, carry weight\n" +
                           "🧠 **INTELLIGENCE**: Better prices, crafting\n" +
                           "😊 **CHARISMA**: NPC prices, persuasion\n" +
                           "🏃 **ENDURANCE**: Max health, stamina\n" +
                           "🍀 **LUCK**: Crit chance, loot quality\n\n" +
                           "Equipment and perks also boost these!",
                    progress: "Press C or click the 👤 Character button to view your stats.",
                    complete: "Your stats shape how you play! Strength for combat, Intelligence for trading, Charisma for diplomacy. Level up to gain stat points!"
                },
                teachingPoints: ['Character sheet button', 'C hotkey', 'All stat explanations', 'Equipment effects']
            },

            // 3.5 - Boss Fight
            tutorial_3_5: {
                id: 'tutorial_3_5',
                name: 'Boss Trial',
                description: 'Face the Tutorial Bandit Chief - your first boss!',
                giver: 'tutorial_trainer',
                giverName: 'Combat Trainer Dane',
                turnInNpc: 'tutorial_trainer',
                turnInNpcName: 'Combat Trainer Dane',
                turnInLocation: 'tutorial_arena',
                location: 'tutorial_arena',
                type: 'tutorial',
                act: 3,
                actOrder: 5,
                chain: 'tutorial',
                chainOrder: 20,
                difficulty: 'tutorial',
                triggersCombat: true,
                combatEnemy: 'tutorial_boss',
                isBossFight: true,
                objectives: [
                    { type: 'defeat', enemy: 'tutorial_boss', count: 1, current: 0, description: 'Defeat the Tutorial Bandit Chief' }
                ],
                rewards: { gold: 200, experience: 100, items: { iron_sword: 1, health_potion: 3 } },
                prerequisite: 'tutorial_3_4',
                nextQuest: 'tutorial_4_1',
                dialogue: {
                    offer: "Time for a BOSS FIGHT! Bosses are special:\n\n" +
                           "👹 **MORE HEALTH**: Takes multiple rounds to defeat\n" +
                           "⚡ **PHASES**: Gets stronger at certain HP thresholds\n" +
                           "💎 **BETTER LOOT**: Drops rare items and lots of gold\n" +
                           "🎵 **EPIC MUSIC**: Because they're that important!\n\n" +
                           "Use EVERYTHING you've learned:\n" +
                           "⚔️ Attack when you can\n" +
                           "🛡️ Defend when low on HP\n" +
                           "❤️ Use potions before it's too late\n\n" +
                           "Face the Tutorial Bandit Chief!",
                    progress: "Defeat the Tutorial Bandit Chief using Attack, Defend, and Items!",
                    complete: "INCREDIBLE! You defeated your first boss! In the main game, bosses guard powerful artifacts and progress gates. You're ready for anything!"
                },
                teachingPoints: ['Boss mechanics', 'Phases', 'Using all combat skills', 'Boss loot']
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 4: SURVIVAL & PEOPLE (5 quests)
    //  Theme: Hunger, thirst, energy, health, NPCs, quests
    //  Duration: 5-6 minutes
    // ═══════════════════════════════════════════════════════════════
    act4: {
        name: 'The Merchant\'s Life',
        theme: 'Survival, NPCs, quests, achievements',
        quests: {
            // 4.1 - Survival Basics
            tutorial_4_1: {
                id: 'tutorial_4_1',
                name: 'Staying Alive',
                description: 'Learn about hunger, thirst, energy, and health.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 4,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 21,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'consume', item_type: 'food', count: 1, current: 0, description: 'Eat food to restore hunger' },
                    { type: 'consume', item_type: 'water', count: 1, current: 0, description: 'Drink water to restore thirst' }
                ],
                rewards: { gold: 100, experience: 40, items: { bread: 10, water: 10 } },
                prerequisite: 'tutorial_3_5',
                nextQuest: 'tutorial_4_2',
                dialogue: {
                    offer: "Look at the RIGHT PANEL - your VITAL BARS:\n\n" +
                           "❤️ **HEALTH**: Damage taken. Hits 0 = death!\n" +
                           "🍖 **HUNGER**: Drains over ~5 days. Empty = health loss!\n" +
                           "💧 **THIRST**: Drains over ~3 days. Empty = health loss!\n" +
                           "😴 **ENERGY**: Drains with activity. Low = slower everything!\n\n" +
                           "To restore:\n" +
                           "🍞 **FOOD**: Bread, meat, fruits restore hunger\n" +
                           "💧 **WATER**: Water, wine, juice restore thirst\n" +
                           "🛏️ **SLEEP**: Rest at inns restores energy\n\n" +
                           "Open Inventory (I) and consume food and water now!",
                    progress: "Open Inventory, click on food/water, and use them.",
                    complete: "Never let yourself starve! Always carry supplies before long journeys. Inns let you rest to restore energy. Here's extra supplies!"
                },
                teachingPoints: ['All vital bars', 'Drain rates', 'Restoration methods', 'Death from starvation']
            },

            // 4.2 - Meet the People
            tutorial_4_2: {
                id: 'tutorial_4_2',
                name: 'Meet the People',
                description: 'Learn to interact with NPCs.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 4,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 22,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_people', completed: false, description: 'Open People panel (press P or click 👥)' }
                ],
                rewards: { gold: 50, experience: 25 },
                prerequisite: 'tutorial_4_1',
                nextQuest: 'tutorial_4_3',
                dialogue: {
                    offer: "NPCs bring the world to life! Open the PEOPLE panel:\n\n" +
                           "👥 **BOTTOM BAR**: Click the People button\n" +
                           "⌨️ **KEYBOARD**: Press 'P'\n\n" +
                           "You can:\n" +
                           "💬 **TALK**: Get quests, info, and build relationships\n" +
                           "🤝 **TRADE**: Some NPCs buy/sell items\n" +
                           "📜 **QUESTS**: Quest-givers show a ! icon\n" +
                           "❤️ **RELATIONSHIPS**: Help NPCs to unlock benefits\n\n" +
                           "Different NPCs in different locations offer unique services!",
                    progress: "Press P or click the 👥 People button to see who's here.",
                    complete: "Each location has different NPCs! Merchants, guards, quest-givers, and more. Building relationships unlocks better prices and special quests!"
                },
                teachingPoints: ['People button', 'P hotkey', 'NPC interactions', 'Quest givers', 'Relationships']
            },

            // 4.3 - Quest Log
            tutorial_4_3: {
                id: 'tutorial_4_3',
                name: 'Quest Tracking',
                description: 'Learn to manage quests with the Quest Log.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 4,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 23,
                difficulty: 'tutorial',
                objectives: [
                    // FIX HIGH-001: Use 'open_quest' (singular) to match highlight system action name
                    { type: 'ui_action', action: 'open_quest', completed: false, description: 'Open Quest Log (press Q or click 📜)' }
                ],
                rewards: { gold: 50, experience: 25 },
                prerequisite: 'tutorial_4_2',
                nextQuest: 'tutorial_4_4',
                dialogue: {
                    offer: "You've completed many quests! Track them with the QUEST LOG:\n\n" +
                           "📜 **BOTTOM BAR**: Click the Quests button\n" +
                           "⌨️ **KEYBOARD**: Press 'Q'\n\n" +
                           "The Quest Log shows:\n" +
                           "📋 **ACTIVE**: Quests you're working on\n" +
                           "✅ **COMPLETED**: Finished quests\n" +
                           "👁️ **TRACK**: Click eye icon to show on-screen\n" +
                           "📍 **OBJECTIVES**: What you need to do\n" +
                           "🎁 **REWARDS**: What you'll earn\n\n" +
                           "The QUEST TRACKER on your screen shows your tracked quest's current objective!",
                    progress: "Press Q or click the 📜 Quests button to view your quest log.",
                    complete: "The quest log helps you manage multiple quests! Track the most important one to see its wayfinder on the map. You can have many quests active at once!"
                },
                teachingPoints: ['Quest log button', 'Q hotkey', 'Active/completed tabs', 'Tracking quests', 'Quest tracker widget']
            },

            // 4.4 - Achievements
            tutorial_4_4: {
                id: 'tutorial_4_4',
                name: 'Glory and Honor',
                description: 'Learn about the Achievement system.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 4,
                actOrder: 4,
                chain: 'tutorial',
                chainOrder: 24,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_achievements', completed: false, description: 'Open Achievements (click 🏆)' }
                ],
                rewards: { gold: 75, experience: 30 },
                prerequisite: 'tutorial_4_3',
                nextQuest: 'tutorial_4_5',
                dialogue: {
                    offer: "Your accomplishments are remembered! Open ACHIEVEMENTS:\n\n" +
                           "🏆 **BOTTOM BAR**: Click the Trophy button\n\n" +
                           "Achievement categories:\n" +
                           "💰 **WEALTH**: Earning gold milestones\n" +
                           "🤝 **TRADING**: Trading accomplishments\n" +
                           "🗺️ **TRAVEL**: Exploration achievements\n" +
                           "🛡️ **SURVIVAL**: Staying alive\n" +
                           "🎒 **COLLECTION**: Gathering items\n" +
                           "⏰ **TIME**: Play time milestones\n" +
                           "✨ **SPECIAL**: Unique accomplishments\n\n" +
                           "Some achievements give BONUSES when unlocked!",
                    progress: "Click the 🏆 Achievements button to see what you've earned.",
                    complete: "You already have some achievements! When you unlock a new one, the game celebrates with a popup. Keep playing to earn them all!"
                },
                teachingPoints: ['Achievements button', 'Categories', 'Bonus rewards', 'Achievement popup']
            },

            // 4.5 - Transportation/Mounts
            tutorial_4_5: {
                id: 'tutorial_4_5',
                name: 'Faster Travel',
                description: 'Learn about mounts and transportation.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 4,
                actOrder: 5,
                chain: 'tutorial',
                chainOrder: 25,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_transport', completed: false, description: 'Open Transportation (press H or click 🐴)' }
                ],
                rewards: { gold: 100, experience: 40 },
                prerequisite: 'tutorial_4_4',
                nextQuest: 'tutorial_5_1',
                dialogue: {
                    offer: "Walking is slow! MOUNTS speed up travel:\n\n" +
                           "🐴 **BOTTOM BAR**: Click the Horse button\n" +
                           "⌨️ **KEYBOARD**: Press 'H'\n\n" +
                           "Transportation options:\n" +
                           "🚶 **ON FOOT**: Free but slow\n" +
                           "🐴 **HORSE**: Faster travel, costs gold to stable\n" +
                           "🚗 **CART**: Slower but carries more goods\n" +
                           "🐪 **CAMEL**: Best for desert regions\n\n" +
                           "Mounts reduce travel time and encounter chance! In the full game, buy mounts from stables in major cities.",
                    progress: "Press H or click the 🐴 Transportation button to see your options.",
                    complete: "Mounts are essential for long-distance trading! They reduce travel time significantly. Some even increase your carrying capacity!"
                },
                teachingPoints: ['Transportation button', 'H hotkey', 'Mount types', 'Travel time reduction', 'Carrying capacity']
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ACT 5: ADVANCED SYSTEMS (4 quests)
    //  Theme: Equipment, loot, saving, settings
    //  Duration: 4-5 minutes
    // ═══════════════════════════════════════════════════════════════
    act5: {
        name: 'Mastering the Trade',
        theme: 'Equipment, loot quality, saving, settings',
        quests: {
            // 5.1 - Equipment & Loot
            tutorial_5_1: {
                id: 'tutorial_5_1',
                name: 'Quality Matters',
                description: 'Learn about item rarity and equipment.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 5,
                actOrder: 1,
                chain: 'tutorial',
                chainOrder: 26,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_equipment', completed: false, description: 'Check equipment in Inventory' }
                ],
                rewards: { gold: 100, experience: 50, items: { rare_ring: 1 } },
                prerequisite: 'tutorial_4_5',
                nextQuest: 'tutorial_5_2',
                dialogue: {
                    offer: "Not all items are equal! ITEM RARITY matters:\n\n" +
                           "⚪ **COMMON**: Basic stats, everywhere\n" +
                           "🟢 **UNCOMMON**: Better stats, slight bonus\n" +
                           "🔵 **RARE**: Good stats, special effects\n" +
                           "🟣 **EPIC**: Great stats, powerful effects\n" +
                           "🟡 **LEGENDARY**: Best stats, unique abilities\n\n" +
                           "Equipment slots:\n" +
                           "⚔️ **WEAPON**: Attack damage\n" +
                           "🛡️ **ARMOR**: Defense\n" +
                           "💍 **ACCESSORIES**: Special bonuses\n\n" +
                           "Open Inventory and look at your equipment section!",
                    progress: "Open Inventory (I) and look at the equipment/gear section.",
                    complete: "Here's a RARE ring - see the blue color? Higher rarity = better stats. Hunt bosses and explore dungeons for rare loot!"
                },
                teachingPoints: ['Item rarity colors', 'Equipment slots', 'Stat bonuses', 'Where to find good loot']
            },

            // 5.2 - Save Your Progress
            tutorial_5_2: {
                id: 'tutorial_5_2',
                name: 'Save Your Progress',
                description: 'Learn to save and load your game.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 5,
                actOrder: 2,
                chain: 'tutorial',
                chainOrder: 27,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'ui_action', action: 'open_settings', completed: false, description: 'Open Settings/Menu (press ESC or click ⚙️)' }
                ],
                rewards: { gold: 50, experience: 25 },
                prerequisite: 'tutorial_5_1',
                nextQuest: 'tutorial_5_3',
                dialogue: {
                    offer: "Don't lose your progress! Open the SETTINGS MENU:\n\n" +
                           "⚙️ **BOTTOM BAR**: Click the gear button (first button!)\n" +
                           "⌨️ **KEYBOARD**: Press 'ESC'\n\n" +
                           "Save options:\n" +
                           "💾 **MANUAL SAVE**: Save whenever you want\n" +
                           "⚡ **AUTO-SAVE**: Game saves automatically (every 5 min)\n" +
                           "📂 **LOAD GAME**: Return to a previous save\n" +
                           "🔧 **SETTINGS**: Audio, display, gameplay options\n\n" +
                           "SAVE BEFORE dangerous dungeons or tough decisions!",
                    progress: "Press ESC or click the ⚙️ Settings button to see save options.",
                    complete: "Your progress is safe! Save often, especially before boss fights. You can load your save from the main menu if things go wrong!"
                },
                teachingPoints: ['Settings button', 'ESC hotkey', 'Manual save', 'Auto-save', 'Loading saves']
            },

            // 5.3 - The Story Awaits
            tutorial_5_3: {
                id: 'tutorial_5_3',
                name: 'The Threat',
                description: 'Learn about the main story and your goals.',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 5,
                actOrder: 3,
                chain: 'tutorial',
                chainOrder: 28,
                difficulty: 'tutorial',
                objectives: [
                    { type: 'talk', npc: 'tutorial_guide', location: 'tutorial_village', completed: false, description: 'Listen to Elara explain the main threat' }
                ],
                rewards: { gold: 100, experience: 50 },
                prerequisite: 'tutorial_5_2',
                nextQuest: 'tutorial_5_4',
                dialogue: {
                    offer: "You've learned the mechanics. Now hear the STORY:\n\n" +
                           "🧙 **MALACHAR**: An ancient wizard stirs in the Shadow Tower\n" +
                           "📜 **BLACK LEDGER**: A secret merchant cabal funds his return\n" +
                           "⚔️ **YOUR GOAL**: Grow wealthy and powerful enough to stop them!\n\n" +
                           "The main game has:\n" +
                           "🏰 **TWO END DUNGEONS**: Shadow Tower & Frozen Cave\n" +
                           "📜 **MAIN QUEST LINE**: Follow the Hooded Stranger's missions\n" +
                           "🗺️ **HUGE WORLD**: 40+ locations to explore\n" +
                           "👹 **MANY BOSSES**: Each drops powerful loot\n\n" +
                           "Your journey is just beginning!",
                    progress: "Listen to the tale of the realm's danger.",
                    complete: "Two major dungeons await! The Shadow Tower to defeat Malachar, and the Frozen Cave to stop the Black Ledger. You'll need gold, gear, and allies!"
                },
                teachingPoints: ['Main story', 'End game dungeons', 'Main quest', 'World size']
            },

            // 5.4 - Graduate (FINAL)
            tutorial_5_4: {
                id: 'tutorial_5_4',
                name: 'Graduation Day',
                description: 'Complete the tutorial and begin your real adventure!',
                giver: 'tutorial_guide',
                giverName: 'Merchant Elara',
                turnInNpc: 'tutorial_guide',
                turnInNpcName: 'Merchant Elara',
                turnInLocation: 'tutorial_village',
                location: 'tutorial_village',
                type: 'tutorial',
                act: 5,
                actOrder: 4,
                chain: 'tutorial',
                chainOrder: 29,
                difficulty: 'tutorial',
                isFinalTutorialQuest: true,
                objectives: [
                    { type: 'talk', npc: 'tutorial_guide', location: 'tutorial_village', completed: false, description: 'Speak with Elara one last time' }
                ],
                rewards: { gold: 500, experience: 200 },
                prerequisite: 'tutorial_5_3',
                nextQuest: null,
                unlocks: { achievement: 'tutorial_complete' },
                dialogue: {
                    offer: "You've learned EVERYTHING:\n\n" +
                           "✅ UI & Controls (Pause, Speed, Tooltips)\n" +
                           "✅ Trading (Market, Buy, Sell, Profit)\n" +
                           "✅ Travel (Map, Paths, Wayfinder, Exploration)\n" +
                           "✅ Combat (Attack, Defend, Items, Bosses)\n" +
                           "✅ Survival (Vitals, NPCs, Quests)\n" +
                           "✅ Advanced (Equipment, Saving, Story)\n\n" +
                           "Are you ready to enter the REAL WORLD?",
                    progress: "Return to Elara when you're ready to graduate.",
                    complete: "🎓 **CONGRATULATIONS!** 🎓\n\n" +
                             "You've completed your training! You'll now be transported to GREENDALE, where a mysterious Hooded Stranger awaits with your first real quest.\n\n" +
                             "May fortune favor you, merchant!\n\n" +
                             "**GO FORTH AND CONQUER!**"
                },
                teachingPoints: ['Summary of all learned', 'Transition to main game', 'First real quest']
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    getAllQuests() {
        const quests = [];
        for (let i = 0; i <= 5; i++) {
            const act = this[`act${i}`];
            if (act && act.quests) {
                quests.push(...Object.values(act.quests));
            }
        }
        return quests;
    },

    getQuest(questId) {
        for (let i = 0; i <= 5; i++) {
            const act = this[`act${i}`];
            if (act && act.quests && act.quests[questId]) {
                return act.quests[questId];
            }
        }
        return null;
    },

    getFirstQuestId() {
        return 'tutorial_0_1';
    },

    isTutorialQuest(questId) {
        return questId && questId.startsWith('tutorial_');
    },

    getFinalQuestId() {
        return 'tutorial_5_4';
    },

    getTotalQuests() {
        return this.getAllQuests().length;
    },

    getActInfo(actNumber) {
        const act = this[`act${actNumber}`];
        return act ? { name: act.name, theme: act.theme, questCount: Object.keys(act.quests).length } : null;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.TutorialQuests = TutorialQuests;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialQuests;
}
