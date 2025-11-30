// ═══════════════════════════════════════════════════════════════
// 🎒 INVENTORY SYSTEM - hoarding simulator 3000
// ═══════════════════════════════════════════════════════════════
// where we store all the junk we cant let go of... i relate
// File Version: GameConfig.version.file
// Game Version: 0.2
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const InventorySystem = {
    // ⚙️ Config - limits on our hoarding tendencies
    maxSlots: 20,
    maxWeight: 100,
    sortCriteria: 'name',
    filterCriteria: null,
    
    // 🌙 Initialize - waking up the hoard
    init() {
        this.setupEventListeners();
        this.updateInventoryDisplay();
    },
    
    // 👂 Setup event listeners - listening for organizing impulses
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
    },
    
    // 📦 Update inventory display - admiring our collection
    updateInventoryDisplay() {
        const inventoryContainer = document.getElementById('inventory-items');
        if (!inventoryContainer) return;
        
        inventoryContainer.innerHTML = '';
        
        if (!game.player || !game.player.inventory) {
            inventoryContainer.innerHTML = '<p>Your inventory is empty.</p>';
            return;
        }
        
        let totalWeight = 0;
        let totalValue = 0;
        
        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
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

            // check if item is currently equipped
            const isEquipped = isEquippable && game.player.equipment?.[equipSlot] === itemId;

            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}${isEquipped ? ' <span class="equipped-badge">✓</span>' : ''}</div>
                <div class="item-quantity">×${quantity}</div>
                <div class="item-weight">${weight.toFixed(1)} lbs</div>
                <div class="item-value">${value} gold</div>
                <div class="item-actions">
                    ${item.consumable ? `<button class="use-item-btn" onclick="InventorySystem.useItem('${itemId}')">Use</button>` : ''}
                    ${isEquippable ? `<button class="equip-item-btn" onclick="EquipmentSystem.equip('${itemId}')">Equip</button>` : ''}
                </div>
            `;

            // show bonuses on hover if item has them
            if (item.bonuses) {
                itemElement.title = Object.entries(item.bonuses)
                    .map(([stat, val]) => `${stat}: ${val > 0 ? '+' : ''}${val}`)
                    .join(', ');
            }

            inventoryContainer.appendChild(itemElement);
        }
        
        // Update inventory info
        const weightDisplay = document.getElementById('inventory-weight');
        const valueDisplay = document.getElementById('inventory-value');
        
        if (weightDisplay) {
            weightDisplay.textContent = `Weight: ${totalWeight.toFixed(1)}/${this.maxWeight} lbs`;
        }
        
        if (valueDisplay) {
            valueDisplay.textContent = `Value: ${totalValue} gold`;
        }
    },
    
    // Sort inventory - enhanced with ascending/descending options
    sortInventory(criteria) {
        if (!game.player || !game.player.inventory) return;

        const items = Object.entries(game.player.inventory);

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
        game.player.inventory = sortedInventory;

        this.updateInventoryDisplay();
    },
    
    // Use item
    useItem(itemId) {
        if (typeof game.useItem === 'function') {
            game.useItem(itemId);
        } else {
            const item = ItemDatabase.getItem(itemId);
            if (item && item.consumable) {
                // Apply item effects
                const effects = ItemDatabase.getItemEffects(itemId);
                for (const [stat, value] of Object.entries(effects)) {
                    if (game.player.stats[stat] !== undefined) {
                        game.player.stats[stat] = Math.min(
                            game.player.stats[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || 100,
                            game.player.stats[stat] + value
                        );
                    }
                }
                
                // Remove one item from inventory
                if (game.player.inventory[itemId] > 1) {
                    game.player.inventory[itemId]--;
                } else {
                    delete game.player.inventory[itemId];
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
    
    // Drop item
    dropItem(itemId) {
        if (game.player.inventory[itemId] > 0) {
            const item = ItemDatabase.getItem(itemId);
            const quantity = game.player.inventory[itemId];
            
            if (confirm(`Are you sure you want to drop ${quantity} × ${item.name}?`)) {
                delete game.player.inventory[itemId];
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

        // Handle clicks
        dropdown.addEventListener('click', (e) => {
            const sortType = e.target.dataset?.sort;
            if (sortType) {
                this.sortCriteria = sortType;
                this.sortInventory(sortType);
                dropdown.remove();
                if (typeof addMessage === 'function') {
                    addMessage(`📦 Inventory sorted by ${sortType.replace('-', ' ')}`, 'info');
                }
            }
        });

        // Close on outside click
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!dropdown.contains(e.target) && e.target !== sortBtn) {
                    dropdown.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
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
        if (game.player?.inventory) {
            for (const itemId of Object.keys(game.player.inventory)) {
                const item = ItemDatabase?.getItem(itemId);
                if (item?.category) categories.add(item.category);
            }
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

        // Handle category filter clicks
        dropdown.addEventListener('click', (e) => {
            const filterCat = e.target.dataset?.filter;
            const filterRarity = e.target.dataset?.filterRarity;

            if (filterCat) {
                this.filterCriteria = filterCat === 'all' ? null : filterCat;
                this.filterType = 'category';
                this.applyFilter();
                dropdown.remove();
                if (typeof addMessage === 'function') {
                    addMessage(`📦 Showing ${filterCat === 'all' ? 'all items' : filterCat + ' items'}`, 'info');
                }
            } else if (filterRarity) {
                this.filterCriteria = filterRarity;
                this.filterType = 'rarity';
                this.applyFilter();
                dropdown.remove();
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
            const closeHandler = (e) => {
                if (!dropdown.contains(e.target) && e.target !== filterBtn) {
                    dropdown.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    },

    // Apply current filter to inventory display
    applyFilter() {
        const inventoryContainer = document.getElementById('inventory-items');
        if (!inventoryContainer || !game.player?.inventory) return;

        inventoryContainer.innerHTML = '';

        let totalWeight = 0;
        let totalValue = 0;
        let visibleCount = 0;

        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
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
            const isEquipped = isEquippable && game.player.equipment?.[equipSlot] === itemId;

            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}${isEquipped ? ' <span class="equipped-badge">✓</span>' : ''}</div>
                <div class="item-quantity">×${quantity}</div>
                <div class="item-weight">${weight.toFixed(1)} lbs</div>
                <div class="item-value">${value} gold</div>
                <div class="item-actions">
                    ${item.consumable ? `<button class="use-item-btn" onclick="InventorySystem.useItem('${itemId}')">Use</button>` : ''}
                    ${isEquippable ? `<button class="equip-item-btn" onclick="EquipmentSystem.equip('${itemId}')">Equip</button>` : ''}
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

// Initialize inventory system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            InventorySystem.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        InventorySystem.init();
    }, 100);
}