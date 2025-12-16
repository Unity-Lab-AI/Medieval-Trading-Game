// 
// INITIAL ENCOUNTER - where your nightmare begins
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const InitialEncounterSystem = {
    //  CONFIG
    hasShownEncounter: false,
    hasShownTutorialChoice: false, // Track if we've shown the tutorial Yes/No popup
    hasCompletedIntro: false, // Track when intro sequence fully complete (blocks city events until done)
    hasAcceptedInitialQuest: false, // Track if player accepted the initial quest
    strangerSpawnedAtLocation: null, // Track where we spawned the stranger as fallback NPC
    encounterDelay: 500, // FAST - show encounter quickly after game start!


    // 🔧 FIX: Single shared MutationObserver for rank-up watching
    // Prevents the performance issue of multiple observers on document.body
    _rankUpObserver: null,
    _rankUpCallbacks: [],

    /**
     * 🔧 Shared utility: Wait for rank-up celebration to dismiss, then run callback
     * Uses a single MutationObserver instead of creating duplicates
     * @param {Function} callback - Function to call after rank-up is dismissed
     * @param {number} fallbackMs - Fallback timeout in ms (default 5000)
     */
    _waitForRankUpDismissal(callback, fallbackMs = 5000) {
        const rankUpOverlay = document.querySelector('.rank-up-celebration');

        if (!rankUpOverlay) {
            // No rank-up showing - run callback immediately
            callback();
            return;
        }

        console.log('🌟 Rank-up celebration active - queueing callback... 🕯️');

        // Add callback to queue
        this._rankUpCallbacks.push(callback);

        // Create shared observer if not exists
        if (!this._rankUpObserver) {
            this._rankUpObserver = new MutationObserver((mutations, obs) => {
                if (!document.querySelector('.rank-up-celebration')) {
                    obs.disconnect();
                    this._rankUpObserver = null;
                    console.log('🌟 Rank-up dismissed - running queued callbacks 💀');

                    // Run all queued callbacks with small delay
                    const callbacks = [...this._rankUpCallbacks];
                    this._rankUpCallbacks = [];
                    setTimeout(() => {
                        callbacks.forEach(cb => cb());
                    }, 500);
                }
            });

            this._rankUpObserver.observe(document.body, { childList: true, subtree: true });
        }

        // Fallback timeout
        setTimeout(() => {
            if (this._rankUpObserver) {
                this._rankUpObserver.disconnect();
                this._rankUpObserver = null;
            }
            // Run any remaining callbacks
            const callbacks = [...this._rankUpCallbacks];
            this._rankUpCallbacks = [];
            if (callbacks.length > 0) {
                console.log('🌟 Fallback timeout - running callbacks anyway 💀');
                callbacks.forEach(cb => cb());
            }
        }, fallbackMs);
    },

    //  THE MYSTERIOUS STRANGER - your first encounter in this world
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

    //  INITIALIZE - called when game starts
    init() {
        console.log('🌟 InitialEncounterSystem: Awakened from the void, ready to haunt new souls... 🖤');
    },

    // ═══════════════════════════════════════════════════════════════
    // PRE-CACHE REMOVED - Now uses normal NPC workflow via PeoplePanel.sendGreeting()
    // The hooded stranger encounter goes through the same Ollama + TTS flow as all NPCs
    // ═══════════════════════════════════════════════════════════════

    // Stub for backwards compatibility (called from game.js)
    async preCacheStrangerDialogue(playerName = 'Traveler') {
        // No-op - pre-caching removed, normal NPC workflow handles everything
        console.log('🎭 Pre-caching disabled - hooded stranger will use normal NPC workflow');
        return Promise.resolve();
    },

    // ═══════════════════════════════════════════════════════════════
    //  TRIGGER INITIAL ENCOUNTER - Called BEFORE world generation!
    //  This is the NEW flow:
    //  1. Show tutorial choice modal (world doesn't exist yet)
    //  2. Player chooses: Full Tutorial / Skip / Quick Tips
    //  3. Based on choice, load appropriate world
    //  4. Transition to PLAYING state
    //  5. Start appropriate quest chain
    // ═══════════════════════════════════════════════════════════════
    triggerInitialEncounter(playerName, startLocation) {
        //  only trigger ONCE per new game
        if (this.hasShownEncounter) {
            console.log('🌟 Initial encounter already shown this session - no repeats, this darkness only strikes once 💀');
            return;
        }

        this.hasShownEncounter = true;
        console.log(`🌟 Preparing initial encounter for ${playerName}... world not loaded yet, awaiting choice 🦇`);

        //  Store params for later use
        this._pendingPlayerName = playerName;
        this._pendingStartLocation = startLocation;

        //  Check if tutorial popup should be shown FIRST (before anything else)
        if (this._shouldShowTutorialOnStart()) {
            console.log('🌟 Tutorial popup enabled - showing BEFORE world generation! 📚');
            this._showTutorialChoiceFirst();
        } else {
            console.log('🌟 Tutorial popup disabled in settings - loading main world directly 💀');
            //  Skip tutorial entirely - load main world and start normal game
            this._startMainGameDirectly();
        }
    },

    //  Check if we should show the tutorial popup on start 
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

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL CHOICE MODAL - Shown BEFORE world generation!
    //  This is the critical decision point. No world exists yet.
    //  Player's choice determines which world gets loaded.
    // ═══════════════════════════════════════════════════════════════
    _showTutorialChoiceFirst() {
        if (this.hasShownTutorialChoice) return;
        this.hasShownTutorialChoice = true;

        //  Time isn't running yet because game state isn't PLAYING
        //  But pause anyway in case something started early
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.pauseForInterrupt) {
                TimeSystem.pauseForInterrupt('tutorial_choice');
            } else if (!TimeSystem.isPaused) {
                this._previousSpeedForTutorial = TimeSystem.currentSpeed || 'NORMAL';
                TimeSystem.setSpeed('PAUSED');
            }
        }

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '📚 Would You Like a Tutorial?',
                content: `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: #c0c0d0; margin-bottom: 1rem; font-size: 1.1em;">
                            Welcome, brave merchant! How would you like to start?
                        </p>
                        <div style="text-align: left; background: rgba(50,50,70,0.5); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="color: #4fc3f7; margin-bottom: 0.5rem;"><strong>🎓 Full Tutorial (15-25 min):</strong></p>
                            <p style="color: #aaa; font-size: 0.9em; margin-left: 1rem;">Interactive quest-based training in a separate tutorial world. Learn trading, combat, travel, and more!</p>
                        </div>
                        <p style="color: #888; font-size: 0.85em; font-style: italic;">
                            You can replay the tutorial anytime from Settings.
                        </p>
                    </div>
                `,
                closeable: false,
                buttons: [
                    {
                        text: 'Skip Tutorial',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            console.log('🌟 Player chose SKIP - loading main world directly 💀');
                            //  Load main game world and start normal flow
                            this._startMainGameDirectly();
                        }
                    },
                    {
                        text: 'Yes, Full Tutorial',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            console.log('🌟 Player chose FULL TUTORIAL - loading tutorial world! 📚');
                            //  Start full tutorial - loads tutorial world instead of main
                            this._startFullTutorial();
                        }
                    },
                    {
                        text: 'Quick Tips Only',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            console.log('🌟 Player chose QUICK TIPS - showing tips then main game 📋');
                            //  Show quick tutorial, then load main world
                            this._showQuickTutorial(() => {
                                this._startMainGameDirectly();
                            });
                        }
                    }
                ]
            });
        } else {
            //  No ModalSystem - proceed directly to main game
            this._startMainGameDirectly();
        }
    },

    //  Quick tutorial content (shown if player says Yes) 
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

    // ═══════════════════════════════════════════════════════════════
    //  START FULL TUTORIAL - Load tutorial world and begin training
    //  This is called when player clicks "Yes, Full Tutorial"
    //  CRITICAL: World doesn't exist yet - we load ONLY tutorial world
    // ═══════════════════════════════════════════════════════════════
    _startFullTutorial() {
        console.log('🌟 Starting FULL TUTORIAL mode - loading tutorial world...');

        //  Resume time first
        if (typeof TimeSystem !== 'undefined' && TimeSystem.resumeFromInterrupt) {
            TimeSystem.resumeFromInterrupt('tutorial_choice');
        }

        //  Set tutorial flag BEFORE anything else
        if (typeof game !== 'undefined') {
            game.inTutorial = true;
            game.tutorialCompleted = false;
            game.tutorialSkipped = false;
        }

        //  Initialize TutorialManager if needed
        if (typeof TutorialManager !== 'undefined') {
            if (!TutorialManager._initialized && TutorialManager.init) {
                TutorialManager.init();
            }

            // ═══════════════════════════════════════════════════════════════
            //  TUTORIAL TIME - Reset time to Day 1, 8:00 AM for tutorial
            //  Tutorial runs in its own isolated time bubble
            //  When tutorial completes, time resets again for main game
            // ═══════════════════════════════════════════════════════════════
            if (typeof TimeMachine !== 'undefined') {
                // Store the fact we're in tutorial time mode
                TimeMachine._tutorialTimeActive = true;
                // Reset to Day 1, 8:00 AM (480 minutes from midnight)
                TimeMachine.currentDay = 1;
                TimeMachine.currentHour = 8;
                TimeMachine.currentMinute = 0;
                TimeMachine.totalMinutes = 480; // 8 hours = 480 minutes
                TimeMachine.updateTimeDisplay?.();
                console.log('🎓 Tutorial time initialized: Day 1, 8:00 AM');
            }

            //  TutorialManager.startTutorial() will:
            //  1. Load tutorial world locations
            //  2. Register tutorial NPCs
            //  3. Teleport player to tutorial_village
            //  4. Assign first quest
            //  5. Show welcome message
            TutorialManager.startTutorial();

            //  NOW transition to PLAYING state (world exists now)
            if (typeof changeState !== 'undefined' && typeof GameState !== 'undefined') {
                changeState(GameState.PLAYING);
            }

            //  Update UI for tutorial location
            if (typeof updateMarketButtonVisibility !== 'undefined') {
                updateMarketButtonVisibility();
            }

            // Update location display
            if (typeof updateLocationInfo !== 'undefined') {
                updateLocationInfo();
            }

            //  FORCE re-render of travel panel map with tutorial background
            //  Must happen AFTER game.inTutorial is set
            console.log('🎓 Forcing travel panel map render for tutorial mode...');
            console.log('🎓 game.inTutorial =', game?.inTutorial);

            if (typeof TravelPanelMap !== 'undefined') {
                // Force immediate render
                if (TravelPanelMap.render) {
                    TravelPanelMap.render();
                }
                // Also delayed render to catch any async issues
                setTimeout(() => {
                    if (TravelPanelMap.render) TravelPanelMap.render();
                    console.log('🎓 Travel panel map re-rendered for tutorial');
                }, 100);
                setTimeout(() => {
                    if (TravelPanelMap.render) TravelPanelMap.render();
                }, 500);
            }

            // Also update GameWorldRenderer if it exists
            if (typeof GameWorldRenderer !== 'undefined') {
                // Force backdrop refresh first (switches to tutorial backdrop)
                if (GameWorldRenderer.forceRefreshBackdrop) {
                    setTimeout(() => {
                        console.log('🎓 Refreshing GameWorldRenderer backdrop for tutorial...');
                        GameWorldRenderer.forceRefreshBackdrop();
                    }, 100);
                }
                // Then re-render with tutorial locations
                if (GameWorldRenderer.render) {
                    setTimeout(() => {
                        console.log('🎓 Re-rendering GameWorldRenderer for tutorial...');
                        GameWorldRenderer.render();
                    }, 300);
                }
            }

            addMessage('🎓 Welcome to the Tutorial! Follow the quests to learn the basics.');
        } else {
            //  TutorialManager not available - fall back to main game
            console.error('🌟 TutorialManager not found! Falling back to main game.');
            this._startMainGameDirectly();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  START MAIN GAME DIRECTLY - Skip tutorial, load main world
    //  This is called when player clicks "Skip Tutorial" or "Quick Tips"
    //  CRITICAL: World doesn't exist yet - we load main GameWorld here
    // ═══════════════════════════════════════════════════════════════
    _startMainGameDirectly() {
        console.log('🌟 Starting MAIN GAME - loading main world...');

        //  Resume time
        if (typeof TimeSystem !== 'undefined' && TimeSystem.resumeFromInterrupt) {
            TimeSystem.resumeFromInterrupt('tutorial_choice');
        }

        //  Set flags - NOT in tutorial
        if (typeof game !== 'undefined') {
            game.inTutorial = false;
            game.tutorialCompleted = false;
            game.tutorialSkipped = true;
        }

        // dispatch tutorial-skipped event - achievement system was fucking
        // WAITING for this and it never came. five sessions of "why are
        // achievements firing?" and THIS was one of the missing pieces.
        // without this event, achievement system never enables itself properly.
        document.dispatchEvent(new CustomEvent('tutorial-skipped', {
            detail: { timestamp: Date.now(), reason: 'player_choice' }
        }));
        console.log('🚫 tutorial-skipped event dispatched - achievements can enable now');

        //  NOW initialize the main game world (this is where it was before)
        if (typeof initializeGameWorld !== 'undefined') {
            initializeGameWorld();
        }

        //  Transition to PLAYING state
        if (typeof changeState !== 'undefined' && typeof GameState !== 'undefined') {
            changeState(GameState.PLAYING);
        }

        //  Update market visibility for starting location
        if (typeof updateMarketButtonVisibility !== 'undefined') {
            updateMarketButtonVisibility();
        }

        addMessage('You start with some basic supplies for your journey.');

        //  Wait for rank-up celebration, then show Hooded Stranger intro
        this._waitForRankUpThenShowIntro();
    },

    //  Legacy method - redirects to new flow
    _proceedAfterTutorialChoice() {
        this._startMainGameDirectly();
    },

    //  Wait for rank-up overlay to be dismissed, then show intro
    // 🔧 FIX: Now uses shared _waitForRankUpDismissal to avoid duplicate MutationObservers
    _waitForRankUpThenShowIntro() {
        this._waitForRankUpDismissal(() => {
            // Small delay for smooth transition
            setTimeout(() => {
                this.showIntroductionSequence(this._pendingPlayerName, this._pendingStartLocation);
            }, 300);
        }, 5500);
    },

    //  INTRODUCTION SEQUENCE - the story begins
    //  Now uses unified PeoplePanel - combines location intro with stranger encounter in ONE panel! 
    showIntroductionSequence(playerName, startLocation) {
        //  Pause time during this sequence using interrupt system 
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.pauseForInterrupt) {
                TimeSystem.pauseForInterrupt('intro_sequence');
            } else if (!TimeSystem.isPaused) {
                this._previousSpeedForIntro = TimeSystem.currentSpeed || 'NORMAL';
                TimeSystem.setSpeed('PAUSED');
            }
        }

        //  Build the combined narrative (location intro + stranger approach)
        const locationIntro = this.getLocationIntro(startLocation);
        const fullNarrative = `${locationIntro}\n\nYou arrived here with little more than the clothes on your back and a handful of coins. The road behind you holds nothing but memories; the road ahead holds... everything.\n\nAs you take your first steps into the village square, you notice a hooded figure watching you from the shadows...`;

        //  Skip the "A New Dawn" modal - go straight to Hooded Stranger encounter! 
        // The narrative text will appear in the People Panel before the stranger speaks
        this.showStrangerEncounter(playerName);
    },

    //  Get location-specific intro text
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

    //  STRANGER ENCOUNTER - the mysterious figure speaks
    //  Uses proper NPC workflow via NPCInstructionTemplates + Ollama
    showStrangerEncounter(playerName) {
        // Build proper NPC data that will use hooded_stranger spec from NPC_EMBEDDED_DATA
        const strangerNpcData = {
            type: 'hooded_stranger',
            id: 'hooded_stranger',
            name: 'Hooded Stranger',
            personality: 'cryptic',
            voice: 'am_onyx',
            // Include visual data from mysteriousStranger for display
            portrait: this.mysteriousStranger.portrait,
            emoji: this.mysteriousStranger.emoji
        };

        console.log('🎭 Showing hooded stranger encounter - PeoplePanel will generate via normal NPC workflow');

        //  Use unified PeoplePanel for the intro encounter!
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.showSpecialEncounter) {
            const introNarrative = `A figure in a dark cloak steps forward from the shadows. You cannot see their face beneath the hood, but you sense ancient eyes studying you...`;

            // Let PeoplePanel handle everything via sendGreeting (same as all other NPCs)
            PeoplePanel.showSpecialEncounter(strangerNpcData, {
                introText: introNarrative,
                greeting: null,  // null = let PeoplePanel generate via sendGreeting
                disableChat: true,  // No freeform chat during intro
                disableBack: true,  // No escape from destiny
                playVoice: true,  // Let PeoplePanel play voice via normal TTS flow
                customActions: [
                    {
                        label: 'Accept Quest: First Steps',
                        action: () => {
                            console.log('🎭 Player accepted quest from Hooded Stranger');
                            this.hasAcceptedInitialQuest = true; // ���💀 Mark quest accepted!
                            this.showQuestAcceptedThenTutorialOption(playerName);
                        },
                        primary: true,
                        questRelated: true,
                        closeAfter: true
                    },
                    {
                        label: '❓ Who are you?',
                        action: () => {
                            //  Add mysterious response to chat
                            PeoplePanel.addChatMessage("*asks* Who... who are you?", 'player');
                            setTimeout(() => {
                                PeoplePanel.addChatMessage("*The hood tilts slightly* I am but a watcher. A keeper of memories. I have seen empires rise and fall... When you have proven yourself worthy, we shall meet again.", 'npc');
                            }, 500);
                        },
                        questRelated: false
                    }
                ],
                onClose: () => {
                    console.log('🎭 Stranger encounter closed');
                    //  If player closed without accepting quest, spawn stranger as fallback NPC!
                    if (!this.hasAcceptedInitialQuest) {
                        this._spawnStrangerAsFallbackNPC();
                    }
                }
            });
        } else {
            //  Fallback to old ModalSystem if PeoplePanel unavailable
            console.warn('🎭 PeoplePanel not available, using ModalSystem fallback');
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '🎭 The Hooded Stranger',
                    content: `
                        <p style="margin-bottom: 1rem; color: #a0a0c0;">A figure in a dark cloak steps forward from the shadows. You cannot see their face beneath the hood, but you sense ancient eyes studying you.</p>
                        <p style="font-style: italic; color: #c0a0ff; font-size: 1.1em; margin-bottom: 1rem; line-height: 1.6;">"${strangerDialogue}"</p>
                        <p style="color: #f0a0a0; margin-top: 1rem;">The stranger's voice fades like mist in morning light...</p>
                    `,
                    closeable: false,
                    buttons: [
                        {
                            text: 'Accept Quest',
                            className: 'primary',
                            onClick: () => {
                                ModalSystem.hide();
                                this.showQuestAcceptedThenTutorialOption(playerName);
                            }
                        }
                    ]
                });
            }
        }
    },

    //  Fallback dialogue if API fails
    _getDefaultStrangerDialogue(playerName, greeting) {
        return `${greeting} Listen well, ${playerName}... Darkness gathers in the west. The Shadow Tower, long dormant, stirs once more. The wizard Malachar... he has returned. You are more than a simple trader, young one. Fate has brought you here for a reason. Seek out the village Elder here in Greendale. He will guide your first steps on this path.`;
    },

    //  Accept quest and show quest panel (tutorial already shown at game start) 
    showQuestAcceptedThenTutorialOption(playerName) {
        //  Actually start the quest NOW
        this.completeEncounter(true);

        //  Use unified QuestInfoPanel if available 
        // NOTE: Tutorial prompt no longer shows here - it's now shown FIRST at game start
        if (typeof QuestSystem !== 'undefined' && QuestSystem.showQuestInfoPanel) {
            // Show unified quest panel for act1_quest1 (First Steps - the new starting quest)
            QuestSystem.showQuestInfoPanel('act1_quest1', {
                isNewQuest: true
                //  No onClose callback needed - tutorial was already offered at start
            });
        }
        //  No more tutorial prompt here - it's handled by _showTutorialChoiceFirst() at game start
    },

    //  Show tutorial Yes/No prompt 
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
                        text: 'No Thanks',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            //  Just close - player can start playing
                        }
                    },
                    {
                        text: 'Yes Please',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            //  Tutorial not implemented yet - just show a message 
                            if (typeof addMessage === 'function') {
                                addMessage('📚 Tutorial coming soon! For now, explore the game and have fun! 🖤', 'info');
                            }
                        }
                    }
                ]
            });
        }
    },

    //  TUTORIAL - teach the player the basics
    //  Now shown AFTER quest is accepted, just shows tips then closes 
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
                closeable: true, // ��� Quest already accepted, can close anytime
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

    //  STRANGER REVEAL - who is this mysterious figure? (legacy - kept for story flow)
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
                closeable: false, // ��� Must accept quest - no escape
                buttons: [
                    {
                        text: 'Accept Quest',
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

    //  QUEST ACCEPTED - show confirmation and clear next steps
    showQuestAccepted(playerName) {
        //  Actually start the quest now
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
                        <p style="color: #c0c0d0; margin-left: 1rem;">• Speak with the Village Elder</p>
                    </div>
                    <p style="color: #a0a0c0; font-style: italic; font-size: 0.9em;">Tip: Look for the Elder in Greendale's People panel. NPCs with quests have a 📜 icon. Press 'Q' to open your Quest Log.</p>
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

    // COMPLETE ENCOUNTER - unlock the main quest and resume game
    completeEncounter(talkedToStranger) {
        console.log('Initial encounter complete - you chose your path, stranger talk:', talkedToStranger);

        // Mark intro as complete - allows city events to start
        this.hasCompletedIntro = true;

        //  Unlock the main quest
        this.unlockMainQuest();

        //  Resume time using interrupt system - restores user's preferred speed 
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.resumeFromInterrupt) {
                TimeSystem.resumeFromInterrupt('intro_sequence');
            } else if (this._previousSpeedForIntro) {
                TimeSystem.setSpeed(this._previousSpeedForIntro);
                this._previousSpeedForIntro = null;
            }
        }

        //  Add journal entry based on choice
        if (typeof addMessage === 'function') {
            if (talkedToStranger) {
                addMessage('📜 Quest Available: "First Steps" - Speak with the Village Elder');
                addMessage('🎭 The stranger\'s words echo in your mind... the Shadow Tower stirs.');
            } else {
                addMessage('📜 Quest Available: "First Steps" - Speak with the Village Elder');
            }
        }

        //  Track this moment for achievements
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.trackEvent) {
            AchievementSystem.trackEvent('initial_encounter_complete', { talkedToStranger });
        }

        console.log('🌟 Initial encounter ritual complete - main quest unlocked, your fate sealed 🖤');
    },

    //  UNLOCK MAIN QUEST - actually START the prologue quest (not just discover it)
    //  Waits for rank-up celebration to be dismissed first so popups don't overlap
    // 🔧 FIX: Now uses shared _waitForRankUpDismissal to avoid duplicate MutationObservers
    unlockMainQuest() {
        this._waitForRankUpDismissal(() => {
            this._doUnlockMainQuest();
        }, 5000);
    },

    //  Internal: Actually unlock the main quest
    _doUnlockMainQuest() {
        if (this._mainQuestUnlocked) return; // Prevent double-unlock
        this._mainQuestUnlocked = true;

        // FIX: Robust check - QuestSystem must exist AND be fully initialized with quests loaded
        // Check both .quests object AND .initialized flag to prevent race conditions
        if (typeof QuestSystem !== 'undefined' && QuestSystem.quests && QuestSystem.initialized) {
            // Verify the quest actually exists before trying to assign it
            if (!QuestSystem.quests['act1_quest1']) {
                console.warn('🌟 act1_quest1 not found in QuestSystem.quests - main quests may not be loaded');
                // Try to load main quests if they're not loaded yet
                if (typeof MainQuests !== 'undefined' && QuestSystem.loadExternalQuests) {
                    QuestSystem.loadExternalQuests(MainQuests, 'main');
                    console.log('🌟 Loaded MainQuests as fallback');
                }
            }

            //  Actually ASSIGN the quest so it becomes active, not just discovered
            //  act1_quest1 is "First Steps" - the new starting quest from MainQuests
            if (QuestSystem.assignQuest) {
                const result = QuestSystem.assignQuest('act1_quest1', { name: 'Elder Morin' });
                if (result.success) {
                    console.log('🌟 act1_quest1 (First Steps) quest STARTED - the darkness beckons 🦇');
                    //  Auto-track main quest so wayfinder shows where to go 
                    if (QuestSystem.trackQuest) {
                        QuestSystem.trackQuest('act1_quest1');
                        console.log('🎯 act1_quest1 auto-tracked - wayfinder activated');
                    }
                } else {
                    //  If quest is already active, that's fine - just track it for wayfinder! 
                    if (result.error === 'Quest already active') {
                        console.log('🌟 act1_quest1 already active - just need to track it 🦇');
                        if (QuestSystem.trackQuest) {
                            QuestSystem.trackQuest('act1_quest1');
                            console.log('🎯 act1_quest1 tracked - wayfinder activated');
                        }
                    } else {
                        //  Actual error - log it
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
            // QuestSystem not ready yet - retry after a short delay
            this._mainQuestUnlocked = false; // Reset flag so we can retry
            this._unlockRetryCount = (this._unlockRetryCount || 0) + 1;

            if (this._unlockRetryCount <= 5) {
                console.log(`🌟 QuestSystem not ready (attempt ${this._unlockRetryCount}/5) - retrying in 500ms...`);
                setTimeout(() => this._doUnlockMainQuest(), 500);
            } else {
                console.warn('🌟 QuestSystem still not available after 5 retries - main quest unlock failed');
            }
        }
    },

    //  FOR TESTING - manually trigger the encounter
    testEncounter(playerName = 'Test Trader') {
        this.hasShownEncounter = false;
        this.hasCompletedIntro = false;
        this.hasShownTutorialChoice = false;
        this.triggerInitialEncounter(playerName, 'greendale');
    },

    //  FALLBACK QUEST GIVER - spawn the Hooded Stranger at player's location if they close without accepting 
    _spawnStrangerAsFallbackNPC() {
        // Get current location
        const currentLocationId = typeof game !== 'undefined' && game.currentLocation?.id;
        if (!currentLocationId) {
            console.warn('🎭 Cannot spawn stranger - no current location!');
            return;
        }

        // Don't spawn twice at same location
        if (this.strangerSpawnedAtLocation === currentLocationId) {
            console.log('🎭 Stranger already spawned at', currentLocationId);
            return;
        }

        this.strangerSpawnedAtLocation = currentLocationId;

        //  Add "hooded_stranger" to the location's NPC list dynamically
        if (typeof GameWorld !== 'undefined' && GameWorld.locations[currentLocationId]) {
            const location = GameWorld.locations[currentLocationId];
            if (!location.npcs) location.npcs = [];

            // Add stranger if not already there
            if (!location.npcs.includes('hooded_stranger')) {
                location.npcs.push('hooded_stranger');
                console.log(`🎭 Hooded Stranger spawned at ${currentLocationId} as fallback quest giver! 💀`);
            }
        }

        //  Show message to player with clear instructions
        if (typeof addMessage === 'function') {
            addMessage('🎭 The hooded stranger lingers in the shadows... Press [P] to see People and speak with them.', 'info');
        }

        // Refresh PeoplePanel if open to show the new NPC
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.isOpen) {
            PeoplePanel.refresh();
        }

        //  Resume time using interrupt system 
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.resumeFromInterrupt) {
                TimeSystem.resumeFromInterrupt('intro_sequence');
            } else if (this._previousSpeedForIntro) {
                TimeSystem.setSpeed(this._previousSpeedForIntro);
                this._previousSpeedForIntro = null;
            }
        }
    },

    //  Check if player needs the initial quest (for stranger NPC dialogue) 
    needsInitialQuest() {
        // Check if act1_quest1 is active or completed
        if (typeof QuestSystem !== 'undefined') {
            const quest = QuestSystem.getQuest?.('act1_quest1');
            if (quest && (quest.status === 'active' || quest.status === 'completed')) {
                return false;
            }
        }
        return !this.hasAcceptedInitialQuest;
    },

    //  Offer initial quest again when talking to spawned stranger 
    offerInitialQuestFromStranger() {
        if (this.hasAcceptedInitialQuest) {
            // Quest already accepted - stranger has different dialogue
            return {
                dialogue: "Ah, you have accepted your destiny. Go now, the path awaits...",
                canAcceptQuest: false
            };
        }

        const playerName = typeof game !== 'undefined' ? game.player?.name : 'Traveler';
        return {
            dialogue: this._getDefaultStrangerDialogue(playerName, "We meet again, young one..."),
            canAcceptQuest: true,
            onAccept: () => {
                this.hasAcceptedInitialQuest = true;
                this.showQuestAcceptedThenTutorialOption(playerName);
            }
        };
    }
};

// 
//  GLOBAL ACCESS - for testing and debooger commands 
// 
window.InitialEncounterSystem = InitialEncounterSystem;
window.testInitialEncounter = function(name) {
    InitialEncounterSystem.testEncounter(name);
};

// register with Bootstrap
Bootstrap.register('InitialEncounterSystem', () => InitialEncounterSystem.init(), {
    dependencies: ['game', 'NPCManager'],
    priority: 85,
    severity: 'optional'
});

console.log('🌟 Initial Encounter System loaded - the mysterious stranger awaits new souls...');
