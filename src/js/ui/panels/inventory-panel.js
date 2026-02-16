// ═══════════════════════════════════════════════════════════════
// INVENTORY PANEL - item management interface
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const InventorySystem = {
    // Config - limits on our hoarding tendencies
    maxSlots: 20,
    maxWeight: 100,
    sortCriteria: 'name',
    filterCriteria: null,

    // Store dropdown close handlers for cleanup
    _dropdownCloseHandler: null,

    // Initialize - waking up the hoard
    init() {
        this.setupEventListeners();
        this.updateInventoryDisplay();
    },
    
    // Setup event listeners - listening for organizing impulses
    setupEventListeners() {
        // sorting - for the anxious organizers
        const sortBtn = document.getElementById('sort-inventory-btn');
        if (sortBtn) {
            EventManager.addEventListener(sortBtn, 'click', () => this.showSortOptions());
        }

        // filtering - finding the needle in the hoarder haystack
        const filterBtn = document.getElementById('filter-inventory-btn');
        if (filterBtn) {
            EventManager.addEventListener(filterBtn, 'click', () => this.showFilterOptions());
        }

        // settings - customizing the chaos
        const settingsBtn = document.getElementById('inventory-settings-btn');
        if (settingsBtn) {
            EventManager.addEventListener(settingsBtn, 'click', () => this.showInventorySettings());
        }

        // Event delegation for item action buttons - no more inline onclick garbage
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="use-item"]')) {
                const itemId = e.target.dataset.itemId;
                if (itemId && typeof InventorySystem !== 'undefined') {
                    InventorySystem.useItem(itemId);
                }
            }
            if (e.target.matches('[data-action="equip-item"]')) {
                const itemId = e.target.dataset.itemId;
                if (itemId && typeof EquipmentSystem !== 'undefined') {
                    EquipmentSystem.equip(itemId);
                }
            }
            if (e.target.matches('[data-action="sell-all-item"]')) {
                const itemId = e.target.dataset.itemId;
                if (itemId && typeof InventorySystem !== 'undefined') {
                    InventorySystem.quickSellAll(itemId);
                }
            }
        });

        // RIGHT-CLICK on inventory items - equip if equippable, use if consumable
        document.addEventListener('contextmenu', (e) => {
            const inventoryItem = e.target.closest('.inventory-item');
            if (inventoryItem) {
                // Find the item ID from the equip or use button inside this item
                const equipBtn = inventoryItem.querySelector('[data-action="equip-item"]');
                const useBtn = inventoryItem.querySelector('[data-action="use-item"]');

                if (equipBtn) {
                    e.preventDefault();
                    const itemId = equipBtn.dataset.itemId;
                    if (itemId && typeof EquipmentSystem !== 'undefined') {
                        EquipmentSystem.equip(itemId);
                    }
                } else if (useBtn) {
                    e.preventDefault();
                    const itemId = useBtn.dataset.itemId;
                    if (itemId) {
                        this.useItem(itemId);
                    }
                }
            }
        });
    },
    
    // Update inventory display - admiring our collection
    updateInventoryDisplay() {
        const inventoryContainer = document.getElementById('inventory-items');
        if (!inventoryContainer) return;

        inventoryContainer.innerHTML = '';

        // get inventory via PlayerStateManager or fallback
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (!inventory || Object.keys(inventory).length === 0) {
            inventoryContainer.innerHTML = '<p>Your inventory is empty.</p>';
            return;
        }

        // Safety check - ItemDatabase might not be loaded yet during early init
        if (typeof ItemDatabase === 'undefined') {
            console.warn('🎒 InventoryPanel: ItemDatabase not loaded yet, skipping update');
            inventoryContainer.innerHTML = '<p>Loading inventory...</p>';
            return;
        }

        let totalWeight = 0;
        let totalValue = 0;

        // INVENTORY ORDERING: Gold → Weather → Food → Water → Everything else
        const sortedItems = this._sortInventoryByPriority(Object.entries(inventory));

        for (const [itemId, quantity] of sortedItems) {
            if (quantity <= 0) continue;

            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;

            const weight = ItemDatabase.calculateWeight(itemId, quantity);
            const value = ItemDatabase.calculatePrice(itemId) * quantity;
            
            totalWeight += weight;
            totalValue += value;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';

            // check if item is equippable
            const isEquippable = typeof EquipmentSystem !== 'undefined' && EquipmentSystem.isEquippable(itemId);
            const equipSlot = isEquippable ? EquipmentSystem.findSlotForItem(itemId) : null;

            // check if item is currently equipped via PlayerStateManager or fallback
            const equippedItem = (typeof PlayerStateManager !== 'undefined' && equipSlot)
                ? PlayerStateManager.equipment.get(equipSlot)
                : (game.player.equipment?.[equipSlot] || null);
            const isEquipped = isEquippable && equippedItem === itemId;

            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}${isEquipped ? ' <span class="equipped-badge">✓</span>' : ''}</div>
                <div class="item-quantity">×${quantity}</div>
                <div class="item-weight">${weight.toFixed(1)} lbs</div>
                <div class="item-value">${value} gold</div>
                <div class="item-actions">
                    ${item.consumable ? `<button class="use-item-btn" data-action="use-item" title="Use this item" data-item-id="${itemId}">Use</button>` : ''}
                    ${isEquippable ? `<button class="equip-item-btn" data-action="equip-item" title="Equip this item" data-item-id="${itemId}">Equip</button>` : ''}
                    <button class="sell-all-btn" data-action="sell-all-item" data-item-id="${itemId}" title="Sell all ${quantity} for ~${value} gold">💰</button>
                </div>
            `;

            // show bonuses on hover if item has them (tooltip fallback)
            if (item.bonuses) {
                itemElement.title = Object.entries(item.bonuses)
                    .map(([stat, val]) => `${stat}: ${val > 0 ? '+' : ''}${val}`)
                    .join(', ');
            }

            // Add hover events for the item info panel
            itemElement.addEventListener('mouseenter', () => {
                this.updateHoverInfoPanel(itemId, quantity);
            });

            inventoryContainer.appendChild(itemElement);
        }
        
        // Update inventory info
        const goldDisplay = document.getElementById('inventory-gold');
        const weightDisplay = document.getElementById('inventory-weight');
        const valueDisplay = document.getElementById('inventory-value');

        // Gold tracker - shows player's current gold
        if (goldDisplay) {
            const playerGold = game.player?.gold || 0;
            goldDisplay.textContent = `💰 ${playerGold.toLocaleString()} gold`;
            // Color code based on wealth
            if (playerGold >= 10000) {
                goldDisplay.style.color = '#ffd700'; // Rich gold
            } else if (playerGold >= 1000) {
                goldDisplay.style.color = '#4fc3f7'; // Comfortable blue
            } else if (playerGold >= 100) {
                goldDisplay.style.color = '#ecf0f1'; // Normal white
            } else {
                goldDisplay.style.color = '#e74c3c'; // Poor red
            }
        }

        if (weightDisplay) {
            weightDisplay.textContent = `Weight: ${totalWeight.toFixed(1)}/${this.maxWeight} lbs`;
        }

        if (valueDisplay) {
            valueDisplay.textContent = `Value: ${totalValue} gold`;
        }
    },

    // INVENTORY PRIORITY SORTING - Gold → Weather → Food → Water → Everything else
    _sortInventoryByPriority(items) {
        // Priority groups (lower = higher priority)
        const getPriority = (itemId) => {
            const item = ItemDatabase?.getItem(itemId);
            const id = itemId.toLowerCase();
            const category = (item?.category || '').toLowerCase();
            const name = (item?.name || '').toLowerCase();

            // 0: Gold/Currency - ALWAYS first
            if (id === 'gold' || id.includes('coin') || category === 'currency') return 0;

            // 1: Weather gear - Protection from elements
            const weatherKeywords = ['cloak', 'coat', 'umbrella', 'hat', 'warm', 'hood', 'scarf', 'boots', 'gloves', 'rain', 'snow', 'weather'];
            if (weatherKeywords.some(k => id.includes(k) || name.includes(k))) return 1;

            // 2: Food - Sustenance items
            const foodKeywords = ['bread', 'meat', 'fish', 'cheese', 'fruit', 'vegetable', 'apple', 'berry', 'cake', 'pie', 'stew', 'soup', 'cooked', 'ration', 'jerky', 'pastry', 'honey'];
            if (foodKeywords.some(k => id.includes(k) || name.includes(k)) || category === 'food' || category === 'consumables') return 2;

            // 3: Water/Drinks - Hydration
            const drinkKeywords = ['water', 'ale', 'wine', 'mead', 'drink', 'potion', 'flask', 'bottle'];
            if (drinkKeywords.some(k => id.includes(k) || name.includes(k)) || category === 'drinks') return 3;

            // 4: Tools - Gathering/Crafting
            if (category === 'tools' || category === 'tool') return 4;

            // 5: Weapons - Combat
            if (category === 'weapons' || category === 'weapon') return 5;

            // 6: Armor - Protection
            if (category === 'armor' || category === 'equipment') return 6;

            // 7: Resources/Materials
            if (category === 'resources' || category === 'materials') return 7;

            // 8: Everything else
            return 8;
        };

        return items.sort((a, b) => {
            const priorityA = getPriority(a[0]);
            const priorityB = getPriority(b[0]);

            if (priorityA !== priorityB) return priorityA - priorityB;

            // Same priority - sort by name alphabetically
            const itemA = ItemDatabase?.getItem(a[0]);
            const itemB = ItemDatabase?.getItem(b[0]);
            return (itemA?.name || a[0]).localeCompare(itemB?.name || b[0]);
        });
    },

    // Update the hover info panel with item details
    updateHoverInfoPanel(itemId, quantity) {
        const item = ItemDatabase?.getItem(itemId);
        if (!item) return;

        // Get elements
        const iconEl = document.getElementById('hover-item-icon');
        const nameEl = document.getElementById('hover-item-name');
        const descEl = document.getElementById('hover-item-desc');
        const valueEl = document.getElementById('hover-item-value');
        const weightEl = document.getElementById('hover-item-weight');
        const categoryEl = document.getElementById('hover-item-category');
        const rarityEl = document.getElementById('hover-item-rarity');
        const bonusesEl = document.getElementById('hover-item-bonuses');

        // Update content
        if (iconEl) iconEl.textContent = item.icon || '📦';
        if (nameEl) nameEl.textContent = item.name || itemId;
        if (descEl) descEl.textContent = item.description || 'No description available.';

        // Calculate values
        const unitValue = ItemDatabase?.calculatePrice?.(itemId) || item.basePrice || 0;
        const totalValue = unitValue * quantity;
        const unitWeight = item.weight || 0;
        const totalWeight = ItemDatabase?.calculateWeight?.(itemId, quantity) || (unitWeight * quantity);

        if (valueEl) valueEl.textContent = `${unitValue}g each (${totalValue}g total)`;
        if (weightEl) weightEl.textContent = `${unitWeight} lbs (${totalWeight.toFixed(1)} lbs total)`;
        if (categoryEl) categoryEl.textContent = item.category || 'Misc';

        // Rarity with color
        if (rarityEl) {
            const rarity = item.rarity || 'common';
            const rarityColors = {
                common: '#888',
                uncommon: '#1eff00',
                rare: '#0070dd',
                epic: '#a335ee',
                legendary: '#ff8000'
            };
            rarityEl.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            rarityEl.style.color = rarityColors[rarity] || '#888';
        }

        // Bonuses
        if (bonusesEl) {
            if (item.bonuses && Object.keys(item.bonuses).length > 0) {
                const bonusText = Object.entries(item.bonuses)
                    .map(([stat, val]) => `${stat}: ${val > 0 ? '+' : ''}${val}`)
                    .join(' | ');
                bonusesEl.textContent = `Bonuses: ${bonusText}`;
                bonusesEl.classList.remove('hidden');
            } else if (item.effects) {
                // Show effects for consumables
                const effectText = typeof item.effects === 'object'
                    ? Object.entries(item.effects).map(([k, v]) => `${k}: ${v}`).join(' | ')
                    : item.effects;
                bonusesEl.textContent = `Effects: ${effectText}`;
                bonusesEl.classList.remove('hidden');
            } else {
                bonusesEl.classList.add('hidden');
            }
        }
    },

    // Sort inventory - enhanced with ascending/descending options
    sortInventory(criteria) {
        // get inventory via PlayerStateManager or fallback
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (!inventory || Object.keys(inventory).length === 0) return;

        const items = Object.entries(inventory);

        // Rarity order for sorting
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

        items.sort((a, b) => {
            const itemA = ItemDatabase?.getItem(a[0]);
            const itemB = ItemDatabase?.getItem(b[0]);

            if (!itemA || !itemB) return 0;

            switch (criteria) {
                case 'name':
                    return itemA.name.localeCompare(itemB.name);
                case 'name-desc':
                    return itemB.name.localeCompare(itemA.name);
                case 'value':
                    return (ItemDatabase.calculatePrice(b[0]) * b[1]) - (ItemDatabase.calculatePrice(a[0]) * a[1]);
                case 'value-asc':
                    return (ItemDatabase.calculatePrice(a[0]) * a[1]) - (ItemDatabase.calculatePrice(b[0]) * b[1]);
                case 'weight':
                    return ItemDatabase.calculateWeight(a[0], a[1]) - ItemDatabase.calculateWeight(b[0], b[1]);
                case 'weight-desc':
                    return ItemDatabase.calculateWeight(b[0], b[1]) - ItemDatabase.calculateWeight(a[0], a[1]);
                case 'quantity':
                    return a[1] - b[1];
                case 'quantity-desc':
                    return b[1] - a[1];
                case 'category':
                    return (itemA.category || '').localeCompare(itemB.category || '');
                case 'rarity':
                    return (rarityOrder[itemB.rarity] || 0) - (rarityOrder[itemA.rarity] || 0);
                default:
                    return 0;
            }
        });

        // Rebuild inventory object (preserving sort order)
        const sortedInventory = {};
        items.forEach(([itemId, quantity]) => {
            sortedInventory[itemId] = quantity;
        });

        // update inventory - direct write since this is a sort operation
        if (game.player) {
            game.player.inventory = sortedInventory;
        }

        this.updateInventoryDisplay();
    },
    
    // Use item
    useItem(itemId) {
        if (typeof game.useItem === 'function') {
            game.useItem(itemId);
        } else {
            const item = ItemDatabase.getItem(itemId);
            if (item && item.consumable) {
                // apply item effects to player stats
                const effects = ItemDatabase.getItemEffects(itemId);
                for (const [stat, value] of Object.entries(effects)) {
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.stats.add(stat, value, 'consumed_panel');
                    } else if (game.player.stats[stat] !== undefined) {
                        game.player.stats[stat] = Math.min(
                            game.player.stats[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || 100,
                            game.player.stats[stat] + value
                        );
                    }
                }

                // remove one item from inventory
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.remove(itemId, 1, 'consumed_panel');
                } else {
                    const newTotal = (game.player.inventory[itemId] || 0) - 1;
                    if (game.player.inventory[itemId] > 1) {
                        game.player.inventory[itemId]--;
                    } else {
                        delete game.player.inventory[itemId];
                    }

                    // EventBus fallback
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:removed', {
                            itemId: itemId,
                            quantity: 1,
                            newTotal: Math.max(0, newTotal),
                            reason: 'consumed_panel'
                        });
                    }
                }

                addMessage(`You used ${item.name}!`);
                updatePlayerStats();
                this.updateInventoryDisplay();
            }
        }
    },
    
    // Equip item
    equipItem(itemId) {
        const item = ItemDatabase.getItem(itemId);
        if (item && ItemDatabase.isTool(itemId)) {
            game.player.equippedTool = itemId;
            addMessage(`You equipped ${item.name}!`);
            this.updateInventoryDisplay();
        }
    },
    
    // Quick sell all of an item type
    quickSellAll(itemId) {
        // Get quantity via PlayerStateManager or fallback
        const quantity = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.getQuantity(itemId)
            : (game.player?.inventory?.[itemId] || 0);

        if (quantity <= 0) {
            if (typeof addMessage === 'function') {
                addMessage("You don't have any of that to sell!");
            }
            return;
        }

        const item = ItemDatabase?.getItem(itemId);
        if (!item) return;

        // Check if we're at a market location
        const currentLocation = (typeof GameWorld !== 'undefined' && typeof game !== 'undefined')
            ? GameWorld.locations?.[game.currentLocation?.id]
            : null;

        if (!currentLocation || !currentLocation.hasMarket) {
            if (typeof addMessage === 'function') {
                addMessage("You need to be at a market to sell items!", 'warning');
            }
            return;
        }

        // Calculate estimated value for confirmation
        const baseSellPrice = Math.round((ItemDatabase?.calculatePrice?.(itemId) || item.basePrice || 10) * 0.7);
        const estimatedTotal = baseSellPrice * quantity;

        // Use ModalSystem for confirmation
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '💰 Quick Sell',
                content: `<p>Sell <strong>${quantity} × ${item.name}</strong>?</p>
                          <p style="color: #4fc3f7;">Estimated: ~${estimatedTotal} gold</p>
                          <p style="color: #888; font-size: 12px;">(Final price depends on location & charisma)</p>`,
                buttons: [
                    {
                        label: '❌ Cancel',
                        type: 'secondary',
                        action: () => ModalSystem.hide()
                    },
                    {
                        label: '💰 Sell All',
                        type: 'primary',
                        action: () => {
                            // Sell all using the game's sellItem function
                            if (typeof sellItem === 'function') {
                                sellItem(itemId, quantity);
                            }
                            this.updateInventoryDisplay();
                            ModalSystem.hide();
                        }
                    }
                ]
            });
        } else {
            // Fallback - just sell directly
            if (typeof sellItem === 'function') {
                sellItem(itemId, quantity);
            }
            this.updateInventoryDisplay();
        }
    },

    // Drop item - FIXED: Use modal instead of browser confirm()
    dropItem(itemId) {
        // get quantity via PlayerStateManager or fallback
        const quantity = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.getQuantity(itemId)
            : (game.player?.inventory?.[itemId] || 0);

        if (quantity > 0) {
            const item = ItemDatabase.getItem(itemId);

            // Use ModalSystem instead of browser confirm
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '🗑️ Drop Item',
                    content: `<p>Are you sure you want to drop <strong>${quantity} × ${item.name}</strong>?</p><p style="color: #f44336; font-size: 12px;">This cannot be undone!</p>`,
                    buttons: [
                        {
                            label: '❌ Cancel',
                            type: 'secondary',
                            action: () => ModalSystem.hide()
                        },
                        {
                            label: '🗑️ Drop',
                            type: 'danger',
                            action: () => {
                                if (typeof PlayerStateManager !== 'undefined') {
                                    PlayerStateManager.inventory.set(itemId, 0, 'dropped');
                                } else {
                                    delete game.player.inventory[itemId];
                                    // EventBus fallback
                                    if (typeof EventBus !== 'undefined') {
                                        EventBus.emit('inventory:item:removed', {
                                            itemId: itemId,
                                            quantity: quantity,
                                            newTotal: 0,
                                            reason: 'dropped'
                                        });
                                    }
                                }
                                addMessage(`You dropped ${quantity} × ${item.name}!`);
                                this.updateInventoryDisplay();
                                ModalSystem.hide();
                            }
                        }
                    ]
                });
            } else {
                // fallback if ModalSystem not available
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.inventory.set(itemId, 0, 'dropped');
                } else {
                    delete game.player.inventory[itemId];
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('inventory:item:removed', {
                            itemId: itemId,
                            quantity: quantity,
                            newTotal: 0,
                            reason: 'dropped'
                        });
                    }
                }
                addMessage(`You dropped ${quantity} × ${item.name}!`);
                this.updateInventoryDisplay();
            }
        }
    },
    
    // Show sort options - full implementation
    showSortOptions() {
        // Remove existing dropdown if present
        const existing = document.getElementById('inventory-sort-dropdown');
        if (existing) {
            existing.remove();
            return;
        }

        const sortBtn = document.getElementById('sort-inventory-btn');
        if (!sortBtn) return;

        const dropdown = document.createElement('div');
        dropdown.id = 'inventory-sort-dropdown';
        dropdown.className = 'inventory-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">Sort By:</div>
            <button class="dropdown-item ${this.sortCriteria === 'name' ? 'active' : ''}" data-sort="name">📝 Name (A-Z)</button>
            <button class="dropdown-item ${this.sortCriteria === 'name-desc' ? 'active' : ''}" data-sort="name-desc">📝 Name (Z-A)</button>
            <button class="dropdown-item ${this.sortCriteria === 'value' ? 'active' : ''}" data-sort="value">💰 Value (High)</button>
            <button class="dropdown-item ${this.sortCriteria === 'value-asc' ? 'active' : ''}" data-sort="value-asc">💰 Value (Low)</button>
            <button class="dropdown-item ${this.sortCriteria === 'weight' ? 'active' : ''}" data-sort="weight">⚖️ Weight (Light)</button>
            <button class="dropdown-item ${this.sortCriteria === 'weight-desc' ? 'active' : ''}" data-sort="weight-desc">⚖️ Weight (Heavy)</button>
            <button class="dropdown-item ${this.sortCriteria === 'quantity' ? 'active' : ''}" data-sort="quantity">📦 Quantity (Low)</button>
            <button class="dropdown-item ${this.sortCriteria === 'quantity-desc' ? 'active' : ''}" data-sort="quantity-desc">📦 Quantity (High)</button>
            <button class="dropdown-item ${this.sortCriteria === 'category' ? 'active' : ''}" data-sort="category">📂 Category</button>
            <button class="dropdown-item ${this.sortCriteria === 'rarity' ? 'active' : ''}" data-sort="rarity">⭐ Rarity</button>
        `;

        // Position dropdown below button
        const rect = sortBtn.getBoundingClientRect();
        dropdown.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left}px;
            z-index: 600; /* Z-INDEX STANDARD: Panel overlays (dropdowns) */
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(79, 195, 247, 0.5);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 160px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        // Style dropdown items
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.style.cssText = `
                display: block;
                width: 100%;
                padding: 8px 16px;
                background: transparent;
                border: none;
                color: #ecf0f1;
                text-align: left;
                cursor: pointer;
                font-size: 13px;
            `;
            if (item.classList.contains('active')) {
                item.style.background = 'rgba(79, 195, 247, 0.2)';
                item.style.color = '#4fc3f7';
            }
        });

        const header = dropdown.querySelector('.dropdown-header');
        if (header) {
            header.style.cssText = `
                padding: 4px 16px 8px;
                color: #888;
                font-size: 11px;
                text-transform: uppercase;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                margin-bottom: 4px;
            `;
        }

        document.body.appendChild(dropdown);

        // Cleanup helper - removes dropdown and its close handler
        const cleanupDropdown = () => {
            if (this._dropdownCloseHandler) {
                document.removeEventListener('click', this._dropdownCloseHandler);
                this._dropdownCloseHandler = null;
            }
            dropdown.remove();
        };

        // Handle clicks
        dropdown.addEventListener('click', (e) => {
            const sortType = e.target.dataset?.sort;
            if (sortType) {
                this.sortCriteria = sortType;
                this.sortInventory(sortType);
                cleanupDropdown();
                if (typeof addMessage === 'function') {
                    addMessage(`📦 Inventory sorted by ${sortType.replace('-', ' ')}`, 'info');
                }
            }
        });

        // Close on outside click
        setTimeout(() => {
            this._dropdownCloseHandler = (e) => {
                if (!dropdown.contains(e.target) && e.target !== sortBtn) {
                    cleanupDropdown();
                }
            };
            document.addEventListener('click', this._dropdownCloseHandler);
        }, 10);
    },

    // Show filter options - full implementation
    showFilterOptions() {
        // Remove existing dropdown if present
        const existing = document.getElementById('inventory-filter-dropdown');
        if (existing) {
            existing.remove();
            return;
        }

        const filterBtn = document.getElementById('filter-inventory-btn');
        if (!filterBtn) return;

        // Get unique categories from inventory
        const categories = new Set(['all']);
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        for (const itemId of Object.keys(inventory)) {
            const item = ItemDatabase?.getItem(itemId);
            if (item?.category) categories.add(item.category);
        }

        const dropdown = document.createElement('div');
        dropdown.id = 'inventory-filter-dropdown';
        dropdown.className = 'inventory-dropdown';

        let filterHTML = `<div class="dropdown-header">Filter By Category:</div>`;

        const categoryIcons = {
            'all': '📦',
            'weapon': '⚔️',
            'armor': '🛡️',
            'consumable': '🧪',
            'food': '🍖',
            'material': '🪨',
            'tool': '🔧',
            'treasure': '💎',
            'misc': '📜',
            'trade_good': '📦',
            'equipment': '👕'
        };

        categories.forEach(cat => {
            const icon = categoryIcons[cat] || '📁';
            const isActive = (cat === 'all' && !this.filterCriteria) || this.filterCriteria === cat;
            filterHTML += `<button class="dropdown-item ${isActive ? 'active' : ''}" data-filter="${cat}">${icon} ${cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</button>`;
        });

        // Add rarity filters
        filterHTML += `
            <div class="dropdown-divider"></div>
            <div class="dropdown-header">Filter By Rarity:</div>
            <button class="dropdown-item" data-filter-rarity="common">⚪ Common</button>
            <button class="dropdown-item" data-filter-rarity="uncommon">🟢 Uncommon</button>
            <button class="dropdown-item" data-filter-rarity="rare">🔵 Rare</button>
            <button class="dropdown-item" data-filter-rarity="epic">🟣 Epic</button>
            <button class="dropdown-item" data-filter-rarity="legendary">🟠 Legendary</button>
        `;

        // Add search box
        filterHTML += `
            <div class="dropdown-divider"></div>
            <div class="dropdown-header">Search:</div>
            <input type="text" id="inventory-search" placeholder="Search items..." style="
                width: calc(100% - 32px);
                margin: 4px 16px;
                padding: 6px 10px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 4px;
                color: #fff;
                font-size: 13px;
            ">
        `;

        dropdown.innerHTML = filterHTML;

        // Position dropdown below button
        const rect = filterBtn.getBoundingClientRect();
        dropdown.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left}px;
            z-index: 600; /* Z-INDEX STANDARD: Panel overlays (dropdowns) */
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(79, 195, 247, 0.5);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 180px;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        // Style dropdown items
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.style.cssText = `
                display: block;
                width: 100%;
                padding: 8px 16px;
                background: transparent;
                border: none;
                color: #ecf0f1;
                text-align: left;
                cursor: pointer;
                font-size: 13px;
            `;
            if (item.classList.contains('active')) {
                item.style.background = 'rgba(79, 195, 247, 0.2)';
                item.style.color = '#4fc3f7';
            }
        });

        dropdown.querySelectorAll('.dropdown-header').forEach(header => {
            header.style.cssText = `
                padding: 4px 16px 8px;
                color: #888;
                font-size: 11px;
                text-transform: uppercase;
            `;
        });

        dropdown.querySelectorAll('.dropdown-divider').forEach(div => {
            div.style.cssText = `
                height: 1px;
                background: rgba(255,255,255,0.1);
                margin: 8px 0;
            `;
        });

        document.body.appendChild(dropdown);

        // Cleanup helper - removes dropdown and its close handler
        const cleanupDropdown = () => {
            if (this._dropdownCloseHandler) {
                document.removeEventListener('click', this._dropdownCloseHandler);
                this._dropdownCloseHandler = null;
            }
            dropdown.remove();
        };

        // Handle category filter clicks
        dropdown.addEventListener('click', (e) => {
            const filterCat = e.target.dataset?.filter;
            const filterRarity = e.target.dataset?.filterRarity;

            if (filterCat) {
                this.filterCriteria = filterCat === 'all' ? null : filterCat;
                this.filterType = 'category';
                this.applyFilter();
                cleanupDropdown();
                if (typeof addMessage === 'function') {
                    addMessage(`📦 Showing ${filterCat === 'all' ? 'all items' : filterCat + ' items'}`, 'info');
                }
            } else if (filterRarity) {
                this.filterCriteria = filterRarity;
                this.filterType = 'rarity';
                this.applyFilter();
                cleanupDropdown();
                if (typeof addMessage === 'function') {
                    addMessage(`📦 Showing ${filterRarity} items`, 'info');
                }
            }
        });

        // Handle search input
        const searchInput = dropdown.querySelector('#inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFilter = e.target.value.toLowerCase();
                this.filterType = 'search';
                this.applyFilter();
            });
            searchInput.addEventListener('keydown', (e) => {
                e.stopPropagation(); // Prevent game hotkeys
            });
        }

        // Close on outside click
        setTimeout(() => {
            this._dropdownCloseHandler = (e) => {
                if (!dropdown.contains(e.target) && e.target !== filterBtn) {
                    cleanupDropdown();
                }
            };
            document.addEventListener('click', this._dropdownCloseHandler);
        }, 10);
    },

    // Apply current filter to inventory display
    applyFilter() {
        const inventoryContainer = document.getElementById('inventory-items');
        if (!inventoryContainer) return;

        // get inventory via PlayerStateManager or fallback
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        if (!inventory || Object.keys(inventory).length === 0) return;

        inventoryContainer.innerHTML = '';

        let totalWeight = 0;
        let totalValue = 0;
        let visibleCount = 0;

        for (const [itemId, quantity] of Object.entries(inventory)) {
            if (quantity <= 0) continue;

            const item = ItemDatabase?.getItem(itemId);
            if (!item) continue;

            // Apply filters
            let showItem = true;

            if (this.filterType === 'category' && this.filterCriteria) {
                showItem = item.category === this.filterCriteria;
            } else if (this.filterType === 'rarity' && this.filterCriteria) {
                showItem = item.rarity === this.filterCriteria;
            } else if (this.filterType === 'search' && this.searchFilter) {
                showItem = item.name.toLowerCase().includes(this.searchFilter) ||
                           (item.description && item.description.toLowerCase().includes(this.searchFilter));
            }

            if (!showItem) continue;

            visibleCount++;
            const weight = ItemDatabase.calculateWeight(itemId, quantity);
            const value = ItemDatabase.calculatePrice(itemId) * quantity;

            totalWeight += weight;
            totalValue += value;

            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';

            const isEquippable = typeof EquipmentSystem !== 'undefined' && EquipmentSystem.isEquippable(itemId);
            const equipSlot = isEquippable ? EquipmentSystem.findSlotForItem(itemId) : null;
            const equippedItem = (typeof PlayerStateManager !== 'undefined' && equipSlot)
                ? PlayerStateManager.equipment.get(equipSlot)
                : (game.player.equipment?.[equipSlot] || null);
            const isEquipped = isEquippable && equippedItem === itemId;

            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}${isEquipped ? ' <span class="equipped-badge">✓</span>' : ''}</div>
                <div class="item-quantity">×${quantity}</div>
                <div class="item-weight">${weight.toFixed(1)} lbs</div>
                <div class="item-value">${value} gold</div>
                <div class="item-actions">
                    ${item.consumable ? `<button class="use-item-btn" data-action="use-item" title="Use this item" data-item-id="${itemId}">Use</button>` : ''}
                    ${isEquippable ? `<button class="equip-item-btn" data-action="equip-item" title="Equip this item" data-item-id="${itemId}">Equip</button>` : ''}
                    <button class="sell-all-btn" data-action="sell-all-item" data-item-id="${itemId}" title="Sell all ${quantity} for ~${value} gold">💰</button>
                </div>
            `;

            if (item.bonuses) {
                itemElement.title = Object.entries(item.bonuses)
                    .map(([stat, val]) => `${stat}: ${val > 0 ? '+' : ''}${val}`)
                    .join(', ');
            }

            inventoryContainer.appendChild(itemElement);
        }

        // Show "no items" message if filter returns nothing
        if (visibleCount === 0) {
            inventoryContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No items match your filter.</p>';
        }

        // Update totals
        const weightDisplay = document.getElementById('inventory-weight');
        const valueDisplay = document.getElementById('inventory-value');

        if (weightDisplay) {
            weightDisplay.textContent = `Weight: ${totalWeight.toFixed(1)}/${this.maxWeight} lbs`;
        }
        if (valueDisplay) {
            valueDisplay.textContent = `Value: ${totalValue} gold`;
        }
    },

    // Clear all filters
    clearFilters() {
        this.filterCriteria = null;
        this.filterType = null;
        this.searchFilter = null;
        this.updateInventoryDisplay();
        if (typeof addMessage === 'function') {
            addMessage('📦 Filters cleared', 'info');
        }
    },
    
    // Show inventory settings - redirect to main settings panel
    showInventorySettings() {
        if (typeof SettingsPanel !== 'undefined' && SettingsPanel.show) {
            SettingsPanel.show();
        } else {
            addMessage('settings panel loading... try again in a moment');
        }
    },
    
    // Save inventory state for save system
    getInventoryState() {
        return {
            maxSlots: this.maxSlots,
            maxWeight: this.maxWeight,
            sortCriteria: this.sortCriteria,
            filterCriteria: this.filterCriteria
        };
    },
    
    // Load inventory state from save system
    loadInventoryState(state) {
        if (state) {
            this.maxSlots = state.maxSlots || 20;
            this.maxWeight = state.maxWeight || 100;
            this.sortCriteria = state.sortCriteria || 'name';
            this.filterCriteria = state.filterCriteria || null;
        }
    }
};

// register with Bootstrap
Bootstrap.register('InventorySystem', () => InventorySystem.init(), {
    dependencies: ['game', 'ItemDatabase', 'PanelManager'],
    priority: 96,
    severity: 'optional'
});