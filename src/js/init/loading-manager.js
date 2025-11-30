// ═══════════════════════════════════════════════════════════════
// 🖤 LOADING MANAGER - watching the void slowly fill with code
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - *yawns* another loading screen...
// ═══════════════════════════════════════════════════════════════

const LoadingManager = {
    // 📊 Final system check - multiple indicators that game is ready
    finalCheck: () => {
        // Primary: window.startNewGame is set at end of game.js (line 9626)
        if (typeof window.startNewGame === 'function') {
            return true;
        }
        // Secondary: Bootstrap.initialized is set after all systems init
        if (typeof Bootstrap !== 'undefined' && Bootstrap.initialized === true) {
            return true;
        }
        // Tertiary: game object + GameWorld both exist (earlier in load)
        if (typeof game !== 'undefined' && typeof GameWorld !== 'undefined') {
            return true;
        }
        return false;
    },

    // 📊 Status messages based on progress
    statusMessages: [
        { threshold: 0, title: 'Awakening the void...', status: 'Initializing...' },
        { threshold: 15, title: 'Loading core systems...', status: 'Loading configuration...' },
        { threshold: 30, title: 'Generating world...', status: 'Creating locations...' },
        { threshold: 45, title: 'Loading items...', status: 'Filling warehouses...' },
        { threshold: 60, title: 'Setting up markets...', status: 'Hiring merchants...' },
        { threshold: 75, title: 'Preparing quests...', status: 'Writing adventures...' },
        { threshold: 90, title: 'Almost there...', status: 'Final preparations...' },
        { threshold: 100, title: 'Ready to trade!', status: 'Welcome, merchant...' }
    ],

    // 📊 State
    progress: 0,
    targetProgress: 0,
    isComplete: false,
    isReady: false,
    animationFrame: null,
    startTime: 0,
    expectedLoadTime: 8000,  // 🖤 Expected ~8 seconds to load
    maxWaitTime: 20000,      // 🖤 Max 20 seconds before force-completing

    // 🚀 Start monitoring loading progress
    init() {
        console.log('🖤 LoadingManager: Starting to watch the void fill up...');
        this.startTime = Date.now();
        this.progress = 0;
        this.targetProgress = 0;
        this.updateUI(0);

        // 🎨 Start smooth animation loop
        this.animate();

        // 🖤 Check for completion periodically
        this.checkInterval = setInterval(() => this.checkReady(), 100);
    },

    // 🎨 Smooth animation - progress bar fills based on time until ready
    animate() {
        if (this.isComplete) return;

        const elapsed = Date.now() - this.startTime;

        if (this.isReady) {
            // 🎯 Systems ready - quickly complete to 100%
            this.targetProgress = 100;
        } else {
            // 🕐 Time-based progress: smoothly go from 0% to 95% over expectedLoadTime
            // Uses easeOutQuad for natural deceleration
            const timeRatio = Math.min(elapsed / this.expectedLoadTime, 1);
            const easedRatio = 1 - Math.pow(1 - timeRatio, 2);
            this.targetProgress = Math.min(easedRatio * 95, 95);
        }

        // 🖤 Smoothly interpolate current progress toward target
        const diff = this.targetProgress - this.progress;
        const speed = this.isReady ? 0.2 : 0.1;
        this.progress += diff * speed;

        // 🖤 Snap to 100 when close enough
        if (this.isReady && this.progress > 99.5) {
            this.progress = 100;
        }

        // 🖤 Update UI
        this.updateUI(Math.round(this.progress));

        // 🖤 Complete when we hit 100%
        if (this.progress >= 100 && !this.isComplete) {
            setTimeout(() => this.complete(), 400);
            return;
        }

        // 🔄 Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // 📊 Check if game is ready
    checkReady() {
        if (this.isReady) return;

        try {
            if (this.finalCheck()) {
                console.log('🖤 LoadingManager: All systems ready!');
                this.isReady = true;
                clearInterval(this.checkInterval);
            }
        } catch (e) {
            console.warn('🖤 LoadingManager: Check error:', e.message);
        }

        // 🖤 Debooger logging 🦇 every 5 seconds
        const elapsed = Date.now() - this.startTime;
        if (elapsed > 5000 && elapsed % 5000 < 100) {
            console.log('🖤 LoadingManager: Still waiting...', {
                elapsed: Math.round(elapsed / 1000) + 's',
                'window.startNewGame': typeof window.startNewGame,
                'Bootstrap.initialized': typeof Bootstrap !== 'undefined' ? Bootstrap.initialized : 'undefined',
                'game': typeof game,
                'GameWorld': typeof GameWorld
            });
        }

        // 🖤 Timeout fallback
        if (elapsed > this.maxWaitTime && !this.isReady) {
            console.warn(`🖤 LoadingManager: Timeout after ${elapsed}ms. Force-completing...`);
            console.warn('🖤 Final state:', {
                'window.startNewGame': typeof window.startNewGame,
                'Bootstrap.initialized': typeof Bootstrap !== 'undefined' ? Bootstrap.initialized : 'undefined',
                'game': typeof game,
                'GameWorld': typeof GameWorld
            });
            this.isReady = true;
            clearInterval(this.checkInterval);
        }
    },

    // 🎨 Update the loading UI
    updateUI(progress) {
        const fill = document.getElementById('loading-progress-fill');
        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');

        // 🖤 Update progress bar
        if (fill) {
            fill.style.width = progress + '%';
        }

        // 🖤 Find appropriate status message
        let message = this.statusMessages[0];
        for (let i = this.statusMessages.length - 1; i >= 0; i--) {
            if (progress >= this.statusMessages[i].threshold) {
                message = this.statusMessages[i];
                break;
            }
        }

        if (titleEl) titleEl.textContent = message.title;
        if (statusEl) statusEl.textContent = message.status;
    },

    // ✅ Loading complete - show the menu
    complete() {
        if (this.isComplete) return;
        this.isComplete = true;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        clearInterval(this.checkInterval);

        const elapsed = Date.now() - this.startTime;
        console.log(`🖤 LoadingManager: Everything loaded in ${elapsed}ms!`);

        // 🖤 Ensure UI shows 100%
        this.updateUI(100);

        // 🌙 Brief pause at 100%, then transition to menu
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const mainMenu = document.getElementById('main-menu');

            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (mainMenu) mainMenu.classList.remove('hidden');

            // 🌦️ Start menu weather effects
            if (typeof MenuWeatherSystem !== 'undefined' && MenuWeatherSystem.init) {
                MenuWeatherSystem.init();
            }

            console.log('🖤 LoadingManager: Main menu revealed. Let the games begin.');
        }, 500);
    },

    // 🔧 Debooger helper 💀
    deboogerStatus() {
        console.log('🖤 LoadingManager Debooger 🖤:');
        console.log(`  Progress: ${this.progress.toFixed(1)}%`);
        console.log(`  Target: ${this.targetProgress.toFixed(1)}%`);
        console.log(`  Ready: ${this.isReady}`);
        console.log(`  Elapsed: ${Date.now() - this.startTime}ms`);
        console.log(`  startNewGame: ${typeof startNewGame}`);
        console.log(`  window.startNewGame: ${typeof window.startNewGame}`);
    }
};

// 🖤 Start loading check immediately
LoadingManager.init();

window.LoadingManager = LoadingManager;
console.log('🖤 LoadingManager loaded - watching scripts trickle in like my will to live');
