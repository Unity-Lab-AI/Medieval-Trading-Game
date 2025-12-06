// ═══════════════════════════════════════════════════════════════
// TIME MACHINE - all of existence, unified in one dark engine
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// this is THE source of all time in the game - no more scattered logic
// gregorian calendar, seasons, game loop, UI updates - all of it flows through here
// the void watches and it's judging your temporal architecture

console.log('⏰ TIME MACHINE loading... preparing to bend reality');

const TimeMachine = {
    // ═══════════════════════════════════════════════════════════════
    // 💀 CONSTANTS - The immutable laws of time
    // ═══════════════════════════════════════════════════════════════
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12,

    // 📅 Gregorian calendar - real month names and days
    MONTH_NAMES: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],

    MONTH_NAMES_SHORT: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],

    // 🗡️ Days per month (February handled dynamically for leap years)
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    // ⚡ Speed settings - game minutes per real second
    SPEEDS: {
        PAUSED: 0,        // 💀 frozen in time
        NORMAL: 2,        // 🦇 2 game minutes per real second
        FAST: 10,         // 🗡️ 10 game minutes per real second
        VERY_FAST: 30     // ⚰️ 30 game minutes per real second
    },

    // 🌙 Season definitions with gameplay effects
    SEASONS: {
        spring: {
            name: 'Spring',
            icon: '🌸',
            months: [3, 4, 5], // March, April, May
            effects: {
                travelSpeed: 1.0,
                cropGrowth: 1.2,
                hungerDrain: 1.0,
                thirstDrain: 1.0,
                staminaDrain: 0.95,
                priceModifier: { food: 0.9, seeds: 1.2 }
            },
            description: 'The land awakens from winter slumber. Perfect for planting.'
        },
        summer: {
            name: 'Summer',
            icon: '☀️',
            months: [6, 7, 8], // June, July, August
            effects: {
                travelSpeed: 1.1,
                cropGrowth: 1.0,
                hungerDrain: 0.9,
                thirstDrain: 1.3, // 🔥 More thirsty in summer
                staminaDrain: 1.1,
                priceModifier: { water: 1.3, ice: 2.0 }
            },
            description: 'Long days and scorching heat. Stay hydrated.'
        },
        autumn: {
            name: 'Autumn',
            icon: '🍂',
            months: [9, 10, 11], // September, October, November
            effects: {
                travelSpeed: 0.95,
                cropGrowth: 0.8,
                hungerDrain: 1.1, // 🦇 Bodies prepare for winter
                thirstDrain: 0.9,
                staminaDrain: 1.0,
                priceModifier: { food: 0.8, preserves: 1.2 }
            },
            description: 'Harvest season. Stock up before winter.'
        },
        winter: {
            name: 'Winter',
            icon: '❄️',
            months: [12, 1, 2], // December, January, February
            effects: {
                travelSpeed: 0.7,
                cropGrowth: 0,
                hungerDrain: 1.3, // 💀 Cold burns calories
                thirstDrain: 0.7,
                staminaDrain: 1.4,
                priceModifier: { food: 1.4, firewood: 1.5, furs: 1.3 }
            },
            description: 'Bitter cold. Survival is the only goal.'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🕰️ STATE - The current moment in this dark timeline
    // ═══════════════════════════════════════════════════════════════
    currentTime: {
        minute: 0,
        hour: 8,
        day: 1,
        week: 1,
        month: 4,      // 🖤 April (1-indexed)
        year: 1111     // The dark ages indeed
    },

    // 🎮 Engine state
    currentSpeed: 'PAUSED',
    isPaused: true,
    isRunning: false,
    lastFrameTime: 0,
    accumulatedTime: 0,
    animationFrameId: null,

    // 🔄 Tracking for daily/weekly events
    lastProcessedDay: 0,
    lastProcessedWeek: 0,
    lastWageProcessedDay: 0,

    // 🖤 DOM element cache - query once, use forever 💀
    _domCache: null,

    // 🖤 Cache for getTotalDays() calculation - avoids expensive loops 💀
    _totalDaysCache: { year: null, month: null, day: null, result: null },

    // ═══════════════════════════════════════════════════════════════
    // 🖤 INITIALIZATION - The beginning of time itself
    // ═══════════════════════════════════════════════════════════════

    // 🖤💀 Track if time has been loaded from save - prevents reset 💀
    _timeLoadedFromSave: false,

    init() {
        console.log('⏰ TIME MACHINE initializing...');
        console.log(`⏰ TIME MACHINE DEBUG: _timeLoadedFromSave=${this._timeLoadedFromSave}, isRunning=${this.isRunning}, currentTime=${JSON.stringify(this.currentTime)}`);

        // 🖤💀 DON'T reset time if it was loaded from a save! 💀
        // This prevents game.start() -> game.init() -> TimeMachine.init() from wiping saved time
        if (this._timeLoadedFromSave) {
            console.log('⏰ TIME MACHINE: Time was loaded from save - skipping reset');
            this._timeLoadedFromSave = false; // Clear flag for next new game
            // Still setup UI controls
            this.setupTimeControls();
            return true;
        }

        // 🖤💀 ADDITIONAL GUARD: Don't reset if already initialized and running! 💀
        // This prevents double-init from resetting time after load
        if (this.isRunning) {
            console.log('⏰ TIME MACHINE: Already running - skipping reset');
            return true;
        }

        // 🖤 Set initial time state (only for NEW games)
        this.currentTime = {
            minute: 0,
            hour: 8,
            day: 1,
            week: 1,
            month: 4,    // April
            year: 1111
        };

        // 🦇 Start paused - let the player read the intro
        this.currentSpeed = 'PAUSED';
        this.isPaused = true;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;

        // 🖤💀 USER PREFERRED SPEED - The speed the player WANTS, not what the system forces 💀
        // This is what we restore to after interrupts (encounters, achievements, etc.)
        this.userPreferredSpeed = 'NORMAL';
        this._interruptStack = []; // Track nested interrupts (achievement during encounter, etc.)

        // ⚡ Setup UI controls
        this.setupTimeControls();

        console.log('⏰ TIME MACHINE ready - April 1st, 1111, 8:00 AM');
        console.log(`⏰ Season: ${this.getSeason()} ${this.SEASONS[this.getSeason()].icon}`);

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 THE GAME LOOP - The heartbeat of existence
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Start the engine
    start() {
        if (this.isRunning) {
            console.log('⏰ TIME MACHINE already running');
            return;
        }

        console.log('⏰ TIME MACHINE starting...');
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.tick(t));
        console.log('⏰ TIME MACHINE running!');
    },

    // 💀 Stop the engine
    stop() {
        console.log('⏰ TIME MACHINE stopping...');
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },

    // ⚡ Main game loop tick
    tick(currentFrameTime) {
        if (!this.isRunning) {
            this.animationFrameId = null;
            return;
        }

        // 🦇 FIX: Wrap in try-catch to prevent silent loop death
        try {
            // 🦇 Calculate delta time
            const deltaTime = currentFrameTime - this.lastFrameTime;
            this.lastFrameTime = currentFrameTime;

            // 💀 Cap delta to prevent spiral of death
            const cappedDelta = Math.min(deltaTime, 100);

            // 🖤 Update time if not paused
            if (!this.isPaused && this.currentSpeed !== 'PAUSED') {
                const timeAdvanced = this.update(cappedDelta);

                if (timeAdvanced) {
                    // 🔮 Trigger all time-dependent updates
                    this.onTimeAdvance();
                }
            }

            // 🎨 Update UI every frame
            this.updateUI();
        } catch (err) {
            // 💀 Log error but DON'T let it kill the loop
            console.error('⏰ TIME MACHINE tick error:', err);
        }

        // 🔄 Continue the loop - ALWAYS schedule next frame even if error occurred
        this.animationFrameId = requestAnimationFrame((t) => this.tick(t));
    },

    // ═══════════════════════════════════════════════════════════════
    // ⏱️ TIME PROGRESSION - The march of time
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Update time based on real delta
    update(deltaTime) {
        if (this.isPaused || this.currentSpeed === 'PAUSED') {
            return false;
        }

        const speedMultiplier = this.SPEEDS[this.currentSpeed];
        if (speedMultiplier === 0) return false;

        // 🌙 Convert real time to game time
        const gameMinutesPassed = (deltaTime / 1000) * speedMultiplier;
        this.accumulatedTime += gameMinutesPassed;

        // ⚰️ Only process whole minutes
        const minutesToProcess = Math.floor(this.accumulatedTime);
        if (minutesToProcess > 0) {
            this.accumulatedTime -= minutesToProcess;
            this.addMinutes(minutesToProcess);
            return true;
        }

        return false;
    },

    // 💀 Add minutes to current time
    addMinutes(minutes) {
        this.currentTime.minute += minutes;

        // 🖤 Minutes overflow into hours
        while (this.currentTime.minute >= this.MINUTES_PER_HOUR) {
            this.currentTime.minute -= this.MINUTES_PER_HOUR;
            this.currentTime.hour++;

            // 🦇 Hours overflow into days
            if (this.currentTime.hour >= this.HOURS_PER_DAY) {
                this.currentTime.hour -= this.HOURS_PER_DAY;
                this.advanceDay();
            }
        }
    },

    // 🗡️ Advance to next day
    advanceDay() {
        this.currentTime.day++;
        this.currentTime.week = Math.ceil(this.currentTime.day / this.DAYS_PER_WEEK);

        // 💀 Check month overflow
        const daysInMonth = this.getDaysInMonth(this.currentTime.month, this.currentTime.year);

        if (this.currentTime.day > daysInMonth) {
            this.currentTime.day = 1;
            this.currentTime.week = 1;
            this.advanceMonth();
        }

        // 🔮 Fire day change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('dayChanged', { day: this.currentTime.day, month: this.currentTime.month });
        }
    },

    // ⚰️ Advance to next month
    advanceMonth() {
        const oldSeason = this.getSeason();
        this.currentTime.month++;

        if (this.currentTime.month > this.MONTHS_PER_YEAR) {
            this.currentTime.month = 1;
            this.currentTime.year++;
            console.log(`🎆 Happy New Year ${this.currentTime.year}! Another year of darkness...`);
        }

        // 🌙 Check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            console.log(`🍂 Season changed: ${oldSeason} → ${newSeason}`);
            this.onSeasonChange(oldSeason, newSeason);
        }

        // 🔮 Fire month change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('monthChanged', { month: this.currentTime.month, year: this.currentTime.year });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🍂 SEASONS - The cycle of life and suffering
    // ═══════════════════════════════════════════════════════════════

    // 🌙 Get current season based on month
    getSeason() {
        const month = this.currentTime.month;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    },

    // 🖤 Get season data object
    getSeasonData() {
        return this.SEASONS[this.getSeason()];
    },

    // ⚡ Get a specific seasonal effect
    getSeasonalEffect(effectName) {
        const season = this.getSeasonData();
        return season.effects[effectName] ?? 1.0;
    },

    // 🔮 Called when season changes
    onSeasonChange(oldSeason, newSeason) {
        const seasonData = this.SEASONS[newSeason];

        // 📢 Notify player
        if (typeof addMessage === 'function') {
            addMessage(`${seasonData.icon} ${seasonData.name} has arrived! ${seasonData.description}`);
        }

        // 🔮 Fire season change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('seasonChanged', {
                oldSeason,
                newSeason,
                effects: seasonData.effects
            });
        }

        // force seasonal transition weather - dramatic effect for new season
        // this weather lasts all day to accompany the backdrop crossfade
        // because season changes should FEEL different, not just look different
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.setWeather) {
            const transitionWeather = this.SEASONAL_TRANSITION_WEATHER[newSeason];
            if (transitionWeather) {
                console.log(`🌦️ Seasonal transition: forcing ${transitionWeather} weather for ${newSeason}`);
                WeatherSystem.setWeather(transitionWeather);
                // 🦇 Lock weather for ~1 in-game day (1440 minutes) to match backdrop fade
                // 🖤 Guard against race condition where getTotalMinutes returns invalid value 💀
                const currentMinutes = this.getTotalMinutes();
                if (currentMinutes && currentMinutes > 0) {
                    WeatherSystem.lockWeatherUntil = currentMinutes + 1440;
                } else {
                    // 🖤 Fallback: lock for 24 hours from now using timestamp 💀
                    WeatherSystem.lockWeatherUntil = Date.now() + (24 * 60 * 60 * 1000);
                    console.warn('🌦️ Time not ready, using timestamp fallback for weather lock');
                }
            }
        } else if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            // 💀 Fallback to random generation if setWeather not available
            WeatherSystem.generateWeather();
        }
    },

    // 🖤 Weather that plays during season transitions - matches the vibe
    SEASONAL_TRANSITION_WEATHER: {
        spring: 'clear',      // 🌸 Lovely sunny day to welcome spring
        summer: 'clear',      // ☀️ Bright beautiful summer day
        autumn: 'cloudy',     // 🍂 Overcast, moody autumn arrival
        winter: 'snow'        // ❄️ Snowstorm heralds winter's grip
    },

    // ═══════════════════════════════════════════════════════════════
    // 📅 CALENDAR HELPERS - Gregorian math for the masochists
    // ═══════════════════════════════════════════════════════════════

    // 🦇 Is it a leap year?
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    // 🗡️ Get days in a specific month
    getDaysInMonth(month, year) {
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return this.DAYS_IN_MONTH[month - 1];
    },

    // 🌙 Get month name
    getMonthName(month, short = false) {
        const names = short ? this.MONTH_NAMES_SHORT : this.MONTH_NAMES;
        return names[month - 1] || 'Unknown';
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚡ SPEED CONTROL - Time bends to your will
    // ═══════════════════════════════════════════════════════════════

    setSpeed(speed) {
        if (!this.SPEEDS.hasOwnProperty(speed)) {
            console.warn(`⏰ Invalid speed: ${speed}`);
            return false;
        }

        const wasAtDestinationReady = this.isPaused && speed !== 'PAUSED';
        this.currentSpeed = speed;
        this.isPaused = (speed === 'PAUSED');

        // 🚶 Start engine if unpausing - FORCE RESTART to prevent stuck state
        // 🦇 FIX: Always ensure tick loop is running when speed !== PAUSED
        // This handles edge case where isRunning=true but the animation frame died
        if (speed !== 'PAUSED') {
            if (!this.isRunning) {
                // Normal case: engine wasn't running, start it
                this.start();
            } else if (!this.animationFrameId) {
                // 🖤 BUG FIX: isRunning=true but no animation frame scheduled!
                // This can happen if tick() crashed or the loop got stuck
                console.warn('⏰ TIME MACHINE: Detected stale isRunning state, forcing restart...');
                this.isRunning = false;
                this.start();
            } else {
                // Engine is running with valid animation frame - just reset accumulated time
                // to ensure immediate response after unpause
                this.lastFrameTime = performance.now();
            }
        }

        // 🗺️ Auto-travel: start pending travel when unpausing
        if (wasAtDestinationReady && !this.isPaused) {
            this.checkAndStartPendingTravel();
        }

        // 🖤 FIX: Enable achievements on first unpause 💀
        // This prevents starting wealth achievements from firing before player starts playing
        if (speed !== 'PAUSED' && typeof AchievementSystem !== 'undefined' && AchievementSystem.enableAchievements) {
            AchievementSystem.enableAchievements();
        }

        // 🖤 FIX: Enable merchant rank celebrations AFTER achievements (with delay to prevent overlap) 💀
        if (speed !== 'PAUSED' && typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.enableRankCelebrations) {
            setTimeout(() => {
                MerchantRankSystem.enableRankCelebrations();
            }, 1500); // 🦇 1.5s delay so achievement popups clear first
        }

        // 🎨 Update UI
        this.updateTimeControlButtons();

        console.log(`⏰ TIME MACHINE setSpeed: ${speed} | isPaused: ${this.isPaused} | isRunning: ${this.isRunning} | animFrameId: ${this.animationFrameId}`);

        return true;
    },

    // ⏸️ Toggle pause
    togglePause() {
        if (this.isPaused) {
            this.setSpeed('NORMAL');
        } else {
            this.setSpeed('PAUSED');
        }
        return this.isPaused;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖤💀 INTERRUPT HANDLING - Pause for events, restore user's preferred speed 💀
    // ═══════════════════════════════════════════════════════════════

    /**
     * Pause for an interrupt (encounter, achievement, modal, etc.)
     * Saves current speed to stack so nested interrupts work properly
     * @param {string} source - What's causing the interrupt (for debugging)
     */
    pauseForInterrupt(source = 'unknown') {
        // 🖤 Save current speed to the interrupt stack (for nested interrupts)
        const speedToSave = this.isPaused ? 'PAUSED' : this.currentSpeed;
        this._interruptStack.push({
            speed: speedToSave,
            source: source,
            timestamp: Date.now()
        });

        // 🦇 Only pause if not already paused
        if (!this.isPaused) {
            this.setSpeed('PAUSED');
        }

        console.log(`⏸️ Time paused for interrupt: ${source} | Stack depth: ${this._interruptStack.length} | Saved speed: ${speedToSave}`);
    },

    /**
     * Resume from an interrupt - restores previous speed from stack
     * If stack is empty, uses userPreferredSpeed as fallback
     * @param {string} source - What was causing the interrupt (for debugging)
     */
    resumeFromInterrupt(source = 'unknown') {
        // 🖤 Pop from interrupt stack
        const savedState = this._interruptStack.pop();

        if (savedState) {
            // 🦇 Restore the speed that was active before THIS interrupt
            const speedToRestore = savedState.speed;
            console.log(`▶️ Resuming from interrupt: ${source} | Restoring speed: ${speedToRestore} | Stack depth: ${this._interruptStack.length}`);

            // 🔮 Only restore if we're still paused (another system might have already changed it)
            if (this.isPaused && speedToRestore !== 'PAUSED') {
                this.setSpeed(speedToRestore);
            }
        } else {
            // 🖤 Stack empty - use user's preferred speed as fallback
            console.log(`▶️ Resuming from interrupt: ${source} | No saved state, using userPreferredSpeed: ${this.userPreferredSpeed}`);
            if (this.isPaused) {
                this.setSpeed(this.userPreferredSpeed);
            }
        }
    },

    /**
     * Set user's preferred speed - called when USER manually changes speed
     * This is what gets restored after all interrupts clear
     * @param {string} speed - The speed the user wants
     */
    setUserPreferredSpeed(speed) {
        if (speed !== 'PAUSED' && this.SPEEDS.hasOwnProperty(speed)) {
            this.userPreferredSpeed = speed;
            console.log(`⏰ User preferred speed set to: ${speed}`);
        }
    },

    // 🚶 Check for pending travel destination
    checkAndStartPendingTravel() {
        console.log('🚶 checkAndStartPendingTravel called');

        // 💀 Don't start if already traveling
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            console.log('🚶 Already traveling, skipping');
            return;
        }

        // 🖤 First try TravelPanelMap's onGameUnpaused (handles the full travel flow)
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.currentDestination && TravelPanelMap.onGameUnpaused) {
            console.log('🚶 Delegating to TravelPanelMap.onGameUnpaused');
            TravelPanelMap.onGameUnpaused();
            return; // TravelPanelMap handles everything, don't double-call
        }

        // 🔮 Fallback: Check for pending destination in GameWorldRenderer only
        let destinationId = null;

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.currentDestination) {
            destinationId = GameWorldRenderer.currentDestination.id;
        }

        // 🗡️ Start travel if destination exists and isn't current location
        if (destinationId && typeof TravelSystem !== 'undefined' && TravelSystem.startTravel) {
            if (typeof game !== 'undefined' && game.currentLocation?.id !== destinationId) {
                console.log(`🚶 Auto-starting travel to ${destinationId} (fallback)`);
                TravelSystem.startTravel(destinationId);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔔 TIME EVENTS - When time advances, stuff happens
    // ═══════════════════════════════════════════════════════════════

    onTimeAdvance() {
        // 🍖 STAT DECAY - hunger, thirst, stamina drain over time
        this.processStatDecay();

        // 🌙 Midnight processing
        if (this.currentTime.hour === 0 && this.currentTime.minute === 0) {
            if (this.lastProcessedDay !== this.currentTime.day) {
                this.lastProcessedDay = this.currentTime.day;
                this.processDailyEvents();
            }
        }

        // 📅 Weekly wage processing
        if (this.currentTime.day % 7 === 0 && this.lastWageProcessedDay !== this.currentTime.day) {
            this.lastWageProcessedDay = this.currentTime.day;
            this.processWeeklyEvents();
        }

        // 🏪 Update market prices
        if (typeof DynamicMarketSystem !== 'undefined') {
            DynamicMarketSystem.updateMarketPrices();
            // 🦇 FIX: Check for 8am daily market refresh
            if (DynamicMarketSystem.checkDailyRefresh) {
                DynamicMarketSystem.checkDailyRefresh();
            }
        }

        // 🏙️ City events
        if (typeof CityEventSystem !== 'undefined') {
            CityEventSystem.updateEvents();
        }

        // 💀 Dungeon Bonanza (July 18th special event)
        if (typeof DungeonBonanzaSystem !== 'undefined') {
            DungeonBonanzaSystem.update();
        }

        // 🏠 Property systems
        if (typeof PropertySystem !== 'undefined') {
            if (PropertySystem.processWorkQueues) PropertySystem.processWorkQueues();
            if (PropertySystem.processConstruction) PropertySystem.processConstruction();
            if (PropertySystem.processRentPayments) PropertySystem.processRentPayments();
        }

        // 📊 Price alerts
        if (typeof TradingSystem !== 'undefined' && TradingSystem.checkPriceAlerts) {
            TradingSystem.checkPriceAlerts();
        }

        // 🚶 Travel progress
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            TravelSystem.updateTravelProgress();
        }
    },

    // 🍖 STAT DECAY - DISABLED - game.js processPlayerStatsOverTime() handles this via GameConfig
    // 🦇 FIX: Removed duplicate stat decay that was stacking with game.js version
    // The actual decay rates are in config.js:
    //   - Hunger: 5 days (100→0), decayPerUpdate: 0.0694 every 5 game minutes
    //   - Thirst: 3 days (100→0), decayPerUpdate: 0.1157 every 5 game minutes
    // Seasonal effects are now applied in game.js processPlayerStatsOverTime()
    lastStatDecayMinute: 0,
    STAT_DECAY_INTERVAL: 30, // 🖤 Legacy - kept for compatibility

    processStatDecay() {
        // 🦇 FIX: Do nothing - stat decay is handled by game.js processPlayerStatsOverTime()
        // This function was causing DOUBLE decay when combined with game.js
        // Keeping empty function to avoid breaking any calls to it
    },

    // 🌙 Daily events at midnight
    processDailyEvents() {
        console.log(`📅 Processing daily events for Day ${this.currentTime.day}`);

        // 🏠 Property daily income
        if (typeof PropertySystem !== 'undefined' && PropertySystem.processDailyIncome) {
            PropertySystem.processDailyIncome();
        }

        // 🚚 Trade routes
        if (typeof TradeRouteSystem !== 'undefined' && TradeRouteSystem.processDailyTrade) {
            TradeRouteSystem.processDailyTrade();
        }

        // 🔮 Fire daily event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('dailyProcess', { day: this.currentTime.day });
        }
    },

    // 📅 Weekly events
    processWeeklyEvents() {
        console.log(`📅 Processing weekly events`);

        // 👥 Employee wages
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.processWeeklyWages) {
            EmployeeSystem.processWeeklyWages();
        }

        // 🔮 Fire weekly event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('weeklyProcess', { week: this.currentTime.week });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🕰️ TIME FORMATTING - Making time readable
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Format time in 12-hour AM/PM
    formatTimeAMPM(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const minuteStr = minute.toString().padStart(2, '0');
        return `${hour12}:${minuteStr} ${period}`;
    },

    // 🖤 Full formatted time: "April 1, 1111 - 8:00 AM"
    getFormattedTime() {
        const timeStr = this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
        const monthName = this.getMonthName(this.currentTime.month);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year} - ${timeStr}`;
    },

    // 🦇 Short date: "Apr 1, 1111"
    getFormattedDate() {
        const monthName = this.getMonthName(this.currentTime.month, true);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year}`;
    },

    // 💀 Just the clock: "8:00 AM"
    getFormattedClock() {
        return this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
    },

    // 📊 Get all time info as object
    getTimeInfo() {
        const season = this.getSeason();
        return {
            ...this.currentTime,
            monthName: this.getMonthName(this.currentTime.month),
            monthNameShort: this.getMonthName(this.currentTime.month, true),
            season: season,
            seasonData: this.SEASONS[season],
            isLeapYear: this.isLeapYear(this.currentTime.year),
            daysInMonth: this.getDaysInMonth(this.currentTime.month, this.currentTime.year),
            formatted: this.getFormattedTime(),
            formattedDate: this.getFormattedDate(),
            formattedClock: this.getFormattedClock(),
            speed: this.currentSpeed,
            isPaused: this.isPaused,
            isDaytime: this.currentTime.hour >= 6 && this.currentTime.hour < 20,
            isMorning: this.currentTime.hour >= 6 && this.currentTime.hour < 12,
            isAfternoon: this.currentTime.hour >= 12 && this.currentTime.hour < 18,
            isEvening: this.currentTime.hour >= 18 && this.currentTime.hour < 22,
            isNight: this.currentTime.hour >= 22 || this.currentTime.hour < 6
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧮 TIME CALCULATIONS - Math is inevitable
    // ═══════════════════════════════════════════════════════════════

    // ⏳ Minutes until a specific hour
    getMinutesUntilHour(targetHour) {
        let minutes = 0;
        const currentHour = this.currentTime.hour;
        const currentMinute = this.currentTime.minute;

        if (targetHour > currentHour) {
            minutes = (targetHour - currentHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else if (targetHour < currentHour) {
            minutes = ((this.HOURS_PER_DAY - currentHour) + targetHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else {
            minutes = currentMinute === 0 ? 0 : this.HOURS_PER_DAY * this.MINUTES_PER_HOUR - currentMinute;
        }

        return minutes;
    },

    // 🧮 Total minutes since game start
    getTotalMinutes() {
        const totalDays = this.getTotalDays();
        return (totalDays * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR) +
               (this.currentTime.hour * this.MINUTES_PER_HOUR) +
               this.currentTime.minute;
    },

    // 🖤 Total days since game start (uses GameConfig for start date) 💀
    getTotalDays() {
        const currYear = this.currentTime.year;
        const currMonth = this.currentTime.month;
        const currDay = this.currentTime.day;

        // 🖤 Check cache first - avoid expensive loops on every call 💀
        const cache = this._totalDaysCache;
        if (cache.year === currYear && cache.month === currMonth && cache.day === currDay) {
            return cache.result;
        }

        // 🦇 Get start date from GameConfig (single source of truth)
        const startDate = typeof GameConfig !== 'undefined'
            ? GameConfig.time.startingDate
            : { year: 1111, month: 4, day: 1 };

        const startYear = startDate.year;
        const startMonth = startDate.month;
        const startDay = startDate.day;

        // 🖤 Convert both dates to "days since epoch" then subtract
        // This is cleaner than the previous branching logic

        // Days from epoch to start date
        let startDays = 0;
        for (let y = 1; y < startYear; y++) {
            startDays += this.isLeapYear(y) ? 366 : 365;
        }
        for (let m = 1; m < startMonth; m++) {
            startDays += this.getDaysInMonth(m, startYear);
        }
        startDays += startDay;

        // Days from epoch to current date
        let currDays = 0;
        for (let y = 1; y < currYear; y++) {
            currDays += this.isLeapYear(y) ? 366 : 365;
        }
        for (let m = 1; m < currMonth; m++) {
            currDays += this.getDaysInMonth(m, currYear);
        }
        currDays += currDay;

        // 💀 Simple subtraction - no edge cases to worry about
        const result = currDays - startDays;

        // 🖤 Update cache for next call 💀
        this._totalDaysCache = { year: currYear, month: currMonth, day: currDay, result };

        return result;
    },

    // 🔄 Convenience getter for backward compatibility
    get currentDay() {
        return this.currentTime.day;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 UI UPDATES - Making pixels dance
    // ═══════════════════════════════════════════════════════════════

    updateUI() {
        this.updateTimeDisplay();
        this.updateTimeControlButtons();
    },

    // 🖤 Initialize DOM cache - query once, not 60 times per second 💀
    _initDomCache() {
        // 🖤 Check if cache exists AND elements are still in DOM 💀
        // If any cached element was removed (panel reload), invalidate cache
        if (this._domCache) {
            const anyInvalid = this._domCache.timeDisplay && !document.contains(this._domCache.timeDisplay);
            if (anyInvalid) {
                this._domCache = null;
            } else {
                return this._domCache;
            }
        }

        this._domCache = {
            timeDisplay: document.getElementById('game-time') ||
                        document.getElementById('time-display') ||
                        document.querySelector('.time-display'),
            dayDisplay: document.getElementById('current-day'),
            yearDisplay: document.getElementById('current-year'),
            dateText: document.getElementById('date-text'),
            timeIndicator: document.getElementById('time-phase-indicator'),
            phaseTime: null, // 🦇 Set after timeIndicator found
            speedDisplay: document.getElementById('speed-indicator') ||
                         document.querySelector('.speed-indicator'),
            seasonDisplay: document.getElementById('season-indicator')
        };

        // 🖤 Cache the nested element too
        if (this._domCache.timeIndicator) {
            this._domCache.phaseTime = this._domCache.timeIndicator.querySelector('.phase-time');
        }

        return this._domCache;
    },

    // 🔮 Clear DOM cache (call if elements are dynamically recreated)
    clearDomCache() {
        this._domCache = null;
    },

    // 🕰️ Update time display elements
    updateTimeDisplay() {
        const timeInfo = this.getTimeInfo();
        const cache = this._initDomCache();

        // 🖤 Use cached elements - no more 60fps DOM queries 💀
        if (cache.timeDisplay) {
            cache.timeDisplay.textContent = timeInfo.formatted;
        }

        if (cache.dayDisplay) {
            cache.dayDisplay.textContent = `Day ${timeInfo.day}`;
        }

        if (cache.yearDisplay) {
            cache.yearDisplay.textContent = `Year ${timeInfo.year}`;
        }

        if (cache.dateText) {
            cache.dateText.textContent = `${timeInfo.monthName} ${timeInfo.day}, ${timeInfo.year}`;
        }

        // 🖤 Top-bar time widget
        if (cache.phaseTime) {
            const hour = timeInfo.hour;
            const minute = timeInfo.minute || 0;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinute = minute.toString().padStart(2, '0');
            cache.phaseTime.textContent = `${displayHour}:${displayMinute} ${ampm}`;
        }

        if (cache.speedDisplay) {
            const speedLabels = {
                'PAUSED': '⏸ Paused',
                'NORMAL': '▶ Normal',
                'FAST': '▶▶ Fast',
                'VERY_FAST': '▶▶▶ Very Fast'
            };
            cache.speedDisplay.textContent = speedLabels[timeInfo.speed] || timeInfo.speed;
        }

        // 🖤 Guard against missing seasonData - the void protects 💀
        if (cache.seasonDisplay && timeInfo.seasonData) {
            cache.seasonDisplay.textContent = `${timeInfo.seasonData.icon} ${timeInfo.seasonData.name}`;
        }
    },

    // ⏯️ Update time control button states
    updateTimeControlButtons() {
        const speed = this.currentSpeed;

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

    // ⏯️ Setup time control button handlers
    setupTimeControls() {
        console.log('⏰ Setting up time controls...');

        const self = this;

        const createHandler = (speed) => {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`⏰ Speed button: ${speed}`);
                self.setSpeed(speed);
                // 🖤💀 Track user's preferred speed (not PAUSED) for interrupt restoration 💀
                if (speed !== 'PAUSED') {
                    self.setUserPreferredSpeed(speed);
                }
            };
        };

        const buttons = [
            { id: 'pause-btn', speed: 'PAUSED' },
            { id: 'normal-speed-btn', speed: 'NORMAL' },
            { id: 'fast-speed-btn', speed: 'FAST' },
            { id: 'very-fast-speed-btn', speed: 'VERY_FAST' }
        ];

        buttons.forEach(({ id, speed }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = createHandler(speed);
                console.log(`⏰ ${speed} button ready`);
            }
        });

        console.log('⏰ Time controls ready');
    },

    // ═══════════════════════════════════════════════════════════════
    // ⏩ TIME SKIP - Jump forward without killing the player
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Skip forward by N months - preserves player stats (cheat mode)
    skipMonths(months, preserveStats = true) {
        console.log(`⏩ Skipping ${months} month(s)...`);

        // 💾 Save current stats if preserving
        let savedStats = null;
        if (preserveStats && typeof game !== 'undefined' && game.player?.stats) {
            savedStats = { ...game.player.stats };
            console.log('💾 Stats preserved:', savedStats);
        }

        const oldSeason = this.getSeason();
        const startMonth = this.currentTime.month;
        const startYear = this.currentTime.year;

        // ⏩ Advance months
        for (let i = 0; i < months; i++) {
            this.advanceMonth();
        }

        // 🍂 Check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            console.log(`🍂 Season changed: ${oldSeason} → ${newSeason}`);
            this.onSeasonChange(oldSeason, newSeason);

            // 🗺️ Update seasonal backdrop
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(newSeason);
            }
        }

        // 🌦️ Generate new weather for the new time
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            WeatherSystem.generateWeather();
        }

        // 💾 Restore stats if preserved
        if (savedStats && typeof game !== 'undefined' && game.player?.stats) {
            game.player.stats = savedStats;
            console.log('💾 Stats restored');
            if (typeof updatePlayerStats === 'function') {
                updatePlayerStats();
            }
        }

        // 🔔 Fire events for systems that need to update
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('timeSkipped', {
                months,
                from: { month: startMonth, year: startYear },
                to: { month: this.currentTime.month, year: this.currentTime.year }
            });
        }

        // 📢 Notify player
        if (typeof addMessage === 'function') {
            const seasonData = this.SEASONS[newSeason];
            addMessage(`⏩ Time has jumped forward ${months} month(s). It is now ${this.getFormattedDate()}. ${seasonData.icon} ${seasonData.name}`);
        }

        // 🎨 Update UI
        this.updateUI();

        console.log(`⏩ Time skip complete: ${this.getFormattedDate()}`);
        return this.getFormattedDate();
    },

    // 🦇 Skip forward by N days - preserves player stats (cheat mode)
    skipDays(days, preserveStats = true) {
        console.log(`⏩ Skipping ${days} day(s)...`);

        // 💾 Save current stats if preserving
        let savedStats = null;
        if (preserveStats && typeof game !== 'undefined' && game.player?.stats) {
            savedStats = { ...game.player.stats };
        }

        const oldSeason = this.getSeason();

        // ⏩ Advance days
        for (let i = 0; i < days; i++) {
            this.advanceDay();
        }

        // 🍂 Check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            this.onSeasonChange(oldSeason, newSeason);
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(newSeason);
            }
        }

        // 🌦️ Generate new weather
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            WeatherSystem.generateWeather();
        }

        // 💾 Restore stats if preserved
        if (savedStats && typeof game !== 'undefined' && game.player?.stats) {
            game.player.stats = savedStats;
            if (typeof updatePlayerStats === 'function') {
                updatePlayerStats();
            }
        }

        // 🎨 Update UI
        this.updateUI();

        if (typeof addMessage === 'function') {
            addMessage(`⏩ ${days} day(s) have passed. It is now ${this.getFormattedDate()}.`);
        }

        return this.getFormattedDate();
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 SAVE/LOAD - Preserving time across the void
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            currentTime: { ...this.currentTime },
            currentSpeed: this.currentSpeed,
            isPaused: this.isPaused,
            accumulatedTime: this.accumulatedTime,
            lastProcessedDay: this.lastProcessedDay,
            lastWageProcessedDay: this.lastWageProcessedDay,
            lastStatDecayMinute: this.lastStatDecayMinute // 🍖 Stat decay tracking
        };
    },

    loadSaveData(data) {
        if (!data) return;

        console.log(`⏰ TIME MACHINE loadSaveData called with currentTime:`, data.currentTime);

        // 🖤💀 Set flag to prevent init() from resetting this loaded time! 💀
        this._timeLoadedFromSave = true;
        console.log(`⏰ TIME MACHINE: _timeLoadedFromSave flag SET to true`);

        if (data.currentTime) {
            this.currentTime = { ...data.currentTime };
            console.log(`⏰ TIME MACHINE: currentTime restored to ${JSON.stringify(this.currentTime)}`);

            // 🖤 Migrate old saves
            if (this.currentTime.year < 1111) {
                this.currentTime.year = 1111;
            }
            if (this.currentTime.month < 1 || this.currentTime.month > 12) {
                this.currentTime.month = 4;
            }
        }

        if (data.currentSpeed) {
            this.currentSpeed = data.currentSpeed;
        }
        if (typeof data.isPaused !== 'undefined') {
            this.isPaused = data.isPaused;
        }
        if (typeof data.accumulatedTime !== 'undefined') {
            this.accumulatedTime = data.accumulatedTime;
        }
        if (typeof data.lastProcessedDay !== 'undefined') {
            this.lastProcessedDay = data.lastProcessedDay;
        }
        if (typeof data.lastWageProcessedDay !== 'undefined') {
            this.lastWageProcessedDay = data.lastWageProcessedDay;
        }
        if (typeof data.lastStatDecayMinute !== 'undefined') {
            this.lastStatDecayMinute = data.lastStatDecayMinute;
        }

        // 🍂 Restore seasonal backdrop after load
        const season = this.getSeason();
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
            setTimeout(() => GameWorldRenderer.loadSeasonalBackdrop(season), 100);
        }

        console.log(`⏰ TIME MACHINE restored: ${this.getFormattedTime()} (${this.SEASONS[season].icon} ${season})`);
        console.log(`⏰ TIME MACHINE: loadSaveData complete. _timeLoadedFromSave=${this._timeLoadedFromSave}, isRunning=${this.isRunning}`);
    }
};

