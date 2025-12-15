// ═══════════════════════════════════════════════════════════════
// GAME - medieval trading where capitalism meets darkness
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// this whole file is basically my 3 AM coding aesthetic
// if you're reading this during normal human hours, i'm judging you

// throw functions into global scope so onclick handlers can find them
// setTimeout(0) = runs after the script finishes loading
// fallback to silent no-ops - if they don't exist, fake it quietly
setTimeout(() => {
    window.startNewGame = typeof startNewGame === 'function' ? startNewGame : () => {};
    window.loadGame = typeof loadGame === 'function' ? loadGame : () => {};
    window.showSettings = typeof showSettings === 'function' ? showSettings : () => {};
    window.createCharacter = typeof createCharacter === 'function' ? createCharacter : () => {};
    window.randomizeCharacter = typeof randomizeCharacter === 'function' ? randomizeCharacter : () => {};
    console.log('🖤 game.js exports ready');
}, 0);

// note: DeboogerSystem is defined in debooger-system.js (loaded before this file)
// Removed duplicate declaration to prevent "Identifier already declared" error

// escape HTML to prevent XSS attacks - sanitize or die
// the XSS demons are real and they're coming for your innerHTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

// debooger-only logging helper - only logs warnings in debooger mode, silent in production
// using gameDeboogerWarn to avoid conflict with button-fix.js deboogerWarn
// because naming collisions are how bugs breed in the dark
const gameDeboogerWarn = (msg) => {
    if (typeof GameConfig !== 'undefined' && GameConfig.debooger?.enabled) {
        console.warn(msg);
    }
};

// COMPACT GOLD FORMATTER - handles billions and trillions
// use this for UI displays that need to fit large numbers
// because 1000000000 looks ugly as fuck
function formatGoldCompact(amount) {
    if (amount === undefined || amount === null) return '0';
    const num = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (num >= 1000000000000) return `${sign}${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `${sign}${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${sign}${(num / 1000000).toFixed(1)}M`;
    if (num >= 10000) return `${sign}${(num / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
}
window.formatGoldCompact = formatGoldCompact; // expose globally

// DEDUPE LOGGER - prevents console spam from repetitive messages
// only logs when the message changes or enough time has passed
// because seeing the same error 1000 times doesn't make it more true
// DedupeLogger moved to src/js/core/dedupe-logger.js
// it loads before game.js so window.DedupeLogger is available

// killed the global click handler that was catching everything like a psycho
// now we use targeted delegation - surgical, not fucking nuclear
// setupEventListeners() handles the smart way

// sync character name input - simple and quiet
document.addEventListener('input', function(e) {
    if (e.target.id === 'character-name-input') {
        const name = e.target.value.trim() || 'Player';
        const playerNameElement = document.getElementById('player-name');
        if (playerNameElement) {
            playerNameElement.textContent = name;
        }
    }
}, { passive: true });

// make it global so you can poke at it from the console
window.DeboogerSystem = DeboogerSystem;

// note: CurrentTaskSystem is defined in current-task-system.js (loaded before this file)
// Removed duplicate declaration to prevent "Identifier already declared" error

// ═══════════════════════════════════════════════════════════════
// leaderboard features - retire, preview, and active scores
// ═══════════════════════════════════════════════════════════════
// LeaderboardFeatures moved to src/js/core/leaderboard-features.js
// it loads before game.js so window.LeaderboardFeatures is available

// keyboard bindings - MOVED TO src/js/ui/key-bindings.js
// 800+ lines of dead code removed by Unity on 2025-12-01
// Keyboard bindings live in src/js/ui/key-bindings.js now
// RIP dead code - 750+ lines removed here 

// ═══════════════════════════════════════════════════════════════
// game log manager - tracking everything for deboogering
// ═══════════════════════════════════════════════════════════════
// GameLogger moved to src/js/core/game-logger.js
// it loads before game.js so window.GameLogger is available
// also includes: showLogs(), downloadLogs(), clearLogs(), testDifficulty(), testAttribute(), checkButtons()

// okay so GameState is like... the different moods of our game
// (kinda like my spotify playlists but for code)
const GameState = {
    MENU: 'menu',
    LOADING: 'loading',
    CHARACTER_CREATION: 'character_creation',
    PLAYING: 'playing',
    PAUSED: 'paused',
    TRAVEL: 'travel',
    MARKET: 'market',
    INVENTORY: 'inventory',
    TRANSPORTATION: 'transportation'
};

// ═══════════════════════════════════════════════════════════════
// time system - EXTRACTED TO src/js/core/time-machine.js
// ═══════════════════════════════════════════════════════════════
// RIP inline TimeSystem - you've been promoted to your own file
// the darkness demanded better code organization
// if TimeSystem is undefined, something's wrong with script loading
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// EVENT SYSTEM - EXTRACTED TO src/js/core/event-system.js
// ═══════════════════════════════════════════════════════════════
// random events, market events, lucky finds, tax collectors
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// game state object - the beating heart of this dark empire
// ═══════════════════════════════════════════════════════════════
const game = {
    state: GameState.MENU,
    player: null,
    currentLocation: null,
    locations: [],
    items: [],
    marketPrices: {},
    gameTick: 0,
    settings: {
        soundVolume: 0.7,
        musicVolume: 0.5,
        autoSave: true,
        autoSaveInterval: 300000 // 5 minutes
    },
    
    // Death timer system
    deathTimer: {
        isActive: false,
        startTime: 0,
        duration: 24 * 60, // 24 hours in minutes
        warningShown: false
    },
    
    // Game engine properties
    isRunning: false,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0,
    targetFPS: 60,
    maxFrameTime: 100, // Cap frame time to avoid spiral of death
    
    // Modifiers from events
    marketPriceModifier: 1,
    travelSpeedModifier: 1,

    // Tutorial system flags
    inTutorial: false,          // True when tutorial mode is active
    tutorialCompleted: false,   // True once tutorial has been completed
    tutorialSkipped: false,     // True if player skipped the tutorial

    // Tracking for periodic updates (prevents double-processing)
    lastWageProcessedDay: -1,
    
    // 🦙 Ollama status tracking
    ollamaStatus: {
        available: false,
        modelReady: false,
        lastCheck: 0,
        error: null
    },

    // 🦙 Check if Ollama is running and has mistral model
    async checkOllamaStatus() {
        try {
            // Check if Ollama is running - use OllamaModelManager's discovered baseUrl
            const baseUrl = (typeof OllamaModelManager !== 'undefined' && OllamaModelManager.config?.baseUrl)
                ? OllamaModelManager.config.baseUrl
                : 'http://localhost:11434';
            const tagsResponse = await fetch(`${baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });

            if (!tagsResponse.ok) {
                this.ollamaStatus = { available: false, modelReady: false, lastCheck: Date.now(), error: 'Ollama not responding' };
                console.log('🦙 Ollama not available - NPC dialogue will use fallbacks');
                return false;
            }

            const tagsData = await tagsResponse.json();
            const models = tagsData.models || [];
            const hasMistral = models.some(m => m.name?.includes('mistral'));

            this.ollamaStatus = {
                available: true,
                modelReady: hasMistral,
                lastCheck: Date.now(),
                error: hasMistral ? null : 'Mistral model not found'
            };

            if (hasMistral) {
                console.log('🦙 Ollama ready with mistral model - NPC AI dialogue enabled!');
            } else {
                console.log('🦙 Ollama running but mistral not found. Run: ollama pull mistral');
                this.showOllamaModelPrompt();
            }

            return hasMistral;
        } catch (error) {
            this.ollamaStatus = { available: false, modelReady: false, lastCheck: Date.now(), error: error.message };
            console.log('🦙 Ollama not running - NPC dialogue will use pre-written fallbacks');
            return false;
        }
    },

    // 🦙 Show prompt to download mistral model
    showOllamaModelPrompt() {
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🦙 AI Model Not Found',
                content: `
                    <p>Ollama is running but the <strong>mistral</strong> model isn't installed.</p>
                    <p>For AI-powered NPC dialogue, run this command:</p>
                    <code style="display:block; background:#1a1a2e; padding:10px; margin:10px 0; border-radius:5px;">ollama pull mistral</code>
                    <p style="color:#888; font-size:0.9em;">Without it, NPCs will use pre-written dialogue (still works, just less dynamic).</p>
                    <p style="color:#888; font-size:0.9em;">Model size: ~4.4GB - download may take a few minutes.</p>
                `,
                closeable: true,
                buttons: [
                    { text: 'Download Now', className: 'primary', onClick: () => { ModalSystem.hide(); this.startMistralDownload(); } },
                    { text: 'Later', className: 'secondary', onClick: () => ModalSystem.hide() }
                ]
            });
        }
    },

    // 🦙 Start downloading mistral model with progress UI
    async startMistralDownload() {
        // Create progress overlay
        const overlay = document.createElement('div');
        overlay.id = 'ollama-download-overlay';
        overlay.innerHTML = `
            <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000;">
                <div style="background:#1a1a2e; border:2px solid #4a4a6a; border-radius:12px; padding:30px; max-width:500px; text-align:center;">
                    <h2 style="color:#8b5cf6; margin:0 0 20px 0;">🦙 Downloading Mistral AI Model</h2>
                    <p style="color:#aaa; margin-bottom:20px;">This enables AI-powered NPC dialogue. Size: ~4.4GB</p>
                    <div style="background:#2a2a4a; border-radius:8px; height:24px; overflow:hidden; margin-bottom:15px;">
                        <div id="ollama-progress-bar" style="background:linear-gradient(90deg, #8b5cf6, #6366f1); height:100%; width:0%; transition:width 0.3s;"></div>
                    </div>
                    <p id="ollama-progress-text" style="color:#888; font-size:0.9em; margin:0;">Starting download...</p>
                    <p id="ollama-progress-detail" style="color:#666; font-size:0.8em; margin-top:10px;"></p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const progressBar = document.getElementById('ollama-progress-bar');
        const progressText = document.getElementById('ollama-progress-text');
        const progressDetail = document.getElementById('ollama-progress-detail');

        try {
            // Start the pull request (streaming response) - use dynamic baseUrl
            const baseUrl = (typeof OllamaModelManager !== 'undefined' && OllamaModelManager.config?.baseUrl)
                ? OllamaModelManager.config.baseUrl
                : 'http://localhost:11434';
            const response = await fetch(`${baseUrl}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'mistral', stream: true })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let totalSize = 0;
            let downloadedSize = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        if (data.total) totalSize = data.total;
                        if (data.completed) downloadedSize = data.completed;

                        // Update progress
                        if (totalSize > 0) {
                            const percent = Math.round((downloadedSize / totalSize) * 100);
                            progressBar.style.width = percent + '%';
                            progressText.textContent = `${percent}% complete`;

                            const downloadedMB = (downloadedSize / 1024 / 1024).toFixed(1);
                            const totalMB = (totalSize / 1024 / 1024).toFixed(1);
                            progressDetail.textContent = `${downloadedMB} MB / ${totalMB} MB`;
                        }

                        if (data.status) {
                            progressText.textContent = data.status;
                        }

                        if (data.status === 'success') {
                            progressBar.style.width = '100%';
                            progressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
                            progressText.textContent = '✓ Download complete!';
                            progressDetail.textContent = 'AI-powered NPC dialogue is now available!';

                            // Update status
                            this.ollamaStatus.modelReady = true;

                            // Remove overlay after delay
                            setTimeout(() => overlay.remove(), 2000);
                        }
                    } catch (e) {
                        // Skip non-JSON lines
                    }
                }
            }
        } catch (error) {
            progressBar.style.background = '#ef4444';
            progressText.textContent = 'Download failed';
            progressDetail.textContent = error.message + ' - Try running: ollama pull mistral';

            // Remove overlay after delay
            setTimeout(() => overlay.remove(), 5000);
        }
    },

    // Initialize game engine
    init() {
        // 🦙 Check Ollama status (async, doesn't block init)
        this.checkOllamaStatus();

        // time machine handles its own init - just ensure it's ready
        if (typeof TimeMachine !== 'undefined' && !TimeMachine.isRunning) {
            TimeMachine.init();
        }
        EventSystem.init();
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;

        // Initialize new systems (with safety checks)
        if (typeof CityReputationSystem !== 'undefined') CityReputationSystem.init();
        if (typeof CityEventSystem !== 'undefined') CityEventSystem.init();
        if (typeof MarketPriceHistory !== 'undefined') MarketPriceHistory.init();
        if (typeof DynamicMarketSystem !== 'undefined') DynamicMarketSystem.init();
        if (typeof PropertySystem !== 'undefined') PropertySystem.init();
        if (typeof EmployeeSystem !== 'undefined') EmployeeSystem.init();
        if (typeof TradeRouteSystem !== 'undefined') TradeRouteSystem.init();
        if (typeof FinancialTracker !== 'undefined') FinancialTracker.init();
        
        // Initialize notification system
        this.initNotificationSystem();
        
        // Initialize overlay system
        this.initOverlaySystem();
        
        // Initialize UI enhancements system
        if (typeof KeyboardShortcuts !== 'undefined') {
            KeyboardShortcuts.initialize();
        }
        
        // Initialize PropertyEmployeeUI if it exists
        if (typeof PropertyEmployeeUI !== 'undefined') {
            PropertyEmployeeUI.init();
        }
    },
    
    // Main game loop
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = Math.min(currentTime - this.lastFrameTime, this.maxFrameTime);
        this.lastFrameTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / deltaTime);
        }
        
        // Update game systems
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    // Update game state
    // note: TIME MACHINE now handles time updates via TimeMachine.tick()
    // This function only updates game-specific logic, not time progression
    update(deltaTime) {
        if (this.state !== GameState.PLAYING) return;

        // time machine handles TimeSystem.update() in its own tick() loop
        // We just update the EventSystem and check for scheduled events here
        EventSystem.update();
        this.updateMarketPrices();
        this.checkScheduledEvents();

        // note: the following are now handled by TimeMachine.onTimeAdvance():
        // - CityEventSystem.updateEvents()
        // - DynamicMarketSystem.updateMarketPrices()
        // - PropertySystem.processWorkQueues()
        // - PropertySystem.processDailyIncome()
        // - TradeRouteSystem.processDailyTrade()
        // - EmployeeSystem.processWeeklyWages()

        // check for bankruptcy after financial operations
        if (typeof GameOverSystem !== 'undefined' && GameOverSystem.checkBankruptcy) {
            if (GameOverSystem.checkBankruptcy()) {
                return; // Game over - stop processing
            }
        }

        // Update travel system (handled by TimeMachine but we keep this for UI updates)
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.update();
        }

        // Check for city events
        if (this.currentLocation && typeof CityEventSystem !== 'undefined') {
            CityEventSystem.checkRandomEvents(this.currentLocation.id);
        }

        // update merchant economy (NPC purchases, gold tracking)
        if (typeof NPCMerchantSystem !== 'undefined') {
            NPCMerchantSystem.updateEconomy();
        }

        // process player stats over time - the body's slow decay (and recovery)
        // Death timer logic is handled within processPlayerStatsOverTime (starvation/dehydration)
        this.processPlayerStatsOverTime();

        // Update resource gathering system - track progress on mining/collecting
        if (typeof ResourceGatheringSystem !== 'undefined' && ResourceGatheringSystem.update) {
            ResourceGatheringSystem.update();
        }

        // Update UI
        this.updateUI();

        // Auto-save check - disabled in game loop, SaveLoadSystem handles this via TimerManager
        // the old code was spamming auto-save every frame... absolute chaos
        // if (this.settings.autoSave && Date.now() - this.lastSaveTime > this.settings.autoSaveInterval) {
        //     this.autoSave();
        // }
    },

    // track last processed minute to prevent multi-frame decay
    _lastProcessedMinute: -1,
    _lastProcessedDay: -1,

    // update player stats over time - hunger, thirst, stamina decay and health regen
    // all values pulled from GameConfig.survival - the dark heart of balance
    // track total minutes for proper stat decay across time speeds
    _lastProcessedTotalMinutes: -1,

    processPlayerStatsOverTime() {
        if (!game.player || !game.player.stats) return;

        // fix: stats only decay when TIME is flowing - paused = frozen in time
        if (typeof TimeMachine !== 'undefined' && TimeMachine.isPaused) return;

        // fix: use total minutes to properly handle FAST speeds
        // At fast speeds, time might jump from minute 3 to minute 7, SKIPPING minute 5
        // So we calculate how many 5-minute intervals have PASSED and apply decay for ALL of them
        const totalMinutes = TimeMachine.getTotalMinutes();

        // Initialize on first run
        if (this._lastProcessedTotalMinutes < 0) {
            this._lastProcessedTotalMinutes = totalMinutes;
            return;
        }

        // Calculate how many 5-minute intervals have passed
        const lastInterval = Math.floor(this._lastProcessedTotalMinutes / 5);
        const currentInterval = Math.floor(totalMinutes / 5);
        const intervalsPassed = currentInterval - lastInterval;

        // No intervals passed yet
        if (intervalsPassed <= 0) return;

        // Update tracked time
        this._lastProcessedTotalMinutes = totalMinutes;

        // pull survival config from GameConfig (or use defaults if config isn't loaded)
        // Hunger: 5 days (100% to 0%), Thirst: 3 days (100% to 0%), Health drain: 1 day at 0% vitals
        const survivalConfig = (typeof GameConfig !== 'undefined' && GameConfig.survival) ? GameConfig.survival : {
            hunger: { decayPerUpdate: 0.0694, criticalThreshold: 20 },  // 5 days: 100/(5*1440/5) = 0.0694
            thirst: { decayPerUpdate: 0.1157, criticalThreshold: 20 },  // 3 days: 100/(3*1440/5) = 0.1157
            stamina: { regenPerUpdate: 1.667 },
            starvationDeath: { healthDrainPercent: 0.00347 },  // 1 day (24h): 100/(24*60/5) = 0.00347
            healthRegen: { baseRegenPerUpdate: 0.5, wellFedBonus: 1.0, wellFedThreshold: 70, enduranceBonusMultiplier: 0.05 }
        };

        // fix: apply seasonal effects to hunger/thirst decay
        // Seasons modify decay rates (e.g., winter = more hunger, summer = more thirst)
        const season = (typeof TimeMachine !== 'undefined' && TimeMachine.getSeasonData)
            ? TimeMachine.getSeasonData()
            : { effects: { hungerDrain: 1.0, thirstDrain: 1.0 } };
        const hungerSeasonMod = season.effects?.hungerDrain || 1.0;
        const thirstSeasonMod = season.effects?.thirstDrain || 1.0;

        // doom world multiplier - double stat drain in the apocalypse!
        // Survival is brutal in doom world - hunger and thirst drain 2x faster
        const isInDoomWorld = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld?.()) ||
                              (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                              (typeof game !== 'undefined' && game.inDoomWorld);
        const doomMultiplier = isInDoomWorld ? 2.0 : 1.0;

        // fix: apply decay for ALL intervals that passed (handles fast speeds!)
        // At FAST speed, multiple 5-minute intervals can pass in one frame
        // doom world applies 2x multiplier to hunger/thirst decay
        const hungerDecay = survivalConfig.hunger.decayPerUpdate * hungerSeasonMod * doomMultiplier * intervalsPassed;
        const thirstDecay = survivalConfig.thirst.decayPerUpdate * thirstSeasonMod * doomMultiplier * intervalsPassed;

        // hunger decay - dragged from the config's cold embrace
        game.player.stats.hunger = Math.max(0, game.player.stats.hunger - hungerDecay);

        // thirst decay - dehydration comes for us all
        game.player.stats.thirst = Math.max(0, game.player.stats.thirst - thirstDecay);

        // stamina regeneration - rest restores energy when idle
        // 0% to 100% in 5 game hours when not gathering or traveling
        // Updates every 5 minutes = 60 updates in 5 hours = 1.667 per update
        const isGathering = typeof ResourceGatheringSystem !== 'undefined' && ResourceGatheringSystem.activeGathering;
        const isTraveling = typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling;
        const isIdle = !isGathering && !isTraveling;

        if (isIdle) {
            // regenerate stamina when resting (idle)
            // fix: apply for ALL intervals that passed
            const staminaRegenRate = (survivalConfig.stamina?.regenPerUpdate || 1.667) * intervalsPassed;
            const maxStamina = game.player.stats.maxStamina || 100;
            const currentStamina = game.player.stats.stamina;

            if (currentStamina < maxStamina) {
                game.player.stats.stamina = Math.min(maxStamina, currentStamina + staminaRegenRate);

                // Occasional message when resting (only if significant change)
                if (Math.floor(currentStamina / 25) < Math.floor(game.player.stats.stamina / 25) && Math.random() < 0.1) {
                    addMessage("😴 Resting... stamina recovering.", 'info');
                }
            }
        }
        // Note: Stamina is drained by gathering (ResourceGatheringSystem) and traveling (TravelSystem) directly

        // passive health regeneration - slow but steady recovery
        // Only regenerate if hunger and thirst are above critical levels
        const hungerCrit = survivalConfig.hunger.criticalThreshold;
        const thirstCrit = survivalConfig.thirst.criticalThreshold;
        const canRegen = game.player.stats.hunger > hungerCrit && game.player.stats.thirst > thirstCrit;
        const currentHealth = game.player.stats.health;
        const maxHealth = game.player.stats.maxHealth;

        if (canRegen && currentHealth < maxHealth) {
            // Base regen from config - apply for ALL intervals
            let regenAmount = survivalConfig.healthRegen.baseRegenPerUpdate * intervalsPassed;

            // Bonus regen if well-fed and hydrated
            const wellFedThreshold = survivalConfig.healthRegen.wellFedThreshold;
            if (game.player.stats.hunger > wellFedThreshold && game.player.stats.thirst > wellFedThreshold) {
                regenAmount = survivalConfig.healthRegen.wellFedBonus * intervalsPassed;
            }

            // Bonus from endurance attribute
            const enduranceBonus = (game.player.attributes?.endurance || 5) * survivalConfig.healthRegen.enduranceBonusMultiplier * intervalsPassed;
            regenAmount += enduranceBonus;

            // Apply regen
            game.player.stats.health = Math.min(maxHealth, currentHealth + regenAmount);

            // Occasional message when significant healing occurs
            if (Math.floor(currentHealth) < Math.floor(game.player.stats.health) && Math.random() < 0.1) {
                addMessage("💚 Your body slowly recovers...", 'info');
            }
        }

        // death timer: if hunger OR thirst is at 0%, health degrades
        // uses percentage-based damage so high HP and low HP players die in same time
        const isStarving = game.player.stats.hunger <= 0;
        const isDehydrated = game.player.stats.thirst <= 0;

        if (isStarving || isDehydrated) {
            // Calculate damage as percentage of max health from config
            // fix: apply for ALL intervals that passed (handles fast speeds!)
            const maxHealthForDeath = game.player.stats.maxHealth || 100;
            const percentageDamage = maxHealthForDeath * survivalConfig.starvationDeath.healthDrainPercent * intervalsPassed;
            game.player.stats.health = Math.max(0, game.player.stats.health - percentageDamage);

            // Show appropriate warning message
            if (isStarving && isDehydrated) {
                addMessage("⚠️ You're starving AND dehydrated! Health decreasing.", 'warning');
            } else if (isStarving) {
                addMessage("⚠️ You're starving! Health decreasing.", 'warning');
            } else {
                addMessage("⚠️ You're dehydrated! Health decreasing.", 'warning');
            }

            // Track for death cause
            if (typeof DeathCauseSystem !== 'undefined') {
                if (isStarving) DeathCauseSystem.recordStarvation();
                if (isDehydrated) DeathCauseSystem.recordDehydration();
            }
        }

        // Update temporary effects
        if (game.player.temporaryEffects) {
            const currentTime = Date.now();
            for (const [stat, effect] of Object.entries(game.player.temporaryEffects)) {
                const elapsedMinutes = (currentTime - effect.startTime) / 60000;
                if (elapsedMinutes >= effect.duration) {
                    // Remove expired effect
                    delete game.player.temporaryEffects[stat];
                    addMessage(`The effect on ${stat} has worn off.`);
                }
            }
        }

        // check if the void claims another soul
        // guard: don't trigger death if GameOverSystem is already processing
        const isAlreadyDying = typeof GameOverSystem !== 'undefined' && GameOverSystem.isProcessingGameOver;
        if (game.player.stats.health <= 0 && !isAlreadyDying) {
            // Use DeathCauseSystem if available, otherwise fallback
            let deathCause = 'the void simply called';
            if (typeof DeathCauseSystem !== 'undefined') {
                deathCause = DeathCauseSystem.getDeathCause();
            } else {
                // Fallback diagnosis
                if (game.player.stats.hunger <= 0 && game.player.stats.thirst <= 0) {
                    deathCause = 'withered away - hungry and parched';
                } else if (game.player.stats.hunger <= 0) {
                    deathCause = 'starved while surrounded by gold';
                } else if (game.player.stats.thirst <= 0) {
                    deathCause = 'died of thirst - ironic, really';
                }
            }
            handlePlayerDeath(deathCause);
        }

        updatePlayerStats();
    },

    // Render game
    render() {
        if (this.state !== GameState.PLAYING) return;
        
        // Render canvas
        this.renderGameWorld();
        
        // Apply day/night effects
        this.applyDayNightEffects();
    },
    
    // Render game world on canvas
    renderGameWorld() {
        const ctx = elements.ctx;
        const canvas = elements.gameCanvas;
        
        if (!ctx || !canvas) return;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get time info for dynamic rendering
        const timeInfo = TimeMachine.getTimeInfo();
        
        // Draw background based on time of day
        if (timeInfo.isNight) {
            ctx.fillStyle = '#0a0a1a';
        } else if (timeInfo.isEvening) {
            ctx.fillStyle = '#1a0f0a';
        } else if (timeInfo.isMorning) {
            ctx.fillStyle = '#f5f5dc';
        } else {
            ctx.fillStyle = '#87ceeb';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw time info
        ctx.fillStyle = timeInfo.isNight ? '#ffffff' : '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(TimeMachine.getFormattedTime(), 10, 30);
        
        // Draw location info
        if (this.currentLocation) {
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentLocation.name, canvas.width / 2, 50);
            ctx.font = '14px Arial';
            ctx.fillText(this.currentLocation.description, canvas.width / 2, 80);
        }
        
        // Draw active events
        const activeEvents = EventSystem.getActiveEvents();
        if (activeEvents.length > 0) {
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffaa00';
            let yOffset = 30;
            activeEvents.forEach(event => {
                ctx.fillText(`📢 ${event.name}`, canvas.width - 10, yOffset);
                yOffset += 20;
            });
        }
        
        // Draw player info
        if (this.player) {
            ctx.fillStyle = '#4fc3f7';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`💰 ${this.player.gold} gold`, 10, canvas.height - 40);
            const transport = transportationOptions && transportationOptions[this.player.transportation];
            const carryCapacity = transport ? transport.carryCapacity : 50;
            ctx.fillText(`🎒 ${this.player.currentLoad}/${carryCapacity} lbs`, 10, canvas.height - 20);
        }
    },
    
    // Update market prices based on time and events
    updateMarketPrices() {
        const timeInfo = TimeMachine.getTimeInfo();
        
        // Base price fluctuations
        Object.keys(this.marketPrices).forEach(itemId => {
            if (!this.marketPrices[itemId].basePrice) {
                this.marketPrices[itemId].basePrice = this.marketPrices[itemId].price;
            }
            
            // Random fluctuation
            const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
            let newPrice = this.marketPrices[itemId].basePrice * (1 + fluctuation);
            
            // Apply time-based modifiers
            if (timeInfo.isMorning) {
                newPrice *= 1.02; // Morning premium
            } else if (timeInfo.isEvening) {
                newPrice *= 0.98; // Evening discount
            }
            
            // Apply event modifiers
            newPrice *= this.marketPriceModifier;
            
            this.marketPrices[itemId].price = Math.round(newPrice);
        });
    },
    
    // Check for scheduled time-based events
    checkScheduledEvents() {
        const timeInfo = TimeMachine.getTimeInfo();
        
        // Daily market reset
        if (timeInfo.hour === 6 && timeInfo.minute === 0) {
            this.resetDailyMarket();
        }
        
        // Weekly special events
        if (timeInfo.day === 1 && timeInfo.hour === 10 && timeInfo.minute === 0) {
            EventSystem.triggerEvent('weekly_market');
        }
        
        // Monthly merchant caravan
        if (timeInfo.day === 15 && timeInfo.hour === 14 && timeInfo.minute === 0) {
            EventSystem.triggerEvent('merchant_caravan');
        }
    },
    
    // Reset daily market
    resetDailyMarket() {
        // Refresh inventory and prices
        console.log('Daily market reset');
        addMessage('The market has refreshed with new goods!');
    },
    
    // Apply day/night visual effects - fixed CSS filter syntax
    applyDayNightEffects() {
        const timeInfo = TimeMachine.getTimeInfo();
        const canvas = elements.gameCanvas;

        if (!canvas) return;

        // use proper CSS filter functions - brightness and sepia for day/night vibes
        let filterValue = 'none';

        if (timeInfo.isNight) {
            // dark blue night - reduce brightness, add slight blue shift via hue-rotate
            filterValue = 'brightness(0.6) saturate(0.8) hue-rotate(200deg)';
        } else if (timeInfo.isEvening) {
            // warm evening glow - slight orange/sepia tint
            filterValue = 'brightness(0.9) sepia(0.2) saturate(1.1)';
        } else if (timeInfo.isMorning) {
            // soft morning light - slight warm brightness boost
            filterValue = 'brightness(1.05) saturate(0.95)';
        }

        canvas.style.filter = filterValue;
    },
    
    // Update UI elements
    updateUI() {
        // Update time display
        const timeDisplay = document.getElementById('game-time');
        if (timeDisplay) {
            timeDisplay.textContent = TimeMachine.getFormattedTime();
        }

        // Update time control buttons
        this.updateTimeControls();

        // universal financial tracking - update gold display every tick
        // This ensures all sales, purchases, wages, and income show immediately
        if (typeof updatePlayerInfo === 'function') {
            updatePlayerInfo();
        }

        // sync game.player.gold with GoldManager/UniversalGoldManager if available
        if (typeof UniversalGoldManager !== 'undefined' && this.player) {
            const currentGold = UniversalGoldManager.getPersonalGold();
            if (this.player.gold !== currentGold) {
                this.player.gold = currentGold;
            }
        } else if (typeof GoldManager !== 'undefined' && this.player) {
            const currentGold = GoldManager.getGold();
            if (this.player.gold !== currentGold) {
                this.player.gold = currentGold;
            }
        }
    },
    
    // Update time control button states
    updateTimeControls() {
        const buttons = {
            'pause-btn': TimeMachine.isPaused,
            'normal-speed-btn': TimeMachine.currentSpeed === 'NORMAL',
            'fast-speed-btn': TimeMachine.currentSpeed === 'FAST',
            'very-fast-speed-btn': TimeMachine.currentSpeed === 'VERY_FAST'
        };
        
        Object.entries(buttons).forEach(([id, isActive]) => {
            const button = document.getElementById(id);
            if (button) {
                button.classList.toggle('active', isActive);
            }
        });
    },
    
    // Save game state - with proper null checks for systems that might not exist
    saveState() {
        return {
            player: this.player,
            currentLocation: this.currentLocation,
            locations: this.locations,
            items: this.items,
            marketPrices: this.marketPrices,
            settings: this.settings,
            timeState: typeof TimeMachine !== 'undefined' ? TimeMachine.currentTime : null,
            timeSpeed: typeof TimeMachine !== 'undefined' ? TimeMachine.currentSpeed : 'NORMAL',
            activeEvents: typeof EventSystem !== 'undefined' && EventSystem.getActiveEvents ? EventSystem.getActiveEvents() : [],
            gameTick: this.gameTick,
            properties: typeof PropertySystem !== 'undefined' && PropertySystem.getProperties ? PropertySystem.getProperties() : [],
            employees: typeof EmployeeSystem !== 'undefined' && EmployeeSystem.getEmployees ? EmployeeSystem.getEmployees() : [],
            tradeRoutes: typeof TradeRouteSystem !== 'undefined' && TradeRouteSystem.getTradeRoutes ? TradeRouteSystem.getTradeRoutes() : [],
            travelState: typeof TravelSystem !== 'undefined' && TravelSystem.getState ? TravelSystem.getState() : null
        };
    },
    
    // Load game state
    loadState(saveData) {
        // reset stat decay tracker on load - prevents multi-frame decay from previous session
        this._lastProcessedMinute = -1;

        this.player = saveData.player;
        this.currentLocation = saveData.currentLocation;
        this.locations = saveData.locations || [];
        this.items = saveData.items || [];
        this.marketPrices = saveData.marketPrices || {};
        this.settings = saveData.settings || this.settings;
        this.gameTick = saveData.gameTick || 0;
        
        // Restore property system
        if (saveData.properties) {
            PropertySystem.loadProperties(saveData.properties);
        }
        
        // Restore employee system
        if (saveData.employees) {
            EmployeeSystem.loadEmployees(saveData.employees);
        }
        
        // Restore trade routes
        if (saveData.tradeRoutes) {
            TradeRouteSystem.loadTradeRoutes(saveData.tradeRoutes);
        }
        
        // Restore travel system
        if (saveData.travelState && typeof TravelSystem !== 'undefined') {
            TravelSystem.loadState(saveData.travelState);
        }
        
        // Restore time system
        if (saveData.timeState) {
            TimeMachine.currentTime = saveData.timeState;
        }
        if (saveData.timeSpeed) {
            TimeMachine.setSpeed(saveData.timeSpeed);
        }
        
        // Restore active events
        if (saveData.activeEvents) {
            EventSystem.events = saveData.activeEvents;
        }
    },
    
    // Auto-save functionality
    lastSaveTime: 0,
    autoSave() {
        if (typeof SaveLoadSystem !== 'undefined') {
            SaveLoadSystem.autoSave();
        } else {
            // Fallback to basic auto-save
            this.lastSaveTime = Date.now();
            const saveData = this.saveState();
            try {
                localStorage.setItem('tradingGameAutoSave', JSON.stringify(saveData));
            } catch (error) {
                console.warn('Failed to auto-save game data');
                addMessage('Auto-save failed - will retry', 'warning');
            }
            console.log('Game auto-saved');
        }
    },
    
    // Start the game engine
    start() {
        this.init();
        requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    // Stop the game engine
    stop() {
        this.isRunning = false;
        
        // Clean up all event listeners
        if (typeof EventManager !== 'undefined') {
            EventManager.removeAllListeners();
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// TRANSPORT SYSTEM - EXTRACTED TO src/js/systems/economy/transport-system.js
// ═══════════════════════════════════════════════════════════════
// ~280 lines of medieval logistics glory moved out
// TRANSPORT_CATEGORY, TRANSPORT_SELLERS, TRANSPORT_PRICE_MULTIPLIERS,
// transportationOptions, TransportSystem - all now in their own file
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// game world system - EXTRACTED TO src/js/data/game-world.js
// ═══════════════════════════════════════════════════════════════
// RIP inline GameWorld - you've been promoted to your own file
// ~1500 lines of medieval world-building glory
// if GameWorld is undefined, something's wrong with script loading
// ═══════════════════════════════════════════════════════════════

/* EXTRACTED - GameWorld now lives at src/js/data/game-world.js
// ═══════════════════════════════════════════════════════════════
// 🗺️ GAME WORLD SYSTEM - the realm where dreams die and gold lives
// ═══════════════════════════════════════════════════════════════
const GameWorld = {
    // Medieval Map regions
    regions: {
        starter: {
            id: 'starter',
            name: 'Riverlands',
            description: 'A peaceful realm perfect for new merchants.',
            unlockRequirement: null, // Always available
            goldRequirement: 0
        },
        northern: {
            id: 'northern',
            name: 'Northern Highlands',
            description: 'Cold, harsh highlands with valuable furs and iron.',
            unlockRequirement: 'starter',
            goldRequirement: 500
        },
        eastern: {
            id: 'eastern',
            name: 'Eastern Kingdoms',
            description: 'Rich kingdoms with exotic spices and silks.',
            unlockRequirement: 'starter',
            goldRequirement: 750
        },
        western: {
            id: 'western',
            name: 'Western Marches',
            description: 'Wild frontiers with untapped resources and ancient ruins.',
            unlockRequirement: 'starter',
            goldRequirement: 600
        },
        southern: {
            id: 'southern',
            name: 'Southern Trade Routes',
            description: 'Prosperous merchant cities with luxury goods from distant lands.',
            unlockRequirement: 'northern',
            goldRequirement: 1000
        },
        capital: {
            id: 'capital',
            name: 'Royal Capital',
            description: 'The heart of the kingdom with rare treasures and noble patronage.',
            unlockRequirement: 'eastern',
            goldRequirement: 2000
        }
    },
    
    // Locations - SPOKE LAYOUT radiating from Royal Capital at center
    // Includes cities, towns, villages, mines, forests, farms, dungeons, caves, inns, ruins, ports
    locations: {
        // ═══════════════════════════════════════════════════════════
        // ROYAL CAPITAL - CENTER HUB (400, 300)
        // ═══════════════════════════════════════════════════════════
        royal_capital: {
            id: 'royal_capital',
            name: 'Royal Capital',
            region: 'capital',
            type: 'capital',
            description: 'The magnificent seat of the king - all roads lead here. The grand market sells luxury goods and buys rare treasures from across the realm.',
            population: 10000,
            marketSize: 'grand',
            travelCost: { base: 5 },
            connections: ['northern_outpost', 'jade_harbor', 'greendale', 'western_watch', 'kings_inn'],
            mapPosition: { x: 400, y: 300 },
            // What this location SELLS (produces/has in stock)
            sells: ['royal_goods', 'luxury_items', 'fine_clothes', 'jewelry', 'silk_garments', 'perfume', 'wine', 'spices'],
            // What this location BUYS (needs/wants to purchase)
            buys: ['artifacts', 'rare_gems', 'silk', 'gems', 'gold_bar', 'exotic_goods', 'furs', 'spices']
        },

        // ═══════════════════════════════════════════════════════════
        // CITIES (6 major cities around the capital)
        // ═══════════════════════════════════════════════════════════
        northern_outpost: {
            id: 'northern_outpost',
            name: 'Northern Outpost',
            region: 'northern',
            type: 'outpost',
            description: 'A fortified military outpost guarding the northern frontier. Pay the passage fee here to enter the Northern Territories.',
            population: 200,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['royal_capital', 'frostholm_village', 'iron_mines', 'ironforge_city'],
            mapPosition: { x: 400, y: 160 },
            sells: ['iron_sword', 'shield', 'helmet', 'chainmail', 'bandages', 'torch', 'rope'],
            buys: ['food', 'bread', 'meat', 'ale', 'furs', 'leather', 'coal']
        },
        jade_harbor: {
            id: 'jade_harbor',
            name: 'Jade Harbor',
            region: 'eastern',
            type: 'city',
            description: 'A prosperous port city where ships bring exotic goods from distant lands. Traders exchange silk, spices, and treasures.',
            population: 4000,
            marketSize: 'large',
            travelCost: { base: 8 },
            connections: ['royal_capital', 'fishermans_port', 'eastern_farm', 'silk_road_inn'],
            mapPosition: { x: 560, y: 280 },
            sells: ['silk', 'spices', 'tea', 'exotic_goods', 'porcelain', 'jade', 'perfume', 'rope', 'canvas', 'salt'],
            buys: ['fish', 'grain', 'timber', 'furs', 'iron_bar', 'gems', 'wine']
        },
        greendale: {
            id: 'greendale',
            name: 'Greendale',
            region: 'starter',
            type: 'city',
            description: 'The breadbasket of the realm. Farmers bring wheat and livestock; bakers and brewers turn them into bread and ale.',
            population: 2500,
            marketSize: 'large',
            travelCost: { base: 8 },
            connections: ['royal_capital', 'vineyard_village', 'wheat_farm', 'riverside_inn', 'sunhaven', 'riverwood'],
            mapPosition: { x: 400, y: 440 },
            sells: ['bread', 'ale', 'flour', 'cheese', 'butter', 'eggs', 'meat', 'vegetables', 'livestock'],
            buys: ['wheat', 'grain', 'milk', 'honey', 'salt', 'herbs', 'wool']
        },
        western_watch: {
            id: 'western_watch',
            name: 'Western Watch',
            region: 'western',
            type: 'outpost',
            description: 'A fortified outpost watching the wild western frontier. Pay the passage fee here to enter the Western Wilds.',
            population: 150,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['royal_capital', 'darkwood_village', 'stone_quarry', 'stonebridge'],
            mapPosition: { x: 240, y: 300 },
            sells: ['iron_sword', 'bow', 'arrows', 'rope', 'torch', 'bandages', 'map'],
            buys: ['food', 'bread', 'ale', 'leather', 'timber', 'coal']
        },
        silverkeep: {
            id: 'silverkeep',
            name: 'Silverkeep',
            region: 'northern',
            type: 'city',
            description: 'A wealthy city of jewelers and silversmiths. They craft fine jewelry from precious metals and gems.',
            population: 2200,
            marketSize: 'large',
            travelCost: { base: 10 },
            connections: ['northern_outpost', 'silver_mine', 'mountain_pass_inn'],
            mapPosition: { x: 280, y: 160 },
            sells: ['jewelry', 'gemstone', 'mirror', 'crown', 'gold_bar', 'fine_clothes'],
            buys: ['silver_ore', 'gold_ore', 'gems', 'raw_gems', 'coal']
        },
        sunhaven: {
            id: 'sunhaven',
            name: 'Sunhaven',
            region: 'southern',
            type: 'city',
            description: 'A beautiful coastal city known for wine, olive oil, and fresh seafood. Fishermen and vintners trade here.',
            population: 3200,
            marketSize: 'large',
            travelCost: { base: 8 },
            connections: ['greendale', 'sunny_farm', 'coastal_cave', 'lighthouse_inn'],
            mapPosition: { x: 520, y: 460 },
            sells: ['wine', 'fish', 'oil', 'salt', 'rope', 'canvas', 'rum'],
            buys: ['grapes', 'olives', 'wheat', 'timber', 'iron_bar', 'glass']
        },

        // ═══════════════════════════════════════════════════════════
        // VILLAGES (6 small settlements)
        // ═══════════════════════════════════════════════════════════
        frostholm_village: {
            id: 'frostholm_village',
            name: 'Frostholm',
            region: 'northern',
            type: 'village',
            description: 'A hardy village of hunters and trappers in the frozen north. They sell furs and winter gear, and need food and tools.',
            population: 200,
            marketSize: 'small',
            travelCost: { base: 10 },
            connections: ['northern_outpost', 'frozen_cave', 'winterwatch_outpost'],
            mapPosition: { x: 460, y: 100 },
            sells: ['furs', 'leather', 'hide', 'winter_clothing', 'meat'],
            buys: ['bread', 'ale', 'tools', 'rope', 'salt', 'grain']
        },
        vineyard_village: {
            id: 'vineyard_village',
            name: 'Vineyard Village',
            region: 'starter',
            type: 'village',
            description: 'A peaceful village of vintners. They grow grapes and produce fine wines and honey.',
            population: 300,
            marketSize: 'small',
            travelCost: { base: 6 },
            connections: ['greendale', 'orchard_farm'],
            mapPosition: { x: 320, y: 480 },
            sells: ['wine', 'grapes', 'honey', 'wax', 'cider'],
            buys: ['bread', 'cheese', 'tools', 'glass', 'barrels']
        },
        darkwood_village: {
            id: 'darkwood_village',
            name: 'Darkwood',
            region: 'western',
            type: 'village',
            description: 'A logging village. Lumberjacks fell trees and sell raw timber. The sawmill buys logs to make planks.',
            population: 180,
            marketSize: 'small',
            travelCost: { base: 10 },
            connections: ['western_watch', 'ancient_forest', 'hermit_grove'],
            mapPosition: { x: 160, y: 240 },
            sells: ['timber', 'planks', 'wood', 'mushrooms', 'herbs', 'rope'],
            buys: ['axe', 'food', 'ale', 'nails', 'iron_tools']
        },
        riverwood: {
            id: 'riverwood',
            name: 'Riverwood',
            region: 'starter',
            type: 'village',
            description: 'A quiet fishing hamlet by the Silver River. Fishermen sell fresh catch and need bait and nets.',
            population: 150,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['greendale', 'river_cave'],
            mapPosition: { x: 480, y: 500 },
            sells: ['fish', 'pearls', 'timber', 'rope'],
            buys: ['bread', 'ale', 'salt', 'fishing_rod', 'canvas']
        },
        hillcrest: {
            id: 'hillcrest',
            name: 'Hillcrest',
            region: 'eastern',
            type: 'village',
            description: 'A village of shepherds and dairy farmers. They sell wool, cheese, and leather.',
            population: 220,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['jade_harbor', 'eastern_farm', 'shepherds_inn'],
            mapPosition: { x: 620, y: 200 },
            sells: ['wool', 'cheese', 'leather', 'milk', 'butter', 'wool_cloth'],
            buys: ['bread', 'salt', 'dye', 'tools', 'grain']
        },
        miners_rest: {
            id: 'miners_rest',
            name: "Miner's Rest",
            region: 'western',
            type: 'village',
            description: 'A small settlement serving the nearby mines. Miners rest here and trade coal and tools.',
            population: 120,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['stone_quarry', 'deep_mine'],
            mapPosition: { x: 140, y: 380 },
            sells: ['coal', 'ale', 'simple_tools', 'torch', 'lamp'],
            buys: ['food', 'bread', 'meat', 'pickaxe', 'rope', 'bandages']
        },

        // ═══════════════════════════════════════════════════════════
        // MINES (4 mining locations) - Sell raw ore, buy tools and supplies
        // ═══════════════════════════════════════════════════════════
        iron_mines: {
            id: 'iron_mines',
            name: 'Iron Mines',
            region: 'northern',
            type: 'mine',
            description: 'Deep mines producing iron ore and coal. Miners need tools, food, and light sources.',
            population: 80,
            marketSize: 'small',
            travelCost: { base: 12 },
            connections: ['northern_outpost', 'deep_cavern'],
            mapPosition: { x: 340, y: 100 },
            sells: ['iron_ore', 'coal', 'stone'],
            buys: ['pickaxe', 'torch', 'lamp', 'rope', 'food', 'ale', 'bandages']
        },
        silver_mine: {
            id: 'silver_mine',
            name: 'Silver Mine',
            region: 'northern',
            type: 'mine',
            description: 'A lucrative silver mine. Miners extract precious silver ore and occasionally find gems.',
            population: 60,
            marketSize: 'small',
            travelCost: { base: 14 },
            connections: ['silverkeep', 'crystal_cave'],
            mapPosition: { x: 200, y: 100 },
            sells: ['silver_ore', 'gems', 'stone'],
            buys: ['pickaxe', 'torch', 'food', 'ale', 'rope', 'bandages']
        },
        deep_mine: {
            id: 'deep_mine',
            name: 'Deep Mine',
            region: 'western',
            type: 'mine',
            description: 'An incredibly deep mine where brave miners seek gold and rare gems. Very dangerous but lucrative.',
            population: 40,
            marketSize: 'tiny',
            travelCost: { base: 18 },
            connections: ['miners_rest', 'shadow_dungeon'],
            mapPosition: { x: 100, y: 420 },
            sells: ['gold_ore', 'gems', 'rare_gems', 'coal'],
            buys: ['steel_pickaxe', 'lamp', 'rope', 'food', 'bandages', 'ale']
        },

        // ═══════════════════════════════════════════════════════════
        // FORESTS (5 forest locations) - Sell gathered goods, buy tools
        // ═══════════════════════════════════════════════════════════
        ancient_forest: {
            id: 'ancient_forest',
            name: 'Ancient Forest',
            region: 'western',
            type: 'forest',
            description: 'A primordial forest where foragers gather rare herbs and ancient timber. Druids trade mystical goods.',
            population: 30,
            marketSize: 'tiny',
            travelCost: { base: 15 },
            connections: ['darkwood_village', 'druid_grove', 'forest_dungeon'],
            mapPosition: { x: 120, y: 180 },
            sells: ['herbs', 'medical_plants', 'mushrooms', 'timber', 'berries'],
            buys: ['bread', 'cheese', 'ale', 'axe', 'rope']
        },
        whispering_woods: {
            id: 'whispering_woods',
            name: 'Whispering Woods',
            region: 'eastern',
            type: 'forest',
            description: 'A mystical forest where rare magical herbs grow. Herbalists and alchemists gather here.',
            population: 20,
            marketSize: 'tiny',
            travelCost: { base: 12 },
            connections: ['hillcrest', 'fairy_cave'],
            mapPosition: { x: 680, y: 160 },
            sells: ['herbs', 'medical_plants', 'mushrooms', 'honey', 'berries'],
            buys: ['bread', 'salt', 'glass', 'cloth']
        },
        hunters_wood: {
            id: 'hunters_wood',
            name: "Hunter's Wood",
            region: 'starter',
            type: 'forest',
            description: 'A forest teeming with game. Hunters sell pelts, meat, and leather. They need arrows and food.',
            population: 25,
            marketSize: 'small',
            travelCost: { base: 10 },
            connections: ['vineyard_village', 'hunting_lodge'],
            mapPosition: { x: 260, y: 520 },
            sells: ['furs', 'leather', 'hide', 'meat', 'mutton'],
            buys: ['bow', 'arrows', 'bread', 'ale', 'rope', 'salt']
        },

        // ═══════════════════════════════════════════════════════════
        // FARMS (4 farming locations) - Sell crops, buy tools and seeds
        // ═══════════════════════════════════════════════════════════
        wheat_farm: {
            id: 'wheat_farm',
            name: 'Golden Wheat Farm',
            region: 'starter',
            type: 'farm',
            description: 'Vast golden fields of wheat. Farmers sell raw wheat and grain. Mills buy wheat to make flour.',
            population: 50,
            marketSize: 'small',
            travelCost: { base: 6 },
            connections: ['greendale', 'riverside_inn'],
            mapPosition: { x: 340, y: 380 },
            sells: ['wheat', 'grain', 'eggs', 'vegetables', 'straw'],
            buys: ['scythe', 'tools', 'seeds', 'salt', 'cloth']
        },
        eastern_farm: {
            id: 'eastern_farm',
            name: 'Sunrise Farm',
            region: 'eastern',
            type: 'farm',
            description: 'A farm growing exotic eastern crops - tea, rice, and silkworms. Trades with Jade Harbor.',
            population: 45,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['jade_harbor', 'hillcrest'],
            mapPosition: { x: 620, y: 340 },
            sells: ['tea', 'silk', 'vegetables', 'herbs', 'eggs'],
            buys: ['tools', 'seeds', 'cloth', 'salt', 'iron_tools']
        },
        orchard_farm: {
            id: 'orchard_farm',
            name: 'Orchard Farm',
            region: 'starter',
            type: 'farm',
            description: 'Beautiful orchards producing apples, pears, and cider. Beekeepers also sell honey here.',
            population: 35,
            marketSize: 'small',
            travelCost: { base: 6 },
            connections: ['vineyard_village', 'hunters_wood'],
            mapPosition: { x: 220, y: 480 },
            sells: ['apples', 'fruits', 'cider', 'honey', 'wax'],
            buys: ['tools', 'seeds', 'barrels', 'cloth']
        },
        sunny_farm: {
            id: 'sunny_farm',
            name: 'Sunny Meadows',
            region: 'southern',
            type: 'farm',
            description: 'Sun-drenched meadows growing olives and grapes. Produces olive oil and supplies Sunhaven.',
            population: 40,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['sunhaven', 'lighthouse_inn'],
            mapPosition: { x: 580, y: 520 },
            sells: ['grapes', 'oil', 'vegetables', 'herbs', 'honey'],
            buys: ['tools', 'seeds', 'barrels', 'salt', 'cloth']
        },

        // ═══════════════════════════════════════════════════════════
        // DUNGEONS (2) & RUINS (1) - Sell artifacts, buy supplies
        // ═══════════════════════════════════════════════════════════
        shadow_dungeon: {
            id: 'shadow_dungeon',
            name: 'Shadow Dungeon',
            region: 'western',
            type: 'dungeon',
            description: 'A terrifying dungeon where adventurers find ancient treasures. Dangerous but profitable.',
            population: 0,
            marketSize: 'tiny',
            travelCost: { base: 20 },
            connections: ['deep_mine'],
            mapPosition: { x: 60, y: 480 },
            sells: ['artifacts', 'gems', 'gold_bar', 'rare_gems'],
            buys: ['torch', 'lamp', 'rope', 'bandages', 'food', 'weapons']
        },
        forest_dungeon: {
            id: 'forest_dungeon',
            name: 'Overgrown Crypt',
            region: 'western',
            type: 'dungeon',
            description: 'An ancient crypt overtaken by forest. Treasure hunters find relics and enchanted items.',
            population: 0,
            marketSize: 'tiny',
            travelCost: { base: 18 },
            connections: ['ancient_forest'],
            mapPosition: { x: 80, y: 120 },
            sells: ['artifacts', 'old_books', 'gems', 'jewelry'],
            buys: ['torch', 'rope', 'bandages', 'food', 'weapons']
        },
        ruins_of_eldoria: {
            id: 'ruins_of_eldoria',
            name: 'Ruins of Eldoria',
            region: 'northern',
            type: 'ruins',
            description: 'The crumbling remains of an ancient elven city. Scholars and treasure hunters trade artifacts.',
            population: 10,
            marketSize: 'tiny',
            travelCost: { base: 16 },
            connections: ['winterwatch_outpost', 'frozen_cave'],
            mapPosition: { x: 540, y: 60 },
            sells: ['artifacts', 'old_books', 'crystals', 'parchment'],
            buys: ['torch', 'food', 'tools', 'ink', 'parchment']
        },

        // ═══════════════════════════════════════════════════════════
        // CAVES (6 cave locations) - Sell gathered cave goods
        // ═══════════════════════════════════════════════════════════
        deep_cavern: {
            id: 'deep_cavern',
            name: 'Deep Cavern',
            region: 'northern',
            type: 'cave',
            description: 'A vast underground cavern where explorers find mushrooms and crystal formations.',
            population: 15,
            marketSize: 'tiny',
            travelCost: { base: 14 },
            connections: ['iron_mines'],
            mapPosition: { x: 300, y: 60 },
            sells: ['mushrooms', 'crystals', 'stone'],
            buys: ['torch', 'lamp', 'rope', 'food']
        },
        frozen_cave: {
            id: 'frozen_cave',
            name: 'Frozen Cave',
            region: 'northern',
            type: 'cave',
            description: 'An icy cave with beautiful frozen formations and rare ice crystals.',
            population: 5,
            marketSize: 'tiny',
            travelCost: { base: 16 },
            connections: ['frostholm_village', 'ruins_of_eldoria'],
            mapPosition: { x: 520, y: 40 },
            sells: ['crystals', 'fish', 'ice_goods'],
            buys: ['torch', 'food', 'furs', 'ale']
        },
        crystal_cave: {
            id: 'crystal_cave',
            name: 'Crystal Cave',
            region: 'northern',
            type: 'cave',
            description: 'A dazzling cave filled with natural crystal formations. Collectors pay well for rare specimens.',
            population: 10,
            marketSize: 'tiny',
            travelCost: { base: 12 },
            connections: ['silver_mine'],
            mapPosition: { x: 140, y: 60 },
            sells: ['crystals', 'gems', 'mushrooms', 'stone'],
            buys: ['torch', 'lamp', 'rope', 'pickaxe', 'food']
        },
        river_cave: {
            id: 'river_cave',
            name: 'River Cave',
            region: 'starter',
            type: 'cave',
            description: 'A cave carved by an underground river. Divers find pearls and rare cave fish in its depths.',
            population: 8,
            marketSize: 'tiny',
            travelCost: { base: 10 },
            connections: ['riverwood'],
            mapPosition: { x: 540, y: 540 },
            sells: ['pearls', 'fish', 'stone', 'mushrooms'],
            buys: ['torch', 'rope', 'food', 'ale']
        },
        coastal_cave: {
            id: 'coastal_cave',
            name: 'Coastal Cave',
            region: 'southern',
            type: 'cave',
            description: 'A sea cave rumored to hold pirate treasure. Divers find pearls, coral, and occasional gold coins.',
            population: 5,
            marketSize: 'tiny',
            travelCost: { base: 12 },
            connections: ['sunhaven', 'smugglers_cove'],
            mapPosition: { x: 640, y: 500 },
            sells: ['pearls', 'gems', 'gold_bar', 'artifacts'],
            buys: ['torch', 'rope', 'food', 'weapons']
        },
        fairy_cave: {
            id: 'fairy_cave',
            name: 'Fairy Grotto',
            region: 'eastern',
            type: 'cave',
            description: 'A magical cave where fairies are said to dwell. Rare glowing mushrooms and enchanted herbs grow here.',
            population: 0,
            marketSize: 'tiny',
            travelCost: { base: 14 },
            connections: ['whispering_woods'],
            mapPosition: { x: 720, y: 120 },
            sells: ['mushrooms', 'herbs', 'medical_plants', 'crystals', 'honey'],
            buys: ['bread', 'cheese', 'cloth', 'glass']
        },

        // ═══════════════════════════════════════════════════════════
        // INNS (6 rest stops and taverns)
        // ═══════════════════════════════════════════════════════════
        kings_inn: {
            id: 'kings_inn',
            name: "King's Rest Inn",
            region: 'capital',
            type: 'inn',
            description: 'A luxurious inn near the capital, favored by nobles. Serves fine wines and gourmet meals.',
            population: 30,
            marketSize: 'small',
            travelCost: { base: 5 },
            connections: ['royal_capital', 'silk_road_inn'],
            mapPosition: { x: 460, y: 360 },
            sells: ['wine', 'ale', 'bread', 'cheese', 'meat', 'perfume'],
            buys: ['grapes', 'wheat', 'milk', 'eggs', 'spices', 'honey']
        },
        silk_road_inn: {
            id: 'silk_road_inn',
            name: 'Silk Road Inn',
            region: 'eastern',
            type: 'inn',
            description: 'A famous waystation for traveling merchants. Serves exotic eastern dishes and tea.',
            population: 50,
            marketSize: 'medium',
            travelCost: { base: 6 },
            connections: ['jade_harbor', 'kings_inn'],
            mapPosition: { x: 520, y: 360 },
            sells: ['tea', 'ale', 'bread', 'spices', 'exotic_goods'],
            buys: ['silk', 'wheat', 'vegetables', 'herbs', 'meat']
        },
        riverside_inn: {
            id: 'riverside_inn',
            name: 'Riverside Inn',
            region: 'starter',
            type: 'inn',
            description: 'A cozy inn by the river, perfect for weary travelers. Fresh fish and cold ale served daily.',
            population: 25,
            marketSize: 'small',
            travelCost: { base: 6 },
            connections: ['greendale', 'wheat_farm'],
            mapPosition: { x: 380, y: 500 },
            sells: ['fish', 'ale', 'bread', 'cheese', 'cider'],
            buys: ['wheat', 'vegetables', 'salt', 'eggs', 'honey']
        },
        mountain_pass_inn: {
            id: 'mountain_pass_inn',
            name: 'Mountain Pass Inn',
            region: 'northern',
            type: 'inn',
            description: 'A sturdy inn at a treacherous mountain pass. Hot stew and warm fires for cold travelers.',
            population: 20,
            marketSize: 'small',
            travelCost: { base: 10 },
            connections: ['silverkeep', 'ironforge_city'],
            mapPosition: { x: 220, y: 200 },
            sells: ['ale', 'bread', 'meat', 'furs', 'torch', 'rope'],
            buys: ['wheat', 'vegetables', 'coal', 'wood', 'salt']
        },
        shepherds_inn: {
            id: 'shepherds_inn',
            name: "Shepherd's Rest",
            region: 'eastern',
            type: 'inn',
            description: 'A rustic inn popular with shepherds and farmers. Famous for lamb stew and local cheese.',
            population: 15,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['hillcrest'],
            mapPosition: { x: 680, y: 260 },
            sells: ['meat', 'cheese', 'ale', 'bread', 'wool', 'leather'],
            buys: ['wheat', 'salt', 'vegetables', 'herbs', 'grain']
        },
        lighthouse_inn: {
            id: 'lighthouse_inn',
            name: 'Lighthouse Inn',
            region: 'southern',
            type: 'inn',
            description: 'An inn built around an old lighthouse. Famous for fresh seafood and sailors\' tales.',
            population: 20,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['sunhaven', 'sunny_farm'],
            mapPosition: { x: 640, y: 440 },
            sells: ['fish', 'ale', 'bread', 'salt', 'rope', 'canvas'],
            buys: ['wheat', 'vegetables', 'oil', 'grapes', 'timber']
        },
        hunting_lodge: {
            id: 'hunting_lodge',
            name: 'Hunting Lodge',
            region: 'starter',
            type: 'inn',
            description: 'A rustic lodge for hunters and adventurers. Sells game meat and hunting supplies.',
            population: 15,
            marketSize: 'small',
            travelCost: { base: 8 },
            connections: ['hunters_wood'],
            mapPosition: { x: 200, y: 560 },
            sells: ['meat', 'furs', 'leather', 'ale', 'bow', 'arrows'],
            buys: ['bread', 'salt', 'rope', 'herbs', 'bandages']
        },

        // ═══════════════════════════════════════════════════════════
        // OUTPOSTS (3 frontier locations)
        // ═══════════════════════════════════════════════════════════
        ironforge_city: {
            id: 'ironforge_city',
            name: 'Ironforge City',
            region: 'northern',
            type: 'city',
            description: 'A mighty fortress city built around ancient forges. Master smiths craft legendary weapons and armor from raw ore.',
            population: 3000,
            marketSize: 'large',
            travelCost: { base: 12 },
            connections: ['northern_outpost', 'mountain_pass_inn'],
            mapPosition: { x: 340, y: 200 },
            sells: ['iron_sword', 'steel_sword', 'iron_armor', 'chainmail', 'plate_armor', 'helmet', 'shield', 'iron_bar', 'steel_bar', 'iron_tools'],
            buys: ['iron_ore', 'coal', 'leather', 'wood', 'gold_ore']
        },
        winterwatch_outpost: {
            id: 'winterwatch_outpost',
            name: 'Winterwatch',
            region: 'northern',
            type: 'outpost',
            description: 'The northernmost outpost, guarding against wilderness threats. Soldiers buy furs and sell weapons.',
            population: 80,
            marketSize: 'small',
            travelCost: { base: 14 },
            connections: ['frostholm_village', 'ruins_of_eldoria'],
            mapPosition: { x: 480, y: 40 },
            sells: ['iron_sword', 'shield', 'iron_armor', 'rope', 'torch', 'bandages'],
            buys: ['furs', 'food', 'meat', 'ale', 'coal', 'wood']
        },
        stonebridge: {
            id: 'stonebridge',
            name: 'Stonebridge',
            region: 'western',
            type: 'village',
            description: 'An ancient village of master masons built around a great stone bridge. They craft tools and building materials from raw stone and timber.',
            population: 2800,
            marketSize: 'large',
            travelCost: { base: 12 },
            connections: ['western_watch', 'stone_quarry'],
            mapPosition: { x: 160, y: 340 },
            sells: ['bricks', 'mortar', 'tools', 'hammer', 'pickaxe', 'nails', 'planks', 'furniture'],
            buys: ['stone', 'timber', 'wood', 'iron_bar', 'clay', 'coal']
        },

        // ═══════════════════════════════════════════════════════════
        // PORTS (2 water locations)
        // ═══════════════════════════════════════════════════════════
        fishermans_port: {
            id: 'fishermans_port',
            name: "Fisherman's Port",
            region: 'eastern',
            type: 'port',
            description: 'A bustling fishing port with the freshest catch. Buy fish and salt, sell bread and ale.',
            population: 300,
            marketSize: 'medium',
            travelCost: { base: 8 },
            connections: ['jade_harbor', 'smugglers_cove'],
            mapPosition: { x: 680, y: 340 },
            sells: ['fish', 'salt', 'rope', 'canvas', 'pearls', 'oil'],
            buys: ['bread', 'ale', 'timber', 'iron_bar', 'cloth', 'grain']
        },
        smugglers_cove: {
            id: 'smugglers_cove',
            name: "Smuggler's Cove",
            region: 'eastern',
            type: 'port',
            description: 'A hidden cove where... questionable goods change hands. Rare items at inflated prices.',
            population: 60,
            marketSize: 'small',
            travelCost: { base: 14 },
            connections: ['fishermans_port', 'coastal_cave'],
            mapPosition: { x: 720, y: 420 },
            sells: ['exotic_goods', 'spices', 'rum', 'gems', 'silk', 'artifacts'],
            buys: ['gold_bar', 'jewelry', 'weapons', 'furs', 'rare_gems']
        },

        // ═══════════════════════════════════════════════════════════
        // SPECIAL LOCATIONS
        // ═══════════════════════════════════════════════════════════
        hermit_grove: {
            id: 'hermit_grove',
            name: "Hermit's Grove",
            region: 'western',
            type: 'forest',
            description: 'A mysterious clearing where a wise hermit trades rare herbs and ancient knowledge.',
            population: 5,
            marketSize: 'tiny',
            travelCost: { base: 15 },
            connections: ['darkwood_village'],
            mapPosition: { x: 100, y: 280 },
            sells: ['herbs', 'medical_plants', 'mushrooms', 'honey', 'berries'],
            buys: ['bread', 'cheese', 'cloth', 'parchment', 'ink']
        },
        druid_grove: {
            id: 'druid_grove',
            name: 'Druid Grove',
            region: 'western',
            type: 'forest',
            description: 'A sacred grove tended by mysterious druids. They trade rare healing herbs and enchanted seeds.',
            population: 15,
            marketSize: 'tiny',
            travelCost: { base: 16 },
            connections: ['ancient_forest'],
            mapPosition: { x: 60, y: 220 },
            sells: ['medical_plants', 'herbs', 'honey', 'berries', 'mushrooms'],
            buys: ['bread', 'fruit', 'vegetables', 'cloth', 'glass']
        },
        stone_quarry: {
            id: 'stone_quarry',
            name: 'Stone Quarry',
            region: 'western',
            type: 'mine',
            description: 'A massive quarry producing the finest building stone. Workers need tools and food.',
            population: 90,
            marketSize: 'medium',
            travelCost: { base: 10 },
            connections: ['western_watch', 'stonebridge', 'miners_rest'],
            mapPosition: { x: 180, y: 420 },
            sells: ['stone', 'clay', 'sand', 'bricks'],
            buys: ['pickaxe', 'tools', 'food', 'ale', 'rope', 'bandages']
        }
    },
    
    // Initialize game world
    init() {
        console.log('🌍 Initializing GameWorld...');
        this.unlockedRegions = ['starter', 'capital', 'northern', 'eastern', 'western', 'southern']; // All regions available
        this.visitedLocations = ['greendale']; // Start at Greendale (starter city)
        this.currentRegion = 'starter';

        // Try to setup market prices (may fail if ItemDatabase not loaded)
        try {
            this.setupMarketPrices();
        } catch (error) {
            console.warn('❌ setupMarketPrices failed:', error.message);
        }

        // Initialize new systems (wrap each in try-catch)
        try {
            if (typeof CityReputationSystem !== 'undefined') {
                CityReputationSystem.init();
                console.log('✅ CityReputationSystem initialized');
            }
        } catch (error) {
            console.warn('❌ CityReputationSystem.init failed:', error.message);
        }

        try {
            if (typeof CityEventSystem !== 'undefined') {
                CityEventSystem.init();
                console.log('✅ CityEventSystem initialized');
            }
        } catch (error) {
            console.warn('❌ CityEventSystem.init failed:', error.message);
        }

        try {
            if (typeof MarketPriceHistory !== 'undefined') {
                MarketPriceHistory.init();
                console.log('✅ MarketPriceHistory initialized');
            }
        } catch (error) {
            console.warn('❌ MarketPriceHistory.init failed:', error.message);
        }

        try {
            if (typeof DynamicMarketSystem !== 'undefined') {
                DynamicMarketSystem.init();
                console.log('✅ DynamicMarketSystem initialized');
            }
        } catch (error) {
            console.warn('❌ DynamicMarketSystem.init failed:', error.message);
        }

        console.log('✅ GameWorld initialization complete');
    },
    
    // Setup initial market prices for all locations
    setupMarketPrices() {
        // Check if ItemDatabase is loaded using try-catch
        try {
            if (!window.ItemDatabase) {
                throw new Error('ItemDatabase not on window object');
            }
            console.log('✅ ItemDatabase is available, setting up market prices...');
        } catch (error) {
            // 🦇 ItemDatabase not loaded - market will use fallback pricing
            console.warn('❌ ItemDatabase not loaded - using fallback market pricing');
            // Set empty market prices to prevent further errors
            Object.values(this.locations).forEach(location => {
                location.marketPrices = {};
            });
            return;
        }

        Object.values(this.locations).forEach(location => {
            location.marketPrices = {};

            // Base items available everywhere
            const baseItems = ['food', 'water', 'bread'];
            baseItems.forEach(itemId => {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    location.marketPrices[itemId] = {
                        price: ItemDatabase.calculatePrice(itemId),
                        stock: Math.floor(Math.random() * 20) + 10
                    };
                }
            });
            
            // Specialties with better prices - check if specialties array exists first
            if (location.specialties && Array.isArray(location.specialties)) {
                location.specialties.forEach(specialty => {
                    const item = ItemDatabase.getItem(specialty);
                    if (item) {
                        location.marketPrices[specialty] = {
                            price: ItemDatabase.calculatePrice(specialty, { locationMultiplier: 0.8 }), // 20% discount for specialties
                            stock: Math.floor(Math.random() * 15) + 5
                        };
                    }
                });
            }
            
            // Add random additional items based on location type
            this.addRandomMarketItems(location);
            
            // Ensure ALL items from ItemDatabase are available with proper stock
            Object.keys(ItemDatabase.items).forEach(itemId => {
                if (!location.marketPrices[itemId]) {
                    const item = ItemDatabase.getItem(itemId);
                    if (item) {
                        // Calculate stock based on location type and item rarity
                        let baseStock = 5;
                        if (location.type === 'city') baseStock = 15;
                        else if (location.type === 'town') baseStock = 10;
                        else if (location.type === 'village') baseStock = 5;
                        
                        // Adjust stock based on item rarity (rarity is now a string like 'common')
                        if (item.rarity === 'common') baseStock *= 2;
                        else if (item.rarity === 'uncommon') baseStock *= 1.5;
                        else if (item.rarity === 'rare') baseStock *= 1;
                        else if (item.rarity === 'epic') baseStock *= 0.5;
                        else if (item.rarity === 'legendary') baseStock *= 0.2;
                        
                        location.marketPrices[itemId] = {
                            price: ItemDatabase.calculatePrice(itemId),
                            stock: Math.max(1, Math.floor(baseStock + Math.random() * 10))
                        };
                    }
                }
            });
        });
    },
    
    // Add random items to market based on location type
    addRandomMarketItems(location) {
        const locationItemPools = {
            village: ['herbs', 'logs', 'stone', 'seeds', 'wool', 'clay', 'wood', 'food', 'water', 'bread', 'vegetables'],
            town: ['meat', 'fish', 'vegetables', 'fruits', 'cheese', 'tools', 'arrows', 'grain', 'ale', 'mead', 'wool', 'timber', 'bread'],
            city: ['iron_ore', 'copper_ore', 'tin', 'coal', 'hammer', 'axe', 'pickaxe', 'sword', 'spear', 'bow', 'bricks', 'mortar', 'nails', 'armor', 'steel_bar', 'iron_bar', 'gems', 'silk']
        };
        
        const itemPool = locationItemPools[location.type] || locationItemPools.town;
        const numAdditionalItems = Math.floor(Math.random() * 10) + 5; // Increased to 5-15 additional items
        
        for (let i = 0; i < numAdditionalItems; i++) {
            const randomItemId = itemPool[Math.floor(Math.random() * itemPool.length)];
            const item = ItemDatabase.getItem(randomItemId);
            
            if (item && !location.marketPrices[randomItemId]) {
                location.marketPrices[randomItemId] = {
                    price: ItemDatabase.calculatePrice(randomItemId),
                    stock: Math.floor(Math.random() * 20) + 10 // Increased stock
                };
            }
        }
    },
    
    // Get base price for an item type
    getBasePrice(itemType) {
        const basePrices = {
            // Consumables
            food: 5,
            water: 2,
            bread: 3,
            fish: 8,
            meat: 12,
            vegetables: 6,
            cheese: 15,
            fruits: 10,
            ale: 10,
            mead: 18,
            wine: 25,
            tea: 20,
            honey: 15,
            grain: 6,
            herbs: 8,
            medical_plants: 30,

            // Basic resources
            wood: 8,
            logs: 6,
            timber: 12,
            stone: 5,
            clay: 5,
            seeds: 4,
            wool: 12,
            bricks: 15,
            mortar: 8,
            coal: 6,
            trade_goods: 25,

            // Ores and metals
            iron_ore: 12,
            copper_ore: 10,
            tin: 18,
            iron_bar: 35,
            steel_bar: 100,
            minerals: 45,

            // Tools
            basic_tools: 15,
            tools: 25,
            hammer: 15,
            axe: 20,
            pickaxe: 25,
            nails: 12,

            // Weapons and armor
            weapons: 80,
            armor: 120,
            sword: 50,
            spear: 30,
            bow: 40,
            arrows: 10,

            // Livestock
            livestock: 50,

            // Luxury goods
            luxury_goods: 200,
            luxury_items: 200,
            furs: 35,
            winter_clothing: 60,
            silk: 150,
            spices: 40,
            exotic_goods: 120,
            gems: 150,
            rare_gems: 800,
            crystals: 300,
            jade: 400,
            porcelain: 250,
            ice_goods: 30,
            magic_items: 500,

            // Royal/Imperial goods
            royal_goods: 300,
            imperial_goods: 600,
            documents: 100,
            services: 75,
            information: 50,
            artifacts: 1000,
            rare_treasures: 2000,
            royal_favors: 5000,
            imperial_favors: 5000
        };

        return basePrices[itemType] || 50;
    },
    
    // Check if a region is unlocked
    isRegionUnlocked(regionId) {
        return this.unlockedRegions.includes(regionId);
    },
    
    // Unlock a new region
    unlockRegion(regionId) {
        if (!this.isRegionUnlocked(regionId)) {
            const region = this.regions[regionId];
            if (region && this.canUnlockRegion(regionId)) {
                this.unlockedRegions.push(regionId);
                addMessage(`🎉 New region unlocked: ${region.name}!`);
                return true;
            }
        }
        return false;
    },
    
    // Check if player can unlock a region
    canUnlockRegion(regionId) {
        const region = this.regions[regionId];
        if (!region) return false;
        
        // Check if required region is unlocked
        if (region.unlockRequirement && !this.isRegionUnlocked(region.unlockRequirement)) {
            return false;
        }
        
        // Check gold requirement
        if (game.player && game.player.gold >= region.goldRequirement) {
            return true;
        }
        
        return false;
    },
    
    // Get available travel destinations from current location
    getAvailableDestinations() {
        const currentLocation = this.locations[game.currentLocation.id];
        if (!currentLocation) return [];
        
        return currentLocation.connections
            .map(destId => this.locations[destId])
            .filter(dest => dest && this.isRegionUnlocked(dest.region))
            .map(dest => ({
                ...dest,
                travelCost: this.calculateTravelCost(game.currentLocation.id, dest.id),
                travelTime: this.calculateTravelTime(game.currentLocation.id, dest.id)
            }));
    },
    
    // Calculate travel cost between locations
    calculateTravelCost(fromId, toId) {
        const fromLocation = this.locations[fromId];
        const toLocation = this.locations[toId];
        
        if (!fromLocation || !toLocation) return 0;
        
        let baseCost = (fromLocation.travelCost.base + toLocation.travelCost.base) / 2;
        
        // Apply transportation modifier
        const transport = transportationOptions[game.player.transportation];
        const speedModifier = transport ? transport.speedModifier : 1.0;
        
        // Apply travel speed modifier from events
        const eventModifier = game.travelSpeedModifier || 1.0;
        
        // Calculate final cost (inverse of speed - faster travel costs more)
        const finalCost = Math.round(baseCost / (speedModifier * eventModifier));
        
        return Math.max(finalCost, 1); // Minimum cost of 1 gold
    },
    
    // Calculate travel time between locations
    // unified: all travel time calculations MUST use weather/seasonal modifiers from TimeMachine
    calculateTravelTime(fromId, toId) {
        const fromLocation = this.locations[fromId];
        const toLocation = this.locations[toId];

        if (!fromLocation || !toLocation) return 0;

        let baseTime = (fromLocation.travelCost.base + toLocation.travelCost.base) * 5; // Base time in minutes

        // Apply transportation modifier
        const transport = transportationOptions[game.player.transportation];
        const speedModifier = transport ? transport.speedModifier : 1.0;

        // Apply travel speed modifier from events
        const eventModifier = game.travelSpeedModifier || 1.0;

        // apply weather and seasonal modifiers - MUST match TravelSystem
        let weatherSpeedMod = 1.0;
        let seasonalSpeedMod = 1.0;

        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.getTravelSpeedModifier) {
            weatherSpeedMod = WeatherSystem.getTravelSpeedModifier() || 1.0;
        }

        if (typeof TimeMachine !== 'undefined' && TimeMachine.getSeasonData) {
            const seasonData = TimeMachine.getSeasonData();
            if (seasonData && seasonData.effects && seasonData.effects.travelSpeed) {
                seasonalSpeedMod = seasonData.effects.travelSpeed;
            }
        }

        // Calculate final time with ALL modifiers
        const combinedMod = speedModifier * eventModifier * weatherSpeedMod * seasonalSpeedMod;
        const finalTime = Math.round(baseTime / combinedMod);

        return Math.max(finalTime, 10); // Minimum time of 10 minutes
    },
    
    // Travel to a new location
    travelTo(locationId) {
        const destination = this.locations[locationId];
        if (!destination) {
            addMessage('Invalid destination!');
            return false;
        }
        
        if (!this.isRegionUnlocked(destination.region)) {
            addMessage('This region is not yet unlocked!');
            return false;
        }
        
        const travelCost = this.calculateTravelCost(game.currentLocation.id, locationId);
        const travelTime = this.calculateTravelTime(game.currentLocation.id, locationId);
        
        if (game.player.gold < travelCost) {
            addMessage(`You need ${travelCost} gold to travel to ${destination.name}!`);
            return false;
        }
        
        // Deduct travel cost
        game.player.gold -= travelCost;
        
        // Schedule arrival event
        const arrivalTime = TimeMachine.getTotalMinutes() + travelTime;
        EventSystem.scheduleEvent('travel_complete', arrivalTime, {
            destination: locationId,
            cost: travelCost
        });

        // track journey start for achievements (Start Your Journey!)
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.trackJourneyStart) {
            AchievementSystem.trackJourneyStart(locationId);
        }

        // Start travel
        addMessage(`🚶 Traveling to ${destination.name}... (Arrival in ${travelTime} minutes)`);
        
        // Update UI
        updatePlayerInfo();
        
        return true;
    },
    
    // Complete travel (called by event system)
    completeTravel(locationId) {
        const destination = this.locations[locationId];
        if (!destination) return;

        // Update current location via WorldStateManager
        const locationData = {
            id: destination.id,
            name: destination.name,
            description: destination.description
        };
        if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
            WorldStateManager.setCurrentLocation(locationData, 'game_complete_travel');
        } else {
            game.currentLocation = locationData;
        }
        
        // Mark as visited
        if (!this.visitedLocations.includes(locationId)) {
            this.visitedLocations.push(locationId);
            addMessage(`📍 First time visiting ${destination.name}!`);
        }
        
        // Update UI
        updateLocationInfo();
        updateLocationPanel();
        
        addMessage(`✅ Arrived at ${destination.name}!`);
    },
    
    // Get location market data
    getLocationMarket(locationId) {
        const location = this.locations[locationId];
        if (!location) return null;
        
        return {
            ...location.marketPrices,
            locationInfo: {
                name: location.name,
                type: location.type,
                specialties: location.specialties,
                marketSize: location.marketSize
            }
        };
    },
    
    // Update market prices for a location
    updateLocationMarket(locationId) {
        const location = this.locations[locationId];
        if (!location) return;
        
        // Update existing items
        Object.keys(location.marketPrices).forEach(itemType => {
            const currentPrice = location.marketPrices[itemType].price;
            const fluctuation = (Math.random() - 0.5) * 0.2; // ±10% fluctuation
            location.marketPrices[itemType].price = Math.round(currentPrice * (1 + fluctuation));
            
            // Update stock
            const stockChange = Math.floor((Math.random() - 0.5) * 4);
            location.marketPrices[itemType].stock = Math.max(0,
                location.marketPrices[itemType].stock + stockChange);
        });
    },
    
    // Tool and Upgrade System
    tools: {
        // Basic tools
        axe: {
            id: 'axe',
            name: 'Basic Axe',
            description: 'A simple axe for chopping wood.',
            type: 'tool',
            resource: 'wood',
            efficiency: 1.0,
            durability: 100,
            price: 15,
            requiredSkill: 0
        },
        pickaxe: {
            id: 'pickaxe',
            name: 'Pickaxe',
            description: 'For mining stone and minerals.',
            type: 'tool',
            resource: 'stone',
            efficiency: 1.0,
            durability: 120,
            price: 20,
            requiredSkill: 0
        },
        hammer: {
            id: 'hammer',
            name: 'Hammer',
            description: 'Basic hammer for construction.',
            type: 'tool',
            resource: 'iron',
            efficiency: 1.0,
            durability: 80,
            price: 12,
            requiredSkill: 0
        },
        fishing_rod: {
            id: 'fishing_rod',
            name: 'Fishing Rod',
            description: 'For catching fish.',
            type: 'tool',
            resource: 'fish',
            efficiency: 1.0,
            durability: 60,
            price: 18,
            requiredSkill: 0
        },
        cooking_pot: {
            id: 'cooking_pot',
            name: 'Cooking Pot',
            description: 'Basic pot for cooking food.',
            type: 'tool',
            resource: 'food',
            efficiency: 1.0,
            durability: 90,
            price: 25,
            requiredSkill: 0
        },
        shovel: {
            id: 'shovel',
            name: 'Shovel',
            description: 'For digging and gathering resources.',
            type: 'tool',
            resource: 'stone',
            efficiency: 1.0,
            durability: 100,
            price: 15,
            requiredSkill: 0
        },
        knife: {
            id: 'knife',
            name: 'Knife',
            description: 'Sharp knife for various tasks.',
            type: 'tool',
            resource: 'herbs',
            efficiency: 1.0,
            durability: 70,
            price: 10,
            requiredSkill: 0
        },
        saw: {
            id: 'saw',
            name: 'Hand Saw',
            description: 'For cutting wood efficiently.',
            type: 'tool',
            resource: 'wood',
            efficiency: 1.2,
            durability: 110,
            price: 30,
            requiredSkill: 1
        },
        
        // Upgraded tools
        strong_axe: {
            id: 'strong_axe',
            name: 'Strong Axe',
            description: 'A sturdy axe that chops wood 50% faster.',
            type: 'upgrade',
            resource: 'wood',
            efficiency: 1.5,
            durability: 200,
            price: 50,
            requiredSkill: 2,
            requires: 'axe'
        },
        hot_oven: {
            id: 'hot_oven',
            name: 'Hot Oven',
            description: 'Cooks food 30% faster and preserves nutrients.',
            type: 'upgrade',
            resource: 'food',
            efficiency: 1.3,
            durability: 300,
            price: 80,
            requiredSkill: 3,
            requires: 'cooking_pot'
        },
        fast_hammer: {
            id: 'fast_hammer',
            name: 'Fast Hammer',
            description: 'Works 40% faster than basic hammer.',
            type: 'upgrade',
            resource: 'iron',
            efficiency: 1.4,
            durability: 150,
            price: 35,
            requiredSkill: 2,
            requires: 'hammer'
        },
        sharp_knife: {
            id: 'sharp_knife',
            name: 'Sharp Knife',
            description: 'Gathers herbs 25% more efficiently.',
            type: 'upgrade',
            resource: 'herbs',
            efficiency: 1.25,
            durability: 120,
            price: 25,
            requiredSkill: 1,
            requires: 'knife'
        },
        durable_saw: {
            id: 'durable_saw',
            name: 'Durable Saw',
            description: 'Cuts wood 60% faster with less wear.',
            type: 'upgrade',
            resource: 'wood',
            efficiency: 1.6,
            durability: 250,
            price: 60,
            requiredSkill: 3,
            requires: 'saw'
        },
        golden_fishing_rod: {
            id: 'golden_fishing_rod',
            name: 'Golden Fishing Rod',
            description: 'Catches fish twice as often.',
            type: 'upgrade',
            resource: 'fish',
            efficiency: 2.0,
            durability: 180,
            price: 100,
            requiredSkill: 4,
            requires: 'fishing_rod'
        },
        iron_cooking_pot: {
            id: 'iron_cooking_pot',
            name: 'Iron Cooking Pot',
            description: 'Cooks 20% more food at once.',
            type: 'upgrade',
            resource: 'food',
            efficiency: 1.2,
            durability: 200,
            price: 45,
            requiredSkill: 2,
            requires: 'cooking_pot'
        },
        steel_pickaxe: {
            id: 'steel_pickaxe',
            name: 'Steel Pickaxe',
            description: 'Mines minerals 50% faster.',
            type: 'upgrade',
            resource: 'minerals',
            efficiency: 1.5,
            durability: 220,
            price: 75,
            requiredSkill: 3,
            requires: 'pickaxe'
        }
    },
    
    // Get tool by ID
    getTool(toolId) {
        return this.tools[toolId] || null;
    },
    
    // Get available tools for player
    getAvailableTools() {
        if (!game.player) return [];
        
        return Object.values(this.tools).filter(tool => {
            // Check if player has required skill
            const skillLevel = game.player.skills[tool.resource] || 0;
            if (skillLevel < tool.requiredSkill) {
                return false;
            }
            
            // Check if player has required base tool for upgrades
            if (tool.requires && !game.player.ownedTools?.includes(tool.requires)) {
                return false;
            }
            
            // Check if player already owns this tool
            if (game.player.ownedTools?.includes(tool.id)) {
                return false;
            }
            
            return true;
        });
    },
    
    // Get player's owned tools
    getPlayerTools() {
        if (!game.player || !game.player.ownedTools) return [];
        
        return game.player.ownedTools.map(toolId => this.getTool(toolId)).filter(tool => tool);
    },
    
    // Purchase tool
    purchaseTool(toolId) {
        const tool = this.getTool(toolId);
        if (!tool) {
            addMessage('Invalid tool!');
            return false;
        }
        
        if (game.player.gold < tool.price) {
            addMessage(`You need ${tool.price} gold to purchase ${tool.name}!`);
            return false;
        }
        
        // Check requirements
        const skillLevel = game.player.skills[tool.resource] || 0;
        if (skillLevel < tool.requiredSkill) {
            addMessage(`You need skill level ${tool.requiredSkill} in ${tool.resource} to use this tool!`);
            return false;
        }
        
        // Purchase tool
        game.player.gold -= tool.price;
        
        if (!game.player.ownedTools) {
            game.player.ownedTools = [];
        }
        
        game.player.ownedTools.push(toolId);
        
        // Initialize tool durability
        if (!game.player.toolDurability) {
            game.player.toolDurability = {};
        }
        game.player.toolDurability[toolId] = tool.durability;
        
        addMessage(`Purchased ${tool.name} for ${tool.price} gold!`);
        updatePlayerInfo();
        
        return true;
    },
    
    // Use tool for resource gathering
    useTool(toolId, amount = 1) {
        const tool = this.getTool(toolId);
        if (!tool) return null;
        
        if (!game.player.ownedTools?.includes(toolId)) {
            addMessage(`You don't own a ${tool.name}!`);
            return null;
        }
        
        const durability = game.player.toolDurability?.[toolId] || 0;
        if (durability <= 0) {
            addMessage(`Your ${tool.name} is broken!`);
            return null;
        }
        
        // Calculate resource gain
        const baseAmount = amount * tool.efficiency;
        const skillBonus = 1 + ((game.player.skills[tool.resource] || 0) * 0.1);
        const finalAmount = Math.round(baseAmount * skillBonus);
        
        // Reduce durability
        game.player.toolDurability[toolId] = Math.max(0, durability - amount);
        
        return {
            resource: tool.resource,
            amount: finalAmount,
            toolUsed: toolId,
            durabilityRemaining: game.player.toolDurability[toolId]
        };
    },
    
    // Repair tool
    repairTool(toolId) {
        const tool = this.getTool(toolId);
        if (!tool) return false;
        
        const repairCost = Math.round(tool.price * 0.3); // 30% of original price
        
        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair ${tool.name}!`);
            return false;
        }
        
        game.player.gold -= repairCost;
        game.player.toolDurability[toolId] = tool.durability;
        
        addMessage(`Repaired ${tool.name} for ${repairCost} gold!`);
        updatePlayerInfo();
        
        return true;
    }
};
/* END OF EXTRACTED GameWorld */

// ═══════════════════════════════════════════════════════════════
// PERK SYSTEM - EXTRACTED TO src/js/ui/perk-system.js
// ═══════════════════════════════════════════════════════════════
// Session #78: ~275 lines of tragic backstory data moved out
// PerkSystem.perks contains all perk definitions
// window.perks maintained for backward compatibility
// ═══════════════════════════════════════════════════════════════

/* EXTRACTED - Perks now live in PerkSystem
const perks = {
    lumberjack: {...},
    disbandedSoldier: {...},
    orphan: {...},
    merchantSon: {...},
    farmersBoy: {...},
    nobleOutcast: {...},
    sailorsDaughter: {...},
    minersSon: {...},
    scholarApprentice: {...},
    gamblersDaughter: {...},
    hunterSon: {...},
    monkInitiate: {...}
};
END EXTRACTED */

// 🖤 Backward compatibility shim - PerkSystem MUST be loaded before game.js
if (typeof PerkSystem === 'undefined') {
    console.error('🚨 CRITICAL: PerkSystem not loaded! Check that perk-system.js is included before game.js');
}
const perks = (typeof PerkSystem !== 'undefined') ? PerkSystem.perks : {};

// make perks globally accessible for character sheet lookups
window.perks = perks;

// Character attributes
const baseAttributes = {
    strength: 5,  // Start at 5 (can go down to 1, up to 10)
    intelligence: 5,
    charisma: 5,
    endurance: 5,
    luck: 5
};

// DOM Elements
const elements = {
    // Screens
    loadingScreen: null,
    mainMenu: null,
    gameContainer: null,
    
    // Panels
    characterPanel: null,
    marketPanel: null,
    inventoryPanel: null,
    locationPanel: null,
    travelPanel: null,
    transportationPanel: null,
    messageLog: null,
    
    // Game World
    gameCanvas: null,
    ctx: null,
    
    // UI Elements
    playerName: null,
    playerGold: null,
    messages: null,
    
    // Buttons
    newGameBtn: null,
    loadGameBtn: null,
    settingsBtn: null,
    createCharacterBtn: null,
    visitMarketBtn: null,
    travelBtn: null,
    transportationBtn: null,
    transportationQuickBtn: null,
    closeMarketBtn: null,
    closeInventoryBtn: null,
    closeTravelBtn: null,
    closeTransportationBtn: null,
    menuBtn: null,
    inventoryBtn: null,
    saveBtn: null,
    
    // Forms
    characterForm: null,
    characterNameInput: null,
    characterClass: null,
    
    // Character Creation Elements
    perksContainer: null,
    selectedPerksCount: null,
    randomizeCharacterBtn: null
};

// ═══════════════════════════════════════════════════════════════
// unified gold management system - one source of truth to rule them all
// ═══════════════════════════════════════════════════════════════
// this is basically how i wish my bank account worked
// 🪙 Session #77: GoldManager moved to src/js/core/gold-manager.js
// It loads before game.js so window.GoldManager is available

// ═══════════════════════════════════════════════════════════════
// 👤 CHARACTER CREATION STATE - who are you in this pit of despair?
// ═══════════════════════════════════════════════════════════════
let selectedPerks = [];
let characterCreationState = {
    difficulty: 'normal',
    baseGold: 100,
    manualAttributes: {...baseAttributes}, // Attributes with manual point distribution (no perks)
    attributes: {...baseAttributes}, // Final attributes (manual + perks)
    availableAttributePoints: 5, // Player can distribute 5 additional points
    maxAttributeValue: 10, // Max value for any single attribute
    maxTotalAttributes: 30 // Max total of all attributes (5 base each = 25, + 5 points = 30)
};

// ═══════════════════════════════════════════════════════════════
// GAME CORE INITIALIZATION - registered with Bootstrap
// ═══════════════════════════════════════════════════════════════
// no more raw DOMContentLoaded - Bootstrap handles init order

function initializeGameCore() {
    console.log('🖤 Initializing game core...');

    // grab all DOM elements
    initializeElements();
    setupEventListeners();
    setupAttributeButtons();

    // gold manager setup
    console.log('🪙 Setting up GoldManager...');
    GoldManager.init(100);
    GoldManager.registerDisplay('setup-gold-amount');
    GoldManager.registerDisplay('player-gold', (gold) => formatGoldCompact(gold));
    console.log('🪙 GoldManager setup complete');

    // keyboard bindings
    console.log('⌨️ Setting up KeyBindings...');
    KeyBindings.init();
    console.log('⌨️ KeyBindings setup complete');

    // welcome message
    addMessage(typeof GameConfig !== 'undefined' ? GameConfig.ui.welcomeMessage : 'Welcome to Medieval Trading Game!');

    // menu music (queues until user interacts)
    if (typeof MusicSystem !== 'undefined') {
        MusicSystem.playMenuMusic();
    }

    console.log('🖤 Game core initialized');
}

// register with Bootstrap - critical system, early priority
Bootstrap.register('game', () => initializeGameCore(), {
    dependencies: ['GameConfig', 'ItemDatabase', 'GameWorld', 'EventBus'],
    priority: 10,
    severity: 'critical'
});

// secondary systems init - runs after game core
Bootstrap.register('GameSystems', () => initializeAllSystems(), {
    dependencies: ['game', 'GoldManager', 'PlayerStateManager'],
    priority: 50,
    severity: 'required'
});

// Function to initialize all systems in proper order
function initializeAllSystems() {
    console.log('Initializing all game systems...');
    
    // Only initialize systems if game is in MENU state (not during gameplay)
    if (game.state !== GameState.MENU) {
        console.log('Game not in MENU state, skipping system initialization');
        return;
    }

    // 🦙 Ollama Model Manager - skip if LoadingManager already handled it
    // LoadingManager now checks/downloads during load screen
    if (typeof OllamaModelManager !== 'undefined') {
        // Only init if LoadingManager didn't already handle it
        if (typeof LoadingManager === 'undefined' || LoadingManager.ollamaStatus === 'pending') {
            OllamaModelManager.init().then(status => {
                if (status.running && status.hasModel) {
                    console.log('🦙 Ollama ready - AI-powered NPC dialogue enabled!');
                } else if (status.running) {
                    console.log('🦙 Ollama running but model missing - download prompt shown');
                } else {
                    console.log('🦙 Ollama not running - NPCs will use fallback responses (totally fine)');
                }
            }).catch(err => {
                console.warn('🦙 Ollama check failed, no biggie:', err.message);
            });
        } else {
            console.log('🦙 Ollama already handled by LoadingManager, status:', LoadingManager.ollamaStatus);
        }
    }

    // Initialize core systems first
    if (typeof ItemDatabase !== 'undefined') {
        ItemDatabase.init();
        console.log('ItemDatabase initialized');
    }
    
    if (typeof CityReputationSystem !== 'undefined') {
        CityReputationSystem.init();
        console.log('CityReputationSystem initialized');
    }
    
    if (typeof CityEventSystem !== 'undefined') {
        CityEventSystem.init();
        console.log('CityEventSystem initialized');
    }
    
    if (typeof MarketPriceHistory !== 'undefined') {
        MarketPriceHistory.init();
        console.log('MarketPriceHistory initialized');
    }
    
    if (typeof DynamicMarketSystem !== 'undefined') {
        DynamicMarketSystem.init();
        console.log('DynamicMarketSystem initialized');
    }
    
    // Initialize inventory and trading systems
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.init();
        console.log('InventorySystem initialized');
    }
    
    if (typeof TradingSystem !== 'undefined') {
        TradingSystem.init();
        console.log('TradingSystem initialized');
    }
    
    // Initialize new systems
    if (typeof PropertySystem !== 'undefined') {
        PropertySystem.init();
        console.log('PropertySystem initialized');
    }
    
    if (typeof EmployeeSystem !== 'undefined') {
        EmployeeSystem.init();
        console.log('EmployeeSystem initialized');
    }
    
    if (typeof TradeRouteSystem !== 'undefined') {
        TradeRouteSystem.init();
        console.log('TradeRouteSystem initialized');
    }
    
    // Initialize travel system after all other systems
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.init();
        console.log('TravelSystem initialized');
    }
    
    // Initialize UI enhancements
    if (typeof KeyboardShortcuts !== 'undefined') {
        KeyboardShortcuts.initialize();
        console.log('KeyboardShortcuts initialized');
    }
    
    // Initialize PropertyEmployeeUI if it exists
    if (typeof PropertyEmployeeUI !== 'undefined') {
        PropertyEmployeeUI.init();
        console.log('PropertyEmployeeUI initialized');
    }
    
    // Check if tutorial should be shown
    if (typeof KeyboardShortcuts !== 'undefined') {
        TimerManager.setTimeout(() => {
            KeyboardShortcuts.checkTutorialStatus();
        }, 2000);
    }
    
    console.log('All systems initialized successfully!');
}

// ═══════════════════════════════════════════════════════════════
// 🎨 DOM ELEMENT INITIALIZATION - grabbing all the HTML pieces
// ═══════════════════════════════════════════════════════════════
// if any of these are missing, the whole thing crashes spectacularly
function initializeElements() {
    // Screens
    elements.loadingScreen = document.getElementById('loading-screen');
    elements.mainMenu = document.getElementById('main-menu');
    elements.gameContainer = document.getElementById('game-container');
    
    // Panels
    elements.characterPanel = document.getElementById('character-panel');
    elements.marketPanel = document.getElementById('market-panel');
    elements.inventoryPanel = document.getElementById('inventory-panel');
    elements.locationPanel = document.getElementById('location-panel');
    elements.travelPanel = document.getElementById('travel-panel');
    elements.transportationPanel = document.getElementById('transportation-panel');
    elements.messageLog = document.getElementById('message-log');
    
    // Game World - 🖤 Canvas removed, using HTML-based GameWorldRenderer now
    elements.gameCanvas = document.getElementById('game-canvas');
    elements.ctx = elements.gameCanvas ? elements.gameCanvas.getContext('2d') : null;
    
    // UI Elements
    elements.playerName = document.getElementById('player-name');
    elements.playerGold = document.getElementById('player-gold');
    elements.messages = document.getElementById('messages');
    elements.playerStrength = document.getElementById('player-strength');
    elements.playerIntelligence = document.getElementById('player-intelligence');
    elements.playerCharisma = document.getElementById('player-charisma');
    elements.playerEndurance = document.getElementById('player-endurance');
    elements.playerLuck = document.getElementById('player-luck');
    
    // Buttons
    elements.newGameBtn = document.getElementById('new-game-btn');
    elements.loadGameBtn = document.getElementById('load-game-btn');
    elements.settingsBtn = document.getElementById('settings-btn');
    elements.createCharacterBtn = document.getElementById('create-character-btn');
    elements.visitMarketBtn = document.getElementById('visit-market-btn');
    elements.travelBtn = document.getElementById('travel-btn');
    elements.peopleBtn = document.getElementById('people-btn'); // 🖤 People button in location panel 💀
    elements.closeMarketBtn = document.getElementById('close-market-btn');
    elements.closeInventoryBtn = document.getElementById('close-inventory-btn');
    elements.closeTravelBtn = document.getElementById('close-travel-btn');
    elements.closeTransportationBtn = document.getElementById('close-transportation-btn');
    elements.menuBtn = document.getElementById('menu-btn');
    elements.inventoryBtn = document.getElementById('inventory-btn');
    elements.saveBtn = document.getElementById('save-btn');
    
    // Forms
    elements.characterForm = document.getElementById('character-form');
    elements.characterNameInput = document.getElementById('character-name-input');
    elements.characterClass = document.getElementById('character-class');

    // Character Creation Elements
    elements.perksContainer = document.getElementById('perks-container');
    elements.selectedPerksCount = document.getElementById('selected-perks-count');
    console.log('Initialized elements.selectedPerksCount:', elements.selectedPerksCount);
    elements.randomizeCharacterBtn = document.getElementById('randomize-character-btn');

    console.log('Element initialization complete. Key elements:');
    console.log('- selectedPerksCount:', !!elements.selectedPerksCount);
    console.log('- perksContainer:', !!elements.perksContainer);
    console.log('- randomizeCharacterBtn:', !!elements.randomizeCharacterBtn);
}

// Setup event listeners
function setupEventListeners() {
    // 🖤 Main Menu - guard element access
    if (elements.newGameBtn) EventManager.addEventListener(elements.newGameBtn, 'click', startNewGame);
    if (elements.loadGameBtn) EventManager.addEventListener(elements.loadGameBtn, 'click', loadGame);
    if (elements.settingsBtn) EventManager.addEventListener(elements.settingsBtn, 'click', showSettings);
    
    // Character Creation - change to button click instead of form submit
    const createCharacterBtn = document.getElementById('create-character-btn');
    if (createCharacterBtn) {
        EventManager.addEventListener(createCharacterBtn, 'click', createCharacter);
    }
    if (elements.randomizeCharacterBtn) {
        console.log('Setting up Randomize button event listener');
        EventManager.addEventListener(elements.randomizeCharacterBtn, 'click', () => {
            console.log('Randomize button clicked!');
            randomizeCharacter();
        });
    } else {
        gameDeboogerWarn('🖤 randomize-character-btn element not found');
    }
    // 🖤 Guard character name input - may not exist on all pages
    if (elements.characterNameInput) {
        EventManager.addEventListener(elements.characterNameInput, 'input', updateCharacterPreview);

        // Update player name display in real-time
        const updatePlayerNameDisplay = () => {
            const name = elements.characterNameInput?.value?.trim() || 'Player';
            const playerNameElement = document.getElementById('player-name');
            if (playerNameElement) {
                playerNameElement.textContent = name;
                playerNameElement.innerText = name;
                console.log('🏷️ Player name updated to:', name);
            }
        };

        // Update on input (as user types)
        EventManager.addEventListener(elements.characterNameInput, 'input', updatePlayerNameDisplay);

        // Update on blur (when user leaves the field)
        EventManager.addEventListener(elements.characterNameInput, 'blur', updatePlayerNameDisplay);
    }

    // Perk Selection Modal
    const openPerkModalBtn = document.getElementById('open-perk-modal-btn');
    if (openPerkModalBtn) {
        EventManager.addEventListener(openPerkModalBtn, 'click', openPerkModal);
    }

    const confirmPerkBtn = document.getElementById('confirm-perk-selection-btn');
    if (confirmPerkBtn) {
        EventManager.addEventListener(confirmPerkBtn, 'click', confirmPerkSelection);
    }

    const cancelPerkBtn = document.getElementById('cancel-perk-selection-btn');
    if (cancelPerkBtn) {
        EventManager.addEventListener(cancelPerkBtn, 'click', closePerkModal);
    }
    
    // 🖤 Game Controls - guard all element access, EventManager handles null gracefully but let's be explicit
    if (elements.visitMarketBtn) EventManager.addEventListener(elements.visitMarketBtn, 'click', openMarket);
    // 🖤 Travel button now TOGGLES the travel panel 💀
    if (elements.travelBtn) EventManager.addEventListener(elements.travelBtn, 'click', toggleTravel);
    // 🖤 People button TOGGLES the people panel 💀
    if (elements.peopleBtn) EventManager.addEventListener(elements.peopleBtn, 'click', togglePeople);
    if (elements.closeMarketBtn) EventManager.addEventListener(elements.closeMarketBtn, 'click', () => game.hideOverlay('market-panel'));
    if (elements.closeInventoryBtn) EventManager.addEventListener(elements.closeInventoryBtn, 'click', () => game.hideOverlay('inventory-panel'));
    if (elements.closeTravelBtn) EventManager.addEventListener(elements.closeTravelBtn, 'click', () => game.hideOverlay('travel-panel'));
    if (elements.closeTransportationBtn) EventManager.addEventListener(elements.closeTransportationBtn, 'click', () => game.hideOverlay('transportation-panel'));
    if (elements.menuBtn) EventManager.addEventListener(elements.menuBtn, 'click', toggleMenu);
    if (elements.inventoryBtn) EventManager.addEventListener(elements.inventoryBtn, 'click', openInventory);
    if (elements.saveBtn) EventManager.addEventListener(elements.saveBtn, 'click', saveGame);

    // 🏪 Setup market visibility listener - market only at Royal Capital 💀
    setupMarketVisibilityListener();

    // Property & Employee Management
    const propertyEmployeeBtn = document.getElementById('property-employee-btn');
    if (propertyEmployeeBtn) {
        EventManager.addEventListener(propertyEmployeeBtn, 'click', () => game.showOverlay('property-employee-panel'));
    }
    
    // World Map Overlay Button
    const openWorldMapOverlayBtn = document.getElementById('open-world-map-overlay-btn');
    if (openWorldMapOverlayBtn) {
        EventManager.addEventListener(openWorldMapOverlayBtn, 'click', () => {
            game.showOverlay('world-map-overlay');
            
            // Switch TravelSystem to use overlay canvas
            if (typeof TravelSystem !== 'undefined') {
                TravelSystem.switchToOverlayCanvas();
            }
        });
    }
    
    // Setup overlay close buttons
    document.querySelectorAll('[data-close-overlay]').forEach(button => {
        EventManager.addEventListener(button, 'click', (e) => {
            const overlayId = e.target.getAttribute('data-close-overlay') || e.currentTarget.getAttribute('data-close-overlay');
            if (overlayId) {
                game.hideOverlay(overlayId);
                // Return to playing state when closing any panel/overlay
                if (game.state !== GameState.MENU && game.state !== GameState.CHARACTER_CREATION) {
                    changeState(GameState.PLAYING);
                }
            }
        });
    });
    
    // Game Setup - Start button uses onclick in HTML, cancel uses EventManager
    // 🖤 REMOVED duplicate EventManager listeners for start-game-btn
    // The HTML onclick handler already calls window.createCharacter(event)
    // Having both caused createCharacter to run TWICE, breaking panel hide 💀
    if (elements.cancelSetupBtn) {
        EventManager.addEventListener(elements.cancelSetupBtn, 'click', cancelGameSetup);
    }

    // Cancel button fallback
    const cancelSetupBtn = document.getElementById('cancel-setup-btn');
    if (cancelSetupBtn && !elements.cancelSetupBtn) {
        EventManager.addEventListener(cancelSetupBtn, 'click', cancelGameSetup);
    }

    // Note: Difficulty listeners are now set up in setupDifficultyListeners()
    // which is called when the game setup panel becomes visible

    // 🖤 POLLING FAILSAFE - because events are fucking unreliable 🖤
    // This polls for difficulty changes every 100ms as a backup
    let lastKnownDifficulty = 'normal';
    let difficultyPoller = null;

    window.startDifficultyPolling = function() {
        console.log('🔄 Starting difficulty polling failsafe...');
        GameLogger.log('EVENT', 'Starting difficulty polling');

        // Clear any existing poller
        if (difficultyPoller) {
            clearInterval(difficultyPoller);
        }

        // Get initial difficulty
        const initialRadio = document.querySelector('input[name="difficulty"]:checked');
        if (initialRadio) {
            lastKnownDifficulty = initialRadio.value;
            console.log('Initial difficulty:', lastKnownDifficulty);
        }

        // Poll every 100ms - FIX: Use TimerManager to prevent memory leaks
        difficultyPoller = TimerManager.setInterval(() => {
            const currentRadio = document.querySelector('input[name="difficulty"]:checked');
            if (currentRadio && currentRadio.value !== lastKnownDifficulty) {
                console.log('🔄 POLLING DETECTED DIFFICULTY CHANGE!');
                console.log('Changed from', lastKnownDifficulty, 'to', currentRadio.value);
                GameLogger.log('DIFFICULTY', 'Polling detected change', {
                    from: lastKnownDifficulty,
                    to: currentRadio.value
                });
                lastKnownDifficulty = currentRadio.value;
                onDifficultyChange();
            }
        }, 100);

        console.log('✓ Difficulty polling started');
    };

    window.stopDifficultyPolling = function() {
        if (difficultyPoller) {
            TimerManager.clearTimeout(difficultyPoller);
            difficultyPoller = null;
            console.log('✓ Difficulty polling stopped');
            GameLogger.log('EVENT', 'Difficulty polling stopped');
        }
    };

    // Attribute buttons are now set up in setupAttributeButtons() when the panel becomes visible
    // This ensures they're properly initialized with the game state

    // Get saved games list (defined BEFORE use)
    // 🖤 Refresh Load button state - call this whenever saves might have changed 💀
    function refreshLoadButtonState() {
        const loadBtn = elements.loadGameBtn || document.getElementById('load-game-btn');
        if (!loadBtn) return;

        const savedGames = game.getSavedGames();
        if (savedGames && savedGames.length > 0) {
            loadBtn.disabled = false;
            loadBtn.title = 'Load a saved game';
            console.log('📂 Load button enabled - found', savedGames.length, 'save(s)');
        } else {
            loadBtn.disabled = true;
            loadBtn.title = 'No saved games found';
            console.log('📂 Load button disabled - no saves found');
        }
    }
    // 🖤 Make it accessible globally so SaveManager can call it after saving 💀
    window.refreshLoadButtonState = refreshLoadButtonState;

    // 🖤 Get saved games using SaveManager metadata - handles compressed saves properly 💀
    game.getSavedGames = function() {
        try {
            const saves = [];

            // 🖤 First: Check SaveManager's metadata (fast, no decompression needed) 💀
            const metadata = localStorage.getItem('tradingGameSaveSlots');
            if (metadata) {
                try {
                    const slots = JSON.parse(metadata);
                    for (const [slotNum, slot] of Object.entries(slots)) {
                        if (slot?.exists) {
                            saves.push({
                                name: slot.playerInfo?.name || slot.name || 'Unknown',
                                date: slot.timestamp ? new Date(slot.timestamp).toISOString() : new Date().toISOString(),
                                slot: `tradingGameSave_${slotNum}`
                            });
                        }
                    }
                } catch (e) {
                    // Metadata corrupt, fall through to direct scan
                }
            }

            // 🖤 Fallback: Check for actual save files if metadata didn't find any 💀
            if (saves.length === 0) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('tradingGameSave_')) {
                        const saveDataString = localStorage.getItem(key);
                        if (saveDataString) {
                            // 🖤 Check if save data exists (don't parse - might be compressed) 💀
                            // Compressed saves start with 'UC:' or 'LZ:', uncompressed are JSON
                            const isCompressed = saveDataString.startsWith('UC:') || saveDataString.startsWith('LZ:');
                            const isValidJson = !isCompressed && saveDataString.startsWith('{');

                            if (isCompressed || isValidJson) {
                                // Save exists - add to list even if we can't parse it
                                saves.push({
                                    name: 'Saved Game',
                                    date: new Date().toISOString(),
                                    slot: key
                                });
                            }
                        }
                    }
                }
            }

            return saves.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            // 🦇 Failed to enumerate saves - return empty list
            return [];
        }
    };

    // Save/Load
    if (elements.saveGameBtn) {
        EventManager.addEventListener(elements.saveGameBtn, 'click', saveGame);
    }
    // 🖤 Load button state is updated by refreshLoadButtonState() - listener already added above 💀
    refreshLoadButtonState();
    
    // Market Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        EventManager.addEventListener(btn, 'click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // time control buttons - REMOVED: GameEngine.setupTimeControls() handles these now
    // keeping this comment as a grave marker for the duplicate handlers that once lived here
    // RIP redundant event listeners - you caused the time freeze bug
    // TIME MACHINE handles time buttons via onclick, starts the engine properly when unpausing
    console.log('⏰ Time control buttons now handled by TimeMachine.setupTimeControls()');

    // time machine handles setSpeed internally now - just update game UI when speed changes
    if (typeof TimeMachine !== 'undefined') {
        const originalSetSpeed = TimeMachine.setSpeed.bind(TimeMachine);
        TimeMachine.setSpeed = function(speed) {
            const result = originalSetSpeed(speed);
            // Update game.js UI controls
            if (typeof game !== 'undefined' && game.updateTimeControls) {
                game.updateTimeControls();
            }
            // Ensure game.isRunning is synced with TimeMachine
            if (speed !== 'PAUSED' && typeof game !== 'undefined') {
                game.isRunning = true;
            }
            return result;
        };
        console.log('⏰ TimeMachine.setSpeed wrapped to sync game UI');
    }

    // 🖤 Verify time buttons exist in DOM for deboogering 🦇
    console.log('⏰ Time control buttons status:', {
        pauseBtn: !!document.getElementById('pause-btn'),
        normalSpeedBtn: !!document.getElementById('normal-speed-btn'),
        fastSpeedBtn: !!document.getElementById('fast-speed-btn'),
        veryFastSpeedBtn: !!document.getElementById('very-fast-speed-btn')
    });

    // Travel tab buttons
    document.querySelectorAll('.travel-tab-btn').forEach(btn => {
        EventManager.addEventListener(btn, 'click', function() {
            const tabName = this.dataset.travelTab;
            if (tabName) {
                // Switch to the selected tab
                document.querySelectorAll('.travel-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.travel-tab-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                const tabContent = document.getElementById(`${tabName}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
                
                // Special handling for map tab
                if (tabName === 'map' && typeof TravelSystem !== 'undefined') {
                    TravelSystem.switchToTabCanvas();
                }
            }
        });
    });
    
    // 🖤💀 Location Panel collapse toggle - ONLY on collapse icon, not entire header 💀
    const locationCollapseIcon = document.getElementById('location-collapse-icon');
    if (locationCollapseIcon) {
        EventManager.addEventListener(locationCollapseIcon, 'click', (e) => {
            e.stopPropagation(); // Don't trigger parent clicks
            const locationPanel = document.getElementById('location-panel');
            if (locationPanel) {
                locationPanel.classList.toggle('collapsed');
                // 🖤 Save preference to localStorage 💀
                const isCollapsed = locationPanel.classList.contains('collapsed');
                try {
                    localStorage.setItem('locationPanelCollapsed', isCollapsed ? 'true' : 'false');
                } catch (e) { /* Ignore storage errors */ }
            }
        });
        // 🖤 Restore collapsed state from localStorage 💀
        try {
            const savedState = localStorage.getItem('locationPanelCollapsed');
            if (savedState === 'true') {
                const locationPanel = document.getElementById('location-panel');
                if (locationPanel) locationPanel.classList.add('collapsed');
            }
        } catch (e) { /* Ignore storage errors */ }
    }

    // Keyboard shortcuts
    EventManager.addEventListener(document, 'keydown', handleKeyPress);
}

// ═══════════════════════════════════════════════════════════════
// 🎯 GAME STATE MANAGEMENT - keeping track of the chaos
// ═══════════════════════════════════════════════════════════════
function changeState(newState) {
    const oldState = game.state;
    game.state = newState;
    
    // 🎵 Update music based on state change
    if (typeof MusicSystem !== 'undefined') {
        if (newState === GameState.MENU) {
            MusicSystem.playMenuMusic();
        } else if (newState === GameState.PLAYING) {
            // Queue normal music - lets menu music finish naturally before switching
            // This creates a smooth transition from menu → character creation → gameplay
            // Once the menu track ends, normal world music will begin
            MusicSystem.queueNormalMusic();
        }
    }

    // Handle state transitions
    switch (newState) {
        case GameState.MENU:
            showScreen('main-menu');
            break;
        case GameState.LOADING:
            showScreen('loading-screen');
            break;
        case GameState.CHARACTER_CREATION:
            showScreen('game-container');
            game.showOverlay('character-panel');
            initializeCharacterCreation();
            break;
        case GameState.PLAYING:
            showScreen('game-container');
            hideAllPanels();
            game.hideAllOverlays();
            // 🖤💀 Show FULL game UI - not just location panel! This reveals:
            // top-bar, side-panel, bottom-action-bar, map-container, message-log, location-panel
            showGameUI();
            startGameLoop();
            // 🖤 initialize the world map renderer - rise from the ashes
            if (typeof GameWorldRenderer !== 'undefined') {
                GameWorldRenderer.init();
                console.log('GameWorldRenderer initialized - the void now has pretty dots');
            } else {
                gameDeboogerWarn('🖤 GameWorldRenderer not found');
            }
            // Start the GameEngine for time and travel management
            if (typeof GameEngine !== 'undefined') {
                GameEngine.init();
                GameEngine.start();
                console.log('GameEngine started - time flows once more');
            }
            // Re-setup time controls now that game-container is visible
            // This ensures the pause/play button toggle works
            if (typeof TimeMachine !== 'undefined') {
                TimeMachine.setupTimeControls();
                TimeMachine.updateTimeControlButtons();
                console.log('TimeMachine controls re-initialized');
            }
            break;
        case GameState.PAUSED:
            // Pause game logic
            break;
        case GameState.MARKET:
            game.showOverlay('market-panel');
            break;
        case GameState.INVENTORY:
            game.showOverlay('inventory-panel');
            break;
        case GameState.TRAVEL:
            game.showOverlay('travel-panel');
            break;
        case GameState.TRANSPORTATION:
            game.showOverlay('transportation-panel');
            break;
    }
    
    console.log(`Game state changed from ${oldState} to ${newState}`);
}

// 🖤 BODY STATE MANAGEMENT - O(1) CSS state classes instead of :has() 💀
// Classes: state-menu, state-setup, state-loading, state-playing
function setBodyState(state) {
    const body = document.body;
    // 🦇 Remove all state classes
    body.classList.remove('state-menu', 'state-setup', 'state-loading', 'state-playing');
    // 🖤 Add the new state
    if (state) {
        body.classList.add(`state-${state}`);
    }
}
window.setBodyState = setBodyState; // 🖤 Expose globally for other systems 💀

// 📺 SCREEN MANAGEMENT - show/hide the suffering
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    // Also hide game-container (it's a special case without .screen class)
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }

    // Show the requested screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }

    // Special case: if showing game-container, also remove hidden from it
    if (screenId === 'game-container' && gameContainer) {
        gameContainer.classList.remove('hidden');
    }

    // 🖤 Update body state class for CSS targeting 💀
    if (screenId === 'main-menu') {
        setBodyState('menu');
    } else if (screenId === 'game-setup-panel' || screenId === 'game-container') {
        // Setup panel is inside game-container
        const setupPanel = document.getElementById('game-setup-panel');
        if (setupPanel && !setupPanel.classList.contains('hidden')) {
            setBodyState('setup');
        } else {
            setBodyState('playing');
        }
    } else if (screenId === 'loading-screen') {
        setBodyState('loading');
    } else {
        setBodyState('playing');
    }

    // 🏆 Special case: refresh global leaderboard when showing main menu
    if (screenId === 'main-menu' && typeof GlobalLeaderboardSystem !== 'undefined') {
        GlobalLeaderboardSystem.refresh();
    }
}

// 🗂️ PANEL MANAGEMENT - nested UI hell
function showPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
    }
}

function hidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('hidden');
    }
    // 🖤 If hiding setup panel, switch to playing state 💀
    if (panelId === 'game-setup-panel') {
        setBodyState('playing');
    }
}

function hideAllPanels() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Also hide any overlay panels
    document.querySelectorAll('.overlay-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    // Hide all overlays
    if (typeof game !== 'undefined' && game.hideAllOverlays) {
        game.hideAllOverlays();
    }

    // Hide travel system if available
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.hideTravelPanel();
    }
}

// 📑 TAB MANAGEMENT - because one panel wasn't enough suffering
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎲 GAME FUNCTIONS - where the magic (trauma) happens
// ═══════════════════════════════════════════════════════════════
// 🎯 Setup difficulty event listeners (called when panel is shown)
let difficultyListenersSetup = false;
function setupDifficultyListeners() {
    // Prevent duplicate listeners
    if (difficultyListenersSetup) {
        console.log('⚠️ Difficulty listeners already set up, skipping...');
        return;
    }

    console.log('═══════════════════════════════════════');
    console.log('🎯 SETTING UP DIFFICULTY LISTENERS');
    console.log('═══════════════════════════════════════');

    const difficultyContainer = document.querySelector('.difficulty-selection');
    const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');

    console.log('  - Container found:', !!difficultyContainer);
    console.log('  - Radio buttons found:', difficultyRadios.length);

    if (!difficultyContainer) {
        gameDeboogerWarn('🖤 difficulty-selection container not found');
        return;
    }

    if (difficultyRadios.length === 0) {
        gameDeboogerWarn('🖤 No difficulty radio buttons found');
        return;
    }

    // Method 1: Click on parent container
    difficultyContainer.addEventListener('click', (e) => {
        console.log('🖱️ CLICK in difficulty container');
        const clickedOption = e.target.closest('.difficulty-option');
        if (clickedOption) {
            const difficulty = clickedOption.dataset.difficulty;
            console.log('🎯 Clicked difficulty:', difficulty);

            // Check the radio
            const radio = document.getElementById(`difficulty-${difficulty}`);
            if (radio) {
                radio.checked = true;
            }

            // Trigger change
            console.log('⚡ Triggering onDifficultyChange...');
            try {
                onDifficultyChange();
            } catch (error) {
                // 🦇 Difficulty change handler failed - UI still works
                console.warn('Difficulty change handler error');
            }
        }
    });

    // Method 2: Direct listeners on each radio
    difficultyRadios.forEach((radio, index) => {
        console.log(`  - Attaching to radio ${index + 1}: ${radio.value}`);

        radio.addEventListener('change', () => {
            console.log('📻 CHANGE event:', radio.value);
            try {
                onDifficultyChange();
            } catch (error) {
                // 🦇 Silently handle - radio still works
            }
        });

        radio.addEventListener('click', () => {
            console.log('📻 CLICK event:', radio.value);
            try {
                onDifficultyChange();
            } catch (error) {
                // 🦇 Silently handle - radio still works
            }
        });
    });

    difficultyListenersSetup = true;
    console.log('✅ Difficulty listeners setup complete!');
    console.log('═══════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════
// 🎬 SETUP UI VISIBILITY - hide game UI during character creation
// ═══════════════════════════════════════════════════════════════
function hideGameUIForSetup() {
    console.log('🎬 Hiding game UI for setup...');

    // Hide top bar (time controls)
    const topBar = document.getElementById('top-bar');
    if (topBar) topBar.classList.add('hidden');

    // Hide side panel (player info)
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) sidePanel.classList.add('hidden');

    // Hide bottom action bar
    const bottomBar = document.getElementById('bottom-action-bar');
    if (bottomBar) bottomBar.classList.add('hidden');

    // Hide map container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) mapContainer.classList.add('hidden');

    // Hide message log
    const messageLog = document.getElementById('message-log');
    if (messageLog) messageLog.classList.add('hidden');

    // 🖤 Hide location panel (Town Square) - not needed during setup
    const locationPanel = document.getElementById('location-panel');
    if (locationPanel) locationPanel.classList.add('hidden');

    // Hide panel toolbar (via PanelManager)
    if (typeof PanelManager !== 'undefined' && PanelManager.hideToolbar) {
        PanelManager.hideToolbar();
    }

    // Hide game layout (contains main game area)
    const gameLayout = document.getElementById('game-layout');
    if (gameLayout) gameLayout.classList.add('hidden');

    // Make game-container take full screen for setup
    // 🌦️ Use TRANSPARENT background so menu weather shows through!
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.background = 'transparent'; // Let weather show through
        gameContainer.style.display = 'flex';
        gameContainer.style.justifyContent = 'center';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.minHeight = '100vh';
    }

    // Move ui-panels OUT of game-layout so it's visible during setup
    // (game-layout is hidden, so anything inside won't show)
    const uiPanels = document.getElementById('ui-panels');
    if (uiPanels && gameContainer) {
        gameContainer.appendChild(uiPanels);
        uiPanels.style.position = 'relative';
        uiPanels.style.transform = 'none';
        uiPanels.style.top = 'auto';
        uiPanels.style.left = 'auto';
        uiPanels.style.pointerEvents = 'auto'; // enable clicking on setup panel
    }

    console.log('🎬 Game UI hidden for setup');
}

function showGameUI() {
    console.log('🎬 Showing game UI...');

    // Show top bar
    const topBar = document.getElementById('top-bar');
    if (topBar) topBar.classList.remove('hidden');

    // Show side panel
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) sidePanel.classList.remove('hidden');

    // Show bottom action bar
    const bottomBar = document.getElementById('bottom-action-bar');
    if (bottomBar) bottomBar.classList.remove('hidden');

    // Show map container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) mapContainer.classList.remove('hidden');

    // Show message log
    const messageLog = document.getElementById('message-log');
    if (messageLog) messageLog.classList.remove('hidden');

    // 🖤 Show location panel (Town Square) - back to playing
    const locationPanel = document.getElementById('location-panel');
    if (locationPanel) locationPanel.classList.remove('hidden');

    // Show panel toolbar (via PanelManager)
    if (typeof PanelManager !== 'undefined' && PanelManager.showToolbar) {
        PanelManager.showToolbar();
    }

    // Show game layout
    const gameLayout = document.getElementById('game-layout');
    if (gameLayout) gameLayout.classList.remove('hidden');

    // Reset game-container styles
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.background = '';
        gameContainer.style.display = '';
        gameContainer.style.justifyContent = '';
        gameContainer.style.alignItems = '';
        gameContainer.style.minHeight = '';
    }

    // Move ui-panels back into game-layout and reset positioning
    const uiPanels = document.getElementById('ui-panels');
    if (uiPanels && gameLayout) {
        gameLayout.appendChild(uiPanels);
        uiPanels.style.position = '';
        uiPanels.style.transform = '';
        uiPanels.style.top = '';
        uiPanels.style.left = '';
        uiPanels.style.pointerEvents = ''; // restore default (none in CSS for pass-through)
    }

    console.log('🎬 Game UI revealed');
}

function startNewGame() {
    console.log('=== Starting new game ===');
    console.log('🖤 startNewGame called - lets see if this void swallows us whole...');

    // 🌦️ Keep menu weather running during setup - it looks cool behind the setup panel
    // We'll transfer and stop it when createCharacter() actually starts the game
    console.log('🌦️ Menu weather continues during setup');

    // Reset death cause tracking for new game
    if (typeof DeathCauseSystem !== 'undefined') {
        DeathCauseSystem.reset();
    }

    // 🖤💀 CRITICAL: Reset quest state for new game - prevents old quests from showing! 💀
    if (typeof QuestSystem !== 'undefined' && QuestSystem.resetAllQuests) {
        QuestSystem.resetAllQuests();
    }

    // Reset initial encounter state so hooded stranger shows again
    if (typeof InitialEncounterSystem !== 'undefined') {
        InitialEncounterSystem.hasShownEncounter = false;
        InitialEncounterSystem.hasShownTutorialChoice = false;
        InitialEncounterSystem.hasAcceptedInitialQuest = false;
        InitialEncounterSystem.strangerSpawnedAtLocation = null;
        InitialEncounterSystem.hasCompletedIntro = false;
        InitialEncounterSystem._mainQuestUnlocked = false;
        // 🎭 Clear pre-cached dialogue/TTS for new game
        if (InitialEncounterSystem.clearCache) {
            InitialEncounterSystem.clearCache();
        }
    }

    // Reset exploration system for new game (cooldowns, completed, history)
    if (typeof ExplorationPanel !== 'undefined' && ExplorationPanel.resetForNewGame) {
        ExplorationPanel.resetForNewGame();
    }

    // Reset dungeon exploration system (boss progress, defeated bosses)
    if (typeof DungeonExplorationSystem !== 'undefined' && DungeonExplorationSystem.resetForNewGame) {
        DungeonExplorationSystem.resetForNewGame();
    }

    // Reset faction system (discovered factions, reputation)
    if (typeof FactionSystem !== 'undefined' && FactionSystem.resetForNewGame) {
        FactionSystem.resetForNewGame();
    }

    // Reset stat decay tracker for new game - so decay happens correctly from minute 0 💀
    game._lastProcessedMinute = -1;

    // 🖤 Hide main menu content but keep weather effects visible behind setup
    const mainMenu = document.getElementById('main-menu');
    const menuContent = mainMenu?.querySelector('.menu-content');
    const weatherContainer = document.getElementById('menu-weather-container');

    if (menuContent) {
        menuContent.style.display = 'none'; // Hide buttons/title but keep weather
        console.log('🖤 Main menu content hidden, weather effects continue');
    }

    // 🌦️ Move weather container to body temporarily so it shows behind setup
    // CSS in z-index-system.css handles the positioning and z-index
    if (weatherContainer && mainMenu) {
        document.body.appendChild(weatherContainer);
        console.log('🌦️ Weather container moved to body for setup screen');
    }

    // Now hide the main menu (weather container is no longer inside)
    if (mainMenu) {
        mainMenu.classList.add('hidden');
    }

    // Show game setup panel with difficulty selection first
    showScreen('game-container');

    // Hide all game UI elements - only setup panel should be visible
    hideGameUIForSetup();

    showPanel('game-setup-panel');

    // Re-register gold displays now that panel is visible
    console.log('🪙 Re-registering gold displays after panel shown...');
    GoldManager.reregisterDisplays();

    // ⚡ SETUP DIFFICULTY LISTENERS NOW (panel is visible)
    console.log('⚡ Setting up difficulty listeners NOW...');
    setupDifficultyListeners();

    // Start difficulty polling failsafe
    if (typeof startDifficultyPolling === 'function') {
        startDifficultyPolling();
    }

    // Attribute buttons are set up ONCE via event delegation - don't add duplicate listeners!
    // Just make sure they're initialized (first time only)
    if (!attributeButtonsSetup) {
        console.log('🎯 Setting up attribute buttons for the first time...');
        setupAttributeButtons();
    } else {
        console.log('🎯 Attribute buttons already set up, skipping to avoid duplicates');
    }

    // Initialize character creation with currently selected difficulty
    console.log('Initializing character creation...');
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'normal';
    console.log('Selected difficulty from radio:', selectedDifficulty);
    initializeCharacterCreation(selectedDifficulty);

    // IMPORTANT: Force an immediate gold recalculation to update UI
    console.log('🎯 Force recalculating stats to update gold display...');
    calculateCharacterStats();

    addMessage('Starting a new game...');
    console.log('=== New game setup complete ===');
}

// Initialize character creation
// 🖤 now pulling all values from GameConfig.player - the dark source of truth
function initializeCharacterCreation(difficulty = 'normal') {
    console.log('=== Initializing Character Creation ===');
    selectedPerks = [];

    // 🖤 Pull player config from GameConfig (or use defaults if config isn't loaded)
    const playerConfig = (typeof GameConfig !== 'undefined' && GameConfig.player) ? GameConfig.player : {
        startingGold: { easy: 120, normal: 100, hard: 80 },
        baseAttributes: { strength: 5, charisma: 5, intelligence: 5, luck: 5, endurance: 5 },
        characterCreation: { availableAttributePoints: 5, maxAttributeValue: 10, maxTotalAttributes: 30 }
    };

    // Calculate base gold based on difficulty - dragged from the config's cold heart
    const goldConfig = playerConfig.startingGold;
    let baseGold = goldConfig[difficulty] || goldConfig.normal || 100;

    // Get character creation constraints from config
    const creationConfig = playerConfig.characterCreation;
    const configBaseAttributes = playerConfig.baseAttributes || baseAttributes;

    characterCreationState = {
        difficulty: difficulty,
        baseGold: baseGold,
        currentGold: baseGold,
        manualAttributes: {...configBaseAttributes},  // Start at config values
        attributes: {...configBaseAttributes},
        availableAttributePoints: creationConfig.availableAttributePoints,
        maxAttributeValue: creationConfig.maxAttributeValue,
        maxTotalAttributes: creationConfig.maxTotalAttributes
    };

    console.log('Initial character state:', characterCreationState);
    console.log('🪙 Setting initial gold via GoldManager:', baseGold);

    // Make sure the correct difficulty radio button is checked
    const difficultyRadio = document.getElementById(`difficulty-${difficulty}`);
    if (difficultyRadio) {
        difficultyRadio.checked = true;
        console.log(`✓ Set ${difficulty} radio button as checked`);
    } else {
        console.warn(`✗ Could not find difficulty-${difficulty} radio button!`);
    }

    // Initialize GoldManager with base gold
    GoldManager.setGold(baseGold, `Initialized with ${difficulty} difficulty`);

    populatePerks();
    displaySelectedPerks(); // Initialize empty perks display
    updatePerkSelection();
    updateAttributeDisplay(); // Initialize attribute button states

    // Calculate stats AFTER setting initial gold (this will recalculate with perks)
    calculateCharacterStats();

    // 🖤💀 Ensure START button is properly disabled on init (no perks selected yet) 💀
    updateStartGameButton();

    console.log('=== Character Creation Initialized ===');
}

// Populate perks in the character creation UI - delegates to PerkSystem
function populatePerks() {
    if (typeof PerkSystem !== 'undefined' && PerkSystem.populatePerksContainer) {
        // Use PerkSystem's implementation
        PerkSystem.populatePerksContainer(
            elements.perksContainer,
            selectedPerks,
            (perkId) => togglePerkSelection(perkId)
        );
    } else {
        // Fallback: manual iteration
        elements.perksContainer.innerHTML = '';
        for (const [key, perk] of Object.entries(perks)) {
            const perkCard = createPerkCard(perk);
            elements.perksContainer.appendChild(perkCard);
        }
    }
}

// Create a perk card element - delegates to PerkSystem when available
function createPerkCard(perk) {
    // Use PerkSystem if available
    if (typeof PerkSystem !== 'undefined' && PerkSystem.createPerkCard) {
        const card = PerkSystem.createPerkCard(perk, selectedPerks);
        card.addEventListener('click', () => togglePerkSelection(perk.id));
        return card;
    }

    // Fallback implementation
    const card = document.createElement('div');
    card.className = 'perk-card';
    card.dataset.perkId = perk.id;

    if (typeof selectedPerks !== 'undefined' && selectedPerks.includes(perk.id)) {
        card.classList.add('selected');
    }
    if (typeof selectedPerks !== 'undefined' && selectedPerks.length >= 2 && !selectedPerks.includes(perk.id)) {
        card.classList.add('disabled');
    }

    const header = document.createElement('div');
    header.className = 'perk-header';
    header.innerHTML = `<span class="perk-icon">${perk.icon}</span><span class="perk-name">${perk.name}</span>`;

    const description = document.createElement('div');
    description.className = 'perk-description';
    description.textContent = perk.description;

    const effects = document.createElement('div');
    effects.className = 'perk-effects';

    for (const [effectName, value] of Object.entries(perk.effects)) {
        const effect = document.createElement('div');
        effect.className = 'perk-effect positive';
        effect.innerHTML = `<span class="perk-effect-icon">✓</span> ${formatPerkEffect(effectName, value, true)}`;
        effects.appendChild(effect);
    }

    for (const [effectName, value] of Object.entries(perk.negativeEffects)) {
        const effect = document.createElement('div');
        effect.className = 'perk-effect negative';
        effect.innerHTML = `<span class="perk-effect-icon">✗</span> ${formatPerkEffect(effectName, value, false)}`;
        effects.appendChild(effect);
    }

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(effects);
    card.addEventListener('click', () => togglePerkSelection(perk.id));

    return card;
}

// Format perk effect for display - delegates to PerkSystem
function formatPerkEffect(effectName, value, isPositive) {
    // Use PerkSystem's more comprehensive formatter if available
    if (typeof PerkSystem !== 'undefined' && PerkSystem.formatPerkEffect) {
        return PerkSystem.formatPerkEffect(effectName, value, isPositive);
    }
    // Minimal fallback
    const sign = isPositive ? '+' : '';
    return `${effectName}: ${sign}${value}`;
}

// Toggle perk selection
function togglePerkSelection(perkId) {
    console.log('togglePerkSelection called for:', perkId);
    const perkCard = document.querySelector(`[data-perk-id="${perkId}"]`);

    if (selectedPerks.includes(perkId)) {
        // Deselect perk
        selectedPerks = selectedPerks.filter(id => id !== perkId);
        perkCard.classList.remove('selected');
        console.log('Deselected perk:', perkId);
    } else {
        // Select perk if we haven't reached the limit
        if (selectedPerks.length < 2) {
            selectedPerks.push(perkId);
            perkCard.classList.add('selected');
            console.log('Selected perk:', perkId);
        } else {
            addMessage('You can only select up to 2 perks.');
            console.log('Cannot select more perks, limit reached');
            return;
        }
    }

    console.log('Current selectedPerks:', selectedPerks);
    updatePerkSelection();
    calculateCharacterStats();
}

// Update perk selection display
function updatePerkSelection() {
    console.log('=== updatePerkSelection called ===');

    // 🖤 Safety check - ensure selectedPerks is initialized
    if (typeof selectedPerks === 'undefined' || selectedPerks === null) {
        console.warn('⚠️ selectedPerks not initialized, initializing now...');
        selectedPerks = [];
    }

    console.log('selectedPerks array:', selectedPerks);
    console.log('selectedPerks.length:', selectedPerks.length);
    console.log('elements.selectedPerksCount:', elements.selectedPerksCount);

    // Try to get the element directly if not in elements object yet
    const counterElement = elements.selectedPerksCount || document.getElementById('selected-perks-count');

    console.log('counterElement found:', !!counterElement);
    if (counterElement) {
        console.log('Current counter textContent:', counterElement.textContent);
        counterElement.textContent = selectedPerks.length;
        console.log('Updated counter textContent to:', counterElement.textContent);
        console.log('Verified counter now shows:', document.getElementById('selected-perks-count')?.textContent);

        // Update elements object if it wasn't set
        if (!elements.selectedPerksCount) {
            elements.selectedPerksCount = counterElement;
            console.log('Initialized elements.selectedPerksCount');
        }
    } else {
        gameDeboogerWarn('🖤 Counter element not found');
        console.log('Looking for element with id: selected-perks-count');
        const deboogerElement = document.getElementById('selected-perks-count');
        console.log('Direct getElementById result:', deboogerElement);
        console.log('document.readyState:', document.readyState);
    }

    // Also update modal counter if it exists
    const modalCounter = document.getElementById('modal-selected-count');
    console.log('Modal counter found:', !!modalCounter);
    if (modalCounter) {
        modalCounter.textContent = selectedPerks.length;
        console.log('Updated modal counter to:', selectedPerks.length);
    }

    // Update card states
    const perkCards = document.querySelectorAll('.perk-card');
    console.log('Found perk cards:', perkCards.length);
    perkCards.forEach(card => {
        const perkId = card.dataset.perkId;
        const isSelected = selectedPerks.includes(perkId);
        const isDisabled = !isSelected && selectedPerks.length >= 2;

        card.classList.toggle('selected', isSelected);
        card.classList.toggle('disabled', isDisabled);
    });

    // 🖤 Update confirm button text to show selection count
    const confirmBtn = document.getElementById('confirm-perk-btn');
    if (confirmBtn) {
        if (selectedPerks.length === 0) {
            confirmBtn.textContent = 'Confirm Selection';
            confirmBtn.disabled = false;
        } else if (selectedPerks.length === 1) {
            confirmBtn.textContent = 'Confirm 1 Perk';
            confirmBtn.disabled = false;
        } else {
            confirmBtn.textContent = `Confirm ${selectedPerks.length} Perks`;
            confirmBtn.disabled = false;
        }
        console.log('Updated confirm button:', confirmBtn.textContent);
    }

    console.log('=== updatePerkSelection complete ===');
}

// Open perk selection modal
function openPerkModal() {
    console.log('Opening perk modal...');

    // Get modal element 🖤💀 FIXED: Use console.error instead of browser alert() 💀
    const modal = document.getElementById('perk-selection-modal');
    if (!modal) {
        gameDeboogerWarn('🖤 Perk modal not found');
        console.error('Error: Perk selection modal not found!');
        addMessage('⚠️ Perk modal not found - please reload the game', 'error');
        return;
    }

    // Ensure perks container exists
    if (!elements.perksContainer) {
        elements.perksContainer = document.getElementById('perks-container');
    }

    if (!elements.perksContainer) {
        gameDeboogerWarn('🖤 Perks container not found');
        console.error('Error: Perks container not found!');
        addMessage('⚠️ Perks container not found - please reload the game', 'error');
        return;
    }

    console.log('Populating perks...');
    try {
        populatePerks(); // Refresh perks in modal
        updatePerkSelection(); // Update selection states
    } catch (error) {
        // 🦇 Perks failed to load - show user-friendly message
        console.warn('Error populating perks:', error.message);
        addMessage?.('Failed to load perks - please try again');
        return;
    }

    console.log('Showing modal...');
    // Show modal directly
    modal.classList.remove('hidden');
    modal.classList.add('active');
    modal.style.display = 'flex';

    console.log('Perk modal opened successfully!');
}

// Close perk selection modal
function closePerkModal() {
    console.log('Closing perk modal...');
    const modal = document.getElementById('perk-selection-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Confirm perk selection and close modal
function confirmPerkSelection() {
    // 🖤 Safety check - ensure selectedPerks is initialized before we touch it 💀
    if (typeof selectedPerks === 'undefined' || selectedPerks === null) {
        console.warn('⚠️ selectedPerks not initialized in confirmPerkSelection, initializing now...');
        selectedPerks = [];
    }

    console.log('Confirming perk selection...', selectedPerks);
    closePerkModal();
    updatePerkSelection(); // Update the perk counter badge
    displaySelectedPerks(); // Show selected perks in the UI
    calculateCharacterStats(); // Recalculate stats with perk bonuses
    updateStartGameButton(); // 🖤💀 Check if START button should be enabled 💀
    addMessage(`Selected ${selectedPerks.length} perk(s).`);
}

// Display selected perks in the character creation UI
function displaySelectedPerks() {
    const container = document.getElementById('selected-perks-display');
    if (!container) {
        gameDeboogerWarn('🖤 Selected perks display container not found');
        return;
    }

    if (selectedPerks.length === 0) {
        container.innerHTML = '<p class="no-perks-message">No perks selected</p>';
        return;
    }

    container.innerHTML = '';
    selectedPerks.forEach(perkId => {
        const perk = perks[perkId];
        if (!perk) return;

        const perkTag = document.createElement('div');
        perkTag.className = 'selected-perk-tag';
        // 🖤 XSS fix: use data attribute instead of inline onclick
        perkTag.innerHTML = `
            <span class="perk-tag-icon">${perk.icon}</span>
            <span class="perk-tag-name">${perk.name}</span>
            <button class="perk-tag-remove" data-perk-id="${escapeHtml(perkId)}" title="Remove perk">×</button>
        `;
        // 💀 Attach event listener safely
        perkTag.querySelector('.perk-tag-remove').onclick = function() {
            removePerk(this.dataset.perkId);
        };
        container.appendChild(perkTag);
    });
}

// Remove a selected perk
function removePerk(perkId) {
    selectedPerks = selectedPerks.filter(id => id !== perkId);
    updatePerkSelection();
    displaySelectedPerks();
    calculateCharacterStats();
    updateStartGameButton(); // 🖤💀 Check if START button should be disabled 💀
    addMessage(`Removed perk: ${perks[perkId]?.name || perkId}`);
}

// 💰 exposing GoldManager to the world (it's a whole mood)
game.GoldManager = GoldManager;
window.GoldManager = GoldManager;

// Expose modal functions to game object for onclick handlers
game.openPerkModal = openPerkModal;
game.closePerkModal = closePerkModal;
game.confirmPerkSelection = confirmPerkSelection;

// Expose functions to global scope for onclick handlers in HTML
window.openPerkModal = openPerkModal;
window.closePerkModal = closePerkModal;
window.confirmPerkSelection = confirmPerkSelection;
window.removePerk = removePerk;

// Calculate character stats based on selected perks
function calculateCharacterStats() {
    console.log('=== calculateCharacterStats called ===');
    console.log('Base gold:', characterCreationState.baseGold);
    console.log('Selected perks:', selectedPerks);
    console.log('Manual attributes:', characterCreationState.manualAttributes);

    // Calculate gold with GoldManager
    let calculatedGold = characterCreationState.baseGold;
    console.log('Starting with base gold:', calculatedGold);

    // Start with manual attributes (base + player distribution)
    characterCreationState.attributes = {...characterCreationState.manualAttributes};
    console.log('Starting attributes (manual):', characterCreationState.attributes);

    // Apply perk effects
    selectedPerks.forEach(perkId => {
        const perk = perks[perkId];
        if (!perk) {
            console.warn('Perk not found:', perkId);
            return;
        }

        console.log('Processing perk:', perk.name);

        // Apply gold bonuses/penalties (these stack on top of difficulty-adjusted base)
        if (perk.effects && perk.effects.goldBonus) {
            const bonus = Math.round(characterCreationState.baseGold * perk.effects.goldBonus);
            calculatedGold += bonus;
            console.log(`  Gold bonus: +${bonus} (${perk.effects.goldBonus * 100}%)`);
        }
        if (perk.negativeEffects && perk.negativeEffects.goldPenalty) {
            const penalty = Math.round(characterCreationState.baseGold * perk.negativeEffects.goldPenalty);
            calculatedGold -= penalty;
            console.log(`  Gold penalty: -${penalty} (${perk.negativeEffects.goldPenalty * 100}%)`);
        }

        // Apply attribute modifiers (ON TOP of manual distribution)
        applyAttributeModifiers(perk);
    });

    // Update characterCreationState with final gold
    characterCreationState.currentGold = calculatedGold;

    // Update GoldManager with final calculated gold
    GoldManager.setGold(calculatedGold, 'Character stats calculated');

    console.log('Final calculated gold:', calculatedGold);
    console.log('CharacterCreationState currentGold:', characterCreationState.currentGold);
    console.log('Final attributes (manual + perks):', characterCreationState.attributes);

    // Also update the setup gold display directly to ensure it's visible
    const setupGoldElement = document.getElementById('setup-gold-amount');
    if (setupGoldElement) {
        const oldValue = setupGoldElement.textContent;
        setupGoldElement.textContent = calculatedGold;
        console.log('✓ Directly updated setup-gold-amount:', oldValue, '→', calculatedGold);

        // Add visual flash effect to show the change
        setupGoldElement.style.transition = 'none';
        setupGoldElement.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        setupGoldElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            setupGoldElement.style.transition = 'all 0.3s ease';
            setupGoldElement.style.backgroundColor = '';
            setupGoldElement.style.transform = 'scale(1)';
        }, 50);
    } else {
        console.warn('✗ setup-gold-amount element not found!');
    }

    // Update UI
    updateCharacterPreview();
}

// Apply attribute modifiers from perks
function applyAttributeModifiers(perk) {
    console.log('Applying attribute modifiers for perk:', perk.id, perk.effects);

    // Apply attribute bonuses from perk effects
    if (perk.effects) {
        // Check for each attribute bonus
        if (perk.effects.strengthBonus && characterCreationState.attributes.strength !== undefined) {
            characterCreationState.attributes.strength += perk.effects.strengthBonus;
            console.log('Added', perk.effects.strengthBonus, 'to strength');
        }
        if (perk.effects.intelligenceBonus && characterCreationState.attributes.intelligence !== undefined) {
            characterCreationState.attributes.intelligence += perk.effects.intelligenceBonus;
            console.log('Added', perk.effects.intelligenceBonus, 'to intelligence');
        }
        if (perk.effects.charismaBonus && characterCreationState.attributes.charisma !== undefined) {
            characterCreationState.attributes.charisma += perk.effects.charismaBonus;
            console.log('Added', perk.effects.charismaBonus, 'to charisma');
        }
        if (perk.effects.enduranceBonus && characterCreationState.attributes.endurance !== undefined) {
            characterCreationState.attributes.endurance += perk.effects.enduranceBonus;
            console.log('Added', perk.effects.enduranceBonus, 'to endurance');
        }
        if (perk.effects.luckBonus && characterCreationState.attributes.luck !== undefined) {
            characterCreationState.attributes.luck += perk.effects.luckBonus;
            console.log('Added', perk.effects.luckBonus, 'to luck');
        }
    }

    // Apply negative attribute effects
    if (perk.negativeEffects) {
        if (perk.negativeEffects.strengthPenalty && characterCreationState.attributes.strength !== undefined) {
            characterCreationState.attributes.strength -= perk.negativeEffects.strengthPenalty;
            console.log('Subtracted', perk.negativeEffects.strengthPenalty, 'from strength');
        }
        if (perk.negativeEffects.intelligencePenalty && characterCreationState.attributes.intelligence !== undefined) {
            characterCreationState.attributes.intelligence -= perk.negativeEffects.intelligencePenalty;
            console.log('Subtracted', perk.negativeEffects.intelligencePenalty, 'from intelligence');
        }
        if (perk.negativeEffects.charismaPenalty && characterCreationState.attributes.charisma !== undefined) {
            characterCreationState.attributes.charisma -= perk.negativeEffects.charismaPenalty;
            console.log('Subtracted', perk.negativeEffects.charismaPenalty, 'from charisma');
        }
        if (perk.negativeEffects.endurancePenalty && characterCreationState.attributes.endurance !== undefined) {
            characterCreationState.attributes.endurance -= perk.negativeEffects.endurancePenalty;
            console.log('Subtracted', perk.negativeEffects.endurancePenalty, 'from endurance');
        }
        if (perk.negativeEffects.luckPenalty && characterCreationState.attributes.luck !== undefined) {
            characterCreationState.attributes.luck -= perk.negativeEffects.luckPenalty;
            console.log('Subtracted', perk.negativeEffects.luckPenalty, 'from luck');
        }
    }

    console.log('Attributes after applying perk:', characterCreationState.attributes);
}

// Update character preview display
function updateCharacterPreview() {
    console.log('=== updateCharacterPreview called ===');
    console.log('Current attributes:', characterCreationState.attributes);
    console.log('Current gold (GoldManager):', GoldManager.getGold());

    // Update player name in header
    const characterNameInput = document.getElementById('character-name-input');
    const name = characterNameInput ? characterNameInput.value.trim() : 'Player';
    const playerNameElement = document.getElementById('player-name');
    if (playerNameElement) {
        playerNameElement.textContent = name;
        console.log('Updated player name to:', name);
    }

    // NOTE: Gold is automatically updated by GoldManager across all displays

    // Update attributes display in setup form
    for (const [attr, value] of Object.entries(characterCreationState.attributes)) {
        const attrElement = document.getElementById(`attr-${attr}`);
        if (attrElement) {
            attrElement.textContent = value;
        }
    }

    // Update TOP BANNER attributes (player-strength, player-intelligence, etc.)
    for (const [attr, value] of Object.entries(characterCreationState.attributes)) {
        const bannerAttrElement = document.getElementById(`player-${attr}`);
        if (bannerAttrElement) {
            bannerAttrElement.textContent = value;
            bannerAttrElement.innerText = value;
            console.log(`💥 Updated banner #player-${attr} = ${value}`);
        }
    }

    console.log('=== updateCharacterPreview complete ===');
}

// Global flag to track if attribute buttons are set up
let attributeButtonsSetup = false;

// Setup attribute button listeners using event delegation (only once)
function setupAttributeButtons() {
    // Only set up once to avoid duplicate listeners
    if (attributeButtonsSetup) {
        console.log('📊 Attribute buttons already set up, skipping...');
        return;
    }

    console.log('📊 Setting up attribute button listeners with event delegation...');

    // Find the attributes grid container
    const attributesGrid = document.querySelector('.attributes-grid');
    if (!attributesGrid) {
        gameDeboogerWarn('🖤 attributes-grid container not found');
        return;
    }

    // Add a single event listener to the parent container using event delegation
    attributesGrid.addEventListener('click', (event) => {
        console.log('═══════════════════════════════════════');
        console.log('🔥 CLICK DETECTED IN ATTRIBUTES GRID! 🔥');
        console.log('═══════════════════════════════════════');
        console.log('Event target:', event.target);
        console.log('Event target tag:', event.target.tagName);
        console.log('Event target class:', event.target.className);

        // Check if click was on a button or inside a button
        const button = event.target.closest('.attr-btn');
        console.log('Closest .attr-btn:', button);

        if (!button) {
            console.log('⚠️ Click was not on an attribute button, ignoring');
            return; // Not a button click
        }

        event.preventDefault(); // Prevent any default behavior
        event.stopPropagation(); // Stop event bubbling

        const attr = button.dataset.attr;
        const isUpBtn = button.classList.contains('attr-up');
        const isDownBtn = button.classList.contains('attr-down');

        console.log('═══════════════════════════════════════');
        console.log(`🖱️ ATTRIBUTE BUTTON CLICKED!`);
        console.log('═══════════════════════════════════════');
        console.log('Attribute:', attr);
        console.log('Direction:', isUpBtn ? 'UP ▲' : 'DOWN ▼');
        console.log('Button disabled:', button.disabled);
        console.log('Available points:', characterCreationState.availableAttributePoints);
        console.log('Current manual value:', characterCreationState.manualAttributes[attr]);

        // Don't process if button is disabled
        if (button.disabled) {
            console.log('⚠️ Button is disabled, ignoring click');
            return;
        }

        if (isUpBtn) {
            console.log('═══════════════════════════════════════');
            console.log(`▲▲▲ INCREASING ${attr.toUpperCase()} ▲▲▲`);
            console.log('═══════════════════════════════════════');
            increaseAttribute(attr);
        } else if (isDownBtn) {
            console.log('═══════════════════════════════════════');
            console.log(`▼▼▼ DECREASING ${attr.toUpperCase()} ▼▼▼`);
            console.log('═══════════════════════════════════════');
            decreaseAttribute(attr);
        }
    }, true); // Use capture phase to ensure we get the event first

    attributeButtonsSetup = true;
    console.log('✓ Attribute button event delegation setup complete');
}

// 🎮 button validation - can't start til you've suffered through character creation
function updateStartGameButton() {
    const startGameBtn = document.getElementById('start-game-btn');
    const warningDiv = document.getElementById('start-game-warning');
    const warningText = document.getElementById('start-game-warning-text');
    if (!startGameBtn) return;

    // Check if all attribute points are spent
    const allPointsSpent = characterCreationState.availableAttributePoints === 0;

    // Check if exactly 2 perks are selected
    const hasRequiredPerks = selectedPerks && selectedPerks.length === 2;

    // Enable button only if all points are spent AND 2 perks selected
    const canStart = allPointsSpent && hasRequiredPerks;
    startGameBtn.disabled = !canStart;

    // Update warning visibility and text
    if (warningDiv && warningText) {
        if (canStart) {
            warningDiv.classList.add('hidden');
        } else {
            warningDiv.classList.remove('hidden');
            // Set warning message based on what's missing
            if (!allPointsSpent && !hasRequiredPerks) {
                warningText.textContent = `Spend ${characterCreationState.availableAttributePoints} attribute points and select 2 perks`;
            } else if (!allPointsSpent) {
                warningText.textContent = `Spend ${characterCreationState.availableAttributePoints} remaining attribute points`;
            } else {
                warningText.textContent = `Select ${2 - (selectedPerks?.length || 0)} more perk${(2 - (selectedPerks?.length || 0)) > 1 ? 's' : ''}`;
            }
        }
    }

    // Set appropriate tooltip message
    if (!allPointsSpent && !hasRequiredPerks) {
        startGameBtn.title = `You must spend all ${characterCreationState.availableAttributePoints} attribute points and select 2 character perks before starting`;
        console.log('Start Game button disabled - points remaining:', characterCreationState.availableAttributePoints, '| perks selected:', selectedPerks?.length || 0);
    } else if (!allPointsSpent) {
        startGameBtn.title = `You must spend all ${characterCreationState.availableAttributePoints} remaining attribute points before starting`;
        console.log('Start Game button disabled - points remaining:', characterCreationState.availableAttributePoints);
    } else if (!hasRequiredPerks) {
        startGameBtn.title = `You must select exactly 2 character perks before starting (${selectedPerks?.length || 0}/2 selected)`;
        console.log('Start Game button disabled - perks selected:', selectedPerks?.length || 0, '/ 2 required');
    } else {
        startGameBtn.title = 'Start your adventure!';
        console.log('Start Game button enabled - all requirements met');
    }
}

// ═══════════════════════════════════════════════════════════════
// 📊 ATTRIBUTE POINT DISTRIBUTION - min-maxing your medieval self
// ═══════════════════════════════════════════════════════════════
function increaseAttribute(attrName) {
    console.log(`=== Increasing ${attrName} ===`);
    const currentValue = characterCreationState.manualAttributes[attrName];
    const availablePoints = characterCreationState.availableAttributePoints;

    console.log('Current manual value:', currentValue);
    console.log('Available points:', availablePoints);
    console.log('Max value:', characterCreationState.maxAttributeValue);

    // Check if we have points available and haven't reached max for this attribute
    if (availablePoints > 0 && currentValue < characterCreationState.maxAttributeValue) {
        characterCreationState.manualAttributes[attrName]++;
        characterCreationState.availableAttributePoints--;
        console.log(`Increased ${attrName} to ${characterCreationState.manualAttributes[attrName]}`);
        console.log(`Points remaining: ${characterCreationState.availableAttributePoints}`);

        // IMMEDIATELY UPDATE THE DOM - FORCE IT
        const attrElement = document.getElementById(`attr-${attrName}`);
        const pointsElement = document.getElementById('attr-points-remaining');

        if (attrElement) {
            const newValue = characterCreationState.manualAttributes[attrName];
            attrElement.textContent = newValue;
            attrElement.innerText = newValue;
            attrElement.innerHTML = `<strong>${newValue}</strong>`;
            console.log(`💥 FORCED UI UPDATE: #attr-${attrName} = ${newValue}`);
        } else {
            gameDeboogerWarn(`🖤 Element #attr-${attrName} not found`);
        }

        if (pointsElement) {
            const newPoints = characterCreationState.availableAttributePoints;
            pointsElement.textContent = newPoints;
            pointsElement.innerText = newPoints;
            pointsElement.innerHTML = `<strong style="color: red; font-size: 24px;">${newPoints}</strong>`;
            console.log(`💥 FORCED UI UPDATE: Points = ${newPoints}`);
        } else {
            gameDeboogerWarn('🖤 Element #attr-points-remaining not found');
        }

        calculateCharacterStats(); // Recalculate final attributes with perks
        updateAttributeDisplay();
    } else {
        if (availablePoints <= 0) {
            console.warn('No attribute points remaining');
            addMessage('No attribute points remaining!');
        } else if (currentValue >= characterCreationState.maxAttributeValue) {
            console.warn(`${attrName} is already at maximum (${characterCreationState.maxAttributeValue})`);
            addMessage(`${attrName.charAt(0).toUpperCase() + attrName.slice(1)} is already at maximum!`);
        }
    }
}

function decreaseAttribute(attrName) {
    console.log(`=== Decreasing ${attrName} ===`);
    const currentValue = characterCreationState.manualAttributes[attrName];
    const minValue = 1; // Minimum is 1, not base value

    console.log('Current manual value:', currentValue);
    console.log('Minimum value:', minValue);

    // Check if we can decrease (must be above minimum)
    if (currentValue > minValue) {
        characterCreationState.manualAttributes[attrName]--;
        characterCreationState.availableAttributePoints++;
        console.log(`Decreased ${attrName} to ${characterCreationState.manualAttributes[attrName]}`);
        console.log(`Points remaining: ${characterCreationState.availableAttributePoints}`);

        // IMMEDIATELY UPDATE THE DOM - FORCE IT
        const attrElement = document.getElementById(`attr-${attrName}`);
        const pointsElement = document.getElementById('attr-points-remaining');

        if (attrElement) {
            const newValue = characterCreationState.manualAttributes[attrName];
            attrElement.textContent = newValue;
            attrElement.innerText = newValue;
            attrElement.innerHTML = `<strong>${newValue}</strong>`;
            console.log(`💥 FORCED UI UPDATE: #attr-${attrName} = ${newValue}`);
        } else {
            gameDeboogerWarn(`🖤 Element #attr-${attrName} not found`);
        }

        if (pointsElement) {
            const newPoints = characterCreationState.availableAttributePoints;
            pointsElement.textContent = newPoints;
            pointsElement.innerText = newPoints;
            pointsElement.innerHTML = `<strong style="color: red; font-size: 24px;">${newPoints}</strong>`;
            console.log(`💥 FORCED UI UPDATE: Points = ${newPoints}`);
        } else {
            gameDeboogerWarn('🖤 Element #attr-points-remaining not found');
        }

        calculateCharacterStats(); // Recalculate final attributes with perks
        updateAttributeDisplay();
    } else {
        console.warn(`${attrName} is already at minimum (${minValue})`);
        addMessage(`${attrName.charAt(0).toUpperCase() + attrName.slice(1)} is already at minimum!`);
    }
}

// 🖤 Expose attribute functions globally for onclick handlers 🖤
window.increaseAttribute = increaseAttribute;
window.decreaseAttribute = decreaseAttribute;

function updateAttributeDisplay() {
    console.log('=== Updating Attribute Display ===');
    console.log('characterCreationState.attributes:', characterCreationState.attributes);

    // Update attribute values (show FINAL values with perks applied)
    for (const [attr, value] of Object.entries(characterCreationState.attributes)) {
        const attrElement = document.getElementById(`attr-${attr}`);
        console.log(`Looking for #attr-${attr}:`, attrElement ? 'FOUND' : 'NOT FOUND');
        if (attrElement) {
            const oldValue = attrElement.textContent;

            // FORCE UPDATE - multiple methods
            attrElement.textContent = value;
            attrElement.innerText = value;
            attrElement.innerHTML = value;

            // Force reflow/repaint
            void attrElement.offsetHeight;
            attrElement.style.display = 'none';
            void attrElement.offsetHeight;
            attrElement.style.display = '';

            console.log(`✓ Updated ${attr}: ${oldValue} → ${value} (FORCED)`);
            console.log(`   Element now shows: "${attrElement.textContent}"`);

            // Add visual flash
            attrElement.style.transition = 'all 0.2s';
            attrElement.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
            attrElement.style.transform = 'scale(1.5)';
            attrElement.style.fontWeight = 'bold';
            setTimeout(() => {
                attrElement.style.backgroundColor = '';
                attrElement.style.transform = 'scale(1)';
                attrElement.style.fontWeight = '';
            }, 300);
        } else {
            gameDeboogerWarn(`🖤 Element #attr-${attr} not found`);
        }
    }

    // Update points remaining
    const pointsElement = document.getElementById('attr-points-remaining');
    console.log('Points element:', pointsElement ? 'FOUND' : 'NOT FOUND');
    if (pointsElement) {
        const oldPoints = pointsElement.textContent;

        // FORCE UPDATE - multiple methods
        pointsElement.textContent = characterCreationState.availableAttributePoints;
        pointsElement.innerText = characterCreationState.availableAttributePoints;
        pointsElement.innerHTML = characterCreationState.availableAttributePoints;

        // Force reflow/repaint
        void pointsElement.offsetHeight;
        pointsElement.style.display = 'none';
        void pointsElement.offsetHeight;
        pointsElement.style.display = '';

        console.log(`✓ Updated points: ${oldPoints} → ${characterCreationState.availableAttributePoints} (FORCED)`);
        console.log(`   Element now shows: "${pointsElement.textContent}"`);

        // Add VERY OBVIOUS visual flash
        pointsElement.style.transition = 'all 0.2s';
        pointsElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        pointsElement.style.transform = 'scale(2)';
        pointsElement.style.fontWeight = 'bold';
        pointsElement.style.color = '#fff';
        setTimeout(() => {
            pointsElement.style.backgroundColor = '';
            pointsElement.style.transform = 'scale(1)';
            pointsElement.style.fontWeight = '';
            pointsElement.style.color = '';
        }, 300);
    } else {
        gameDeboogerWarn('🖤 Points element not found');
    }

    // Update button states (based on MANUAL values, not final)
    document.querySelectorAll('.attr-btn').forEach(btn => {
        const attr = btn.dataset.attr;
        const isUpBtn = btn.classList.contains('attr-up');
        const isDownBtn = btn.classList.contains('attr-down');

        if (isUpBtn) {
            // Disable if no points left or manual attribute at max
            const canIncrease = characterCreationState.availableAttributePoints > 0 &&
                              characterCreationState.manualAttributes[attr] < characterCreationState.maxAttributeValue;
            btn.disabled = !canIncrease;
        } else if (isDownBtn) {
            // Disable if manual attribute at minimum (1)
            const canDecrease = characterCreationState.manualAttributes[attr] > 1;
            btn.disabled = !canDecrease;
        }
    });

    // Update Start Game button state
    updateStartGameButton();
}

// Randomize character
function randomizeCharacter() {
    console.log('=== Randomizing Character ===');

    try {
        // Generate random name
        console.log('📝 Step 1: Generating random name...');
        const names = ['Alex', 'Morgan', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        console.log('Random name generated:', randomName);

        console.log('📝 Step 2: Setting input value...');
        const characterNameInput = document.getElementById('character-name-input');
        console.log('characterNameInput element:', characterNameInput);
        if (!characterNameInput) {
            throw new Error('character-name-input element not found in DOM!');
        }
        characterNameInput.value = randomName;
        console.log('✓ Input value set to:', randomName);

        // Update player name display at top
        console.log('📝 Step 3: Updating player name display...');
        const playerNameElement = document.getElementById('player-name');
        if (playerNameElement) {
            playerNameElement.textContent = randomName;
            playerNameElement.innerText = randomName;
            console.log('✓ Player name display updated to:', randomName);
        }

        // Select random difficulty
        console.log('📝 Step 4: Selecting random difficulty...');
        const difficulties = ['easy', 'normal', 'hard'];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        console.log('Random difficulty selected:', randomDifficulty);

        const difficultyRadio = document.getElementById(`difficulty-${randomDifficulty}`);
        console.log('Difficulty radio element:', difficultyRadio);
        if (difficultyRadio) {
            difficultyRadio.checked = true;
            console.log('✓ Difficulty radio checked');
            console.log('📝 Step 5: Calling onDifficultyChange...');
            onDifficultyChange(); // Update gold based on difficulty
            console.log('✓ onDifficultyChange completed');
        }

        // Clear current perk selection
        console.log('📝 Step 6: Clearing current perk selection...');
        selectedPerks = [];
        document.querySelectorAll('.perk-card').forEach(card => {
            card.classList.remove('selected');
        });
        console.log('✓ Perk selection cleared');

        // Select exactly 2 random perks
        console.log('📝 Step 7: Selecting 2 random perks...');
        const perkIds = Object.keys(perks);
        console.log('Available perks:', perkIds.length);
        while (selectedPerks.length < 2 && perkIds.length >= 2) {
            const randomPerkId = perkIds[Math.floor(Math.random() * perkIds.length)];
            if (!selectedPerks.includes(randomPerkId)) {
                selectedPerks.push(randomPerkId);
                console.log('✓ Selected random perk:', randomPerkId);

                // Mark perk card as selected in UI
                const perkCard = document.querySelector(`.perk-card[data-perk-id="${randomPerkId}"]`);
                if (perkCard) {
                    perkCard.classList.add('selected');
                    console.log('✓ Marked perk card as selected in UI');
                }
            }
        }
        console.log('✅ Random perks selected:', selectedPerks);

        // Reset manual attributes to base
        console.log('📝 Step 8: Resetting attributes...');
        characterCreationState.manualAttributes = {...baseAttributes};
        characterCreationState.availableAttributePoints = 5;
        console.log('✓ Attributes reset to base');

        // Distribute 5 attribute points randomly (for total of 30)
        console.log('📝 Step 9: Distributing attribute points...');
        const attributeNames = Object.keys(baseAttributes);
        for (let i = 0; i < 5; i++) {
            // Pick random attribute that isn't already at max
            let validAttrs = attributeNames.filter(attr =>
                characterCreationState.manualAttributes[attr] < characterCreationState.maxAttributeValue
            );
            if (validAttrs.length > 0) {
                const randomAttr = validAttrs[Math.floor(Math.random() * validAttrs.length)];
                characterCreationState.manualAttributes[randomAttr]++;
                characterCreationState.availableAttributePoints--;
            }
        }
        console.log('✓ Random manual attributes:', characterCreationState.manualAttributes);
        console.log('✓ Points remaining:', characterCreationState.availableAttributePoints);

        // Update all displays
        console.log('📝 Step 10: Updating all displays...');
        updatePerkSelection();
        displaySelectedPerks();
        calculateCharacterStats(); // This calls updateCharacterPreview
        updateAttributeDisplay(); // This calls updateStartGameButton
        console.log('✓ Display functions called');

        // Force update all attribute displays
        console.log('📝 Step 11: Force updating attribute displays...');
        Object.keys(characterCreationState.manualAttributes).forEach(attr => {
            const attrElement = document.getElementById(`attr-${attr}`);
            if (attrElement) {
                attrElement.textContent = characterCreationState.manualAttributes[attr];
                attrElement.innerHTML = `<strong>${characterCreationState.manualAttributes[attr]}</strong>`;
                console.log(`💥 Updated #attr-${attr} = ${characterCreationState.manualAttributes[attr]}`);
            }
        });

        // Force update points display
        console.log('📝 Step 12: Force updating points display...');
        const pointsElement = document.getElementById('attr-points-remaining');
        if (pointsElement) {
            pointsElement.textContent = characterCreationState.availableAttributePoints;
            pointsElement.innerHTML = `<strong style="color: green; font-size: 20px;">${characterCreationState.availableAttributePoints}</strong>`;
            console.log(`💥 Updated points = ${characterCreationState.availableAttributePoints}`);
        }

        // addMessage('✨ Character randomized!'); // Disabled - messages element might not exist
        console.log('✨ Character randomized!');
        console.log('✅✅✅ RANDOMIZATION COMPLETE ✅✅✅');

    } catch (error) {
        // 🦇 Randomization failed - warn and let outer handler decide
        console.warn('🖤 Randomize character failed:', error.message);
        throw error; // Re-throw so outer catch can also log it
    }
}

// 🖤 Expose randomizeCharacter globally for global click handler 🖤
window.randomizeCharacter = randomizeCharacter;

function createCharacter(event) {
    console.log('=== createCharacter called ===');
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    // 🌦️ Weather transfer moved to AFTER game-setup-panel is hidden (see line ~6642)
    // This prevents CSS from hiding the weather overlay while we're creating particles

    const characterNameInput = document.getElementById('character-name-input');
    const name = characterNameInput ? characterNameInput.value.trim() : '';

    // Get difficulty from radio buttons directly (more reliable)
    const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    const difficulty = selectedDifficultyRadio ? selectedDifficultyRadio.value : (characterCreationState.difficulty || 'normal');

    // Update characterCreationState in case it was out of sync
    characterCreationState.difficulty = difficulty;

    console.log('Character name:', name);
    console.log('Difficulty from radio:', difficulty);
    console.log('Character creation state:', characterCreationState);
    console.log('Selected perks:', selectedPerks);

    // 🖤💀 VALIDATION: Check for ALL missing required fields and show warnings 💀
    let validationErrors = [];

    // 🖤 Add shake animation if not already defined 💀
    if (!document.getElementById('validation-shake-style')) {
        const style = document.createElement('style');
        style.id = 'validation-shake-style';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-5px); }
                40%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 🖤💀 CHECK 1: Character name is required 💀
    if (!name) {
        validationErrors.push('⚠️ Character name is required!');

        // Highlight the name field
        if (characterNameInput) {
            characterNameInput.style.border = '2px solid #f44336';
            characterNameInput.style.animation = 'shake 0.5s ease-in-out';
            characterNameInput.focus();

            // Clear error on input
            const clearNameError = () => {
                characterNameInput.style.border = '';
                characterNameInput.style.animation = '';
                characterNameInput.removeEventListener('input', clearNameError);
            };
            characterNameInput.addEventListener('input', clearNameError);
        }
    }

    // 🖤💀 CHECK 2: All attribute points must be spent 💀
    const remainingPoints = characterCreationState.availableAttributePoints || 0;
    if (remainingPoints > 0) {
        validationErrors.push(`⚠️ You have ${remainingPoints} attribute point${remainingPoints > 1 ? 's' : ''} left to spend!`);

        // Highlight the attribute points section
        const pointsElement = document.getElementById('attr-points-remaining');
        if (pointsElement) {
            pointsElement.style.color = '#f44336';
            pointsElement.style.fontWeight = 'bold';
            pointsElement.style.animation = 'shake 0.5s ease-in-out';

            // Also highlight parent container if exists
            const attrSection = pointsElement.closest('.attribute-points-section') ||
                               pointsElement.closest('.attributes-section') ||
                               pointsElement.parentElement;
            if (attrSection) {
                attrSection.style.border = '2px solid #f44336';
                attrSection.style.borderRadius = '8px';
                attrSection.style.padding = '10px';
            }
        }
    }

    // 🖤💀 SHOW ALL VALIDATION ERRORS IN A BLOCKING MODAL 💀
    if (validationErrors.length > 0) {
        console.warn('Character creation validation failed:', validationErrors);

        // Build error list HTML
        const errorListHtml = validationErrors
            .map(err => `<div style="margin: 8px 0; padding-left: 10px; border-left: 3px solid #f44336;">${err}</div>`)
            .join('');

        // Use ModalSystem for proper input blocking
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🚫 Cannot Start Game',
                content: `<div style="color: #f44336; margin-bottom: 10px;">Please fix the following:</div>${errorListHtml}`,
                buttons: [
                    { text: "OK, I'll fix it", className: 'primary', onClick: () => ModalSystem.hide() }
                ],
                closeable: true,
                draggable: true
            });
        } else {
            // Fallback alert if ModalSystem not available
            alert('Cannot start game:\n' + validationErrors.join('\n'));
        }

        // Also show in message log
        validationErrors.forEach(err => addMessage(err, 'error'));

        return; // Don't proceed with character creation
    }

    // Get starting gold from GoldManager (single source of truth)
    const startingGold = GoldManager.getGold();
    console.log('Starting gold from GoldManager:', startingGold);

    // Generate unique character ID for leaderboard tracking
    // This ensures each character can only have ONE entry on the leaderboard
    const characterId = 'char_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11);
    console.log('🎭 Generated unique character ID:', characterId);

    // 🖤 Pull player config from GameConfig for starting stats and items
    const playerConfig = (typeof GameConfig !== 'undefined' && GameConfig.player) ? GameConfig.player : {
        startingStats: { health: 100, maxHealth: 100, hunger: 50, maxHunger: 100, thirst: 50, maxThirst: 100, stamina: 100, maxStamina: 100, happiness: 50, maxHappiness: 100 },
        startingItems: { food: 2, water: 2 },
        startingTransportation: 'backpack'
    };
    const startingStats = playerConfig.startingStats;
    const startingItems = playerConfig.startingItems;

    // Initialize player with stats - dragged from the config's dark embrace
    game.player = {
        characterId: characterId, // 🏆 Unique ID for leaderboard deduplication
        name: name,
        difficulty: difficulty,
        gold: startingGold,
        inventory: {},
        reputation: 0,
        skills: {
            trading: 1,
            negotiation: 1,
            perception: 1
        },
        stats: {
            health: startingStats.health,
            maxHealth: startingStats.maxHealth,
            hunger: startingStats.hunger,
            maxHunger: startingStats.maxHunger,
            thirst: startingStats.thirst,
            maxThirst: startingStats.maxThirst,
            stamina: startingStats.stamina,
            maxStamina: startingStats.maxStamina,
            happiness: startingStats.happiness,
            maxHappiness: startingStats.maxHappiness
        },
        attributes: {...characterCreationState.attributes},
        transportation: playerConfig.startingTransportation,
        ownedTransportation: [playerConfig.startingTransportation],  // Legacy - keep for backwards compat
        ownedTransport: ['satchel'],  // New transport system - start with just satchel
        currentLoad: 0, // Current weight carried
        lastRestTime: 0,
        perks: selectedPerks,
        defeatedBosses: [], // Track boss kills for dungeon access and doom portal - Unity says you gotta earn it 💀
        bossProgress: {} // Track exploration progress toward boss spawns per location
    };

    // Give starting items from config - minimal survival kit (perks add the rest)
    game.player.inventory = {
        ...startingItems,
        gold: startingGold
    };

    // Apply perk starting items - stack items from all selected perks
    if (selectedPerks && selectedPerks.length > 0) {
        console.log('🎒 Applying perk starting items for perks:', selectedPerks);

        selectedPerks.forEach(perkIdOrObj => {
            // Get the perk ID (handle both string IDs and perk objects)
            const perkId = typeof perkIdOrObj === 'string' ? perkIdOrObj : perkIdOrObj?.id;

            // Look up the perk definition
            const perkData = perks[perkId];

            if (perkData && perkData.startingItems) {
                console.log(`🎒 Adding starting items from perk '${perkId}':`, perkData.startingItems);

                // Add each item from the perk's starting items
                for (const [itemId, quantity] of Object.entries(perkData.startingItems)) {
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.inventory.add(itemId, quantity, 'perk_starting_item');
                    } else {
                        if (!game.player.inventory[itemId]) {
                            game.player.inventory[itemId] = 0;
                        }
                        game.player.inventory[itemId] += quantity;
                    }
                    const total = (typeof PlayerStateManager !== 'undefined')
                        ? PlayerStateManager.inventory.getQuantity(itemId)
                        : game.player.inventory[itemId];
                    console.log(`  + ${quantity}x ${itemId} (total: ${total})`);
                }
            } else {
                console.warn(`🎒 Perk '${perkId}' not found or has no startingItems`);
            }
        });

        const finalInv = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : game.player.inventory;
        console.log('🎒 Final inventory after perk items:', finalInv);
    }

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL-FIRST FLOW - World loads AFTER tutorial choice!
    //  We DON'T call initializeGameWorld() here anymore. Instead, we
    //  show the tutorial choice modal first, and the world gets loaded
    //  based on the player's choice (tutorial world vs main world).
    // ═══════════════════════════════════════════════════════════════

    // Update UI (player exists but no world yet - that's fine)
    updatePlayerInfo();
    updatePlayerStats();
    updateInventoryDisplay(); // 🎒 Make sure inventory shows our starting items!

    // Hide setup panel
    hidePanel('game-setup-panel');

    // 🌦️ Transfer menu weather now (before any world loads)
    if (typeof MenuWeatherSystem !== 'undefined') {
        const menuWeather = MenuWeatherSystem.currentSeason;
        if (menuWeather && typeof WeatherSystem !== 'undefined' && WeatherSystem.setInitialWeatherFromMenu) {
            WeatherSystem.setInitialWeatherFromMenu(menuWeather);
            console.log(`🌦️ Transferring menu weather: ${menuWeather}`);
        }
        if (MenuWeatherSystem.stop) {
            MenuWeatherSystem.stop();
            console.log('🌦️ Menu weather stopped - game weather takes over');
        }
    }

    // 🌦️ Clean up - remove weather container from body
    const weatherContainer = document.getElementById('menu-weather-container');
    if (weatherContainer && weatherContainer.parentNode === document.body) {
        weatherContainer.remove();
        console.log('🌦️ Menu weather container cleaned up');
    }

    // Welcome message (world-agnostic)
    addMessage(`Welcome, ${name}! Starting on ${difficulty} difficulty.`);

    // ═══════════════════════════════════════════════════════════════
    //  SHOW GAME UI FIRST - Modal needs visible container!
    //  This makes game-container visible so ModalSystem can display
    // ═══════════════════════════════════════════════════════════════
    showGameUI();

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL CHOICE FIRST - Before ANY world generation!
    //  InitialEncounterSystem handles:
    //  1. Show tutorial Yes/No modal
    //  2. Based on choice: Load tutorial world OR main world
    //  3. Transition to GameState.PLAYING
    //  4. Start appropriate quests
    // ═══════════════════════════════════════════════════════════════
    if (typeof InitialEncounterSystem !== 'undefined' && InitialEncounterSystem.triggerInitialEncounter) {
        // 🎭 PRE-CACHE: Start generating hooded stranger dialogue + TTS NOW!
        // This runs in background so by the time player finishes tutorial choice,
        // the stranger's voice is ready for instant playback
        if (InitialEncounterSystem.preCacheStrangerDialogue) {
            InitialEncounterSystem.preCacheStrangerDialogue(name);
            console.log('🎭 Hooded stranger pre-cache started in background');
        }

        InitialEncounterSystem.triggerInitialEncounter(name, 'greendale');
    } else {
        // Fallback if InitialEncounterSystem not available - load main world directly
        console.warn('InitialEncounterSystem not available - loading main world directly');
        initializeGameWorld();
        changeState(GameState.PLAYING);
        updateMarketButtonVisibility();
    }
}

// 🖤 Expose createCharacter globally for global click handler 🖤
window.createCharacter = createCharacter;

// 🖤 Handle difficulty change to update gold preview - FORCE UPDATE DISPLAYS 🖤
function onDifficultyChange() {
    console.log('═══════════════════════════════════════');
    console.log('🔥🔥🔥 DIFFICULTY CHANGED! 🔥🔥🔥');
    console.log('═══════════════════════════════════════');

    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'normal';
    console.log('Selected difficulty:', difficulty);

    // Calculate base gold based on difficulty
    let baseGold = 100;
    switch (difficulty) {
        case 'easy':
            baseGold = 120; // +20%
            console.log('✓ Easy: 120 gold (+20%)');
            break;
        case 'hard':
            baseGold = 80; // -20%
            console.log('✓ Hard: 80 gold (-20%)');
            break;
        case 'normal':
        default:
            baseGold = 100;
            console.log('✓ Normal: 100 gold');
            break;
    }

    console.log('OLD baseGold:', characterCreationState?.baseGold);
    console.log('NEW baseGold:', baseGold);

    // Update character creation state
    if (!characterCreationState) {
        gameDeboogerWarn('🖤 characterCreationState is undefined');
        return;
    }

    characterCreationState.difficulty = difficulty;
    characterCreationState.baseGold = baseGold;
    characterCreationState.currentGold = baseGold; // Set current gold immediately

    console.log('🎯 Recalculating with perks...');

    // Recalculate with perks applied
    calculateCharacterStats();

    // FORCE update the setup gold display directly
    const setupGoldElement = document.getElementById('setup-gold-amount');
    if (setupGoldElement) {
        setupGoldElement.textContent = characterCreationState.currentGold;
        console.log('💰 FORCED setup-gold-amount to:', characterCreationState.currentGold);
    } else {
        gameDeboogerWarn('🖤 setup-gold-amount element not found');
    }

    // FORCE GoldManager to update all displays
    GoldManager.setGold(characterCreationState.currentGold, `Difficulty: ${difficulty}`);
    console.log('💰 FORCED GoldManager to:', characterCreationState.currentGold);

    console.log('✅ Final gold:', characterCreationState.currentGold);
    console.log('═══════════════════════════════════════');
}

// 🖤 Expose functions for deboogering 💀
window.onDifficultyChange = onDifficultyChange;

// Helper function to set difficulty from console
window.setDifficulty = function(difficulty) {
    const validDifficulties = ['easy', 'normal', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
        gameDeboogerWarn('🖤 Invalid difficulty - use: easy, normal, or hard');
        return;
    }

    console.log(`🎯 Setting difficulty to: ${difficulty}`);

    // Make sure listeners are set up
    if (!difficultyListenersSetup) {
        console.log('⚠️ Setting up listeners first...');
        setupDifficultyListeners();
    }

    const radio = document.getElementById(`difficulty-${difficulty}`);
    if (radio) {
        radio.checked = true;
        console.log('✓ Radio button checked');

        // Simulate click event
        radio.click();

        // Also call directly
        onDifficultyChange();
    } else {
        gameDeboogerWarn('🖤 Radio button not found');
    }
};

// 🖤 Test function to verify difficulty system is working 🖤
window.testDifficultySystem = function() {
    console.log('═══════════════════════════════════════');
    console.log('🧪 TESTING DIFFICULTY SYSTEM');
    console.log('═══════════════════════════════════════');

    const container = document.querySelector('.difficulty-selection');
    const radios = document.querySelectorAll('input[name="difficulty"]');
    const setupGoldDisplay = document.getElementById('setup-gold-amount');
    const playerGoldDisplay = document.getElementById('player-gold');

    console.log('1. Difficulty container:', container ? '✓ FOUND' : '✗ NOT FOUND');
    console.log('2. Radio buttons:', radios.length, 'found');
    radios.forEach((r, i) => {
        console.log(`   - Radio ${i + 1}: value="${r.value}", checked=${r.checked}`);
    });

    console.log('3. Setup gold display (new game panel):', setupGoldDisplay ? '✓ FOUND' : '✗ NOT FOUND');
    if (setupGoldDisplay) {
        console.log('   - Current value:', setupGoldDisplay.textContent);
        console.log('   - Visible:', setupGoldDisplay.offsetParent !== null);
    }

    console.log('4. Player gold display (header):', playerGoldDisplay ? '✓ FOUND' : '✗ NOT FOUND');
    if (playerGoldDisplay) {
        console.log('   - Current value:', playerGoldDisplay.textContent);
        console.log('   - Visible:', playerGoldDisplay.offsetParent !== null);
    }

    console.log('5. CharacterCreationState:');
    console.log('   - baseGold:', characterCreationState?.baseGold);
    console.log('   - currentGold:', characterCreationState?.currentGold);
    console.log('   - difficulty:', characterCreationState?.difficulty);

    console.log('6. GoldManager:');
    console.log('   - Current gold:', GoldManager.getGold());
    console.log('   - Registered displays:', GoldManager._displays.length);

    console.log('\n🧪 Manually triggering onDifficultyChange()...');
    onDifficultyChange();

    console.log('\n✅ AFTER onDifficultyChange():');
    console.log('   - Setup gold display:', setupGoldDisplay ? setupGoldDisplay.textContent : 'NOT FOUND');
    console.log('   - Player gold display:', playerGoldDisplay ? playerGoldDisplay.textContent : 'NOT FOUND');
    console.log('   - baseGold:', characterCreationState?.baseGold);
    console.log('   - currentGold:', characterCreationState?.currentGold);
    console.log('   - GoldManager:', GoldManager.getGold());
    console.log('═══════════════════════════════════════');

    return {
        setupGold: setupGoldDisplay?.textContent,
        playerGold: playerGoldDisplay?.textContent,
        baseGold: characterCreationState?.baseGold,
        currentGold: characterCreationState?.currentGold,
        goldManager: GoldManager.getGold()
    };
};

// Start game with difficulty selection
function startGameWithDifficulty() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'normal';

    // Hide game setup and show character creation
    hidePanel('game-setup-panel');
    changeState(GameState.CHARACTER_CREATION);
    showPanel('character-panel');
    initializeCharacterCreation(difficulty);
    addMessage(`Selected ${difficulty} difficulty. Now create your character.`);
}

// Cancel game setup and return to menu
function cancelGameSetup() {
    console.log('🏠 Canceling game setup, returning to main menu...');
    hidePanel('game-setup-panel');

    // Hide any other setup-related panels
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }

    // 🌦️ Move weather container back to main menu and restore menu content
    const weatherContainer = document.getElementById('menu-weather-container');
    const mainMenu = document.getElementById('main-menu');
    const menuContent = mainMenu?.querySelector('.menu-content');

    // 🖤 IMPORTANT: Restore menu content visibility BEFORE moving weather container
    if (menuContent) {
        menuContent.style.display = ''; // Restore menu content visibility
        console.log('🖤 Menu content visibility restored');
    }

    if (weatherContainer && mainMenu) {
        // Move it back to main menu as first child (CSS handles positioning)
        mainMenu.insertBefore(weatherContainer, mainMenu.firstChild);
        console.log('🌦️ Weather container restored to main menu');
    }

    // 🖤 Make sure main menu is NOT hidden before showScreen tries to show it
    if (mainMenu) {
        mainMenu.classList.remove('hidden');
    }

    // Show main menu screen
    showScreen('main-menu');
    changeState(GameState.MENU);

    // 🖤 Re-initialize menu weather if it stopped
    if (typeof MenuWeatherSystem !== 'undefined' && !MenuWeatherSystem.isActive) {
        console.log('🌦️ Restarting menu weather system...');
        MenuWeatherSystem.init();
    }

    console.log('🏠 Returned to main menu');
}
// Expose globally for inline onclick handlers
window.cancelGameSetup = cancelGameSetup;

// 🏠 Quit from in-game menu back to main menu
function quitToMainMenu() {
    console.log('🏠 Quitting to main menu...');

    // Hide game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }

    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    // 🌦️ Stop game weather and restore menu weather
    if (typeof WeatherSystem !== 'undefined') {
        WeatherSystem.stopParticles();
    }

    // Get main menu elements
    const mainMenu = document.getElementById('main-menu');
    const menuContent = mainMenu?.querySelector('.menu-content');
    const weatherContainer = document.getElementById('menu-weather-container');

    // 🖤 Restore menu content visibility
    if (menuContent) {
        menuContent.style.display = '';
        console.log('🖤 Menu content visibility restored');
    }

    // 🌦️ Move weather container back to main menu if it was moved
    if (weatherContainer && mainMenu && weatherContainer.parentElement !== mainMenu) {
        mainMenu.insertBefore(weatherContainer, mainMenu.firstChild);
        console.log('🌦️ Weather container restored to main menu');
    }

    // 🖤 Make sure main menu is visible
    if (mainMenu) {
        mainMenu.classList.remove('hidden');
    }

    // Show main menu screen
    showScreen('main-menu');
    changeState(GameState.MENU);

    // 🌦️ Restart menu weather system
    if (typeof MenuWeatherSystem !== 'undefined') {
        MenuWeatherSystem.stop(); // Stop any existing
        setTimeout(() => MenuWeatherSystem.init(), 100); // Restart fresh
        console.log('🌦️ Menu weather system restarted');
    }

    console.log('🏠 Returned to main menu');
}
window.quitToMainMenu = quitToMainMenu;

function initializeGameWorld() {
    // Initialize GameWorld system
    GameWorld.init();

    // 🖤💀 Reset doom world state on new game - no bleeding between sessions!
    if (typeof DoomWorldSystem !== 'undefined') {
        DoomWorldSystem.isActive = false;
        DoomWorldSystem._removeDoomEffects?.(); // Remove CSS effects, indicator, etc.
        console.log('💀 DoomWorldSystem reset for new game');
    }
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.currentWorld = 'normal';
        TravelSystem.doomDiscoveredPaths?.clear?.(); // Reset doom discovered paths
        console.log('🛤️ TravelSystem world reset to normal');
    }
    // Reset game doom flag
    game.inDoomWorld = false;
    // Remove any lingering doom body class
    document.body.classList.remove('doom-world');

    // Determine starting location based on selected perks
    let startLocationId = 'greendale'; // Default starting location (a village with a market)

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

    // Check selected perks for starting locations
    // Use game.player.perks if available (tutorial skip scenario), otherwise use global selectedPerks
    const playerPerks = (game?.player?.perks?.length > 0) ? game.player.perks : selectedPerks;
    if (playerPerks && playerPerks.length > 0) {
        // Collect all valid starting locations from perks
        const possibleLocations = [];

        for (const perkId of playerPerks) {
            const perk = perks[perkId];
            if (perk && perk.startingLocation) {
                let mappedLocation = locationMapping[perk.startingLocation] || perk.startingLocation;

                // Verify the location exists in GameWorld
                if (GameWorld.locations[mappedLocation]) {
                    possibleLocations.push({
                        locationId: mappedLocation,
                        perkName: perk.name
                    });
                }
            }
        }

        // If we have possible locations, pick one randomly
        if (possibleLocations.length > 0) {
            const chosen = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
            startLocationId = chosen.locationId;
            console.log(`Starting at ${startLocationId} based on perk: ${chosen.perkName}`);

            // Log if there was a conflict
            if (possibleLocations.length > 1) {
                const locationNames = possibleLocations.map(p => `${p.perkName} (${p.locationId})`).join(', ');
                console.log(`Multiple starting locations from perks: ${locationNames}`);
                console.log(`Randomly chose: ${chosen.perkName}'s location`);
            }
        }
    }

    // Get the actual location data
    const startLocation = GameWorld.locations[startLocationId];
    if (!startLocation) {
        // 🦇 Invalid start location - fall back to greendale silently
        console.warn(`Starting location ${startLocationId} not found - using greendale`);
        startLocationId = 'greendale';
    }

    const location = GameWorld.locations[startLocationId];

    // Set starting location via WorldStateManager
    const startLocData = {
        id: startLocationId,
        name: location.name,
        description: location.description
    };
    if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
        WorldStateManager.setCurrentLocation(startLocData, 'game_start');
    } else {
        game.currentLocation = startLocData;
    }

    // Initialize gatehouse system with starting zone
    // This ensures the starting zone + capital are always accessible
    if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.setStartingZone) {
        GatehouseSystem.setStartingZone(startLocationId);
    }

    // 🖤💀 PROPERLY set visited locations to ONLY the starting location
    // GameWorld.init() sets it to ['greendale'] as default, but we need the ACTUAL starting location
    GameWorld.visitedLocations = [startLocationId];
    console.log(`🗺️ Visited locations set to starting location: [${startLocationId}]`);

    console.log(`Player starting at: ${location.name}`);

    updateLocationInfo();

    // Center world view on player after initialization
    TimerManager.setTimeout(() => {
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.centerOnPlayer) {
            GameWorldRenderer.centerOnPlayer();
        }
        if (typeof TravelSystem !== 'undefined' && TravelSystem.centerOnPlayer) {
            TravelSystem.centerOnPlayer();
        }
    }, 500);
}

function updatePlayerInfo() {
    if (game.player) {
        // Use merchant rank title if available, otherwise just player name
        if (typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.getPlayerNameWithTitle) {
            elements.playerName.textContent = MerchantRankSystem.getPlayerNameWithTitle();
        } else {
            elements.playerName.textContent = game.player.name;
        }
        elements.playerGold.textContent = formatGoldCompact(game.player.gold); // 🦇 Compact for billions 💀

        // Update attribute displays
        if (elements.playerStrength) elements.playerStrength.textContent = game.player.attributes.strength;
        if (elements.playerIntelligence) elements.playerIntelligence.textContent = game.player.attributes.intelligence;
        if (elements.playerCharisma) elements.playerCharisma.textContent = game.player.attributes.charisma;
        if (elements.playerEndurance) elements.playerEndurance.textContent = game.player.attributes.endurance;
        if (elements.playerLuck) elements.playerLuck.textContent = game.player.attributes.luck;

        // Update merchant rank if system is available
        if (typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.checkForRankUp) {
            MerchantRankSystem.checkForRankUp();
        }
    }
}

// Update player stats display - now updates side panel vitals
function updatePlayerStats() {
    if (!game.player || !game.player.stats) return;

    const stats = game.player.stats;

    // Update side panel vital bars
    const healthFill = document.getElementById('health-fill');
    const hungerFill = document.getElementById('hunger-fill');
    const thirstFill = document.getElementById('thirst-fill');
    const energyFill = document.getElementById('energy-fill');

    const healthDisplay = document.getElementById('player-health-display');
    const hungerDisplay = document.getElementById('player-hunger-display');
    const thirstDisplay = document.getElementById('player-thirst-display');
    const energyDisplay = document.getElementById('player-energy-display');

    if (healthFill) healthFill.style.width = `${(stats.health / stats.maxHealth) * 100}%`;
    if (hungerFill) hungerFill.style.width = `${(stats.hunger / stats.maxHunger) * 100}%`;
    if (thirstFill) thirstFill.style.width = `${(stats.thirst / stats.maxThirst) * 100}%`;
    if (energyFill) energyFill.style.width = `${(stats.stamina / stats.maxStamina) * 100}%`;

    if (healthDisplay) healthDisplay.textContent = Math.round(stats.health);
    if (hungerDisplay) hungerDisplay.textContent = Math.round(stats.hunger);
    if (thirstDisplay) thirstDisplay.textContent = Math.round(stats.thirst);
    if (energyDisplay) energyDisplay.textContent = Math.round(stats.stamina);

    // Legacy: keep old stats display working if it exists elsewhere
    let statsDisplay = document.getElementById('player-stats');
    if (statsDisplay) {
        statsDisplay.innerHTML = `
            <div class="stat-bar">
                <span class="stat-label">❤️ Health</span>
                <div class="stat-progress">
                    <div class="stat-fill health-fill" style="width: ${(stats.health / stats.maxHealth) * 100}%"></div>
                </div>
                <span class="stat-value">${Math.round(stats.health)}/${Math.round(stats.maxHealth)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">🍖 Hunger</span>
                <div class="stat-progress">
                    <div class="stat-fill hunger-fill" style="width: ${(stats.hunger / stats.maxHunger) * 100}%"></div>
                </div>
                <span class="stat-value">${Math.round(stats.hunger)}/${Math.round(stats.maxHunger)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">💧 Thirst</span>
                <div class="stat-progress">
                    <div class="stat-fill thirst-fill" style="width: ${(stats.thirst / stats.maxThirst) * 100}%"></div>
                </div>
                <span class="stat-value">${Math.round(stats.thirst)}/${Math.round(stats.maxThirst)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">⚡ Stamina</span>
                <div class="stat-progress">
                    <div class="stat-fill stamina-fill" style="width: ${(stats.stamina / stats.maxStamina) * 100}%"></div>
                </div>
                <span class="stat-value">${Math.round(stats.stamina)}/${Math.round(stats.maxStamina)}</span>
            </div>
            <div class="stat-bar">
                <span class="stat-label">😊 Happiness</span>
                <div class="stat-progress">
                    <div class="stat-fill happiness-fill" style="width: ${(stats.happiness / stats.maxHappiness) * 100}%"></div>
                </div>
                <span class="stat-value">${Math.round(stats.happiness)}/${Math.round(stats.maxHappiness)}</span>
            </div>
        `;
    }
}

function updateLocationInfo() {
    if (game.currentLocation) {
        // 🖤 Check if player is currently traveling between locations 💀
        const isTraveling = typeof TravelSystem !== 'undefined' &&
            TravelSystem.playerPosition &&
            TravelSystem.playerPosition.isTraveling &&
            TravelSystem.playerPosition.destination;

        let locationName = game.currentLocation.name;
        let locationDesc = game.currentLocation.description || '';

        if (isTraveling) {
            // 🖤 Show path info when traveling: "Traveling from X to Y" 💀
            const startName = game.currentLocation.name;
            const destName = TravelSystem.playerPosition.destination.name;
            const progress = Math.round((TravelSystem.playerPosition.travelProgress || 0) * 100);
            locationName = `🚶 Traveling...`;
            locationDesc = `From ${startName} → ${destName} (${progress}% complete)`;
        } else if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive && DoomWorldSystem.getCurrentLocationName) {
            // 🖤 Use doom-aware location name if DoomWorldSystem is active 💀
            locationName = DoomWorldSystem.getCurrentLocationName(game.currentLocation.id);
        }

        document.getElementById('location-name').textContent = locationName;
        document.getElementById('location-description').textContent = locationDesc;
    }
}

// 🖤💀 LOCATION PANEL VIEW STACK - for expandable sections that take over the panel 💀
// 📍 Session #77: LocationPanelStack moved to src/js/ui/location-panel-stack.js
// It loads before game.js so window.LocationPanelStack is available

function updateLocationPanel() {
    // Always render current view
    LocationPanelStack.renderCurrentView();
}

function updateLocationPanelMain() {
    if (!game.currentLocation || !game.currentLocation.id) return;

    const location = GameWorld.locations[game.currentLocation.id];
    if (!location) return;

    const locationPanel = document.getElementById('location-panel');
    if (!locationPanel) return;

    // 🖤 Check if player is currently traveling between locations 💀
    const isTraveling = typeof TravelSystem !== 'undefined' &&
        TravelSystem.playerPosition &&
        TravelSystem.playerPosition.isTraveling &&
        TravelSystem.playerPosition.destination;

    // 🖤 Use doom-aware location name if DoomWorldSystem is active 💀
    let locationName = location.name;
    let locationDesc = location.description;

    if (isTraveling) {
        // 🖤 Show path info when traveling: "Traveling from X to Y" 💀
        const startName = location.name;
        const destName = TravelSystem.playerPosition.destination.name;
        const progress = Math.round((TravelSystem.playerPosition.travelProgress || 0) * 100);
        locationName = `🚶 Traveling...`;
        locationDesc = `From ${startName} → ${destName} (${progress}% complete)`;
    } else if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) {
        if (DoomWorldSystem.getCurrentLocationName) {
            locationName = DoomWorldSystem.getCurrentLocationName(game.currentLocation.id);
        }
        // 🦇 Doom descriptions could be different too
        locationDesc = `The doom has transformed this place. ${location.description}`;
    }

    // Update location name and description
    const h2 = locationPanel.querySelector('h2');
    if (h2) h2.textContent = locationName;

    // 🖤💀 If description element is missing, rebuild the entire content structure! 💀
    // This happens when exploration/gathering views wipe the content div
    let descElement = locationPanel.querySelector('#location-description');
    if (!descElement) {
        const content = locationPanel.querySelector('#location-panel-content');
        if (content) {
            content.innerHTML = `<p id="location-description">${locationDesc}</p>`;
            descElement = content.querySelector('#location-description');
        }
    } else {
        descElement.textContent = locationDesc;
    }
    
    // Add location details after description
    let detailsElement = locationPanel.querySelector('.location-details');
    if (!detailsElement) {
        detailsElement = document.createElement('div');
        detailsElement.className = 'location-details';
        descElement.parentNode.insertBefore(detailsElement, descElement.nextSibling);
    }
    
    const locationType = location.type ? location.type.charAt(0).toUpperCase() + location.type.slice(1) : 'Unknown';
    const population = location.population ? location.population.toLocaleString() : '???';
    const regionName = location.region && GameWorld.regions[location.region] ? GameWorld.regions[location.region].name : 'Unknown Region';
    const specialties = location.specialties && Array.isArray(location.specialties)
        ? location.specialties.map(s => ItemDatabase.getItem(s)?.name || s).join(', ')
        : 'None';

    detailsElement.innerHTML = `
        <p><strong>Type:</strong> ${locationType}</p>
        <p><strong>Population:</strong> ${population}</p>
        <p><strong>Region:</strong> ${regionName}</p>
        <p><strong>Specialties:</strong> ${specialties}</p>
    `;
    
    // Add rest/recovery options
    let restElement = locationPanel.querySelector('.location-rest-options');
    if (!restElement) {
        restElement = document.createElement('div');
        restElement.className = 'location-rest-options';
        detailsElement.parentNode.insertBefore(restElement, detailsElement.nextSibling);
    }
    
    // 🖤 Only show "Rest at Inn" when at an actual inn location! 💀
    const isInn = location.type === 'inn';
    restElement.innerHTML = `
        <h3>Rest & Recovery</h3>
        ${isInn ? `<button class="rest-btn" onclick="restAtInn()">Rest at Inn (10 gold)</button>` : ''}
        ${game.player && game.player.ownsHouse ? `<button class="rest-btn" onclick="restInHouse()">Rest in House (Free)</button>` : ''}
        ${!game.player || !game.player.ownsHouse ? `<button class="buy-house-btn" onclick="buyHouse()">Buy House (1000 gold)</button>` : ''}
    `;

    // 🖤💀 ADD NAVIGATION BUTTONS FOR STACK-BASED VIEWS 💀
    // These replace the old inline expandable sections with full-panel takeover navigation
    let actionsSection = locationPanel.querySelector('.location-stack-actions');
    if (!actionsSection) {
        actionsSection = document.createElement('div');
        actionsSection.className = 'location-stack-actions';
        actionsSection.style.cssText = 'margin-top: 12px; display: flex; flex-direction: column; gap: 6px;';
        // Insert after rest options or region unlocks
        const insertAfter = locationPanel.querySelector('.region-unlocks') || locationPanel.querySelector('.location-rest-options');
        if (insertAfter && insertAfter.parentNode) {
            insertAfter.parentNode.insertBefore(actionsSection, insertAfter.nextSibling);
        } else {
            locationPanel.querySelector('#location-panel-content')?.appendChild(actionsSection);
        }
    }

    // Build the navigation buttons
    let navButtonsHTML = '';

    // 🏚️ Exploration button (if location is explorable)
    if (typeof DungeonExplorationSystem !== 'undefined') {
        const exploreLocation = DungeonExplorationSystem.getLocation?.(game.currentLocation.id);
        const isExplorable = exploreLocation && DungeonExplorationSystem.isExplorableLocation?.(exploreLocation);
        const availableEvents = isExplorable ? (DungeonExplorationSystem.getAvailableEventsForLocation?.(exploreLocation) || []) : [];
        const onCooldown = DungeonExplorationSystem.isOnCooldown?.(game.currentLocation.id);

        if (isExplorable || availableEvents.length > 0) {
            const cooldownStyle = onCooldown ? 'opacity: 0.6;' : '';
            const cooldownIcon = onCooldown ? '⏰ ' : '';
            navButtonsHTML += `
                <button class="location-nav-btn explore-nav-btn"
                    onclick="LocationPanelStack.pushView('exploration')"
                    style="display: flex; align-items: center; justify-content: space-between;
                           padding: 12px 15px; background: linear-gradient(135deg, #1a3a4a 0%, #0d2030 100%);
                           border: 1px solid #4fc3f7; border-radius: 8px; color: #4fc3f7;
                           font-weight: bold; cursor: pointer; ${cooldownStyle}">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        ${cooldownIcon}🏚️ Explore Area
                    </span>
                    <span style="font-size: 0.85em; color: #888;">${availableEvents.length} encounters →</span>
                </button>
            `;
        }
    }

    // ⛏️ Gathering button (if location has resources)
    if (typeof ResourceGatheringSystem !== 'undefined') {
        const availableActions = ResourceGatheringSystem.getAvailableGatheringActions?.(location.type) || [];

        if (availableActions.length > 0) {
            navButtonsHTML += `
                <button class="location-nav-btn gather-nav-btn"
                    onclick="LocationPanelStack.pushView('gathering')"
                    style="display: flex; align-items: center; justify-content: space-between;
                           padding: 12px 15px; background: linear-gradient(135deg, #2e5a3a 0%, #1a3a2a 100%);
                           border: 1px solid #4caf50; border-radius: 8px; color: #4caf50;
                           font-weight: bold; cursor: pointer;">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        ⛏️ Gather Resources
                    </span>
                    <span style="font-size: 0.85em; color: #888;">${availableActions.length} resources →</span>
                </button>
            `;
        }
    }

    actionsSection.innerHTML = navButtonsHTML;

    // ⚔️ QUEST COMBAT SECTION - Show available combat encounters for active quests
    if (typeof QuestSystem !== 'undefined' && QuestSystem.getActiveQuestCombatForLocation) {
        const questCombats = QuestSystem.getActiveQuestCombatForLocation(game.currentLocation.id);

        if (questCombats.length > 0) {
            let questCombatSection = locationPanel.querySelector('.quest-combat-section');
            if (!questCombatSection) {
                questCombatSection = document.createElement('div');
                questCombatSection.className = 'quest-combat-section';
                questCombatSection.style.cssText = 'margin-top: 12px; padding: 10px; background: linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(60, 20, 20, 0.3) 100%); border: 1px solid #ff6b6b; border-radius: 8px;';
                actionsSection.parentNode.insertBefore(questCombatSection, actionsSection.nextSibling);
            }

            let combatHTML = `<h4 style="margin: 0 0 8px 0; color: #ff6b6b; font-size: 0.95rem;">⚔️ Quest Combat Available</h4>`;

            for (const combat of questCombats) {
                const difficultyColor = combat.difficulty === 'easy' ? '#4caf50' :
                                       combat.difficulty === 'hard' ? '#ff9800' :
                                       combat.difficulty === 'boss' || combat.isBoss ? '#f44336' : '#ffd700';
                const difficultyLabel = combat.isBoss ? 'BOSS' : combat.difficulty.toUpperCase();

                combatHTML += `
                    <div class="quest-combat-encounter" style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #ffd700; font-weight: bold;">${escapeHtml(combat.questName)}</span>
                            <span style="color: ${difficultyColor}; font-size: 0.75rem; padding: 2px 6px; background: rgba(0,0,0,0.5); border-radius: 4px;">${difficultyLabel}</span>
                        </div>
                        <p style="margin: 0 0 6px 0; color: #ccc; font-size: 0.85rem;">${escapeHtml(combat.description)}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #888; font-size: 0.8rem;">Remaining: ${combat.remaining}</span>
                            <button class="quest-combat-btn"
                                data-enemy-type="${escapeHtml(combat.enemyType)}"
                                data-enemy-name="${escapeHtml(combat.enemyName)}"
                                data-quest-id="${escapeHtml(combat.questId)}"
                                data-is-boss="${combat.isBoss}"
                                style="padding: 6px 12px; background: linear-gradient(135deg, #8b0000 0%, #5a0000 100%);
                                       border: 1px solid #ff6b6b; border-radius: 4px; color: #fff; cursor: pointer;
                                       font-weight: bold; font-size: 0.85rem;">
                                ⚔️ Fight!
                            </button>
                        </div>
                    </div>
                `;
            }

            questCombatSection.innerHTML = combatHTML;

            // Attach event listeners to combat buttons
            questCombatSection.querySelectorAll('.quest-combat-btn').forEach(btn => {
                btn.onclick = () => {
                    const enemyType = btn.dataset.enemyType;
                    const enemyName = btn.dataset.enemyName;
                    const questId = btn.dataset.questId;
                    const isBoss = btn.dataset.isBoss === 'true';

                    // Open combat modal with quest context
                    if (typeof CombatModal !== 'undefined' && CombatModal.open) {
                        CombatModal.open(enemyType, enemyName, {
                            isQuestTarget: true,
                            questId: questId,
                            isBoss: isBoss,
                            onVictory: () => {
                                // Record the kill for quest progress
                                if (typeof QuestSystem !== 'undefined' && QuestSystem.recordQuestKill) {
                                    QuestSystem.recordQuestKill(enemyType, game.currentLocation.id);
                                }
                                // Refresh the location panel to update remaining count
                                updateLocationPanel();
                            }
                        });
                    } else {
                        console.warn('CombatModal not available');
                        addMessage(`You engage the ${enemyName} in combat!`, 'combat');
                    }
                };
            });
        } else {
            // Remove quest combat section if no combats available
            const existingSection = locationPanel.querySelector('.quest-combat-section');
            if (existingSection) existingSection.remove();
        }
    }

    // 🖤💀 RESTORE LOCATION ACTION BUTTONS if they're missing! 💀
    // These are the Visit Market, Travel, People buttons
    // They get wiped when exploration/gathering views take over
    let actionsDiv = locationPanel.querySelector('#location-actions');
    if (!actionsDiv) {
        actionsDiv = document.createElement('div');
        actionsDiv.id = 'location-actions';
        // Insert at the end of location-panel-content
        const content = locationPanel.querySelector('#location-panel-content');
        if (content) {
            content.appendChild(actionsDiv);
        }
    }

    // Always rebuild the action buttons to ensure they're present
    actionsDiv.innerHTML = `
        <button id="visit-market-btn" title="Visit the local market">Visit Market</button>
        <button id="travel-btn" title="Toggle travel panel">Travel</button>
        <button id="people-btn" title="Toggle people panel">People</button>
    `;

    // 🖤💀 RE-ATTACH EVENT LISTENERS to the new buttons! 💀
    // The old buttons were cached in elements object, but we just created new ones
    // Need to re-cache them and re-attach their event listeners
    const newVisitMarketBtn = document.getElementById('visit-market-btn');
    const newTravelBtn = document.getElementById('travel-btn');
    const newPeopleBtn = document.getElementById('people-btn');

    if (newVisitMarketBtn && typeof EventManager !== 'undefined' && typeof openMarket === 'function') {
        EventManager.addEventListener(newVisitMarketBtn, 'click', openMarket);
        elements.visitMarketBtn = newVisitMarketBtn; // Update cache
    }
    if (newTravelBtn && typeof EventManager !== 'undefined' && typeof toggleTravel === 'function') {
        EventManager.addEventListener(newTravelBtn, 'click', toggleTravel);
        elements.travelBtn = newTravelBtn; // Update cache
    }
    if (newPeopleBtn && typeof EventManager !== 'undefined' && typeof togglePeople === 'function') {
        EventManager.addEventListener(newPeopleBtn, 'click', togglePeople);
        elements.peopleBtn = newPeopleBtn; // Update cache
    }

    // Update market button visibility based on location
    updateMarketButtonVisibility();

    // 🎵 Update music based on location type
    if (typeof MusicSystem !== 'undefined') {
        const locationType = location.type?.toLowerCase() || '';
        const dungeonTypes = ['dungeon', 'cave', 'mine', 'ruins', 'crypt', 'tomb', 'catacomb'];
        const isDoomWorld = game.player?.isDoomWorld === true;

        if (isDoomWorld) {
            MusicSystem.playDoomMusic();
        } else if (dungeonTypes.includes(locationType)) {
            MusicSystem.playDungeonMusic();
        } else {
            MusicSystem.playNormalMusic();
        }
    }
}

// Unlock region function
function unlockRegion(regionId) {
    const region = GameWorld.regions[regionId];
    if (!region) return;
    
    if (!GameWorld.canUnlockRegion(regionId)) {
        addMessage(`Cannot unlock ${region.name}! Requirements not met.`);
        return;
    }
    
    if (game.player.gold < region.goldRequirement) {
        addMessage(`You need ${region.goldRequirement} gold to unlock ${region.name}!`);
        return;
    }
    
    // Deduct gold and unlock region
    game.player.gold -= region.goldRequirement;
    GameWorld.unlockRegion(regionId);
    
    // Update UI
    updatePlayerInfo();
    updateLocationPanel();
    
    addMessage(`🎉 Unlocked ${region.name}! New destinations are now available.`);
}

// ═══════════════════════════════════════════════════════════════
// 🏪 MARKET VISIBILITY SYSTEM - only Royal Capital has a market 💀
// ═══════════════════════════════════════════════════════════════
// 🖤 The ONLY market in the realm is at Royal Capital (center hub)
// Everywhere else, players must trade directly with NPCs who have
// profession-based inventories (innkeepers sell food, blacksmiths sell weapons, etc.)

const MARKET_LOCATION_ID = 'royal_capital';

// 🏪 Check if current location has a market (only Royal Capital)
function locationHasMarket(locationId = null) {
    const currentLocationId = locationId || game?.currentLocation?.id;
    return currentLocationId === MARKET_LOCATION_ID;
}

// 🏪 Update market button visibility based on current location 💀
// Called when player arrives at a new location
function updateMarketButtonVisibility() {
    const hasMarket = locationHasMarket();

    // 🖤 Location Panel "Visit Market" button
    const visitMarketBtn = document.getElementById('visit-market-btn');
    if (visitMarketBtn) {
        visitMarketBtn.style.display = hasMarket ? '' : 'none';
    }

    // 🖤 Bottom Action Bar market button
    const bottomMarketBtn = document.getElementById('bottom-market-btn');
    if (bottomMarketBtn) {
        bottomMarketBtn.style.display = hasMarket ? '' : 'none';
    }

    // 🖤 Update PanelManager toolbar button visibility
    if (typeof PanelManager !== 'undefined') {
        PanelManager.updateMarketButtonVisibility?.(hasMarket);
    }

    // 🖤 Close market panel if open and we left the capital
    if (!hasMarket && game.state === GameState.MARKET) {
        closeMarket();
        addMessage('🏪 You left the Royal Capital - the grand market is behind you now.');
    }

    // Debug log removed - was spamming during travel updates
}

// 🏪 Hook into location changes to update market visibility 💀
function setupMarketVisibilityListener() {
    document.addEventListener('player-location-changed', (e) => {
        updateMarketButtonVisibility();
    });

    // 🦇 Also listen for the older event name some systems use
    document.addEventListener('location-changed', (e) => {
        updateMarketButtonVisibility();
    });

    console.log('🏪 Market visibility listener initialized - only Royal Capital has a grand market');
}

// Expose globally for other systems
window.locationHasMarket = locationHasMarket;
window.updateMarketButtonVisibility = updateMarketButtonVisibility;

// ═══════════════════════════════════════════════════════════════
// 🏪 MARKET FUNCTIONS - capitalism: the game
// ═══════════════════════════════════════════════════════════════
function openMarket() {
    // 🖤 Check if current location has a market first 💀
    if (!locationHasMarket()) {
        addMessage('🏪 There is no grand market here. Trade directly with local NPCs instead!');
        return;
    }
    changeState(GameState.MARKET);
    populateMarketItems();
    updateMarketHeader();
    updateMarketEvents();
    populateItemFilter();
    populateComparisonSelect();
    updateMarketNews();
    updateMerchantInfo(); // Display merchant personality and info

    // 🎙️ Play merchant greeting with TTS when market opens
    playMerchantGreeting();
}

// 🎙️ Play merchant greeting with TTS
async function playMerchantGreeting() {
    try {
        if (typeof NPCMerchantSystem === 'undefined') return;
        if (typeof NPCVoiceChatSystem === 'undefined') return;

        const merchant = NPCMerchantSystem.getCurrentMerchant();
        if (!merchant) return;

        // Get a greeting from the merchant's personality
        const greeting = NPCMerchantSystem.getGreeting(merchant.id);
        const wealthDialogue = NPCMerchantSystem.getWealthDialogue(merchant);
        const fullGreeting = wealthDialogue ? `${greeting} ${wealthDialogue}` : greeting;

        // Get voice for this merchant type
        let voice = 'nova'; // default voice
        if (typeof NPCPersonaDatabase !== 'undefined') {
            const persona = NPCPersonaDatabase.getPersonaForMerchant(merchant);
            if (persona?.voice) {
                voice = persona.voice;
            }
        }

        // Play the greeting with TTS
        if (NPCVoiceChatSystem.settings?.voiceEnabled) {
            console.log(`🎙️ Playing merchant greeting: "${fullGreeting}" with voice: ${voice}`);
            await NPCVoiceChatSystem.playVoice(fullGreeting, voice);
        }
    } catch (err) {
        // 🖤 TTS errors shouldn't crash the game - just log and continue 💀
        console.warn('⚠️ Merchant greeting TTS failed:', err?.message || err);
    }
}

// Update merchant info display
function updateMerchantInfo() {
    if (typeof NPCMerchantSystem === 'undefined') return;

    const merchant = NPCMerchantSystem.getCurrentMerchant();
    if (!merchant) return;

    // Update greeting - now includes wealth-based dialogue
    const greetingElement = document.getElementById('merchant-greeting-text');
    if (greetingElement) {
        const greeting = NPCMerchantSystem.getGreeting(merchant.id);
        const wealthDialogue = NPCMerchantSystem.getWealthDialogue(merchant);
        greetingElement.textContent = `"${greeting}" ${wealthDialogue ? `"${wealthDialogue}"` : ''}`;
    }

    // Update merchant details
    const merchantInfo = NPCMerchantSystem.getMerchantInfo(merchant);

    const nameElement = document.getElementById('merchant-name');
    if (nameElement) nameElement.textContent = merchantInfo.name;

    const personalityElement = document.getElementById('merchant-personality');
    if (personalityElement) personalityElement.textContent = merchantInfo.personality;

    const relationshipElement = document.getElementById('merchant-relationship');
    if (relationshipElement) relationshipElement.textContent = merchantInfo.relationship;

    const specialtiesElement = document.getElementById('merchant-specialties');
    if (specialtiesElement) specialtiesElement.textContent = merchantInfo.specialties || 'None';

    // 💰 Update merchant finances display
    const finances = NPCMerchantSystem.getMerchantFinances(merchant.id);
    if (finances) {
        const goldElement = document.getElementById('merchant-gold');
        if (goldElement) {
            goldElement.textContent = `${finances.currentGold} gold`;
            goldElement.className = `merchant-gold ${finances.wealthStatus}`;
        }

        const wealthStatusElement = document.getElementById('merchant-wealth-status');
        if (wealthStatusElement) {
            const statusIcons = {
                'flush': '💰',
                'comfortable': '💵',
                'tight': '💸',
                'broke': '😰'
            };
            wealthStatusElement.textContent = `${statusIcons[finances.wealthStatus] || '💵'} ${finances.wealthStatus}`;
            wealthStatusElement.className = `merchant-wealth-status ${finances.wealthStatus}`;
        }

        // Show gold bar if element exists
        const goldBarElement = document.getElementById('merchant-gold-bar');
        if (goldBarElement) {
            goldBarElement.style.width = `${finances.goldPercent}%`;
            goldBarElement.className = `merchant-gold-bar ${finances.wealthStatus}`;
        }
    }
}

function closeMarket() {
    game.hideOverlay('market-panel');
    // Auto-close trade cart when market closes
    if (typeof TradeCartPanel !== 'undefined' && TradeCartPanel.isOpen) {
        TradeCartPanel.close();
    }
    changeState(GameState.PLAYING);
}

function updateMarketHeader() {
    const location = GameWorld.locations[game.currentLocation.id];
    if (!location) return;
    
    // Update market location
    const marketLocation = document.getElementById('market-location');
    if (marketLocation) {
        marketLocation.textContent = `${location.name} Market`;
    }
    
    // Update reputation display
    const reputationDisplay = document.getElementById('market-reputation');
    if (reputationDisplay && location.reputation) {
        const reputation = location.reputation.player;
        let reputationText = 'Neutral';
        let reputationClass = 'neutral';
        
        if (reputation >= 75) {
            reputationText = 'Elite';
            reputationClass = 'elite';
        } else if (reputation >= 50) {
            reputationText = 'Trusted';
            reputationClass = 'trusted';
        } else if (reputation >= 25) {
            reputationText = 'Friendly';
            reputationClass = 'friendly';
        } else if (reputation >= 0) {
            reputationText = 'Neutral';
            reputationClass = 'neutral';
        } else if (reputation >= -25) {
            reputationText = 'Suspicious';
            reputationClass = 'suspicious';
        } else if (reputation >= -50) {
            reputationText = 'Untrusted';
            reputationClass = 'untrusted';
        } else {
            reputationText = 'Hostile';
            reputationClass = 'hostile';
        }
        
        reputationDisplay.textContent = `Reputation: ${reputationText} (${reputation})`;
        reputationDisplay.className = `reputation-display ${reputationClass}`;
    }
}

function updateMarketEvents() {
    const marketEvents = document.getElementById('market-events');
    if (!marketEvents) return;
    
    const location = GameWorld.locations[game.currentLocation.id];
    if (!location || !location.reputation) return;
    
    const events = (typeof CityEventSystem !== 'undefined') ? CityEventSystem.getCityEvents(location.id) : [];
    
    if (events.length === 0) {
        marketEvents.innerHTML = '<span>No active events</span>';
        return;
    }
    
    // 🖤 Escape event names - market manipulation doesn't include XSS today
    marketEvents.innerHTML = events.map(event =>
        `<div class="market-event">${escapeHtml(event.name || '')}</div>`
    ).join('');
}

function populateItemFilter() {
    const itemFilter = document.getElementById('item-filter');
    if (!itemFilter) return;
    
    // Filter options are already in HTML, just need to add event listener
    itemFilter.addEventListener('change', updateMarketDisplay);
}

function populateComparisonSelect() {
    const compareSelect = document.getElementById('compare-item-select');
    if (!compareSelect) return;
    
    // Get all items that exist in any market
    const allItems = new Set();
    Object.values(GameWorld.locations).forEach(location => {
        if (location.marketPrices) {
            Object.keys(location.marketPrices).forEach(itemId => {
                allItems.add(itemId);
            });
        }
    });
    
    // Clear existing options except first one
    while (compareSelect.children.length > 1) {
        compareSelect.removeChild(compareSelect.lastChild);
    }
    
    // Add item options
    Array.from(allItems).sort().forEach(itemId => {
        const item = ItemDatabase.getItem(itemId);
        if (item) {
            const option = document.createElement('option');
            option.value = itemId;
            option.textContent = item.name;
            compareSelect.appendChild(option);
        }
    });
}

function updateMarketNews() {
    const marketNews = document.getElementById('market-news');
    if (!marketNews) return;
    
    const news = DynamicMarketSystem.generateMarketNews();
    
    if (news.length === 0) {
        marketNews.innerHTML = '<div class="news-item"><div class="news-content">No market news available.</div></div>';
        return;
    }
    
    marketNews.innerHTML = news.map(newsItem => {
        let newsClass = 'news-item';
        if (newsItem.includes('📈')) newsClass += ' price-rise';
        else if (newsItem.includes('📉')) newsClass += ' price-fall';
        else if (newsItem.includes('📢')) newsClass += ' event';
        
        // 🖤 Escape news content - fake news is bad enough without XSS
        return `
            <div class="${newsClass}">
                <div class="news-time">${escapeHtml(TimeMachine.getFormattedTime() || '')}</div>
                <div class="news-content">${escapeHtml(newsItem || '')}</div>
            </div>
        `;
    }).join('');
}

function populateMarketItems() {
    updateMarketDisplay();

    const sellItemsContainer = document.getElementById('sell-items');
    if (!sellItemsContainer) return;

    sellItemsContainer.innerHTML = '';

    const currentLocation = GameWorld.locations[game.currentLocation.id];
    let hasItems = false;

    // REGULAR INVENTORY ITEMS - use PlayerStateManager
    const inventory = (typeof PlayerStateManager !== 'undefined')
        ? PlayerStateManager.inventory.get()
        : (game.player?.inventory || {});

    if (inventory && Object.keys(inventory).length > 0) {
        for (const [itemId, quantity] of Object.entries(inventory)) {
            if (quantity <= 0) continue;

            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;

            hasItems = true;
            const reputationModifier = CityReputationSystem.getPriceModifier(currentLocation.id);

            // Use regional economy sell price if available
            let sellPrice;

            if (typeof GameWorld !== 'undefined' && GameWorld.calculateSellPrice) {
                // Get item's origin region for regional trade bonus
                const originRegion = GameWorld.getItemOriginRegion(itemId);
                sellPrice = GameWorld.calculateSellPrice(currentLocation.id, itemId, originRegion);
                sellPrice = Math.round(sellPrice * reputationModifier);
            } else {
                // Fallback to old system
                const baseSellPrice = Math.round(ItemDatabase.calculatePrice(itemId) * 0.7);
                sellPrice = Math.round(baseSellPrice * reputationModifier);
            }

            const itemElement = document.createElement('div');
            itemElement.className = `market-item ${item.rarity} ${TradingSystem.selectedTradeItems.has(itemId) ? 'selected' : ''}`;
            itemElement.dataset.itemId = itemId;

            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">x${quantity}</div>
                <div class="item-price">${sellPrice} gold</div>
                <div class="item-weight">${ItemDatabase.calculateWeight(itemId, quantity).toFixed(1)} lbs</div>
            `;

            itemElement.dataset.price = sellPrice;
            itemElement.dataset.stock = quantity;
            itemElement.dataset.itemName = item.name;
            itemElement.dataset.itemIcon = item.icon;
            itemElement.dataset.itemWeight = item.weight;

            itemElement.style.cursor = 'pointer';
            itemElement.title = 'Click to sell (Shift: x5, Ctrl: x25)';
            itemElement.onclick = (e) => {
                if (TradingSystem.tradeMode === 'bulk' && (e.shiftKey || e.ctrlKey || e.altKey)) return;

                if (typeof TradeCartPanel !== 'undefined') {
                    const price = parseInt(itemElement.dataset.price, 10) || 0;
                    const stock = parseInt(itemElement.dataset.stock, 10) || 1;
                    const itemName = itemElement.dataset.itemName || itemId;
                    const itemIcon = itemElement.dataset.itemIcon || '';
                    const itemWeight = parseFloat(itemElement.dataset.itemWeight) || 1;

                    let bulkQty = 1;
                    if (e.ctrlKey || e.metaKey) bulkQty = 25;
                    else if (e.shiftKey) bulkQty = 5;

                    const merchantData = {
                        name: currentLocation.name + ' Market',
                        id: currentLocation.id,
                        type: 'market',
                        inventory: currentLocation.marketPrices
                    };

                    if (!TradeCartPanel.isOpen) {
                        TradeCartPanel.open(merchantData, 'sell');
                    }
                    TradeCartPanel.addItem(itemId, price, stock, {
                        name: itemName,
                        icon: itemIcon,
                        weight: itemWeight,
                        quantity: bulkQty
                    });

                    itemElement.classList.add('added-to-cart');
                    setTimeout(() => itemElement.classList.remove('added-to-cart'), 300);
                } else {
                    sellItem(itemId);
                }
            };

            if (TradingSystem.tradeMode === 'bulk') {
                EventManager.addEventListener(itemElement, 'click', (e) => {
                    if (e.shiftKey || e.ctrlKey || e.altKey) return;
                    if (TradingSystem.selectedTradeItems.has(itemId)) {
                        TradingSystem.selectedTradeItems.delete(itemId);
                        itemElement.classList.remove('selected');
                    } else {
                        TradingSystem.selectedTradeItems.set(itemId, 1);
                        itemElement.classList.add('selected');
                    }
                    TradingSystem.updateTradeSummary();
                });
            }

            sellItemsContainer.appendChild(itemElement);
        }
    }

    // OWNED TRANSPORT - show for selling
    const ownedTransport = game.player.ownedTransport || [];
    const sellableTransport = ownedTransport.filter(id => {
        const t = ItemDatabase.getItem(id);
        return t && t.isTransport && t.basePrice > 0 && id !== 'satchel';
    });

    if (sellableTransport.length > 0) {
        // Add transport header
        const transportHeader = document.createElement('div');
        transportHeader.className = 'sell-section-header';
        transportHeader.innerHTML = '<h5>Your Transport</h5>';
        sellItemsContainer.appendChild(transportHeader);

        // Count animals and vehicles for sell validation
        const ownedAnimals = ownedTransport.filter(id => {
            const t = ItemDatabase.getItem(id);
            return t && t.transportType === 'animal';
        }).length;
        const ownedVehicles = ownedTransport.filter(id => {
            const t = ItemDatabase.getItem(id);
            return t && t.transportType === 'vehicle';
        }).length;

        sellableTransport.forEach(transportId => {
            hasItems = true;
            const transport = ItemDatabase.getItem(transportId);
            if (!transport) return;

            // Calculate sell price (50-60% of base)
            const sellPrice = Math.round(transport.basePrice * 0.55);

            // Check if selling would strand a vehicle
            let canSell = true;
            let sellBlockReason = '';
            if (transport.transportType === 'animal' && ownedAnimals <= ownedVehicles) {
                canSell = false;
                sellBlockReason = 'Would strand vehicle';
            }

            // Check if selling would reduce capacity below current load
            if (canSell) {
                const newCapacity = TransportSystem.calculateTotalCapacity({
                    ...game.player,
                    ownedTransport: ownedTransport.filter(id => id !== transportId)
                });
                if (game.player.currentLoad > newCapacity) {
                    canSell = false;
                    sellBlockReason = 'Overloaded';
                }
            }

            const itemElement = document.createElement('div');
            itemElement.className = `market-item transport-item sellable ${transport.rarity} ${canSell ? '' : 'blocked'}`;
            itemElement.dataset.itemId = transportId;
            itemElement.dataset.isTransport = 'true';

            const speedPercent = Math.round((transport.speedModifier - 1) * 100);
            const speedDisplay = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;

            itemElement.innerHTML = `
                <div class="item-icon">${transport.icon}</div>
                <div class="item-name">${transport.name}</div>
                <div class="transport-type">${transport.transportType.toUpperCase()}</div>
                <div class="item-price sell-price">+${sellPrice}g</div>
                <div class="transport-stats">
                    <span class="capacity">-${transport.carryCapacity} lbs</span>
                    <span class="speed">${speedDisplay} speed</span>
                </div>
                ${!canSell ? `<div class="transport-blocked">${sellBlockReason}</div>` : ''}
            `;

            itemElement.style.cursor = canSell ? 'pointer' : 'not-allowed';
            itemElement.title = canSell ? 'Click to sell' : sellBlockReason;

            if (canSell) {
                itemElement.onclick = () => {
                    // Sell transport
                    game.player.gold += sellPrice;
                    game.player.ownedTransport = game.player.ownedTransport.filter(id => id !== transportId);

                    // Update legacy array
                    if (game.player.ownedTransportation) {
                        game.player.ownedTransportation = game.player.ownedTransportation.filter(id => id !== transportId);
                    }

                    // Recalculate capacity
                    if (typeof TransportSystem !== 'undefined') {
                        game.player.carryCapacity = TransportSystem.calculateTotalCapacity(game.player);
                    }

                    addMessage(`You sold your ${transport.name} for ${sellPrice} gold! ${transport.icon}`);
                    updatePlayerInfo();
                    populateMarketItems();  // Refresh sell list
                };
            }

            sellItemsContainer.appendChild(itemElement);
        });
    }

    if (!hasItems) {
        sellItemsContainer.innerHTML = '<p>You have no items to sell.</p>';
    }
}

// ═══════════════════════════════════════════════════════════════
// 🗺️ TRAVEL FUNCTIONS - wandering through medieval misery
// ═══════════════════════════════════════════════════════════════
function openTravel() {
    changeState(GameState.TRAVEL);

    // Use new travel system if available
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.showTravelPanel();
    } else {
        // Fallback to old system
        populateDestinations();
    }
}

function closeTravel() {
    game.hideOverlay('travel-panel');
    changeState(GameState.PLAYING);

    // Hide travel system if available
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.hideTravelPanel();
    }
}

// 🖤 TOGGLE TRAVEL - open if closed, close if open 💀
function toggleTravel() {
    const travelPanel = document.getElementById('travel-panel');
    const isVisible = travelPanel && (
        travelPanel.classList.contains('active') ||
        travelPanel.classList.contains('show') ||
        travelPanel.style.display === 'block' ||
        travelPanel.style.display === 'flex'
    );

    if (isVisible) {
        closeTravel();
    } else {
        openTravel();
    }
}

// 🖤 TOGGLE PEOPLE - open if closed, close if open 💀
function togglePeople() {
    if (typeof PeoplePanel !== 'undefined' && PeoplePanel.toggle) {
        PeoplePanel.toggle();
    } else {
        console.warn('🖤 PeoplePanel not found');
    }
}

function populateDestinations() {
    const destinationsContainer = document.getElementById('destinations');
    destinationsContainer.innerHTML = '';

    // Get filter and sort values
    const filterValue = document.getElementById('destination-filter')?.value || 'all';
    const sortValue = document.getElementById('destination-sort')?.value || 'distance';

    // Get current location and all locations
    const currentLocId = game.currentLocation?.id;
    const currentLoc = typeof GameWorld !== 'undefined' ? GameWorld.locations?.[currentLocId] : null;
    const allLocations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};

    // Get visited locations using world-aware helper (supports doom world separation)
    const visitedLocations = (typeof GameWorld !== 'undefined' && typeof GameWorld.getActiveVisitedLocations === 'function')
        ? GameWorld.getActiveVisitedLocations()
        : (GameWorld?.visitedLocations || []);

    // Calculate visibility for all locations
    const visibility = calculateDestinationVisibility();

    // Build destinations array with visibility info
    let destinations = [];

    Object.entries(allLocations).forEach(([locId, location]) => {
        if (locId === currentLocId) return; // skip current location

        const vis = visibility[locId] || 'hidden';
        if (vis === 'hidden') return; // dont show hidden locations

        const isConnected = currentLoc?.connections?.includes(locId) || false;
        const isVisited = visitedLocations.includes(locId);

        // Apply filter
        if (filterValue === 'connected' && !isConnected) return;
        if (filterValue === 'visited' && !isVisited) return;
        if (filterValue !== 'all' && filterValue !== 'connected' && filterValue !== 'visited' && location.type !== filterValue) return;

        // Calculate distance and travel time
        let distance = 0;
        let travelTime = 0;
        if (currentLoc?.mapPosition && location?.mapPosition) {
            const dx = location.mapPosition.x - currentLoc.mapPosition.x;
            const dy = location.mapPosition.y - currentLoc.mapPosition.y;
            distance = Math.sqrt(dx * dx + dy * dy);
            travelTime = Math.ceil(distance / 10); // rough estimate in game minutes
        }

        destinations.push({
            ...location,
            visibility: vis,
            isConnected,
            isVisited,
            distance,
            travelTime,
            travelCost: Math.ceil(distance / 5) // rough gold cost
        });
    });

    // Sort destinations
    destinations.sort((a, b) => {
        switch (sortValue) {
            case 'distance': return a.distance - b.distance;
            case 'name': return a.name.localeCompare(b.name);
            case 'type': return a.type.localeCompare(b.type);
            default: return a.distance - b.distance;
        }
    });

    // Show message if no destinations
    if (destinations.length === 0) {
        destinationsContainer.innerHTML = `
            <div class="no-destinations" style="text-align: center; padding: 20px; color: #888;">
                <p>🚫 no destinations match your filter, wanderer.</p>
                <p style="font-size: 0.85em; font-style: italic;">try adjusting the filter or explore more of the world first.</p>
            </div>
        `;
        return;
    }

    // Get location type icons
    const typeIcons = {
        capital: '👑', city: '🏰', town: '🏘️', village: '🏠',
        mine: '⛏️', forest: '🌲', farm: '🌾', dungeon: '💀',
        cave: '🕳️', ruins: '🏛️', port: '⚓', inn: '🍺'
    };

    // 🖤 Inject destination card styles if not present 💀
    if (!document.getElementById('destination-card-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'destination-card-styles';
        styleEl.textContent = `
            .destination-card {
                display: grid;
                grid-template-columns: auto 1fr auto;
                grid-template-rows: auto auto;
                gap: 4px 12px;
                align-items: center;
                background: rgba(40, 40, 60, 0.6);
                border: 1px solid #4fc3f7;
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .destination-card:hover { background: rgba(79, 195, 247, 0.15); border-color: #81d4fa; }
            .destination-card.discovered { background: rgba(60, 60, 60, 0.4); border-color: #666; }
            .destination-card.visited { border-left: 3px solid #4caf50; }
            .destination-card.no-route { opacity: 0.5; cursor: not-allowed; border-color: #444; }
            .destination-card.no-route:hover { background: rgba(60, 60, 60, 0.4); border-color: #444; }
            .dest-card-icon { grid-row: span 2; font-size: 28px; }
            .dest-card-name { font-weight: bold; font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .dest-card-stats { display: flex; gap: 10px; font-size: 11px; color: #aaa; }
            .dest-card-stat { display: flex; align-items: center; gap: 3px; }
            .dest-card-badge { grid-row: span 2; font-size: 10px; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.3); color: #888; text-transform: uppercase; }
            .destination-card.can-travel .dest-card-badge { background: rgba(79, 195, 247, 0.2); color: #4fc3f7; }
            .destination-card.visited .dest-card-badge { background: rgba(76, 175, 80, 0.2); color: #81c784; }
            .dest-card-warning { grid-column: 2; font-size: 10px; color: #ff9800; margin-top: 2px; }
            .dest-card-visited-badge { font-size: 9px; color: #4caf50; margin-left: 5px; }
            .discovered .dest-card-name { color: #888; }
        `;
        document.head.appendChild(styleEl);
    }

    // Render each destination
    destinations.forEach(destination => {
        const icon = typeIcons[destination.type] || '📍';
        const isDiscovered = destination.visibility === 'discovered';
        const canTravel = destination.isConnected;
        const isVisited = destination.isVisited;

        const destElement = document.createElement('div');
        destElement.className = `destination-card ${isDiscovered ? 'discovered' : ''} ${canTravel ? 'can-travel' : 'no-route'} ${isVisited ? 'visited' : ''}`;

        // 🖤 Clean card layout: icon | name+stats | badge 💀
        if (isDiscovered) {
            destElement.innerHTML = `
                <div class="dest-card-icon">❓</div>
                <div class="dest-card-name">Unknown ${destination.type.charAt(0).toUpperCase() + destination.type.slice(1)}</div>
                <div class="dest-card-badge">${canTravel ? '⚠️ Unexplored' : '🚫 No Route'}</div>
                <div class="dest-card-stats">
                    <span class="dest-card-stat">📏 ~${Math.round(destination.distance)} mi</span>
                    <span class="dest-card-stat">⏱️ ~${destination.travelTime}m</span>
                </div>
            `;
        } else {
            destElement.innerHTML = `
                <div class="dest-card-icon">${icon}</div>
                <div class="dest-card-name">${destination.name}${isVisited ? '<span class="dest-card-visited-badge">VISITED</span>' : ''}</div>
                <div class="dest-card-badge">${destination.region || destination.type}</div>
                <div class="dest-card-stats">
                    <span class="dest-card-stat">📏 ${Math.round(destination.distance)} mi</span>
                    <span class="dest-card-stat">⏱️ ~${destination.travelTime}m</span>
                    ${destination.population ? `<span class="dest-card-stat">👥 ${destination.population.toLocaleString()}</span>` : ''}
                </div>
                ${!canTravel ? '<div class="dest-card-warning">🚫 No direct route - explore connected locations</div>' : ''}
            `;
        }

        // Click handler - set destination instead of immediately traveling
        if (canTravel) {
            EventManager.addEventListener(destElement, 'click', () => {
                // Set destination in both systems
                if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.setDestination) {
                    GameWorldRenderer.setDestination(destination.id);
                }
                if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.setDestination) {
                    TravelPanelMap.setDestination(destination.id);
                }

                // Switch to destination tab to show details
                const destTab = document.getElementById('destination-tab');
                const destTabBtn = document.querySelector('[data-travel-tab="destination"]');
                if (destTab && destTabBtn) {
                    document.querySelectorAll('.travel-tab-content').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.travel-tab-btn').forEach(b => b.classList.remove('active'));
                    destTab.classList.add('active');
                    destTabBtn.classList.add('active');
                }

                const destName = isDiscovered ? 'mysterious unknown location' : destination.name;
                addMessage(`🎯 destination locked: ${destName}. hit play or click travel to begin your pilgrimage.`);
            });
        }

        destinationsContainer.appendChild(destElement);
    });
}

// Calculate visibility for destinations - what can you see from here?
function calculateDestinationVisibility() {
    const visibility = {};
    const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};

    // Get visited locations using world-aware helper (supports doom world separation)
    let visited = [];
    if (typeof GameWorld !== 'undefined') {
        if (typeof GameWorld.getActiveVisitedLocations === 'function') {
            visited = GameWorld.getActiveVisitedLocations();
        } else if (Array.isArray(GameWorld.visitedLocations)) {
            visited = GameWorld.visitedLocations;
        }
    }
    // Always include current location
    if (game.currentLocation?.id && !visited.includes(game.currentLocation.id)) {
        visited = [...visited, game.currentLocation.id];
    }

    // If no visited locations somehow, show all as visible (first time playing)
    if (visited.length === 0) {
        Object.keys(locations).forEach(locId => {
            visibility[locId] = 'visible';
        });
        return visibility;
    }

    // Mark visited as visible
    visited.forEach(locId => {
        visibility[locId] = 'visible';
    });

    // Mark connected-to-visited as discovered (fog of war adjacent)
    visited.forEach(locId => {
        const location = locations[locId];
        if (location?.connections) {
            location.connections.forEach(connectedId => {
                if (!visibility[connectedId]) {
                    visibility[connectedId] = 'discovered';
                }
            });
        }
    });

    // All others remain hidden (not in visibility object = hidden)
    return visibility;
}

// ═══════════════════════════════════════════════════════════════
// 🎒 INVENTORY FUNCTIONS - hoarding like the dragon you are
// ═══════════════════════════════════════════════════════════════
function openInventory() {
    console.log('🖤 openInventory called');
    changeState(GameState.INVENTORY);
    populateInventory();
    console.log('🖤 openInventory complete');
}

function closeInventory() {
    game.hideOverlay('inventory-panel');
    changeState(GameState.PLAYING);
}

function populateInventory() {
    updateInventoryDisplay();
}

// TRANSPORTATION MARKETPLACE FUNCTIONS
// Buy/sell animals and vehicles at specific locations

function openTransportation() {
    changeState(GameState.TRANSPORTATION);
    updateTransportationInfo();
    populateTransportationOptions();
}

function closeTransportation() {
    game.hideOverlay('transportation-panel');
    changeState(GameState.PLAYING);
}

function updateTransportationInfo() {
    if (!game.player) return;

    // Get transport summary using new system
    const summary = TransportSystem.getTransportSummary(game.player);

    // Update capacity display
    const capacityEl = document.getElementById('carry-capacity');
    if (capacityEl) {
        capacityEl.textContent = `${summary.capacity} lbs`;
    }

    // Update current load
    const loadEl = document.getElementById('current-load');
    if (loadEl) {
        loadEl.textContent = `${game.player.currentLoad} lbs`;
    }

    // Update current transport display
    const transportEl = document.getElementById('current-transport');
    if (transportEl) {
        const owned = game.player.ownedTransport || ['satchel'];
        const animals = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.ANIMAL);
        const vehicles = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.VEHICLE);
        const carriers = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.CARRIER);

        let displayParts = [];
        if (animals.length > 0) {
            displayParts.push(`${animals.length} Animal${animals.length > 1 ? 's' : ''}`);
        }
        if (vehicles.length > 0) {
            displayParts.push(`${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''}`);
        }
        if (carriers.length > 0 && carriers.some(c => c !== 'satchel')) {
            displayParts.push('Hand Cart');
        }
        if (displayParts.length === 0) {
            displayParts.push('Satchel only');
        }

        transportEl.textContent = displayParts.join(' + ');
    }

    // Update speed display if exists
    const speedEl = document.getElementById('travel-speed');
    if (speedEl) {
        speedEl.textContent = `${Math.round(summary.speed * 100)}%`;
    }
}

function populateTransportationOptions() {
    const container = document.getElementById('transportation-options');
    if (!container) return;

    container.innerHTML = '';

    // Get transport summary
    const summary = TransportSystem.getTransportSummary(game.player);
    const owned = game.player.ownedTransport || ['satchel'];

    // Summary header with nice stats
    const headerEl = document.createElement('div');
    headerEl.className = 'transport-summary-header';
    headerEl.innerHTML = `
        <div class="transport-summary-stats">
            <div class="transport-stat-item">
                <span class="stat-icon">📦</span>
                <span class="stat-value">${summary.capacity} lbs</span>
                <span class="stat-label">Capacity</span>
            </div>
            <div class="transport-stat-item">
                <span class="stat-icon">⚡</span>
                <span class="stat-value">${Math.round(summary.speed * 100)}%</span>
                <span class="stat-label">Speed</span>
            </div>
            <div class="transport-stat-item">
                <span class="stat-icon">🐴</span>
                <span class="stat-value">${summary.animals}</span>
                <span class="stat-label">Animals</span>
            </div>
            <div class="transport-stat-item">
                <span class="stat-icon">🛞</span>
                <span class="stat-value">${summary.vehicles}</span>
                <span class="stat-label">Vehicles</span>
            </div>
        </div>
    `;
    container.appendChild(headerEl);

    // Owned transport cards - cleaner layout
    const ownedSection = document.createElement('div');
    ownedSection.className = 'transport-owned-section';

    if (owned.length === 0) {
        ownedSection.innerHTML = '<p class="no-transport">You have no transport. Visit a market to purchase animals or vehicles.</p>';
    } else {
        // Group by category for better organization
        const carriers = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.CARRIER);
        const animals = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.ANIMAL);
        const vehicles = owned.filter(id => transportationOptions[id]?.category === TRANSPORT_CATEGORY.VEHICLE);

        // Render each category
        if (carriers.length > 0) {
            ownedSection.appendChild(createTransportCategory('Carriers', carriers));
        }
        if (animals.length > 0) {
            ownedSection.appendChild(createTransportCategory('Animals', animals));
        }
        if (vehicles.length > 0) {
            ownedSection.appendChild(createTransportCategory('Vehicles', vehicles));
        }
    }

    container.appendChild(ownedSection);

    // Tip at bottom
    const tipEl = document.createElement('div');
    tipEl.className = 'transport-tip';
    tipEl.innerHTML = '<small>Visit merchants or stables to buy/sell transport.</small>';
    container.appendChild(tipEl);
}

// Helper to create transport category section
function createTransportCategory(title, transportIds) {
    const section = document.createElement('div');
    section.className = 'transport-category';
    section.innerHTML = `<h5 class="transport-category-title">${title}</h5>`;

    const grid = document.createElement('div');
    grid.className = 'transport-grid';

    transportIds.forEach(id => {
        const t = transportationOptions[id];
        if (!t) return;

        const card = document.createElement('div');
        card.className = 'transport-card';
        card.innerHTML = `
            <div class="transport-card-icon">${t.icon}</div>
            <div class="transport-card-info">
                <div class="transport-card-name">${escapeHtml(t.name)}</div>
                <div class="transport-card-stats">
                    <span>+${t.carryCapacity} lbs</span>
                    <span>${t.speedModifier >= 1 ? '+' : ''}${Math.round((t.speedModifier - 1) * 100)}% spd</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
}

function purchaseTransport(transportId) {
    const transport = transportationOptions[transportId];
    if (!transport) {
        addMessage('Invalid transport option.');
        return;
    }

    const locationType = game.currentLocation?.type || 'town';
    const price = TransportSystem.getPrice(transportId, locationType);

    // Check gold
    if (game.player.gold < price) {
        addMessage(`You need ${price} gold to buy a ${transport.name}. You only have ${game.player.gold}.`);
        return;
    }

    // Check vehicle restriction
    if (transport.requiresAnimal && !TransportSystem.canBuyVehicle(game.player)) {
        addMessage(`You need an animal to pull a ${transport.name}! Buy a horse, mule, or oxen first.`);
        return;
    }

    // Initialize ownedTransport if needed
    if (!game.player.ownedTransport) {
        game.player.ownedTransport = ['satchel'];
    }

    // Purchase!
    game.player.gold -= price;
    game.player.ownedTransport.push(transportId);

    // Update legacy array for backwards compat
    if (!game.player.ownedTransportation.includes(transportId)) {
        game.player.ownedTransportation.push(transportId);
    }

    addMessage(`You bought a ${transport.name} for ${price} gold! ${transport.icon}`);

    // Recalculate capacity
    updateCarryCapacity();
    updatePlayerInfo();
    populateTransportationOptions();
}

function sellTransport(transportId) {
    const transport = transportationOptions[transportId];
    if (!transport) {
        addMessage('Invalid transport option.');
        return;
    }

    // Check ownership
    if (!game.player.ownedTransport || !game.player.ownedTransport.includes(transportId)) {
        addMessage(`You don't own a ${transport.name}.`);
        return;
    }

    // Check if can sell (animals can't be sold if they'd strand vehicles)
    if (transport.category === TRANSPORT_CATEGORY.ANIMAL && !TransportSystem.canSellAnimal(game.player)) {
        addMessage(`You can't sell your ${transport.name} - it's pulling a cart or wagon!`);
        return;
    }

    // Check can't sell satchel
    if (transport.canSell === false) {
        addMessage(`You can't sell your ${transport.name}.`);
        return;
    }

    const sellPrice = transport.sellPrice;

    // Check if selling would reduce capacity below current load
    const newCapacity = TransportSystem.calculateTotalCapacity({
        ...game.player,
        ownedTransport: game.player.ownedTransport.filter(id => id !== transportId)
    });

    if (game.player.currentLoad > newCapacity) {
        addMessage(`Can't sell - you're carrying ${game.player.currentLoad} lbs but would only have ${newCapacity} lbs capacity!`);
        return;
    }

    // Sell!
    game.player.gold += sellPrice;
    game.player.ownedTransport = game.player.ownedTransport.filter(id => id !== transportId);

    // Update legacy array
    game.player.ownedTransportation = game.player.ownedTransportation.filter(id => id !== transportId);

    addMessage(`You sold your ${transport.name} for ${sellPrice} gold! ${transport.icon}`);

    // Recalculate capacity
    updateCarryCapacity();
    updatePlayerInfo();
    populateTransportationOptions();
}

function updateCarryCapacity() {
    if (!game.player) return;

    // Use new transport system for capacity
    game.player.carryCapacity = TransportSystem.calculateTotalCapacity(game.player);
}

// Legacy function for backwards compatibility
function switchTransportation(transportId) {
    addMessage('Transport switching is now automatic based on what you own.');
}

function calculateCurrentLoad() {
    // get inventory via PlayerStateManager
    const inventory = (typeof PlayerStateManager !== 'undefined')
        ? PlayerStateManager.inventory.get()
        : (game.player?.inventory || {});

    if (!inventory || Object.keys(inventory).length === 0) return 0;

    let totalWeight = 0;

    // Count inventory items weight
    for (const [itemId, quantity] of Object.entries(inventory)) {
        if (itemId === 'gold') continue; // Gold doesn't count toward weight
        totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
    }

    // Count equipped items weight - you still carry what you wear!
    const equipment = (typeof PlayerStateManager !== 'undefined')
        ? PlayerStateManager.equipment.getAll()
        : (game.player?.equipment || {});
    for (const [slotId, itemId] of Object.entries(equipment)) {
        if (itemId) {
            totalWeight += ItemDatabase.calculateWeight(itemId, 1);
        }
    }

    return totalWeight;
}

function updateCurrentLoad() {
    game.player.currentLoad = calculateCurrentLoad();
    updateTransportationInfo();
}

// ═══════════════════════════════════════════════════════════════
// 💊 ITEM USAGE SYSTEM - consuming things for temporary happiness
// ═══════════════════════════════════════════════════════════════
function useItem(itemId) {
    const item = ItemDatabase.getItem(itemId);
    if (!item) {
        addMessage(`Unknown item: ${itemId}`);
        return false;
    }

    // Check if player has item via PlayerStateManager
    const quantity = (typeof PlayerStateManager !== 'undefined')
        ? PlayerStateManager.inventory.getQuantity(itemId)
        : (game.player?.inventory?.[itemId] || 0);

    if (quantity <= 0) {
        addMessage(`You don't have any ${item.name}!`);
        return false;
    }
    
    // Use item based on its type
    if (item.consumable) {
        return useConsumable(item);
    } else if (item.toolType) {
        return useTool(item);
    } else if (item.damage) {
        return equipWeapon(item);
    } else {
        addMessage(`${item.name} cannot be used directly.`);
        return false;
    }
}

// Use consumable items
function useConsumable(item) {
    if (!item.effects) {
        addMessage(`${item.name} has no effect.`);
        return false;
    }
    
    // Apply effects to player stats
    let effectMessage = `You used ${item.name}. `;
    const effects = [];
    
    for (const [stat, value] of Object.entries(item.effects)) {
        if (stat === 'duration') continue; // Skip duration, handled separately
        
        const currentValue = game.player.stats[stat] || 0;
        const maxValue = game.player.stats[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || 100;
        
        let newValue = currentValue + value;
        
        // Special handling for food and medical items based on user feedback
        if (item.category === 'food' || item.category === 'consumables') {
            // Food items refill health and stamina
            if (stat === 'health') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.health = newValue;
                effects.push(`Health +${Math.min(value, maxValue - currentValue)}`);
            } else if (stat === 'stamina') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.stamina = newValue;
                effects.push(`Stamina +${Math.min(value, maxValue - currentValue)}`);
            }
        } else if (item.category === 'medical') {
            // Medical items refill health
            if (stat === 'health') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.health = newValue;
                effects.push(`Health +${Math.min(value, maxValue - currentValue)}`);
            }
        } else {
            // Handle temporary effects for other items
            if (item.effects.duration) {
                // Apply temporary effect
                if (!game.player.temporaryEffects) game.player.temporaryEffects = {};
                game.player.temporaryEffects[stat] = {
                    value: value,
                    duration: item.effects.duration,
                    startTime: Date.now()
                };
                effects.push(`${stat} +${value} for ${Math.floor(item.effects.duration / 60)} minutes`);
            } else {
                // Apply permanent effect
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats[stat] = newValue;
                
                if (value > 0) {
                    effects.push(`${stat} +${Math.min(value, maxValue - currentValue)}`);
                } else {
                    effects.push(`${stat} ${value}`);
                }
            }
        }
    }
    
    // Remove one item from inventory via PlayerStateManager
    if (typeof PlayerStateManager !== 'undefined') {
        PlayerStateManager.inventory.remove(item.id, 1, 'consumed');
    } else {
        game.player.inventory[item.id]--;
        const newTotal = game.player.inventory[item.id] || 0;
        if (game.player.inventory[item.id] <= 0) {
            delete game.player.inventory[item.id];
        }

        // fallback EventBus emission
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('inventory:item:removed', {
                itemId: item.id,
                quantity: 1,
                newTotal: newTotal,
                reason: 'consumed'
            });
        }
    }

    effectMessage += effects.join(', ');
    addMessage(effectMessage);

    // Update UI
    updatePlayerStats();
    updateInventoryDisplay();

    return true;
}

// Use tool items
function useTool(item) {
    if (!item.toolType) return false;
    
    // Check tool durability
    if (item.durability && game.player.toolDurability && game.player.toolDurability[item.id]) {
        const currentDurability = game.player.toolDurability[item.id];
        if (currentDurability <= 0) {
            addMessage(`Your ${item.name} is broken and needs repair!`);
            return false;
        }
    }
    
    addMessage(`You equipped your ${item.name} for ${item.toolType}.`);
    game.player.equippedTool = item.id;
    
    return true;
}

// Equip weapon items
function equipWeapon(item) {
    if (!item.damage) return false;
    
    addMessage(`You equipped ${item.name} (Damage: ${item.damage}).`);
    game.player.equippedWeapon = item.id;
    
    return true;
}


// 💀 Handle player death - the final curtain call, darling
function handlePlayerDeath(deathCause = 'Unknown causes') {
    addMessage("💀 you have died... the void welcomes you home.");

    // Use the new GameOverSystem if available
    if (typeof GameOverSystem !== 'undefined') {
        GameOverSystem.handleGameOver(deathCause);
        return;
    }

    // Fallback to old behavior if GameOverSystem not loaded
    // Submit to Hall of Champions (GlobalLeaderboardSystem is the single source of truth)
    if (typeof GlobalLeaderboardSystem !== 'undefined') {
        GlobalLeaderboardSystem.onPlayerDeath(deathCause).then(() => {
            addMessage('🏆 your tale has been inscribed in the Hall of Champions...');
        }).catch(err => {
            // 🖤 Don't swallow errors silently - log them 💀
            console.warn('⚠️ Failed to submit to Hall of Champions:', err?.message || err);
        });
    }

    if (typeof SaveUISystem !== 'undefined') {
        SaveUISystem.updateLeaderboard();
    }

    changeState(GameState.MENU);
}

// Rest and Recovery System
function restAtInn() {
    // 🖤 Inn rest costs 10 gold, takes 6 hours, restores ALL vitals to 100% 💀
    const innCost = 10;
    const currentHour = TimeMachine.currentTime.hour;

    // Check if inn is open (2pm to 8am)
    if (currentHour >= 8 && currentHour < 14) {
        addMessage("The inn is closed during the day. It's only open from 2pm to 8am.");
        return false;
    }

    // 🖤 Check if at an inn location 💀
    const currentLocation = game.currentLocation;
    if (!currentLocation || (typeof GameWorld !== 'undefined' && GameWorld.locations[currentLocation.id]?.type !== 'inn')) {
        addMessage("❌ You need to be at an inn to rest here.");
        return false;
    }

    if (game.player.gold < innCost) {
        addMessage(`You need ${innCost} gold to rest at inn. You have ${game.player.gold} gold.`);
        return false;
    }

    // 🖤 Pay for inn - use UniversalGoldManager if available 💀
    if (typeof UniversalGoldManager !== 'undefined') {
        UniversalGoldManager.removeGold(innCost, 'rest at inn');
        game.player.gold = UniversalGoldManager.getPersonalGold();
    } else {
        game.player.gold -= innCost;
    }

    // 🖤 Restore ALL vitals to 100% 💀
    game.player.stats.health = game.player.stats.maxHealth;
    game.player.stats.hunger = game.player.stats.maxHunger;
    game.player.stats.thirst = game.player.stats.maxThirst;
    game.player.stats.stamina = game.player.stats.maxStamina;
    game.player.stats.happiness = Math.min(100, game.player.stats.happiness + 30);

    // Advance time by 6 hours
    TimeMachine.addMinutes(6 * 60);

    addMessage(`💤 You rested at the inn for 6 hours. (-${innCost} gold)`);
    addMessage(`✨ All vitals fully restored!`);
    addMessage(`⏰ 6 hours have passed.`);

    updatePlayerInfo();
    updatePlayerStats();

    return true;
}

function restInHouse() {
    if (!game.player.ownsHouse) {
        addMessage("You don't own a house to rest in.");
        return false;
    }
    
    // Restore all stats (free for house owners)
    game.player.stats.health = game.player.stats.maxHealth;
    game.player.stats.hunger = game.player.stats.maxHunger;
    game.player.stats.thirst = game.player.stats.maxThirst;
    game.player.stats.stamina = game.player.stats.maxStamina;
    game.player.stats.happiness = Math.min(100, game.player.stats.happiness + 30);
    
    // Advance time by 8 hours
    TimeMachine.addMinutes(8 * 60);
    
    addMessage("🏠 You rested comfortably in your house. All stats restored!");
    addMessage(`⏰ 8 hours have passed.`);
    
    updatePlayerStats();
    
    return true;
}

function buyHouse() {
    const houseCost = 1000;
    
    if (game.player.gold < houseCost) {
        addMessage(`You need ${houseCost} gold to buy a house.`);
        return false;
    }
    
    if (game.player.ownsHouse) {
        addMessage("You already own a house!");
        return false;
    }
    
    game.player.gold -= houseCost;
    game.player.ownsHouse = true;
    
    addMessage("🏠 Congratulations! You bought a house in city!");
    addMessage("You can now rest for free anytime you're in this city.");
    
    updatePlayerInfo();
    
    return true;
}

// ═══════════════════════════════════════════════════════════════
// 🏰 PROPERTY & EMPLOYEE MANAGEMENT - medieval landlord simulator
// ═══════════════════════════════════════════════════════════════
function openPropertyEmployeePanel() {
    game.showOverlay('property-employee-panel');
    
    // Initialize PropertyEmployeeUI if it exists
    if (typeof PropertyEmployeeUI !== 'undefined') {
        PropertyEmployeeUI.init();
        PropertyEmployeeUI.updateDisplay();
    }
    
    // Update property and employee displays
    if (typeof PropertySystem !== 'undefined') {
        PropertySystem.updatePropertyDisplay();
    }
    if (typeof EmployeeSystem !== 'undefined') {
        EmployeeSystem.updateEmployeeDisplay();
    }
}

// Update inventory display with new items (legacy function - now handled by InventorySystem)
function updateInventoryDisplay() {
    // 🖤💀 Safety check - ItemDatabase might not be loaded yet during early init
    if (typeof ItemDatabase === 'undefined') {
        console.warn('🎒 updateInventoryDisplay: ItemDatabase not loaded yet, skipping');
        return;
    }

    try {
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.updateInventoryDisplay();
        } else {
            // Fallback to original implementation
            const inventoryContainer = document.getElementById('inventory-items');
            if (!inventoryContainer) return;

            inventoryContainer.innerHTML = '';

            // get inventory via PlayerStateManager
            const inventory = (typeof PlayerStateManager !== 'undefined')
                ? PlayerStateManager.inventory.get()
                : (game.player?.inventory || {});

            if (!inventory || Object.keys(inventory).length === 0) {
                inventoryContainer.innerHTML = '<p>Your inventory is empty.</p>';
                return;
            }

            for (const [itemId, quantity] of Object.entries(inventory)) {
                if (quantity <= 0) continue;

                const item = ItemDatabase.getItem(itemId);
                if (!item) continue;

                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                // 🖤 XSS fix: use data attribute instead of inline onclick
                itemElement.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">×${quantity}</div>
                    <div class="item-weight">${ItemDatabase.calculateWeight(itemId, quantity).toFixed(1)} lbs</div>
                    ${item.consumable ? `<button class="use-item-btn" data-item-id="${escapeHtml(itemId)}">Use</button>` : ''}
                `;
                // 💀 Attach use button event listener safely
                const useBtn = itemElement.querySelector('.use-item-btn');
                if (useBtn) useBtn.onclick = () => useItem(useBtn.dataset.itemId);

                inventoryContainer.appendChild(itemElement);
            }
        }
    } catch (error) {
        console.warn('🎒 updateInventoryDisplay error:', error.message);
    }
}

// Update market display with new items (enhanced for new trading system)
function updateMarketDisplay() {
    const buyItemsContainer = document.getElementById('buy-items');
    if (!buyItemsContainer) return;

    buyItemsContainer.innerHTML = '';

    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation) {
        buyItemsContainer.innerHTML = '<p>No items available at this market.</p>';
        return;
    }

    // Get transport items available at this location type
    const locationType = currentLocation.type || 'town';
    const transportItems = ItemDatabase.getTransportForLocation(locationType);

    // Build combined market items - regular market + transport
    const allMarketItems = { ...(currentLocation.marketPrices || {}) };

    // Add transport items with dynamic pricing
    const priceMultiplier = locationType === 'capital' ? 1.75 :
                           locationType === 'city' ? 1.25 :
                           locationType === 'town' ? 1.1 : 1.0;

    transportItems.forEach(transport => {
        // Check if player already owns this (single ownership for most transport)
        const alreadyOwned = game.player.ownedTransport && game.player.ownedTransport.includes(transport.id);
        // For now, allow multiple animals/carts (realistic)

        allMarketItems[transport.id] = {
            price: Math.round(transport.basePrice * priceMultiplier),
            stock: alreadyOwned ? 1 : 3,  // Limited stock
            isTransport: true,
            transportType: transport.transportType,
            carryCapacity: transport.carryCapacity,
            speedModifier: transport.speedModifier,
            requiresAnimal: transport.requiresAnimal || false
        };
    });

    if (Object.keys(allMarketItems).length === 0) {
        buyItemsContainer.innerHTML = '<p>No items available at this market.</p>';
        return;
    }

    // Get filter value
    const itemFilter = document.getElementById('item-filter');
    const filterValue = itemFilter ? itemFilter.value : 'all';

    for (const [itemId, marketData] of Object.entries(allMarketItems)) {
        const item = ItemDatabase.getItem(itemId);
        if (!item) continue;

        // 🖤 Skip sell-only items - trash loot merchants buy but don't sell 💀
        if (item.sellOnly) continue;

        if (marketData.stock <= 0) continue;
        
        // Apply category filter
        if (filterValue !== 'all') {
            let itemCategory = 'other';
            if (item.category === ItemDatabase.categories.CONSUMABLES) itemCategory = 'consumables';
            else if (item.category === ItemDatabase.categories.BASIC_RESOURCES ||
                     item.category === ItemDatabase.categories.RAW_ORES) itemCategory = 'resources';
            else if (item.category === ItemDatabase.categories.TOOLS) itemCategory = 'tools';
            else if (item.category === ItemDatabase.categories.LUXURY) itemCategory = 'luxury';
            else if (item.category === ItemDatabase.categories.TRANSPORT) itemCategory = 'transport';

            if (itemCategory !== filterValue) continue;
        }

        // Special handling for transport items
        const isTransport = item.isTransport || marketData.isTransport;
        
        // Get price trend
        const trend = MarketPriceHistory.getPriceTrend(currentLocation.id, itemId);
        const trendClass = trend === 'rising' ? 'rising' : trend === 'falling' ? 'falling' : 'stable';
        const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
        
        // Get demand level
        let demandClass = '';
        let demandText = '';
        if (marketData.supplyDemandRatio) {
            if (marketData.supplyDemandRatio > 1.3) {
                demandClass = 'high';
                demandText = 'High Demand';
            } else if (marketData.supplyDemandRatio < 0.7) {
                demandClass = 'low';
                demandText = 'Low Demand';
            }
        }
        
        // Check if item is special
        const isSpecial = marketData.special || false;

        // Check transport validation
        let transportBlocked = false;
        let transportBlockReason = '';
        if (isTransport && marketData.requiresAnimal) {
            // Vehicle requires animal - check if player has more animals than vehicles
            const ownedAnimals = (game.player.ownedTransport || []).filter(id => {
                const t = ItemDatabase.getItem(id);
                return t && t.transportType === 'animal';
            }).length;
            const ownedVehicles = (game.player.ownedTransport || []).filter(id => {
                const t = ItemDatabase.getItem(id);
                return t && t.transportType === 'vehicle';
            }).length;
            if (ownedAnimals <= ownedVehicles) {
                transportBlocked = true;
                transportBlockReason = 'Need animal first';
            }
        }

        const itemElement = document.createElement('div');
        itemElement.className = `market-item ${item.rarity} ${isSpecial ? 'special' : ''} ${isTransport ? 'transport-item' : ''} ${transportBlocked ? 'blocked' : ''} ${TradingSystem.selectedTradeItems.has(itemId) ? 'selected' : ''}`;
        itemElement.dataset.itemId = itemId;

        // Build item HTML - transport items show capacity/speed instead of weight
        let itemInfoHtml;
        if (isTransport) {
            const capacityInfo = marketData.carryCapacity || item.carryCapacity || 0;
            const speedInfo = marketData.speedModifier || item.speedModifier || 1.0;
            const speedPercent = Math.round((speedInfo - 1) * 100);
            const speedDisplay = speedPercent >= 0 ? `+${speedPercent}%` : `${speedPercent}%`;
            const typeLabel = marketData.transportType || item.transportType || 'transport';

            itemInfoHtml = `
                ${trend !== 'stable' ? `<div class="item-trend ${trendClass}">${trendIcon}</div>` : ''}
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="transport-type">${typeLabel.toUpperCase()}</div>
                <div class="item-price">${marketData.price} gold</div>
                <div class="transport-stats">
                    <span class="capacity">+${capacityInfo} lbs</span>
                    <span class="speed">${speedDisplay} speed</span>
                </div>
                ${transportBlocked ? `<div class="transport-blocked">${transportBlockReason}</div>` : ''}
            `;
        } else {
            itemInfoHtml = `
                ${trend !== 'stable' ? `<div class="item-trend ${trendClass}">${trendIcon}</div>` : ''}
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">${marketData.price} gold</div>
                <div class="item-stock">Stock: ${marketData.stock}</div>
                <div class="item-weight">${item.weight} lbs</div>
                ${demandText ? `<div class="item-demand ${demandClass}">${demandText}</div>` : ''}
            `;
        }
        itemElement.innerHTML = itemInfoHtml;

        // Store data on the element for cart
        itemElement.dataset.price = marketData.price;
        itemElement.dataset.stock = marketData.stock;
        itemElement.dataset.itemName = item.name;
        itemElement.dataset.itemIcon = item.icon;
        itemElement.dataset.itemWeight = item.weight;
        itemElement.dataset.isTransport = isTransport ? 'true' : 'false';
        itemElement.dataset.transportBlocked = transportBlocked ? 'true' : 'false';

        // Click anywhere on the item box to add to cart
        // BULK SHORTCUTS: Shift+Click = 5, Ctrl+Click = 25 (not for transport)
        itemElement.style.cursor = transportBlocked ? 'not-allowed' : 'pointer';
        itemElement.title = isTransport ? 'Click to buy' : 'Click to buy (Shift: x5, Ctrl: x25)';

        itemElement.onclick = (e) => {
            // Block if transport validation failed
            if (itemElement.dataset.transportBlocked === 'true') {
                addMessage('You need an animal (horse, mule, or oxen) before you can buy a cart or wagon!');
                return;
            }

            // Don't interfere with bulk mode selection
            if (TradingSystem.tradeMode === 'bulk' && (e.shiftKey || e.ctrlKey || e.altKey)) return;

            // TRANSPORT ITEMS - direct purchase, add to ownedTransport
            if (itemElement.dataset.isTransport === 'true') {
                const price = parseInt(itemElement.dataset.price, 10) || 0;
                const itemName = itemElement.dataset.itemName || itemId;

                if (game.player.gold < price) {
                    addMessage(`You need ${price} gold to buy a ${itemName}. You have ${game.player.gold}.`);
                    return;
                }

                // Purchase transport
                game.player.gold -= price;
                if (!game.player.ownedTransport) {
                    game.player.ownedTransport = ['satchel'];
                }
                game.player.ownedTransport.push(itemId);

                // Update legacy array
                if (!game.player.ownedTransportation) {
                    game.player.ownedTransportation = [];
                }
                if (!game.player.ownedTransportation.includes(itemId)) {
                    game.player.ownedTransportation.push(itemId);
                }

                // Update carry capacity
                if (typeof TransportSystem !== 'undefined') {
                    game.player.carryCapacity = TransportSystem.calculateTotalCapacity(game.player);
                }

                addMessage(`You bought a ${itemName} for ${price} gold! ${item.icon}`);
                updatePlayerInfo();
                updateMarketDisplay();  // Refresh to update validation states
                return;
            }

            // REGULAR ITEMS - Open TradeCartPanel and add item
            if (typeof TradeCartPanel !== 'undefined') {
                const price = parseInt(itemElement.dataset.price, 10) || 0;
                const stock = parseInt(itemElement.dataset.stock, 10) || 1;
                const itemName = itemElement.dataset.itemName || itemId;
                const itemIcon = itemElement.dataset.itemIcon || '';
                const itemWeight = parseFloat(itemElement.dataset.itemWeight) || 1;

                // Bulk quantity from modifier keys: Ctrl = 25, Shift = 5, Normal = 1
                let bulkQty = 1;
                if (e.ctrlKey || e.metaKey) bulkQty = 25;
                else if (e.shiftKey) bulkQty = 5;

                // Create merchant data from current location
                const merchantData = {
                    name: currentLocation.name + ' Market',
                    id: currentLocation.id,
                    type: 'market',
                    inventory: currentLocation.marketPrices
                };

                // Ensure cart is open
                if (!TradeCartPanel.isOpen) {
                    TradeCartPanel.open(merchantData, 'buy');
                }
                // Add item to cart (with bulk quantity support)
                TradeCartPanel.addItem(itemId, price, stock, {
                    name: itemName,
                    icon: itemIcon,
                    weight: itemWeight,
                    quantity: bulkQty
                });

                // Visual feedback - flash the item
                itemElement.classList.add('added-to-cart');
                setTimeout(() => itemElement.classList.remove('added-to-cart'), 300);
            } else {
                // Fallback to direct buy if TradeCartPanel not loaded
                buyItem(itemId);
            }
        };

        // Add event listeners for bulk selection
        if (TradingSystem.tradeMode === 'bulk') {
            EventManager.addEventListener(itemElement, 'click', (e) => {
                if (e.shiftKey || e.ctrlKey || e.altKey) return;
                
                if (TradingSystem.selectedTradeItems.has(itemId)) {
                    TradingSystem.selectedTradeItems.delete(itemId);
                    itemElement.classList.remove('selected');
                } else {
                    TradingSystem.selectedTradeItems.set(itemId, 1);
                    itemElement.classList.add('selected');
                }
                
                TradingSystem.updateTradeSummary();
            });
            
            EventManager.addEventListener(itemElement, 'contextmenu', (e) => {
                e.preventDefault();
                TradingSystem.updateTradePreview(itemId, 1);
            });
        }
        
        buyItemsContainer.appendChild(itemElement);
    }
}

// Update price comparison display
function updatePriceComparison() {
    const compareSelect = document.getElementById('compare-item-select');
    const priceComparison = document.getElementById('price-comparison');
    
    if (!compareSelect || !priceComparison) return;
    
    const selectedItemId = compareSelect.value;
    if (!selectedItemId) {
        priceComparison.innerHTML = '<p>Please select an item to compare prices.</p>';
        return;
    }
    
    const comparisons = MarketPriceHistory.comparePrices(selectedItemId);
    
    if (comparisons.length === 0) {
        priceComparison.innerHTML = '<p>No price data available for this item.</p>';
        return;
    }
    
    const bestPrice = comparisons[0];
    
    priceComparison.innerHTML = comparisons.map(comp => {
        const isBestPrice = comp.cityId === bestPrice.cityId;
        const trendClass = comp.trend === 'rising' ? 'price-rise' :
                         comp.trend === 'falling' ? 'price-fall' : '';
        const trendIcon = comp.trend === 'rising' ? '📈' :
                        comp.trend === 'falling' ? '📉' : '➡️';
        
        return `
            <div class="price-comparison-item ${isBestPrice ? 'best-price' : ''}">
                <div>
                    <div class="price-comparison-city">${comp.cityName}</div>
                    <div class="price-comparison-stock">Stock: ${comp.stock}</div>
                </div>
                <div>
                    <div class="price-comparison-price">${comp.currentPrice} gold</div>
                    <div class="price-comparison-trend ${trendClass}">${trendIcon} ${comp.trend}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Refresh market
function refreshMarket() {
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation) return;
    
    // Restock some items
    Object.keys(currentLocation.marketPrices).forEach(itemId => {
        const marketData = currentLocation.marketPrices[itemId];
        const restockAmount = Math.floor(Math.random() * 3) + 1;
        marketData.stock = Math.min(marketData.stock + restockAmount, 50);
    });
    
    // Check for city events
    if (typeof CityEventSystem !== 'undefined') {
        CityEventSystem.checkRandomEvents(currentLocation.id);
    }
    
    // Update displays
    updateMarketDisplay();
    updateMarketEvents();
    updateMarketNews();
    
    addMessage('Market refreshed with new goods!');
}

// Buy item from market (enhanced for new trading system)
function buyItem(itemId, quantity = 1) {
    const item = ItemDatabase.getItem(itemId);
    if (!item) return;
    
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation || !currentLocation.marketPrices) return;
    
    const marketData = currentLocation.marketPrices[itemId];
    if (!marketData || marketData.stock <= 0) {
        addMessage(`${item.name} is out of stock!`);
        return;
    }
    
    // Check if buying in bulk
    const actualQuantity = TradingSystem.tradeMode === 'bulk' ?
        TradingSystem.selectedTradeItems.get(itemId) || quantity : quantity;

    // Apply charisma modifier to buy price (higher charisma = better prices)
    // Base: 5 charisma = no modifier, each point above/below = 2% difference
    // 💀 FIX: cap charisma bonus at 50% to prevent free items exploit 💀
    const rawCharismaBonus = (game.player.attributes.charisma - 5) * 0.02;
    const charismaModifier = 1 - Math.min(0.5, Math.max(-0.5, rawCharismaBonus));
    const modifiedPrice = Math.max(1, Math.round(marketData.price * charismaModifier));
    const totalPrice = modifiedPrice * actualQuantity;

    // Use UniversalGoldManager if available (checks all gold sources)
    const canAffordPurchase = typeof UniversalGoldManager !== 'undefined' ?
        UniversalGoldManager.canAfford(totalPrice) :
        game.player.gold >= totalPrice;

    if (!canAffordPurchase) {
        const totalGold = typeof UniversalGoldManager !== 'undefined' ?
            UniversalGoldManager.getTotalGold() : game.player.gold;
        addMessage(`You need ${totalPrice} gold to buy ${actualQuantity} × ${item.name}! (You have ${totalGold} total)`);
        return;
    }
    
    // Check weight capacity with strength bonus
    const currentWeight = calculateCurrentLoad();
    const newWeight = currentWeight + (item.weight * actualQuantity);
    const transport = transportationOptions[game.player.transportation];

    // Apply strength modifier to carry capacity (each point of strength adds 5 lbs)
    const strengthBonus = (game.player.attributes.strength - 5) * 5;
    const maxCapacity = transport.carryCapacity + strengthBonus;

    if (newWeight > maxCapacity) {
        addMessage(`You don't have enough carrying capacity! Need ${Math.ceil(newWeight - maxCapacity)} lbs more capacity.`);
        return;
    }
    
    // Complete purchase - remove gold from all sources (personal first, then storage)
    if (typeof UniversalGoldManager !== 'undefined') {
        UniversalGoldManager.removeGold(totalPrice, `bought ${actualQuantity}x ${itemId}`);
        // Sync game.player.gold with personal gold
        game.player.gold = UniversalGoldManager.getPersonalGold();
    } else {
        game.player.gold -= totalPrice;
    }
    marketData.stock = Math.max(0, marketData.stock - actualQuantity);

    // 💰 Add gold to merchant's coffers (player is buying, merchant receives gold)
    if (typeof NPCMerchantSystem !== 'undefined') {
        NPCMerchantSystem.addMerchantGold(currentLocation.id, totalPrice);
    }

    // Update supply and demand
    DynamicMarketSystem.updateSupplyDemand(currentLocation.id, itemId, actualQuantity);
    
    // Apply market saturation
    DynamicMarketSystem.applyMarketSaturation(currentLocation.id, itemId);
    
    // Add to inventory via PlayerStateManager
    if (typeof PlayerStateManager !== 'undefined') {
        PlayerStateManager.inventory.add(itemId, actualQuantity, 'market_buy');
    } else {
        if (!game.player.inventory[itemId]) {
            game.player.inventory[itemId] = 0;
        }
        game.player.inventory[itemId] += actualQuantity;

        // fallback EventBus emission
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('inventory:item:added', {
                itemId: itemId,
                quantity: actualQuantity,
                newTotal: game.player.inventory[itemId],
                reason: 'market_buy'
            });
        }
    }

    // 🖤 Emit item-received for quest progress tracking (collect objectives) 💀
    document.dispatchEvent(new CustomEvent('item-received', {
        detail: { item: itemId, quantity: actualQuantity, source: 'market_buy' }
    }));
    // 🖤 Emit item-purchased for quest progress tracking (buy objectives) 💀
    document.dispatchEvent(new CustomEvent('item-purchased', {
        detail: { itemId, quantity: actualQuantity, price: totalPrice, location: currentLocation.id }
    }));

    // Record trade if in bulk mode
    if (TradingSystem.tradeMode === 'bulk') {
        const tradeItems = new Map();
        tradeItems.set(itemId, actualQuantity);
        TradingSystem.recordTrade('buy', tradeItems);
    }
    
    // Small reputation gain for trading
    CityReputationSystem.changeReputation(currentLocation.id, 0.1 * actualQuantity);
    
    addMessage(`Bought ${actualQuantity} × ${item.name} for ${totalPrice} gold!`);
    
    updatePlayerInfo();
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.updateInventoryDisplay();
    } else {
        updateInventoryDisplay();
    }
    updateMarketDisplay();
    updateCurrentLoad();
    
    // Check price alerts
    TradingSystem.checkPriceAlerts();
}

// Sell item to market (enhanced for new trading system)
function sellItem(itemId, quantity = 1) {
    const item = ItemDatabase.getItem(itemId);
    if (!item) return;

    // get available quantity via PlayerStateManager
    const availableQuantity = (typeof PlayerStateManager !== 'undefined')
        ? PlayerStateManager.inventory.getQuantity(itemId)
        : (game.player?.inventory?.[itemId] || 0);

    if (availableQuantity <= 0) {
        addMessage(`You don't have any ${item.name} to sell!`);
        return;
    }

    // Check if selling in bulk mode
    const actualQuantity = TradingSystem.tradeMode === 'bulk' ?
        TradingSystem.selectedTradeItems.get(itemId) || quantity : quantity;

    if (actualQuantity > availableQuantity) {
        addMessage(`You only have ${availableQuantity} × ${item.name} to sell!`);
        return;
    }

    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation) return;

    // Calculate sell price with reputation and charisma modifiers
    const reputationModifier = CityReputationSystem.getPriceModifier(currentLocation.id);
    const baseSellPrice = Math.round(ItemDatabase.calculatePrice(itemId) * 0.7);

    // Apply charisma modifier to sell price (higher charisma = better prices when selling)
    // Base: 5 charisma = no modifier, each point above/below = 2% difference
    // 💀 FIX: cap charisma bonus at 50% (charisma 30) to prevent infinite gold exploit 💀
    const rawCharismaBonus = (game.player.attributes.charisma - 5) * 0.02;
    const charismaModifier = 1 + Math.min(0.5, Math.max(-0.5, rawCharismaBonus));
    // 💀 Session #76: Floor sell price at 1 gold - nothing's worthless 💀
    const sellPrice = Math.max(1, Math.round(baseSellPrice * reputationModifier * charismaModifier));
    const totalSellPrice = sellPrice * actualQuantity;

    // 💰 Check if merchant can afford to buy from player
    if (typeof NPCMerchantSystem !== 'undefined') {
        const merchant = NPCMerchantSystem.getCurrentMerchant();
        if (merchant) {
            const finances = NPCMerchantSystem.getMerchantFinances(merchant.id);
            if (finances && finances.currentGold < totalSellPrice) {
                // Merchant can't afford full purchase - offer partial
                const maxAffordable = Math.floor(finances.currentGold / sellPrice);
                if (maxAffordable <= 0) {
                    addMessage(`${merchant.firstName} shakes their head. "sorry friend, my coffers are empty. can't buy anything right now."`);
                    return;
                }
                addMessage(`${merchant.firstName} winces. "i can only afford ${maxAffordable} of those. times are tough."`);
                return;
            }

            // Deduct gold from merchant
            NPCMerchantSystem.deductMerchantGold(merchant.id, totalSellPrice, `${actualQuantity}x ${item.name}`);
        }
    }

    // Remove from inventory via PlayerStateManager
    if (typeof PlayerStateManager !== 'undefined') {
        PlayerStateManager.inventory.remove(itemId, actualQuantity, 'market_sell');
    } else {
        game.player.inventory[itemId] -= actualQuantity;
        const newTotal = game.player.inventory[itemId] || 0;
        if (game.player.inventory[itemId] <= 0) {
            delete game.player.inventory[itemId];
        }

        // fallback EventBus emission
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('inventory:item:removed', {
                itemId: itemId,
                quantity: actualQuantity,
                newTotal: newTotal,
                reason: 'market_sell'
            });
        }
    }

    // Add gold to personal inventory (always goes to personal, not storage)
    if (typeof UniversalGoldManager !== 'undefined') {
        UniversalGoldManager.addPersonalGold(totalSellPrice, `sold ${actualQuantity}x ${itemId}`);
        // Sync game.player.gold
        game.player.gold = UniversalGoldManager.getPersonalGold();
    } else {
        game.player.gold += totalSellPrice;
    }
    // 🖤 Emit item-sold for quest progress tracking 💀
    document.dispatchEvent(new CustomEvent('item-sold', {
        detail: { item: itemId, quantity: actualQuantity, gold: totalSellPrice }
    }));
    // 🖤 Emit gold-changed for wealth gate quests 💀
    document.dispatchEvent(new CustomEvent('gold-changed', {
        detail: { newAmount: game.player.gold, change: totalSellPrice, source: 'sell' }
    }));

    // Add to market stock
    if (!currentLocation.marketPrices[itemId]) {
        currentLocation.marketPrices[itemId] = {
            price: ItemDatabase.calculatePrice(itemId),
            stock: 0
        };
    }
    currentLocation.marketPrices[itemId].stock += actualQuantity;

    // Update supply and demand
    DynamicMarketSystem.updateSupplyDemand(currentLocation.id, itemId, -actualQuantity);

    // Apply market saturation
    DynamicMarketSystem.applyMarketSaturation(currentLocation.id, itemId);

    // Record trade if in bulk mode
    if (TradingSystem.tradeMode === 'bulk') {
        const tradeItems = new Map();
        tradeItems.set(itemId, actualQuantity);
        TradingSystem.recordTrade('sell', tradeItems);
    }

    // Small reputation gain for trading
    CityReputationSystem.changeReputation(currentLocation.id, 0.1 * actualQuantity);

    addMessage(`Sold ${actualQuantity} × ${item.name} for ${totalSellPrice} gold!`);

    updatePlayerInfo();
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.updateInventoryDisplay();
    } else {
        updateInventoryDisplay();
    }
    updateMarketDisplay();
    updateCurrentLoad();

    // Check price alerts
    TradingSystem.checkPriceAlerts();
}

// ♾️ GAME LOOP - the cycle of suffering continues
// (legacy function but it's vintage, okay?)
function startGameLoop() {
    // Start the game engine
    game.start();
}

// Render game world (now part of game object)
function renderGameWorld() {
    // Delegate to game object's render method
    if (game && typeof game.renderGameWorld === 'function') {
        game.renderGameWorld();
    }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS - random helpful stuff
// ═══════════════════════════════════════════════════════════════
function addMessage(text, type = 'info') {
    // 🖤 Safety check: if message log doesn't exist, just log to console
    const messageLog = elements.messages || document.getElementById('message-log');
    if (!messageLog) {
        console.log(`[${type}] ${text}`);
        return;
    }

    const messageElement = document.createElement('p');
    messageElement.className = 'message';
    messageElement.textContent = text;

    messageLog.appendChild(messageElement);

    // Auto-scroll to bottom
    messageLog.scrollTop = messageLog.scrollHeight;

    // Limit message history
    while (messageLog.children.length > 50) {
        messageLog.removeChild(messageLog.firstChild);
    }
}

function handleKeyPress(event) {
    // Keyboard shortcuts
    switch (event.key) {
        case 'Escape':
            // SACRED PROTECTION: Never fuck with game setup or character creation
            const gameSetupPanel = document.getElementById('game-setup-panel');
            const charCreationOverlay = document.getElementById('character-creation-overlay');

            if (gameSetupPanel && !gameSetupPanel.classList.contains('hidden') && gameSetupPanel.style.display !== 'none') {
                return; // Game setup is protected from ESC massacre
            }
            if (charCreationOverlay && (charCreationOverlay.classList.contains('active') || charCreationOverlay.style.display === 'flex')) {
                return; // Character creation is protected too
            }

            // Let ModalSystem handle if modal is open
            if (typeof ModalSystem !== 'undefined' && ModalSystem.activeModals && ModalSystem.activeModals.size > 0) {
                return; // Modal handles its own ESC
            }

            // Let PanelManager handle ESC for closing panels in order
            if (typeof PanelManager !== 'undefined' && PanelManager.openPanels.length > 0) {
                // PanelManager will handle this via its capture handler
                return;
            }
            // Fallback: Close any open panel and return to playing state
            if (game.state === GameState.PLAYING) {
                toggleMenu();
            } else if (game.state !== GameState.MENU) {
                // Close all open panels
                hideAllPanels();
                changeState(GameState.PLAYING);

                // Stop any playing music/ambient sounds
                if (typeof AudioSystem !== 'undefined') {
                    AudioSystem.stopMusic();
                    AudioSystem.stopAmbient();
                }
            }
            break;
        case 'i':
        case 'I':
            if (game.state === GameState.PLAYING) {
                openInventory();
            } else if (game.state === GameState.INVENTORY) {
                closeInventory();
            }
            break;
        case 'm':
        case 'M':
            if (game.state === GameState.PLAYING) {
                openMarket();
            } else if (game.state === GameState.MARKET) {
                closeMarket();
            }
            break;
        case 't':
        case 'T':
            if (game.state === GameState.PLAYING) {
                openTravel();
            } else if (game.state === GameState.TRAVEL) {
                closeTravel();
            }
            break;
        case 's':
        case 'S':
            if (game.state === GameState.PLAYING) {
                saveGame();
            }
            break;
        case 'F5':
            event.preventDefault();
            if (game.state === GameState.PLAYING && typeof SaveLoadSystem !== 'undefined') {
                SaveLoadSystem.quickSave();
                addMessage('Quick saved!');
            }
            break;
        case 'F9':
            event.preventDefault();
            if (game.state === GameState.PLAYING && typeof SaveLoadSystem !== 'undefined') {
                SaveLoadSystem.quickLoad();
                addMessage('Quick loaded!');
            }
            break;
        case 'c':
        case 'C':
            // Close current panel
            if (game.state === GameState.MARKET) {
                closeMarket();
            } else if (game.state === GameState.INVENTORY) {
                closeInventory();
            } else if (game.state === GameState.TRAVEL) {
                closeTravel();
            } else if (game.state === GameState.TRANSPORTATION) {
                closeTransportation();
            }
            break;
    }
}

function toggleMenu() {
    // 🖤 Create and show the game menu overlay - FULLSCREEN BLACKOUT
    let menuOverlay = document.getElementById('game-menu-overlay');

    if (!menuOverlay) {
        // 💀 Create the menu overlay with full-screen blackout
        menuOverlay = document.createElement('div');
        menuOverlay.id = 'game-menu-overlay';
        menuOverlay.className = 'game-menu-fullscreen';
        menuOverlay.innerHTML = `
            <div class="game-menu-content">
                <h2>📋 Game Menu</h2>
                <div class="game-menu-buttons">
                    <button class="menu-btn" id="menu-resume-btn">▶️ Resume Game</button>
                    <button class="menu-btn" id="menu-save-btn">💾 Save Game</button>
                    <button class="menu-btn" id="menu-load-btn">📂 Load Game</button>
                    <button class="menu-btn" id="menu-settings-btn">⚙️ Settings</button>
                    <button class="menu-btn" id="menu-achievements-btn">🏆 Achievements</button>
                    <button class="menu-btn" id="menu-help-btn">❓ Help</button>
                    <button class="menu-btn danger" id="menu-quit-btn">🚪 Quit to Main Menu</button>
                </div>
                <div class="game-menu-footer">
                    <p>Press ESC to close</p>
                </div>
            </div>
        `;

        // 🖤 Style the fullscreen menu overlay
        const style = document.createElement('style');
        style.id = 'game-menu-styles';
        style.textContent = `
            /* 🖤 Fullscreen blackout overlay - horse blinders mode */
            .game-menu-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
            }
            .game-menu-fullscreen.active {
                display: flex;
            }
            .game-menu-content {
                background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(30, 30, 60, 0.98) 100%);
                border: 2px solid #4fc3f7;
                border-radius: 16px;
                padding: 2rem;
                min-width: 320px;
                max-width: 400px;
                box-shadow: 0 0 60px rgba(79, 195, 247, 0.4), 0 0 120px rgba(79, 195, 247, 0.2);
            }
            .game-menu-content h2 {
                text-align: center;
                color: #4fc3f7;
                margin-bottom: 1.5rem;
                font-size: 1.8rem;
            }
            .game-menu-buttons {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .game-menu-buttons .menu-btn {
                padding: 1rem 1.5rem;
                font-size: 1.1rem;
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.2) 0%, rgba(79, 195, 247, 0.1) 100%);
                border: 1px solid rgba(79, 195, 247, 0.4);
                border-radius: 8px;
                color: #e0e0e0;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }
            .game-menu-buttons .menu-btn:hover {
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.4) 0%, rgba(79, 195, 247, 0.2) 100%);
                border-color: #4fc3f7;
                transform: translateX(5px);
            }
            .game-menu-buttons .menu-btn.danger {
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
                border-color: rgba(244, 67, 54, 0.4);
            }
            .game-menu-buttons .menu-btn.danger:hover {
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(244, 67, 54, 0.2) 100%);
                border-color: #f44336;
            }
            .game-menu-footer {
                text-align: center;
                margin-top: 1.5rem;
                color: #888;
                font-size: 0.9rem;
            }
            /* 🖤 Menu button highlight in action bar */
            .menu-btn-highlight {
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.3) 0%, rgba(79, 195, 247, 0.15) 100%) !important;
                border: 1px solid rgba(79, 195, 247, 0.5) !important;
            }
        `;
        if (!document.getElementById('game-menu-styles')) {
            document.head.appendChild(style);
        }

        // 🖤 Append to body for true fullscreen coverage
        document.body.appendChild(menuOverlay);

        // Add event listeners
        document.getElementById('menu-resume-btn').addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuOverlay.style.display = 'none';
            addMessage('Game resumed');
        });

        document.getElementById('menu-save-btn').addEventListener('click', () => {
            if (typeof SaveLoadUI !== 'undefined') {
                SaveLoadUI.show('saves');
            } else {
                saveGame();
            }
        });

        document.getElementById('menu-load-btn').addEventListener('click', () => {
            if (typeof SaveLoadUI !== 'undefined') {
                SaveLoadUI.show('load');
            } else {
                loadGame();
            }
        });

        document.getElementById('menu-settings-btn').addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuOverlay.style.display = 'none';
            if (typeof SettingsPanel !== 'undefined' && SettingsPanel.show) {
                SettingsPanel.show();
            }
        });

        document.getElementById('menu-achievements-btn').addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuOverlay.style.display = 'none';
            if (typeof openAchievementPanel === 'function') {
                openAchievementPanel();
            }
        });

        document.getElementById('menu-help-btn').addEventListener('click', () => {
            showHelpOverlay();
        });

        // 🖤💀 FIXED: Use modal instead of browser confirm() 💀
        document.getElementById('menu-quit-btn').addEventListener('click', () => {
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '🚪 Quit Game',
                    content: '<p>Are you sure you want to quit?</p><p style="color: #f44336; font-size: 12px;">Unsaved progress will be lost.</p>',
                    buttons: [
                        { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                        {
                            text: '🚪 Quit',
                            className: 'danger',
                            onClick: () => {
                                ModalSystem.hide();
                                menuOverlay.classList.remove('active');
                                menuOverlay.style.display = 'none';
                                quitToMainMenu();
                            }
                        }
                    ]
                });
            } else {
                menuOverlay.classList.remove('active');
                menuOverlay.style.display = 'none';
                quitToMainMenu();
            }
        });

        // Click outside to close
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) {
                menuOverlay.classList.remove('active');
                menuOverlay.style.display = 'none';
            }
        });
    }

    // Toggle visibility
    if (menuOverlay.classList.contains('active')) {
        menuOverlay.classList.remove('active');
        menuOverlay.style.display = 'none';
    } else {
        menuOverlay.style.display = 'flex';
        menuOverlay.classList.add('active');
    }
}

// Show help overlay with controls and game info
function showHelpOverlay() {
    let helpOverlay = document.getElementById('help-overlay');

    if (!helpOverlay) {
        helpOverlay = document.createElement('div');
        helpOverlay.id = 'help-overlay';
        helpOverlay.className = 'overlay';
        helpOverlay.innerHTML = `
            <div class="overlay-content help-content">
                <button class="overlay-close" onclick="document.getElementById('help-overlay').classList.remove('active'); document.getElementById('help-overlay').style.display='none';">×</button>
                <h2>❓ Help & Controls</h2>

                <div class="help-section">
                    <h3>⌨️ Keyboard Shortcuts</h3>
                    <div class="help-grid">
                        <div class="help-item"><span class="key">I</span> Inventory</div>
                        <div class="help-item"><span class="key">M</span> Market</div>
                        <div class="help-item"><span class="key">T</span> Travel</div>
                        <div class="help-item"><span class="key">W</span> Transportation</div>
                        <div class="help-item"><span class="key">C</span> Character</div>
                        <div class="help-item"><span class="key">F</span> Finances</div>
                        <div class="help-item"><span class="key">P</span> Properties</div>
                        <div class="help-item"><span class="key">H</span> Achievements</div>
                        <div class="help-item"><span class="key">,</span> Settings</div>
                        <div class="help-item"><span class="key">Space</span> Pause/Resume</div>
                        <div class="help-item"><span class="key">ESC</span> Close/Menu</div>
                        <div class="help-item"><span class="key">F5</span> Quick Save</div>
                        <div class="help-item"><span class="key">F9</span> Quick Load</div>
                    </div>
                </div>

                <div class="help-section">
                    <h3>🗺️ Map Controls</h3>
                    <div class="help-grid">
                        <div class="help-item"><span class="key">+/-</span> Zoom In/Out</div>
                        <div class="help-item"><span class="key">Drag</span> Pan Map</div>
                        <div class="help-item"><span class="key">Scroll</span> Zoom</div>
                    </div>
                </div>

                <div class="help-section">
                    <h3>🎮 How to Play</h3>
                    <p>Buy low, sell high! Travel between locations to find the best deals. Upgrade your transportation to carry more goods. Build your trading empire!</p>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .help-content {
                background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(30, 30, 60, 0.98) 100%);
                border: 2px solid #4fc3f7;
                border-radius: 16px;
                padding: 2rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .help-content h2 {
                text-align: center;
                color: #4fc3f7;
                margin-bottom: 1.5rem;
            }
            .help-section {
                margin-bottom: 1.5rem;
            }
            .help-section h3 {
                color: #81c784;
                margin-bottom: 0.75rem;
                font-size: 1.1rem;
            }
            .help-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 0.5rem;
            }
            .help-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                color: #e0e0e0;
            }
            .help-item .key {
                background: rgba(79, 195, 247, 0.2);
                border: 1px solid rgba(79, 195, 247, 0.4);
                border-radius: 4px;
                padding: 0.2rem 0.5rem;
                font-family: monospace;
                font-size: 0.85rem;
                min-width: 45px;
                text-align: center;
            }
            .help-section p {
                color: #b0b0b0;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);

        document.getElementById('overlay-container').appendChild(helpOverlay);

        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.classList.remove('active');
                helpOverlay.style.display = 'none';
            }
        });
    }

    helpOverlay.style.display = 'flex';
    helpOverlay.classList.add('active');
}

// Save/Load Functions
function saveGame() {
    if (typeof SaveLoadSystem !== 'undefined') {
        SaveLoadUI.show('saves');
    } else {
        // Fallback to basic save
        try {
            const saveData = game.saveState();
            try {
                localStorage.setItem('tradingGameSave', JSON.stringify(saveData));
            } catch (error) {
                // 🦇 localStorage full or unavailable
                addMessage('Failed to save - storage full!', 'warning');
                return;
            }
            addMessage('Game saved successfully!');
        } catch (error) {
            // 🦇 Game state couldn't be serialized
            addMessage('Failed to save game!', 'warning');
        }
    }
}

function loadGame() {
    if (typeof SaveLoadSystem !== 'undefined') {
        SaveLoadUI.show('load');
    } else {
        // Fallback to basic load
        try {
            const saveData = localStorage.getItem('tradingGameSave');
            if (saveData) {
                let parsedData;
                try {
                    parsedData = JSON.parse(saveData);
                } catch (error) {
                    // 🦇 Corrupt save data - inform user
                    addMessage('Save data is corrupted!', 'warning');
                    return;
                }
                game.loadState(parsedData);
                updatePlayerInfo();
                updateLocationInfo();
                addMessage('Game loaded successfully!');
            } else {
                addMessage('No saved game found!');
            }
        } catch (error) {
            // 🦇 Load failed - inform user
            addMessage('Failed to load game!', 'warning');
        }
    }
}

function showSettings() {
    // 🎯 Use the unified SettingsPanel (no fallback to old overlay)
    if (typeof SettingsPanel !== 'undefined') {
        if (!SettingsPanel.panelElement) {
            SettingsPanel.init();
        }
        SettingsPanel.show();
    } else {
        gameDeboogerWarn('🖤 SettingsPanel not loaded');
    }
}

/**
 * Escape HTML to prevent XSS injection in high scores
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for innerHTML
 */
function _escapeHTMLForScores(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getHighScoresHTML() {
    // Use GlobalLeaderboardSystem (Hall of Champions) as the single source of truth
    if (typeof GlobalLeaderboardSystem === 'undefined' || !GlobalLeaderboardSystem.leaderboard || GlobalLeaderboardSystem.leaderboard.length === 0) {
        return '<p>No champions yet. Be the first!</p>';
    }

    return GlobalLeaderboardSystem.leaderboard.slice(0, 10).map((score, index) => {
        const medal = index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        const statusIcon = score.isAlive ? '💚' : '💀';
        const statusText = score.isAlive ? 'still playing' : _escapeHTMLForScores(score.causeOfDeath || 'unknown');
        // FIX XSS: Escape playerName to prevent script injection via leaderboard
        return `<div class="high-score-entry">${medal} ${_escapeHTMLForScores(score.playerName || 'Unknown')}: ${(score.score || 0).toLocaleString()} pts - ${score.daysSurvived || 0} days ${statusIcon} ${statusText}</div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════
// 📢 NOTIFICATION SYSTEM - telling you things you don't wanna hear
// ═══════════════════════════════════════════════════════════════
game.initNotificationSystem = function() {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Initialize the UI object for event notifications
    this.ui = this.ui || {};

    // Event notification function
    this.ui.showEventNotification = (event) => {
        if (!event || !event.name) return;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <div class="event-notification-header">
                <span class="event-icon">📢</span>
                <span class="event-name">${event.name}</span>
            </div>
            <div class="event-description">${event.description || ''}</div>
        `;

        // Add to container
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Animate in
            setTimeout(() => notification.classList.add('show'), 10);

            // Remove after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }

        // Also add to message log
        addMessage(`📢 ${event.name}: ${event.description}`);
    };

    // General notification function
    this.ui.showNotification = (message, type = 'info', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 10);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    };

    console.log('Notification system initialized');
};

// ═══════════════════════════════════════════════════════════════
// 🎭 ENHANCED OVERLAY SYSTEM - layers on layers on layers
// ═══════════════════════════════════════════════════════════════
game.initOverlaySystem = function() {
    // Setup overlay container event listeners
    const overlayContainer = document.getElementById('overlay-container');
    if (!overlayContainer) return;
    
    // Add click event to close overlays when clicking outside
    EventManager.addEventListener(overlayContainer, 'click', (e) => {
        if (e.target === overlayContainer) {
            this.hideAllOverlays();
        }
    });
    
    // Add escape key listener for overlays (PanelManager handles panel-by-panel closing)
    EventManager.addEventListener(document, 'keydown', (e) => {
        if (e.key === 'Escape') {
            // NEVER fuck with character creation / game setup - the void awaits
            const charCreation = document.getElementById('character-creation-overlay');
            const gameSetup = document.getElementById('game-setup-panel');

            if (charCreation && (charCreation.classList.contains('active') || charCreation.style.display === 'flex')) {
                return; // Leave character creation alone!
            }
            if (gameSetup && !gameSetup.classList.contains('hidden') && gameSetup.style.display !== 'none') {
                return; // Leave game setup alone!
            }

            // Let ModalSystem handle if modal is open
            if (typeof ModalSystem !== 'undefined' && ModalSystem.activeModals && ModalSystem.activeModals.size > 0) {
                return; // Modal's handler deals with this
            }

            // Let PanelManager handle if it has panels open
            if (typeof PanelManager !== 'undefined' && PanelManager.openPanels.length > 0) {
                return; // PanelManager handles this
            }
            this.hideAllOverlays();
        }
    });
    
    // Setup close button listeners for all overlays
    document.querySelectorAll('[data-close-overlay]').forEach(button => {
        EventManager.addEventListener(button, 'click', (e) => {
            e.preventDefault();
            const overlayId = button.getAttribute('data-close-overlay');
            this.hideOverlay(overlayId);
            // Return to playing state when closing panels
            if (game.state !== GameState.MENU && game.state !== GameState.CHARACTER_CREATION) {
                changeState(GameState.PLAYING);
            }
        });
    });
    
    // Initialize world map overlay
    this.initWorldMapOverlay();
    
    console.log('Enhanced overlay system initialized');
};

// Initialize world map overlay
game.initWorldMapOverlay = function() {
    const worldMapOverlay = document.getElementById('world-map-overlay');
    if (!worldMapOverlay) return;

    // Setup map controls for HTML-based renderer
    this.setupMapControls();

    // Setup map interactions
    this.setupMapInteractions();

    // Initialize GameWorldRenderer if it exists
    if (typeof GameWorldRenderer !== 'undefined') {
        if (!GameWorldRenderer.mapElement) {
            GameWorldRenderer.init();
        }
        GameWorldRenderer.render();
        console.log('GameWorldRenderer initialized for world map overlay');
    }

    console.log('World map overlay initialized (HTML-based)');
};

// Setup map controls
game.setupMapControls = function() {
    const zoomInBtn = document.getElementById('overlay-zoom-in-btn');
    const zoomOutBtn = document.getElementById('overlay-zoom-out-btn');
    const resetViewBtn = document.getElementById('overlay-reset-view-btn');
    const centerPlayerBtn = document.getElementById('overlay-center-player-btn');

    // Use GameWorldRenderer for map controls (HTML-based)
    if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.mapState) {
        if (zoomInBtn) {
            EventManager.addEventListener(zoomInBtn, 'click', () => {
                GameWorldRenderer.mapState.zoom = Math.min(
                    GameWorldRenderer.mapState.maxZoom,
                    GameWorldRenderer.mapState.zoom * 1.2
                );
                GameWorldRenderer.updateTransform();
            });
        }
        if (zoomOutBtn) {
            EventManager.addEventListener(zoomOutBtn, 'click', () => {
                GameWorldRenderer.mapState.zoom = Math.max(
                    GameWorldRenderer.mapState.minZoom,
                    GameWorldRenderer.mapState.zoom * 0.8
                );
                GameWorldRenderer.updateTransform();
            });
        }
        if (resetViewBtn) {
            EventManager.addEventListener(resetViewBtn, 'click', () => {
                GameWorldRenderer.mapState.zoom = 1;
                GameWorldRenderer.mapState.offsetX = 0;
                GameWorldRenderer.mapState.offsetY = 0;
                if (typeof GameWorldRenderer.focusOnPlayer === 'function') {
                    GameWorldRenderer.focusOnPlayer();
                } else {
                    GameWorldRenderer.updateTransform();
                }
            });
        }
        if (centerPlayerBtn) {
            EventManager.addEventListener(centerPlayerBtn, 'click', () => {
                if (typeof GameWorldRenderer.focusOnPlayer === 'function') {
                    GameWorldRenderer.focusOnPlayer();
                }
            });
        }

        console.log('Map controls using GameWorldRenderer (HTML-based)');
        return;
    }
    
    // Fallback to basic controls if TravelSystem is not available
    if (zoomInBtn) {
        EventManager.addEventListener(zoomInBtn, 'click', () => this.zoomMap(1.2));
    }
    if (zoomOutBtn) {
        EventManager.addEventListener(zoomOutBtn, 'click', () => this.zoomMap(0.8));
    }
    if (resetViewBtn) {
        EventManager.addEventListener(resetViewBtn, 'click', () => this.resetMapView());
    }
    if (centerPlayerBtn) {
        EventManager.addEventListener(centerPlayerBtn, 'click', () => this.centerMapOnPlayer());
    }
};

// Setup map interactions
game.setupMapInteractions = function() {
    // Use GameWorldRenderer for HTML-based map interactions
    if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.mapState) {
        // GameWorldRenderer has its own event listeners for dragging/zooming
        // Update game's map state to sync with it
        this.mapState = {
            offsetX: GameWorldRenderer.mapState.offsetX,
            offsetY: GameWorldRenderer.mapState.offsetY,
            zoomLevel: GameWorldRenderer.mapState.zoom
        };
        console.log('Map interactions handled by GameWorldRenderer (HTML-based)');
        return;
    }

    const canvas = this.worldMapCanvas;
    if (!canvas) return;
    
    // Fallback to basic interactions if TravelSystem is not available
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let mapOffsetX = 0;
    let mapOffsetY = 0;
    let zoomLevel = 1;
    
    // Mouse events
    EventManager.addEventListener(canvas, 'mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX - mapOffsetX;
        dragStartY = e.clientY - mapOffsetY;
        canvas.style.cursor = 'grabbing';
    });
    
    EventManager.addEventListener(canvas, 'mousemove', (e) => {
        if (!isDragging) return;
        
        mapOffsetX = e.clientX - dragStartX;
        mapOffsetY = e.clientY - dragStartY;
        
        // Limit panning
        const maxOffset = 100 * zoomLevel;
        mapOffsetX = Math.max(-maxOffset, Math.min(maxOffset, mapOffsetX));
        mapOffsetY = Math.max(-maxOffset, Math.min(maxOffset, mapOffsetY));
        
        this.renderWorldMap();
    });
    
    EventManager.addEventListener(canvas, 'mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });
    
    EventManager.addEventListener(canvas, 'click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to world coordinates
        const worldX = (x - mapOffsetX) / zoomLevel;
        const worldY = (y - mapOffsetY) / zoomLevel;
        
        this.handleMapClick(worldX, worldY, e);
    });
    
    // Store map state
    this.mapState = {
        offsetX: mapOffsetX,
        offsetY: mapOffsetY,
        zoomLevel: zoomLevel
    };
};

// Handle map clicks
game.handleMapClick = function(x, y, event) {
    // If TravelSystem exists, delegate to it for proper location detection
    if (typeof TravelSystem !== 'undefined' && TravelSystem.handleClick) {
        const rect = this.worldMapCanvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Create a synthetic mouse event for TravelSystem
        const syntheticEvent = {
            clientX: event.clientX,
            clientY: event.clientY,
            preventDefault: () => {},
            target: this.worldMapCanvas
        };
        
        TravelSystem.handleClick(syntheticEvent);
        return;
    }
    
    // Fallback to basic location detection
    const locations = Object.values(GameWorld.locations);
    const clickRadius = 20 / this.mapState.zoomLevel;
    
    for (const location of locations) {
        // Simple distance check (would need proper world coordinates in a real implementation)
        const distance = Math.sqrt(
            Math.pow(x - location.x || 0, 2) +
            Math.pow(y - location.y || 0, 2)
        );
        
        if (distance < clickRadius) {
            // Show location details
            this.showLocationDetails(location);
            return;
        }
    }
    
    // If no location clicked, hide details
    this.hideLocationDetails();
};

// Show location details
game.showLocationDetails = function(location) {
    const detailsPanel = document.getElementById('overlay-location-details');
    if (!detailsPanel) return;
    
    // 🖤 XSS fix: use data attribute instead of inline onclick
    detailsPanel.innerHTML = `
        <h3>${location.name}</h3>
        <div class="location-type">${location.type}</div>
        <div class="description">${location.description}</div>
        <div class="location-info">
            <p><strong>Population:</strong> ${location.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${GameWorld.regions[location.region].name}</p>
            <p><strong>Specialties:</strong> ${location.specialties.join(', ')}</p>
        </div>
        <div class="travel-info">
            <p><strong>Travel Cost:</strong> ${GameWorld.calculateTravelCost(game.currentLocation.id, location.id)} gold</p>
            <p><strong>Travel Time:</strong> ${GameWorld.calculateTravelTime(game.currentLocation.id, location.id)} minutes</p>
        </div>
        <button class="travel-btn" data-location-id="${escapeHtml(location.id)}">Travel Here</button>
    `;
    // 💀 Attach travel button event listener safely
    const travelBtn = detailsPanel.querySelector('.travel-btn');
    if (travelBtn) travelBtn.onclick = () => game.travelToLocation(travelBtn.dataset.locationId);

    detailsPanel.classList.remove('hidden');
};

// Hide location details
game.hideLocationDetails = function() {
    const detailsPanel = document.getElementById('overlay-location-details');
    if (detailsPanel) {
        detailsPanel.classList.add('hidden');
    }
};

// Travel to location from map
game.travelToLocation = function(locationId) {
    if (GameWorld.travelTo(locationId)) {
        this.hideOverlay('world-map-overlay');
        this.hideLocationDetails();
    }
};

// Zoom map
game.zoomMap = function(factor) {
    this.mapState.zoomLevel *= factor;
    this.mapState.zoomLevel = Math.max(0.5, Math.min(3, this.mapState.zoomLevel));
    this.renderWorldMap();
};

// Reset map view
game.resetMapView = function() {
    this.mapState.zoomLevel = 1;
    this.mapState.offsetX = 0;
    this.mapState.offsetY = 0;
    this.centerMapOnPlayer();
};

// Center map on player
game.centerMapOnPlayer = function() {
    if (!game.currentLocation) return;
    
    // Simple centering (would need proper world coordinates)
    this.mapState.offsetX = 0;
    this.mapState.offsetY = 0;
    this.renderWorldMap();
};

// Render world map
game.renderWorldMap = function() {
    // Use GameWorldRenderer for HTML-based map rendering
    if (typeof GameWorldRenderer !== 'undefined') {
        // Update map state to match GameWorldRenderer
        if (GameWorldRenderer.mapState) {
            this.mapState = {
                offsetX: GameWorldRenderer.mapState.offsetX,
                offsetY: GameWorldRenderer.mapState.offsetY,
                zoomLevel: GameWorldRenderer.mapState.zoom
            };
        }
        GameWorldRenderer.render();
        return;
    }

    // Also update TravelPanelMap if available
    if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
        TravelPanelMap.render();
    }
};

// Draw map grid
game.drawMapGrid = function(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
};

// Draw map locations
game.drawMapLocations = function(ctx, width, height) {
    const locations = Object.values(GameWorld.locations);

    locations.forEach(location => {
        // Use actual map coordinates
        const x = location.mapPosition?.x || width / 2;
        const y = location.mapPosition?.y || height / 2;

        // Draw location marker based on type and size
        const markerSize = location.type === 'city' ? 12 : location.type === 'town' ? 9 : 6;

        ctx.fillStyle = this.getLocationColor(location.type);
        ctx.beginPath();
        ctx.arc(x, y, markerSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw border for visited locations
        if (GameWorld.visitedLocations.includes(location.id)) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw location name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(location.name, x, y - markerSize - 5);

        // Draw population indicator
        ctx.font = '10px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Pop: ${location.population}`, x, y + markerSize + 12);
    });
};

// Get location color by type
game.getLocationColor = function(type) {
    const colors = {
        village: '#4ECDC4',
        town: '#4FC3F7',
        city: '#FF6B6B'
    };
    return colors[type] || '#888888';
};

// Draw map paths
game.drawMapPaths = function(ctx, width, height) {
    const locations = Object.values(GameWorld.locations);
    const drawn = new Set(); // Track drawn connections to avoid duplicates

    locations.forEach(location => {
        if (location.connections && location.mapPosition) {
            const x1 = location.mapPosition.x;
            const y1 = location.mapPosition.y;

            location.connections.forEach(connectionId => {
                const connectedLocation = GameWorld.locations[connectionId];
                if (connectedLocation && connectedLocation.mapPosition) {
                    const connectionKey = [location.id, connectionId].sort().join('-');

                    // Only draw each connection once
                    if (!drawn.has(connectionKey)) {
                        drawn.add(connectionKey);

                        const x2 = connectedLocation.mapPosition.x;
                        const y2 = connectedLocation.mapPosition.y;

                        // Draw road/path
                        ctx.strokeStyle = GameWorld.visitedLocations.includes(connectionId) && GameWorld.visitedLocations.includes(location.id)
                            ? 'rgba(255, 215, 0, 0.5)' // Gold for explored paths
                            : 'rgba(255, 255, 255, 0.2)'; // Faint white for unexplored

                        ctx.lineWidth = 3;
                        ctx.lineCap = 'round';

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();

                        // Draw dashed overlay for style
                        ctx.setLineDash([5, 5]);
                        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            });
        }
    });
};

// Draw player position
game.drawPlayerPosition = function(ctx) {
    if (!game.currentLocation) return;

    const location = GameWorld.locations[game.currentLocation.id];
    if (!location || !location.mapPosition) return;

    const x = location.mapPosition.x;
    const y = location.mapPosition.y;

    // Draw pulsing circle effect
    const time = Date.now() / 500;
    const pulse = Math.sin(time) * 2 + 8;

    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.fill();

    // Draw player marker
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw player icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑', x, y);
};

// Show overlay
game.showOverlay = function(overlayId) {
    console.log(`🖤 showOverlay called for: ${overlayId}`);
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        console.log(`🖤 found element, classes before:`, overlay.className);
        overlay.classList.remove('hidden');
        overlay.classList.add('active');
        console.log(`🖤 classes after:`, overlay.className);

        // Special handling for world map overlay
        if (overlayId === 'world-map-overlay') {
            // Use GameWorldRenderer for HTML-based map rendering
            if (typeof GameWorldRenderer !== 'undefined') {
                if (!GameWorldRenderer.mapElement) {
                    GameWorldRenderer.init();
                }
                GameWorldRenderer.render();
                if (typeof GameWorldRenderer.focusOnPlayer === 'function') {
                    GameWorldRenderer.focusOnPlayer();
                }
                console.log('GameWorldRenderer rendered on world map overlay show');
            }

            this.centerMapOnPlayer();
            this.renderWorldMap();
        }
    }
};

// Hide overlay
game.hideOverlay = function(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
    }
};

// Hide all overlays (except character creation - that's sacred)
game.hideAllOverlays = function() {
    const overlays = document.querySelectorAll('#overlay-container > .overlay');
    overlays.forEach(overlay => {
        // NEVER hide character creation - the void awaits those who do
        if (overlay.id === 'character-creation-overlay') return;
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
    });
};

// Toggle overlay
game.toggleOverlay = function(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        if (overlay.classList.contains('hidden')) {
            this.showOverlay(overlayId);
        } else {
            this.hideOverlay(overlayId);
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// 🖤 GLOBAL EXPORTS - expose functions for onclick handlers
// ═══════════════════════════════════════════════════════════════
// These must be at the end to ensure all functions are defined
window.startNewGame = startNewGame;
window.loadGame = loadGame;
window.showSettings = showSettings;
window.createCharacter = createCharacter;
window.randomizeCharacter = randomizeCharacter;
console.log('🖤 game.js global exports complete - startNewGame:', typeof startNewGame);

// ═══════════════════════════════════════════════════════════════
// 🚗 TRANSPORTATION SYSTEM NOTES - why we did it this way
// ═══════════════════════════════════════════════════════════════
// (yes i know medieval people didn't have cars, it's a metaphor)
// - Each transportation option has realistic carry weights in pounds
// - Speed modifiers affect travel time between locations
// - Some transportation requires animals (wagons need horses, donkeys, or oxen)
// - Players can own multiple transportation options and switch between them
// - Current load is calculated based on item weights in inventory
