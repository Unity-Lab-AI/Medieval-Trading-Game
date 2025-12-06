// ═══════════════════════════════════════════════════════════════
// PROPERTY STORAGE - hoarding made easy in the shadows
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyStorage = {
    // 🖤 Escape HTML to prevent XSS attacks - dark magic for security
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    },

    // 🏠 Initialize storage for a property ⚰️
    initialize(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // 🖤💀 FIXED: Firefox compatibility - don't use ??= 💀
        if (!property.storage) property.storage = {};

        const propertyType = PropertyTypes.get(property.type);
        let capacity = propertyType.storageBonus || 0;

        // 📏 Expansion upgrade bonus 🦇
        if (property.upgrades.includes('expansion')) {
            capacity *= 1.5;
        }

        property.storageCapacity = capacity;
        property.storageUsed = this.calculateUsed(propertyId);

        return true;
    },

    // 📊 Calculate storage used 🗡️
    calculateUsed(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.storage) return 0;

        let totalWeight = 0;
        for (const [itemId, quantity] of Object.entries(property.storage)) {
            if (typeof ItemDatabase !== 'undefined') {
                totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
            } else {
                // 🖤 Fallback: 1 unit weight per item when ItemDatabase unavailable 💀
                totalWeight += quantity * 1;
            }
        }

        return totalWeight;
    },

    // 📦 Get storage capacity 🌙
    getCapacity(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        if (property.storageCapacity === undefined) {
            this.initialize(propertyId);
        }

        return property.storageCapacity;
    },

    // 📊 Get storage used 🔮
    getUsed(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        if (property.storageUsed === undefined) {
            property.storageUsed = this.calculateUsed(propertyId);
        }

        return property.storageUsed;
    },

    // 📦 Get available storage space 💀
    getAvailable(propertyId) {
        return this.getCapacity(propertyId) - this.getUsed(propertyId);
    },

    // ➕ Add items to property storage 🖤
    add(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        if (!property.storage) this.initialize(propertyId);

        // 📊 Check capacity ⚰️
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        if (this.getUsed(propertyId) + itemWeight > this.getCapacity(propertyId)) {
            addMessage(`Not enough storage space in ${property.locationName || 'property'}!`);
            return false;
        }

        // ➕ Add items 🦇
        if (!property.storage[itemId]) property.storage[itemId] = 0;
        property.storage[itemId] += quantity;
        property.storageUsed += itemWeight;

        return true;
    },

    // ➖ Remove items from property storage 🗡️
    remove(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.storage) return false;

        // 🔍 Check availability 🌙
        if (!property.storage[itemId] || property.storage[itemId] < quantity) {
            addMessage(`${property.locationName || 'Property'} doesn't have enough ${itemId}!`);
            return false;
        }

        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        // ➖ Remove items 🔮
        property.storage[itemId] -= quantity;
        if (property.storage[itemId] <= 0) {
            delete property.storage[itemId];
        }

        property.storageUsed -= itemWeight;

        return true;
    },

    // 🔄 Transfer items between properties 💀
    transferBetweenProperties(fromPropertyId, toPropertyId, itemId, quantity) {
        const fromProperty = PropertySystem.getProperty(fromPropertyId);
        const toProperty = PropertySystem.getProperty(toPropertyId);

        if (!fromProperty || !toProperty) return false;

        // 🔍 Check source 🖤
        if (!fromProperty.storage || !fromProperty.storage[itemId] ||
            fromProperty.storage[itemId] < quantity) {
            addMessage(`${fromProperty.locationName || 'Source property'} doesn't have enough ${itemId}!`);
            return false;
        }

        // 📦 Check destination capacity ⚰️
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        if (this.getUsed(toPropertyId) + itemWeight > this.getCapacity(toPropertyId)) {
            addMessage(`Not enough storage space in ${toProperty.locationName || 'destination property'}!`);
            return false;
        }

        // 🔄 Transfer 🦇
        this.remove(fromPropertyId, itemId, quantity);
        this.add(toPropertyId, itemId, quantity);

        const fromType = PropertyTypes.get(fromProperty.type);
        const toType = PropertyTypes.get(toProperty.type);
        addMessage(`Transferred ${quantity} ${itemId} from ${fromType?.name} to ${toType?.name}!`);

        return true;
    },

    // 📤 Transfer from storage to player inventory 🗡️
    transferToPlayer(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // 🔍 Check availability 🌙
        if (!property.storage || !property.storage[itemId] ||
            property.storage[itemId] < quantity) {
            addMessage(`Not enough ${itemId} in storage!`);
            return false;
        }

        // 📊 Check player capacity 🔮
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;

        const transport = typeof transportationOptions !== 'undefined' ?
            transportationOptions[game.player.transportation] : { carryCapacity: 100 };

        if (typeof calculateCurrentLoad === 'function' &&
            calculateCurrentLoad() + itemWeight > transport.carryCapacity) {
            addMessage(`Not enough carrying capacity! Need ${itemWeight} lbs more.`);
            return false;
        }

        // 🔄 Transfer 💀
        this.remove(propertyId, itemId, quantity);

        if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
        game.player.inventory[itemId] += quantity;

        if (typeof updateCurrentLoad === 'function') updateCurrentLoad();

        addMessage(`Took ${quantity} ${itemId} from ${property.locationName || 'property'} storage!`);

        // 🔄 Update displays 🖤
        this.updateDisplay(propertyId);
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();

        return true;
    },

    // 📥 Transfer from player inventory to storage ⚰️
    transferFromPlayer(propertyId, itemId, quantity) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        // 🔍 Check player inventory 🦇
        if (!game.player.inventory[itemId] || game.player.inventory[itemId] < quantity) {
            addMessage(`You don't have enough ${itemId}!`);
            return false;
        }

        // 📥 Transfer 🗡️
        if (!this.add(propertyId, itemId, quantity)) return false;

        game.player.inventory[itemId] -= quantity;
        if (game.player.inventory[itemId] <= 0) {
            delete game.player.inventory[itemId];
        }

        if (typeof updateCurrentLoad === 'function') updateCurrentLoad();

        addMessage(`Stored ${quantity} ${itemId} in ${property.locationName || 'property'}!`);

        // 🔄 Update displays 🌙
        this.updateDisplay(propertyId);
        if (typeof InventorySystem !== 'undefined') InventorySystem.updateInventoryDisplay();

        return true;
    },

    // 📋 Get all items stored across all properties 🔮
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

    // 🔍 Find properties that contain a specific item 💀
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

    // 📤 Auto-store produced items from work queues 🖤
    autoStoreProducedItems(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property || !property.totalProduction) return;

        for (const [itemId, quantity] of Object.entries(property.totalProduction)) {
            if (quantity > 0) {
                // 🏠 Try to store in the property first ⚰️
                if (!this.add(propertyId, itemId, quantity)) {
                    // 🏘️ Try other properties 🦇
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

                    // 🎒 Fallback to player inventory 🗡️
                    if (!stored) {
                        if (!game.player.inventory[itemId]) game.player.inventory[itemId] = 0;
                        game.player.inventory[itemId] += quantity;
                        addMessage(`${quantity} ${itemId} added to your inventory (no storage available)!`);
                    }
                }

                property.totalProduction[itemId] = 0;
            }
        }
    },

    // 🔄 Update storage display 🌙
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

            // 🖤 Using data attributes to prevent XSS - no inline onclick
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
            // 💀 Attach event listeners safely
            itemElement.querySelectorAll('.storage-item-btn[data-action="take"]').forEach(btn => {
                btn.onclick = () => this.transferToPlayer(btn.dataset.property, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            storageContainer.appendChild(itemElement);
        }

        // 📊 Update storage info bar 🔮
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

    // 🔄 Update transfer display 💀
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

    // 🎒 Populate transfer from inventory 🖤
    _populateTransferFromInventory(propertyId) {
        const container = document.getElementById(`transfer-from-inventory-${propertyId}`);
        if (!container || !game.player.inventory) return;

        container.innerHTML = '';

        if (Object.keys(game.player.inventory).length === 0) {
            container.innerHTML = '<p>Your inventory is empty.</p>';
            return;
        }

        for (const [itemId, quantity] of Object.entries(game.player.inventory)) {
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
            // 🖤 Using data attributes to prevent XSS - no inline onclick
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
            // 🦇 Attach event listeners safely
            itemElement.querySelectorAll('.transfer-btn[data-action="store"]').forEach(btn => {
                btn.onclick = () => this.transferFromPlayer(btn.dataset.property, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            container.appendChild(itemElement);
        }
    },

    // 🏘️ Populate property selector ⚰️
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

    // 🔄 Populate transfer between properties 🦇
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
            // 🖤 Using data attributes to prevent XSS - no inline onclick
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
            // ⚰️ Attach event listeners safely
            itemElement.querySelectorAll('.transfer-btn[data-action="transfer"]').forEach(btn => {
                btn.onclick = () => this.transferBetweenProperties(btn.dataset.from, btn.dataset.to, btn.dataset.item, parseInt(btn.dataset.qty));
            });

            container.appendChild(itemElement);
        }
    },

    // 🔄 Switch storage tab 🗡️
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

// 🌙 expose to global scope 🦇
window.PropertyStorage = PropertyStorage;
