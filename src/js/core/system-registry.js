// ═══════════════════════════════════════════════════════════════
// SYSTEM REGISTRY - centralized access to game systems
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// instead of 869 `typeof !== 'undefined'` checks scattered everywhere
// use this registry to safely access any system - like a phone book
// for game systems, look them up without fear of the void

const SystemRegistry = {
    // cache of system references for faster access
    // because querying window[] 60 times per second is how we summon the lag demon
    _cache: new Map(),

    // track which systems have been accessed (for debooging)
    _accessLog: [],

    // whether to log access attempts (disable in production or suffer console spam)
    _deboogerMode: false,

    // ═══════════════════════════════════════════════════════════════════════
    // CORE METHODS - The dark API
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * check if a system exists and is available
     * @param {string} name - System name (e.g., 'TimeSystem', 'game', 'TravelSystem')
     * @returns {boolean} - True if system exists
     */
    has(name) {
        // hit the cache first - faster than window lookups
        if (this._cache.has(name)) {
            return this._cache.get(name) !== null;
        }

        // check if it's alive in the window object
        const exists = typeof window[name] !== 'undefined' && window[name] !== null;
        this._cache.set(name, exists ? window[name] : null);

        if (this._deboogerMode) {
            this._accessLog.push({ name, exists, time: Date.now() });
        }

        return exists;
    },

    /**
     * Get a system safely (returns null if not available)
     * @param {string} name - System name
     * @returns {Object|null} - The system or null
     */
    get(name) {
        // try the cache before we go digging
        if (this._cache.has(name)) {
            return this._cache.get(name);
        }

        // find it and stash it for next time
        const system = typeof window[name] !== 'undefined' ? window[name] : null;
        this._cache.set(name, system);

        return system;
    },

    /**
     * Get a system or throw if not available
     * @param {string} name - System name
     * @returns {Object} - The system
     * @throws {Error} - If system not found
     */
    require(name) {
        const system = this.get(name);
        if (!system) {
            throw new Error(`🖤 SystemRegistry: Required system "${name}" not found!`);
        }
        return system;
    },

    /**
     * Execute a callback if a system exists
     * @param {string} name - System name
     * @param {Function} callback - Function to call with system as argument
     * @param {*} [fallback] - Value to return if system doesn't exist
     * @returns {*} - Result of callback or fallback
     */
    ifExists(name, callback, fallback = undefined) {
        const system = this.get(name);
        if (system) {
            return callback(system);
        }
        return fallback;
    },

    /**
     * Execute a method on a system if it exists
     * @param {string} systemName - System name
     * @param {string} methodName - Method to call
     * @param {...*} args - Arguments to pass
     * @returns {*} - Result or undefined
     */
    call(systemName, methodName, ...args) {
        const system = this.get(systemName);
        if (system && typeof system[methodName] === 'function') {
            return system[methodName](...args);
        }
        return undefined;
    },

    /**
     * Check multiple systems at once
     * @param {...string} names - System names to check
     * @returns {boolean} - True if ALL systems exist
     */
    hasAll(...names) {
        return names.every(name => this.has(name));
    },

    /**
     * Check if any of the systems exist
     * @param {...string} names - System names to check
     * @returns {boolean} - True if ANY system exists
     */
    hasAny(...names) {
        return names.some(name => this.has(name));
    },

    /**
     * Get multiple systems as an object
     * @param {...string} names - System names
     * @returns {Object} - Object with system names as keys
     */
    getAll(...names) {
        const result = {};
        for (const name of names) {
            result[name] = this.get(name);
        }
        return result;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CONVENIENCE METHODS - Common system access patterns
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get the game object safely
     * @returns {Object|null}
     */
    get game() {
        return this.get('game');
    },

    /**
     * Get the game object or throw - use when game MUST exist
     * @returns {Object}
     * @throws {Error} If game is not registered
     */
    requireGame() {
        const game = this.get('game');
        if (!game) {
            throw new Error('🖤 SystemRegistry: game not registered! Call SystemRegistry.register("game", game) first.');
        }
        return game;
    },

    /**
     * Get the player object safely
     * @returns {Object|null}
     */
    get player() {
        const game = this.game;
        return game?.player || null;
    },

    /**
     * Get the player object or throw - use when player MUST exist
     * @returns {Object}
     * @throws {Error} If player is not available
     */
    requirePlayer() {
        const game = this.requireGame();
        if (!game.player) {
            throw new Error('🦇 SystemRegistry: player not initialized! Ensure game.player exists before calling.');
        }
        return game.player;
    },

    /**
     * Get TimeSystem safely
     * @returns {Object|null}
     */
    get time() {
        return this.get('TimeSystem');
    },

    /**
     * Get TravelSystem safely
     * @returns {Object|null}
     */
    get travel() {
        return this.get('TravelSystem');
    },

    /**
     * Get GameWorld safely
     * @returns {Object|null}
     */
    get world() {
        return this.get('GameWorld');
    },

    /**
     * Get AudioManager safely
     * @returns {Object|null}
     */
    get audio() {
        return this.get('AudioManager') || this.get('AudioSystem');
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STATE CHANGE TRACKING - Know what changed and when
    // ═══════════════════════════════════════════════════════════════════════

    // Change history for debugging and replay
    _changeHistory: [],
    _maxChangeHistory: 200,
    _changeTrackingEnabled: false,

    /**
     * Track a state change in any system
     * @param {string} systemName - System that changed (e.g., 'player', 'inventory')
     * @param {string} property - Property that changed (e.g., 'gold', 'health')
     * @param {*} oldValue - Previous value
     * @param {*} newValue - New value
     * @param {string} [reason] - Why it changed (e.g., 'market_buy', 'combat_damage')
     */
    trackChange(systemName, property, oldValue, newValue, reason = 'unknown') {
        if (!this._changeTrackingEnabled) return;

        const change = {
            system: systemName,
            property,
            oldValue: this._safeClone(oldValue),
            newValue: this._safeClone(newValue),
            reason,
            timestamp: Date.now(),
            stack: this._getCallStack()
        };

        this._changeHistory.push(change);

        // Keep history bounded
        while (this._changeHistory.length > this._maxChangeHistory) {
            this._changeHistory.shift();
        }

        // Emit change event for interested listeners
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('system:state:changed', change);
        }
    },

    /**
     * Safe clone for tracking - handles circular refs and complex objects
     * @param {*} value - Value to clone
     * @returns {*} Cloned value or string representation
     */
    _safeClone(value) {
        if (value === null || value === undefined) return value;
        if (typeof value !== 'object') return value;

        try {
            // For simple objects, deep clone
            if (Array.isArray(value)) {
                return value.length > 10
                    ? `[Array(${value.length})]`
                    : JSON.parse(JSON.stringify(value));
            }

            // For objects, try to clone or stringify
            const keys = Object.keys(value);
            if (keys.length > 10) {
                return `{Object(${keys.length} keys)}`;
            }
            return JSON.parse(JSON.stringify(value));
        } catch (e) {
            // Circular reference or other issue
            return `[${typeof value}]`;
        }
    },

    /**
     * Get simplified call stack for debugging
     * @returns {string} First 3 lines of stack
     */
    _getCallStack() {
        try {
            const stack = new Error().stack;
            const lines = stack.split('\n').slice(3, 6); // Skip Error, trackChange, caller
            return lines.map(l => l.trim()).join(' <- ');
        } catch (e) {
            return 'stack unavailable';
        }
    },

    /**
     * Enable state change tracking
     */
    enableChangeTracking() {
        this._changeTrackingEnabled = true;
        console.log('🖤 SystemRegistry: Change tracking enabled');
    },

    /**
     * Disable state change tracking
     */
    disableChangeTracking() {
        this._changeTrackingEnabled = false;
        console.log('🖤 SystemRegistry: Change tracking disabled');
    },

    /**
     * Get change history
     * @param {string} [systemFilter] - Optional system name to filter by
     * @param {string} [propertyFilter] - Optional property name to filter by
     * @returns {Array} Filtered change history
     */
    getChangeHistory(systemFilter = null, propertyFilter = null) {
        let history = [...this._changeHistory];

        if (systemFilter) {
            history = history.filter(c => c.system === systemFilter);
        }
        if (propertyFilter) {
            history = history.filter(c => c.property === propertyFilter);
        }

        return history;
    },

    /**
     * Get recent changes (last N)
     * @param {number} count - Number of changes to return
     * @returns {Array} Recent changes
     */
    getRecentChanges(count = 10) {
        return this._changeHistory.slice(-count);
    },

    /**
     * Clear change history
     */
    clearChangeHistory() {
        this._changeHistory = [];
    },

    /**
     * Print change history to console (debooger tool)
     * @param {number} count - Number of recent changes to print
     */
    printChanges(count = 20) {
        console.log('🖤 SystemRegistry Change History:');
        const changes = this.getRecentChanges(count);
        changes.forEach((c, i) => {
            const time = new Date(c.timestamp).toLocaleTimeString();
            console.log(`  ${i + 1}. [${time}] ${c.system}.${c.property}: ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)} (${c.reason})`);
        });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CACHE MANAGEMENT - Keep the darkness fresh
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Clear the cache (call after systems are reloaded)
     */
    clearCache() {
        this._cache.clear();
        console.log('🖤 SystemRegistry: Cache cleared');
    },

    /**
     * Invalidate a specific system in cache
     * @param {string} name - System name to invalidate
     */
    invalidate(name) {
        this._cache.delete(name);
    },

    /**
     * Register a system manually (useful for dynamic systems)
     * @param {string} name - System name
     * @param {Object} system - System object
     */
    register(name, system) {
        window[name] = system;
        this._cache.set(name, system);
        console.log(`🖤 SystemRegistry: Registered "${name}"`);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DEBOOGER METHODS - Peer into the void
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Enable debooger mode (logs all access attempts)
     */
    enableDebooger() {
        this._deboogerMode = true;
        console.log('🖤 SystemRegistry: Debooger mode enabled 🖤');
    },

    /**
     * Disable debooger mode
     */
    disableDebooger() {
        this._deboogerMode = false;
        console.log('🖤 SystemRegistry: Debooger mode disabled 🖤');
    },

    /**
     * Get access log (debooger mode only)
     * @returns {Array}
     */
    getAccessLog() {
        return [...this._accessLog];
    },

    /**
     * List all registered/cached systems
     * @returns {Array<string>}
     */
    listCached() {
        return Array.from(this._cache.keys());
    },

    /**
     * Get stats about cache usage
     * @returns {Object}
     */
    getStats() {
        let available = 0;
        let unavailable = 0;

        for (const [name, system] of this._cache) {
            if (system) available++;
            else unavailable++;
        }

        return {
            cached: this._cache.size,
            available,
            unavailable,
            accessLogSize: this._accessLog.length,
            changeTrackingEnabled: this._changeTrackingEnabled,
            changeHistorySize: this._changeHistory.length
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SHORTHAND ALIAS - For the lazy dark coders
// ═══════════════════════════════════════════════════════════════════════════

// Short alias: Sys.has('TimeSystem') instead of SystemRegistry.has('TimeSystem')
const Sys = SystemRegistry;

// ═══════════════════════════════════════════════════════════════════════════
// EXPOSE GLOBALLY - Let the darkness spread
// ═══════════════════════════════════════════════════════════════════════════

window.SystemRegistry = SystemRegistry;
window.Sys = Sys;

console.log('🖤 SystemRegistry loaded - safe system access enabled');
