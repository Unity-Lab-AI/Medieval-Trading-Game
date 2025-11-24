// Property System
const PropertySystem = {
    // Property types with their characteristics
    propertyTypes: {
        house: {
            id: 'house',
            name: 'House',
            description: 'A basic residence providing storage and rest.',
            basePrice: 1000,
            baseIncome: 5,
            maintenanceCost: 2,
            storageBonus: 50,
            restBonus: true,
            icon: '🏠'
        },
        shop: {
            id: 'shop',
            name: 'Shop',
            description: 'A small retail space for selling goods.',
            basePrice: 2500,
            baseIncome: 15,
            maintenanceCost: 8,
            storageBonus: 100,
            merchantSlots: 1,
            icon: '🏪'
        },
        warehouse: {
            id: 'warehouse',
            name: 'Warehouse',
            description: 'Large storage facility for goods and materials.',
            basePrice: 4000,
            baseIncome: 8,
            maintenanceCost: 15,
            storageBonus: 500,
            icon: '🏭'
        },
        farm: {
            id: 'farm',
            name: 'Farm',
            description: 'Agricultural land that produces food and resources.',
            basePrice: 3000,
            baseIncome: 20,
            maintenanceCost: 10,
            production: { food: 5, grain: 3 },
            workerSlots: 3,
            icon: '🌾'
        },
        mine: {
            id: 'mine',
            name: 'Mine',
            description: 'Mining operation that extracts valuable resources.',
            basePrice: 8000,
            baseIncome: 25,
            maintenanceCost: 20,
            production: { stone: 8, iron_ore: 3, coal: 5 },
            workerSlots: 5,
            icon: '⛏️'
        },
        tavern: {
            id: 'tavern',
            name: 'Tavern',
            description: 'Public house that generates income from patrons.',
            basePrice: 5000,
            baseIncome: 30,
            maintenanceCost: 12,
            storageBonus: 80,
            merchantSlots: 2,
            reputationBonus: 1,
            icon: '🍺'
        },
        market_stall: {
            id: 'market_stall',
            name: 'Market Stall',
            description: 'Small stall for trading goods in markets.',
            basePrice: 800,
            baseIncome: 10,
            maintenanceCost: 3,
            merchantSlots: 1,
            icon: '🏪'
        },
        craftshop: {
            id: 'craftshop',
            name: 'Craftshop',
            description: 'Workshop for crafting and selling goods.',
            basePrice: 3500,
            baseIncome: 18,
            maintenanceCost: 10,
            production: {},
            workerSlots: 2,
            icon: '🔨'
        }
    },
    
    // Property upgrades
    upgrades: {
        expansion: {
            id: 'expansion',
            name: 'Expansion',
            description: 'Increases property size and capacity.',
            costMultiplier: 0.5,
            effects: { storageBonus: 1.5, incomeBonus: 1.2 },
            icon: '📏'
        },
        security: {
            id: 'security',
            name: 'Security',
            description: 'Reduces maintenance costs and damage risk.',
            costMultiplier: 0.3,
            effects: { maintenanceReduction: 0.3, damageReduction: 0.5 },
            icon: '🔒'
        },
        luxury: {
            id: 'luxury',
            name: 'Luxury',
            description: 'Increases income and reputation.',
            costMultiplier: 0.8,
            effects: { incomeBonus: 1.4, reputationBonus: 2 },
            icon: '✨'
        },
        efficiency: {
            id: 'efficiency',
            name: 'Efficiency',
            description: 'Reduces maintenance costs and increases production.',
            costMultiplier: 0.4,
            effects: { maintenanceReduction: 0.2, productionBonus: 1.3 },
            icon: '⚡'
        }
    },
    
    // Initialize property system
    init() {
        if (!game.player.ownedProperties) {
            game.player.ownedProperties = [];
        }
        if (!game.player.propertyIncome) {
            game.player.propertyIncome = 0;
        }
        if (!game.player.propertyExpenses) {
            game.player.propertyExpenses = 0;
        }
        
        // Setup property income processing
        this.setupIncomeProcessing();
    },
    
    // Setup regular income processing
    setupIncomeProcessing() {
        // Process income every game day
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Check if a day has passed
            if (TimeSystem.currentTime.hour === 0 && TimeSystem.currentTime.minute === 0) {
                PropertySystem.processDailyIncome();
            }
            
            return result;
        };
    },
    
    // Get available properties in current location
    getAvailableProperties() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return [];
        
        const availableProperties = [];
        
        // Properties available based on location type
        const locationProperties = {
            village: ['house', 'farm', 'market_stall'],
            town: ['house', 'shop', 'warehouse', 'tavern', 'craftshop'],
            city: ['house', 'shop', 'warehouse', 'tavern', 'craftshop', 'mine']
        };
        
        const propertyIds = locationProperties[location.type] || locationProperties.village;
        
        propertyIds.forEach(propertyId => {
            const propertyType = this.propertyTypes[propertyId];
            if (propertyType) {
                // Check if player already owns this type in this location
                const existingProperty = game.player.ownedProperties.find(
                    p => p.type === propertyId && p.location === game.currentLocation.id
                );
                
                if (!existingProperty) {
                    availableProperties.push({
                        ...propertyType,
                        location: game.currentLocation.id,
                        calculatedPrice: this.calculatePropertyPrice(propertyId)
                    });
                }
            }
        });
        
        return availableProperties;
    },
    
    // Calculate property price based on location and modifiers
    calculatePropertyPrice(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return 0;
        
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return propertyType.basePrice;
        
        let price = propertyType.basePrice;
        
        // Location type modifier
        const locationModifiers = {
            village: 0.8,
            town: 1.0,
            city: 1.3
        };
        
        price *= locationModifiers[location.type] || 1.0;
        
        // Player reputation modifier
        const reputation = CityReputationSystem.getReputation(game.currentLocation.id);
        const reputationModifier = 1 - (reputation * 0.002); // Small discount for good reputation
        price *= Math.max(0.7, reputationModifier);
        
        return Math.round(price);
    },
    
    // Purchase property
    purchaseProperty(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) {
            addMessage('Invalid property type!');
            return false;
        }
        
        const price = this.calculatePropertyPrice(propertyId);
        
        if (game.player.gold < price) {
            addMessage(`You need ${price} gold to purchase a ${propertyType.name}!`);
            return false;
        }
        
        // Check if player already owns this type in this location
        const existingProperty = game.player.ownedProperties.find(
            p => p.type === propertyId && p.location === game.currentLocation.id
        );
        
        if (existingProperty) {
            addMessage(`You already own a ${propertyType.name} in ${game.currentLocation.name}!`);
            return false;
        }
        
        // Purchase property
        game.player.gold -= price;
        
        const newProperty = {
            id: Date.now().toString(),
            type: propertyId,
            location: game.currentLocation.id,
            level: 1,
            condition: 100,
            upgrades: [],
            employees: [],
            lastIncomeTime: TimeSystem.getTotalMinutes(),
            totalIncome: 0,
            purchasePrice: price,
            storageUsed: 0
        };
        
        game.player.ownedProperties.push(newProperty);
        
        addMessage(`Purchased ${propertyType.name} in ${game.currentLocation.name} for ${price} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Get player's properties
    getPlayerProperties() {
        return game.player.ownedProperties || [];
    },
    
    // Get property details
    getProperty(propertyId) {
        return game.player.ownedProperties.find(p => p.id === propertyId);
    },
    
    // Process daily income for all properties
    processDailyIncome() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;
        
        let totalIncome = 0;
        let totalExpenses = 0;
        
        game.player.ownedProperties.forEach(property => {
            const propertyType = this.propertyTypes[property.type];
            if (!propertyType) return;
            
            // Calculate base income
            let income = propertyType.baseIncome;
            
            // Apply level multiplier
            income *= (1 + (property.level - 1) * 0.2);
            
            // Apply upgrade bonuses
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.incomeBonus) {
                    income *= upgrade.effects.incomeBonus;
                }
            });
            
            // Apply condition modifier
            income *= (property.condition / 100);
            
            // Calculate maintenance cost
            let maintenance = propertyType.maintenanceCost;
            
            // Apply upgrade reductions
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.maintenanceReduction) {
                    maintenance *= upgrade.effects.maintenanceReduction;
                }
            });
            
            // Calculate tax (10% of income)
            const tax = Math.round(income * 0.1);
            
            // Net income
            const netIncome = Math.round(income - maintenance - tax);
            
            totalIncome += Math.max(0, netIncome);
            totalExpenses += maintenance + tax;
            
            // Update property stats
            property.totalIncome += netIncome;
            property.lastIncomeTime = TimeSystem.getTotalMinutes();
            
            // Degrade condition slightly
            property.condition = Math.max(20, property.condition - 1);
        });
        
        // Apply to player
        game.player.gold += totalIncome;
        game.player.propertyIncome = totalIncome;
        game.player.propertyExpenses = totalExpenses;
        
        if (totalIncome > 0) {
            addMessage(`💰 Property income: +${totalIncome} gold (Expenses: ${totalExpenses} gold)`);
        }
    },
    
    // Upgrade property
    upgradeProperty(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        
        if (!property || !upgrade) {
            addMessage('Invalid property or upgrade!');
            return false;
        }
        
        // Check if already upgraded
        if (property.upgrades.includes(upgradeId)) {
            addMessage('Property already has this upgrade!');
            return false;
        }
        
        // Calculate upgrade cost
        const propertyType = this.propertyTypes[property.type];
        const upgradeCost = Math.round(propertyType.basePrice * upgrade.costMultiplier);
        
        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold for this upgrade!`);
            return false;
        }
        
        // Apply upgrade
        game.player.gold -= upgradeCost;
        property.upgrades.push(upgradeId);
        
        addMessage(`Upgraded ${propertyType.name} with ${upgrade.name} for ${upgradeCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Repair property
    repairProperty(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) {
            addMessage('Invalid property!');
            return false;
        }
        
        if (property.condition >= 100) {
            addMessage('Property is already in excellent condition!');
            return false;
        }
        
        const propertyType = this.propertyTypes[property.type];
        const repairCost = Math.round(propertyType.basePrice * 0.1 * (1 - property.condition / 100));
        
        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair this property!`);
            return false;
        }
        
        // Repair property
        game.player.gold -= repairCost;
        property.condition = 100;
        
        addMessage(`Repaired ${propertyType.name} for ${repairCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Update property display
    updatePropertyDisplay() {
        const container = document.getElementById('properties-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const properties = this.getPlayerProperties();
        
        if (properties.length === 0) {
            container.innerHTML = '<p class="empty-message">You own no properties yet.</p>';
            return;
        }
        
        properties.forEach(property => {
            const propertyElement = this.createPropertyElement(property);
            container.appendChild(propertyElement);
        });
    },
    
    // Create property element
    createPropertyElement(property) {
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        const element = document.createElement('div');
        element.className = 'property-item';
        element.dataset.propertyId = property.id;
        
        element.innerHTML = `
            <div class="property-header">
                <span class="property-icon">${propertyType.icon}</span>
                <span class="property-name">${propertyType.name}</span>
                <span class="property-location">${location ? location.name : 'Unknown'}</span>
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
                    <span class="stat-value">${this.calculatePropertyIncome(property)} gold/day</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Total Income:</span>
                    <span class="stat-value">${property.totalIncome} gold</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="property-action-btn" onclick="PropertySystem.showPropertyDetails('${property.id}')">Details</button>
                <button class="property-action-btn" onclick="PropertySystem.upgradePropertyLevel('${property.id}')">Upgrade</button>
                <button class="property-action-btn" onclick="PropertySystem.repairProperty('${property.id}')">Repair</button>
            </div>
        `;
        
        return element;
    },
    
    // Calculate property income with all modifiers
    calculatePropertyIncome(property) {
        const propertyType = this.propertyTypes[property.type];
        if (!propertyType) return 0;
        
        let income = propertyType.baseIncome;
        
        // Apply level multiplier
        income *= (1 + (property.level - 1) * 0.2);
        
        // Apply upgrade bonuses
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && upgrade.effects.incomeBonus) {
                income *= upgrade.effects.incomeBonus;
            }
        });
        
        // Apply condition modifier
        income *= (property.condition / 100);
        
        // Calculate maintenance and tax
        let maintenance = propertyType.maintenanceCost;
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && upgrade.effects.maintenanceReduction) {
                maintenance *= upgrade.effects.maintenanceReduction;
            }
        });
        
        const tax = Math.round(income * 0.1);
        const netIncome = Math.round(income - maintenance - tax);
        
        return Math.max(0, netIncome);
    },
    
    // Show property details
    showPropertyDetails(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        // Create details modal or panel
        const detailsHtml = `
            <div class="property-details">
                <h3>${propertyType.icon} ${propertyType.name} Details</h3>
                <div class="property-info">
                    <p><strong>Location:</strong> ${location ? location.name : 'Unknown'}</p>
                    <p><strong>Level:</strong> ${property.level}</p>
                    <p><strong>Condition:</strong> ${property.condition}%</p>
                    <p><strong>Purchase Price:</strong> ${property.purchasePrice} gold</p>
                    <p><strong>Total Income:</strong> ${property.totalIncome} gold</p>
                    <p><strong>Daily Income:</strong> ${this.calculatePropertyIncome(property)} gold</p>
                </div>
                <div class="property-upgrades">
                    <h4>Upgrades:</h4>
                    ${property.upgrades.length > 0 ? 
                        property.upgrades.map(upgradeId => {
                            const upgrade = this.upgrades[upgradeId];
                            return `<span class="upgrade-tag">${upgrade.icon} ${upgrade.name}</span>`;
                        }).join('') : 
                        '<p>No upgrades installed.</p>'
                    }
                </div>
                <div class="property-employees">
                    <h4>Employees:</h4>
                    ${property.employees.length > 0 ? 
                        property.employees.map(empId => {
                            const employee = EmployeeSystem.getEmployee(empId);
                            return `<span class="employee-tag">${employee.name}</span>`;
                        }).join('') : 
                        '<p>No employees assigned.</p>'
                    }
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage(`Viewing details for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);
    },
    
    // Upgrade property level
    upgradePropertyLevel(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        const propertyType = this.propertyTypes[property.type];
        const upgradeCost = Math.round(propertyType.basePrice * 0.5 * property.level);
        
        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold to upgrade this property!`);
            return false;
        }
        
        game.player.gold -= upgradeCost;
        property.level++;
        
        addMessage(`Upgraded ${propertyType.name} to level ${property.level} for ${upgradeCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    }
};