// ═══════════════════════════════════════════════════════════════
// TIME SYSTEM - the relentless march of existence
// ═══════════════════════════════════════════════════════════════
// Version: 0.89.9 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// gregorian calendar with leap years, proper month names, all the bullshit
// start date: april 1st, 1111 - a date as dark as the code
// if time breaks, blame the cosmic horror not me

const TimeSystem = {
    // 🕐 Constants - time being time, but now with REAL calendar math
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12,

    // 📅 Gregorian calendar - real month names and days
    MONTH_NAMES: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],

    // 🖤 Short month names for compact display
    MONTH_NAMES_SHORT: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],

    // 🗡️ Days per month (index 0 = January, etc.)
    // February handled dynamically for leap years
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    // ⚡ Speed settings - 2 game minutes = 1 real second at NORMAL
    SPEEDS: {
        PAUSED: 0,        // 💀 frozen like my heart
        NORMAL: 2,        // 🦇 2 game minutes per real second (1 hour = 30 real seconds)
        FAST: 10,         // 🗡️ 10 game minutes per real second (1 hour = 6 real seconds)
        VERY_FAST: 30     // ⚰️ 30 game minutes per real second (1 hour = 2 real seconds)
    },

    // 🌙 The actual time variables - starting April 1st, 1111
    currentTime: {
        day: 1,
        hour: 8,
        minute: 0,
        year: 1111,
        month: 4,        // 🖤 April (1-indexed, 1=Jan, 4=Apr)
        week: 1
    },

    // 🔮 Control variables (because we're control freaks but like, in a time way)
    // 🖤 Initial state must match - if PAUSED then isPaused=true, otherwise false 💀
    currentSpeed: 'PAUSED',   // 🦇 Starts paused so player can read intro
    isPaused: true,           // 🦇 Must match currentSpeed - both indicate paused state
    lastUpdateTime: 0,
    accumulatedTime: 0,

    // ═══════════════════════════════════════════════════════════════
    // 💀 INITIALIZATION - Where time begins its dark journey
    // ═══════════════════════════════════════════════════════════════

    init() {
        // 🖤 Game starts April 1st, 1111 at 8:00 AM
        this.currentTime = {
            day: 1,
            hour: 8,
            minute: 0,
            year: 1111,
            month: 4,    // April
            week: 1
        };
        // 🖤 Game starts PAUSED so player can read the intro
        this.currentSpeed = 'PAUSED';
        this.isPaused = true;
        this.lastUpdateTime = Date.now();
        this.accumulatedTime = 0;
        console.log('⏸️ TimeSystem awakens PAUSED - April 1st, 1111... let the dark ages begin');
    },

    // ═══════════════════════════════════════════════════════════════
    // 📅 GREGORIAN CALENDAR HELPERS - Because leap years are cruel
    // ═══════════════════════════════════════════════════════════════

    // 🦇 Check if a year is a leap year (Gregorian rules)
    isLeapYear(year) {
        // 💀 Divisible by 4, except centuries unless divisible by 400
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    // 🗡️ Get days in a specific month (accounting for leap years)
    getDaysInMonth(month, year) {
        // month is 1-indexed (1=Jan, 2=Feb, etc.)
        if (month === 2 && this.isLeapYear(year)) {
            return 29; // ⚰️ February in a leap year - extra day of suffering
        }
        return this.DAYS_IN_MONTH[month - 1];
    },

    // 🌙 Get month name from 1-indexed month number
    getMonthName(month, short = false) {
        const names = short ? this.MONTH_NAMES_SHORT : this.MONTH_NAMES;
        return names[month - 1] || 'Unknown';
    },

    // 🔮 Get current season based on month (Northern Hemisphere medieval)
    getSeason() {
        const month = this.currentTime.month;
        if (month >= 3 && month <= 5) return 'spring';   // Mar-May
        if (month >= 6 && month <= 8) return 'summer';   // Jun-Aug
        if (month >= 9 && month <= 11) return 'autumn';  // Sep-Nov
        return 'winter';                                  // Dec-Feb
    },

    // ═══════════════════════════════════════════════════════════════
    // 🦇 UPDATE LOOP - Making time move like the existential dread it is
    // ═══════════════════════════════════════════════════════════════

    update(deltaTime) {
        if (this.isPaused || this.currentSpeed === 'PAUSED') {
            return false;  // 💀 time stands still (wouldn't that be nice?)
        }

        const speedMultiplier = this.SPEEDS[this.currentSpeed];
        if (speedMultiplier === 0) return false;

        // 🌙 Converting real time to game time (basically time travel but boring)
        const gameMinutesPassed = (deltaTime / 1000) * speedMultiplier;
        this.accumulatedTime += gameMinutesPassed;

        // ⚰️ Only process whole minutes cause we're not THAT precise
        const minutesToProcess = Math.floor(this.accumulatedTime);
        if (minutesToProcess > 0) {
            this.accumulatedTime -= minutesToProcess;
            this.addMinutes(minutesToProcess);
            return true;  // 🗡️ time marches on, as it does
        }

        return false;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📅 TIME PROGRESSION - The cascade of time's cruel progression
    // ═══════════════════════════════════════════════════════════════

    addMinutes(minutes) {
        this.currentTime.minute += minutes;

        // 🖤 When minutes overflow into hours (just like my emotions)
        while (this.currentTime.minute >= this.MINUTES_PER_HOUR) {
            this.currentTime.minute -= this.MINUTES_PER_HOUR;
            this.currentTime.hour++;

            // 🦇 Hours overflow into days... the cycle continues
            if (this.currentTime.hour >= this.HOURS_PER_DAY) {
                this.currentTime.hour -= this.HOURS_PER_DAY;
                this.advanceDay();
            }
        }
    },

    // 💀 Advance to the next day (Gregorian calendar aware)
    advanceDay() {
        this.currentTime.day++;

        // 🖤 Calculate week number within the month
        this.currentTime.week = Math.ceil(this.currentTime.day / this.DAYS_PER_WEEK);

        // 🗡️ Check if we've exceeded days in current month
        const daysInMonth = this.getDaysInMonth(this.currentTime.month, this.currentTime.year);

        if (this.currentTime.day > daysInMonth) {
            this.currentTime.day = 1;
            this.currentTime.week = 1;
            this.advanceMonth();
        }
    },

    // ⚰️ Advance to the next month
    advanceMonth() {
        this.currentTime.month++;

        // 🌙 Months become years and suddenly we're all older
        if (this.currentTime.month > this.MONTHS_PER_YEAR) {
            this.currentTime.month = 1;
            this.currentTime.year++;
            console.log(`🎆 Happy New Year ${this.currentTime.year}! Another year in the darkness...`);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚡ SPEED CONTROL - Controlling how fast we spiral through time
    // ═══════════════════════════════════════════════════════════════

    setSpeed(speed) {
        if (this.SPEEDS.hasOwnProperty(speed)) {
            const wasAtDestinationReady = this.isPaused && speed !== 'PAUSED';
            this.currentSpeed = speed;
            this.isPaused = (speed === 'PAUSED');

            // AUTO-TRAVEL: when unpausing with a destination set, begin the journey
            // because clicking play should actually DO something when you've got somewhere to go
            // this was driving me insane so i fixed it at 3am
            if (wasAtDestinationReady && !this.isPaused) {
                this.checkAndStartPendingTravel();
            }

            return true;
        }
        return false;
    },

    // 🎯 Check for pending destination and start travel if player isn't already traveling
    checkAndStartPendingTravel() {
        // 💀 Don't start travel if already traveling - that would be... problematic
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            return;
        }

        // notify TravelPanelMap that game is unpaused - it handles auto-start travel
            // delegation > duplication, trust me on this one
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.onGameUnpaused) {
            TravelPanelMap.onGameUnpaused();
            return; // TravelPanelMap handles everything
        }

        // 🔮 Fallback: Check GameWorldRenderer for pending destination
        let destinationId = null;

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.currentDestination) {
            destinationId = GameWorldRenderer.currentDestination.id;
        } else if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.currentDestination) {
            destinationId = TravelPanelMap.currentDestination.id;
        }

        // 🗡️ Got somewhere to go? let's roll
        if (destinationId && typeof TravelSystem !== 'undefined' && TravelSystem.startTravel) {
            // 🦇 Make sure it's not our current location (that would be silly)
            if (typeof game !== 'undefined' && game.currentLocation?.id !== destinationId) {
                console.log(`🚶 Auto-starting travel to ${destinationId} - time waits for no one`);
                TravelSystem.startTravel(destinationId);
            }
        }
    },

    // ⏸️ togglePause - freezing time like a dramatic movie scene
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.currentSpeed = 'PAUSED';
        } else {
            this.currentSpeed = 'NORMAL';
        }
        return this.isPaused;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🕰️ TIME FORMATTING & INFO - Making time pretty for the UI
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Convert 24-hour to 12-hour AM/PM format
    formatTimeAMPM(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
        const minuteStr = minute.toString().padStart(2, '0');
        return `${hour12}:${minuteStr} ${period}`;
    },

    // 🖤 Get formatted time string: "April 1, 1111 - 8:00 AM"
    getFormattedTime() {
        const timeStr = this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
        const monthName = this.getMonthName(this.currentTime.month);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year} - ${timeStr}`;
    },

    // 🦇 Get short formatted date: "Apr 1, 1111"
    getFormattedDate() {
        const monthName = this.getMonthName(this.currentTime.month, true);
        return `${monthName} ${this.currentTime.day}, ${this.currentTime.year}`;
    },

    // 💀 Get just the time in AM/PM format: "8:00 AM"
    getFormattedClock() {
        return this.formatTimeAMPM(this.currentTime.hour, this.currentTime.minute);
    },

    // 📊 getTimeInfo - all the time data your dark heart desires
    getTimeInfo() {
        return {
            ...this.currentTime,
            monthName: this.getMonthName(this.currentTime.month),
            monthNameShort: this.getMonthName(this.currentTime.month, true),
            season: this.getSeason(),
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
            isNight: this.currentTime.hour >= 22 || this.currentTime.hour < 6  // 🖤 best time tbh
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧮 TIME CALCULATIONS - Because math is inevitable
    // ═══════════════════════════════════════════════════════════════

    // ⏳ getMinutesUntilHour - how long until the clock strikes doom
    getMinutesUntilHour(targetHour) {
        let minutes = 0;
        let currentHour = this.currentTime.hour;
        let currentMinute = this.currentTime.minute;

        if (targetHour > currentHour) {
            minutes = (targetHour - currentHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else if (targetHour < currentHour) {
            minutes = ((this.HOURS_PER_DAY - currentHour) + targetHour) * this.MINUTES_PER_HOUR - currentMinute;
        } else {
            minutes = currentMinute === 0 ? 0 : this.HOURS_PER_DAY * this.MINUTES_PER_HOUR - currentMinute;
        }

        return minutes;
    },

    // 🧮 getTotalMinutes - converting all of existence into one big number
    // 💀 Uses proper Gregorian calendar calculation from start date
    getTotalMinutes() {
        // 🖤 Calculate days since game start (April 1, 1111)
        const totalDays = this.getTotalDays();
        return (totalDays * this.HOURS_PER_DAY * this.MINUTES_PER_HOUR) +
               (this.currentTime.hour * this.MINUTES_PER_HOUR) +
               this.currentTime.minute;
    },

    // 🖤 getTotalDays - how many sunsets have we witnessed in this dark world 💀
    // Uses GameConfig for start date (single source of truth)
    getTotalDays() {
        // 🦇 Get start date from GameConfig
        const startDate = typeof GameConfig !== 'undefined'
            ? GameConfig.time.startingDate
            : { year: 1111, month: 4, day: 1 };

        const startYear = startDate.year;
        const startMonth = startDate.month;
        const startDay = startDate.day;

        const currYear = this.currentTime.year;
        const currMonth = this.currentTime.month;
        const currDay = this.currentTime.day;

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
        return currDays - startDays;
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 SAVE/LOAD - Preserving time across the void
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            currentTime: { ...this.currentTime },
            currentSpeed: this.currentSpeed,
            isPaused: this.isPaused,
            accumulatedTime: this.accumulatedTime
        };
    },

    loadSaveData(data) {
        if (!data) return;

        if (data.currentTime) {
            this.currentTime = { ...data.currentTime };
            // 🖤 Migrate old saves that don't have proper year
            if (this.currentTime.year < 1111) {
                this.currentTime.year = 1111;
            }
            // 🦇 Ensure month is valid (1-12)
            if (this.currentTime.month < 1 || this.currentTime.month > 12) {
                this.currentTime.month = 4; // Default to April
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

        console.log(`🖤 TimeSystem restored: ${this.getFormattedTime()}`);
    },

    // 🔄 Convenience getter for backward compatibility
    get currentDay() {
        return this.currentTime.day;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY - Let the darkness spread
// ═══════════════════════════════════════════════════════════════

window.TimeSystem = TimeSystem;

console.log('🖤 TimeSystem v2.0 loaded - Gregorian calendar, April 1st 1111... time bends to our will');
