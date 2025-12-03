// ═══════════════════════════════════════════════════════════════
// 🎲 RANDOM EVENT PANEL - when fate decides to mess with you
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - showing players what chaos befalls them
// uses the same panel pattern as People Panel for consistency
// ═══════════════════════════════════════════════════════════════

const RandomEventPanel = {
    // 🔧 CONFIG
    panelId: 'random-event-panel',
    isOpen: false,
    currentEvent: null,
    eventQueue: [], // 🦇 Queue events if multiple trigger at once

    // 🎭 EVENT ICONS - matching event types to visual flair
    eventIcons: {
        market_boom: '📈',
        market_crash: '📉',
        travel_complete: '🏁',
        lucky_find: '🍀',
        treasure_found: '💎',
        bandit_encounter: '⚔️',
        weather_change: '🌦️',
        festival: '🎉',
        plague: '☠️',
        blessing: '✨',
        curse: '💀',
        tax_collector: '👑',
        bad_weather: '🌧️',
        default: '🎲'
    },

    // 🎨 EVENT COLORS - visual mood setting
    eventColors: {
        market_boom: '#4ade80',      // green - good
        market_crash: '#f87171',     // red - bad
        lucky_find: '#a855f7',       // purple - rare
        treasure_found: '#fbbf24',   // gold - valuable
        bandit_encounter: '#ef4444', // red - danger
        festival: '#ec4899',         // pink - celebration
        plague: '#6b7280',           // gray - doom
        blessing: '#34d399',         // teal - divine
        curse: '#7c3aed',            // violet - dark
        tax_collector: '#f59e0b',    // orange - warning
        bad_weather: '#6b7280',      // gray - neutral bad
        default: '#94a3b8'           // slate - neutral
    },

    // 🚀 INITIALIZE
    init() {
        this.createPanelHTML();
        this.setupEventListeners();
        console.log('🎲 RandomEventPanel: Ready to deliver fate\'s whims... 🖤');
    },

    // 🏗️ CREATE PANEL HTML
    createPanelHTML() {
        if (document.getElementById(this.panelId)) {
            return;
        }

        const overlayContainer = document.getElementById('overlay-container');
        if (!overlayContainer) {
            console.warn('🎲 RandomEventPanel: overlay-container not found');
            return;
        }

        const panel = document.createElement('section');
        panel.id = this.panelId;
        panel.className = 'panel overlay-panel hidden';
        panel.innerHTML = `
            <button class="panel-close-x" data-close-overlay="${this.panelId}" title="Close">×</button>

            <!-- 🎲 Event Display -->
            <div class="event-display">
                <div class="panel-header event-header">
                    <span id="event-icon" class="event-icon-large">🎲</span>
                    <div class="event-header-text">
                        <h2 id="event-title">Random Event</h2>
                        <span id="event-subtitle" class="event-subtitle">Something is happening...</span>
                    </div>
                </div>

                <div class="panel-content event-content">
                    <!-- 📜 Event Description -->
                    <div class="event-description-box" id="event-description-box">
                        <p id="event-description">A mysterious event unfolds...</p>
                    </div>

                    <!-- 📊 Event Effects -->
                    <div class="event-effects" id="event-effects">
                        <!-- Populated dynamically -->
                    </div>

                    <!-- ⏱️ Event Duration -->
                    <div class="event-duration" id="event-duration">
                        <span class="duration-icon">⏱️</span>
                        <span id="event-duration-text">Duration: Unknown</span>
                    </div>

                    <!-- 🎯 Action Buttons -->
                    <div class="event-actions" id="event-actions">
                        <button class="event-btn primary" onclick="RandomEventPanel.acknowledgeEvent()">
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        `;

        overlayContainer.appendChild(panel);
        this.addStyles();
        console.log('🎲 RandomEventPanel: Panel created');
    },

    // 🎨 ADD STYLES
    addStyles() {
        if (document.getElementById('random-event-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'random-event-panel-styles';
        styles.textContent = `
            /* 🎲 Random Event Panel Styles */
            #random-event-panel {
                min-width: 380px;
                max-width: 450px;
                max-height: 70vh;
                display: flex;
                flex-direction: column;
                animation: eventPanelSlideIn 0.3s ease-out;
            }

            @keyframes eventPanelSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .event-display {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .event-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .event-icon-large {
                font-size: 3em;
                filter: drop-shadow(0 0 10px currentColor);
                animation: eventIconPulse 2s ease-in-out infinite;
            }

            @keyframes eventIconPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .event-header-text {
                flex: 1;
            }

            .event-header-text h2 {
                margin: 0 0 4px 0;
                font-size: 1.4em;
                color: #fff;
            }

            .event-subtitle {
                font-size: 0.9em;
                color: rgba(255,255,255,0.6);
                font-style: italic;
            }

            .event-content {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .event-description-box {
                background: rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px;
                padding: 16px;
            }

            .event-description-box p {
                margin: 0;
                font-size: 1.05em;
                line-height: 1.6;
                color: rgba(255,255,255,0.9);
            }

            .event-effects {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .effect-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 500;
            }

            .effect-tag.positive {
                background: rgba(74, 222, 128, 0.2);
                border: 1px solid rgba(74, 222, 128, 0.4);
                color: #4ade80;
            }

            .effect-tag.negative {
                background: rgba(248, 113, 113, 0.2);
                border: 1px solid rgba(248, 113, 113, 0.4);
                color: #f87171;
            }

            .effect-tag.neutral {
                background: rgba(148, 163, 184, 0.2);
                border: 1px solid rgba(148, 163, 184, 0.4);
                color: #94a3b8;
            }

            .effect-tag.special {
                background: rgba(168, 85, 247, 0.2);
                border: 1px solid rgba(168, 85, 247, 0.4);
                color: #a855f7;
            }

            .event-duration {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px;
                background: rgba(0,0,0,0.3);
                border-radius: 6px;
                font-size: 0.95em;
                color: rgba(255,255,255,0.7);
            }

            .duration-icon {
                font-size: 1.2em;
            }

            .event-actions {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 8px;
            }

            .event-btn {
                padding: 12px 28px;
                border: none;
                border-radius: 6px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .event-btn.primary {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: #1a1a1a;
            }

            .event-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
            }

            .event-btn.secondary {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: #fff;
            }

            .event-btn.secondary:hover {
                background: rgba(255,255,255,0.2);
            }

            /* 🖤 Panel border color based on event type */
            #random-event-panel.event-positive {
                border-color: rgba(74, 222, 128, 0.5);
                box-shadow: 0 0 30px rgba(74, 222, 128, 0.2);
            }

            #random-event-panel.event-negative {
                border-color: rgba(248, 113, 113, 0.5);
                box-shadow: 0 0 30px rgba(248, 113, 113, 0.2);
            }

            #random-event-panel.event-special {
                border-color: rgba(168, 85, 247, 0.5);
                box-shadow: 0 0 30px rgba(168, 85, 247, 0.2);
            }
        `;

        document.head.appendChild(styles);
    },

    // 🎧 EVENT LISTENERS
    setupEventListeners() {
        // 🖤 Close button
        document.addEventListener('click', (e) => {
            if (e.target.matches(`[data-close-overlay="${this.panelId}"]`)) {
                this.close();
            }
        });

        // 🦇 Listen for random events from EventSystem
        document.addEventListener('random-event-triggered', (e) => {
            if (e.detail && e.detail.event) {
                this.showEvent(e.detail.event);
            }
        });
    },

    // 🎲 SHOW EVENT - main display method
    showEvent(event) {
        if (!event) return;

        // 🦇 If panel is already showing an event, queue this one
        if (this.isOpen && this.currentEvent) {
            this.eventQueue.push(event);
            console.log('🎲 Event queued:', event.name);
            return;
        }

        this.currentEvent = event;
        this.updateDisplay(event);
        this.open();

        // 🎵 Play event sound if available
        this.playEventSound(event);
    },

    // 🎨 UPDATE DISPLAY
    updateDisplay(event) {
        const eventId = event.id || 'default';
        const icon = this.eventIcons[eventId] || this.eventIcons.default;
        const color = this.eventColors[eventId] || this.eventColors.default;

        // 🖤 Update icon
        const iconEl = document.getElementById('event-icon');
        if (iconEl) {
            iconEl.textContent = icon;
            iconEl.style.color = color;
        }

        // 🦇 Update title
        const titleEl = document.getElementById('event-title');
        if (titleEl) {
            titleEl.textContent = event.name || 'Mysterious Event';
            titleEl.style.color = color;
        }

        // 🗡️ Update subtitle based on event type
        const subtitleEl = document.getElementById('event-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = this.getEventSubtitle(event);
        }

        // ⚰️ Update description
        const descEl = document.getElementById('event-description');
        if (descEl) {
            descEl.textContent = event.description || 'Something strange is happening...';
        }

        // 📊 Update effects
        this.updateEffects(event);

        // ⏱️ Update duration
        this.updateDuration(event);

        // 🎨 Update panel styling
        this.updatePanelStyle(event);
    },

    // 📜 GET SUBTITLE
    getEventSubtitle(event) {
        const subtitles = {
            market_boom: 'The economy favors the bold!',
            market_crash: 'Dark times for merchants...',
            merchant_arrival: 'New opportunities await!',
            merchant_caravan: 'Exotic goods from distant lands!',
            weekly_market: 'The market comes alive!',
            lucky_find: 'Fortune smiles upon you!',
            treasure_found: 'Riches beyond measure!',
            bandit_encounter: 'Danger on the road!',
            festival: 'Joy fills the streets!',
            plague: 'Darkness spreads...',
            blessing: 'The gods favor you!',
            curse: 'A shadow falls upon you...'
        };
        return subtitles[event.id] || 'Fate has decided...';
    },

    // 📊 UPDATE EFFECTS DISPLAY
    updateEffects(event) {
        const effectsEl = document.getElementById('event-effects');
        if (!effectsEl) return;

        effectsEl.innerHTML = '';

        if (!event.effects || Object.keys(event.effects).length === 0) {
            effectsEl.innerHTML = '<span class="effect-tag neutral">No immediate effects</span>';
            return;
        }

        const effectDescriptions = {
            priceBonus: { text: (v) => `+${Math.round(v*100)}% Prices`, type: 'positive', icon: '📈' },
            pricePenalty: { text: (v) => `${Math.round(v*100)}% Prices`, type: 'negative', icon: '📉' },
            newItems: { text: () => 'New Items Available', type: 'special', icon: '✨' },
            rareItems: { text: () => 'Rare Items!', type: 'special', icon: '💎' },
            travelSpeedBonus: { text: (v) => `+${Math.round(v*100)}% Travel Speed`, type: 'positive', icon: '🏃' },
            travelSpeedPenalty: { text: (v) => `${Math.round(v*100)}% Travel Speed`, type: 'negative', icon: '🐌' },
            goldReward: { text: (v) => `+${v} Gold`, type: 'positive', icon: '💰' },
            goldLost: { text: (v) => `-${v} Gold`, type: 'negative', icon: '💸' },
            itemReward: { text: (v) => `Found: ${v}`, type: 'special', icon: '🎁' }
        };

        for (const [key, value] of Object.entries(event.effects)) {
            const desc = effectDescriptions[key];
            if (desc) {
                const tag = document.createElement('span');
                tag.className = `effect-tag ${desc.type}`;
                tag.innerHTML = `${desc.icon} ${desc.text(value)}`;
                effectsEl.appendChild(tag);
            }
        }
    },

    // ⏱️ UPDATE DURATION DISPLAY
    updateDuration(event) {
        const durationEl = document.getElementById('event-duration-text');
        if (!durationEl) return;

        if (!event.duration || event.duration === 0) {
            durationEl.textContent = 'Instant effect';
        } else {
            const hours = Math.floor(event.duration / 60);
            const minutes = event.duration % 60;
            if (hours > 0) {
                durationEl.textContent = `Duration: ${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
            } else {
                durationEl.textContent = `Duration: ${minutes} minutes`;
            }
        }
    },

    // 🎨 UPDATE PANEL STYLE
    updatePanelStyle(event) {
        const panel = document.getElementById(this.panelId);
        if (!panel) return;

        // Remove existing classes
        panel.classList.remove('event-positive', 'event-negative', 'event-special');

        // Determine event mood
        const effects = event.effects || {};
        if (effects.priceBonus || effects.travelSpeedBonus || effects.goldReward || effects.newItems) {
            panel.classList.add('event-positive');
        } else if (effects.pricePenalty || effects.travelSpeedPenalty || effects.goldLost) {
            panel.classList.add('event-negative');
        } else if (effects.rareItems || effects.itemReward) {
            panel.classList.add('event-special');
        }
    },

    // 🎵 PLAY EVENT SOUND
    playEventSound(event) {
        if (typeof AudioManager === 'undefined') return;

        const effects = event.effects || {};
        if (effects.goldReward || effects.priceBonus || effects.newItems) {
            AudioManager.playSFX?.('success');
        } else if (effects.goldLost || effects.pricePenalty) {
            AudioManager.playSFX?.('warning');
        } else {
            AudioManager.playSFX?.('notification');
        }
    },

    // ✅ ACKNOWLEDGE EVENT
    acknowledgeEvent() {
        this.close();

        // 🦇 Track for achievements
        if (typeof AchievementSystem !== 'undefined') {
            AchievementSystem.stats.eventsWitnessed = (AchievementSystem.stats.eventsWitnessed || 0) + 1;
        }
    },

    // 📂 OPEN PANEL
    open() {
        const panel = document.getElementById(this.panelId);
        if (!panel) return;

        panel.classList.remove('hidden');
        this.isOpen = true;

        // 🖤 Use panel manager if available
        if (typeof PanelManager !== 'undefined' && PanelManager.showOverlay) {
            PanelManager.showOverlay(this.panelId);
        }

        console.log('🎲 RandomEventPanel: Opened -', this.currentEvent?.name);
    },

    // 📕 CLOSE PANEL
    close() {
        const panel = document.getElementById(this.panelId);
        if (!panel) return;

        panel.classList.add('hidden');
        this.isOpen = false;
        this.currentEvent = null;

        // 🖤 Use panel manager if available
        if (typeof PanelManager !== 'undefined' && PanelManager.hideOverlay) {
            PanelManager.hideOverlay(this.panelId);
        }

        // 🦇 Check for queued events
        if (this.eventQueue.length > 0) {
            const nextEvent = this.eventQueue.shift();
            setTimeout(() => this.showEvent(nextEvent), 500);
        }

        console.log('🎲 RandomEventPanel: Closed');
    },

    // 🔄 TOGGLE PANEL
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 GLOBAL BINDING
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.RandomEventPanel = RandomEventPanel;
}

// 🚀 Auto-init when DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RandomEventPanel.init());
    } else {
        setTimeout(() => RandomEventPanel.init(), 100);
    }
}

console.log('🎲 RandomEventPanel loaded... fate awaits 🖤💀');
