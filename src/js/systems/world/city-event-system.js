// ═══════════════════════════════════════════════════════════════
// CITY EVENT SYSTEM - disrupting your plans daily
// ═══════════════════════════════════════════════════════════════
// Version: 0.88 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const CityEventSystem = {
    // 🎲 Event types - varieties of disruption to ruin your plans
    eventTypes: {
        FESTIVAL: 'festival',
        RAID: 'raid',
        DROUGHT: 'drought',
        BOOM: 'economic_boom',
        RECESSION: 'recession',
        PLAGUE: 'plague',
        CELEBRATION: 'celebration',
        CONSTRUCTION: 'construction',
        POLITICS: 'politics'
    },

    // Active city events
    activeEvents: {},

    // Event templates - using string keys directly (not this.eventTypes)
    eventTemplates: {
        'festival': {
            name: 'Harvest Festival',
            description: 'The city is celebrating a bountiful harvest! Prices are lower and spirits are high.',
            duration: 48, // 2 days
            effects: {
                priceModifier: 0.9, // 10% lower prices
                happinessBonus: 10,
                specialItems: ['ale', 'bread', 'fruits']
            },
            chance: 0.02
        },
        'raid': {
            name: 'Bandit Raid',
            description: 'Bandits have raided the city! Trade is disrupted and prices are volatile.',
            duration: 24, // 1 day
            effects: {
                priceModifier: 1.2, // 20% higher prices
                dangerLevel: 0.3,
                specialItems: ['weapons', 'armor']
            },
            chance: 0.01
        },
        'drought': {
            name: 'Drought',
            description: 'A severe drought has hit the region. Food and water prices are skyrocketing.',
            duration: 72, // 3 days
            effects: {
                priceModifier: 1.5, // 50% higher food/water prices
                specialItems: ['water', 'food']
            },
            chance: 0.015
        },
        'economic_boom': {
            name: 'Economic Boom',
            description: 'The economy is booming! Trade is prosperous and profits are high.',
            duration: 96, // 4 days
            effects: {
                priceModifier: 1.1, // 10% higher sell prices
                specialItems: ['luxury_goods', 'gems']
            },
            chance: 0.025
        },
        'recession': {
            name: 'Economic Recession',
            description: 'Times are tough. Trade is slow and profits are low.',
            duration: 120, // 5 days
            effects: {
                priceModifier: 0.8, // 20% lower prices
                specialItems: ['tools', 'wood', 'stone', 'iron_ore']
            },
            chance: 0.02
        },
        'plague': {
            name: 'Plague Outbreak',
            description: 'A plague has struck the city! Trade is dangerous and medical supplies are in demand.',
            duration: 48, // 2 days
            effects: {
                priceModifier: 1.3, // 30% higher medical prices
                dangerLevel: 0.5,
                specialItems: ['medical_plants', 'herbs']
            },
            chance: 0.005
        },
        'celebration': {
            name: 'Royal Celebration',
            description: 'The nobility is celebrating! Luxury goods are in high demand.',
            duration: 24, // 1 day
            effects: {
                priceModifier: 1.2, // 20% higher luxury prices
                specialItems: ['luxury_items', 'wine', 'silk', 'jewelry']
            },
            chance: 0.015
        },
        'construction': {
            name: 'Great Construction',
            description: 'Major construction projects are underway. Building materials are in demand.',
            duration: 72, // 3 days
            effects: {
                priceModifier: 1.15, // 15% higher material prices
                specialItems: ['wood', 'stone', 'tools']
            },
            chance: 0.02
        },
        'politics': {
            name: 'Political Unrest',
            description: 'Political tensions are high. Trade is uncertain and prices are volatile.',
            duration: 48, // 2 days
            effects: {
                priceModifier: 1.1, // 10% price fluctuation
                dangerLevel: 0.2
            },
            chance: 0.01
        }
    },

    // Initialize event system
    init() {
        this.loadEvents();
        this.startEventTimer();
    },

    // Load events from localStorage
    loadEvents() {
        const saved = localStorage.getItem('tradingGameCityEvents');
        if (saved) {
            try {
                this.activeEvents = JSON.parse(saved);
            } catch (e) {
                // 🖤 Corrupt data? Nuke it and start fresh - silent fallback
                localStorage.removeItem('tradingGameCityEvents');
                this.activeEvents = {};
            }
        }
    },

    // Save events to localStorage
    saveEvents() {
        try {
            localStorage.setItem('tradingGameCityEvents', JSON.stringify(this.activeEvents));
        } catch (e) {
            // 🖤 Storage full or blocked - silent fail, not critical
        }
    },

    // Start event timer
    startEventTimer() {
        // Check for random events every game minute
        TimerManager.setInterval(() => {
            if (game.state === GameState.PLAYING && !TimeSystem.isPaused) {
                this.checkRandomEvents();
                this.updateEvents();
            }
        }, 60000); // Check every minute of game time
    },

    // Check for random events
    checkRandomEvents(cityId = null) {
        const targetCityId = cityId || (game.currentLocation && game.currentLocation.id);
        if (!targetCityId) return;

        // Don't trigger events if there's already an active event
        if (this.activeEvents[targetCityId]) return;

        // Check each event type
        for (const [eventType, template] of Object.entries(this.eventTemplates)) {
            if (Math.random() < template.chance) {
                this.triggerEvent(targetCityId, eventType);
                break; // Only one event at a time
            }
        }
    },

    // Trigger an event
    triggerEvent(cityId, eventType) {
        const template = this.eventTemplates[eventType];
        if (!template) return;

        const event = {
            type: eventType,
            name: template.name,
            description: template.description,
            startTime: TimeSystem.getTotalMinutes(),
            duration: template.duration,
            effects: { ...template.effects },
            active: true
        };

        this.activeEvents[cityId] = event;
        this.saveEvents();

        // Apply immediate effects
        this.applyEventEffects(cityId, event);

        // Notify player
        addMessage(`📢 Event in ${cityId}: ${event.name}`);
        addMessage(event.description);
    },

    // Apply event effects
    applyEventEffects(cityId, event) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices) return;

        // Apply price modifiers to market items
        for (const [itemId, marketData] of Object.entries(location.marketPrices)) {
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;

            // Check if item is affected by event
            let shouldModify = false;
            let priceModifier = 1.0;

            if (event.effects.specialItems && event.effects.specialItems.includes(itemId)) {
                shouldModify = true;
                priceModifier = event.effects.priceModifier || 1.0;
            }

            if (shouldModify) {
                marketData.price = Math.round(marketData.price * priceModifier);
                marketData.eventModified = true;
            }
        }

        // Apply reputation effects
        if (event.effects.happinessBonus) {
            // This would integrate with player stats system
            if (game.player && game.player.stats) {
                game.player.stats.happiness = Math.min(
                    game.player.stats.maxHappiness || 100,
                    game.player.stats.happiness + event.effects.happinessBonus
                );
            }
        }
    },

    // Update events (remove expired ones)
    updateEvents() {
        const currentTime = TimeSystem.getTotalMinutes();
        let eventsUpdated = false;

        for (const [cityId, event] of Object.entries(this.activeEvents)) {
            if (event.active && currentTime >= event.startTime + event.duration) {
                // Event has expired
                event.active = false;
                eventsUpdated = true;

                // Remove event effects
                this.removeEventEffects(cityId, event);

                // Notify player
                addMessage(`📢 Event ended in ${cityId}: ${event.name}`);
            }
        }

        if (eventsUpdated) {
            this.saveEvents();
        }
    },

    // Remove event effects
    removeEventEffects(cityId, event) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices) return;

        // Restore original prices for modified items
        for (const [itemId, marketData] of Object.entries(location.marketPrices)) {
            if (marketData.eventModified) {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    // Restore base price
                    marketData.price = ItemDatabase.calculatePrice(itemId);
                    marketData.eventModified = false;
                }
            }
        }
    },

    // Get active events for a city
    getCityEvents(cityId) {
        const event = this.activeEvents[cityId];
        if (!event || !event.active) {
            return [];
        }
        return [event];
    },

    // Get all active events
    getAllActiveEvents() {
        const events = [];
        for (const [cityId, event] of Object.entries(this.activeEvents)) {
            if (event && event.active) {
                events.push({
                    cityId: cityId,
                    ...event
                });
            }
        }
        return events;
    },

    // Force end an event (for testing or admin)
    forceEndEvent(cityId) {
        const event = this.activeEvents[cityId];
        if (event && event.active) {
            event.active = false;
            this.removeEventEffects(cityId, event);
            this.saveEvents();
            addMessage(`Event ${event.name} in ${cityId} has been force-ended.`);
        }
    },

    // Get event description for UI
    getEventDescription(cityId) {
        const event = this.activeEvents[cityId];
        if (!event || !event.active) {
            return 'No active events.';
        }

        const timeRemaining = event.startTime + event.duration - TimeSystem.getTotalMinutes();
        const hoursRemaining = Math.floor(timeRemaining / 60);
        const minutesRemaining = timeRemaining % 60;

        return `
            <div class="event-info">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <p><strong>Time remaining:</strong> ${hoursRemaining}h ${minutesRemaining}m</p>
            </div>
        `;
    },

    // Get event history for save system
    getEventHistory() {
        // Return a simplified history of past events
        const history = [];
        for (const [cityId, event] of Object.entries(this.activeEvents)) {
            if (event && !event.active) {
                history.push({
                    cityId: cityId,
                    type: event.type,
                    name: event.name,
                    endTime: event.startTime + event.duration
                });
            }
        }
        return history;
    },
    
    // Load active events from save system
    loadActiveEvents(events) {
        this.activeEvents = {};
        for (const event of events || []) {
            this.activeEvents[event.cityId] = event;
        }
        this.saveEvents();
    },
    
    // Load event history from save system
    loadEventHistory(history) {
        // This would load past events if we had a separate history storage
        // For now, we'll just log it
        console.log('Loaded event history:', history);
    },
    
    // Reset all events
    resetAllEvents() {
        this.activeEvents = {};
        this.saveEvents();
        addMessage('All city events have been reset!');
    }
};

// Initialize city event system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            CityEventSystem.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        CityEventSystem.init();
    }, 100);
}