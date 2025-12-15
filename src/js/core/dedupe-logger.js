// ═══════════════════════════════════════════════════════════════
// DEDUPE-LOGGER - because console spam is for amateurs
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// prevents console spam by only logging when messages change or enough time passes

const DedupeLogger = {
    // Store last message for each category
    lastMessages: {},
    lastTimes: {},
    // Minimum interval between identical logs (ms)
    minInterval: 5000, // 5 seconds

    // Log with deduplication - only logs if message changed or interval passed
    log(category, message, ...args) {
        const now = Date.now();
        const key = category;
        const lastMsg = this.lastMessages[key];
        const lastTime = this.lastTimes[key] || 0;

        // ignore duplicates within the spam window
        if (lastMsg === message && (now - lastTime) < this.minInterval) {
            return false;
        }

        // log it and remember we said it
        console.log(message, ...args);
        this.lastMessages[key] = message;
        this.lastTimes[key] = now;
        return true;
    },

    // Warn with deduplication
    warn(category, message, ...args) {
        const now = Date.now();
        const key = 'warn_' + category;
        const lastMsg = this.lastMessages[key];
        const lastTime = this.lastTimes[key] || 0;

        if (lastMsg === message && (now - lastTime) < this.minInterval) {
            return false;
        }

        console.warn(message, ...args);
        this.lastMessages[key] = message;
        this.lastTimes[key] = now;
        return true;
    },

    // log only if the value actually changed - no spam for static shit
    logOnChange(category, message, value) {
        const key = 'val_' + category;
        const lastVal = this.lastMessages[key];

        // ignore if nothing changed
        if (lastVal === value) {
            return false;
        }

        console.log(message);
        this.lastMessages[key] = value;
        return true;
    },

    // wipe tracking for one category - fresh start
    clear(category) {
        delete this.lastMessages[category];
        delete this.lastMessages['warn_' + category];
        delete this.lastMessages['val_' + category];
        delete this.lastTimes[category];
        delete this.lastTimes['warn_' + category];
    },

    // nuke everything - total memory wipe
    clearAll() {
        this.lastMessages = {};
        this.lastTimes = {};
    },

    // rate-limited spam control - one log per time window max
    // for when you want to see it occasionally but not 600 times
    rateLimit(category, message, intervalMs = 10000, ...args) {
        const now = Date.now();
        const key = 'rate_' + category;
        const lastTime = this.lastTimes[key] || 0;

        if ((now - lastTime) < intervalMs) {
            return false;
        }

        console.log(message, ...args);
        this.lastTimes[key] = now;
        return true;
    }
};

// expose to the global void
window.DedupeLogger = DedupeLogger;

console.log('🔇 DedupeLogger loaded - spam control engaged');
