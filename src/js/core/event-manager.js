// ═══════════════════════════════════════════════════════════════
// 👂 EVENT MANAGER - listening to everything like a paranoid goth
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// 💀 Centralized listener management - because memory leaks are a slow death
// 🖤 Even code needs therapy for attachment issues

const EventManager = {
    // 📋 Store all event listeners - tracking our emotional attachments to the DOM
    listeners: new Map(),

    // 🖤 Add event listener with tracking - prevents duplicates, prevents obsession
    addListener(element, eventType, handler, options = {}) {
        // 🦇 Silently skip if element doesn't exist - ghosts can't listen
        // Expected during initialization when the DOM is still loading
        if (!element || !eventType || !handler) {
            return null;
        }

        // 💀 Check if this element already has a listener for this event type
        // Prevents duplicate listeners from multiple initialization paths - no obsessive behavior
        const elementKey = element.id || element.className || 'unnamed';
        let existingListener = false;
        this.listeners.forEach((listener, key) => {
            if (listener.element === element && listener.eventType === eventType) {
                existingListener = true;
            }
        });

        if (existingListener) {
            // 🗡️ Already has a listener for this event type, skip - no double attachments
            return null;
        }

        // 🔮 Create unique key for this listener - every bond needs a name
        const key = `${elementKey}_${eventType}_${Date.now()}_${Math.random()}`;

        // 💾 Store listener info - documenting the relationship
        this.listeners.set(key, {
            element,
            eventType,
            handler,
            options,
            active: true
        });

        // ⚡ Add the actual event listener - forming the bond
        element.addEventListener(eventType, handler, options);

        return key; // 🗡️ Return key for removal - in case you need to cut ties
    },

    // 💀 Remove event listener by key - severing the connection
    removeListener(key) {
        if (!this.listeners.has(key)) {
            console.warn(`⚠️ EventManager: No listener found for key ${key}`);
            return false;
        }
        
        const listener = this.listeners.get(key);
        
        try {
            listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
            this.listeners.delete(key);
            return true;
        } catch (error) {
            // 🦇 Listener removal failed - may already be removed
            return false;
        }
    },
    
    // 🗡️ Remove all listeners for a specific element - complete detachment
    removeListenersForElement(element) {
        const keysToRemove = [];
        
        this.listeners.forEach((listener, key) => {
            if (listener.element === element) {
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => this.removeListener(key));
        return keysToRemove.length;
    },
    
    // 🦇 Remove all listeners for a specific event type - nuclear option
    removeListenersForEventType(eventType) {
        const keysToRemove = [];
        
        this.listeners.forEach((listener, key) => {
            if (listener.eventType === eventType) {
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => this.removeListener(key));
        return keysToRemove.length;
    },
    
    // ⚰️ Remove all listeners - scorched earth, complete isolation
    removeAllListeners() {
        const count = this.listeners.size;
        this.listeners.forEach((listener, key) => {
            try {
                listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
            } catch (error) {
                // 🦇 Listener removal failed during cleanup
            }
        });
        this.listeners.clear();
        return count;
    },
    
    // 📊 Get active listeners count - how many connections we're maintaining
    getActiveListenersCount() {
        return this.listeners.size;
    },
    
    // 🔍 Get listeners for debugging - peer into the network of attachments
    getListeners() {
        return Array.from(this.listeners.entries()).map(([key, listener]) => ({
            key,
            element: listener.element.id || listener.element.tagName || 'unnamed',
            eventType: listener.eventType,
            active: listener.active
        }));
    },
    
    // 🖤 Cleanup on page unload - death is the ultimate detachment
    init() {
        // 💀 Add cleanup on page unload - severing all ties before the void
        window.addEventListener('beforeunload', () => {
            this.removeAllListeners();
        });

        console.log('🖤 EventManager initialized - ready to manage attachments');
    },

    // 🔮 Utility method for one-time listeners - brief connections, no commitment
    addOneTimeListener(element, eventType, handler, options = {}) {
        const oneTimeHandler = (e) => {
            handler(e);
            // Find and remove this listener
            this.listeners.forEach((listener, key) => {
                if (listener.element === element &&
                    listener.eventType === eventType &&
                    listener.handler === oneTimeHandler) {
                    this.removeListener(key);
                }
            });
        };

        return this.addListener(element, eventType, oneTimeHandler, options);
    },

    // 🦇 Alias for addEventListener - many parts of the code use this name
    addEventListener(element, eventType, handler, options = {}) {
        return this.addListener(element, eventType, handler, options);
    },

    // 🗡️ Alias for removeEventListener - cutting ties the standard way
    removeEventListener(element, eventType, handler) {
        // 💀 Find and remove the matching listener - surgical detachment
        const keysToRemove = [];
        this.listeners.forEach((listener, key) => {
            if (listener.element === element &&
                listener.eventType === eventType &&
                listener.handler === handler) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => this.removeListener(key));
        return keysToRemove.length > 0;
    }
};

// 🖤 Initialize event manager - begin the surveillance
if (typeof document !== 'undefined') {
    EventManager.init();
}