// ═══════════════════════════════════════════════════════════════
// INITIAL ENCOUNTER - where your nightmare begins
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const InitialEncounterSystem = {
    // 🔧 CONFIG
    hasShownEncounter: false,
    hasShownTutorialChoice: false, // 🖤 Track if we've shown the tutorial Yes/No popup
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
    // 🖤 Now shows Tutorial Yes/No popup FIRST (if enabled in settings) 💀
    triggerInitialEncounter(playerName, startLocation) {
        // 🖤 only trigger ONCE per new game
        if (this.hasShownEncounter) {
            console.log('🌟 Initial encounter already shown this session - no repeats, this darkness only strikes once 💀');
            return;
        }

        this.hasShownEncounter = true;
        console.log(`🌟 Preparing initial encounter for ${playerName} at ${startLocation}... destiny calls 🦇`);

        // 🖤 Store params for later use
        this._pendingPlayerName = playerName;
        this._pendingStartLocation = startLocation;

        // 🖤 Check if tutorial popup should be shown FIRST (before anything else) 💀
        if (this._shouldShowTutorialOnStart()) {
            console.log('🌟 Tutorial popup enabled - showing FIRST before anything else 📚');
            this._showTutorialChoiceFirst();
        } else {
            console.log('🌟 Tutorial popup disabled in settings - skipping directly to game 💀');
            // 🦇 Wait for rank-up celebration to finish BEFORE showing intro
            this._waitForRankUpThenShowIntro();
        }
    },

    // 🖤 Check if we should show the tutorial popup on start 💀
    _shouldShowTutorialOnStart() {
        // Check SettingsPanel settings first
        if (typeof SettingsPanel !== 'undefined' && SettingsPanel.currentSettings?.gameplay) {
            return SettingsPanel.currentSettings.gameplay.showTutorialOnStart !== false;
        }

        // Fallback: check localStorage directly
        try {
            const saved = localStorage.getItem('tradingGameGameplaySettings');
            if (saved) {
                const settings = JSON.parse(saved);
                return settings.showTutorialOnStart !== false;
            }
        } catch (e) {
            console.warn('🌟 Could not read gameplay settings from localStorage:', e);
        }

        // Default: show tutorial popup
        return true;
    },

    // 🖤 Show tutorial Yes/No choice FIRST before rank celebration 💀
    _showTutorialChoiceFirst() {
        if (this.hasShownTutorialChoice) return;
        this.hasShownTutorialChoice = true;

        // Pause time during this choice (🖤 store previous speed for proper restoration 💀)
        if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
            this._previousSpeedForTutorial = TimeSystem.currentSpeed || 'NORMAL';
            TimeSystem.setSpeed('PAUSED');
        }

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📚 Would You Like a Tutorial?',
                content: `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: #c0c0d0; margin-bottom: 1.5rem; font-size: 1.1em;">
                            Welcome, brave merchant! Would you like to learn the basics of trading and survival?
                        </p>
                        <p style="color: #888; font-size: 0.9em; font-style: italic;">
                            You can change this in Settings → Gameplay if you don't want to see this every time.
                        </p>
                    </div>
                `,
                closeable: false, // 🖤 Must choose - no escape from this decision
                buttons: [
                    {
                        text: '❌ No, Just Start',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            console.log('🌟 Player chose NO tutorial - diving straight into the chaos 💀');
                            // 🖤 Proceed with normal flow (rank celebration, then intro)
                            this._proceedAfterTutorialChoice();
                        }
                    },
                    {
                        text: '✅ Yes, Show Tutorial',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            console.log('🌟 Player chose YES to tutorial - enlightening the newbie 📚');
                            // 🖤 Show tutorial, then proceed
                            this._showQuickTutorial(() => {
                                this._proceedAfterTutorialChoice();
                            });
                        }
                    }
                ]
            });
        } else {
            // 🖤 No ModalSystem - proceed directly
            this._proceedAfterTutorialChoice();
        }
    },

    // 🖤 Quick tutorial content (shown if player says Yes) 💀
    _showQuickTutorial(onComplete) {
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📚 Quick Tutorial',
                content: `
                    <div style="line-height: 1.8;">
                        <div style="background: rgba(100, 100, 150, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="margin-bottom: 0.5rem; color: #4fc3f7;"><strong>🎮 Basic Controls:</strong></p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>SPACE</strong> - Pause/Unpause time</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>M</strong> - Open Market (at Royal Capital only)</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>I</strong> - Open Inventory</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>T</strong> - Travel to new locations</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>Q</strong> - View your Quest Log</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• <strong>O</strong> - Talk to People at your location</p>
                        </div>

                        <div style="background: rgba(100, 150, 100, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="margin-bottom: 0.5rem; color: #90EE90;"><strong>💰 Trading Tips:</strong></p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Buy low in one location, sell high in another</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Different locations specialize in different goods</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Watch your hunger and thirst - they drain over time!</p>
                        </div>

                        <div style="background: rgba(150, 100, 100, 0.2); padding: 1rem; border-radius: 8px;">
                            <p style="margin-bottom: 0.5rem; color: #f48fb1;"><strong>⚠️ Survival:</strong></p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Hunger depletes over 5 days</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Thirst depletes over 3 days</p>
                            <p style="color: #c0c0d0; margin-left: 1rem;">• Buy food and water to stay alive!</p>
                        </div>
                    </div>
                `,
                closeable: true,
                buttons: [
                    {
                        text: '🎮 Got It!',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            if (typeof onComplete === 'function') {
                                onComplete();
                            }
                        }
                    }
                ]
            });
        } else if (typeof onComplete === 'function') {
            onComplete();
        }
    },

    // 🖤 Proceed after tutorial choice - resume normal game flow 💀
    _proceedAfterTutorialChoice() {
        // Resume time to previous speed if we paused it (🖤 restore actual speed, not just 'NORMAL' 💀)
        if (this._previousSpeedForTutorial && typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed(this._previousSpeedForTutorial);
            this._previousSpeedForTutorial = null;
        }

        // 🦇 Wait for rank-up celebration to finish BEFORE showing intro
        this._waitForRankUpThenShowIntro();
    },

    // 🖤 Wait for rank-up overlay to be dismissed, then show intro 💀
    _waitForRankUpThenShowIntro() {
        const rankUpOverlay = document.querySelector('.rank-up-celebration');

        if (rankUpOverlay) {
            console.log('🌟 Rank-up celebration active - waiting before showing intro... 🕯️');

            // 🖤 Watch for the overlay to be removed from DOM
            const observer = new MutationObserver((mutations, obs) => {
                if (!document.querySelector('.rank-up-celebration')) {
                    obs.disconnect();
                    console.log('🌟 Rank-up dismissed - now showing intro sequence 💀');
                    // 🦇 Small delay for smooth transition after rank-up fades
                    setTimeout(() => {
                        this.showIntroductionSequence(this._pendingPlayerName, this._pendingStartLocation);
                    }, 800);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // 🖤 Fallback: if observer fails, show intro after 5 seconds anyway
            setTimeout(() => {
                observer.disconnect();
                if (!document.querySelector('.initial-encounter-shown')) {
                    console.log('🌟 Fallback timeout - showing intro anyway 💀');
                    this.showIntroductionSequence(this._pendingPlayerName, this._pendingStartLocation);
                }
            }, 5500);
        } else {
            // 🖤 No rank-up showing - use normal delay
            setTimeout(() => {
                this.showIntroductionSequence(this._pendingPlayerName, this._pendingStartLocation);
            }, this.encounterDelay);
        }
    },

    // 📖 INTRODUCTION SEQUENCE - the story begins
    showIntroductionSequence(playerName, startLocation) {
        // Pause time during this sequence (🖤 store previous speed for proper restoration 💀)
        if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
            this._previousSpeedForIntro = TimeSystem.currentSpeed || 'NORMAL';
            TimeSystem.setSpeed('PAUSED');
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
    // 🖤💀 Now with API TTS! The first voice players hear sets the tone! 💀
    async showStrangerEncounter(playerName) {
        const stranger = this.mysteriousStranger;
        const greeting = stranger.greetings[Math.floor(Math.random() * stranger.greetings.length)];

        // 🖤💀 Generate API dialogue for the stranger - this is the FIRST voice players hear!
        let strangerDialogue = this._getDefaultStrangerDialogue(playerName, greeting);
        let useAPIVoice = false;

        try {
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                console.log('🎭 Generating hooded stranger dialogue via API...');

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    stranger,
                    `The player ${playerName} has just arrived in this world. Give them a cryptic, ominous introduction about the darkness gathering and Malachar's return. Tell them to seek Elder Morin. Be mysterious and prophetic.`,
                    [], // No chat history - first encounter
                    {
                        action: 'introduction',
                        context: 'first_encounter',
                        playerName: playerName,
                        isFirstVoice: true // 🖤 Flag for special handling
                    }
                );

                if (response && response.text) {
                    strangerDialogue = response.text;
                    useAPIVoice = true;
                    console.log('🎭 API dialogue generated successfully!');
                }
            }
        } catch (e) {
            console.warn('🎭 API dialogue failed, using fallback:', e);
            // Keep default dialogue
        }

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎭 The Hooded Stranger',
                content: `
                    <p style="margin-bottom: 1rem; color: #a0a0c0;">A figure in a dark cloak steps forward from the shadows. You cannot see their face beneath the hood, but you sense ancient eyes studying you.</p>
                    <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem; line-height: 1.6;">"${strangerDialogue}"</p>
                    <p style="color: #f0a0a0; margin-top: 1rem;">The stranger's voice fades like mist in morning light...</p>
                `,
                closeable: false, // 🖤 Must accept quest - no escape from destiny
                buttons: [
                    {
                        text: '✅ Accept Quest',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            // 🖤 Accept quest FIRST, then ask about tutorial 💀
                            this.showQuestAcceptedThenTutorialOption(playerName);
                        }
                    }
                ]
            });

            // 🖤💀 Play TTS AFTER modal is shown so player can read along
            if (useAPIVoice && typeof NPCVoiceChatSystem !== 'undefined') {
                setTimeout(() => {
                    NPCVoiceChatSystem.playVoice(strangerDialogue, stranger.voice || 'onyx');
                }, 500); // Small delay for modal to render
            }
        }
    },

    // 🖤💀 Fallback dialogue if API fails
    _getDefaultStrangerDialogue(playerName, greeting) {
        return `${greeting} Listen well, ${playerName}... Darkness gathers in the north. The Shadow Tower, long dormant, stirs once more. The wizard Malachar... he has returned. You are more than a simple trader, young one. Fate has brought you here for a reason. Seek out Elder Morin in this village. He will guide your first steps on this path.`;
    },

    // 🖤 Accept quest and show quest panel (tutorial already shown at game start) 💀
    showQuestAcceptedThenTutorialOption(playerName) {
        // 🖤 Actually start the quest NOW
        this.completeEncounter(true);

        // 🖤 Use unified QuestInfoPanel if available 💀
        // NOTE: Tutorial prompt no longer shows here - it's now shown FIRST at game start
        if (typeof QuestSystem !== 'undefined' && QuestSystem.showQuestInfoPanel) {
            // Show unified quest panel for act1_quest1 (First Steps - the new starting quest)
            QuestSystem.showQuestInfoPanel('act1_quest1', {
                isNewQuest: true
                // 🖤 No onClose callback needed - tutorial was already offered at start
            });
        }
        // 🖤 No more tutorial prompt here - it's handled by _showTutorialChoiceFirst() at game start
    },

    // 🖤 Show tutorial Yes/No prompt 💀
    _showTutorialPrompt(playerName) {
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📚 Tutorial',
                content: `
                    <p style="color: #a0a0c0; text-align: center; margin-bottom: 1rem;">Would you like to see the tutorial?</p>
                    <p style="color: #666; text-align: center; font-size: 0.9em; font-style: italic;">(Tutorial coming soon!)</p>
                `,
                closeable: true,
                buttons: [
                    {
                        text: '❌ No Thanks',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            // 🖤 Just close - player can start playing
                        }
                    },
                    {
                        text: '✅ Yes Please',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            // 🖤 Tutorial not implemented yet - just show a message 💀
                            if (typeof addMessage === 'function') {
                                addMessage('📚 Tutorial coming soon! For now, explore the game and have fun! 🖤', 'info');
                            }
                        }
                    }
                ]
            });
        }
    },

    // 📚 TUTORIAL - teach the player the basics
    // 🖤 Now shown AFTER quest is accepted, just shows tips then closes 💀
    showTutorial(playerName) {
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

                        <p style="color: #a0a0c0; font-style: italic; font-size: 0.9em;">Tip: Look for the Elder in the village. NPCs with quests have a 📜 icon. Press 'Q' to open your Quest Log.</p>
                    </div>
                `,
                closeable: true, // 🖤 Quest already accepted, can close anytime
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

        // 🖤 Resume time to previous speed if we paused it (restore actual speed, not just 'NORMAL' 💀)
        if (this._previousSpeedForIntro && typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed(this._previousSpeedForIntro);
            this._previousSpeedForIntro = null;
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
    // 🖤 Waits for rank-up celebration to be dismissed first so popups don't overlap 💀
    unlockMainQuest() {
        // 🦇 Check if rank-up celebration is showing - wait for it to be dismissed
        const rankUpOverlay = document.querySelector('.rank-up-celebration');
        if (rankUpOverlay) {
            console.log('🌟 Rank-up celebration active - waiting for dismissal before showing quest... 🕯️');

            // 🖤 Watch for the overlay to be removed from DOM
            const observer = new MutationObserver((mutations, obs) => {
                if (!document.querySelector('.rank-up-celebration')) {
                    obs.disconnect();
                    console.log('🌟 Rank-up dismissed - now showing main quest 💀');
                    // 🦇 Small delay for smooth transition
                    setTimeout(() => this._doUnlockMainQuest(), 500);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // 🖤 Fallback: if somehow observer fails, unlock after 5 seconds anyway
            setTimeout(() => {
                observer.disconnect();
                if (!this._mainQuestUnlocked) {
                    console.log('🌟 Fallback timeout - unlocking main quest anyway 💀');
                    this._doUnlockMainQuest();
                }
            }, 5000);
        } else {
            // 🖤 No rank-up showing - proceed immediately
            this._doUnlockMainQuest();
        }
    },

    // 🖤 Internal: Actually unlock the main quest 💀
    _doUnlockMainQuest() {
        if (this._mainQuestUnlocked) return; // 🦇 Prevent double-unlock
        this._mainQuestUnlocked = true;

        if (typeof QuestSystem !== 'undefined') {
            // 🖤 Actually ASSIGN the quest so it becomes active, not just discovered
            // 🦇 act1_quest1 is "First Steps" - the new starting quest from MainQuests
            if (QuestSystem.assignQuest) {
                const result = QuestSystem.assignQuest('act1_quest1', { name: 'Elder Morin' });
                if (result.success) {
                    console.log('🌟 act1_quest1 (First Steps) quest STARTED - the darkness beckons 🦇');
                    // 🖤 Auto-track main quest so wayfinder shows where to go 💀
                    if (QuestSystem.trackQuest) {
                        QuestSystem.trackQuest('act1_quest1');
                        console.log('🎯 act1_quest1 auto-tracked - wayfinder activated');
                    }
                } else {
                    // 🖤 If quest is already active, that's fine - just track it for wayfinder! 💀
                    if (result.error === 'Quest already active') {
                        console.log('🌟 act1_quest1 already active - just need to track it 🦇');
                        if (QuestSystem.trackQuest) {
                            QuestSystem.trackQuest('act1_quest1');
                            console.log('🎯 act1_quest1 tracked - wayfinder activated');
                        }
                    } else {
                        // 🖤 Actual error - log it
                        console.warn('🌟 act1_quest1 assignment failed:', result.error);
                        if (QuestSystem.discoverQuest) {
                            QuestSystem.discoverQuest('act1_quest1');
                        }
                    }
                }
            } else if (QuestSystem.discoverQuest) {
                // Fallback to old behavior if assignQuest doesn't exist
                QuestSystem.discoverQuest('act1_quest1');
                console.log('🌟 act1_quest1 quest discovered (fallback) 🕯️');
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
// 🌍 GLOBAL ACCESS - for testing and debooger commands 🦇
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
