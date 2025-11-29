// ═══════════════════════════════════════════════════════════════
// 🌦️ WEATHER SYSTEM - Because traders suffer in any climate
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Made by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// Dynamic weather that affects travel speed, market prices,
// NPC moods, and creates atmospheric visual effects.
// ═══════════════════════════════════════════════════════════════

const WeatherSystem = {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    currentWeather: 'clear',
    currentIntensity: 0.5, // 0-1 scale
    weatherEndTime: 0, // 🖤 REAL timestamp when weather ends (prevents speed spam)
    seasonalModifier: 1,

    // 🖤 Weather history for NPC context (last 5 weather events)
    weatherHistory: [],
    MAX_WEATHER_HISTORY: 5,

    // 🖤 Minimum weather durations in REAL seconds (not affected by game speed)
    MIN_WEATHER_DURATION_SECONDS: 60,   // 💀 At least 1 real minute per weather
    MAX_WEATHER_DURATION_SECONDS: 300,  // 🦇 Up to 5 real minutes per weather
    lastWeatherCheck: 0, // Prevent multiple checks per frame

    // Weather progression map - what weather can escalate/de-escalate to
    // Format: { weatherId: { escalate: [possible worse weather], deescalate: [possible better weather], chance: escalation probability } }
    weatherProgression: {
        clear: { escalate: ['cloudy', 'windy'], deescalate: [], chance: 0.2 },
        cloudy: { escalate: ['rain', 'fog', 'windy'], deescalate: ['clear'], chance: 0.35 },
        windy: { escalate: ['storm', 'cloudy'], deescalate: ['clear'], chance: 0.25 },
        rain: { escalate: ['storm'], deescalate: ['cloudy', 'clear'], chance: 0.4 },
        storm: { escalate: ['rain'], deescalate: ['rain', 'cloudy'], chance: 0.3 }, // Storm can bring more rain
        fog: { escalate: ['rain'], deescalate: ['cloudy', 'clear'], chance: 0.2 },
        snow: { escalate: ['blizzard', 'thundersnow'], deescalate: ['cloudy', 'clear'], chance: 0.35 },
        blizzard: { escalate: ['thundersnow'], deescalate: ['snow', 'cloudy'], chance: 0.15 },
        thundersnow: { escalate: [], deescalate: ['blizzard', 'snow'], chance: 0 }, // Can only get better
        heatwave: { escalate: ['storm'], deescalate: ['clear', 'cloudy'], chance: 0.25 } // Heat can cause storms
    },

    // Weather types and their effects
    weatherTypes: {
        clear: {
            id: 'clear',
            name: 'Clear Skies',
            icon: '☀️',
            description: 'Perfect weather for traveling and trading.',
            effects: {
                travelSpeed: 1.0,
                priceModifier: 1.0,
                encounterChance: 1.0,
                staminaDrain: 1.0,
                visibility: 1.0
            },
            visualClass: 'weather-clear',
            ambientColor: 'rgba(255, 255, 200, 0.1)',
            probability: { spring: 0.3, summer: 0.4, autumn: 0.25, winter: 0.15 }
        },
        cloudy: {
            id: 'cloudy',
            name: 'Overcast',
            icon: '☁️',
            description: 'Grey skies blanket the land.',
            effects: {
                travelSpeed: 0.95,
                priceModifier: 1.0,
                encounterChance: 0.9,
                staminaDrain: 0.95,
                visibility: 0.8
            },
            visualClass: 'weather-cloudy',
            ambientColor: 'rgba(100, 100, 120, 0.2)',
            probability: { spring: 0.25, summer: 0.2, autumn: 0.3, winter: 0.25 }
        },
        rain: {
            id: 'rain',
            name: 'Rain',
            icon: '🌧️',
            description: 'Roads turn to mud, spirits dampen.',
            effects: {
                travelSpeed: 0.7,
                priceModifier: 1.1, // Indoor goods more valuable
                encounterChance: 0.6,
                staminaDrain: 1.3,
                visibility: 0.5
            },
            visualClass: 'weather-rain',
            ambientColor: 'rgba(50, 70, 100, 0.3)',
            probability: { spring: 0.25, summer: 0.15, autumn: 0.25, winter: 0.1 },
            particles: true
        },
        storm: {
            id: 'storm',
            name: 'Thunderstorm',
            icon: '⛈️',
            description: 'Lightning cracks, thunder rolls. Dangerous to travel.',
            effects: {
                travelSpeed: 0.4,
                priceModifier: 1.25,
                encounterChance: 0.3,
                staminaDrain: 1.8,
                visibility: 0.3
            },
            visualClass: 'weather-storm',
            ambientColor: 'rgba(30, 30, 50, 0.5)',
            probability: { spring: 0.1, summer: 0.15, autumn: 0.1, winter: 0.05 },
            particles: true,
            lightning: true
        },
        fog: {
            id: 'fog',
            name: 'Dense Fog',
            icon: '🌫️',
            description: 'Visibility near zero. Easy to get lost.',
            effects: {
                travelSpeed: 0.5,
                priceModifier: 1.05,
                encounterChance: 1.5, // Easier to be ambushed
                staminaDrain: 1.1,
                visibility: 0.2
            },
            visualClass: 'weather-fog',
            ambientColor: 'rgba(200, 200, 210, 0.4)',
            probability: { spring: 0.05, summer: 0.05, autumn: 0.1, winter: 0.15 }
        },
        snow: {
            id: 'snow',
            name: 'Snowfall',
            icon: '🌨️',
            description: 'Winter descends. Cold bites deep.',
            effects: {
                travelSpeed: 0.6,
                priceModifier: 1.15, // Warm goods premium
                encounterChance: 0.5,
                staminaDrain: 1.5,
                visibility: 0.6
            },
            visualClass: 'weather-snow',
            ambientColor: 'rgba(220, 230, 255, 0.2)',
            probability: { spring: 0.02, summer: 0, autumn: 0.05, winter: 0.35 },
            particles: true
        },
        blizzard: {
            id: 'blizzard',
            name: 'Blizzard',
            icon: '❄️',
            description: 'Deadly cold. Only fools travel in this.',
            effects: {
                travelSpeed: 0.25,
                priceModifier: 1.4,
                encounterChance: 0.2,
                staminaDrain: 2.5,
                visibility: 0.1
            },
            visualClass: 'weather-blizzard',
            ambientColor: 'rgba(200, 210, 255, 0.5)',
            probability: { spring: 0, summer: 0, autumn: 0, winter: 0.1 },
            particles: true,
            damaging: true,
            damagePerHour: 5
        },
        thundersnow: {
            id: 'thundersnow',
            name: 'Lightning Blizzard',
            icon: '⚡❄️',
            description: 'Thunder echoes through the blinding snow. A rare and terrifying phenomenon.',
            effects: {
                travelSpeed: 0.15,
                priceModifier: 1.6,
                encounterChance: 0.1,
                staminaDrain: 3.0,
                visibility: 0.05
            },
            visualClass: 'weather-thundersnow',
            ambientColor: 'rgba(180, 190, 255, 0.6)',
            probability: { spring: 0, summer: 0, autumn: 0, winter: 0.02 },
            particles: true,
            lightning: true,
            damaging: true,
            damagePerHour: 8
        },
        heatwave: {
            id: 'heatwave',
            name: 'Heat Wave',
            icon: '🔥',
            description: 'Scorching heat. Water is precious.',
            effects: {
                travelSpeed: 0.8,
                priceModifier: 1.2, // Water/drinks expensive
                encounterChance: 0.7,
                staminaDrain: 1.6,
                visibility: 0.9,
                thirstDrain: 2.0
            },
            visualClass: 'weather-heatwave',
            ambientColor: 'rgba(255, 200, 100, 0.2)',
            probability: { spring: 0.03, summer: 0.2, autumn: 0.05, winter: 0 }
        },
        windy: {
            id: 'windy',
            name: 'Strong Winds',
            icon: '💨',
            description: 'The wind howls across the land.',
            effects: {
                travelSpeed: 0.85,
                priceModifier: 1.0,
                encounterChance: 0.8,
                staminaDrain: 1.2,
                visibility: 0.9
            },
            visualClass: 'weather-windy',
            ambientColor: 'rgba(150, 150, 150, 0.1)',
            probability: { spring: 0.15, summer: 0.1, autumn: 0.2, winter: 0.15 }
        },
        // 💀 APOCALYPSE WEATHER - Dungeon-only event weather
        apocalypse: {
            id: 'apocalypse',
            name: 'The Dark Convergence',
            icon: '☄️',
            description: 'Meteors streak across a blood-red sky. The veil between worlds grows thin.',
            effects: {
                travelSpeed: 0.5,
                priceModifier: 1.5,
                encounterChance: 2.0, // Double encounters!
                staminaDrain: 1.5,
                visibility: 0.4
            },
            visualClass: 'weather-apocalypse',
            ambientColor: 'rgba(80, 20, 30, 0.5)',
            probability: { spring: 0, summer: 0, autumn: 0, winter: 0 }, // Never occurs naturally
            particles: true,
            lightning: true,
            meteors: true // 💀 Special meteor effect
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Pending weather to use when init() runs (set by menu system)
    pendingMenuWeather: null,

    // 🖤 Map menu weather types to game weather types
    menuToGameWeatherMap: {
        'storm': 'storm',
        'winter': 'snow',
        'thundersnow': 'thundersnow',
        'autumn': 'windy',      // Autumn winds → windy
        'spring': 'rain',       // Spring showers → light rain
        'summer': 'clear'       // Summer sun → clear
    },

    // 🖤 Called from startNewGame to transfer menu weather into the game
    setInitialWeatherFromMenu(menuWeatherType) {
        const gameWeather = this.menuToGameWeatherMap[menuWeatherType] || 'clear';
        console.log(`🌦️ Menu weather '${menuWeatherType}' → Game weather '${gameWeather}'`);

        // 🖤 WeatherSystem.init() has already been called by now, so we need to
        // immediately apply the weather instead of setting a pending value
        // Recreate overlay if needed (in case it's in wrong container or missing)
        this.ensureOverlayReady();

        // Apply the weather directly
        this.changeWeather(gameWeather);
        console.log(`🌦️ Game weather applied: ${gameWeather}`);
    },

    // 🖤 Ensure the overlay is in the right place and ready for visuals
    ensureOverlayReady() {
        const overlay = document.getElementById('weather-overlay');
        // 🖤 Weather overlay should be in map-container (not game-container)
        const mapContainer = document.getElementById('map-container');

        if (!mapContainer) {
            console.warn('🌦️ map-container not found for weather overlay');
            return;
        }

        // If overlay doesn't exist, create it
        if (!overlay) {
            console.log('🌦️ Creating weather overlay for game');
            this.createWeatherOverlay();
            return;
        }

        // If overlay exists but is in wrong container, move it to map-container
        if (overlay.parentElement !== mapContainer) {
            console.log('🌦️ Moving weather overlay to map-container');
            if (getComputedStyle(mapContainer).position === 'static') {
                mapContainer.style.position = 'relative';
            }
            mapContainer.appendChild(overlay);
        }

        // Make sure it's visible
        overlay.style.display = '';
        overlay.style.visibility = 'visible';
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖤 EVENT-DRIVEN WEATHER TRIGGERS - Dungeons, quests, encounters
    // ═══════════════════════════════════════════════════════════════

    // 🦇 Store the weather before an event so we can restore it
    savedWeatherBeforeEvent: null,
    eventWeatherActive: false,

    // 🖤 Event weather triggers - what weather to use for different events
    eventWeatherTriggers: {
        // Dungeons & dangerous locations
        dungeon_enter: { weather: 'storm', message: '⚡ Dark clouds gather as you enter...' },
        dungeon_boss: { weather: 'thundersnow', message: '🌩️ The sky itself trembles with fury!' },
        dungeon_victory: { weather: 'clear', message: '☀️ The skies clear as evil is vanquished!' },
        dungeon_defeat: { weather: 'fog', message: '🌫️ A thick fog rolls in, shrouding your retreat...' },

        // Random encounters
        encounter_bandit: { weather: 'fog', message: '🌫️ Figures emerge from the mist...' },
        encounter_merchant: { weather: 'clear', message: '☀️ A pleasant day for trade!' },
        encounter_beast: { weather: 'storm', message: '⚡ Thunder rolls as the beast approaches!' },

        // Quest events
        quest_dark_ritual: { weather: 'thundersnow', message: '🌩️ Unnatural lightning splits the sky!' },
        quest_blessing: { weather: 'clear', message: '☀️ Divine light breaks through the clouds!' },
        quest_curse: { weather: 'fog', message: '🌫️ An unnatural darkness descends...' },
        quest_complete: { weather: null, message: '🌤️ Peace returns to the land.' }, // null = restore previous

        // Location-based
        haunted_location: { weather: 'fog', message: '🌫️ The air grows cold and still...' },
        sacred_ground: { weather: 'clear', message: '☀️ Warmth radiates from this holy place.' },
        cursed_land: { weather: 'storm', message: '⚡ This land rejects the living!' }
    },

    // 🖤 Trigger event-based weather change
    triggerEventWeather(eventType, options = {}) {
        const trigger = this.eventWeatherTriggers[eventType];
        if (!trigger) {
            console.warn(`🌦️ Unknown event weather trigger: ${eventType}`);
            return false;
        }

        // Save current weather if not already in an event
        if (!this.eventWeatherActive && this.currentWeather) {
            this.savedWeatherBeforeEvent = this.currentWeather;
            this.eventWeatherActive = true;
            console.log(`🌦️ Saved weather: ${this.savedWeatherBeforeEvent}`);
        }

        // null weather means restore previous
        if (trigger.weather === null) {
            this.restoreWeatherAfterEvent();
            if (trigger.message && typeof addMessage === 'function') {
                addMessage(trigger.message);
            }
            return true;
        }

        // Change to event weather
        const duration = options.duration || 5; // Default 5 real minutes
        this.changeWeather(trigger.weather);

        // Show message
        if (trigger.message && typeof addMessage === 'function') {
            addMessage(trigger.message);
        }

        console.log(`🌦️ Event weather triggered: ${eventType} → ${trigger.weather}`);

        // Auto-restore after duration if specified
        if (options.autoRestore !== false) {
            setTimeout(() => {
                if (this.eventWeatherActive && this.currentWeather === trigger.weather) {
                    this.restoreWeatherAfterEvent();
                }
            }, duration * 60 * 1000); // Convert minutes to ms
        }

        return true;
    },

    // 🖤 Restore weather after event ends
    restoreWeatherAfterEvent() {
        if (!this.eventWeatherActive) return;

        if (this.savedWeatherBeforeEvent) {
            this.changeWeather(this.savedWeatherBeforeEvent);
            console.log(`🌦️ Weather restored: ${this.savedWeatherBeforeEvent}`);
            if (typeof addMessage === 'function') {
                addMessage('🌤️ The weather returns to normal...');
            }
        } else {
            // No saved weather, pick seasonal
            this.changeWeather(this.selectWeatherForSeason());
        }

        this.savedWeatherBeforeEvent = null;
        this.eventWeatherActive = false;
    },

    // 🖤 Force specific weather (for quests/scripts)
    forceWeather(weatherType, options = {}) {
        if (!this.weatherTypes[weatherType]) {
            console.warn(`🌦️ Unknown weather type: ${weatherType}`);
            return false;
        }

        // Save current if requested
        if (options.saveCurrentWeather) {
            this.savedWeatherBeforeEvent = this.currentWeather;
            this.eventWeatherActive = true;
        }

        this.changeWeather(weatherType);

        if (options.message && typeof addMessage === 'function') {
            addMessage(options.message);
        }

        console.log(`🌦️ Weather forced: ${weatherType}`);
        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖤 WEATHER CONTEXT FOR API - provides weather info to text/TTS APIs
    // ═══════════════════════════════════════════════════════════════

    // 🦇 Track weather history for API context
    weatherHistory: [],
    maxHistoryLength: 5,

    // 🖤 Get weather context string for API prompts
    getWeatherContextForAPI() {
        const current = this.weatherTypes[this.currentWeather];
        if (!current) return '';

        let context = `[Current Weather: ${current.name} (${current.icon}) - ${current.description}]`;

        // Add recent weather history if available
        if (this.weatherHistory.length > 1) {
            const recentHistory = this.weatherHistory.slice(-3).map(w => w.name).join(' → ');
            context += ` [Recent conditions: ${recentHistory}]`;
        }

        // Add event weather note if active
        if (this.eventWeatherActive) {
            context += ` [Weather seems unnatural...]`;
        }

        return context;
    },

    // 🖤 Get detailed weather object for API (JSON format)
    getWeatherDataForAPI() {
        const current = this.weatherTypes[this.currentWeather];
        return {
            current: {
                id: this.currentWeather,
                name: current?.name || 'Unknown',
                icon: current?.icon || '❓',
                description: current?.description || '',
                effects: current?.effects || {},
                intensity: this.currentIntensity
            },
            history: this.weatherHistory.slice(-5),
            isEventWeather: this.eventWeatherActive,
            savedWeather: this.savedWeatherBeforeEvent
        };
    },

    // 🖤 Note: Weather history is tracked in changeWeather() directly
    // The weatherHistory array stores old weather as it changes

    init() {
        console.log('🌦️ WeatherSystem: Forecasting chaos...');

        this.injectStyles();
        this.createWeatherOverlay();
        this.setupTimeListener();

        // 🖤 Use pending menu weather if set, otherwise generate random
        if (this.pendingMenuWeather) {
            this.changeWeather(this.pendingMenuWeather);
            console.log(`🌦️ Using menu weather: ${this.pendingMenuWeather}`);
            this.pendingMenuWeather = null; // Clear for next time
        } else {
            this.changeWeather(this.selectWeatherForSeason());
        }

        console.log('🌦️ WeatherSystem: Ready!');
    },

    setupTimeListener() {
        // 🖤 Check weather every 10 REAL seconds to prevent spam
        // Weather duration is tracked in REAL time now, not game time
        if (typeof TimerManager !== 'undefined') {
            TimerManager.setInterval(() => {
                if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
                    this.updateWeather();
                }
            }, 10000); // Check every 10 real seconds
        }

        // 🦇 Also check on hour change for escalation events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('time-hour-passed', () => {
                // Only escalate, don't change weather here
                if (!TimeSystem.isPaused) {
                    this.checkWeatherEscalation();
                }
            });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // WEATHER LOGIC
    // ═══════════════════════════════════════════════════════════════
    getCurrentSeason() {
        if (typeof TimeSystem === 'undefined') return 'summer';

        const month = TimeSystem.currentTime?.month || 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    },

    selectWeatherForSeason() {
        const season = this.getCurrentSeason();
        const weights = [];
        let totalWeight = 0;

        for (const [weatherId, weather] of Object.entries(this.weatherTypes)) {
            const prob = weather.probability[season] || 0;
            if (prob > 0) {
                weights.push({ id: weatherId, weight: prob });
                totalWeight += prob;
            }
        }

        // Weighted random selection
        let random = Math.random() * totalWeight;
        for (const item of weights) {
            random -= item.weight;
            if (random <= 0) {
                return item.id;
            }
        }

        return 'clear';
    },

    // 🖤 Weather lock for seasonal transitions - don't change weather until this game-minute
    lockWeatherUntil: 0,

    updateWeather() {
        const now = Date.now();

        // 🖤 Prevent spam - only check once per second max
        if (now - this.lastWeatherCheck < 1000) return;
        this.lastWeatherCheck = now;

        // 🦇 Check if weather is locked (seasonal transition in progress)
        if (this.lockWeatherUntil > 0 && typeof TimeSystem !== 'undefined') {
            const currentMinutes = TimeSystem.getTotalMinutes();
            if (currentMinutes < this.lockWeatherUntil) {
                // 🖤 Weather locked - just update visuals, don't change weather
                this.updateVisuals();
                return;
            } else {
                // 💀 Lock expired
                this.lockWeatherUntil = 0;
                console.log('🌦️ Seasonal weather lock expired - resuming normal weather');
            }
        }

        // 🦇 Check if weather duration has expired (REAL time)
        if (this.weatherEndTime > 0 && now >= this.weatherEndTime) {
            // Weather duration expired - time to change
            const nextWeather = this.getNextWeatherFromProgression();
            this.changeWeather(nextWeather);
        }

        // 💀 Apply damage for damaging weather (only once per check)
        const weather = this.weatherTypes[this.currentWeather];
        if (weather?.damaging && weather.damagePerHour && typeof game !== 'undefined' && game.player) {
            // Scale damage by how often we check (every 10 seconds = 1/360th of an hour)
            const damageThisTick = weather.damagePerHour / 360;
            game.player.stats.health = Math.max(1, game.player.stats.health - damageThisTick);
        }

        this.updateVisuals();
    },

    // 🖤 Check if current weather should escalate (get worse) mid-duration
    checkWeatherEscalation() {
        const progression = this.weatherProgression[this.currentWeather];
        if (!progression || progression.escalate.length === 0) return;

        const season = this.getCurrentSeason();

        // Higher chance to escalate in certain conditions
        let escalateChance = progression.chance;

        // Winter increases chance of snow → blizzard escalation
        if (season === 'winter' && (this.currentWeather === 'snow' || this.currentWeather === 'blizzard')) {
            escalateChance *= 1.5;
        }

        // Storm has chance to bring rain or escalate to thundersnow in winter
        if (this.currentWeather === 'storm' && season === 'winter') {
            // Storm in winter can become thundersnow!
            if (Math.random() < 0.1) {
                this.changeWeather('thundersnow', 60 + Math.random() * 120); // 1-3 real minutes
                if (typeof addMessage === 'function') {
                    addMessage('⚡❄️ The storm transforms into a terrifying lightning blizzard!', 'danger');
                }
                return;
            }
        }

        // Check for escalation (low chance per game hour)
        if (Math.random() < escalateChance * 0.1) {
            const validEscalations = progression.escalate.filter(w => {
                const weatherType = this.weatherTypes[w];
                if (!weatherType) return false;
                return (weatherType.probability[season] || 0) > 0 ||
                       (w === 'thundersnow' && season === 'winter');
            });

            if (validEscalations.length > 0) {
                const newWeather = validEscalations[Math.floor(Math.random() * validEscalations.length)];
                const oldWeatherName = this.weatherTypes[this.currentWeather]?.name || this.currentWeather;
                const newWeatherName = this.weatherTypes[newWeather]?.name || newWeather;

                // 🖤 Escalation duration: 45-180 seconds (0.75 to 3 real minutes)
                this.changeWeather(newWeather, 45 + Math.random() * 135);
                if (typeof addMessage === 'function') {
                    addMessage(`🌀 The ${oldWeatherName} intensifies into ${newWeatherName}!`, 'warning');
                }
            }
        }
    },

    // 🖤 Get next weather using progression system for natural flow
    getNextWeatherFromProgression() {
        const progression = this.weatherProgression[this.currentWeather];
        const season = this.getCurrentSeason();

        // If no progression defined, fall back to random seasonal
        if (!progression) {
            return this.selectWeatherForSeason();
        }

        // 20% chance weather just clears up completely (mercy!)
        if (Math.random() < 0.2 && this.currentWeather !== 'clear') {
            return 'clear';
        }

        // Decide: escalate (get worse), de-escalate (get better), or random
        const roll = Math.random();

        // Severe weather more likely to de-escalate
        const isSevere = ['storm', 'blizzard', 'thundersnow', 'heatwave'].includes(this.currentWeather);
        const deescalateChance = isSevere ? 0.6 : 0.4;

        if (roll < deescalateChance && progression.deescalate.length > 0) {
            // De-escalate - weather gets better
            const options = progression.deescalate.filter(w => {
                const wt = this.weatherTypes[w];
                return wt && (wt.probability[season] > 0 || w === 'clear' || w === 'cloudy');
            });
            if (options.length > 0) {
                return options[Math.floor(Math.random() * options.length)];
            }
        } else if (roll < deescalateChance + 0.25 && progression.escalate.length > 0) {
            // Escalate - weather gets worse
            const options = progression.escalate.filter(w => {
                const wt = this.weatherTypes[w];
                if (!wt) return false;
                // Allow thundersnow in winter even with 0 probability
                return (wt.probability[season] > 0) || (w === 'thundersnow' && season === 'winter');
            });
            if (options.length > 0) {
                return options[Math.floor(Math.random() * options.length)];
            }
        }

        // Fall back to seasonal random selection
        return this.selectWeatherForSeason();
    },

    changeWeather(newWeather, durationOverrideSeconds = null) {
        const weather = this.weatherTypes[newWeather];
        if (!weather) return;

        const oldWeather = this.currentWeather;

        // 🖤 Track weather history for NPC context
        if (oldWeather !== newWeather) {
            this.weatherHistory.unshift({
                weather: oldWeather,
                name: this.weatherTypes[oldWeather]?.name || oldWeather,
                icon: this.weatherTypes[oldWeather]?.icon || '❓',
                endedAt: Date.now(),
                season: this.getCurrentSeason()
            });
            // Keep only last MAX_WEATHER_HISTORY entries
            if (this.weatherHistory.length > this.MAX_WEATHER_HISTORY) {
                this.weatherHistory.pop();
            }
        }

        this.currentWeather = newWeather;
        this.currentIntensity = 0.5 + Math.random() * 0.5;

        // 🖤 Set weather end time in REAL milliseconds
        const durationSeconds = durationOverrideSeconds ||
            (this.MIN_WEATHER_DURATION_SECONDS +
             Math.random() * (this.MAX_WEATHER_DURATION_SECONDS - this.MIN_WEATHER_DURATION_SECONDS));
        this.weatherEndTime = Date.now() + (durationSeconds * 1000);

        // Announce weather change
        if (oldWeather !== newWeather && typeof addMessage === 'function') {
            addMessage(`${weather.icon} Weather changed to ${weather.name}. ${weather.description}`, 'info');
        }

        // Fire event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('weather-changed', {
                weather: newWeather,
                intensity: this.currentIntensity,
                effects: weather.effects
            });
        }

        // 🔮 Also dispatch DOM event for visual systems
        document.dispatchEvent(new CustomEvent('weatherChange', {
            detail: { weather: newWeather, intensity: this.currentIntensity }
        }));

        this.updateVisuals();
    },

    // ═══════════════════════════════════════════════════════════════
    // EFFECTS API
    // ═══════════════════════════════════════════════════════════════
    getWeatherEffects() {
        const weather = this.weatherTypes[this.currentWeather];
        if (!weather) return this.weatherTypes.clear.effects;

        // Scale effects by intensity
        const effects = { ...weather.effects };
        const intensityFactor = 0.5 + this.currentIntensity * 0.5;

        // Only scale negative effects by intensity
        if (effects.travelSpeed < 1) {
            effects.travelSpeed = 1 - (1 - effects.travelSpeed) * intensityFactor;
        }
        if (effects.staminaDrain > 1) {
            effects.staminaDrain = 1 + (effects.staminaDrain - 1) * intensityFactor;
        }

        return effects;
    },

    getTravelSpeedModifier() {
        return this.getWeatherEffects().travelSpeed;
    },

    getPriceModifier() {
        return this.getWeatherEffects().priceModifier;
    },

    getEncounterModifier() {
        return this.getWeatherEffects().encounterChance;
    },

    getStaminaDrainModifier() {
        return this.getWeatherEffects().staminaDrain;
    },

    getCurrentWeatherInfo() {
        const weather = this.weatherTypes[this.currentWeather];
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((this.weatherEndTime - now) / 1000));

        return {
            id: this.currentWeather,
            name: weather?.name || 'Unknown',
            icon: weather?.icon || '❓',
            description: weather?.description || '',
            intensity: this.currentIntensity,
            remainingSeconds: remainingSeconds, // 🖤 REAL seconds remaining
            effects: this.getWeatherEffects(),
            season: this.getCurrentSeason()
        };
    },

    // 🖤 weather context for NPCs - they gotta know if it just stormed or whatever 💀
    getWeatherContext() {
        const current = this.getCurrentWeatherInfo();
        const season = this.getCurrentSeason();
        const seasonData = typeof TimeMachine !== 'undefined' ? TimeMachine.SEASONS[season] : null;

        // 🦇 format recent weather as something an NPC could reference
        let recentWeatherText = '';
        if (this.weatherHistory.length > 0) {
            const recent = this.weatherHistory.slice(0, 3);
            const weatherNames = recent.map(w => w.name);
            if (weatherNames.length === 1) {
                recentWeatherText = `Recently had ${weatherNames[0]}.`;
            } else if (weatherNames.length === 2) {
                recentWeatherText = `Recently had ${weatherNames[0]} and ${weatherNames[1]}.`;
            } else {
                recentWeatherText = `Recent weather: ${weatherNames.join(', ')}.`;
            }
        }

        // 💀 intensity vibes
        const intensityWord = current.intensity > 0.7 ? 'intense' : current.intensity > 0.4 ? 'moderate' : 'light';

        return {
            current: current.name,
            currentIcon: current.icon,
            currentDescription: current.description,
            intensity: intensityWord,
            season: season,
            seasonName: seasonData?.name || season,
            seasonIcon: seasonData?.icon || '',
            recentWeather: recentWeatherText,
            // ⚰️ the full context text NPCs get in their prompts
            contextText: `Current weather: ${current.icon} ${current.name} (${current.description}). Season: ${seasonData?.icon || ''} ${seasonData?.name || season}. ${recentWeatherText}`
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // VISUAL EFFECTS
    // ═══════════════════════════════════════════════════════════════
    createWeatherOverlay() {
        // 🖤 Remove any existing overlay first (might be in wrong location)
        const existing = document.getElementById('weather-overlay');
        if (existing) {
            existing.remove();
            console.log('🌦️ Removed existing weather overlay to recreate');
        }

        // 🖤 Weather overlay goes in map-container (directly over the map)
        // 💀 This ensures particles fall over the actual map area
        const mapContainer = document.getElementById('map-container') || document.getElementById('game-main') || document.getElementById('game-container');
        if (!mapContainer) {
            console.warn('🌦️ map-container not found, weather overlay deferred');
            // Try again later when game loads
            setTimeout(() => this.createWeatherOverlay(), 1000);
            return;
        }

        // 🦇 Ensure position relative for overlay positioning
        if (getComputedStyle(mapContainer).position === 'static') {
            mapContainer.style.position = 'relative';
        }

        const overlay = document.createElement('div');
        overlay.id = 'weather-overlay';
        overlay.className = 'weather-overlay';
        // 🖤 Append to map-container so particles fall over the map
        mapContainer.appendChild(overlay);
        console.log('🌦️ Weather overlay created in', mapContainer.id);

        // Create particle container
        const particles = document.createElement('div');
        particles.id = 'weather-particles';
        particles.className = 'weather-particles';
        overlay.appendChild(particles);

        // 🖤 Create all indicators in top-bar (date, time/phase, weather)
        // 💀 ONLY create if they don't already exist - no more widget rabbit breeding
        const topBarWidgets = document.getElementById('top-bar-widgets');
        if (topBarWidgets) {
            // Date indicator - check first!
            if (!document.getElementById('date-indicator')) {
                const dateIndicator = document.createElement('div');
                dateIndicator.id = 'date-indicator';
                dateIndicator.className = 'top-bar-indicator';
                dateIndicator.innerHTML = `
                    <span class="indicator-icon">📅</span>
                    <span class="indicator-text" id="date-text">April 1, 1111</span>
                `;
                topBarWidgets.appendChild(dateIndicator);
            }

            // Time/Phase indicator (for DayNightCycle) - check first!
            if (!document.getElementById('time-phase-indicator')) {
                const timeIndicator = document.createElement('div');
                timeIndicator.id = 'time-phase-indicator';
                timeIndicator.className = 'top-bar-indicator';
                timeIndicator.innerHTML = `
                    <span class="indicator-icon phase-icon">☀️</span>
                    <span class="indicator-text phase-time">8:00 AM</span>
                `;
                topBarWidgets.appendChild(timeIndicator);
            }

            // Weather indicator - check first!
            if (!document.getElementById('weather-indicator')) {
                const weatherIndicator = document.createElement('div');
                weatherIndicator.id = 'weather-indicator';
                weatherIndicator.className = 'top-bar-indicator';
                weatherIndicator.innerHTML = `
                    <span class="indicator-icon weather-icon">☀️</span>
                    <span class="indicator-text weather-name">Clear Skies</span>
                `;
                topBarWidgets.appendChild(weatherIndicator);
            }
        }
    },

    updateVisuals() {
        const weather = this.weatherTypes[this.currentWeather];
        if (!weather) return;

        const overlay = document.getElementById('weather-overlay');
        const weatherIcon = document.getElementById('weather-icon');
        const weatherDisplay = document.getElementById('weather-display');
        const particles = document.getElementById('weather-particles');

        if (overlay) {
            // Remove all weather classes
            Object.values(this.weatherTypes).forEach(w => {
                overlay.classList.remove(w.visualClass);
            });

            // Add current weather class
            overlay.classList.add(weather.visualClass);

            // Set ambient color
            overlay.style.background = weather.ambientColor;
            overlay.style.opacity = this.currentIntensity;
        }

        // Update top-bar weather indicator
        const indicator = document.getElementById('weather-indicator');
        if (indicator) {
            const iconEl = indicator.querySelector('.weather-icon');
            const nameEl = indicator.querySelector('.weather-name');
            if (iconEl) iconEl.textContent = weather.icon;
            if (nameEl) nameEl.textContent = weather.name;
        }

        // Handle particles
        if (particles) {
            particles.innerHTML = '';

            if (weather.particles) {
                this.createParticles(weather);
            }

            if (weather.lightning) {
                this.startLightning();
            } else {
                this.stopLightning();
            }

            // 💀 Handle meteors for apocalypse weather
            if (weather.meteors) {
                this.startMeteors();
            } else {
                this.stopMeteors();
            }
        }
    },

    createParticles(weather) {
        const particles = document.getElementById('weather-particles');
        if (!particles) {
            console.warn('🌦️ weather-particles container not found');
            return;
        }

        const particleCount = Math.floor(60 * this.currentIntensity);
        const particleChar = weather.id === 'snow' || weather.id === 'blizzard' || weather.id === 'thundersnow' ? '❄️' :
                            weather.id === 'rain' || weather.id === 'storm' ? '💧' : '•';

        console.log(`🌦️ Creating ${particleCount} ${particleChar} particles for ${weather.id}`);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'weather-particle';
            particle.textContent = particleChar;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.animationDuration = `${1 + Math.random() * 2}s`;
            particle.style.animationIterationCount = 'infinite';  // 🖤 Keep looping!
            particle.style.animationTimingFunction = 'linear';

            // 🖤 Use prefixed animation names
            if (weather.id === 'blizzard' || weather.id === 'thundersnow') {
                particle.style.animationName = 'game-blizzard-fall';
            } else if (weather.id === 'snow') {
                particle.style.animationName = 'game-snow-fall';
            } else {
                particle.style.animationName = 'game-rain-fall';
            }

            particles.appendChild(particle);
        }
    },

    lightningInterval: null,
    meteorInterval: null, // 💀 Meteor shower interval

    startLightning() {
        if (this.lightningInterval) return;

        this.lightningInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                this.flashLightning();
            }
        }, 2000);
    },

    stopLightning() {
        if (this.lightningInterval) {
            clearInterval(this.lightningInterval);
            this.lightningInterval = null;
        }
    },

    flashLightning() {
        const overlay = document.getElementById('weather-overlay');
        if (!overlay) return;

        overlay.classList.add('lightning-flash');
        setTimeout(() => {
            overlay.classList.remove('lightning-flash');
        }, 100);

        // Thunder sound would go here if AudioSystem is available
        if (typeof AudioSystem !== 'undefined' && AudioSystem.playSound) {
            AudioSystem.playSound('thunder');
        }
    },

    // 💀 METEOR SHOWER SYSTEM - Apocalyptic dungeon weather
    // ═══════════════════════════════════════════════════════════════
    startMeteors() {
        if (this.meteorInterval) return;
        console.log('☄️ Starting meteor shower...');

        // 🦇 Meteors spawn every 3-10 seconds
        const spawnMeteor = () => {
            this.createMeteor();
            // Schedule next meteor in 3-10 seconds
            const nextDelay = 3000 + Math.random() * 7000;
            this.meteorInterval = setTimeout(spawnMeteor, nextDelay);
        };

        // Start immediately
        this.createMeteor();
        // Schedule next
        this.meteorInterval = setTimeout(spawnMeteor, 3000 + Math.random() * 7000);
    },

    stopMeteors() {
        if (this.meteorInterval) {
            clearTimeout(this.meteorInterval);
            this.meteorInterval = null;
        }
        // 💀 Remove any existing meteors
        const particles = document.getElementById('weather-particles');
        if (particles) {
            const meteors = particles.querySelectorAll('.meteor');
            meteors.forEach(m => m.remove());
        }
    },

    createMeteor() {
        const particles = document.getElementById('weather-particles');
        if (!particles) return;

        // 🦇 Create meteor element
        const meteor = document.createElement('div');
        meteor.className = 'meteor';

        // 💀 Random position - start from top, streak diagonally
        const startX = 10 + Math.random() * 80; // 10-90% from left
        const startY = -10; // Start above viewport

        // 🖤 Random size for variety
        const size = 0.8 + Math.random() * 0.6; // 0.8x to 1.4x size

        meteor.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: ${startY}%;
            font-size: ${24 * size}px;
            opacity: 0;
            z-index: 10;
            filter: drop-shadow(0 0 10px #ff6600) drop-shadow(0 0 20px #ff3300);
            animation: meteor-fall ${1.5 + Math.random() * 1}s ease-in forwards;
        `;
        meteor.innerHTML = '☄️';

        particles.appendChild(meteor);

        // 💀 Flash effect when meteor "hits"
        setTimeout(() => {
            this.meteorImpact();
        }, 1200 + Math.random() * 500);

        // 🦇 Remove meteor after animation
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.remove();
            }
        }, 3000);
    },

    meteorImpact() {
        // 💀 Brief red flash for meteor impact
        const overlay = document.getElementById('weather-overlay');
        if (!overlay) return;

        overlay.classList.add('meteor-impact');
        setTimeout(() => {
            overlay.classList.remove('meteor-impact');
        }, 150);

        // 🦇 Optional: play impact sound
        if (typeof AudioSystem !== 'undefined' && AudioSystem.playSound) {
            AudioSystem.playSound('explosion');
        }
    },

    injectStyles() {
        if (document.getElementById('weather-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'weather-system-styles';
        style.textContent = `
            /* 🖤 Weather overlay - INSIDE game-container only, not full page */
            .weather-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: var(--z-weather-overlay, 15) !important; /* 🦇 Use CSS variable, BELOW all panels */
                transition: background 2s ease, opacity 2s ease;
                border-radius: inherit; /* Match container's border-radius */
                isolation: isolate; /* 🖤 Prevent backdrop-filter from bleeding outside */
            }
            .weather-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                border-radius: inherit;
            }
            .weather-particle {
                position: absolute;
                top: -20px;
                font-size: 14px;
                opacity: 0.8;
                animation: game-rain-fall 1.5s linear infinite;
                z-index: 5;
            }
            /* 🖤 Game weather animations - prefixed to avoid conflicts */
            @keyframes game-rain-fall {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(100vh) translateX(20px);
                    opacity: 0.2;
                }
            }
            @keyframes game-snow-fall {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                    opacity: 0.9;
                }
                100% {
                    transform: translateY(100vh) translateX(50px) rotate(360deg);
                    opacity: 0.3;
                }
            }
            @keyframes game-blizzard-fall {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                    opacity: 0.9;
                }
                100% {
                    transform: translateY(100vh) translateX(150px) rotate(720deg);
                    opacity: 0.2;
                }
            }
            .lightning-flash {
                background: rgba(255, 255, 255, 0.8) !important;
                transition: none !important;
            }
            /* Weather/date indicators styled in top-bar via styles.css */

            /* Weather-specific overlay styles */
            .weather-fog {
                backdrop-filter: blur(2px);
            }
            .weather-storm .weather-particle {
                animation-duration: 0.6s !important;
            }
            .weather-rain .weather-particle {
                animation-duration: 1s !important;
            }
            /* 🖤 Thundersnow - Lightning Blizzard - rare and terrifying */
            .weather-thundersnow {
                animation: thundersnow-pulse 4s ease-in-out infinite;
            }
            .weather-thundersnow .weather-particle {
                animation-name: blizzard-fall;
                animation-duration: 0.8s !important;
                text-shadow: 0 0 10px rgba(150, 180, 255, 0.8);
            }
            @keyframes thundersnow-pulse {
                0%, 100% {
                    background: rgba(180, 190, 255, 0.4);
                    filter: brightness(1);
                }
                50% {
                    background: rgba(160, 170, 240, 0.5);
                    filter: brightness(1.1);
                }
            }
            .weather-heatwave {
                animation: heatwave-shimmer 3s ease-in-out infinite;
            }
            @keyframes heatwave-shimmer {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.3; }
            }

            /* 💀 APOCALYPSE WEATHER - Dungeon doom and gloom */
            .weather-apocalypse {
                background: radial-gradient(ellipse at center, rgba(80, 20, 30, 0.4) 0%, rgba(40, 10, 20, 0.6) 100%) !important;
                animation: apocalypse-pulse 3s ease-in-out infinite;
            }
            @keyframes apocalypse-pulse {
                0%, 100% {
                    filter: brightness(1) saturate(1.2);
                    background: radial-gradient(ellipse at center, rgba(80, 20, 30, 0.4) 0%, rgba(40, 10, 20, 0.6) 100%);
                }
                50% {
                    filter: brightness(0.9) saturate(1.4);
                    background: radial-gradient(ellipse at center, rgba(100, 30, 40, 0.5) 0%, rgba(50, 15, 25, 0.7) 100%);
                }
            }

            /* ☄️ Meteor animation - diagonal streak */
            @keyframes meteor-fall {
                0% {
                    opacity: 0;
                    transform: translateX(0) translateY(0) rotate(-45deg) scale(0.5);
                }
                10% {
                    opacity: 1;
                }
                80% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateX(200px) translateY(120vh) rotate(-45deg) scale(1.2);
                }
            }

            /* 🦇 Meteor trail effect */
            .meteor::after {
                content: '';
                position: absolute;
                top: 50%;
                right: 100%;
                width: 80px;
                height: 3px;
                background: linear-gradient(to left, #ff6600, #ff3300, transparent);
                transform: translateY(-50%);
                border-radius: 50%;
                filter: blur(2px);
            }

            /* 💀 Meteor impact flash */
            .meteor-impact {
                background: rgba(255, 100, 50, 0.6) !important;
                transition: none !important;
            }

            /* 🖤 Apocalypse particles - ember/ash */
            .weather-apocalypse .weather-particle {
                animation-name: apocalypse-ember !important;
                color: #ff6600;
                text-shadow: 0 0 5px #ff3300, 0 0 10px #ff0000;
            }
            @keyframes apocalypse-ember {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0.9;
                }
                50% {
                    transform: translateY(50vh) translateX(30px) scale(0.8);
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(100vh) translateX(-20px) scale(0.5);
                    opacity: 0.2;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════
    getState() {
        const now = Date.now();
        return {
            currentWeather: this.currentWeather,
            currentIntensity: this.currentIntensity,
            // 🖤 Save remaining seconds, not absolute timestamp
            remainingSeconds: Math.max(0, Math.floor((this.weatherEndTime - now) / 1000))
        };
    },

    loadState(state) {
        if (state) {
            this.currentWeather = state.currentWeather || 'clear';
            this.currentIntensity = state.currentIntensity || 0.5;
            // 🖤 Restore end time from saved remaining seconds
            const remainingSeconds = state.remainingSeconds || 60;
            this.weatherEndTime = Date.now() + (remainingSeconds * 1000);
            this.updateVisuals();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBUG / CHEAT
    // ═══════════════════════════════════════════════════════════════
    setWeather(weatherId) {
        if (this.weatherTypes[weatherId]) {
            this.changeWeather(weatherId);
            return true;
        }
        return false;
    },

    listWeatherTypes() {
        return Object.keys(this.weatherTypes);
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.WeatherSystem = WeatherSystem;

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => WeatherSystem.init(), 1000));
} else {
    setTimeout(() => WeatherSystem.init(), 1000);
}

console.log('🌦️ WeatherSystem loaded');
