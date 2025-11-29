// ═══════════════════════════════════════════════════════════════════════════
// 🖤 SYSTEM REGISTRY - Centralized access to game systems
// ═══════════════════════════════════════════════════════════════════════════
// File Version: 0.81
// Made by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════════════════
// Instead of 869 `typeof !== 'undefined'` checks scattered everywhere,
// use this registry to safely access any system. It's like a phone book
// for game systems - look them up without fear of the void.
// ═══════════════════════════════════════════════════════════════════════════

const SystemRegistry = {
    // 🖤 Cache of system references for faster access
    _cache: new Map(),

    // 🗡️ Track which systems have been accessed (for debugging)
    _accessLog: [],

    // ⚰️ Whether to log access attempts (disable in production)
    _debugMode: false,

    // ═══════════════════════════════════════════════════════════════════════
    // 💀 CORE METHODS - The dark API
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Check if a system exists and is available
     * @param {string} name - System name (e.g., 'TimeSystem', 'game', 'TravelSystem')
     * @returns {boolean} - True if system exists
     */
    has(name) {
        // 🦇 Check cache first
        if (this._cache.has(name)) {
            return this._cache.get(name) !== null;
        }

        // 🗡️ Check window object
        const exists = typeof window[name] !== 'undefined' && window[name] !== null;
        this._cache.set(name, exists ? window[name] : null);

        if (this._debugMode) {
            this._accessLog.push({ name, exists, time: Date.now() });
        }

        return exists;
    },

    /**
     * 🦇 Get a system safely (returns null if not available)
     * @param {string} name - System name
     * @returns {Object|null} - The system or null
     */
    get(name) {
        // ⚰️ Check cache
        if (this._cache.has(name)) {
            return this._cache.get(name);
        }

        // 🌙 Look up and cache
        const system = typeof window[name] !== 'undefined' ? window[name] : null;
        this._cache.set(name, system);

        return system;
    },

    /**
     * 💀 Get a system or throw if not available
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
     * 🌙 Execute a callback if a system exists
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
     * 🔮 Execute a method on a system if it exists
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
     * 🗡️ Check multiple systems at once
     * @param {...string} names - System names to check
     * @returns {boolean} - True if ALL systems exist
     */
    hasAll(...names) {
        return names.every(name => this.has(name));
    },

    /**
     * 🦇 Check if any of the systems exist
     * @param {...string} names - System names to check
     * @returns {boolean} - True if ANY system exists
     */
    hasAny(...names) {
        return names.some(name => this.has(name));
    },

    /**
     * ⚰️ Get multiple systems as an object
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
    // 🔮 CONVENIENCE METHODS - Common system access patterns
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Get the game object safely
     * @returns {Object|null}
     */
    get game() {
        return this.get('game');
    },

    /**
     * 🦇 Get the player object safely
     * @returns {Object|null}
     */
    get player() {
        const game = this.game;
        return game?.player || null;
    },

    /**
     * 🗡️ Get TimeSystem safely
     * @returns {Object|null}
     */
    get time() {
        return this.get('TimeSystem');
    },

    /**
     * ⚰️ Get TravelSystem safely
     * @returns {Object|null}
     */
    get travel() {
        return this.get('TravelSystem');
    },

    /**
     * 🌙 Get GameWorld safely
     * @returns {Object|null}
     */
    get world() {
        return this.get('GameWorld');
    },

    /**
     * 💀 Get AudioManager safely
     * @returns {Object|null}
     */
    get audio() {
        return this.get('AudioManager') || this.get('AudioSystem');
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 🌙 CACHE MANAGEMENT - Keep the darkness fresh
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Clear the cache (call after systems are reloaded)
     */
    clearCache() {
        this._cache.clear();
        console.log('🖤 SystemRegistry: Cache cleared');
    },

    /**
     * 🦇 Invalidate a specific system in cache
     * @param {string} name - System name to invalidate
     */
    invalidate(name) {
        this._cache.delete(name);
    },

    /**
     * 🗡️ Register a system manually (useful for dynamic systems)
     * @param {string} name - System name
     * @param {Object} system - System object
     */
    register(name, system) {
        window[name] = system;
        this._cache.set(name, system);
        console.log(`🖤 SystemRegistry: Registered "${name}"`);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ⚰️ DEBUG METHODS - Peer into the void
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 💀 Enable debug mode (logs all access attempts)
     */
    enableDebug() {
        this._debugMode = true;
        console.log('🖤 SystemRegistry: Debug mode enabled');
    },

    /**
     * 🌙 Disable debug mode
     */
    disableDebug() {
        this._debugMode = false;
    },

    /**
     * 🔮 Get access log (debug mode only)
     * @returns {Array}
     */
    getAccessLog() {
        return [...this._accessLog];
    },

    /**
     * 🖤 List all registered/cached systems
     * @returns {Array<string>}
     */
    listCached() {
        return Array.from(this._cache.keys());
    },

    /**
     * 🦇 Get stats about cache usage
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
            accessLogSize: this._accessLog.length
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 SHORTHAND ALIAS - For the lazy dark coders
// ═══════════════════════════════════════════════════════════════════════════

// 💀 Short alias: Sys.has('TimeSystem') instead of SystemRegistry.has('TimeSystem')
const Sys = SystemRegistry;

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY - Let the darkness spread
// ═══════════════════════════════════════════════════════════════════════════

window.SystemRegistry = SystemRegistry;
window.Sys = Sys;

console.log('🖤 SystemRegistry loaded - safe system access enabled');
