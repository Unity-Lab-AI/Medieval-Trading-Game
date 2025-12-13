// ═══════════════════════════════════════════════════════════════
// COMPANION SYSTEM - your NPCs actually travel and fight with you
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const CompanionSystem = {
    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('🤝 CompanionSystem: Ready to recruit some actual help');

        // Guard against early init
        if (!game || !game.player) {
            console.log('🖤 CompanionSystem.init() called before player exists... waiting');
            return;
        }

        // Initialize companion data if not exists
        if (!game.player.companions) {
            game.player.companions = [];
        }

        // Migrate old employees to companions if needed
        if (game.player.ownedEmployees && game.player.ownedEmployees.length > 0) {
            this.migrateEmployeesToCompanions();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // MIGRATION - convert old employees to new companion format
    // ═══════════════════════════════════════════════════════════════
    migrateEmployeesToCompanions() {
        console.log('🔄 Migrating employees to companion system...');

        game.player.ownedEmployees.forEach(employee => {
            // Add companion-specific fields if missing
            if (!employee.mode) {
                employee.mode = employee.assignedProperty ? 'property' : 'travel';
            }
            if (!employee.inventory) {
                employee.inventory = {};
            }
            if (!employee.gold) {
                employee.gold = 0;
            }
            if (!employee.carryWeight) {
                employee.carryWeight = this.getBaseCarryWeight(employee.type);
            }
            if (!employee.maxCarryWeight) {
                employee.maxCarryWeight = this.getBaseCarryWeight(employee.type);
            }
            if (!employee.health) {
                employee.health = this.getBaseStat(employee.type, 'health');
            }
            if (!employee.maxHealth) {
                employee.maxHealth = this.getBaseStat(employee.type, 'health');
            }
            if (!employee.attack) {
                employee.attack = this.getBaseStat(employee.type, 'attack');
            }
            if (!employee.defense) {
                employee.defense = this.getBaseStat(employee.type, 'defense');
            }
        });

        // Copy reference (we're extending, not replacing)
        game.player.companions = game.player.ownedEmployees;

        console.log(`🖤 Migrated ${game.player.companions.length} companions 💀`);
    },

    // ═══════════════════════════════════════════════════════════════
    // BASE STATS - what each companion type starts with
    // ═══════════════════════════════════════════════════════════════
    getBaseStat(companionType, statType) {
        const stats = {
            merchant: { health: 60, attack: 8, defense: 5 },
            guard: { health: 100, attack: 18, defense: 12 },
            worker: { health: 80, attack: 10, defense: 6 },
            craftsman: { health: 70, attack: 12, defense: 8 },
            farmer: { health: 75, attack: 9, defense: 7 },
            miner: { health: 90, attack: 15, defense: 10 },
            manager: { health: 65, attack: 10, defense: 6 },
            apprentice: { health: 50, attack: 6, defense: 4 }
        };

        return stats[companionType]?.[statType] || 60; // Default to 60 if unknown
    },

    getBaseCarryWeight(companionType) {
        const carryWeights = {
            merchant: 50,   // Decent carrying capacity
            guard: 80,      // Strong, can carry armor/weapons
            worker: 100,    // Built for hauling
            craftsman: 60,  // Tools + materials
            farmer: 90,     // Used to carrying sacks
            miner: 110,     // Strongest haulers
            manager: 40,    // Not built for manual labor
            apprentice: 45  // Still learning
        };

        return carryWeights[companionType] || 50;
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANION MODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    // Set companion to travel mode (follows player)
    setTravelMode(companionId) {
        const companion = this.getCompanion(companionId);
        if (!companion) {
            addMessage('Companion not found!');
            return false;
        }

        // Remove from property if assigned
        if (companion.assignedProperty && typeof PropertyEmployeeBridge !== 'undefined') {
            const property = PropertyEmployeeBridge.getProperty(companion.assignedProperty);
            if (property) {
                property.employees = property.employees.filter(id => id !== companionId);
            }
            companion.assignedProperty = null;
        }

        companion.mode = 'travel';
        addMessage(`${companion.name} is now traveling with you!`);

        this.updatePartyDisplay();
        return true;
    },

    // Set companion to property mode (stays at property)
    setPropertyMode(companionId, propertyId) {
        const companion = this.getCompanion(companionId);
        if (!companion) {
            addMessage('Companion not found!');
            return false;
        }

        // Assign to property using existing employee system
        if (typeof EmployeeSystem !== 'undefined') {
            const success = EmployeeSystem.assignEmployeeToProperty(companionId, propertyId);
            if (success) {
                companion.mode = 'property';
                this.updatePartyDisplay();
                return true;
            }
        }

        return false;
    },

    // ═══════════════════════════════════════════════════════════════
    // PARTY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    // Get all traveling companions
    getTravelingCompanions() {
        if (!game.player.companions) return [];
        return game.player.companions.filter(c => c.mode === 'travel');
    },

    // Get party size
    getPartySize() {
        return this.getTravelingCompanions().length + 1; // +1 for player
    },

    // Get total party carry weight
    getPartyCarryWeight() {
        const companions = this.getTravelingCompanions();
        const companionWeight = companions.reduce((sum, c) => sum + (c.maxCarryWeight || 0), 0);
        const playerWeight = game.player.maxCarryWeight || 100;

        return playerWeight + companionWeight;
    },

    // Get current party weight usage
    getPartyCurrentWeight() {
        const companions = this.getTravelingCompanions();
        const companionWeight = companions.reduce((sum, c) => sum + (c.carryWeight || 0), 0);
        const playerWeight = game.player.carryWeight || 0;

        return playerWeight + companionWeight;
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANION COMBAT STATS
    // ═══════════════════════════════════════════════════════════════

    // Get total party combat power
    getPartyCombatPower() {
        const companions = this.getTravelingCompanions();

        // Player stats (use CombatSystem if available)
        let playerPower = 20; // Base
        if (typeof CombatSystem !== 'undefined') {
            const playerStats = CombatSystem.getPlayerCombatStats();
            playerPower = (playerStats.attack || 10) + (playerStats.defense || 5);
        }

        // Companion stats
        const companionPower = companions.reduce((sum, c) => {
            const attack = c.attack || 10;
            const defense = c.defense || 5;
            const health = c.health || 60;

            // Dead companions don't contribute
            if (health <= 0) return sum;

            return sum + attack + defense;
        }, 0);

        return playerPower + companionPower;
    },

    // Get alive companions
    getAliveCompanions() {
        return this.getTravelingCompanions().filter(c => (c.health || 0) > 0);
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANION INVENTORY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    // Add item to companion inventory
    addItemToCompanion(companionId, itemId, quantity = 1) {
        const companion = this.getCompanion(companionId);
        if (!companion) return false;

        if (!companion.inventory) companion.inventory = {};

        // Check carry weight
        const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
        const itemWeight = item?.weight || 1;
        const totalWeight = itemWeight * quantity;

        if ((companion.carryWeight || 0) + totalWeight > (companion.maxCarryWeight || 50)) {
            addMessage(`${companion.name} cannot carry that much weight!`);
            return false;
        }

        // Add item
        if (!companion.inventory[itemId]) {
            companion.inventory[itemId] = 0;
        }
        companion.inventory[itemId] += quantity;
        companion.carryWeight = (companion.carryWeight || 0) + totalWeight;

        return true;
    },

    // Remove item from companion inventory
    removeItemFromCompanion(companionId, itemId, quantity = 1) {
        const companion = this.getCompanion(companionId);
        if (!companion || !companion.inventory || !companion.inventory[itemId]) return false;

        if (companion.inventory[itemId] < quantity) return false;

        const item = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(itemId) : null;
        const itemWeight = item?.weight || 1;
        const totalWeight = itemWeight * quantity;

        companion.inventory[itemId] -= quantity;
        if (companion.inventory[itemId] <= 0) {
            delete companion.inventory[itemId];
        }

        companion.carryWeight = Math.max(0, (companion.carryWeight || 0) - totalWeight);

        return true;
    },

    // Transfer item between player and companion
    transferItem(fromType, fromId, toType, toId, itemId, quantity = 1) {
        // fromType/toType: 'player' or 'companion'

        if (fromType === 'player') {
            // Player → Companion
            // Check via PlayerStateManager or fallback
            const currentQty = typeof PlayerStateManager !== 'undefined'
                ? PlayerStateManager.inventory.getQuantity(itemId)
                : (game.player.inventory?.[itemId] || 0);

            if (currentQty < quantity) return false;

            // Remove from player via PlayerStateManager if available
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.inventory.remove(itemId, quantity, 'companion_transfer');
            } else {
                game.player.inventory[itemId] -= quantity;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }
                // EventBus emission for fallback path
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('inventory:item:removed', {
                        itemId: itemId,
                        quantity: quantity,
                        newTotal: game.player.inventory?.[itemId] || 0,
                        reason: 'companion_transfer'
                    });
                }
            }

            // Add to companion
            const success = this.addItemToCompanion(toId, itemId, quantity);
            if (!success) {
                // Restore to player if failed
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.add(itemId, quantity, 'companion_transfer_rollback');
                } else {
                    if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
                    game.player.inventory[itemId] += quantity;
                    // Emit rollback event for fallback path
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:added', {
                            itemId: itemId,
                            quantity: quantity,
                            newTotal: game.player.inventory[itemId],
                            reason: 'companion_transfer_rollback'
                        });
                    }
                }
                return false;
            }

            return true;

        } else if (toType === 'player') {
            // Companion → Player
            const success = this.removeItemFromCompanion(fromId, itemId, quantity);
            if (!success) return false;

            // Add to player via PlayerStateManager if available
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.inventory.add(itemId, quantity, 'companion_return');
            } else {
                if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
                game.player.inventory[itemId] += quantity;
                // EventBus emission for fallback path
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('inventory:item:added', {
                        itemId: itemId,
                        quantity: quantity,
                        newTotal: game.player.inventory[itemId],
                        reason: 'companion_return'
                    });
                }
            }

            return true;

        } else {
            // Companion → Companion
            const removed = this.removeItemFromCompanion(fromId, itemId, quantity);
            if (!removed) return false;

            const added = this.addItemToCompanion(toId, itemId, quantity);
            if (!added) {
                // Restore if failed
                this.addItemToCompanion(fromId, itemId, quantity);
                return false;
            }

            return true;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    // Get companion by ID
    getCompanion(companionId) {
        if (!game.player.companions) return null;
        return game.player.companions.find(c => c.id === companionId);
    },

    // Get all companions (traveling + property)
    getAllCompanions() {
        return game.player.companions || [];
    },

    // Update party display
    updatePartyDisplay() {
        if (typeof PartyPanel !== 'undefined' && PartyPanel.updatePanel) {
            PartyPanel.updatePanel();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE/LOAD
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            companions: game.player.companions || []
        };
    },

    loadSaveData(data) {
        if (data && data.companions) {
            game.player.companions = data.companions;
            // Also update ownedEmployees reference for backward compat
            game.player.ownedEmployees = data.companions;
            console.log(`🤝 Loaded ${data.companions.length} companions from save`);
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPOSURE
// ═══════════════════════════════════════════════════════════════
window.CompanionSystem = CompanionSystem;

console.log('🤝 CompanionSystem loaded');
