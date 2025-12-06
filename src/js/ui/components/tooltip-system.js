// ═══════════════════════════════════════════════════════════════
// TOOLTIP SYSTEM - contextual help on hover
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('💬 Tooltip System loading... preparing to explain everything...');

const TooltipSystem = {
    // 🎨 Config - how we present our dark wisdom
    config: {
        showDelay: 400,        // ms before tooltip appears (anticipation builds)
        hideDelay: 100,        // ms before tooltip disappears
        maxWidth: 300,         // pixels - contain the rambling
        offset: { x: 10, y: 10 } // offset from cursor
    },

    // 🖤 Store MutationObserver reference for cleanup 💀
    _domObserver: null,

    // 🖤 Cache parsed tooltip data to avoid repeated JSON.parse 💀
    _tooltipCache: new WeakMap(),

    // 📚 All the tooltips for UI elements - organized chaos
    tooltips: {
        // ═══════════════════════════════════════════════════════════
        // 🎮 MAIN TOOLBAR BUTTONS
        // ═══════════════════════════════════════════════════════════
        '#location-btn': {
            title: '📍 Location Panel',
            desc: 'View your current location, available actions, and local businesses.',
            shortcut: 'L'
        },
        '#market-btn': {
            title: '🏪 Market Panel',
            desc: 'Buy and sell goods. Prices fluctuate based on supply, demand, and events.',
            shortcut: 'M'
        },
        '#inventory-btn': {
            title: '🎒 Inventory',
            desc: 'Manage your items, equipment, and cargo. Watch your weight limit!',
            shortcut: 'I'
        },
        '#map-btn': {
            title: '🗺️ World Map',
            desc: 'Plan routes, discover new locations, and track your journey across the realm.',
            shortcut: 'W'
        },
        '#achievements-btn': {
            title: '🏆 Achievements',
            desc: 'Track your accomplishments and unlock rewards for various feats.',
            shortcut: 'A'
        },

        // ═══════════════════════════════════════════════════════════
        // ⏱️ TIME CONTROLS
        // ═══════════════════════════════════════════════════════════
        '.pause-btn, #pause-btn': {
            title: '⏸️ Pause Time',
            desc: 'Stop time completely. Use this to plan your next move without pressure.',
            shortcut: 'Space'
        },
        '.normal-speed-btn, #normal-btn': {
            title: '▶️ Normal Speed',
            desc: 'Time passes at normal rate. Good for careful trading and exploration.',
            shortcut: '1'
        },
        '.fast-speed-btn, #fast-btn': {
            title: '⏩ Fast Speed',
            desc: 'Time passes quickly. Useful for traveling or waiting for events.',
            shortcut: '2'
        },
        '.fastest-speed-btn, #fastest-btn': {
            title: '⏭️ Fastest Speed',
            desc: 'Time flies! Be careful - you might miss important events or run out of supplies.',
            shortcut: '3'
        },

        // ═══════════════════════════════════════════════════════════
        // 📊 PLAYER STATS
        // ═══════════════════════════════════════════════════════════
        '#player-health, .stat-health': {
            title: '❤️ Health',
            desc: 'Your life force. Reaches 0 = game over. Rest, eat food, or use medicine to restore.'
        },
        '#player-hunger, .stat-hunger': {
            title: '🍖 Hunger',
            desc: 'Eat food to stay satisfied. Empty stomach damages health over time.'
        },
        '#player-thirst, .stat-thirst': {
            title: '💧 Thirst',
            desc: 'Stay hydrated! Dehydration is deadly. Drink water, ale, or other beverages.'
        },
        '#player-stamina, .stat-stamina': {
            title: '⚡ Stamina',
            desc: 'Energy for actions. Depletes during travel and work. Rest to recover.'
        },
        '#player-happiness, .stat-happiness': {
            title: '😊 Happiness',
            desc: 'Your mood affects trading prices and random events. Entertainment and success boost it.'
        },
        '#player-gold, .gold-display': {
            title: '💰 Gold',
            desc: 'Your wealth. Earn through trading, jobs, and investments. Spend wisely!'
        },

        // ═══════════════════════════════════════════════════════════
        // 🎒 INVENTORY PANEL
        // ═══════════════════════════════════════════════════════════
        '#sort-inventory-btn': {
            title: '🔀 Sort Inventory',
            desc: 'Organize items by name, value, weight, or category.'
        },
        '#filter-inventory-btn': {
            title: '🔍 Filter Items',
            desc: 'Show only specific item types: weapons, food, tools, etc.'
        },
        '#inventory-weight': {
            title: '⚖️ Carry Weight',
            desc: 'Current weight / max capacity. Exceeding limit slows travel and costs stamina.'
        },
        '#inventory-value': {
            title: '💎 Inventory Value',
            desc: 'Total estimated value of all your items at current market prices.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🏪 MARKET PANEL
        // ═══════════════════════════════════════════════════════════
        '.buy-btn': {
            title: '🛒 Buy Item',
            desc: 'Purchase this item. Price affected by your reputation and local supply.'
        },
        '.sell-btn': {
            title: '💵 Sell Item',
            desc: 'Sell this item. Better prices in locations with high demand.'
        },
        '.market-item-price': {
            title: '💰 Current Price',
            desc: 'Prices change based on supply/demand, events, and your reputation here.'
        },
        '#market-refresh-btn': {
            title: '🔄 Refresh Prices',
            desc: 'Check for updated market prices. Prices change over time and with events.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🗺️ MAP PANEL
        // ═══════════════════════════════════════════════════════════
        '.map-location': {
            title: '📍 Location',
            desc: 'Click to view details. Different locations offer unique goods and opportunities.'
        },
        '.travel-btn': {
            title: '🚶 Travel Here',
            desc: 'Start journey to this location. Travel consumes time, food, and stamina.'
        },
        '#map-zoom-in': {
            title: '🔍+ Zoom In',
            desc: 'Get a closer look at the map.',
            shortcut: '+'
        },
        '#map-zoom-out': {
            title: '🔍- Zoom Out',
            desc: 'See more of the world.',
            shortcut: '-'
        },
        '#map-center-player': {
            title: '🎯 Center on Player',
            desc: 'Snap the map view to your current location.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🏆 ACHIEVEMENTS PANEL
        // ═══════════════════════════════════════════════════════════
        '.achievement-item': {
            title: '🏆 Achievement',
            desc: 'Complete various challenges to unlock achievements and earn rewards.'
        },
        '.achievement-locked': {
            title: '🔒 Locked Achievement',
            desc: 'Keep playing to discover how to unlock this achievement.'
        },
        '.leaderboard-btn': {
            title: '🏆 Hall of Champions',
            desc: 'View the top players and their legendary stats.'
        },

        // ═══════════════════════════════════════════════════════════
        // 💼 SIDE PANEL BUTTONS
        // ═══════════════════════════════════════════════════════════
        '#ingame-settings-btn': {
            title: '⚙️ Settings',
            desc: 'Configure audio, visuals, controls, and save/load your game.',
            shortcut: ','
        },
        '#character-btn, .character-btn': {
            title: '👤 Character Sheet',
            desc: 'View your stats, attributes, perks, and personal info.',
            shortcut: 'C'
        },
        '#financial-btn': {
            title: '💰 Financial Report',
            desc: 'Track income, expenses, investments, and net worth over time.',
            shortcut: 'F'
        },
        '#property-btn': {
            title: '🏠 Properties',
            desc: 'Manage owned properties, upgrades, and rental income.',
            shortcut: 'P'
        },
        '#employee-btn': {
            title: '👥 Employees',
            desc: 'Hire, manage, and assign workers to your properties.',
            shortcut: 'E'
        },
        '#quest-btn': {
            title: '📜 Quests',
            desc: 'View active quests, objectives, and rewards.',
            shortcut: 'Q'
        },

        // ═══════════════════════════════════════════════════════════
        // 💾 SAVE/LOAD
        // ═══════════════════════════════════════════════════════════
        '#quick-save-btn': {
            title: '💾 Quick Save',
            desc: 'Instantly save your current progress.',
            shortcut: 'F5'
        },
        '#quick-load-btn': {
            title: '📂 Quick Load',
            desc: 'Load your last quick save.',
            shortcut: 'F9'
        },
        '.save-slot': {
            title: '💾 Save Slot',
            desc: 'Click to save/load. Shows character name, gold, location, and date.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🎮 CHARACTER CREATION
        // ═══════════════════════════════════════════════════════════
        '.difficulty-option': {
            title: '⚔️ Difficulty',
            desc: 'Affects starting gold, prices, and event difficulty. Choose your suffering level.'
        },
        '.perk-card': {
            title: '✨ Perk',
            desc: 'Choose perks to customize your character. Each provides unique bonuses and drawbacks.'
        },
        '.attribute-control': {
            title: '📊 Attribute',
            desc: 'Distribute points to customize strengths. Each attribute affects different gameplay aspects.'
        },

        // ═══════════════════════════════════════════════════════════
        // 📊 ATTRIBUTES (Character Creation & Sheet)
        // ═══════════════════════════════════════════════════════════
        '[data-attribute="strength"], #player-strength': {
            title: '💪 Strength',
            desc: 'Physical power. Affects carry capacity, melee combat, and manual labor efficiency.'
        },
        '[data-attribute="intelligence"], #player-intelligence': {
            title: '🧠 Intelligence',
            desc: 'Mental acuity. Affects trading prices, crafting, and learning new skills.'
        },
        '[data-attribute="charisma"], #player-charisma': {
            title: '💬 Charisma',
            desc: 'Social grace. Affects reputation gain, negotiation, and NPC interactions.'
        },
        '[data-attribute="endurance"], #player-endurance': {
            title: '🏃 Endurance',
            desc: 'Physical resilience. Affects max health, stamina, and resistance to harsh conditions.'
        },
        '[data-attribute="luck"], #player-luck': {
            title: '🍀 Luck',
            desc: 'Fortune favors you. Affects random events, loot quality, and gambling outcomes.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🏠 PROPERTY PANEL
        // ═══════════════════════════════════════════════════════════
        '.property-card': {
            title: '🏠 Property',
            desc: 'Owned property generating passive income. Upgrade to increase earnings.'
        },
        '.property-upgrade-btn': {
            title: '⬆️ Upgrade Property',
            desc: 'Improve this property to increase income and unlock new features.'
        },
        '.property-sell-btn': {
            title: '🏷️ Sell Property',
            desc: 'Sell this property. You\'ll receive a portion of its value.'
        },

        // ═══════════════════════════════════════════════════════════
        // 👥 EMPLOYEE PANEL
        // ═══════════════════════════════════════════════════════════
        '.employee-card': {
            title: '👤 Employee',
            desc: 'Worker assigned to your properties. Earns wages weekly.'
        },
        '.hire-employee-btn': {
            title: '➕ Hire Employee',
            desc: 'Recruit a new worker. Different types have different costs and abilities.'
        },
        '.fire-employee-btn': {
            title: '❌ Fire Employee',
            desc: 'Dismiss this worker. They will no longer receive wages.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🎯 MISCELLANEOUS
        // ═══════════════════════════════════════════════════════════
        '.overlay-close, .close-btn': {
            title: '✕ Close',
            desc: 'Close this panel.',
            shortcut: 'Esc'
        },
        '#message-log': {
            title: '📜 Message Log',
            desc: 'Game events and notifications. Scroll to see history.'
        },
        '.notification': {
            title: '🔔 Notification',
            desc: 'Important event or update. Click to dismiss.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🎮 BOTTOM ACTION BAR
        // ═══════════════════════════════════════════════════════════
        '#bottom-market-btn': {
            title: '🏪 Visit Market',
            desc: 'Open the local market to buy and sell goods.',
            shortcut: 'M'
        },
        '#bottom-travel-btn': {
            title: '🗺️ Travel Panel',
            desc: 'View destinations and plan your journey across the realm.',
            shortcut: 'T'
        },
        '#bottom-transport-btn': {
            title: '🚗 Transportation',
            desc: 'Manage your mounts and vehicles. Better transport = more cargo.',
            shortcut: 'W'
        },
        '#bottom-inventory-btn': {
            title: '🎒 Inventory',
            desc: 'View and manage your items, equipment, and cargo.',
            shortcut: 'I'
        },
        '#bottom-character-btn': {
            title: '👤 Character Sheet',
            desc: 'View your stats, attributes, perks, and personal info.',
            shortcut: 'C'
        },
        '#bottom-financial-btn': {
            title: '💰 Financial Report',
            desc: 'Track income, expenses, property earnings, and employee wages.',
            shortcut: 'F'
        },
        '#bottom-achievements-btn': {
            title: '🏆 Achievements',
            desc: 'View your accomplishments and see how you rank.',
            shortcut: 'H'
        },
        '#bottom-save-btn': {
            title: '💾 Save Game',
            desc: 'Save your progress to a slot.',
            shortcut: 'F5'
        },
        '#bottom-load-btn': {
            title: '📂 Load Game',
            desc: 'Load a previously saved game.',
            shortcut: 'F9'
        },

        // ═══════════════════════════════════════════════════════════
        // 📊 SIDE PANEL BUTTONS
        // ═══════════════════════════════════════════════════════════
        '#menu-btn': {
            title: '📋 Game Menu',
            desc: 'Access game options, save, load, and settings.'
        },
        '#character-sheet-btn': {
            title: '👤 Character Sheet',
            desc: 'View your attributes, vitals, perks, and equipment.',
            shortcut: 'C'
        },
        '#financial-sheet-btn': {
            title: '💰 Financial Report',
            desc: 'Track your gold, income from properties, and employee wages.',
            shortcut: 'F'
        },
        '#property-employee-btn': {
            title: '🏠 Properties & Employees',
            desc: 'Manage your owned properties and hired workers.',
            shortcut: 'P'
        },

        // ═══════════════════════════════════════════════════════════
        // 🕐 TIME CONTROLS (top bar)
        // ═══════════════════════════════════════════════════════════
        '#pause-btn': {
            title: '⏸️ Pause',
            desc: 'Stop time completely. Plan your next move without pressure.',
            shortcut: 'Space'
        },
        '#normal-speed-btn': {
            title: '▶️ Normal Speed',
            desc: 'Time passes at normal rate (1x speed).'
        },
        '#fast-speed-btn': {
            title: '⏩ Fast Forward',
            desc: 'Time passes quickly (5x speed). Good for traveling.'
        },
        '#very-fast-speed-btn': {
            title: '⏭️ Very Fast',
            desc: 'Time flies (10x speed). Careful - you might miss events!'
        },

        // ═══════════════════════════════════════════════════════════
        // 💎 VITAL BARS
        // ═══════════════════════════════════════════════════════════
        '#health-fill, .health-bar': {
            title: '❤️ Health',
            desc: 'Your life force. If it reaches 0, it\'s game over. Rest and eat to recover.'
        },
        '#hunger-fill, .hunger-bar': {
            title: '🍖 Hunger',
            desc: 'How full you are. Eat food to keep it up. Starvation damages health!'
        },
        '#thirst-fill, .thirst-bar': {
            title: '💧 Thirst',
            desc: 'Your hydration level. Drink to stay alive. Dehydration is deadly.'
        },
        '#energy-fill, .energy-bar': {
            title: '😴 Energy',
            desc: 'Your stamina. Rest at inns or sleep to recover. Affects travel speed.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🗺️ MAP CONTROLS
        // ═══════════════════════════════════════════════════════════
        '#zoom-in-btn, #overlay-zoom-in-btn': {
            title: '🔍+ Zoom In',
            desc: 'Get a closer view of the map.'
        },
        '#zoom-out-btn, #overlay-zoom-out-btn': {
            title: '🔍- Zoom Out',
            desc: 'See more of the world map.'
        },
        '#reset-view-btn, #overlay-reset-view-btn': {
            title: '⟲ Reset View',
            desc: 'Reset map zoom and position to default.'
        },
        '#fullscreen-btn': {
            title: '⛶ Fullscreen',
            desc: 'Toggle fullscreen mode for the map.'
        },
        '#center-on-player-btn, #overlay-center-player-btn': {
            title: '📍 Center on Player',
            desc: 'Move the map view to your current location.'
        },

        // ═══════════════════════════════════════════════════════════
        // 🏪 MARKET TABS
        // ═══════════════════════════════════════════════════════════
        '[data-tab="buy"]': {
            title: '🛒 Buy Tab',
            desc: 'Browse items available for purchase at this market.'
        },
        '[data-tab="sell"]': {
            title: '💵 Sell Tab',
            desc: 'Sell items from your inventory to the merchant.'
        },
        '[data-tab="compare"]': {
            title: '📊 Compare Prices',
            desc: 'Compare item prices across different locations.'
        },
        '[data-tab="history"]': {
            title: '📜 Trade History',
            desc: 'View your past trades at this location.'
        },
        '[data-tab="routes"]': {
            title: '🛤️ Trade Routes',
            desc: 'Plan and manage profitable trading routes.'
        },
        '[data-tab="alerts"]': {
            title: '🔔 Price Alerts',
            desc: 'Set alerts for when items reach target prices.'
        },
        '[data-tab="news"]': {
            title: '📰 Market News',
            desc: 'Read about events affecting market prices.'
        }
    },

    // 🌙 Active tooltip element
    tooltipElement: null,
    showTimeout: null,
    hideTimeout: null,
    currentTarget: null,

    // 🚀 Initialize the tooltip system
    init() {
        this.createTooltipElement();
        this.applyTooltips();
        this.setupGlobalListeners();
        console.log('💬 Tooltip System initialized - wisdom awaits your cursor');
    },

    // 🎨 Create the tooltip DOM element
    createTooltipElement() {
        // remove existing tooltip if any
        const existing = document.getElementById('game-tooltip');
        if (existing) existing.remove();

        this.tooltipElement = document.createElement('div');
        this.tooltipElement.id = 'game-tooltip';
        this.tooltipElement.className = 'game-tooltip';
        this.tooltipElement.innerHTML = `
            <div class="tooltip-title"></div>
            <div class="tooltip-desc"></div>
            <div class="tooltip-shortcut"></div>
        `;
        document.body.appendChild(this.tooltipElement);

        // inject styles
        this.injectStyles();
    },

    // 🎨 Inject tooltip styles
    injectStyles() {
        if (document.getElementById('tooltip-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'tooltip-system-styles';
        style.textContent = `
            .game-tooltip {
                position: fixed;
                z-index: 800; /* Z-INDEX STANDARD: Tooltips */
                background: linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(30, 30, 45, 0.98) 100%);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                padding: 10px 14px;
                max-width: ${this.config.maxWidth}px;
                pointer-events: none;
                opacity: 0;
                transform: translateY(5px);
                transition: opacity 0.2s ease, transform 0.2s ease;
                will-change: transform; /* 🖤 GPU acceleration for smoother tooltip animations 💀 */
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.1);
                font-family: inherit;
            }

            .game-tooltip.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .game-tooltip .tooltip-title {
                font-size: 14px;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 4px;
                text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
            }

            .game-tooltip .tooltip-desc {
                font-size: 12px;
                color: #ccc;
                line-height: 1.4;
            }

            .game-tooltip .tooltip-shortcut {
                font-size: 11px;
                color: #888;
                margin-top: 6px;
                padding-top: 6px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .game-tooltip .tooltip-shortcut:empty {
                display: none;
            }

            .game-tooltip .tooltip-shortcut kbd {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                padding: 1px 5px;
                font-family: monospace;
                font-size: 10px;
                color: #fff;
            }

            /* elements with tooltips get a subtle indicator */
            [data-tooltip] {
                position: relative;
            }

            /* mobile: disable tooltips (use tap instead) */
            @media (max-width: 768px) {
                .game-tooltip {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // 📝 Apply tooltips to all matching elements
    applyTooltips() {
        for (const [selector, data] of Object.entries(this.tooltips)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.hasAttribute('data-tooltip-applied')) {
                    el.setAttribute('data-tooltip-applied', 'true');
                    el.setAttribute('data-tooltip', JSON.stringify(data));
                }
            });
        }
    },

    // 👂 Setup global mouse listeners
    setupGlobalListeners() {
        // use event delegation for efficiency
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip], [data-tooltip-applied], [title]');
            if (target && target !== this.currentTarget) {
                this.scheduleShow(target, e);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip], [data-tooltip-applied], [title]');
            if (target) {
                this.scheduleHide();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.tooltipElement.classList.contains('visible')) {
                this.positionTooltip(e);
            }
        });

        // hide on scroll or click
        document.addEventListener('scroll', () => this.hideTooltip(), true);
        document.addEventListener('click', () => this.hideTooltip());

        // re-apply tooltips when DOM changes (for dynamically created elements)
        // 🖤 Store observer reference for cleanup 💀
        this._domObserver = new MutationObserver(() => {
            this.applyTooltips();
        });
        this._domObserver.observe(document.body, { childList: true, subtree: true });

        // 🖤 Cleanup on page unload to prevent memory leaks 💀
        window.addEventListener('beforeunload', () => this.destroy());
    },

    // 🖤 Cleanup method - disconnect observer and clear timers 💀
    destroy() {
        if (this._domObserver) {
            this._domObserver.disconnect();
            this._domObserver = null;
        }
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);
        this.hideTooltip();
    },

    // ⏰ Schedule tooltip to show
    scheduleShow(target, event) {
        this.scheduleHide(); // clear any pending hide
        clearTimeout(this.showTimeout);

        this.currentTarget = target;
        this.showTimeout = setTimeout(() => {
            this.showTooltip(target, event);
        }, this.config.showDelay);
    },

    // ⏰ Schedule tooltip to hide
    scheduleHide() {
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        this.hideTimeout = setTimeout(() => {
            this.hideTooltip();
        }, this.config.hideDelay);
    },

    // 👁️ Show the tooltip
    showTooltip(target, event) {
        let tooltipData = null;

        // 🖤 Check cache first to avoid repeated JSON.parse 💀
        if (this._tooltipCache.has(target)) {
            tooltipData = this._tooltipCache.get(target);
        }
        // try to get tooltip data from data attribute
        else if (target.hasAttribute('data-tooltip')) {
            try {
                tooltipData = JSON.parse(target.getAttribute('data-tooltip'));
                this._tooltipCache.set(target, tooltipData); // 🖤 Cache it 💀
            } catch (e) {
                // not JSON, use as plain text
                tooltipData = { desc: target.getAttribute('data-tooltip') };
                this._tooltipCache.set(target, tooltipData); // 🖤 Cache it 💀
            }
        }

        // fallback to title attribute
        if (!tooltipData && target.hasAttribute('title')) {
            tooltipData = {
                desc: target.getAttribute('title')
            };
            // temporarily remove title to prevent browser tooltip
            target.setAttribute('data-original-title', target.getAttribute('title'));
            target.removeAttribute('title');
        }

        if (!tooltipData) return;

        // populate tooltip content
        const titleEl = this.tooltipElement.querySelector('.tooltip-title');
        const descEl = this.tooltipElement.querySelector('.tooltip-desc');
        const shortcutEl = this.tooltipElement.querySelector('.tooltip-shortcut');

        titleEl.textContent = tooltipData.title || '';
        titleEl.style.display = tooltipData.title ? 'block' : 'none';

        descEl.textContent = tooltipData.desc || '';

        // 🖤 Sanitize shortcut to prevent XSS - the darkness protects us 💀
        if (tooltipData.shortcut) {
            const safeShortcut = typeof escapeHtml === 'function' ? escapeHtml(tooltipData.shortcut) : tooltipData.shortcut;
            shortcutEl.innerHTML = `Shortcut: <kbd>${safeShortcut}</kbd>`;
        } else {
            shortcutEl.innerHTML = '';
        }

        // position and show
        this.positionTooltip(event);
        this.tooltipElement.classList.add('visible');
    },

    // 🙈 Hide the tooltip
    hideTooltip() {
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        this.tooltipElement.classList.remove('visible');

        // restore original title if we removed it
        if (this.currentTarget && this.currentTarget.hasAttribute('data-original-title')) {
            this.currentTarget.setAttribute('title', this.currentTarget.getAttribute('data-original-title'));
            this.currentTarget.removeAttribute('data-original-title');
        }

        this.currentTarget = null;
    },

    // 📍 Position tooltip near cursor
    positionTooltip(event) {
        const tooltip = this.tooltipElement;
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = event.clientX + this.config.offset.x;
        let y = event.clientY + this.config.offset.y;

        // keep tooltip within viewport
        if (x + rect.width > viewportWidth - 10) {
            x = event.clientX - rect.width - this.config.offset.x;
        }

        if (y + rect.height > viewportHeight - 10) {
            y = event.clientY - rect.height - this.config.offset.y;
        }

        // ensure not off-screen
        x = Math.max(10, x);
        y = Math.max(10, y);

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    },

    // ➕ Add a tooltip to an element dynamically
    addTooltip(selector, data) {
        this.tooltips[selector] = data;
        this.applyTooltips();
    },

    // 🔄 Refresh all tooltips (call after major DOM changes)
    refresh() {
        this.applyTooltips();
    }
};

// 🌐 Expose globally
window.TooltipSystem = TooltipSystem;

// 🚀 Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => TooltipSystem.init(), 500);
    });
} else {
    setTimeout(() => TooltipSystem.init(), 500);
}

console.log('✅ Tooltip System loaded!');
