// ═══════════════════════════════════════════════════════════════
// 🌟 INITIAL ENCOUNTER SYSTEM - the mysterious stranger at dawn
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - every story needs a beginning...
// ═══════════════════════════════════════════════════════════════
// When a new trader enters this world, they meet a hooded figure
// who speaks of shadows gathering and a destiny waiting to unfold
// ═══════════════════════════════════════════════════════════════

const InitialEncounterSystem = {
    // 🔧 CONFIG
    hasShownEncounter: false,
    encounterDelay: 1500, // ms after game start to show encounter

    // 📖 THE MYSTERIOUS STRANGER - your first encounter in this world
    mysteriousStranger: {
        id: 'mysterious_stranger_intro',
        name: 'Hooded Stranger',
        type: 'prophet',
        personality: 'mysterious',
        speakingStyle: 'cryptic',
        voice: 'onyx', // deep, ominous voice
        voiceInstructions: 'Speak slowly and deliberately. Your voice is ancient and knowing. Pause between sentences for dramatic effect.',
        context: 'introduction',
        location: 'the road',
        isEncounter: true,
        greetings: [
            "Ah... another soul drawn to this land by fate's cruel hand.",
            "The winds spoke of your arrival, young one.",
            "So... the prophecy stirs. Another piece moves upon the board."
        ]
    },

    // 🚀 INITIALIZE - called when game starts
    init() {
        console.log('🌟 InitialEncounterSystem: Awakened from the void, ready to haunt new souls... 🖤');
    },

    // 🎭 TRIGGER INITIAL ENCOUNTER - called after character creation
    triggerInitialEncounter(playerName, startLocation) {
        // 🖤 only trigger ONCE per new game
        if (this.hasShownEncounter) {
            console.log('🌟 Initial encounter already shown this session - no repeats, this darkness only strikes once 💀');
            return;
        }

        this.hasShownEncounter = true;
        console.log(`🌟 Preparing initial encounter for ${playerName} at ${startLocation}... destiny calls 🦇`);

        // 🌙 Delay for dramatic effect - let the player see the world first
        setTimeout(() => {
            this.showIntroductionSequence(playerName, startLocation);
        }, this.encounterDelay);
    },

    // 📖 INTRODUCTION SEQUENCE - the story begins
    showIntroductionSequence(playerName, startLocation) {
        // Pause time during this sequence
        if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
            TimeSystem.isPaused = true;
            this.timePausedByUs = true;
        }

        // 🖤 First, show a narrative text overlay
        const introText = this.getLocationIntro(startLocation);

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🌄 A New Dawn',
                content: `
                    <div style="font-style: italic; color: #c0c0d0; line-height: 1.8; font-size: 1.05em;">
                        <p style="margin-bottom: 1rem;">${introText}</p>
                        <p style="margin-bottom: 1rem;">You arrived here with little more than the clothes on your back and a handful of coins. The road behind you holds nothing but memories; the road ahead holds... everything.</p>
                        <p style="color: #a0a0c0;">As you take your first steps into the village square, you notice a hooded figure watching you from the shadows...</p>
                    </div>
                `,
                closeable: false, // 🖤 Must approach the stranger - no escape from destiny
                buttons: [
                    {
                        text: '🎭 Approach the Stranger',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.showStrangerEncounter(playerName);
                        }
                    }
                ]
            });
        } else {
            // 🖤 fallback - just unlock the quest
            this.unlockMainQuest();
        }
    },

    // 📍 Get location-specific intro text
    getLocationIntro(locationId) {
        const intros = {
            greendale: "The morning sun breaks through the mist over Greendale, a humble farming village nestled in the valley. Merchants have gathered in the small market square, their voices mingling with the bleating of sheep and the creak of wagon wheels.",
            ironhaven: "The forge fires of Ironhaven cast long shadows across the cobblestones. This mining town never truly sleeps - the rhythmic clang of hammers echoes through the streets even at dawn.",
            riverwood: "The River Elm whispers secrets as it flows past Riverwood. This peaceful settlement sits at a crossroads of trade, where fishermen's catches mingle with merchants' wares.",
            royal_capital: "The towering spires of the Royal Capital pierce the clouds. This is the heart of the realm, where fortunes are made and lost with each passing hour.",
            silk_road_inn: "The famous Silk Road Inn rises from the dusty crossroads, its windows glowing with warm light. Travelers from all corners of the realm gather here.",
            default: "The village awakens around you, its inhabitants beginning their daily routines. The smell of fresh bread mingles with the earthy scent of livestock."
        };

        return intros[locationId] || intros.default;
    },

    // 🎭 STRANGER ENCOUNTER - the mysterious figure speaks
    showStrangerEncounter(playerName) {
        const stranger = this.mysteriousStranger;
        const greeting = stranger.greetings[Math.floor(Math.random() * stranger.greetings.length)];

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎭 The Hooded Stranger',
                content: `
                    <p style="margin-bottom: 1rem; color: #a0a0c0;">A figure in a dark cloak steps forward from the shadows. You cannot see their face beneath the hood, but you sense ancient eyes studying you.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem;">"${greeting}"</p>
                    <p style="margin-bottom: 1rem;">The stranger's voice is like wind through dead leaves.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem;">"Listen well, ${playerName}... Darkness gathers in the north. The Shadow Tower, long dormant, stirs once more. The wizard Malachar... he has returned."</p>
                    <p style="color: #f0a0a0; margin-bottom: 1rem;">The stranger pauses, and for a moment you feel a chill run down your spine.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em;">"You are more than a simple trader, young one. Fate has brought you here for a reason. Seek out Elder Morin in this village. He will guide your first steps on this path."</p>
                `,
                closeable: false, // 🖤 Must accept quest - no escape from destiny
                buttons: [
                    {
                        text: '📚 Tutorial',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.showTutorial(playerName);
                        }
                    },
                    {
                        text: '✅ Accept Quest',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.showQuestAccepted(playerName);
                        }
                    }
                ]
            });
        }
    },

    // 📚 TUTORIAL - teach the player the basics (placeholder for now)
    showTutorial(playerName) {
        // 🖤 Tutorial will be expanded later - for now show basic tips and accept quest
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📚 Tutorial - Getting Started',
                content: `
                    <div style="line-height: 1.8;">
                        <p style="margin-bottom: 1rem; color: #90EE90; font-weight: bold;">Welcome to the world of trading, ${playerName}!</p>

                        <div style="background: rgba(100, 100, 150, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="margin-bottom: 0.5rem; color: #4fc3f7;"><strong>🎮 Basic Controls:</strong></p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>M</strong> - Open Market (buy/sell goods)</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>I</strong> - Open Inventory</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>T</strong> - Travel to new locations</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>Q</strong> - View your Quest Log</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>C</strong> - Character Sheet</p>
                        </div>

                        <div style="background: rgba(100, 150, 100, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="margin-bottom: 0.5rem; color: #90EE90;"><strong>💰 Trading Tips:</strong></p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Buy low in one town, sell high in another</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Watch for price differences between locations</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Keep some gold for emergencies</p>
                        </div>

                        <p style="color: #a0a0c0; font-style: italic; font-size: 0.9em;">More tutorial content coming soon! For now, speak with Elder Morin to continue your journey.</p>
                    </div>
                `,
                closeable: false, // 🖤 Must accept quest after tutorial
                buttons: [
                    {
                        text: '✅ Accept Quest & Begin',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.showQuestAccepted(playerName);
                        }
                    }
                ]
            });
        }
    },

    // 🎭 STRANGER REVEAL - who is this mysterious figure? (legacy - kept for story flow)
    showStrangerReveal(playerName) {
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎭 The Hooded Stranger',
                content: `
                    <p style="margin-bottom: 1rem;">The stranger chuckles softly, a sound like stones grinding together.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem;">"Who am I? A watcher. A keeper of memories. I have seen empires rise and fall, and I have seen the shadow grow and recede like the tide."</p>
                    <p style="margin-bottom: 1rem;">The hood tilts slightly, as if considering whether to say more.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem;">"Perhaps when you have proven yourself worthy, we shall meet again. Until then... trade well, ${playerName}. Build your fortune. You will need it for what is to come."</p>
                    <p style="color: #a0a0c0; font-style: italic;">Before you can respond, the stranger melts back into the shadows as if they were never there.</p>
                `,
                closeable: false, // 🖤 Must accept quest - no escape
                buttons: [
                    {
                        text: '✅ Accept Quest',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.showQuestAccepted(playerName);
                        }
                    }
                ]
            });
        }
    },

    // 📜 QUEST ACCEPTED - show confirmation and clear next steps
    showQuestAccepted(playerName) {
        // 🖤 Actually start the quest now
        this.completeEncounter(true);

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📜 Quest Accepted: A New Beginning',
                content: `
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 3rem;">📜</span>
                    </div>
                    <p style="margin-bottom: 1rem; color: #90EE90; font-weight: bold; text-align: center;">Quest Started!</p>
                    <div style="background: rgba(100, 100, 150, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.5rem; color: #fff;"><strong>Objectives:</strong></p>
                        <p style="color: #c0c0d0; margin-left: 1rem;">• Complete your first trade</p>
                        <p style="color: #c0c0d0; margin-left: 1rem;">• Speak with Elder Morin</p>
                    </div>
                    <p style="color: #a0a0c0; font-style: italic; font-size: 0.9em;">Tip: Look for the Elder in the village. NPCs with quests have a 📜 icon. Press 'Q' to open your Quest Log.</p>
                `,
                closeable: true,
                buttons: [
                    {
                        text: '🎮 Begin Adventure',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                        }
                    }
                ]
            });
        }
    },

    // ✅ COMPLETE ENCOUNTER - unlock the main quest and resume game
    completeEncounter(talkedToStranger) {
        console.log('🌟 Initial encounter complete - you chose your path, stranger talk:', talkedToStranger, '💀');

        // 📜 Unlock the main quest
        this.unlockMainQuest();

        // 🖤 Resume time if we paused it
        if (this.timePausedByUs && typeof TimeSystem !== 'undefined') {
            TimeSystem.isPaused = false;
            this.timePausedByUs = false;
        }

        // 📝 Add journal entry based on choice
        if (typeof addMessage === 'function') {
            if (talkedToStranger) {
                addMessage('📜 Quest Available: "A New Beginning" - Speak with Elder Morin');
                addMessage('🎭 The stranger\'s words echo in your mind... the Shadow Tower stirs.');
            } else {
                addMessage('📜 Quest Available: "A New Beginning" - Speak with Elder Morin');
            }
        }

        // 🏆 Track this moment for achievements
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.trackEvent) {
            AchievementSystem.trackEvent('initial_encounter_complete', { talkedToStranger });
        }

        console.log('🌟 Initial encounter ritual complete - main quest unlocked, your fate sealed 🖤');
    },

    // 📜 UNLOCK MAIN QUEST - actually START the prologue quest (not just discover it)
    unlockMainQuest() {
        if (typeof QuestSystem !== 'undefined') {
            // 🖤 Actually ASSIGN the quest so it becomes active, not just discovered
            if (QuestSystem.assignQuest) {
                const result = QuestSystem.assignQuest('main_prologue', { name: 'The Hooded Stranger' });
                if (result.success) {
                    console.log('🌟 main_prologue quest STARTED - the darkness beckons, no turning back 🦇');
                } else {
                    console.log('🌟 main_prologue assignment failed, darkness confused:', result.error, '💔');
                    // Fallback to discover if already active or other issue
                    if (QuestSystem.discoverQuest) {
                        QuestSystem.discoverQuest('main_prologue');
                    }
                }
            } else if (QuestSystem.discoverQuest) {
                // Fallback to old behavior if assignQuest doesn't exist
                QuestSystem.discoverQuest('main_prologue');
                console.log('🌟 main_prologue quest discovered (fallback) - old ritual, still works 🕯️');
            }

            // Update quest UI if available
            if (QuestSystem.updateQuestLogUI) {
                QuestSystem.updateQuestLogUI();
            }
        } else {
            console.warn('🌟 QuestSystem not available - could not unlock main quest');
        }
    },

    // 🎮 FOR TESTING - manually trigger the encounter
    testEncounter(playerName = 'Test Trader') {
        this.hasShownEncounter = false;
        this.triggerInitialEncounter(playerName, 'greendale');
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL ACCESS - for testing and debug commands
// ═══════════════════════════════════════════════════════════════
window.InitialEncounterSystem = InitialEncounterSystem;
window.testInitialEncounter = function(name) {
    InitialEncounterSystem.testEncounter(name);
};

// 🚀 INITIALIZE - awaken the system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        InitialEncounterSystem.init();
    });
} else {
    InitialEncounterSystem.init();
}

console.log('🌟 Initial Encounter System loaded - the mysterious stranger awaits new souls...');
