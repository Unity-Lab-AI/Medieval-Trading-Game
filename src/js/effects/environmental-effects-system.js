// ═══════════════════════════════════════════════════════════════
// ENVIRONMENTAL EFFECTS - weather that matches my mood (dark)
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const EnvironmentalEffectsSystem = {
    // settings - dial in your preferred level of aesthetic suffering
    settings: {
        weatherEffectsEnabled: true,
        lightingEnabled: true,
        seasonalEffectsEnabled: true,
        quality: 'medium', // 'low', 'medium', 'high'
        reducedEffects: false
    },

    // 🖤 stored event handlers for cleanup - because even listeners deserve a proper burial
    _eventHandlers: {},
    
    // current state of the universe - always complicated
    currentState: {
        timeOfDay: 'day',
        season: 'spring',
        weather: 'clear',
        location: 'town',
        temperature: 20,
        humidity: 50
    },
    
    // weather patterns - chaotic like sleep schedules at 3am
    weatherPatterns: {
        clear: { probability: 0.6, duration: 30000, nextStates: ['cloudy', 'rain'] },
        cloudy: { probability: 0.25, duration: 20000, nextStates: ['clear', 'rain', 'storm'] },
        rain: { probability: 0.1, duration: 15000, nextStates: ['cloudy', 'storm', 'clear'] },
        storm: { probability: 0.04, duration: 10000, nextStates: ['rain', 'cloudy'] },
        snow: { probability: 0.01, duration: 20000, nextStates: ['clear', 'cloudy'] }
    },

    // seasonal configs - even the sky has moods (spring cries, winter dies)
    seasonalConfigs: {
        spring: {
            temperature: { min: 10, max: 20 },
            humidity: { min: 40, max: 60 },
            // spring showers - the sky cries with you sometimes
            weatherBias: ['clear', 'clear', 'cloudy', 'rain'],
            weatherChance: 0.15, // 15% chance of weather change per check
            colors: {
                sky: '#87CEEB',
                ambient: '#90EE90',
                lighting: '#FFFACD'
            }
        },
        summer: {
            temperature: { min: 20, max: 30 },
            humidity: { min: 30, max: 50 },
            // summer - annoyingly sunny, like overly positive people
            weatherBias: ['clear', 'clear', 'clear', 'clear', 'cloudy'],
            weatherChance: 0.08, // 8% - weather changes less often
            colors: {
                sky: '#00BFFF',
                ambient: '#98FB98',
                lighting: '#FFFFE0'
            }
        },
        autumn: {
            temperature: { min: 5, max: 15 },
            humidity: { min: 50, max: 70 },
            // fall - peak aesthetic season, everything is dying beautifully
            weatherBias: ['clear', 'cloudy', 'cloudy', 'rain'],
            weatherChance: 0.18, // 18% - weather changes more
            colors: {
                sky: '#F0E68C',
                ambient: '#DEB887',
                lighting: '#FFE4B5'
            }
        },
        winter: {
            temperature: { min: -5, max: 5 },
            humidity: { min: 60, max: 80 },
            // winter - my favorite, cold and dark like my soul
            weatherBias: ['clear', 'cloudy', 'cloudy', 'snow'],
            weatherChance: 0.12, // 12% chance
            colors: {
                sky: '#B0C4DE',
                ambient: '#F0F8FF',
                lighting: '#F5F5F5'
            }
        }
    },
    
    // 🏠 Location vibes - every place has its own brand of despair
    locationAtmospheres: {
        town: {
            ambientSounds: ['market', 'city'],
            particleDensity: 0.3,
            lighting: {
                brightness: 1.0,
                contrast: 1.0,
                saturation: 1.0
            },
            atmosphere: 'lively'
        },
        city: {
            ambientSounds: ['city'],
            particleDensity: 0.2,
            lighting: {
                brightness: 0.9,
                contrast: 1.1,
                saturation: 0.9
            },
            atmosphere: 'bustling'
        },
        forest: {
            ambientSounds: ['forest'],
            particleDensity: 0.5,
            lighting: {
                brightness: 0.7,
                contrast: 1.2,
                saturation: 1.3
            },
            atmosphere: 'peaceful'
        },
        mountain: {
            ambientSounds: ['wind'],
            particleDensity: 0.1,
            lighting: {
                brightness: 1.1,
                contrast: 1.3,
                saturation: 1.1
            },
            atmosphere: 'majestic'
        },
        desert: {
            ambientSounds: ['wind'],
            particleDensity: 0.8,
            lighting: {
                brightness: 1.2,
                contrast: 1.4,
                saturation: 0.8
            },
            atmosphere: 'harsh'
        },
        coast: {
            ambientSounds: ['waves', 'seagulls'],
            particleDensity: 0.4,
            lighting: {
                brightness: 1.0,
                contrast: 1.1,
                saturation: 1.2
            },
            atmosphere: 'refreshing'
        },
        mine: {
            ambientSounds: ['mine'],
            particleDensity: 0.6,
            lighting: {
                brightness: 0.5,
                contrast: 1.5,
                saturation: 0.5
            },
            atmosphere: 'dim'
        }
    },
    
    // 🌅 Time-based lighting - the sun sets on my hopes daily
    timeLighting: {
        dawn: {
            hour: [5, 7],
            colors: {
                sky: '#FFB6C1',
                ambient: '#FFA07A',
                lighting: '#FFE4B5'
            },
            brightness: 0.6,
            temperature: 3000
        },
        day: {
            hour: [7, 17],
            colors: {
                sky: '#87CEEB',
                ambient: '#FFFFFF',
                lighting: '#FFFFFF'
            },
            brightness: 1.0,
            temperature: 5500
        },
        dusk: {
            hour: [17, 19],
            colors: {
                sky: '#FF6347',
                ambient: '#FF8C00',
                lighting: '#FFD700'
            },
            brightness: 0.7,
            temperature: 4000
        },
        night: {
            hour: [19, 5],
            colors: {
                sky: '#191970',
                ambient: '#4B0082',
                lighting: '#E6E6FA'
            },
            brightness: 0.3,
            temperature: 2000
        }
    },
    
    // 🎭 Active effects - currently haunting the screen
    activeEffects: {
        weather: null,
        lighting: null,
        particles: [],
        ambient: null
    },
    
    // 🌙 Initialize - summoning the atmosphere demons
    init() {
        this.loadSettings();
        this.createEffectContainers();
        this.setupEventListeners();
        this.startEnvironmentalLoop();
        console.log('🌧️ Environmental effects awakened... the vibe is immaculate');
    },
    
    // 📂 Load settings - digging up past preferences from the void
    loadSettings() {
        const savedSettings = localStorage.getItem('tradingGameEnvironmentalSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                // 🖤 Silent fallback - corrupt data just means we use defaults
                localStorage.removeItem('tradingGameEnvironmentalSettings');
            }
        }
    },

    // 💾 Save settings - preserving your aesthetic choices for eternity
    saveSettings() {
        localStorage.setItem('tradingGameEnvironmentalSettings', JSON.stringify(this.settings));
    },
    
    // 📦 Create effect containers - building the stage for our drama
    createEffectContainers() {
        // weather container - where the tears fall
        this.weatherContainer = document.createElement('div');
        this.weatherContainer.id = 'weather-container';
        // 🖤 PERMANENT FIX: Environmental effects at layer 1-4, BELOW map UI (10+) 💀
        this.weatherContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: var(--z-weather-overlay, 2); /* 🖤 Layer 2 - BELOW map locations/paths 💀 */
            overflow: hidden;
        `;
        document.body.appendChild(this.weatherContainer);

        // lighting container - mood lighting for the mood
        this.lightingContainer = document.createElement('div');
        this.lightingContainer.id = 'lighting-container';
        this.lightingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1; /* 🖤 Layer 1 - BELOW weather, BELOW map UI 💀 */
            mix-blend-mode: multiply;
            opacity: 0.8;
        `;
        document.body.appendChild(this.lightingContainer);

        // atmosphere container - the existential dread layer
        this.atmosphereContainer = document.createElement('div');
        this.atmosphereContainer.id = 'atmosphere-container';
        this.atmosphereContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4; /* 🖤 Layer 4 - ABOVE weather but BELOW map UI (10+) 💀 */
            mix-blend-mode: screen;
            opacity: 0.3;
        `;
        document.body.appendChild(this.atmosphereContainer);
    },
    
    // 👂 Setup event listeners - eavesdropping on the universe
    setupEventListeners() {
        // listen for game events like a nosy neighbor
        // 🖤 Store handlers so we can remove them later
        this._eventHandlers = {
            timeChange: (e) => this.updateTimeOfDay(e.detail),
            seasonChange: (e) => this.updateSeason(e.detail),
            locationChange: (e) => this.updateLocation(e.detail),
            weatherChange: (e) => this.updateWeather(e.detail),
            gameStateChange: (e) => this.updateEnvironmentForGameState(e.detail)
        };

        if (typeof EventManager !== 'undefined') {
            EventManager.addEventListener('timeChange', this._eventHandlers.timeChange);
            EventManager.addEventListener('seasonChange', this._eventHandlers.seasonChange);
            EventManager.addEventListener('locationChange', this._eventHandlers.locationChange);
            EventManager.addEventListener('weatherChange', this._eventHandlers.weatherChange);
            EventManager.addEventListener('gameStateChange', this._eventHandlers.gameStateChange);
        } else {
            // fallback - when even EventManager abandons us
            document.addEventListener('timeChange', this._eventHandlers.timeChange);
            document.addEventListener('seasonChange', this._eventHandlers.seasonChange);
            document.addEventListener('locationChange', this._eventHandlers.locationChange);
            document.addEventListener('weatherChange', this._eventHandlers.weatherChange);
            document.addEventListener('gameStateChange', this._eventHandlers.gameStateChange);
        }

        // 🖤 Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
    },
    
    // ♾️ Start the eternal loop of environmental chaos
    // SIMPLIFIED: Only seasonal changes now - no more rapid color flashing
    startEnvironmentalLoop() {
        // Seasonal lighting updates ONLY - changes with game season (every 3 months in-game)
        // No more time-of-day lighting changes or ambient effect updates
        // This creates a stable, season-based theme that doesn't flash constantly

        // Weather updates disabled - was too chaotic
        // Time-based lighting disabled - was changing colors every minute
        // Ambient effects disabled - was updating every 5 seconds

        console.log('🌧️ Environmental loop simplified - only seasonal themes now');
    },
    
    // Update time of day
    updateTimeOfDay(timeData) {
        const { hour } = timeData;
        let timeOfDay = 'day';
        
        // Determine time of day based on hour
        for (const [time, config] of Object.entries(this.timeLighting)) {
            if (hour >= config.hour[0] && hour < config.hour[1]) {
                timeOfDay = time;
                break;
            }
        }
        
        this.currentState.timeOfDay = timeOfDay;
        this.applyTimeLighting(timeOfDay);
    },
    
    // Apply time-based lighting - DISABLED to prevent color flashing
    // Now only seasonal themes are used (4 themes, changes once per season)
    applyTimeLighting(timeOfDay) {
        // Time-of-day lighting disabled - was causing rapid color changes
        // Only seasonal lighting is now active (spring, summer, autumn, winter)
        return;
    },
    
    // Update season
    updateSeason(seasonData) {
        const { season } = seasonData;
        this.currentState.season = season;
        this.applySeasonalEffects(season);
    },
    
    // Apply seasonal effects
    applySeasonalEffects(season) {
        if (!this.settings.seasonalEffectsEnabled) return;
        
        const seasonConfig = this.seasonalConfigs[season];
        if (!seasonConfig) return;
        
        // Update temperature and humidity
        this.currentState.temperature = this.randomInRange(seasonConfig.temperature.min, seasonConfig.temperature.max);
        this.currentState.humidity = this.randomInRange(seasonConfig.humidity.min, seasonConfig.humidity.max);
        
        // Update atmosphere colors
        this.atmosphereContainer.style.background = `
            radial-gradient(ellipse at center, 
                ${seasonConfig.colors.lighting} 0%, 
                ${seasonConfig.colors.ambient} 100%)
        `;
        
        // Bias weather patterns
        this.biasedWeatherPatterns = seasonConfig.weatherBias;
        
        // Trigger season change event
        if (typeof EventManager !== 'undefined') {
            EventManager.dispatchEvent('seasonEffectChange', { season, config: seasonConfig });
        } else {
            // Fallback to native event dispatching
            document.dispatchEvent(new CustomEvent('seasonEffectChange', {
                detail: { season, config: seasonConfig }
            }));
        }
    },
    
    // Update location
    updateLocation(locationData) {
        const { location } = locationData;
        this.currentState.location = location;
        this.applyLocationAtmosphere(location);
    },
    
    // Apply location-specific atmosphere
    applyLocationAtmosphere(location) {
        const atmosphere = this.locationAtmospheres[location];
        if (!atmosphere) return;
        
        // Update ambient sounds
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.stopAmbient();
            atmosphere.ambientSounds.forEach(sound => {
                AudioSystem.playAmbient(sound);
            });
        }
        
        // Update particle density
        this.updateParticleDensity(atmosphere.particleDensity);
        
        // Update lighting
        this.applyLocationLighting(atmosphere.lighting);
        
        // Trigger location change event
        if (typeof EventManager !== 'undefined') {
            EventManager.dispatchEvent('locationAtmosphereChange', { location, atmosphere });
        } else {
            // Fallback to native event dispatching
            document.dispatchEvent(new CustomEvent('locationAtmosphereChange', {
                detail: { location, atmosphere }
            }));
        }
    },
    
    // Apply location lighting
    applyLocationLighting(lighting) {
        document.documentElement.style.setProperty('--location-brightness', lighting.brightness);
        document.documentElement.style.setProperty('--location-contrast', lighting.contrast);
        document.documentElement.style.setProperty('--location-saturation', lighting.saturation);
        
        // Apply filter to main game container
        const gameContainer = document.querySelector('.game-container') || document.body;
        gameContainer.style.filter = `
            brightness(${lighting.brightness}) 
            contrast(${lighting.contrast}) 
            saturate(${lighting.saturation})
        `;
    },
    
    // Update weather
    updateWeather(weatherData) {
        const { weather, intensity = 0.5 } = weatherData;
        this.currentState.weather = weather;
        this.applyWeatherEffects(weather, intensity);
    },
    
    // Apply weather effects
    applyWeatherEffects(weather, intensity) {
        if (!this.settings.weatherEffectsEnabled) return;
        
        // Clear existing weather effects
        this.clearWeatherEffects();
        
        switch (weather) {
            case 'clear':
                this.applyClearWeather();
                break;
            case 'cloudy':
                this.applyCloudyWeather(intensity);
                break;
            case 'rain':
                this.applyRainWeather(intensity);
                break;
            case 'storm':
                this.applyStormWeather(intensity);
                break;
            case 'snow':
                this.applySnowWeather(intensity);
                break;
            case 'fog':
                this.applyFogWeather(intensity);
                break;
            case 'sandstorm':
                this.applySandstormWeather(intensity);
                break;
        }
        
        // Trigger weather change event
        if (typeof EventManager !== 'undefined') {
            EventManager.dispatchEvent('weatherEffectChange', { weather, intensity });
        } else {
            // Fallback to native event dispatching
            document.dispatchEvent(new CustomEvent('weatherEffectChange', {
                detail: { weather, intensity }
            }));
        }
    },
    
    // Clear weather effects
    clearWeatherEffects() {
        this.weatherContainer.innerHTML = '';
        this.activeEffects.particles = [];
    },
    
    // Apply clear weather
    applyClearWeather() {
        // Clear weather - no visual effects needed
        // (Removed floating sun-rays orb as it was distracting)
    },
    
    // Apply cloudy weather - DISABLED (was creating distracting floating white orbs)
    applyCloudyWeather(intensity) {
        // Clouds disabled - they were ugly floating white orbs that looked terrible
        // and distracted from the actual game. RIP clouds, you won't be missed. 🖤
        return;
    },

    createCloud() {
        // Cloud creation disabled - the "clouds" were just sad white blobs
        // that looked like lost souls wandering the screen
        return null;
    },
    
    // 🌧️ Apply rain - the sky weeps with us
    applyRainWeather(intensity) {
        const rainCount = Math.floor(100 * intensity);
        
        for (let i = 0; i < rainCount; i++) {
            const raindrop = this.createRaindrop();
            this.weatherContainer.appendChild(raindrop);
        }
        
        // Add rain sound effect
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playAmbient('rain');
        }
    },
    
    createRaindrop() {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        raindrop.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: 2px;
            height: ${10 + Math.random() * 20}px;
            background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.6));
            animation: fall ${1 + Math.random() * 2}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        return raindrop;
    },
    
    // ⛈️ Apply storm - when the universe is as angry as i am
    applyStormWeather(intensity) {
        this.applyRainWeather(intensity * 1.5);
        this.applyCloudyWeather(intensity);
        
        // Add lightning effect
        const lightning = document.createElement('div');
        lightning.className = 'lightning';
        lightning.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0);
            animation: lightning ${5 + Math.random() * 10}s infinite;
        `;
        this.weatherContainer.appendChild(lightning);
        
        // Add thunder sound effect periodically
        if (typeof TimerManager !== 'undefined') {
            this.thunderSoundTimer = TimerManager.setInterval(() => {
                if (Math.random() < 0.3) {
                    if (typeof AudioSystem !== 'undefined') {
                        AudioSystem.playSound('thunder');
                    }
                }
            }, 10000);
        } else {
            // Fallback to native timer
            this.thunderSoundTimer = TimerManager.setInterval(() => {
                if (Math.random() < 0.3) {
                    if (typeof AudioSystem !== 'undefined') {
                        AudioSystem.playSound('thunder');
                    }
                }
            }, 10000);
        }
    },
    
    // ❄️ Apply snow - frozen tears from heaven
    applySnowWeather(intensity) {
        const snowCount = Math.floor(50 * intensity);
        
        for (let i = 0; i < snowCount; i++) {
            const snowflake = this.createSnowflake();
            this.weatherContainer.appendChild(snowflake);
        }
        
        // Add snow sound effect
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playAmbient('snow');
        }
    },
    
    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: snowfall ${3 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 3}s;
        `;
        return snowflake;
    },
    
    // Apply fog weather
    applyFogWeather(intensity) {
        const fog = document.createElement('div');
        fog.className = 'fog';
        fog.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(200, 200, 200, ${0.3 * intensity}) 0%, 
                rgba(200, 200, 200, ${0.6 * intensity}) 100%);
            animation: fogMove 20s infinite alternate;
        `;
        this.weatherContainer.appendChild(fog);
    },
    
    // Apply sandstorm weather
    applySandstormWeather(intensity) {
        const sandCount = Math.floor(30 * intensity);
        
        for (let i = 0; i < sandCount; i++) {
            const sand = this.createSandParticle();
            this.weatherContainer.appendChild(sand);
        }
        
        // Add sandstorm overlay
        const overlay = document.createElement('div');
        overlay.className = 'sandstorm-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(194, 154, 108, ${0.2 * intensity}) 0%, 
                rgba(222, 184, 135, ${0.1 * intensity}) 50%, 
                rgba(194, 154, 108, ${0.2 * intensity}) 100%);
            animation: sandstormMove 10s infinite linear;
        `;
        this.weatherContainer.appendChild(overlay);
    },
    
    createSandParticle() {
        const sand = document.createElement('div');
        sand.className = 'sand-particle';
        sand.style.cssText = `
            position: absolute;
            top: ${Math.random() * 100}%;
            left: -10px;
            width: ${1 + Math.random() * 2}px;
            height: ${1 + Math.random() * 2}px;
            background: rgba(194, 154, 108, 0.6);
            animation: sandBlow ${2 + Math.random() * 3}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        return sand;
    },
    
    // Get current season from game time
    getCurrentSeasonFromGame() {
        // Check if TimeSystem exists and has month data
        if (typeof TimeSystem !== 'undefined' && TimeSystem.currentTime) {
            const month = TimeSystem.currentTime.month || 1;
            // Months 1-3: Winter, 4-6: Spring, 7-9: Summer, 10-12: Autumn
            if (month >= 1 && month <= 3) return 'winter';
            if (month >= 4 && month <= 6) return 'spring';
            if (month >= 7 && month <= 9) return 'summer';
            if (month >= 10 && month <= 12) return 'autumn';
        }
        return this.currentState.season || 'spring';
    },

    // Simulate weather change - synced with seasons
    simulateWeatherChange() {
        // Sync season with game time
        const gameSeason = this.getCurrentSeasonFromGame();
        if (gameSeason !== this.currentState.season) {
            this.currentState.season = gameSeason;
            this.applySeasonalEffects(gameSeason);
            console.log(`🌤️ Season changed to: ${gameSeason}`);
        }

        const currentWeather = this.currentState.weather;
        const weatherPattern = this.weatherPatterns[currentWeather];
        const seasonConfig = this.seasonalConfigs[gameSeason];

        if (!weatherPattern || !seasonConfig) return;

        // Use seasonal weather chance (varies by season)
        const weatherChance = seasonConfig.weatherChance || 0.15;

        // Check if weather should change
        if (Math.random() < weatherChance) {
            // Use seasonal weather bias for realistic patterns
            const possibleWeather = seasonConfig.weatherBias || weatherPattern.nextStates;
            const nextWeather = possibleWeather[Math.floor(Math.random() * possibleWeather.length)];

            // Don't allow snow outside winter (unless very rare)
            if (nextWeather === 'snow' && gameSeason !== 'winter') {
                // Skip snow in non-winter, pick clear instead
                this.updateWeather({ weather: 'clear', intensity: 0.5 });
                return;
            }

            // Intensity varies - brief showers are lighter
            const intensity = (nextWeather === 'rain' || nextWeather === 'snow')
                ? Math.random() * 0.5 + 0.3  // 0.3-0.8 for precipitation
                : Math.random() * 0.6 + 0.2; // 0.2-0.8 for other

            this.updateWeather({ weather: nextWeather, intensity });
            console.log(`🌤️ Weather changed to: ${nextWeather} (${gameSeason})`);
        }
    },
    
    // Update time-based effects
    updateTimeBasedEffects() {
        const now = new Date();
        const hour = now.getHours();
        
        this.updateTimeOfDay({ hour });
    },
    
    // Update ambient effects
    updateAmbientEffects() {
        // Update particle effects based on current conditions
        const location = this.locationAtmospheres[this.currentState.location];
        if (location) {
            this.updateParticleDensity(location.particleDensity);
        }
    },
    
    // Update particle density
    updateParticleDensity(density) {
        // Disabled ambient particles - they were distracting and caused visual noise
        // Clear any existing particles
        while (this.activeEffects.particles.length > 0) {
            const particle = this.activeEffects.particles.pop();
            if (particle && particle.parentNode) {
                particle.remove();
            }
        }
    },
    
    createAmbientParticle() {
        const particle = document.createElement('div');
        particle.className = 'ambient-particle';
        particle.style.cssText = `
            position: absolute;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: rgba(255, 255, 255, ${0.1 + Math.random() * 0.3});
            border-radius: 50%;
            animation: float ${5 + Math.random() * 10}s infinite ease-in-out;
        `;
        return particle;
    },
    
    // Update environment for game state - SIMPLIFIED
    // Only applies seasonal theme, no rapid state changes
    updateEnvironmentForGameState(gameState) {
        // All game states now use the current season's theme
        // No more state-specific lighting changes that caused color flashing
        console.log('🌧️ Game state changed to:', gameState, '- using seasonal theme');
    },

    applyMenuEnvironment() {
        // Uses current season theme - no special menu lighting
    },

    applyGameplayEnvironment() {
        // Uses current season theme - no dynamic effects
    },

    applyTravelEnvironment() {
        // Uses current season theme - no weather changes during travel
    },

    applyCombatEnvironment() {
        // Uses current season theme - no dramatic combat lighting
    },
    
    // Utility functions
    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Settings management
    setQuality(quality) {
        this.settings.quality = quality;
        
        // Adjust effects based on quality
        switch (quality) {
            case 'low':
                this.reduceEffects();
                break;
            case 'medium':
                this.restoreEffects();
                break;
            case 'high':
                this.enhanceEffects();
                break;
        }
        
        this.saveSettings();
    },
    
    reduceEffects() {
        this.settings.reducedEffects = true;
        // Reduce particle counts, simplify animations, etc.
        this.updateParticleDensity(0.2);
    },
    
    restoreEffects() {
        this.settings.reducedEffects = false;
        // Restore normal effect levels
        this.updateParticleDensity(0.5);
    },
    
    enhanceEffects() {
        this.settings.reducedEffects = false;
        // Increase effect quality and detail
        this.updateParticleDensity(0.8);
    },
    
    toggleWeatherEffects() {
        this.settings.weatherEffectsEnabled = !this.settings.weatherEffectsEnabled;
        if (!this.settings.weatherEffectsEnabled) {
            this.clearWeatherEffects();
        }
        this.saveSettings();
    },
    
    toggleLighting() {
        this.settings.lightingEnabled = !this.settings.lightingEnabled;
        if (!this.settings.lightingEnabled) {
            this.lightingContainer.style.display = 'none';
        } else {
            this.lightingContainer.style.display = 'block';
            this.applyTimeLighting(this.currentState.timeOfDay);
        }
        this.saveSettings();
    },
    
    toggleSeasonalEffects() {
        this.settings.seasonalEffectsEnabled = !this.settings.seasonalEffectsEnabled;
        if (!this.settings.seasonalEffectsEnabled) {
            this.atmosphereContainer.style.display = 'none';
        } else {
            this.atmosphereContainer.style.display = 'block';
            this.applySeasonalEffects(this.currentState.season);
        }
        this.saveSettings();
    },
    
    // 🧹 Cleanup - tidying up before the eternal void
    cleanup() {
        // 🖤 Remove event listeners first - let them rest in peace
        if (this._eventHandlers) {
            if (typeof EventManager !== 'undefined' && EventManager.removeEventListener) {
                EventManager.removeEventListener('timeChange', this._eventHandlers.timeChange);
                EventManager.removeEventListener('seasonChange', this._eventHandlers.seasonChange);
                EventManager.removeEventListener('locationChange', this._eventHandlers.locationChange);
                EventManager.removeEventListener('weatherChange', this._eventHandlers.weatherChange);
                EventManager.removeEventListener('gameStateChange', this._eventHandlers.gameStateChange);
            } else {
                document.removeEventListener('timeChange', this._eventHandlers.timeChange);
                document.removeEventListener('seasonChange', this._eventHandlers.seasonChange);
                document.removeEventListener('locationChange', this._eventHandlers.locationChange);
                document.removeEventListener('weatherChange', this._eventHandlers.weatherChange);
                document.removeEventListener('gameStateChange', this._eventHandlers.gameStateChange);
            }
            this._eventHandlers = {};
        }

        // clear timers - stop the loops of despair
        if (typeof TimerManager !== 'undefined') {
            if (this.weatherUpdateTimer) TimerManager.clearInterval(this.weatherUpdateTimer);
            if (this.timeEffectsTimer) TimerManager.clearInterval(this.timeEffectsTimer);
            if (this.ambientEffectsTimer) TimerManager.clearInterval(this.ambientEffectsTimer);
            if (this.thunderSoundTimer) TimerManager.clearInterval(this.thunderSoundTimer);
        } else {
            // Fallback to native timer clearing
            if (this.weatherUpdateTimer) clearInterval(this.weatherUpdateTimer);
            if (this.timeEffectsTimer) clearInterval(this.timeEffectsTimer);
            if (this.ambientEffectsTimer) clearInterval(this.ambientEffectsTimer);
            if (this.thunderSoundTimer) clearInterval(this.thunderSoundTimer);
        }

        // Remove containers
        if (this.weatherContainer) this.weatherContainer.remove();
        if (this.lightingContainer) this.lightingContainer.remove();
        if (this.atmosphereContainer) this.atmosphereContainer.remove();

        // Clear active effects
        this.activeEffects.particles = [];
        this.activeEffects.weather = null;
        this.activeEffects.lighting = null;
        this.activeEffects.ambient = null;
    }
};

