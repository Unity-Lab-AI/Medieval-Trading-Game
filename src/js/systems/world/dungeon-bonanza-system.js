// 
// DUNGEON BONANZA - annual bloodbath celebration
// 
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const DungeonBonanzaSystem = {
    // The one day a year when dungeons get EASY - cosmic mercy
    EVENT_MONTH: 7,  // July
    EVENT_DAY: 18,   // 18th
    EVENT_NAME: 'The Dark Convergence',

    // Teleport mode - 30 minutes to any dungeon, fuck physics
    DUNGEON_TRAVEL_TIME: 30,

    // Don't spam the player with notifications - once per day is enough
    hasShownNotificationToday: false,
    lastNotificationDay: 0,

    // Debooger can force this shit on - lasts until midnight
    manualOverrideActive: false,
    manualOverrideEndDay: 0,

    // Force the bonanza on - cheating or testing, I don't judge
    activateManualOverride() {
        this.manualOverrideActive = true;
        // Active until day changes - then it dies
        this.manualOverrideEndDay = this.getCurrentDay();
        console.log('☄️ DOOM BONANZA ACTIVATED! Dungeon benefits until end of day');
        this.showEventNotification();
    },

    // deactivate manual override
    deactivateManualOverride() {
        this.manualOverrideActive = false;
        this.manualOverrideEndDay = 0;
        console.log('☄️ Doom bonanza ended');
    },

    // Is the override still alive or did midnight kill it?
    isManualOverrideValid() {
        if (!this.manualOverrideActive) return false;
        const currentDay = this.getCurrentDay();
        if (currentDay !== this.manualOverrideEndDay) {
            // Midnight passed - override expires
            this.deactivateManualOverride();
            return false;
        }
        return true;
    },

    // Is it July 18th or did someone cheat it on?
    isDungeonBonanzaDay() {
        // Cheaters first - manual override wins
        if (this.isManualOverrideValid()) {
            return true;
        }

        if (typeof TimeMachine === 'undefined') {
            if (typeof TimeSystem === 'undefined') return false;
            return TimeSystem.currentTime.month === this.EVENT_MONTH &&
                   TimeSystem.currentTime.day === this.EVENT_DAY;
        }
        return TimeMachine.currentTime.month === this.EVENT_MONTH &&
               TimeMachine.currentTime.day === this.EVENT_DAY;
    },

    // get current game date for tracking
    getCurrentDay() {
        if (typeof TimeMachine !== 'undefined') {
            return TimeMachine.currentTime.year * 1000 +
                   TimeMachine.currentTime.month * 100 +
                   TimeMachine.currentTime.day;
        }
        if (typeof TimeSystem !== 'undefined') {
            return TimeSystem.currentTime.year * 1000 +
                   TimeSystem.currentTime.month * 100 +
                   TimeSystem.currentTime.day;
        }
        return 0;
    },

    // get event modifiers for travel and dungeons
    getEventModifiers() {
        if (!this.isDungeonBonanzaDay()) {
            return {
                dungeonTravelTime: null,     // null = use normal calculation
                bypassCooldowns: false,
                isActive: false
            };
        }

        return {
            dungeonTravelTime: this.DUNGEON_TRAVEL_TIME,
            bypassCooldowns: true,
            isActive: true
        };
    },

    // check if dungeon cooldowns should be bypassed
    shouldBypassCooldowns() {
        return this.isDungeonBonanzaDay();
    },

    // calculate travel time with Dungeon Bonanza override
    // returns null if no override should apply, otherwise returns the override time
    getDungeonTravelTimeOverride(fromId, toId) {
        if (!this.isDungeonBonanzaDay()) return null;

        // check if destination is a dungeon
        if (typeof GameWorld === 'undefined' || !GameWorld.locations) return null;

        const destination = GameWorld.locations[toId];
        if (!destination) return null;

        // only override for dungeon-type locations
        const dungeonTypes = ['dungeon', 'cave', 'ruins', 'mine'];
        if (!dungeonTypes.includes(destination.type)) return null;

        // return the special 30-minute travel time
        return this.DUNGEON_TRAVEL_TIME;
    },

    // show event notification (once per game day)
    showEventNotification() {
        const currentDay = this.getCurrentDay();

        // Don't show if already shown today
        if (this.hasShownNotificationToday && this.lastNotificationDay === currentDay) {
            return;
        }

        if (!this.isDungeonBonanzaDay()) {
            this.hasShownNotificationToday = false;
            return;
        }

        this.hasShownNotificationToday = true;
        this.lastNotificationDay = currentDay;

        // show dramatic notification
        if (typeof addMessage === 'function') {
            addMessage('═══════════════════════════════════════════════════', 'special');
            addMessage('💀 THE DARK CONVERGENCE HAS BEGUN! 💀', 'special');
            addMessage('═══════════════════════════════════════════════════', 'special');
            addMessage('🦇 On this sacred day, July 18th, the veil thins...', 'info');
            addMessage('All dungeon travel reduced to 30 minutes!', 'success');
            addMessage('🔓 Dungeon cooldowns have been lifted!', 'success');
            addMessage('Seize this day to conquer the darkness!', 'info');
            addMessage('═══════════════════════════════════════════════════', 'special');
        }

        console.log('💀 DUNGEON BONANZA: The Dark Convergence is active!');
    },

    // check and update event status (call from game loop)
    update() {
        if (this.isDungeonBonanzaDay()) {
            this.showEventNotification();
        }
    },

    // get event status for UI display
    getEventStatus() {
        if (!this.isDungeonBonanzaDay()) {
            return {
                active: false,
                name: null,
                description: null
            };
        }

        return {
            active: true,
            name: this.EVENT_NAME,
            description: 'Dungeon travel: 30 min | Cooldowns: REMOVED',
            icon: '💀'
        };
    },

    // initialize the system
    init() {
        console.log('💀 DungeonBonanzaSystem initialized - watching for July 18th...');

        // check immediately if today is the event
        if (this.isDungeonBonanzaDay()) {
            this.showEventNotification();
        }

        return true;
    }
};

// auto-initialize when loaded
if (typeof window !== 'undefined') {
    window.DungeonBonanzaSystem = DungeonBonanzaSystem;
}
