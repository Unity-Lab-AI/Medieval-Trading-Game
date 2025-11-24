// Medieval Trading Game JavaScript
// This file contains the basic game structure and initialization code

// Game State Management
const GameState = {
    MENU: 'menu',
    LOADING: 'loading',
    CHARACTER_CREATION: 'character_creation',
    PLAYING: 'playing',
    PAUSED: 'paused',
    TRAVEL: 'travel',
    MARKET: 'market',
    INVENTORY: 'inventory',
    TRANSPORTATION: 'transportation'
};

// Time Management System
const TimeSystem = {
    // Time constants
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    MONTHS_PER_YEAR: 12,
    
    // Time speeds (game minutes per real second)
    SPEEDS: {
        PAUSED: 0,
        NORMAL: 1,      // 1 game minute per real second
        FAST: 5,        // 5 game minutes per real second
        VERY_FAST: 15   // 15 game minutes per real second
    },
    
    // Current time state
    currentTime: {
        day: 1,
        hour: 8,
        minute: 0,
        year: 1,
        month: 1,
        week: 1
    },
    
    // Time control state
    currentSpeed: 'NORMAL',
    isPaused: false,
    lastUpdateTime: 0,
    accumulatedTime: 0,
    
    // Initialize time system
    init() {
        this.currentTime = {
            day: 1,
            hour: 8,
            minute: 0,
            year: 1,
            month: 1,
            week: 1
        };
        this.currentSpeed = 'NORMAL';
        this.isPaused = false;
        this.lastUpdateTime = Date.now();
        this.accumulatedTime = 0;
    },
    
    // Update time based on elapsed real time
    update(deltaTime) {
        if (this.isPaused || this.currentSpeed === 'PAUSED') {
            return false; // No time passed
        }
        
        const speedMultiplier = this.SPEEDS[this.currentSpeed];
        if (speedMultiplier === 0) return false;
        
        // Convert real milliseconds to game minutes
        const gameMinutesPassed = (deltaTime / 1000) * speedMultiplier;
        this.accumulatedTime += gameMinutesPassed;
        
        // Process accumulated time in whole minutes
        const minutesToProcess = Math.floor(this.accumulatedTime);
        if (minutesToProcess > 0) {
            this.accumulatedTime -= minutesToProcess;
            this.addMinutes(minutesToProcess);
            return true; // Time advanced
        }
        
        return false;
    },
    
    // Add minutes to current time
    addMinutes(minutes) {
        this.currentTime.minute += minutes;
        
        // Handle minute overflow
        while (this.currentTime.minute >= this.MINUTES_PER_HOUR) {
            this.currentTime.minute -= this.MINUTES_PER_HOUR;
            this.currentTime.hour++;
            
            // Handle hour overflow
            if (this.currentTime.hour >= this.HOURS_PER_DAY) {
                this.currentTime.hour -= this.HOURS_PER_DAY;
                this.currentTime.day++;
                this.currentTime.week = Math.ceil(this.currentTime.day / this.DAYS_PER_WEEK);
                
                // Handle day overflow
                if (this.currentTime.day > this.DAYS_PER_MONTH) {
                    this.currentTime.day = 1;
                    this.currentTime.month++;
                    
                    // Handle month overflow
                    if (this.currentTime.month > this.MONTHS_PER_YEAR) {
                        this.currentTime.month = 1;
                        this.currentTime.year++;
                    }
                }
            }
        }
    },
    
    // Set time speed
    setSpeed(speed) {
        if (this.SPEEDS.hasOwnProperty(speed)) {
            this.currentSpeed = speed;
            this.isPaused = (speed === 'PAUSED');
            return true;
        }
        return false;
    },
    
    // Pause/unpause time
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.currentSpeed = 'PAUSED';
        } else {
            this.currentSpeed = 'NORMAL';
        }
        return this.isPaused;
    },
    
    // Get formatted time string
    getFormattedTime() {
        const hourStr = this.currentTime.hour.toString().padStart(2, '0');
        const minuteStr = this.currentTime.minute.toString().padStart(2, '0');
        return `Day ${this.currentTime.day}, ${hourStr}:${minuteStr}`;
    },
    
    // Get detailed time information
    getTimeInfo() {
        return {
            ...this.currentTime,
            formatted: this.getFormattedTime(),
            speed: this.currentSpeed,
            isPaused: this.isPaused,
            isDaytime: this.currentTime.hour >= 6 && this.currentTime.hour < 20,
            isMorning: this.currentTime.hour >= 6 && this.currentTime.hour < 12,
            isAfternoon: this.currentTime.hour >= 12 && this.currentTime.hour < 18,
            isEvening: this.currentTime.hour >= 18 && this.currentTime.hour < 22,
            isNight: this.currentTime.hour >= 22 || this.currentTime.hour < 6
        };
    },
    
    // Calculate time until specific hour
    getMinutesUntilHour(targetHour) {
        let minutes = 0;
        let currentHour = this.currentTime.hour;
        let currentMinute = this.currentTime.minute;
        
        if (targetHour > currentHour) {
            minutes = (targetHour - currentHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else if (targetHour < currentHour) {
            minutes = ((this.HOURS_PER_DAY - currentHour) + targetHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else {
            minutes = currentMinute === 0 ? 0 : this.HOURS_PER_DAY * this.MINUTES_PER_HOUR - currentMinute;
        }
        
        return minutes;
    },
    
    // Get time in total minutes for calculations
    getTotalMinutes() {
        return this.currentTime.minute +
               (this.currentTime.hour * this.MINUTES_PER_HOUR) +
               (this.currentTime.day * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR) +
               (this.currentTime.month * this.DAYS_PER_MONTH * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR) +
               (this.currentTime.year * this.MONTHS_PER_YEAR * this.DAYS_PER_MONTH * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR);
    }
};

// Event System
const EventSystem = {
    events: [],
    scheduledEvents: [],
    randomEventChance: 0.05, // 5% chance per game minute
    
    // Initialize event system
    init() {
        this.events = [];
        this.scheduledEvents = [];
        this.setupRandomEvents();
    },
    
    // Setup random event definitions
    setupRandomEvents() {
        // Market events
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
        
        this.addEventType('merchant_arrival', {
            name: 'Foreign Merchant',
            description: 'A merchant from distant kingdoms has arrived with exotic goods.',
            effects: { newItems: true },
            duration: 240, // 4 hours
            chance: 0.03
        });
        
        // Weather events
        this.addEventType('rain_storm', {
            name: 'Rain Storm',
            description: 'Heavy rains turn the roads to mud, making travel difficult.',
            effects: { travelSpeedPenalty: -0.3 },
            duration: 90, // 1.5 hours
            chance: 0.04
        });
        
        this.addEventType('clear_skies', {
            name: 'Clear Skies',
            description: 'Perfect weather for travel and trade along the kingdom roads.',
            effects: { travelSpeedBonus: 0.2 },
            duration: 180, // 3 hours
            chance: 0.05
        });
        
        // Travel event
        this.addEventType('travel_complete', {
            name: 'Travel Complete',
            description: 'You have arrived at your destination.',
            effects: {},
            duration: 0,
            chance: 0
        });
        
        // Market events
        this.addEventType('weekly_market', {
            name: 'Weekly Market Day',
            description: 'The weekly gathering of merchants with rare goods from distant lands!',
            effects: { newItems: true, priceBonus: 0.1 },
            duration: 240, // 4 hours
            chance: 0
        });
        
        this.addEventType('merchant_caravan', {
            name: 'Merchant Caravan',
            description: 'A grand merchant caravan has arrived with exotic goods from the east.',
            effects: { newItems: true, rareItems: true },
            duration: 360, // 6 hours
            chance: 0
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
    
    // Trigger random events
    checkRandomEvents() {
        if (Math.random() < this.randomEventChance) {
            const eventTypes = Object.keys(this.eventTypes || {});
            if (eventTypes.length > 0) {
                const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                this.triggerEvent(randomType);
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
            startTime: TimeSystem.getTotalMinutes(),
            duration: eventType.duration || 60,
            active: true
        };
        
        this.events.push(event);
        this.applyEventEffects(event);
        
        // Notify UI
        if (game.ui) {
            game.ui.showEventNotification(event);
        }
        
        console.log(`Event triggered: ${event.name}`);
    },
    
    // Apply event effects to game state
    applyEventEffects(event) {
        // This will be expanded as more game systems are implemented
        if (event.effects.priceBonus) {
            game.marketPriceModifier = (game.marketPriceModifier || 1) * (1 + event.effects.priceBonus);
        }
        
        if (event.effects.pricePenalty) {
            game.marketPriceModifier = (game.marketPriceModifier || 1) * (1 + event.effects.pricePenalty);
        }
        
        if (event.effects.travelSpeedBonus) {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) * (1 + event.effects.travelSpeedBonus);
        }
        
        if (event.effects.travelSpeedPenalty) {
            game.travelSpeedModifier = (game.travelSpeedModifier || 1) * (1 + event.effects.travelSpeedPenalty);
        }
        
        // Handle special events
        if (event.id === 'travel_complete' && event.data.destination) {
            GameWorld.completeTravel(event.data.destination);
        }
        
        if (event.effects.newItems) {
            this.refreshMarketItems();
        }
    },
    
    // Refresh market items for all locations
    refreshMarketItems() {
        Object.keys(GameWorld.locations).forEach(locationId => {
            const location = GameWorld.locations[locationId];
            
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
        
        addMessage('🛒 Markets have been refreshed with new goods!');
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
        const currentTime = TimeSystem.getTotalMinutes();
        
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
        // Reverse the effects (simplified version)
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
    }
};

// High Score System
const HighScoreSystem = {
    maxScores: 10,
    
    // Initialize high score system
    init() {
        this.loadHighScores();
    },
    
    // Load high scores from localStorage
    loadHighScores() {
        const savedScores = localStorage.getItem('tradingGameHighScores');
        if (savedScores) {
            try {
                this.highScores = JSON.parse(savedScores);
            } catch (e) {
                this.highScores = [];
            }
        } else {
            this.highScores = [];
        }
    },
    
    // Save high scores to localStorage
    saveHighScores() {
        localStorage.setItem('tradingGameHighScores', JSON.stringify(this.highScores));
    },
    
    // Add a new high score
    addHighScore(playerName, gold, survivedDays, deathCause) {
        const score = {
            name: playerName,
            gold: gold,
            survivedDays: survivedDays,
            deathCause: deathCause,
            date: new Date().toISOString()
        };
        
        this.highScores.push(score);
        
        // Sort by gold (descending)
        this.highScores.sort((a, b) => b.gold - a.gold);
        
        // Keep only top scores
        this.highScores = this.highScores.slice(0, this.maxScores);
        
        this.saveHighScores();
        
        // Check if player made it to top 10
        const rank = this.highScores.findIndex(s => s.name === playerName && s.gold === gold) + 1;
        if (rank <= this.maxScores) {
            return rank;
        }
        return null;
    },
    
    // Get high scores
    getHighScores() {
        return this.highScores;
    },
    
    // Show high scores
    showHighScores() {
        const highScores = this.getHighScores();
        
        if (highScores.length === 0) {
            addMessage("No high scores yet. Be the first!");
            return;
        }
        
        addMessage("🏆 HIGH SCORES 🏆");
        highScores.forEach((score, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            const deathInfo = score.deathCause ? ` (${score.deathCause})` : "";
            addMessage(`${medal} ${score.name}: ${score.gold} gold - ${score.survivedDays} days${deathInfo}`);
        });
    }
};

// Game State Object
const game = {
    state: GameState.MENU,
    player: null,
    currentLocation: null,
    locations: [],
    items: [],
    marketPrices: {},
    gameTick: 0,
    settings: {
        soundVolume: 0.7,
        musicVolume: 0.5,
        autoSave: true,
        autoSaveInterval: 300000 // 5 minutes
    },
    
    // Death timer system
    deathTimer: {
        isActive: false,
        startTime: 0,
        duration: 24 * 60, // 24 hours in minutes
        warningShown: false
    },
    
    // Game engine properties
    isRunning: false,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0,
    targetFPS: 60,
    maxFrameTime: 100, // Cap frame time to avoid spiral of death
    
    // Modifiers from events
    marketPriceModifier: 1,
    travelSpeedModifier: 1,
    
    // Initialize game engine
    init() {
        TimeSystem.init();
        EventSystem.init();
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        
        // Initialize new systems
        CityReputationSystem.init();
        CityEventSystem.init();
        MarketPriceHistory.init();
        DynamicMarketSystem.init();
        PropertySystem.init();
        EmployeeSystem.init();
        TradeRouteSystem.init();
        PropertyEmployeeUI.init();
    },
    
    // Main game loop
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = Math.min(currentTime - this.lastFrameTime, this.maxFrameTime);
        this.lastFrameTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / deltaTime);
        }
        
        // Update game systems
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    // Update game state
    update(deltaTime) {
        if (this.state !== GameState.PLAYING) return;
        
        // Update time system
        const timeAdvanced = TimeSystem.update(deltaTime);
        
        // Update event system if time advanced
        if (timeAdvanced) {
            EventSystem.update();
            this.updateMarketPrices();
            this.checkScheduledEvents();
            
            // Update new systems
            CityEventSystem.updateEvents();
            DynamicMarketSystem.updateMarketPrices();
            PropertySystem.processDailyIncome();
            EmployeeSystem.processWeeklyWages();
            TradeRouteSystem.processDailyTrade();
            
            // Check for city events
            if (this.currentLocation) {
                CityEventSystem.checkRandomEvents(this.currentLocation.id);
            }
            
            // Check price alerts
            if (typeof TradingSystem !== 'undefined') {
                TradingSystem.checkPriceAlerts();
            }
            
            // Update death timer
            this.updateDeathTimer();
            
            this.updatePlayerStatsOverTime = this.updatePlayerStatsOverTime || function() {
                if (!game.player || !game.player.stats) return;
                
                const timeInfo = TimeSystem.getTimeInfo();
                
                // Only update every few game minutes to avoid rapid changes
                if (timeInfo.minute % 5 !== 0) return;
                
                // Natural stat changes over time
                game.player.stats.hunger = Math.max(0, game.player.stats.hunger - 1);
                game.player.stats.thirst = Math.max(0, game.player.stats.thirst - 2);
                game.player.stats.stamina = Math.max(0, game.player.stats.stamina - 0.5);
                
                // Health effects from hunger/thirst
                if (game.player.stats.hunger <= 0) {
                    game.player.stats.health = Math.max(0, game.player.stats.health - 2);
                    addMessage("⚠️ You're starving! Health decreasing.", 'warning');
                }
                
                if (game.player.stats.thirst <= 0) {
                    game.player.stats.health = Math.max(0, game.player.stats.health - 3);
                    addMessage("⚠️ You're dehydrated! Health decreasing.", 'warning');
                }
                
                // Update temporary effects
                if (game.player.temporaryEffects) {
                    const currentTime = Date.now();
                    for (const [stat, effect] of Object.entries(game.player.temporaryEffects)) {
                        const elapsedMinutes = (currentTime - effect.startTime) / 60000;
                        if (elapsedMinutes >= effect.duration) {
                            // Remove expired effect
                            delete game.player.temporaryEffects[stat];
                            addMessage(`The effect on ${stat} has worn off.`);
                        }
                    }
                }
                
                // Check if player is dead
                if (game.player.stats.health <= 0) {
                    handlePlayerDeath();
                }
                
                updatePlayerStats();
            };
        }
        
        // Update UI
        this.updateUI();
        
        // Auto-save check
        if (this.settings.autoSave && Date.now() - this.lastSaveTime > this.settings.autoSaveInterval) {
            this.autoSave();
        }
    },
    
    // Render game
    render() {
        if (this.state !== GameState.PLAYING) return;
        
        // Render canvas
        this.renderGameWorld();
        
        // Apply day/night effects
        this.applyDayNightEffects();
    },
    
    // Render game world on canvas
    renderGameWorld() {
        const ctx = elements.ctx;
        const canvas = elements.gameCanvas;
        
        if (!ctx || !canvas) return;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get time info for dynamic rendering
        const timeInfo = TimeSystem.getTimeInfo();
        
        // Draw background based on time of day
        if (timeInfo.isNight) {
            ctx.fillStyle = '#0a0a1a';
        } else if (timeInfo.isEvening) {
            ctx.fillStyle = '#1a0f0a';
        } else if (timeInfo.isMorning) {
            ctx.fillStyle = '#f5f5dc';
        } else {
            ctx.fillStyle = '#87ceeb';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw time info
        ctx.fillStyle = timeInfo.isNight ? '#ffffff' : '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(TimeSystem.getFormattedTime(), 10, 30);
        
        // Draw location info
        if (this.currentLocation) {
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentLocation.name, canvas.width / 2, 50);
            ctx.font = '14px Arial';
            ctx.fillText(this.currentLocation.description, canvas.width / 2, 80);
        }
        
        // Draw active events
        const activeEvents = EventSystem.getActiveEvents();
        if (activeEvents.length > 0) {
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffaa00';
            let yOffset = 30;
            activeEvents.forEach(event => {
                ctx.fillText(`📢 ${event.name}`, canvas.width - 10, yOffset);
                yOffset += 20;
            });
        }
        
        // Draw player info
        if (this.player) {
            ctx.fillStyle = '#4fc3f7';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`💰 ${this.player.gold} gold`, 10, canvas.height - 40);
            ctx.fillText(`🎒 ${this.player.currentLoad}/${transportationOptions[this.player.transportation].carryCapacity} lbs`, 10, canvas.height - 20);
        }
    },
    
    // Update market prices based on time and events
    updateMarketPrices() {
        const timeInfo = TimeSystem.getTimeInfo();
        
        // Base price fluctuations
        Object.keys(this.marketPrices).forEach(itemId => {
            if (!this.marketPrices[itemId].basePrice) {
                this.marketPrices[itemId].basePrice = this.marketPrices[itemId].price;
            }
            
            // Random fluctuation
            const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
            let newPrice = this.marketPrices[itemId].basePrice * (1 + fluctuation);
            
            // Apply time-based modifiers
            if (timeInfo.isMorning) {
                newPrice *= 1.02; // Morning premium
            } else if (timeInfo.isEvening) {
                newPrice *= 0.98; // Evening discount
            }
            
            // Apply event modifiers
            newPrice *= this.marketPriceModifier;
            
            this.marketPrices[itemId].price = Math.round(newPrice);
        });
    },
    
    // Check for scheduled time-based events
    checkScheduledEvents() {
        const timeInfo = TimeSystem.getTimeInfo();
        
        // Daily market reset
        if (timeInfo.hour === 6 && timeInfo.minute === 0) {
            this.resetDailyMarket();
        }
        
        // Weekly special events
        if (timeInfo.day === 1 && timeInfo.hour === 10 && timeInfo.minute === 0) {
            EventSystem.triggerEvent('weekly_market');
        }
        
        // Monthly merchant caravan
        if (timeInfo.day === 15 && timeInfo.hour === 14 && timeInfo.minute === 0) {
            EventSystem.triggerEvent('merchant_caravan');
        }
    },
    
    // Reset daily market
    resetDailyMarket() {
        // Refresh inventory and prices
        console.log('Daily market reset');
        addMessage('The market has refreshed with new goods!');
    },
    
    // Apply day/night visual effects
    applyDayNightEffects() {
        const timeInfo = TimeSystem.getTimeInfo();
        const canvas = elements.gameCanvas;
        
        if (!canvas) return;
        
        let overlayColor = '';
        let overlayOpacity = 0;
        
        if (timeInfo.isNight) {
            overlayColor = 'rgba(0, 0, 50, '; // Dark blue tint
            overlayOpacity = 0.4;
        } else if (timeInfo.isEvening) {
            overlayColor = 'rgba(50, 30, 0, '; // Orange tint
            overlayOpacity = 0.2;
        } else if (timeInfo.isMorning) {
            overlayColor = 'rgba(255, 255, 200, '; // Light yellow tint
            overlayOpacity = 0.1;
        }
        
        canvas.style.filter = overlayColor ? `${overlayColor}${overlayOpacity})` : 'none';
    },
    
    // Update UI elements
    updateUI() {
        // Update time display
        const timeDisplay = document.getElementById('game-time');
        if (timeDisplay) {
            timeDisplay.textContent = TimeSystem.getFormattedTime();
        }
        
        // Update time control buttons
        this.updateTimeControls();
    },
    
    // Update time control button states
    updateTimeControls() {
        const buttons = {
            'pause-btn': TimeSystem.isPaused,
            'normal-speed-btn': TimeSystem.currentSpeed === 'NORMAL',
            'fast-speed-btn': TimeSystem.currentSpeed === 'FAST',
            'very-fast-speed-btn': TimeSystem.currentSpeed === 'VERY_FAST'
        };
        
        Object.entries(buttons).forEach(([id, isActive]) => {
            const button = document.getElementById(id);
            if (button) {
                button.classList.toggle('active', isActive);
            }
        });
    },
    
    // Save game state
    saveState() {
        return {
            player: this.player,
            currentLocation: this.currentLocation,
            locations: this.locations,
            items: this.items,
            marketPrices: this.marketPrices,
            settings: this.settings,
            timeState: TimeSystem.currentTime,
            timeSpeed: TimeSystem.currentSpeed,
            activeEvents: EventSystem.getActiveEvents(),
            gameTick: this.gameTick,
            properties: PropertySystem.getProperties(),
            employees: EmployeeSystem.getEmployees(),
            tradeRoutes: TradeRouteSystem.getTradeRoutes()
        };
    },
    
    // Load game state
    loadState(saveData) {
        this.player = saveData.player;
        this.currentLocation = saveData.currentLocation;
        this.locations = saveData.locations || [];
        this.items = saveData.items || [];
        this.marketPrices = saveData.marketPrices || {};
        this.settings = saveData.settings || this.settings;
        this.gameTick = saveData.gameTick || 0;
        
        // Restore property system
        if (saveData.properties) {
            PropertySystem.loadProperties(saveData.properties);
        }
        
        // Restore employee system
        if (saveData.employees) {
            EmployeeSystem.loadEmployees(saveData.employees);
        }
        
        // Restore trade routes
        if (saveData.tradeRoutes) {
            TradeRouteSystem.loadTradeRoutes(saveData.tradeRoutes);
        }
        
        // Restore time system
        if (saveData.timeState) {
            TimeSystem.currentTime = saveData.timeState;
        }
        if (saveData.timeSpeed) {
            TimeSystem.setSpeed(saveData.timeSpeed);
        }
        
        // Restore active events
        if (saveData.activeEvents) {
            EventSystem.events = saveData.activeEvents;
        }
    },
    
    // Auto-save functionality
    lastSaveTime: 0,
    autoSave() {
        this.lastSaveTime = Date.now();
        const saveData = this.saveState();
        localStorage.setItem('tradingGameAutoSave', JSON.stringify(saveData));
        console.log('Game auto-saved');
    },
    
    // Start the game engine
    start() {
        this.init();
        requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    // Stop the game engine
    stop() {
        this.isRunning = false;
    }
};

// Medieval Transportation Options with realistic carry weights (in pounds)
const transportationOptions = {
    satchel: {
        id: 'satchel',
        name: 'Leather Satchel',
        price: 0,
        carryCapacity: 40,
        description: 'A simple leather satchel for carrying basic supplies.',
        speedModifier: 1.0,
        required: false
    },
    handCart: {
        id: 'hand_cart',
        name: 'Hand Cart',
        price: 30,
        carryCapacity: 180,
        description: 'A small wooden cart that you pull by hand.',
        speedModifier: 0.8,
        required: false
    },
    mule: {
        id: 'mule',
        name: 'Mule',
        price: 85,
        carryCapacity: 160,
        description: 'A sturdy mule for carrying moderate loads over rough terrain.',
        speedModifier: 0.9,
        required: false
    },
    warhorse: {
        id: 'warhorse',
        name: 'Warhorse',
        price: 180,
        carryCapacity: 120,
        description: 'A swift warhorse for quick travel and light loads.',
        speedModifier: 1.5,
        required: false
    },
    cart: {
        id: 'cart',
        name: 'Merchant Cart',
        price: 220,
        carryCapacity: 450,
        description: 'A sturdy wooden cart for heavy loads.',
        speedModifier: 0.7,
        required: false,
        requiresAnimal: true
    },
    horseAndCart: {
        id: 'horse_and_cart',
        name: 'Horse & Cart',
        price: 380,
        carryCapacity: 550,
        description: 'A horse pulling a cart for balanced speed and capacity.',
        speedModifier: 1.2,
        required: false
    },
    oxen: {
        id: 'oxen',
        name: 'Oxen',
        price: 120,
        carryCapacity: 220,
        description: 'Strong oxen for pulling heavy loads through mud.',
        speedModifier: 0.6,
        required: false
    },
    oxenAndCart: {
        id: 'oxen_and_cart',
        name: 'Oxen & Cart',
        price: 320,
        carryCapacity: 750,
        description: 'Oxen pulling a heavy cart for maximum capacity.',
        speedModifier: 0.5,
        required: false
    }
};

// Game World System
const GameWorld = {
    // Medieval Map regions
    regions: {
        starter: {
            id: 'starter',
            name: 'Riverlands',
            description: 'A peaceful realm perfect for new merchants.',
            unlockRequirement: null, // Always available
            goldRequirement: 0
        },
        northern: {
            id: 'northern',
            name: 'Northern Highlands',
            description: 'Cold, harsh highlands with valuable furs and iron.',
            unlockRequirement: 'starter',
            goldRequirement: 500
        },
        eastern: {
            id: 'eastern',
            name: 'Eastern Kingdoms',
            description: 'Rich kingdoms with exotic spices and silks.',
            unlockRequirement: 'starter',
            goldRequirement: 750
        },
        western: {
            id: 'western',
            name: 'Western Marches',
            description: 'Wild frontiers with untapped resources and ancient ruins.',
            unlockRequirement: 'starter',
            goldRequirement: 600
        },
        southern: {
            id: 'southern',
            name: 'Southern Trade Routes',
            description: 'Prosperous merchant cities with luxury goods from distant lands.',
            unlockRequirement: 'northern',
            goldRequirement: 1000
        },
        capital: {
            id: 'capital',
            name: 'Royal Capital',
            description: 'The heart of the kingdom with rare treasures and noble patronage.',
            unlockRequirement: 'eastern',
            goldRequirement: 2000
        }
    },
    
    // Locations within each region
    locations: {
        // Riverlands Region
        riverwood: {
            id: 'riverwood',
            name: 'Riverwood Hamlet',
            region: 'starter',
            type: 'village',
            description: 'A small hamlet nestled by the peaceful Silver River.',
            population: 150,
            specialties: ['fish', 'timber', 'ale'],
            marketSize: 'small',
            travelCost: { base: 10 },
            connections: ['greendale', 'stonebridge']
        },
        greendale: {
            id: 'greendale',
            name: 'Greendale',
            region: 'starter',
            type: 'town',
            description: 'A thriving farming community with weekly medieval markets.',
            population: 800,
            specialties: ['grain', 'livestock', 'tools'],
            marketSize: 'medium',
            travelCost: { base: 15 },
            connections: ['riverwood', 'stonebridge', 'market_crossroads']
        },
        stonebridge: {
            id: 'stonebridge',
            name: 'Stonebridge',
            region: 'starter',
            type: 'city',
            description: 'A major medieval trading hub with a famous stone bridge over the river.',
            population: 3000,
            specialties: ['weapons', 'armor', 'mead'],
            marketSize: 'large',
            travelCost: { base: 20 },
            connections: ['riverwood', 'greendale', 'market_crossroads', 'northern_outpost']
        },
        market_crossroads: {
            id: 'market_crossroads',
            name: 'Crossroads Inn',
            region: 'starter',
            type: 'town',
            description: 'A bustling medieval crossroads where many trade routes meet.',
            population: 1200,
            specialties: ['trade_goods', 'information', 'ale'],
            marketSize: 'medium',
            travelCost: { base: 18 },
            connections: ['greendale', 'stonebridge', 'eastern_gate']
        },
        
        // Northern Highlands
        northern_outpost: {
            id: 'northern_outpost',
            name: 'Winterwatch Keep',
            region: 'northern',
            type: 'village',
            description: 'A remote fortified outpost in the frozen northern highlands.',
            population: 80,
            specialties: ['furs', 'iron_ore', 'winter_clothing'],
            marketSize: 'small',
            travelCost: { base: 25 },
            connections: ['stonebridge', 'frostfall']
        },
        frostfall: {
            id: 'frostfall',
            name: 'Frostfall',
            region: 'northern',
            type: 'town',
            description: 'A mining town known for its iron and precious gems.',
            population: 600,
            specialties: ['gems', 'iron_bar', 'winter_clothing'],
            marketSize: 'medium',
            travelCost: { base: 30 },
            connections: ['northern_outpost', 'ironhold']
        },
        ironhold: {
            id: 'ironhold',
            name: 'Ironhold Citadel',
            region: 'northern',
            type: 'city',
            description: 'A fortified city built around rich iron mines.',
            population: 2500,
            specialties: ['steel_bar', 'weapons', 'armor'],
            marketSize: 'large',
            travelCost: { base: 35 },
            connections: ['frostfall', 'southern_pass']
        },
        
        // Eastern Kingdoms
        eastern_gate: {
            id: 'eastern_gate',
            name: 'Eastwatch',
            region: 'eastern',
            type: 'town',
            description: 'Gateway fortress to the eastern kingdoms.',
            population: 900,
            specialties: ['spices', 'silk', 'exotic_goods'],
            marketSize: 'medium',
            travelCost: { base: 28 },
            connections: ['market_crossroads', 'golden_fields']
        },
        golden_fields: {
            id: 'golden_fields',
            name: 'Golden Fields',
            region: 'eastern',
            type: 'village',
            description: 'Village surrounded by golden wheat fields and mead halls.',
            population: 200,
            specialties: ['grain', 'honey', 'mead'],
            marketSize: 'small',
            travelCost: { base: 22 },
            connections: ['eastern_gate', 'jade_palace']
        },
        jade_palace: {
            id: 'jade_palace',
            name: 'Jade Harbor',
            region: 'eastern',
            type: 'city',
            description: 'An elegant port city famous for its exotic goods from distant lands.',
            population: 4000,
            specialties: ['spices', 'silk', 'luxury_items'],
            marketSize: 'large',
            travelCost: { base: 40 },
            connections: ['golden_fields', 'capital_gates']
        },
        
        // Royal Capital Region
        capital_gates: {
            id: 'capital_gates',
            name: 'Kingsgate',
            region: 'capital',
            type: 'town',
            description: 'The grand entrance to the royal capital.',
            population: 1500,
            specialties: ['royal_goods', 'documents', 'services'],
            marketSize: 'medium',
            travelCost: { base: 45 },
            connections: ['jade_palace', 'royal_capital']
        },
        royal_capital: {
            id: 'royal_capital',
            name: 'Royal Capital',
            region: 'capital',
            type: 'city',
            description: 'The magnificent seat of the king and his court.',
            population: 10000,
            specialties: ['artifacts', 'rare_treasures', 'royal_favors'],
            marketSize: 'grand',
            travelCost: { base: 50 },
            connections: ['kinggate']
        }
    },
    
    // Initialize game world
    init() {
        this.unlockedRegions = ['starter'];
        this.visitedLocations = ['riverwood']; // Start location
        this.currentRegion = 'starter';
        this.setupMarketPrices();
        
        // Initialize new systems
        CityReputationSystem.init();
        CityEventSystem.init();
        MarketPriceHistory.init();
        DynamicMarketSystem.init();
    },
    
    // Setup initial market prices for all locations
    setupMarketPrices() {
        Object.values(this.locations).forEach(location => {
            location.marketPrices = {};
            
            // Base items available everywhere
            const baseItems = ['food', 'water', 'bread'];
            baseItems.forEach(itemId => {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    location.marketPrices[itemId] = {
                        price: ItemDatabase.calculatePrice(itemId),
                        stock: Math.floor(Math.random() * 20) + 10
                    };
                }
            });
            
            // Specialties with better prices
            location.specialties.forEach(specialty => {
                const item = ItemDatabase.getItem(specialty);
                if (item) {
                    location.marketPrices[specialty] = {
                        price: ItemDatabase.calculatePrice(specialty, { locationMultiplier: 0.8 }), // 20% discount for specialties
                        stock: Math.floor(Math.random() * 15) + 5
                    };
                }
            });
            
            // Add random additional items based on location type
            this.addRandomMarketItems(location);
        });
    },
    
    // Add random items to market based on location type
    addRandomMarketItems(location) {
        const locationItemPools = {
            village: ['herbs', 'logs', 'stone', 'seeds', 'wool', 'clay'],
            town: ['meat', 'fish', 'vegetables', 'fruits', 'cheese', 'tools', 'arrows', 'grain'],
            city: ['iron_ore', 'copper_ore', 'tin', 'coal', 'hammer', 'axe', 'pickaxe', 'sword', 'spear', 'bow', 'bricks', 'mortar', 'nails']
        };
        
        const itemPool = locationItemPools[location.type] || locationItemPools.town;
        const numAdditionalItems = Math.floor(Math.random() * 5) + 3; // 3-7 additional items
        
        for (let i = 0; i < numAdditionalItems; i++) {
            const randomItemId = itemPool[Math.floor(Math.random() * itemPool.length)];
            const item = ItemDatabase.getItem(randomItemId);
            
            if (item && !location.marketPrices[randomItemId]) {
                location.marketPrices[randomItemId] = {
                    price: ItemDatabase.calculatePrice(randomItemId),
                    stock: Math.floor(Math.random() * 15) + 5
                };
            }
        }
    },
    
    // Get base price for an item type
    getBasePrice(itemType) {
        const basePrices = {
            food: 5,
            water: 2,
            basic_tools: 15,
            fish: 8,
            timber: 12,
            grain: 6,
            livestock: 50,
            tools: 25,
            weapons: 80,
            armor: 120,
            luxury_goods: 200,
            furs: 35,
            minerals: 45,
            ice_goods: 30,
            gems: 150,
            metals: 100,
            winter_clothing: 60,
            crystals: 300,
            magic_items: 500,
            rare_gems: 800,
            spices: 40,
            silk: 150,
            tea: 20,
            honey: 15,
            fruits: 10,
            jade: 400,
            porcelain: 250,
            luxury_items: 350,
            imperial_goods: 600,
            documents: 100,
            services: 75,
            artifacts: 1000,
            rare_treasures: 2000,
            imperial_favors: 5000
        };
        
        return basePrices[itemType] || 50;
    },
    
    // Check if a region is unlocked
    isRegionUnlocked(regionId) {
        return this.unlockedRegions.includes(regionId);
    },
    
    // Unlock a new region
    unlockRegion(regionId) {
        if (!this.isRegionUnlocked(regionId)) {
            const region = this.regions[regionId];
            if (region && this.canUnlockRegion(regionId)) {
                this.unlockedRegions.push(regionId);
                addMessage(`🎉 New region unlocked: ${region.name}!`);
                return true;
            }
        }
        return false;
    },
    
    // Check if player can unlock a region
    canUnlockRegion(regionId) {
        const region = this.regions[regionId];
        if (!region) return false;
        
        // Check if required region is unlocked
        if (region.unlockRequirement && !this.isRegionUnlocked(region.unlockRequirement)) {
            return false;
        }
        
        // Check gold requirement
        if (game.player && game.player.gold >= region.goldRequirement) {
            return true;
        }
        
        return false;
    },
    
    // Get available travel destinations from current location
    getAvailableDestinations() {
        const currentLocation = this.locations[game.currentLocation.id];
        if (!currentLocation) return [];
        
        return currentLocation.connections
            .map(destId => this.locations[destId])
            .filter(dest => dest && this.isRegionUnlocked(dest.region))
            .map(dest => ({
                ...dest,
                travelCost: this.calculateTravelCost(game.currentLocation.id, dest.id),
                travelTime: this.calculateTravelTime(game.currentLocation.id, dest.id)
            }));
    },
    
    // Calculate travel cost between locations
    calculateTravelCost(fromId, toId) {
        const fromLocation = this.locations[fromId];
        const toLocation = this.locations[toId];
        
        if (!fromLocation || !toLocation) return 0;
        
        let baseCost = (fromLocation.travelCost.base + toLocation.travelCost.base) / 2;
        
        // Apply transportation modifier
        const transport = transportationOptions[game.player.transportation];
        const speedModifier = transport ? transport.speedModifier : 1.0;
        
        // Apply travel speed modifier from events
        const eventModifier = game.travelSpeedModifier || 1.0;
        
        // Calculate final cost (inverse of speed - faster travel costs more)
        const finalCost = Math.round(baseCost / (speedModifier * eventModifier));
        
        return Math.max(finalCost, 1); // Minimum cost of 1 gold
    },
    
    // Calculate travel time between locations
    calculateTravelTime(fromId, toId) {
        const fromLocation = this.locations[fromId];
        const toLocation = this.locations[toId];
        
        if (!fromLocation || !toLocation) return 0;
        
        let baseTime = (fromLocation.travelCost.base + toLocation.travelCost.base) * 5; // Base time in minutes
        
        // Apply transportation modifier
        const transport = transportationOptions[game.player.transportation];
        const speedModifier = transport ? transport.speedModifier : 1.0;
        
        // Apply travel speed modifier from events
        const eventModifier = game.travelSpeedModifier || 1.0;
        
        // Calculate final time
        const finalTime = Math.round(baseTime / (speedModifier * eventModifier));
        
        return Math.max(finalTime, 10); // Minimum time of 10 minutes
    },
    
    // Travel to a new location
    travelTo(locationId) {
        const destination = this.locations[locationId];
        if (!destination) {
            addMessage('Invalid destination!');
            return false;
        }
        
        if (!this.isRegionUnlocked(destination.region)) {
            addMessage('This region is not yet unlocked!');
            return false;
        }
        
        const travelCost = this.calculateTravelCost(game.currentLocation.id, locationId);
        const travelTime = this.calculateTravelTime(game.currentLocation.id, locationId);
        
        if (game.player.gold < travelCost) {
            addMessage(`You need ${travelCost} gold to travel to ${destination.name}!`);
            return false;
        }
        
        // Deduct travel cost
        game.player.gold -= travelCost;
        
        // Schedule arrival event
        const arrivalTime = TimeSystem.getTotalMinutes() + travelTime;
        EventSystem.scheduleEvent('travel_complete', arrivalTime, {
            destination: locationId,
            cost: travelCost
        });
        
        // Start travel
        addMessage(`🚶 Traveling to ${destination.name}... (Arrival in ${travelTime} minutes)`);
        
        // Update UI
        updatePlayerInfo();
        
        return true;
    },
    
    // Complete travel (called by event system)
    completeTravel(locationId) {
        const destination = this.locations[locationId];
        if (!destination) return;
        
        // Update current location
        game.currentLocation = {
            id: destination.id,
            name: destination.name,
            description: destination.description
        };
        
        // Mark as visited
        if (!this.visitedLocations.includes(locationId)) {
            this.visitedLocations.push(locationId);
            addMessage(`📍 First time visiting ${destination.name}!`);
        }
        
        // Update UI
        updateLocationInfo();
        updateLocationPanel();
        
        addMessage(`✅ Arrived at ${destination.name}!`);
    },
    
    // Get location market data
    getLocationMarket(locationId) {
        const location = this.locations[locationId];
        if (!location) return null;
        
        return {
            ...location.marketPrices,
            locationInfo: {
                name: location.name,
                type: location.type,
                specialties: location.specialties,
                marketSize: location.marketSize
            }
        };
    },
    
    // Update market prices for a location
    updateLocationMarket(locationId) {
        const location = this.locations[locationId];
        if (!location) return;
        
        // Update existing items
        Object.keys(location.marketPrices).forEach(itemType => {
            const currentPrice = location.marketPrices[itemType].price;
            const fluctuation = (Math.random() - 0.5) * 0.2; // ±10% fluctuation
            location.marketPrices[itemType].price = Math.round(currentPrice * (1 + fluctuation));
            
            // Update stock
            const stockChange = Math.floor((Math.random() - 0.5) * 4);
            location.marketPrices[itemType].stock = Math.max(0,
                location.marketPrices[itemType].stock + stockChange);
        });
    },
    
    // Tool and Upgrade System
    tools: {
        // Basic tools
        axe: {
            id: 'axe',
            name: 'Basic Axe',
            description: 'A simple axe for chopping wood.',
            type: 'tool',
            resource: 'wood',
            efficiency: 1.0,
            durability: 100,
            price: 15,
            requiredSkill: 0
        },
        pickaxe: {
            id: 'pickaxe',
            name: 'Pickaxe',
            description: 'For mining stone and minerals.',
            type: 'tool',
            resource: 'stone',
            efficiency: 1.0,
            durability: 120,
            price: 20,
            requiredSkill: 0
        },
        hammer: {
            id: 'hammer',
            name: 'Hammer',
            description: 'Basic hammer for construction.',
            type: 'tool',
            resource: 'iron',
            efficiency: 1.0,
            durability: 80,
            price: 12,
            requiredSkill: 0
        },
        fishing_rod: {
            id: 'fishing_rod',
            name: 'Fishing Rod',
            description: 'For catching fish.',
            type: 'tool',
            resource: 'fish',
            efficiency: 1.0,
            durability: 60,
            price: 18,
            requiredSkill: 0
        },
        cooking_pot: {
            id: 'cooking_pot',
            name: 'Cooking Pot',
            description: 'Basic pot for cooking food.',
            type: 'tool',
            resource: 'food',
            efficiency: 1.0,
            durability: 90,
            price: 25,
            requiredSkill: 0
        },
        shovel: {
            id: 'shovel',
            name: 'Shovel',
            description: 'For digging and gathering resources.',
            type: 'tool',
            resource: 'stone',
            efficiency: 1.0,
            durability: 100,
            price: 15,
            requiredSkill: 0
        },
        knife: {
            id: 'knife',
            name: 'Knife',
            description: 'Sharp knife for various tasks.',
            type: 'tool',
            resource: 'herbs',
            efficiency: 1.0,
            durability: 70,
            price: 10,
            requiredSkill: 0
        },
        saw: {
            id: 'saw',
            name: 'Hand Saw',
            description: 'For cutting wood efficiently.',
            type: 'tool',
            resource: 'wood',
            efficiency: 1.2,
            durability: 110,
            price: 30,
            requiredSkill: 1
        },
        
        // Upgraded tools
        strong_axe: {
            id: 'strong_axe',
            name: 'Strong Axe',
            description: 'A sturdy axe that chops wood 50% faster.',
            type: 'upgrade',
            resource: 'wood',
            efficiency: 1.5,
            durability: 200,
            price: 50,
            requiredSkill: 2,
            requires: 'axe'
        },
        hot_oven: {
            id: 'hot_oven',
            name: 'Hot Oven',
            description: 'Cooks food 30% faster and preserves nutrients.',
            type: 'upgrade',
            resource: 'food',
            efficiency: 1.3,
            durability: 300,
            price: 80,
            requiredSkill: 3,
            requires: 'cooking_pot'
        },
        fast_hammer: {
            id: 'fast_hammer',
            name: 'Fast Hammer',
            description: 'Works 40% faster than basic hammer.',
            type: 'upgrade',
            resource: 'iron',
            efficiency: 1.4,
            durability: 150,
            price: 35,
            requiredSkill: 2,
            requires: 'hammer'
        },
        sharp_knife: {
            id: 'sharp_knife',
            name: 'Sharp Knife',
            description: 'Gathers herbs 25% more efficiently.',
            type: 'upgrade',
            resource: 'herbs',
            efficiency: 1.25,
            durability: 120,
            price: 25,
            requiredSkill: 1,
            requires: 'knife'
        },
        durable_saw: {
            id: 'durable_saw',
            name: 'Durable Saw',
            description: 'Cuts wood 60% faster with less wear.',
            type: 'upgrade',
            resource: 'wood',
            efficiency: 1.6,
            durability: 250,
            price: 60,
            requiredSkill: 3,
            requires: 'saw'
        },
        golden_fishing_rod: {
            id: 'golden_fishing_rod',
            name: 'Golden Fishing Rod',
            description: 'Catches fish twice as often.',
            type: 'upgrade',
            resource: 'fish',
            efficiency: 2.0,
            durability: 180,
            price: 100,
            requiredSkill: 4,
            requires: 'fishing_rod'
        },
        iron_cooking_pot: {
            id: 'iron_cooking_pot',
            name: 'Iron Cooking Pot',
            description: 'Cooks 20% more food at once.',
            type: 'upgrade',
            resource: 'food',
            efficiency: 1.2,
            durability: 200,
            price: 45,
            requiredSkill: 2,
            requires: 'cooking_pot'
        },
        steel_pickaxe: {
            id: 'steel_pickaxe',
            name: 'Steel Pickaxe',
            description: 'Mines minerals 50% faster.',
            type: 'upgrade',
            resource: 'minerals',
            efficiency: 1.5,
            durability: 220,
            price: 75,
            requiredSkill: 3,
            requires: 'pickaxe'
        }
    },
    
    // Get tool by ID
    getTool(toolId) {
        return this.tools[toolId] || null;
    },
    
    // Get available tools for player
    getAvailableTools() {
        if (!game.player) return [];
        
        return Object.values(this.tools).filter(tool => {
            // Check if player has required skill
            const skillLevel = game.player.skills[tool.resource] || 0;
            if (skillLevel < tool.requiredSkill) {
                return false;
            }
            
            // Check if player has required base tool for upgrades
            if (tool.requires && !game.player.ownedTools?.includes(tool.requires)) {
                return false;
            }
            
            // Check if player already owns this tool
            if (game.player.ownedTools?.includes(tool.id)) {
                return false;
            }
            
            return true;
        });
    },
    
    // Get player's owned tools
    getPlayerTools() {
        if (!game.player || !game.player.ownedTools) return [];
        
        return game.player.ownedTools.map(toolId => this.getTool(toolId)).filter(tool => tool);
    },
    
    // Purchase tool
    purchaseTool(toolId) {
        const tool = this.getTool(toolId);
        if (!tool) {
            addMessage('Invalid tool!');
            return false;
        }
        
        if (game.player.gold < tool.price) {
            addMessage(`You need ${tool.price} gold to purchase ${tool.name}!`);
            return false;
        }
        
        // Check requirements
        const skillLevel = game.player.skills[tool.resource] || 0;
        if (skillLevel < tool.requiredSkill) {
            addMessage(`You need skill level ${tool.requiredSkill} in ${tool.resource} to use this tool!`);
            return false;
        }
        
        // Purchase tool
        game.player.gold -= tool.price;
        
        if (!game.player.ownedTools) {
            game.player.ownedTools = [];
        }
        
        game.player.ownedTools.push(toolId);
        
        // Initialize tool durability
        if (!game.player.toolDurability) {
            game.player.toolDurability = {};
        }
        game.player.toolDurability[toolId] = tool.durability;
        
        addMessage(`Purchased ${tool.name} for ${tool.price} gold!`);
        updatePlayerInfo();
        
        return true;
    },
    
    // Use tool for resource gathering
    useTool(toolId, amount = 1) {
        const tool = this.getTool(toolId);
        if (!tool) return null;
        
        if (!game.player.ownedTools?.includes(toolId)) {
            addMessage(`You don't own a ${tool.name}!`);
            return null;
        }
        
        const durability = game.player.toolDurability?.[toolId] || 0;
        if (durability <= 0) {
            addMessage(`Your ${tool.name} is broken!`);
            return null;
        }
        
        // Calculate resource gain
        const baseAmount = amount * tool.efficiency;
        const skillBonus = 1 + ((game.player.skills[tool.resource] || 0) * 0.1);
        const finalAmount = Math.round(baseAmount * skillBonus);
        
        // Reduce durability
        game.player.toolDurability[toolId] = Math.max(0, durability - amount);
        
        return {
            resource: tool.resource,
            amount: finalAmount,
            toolUsed: toolId,
            durabilityRemaining: game.player.toolDurability[toolId]
        };
    },
    
    // Repair tool
    repairTool(toolId) {
        const tool = this.getTool(toolId);
        if (!tool) return false;
        
        const repairCost = Math.round(tool.price * 0.3); // 30% of original price
        
        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair ${tool.name}!`);
            return false;
        }
        
        game.player.gold -= repairCost;
        game.player.toolDurability[toolId] = tool.durability;
        
        addMessage(`Repaired ${tool.name} for ${repairCost} gold!`);
        updatePlayerInfo();
        
        return true;
    }
};

// Perk System - Medieval Character Backgrounds
const perks = {
    lumberjack: {
        id: 'lumberjack',
        name: "Lumberjack",
        description: "You spent years in the forest, felling trees with axe and saw.",
        effects: {
            carryBonus: 0.3, // +30% carry capacity
            woodcuttingBonus: 0.5, // +50% woodcutting efficiency
            strengthBonus: 2, // +2 strength
            travelCostReduction: 0.1 // -10% travel costs in forests
        },
        negativeEffects: {
            negotiationPenalty: 0.1 // -10% negotiation with merchants
        },
        icon: '🪓'
    },
    disbandedSoldier: {
        id: 'disbandedSoldier',
        name: "Disbanded Soldier",
        description: "You served in the king's army until the regiment was disbanded.",
        effects: {
            combatBonus: 0.4, // +40% combat effectiveness
            strengthBonus: 3, // +3 strength
            enduranceBonus: 2, // +2 endurance
            weaponDiscount: 0.2 // -20% cost of weapons
        },
        negativeEffects: {
            goldPenalty: 0.1, // -10% starting gold
            negotiationPenalty: 0.15 // -15% negotiation effectiveness
        },
        icon: '⚔️'
    },
    oustedLord: {
        id: 'oustedLord',
        name: "Ousted Lord",
        description: "Once a noble, you lost your lands but retained your wealth and connections.",
        effects: {
            goldBonus: 0.5, // +50% starting gold
            reputationBonus: 3, // +3 starting reputation
            negotiationBonus: 0.3, // +30% negotiation effectiveness
            marketAccessBonus: 0.2 // +20% access to rare goods
        },
        negativeEffects: {
            carryPenalty: 0.2, // -20% carry capacity
            survivalPenalty: 0.1 // -10% survival in harsh conditions
        },
        icon: '👑'
    },
    peasant: {
        id: 'peasant',
        name: "Peasant",
        description: "You come from humble beginnings, knowing the value of hard work and every coin.",
        effects: {
            frugalBonus: 0.3, // +30% effectiveness of cost-saving measures
            enduranceBonus: 2, // +2 endurance
            maintenanceCostReduction: 0.25, // -25% maintenance costs
            foodBonus: 0.2 // +20% effectiveness of food
        },
        negativeEffects: {
            goldPenalty: 0.2, // -20% starting gold
            reputationPenalty: 1 // -1 starting reputation
        },
        icon: '🌾'
    },
    knight: {
        id: 'knight',
        name: "Knight",
        description: "You were sworn to service, trained in combat and honor.",
        effects: {
            combatBonus: 0.6, // +60% combat effectiveness
            strengthBonus: 2, // +2 strength
            reputationBonus: 2, // +2 starting reputation
            protectionBonus: 0.3 // +30% protection from harm
        },
        negativeEffects: {
            goldPenalty: 0.15, // -15% starting gold
            negotiationPenalty: 0.2 // -20% negotiation effectiveness
        },
        icon: '🛡️'
    },
    merchantApprentice: {
        id: 'merchantApprentice',
        name: "Merchant's Apprentice",
        description: "You learned trade from a master merchant in the bustling markets.",
        effects: {
            negotiationBonus: 0.25, // +25% negotiation effectiveness
            priceBonus: 0.15, // +15% better prices
            marketInsightBonus: 0.2, // +20% market prediction accuracy
            reputationGainBonus: 0.2 // +20% reputation gain
        },
        negativeEffects: {
            combatPenalty: 0.3, // -30% combat effectiveness
            carryPenalty: 0.1 // -10% carry capacity
        },
        icon: '🏪'
    },
    wanderingMinstrel: {
        id: 'wanderingMinstrel',
        name: "Wandering Minstrel",
        description: "You traveled the land singing tales, learning many secrets.",
        effects: {
            charismaBonus: 3, // +3 charisma
            reputationBonus: 1, // +1 starting reputation
            informationBonus: 0.3, // +30% chance to learn valuable information
            travelSpeedBonus: 0.2 // +20% travel speed
        },
        negativeEffects: {
            goldPenalty: 0.15, // -15% starting gold
            strengthPenalty: 1 // -1 strength
        },
        icon: '🎭'
    },
    villageElder: {
        id: 'villageElder',
        name: "Village Elder",
        description: "You've lived a long life and gained wisdom through experience.",
        effects: {
            intelligenceBonus: 3, // +3 intelligence
            wisdomBonus: 0.4, // +40% chance to avoid problems
            reputationBonus: 1, // +1 starting reputation
            skillGainBonus: 0.3 // +30% faster skill improvement
        },
        negativeEffects: {
            strengthPenalty: 2, // -2 strength
            endurancePenalty: 1, // -1 endurance
            goldPenalty: 0.1 // -10% starting gold
        },
        icon: '👴'
    },
    templeAcolyte: {
        id: 'templeAcolyte',
        name: "Temple Acolyte",
        description: "You served in the sacred temples, learning ancient knowledge.",
        effects: {
            intelligenceBonus: 2, // +2 intelligence
            luckBonus: 0.3, // +30% luck in finding rare items
            healingBonus: 0.4, // +40% healing effectiveness
            divineFavor: 0.2 // +20% chance of divine intervention
        },
        negativeEffects: {
            goldPenalty: 0.2, // -20% starting gold
            combatPenalty: 0.2 // -20% combat effectiveness
        },
        icon: '⛪'
    }
};

// Character attributes
const baseAttributes = {
    strength: 5,
    intelligence: 5,
    charisma: 5,
    endurance: 5,
    luck: 5
};

// DOM Elements
const elements = {
    // Screens
    loadingScreen: null,
    mainMenu: null,
    gameContainer: null,
    
    // Panels
    characterPanel: null,
    marketPanel: null,
    inventoryPanel: null,
    locationPanel: null,
    travelPanel: null,
    transportationPanel: null,
    messageLog: null,
    
    // Game World
    gameCanvas: null,
    ctx: null,
    
    // UI Elements
    playerName: null,
    playerGold: null,
    messages: null,
    
    // Buttons
    newGameBtn: null,
    loadGameBtn: null,
    settingsBtn: null,
    createCharacterBtn: null,
    visitMarketBtn: null,
    travelBtn: null,
    transportationBtn: null,
    transportationQuickBtn: null,
    closeMarketBtn: null,
    closeInventoryBtn: null,
    closeTravelBtn: null,
    closeTransportationBtn: null,
    menuBtn: null,
    inventoryBtn: null,
    saveBtn: null,
    
    // Forms
    characterForm: null,
    characterNameInput: null,
    characterClass: null,
    
    // Character Creation Elements
    perksContainer: null,
    selectedPerksCount: null,
    startingGoldAmount: null,
    randomizeCharacterBtn: null,
    previewName: null,
    characterAvatar: null
};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    showScreen('main-menu');
    addMessage('Welcome to the Trading Game!');
});

// Initialize DOM elements
function initializeElements() {
    // Screens
    elements.loadingScreen = document.getElementById('loading-screen');
    elements.mainMenu = document.getElementById('main-menu');
    elements.gameContainer = document.getElementById('game-container');
    
    // Panels
    elements.characterPanel = document.getElementById('character-panel');
    elements.marketPanel = document.getElementById('market-panel');
    elements.inventoryPanel = document.getElementById('inventory-panel');
    elements.locationPanel = document.getElementById('location-panel');
    elements.travelPanel = document.getElementById('travel-panel');
    elements.transportationPanel = document.getElementById('transportation-panel');
    elements.messageLog = document.getElementById('message-log');
    
    // Game World
    elements.gameCanvas = document.getElementById('game-canvas');
    elements.ctx = elements.gameCanvas.getContext('2d');
    
    // UI Elements
    elements.playerName = document.getElementById('player-name');
    elements.playerGold = document.getElementById('player-gold');
    elements.messages = document.getElementById('messages');
    elements.playerStrength = document.getElementById('player-strength');
    elements.playerIntelligence = document.getElementById('player-intelligence');
    elements.playerCharisma = document.getElementById('player-charisma');
    elements.playerEndurance = document.getElementById('player-endurance');
    elements.playerLuck = document.getElementById('player-luck');
    
    // Buttons
    elements.newGameBtn = document.getElementById('new-game-btn');
    elements.loadGameBtn = document.getElementById('load-game-btn');
    elements.settingsBtn = document.getElementById('settings-btn');
    elements.createCharacterBtn = document.getElementById('create-character-btn');
    elements.visitMarketBtn = document.getElementById('visit-market-btn');
    elements.travelBtn = document.getElementById('travel-btn');
    elements.transportationBtn = document.getElementById('transportation-btn');
    elements.transportationQuickBtn = document.getElementById('transportation-quick-btn');
    elements.closeMarketBtn = document.getElementById('close-market-btn');
    elements.closeInventoryBtn = document.getElementById('close-inventory-btn');
    elements.closeTravelBtn = document.getElementById('close-travel-btn');
    elements.closeTransportationBtn = document.getElementById('close-transportation-btn');
    elements.menuBtn = document.getElementById('menu-btn');
    elements.inventoryBtn = document.getElementById('inventory-btn');
    elements.saveBtn = document.getElementById('save-btn');
    
    // Forms
    elements.characterForm = document.getElementById('character-form');
    elements.characterNameInput = document.getElementById('character-name-input');
    elements.characterClass = document.getElementById('character-class');
    
    // Character Creation Elements
    elements.perksContainer = document.getElementById('perks-container');
    elements.selectedPerksCount = document.getElementById('selected-perks-count');
    elements.startingGoldAmount = document.getElementById('starting-gold-amount');
    elements.randomizeCharacterBtn = document.getElementById('randomize-character-btn');
    elements.previewName = document.getElementById('preview-name');
    elements.characterAvatar = document.getElementById('character-avatar');
}

// Setup event listeners
function setupEventListeners() {
    // Main Menu
    elements.newGameBtn.addEventListener('click', startNewGame);
    elements.loadGameBtn.addEventListener('click', loadGame);
    elements.settingsBtn.addEventListener('click', showSettings);
    
    // Character Creation
    elements.characterForm.addEventListener('submit', createCharacter);
    elements.randomizeCharacterBtn.addEventListener('click', randomizeCharacter);
    elements.characterNameInput.addEventListener('input', updateCharacterPreview);
    
    // Game Controls
    elements.visitMarketBtn.addEventListener('click', openMarket);
    elements.travelBtn.addEventListener('click', openTravel);
    elements.transportationBtn.addEventListener('click', openTransportation);
    elements.transportationQuickBtn.addEventListener('click', openTransportation);
    elements.closeMarketBtn.addEventListener('click', closeMarket);
    elements.closeInventoryBtn.addEventListener('click', closeInventory);
    elements.closeTravelBtn.addEventListener('click', closeTravel);
    elements.closeTransportationBtn.addEventListener('click', closeTransportation);
    elements.menuBtn.addEventListener('click', toggleMenu);
    elements.inventoryBtn.addEventListener('click', openInventory);
    elements.saveBtn.addEventListener('click', saveGame);
    
    // Property & Employee Management
    elements.propertyEmployeeBtn.addEventListener('click', openPropertyEmployeePanel);
    
    // Game Setup
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', startGameWithDifficulty);
    }
    if (elements.cancelSetupBtn) {
        elements.cancelSetupBtn.addEventListener('click', cancelGameSetup);
    }
    
    // Save/Load
    if (elements.saveGameBtn) {
        elements.saveGameBtn.addEventListener('click', saveGame);
    }
    if (elements.loadGameBtn) {
        elements.loadGameBtn.addEventListener('click', loadGame);
    }
    
    // Market Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

// Game State Management Functions
function changeState(newState) {
    const oldState = game.state;
    game.state = newState;
    
    // Handle state transitions
    switch (newState) {
        case GameState.MENU:
            showScreen('main-menu');
            break;
        case GameState.LOADING:
            showScreen('loading-screen');
            break;
        case GameState.CHARACTER_CREATION:
            showScreen('game-container');
            showPanel('character-panel');
            initializeCharacterCreation();
            break;
        case GameState.PLAYING:
            showScreen('game-container');
            hideAllPanels();
            showPanel('location-panel');
            startGameLoop();
            break;
        case GameState.PAUSED:
            // Pause game logic
            break;
        case GameState.MARKET:
            showPanel('market-panel');
            break;
        case GameState.INVENTORY:
            showPanel('inventory-panel');
            break;
        case GameState.TRAVEL:
            showPanel('travel-panel');
            break;
        case GameState.TRANSPORTATION:
            showPanel('transportation-panel');
            break;
    }
    
    console.log(`Game state changed from ${oldState} to ${newState}`);
}

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show the requested screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

// Panel Management
function showPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
    }
}

function hidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('hidden');
    }
}

function hideAllPanels() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.add('hidden');
    });
}

// Tab Management
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Game Functions
function startNewGame() {
    changeState(GameState.CHARACTER_CREATION);
    addMessage('Starting a new game...');
}

// Character Creation State
let selectedPerks = [];
let characterCreationState = {
    baseGold: 100,
    currentGold: 100,
    attributes: {...baseAttributes}
};

// Initialize character creation
function initializeCharacterCreation() {
    selectedPerks = [];
    characterCreationState = {
        baseGold: 100,
        currentGold: 100,
        attributes: {...baseAttributes}
    };
    
    populatePerks();
    updateCharacterPreview();
    updatePerkSelection();
}

// Populate perks in the character creation UI
function populatePerks() {
    elements.perksContainer.innerHTML = '';
    
    for (const [key, perk] of Object.entries(perks)) {
        const perkCard = createPerkCard(perk);
        elements.perksContainer.appendChild(perkCard);
    }
}

// Create a perk card element
function createPerkCard(perk) {
    const card = document.createElement('div');
    card.className = 'perk-card';
    card.dataset.perkId = perk.id;
    
    // Create header with icon and name
    const header = document.createElement('div');
    header.className = 'perk-header';
    header.innerHTML = `
        <span class="perk-icon">${perk.icon}</span>
        <span class="perk-name">${perk.name}</span>
    `;
    
    // Create description
    const description = document.createElement('div');
    description.className = 'perk-description';
    description.textContent = perk.description;
    
    // Create effects
    const effects = document.createElement('div');
    effects.className = 'perk-effects';
    
    // Add positive effects
    for (const [effectName, value] of Object.entries(perk.effects)) {
        const effect = document.createElement('div');
        effect.className = 'perk-effect positive';
        const formattedEffect = formatPerkEffect(effectName, value, true);
        effect.innerHTML = `<span class="perk-effect-icon">✓</span> ${formattedEffect}`;
        effects.appendChild(effect);
    }
    
    // Add negative effects
    for (const [effectName, value] of Object.entries(perk.negativeEffects)) {
        const effect = document.createElement('div');
        effect.className = 'perk-effect negative';
        const formattedEffect = formatPerkEffect(effectName, value, false);
        effect.innerHTML = `<span class="perk-effect-icon">✗</span> ${formattedEffect}`;
        effects.appendChild(effect);
    }
    
    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(effects);
    
    // Add click event
    card.addEventListener('click', () => togglePerkSelection(perk.id));
    
    return card;
}

// Format perk effect for display
function formatPerkEffect(effectName, value, isPositive) {
    const sign = isPositive ? '+' : '';
    
    switch(effectName) {
        case 'goldBonus':
            return `${sign}${Math.round(value * 100)}% starting gold`;
        case 'goldPenalty':
            return `${sign}${Math.round(value * 100)}% starting gold`;
        case 'priceBonus':
            return `${sign}${Math.round(value * 100)}% better prices`;
        case 'negotiationBonus':
            return `${sign}${Math.round(value * 100)}% negotiation`;
        case 'negotiationPenalty':
            return `${sign}${Math.round(value * 100)}% negotiation`;
        case 'carryBonus':
            return `${sign}${Math.round(value * 100)}% carry capacity`;
        case 'carryPenalty':
            return `${sign}${Math.round(value * 100)}% carry capacity`;
        case 'travelCostReduction':
            return `${sign}${Math.round(value * 100)}% travel costs`;
        case 'reputationBonus':
            return `${sign}${Math.round(value)} reputation`;
        case 'reputationPenalty':
            return `${sign}${Math.round(value)} reputation`;
        case 'randomEventBonus':
            return `${sign}${Math.round(value * 100)}% positive events`;
        case 'findBonus':
            return `${sign}${Math.round(value * 100)}% find items`;
        case 'skillGainBonus':
            return `${sign}${Math.round(value * 100)}% skill improvement`;
        case 'experienceBonus':
            return `${sign}${Math.round(value * 100)}% experience gain`;
        case 'startingSkillPenalty':
            return `${sign}${Math.round(value)} starting skills`;
        case 'marketAccessBonus':
            return `${sign}${Math.round(value * 100)}% market access`;
        case 'maintenanceCostReduction':
            return `${sign}${Math.round(value * 100)}% maintenance`;
        case 'luxuryPenalty':
            return `${sign}${Math.round(value * 100)}% luxury effectiveness`;
        case 'highRiskBonus':
            return `${sign}${Math.round(value * 100)}% high-risk returns`;
        case 'highRiskPenalty':
            return `${sign}${Math.round(value * 100)}% high-risk losses`;
        case 'adventureBonus':
            return `${sign}${Math.round(value * 100)}% adventure rewards`;
        case 'travelSpeedBonus':
            return `${sign}${Math.round(value * 100)}% travel speed`;
        case 'survivalBonus':
            return `${sign}${Math.round(value * 100)}% survival`;
        case 'marketPenalty':
            return `${sign}${Math.round(value * 100)}% market prices`;
        case 'marketInsightBonus':
            return `${sign}${Math.round(value * 100)}% market insight`;
        case 'rareItemBonus':
            return `${sign}${Math.round(value * 100)}% rare item identification`;
        case 'reputationGainBonus':
            return `${sign}${Math.round(value * 100)}% reputation gain`;
        default:
            return `${effectName}: ${value}`;
    }
}

// Toggle perk selection
function togglePerkSelection(perkId) {
    const perkCard = document.querySelector(`[data-perk-id="${perkId}"]`);
    
    if (selectedPerks.includes(perkId)) {
        // Deselect perk
        selectedPerks = selectedPerks.filter(id => id !== perkId);
        perkCard.classList.remove('selected');
    } else {
        // Select perk if we haven't reached the limit
        if (selectedPerks.length < 2) {
            selectedPerks.push(perkId);
            perkCard.classList.add('selected');
        } else {
            addMessage('You can only select up to 2 perks.');
            return;
        }
    }
    
    updatePerkSelection();
    calculateCharacterStats();
}

// Update perk selection display
function updatePerkSelection() {
    elements.selectedPerksCount.textContent = selectedPerks.length;
    
    // Update card states
    document.querySelectorAll('.perk-card').forEach(card => {
        const perkId = card.dataset.perkId;
        const isSelected = selectedPerks.includes(perkId);
        const isDisabled = !isSelected && selectedPerks.length >= 2;
        
        card.classList.toggle('selected', isSelected);
        card.classList.toggle('disabled', isDisabled);
    });
}

// Calculate character stats based on selected perks
function calculateCharacterStats() {
    // Reset to base values
    characterCreationState.currentGold = characterCreationState.baseGold;
    characterCreationState.attributes = {...baseAttributes};
    
    // Apply perk effects
    selectedPerks.forEach(perkId => {
        const perk = perks[perkId];
        if (!perk) return;
        
        // Apply gold bonuses/penalties
        if (perk.effects.goldBonus) {
            characterCreationState.currentGold += Math.round(characterCreationState.baseGold * perk.effects.goldBonus);
        }
        if (perk.negativeEffects.goldPenalty) {
            characterCreationState.currentGold -= Math.round(characterCreationState.baseGold * perk.negativeEffects.goldPenalty);
        }
        
        // Apply attribute modifiers
        applyAttributeModifiers(perk);
    });
    
    // Update UI
    updateCharacterPreview();
}

// Apply attribute modifiers from perks
function applyAttributeModifiers(perk) {
    // Map perks to attribute modifications
    const attributeMap = {
        'strongBack': { strength: 2, endurance: 1 },
        'charismatic': { charisma: 3, intelligence: 1 },
        'quickLearner': { intelligence: 2, luck: 1 },
        'nomad': { endurance: 2, strength: 1 },
        'scholar': { intelligence: 3, charisma: 1 },
        'riskTaker': { luck: 2, charisma: 1 },
        'frugal': { intelligence: 1, luck: 1 },
        'wellConnected': { charisma: 2, intelligence: 1 }
    };
    
    const modifiers = attributeMap[perk.id];
    if (modifiers) {
        for (const [attr, value] of Object.entries(modifiers)) {
            if (characterCreationState.attributes[attr] !== undefined) {
                characterCreationState.attributes[attr] += value;
            }
        }
    }
}

// Update character preview display
function updateCharacterPreview() {
    const name = elements.characterNameInput.value.trim() || 'Your Character';
    elements.previewName.textContent = name;
    elements.startingGoldAmount.textContent = characterCreationState.currentGold;
    
    // Update attributes display
    for (const [attr, value] of Object.entries(characterCreationState.attributes)) {
        const attrElement = document.getElementById(`attr-${attr}`);
        if (attrElement) {
            attrElement.textContent = value;
        }
    }
    
    // Update avatar based on selected perks
    updateCharacterAvatar();
}

// Update character avatar based on selected perks
function updateCharacterAvatar() {
    const avatarIcon = elements.characterAvatar.querySelector('.avatar-icon');
    
    // Default avatar
    let icon = '🧑';
    
    // Change avatar based on primary perk
    if (selectedPerks.length > 0) {
        const primaryPerk = perks[selectedPerks[0]];
        if (primaryPerk) {
            icon = primaryPerk.icon;
        }
    }
    
    avatarIcon.textContent = icon;
}

// Randomize character
function randomizeCharacter() {
    // Generate random name
    const names = ['Alex', 'Morgan', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    elements.characterNameInput.value = randomName;
    
    // Clear current selection
    selectedPerks = [];
    document.querySelectorAll('.perk-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select random perks
    const perkIds = Object.keys(perks);
    const numPerks = Math.floor(Math.random() * 3); // 0-2 perks
    
    for (let i = 0; i < numPerks; i++) {
        const randomPerkId = perkIds[Math.floor(Math.random() * perkIds.length)];
        if (!selectedPerks.includes(randomPerkId)) {
            selectedPerks.push(randomPerkId);
        }
    }
    
    updatePerkSelection();
    calculateCharacterStats();
}

function createCharacter(event) {
    event.preventDefault();
    
    const name = elements.characterNameInput.value.trim();
    const characterClass = elements.characterClass.value;
    
    if (!name) {
        addMessage('Please enter a character name.');
        return;
    }
    
    // Initialize player with stats
    game.player = {
        name: name,
        class: characterClass,
        gold: characterCreationState.currentGold,
        inventory: {},
        reputation: 0,
        skills: {
            trading: 1,
            negotiation: 1,
            perception: 1
        },
        stats: {
            health: 100,
            maxHealth: 100,
            hunger: 50,
            maxHunger: 100,
            thirst: 50,
            maxThirst: 100,
            stamina: 100,
            maxStamina: 100,
            happiness: 50,
            maxHappiness: 100
        },
        attributes: {...characterCreationState.attributes},
        transportation: 'backpack', // Start with backpack
        ownedTransportation: ['backpack'], // Track owned transportation
        currentLoad: 0, // Current weight carried
        lastRestTime: 0,
        perks: selectedPerks
    };
    
    // Give starting items
    game.player.inventory = {
        food: 5,
        water: 3,
        bread: 3,
        gold: characterCreationState.currentGold
    };
    
    // Initialize game world
    initializeGameWorld();
    
    // Update UI
    updatePlayerInfo();
    updatePlayerStats();
    
    // Change to playing state
    changeState(GameState.PLAYING);
    addMessage(`Welcome, ${name} the ${characterClass}!`);
    addMessage('You start with some basic supplies for your journey.');
}

function initializeGameWorld() {
    // Initialize GameWorld system
    GameWorld.init();
    
    // Set starting location
    game.currentLocation = {
        id: 'riverwood',
        name: 'Riverwood Village',
        description: 'A small village nestled by a peaceful river.'
    };
    
    updateLocationInfo();
}

function updatePlayerInfo() {
    if (game.player) {
        elements.playerName.textContent = game.player.name;
        elements.playerGold.textContent = `Gold: ${game.player.gold}`;
        
        // Update attribute displays
        if (elements.playerStrength) elements.playerStrength.textContent = game.player.attributes.strength;
        if (elements.playerIntelligence) elements.playerIntelligence.textContent = game.player.attributes.intelligence;
        if (elements.playerCharisma) elements.playerCharisma.textContent = game.player.attributes.charisma;
        if (elements.playerEndurance) elements.playerEndurance.textContent = game.player.attributes.endurance;
        if (elements.playerLuck) elements.playerLuck.textContent = game.player.attributes.luck;
    }
}

// Update player stats display
function updatePlayerStats() {
    if (!game.player || !game.player.stats) return;
    
    // Create stats display if it doesn't exist
    let statsDisplay = document.getElementById('player-stats');
    if (!statsDisplay) {
        statsDisplay = document.createElement('div');
        statsDisplay.id = 'player-stats';
        statsDisplay.className = 'player-stats';
        const playerInfo = document.getElementById('player-info') || document.querySelector('.player-info');
        if (playerInfo) {
            playerInfo.appendChild(statsDisplay);
        }
    }
    
    const stats = game.player.stats;
    statsDisplay.innerHTML = `
        <div class="stat-bar">
            <span class="stat-label">❤️ Health</span>
            <div class="stat-progress">
                <div class="stat-fill health-fill" style="width: ${(stats.health / stats.maxHealth) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.health}/${stats.maxHealth}</span>
        </div>
        <div class="stat-bar">
            <span class="stat-label">🍖 Hunger</span>
            <div class="stat-progress">
                <div class="stat-fill hunger-fill" style="width: ${(stats.hunger / stats.maxHunger) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.hunger}/${stats.maxHunger}</span>
        </div>
        <div class="stat-bar">
            <span class="stat-label">💧 Thirst</span>
            <div class="stat-progress">
                <div class="stat-fill thirst-fill" style="width: ${(stats.thirst / stats.maxThirst) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.thirst}/${stats.maxThirst}</span>
        </div>
        <div class="stat-bar">
            <span class="stat-label">⚡ Stamina</span>
            <div class="stat-progress">
                <div class="stat-fill stamina-fill" style="width: ${(stats.stamina / stats.maxStamina) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.stamina}/${stats.maxStamina}</span>
        </div>
        <div class="stat-bar">
            <span class="stat-label">😊 Happiness</span>
            <div class="stat-progress">
                <div class="stat-fill happiness-fill" style="width: ${(stats.happiness / stats.maxHappiness) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.happiness}/${stats.maxHappiness}</span>
        </div>
    `;
}

function updateLocationInfo() {
    if (game.currentLocation) {
        document.getElementById('location-name').textContent = game.currentLocation.name;
        document.getElementById('location-description').textContent = game.currentLocation.description;
    }
}

function updateLocationPanel() {
    const location = GameWorld.locations[game.currentLocation.id];
    if (!location) return;
    
    const locationPanel = document.getElementById('location-panel');
    if (!locationPanel) return;
    
    // Update location name and description
    locationPanel.querySelector('h2').textContent = location.name;
    const descElement = locationPanel.querySelector('#location-description');
    if (descElement) {
        descElement.textContent = location.description;
    }
    
    // Add location details after description
    let detailsElement = locationPanel.querySelector('.location-details');
    if (!detailsElement) {
        detailsElement = document.createElement('div');
        detailsElement.className = 'location-details';
        descElement.parentNode.insertBefore(detailsElement, descElement.nextSibling);
    }
    
    detailsElement.innerHTML = `
        <p><strong>Type:</strong> ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>
        <p><strong>Population:</strong> ${location.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${GameWorld.regions[location.region].name}</p>
        <p><strong>Specialties:</strong> ${location.specialties.map(s => formatItemName(s)).join(', ')}</p>
    `;
    
    // Add rest/recovery options
    let restElement = locationPanel.querySelector('.location-rest-options');
    if (!restElement) {
        restElement = document.createElement('div');
        restElement.className = 'location-rest-options';
        detailsElement.parentNode.insertBefore(restElement, detailsElement.nextSibling);
    }
    
    const isInn = location.type === 'town' || location.type === 'city';
    restElement.innerHTML = `
        <h3>Rest & Recovery</h3>
        ${isInn ? `<button class="rest-btn" onclick="restAtInn()">Rest at Inn (20 gold)</button>` : ''}
        ${game.player && game.player.ownsHouse && isInn ? `<button class="rest-btn" onclick="restInHouse()">Rest in House (Free)</button>` : ''}
        ${!game.player || !game.player.ownsHouse ? `<button class="buy-house-btn" onclick="buyHouse()">Buy House (1000 gold)</button>` : ''}
    `;
    
    // Add region unlock info
    const unlockedRegions = GameWorld.unlockedRegions;
    const availableRegions = Object.values(GameWorld.regions).filter(region =>
        !unlockedRegions.includes(region.id) && GameWorld.canUnlockRegion(region.id)
    );
    
    if (availableRegions.length > 0) {
        let unlockElement = locationPanel.querySelector('.region-unlocks');
        if (!unlockElement) {
            unlockElement = document.createElement('div');
            unlockElement.className = 'region-unlocks';
            detailsElement.parentNode.insertBefore(unlockElement, detailsElement.nextSibling);
        }
        
        unlockElement.innerHTML = `
            <h3>Available Regions to Unlock:</h3>
            ${availableRegions.map(region => `
                <div class="region-option">
                    <strong>${region.name}</strong> - ${region.description}
                    <span class="region-cost">💰 ${region.goldRequirement} gold</span>
                    <button class="unlock-btn" onclick="unlockRegion('${region.id}')">Unlock</button>
                </div>
            `).join('')}
        `;
    }
}

// Unlock region function
function unlockRegion(regionId) {
    const region = GameWorld.regions[regionId];
    if (!region) return;
    
    if (!GameWorld.canUnlockRegion(regionId)) {
        addMessage(`Cannot unlock ${region.name}! Requirements not met.`);
        return;
    }
    
    if (game.player.gold < region.goldRequirement) {
        addMessage(`You need ${region.goldRequirement} gold to unlock ${region.name}!`);
        return;
    }
    
    // Deduct gold and unlock region
    game.player.gold -= region.goldRequirement;
    GameWorld.unlockRegion(regionId);
    
    // Update UI
    updatePlayerInfo();
    updateLocationPanel();
    
    addMessage(`🎉 Unlocked ${region.name}! New destinations are now available.`);
}

// Market Functions
function openMarket() {
    changeState(GameState.MARKET);
    populateMarketItems();
    updateMarketHeader();
    updateMarketEvents();
    populateItemFilter();
    populateComparisonSelect();
    updateMarketNews();
}

function closeMarket() {
    changeState(GameState.PLAYING);
}

function updateMarketHeader() {
    const location = GameWorld.locations[game.currentLocation.id];
    if (!location) return;
    
    // Update market location
    const marketLocation = document.getElementById('market-location');
    if (marketLocation) {
        marketLocation.textContent = `${location.name} Market`;
    }
    
    // Update reputation display
    const reputationDisplay = document.getElementById('market-reputation');
    if (reputationDisplay && location.reputation) {
        const reputation = location.reputation.player;
        let reputationText = 'Neutral';
        let reputationClass = 'neutral';
        
        if (reputation >= 75) {
            reputationText = 'Elite';
            reputationClass = 'elite';
        } else if (reputation >= 50) {
            reputationText = 'Trusted';
            reputationClass = 'trusted';
        } else if (reputation >= 25) {
            reputationText = 'Friendly';
            reputationClass = 'friendly';
        } else if (reputation >= 0) {
            reputationText = 'Neutral';
            reputationClass = 'neutral';
        } else if (reputation >= -25) {
            reputationText = 'Suspicious';
            reputationClass = 'suspicious';
        } else if (reputation >= -50) {
            reputationText = 'Untrusted';
            reputationClass = 'untrusted';
        } else {
            reputationText = 'Hostile';
            reputationClass = 'hostile';
        }
        
        reputationDisplay.textContent = `Reputation: ${reputationText} (${reputation})`;
        reputationDisplay.className = `reputation-display ${reputationClass}`;
    }
}

function updateMarketEvents() {
    const marketEvents = document.getElementById('market-events');
    if (!marketEvents) return;
    
    const location = GameWorld.locations[game.currentLocation.id];
    if (!location || !location.reputation) return;
    
    const events = CityEventSystem.getCityEvents(location.id);
    
    if (events.length === 0) {
        marketEvents.innerHTML = '<span>No active events</span>';
        return;
    }
    
    marketEvents.innerHTML = events.map(event =>
        `<div class="market-event">${event.name}</div>`
    ).join('');
}

function populateItemFilter() {
    const itemFilter = document.getElementById('item-filter');
    if (!itemFilter) return;
    
    // Filter options are already in HTML, just need to add event listener
    itemFilter.addEventListener('change', updateMarketDisplay);
}

function populateComparisonSelect() {
    const compareSelect = document.getElementById('compare-item-select');
    if (!compareSelect) return;
    
    // Get all items that exist in any market
    const allItems = new Set();
    Object.values(GameWorld.locations).forEach(location => {
        if (location.marketPrices) {
            Object.keys(location.marketPrices).forEach(itemId => {
                allItems.add(itemId);
            });
        }
    });
    
    // Clear existing options except the first one
    while (compareSelect.children.length > 1) {
        compareSelect.removeChild(compareSelect.lastChild);
    }
    
    // Add item options
    Array.from(allItems).sort().forEach(itemId => {
        const item = ItemDatabase.getItem(itemId);
        if (item) {
            const option = document.createElement('option');
            option.value = itemId;
            option.textContent = item.name;
            compareSelect.appendChild(option);
        }
    });
}

function updateMarketNews() {
    const marketNews = document.getElementById('market-news');
    if (!marketNews) return;
    
    const news = DynamicMarketSystem.generateMarketNews();
    
    if (news.length === 0) {
        marketNews.innerHTML = '<div class="news-item"><div class="news-content">No market news available.</div></div>';
        return;
    }
    
    marketNews.innerHTML = news.map(newsItem => {
        let newsClass = 'news-item';
        if (newsItem.includes('📈')) newsClass += ' price-rise';
        else if (newsItem.includes('📉')) newsClass += ' price-fall';
        else if (newsItem.includes('📢')) newsClass += ' event';
        
        return `
            <div class="${newsClass}">
                <div class="news-time">${TimeSystem.getFormattedTime()}</div>
                <div class="news-content">${newsItem}</div>
            </div>
        `;
    }).join('');
}

function populateMarketItems() {
    updateMarketDisplay();
    
    const sellItemsContainer = document.getElementById('sell-items');
    if (!sellItemsContainer) return;
    
    sellItemsContainer.innerHTML = '';
    
    if (!game.player.inventory || Object.keys(game.player.inventory).length === 0) {
        sellItemsContainer.innerHTML = '<p>You have no items to sell.</p>';
        return;
    }
    
    for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
        if (quantity <= 0) continue;
        
        const item = ItemDatabase.getItem(itemId);
        if (!item) continue;
        
        const location = GameWorld.locations[game.currentLocation.id];
        const reputationModifier = CityReputationSystem.getPriceModifier(location.id);
        const baseSellPrice = Math.round(ItemDatabase.calculatePrice(itemId) * 0.7);
        const sellPrice = Math.round(baseSellPrice * reputationModifier);
        
        const itemElement = document.createElement('div');
        itemElement.className = `market-item ${item.rarity.name.toLowerCase()} ${TradingSystem.selectedTradeItems.has(itemId) ? 'selected' : ''}`;
        itemElement.dataset.itemId = itemId;
        
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">×${quantity}</div>
            <div class="item-price">${sellPrice} gold</div>
            <div class="item-weight">${ItemDatabase.calculateWeight(itemId, quantity).toFixed(1)} lbs</div>
            <button class="sell-item-btn" onclick="sellItem('${itemId}')">Sell</button>
        `;
        
        // Add event listeners for bulk selection
        if (TradingSystem.tradeMode === 'bulk') {
            itemElement.addEventListener('click', (e) => {
                if (e.shiftKey || e.ctrlKey || e.altKey) return;
                
                if (TradingSystem.selectedTradeItems.has(itemId)) {
                    TradingSystem.selectedTradeItems.delete(itemId);
                    itemElement.classList.remove('selected');
                } else {
                    TradingSystem.selectedTradeItems.set(itemId, 1);
                    itemElement.classList.add('selected');
                }
                
                TradingSystem.updateTradeSummary();
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                TradingSystem.updateTradePreview(itemId, 1);
            });
        }
        
        sellItemsContainer.appendChild(itemElement);
    }
}

// Travel Functions
function openTravel() {
    changeState(GameState.TRAVEL);
    populateDestinations();
}

function closeTravel() {
    changeState(GameState.PLAYING);
}

function populateDestinations() {
    const destinationsContainer = document.getElementById('destinations');
    destinationsContainer.innerHTML = '';
    
    const destinations = GameWorld.getAvailableDestinations();
    
    if (destinations.length === 0) {
        destinationsContainer.innerHTML = '<p>No destinations available from current location.</p>';
        return;
    }
    
    destinations.forEach(destination => {
        const destElement = document.createElement('div');
        destElement.className = 'destination';
        destElement.innerHTML = `
            <div class="destination-name">${destination.name}</div>
            <div class="destination-info">
                <span class="destination-type">${destination.type.charAt(0).toUpperCase() + destination.type.slice(1)}</span>
                <span class="destination-population">Pop: ${destination.population.toLocaleString()}</span>
            </div>
            <div class="destination-details">
                <span class="destination-cost">💰 ${destination.travelCost} gold</span>
                <span class="destination-time">⏱️ ${destination.travelTime} minutes</span>
            </div>
            <div class="destination-specialties">
                <strong>Specialties:</strong> ${destination.specialties.join(', ')}
            </div>
        `;
        
        destElement.addEventListener('click', () => {
            if (GameWorld.travelTo(destination.id)) {
                closeTravel();
            }
        });
        
        destinationsContainer.appendChild(destElement);
    });
}

// Inventory Functions
function openInventory() {
    changeState(GameState.INVENTORY);
    populateInventory();
}

function closeInventory() {
    changeState(GameState.PLAYING);
}

function populateInventory() {
    updateInventoryDisplay();
}

// Transportation Functions
function openTransportation() {
    changeState(GameState.TRANSPORTATION);
    updateTransportationInfo();
    populateTransportationOptions();
}

function closeTransportation() {
    changeState(GameState.PLAYING);
}

function updateTransportationInfo() {
    if (game.player) {
        const currentTransport = transportationOptions[game.player.transportation];
        document.getElementById('current-transport').textContent = currentTransport.name;
        document.getElementById('carry-capacity').textContent = `${currentTransport.carryCapacity} lbs`;
        document.getElementById('current-load').textContent = `${game.player.currentLoad} lbs`;
    }
}

function populateTransportationOptions() {
    const container = document.getElementById('transportation-options');
    container.innerHTML = '';
    
    for (const [key, transport] of Object.entries(transportationOptions)) {
        // Skip if player already owns this transportation
        if (game.player.ownedTransportation.includes(key)) {
            continue;
        }
        
        const transportElement = document.createElement('div');
        transportElement.className = 'item';
        transportElement.innerHTML = `
            <div class="item-name">${transport.name}</div>
            <div class="item-price">${transport.price} gold</div>
            <div class="item-quantity">Capacity: ${transport.carryCapacity} lbs</div>
        `;
        
        transportElement.addEventListener('click', () => purchaseTransportation(key));
        container.appendChild(transportElement);
    }
    
    if (container.innerHTML === '') {
        container.innerHTML = '<p>You own all available transportation options!</p>';
    }
}

function purchaseTransportation(transportId) {
    const transport = transportationOptions[transportId];
    
    if (!transport) {
        addMessage('Invalid transportation option.');
        return;
    }
    
    if (game.player.gold < transport.price) {
        addMessage(`You don't have enough gold to purchase a ${transport.name}.`);
        return;
    }
    
    // Check for requirements (e.g., need an animal for wagon)
    if (transport.requiresAnimal) {
        const hasAnimal = game.player.ownedTransportation.includes('horse') ||
                         game.player.ownedTransportation.includes('donkey') ||
                         game.player.ownedTransportation.includes('oxen');
        
        if (!hasAnimal) {
            addMessage(`You need an animal (horse, donkey, or oxen) to use a ${transport.name}.`);
            return;
        }
    }
    
    // Purchase the transportation
    game.player.gold -= transport.price;
    game.player.ownedTransportation.push(transportId);
    
    addMessage(`You purchased a ${transport.name} for ${transport.price} gold!`);
    
    // Update UI
    updatePlayerInfo();
    updateTransportationInfo();
    populateTransportationOptions();
}

function switchTransportation(transportId) {
    const transport = transportationOptions[transportId];
    
    if (!transport) {
        addMessage('Invalid transportation option.');
        return;
    }
    
    if (!game.player.ownedTransportation.includes(transportId)) {
        addMessage(`You don't own a ${transport.name}.`);
        return;
    }
    
    // Check if current load exceeds new capacity
    if (game.player.currentLoad > transport.carryCapacity) {
        addMessage(`You cannot switch to ${transport.name} - your current load (${game.player.currentLoad} lbs) exceeds its capacity (${transport.carryCapacity} lbs).`);
        return;
    }
    
    game.player.transportation = transportId;
    addMessage(`You are now using ${transport.name}.`);
    
    // Update UI
    updateTransportationInfo();
}

function calculateCurrentLoad() {
    if (!game.player || !game.player.inventory) return 0;
    
    let totalWeight = 0;
    for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
        if (itemId === 'gold') continue; // Gold doesn't count toward weight
        totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
    }
    
    return totalWeight;
}

function updateCurrentLoad() {
    game.player.currentLoad = calculateCurrentLoad();
    updateTransportationInfo();
}

// Item Usage System
function useItem(itemId) {
    if (!game.player || !game.player.inventory) return false;
    
    const item = ItemDatabase.getItem(itemId);
    if (!item) {
        addMessage(`Unknown item: ${itemId}`);
        return false;
    }
    
    // Check if player has the item
    const quantity = game.player.inventory[itemId] || 0;
    if (quantity <= 0) {
        addMessage(`You don't have any ${item.name}!`);
        return false;
    }
    
    // Use item based on its type
    if (item.consumable) {
        return useConsumable(item);
    } else if (item.toolType) {
        return useTool(item);
    } else if (item.damage) {
        return equipWeapon(item);
    } else {
        addMessage(`${item.name} cannot be used directly.`);
        return false;
    }
}

// Use consumable items
function useConsumable(item) {
    if (!item.effects) {
        addMessage(`${item.name} has no effect.`);
        return false;
    }
    
    // Apply effects to player stats
    let effectMessage = `You used ${item.name}. `;
    const effects = [];
    
    for (const [stat, value] of Object.entries(item.effects)) {
        if (stat === 'duration') continue; // Skip duration, handled separately
        
        const currentValue = game.player.stats[stat] || 0;
        const maxValue = game.player.stats[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || 100;
        
        let newValue = currentValue + value;
        
        // Special handling for food and medical items based on user feedback
        if (item.category === 'food' || item.category === 'consumables') {
            // Food items refill health and stamina
            if (stat === 'health') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.health = newValue;
                effects.push(`Health +${Math.min(value, maxValue - currentValue)}`);
            } else if (stat === 'stamina') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.stamina = newValue;
                effects.push(`Stamina +${Math.min(value, maxValue - currentValue)}`);
            }
        } else if (item.category === 'medical') {
            // Medical items refill health
            if (stat === 'health') {
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats.health = newValue;
                effects.push(`Health +${Math.min(value, maxValue - currentValue)}`);
            }
        } else {
            // Handle temporary effects for other items
            if (item.effects.duration) {
                // Apply temporary effect
                if (!game.player.temporaryEffects) game.player.temporaryEffects = {};
                game.player.temporaryEffects[stat] = {
                    value: value,
                    duration: item.effects.duration,
                    startTime: Date.now()
                };
                effects.push(`${stat} +${value} for ${Math.floor(item.effects.duration / 60)} minutes`);
            } else {
                // Apply permanent effect
                newValue = Math.max(0, Math.min(maxValue, newValue));
                game.player.stats[stat] = newValue;
                
                if (value > 0) {
                    effects.push(`${stat} +${Math.min(value, maxValue - currentValue)}`);
                } else {
                    effects.push(`${stat} ${value}`);
                }
            }
        }
    }
    
    // Remove one item from inventory
    game.player.inventory[item.id]--;
    if (game.player.inventory[item.id] <= 0) {
        delete game.player.inventory[item.id];
    }
    
    effectMessage += effects.join(', ');
    addMessage(effectMessage);
    
    // Update UI
    updatePlayerStats();
    updateInventoryDisplay();
    
    return true;
}

// Use tool items
function useTool(item) {
    if (!item.toolType) return false;
    
    // Check tool durability
    if (item.durability && game.player.toolDurability && game.player.toolDurability[item.id]) {
        const currentDurability = game.player.toolDurability[item.id];
        if (currentDurability <= 0) {
            addMessage(`Your ${item.name} is broken and needs repair!`);
            return false;
        }
    }
    
    addMessage(`You equipped your ${item.name} for ${item.toolType}.`);
    game.player.equippedTool = item.id;
    
    return true;
}

// Equip weapon items
function equipWeapon(item) {
    if (!item.damage) return false;
    
    addMessage(`You equipped ${item.name} (Damage: ${item.damage}).`);
    game.player.equippedWeapon = item.id;
    
    return true;
}

// Update player stats over time (hunger, thirst, etc.)
function updatePlayerStatsOverTime() {
    if (!game.player || !game.player.stats) return;
    
    const timeInfo = TimeSystem.getTimeInfo();
    
    // Only update every few game minutes to avoid rapid changes
    if (timeInfo.minute % 5 !== 0) return;
    
    // Natural stat changes over time - hunger and thirst go down over time
    game.player.stats.hunger = Math.max(0, game.player.stats.hunger - 1);
    game.player.stats.thirst = Math.max(0, game.player.stats.thirst - 2);
    
    // Stamina is only used for fast travel and is NOT reduced over time
    // It's only consumed when traveling and refilled by food
    
    // Health effects from hunger/thirst
    if (game.player.stats.hunger <= 0) {
        game.player.stats.health = Math.max(0, game.player.stats.health - 2);
        addMessage("⚠️ You're starving! Health decreasing.", 'warning');
    }
    
    if (game.player.stats.thirst <= 0) {
        game.player.stats.health = Math.max(0, game.player.stats.health - 3);
        addMessage("⚠️ You're dehydrated! Health decreasing.", 'warning');
    }
    
    // Update temporary effects
    if (game.player.temporaryEffects) {
        const currentTime = Date.now();
        for (const [stat, effect] of Object.entries(game.player.temporaryEffects)) {
            const elapsedMinutes = (currentTime - effect.startTime) / 60000;
            if (elapsedMinutes >= effect.duration) {
                // Remove expired effect
                delete game.player.temporaryEffects[stat];
                addMessage(`The effect on ${stat} has worn off.`);
            }
        }
    }
    
    // Check if player is dead
    if (game.player.stats.health <= 0) {
        handlePlayerDeath();
    }
    
    updatePlayerStats();
}

// Handle player death
function handlePlayerDeath() {
    addMessage("💀 You have died! Game Over.");
    changeState(GameState.MENU);
    // Could implement respawn system here
}

// Rest and Recovery System
function restAtInn() {
    const innCost = 20;
    
    if (game.player.gold < innCost) {
        addMessage(`You need ${innCost} gold to rest at inn.`);
        return false;
    }
    
    // Pay for inn
    game.player.gold -= innCost;
    
    // Restore all stats
    game.player.stats.health = game.player.stats.maxHealth;
    game.player.stats.hunger = game.player.stats.maxHunger;
    game.player.stats.thirst = game.player.stats.maxThirst;
    game.player.stats.stamina = game.player.stats.maxStamina;
    game.player.stats.happiness = Math.min(100, game.player.stats.happiness + 20);
    
    // Advance time by 8 hours
    TimeSystem.addMinutes(8 * 60);
    
    addMessage("💤 You rested well at inn. All stats restored!");
    addMessage(`⏰ 8 hours have passed.`);
    
    updatePlayerInfo();
    updatePlayerStats();
    
    return true;
}

function restInHouse() {
    if (!game.player.ownsHouse) {
        addMessage("You don't own a house to rest in.");
        return false;
    }
    
    // Restore all stats (free for house owners)
    game.player.stats.health = game.player.stats.maxHealth;
    game.player.stats.hunger = game.player.stats.maxHunger;
    game.player.stats.thirst = game.player.stats.maxThirst;
    game.player.stats.stamina = game.player.stats.maxStamina;
    game.player.stats.happiness = Math.min(100, game.player.stats.happiness + 30);
    
    // Advance time by 8 hours
    TimeSystem.addMinutes(8 * 60);
    
    addMessage("🏠 You rested comfortably in your house. All stats restored!");
    addMessage(`⏰ 8 hours have passed.`);
    
    updatePlayerStats();
    
    return true;
}

function buyHouse() {
    const houseCost = 1000;
    
    if (game.player.gold < houseCost) {
        addMessage(`You need ${houseCost} gold to buy a house.`);
        return false;
    }
    
    if (game.player.ownsHouse) {
        addMessage("You already own a house!");
        return false;
    }
    
    game.player.gold -= houseCost;
    game.player.ownsHouse = true;
    
    addMessage("🏠 Congratulations! You bought a house in the city!");
    addMessage("You can now rest for free anytime you're in this city.");
    
    updatePlayerInfo();
    
    return true;
}

// Update inventory display with new items (legacy function - now handled by InventorySystem)
function updateInventoryDisplay() {
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.updateInventoryDisplay();
    } else {
        // Fallback to original implementation
        const inventoryContainer = document.getElementById('inventory-items');
        if (!inventoryContainer) return;
        
        inventoryContainer.innerHTML = '';
        
        if (!game.player.inventory || Object.keys(game.player.inventory).length === 0) {
            inventoryContainer.innerHTML = '<p>Your inventory is empty.</p>';
            return;
        }
        
        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
            if (quantity <= 0) continue;
            
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">×${quantity}</div>
                <div class="item-weight">${ItemDatabase.calculateWeight(itemId, quantity).toFixed(1)} lbs</div>
                ${item.consumable ? `<button class="use-item-btn" onclick="useItem('${itemId}')">Use</button>` : ''}
            `;
            
            inventoryContainer.appendChild(itemElement);
        }
    }
}

// Update market display with new items (enhanced for new trading system)
function updateMarketDisplay() {
    const buyItemsContainer = document.getElementById('buy-items');
    if (!buyItemsContainer) return;
    
    buyItemsContainer.innerHTML = '';
    
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation || !currentLocation.marketPrices) {
        buyItemsContainer.innerHTML = '<p>No items available at this market.</p>';
        return;
    }
    
    // Get filter value
    const itemFilter = document.getElementById('item-filter');
    const filterValue = itemFilter ? itemFilter.value : 'all';
    
    for (const [itemId, marketData] of Object.entries(currentLocation.marketPrices)) {
        const item = ItemDatabase.getItem(itemId);
        if (!item) continue;
        
        if (marketData.stock <= 0) continue;
        
        // Apply category filter
        if (filterValue !== 'all') {
            let itemCategory = 'other';
            if (item.category === ItemDatabase.categories.CONSUMABLES) itemCategory = 'consumables';
            else if (item.category === ItemDatabase.categories.BASIC_RESOURCES ||
                     item.category === ItemDatabase.categories.RAW_ORES) itemCategory = 'resources';
            else if (item.category === ItemDatabase.categories.TOOLS) itemCategory = 'tools';
            else if (item.category === ItemDatabase.categories.LUXURY) itemCategory = 'luxury';
            
            if (itemCategory !== filterValue) continue;
        }
        
        // Get price trend
        const trend = MarketPriceHistory.getPriceTrend(currentLocation.id, itemId);
        const trendClass = trend === 'rising' ? 'rising' : trend === 'falling' ? 'falling' : 'stable';
        const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
        
        // Get demand level
        let demandClass = '';
        let demandText = '';
        if (marketData.supplyDemandRatio) {
            if (marketData.supplyDemandRatio > 1.3) {
                demandClass = 'high';
                demandText = 'High Demand';
            } else if (marketData.supplyDemandRatio < 0.7) {
                demandClass = 'low';
                demandText = 'Low Demand';
            }
        }
        
        // Check if item is special
        const isSpecial = marketData.special || false;
        
        const itemElement = document.createElement('div');
        itemElement.className = `market-item ${item.rarity.name.toLowerCase()} ${isSpecial ? 'special' : ''} ${TradingSystem.selectedTradeItems.has(itemId) ? 'selected' : ''}`;
        itemElement.dataset.itemId = itemId;
        
        itemElement.innerHTML = `
            ${trend !== 'stable' ? `<div class="item-trend ${trendClass}">${trendIcon}</div>` : ''}
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${marketData.price} gold</div>
            <div class="item-stock">Stock: ${marketData.stock}</div>
            <div class="item-weight">${item.weight} lbs</div>
            ${demandText ? `<div class="item-demand ${demandClass}">${demandText}</div>` : ''}
            <button class="buy-item-btn" onclick="buyItem('${itemId}')">Buy</button>
        `;
        
        // Add event listeners for bulk selection
        if (TradingSystem.tradeMode === 'bulk') {
            itemElement.addEventListener('click', (e) => {
                if (e.shiftKey || e.ctrlKey || e.altKey) return;
                
                if (TradingSystem.selectedTradeItems.has(itemId)) {
                    TradingSystem.selectedTradeItems.delete(itemId);
                    itemElement.classList.remove('selected');
                } else {
                    TradingSystem.selectedTradeItems.set(itemId, 1);
                    itemElement.classList.add('selected');
                }
                
                TradingSystem.updateTradeSummary();
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                TradingSystem.updateTradePreview(itemId, 1);
            });
        }
        
        buyItemsContainer.appendChild(itemElement);
    }
}

// Update price comparison display
function updatePriceComparison() {
    const compareSelect = document.getElementById('compare-item-select');
    const priceComparison = document.getElementById('price-comparison');
    
    if (!compareSelect || !priceComparison) return;
    
    const selectedItemId = compareSelect.value;
    if (!selectedItemId) {
        priceComparison.innerHTML = '<p>Please select an item to compare prices.</p>';
        return;
    }
    
    const comparisons = MarketPriceHistory.comparePrices(selectedItemId);
    
    if (comparisons.length === 0) {
        priceComparison.innerHTML = '<p>No price data available for this item.</p>';
        return;
    }
    
    const bestPrice = comparisons[0];
    
    priceComparison.innerHTML = comparisons.map(comp => {
        const isBestPrice = comp.cityId === bestPrice.cityId;
        const trendClass = comp.trend === 'rising' ? 'price-rise' :
                         comp.trend === 'falling' ? 'price-fall' : '';
        const trendIcon = comp.trend === 'rising' ? '📈' :
                        comp.trend === 'falling' ? '📉' : '➡️';
        
        return `
            <div class="price-comparison-item ${isBestPrice ? 'best-price' : ''}">
                <div>
                    <div class="price-comparison-city">${comp.cityName}</div>
                    <div class="price-comparison-stock">Stock: ${comp.stock}</div>
                </div>
                <div>
                    <div class="price-comparison-price">${comp.currentPrice} gold</div>
                    <div class="price-comparison-trend ${trendClass}">${trendIcon} ${comp.trend}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Refresh market
function refreshMarket() {
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation) return;
    
    // Restock some items
    Object.keys(currentLocation.marketPrices).forEach(itemId => {
        const marketData = currentLocation.marketPrices[itemId];
        const restockAmount = Math.floor(Math.random() * 3) + 1;
        marketData.stock = Math.min(marketData.stock + restockAmount, 50);
    });
    
    // Check for city events
    CityEventSystem.checkRandomEvents(currentLocation.id);
    
    // Update displays
    updateMarketDisplay();
    updateMarketEvents();
    updateMarketNews();
    
    addMessage('Market refreshed with new goods!');
}

// Buy item from market (enhanced for new trading system)
function buyItem(itemId, quantity = 1) {
    const item = ItemDatabase.getItem(itemId);
    if (!item) return;
    
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation || !currentLocation.marketPrices) return;
    
    const marketData = currentLocation.marketPrices[itemId];
    if (!marketData || marketData.stock <= 0) {
        addMessage(`${item.name} is out of stock!`);
        return;
    }
    
    // Check if buying in bulk
    const actualQuantity = TradingSystem.tradeMode === 'bulk' ?
        TradingSystem.selectedTradeItems.get(itemId) || quantity : quantity;
    
    const totalPrice = marketData.price * actualQuantity;
    
    if (game.player.gold < totalPrice) {
        addMessage(`You need ${totalPrice} gold to buy ${actualQuantity} × ${item.name}!`);
        return;
    }
    
    // Check weight capacity
    const currentWeight = calculateCurrentLoad();
    const newWeight = currentWeight + (item.weight * actualQuantity);
    const transport = transportationOptions[game.player.transportation];
    
    if (newWeight > transport.carryCapacity) {
        addMessage(`You don't have enough carrying capacity! Need ${newWeight - transport.carryCapacity} lbs more capacity.`);
        return;
    }
    
    // Complete purchase
    game.player.gold -= totalPrice;
    marketData.stock = Math.max(0, marketData.stock - actualQuantity);
    
    // Update supply and demand
    DynamicMarketSystem.updateSupplyDemand(currentLocation.id, itemId, actualQuantity);
    
    // Apply market saturation
    DynamicMarketSystem.applyMarketSaturation(currentLocation.id, itemId);
    
    // Add to inventory
    if (!game.player.inventory[itemId]) {
        game.player.inventory[itemId] = 0;
    }
    game.player.inventory[itemId] += actualQuantity;
    
    // Record trade if in bulk mode
    if (TradingSystem.tradeMode === 'bulk') {
        const tradeItems = new Map();
        tradeItems.set(itemId, actualQuantity);
        TradingSystem.recordTrade('buy', tradeItems);
    }
    
    // Small reputation gain for trading
    CityReputationSystem.changeReputation(currentLocation.id, 0.1 * actualQuantity);
    
    addMessage(`Bought ${actualQuantity} × ${item.name} for ${totalPrice} gold!`);
    
    updatePlayerInfo();
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.updateInventoryDisplay();
    } else {
        updateInventoryDisplay();
    }
    updateMarketDisplay();
    updateCurrentLoad();
    
    // Check price alerts
    TradingSystem.checkPriceAlerts();
}

// Sell item to market (enhanced for new trading system)
function sellItem(itemId, quantity = 1) {
    const item = ItemDatabase.getItem(itemId);
    if (!item) return;
    
    const availableQuantity = game.player.inventory[itemId] || 0;
    if (availableQuantity <= 0) {
        addMessage(`You don't have any ${item.name} to sell!`);
        return;
    }
    
    // Check if selling in bulk mode
    const actualQuantity = TradingSystem.tradeMode === 'bulk' ?
        TradingSystem.selectedTradeItems.get(itemId) || quantity : quantity;
    
    if (actualQuantity > availableQuantity) {
        addMessage(`You only have ${availableQuantity} × ${item.name} to sell!`);
        return;
    }
    
    const currentLocation = GameWorld.locations[game.currentLocation.id];
    if (!currentLocation) return;
    
    // Calculate sell price with reputation modifier
    const reputationModifier = CityReputationSystem.getPriceModifier(currentLocation.id);
    const baseSellPrice = Math.round(ItemDatabase.calculatePrice(itemId) * 0.7);
    const sellPrice = Math.round(baseSellPrice * reputationModifier);
    const totalSellPrice = sellPrice * actualQuantity;
    
    // Remove from inventory
    game.player.inventory[itemId] -= actualQuantity;
    if (game.player.inventory[itemId] <= 0) {
        delete game.player.inventory[itemId];
    }
    
    // Add gold
    game.player.gold += totalSellPrice;
    
    // Add to market stock
    if (!currentLocation.marketPrices[itemId]) {
        currentLocation.marketPrices[itemId] = {
            price: ItemDatabase.calculatePrice(itemId),
            stock: 0
        };
    }
    currentLocation.marketPrices[itemId].stock += actualQuantity;
    
    // Update supply and demand
    DynamicMarketSystem.updateSupplyDemand(currentLocation.id, itemId, -actualQuantity);
    
    // Apply market saturation
    DynamicMarketSystem.applyMarketSaturation(currentLocation.id, itemId);
    
    // Record trade if in bulk mode
    if (TradingSystem.tradeMode === 'bulk') {
        const tradeItems = new Map();
        tradeItems.set(itemId, actualQuantity);
        TradingSystem.recordTrade('sell', tradeItems);
    }
    
    // Small reputation gain for trading
    CityReputationSystem.changeReputation(currentLocation.id, 0.1 * actualQuantity);
    
    addMessage(`Sold ${actualQuantity} × ${item.name} for ${totalSellPrice} gold!`);
    
    updatePlayerInfo();
    if (typeof InventorySystem !== 'undefined') {
        InventorySystem.updateInventoryDisplay();
    } else {
        updateInventoryDisplay();
    }
    updateMarketDisplay();
    updateCurrentLoad();
    
    // Check price alerts
    TradingSystem.checkPriceAlerts();
}

// Game Loop (legacy function - now handled by game object)
function startGameLoop() {
    // Start the game engine
    game.start();
}

// Render game world (now part of game object)
function renderGameWorld() {
    // Delegate to game object's render method
    if (game && typeof game.renderGameWorld === 'function') {
        game.renderGameWorld();
    }
}

// Utility Functions
function addMessage(text, type = 'info') {
    const messageElement = document.createElement('p');
    messageElement.className = 'message';
    messageElement.textContent = text;
    
    elements.messages.appendChild(messageElement);
    
    // Auto-scroll to bottom
    elements.messages.scrollTop = elements.messages.scrollHeight;
    
    // Limit message history
    while (elements.messages.children.length > 50) {
        elements.messages.removeChild(elements.messages.firstChild);
    }
}

function handleKeyPress(event) {
    // Keyboard shortcuts
    switch (event.key) {
        case 'Escape':
            if (game.state === GameState.PLAYING) {
                toggleMenu();
            } else if (game.state !== GameState.MENU) {
                changeState(GameState.PLAYING);
            }
            break;
        case 'i':
        case 'I':
            if (game.state === GameState.PLAYING) {
                openInventory();
            }
            break;
        case 'm':
        case 'M':
            if (game.state === GameState.PLAYING) {
                openMarket();
            }
            break;
        case 't':
        case 'T':
            if (game.state === GameState.PLAYING) {
                openTransportation();
            }
            break;
        case 's':
        case 'S':
            if (game.state === GameState.PLAYING) {
                saveGame();
            }
            break;
    }
}

function toggleMenu() {
    // Menu toggle logic will be implemented here
    addMessage('Menu toggled');
}

// Save/Load Functions
function saveGame() {
    try {
        const saveData = game.saveState();
        localStorage.setItem('tradingGameSave', JSON.stringify(saveData));
        addMessage('Game saved successfully!');
    } catch (error) {
        console.error('Save failed:', error);
        addMessage('Failed to save game!');
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem('tradingGameSave');
        if (saveData) {
            const parsedData = JSON.parse(saveData);
            game.loadState(parsedData);
            updatePlayerInfo();
            updateLocationInfo();
            addMessage('Game loaded successfully!');
        } else {
            addMessage('No saved game found!');
        }
    } catch (error) {
        console.error('Load failed:', error);
        addMessage('Failed to load game!');
    }
}

function showSettings() {
    // Show high scores instead of settings for now
    HighScoreSystem.showHighScores();
}

// Transportation System Implementation Notes:
// - Each transportation option has realistic carry weights in pounds
// - Speed modifiers affect travel time between locations
// - Some transportation requires animals (wagons need horses, donkeys, or oxen)
// - Players can own multiple transportation options and switch between them
// - Current load is calculated based on item weights in inventory

// Future Game Systems (to be implemented)

/*
ITEM SYSTEM:
- Item definitions and properties with weight values
- Item categories (goods, resources, luxury items)
- Item pricing and value fluctuations
- Item quality and condition
- Weight calculations for inventory management

ECONOMY SYSTEM:
- Supply and demand mechanics
- Price fluctuations based on location and events
- Market events and news
- Trade routes and profitability

LOCATION SYSTEM:
- Multiple locations with unique characteristics
- Location-specific goods and prices
- Distance and travel time calculations
- Location reputation and relationships

NPC SYSTEM:
- Merchants with different personalities and prices
- Random encounters and events
- Quests and special trading opportunities
- Dialogue system

SKILL SYSTEM:
- Trading skill affecting prices and profits
- Negotiation mini-games
- Perception for finding good deals
- Reputation system

EVENT SYSTEM:
- Random market events
- Weather affecting trade routes
- Political changes affecting prices
- Seasonal variations

SAVE/LOAD SYSTEM:
- Local storage for game saves
- Multiple save slots
- Auto-save functionality
- Export/import save files

SOUND SYSTEM:
- Background music
- Sound effects for actions
- Ambient sounds for locations
- Volume controls

ACHIEVEMENT SYSTEM:
- Trading milestones
- Wealth achievements
- Discovery achievements
- Special challenges
*/

// Medieval Item Database System
const ItemDatabase = {
    // Medieval Item categories
    categories: {
        BASIC_RESOURCES: 'basic_resources',
        PROCESSED_MATERIALS: 'processed_materials',
        RAW_ORES: 'raw_ores',
        FINISHED_GOODS: 'finished_goods',
        CONSUMABLES: 'consumables',
        RARE_EXOTIC: 'rare_exotic',
        TOOLS: 'tools',
        WEAPONS: 'weapons',
        LUXURY: 'luxury',
        BUILDING_MATERIALS: 'building_materials',
        AGRICULTURAL: 'agricultural'
    },

    // Rarity levels
    rarity: {
        COMMON: { name: 'Common', color: '#ffffff', priceMultiplier: 1.0 },
        UNCOMMON: { name: 'Uncommon', color: '#4fc3f7', priceMultiplier: 1.5 },
        RARE: { name: 'Rare', color: '#9c27b0', priceMultiplier: 2.5 },
        EPIC: { name: 'Epic', color: '#ff9800', priceMultiplier: 4.0 },
        LEGENDARY: { name: 'Legendary', color: '#ffd700', priceMultiplier: 8.0 }
    },

    // Item definitions
    items: {},

    // Initialize item database
    init() {
        this.createItems();
        this.setupItemRelationships();
    },

    // Create all items
    createItems() {
        // Medieval Basic Resources
        this.addItem('food', {
            name: 'Food Rations',
            description: 'Basic sustenance for medieval travelers.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 5,
            weight: 0.5,
            stackSize: 50,
            icon: '🍞',
            consumable: true,
            effects: { hunger: -10 }
        });

        this.addItem('water', {
            name: 'Water Flask',
            description: 'Clean drinking water in a leather flask.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 2,
            weight: 1.0,
            stackSize: 20,
            icon: '💧',
            consumable: true,
            effects: { thirst: -15 }
        });

        this.addItem('logs', {
            name: 'Timber',
            description: 'Raw timber from medieval forests.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 5.0,
            stackSize: 10,
            icon: '🪵'
        });

        this.addItem('stone', {
            name: 'Stone',
            description: 'Raw stone for castle construction.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 6,
            weight: 8.0,
            stackSize: 8,
            icon: '🪨'
        });

        this.addItem('herbs', {
            name: 'Medicinal Herbs',
            description: 'Herbs gathered by medieval apothecaries.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 12,
            weight: 0.2,
            stackSize: 30,
            icon: '🌿',
            consumable: true,
            effects: { health: 5 }
        });

        // Medieval Processed Materials
        this.addItem('planks', {
            name: 'Wooden Planks',
            description: 'Processed wooden planks for building.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.COMMON,
            basePrice: 15,
            weight: 3.0,
            stackSize: 20,
            icon: '📦',
            craftedFrom: { logs: 2 }
        });

        this.addItem('bricks', {
            name: 'Stone Bricks',
            description: 'Finely cut stone blocks for castle walls.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 20,
            weight: 6.0,
            stackSize: 10,
            icon: '🧱',
            craftedFrom: { stone: 2 }
        });

        this.addItem('bronze_ingot', {
            name: 'Bronze Ingot',
            description: 'Refined bronze metal for medieval crafts.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 35,
            weight: 2.0,
            stackSize: 15,
            icon: '🔩',
            craftedFrom: { copper_ore: 2, tin: 1 }
        });

        this.addItem('iron_bar', {
            name: 'Iron Bar',
            description: 'Refined iron for weapons and armor.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 45,
            weight: 2.5,
            stackSize: 12,
            icon: '⚙️',
            craftedFrom: { iron_ore: 3 }
        });

        this.addItem('steel_bar', {
            name: 'Steel Bar',
            description: 'High-quality steel for masterwork weapons.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.RARE,
            basePrice: 80,
            weight: 2.0,
            stackSize: 10,
            icon: '🔧',
            craftedFrom: { iron_bar: 2, coal: 1 }
        });

        // Medieval Raw Ores
        this.addItem('iron_ore', {
            name: 'Iron Ore',
            description: 'Raw iron-bearing rock from medieval mines.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.COMMON,
            basePrice: 15,
            weight: 4.0,
            stackSize: 15,
            icon: '⛏️'
        });

        this.addItem('copper_ore', {
            name: 'Copper Ore',
            description: 'Raw copper-bearing rock from mountain mines.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.COMMON,
            basePrice: 12,
            weight: 3.5,
            stackSize: 15,
            icon: '🔶'
        });

        this.addItem('tin', {
            name: 'Tin Ore',
            description: 'Raw tin metal for bronze making.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 18,
            weight: 3.0,
            stackSize: 12,
            icon: '🥫'
        });

        this.addItem('gold_ore', {
            name: 'Gold Ore',
            description: 'Gold-bearing rock from royal mines.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.RARE,
            basePrice: 120,
            weight: 3.0,
            stackSize: 8,
            icon: '🪙'
        });

        this.addItem('gold_bar', {
            name: 'Gold Ingot',
            description: 'Refined gold bullion for royal treasury.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.RARE,
            basePrice: 200,
            weight: 1.5,
            stackSize: 6,
            icon: '🏆',
            craftedFrom: { gold_ore: 3 }
        });

        this.addItem('silver_ore', {
            name: 'Silver Ore',
            description: 'Silver-bearing rock from ancient mines.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 60,
            weight: 2.8,
            stackSize: 10,
            icon: '🥈'
        });

        this.addItem('coal', {
            name: 'Coal',
            description: 'Black coal for medieval forges.',
            category: this.categories.RAW_ORES,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 3.0,
            stackSize: 20,
            icon: '⚫'
        });

        // Food Items
        this.addItem('bread', {
            name: 'Bread',
            description: 'Freshly baked bread.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 4,
            weight: 0.3,
            stackSize: 40,
            icon: '🍞',
            consumable: true,
            effects: { hunger: -15, health: 2 }
        });

        this.addItem('meat', {
            name: 'Meat',
            description: 'Fresh meat from livestock.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 0.8,
            stackSize: 25,
            icon: '🥩',
            consumable: true,
            effects: { hunger: -20, health: 5 }
        });

        this.addItem('fish', {
            name: 'Fish',
            description: 'Freshly caught fish.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 6,
            weight: 0.6,
            stackSize: 30,
            icon: '🐟',
            consumable: true,
            effects: { hunger: -12, health: 3 }
        });

        this.addItem('vegetables', {
            name: 'Vegetables',
            description: 'Assorted fresh vegetables.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 5,
            weight: 0.4,
            stackSize: 35,
            icon: '🥬',
            consumable: true,
            effects: { hunger: -8, health: 4 }
        });

        this.addItem('fruits', {
            name: 'Fruits',
            description: 'Fresh seasonal fruits.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 7,
            weight: 0.3,
            stackSize: 40,
            icon: '🍎',
            consumable: true,
            effects: { hunger: -6, health: 3 }
        });

        this.addItem('cheese', {
            name: 'Cheese',
            description: 'Aged cheese from dairy farms.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 12,
            weight: 0.5,
            stackSize: 20,
            icon: '🧀',
            consumable: true,
            effects: { hunger: -10, health: 6 }
        });

        // Beverages
        this.addItem('clean_water', {
            name: 'Clean Water',
            description: 'Purified drinking water.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 3,
            weight: 1.0,
            stackSize: 20,
            icon: '💧',
            consumable: true,
            effects: { thirst: -20 }
        });

        this.addItem('ale', {
            name: 'Ale',
            description: 'Traditional brewed ale.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 10,
            weight: 1.2,
            stackSize: 15,
            icon: '🍺',
            consumable: true,
            effects: { thirst: -15, happiness: 10 }
        });

        this.addItem('wine', {
            name: 'Wine',
            description: 'Fine fermented wine.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.RARE,
            basePrice: 25,
            weight: 1.0,
            stackSize: 12,
            icon: '🍷',
            consumable: true,
            effects: { thirst: -10, happiness: 20 }
        });

        // Tools
        this.addItem('hammer', {
            name: 'Hammer',
            description: 'Basic hammer for construction.',
            category: this.categories.TOOLS,
            rarity: this.rarity.COMMON,
            basePrice: 12,
            weight: 2.0,
            stackSize: 1,
            icon: '🔨',
            durability: 80,
            toolType: 'construction'
        });

        this.addItem('axe', {
            name: 'Axe',
            description: 'Wood-cutting axe.',
            category: this.categories.TOOLS,
            rarity: this.rarity.COMMON,
            basePrice: 15,
            weight: 3.0,
            stackSize: 1,
            icon: '🪓',
            durability: 100,
            toolType: 'woodcutting'
        });

        this.addItem('pickaxe', {
            name: 'Pickaxe',
            description: 'Mining pickaxe.',
            category: this.categories.TOOLS,
            rarity: this.rarity.COMMON,
            basePrice: 20,
            weight: 4.0,
            stackSize: 1,
            icon: '⛏️',
            durability: 120,
            toolType: 'mining'
        });

        this.addItem('fishing_rod', {
            name: 'Fishing Rod',
            description: 'Basic fishing equipment.',
            category: this.categories.TOOLS,
            rarity: this.rarity.COMMON,
            basePrice: 18,
            weight: 1.5,
            stackSize: 1,
            icon: '🎣',
            durability: 60,
            toolType: 'fishing'
        });

        this.addItem('saw', {
            name: 'Saw',
            description: 'Hand saw for woodworking.',
            category: this.categories.TOOLS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 25,
            weight: 2.5,
            stackSize: 1,
            icon: '🪚',
            durability: 90,
            toolType: 'woodworking'
        });

        // Weapons
        this.addItem('sword', {
            name: 'Sword',
            description: 'Basic iron sword.',
            category: this.categories.WEAPONS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 80,
            weight: 3.5,
            stackSize: 1,
            icon: '⚔️',
            damage: 15,
            craftedFrom: { iron_bar: 2, wood: 1 }
        });

        this.addItem('spear', {
            name: 'Spear',
            description: 'Simple wooden spear.',
            category: this.categories.WEAPONS,
            rarity: this.rarity.COMMON,
            basePrice: 25,
            weight: 2.0,
            stackSize: 1,
            icon: '🔱',
            damage: 8,
            craftedFrom: { wood: 2, stone: 1 }
        });

        this.addItem('bow', {
            name: 'Bow',
            description: 'Hunting bow.',
            category: this.categories.WEAPONS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 45,
            weight: 1.5,
            stackSize: 1,
            icon: '🏹',
            damage: 12,
            craftedFrom: { wood: 2 }
        });

        this.addItem('arrows', {
            name: 'Arrows',
            description: 'Bundle of arrows.',
            category: this.categories.WEAPONS,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 0.5,
            stackSize: 20,
            icon: '🏹',
            ammunition: true,
            craftedFrom: { wood: 1, feathers: 1 }
        });

        // Luxury Items
        this.addItem('jewelry', {
            name: 'Jewelry',
            description: 'Ornate gold jewelry.',
            category: this.categories.LUXURY,
            rarity: this.rarity.RARE,
            basePrice: 150,
            weight: 0.2,
            stackSize: 5,
            icon: '💍',
            craftedFrom: { gold_bar: 1, gems: 1 }
        });

        this.addItem('spices', {
            name: 'Spices',
            description: 'Exotic eastern spices.',
            category: this.categories.LUXURY,
            rarity: this.rarity.RARE,
            basePrice: 40,
            weight: 0.3,
            stackSize: 15,
            icon: '🌶️'
        });

        this.addItem('silk', {
            name: 'Silk',
            description: 'Fine silk fabric.',
            category: this.categories.LUXURY,
            rarity: this.rarity.RARE,
            basePrice: 80,
            weight: 0.5,
            stackSize: 10,
            icon: '🧵'
        });

        this.addItem('furs', {
            name: 'Furs',
            description: 'Quality animal furs.',
            category: this.categories.LUXURY,
            rarity: this.rarity.UNCOMMON,
            basePrice: 35,
            weight: 1.0,
            stackSize: 12,
            icon: '🦊'
        });

        this.addItem('gems', {
            name: 'Gems',
            description: 'Precious gemstones.',
            category: this.categories.LUXURY,
            rarity: this.rarity.EPIC,
            basePrice: 300,
            weight: 0.1,
            stackSize: 8,
            icon: '💎'
        });

        // Building Materials
        this.addItem('bricks', {
            name: 'Bricks',
            description: 'Fired clay bricks.',
            category: this.categories.BUILDING_MATERIALS,
            rarity: this.rarity.COMMON,
            basePrice: 10,
            weight: 4.0,
            stackSize: 15,
            icon: '🧱',
            craftedFrom: { clay: 2 }
        });

        this.addItem('mortar', {
            name: 'Mortar',
            description: 'Building mortar mix.',
            category: this.categories.BUILDING_MATERIALS,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 3.0,
            stackSize: 20,
            icon: '🪣',
            craftedFrom: { sand: 2, water: 1 }
        });

        this.addItem('nails', {
            name: 'Nails',
            description: 'Iron nails for construction.',
            category: this.categories.BUILDING_MATERIALS,
            rarity: this.rarity.COMMON,
            basePrice: 5,
            weight: 0.5,
            stackSize: 50,
            icon: '🔩',
            craftedFrom: { iron_bar: 1 }
        });

        // Agricultural
        this.addItem('seeds', {
            name: 'Seeds',
            description: 'Various crop seeds.',
            category: this.categories.AGRICULTURAL,
            rarity: this.rarity.COMMON,
            basePrice: 3,
            weight: 0.1,
            stackSize: 100,
            icon: '🌱'
        });

        this.addItem('grain', {
            name: 'Grain',
            description: 'Harvested grain crops.',
            category: this.categories.AGRICULTURAL,
            rarity: this.rarity.COMMON,
            basePrice: 6,
            weight: 0.8,
            stackSize: 40,
            icon: '🌾'
        });

        this.addItem('wool', {
            name: 'Wool',
            description: 'Raw sheep wool.',
            category: this.categories.AGRICULTURAL,
            rarity: this.rarity.COMMON,
            basePrice: 12,
            weight: 0.6,
            stackSize: 25,
            icon: '🐑'
        });

        this.addItem('cotton', {
            name: 'Cotton',
            description: 'Raw cotton fibers.',
            category: this.categories.AGRICULTURAL,
            rarity: this.rarity.COMMON,
            basePrice: 10,
            weight: 0.4,
            stackSize: 30,
            icon: '☁️'
        });

        // Rare/Exotic Items
        this.addItem('dragon_scale', {
            name: 'Dragon Scale',
            description: 'Rare dragon scale.',
            category: this.categories.RARE_EXOTIC,
            rarity: this.rarity.LEGENDARY,
            basePrice: 1000,
            weight: 0.5,
            stackSize: 1,
            icon: '🐉'
        });

        this.addItem('phoenix_feather', {
            name: 'Phoenix Feather',
            description: 'Magical phoenix feather.',
            category: this.categories.RARE_EXOTIC,
            rarity: this.rarity.LEGENDARY,
            basePrice: 800,
            weight: 0.1,
            stackSize: 1,
            icon: '🪶'
        });

        this.addItem('unicorn_horn', {
            name: 'Unicorn Horn',
            description: 'Rare unicorn horn.',
            category: this.categories.RARE_EXOTIC,
            rarity: this.rarity.LEGENDARY,
            basePrice: 1200,
            weight: 1.0,
            stackSize: 1,
            icon: '🦄'
        });

        this.addItem('ancient_relic', {
            name: 'Ancient Relic',
            description: 'Mysterious ancient artifact.',
            category: this.categories.RARE_EXOTIC,
            rarity: this.rarity.EPIC,
            basePrice: 500,
            weight: 2.0,
            stackSize: 1,
            icon: '🏺'
        });

        // Additional Materials
        this.addItem('clay', {
            name: 'Clay',
            description: 'Raw clay for pottery.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 4,
            weight: 2.0,
            stackSize: 20,
            icon: '🏺'
        });

        this.addItem('sand', {
            name: 'Sand',
            description: 'Fine sand for glassmaking.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 3,
            weight: 2.5,
            stackSize: 25,
            icon: '🏖️'
        });

        this.addItem('feathers', {
            name: 'Feathers',
            description: 'Bird feathers for crafting.',
            category: this.categories.BASIC_RESOURCES,
            rarity: this.rarity.COMMON,
            basePrice: 6,
            weight: 0.1,
            stackSize: 40,
            icon: '🪶'
        });

        this.addItem('leather', {
            name: 'Leather',
            description: 'Tanned animal hides.',
            category: this.categories.PROCESSED_MATERIALS,
            rarity: this.rarity.UNCOMMON,
            basePrice: 20,
            weight: 1.5,
            stackSize: 15,
            icon: '👞',
            craftedFrom: { furs: 2 }
        });

        // Potions and Consumables
        this.addItem('health_potion', {
            name: 'Health Potion',
            description: 'Restores health when consumed.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 30,
            weight: 0.3,
            stackSize: 10,
            icon: '🧪',
            consumable: true,
            effects: { health: 50 },
            craftedFrom: { herbs: 3, water: 1 }
        });

        this.addItem('strength_potion', {
            name: 'Strength Potion',
            description: 'Temporarily increases strength.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.RARE,
            basePrice: 50,
            weight: 0.3,
            stackSize: 8,
            icon: '💪',
            consumable: true,
            effects: { strength: 5, duration: 300 },
            craftedFrom: { herbs: 5, iron_ore: 1 }
        });

        this.addItem('luck_charm', {
            name: 'Luck Charm',
            description: 'Increases luck for a short time.',
            category: this.categories.RARE_EXOTIC,
            rarity: this.rarity.RARE,
            basePrice: 75,
            weight: 0.1,
            stackSize: 5,
            icon: '🍀',
            consumable: true,
            effects: { luck: 3, duration: 600 },
            craftedFrom: { gems: 1, herbs: 2 }
        });

        // Additional Food and Drink Items
        this.addItem('milk', {
            name: 'Milk',
            description: 'Fresh milk from dairy farms.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 3,
            weight: 1.0,
            stackSize: 15,
            icon: '🥛',
            consumable: true,
            effects: { thirst: -10, hunger: -5, health: 2 }
        });

        this.addItem('stew', {
            name: 'Stew',
            description: 'Hearty vegetable and meat stew.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 12,
            weight: 1.2,
            stackSize: 10,
            icon: '🍲',
            consumable: true,
            effects: { hunger: -25, thirst: -8, health: 8 }
        });

        this.addItem('meal', {
            name: 'Complete Meal',
            description: 'A full meal with bread, meat, and vegetables.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 15,
            weight: 1.5,
            stackSize: 8,
            icon: '🍽',
            consumable: true,
            effects: { hunger: -30, thirst: -5, health: 10, happiness: 5 }
        });

        this.addItem('carrots', {
            name: 'Carrots',
            description: 'Fresh crunchy carrots.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 2,
            weight: 0.2,
            stackSize: 30,
            icon: '🥕',
            consumable: true,
            effects: { hunger: -6, health: 1 }
        });

        this.addItem('grog', {
            name: 'Grog',
            description: 'Strong alcoholic beverage favored by sailors.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 8,
            weight: 1.0,
            stackSize: 12,
            icon: '🍺',
            consumable: true,
            effects: { thirst: -15, happiness: 15, stamina: 10, health: -3 }
        });

        this.addItem('soup', {
            name: 'Soup',
            description: 'Warm vegetable soup.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 6,
            weight: 1.0,
            stackSize: 12,
            icon: '🍜',
            consumable: true,
            effects: { hunger: -15, thirst: -12, health: 5 }
        });

        this.addItem('jerky', {
            name: 'Jerky',
            description: 'Dried meat that lasts long.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 10,
            weight: 0.3,
            stackSize: 20,
            icon: '🥓',
            consumable: true,
            effects: { hunger: -18, thirst: -2 }
        });

        this.addItem('dried_fruit', {
            name: 'Dried Fruit',
            description: 'Preserved sweet fruits.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 8,
            weight: 0.2,
            stackSize: 25,
            icon: '🍇',
            consumable: true,
            effects: { hunger: -8, thirst: -3, happiness: 5 }
        });

        this.addItem('water_flask', {
            name: 'Water Flask',
            description: 'Portable water container.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 5,
            weight: 0.5,
            stackSize: 10,
            icon: '🍶',
            consumable: true,
            effects: { thirst: -20 }
        });

        this.addItem('coffee', {
            name: 'Coffee',
            description: 'Strong brewed coffee.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.UNCOMMON,
            basePrice: 7,
            weight: 0.3,
            stackSize: 15,
            icon: '☕',
            consumable: true,
            effects: { thirst: -5, stamina: 20, happiness: 5 }
        });

        this.addItem('tea', {
            name: 'Tea',
            description: 'Herbal tea with medicinal properties.',
            category: this.categories.CONSUMABLES,
            rarity: this.rarity.COMMON,
            basePrice: 4,
            weight: 0.2,
            stackSize: 20,
            icon: '🍵',
            consumable: true,
            effects: { thirst: -12, health: 3, happiness: 3 }
        });
    },

    // Add item to database
    addItem(id, itemData) {
        this.items[id] = {
            id: id,
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            rarity: itemData.rarity,
            basePrice: itemData.basePrice,
            weight: itemData.weight || 1.0,
            stackSize: itemData.stackSize || 1,
            icon: itemData.icon || '📦',
            consumable: itemData.consumable || false,
            effects: itemData.effects || {},
            craftedFrom: itemData.craftedFrom || {},
            durability: itemData.durability || null,
            toolType: itemData.toolType || null,
            damage: itemData.damage || null,
            ammunition: itemData.ammunition || false
        };
    },

    // Setup item relationships and crafting
    setupItemRelationships() {
        // This will be expanded for complex crafting systems
        this.craftingRecipes = {};
        
        // Create reverse lookup for crafted items
        Object.keys(this.items).forEach(itemId => {
            const item = this.items[itemId];
            if (Object.keys(item.craftedFrom).length > 0) {
                this.craftingRecipes[itemId] = item.craftedFrom;
            }
        });
    },

    // Get item by ID
    getItem(itemId) {
        return this.items[itemId] || null;
    },

    // Get items by category
    getItemsByCategory(category) {
        return Object.values(this.items).filter(item => item.category === category);
    },

    // Get items by rarity
    getItemsByRarity(rarity) {
        return Object.values(this.items).filter(item => item.rarity === rarity);
    },

    // Get all items
    getAllItems() {
        return Object.values(this.items);
    },

    // Calculate item price with modifiers
    calculatePrice(itemId, modifiers = {}) {
        const item = this.getItem(itemId);
        if (!item) return 0;

        let price = item.basePrice;

        // Apply rarity multiplier
        price *= item.rarity.priceMultiplier;

        // Apply custom modifiers
        if (modifiers.locationMultiplier) {
            price *= modifiers.locationMultiplier;
        }
        if (modifiers.demandMultiplier) {
            price *= modifiers.demandMultiplier;
        }
        if (modifiers.eventMultiplier) {
            price *= modifiers.eventMultiplier;
        }

        return Math.round(price);
    },

    // Calculate total weight of item stack
    calculateWeight(itemId, quantity) {
        const item = this.getItem(itemId);
        if (!item) return 0;
        return item.weight * quantity;
    },

    // Check if item can be crafted from available materials
    canCraft(itemId, inventory) {
        const recipe = this.craftingRecipes[itemId];
        if (!recipe) return false;

        for (const [materialId, requiredAmount] of Object.entries(recipe)) {
            const availableAmount = inventory[materialId] || 0;
            if (availableAmount < requiredAmount) {
                return false;
            }
        }
        return true;
    },

    // Get crafting requirements for item
    getCraftingRequirements(itemId) {
        return this.craftingRecipes[itemId] || {};
    },

    // Get items that can be crafted from given materials
    getCraftableItems(inventory) {
        return Object.keys(this.craftingRecipes).filter(itemId =>
            this.canCraft(itemId, inventory)
        );
    },

    // Format item name for display
    formatItemName(itemId) {
        const item = ItemDatabase.getItem(itemId);
        return item ? item.name : itemId;
    },

    // Get item display data
    getItemDisplay(itemId, quantity = 1, price = null) {
        const item = this.getItem(itemId);
        if (!item) return null;

        return {
            id: itemId,
            name: item.name,
            description: item.description,
            icon: item.icon,
            quantity: quantity,
            weight: item.weight,
            totalWeight: this.calculateWeight(itemId, quantity),
            price: price || this.calculatePrice(itemId),
            rarity: item.rarity,
            category: item.category,
            stackSize: item.stackSize,
            consumable: item.consumable,
            effects: item.effects,
            craftedFrom: item.craftedFrom,
            toolType: item.toolType,
            damage: item.damage
        };
    }
};

// Initialize item database
ItemDatabase.init();

// City Reputation System
const CityReputationSystem = {
    // Initialize reputation for all cities
    init() {
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.reputation) {
                location.reputation = {
                    player: 0, // Player's reputation with this city
                    basePrice: 0, // Base price modifier
                    accessLevel: 0, // Access level for special goods
                    events: [], // City-specific events
                    lastVisit: 0
                };
            }
        });
    },
    
    // Get player reputation with a city
    getReputation(cityId) {
        const location = GameWorld.locations[cityId];
        return location ? location.reputation.player : 0;
    },
    
    // Change player reputation with a city
    changeReputation(cityId, amount) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.reputation) return false;
        
        location.reputation.player += amount;
        location.reputation.player = Math.max(-100, Math.min(100, location.reputation.player));
        
        // Update access level based on reputation
        this.updateAccessLevel(cityId);
        
        // Show reputation change message
        const action = amount > 0 ? 'increased' : 'decreased';
        const absAmount = Math.abs(amount);
        addMessage(`Reputation with ${location.name} ${action} by ${absAmount}!`);
        
        return true;
    },
    
    // Update access level based on reputation
    updateAccessLevel(cityId) {
        const location = GameWorld.locations[cityId];
        if (!location.reputation) return;
        
        const rep = location.reputation.player;
        let accessLevel = 0;
        
        if (rep >= 75) accessLevel = 3; // Elite - Best prices, rare goods
        else if (rep >= 50) accessLevel = 2; // Trusted - Better prices, special goods
        else if (rep >= 25) accessLevel = 1; // Friendly - Slightly better prices
        else if (rep >= 0) accessLevel = 0; // Neutral - Standard prices
        else if (rep >= -25) accessLevel = -1; // Suspicious - Higher prices
        else if (rep >= -50) accessLevel = -2; // Untrusted - Much higher prices
        else accessLevel = -3; // Hostile - Worst prices, limited access
        
        location.reputation.accessLevel = accessLevel;
        location.reputation.basePrice = 1 + (accessLevel * 0.1); // 10% price change per level
    },
    
    // Get price modifier based on reputation
    getPriceModifier(cityId) {
        const location = GameWorld.locations[cityId];
        return location && location.reputation ? location.reputation.basePrice : 1.0;
    },
    
    // Check if player can access special goods
    canAccessSpecialGoods(cityId, requiredLevel = 1) {
        const location = GameWorld.locations[cityId];
        return location && location.reputation && location.reputation.accessLevel >= requiredLevel;
    }
};

