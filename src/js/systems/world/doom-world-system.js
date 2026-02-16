// 
//  DOOM WORLD SYSTEM - The Apocalypse Controller 
// 
// Version: 0.92.00 | Unity AI Lab
// Master controller that coordinates all doom world systems:
// - World state switching (normal <-> doom)
// - Boatman NPC spawning after boss defeat
// - Economy inversion
// - Location name corruption
// - NPC demeanor changes
// - UI atmosphere effects
// 

const DoomWorldSystem = {
    // 
    //  STATE TRACKING
    // 
    isActive: false,
    entryDungeon: null, // 'shadow_dungeon' or 'forest_dungeon'
    hasEverEntered: false, // ��� Track if player has ever entered doom world (no spoilers!)

    //  Boss defeat tracking
    bossesDefeated: {
        shadow_guardian: false,
        ruins_guardian: false
    },

    //  Boss respawn tracking - bosses respawn after 1 day UNLESS Greedy Won is dead
    bossDefeatTime: {
        shadow_guardian: null, // Timestamp when boss was killed
        ruins_guardian: null
    },
    BOSS_RESPAWN_DAYS: 1, // Bosses respawn after this many game days

    //  GREEDY WON - Final doom boss. When defeated, dungeon bosses die PERMANENTLY
    greedyWonDefeated: false,

    //  Boatman spawning state
    boatmanLocations: new Set(), // Locations where boatman is available

    // 
    //  INITIALIZATION
    // 
    init() {
        console.log('💀 DoomWorldSystem: Initializing the apocalypse controller...');

        //  Load saved state
        this._loadState();

        //  Listen for boss defeat events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('boss:defeated', (data) => this._onBossDefeated(data));
            EventBus.on('quest:completed', (data) => this._onQuestCompleted(data));
            EventBus.on('world:changed', (data) => this._onWorldChanged(data));
            //  Check for boss respawns every game day
            EventBus.on('time:dayChanged', () => this.checkBossRespawns());
        }

        //  Check boss respawns on init (in case time passed while game was closed)
        this.checkBossRespawns();

        //  Sync with TravelSystem if doom world is active
        if (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) {
            this.isActive = true;
            this._applyDoomEffects();
        }

        console.log('💀 DoomWorldSystem: Ready. Bosses defeated:', this.bossesDefeated);
        console.log('💀 DoomWorldSystem: Boatman locations:', Array.from(this.boatmanLocations));
        console.log('💀 DoomWorldSystem: Greedy Won defeated:', this.greedyWonDefeated);
    },

    // 
    //  BOSS DEFEAT HANDLING
    // 
    _onBossDefeated(data) {
        const { bossId, location, questId } = data;
        console.log(`💀 DoomWorldSystem: Boss defeated! ${bossId} at ${location}`);

        //  Get current game time for respawn tracking
        const currentTime = this._getCurrentGameTime();

        //  Check if this is a guardian boss that unlocks the boatman
        if (bossId === 'shadow_guardian' || questId === 'act5_quest2') {
            this.bossesDefeated.shadow_guardian = true;
            this.bossDefeatTime.shadow_guardian = currentTime;
            this.boatmanLocations.add('shadow_dungeon');
            this._spawnBoatman('shadow_dungeon');
            console.log('💀 Boatman now available at Shadow Dungeon!');
        }

        if (bossId === 'ruins_guardian' || questId === 'act5_quest5') {
            this.bossesDefeated.ruins_guardian = true;
            this.bossDefeatTime.ruins_guardian = currentTime;
            this.boatmanLocations.add('forest_dungeon');
            this._spawnBoatman('forest_dungeon');
            console.log('💀 Boatman now available at Ruins of Malachar!');
        }

        //  GREEDY WON defeated = ALL dungeon bosses PERMANENTLY DEAD
        if (bossId === 'greedy_won' || questId === 'doom_final_boss') {
            this.greedyWonDefeated = true;
            //  Mark both bosses as permanently defeated
            this.bossesDefeated.shadow_guardian = true;
            this.bossesDefeated.ruins_guardian = true;
            //  Clear respawn timers - they never respawn now
            this.bossDefeatTime.shadow_guardian = 'permanent';
            this.bossDefeatTime.ruins_guardian = 'permanent';
            //  Boatman always available at both dungeons forever
            this.boatmanLocations.add('shadow_dungeon');
            this.boatmanLocations.add('forest_dungeon');
            this._spawnBoatman('shadow_dungeon');
            this._spawnBoatman('forest_dungeon');

            console.log('🔥 GREEDY WON DEFEATED! Dungeon bosses permanently dead. Free Boatman access!');
            if (typeof addMessage === 'function') {
                addMessage('🔥 With Greedy Won\'s fall, the dungeon guardians crumble to dust...', 'success');
                addMessage('⛵ The Boatman awaits freely at both dungeons.', 'info');
            }
        }

        this._saveState();
    },

    //  Get current game time in total minutes
    _getCurrentGameTime() {
        if (typeof TimeMachine !== 'undefined' && TimeMachine.getTotalMinutes) {
            return TimeMachine.getTotalMinutes();
        }
        if (typeof TimeSystem !== 'undefined' && TimeSystem.getTotalMinutes) {
            return TimeSystem.getTotalMinutes();
        }
        // Fallback to real timestamp
        return Date.now();
    },

    //  Check if a boss has respawned (1 day since defeat, unless Greedy Won is dead)
    hasBossRespawned(bossId) {
        //  If Greedy Won is defeated, bosses NEVER respawn - they're permanently dead
        if (this.greedyWonDefeated) {
            return false; // Boss is permanently dead, hasn't "respawned"
        }

        const defeatTime = this.bossDefeatTime[bossId];

        // Never defeated = boss is alive (hasn't respawned, but is there)
        if (!defeatTime) {
            return true; // Boss is alive
        }

        // Permanent death (from Greedy Won)
        if (defeatTime === 'permanent') {
            return false;
        }

        // Check if enough time has passed
        const currentTime = this._getCurrentGameTime();
        const minutesPerDay = 24 * 60; // 1440 minutes per game day
        const respawnTime = defeatTime + (this.BOSS_RESPAWN_DAYS * minutesPerDay);

        return currentTime >= respawnTime;
    },

    //  Check if boatman is available (boss dead and not respawned yet, OR Greedy Won dead)
    isBoatmanAvailable(dungeonId) {
        //  Greedy Won dead = always available
        if (this.greedyWonDefeated) {
            return true;
        }

        const bossId = dungeonId === 'shadow_dungeon' ? 'shadow_guardian' : 'ruins_guardian';

        // Boss must be defeated AND not respawned yet
        if (!this.bossesDefeated[bossId]) {
            return false; // Never defeated
        }

        // If boss has respawned, boatman is blocked until you kill boss again
        if (this.hasBossRespawned(bossId)) {
            return false; // Boss respawned, need to kill again
        }

        return true; // Boss dead and hasn't respawned yet
    },

    //  Check boss respawns on game load and time passage
    checkBossRespawns() {
        //  Skip if Greedy Won is dead
        if (this.greedyWonDefeated) return;

        const bossesToCheck = ['shadow_guardian', 'ruins_guardian'];
        const dungeonMap = {
            shadow_guardian: 'shadow_dungeon',
            ruins_guardian: 'forest_dungeon'
        };

        bossesToCheck.forEach(bossId => {
            if (this.bossesDefeated[bossId] && this.hasBossRespawned(bossId)) {
                //  Boss has respawned! Mark as alive, remove boatman
                console.log(`💀 ${bossId} has respawned! Boatman access blocked.`);
                this.bossesDefeated[bossId] = false;
                this.bossDefeatTime[bossId] = null;

                const dungeonId = dungeonMap[bossId];
                this.boatmanLocations.delete(dungeonId);

                if (typeof addMessage === 'function') {
                    const bossName = bossId === 'shadow_guardian' ? 'Shadow Guardian' : 'Ruins Guardian';
                    addMessage(`The ${bossName} has reformed from the darkness...`, 'warning');
                }
            }
        });

        this._saveState();
    },

    _onQuestCompleted(data) {
        //  Quest data comes as { quest, rewards } from QuestSystem
        const questId = data.quest?.id || data.questId;
        if (!questId) return;

        console.log(`💀 DoomWorldSystem: Quest completed: ${questId}`);

        //  Act 5 Quest 2 completion = Shadow Guardian defeated
        if (questId === 'act5_quest2') {
            this.bossesDefeated.shadow_guardian = true;
            this.boatmanLocations.add('shadow_dungeon');
            this._spawnBoatman('shadow_dungeon');
            console.log('💀 Shadow Guardian defeated! Boatman now at shadow_dungeon');
            if (typeof addMessage === 'function') {
                addMessage('💀 A mysterious figure has appeared at the Shadow Dungeon...', 'warning');
            }
        }

        //  Act 5 Quest 5 completion = Ruins Guardian defeated
        if (questId === 'act5_quest5') {
            this.bossesDefeated.ruins_guardian = true;
            this.boatmanLocations.add('forest_dungeon');
            this._spawnBoatman('forest_dungeon');
            console.log('💀 Ruins Guardian defeated! Boatman now at forest_dungeon');
            if (typeof addMessage === 'function') {
                addMessage('💀 A mysterious figure has appeared at the Ruins of Malachar...', 'warning');
            }
        }

        this._saveState();
    },

    // 
    //  BOATMAN NPC SYSTEM
    // 
    _spawnBoatman(dungeonLocation) {
        console.log(`💀 Spawning Boatman at ${dungeonLocation}...`);

        //  Emit event so NPCManager can add the boatman
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('npc:spawn', {
                npcId: 'boatman',
                npcType: 'boatman',
                location: dungeonLocation,
                name: 'The Boatman',
                title: 'Ferryman of Worlds',
                description: 'A mysterious figure who can transport you between realities.',
                isSpecial: true,
                canTrade: false,
                canChat: true,
                hasPortal: true,
                portalDestination: 'doom_world'
            });
        }

        //  Also add to GameWorld location if possible
        if (typeof GameWorld !== 'undefined' && GameWorld.locations[dungeonLocation]) {
            const location = GameWorld.locations[dungeonLocation];
            if (!location.npcs) location.npcs = [];
            if (!location.npcs.includes('boatman')) {
                location.npcs.push('boatman');
            }
        }
    },

    //  Check if boatman is at current location
    isBoatmanHere(locationId) {
        //  In DOOM WORLD - Boatman is always at both dungeons (only way out!)
        if (this.isActive) {
            return locationId === 'shadow_dungeon' || locationId === 'forest_dungeon';
        }

        //  In NORMAL WORLD - check boss defeat status and respawn timers
        // Boatman only available if boss is dead AND hasn't respawned (or Greedy Won is dead)
        if (locationId === 'shadow_dungeon' || locationId === 'forest_dungeon') {
            return this.isBoatmanAvailable(locationId);
        }

        return false;
    },

    //  Get boatman NPC data for people panel
    getBoatmanNPC() {
        return {
            id: 'boatman',
            type: 'boatman',
            name: 'The Boatman',
            title: 'Ferryman of Worlds',
            description: 'A cloaked figure stands beside a shimmering portal. His face is hidden, but you sense ancient power.',
            portrait: 'boatman',
            voice: 'ash', // ���💀 Deep, mysterious voice for the Boatman
            personality: 'mysterious',
            speakingStyle: 'cryptic',
            voiceInstructions: 'Speak slowly and ominously. Your voice echoes as if from beyond the veil. Pause between sentences.',
            isSpecial: true,
            canTrade: false,
            canChat: true,
            hasPortal: true,
            actions: this.isActive ? ['chat', 'portal_normal'] : ['chat', 'portal_doom'],
            greetings: [
                "Another soul seeks passage... the portal awaits.",
                "I've ferried many across... few return unchanged.",
                "The veil between worlds grows thin. Will you cross?",
                "Coin means nothing here. Only courage matters."
            ]
        };
    },

    //  Play Boatman voice with API TTS
    async playBoatmanVoice(action = 'greeting') {
        const boatman = this.getBoatmanNPC();

        try {
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                const instruction = this.getBoatmanInstruction(action);
                const destination = this.isActive ? 'the normal world' : 'the Doom World';

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    boatman,
                    action === 'portal'
                        ? `The player is about to step through the portal to ${destination}. Give a brief, ominous farewell.`
                        : `Greet the player who approaches the portal. Offer passage to ${destination}. Be cryptic and mysterious.`,
                    [],
                    {
                        action: action,
                        context: 'boatman_portal',
                        destination: destination
                    }
                );

                if (response && response.text) {
                    NPCVoiceChatSystem.playVoice(response.text, boatman.voice || 'ash');
                    return response.text;
                }
            }
        } catch (e) {
            console.warn('⛵ Boatman voice failed, using fallback:', e);
        }

        // Fallback to hardcoded greeting
        const fallback = boatman.greetings[Math.floor(Math.random() * boatman.greetings.length)];
        return fallback;
    },

    //  Play arrival voice when entering doom world
    async playDoomArrivalVoice() {
        try {
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    {
                        type: 'narrator',
                        name: 'The Void',
                        voice: 'ash',
                        personality: 'ominous',
                        speakingStyle: 'dramatic'
                    },
                    'Describe the player arriving in the Doom World - a dark, corrupted version of the realm. Be brief but atmospheric. Mention the changed sky, the despair, the danger.',
                    [],
                    { action: 'narration', context: 'doom_arrival' }
                );

                if (response && response.text) {
                    NPCVoiceChatSystem.playVoice(response.text, 'ash');
                }
            }
        } catch (e) {
            console.warn('💀 Doom arrival voice failed:', e);
        }
    },

    // 
    //  WORLD SWITCHING
    // 
    enterDoomWorld(fromLocation) {
        console.log(`💀 Entering Doom World from ${fromLocation}...`);

        this.isActive = true;
        this.entryDungeon = fromLocation;

        //  Mark that player has entered doom world (unlocks doom quests in quest log - NO SPOILERS!)
        this.hasEverEntered = true;
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem._hasEnteredDoomWorld = true;
        }
        localStorage.setItem('mtg_hasEnteredDoom', 'true');

        //  Use TravelSystem's portal function
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.portalToDoomWorld(fromLocation);
        }

        //  BOATMAN MUST BE AT BOTH DUNGEONS IN DOOM WORLD - only way out!
        // The Boatman is the ONLY way to exit doom world (no debooger cheats in real gameplay)
        this.boatmanLocations.add('shadow_dungeon');
        this.boatmanLocations.add('forest_dungeon');
        this._spawnBoatman('shadow_dungeon');
        this._spawnBoatman('forest_dungeon');

        //  Apply doom effects
        this._applyDoomEffects();

        //  Register doom quests with main quest system
        if (typeof DoomQuestSystem !== 'undefined') {
            DoomQuestSystem.registerDoomQuests();
            DoomQuestSystem.startIntroQuest();
        }

        //  Emit world change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('doom:entered', {
                entryLocation: fromLocation,
                doomLocation: this.getDoomLocationName(fromLocation)
            });
        }

        this._saveState();

        //  Show atmospheric message
        if (typeof game !== 'undefined' && game.addMessage) {
            game.addMessage('💀 The world twists and darkens. You have entered the Doom World.', 'danger');
            game.addMessage('⚠️ Gold is nearly worthless here. Survival items are the true currency.', 'warning');
        }

        //  Play doom arrival narration with API TTS
        setTimeout(() => {
            this.playDoomArrivalVoice();
        }, 1500); // Delay for dramatic effect after portal

        //  Update quest log to now show doom quests
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateQuestLogUI?.();
        }

        //  CENTER MAP ON PLAYER LOCATION
        if (typeof GameWorldRenderer !== 'undefined') {
            if (GameWorldRenderer.centerOnLocation) {
                GameWorldRenderer.centerOnLocation(fromLocation);
            } else if (GameWorldRenderer.centerOnPlayer) {
                GameWorldRenderer.centerOnPlayer();
            }
        }
    },

    exitDoomWorld(toLocation = null) {
        //  If no location specified, use CURRENT location (wherever player is now)
        const exitLocation = toLocation ||
                             game?.currentLocation?.id ||
                             TravelSystem?.playerPosition?.currentLocation ||
                             'greendale';

        console.log(`💀 Exiting Doom World to ${exitLocation}...`);

        this.isActive = false;

        //  Get the FULL normal world location object
        const normalLocation = GameWorld?.locations?.[exitLocation];
        const normalName = normalLocation?.name || exitLocation;

        //  Switch TravelSystem back to normal world
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.currentWorld = 'normal';
            TravelSystem.saveCurrentWorld();
            TravelSystem.playerPosition.currentLocation = exitLocation;
        }

        //  MARK EXIT LOCATION AS VISITED in normal world so it shows on map!
        if (typeof GameWorld !== 'undefined') {
            if (!GameWorld.visitedLocations.includes(exitLocation)) {
                GameWorld.visitedLocations.push(exitLocation);
                console.log('🌅 Added exit location to normal world visited:', exitLocation);
            }
            //  Also discover paths to connected locations
            if (normalLocation?.connections && typeof TravelSystem !== 'undefined') {
                normalLocation.connections.forEach(connId => {
                    TravelSystem.discoverPath(exitLocation, connId);
                });
            }
        }

        //  PROPERLY SET game.currentLocation to FULL normal world location object
        if (normalLocation) {
            if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
                WorldStateManager.setCurrentLocation({ ...normalLocation }, 'doom_exit');
                WorldStateManager.setCurrentWorld('normal', 'doom_exit');
            } else if (typeof game !== 'undefined') {
                game.currentLocation = { ...normalLocation };
            }
        }
        if (typeof game !== 'undefined') {
            game.inDoomWorld = false;
            //  Also sync game.visitedLocations if it exists
            if (game.visitedLocations && !game.visitedLocations.includes(exitLocation)) {
                game.visitedLocations.push(exitLocation);
            }
            console.log('🌅 game.currentLocation set to:', game.currentLocation?.name, game.currentLocation?.id);
        }

        //  Remove doom effects
        this._removeDoomEffects();
        document.body.classList.remove('doom-world');

        //  Restore normal weather
        if (typeof WeatherSystem !== 'undefined') {
            WeatherSystem.changeWeather('clear');
        }

        //  Restore normal world backdrop/background based on current season
        if (typeof GameWorldRenderer !== 'undefined') {
            //  Force exit dungeon mode flag
            GameWorldRenderer.isInDungeonMode = false;

            //  Get current season and load that backdrop
            let currentSeason = 'summer';
            if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
                currentSeason = TimeSystem.getSeason().toLowerCase();
            }

            //  FORCE clear currentSeason so loadSeasonalBackdrop doesn't skip reload
            GameWorldRenderer.currentSeason = null;

            //  Load seasonal backdrop directly
            if (GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(currentSeason);
                console.log(`🌅 Normal world ${currentSeason} backdrop restored`);
            }
        }

        //  Emit world change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('world:changed', { world: 'normal', exitLocation: exitLocation });
            EventBus.emit('doom:exited', { exitLocation: exitLocation });
        }

        this._saveState();

        //  Show atmospheric message
        if (typeof game !== 'undefined' && game.addMessage) {
            game.addMessage('🌅 The darkness fades. You have returned to the normal world.', 'success');
            game.addMessage(`📍 You are now at ${normalName}.`, 'info');
        }

        //  Refresh ALL panels to show normal world data
        if (typeof PeoplePanel !== 'undefined') PeoplePanel.refresh?.();
        if (typeof TravelPanelMap !== 'undefined') TravelPanelMap.render?.();
        if (typeof GameWorldRenderer !== 'undefined') {
            GameWorldRenderer.render?.();
            GameWorldRenderer.updatePlayerMarker?.();
            //  CENTER MAP ON PLAYER LOCATION
            if (GameWorldRenderer.centerOnLocation) {
                GameWorldRenderer.centerOnLocation(exitLocation);
            } else if (GameWorldRenderer.centerOnPlayer) {
                GameWorldRenderer.centerOnPlayer();
            }
        }
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateQuestLogUI?.();
            QuestSystem.updateQuestTracker?.();
        }
    },

    _onWorldChanged(data) {
        if (data.world === 'doom') {
            this.isActive = true;
            this._applyDoomEffects();
        } else {
            this.isActive = false;
            this._removeDoomEffects();
        }
    },

    // 
    //  DOOM EFFECTS
    // 
    _applyDoomEffects() {
        //  Add CSS class for doom styling
        document.body.classList.add('doom-world');

        //  Apply doom color scheme
        const root = document.documentElement;
        root.style.setProperty('--doom-bg', '#1a0a0a');
        root.style.setProperty('--doom-text', '#8b0000');
        root.style.setProperty('--doom-accent', '#ff4444');

        //  INJECT DOOM INDICATOR INTO TOP-BAR-WIDGETS (next to time widget)
        this._showDoomIndicator();

        //  Update DoomWorldConfig if available
        if (typeof DoomWorldConfig !== 'undefined') {
            DoomWorldConfig.activate();
        }

        console.log('💀 Doom effects applied');
    },

    _removeDoomEffects() {
        document.body.classList.remove('doom-world');

        const root = document.documentElement;
        root.style.removeProperty('--doom-bg');
        root.style.removeProperty('--doom-text');
        root.style.removeProperty('--doom-accent');

        //  REMOVE DOOM INDICATOR FROM TOP-BAR-WIDGETS
        this._hideDoomIndicator();

        if (typeof DoomWorldConfig !== 'undefined') {
            DoomWorldConfig.deactivate();
        }

        console.log('💀 Doom effects removed');
    },

    //  SHOW DOOM INDICATOR - Injects into top-bar-widgets (left of time widget) 
    _showDoomIndicator() {
        // Don't duplicate
        if (document.getElementById('doom-world-indicator')) return;

        const widgetsContainer = document.getElementById('top-bar-widgets');
        if (!widgetsContainer) {
            console.warn('💀 Could not find top-bar-widgets to inject doom indicator');
            return;
        }

        //  Create the indicator element matching other top-bar-indicator widgets
        const indicator = document.createElement('div');
        indicator.id = 'doom-world-indicator';
        indicator.className = 'top-bar-indicator';
        indicator.innerHTML = `
            <span class="indicator-icon">💀</span>
            <span class="indicator-text">DOOM WORLD</span>
        `;

        //  Prepend to put it FIRST (left of all other widgets including time)
        widgetsContainer.prepend(indicator);
        console.log('💀 Doom indicator injected into top-bar-widgets');
    },

    //  HIDE DOOM INDICATOR - Removes from DOM 
    _hideDoomIndicator() {
        const indicator = document.getElementById('doom-world-indicator');
        if (indicator) {
            indicator.remove();
            console.log('💀 Doom indicator removed from top-bar-widgets');
        }
    },

    // 
    //  LOCATION NAME CORRUPTION
    // 
    getDoomLocationName(normalLocationId) {
        //  First check DoomWorldNPCs for full mapping
        if (typeof DoomWorldNPCs !== 'undefined' && DoomWorldNPCs.locationNames[normalLocationId]) {
            return DoomWorldNPCs.locationNames[normalLocationId];
        }

        //  Then check DoomQuests for simpler mapping
        if (typeof DoomQuests !== 'undefined') {
            const doomLoc = DoomQuests.doomLocations['doom_' + normalLocationId];
            if (doomLoc) return doomLoc.doomName;
        }

        //  Fallback: add a doom prefix
        const prefixes = ['Burned', 'Ruined', 'Destroyed', 'Fallen', 'Blighted', 'Corrupted'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        //  Get normal name from GameWorld
        if (typeof GameWorld !== 'undefined' && GameWorld.locations[normalLocationId]) {
            return `${prefix} ${GameWorld.locations[normalLocationId].name}`;
        }

        return `${prefix} ${normalLocationId}`;
    },

    //  Get current location name (doom or normal based on state)
    getCurrentLocationName(locationId) {
        if (this.isActive) {
            return this.getDoomLocationName(locationId);
        }

        if (typeof GameWorld !== 'undefined' && GameWorld.locations[locationId]) {
            return GameWorld.locations[locationId].name;
        }

        return locationId;
    },

    // 
    //  DOOM ECONOMY
    // 
    getDoomPrice(basePrice, itemType) {
        if (!this.isActive) return basePrice;

        //  Use DoomQuests economy if available
        if (typeof DoomQuests !== 'undefined' && DoomQuests.doomEconomy) {
            return DoomQuests.doomEconomy.getDoomPrice(basePrice, itemType);
        }

        //  Use DoomWorldConfig as fallback
        if (typeof DoomWorldConfig !== 'undefined') {
            return DoomWorldConfig.getDoomPrice(itemType, basePrice);
        }

        //  Hard fallback based on item type
        const multipliers = {
            food: 10, water: 15, medicine: 12, weapons: 3,
            luxury: 0.1, jewelry: 0.1, silk: 0.2, gold: 0.01
        };

        return Math.floor(basePrice * (multipliers[itemType] || 1));
    },

    //  Get gold purchasing power in doom
    getGoldValue(goldAmount) {
        if (!this.isActive) return goldAmount;

        if (typeof DoomQuests !== 'undefined' && DoomQuests.doomEconomy) {
            return DoomQuests.doomEconomy.getGoldValue(goldAmount);
        }

        //  Gold is worth 30% of normal
        return Math.floor(goldAmount * 0.3);
    },

    // 
    //  NPC INSTRUCTIONS FOR DOOM
    // 
    getNPCInstruction(npcType, action, context = {}) {
        if (!this.isActive) return null; // Use normal instructions

        //  Use DoomNPCInstructionTemplates if available
        if (typeof DoomNPCInstructionTemplates !== 'undefined') {
            return DoomNPCInstructionTemplates.buildDoomInstruction(npcType, action, context);
        }

        //  Fallback doom context
        return `THE WORLD HAS ENDED. You are a ${npcType} surviving in the apocalypse.
Gold is worthless - only survival items matter. Speak with desperation and trauma.
${action}: Be brief, desperate, and never cheerful.`;
    },

    //  Get boatman-specific instruction
    getBoatmanInstruction(action, context = {}) {
        const baseContext = `You are the Boatman, a mysterious ferryman who transports souls between worlds.
You speak in riddles and cryptic phrases. You know the doom world intimately.
You offer passage to ${this.isActive ? 'the normal world' : 'the doom world'}.`;

        if (action === 'greeting') {
            return `${baseContext}
Greet the player with a cryptic observation about their journey.
Mention the portal and offer passage. Keep it short and mysterious.
Example: "I've ferried many across... few return unchanged. The portal awaits. Will you step through?"`;
        }

        if (action === 'portal') {
            return `${baseContext}
The player wishes to use the portal. Speak a brief, ominous farewell.
Example: "The veil parts for you... ${this.isActive ? 'return to what was' : 'embrace what could have been'}."`;
        }

        return baseContext;
    },

    // 
    //  STATE PERSISTENCE
    // 
    _saveState() {
        try {
            const state = {
                bossesDefeated: this.bossesDefeated,
                bossDefeatTime: this.bossDefeatTime,
                greedyWonDefeated: this.greedyWonDefeated,
                hasEverEntered: this.hasEverEntered,
                boatmanLocations: Array.from(this.boatmanLocations),
                entryDungeon: this.entryDungeon,
                isActive: this.isActive
            };
            localStorage.setItem('trader-claude-doom-state', JSON.stringify(state));
        } catch (e) {
            console.warn('💀 Failed to save doom state:', e);
        }
    },

    _loadState() {
        try {
            const saved = localStorage.getItem('trader-claude-doom-state');
            if (saved) {
                const state = JSON.parse(saved);
                this.bossesDefeated = state.bossesDefeated || { shadow_guardian: false, ruins_guardian: false };
                this.bossDefeatTime = state.bossDefeatTime || { shadow_guardian: null, ruins_guardian: null };
                this.greedyWonDefeated = state.greedyWonDefeated || false;
                this.hasEverEntered = state.hasEverEntered || false;
                this.boatmanLocations = new Set(state.boatmanLocations || []);
                this.entryDungeon = state.entryDungeon || null;
                this.isActive = state.isActive || false;
            }
        } catch (e) {
            console.warn('💀 Failed to load doom state:', e);
        }
    },

    //  Get/load save data for SaveManager
    getSaveData() {
        return {
            bossesDefeated: this.bossesDefeated,
            bossDefeatTime: this.bossDefeatTime,
            greedyWonDefeated: this.greedyWonDefeated,
            hasEverEntered: this.hasEverEntered,
            boatmanLocations: Array.from(this.boatmanLocations),
            entryDungeon: this.entryDungeon,
            isActive: this.isActive
        };
    },

    loadSaveData(data) {
        if (!data) return;

        this.bossesDefeated = data.bossesDefeated || { shadow_guardian: false, ruins_guardian: false };
        this.bossDefeatTime = data.bossDefeatTime || { shadow_guardian: null, ruins_guardian: null };
        this.greedyWonDefeated = data.greedyWonDefeated || false;
        this.hasEverEntered = data.hasEverEntered || false;
        this.boatmanLocations = new Set(data.boatmanLocations || []);
        this.entryDungeon = data.entryDungeon || null;
        this.isActive = data.isActive || false;

        //  Sync hasEnteredDoom flag to QuestSystem
        if (this.hasEverEntered && typeof QuestSystem !== 'undefined') {
            QuestSystem._hasEnteredDoomWorld = true;
        }

        if (this.isActive) {
            this._applyDoomEffects();
        }

        //  Check for boss respawns after loading
        this.checkBossRespawns();

        //  Re-spawn boatmen at saved locations (only if still available)
        if (this.greedyWonDefeated) {
            // Greedy Won dead = always spawn at both
            this._spawnBoatman('shadow_dungeon');
            this._spawnBoatman('forest_dungeon');
        } else {
            this.boatmanLocations.forEach(loc => {
                if (this.isBoatmanAvailable(loc)) {
                    this._spawnBoatman(loc);
                }
            });
        }
    },

    // 
    //  DEBOOGER COMMANDS
    // 
    _registerDeboogerCommands() {
        if (typeof DeboogerCommandSystem === 'undefined') return;

        DeboogerCommandSystem.registerCommand('enterdoom',
            'Enter doom world from current dungeon location',
            () => {
                const currentLoc = game?.currentLocation || 'shadow_dungeon';
                this.enterDoomWorld(currentLoc);
                return `💀 Entered Doom World from ${currentLoc}`;
            }
        );

        DeboogerCommandSystem.registerCommand('exitdoom',
            'Exit doom world back to normal',
            () => {
                const exitLoc = this.entryDungeon || 'shadow_dungeon';
                this.exitDoomWorld(exitLoc);
                return `🌅 Exited Doom World to ${exitLoc}`;
            }
        );

        DeboogerCommandSystem.registerCommand('spawnboatman',
            'Spawn boatman at shadow_dungeon and forest_dungeon',
            () => {
                this.bossesDefeated.shadow_guardian = true;
                this.bossesDefeated.ruins_guardian = true;
                this._spawnBoatman('shadow_dungeon');
                this._spawnBoatman('forest_dungeon');
                this._saveState();
                return '⛵ Boatman spawned at both dungeon locations';
            }
        );
    }
};

// 
//  EXPOSE GLOBALLY + AUTO-INIT
// 
window.DoomWorldSystem = DoomWorldSystem;

// register with Bootstrap - apocalypse waits for proper init order
Bootstrap.register('DoomWorldSystem', () => DoomWorldSystem.init(), {
    dependencies: ['GameWorld', 'EventBus'],
    priority: 25,
    severity: 'optional'
});

console.log('💀 DoomWorldSystem loaded - The apocalypse awaits your command...');
