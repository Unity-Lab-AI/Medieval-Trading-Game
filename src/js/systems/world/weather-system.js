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
    weatherDuration: 0, // Hours remaining
    seasonalModifier: 1,

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
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('🌦️ WeatherSystem: Forecasting chaos...');

        this.injectStyles();
        this.createWeatherOverlay();
        this.setupTimeListener();

        // Set initial weather
        this.changeWeather(this.selectWeatherForSeason());

        console.log('🌦️ WeatherSystem: Ready!');
    },

    setupTimeListener() {
        // Check weather every game hour
        if (typeof EventBus !== 'undefined') {
            EventBus.on('time-hour-passed', () => this.updateWeather());
        }

        // Also listen to TimeSystem directly
        if (typeof TimerManager !== 'undefined') {
            TimerManager.setInterval(() => {
                if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
                    this.updateWeather();
                }
            }, 60000); // Check every real minute
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

    updateWeather() {
        // Decrease duration
        if (this.weatherDuration > 0) {
            this.weatherDuration--;

            // Apply damage if weather is damaging
            const weather = this.weatherTypes[this.currentWeather];
            if (weather?.damaging && weather.damagePerHour && typeof game !== 'undefined' && game.player) {
                game.player.stats.health = Math.max(1,
                    game.player.stats.health - weather.damagePerHour
                );
                if (typeof addMessage === 'function') {
                    addMessage(`${weather.icon} The ${weather.name} is taking its toll! (-${weather.damagePerHour} HP)`, 'warning');
                }
            }

            // 🖤 Weather can escalate mid-duration! Storm bringing rain, lightning starting, etc.
            this.checkWeatherEscalation();
        }

        // Change weather if duration expired
        if (this.weatherDuration <= 0) {
            // Use progression system for natural weather flow
            const nextWeather = this.getNextWeatherFromProgression();
            this.changeWeather(nextWeather);
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
                this.changeWeather('thundersnow', 2 + Math.floor(Math.random() * 3));
                if (typeof addMessage === 'function') {
                    addMessage('⚡❄️ The storm transforms into a terrifying lightning blizzard!', 'danger');
                }
                return;
            }
        }

        // Check for escalation
        if (Math.random() < escalateChance * 0.1) { // Scale down since this runs every hour
            const validEscalations = progression.escalate.filter(w => {
                const weatherType = this.weatherTypes[w];
                if (!weatherType) return false;
                // Check if weather is valid for current season
                return (weatherType.probability[season] || 0) > 0 ||
                       // Always allow thundersnow in winter regardless of base probability
                       (w === 'thundersnow' && season === 'winter');
            });

            if (validEscalations.length > 0) {
                const newWeather = validEscalations[Math.floor(Math.random() * validEscalations.length)];
                const oldWeatherName = this.weatherTypes[this.currentWeather]?.name || this.currentWeather;
                const newWeatherName = this.weatherTypes[newWeather]?.name || newWeather;

                this.changeWeather(newWeather, 2 + Math.floor(Math.random() * 4));
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

    changeWeather(newWeather, duration = null) {
        const weather = this.weatherTypes[newWeather];
        if (!weather) return;

        const oldWeather = this.currentWeather;
        this.currentWeather = newWeather;
        this.currentIntensity = 0.5 + Math.random() * 0.5;
        this.weatherDuration = duration || (3 + Math.floor(Math.random() * 8)); // 3-10 hours

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
        return {
            id: this.currentWeather,
            name: weather?.name || 'Unknown',
            icon: weather?.icon || '❓',
            description: weather?.description || '',
            intensity: this.currentIntensity,
            duration: this.weatherDuration,
            effects: this.getWeatherEffects()
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // VISUAL EFFECTS
    // ═══════════════════════════════════════════════════════════════
    createWeatherOverlay() {
        if (document.getElementById('weather-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'weather-overlay';
        overlay.className = 'weather-overlay';
        document.body.appendChild(overlay);

        // Create particle container
        const particles = document.createElement('div');
        particles.id = 'weather-particles';
        particles.className = 'weather-particles';
        overlay.appendChild(particles);

        // Create date indicator in top-bar
        const topBarWidgets = document.getElementById('top-bar-widgets');
        if (topBarWidgets) {
            // Date indicator
            const dateIndicator = document.createElement('div');
            dateIndicator.id = 'date-indicator';
            dateIndicator.className = 'top-bar-indicator';
            dateIndicator.innerHTML = `
                <span class="indicator-icon">📅</span>
                <span class="indicator-text" id="date-text">April 1, 1111</span>
            `;
            topBarWidgets.appendChild(dateIndicator);

            // Weather indicator
            const weatherIndicator = document.createElement('div');
            weatherIndicator.id = 'weather-indicator';
            weatherIndicator.className = 'top-bar-indicator';
            weatherIndicator.innerHTML = `
                <span class="indicator-icon weather-icon">☀️</span>
                <span class="indicator-text weather-name">Clear Skies</span>
            `;
            topBarWidgets.appendChild(weatherIndicator);
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
        }
    },

    createParticles(weather) {
        const particles = document.getElementById('weather-particles');
        if (!particles) return;

        const particleCount = Math.floor(50 * this.currentIntensity);
        const particleChar = weather.id === 'snow' || weather.id === 'blizzard' ? '❄' :
                            weather.id === 'rain' || weather.id === 'storm' ? '💧' : '•';

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'weather-particle';
            particle.textContent = particleChar;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.animationDuration = `${1 + Math.random() * 2}s`;

            if (weather.id === 'blizzard') {
                particle.style.animationName = 'blizzard-fall';
            } else if (weather.id === 'snow') {
                particle.style.animationName = 'snow-fall';
            } else {
                particle.style.animationName = 'rain-fall';
            }

            particles.appendChild(particle);
        }
    },

    lightningInterval: null,

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

    injectStyles() {
        if (document.getElementById('weather-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'weather-system-styles';
        style.textContent = `
            .weather-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9000;
                transition: background 2s ease, opacity 2s ease;
            }
            .weather-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .weather-particle {
                position: absolute;
                top: -20px;
                font-size: 12px;
                opacity: 0.7;
                animation: rain-fall 1s linear infinite;
            }
            @keyframes rain-fall {
                to {
                    transform: translateY(100vh) translateX(10px);
                    opacity: 0;
                }
            }
            @keyframes snow-fall {
                to {
                    transform: translateY(100vh) translateX(30px) rotate(360deg);
                    opacity: 0;
                }
            }
            @keyframes blizzard-fall {
                to {
                    transform: translateY(100vh) translateX(100px) rotate(720deg);
                    opacity: 0;
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
                animation-duration: 0.5s !important;
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
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════
    getState() {
        return {
            currentWeather: this.currentWeather,
            currentIntensity: this.currentIntensity,
            weatherDuration: this.weatherDuration
        };
    },

    loadState(state) {
        if (state) {
            this.currentWeather = state.currentWeather || 'clear';
            this.currentIntensity = state.currentIntensity || 0.5;
            this.weatherDuration = state.weatherDuration || 5;
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
