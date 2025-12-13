// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP.JS - the one true init system, bow before it
// ═══════════════════════════════════════════════════════════════
// Version: 1.0.0 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// This is the ONLY DOMContentLoaded handler that should exist.
// All systems register here and Bootstrap handles init order.
// No more setTimeout hacks. No more race conditions. No more chaos.
// ═══════════════════════════════════════════════════════════════

const Bootstrap = {
    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════
    initialized: false,
    loadingProgress: 0,
    errors: [],

    // registered modules waiting to init
    _registry: new Map(),
    // modules that have finished init
    _initialized: new Set(),
    // init currently in progress (prevents double-init)
    _initializing: new Set(),

    // ═══════════════════════════════════════════════════════════
    // SEVERITY LEVELS - how bad is it if this module fails?
    // ═══════════════════════════════════════════════════════════
    SEVERITY: {
        CRITICAL: 'critical',   // game won't work - abort everything
        REQUIRED: 'required',   // important but we can limp along
        OPTIONAL: 'optional'    // nice to have, silent fail ok
    },

    // default severity mappings for known modules
    MODULE_SEVERITY: {
        // critical - abort if these fail
        'EventBus': 'critical',
        'EventManager': 'critical',
        'TimerManager': 'critical',
        'GameConfig': 'critical',
        'ItemDatabase': 'critical',
        'GameWorld': 'critical',
        'game': 'critical',
        'TimeMachine': 'critical',

        // required - warn but continue
        'GoldManager': 'required',
        'PlayerStateManager': 'required',
        'TravelSystem': 'required',
        'TradingSystem': 'required',
        'QuestSystem': 'required',
        'SaveManager': 'required',
        'PanelManager': 'required',
        'CombatSystem': 'required',

        // everything else is optional by default
    },

    // ═══════════════════════════════════════════════════════════
    // REGISTRATION API - how modules sign up for init
    // ═══════════════════════════════════════════════════════════

    /**
     * Register a module for initialization
     * @param {string} name - unique module name
     * @param {Function} initFn - function to call for init (can be async)
     * @param {Object} options - configuration
     * @param {string[]} options.dependencies - modules that must init first
     * @param {string} options.severity - 'critical', 'required', or 'optional'
     * @param {number} options.priority - lower = earlier within same dependency level
     */
    register(name, initFn, options = {}) {
        if (this._registry.has(name)) {
            console.warn(`⚠️ Bootstrap: ${name} already registered, skipping duplicate`);
            return;
        }

        const config = {
            name,
            initFn,
            dependencies: options.dependencies || [],
            severity: options.severity || this.MODULE_SEVERITY[name] || 'optional',
            priority: options.priority || 100,
            timeout: options.timeout || 10000
        };

        this._registry.set(name, config);

        // if Bootstrap already ran, init this module now
        if (this.initialized) {
            console.log(`🖤 Bootstrap: Late registration for ${name}, initializing now...`);
            this._initModule(config).catch(err => {
                console.error(`🖤 Bootstrap: Late init failed for ${name}:`, err);
            });
        }
    },

    /**
     * Check if a module has been initialized
     */
    isReady(name) {
        return this._initialized.has(name);
    },

    /**
     * Wait for a module to be ready
     */
    async waitFor(name, timeout = 10000) {
        if (this._initialized.has(name)) return true;

        const start = Date.now();
        while (!this._initialized.has(name)) {
            if (Date.now() - start > timeout) {
                throw new Error(`Timeout waiting for ${name} to initialize`);
            }
            await new Promise(r => setTimeout(r, 50));
        }
        return true;
    },

    /**
     * Wait for multiple modules
     */
    async waitForAll(names, timeout = 15000) {
        await Promise.all(names.map(n => this.waitFor(n, timeout)));
        return true;
    },

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION ENGINE
    // ═══════════════════════════════════════════════════════════

    async init() {
        if (this.initialized) {
            console.warn('🖤 Bootstrap: Already initialized, ignoring duplicate call');
            return;
        }

        console.log('🖤 Bootstrap: Awakening the darkness...');
        const startTime = performance.now();

        try {
            this.showLoadingScreen();
            this.updateLoadingMessage('Preparing systems...');

            // sort modules by dependencies (topological sort)
            const sortedModules = this._resolveDependencies();
            const totalModules = sortedModules.length;

            console.log(`🖤 Bootstrap: ${totalModules} modules registered`);

            // init each module in order
            for (let i = 0; i < sortedModules.length; i++) {
                const config = sortedModules[i];
                this.updateLoadingMessage(`Initializing ${config.name}...`);

                await this._initModule(config);

                this.loadingProgress = ((i + 1) / totalModules) * 100;
                this.updateLoadingProgress();
            }

            // final setup
            await this._finalSetup();

            const elapsed = (performance.now() - startTime).toFixed(2);
            console.log(`🖤 Bootstrap: Game awakened in ${elapsed}ms`);
            console.log(`🖤 Bootstrap: ${this._initialized.size} modules initialized`);

            if (this.errors.length > 0) {
                console.warn(`🖤 Bootstrap: Completed with ${this.errors.length} errors:`, this.errors);
            }

            this.initialized = true;
            // DON'T hide loading screen here - LoadingManager handles the transition
            // to main menu with proper animation timing

            // emit ready event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('game:ready', {
                    loadTime: elapsed,
                    modulesLoaded: this._initialized.size,
                    errors: this.errors.length
                });
            }

            // dispatch game-started document event - achievement system was
            // waiting for this shit and it NEVER CAME. five fucking sessions
            // of "why are achievements firing during tutorial" and THIS
            // was one of the missing pieces. the achievement system checks
            // tutorial status on this event, so without it... chaos.
            document.dispatchEvent(new CustomEvent('game-started', {
                detail: {
                    loadTime: elapsed,
                    modulesLoaded: this._initialized.size,
                    timestamp: Date.now()
                }
            }));
            console.log('🎮 game-started event dispatched - achievement system can now check tutorial status');

        } catch (error) {
            console.error('🖤 Bootstrap: Critical failure:', error);
            this.errors.push({ type: 'critical', error });
            this.showError(error);
            throw error;
        }
    },

    /**
     * Topological sort - resolve dependencies and return init order
     */
    _resolveDependencies() {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set(); // cycle detection

        const visit = (name) => {
            if (visited.has(name)) return;
            if (visiting.has(name)) {
                console.error(`🖤 Bootstrap: Circular dependency detected involving ${name}`);
                return; // skip circular deps instead of crashing
            }

            visiting.add(name);

            const config = this._registry.get(name);
            if (config) {
                // visit dependencies first
                for (const dep of config.dependencies) {
                    if (this._registry.has(dep)) {
                        visit(dep);
                    } else {
                        // dependency not registered - might be a window global
                        if (typeof window[dep] === 'undefined') {
                            console.warn(`⚠️ Bootstrap: ${name} depends on ${dep} which isn't registered`);
                        }
                    }
                }

                visiting.delete(name);
                visited.add(name);
                sorted.push(config);
            }
        };

        // visit all registered modules
        for (const name of this._registry.keys()) {
            visit(name);
        }

        // secondary sort by priority within dependency order
        // (stable sort preserves dependency ordering)
        sorted.sort((a, b) => a.priority - b.priority);

        return sorted;
    },

    /**
     * Initialize a single module with timeout and error handling
     */
    async _initModule(config) {
        const { name, initFn, severity, timeout } = config;

        // skip if already initialized
        if (this._initialized.has(name)) {
            return;
        }

        // prevent double-init
        if (this._initializing.has(name)) {
            console.warn(`⚠️ Bootstrap: ${name} init already in progress`);
            return;
        }

        this._initializing.add(name);

        try {
            console.log(`   🔧 ${name}...`);

            // run init with timeout
            await this._runWithTimeout(initFn, timeout, name);

            this._initialized.add(name);
            console.log(`   ✅ ${name}`);

        } catch (error) {
            this.errors.push({ module: name, error, severity });

            if (severity === 'critical') {
                console.error(`   💀 CRITICAL: ${name} failed - aborting!`);
                throw error;
            } else if (severity === 'required') {
                console.error(`   ⚠️ REQUIRED: ${name} failed - continuing degraded`, error.message);
            } else {
                console.warn(`   ⏭️ OPTIONAL: ${name} failed - skipping`, error.message);
            }
        } finally {
            this._initializing.delete(name);
        }
    },

    /**
     * Run a function with timeout protection
     */
    async _runWithTimeout(fn, timeout, name) {
        return new Promise((resolve, reject) => {
            let settled = false;

            const timeoutId = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    console.warn(`   ⏰ ${name} timed out after ${timeout}ms`);
                    resolve(); // resolve anyway to continue
                }
            }, timeout);

            Promise.resolve(fn())
                .then(result => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timeoutId);
                        resolve(result);
                    }
                })
                .catch(error => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });
        });
    },

    /**
     * Final setup after all modules loaded
     */
    async _finalSetup() {
        this.updateLoadingMessage('Final preparations...');

        // hide debooger if disabled
        if (typeof GameConfig === 'undefined' || !GameConfig.debooger?.enabled) {
            const btn = document.getElementById('toggle-debooger-console');
            const console = document.getElementById('debooger-console');
            if (btn) btn.style.display = 'none';
            if (console) console.style.display = 'none';
        }

        // emit systems ready
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('bootstrap:complete', {
                modules: Array.from(this._initialized),
                errors: this.errors
            });
        }
    },

    // ═══════════════════════════════════════════════════════════
    // LOADING SCREEN UI - Uses existing HTML #loading-screen
    // LoadingManager handles the fancy progress display
    // ═══════════════════════════════════════════════════════════

    showLoadingScreen() {
        // Use existing HTML loading screen - don't create a new one
        // LoadingManager handles the progress display
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    },

    hideLoadingScreen() {
        // LoadingManager.complete() handles hiding and showing main menu
        // This is just a fallback
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    },

    updateLoadingProgress() {
        // LoadingManager handles progress bar updates
        const bar = document.getElementById('loading-progress-fill');
        if (bar) bar.style.width = `${Math.min(100, this.loadingProgress)}%`;
    },

    updateLoadingMessage(msg) {
        // Update the HTML loading screen's title
        const el = document.getElementById('loading-title');
        if (el) el.textContent = msg;
    },

    showError(error) {
        // Show error on the HTML loading screen
        const loadingTitle = document.getElementById('loading-title');
        const loadingStatus = document.getElementById('loading-status');
        if (loadingTitle) {
            loadingTitle.textContent = '💀 Failed to Load';
            loadingTitle.style.color = '#e53935';
        }
        if (loadingStatus) {
            loadingStatus.innerHTML = `${error.message || 'Unknown error'}<br><button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1rem;background:#4fc3f7;border:none;border-radius:4px;color:#1a1a2e;cursor:pointer;font-weight:bold;">Retry</button>`;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // DEBUG UTILITIES
    // ═══════════════════════════════════════════════════════════

    /**
     * Get current status for debugging
     */
    getStatus() {
        return {
            initialized: this.initialized,
            registered: Array.from(this._registry.keys()),
            completed: Array.from(this._initialized),
            pending: Array.from(this._registry.keys()).filter(k => !this._initialized.has(k)),
            errors: this.errors
        };
    },

    /**
     * Print status to console
     */
    printStatus() {
        const s = this.getStatus();
        console.log('🖤 Bootstrap Status:');
        console.log(`   Initialized: ${s.initialized}`);
        console.log(`   Registered: ${s.registered.length}`);
        console.log(`   Completed: ${s.completed.length}`);
        console.log(`   Pending: ${s.pending.length}`);
        console.log(`   Errors: ${s.errors.length}`);
        if (s.pending.length > 0) {
            console.log('   Pending modules:', s.pending);
        }
        if (s.errors.length > 0) {
            console.log('   Errors:', s.errors);
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// AUTO-START ON DOM READY
// ═══════════════════════════════════════════════════════════════
// This is THE ONLY DOMContentLoaded handler that should exist.
// All other systems should use Bootstrap.register() instead.

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // small delay to let all register() calls complete
        setTimeout(() => {
            try {
                Bootstrap.init();
            } catch (e) {
                console.error('🖤 Bootstrap.init() failed:', e);
                // Update the HTML loading screen with error
                const loadingTitle = document.getElementById('loading-title');
                const loadingStatus = document.getElementById('loading-status');
                if (loadingTitle) loadingTitle.textContent = 'ERROR: ' + e.message;
                if (loadingStatus) loadingStatus.textContent = 'Check console for details (F12)';
            }
        }, 10);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        try {
            Bootstrap.init();
        } catch (e) {
            console.error('🖤 Bootstrap.init() failed:', e);
            const loadingTitle = document.getElementById('loading-title');
            const loadingStatus = document.getElementById('loading-status');
            if (loadingTitle) loadingTitle.textContent = 'ERROR: ' + e.message;
            if (loadingStatus) loadingStatus.textContent = 'Check console for details (F12)';
        }
    }, 10);
}

// expose globally
window.Bootstrap = Bootstrap;
console.log('🖤 Bootstrap loaded - registration open');