// City Events System
const CityEventSystem = {
    // City-specific event definitions
    cityEventTypes: {
        festival: {
            name: 'City Festival',
            description: 'The city is celebrating! Prices are favorable and special goods are available.',
            effects: { priceBonus: -0.15, specialGoods: true, reputationBonus: 1 },
            duration: 240, // 4 hours
            chance: 0.02
        },
        banditAttack: {
            name: 'Bandit Attack',
            description: 'Bandits are attacking trade routes! Prices are rising due to scarcity.',
            effects: { pricePenalty: 0.25, travelDanger: true },
            duration: 180, // 3 hours
            chance: 0.015
        },
        merchantGuild: {
            name: 'Merchant Guild Meeting',
            description: 'The merchant guild is meeting, creating trading opportunities.',
            effects: { priceBonus: -0.1, reputationBonus: 2, specialGoods: true },
            duration: 360, // 6 hours
            chance: 0.01
        },
        harvest: {
            name: 'Bountiful Harvest',
            description: 'The harvest is abundant! Food prices are dropping.',
            effects: { foodPriceBonus: -0.3, reputationBonus: 1 },
            duration: 300, // 5 hours
            chance: 0.025,
            seasonRequirement: 'autumn'
        },
        winterStorm: {
            name: 'Winter Storm',
            description: 'A harsh winter storm is affecting supplies.',
            effects: { pricePenalty: 0.2, travelPenalty: 0.3 },
            duration: 200, // 3+ hours
            chance: 0.02,
            seasonRequirement: 'winter'
        },
        drought: {
            name: 'Drought',
            description: 'A drought is affecting water and food supplies.',
            effects: { waterPricePenalty: 0.4, foodPricePenalty: 0.3 },
            duration: 400, // 6+ hours
            chance: 0.015,
            seasonRequirement: 'summer'
        },
        tradeExpedition: {
            name: 'Trade Expedition',
            description: 'A trade expedition has arrived with exotic goods.',
            effects: { newItems: true, specialGoods: true },
            duration: 180, // 3 hours
            chance: 0.03
        },
        politicalUnrest: {
            name: 'Political Unrest',
            description: 'Political tensions are affecting trade.',
            effects: { pricePenalty: 0.15, reputationPenalty: 1 },
            duration: 250, // 4+ hours
            chance: 0.01
        }
    },
    
    // Initialize city events
    init() {
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.reputation) {
                location.reputation = { events: [] };
            }
        });
    },
    
    // Check for random city events
    checkRandomEvents(cityId) {
        const location = GameWorld.locations[cityId];
        if (!location) return;
        
        // Check if city already has an active event
        if (location.reputation.events.length > 0) return;
        
        // Check for random events
        for (const [eventType, eventData] of Object.entries(this.cityEventTypes)) {
            if (Math.random() < eventData.chance) {
                // Check seasonal requirements
                if (eventData.seasonRequirement) {
                    const currentSeason = this.getCurrentSeason();
                    if (currentSeason !== eventData.seasonRequirement) continue;
                }
                
                this.triggerCityEvent(cityId, eventType);
                break;
            }
        }
    },
    
    // Trigger a city event
    triggerCityEvent(cityId, eventType) {
        const location = GameWorld.locations[cityId];
        const eventData = this.cityEventTypes[eventType];
        
        if (!location || !eventData) return;
        
        const event = {
            id: eventType,
            name: eventData.name,
            description: eventData.description,
            effects: { ...eventData.effects },
            startTime: TimeSystem.getTotalMinutes(),
            duration: eventData.duration || 120,
            active: true
        };
        
        location.reputation.events.push(event);
        this.applyCityEventEffects(cityId, event);
        
        addMessage(`📍 ${location.name}: ${event.name} - ${event.description}`);
    },
    
    // Apply city event effects
    applyCityEventEffects(cityId, event) {
        const location = GameWorld.locations[cityId];
        if (!location) return;
        
        // Apply reputation changes
        if (event.effects.reputationBonus) {
            CityReputationSystem.changeReputation(cityId, event.effects.reputationBonus);
        }
        
        if (event.effects.reputationPenalty) {
            CityReputationSystem.changeReputation(cityId, -event.effects.reputationPenalty);
        }
        
        // Apply price modifiers to market
        if (location.marketPrices) {
            Object.keys(location.marketPrices).forEach(itemId => {
                const item = ItemDatabase.getItem(itemId);
                if (!item) return;
                
                let priceModifier = 1.0;
                
                // General price effects
                if (event.effects.priceBonus) priceModifier *= (1 + event.effects.priceBonus);
                if (event.effects.pricePenalty) priceModifier *= (1 + event.effects.pricePenalty);
                
                // Category-specific effects
                if (event.effects.foodPriceBonus && item.category === ItemDatabase.categories.CONSUMABLES) {
                    priceModifier *= (1 + event.effects.foodPriceBonus);
                }
                if (event.effects.waterPricePenalty && itemId === 'water') {
                    priceModifier *= (1 + event.effects.waterPricePenalty);
                }
                
                // Apply the modifier
                location.marketPrices[itemId].eventModifier = priceModifier;
            });
        }
        
        // Add special goods if applicable
        if (event.effects.specialGoods || event.effects.newItems) {
            this.addSpecialGoods(cityId);
        }
    },
    
    // Add special goods to a city
    addSpecialGoods(cityId) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices) return;
        
        // Add rare items based on city type and reputation
        const specialItems = this.getSpecialItemsForCity(cityId);
        
        specialItems.forEach(itemId => {
            if (!location.marketPrices[itemId]) {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    location.marketPrices[itemId] = {
                        price: ItemDatabase.calculatePrice(itemId),
                        stock: Math.floor(Math.random() * 5) + 1,
                        special: true
                    };
                }
            }
        });
    },
    
    // Get special items available for a city
    getSpecialItemsForCity(cityId) {
        const location = GameWorld.locations[cityId];
        if (!location) return [];
        
        const specialItems = [];
        const accessLevel = location.reputation.accessLevel;
        
        // Define special items by city type and reputation
        const citySpecialItems = {
            village: ['herbs', 'seeds', 'wool', 'honey'],
            town: ['cheese', 'ale', 'tools', 'arrows'],
            city: ['jewelry', 'wine', 'silk', 'spices']
        };
        
        const reputationSpecialItems = {
            3: ['dragon_scale', 'phoenix_feather', 'unicorn_horn'], // Elite
            2: ['ancient_relic', 'gems', 'health_potion'], // Trusted
            1: ['luck_charm', 'strength_potion'] // Friendly
        };
        
        // Add city-specific items
        if (citySpecialItems[location.type]) {
            specialItems.push(...citySpecialItems[location.type]);
        }
        
        // Add reputation-based items
        if (reputationSpecialItems[accessLevel]) {
            specialItems.push(...reputationSpecialItems[accessLevel]);
        }
        
        return specialItems;
    },
    
    // Update city events (remove expired ones)
    updateEvents() {
        const currentTime = TimeSystem.getTotalMinutes();
        
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.reputation || !location.reputation.events) return;
            
            // Remove expired events
            location.reputation.events = location.reputation.events.filter(event => {
                if (currentTime >= event.startTime + event.duration) {
                    this.removeCityEventEffects(cityId, event);
                    return false;
                }
                return true;
            });
        });
    },
    
    // Remove city event effects
    removeCityEventEffects(cityId, event) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices) return;
        
        // Remove event modifiers from market prices
        Object.keys(location.marketPrices).forEach(itemId => {
            if (location.marketPrices[itemId].eventModifier) {
                delete location.marketPrices[itemId].eventModifier;
            }
        });
        
        addMessage(`📍 ${location.name}: ${event.name} has ended.`);
    },
    
    // Get current season based on game time
    getCurrentSeason() {
        const month = TimeSystem.currentTime.month;
        
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    },
    
    // Get active events for a city
    getCityEvents(cityId) {
        const location = GameWorld.locations[cityId];
        return location && location.reputation ? location.reputation.events : [];
    }
};

