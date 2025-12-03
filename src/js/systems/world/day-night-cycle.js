// ═══════════════════════════════════════════════════════════════
// DAY/NIGHT CYCLE - time's cruel march continues
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const DayNightCycle = {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    currentPhase: 'day',
    transitionProgress: 0,
    _updateIntervalId: null, // 🖤 Store interval ID for cleanup 💀

    // Time phases (24-hour format)
    phases: {
        dawn: {
            id: 'dawn',
            name: 'Dawn',
            icon: '🌅',
            startHour: 5,
            endHour: 7,
            description: 'The sun rises, a new day begins.',
            ambientColor: 'rgba(255, 180, 100, 0.15)',
            overlayGradient: 'linear-gradient(to bottom, rgba(255, 150, 80, 0.2), rgba(100, 150, 200, 0.1))',
            brightness: 0.7,
            effects: {
                shopModifier: 0.8, // Shops opening
                dangerLevel: 0.5,
                encounterChance: 0.6,
                npcActivity: 0.5
            }
        },
        morning: {
            id: 'morning',
            name: 'Morning',
            icon: '🌤️',
            startHour: 7,
            endHour: 12,
            description: 'The market bustles with activity.',
            ambientColor: 'rgba(255, 255, 200, 0.1)',
            overlayGradient: 'linear-gradient(to bottom, rgba(200, 220, 255, 0.05), transparent)',
            brightness: 1.0,
            effects: {
                shopModifier: 1.0,
                dangerLevel: 0.3,
                encounterChance: 0.8,
                npcActivity: 1.0
            }
        },
        afternoon: {
            id: 'afternoon',
            name: 'Afternoon',
            icon: '☀️',
            startHour: 12,
            endHour: 17,
            description: 'The sun beats down on weary travelers.',
            ambientColor: 'rgba(255, 240, 180, 0.1)',
            overlayGradient: 'linear-gradient(to bottom, rgba(255, 250, 200, 0.1), rgba(255, 200, 150, 0.05))',
            brightness: 1.0,
            effects: {
                shopModifier: 1.0,
                dangerLevel: 0.4,
                encounterChance: 1.0,
                npcActivity: 0.9
            }
        },
        evening: {
            id: 'evening',
            name: 'Evening',
            icon: '🌆',
            startHour: 17,
            endHour: 20,
            description: 'Shadows lengthen as the day fades.',
            ambientColor: 'rgba(255, 150, 100, 0.2)',
            overlayGradient: 'linear-gradient(to bottom, rgba(255, 120, 50, 0.15), rgba(100, 50, 100, 0.1))',
            brightness: 0.75,
            effects: {
                shopModifier: 0.9,
                dangerLevel: 0.6,
                encounterChance: 0.9,
                npcActivity: 0.7
            }
        },
        dusk: {
            id: 'dusk',
            name: 'Dusk',
            icon: '🌇',
            startHour: 20,
            endHour: 21,
            description: 'The last light fades from the sky.',
            ambientColor: 'rgba(150, 100, 150, 0.25)',
            overlayGradient: 'linear-gradient(to bottom, rgba(100, 50, 100, 0.2), rgba(30, 30, 60, 0.2))',
            brightness: 0.5,
            effects: {
                shopModifier: 0.7,
                dangerLevel: 0.8,
                encounterChance: 1.1,
                npcActivity: 0.4
            }
        },
        night: {
            id: 'night',
            name: 'Night',
            icon: '🌙',
            startHour: 21,
            endHour: 5,
            description: 'Darkness blankets the land. The dangerous prowl.',
            ambientColor: 'rgba(20, 30, 60, 0.4)',
            overlayGradient: 'linear-gradient(to bottom, rgba(10, 10, 30, 0.4), rgba(20, 20, 50, 0.3))',
            brightness: 0.3,
            effects: {
                shopModifier: 0.3, // Most shops closed
                dangerLevel: 1.5,
                encounterChance: 1.3,
                npcActivity: 0.2
            },
            stars: true
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('🌅 DayNightCycle: The sun rises on a new adventure...');

        this.injectStyles();
        this.createOverlay();
        this.setupTimeListener();

        // Set initial phase based on current time
        this.updatePhase();

        console.log('🌅 DayNightCycle: Ready!');
    },

    setupTimeListener() {
        // Update every game minute
        if (typeof EventBus !== 'undefined') {
            EventBus.on('time-minute-passed', () => this.updatePhase());
            EventBus.on('time-hour-passed', () => this.onHourChanged());
        }

        // Also use interval as backup
        // 🖤 Store interval ID for proper cleanup 💀
        if (typeof TimerManager !== 'undefined') {
            this._updateIntervalId = TimerManager.setInterval(() => {
                if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
                    this.updatePhase();
                }
            }, 10000); // Every 10 seconds real-time
        }
    },

    // 🖤 Cleanup method for proper resource management 💀
    cleanup() {
        if (this._updateIntervalId && typeof TimerManager !== 'undefined') {
            TimerManager.clearInterval(this._updateIntervalId);
            this._updateIntervalId = null;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PHASE LOGIC
    // ═══════════════════════════════════════════════════════════════
    getCurrentHour() {
        if (typeof TimeSystem === 'undefined') return 12;
        return TimeSystem.currentTime?.hour || 12;
    },

    getPhaseForHour(hour) {
        for (const [phaseId, phase] of Object.entries(this.phases)) {
            if (phase.startHour <= phase.endHour) {
                // Normal range (e.g., 7-12)
                if (hour >= phase.startHour && hour < phase.endHour) {
                    return phaseId;
                }
            } else {
                // Wrapping range (e.g., 21-5 for night)
                if (hour >= phase.startHour || hour < phase.endHour) {
                    return phaseId;
                }
            }
        }
        return 'day';
    },

    updatePhase() {
        const hour = this.getCurrentHour();
        const minute = typeof TimeSystem !== 'undefined' ? (TimeSystem.currentTime?.minute || 0) : 0;
        const newPhase = this.getPhaseForHour(hour);

        // Calculate transition progress within current phase
        const phase = this.phases[newPhase];
        if (phase) {
            let phaseHours;
            if (phase.startHour <= phase.endHour) {
                phaseHours = phase.endHour - phase.startHour;
                this.transitionProgress = ((hour - phase.startHour) * 60 + minute) / (phaseHours * 60);
            } else {
                // Night wraps around midnight
                phaseHours = (24 - phase.startHour) + phase.endHour;
                const hoursIntoPhase = hour >= phase.startHour ?
                    hour - phase.startHour :
                    (24 - phase.startHour) + hour;
                this.transitionProgress = (hoursIntoPhase * 60 + minute) / (phaseHours * 60);
            }
        }

        // Check if phase changed
        if (newPhase !== this.currentPhase) {
            const oldPhase = this.currentPhase;
            this.currentPhase = newPhase;
            this.onPhaseChanged(oldPhase, newPhase);
        }

        this.updateVisuals();
    },

    onPhaseChanged(oldPhase, newPhase) {
        const phase = this.phases[newPhase];
        if (!phase) return;

        // Announce phase change
        if (typeof addMessage === 'function') {
            addMessage(`${phase.icon} ${phase.name}: ${phase.description}`, 'info');
        }

        // Fire event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('day-phase-changed', {
                oldPhase,
                newPhase,
                effects: phase.effects
            });
        }

        // Special night warnings
        if (newPhase === 'night') {
            if (typeof addMessage === 'function') {
                addMessage('⚠️ Traveling at night is dangerous! Bandits and worse prowl the roads.', 'warning');
            }
        }
    },

    onHourChanged() {
        const hour = this.getCurrentHour();

        // Special hour announcements
        if (hour === 6) {
            if (typeof addMessage === 'function') {
                addMessage('🛒 Shops are opening for the day.', 'info');
            }
        } else if (hour === 20) {
            if (typeof addMessage === 'function') {
                addMessage('🏪 Most shops are closing for the night.', 'info');
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EFFECTS API
    // ═══════════════════════════════════════════════════════════════
    getPhaseEffects() {
        const phase = this.phases[this.currentPhase];
        return phase?.effects || this.phases.morning.effects;
    },

    getDangerModifier() {
        return this.getPhaseEffects().dangerLevel;
    },

    getShopModifier() {
        return this.getPhaseEffects().shopModifier;
    },

    getEncounterModifier() {
        return this.getPhaseEffects().encounterChance;
    },

    getNPCActivityLevel() {
        return this.getPhaseEffects().npcActivity;
    },

    getBrightness() {
        const phase = this.phases[this.currentPhase];
        return phase?.brightness || 1.0;
    },

    isNight() {
        return this.currentPhase === 'night' || this.currentPhase === 'dusk';
    },

    isDaytime() {
        return ['morning', 'afternoon'].includes(this.currentPhase);
    },

    getCurrentPhaseInfo() {
        const phase = this.phases[this.currentPhase];
        return {
            id: this.currentPhase,
            name: phase?.name || 'Day',
            icon: phase?.icon || '☀️',
            description: phase?.description || '',
            brightness: this.getBrightness(),
            effects: this.getPhaseEffects()
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // VISUAL EFFECTS
    // ═══════════════════════════════════════════════════════════════
    createOverlay() {
        if (document.getElementById('daynight-overlay')) return;

        // 🖤 Day/night overlay goes in map-container, NOT body - so it doesn't cover panels! 💀
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.warn('🌅 DayNightCycle: map-container not found, delaying overlay creation');
            setTimeout(() => this.createOverlay(), 500);
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'daynight-overlay';
        overlay.className = 'daynight-overlay';
        mapContainer.appendChild(overlay);

        // 🖤 Stars container is SEPARATE and goes on body but BEHIND everything 💀
        // Stars/moon should only be visible in the outer margins, not over the game world
        const stars = document.createElement('div');
        stars.id = 'stars-container';
        stars.className = 'stars-container';
        document.body.insertBefore(stars, document.body.firstChild); // 🖤 Very back of body

        // Time phase indicator is now created in top-bar by WeatherSystem
    },

    updateVisuals() {
        const phase = this.phases[this.currentPhase];
        if (!phase) return;

        const overlay = document.getElementById('daynight-overlay');
        const stars = document.getElementById('stars-container');
        const indicator = document.getElementById('time-phase-indicator');

        if (overlay) {
            overlay.style.background = phase.overlayGradient;
            overlay.style.opacity = 1 - (phase.brightness * 0.3);
        }

        if (stars) {
            if (phase.stars) {
                this.showStars();
                stars.style.opacity = '1';
            } else {
                stars.style.opacity = '0';
            }
        }

        // Update time phase indicator in top-bar
        if (indicator) {
            const hour = this.getCurrentHour();
            const minute = typeof TimeSystem !== 'undefined' ? (TimeSystem.currentTime?.minute || 0) : 0;

            // Use AM/PM format
            const timeStr = typeof TimeSystem !== 'undefined' && TimeSystem.formatTimeAMPM
                ? TimeSystem.formatTimeAMPM(hour, minute)
                : this.formatTimeAMPM(hour, minute);

            const iconEl = indicator.querySelector('.phase-icon');
            const timeEl = indicator.querySelector('.phase-time');
            if (iconEl) iconEl.textContent = phase.icon;
            if (timeEl) timeEl.textContent = timeStr;
        }

        // Apply brightness to game container if it exists
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.filter = `brightness(${0.7 + phase.brightness * 0.3})`;
        }
    },

    // Fallback AM/PM formatter if TimeSystem not available
    formatTimeAMPM(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const minuteStr = minute.toString().padStart(2, '0');
        return `${hour12}:${minuteStr} ${period}`;
    },

    showStars() {
        const container = document.getElementById('stars-container');
        if (!container || container.children.length > 0) return;

        // Create random stars
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 60}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.fontSize = `${8 + Math.random() * 8}px`;
            star.textContent = Math.random() > 0.7 ? '✨' : '⭐';
            container.appendChild(star);
        }

        // Add moon
        const moon = document.createElement('div');
        moon.className = 'moon';
        moon.textContent = '🌙';
        moon.style.left = '80%';
        moon.style.top = '10%';
        container.appendChild(moon);
    },

    injectStyles() {
        if (document.getElementById('daynight-styles')) return;

        const style = document.createElement('style');
        style.id = 'daynight-styles';
        style.textContent = `
            /* 🖤 Day/night overlay - INSIDE map-container only, affects game world lighting 💀 */
            .daynight-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: var(--z-day-night-overlay, 3) !important; /* 🖤 PERMANENT FIX: Day/night at layer 3, BELOW map UI (10+) 💀 */
                transition: background 5s ease, opacity 5s ease;
                border-radius: inherit;
            }

            /* 🖤 Stars container - FIXED to body at z-index 0 (very back) 💀
               Stars appear in the margins around the game world, NOT over it */
            .stars-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
                pointer-events: none;
                z-index: 0 !important; /* 🦇 Behind EVERYTHING - only visible in body margins */
                transition: opacity 3s ease;
            }

            .star {
                position: absolute;
                animation: twinkle 3s ease-in-out infinite;
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            .moon {
                position: absolute;
                font-size: 48px;
                filter: drop-shadow(0 0 20px rgba(255, 255, 200, 0.5));
                animation: moon-glow 4s ease-in-out infinite;
            }
            @keyframes moon-glow {
                0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 255, 200, 0.5)); }
                50% { filter: drop-shadow(0 0 30px rgba(255, 255, 200, 0.8)); }
            }
            /* Time phase indicator styled in top-bar via styles.css */
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════
    getState() {
        return {
            currentPhase: this.currentPhase,
            transitionProgress: this.transitionProgress
        };
    },

    loadState(state) {
        if (state) {
            this.currentPhase = state.currentPhase || 'morning';
            this.transitionProgress = state.transitionProgress || 0;
            this.updateVisuals();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBOOGER 🦇
    // ═══════════════════════════════════════════════════════════════
    setPhase(phaseId) {
        if (this.phases[phaseId]) {
            this.currentPhase = phaseId;
            this.updateVisuals();
            return true;
        }
        return false;
    },

    listPhases() {
        return Object.keys(this.phases);
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.DayNightCycle = DayNightCycle;

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => DayNightCycle.init(), 1200));
} else {
    setTimeout(() => DayNightCycle.init(), 1200);
}

console.log('🌅 DayNightCycle loaded');
