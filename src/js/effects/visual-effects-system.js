// ═══════════════════════════════════════════════════════════════
// ✨ VISUAL EFFECTS SYSTEM - dark enchantments for your retinas
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// 💫 Particles dance. Screens shake. Reality bends to my aesthetic will.
// Because even mundane actions deserve theatrical sparkles... 🖤

const VisualEffectsSystem = {
    // 🎨 Visual settings - controlling the chaos with precision
    settings: {
        particlesEnabled: true,
        screenShakeEnabled: true,
        animationsEnabled: true,
        weatherEffectsEnabled: true,
        quality: 'medium', // 'low', 'medium', 'high'
        reducedMotion: false,
        flashWarnings: true
    },
    
    // 🌟 Active effects tracking - cataloging the magic currently manifesting
    activeParticles: [],
    activeAnimations: [],
    screenShakeActive: false,
    weatherActive: null,
    
    // ✨ Particle system - my army of tiny, glowing minions
    particleSystem: {
        container: null,
        maxParticles: 100,
        particleId: 0
    },
    
    // Screen shake system
    screenShake: {
        intensity: 0,
        duration: 0,
        startTime: 0,
        originalTransform: ''
    },
    
    // Weather system
    weatherSystem: {
        currentWeather: 'clear',
        particles: [],
        intensity: 0
    },
    
    // 🌙 Initialize visual effects system - conjuring the spectacle
    init() {
        this.createParticleContainer();
        this.loadSettings();
        this.setupEventListeners();
        console.log('✨ Visual effects system awakened... prepare for beauty and chaos 🖤');
    },
    
    // 📦 Create particle container - building the stage for our tiny performers
    createParticleContainer() {
        this.particleSystem.container = document.createElement('div');
        this.particleSystem.container.id = 'particle-container';
        this.particleSystem.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 75; /* Z-INDEX STANDARD: Visual effects (below UI) */
            overflow: hidden;
        `;
        document.body.appendChild(this.particleSystem.container);
    },
    
    // 💾 Load settings from localStorage - resurrecting past preferences
    loadSettings() {
        const savedSettings = localStorage.getItem('tradingGameVisualSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                // 🖤 Silent fallback - corrupt data just means we use defaults
                localStorage.removeItem('tradingGameVisualSettings');
            }
        }
    },
    
    // 📜 Save settings to localStorage - inscribing choices into the void
    saveSettings() {
        localStorage.setItem('tradingGameVisualSettings', JSON.stringify(this.settings));
    },
    
    // 👂 Setup event listeners - waiting for moments worthy of visual drama
    setupEventListeners() {
        // 🎭 Listen for game events that trigger visual effects - the cues for our performances
        EventManager.addEventListener(document, 'goldTransaction', (e) => this.createGoldParticles(e.detail));
        EventManager.addEventListener(document, 'itemPickup', (e) => this.createItemPickupEffect(e.detail));
        EventManager.addEventListener(document, 'levelUp', (e) => this.createLevelUpEffect(e.detail));
        EventManager.addEventListener(document, 'tradeComplete', (e) => this.createTradeCompleteEffect(e.detail));
        EventManager.addEventListener(document, 'combatAction', (e) => this.createCombatEffect(e.detail));
        EventManager.addEventListener(document, 'screenShake', (e) => this.triggerScreenShake(e.detail));
        EventManager.addEventListener(document, 'weatherChange', (e) => this.updateWeather(e.detail));
        EventManager.addEventListener(document, 'timeChange', (e) => this.updateTimeBasedEffects(e.detail));
    },
    
    // ✨ Particle creation methods - birthing tiny fragments of magic
    createParticle(x, y, options = {}) {
        if (!this.settings.particlesEnabled || !this.particleSystem.container) {
            return null;
        }
        
        const particle = document.createElement('div');
        const particleId = this.particleSystem.particleId++;
        
        // 🎨 Default particle options - the blueprint for sparkly existence
        const defaults = {
            size: 4,
            color: '#FFD700',
            duration: 1000,
            velocity: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 3 - 1 },
            gravity: 0.1,
            fade: true,
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            image: null
        };
        
        const config = { ...defaults, ...options };
        
        // 🎨 Set particle styles - dressing up our magical dots
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${config.size}px;
            height: ${config.size}px;
            background: ${config.image ? `url(${config.image})` : config.color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 75; /* Z-INDEX STANDARD: Visual effects (particles) */
            transform: translate(-50%, -50%) scale(${config.scale}) rotate(${config.rotation}deg);
            ${config.image ? 'background-size: contain; background-repeat: no-repeat;' : ''}
        `;
        
        this.particleSystem.container.appendChild(particle);
        
        // 📊 Track particle - adding this minion to our roster
        const particleData = {
            id: particleId,
            element: particle,
            x: x,
            y: y,
            velocity: config.velocity,
            gravity: config.gravity,
            rotation: config.rotation,
            rotationSpeed: config.rotationSpeed,
            scale: config.scale,
            opacity: 1,
            startTime: Date.now(),
            duration: config.duration,
            fade: config.fade
        };
        
        this.activeParticles.push(particleData);
        
        // ⚖️ Limit particle count - even chaos needs boundaries
        if (this.activeParticles.length > this.particleSystem.maxParticles) {
            const oldestParticle = this.activeParticles.shift();
            if (oldestParticle.element.parentNode) {
                oldestParticle.element.remove();
            }
        }
        
        return particleData;
    },
    
    // 🔄 Update particles animation - orchestrating the dance of light
    updateParticles() {
        const now = Date.now();
        
        this.activeParticles = this.activeParticles.filter(particle => {
            const elapsed = now - particle.startTime;
            
            if (elapsed > particle.duration) {
                if (particle.element.parentNode) {
                    particle.element.remove();
                }
                return false;
            }
            
            // 🔬 Update physics - gravity and velocity conspire
            particle.velocity.y += particle.gravity;
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.rotation += particle.rotationSpeed;
            
            // 👻 Update opacity if fading - slow dissolution into nothingness
            if (particle.fade) {
                particle.opacity = 1 - (elapsed / particle.duration);
            }
            
            // 🌀 Apply transformations - reshaping reality itself
            particle.element.style.transform = `
                translate(${particle.x}px, ${particle.y}px) 
                translate(-50%, -50%) 
                scale(${particle.scale}) 
                rotate(${particle.rotation}deg)
            `;
            particle.element.style.opacity = particle.opacity;
            
            return true;
        });
    },
    
    // 🔁 Start particle animation loop - the eternal cycle begins
    startParticleLoop() {
        const animate = () => {
            this.updateParticles();
            requestAnimationFrame(animate);
        };
        animate();
    },
    
    // 🎆 Specific particle effects - each moment demands its own magic
    createGoldParticles(data) {
        const { x, y, amount } = data;
        const particleCount = Math.min(Math.floor(amount / 10), 20);
        
        for (let i = 0; i < particleCount; i++) {
            TimerManager.setTimeout(() => {
                this.createParticle(x, y, {
                    size: 3 + Math.random() * 3,
                    color: '#FFD700',
                    velocity: {
                        x: (Math.random() - 0.5) * 4,
                        y: -Math.random() * 5 - 2
                    },
                    gravity: 0.2,
                    duration: 1500 + Math.random() * 500
                });
            }, i * 50);
        }
    },
    
    createItemPickupEffect(data) {
        const { x, y, itemType } = data;
        const colors = {
            weapon: '#FF6B6B',
            armor: '#4ECDC4',
            consumable: '#45B7D1',
            tool: '#96CEB4',
            default: '#DDA0DD'
        };
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.createParticle(x, y, {
                size: 4,
                color: colors[itemType] || colors.default,
                velocity: {
                    x: Math.cos(angle) * 3,
                    y: Math.sin(angle) * 3
                },
                gravity: 0.1,
                duration: 800
            });
        }
    },
    
    createLevelUpEffect(data) {
        const { x, y } = data;
        
        // Create upward spiral effect
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const radius = 30 + i * 2;
            
            TimerManager.setTimeout(() => {
                this.createParticle(x, y, {
                    size: 6,
                    color: `hsl(${i * 18}, 100%, 50%)`,
                    velocity: {
                        x: Math.cos(angle) * radius / 10,
                        y: -Math.abs(Math.sin(angle)) * 3 - 2
                    },
                    gravity: -0.05,
                    duration: 2000,
                    rotation: i * 18,
                    rotationSpeed: 5
                });
            }, i * 30);
        }
    },
    
    createTradeCompleteEffect(data) {
        const { x, y, success } = data;
        const color = success ? '#4CAF50' : '#F44336';
        
        // Create burst effect
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.createParticle(x, y, {
                size: 5,
                color: color,
                velocity: {
                    x: Math.cos(angle) * 5,
                    y: Math.sin(angle) * 5
                },
                gravity: 0.15,
                duration: 1200
            });
        }
    },
    
    createCombatEffect(data) {
        const { x, y, type } = data;
        
        switch (type) {
            case 'hit':
                this.createHitEffect(x, y);
                break;
            case 'block':
                this.createBlockEffect(x, y);
                break;
            case 'critical':
                this.createCriticalEffect(x, y);
                break;
            default:
                this.createGenericCombatEffect(x, y);
        }
    },
    
    createHitEffect(x, y) {
        for (let i = 0; i < 6; i++) {
            this.createParticle(x, y, {
                size: 3,
                color: '#FF4444',
                velocity: {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6
                },
                gravity: 0.2,
                duration: 600
            });
        }
    },
    
    createBlockEffect(x, y) {
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            this.createParticle(x, y, {
                size: 4,
                color: '#4444FF',
                velocity: {
                    x: Math.cos(angle) * 2,
                    y: Math.sin(angle) * 2
                },
                gravity: 0,
                duration: 400
            });
        }
    },
    
    createCriticalEffect(x, y) {
        // Create star burst
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            this.createParticle(x, y, {
                size: 6,
                color: '#FFD700',
                velocity: {
                    x: Math.cos(angle) * 8,
                    y: Math.sin(angle) * 8
                },
                gravity: 0.1,
                duration: 1000
            });
        }
    },
    
    createGenericCombatEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y, {
                size: 4,
                color: '#FFA500',
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                },
                gravity: 0.15,
                duration: 800
            });
        }
    },
    
    // Screen shake system
    triggerScreenShake(options = {}) {
        if (!this.settings.screenShakeEnabled || this.screenShakeActive) {
            return;
        }
        
        const defaults = {
            intensity: 5,
            duration: 300,
            element: document.body
        };
        
        const config = { ...defaults, ...options };
        
        this.screenShake.intensity = config.intensity;
        this.screenShake.duration = config.duration;
        this.screenShake.startTime = Date.now();
        this.screenShake.originalTransform = config.element.style.transform || '';
        this.screenShake.element = config.element;
        this.screenShakeActive = true;
        
        this.animateScreenShake();
    },
    
    animateScreenShake() {
        if (!this.screenShakeActive) {
            return;
        }
        
        const elapsed = Date.now() - this.screenShake.startTime;
        const progress = elapsed / this.screenShake.duration;
        
        if (progress >= 1) {
            // Reset transform
            this.screenShake.element.style.transform = this.screenShake.originalTransform;
            this.screenShakeActive = false;
            return;
        }
        
        // Calculate shake offset
        const intensity = this.screenShake.intensity * (1 - progress);
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        const rotation = (Math.random() - 0.5) * intensity * 0.5;
        
        // Apply transform
        this.screenShake.element.style.transform = `
            ${this.screenShake.originalTransform}
            translate(${x}px, ${y}px) 
            rotate(${rotation}deg)
        `;
        
        requestAnimationFrame(() => this.animateScreenShake());
    },
    
    // Weather system
    updateWeather(weatherData) {
        if (!this.settings.weatherEffectsEnabled) {
            return;
        }
        
        const { weather, intensity = 0.5 } = weatherData;
        
        if (this.weatherActive === weather) {
            return;
        }
        
        this.clearWeather();
        this.weatherActive = weather;
        this.weatherSystem.intensity = intensity;
        
        switch (weather) {
            case 'rain':
                this.startRainEffect();
                break;
            case 'snow':
                this.startSnowEffect();
                break;
            case 'fog':
                this.startFogEffect();
                break;
            case 'sandstorm':
                this.startSandstormEffect();
                break;
            default:
                this.weatherActive = null;
        }
    },
    
    clearWeather() {
        this.weatherSystem.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.remove();
            }
        });
        this.weatherSystem.particles = [];
        
        // Remove weather overlay
        const weatherOverlay = document.getElementById('weather-overlay');
        if (weatherOverlay) {
            weatherOverlay.remove();
        }
    },
    
    startRainEffect() {
        const particleCount = Math.floor(100 * this.weatherSystem.intensity);
        
        for (let i = 0; i < particleCount; i++) {
            TimerManager.setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = -10;
                
                const particle = this.createParticle(x, y, {
                    size: 2,
                    color: 'rgba(174, 194, 224, 0.5)',
                    velocity: {
                        x: Math.random() * 2 - 1,
                        y: 10 + Math.random() * 5
                    },
                    gravity: 0,
                    duration: 3000,
                    fade: false
                });
                
                if (particle) {
                    particle.element.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                    particle.element.style.width = '2px';
                    particle.element.style.height = '10px';
                    this.weatherSystem.particles.push(particle);
                }
            }, Math.random() * 2000);
        }
    },
    
    startSnowEffect() {
        const particleCount = Math.floor(80 * this.weatherSystem.intensity);
        
        for (let i = 0; i < particleCount; i++) {
            TimerManager.setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = -10;
                
                const particle = this.createParticle(x, y, {
                    size: 3 + Math.random() * 3,
                    color: 'rgba(255, 255, 255, 0.8)',
                    velocity: {
                        x: Math.random() * 2 - 1,
                        y: 1 + Math.random() * 2
                    },
                    gravity: 0,
                    duration: 5000,
                    fade: false
                });
                
                if (particle) {
                    this.weatherSystem.particles.push(particle);
                }
            }, Math.random() * 3000);
        }
    },
    
    startFogEffect() {
        const fogOverlay = document.createElement('div');
        fogOverlay.id = 'weather-overlay';
        fogOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(200, 200, 200, 0.3) 0%, 
                rgba(200, 200, 200, 0.6) 100%);
            pointer-events: none;
            z-index: 70; /* Z-INDEX STANDARD: Weather effects (fog) */
            animation: fogMove 20s infinite alternate;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fogMove {
                0% { opacity: 0.3; }
                50% { opacity: 0.6; }
                100% { opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(fogOverlay);
    },
    
    startSandstormEffect() {
        const sandstormOverlay = document.createElement('div');
        sandstormOverlay.id = 'weather-overlay';
        sandstormOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(194, 154, 108, 0.3) 0%, 
                rgba(222, 184, 135, 0.2) 50%, 
                rgba(194, 154, 108, 0.3) 100%);
            pointer-events: none;
            z-index: 70; /* Z-INDEX STANDARD: Weather effects (sandstorm) */
            animation: sandstormMove 10s infinite linear;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sandstormMove {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(sandstormOverlay);
        
        // 🏜️ Add sand particles - the desert's wrath
        const particleCount = Math.floor(50 * this.weatherSystem.intensity);
        for (let i = 0; i < particleCount; i++) {
            TimerManager.setTimeout(() => {
                const x = -10;
                const y = Math.random() * window.innerHeight;
                
                const particle = this.createParticle(x, y, {
                    size: 2 + Math.random() * 2,
                    color: 'rgba(194, 154, 108, 0.6)',
                    velocity: {
                        x: 5 + Math.random() * 3,
                        y: Math.random() * 2 - 1
                    },
                    gravity: 0,
                    duration: 4000,
                    fade: false
                });
                
                if (particle) {
                    this.weatherSystem.particles.push(particle);
                }
            }, Math.random() * 2000);
        }
    },
    
    // 🌅 Time-based effects - light and darkness wage eternal war
    updateTimeBasedEffects(timeData) {
        const { isNight, hour } = timeData;
        
        if (isNight) {
            this.applyNightEffect();
        } else {
            this.removeNightEffect();
        }
        
        // 🌇 Apply golden hour effect - that brief moment of perfect light
        if (hour >= 6 && hour <= 8 || hour >= 17 && hour <= 19) {
            this.applyGoldenHourEffect();
        } else {
            this.removeGoldenHourEffect();
        }
    },
    
    applyNightEffect() {
        const nightOverlay = document.getElementById('night-overlay');
        if (nightOverlay) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'night-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(0, 0, 50, 0.2) 0%, 
                rgba(0, 0, 30, 0.6) 100%);
            pointer-events: none;
            z-index: 60; /* Z-INDEX STANDARD: Day/night effects */
            transition: opacity 2s ease-in-out;
        `;
        document.body.appendChild(overlay);
    },
    
    removeNightEffect() {
        const nightOverlay = document.getElementById('night-overlay');
        if (nightOverlay) {
            nightOverlay.style.opacity = '0';
            TimerManager.setTimeout(() => nightOverlay.remove(), 2000);
        }
    },
    
    applyGoldenHourEffect() {
        const goldenOverlay = document.getElementById('golden-hour-overlay');
        if (goldenOverlay) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'golden-hour-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(255, 200, 100, 0.1) 0%, 
                rgba(255, 150, 50, 0.2) 100%);
            pointer-events: none;
            z-index: 60; /* Z-INDEX STANDARD: Day/night effects (golden hour) */
            transition: opacity 1s ease-in-out;
        `;
        document.body.appendChild(overlay);
    },
    
    removeGoldenHourEffect() {
        const goldenOverlay = document.getElementById('golden-hour-overlay');
        if (goldenOverlay) {
            goldenOverlay.style.opacity = '0';
            TimerManager.setTimeout(() => goldenOverlay.remove(), 1000);
        }
    },
    
    // 🔦 Highlighting system - spotlighting the important with dramatic flair
    highlightElement(element, options = {}) {
        if (!element || !this.settings.animationsEnabled) {
            return;
        }
        
        const defaults = {
            color: '#FFD700',
            duration: 1000,
            pulse: true,
            scale: 1.1
        };
        
        const config = { ...defaults, ...options };
        
        // 💾 Store original styles - remember what was before the transformation
        const originalBoxShadow = element.style.boxShadow;
        const originalTransform = element.style.transform;
        const originalTransition = element.style.transition;
        
        // ✨ Apply highlight - bathing in radiant attention
        element.style.transition = `all ${config.duration / 1000}s ease-in-out`;
        element.style.boxShadow = `0 0 20px ${config.color}`;
        
        if (config.scale !== 1) {
            element.style.transform = `scale(${config.scale})`;
        }
        
        // 💗 Pulse effect - the heartbeat of emphasis
        if (config.pulse) {
            const pulseAnimation = TimerManager.setInterval(() => {
                const currentScale = parseFloat(element.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
                const newScale = currentScale === config.scale ? 1 : config.scale;
                element.style.transform = `scale(${newScale})`;
            }, 500);
            
            TimerManager.setTimeout(() => TimerManager.clearInterval(pulseAnimation), config.duration);
        }
        
        // 🔄 Restore original styles - returning to normalcy after the spectacle
        TimerManager.setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
        }, config.duration);
    },
    
    // 🌫️ Fade transitions - graceful entrances and exits from reality
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration / 1000}s ease-in-out`;
        
        TimerManager.setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    fadeOut(element, duration = 300, callback = null) {
        if (!element) return;
        
        element.style.transition = `opacity ${duration / 1000}s ease-in-out`;
        element.style.opacity = '0';
        
        TimerManager.setTimeout(() => {
            element.style.display = 'none';
            if (callback) callback();
        }, duration);
    },
    
    crossFade(outElement, inElement, duration = 300) {
        if (!outElement || !inElement) return;
        
        this.fadeOut(outElement, duration);
        TimerManager.setTimeout(() => {
            this.fadeIn(inElement, duration);
        }, duration / 2);
    },
    
    // 💎 Resource particle effects - materialism made magical
    createResourceParticles(data) {
        const { x, y, resourceType, amount } = data;
        const colors = {
            wood: '#8B4513',
            stone: '#808080',
            iron: '#434343',
            gold: '#FFD700',
            food: '#228B22',
            default: '#FFFFFF'
        };
        
        const particleCount = Math.min(Math.floor(amount / 5), 15);
        
        for (let i = 0; i < particleCount; i++) {
            TimerManager.setTimeout(() => {
                this.createParticle(x, y, {
                    size: 3 + Math.random() * 2,
                    color: colors[resourceType] || colors.default,
                    velocity: {
                        x: (Math.random() - 0.5) * 3,
                        y: -Math.random() * 4 - 1
                    },
                    gravity: 0.15,
                    duration: 1200 + Math.random() * 400
                });
            }, i * 40);
        }
    },
    
    // ⚙️ Settings management - fine-tuning the spectacle
    setQuality(quality) {
        this.settings.quality = quality;
        
        // 🔢 Adjust particle count based on quality - more magic or less lag?
        switch (quality) {
            case 'low':
                this.particleSystem.maxParticles = 30;
                break;
            case 'medium':
                this.particleSystem.maxParticles = 100;
                break;
            case 'high':
                this.particleSystem.maxParticles = 200;
                break;
        }
        
        this.saveSettings();
    },
    
    toggleParticles() {
        this.settings.particlesEnabled = !this.settings.particlesEnabled;
        if (!this.settings.particlesEnabled) {
            this.clearAllParticles();
        }
        this.saveSettings();
    },
    
    toggleScreenShake() {
        this.settings.screenShakeEnabled = !this.settings.screenShakeEnabled;
        this.saveSettings();
    },
    
    toggleAnimations() {
        this.settings.animationsEnabled = !this.settings.animationsEnabled;
        this.saveSettings();
    },
    
    toggleWeatherEffects() {
        this.settings.weatherEffectsEnabled = !this.settings.weatherEffectsEnabled;
        if (!this.settings.weatherEffectsEnabled) {
            this.clearWeather();
        }
        this.saveSettings();
    },
    
    toggleReducedMotion() {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        this.saveSettings();
    },
    
    toggleFlashWarnings() {
        this.settings.flashWarnings = !this.settings.flashWarnings;
        this.saveSettings();
    },
    
    // 🧹 Cleanup methods - sweeping away the remnants of magic
    clearAllParticles() {
        this.activeParticles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.remove();
            }
        });
        this.activeParticles = [];
    },
    
    cleanup() {
        this.clearAllParticles();
        this.clearWeather();
        
        // 💀 Remove overlays - banishing the layers of illusion
        const overlays = ['night-overlay', 'golden-hour-overlay', 'weather-overlay'];
        overlays.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
        
        // 🗑️ Remove particle container - destroying the stage itself
        if (this.particleSystem.container && this.particleSystem.container.parentNode) {
            this.particleSystem.container.remove();
        }
    }
};

// 📤 Export for use in other modules - spreading visual darkness far and wide
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffectsSystem;
}