// Market Price History System
const MarketPriceHistory = {
    // Initialize price history for all cities
    init() {
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.priceHistory) {
                location.priceHistory = {};
            }
        });
    },
    
    // Record price for an item in a city
    recordPrice(cityId, itemId, price) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.priceHistory) return;
        
        if (!location.priceHistory[itemId]) {
            location.priceHistory[itemId] = [];
        }
        
        const priceEntry = {
            price: price,
            timestamp: TimeSystem.getTotalMinutes(),
            date: TimeSystem.getFormattedTime()
        };
        
        location.priceHistory[itemId].push(priceEntry);
        
        // Keep only last 50 entries per item
        if (location.priceHistory[itemId].length > 50) {
            location.priceHistory[itemId].shift();
        }
    },
    
    // Get price history for an item in a city
    getPriceHistory(cityId, itemId) {
        const location = GameWorld.locations[cityId];
        return location && location.priceHistory ? location.priceHistory[itemId] || [] : [];
    },
    
    // Calculate price trend for an item
    getPriceTrend(cityId, itemId) {
        const history = this.getPriceHistory(cityId, itemId);
        if (history.length < 2) return 'stable';
        
        const recent = history.slice(-5); // Last 5 entries
        if (recent.length < 2) return 'stable';
        
        const firstPrice = recent[0].price;
        const lastPrice = recent[recent.length - 1].price;
        const change = (lastPrice - firstPrice) / firstPrice;
        
        if (change > 0.1) return 'rising';
        if (change < -0.1) return 'falling';
        return 'stable';
    },
    
    // Get average price for an item over a period
    getAveragePrice(cityId, itemId, periodMinutes = 60) {
        const history = this.getPriceHistory(cityId, itemId);
        if (history.length === 0) return 0;
        
        const currentTime = TimeSystem.getTotalMinutes();
        const cutoffTime = currentTime - periodMinutes;
        
        const recentPrices = history.filter(entry => entry.timestamp >= cutoffTime);
        if (recentPrices.length === 0) return 0;
        
        const sum = recentPrices.reduce((acc, entry) => acc + entry.price, 0);
        return Math.round(sum / recentPrices.length);
    },
    
    // Get price comparison between cities
    comparePrices(itemId, cityIds = null) {
        if (!cityIds) {
            cityIds = Object.keys(GameWorld.locations);
        }
        
        const comparisons = [];
        
        cityIds.forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location || !location.marketPrices || !location.marketPrices[itemId]) return;
            
            const currentPrice = location.marketPrices[itemId].price;
            const averagePrice = this.getAveragePrice(cityId, itemId);
            const trend = this.getPriceTrend(cityId, itemId);
            
            comparisons.push({
                cityId: cityId,
                cityName: location.name,
                currentPrice: currentPrice,
                averagePrice: averagePrice,
                trend: trend,
                stock: location.marketPrices[itemId].stock
            });
        });
        
        return comparisons.sort((a, b) => a.currentPrice - b.currentPrice);
    }
};

