// 
// WEATHER SYSTEM - nature's middle finger
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const WeatherSystem = {
    // 
    // CONFIGURATION
    // 
    initialized: false, // prevent double initialization
    currentWeather: 'clear',
    currentIntensity: 0.5, // 0-1 scale
    weatherEndTime: 0, // real timestamp when weather ends (prevents speed spam)
    seasonalModifier: 1,

    // Remember the sky's moods - NPCs need context for their bitching
    weatherHistory: [],
    MAX_WEATHER_HISTORY: 5,

    // Real seconds of YOUR life - the weather doesn't care about your game speed
    MIN_WEATHER_DURATION_SECONDS: 60,   // at least 1 real minute per weather
    MAX_WEATHER_DURATION_SECONDS: 300,  // up to 5 real minutes per weather

    // Even nature needs a fucking break from its own cruelty
    // Bad weather = rain, storm, blizzard, thundersnow, heatwave
    // After MAX bad cycles, I FORCE mercy - clear skies or you'll riot
    badWeatherStreak: 0,           // How many bad weather periods in a row
    goodWeatherStreak: 0,          // How many good weather periods in a row
    MAX_BAD_WEATHER_STREAK: 2,     // Max 2 bad weather periods (~10 min real time = ~1 game day)
    MIN_GOOD_WEATHER_AFTER_BAD: 3, // Force 3 good weather periods after bad streak
    forcingGoodWeather: false,     // Currently forcing good weather?
    lastWeatherCheck: 0, // Prevent multiple checks per frame

    // How the sky spirals from bad to worse, or mercifully improves
    // Each weather can get better or worse - nature's mood swings
    weatherProgression: {
        clear: { escalate: ['cloudy', 'windy'], deescalate: [], chance: 0.2 },
        cloudy: { escalate: ['rain', 'fog', 'windy'], deescalate: ['clear'], chance: 0.35 },
        windy: { escalate: ['storm', 'cloudy'], deescalate: ['clear'], chance: 0.25 },
        rain: { escalate: ['storm'], deescalate: ['cloudy', 'clear'], chance: 0.4 },
        storm: { escalate: ['rain'], deescalate: ['rain', 'cloudy'], chance: 0.3 }, // Storms birth more rain before they die
        fog: { escalate: ['rain'], deescalate: ['cloudy', 'clear'], chance: 0.2 },
        snow: { escalate: ['blizzard', 'thundersnow'], deescalate: ['cloudy', 'clear'], chance: 0.35 },
        blizzard: { escalate: ['thundersnow'], deescalate: ['snow', 'cloudy'], chance: 0.15 },
        thundersnow: { escalate: [], deescalate: ['blizzard', 'snow'], chance: 0 }, // Rock bottom - nowhere to go but up
        heatwave: { escalate: ['storm'], deescalate: ['clear', 'cloudy'], chance: 0.25 } // Scorching heat breeds violent storms
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
                travelSpeed: 0.9, // was 0.7 - too harsh! now only 10% slower
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
                travelSpeed: 0.75, // was 0.4 - way too harsh! now 25% slower
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
                travelSpeed: 0.85, // was 0.5 - too harsh! now 15% slower
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
                travelSpeed: 0.85, // was 0.6 - too harsh! now 15% slower
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
                travelSpeed: 0.7, // was 0.25 - way too harsh! now 30% slower
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
            icon: '❄️',
            description: 'Thunder echoes through the blinding snow. A rare and terrifying phenomenon.',
            effects: {
                travelSpeed: 0.6, // was 0.15 - insanely harsh! now 40% slower (worst weather)
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
        //  APOCALYPSE WEATHER - Dungeon-only event weather
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
            meteors: true // special meteor effect
        }
    },

    // 
    // INITIALIZATION
    // 

    //  Pending weather to use when init() runs (set by menu system)
    pendingMenuWeather: null,

    //  Map menu weather types to game weather types
    menuToGameWeatherMap: {
        'storm': 'storm',
        'winter': 'snow',
        'thundersnow': 'thundersnow',
        'autumn': 'windy',      // Autumn winds → windy
        'spring': 'rain',       // Spring showers → light rain
        'summer': 'clear'       // Summer sun → clear
        //  'apocalypse' is NOT mapped - it's a menu-only easter egg!
    },

    //  Called from startNewGame to transfer menu weather into the game
    // Weather persists for the entire first in-game day before normal weather kicks in
    setInitialWeatherFromMenu(menuWeatherType) {
        //  Apocalypse weather is MENU-ONLY easter egg - never enters game world!
        // If someone sees doom weather on menu, game starts with normal weather instead
        if (menuWeatherType === 'apocalypse') {
            console.log('☄️ Apocalypse weather was on menu - but doom stays on the menu screen! 🦇');
            console.log('🌤️ Starting game with normal seasonal weather instead...');
            // Pick a random non-doom weather for game start
            const normalWeathers = ['clear', 'cloudy', 'rain', 'windy'];
            const gameWeather = normalWeathers[Math.floor(Math.random() * normalWeathers.length)];
            this.changeWeather(gameWeather, 300); // 5 minutes real time
            return;
        }

        const gameWeather = this.menuToGameWeatherMap[menuWeatherType] || 'clear';
        console.log(`🌦️ Menu weather '${menuWeatherType}' → Game weather '${gameWeather}'`);

        //  WeatherSystem.init() has already been called by now, so we need to
        // immediately apply the weather instead of setting a pending value
        // Recreate overlay if needed (in case it's in wrong container or missing)
        this.ensureOverlayReady();

        //  Lock weather for the first in-game day (24 game hours = 1440 game minutes)
        // This ensures the menu weather persists until the next day
        if (typeof TimeSystem !== 'undefined') {
            const currentMinutes = TimeSystem.getTotalMinutes();
            // Calculate minutes until end of current day (midnight)
            const minutesInDay = 24 * 60; // 1440 minutes
            const currentDayMinutes = currentMinutes % minutesInDay;
            const minutesUntilMidnight = minutesInDay - currentDayMinutes;
            // Lock until end of day (at least 12 hours, up to 24 hours depending on start time)
            const lockDuration = Math.max(minutesUntilMidnight, 12 * 60); // At least 12 game hours
            this.lockWeatherUntil = currentMinutes + lockDuration;
            console.log(`🌦️ Weather locked for first day: ${lockDuration} game minutes (until minute ${this.lockWeatherUntil})`);
        }

        // Apply the weather with a very long real-time duration (10 real minutes minimum)
        // The lockWeatherUntil will prevent normal weather changes anyway
        this.changeWeather(gameWeather, 600); // 10 minutes real time
        console.log(`🌦️ Game weather applied: ${gameWeather} (locked for first day)`);
    },

    //  Ensure the overlay is in the right place and ready for visuals
    ensureOverlayReady() {
        const overlay = document.getElementById('game-weather-overlay');
        //  Weather overlay should be in map-container (not game-container)
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

    // 
    //  EVENT-DRIVEN WEATHER TRIGGERS - Dungeons, quests, encounters
    // 

    //  Store the weather before an event so we can restore it
    savedWeatherBeforeEvent: null,
    eventWeatherActive: false,

    //  Event weather triggers - what weather to use for different events
    eventWeatherTriggers: {
        // Dungeons & dangerous locations
        dungeon_enter: { weather: 'storm', message: 'Dark clouds gather as you enter...' },
        dungeon_boss: { weather: 'thundersnow', message: '🌩️ The sky itself trembles with fury!' },
        dungeon_victory: { weather: 'clear', message: '☀️ The skies clear as evil is vanquished!' },
        dungeon_defeat: { weather: 'fog', message: '🌫️ A thick fog rolls in, shrouding your retreat...' },

        // Random encounters
        encounter_bandit: { weather: 'fog', message: '🌫️ Figures emerge from the mist...' },
        encounter_merchant: { weather: 'clear', message: '☀️ A pleasant day for trade!' },
        encounter_beast: { weather: 'storm', message: 'Thunder rolls as the beast approaches!' },

        // Quest events
        quest_dark_ritual: { weather: 'thundersnow', message: '🌩️ Unnatural lightning splits the sky!' },
        quest_blessing: { weather: 'clear', message: '☀️ Divine light breaks through the clouds!' },
        quest_curse: { weather: 'fog', message: '🌫️ An unnatural darkness descends...' },
        quest_complete: { weather: null, message: '🌤️ Peace returns to the land.' }, // null = restore previous

        // Location-based
        haunted_location: { weather: 'fog', message: '🌫️ The air grows cold and still...' },
        sacred_ground: { weather: 'clear', message: '☀️ Warmth radiates from this holy place.' },
        cursed_land: { weather: 'storm', message: 'This land rejects the living!' }
    },

    //  Trigger event-based weather change
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

    //  Restore weather after event ends
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

    //  Force specific weather (for quests/scripts)
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

    // 
    //  WEATHER CONTEXT FOR API - provides weather info to text/TTS APIs
    // 

    //  Track weather history for API context
    weatherHistory: [],
    maxHistoryLength: 5,

    //  Get weather context string for API prompts
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

    //  Get detailed weather object for API (JSON format)
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

    //  Note: Weather history is tracked in changeWeather() directly
    // The weatherHistory array stores old weather as it changes

    init() {
        //  Prevent double initialization - no duplicate weather popups!
        if (this.initialized) {
            console.log('🌦️ WeatherSystem: Already initialized, skipping...');
            return;
        }
        this.initialized = true;
        console.log('🌦️ WeatherSystem: Forecasting chaos...');

        this.injectStyles();
        this.createWeatherOverlay();
        this.setupTimeListener();

        //  Use pending menu weather if set, otherwise generate random
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
        // Pulse check every 10 seconds - the sky shifts on MY time, not yours
        // Real seconds tick by - game speed can't touch this
        if (typeof TimerManager !== 'undefined') {
            TimerManager.setInterval(() => {
                if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
                    this.updateWeather();
                }
            }, 10000); // 10 real seconds - tick tock, the world turns
        }

        // Every game hour, roll the dice - will the sky get angrier?
        if (typeof EventBus !== 'undefined') {
            EventBus.on('time-hour-passed', () => {
                // Just escalation checks - full changes happen elsewhere
                if (!TimeSystem.isPaused) {
                    this.checkWeatherEscalation();
                }
            });
        }
    },

    // 
    // WEATHER LOGIC
    // 
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

        // Roll the weighted dice - not all weather is created equal
        let random = Math.random() * totalWeight;
        for (const item of weights) {
            random -= item.weight;
            if (random <= 0) {
                return item.id;
            }
        }

        return 'clear';
    },

    //  Weather lock for seasonal transitions - don't change weather until this game-minute
    lockWeatherUntil: 0,

    updateWeather() {
        const now = Date.now();

        //  Prevent spam - only check once per second max
        if (now - this.lastWeatherCheck < 1000) return;
        this.lastWeatherCheck = now;

        //  Check if weather is locked (first day / seasonal transition)
        if (this.lockWeatherUntil > 0 && typeof TimeSystem !== 'undefined') {
            const currentMinutes = TimeSystem.getTotalMinutes();
            if (currentMinutes < this.lockWeatherUntil) {
                //  Weather locked - extend real-time duration to prevent changes
                // Keep pushing the end time forward while locked
                this.weatherEndTime = now + 60000; // Always 1 minute in the future while locked
                this.updateVisuals();
                return;
            } else {
                //  Lock expired - now allow normal weather changes
                this.lockWeatherUntil = 0;
                // Set a reasonable end time for the current weather to change soon
                this.weatherEndTime = now + (this.MIN_WEATHER_DURATION_SECONDS * 1000);
                console.log('🌦️ First day weather lock expired - normal weather changes resume');
            }
        }

        //  Check if weather duration has expired (REAL time)
        if (this.weatherEndTime > 0 && now >= this.weatherEndTime) {
            // Weather duration expired - time to change
            const nextWeather = this.getNextWeatherFromProgression();
            this.changeWeather(nextWeather);
        }

        //  Apply damage for damaging weather (only once per check)
        const weather = this.weatherTypes[this.currentWeather];
        if (weather?.damaging && weather.damagePerHour && typeof game !== 'undefined' && game.player) {
            // Scale damage by how often we check (every 10 seconds = 1/360th of an hour)
            const damageThisTick = weather.damagePerHour / 360;
            game.player.stats.health = Math.max(1, game.player.stats.health - damageThisTick);
        }

        this.updateVisuals();
    },

    //  Check if current weather should escalate (get worse) mid-duration
    checkWeatherEscalation() {
        const progression = this.weatherProgression[this.currentWeather];
        if (!progression || progression.escalate.length === 0) return;

        const season = this.getCurrentSeason();

        // Higher chance to escalate in certain conditions
        let escalateChance = progression.chance;

        // Winter increases chance of snow  blizzard escalation
        if (season === 'winter' && (this.currentWeather === 'snow' || this.currentWeather === 'blizzard')) {
            escalateChance *= 1.5;
        }

        // Storm has chance to bring rain or escalate to thundersnow in winter
        if (this.currentWeather === 'storm' && season === 'winter') {
            // Storm in winter can become thundersnow!
            if (Math.random() < 0.1) {
                this.changeWeather('thundersnow', 60 + Math.random() * 120); // 1-3 real minutes
                if (typeof addMessage === 'function') {
                    addMessage('❄️ The storm transforms into a terrifying lightning blizzard!', 'danger');
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

                //  Escalation duration: 45-180 seconds (0.75 to 3 real minutes)
                this.changeWeather(newWeather, 45 + Math.random() * 135);
                if (typeof addMessage === 'function') {
                    addMessage(`🌀 The ${oldWeatherName} intensifies into ${newWeatherName}!`, 'warning');
                }
            }
        }
    },

    //  Check if weather type is considered "bad" (affects travel/stamina negatively)
    isBadWeather(weatherId) {
        return ['rain', 'storm', 'blizzard', 'thundersnow', 'heatwave', 'snow'].includes(weatherId);
    },

    //  Check if weather type is considered "good" (neutral or positive)
    isGoodWeather(weatherId) {
        return ['clear', 'cloudy', 'windy', 'fog'].includes(weatherId);
    },

    //  Get next weather using progression system for natural flow
    getNextWeatherFromProgression() {
        const progression = this.weatherProgression[this.currentWeather];
        const season = this.getCurrentSeason();

        //  ANTI-ENDLESS-BAD-WEATHER: If we're forcing good weather, only return good weather!
        if (this.forcingGoodWeather) {
            this.goodWeatherStreak++;
            console.log(`🌤️ Forcing good weather (${this.goodWeatherStreak}/${this.MIN_GOOD_WEATHER_AFTER_BAD})`);

            // After enough good weather, stop forcing
            if (this.goodWeatherStreak >= this.MIN_GOOD_WEATHER_AFTER_BAD) {
                this.forcingGoodWeather = false;
                this.goodWeatherStreak = 0;
                console.log('🌤️ Good weather streak complete - normal weather resumes');
            }

            // Return only good weather options
            const goodOptions = ['clear', 'cloudy', 'windy'];
            // Prefer clear weather
            if (Math.random() < 0.5) return 'clear';
            return goodOptions[Math.floor(Math.random() * goodOptions.length)];
        }

        //  Track bad weather streaks
        if (this.isBadWeather(this.currentWeather)) {
            this.badWeatherStreak++;
            this.goodWeatherStreak = 0;
            console.log(`⛈️ Bad weather streak: ${this.badWeatherStreak}/${this.MAX_BAD_WEATHER_STREAK}`);

            // If we've had too much bad weather, force good weather!
            if (this.badWeatherStreak >= this.MAX_BAD_WEATHER_STREAK) {
                console.log('☀️ BAD WEATHER LIMIT REACHED - Forcing good weather!');
                this.forcingGoodWeather = true;
                this.badWeatherStreak = 0;
                this.goodWeatherStreak = 0;
                // Immediately return clear weather
                return 'clear';
            }
        } else {
            // Reset bad weather streak on good weather
            this.badWeatherStreak = 0;
        }

        // If no progression defined, fall back to random seasonal
        if (!progression) {
            return this.selectWeatherForSeason();
        }

        // 30% chance weather just clears up completely (mercy!) - increased from 20%
        if (Math.random() < 0.3 && this.currentWeather !== 'clear') {
            return 'clear';
        }

        // Decide: escalate (get worse), de-escalate (get better), or random
        const roll = Math.random();

        //  Severe weather MUCH more likely to de-escalate (was 0.6, now 0.75)
        const isSevere = ['storm', 'blizzard', 'thundersnow', 'heatwave'].includes(this.currentWeather);
        const deescalateChance = isSevere ? 0.75 : 0.5; // Increased from 0.6/0.4

        if (roll < deescalateChance && progression.deescalate.length > 0) {
            // De-escalate - weather gets better
            const options = progression.deescalate.filter(w => {
                const wt = this.weatherTypes[w];
                return wt && (wt.probability[season] > 0 || w === 'clear' || w === 'cloudy');
            });
            if (options.length > 0) {
                return options[Math.floor(Math.random() * options.length)];
            }
        } else if (roll < deescalateChance + 0.15 && progression.escalate.length > 0) {
            //  Escalate chance REDUCED from 0.25 to 0.15 - weather gets worse less often
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

        //  Track weather history for NPC context
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

        //  Set weather end time in REAL milliseconds
        const durationSeconds = durationOverrideSeconds ||
            (this.MIN_WEATHER_DURATION_SECONDS +
             Math.random() * (this.MAX_WEATHER_DURATION_SECONDS - this.MIN_WEATHER_DURATION_SECONDS));
        this.weatherEndTime = Date.now() + (durationSeconds * 1000);

        //  Weather changes silently - the sky speaks for itself 

        // Fire event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('weather-changed', {
                weather: newWeather,
                intensity: this.currentIntensity,
                effects: weather.effects
            });
        }

        //  Also dispatch DOM event for visual systems
        document.dispatchEvent(new CustomEvent('weatherChange', {
            detail: { weather: newWeather, intensity: this.currentIntensity }
        }));

        this.updateVisuals();
    },

    // 
    // EFFECTS API
    // 
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
            remainingSeconds: remainingSeconds, // real seconds remaining
            effects: this.getWeatherEffects(),
            season: this.getCurrentSeason()
        };
    },

    //  weather context for NPCs - they gotta know if it just stormed or whatever 
    getWeatherContext() {
        const current = this.getCurrentWeatherInfo();
        const season = this.getCurrentSeason();
        const seasonData = typeof TimeMachine !== 'undefined' ? TimeMachine.SEASONS[season] : null;

        //  format recent weather as something an NPC could reference
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

        //  intensity vibes
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
            // the full context text NPCs get in their prompts
            contextText: `Current weather: ${current.icon} ${current.name} (${current.description}). Season: ${seasonData?.icon || ''} ${seasonData?.name || season}. ${recentWeatherText}`
        };
    },

    // 
    // VISUAL EFFECTS
    // 
    createWeatherOverlay() {
        //  Remove any existing overlay first (might be in wrong location)
        const existing = document.getElementById('game-weather-overlay');
        if (existing) {
            existing.remove();
            console.log('🌦️ Removed existing weather overlay to recreate');
        }

        //  Weather overlay goes in map-container (directly over the map)
        //  This ensures particles fall over the actual map area
        const mapContainer = document.getElementById('map-container') || document.getElementById('game-main') || document.getElementById('game-container');
        if (!mapContainer) {
            console.warn('🌦️ map-container not found, weather overlay deferred');
            // Try again later when game loads
            setTimeout(() => this.createWeatherOverlay(), 1000);
            return;
        }

        //  Ensure position relative for overlay positioning
        if (getComputedStyle(mapContainer).position === 'static') {
            mapContainer.style.position = 'relative';
        }

        const overlay = document.createElement('div');
        overlay.id = 'game-weather-overlay'; // unique ID to avoid conflicts with VisualEffectsSystem
        overlay.className = 'weather-overlay';
        //  Append to map-container so particles fall over the map
        mapContainer.appendChild(overlay);
        console.log('🌦️ Weather overlay created in', mapContainer.id);

        // Create particle container
        const particles = document.createElement('div');
        particles.id = 'weather-particles';
        particles.className = 'weather-particles';
        overlay.appendChild(particles);

        //  Create all indicators in top-bar (date, time/phase, weather)
        //  ONLY create if they don't already exist - no more widget rabbit breeding
        const topBarWidgets = document.getElementById('top-bar-widgets');
        if (topBarWidgets) {
            // Date indicator - check first!
            if (!document.getElementById('date-indicator')) {
                const dateIndicator = document.createElement('div');
                dateIndicator.id = 'date-indicator';
                dateIndicator.className = 'top-bar-indicator';
                //  Use ACTUAL current date, not hardcoded default! 
                let currentDateStr = 'April 1, 1111'; // Fallback
                if (typeof TimeSystem !== 'undefined' && TimeSystem.getFormattedDate) {
                    currentDateStr = TimeSystem.getFormattedDate();
                }
                dateIndicator.innerHTML = `
                    <span class="indicator-icon">📅</span>
                    <span class="indicator-text" id="date-text">${currentDateStr}</span>
                `;
                topBarWidgets.appendChild(dateIndicator);
            }

            // Time/Phase indicator (for DayNightCycle) - check first!
            if (!document.getElementById('time-phase-indicator')) {
                const timeIndicator = document.createElement('div');
                timeIndicator.id = 'time-phase-indicator';
                timeIndicator.className = 'top-bar-indicator';
                //  Use ACTUAL current time, not hardcoded default! 
                // This prevents time display resetting to 8:00 when overlay is recreated
                let currentTimeStr = '8:00 AM'; // Fallback
                let currentPhaseIcon = '☀️';
                if (typeof TimeSystem !== 'undefined' && TimeSystem.getFormattedClock) {
                    currentTimeStr = TimeSystem.getFormattedClock();
                }
                if (typeof DayNightCycle !== 'undefined' && DayNightCycle.phases && DayNightCycle.currentPhase) {
                    currentPhaseIcon = DayNightCycle.phases[DayNightCycle.currentPhase]?.icon || '☀️';
                }
                timeIndicator.innerHTML = `
                    <span class="indicator-icon phase-icon">${currentPhaseIcon}</span>
                    <span class="indicator-text phase-time">${currentTimeStr}</span>
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

        const overlay = document.getElementById('game-weather-overlay');
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

            //  Handle meteors for apocalypse weather
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

        // Reduced from 60 to 25 max particles for CPU optimization
        const particleCount = Math.floor(25 * this.currentIntensity);
        const isRain = weather.id === 'rain' || weather.id === 'storm';
        const isSnow = weather.id === 'snow' || weather.id === 'blizzard' || weather.id === 'thundersnow';

        //  Use DedupeLogger to prevent console spam - only log when particle count changes
        if (typeof DedupeLogger !== 'undefined') {
            DedupeLogger.logOnChange('weather_particles', `🌦️ Creating ${particleCount} particles for ${weather.id}`, `${weather.id}_${particleCount}`);
        }

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');

            //  Use line-style rain drops (like main menu) instead of emoji
            if (isRain) {
                particle.className = 'game-rain-drop';
                // No text content - it's a styled line
            } else {
                particle.className = 'weather-particle';
                particle.textContent = isSnow ? '❄️' : '•';
            }

            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.animationIterationCount = 'infinite';

            //  Random landing height - particles land on the game world, not just the bottom!
            const landHeight = 50 + Math.random() * 50; // 50-100vh
            particle.style.setProperty('--land-height', `${landHeight}vh`);

            if (isRain) {
                // Rain uses faster animation like menu
                particle.style.animationDuration = `${0.6 + Math.random() * 0.6}s`;
                particle.style.animationName = 'game-rain-fall';
                particle.style.animationTimingFunction = 'linear';
            } else if (weather.id === 'blizzard' || weather.id === 'thundersnow') {
                particle.style.animationDuration = `${1.2 + Math.random() * 2.4}s`;
                particle.style.animationName = 'game-blizzard-fall';
                particle.style.animationTimingFunction = 'linear';
            } else if (weather.id === 'snow') {
                particle.style.animationDuration = `${1.2 + Math.random() * 2.4}s`;
                particle.style.animationName = 'game-snow-fall';
                particle.style.animationTimingFunction = 'linear';
            }

            particles.appendChild(particle);
        }
    },

    lightningInterval: null,
    meteorInterval: null, // meteor shower interval

    startLightning() {
        if (this.lightningInterval) return;

        // FIX: Use TimerManager to prevent memory leaks
        this.lightningInterval = TimerManager.setInterval(() => {
            if (Math.random() < 0.3) {
                this.flashLightning();
            }
        }, 2000);
    },

    stopLightning() {
        if (this.lightningInterval) {
            TimerManager.clearTimeout(this.lightningInterval);
            this.lightningInterval = null;
        }
    },

    flashLightning() {
        const overlay = document.getElementById('game-weather-overlay');
        if (!overlay) return;

        //  Create a SEPARATE flash element so it doesn't interfere with weather overlay
        // This prevents the flash from blanking out other weather effects
        let flashEl = document.getElementById('lightning-flash-effect');
        if (!flashEl) {
            flashEl = document.createElement('div');
            flashEl.id = 'lightning-flash-effect';
            flashEl.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1; /* 🖤 FIXED: Was 16, now inside weather container at layer 1 💀 */
                border-radius: inherit;
                opacity: 0;
                transition: opacity 0.05s ease-out;
            `;
            overlay.appendChild(flashEl);
        }

        //  Flash effect - subtle white/blue glow that fades quickly
        flashEl.style.background = 'rgba(200, 220, 255, 0.15)';
        flashEl.style.boxShadow = 'inset 0 0 60px rgba(150, 200, 255, 0.2)';
        flashEl.style.opacity = '1';

        setTimeout(() => {
            flashEl.style.opacity = '0';
        }, 150); // flash duration to match bolt animation

        // Create lightning bolt that strikes the ground at random position
        const particles = document.getElementById('weather-particles');
        if (particles && Math.random() < 0.8) { // 80% chance to show visible bolt - make them more visible!
            this.createLightningBolt(particles);
        }

        // Thunder sound would go here if AudioSystem is available
        if (typeof AudioSystem !== 'undefined' && AudioSystem.playSound) {
            AudioSystem.playSound('thunder');
        }
    },

    // Create a visible lightning bolt - vertical column that strikes down and leaves a small fire
    createLightningBolt(container) {
        // Random position where lightning will strike
        const strikeX = 10 + Math.random() * 80; // 10-90% from left
        const strikeY = 40 + Math.random() * 50; // 40-90vh - lands on the game world

        // Create the vertical bolt column
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt-column';

        // Calculate bolt height based on where it lands
        const boltHeight = strikeY;

        bolt.style.cssText = `
            position: absolute;
            left: ${strikeX}%;
            top: 0;
            width: 4px;
            height: 0;
            background: linear-gradient(to bottom,
                rgba(255,255,255,0.9) 0%,
                rgba(200,220,255,1) 50%,
                rgba(100,150,255,1) 100%);
            box-shadow: 0 0 10px #fff, 0 0 20px #88ccff, 0 0 40px #4488ff, 0 0 60px #0044ff;
            z-index: 1; /* 🖤 FIXED: Was 100, now inside weather container at layer 1 💀 */
            animation: bolt-strike-down 0.15s ease-out forwards;
            --bolt-height: ${boltHeight}vh;
            transform-origin: top center;
        `;

        // Add some jagged branches to the bolt
        const branchCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'lightning-branch';
            const branchY = 20 + Math.random() * 60; // Branch at 20-80% down the bolt
            const branchDir = Math.random() > 0.5 ? 1 : -1;
            const branchLen = 15 + Math.random() * 25;
            branch.style.cssText = `
                position: absolute;
                top: ${branchY}%;
                left: 50%;
                width: ${branchLen}px;
                height: 2px;
                background: linear-gradient(to ${branchDir > 0 ? 'right' : 'left'}, rgba(200,220,255,1), transparent);
                box-shadow: 0 0 5px #88ccff, 0 0 10px #4488ff;
                transform: rotate(${branchDir * (30 + Math.random() * 30)}deg);
                transform-origin: ${branchDir > 0 ? 'left' : 'right'} center;
            `;
            bolt.appendChild(branch);
        }

        container.appendChild(bolt);

        // After bolt strikes down, create the fire/spark at impact point
        setTimeout(() => {
            // Remove the bolt
            bolt.remove();

            // Create the small fire/spark that persists
            this.createLightningFire(container, strikeX, strikeY);
        }, 150);
    },

    //  Create a small fire effect where lightning struck - persists for a few seconds
    createLightningFire(container, x, y) {
        const fire = document.createElement('div');
        fire.className = 'lightning-fire';
        fire.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}vh;
            transform: translate(-50%, -50%);
            z-index: 1; /* 🖤 FIXED: Was 50, now inside weather container at layer 1 💀 */
        `;

        // Create the fire glow - white/blue core fading to orange edges
        fire.innerHTML = `
            <div class="fire-glow"></div>
            <div class="fire-sparks">✦</div>
        `;

        container.appendChild(fire);

        // Fire burns for 2-4 seconds then fades out
        const burnDuration = 2000 + Math.random() * 2000;
        setTimeout(() => {
            fire.classList.add('fire-fade-out');
            setTimeout(() => fire.remove(), 1000);
        }, burnDuration);
    },

    //  Create off-screen impact effect at bottom edge
    createOffScreenImpact(container, impactX, type) {
        const edgeEffect = document.createElement('div');
        edgeEffect.className = 'offscreen-impact';

        if (type === 'lightning') {
            edgeEffect.innerHTML = '';
            edgeEffect.style.cssText = `
                position: absolute;
                left: ${impactX}%;
                bottom: 0;
                font-size: 40px;
                color: #ffffff;
                animation: offscreen-flash 0.4s ease-out forwards;
                filter: drop-shadow(0 0 20px #88ccff) drop-shadow(0 0 40px #4488ff);
                transform-origin: bottom center;
            `;
        } else {
            // Meteor
            edgeEffect.innerHTML = '🔥';
            edgeEffect.style.cssText = `
                position: absolute;
                left: ${impactX}%;
                bottom: 0;
                font-size: 50px;
                animation: offscreen-burn 0.8s ease-out forwards;
                filter: drop-shadow(0 0 20px #ff6600) drop-shadow(0 0 40px #ff3300);
                transform-origin: bottom center;
            `;
        }

        container.appendChild(edgeEffect);
        setTimeout(() => edgeEffect.remove(), type === 'lightning' ? 400 : 800);
    },

    //  METEOR SHOWER SYSTEM - Apocalyptic dungeon weather
    // 
    startMeteors() {
        if (this.meteorInterval) return;
        console.log('☄️ Starting meteor shower...');

        //  Meteors spawn every 3-10 seconds
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
        //  Remove any existing meteors
        const particles = document.getElementById('weather-particles');
        if (particles) {
            const meteors = particles.querySelectorAll('.meteor');
            meteors.forEach(m => m.remove());
        }
    },

    //  Stop all weather particles - called by quitToMainMenu 
    stopParticles() {
        // Stop lightning
        this.stopLightning();
        // Stop meteors
        this.stopMeteors();
        // Clear all particles
        const particles = document.getElementById('weather-particles');
        if (particles) {
            particles.innerHTML = '';
        }
        // Remove weather overlay effects
        const overlay = document.getElementById('weather-overlay');
        if (overlay) {
            overlay.className = 'weather-overlay';
            overlay.style.background = '';
        }
    },

    createMeteor() {
        const particles = document.getElementById('weather-particles');
        if (!particles) return;

        //  Create meteor element
        const meteor = document.createElement('div');
        meteor.className = 'meteor';

        //  80% land on screen (like lightning), 20% go off screen
        const goesOffScreen = Math.random() < 0.2;

        //  Pick the LANDING position first - this is where the burn effect will appear
        const landX = 20 + Math.random() * 60; // Land at 20-80% from left
        const landY = goesOffScreen ? (100 + Math.random() * 20) : (40 + Math.random() * 50);

        //  Calculate START position - meteors come from upper-left, streak diagonally
        // Start 20-40% to the left and above the landing point
        const travelDistX = 15 + Math.random() * 25; // 15-40% horizontal travel
        const startX = landX - travelDistX;
        const startY = -10; // Start above viewport

        //  Random size for variety
        const size = 0.8 + Math.random() * 0.6; // 0.8x to 1.4x size
        const duration = 1.5 + Math.random() * 1; // 1.5-2.5 seconds
        const durationMs = duration * 1000;

        meteor.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: ${startY}%;
            font-size: ${24 * size}px;
            opacity: 0;
            z-index: 1; /* 🖤 FIXED: Was 10, now inside weather container at layer 1 💀 */
            filter: drop-shadow(0 0 10px #ff6600) drop-shadow(0 0 20px #ff3300);
            transform: rotate(-45deg) scale(0.5);
            transition: none;
        `;
        meteor.innerHTML = '☄️';

        particles.appendChild(meteor);

        //  Animate meteor using JavaScript for precise control
        const startTime = performance.now();
        const animateMeteor = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            // Ease-in function for acceleration
            const eased = progress * progress;

            // Calculate current position
            const currentX = startX + (landX - startX) * eased;
            const currentY = startY + (landY - startY) * eased;

            // Calculate opacity (fade in at start, fade out at end)
            let opacity;
            if (progress < 0.1) {
                opacity = progress / 0.1; // Fade in
            } else if (progress > 0.9) {
                opacity = (1 - progress) / 0.1; // Fade out
            } else {
                opacity = 1;
            }

            // Calculate scale (grow as it falls)
            const scale = 0.5 + 0.7 * eased;

            meteor.style.left = `${currentX}%`;
            meteor.style.top = `${currentY}vh`;
            meteor.style.opacity = opacity;
            meteor.style.transform = `rotate(-45deg) scale(${scale})`;

            if (progress < 1) {
                requestAnimationFrame(animateMeteor);
            }
        };

        requestAnimationFrame(animateMeteor);

        //  Create burn effect where meteor ACTUALLY lands - at end of animation
        setTimeout(() => {
            this.meteorImpact(landX, landY, goesOffScreen);
        }, durationMs);

        //  Remove meteor after animation + small buffer
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.remove();
            }
        }, durationMs + 100);
    },

    meteorImpact(impactX, impactY, goesOffScreen) {
        const particles = document.getElementById('weather-particles');
        if (!particles) return;

        const clampedX = Math.min(90, Math.max(10, impactX));

        if (goesOffScreen) {
            // Meteor went off screen - no visual effect, just disappears
            return;
        } else {
            //  Meteor hit on screen - show explosion then fire
            const burn = document.createElement('div');
            burn.className = 'meteor-burn';
            burn.innerHTML = '💥';
            burn.style.cssText = `
                position: absolute;
                left: ${clampedX}%;
                top: ${impactY}vh;
            `;
            particles.appendChild(burn);

            // Remove burn mark after animation
            setTimeout(() => {
                if (burn.parentNode) burn.remove();
            }, 1500);

            //  Create persistent fire at impact location
            this.createMeteorFire(particles, clampedX, impactY);
        }

        //  Optional: play impact sound
        if (typeof AudioSystem !== 'undefined' && AudioSystem.playSound) {
            AudioSystem.playSound('explosion');
        }
    },

    //  Create a persistent fire effect where meteor struck - orange/red flames
    createMeteorFire(container, x, y) {
        const fire = document.createElement('div');
        fire.className = 'meteor-fire';
        fire.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}vh;
            transform: translate(-50%, -50%);
            z-index: 1; /* 🖤 FIXED: Was 50, now inside weather container at layer 1 💀 */
        `;

        // Create the fire glow - orange/red core with flickering flames
        fire.innerHTML = `
            <div class="meteor-fire-glow"></div>
            <div class="meteor-fire-sparks">✦</div>
        `;

        container.appendChild(fire);

        // Fire burns for 3-6 seconds then fades out (longer than lightning)
        const burnDuration = 3000 + Math.random() * 3000;
        setTimeout(() => {
            fire.classList.add('fire-fade-out');
            setTimeout(() => fire.remove(), 1000);
        }, burnDuration);
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
                z-index: 1 !important; /* Weather at layer 1, BELOW map UI (20+) */
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
                z-index: 1; /* 🖤 FIXED: Was 5, now inside weather container at layer 1 💀 */
            }
            /* 🌧️ Line-style rain drops (like main menu) */
            .game-rain-drop {
                position: absolute;
                top: -20px;
                width: 2px;
                height: 15px;
                background: linear-gradient(180deg, transparent 0%, rgba(174, 194, 224, 0.5) 50%, rgba(174, 194, 224, 0.8) 100%);
                opacity: 0.8;
                z-index: 5;
                pointer-events: none;
            }
            /* 🖤 Game weather animations - particles land at varying heights! */
            /* Rain lands between 60-100% of screen height */
            @keyframes game-rain-fall {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0.8;
                }
                85% {
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(var(--land-height, 100vh)) translateX(20px);
                    opacity: 0;
                }
            }
            /* Snow drifts and lands at varying heights */
            @keyframes game-snow-fall {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                    opacity: 0.9;
                }
                90% {
                    opacity: 0.6;
                }
                100% {
                    transform: translateY(var(--land-height, 100vh)) translateX(50px) rotate(360deg);
                    opacity: 0;
                }
            }
            /* Blizzard - wild horizontal movement, lands at random heights */
            @keyframes game-blizzard-fall {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                    opacity: 0.9;
                }
                85% {
                    opacity: 0.5;
                }
                100% {
                    transform: translateY(var(--land-height, 100vh)) translateX(150px) rotate(720deg);
                    opacity: 0;
                }
            }
            /* 💀 Rain splash effect when landing */
            @keyframes rain-splash {
                0% {
                    transform: scale(1);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            .rain-splash {
                position: absolute;
                font-size: 8px;
                animation: rain-splash 0.3s ease-out forwards;
                pointer-events: none;
            }
            /* 🖤 Lightning flash is now a separate element to prevent blanking other effects */
            /* See flashLightning() - creates #lightning-flash-effect dynamically */

            /* Lightning bolt column - strikes DOWN from top to landing point */
            @keyframes bolt-strike-down {
                0% {
                    height: 0;
                    opacity: 1;
                }
                100% {
                    height: var(--bolt-height, 60vh);
                    opacity: 1;
                }
            }
            .lightning-bolt-column {
                pointer-events: none;
                transform-origin: top center;
            }
            .lightning-branch {
                pointer-events: none;
            }

            /* 🔥 Lightning fire effect - white/blue core that persists after strike */
            .lightning-fire {
                pointer-events: none;
                width: 40px;
                height: 40px;
            }
            .lightning-fire .fire-glow {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255,255,255,0.9) 0%,
                    rgba(200,220,255,0.7) 30%,
                    rgba(100,150,255,0.4) 60%,
                    rgba(255,150,50,0.2) 80%,
                    transparent 100%);
                box-shadow: 0 0 20px rgba(200,220,255,0.8),
                            0 0 40px rgba(100,150,255,0.5),
                            0 0 60px rgba(255,150,50,0.3);
                animation: fire-flicker 0.15s ease-in-out infinite alternate;
            }
            .lightning-fire .fire-sparks {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 20px;
                color: #fff;
                text-shadow: 0 0 10px #88ccff, 0 0 20px #fff;
                animation: spark-pulse 0.3s ease-in-out infinite alternate;
            }
            @keyframes fire-flicker {
                0% {
                    transform: scale(1);
                    opacity: 0.9;
                }
                100% {
                    transform: scale(1.1);
                    opacity: 1;
                }
            }
            @keyframes spark-pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0.7;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 1;
                }
            }
            .lightning-fire.fire-fade-out {
                animation: fire-fade 1s ease-out forwards;
            }
            .lightning-fire.fire-fade-out .fire-glow {
                animation: fire-fade 1s ease-out forwards;
            }
            .lightning-fire.fire-fade-out .fire-sparks {
                animation: fire-fade 0.5s ease-out forwards;
            }
            @keyframes fire-fade {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.5);
                }
            }

            /* ☄️ Meteor fire effect - orange/red flames that persist after impact */
            .meteor-fire {
                pointer-events: none;
                width: 50px;
                height: 50px;
            }
            .meteor-fire .meteor-fire-glow {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255,200,100,1) 0%,
                    rgba(255,120,30,0.8) 30%,
                    rgba(255,60,0,0.5) 60%,
                    rgba(180,0,0,0.3) 80%,
                    transparent 100%);
                box-shadow: 0 0 25px rgba(255,150,50,0.9),
                            0 0 50px rgba(255,80,0,0.6),
                            0 0 80px rgba(200,0,0,0.4);
                animation: meteor-fire-flicker 0.12s ease-in-out infinite alternate;
            }
            .meteor-fire .meteor-fire-sparks {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #ffcc00;
                text-shadow: 0 0 10px #ff6600, 0 0 20px #ff3300, 0 0 30px #ff0000;
                animation: meteor-spark-pulse 0.25s ease-in-out infinite alternate;
            }
            @keyframes meteor-fire-flicker {
                0% {
                    transform: scale(1) rotate(0deg);
                    opacity: 0.85;
                }
                100% {
                    transform: scale(1.15) rotate(5deg);
                    opacity: 1;
                }
            }
            @keyframes meteor-spark-pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.9);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.3);
                    opacity: 1;
                }
            }
            .meteor-fire.fire-fade-out {
                animation: fire-fade 1s ease-out forwards;
            }
            .meteor-fire.fire-fade-out .meteor-fire-glow {
                animation: fire-fade 1s ease-out forwards;
            }
            .meteor-fire.fire-fade-out .meteor-fire-sparks {
                animation: fire-fade 0.5s ease-out forwards;
            }

            /* 🔥 Off-screen impact effects - shows at bottom edge when strikes go off screen */
            @keyframes offscreen-flash {
                0% {
                    transform: scaleY(0.5) scaleX(1);
                    opacity: 1;
                }
                30% {
                    transform: scaleY(2) scaleX(1.5);
                    opacity: 1;
                }
                100% {
                    transform: scaleY(3) scaleX(2);
                    opacity: 0;
                }
            }
            @keyframes offscreen-burn {
                0% {
                    transform: scaleY(0.5) scaleX(1);
                    opacity: 1;
                }
                20% {
                    transform: scaleY(2) scaleX(2);
                    opacity: 1;
                }
                100% {
                    transform: scaleY(4) scaleX(3);
                    opacity: 0;
                }
            }
            .offscreen-impact {
                pointer-events: none;
                z-index: 1; /* 🖤 FIXED: Was 50, now inside weather container at layer 1 💀 */
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

            /* 🔥 Meteor burn/scorch mark where it lands */
            @keyframes meteor-burn {
                0% {
                    transform: scale(0.5);
                    opacity: 1;
                }
                30% {
                    transform: scale(1.5);
                    opacity: 0.9;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            .meteor-burn {
                position: absolute;
                font-size: 30px;
                animation: meteor-burn 1.5s ease-out forwards;
                pointer-events: none;
                filter: drop-shadow(0 0 15px #ff4400) drop-shadow(0 0 30px #ff2200);
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

    // 
    // SAVE/LOAD
    // 
    getState() {
        const now = Date.now();
        return {
            currentWeather: this.currentWeather,
            currentIntensity: this.currentIntensity,
            //  Save remaining seconds, not absolute timestamp
            remainingSeconds: Math.max(0, Math.floor((this.weatherEndTime - now) / 1000)),
            //  Save bad weather protection state
            badWeatherStreak: this.badWeatherStreak,
            goodWeatherStreak: this.goodWeatherStreak,
            forcingGoodWeather: this.forcingGoodWeather
        };
    },

    loadState(state) {
        if (state) {
            this.currentWeather = state.currentWeather || 'clear';
            this.currentIntensity = state.currentIntensity || 0.5;
            //  Restore end time from saved remaining seconds
            const remainingSeconds = state.remainingSeconds || 60;
            this.weatherEndTime = Date.now() + (remainingSeconds * 1000);
            //  Restore bad weather protection state
            this.badWeatherStreak = state.badWeatherStreak || 0;
            this.goodWeatherStreak = state.goodWeatherStreak || 0;
            this.forcingGoodWeather = state.forcingGoodWeather || false;
            this.updateVisuals();
        }
    },

    // 
    // DEBOOGER / CHEAT 
    // 
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

// 
// GLOBAL EXPOSURE
// 
window.WeatherSystem = WeatherSystem;

// register with Bootstrap
Bootstrap.register('WeatherSystem', () => WeatherSystem.init(), {
    dependencies: ['GameWorld', 'TimeSystem'],
    priority: 38,
    severity: 'optional'
});

console.log('🌦️ WeatherSystem loaded');
