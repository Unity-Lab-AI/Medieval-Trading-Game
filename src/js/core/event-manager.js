// ═══════════════════════════════════════════════════════════════
// EVENT MANAGER - listening to everything like a paranoid goth
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// centralized listener management - because memory leaks are a slow death
// even code needs therapy for attachment issues

const EventManager = {
    // 📋 Store all event listeners - tracking our emotional attachments to the DOM
    listeners: new Map(),

    // 🖤 O(1) lookup map for element+eventType duplicate detection 💀
    elementEventMap: new Map(),

    // 🖤 Generate a stable key for element+eventType pair 💀
    _getElementEventKey(element, eventType) {
        // 🦇 WHY ._eventManagerId INSTEAD OF WeakMap:
        // - WeakMap requires keeping element refs in memory, defeating garbage collection
        // - This approach stores the ID directly on the element - cleaner, faster O(1) lookup
        // - When element dies, the property dies with it - automatic cleanup
        // - element._eventManagerId is a FEATURE, not a hack 🖤💀
        // Use a WeakMap-style approach with element reference + eventType
        // 🖤💀 FIXED: Use older syntax for Firefox compatibility (??= not supported in older versions) 💀
        if (!element._eventManagerId) {
            element._eventManagerId = `em_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
        return `${element._eventManagerId}::${eventType}`;
    },

    // 🖤 Add event listener with tracking - prevents duplicates, prevents obsession
    addListener(element, eventType, handler, options = {}) {
        // silently skip if element doesn't exist - ghosts can't listen
        // expected during initialization when the DOM is still loading its soul
        if (!element || !eventType || !handler) {
            return null;
        }

        // 🖤 O(1) duplicate check using computed key 💀
        const elementEventKey = this._getElementEventKey(element, eventType);
        if (this.elementEventMap.has(elementEventKey)) {
            // 🗡️ Already has a listener for this event type, skip - no double attachments
            return null;
        }

        // 🔮 Create unique key for this listener - every bond needs a name
        const elementKey = element.id || element.className || 'unnamed';
        const key = `${elementKey}_${eventType}_${Date.now()}_${Math.random()}`;

        // 💾 Store listener info - documenting the relationship
        this.listeners.set(key, {
            element,
            eventType,
            handler,
            options,
            active: true,
            elementEventKey // 🖤 Store for O(1) cleanup 💀
        });

        // 🖤 Track in O(1) lookup map 💀
        this.elementEventMap.set(elementEventKey, key);

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
            // 🖤 Clean up both maps for O(1) consistency 💀
            if (listener.elementEventKey) {
                this.elementEventMap.delete(listener.elementEventKey);
            }
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
        // 🖤 Also clear O(1) lookup map 💀
        this.elementEventMap.clear();
        return count;
    },
    
    // 📊 Get active listeners count - how many connections we're maintaining
    getActiveListenersCount() {
        return this.listeners.size;
    },
    
    // 🔍 Get listeners for deboogering 🦇 - peer into the network of attachments
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