// Dynamic Market Pricing System
const DynamicMarketSystem = {
    // Initialize dynamic pricing
    init() {
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.marketPrices) return;
            
            // Initialize supply and demand tracking
            Object.keys(location.marketPrices).forEach(itemId => {
                location.marketPrices[itemId].supply = 100; // Base supply level
                location.marketPrices[itemId].demand = 100; // Base demand level
                location.marketPrices[itemId].baseSupply = 100;
                location.marketPrices[itemId].baseDemand = 100;
            });
        });
    },
    
    // Update market prices based on supply and demand
    updateMarketPrices() {
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.marketPrices) return;
            
            Object.keys(location.marketPrices).forEach(itemId => {
                const marketData = location.marketPrices[itemId];
                const item = ItemDatabase.getItem(itemId);
                if (!item) return;
                
                // Calculate supply/demand ratio
                const supplyDemandRatio = marketData.demand / marketData.supply;
                
                // Calculate base price modifier
                let priceModifier = 1.0;
                
                if (supplyDemandRatio > 1.5) {
                    priceModifier = 1.3; // High demand, low supply
                } else if (supplyDemandRatio > 1.2) {
                    priceModifier = 1.15; // Moderate demand
                } else if (supplyDemandRatio < 0.7) {
                    priceModifier = 0.8; // Low demand, high supply
                } else if (supplyDemandRatio < 0.9) {
                    priceModifier = 0.9; // Slightly low demand
                }
                
                // Apply reputation modifier
                const reputationModifier = CityReputationSystem.getPriceModifier(cityId);
                priceModifier *= reputationModifier;
                
                // Apply event modifiers
                if (marketData.eventModifier) {
                    priceModifier *= marketData.eventModifier;
                }
                
                // Apply time-based modifiers
                const timeInfo = TimeSystem.getTimeInfo();
                if (timeInfo.isMorning && item.category === ItemDatabase.categories.CONSUMABLES) {
                    priceModifier *= 1.05; // Morning premium for food
                }
                
                // Calculate final price
                const basePrice = ItemDatabase.calculatePrice(itemId);
                const finalPrice = Math.round(basePrice * priceModifier);
                
                // Update market data
                marketData.price = finalPrice;
                marketData.supplyDemandRatio = supplyDemandRatio;
                
                // Record price history
                MarketPriceHistory.recordPrice(cityId, itemId, finalPrice);
            });
        });
    },
    
    // Update supply and demand based on player actions
    updateSupplyDemand(cityId, itemId, quantityChange) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices[itemId]) return;
        
        const marketData = location.marketPrices[itemId];
        
        // Update supply (buying reduces supply, selling increases it)
        marketData.supply = Math.max(10, marketData.supply - quantityChange * 0.5);
        
        // Update demand (buying increases demand, selling decreases it)
        marketData.demand = Math.max(10, marketData.demand + quantityChange * 0.3);
        
        // Natural recovery over time
        const recoveryRate = 0.02; // 2% recovery per update
        marketData.supply = Math.min(marketData.baseSupply * 1.5,
            marketData.supply + (marketData.baseSupply - marketData.supply) * recoveryRate);
        marketData.demand = Math.min(marketData.baseDemand * 1.5,
            marketData.demand + (marketData.baseDemand - marketData.demand) * recoveryRate);
    },
    
    // Apply market saturation effects
    applyMarketSaturation(cityId, itemId) {
        const location = GameWorld.locations[cityId];
        if (!location || !location.marketPrices[itemId]) return;
        
        const marketData = location.marketPrices[itemId];
        
        // Check for market saturation (too much of one item)
        if (marketData.stock > 50) {
            marketData.saturationMultiplier = 0.9; // 10% price reduction
            addMessage(`Market saturation: ${ItemDatabase.formatItemName(itemId)} prices reduced due to oversupply!`);
        } else if (marketData.stock < 5) {
            marketData.saturationMultiplier = 1.2; // 20% price increase
            addMessage(`Market scarcity: ${ItemDatabase.formatItemName(itemId)} prices increased due to low stock!`);
        } else {
            marketData.saturationMultiplier = 1.0;
        }
    },
    
    // Generate market news
    generateMarketNews() {
        const news = [];
        
        Object.keys(GameWorld.locations).forEach(cityId => {
            const location = GameWorld.locations[cityId];
            if (!location.marketPrices) return;
            
            // Find items with significant price changes
            Object.keys(location.marketPrices).forEach(itemId => {
                const marketData = location.marketPrices[itemId];
                const trend = MarketPriceHistory.getPriceTrend(cityId, itemId);
                
                if (trend !== 'stable') {
                    const item = ItemDatabase.getItem(itemId);
                    if (!item) return;
                    
                    const direction = trend === 'rising' ? '📈' : '📉';
                    news.push(`${direction} ${location.name}: ${item.name} prices are ${trend}!`);
                }
            });
        });
        
        // Add city event news
        Object.keys(GameWorld.locations).forEach(cityId => {
            const events = CityEventSystem.getCityEvents(cityId);
            events.forEach(event => {
                news.push(`📢 ${GameWorld.locations[cityId].name}: ${event.name}`);
            });
        });
        
        return news;
    }
};

