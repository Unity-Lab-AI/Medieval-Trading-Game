/**
 * ========================================
 * NPC SCHEDULE SYSTEM - Medieval Trading Game
 * ========================================
 * NPCs follow daily routines based on time of day
 * ========================================
 */

const NPCScheduleSystem = {
    // Schedule templates for different NPC types
    scheduleTemplates: {
        merchant: {
            name: 'Merchant Schedule',
            activities: [
                { start: 6, end: 7, activity: 'waking', location: 'home', available: false },
                { start: 7, end: 8, activity: 'breakfast', location: 'tavern', available: false },
                { start: 8, end: 12, activity: 'working', location: 'shop', available: true },
                { start: 12, end: 13, activity: 'lunch', location: 'tavern', available: false },
                { start: 13, end: 18, activity: 'working', location: 'shop', available: true },
                { start: 18, end: 20, activity: 'dinner', location: 'tavern', available: false },
                { start: 20, end: 22, activity: 'relaxing', location: 'tavern', available: true },
                { start: 22, end: 6, activity: 'sleeping', location: 'home', available: false }
            ]
        },
        blacksmith: {
            name: 'Blacksmith Schedule',
            activities: [
                { start: 5, end: 6, activity: 'waking', location: 'home', available: false },
                { start: 6, end: 7, activity: 'breakfast', location: 'home', available: false },
                { start: 7, end: 12, activity: 'working', location: 'forge', available: true },
                { start: 12, end: 13, activity: 'lunch', location: 'tavern', available: false },
                { start: 13, end: 19, activity: 'working', location: 'forge', available: true },
                { start: 19, end: 21, activity: 'dinner', location: 'tavern', available: true },
                { start: 21, end: 5, activity: 'sleeping', location: 'home', available: false }
            ]
        },
        guard: {
            name: 'Guard Schedule',
            activities: [
                { start: 6, end: 7, activity: 'waking', location: 'barracks', available: false },
                { start: 7, end: 15, activity: 'patrolling', location: 'streets', available: true },
                { start: 15, end: 16, activity: 'break', location: 'tavern', available: true },
                { start: 16, end: 22, activity: 'patrolling', location: 'streets', available: true },
                { start: 22, end: 6, activity: 'sleeping', location: 'barracks', available: false }
            ]
        },
        nightGuard: {
            name: 'Night Guard Schedule',
            activities: [
                { start: 18, end: 19, activity: 'waking', location: 'barracks', available: false },
                { start: 19, end: 6, activity: 'patrolling', location: 'streets', available: true },
                { start: 6, end: 7, activity: 'breakfast', location: 'tavern', available: false },
                { start: 7, end: 18, activity: 'sleeping', location: 'barracks', available: false }
            ]
        },
        innkeeper: {
            name: 'Innkeeper Schedule',
            activities: [
                { start: 5, end: 6, activity: 'waking', location: 'inn', available: false },
                { start: 6, end: 23, activity: 'working', location: 'inn', available: true },
                { start: 23, end: 5, activity: 'sleeping', location: 'inn', available: false }
            ]
        },
        farmer: {
            name: 'Farmer Schedule',
            activities: [
                { start: 4, end: 5, activity: 'waking', location: 'farmhouse', available: false },
                { start: 5, end: 12, activity: 'working', location: 'fields', available: true },
                { start: 12, end: 13, activity: 'lunch', location: 'farmhouse', available: false },
                { start: 13, end: 18, activity: 'working', location: 'fields', available: true },
                { start: 18, end: 19, activity: 'dinner', location: 'farmhouse', available: false },
                { start: 19, end: 20, activity: 'relaxing', location: 'tavern', available: true },
                { start: 20, end: 4, activity: 'sleeping', location: 'farmhouse', available: false }
            ]
        },
        noble: {
            name: 'Noble Schedule',
            activities: [
                { start: 9, end: 10, activity: 'waking', location: 'manor', available: false },
                { start: 10, end: 11, activity: 'breakfast', location: 'manor', available: false },
                { start: 11, end: 14, activity: 'business', location: 'guildhall', available: true },
                { start: 14, end: 15, activity: 'lunch', location: 'manor', available: false },
                { start: 15, end: 18, activity: 'leisure', location: 'gardens', available: true },
                { start: 18, end: 20, activity: 'dinner', location: 'manor', available: false },
                { start: 20, end: 23, activity: 'socializing', location: 'tavern', available: true },
                { start: 23, end: 9, activity: 'sleeping', location: 'manor', available: false }
            ]
        },
        thief: {
            name: 'Thief Schedule',
            activities: [
                { start: 14, end: 15, activity: 'waking', location: 'hideout', available: false },
                { start: 15, end: 18, activity: 'scouting', location: 'market', available: true },
                { start: 18, end: 20, activity: 'eating', location: 'tavern', available: true },
                { start: 20, end: 4, activity: 'working', location: 'streets', available: true },
                { start: 4, end: 14, activity: 'sleeping', location: 'hideout', available: false }
            ]
        },
        priest: {
            name: 'Priest Schedule',
            activities: [
                { start: 5, end: 6, activity: 'prayer', location: 'temple', available: false },
                { start: 6, end: 7, activity: 'breakfast', location: 'temple', available: false },
                { start: 7, end: 12, activity: 'services', location: 'temple', available: true },
                { start: 12, end: 13, activity: 'lunch', location: 'temple', available: false },
                { start: 13, end: 17, activity: 'charity', location: 'streets', available: true },
                { start: 17, end: 19, activity: 'services', location: 'temple', available: true },
                { start: 19, end: 20, activity: 'dinner', location: 'temple', available: false },
                { start: 20, end: 21, activity: 'prayer', location: 'temple', available: false },
                { start: 21, end: 5, activity: 'sleeping', location: 'temple', available: false }
            ]
        },
        mage: {
            name: 'Mage Schedule',
            activities: [
                { start: 8, end: 9, activity: 'waking', location: 'tower', available: false },
                { start: 9, end: 12, activity: 'research', location: 'tower', available: true },
                { start: 12, end: 13, activity: 'lunch', location: 'tower', available: false },
                { start: 13, end: 18, activity: 'experiments', location: 'tower', available: true },
                { start: 18, end: 20, activity: 'dinner', location: 'tavern', available: true },
                { start: 20, end: 2, activity: 'stargazing', location: 'tower', available: true },
                { start: 2, end: 8, activity: 'sleeping', location: 'tower', available: false }
            ]
        }
    },

    // Active NPC schedules
    npcSchedules: new Map(),

    // Location mappings per settlement
    locationMappings: {},

    // Current game hour (0-23)
    currentHour: 8,

    // Initialize the system
    init() {
        this.createStyles();
        this.setupTimeSync();
        this.generateLocationMappings();

        // Listen for time changes
        if (typeof EventBus !== 'undefined') {
            EventBus.on('time:hourChanged', (data) => {
                this.currentHour = data.hour;
                this.updateAllNPCs();
            });

            EventBus.on('location:entered', (data) => {
                this.onLocationEntered(data.locationId);
            });
        }

        console.log('📅 NPCScheduleSystem initialized - NPCs got their own lives, deal with it 🦇');
    },

    // Sync with game time
    setupTimeSync() {
        // Get current time from game
        if (typeof game !== 'undefined' && game.time) {
            this.currentHour = game.time.hour || 8;
        } else if (typeof DayNightCycle !== 'undefined') {
            this.currentHour = DayNightCycle.currentHour || 8;
        }

        // Update periodically
        setInterval(() => {
            if (typeof game !== 'undefined' && game.time) {
                this.currentHour = game.time.hour;
            } else if (typeof DayNightCycle !== 'undefined') {
                this.currentHour = DayNightCycle.currentHour;
            }
        }, 1000);
    },

    // Generate location mappings for settlements
    generateLocationMappings() {
        // Default mappings that can be overridden per settlement
        this.locationMappings = {
            default: {
                home: 'residential',
                shop: 'market',
                forge: 'blacksmith',
                tavern: 'tavern',
                inn: 'inn',
                barracks: 'barracks',
                streets: 'main_square',
                fields: 'farmland',
                farmhouse: 'farmland',
                manor: 'noble_district',
                guildhall: 'guild_hall',
                gardens: 'gardens',
                hideout: 'slums',
                market: 'market',
                temple: 'temple',
                tower: 'mage_tower'
            }
        };
    },

    // Register an NPC with a schedule
    registerNPC(npcId, scheduleType, homeLocation = null, customSchedule = null) {
        const template = customSchedule || this.scheduleTemplates[scheduleType];
        if (!template) {
            console.warn(`Unknown schedule type: ${scheduleType}`);
            return;
        }

        this.npcSchedules.set(npcId, {
            scheduleType,
            schedule: template,
            homeLocation: homeLocation,
            currentActivity: null,
            currentLocation: null,
            lastUpdate: 0
        });

        // Initial update
        this.updateNPC(npcId);
    },

    // Unregister an NPC
    unregisterNPC(npcId) {
        this.npcSchedules.delete(npcId);
    },

    // Get NPC's current activity
    getCurrentActivity(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return null;

        const hour = this.currentHour;
        const schedule = npcData.schedule;

        for (const slot of schedule.activities) {
            // Handle overnight activities (e.g., 22-6)
            if (slot.start > slot.end) {
                if (hour >= slot.start || hour < slot.end) {
                    return slot;
                }
            } else {
                if (hour >= slot.start && hour < slot.end) {
                    return slot;
                }
            }
        }

        return schedule.activities[0]; // Fallback
    },

    // Update a single NPC's state
    updateNPC(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return;

        const activity = this.getCurrentActivity(npcId);
        if (!activity) return;

        const previousActivity = npcData.currentActivity;
        const previousLocation = npcData.currentLocation;

        npcData.currentActivity = activity.activity;
        npcData.currentLocation = activity.location;
        npcData.isAvailable = activity.available;
        npcData.lastUpdate = Date.now();

        // Emit events if changed
        if (typeof EventBus !== 'undefined') {
            if (previousActivity !== activity.activity) {
                EventBus.emit('npc:activityChanged', {
                    npcId,
                    previousActivity,
                    newActivity: activity.activity,
                    location: activity.location,
                    available: activity.available
                });
            }

            if (previousLocation !== activity.location) {
                EventBus.emit('npc:locationChanged', {
                    npcId,
                    previousLocation,
                    newLocation: activity.location
                });
            }
        }
    },

    // Update all NPCs
    updateAllNPCs() {
        for (const npcId of this.npcSchedules.keys()) {
            this.updateNPC(npcId);
        }

        // Emit batch update event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('npc:schedulesUpdated', {
                hour: this.currentHour,
                npcCount: this.npcSchedules.size
            });
        }
    },

    // Check if NPC is available for interaction
    isNPCAvailable(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return true; // Unscheduled NPCs are always available

        const activity = this.getCurrentActivity(npcId);
        return activity ? activity.available : true;
    },

    // Get NPC's current location
    getNPCLocation(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return null;

        const activity = this.getCurrentActivity(npcId);
        return activity ? activity.location : null;
    },

    // Get all NPCs at a location
    getNPCsAtLocation(location) {
        const npcs = [];

        for (const [npcId, npcData] of this.npcSchedules) {
            const activity = this.getCurrentActivity(npcId);
            if (activity && activity.location === location) {
                npcs.push({
                    npcId,
                    activity: activity.activity,
                    available: activity.available
                });
            }
        }

        return npcs;
    },

    // Get unavailability message for NPC
    getUnavailabilityMessage(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return null;

        const activity = this.getCurrentActivity(npcId);
        if (!activity || activity.available) return null;

        const messages = {
            sleeping: [
                "Zzz... *snoring sounds*",
                "They're fast asleep. Come back during the day.",
                "The lights are out. They must be sleeping."
            ],
            waking: [
                "They're just waking up. Give them a moment.",
                "*yawning* Come back in a bit...",
                "Still getting ready for the day."
            ],
            breakfast: [
                "They're having breakfast. Check back soon.",
                "Breaking their fast. Won't be long.",
                "Enjoying their morning meal."
            ],
            lunch: [
                "Gone for lunch. Back in about an hour.",
                "Taking their midday meal.",
                "Stepped out for lunch."
            ],
            dinner: [
                "Having dinner with family.",
                "Enjoying their evening meal.",
                "Dining right now. Come back later."
            ],
            prayer: [
                "Deep in prayer. Do not disturb.",
                "Communing with the divine.",
                "In meditation. Please wait."
            ]
        };

        const activityMessages = messages[activity.activity];
        if (activityMessages) {
            return activityMessages[Math.floor(Math.random() * activityMessages.length)];
        }

        return `Currently ${activity.activity}. Please wait.`;
    },

    // Handle location entry
    onLocationEntered(locationId) {
        const npcsHere = this.getNPCsAtLocation(locationId);

        if (npcsHere.length > 0 && typeof EventBus !== 'undefined') {
            EventBus.emit('npc:presentAtLocation', {
                locationId,
                npcs: npcsHere
            });
        }
    },

    // Convert hour to AM/PM format
    formatHourAMPM(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:00 ${period}`;
    },

    // Get schedule preview for an NPC
    getSchedulePreview(npcId) {
        const npcData = this.npcSchedules.get(npcId);
        if (!npcData) return null;

        return npcData.schedule.activities.map(slot => ({
            time: `${this.formatHourAMPM(slot.start)} - ${this.formatHourAMPM(slot.end)}`,
            activity: slot.activity.charAt(0).toUpperCase() + slot.activity.slice(1),
            location: slot.location,
            available: slot.available
        }));
    },

    // Show NPC schedule UI
    showScheduleUI(npcId, npcName = 'NPC') {
        const schedule = this.getSchedulePreview(npcId);
        if (!schedule) return;

        const currentActivity = this.getCurrentActivity(npcId);

        const panel = document.createElement('div');
        panel.className = 'npc-schedule-panel';
        panel.innerHTML = `
            <div class="schedule-header">
                <h3>📅 ${npcName}'s Schedule</h3>
                <button class="schedule-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="schedule-current">
                <span class="current-label">Currently:</span>
                <span class="current-activity">${currentActivity.activity}</span>
                <span class="current-location">@ ${currentActivity.location}</span>
                <span class="current-status ${currentActivity.available ? 'available' : 'unavailable'}">
                    ${currentActivity.available ? '✓ Available' : '✗ Busy'}
                </span>
            </div>
            <div class="schedule-list">
                ${schedule.map(slot => `
                    <div class="schedule-slot ${slot.activity.toLowerCase() === currentActivity.activity ? 'current' : ''}">
                        <span class="slot-time">${slot.time}</span>
                        <span class="slot-activity">${slot.activity}</span>
                        <span class="slot-location">${slot.location}</span>
                        <span class="slot-status ${slot.available ? 'available' : 'unavailable'}">
                            ${slot.available ? '✓' : '✗'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(panel);

        // Auto-remove after click outside
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!panel.contains(e.target)) {
                    panel.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    },

    // Get activity icon
    getActivityIcon(activity) {
        const icons = {
            sleeping: '😴',
            waking: '🌅',
            breakfast: '🍳',
            lunch: '🥪',
            dinner: '🍖',
            working: '⚒️',
            patrolling: '🛡️',
            break: '☕',
            relaxing: '🍺',
            business: '📜',
            leisure: '🌳',
            socializing: '🗣️',
            scouting: '👀',
            eating: '🍽️',
            prayer: '🙏',
            services: '⛪',
            charity: '❤️',
            research: '📚',
            experiments: '🧪',
            stargazing: '🔭'
        };

        return icons[activity] || '📌';
    },

    // Create CSS styles
    createStyles() {
        if (document.getElementById('npc-schedule-styles')) return;

        const style = document.createElement('style');
        style.id = 'npc-schedule-styles';
        style.textContent = `
            .npc-schedule-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%);
                border: 2px solid #4a4a6a;
                border-radius: 12px;
                padding: 20px;
                min-width: 350px;
                max-width: 450px;
                z-index: 600; /* Z-INDEX STANDARD: Panel overlays (NPC schedule) */
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                font-family: 'Crimson Text', serif;
            }

            .schedule-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #4a4a6a;
            }

            .schedule-header h3 {
                margin: 0;
                color: #ffd700;
                font-family: 'Cinzel', serif;
            }

            .schedule-close {
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
            }

            .schedule-close:hover {
                color: #dc3545;
            }

            .schedule-current {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
                padding: 12px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .current-label {
                color: #888;
            }

            .current-activity {
                color: #ffd700;
                font-weight: bold;
                text-transform: capitalize;
            }

            .current-location {
                color: #6c757d;
            }

            .current-status {
                margin-left: auto;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85em;
            }

            .current-status.available {
                background: rgba(40, 167, 69, 0.2);
                color: #28a745;
            }

            .current-status.unavailable {
                background: rgba(220, 53, 69, 0.2);
                color: #dc3545;
            }

            .schedule-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .schedule-slot {
                display: grid;
                grid-template-columns: 100px 1fr 80px 30px;
                gap: 10px;
                align-items: center;
                padding: 8px;
                border-bottom: 1px solid #2a2a3e;
                transition: background 0.2s;
            }

            .schedule-slot:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .schedule-slot.current {
                background: rgba(255, 215, 0, 0.1);
                border-left: 3px solid #ffd700;
            }

            .slot-time {
                color: #6c757d;
                font-size: 0.9em;
            }

            .slot-activity {
                color: #ccc;
                text-transform: capitalize;
            }

            .slot-location {
                color: #888;
                font-size: 0.85em;
            }

            .slot-status.available {
                color: #28a745;
            }

            .slot-status.unavailable {
                color: #dc3545;
            }

            /* NPC location indicator */
            .npc-location-indicator {
                position: absolute;
                bottom: -5px;
                right: -5px;
                background: #1a1a2e;
                border: 1px solid #4a4a6a;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            .npc-unavailable-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: inherit;
            }

            .npc-unavailable-text {
                color: #dc3545;
                font-size: 0.8em;
                text-align: center;
                padding: 5px;
            }
        `;
        document.head.appendChild(style);
    },

    // Save state
    getSaveData() {
        const scheduleData = {};
        for (const [npcId, data] of this.npcSchedules) {
            scheduleData[npcId] = {
                scheduleType: data.scheduleType,
                homeLocation: data.homeLocation
            };
        }
        return scheduleData;
    },

    // Load state
    loadSaveData(data) {
        if (!data) return;

        for (const [npcId, scheduleInfo] of Object.entries(data)) {
            this.registerNPC(npcId, scheduleInfo.scheduleType, scheduleInfo.homeLocation);
        }
    },

    // Alias for updateAllNPCs - used by NPCManager.update() 🦇
    update() {
        this.updateAllNPCs();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NPCScheduleSystem.init());
} else {
    NPCScheduleSystem.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCScheduleSystem;
}
