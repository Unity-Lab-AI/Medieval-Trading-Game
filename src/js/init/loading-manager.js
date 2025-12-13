// ═══════════════════════════════════════════════════════════════
// LOADING MANAGER - shows real system names as they load
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const LoadingManager = {
    // Loading tips - helpful hints while you wait
    LOADING_TIPS: [
        "Buy low, sell high. It's not rocket science... but it is economics.",
        "Hunger and thirst decay over time. Don't forget to eat and drink!",
        "Press SPACE to pause time when you need to think.",
        "Talk to NPCs - they might have quests, items, or just sass.",
        "Different cities have different prices. Arbitrage is your friend.",
        "Check the weather - it affects travel time and your mood.",
        "Doom World has 2x stat drain. Pack extra food.",
        "Reputation matters. NPCs remember how you treat them.",
        "Properties generate passive income while you adventure.",
        "The debooger console (if enabled) lets you test features.",
        "Save often. The void claims the unprepared.",
        "Gatehouses control access to new zones. Bring gold.",
        "Companions can join you in combat. Find them in taverns.",
        "Market prices fluctuate with events and time of day.",
        "Your carrying capacity depends on your transport.",
        "Press I for inventory, M for market, T for travel.",
        "Seasonal changes affect prices and NPC behavior.",
        "Night time is dangerous. Some NPCs only appear after dark.",
        "Trade routes can automate your merchant empire.",
        "Achievements unlock bragging rights and nothing else.",
    ],
    _currentTipIndex: 0,
    _tipTimer: null,

    // Final system check - multiple indicators that game is ready
    finalCheck: () => {
        // Audio preloads in background - don't block game start for music
        // Players can start playing immediately, audio fades in when ready

        // Primary: window.startNewGame is set at end of game.js
        if (typeof window.startNewGame === 'function') {
            return true;
        }
        // Secondary: Bootstrap.initialized is set after all systems init
        if (typeof Bootstrap !== 'undefined' && Bootstrap.initialized === true) {
            return true;
        }
        // Tertiary: game object + GameWorld both exist
        if (typeof game !== 'undefined' && typeof GameWorld !== 'undefined') {
            return true;
        }
        return false;
    },

    // Real systems to check - maps display name to window object name
    SYSTEMS_TO_CHECK: [
        { display: 'Game Configuration', check: 'GameConfig' },
        { display: 'Event Bus', check: 'EventBus' },
        { display: 'Event Manager', check: 'EventManager' },
        { display: 'Timer Manager', check: 'TimerManager' },
        { display: 'Item Database', check: 'ItemDatabase' },
        { display: 'Game World', check: 'GameWorld' },
        { display: 'Combat System', check: 'CombatSystem' },
        { display: 'Trading System', check: 'TradingSystem' },
        { display: 'Dynamic Market', check: 'DynamicMarketSystem' },
        { display: 'NPC Manager', check: 'NPCManager' },
        { display: 'NPC Dialogue', check: 'NPCDialogueSystem' },
        { display: 'Quest System', check: 'QuestSystem' },
        { display: 'Achievement System', check: 'AchievementSystem' },
        { display: 'Travel System', check: 'TravelSystem' },
        { display: 'Mount System', check: 'MountSystem' },
        { display: 'Ship System', check: 'ShipSystem' },
        { display: 'Property System', check: 'PropertySystem' },
        { display: 'Crafting System', check: 'CraftingSystem' },
        { display: 'Skill System', check: 'SkillSystem' },
        { display: 'Inventory Panel', check: 'InventoryPanel' },
        { display: 'Equipment Panel', check: 'EquipmentPanel' },
        { display: 'Panel Manager', check: 'PanelManager' },
        { display: 'World Renderer', check: 'GameWorldRenderer' },
        { display: 'Weather System', check: 'WeatherSystem' },
        { display: 'Day/Night Cycle', check: 'DayNightCycle' },
        { display: 'Audio System', check: 'MusicSystem' },
        { display: 'Save System', check: 'SaveLoadSystem' },
        { display: 'Game Engine', check: 'game' },
    ],

    // State
    progress: 0,
    targetProgress: 0,
    isComplete: false,
    isReady: false,
    _displayDone: false,
    animationFrame: null,
    startTime: 0,
    maxWaitTime: 20000,
    _currentSystem: 0,
    _displayTimer: null,

    // Start the loading display
    init() {
        console.log('🖤 LoadingManager: Starting system checks...');
        this.startTime = Date.now();
        this.progress = 0;
        this.targetProgress = 0;
        this._currentSystem = 0;
        this._displayDone = false;

        // Show first system immediately
        this.showSystem(0);

        // Show first tip and start rotation
        this._currentTipIndex = Math.floor(Math.random() * this.LOADING_TIPS.length);
        this.showTip();
        this._tipTimer = setInterval(() => this.showTip(), 3000);

        // Start smooth animation loop
        this.animate();

        // Move to next system every 100ms
        this._displayTimer = setInterval(() => {
            this._currentSystem++;
            if (this._currentSystem >= this.SYSTEMS_TO_CHECK.length) {
                this._displayDone = true;
                clearInterval(this._displayTimer);
            } else {
                this.showSystem(this._currentSystem);
            }
        }, 100);

        // Check for final game readiness
        this.checkInterval = setInterval(() => this.checkReady(), 100);
    },

    // Show a loading tip
    showTip() {
        const tipEl = document.getElementById('loading-tip');
        if (tipEl) {
            tipEl.style.opacity = '0';
            setTimeout(() => {
                tipEl.textContent = '💡 ' + this.LOADING_TIPS[this._currentTipIndex];
                tipEl.style.opacity = '1';
                this._currentTipIndex = (this._currentTipIndex + 1) % this.LOADING_TIPS.length;
            }, 200);
        }
    },

    // Show a specific system's loading status
    showSystem(index) {
        const total = this.SYSTEMS_TO_CHECK.length;
        const sys = this.SYSTEMS_TO_CHECK[index];
        const isLoaded = typeof window[sys.check] !== 'undefined';

        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');

        // Update title with system name and status
        if (titleEl) {
            titleEl.textContent = isLoaded ? (sys.display + ' ✓') : ('Loading ' + sys.display + '...');
        }

        // Update counter
        if (statusEl) {
            statusEl.textContent = (index + 1) + ' of ' + total + ' systems';
        }

        // Update progress
        this.targetProgress = ((index + 1) / total) * 95;
    },

    // Smooth animation for progress bar
    animate() {
        if (this.isComplete) return;

        // Only complete when BOTH display is done AND game is ready
        if (this._displayDone && this.isReady) {
            this.targetProgress = 100;
        }

        // Smoothly interpolate current progress toward target
        const diff = this.targetProgress - this.progress;
        this.progress += diff * 0.2;

        // Snap to 100 when close enough
        if (this._displayDone && this.isReady && this.progress > 99) {
            this.progress = 100;
        }

        // Update progress bar
        const fill = document.getElementById('loading-progress-fill');
        if (fill) {
            fill.style.width = Math.round(this.progress) + '%';
        }

        // Complete when we hit 100%
        if (this.progress >= 100 && !this.isComplete) {
            // Show final message
            const titleEl = document.getElementById('loading-title');
            const statusEl = document.getElementById('loading-status');
            if (titleEl) titleEl.textContent = 'Ready to trade!';
            if (statusEl) statusEl.textContent = `All ${this.SYSTEMS_TO_CHECK.length} systems ready`;

            setTimeout(() => this.complete(), 300);
            return;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Check if game is ready (but don't stop display)
    checkReady() {
        if (this.isReady) return;

        try {
            if (this.finalCheck()) {
                console.log('🖤 LoadingManager: Game systems ready!');
                this.isReady = true;
                clearInterval(this.checkInterval);
                // Don't stop display timer - let it finish showing all systems
            }
        } catch (e) {
            console.warn('🖤 LoadingManager: Check error:', e.message);
        }

        // Timeout fallback
        const elapsed = Date.now() - this.startTime;
        if (elapsed > this.maxWaitTime && !this.isReady) {
            console.warn(`🖤 LoadingManager: Timeout after ${elapsed}ms. Force-completing...`);
            this.isReady = true;
            this._displayDone = true;
            clearInterval(this.checkInterval);
            clearInterval(this._displayTimer);
        }
    },

    // Update UI helper (called during init)
    updateUI(progress) {
        const fill = document.getElementById('loading-progress-fill');
        if (fill) {
            fill.style.width = progress + '%';
        }
    },

    // Loading complete - show the menu
    complete() {
        if (this.isComplete) return;
        this.isComplete = true;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        clearInterval(this.checkInterval);
        clearInterval(this._displayTimer);
        clearInterval(this._tipTimer);

        const elapsed = Date.now() - this.startTime;
        console.log(`🖤 LoadingManager: Everything loaded in ${elapsed}ms!`);

        // 🖤 Ensure UI shows 100%
        this.updateUI(100);

        // 🌙 Brief pause at 100%, then transition to menu
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const mainMenu = document.getElementById('main-menu');

            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (mainMenu) mainMenu.classList.remove('hidden');

            // 🌦️ Start menu weather effects
            if (typeof MenuWeatherSystem !== 'undefined' && MenuWeatherSystem.init) {
                MenuWeatherSystem.init();
            }

            console.log('🖤 LoadingManager: Main menu revealed. Let the games begin.');
        }, 500);
    },

    // 🔧 Debooger helper 💀
    deboogerStatus() {
        console.log('🖤 LoadingManager Debooger 🖤:');
        console.log(`  Progress: ${this.progress.toFixed(1)}%`);
        console.log(`  Target: ${this.targetProgress.toFixed(1)}%`);
        console.log(`  Ready: ${this.isReady}`);
        console.log(`  Elapsed: ${Date.now() - this.startTime}ms`);
        console.log(`  startNewGame: ${typeof startNewGame}`);
        console.log(`  window.startNewGame: ${typeof window.startNewGame}`);
    }
};

// register with Bootstrap (Bootstrap loads first now, so it always exists)
Bootstrap.register('LoadingManager', () => LoadingManager.init(), {
    dependencies: [],
    priority: 1,  // very early, handles loading screen
    severity: 'required'
});

window.LoadingManager = LoadingManager;
console.log('🖤 LoadingManager loaded');