console.log('City System and Market Mechanics initialized successfully!');

// Enhanced Inventory Management System
const InventorySystem = {
    // Quick access slots (up to 8 items)
    quickAccessSlots: Array(8).fill(null),
    selectedItems: new Set(),
    currentSortMethod: 'name',
    currentSortOrder: 'asc',
    currentFilter: 'all',
    selectedItem: null,
    dragItem: null,
    
    // Initialize inventory system
    init() {
        this.setupEventListeners();
        this.updateQuickAccessSlots();
        this.updateInventoryDisplay();
    },
    
    // Setup event listeners for inventory
    setupEventListeners() {
        // Inventory control buttons
        const sortBtn = document.getElementById('sort-inventory-btn');
        const filterBtn = document.getElementById('filter-inventory-btn');
        const settingsBtn = document.getElementById('inventory-settings-btn');
        const closeDetailsBtn = document.getElementById('close-item-details');
        
        if (sortBtn) sortBtn.addEventListener('click', () => this.toggleSortOptions());
        if (filterBtn) filterBtn.addEventListener('click', () => this.toggleFilterOptions());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.toggleInventorySettings());
        if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => this.closeItemDetails());
        
        // Filter and sort controls
        const categoryFilter = document.getElementById('inventory-category-filter');
        const sortMethod = document.getElementById('inventory-sort-method');
        const sortOrder = document.getElementById('inventory-sort-order');
        
        if (categoryFilter) categoryFilter.addEventListener('change', (e) => this.setFilter(e.target.value));
        if (sortMethod) sortMethod.addEventListener('change', (e) => this.setSortMethod(e.target.value));
        if (sortOrder) sortOrder.addEventListener('click', () => this.toggleSortOrder());
        
        // Item action buttons
        const useBtn = document.getElementById('use-item-btn');
        const equipBtn = document.getElementById('equip-item-btn');
        const dropBtn = document.getElementById('drop-item-btn');
        const examineBtn = document.getElementById('examine-item-btn');
        const giftBtn = document.getElementById('gift-item-btn');
        
        if (useBtn) useBtn.addEventListener('click', () => this.useSelectedItem());
        if (equipBtn) equipBtn.addEventListener('click', () => this.equipSelectedItem());
        if (dropBtn) dropBtn.addEventListener('click', () => this.dropSelectedItem());
        if (examineBtn) examineBtn.addEventListener('click', () => this.examineSelectedItem());
        if (giftBtn) giftBtn.addEventListener('click', () => this.giftSelectedItem());
    },
    
    // Update inventory display
    updateInventoryDisplay() {
        const container = document.getElementById('inventory-items');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!game.player || !game.player.inventory) {
            container.innerHTML = '<p class="empty-message">Your inventory is empty.</p>';
            return;
        }
        
        // Get filtered and sorted items
        const items = this.getFilteredAndSortedItems();
        
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-message">No items match your filter.</p>';
            return;
        }
        
        // Create item elements
        items.forEach(itemData => {
            const itemElement = this.createInventoryItemElement(itemData);
            container.appendChild(itemElement);
        });
        
        // Update inventory stats
        this.updateInventoryStats();
    },
    
    // Create inventory item element
    createInventoryItemElement(itemData) {
        const item = itemData.item;
        const quantity = itemData.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item ${item.rarity.name.toLowerCase()} ${this.selectedItems.has(item.id) ? 'selected' : ''}`;
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            ${quantity > 1 ? `<div class="item-quantity">×${quantity}</div>` : ''}
            <div class="item-weight">${item.weight.toFixed(1)} lbs</div>
        `;
        
        // Add event listeners
        itemElement.addEventListener('click', (e) => this.handleItemClick(e, item.id));
        itemElement.addEventListener('contextmenu', (e) => this.handleItemRightClick(e, item.id));
        itemElement.addEventListener('dragstart', (e) => this.handleDragStart(e, item.id));
        itemElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
        itemElement.addEventListener('dragover', (e) => this.handleDragOver(e));
        itemElement.addEventListener('drop', (e) => this.handleDrop(e, item.id));
        
        // Add tooltip
        itemElement.addEventListener('mouseenter', (e) => this.showTooltip(e, item));
        itemElement.addEventListener('mouseleave', () => this.hideTooltip());
        
        // Add shift/ctrl/alt click functionality
        itemElement.addEventListener('click', (e) => this.handleItemModifiers(e, item.id));
        
        return itemElement;
    },
    
    // Handle item click with modifiers
    handleItemModifiers(event, itemId) {
        if (event.shiftKey) {
            // Shift+Click: Add 5 to quantity selector
            this.adjustItemQuantity(itemId, 5);
            event.preventDefault();
        } else if (event.ctrlKey) {
            // Ctrl+Click: Add 25 to quantity selector
            this.adjustItemQuantity(itemId, 25);
            event.preventDefault();
        } else if (event.altKey) {
            // Alt+Click: Add 100 to quantity selector
            this.adjustItemQuantity(itemId, 100);
            event.preventDefault();
        }
    },
    
    // Adjust item quantity for trading
    adjustItemQuantity(itemId, amount) {
        if (!game.player.inventory[itemId]) return;
        
        const currentQuantity = game.player.inventory[itemId];
        const adjustedQuantity = Math.max(1, Math.min(currentQuantity, amount));
        
        // Update trade preview if in market
        if (game.state === GameState.MARKET) {
            TradingSystem.updateTradePreview(itemId, adjustedQuantity);
        }
    },
    
    // Get filtered and sorted items
    getFilteredAndSortedItems() {
        if (!game.player.inventory) return [];
        
        let items = [];
        
        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
            if (quantity <= 0) continue;
            
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            // Apply filter
            if (this.currentFilter !== 'all') {
                let itemCategory = 'other';
                if (item.category === ItemDatabase.categories.CONSUMABLES) itemCategory = 'consumables';
                else if (item.category === ItemDatabase.categories.TOOLS) itemCategory = 'tools';
                else if (item.category === ItemDatabase.categories.WEAPONS) itemCategory = 'weapons';
                else if (item.category === ItemDatabase.categories.BASIC_RESOURCES ||
                         item.category === ItemDatabase.categories.RAW_ORES) itemCategory = 'resources';
                else if (item.category === ItemDatabase.categories.LUXURY) itemCategory = 'luxury';
                
                if (itemCategory !== this.currentFilter) continue;
            }
            
            items.push({ item, quantity, itemId });
        }
        
        // Apply sorting
        items.sort((a, b) => {
            let comparison = 0;
            
            switch (this.currentSortMethod) {
                case 'name':
                    comparison = a.item.name.localeCompare(b.item.name);
                    break;
                case 'value':
                    comparison = a.item.basePrice - b.item.basePrice;
                    break;
                case 'weight':
                    comparison = a.item.weight - b.item.weight;
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                case 'category':
                    comparison = a.item.category.localeCompare(b.item.category);
                    break;
                case 'rarity':
                    comparison = a.item.rarity.priceMultiplier - b.item.rarity.priceMultiplier;
                    break;
            }
            
            return this.currentSortOrder === 'asc' ? comparison : -comparison;
        });
        
        return items;
    },
    
    // Handle item click
    handleItemClick(event, itemId) {
        if (event.shiftKey || event.ctrlKey || event.altKey) return;
        
        const itemElement = event.currentTarget;
        
        if (event.button === 2) { // Right click
            this.showItemDetails(itemId);
            return;
        }
        
        // Toggle selection
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
            itemElement.classList.remove('selected');
        } else {
            this.selectedItems.add(itemId);
            itemElement.classList.add('selected');
        }
        
        // Update item details if single selection
        if (this.selectedItems.size === 1) {
            this.showItemDetails(itemId);
        }
    },
    
    // Handle item right click
    handleItemRightClick(event, itemId) {
        event.preventDefault();
        this.showItemDetails(itemId);
    },
    
    // Drag and drop handlers
    handleDragStart(event, itemId) {
        this.dragItem = itemId;
        event.dataTransfer.effectAllowed = 'move';
        event.currentTarget.classList.add('dragging');
    },
    
    handleDragEnd(event) {
        event.currentTarget.classList.remove('dragging');
        this.dragItem = null;
    },
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    },
    
    handleDrop(event, targetItemId) {
        event.preventDefault();
        
        if (!this.dragItem || this.dragItem === targetItemId) return;
        
        // Swap items in quick access slots
        const dragIndex = this.quickAccessSlots.indexOf(this.dragItem);
        const targetIndex = this.quickAccessSlots.indexOf(targetItemId);
        
        if (dragIndex !== -1 && targetIndex !== -1) {
            // Swap within quick access
            this.quickAccessSlots[dragIndex] = targetItemId;
            this.quickAccessSlots[targetIndex] = this.dragItem;
        } else if (dragIndex !== -1) {
            // Move from quick access to inventory
            this.quickAccessSlots[dragIndex] = targetItemId;
        } else if (targetIndex !== -1) {
            // Move from inventory to quick access
            this.quickAccessSlots[targetIndex] = this.dragItem;
        }
        
        this.updateQuickAccessSlots();
    },
    
    // Show item details
    showItemDetails(itemId) {
        const item = ItemDatabase.getItem(itemId);
        if (!item) return;
        
        const quantity = game.player.inventory[itemId] || 0;
        const panel = document.getElementById('item-details-panel');
        
        // Update details panel
        document.getElementById('detail-item-name').textContent = item.name;
        document.getElementById('detail-item-icon').textContent = item.icon;
        document.getElementById('detail-item-description').textContent = item.description;
        document.getElementById('detail-item-value').textContent = `${ItemDatabase.calculatePrice(itemId)} gold`;
        document.getElementById('detail-item-weight').textContent = `${item.weight.toFixed(1)} lbs`;
        document.getElementById('detail-item-quantity').textContent = quantity;
        document.getElementById('detail-item-category').textContent = this.getCategoryName(item.category);
        document.getElementById('detail-item-rarity').textContent = item.rarity.name;
        document.getElementById('detail-item-rarity').style.color = item.rarity.color;
        
        // Show effects if consumable
        const effectsPanel = document.getElementById('detail-item-effects');
        if (item.consumable && Object.keys(item.effects).length > 0) {
            effectsPanel.classList.remove('hidden');
            const effectsList = document.getElementById('detail-effects-list');
            effectsList.innerHTML = '';
            
            for (const [stat, value] of Object.entries(item.effects)) {
                if (stat === 'duration') continue;
                const effectElement = document.createElement('div');
                effectElement.textContent = `${stat}: ${value > 0 ? '+' : ''}${value}`;
                effectsList.appendChild(effectElement);
            }
        } else {
            effectsPanel.classList.add('hidden');
        }
        
        // Update action buttons
        this.updateItemActionButtons(item);
        
        // Show panel
        panel.classList.remove('hidden');
        this.selectedItem = itemId;
    },
    
    // Close item details
    closeItemDetails() {
        document.getElementById('item-details-panel').classList.add('hidden');
        this.selectedItem = null;
    },
    
    // Update item action buttons
    updateItemActionButtons(item) {
        const useBtn = document.getElementById('use-item-btn');
        const equipBtn = document.getElementById('equip-item-btn');
        const dropBtn = document.getElementById('drop-item-btn');
        const examineBtn = document.getElementById('examine-item-btn');
        const giftBtn = document.getElementById('gift-item-btn');
        
        // Enable/disable based on item type
        useBtn.disabled = !item.consumable;
        equipBtn.disabled = !item.toolType && !item.damage;
        dropBtn.disabled = false;
        examineBtn.disabled = false;
        giftBtn.disabled = false;
        
        // Update button text
        if (item.toolType) {
            equipBtn.textContent = 'Equip Tool';
        } else if (item.damage) {
            equipBtn.textContent = 'Equip Weapon';
        } else {
            equipBtn.textContent = 'Equip';
        }
    },
    
    // Get category display name
    getCategoryName(category) {
        const categoryNames = {
            [ItemDatabase.categories.BASIC_RESOURCES]: 'Resources',
            [ItemDatabase.categories.PROCESSED_MATERIALS]: 'Materials',
            [ItemDatabase.categories.RAW_ORES]: 'Ores',
            [ItemDatabase.categories.FINISHED_GOODS]: 'Goods',
            [ItemDatabase.categories.CONSUMABLES]: 'Consumables',
            [ItemDatabase.categories.RARE_EXOTIC]: 'Rare',
            [ItemDatabase.categories.TOOLS]: 'Tools',
            [ItemDatabase.categories.WEAPONS]: 'Weapons',
            [ItemDatabase.categories.LUXURY]: 'Luxury',
            [ItemDatabase.categories.BUILDING_MATERIALS]: 'Building',
            [ItemDatabase.categories.AGRICULTURAL]: 'Agricultural'
        };
        
        return categoryNames[category] || 'Other';
    },
    
    // Item action methods
    useSelectedItem() {
        if (!this.selectedItem) return;
        useItem(this.selectedItem);
        this.updateInventoryDisplay();
        this.closeItemDetails();
    },
    
    equipSelectedItem() {
        if (!this.selectedItem) return;
        const item = ItemDatabase.getItem(this.selectedItem);
        if (!item) return;
        
        if (item.toolType) {
            useTool(item);
        } else if (item.damage) {
            equipWeapon(item);
        }
        
        this.updateInventoryDisplay();
        this.closeItemDetails();
    },
    
    dropSelectedItem() {
        if (!this.selectedItem) return;
        
        if (confirm(`Are you sure you want to drop ${ItemDatabase.getItem(this.selectedItem).name}?`)) {
            delete game.player.inventory[this.selectedItem];
            this.updateInventoryDisplay();
            this.closeItemDetails();
            addMessage(`Dropped ${ItemDatabase.getItem(this.selectedItem).name}.`);
        }
    },
    
    examineSelectedItem() {
        if (!this.selectedItem) return;
        const item = ItemDatabase.getItem(this.selectedItem);
        if (!item) return;
        
        addMessage(`You examine ${item.name}: ${item.description}`);
    },
    
    giftSelectedItem() {
        if (!this.selectedItem) return;
        const item = ItemDatabase.getItem(this.selectedItem);
        if (!item) return;
        
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return;
        
        // Gift item to improve reputation
        const reputationGain = Math.round(item.basePrice / 50);
        CityReputationSystem.changeReputation(location.id, reputationGain);
        
        delete game.player.inventory[this.selectedItem];
        this.updateInventoryDisplay();
        this.closeItemDetails();
        
        addMessage(`You gifted ${item.name} to the people of ${location.name}! Reputation +${reputationGain}`);
    },
    
    // Update quick access slots
    updateQuickAccessSlots() {
        const container = document.getElementById('quick-access-slots');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.quickAccessSlots.forEach((itemId, index) => {
            const slotElement = document.createElement('div');
            slotElement.className = 'quick-access-slot';
            slotElement.dataset.slotIndex = index;
            
            if (itemId) {
                const item = ItemDatabase.getItem(itemId);
                const quantity = game.player.inventory[itemId] || 0;
                
                slotElement.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    ${quantity > 1 ? `<div class="item-quantity">×${quantity}</div>` : ''}
                `;
                
                slotElement.addEventListener('click', () => {
                    if (item.consumable) {
                        useItem(itemId);
                    } else if (item.toolType || item.damage) {
                        this.showItemDetails(itemId);
                    }
                });
                
                slotElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showItemDetails(itemId);
                });
                
                slotElement.addEventListener('dragstart', (e) => this.handleDragStart(e, itemId));
                slotElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                slotElement.addEventListener('dragover', (e) => this.handleDragOver(e));
                slotElement.addEventListener('drop', (e) => this.handleDrop(e, itemId));
            }
            
            container.appendChild(slotElement);
        });
    },
    
    // Update inventory stats
    updateInventoryStats() {
        if (!game.player.inventory) return;
        
        let totalWeight = 0;
        let totalValue = 0;
        
        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
            if (quantity <= 0) continue;
            
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            totalWeight += item.weight * quantity;
            totalValue += ItemDatabase.calculatePrice(itemId) * quantity;
        }
        
        // Update display
        const weightElement = document.getElementById('inventory-weight');
        const valueElement = document.getElementById('inventory-value');
        
        if (weightElement) {
            const transport = transportationOptions[game.player.transportation];
            const capacity = transport ? transport.carryCapacity : 50;
            weightElement.textContent = `Weight: ${totalWeight.toFixed(1)}/${capacity} lbs`;
            
            // Update weight capacity bar
            this.updateWeightCapacityBar(totalWeight, capacity);
        }
        
        if (valueElement) {
            valueElement.textContent = `Value: ${totalValue} gold`;
        }
    },
    
    // Update weight capacity bar
    updateWeightCapacityBar(currentWeight, maxWeight) {
        let container = document.getElementById('weight-capacity-bar');
        if (!container) {
            // Create weight capacity bar if it doesn't exist
            const weightElement = document.getElementById('inventory-weight');
            if (weightElement) {
                container = document.createElement('div');
                container.id = 'weight-capacity-bar';
                container.className = 'weight-capacity-bar';
                
                const fill = document.createElement('div');
                fill.className = 'weight-capacity-fill';
                container.appendChild(fill);
                
                weightElement.parentNode.appendChild(container);
            }
        }
        
        if (container) {
            const fill = container.querySelector('.weight-capacity-fill');
            const percentage = Math.min(100, (currentWeight / maxWeight) * 100);
            fill.style.width = `${percentage}%`;
            
            // Update color based on capacity
            fill.className = 'weight-capacity-fill';
            if (percentage >= 90) {
                fill.classList.add('danger');
            } else if (percentage >= 75) {
                fill.classList.add('warning');
            } else {
                fill.classList.add('safe');
            }
        }
    },
    
    // Toggle sort options
    toggleSortOptions() {
        const options = document.getElementById('inventory-options');
        options.classList.toggle('hidden');
    },
    
    // Toggle filter options
    toggleFilterOptions() {
        const options = document.getElementById('inventory-options');
        options.classList.toggle('hidden');
    },
    
    // Toggle inventory settings
    toggleInventorySettings() {
        // This could open a more complex settings dialog
        addMessage('Inventory settings coming soon!');
    },
    
    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.updateInventoryDisplay();
    },
    
    // Set sort method
    setSortMethod(method) {
        this.currentSortMethod = method;
        this.updateInventoryDisplay();
    },
    
    // Toggle sort order
    toggleSortOrder() {
        this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
        const orderBtn = document.getElementById('inventory-sort-order');
        orderBtn.textContent = this.currentSortOrder === 'asc' ? '⬇️' : '⬆️';
        this.updateInventoryDisplay();
    },
    
    // Tooltip system
    showTooltip(event, item) {
        let tooltip = document.getElementById('item-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'item-tooltip';
            tooltip.className = 'item-tooltip';
            document.body.appendChild(tooltip);
        }
        
        const quantity = game.player.inventory[item.id] || 0;
        const totalWeight = item.weight * quantity;
        const totalValue = ItemDatabase.calculatePrice(item.id) * quantity;
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-name">${item.name}</span>
                <span class="tooltip-rarity" style="color: ${item.rarity.color}">${item.rarity.name}</span>
            </div>
            <div class="tooltip-content">
                <p>${item.description}</p>
                <div>Quantity: ${quantity}</div>
                <div>Weight: ${totalWeight.toFixed(1)} lbs</div>
                <div>Value: ${totalValue} gold</div>
                ${item.consumable && Object.keys(item.effects).length > 0 ?
                    `<div>Effects: ${Object.entries(item.effects)
                        .filter(([key]) => key !== 'duration')
                        .map(([key, value]) => `${key}: ${value > 0 ? '+' : ''}${value}`)
                        .join(', ')}</div>` : ''}
            </div>
        `;
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        tooltip.classList.add('visible');
    },
    
    hideTooltip() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }
};

// Trading System
const TradingSystem = {
    tradeMode: 'single', // 'single' or 'bulk'
    selectedTradeItems: new Map(),
    tradeHistory: [],
    priceAlerts: [],
    tradeRoutes: [],
    
    // Initialize trading system
    init() {
        this.setupEventListeners();
        this.loadTradeHistory();
        this.loadPriceAlerts();
        this.loadTradeRoutes();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Trade mode buttons
        const singleTradeBtn = document.getElementById('single-trade-btn');
        const bulkTradeBtn = document.getElementById('bulk-trade-btn');
        
        if (singleTradeBtn) singleTradeBtn.addEventListener('click', () => this.setTradeMode('single'));
        if (bulkTradeBtn) bulkTradeBtn.addEventListener('click', () => this.setTradeMode('bulk'));
        
        // Bulk controls
        const selectAllBuyBtn = document.getElementById('select-all-buy-btn');
        const clearSelectionBuyBtn = document.getElementById('clear-selection-buy-btn');
        const buySelectedBtn = document.getElementById('buy-selected-btn');
        
        if (selectAllBuyBtn) selectAllBuyBtn.addEventListener('click', () => this.selectAllBuyItems());
        if (clearSelectionBuyBtn) clearSelectionBuyBtn.addEventListener('click', () => this.clearBuySelection());
        if (buySelectedBtn) buySelectedBtn.addEventListener('click', () => this.buySelectedItems());
        
        // Trade preview buttons
        const confirmTradeBtn = document.getElementById('confirm-trade-btn');
        const cancelTradeBtn = document.getElementById('cancel-trade-btn');
        
        if (confirmTradeBtn) confirmTradeBtn.addEventListener('click', () => this.confirmTrade());
        if (cancelTradeBtn) cancelTradeBtn.addEventListener('click', () => this.cancelTrade());
        
        // History controls
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const exportHistoryBtn = document.getElementById('export-history-btn');
        
        if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => this.clearTradeHistory());
        if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', () => this.exportTradeHistory());
        
        // Route controls
        const planRouteBtn = document.getElementById('plan-route-btn');
        const clearRoutesBtn = document.getElementById('clear-routes-btn');
        
        if (planRouteBtn) planRouteBtn.addEventListener('click', () => this.planNewRoute());
        if (clearRoutesBtn) clearRoutesBtn.addEventListener('click', () => this.clearTradeRoutes());
        
        // Alert controls
        const addAlertBtn = document.getElementById('add-alert-btn');
        const clearAlertsBtn = document.getElementById('clear-alerts-btn');
        
        if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.addPriceAlert());
        if (clearAlertsBtn) clearAlertsBtn.addEventListener('click', () => this.clearPriceAlerts());
    },
    
    // Set trade mode
    setTradeMode(mode) {
        this.tradeMode = mode;
        
        // Update button states
        const singleBtn = document.getElementById('single-trade-btn');
        const bulkBtn = document.getElementById('bulk-trade-btn');
        
        if (singleBtn && bulkBtn) {
            singleBtn.classList.toggle('active', mode === 'single');
            bulkBtn.classList.toggle('active', mode === 'bulk');
        }
        
        // Show/hide bulk controls
        const bulkBuyControls = document.getElementById('bulk-buy-controls');
        const bulkSellControls = document.getElementById('bulk-sell-controls');
        
        if (bulkBuyControls) bulkBuyControls.classList.toggle('hidden', mode !== 'bulk');
        if (bulkSellControls) bulkSellControls.classList.toggle('hidden', mode !== 'bulk');
        
        // Clear selection when switching modes
        this.selectedTradeItems.clear();
        this.updateTradeSummary();
    },
    
    // Update trade preview
    updateTradePreview(itemId, quantity) {
        if (this.tradeMode === 'single') return;
        
        this.selectedTradeItems.set(itemId, quantity);
        this.showTradePreview();
    },
    
    // Show trade preview
    showTradePreview() {
        const preview = document.getElementById('trade-preview');
        if (!preview) return;
        
        if (this.selectedTradeItems.size === 0) {
            preview.classList.add('hidden');
            return;
        }
        
        preview.classList.remove('hidden');
        
        const itemsContainer = document.getElementById('trade-preview-items');
        const totalCostElement = document.getElementById('preview-total-cost');
        const totalWeightElement = document.getElementById('preview-total-weight');
        
        itemsContainer.innerHTML = '';
        let totalCost = 0;
        let totalWeight = 0;
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            const location = GameWorld.locations[game.currentLocation.id];
            const marketData = location?.marketPrices?.[itemId];
            const price = marketData?.price || ItemDatabase.calculatePrice(itemId);
            
            const itemTotal = price * quantity;
            const itemWeight = item.weight * quantity;
            
            totalCost += itemTotal;
            totalWeight += itemWeight;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'trade-item';
            itemElement.textContent = `${item.name} ×${quantity} (${itemTotal} gold)`;
            itemsContainer.appendChild(itemElement);
        }
        
        totalCostElement.textContent = totalCost;
        totalWeightElement.textContent = totalWeight.toFixed(1);
    },
    
    // Confirm trade
    confirmTrade() {
        if (this.selectedTradeItems.size === 0) return;
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            for (let i = 0; i < quantity; i++) {
                buyItem(itemId);
            }
        }
        
        // Record trade in history
        this.recordTrade('buy', this.selectedTradeItems);
        
        // Clear selection and preview
        this.selectedTradeItems.clear();
        this.hideTradePreview();
        this.updateTradeSummary();
    },
    
    // Cancel trade
    cancelTrade() {
        this.selectedTradeItems.clear();
        this.hideTradePreview();
        this.updateTradeSummary();
    },
    
    // Hide trade preview
    hideTradePreview() {
        const preview = document.getElementById('trade-preview');
        if (preview) preview.classList.add('hidden');
    },
    
    // Update trade summary
    updateTradeSummary() {
        const totalElement = document.getElementById('trade-total');
        const profitElement = document.getElementById('trade-profit');
        
        if (!totalElement || !profitElement) return;
        
        let totalCost = 0;
        let totalValue = 0;
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            const location = GameWorld.locations[game.currentLocation.id];
            const marketData = location?.marketPrices?.[itemId];
            const price = marketData?.price || ItemDatabase.calculatePrice(itemId);
            
            totalCost += price * quantity;
            totalValue += ItemDatabase.calculatePrice(itemId) * quantity;
        }
        
        const profit = totalValue - totalCost;
        
        totalElement.textContent = `Total: ${totalCost} gold`;
        profitElement.textContent = `Profit: ${profit} gold`;
        profitElement.style.color = profit >= 0 ? '#4caf50' : '#f44336';
    },
    
    // Select all buy items
    selectAllBuyItems() {
        const buyItems = document.getElementById('buy-items');
        if (!buyItems) return;
        
        const itemElements = buyItems.querySelectorAll('.market-item');
        itemElements.forEach(element => {
            const itemId = element.dataset.itemId;
            if (itemId) {
                this.selectedTradeItems.set(itemId, 1);
                element.classList.add('selected');
            }
        });
        
        this.updateTradeSummary();
    },
    
    // Clear buy selection
    clearBuySelection() {
        this.selectedTradeItems.clear();
        
        const buyItems = document.getElementById('buy-items');
        if (buyItems) {
            const itemElements = buyItems.querySelectorAll('.market-item.selected');
            itemElements.forEach(element => {
                element.classList.remove('selected');
            });
        }
        
        this.updateTradeSummary();
    },
    
    // Buy selected items
    buySelectedItems() {
        this.confirmTrade();
    },
    
    // Record trade in history
    recordTrade(type, items) {
        const trade = {
            id: Date.now(),
            type: type,
            items: new Map(items),
            location: game.currentLocation.id,
            timestamp: TimeSystem.getTotalMinutes(),
            date: TimeSystem.getFormattedTime()
        };
        
        this.tradeHistory.unshift(trade);
        
        // Keep only last 100 trades
        if (this.tradeHistory.length > 100) {
            this.tradeHistory = this.tradeHistory.slice(0, 100);
        }
        
        this.saveTradeHistory();
        this.updateTradeHistoryDisplay();
    },
    
    // Update trade history display
    updateTradeHistoryDisplay() {
        const container = document.getElementById('trade-history');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.tradeHistory.length === 0) {
            container.innerHTML = '<p class="empty-message">No trade history available.</p>';
            return;
        }
        
        this.tradeHistory.forEach(trade => {
            const tradeElement = this.createTradeHistoryElement(trade);
            container.appendChild(tradeElement);
        });
    },
    
    // Create trade history element
    createTradeHistoryElement(trade) {
        const element = document.createElement('div');
        element.className = `trade-entry ${trade.type}`;
        
        let totalValue = 0;
        const itemsList = [];
        
        for (const [itemId, quantity] of trade.items) {
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            const itemValue = ItemDatabase.calculatePrice(itemId) * quantity;
            totalValue += itemValue;
            itemsList.push(`${item.name} ×${quantity}`);
        }
        
        element.innerHTML = `
            <div class="trade-header">
                <span class="trade-date">${trade.date}</span>
                <span class="trade-profit ${totalValue >= 0 ? 'positive' : 'negative'}">
                    ${totalValue >= 0 ? '+' : ''}${totalValue} gold
                </span>
            </div>
            <div class="trade-items">
                ${itemsList.map(item => `<div class="trade-item">${item}</div>`).join('')}
            </div>
        `;
        
        return element;
    },
    
    // Clear trade history
    clearTradeHistory() {
        if (confirm('Are you sure you want to clear all trade history?')) {
            this.tradeHistory = [];
            this.saveTradeHistory();
            this.updateTradeHistoryDisplay();
            addMessage('Trade history cleared.');
        }
    },
    
    // Export trade history
    exportTradeHistory() {
        if (this.tradeHistory.length === 0) {
            addMessage('No trade history to export.');
            return;
        }
        
        const dataStr = JSON.stringify(this.tradeHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `trade_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        addMessage('Trade history exported successfully.');
    },
    
    // Plan new route
    planNewRoute() {
        addMessage('Route planning feature coming soon!');
    },
    
    // Clear trade routes
    clearTradeRoutes() {
        if (confirm('Are you sure you want to clear all trade routes?')) {
            this.tradeRoutes = [];
            this.saveTradeRoutes();
            addMessage('Trade routes cleared.');
        }
    },
    
    // Add price alert
    addPriceAlert() {
        const itemId = prompt('Enter item ID for price alert:');
        if (!itemId) return;
        
        const targetPrice = prompt('Enter target price:');
        if (!targetPrice) return;
        
        const alert = {
            id: Date.now(),
            itemId: itemId,
            targetPrice: parseFloat(targetPrice),
            active: true,
            created: TimeSystem.getTotalMinutes()
        };
        
        this.priceAlerts.push(alert);
        this.savePriceAlerts();
        this.updatePriceAlertsDisplay();
        
        addMessage(`Price alert added for ${ItemDatabase.formatItemName(itemId)} at ${targetPrice} gold.`);
    },
    
    // Clear price alerts
    clearPriceAlerts() {
        if (confirm('Are you sure you want to clear all price alerts?')) {
            this.priceAlerts = [];
            this.savePriceAlerts();
            this.updatePriceAlertsDisplay();
            addMessage('Price alerts cleared.');
        }
    },
    
    // Update price alerts display
    updatePriceAlertsDisplay() {
        const container = document.getElementById('price-alerts');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.priceAlerts.length === 0) {
            container.innerHTML = '<p class="empty-message">No price alerts set.</p>';
            return;
        }
        
        this.priceAlerts.forEach(alert => {
            const alertElement = this.createPriceAlertElement(alert);
            container.appendChild(alertElement);
        });
    },
    
    // Create price alert element
    createPriceAlertElement(alert) {
        const element = document.createElement('div');
        element.className = 'alert-entry';
        
        const item = ItemDatabase.getItem(alert.itemId);
        const itemName = item ? item.name : alert.itemId;
        
        element.innerHTML = `
            <div class="alert-header">
                <span class="alert-item">${itemName}</span>
                <button class="alert-remove" data-alert-id="${alert.id}">×</button>
            </div>
            <div class="alert-condition">
                Alert when price ${alert.targetPrice} gold
            </div>
        `;
        
        // Add remove button listener
        const removeBtn = element.querySelector('.alert-remove');
        removeBtn.addEventListener('click', () => this.removePriceAlert(alert.id));
        
        return element;
    },
    
    // Remove price alert
    removePriceAlert(alertId) {
        this.priceAlerts = this.priceAlerts.filter(alert => alert.id !== alertId);
        this.savePriceAlerts();
        this.updatePriceAlertsDisplay();
        addMessage('Price alert removed.');
    },
    
    // Save/load methods
    saveTradeHistory() {
        localStorage.setItem('tradingGameTradeHistory', JSON.stringify(this.tradeHistory));
    },
    
    loadTradeHistory() {
        const saved = localStorage.getItem('tradingGameTradeHistory');
        if (saved) {
            try {
                this.tradeHistory = JSON.parse(saved);
            } catch (e) {
                this.tradeHistory = [];
            }
        }
    },
    
    savePriceAlerts() {
        localStorage.setItem('tradingGamePriceAlerts', JSON.stringify(this.priceAlerts));
    },
    
    loadPriceAlerts() {
        const saved = localStorage.getItem('tradingGamePriceAlerts');
        if (saved) {
            try {
                this.priceAlerts = JSON.parse(saved);
            } catch (e) {
                this.priceAlerts = [];
            }
        }
    },
    
    saveTradeRoutes() {
        localStorage.setItem('tradingGameTradeRoutes', JSON.stringify(this.tradeRoutes));
    },
    
    loadTradeRoutes() {
        const saved = localStorage.getItem('tradingGameTradeRoutes');
        if (saved) {
            try {
                this.tradeRoutes = JSON.parse(saved);
            } catch (e) {
                this.tradeRoutes = [];
            }
        }
    },
    
    // Check price alerts
    checkPriceAlerts() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location || !location.marketPrices) return;
        
        this.priceAlerts.forEach(alert => {
            if (!alert.active) return;
            
            const marketData = location.marketPrices[alert.itemId];
            if (!marketData) return;
            
            const currentPrice = marketData.price;
            const targetPrice = alert.targetPrice;
            
            let triggered = false;
            let message = '';
            
            if (targetPrice > 0 && currentPrice <= targetPrice) {
                triggered = true;
                message = `🔔 Price Alert: ${ItemDatabase.formatItemName(alert.itemId)} dropped to ${currentPrice} gold (target: ${targetPrice})`;
            } else if (targetPrice < 0 && currentPrice >= Math.abs(targetPrice)) {
                triggered = true;
                message = `🔔 Price Alert: ${ItemDatabase.formatItemName(alert.itemId)} rose to ${currentPrice} gold (target: ${Math.abs(targetPrice)})`;
            }
            
            if (triggered) {
                addMessage(message);
                alert.active = false;
                this.savePriceAlerts();
                this.updatePriceAlertsDisplay();
            }
        });
    }
};

// Property System
const PropertySystem = {
    // Property types with their characteristics
    propertyTypes: {
        house: {
            id: 'house',
            name: 'House',
            description: 'A basic residence providing storage and rest.',
            basePrice: 1000,
            baseIncome: 5,
            maintenanceCost: 2,
            storageBonus: 50,
            restBonus: true,
            icon: '🏠'
        },
        shop: {
            id: 'shop',
            name: 'Shop',
            description: 'A small retail space for selling goods.',
            basePrice: 2500,
            baseIncome: 15,
            maintenanceCost: 8,
            storageBonus: 100,
            merchantSlots: 1,
            icon: '🏪'
        },
        warehouse: {
            id: 'warehouse',
            name: 'Warehouse',
            description: 'Large storage facility for goods and materials.',
            basePrice: 4000,
            baseIncome: 8,
            maintenanceCost: 15,
            storageBonus: 500,
            icon: '🏭'
        },
        farm: {
            id: 'farm',
            name: 'Farm',
            description: 'Agricultural land that produces food and resources.',
            basePrice: 3000,
            baseIncome: 20,
            maintenanceCost: 10,
            production: { food: 5, grain: 3 },
            workerSlots: 3,
            icon: '🌾'
        },
        mine: {
            id: 'mine',
            name: 'Mine',
            description: 'Mining operation that extracts valuable resources.',
            basePrice: 8000,
            baseIncome: 25,
            maintenanceCost: 20,
            production: { stone: 8, iron_ore: 3, coal: 5 },
            workerSlots: 5,
            icon: '⛏️'
        },
        tavern: {
            id: 'tavern',
            name: 'Tavern',
            description: 'Public house that generates income from patrons.',
            basePrice: 5000,
            baseIncome: 30,
            maintenanceCost: 12,
            storageBonus: 80,
            merchantSlots: 2,
            reputationBonus: 1,
            icon: '🍺'
        },
        market_stall: {
            id: 'market_stall',
            name: 'Market Stall',
            description: 'Small stall for trading goods in markets.',
            basePrice: 800,
            baseIncome: 10,
            maintenanceCost: 3,
            merchantSlots: 1,
            icon: '🏪'
        },
        craftshop: {
            id: 'craftshop',
            name: 'Craftshop',
            description: 'Workshop for crafting and selling goods.',
            basePrice: 3500,
            baseIncome: 18,
            maintenanceCost: 10,
            production: {},
            workerSlots: 2,
            icon: '🔨'
        }
    },
    
    // Property upgrades
    upgrades: {
        expansion: {
            id: 'expansion',
            name: 'Expansion',
            description: 'Increases property size and capacity.',
            costMultiplier: 0.5,
            effects: { storageBonus: 1.5, incomeBonus: 1.2 },
            icon: '📏'
        },
        security: {
            id: 'security',
            name: 'Security',
            description: 'Reduces maintenance costs and damage risk.',
            costMultiplier: 0.3,
            effects: { maintenanceReduction: 0.3, damageReduction: 0.5 },
            icon: '🔒'
        },
        luxury: {
            id: 'luxury',
            name: 'Luxury',
            description: 'Increases income and reputation.',
            costMultiplier: 0.8,
            effects: { incomeBonus: 1.4, reputationBonus: 2 },
            icon: '✨'
        },
        efficiency: {
            id: 'efficiency',
            name: 'Efficiency',
            description: 'Reduces maintenance costs and increases production.',
            costMultiplier: 0.4,
            effects: { maintenanceReduction: 0.2, productionBonus: 1.3 },
            icon: '⚡'
        }
    },
    
    // Initialize property system
    init() {
        if (!game.player.ownedProperties) {
            game.player.ownedProperties = [];
        }
        if (!game.player.propertyIncome) {
            game.player.propertyIncome = 0;
        }
        if (!game.player.propertyExpenses) {
            game.player.propertyExpenses = 0;
        }
        
        // Setup property income processing
        this.setupIncomeProcessing();
    },
    
    // Setup regular income processing
    setupIncomeProcessing() {
        // Process income every game day
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Check if a day has passed
            if (TimeSystem.currentTime.hour === 0 && TimeSystem.currentTime.minute === 0) {
                PropertySystem.processDailyIncome();
            }
            
            return result;
        };
    },
    
    // Get available properties in current location
    getAvailableProperties() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return [];
        
        const availableProperties = [];
        
        // Properties available based on location type
        const locationProperties = {
            village: ['house', 'farm', 'market_stall'],
            town: ['house', 'shop', 'warehouse', 'tavern', 'craftshop'],
            city: ['house', 'shop', 'warehouse', 'tavern', 'craftshop', 'mine']
        };
        
        const propertyIds = locationProperties[location.type] || locationProperties.village;
        
        propertyIds.forEach(propertyId => {
            const propertyType = this.propertyTypes[propertyId];
            if (propertyType) {
                // Check if player already owns this type in this location
                const existingProperty = game.player.ownedProperties.find(
                    p => p.type === propertyId && p.location === game.currentLocation.id
                );
                
                if (!existingProperty) {
                    availableProperties.push({
                        ...propertyType,
                        location: game.currentLocation.id,
                        calculatedPrice: this.calculatePropertyPrice(propertyId)
                    });
                }
            }
        });
        
        return availableProperties;
    },
    
    // Calculate property price based on location and modifiers
    calculatePropertyPrice(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return 0;
        
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return propertyType.basePrice;
        
        let price = propertyType.basePrice;
        
        // Location type modifier
        const locationModifiers = {
            village: 0.8,
            town: 1.0,
            city: 1.3
        };
        
        price *= locationModifiers[location.type] || 1.0;
        
        // Player reputation modifier
        const reputation = CityReputationSystem.getReputation(game.currentLocation.id);
        const reputationModifier = 1 - (reputation * 0.002); // Small discount for good reputation
        price *= Math.max(0.7, reputationModifier);
        
        return Math.round(price);
    },
    
    // Purchase property
    purchaseProperty(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) {
            addMessage('Invalid property type!');
            return false;
        }
        
        const price = this.calculatePropertyPrice(propertyId);
        
        if (game.player.gold < price) {
            addMessage(`You need ${price} gold to purchase a ${propertyType.name}!`);
            return false;
        }
        
        // Check if player already owns this type in this location
        const existingProperty = game.player.ownedProperties.find(
            p => p.type === propertyId && p.location === game.currentLocation.id
        );
        
        if (existingProperty) {
            addMessage(`You already own a ${propertyType.name} in ${game.currentLocation.name}!`);
            return false;
        }
        
        // Purchase property
        game.player.gold -= price;
        
        const newProperty = {
            id: Date.now().toString(),
            type: propertyId,
            location: game.currentLocation.id,
            level: 1,
            condition: 100,
            upgrades: [],
            employees: [],
            lastIncomeTime: TimeSystem.getTotalMinutes(),
            totalIncome: 0,
            purchasePrice: price,
            storageUsed: 0
        };
        
        game.player.ownedProperties.push(newProperty);
        
        addMessage(`Purchased ${propertyType.name} in ${game.currentLocation.name} for ${price} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Get player's properties
    getPlayerProperties() {
        return game.player.ownedProperties || [];
    },
    
    // Get property details
    getProperty(propertyId) {
        return game.player.ownedProperties.find(p => p.id === propertyId);
    },
    
    // Process daily income for all properties
    processDailyIncome() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;
        
        let totalIncome = 0;
        let totalExpenses = 0;
        
        game.player.ownedProperties.forEach(property => {
            const propertyType = this.propertyTypes[property.type];
            if (!propertyType) return;
            
            // Calculate base income
            let income = propertyType.baseIncome;
            
            // Apply level multiplier
            income *= (1 + (property.level - 1) * 0.2);
            
            // Apply upgrade bonuses
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.incomeBonus) {
                    income *= upgrade.effects.incomeBonus;
                }
            });
            
            // Apply condition modifier
            income *= (property.condition / 100);
            
            // Calculate maintenance cost
            let maintenance = propertyType.maintenanceCost;
            
            // Apply upgrade reductions
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.maintenanceReduction) {
                    maintenance *= upgrade.effects.maintenanceReduction;
                }
            });
            
            // Calculate tax (10% of income)
            const tax = Math.round(income * 0.1);
            
            // Net income
            const netIncome = Math.round(income - maintenance - tax);
            
            totalIncome += Math.max(0, netIncome);
            totalExpenses += maintenance + tax;
            
            // Update property stats
            property.totalIncome += netIncome;
            property.lastIncomeTime = TimeSystem.getTotalMinutes();
            
            // Degrade condition slightly
            property.condition = Math.max(20, property.condition - 1);
        });
        
        // Apply to player
        game.player.gold += totalIncome;
        game.player.propertyIncome = totalIncome;
        game.player.propertyExpenses = totalExpenses;
        
        if (totalIncome > 0) {
            addMessage(`💰 Property income: +${totalIncome} gold (Expenses: ${totalExpenses} gold)`);
        }
    },
    
    // Upgrade property
    upgradeProperty(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        
        if (!property || !upgrade) {
            addMessage('Invalid property or upgrade!');
            return false;
        }
        
        // Check if already upgraded
        if (property.upgrades.includes(upgradeId)) {
            addMessage('Property already has this upgrade!');
            return false;
        }
        
        // Calculate upgrade cost
        const propertyType = this.propertyTypes[property.type];
        const upgradeCost = Math.round(propertyType.basePrice * upgrade.costMultiplier);
        
        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold for this upgrade!`);
            return false;
        }
        
        // Apply upgrade
        game.player.gold -= upgradeCost;
        property.upgrades.push(upgradeId);
        
        addMessage(`Upgraded ${propertyType.name} with ${upgrade.name} for ${upgradeCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Repair property
    repairProperty(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) {
            addMessage('Invalid property!');
            return false;
        }
        
        if (property.condition >= 100) {
            addMessage('Property is already in excellent condition!');
            return false;
        }
        
        const propertyType = this.propertyTypes[property.type];
        const repairCost = Math.round(propertyType.basePrice * 0.1 * (1 - property.condition / 100));
        
        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair this property!`);
            return false;
        }
        
        // Repair property
        game.player.gold -= repairCost;
        property.condition = 100;
        
        addMessage(`Repaired ${propertyType.name} for ${repairCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Update property display
    updatePropertyDisplay() {
        const container = document.getElementById('properties-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const properties = this.getPlayerProperties();
        
        if (properties.length === 0) {
            container.innerHTML = '<p class="empty-message">You own no properties yet.</p>';
            return;
        }
        
        properties.forEach(property => {
            const propertyElement = this.createPropertyElement(property);
            container.appendChild(propertyElement);
        });
    },
    
    // Create property element
    createPropertyElement(property) {
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        const element = document.createElement('div');
        element.className = 'property-item';
        element.dataset.propertyId = property.id;
        
        element.innerHTML = `
            <div class="property-header">
                <span class="property-icon">${propertyType.icon}</span>
                <span class="property-name">${propertyType.name}</span>
                <span class="property-location">${location ? location.name : 'Unknown'}</span>
            </div>
            <div class="property-stats">
                <div class="property-stat">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${property.level}</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Condition:</span>
                    <span class="stat-value">${property.condition}%</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Income:</span>
                    <span class="stat-value">${this.calculatePropertyIncome(property)} gold/day</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Total Income:</span>
                    <span class="stat-value">${property.totalIncome} gold</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="property-action-btn" onclick="PropertySystem.showPropertyDetails('${property.id}')">Details</button>
                <button class="property-action-btn" onclick="PropertySystem.upgradePropertyLevel('${property.id}')">Upgrade</button>
                <button class="property-action-btn" onclick="PropertySystem.repairProperty('${property.id}')">Repair</button>
            </div>
        `;
        
        return element;
    },
    
    // Calculate property income with all modifiers
    calculatePropertyIncome(property) {
        const propertyType = this.propertyTypes[property.type];
        if (!propertyType) return 0;
        
        let income = propertyType.baseIncome;
        
        // Apply level multiplier
        income *= (1 + (property.level - 1) * 0.2);
        
        // Apply upgrade bonuses
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && upgrade.effects.incomeBonus) {
                income *= upgrade.effects.incomeBonus;
            }
        });
        
        // Apply condition modifier
        income *= (property.condition / 100);
        
        // Calculate maintenance and tax
        let maintenance = propertyType.maintenanceCost;
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && upgrade.effects.maintenanceReduction) {
                maintenance *= upgrade.effects.maintenanceReduction;
            }
        });
        
        const tax = Math.round(income * 0.1);
        const netIncome = Math.round(income - maintenance - tax);
        
        return Math.max(0, netIncome);
    },
    
    // Show property details
    showPropertyDetails(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        // Create details modal or panel
        const detailsHtml = `
            <div class="property-details">
                <h3>${propertyType.icon} ${propertyType.name} Details</h3>
                <div class="property-info">
                    <p><strong>Location:</strong> ${location ? location.name : 'Unknown'}</p>
                    <p><strong>Level:</strong> ${property.level}</p>
                    <p><strong>Condition:</strong> ${property.condition}%</p>
                    <p><strong>Purchase Price:</strong> ${property.purchasePrice} gold</p>
                    <p><strong>Total Income:</strong> ${property.totalIncome} gold</p>
                    <p><strong>Daily Income:</strong> ${this.calculatePropertyIncome(property)} gold</p>
                </div>
                <div class="property-upgrades">
                    <h4>Upgrades:</h4>
                    ${property.upgrades.length > 0 ?
                        property.upgrades.map(upgradeId => {
                            const upgrade = this.upgrades[upgradeId];
                            return `<span class="upgrade-tag">${upgrade.icon} ${upgrade.name}</span>`;
                        }).join('') :
                        '<p>No upgrades installed.</p>'
                    }
                </div>
                <div class="property-employees">
                    <h4>Employees:</h4>
                    ${property.employees.length > 0 ?
                        property.employees.map(empId => {
                            const employee = EmployeeSystem.getEmployee(empId);
                            return `<span class="employee-tag">${employee.name}</span>`;
                        }).join('') :
                        '<p>No employees assigned.</p>'
                    }
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage(`Viewing details for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);
    },
    
    // Upgrade property level
    upgradePropertyLevel(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        const propertyType = this.propertyTypes[property.type];
        const upgradeCost = Math.round(propertyType.basePrice * 0.5 * property.level);
        
        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold to upgrade this property!`);
            return false;
        }
        
        game.player.gold -= upgradeCost;
        property.level++;
        
        addMessage(`Upgraded ${propertyType.name} to level ${property.level} for ${upgradeCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    }
};

