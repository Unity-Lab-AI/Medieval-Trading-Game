// ═══════════════════════════════════════════════════════════════
// GOLD-MANAGER - single source of truth for your sad little fortune
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// centralized gold tracking so every display stays in sync

const GoldManager = {
    _gold: 100,  // the sacred number (single source of truth)
    _displays: [],  // all the places we flex our wealth

    // init - birth of the gold empire
    init: function(initialGold = 100) {
        console.log('🪙 GoldManager initialized with', initialGold, 'gold');
        this._gold = initialGold;
        this._displays = [];
        this.updateAllDisplays();
    },

    // registerDisplay - telling UI elements to show off the gold
    registerDisplay: function(elementId, formatter = null) {
        const element = document.getElementById(elementId);
        if (element) {
            this._displays.push({ element, formatter });
            console.log('🪙 Registered gold display:', elementId);
            return true;
        } else {
            console.warn('🪙 Could not register display:', elementId, '- element not found');
            return false;
        }
    },

    // getGold - check how much we're worth
    getGold: function() {
        return this._gold;
    },

    // setGold - changing our fortune (for better or worse)
    setGold: function(amount, reason = '') {
        const oldGold = this._gold;
        this._gold = Math.max(0, Math.round(amount));  // no negatives, we're not THAT broke
        const change = this._gold - oldGold;
        console.log(`🪙 Gold changed: ${oldGold} → ${this._gold}`, reason ? `(${reason})` : '');

        // Sync with game.player.gold (single source of truth)
        if (typeof game !== 'undefined' && game.player) {
            game.player.gold = this._gold;
            if (game.player.inventory) {
                game.player.inventory.gold = this._gold;
            }
        }

        // Track transaction in FinancialTracker for weekly totals
        if (typeof FinancialTracker !== 'undefined' && change !== 0) {
            const category = this._categorizeTransaction(reason);
            FinancialTracker.recordTransaction({
                amount: change,
                type: change > 0 ? 'income' : 'expense',
                category: category,
                description: reason
            });
        }

        // Emit event for other systems
        if (typeof EventBus !== 'undefined' && change !== 0) {
            EventBus.emit('gold:changed', { oldGold, newGold: this._gold, change, reason });
        }

        this.updateAllDisplays();
        return this._gold;
    },

    // Categorize transaction for financial tracking
    _categorizeTransaction: function(reason) {
        const r = (reason || '').toLowerCase();
        if (r.includes('trade') || r.includes('sell') || r.includes('bought') || r.includes('sold')) return 'trade';
        if (r.includes('property') || r.includes('income') || r.includes('rent')) return 'property';
        if (r.includes('quest') || r.includes('reward') || r.includes('bounty')) return 'quest';
        if (r.includes('wage') || r.includes('salary') || r.includes('employee')) return 'wage';
        if (r.includes('repair') || r.includes('fix')) return 'repair';
        if (r.includes('travel') || r.includes('ferry') || r.includes('transport')) return 'travel';
        if (r.includes('maintenance') || r.includes('upkeep')) return 'maintenance';
        if (r.includes('buy') || r.includes('purchase')) return 'purchase';
        return 'other';
    },

    // addGold - making it rain (medieval style)
    addGold: function(amount, reason = '') {
        return this.setGold(this._gold + amount, reason || `+${amount}`);
    },

    // removeGold - watching our dreams disappear
    removeGold: function(amount, reason = '') {
        if (this._gold >= amount) {
            this.setGold(this._gold - amount, reason || `-${amount}`);
            return true;
        } else {
            console.warn(`🪙 Insufficient gold! Need ${amount}, have ${this._gold}`);
            return false;
        }
    },

    // canAfford - reality check before we make bad decisions
    canAfford: function(amount) {
        return this._gold >= amount;
    },

    // updateAllDisplays - sync the gold count everywhere
    updateAllDisplays: function() {
        console.log(`🪙 Updating ${this._displays.length} displays with gold: ${this._gold}`);
        this._displays.forEach(({ element, formatter }, index) => {
            if (element) {
                const oldText = element.textContent;
                if (formatter && typeof formatter === 'function') {
                    element.textContent = formatter(this._gold);
                } else {
                    element.textContent = this._gold;
                }
                console.log(`  ✓ Display ${index} (${element.id}): "${oldText}" → "${element.textContent}"`);
            } else {
                console.warn(`  ✗ Display ${index}: element is null!`);
            }
        });
    },

    // Force re-register all displays (call after DOM changes)
    reregisterDisplays: function() {
        console.log('🪙 Re-registering all gold displays...');
        this._displays = [];

        // Register setup gold display (character creation panel)
        const setupRegistered = this.registerDisplay('setup-gold-amount');
        if (!setupRegistered) {
            if (typeof gameDeboogerWarn === 'function') {
                gameDeboogerWarn('🖤 setup-gold-amount element not found in DOM');
            }
        }

        // Register player gold display (side panel - just the number)
        // formatGoldCompact is defined in game.js - available at runtime
        const playerRegistered = this.registerDisplay('player-gold', (gold) => {
            return typeof formatGoldCompact === 'function' ? formatGoldCompact(gold) : gold.toLocaleString();
        });
        if (!playerRegistered) {
            console.warn('🪙 player-gold not found (may not be visible yet)');
        }

        console.log('🪙 Registered', this._displays.length, 'gold displays');
        this.updateAllDisplays();
    }
};

// expose to the global void
window.GoldManager = GoldManager;

console.log('🪙 GoldManager loaded - the gold tracker awakens');
