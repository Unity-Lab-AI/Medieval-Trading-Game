// ═══════════════════════════════════════════════════════════════
// 🖤 BOOTSTRAP.JS - The birth of the game from the void
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════
// This file orchestrates the initialization of all game systems
// in the correct order to prevent race conditions and ensure
// a smooth startup. The order matters - respect the dependencies.
// ═══════════════════════════════════════════════════════════════

const Bootstrap = {
    // Track initialization state
    initialized: false,
    loadingProgress: 0,
    errors: [],

    // Module load order - dependencies must come first
    // Each phase completes before the next begins
    LOAD_PHASES: {
        // Phase 0: Core utilities with no dependencies
        UTILITIES: [
            'EventBus',           // Event system for inter-module communication
            'EventManager',       // DOM event listener tracking
            'TimerManager',       // Timer management
        ],

        // Phase 1: Configuration and static data
        DATA: [
            'GameConfig',         // Game configuration
            'ItemDatabase',       // Item definitions
            'LocationDatabase',   // World locations (GameWorld.locations)
        ],

        // Phase 2: Core game systems
        CORE: [
            'TimeSystem',         // Time management
            'EventSystem',        // Game events (NOT DOM events)
            'GameWorld',          // World state
        ],

        // Phase 3: Player and economy systems
        SYSTEMS: [
            'game',               // Main game object
            'GoldManager',        // Currency management
            'InventorySystem',    // Player inventory
            'EquipmentSystem',    // Equipment management
            'SkillSystem',        // Skills and progression
        ],

        // Phase 4: Advanced game systems
        ADVANCED: [
            'TravelSystem',       // Travel and pathfinding
            'TradingSystem',      // Buy/sell operations
            'PropertySystem',     // Property management
            'EmployeeSystem',     // Employee management
            'CraftingSystem',     // Crafting
            'QuestSystem',        // Quests
            'AchievementSystem',  // Achievements
            'DungeonExplorationSystem', // Dungeon exploration
            'TradeRouteSystem',   // Trade routes
        ],

        // Phase 5: NPC systems
        NPC: [
            'NPCMerchantSystem',  // Merchant NPCs
            'NPCDialogueSystem',  // Dialogue generation
            'NPCVoiceChatSystem', // Voice synthesis
        ],

        // Phase 6: UI systems
        UI: [
            'PanelManager',       // Panel coordination
            'GameWorldRenderer',  // Map rendering
            'TravelPanelMap',     // Travel panel map
            'NotificationSystem', // Toast notifications
            'SettingsPanel',      // Settings UI
        ],

        // Phase 7: Persistence and audio
        PERSISTENCE: [
            'SaveLoadSystem',     // Save/load functionality
            'AudioManager',       // Sound and music
        ],

        // Phase 8: Debooger 🖤💀 (only if enabled)
        DEBOOGER: [
            'DeboogerSystem',        // Debooger console 🔮
            'PerformanceMonitor', // FPS/memory tracking 🦇
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // 🚀 MAIN INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    async init() {
        console.log('🖤 Bootstrap: Awakening the darkness...');
        const startTime = performance.now();

        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize each phase in order
            await this.initPhase('UTILITIES', 'Summoning utilities...');
            await this.initPhase('DATA', 'Loading sacred data...');
            await this.initPhase('CORE', 'Initializing core systems...');
            await this.initPhase('SYSTEMS', 'Awakening game systems...');
            await this.initPhase('ADVANCED', 'Unleashing advanced systems...');
            await this.initPhase('NPC', 'Breathing life into NPCs...');
            await this.initPhase('UI', 'Painting the interface...');
            await this.initPhase('PERSISTENCE', 'Binding to localStorage...');

            // Debooger phase 🖤💀 - only if enabled
            if (typeof GameConfig !== 'undefined' && GameConfig.debooger?.enabled) {
                await this.initPhase('DEBOOGER', 'Summoning the dark debooger from beyond the veil... 🔮⚰️🕯️');
            }

            // Final setup
            await this.finalSetup();

            const elapsed = (performance.now() - startTime).toFixed(2);
            console.log(`🖤 Bootstrap: Game awakened in ${elapsed}ms`);

            this.initialized = true;
            this.hideLoadingScreen();

            // Emit ready event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('game:ready', { loadTime: elapsed });
            }

        } catch (error) {
            console.error('🖤 Bootstrap: Failed to awaken:', error);
            this.errors.push(error);
            this.showError(error);
        }
    },

    // Initialize a single phase
    async initPhase(phaseName, message) {
        const modules = this.LOAD_PHASES[phaseName];
        if (!modules) return;

        this.updateLoadingMessage(message);
        console.log(`🖤 Bootstrap: ${message}`);

        for (const moduleName of modules) {
            await this.initModule(moduleName);
            this.loadingProgress += 100 / this.getTotalModules();
            this.updateLoadingProgress();
        }

        console.log(`✅ Phase ${phaseName} complete`);
    },

    // Initialize a single module
    async initModule(moduleName) {
        try {
            // Check if module exists
            const module = window[moduleName];

            if (!module) {
                // Module not loaded yet - this is okay, some are optional
                console.log(`   ⏭️ ${moduleName} not found (optional)`);
                return;
            }

            // Call init if it exists
            if (typeof module.init === 'function') {
                console.log(`   🔧 Initializing ${moduleName}...`);
                await module.init();
                console.log(`   ✅ ${moduleName} initialized`);
            } else {
                console.log(`   📦 ${moduleName} loaded (no init needed)`);
            }

        } catch (error) {
            console.error(`   ❌ Failed to initialize ${moduleName}:`, error);
            this.errors.push({ module: moduleName, error });
            // Continue with other modules - don't break everything
        }
    },

    // Final setup after all modules loaded
    async finalSetup() {
        this.updateLoadingMessage('Final preparations...');

        // Start the game engine if it exists
        if (typeof GameEngine !== 'undefined' && typeof GameEngine.start === 'function') {
            GameEngine.start();
        }

        // Start game loop if game object has it
        if (typeof game !== 'undefined' && typeof game.startLoop === 'function') {
            game.startLoop();
        }

        // Check for auto-load
        if (typeof SaveLoadSystem !== 'undefined' && SaveLoadSystem.hasAutoSave?.()) {
            console.log('🖤 Bootstrap: Found auto-save, will prompt to load');
        }

        // Log any errors that occurred
        if (this.errors.length > 0) {
            console.warn(`🖤 Bootstrap: Completed with ${this.errors.length} errors:`, this.errors);
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🎨 LOADING SCREEN UI
    // ═══════════════════════════════════════════════════════════

    showLoadingScreen() {
        // Check if loading screen exists in HTML
        const existingLoader = document.getElementById('bootstrap-loader');
        if (existingLoader) {
            existingLoader.style.display = 'flex';
            return;
        }

        // Create loading screen if it doesn't exist
        const loader = document.createElement('div');
        loader.id = 'bootstrap-loader';
        loader.innerHTML = `
            <div class="bootstrap-content">
                <h1 class="bootstrap-title">🖤 Medieval Trading Game</h1>
                <div class="bootstrap-progress-container">
                    <div class="bootstrap-progress-bar" id="bootstrap-progress"></div>
                </div>
                <p class="bootstrap-message" id="bootstrap-message">Awakening...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999; /* Z-INDEX STANDARD: Bootstrap loading (highest) */
            font-family: 'Segoe UI', sans-serif;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .bootstrap-content {
                text-align: center;
                color: #ecf0f1;
            }
            .bootstrap-title {
                font-size: 2rem;
                margin-bottom: 2rem;
                color: #4fc3f7;
                text-shadow: 0 0 20px rgba(79, 195, 247, 0.5);
            }
            .bootstrap-progress-container {
                width: 300px;
                height: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                margin: 0 auto 1rem;
                overflow: hidden;
            }
            .bootstrap-progress-bar {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #4fc3f7, #29b6f6);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            .bootstrap-message {
                color: rgba(255,255,255,0.6);
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loader);
    },

    hideLoadingScreen() {
        const loader = document.getElementById('bootstrap-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loader.remove(), 500);
        }
    },

    updateLoadingProgress() {
        const bar = document.getElementById('bootstrap-progress');
        if (bar) {
            bar.style.width = `${Math.min(100, this.loadingProgress)}%`;
        }
    },

    updateLoadingMessage(message) {
        const msg = document.getElementById('bootstrap-message');
        if (msg) {
            msg.textContent = message;
        }
    },

    showError(error) {
        const loader = document.getElementById('bootstrap-loader');
        if (loader) {
            const content = loader.querySelector('.bootstrap-content');
            if (content) {
                content.innerHTML = `
                    <h1 class="bootstrap-title" style="color: #e53935;">❌ Failed to Load</h1>
                    <p class="bootstrap-message">${error.message || 'Unknown error'}</p>
                    <button onclick="location.reload()" style="
                        margin-top: 1rem;
                        padding: 0.5rem 1rem;
                        background: #4fc3f7;
                        border: none;
                        border-radius: 4px;
                        color: #1a1a2e;
                        cursor: pointer;
                    ">Retry</button>
                `;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🔧 UTILITY METHODS
    // ═══════════════════════════════════════════════════════════

    getTotalModules() {
        return Object.values(this.LOAD_PHASES).reduce((sum, arr) => sum + arr.length, 0);
    },

    // Check if a specific module is ready
    isModuleReady(moduleName) {
        const module = window[moduleName];
        return module && (module.initialized || !module.init);
    },

    // Wait for a specific module to be ready
    async waitForModule(moduleName, timeout = 5000) {
        const startTime = Date.now();
        while (!this.isModuleReady(moduleName)) {
            if (Date.now() - startTime > timeout) {
                throw new Error(`Timeout waiting for ${moduleName}`);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return window[moduleName];
    }
};

// ═══════════════════════════════════════════════════════════════
// 🚀 AUTO-START DISABLED - game.js handles initialization
// ═══════════════════════════════════════════════════════════════
// 🖤 Bootstrap was interfering with game.js initialization
// The game.js file has its own DOMContentLoaded handler that properly
// calls initializeElements() and setupEventListeners()
// Bootstrap can be called manually if needed: Bootstrap.init()

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => Bootstrap.init());
// } else {
//     Bootstrap.init();
// }

// Expose globally (but don't auto-start)
window.Bootstrap = Bootstrap;
console.log('🖤 Bootstrap loaded (manual start only - game.js handles init)');
