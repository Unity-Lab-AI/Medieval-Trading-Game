// ═══════════════════════════════════════════════════════════════
// 🌦️ MENU WEATHER SYSTEM - seasonal magic on the main menu
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
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
        apocalypse: { weight: 0, name: 'The Dark Convergence' } // ☄️ Meteors & doom (debooger only 🦇)
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

        // 🖤 Inject keyframe animations if not already done
        this.injectKeyframes();

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

    // ⚡ Inject keyframe animations for lightning effects
    injectKeyframes() {
        if (document.getElementById('menu-weather-keyframes')) return;

        const style = document.createElement('style');
        style.id = 'menu-weather-keyframes';
        style.textContent = `
            /* ⚡ Menu lightning bolt strike animation */
            @keyframes menu-bolt-strike {
                0% { height: 0; opacity: 1; }
                100% { height: var(--bolt-height, 60%); opacity: 1; }
            }
            /* 🔥 Menu fire flicker animation */
            @keyframes menu-fire-flicker {
                0% { transform: scale(1); opacity: 0.9; }
                100% { transform: scale(1.15); opacity: 1; }
            }
            /* ✦ Menu spark pulse animation */
            @keyframes menu-spark-pulse {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
                100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
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
                    100% { transform: translateX(var(--meteor-x, 200px)) translateY(var(--meteor-y, 60vh)) rotate(-45deg); opacity: 0; }
                }
                @keyframes emberFloat {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
                }
                /* ⚡ Menu lightning bolt strike animation */
                @keyframes menu-bolt-strike {
                    0% { height: 0; opacity: 1; }
                    100% { height: var(--bolt-height, 60%); opacity: 1; }
                }
                /* 🔥 Menu fire flicker animation */
                @keyframes menu-fire-flicker {
                    0% { transform: scale(1); opacity: 0.9; }
                    100% { transform: scale(1.15); opacity: 1; }
                }
                /* ✦ Menu spark pulse animation */
                @keyframes menu-spark-pulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                }
                /* ☄️ Menu meteor fire flicker animation */
                @keyframes menu-meteor-fire-flicker {
                    0% { transform: scale(1) rotate(0deg); opacity: 0.85; }
                    100% { transform: scale(1.15) rotate(5deg); opacity: 1; }
                }
                /* ☄️ Menu meteor spark pulse animation */
                @keyframes menu-meteor-spark-pulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
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

            const startX = Math.random() * 80;

            // 🔥 80% land on screen, 20% go off screen (like game weather)
            const goesOffScreen = Math.random() < 0.2;
            const landX = 150 + Math.random() * 150; // 150-300px horizontal travel
            const landY = goesOffScreen ? (100 + Math.random() * 20) : (40 + Math.random() * 50); // 40-90vh on screen, 100-120vh off

            const duration = 1.5 + Math.random();
            const meteor = document.createElement('div');
            meteor.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${startX}%;
                font-size: ${20 + Math.random() * 30}px;
                animation: meteorFall ${duration}s linear forwards;
                pointer-events: none;
                z-index: 10;
                filter: drop-shadow(0 0 10px #ff4400) drop-shadow(0 0 20px #ff0000);
                --meteor-x: ${landX}px;
                --meteor-y: ${landY}vh;
            `;
            meteor.textContent = '☄️';
            this.container.appendChild(meteor);

            // Create impact flash and fire (only for on-screen impacts)
            const impactX = startX + (landX / 20); // Approximate landing X
            const impactDelay = duration * 0.85 * 1000;
            setTimeout(() => {
                if (!this.isActive) return;

                // Brief flash at impact point
                const flash = document.createElement('div');
                const flashY = goesOffScreen ? 0 : (100 - landY); // Position from bottom
                flash.style.cssText = `
                    position: absolute;
                    bottom: ${goesOffScreen ? 0 : flashY}%;
                    left: ${impactX}%;
                    width: 100px;
                    height: 50px;
                    background: radial-gradient(ellipse at bottom, rgba(255, 100, 0, 0.8), transparent);
                    animation: fadeOut 0.5s forwards;
                    pointer-events: none;
                    z-index: 4;
                `;
                this.container.appendChild(flash);
                setTimeout(() => flash.remove(), 500);

                // Only create persistent fire for ON-SCREEN impacts (80%)
                if (!goesOffScreen) {
                    this.createMenuMeteorFire(impactX, landY);
                }
            }, impactDelay);

            setTimeout(() => meteor.remove(), duration * 1000 + 500);

            // Next meteor in 3-10 seconds
            this.meteorInterval = setTimeout(spawnMeteor, 3000 + Math.random() * 7000);
        };

        // First meteor immediately
        spawnMeteor();
    },

    // 🔥 Create persistent meteor fire effect at impact location
    createMenuMeteorFire(x, landY) {
        if (!this.container) return;

        const fire = document.createElement('div');
        fire.className = 'menu-meteor-fire';
        // Position fire at the landing point (convert vh to % from top)
        fire.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${landY}%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            pointer-events: none;
            z-index: 15;
        `;

        // Create the fire glow - orange/red core with flickering flames
        fire.innerHTML = `
            <div style="
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
                animation: menu-meteor-fire-flicker 0.12s ease-in-out infinite alternate;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #ffcc00;
                text-shadow: 0 0 10px #ff6600, 0 0 20px #ff3300, 0 0 30px #ff0000;
                animation: menu-meteor-spark-pulse 0.25s ease-in-out infinite alternate;
            ">✦</div>
        `;

        this.container.appendChild(fire);

        // Fire burns for 3-6 seconds then fades out
        const burnDuration = 3000 + Math.random() * 3000;
        setTimeout(() => {
            fire.style.transition = 'opacity 1s ease-out';
            fire.style.opacity = '0';
            setTimeout(() => fire.remove(), 1000);
        }, burnDuration);
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
            const strikeY = 40 + Math.random() * 50; // 40-90% down screen

            // Create vertical bolt column
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt-column';
            bolt.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: 0;
                width: 4px;
                height: 0;
                background: linear-gradient(to bottom,
                    rgba(255,255,255,0.9) 0%,
                    rgba(200,220,255,1) 50%,
                    rgba(100,150,255,1) 100%);
                box-shadow: 0 0 10px #fff, 0 0 20px #88ccff, 0 0 40px #4488ff;
                z-index: 100;
                animation: menu-bolt-strike 0.15s ease-out forwards;
            `;
            bolt.style.setProperty('--bolt-height', `${strikeY}%`);
            this.container.appendChild(bolt);

            // Create branching segments
            const branchCount = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < branchCount; i++) {
                const branch = document.createElement('div');
                branch.className = 'lightning-branch';
                const branchY = 20 + Math.random() * 60;
                const branchDir = Math.random() > 0.5 ? 1 : -1;
                const branchLen = 15 + Math.random() * 25;
                branch.style.cssText = `
                    position: absolute;
                    top: ${branchY}%;
                    left: 50%;
                    width: ${branchLen}px;
                    height: 2px;
                    background: linear-gradient(to ${branchDir > 0 ? 'right' : 'left'}, rgba(200,220,255,1), transparent);
                    box-shadow: 0 0 5px #88ccff;
                    transform: rotate(${branchDir * (30 + Math.random() * 30)}deg);
                `;
                bolt.appendChild(branch);
            }

            // Flash effect
            afterglow.classList.add('flash');

            // After bolt strikes, create fire effect
            setTimeout(() => {
                bolt.remove();
                afterglow.classList.remove('flash');

                // Create the small fire/spark that persists
                this.createMenuLightningFire(x, strikeY);
            }, 150);

            // Schedule next lightning (random interval 4-12 seconds)
            this.lightningInterval = setTimeout(triggerLightning, 4000 + Math.random() * 8000);
        };

        // First lightning after 2-5 seconds
        this.lightningInterval = setTimeout(triggerLightning, 2000 + Math.random() * 3000);
    },

    // 🔥 Create fire effect for menu lightning
    createMenuLightningFire(x, y) {
        if (!this.container) return;

        const fire = document.createElement('div');
        fire.className = 'menu-lightning-fire';
        fire.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%);
            z-index: 50;
            width: 30px;
            height: 30px;
        `;
        fire.innerHTML = `
            <div class="fire-glow" style="
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
                box-shadow: 0 0 15px rgba(200,220,255,0.8),
                            0 0 30px rgba(100,150,255,0.5);
                animation: menu-fire-flicker 0.15s ease-in-out infinite alternate;
            "></div>
            <div class="fire-sparks" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 14px;
                color: #fff;
                text-shadow: 0 0 8px #88ccff;
                animation: menu-spark-pulse 0.3s ease-in-out infinite alternate;
            ">✦</div>
        `;
        this.container.appendChild(fire);

        // Fire burns for 2-4 seconds then fades
        const burnDuration = 2000 + Math.random() * 2000;
        setTimeout(() => {
            fire.style.transition = 'opacity 1s ease-out';
            fire.style.opacity = '0';
            setTimeout(() => fire.remove(), 1000);
        }, burnDuration);
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
            const strikeY = 40 + Math.random() * 50; // 40-90% down screen

            // Create vertical bolt column with blue-white tint
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt-column thundersnow-bolt';
            bolt.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: 0;
                width: 5px;
                height: 0;
                background: linear-gradient(to bottom,
                    rgba(255,255,255,1) 0%,
                    rgba(180,200,255,1) 50%,
                    rgba(100,140,255,1) 100%);
                box-shadow: 0 0 15px #fff, 0 0 30px #aaccff, 0 0 50px #6699ff;
                z-index: 100;
                animation: menu-bolt-strike 0.15s ease-out forwards;
            `;
            bolt.style.setProperty('--bolt-height', `${strikeY}%`);
            this.container.appendChild(bolt);

            // Create branching segments
            const branchCount = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < branchCount; i++) {
                const branch = document.createElement('div');
                branch.className = 'lightning-branch thundersnow-branch';
                const branchY = 20 + Math.random() * 60;
                const branchDir = Math.random() > 0.5 ? 1 : -1;
                const branchLen = 20 + Math.random() * 35;
                branch.style.cssText = `
                    position: absolute;
                    top: ${branchY}%;
                    left: 50%;
                    width: ${branchLen}px;
                    height: 2px;
                    background: linear-gradient(to ${branchDir > 0 ? 'right' : 'left'}, rgba(180,200,255,1), transparent);
                    box-shadow: 0 0 8px #aaccff;
                    transform: rotate(${branchDir * (20 + Math.random() * 40)}deg);
                `;
                bolt.appendChild(branch);
            }

            // Flash effect
            afterglow.classList.add('flash');

            // After bolt strikes, create ice-fire effect
            setTimeout(() => {
                bolt.remove();
                afterglow.classList.remove('flash');

                // Create the small fire/spark that persists (blue-ish for thundersnow)
                this.createMenuThundersnowFire(x, strikeY);
            }, 150);

            // More frequent lightning for thundersnow (3-8 seconds)
            this.lightningInterval = setTimeout(triggerLightning, 3000 + Math.random() * 5000);
        };

        this.lightningInterval = setTimeout(triggerLightning, 1500 + Math.random() * 2000);
    },

    // 🔥❄️ Create ice-fire effect for thundersnow lightning
    createMenuThundersnowFire(x, y) {
        if (!this.container) return;

        const fire = document.createElement('div');
        fire.className = 'menu-lightning-fire thundersnow-fire';
        fire.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%);
            z-index: 50;
            width: 35px;
            height: 35px;
        `;
        fire.innerHTML = `
            <div class="fire-glow" style="
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255,255,255,1) 0%,
                    rgba(180,200,255,0.8) 30%,
                    rgba(100,140,255,0.5) 60%,
                    rgba(150,180,255,0.2) 80%,
                    transparent 100%);
                box-shadow: 0 0 20px rgba(180,200,255,0.9),
                            0 0 40px rgba(100,140,255,0.6);
                animation: menu-fire-flicker 0.12s ease-in-out infinite alternate;
            "></div>
            <div class="fire-sparks" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 16px;
                color: #fff;
                text-shadow: 0 0 10px #aaccff, 0 0 20px #6699ff;
                animation: menu-spark-pulse 0.25s ease-in-out infinite alternate;
            ">❄</div>
        `;
        this.container.appendChild(fire);

        // Ice-fire burns for 2-4 seconds then fades
        const burnDuration = 2000 + Math.random() * 2000;
        setTimeout(() => {
            fire.style.transition = 'opacity 1s ease-out';
            fire.style.opacity = '0';
            setTimeout(() => fire.remove(), 1000);
        }, burnDuration);
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
