// ═══════════════════════════════════════════════════════════════
// TIME MACHINE - all of existence, unified in one dark engine
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
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
    // constants - the immutable laws of time
    // ═══════════════════════════════════════════════════════════════
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12,

    // gregorian calendar - real month names and days
    MONTH_NAMES: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],

    MONTH_NAMES_SHORT: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],

    // days per month (February handled dynamically for leap years)
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    // Speed settings - game minutes per real second (actual multipliers)
    // Base rate is 2 game minutes per real second at 1x
    SPEEDS: {
        PAUSED: 0,        // Frozen in time
        NORMAL: 2,        // 1x speed - 2 game minutes per real second
        FAST: 4,          // 2x speed - 4 game minutes per real second
        VERY_FAST: 8      // 4x speed - 8 game minutes per real second
    },

    // Speed multiplier labels for UI
    SPEED_LABELS: {
        NORMAL: '1x',
        FAST: '2x',
        VERY_FAST: '4x'
    },

    // season definitions with gameplay effects
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
                thirstDrain: 1.3, // more thirsty in summer
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
                hungerDrain: 1.1, // bodies prepare for winter
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
                hungerDrain: 1.3, // cold burns calories
                thirstDrain: 0.7,
                staminaDrain: 1.4,
                priceModifier: { food: 1.4, firewood: 1.5, furs: 1.3 }
            },
            description: 'Bitter cold. Survival is the only goal.'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // state - the current moment in this dark timeline
    // ═══════════════════════════════════════════════════════════════
    currentTime: {
        minute: 0,
        hour: 8,
        day: 1,
        week: 1,
        month: 4,      // april (1-indexed)
        year: 1111     // The dark ages indeed
    },

    // engine state
    currentSpeed: 'PAUSED',
    isPaused: true,
    isRunning: false,
    lastFrameTime: 0,
    accumulatedTime: 0,
    animationFrameId: null,
    _restartLock: false, // FIX BUG-6: Lock to prevent race conditions in animation frame restart

    // tracking for daily/weekly events
    lastProcessedDay: 0,
    lastProcessedWeek: 0,
    lastWageProcessedDay: 0,

    // dom element cache - query once, use forever
    _domCache: null,

    // cache for getTotalDays() calculation - avoids expensive loops
    _totalDaysCache: { year: null, month: null, day: null, result: null },

    // ═══════════════════════════════════════════════════════════════
    // initialization - the beginning of time itself
    // ═══════════════════════════════════════════════════════════════

    // track if time has been loaded from save - prevents reset
    _timeLoadedFromSave: false,

    init() {
        console.log('⏰ TIME MACHINE initializing...');
        console.log(`⏰ TIME MACHINE DEBUG: _timeLoadedFromSave=${this._timeLoadedFromSave}, isRunning=${this.isRunning}, currentTime=${JSON.stringify(this.currentTime)}`);

        // don't reset time if it was loaded from a save!
        // This prevents game.start() -> game.init() -> TimeMachine.init() from wiping saved time
        if (this._timeLoadedFromSave) {
            console.log('⏰ TIME MACHINE: Time was loaded from save - skipping reset');
            this._timeLoadedFromSave = false; // Clear flag for next new game
            // Still setup UI controls
            this.setupTimeControls();
            return true;
        }

        // additional guard: don't reset if already initialized and running!
        // This prevents double-init from resetting time after load
        if (this.isRunning) {
            console.log('⏰ TIME MACHINE: Already running - skipping reset');
            // Still setup UI controls even if already running - ensures pause button is wired
            this.setupTimeControls();
            return true;
        }

        // set initial time state (only for NEW games)
        this.currentTime = {
            minute: 0,
            hour: 8,
            day: 1,
            week: 1,
            month: 4,    // April
            year: 1111
        };

        // start paused - let the player read the intro
        this.currentSpeed = 'PAUSED';
        this.isPaused = true;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;

        // user preferred speed - the speed the player WANTS, not what the system forces
        // this is what we restore to after interrupts (encounters, achievements, etc.)
        this.userPreferredSpeed = 'NORMAL';
        this._interruptStack = []; // track nested interrupts (achievement during encounter, etc.)

        // Setup UI controls
        this.setupTimeControls();
        // Update button state to show play icon (game starts paused)
        this.updateTimeControlButtons();

        console.log('TIME MACHINE ready - April 1st, 1111, 8:00 AM');
        console.log(`⏰ Season: ${this.getSeason()} ${this.SEASONS[this.getSeason()].icon}`);

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // the game loop - the heartbeat of existence
    // ═══════════════════════════════════════════════════════════════

    // start the engine
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

    // stop the engine
    stop() {
        console.log('⏰ TIME MACHINE stopping...');
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },

    // main game loop tick
    tick(currentFrameTime) {
        if (!this.isRunning) {
            this.animationFrameId = null;
            return;
        }

        // wrap in try-catch to prevent silent loop death
        try {
            // calculate delta time
            const deltaTime = currentFrameTime - this.lastFrameTime;
            this.lastFrameTime = currentFrameTime;

            // cap delta to prevent spiral of death
            const cappedDelta = Math.min(deltaTime, 100);

            // update time if not paused
            if (!this.isPaused && this.currentSpeed !== 'PAUSED') {
                const timeAdvanced = this.update(cappedDelta);

                if (timeAdvanced) {
                    // trigger all time-dependent updates
                    this.onTimeAdvance();
                    // only update UI when time actually advances
                    // avoids unnecessary DOM updates (was 360/sec, now ~1-2/sec)
                    this.updateUI();
                }
            }
        } catch (err) {
            // log error but DON'T let it kill the loop
            console.error('⏰ TIME MACHINE tick error:', err);
        }

        // continue the loop - ALWAYS schedule next frame even if error occurred
        this.animationFrameId = requestAnimationFrame((t) => this.tick(t));
    },

    // ═══════════════════════════════════════════════════════════════
    // time progression - the march of time
    // ═══════════════════════════════════════════════════════════════

    // update time based on real delta
    update(deltaTime) {
        if (this.isPaused || this.currentSpeed === 'PAUSED') {
            return false;
        }

        const speedMultiplier = this.SPEEDS[this.currentSpeed];
        if (speedMultiplier === 0) return false;

        // convert real time to game time
        const gameMinutesPassed = (deltaTime / 1000) * speedMultiplier;
        this.accumulatedTime += gameMinutesPassed;

        // only process whole minutes
        const minutesToProcess = Math.floor(this.accumulatedTime);
        if (minutesToProcess > 0) {
            this.accumulatedTime -= minutesToProcess;
            this.addMinutes(minutesToProcess);
            return true;
        }

        return false;
    },

    // add minutes to current time
    addMinutes(minutes) {
        this.currentTime.minute += minutes;

        // minutes overflow into hours
        while (this.currentTime.minute >= this.MINUTES_PER_HOUR) {
            this.currentTime.minute -= this.MINUTES_PER_HOUR;
            this.currentTime.hour++;

            // hours overflow into days
            if (this.currentTime.hour >= this.HOURS_PER_DAY) {
                this.currentTime.hour -= this.HOURS_PER_DAY;
                this.advanceDay();
            }
        }
    },

    // advance to next day
    advanceDay() {
        this.currentTime.day++;
        this.currentTime.week = Math.ceil(this.currentTime.day / this.DAYS_PER_WEEK);

        // check month overflow
        const daysInMonth = this.getDaysInMonth(this.currentTime.month, this.currentTime.year);

        if (this.currentTime.day > daysInMonth) {
            this.currentTime.day = 1;
            this.currentTime.week = 1;
            this.advanceMonth();
        }

        // fire day change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:dayChanged', { day: this.currentTime.day, month: this.currentTime.month });
        }
    },

    // advance to next month
    advanceMonth() {
        const oldSeason = this.getSeason();
        this.currentTime.month++;

        if (this.currentTime.month > this.MONTHS_PER_YEAR) {
            this.currentTime.month = 1;
            this.currentTime.year++;
            console.log(`🎆 Happy New Year ${this.currentTime.year}! Another year of darkness...`);
        }

        // check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            console.log(`🍂 Season changed: ${oldSeason} → ${newSeason}`);
            this.onSeasonChange(oldSeason, newSeason);
        }

        // fire month change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:monthChanged', { month: this.currentTime.month, year: this.currentTime.year });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // seasons - the cycle of life and suffering
    // ═══════════════════════════════════════════════════════════════

    // get current season based on month
    getSeason() {
        const month = this.currentTime.month;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    },

    // get season data object
    getSeasonData() {
        return this.SEASONS[this.getSeason()];
    },

    // get a specific seasonal effect
    getSeasonalEffect(effectName) {
        const season = this.getSeasonData();
        return season.effects[effectName] ?? 1.0;
    },

    // called when season changes
    onSeasonChange(oldSeason, newSeason) {
        const seasonData = this.SEASONS[newSeason];

        // notify player
        if (typeof addMessage === 'function') {
            addMessage(`${seasonData.icon} ${seasonData.name} has arrived! ${seasonData.description}`);
        }

        // fire season change event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:seasonChanged', {
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
                // lock weather for ~1 in-game day (1440 minutes) to match backdrop fade
                // guard against race condition where getTotalMinutes returns invalid value
                const currentMinutes = this.getTotalMinutes();
                if (currentMinutes && currentMinutes > 0) {
                    WeatherSystem.lockWeatherUntil = currentMinutes + 1440;
                } else {
                    // fallback: lock for 24 hours from now using timestamp
                    WeatherSystem.lockWeatherUntil = Date.now() + (24 * 60 * 60 * 1000);
                    console.warn('🌦️ Time not ready, using timestamp fallback for weather lock');
                }
            }
        } else if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            // fallback to random generation if setWeather not available
            WeatherSystem.generateWeather();
        }
    },

    // weather that plays during season transitions - matches the vibe
    SEASONAL_TRANSITION_WEATHER: {
        spring: 'clear',      // lovely sunny day to welcome spring
        summer: 'clear',      // bright beautiful summer day
        autumn: 'cloudy',     // overcast, moody autumn arrival
        winter: 'snow'        // snowstorm heralds winter's grip
    },

    // ═══════════════════════════════════════════════════════════════
    // calendar helpers - gregorian math for the masochists
    // ═══════════════════════════════════════════════════════════════

    // is it a leap year?
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    // get days in a specific month
    getDaysInMonth(month, year) {
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return this.DAYS_IN_MONTH[month - 1];
    },

    // get month name
    getMonthName(month, short = false) {
        const names = short ? this.MONTH_NAMES_SHORT : this.MONTH_NAMES;
        return names[month - 1] || 'Unknown';
    },

    // ═══════════════════════════════════════════════════════════════
    // speed control - time bends to your will
    // ═══════════════════════════════════════════════════════════════

    setSpeed(speed) {
        if (!this.SPEEDS.hasOwnProperty(speed)) {
            console.warn(`⏰ Invalid speed: ${speed}`);
            return false;
        }

        const wasAtDestinationReady = this.isPaused && speed !== 'PAUSED';
        this.currentSpeed = speed;
        this.isPaused = (speed === 'PAUSED');

        // start engine if unpausing - FORCE RESTART to prevent stuck state
        // always ensure tick loop is running when speed !== PAUSED
        // this handles edge case where isRunning=true but the animation frame died
        if (speed !== 'PAUSED') {
            if (!this.isRunning) {
                // normal case: engine wasn't running, start it
                this.start();
            } else if (!this.animationFrameId) {
                // FIX BUG-6: Use lock to prevent race condition in restart sequence
                // Without this lock, multiple rapid setSpeed calls could trigger multiple starts
                if (this._restartLock) {
                    console.log('⏰ TIME MACHINE: Restart already in progress, skipping duplicate');
                    return; // Early exit - restart already in progress
                }
                this._restartLock = true;

                // bug fix: isRunning=true but no animation frame scheduled!
                // this can happen if tick() crashed or the loop got stuck
                console.warn('⏰ TIME MACHINE: Detected stale isRunning state, forcing restart...');
                this.isRunning = false;
                this.start();

                // Release lock after start completes
                this._restartLock = false;
            } else {
                // engine is running with valid animation frame - just reset accumulated time
                // to ensure immediate response after unpause
                this.lastFrameTime = performance.now();
            }
        }

        // auto-travel: start pending travel when unpausing
        if (wasAtDestinationReady && !this.isPaused) {
            this.checkAndStartPendingTravel();
        }

        // NOTE: Achievements are now tied to tutorial completion, not unpause
        // This call is kept for backwards compatibility but is a no-op
        // Achievements are enabled by tutorial-finished/tutorial-skipped events
        if (speed !== 'PAUSED' && typeof AchievementSystem !== 'undefined' && AchievementSystem.enableAchievements) {
            AchievementSystem.enableAchievements();
        }

        // enable merchant rank celebrations AFTER achievements (with delay to prevent overlap)
        if (speed !== 'PAUSED' && typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.enableRankCelebrations) {
            setTimeout(() => {
                MerchantRankSystem.enableRankCelebrations();
            }, 1500); // 1.5s delay so achievement popups clear first
        }

        // update UI
        this.updateTimeControlButtons();

        // Emit speed/pause events for quest tracking (tutorial Act 0 objectives need this)
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:speedChanged', { speed, isPaused: this.isPaused });
            if (this.isPaused) {
                EventBus.emit('game:paused', { speed: 'PAUSED' });
            } else {
                EventBus.emit('game:unpaused', { speed });
            }
        }

        // Also dispatch document events for backward compatibility with panel ui_action tracking
        document.dispatchEvent(new CustomEvent('game-speed-changed', {
            detail: { speed, isPaused: this.isPaused }
        }));
        if (this.isPaused) {
            document.dispatchEvent(new CustomEvent('game-paused', { detail: { speed: 'PAUSED' } }));
        } else {
            document.dispatchEvent(new CustomEvent('game-unpaused', { detail: { speed } }));
        }

        console.log(`⏰ TIME MACHINE setSpeed: ${speed} | isPaused: ${this.isPaused} | isRunning: ${this.isRunning} | animFrameId: ${this.animationFrameId}`);

        return true;
    },

    // toggle pause
    togglePause() {
        if (this.isPaused) {
            this.setSpeed('NORMAL');
        } else {
            this.setSpeed('PAUSED');
        }
        return this.isPaused;
    },

    // ═══════════════════════════════════════════════════════════════
    // interrupt handling - pause for events, restore user's preferred speed
    // ═══════════════════════════════════════════════════════════════

    /**
     * Pause for an interrupt (encounter, achievement, modal, etc.)
     * Saves current speed to stack so nested interrupts work properly
     * @param {string} source - What's causing the interrupt (for debugging)
     */
    pauseForInterrupt(source = 'unknown') {
        // Initialize interrupt stack if not exists (safety for early calls before init)
        if (!this._interruptStack) {
            this._interruptStack = [];
        }

        // save current speed to the interrupt stack (for nested interrupts)
        const speedToSave = this.isPaused ? 'PAUSED' : this.currentSpeed;
        this._interruptStack.push({
            speed: speedToSave,
            source: source,
            timestamp: Date.now()
        });

        // only pause if not already paused
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
        // Initialize interrupt stack if not exists (safety for early calls before init)
        if (!this._interruptStack) {
            this._interruptStack = [];
        }

        // pop from interrupt stack
        const savedState = this._interruptStack.pop();

        if (savedState) {
            // restore the speed that was active before THIS interrupt
            const speedToRestore = savedState.speed;
            console.log(`▶️ Resuming from interrupt: ${source} | Restoring speed: ${speedToRestore} | Stack depth: ${this._interruptStack.length}`);

            // only restore if we're still paused (another system might have already changed it)
            if (this.isPaused && speedToRestore !== 'PAUSED') {
                this.setSpeed(speedToRestore);
            }
        } else {
            // stack empty - use user's preferred speed as fallback
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

    // check for pending travel destination
    checkAndStartPendingTravel() {
        console.log('🚶 checkAndStartPendingTravel called');

        // don't start if already traveling
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            console.log('🚶 Already traveling, skipping');
            return;
        }

        // first try TravelPanelMap's onGameUnpaused (handles the full travel flow)
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.currentDestination && TravelPanelMap.onGameUnpaused) {
            console.log('🚶 Delegating to TravelPanelMap.onGameUnpaused');
            TravelPanelMap.onGameUnpaused();
            return; // TravelPanelMap handles everything, don't double-call
        }

        // fallback: check for pending destination in GameWorldRenderer only
        let destinationId = null;

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.currentDestination) {
            destinationId = GameWorldRenderer.currentDestination.id;
        }

        // start travel if destination exists and isn't current location
        if (destinationId && typeof TravelSystem !== 'undefined' && TravelSystem.startTravel) {
            if (typeof game !== 'undefined' && game.currentLocation?.id !== destinationId) {
                console.log(`🚶 Auto-starting travel to ${destinationId} (fallback)`);
                TravelSystem.startTravel(destinationId);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // time events - when time advances, stuff happens
    // ═══════════════════════════════════════════════════════════════

    onTimeAdvance() {
        // stat decay - hunger, thirst, stamina drain over time
        this.processStatDecay();

        // 💀 Fixed: midnight processing race condition at high speeds 💀
        // Old code required exact hour=0 AND minute=0 which could be MISSED at fast speeds
        // (time could jump from 23:55 to 0:05, skipping 0:00 entirely)
        // New code: just check if we're in a new day - lastProcessedDay prevents double-processing
        if (this.lastProcessedDay !== this.currentTime.day) {
            this.lastProcessedDay = this.currentTime.day;
            this.processDailyEvents();
        }

        // weekly wage processing
        if (this.currentTime.day % 7 === 0 && this.lastWageProcessedDay !== this.currentTime.day) {
            this.lastWageProcessedDay = this.currentTime.day;
            this.processWeeklyEvents();
        }

        // update market prices
        if (typeof DynamicMarketSystem !== 'undefined') {
            DynamicMarketSystem.updateMarketPrices();
            // check for 8am daily market refresh
            if (DynamicMarketSystem.checkDailyRefresh) {
                DynamicMarketSystem.checkDailyRefresh();
            }
        }

        // city events
        if (typeof CityEventSystem !== 'undefined') {
            CityEventSystem.updateEvents();
        }

        // dungeon bonanza (July 18th special event)
        if (typeof DungeonBonanzaSystem !== 'undefined') {
            DungeonBonanzaSystem.update();
        }

        // property systems
        if (typeof PropertySystem !== 'undefined') {
            if (PropertySystem.processWorkQueues) PropertySystem.processWorkQueues();
            if (PropertySystem.processConstruction) PropertySystem.processConstruction();
            if (PropertySystem.processRentPayments) PropertySystem.processRentPayments();
        }

        // price alerts
        if (typeof TradingSystem !== 'undefined' && TradingSystem.checkPriceAlerts) {
            TradingSystem.checkPriceAlerts();
        }

        // travel progress
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            TravelSystem.updateTravelProgress();
        }
    },

    // stat decay - DISABLED - game.js processPlayerStatsOverTime() handles this via GameConfig
    // removed duplicate stat decay that was stacking with game.js version
    // the actual decay rates are in config.js:
    //   - Hunger: 5 days (100→0), decayPerUpdate: 0.0694 every 5 game minutes
    //   - Thirst: 3 days (100→0), decayPerUpdate: 0.1157 every 5 game minutes
    // seasonal effects are now applied in game.js processPlayerStatsOverTime()
    lastStatDecayMinute: 0,
    STAT_DECAY_INTERVAL: 30, // legacy - kept for compatibility

    processStatDecay() {
        // 💀 ACTUALLY DISABLED NOW 💀
        // The comment above said this was disabled but it wasn't - causing DOUBLE stat decay!
        // game.js update() at line 1305 already calls game.processPlayerStatsOverTime()
        // TimeMachine calling it AGAIN via onTimeAdvance() was doubling hunger/thirst drain
        // This empty function is kept for compatibility - game.js handles stat decay now
        return;
    },

    // daily events at midnight
    processDailyEvents() {
        console.log(`📅 Processing daily events for Day ${this.currentTime.day}`);

        // property daily income
        if (typeof PropertySystem !== 'undefined' && PropertySystem.processDailyIncome) {
            PropertySystem.processDailyIncome();
        }

        // trade routes
        if (typeof TradeRouteSystem !== 'undefined' && TradeRouteSystem.processDailyTrade) {
            TradeRouteSystem.processDailyTrade();
        }

        // fire daily event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:dailyProcess', { day: this.currentTime.day });
        }
    },

    // weekly events
    processWeeklyEvents() {
        console.log(`📅 Processing weekly events`);

        // employee wages
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.processWeeklyWages) {
            EmployeeSystem.processWeeklyWages();
        }

        // fire weekly event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:weeklyProcess', { week: this.currentTime.week });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // time formatting - making time readable
    // ═══════════════════════════════════════════════════════════════

    // format time in 12-hour AM/PM
    formatTimeAMPM(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const minuteStr = minute.toString().padStart(2, '0');
        return `${hour12}:${minuteStr} ${period}`;
    },

    // full formatted time: "April 1, 1111 - 8:00 AM"
    getFormattedTime() {
        const timeStr = this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
        const monthName = this.getMonthName(this.currentTime.month);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year} - ${timeStr}`;
    },

    // short date: "Apr 1, 1111"
    getFormattedDate() {
        const monthName = this.getMonthName(this.currentTime.month, true);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year}`;
    },

    // just the clock: "8:00 AM"
    getFormattedClock() {
        return this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
    },

    // get all time info as object
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
    // time calculations - math is inevitable
    // ═══════════════════════════════════════════════════════════════

    // minutes until a specific hour
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

    // total minutes since game start
    getTotalMinutes() {
        const totalDays = this.getTotalDays();
        return (totalDays * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR) +
               (this.currentTime.hour * this.MINUTES_PER_HOUR) +
               this.currentTime.minute;
    },

    // total days since game start (uses GameConfig for start date)
    getTotalDays() {
        const currYear = this.currentTime.year;
        const currMonth = this.currentTime.month;
        const currDay = this.currentTime.day;

        // check cache first - avoid expensive loops on every call
        const cache = this._totalDaysCache;
        if (cache.year === currYear && cache.month === currMonth && cache.day === currDay) {
            return cache.result;
        }

        // get start date from GameConfig (single source of truth)
        const startDate = typeof GameConfig !== 'undefined'
            ? GameConfig.time.startingDate
            : { year: 1111, month: 4, day: 1 };

        const startYear = startDate.year;
        const startMonth = startDate.month;
        const startDay = startDate.day;

        // convert both dates to "days since epoch" then subtract
        // this is cleaner than the previous branching logic

        // days from epoch to start date
        let startDays = 0;
        for (let y = 1; y < startYear; y++) {
            startDays += this.isLeapYear(y) ? 366 : 365;
        }
        for (let m = 1; m < startMonth; m++) {
            startDays += this.getDaysInMonth(m, startYear);
        }
        startDays += startDay;

        // days from epoch to current date
        let currDays = 0;
        for (let y = 1; y < currYear; y++) {
            currDays += this.isLeapYear(y) ? 366 : 365;
        }
        for (let m = 1; m < currMonth; m++) {
            currDays += this.getDaysInMonth(m, currYear);
        }
        currDays += currDay;

        // simple subtraction - no edge cases to worry about
        const result = currDays - startDays;

        // update cache for next call
        this._totalDaysCache = { year: currYear, month: currMonth, day: currDay, result };

        return result;
    },

    // convenience getter for backward compatibility
    get currentDay() {
        return this.currentTime.day;
    },

    // ═══════════════════════════════════════════════════════════════
    // ui updates - making pixels dance
    // ═══════════════════════════════════════════════════════════════

    updateUI() {
        this.updateTimeDisplay();
        this.updateTimeControlButtons();
    },

    // initialize DOM cache - query once, not 60 times per second
    _initDomCache() {
        // check if cache exists AND elements are still in DOM
        // if any cached element was removed (panel reload), invalidate cache
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
            phaseTime: null, // set after timeIndicator found
            speedDisplay: document.getElementById('speed-indicator') ||
                         document.querySelector('.speed-indicator'),
            seasonDisplay: document.getElementById('season-indicator')
        };

        // cache the nested element too
        if (this._domCache.timeIndicator) {
            this._domCache.phaseTime = this._domCache.timeIndicator.querySelector('.phase-time');
        }

        return this._domCache;
    },

    // clear DOM cache (call if elements are dynamically recreated)
    clearDomCache() {
        this._domCache = null;
    },

    // update time display elements
    updateTimeDisplay() {
        const timeInfo = this.getTimeInfo();
        const cache = this._initDomCache();

        // use cached elements - no more 60fps DOM queries
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

        // top-bar time widget
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

        // guard against missing seasonData - the void protects
        if (cache.seasonDisplay && timeInfo.seasonData) {
            cache.seasonDisplay.textContent = `${timeInfo.seasonData.icon} ${timeInfo.seasonData.name}`;
        }
    },

    // Update time control UI states (pause button + speed dropdown)
    updateTimeControlButtons() {
        const speed = this.currentSpeed;
        const isPaused = speed === 'PAUSED';

        // Update pause button appearance
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            if (isPaused) {
                pauseBtn.classList.add('active');
                pauseBtn.textContent = '▶️'; // Show play icon when paused
                pauseBtn.title = 'Resume game time';
            } else {
                pauseBtn.classList.remove('active');
                pauseBtn.textContent = '⏸️'; // Show pause icon when running
                pauseBtn.title = 'Pause game time';
            }
        }

        // Update speed dropdown selection (only if not paused)
        const speedSelector = document.getElementById('speed-selector');
        if (speedSelector && !isPaused) {
            speedSelector.value = speed;
        }
    },

    // Setup time control handlers (pause button + speed dropdown)
    setupTimeControls() {
        console.log('Setting up time controls...');

        const self = this;

        // Pause button - toggles pause/resume
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (self.isPaused) {
                    // Resume at user's preferred speed
                    const speed = self.userPreferredSpeed || 'NORMAL';
                    console.log(`Resuming at ${speed} (${self.SPEED_LABELS[speed] || speed})`);
                    self.setSpeed(speed);
                } else {
                    console.log('Pausing game');
                    self.setSpeed('PAUSED');
                }
            };
            console.log('Pause button ready');
        }

        // Speed dropdown - changes speed multiplier
        const speedSelector = document.getElementById('speed-selector');
        if (speedSelector) {
            speedSelector.onchange = function(e) {
                const speed = e.target.value;
                console.log(`Speed selected: ${speed} (${self.SPEED_LABELS[speed] || speed})`);
                self.setUserPreferredSpeed(speed);
                // If game is running, apply the new speed immediately
                if (!self.isPaused) {
                    self.setSpeed(speed);
                }

                // FIX: Dispatch ui-action for quest system (Master of Time quest)
                // This fires when USER manually changes speed via dropdown
                document.dispatchEvent(new CustomEvent('ui-action', {
                    detail: { action: 'change_speed', speed: speed }
                }));
                console.log(`🎮 UI action dispatched: change_speed`);
            };
            // Set initial value from user preference
            speedSelector.value = self.userPreferredSpeed || 'NORMAL';
            console.log('Speed selector ready');
        }

        console.log('Time controls ready');
    },

    // ═══════════════════════════════════════════════════════════════
    // time skip - jump forward without killing the player
    // ═══════════════════════════════════════════════════════════════

    // skip forward by N months - preserves player stats (cheat mode)
    skipMonths(months, preserveStats = true) {
        console.log(`⏩ Skipping ${months} month(s)...`);

        // save current stats if preserving
        let savedStats = null;
        if (preserveStats && typeof game !== 'undefined' && game.player?.stats) {
            savedStats = { ...game.player.stats };
            console.log('💾 Stats preserved:', savedStats);
        }

        const oldSeason = this.getSeason();
        const startMonth = this.currentTime.month;
        const startYear = this.currentTime.year;

        // advance months
        for (let i = 0; i < months; i++) {
            this.advanceMonth();
        }

        // check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            console.log(`🍂 Season changed: ${oldSeason} → ${newSeason}`);
            this.onSeasonChange(oldSeason, newSeason);

            // update seasonal backdrop
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(newSeason);
            }
        }

        // generate new weather for the new time
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            WeatherSystem.generateWeather();
        }

        // restore stats if preserved
        if (savedStats && typeof game !== 'undefined' && game.player?.stats) {
            game.player.stats = savedStats;
            console.log('💾 Stats restored');
            if (typeof updatePlayerStats === 'function') {
                updatePlayerStats();
            }
        }

        // fire events for systems that need to update
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('time:skipped', {
                months,
                from: { month: startMonth, year: startYear },
                to: { month: this.currentTime.month, year: this.currentTime.year }
            });
        }

        // notify player
        if (typeof addMessage === 'function') {
            const seasonData = this.SEASONS[newSeason];
            addMessage(`⏩ Time has jumped forward ${months} month(s). It is now ${this.getFormattedDate()}. ${seasonData.icon} ${seasonData.name}`);
        }

        // update UI
        this.updateUI();

        console.log(`⏩ Time skip complete: ${this.getFormattedDate()}`);
        return this.getFormattedDate();
    },

    // skip forward by N days - preserves player stats (cheat mode)
    skipDays(days, preserveStats = true) {
        console.log(`⏩ Skipping ${days} day(s)...`);

        // save current stats if preserving
        let savedStats = null;
        if (preserveStats && typeof game !== 'undefined' && game.player?.stats) {
            savedStats = { ...game.player.stats };
        }

        const oldSeason = this.getSeason();

        // advance days
        for (let i = 0; i < days; i++) {
            this.advanceDay();
        }

        // check for season change
        const newSeason = this.getSeason();
        if (oldSeason !== newSeason) {
            this.onSeasonChange(oldSeason, newSeason);
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(newSeason);
            }
        }

        // generate new weather
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.generateWeather) {
            WeatherSystem.generateWeather();
        }

        // restore stats if preserved
        if (savedStats && typeof game !== 'undefined' && game.player?.stats) {
            game.player.stats = savedStats;
            if (typeof updatePlayerStats === 'function') {
                updatePlayerStats();
            }
        }

        // update UI
        this.updateUI();

        if (typeof addMessage === 'function') {
            addMessage(`⏩ ${days} day(s) have passed. It is now ${this.getFormattedDate()}.`);
        }

        return this.getFormattedDate();
    },

    // ═══════════════════════════════════════════════════════════════
    // save/load - preserving time across the void
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            currentTime: { ...this.currentTime },
            currentSpeed: this.currentSpeed,
            isPaused: this.isPaused,
            accumulatedTime: this.accumulatedTime,
            lastProcessedDay: this.lastProcessedDay,
            lastWageProcessedDay: this.lastWageProcessedDay,
            lastStatDecayMinute: this.lastStatDecayMinute // stat decay tracking
        };
    },

    loadSaveData(data) {
        if (!data) return;

        console.log(`⏰ TIME MACHINE loadSaveData called with currentTime:`, data.currentTime);

        // set flag to prevent init() from resetting this loaded time!
        this._timeLoadedFromSave = true;
        console.log(`⏰ TIME MACHINE: _timeLoadedFromSave flag SET to true`);

        if (data.currentTime) {
            this.currentTime = { ...data.currentTime };
            console.log(`⏰ TIME MACHINE: currentTime restored to ${JSON.stringify(this.currentTime)}`);

            // migrate old saves
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

        // restore seasonal backdrop after load
        const season = this.getSeason();
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.loadSeasonalBackdrop) {
            setTimeout(() => GameWorldRenderer.loadSeasonalBackdrop(season), 100);
        }

        console.log(`⏰ TIME MACHINE restored: ${this.getFormattedTime()} (${this.SEASONS[season].icon} ${season})`);
        console.log(`⏰ TIME MACHINE: loadSaveData complete. _timeLoadedFromSave=${this._timeLoadedFromSave}, isRunning=${this.isRunning}`);
    }
};

// ═══════════════════════════════════════════════════════════════
// backward compatibility - keep old names working
// ═══════════════════════════════════════════════════════════════

// TimeSystem alias (most code uses this name)
const TimeSystem = TimeMachine;

// GameEngine alias (some code uses this)
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
// expose globally - let the darkness spread
// ═══════════════════════════════════════════════════════════════

window.TimeMachine = TimeMachine;
window.TimeSystem = TimeSystem;
window.GameEngine = GameEngine;

console.log('⏰ TIME MACHINE v3.0 loaded - All of time, unified in darkness 🖤');
