// ═══════════════════════════════════════════════════════════════
// PANEL UPDATE MANAGER - smart DOM update orchestration
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// Problem: 7/9 panels do FULL DOM rebuild on any change.
//          Equipment equip triggers 3 rebuilds (equipment + inventory + player-info).
// Solution: Dirty flags + targeted updates + batching at 60fps.
// ═══════════════════════════════════════════════════════════════

const PanelUpdateManager = {
    initialized: false,

    // dirty flags per panel - what needs updating
    dirtyFlags: {
        inventory: {
            items: false,      // item list changed
            gold: false,       // gold display changed
            weight: false,     // weight display changed
            equipped: false    // equipped badges need refresh
        },
        equipment: {
            slots: false,      // equipment slots changed
            stats: false       // stat bonuses changed
        },
        playerInfo: {
            stats: false,      // health/hunger/thirst/stamina
            gold: false,       // gold display
            level: false       // level/xp display
        },
        party: {
            members: false,    // companion list changed
            stats: false       // companion stats changed
        },
        market: {
            prices: false,     // price list changed
            stock: false       // merchant stock changed
        },
        quests: {
            list: false,       // quest list changed
            tracker: false     // tracker needs refresh
        }
    },

    // pending update queue - batched changes
    pendingUpdates: new Set(),

    // frame request ID for batching
    frameRequestId: null,

    // throttle timers per panel
    throttleTimers: {},

    // throttle configs (ms) - how often each panel type can update
    throttleConfig: {
        inventory: 50,    // fast - player interaction
        equipment: 50,    // fast - player interaction
        playerInfo: 100,  // medium - stats update
        party: 200,       // slow - less critical
        market: 100,      // medium - prices
        quests: 300       // slow - quest changes rare
    },

    // listeners for cleanup
    _eventListeners: [],

    init() {
        if (this.initialized) return;

        console.log('📊 PanelUpdateManager: Initializing...');

        // hook into EventBus for inventory/equipment changes
        this._setupEventListeners();

        this.initialized = true;
        console.log('📊 PanelUpdateManager: Ready - dirty flag system active');
    },

    _setupEventListeners() {
        if (typeof EventBus === 'undefined') {
            console.warn('📊 PanelUpdateManager: EventBus not available, falling back to polling');
            return;
        }

        // inventory item changes - mark inventory dirty
        EventBus.on('inventory:item:added', (data) => {
            this.markDirty('inventory', 'items');
            this.markDirty('inventory', 'weight');
            this.markDirty('playerInfo', 'gold'); // might affect encumbrance
        });

        EventBus.on('inventory:item:removed', (data) => {
            this.markDirty('inventory', 'items');
            this.markDirty('inventory', 'weight');
        });

        // equipment changes
        EventBus.on('player:equipment:changed', (data) => {
            this.markDirty('equipment', 'slots');
            this.markDirty('equipment', 'stats');
            this.markDirty('inventory', 'equipped'); // update equipped badges
            this.markDirty('playerInfo', 'stats');   // armor affects displayed stats
        });

        // gold changes
        EventBus.on('player:gold:changed', (data) => {
            this.markDirty('inventory', 'gold');
            this.markDirty('playerInfo', 'gold');
        });

        // stat changes
        EventBus.on('player:stats:changed', (data) => {
            this.markDirty('playerInfo', 'stats');
        });

        // quest changes
        EventBus.on('quest:started', () => this.markDirty('quests', 'list'));
        EventBus.on('quest:completed', () => this.markDirty('quests', 'list'));
        EventBus.on('quest:progress', () => this.markDirty('quests', 'tracker'));

        // companion changes
        EventBus.on('companion:added', () => this.markDirty('party', 'members'));
        EventBus.on('companion:removed', () => this.markDirty('party', 'members'));

        console.log('📊 PanelUpdateManager: EventBus listeners attached');
    },

    // mark a specific property of a panel as dirty
    markDirty(panelName, property) {
        if (!this.dirtyFlags[panelName]) {
            console.warn(`📊 PanelUpdateManager: Unknown panel '${panelName}'`);
            return;
        }

        if (property && this.dirtyFlags[panelName][property] !== undefined) {
            this.dirtyFlags[panelName][property] = true;
        }

        // add to pending updates
        this.pendingUpdates.add(panelName);

        // schedule batch update
        this._scheduleBatchUpdate();
    },

    // mark entire panel as dirty (full rebuild needed)
    markPanelDirty(panelName) {
        if (!this.dirtyFlags[panelName]) return;

        // mark all properties dirty
        for (const prop in this.dirtyFlags[panelName]) {
            this.dirtyFlags[panelName][prop] = true;
        }

        this.pendingUpdates.add(panelName);
        this._scheduleBatchUpdate();
    },

    // check if any property of a panel is dirty
    isDirty(panelName, property = null) {
        if (!this.dirtyFlags[panelName]) return false;

        if (property) {
            return this.dirtyFlags[panelName][property] === true;
        }

        // check if any property is dirty
        return Object.values(this.dirtyFlags[panelName]).some(v => v === true);
    },

    // clear dirty flags for a panel
    clearDirty(panelName, property = null) {
        if (!this.dirtyFlags[panelName]) return;

        if (property) {
            this.dirtyFlags[panelName][property] = false;
        } else {
            // clear all
            for (const prop in this.dirtyFlags[panelName]) {
                this.dirtyFlags[panelName][prop] = false;
            }
        }
    },

    // schedule a batch update on next animation frame
    _scheduleBatchUpdate() {
        if (this.frameRequestId) return; // already scheduled

        this.frameRequestId = requestAnimationFrame(() => {
            this._processBatchUpdate();
            this.frameRequestId = null;
        });
    },

    // process all pending updates
    _processBatchUpdate() {
        const panelsToUpdate = [...this.pendingUpdates];
        this.pendingUpdates.clear();

        for (const panelName of panelsToUpdate) {
            // check throttle
            if (this._isThrottled(panelName)) {
                // re-add to pending, will process next frame
                this.pendingUpdates.add(panelName);
                continue;
            }

            this._updatePanel(panelName);
            this._setThrottle(panelName);
        }

        // if there are still pending updates, schedule another batch
        if (this.pendingUpdates.size > 0) {
            this._scheduleBatchUpdate();
        }
    },

    _isThrottled(panelName) {
        return this.throttleTimers[panelName] === true;
    },

    _setThrottle(panelName) {
        const delay = this.throttleConfig[panelName] || 100;
        this.throttleTimers[panelName] = true;

        setTimeout(() => {
            this.throttleTimers[panelName] = false;
        }, delay);
    },

    // update a specific panel based on dirty flags
    _updatePanel(panelName) {
        const flags = this.dirtyFlags[panelName];
        if (!flags) return;

        switch (panelName) {
            case 'inventory':
                this._updateInventoryPanel(flags);
                break;
            case 'equipment':
                this._updateEquipmentPanel(flags);
                break;
            case 'playerInfo':
                this._updatePlayerInfoPanel(flags);
                break;
            case 'party':
                this._updatePartyPanel(flags);
                break;
            case 'market':
                this._updateMarketPanel(flags);
                break;
            case 'quests':
                this._updateQuestsPanel(flags);
                break;
        }

        // clear flags after update
        this.clearDirty(panelName);
    },

    // TARGETED UPDATE: Inventory panel
    _updateInventoryPanel(flags) {
        // only update what's dirty
        if (flags.gold) {
            this._updateInventoryGold();
        }

        if (flags.weight) {
            this._updateInventoryWeight();
        }

        if (flags.equipped) {
            this._updateEquippedBadges();
        }

        if (flags.items) {
            // full item list rebuild - expensive but necessary when items change
            if (typeof InventorySystem !== 'undefined' && InventorySystem.updateInventoryDisplay) {
                InventorySystem.updateInventoryDisplay();
            }
        }
    },

    _updateInventoryGold() {
        const goldDisplay = document.getElementById('inventory-gold');
        if (!goldDisplay) return;

        const playerGold = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.gold.get()
            : (game?.player?.gold || 0);

        goldDisplay.textContent = `💰 ${playerGold.toLocaleString()} gold`;

        // color based on wealth
        if (playerGold >= 10000) {
            goldDisplay.style.color = '#ffd700';
        } else if (playerGold >= 1000) {
            goldDisplay.style.color = '#4fc3f7';
        } else if (playerGold >= 100) {
            goldDisplay.style.color = '#ecf0f1';
        } else {
            goldDisplay.style.color = '#e74c3c';
        }
    },

    _updateInventoryWeight() {
        const weightDisplay = document.getElementById('inventory-weight');
        if (!weightDisplay) return;

        // calculate current weight
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game?.player?.inventory || {});

        let totalWeight = 0;
        if (typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(inventory)) {
                if (quantity > 0) {
                    totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
                }
            }
        }

        const maxWeight = typeof InventorySystem !== 'undefined'
            ? InventorySystem.maxWeight
            : 100;

        weightDisplay.textContent = `Weight: ${totalWeight.toFixed(1)}/${maxWeight} lbs`;
    },

    _updateEquippedBadges() {
        // update equipped badges without full rebuild
        const items = document.querySelectorAll('.inventory-item');
        const equipment = game?.player?.equipment || {};

        items.forEach(item => {
            const equipBtn = item.querySelector('[data-action="equip-item"]');
            if (!equipBtn) return;

            const itemId = equipBtn.dataset.itemId;
            const isEquipped = Object.values(equipment).includes(itemId);

            const nameEl = item.querySelector('.item-name');
            if (nameEl) {
                const badge = nameEl.querySelector('.equipped-badge');
                if (isEquipped && !badge) {
                    nameEl.innerHTML = nameEl.innerHTML + ' <span class="equipped-badge">✓</span>';
                } else if (!isEquipped && badge) {
                    badge.remove();
                }
            }
        });
    },

    // TARGETED UPDATE: Equipment panel
    _updateEquipmentPanel(flags) {
        if (flags.slots || flags.stats) {
            // equipment panel needs full update for now
            if (typeof EquipmentSystem !== 'undefined' && EquipmentSystem.updateDisplay) {
                EquipmentSystem.updateDisplay();
            }
        }
    },

    // TARGETED UPDATE: Player info (side panel)
    _updatePlayerInfoPanel(flags) {
        if (flags.stats) {
            this._updatePlayerStats();
        }

        if (flags.gold) {
            this._updatePlayerGold();
        }

        if (flags.level) {
            this._updatePlayerLevel();
        }
    },

    _updatePlayerStats() {
        // update stat bars in side panel
        const stats = ['health', 'hunger', 'thirst', 'stamina'];

        for (const stat of stats) {
            const bar = document.getElementById(`${stat}-bar`);
            const value = document.getElementById(`${stat}-value`);

            if (bar && value) {
                const current = game?.player?.stats?.[stat] || 0;
                const max = game?.player?.stats?.[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || 100;
                const percent = Math.min(100, Math.max(0, (current / max) * 100));

                bar.style.width = `${percent}%`;
                value.textContent = `${Math.floor(current)}/${max}`;
            }
        }
    },

    _updatePlayerGold() {
        const goldDisplay = document.querySelector('.player-gold, #player-gold');
        if (!goldDisplay) return;

        const gold = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.gold.get()
            : (game?.player?.gold || 0);

        goldDisplay.textContent = gold.toLocaleString();
    },

    _updatePlayerLevel() {
        const levelDisplay = document.querySelector('.player-level, #player-level');
        if (!levelDisplay) return;

        levelDisplay.textContent = game?.player?.level || 1;
    },

    // TARGETED UPDATE: Party panel
    _updatePartyPanel(flags) {
        if (flags.members || flags.stats) {
            if (typeof PartyPanel !== 'undefined' && PartyPanel.updatePanel) {
                PartyPanel.updatePanel();
            }
        }
    },

    // TARGETED UPDATE: Market panel
    _updateMarketPanel(flags) {
        if (flags.prices || flags.stock) {
            // market updates are complex - let existing system handle
            if (typeof updateMarketDisplay === 'function') {
                updateMarketDisplay();
            }
        }
    },

    // TARGETED UPDATE: Quests panel
    _updateQuestsPanel(flags) {
        if (flags.list) {
            if (typeof QuestSystem !== 'undefined' && QuestSystem.updateQuestPanel) {
                QuestSystem.updateQuestPanel();
            }
        }

        if (flags.tracker) {
            if (typeof QuestSystem !== 'undefined' && QuestSystem.updateQuestTracker) {
                QuestSystem.updateQuestTracker();
            }
        }
    },

    // force immediate update (bypass batching) - use sparingly
    forceUpdate(panelName) {
        this.markPanelDirty(panelName);
        this._updatePanel(panelName);
        this.clearDirty(panelName);
    },

    // get stats for debugging
    getStats() {
        return {
            pendingUpdates: [...this.pendingUpdates],
            dirtyFlags: JSON.parse(JSON.stringify(this.dirtyFlags)),
            throttleTimers: Object.keys(this.throttleTimers).filter(k => this.throttleTimers[k])
        };
    },

    // cleanup
    cleanup() {
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }

        this.pendingUpdates.clear();

        for (const timer in this.throttleTimers) {
            this.throttleTimers[timer] = false;
        }

        this.initialized = false;
    }
};

// global access
window.PanelUpdateManager = PanelUpdateManager;

// register with Bootstrap
Bootstrap.register('PanelUpdateManager', () => PanelUpdateManager.init(), {
    dependencies: ['PanelManager', 'EventBus'],
    priority: 93,
    severity: 'optional'
});
