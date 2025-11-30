// ═══════════════════════════════════════════════════════════════
// 🖤 EVENT BUS - Central nervous system of the game
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════
// 💀 The pulse of the machine - systems scream into the void here
// 🦇 No direct calls, only dark signals echoing through the network
// 🗡️ Decoupled chaos - beautiful, maintainable isolation
// ═══════════════════════════════════════════════════════════════

const EventBus = {
    // 🖤 Map of screams -> Set of ears listening
    listeners: new Map(),

    // 💀 Track event history - the digital graveyard of past signals
    history: [],
    maxHistory: 100,

    // 🦇 Whether to log events - paranoid mode for the curious
    verbose: false,

    // ═══════════════════════════════════════════════════════════
    // 📡 CORE METHODS - The dark API of communication
    // ═══════════════════════════════════════════════════════════

    /**
     * Subscribe to an event
     * @param {string} event - Event name (e.g., 'player:gold_changed')
     * @param {function} callback - Function to call when event fires
     * @returns {function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // 🗡️ Return unsubscribe function - cutting ties is sometimes necessary
        return () => this.off(event, callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - The callback to remove
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            // 💀 Clean up empty sets - no ghosts allowed
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    },

    /**
     * Subscribe to an event only once
     * @param {string} event - Event name
     * @param {function} callback - Function to call when event fires
     * @returns {function} Unsubscribe function
     */
    once(event, callback) {
        const wrappedCallback = (data) => {
            this.off(event, wrappedCallback);
            callback(data);
        };
        return this.on(event, wrappedCallback);
    },

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    emit(event, data = null) {
        // 🦇 Log if verbose - watching every whisper
        if (this.verbose) {
            console.log(`📡 EventBus: ${event}`, data);
        }

        // 💀 Add to history - documenting the chaos
        this.addToHistory(event, data);

        // 🖤 Call all listeners - spread the dark message
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    // 🦇 Event handler crashed - log for devs
                    console.warn(`❌ EventBus: Handler error for '${event}':`, error.message);
                }
            });
        }

        // 🌙 Also emit to wildcard listeners - the paranoid ones who hear everything
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback({ event, data });
                } catch (error) {
                    // 🦇 Wildcard handler crashed
                    console.warn(`❌ EventBus: Wildcard handler error:`, error.message);
                }
            });
        }
    },

    /**
     * Emit an event and wait for async handlers
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     * @returns {Promise} Resolves when all handlers complete
     */
    async emitAsync(event, data = null) {
        if (this.verbose) {
            console.log(`📡 EventBus (async): ${event}`, data);
        }

        this.addToHistory(event, data);

        if (!this.listeners.has(event)) return;

        const promises = [];
        this.listeners.get(event).forEach(callback => {
            try {
                const result = callback(data);
                if (result instanceof Promise) {
                    promises.push(result);
                }
            } catch (error) {
                // 🦇 Async event handler crashed
                console.warn(`❌ EventBus: Async handler error for '${event}':`, error.message);
            }
        });

        await Promise.all(promises);
    },

    // ═══════════════════════════════════════════════════════════
    // 🔧 UTILITY METHODS - Tools for the obsessed
    // ═══════════════════════════════════════════════════════════

    /**
     * Check if an event has any listeners
     * @param {string} event - Event name
     * @returns {boolean}
     */
    hasListeners(event) {
        return this.listeners.has(event) && this.listeners.get(event).size > 0;
    },

    /**
     * Get count of listeners for an event
     * @param {string} event - Event name
     * @returns {number}
     */
    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).size : 0;
    },

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    },

    /**
     * Get all registered events
     * @returns {string[]}
     */
    getEvents() {
        return Array.from(this.listeners.keys());
    },

    // ═══════════════════════════════════════════════════════════
    // 📜 HISTORY & DEBOOGERING 🦇 - Peer into the past
    // ═══════════════════════════════════════════════════════════

    addToHistory(event, data) {
        this.history.push({
            event,
            data,
            timestamp: Date.now()
        });

        // 💀 Keep history bounded - can't remember everything forever
        while (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    },

    /**
     * Get event history
     * @param {string} filterEvent - Optional event name to filter by
     * @returns {Array}
     */
    getHistory(filterEvent = null) {
        if (filterEvent) {
            return this.history.filter(h => h.event === filterEvent);
        }
        return [...this.history];
    },

    /**
     * Enable verbose logging
     */
    enableVerbose() {
        this.verbose = true;
        console.log('📡 EventBus: Verbose mode enabled');
    },

    /**
     * Disable verbose logging
     */
    disableVerbose() {
        this.verbose = false;
    },

    /**
     * Debooger: print all registered listeners 💀
     */
    debooger() {
        console.log('📡 EventBus Debooger 🖤:');
        console.log('  Registered events:', this.getEvents());
        this.listeners.forEach((callbacks, event) => {
            console.log(`  ${event}: ${callbacks.size} listeners`);
        });
        console.log('  History length:', this.history.length);
    }
};

