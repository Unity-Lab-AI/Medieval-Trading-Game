// ═══════════════════════════════════════════════════════════════
// PROPERTY STORAGE - hoarding made easy in the shadows
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyStorage = {
    // Sanitize or die - XSS is my enemy
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    },

    // Give this property a vault for hoarding your shit
    initialize(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // Firefox is a needy bitch - can't handle ??= operator
        if (!property.storage) property.storage = {};

        const propertyType = PropertyTypes.get(property.type);
        let capacity = propertyType.storageBonus || 0;

        // Expansions let you hoard even more useless crap
        if (property.upgrades.includes('expansion')) {
            capacity *= 1.5;
        }

        property.storageCapacity = capacity;
        property.storageUsed = this.calculateUsed(propertyId);

        return true;
    },

    // See how much of your vault is already rotting with inventory
    calculateUsed(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.storage) return 0;

        let totalWeight = 0;
        for (const [itemId, quantity] of Object.entries(property.storage)) {
            if (typeof ItemDatabase !== 'undefined') {
                totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
            } else {
                // If ItemDatabase is dead, just assume 1 lb per item - crude but it works
                totalWeight += quantity * 1;
            }
        }

        return totalWeight;
    },

    // How much can you cram into this vault before it bursts
    getCapacity(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        if (property.storageCapacity === undefined) {
            this.initialize(propertyId);
        }

        return property.storageCapacity;
    },

    // How much dead weight is already rotting in here
    getUsed(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        if (property.storageUsed === undefined) {
            property.storageUsed = this.calculateUsed(propertyId);
        }

        return property.storageUsed;
    },

    // How much room left before you're drowning in crap
    getAvailable(propertyId) {
        return this.getCapacity(propertyId) - this.getUsed(propertyId);
    },

    // Cram more items into your property's vault
    add(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        if (!property.storage) this.initialize(propertyId);

        // Make sure there's room for this shit
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        if (this.getUsed(propertyId) + itemWeight > this.getCapacity(propertyId)) {
            addMessage(`Not enough storage space in ${property.locationName || 'property'}!`);
            return false;
        }

        // Pile it in with the rest of the hoard
        if (!property.storage[itemId]) property.storage[itemId] = 0;
        property.storage[itemId] += quantity;
        property.storageUsed += itemWeight;

        return true;
    },

    // Yank items out of your vault
    remove(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.storage) return false;

        // Make sure you actually have enough to take
        if (!property.storage[itemId] || property.storage[itemId] < quantity) {
            addMessage(`${property.locationName || 'Property'} doesn't have enough ${itemId}!`);
            return false;
        }

        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        // Rip it out of the hoard
        property.storage[itemId] -= quantity;
        if (property.storage[itemId] <= 0) {
            delete property.storage[itemId];
        }

        property.storageUsed -= itemWeight;

        return true;
    },

    // Move your shit from one vault to another
    transferBetweenProperties(fromPropertyId, toPropertyId, itemId, quantity) {
        const fromProperty = PropertySystem.getProperty(fromPropertyId);
        const toProperty = PropertySystem.getProperty(toPropertyId);

        if (!fromProperty || !toProperty) return false;

        // Make sure the source actually has what you want
        if (!fromProperty.storage || !fromProperty.storage[itemId] ||
            fromProperty.storage[itemId] < quantity) {
            addMessage(`${fromProperty.locationName || 'Source property'} doesn't have enough ${itemId}!`);
            return false;
        }

        // Make sure the destination has room for your crap
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        if (this.getUsed(toPropertyId) + itemWeight > this.getCapacity(toPropertyId)) {
            addMessage(`Not enough storage space in ${toProperty.locationName || 'destination property'}!`);
            return false;
        }

        // Move the goods from A to B
        this.remove(fromPropertyId, itemId, quantity);
        this.add(toPropertyId, itemId, quantity);

        const fromType = PropertyTypes.get(fromProperty.type);
        const toType = PropertyTypes.get(toProperty.type);
        addMessage(`Transferred ${quantity} ${itemId} from ${fromType?.name} to ${toType?.name}!`);

        return true;
    },

    // Take shit from your vault and shove it in your pockets
    transferToPlayer(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // Make sure the vault has what you're trying to steal from it
        if (!property.storage || !property.storage[itemId] ||
            property.storage[itemId] < quantity) {
            addMessage(`Not enough ${itemId} in storage!`);
            return false;
        }

        // Make sure you can actually carry this shit
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        const transport = typeof transportationOptions !== 'undefined' ?
            transportationOptions[game.player.transportation] : { carryCapacity: 100 };

        if (typeof calculateCurrentLoad === 'function' &&
            calculateCurrentLoad() + itemWeight > transport.carryCapacity) {
            addMessage(`Not enough carrying capacity! Need ${itemWeight} lbs more.`);
            return false;
        }

        // Take from vault, stuff in pockets
        this.remove(propertyId, itemId, quantity);

        // Use modern state management if it exists, otherwise raw mutation like savages
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(itemId, quantity, 'property_withdraw');
        } else {
            if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
            game.player.inventory[itemId] += quantity;

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: game.player.inventory[itemId],
                    reason: 'property_withdraw'
                });
            }
        }

        if (typeof updateCurrentLoad === 'function') updateCurrentLoad();

        addMessage(`Took ${quantity} ${itemId} from ${property.locationName || 'property'} storage!`);

        // Refresh the UI so you can see what's left
        this.updateDisplay(propertyId);
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();

        return true;
    },

    // Shove shit from your pockets into the vault
    transferFromPlayer(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // Make sure you actually have this shit in your inventory
        const playerQty = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.getQuantity(itemId)
            : (game.player?.inventory?.[itemId] || 0);

        if (playerQty < quantity) {
            addMessage(`You don't have enough ${itemId}!`);
            return false;
        }

        // Add to vault, remove from pockets
        if (!this.add(propertyId, itemId, quantity)) return false;

        // Use modern state management if it exists, otherwise raw mutation like savages
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.remove(itemId, quantity, 'property_deposit');
        } else {
            game.player.inventory[itemId] -= quantity;
            const newTotal = game.player.inventory[itemId] || 0;
            if (game.player.inventory[itemId] <= 0) {
                delete game.player.inventory[itemId];
            }

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:removed', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: newTotal,
                    reason: 'property_deposit'
                });
            }
        }

        if (typeof updateCurrentLoad === 'function') updateCurrentLoad();

        addMessage(`Stored ${quantity} ${itemId} in ${property.locationName || 'property'}!`);

        // Refresh the UI so you can see your growing hoard
        this.updateDisplay(propertyId);
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();

        return true;
    },

    // get all items stored across all properties
    getAllStoredItems() {
        const allItems = {};

        game.player.ownedProperties.forEach(property => {
            if (property.storage) {
                for (const [itemId, quantity] of Object.entries(property.storage)) {
                    if (!allItems[itemId]) allItems[itemId] = 0;
                    allItems[itemId] += quantity;
                }
            }
        });

        return allItems;
    },

    // find properties that contain a specific item
    findPropertiesWithItem(itemId) {
        const properties = [];

        game.player.ownedProperties.forEach(property => {
            if (property.storage && property.storage[itemId] && property.storage[itemId] > 0) {
                const propertyType = PropertyTypes.get(property.type);
                properties.push({
                    id: property.id,
                    name: propertyType?.name,
                    location: property.location,
                    quantity: property.storage[itemId]
                });
            }
        });

        return properties;
    },

    // auto-store produced items from work queues
    autoStoreProducedItems(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.totalProduction) return;

        for (const [itemId, quantity] of Object.entries(property.totalProduction)) {
            if (quantity > 0) {
                // try to store in the property first
                if (!this.add(propertyId, itemId, quantity)) {
                    // try other properties
                    const otherProperties = game.player.ownedProperties.filter(p => p.id !== propertyId);
                    let stored = false;

                    for (const otherProperty of otherProperties) {
                        if (this.add(otherProperty.id, itemId, quantity)) {
                            const otherType = PropertyTypes.get(otherProperty.type);
                            addMessage(`${quantity} ${itemId} auto-stored in ${otherType?.name}!`);
                            stored = true;
                            break;
                        }
                    }

                    // fallback to player inventory
                    if (!stored) {
                        // Use modern state management if it exists, otherwise raw mutation like savages
                        if (typeof PlayerStateManager !== 'undefined') {
                            PlayerStateManager.inventory.add(itemId, quantity, 'property_overflow');
                        } else {
                            if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
                            game.player.inventory[itemId] += quantity;

                            if (typeof EventBus !== 'undefined') {
                                EventBus.emit('inventory:item:added', {
                                    itemId: itemId,
                                    quantity: quantity,
                                    newTotal: game.player.inventory[itemId],
                                    reason: 'property_overflow'
                                });
                            }
                        }

                        addMessage(`${quantity} ${itemId} added to your inventory (no storage available)!`);
                    }
                }

                property.totalProduction[itemId] = 0;
            }
        }
    },

    // update storage display
    updateDisplay(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;

        const storageContainer = document.getElementById(`property-storage-${propertyId}`);
        if (!storageContainer) return;

        storageContainer.innerHTML = '';

        if (!property.storage || Object.keys(property.storage).length === 0) {
            storageContainer.innerHTML = '<p class="empty-message">No items stored.</p>';
            return;
        }

        for (const [itemId, quantity] of Object.entries(property.storage)) {
            const itemElement = document.createElement('div');
            itemElement.className = 'storage-item';

            let itemName = itemId;
            let itemIcon = '📦';

            if (typeof ItemDatabase !== 'undefined') {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    itemName = item.name;
                    itemIcon = item.icon;
                }
            }

            // using data attributes to prevent XSS - no inline onclick
            const safePropertyId = this.escapeHtml(propertyId);
            const safeItemId = this.escapeHtml(itemId);
            const safeItemName = this.escapeHtml(itemName);
            itemElement.innerHTML = `
                <div class="storage-item-icon">${itemIcon}</div>
                <div class="storage-item-name">${safeItemName}</div>
                <div class="storage-item-quantity">×${quantity}</div>
                <button class="storage-item-btn" data-action="take" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="1">Take 1</button>
                <button class="storage-item-btn" data-action="take" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="${Math.min(10, quantity)}">Take 10</button>
                <button class="storage-item-btn" data-action="take" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="${quantity}">Take All</button>
            `;
            // attach event listeners safely
            itemElement.querySelectorAll('.storage-item-btn[data-action="take"]').forEach(btn => {
                btn.onclick = () => this.transferToPlayer(btn.dataset.property, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            storageContainer.appendChild(itemElement);
        }

        // update storage info bar
        const storageInfo = document.getElementById(`property-storage-info-${propertyId}`);
        if (storageInfo) {
            const used = this.getUsed(propertyId);
            const capacity = this.getCapacity(propertyId);
            const percentage = capacity > 0 ? (used / capacity) * 100 : 0;

            storageInfo.innerHTML = `
                <div class="storage-info">
                    <span>Storage: ${used}/${capacity} lbs</span>
                    <div class="storage-bar">
                        <div class="storage-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
    },

    // update transfer display
    updateTransferDisplay(propertyId) {
        const transferContainer = document.getElementById(`property-transfer-${propertyId}`);
        if (!transferContainer) return;

        transferContainer.innerHTML = `
            <div class="transfer-section">
                <h4>Transfer from Player Inventory</h4>
                <div class="transfer-items" id="transfer-from-inventory-${propertyId}"></div>
            </div>
            <div class="transfer-section">
                <h4>Transfer Between Properties</h4>
                <div class="property-selector">
                    <select id="transfer-property-select-${propertyId}">
                        <option value="">Select destination property...</option>
                    </select>
                </div>
                <div class="transfer-items" id="transfer-between-properties-${propertyId}"></div>
            </div>
        `;

        this._populateTransferFromInventory(propertyId);
        this._populatePropertySelector(propertyId);
    },

    // populate transfer from inventory
    _populateTransferFromInventory(propertyId) {
        const container = document.getElementById(`transfer-from-inventory-${propertyId}`);
        if (!container) return;

        // get inventory via PlayerStateManager
        const inventory = (typeof PlayerStateManager !== 'undefined')
            ? PlayerStateManager.inventory.get()
            : (game.player?.inventory || {});

        container.innerHTML = '';

        if (!inventory || Object.keys(inventory).length === 0) {
            container.innerHTML = '<p>Your inventory is empty.</p>';
            return;
        }

        for (const [itemId, quantity] of Object.entries(inventory)) {
            if (quantity <= 0) continue;

            let itemName = itemId;
            let itemIcon = '📦';

            if (typeof ItemDatabase !== 'undefined') {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    itemName = item.name;
                    itemIcon = item.icon;
                }
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'transfer-item';
            // using data attributes to prevent XSS - no inline onclick
            const safePropertyId = this.escapeHtml(propertyId);
            const safeItemId = this.escapeHtml(itemId);
            const safeItemName = this.escapeHtml(itemName);
            itemElement.innerHTML = `
                <div class="transfer-item-icon">${itemIcon}</div>
                <div class="transfer-item-name">${safeItemName}</div>
                <div class="transfer-item-quantity">×${quantity}</div>
                <button class="transfer-btn" data-action="store" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="1">Store 1</button>
                <button class="transfer-btn" data-action="store" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="${Math.min(10, quantity)}">Store 10</button>
                <button class="transfer-btn" data-action="store" data-property="${safePropertyId}" data-item="${safeItemId}" data-qty="${quantity}">Store All</button>
            `;
            // attach event listeners safely
            itemElement.querySelectorAll('.transfer-btn[data-action="store"]').forEach(btn => {
                btn.onclick = () => this.transferFromPlayer(btn.dataset.property, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            container.appendChild(itemElement);
        }
    },

    // populate property selector
    _populatePropertySelector(propertyId) {
        const selector = document.getElementById(`transfer-property-select-${propertyId}`);
        if (!selector) return;

        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }

        game.player.ownedProperties.forEach(property => {
            if (property.id !== propertyId) {
                const propertyType = PropertyTypes.get(property.type);
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${propertyType?.name} (${property.locationName})`;
                selector.appendChild(option);
            }
        });

        if (typeof EventManager !== 'undefined') {
            EventManager.addEventListener(selector, 'change', () => {
                const selectedPropertyId = selector.value;
                if (selectedPropertyId) {
                    this._populateTransferBetweenProperties(propertyId, selectedPropertyId);
                }
            });
        }
    },

    // populate transfer between properties
    _populateTransferBetweenProperties(fromPropertyId, toPropertyId) {
        const container = document.getElementById(`transfer-between-properties-${fromPropertyId}`);
        if (!container) return;

        const fromProperty = PropertySystem.getProperty(fromPropertyId);
        if (!fromProperty || !fromProperty.storage) {
            container.innerHTML = '<p>No items to transfer.</p>';
            return;
        }

        container.innerHTML = '';

        if (Object.keys(fromProperty.storage).length === 0) {
            container.innerHTML = '<p>No items to transfer.</p>';
            return;
        }

        for (const [itemId, quantity] of Object.entries(fromProperty.storage)) {
            if (quantity <= 0) continue;

            let itemName = itemId;
            let itemIcon = '📦';

            if (typeof ItemDatabase !== 'undefined') {
                const item = ItemDatabase.getItem(itemId);
                if (item) {
                    itemName = item.name;
                    itemIcon = item.icon;
                }
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'transfer-item';
            // using data attributes to prevent XSS - no inline onclick
            const safeFromId = this.escapeHtml(fromPropertyId);
            const safeToId = this.escapeHtml(toPropertyId);
            const safeItemId = this.escapeHtml(itemId);
            const safeItemName = this.escapeHtml(itemName);
            itemElement.innerHTML = `
                <div class="transfer-item-icon">${itemIcon}</div>
                <div class="transfer-item-name">${safeItemName}</div>
                <div class="transfer-item-quantity">×${quantity}</div>
                <button class="transfer-btn" data-action="transfer" data-from="${safeFromId}" data-to="${safeToId}" data-item="${safeItemId}" data-qty="1">Transfer 1</button>
                <button class="transfer-btn" data-action="transfer" data-from="${safeFromId}" data-to="${safeToId}" data-item="${safeItemId}" data-qty="${Math.min(10, quantity)}">Transfer 10</button>
                <button class="transfer-btn" data-action="transfer" data-from="${safeFromId}" data-to="${safeToId}" data-item="${safeItemId}" data-qty="${quantity}">Transfer All</button>
            `;
            // attach event listeners safely
            itemElement.querySelectorAll('.transfer-btn[data-action="transfer"]').forEach(btn => {
                btn.onclick = () => this.transferBetweenProperties(btn.dataset.from, btn.dataset.to, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            container.appendChild(itemElement);
        }
    },

    // switch storage tab
    switchTab(propertyId, tab) {
        const storedTab = document.querySelector(`#property-storage-${propertyId}`);
        const transferTab = document.querySelector(`#property-transfer-${propertyId}`);
        const tabButtons = document.querySelectorAll(`.storage-tab`);

        if (storedTab) storedTab.classList.add('hidden');
        if (transferTab) transferTab.classList.add('hidden');

        tabButtons.forEach(btn => btn.classList.remove('active'));

        if (tab === 'stored') {
            if (storedTab) storedTab.classList.remove('hidden');
            tabButtons[0]?.classList.add('active');
        } else if (tab === 'transfer') {
            if (transferTab) transferTab.classList.remove('hidden');
            tabButtons[1]?.classList.add('active');
            this.updateTransferDisplay(propertyId);
        }
    }
};

// expose to global scope
window.PropertyStorage = PropertyStorage;
