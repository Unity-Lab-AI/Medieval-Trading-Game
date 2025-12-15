// ═══════════════════════════════════════════════════════════════
// TUTORIAL MANAGER - The Sensei of Noobs, Shepherd of the Lost
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
//
// This beautiful bastard takes fresh players by the hand and teaches
// them how to not fucking die in the first 10 minutes. Without this,
// they'd be wandering around like confused chickens wondering why
// they're broke, starving, and getting their ass beat by rats.
// ═══════════════════════════════════════════════════════════════

const TutorialManager = {
    // ═══════════════════════════════════════════════════════════════
    //  STATE - The Sacred Variables That Track This Shit
    // ═══════════════════════════════════════════════════════════════
    isActive: false,
    currentQuestId: null,
    tutorialProgress: {
        questsCompleted: [],
        currentAct: 0,
        startTime: null,
        totalTime: 0
    },

    // We keep the "real world" on ice while noobs learn the ropes
    _mainGameBackup: null,
    _initialized: false,

    // ═══════════════════════════════════════════════════════════════
    //  WAKE THE FUCK UP - Initialization
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🎓 TutorialManager: Initializing tutorial system...');

        // When the noob graduates, we throw them into the deep end
        document.addEventListener('tutorial-complete', () => {
            this.completeTutorial();
        });

        // Every time they finish a quest, we pat them on the head
        document.addEventListener('quest-completed', (e) => {
            if (this.isActive && e.detail?.questId?.startsWith('tutorial_')) {
                this._onTutorialQuestComplete(e.detail.questId);
            }
        });

        // Spy on their button clicks like a helicopter parent
        this._setupUIActionListeners();

        // Listen for quest assignments to trigger scripted combat/encounters
        document.addEventListener('quest-assigned', (e) => {
            if (this.isActive && e.detail?.questId?.startsWith('tutorial_')) {
                this._onTutorialQuestAssigned(e.detail.questId);
            }
        });

        // Listen for objective updates to refresh highlights for next objective
        document.addEventListener('tutorial-objective-updated', (e) => {
            if (this.isActive && e.detail?.questId) {
                this._highlightQuestObjectives(e.detail.questId);
            }
        });

        console.log('🎓 TutorialManager: Ready to teach new merchants! 📚');
    },

    // ═══════════════════════════════════════════════════════════════
    //  COMBAT/ENCOUNTER TRIGGERS - Quest-to-Action Mapping
    // ═══════════════════════════════════════════════════════════════

    // Which quests trigger forced combat when assigned?
    _combatTriggers: {
        'tutorial_3_1': 'tutorial_dummy',     // First Fight - Training Dummy
        'tutorial_3_2': 'tutorial_fighter',   // Defense lesson - Sparring Partner
        'tutorial_3_3': 'tutorial_brute',     // Healing lesson - Arena Brute
        'tutorial_3_4': 'tutorial_boss'       // Boss Trial - Bandit Chief
    },

    // Which quests trigger forced encounters when assigned?
    _encounterTriggers: {
        'tutorial_2_5': 'tutorial_friendly_trader'  // Road Encounters quest
    },

    // ═══════════════════════════════════════════════════════════════
    //  LET'S FUCKING GO - Start Tutorial
    //  IMPORTANT: Called BEFORE main world exists! We're loading the
    //  tutorial world as the ONLY world. When tutorial completes,
    //  we'll load the main world fresh.
    // ═══════════════════════════════════════════════════════════════
    startTutorial() {
        if (this.isActive) {
            console.warn('🎓 Tutorial already active!');
            return false;
        }

        console.log('🎓 Starting tutorial (world not loaded yet - this IS the first world)...');

        // Flip the switch - we're in baby mode now
        this.isActive = true;

        // Tell the game "hey, this person is still learning, be gentle"
        if (typeof game !== 'undefined') {
            game.inTutorial = true;
            game.tutorialCompleted = false;
            game.tutorialSkipped = false;
        }

        // NO BACKUP NEEDED - Main world doesn't exist yet!
        // When tutorial completes, we'll load main world fresh
        this._mainGameBackup = null;

        // Wipe the slate clean - fresh start, fresh hopes, fresh dreams
        // Use game time (TimeMachine) instead of real time for tutorial tracking
        const gameStartTime = typeof TimeMachine !== 'undefined'
            ? TimeMachine.getTotalMinutes?.() || Date.now()
            : Date.now();
        this.tutorialProgress = {
            questsCompleted: [],
            currentAct: 0,
            startTime: gameStartTime,
            totalTime: 0,
            useGameTime: typeof TimeMachine !== 'undefined'
        };

        // Back up main world locations BEFORE loading tutorial world
        // This ensures we can restore them when tutorial ends or is skipped
        if (typeof GameWorld !== 'undefined' && GameWorld.locations && Object.keys(GameWorld.locations).length > 0) {
            this._originalLocations = { ...GameWorld.locations };
            console.log('🎓 Backed up main world locations:', Object.keys(this._originalLocations).length, 'locations');
        }

        // Summon the training dimension from the void
        this._loadTutorialWorld();

        // Sync TravelSystem with tutorial world locations
        if (typeof TravelSystem !== 'undefined') {
            if (TravelSystem.syncWithGameWorld) {
                TravelSystem.syncWithGameWorld();
                console.log('🎓 TravelSystem synced with tutorial world');
            }
            if (TravelSystem.generatePaths) {
                TravelSystem.generatePaths();
            }
        }

        // Spawn our friendly tutorial NPCs (they're actors, really)
        this._registerTutorialNPCs();

        // YEET the player to the tutorial village
        this._teleportToTutorialStart();

        // Load tutorial quests into the quest system
        this._loadTutorialQuests();

        // Hand them their first quest - "press buttons, receive dopamine"
        this._assignFirstQuest();

        // Roll out the welcome mat
        this._showWelcomeMessage();

        // Scream into the event void that the tutorial has begun
        document.dispatchEvent(new CustomEvent('tutorial-started'));

        console.log('🎓 Tutorial started! Welcome, apprentice! 📚');
        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    //  GRADUATION DAY, BITCH - Complete Tutorial
    // ═══════════════════════════════════════════════════════════════
    completeTutorial() {
        if (!this.isActive) {
            console.warn('🎓 No active tutorial to complete');
            return false;
        }

        console.log('🎓 Tutorial complete! Transitioning to main game...');

        // Math time - how long did it take this nerd to git gud?
        // Use game time if available, otherwise fall back to real time
        if (this.tutorialProgress.useGameTime && typeof TimeMachine !== 'undefined') {
            const currentGameTime = TimeMachine.getTotalMinutes?.() || Date.now();
            this.tutorialProgress.totalTime = currentGameTime - this.tutorialProgress.startTime;
        } else {
            this.tutorialProgress.totalTime = Date.now() - this.tutorialProgress.startTime;
        }

        // Clear any active tutorial highlights
        if (typeof TutorialHighlighter !== 'undefined') {
            TutorialHighlighter.clearAll();
        }

        // Show the "you did it!" screen before we kick them out
        this._showCompletionModal(() => {
            // LOOT DROP - give them their graduation presents
            this._transferRewardsToMainGame();

            // Yeet the training dimension back into the void
            this._unloadTutorialWorld();

            // Send the tutorial actors home (good job, NPCs!)
            this._unregisterTutorialNPCs();

            // Purge the baby quests from their log
            this._clearTutorialQuests();

            // Throw them into the real world - sink or swim!
            this._restoreOrStartMainGame();

            // Flip all the "no longer a noob" switches
            this.isActive = false;
            if (typeof game !== 'undefined') {
                game.inTutorial = false;
                game.tutorialCompleted = true;
            }

            // Engrave this achievement in the sacred localStorage
            this._saveTutorialCompletion();

            // Announce to the universe: A NEW PLAYER HAS EMERGED
            document.dispatchEvent(new CustomEvent('tutorial-finished', {
                detail: {
                    totalTime: this.tutorialProgress.totalTime,
                    questsCompleted: this.tutorialProgress.questsCompleted.length
                }
            }));

            // After the party, send in the Hooded Stranger to ruin their day
            if (typeof InitialEncounterSystem !== 'undefined') {
                setTimeout(() => {
                    InitialEncounterSystem.unlockMainQuest();
                }, 1000);
            }

            console.log('🎓 Tutorial complete! Welcome to the real world! 🌍');
        });

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    //  FUCK THIS, I KNOW EVERYTHING ALREADY - Skip Tutorial
    // ═══════════════════════════════════════════════════════════════
    skipTutorial() {
        if (!this.isActive) return false;

        console.log('🎓 Skipping tutorial...');

        // Clean up tutorial NPCs and quests first
        this._unregisterTutorialNPCs();
        this._clearTutorialQuests();

        // Mark as "done" even though they totally cheated
        this.isActive = false;
        if (typeof game !== 'undefined') {
            game.inTutorial = false;
            game.tutorialCompleted = true;
            game.tutorialSkipped = true; // The badge of "I already know this shit"
        }

        // Fine, go to the main game. No rewards for you though!
        // NOTE: _restoreOrStartMainGame handles world loading/unloading properly
        this._restoreOrStartMainGame();

        // Remember this coward's choice forever
        localStorage.setItem('tutorialSkipped', 'true');

        document.dispatchEvent(new CustomEvent('tutorial-skipped'));

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    //  SUMMON THE TRAINING DIMENSION - Load Tutorial World
    //  Replaces main world locations with tutorial locations temporarily
    // ═══════════════════════════════════════════════════════════════
    _loadTutorialWorld() {
        if (typeof TutorialWorld === 'undefined') {
            console.error('🎓 TutorialWorld not found!');
            return false;
        }

        console.log('🎓 Loading tutorial world (as primary world)...');

        if (typeof GameWorld !== 'undefined') {
            // Back up main world if not already done and there are locations
            if (!this._originalLocations && GameWorld.locations && Object.keys(GameWorld.locations).length > 0) {
                this._originalLocations = { ...GameWorld.locations };
                console.log('🎓 Backed up existing world locations for later');
            }

            // Clear and replace with tutorial locations ONLY
            GameWorld.locations = {};

            // Load tutorial locations as the active world
            for (const [id, location] of Object.entries(TutorialWorld.locations)) {
                GameWorld.locations[id] = location;
            }

            // Mark tutorial locations as visited so they're visible on map
            if (!GameWorld.visitedLocations) {
                GameWorld.visitedLocations = [];
            }
            // Add tutorial_village to visited so player can see where they are
            if (!GameWorld.visitedLocations.includes('tutorial_village')) {
                GameWorld.visitedLocations.push('tutorial_village');
            }

            console.log('🎓 Tutorial locations loaded:', Object.keys(TutorialWorld.locations));

            // CRITICAL: Setup market prices for tutorial locations!
            // Without this, markets show no items
            if (GameWorld.setupMarketPrices) {
                GameWorld.setupMarketPrices();
                console.log('🎓 Tutorial market prices initialized');
            }

            // CRITICAL: Regenerate merchants for tutorial locations!
            // Without this, market shows "Unknown" merchant with 0 gold
            if (typeof NPCMerchantSystem !== 'undefined') {
                NPCMerchantSystem.generateMerchants();
                NPCMerchantSystem.initializeMerchantEconomy();
                console.log('🎓 Tutorial merchants generated');
            }

            // FIX: Refresh game.currentLocation to prevent stale object references
            // After tutorial world reload, the old location reference may be invalid
            if (typeof game !== 'undefined' && game.currentLocation?.id) {
                const freshLocation = GameWorld.locations[game.currentLocation.id] ||
                                      TutorialWorld.locations[game.currentLocation.id];
                if (freshLocation) {
                    game.currentLocation = { ...freshLocation };
                    console.log('🎓 Refreshed currentLocation reference:', game.currentLocation.name);
                }
            }
        }

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    //  BANISH THE TRAINING DIMENSION - Unload Tutorial World
    // ═══════════════════════════════════════════════════════════════
    _unloadTutorialWorld() {
        if (typeof GameWorld === 'undefined') return;

        console.log('🎓 Unloading tutorial world...');

        // Nuke all tutorial locations from orbit
        for (const id of Object.keys(TutorialWorld?.locations || {})) {
            delete GameWorld.locations[id];
        }

        // Restore reality from our backup (we're responsible modders here)
        if (this._originalLocations) {
            GameWorld.locations = this._originalLocations;
            this._originalLocations = null;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SPAWN THE TEACHING SQUAD - Register Tutorial NPCs
    // ═══════════════════════════════════════════════════════════════
    _registerTutorialNPCs() {
        if (typeof TutorialNPCs !== 'undefined' && TutorialNPCs.registerAll) {
            TutorialNPCs.registerAll();
            console.log('🎓 Tutorial NPCs registered');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SEND THE TEACHERS HOME - Unregister Tutorial NPCs
    // ═══════════════════════════════════════════════════════════════
    _unregisterTutorialNPCs() {
        if (typeof TutorialNPCs !== 'undefined' && TutorialNPCs.unregisterAll) {
            TutorialNPCs.unregisterAll();
            console.log('🎓 Tutorial NPCs unregistered');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  YEET TO SPAWN POINT - Teleport to Tutorial Start
    // ═══════════════════════════════════════════════════════════════
    _teleportToTutorialStart() {
        const startLocation = TutorialWorld?.getStartingLocation?.() ||
            TutorialWorld?.locations?.tutorial_village;

        if (!startLocation) {
            console.error('🎓 Could not find tutorial starting location!');
            return;
        }

        console.log('🎓 Teleporting to tutorial village...');

        // Use TravelSystem if it exists (the fancy way)
        if (typeof TravelSystem !== 'undefined' && TravelSystem.teleportTo) {
            TravelSystem.teleportTo(startLocation.id);
        } else if (typeof game !== 'undefined') {
            // Fallback: brute force their location (the caveman way)
            game.currentLocation = startLocation;
            document.dispatchEvent(new CustomEvent('location-changed', {
                detail: { location: startLocation, locationId: startLocation.id }
            }));
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  GIVE THEM SOMETHING TO DO - Assign First Quest
    // ═══════════════════════════════════════════════════════════════
    _assignFirstQuest() {
        if (typeof QuestSystem === 'undefined') {
            console.error('🎓 QuestSystem not found!');
            return;
        }

        // FIX: Quests are already loaded by _loadTutorialQuests() into QuestSystem.quests
        // We just need to verify they're there and then assign the first one
        const firstQuestId = TutorialQuests?.getFirstQuestId?.() || 'tutorial_0_1';

        // Double-check the quest is registered
        if (QuestSystem.quests && !QuestSystem.quests[firstQuestId]) {
            console.warn(`🎓 First quest ${firstQuestId} not in QuestSystem.quests! Re-loading...`);
            // Emergency fallback - load quests directly
            if (typeof TutorialQuests !== 'undefined') {
                const allQuests = TutorialQuests.getAllQuests?.() || [];
                for (const quest of allQuests) {
                    QuestSystem.quests[quest.id] = quest;
                }
            }
        }

        if (QuestSystem.assignQuest) {
            const result = QuestSystem.assignQuest(firstQuestId);
            if (result.success) {
                this.currentQuestId = firstQuestId;
                console.log(`🎓 First tutorial quest assigned: ${firstQuestId}`);

                // Slap that quest in the tracker so they know what the fuck to do
                if (QuestSystem.trackQuest) {
                    QuestSystem.trackQuest(firstQuestId);
                }
            } else {
                console.warn('🎓 Failed to assign first quest:', result.error);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  QUEST JUST LANDED - Trigger Any Scripted Events
    // ═══════════════════════════════════════════════════════════════
    _onTutorialQuestAssigned(questId) {
        console.log(`🎓 Tutorial quest assigned: ${questId}`);

        // ALWAYS clear highlights first - no lingering popups!
        if (typeof TutorialHighlighter !== 'undefined') {
            TutorialHighlighter.clearAll();
        }


        // HIGHLIGHT THE RELEVANT UI ELEMENTS!
        this._highlightQuestObjectives(questId);

        // Check if this quest triggers forced combat
        if (this._combatTriggers[questId]) {
            const enemyId = this._combatTriggers[questId];
            console.log(`🎓 Quest ${questId} triggers combat with ${enemyId}`);

            // Small delay so quest dialog can show first
            setTimeout(() => {
                this.startTutorialCombat(enemyId);
            }, 1500);
        }

        // Check if this quest triggers a forced encounter
        if (this._encounterTriggers[questId]) {
            const encounterId = this._encounterTriggers[questId];
            console.log(`🎓 Quest ${questId} triggers encounter ${encounterId}`);

            setTimeout(() => {
                this.triggerTutorialEncounter(encounterId);
            }, 1500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SHINE THE SPOTLIGHT - Highlight UI for current quest objectives
    // ═══════════════════════════════════════════════════════════════
    _highlightQuestObjectives(questId) {
        if (typeof TutorialHighlighter === 'undefined') {
            console.warn('🎓 TutorialHighlighter not available');
            return;
        }

        // Clear any existing highlights first
        TutorialHighlighter.clearAll();

        // FIX: Get quest from ACTIVE quests (has updated objective states), not original definition!
        const activeQuest = typeof QuestSystem !== 'undefined' && QuestSystem.activeQuests?.[questId];
        const questDef = TutorialQuests?.getQuest?.(questId);
        const quest = activeQuest || questDef;

        if (!quest || !quest.objectives) return;

        // Find the first incomplete objective from the ACTIVE quest state
        const objective = quest.objectives.find(obj => !obj.completed);
        if (!objective) {
            console.log(`🎓 All objectives complete for ${questId}, no highlight needed`);
            return;
        }

        console.log(`🎓 Highlighting objective for ${questId}:`, objective.type, objective.action || objective.npc || '');

        // Map objective types/actions to UI elements
        const highlightConfig = this._getHighlightForObjective(objective, questId);
        if (highlightConfig) {
            // Small delay to let any modals close first
            setTimeout(() => {
                TutorialHighlighter.highlight(highlightConfig.selector, {
                    message: highlightConfig.message,
                    position: highlightConfig.position || 'auto',
                    // For view_tooltip, DON'T show overlay - it blocks hovering!
                    showOverlay: highlightConfig.noOverlay ? false : true,
                    pulseOnly: highlightConfig.pulseOnly || false
                });
            }, 500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  WHAT TO HIGHLIGHT - Map objectives to UI elements
    // ═══════════════════════════════════════════════════════════════
    _getHighlightForObjective(objective, questId) {
        // UI action objectives - highlight specific buttons
        if (objective.type === 'ui_action') {
            const actionHighlights = {
                'open_people': {
                    selector: '[data-panel="people-panel"]',
                    message: '<strong>Click here!</strong><br>Press <kbd>P</kbd> or click this button to see NPCs at your location.',
                    position: 'top'
                },
                'open_market': {
                    selector: '[data-panel="market-panel"]',
                    message: '<strong>Open the Market!</strong><br>Press <kbd>M</kbd> or click here to buy and sell goods.',
                    position: 'top'
                },
                'open_inventory': {
                    selector: '[data-panel="inventory-panel"]',
                    message: '<strong>Check your Inventory!</strong><br>Press <kbd>I</kbd> or click here to see your items.',
                    position: 'top'
                },
                // FIX HIGH-002: Add open_equipment handler - uses inventory panel
                'open_equipment': {
                    selector: '[data-panel="inventory-panel"]',
                    message: '<strong>Check your Equipment!</strong><br>Press <kbd>I</kbd> to open Inventory and view your gear.',
                    position: 'top'
                },
                'open_explore': {
                    selector: '#explore-btn, [data-action="explore"]',
                    message: '<strong>Time to Explore!</strong><br>Press <kbd>E</kbd> or click here to explore this location.',
                    position: 'top'
                },
                'open_travel': {
                    selector: '[data-panel="travel-panel"]',
                    message: '<strong>Time to Travel!</strong><br>Press <kbd>T</kbd> or click here to move to another location.',
                    position: 'top'
                },
                'open_quest': {
                    selector: '[data-panel="quest-overlay"]',
                    message: '<strong>View your Quests!</strong><br>Press <kbd>Q</kbd> or click here to see quest progress.',
                    position: 'top'
                },
                'pause_game': {
                    selector: '#pause-btn',
                    message: '<strong>Pause the game!</strong><br>Press <kbd>SPACE</kbd> or click here to pause time.',
                    position: 'bottom'
                },
                'unpause_game': {
                    selector: '#pause-btn',
                    message: '<strong>Resume the game!</strong><br>Press <kbd>SPACE</kbd> again to unpause.',
                    position: 'bottom'
                },
                'change_speed': {
                    selector: '.time-speed, #speed-control',
                    message: '<strong>Change game speed!</strong><br>Click here to make time go faster or slower.',
                    position: 'bottom'
                },
                'view_tooltip': null  // NO HIGHLIGHT - any tooltip anywhere completes this quest
            };

            return actionHighlights[objective.action] || null;
        }

        // Talk to NPC objectives - highlight People button first
        if (objective.type === 'talk') {
            return {
                selector: '[data-panel="people-panel"]',
                message: `<strong>Find ${objective.npc === 'tutorial_guide' ? 'Merchant Elara' : 'the NPC'}!</strong><br>Press <kbd>P</kbd> to open People panel, then click on them.`,
                position: 'top'
            };
        }

        // Buy/collect objectives - highlight Market
        if (objective.type === 'buy' || objective.type === 'collect') {
            return {
                selector: '[data-panel="market-panel"]',
                message: `<strong>Buy items here!</strong><br>Press <kbd>M</kbd> to open the Market.`,
                position: 'top'
            };
        }

        // Sell objectives - highlight Market
        if (objective.type === 'sell') {
            return {
                selector: '[data-panel="market-panel"]',
                message: `<strong>Sell your goods!</strong><br>Press <kbd>M</kbd> to open the Market.`,
                position: 'top'
            };
        }

        // Travel objectives - highlight Travel
        if (objective.type === 'travel' || objective.type === 'reach') {
            return {
                selector: '[data-panel="travel-panel"]',
                message: `<strong>Travel to ${objective.location || 'your destination'}!</strong><br>Press <kbd>T</kbd> to open Travel.`,
                position: 'top'
            };
        }

        // Consume objectives - highlight Inventory
        if (objective.type === 'consume' || objective.type === 'use') {
            return {
                selector: '[data-panel="inventory-panel"]',
                message: `<strong>Use an item!</strong><br>Press <kbd>I</kbd> to open Inventory, then click an item to use it.`,
                position: 'top'
            };
        }

        return null;
    },

    // ═══════════════════════════════════════════════════════════════
    //  GOOD JOB LITTLE BUDDY - On Tutorial Quest Complete
    // ═══════════════════════════════════════════════════════════════
    _onTutorialQuestComplete(questId) {
        console.log(`🎓 Tutorial quest completed: ${questId}`);

        // Add this victory to their trophy case
        if (!this.tutorialProgress.questsCompleted.includes(questId)) {
            this.tutorialProgress.questsCompleted.push(questId);
        }

        // Figure out what quest they just murdered
        const quest = TutorialQuests?.getQuest?.(questId);
        if (!quest) return;

        // Keep tabs on which act of the tutorial they're in
        if (quest.act !== undefined) {
            this.tutorialProgress.currentAct = quest.act;
        }

        // Did they just beat the final boss quest? GRADUATION TIME!
        if (quest.isFinalTutorialQuest) {
            document.dispatchEvent(new CustomEvent('tutorial-complete'));
            return;
        }

        // Chain reaction - serve up the next quest after a tiny breather
        if (quest.nextQuest && typeof QuestSystem !== 'undefined') {
            setTimeout(() => {
                if (QuestSystem.assignQuest) {
                    const result = QuestSystem.assignQuest(quest.nextQuest);
                    if (result.success) {
                        this.currentQuestId = quest.nextQuest;
                        console.log(`🎓 Next tutorial quest assigned: ${quest.nextQuest}`);

                        // Slap that shit in the tracker
                        if (QuestSystem.trackQuest) {
                            QuestSystem.trackQuest(quest.nextQuest);
                        }
                    }
                }
            }, 500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  BIG BROTHER IS WATCHING - Setup UI Action Listeners
    // ═══════════════════════════════════════════════════════════════
    _setupUIActionListeners() {
        // Catch them opening any panel like a proud parent
        document.addEventListener('panel-opened', (e) => {
            if (!this.isActive) return;
            // Use explicit action if provided, otherwise construct from panelId
            const action = e.detail?.action || `open_${e.detail?.panelId || e.detail?.id}`;
            this._trackUIAction(action);
        });

        // They hit pause? We noticed. We notice EVERYTHING.
        document.addEventListener('game-paused', () => {
            if (!this.isActive) return;
            this._trackUIAction('pause_game');
        });

        document.addEventListener('game-unpaused', () => {
            if (!this.isActive) return;
            this._trackUIAction('unpause_game');
        });

        // Speed demon mode engaged?
        // FIX: TimeMachine dispatches 'game-speed-changed', not 'speed-changed'
        document.addEventListener('game-speed-changed', () => {
            if (!this.isActive) return;
            this._trackUIAction('change_speed');
        });

        // Curiosity kicks in and they want to explore?
        document.addEventListener('exploration-started', () => {
            if (!this.isActive) return;
            this._trackUIAction('open_explore');
        });

        // Listen for ui-action events (from TooltipSystem and other sources)
        // This catches view_tooltip and any other UI actions dispatched via ui-action event
        document.addEventListener('ui-action', (e) => {
            if (!this.isActive) return;
            const action = e.detail?.action;
            if (action) {
                this._trackUIAction(action);
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    //  LOG THEIR EVERY MOVE - Track UI Action
    // ═══════════════════════════════════════════════════════════════
    _trackUIAction(action) {
        if (!this.isActive) return;

        console.log(`🎓 UI Action tracked: ${action}`);

        // For view_tooltip - IMMEDIATELY clear highlight so UI is usable
        // The quest objective is complete, no need to keep pulsing
        if (action === 'view_tooltip') {
            console.log('🎓 Tooltip viewed! Clearing highlight...');
            if (typeof TutorialHighlighter !== 'undefined') {
                TutorialHighlighter.clearAll();
            }
        }

        // Broadcast to anyone who cares (spoiler: quest system cares)
        document.dispatchEvent(new CustomEvent('tutorial-ui-action', {
            detail: { action }
        }));

        // Poke the quest system directly too, for good measure
        if (typeof QuestSystem !== 'undefined' && QuestSystem.updateProgress) {
            QuestSystem.updateProgress('ui_action', { action: action });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  HELLO FRESH MEAT - Show Welcome Message
    //  NOW WITH ACTUAL INSTRUCTIONS ON HOW TO PLAY!
    // ═══════════════════════════════════════════════════════════════
    _showWelcomeMessage() {
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎓 Welcome to the Tutorial!',
                content: `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: #c0c0d0; margin-bottom: 1rem; font-size: 1.1em;">
                            Welcome, aspiring merchant! I'm <strong style="color: #4fc3f7;">Merchant Elara</strong>,
                            and I'll be your guide.
                        </p>

                        <div style="background: rgba(100, 100, 150, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: left;">
                            <p style="color: #ffd700; margin: 0 0 0.5rem 0; font-weight: bold;">
                                📋 Your First Task: Find and talk to me!
                            </p>
                            <p style="color: #c0c0d0; margin: 0 0 0.5rem 0; font-size: 0.95em;">
                                1. Press the <strong style="color: #ff9800;">P</strong> key or click <strong style="color: #4fc3f7;">👥 People</strong> at the bottom
                            </p>
                            <p style="color: #c0c0d0; margin: 0 0 0.5rem 0; font-size: 0.95em;">
                                2. Find <strong style="color: #4fc3f7;">Merchant Elara</strong> with the <strong style="color: #ffd700;">!</strong> marker
                            </p>
                            <p style="color: #c0c0d0; margin: 0; font-size: 0.95em;">
                                3. Click on me to start a conversation
                            </p>
                        </div>

                        <div style="background: rgba(100, 150, 100, 0.2); padding: 0.75rem; border-radius: 8px;">
                            <p style="color: #90EE90; margin: 0; font-size: 0.9em;">
                                💡 <strong>Tip:</strong> The <strong style="color: #ffd700;">!</strong> means an NPC has a quest for you.
                                The <strong style="color: #ffd700;">?</strong> means you can turn in a quest!
                            </p>
                        </div>
                    </div>
                `,
                closeable: true,
                buttons: [
                    {
                        text: '🎮 Got it!',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            // DON'T auto-open the panel - let them do it themselves!
                        }
                    }
                ]
            });
        }

        if (typeof addMessage === 'function') {
            addMessage('🎓 Tutorial started! Press P or click People to find Merchant Elara.');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  YOU DID IT YOU MAGNIFICENT BASTARD - Show Completion Modal
    // ═══════════════════════════════════════════════════════════════
    _showCompletionModal(onComplete) {
        const timeSpent = Math.floor(this.tutorialProgress.totalTime / 60000); // minutes
        const questsCompleted = this.tutorialProgress.questsCompleted.length;

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎉 Tutorial Complete!',
                content: `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: #4fc3f7; font-size: 1.3em; margin-bottom: 1rem;">
                            CONGRATULATIONS!
                        </p>
                        <p style="color: #c0c0d0; margin-bottom: 1.5rem;">
                            You've completed ${questsCompleted} quests in ${timeSpent} minutes!
                        </p>

                        <div style="background: rgba(100, 150, 100, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="color: #90EE90; margin-bottom: 0.5rem;"><strong>🎁 Your Rewards:</strong></p>
                            <p style="color: #ffd700;">💰 1500 Gold</p>
                            <p style="color: #aaa;">⚔️ Basic Equipment</p>
                            <p style="color: #aaa;">🍞 Survival Supplies</p>
                        </div>

                        <p style="color: #888; font-style: italic;">
                            You'll be transported to Greendale, where a mysterious Hooded Stranger
                            awaits with your first real quest...
                        </p>
                    </div>
                `,
                closeable: false,
                buttons: [
                    {
                        text: '🌍 Enter the Real World!',
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
    //  PAYDAY MOTHERFUCKER - Transfer Rewards to Main Game
    // ═══════════════════════════════════════════════════════════════
    _transferRewardsToMainGame() {
        console.log('🎓 Transferring tutorial rewards to main game...');

        // MONEY PRINTER GO BRRRRR
        if (typeof GoldManager !== 'undefined') {
            GoldManager.add(1500, 'tutorial_completion');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.gold = (game.player.gold || 0) + 1500;
        }

        // Load them up with starter gear like a proud RPG parent
        if (typeof PlayerStateManager !== 'undefined') {
            const rewards = [
                { id: 'iron_sword', quantity: 1 },  // Pointy end goes in the enemy
                { id: 'leather_armor', quantity: 1 },  // Fashion AND function
                { id: 'bread', quantity: 20 },  // Don't starve, idiot
                { id: 'water', quantity: 15 },  // Hydration nation
                { id: 'health_potion', quantity: 10 }  // For when you fuck up
            ];

            for (const reward of rewards) {
                if (PlayerStateManager.addItem) {
                    PlayerStateManager.addItem(reward.id, reward.quantity);
                }
            }
        }

        console.log('🎓 Rewards transferred!');
    },

    // ═══════════════════════════════════════════════════════════════
    //  INJECT THE KNOWLEDGE - Load Tutorial Quests into QuestSystem
    //  Makes tutorial quests available for the quest system to reference
    // ═══════════════════════════════════════════════════════════════
    _loadTutorialQuests() {
        if (typeof QuestSystem === 'undefined' || typeof TutorialQuests === 'undefined') {
            console.warn('🎓 QuestSystem or TutorialQuests not available!');
            return;
        }

        console.log('🎓 Loading tutorial quests into quest system...');

        // Get all tutorial quests
        const allQuests = TutorialQuests.getAllQuests?.() || [];

        // FIX: Inject them into QuestSystem.quests (the ACTUAL quest database)
        // QuestSystem.assignQuest() looks for quests in this.quests, NOT availableQuests
        if (QuestSystem.quests) {
            for (const quest of allQuests) {
                QuestSystem.quests[quest.id] = quest;
                console.log(`🎓 Registered tutorial quest: ${quest.id}`);
            }
        } else {
            console.error('🎓 QuestSystem.quests not available!');
        }

        // Also add first quest to discovered quests if that system exists
        if (QuestSystem.discoveredQuests && !QuestSystem.discoveredQuests.includes('tutorial_0_1')) {
            QuestSystem.discoveredQuests.push('tutorial_0_1');
        }

        console.log(`🎓 Loaded ${allQuests.length} tutorial quests into QuestSystem.quests`);
    },

    // ═══════════════════════════════════════════════════════════════
    //  MEMORY WIPE TIME - Clear Tutorial Quests
    // ═══════════════════════════════════════════════════════════════
    _clearTutorialQuests() {
        if (typeof QuestSystem === 'undefined') return;

        console.log('🎓 Clearing tutorial quests from quest log...');

        // Grab all tutorial quests and yeet them into the void
        const tutorialQuestIds = TutorialQuests?.getAllQuests?.()?.map(q => q.id) || [];

        for (const questId of tutorialQuestIds) {
            if (QuestSystem.removeQuest) {
                QuestSystem.removeQuest(questId);
            } else if (QuestSystem.activeQuests) {
                delete QuestSystem.activeQuests[questId];
            }
        }

        // Also remove from available quests
        if (QuestSystem.availableQuests) {
            for (const questId of tutorialQuestIds) {
                delete QuestSystem.availableQuests[questId];
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  FREEZE FRAME - Backup Main Game State (for replays)
    // ═══════════════════════════════════════════════════════════════
    _backupMainGameState() {
        // New game? Nothing to save. This is for masochists who replay tutorials.
        if (typeof game !== 'undefined' && game.currentLocation) {
            this._mainGameBackup = {
                location: game.currentLocation?.id,
                gold: typeof GoldManager !== 'undefined' ? GoldManager.getGold() : game.player?.gold,
                // TODO: Add more state if someone actually uses replay feature
            };
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  RELEASE THE KRAKEN - Load Main Game World After Tutorial
    //  CRITICAL: Tutorial world was the ONLY world. Now we need to
    //  actually LOAD the main game world using initializeGameWorld().
    //  Player's build (name, attributes, perks) is PRESERVED - only world changes!
    // ═══════════════════════════════════════════════════════════════
    _restoreOrStartMainGame() {
        console.log('🎓 Loading main game world (tutorial complete)...');
        console.log('🎓 Player build preserved:', game?.player?.name, 'Perks:', game?.player?.perks);

        // ═══════════════════════════════════════════════════════════════
        //  RESET TIME FOR MAIN GAME - Tutorial time doesn't count!
        //  Main game starts fresh at Day 1, 8:00 AM
        // ═══════════════════════════════════════════════════════════════
        if (typeof TimeMachine !== 'undefined') {
            TimeMachine._tutorialTimeActive = false;
            TimeMachine.currentDay = 1;
            TimeMachine.currentHour = 8;
            TimeMachine.currentMinute = 0;
            TimeMachine.totalMinutes = 480; // 8:00 AM = 480 minutes
            TimeMachine.updateTimeDisplay?.();
            console.log('🎓 Main game time initialized: Day 1, 8:00 AM (tutorial time discarded)');
        }

        // Restore backed up main world locations
        if (this._originalLocations && Object.keys(this._originalLocations).length > 0) {
            console.log('🎓 Restoring backed-up main world...', Object.keys(this._originalLocations).length, 'locations');
            if (typeof GameWorld !== 'undefined') {
                GameWorld.locations = { ...this._originalLocations };
            }
            this._originalLocations = null;
        } else {
            // Fallback - this shouldn't happen if backup was done correctly
            console.warn('🎓 No backup found! Attempting to reinitialize main world...');

            // Clear tutorial locations first
            if (typeof GameWorld !== 'undefined') {
                GameWorld.locations = {};
                GameWorld.visitedLocations = [];
            }

            // Try to initialize the game world from scratch
            // This requires the game-world.js to be reloaded or GameWorld to have a reset method
            if (typeof initializeGameWorld !== 'undefined') {
                initializeGameWorld();
            } else if (typeof GameWorld !== 'undefined' && GameWorld.init) {
                GameWorld.init();
            }

            // If still no locations, we have a serious problem
            if (!GameWorld.locations || Object.keys(GameWorld.locations).length === 0) {
                console.error('🎓 CRITICAL: Failed to restore main world locations!');
                // Last resort - reload the page
                alert('Error loading main game world. The page will reload.');
                location.reload();
                return;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  DETERMINE STARTING LOCATION BASED ON PLAYER'S PERKS
        //  This respects the character build choices made before tutorial
        // ═══════════════════════════════════════════════════════════════
        const mainStartLocation = this._determineStartingLocation();
        console.log('🎓 Starting location determined:', mainStartLocation);

        // ═══════════════════════════════════════════════════════════════
        //  RESET VISITED LOCATIONS - Start fresh with only the starting location
        //  This prevents tutorial locations from bleeding into main world
        // ═══════════════════════════════════════════════════════════════
        if (typeof GameWorld !== 'undefined') {
            GameWorld.visitedLocations = [mainStartLocation];
            console.log('🎓 Visited locations reset to:', GameWorld.visitedLocations);
        }

        // Reset gatehouse locks for fresh start
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.resetAllGates) {
            GatehouseSystem.resetAllGates();
        }

        // ═══════════════════════════════════════════════════════════════
        //  SYNC TRAVEL SYSTEM WITH RESTORED GAME WORLD
        //  TravelSystem needs to know about the new locations!
        // ═══════════════════════════════════════════════════════════════
        if (typeof TravelSystem !== 'undefined') {
            if (TravelSystem.syncWithGameWorld) {
                TravelSystem.syncWithGameWorld();
                console.log('🎓 TravelSystem synced with restored GameWorld');
            }
            if (TravelSystem.generatePaths) {
                TravelSystem.generatePaths();
            }
            // Reset player position state
            if (TravelSystem.playerPosition) {
                TravelSystem.playerPosition.isTraveling = false;
                TravelSystem.playerPosition.currentLocation = mainStartLocation;
            }
        }

        if (typeof TravelSystem !== 'undefined' && TravelSystem.teleportTo) {
            TravelSystem.teleportTo(mainStartLocation);
        } else if (typeof game !== 'undefined' && typeof GameWorld !== 'undefined') {
            game.currentLocation = GameWorld.locations[mainStartLocation];
            document.dispatchEvent(new CustomEvent('location-changed', {
                detail: { location: game.currentLocation, locationId: mainStartLocation }
            }));
        }

        // Initialize gatehouse system with starting zone (same as normal game start)
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.setStartingZone) {
            GatehouseSystem.setStartingZone(mainStartLocation);
        }

        // Re-render travel panel map (now shows main world)
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
            setTimeout(() => TravelPanelMap.render(), 500);
        }

        // Re-render GameWorldRenderer and center on player location
        if (typeof GameWorldRenderer !== 'undefined') {
            setTimeout(() => {
                GameWorldRenderer._currentBackdrop = null; // Force backdrop refresh
                if (GameWorldRenderer.render) {
                    GameWorldRenderer.render();
                }
                // Center the map on the player's starting location
                if (GameWorldRenderer.centerOnPlayer) {
                    GameWorldRenderer.centerOnPlayer();
                } else if (GameWorldRenderer.centerOnLocation) {
                    GameWorldRenderer.centerOnLocation(mainStartLocation);
                }
                // Also update player marker
                if (GameWorldRenderer.updatePlayerMarker) {
                    GameWorldRenderer.updatePlayerMarker();
                }
            }, 600);
        }

        // Update market visibility for main world location
        if (typeof updateMarketButtonVisibility !== 'undefined') {
            updateMarketButtonVisibility();
        }

        // Show the hooded stranger intro after a delay (main story hook)
        if (typeof InitialEncounterSystem !== 'undefined') {
            setTimeout(() => {
                InitialEncounterSystem.unlockMainQuest();
            }, 1500);
        }

        // Dispatch main-world-loaded event for systems that need to know
        // (e.g., AchievementSystem enables achievements after this)
        console.log('🎓 Dispatching main-world-loaded event');
        document.dispatchEvent(new CustomEvent('main-world-loaded', {
            detail: { startLocation: mainStartLocation }
        }));
    },

    // ═══════════════════════════════════════════════════════════════
    //  DETERMINE STARTING LOCATION - Based on player's perks
    //  Mirrors the logic from game.js createCharacter flow
    // ═══════════════════════════════════════════════════════════════
    _determineStartingLocation() {
        let startLocationId = 'greendale'; // Default

        // Map old location names to new ones (and fix locked zone/nonexistent locations)
        const locationMapping = {
            'riverwood': 'riverwood',
            'royal_capital': 'royal_capital',
            'greendale': 'greendale',
            'western_watch': 'western_watch',
            'amberhaven': 'jade_harbor',
            'ironhold': 'ironforge',
            'frostfall': 'frostholm',
            'jade_palace': 'jade_harbor',
            'market_crossroads': 'silk_road_inn',
            'darkwood_village': 'hunters_wood',  // darkwood is in western zone (locked!) - use hunters_wood
            'darkwood': 'hunters_wood',          // darkwood is in western zone (locked!) - use hunters_wood
            'hermit_grove': 'hunting_lodge',     // hermit_grove is in western zone (locked!) - use hunting_lodge
            'iron_mines': 'northern_outpost',    // iron_mines is in northern zone (locked!) - start at gate
            'port_azure': 'sunhaven',            // port_azure doesn't exist - use sunhaven (coastal southern)
            'merchants_landing': 'royal_capital', // merchants_landing doesn't exist - use royal_capital
            'greendale_farm': 'wheat_farm'       // greendale_farm doesn't exist - use wheat_farm (starter zone)
        };

        // Get player's perks
        const playerPerks = game?.player?.perks || [];
        if (playerPerks.length === 0) {
            console.log('🎓 No perks - using default location:', startLocationId);
            return startLocationId;
        }

        // Check perks for starting locations
        const possibleLocations = [];
        // Get perks definitions from PerkSystem or global perks object
        const perkDefs = (typeof PerkSystem !== 'undefined' && PerkSystem.perks)
                         ? PerkSystem.perks
                         : (typeof perks !== 'undefined' ? perks : {});

        for (const perkId of playerPerks) {
            // Handle both string IDs and perk objects
            const id = typeof perkId === 'string' ? perkId : perkId?.id;
            const perk = perkDefs[id] || null;

            if (perk && perk.startingLocation) {
                let mappedLocation = locationMapping[perk.startingLocation] || perk.startingLocation;

                // Verify the location exists in GameWorld
                if (typeof GameWorld !== 'undefined' && GameWorld.locations[mappedLocation]) {
                    possibleLocations.push({
                        locationId: mappedLocation,
                        perkName: perk.name
                    });
                }
            }
        }

        // If we have possible locations, pick one randomly (matches game.js behavior)
        if (possibleLocations.length > 0) {
            const chosen = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
            startLocationId = chosen.locationId;
            console.log(`🎓 Starting at ${startLocationId} based on perk: ${chosen.perkName}`);

            if (possibleLocations.length > 1) {
                const locationNames = possibleLocations.map(p => `${p.perkName} (${p.locationId})`).join(', ');
                console.log(`🎓 Multiple starting locations from perks: ${locationNames}`);
            }
        }

        // Validate the location exists
        if (typeof GameWorld !== 'undefined' && !GameWorld.locations[startLocationId]) {
            console.warn(`🎓 Starting location ${startLocationId} not found - using greendale`);
            startLocationId = 'greendale';
        }

        return startLocationId;
    },

    // ═══════════════════════════════════════════════════════════════
    //  CARVE IT IN STONE - Save Tutorial Completion
    // ═══════════════════════════════════════════════════════════════
    _saveTutorialCompletion() {
        try {
            localStorage.setItem('tutorialCompleted', 'true');
            localStorage.setItem('tutorialCompletionTime', Date.now().toString());
            localStorage.setItem('tutorialStats', JSON.stringify({
                questsCompleted: this.tutorialProgress.questsCompleted.length,
                totalTime: this.tutorialProgress.totalTime
            }));
        } catch (e) {
            console.warn('🎓 Could not save tutorial completion:', e);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ARE YOU STILL A NOOB? - Check if Tutorial Completed
    // ═══════════════════════════════════════════════════════════════
    hasCompletedTutorial() {
        if (typeof game !== 'undefined' && game.tutorialCompleted) {
            return true;
        }
        return localStorage.getItem('tutorialCompleted') === 'true';
    },

    // ═══════════════════════════════════════════════════════════════
    //  LOOK AT THE SHINY THING - Highlight UI Element
    // ═══════════════════════════════════════════════════════════════
    highlightElement(elementId, options = {}) {
        if (typeof TutorialHighlighter !== 'undefined') {
            TutorialHighlighter.highlight(elementId, options);
        } else {
            // Fallback: ghetto spotlight with CSS classes
            const element = document.getElementById(elementId) ||
                document.querySelector(`[data-panel="${elementId}"]`) ||
                document.querySelector(`.${elementId}`);

            if (element) {
                element.classList.add('tutorial-highlight');
                if (options.duration) {
                    setTimeout(() => {
                        element.classList.remove('tutorial-highlight');
                    }, options.duration);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  OKAY YOU CAN STOP STARING NOW - Remove Highlight
    // ═══════════════════════════════════════════════════════════════
    removeHighlight(elementId) {
        if (typeof TutorialHighlighter !== 'undefined') {
            TutorialHighlighter.removeHighlight(elementId);
        } else {
            const element = document.getElementById(elementId) ||
                document.querySelector(`[data-panel="${elementId}"]`) ||
                document.querySelector(`.${elementId}`);

            if (element) {
                element.classList.remove('tutorial-highlight');
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    //  FIGHT ME BRO - Force Combat (for tutorial fights)
    // ═══════════════════════════════════════════════════════════════
    startTutorialCombat(enemyId) {
        // Tutorial enemies are now in CombatSystem.enemies so just pass the ID
        if (!CombatSystem?.enemies?.[enemyId]) {
            console.warn(`🎓 Tutorial enemy not found in CombatSystem: ${enemyId}`);
            return false;
        }

        console.log(`🎓 Starting tutorial combat against ${enemyId}`);

        // Summon the enemy and throw hands (with training wheels on)
        if (typeof CombatSystem !== 'undefined' && CombatSystem.startCombat) {
            CombatSystem.startCombat({
                enemyId: enemyId,  // CombatSystem looks this up in its enemies object
                level: 1,          // Keep it easy for the noobs
                isTutorial: true,  // Don't actually kill them if they suck
                canFlee: true,     // Cowardice is allowed in training
                respawnOnDeath: true  // Die, respawn, try again
            });
            return true;
        }

        return false;
    },

    // ═══════════════════════════════════════════════════════════════
    //  SURPRISE MOTHERFUCKER - Force Random Encounter
    // ═══════════════════════════════════════════════════════════════
    triggerTutorialEncounter(encounterId) {
        console.log(`🎓 Triggering tutorial encounter: ${encounterId}`);

        // Force spawn an NPC encounter - no RNG, just vibes
        if (typeof NPCEncounterSystem !== 'undefined') {
            NPCEncounterSystem.forceEncounter?.(encounterId);
            return true;
        }

        return false;
    }
};

// ═══════════════════════════════════════════════════════════════
//  MAKE IT GLOBAL - Because Everyone Needs Access to This Bad Boy
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.TutorialManager = TutorialManager;
}

// CommonJS export for the nerds who use modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialManager;
}