// ═══════════════════════════════════════════════════════════════
// 🎯 STANDARD EVENT NAMES - The vocabulary of darkness
// ═══════════════════════════════════════════════════════════════
// 💀 Use these constants to avoid typos - precision matters when screaming into the void

EventBus.EVENTS = {
    // 🖤 Game lifecycle - birth, death, resurrection
    GAME_READY: 'game:ready',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',

    // 💀 Player events - the protagonist's suffering
    PLAYER_CREATED: 'player:created',
    PLAYER_GOLD_CHANGED: 'player:gold_changed',
    PLAYER_STATS_CHANGED: 'player:stats_changed',
    PLAYER_LEVEL_UP: 'player:level_up',
    PLAYER_DIED: 'player:died',

    // 🎒 Inventory events - hoarding and loss
    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:item_added',
    ITEM_REMOVED: 'inventory:item_removed',
    ITEM_USED: 'inventory:item_used',
    ITEM_EQUIPPED: 'inventory:item_equipped',

    // 🚶 Travel events - the journey never ends
    TRAVEL_STARTED: 'travel:started',
    TRAVEL_PROGRESS: 'travel:progress',
    TRAVEL_COMPLETED: 'travel:completed',
    TRAVEL_CANCELLED: 'travel:cancelled',
    LOCATION_CHANGED: 'travel:location_changed',

    // 💰 Trading events - capitalism in the shadows
    TRADE_STARTED: 'trade:started',
    TRADE_COMPLETED: 'trade:completed',
    ITEM_BOUGHT: 'trade:item_bought',
    ITEM_SOLD: 'trade:item_sold',

    // 🏚️ Property events - owning pieces of the wasteland
    PROPERTY_PURCHASED: 'property:purchased',
    PROPERTY_SOLD: 'property:sold',
    PROPERTY_UPGRADED: 'property:upgraded',
    PROPERTY_INCOME: 'property:income',

    // 👥 Employee events - managing the wage slaves
    EMPLOYEE_HIRED: 'employee:hired',
    EMPLOYEE_FIRED: 'employee:fired',
    EMPLOYEE_ASSIGNED: 'employee:assigned',
    EMPLOYEE_WAGES_PAID: 'employee:wages_paid',

    // 📜 Quest events - purpose in the meaningless
    QUEST_ACCEPTED: 'quest:accepted',
    QUEST_PROGRESS: 'quest:progress',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_FAILED: 'quest:failed',

    // 🏆 Achievement events - validation from the void
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

    // ⏰ Time events - the relentless march
    TIME_TICK: 'time:tick',
    HOUR_CHANGED: 'time:hour_changed',
    DAY_CHANGED: 'time:day_changed',

    // 🗡️ Combat/Dungeon events - violence in the depths
    COMBAT_STARTED: 'combat:started',
    COMBAT_ENDED: 'combat:ended',
    DUNGEON_ENTERED: 'dungeon:entered',
    DUNGEON_EXITED: 'dungeon:exited',
    BOSS_DEFEATED: 'dungeon:boss_defeated',

    // 💾 Save/Load events - preserving existence
    GAME_SAVED: 'save:completed',
    GAME_LOADED: 'load:completed',

    // 🎨 UI events - the face of the machine
    PANEL_OPENED: 'ui:panel_opened',
    PANEL_CLOSED: 'ui:panel_closed',
    NOTIFICATION_SHOWN: 'ui:notification',

    // 🔨 Crafting events - creating from destruction
    CRAFTING_STARTED: 'crafting:started',
    CRAFTING_COMPLETED: 'crafting:completed',

    // 🧑 NPC events - the others we pretend matter
    NPC_DIALOGUE_STARTED: 'npc:dialogue_started',
    NPC_DIALOGUE_ENDED: 'npc:dialogue_ended',
    NPC_TRADE_OPENED: 'npc:trade_opened'
};

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY
// ═══════════════════════════════════════════════════════════════

window.EventBus = EventBus;

console.log('📡 EventBus loaded');
