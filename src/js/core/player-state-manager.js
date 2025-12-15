// ═══════════════════════════════════════════════════════════════
// PLAYER STATE MANAGER - single source of truth for player data
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// replaces direct game.player access with validated, event-driven API
// the darkness of scattered state ends here
// ═══════════════════════════════════════════════════════════════

const PlayerStateManager = {
    // ═══════════════════════════════════════════════════════════════
    // INTERNAL STATE - the truth, hidden from prying eyes
    // ═══════════════════════════════════════════════════════════════
    _initialized: false,
    _transactionHistory: [],  // audit trail for debugging
    _maxHistoryLength: 100,   // don't let history grow forever

    // ═══════════════════════════════════════════════════════════════
    // GOLD MANAGEMENT - delegates to GoldManager as primary source
    // GoldManager is the single source of truth for gold
    // ═══════════════════════════════════════════════════════════════
    gold: {
        get() {
            // GoldManager is primary source if available
            if (typeof GoldManager !== 'undefined') {
                return GoldManager.getGold();
            }
            // fallback to game.player.gold
            if (typeof game !== 'undefined' && game.player) {
                return game.player.gold || 0;
            }
            return 0;
        },

        set(amount, reason = 'unknown') {
            const oldGold = this.get();
            const newGold = Math.max(0, Math.floor(amount));

            // delegate to GoldManager as primary (it handles game.player.gold sync)
            if (typeof GoldManager !== 'undefined') {
                GoldManager.setGold(newGold, reason);
            } else if (typeof game !== 'undefined' && game.player) {
                // fallback direct write
                game.player.gold = newGold;
            }

            // Record transaction in PlayerStateManager history
            PlayerStateManager._recordTransaction('gold', 'set', {
                from: oldGold,
                to: newGold,
                reason: reason
            });

            // GoldManager emits 'goldChanged', but we also emit player:gold:changed for consistency
            if (typeof EventBus !== 'undefined' && newGold !== oldGold) {
                EventBus.emit('player:gold:changed', {
                    oldGold: oldGold,
                    newGold: newGold,
                    change: newGold - oldGold,
                    reason: reason
                });
            }

            return true;
        },

        add(amount, reason = 'unknown') {
            // delegate to GoldManager
            if (typeof GoldManager !== 'undefined') {
                return GoldManager.addGold(amount, reason) !== undefined;
            }
            const current = this.get();
            return this.set(current + amount, reason);
        },

        remove(amount, reason = 'unknown') {
            // delegate to GoldManager
            if (typeof GoldManager !== 'undefined') {
                return GoldManager.removeGold(amount, reason);
            }
            const current = this.get();
            if (current < amount) {
                console.warn(`PlayerStateManager: Insufficient gold. Have ${current}, need ${amount}`);
                return false;
            }
            return this.set(current - amount, reason);
        },

        canAfford(amount) {
            if (typeof GoldManager !== 'undefined') {
                return GoldManager.canAfford(amount);
            }
            return this.get() >= amount;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INVENTORY MANAGEMENT - what you carry defines you
    // ═══════════════════════════════════════════════════════════════
    inventory: {
        get() {
            if (typeof game !== 'undefined' && game.player) {
                return { ...game.player.inventory } || {};
            }
            return {};
        },

        has(itemId) {
            const inv = this.get();
            return (inv[itemId] || 0) > 0;
        },

        getQuantity(itemId) {
            const inv = this.get();
            return inv[itemId] || 0;
        },

        add(itemId, quantity = 1, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;
            if (!itemId || quantity <= 0) return false;

            const oldQty = game.player.inventory[itemId] || 0;
            const newQty = oldQty + quantity;

            game.player.inventory[itemId] = newQty;

            // Record transaction
            PlayerStateManager._recordTransaction('inventory', 'add', {
                itemId: itemId,
                quantity: quantity,
                oldQty: oldQty,
                newQty: newQty,
                reason: reason
            });

            // Emit event for listeners
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: newQty,
                    reason: reason
                });
            }

            return true;
        },

        remove(itemId, quantity = 1, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;
            if (!itemId || quantity <= 0) return false;

            const oldQty = game.player.inventory[itemId] || 0;
            if (oldQty < quantity) {
                console.warn(`PlayerStateManager: Insufficient ${itemId}. Have ${oldQty}, need ${quantity}`);
                return false;
            }

            const newQty = oldQty - quantity;

            if (newQty <= 0) {
                delete game.player.inventory[itemId];
            } else {
                game.player.inventory[itemId] = newQty;
            }

            // Record transaction
            PlayerStateManager._recordTransaction('inventory', 'remove', {
                itemId: itemId,
                quantity: quantity,
                oldQty: oldQty,
                newQty: newQty,
                reason: reason
            });

            // Emit event for listeners
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:removed', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: newQty,
                    reason: reason
                });
            }

            return true;
        },

        set(itemId, quantity, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;
            if (!itemId) return false;

            const oldQty = game.player.inventory[itemId] || 0;

            if (quantity <= 0) {
                delete game.player.inventory[itemId];
            } else {
                game.player.inventory[itemId] = quantity;
            }

            // Record transaction
            PlayerStateManager._recordTransaction('inventory', 'set', {
                itemId: itemId,
                oldQty: oldQty,
                newQty: quantity,
                reason: reason
            });

            // Emit appropriate event
            if (typeof EventBus !== 'undefined') {
                if (quantity > oldQty) {
                    EventBus.emit('inventory:item:added', {
                        itemId: itemId,
                        quantity: quantity - oldQty,
                        newTotal: quantity,
                        reason: reason
                    });
                } else if (quantity < oldQty) {
                    EventBus.emit('inventory:item:removed', {
                        itemId: itemId,
                        quantity: oldQty - quantity,
                        newTotal: quantity,
                        reason: reason
                    });
                }
            }

            return true;
        },

        getAll() {
            return Object.entries(this.get());
        },

        clear(reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;

            const oldInventory = { ...game.player.inventory };
            game.player.inventory = {};

            // Record transaction
            PlayerStateManager._recordTransaction('inventory', 'clear', {
                oldInventory: oldInventory,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:cleared', { reason: reason });
            }

            return true;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // STATS MANAGEMENT - health, hunger, thirst, stamina
    // ═══════════════════════════════════════════════════════════════
    stats: {
        get(statName) {
            if (typeof game === 'undefined' || !game.player || !game.player.stats) {
                return 0;
            }
            return game.player.stats[statName] || 0;
        },

        getAll() {
            if (typeof game === 'undefined' || !game.player || !game.player.stats) {
                return { health: 0, hunger: 0, thirst: 0, stamina: 0 };
            }
            return { ...game.player.stats };
        },

        set(statName, value, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player || !game.player.stats) return false;

            const oldValue = game.player.stats[statName] || 0;
            // Clamp to 0-100 range
            const newValue = Math.max(0, Math.min(100, value));

            game.player.stats[statName] = newValue;

            // Record transaction
            PlayerStateManager._recordTransaction('stats', 'set', {
                stat: statName,
                from: oldValue,
                to: newValue,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:stats:changed', {
                    stat: statName,
                    oldValue: oldValue,
                    newValue: newValue,
                    reason: reason
                });
            }

            return true;
        },

        add(statName, amount, reason = 'unknown') {
            const current = this.get(statName);
            return this.set(statName, current + amount, reason);
        },

        subtract(statName, amount, reason = 'unknown') {
            const current = this.get(statName);
            return this.set(statName, current - amount, reason);
        },

        isAlive() {
            return this.get('health') > 0;
        },

        isCritical(statName) {
            const value = this.get(statName);
            return value <= 20; // 20% threshold
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SKILLS MANAGEMENT - what you know defines what you can do
    // ═══════════════════════════════════════════════════════════════
    skills: {
        get(skillName) {
            if (typeof game === 'undefined' || !game.player || !game.player.skills) {
                return 0;
            }
            return game.player.skills[skillName] || 0;
        },

        getAll() {
            if (typeof game === 'undefined' || !game.player || !game.player.skills) {
                return {};
            }
            return { ...game.player.skills };
        },

        set(skillName, level, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;

            if (!game.player.skills) game.player.skills = {};

            const oldLevel = game.player.skills[skillName] || 0;
            const newLevel = Math.max(0, level);

            game.player.skills[skillName] = newLevel;

            // Record transaction
            PlayerStateManager._recordTransaction('skills', 'set', {
                skill: skillName,
                from: oldLevel,
                to: newLevel,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:skill:changed', {
                    skill: skillName,
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    reason: reason
                });
            }

            return true;
        },

        improve(skillName, amount = 1, reason = 'unknown') {
            const current = this.get(skillName);
            return this.set(skillName, current + amount, reason);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EQUIPMENT MANAGEMENT - what you wear protects (or kills) you
    // ═══════════════════════════════════════════════════════════════
    equipment: {
        get(slotId) {
            if (typeof game === 'undefined' || !game.player || !game.player.equipment) {
                return null;
            }
            return game.player.equipment[slotId] || null;
        },

        getAll() {
            if (typeof game === 'undefined' || !game.player || !game.player.equipment) {
                return {};
            }
            return { ...game.player.equipment };
        },

        equip(slotId, itemId, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;

            if (!game.player.equipment) game.player.equipment = {};

            const oldItem = game.player.equipment[slotId] || null;
            game.player.equipment[slotId] = itemId;

            // Record transaction
            PlayerStateManager._recordTransaction('equipment', 'equip', {
                slot: slotId,
                oldItem: oldItem,
                newItem: itemId,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:equipment:changed', {
                    slot: slotId,
                    oldItem: oldItem,
                    newItem: itemId,
                    action: 'equip',
                    reason: reason
                });
            }

            return true;
        },

        unequip(slotId, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player || !game.player.equipment) return false;

            const oldItem = game.player.equipment[slotId] || null;
            if (!oldItem) return false; // nothing to unequip

            game.player.equipment[slotId] = null;

            // Record transaction
            PlayerStateManager._recordTransaction('equipment', 'unequip', {
                slot: slotId,
                item: oldItem,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:equipment:changed', {
                    slot: slotId,
                    oldItem: oldItem,
                    newItem: null,
                    action: 'unequip',
                    reason: reason
                });
            }

            return true;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // REPUTATION MANAGEMENT - what they think of you
    // ═══════════════════════════════════════════════════════════════
    reputation: {
        get() {
            if (typeof game === 'undefined' || !game.player) {
                return 0;
            }
            return game.player.reputation || 0;
        },

        set(value, reason = 'unknown') {
            if (typeof game === 'undefined' || !game.player) return false;

            const oldRep = game.player.reputation || 0;
            game.player.reputation = value;

            // Record transaction
            PlayerStateManager._recordTransaction('reputation', 'set', {
                from: oldRep,
                to: value,
                reason: reason
            });

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:reputation:changed', {
                    oldValue: oldRep,
                    newValue: value,
                    change: value - oldRep,
                    reason: reason
                });
            }

            return true;
        },

        add(amount, reason = 'unknown') {
            const current = this.get();
            return this.set(current + amount, reason);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // TRANSACTION HISTORY - the audit trail of your existence
    // ═══════════════════════════════════════════════════════════════
    _recordTransaction(category, action, data) {
        this._transactionHistory.push({
            timestamp: Date.now(),
            category: category,
            action: action,
            data: data
        });

        // Trim history if too long
        if (this._transactionHistory.length > this._maxHistoryLength) {
            this._transactionHistory = this._transactionHistory.slice(-this._maxHistoryLength);
        }
    },

    getTransactionHistory(category = null, limit = 20) {
        let history = this._transactionHistory;

        if (category) {
            history = history.filter(t => t.category === category);
        }

        return history.slice(-limit);
    },

    clearTransactionHistory() {
        this._transactionHistory = [];
    },

    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE METHODS
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this._initialized) {
            console.log('🎮 PlayerStateManager already initialized');
            return;
        }

        console.log('🎮 PlayerStateManager initializing...');
        this._initialized = true;
        this._transactionHistory = [];

        console.log('🎮 PlayerStateManager ready - single source of truth active');
    },

    // For debugging - dump current state
    debugDump() {
        return {
            gold: this.gold.get(),
            inventory: this.inventory.get(),
            stats: this.stats.getAll(),
            skills: this.skills.getAll(),
            equipment: this.equipment.getAll(),
            reputation: this.reputation.get(),
            recentTransactions: this.getTransactionHistory(null, 10)
        };
    }
};

// Make it global
window.PlayerStateManager = PlayerStateManager;

// register with Bootstrap - required for player data
Bootstrap.register('PlayerStateManager', () => PlayerStateManager.init(), {
    dependencies: ['EventBus', 'GameConfig'],
    priority: 8,
    severity: 'required'
});

console.log('🎮 PlayerStateManager loaded - the chaos of scattered state ends here');