// Add CSS animations
const environmentalStyles = document.createElement('style');
environmentalStyles.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.6; }
    }
    
    @keyframes drift {
        0% { transform: translateX(-100px); }
        100% { transform: translateX(calc(100vw + 100px)); }
    }
    
    @keyframes fall {
        0% { transform: translateY(-10px); }
        100% { transform: translateY(calc(100vh + 10px)); }
    }
    
    @keyframes snowfall {
        0% { transform: translateY(-10px) translateX(0); }
        50% { transform: translateY(50vh) translateX(20px); }
        100% { transform: translateY(calc(100vh + 10px)) translateX(-20px); }
    }
    
    @keyframes lightning {
        0%, 90%, 100% { background: rgba(255, 255, 255, 0); }
        95% { background: rgba(255, 255, 255, 0.8); }
    }
    
    @keyframes fogMove {
        0% { opacity: 0.3; }
        50% { opacity: 0.6; }
        100% { opacity: 0.4; }
    }
    
    @keyframes sandstormMove {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    @keyframes sandBlow {
        0% { transform: translateX(-10px); }
        100% { transform: translateX(calc(100vw + 10px)); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(10px) translateX(-10px); }
        75% { transform: translateY(-10px) translateX(5px); }
    }
`;
document.head.appendChild(environmentalStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentalEffectsSystem;
}