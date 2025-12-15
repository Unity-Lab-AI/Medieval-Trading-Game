// ═══════════════════════════════════════════════════════════════
// TIMER MANAGER - time waits for no one (but we track it anyway)
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// centralized timer management - because memory leaks are scarier than ghosts
// tick tock goes the existential clock - we document every scheduled doom
//
// CRITICAL: ALL TIMERS IN THIS CODEBASE MUST USE TimerManager!
//
// DO NOT USE:                      USE INSTEAD:
// setTimeout(fn, delay)    →       TimerManager.setTimeout(fn, delay)
// setInterval(fn, delay)   →       TimerManager.setInterval(fn, delay)
// clearTimeout(id)         →       TimerManager.clearTimeout(key)
// clearInterval(id)        →       TimerManager.clearTimeout(key)
//
// WHY: Raw setTimeout/setInterval cause memory leaks when not tracked.
// TimerManager tracks all timers and cleans them up on page unload,
// preventing zombie timers from haunting the garbage collector.
//
// EXAMPLE USAGE:
//   const timerKey = TimerManager.setTimeout(() => doThing(), 1000);
//   // Later, to cancel:
//   TimerManager.clearTimeout(timerKey);
//
// For intervals:
//   const intervalKey = TimerManager.setInterval(() => pollThing(), 5000);
//   // Later, to stop:
//   TimerManager.clearTimeout(intervalKey);  // Works for both types
//
// ═══════════════════════════════════════════════════════════════

const TimerManager = {
    // store all active timers - time bombs of scheduled chaos ticking in the shadows
    timers: new Map(),

    // set a timeout with tracking - schedule the inevitable
    // because untracked timers are how memory leaks happen and i'm tired of hunting them
    setTimeout(callback, delay, ...args) {
        const timerId = setTimeout(callback, delay, ...args);
        const key = `timer_${Date.now()}_${Math.random()}`;
        
        this.timers.set(key, {
            id: timerId,
            type: 'timeout',
            callback,
            delay,
            active: true,
            createdAt: Date.now()
        });
        
        return key; // hand back the key so you can kill this timer later
    },

    // set an interval with tracking - endless repetition, captured
    setInterval(callback, interval, ...args) {
        const intervalId = setInterval(callback, interval, ...args);
        const key = `interval_${Date.now()}_${Math.random()}`;
        
        this.timers.set(key, {
            id: intervalId,
            type: 'interval',
            callback,
            interval,
            active: true,
            createdAt: Date.now()
        });
        
        return key; // the key to break the infinite loop when you're done
    },

    // kill a timer by its key - cancel the scheduled doom
    clearTimeout(key) {
        if (!this.timers.has(key)) {
            console.warn(`⚠️ TimerManager: No timer found for key ${key}`);
            return false;
        }
        
        const timer = this.timers.get(key);
        
        if (timer.type === 'timeout') {
            clearTimeout(timer.id);
        } else {
            clearInterval(timer.id);
        }
        
        this.timers.delete(key);
        return true;
    },
    
    // clear all timers - silence every ticking clock, total void
    // the heat death of the timer universe
    clearAllTimers() {
        const count = this.timers.size;
        
        this.timers.forEach((timer) => {
            if (timer.type === 'timeout') {
                clearTimeout(timer.id);
            } else {
                clearInterval(timer.id);
            }
        });
        
        this.timers.clear();
        return count;
    },
    
    // cancel every timeout - no more scheduled chaos
    clearTimeouts() {
        const keysToClear = [];
        
        this.timers.forEach((timer, key) => {
            if (timer.type === 'timeout') {
                clearTimeout(timer.id);
                keysToClear.push(key);
            }
        });
        
        keysToClear.forEach(key => this.timers.delete(key));
        return keysToClear.length;
    },
    
    // stop all intervals - silence the endless loops
    clearIntervals() {
        const keysToClear = [];
        
        this.timers.forEach((timer, key) => {
            if (timer.type === 'interval') {
                clearInterval(timer.id);
                keysToClear.push(key);
            }
        });
        
        keysToClear.forEach(key => this.timers.delete(key));
        return keysToClear.length;
    },
    
    // get active timers count - how many time bombs are still ticking
    getActiveTimersCount() {
        return this.timers.size;
    },
    
    // get timers for deboogering - peer into the scheduled chaos
    getTimers() {
        return Array.from(this.timers.entries()).map(([key, timer]) => ({
            key,
            type: timer.type,
            active: timer.active,
            delay: timer.delay || timer.interval,
            age: Date.now() - timer.createdAt
        }));
    },
    
    // check if this timer's still breathing
    isTimerActive(key) {
        return this.timers.has(key) && this.timers.get(key).active;
    },
    
    // mute the timer but keep it alive - suspended animation
    deactivateTimer(key) {
        if (this.timers.has(key)) {
            const timer = this.timers.get(key);
            timer.active = false;
            return true;
        }
        return false;
    },
    
    // wake a sleeping timer back up
    reactivateTimer(key) {
        if (this.timers.has(key)) {
            const timer = this.timers.get(key);
            timer.active = true;
            return true;
        }
        return false;
    },
    
    // prepare for death - clean up when the page dies
    init() {
        // murder every timer before the browser closes
        window.addEventListener('beforeunload', () => {
            this.clearAllTimers();
        });

        console.log('🖤 TimerManager initialized - tracking all ticking time bombs');
    }
};

// wake the timer manager - start watching all the ticking bombs
if (typeof document !== 'undefined') {
    TimerManager.init();
}