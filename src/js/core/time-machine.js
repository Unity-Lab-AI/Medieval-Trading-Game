// ═══════════════════════════════════════════════════════════════
// ⏰ THE TIME MACHINE - All of existence, unified in one dark engine
// ═══════════════════════════════════════════════════════════════
// File Version: 0.81
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════
// 🖤 This is THE source of all time in the game
// 🦇 No more scattered time logic - everything flows through here
// 💀 Gregorian calendar, seasons, game loop, UI updates - ALL OF IT
// ═══════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════
    // 🖤 INITIALIZATION - The beginning of time itself
    // ═══════════════════════════════════════════════════════════════

    init() {
        console.log('⏰ TIME MACHINE initializing...');

        // 🖤 Set initial time state
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

        // 🔄 Continue the loop
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

        // 🌦️ Force seasonal transition weather - dramatic effect for new season
        // 🖤 This weather lasts all day to accompany the backdrop crossfade
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.setWeather) {
            const transitionWeather = this.SEASONAL_TRANSITION_WEATHER[newSeason];
            if (transitionWeather) {
                console.log(`🌦️ Seasonal transition: forcing ${transitionWeather} weather for ${newSeason}`);
                WeatherSystem.setWeather(transitionWeather);
                // 🦇 Lock weather for ~1 in-game day (1440 minutes) to match backdrop fade
                WeatherSystem.lockWeatherUntil = this.getTotalMinutes() + 1440;
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

        // 🚶 Start engine if unpausing
        if (speed !== 'PAUSED' && !this.isRunning) {
            this.start();
        }

        // 🗺️ Auto-travel: start pending travel when unpausing
        if (wasAtDestinationReady && !this.isPaused) {
            this.checkAndStartPendingTravel();
        }

        // 🎨 Update UI
        this.updateTimeControlButtons();

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

    // 🍖 STAT DECAY - Process hunger, thirst, stamina drain
    // 🦇 Called every time tick - drains stats based on seasonal effects
    lastStatDecayMinute: 0,
    STAT_DECAY_INTERVAL: 30, // 🖤 Decay every 30 game minutes

    processStatDecay() {
        // 💀 Only decay every STAT_DECAY_INTERVAL minutes
        const totalMinutes = this.getTotalMinutes();
        if (totalMinutes - this.lastStatDecayMinute < this.STAT_DECAY_INTERVAL) {
            return;
        }
        this.lastStatDecayMinute = totalMinutes;

        // 🦇 Get player stats
        if (typeof game === 'undefined' || !game.player || !game.player.stats) {
            return;
        }

        const stats = game.player.stats;
        const season = this.getSeasonData();

        // 🍖 Hunger decay - affected by season
        const hungerDrain = 1 * (season.effects.hungerDrain || 1.0);
        stats.hunger = Math.max(0, stats.hunger - hungerDrain);

        // 💧 Thirst decay - affected by season
        const thirstDrain = 1.2 * (season.effects.thirstDrain || 1.0);
        stats.thirst = Math.max(0, stats.thirst - thirstDrain);

        // ⚡ Stamina recovery when resting, drain when active
        const isTraveling = typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling;
        if (isTraveling) {
            // 🚶 Traveling drains stamina
            const staminaDrain = 2 * (season.effects.staminaDrain || 1.0);
            stats.stamina = Math.max(0, stats.stamina - staminaDrain);
        } else {
            // 🛋️ Resting slowly recovers stamina
            stats.stamina = Math.min(stats.maxStamina, stats.stamina + 0.5);
        }

        // 💀 Low stats cause health damage
        if (stats.hunger <= 0 || stats.thirst <= 0) {
            const damage = (stats.hunger <= 0 ? 1 : 0) + (stats.thirst <= 0 ? 1.5 : 0);
            stats.health = Math.max(0, stats.health - damage);

            // ⚰️ Warning messages
            if (stats.hunger <= 0 && Math.random() < 0.1) {
                if (typeof addMessage === 'function') {
                    addMessage('💀 You are starving! Find food immediately!', 'danger');
                }
            }
            if (stats.thirst <= 0 && Math.random() < 0.1) {
                if (typeof addMessage === 'function') {
                    addMessage('💀 You are dying of thirst! Find water immediately!', 'danger');
                }
            }
        }

        // 😊 Happiness affected by other stats
        if (stats.hunger < 30 || stats.thirst < 30 || stats.stamina < 20) {
            stats.happiness = Math.max(0, stats.happiness - 0.5);
        }

        // 🎨 Update UI
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }
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

    // 🖤 Total days since April 1, 1111
    getTotalDays() {
        let totalDays = 0;
        const startYear = 1111;
        const startMonth = 4;
        const startDay = 1;

        // Count days from years
        for (let y = startYear; y < this.currentTime.year; y++) {
            totalDays += this.isLeapYear(y) ? 366 : 365;
        }

        // Subtract days from Jan 1 to start date
        for (let m = 1; m < startMonth; m++) {
            totalDays -= this.getDaysInMonth(m, startYear);
        }
        totalDays -= (startDay - 1);

        // Add days from Jan 1 to current date
        for (let m = 1; m < this.currentTime.month; m++) {
            totalDays += this.getDaysInMonth(m, this.currentTime.year);
        }
        totalDays += this.currentTime.day;

        // Handle same-year case
        if (this.currentTime.year === startYear) {
            totalDays = 0;
            for (let m = startMonth; m < this.currentTime.month; m++) {
                totalDays += this.getDaysInMonth(m, this.currentTime.year);
            }
            totalDays += (this.currentTime.day - startDay);
        }

        return totalDays;
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

    // 🕰️ Update time display elements
    updateTimeDisplay() {
        const timeInfo = this.getTimeInfo();

        // Main time display
        const timeDisplay = document.getElementById('game-time') ||
                           document.getElementById('time-display') ||
                           document.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = timeInfo.formatted;
        }

        // Day display
        const dayDisplay = document.getElementById('current-day');
        if (dayDisplay) {
            dayDisplay.textContent = `Day ${timeInfo.day}`;
        }

        // Year display
        const yearDisplay = document.getElementById('current-year');
        if (yearDisplay) {
            yearDisplay.textContent = `Year ${timeInfo.year}`;
        }

        // Top-bar date
        const dateText = document.getElementById('date-text');
        if (dateText) {
            dateText.textContent = `${timeInfo.monthName} ${timeInfo.day}, ${timeInfo.year}`;
        }

        // 🖤 Top-bar time widget - update in real-time
        const timeIndicator = document.getElementById('time-phase-indicator');
        if (timeIndicator) {
            const timeEl = timeIndicator.querySelector('.phase-time');
            if (timeEl) {
                // Format as AM/PM
                const hour = timeInfo.hour;
                const minute = timeInfo.minute || 0;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                const displayMinute = minute.toString().padStart(2, '0');
                timeEl.textContent = `${displayHour}:${displayMinute} ${ampm}`;
            }
        }

        // Speed indicator
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

        // Season indicator (if exists)
        const seasonDisplay = document.getElementById('season-indicator');
        if (seasonDisplay) {
            seasonDisplay.textContent = `${timeInfo.seasonData.icon} ${timeInfo.seasonData.name}`;
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

        if (data.currentTime) {
            this.currentTime = { ...data.currentTime };

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
