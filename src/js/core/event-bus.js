// ═══════════════════════════════════════════════════════════════
// EVENT BUS - central nervous system of the game
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// the pulse of the machine - systems scream into the void here
// no direct calls, only dark signals echoing through the network
// decoupled chaos - beautiful, maintainable isolation

const EventBus = {
    // Map of screams -> Set of ears listening
    listeners: new Map(),

    // Track event history - the digital graveyard of past signals
    history: [],
    maxHistory: 100,

    // Track failed events for debugging - the error graveyard
    _failedEvents: [],
    _maxFailedEvents: 50,

    // Whether to log events - paranoid mode for the curious
    verbose: false,

    // ═══════════════════════════════════════════════════════════
    // CORE METHODS - The dark API of communication
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

        // hand back the kill switch - sometimes you gotta ghost your listeners
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
            // delete empty sets - can't let ghost listeners haunt the bus
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
        // log the signal if we're paranoid mode
        if (this.verbose) {
            console.log(`📡 EventBus: ${event}`, data);
        }

        // archive this scream for future deboogering
        this.addToHistory(event, data);

        // broadcast to every listener - let them all hear the news
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    // event handler crashed - sanitize this shit or the XSS demons will feast
                    console.warn(`❌ EventBus: Handler error for '${event}':`, error.message);
                    // log this crash for the error graveyard
                    this._trackFailedEvent(event, data, error);
                }
            });
        }

        // notify the wildcard stalkers who eavesdrop on every fucking event
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback({ event, data });
                } catch (error) {
                    // wildcard listener ate shit
                    console.warn(`❌ EventBus: Wildcard handler error:`, error.message);
                    // Track wildcard failures too
                    this._trackFailedEvent('*', { event, data }, error);
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
                    // wrap the promise to catch when async shit explodes
                    promises.push(result.catch(error => {
                        console.warn(`❌ EventBus: Async handler error for '${event}':`, error.message);
                        this._trackFailedEvent(event, data, error, true);
                    }));
                }
            } catch (error) {
                // async handler died screaming
                console.warn(`❌ EventBus: Async handler error for '${event}':`, error.message);
                this._trackFailedEvent(event, data, error, true);
            }
        });

        await Promise.all(promises);
    },

    // ═══════════════════════════════════════════════════════════
    // BATCH OPERATIONS - When one scream isn't enough
    // ═══════════════════════════════════════════════════════════

    // Batch queue for deferred event processing
    _batchQueue: [],
    _batchProcessing: false,
    _batchTimeout: null,

    /**
     * Emit multiple events in one call - shotgun blast into the void
     * @param {Array} events - Array of {event, data} objects
     * @example EventBus.emitBatch([
     *   {event: 'player:gold:changed', data: {amount: 100}},
     *   {event: 'inventory:item:added', data: {item: 'sword'}}
     * ])
     */
    emitBatch(events) {
        if (!Array.isArray(events) || events.length === 0) return;

        events.forEach(({ event, data }) => {
            if (event) {
                this.emit(event, data);
            }
        });
    },

    /**
     * Subscribe to multiple events with one callback - ears everywhere
     * @param {string[]} events - Array of event names
     * @param {function} callback - Function to call for any event
     * @returns {function} Unsubscribe function that removes all
     * @example const unsub = EventBus.onBatch(['player:died', 'game:over'], (e) => console.log(e))
     */
    onBatch(events, callback) {
        if (!Array.isArray(events)) return () => {};

        const unsubscribers = events.map(event => this.on(event, callback));

        // Return a single kill switch that murders all subscriptions
        return () => unsubscribers.forEach(unsub => unsub());
    },

    /**
     * Queue an event for deferred batch processing - don't emit now, collect and blast later
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    queue(event, data = null) {
        this._batchQueue.push({ event, data, timestamp: Date.now() });
    },

    /**
     * Process all queued events at once - the deferred reckoning
     * @returns {number} Number of events processed
     */
    flushQueue() {
        if (this._batchQueue.length === 0) return 0;
        if (this._batchProcessing) return 0; // Prevent recursive flush

        this._batchProcessing = true;
        const queued = [...this._batchQueue];
        this._batchQueue = [];

        queued.forEach(({ event, data }) => {
            this.emit(event, data);
        });

        this._batchProcessing = false;
        return queued.length;
    },

    /**
     * Schedule queue flush on next animation frame - batch at 60fps
     * @returns {Promise} Resolves when flush completes
     */
    flushQueueOnFrame() {
        return new Promise(resolve => {
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(() => {
                    const count = this.flushQueue();
                    resolve(count);
                });
            } else {
                // Fallback for non-browser environments
                setTimeout(() => {
                    const count = this.flushQueue();
                    resolve(count);
                }, 0);
            }
        });
    },

    /**
     * Schedule queue flush after a delay - throttled batch processing
     * @param {number} delay - Milliseconds to wait before flush
     */
    flushQueueDelayed(delay = 16) {
        if (this._batchTimeout) {
            clearTimeout(this._batchTimeout);
        }
        this._batchTimeout = setTimeout(() => {
            this.flushQueue();
            this._batchTimeout = null;
        }, delay);
    },

    /**
     * Get queued events count
     * @returns {number}
     */
    getQueueLength() {
        return this._batchQueue.length;
    },

    /**
     * Clear the queue without processing - abandon the queued screams
     */
    clearQueue() {
        this._batchQueue = [];
        if (this._batchTimeout) {
            clearTimeout(this._batchTimeout);
            this._batchTimeout = null;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // UTILITY METHODS - Tools for the obsessed
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
    // HISTORY & DEBOOGERING - Peer into the past
    // ═══════════════════════════════════════════════════════════

    addToHistory(event, data) {
        this.history.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Keep history bounded - can't remember everything forever
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
     * Debooger: print all registered listeners
     */
    debooger() {
        console.log('📡 EventBus Debooger:');
        console.log('  Registered events:', this.getEvents());
        this.listeners.forEach((callbacks, event) => {
            console.log(`  ${event}: ${callbacks.size} listeners`);
        });
        console.log('  History length:', this.history.length);
        console.log('  Failed events:', this._failedEvents.length);
        console.log('  Queued events:', this._batchQueue.length);
    },

    // ═══════════════════════════════════════════════════════════
    // FAILED EVENT TRACKING - When handlers crash and burn
    // ═══════════════════════════════════════════════════════════

    /**
     * Track a failed event handler for debugging
     * @param {string} event - Event that failed
     * @param {*} data - Data passed to handler
     * @param {Error} error - The error that occurred
     * @param {boolean} isAsync - Whether it was an async handler
     */
    _trackFailedEvent(event, data, error, isAsync = false) {
        this._failedEvents.push({
            event,
            data,
            error: error.message,
            stack: error.stack,
            isAsync,
            timestamp: Date.now()
        });

        // cap the error collection - even failures deserve to die eventually
        while (this._failedEvents.length > this._maxFailedEvents) {
            this._failedEvents.shift();
        }
    },

    /**
     * Get all failed events for debugging
     * @param {string} filterEvent - Optional event name to filter by
     * @returns {Array} Array of failed event records
     */
    getFailedEvents(filterEvent = null) {
        if (filterEvent) {
            return this._failedEvents.filter(f => f.event === filterEvent);
        }
        return [...this._failedEvents];
    },

    /**
     * Clear failed events history
     */
    clearFailedEvents() {
        this._failedEvents = [];
    },

    /**
     * Check if there are any failed events
     * @returns {boolean}
     */
    hasFailedEvents() {
        return this._failedEvents.length > 0;
    }
};

// ═══════════════════════════════════════════════════════════════
// STANDARD EVENT NAMES - The vocabulary of darkness
// ═══════════════════════════════════════════════════════════════
// Use these constants to avoid typos - precision matters when screaming into the void

EventBus.EVENTS = {
    // Game lifecycle - birth, death, resurrection
    GAME_READY: 'game:ready',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',

    // Player events - the protagonist's suffering
    PLAYER_CREATED: 'player:created',
    PLAYER_GOLD_CHANGED: 'player:gold_changed',
    PLAYER_STATS_CHANGED: 'player:stats_changed',
    PLAYER_LEVEL_UP: 'player:level_up',
    PLAYER_DIED: 'player:died',

    // Inventory events - hoarding and loss
    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:item_added',
    ITEM_REMOVED: 'inventory:item_removed',
    ITEM_USED: 'inventory:item_used',
    ITEM_EQUIPPED: 'inventory:item_equipped',

    // Travel events - the journey never ends
    TRAVEL_STARTED: 'travel:started',
    TRAVEL_PROGRESS: 'travel:progress',
    TRAVEL_COMPLETED: 'travel:completed',
    TRAVEL_CANCELLED: 'travel:cancelled',
    LOCATION_CHANGED: 'travel:location_changed',

    // Trading events - capitalism in the shadows
    TRADE_STARTED: 'trade:started',
    TRADE_COMPLETED: 'trade:completed',
    ITEM_BOUGHT: 'trade:item_bought',
    ITEM_SOLD: 'trade:item_sold',

    // Property events - owning pieces of the wasteland
    PROPERTY_PURCHASED: 'property:purchased',
    PROPERTY_SOLD: 'property:sold',
    PROPERTY_UPGRADED: 'property:upgraded',
    PROPERTY_INCOME: 'property:income',

    // Employee events - managing the wage slaves
    EMPLOYEE_HIRED: 'employee:hired',
    EMPLOYEE_FIRED: 'employee:fired',
    EMPLOYEE_ASSIGNED: 'employee:assigned',
    EMPLOYEE_WAGES_PAID: 'employee:wages_paid',

    // Quest events - purpose in the meaningless
    QUEST_ACCEPTED: 'quest:accepted',
    QUEST_PROGRESS: 'quest:progress',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_FAILED: 'quest:failed',

    // Achievement events - validation from the void
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

    // Time events - the relentless march
    TIME_TICK: 'time:tick',
    HOUR_CHANGED: 'time:hour_changed',
    DAY_CHANGED: 'time:day_changed',

    // Combat/Dungeon events - violence in the depths
    COMBAT_STARTED: 'combat:started',
    COMBAT_ENDED: 'combat:ended',
    DUNGEON_ENTERED: 'dungeon:entered',
    DUNGEON_EXITED: 'dungeon:exited',
    BOSS_DEFEATED: 'dungeon:boss_defeated',

    // Save/Load events - preserving existence
    GAME_SAVED: 'save:completed',
    GAME_LOADED: 'load:completed',

    // UI events - the face of the machine
    PANEL_OPENED: 'ui:panel_opened',
    PANEL_CLOSED: 'ui:panel_closed',
    NOTIFICATION_SHOWN: 'ui:notification',

    // Crafting events - creating from destruction
    CRAFTING_STARTED: 'crafting:started',
    CRAFTING_COMPLETED: 'crafting:completed',

    // NPC events - the others we pretend matter
    NPC_DIALOGUE_STARTED: 'npc:dialogue_started',
    NPC_DIALOGUE_ENDED: 'npc:dialogue_ended',
    NPC_TRADE_OPENED: 'npc:trade_opened'
};

// ═══════════════════════════════════════════════════════════════
// EXPOSE GLOBALLY - Let the darkness spread
// ═══════════════════════════════════════════════════════════════

window.EventBus = EventBus;

console.log('📡 EventBus loaded');
