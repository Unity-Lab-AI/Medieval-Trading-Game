// ═══════════════════════════════════════════════════════════════
// EQUIPMENT PANEL - gear and equipment management
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const EquipmentSystem = {
    // ═══════════════════════════════════════════════════════════════
    // EQUIPMENT SLOTS - the holes in your existence to fill
    // ═══════════════════════════════════════════════════════════════
    // Equipment slots - allowedTypes must match both item.category AND item.equipType
    slots: {
        weapon: {
            id: 'weapon',
            name: 'Weapon',
            icon: '⚔️',
            description: 'Primary weapon for combat',
            // Added 'weapons' (category) and 'spear' type
            allowedTypes: ['weapon', 'weapons', 'sword', 'axe', 'mace', 'dagger', 'bow', 'spear', 'staff'],
            bonusTypes: ['attack', 'combat', 'damage']
        },
        offhand: {
            id: 'offhand',
            name: 'Off-Hand',
            icon: '🛡️',
            description: 'Shield or secondary item',
            allowedTypes: ['shield', 'offhand', 'lantern', 'tome'],
            bonusTypes: ['defense', 'block', 'magic']
        },
        head: {
            id: 'head',
            name: 'Head',
            icon: '🎩',
            description: 'Headwear and helmets',
            // Added 'headgear' category
            allowedTypes: ['helmet', 'hat', 'hood', 'crown', 'headwear', 'headgear'],
            bonusTypes: ['defense', 'intelligence', 'perception']
        },
        body: {
            id: 'body',
            name: 'Body',
            icon: '🥋',
            description: 'Armor and clothing',
            // Added 'armors' category
            allowedTypes: ['armor', 'armors', 'robe', 'clothing', 'chest'],
            bonusTypes: ['defense', 'endurance', 'protection']
        },
        hands: {
            id: 'hands',
            name: 'Hands',
            icon: '🧤',
            description: 'Gloves and gauntlets',
            allowedTypes: ['gloves', 'gauntlets', 'bracers', 'handwear'],
            bonusTypes: ['crafting', 'gathering', 'dexterity']
        },
        feet: {
            id: 'feet',
            name: 'Feet',
            icon: '👢',
            description: 'Boots and footwear',
            allowedTypes: ['boots', 'shoes', 'footwear'],
            bonusTypes: ['speed', 'travel', 'stealth']
        },
        tool: {
            id: 'tool',
            name: 'Tool',
            icon: '🔧',
            description: 'Equipped tool for gathering/crafting',
            // CRITICAL: Added 'tools' (category) - this was the walking_staff bug!
            allowedTypes: ['tool', 'tools', 'pickaxe', 'axe', 'hammer', 'fishing_rod', 'sickle', 'scythe', 'staff', 'walking_staff'],
            bonusTypes: ['gathering', 'crafting', 'efficiency']
        },
        accessory1: {
            id: 'accessory1',
            name: 'Accessory 1',
            icon: '💍',
            description: 'Ring, amulet, or trinket',
            // Added 'accessories' category and more types
            allowedTypes: ['ring', 'amulet', 'necklace', 'trinket', 'accessory', 'accessories', 'jewelry'],
            bonusTypes: ['luck', 'charisma', 'special']
        },
        accessory2: {
            id: 'accessory2',
            name: 'Accessory 2',
            icon: '📿',
            description: 'Second accessory slot',
            // Added 'accessories' category and more types
            allowedTypes: ['ring', 'amulet', 'necklace', 'trinket', 'accessory', 'accessories', 'jewelry'],
            bonusTypes: ['luck', 'charisma', 'special']
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION - awakening the gear machine
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('⚔️ EquipmentSystem crawling from the void...');

        // ensure player has equipment object
        if (!game.player.equipment) {
            game.player.equipment = {};
            Object.keys(this.slots).forEach(slotId => {
                game.player.equipment[slotId] = null;
            });
        }

        // migrate legacy equipment
        this.migrateLegacyEquipment();

        // Event delegation for unequip actions - no more inline onclick garbage
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action="unequip-slot"]');
            if (target) {
                const slotId = target.dataset.slotId;
                if (slotId) {
                    this.unequip(slotId);
                }
            }
        });

        // RIGHT-CLICK to unequip items - the natural way to do things
        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('.equipment-slot-box.equipped');
            if (target) {
                e.preventDefault();
                const slotId = target.dataset.slot || target.dataset.slotId;
                if (slotId && this.getEquipped(slotId)) {
                    this.unequip(slotId);
                }
            }
        });

        // Listen for equipment changes to refresh character sheet if open
        document.addEventListener('equipment-changed', () => {
            // Update character sheet equipment display if visible
            const charSheet = document.getElementById('character-sheet-overlay');
            if (charSheet && (charSheet.classList.contains('active') || charSheet.style.display === 'flex')) {
                this.updateEquipmentDisplay();
            }
        });

        console.log('⚔️ EquipmentSystem ready to adorn your mortal shell');
        return true; // Bootstrap needs a return value to know init completed
    },

    // migrate old equippedTool/equippedWeapon/equippedArmor to new system
    migrateLegacyEquipment() {
        if (game.player.equippedTool && !game.player.equipment.tool) {
            game.player.equipment.tool = game.player.equippedTool;
        }
        if (game.player.equippedWeapon && !game.player.equipment.weapon) {
            game.player.equipment.weapon = game.player.equippedWeapon;
        }
        if (game.player.equippedArmor && !game.player.equipment.body) {
            game.player.equipment.body = game.player.equippedArmor;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CORE EQUIPMENT FUNCTIONS - the ritual of gear
    // ═══════════════════════════════════════════════════════════════

    // Get what's equipped in a slot
    getEquipped(slotId) {
        // use PlayerStateManager if available
        if (typeof PlayerStateManager !== 'undefined') {
            return PlayerStateManager.equipment.get(slotId);
        }
        return game.player.equipment?.[slotId] || null;
    },

    // Get all equipped items
    getAllEquipped() {
        // use PlayerStateManager if available for the raw equipment state
        const rawEquipped = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.equipment.getAll()
            : (game.player?.equipment || {});

        const equipped = {};
        Object.keys(this.slots).forEach(slotId => {
            const itemId = rawEquipped[slotId];
            if (itemId) {
                equipped[slotId] = {
                    itemId: itemId,
                    item: ItemDatabase?.items?.[itemId] || null,
                    slot: this.slots[slotId]
                };
            }
        });
        return equipped;
    },

    // Check if an item can be equipped in a slot
    canEquipInSlot(itemId, slotId) {
        const item = ItemDatabase?.items?.[itemId];
        if (!item) return { canEquip: false, reason: 'Item not found' };

        const slot = this.slots[slotId];
        if (!slot) return { canEquip: false, reason: 'Invalid slot' };

        // check if item has equipSlot defined
        if (item.equipSlot && item.equipSlot !== slotId) {
            return { canEquip: false, reason: `Must be equipped in ${item.equipSlot} slot` };
        }

        // check if item type is allowed in slot
        const itemType = item.equipType || item.toolType || item.category;
        if (slot.allowedTypes && !slot.allowedTypes.includes(itemType)) {
            // also check the item's category
            if (!slot.allowedTypes.includes(item.category)) {
                return { canEquip: false, reason: `Cannot equip ${item.name} in ${slot.name} slot` };
            }
        }

        return { canEquip: true, reason: null };
    },

    // Find best slot for an item
    findSlotForItem(itemId) {
        const item = ItemDatabase?.items?.[itemId];
        if (!item) return null;

        // if item specifies its slot, use that
        if (item.equipSlot && this.slots[item.equipSlot]) {
            return item.equipSlot;
        }

        // check tool type first
        if (item.toolType) {
            return 'tool';
        }

        // check item category/type against slots
        const itemType = item.equipType || item.category;

        for (const [slotId, slot] of Object.entries(this.slots)) {
            if (slot.allowedTypes?.includes(itemType)) {
                return slotId;
            }
        }

        // special checks
        if (item.category === 'weapons' || itemType === 'weapon') return 'weapon';
        if (item.category === 'armor') return 'body';
        if (item.category === 'tools') return 'tool';

        return null;
    },

    // Equip an item
    equip(itemId, slotId = null) {
        console.log(`⚔️ EquipmentSystem.equip() called with itemId: ${itemId}, slotId: ${slotId}`);

        const item = ItemDatabase?.items?.[itemId];
        if (!item) {
            console.log(`⚔️ Item not found in ItemDatabase: ${itemId}`);
            addMessage(`Cannot equip unknown item!`, 'warning');
            return false;
        }
        console.log(`⚔️ Found item: ${item.name}, category: ${item.category}, equipSlot: ${item.equipSlot}, equipType: ${item.equipType}`);

        // find appropriate slot if not specified
        if (!slotId) {
            slotId = this.findSlotForItem(itemId);
            if (!slotId) {
                addMessage(`${item.name} cannot be equipped!`, 'warning');
                return false;
            }
        }

        const canEquip = this.canEquipInSlot(itemId, slotId);
        if (!canEquip.canEquip) {
            addMessage(canEquip.reason, 'warning');
            return false;
        }

        // check if player has the item via PlayerStateManager
        const hasItem = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.has(itemId)
            : (game.player?.inventory?.[itemId] || 0) > 0;

        if (!hasItem) {
            addMessage(`You don't have ${item.name} in your inventory!`, 'warning');
            return false;
        }

        // unequip current item in slot if any
        const currentEquipped = this.getEquipped(slotId);
        if (currentEquipped) {
            this.unequip(slotId, false); // silent unequip
        }

        // equip via PlayerStateManager (handles event emission) or fallback
        if (typeof PlayerStateManager !== 'undefined') {
            // PlayerStateManager handles event emission
            PlayerStateManager.equipment.equip(slotId, itemId, 'player_action');
            PlayerStateManager.inventory.remove(itemId, 1, 'equipped');
        } else {
            // fallback: direct state manipulation
            if (!game.player.equipment) {
                game.player.equipment = {};
            }
            game.player.equipment[slotId] = itemId;

            // remove from inventory
            if (game.player.inventory[itemId]) {
                game.player.inventory[itemId]--;
                const newTotal = game.player.inventory[itemId] || 0;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }

                // EventBus fallback for inventory
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('inventory:item:removed', {
                        itemId: itemId,
                        quantity: 1,
                        newTotal: newTotal,
                        reason: 'equipped'
                    });
                }
            }

            // fire equipment event manually
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:equipment:changed', {
                    slot: slotId,
                    oldItem: null,
                    newItem: itemId,
                    action: 'equip'
                });
            }
        }

        // sync with legacy properties (still needed for backwards compat)
        if (slotId === 'tool') game.player.equippedTool = itemId;
        if (slotId === 'weapon') game.player.equippedWeapon = itemId;
        if (slotId === 'body') game.player.equippedArmor = itemId;

        const slot = this.slots[slotId];
        addMessage(`⚔️ Equipped ${item.name} in ${slot.name} slot`, 'success');

        // legacy DOM event for backwards compat
        document.dispatchEvent(new CustomEvent('equipment-changed', {
            detail: { slot: slotId, itemId: itemId, action: 'equip' }
        }));

        // update UI
        this.updateEquipmentDisplay();
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.updateInventoryDisplay();
        }
        if (typeof updatePlayerInfo === 'function') {
            updatePlayerInfo();
        }

        return true;
    },

    // Unequip an item
    unequip(slotId, showMessage = true) {
        const currentEquipped = this.getEquipped(slotId);
        if (!currentEquipped) {
            if (showMessage) addMessage(`Nothing equipped in that slot!`, 'info');
            return false;
        }

        const item = ItemDatabase?.items?.[currentEquipped];
        const slot = this.slots[slotId];

        // unequip via PlayerStateManager (handles event emission) or fallback
        if (typeof PlayerStateManager !== 'undefined') {
            // PlayerStateManager handles event emission
            PlayerStateManager.equipment.unequip(slotId, 'player_action');
            PlayerStateManager.inventory.add(currentEquipped, 1, 'unequipped');
        } else {
            // fallback: direct state manipulation
            game.player.equipment[slotId] = null;

            // return item to inventory
            if (!game.player.inventory) game.player.inventory = {};
            game.player.inventory[currentEquipped] = (game.player.inventory[currentEquipped] || 0) + 1;

            // EventBus fallback for inventory
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: currentEquipped,
                    quantity: 1,
                    newTotal: game.player.inventory[currentEquipped],
                    reason: 'unequipped'
                });
            }

            // fire equipment event manually
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player:equipment:changed', {
                    slot: slotId,
                    oldItem: currentEquipped,
                    newItem: null,
                    action: 'unequip'
                });
            }
        }

        // sync with legacy properties (still needed for backwards compat)
        if (slotId === 'tool') game.player.equippedTool = null;
        if (slotId === 'weapon') game.player.equippedWeapon = null;
        if (slotId === 'body') game.player.equippedArmor = null;

        if (showMessage) {
            addMessage(`🎒 Unequipped ${item?.name || 'item'} from ${slot?.name || slotId}`, 'info');
        }

        // legacy DOM event for backwards compat
        document.dispatchEvent(new CustomEvent('equipment-changed', {
            detail: { slot: slotId, itemId: currentEquipped, action: 'unequip' }
        }));

        // update UI
        this.updateEquipmentDisplay();
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.updateInventoryDisplay();
        }

        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // EQUIPMENT BONUSES - the perks of being dressed
    // ═══════════════════════════════════════════════════════════════

    // Get total bonus for a stat from all equipment
    getTotalBonus(bonusType) {
        let total = 0;

        Object.keys(this.slots).forEach(slotId => {
            const itemId = this.getEquipped(slotId);
            if (itemId) {
                const item = ItemDatabase?.items?.[itemId];
                if (item && item.bonuses) {
                    total += item.bonuses[bonusType] || 0;
                }
            }
        });

        return total;
    },

    // Get all bonuses from equipment
    getAllBonuses() {
        const bonuses = {
            // combat bonuses
            attack: 0,
            defense: 0,
            damage: 0,
            block: 0,
            // gathering bonuses
            gathering: 0,
            mining: 0,
            woodcutting: 0,
            fishing: 0,
            farming: 0,
            // crafting bonuses
            crafting: 0,
            smithing: 0,
            cooking: 0,
            // stat bonuses
            strength: 0,
            intelligence: 0,
            charisma: 0,
            endurance: 0,
            luck: 0,
            // special bonuses
            speed: 0,
            carryCapacity: 0,
            tradingDiscount: 0,
            experienceBonus: 0
        };

        Object.keys(this.slots).forEach(slotId => {
            const itemId = this.getEquipped(slotId);
            if (itemId) {
                const item = ItemDatabase?.items?.[itemId];
                if (item && item.bonuses) {
                    Object.keys(item.bonuses).forEach(bonus => {
                        if (bonuses.hasOwnProperty(bonus)) {
                            bonuses[bonus] += item.bonuses[bonus];
                        } else {
                            bonuses[bonus] = item.bonuses[bonus];
                        }
                    });
                }
            }
        });

        return bonuses;
    },

    // Get gathering bonus for specific tool type
    getGatheringBonus(gatherType) {
        const toolId = this.getEquipped('tool');
        if (!toolId) return 0;

        const tool = ItemDatabase?.items?.[toolId];
        if (!tool) return 0;

        // check if tool matches gather type
        if (tool.toolType === gatherType || tool.bonuses?.[gatherType]) {
            return (tool.bonuses?.gathering || 0) + (tool.bonuses?.[gatherType] || 0);
        }

        return 0;
    },

    // Get crafting bonus for specific craft type
    getCraftingBonus(craftType) {
        let bonus = this.getTotalBonus('crafting');

        // check for specific craft type bonuses
        bonus += this.getTotalBonus(craftType);

        // hands slot provides crafting bonus
        const handsId = this.getEquipped('hands');
        if (handsId) {
            const hands = ItemDatabase?.items?.[handsId];
            if (hands?.bonuses?.crafting) {
                bonus += hands.bonuses.crafting;
            }
        }

        return bonus;
    },

    // Get combat stats
    getCombatStats() {
        const bonuses = this.getAllBonuses();
        return {
            attack: bonuses.attack + bonuses.damage + Math.floor(bonuses.strength / 2),
            defense: bonuses.defense + bonuses.block + Math.floor(bonuses.endurance / 2),
            accuracy: bonuses.luck + bonuses.intelligence,
            critChance: Math.floor(bonuses.luck / 2),
            dodgeChance: Math.floor(bonuses.speed / 2)
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // UI DISPLAY - making gear look pretty
    // ═══════════════════════════════════════════════════════════════

    // Update equipment display in character sheet
    updateEquipmentDisplay() {
        const container = document.getElementById('char-equipment-list');
        if (!container) return;

        container.innerHTML = this.createEquipmentHTML();
    },

    // Create equipment HTML for character sheet
    createEquipmentHTML() {
        let html = '<div class="equipment-grid">';

        Object.entries(this.slots).forEach(([slotId, slot]) => {
            const itemId = this.getEquipped(slotId);
            const item = itemId ? ItemDatabase?.items?.[itemId] : null;

            // Click equipped item to unequip - no button needed
            html += `
                <div class="equipment-slot-box ${itemId ? 'equipped clickable-unequip' : 'empty'}"
                     data-slot="${slotId}"
                     ${itemId ? `data-action="unequip-slot" data-slot-id="${slotId}" style="cursor: pointer;" title="Click to unequip"` : ''}>
                    <div class="slot-header">
                        <span class="slot-icon">${slot.icon}</span>
                        <span class="slot-name">${slot.name}</span>
                    </div>
                    <div class="slot-content">
                        ${item ? `
                            <span class="item-icon">${item.icon || '📦'}</span>
                            <span class="item-name">${item.name}</span>
                            ${this.getItemBonusesHTML(item)}
                        ` : `
                            <span class="empty-slot">Empty</span>
                        `}
                    </div>
                </div>
            `;
        });

        html += '</div>';

        // add total bonuses section
        html += this.createBonusSummaryHTML();

        return html;
    },

    // Create HTML for item bonuses
    getItemBonusesHTML(item) {
        if (!item || !item.bonuses) return '';

        const bonusEntries = Object.entries(item.bonuses);
        if (bonusEntries.length === 0) return '';

        return `<div class="item-bonuses">
            ${bonusEntries.slice(0, 3).map(([stat, value]) => `
                <span class="bonus ${value > 0 ? 'positive' : 'negative'}">
                    ${value > 0 ? '+' : ''}${value} ${stat}
                </span>
            `).join('')}
        </div>`;
    },

    // Create bonus summary HTML
    createBonusSummaryHTML() {
        const bonuses = this.getAllBonuses();
        const activeBonuses = Object.entries(bonuses).filter(([_, v]) => v !== 0);

        if (activeBonuses.length === 0) {
            return '<div class="bonus-summary"><p class="no-bonuses">No equipment bonuses active</p></div>';
        }

        return `
            <div class="bonus-summary">
                <h4>📊 Equipment Bonuses</h4>
                <div class="bonus-grid">
                    ${activeBonuses.map(([stat, value]) => `
                        <div class="bonus-item ${value > 0 ? 'positive' : 'negative'}">
                            <span class="bonus-stat">${this.formatStatName(stat)}</span>
                            <span class="bonus-value">${value > 0 ? '+' : ''}${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Format stat name for display
    formatStatName(stat) {
        const statNames = {
            attack: '⚔️ Attack',
            defense: '🛡️ Defense',
            damage: '💥 Damage',
            gathering: '⛏️ Gathering',
            crafting: '🔨 Crafting',
            luck: '🍀 Luck',
            speed: '💨 Speed',
            strength: '💪 Strength',
            intelligence: '🧠 Intelligence',
            charisma: '😊 Charisma',
            endurance: '🏃 Endurance',
            mining: '⛏️ Mining',
            woodcutting: '🪓 Woodcutting',
            fishing: '🎣 Fishing',
            farming: '🌾 Farming',
            carryCapacity: '🎒 Carry',
            tradingDiscount: '💰 Trading'
        };
        return statNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS - the boring but necessary bits
    // ═══════════════════════════════════════════════════════════════

    // Check if item is equippable
    isEquippable(itemId) {
        const slot = this.findSlotForItem(itemId);
        return slot !== null;
    },

    // Get equippable items from inventory
    getEquippableItems() {
        const equippable = [];

        // get inventory via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (!inventory || Object.keys(inventory).length === 0) return equippable;

        Object.keys(inventory).forEach(itemId => {
            if (this.isEquippable(itemId)) {
                const slot = this.findSlotForItem(itemId);
                equippable.push({
                    itemId: itemId,
                    item: ItemDatabase?.items?.[itemId],
                    slot: slot,
                    quantity: inventory[itemId]
                });
            }
        });

        return equippable;
    },

    // Save equipment state
    getEquipmentState() {
        return {
            equipment: { ...game.player.equipment }
        };
    },

    // Load equipment state
    loadEquipmentState(state) {
        if (state && state.equipment) {
            game.player.equipment = { ...state.equipment };
            // sync legacy
            game.player.equippedTool = state.equipment.tool || null;
            game.player.equippedWeapon = state.equipment.weapon || null;
            game.player.equippedArmor = state.equipment.body || null;
        }
    }
};

// Expose to window for onclick handlers
window.EquipmentSystem = EquipmentSystem;

// register with Bootstrap - dependencies ensure game.player exists
Bootstrap.register('EquipmentSystem', () => EquipmentSystem.init(), {
    dependencies: ['game', 'ItemDatabase', 'PanelManager'],
    priority: 97,
    severity: 'optional'
});

console.log('⚔️ equipment-system.js loaded - ready to arm your avatar');
