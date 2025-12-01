// ═══════════════════════════════════════════════════════════════
// 👑 MERCHANT RANK SYSTEM - climb the ladder or die trying
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// from vagrant filth to royal merchant glory
// your wealth defines your worth... how depressingly capitalist
// ═══════════════════════════════════════════════════════════════

const MerchantRankSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 👑 RANK DEFINITIONS - 10 levels of commercial existence
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('👑 MerchantRankSystem awakening... time to judge your worth');
        this.updateRank();
        this.setupEventListeners();
        // 🖤 Update player name display with title on init
        this.updateAllNameDisplays();
        return this;
    },

    setupEventListeners() {
        // listen for gold changes to update rank
        document.addEventListener('gold-changed', () => this.checkForRankUp());
        document.addEventListener('property-purchased', () => this.checkForRankUp());
        document.addEventListener('trade-completed', () => this.checkForRankUp());
    },

    // ═══════════════════════════════════════════════════════════════
    // 💰 WEALTH CALCULATION - count your sins... i mean gold
    // ═══════════════════════════════════════════════════════════════
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

        // inventory value
        if (game.player.inventory && typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
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

    // ═══════════════════════════════════════════════════════════════
    // 👑 RANK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════
    getRankForWealth(wealth) {
        let currentRank = this.ranks.vagrant;

        for (const rankId of this.rankOrder) {
            const rank = this.ranks[rankId];
            if (wealth >= rank.minWealth) {
                currentRank = rank;
            } else {
                break;
            }
        }

        return currentRank;
    },

    updateRank() {
        const wealth = this.calculateTotalWealth();
        const newRank = this.getRankForWealth(wealth);

        // 🖤 Ranks are PERMANENT - only allow promotions, never demotions
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

        // 🖤 Ranks are PERMANENT - only promotions happen, never demotions
        if (result.changed && result.previousRank) {
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

            // update all name displays
            this.updateAllNameDisplays();
        }

        return result;
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

    // ═══════════════════════════════════════════════════════════════
    // 🎫 PLAYER NAME WITH TITLE
    // ═══════════════════════════════════════════════════════════════
    getPlayerNameWithTitle() {
        if (typeof game === 'undefined' || !game.player) return 'Unknown';

        const rank = this.getCurrentRank();
        const name = game.player.name || 'Adventurer';

        return `${name}, ${rank.title}`;
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

    // ═══════════════════════════════════════════════════════════════
    // 🔒 LIMIT CHECKS - keep the peasants in their place
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // 💼 TRADING BENEFITS
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // 📊 UI HELPERS
    // ═══════════════════════════════════════════════════════════════
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

    // 🦇 Format gold with compact notation - handles billions 💀
    formatGold(amount) {
        if (amount >= 1000000000000) return `${(amount / 1000000000000).toFixed(1)}T`;
        if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toString();
    },

    // ═══════════════════════════════════════════════════════════════
    // 💾 SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL BINDING
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.MerchantRankSystem = MerchantRankSystem;
}

// auto-init when DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MerchantRankSystem.init());
    } else {
        // slight delay to ensure game object exists
        setTimeout(() => MerchantRankSystem.init(), 100);
    }
}

console.log('👑 MerchantRankSystem loaded... your social climbing begins');
