// ═══════════════════════════════════════════════════════════════
// 🌦️ MENU WEATHER SYSTEM - seasonal magic on the main menu
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Made by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// Random seasonal effects that greet players differently each visit
// Storm with lightning, winter snow, autumn leaves, spring petals, summer dust
// ═══════════════════════════════════════════════════════════════

const MenuWeatherSystem = {
    container: null,
    currentSeason: null,
    particleInterval: null,
    lightningInterval: null,
    meteorInterval: null,
    isActive: false,

    // 🌦️ Available seasons with their weights (higher = more likely)
    seasons: {
        storm: { weight: 25, name: 'Stormy Night' },      // Rain + Lightning
        winter: { weight: 18, name: 'Winter Snow' },      // Snowflakes
        thundersnow: { weight: 8, name: 'Lightning Blizzard' }, // 🖤 Rare! Snow + Lightning
        autumn: { weight: 20, name: 'Autumn Winds' },     // Falling leaves
        spring: { weight: 18, name: 'Spring Blossoms' },  // Cherry petals
        summer: { weight: 11, name: 'Summer Dusk' },      // Dust motes + sun rays
        apocalypse: { weight: 0, name: 'The Dark Convergence' } // ☄️ Meteors & doom (debug only)
    },

    // 🎲 Select random season based on weights
    selectRandomSeason() {
        const totalWeight = Object.values(this.seasons).reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;

        for (const [season, data] of Object.entries(this.seasons)) {
            random -= data.weight;
            if (random <= 0) {
                return season;
            }
        }
        return 'storm'; // fallback
    },

    // 🚀 Initialize the weather system
    init() {
        console.log('🌦️ MenuWeatherSystem.init() called');
        this.container = document.getElementById('menu-weather-container');
        if (!this.container) {
            console.warn('🌦️ Menu weather container not found - retrying in 500ms');
            setTimeout(() => this.init(), 500);
            return;
        }

        // 🖤 Clear any existing content
        this.container.innerHTML = '';

        // Select random season
        this.currentSeason = this.selectRandomSeason();
        console.log(`🌦️ Menu Weather: ${this.seasons[this.currentSeason].name}`);

        // Apply season class to main menu
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            // Remove any existing season classes
            mainMenu.classList.remove('season-storm', 'season-winter', 'season-thundersnow', 'season-autumn', 'season-spring', 'season-summer');
            mainMenu.classList.add(`season-${this.currentSeason}`);
        }

        // Start the appropriate effect
        this.startEffect();
    },

    // 🎬 Start the weather effect for current season
    startEffect() {
        if (this.isActive) return;
        this.isActive = true;

        switch (this.currentSeason) {
            case 'storm':
                this.startStorm();
                break;
            case 'winter':
                this.startWinter();
                break;
            case 'thundersnow':
                this.startThundersnow();
                break;
            case 'autumn':
                this.startAutumn();
                break;
            case 'spring':
                this.startSpring();
                break;
            case 'summer':
                this.startSummer();
                break;
            case 'apocalypse':
                this.startApocalypse();
                break;
        }
    },

    // ☄️ APOCALYPSE - Meteors, red sky, doom
    startApocalypse() {
        // Add red pulsing sky overlay
        const skyOverlay = document.createElement('div');
        skyOverlay.className = 'apocalypse-sky';
        skyOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at top, rgba(80, 0, 0, 0.6) 0%, rgba(30, 0, 0, 0.8) 100%);
            animation: apocalypsePulse 3s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
        `;
        this.container.appendChild(skyOverlay);

        // Add apocalypse keyframes if not exists
        if (!document.getElementById('apocalypse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'apocalypse-keyframes';
            style.textContent = `
                @keyframes apocalypsePulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                @keyframes meteorFall {
                    0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
                    100% { transform: translateX(300px) translateY(100vh) rotate(-45deg); opacity: 0; }
                }
                @keyframes emberFloat {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Start meteor shower
        this.startMeteorShower();

        // Create floating embers
        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const ember = document.createElement('div');
            ember.style.cssText = `
                position: absolute;
                bottom: 0;
                left: ${Math.random() * 100}%;
                width: ${3 + Math.random() * 5}px;
                height: ${3 + Math.random() * 5}px;
                background: radial-gradient(circle, #ff6600, #ff0000);
                border-radius: 50%;
                animation: emberFloat ${3 + Math.random() * 4}s ease-out forwards;
                pointer-events: none;
                z-index: 5;
            `;
            this.container.appendChild(ember);

            setTimeout(() => ember.remove(), 7000);
        }, 100);

        // Add lightning for dramatic effect
        this.startLightning();

        // Add fog for atmosphere
        this.createFog(2);
    },

    // ☄️ Meteor shower effect
    startMeteorShower() {
        const spawnMeteor = () => {
            if (!this.isActive) return;

            const meteor = document.createElement('div');
            meteor.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${Math.random() * 80}%;
                font-size: ${20 + Math.random() * 30}px;
                animation: meteorFall ${1.5 + Math.random()}s linear forwards;
                pointer-events: none;
                z-index: 10;
                filter: drop-shadow(0 0 10px #ff4400) drop-shadow(0 0 20px #ff0000);
            `;
            meteor.textContent = '☄️';
            this.container.appendChild(meteor);

            // Create impact flash
            setTimeout(() => {
                if (!this.isActive) return;
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: ${parseFloat(meteor.style.left) + 15}%;
                    width: 100px;
                    height: 50px;
                    background: radial-gradient(ellipse at bottom, rgba(255, 100, 0, 0.8), transparent);
                    animation: fadeOut 0.5s forwards;
                    pointer-events: none;
                    z-index: 4;
                `;
                this.container.appendChild(flash);
                setTimeout(() => flash.remove(), 500);
            }, 1200 + Math.random() * 500);

            setTimeout(() => meteor.remove(), 3000);

            // Next meteor in 3-10 seconds
            this.meteorInterval = setTimeout(spawnMeteor, 3000 + Math.random() * 7000);
        };

        // First meteor immediately
        spawnMeteor();
    },

    // ⛈️ STORM - Rain with lightning
    startStorm() {
        // Create rain
        this.createRain(80);

        // Create fog layers
        this.createFog(2);

        // Start lightning
        this.startLightning();
    },

    createRain(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this.isActive) return;
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                this.container.appendChild(drop);
            }, i * 50);
        }
    },

    startLightning() {
        // Create afterglow element
        const afterglow = document.createElement('div');
        afterglow.className = 'lightning-afterglow';
        this.container.appendChild(afterglow);

        const triggerLightning = () => {
            if (!this.isActive) return;

            // Random position for lightning
            const x = 10 + Math.random() * 80; // 10-90% from left

            // Create main bolt
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = `${x}%`;
            bolt.style.top = '0';
            bolt.style.height = `${40 + Math.random() * 30}%`;
            this.container.appendChild(bolt);

            // Create glow
            const glow = document.createElement('div');
            glow.className = 'lightning-glow';
            glow.style.left = `${x - 10}%`;
            glow.style.top = '-50px';
            this.container.appendChild(glow);

            // Create branching segments
            const branchCount = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < branchCount; i++) {
                const branch = document.createElement('div');
                branch.className = 'lightning-segment';
                branch.style.left = `${x}%`;
                branch.style.top = `${10 + Math.random() * 30}%`;
                branch.style.width = `${30 + Math.random() * 50}px`;
                branch.style.transform = `rotate(${30 + Math.random() * 60}deg)`;
                branch.style.opacity = '0';
                this.container.appendChild(branch);

                // Animate branch
                setTimeout(() => {
                    branch.style.transition = 'opacity 0.1s';
                    branch.style.opacity = '0.8';
                    setTimeout(() => {
                        branch.style.opacity = '0';
                        setTimeout(() => branch.remove(), 500);
                    }, 100);
                }, 50 + i * 30);
            }

            // Trigger animations
            requestAnimationFrame(() => {
                bolt.classList.add('flash');
                glow.classList.add('flash');
                afterglow.classList.add('flash');
            });

            // Cleanup
            setTimeout(() => {
                bolt.remove();
                glow.remove();
                afterglow.classList.remove('flash');
            }, 1500);

            // Schedule next lightning (random interval 4-12 seconds)
            this.lightningInterval = setTimeout(triggerLightning, 4000 + Math.random() * 8000);
        };

        // First lightning after 2-5 seconds
        this.lightningInterval = setTimeout(triggerLightning, 2000 + Math.random() * 3000);
    },

    // ⚡❄️ THUNDERSNOW - Lightning Blizzard (rare and terrifying!)
    startThundersnow() {
        // Heavy, fast snowfall
        const snowflakes = ['❄', '❅', '❆', '✦', '✧'];
        const sizes = ['medium', 'large'];

        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const flake = document.createElement('div');
            flake.className = `snowflake ${sizes[Math.floor(Math.random() * sizes.length)]} blizzard`;
            flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.animationDuration = `${2 + Math.random() * 2}s`; // Faster than normal snow
            flake.style.textShadow = '0 0 8px rgba(150, 180, 255, 0.8)'; // Eerie glow
            this.container.appendChild(flake);

            setTimeout(() => flake.remove(), 5000);
        }, 50); // More frequent

        // Add intense fog
        this.createFog(3);

        // Start lightning (more frequent than regular storm)
        this.startThundersnowLightning();
    },

    // Lightning specifically for thundersnow - colder, more intense
    startThundersnowLightning() {
        const afterglow = document.createElement('div');
        afterglow.className = 'lightning-afterglow thundersnow-glow';
        this.container.appendChild(afterglow);

        const triggerLightning = () => {
            if (!this.isActive) return;

            const x = 10 + Math.random() * 80;

            // Create main bolt with blue-white tint
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt thundersnow-bolt';
            bolt.style.left = `${x}%`;
            bolt.style.top = '0';
            bolt.style.height = `${50 + Math.random() * 40}%`;
            this.container.appendChild(bolt);

            // Create cold glow
            const glow = document.createElement('div');
            glow.className = 'lightning-glow thundersnow-light';
            glow.style.left = `${x - 15}%`;
            glow.style.top = '-50px';
            this.container.appendChild(glow);

            // Create branching segments
            const branchCount = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < branchCount; i++) {
                const branch = document.createElement('div');
                branch.className = 'lightning-segment thundersnow-branch';
                branch.style.left = `${x}%`;
                branch.style.top = `${10 + Math.random() * 40}%`;
                branch.style.width = `${40 + Math.random() * 60}px`;
                branch.style.transform = `rotate(${20 + Math.random() * 70}deg)`;
                branch.style.opacity = '0';
                this.container.appendChild(branch);

                setTimeout(() => {
                    branch.style.transition = 'opacity 0.1s';
                    branch.style.opacity = '0.9';
                    setTimeout(() => {
                        branch.style.opacity = '0';
                        setTimeout(() => branch.remove(), 500);
                    }, 150);
                }, 30 + i * 25);
            }

            requestAnimationFrame(() => {
                bolt.classList.add('flash');
                glow.classList.add('flash');
                afterglow.classList.add('flash');
            });

            setTimeout(() => {
                bolt.remove();
                glow.remove();
                afterglow.classList.remove('flash');
            }, 1500);

            // More frequent lightning for thundersnow (3-8 seconds)
            this.lightningInterval = setTimeout(triggerLightning, 3000 + Math.random() * 5000);
        };

        this.lightningInterval = setTimeout(triggerLightning, 1500 + Math.random() * 2000);
    },

    // ❄️ WINTER - Gentle snowfall
    startWinter() {
        const snowflakes = ['❄', '❅', '❆', '✦', '✧', '·'];
        const sizes = ['small', 'medium', 'large'];

        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const flake = document.createElement('div');
            flake.className = `snowflake ${sizes[Math.floor(Math.random() * sizes.length)]}`;
            flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.animationDuration = `${5 + Math.random() * 5}s`;
            this.container.appendChild(flake);

            // Cleanup after animation
            setTimeout(() => flake.remove(), 12000);
        }, 150);

        // Add subtle fog
        this.createFog(1);
    },

    // 🍂 AUTUMN - Falling leaves
    startAutumn() {
        const leaves = ['🍂', '🍁', '🍃', '🌿'];

        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.animationDuration = `${6 + Math.random() * 4}s`;
            leaf.style.fontSize = `${14 + Math.random() * 10}px`;
            this.container.appendChild(leaf);

            setTimeout(() => leaf.remove(), 12000);
        }, 400);

        // Light fog
        this.createFog(1);
    },

    // 🌸 SPRING - Cherry blossom petals
    startSpring() {
        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const petal = document.createElement('div');
            petal.className = `petal ${Math.random() > 0.5 ? 'white' : ''}`;
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.animationDuration = `${5 + Math.random() * 4}s`;
            petal.style.width = `${6 + Math.random() * 8}px`;
            petal.style.height = `${6 + Math.random() * 8}px`;
            this.container.appendChild(petal);

            setTimeout(() => petal.remove(), 10000);
        }, 200);
    },

    // ☀️ SUMMER - Dust motes in warm light
    startSummer() {
        // Create sun rays
        for (let i = 0; i < 5; i++) {
            const ray = document.createElement('div');
            ray.className = 'sun-ray';
            ray.style.left = `${10 + i * 20}%`;
            ray.style.transform = `rotate(${-15 + i * 8}deg)`;
            ray.style.animationDelay = `${i * 0.5}s`;
            this.container.appendChild(ray);
        }

        // Floating dust motes
        this.particleInterval = setInterval(() => {
            if (!this.isActive) return;

            const mote = document.createElement('div');
            mote.className = 'dust-mote';
            mote.style.left = `${Math.random() * 100}%`;
            mote.style.animationDuration = `${8 + Math.random() * 6}s`;
            mote.style.width = `${2 + Math.random() * 4}px`;
            mote.style.height = mote.style.width;
            this.container.appendChild(mote);

            setTimeout(() => mote.remove(), 15000);
        }, 300);
    },

    // 🌫️ Create fog layers
    createFog(layers) {
        for (let i = 0; i < layers; i++) {
            const fog = document.createElement('div');
            fog.className = 'fog-layer';
            fog.style.top = `${30 + i * 20}%`;
            fog.style.animationDuration = `${60 + i * 20}s`;
            fog.style.opacity = `${0.3 - i * 0.1}`;
            this.container.appendChild(fog);
        }
    },

    // 🛑 Stop all effects
    stop() {
        this.isActive = false;

        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }

        if (this.lightningInterval) {
            clearTimeout(this.lightningInterval);
            this.lightningInterval = null;
        }

        if (this.meteorInterval) {
            clearTimeout(this.meteorInterval);
            this.meteorInterval = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
    },

    // 🔄 Change to a different season
    changeSeason(newSeason) {
        if (!this.seasons[newSeason]) {
            console.warn(`🌦️ Unknown season: ${newSeason}`);
            return;
        }

        this.stop();
        this.currentSeason = newSeason;

        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.remove('season-storm', 'season-winter', 'season-thundersnow', 'season-autumn', 'season-spring', 'season-summer');
            mainMenu.classList.add(`season-${this.currentSeason}`);
        }

        console.log(`🌦️ Changed to: ${this.seasons[newSeason].name}`);
        this.startEffect();
    }
};

// 🌙 Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure main menu is visible
        setTimeout(() => MenuWeatherSystem.init(), 100);
    });
} else {
    setTimeout(() => MenuWeatherSystem.init(), 100);
}

// Expose globally
window.MenuWeatherSystem = MenuWeatherSystem;
console.log('🌦️ Menu Weather System loaded');
