// ═══════════════════════════════════════════════════════════════
// EVENT MANAGER - listening to everything like a paranoid goth
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// centralized listener management - because memory leaks are a slow death
// even code needs therapy for attachment issues

const EventManager = {
    // Store all event listeners - tracking our emotional attachments to the DOM
    listeners: new Map(),

    // O(1) lookup map for element+eventType duplicate detection
    elementEventMap: new Map(),

    // create a unique identifier for this element + event combo
    _getElementEventKey(element, eventType) {
        // WHY ._eventManagerId INSTEAD OF WeakMap:
        // - WeakMap requires keeping element refs in memory, defeating garbage collection
        // - This approach stores the ID directly on the element - cleaner, faster O(1) lookup
        // - When element dies, the property dies with it - automatic cleanup
        // - element._eventManagerId is a FEATURE, not a hack
        // Use a WeakMap-style approach with element reference + eventType
        // FIXED: Use older syntax for Firefox compatibility (??= not supported in older versions)
        if (!element._eventManagerId) {
            element._eventManagerId = `em_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
        return `${element._eventManagerId}::${eventType}`;
    },

    // attach listener with anti-duplicate protection - no double bonding allowed
    addListener(element, eventType, handler, options = {}) {
        // silently skip if element doesn't exist - ghosts can't listen
        // expected during initialization when the DOM is still loading its soul
        if (!element || !eventType || !handler) {
            return null;
        }

        // instant duplicate detection - O(1) lookup magic
        const elementEventKey = this._getElementEventKey(element, eventType);
        if (this.elementEventMap.has(elementEventKey)) {
            // already listening to this event - back off, no stalking
            return null;
        }

        // generate a key for this listener - gotta track it somehow
        const elementKey = element.id || element.className || 'unnamed';
        const key = `${elementKey}_${eventType}_${Date.now()}_${Math.random()}`;

        // save the listener data - evidence of the attachment
        this.listeners.set(key, {
            element,
            eventType,
            handler,
            options,
            active: true,
            elementEventKey // Store for O(1) cleanup
        });

        // index it for instant retrieval
        this.elementEventMap.set(elementEventKey, key);

        // attach the listener - the bond is formed
        element.addEventListener(eventType, handler, options);

        return key; // keep the key if you need to sever this later
    },

    // kill a listener by its key - cut the connection
    removeListener(key) {
        if (!this.listeners.has(key)) {
            console.warn(`⚠️ EventManager: No listener found for key ${key}`);
            return false;
        }

        const listener = this.listeners.get(key);

        try {
            listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
            // delete from both indexes - keep them in sync
            if (listener.elementEventKey) {
                this.elementEventMap.delete(listener.elementEventKey);
            }
            this.listeners.delete(key);
            return true;
        } catch (error) {
            // couldn't remove - probably already dead
            return false;
        }
    },
    
    // nuke every listener on this element - total detachment
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
    
    // delete all listeners for this event - scorched earth approach
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
    
    // kill every single listener - burn it all down
    removeAllListeners() {
        const count = this.listeners.size;
        this.listeners.forEach((listener, key) => {
            try {
                listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
            } catch (error) {
                // removal crashed during cleanup - oh well
            }
        });
        this.listeners.clear();
        // wipe the lookup index too
        this.elementEventMap.clear();
        return count;
    },

    // count how many listeners are still breathing
    getActiveListenersCount() {
        return this.listeners.size;
    },

    // Get listeners for deboogering - peer into the network of attachments
    getListeners() {
        return Array.from(this.listeners.entries()).map(([key, listener]) => ({
            key,
            element: listener.element.id || listener.element.tagName || 'unnamed',
            eventType: listener.eventType,
            active: listener.active
        }));
    },
    
    // set up the death ritual - clean everything when the page dies
    init() {
        // murder all listeners before the browser closes the void
        window.addEventListener('beforeunload', () => {
            this.removeAllListeners();
        });

        console.log('EventManager initialized - ready to manage attachments');
    },

    // one-night-stand listener - fires once then ghosts you
    addOneTimeListener(element, eventType, handler, options = {}) {
        const oneTimeHandler = (e) => {
            handler(e);
            // hunt down and kill this listener
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

    // alias for the masses who prefer standard naming
    addEventListener(element, eventType, handler, options = {}) {
        return this.addListener(element, eventType, handler, options);
    },

    // standard-named detachment function
    removeEventListener(element, eventType, handler) {
        // find the exact match and destroy it
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

// wake the event manager and start tracking everything
if (typeof document !== 'undefined') {
    EventManager.init();
}