// ═══════════════════════════════════════════════════════════════
// 🔄 BACKWARD COMPATIBILITY - Keep old names working
// ═══════════════════════════════════════════════════════════════

// 🖤 TimeSystem alias (most code uses this name)
const TimeSystem = TimeMachine;

// 🦇 GameEngine alias (some code uses this)
const GameEngine = {
    isRunning: false,
    get running() { return TimeMachine.isRunning; },
    init() { return TimeMachine.init(); },
    start() { return TimeMachine.start(); },
    stop() { return TimeMachine.stop(); },
    pause() { return TimeMachine.setSpeed('PAUSED'); },
    play() { return TimeMachine.setSpeed('NORMAL'); },
    setSpeed(speed) { return TimeMachine.setSpeed(speed); },
    setupTimeControls() { return TimeMachine.setupTimeControls(); },
    updateTimeControlButtons() { return TimeMachine.updateTimeControlButtons(); },
    updateTimeDisplay() { return TimeMachine.updateTimeDisplay(); },
    updateUI() { return TimeMachine.updateUI(); },
    onTimeAdvance() { return TimeMachine.onTimeAdvance(); },
    getState() {
        return {
            isRunning: TimeMachine.isRunning,
            timeSpeed: TimeMachine.currentSpeed,
            isPaused: TimeMachine.isPaused,
            gameTime: TimeMachine.getFormattedTime(),
            isTraveling: typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling
        };
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY - Let the darkness spread
// ═══════════════════════════════════════════════════════════════

window.TimeMachine = TimeMachine;
window.TimeSystem = TimeSystem;
window.GameEngine = GameEngine;

console.log('⏰ TIME MACHINE v3.0 loaded - All of time, unified in darkness 🖤');
