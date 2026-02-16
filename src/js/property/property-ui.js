// ═══════════════════════════════════════════════════════════════
// PROPERTY UI - making virtual real estate look dark and pretty
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyUI = {
    // escape HTML to prevent XSS attacks - dark magic for security
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    },

    // update property display
    updatePropertyDisplay() {
        const container = document.getElementById('properties-list');
        if (!container) return;

        container.innerHTML = '';

        const properties = PropertySystem.getPlayerProperties();

        if (properties.length === 0) {
            container.innerHTML = '<p class="empty-message">You own no properties yet.</p>';
            return;
        }

        properties.forEach(property => {
            const propertyElement = this.createPropertyElement(property);
            container.appendChild(propertyElement);
        });
    },

    // create property element
    createPropertyElement(property) {
        const propertyType = PropertyTypes.get(property.type);
        const location = GameWorld.locations[property.location];

        const element = document.createElement('div');
        element.className = 'property-item';
        element.dataset.propertyId = property.id;

        if (!property.storageCapacity) {
            PropertyStorage.initialize(property.id);
        }

        element.innerHTML = `
            <div class="property-header">
                <span class="property-icon">${propertyType.icon}</span>
                <span class="property-name">${this.escapeHtml(propertyType.name)}</span>
                <span class="property-location">${this.escapeHtml(location ? location.name : 'Unknown')}</span>
            </div>
            <div class="property-stats">
                <div class="property-stat">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${property.level}</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Condition:</span>
                    <span class="stat-value">${property.condition}%</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Income:</span>
                    <span class="stat-value">${PropertyIncome.calculateIncome(property)} gold/day</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Total Income:</span>
                    <span class="stat-value">${property.totalIncome} gold</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Storage:</span>
                    <span class="stat-value">${PropertyStorage.getUsed(property.id)}/${PropertyStorage.getCapacity(property.id)} lbs</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="property-action-btn" data-action="details" data-property="${this.escapeHtml(property.id)}">Details</button>
                <button class="property-action-btn" data-action="upgrades" data-property="${this.escapeHtml(property.id)}">Upgrades</button>
                <button class="property-action-btn" data-action="repair" data-property="${this.escapeHtml(property.id)}">Repair</button>
                <button class="property-action-btn" data-action="storage" data-property="${this.escapeHtml(property.id)}">Storage</button>
            </div>
        `;

        // attach event listeners safely - no inline onclick XSS risk
        element.querySelectorAll('.property-action-btn[data-action]').forEach(btn => {
            btn.onclick = () => {
                const propId = btn.dataset.property;
                switch(btn.dataset.action) {
                    case 'details': this.showPropertyDetails(propId); break;
                    case 'upgrades': this.showUpgradeInterface(propId); break;
                    case 'repair': PropertyUpgrades.repair(propId); break;
                    case 'storage': this.showStorageManagement(propId); break;
                }
            };
        });

        return element;
    },

    // show property details
    showPropertyDetails(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;

        const propertyType = PropertyTypes.get(property.type);
        const location = GameWorld.locations[property.location];

        if (!property.storageCapacity) {
            PropertyStorage.initialize(property.id);
        }

        const workQueue = PropertySystem.getWorkQueue(propertyId);

        // escape all dynamic content to prevent XSS
        const safePropertyId = this.escapeHtml(propertyId);
        const safePropertyName = this.escapeHtml(propertyType.name);
        const safeLocationName = this.escapeHtml(location ? location.name : 'Unknown');
        const detailsHtml = `
            <div class="property-details-modal" data-property-id="${safePropertyId}">
                <div class="modal-header">
                    <h2>${propertyType.icon} ${safePropertyName}</h2>
                    <button class="close-btn" data-action="close">✕</button>
                </div>
                <div class="modal-content">
                    <div class="property-details">
                        <div class="property-details-header">
                            <h3>${propertyType.icon} ${safePropertyName} Details</h3>
                            <div class="mini-actions">
                                <button class="mini-action-btn" data-action="upgrades" title="Upgrades">🔧</button>
                                <button class="mini-action-btn" data-action="repair" title="Repair">🔨</button>
                                <button class="mini-action-btn" data-action="level-up" title="Level Up">⬆️</button>
                                <button class="mini-action-btn" data-action="storage" title="Storage">📦</button>
                            </div>
                        </div>
                        <div class="property-info">
                            <div class="info-row">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${safeLocationName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Level:</span>
                                <span class="info-value">${property.level}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Condition:</span>
                                <span class="info-value condition-${property.condition > 70 ? 'good' : property.condition > 40 ? 'fair' : 'poor'}">${property.condition}%</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Purchase Price:</span>
                                <span class="info-value">${property.purchasePrice} gold</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Total Income:</span>
                                <span class="info-value income-positive">${property.totalIncome} gold</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Daily Income:</span>
                                <span class="info-value income-positive">${PropertyIncome.calculateIncome(property)} gold</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Storage:</span>
                                <span class="info-value">${PropertyStorage.getUsed(propertyId)}/${PropertyStorage.getCapacity(propertyId)} lbs</span>
                            </div>
                        </div>
                        <div class="property-upgrades">
                            <h4>Upgrades:</h4>
                            ${property.upgrades.length > 0 ?
                                property.upgrades.map(upgradeId => {
                                    const upgrade = PropertyTypes.getUpgrade(upgradeId);
                                    return `<span class="upgrade-tag" title="${upgrade.description}">${upgrade.icon} ${upgrade.name}</span>`;
                                }).join('') :
                                '<p class="no-upgrades">No upgrades installed.</p>'
                            }
                        </div>
                        <div class="property-production">
                            <h4>Production Queue:</h4>
                            ${workQueue.length > 0 ?
                                `<div class="work-queue-list">
                                    ${workQueue.map(work => `
                                        <div class="work-item">
                                            <span class="work-type">${this.getItemIcon(work.type)} ${this.getItemName(work.type)}</span>
                                            <span class="work-quantity">×${work.quantity}</span>
                                            <div class="work-progress">
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${(work.progress / work.quantity) * 100}%"></div>
                                                </div>
                                                <span class="progress-text">${Math.round((work.progress / work.quantity) * 100)}%</span>
                                            </div>
                                            <button class="cancel-work-btn" data-action="cancel-work" data-work-id="${this.escapeHtml(work.id)}" title="Cancel">✕</button>
                                        </div>
                                    `).join('')}
                                </div>` :
                                '<p class="no-production">No production in progress.</p>'
                            }
                        </div>
                        <div class="property-employees">
                            <h4>Employees:</h4>
                            ${property.employees.length > 0 ?
                                `<div class="employee-list">
                                    ${property.employees.map(empId => {
                                        const employee = PropertyEmployeeBridge.getEmployee(empId);
                                        return employee ? `
                                            <div class="employee-item">
                                                <span class="employee-name">${employee.name}</span>
                                                <span class="employee-role">${employee.role}</span>
                                                <span class="employee-morale morale-${employee.morale > 70 ? 'good' : employee.morale > 40 ? 'fair' : 'poor'}">😊 ${employee.morale}%</span>
                                            </div>
                                        ` : '';
                                    }).join('')}
                                </div>` :
                                '<p class="no-employees">No employees assigned.</p>'
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" data-action="upgrades">Manage Upgrades</button>
                    <button class="secondary-btn" data-action="storage">Manage Storage</button>
                    <button class="secondary-btn" data-action="close">Close</button>
                </div>
            </div>
        `;

        this.showModal(detailsHtml);
        addMessage(`Viewing details for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);
    },

    // show upgrade interface
    showUpgradeInterface(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;

        const propertyType = PropertyTypes.get(property.type);
        const availableUpgrades = PropertyUpgrades.getAvailable(propertyId);

        if (availableUpgrades.length === 0) {
            addMessage('No upgrades available for this property.');
            return;
        }

        const upgradeHtml = `
            <div class="upgrade-interface">
                <h2>🔧 Upgrades for ${propertyType.icon} ${propertyType.name}</h2>
                <div class="property-summary">
                    <div class="property-level">Level ${property.level}</div>
                    <div class="property-condition">Condition: ${property.condition}%</div>
                    <div class="current-upgrades">
                        <strong>Current Upgrades:</strong>
                        ${property.upgrades.length > 0 ?
                            property.upgrades.map(upgradeId => {
                                const upgrade = PropertyTypes.getUpgrade(upgradeId);
                                return `<span class="upgrade-tag">${upgrade.icon} ${upgrade.name}</span>`;
                            }).join(' ') :
                            '<span class="no-upgrades">None</span>'
                        }
                    </div>
                </div>
                <div class="upgrades-grid" id="upgrades-grid"></div>
            </div>
        `;

        addMessage(`Managing upgrades for ${propertyType.name}...`);
        this._populateUpgradesGrid(availableUpgrades, propertyId);
    },

    // show storage management
    showStorageManagement(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;

        const propertyType = PropertyTypes.get(property.type);
        const location = GameWorld.locations[property.location];

        const storageHtml = `
            <div class="storage-management">
                <h3>${propertyType.icon} ${propertyType.name} Storage Management</h3>
                <div class="storage-location">
                    <p><strong>Location:</strong> ${location ? location.name : 'Unknown'}</p>
                    <p><strong>Storage Capacity:</strong> ${PropertyStorage.getUsed(propertyId)}/${PropertyStorage.getCapacity(propertyId)} lbs</p>
                </div>
                <div class="storage-tabs">
                    <button class="storage-tab active" data-action="tab-stored" data-property="${this.escapeHtml(propertyId)}">Stored Items</button>
                    <button class="storage-tab" data-action="tab-transfer" data-property="${this.escapeHtml(propertyId)}">Transfer Items</button>
                </div>
                <div class="storage-content">
                    <div id="property-storage-${this.escapeHtml(propertyId)}" class="storage-items"></div>
                    <div id="property-transfer-${this.escapeHtml(propertyId)}" class="storage-transfer hidden"></div>
                </div>
                <div id="property-storage-info-${this.escapeHtml(propertyId)}" class="storage-info"></div>
            </div>
        `;

        addMessage(`Managing storage for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);

        // attach tab event listeners after content is in DOM
        setTimeout(() => {
            document.querySelectorAll('.storage-tab[data-action]').forEach(btn => {
                btn.onclick = () => {
                    const propId = btn.dataset.property;
                    const tab = btn.dataset.action === 'tab-stored' ? 'stored' : 'transfer';
                    PropertyStorage.switchTab(propId, tab);
                };
            });
        }, 0);

        PropertyStorage.updateDisplay(propertyId);
        PropertyStorage.updateTransferDisplay(propertyId);
    },

    // show property purchase interface
    // now supports buying at ANY location via map picker!
    showPropertyPurchaseInterface(locationId = null) {
        // if no locationId provided, use current location
        const targetLocationId = locationId || game?.currentLocation?.id;
        const targetLocation = GameWorld.locations[targetLocationId];

        if (!targetLocation) {
            addMessage('Cannot find location information.');
            return;
        }

        // get properties available at target location (not just current!)
        const availableProperties = this.getPropertiesForLocation(targetLocationId);

        const purchaseHtml = `
            <div class="property-purchase-interface">
                <div class="property-purchase-header">
                    <h2>🏘️ Available Properties in ${this.escapeHtml(targetLocation.name)}</h2>
                    <button class="map-picker-btn" id="open-property-map-btn" title="Choose a different location">
                        🗺️ Browse All Locations
                    </button>
                </div>
                ${availableProperties.length === 0 ?
                    '<div class="no-properties-message"><p>No properties available for purchase at this location.</p><p>Try browsing other locations using the map button above.</p></div>' :
                    '<div class="properties-grid" id="properties-purchase-grid"></div>'
                }
                <div class="purchase-summary">
                    <div class="player-gold">
                        <span class="gold-icon">💰</span>
                        <span class="gold-amount">${game.player.gold}</span>
                        <span class="gold-label">Gold Available</span>
                    </div>
                </div>
            </div>
        `;

        addMessage(`Browsing properties in ${targetLocation.name}...`);

        // store current target location for purchases
        this._currentPurchaseLocation = targetLocationId;

        if (availableProperties.length > 0) {
            this._populatePropertiesPurchaseGrid(availableProperties, targetLocationId);
        }

        // attach map picker button handler after DOM update
        setTimeout(() => {
            const mapBtn = document.getElementById('open-property-map-btn');
            if (mapBtn) {
                mapBtn.addEventListener('click', () => {
                    if (typeof PropertyMapPicker !== 'undefined') {
                        PropertyMapPicker.open((selectedLocationId) => {
                            // re-open purchase interface at selected location
                            this.showPropertyPurchaseInterface(selectedLocationId);
                        });
                    } else {
                        addMessage('Map picker not available.');
                    }
                });
            }
        }, 100);
    },

    // get properties available at ANY location (for map picker integration)
    getPropertiesForLocation(locationId) {
        const location = GameWorld.locations[locationId];
        if (!location) return [];

        const propertyIds = PropertyTypes.getLocationProperties(location.type);
        const ownedHere = new Set((game?.player?.ownedProperties || [])
            .filter(p => p.location === locationId)
            .map(p => p.type));

        const availableProperties = [];
        propertyIds.forEach(propertyId => {
            if (ownedHere.has(propertyId)) return; // Already own this type here

            const propertyType = PropertyTypes.get(propertyId);
            if (!propertyType) return;

            const calculatedPrice = this.calculatePriceForLocation(propertyId, locationId);
            const dailyIncome = PropertyPurchase.calculateProjectedIncome(propertyId);
            const roiDays = dailyIncome > 0 ? Math.round(calculatedPrice / dailyIncome) : Infinity;

            availableProperties.push({
                ...propertyType,
                location: locationId,
                calculatedPrice: calculatedPrice,
                projectedDailyIncome: dailyIncome,
                roiDays: roiDays,
                canAfford: game.player.gold >= calculatedPrice
            });
        });

        return availableProperties;
    },

    // calculate property price for ANY location (not just current)
    calculatePriceForLocation(propertyId, locationId) {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return 0;

        const location = GameWorld.locations[locationId];
        if (!location) return propertyType.basePrice;

        let price = propertyType.basePrice;

        // location type modifier
        const locationModifiers = { village: 0.8, town: 1.0, city: 1.3, capital: 1.5, port: 1.2 };
        price *= locationModifiers[location.type] || 1.0;

        // reputation modifier
        if (typeof CityReputationSystem !== 'undefined') {
            const reputation = CityReputationSystem.getReputation(locationId);
            const reputationModifier = 1 - (reputation * 0.002);
            price *= Math.max(0.7, reputationModifier);
        }

        // merchant rank bonus
        if (typeof MerchantRankSystem !== 'undefined') {
            const bonus = MerchantRankSystem.getTradingBonus();
            price *= (1 - bonus);
        }

        return Math.round(price);
    },

    // show property purchase details
    showPropertyPurchaseDetails(propertyId) {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return;

        const calculatedPrice = PropertyPurchase.calculatePrice(propertyId);
        const projectedIncome = PropertyPurchase.calculateProjectedIncome(propertyId);
        const roiDays = projectedIncome > 0 ? Math.round(calculatedPrice / projectedIncome) : Infinity;
        const requirements = PropertyPurchase.getRequirements(propertyId);

        // escape propertyId to prevent XSS
        const safePropertyId = this.escapeHtml(propertyId);
        const detailsHtml = `
            <div class="property-details-modal" data-property-id="${safePropertyId}">
                <div class="modal-header">
                    <h2>${propertyType.icon} ${propertyType.name}</h2>
                    <button class="close-btn" data-action="close">✕</button>
                </div>
                <div class="modal-content">
                    <div class="property-overview">
                        <div class="property-icon-large">${propertyType.icon}</div>
                        <div class="property-info">
                            <h3>${propertyType.name}</h3>
                            <p class="property-description">${propertyType.description}</p>
                            <div class="property-type-badge">${propertyId.charAt(0).toUpperCase() + propertyId.slice(1)}</div>
                        </div>
                    </div>

                    <div class="property-financials">
                        <h3>Financial Information</h3>
                        <div class="financial-grid">
                            <div class="financial-item">
                                <span class="label">Base Price:</span>
                                <span class="value">${propertyType.basePrice} gold</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Current Price:</span>
                                <span class="value price">${calculatedPrice} gold</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Daily Income:</span>
                                <span class="value income">+${projectedIncome} gold/day</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Maintenance:</span>
                                <span class="value cost">-${propertyType.maintenanceCost} gold/day</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Net Daily Profit:</span>
                                <span class="value ${projectedIncome > propertyType.maintenanceCost ? 'profit' : 'loss'}">
                                    ${projectedIncome - propertyType.maintenanceCost} gold/day
                                </span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Return on Investment:</span>
                                <span class="value roi">${roiDays === Infinity ? 'Never' : roiDays + ' days'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="property-features">
                        <h3>Property Features</h3>
                        <div class="features-grid">
                            ${propertyType.storageBonus ? `
                            <div class="feature-item">
                                <span class="feature-icon">📦</span>
                                <span class="feature-text">${propertyType.storageBonus} lbs storage</span>
                            </div>
                            ` : ''}
                            ${propertyType.workerSlots ? `
                            <div class="feature-item">
                                <span class="feature-icon">👷</span>
                                <span class="feature-text">${propertyType.workerSlots} worker slots</span>
                            </div>
                            ` : ''}
                            ${propertyType.merchantSlots ? `
                            <div class="feature-item">
                                <span class="feature-icon">🧑‍💼</span>
                                <span class="feature-text">${propertyType.merchantSlots} merchant slots</span>
                            </div>
                            ` : ''}
                            ${propertyType.production ? `
                            <div class="feature-item">
                                <span class="feature-icon">⚒️</span>
                                <span class="feature-text">Produces: ${Object.keys(propertyType.production).join(', ')}</span>
                            </div>
                            ` : ''}
                            ${propertyType.restBonus ? `
                            <div class="feature-item">
                                <span class="feature-icon">😴</span>
                                <span class="feature-text">Rest bonus available</span>
                            </div>
                            ` : ''}
                            ${propertyType.reputationBonus ? `
                            <div class="feature-item">
                                <span class="feature-icon">⭐</span>
                                <span class="feature-text">+${propertyType.reputationBonus} reputation/day</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="property-requirements">
                        <h3>Requirements</h3>
                        <div class="requirements-list">
                            ${requirements.map(req => `
                                <div class="requirement ${req.met ? 'met' : 'unmet'}">
                                    <span class="requirement-icon">${req.met ? '✓' : '✗'}</span>
                                    <span class="requirement-text">${req.description}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="purchase-btn ${PropertyPurchase.canAfford(propertyId) && requirements.every(req => req.met) ? 'enabled' : 'disabled'}"
                            data-action="purchase-property"
                            ${!PropertyPurchase.canAfford(propertyId) || !requirements.every(req => req.met) ? 'disabled' : ''}>
                        Purchase for ${calculatedPrice} gold
                    </button>
                    <button class="cancel-btn" data-action="close">Cancel</button>
                </div>
            </div>
        `;

        this.showModal(detailsHtml);

        // add purchase-property handler to the modal event listeners
        const modal = document.querySelector('.property-details-modal');
        if (modal) {
            const purchaseBtn = modal.querySelector('[data-action="purchase-property"]');
            if (purchaseBtn) {
                purchaseBtn.onclick = () => PropertyPurchase.purchase(propertyId);
            }
        }
    },

    // helper - get item icon
    getItemIcon(itemId) {
        if (typeof ItemDatabase !== 'undefined') {
            const item = ItemDatabase.getItem(itemId);
            return item ? item.icon : '📦';
        }

        const iconMap = {
            food: '🍖', grain: '🌾', stone: '🪨', iron_ore: '⛏️',
            coal: '⚫', tools: '🔧', weapons: '⚔️', ale: '🍺',
            wood: '🪵', herbs: '🌿', fish: '🐟'
        };

        return iconMap[itemId] || '📦';
    },

    // helper - get item name
    getItemName(itemId) {
        if (typeof ItemDatabase !== 'undefined') {
            const item = ItemDatabase.getItem(itemId);
            return item ? item.name : itemId;
        }

        const nameMap = {
            food: 'Food', grain: 'Grain', stone: 'Stone', iron_ore: 'Iron Ore',
            coal: 'Coal', tools: 'Tools', weapons: 'Weapons', ale: 'Ale',
            wood: 'Wood', herbs: 'Herbs', fish: 'Fish'
        };

        return nameMap[itemId] || itemId.charAt(0).toUpperCase() + itemId.slice(1);
    },

    // show modal helper
    showModal(html) {
        if (typeof ModalSystem !== 'undefined' && ModalSystem.showModal) {
            const result = ModalSystem.showModal(html, 'property-modal-container');
            this._attachModalEventListeners();
            return result;
        }

        let modalContainer = document.getElementById('property-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'property-modal-container';
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }

        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';
        this._attachModalEventListeners();
    },

    // attach event listeners to modal buttons - XSS-safe event delegation
    _attachModalEventListeners() {
        const modal = document.querySelector('.property-details-modal, .property-upgrade-modal, .storage-management-modal');
        if (!modal) return;

        const propertyId = modal.dataset.propertyId;

        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = () => {
                switch(btn.dataset.action) {
                    case 'close': this.closePropertyDetails(); break;
                    case 'upgrades': this.showUpgradeInterface(propertyId); break;
                    case 'storage': this.showStorageManagement(propertyId); break;
                    case 'repair': PropertyUpgrades.repair(propertyId); break;
                    case 'level-up': PropertyUpgrades.upgradeLevel(propertyId); break;
                    case 'cancel-work': PropertySystem.cancelWorkItem(propertyId, btn.dataset.workId); break;
                    case 'upgrade': PropertyUpgrades.upgrade(propertyId, btn.dataset.upgradeId); break;
                }
            };
        });
    },

    // close property details
    closePropertyDetails() {
        const modalContainer = document.getElementById('property-modal-container');
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
    },

    // populate upgrades grid
    _populateUpgradesGrid(upgrades, propertyId) {
        const grid = document.getElementById('upgrades-grid');
        if (!grid) return;

        grid.innerHTML = '';

        upgrades.forEach(upgrade => {
            const upgradeCard = this._createUpgradeCard(upgrade, propertyId);
            grid.appendChild(upgradeCard);
        });
    },

    // create upgrade card
    _createUpgradeCard(upgrade, propertyId) {
        const card = document.createElement('div');
        card.className = `upgrade-card ${upgrade.affordability && upgrade.requirementsMet ? 'available' : 'unavailable'}`;

        card.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-icon">${upgrade.icon}</span>
                <h3 class="upgrade-name">${upgrade.name}</h3>
                <span class="upgrade-cost">${upgrade.cost} gold</span>
            </div>
            <div class="upgrade-description">
                <p>${upgrade.description}</p>
            </div>
            <div class="upgrade-benefits">
                <h4>Benefits:</h4>
                <div class="benefits-list">
                    ${upgrade.projectedBenefits.incomeIncrease ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">💰</span>
                        <span class="benefit-text">+${upgrade.projectedBenefits.incomeIncrease} gold/day income</span>
                    </div>
                    ` : ''}
                    ${upgrade.projectedBenefits.maintenanceSavings ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">💾</span>
                        <span class="benefit-text">-${upgrade.projectedBenefits.maintenanceSavings} gold/day maintenance</span>
                    </div>
                    ` : ''}
                    ${upgrade.projectedBenefits.storageIncrease ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">📦</span>
                        <span class="benefit-text">+${upgrade.projectedBenefits.storageIncrease} lbs storage</span>
                    </div>
                    ` : ''}
                    ${upgrade.projectedBenefits.productionIncrease ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">⚡</span>
                        <span class="benefit-text">+${upgrade.projectedBenefits.productionIncrease} production</span>
                    </div>
                    ` : ''}
                    ${upgrade.projectedBenefits.reputationIncrease ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">⭐</span>
                        <span class="benefit-text">+${upgrade.projectedBenefits.reputationIncrease} reputation/day</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="upgrade-requirements">
                <h4>Requirements:</h4>
                <div class="requirements-list">
                    ${upgrade.requirements?.map(req => `
                        <div class="requirement ${req.met ? 'met' : 'unmet'}">
                            <span class="requirement-icon">${req.met ? '✓' : '✗'}</span>
                            <span class="requirement-text">${req.description}</span>
                        </div>
                    `).join('') || '<div class="requirement met">No special requirements</div>'}
                </div>
            </div>
            <div class="upgrade-actions">
                <button class="upgrade-btn ${upgrade.affordability && upgrade.requirementsMet ? 'enabled' : 'disabled'}"
                        data-action="upgrade" data-upgrade-id="${this.escapeHtml(upgrade.id)}"
                        ${!upgrade.affordability || !upgrade.requirementsMet ? 'disabled' : ''}>
                    ${upgrade.affordability && upgrade.requirementsMet ? 'Purchase Upgrade' : 'Cannot Purchase'}
                </button>
            </div>
        `;

        return card;
    },

    // populate properties purchase grid
    _populatePropertiesPurchaseGrid(properties) {
        const grid = document.getElementById('properties-purchase-grid');
        if (!grid) return;

        grid.innerHTML = '';

        properties.forEach(property => {
            const propertyCard = this._createPropertyPurchaseCard(property);
            grid.appendChild(propertyCard);
        });
    },

    // create property purchase card
    _createPropertyPurchaseCard(property) {
        const card = document.createElement('div');
        card.className = `property-purchase-card ${property.affordability ? 'affordable' : 'unaffordable'}`;

        const requirementsMet = property.requirements?.every(req => req.met) || true;

        card.innerHTML = `
            <div class="property-card-header">
                <span class="property-icon">${property.icon}</span>
                <h3 class="property-name">${property.name}</h3>
                <span class="property-type">${property.id.charAt(0).toUpperCase() + property.id.slice(1)}</span>
            </div>
            <div class="property-card-description">
                <p>${property.description}</p>
            </div>
            <div class="property-card-stats">
                <div class="stat-row">
                    <span class="stat-label">Base Price:</span>
                    <span class="stat-value">${property.basePrice} gold</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Current Price:</span>
                    <span class="stat-value price-highlight">${property.calculatedPrice} gold</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Daily Income:</span>
                    <span class="stat-value income">${property.projectedDailyIncome} gold/day</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Maintenance:</span>
                    <span class="stat-value cost">${property.maintenanceCost} gold/day</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">ROI:</span>
                    <span class="stat-value roi">${property.roiDays === Infinity ? 'Never' : property.roiDays + ' days'}</span>
                </div>
                ${property.storageBonus ? `
                <div class="stat-row">
                    <span class="stat-label">Storage:</span>
                    <span class="stat-value">${property.storageBonus} lbs</span>
                </div>
                ` : ''}
            </div>
            <div class="property-card-requirements">
                <h4>Requirements:</h4>
                <div class="requirements-list">
                    ${property.requirements?.map(req => `
                        <div class="requirement ${req.met ? 'met' : 'unmet'}">
                            <span class="requirement-icon">${req.met ? '✓' : '✗'}</span>
                            <span class="requirement-text">${req.description}</span>
                        </div>
                    `).join('') || '<div class="requirement met">No special requirements</div>'}
                </div>
            </div>
            <div class="property-card-actions">
                <button class="purchase-btn ${property.affordability && requirementsMet ? 'enabled' : 'disabled'}"
                        data-action="purchase" data-property="${this.escapeHtml(property.id)}"
                        ${!property.affordability || !requirementsMet ? 'disabled' : ''}>
                    ${property.affordability && requirementsMet ? 'Purchase' : 'Cannot Purchase'}
                </button>
                <button class="details-btn" data-action="view-details" data-property="${this.escapeHtml(property.id)}">
                    View Details
                </button>
            </div>
        `;

        // attach event listeners safely - no inline onclick
        card.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = () => {
                const propId = btn.dataset.property;
                switch(btn.dataset.action) {
                    case 'purchase': PropertyPurchase.purchase(propId); break;
                    case 'view-details': this.showPropertyPurchaseDetails(propId); break;
                }
            };
        });

        return card;
    }
};

// expose to global scope
window.PropertyUI = PropertyUI;
