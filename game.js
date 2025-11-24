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
    worldStars: [],
    settings: {
        soundVolume: 0.7,
        musicVolume: 0.5,
        audio: {
            master: 0.8,
            music: 0.6,
            sfx: 0.75,
            ambient: 0.5,
            muted: false,
            musicMuted: false,
            sfxMuted: false,
            ambientEnabled: true
        },
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

        // Initialize notification system
        this.initNotificationSystem();

        // Initialize stats tracking
        StatsSystem.init();
        StatsSystem.updateFromGame();
        updateNavigationPanel();

        // Initialize PropertyEmployeeUI if it exists
        if (typeof PropertyEmployeeUI !== 'undefined') {
            PropertyEmployeeUI.init();
        }
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

        PerformanceMonitor.update(deltaTime);
        AdaptiveQualitySystem.track(deltaTime);

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
            
            // Update travel system
            if (typeof TravelSystem !== 'undefined') {
                TravelSystem.update();
            }
            
            // Check for city events
            if (this.currentLocation) {
                CityEventSystem.checkRandomEvents(this.currentLocation.id);
            }

            EnvironmentSystem.update(TimeSystem.getTimeInfo());

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

        const travelContext = typeof TravelSystem !== 'undefined' ? {
            isTraveling: TravelSystem.playerPosition?.isTraveling,
            travelProgress: TravelSystem.playerPosition?.travelProgress || 0,
            destination: TravelSystem.playerPosition?.destination?.name,
            transport: game.player?.currentTransportation || 'foot'
        } : {};

        AnimationSystem.update(deltaTime, {
            ...travelContext,
            inMarket: this.state === GameState.MARKET,
            marketName: this.currentLocation?.name,
            resting: game.player?.stats?.stamina <= 15
        });

        ControllerSupport.update(deltaTime);

        // Update UI
        this.updateUI();

        // Keep statistics fresh
        StatsSystem.updateFromGame();

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

        // Build star field once for visual depth
        if (!this.worldStars.length) {
            this.worldStars = Array.from({ length: 90 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.3
            }));
        }

        const timeInfo = TimeSystem.getTimeInfo();
        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, timeInfo.isNight ? '#050716' : '#1c3254');
        sky.addColorStop(0.6, timeInfo.isNight ? '#0a0d1c' : '#234769');
        sky.addColorStop(1, '#0b1422');

        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars for night scenes
        if (timeInfo.isNight || timeInfo.isEvening) {
            this.worldStars.forEach(star => {
                ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Ground/horizon layer
        const ground = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
        ground.addColorStop(0, '#132032');
        ground.addColorStop(1, '#0c141f');
        ctx.fillStyle = ground;
        ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

        // Soft glow to represent day/night ambiance
        ctx.fillStyle = timeInfo.isNight ? 'rgba(79, 195, 247, 0.08)' : 'rgba(255, 200, 120, 0.08)';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height * 0.55, 260, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        // Location and connections
        const currentLocation = GameWorld.locations[this.currentLocation?.id];
        const connections = currentLocation?.connections || [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 60;
        const ringRadius = 170;

        ctx.strokeStyle = 'rgba(79, 195, 247, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        const typeIcons = { city: '🏰', town: '🏘️', village: '🌾' };
        connections.forEach((connectionId, index) => {
            const destination = GameWorld.locations[connectionId];
            if (!destination) return;

            const angle = (index / Math.max(connections.length, 1)) * Math.PI * 2;
            const nodeX = centerX + Math.cos(angle) * ringRadius;
            const nodeY = centerY + Math.sin(angle) * ringRadius;

            ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(nodeX, nodeY);
            ctx.stroke();

            const visited = GameWorld.visitedLocations.includes(connectionId);
            ctx.fillStyle = visited ? '#7ee0ff' : '#4fc3f7';
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.stroke();

            ctx.font = '13px "Segoe UI", sans-serif';
            ctx.fillStyle = '#e7f0ff';
            ctx.textAlign = 'center';
            ctx.fillText(typeIcons[destination.type] || '📍', nodeX, nodeY - 16);
            ctx.fillText(destination.name, nodeX, nodeY + 22);
        });

        // Current location marker
        if (currentLocation) {
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff4c2';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#0a0f18';
            ctx.font = '15px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(currentLocation.name, centerX, centerY - 28);
            ctx.font = '12px "Segoe UI", sans-serif';
            ctx.fillText(currentLocation.description, centerX, centerY - 10);
        }

        // Draw active events
        const activeEvents = EventSystem.getActiveEvents();
        if (activeEvents.length > 0) {
            ctx.font = '12px "Segoe UI", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffaa00';
            let yOffset = 30;
            activeEvents.forEach(event => {
                ctx.fillText(`📢 ${event.name}`, canvas.width - 14, yOffset);
                yOffset += 18;
            });
        }

        // Draw time info + load indicator
        ctx.fillStyle = '#c8d6e8';
        ctx.font = '15px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(TimeSystem.getFormattedTime(), 12, 26);

        if (this.player) {
            const transport = transportationOptions[this.player.transportation];
            const capacity = transport?.carryCapacity || 1;
            const currentLoad = calculateCurrentLoad();
            const loadRatio = Math.min(currentLoad / capacity, 1);

            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(`💰 ${this.player.gold} gold`, 12, canvas.height - 46);
            ctx.fillText(`🎒 ${currentLoad}/${capacity} lbs`, 12, canvas.height - 28);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.strokeRect(12, canvas.height - 24, 180, 10);
            ctx.fillStyle = loadRatio > 0.8 ? '#ef5350' : '#81c784';
            ctx.fillRect(12, canvas.height - 24, 180 * loadRatio, 10);
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
            tradeRoutes: TradeRouteSystem.getTradeRoutes(),
            travelState: typeof TravelSystem !== 'undefined' ? TravelSystem.getState() : null
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

        if (this.settings?.audio && window.AudioSystem) {
            AudioSystem.applySettings({
                master: this.settings.audio.master,
                music: this.settings.audio.music,
                sfx: this.settings.audio.sfx,
                ambient: this.settings.audio.ambient,
                muted: this.settings.audio.muted,
                musicMuted: this.settings.audio.musicMuted,
                sfxMuted: this.settings.audio.sfxMuted,
                ambientEnabled: this.settings.audio.ambientEnabled
            });
        }
        
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
        
        // Restore travel system
        if (saveData.travelState && typeof TravelSystem !== 'undefined') {
            TravelSystem.loadState(saveData.travelState);
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

    initNotificationSystem() {
        NotificationCenter.init(elements.notificationTray);
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
        if (window.AudioSystem) {
            AudioSystem.playSfx('travelStart');
            AudioSystem.setTheme('travel');
        }

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
        StatsSystem.recordAction('travelCompleted', { locationId });

        addMessage(`✅ Arrived at ${destination.name}!`);
        if (window.AudioSystem) {
            AudioSystem.playSfx('arrival');
            updateAudioThemeForState(GameState.PLAYING);
        }
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
    statGold: null,
    statDays: null,
    statProperties: null,
    statEmployees: null,
    statLocations: null,
    achievementList: null,
    navigationConnections: null,
    navigationCurrentLocation: null,
    liveRegion: null,
    notificationTray: null,
    performanceOverlay: null,
    performanceFps: null,
    performanceFrame: null,
    performanceMemory: null,
    performanceQuality: null,
    screenFader: null,
    atmosphereLayer: null,
    environmentOverlay: null,
    highlightLayer: null,
    cinematicOverlay: null,
    cinematicLines: null,
    cinematicProgressFill: null,
    weatherLabel: null,
    seasonLabel: null,
    cycleLabel: null,
    atmosphereNote: null,
    animationState: null,
    animationMomentum: null,
    qualityLabel: null,
    controllerStatus: null,

    // Buttons
    newGameBtn: null,
    loadGameBtn: null,
    settingsBtn: null,
    inGameSettingsBtn: null,
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
    loadBtn: null,
    saveBtn: null,
    quickSaveBtn: null,
    quickLoadBtn: null,
    controlsHelpBtn: null,
    skipCinematicBtn: null,
    closeControlsHelpBtn: null,
    onboardingBtn: null,
    onboardingModal: null,
    onboardingPrevBtn: null,
    onboardingNextBtn: null,
    onboardingDoneBtn: null,
    onboardingProgress: null,
    onboardingProgressFill: null,
    skipOnboardingBtn: null,
    settingsModal: null,
    closeSettingsBtn: null,
    saveSettingsBtn: null,
    resetSettingsBtn: null,
    highContrastToggle: null,
    colorblindToggle: null,
    keyboardNavToggle: null,
    fontSizeRange: null,
    fontSizeLabel: null,
    masterVolumeRange: null,
    musicVolumeRange: null,
    sfxVolumeRange: null,
    ambientVolumeRange: null,
    masterVolumeLabel: null,
    musicVolumeLabel: null,
    sfxVolumeLabel: null,
    ambientVolumeLabel: null,
    muteToggle: null,
    musicMuteToggle: null,
    sfxMuteToggle: null,
    ambientToggle: null,
    cinematicToggle: null,
    minimalModeToggle: null,
    touchModeToggle: null,
    environmentQualitySelect: null,
    autoQualityToggle: null,
    statusBanner: null,
    controlsHelpOverlay: null,
    autosaveIndicator: null,
    lastSaveTime: null,
    loadingMessage: null,
    loadingProgressFill: null,
    
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

const AUTO_SAVE_INTERVAL = 180000; // 3 minutes
let autoSaveTimerId = null;
let loadingProgressTimer = null;

const SETTINGS_STORAGE_KEY = 'tradingGamePreferences';
const ONBOARDING_STORAGE_KEY = 'tradingGameOnboardingComplete';
const NARRATIVE_STORAGE_KEY = 'tradingGameNarrative';

const defaultControlBindings = {
    openInventory: 'I',
    openMarket: 'M',
    openTransportation: 'T',
    toggleMenu: 'Escape',
    quickSave: 'Ctrl+S',
    quickLoad: 'Ctrl+L',
    controlsHelp: 'Shift+/',
    saveGame: 'S',
    undoAction: 'Ctrl+Z',
    redoAction: 'Ctrl+Shift+Z'
};

const defaultPreferences = {
    highContrast: false,
    colorblind: false,
    keyboardNav: true,
    fontScale: 100,
    reducedMotion: false,
    flashWarnings: false,
    cinematicMode: true,
    minimalMode: false,
    touchMode: false,
    environmentQuality: 'high',
    autoQuality: true,
    dynamicWeather: true,
    highlightGuides: true,
    vfxQuality: 'high',
    particleDensity: 100,
    screenShake: 70,
    animationSpeed: 100,
    performanceOverlay: false,
    audio: {
        master: 80,
        music: 60,
        sfx: 75,
        ambient: 50,
        muted: false,
        musicMuted: false,
        sfxMuted: false,
        ambientEnabled: true
    },
    controlBindings: { ...defaultControlBindings },
    lastImmersive: null
};

let userPreferences = { ...defaultPreferences };
let onboardingStepIndex = 0;
let preferenceSaveTimer = null;

function deepClone(data) {
    if (typeof structuredClone === 'function') {
        return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
}

const ParticleSystem = {
    layer: null,
    init() {
        this.layer = document.getElementById('particle-layer');
    },
    spawnBurst(type = 'gold', options = {}) {
        if (!this.layer) return;

        const { count = 12, origin } = options;
        const density = (userPreferences?.particleDensity ?? 100) / 100;
        const qualityScale = userPreferences?.vfxQuality === 'low' ? 0.6 : userPreferences?.vfxQuality === 'medium' ? 0.85 : 1;
        const adjustedCount = Math.max(3, Math.round(count * density * qualityScale));
        const prefersCalm = userPreferences?.reducedMotion || userPreferences?.flashWarnings;
        if (prefersCalm && type === 'alert') return;
        const bounds = origin?.getBoundingClientRect();
        const originX = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
        const originY = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;

        for (let i = 0; i < adjustedCount; i++) {
            const particle = document.createElement('span');
            particle.className = `particle ${type}`;
            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            particle.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 120}px`);
            particle.style.animationDelay = `${Math.random() * 120}ms`;
            this.layer.appendChild(particle);

            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    },
    spawnResource(origin) {
        this.spawnBurst('resource', { count: 9, origin });
    }
};

const VisualEffectsSystem = {
    container: null,
    fader: null,
    init() {
        this.container = document.getElementById('game-container') || document.body;
        this.fader = document.getElementById('screen-fader');
    },
    shake(intensity = 8, duration = 420) {
        if (!this.container || userPreferences.reducedMotion) return;
        const preferenceScale = (userPreferences.screenShake ?? 70) / 100;
        const flashDampening = userPreferences.flashWarnings ? 0.6 : 1;
        const magnitude = Math.max(0, intensity * preferenceScale * flashDampening);
        if (magnitude <= 0.5) return;

        this.container.style.setProperty('--shake-intensity', `${magnitude}px`);
        this.container.style.setProperty('--shake-duration', `${duration}ms`);
        this.container.classList.remove('screen-shake');
        void this.container.offsetWidth; // restart animation
        this.container.classList.add('screen-shake');
        setTimeout(() => this.container.classList.remove('screen-shake'), duration + 50);
    },
    transition(callback) {
        if (!this.fader) {
            callback();
            return;
        }

        this.fader.classList.add('active');
        setTimeout(() => {
            callback();
            requestAnimationFrame(() => {
                this.fader.classList.remove('active');
            });
        }, 140);
    }
};

const EnvironmentSystem = {
    overlay: null,
    atmosphere: null,
    highlightLayer: null,
    weatherLabel: null,
    cycleLabel: null,
    seasonLabel: null,
    atmosphereNote: null,
    currentWeather: 'clear',
    currentSeason: 'spring',
    seasonClass: '',
    seasonNote: '',
    locationNote: '',
    locationClass: '',
    nextWeatherChange: 0,
    highlightMap: new Map(),
    init() {
        this.overlay = elements.environmentOverlay;
        this.atmosphere = elements.atmosphereLayer;
        this.highlightLayer = elements.highlightLayer;
        this.weatherLabel = elements.weatherLabel;
        this.cycleLabel = elements.cycleLabel;
        this.seasonLabel = elements.seasonLabel;
        this.atmosphereNote = elements.atmosphereNote;

        this.currentSeason = this.deriveSeason(TimeSystem.currentTime.month);
        this.scheduleNextWeather();
        this.applyLighting(TimeSystem.getTimeInfo());
        this.applySeason(this.currentSeason, { silent: true });
        this.applyWeather(this.currentWeather, { silent: true });
    },
    scheduleNextWeather() {
        const variance = Math.round(Math.random() * 120);
        this.nextWeatherChange = TimeSystem.getTotalMinutes() + 90 + variance;
    },
    deriveSeason(month = 1) {
        if ([12, 1, 2].includes(month)) return 'winter';
        if ([3, 4, 5].includes(month)) return 'spring';
        if ([6, 7, 8].includes(month)) return 'summer';
        return 'autumn';
    },
    applySeason(season, options = {}) {
        this.currentSeason = season;
        this.seasonClass = season;
        const label = season.charAt(0).toUpperCase() + season.slice(1);
        const seasonNotes = {
            spring: 'Spring caravans surge with fresh harvests.',
            summer: 'Summer heat swells demand for water and shade.',
            autumn: 'Autumn fairs promise exotic wares and coin.',
            winter: 'Winter snows slow caravans but raise fur prices.'
        };

        this.seasonNote = seasonNotes[season] || '';
        if (this.seasonLabel) {
            this.seasonLabel.textContent = label;
        }

        this.refreshOverlayClasses();
        if (!options.silent) {
            addMessage(`Season shifted to ${label}.`);
            NotificationCenter.show(`Season: ${label}`, 'info');
        }
        this.updateAtmosphereNote();
    },
    rollWeather() {
        const patterns = [
            { id: 'clear', weight: 3, label: 'Clear Skies' },
            { id: 'rain', weight: 2, label: 'Gentle Rain' },
            { id: 'snow', weight: 1, label: 'Snowfall' },
            { id: 'fog', weight: 1, label: 'Fog' },
            { id: 'sandstorm', weight: 0.5, label: 'Sandstorm' }
        ];

        if (!userPreferences.dynamicWeather) {
            return 'clear';
        }

        const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
        const roll = Math.random() * totalWeight;
        let accumulator = 0;
        for (const pattern of patterns) {
            accumulator += pattern.weight;
            if (roll <= accumulator) return pattern.id;
        }
        return 'clear';
    },
    applyWeather(type, options = {}) {
        this.currentWeather = type;
        const label = {
            clear: 'Clear Skies',
            rain: 'Gentle Rain',
            snow: 'Snowfall',
            fog: 'Fog Rolling In',
            sandstorm: 'Sandstorm'
        }[type] || 'Calm Skies';

        this.refreshOverlayClasses(type);

        if (this.weatherLabel) {
            this.weatherLabel.textContent = label;
        }

        if (!options.silent) {
            addMessage(`Weather shifted to ${label}.`);
            NotificationCenter.show(`Weather: ${label}`, 'info');
        }

        this.updateAtmosphereNote();
    },
    applyLocationAtmosphere(locationId) {
        const location = GameWorld.locations?.[locationId];
        if (!location) return;

        const regionMood = {
            starter: { note: 'Riverlands trade flows steady along the banks.', overlayClass: 'riverlands' },
            northern: { note: 'Highland winds bite; pack animals slow on ridges.', overlayClass: 'highlands' },
            eastern: { note: 'Spiced sea breeze hints at eastern luxuries.', overlayClass: 'port' },
            western: { note: 'Dusty frontier roads reward hardy caravans.', overlayClass: 'desert' },
            southern: { note: 'Sun-baked dunes shimmer with merchant banners.', overlayClass: 'desert' },
            capital: { note: 'The capital watches; nobles judge every bargain.', overlayClass: 'riverlands' }
        };

        const mood = regionMood[location.region] || { note: '', overlayClass: '' };
        this.locationNote = mood.note;
        this.locationClass = mood.overlayClass;
        this.refreshOverlayClasses();
        this.updateAtmosphereNote();
    },
    applyLighting(timeInfo) {
        if (!timeInfo) return;

        const { hour, minute } = timeInfo;
        const progress = hour + minute / 60;
        let cycle = 'Daylight';
        if (progress < 6) cycle = 'Night';
        else if (progress < 9) cycle = 'Dawn';
        else if (progress < 17) cycle = 'Daylight';
        else if (progress < 20) cycle = 'Golden Hour';
        else cycle = 'Nightfall';

        const dimming = cycle === 'Night' || cycle === 'Nightfall' ? 0.65 : cycle === 'Golden Hour' ? 0.45 : 0.3;
        const saturationBase = userPreferences.environmentQuality === 'high' ? 1.1 : 0.95;
        const seasonalShift = this.currentSeason === 'winter' ? 0.92 : this.currentSeason === 'autumn' ? 1.02 : 1;
        const saturation = saturationBase * seasonalShift;

        if (this.cycleLabel) {
            this.cycleLabel.textContent = cycle;
        }

        if (this.atmosphere) {
            this.atmosphere.style.opacity = 0.2 + (dimming / 2);
            this.atmosphere.style.filter = `saturate(${saturation})`;
        }

        document.body.classList.toggle('night-cycle', cycle === 'Night' || cycle === 'Nightfall');
        this.updateAtmosphereNote();
    },
    update(timeInfo) {
        this.applyLighting(timeInfo);

        const season = this.deriveSeason(timeInfo.month);
        if (season !== this.currentSeason) {
            this.applySeason(season);
        }

        if (userPreferences.dynamicWeather && TimeSystem.getTotalMinutes() >= this.nextWeatherChange) {
            const nextWeather = this.rollWeather();
            this.applyWeather(nextWeather);
            this.scheduleNextWeather();
        }

        this.refreshHighlights();
    },
    nudgeElement(element, note = 'Interact here') {
        if (!element || !userPreferences.highlightGuides) return;

        this.highlightMap.set(element, Date.now() + 4200);
        element.classList.add('pulse-highlight');
        this.updateAtmosphereNote(note);
        this.refreshHighlights();

        setTimeout(() => this.clearHighlight(element), 4200);
    },
    clearHighlight(element) {
        if (!element) return;
        element.classList.remove('pulse-highlight');
        this.highlightMap.delete(element);
        this.refreshHighlights();
    },
    refreshHighlights() {
        const now = Date.now();
        for (const [element, expiry] of this.highlightMap.entries()) {
            if (expiry <= now) {
                element.classList.remove('pulse-highlight');
                this.highlightMap.delete(element);
            }
        }

        if (this.highlightLayer) {
            this.highlightLayer.style.opacity = this.highlightMap.size ? 0.32 : 0;
        }

        if (!this.highlightMap.size) {
            this.updateAtmosphereNote();
        }
    },
    updateAtmosphereNote(custom) {
        if (!this.atmosphereNote) return;
        if (custom) {
            this.atmosphereNote.textContent = custom;
            return;
        }

        const weatherText = {
            clear: 'Atmosphere steady and safe.',
            rain: 'Rain boosts crop yields and slows caravans.',
            snow: 'Snow cools tempers and travel speed.',
            fog: 'Fog hides both threats and opportunities.',
            sandstorm: 'Sandstorm reduces visibility and morale.'
        }[this.currentWeather] || 'Atmosphere steady and safe.';

        const fragments = [weatherText, this.locationNote, this.seasonNote].filter(Boolean);
        this.atmosphereNote.textContent = fragments.join(' ');
    },
    refreshOverlayClasses(weatherType = this.currentWeather) {
        if (!this.overlay) return;
        this.overlay.className = 'environment-overlay';
        if (this.seasonClass) this.overlay.classList.add(this.seasonClass);
        if (this.locationClass) this.overlay.classList.add(this.locationClass);
        if (weatherType) this.overlay.classList.add(weatherType);
        this.overlay.style.opacity = userPreferences.environmentQuality === 'low' ? 0.16 : '';
    }
};

const AnimationSystem = {
    avatar: null,
    stateDisplay: null,
    momentumDisplay: null,
    activeState: 'idle',
    activeDetail: '',
    momentum: 0,
    lastUpdate: 0,
    init() {
        this.avatar = elements.characterAvatar;
        this.stateDisplay = elements.animationState;
        this.momentumDisplay = elements.animationMomentum;
        this.setState('idle', { reason: 'Awaiting orders' });
    },
    setState(state, meta = {}) {
        this.activeState = state;
        this.activeDetail = meta.reason || meta.destination || meta.context || '';
        this.lastUpdate = performance.now();
        if (this.avatar) {
            this.avatar.dataset.state = state;
            if (meta.context) {
                this.avatar.dataset.action = meta.context;
            }
        }
        this.refreshLabels(meta);
    },
    refreshLabels(meta = {}) {
        if (this.stateDisplay) {
            const detail = meta.destination || meta.reason || this.activeDetail;
            this.stateDisplay.textContent = detail ? `${this.prettyState()} • ${detail}` : this.prettyState();
        }
        if (this.momentumDisplay) {
            const level = this.describeMomentum();
            this.momentumDisplay.textContent = level;
        }
    },
    describeMomentum() {
        if (this.momentum > 0.8) return 'Adrenaline';
        if (this.momentum > 0.5) return 'Engaged';
        if (this.momentum > 0.2) return 'Alert';
        return 'Stable';
    },
    prettyState() {
        return {
            idle: 'Idle',
            travel: 'On the road',
            trade: 'Trading',
            combat: 'In danger',
            rest: 'Recovering'
        }[this.activeState] || this.activeState;
    },
    registerBeat(amount = 0.1) {
        this.momentum = Math.min(1, this.momentum + amount);
    },
    update(deltaTime, context = {}) {
        if (!this.avatar && elements.characterAvatar) {
            this.avatar = elements.characterAvatar;
        }

        // Natural momentum decay
        this.momentum = Math.max(0, this.momentum - deltaTime / 12000);

        if (context.isTraveling) {
            this.setState('travel', { destination: context.destination || 'En route', context: context.transport || 'travel' });
            this.momentum = Math.max(this.momentum, Math.min(1, context.travelProgress + 0.25));
        } else if (context.inMarket) {
            this.setState('trade', { reason: context.marketName || 'Market focus', context: 'trade' });
            this.registerBeat(0.05);
        } else if (context.resting) {
            this.setState('rest', { reason: 'Recovering', context: 'rest' });
        } else if (this.activeState !== 'idle') {
            this.setState('idle', { reason: 'Ready' });
        } else {
            this.refreshLabels();
        }
    }
};

const AdaptiveQualitySystem = {
    lastAdjust: 0,
    window: [],
    maxSamples: 120,
    init() {
        this.lastAdjust = performance.now();
    },
    track(deltaTime) {
        if (!userPreferences.autoQuality) return;
        this.window.push(deltaTime);
        if (this.window.length > this.maxSamples) {
            this.window.shift();
        }
        const now = performance.now();
        if (now - this.lastAdjust < 4000) return;
        this.lastAdjust = now;
        const averageFrame = this.window.reduce((a, b) => a + b, 0) / this.window.length;
        const fps = 1000 / Math.max(1, averageFrame);
        if (fps < 45 && userPreferences.environmentQuality !== 'low') {
            userPreferences.environmentQuality = 'medium';
            if (fps < 35) {
                userPreferences.environmentQuality = 'low';
                userPreferences.particleDensity = Math.max(40, userPreferences.particleDensity - 20);
            }
            applyPreferences();
            addMessage('Performance guard lowered fidelity to keep things smooth.', 'info');
        } else if (fps > 65 && userPreferences.environmentQuality === 'low') {
            userPreferences.environmentQuality = 'medium';
            applyPreferences();
        } else if (fps > 75 && userPreferences.environmentQuality === 'medium') {
            userPreferences.environmentQuality = 'high';
            applyPreferences();
        }
    }
};

const ControllerSupport = {
    connectedGamepad: null,
    lastButtonState: new Map(),
    hapticsEnabled: true,
    pollInterval: 120,
    lastPoll: 0,
    init() {
        window.addEventListener('gamepadconnected', (event) => {
            this.connectedGamepad = event.gamepad;
            this.updateStatusLabel();
            this.tryHaptics(0.3, 100);
            addMessage(`Controller connected: ${event.gamepad.id}`, 'success');
        });
        window.addEventListener('gamepaddisconnected', () => {
            this.connectedGamepad = null;
            this.updateStatusLabel();
            addMessage('Controller disconnected', 'warning');
        });
    },
    updateStatusLabel() {
        if (elements.controllerStatus) {
            elements.controllerStatus.textContent = this.connectedGamepad ? `Controller: ${this.connectedGamepad.id}` : 'Controller: None';
        }
    },
    update(deltaTime) {
        if (!this.connectedGamepad) return;
        this.lastPoll += deltaTime;
        if (this.lastPoll < this.pollInterval) return;
        this.lastPoll = 0;

        const pad = navigator.getGamepads()[this.connectedGamepad.index];
        if (!pad) return;

        const buttons = [pad.buttons[0], pad.buttons[1], pad.buttons[2], pad.buttons[3]];
        const mapping = [
            () => openMarket(),
            () => toggleMenu(),
            () => saveGame(),
            () => openInventory()
        ];

        buttons.forEach((button, index) => {
            const pressedBefore = this.lastButtonState.get(index);
            if (button?.pressed && !pressedBefore) {
                mapping[index]?.();
                this.tryHaptics(0.45, 60);
            }
            this.lastButtonState.set(index, button?.pressed);
        });
    },
    tryHaptics(intensity = 0.4, duration = 80) {
        const pad = this.connectedGamepad || (navigator.getGamepads ? navigator.getGamepads()[0] : null);
        const actuator = pad?.vibrationActuator;
        if (actuator?.type === 'dual-rumble') {
            actuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration,
                weakMagnitude: intensity,
                strongMagnitude: Math.min(1, intensity + 0.1)
            }).catch(() => {});
        }
    }
};

const PerformanceMonitor = {
    enabled: false,
    smoothFrame: 16,
    init() {
        this.overlay = elements.performanceOverlay;
        this.fpsEl = elements.performanceFps;
        this.frameEl = elements.performanceFrame;
        this.memoryEl = elements.performanceMemory;
        this.qualityEl = elements.performanceQuality;
        this.setEnabled(this.enabled);
    },
    setEnabled(value) {
        this.enabled = value;
        if (this.overlay) {
            this.overlay.classList.toggle('hidden', !value);
        }
    },
    update(deltaTime) {
        if (!this.enabled || !this.overlay || this.overlay.classList.contains('hidden')) return;
        this.smoothFrame = this.smoothFrame * 0.9 + deltaTime * 0.1;
        const fps = Math.round(1000 / Math.max(1, this.smoothFrame));
        if (this.fpsEl) this.fpsEl.textContent = fps.toString();
        if (this.frameEl) this.frameEl.textContent = `${Math.round(this.smoothFrame)} ms`;

        if (this.qualityEl) {
            const quality = userPreferences.environmentQuality || 'medium';
            const density = userPreferences.particleDensity || 100;
            this.qualityEl.textContent = `${quality.charAt(0).toUpperCase() + quality.slice(1)} • ${density}%`;
        }

        if (performance && performance.memory && this.memoryEl) {
            const mb = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.memoryEl.textContent = `${mb.toFixed(1)} MB`;
        }
    }
};

const UndoRedoManager = {
    undoStack: [],
    redoStack: [],
    maxHistory: 20,
    record(reason = 'state change') {
        const snapshot = deepClone(game.saveState());
        this.undoStack.push(snapshot);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack.length = 0;
    },
    undo() {
        if (!this.undoStack.length) {
            addMessage('Nothing to undo yet.');
            return;
        }

        const current = deepClone(game.saveState());
        this.redoStack.push(current);
        const previous = this.undoStack.pop();
        this.applySnapshot(previous, 'Action undone');
    },
    redo() {
        if (!this.redoStack.length) {
            addMessage('Nothing to redo yet.');
            return;
        }

        const current = deepClone(game.saveState());
        this.undoStack.push(current);
        const restored = this.redoStack.pop();
        this.applySnapshot(restored, 'Action redone');
    },
    applySnapshot(snapshot, bannerText) {
        game.loadState(snapshot);
        updatePlayerInfo();
        updateLocationInfo();
        updateMarketDisplay();
        updateInventoryDisplay();
        updateNavigationPanel();
        updateCurrentLoad();
        StatsSystem.updateFromGame();
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.loadState(snapshot.travelState || {});
            TravelSystem.render?.();
            TravelSystem.updateTravelUI?.();
        }
        showStatusBanner(bannerText, 'info');
    }
};

const StatsSystem = {
    data: {
        gold: 0,
        daysSurvived: 0,
        marketsVisited: 0,
        inventoriesOpened: 0,
        travelsCompleted: 0,
        propertiesOwned: 0,
        employeesHired: 0,
        saves: 0,
        uniqueLocations: new Set()
    },
    achievements: [
        { id: 'getting-started', title: 'Getting Started', description: 'Open the market once.', key: 'marketsVisited', target: 1 },
        { id: 'traveler', title: 'Trailblazer', description: 'Complete 3 journeys.', key: 'travelsCompleted', target: 3 },
        { id: 'landed', title: 'Landowner', description: 'Own at least one property.', key: 'propertiesOwned', target: 1 },
        { id: 'leader', title: 'People Manager', description: 'Hire your first employee.', key: 'employeesHired', target: 1 },
        { id: 'wealthy', title: 'Wealthy Merchant', description: 'Hold 500 gold at once.', key: 'gold', target: 500 },
        { id: 'seasoned', title: 'Seasoned Adventurer', description: 'Survive 5 in-game days.', key: 'daysSurvived', target: 5 }
    ],
    init() {
        this.reset();
    },
    reset() {
        this.data = {
            gold: 0,
            daysSurvived: 0,
            marketsVisited: 0,
            inventoriesOpened: 0,
            travelsCompleted: 0,
            propertiesOwned: 0,
            employeesHired: 0,
            saves: 0,
            uniqueLocations: new Set()
        };
        this.renderAchievements();
        this.updateUI();
    },
    recordAction(action, payload = {}) {
        switch (action) {
            case 'marketOpened':
                this.data.marketsVisited++;
                break;
            case 'inventoryOpened':
                this.data.inventoriesOpened++;
                break;
            case 'travelCompleted':
                this.data.travelsCompleted++;
                if (payload.locationId) {
                    this.data.uniqueLocations.add(payload.locationId);
                }
                break;
            case 'propertyPurchased':
                this.data.propertiesOwned++;
                break;
            case 'employeeHired':
                this.data.employeesHired++;
                break;
            case 'save':
                this.data.saves++;
                break;
            default:
                break;
        }

        this.updateUI();
    },
    updateFromGame() {
        if (game.player) {
            this.data.gold = game.player.gold || 0;
            this.data.propertiesOwned = (game.player.ownedProperties || []).length;
            this.data.employeesHired = (game.player.ownedEmployees || []).length;
        }

        this.data.daysSurvived = TimeSystem.currentTime.day || 0;

        if (GameWorld && GameWorld.visitedLocations) {
            GameWorld.visitedLocations.forEach(loc => this.data.uniqueLocations.add(loc));
        }

        this.updateUI();
    },
    updateUI() {
        if (elements.statGold) {
            elements.statGold.textContent = `${this.data.gold}`;
        }
        if (elements.statDays) {
            elements.statDays.textContent = `${this.data.daysSurvived}`;
        }
        if (elements.statProperties) {
            elements.statProperties.textContent = `${this.data.propertiesOwned}`;
        }
        if (elements.statEmployees) {
            elements.statEmployees.textContent = `${this.data.employeesHired}`;
        }
        if (elements.statLocations) {
            elements.statLocations.textContent = `${this.data.uniqueLocations.size}`;
        }

        this.renderAchievements();
    },
    renderAchievements() {
        if (!elements.achievementList) return;

        elements.achievementList.innerHTML = '';

        this.achievements.forEach((achievement) => {
            const value = achievement.key === 'uniqueLocations' ? this.data.uniqueLocations.size : (this.data[achievement.key] || 0);
            const progress = Math.min(1, value / achievement.target);
            const card = document.createElement('div');
            card.className = `achievement-card ${progress >= 1 ? 'completed' : ''}`;
            card.innerHTML = `
                <h5 class="achievement-title">${achievement.title}</h5>
                <p class="achievement-desc">${achievement.description}</p>
                <div class="achievement-progress" aria-label="${achievement.title} progress">
                    <div class="fill" style="width: ${progress * 100}%"></div>
                </div>
                <small>${Math.floor(progress * 100)}% complete</small>
            `;
            elements.achievementList.appendChild(card);
        });
    }
};

const NotificationCenter = {
    tray: null,
    init(trayElement) {
        this.tray = trayElement;
    },
    show(message, type = 'info') {
        if (!this.tray) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.tray.appendChild(toast);

        setTimeout(() => toast.classList.add('hide'), 3200);
        setTimeout(() => toast.remove(), 3600);
    }
};

const CinematicDirector = {
    overlay: null,
    lines: null,
    progressFill: null,
    skipButton: null,
    active: false,
    progressTimer: null,
    recordedMoments: new Set(),
    sequences: {
        departure: {
            title: 'Departure',
            tone: 360,
            duration: 4800,
            lines: ({ from, to, escort, weather }) => [
                `Wagons break from ${from || 'camp'}, lanterns flickering in the ${weather || 'dawn'} haze.`,
                `${escort || 'Guild outriders'} fan out, mapping safe lanes toward ${to || 'the frontier'}.`,
                'Supplies are checked, contracts sealed, and every wheel squeaks with intent.'
            ]
        },
        arrival: {
            title: 'Arrival',
            tone: 520,
            duration: 4200,
            lines: ({ location, welcome, cargo }) => [
                `${location || 'The new city'} unveils itself with banners and shouted greetings.`,
                `${welcome || 'Harbor bells'} answer the caravan horns as gates swing wide.`,
                `Tally clerks swarm to audit ${cargo || 'stacked crates'} while locals peer at the newcomers.`
            ]
        },
        market: {
            title: 'Market Reveal',
            tone: 440,
            duration: 3800,
            lines: ({ location, reputation }) => [
                `${location || 'The grand bazaar'} breathes in incense, steel, and murmured deals.`,
                `Patrons glance at your sigil${reputation ? `—${reputation}` : ''}, weighing coin versus curiosity.`,
                'Stalls ignite with color as traders pitch secrets of distant roads.'
            ]
        },
        bossEvent: {
            title: 'Nemesis Approaches',
            tone: 220,
            duration: 5200,
            lines: ({ name, threat }) => [
                `${name || 'The Guildmaster'} steps from the shadow of a standard, voice low.`,
                `${threat || 'A silent escort draws steel, promising negotiation or ruin.'}`,
                'Your caravan steadies—the next choice defines its legend.'
            ]
        }
    },

    init() {
        this.overlay = elements.cinematicOverlay;
        this.lines = elements.cinematicLines;
        this.progressFill = elements.cinematicProgressFill;
        this.skipButton = elements.skipCinematicBtn;

        if (this.skipButton) {
            this.skipButton.addEventListener('click', () => this.finishSequence('Skipped'));
        }
    },

    playSequence(key, context = {}) {
        if (!userPreferences.cinematicMode || userPreferences.minimalMode) return;
        if (!this.overlay || !this.lines || !this.progressFill) return;

        const sequence = this.sequences[key];
        if (!sequence) return;

        this.stop();
        this.active = true;
        this.overlay.classList.remove('hidden');

        const titleEl = this.overlay.querySelector('.cinematic-title');
        if (titleEl) {
            titleEl.textContent = sequence.title;
        }

        this.lines.innerHTML = '';
        const lines = sequence.lines(context);
        lines.forEach((line, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'line';
            lineEl.style.animationDelay = `${index * 140}ms`;
            lineEl.textContent = line;
            this.lines.appendChild(lineEl);
        });

        if (AudioSystem?.initialized) {
            AudioSystem.playTone({
                frequency: sequence.tone,
                duration: 0.6,
                type: 'sine',
                destination: AudioSystem.musicGain,
                gain: 0.85
            });
        }

        const duration = sequence.duration || 4200;
        let elapsed = 0;
        this.progressFill.style.width = '0%';
        this.progressTimer = setInterval(() => {
            elapsed += 120;
            this.progressFill.style.width = `${Math.min(100, (elapsed / duration) * 100)}%`;
            if (elapsed >= duration) {
                this.finishSequence();
            }
        }, 120);

        if (context.milestoneId) {
            this.recordedMoments.add(context.milestoneId);
        }
    },

    finishSequence(reason = 'Complete') {
        this.stop();
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        showStatusBanner(`Cinematic ${reason.toLowerCase()}`);
    },

    stop() {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
        this.active = false;
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
    }
};

const NarrativeSystem = {
    arcs: [],
    progress: {},

    init() {
        this.arcs = [
            {
                id: 'guild_rising',
                title: 'Guild Rising',
                narrator: 'Archive Master Lysa',
                milestones: [
                    { id: 'first_departure', trigger: 'travelStart', description: 'Leave the capital with purpose.', cinematic: 'departure' },
                    { id: 'first_arrival', trigger: 'arrival', description: 'Arrive safely with your manifest intact.', cinematic: 'arrival' },
                    { id: 'market_reveal', trigger: 'marketEnter', description: 'Break into a bustling market and claim space.', cinematic: 'market' }
                ]
            },
            {
                id: 'shadow_cinder',
                title: 'Caravan of Cinders',
                narrator: 'The Whispered Ledger',
                milestones: [
                    { id: 'dangerous_route', trigger: 'travelStart', description: 'Choose a risky route at dusk.', cinematic: 'bossEvent' },
                    { id: 'boss_standoff', trigger: 'arrival', description: 'Face down a rival envoy demanding tribute.', cinematic: 'bossEvent' }
                ]
            }
        ];

        try {
            const stored = localStorage.getItem(NARRATIVE_STORAGE_KEY);
            if (stored) {
                this.progress = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load narrative state', error);
            this.progress = {};
        }
    },

    save() {
        try {
            localStorage.setItem(NARRATIVE_STORAGE_KEY, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save narrative state', error);
        }
    },

    recordEvent(trigger, context = {}) {
        this.arcs.forEach((arc) => {
            arc.milestones
                .filter(milestone => milestone.trigger === trigger)
                .forEach((milestone) => {
                    const progressKey = `${arc.id}:${milestone.id}`;
                    if (this.progress[progressKey]) return;

                    this.progress[progressKey] = {
                        completedAt: Date.now(),
                        context
                    };
                    this.save();

                    const narration = `${arc.narrator}: ${milestone.description}`;
                    addMessage(narration, 'info');
                    NotificationCenter.show(`${arc.title}: ${milestone.description}`, 'info');

                    if (milestone.cinematic) {
                        CinematicDirector.playSequence(milestone.cinematic, {
                            ...context,
                            milestoneId: progressKey
                        });
                    }
                });
        });
    }
};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    VisualEffectsSystem.init();
    ParticleSystem.init();
    EnvironmentSystem.init();
    AnimationSystem.init();
    AdaptiveQualitySystem.init();
    loadPreferencesFromStorage();
    CinematicDirector.init();
    NarrativeSystem.init();
    PerformanceMonitor.init();
    ControllerSupport.init();
    setupEventListeners();
    initializeOnboarding();
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
    elements.statGold = document.getElementById('stat-gold');
    elements.statDays = document.getElementById('stat-days');
    elements.statProperties = document.getElementById('stat-properties');
    elements.statEmployees = document.getElementById('stat-employees');
    elements.statLocations = document.getElementById('stat-locations');
    elements.achievementList = document.getElementById('achievement-list');
    elements.navigationConnections = document.getElementById('nav-connections');
    elements.navigationCurrentLocation = document.getElementById('nav-current-location');
    elements.liveRegion = document.getElementById('live-region');
    elements.notificationTray = document.getElementById('notification-tray');
    elements.performanceOverlay = document.getElementById('performance-overlay');
    elements.performanceFps = document.getElementById('perf-fps');
    elements.performanceFrame = document.getElementById('perf-frame');
    elements.performanceMemory = document.getElementById('perf-memory');
    elements.performanceQuality = document.getElementById('perf-quality');
    elements.screenFader = document.getElementById('screen-fader');
    elements.atmosphereLayer = document.getElementById('atmosphere-layer');
    elements.environmentOverlay = document.getElementById('environment-overlay');
    elements.highlightLayer = document.getElementById('highlight-layer');
    elements.weatherLabel = document.getElementById('weather-label');
    elements.seasonLabel = document.getElementById('season-label');
    elements.cycleLabel = document.getElementById('cycle-label');
    elements.atmosphereNote = document.getElementById('atmosphere-note');
    elements.animationState = document.getElementById('animation-state');
    elements.animationMomentum = document.getElementById('animation-momentum');
    elements.qualityLabel = document.getElementById('quality-label');
    elements.controllerStatus = document.getElementById('controller-status');
    elements.cinematicOverlay = document.getElementById('cinematic-overlay');
    elements.cinematicLines = document.getElementById('cinematic-lines');
    elements.cinematicProgressFill = document.getElementById('cinematic-progress-fill');
    
    // Buttons
    elements.newGameBtn = document.getElementById('new-game-btn');
    elements.loadGameBtn = document.getElementById('load-game-btn');
    elements.settingsBtn = document.getElementById('settings-btn');
    elements.inGameSettingsBtn = document.getElementById('in-game-settings-btn');
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
    elements.loadBtn = document.getElementById('load-btn');
    elements.saveBtn = document.getElementById('save-btn');
    elements.quickSaveBtn = document.getElementById('quick-save-btn');
    elements.quickLoadBtn = document.getElementById('quick-load-btn');
    elements.undoBtn = document.getElementById('undo-btn');
    elements.redoBtn = document.getElementById('redo-btn');
    elements.controlsHelpBtn = document.getElementById('controls-help-btn');
    elements.skipCinematicBtn = document.getElementById('skip-cinematic-btn');
    elements.closeControlsHelpBtn = document.getElementById('close-controls-help');
    elements.onboardingBtn = document.getElementById('onboarding-btn');
    elements.onboardingModal = document.getElementById('onboarding-modal');
    elements.onboardingPrevBtn = document.getElementById('onboarding-prev-btn');
    elements.onboardingNextBtn = document.getElementById('onboarding-next-btn');
    elements.onboardingDoneBtn = document.getElementById('onboarding-done-btn');
    elements.onboardingProgress = document.querySelector('.onboarding-progress');
    elements.onboardingProgressFill = document.querySelector('.onboarding-progress-fill');
    elements.skipOnboardingBtn = document.getElementById('skip-onboarding-btn');
    elements.settingsModal = document.getElementById('settings-modal');
    elements.closeSettingsBtn = document.getElementById('close-settings-btn');
    elements.saveSettingsBtn = document.getElementById('save-settings-btn');
    elements.resetSettingsBtn = document.getElementById('reset-settings-btn');
    elements.highContrastToggle = document.getElementById('high-contrast-toggle');
    elements.colorblindToggle = document.getElementById('colorblind-toggle');
    elements.keyboardNavToggle = document.getElementById('keyboard-nav-toggle');
    elements.fontSizeRange = document.getElementById('font-size-range');
    elements.fontSizeLabel = document.getElementById('font-size-label');
    elements.masterVolumeRange = document.getElementById('master-volume-range');
    elements.musicVolumeRange = document.getElementById('music-volume-range');
    elements.sfxVolumeRange = document.getElementById('sfx-volume-range');
    elements.ambientVolumeRange = document.getElementById('ambient-volume-range');
    elements.masterVolumeLabel = document.getElementById('master-volume-label');
    elements.musicVolumeLabel = document.getElementById('music-volume-label');
    elements.sfxVolumeLabel = document.getElementById('sfx-volume-label');
    elements.ambientVolumeLabel = document.getElementById('ambient-volume-label');
    elements.muteToggle = document.getElementById('mute-toggle');
    elements.musicMuteToggle = document.getElementById('music-mute-toggle');
    elements.sfxMuteToggle = document.getElementById('sfx-mute-toggle');
    elements.ambientToggle = document.getElementById('ambient-toggle');
    elements.cinematicToggle = document.getElementById('cinematic-toggle');
    elements.minimalModeToggle = document.getElementById('minimal-mode-toggle');
    elements.touchModeToggle = document.getElementById('touch-mode-toggle');
    elements.reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    elements.flashWarningToggle = document.getElementById('flash-warning-toggle');
    elements.vfxQualitySelect = document.getElementById('vfx-quality-select');
    elements.particleDensityRange = document.getElementById('particle-density-range');
    elements.particleDensityLabel = document.getElementById('particle-density-label');
    elements.screenShakeRange = document.getElementById('screen-shake-range');
    elements.screenShakeLabel = document.getElementById('screen-shake-label');
    elements.animationSpeedRange = document.getElementById('animation-speed-range');
    elements.animationSpeedLabel = document.getElementById('animation-speed-label');
    elements.environmentQualitySelect = document.getElementById('environment-quality-select');
    elements.performanceOverlayToggle = document.getElementById('performance-overlay-toggle');
    elements.autoQualityToggle = document.getElementById('auto-quality-toggle');
    elements.settingsTabs = Array.from(document.querySelectorAll('.settings-tab'));
    elements.statusBanner = document.getElementById('status-banner');
    elements.controlsHelpOverlay = document.getElementById('controls-help-overlay');
    elements.autosaveIndicator = document.getElementById('autosave-indicator');
    elements.lastSaveTime = document.getElementById('last-save-time');
    elements.loadingMessage = document.getElementById('loading-message');
    elements.loadingProgressFill = document.getElementById('loading-progress-fill');
    elements.controlBindingInputs = Array.from(document.querySelectorAll('.control-binding-input'));
    elements.resetBindingsBtn = document.getElementById('reset-bindings-btn');
    elements.bindingHint = document.getElementById('binding-hint');
    elements.openTravelFromNav = document.getElementById('open-travel-from-nav');
    
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
    elements.loadBtn.addEventListener('click', () => loadGame());
    elements.saveBtn.addEventListener('click', saveGame);
    elements.quickSaveBtn.addEventListener('click', saveGame);
    elements.quickLoadBtn.addEventListener('click', () => loadGame());
    if (elements.undoBtn) {
        elements.undoBtn.addEventListener('click', () => UndoRedoManager.undo());
    }
    if (elements.redoBtn) {
        elements.redoBtn.addEventListener('click', () => UndoRedoManager.redo());
    }
    elements.controlsHelpBtn.addEventListener('click', toggleControlsHelp);
    elements.closeControlsHelpBtn.addEventListener('click', toggleControlsHelp);
    if (elements.onboardingBtn) {
        elements.onboardingBtn.addEventListener('click', () => openOnboarding(true));
    }
    if (elements.onboardingPrevBtn) {
        elements.onboardingPrevBtn.addEventListener('click', () => changeOnboardingStep(-1));
    }
    if (elements.onboardingNextBtn) {
        elements.onboardingNextBtn.addEventListener('click', () => changeOnboardingStep(1));
    }
    if (elements.onboardingDoneBtn) {
        elements.onboardingDoneBtn.addEventListener('click', completeOnboarding);
    }
    if (elements.skipOnboardingBtn) {
        elements.skipOnboardingBtn.addEventListener('click', () => closeOnboarding(true));
    }
    if (elements.inGameSettingsBtn) {
        elements.inGameSettingsBtn.addEventListener('click', showSettings);
    }
    if (elements.closeSettingsBtn) {
        elements.closeSettingsBtn.addEventListener('click', closeSettings);
    }
    if (elements.saveSettingsBtn) {
        elements.saveSettingsBtn.addEventListener('click', () => {
            savePreferences();
            closeSettings();
            showStatusBanner('Settings saved', 'success');
        });
    }
    if (elements.resetSettingsBtn) {
        elements.resetSettingsBtn.addEventListener('click', () => {
            userPreferences = { ...defaultPreferences };
            applyPreferences();
            syncSettingsUI();
            savePreferences();
            showStatusBanner('Preferences reset', 'success');
        });
    }
    if (elements.highContrastToggle) {
        elements.highContrastToggle.addEventListener('change', (event) => {
            userPreferences.highContrast = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.colorblindToggle) {
        elements.colorblindToggle.addEventListener('change', (event) => {
            userPreferences.colorblind = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.keyboardNavToggle) {
        elements.keyboardNavToggle.addEventListener('change', (event) => {
            userPreferences.keyboardNav = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.reducedMotionToggle) {
        elements.reducedMotionToggle.addEventListener('change', (event) => {
            userPreferences.reducedMotion = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.flashWarningToggle) {
        elements.flashWarningToggle.addEventListener('change', (event) => {
            userPreferences.flashWarnings = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.cinematicToggle) {
        elements.cinematicToggle.addEventListener('change', (event) => {
            userPreferences.cinematicMode = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.minimalModeToggle) {
        elements.minimalModeToggle.addEventListener('change', (event) => {
            userPreferences.minimalMode = event.target.checked;
            applyPreferences();
            syncSettingsUI();
        });
    }
    if (elements.touchModeToggle) {
        elements.touchModeToggle.addEventListener('change', (event) => {
            userPreferences.touchMode = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.fontSizeRange) {
        elements.fontSizeRange.addEventListener('input', (event) => {
            userPreferences.fontScale = parseInt(event.target.value, 10);
            applyPreferences();
            updateFontSizeLabel();
        });
    }

    if (elements.vfxQualitySelect) {
        elements.vfxQualitySelect.addEventListener('change', (event) => {
            userPreferences.vfxQuality = event.target.value;
            applyPreferences();
        });
    }
    if (elements.particleDensityRange) {
        elements.particleDensityRange.addEventListener('input', (event) => {
            userPreferences.particleDensity = parseInt(event.target.value, 10);
            updateVisualLabels();
            queuePreferenceSave();
        });
    }
    if (elements.screenShakeRange) {
        elements.screenShakeRange.addEventListener('input', (event) => {
            userPreferences.screenShake = parseInt(event.target.value, 10);
            updateVisualLabels();
            applyPreferences();
        });
    }
    if (elements.animationSpeedRange) {
        elements.animationSpeedRange.addEventListener('input', (event) => {
            userPreferences.animationSpeed = parseInt(event.target.value, 10);
            updateVisualLabels();
            applyPreferences();
        });
    }
    if (elements.environmentQualitySelect) {
        elements.environmentQualitySelect.addEventListener('change', (event) => {
            userPreferences.environmentQuality = event.target.value;
            applyPreferences();
        });
    }
    if (elements.performanceOverlayToggle) {
        elements.performanceOverlayToggle.addEventListener('change', (event) => {
            userPreferences.performanceOverlay = event.target.checked;
            applyPreferences();
        });
    }
    if (elements.autoQualityToggle) {
        elements.autoQualityToggle.addEventListener('change', (event) => {
            userPreferences.autoQuality = event.target.checked;
            applyPreferences();
        });
    }

    if (elements.masterVolumeRange) {
        elements.masterVolumeRange.addEventListener('input', (event) => {
            userPreferences.audio.master = parseInt(event.target.value, 10);
            applyAudioPreferences();
        });
    }
    if (elements.musicVolumeRange) {
        elements.musicVolumeRange.addEventListener('input', (event) => {
            userPreferences.audio.music = parseInt(event.target.value, 10);
            applyAudioPreferences();
        });
    }
    if (elements.sfxVolumeRange) {
        elements.sfxVolumeRange.addEventListener('input', (event) => {
            userPreferences.audio.sfx = parseInt(event.target.value, 10);
            applyAudioPreferences();
        });
    }
    if (elements.ambientVolumeRange) {
        elements.ambientVolumeRange.addEventListener('input', (event) => {
            userPreferences.audio.ambient = parseInt(event.target.value, 10);
            applyAudioPreferences();
        });
    }
    if (elements.muteToggle) {
        elements.muteToggle.addEventListener('change', (event) => {
            userPreferences.audio.muted = event.target.checked;
            applyAudioPreferences();
        });
    }
    if (elements.musicMuteToggle) {
        elements.musicMuteToggle.addEventListener('change', (event) => {
            userPreferences.audio.musicMuted = event.target.checked;
            applyAudioPreferences();
        });
    }
    if (elements.sfxMuteToggle) {
        elements.sfxMuteToggle.addEventListener('change', (event) => {
            userPreferences.audio.sfxMuted = event.target.checked;
            applyAudioPreferences();
        });
    }
    if (elements.ambientToggle) {
        elements.ambientToggle.addEventListener('change', (event) => {
            userPreferences.audio.ambientEnabled = event.target.checked;
            applyAudioPreferences();
        });
    }

    if (elements.settingsTabs?.length) {
        elements.settingsTabs.forEach((tab) => {
            tab.addEventListener('click', () => switchSettingsTab(tab.dataset.settingsTab));
        });
    }

    setupControlBindingListeners();
    document.addEventListener('keydown', handleBindingKeydown, true);

    if (elements.controlsHelpOverlay) {
        elements.controlsHelpOverlay.addEventListener('click', (event) => {
            if (event.target === elements.controlsHelpOverlay) {
                toggleControlsHelp();
            }
        });
    }
    
    // Property & Employee Management
    const propertyEmployeeBtn = document.getElementById('property-employee-btn');
    if (propertyEmployeeBtn) {
        propertyEmployeeBtn.addEventListener('click', openPropertyEmployeePanel);
    }

    if (elements.resetBindingsBtn) {
        elements.resetBindingsBtn.addEventListener('click', resetControlBindings);
    }

    if (elements.openTravelFromNav) {
        elements.openTravelFromNav.addEventListener('click', openTravel);
    }

    if (elements.navigationConnections) {
        elements.navigationConnections.addEventListener('click', (event) => {
            const button = event.target.closest('.nav-connection.actionable');
            if (button?.dataset.destination) {
                GameWorld.travelTo(button.dataset.destination);
            }
        });
    }
    
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

function loadPreferencesFromStorage() {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            userPreferences = { ...defaultPreferences, ...JSON.parse(stored) };
            userPreferences.controlBindings = { ...defaultControlBindings, ...(userPreferences.controlBindings || {}) };
            userPreferences.audio = { ...defaultPreferences.audio, ...(userPreferences.audio || {}) };
            userPreferences.lastImmersive = userPreferences.lastImmersive || null;
        }
    } catch (error) {
        console.warn('Unable to load preferences', error);
        userPreferences = { ...defaultPreferences };
    }

    if (window.AudioSystem) {
        AudioSystem.init({
            master: (userPreferences.audio?.master ?? 80) / 100,
            music: (userPreferences.audio?.music ?? 60) / 100,
            sfx: (userPreferences.audio?.sfx ?? 75) / 100,
            ambient: (userPreferences.audio?.ambient ?? 50) / 100,
            muted: userPreferences.audio?.muted,
            musicMuted: userPreferences.audio?.musicMuted,
            sfxMuted: userPreferences.audio?.sfxMuted,
            ambientEnabled: userPreferences.audio?.ambientEnabled
        });
    }

    applyPreferences();
    syncSettingsUI();
}

function savePreferences() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userPreferences));
}

function queuePreferenceSave() {
    clearTimeout(preferenceSaveTimer);
    preferenceSaveTimer = setTimeout(savePreferences, 250);
}

function applyPreferences() {
    applyMinimalPreset(userPreferences.minimalMode);
    document.body.classList.toggle('high-contrast', userPreferences.highContrast);
    document.body.classList.toggle('colorblind-friendly', userPreferences.colorblind);
    document.body.classList.toggle('keyboard-nav-enabled', userPreferences.keyboardNav);
    document.body.classList.toggle('reduced-motion', userPreferences.reducedMotion);
    document.body.classList.toggle('highlight-guides', userPreferences.highlightGuides);
    document.body.classList.toggle('minimal-mode', userPreferences.minimalMode);
    document.body.classList.toggle('touch-friendly', userPreferences.touchMode);
    document.body.classList.toggle('cinematics-disabled', !userPreferences.cinematicMode);
    document.documentElement.style.setProperty('--font-size', `${userPreferences.fontScale}%`);
    document.documentElement.style.setProperty('--animation-scale', `${userPreferences.animationSpeed / 100}`);
    document.documentElement.style.setProperty('--shake-intensity', `${(userPreferences.screenShake / 100) * 8}px`);
    if (elements.environmentOverlay) {
        elements.environmentOverlay.style.opacity = userPreferences.environmentQuality === 'low' ? 0.16 : '';
    }
    if (elements.environmentQualitySelect) {
        elements.environmentQualitySelect.value = userPreferences.environmentQuality;
    }
    if (elements.autoQualityToggle) {
        elements.autoQualityToggle.checked = userPreferences.autoQuality;
    }
    if (elements.qualityLabel) {
        const label = userPreferences.environmentQuality === 'low' ? 'Performance' :
            userPreferences.environmentQuality === 'medium' ? 'Balanced' : 'High Fidelity';
        elements.qualityLabel.textContent = label;
    }
    EnvironmentSystem.refreshOverlayClasses();
    if (EnvironmentSystem.overlay && !userPreferences.dynamicWeather) {
        EnvironmentSystem.applyWeather('clear', { silent: true });
    }
    applyAudioPreferences();
    PerformanceMonitor.setEnabled(userPreferences.performanceOverlay);
    updateFontSizeLabel();
    queuePreferenceSave();
}

function applyMinimalPreset(enabled) {
    if (enabled) {
        if (!userPreferences.lastImmersive) {
            userPreferences.lastImmersive = {
                particleDensity: userPreferences.particleDensity,
                screenShake: userPreferences.screenShake,
                animationSpeed: userPreferences.animationSpeed,
                environmentQuality: userPreferences.environmentQuality,
                vfxQuality: userPreferences.vfxQuality,
                autoQuality: userPreferences.autoQuality,
                reducedMotion: userPreferences.reducedMotion,
                flashWarnings: userPreferences.flashWarnings,
                touchMode: userPreferences.touchMode,
                audio: { ambientEnabled: userPreferences.audio.ambientEnabled }
            };
        }

        userPreferences.particleDensity = Math.min(userPreferences.particleDensity, 60);
        userPreferences.screenShake = 0;
        userPreferences.animationSpeed = Math.min(userPreferences.animationSpeed, 95);
        userPreferences.environmentQuality = 'medium';
        userPreferences.vfxQuality = 'low';
        userPreferences.autoQuality = true;
        userPreferences.reducedMotion = true;
        userPreferences.flashWarnings = true;
        userPreferences.audio.ambientEnabled = false;
        userPreferences.touchMode = true;
    } else if (userPreferences.lastImmersive) {
        const snapshot = userPreferences.lastImmersive;
        userPreferences.particleDensity = snapshot.particleDensity;
        userPreferences.screenShake = snapshot.screenShake;
        userPreferences.animationSpeed = snapshot.animationSpeed;
        userPreferences.environmentQuality = snapshot.environmentQuality;
        userPreferences.vfxQuality = snapshot.vfxQuality;
        userPreferences.autoQuality = snapshot.autoQuality;
        userPreferences.reducedMotion = snapshot.reducedMotion;
        userPreferences.flashWarnings = snapshot.flashWarnings;
        userPreferences.touchMode = snapshot.touchMode;
        userPreferences.audio.ambientEnabled = snapshot.audio?.ambientEnabled ?? userPreferences.audio.ambientEnabled;
        userPreferences.lastImmersive = null;
    }
}

function setupControlBindingListeners() {
    if (!elements.controlBindingInputs) return;

    elements.controlBindingInputs.forEach(input => {
        input.addEventListener('focus', () => beginBindingCapture(input.dataset.action, input));
        input.addEventListener('click', () => beginBindingCapture(input.dataset.action, input));
    });
}

function resetControlBindings() {
    userPreferences.controlBindings = { ...defaultControlBindings };
    savePreferences();
    syncSettingsUI();
    announceToScreenReaders('Control bindings reset to defaults');
}

function syncSettingsUI() {
    if (elements.highContrastToggle) {
        elements.highContrastToggle.checked = userPreferences.highContrast;
    }
    if (elements.colorblindToggle) {
        elements.colorblindToggle.checked = userPreferences.colorblind;
    }
    if (elements.keyboardNavToggle) {
        elements.keyboardNavToggle.checked = userPreferences.keyboardNav;
    }
    if (elements.reducedMotionToggle) {
        elements.reducedMotionToggle.checked = userPreferences.reducedMotion;
    }
    if (elements.flashWarningToggle) {
        elements.flashWarningToggle.checked = userPreferences.flashWarnings;
    }
    if (elements.cinematicToggle) {
        elements.cinematicToggle.checked = userPreferences.cinematicMode;
    }
    if (elements.minimalModeToggle) {
        elements.minimalModeToggle.checked = userPreferences.minimalMode;
    }
    if (elements.touchModeToggle) {
        elements.touchModeToggle.checked = userPreferences.touchMode;
    }
    if (elements.fontSizeRange) {
        elements.fontSizeRange.value = userPreferences.fontScale;
    }
    if (elements.vfxQualitySelect) {
        elements.vfxQualitySelect.value = userPreferences.vfxQuality;
    }
    if (elements.particleDensityRange) {
        elements.particleDensityRange.value = userPreferences.particleDensity;
    }
    if (elements.screenShakeRange) {
        elements.screenShakeRange.value = userPreferences.screenShake;
    }
    if (elements.animationSpeedRange) {
        elements.animationSpeedRange.value = userPreferences.animationSpeed;
    }
    if (elements.environmentQualitySelect) {
        elements.environmentQualitySelect.value = userPreferences.environmentQuality;
    }
    if (elements.performanceOverlayToggle) {
        elements.performanceOverlayToggle.checked = userPreferences.performanceOverlay;
    }
    if (elements.autoQualityToggle) {
        elements.autoQualityToggle.checked = userPreferences.autoQuality;
    }
    updateFontSizeLabel();
    syncAudioUI();
    updateVisualLabels();
    updateBindingInputs();
}

function updateFontSizeLabel() {
    if (elements.fontSizeLabel) {
        elements.fontSizeLabel.textContent = `${userPreferences.fontScale}%`;
    }
}

function updateVisualLabels() {
    if (elements.particleDensityLabel) {
        elements.particleDensityLabel.textContent = `${userPreferences.particleDensity}%`;
    }
    if (elements.screenShakeLabel) {
        elements.screenShakeLabel.textContent = `${userPreferences.screenShake}%`;
    }
    if (elements.animationSpeedLabel) {
        elements.animationSpeedLabel.textContent = `${userPreferences.animationSpeed}%`;
    }
}

function applyAudioPreferences() {
    if (!window.AudioSystem) return;

    const audioPrefs = userPreferences.audio;
    AudioSystem.applySettings({
        master: (audioPrefs.master ?? 80) / 100,
        music: (audioPrefs.music ?? 60) / 100,
        sfx: (audioPrefs.sfx ?? 75) / 100,
        ambient: (audioPrefs.ambient ?? 50) / 100,
        muted: audioPrefs.muted,
        musicMuted: audioPrefs.musicMuted,
        sfxMuted: audioPrefs.sfxMuted,
        ambientEnabled: audioPrefs.ambientEnabled
    });

    syncAudioUI();
    queuePreferenceSave();
}

function syncAudioUI() {
    if (elements.masterVolumeRange) elements.masterVolumeRange.value = userPreferences.audio.master;
    if (elements.musicVolumeRange) elements.musicVolumeRange.value = userPreferences.audio.music;
    if (elements.sfxVolumeRange) elements.sfxVolumeRange.value = userPreferences.audio.sfx;
    if (elements.ambientVolumeRange) elements.ambientVolumeRange.value = userPreferences.audio.ambient;
    if (elements.masterVolumeLabel) elements.masterVolumeLabel.textContent = `${userPreferences.audio.master}%`;
    if (elements.musicVolumeLabel) elements.musicVolumeLabel.textContent = `${userPreferences.audio.music}%`;
    if (elements.sfxVolumeLabel) elements.sfxVolumeLabel.textContent = `${userPreferences.audio.sfx}%`;
    if (elements.ambientVolumeLabel) elements.ambientVolumeLabel.textContent = `${userPreferences.audio.ambient}%`;
    if (elements.muteToggle) elements.muteToggle.checked = userPreferences.audio.muted;
    if (elements.musicMuteToggle) elements.musicMuteToggle.checked = userPreferences.audio.musicMuted;
    if (elements.sfxMuteToggle) elements.sfxMuteToggle.checked = userPreferences.audio.sfxMuted;
    if (elements.ambientToggle) elements.ambientToggle.checked = userPreferences.audio.ambientEnabled;
}

function updateBindingInputs() {
    if (!elements.controlBindingInputs) return;

    elements.controlBindingInputs.forEach(input => {
        const action = input.dataset.action;
        if (!action) return;
        input.value = getBinding(action);
    });

    renderControlsHelpList();
}

function renderControlsHelpList() {
    if (!elements.controlsHelpOverlay) return;
    const list = elements.controlsHelpOverlay.querySelector('ul');
    if (!list) return;

    const bindings = {
        quickSave: getBinding('quickSave'),
        quickLoad: getBinding('quickLoad'),
        inventory: getBinding('openInventory'),
        market: getBinding('openMarket'),
        transportation: getBinding('openTransportation'),
        menu: getBinding('toggleMenu'),
        help: getBinding('controlsHelp'),
        undo: getBinding('undoAction'),
        redo: getBinding('redoAction')
    };

    list.innerHTML = `
        <li><strong>${bindings.quickSave}</strong>: Quick Save</li>
        <li><strong>${bindings.quickLoad}</strong>: Quick Load (asks for confirmation during play)</li>
        <li><strong>${bindings.inventory}</strong>: Open Inventory</li>
        <li><strong>${bindings.market}</strong>: Open Market</li>
        <li><strong>${bindings.transportation}</strong>: Open Transportation</li>
        <li><strong>${bindings.menu}</strong>: Toggle menu or return to game</li>
        <li><strong>${bindings.help}</strong>: Toggle this help panel</li>
        <li><strong>${bindings.undo}</strong>: Undo last action</li>
        <li><strong>${bindings.redo}</strong>: Redo last undone action</li>
        <li><strong>1-7 (in Market)</strong>: Switch between market tabs</li>
    `;
}

function showSettings() {
    if (!elements.settingsModal) {
        addMessage('Settings are unavailable.');
        return;
    }

    syncSettingsUI();
    elements.settingsModal.classList.remove('hidden');

    if (elements.settingsTabs?.length) {
        const active = elements.settingsTabs.find((tab) => tab.classList.contains('active')) || elements.settingsTabs[0];
        if (active) {
            switchSettingsTab(active.dataset.settingsTab);
        }
    }

    const modalContent = elements.settingsModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.setAttribute('tabindex', '-1');
        modalContent.focus();
    }
}

function closeSettings() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.add('hidden');
    }
}

function switchSettingsTab(tabName = '') {
    elements.settingsTabs?.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.settingsTab === tabName);
        tab.setAttribute('aria-selected', tab.dataset.settingsTab === tabName);
    });

    document.querySelectorAll('.settings-tab-content').forEach((section) => {
        section.classList.toggle('active', section.id === `settings-${tabName}`);
        section.setAttribute('aria-hidden', section.id !== `settings-${tabName}`);
    });
}

function initializeOnboarding() {
    if (!elements.onboardingModal) return;

    updateOnboardingStep();

    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (!hasSeenOnboarding) {
        openOnboarding();
    }
}

function openOnboarding() {
    if (!elements.onboardingModal) return;

    onboardingStepIndex = 0;
    updateOnboardingStep();
    elements.onboardingModal.classList.remove('hidden');

    const modalContent = elements.onboardingModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.setAttribute('tabindex', '-1');
        modalContent.focus();
    }
}

function changeOnboardingStep(delta) {
    const steps = document.querySelectorAll('.onboarding-step');
    const nextIndex = onboardingStepIndex + delta;
    onboardingStepIndex = Math.max(0, Math.min(nextIndex, steps.length - 1));
    updateOnboardingStep();
}

function updateOnboardingStep() {
    const steps = document.querySelectorAll('.onboarding-step');
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === onboardingStepIndex);
        step.setAttribute('aria-current', index === onboardingStepIndex ? 'step' : 'false');
    });

    if (elements.onboardingProgress && elements.onboardingProgressFill) {
        const totalSteps = steps.length || 1;
        const percentage = ((onboardingStepIndex + 1) / totalSteps) * 100;
        elements.onboardingProgress.setAttribute('aria-valuenow', onboardingStepIndex + 1);
        elements.onboardingProgressFill.style.width = `${percentage}%`;
    }

    if (elements.onboardingPrevBtn) {
        elements.onboardingPrevBtn.disabled = onboardingStepIndex === 0;
    }
    if (elements.onboardingNextBtn) {
        elements.onboardingNextBtn.disabled = onboardingStepIndex >= steps.length - 1;
    }
}

function closeOnboarding(markComplete = false) {
    if (elements.onboardingModal) {
        elements.onboardingModal.classList.add('hidden');
    }

    if (markComplete) {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    }
}

function completeOnboarding() {
    closeOnboarding(true);
    showStatusBanner('Tutorial ready', 'success');
}

// Game State Management Functions
function changeState(newState) {
    const oldState = game.state;
    game.state = newState;

    if (newState !== GameState.PLAYING) {
        stopAutoSaveTimer();
    }

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
            startAutoSaveTimer();
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

    updateAudioThemeForState(newState);
    console.log(`Game state changed from ${oldState} to ${newState}`);
}

function updateAudioThemeForState(state) {
    if (!window.AudioSystem || !AudioSystem.initialized) return;

    const timeInfo = typeof TimeSystem !== 'undefined' ? TimeSystem.getTimeInfo() : {};

    switch (state) {
        case GameState.MENU:
            AudioSystem.setTheme('menu');
            break;
        case GameState.MARKET:
            AudioSystem.setTheme('market');
            break;
        case GameState.TRAVEL:
            AudioSystem.setTheme('travel');
            break;
        default:
            if (timeInfo.isNight) {
                AudioSystem.setTheme('night');
            } else {
                AudioSystem.setTheme('explore');
            }
            break;
    }
}

function playAmbientForLocation(locationId) {
    if (!window.AudioSystem || !AudioSystem.initialized) return;
    const location = GameWorld.locations?.[locationId];
    if (!location) return;

    const ambientMap = {
        city: 'city',
        town: 'town',
        village: 'forest',
        mine: 'mine',
        tavern: 'tavern'
    };

    const ambientType = ambientMap[location.type] || 'town';
    AudioSystem.playAmbient(ambientType);
}

// Screen Management
function showScreen(screenId) {
    const swapScreens = () => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    };

    VisualEffectsSystem.transition(swapScreens);
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
    const stopProgress = startLoadingProgress('Preparing new adventure...', 25);

    setTimeout(() => {
        changeState(GameState.CHARACTER_CREATION);
        addMessage('Starting a new game...');
        if (stopProgress) {
            stopProgress('Ready');
        }
    }, 450);
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

    StatsSystem.reset();
    StatsSystem.updateFromGame();
    updateNavigationPanel();

    // Update UI
    updatePlayerInfo();
    updatePlayerStats();

    // Change to playing state
    changeState(GameState.PLAYING);
    addMessage(`Welcome, ${name} ${characterClass}!`);
    addMessage('You start with some basic supplies for your journey.');

    UndoRedoManager.record('Game start');
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
    updateNavigationPanel();
    StatsSystem.updateFromGame();
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
        playAmbientForLocation(game.currentLocation.id);
        EnvironmentSystem.applyLocationAtmosphere(game.currentLocation.id);
    }

    updateNavigationPanel();
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

function updateNavigationPanel() {
    if (!elements.navigationConnections) return;

    const currentLocation = GameWorld.locations[game.currentLocation?.id];

    if (elements.navigationCurrentLocation) {
        elements.navigationCurrentLocation.textContent = currentLocation ? currentLocation.name : 'Unknown';
    }

    if (!currentLocation || !currentLocation.connections?.length) {
        elements.navigationConnections.innerHTML = '<p class="nav-hint">Travel to a nearby town to unlock quick navigation.</p>';
        return;
    }

    elements.navigationConnections.innerHTML = '';
    currentLocation.connections.forEach(connectionId => {
        const destination = GameWorld.locations[connectionId];
        if (!destination) return;

        const button = document.createElement('button');
        button.className = 'nav-connection actionable';
        button.dataset.destination = connectionId;
        button.type = 'button';
        button.textContent = destination.name;
        elements.navigationConnections.appendChild(button);
    });

    const firstConnection = elements.navigationConnections.querySelector('.nav-connection');
    if (firstConnection) {
        EnvironmentSystem.nudgeElement(firstConnection, 'Plot a premium trade route.');
    }
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
    NarrativeSystem.recordEvent('marketEnter', {
        location: game.currentLocation?.name,
        reputation: game.currentLocation?.reputation || 'Newcomer'
    });
    StatsSystem.recordAction('marketOpened');
    AnimationSystem.setState('trade', { reason: 'Market haggling' });
}

function closeMarket() {
    changeState(GameState.PLAYING);
    AnimationSystem.setState('idle', { reason: 'Leaving market' });
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
    
    // Clear existing options except first one
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
    
    // Use new travel system if available
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.showTravelPanel();
    } else {
        // Fallback to old system
        populateDestinations();
    }
}

function closeTravel() {
    changeState(GameState.PLAYING);
    
    // Hide travel system if available
    if (typeof TravelSystem !== 'undefined') {
        TravelSystem.hideTravelPanel();
    }
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
    StatsSystem.recordAction('inventoryOpened');
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
    
    // Purchase transportation
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

function celebrateAction(state, reason, particleType = 'success', origin) {
    AnimationSystem.setState(state, { reason, context: state });
    AnimationSystem.registerBeat(0.12);
    ParticleSystem.spawnBurst(particleType, { count: 12, origin });
    VisualEffectsSystem.shake(4, 240);
}

function playItemUseEffects(item) {
    const particleType = item.category === 'medical' ? 'heal' : 'success';
    celebrateAction('rest', `Using ${item.name}`, particleType, elements.inventoryPanel);
}

function celebrateTrade(reason, origin) {
    celebrateAction('trade', reason, 'deal', origin || elements.marketPanel);
}

// Item Usage System
function useItem(itemId) {
    if (!game.player || !game.player.inventory) return false;
    
    const item = ItemDatabase.getItem(itemId);
    if (!item) {
        addMessage(`Unknown item: ${itemId}`);
        return false;
    }
    
    // Check if player has item
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

    playItemUseEffects(item);

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

    celebrateAction('trade', `Equipped ${item.name}`, 'success', elements.inventoryPanel);

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
    
    addMessage("🏠 Congratulations! You bought a house in city!");
    addMessage("You can now rest for free anytime you're in this city.");
    
    updatePlayerInfo();
    
    return true;
}

// Open Property & Employee Management Panel
function openPropertyEmployeePanel() {
    const panel = document.getElementById('property-employee-panel');
    if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
        
        // Initialize PropertyEmployeeUI if it exists
        if (typeof PropertyEmployeeUI !== 'undefined') {
            PropertyEmployeeUI.init();
            PropertyEmployeeUI.updateDisplay();
        }
        
        // Update property and employee displays
        if (typeof PropertySystem !== 'undefined') {
            PropertySystem.updatePropertyDisplay();
        }
        if (typeof EmployeeSystem !== 'undefined') {
            EmployeeSystem.updateEmployeeDisplay();
        }
    }
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

    UndoRedoManager.record(`Buy ${actualQuantity} ${item.name}`);

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
    celebrateTrade(`Secured ${item.name}`, elements.marketPanel);

    ParticleSystem.spawnBurst('gold', { origin: elements.playerGold });
    if (window.AudioSystem) {
        AudioSystem.playSfx('purchase');
    }
    
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

    UndoRedoManager.record(`Sell ${actualQuantity} ${item.name}`);

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
    celebrateTrade(`Closed ${item.name} sale`, elements.marketPanel);

    ParticleSystem.spawnBurst('success', { origin: elements.playerGold });
    if (window.AudioSystem) {
        AudioSystem.playSfx('sell');
    }
    
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

    const messageText = document.createElement('span');
    messageText.className = 'message-text';
    messageText.textContent = text;
    messageElement.appendChild(messageText);

    elements.messages.appendChild(messageElement);

    requestAnimationFrame(() => {
        const containerWidth = messageElement.clientWidth;
        const textWidth = messageText.scrollWidth;

        if (textWidth > containerWidth + 12) {
            messageElement.classList.add('scrolling');
            const distance = Math.min(textWidth - containerWidth + 32, textWidth);
            const duration = Math.min(18, Math.max(6, distance / 25));
            messageText.style.setProperty('--scroll-distance', `${distance}px`);
            messageText.style.setProperty('--scroll-duration', `${duration}s`);
        }
    });

    if (NotificationCenter) {
        NotificationCenter.show(text, type === 'error' ? 'error' : (type === 'success' ? 'success' : 'info'));
    }

    if (type === 'success' || type === 'error') {
        VisualEffectsSystem.shake(type === 'error' ? 10 : 6, 360);
    }

    if (window.AudioSystem && type === 'success') {
        AudioSystem.playSfx('notification');
    }

    announceToScreenReaders(text);
    
    // Auto-scroll to bottom
    elements.messages.scrollTop = elements.messages.scrollHeight;
    
    // Limit message history
    while (elements.messages.children.length > 50) {
        elements.messages.removeChild(elements.messages.firstChild);
    }
}

function handleError(context, error, { silent = false } = {}) {
    console.error(`${context} failed:`, error);
    const friendly = 'Something went wrong. Please try again or check your connection.';
    addMessage(friendly);
    if (!silent) {
        showStatusBanner(`${context} failed`, 'error');
    }
}

function announceToScreenReaders(message) {
    if (!elements.liveRegion) return;

    elements.liveRegion.textContent = '';
    setTimeout(() => {
        elements.liveRegion.textContent = message;
    }, 20);
}

function updateLastSaveTime(timestamp = new Date()) {
    if (!elements.lastSaveTime) return;

    const formatted = typeof timestamp === 'string'
        ? timestamp
        : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    elements.lastSaveTime.textContent = `Last save: ${formatted}`;
}

function showAutoSaveIndicator(message, state = 'info', duration = 1800) {
    if (!elements.autosaveIndicator) return;

    const textElement = elements.autosaveIndicator.querySelector('.autosave-text');
    if (textElement) {
        textElement.textContent = message;
    }

    elements.autosaveIndicator.classList.remove('hidden', 'error', 'success');
    if (state !== 'info') {
        elements.autosaveIndicator.classList.add(state);
    }

    clearTimeout(elements.autosaveHideTimeout);
    elements.autosaveHideTimeout = setTimeout(() => {
        elements.autosaveIndicator.classList.add('hidden');
    }, duration);
}

function startAutoSaveTimer() {
    stopAutoSaveTimer();

    if (!elements.autosaveIndicator) return;

    autoSaveTimerId = setInterval(() => {
        showAutoSaveIndicator('Auto-saving...');
        saveGame({ silent: true, isAutoSave: true });
    }, AUTO_SAVE_INTERVAL);
}

function stopAutoSaveTimer() {
    if (autoSaveTimerId) {
        clearInterval(autoSaveTimerId);
        autoSaveTimerId = null;
    }
}

function startLoadingProgress(message = 'Loading...', startingProgress = 10) {
    if (!elements.loadingScreen) return null;

    elements.loadingScreen.classList.remove('hidden');
    if (elements.loadingMessage) {
        elements.loadingMessage.textContent = message;
    }
    if (elements.loadingProgressFill) {
        elements.loadingProgressFill.style.width = `${startingProgress}%`;
    }

    let progress = startingProgress;
    loadingProgressTimer = setInterval(() => {
        progress = Math.min(95, progress + Math.random() * 15);
        if (elements.loadingProgressFill) {
            elements.loadingProgressFill.style.width = `${progress}%`;
        }
    }, 200);

    return stopLoadingProgress;
}

function stopLoadingProgress(finalMessage) {
    if (loadingProgressTimer) {
        clearInterval(loadingProgressTimer);
        loadingProgressTimer = null;
    }

    if (elements.loadingMessage && finalMessage) {
        elements.loadingMessage.textContent = finalMessage;
    }

    if (elements.loadingProgressFill) {
        elements.loadingProgressFill.style.width = '100%';
    }

    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('hidden');
        }
        if (elements.loadingProgressFill) {
            elements.loadingProgressFill.style.width = '0%';
        }
    }, 350);
}

let statusBannerTimeout;

function showStatusBanner(message, type = 'success') {
    if (!elements.statusBanner) return;

    elements.statusBanner.textContent = message;
    elements.statusBanner.classList.remove('hidden', 'warning', 'error');
    if (type !== 'success') {
        elements.statusBanner.classList.add(type);
    }

    clearTimeout(statusBannerTimeout);
    statusBannerTimeout = setTimeout(() => {
        elements.statusBanner.classList.add('hidden');
    }, 2500);
}

function toggleControlsHelp() {
    if (!elements.controlsHelpOverlay) return;

    const isHidden = elements.controlsHelpOverlay.classList.contains('hidden');
    elements.controlsHelpOverlay.classList.toggle('hidden');

    if (isHidden && elements.closeControlsHelpBtn) {
        elements.closeControlsHelpBtn.focus();
    }

    renderControlsHelpList();
}

function formatKeyCombo(event) {
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');

    let key = event.key;
    if (key === ' ') key = 'Space';
    if (key.length === 1) key = key.toUpperCase();

    parts.push(key);
    return parts.join('+');
}

function getBinding(action) {
    return (userPreferences.controlBindings?.[action] || defaultControlBindings[action] || '').trim();
}

function bindingMatches(event, action) {
    return formatKeyCombo(event).toLowerCase() === getBinding(action).toLowerCase();
}

let awaitingBindingAction = null;

function beginBindingCapture(action, input) {
    awaitingBindingAction = action;
    if (input) {
        input.value = 'Press keys...';
        input.focus();
    }
    if (elements.bindingHint) {
        elements.bindingHint.textContent = `Press the new shortcut for ${action}`;
    }
}

function handleBindingKeydown(event) {
    if (!awaitingBindingAction) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
        awaitingBindingAction = null;
        syncSettingsUI();
        return;
    }

    const combo = formatKeyCombo(event);
    userPreferences.controlBindings[awaitingBindingAction] = combo;
    savePreferences();
    syncSettingsUI();
    renderControlsHelpList();
    announceToScreenReaders(`${awaitingBindingAction} bound to ${combo}`);

    awaitingBindingAction = null;
}

function handleKeyPress(event) {
    if (awaitingBindingAction) {
        return; // binding capture handles its own events
    }

    const targetTag = event.target?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) {
        return;
    }

    if (bindingMatches(event, 'quickSave')) {
        event.preventDefault();
        saveGame();
        return;
    }

    if (bindingMatches(event, 'quickLoad')) {
        event.preventDefault();
        loadGame();
        return;
    }

    if (bindingMatches(event, 'controlsHelp')) {
        event.preventDefault();
        toggleControlsHelp();
        return;
    }

    if (bindingMatches(event, 'undoAction')) {
        event.preventDefault();
        UndoRedoManager.undo();
        return;
    }

    if (bindingMatches(event, 'redoAction')) {
        event.preventDefault();
        UndoRedoManager.redo();
        return;
    }

    if (game.state === GameState.MARKET && ['1','2','3','4','5','6','7'].includes(event.key)) {
        const marketTabs = ['buy', 'sell', 'compare', 'history', 'routes', 'alerts', 'news'];
        const index = parseInt(event.key, 10) - 1;
        if (marketTabs[index]) {
            switchTab(marketTabs[index]);
            return;
        }
    }

    if (elements.controlsHelpOverlay && !elements.controlsHelpOverlay.classList.contains('hidden') && event.key === 'Escape') {
        toggleControlsHelp();
        return;
    }

    // Keyboard shortcuts
    if (bindingMatches(event, 'toggleMenu')) {
        if (game.state === GameState.PLAYING) {
            toggleMenu();
        } else if (game.state !== GameState.MENU) {
            changeState(GameState.PLAYING);
        }
        return;
    }

    if (bindingMatches(event, 'openInventory') && game.state === GameState.PLAYING) {
        openInventory();
        return;
    }

    if (bindingMatches(event, 'openMarket') && game.state === GameState.PLAYING) {
        openMarket();
        return;
    }

    if (bindingMatches(event, 'openTransportation') && game.state === GameState.PLAYING) {
        openTransportation();
        return;
    }

    if (bindingMatches(event, 'saveGame') && game.state === GameState.PLAYING) {
        saveGame();
    }
}

function toggleMenu() {
    // Menu toggle logic will be implemented here
    addMessage('Menu toggled');
}

// Save/Load Functions
function saveGame(options = {}) {
    const { silent = false, isAutoSave = false } = options;

    try {
        const saveData = game.saveState();
        localStorage.setItem('tradingGameSave', JSON.stringify(saveData));

        const now = new Date();
        updateLastSaveTime(now);

        if (!isAutoSave) {
            addMessage('Game saved successfully!');
        }

        StatsSystem.recordAction('save');

        if (!silent) {
            showStatusBanner('Game saved', 'success');
        }

        showAutoSaveIndicator(isAutoSave ? 'Auto-saved' : 'Saved', 'success');
    } catch (error) {
        handleError('Save', error, { silent });
        if (isAutoSave) {
            showAutoSaveIndicator('Auto-save failed', 'error', 2500);
        }
    }
}

function loadGame(options = {}) {
    const { skipConfirm = false, showLoader = true } = options;

    if (!skipConfirm && game && game.state && game.state !== GameState.MENU) {
        const confirmLoad = window.confirm('Load saved game? Unsaved progress will be lost.');
        if (!confirmLoad) {
            showStatusBanner('Load cancelled', 'warning');
            return;
        }
    }

    const stopProgress = showLoader ? startLoadingProgress('Loading saved game...') : null;

    try {
        const saveData = localStorage.getItem('tradingGameSave');
        if (saveData) {
            const parsedData = JSON.parse(saveData);
            game.loadState(parsedData);
            updatePlayerInfo();
            updateLocationInfo();
            StatsSystem.updateFromGame();
            updateNavigationPanel();
            addMessage('Game loaded successfully!');
            showStatusBanner('Game loaded', 'success');
            updateLastSaveTime('just now');
            if (game.state === GameState.PLAYING) {
                startAutoSaveTimer();
            }
        } else {
            addMessage('No saved game found!');
            showStatusBanner('No save found', 'warning');
        }
    } catch (error) {
        handleError('Load', error);
    } finally {
        if (stopProgress) {
            stopProgress('Loaded');
        }
    }
}

// Transportation System Implementation Notes:
// - Each transportation option has realistic carry weights in pounds
// - Speed modifiers affect travel time between locations
// - Some transportation requires animals (wagons need horses, donkeys, or oxen)
// - Players can own multiple transportation options and switch between them
// - Current load is calculated based on item weights in inventory

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
        
        // Initialize travel system after all other systems
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.init();
        }
    });