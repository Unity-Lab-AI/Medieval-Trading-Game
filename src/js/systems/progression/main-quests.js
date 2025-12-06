// ═══════════════════════════════════════════════════════════════
// 🖤 MAIN STORY QUESTS - The Shadow Rising & Black Ledger 💀
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// 35 Main Story Quests across 5 Acts
// Dual threat: Malachar (dark wizard) + Black Ledger (merchant conspiracy)
// ═══════════════════════════════════════════════════════════════

const MainQuests = {
    // ═══════════════════════════════════════════════════════════════
    // 🎭 STORY METADATA
    // ═══════════════════════════════════════════════════════════════
    storyInfo: {
        name: 'The Shadow Rising',
        totalActs: 5,
        questsPerAct: 7,
        totalQuests: 35,
        threats: ['malachar', 'black_ledger'],
        description: 'An ancient wizard stirs in the Shadow Tower while a merchant conspiracy funds his return. Only a clever trader can uncover the truth and stop both threats.'
    },

    // ═══════════════════════════════════════════════════════════════
    // 💰 WEALTH GATES - Difficulty Scaled
    // ═══════════════════════════════════════════════════════════════
    wealthGates: {
        // Base requirements (Normal difficulty)
        act1: { rank: 'vagrant', gold: 0 },
        act2: { rank: 'trader', gold: 5000 },
        act3: { rank: 'magnate', gold: 50000 },
        act4: { rank: 'tycoon', gold: 150000 },
        act5: { rank: 'baron', gold: 500000 },

        // Difficulty multipliers
        difficultyMultipliers: {
            easy: 0.6,
            normal: 1.0,
            hard: 1.5
        },

        // Get scaled gate requirement
        getGateRequirement(actNumber, difficulty = 'normal') {
            const gate = this[`act${actNumber}`];
            if (!gate) return { rank: 'vagrant', gold: 0 };

            const multiplier = this.difficultyMultipliers[difficulty] || 1.0;
            return {
                rank: gate.rank,
                gold: Math.floor(gate.gold * multiplier)
            };
        },

        // Check if player can access act
        canAccessAct(actNumber, playerWealth, difficulty = 'normal') {
            const requirement = this.getGateRequirement(actNumber, difficulty);
            return playerWealth >= requirement.gold;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📖 ACT 1: A TRADER'S BEGINNING (Quests 1-7)
    // Theme: Establish yourself, learn the world
    // Regions: Greendale (starter), Sunhaven (south)
    // ═══════════════════════════════════════════════════════════════
    act1: {
        name: 'A Trader\'s Beginning',
        theme: 'Establish yourself, learn the world',
        regions: ['greendale', 'sunhaven'],
        wealthGate: 0,

        quests: {
            // 🖤💀 NOTE: All giverName/turnInNpcName values are descriptive titles
            // The actual NPC's name is randomly generated when they spawn 💀

            // 1.1 - First Steps (Tutorial)
            act1_quest1: {
                id: 'act1_quest1',
                name: 'First Steps',
                description: 'Begin your journey as a trader. Make your first purchase and speak with the village Elder in Greendale to learn about the realm.',
                giver: 'elder',
                giverName: 'The Village Elder',
                turnInNpc: 'elder',
                turnInNpcName: 'The Village Elder',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 1,
                actOrder: 1,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'buy', count: 1, current: 0, description: 'Make your first purchase from any merchant' },
                    { type: 'talk', npc: 'elder', completed: false, description: 'Speak to the Village Elder in Greendale' }
                ],
                rewards: { gold: 25, reputation: 10, experience: 20 },
                prerequisite: null,
                nextQuest: 'act1_quest2',
                dialogue: {
                    offer: "Welcome to Greendale, young traveler. I sense great potential in you. But first, prove you understand the ways of trade - make a purchase from one of our merchants, then come speak with me.",
                    progress: "Have you made a purchase yet? The merchants eagerly await customers.",
                    complete: "Excellent! You have the instincts of a true trader. The Merchant Guild has taken notice of your potential - speak with Cassia the Merchant here in Greendale. She wishes to test your trading skills."
                }
            },

            // 1.2 - Establishing Trade
            act1_quest2: {
                id: 'act1_quest2',
                name: 'Establishing Trade',
                description: 'Prove your trading skills by completing profitable trades. The merchant guild is watching potential members.',
                giver: 'merchant',
                giverName: 'Cassia the Merchant',
                turnInNpc: 'merchant',
                turnInNpcName: 'Cassia the Merchant',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 1,
                actOrder: 2,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'trade', count: 3, current: 0, minValue: 50, description: 'Complete 3 trades worth at least 50 gold each' },
                    { type: 'talk', npc: 'merchant', location: 'greendale', completed: false, description: 'Return to Cassia the Merchant in Greendale' }
                ],
                rewards: { gold: 50, reputation: 15, experience: 30 },
                prerequisite: 'act1_quest1',
                nextQuest: 'act1_quest3',
                dialogue: {
                    offer: "Ah, the Elder spoke of you! The Merchant Guild keeps records of promising traders. Complete three substantial trades - each worth at least 50 gold - and you'll earn our notice. Return to me when you're done.",
                    progress: "Trading is the lifeblood of our realm. Keep at it! You need trades worth 50 gold or more - buy or sell, it all counts.",
                    complete: "Impressive work! The Guild acknowledges your skill. Elder Morin asked me to send you to him - he seems troubled by something. Go speak with him."
                }
            },

            // 1.3 - The Road South
            act1_quest3: {
                id: 'act1_quest3',
                name: 'The Road South',
                description: 'Elder Morin has heard troubling rumors from the southern port of Sunhaven. Travel there to investigate.',
                giver: 'elder',
                giverName: 'Elder Morin',
                turnInNpc: 'harbormaster',
                turnInNpcName: 'Harbormaster Elena',
                turnInLocation: 'sunhaven',
                location: 'greendale',
                type: 'main',
                act: 1,
                actOrder: 3,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'visit', location: 'sunhaven', completed: false, description: 'Travel to Sunhaven in the south' },
                    { type: 'talk', npc: 'harbormaster', location: 'sunhaven', completed: false, description: 'Speak with the Harbormaster in Sunhaven' }
                ],
                rewards: { gold: 40, reputation: 10, experience: 25 },
                prerequisite: 'act1_quest2',
                nextQuest: 'act1_quest4',
                dialogue: {
                    offer: "Ah, Cassia sent you! She speaks highly of your trading skills. But I have a different task for you. Strange whispers reach my ears from Sunhaven to the south. Ships arriving with sealed cargo, merchants who speak in hushed tones. I need someone I can trust to investigate. Travel there and speak with the Harbormaster - they see everything that passes through that port.",
                    progress: "The road south is safe enough. Sunhaven awaits. Find the Harbormaster when you arrive.",
                    complete: "You found me! Good. The Elder sent you, yes? I've been expecting someone to ask about the strange cargo... come, let me tell you what I've seen."
                }
            },

            // 1.4 - Harbor Dealings
            act1_quest4: {
                id: 'act1_quest4',
                name: 'Harbor Dealings',
                description: 'Learn the ways of coastal trade. Buy fish in Sunhaven and sell them for profit in Greendale.',
                giver: 'harbormaster',
                giverName: 'Harbormaster Elena',
                turnInNpc: 'harbormaster',
                turnInNpcName: 'Harbormaster Elena',
                turnInLocation: 'sunhaven',
                location: 'sunhaven',
                type: 'main',
                act: 1,
                actOrder: 4,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'collect', item: 'fish', count: 10, current: 0, description: 'Purchase 10 fish from Sunhaven' },
                    { type: 'visit', location: 'greendale', completed: false, description: 'Return to Greendale' },
                    { type: 'sell', item: 'fish', count: 10, current: 0, location: 'greendale', description: 'Sell the fish at a profit' }
                ],
                rewards: { gold: 75, reputation: 20, experience: 40 },
                prerequisite: 'act1_quest3',
                nextQuest: 'act1_quest5',
                dialogue: {
                    offer: "Ah, a trader from the inland! Let me teach you how coastal trade works. Buy fish here - they're cheap by the docks - then sell them in Greendale where they're rare. Simple arbitrage.",
                    progress: "The fish won't stay fresh forever. Complete the trade quickly!",
                    complete: "Ha! You've got the trader's instinct. Now, since you've proven trustworthy... there's something strange happening at the docks I need to tell you about."
                }
            },

            // 1.5 - Strange Cargo
            act1_quest5: {
                id: 'act1_quest5',
                name: 'Strange Cargo',
                description: 'The harbormaster has noticed suspicious shipments. Investigate the sealed crates in the warehouse.',
                giver: 'harbormaster',
                giverName: 'Harbormaster Elena',
                turnInNpc: 'harbormaster',
                turnInNpcName: 'Harbormaster Elena',
                turnInLocation: 'sunhaven',
                location: 'sunhaven',
                type: 'main',
                act: 1,
                actOrder: 5,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'explore', dungeon: 'sunhaven', rooms: 1, current: 0, description: 'Search the harbor warehouse' },
                    { type: 'collect', item: 'shipping_manifest', count: 1, current: 0, description: 'Find evidence of suspicious cargo' }
                ],
                rewards: { gold: 100, reputation: 25, experience: 50 },
                givesQuestItem: 'shipping_manifest',
                prerequisite: 'act1_quest4',
                nextQuest: 'act1_quest6',
                dialogue: {
                    offer: "Sealed crates arrive monthly, always at night, always paid for in advance. The manifest says 'agricultural supplies' but they're too heavy. I can't investigate - my position is too visible. But you could slip in...",
                    progress: "Be careful in that warehouse. The night guards don't ask questions.",
                    complete: "A manifest with coded entries! And look here - payments to something called 'The Black Ledger'. What is that? You should show this to Elder Morin."
                }
            },

            // 1.6 - The Missing Trader
            act1_quest6: {
                id: 'act1_quest6',
                name: 'The Missing Trader',
                description: 'A trader who asked too many questions about the cargo has gone missing. Find out what happened to him.',
                giver: 'guard',
                giverName: 'Guard Captain Theron',
                turnInNpc: 'guard',
                turnInNpcName: 'Guard Captain Theron',
                turnInLocation: 'sunhaven',
                location: 'sunhaven',
                type: 'main',
                act: 1,
                actOrder: 6,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'talk', npc: 'innkeeper', completed: false, description: 'Ask the innkeeper about the missing trader' },
                    { type: 'collect', item: 'traders_journal', count: 1, current: 0, description: 'Find the trader\'s abandoned journal' }
                ],
                rewards: { gold: 80, reputation: 20, experience: 45 },
                givesQuestItem: 'traders_journal',
                prerequisite: 'act1_quest5',
                nextQuest: 'act1_quest7',
                dialogue: {
                    offer: "Merchant Aldric vanished three days ago. He was investigating the same cargo you're asking about. His room at the inn was cleared out, but maybe he left something behind.",
                    progress: "Aldric was a good man. Find out what happened to him.",
                    complete: "His journal! The last entry mentions the Shadow Tower... and something called 'The Black Ledger' funding a dark project. This is bigger than missing cargo."
                }
            },

            // 1.7 - Elder's Warning (Act 1 Finale)
            act1_quest7: {
                id: 'act1_quest7',
                name: 'Elder\'s Warning',
                description: 'Return to Elder Morin with the evidence you\'ve gathered. The truth is darker than anyone imagined.',
                giver: 'guard',
                giverName: 'Guard Captain Theron',
                turnInNpc: 'elder',
                turnInNpcName: 'Elder Morin',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 1,
                actOrder: 7,
                chain: 'shadow_rising',
                difficulty: 'easy',
                objectives: [
                    { type: 'visit', location: 'greendale', completed: false, description: 'Return to Greendale' },
                    { type: 'talk', npc: 'elder', completed: false, description: 'Present evidence to Elder Morin' }
                ],
                rewards: { gold: 150, reputation: 30, experience: 75 },
                prerequisite: 'act1_quest6',
                nextQuest: 'act2_quest1',
                unlocks: { achievement: 'act1_complete' },
                dialogue: {
                    offer: "You've returned. I can see in your eyes that you've discovered something troubling. Show me what you've found.",
                    progress: "The journey back from Sunhaven should be safe. Come quickly.",
                    complete: "The Black Ledger... I had hoped this day would never come. They are a secret cabal of merchants who believe wealth is the only true power. And now they fund the return of Malachar, an ancient wizard who once nearly destroyed our realm. You must grow stronger - both in gold and allies - if we are to stop them. The next step lies east, in Ironforge, but you'll need substantial wealth to access the northern territories. Build your fortune, young trader. When you reach 5,000 gold, return to me."
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📖 ACT 2: WHISPERS OF CONSPIRACY (Quests 8-14)
    // Theme: Discover the Black Ledger, investigate their operations
    // Wealth Gate: 5,000 gold (scaled by difficulty)
    // Regions: Ironforge, Jade Harbor, Eastern territories
    // ═══════════════════════════════════════════════════════════════
    act2: {
        name: 'Whispers of Conspiracy',
        theme: 'Discover something is wrong, investigate',
        regions: ['ironforge_city', 'jade_harbor', 'smugglers_cove'],
        wealthGate: 5000,

        quests: {
            // 2.1 - Eastern Expansion
            act2_quest1: {
                id: 'act2_quest1',
                name: 'Eastern Expansion',
                description: 'With enough wealth to pay the gatehouse toll, travel to Ironforge City in the north to continue your investigation.',
                giver: 'elder',
                giverName: 'Elder Morin',
                turnInNpc: 'blacksmith',
                turnInNpcName: 'Forgemaster Grimjaw',
                turnInLocation: 'ironforge_city',
                location: 'greendale',
                type: 'main',
                act: 2,
                actOrder: 1,
                chain: 'shadow_rising',
                difficulty: 'medium',
                wealthGateCheck: true,
                objectives: [
                    { type: 'gold', amount: 5000, description: 'Accumulate 5,000 gold wealth' },
                    { type: 'visit', location: 'ironforge_city', completed: false, description: 'Travel to Ironforge City (pay northern gatehouse toll)' }
                ],
                rewards: { gold: 200, reputation: 35, experience: 100 },
                prerequisite: 'act1_quest7',
                nextQuest: 'act2_quest2',
                dialogue: {
                    offer: "You've built your fortune wisely. The northern gatehouse will now allow you passage. In Ironforge City, seek out the scholar Aldwin - he studies ancient texts and may know more about Malachar. But be careful - the Black Ledger has eyes everywhere.",
                    progress: "The road north requires gold and courage. You have both now.",
                    complete: "Ironforge! The great forges light the sky even at night. Now, find the scholar before our enemies find you."
                }
            },

            // 2.2 - The Forgemaster's Request
            act2_quest2: {
                id: 'act2_quest2',
                name: 'The Forgemaster\'s Request',
                description: 'The Ironforge blacksmiths need materials. Helping them will earn trust and access to information.',
                giver: 'blacksmith',
                giverName: 'Forgemaster Grimjaw',
                turnInNpc: 'blacksmith',
                turnInNpcName: 'Forgemaster Grimjaw',
                turnInLocation: 'ironforge_city',
                location: 'ironforge_city',
                type: 'main',
                act: 2,
                actOrder: 2,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'collect', item: 'iron_ore', count: 20, current: 0, description: 'Gather 20 iron ore' },
                    { type: 'collect', item: 'coal', count: 15, current: 0, description: 'Gather 15 coal' },
                    { type: 'talk', npc: 'blacksmith', completed: false, description: 'Deliver materials to Forgemaster' }
                ],
                rewards: { gold: 250, reputation: 40, experience: 120, items: { iron_sword: 1 } },
                prerequisite: 'act2_quest1',
                nextQuest: 'act2_quest3',
                dialogue: {
                    offer: "Stranger, you seek information? In Ironforge, we deal in metal, not secrets. But bring me ore and coal, and perhaps my tongue will loosen. The forges burn day and night now - someone is stockpiling weapons.",
                    progress: "The mines to the east hold what I need. Work for it.",
                    complete: "Fine materials! Here's a blade for your trouble. Now, about those weapons... they're being bought in bulk by merchants I don't recognize. They pay in strange coin - look, this seal. The scholar might know it."
                }
            },

            // 2.3 - Paper Trail
            act2_quest3: {
                id: 'act2_quest3',
                name: 'Paper Trail',
                description: 'Scholar Aldwin has found shipping documents with encoded messages. Help him decode the cipher.',
                giver: 'scholar',
                giverName: 'Scholar Aldwin',
                turnInNpc: 'scholar',
                turnInNpcName: 'Scholar Aldwin',
                turnInLocation: 'ironforge_city',
                location: 'ironforge_city',
                type: 'main',
                act: 2,
                actOrder: 3,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'collect', item: 'cipher_key', count: 1, current: 0, description: 'Find the cipher key in the old archive' },
                    { type: 'talk', npc: 'scholar', completed: false, description: 'Help Aldwin decode the documents' }
                ],
                rewards: { gold: 300, reputation: 45, experience: 150 },
                givesQuestItem: 'decoded_documents',
                prerequisite: 'act2_quest2',
                nextQuest: 'act2_quest4',
                dialogue: {
                    offer: "These documents use an old merchant cipher, but it's been modified. The original key is in the city archive - dusty scrolls no one has touched in decades. Find it, and we can read their secrets.",
                    progress: "The archive is in the old quarter. Watch for those who might follow you.",
                    complete: "The cipher breaks! Listen to this: 'The Ledger approves continued investment in Project Shadow. Ensure eastern supply lines remain secure.' The Black Ledger is real, and they're funding something called Project Shadow. The eastern supply lines... that means Jade Harbor."
                }
            },

            // 2.4 - The Jade Connection
            act2_quest4: {
                id: 'act2_quest4',
                name: 'The Jade Connection',
                description: 'The trail leads to Jade Harbor in the east. Investigate the silk trade as cover for your real mission.',
                giver: 'guard',
                giverName: 'Guard Captain Aldric',
                turnInNpc: 'merchant',
                turnInNpcName: 'Silk Merchant Li',
                turnInLocation: 'jade_harbor',
                location: 'ironforge_city',
                type: 'main',
                act: 2,
                actOrder: 4,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'visit', location: 'jade_harbor', completed: false, description: 'Travel to Jade Harbor' },
                    { type: 'trade', count: 2, current: 0, minValue: 100, description: 'Establish yourself as a silk trader (2 trades)' },
                    { type: 'talk', npc: 'merchant', completed: false, description: 'Gain the trust of local merchants' }
                ],
                rewards: { gold: 350, reputation: 50, experience: 175 },
                prerequisite: 'act2_quest3',
                nextQuest: 'act2_quest5',
                dialogue: {
                    offer: "I'll give you official papers as a silk inspector. It's perfect cover - you can ask questions about shipments without suspicion. Find out who controls the supply lines to the Black Ledger.",
                    progress: "Trade in silk, but keep your eyes open for darker cargo.",
                    complete: "The silk traders trust you now. Good. They speak of a middleman who handles 'special cargo' - operates from a place called Smuggler's Cove. That's our next target."
                }
            },

            // 2.5 - Smuggler's Debt
            act2_quest5: {
                id: 'act2_quest5',
                name: 'Smuggler\'s Debt',
                description: 'Infiltrate Smuggler\'s Cove and gain the trust of the underground network that supplies the Black Ledger.',
                giver: 'merchant',
                giverName: 'Informant Mei',
                turnInNpc: 'merchant',
                turnInNpcName: 'Smuggler Boss Vex',
                turnInLocation: 'smugglers_cove',
                location: 'jade_harbor',
                type: 'main',
                act: 2,
                actOrder: 5,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'visit', location: 'smugglers_cove', completed: false, description: 'Find Smuggler\'s Cove' },
                    { type: 'collect', item: 'smuggler_token', count: 1, current: 0, description: 'Earn a smuggler\'s token of trust' }
                ],
                rewards: { gold: 400, reputation: 55, experience: 200, items: { exotic_goods: 3 } },
                givesQuestItem: 'smuggler_token',
                prerequisite: 'act2_quest4',
                nextQuest: 'act2_quest6',
                dialogue: {
                    offer: "Smuggler's Cove is hidden behind the coastal caves. The smugglers won't trust an outsider... unless you prove useful. I know they need someone to move rare goods. Do this, and they'll give you a token. With that, you can ask questions.",
                    progress: "The caves are treacherous. Watch for pirates and worse.",
                    complete: "You have a smuggler's token! You're one of them now - at least on the surface. Time to find out where the gold flows."
                }
            },

            // 2.6 - Following the Gold
            act2_quest6: {
                id: 'act2_quest6',
                name: 'Following the Gold',
                description: 'Use your smuggler status to track the gold shipments funding the Black Ledger\'s operations.',
                giver: 'merchant',
                giverName: 'Smuggler Boss Vex',
                turnInNpc: 'merchant',
                turnInNpcName: 'Smuggler Boss Vex',
                turnInLocation: 'smugglers_cove',
                location: 'smugglers_cove',
                type: 'main',
                act: 2,
                actOrder: 6,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'collect', item: 'gold_shipment_records', count: 1, current: 0, description: 'Steal shipment records from the vault' },
                    { type: 'visit', location: 'jade_harbor', completed: false, description: 'Escape with the evidence' }
                ],
                rewards: { gold: 500, reputation: 60, experience: 250 },
                givesQuestItem: 'gold_shipment_records',
                prerequisite: 'act2_quest5',
                nextQuest: 'act2_quest7',
                dialogue: {
                    offer: "You want to know where the big money goes? There's a vault here - records of every major shipment. I owe the boss money, and that vault has my debts recorded too. Get me those records, and I'll tell you everything.",
                    progress: "The vault is guarded, but during the nightly card game, security is light.",
                    complete: "Perfect! My debts are gone, and look at these records! Gold flows west - massive amounts - to something called 'Project Shadow' near the western outpost. And here's a name: Malachar. The Black Ledger is funding a wizard's return!"
                }
            },

            // 2.7 - The Conspiracy Unveiled (Act 2 Finale)
            act2_quest7: {
                id: 'act2_quest7',
                name: 'The Conspiracy Unveiled',
                description: 'Return to Ironforge with irrefutable proof of the Black Ledger\'s conspiracy.',
                giver: 'merchant',
                giverName: 'Smuggler Boss Vex',
                turnInNpc: 'guard',
                turnInNpcName: 'Guard Captain Aldric',
                turnInLocation: 'ironforge_city',
                location: 'ironforge_city',
                type: 'main',
                act: 2,
                actOrder: 7,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'visit', location: 'ironforge_city', completed: false, description: 'Return to Ironforge City' },
                    { type: 'talk', npc: 'guard', completed: false, description: 'Present evidence to Captain Aldric' },
                    { type: 'talk', npc: 'scholar', completed: false, description: 'Confirm findings with Scholar Aldwin' }
                ],
                rewards: { gold: 750, reputation: 75, experience: 350 },
                prerequisite: 'act2_quest6',
                nextQuest: 'act3_quest1',
                unlocks: { achievement: 'act2_complete' },
                dialogue: {
                    offer: "You have evidence? Bring it immediately. If what you say is true, this threatens the entire realm.",
                    progress: "Make haste! The Black Ledger may already know you're onto them.",
                    complete: "By the forge! Gold shipments, coded messages, names and dates - this is proof that the Black Ledger exists and they're funding Malachar's return. The scholar confirms it - Malachar was an ancient wizard who nearly conquered the realm before being sealed away. If he returns... We must take this to the Royal Capital. But first, you'll need more resources. Build your wealth to 50,000 gold - you'll need influence where we're going."
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📖 ACT 3: THE DARK CONNECTION (Quests 15-21)
    // Theme: Link Malachar and Black Ledger, make crucial choices
    // Wealth Gate: 50,000 gold (scaled by difficulty)
    // Regions: Royal Capital, Frostholm, Northern territories
    // ═══════════════════════════════════════════════════════════════
    act3: {
        name: 'The Dark Connection',
        theme: 'Link Malachar and Black Ledger, choose sides',
        regions: ['royal_capital', 'frostholm'],
        wealthGate: 50000,

        quests: {
            // 3.1 - Royal Audience
            act3_quest1: {
                id: 'act3_quest1',
                name: 'Royal Audience',
                description: 'Your wealth and evidence grant you an audience with the royal court. Present the conspiracy to those in power.',
                giver: 'herald',
                giverName: 'Royal Herald Bartholomew',
                turnInNpc: 'noble',
                turnInNpcName: 'The Royal Court',
                turnInLocation: 'royal_capital',
                location: 'royal_capital',
                type: 'main',
                act: 3,
                actOrder: 1,
                chain: 'shadow_rising',
                difficulty: 'medium',
                wealthGateCheck: true,
                objectives: [
                    { type: 'gold', amount: 50000, description: 'Demonstrate wealth of 50,000 gold' },
                    { type: 'visit', location: 'royal_capital', completed: false, description: 'Travel to the Royal Capital' },
                    { type: 'talk', npc: 'noble', completed: false, description: 'Present evidence to the Royal Court' }
                ],
                rewards: { gold: 600, reputation: 80, experience: 400 },
                prerequisite: 'act2_quest7',
                nextQuest: 'act3_quest2',
                dialogue: {
                    offer: "A merchant of your standing deserves an audience. The court will hear your evidence - if it is as damning as Captain Aldric claims, the realm itself may be at stake.",
                    progress: "The Capital awaits. Dress appropriately.",
                    complete: "The evidence is compelling, but... some nobles seem uncomfortable. The Steward whispers that Black Ledger members may sit among the court itself. Trust no one completely."
                }
            },

            // 3.2 - The Noble's Game
            act3_quest2: {
                id: 'act3_quest2',
                name: 'The Noble\'s Game',
                description: 'Nobles play politics while the realm burns. Outmaneuver a suspected Black Ledger member at auction.',
                giver: 'steward',
                giverName: 'Steward Cornelius',
                turnInNpc: 'steward',
                turnInNpcName: 'Steward Cornelius',
                turnInLocation: 'royal_capital',
                location: 'royal_capital',
                type: 'main',
                act: 3,
                actOrder: 2,
                chain: 'shadow_rising',
                difficulty: 'medium',
                objectives: [
                    { type: 'gold', amount: 10000, spendable: true, description: 'Prepare 10,000 gold for auction' },
                    { type: 'talk', npc: 'merchant', completed: false, description: 'Win the auction against Lord Vance' }
                ],
                rewards: { gold: 800, reputation: 90, experience: 450, items: { rare_artifact: 1 } },
                prerequisite: 'act3_quest1',
                nextQuest: 'act3_quest3',
                dialogue: {
                    offer: "Lord Vance is bidding on a rare artifact - but I believe he wants to keep it from you. The artifact contains information about Malachar's sealing. Win the auction and you'll have leverage AND knowledge.",
                    progress: "The auction house is neutral ground. Even the Black Ledger won't act openly there.",
                    complete: "You outbid Vance! His fury was barely contained. This artifact - it's a key to the Frozen Cave in Frostholm, where another seal was placed on Malachar's power. We must investigate before they do."
                }
            },

            // 3.3 - Northern Intelligence
            act3_quest3: {
                id: 'act3_quest3',
                name: 'Northern Intelligence',
                description: 'Travel to the frozen north of Frostholm to find the second seal site mentioned in the artifact.',
                giver: 'captain',
                giverName: 'Captain Aldric',
                turnInNpc: 'elder',
                turnInNpcName: 'Northern Sages',
                turnInLocation: 'frostholm',
                location: 'royal_capital',
                type: 'main',
                act: 3,
                actOrder: 3,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'visit', location: 'frostholm', completed: false, description: 'Travel to Frostholm' },
                    { type: 'talk', npc: 'elder', completed: false, description: 'Consult the northern sages' }
                ],
                rewards: { gold: 700, reputation: 85, experience: 425 },
                prerequisite: 'act3_quest2',
                nextQuest: 'act3_quest4',
                dialogue: {
                    offer: "The north holds secrets older than our kingdom. The sages of Frostholm remember the old wars. Go to them - learn what the artifact reveals about Malachar's seals.",
                    progress: "The northern roads are treacherous in any season. Prepare well.",
                    complete: "The sages know much. Malachar was sealed by placing anchors of power in three locations: the Shadow Tower in the west, the Frozen Cave here in the north, and the Ruins of his own fortress. The Black Ledger has been breaking these seals!"
                }
            },

            // 3.4 - The Frost Lord's Shadow
            act3_quest4: {
                id: 'act3_quest4',
                name: 'The Frost Lord\'s Shadow',
                description: 'The Frozen Cave holds one of Malachar\'s seals. Dark creatures now guard it - remnants of the wizard\'s power.',
                giver: 'sage',
                giverName: 'Sage Helga',
                turnInNpc: 'sage',
                turnInNpcName: 'Sage Helga',
                turnInLocation: 'frostholm',
                location: 'frostholm',
                type: 'main',
                act: 3,
                actOrder: 4,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'visit', location: 'frozen_cave', completed: false, description: 'Enter the Frozen Cave' },
                    { type: 'explore', dungeon: 'frozen_cave', rooms: 6, completed: false, description: 'Navigate to the seal chamber' },
                    { type: 'collect', item: 'broken_seal_shard', count: 1, current: 0, description: 'Find evidence of the broken seal' }
                ],
                rewards: { gold: 1000, reputation: 100, experience: 500, items: { frozen_tear: 1 } },
                givesQuestItem: 'broken_seal_shard',
                prerequisite: 'act3_quest3',
                nextQuest: 'act3_quest5',
                dialogue: {
                    offer: "The Frozen Cave was peaceful once - a site of ancient power, carefully contained. Now dark creatures emerge from its depths. The seal has been tampered with. Enter, and bring proof of what you find.",
                    progress: "The cave is cold and full of shadows. Take warmth and weapons.",
                    complete: "The seal is shattered! This shard proves it was broken deliberately - you can see tool marks. Someone was here recently. The Frost Lord that emerged - it was a fragment of Malachar's power, freed when the seal broke. Two seals down... only one remains intact."
                }
            },

            // 3.5 - Breaking the Chain
            act3_quest5: {
                id: 'act3_quest5',
                name: 'Breaking the Chain',
                description: 'Intercept a Black Ledger supply convoy carrying resources to the final seal site.',
                giver: 'huntmaster',
                giverName: 'Huntmaster Erik',
                turnInNpc: 'huntmaster',
                turnInNpcName: 'Huntmaster Erik',
                turnInLocation: 'frostholm',
                location: 'frostholm',
                type: 'main',
                act: 3,
                actOrder: 5,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'defeat', enemy: 'black_ledger_guard', count: 5, current: 0, description: 'Defeat the convoy guards' },
                    { type: 'collect', item: 'supply_manifest', count: 1, current: 0, description: 'Capture the supply manifest' }
                ],
                rewards: { gold: 1200, reputation: 110, experience: 550 },
                givesQuestItem: 'supply_manifest',
                prerequisite: 'act3_quest4',
                nextQuest: 'act3_quest6',
                dialogue: {
                    offer: "My hunters spotted a convoy heading west - heavily guarded, flying no flags. That's Black Ledger, trying to stay hidden. Intercept them and we might learn where the final seal is.",
                    progress: "The convoy passes through hunter's territory. We know these woods.",
                    complete: "The manifest reveals everything! Supplies, gold, and workers - all heading to the Shadow Tower in the west. That's the final seal. They're close to freeing Malachar completely. But look here - a list of Black Ledger members. Names we recognize..."
                }
            },

            // 3.6 - The Choice (MAJOR DECISION POINT)
            act3_quest6: {
                id: 'act3_quest6',
                name: 'The Choice',
                description: 'A Black Ledger contact offers you a deal: wealth beyond measure, or righteous poverty. What will you choose?',
                giver: 'merchant', // Special: Black Ledger contact approaches you
                giverName: 'Lord Vance (Black Ledger)',
                turnInNpc: 'merchant',
                turnInNpcName: 'Lord Vance (Black Ledger)',
                turnInLocation: 'frostholm',
                location: 'frostholm',
                type: 'main',
                act: 3,
                actOrder: 6,
                chain: 'shadow_rising',
                difficulty: 'hard',
                isChoiceQuest: true, // Special flag for decision quests
                objectives: [
                    { type: 'decision', choices: ['refuse_bribe', 'accept_bribe'], completed: false, description: 'Make your choice' }
                ],
                rewards: {
                    // Rewards depend on choice - see choiceRewards
                },
                choiceRewards: {
                    refuse_bribe: { gold: 500, reputation: 150, experience: 600, title: 'Incorruptible' },
                    accept_bribe: { gold: 5000, reputation: -100, experience: 300, title: 'Black Ledger Associate' }
                },
                choiceConsequences: {
                    refuse_bribe: 'The Black Ledger becomes openly hostile. Some future quests become harder, but allies respect you more.',
                    accept_bribe: 'You gain wealth but lose trust. Some NPCs will refuse to help. An alternate path opens in Act 5.'
                },
                prerequisite: 'act3_quest5',
                nextQuest: 'act3_quest7',
                dialogue: {
                    offer: "So you've found the list. Clever trader. But consider - Malachar's return is inevitable now. Why fight? Join us. We'll control the new world order, and you'll be rich beyond imagination. Or refuse, and be crushed with the others. Choose wisely.",
                    progress: "Time to decide who you truly are.",
                    complete_refuse: "So be it. You've made a powerful enemy today. But perhaps... perhaps you've made the right choice. The realm needs heroes, not more profiteers.",
                    complete_accept: "Welcome to the Black Ledger. Your first payment is already deposited. We'll call on you when the time comes. For now, continue your... investigation. Just not too effectively."
                }
            },

            // 3.7 - War Council (Act 3 Finale)
            act3_quest7: {
                id: 'act3_quest7',
                name: 'War Council',
                description: 'Unite the realm\'s leaders to plan the assault on the remaining seal and the Black Ledger\'s stronghold.',
                giver: 'elder',
                giverName: 'Elder Morin',
                turnInNpc: 'elder',
                turnInNpcName: 'Elder Morin',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 3,
                actOrder: 7,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'visit', location: 'greendale', completed: false, description: 'Return to Greendale for the council' },
                    { type: 'talk', npc: 'elder', completed: false, description: 'Present findings to Elder Morin' },
                    { type: 'talk', npc: 'guard', completed: false, description: 'Coordinate with military leaders' },
                    { type: 'talk', npc: 'scholar', completed: false, description: 'Confirm magical assessments' }
                ],
                rewards: { gold: 2000, reputation: 175, experience: 750 },
                prerequisite: 'act3_quest6',
                nextQuest: 'act4_quest1',
                unlocks: { achievement: 'act3_complete' },
                dialogue: {
                    offer: "The pieces are in place. It's time to gather our allies and plan our counterattack. Return to Greendale - I've summoned the leaders of every major settlement.",
                    progress: "The war council awaits your testimony.",
                    complete: "With your evidence and allies, we have a chance. The Shadow Tower must be assaulted to prevent the final seal from breaking. But the Black Ledger's financial empire must also be destroyed - they can fund another attempt even if we stop Malachar. You'll need significant resources for what comes next. Build your wealth to 150,000 gold. When you're ready, we strike."
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📖 ACT 4: WAR OF COMMERCE (Quests 22-28)
    // Theme: Economic warfare, sabotage, alliance building
    // Wealth Gate: 150,000 gold (scaled by difficulty)
    // Regions: Western territories, Shadow Tower approaches
    // ═══════════════════════════════════════════════════════════════
    act4: {
        name: 'War of Commerce',
        theme: 'Economic warfare, sabotage, alliance building',
        regions: ['western_outpost', 'shadow_dungeon', 'ruins_of_eldoria'],
        wealthGate: 150000,

        quests: {
            // 4.1 - Economic Warfare
            act4_quest1: {
                id: 'act4_quest1',
                name: 'Economic Warfare',
                description: 'Use your trading expertise to crash the Black Ledger\'s commodity holdings.',
                giver: 'merchant',
                giverName: 'Merchant Guild Grandmaster',
                turnInNpc: 'merchant',
                turnInNpcName: 'Merchant Guild Grandmaster',
                turnInLocation: 'royal_capital',
                location: 'royal_capital',
                type: 'main',
                act: 4,
                actOrder: 1,
                chain: 'shadow_rising',
                difficulty: 'hard',
                wealthGateCheck: true,
                objectives: [
                    { type: 'gold', amount: 150000, description: 'Demonstrate wealth of 150,000 gold' },
                    { type: 'trade', count: 10, current: 0, minValue: 500, description: 'Execute 10 large trades to manipulate markets' },
                    { type: 'talk', npc: 'merchant', completed: false, description: 'Confirm market disruption' }
                ],
                rewards: { gold: 2500, reputation: 200, experience: 800 },
                prerequisite: 'act3_quest7',
                nextQuest: 'act4_quest2',
                dialogue: {
                    offer: "You have the wealth to move markets. The Black Ledger holds vast commodity reserves - iron, grain, luxury goods. Flood the market with competing goods, crash their prices, and we'll cripple their funding for Project Shadow.",
                    progress: "Every trade you make is a blow against our enemies.",
                    complete: "The Black Ledger's reserves have lost 30% of their value! Their funding for Malachar's return is severely damaged. Now we must press the advantage - the western passage awaits."
                }
            },

            // 4.2 - The Western Passage
            act4_quest2: {
                id: 'act4_quest2',
                name: 'The Western Passage',
                description: 'The western gatehouse guards the approach to the Shadow Tower. Pay the toll or fight your way through.',
                giver: 'guard',
                giverName: 'Captain Aldric',
                turnInNpc: 'guard',
                turnInNpcName: 'Captain Aldric',
                turnInLocation: 'western_outpost',
                location: 'ironforge_city',
                type: 'main',
                act: 4,
                actOrder: 2,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'choice', options: ['pay_50000', 'fight_through'], description: 'Choose: pay 50,000g toll or fight past guards' },
                    { type: 'visit', location: 'western_outpost', completed: false, description: 'Reach Western Watch outpost' }
                ],
                rewards: { gold: 1500, reputation: 180, experience: 700 },
                prerequisite: 'act4_quest1',
                nextQuest: 'act4_quest3',
                dialogue: {
                    offer: "The western gate is controlled by mercenaries - some are Black Ledger funded, some are just greedy. You can pay their toll or we can fight through. Either way, we need to reach the Western Outpost.",
                    progress: "The choice is yours. Gold or steel.",
                    complete: "The western territories are ours to traverse now. The outpost ahead is the last friendly settlement before the Shadow Tower. Prepare yourself."
                }
            },

            // 4.3 - Outpost Alliance
            act4_quest3: {
                id: 'act4_quest3',
                name: 'Outpost Alliance',
                description: 'Secure the Western Outpost as a staging ground for the assault on the Shadow Tower.',
                giver: 'sergeant',
                giverName: 'Sergeant Helena',
                turnInNpc: 'sergeant',
                turnInNpcName: 'Sergeant Helena',
                turnInLocation: 'western_outpost',
                location: 'western_outpost',
                type: 'main',
                act: 4,
                actOrder: 3,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'collect', item: 'military_supplies', count: 50, current: 0, description: 'Gather 50 units of military supplies' },
                    { type: 'talk', npc: 'sergeant', completed: false, description: 'Secure military alliance' }
                ],
                rewards: { gold: 3000, reputation: 220, experience: 900, items: { military_insignia: 1 } },
                givesQuestItem: 'military_insignia',
                prerequisite: 'act4_quest2',
                nextQuest: 'act4_quest4',
                dialogue: {
                    offer: "The outpost is undermanned and undersupplied. We've been forgotten out here while the lords play politics. Bring us supplies and we'll fight alongside you against whatever's in that tower.",
                    progress: "Medical supplies, weapons, food - anything helps.",
                    complete: "With these supplies, we can field a proper force. You've earned the loyalty of the Western Watch. When you're ready to assault the tower, we'll be at your side."
                }
            },

            // 4.4 - The Ancient Grove
            act4_quest4: {
                id: 'act4_quest4',
                name: 'The Ancient Grove',
                description: 'The druids of the Ancient Grove hold a key to the Shadow Tower. Navigate the Overgrown Crypt to earn their trust.',
                giver: 'sage',
                giverName: 'Druid Elder Thornwood',
                turnInNpc: 'sage',
                turnInNpcName: 'Druid Elder Thornwood',
                turnInLocation: 'druid_grove',
                location: 'druid_grove',
                type: 'main',
                act: 4,
                actOrder: 4,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'visit', location: 'forest_dungeon', completed: false, description: 'Enter the Overgrown Crypt' },
                    { type: 'explore', dungeon: 'forest_dungeon', rooms: 8, completed: false, description: 'Navigate to the heart of the crypt' },
                    { type: 'collect', item: 'shadow_key', count: 1, current: 0, description: 'Retrieve the Shadow Key' }
                ],
                rewards: { gold: 4000, reputation: 250, experience: 1000, items: { shadow_key: 1 } },
                givesQuestItem: 'shadow_key',
                prerequisite: 'act4_quest3',
                nextQuest: 'act4_quest5',
                dialogue: {
                    offer: "The Shadow Tower cannot be entered without the Shadow Key - we druids hid it centuries ago in the Overgrown Crypt. The crypt has become dangerous, overgrown with dark magic seeping from the tower. Retrieve the key, and we'll know you're worthy to face what lies within.",
                    progress: "The crypt tests those who enter. Face it with courage.",
                    complete: "The Shadow Key! You've done what no one has in centuries. The druids will stand with you. But know this - the key will only open the outer door. The inner sanctum requires something else: the light of righteousness or the darkness of greed."
                }
            },

            // 4.5 - Cutting the Purse Strings
            act4_quest5: {
                id: 'act4_quest5',
                name: 'Cutting the Purse Strings',
                description: 'Infiltrate the Black Ledger\'s secret vault and steal their war chest, crippling their operation permanently.',
                giver: 'merchant',
                giverName: 'Spy Master Celia',
                turnInNpc: 'merchant',
                turnInNpcName: 'Spy Master Celia',
                turnInLocation: 'royal_capital',
                location: 'royal_capital',
                type: 'main',
                act: 4,
                actOrder: 5,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'visit', location: 'royal_capital', completed: false, description: 'Meet with the Spy Master' },
                    { type: 'collect', item: 'vault_key', count: 1, current: 0, description: 'Obtain the vault key through subterfuge' },
                    { type: 'collect', item: 'war_chest_gold', count: 1, current: 0, description: 'Steal the war chest' }
                ],
                rewards: { gold: 10000, reputation: 275, experience: 1100 },
                prerequisite: 'act4_quest4',
                nextQuest: 'act4_quest6',
                dialogue: {
                    offer: "The Black Ledger keeps their emergency funds in a hidden vault beneath the capital. Without that gold, they can't pay mercenaries, bribe officials, or fund Malachar's rituals. I have a plan, but it requires someone they don't suspect - you.",
                    progress: "The vault is heavily guarded. Stealth, not strength, is required.",
                    complete: "Ten thousand gold pieces! The Black Ledger is nearly bankrupt. Their operations will grind to a halt while they scramble for funds. Now we find where they're hiding Malachar's ritual site."
                }
            },

            // 4.6 - The Ruins Discovered
            act4_quest6: {
                id: 'act4_quest6',
                name: 'The Ruins Discovered',
                description: 'Ancient texts reveal the location of Malachar\'s original fortress - the Ruins of Malachar.',
                giver: 'scholar',
                giverName: 'Scholar Aldwin',
                turnInNpc: 'scholar',
                turnInNpcName: 'Scholar Aldwin',
                turnInLocation: 'ironforge_city',
                location: 'ironforge_city',
                type: 'main',
                act: 4,
                actOrder: 6,
                chain: 'shadow_rising',
                difficulty: 'hard',
                objectives: [
                    { type: 'collect', item: 'ancient_map', count: 1, current: 0, description: 'Piece together the ancient map fragments' },
                    { type: 'visit', location: 'forest_dungeon', completed: false, description: 'Discover the Ruins of Malachar location' }
                ],
                rewards: { gold: 5000, reputation: 300, experience: 1200, items: { ancient_map: 1 } },
                givesQuestItem: 'ancient_map',
                prerequisite: 'act4_quest5',
                nextQuest: 'act4_quest7',
                unlocks: { location: 'forest_dungeon' },
                dialogue: {
                    offer: "The texts from the vault mention Malachar's original fortress - not the Shadow Tower, but ruins far to the north where he first rose to power. If there's a backup plan, it's there. I've found map fragments - help me piece them together.",
                    progress: "Each fragment reveals more of the path to darkness.",
                    complete: "The map is complete! The Ruins of Malachar lie beyond Frostholm, hidden in mountains no one has explored in centuries. We now have two targets: the Shadow Tower and the Ruins. Both must be assaulted to ensure Malachar cannot return."
                }
            },

            // 4.7 - Eve of Battle (Act 4 Finale)
            act4_quest7: {
                id: 'act4_quest7',
                name: 'Eve of Battle',
                description: 'Final preparations before the dual assault on the Shadow Tower and Ruins of Malachar.',
                giver: 'elder',
                giverName: 'Elder Morin',
                turnInNpc: 'elder',
                turnInNpcName: 'Elder Morin',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 4,
                actOrder: 7,
                chain: 'shadow_rising',
                difficulty: 'hard',
                isChoiceQuest: true,
                objectives: [
                    { type: 'talk', npc: 'elder', completed: false, description: 'Receive final briefing' },
                    { type: 'talk', npc: 'guard', completed: false, description: 'Confirm military readiness' },
                    { type: 'decision', choices: ['assault_shadow_tower', 'assault_ruins'], completed: false, description: 'Choose which stronghold to assault first' }
                ],
                rewards: { gold: 7500, reputation: 350, experience: 1500 },
                choiceConsequences: {
                    assault_shadow_tower: 'The Shadow Tower assault begins. The Ruins will be assaulted second.',
                    assault_ruins: 'The Ruins assault begins. The Shadow Tower will be assaulted second.'
                },
                prerequisite: 'act4_quest6',
                nextQuest: 'act5_quest1',
                unlocks: { achievement: 'act4_complete' },
                dialogue: {
                    offer: "Our forces are ready. Two strongholds remain: the Shadow Tower where the final seal is held, and the Ruins of Malachar where his original power sleeps. We cannot assault both at once. Which will you lead?",
                    progress: "Consider carefully. Both paths lead to battle.",
                    complete: "The choice is made. Our forces march at dawn. May fortune favor the bold. When you return, you'll need the resources of a trade baron - 500,000 gold or more - to fund the final confrontation. Prepare well."
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📖 ACT 5: THE FINAL RECKONING (Quests 29-35)
    // Theme: Assault both strongholds, end the threats, open Doom World
    // Wealth Gate: 500,000 gold (scaled by difficulty)
    // Regions: Shadow Tower, Ruins of Malachar, Doom World access
    // ═══════════════════════════════════════════════════════════════
    act5: {
        name: 'The Final Reckoning',
        theme: 'Assault both strongholds, end the threats',
        regions: ['shadow_dungeon', 'forest_dungeon'],
        wealthGate: 500000,

        quests: {
            // 5.1 - Into the Darkness
            act5_quest1: {
                id: 'act5_quest1',
                name: 'Into the Darkness',
                description: 'The assault begins. Breach the first dungeon stronghold.',
                giver: 'guard',
                giverName: 'War Council',
                turnInNpc: 'guard',
                turnInNpcName: 'War Council',
                turnInLocation: 'shadow_dungeon',
                location: 'western_outpost',
                type: 'main',
                act: 5,
                actOrder: 1,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                wealthGateCheck: true,
                objectives: [
                    { type: 'gold', amount: 500000, description: 'Demonstrate wealth of 500,000 gold' },
                    { type: 'visit', location: 'shadow_dungeon', completed: false, description: 'Breach the first stronghold' },
                    { type: 'explore', dungeon: 'shadow_dungeon', rooms: 5, completed: false, description: 'Clear the outer defenses' }
                ],
                rewards: { gold: 5000, reputation: 400, experience: 2000 },
                prerequisite: 'act4_quest7',
                nextQuest: 'act5_quest2',
                dialogue: {
                    offer: "The time has come. With your wealth funding our forces and your leadership guiding our strategy, we assault the first stronghold. Whatever waits within, we face it together.",
                    progress: "The darkness awaits. Steel yourself.",
                    complete: "The outer defenses are breached! But deeper within, something stirs. A guardian of immense power bars the path to the inner sanctum."
                }
            },

            // 5.2 - The First Guardian
            act5_quest2: {
                id: 'act5_quest2',
                name: 'The First Guardian',
                description: 'A powerful guardian protects the inner sanctum. Defeat it to proceed.',
                giver: 'guard',
                giverName: 'War Council',
                turnInNpc: 'guard',
                turnInNpcName: 'War Council',
                turnInLocation: 'shadow_dungeon',
                location: 'shadow_dungeon',
                type: 'main',
                act: 5,
                actOrder: 2,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                isBossQuest: true,
                objectives: [
                    { type: 'defeat', enemy: 'shadow_guardian', count: 1, current: 0, description: 'Defeat the Shadow Guardian' }
                ],
                rewards: { gold: 10000, reputation: 500, experience: 3000, items: { shadow_blade: 1 } },
                unlocks: { portal: 'doom_world_portal_1' },
                prerequisite: 'act5_quest1',
                nextQuest: 'act5_quest3',
                dialogue: {
                    offer: "The guardian awakens! This is no mere creature - it's a fragment of Malachar's power given form. Destroy it, and we break through to the inner sanctum.",
                    progress: "The guardian is powerful, but you are prepared.",
                    complete: "THE GUARDIAN FALLS! Behind it... a portal of swirling darkness. The soldiers recoil - this is a doorway to another realm. A world where Malachar won. You could enter... see what becomes of this world if we fail. Or continue the assault. The choice is yours."
                }
            },

            // 5.3 - Between Worlds (Optional - Doom World intro)
            act5_quest3: {
                id: 'act5_quest3',
                name: 'Between Worlds',
                description: 'The portal reveals a nightmarish alternate reality. Enter briefly to understand what awaits if you fail.',
                giver: 'sage',
                giverName: 'The Portal',
                turnInNpc: 'sage',
                turnInNpcName: 'The Portal',
                turnInLocation: 'shadow_dungeon',
                location: 'shadow_dungeon',
                type: 'main',
                act: 5,
                actOrder: 3,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                isOptional: true, // Can be skipped
                objectives: [
                    { type: 'visit', location: 'doom_shadow_dungeon', completed: false, description: 'Step through the portal (optional)' },
                    { type: 'explore', dungeon: 'doom_world', rooms: 1, completed: false, description: 'Witness the Doom World' }
                ],
                rewards: { gold: 2500, reputation: 250, experience: 1500 },
                unlocks: { knowledge: 'doom_world_lore' },
                prerequisite: 'act5_quest2',
                nextQuest: 'act5_quest4',
                dialogue: {
                    offer: "The portal whispers of another world - one where the darkness won. Step through and witness what becomes of this realm if Malachar returns. Knowledge of the enemy is power.",
                    progress: "The doom world awaits... if you dare.",
                    complete: "You've seen it - the burned villages, the enslaved peoples, the endless shadow. That future must not come to pass. You understand now why we must succeed. Return to the assault."
                }
            },

            // 5.4 - The Second Stronghold
            act5_quest4: {
                id: 'act5_quest4',
                name: 'The Second Stronghold',
                description: 'With one stronghold breached, assault the second to prevent any chance of Malachar\'s return.',
                giver: 'guard',
                giverName: 'War Council',
                turnInNpc: 'guard',
                turnInNpcName: 'War Council',
                turnInLocation: 'forest_dungeon',
                location: 'western_outpost',
                type: 'main',
                act: 5,
                actOrder: 4,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                objectives: [
                    { type: 'visit', location: 'forest_dungeon', completed: false, description: 'Assault the second stronghold' },
                    { type: 'explore', dungeon: 'forest_dungeon', rooms: 6, completed: false, description: 'Navigate the ancient ruins' }
                ],
                rewards: { gold: 7500, reputation: 450, experience: 2500 },
                prerequisite: 'act5_quest3',
                nextQuest: 'act5_quest5',
                dialogue: {
                    offer: "One stronghold is breached, but Malachar's power is split between two locations. We must assault the other before his followers can consolidate. Move quickly!",
                    progress: "The second stronghold awaits.",
                    complete: "The ruins are older than anything we've seen - this is where Malachar first rose to power centuries ago. Another guardian bars the way. Another portal waits beyond."
                }
            },

            // 5.5 - The Second Guardian
            act5_quest5: {
                id: 'act5_quest5',
                name: 'The Second Guardian',
                description: 'The second guardian is even more powerful - an echo of Malachar himself.',
                giver: 'guard',
                giverName: 'War Council',
                turnInNpc: 'guard',
                turnInNpcName: 'War Council',
                turnInLocation: 'forest_dungeon',
                location: 'forest_dungeon',
                type: 'main',
                act: 5,
                actOrder: 5,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                isBossQuest: true,
                objectives: [
                    { type: 'defeat', enemy: 'malachar_echo', count: 1, current: 0, description: 'Defeat the Echo of Malachar' }
                ],
                rewards: { gold: 15000, reputation: 600, experience: 4000, items: { malachar_robe: 1 } },
                unlocks: { portal: 'doom_world_portal_2' },
                prerequisite: 'act5_quest4',
                nextQuest: 'act5_quest6',
                dialogue: {
                    offer: "This guardian is different - it bears Malachar's face, speaks with his voice. It's a fragment of his soul, left to guard this place. Destroy it!",
                    progress: "Face the echo of ancient evil.",
                    complete: "THE ECHO SHATTERS! With both guardians defeated, the connection between worlds weakens. Another portal to the Doom World opens here - you now have two paths into that nightmare realm. But first, we must end the threat in THIS world."
                }
            },

            // 5.6 - The Black Ledger Falls
            act5_quest6: {
                id: 'act5_quest6',
                name: 'The Black Ledger Falls',
                description: 'With the magical threats contained, turn on the human conspirators. The Black Ledger must answer for their crimes.',
                giver: 'herald',
                giverName: 'Royal Herald',
                turnInNpc: 'noble',
                turnInNpcName: 'The King',
                turnInLocation: 'royal_capital',
                location: 'royal_capital',
                type: 'main',
                act: 5,
                actOrder: 6,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                objectives: [
                    { type: 'visit', location: 'royal_capital', completed: false, description: 'Return to the Royal Capital' },
                    { type: 'talk', npc: 'noble', completed: false, description: 'Present evidence to the King' },
                    { type: 'collect', item: 'black_ledger_seized', count: 1, current: 0, description: 'Witness the arrests' }
                ],
                rewards: { gold: 20000, reputation: 700, experience: 5000 },
                prerequisite: 'act5_quest5',
                nextQuest: 'act5_quest7',
                dialogue: {
                    offer: "With the guardians destroyed and Malachar's power broken, the Black Ledger has lost its protectors. The King demands an accounting. Bring your evidence to the throne room.",
                    progress: "Justice awaits the conspirators.",
                    complete: "Lord Vance and thirty-seven other Black Ledger members are arrested. Their assets are seized, their operations dissolved. The conspiracy that nearly doomed our world ends in chains and disgrace. But one threat remains..."
                }
            },

            // 5.7 - The Shadow's End (Main Story Finale)
            act5_quest7: {
                id: 'act5_quest7',
                name: 'The Shadow\'s End',
                description: 'Enter Malachar\'s sanctum and end the ancient threat once and for all.',
                giver: 'elder',
                giverName: 'Elder Morin',
                turnInNpc: 'elder',
                turnInNpcName: 'Elder Morin',
                turnInLocation: 'greendale',
                location: 'greendale',
                type: 'main',
                act: 5,
                actOrder: 7,
                chain: 'shadow_rising',
                difficulty: 'legendary',
                isBossQuest: true,
                isFinalBoss: true,
                objectives: [
                    { type: 'visit', location: 'shadow_dungeon', completed: false, description: 'Enter Malachar\'s sanctum' },
                    { type: 'explore', dungeon: 'shadow_dungeon', rooms: 10, completed: false, description: 'Reach the heart of darkness' },
                    { type: 'defeat', enemy: 'malachar', count: 1, current: 0, description: 'Defeat Malachar' }
                ],
                rewards: {
                    gold: 50000,
                    reputation: 1000,
                    experience: 10000,
                    items: { blade_of_virtue: 1, dark_staff: 1 }
                },
                prerequisite: 'act5_quest6',
                nextQuest: null, // Story complete!
                unlocks: {
                    achievement: 'main_story_complete',
                    achievement: 'shadow_slayer',
                    feature: 'doom_world_permanent'
                },
                dialogue: {
                    offer: "You've accomplished what heroes of legend could not. The Black Ledger is destroyed, the guardians are defeated. But Malachar himself still stirs in his sanctum, drawing on what remains of his power. End this. End him. You are our final hope.",
                    progress: "The sanctum awaits. May the light guide you.",
                    complete: "MALACHAR IS DESTROYED! His dark form dissolves, his power scatters to the winds. The realm is saved! But... the portals to the Doom World remain. That alternate reality still exists - a grim reminder of what could have been. Some say there are riches to be found there, for those brave enough to venture into nightmare. The main story ends, but your legend continues. Trade, explore, grow wealthy... and perhaps, one day, bring hope even to the world of doom."
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════

    getAllQuests() {
        const allQuests = {};
        for (let i = 1; i <= 5; i++) {
            const act = this[`act${i}`];
            if (act && act.quests) {
                Object.assign(allQuests, act.quests);
            }
        }
        return allQuests;
    },

    getQuestById(questId) {
        return this.getAllQuests()[questId];
    },

    getActQuests(actNumber) {
        const act = this[`act${actNumber}`];
        return act ? act.quests : {};
    },

    getQuestCount() {
        return Object.keys(this.getAllQuests()).length;
    },

    getCurrentAct(completedQuests = []) {
        // Determine which act the player is on based on completed quests
        for (let i = 5; i >= 1; i--) {
            const actQuests = Object.keys(this.getActQuests(i));
            const completedInAct = actQuests.filter(q => completedQuests.includes(q));
            if (completedInAct.length > 0) {
                // If all quests in this act are complete, return next act
                if (completedInAct.length === actQuests.length && i < 5) {
                    return i + 1;
                }
                return i;
            }
        }
        return 1; // Default to Act 1
    }
};

// 🖤 Export for use in quest-system.js 💀
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainQuests;
}

// Make available globally
window.MainQuests = MainQuests;

console.log('🖤 MainQuests loaded: 35 quests across 5 acts ready for the darkness 💀');
