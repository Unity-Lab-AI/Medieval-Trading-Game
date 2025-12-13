//
// merchant rank system - climb the ladder or die trying
//
// File Version: GameConfig.version.file
// from vagrant filth to royal merchant glory
// your wealth defines your worth... how depressingly capitalist
// 

const MerchantRankSystem = {
    // FIX: don't show rank-up celebrations until player has unpaused at least once
    _firstUnpauseOccurred: false,
    _pendingRankUp: null, // store pending rank-up to show after unpause

    //
    // rank definitions - 10 levels of commercial existence
    //
    ranks: {
        vagrant: {
            id: 'vagrant',
            level: 1,
            name: 'Vagrant',
            title: 'a Vagrant',
            description: 'A homeless wanderer with nothing but dreams',
            minWealth: 0,
            maxProperties: 1,
            maxEmployees: 0,
            icon: '🥺',
            color: '#888888',
            benefits: {
                tradingBonus: 0,
                reputationGain: 0.8,
                taxRate: 0.15
            },
            achievement: {
                id: 'rank_vagrant',
                name: 'Humble Beginnings',
                description: 'Start your journey as a vagrant'
            }
        },
        peddler: {
            id: 'peddler',
            level: 2,
            name: 'Peddler',
            title: 'a Peddler',
            description: 'A traveling seller of small goods',
            minWealth: 500,
            maxProperties: 2,
            maxEmployees: 1,
            icon: '🧳',
            color: '#a0522d',
            benefits: {
                tradingBonus: 0.02,
                reputationGain: 0.9,
                taxRate: 0.12
            },
            achievement: {
                id: 'rank_peddler',
                name: 'First Steps',
                description: 'Become a Peddler with 500 gold in wealth'
            }
        },
        hawker: {
            id: 'hawker',
            level: 3,
            name: 'Hawker',
            title: 'a Hawker',
            description: 'A street vendor making a modest living',
            minWealth: 2000,
            maxProperties: 3,
            maxEmployees: 2,
            icon: '🛒',
            color: '#cd853f',
            benefits: {
                tradingBonus: 0.05,
                reputationGain: 1.0,
                taxRate: 0.10
            },
            achievement: {
                id: 'rank_hawker',
                name: 'Street Smart',
                description: 'Become a Hawker with 2,000 gold in wealth'
            }
        },
        trader: {
            id: 'trader',
            level: 4,
            name: 'Trader',
            title: 'a Trader',
            description: 'A respectable merchant with established trade',
            minWealth: 5000,
            maxProperties: 4,
            maxEmployees: 4,
            icon: '⚖️',
            color: '#daa520',
            benefits: {
                tradingBonus: 0.08,
                reputationGain: 1.1,
                taxRate: 0.10
            },
            achievement: {
                id: 'rank_trader',
                name: 'Legitimate Business',
                description: 'Become a Trader with 5,000 gold in wealth'
            }
        },
        merchant: {
            id: 'merchant',
            level: 5,
            name: 'Merchant',
            title: 'a Merchant',
            description: 'A successful business owner with multiple ventures',
            minWealth: 15000,
            maxProperties: 6,
            maxEmployees: 8,
            icon: '💼',
            color: '#32cd32',
            benefits: {
                tradingBonus: 0.10,
                reputationGain: 1.2,
                taxRate: 0.10
            },
            achievement: {
                id: 'rank_merchant',
                name: 'Rising Star',
                description: 'Become a Merchant with 15,000 gold in wealth'
            }
        },
        magnate: {
            id: 'magnate',
            level: 6,
            name: 'Magnate',
            title: 'a Magnate',
            description: 'A powerful figure in regional commerce',
            minWealth: 50000,
            maxProperties: 10,
            maxEmployees: 15,
            icon: '🏛️',
            color: '#4169e1',
            benefits: {
                tradingBonus: 0.12,
                reputationGain: 1.3,
                taxRate: 0.08
            },
            achievement: {
                id: 'rank_magnate',
                name: 'Power Player',
                description: 'Become a Magnate with 50,000 gold in wealth'
            }
        },
        tycoon: {
            id: 'tycoon',
            level: 7,
            name: 'Tycoon',
            title: 'a Tycoon',
            description: 'A wealthy industrialist with vast holdings',
            minWealth: 150000,
            maxProperties: 15,
            maxEmployees: 25,
            icon: '🏭',
            color: '#9370db',
            benefits: {
                tradingBonus: 0.15,
                reputationGain: 1.4,
                taxRate: 0.08
            },
            achievement: {
                id: 'rank_tycoon',
                name: 'Industrial Giant',
                description: 'Become a Tycoon with 150,000 gold in wealth'
            }
        },
        baron: {
            id: 'baron',
            level: 8,
            name: 'Trade Baron',
            title: 'a Trade Baron',
            description: 'A noble of commerce, controlling major trade routes',
            minWealth: 500000,
            maxProperties: 20,
            maxEmployees: 40,
            icon: '👑',
            color: '#ff8c00',
            benefits: {
                tradingBonus: 0.18,
                reputationGain: 1.5,
                taxRate: 0.05
            },
            achievement: {
                id: 'rank_baron',
                name: 'Noble Commerce',
                description: 'Become a Trade Baron with 500,000 gold in wealth'
            }
        },
        mogul: {
            id: 'mogul',
            level: 9,
            name: 'Merchant Mogul',
            title: 'a Merchant Mogul',
            description: 'An empire builder whose influence spans kingdoms',
            minWealth: 1500000,
            maxProperties: 30,
            maxEmployees: 60,
            icon: '🌟',
            color: '#ff4500',
            benefits: {
                tradingBonus: 0.20,
                reputationGain: 1.6,
                taxRate: 0.05
            },
            achievement: {
                id: 'rank_mogul',
                name: 'Empire Builder',
                description: 'Become a Merchant Mogul with 1,500,000 gold in wealth'
            }
        },
        royal_merchant: {
            id: 'royal_merchant',
            level: 10,
            name: 'Royal Merchant',
            title: 'a Royal Merchant',
            description: 'The pinnacle of mercantile achievement, blessed by royalty',
            minWealth: 5000000,
            maxProperties: 50,
            maxEmployees: 100,
            icon: '👸',
            color: '#ffd700',
            benefits: {
                tradingBonus: 0.25,
                reputationGain: 2.0,
                taxRate: 0.03
            },
            achievement: {
                id: 'rank_royal_merchant',
                name: 'Royal Favor',
                description: 'Become a Royal Merchant with 5,000,000 gold in wealth'
            }
        }
    },

    // rank order for easy lookup
    rankOrder: ['vagrant', 'peddler', 'hawker', 'trader', 'merchant', 'magnate', 'tycoon', 'baron', 'mogul', 'royal_merchant'],

    // current player rank (cached)
    currentRank: null,

    //
    // initialization
    //
    init() {
        console.log('👑 MerchantRankSystem awakening... time to judge your worth');
        this.updateRank();
        this.setupEventListeners();
        // update player name display with title on init
        this.updateAllNameDisplays();
        return this;
    },

    setupEventListeners() {
        // listen for gold changes to update rank
        document.addEventListener('gold-changed', () => this.checkForRankUp());
        document.addEventListener('property-purchased', () => this.checkForRankUp());
        document.addEventListener('trade-completed', () => this.checkForRankUp());
    },

    //
    // wealth calculation - count your sins... i mean gold
    //
    calculateTotalWealth() {
        if (typeof game === 'undefined' || !game.player) return 0;

        let wealth = 0;

        // liquid gold
        wealth += game.player.gold || 0;

        // property values
        if (game.player.ownedProperties && typeof PropertySystem !== 'undefined') {
            game.player.ownedProperties.forEach(property => {
                const propertyType = PropertySystem.propertyTypes[property.type];
                if (propertyType) {
                    // base value plus upgrades
                    let value = propertyType.basePrice * (property.level || 1);
                    if (property.upgrades) {
                        value += property.upgrades.length * (propertyType.basePrice * 0.3);
                    }
                    wealth += value;
                }
            });
        }

        // inventory value via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (inventory && typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(inventory)) {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    wealth += (item.basePrice || 0) * quantity;
                }
            }
        }

        // trade route value (estimated)
        if (game.player.tradeRoutes) {
            wealth += game.player.tradeRoutes.length * 1000;
        }

        return Math.floor(wealth);
    },

    //
    // rank management
    //
    getRankForWealth(wealth) {
        // use findLast for cleaner reverse lookup - finds highest qualifying rank 
        const qualifyingRankId = this.rankOrder.findLast(rankId => wealth >= this.ranks[rankId].minWealth);
        return qualifyingRankId ? this.ranks[qualifyingRankId] : this.ranks.vagrant;
    },

    updateRank() {
        const wealth = this.calculateTotalWealth();
        const newRank = this.getRankForWealth(wealth);

        // ranks are PERMANENT - only allow promotions, never demotions
        if (!this.currentRank) {
            // First time setting rank
            this.currentRank = newRank;
            if (typeof game !== 'undefined' && game.player) {
                game.player.merchantRank = newRank.id;
                game.player.merchantRankLevel = newRank.level;
            }
            return { changed: true, previousRank: null, newRank };
        }

        // Only update if new rank is HIGHER than current
        if (newRank.level > this.currentRank.level) {
            const previousRank = this.currentRank;
            this.currentRank = newRank;

            // store in player data
            if (typeof game !== 'undefined' && game.player) {
                game.player.merchantRank = newRank.id;
                game.player.merchantRankLevel = newRank.level;
            }

            // fire rank change event
            document.dispatchEvent(new CustomEvent('merchant-rank-changed', {
                detail: { previousRank, newRank, wealth }
            }));

            return { changed: true, previousRank, newRank };
        }

        return { changed: false, rank: this.currentRank };
    },

    checkForRankUp() {
        const result = this.updateRank();

        // ranks are PERMANENT - only promotions happen, never demotions
        if (result.changed && result.previousRank) {
            // FIX: don't show celebration until player has unpaused at least once 
            if (!this._firstUnpauseOccurred) {
                console.log('👑 Rank up detected but game not unpaused yet - deferring celebration');
                this._pendingRankUp = result.newRank;
                // Still update name displays silently
                this.updateAllNameDisplays();
                return result;
            }

            // rank up notification
            if (typeof addMessage === 'function') {
                addMessage(`👑 RANK UP! You are now ${result.newRank.title}!`, 'success');
                addMessage(`${result.newRank.icon} ${result.newRank.description}`, 'info');
            }

            // unlock achievement
            if (typeof AchievementSystem !== 'undefined' && AchievementSystem.unlockAchievement && result.newRank.achievement) {
                AchievementSystem.unlockAchievement(result.newRank.achievement.id);
            }

            // show celebration (if we have one)
            this.celebrateRankUp(result.newRank);

            // notify AchievementSystem that first rank up occurred - enables achievement checking
            if (typeof AchievementSystem !== 'undefined' && AchievementSystem.onFirstRankUp) {
                AchievementSystem.onFirstRankUp();
            }

            // update all name displays
            this.updateAllNameDisplays();
        }

        return result;
    },

    // FIX: called when player first unpauses the game - NOW we can show deferred rank-ups
    enableRankCelebrations() {
        if (this._firstUnpauseOccurred) return; // already enabled

        this._firstUnpauseOccurred = true;
        console.log('👑 Player unpaused! Rank celebrations now ENABLED 🖤💀');

        // Show any pending rank-up celebration that was deferred
        if (this._pendingRankUp) {
            console.log('👑 Showing deferred rank-up celebration for:', this._pendingRankUp.name);

            // rank up notification
            if (typeof addMessage === 'function') {
                addMessage(`👑 RANK UP! You are now ${this._pendingRankUp.title}!`, 'success');
                addMessage(`${this._pendingRankUp.icon} ${this._pendingRankUp.description}`, 'info');
            }

            // unlock achievement
            if (typeof AchievementSystem !== 'undefined' && AchievementSystem.unlockAchievement && this._pendingRankUp.achievement) {
                AchievementSystem.unlockAchievement(this._pendingRankUp.achievement.id);
            }

            // show celebration
            this.celebrateRankUp(this._pendingRankUp);

            // notify AchievementSystem that first rank up occurred - enables achievement checking
            if (typeof AchievementSystem !== 'undefined' && AchievementSystem.onFirstRankUp) {
                AchievementSystem.onFirstRankUp();
            }

            this._pendingRankUp = null;
        }
    },

    celebrateRankUp(rank) {
        // create a fancy notification overlay
        const overlay = document.createElement('div');
        overlay.className = 'rank-up-celebration';
        overlay.innerHTML = `
            <div class="rank-up-content">
                <div class="rank-up-icon">${rank.icon}</div>
                <div class="rank-up-title">RANK UP!</div>
                <div class="rank-up-name" style="color: ${rank.color}">${rank.name}</div>
                <div class="rank-up-description">${rank.description}</div>
                <div class="rank-up-benefits">
                    <div>🏠 Max Properties: ${rank.maxProperties}</div>
                    <div>👥 Max Employees: ${rank.maxEmployees}</div>
                    <div>💰 Trading Bonus: +${Math.round(rank.benefits.tradingBonus * 100)}%</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // auto-dismiss after 4 seconds
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 4000);

        // click to dismiss early
        overlay.addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        });
    },

    //
    // player name with title
    //
    getPlayerNameWithTitle() {
        if (typeof game === 'undefined' || !game.player) return 'Unknown';

        const rank = this.getCurrentRank();
        const name = game.player.name || 'Adventurer';

        // format: "Riley a Vagrant" (no comma) 
        return `${name} ${rank.title}`;
    },

    getPlayerNameShort() {
        if (typeof game === 'undefined' || !game.player) return 'Unknown';

        const rank = this.getCurrentRank();
        const name = game.player.name || 'Adventurer';

        return `${rank.icon} ${name}`;
    },

    getCurrentRank() {
        if (!this.currentRank) {
            this.updateRank();
        }
        return this.currentRank || this.ranks.vagrant;
    },

    // update all UI elements that show player name
    updateAllNameDisplays() {
        const nameWithTitle = this.getPlayerNameWithTitle();
        const nameShort = this.getPlayerNameShort();

        // update player info display
        const playerNameElements = document.querySelectorAll('.player-name, #player-name, [data-player-name]');
        playerNameElements.forEach(el => {
            if (el.dataset.format === 'short') {
                el.textContent = nameShort;
            } else {
                el.textContent = nameWithTitle;
            }
        });

        // update side panel
        const sidePlayerName = document.getElementById('side-player-name');
        if (sidePlayerName) {
            sidePlayerName.textContent = nameWithTitle;
        }

        // update any rank badges
        const rankBadges = document.querySelectorAll('.merchant-rank-badge');
        const rank = this.getCurrentRank();
        rankBadges.forEach(badge => {
            badge.innerHTML = `<span style="color: ${rank.color}">${rank.icon} ${rank.name}</span>`;
        });
    },

    //
    // limit checks - keep the peasants in their place
    //
    getMaxProperties() {
        const rank = this.getCurrentRank();
        return rank.maxProperties;
    },

    getMaxEmployees() {
        const rank = this.getCurrentRank();
        return rank.maxEmployees;
    },

    canPurchaseProperty() {
        const currentProperties = game.player?.ownedProperties?.length || 0;
        const maxProperties = this.getMaxProperties();

        if (currentProperties >= maxProperties) {
            return {
                allowed: false,
                reason: `Property limit reached (${currentProperties}/${maxProperties})`,
                suggestion: `Reach ${this.getNextRank()?.name || 'higher rank'} to unlock more property slots`
            };
        }

        return { allowed: true };
    },

    canHireEmployee() {
        const currentEmployees = game.player?.ownedEmployees?.length || 0;
        const maxEmployees = this.getMaxEmployees();

        if (currentEmployees >= maxEmployees) {
            return {
                allowed: false,
                reason: `Employee limit reached (${currentEmployees}/${maxEmployees})`,
                suggestion: `Reach ${this.getNextRank()?.name || 'higher rank'} to unlock more employee slots`
            };
        }

        return { allowed: true };
    },

    getNextRank() {
        const rank = this.getCurrentRank();
        const currentIndex = this.rankOrder.indexOf(rank.id);

        // guard against indexOf returning -1 (not found) 
        if (currentIndex === -1) return null;

        if (currentIndex < this.rankOrder.length - 1) {
            return this.ranks[this.rankOrder[currentIndex + 1]];
        }

        return null; // already at max rank
    },

    getProgressToNextRank() {
        const rank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        const wealth = this.calculateTotalWealth();

        if (!nextRank) {
            return { progress: 100, current: wealth, required: rank.minWealth, nextRank: null };
        }

        const rangeStart = rank.minWealth;
        const rangeEnd = nextRank.minWealth;
        const progress = Math.min(100, Math.round(((wealth - rangeStart) / (rangeEnd - rangeStart)) * 100));

        return {
            progress,
            current: wealth,
            required: nextRank.minWealth,
            remaining: Math.max(0, nextRank.minWealth - wealth),
            nextRank
        };
    },

    //
    // trading benefits
    //
    getTradingBonus() {
        const rank = this.getCurrentRank();
        return rank.benefits.tradingBonus;
    },

    getReputationMultiplier() {
        const rank = this.getCurrentRank();
        return rank.benefits.reputationGain;
    },

    getTaxRate() {
        const rank = this.getCurrentRank();
        return rank.benefits.taxRate;
    },

    //
    // ui helpers
    //
    getRankDisplay() {
        const rank = this.getCurrentRank();
        const progress = this.getProgressToNextRank();

        return {
            name: rank.name,
            title: rank.title,
            icon: rank.icon,
            color: rank.color,
            level: rank.level,
            maxProperties: rank.maxProperties,
            maxEmployees: rank.maxEmployees,
            progress: progress.progress,
            wealthRequired: progress.required,
            wealthCurrent: progress.current,
            nextRank: progress.nextRank?.name || 'Max Rank'
        };
    },

    createRankWidget() {
        const display = this.getRankDisplay();
        const rank = this.getCurrentRank();

        return `
            <div class="merchant-rank-widget" style="border-color: ${rank.color}">
                <div class="rank-header">
                    <span class="rank-icon">${display.icon}</span>
                    <span class="rank-name" style="color: ${rank.color}">${display.name}</span>
                    <span class="rank-level">Lv.${display.level}</span>
                </div>
                <div class="rank-progress-container">
                    <div class="rank-progress-bar" style="width: ${display.progress}%; background: ${rank.color}"></div>
                </div>
                <div class="rank-info">
                    <span>💰 ${this.formatGold(display.wealthCurrent)} / ${this.formatGold(display.wealthRequired)}</span>
                    <span>Next: ${display.nextRank}</span>
                </div>
                <div class="rank-limits">
                    <span>🏠 ${game.player?.ownedProperties?.length || 0}/${display.maxProperties}</span>
                    <span>👥 ${game.player?.ownedEmployees?.length || 0}/${display.maxEmployees}</span>
                </div>
            </div>
        `;
    },

    // format gold with compact notation - handles billions 
    formatGold(amount) {
        if (amount >= 1000000000000) return `${(amount / 1000000000000).toFixed(1)}T`;
        if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toString();
    },

    //
    // save/load
    //
    getSaveData() {
        return {
            currentRankId: this.currentRank?.id || 'vagrant',
            highestRankAchieved: game.player?.highestMerchantRank || 'vagrant'
        };
    },

    loadSaveData(data) {
        if (data && data.currentRankId) {
            this.currentRank = this.ranks[data.currentRankId] || this.ranks.vagrant;
        }
        // recalculate based on current wealth (in case it changed)
        this.updateRank();
    }
};

//
// global binding
//
if (typeof window !== 'undefined') {
    window.MerchantRankSystem = MerchantRankSystem;
}

// register with Bootstrap
Bootstrap.register('MerchantRankSystem', () => MerchantRankSystem.init(), {
    dependencies: ['game', 'TradingSystem'],
    priority: 48,
    severity: 'optional'
});

console.log('👑 MerchantRankSystem loaded... your social climbing begins');
