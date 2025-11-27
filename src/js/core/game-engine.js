// ═══════════════════════════════════════════════════════════════
// 🎮 GAME ENGINE - the beating heart of this digital existence
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// this module orchestrates the game loop, time system, and travel
// basically the puppet master pulling all the strings while you think you're in control

const GameEngine = {
    // engine state - the vital signs of our digital frankenstein
    isRunning: false,
    lastFrameTime: 0,
    animationFrameId: null,

    // debug mode - for when you need to see the matrix
    debug: false,

    // wake up the engine from its eternal slumber
    init() {
        console.log('🎮 GameEngine: Initializing...');

        // Ensure TimeSystem exists and is initialized
        if (typeof TimeSystem !== 'undefined') {
            // TimeSystem.init() is called by game.init(), but we ensure it's ready
            console.log('🎮 GameEngine: TimeSystem found, current speed:', TimeSystem.currentSpeed);
        } else {
            console.error('🎮 GameEngine: TimeSystem not found!');
            return false;
        }

        // Setup time control buttons with direct handlers
        this.setupTimeControls();

        // Setup location click handlers for travel
        this.setupTravelTriggers();

        console.log('🎮 GameEngine: Initialized successfully');
        return true;
    },

    // main game loop - DISABLED: game.js gameLoop() handles all updates
    // This was causing duplicate updates and race conditions with travel/time
    // keeping the function for compatibility but it only updates UI now
    tick(currentTime) {
        if (!this.isRunning) {
            this.animationFrameId = null;
            return;
        }

        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Cap delta time to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, 100);

        // DISABLED: TimeSystem.update() is called by game.gameLoop() in game.js
        // Calling it here too causes double time advancement and travel bugs
        // if (typeof TimeSystem !== 'undefined') {
        //     const timeAdvanced = TimeSystem.update(cappedDelta);
        //     if (timeAdvanced) {
        //         this.onTimeAdvance();
        //     }
        // }

        // DISABLED: TravelSystem.update() is called by game.gameLoop() in game.js
        // this.updateTravel();

        // Only update UI displays - this is safe to run in parallel
        this.updateUI();

        // Continue the loop
        this.animationFrameId = requestAnimationFrame((t) => this.tick(t));
    },

    // start the engine - breathe life into this digital corpse
    start() {
        if (this.isRunning) {
            console.log('🎮 GameEngine: Already running');
            return;
        }

        console.log('🎮 GameEngine: Starting...');
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.tick(t));
        console.log('🎮 GameEngine: Running!');
    },

    // stop the engine - eternal silence (dramatic af)
    stop() {
        console.log('🎮 GameEngine: Stopping...');
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },

    // called when game time advances - the unstoppable march of entropy
    onTimeAdvance() {
        // Update event system
        if (typeof EventSystem !== 'undefined') {
            EventSystem.update();
        }

        // Update market prices
        if (typeof game !== 'undefined' && typeof game.updateMarketPrices === 'function') {
            game.updateMarketPrices();
        }

        // Check scheduled events
        if (typeof game !== 'undefined' && typeof game.checkScheduledEvents === 'function') {
            game.checkScheduledEvents();
        }

        // Update city events
        if (typeof CityEventSystem !== 'undefined') {
            CityEventSystem.updateEvents();
        }

        // Update dynamic market
        if (typeof DynamicMarketSystem !== 'undefined') {
            DynamicMarketSystem.updateMarketPrices();
        }

        // Process property work queues and construction/rent
        if (typeof PropertySystem !== 'undefined') {
            PropertySystem.processWorkQueues();
            // Check construction completion
            if (PropertySystem.processConstruction) {
                PropertySystem.processConstruction();
            }
            // Check rent payments
            if (PropertySystem.processRentPayments) {
                PropertySystem.processRentPayments();
            }
        }

        // Daily processing at midnight
        if (TimeSystem.currentTime.hour === 0 && TimeSystem.currentTime.minute === 0) {
            if (typeof PropertySystem !== 'undefined') {
                PropertySystem.processDailyIncome();
            }
            if (typeof TradeRouteSystem !== 'undefined') {
                TradeRouteSystem.processDailyTrade();
            }
        }

        // Check price alerts
        if (typeof TradingSystem !== 'undefined') {
            TradingSystem.checkPriceAlerts();
        }
    },

    // update travel system - are we there yet? (probably not)
    updateTravel() {
        if (typeof TravelSystem === 'undefined') return;

        // Check if player is traveling
        if (TravelSystem.playerPosition && TravelSystem.playerPosition.isTraveling) {
            // Only update if time is actually running
            if (!TimeSystem.isPaused && TimeSystem.currentSpeed !== 'PAUSED') {
                TravelSystem.updateTravelProgress();
            }
        }
    },

    // update ui displays - make the pixels dance for the human
    updateUI() {
        // Update time display
        this.updateTimeDisplay();

        // Update time control button states
        this.updateTimeControlButtons();

        // Update player stats display
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }
    },

    // update the time display - watching the clock tick is a vibe tbh
    updateTimeDisplay() {
        if (typeof TimeSystem === 'undefined') return;

        const timeInfo = TimeSystem.getTimeInfo();

        // Update main time display
        const timeDisplay = document.getElementById('game-time') ||
                           document.getElementById('time-display') ||
                           document.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = timeInfo.formatted;
        }

        // Update day/date displays
        const dayDisplay = document.getElementById('current-day');
        if (dayDisplay) {
            dayDisplay.textContent = `Day ${timeInfo.day}`;
        }

        const yearDisplay = document.getElementById('current-year');
        if (yearDisplay) {
            yearDisplay.textContent = `Year ${timeInfo.year}`;
        }

        // Update top-bar date indicator with full month name
        const dateText = document.getElementById('date-text');
        if (dateText) {
            dateText.textContent = `${timeInfo.monthName} ${timeInfo.day}, ${timeInfo.year}`;
        }

        // Update speed indicator
        const speedDisplay = document.getElementById('speed-indicator') ||
                            document.querySelector('.speed-indicator');
        if (speedDisplay) {
            const speedLabels = {
                'PAUSED': '⏸ Paused',
                'NORMAL': '▶ Normal',
                'FAST': '▶▶ Fast',
                'VERY_FAST': '▶▶▶ Very Fast'
            };
            speedDisplay.textContent = speedLabels[timeInfo.speed] || timeInfo.speed;
        }
    },

    // update time control button states - which button is the chosen one rn
    updateTimeControlButtons() {
        if (typeof TimeSystem === 'undefined') return;

        const speed = TimeSystem.currentSpeed;

        // Button ID to speed mapping
        const buttons = {
            'pause-btn': 'PAUSED',
            'normal-speed-btn': 'NORMAL',
            'fast-speed-btn': 'FAST',
            'very-fast-speed-btn': 'VERY_FAST'
        };

        Object.entries(buttons).forEach(([btnId, btnSpeed]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (speed === btnSpeed) {
                    btn.classList.add('active');
                    btn.style.background = 'rgba(76, 175, 80, 0.8)';
                } else {
                    btn.classList.remove('active');
                    btn.style.background = '';
                }
            }
        });
    },

    // setup time control buttons - giving humans the illusion of control over time
    setupTimeControls() {
        console.log('🎮 GameEngine: Setting up time controls...');

        const self = this;

        // Helper to create button handler
        const createSpeedHandler = (speed) => {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🎮 Speed button clicked: ${speed}`);
                TimeSystem.setSpeed(speed);
                if (speed !== 'PAUSED' && !self.isRunning) {
                    self.start();
                }
                self.updateTimeControlButtons();
                // Also update game.updateTimeControls if it exists
                if (typeof game !== 'undefined' && game.updateTimeControls) {
                    game.updateTimeControls();
                }
            };
        };

        // Configure all speed buttons using the helper
        const buttons = [
            { id: 'pause-btn', speed: 'PAUSED' },
            { id: 'normal-speed-btn', speed: 'NORMAL' },
            { id: 'fast-speed-btn', speed: 'FAST' },
            { id: 'very-fast-speed-btn', speed: 'VERY_FAST' }
        ];

        buttons.forEach(({ id, speed }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = createSpeedHandler(speed);
                console.log(`🎮 ${speed} button configured`);
            } else {
                console.warn(`🎮 Button not found: ${id}`);
            }
        });

        console.log('🎮 GameEngine: Time controls ready');
    },

    // setup travel triggers - click a place, suffer the journey
    setupTravelTriggers() {
        console.log('🎮 GameEngine: Setting up travel triggers...');

        // DISABLED: TravelSystem.startTravel already handles auto-starting time
        // The original patching here was causing issues with double-wrapping
        // and potential race conditions. TravelSystem handles this natively now.

        // The TravelSystem handles its own click events and time management
        // See travel-system.js startTravel() which auto-unpauses time

        console.log('🎮 GameEngine: Travel triggers ready (handled by TravelSystem)');
    },

    // set game speed - time bends to your will (kinda)
    setSpeed(speed) {
        if (typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed(speed);
            this.updateTimeControlButtons();

            // Start engine if setting to non-paused speed
            if (speed !== 'PAUSED' && !this.isRunning) {
                this.start();
            }
        }
    },

    // pause the game - freeze time like your emotional state
    pause() {
        this.setSpeed('PAUSED');
    },

    // resume at normal speed - unfreeze the suffering
    play() {
        this.setSpeed('NORMAL');
    },

    // get current game state info - a snapshot of your digital existence
    getState() {
        return {
            isRunning: this.isRunning,
            timeSpeed: TimeSystem?.currentSpeed || 'UNKNOWN',
            isPaused: TimeSystem?.isPaused || true,
            gameTime: TimeSystem?.getFormattedTime() || 'N/A',
            isTraveling: TravelSystem?.playerPosition?.isTraveling || false
        };
    }
};

// auto-initialize when DOM is ready - the ritual begins when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            GameEngine.init();
            // Don't auto-start - let user click play
            console.log('🎮 GameEngine ready - click play to begin!');
        }, 500);
    });
} else {
    setTimeout(() => {
        GameEngine.init();
        console.log('🎮 GameEngine ready - click play to begin!');
    }, 500);
}

// expose globally - let the world see our creation
window.GameEngine = GameEngine;