// Employee System
const EmployeeSystem = {
    // Employee types with their characteristics
    employeeTypes: {
        merchant: {
            id: 'merchant',
            name: 'Merchant',
            description: 'Skilled trader who boosts sales and profits.',
            baseWage: 15,
            skills: { trading: 3, negotiation: 2 },
            productivity: 1.2,
            icon: '🧑‍💼'
        },
        guard: {
            id: 'guard',
            name: 'Guard',
            description: 'Protects property from damage and theft.',
            baseWage: 10,
            skills: { combat: 2, perception: 1 },
            productivity: 1.0,
            damageReduction: 0.3,
            icon: '🗡️'
        },
        worker: {
            id: 'worker',
            name: 'Worker',
            description: 'General laborer for production and maintenance.',
            baseWage: 8,
            skills: { labor: 2 },
            productivity: 1.1,
            icon: '👷'
        },
        craftsman: {
            id: 'craftsman',
            name: 'Craftsman',
            description: 'Skilled artisan who produces high-quality goods.',
            baseWage: 18,
            skills: { crafting: 3, quality: 2 },
            productivity: 1.3,
            icon: '🔨'
        },
        farmer: {
            id: 'farmer',
            name: 'Farmer',
            description: 'Agricultural specialist for farms and food production.',
            baseWage: 12,
            skills: { farming: 3, harvesting: 2 },
            productivity: 1.25,
            icon: '🌾'
        },
        miner: {
            id: 'miner',
            name: 'Miner',
            description: 'Experienced miner for resource extraction.',
            baseWage: 20,
            skills: { mining: 3, strength: 2 },
            productivity: 1.2,
            icon: '⛏️'
        },
        manager: {
            id: 'manager',
            name: 'Manager',
            description: 'Improves efficiency and productivity of other employees.',
            baseWage: 25,
            skills: { management: 3, leadership: 2 },
            productivity: 1.0,
            efficiencyBonus: 1.2,
            icon: '👔'
        },
        apprentice: {
            id: 'apprentice',
            name: 'Apprentice',
            description: 'Learning worker with low wages but potential.',
            baseWage: 5,
            skills: { learning: 2 },
            productivity: 0.8,
            experienceGain: 1.5,
            icon: '🧑‍🎓'
        }
    },
    
    // Initialize employee system
    init() {
        if (!game.player.ownedEmployees) {
            game.player.ownedEmployees = [];
        }
        if (!game.player.employeeExpenses) {
            game.player.employeeExpenses = 0;
        }
        
        // Setup wage processing
        this.setupWageProcessing();
    },
    
    // Setup regular wage processing
    setupWageProcessing() {
        // Process wages every week
        let lastWageDay = -1;
        
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Check if a week has passed (every 7 days)
            if (TimeSystem.currentTime.day % 7 === 0 && TimeSystem.currentTime.day !== lastWageDay) {
                lastWageDay = TimeSystem.currentTime.day;
                EmployeeSystem.processWeeklyWages();
            }
            
            return result;
        };
    },
    
    // Get available employees in current location
    getAvailableEmployees() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return [];
        
        const availableEmployees = [];
        
        // Employee availability based on location type
        const locationEmployees = {
            village: ['worker', 'apprentice', 'farmer'],
            town: ['merchant', 'guard', 'worker', 'craftsman', 'farmer', 'apprentice'],
            city: ['merchant', 'guard', 'worker', 'craftsman', 'farmer', 'miner', 'manager', 'apprentice']
        };
        
        const employeeIds = locationEmployees[location.type] || locationEmployees.village;
        
        employeeIds.forEach(employeeId => {
            const employeeType = this.employeeTypes[employeeId];
            if (employeeType) {
                // Generate random employee variations
                const employee = this.generateEmployee(employeeId);
                availableEmployees.push(employee);
            }
        });
        
        return availableEmployees;
    },
    
    // Generate a random employee of given type
    generateEmployee(employeeId) {
        const employeeType = this.employeeTypes[employeeId];
        if (!employeeType) return null;
        
        const names = {
            male: ['John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher'],
            female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
        };
        
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        const firstName = names[gender][Math.floor(Math.random() * names[gender].length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: employeeId,
            name: `${firstName} ${surname}`,
            level: 1,
            experience: 0,
            morale: 75,
            productivity: employeeType.productivity,
            wage: employeeType.baseWage,
            skills: { ...employeeType.skills },
            assignedProperty: null,
            hireDate: TimeSystem.getTotalMinutes(),
            totalWagesPaid: 0,
            performance: 50
        };
    },
    
    // Hire employee
    hireEmployee(employeeId) {
        const employee = this.getAvailableEmployees().find(emp => emp.id === employeeId);
        if (!employee) {
            addMessage('Employee not available for hire!');
            return false;
        }
        
        if (game.player.gold < employee.wage * 7) { // Need 1 week wages upfront
            addMessage(`You need ${employee.wage * 7} gold to hire ${employee.name}!`);
            return false;
        }
        
        // Hire employee
        game.player.gold -= employee.wage * 7;
        game.player.ownedEmployees.push(employee);
        
        addMessage(`Hired ${employee.name} (${this.employeeTypes[employee.type].name}) for ${employee.wage} gold/week!`);
        
        // Update UI
        updatePlayerInfo();
        this.updateEmployeeDisplay();
        
        return true;
    },
    
    // Get player's employees
    getPlayerEmployees() {
        return game.player.ownedEmployees || [];
    },
    
    // Get employee by ID
    getEmployee(employeeId) {
        return game.player.ownedEmployees.find(emp => emp.id === employeeId);
    },
    
    // Assign employee to property
    assignEmployeeToProperty(employeeId, propertyId) {
        const employee = this.getEmployee(employeeId);
        const property = PropertySystem.getProperty(propertyId);
        
        if (!employee || !property) {
            addMessage('Invalid employee or property!');
            return false;
        }
        
        // Check if property has available slots
        const propertyType = PropertySystem.propertyTypes[property.type];
        const maxSlots = propertyType.workerSlots || 0;
        const currentSlots = property.employees.length;
        
        if (currentSlots >= maxSlots) {
            addMessage('Property has no available employee slots!');
            return false;
        }
        
        // Remove from previous property if assigned
        if (employee.assignedProperty) {
            const prevProperty = PropertySystem.getProperty(employee.assignedProperty);
            if (prevProperty) {
                prevProperty.employees = prevProperty.employees.filter(id => id !== employeeId);
            }
        }
        
        // Assign to new property
        employee.assignedProperty = propertyId;
        property.employees.push(employeeId);
        
        addMessage(`Assigned ${employee.name} to ${propertyType.name}!`);
        
        // Update displays
        this.updateEmployeeDisplay();
        PropertySystem.updatePropertyDisplay();
        
        return true;
    },
    
    // Process weekly wages
    processWeeklyWages() {
        if (!game.player.ownedEmployees || game.player.ownedEmployees.length === 0) return;
        
        let totalWages = 0;
        
        game.player.ownedEmployees.forEach(employee => {
            totalWages += employee.wage * 7; // Weekly wages
            employee.totalWagesPaid += employee.wage * 7;
            
            // Update morale based on wage satisfaction
            const wageSatisfaction = employee.wage / this.employeeTypes[employee.type].baseWage;
            if (wageSatisfaction >= 1.2) {
                employee.morale = Math.min(100, employee.morale + 5);
            } else if (wageSatisfaction < 0.8) {
                employee.morale = Math.max(0, employee.morale - 10);
            }
            
            // Experience gain
            employee.experience += 1;
            if (employee.experience >= employee.level * 100) {
                employee.level++;
                employee.experience = 0;
                addMessage(`${employee.name} has reached level ${employee.level}!`);
            }
        });
        
        // Deduct wages
        if (game.player.gold >= totalWages) {
            game.player.gold -= totalWages;
            game.player.employeeExpenses = totalWages;
            addMessage(`💸 Weekly wages paid: ${totalWages} gold`);
        } else {
            // Not enough gold for wages
            addMessage(`⚠️ Cannot pay wages! Employees may quit soon.`);
            
            // Reduce morale significantly
            game.player.ownedEmployees.forEach(employee => {
                employee.morale = Math.max(0, employee.morale - 20);
            });
        }
        
        // Check for employees quitting due to low morale
        this.checkEmployeeTurnover();
        
        // Update UI
        updatePlayerInfo();
        this.updateEmployeeDisplay();
    },
    
    // Check for employee turnover
    checkEmployeeTurnover() {
        if (!game.player.ownedEmployees) return;
        
        const employeesToKeep = [];
        
        game.player.ownedEmployees.forEach(employee => {
            // Employees with very low morale may quit
            if (employee.morale < 20 && Math.random() < 0.3) {
                addMessage(`${employee.name} has quit due to low morale!`);
                
                // Remove from assigned property
                if (employee.assignedProperty) {
                    const property = PropertySystem.getProperty(employee.assignedProperty);
                    if (property) {
                        property.employees = property.employees.filter(id => id !== employee.id);
                    }
                }
            } else {
                employeesToKeep.push(employee);
            }
        });
        
        game.player.ownedEmployees = employeesToKeep;
    },
    
    // Update employee display
    updateEmployeeDisplay() {
        const container = document.getElementById('employees-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const employees = this.getPlayerEmployees();
        
        if (employees.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no employees yet.</p>';
            return;
        }
        
        employees.forEach(employee => {
            const employeeElement = this.createEmployeeElement(employee);
            container.appendChild(employeeElement);
        });
    },
    
    // Create employee element
    createEmployeeElement(employee) {
        const employeeType = this.employeeTypes[employee.type];
        const assignedProperty = employee.assignedProperty ?
            PropertySystem.getProperty(employee.assignedProperty) : null;
        
        const element = document.createElement('div');
        element.className = 'employee-item';
        element.dataset.employeeId = employee.id;
        
        element.innerHTML = `
            <div class="employee-header">
                <span class="employee-icon">${employeeType.icon}</span>
                <span class="employee-name">${employee.name}</span>
                <span class="employee-type">${employeeType.name}</span>
            </div>
            <div class="employee-stats">
                <div class="employee-stat">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${employee.level}</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Morale:</span>
                    <span class="stat-value">${employee.morale}%</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Wage:</span>
                    <span class="stat-value">${employee.wage} gold/week</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Assigned:</span>
                    <span class="stat-value">${assignedProperty ? assignedProperty.type : 'None'}</span>
                </div>
            </div>
            <div class="employee-actions">
                <button class="employee-action-btn" onclick="EmployeeSystem.showEmployeeDetails('${employee.id}')">Details</button>
                <button class="employee-action-btn" onclick="EmployeeSystem.adjustWage('${employee.id}')">Adjust Wage</button>
                <button class="employee-action-btn" onclick="EmployeeSystem.fireEmployee('${employee.id}')">Fire</button>
            </div>
        `;
        
        return element;
    },
    
    // Show employee details
    showEmployeeDetails(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        const employeeType = this.employeeTypes[employee.type];
        const assignedProperty = employee.assignedProperty ?
            PropertySystem.getProperty(employee.assignedProperty) : null;
        
        // Create details display
        addMessage(`Employee: ${employee.name} (${employeeType.name}) - Level ${employee.level}, Morale ${employee.morale}%, Wage ${employee.wage} gold/week`);
    },
    
    // Adjust employee wage
    adjustWage(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        const newWage = prompt(`Enter new weekly wage for ${employee.name} (current: ${employee.wage}):`);
        if (!newWage) return;
        
        const wage = parseInt(newWage);
        if (isNaN(wage) || wage < 1) {
            addMessage('Invalid wage amount!');
            return;
        }
        
        employee.wage = wage;
        addMessage(`Adjusted ${employee.name}'s wage to ${wage} gold/week!`);
        
        // Update morale based on wage change
        const wageChange = wage - this.employeeTypes[employee.type].baseWage;
        if (wageChange > 0) {
            employee.morale = Math.min(100, employee.morale + 10);
        } else if (wageChange < -5) {
            employee.morale = Math.max(0, employee.morale - 15);
        }
        
        // Update UI
        this.updateEmployeeDisplay();
    },
    
    // Fire employee
    fireEmployee(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        if (!confirm(`Are you sure you want to fire ${employee.name}?`)) return;
        
        // Remove from assigned property
        if (employee.assignedProperty) {
            const property = PropertySystem.getProperty(employee.assignedProperty);
            if (property) {
                property.employees = property.employees.filter(id => id !== employee.id);
            }
        }
        
        // Remove from player's employees
        game.player.ownedEmployees = game.player.ownedEmployees.filter(emp => emp.id !== employeeId);
        
        addMessage(`Fired ${employee.name}!`);
        
        // Update UI
        this.updateEmployeeDisplay();
        PropertySystem.updatePropertyDisplay();
    }
};

// Initialize enhanced systems
document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory and trading systems after existing initialization
    setTimeout(() => {
        InventorySystem.init();
        TradingSystem.init();
        
        // Initialize new systems
        PropertySystem.init();
        EmployeeSystem.init();
        
        // Update displays
        InventorySystem.updateInventoryDisplay();
        TradingSystem.updateTradeHistoryDisplay();
        TradingSystem.updatePriceAlertsDisplay();
        PropertySystem.updatePropertyDisplay();
        EmployeeSystem.updateEmployeeDisplay();
    }, 100);
});