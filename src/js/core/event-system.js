// ═══════════════════════════════════════════════════════════════
// EVENT SYSTEM - random events popping off like intrusive thoughts
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// random events, market fluctuations, lucky finds, tax collectors
// ═══════════════════════════════════════════════════════════════

const EventSystem = {
    events: [],
    scheduledEvents: [],
    randomEventChance: 0.05,  // 5% chaos factor (seems low but trust me)

    // init - summoning the event demons
    init() {
        this.events = [];
        this.scheduledEvents = [];
        this.setupRandomEvents();
        console.log('🎲 EventSystem initialized - chaos awaits');
    },

    // setupRandomEvents - defining the chaos that awaits
    setupRandomEvents() {
        // market events (capitalism but make it medieval)
        this.addEventType('market_boom', {
            name: 'Market Boom',
            description: 'The merchant guild prospers! Prices are favorable.',
            effects: { priceBonus: 0.2 },
            duration: 120, // 2 hours
            chance: 0.02
        });

        this.addEventType('market_crash', {
            name: 'Market Crash',
            description: 'The king imposes new taxes! Prices are falling.',
            effects: { pricePenalty: -0.3 },
            duration: 180, // 3 hours
            chance: 0.01
        });

        // Travel event
        this.addEventType('travel_complete', {
            name: 'Travel Complete',
            description: 'You have arrived at your destination.',
            effects: {},
            duration: 0,
            chance: 0
        });

        // lucky events - trigger lucky achievements!
        this.addEventType('lucky_find', {
            name: 'Lucky Find!',
            description: 'You stumble upon a small pouch of gold coins hidden in the road! Fortune smiles upon you today.',
            effects: { goldReward: 50 },
            duration: 0,
            chance: 0.005 // Rare!
        });

        this.addEventType('treasure_found', {
            name: 'Hidden Treasure!',
            description: 'While resting, you notice something glinting in the dirt. You\'ve found a buried treasure chest!',
            effects: { goldReward: 200, itemReward: 'rare_gem' },
            duration: 0,
            chance: 0.002 // Very rare!
        });

        this.addEventType('blessing', {
            name: 'Traveler\'s Blessing',
            description: 'A wandering monk offers you a blessing for your journey. Your next trades will be more fortunate.',
            effects: { priceBonus: 0.15 },
            duration: 180, // 3 hours
            chance: 0.01
        });

        // negative events - balance the luck!
        this.addEventType('tax_collector', {
            name: 'Tax Collector',
            description: 'The king\'s tax collector approaches. You must pay a small toll for using the road.',
            effects: { goldLost: 25 },
            duration: 0,
            chance: 0.01
        });

        this.addEventType('bad_weather', {
            name: 'Harsh Conditions',
            description: 'The weather has taken a turn for the worse. Travel will be slower for a while.',
            effects: { travelSpeedPenalty: -0.2 },
            duration: 120, // 2 hours
            chance: 0.015
        });
    },

    // Add event type definition
    addEventType(id, eventData) {
        this.eventTypes = this.eventTypes || {};
        this.eventTypes[id] = eventData;
    },

    // Schedule an event for specific time
    scheduleEvent(eventId, triggerTime, data = {}) {
        this.scheduledEvents.push({
            id: eventId,
            triggerTime: triggerTime,
            data: data,
            triggered: false
        });
    },

    // trigger random events - weather events removed, WeatherSystem handles all weather
    // Added cooldown to prevent spam - was triggering every frame at 5% = ~3 events/second!
    lastEventCheck: 0,
    eventCheckCooldown: 120000, // check for random events once per 2 minutes

    // daily event limit - max 2 events per game day
    eventsToday: 0,
    MAX_EVENTS_PER_DAY: 2,
    lastEventDay: -1, // Track which game day we're on

    checkRandomEvents() {
        const now = Date.now();
        // cooldown check - don't spam events every frame!
        if (now - this.lastEventCheck < this.eventCheckCooldown) return;
        this.lastEventCheck = now;

        // check daily limit - reset counter on new day
        const currentDay = typeof TimeMachine !== 'undefined' ? TimeMachine.currentDay : 0;
        if (currentDay !== this.lastEventDay) {
            this.lastEventDay = currentDay;
            this.eventsToday = 0;
            console.log(`🎲 New day ${currentDay} - event counter reset`);
        }

        // if we've hit the daily limit, no more events today!
        if (this.eventsToday >= this.MAX_EVENTS_PER_DAY) {
            return;
        }

        if (Math.random() < this.randomEventChance) {
            const eventTypes = Object.keys(this.eventTypes || {});
            if (eventTypes.length > 0) {
                const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                this.triggerEvent(randomType);
                this.eventsToday++;
                console.log(`🎲 Event triggered (${this.eventsToday}/${this.MAX_EVENTS_PER_DAY} today)`);
            }
        }
    },

    // Trigger a specific event
    triggerEvent(eventId, data = {}) {
        const eventType = this.eventTypes?.[eventId];
        if (!eventType) return;

        const event = {
            id: eventId,
            name: eventType.name,
            description: eventType.description,
            effects: { ...eventType.effects, ...data },
            startTime: typeof TimeMachine !== 'undefined' ? TimeMachine.getTotalMinutes() : 0,
            duration: eventType.duration || 60,
            active: true
        };

        this.events.push(event);
        this.applyEventEffects(event);

        // dispatch custom event - RandomEventPanel listens for this
        const isSilent = eventType.silent || eventId === 'travel_complete';
        document.dispatchEvent(new CustomEvent('random-event-triggered', {
            detail: { event, silent: isSilent }
        }));

        // message log notification - always show for non-travel events
        if (eventId !== 'travel_complete') {
            const icon = eventType.silent ? '🐫' : '🎲';
            if (typeof addMessage === 'function') {
                addMessage(`${icon} ${event.name}: ${event.description}`, 'event');
            }
        }

        console.log(`🎲 Event triggered: ${event.name}`);
    },

    // Apply event effects to game state
    applyEventEffects(event) {
        if (event.effects.priceBonus && typeof game !== 'undefined') {
            game.marketPriceModifier = (game.marketPriceModifier || 1) * (1 + event.effects.priceBonus);
        }

        if (event.effects.pricePenalty && typeof game !== 'undefined') {
            game.marketPriceModifier = (game.marketPriceModifier || 1) * (1 + event.effects.pricePenalty);
        }

        if (event.effects.travelSpeedBonus && typeof game !== 'undefined') {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) * (1 + event.effects.travelSpeedBonus);
        }

        if (event.effects.travelSpeedPenalty && typeof game !== 'undefined') {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) * (1 + event.effects.travelSpeedPenalty);
        }

        // gold reward from lucky events
        if (event.effects.goldReward) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.add(event.effects.goldReward, 'event_reward');
            } else if (typeof game !== 'undefined' && game.player) {
                game.player.gold = (game.player.gold || 0) + event.effects.goldReward;
            }
            if (typeof addMessage === 'function') {
                addMessage(`💰 You found ${event.effects.goldReward} gold!`, 'success');
            }

            // track for achievements
            if (typeof AchievementSystem !== 'undefined') {
                AchievementSystem.stats.treasuresFound = (AchievementSystem.stats.treasuresFound || 0) + 1;
            }
        }

        // gold lost from negative events
        if (event.effects.goldLost) {
            const currentGold = typeof PlayerStateManager !== 'undefined'
                ? PlayerStateManager.gold.get()
                : (typeof game !== 'undefined' && game.player ? game.player.gold || 0 : 0);

            const lostAmount = Math.min(event.effects.goldLost, currentGold);

            if (lostAmount > 0) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.remove(lostAmount, 'event_tax');
                } else if (typeof game !== 'undefined' && game.player) {
                    game.player.gold = Math.max(0, (game.player.gold || 0) - lostAmount);
                }
                if (typeof addMessage === 'function') {
                    addMessage(`💸 You lost ${lostAmount} gold...`, 'warning');
                }
            }
        }

        // item reward from events
        if (event.effects.itemReward) {
            const itemId = event.effects.itemReward;
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.inventory.add(itemId, 1, 'event_reward');
            } else if (typeof game !== 'undefined' && game.player) {
                game.player.inventory = game.player.inventory || {};
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + 1;
            }
            // emit item-received for quest progress tracking
            document.dispatchEvent(new CustomEvent('item-received', {
                detail: { item: itemId, quantity: 1, source: 'event_reward' }
            }));
            if (typeof addMessage === 'function') {
                addMessage(`🎁 You received: ${itemId}!`, 'success');
            }
        }

        // Handle special events
        if (event.id === 'travel_complete' && event.data?.destination) {
            if (typeof GameWorld !== 'undefined') {
                GameWorld.completeTravel(event.data.destination);
            }
        }

        if (event.effects.newItems) {
            this.refreshMarketItems();
        }

        // update UI after applying effects
        if (event.effects.goldReward || event.effects.goldLost || event.effects.itemReward) {
            this.updateUI();
            document.dispatchEvent(new CustomEvent('player-gold-changed', {
                detail: { gold: typeof game !== 'undefined' && game.player ? game.player.gold || 0 : 0 }
            }));
        }
    },

    // Update UI helper
    updateUI() {
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay?.();
    },

    // Refresh market items for all locations
    refreshMarketItems() {
        if (typeof GameWorld === 'undefined' || !GameWorld.locations) return;

        Object.keys(GameWorld.locations).forEach(locationId => {
            const location = GameWorld.locations[locationId];

            // skip if location has no specialties array
            if (!location.specialties || !Array.isArray(location.specialties)) return;

            // Add new items based on location specialties
            location.specialties.forEach(specialty => {
                if (!location.marketPrices[specialty]) {
                    location.marketPrices[specialty] = {
                        price: GameWorld.getBasePrice(specialty),
                        stock: Math.floor(Math.random() * 10) + 5
                    };
                }
            });

            // Restock existing items
            Object.keys(location.marketPrices).forEach(itemType => {
                const restockAmount = Math.floor(Math.random() * 5) + 2;
                location.marketPrices[itemType].stock = Math.min(
                    location.marketPrices[itemType].stock + restockAmount,
                    this.getMaxStock(location.type, itemType)
                );
            });
        });

        if (typeof addMessage === 'function') {
            addMessage('🛒 Markets have been refreshed with new goods!');
        }
    },

    // Get maximum stock based on location type and item
    getMaxStock(locationType, itemType) {
        const stockLimits = {
            village: { base: 20, specialty: 15 },
            town: { base: 40, specialty: 30 },
            city: { base: 80, specialty: 60 }
        };

        const limits = stockLimits[locationType] || stockLimits.town;
        return limits.base;
    },

    // Update events (remove expired ones)
    update() {
        const currentTime = typeof TimeMachine !== 'undefined' ? TimeMachine.getTotalMinutes() : 0;

        // Check scheduled events
        this.scheduledEvents.forEach(event => {
            if (!event.triggered && currentTime >= event.triggerTime) {
                this.triggerEvent(event.id, event.data);
                event.triggered = true;
            }
        });

        // Remove expired events
        this.events = this.events.filter(event => {
            if (currentTime >= event.startTime + event.duration) {
                this.removeEventEffects(event);
                return false;
            }
            return true;
        });

        // Check for random events
        this.checkRandomEvents();
    },

    // Remove event effects
    removeEventEffects(event) {
        if (typeof game === 'undefined') return;

        if (event.effects.priceBonus) {
            game.marketPriceModifier = (game.marketPriceModifier || 1) / (1 + event.effects.priceBonus);
        }

        if (event.effects.pricePenalty) {
            game.marketPriceModifier = (game.marketPriceModifier || 1) / (1 + event.effects.pricePenalty);
        }

        if (event.effects.travelSpeedBonus) {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) / (1 + event.effects.travelSpeedBonus);
        }

        if (event.effects.travelSpeedPenalty) {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) / (1 + event.effects.travelSpeedPenalty);
        }
    },

    // Get active events
    getActiveEvents() {
        return this.events.filter(event => event.active);
    },

    // ═══════════════════════════════════════════════════════════════
    // save/load integration - restore events on game load
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get save data for SaveManager
     * @returns {object} Serializable event state
     */
    getSaveData() {
        return {
            events: this.events || [],
            scheduledEvents: this.scheduledEvents || [],
            lastEventCheck: this.lastEventCheck || 0
        };
    },

    /**
     * Load save data from SaveManager
     * @param {object} data - Saved event state
     */
    loadSaveData(data) {
        if (!data) return;

        // restore active events
        this.events = data.events || data.activeEvents || [];
        this.scheduledEvents = data.scheduledEvents || [];
        this.lastEventCheck = data.lastEventCheck || 0;

        // re-apply effects for active events
        const activeEvents = this.events.filter(e => e.active);
        activeEvents.forEach(event => {
            console.log(`🎲 Restoring event effects: ${event.name}`);
            this.applyEventEffects(event);
        });

        console.log(`🎲 EventSystem: Restored ${this.events.length} events, ${this.scheduledEvents.length} scheduled`);
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.EventSystem = EventSystem;

console.log('🎲 EventSystem loaded - chaos awaits your command');
