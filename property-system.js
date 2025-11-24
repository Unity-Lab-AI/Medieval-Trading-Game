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
        
        // Setup work queue processing
        this.setupWorkQueueProcessing();
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
    
    // Setup work queue processing
    setupWorkQueueProcessing() {
        // Process work queues every game minute
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Process work queues
            PropertySystem.processWorkQueues();
            
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
                    const calculatedPrice = this.calculatePropertyPrice(propertyId);
                    const dailyIncome = this.calculateProjectedIncome(propertyId);
                    const roiDays = dailyIncome > 0 ? Math.round(calculatedPrice / dailyIncome) : Infinity;
                    
                    availableProperties.push({
                        ...propertyType,
                        location: game.currentLocation.id,
                        calculatedPrice: calculatedPrice,
                        projectedDailyIncome: dailyIncome,
                        roiDays: roiDays,
                        affordability: this.canAffordProperty(propertyId),
                        requirements: this.getPropertyRequirements(propertyId)
                    });
                }
            }
        });
        
        return availableProperties;
    },
    
    // Calculate projected income for a property
    calculateProjectedIncome(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return 0;
        
        let income = propertyType.baseIncome;
        
        // Apply level 1 multiplier
        income *= 1;
        
        // Apply condition modifier (assuming 100% condition)
        income *= 1;
        
        // Calculate maintenance and tax
        const maintenance = propertyType.maintenanceCost;
        const tax = Math.round(income * 0.1);
        const netIncome = Math.round(income - maintenance - tax);
        
        return Math.max(0, netIncome);
    },
    
    // Check if player can afford property
    canAffordProperty(propertyId) {
        const price = this.calculatePropertyPrice(propertyId);
        return game.player.gold >= price;
    },
    
    // Get property requirements
    getPropertyRequirements(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return [];
        
        const requirements = [];
        
        // Gold requirement
        const price = this.calculatePropertyPrice(propertyId);
        requirements.push({
            type: 'gold',
            amount: price,
            met: game.player.gold >= price,
            description: `${price} gold`
        });
        
        // Location requirements
        const location = GameWorld.locations[game.currentLocation.id];
        if (location) {
            const locationProperties = {
                village: ['house', 'farm', 'market_stall'],
                town: ['house', 'shop', 'warehouse', 'tavern', 'craftshop'],
                city: ['house', 'shop', 'warehouse', 'tavern', 'craftshop', 'mine']
            };
            
            const allowedInLocation = locationProperties[location.type]?.includes(propertyId);
            requirements.push({
                type: 'location',
                amount: location.type,
                met: allowedInLocation,
                description: `Requires ${location.type} location`
            });
        }
        
        // Character requirements
        if (propertyId === 'mine') {
            const miningSkill = game.player.skills?.mining || 0;
            requirements.push({
                type: 'skill',
                amount: 2,
                met: miningSkill >= 2,
                description: `Mining skill level 2 (you have ${miningSkill})`
            });
        }
        
        if (propertyId === 'craftshop') {
            const craftingSkill = game.player.skills?.crafting || 0;
            requirements.push({
                type: 'skill',
                amount: 1,
                met: craftingSkill >= 1,
                description: `Crafting skill level 1 (you have ${craftingSkill})`
            });
        }
        
        return requirements;
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
            storageUsed: 0,
            storage: {},
            storageCapacity: 0,
            workQueue: [],
            productionLimits: this.getProductionLimits(propertyId),
            lastProductionTime: TimeSystem.getTotalMinutes(),
            totalProduction: {}
        };
        
        // Initialize storage for the new property
        this.initializePropertyStorage(newProperty.id);
        
        game.player.ownedProperties.push(newProperty);

        addMessage(`Purchased ${propertyType.name} in ${game.currentLocation.name} for ${price} gold!`);
        if (typeof celebrateTrade === 'function') {
            celebrateTrade(`Claimed ${propertyType.name}`, elements?.locationPanel);
        }
        if (typeof StatsSystem !== 'undefined') {
            StatsSystem.recordAction('propertyPurchased');
            StatsSystem.updateFromGame();
        }

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
        let totalMaintenance = 0;
        let totalTax = 0;
        
        game.player.ownedProperties.forEach(property => {
            const propertyType = this.propertyTypes[property.type];
            if (!propertyType) return;
            
            // Initialize storage if needed
            if (!property.storageCapacity) {
                this.initializePropertyStorage(property.id);
            }
            
            // Auto-store produced items
            this.autoStoreProducedItems(property.id);
            
            // Calculate base income
            let income = propertyType.baseIncome;
            
            // Apply level multiplier (20% per level)
            income *= (1 + (property.level - 1) * 0.2);
            
            // Apply upgrade bonuses
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.incomeBonus) {
                    income *= upgrade.effects.incomeBonus;
                }
            });
            
            // Apply condition modifier (condition affects efficiency)
            income *= (property.condition / 100);
            
            // Apply employee bonuses
            const assignedEmployees = property.employees.map(empId =>
                EmployeeSystem.getEmployee(empId)
            ).filter(emp => emp && emp.assignedProperty === property.id);
            
            let employeeBonus = 1;
            assignedEmployees.forEach(employee => {
                if (employee.skills && employee.skills.management) {
                    employeeBonus += employee.skills.management * 0.05; // 5% per management skill point
                }
                if (employee.skills && employee.skills.trading) {
                    employeeBonus += employee.skills.trading * 0.03; // 3% per trading skill point
                }
            });
            income *= employeeBonus;
            
            // Calculate maintenance cost
            let maintenance = propertyType.maintenanceCost;
            
            // Apply upgrade reductions
            property.upgrades.forEach(upgradeId => {
                const upgrade = this.upgrades[upgradeId];
                if (upgrade && upgrade.effects.maintenanceReduction) {
                    maintenance *= upgrade.effects.maintenanceReduction;
                }
            });
            
            // Apply condition modifier to maintenance (poor condition increases maintenance)
            if (property.condition < 50) {
                maintenance *= (2 - property.condition / 50); // Double maintenance at 0% condition
            }
            
            // Calculate tax (10% of gross income)
            const tax = Math.round(income * 0.1);
            
            // Net income
            const netIncome = Math.round(income - maintenance - tax);
            
            totalIncome += Math.max(0, netIncome);
            totalMaintenance += Math.round(maintenance);
            totalTax += tax;
            totalExpenses += Math.round(maintenance) + tax;
            
            // Update property stats
            property.totalIncome += netIncome;
            property.lastIncomeTime = TimeSystem.getTotalMinutes();
            
            // Apply reputation bonus if property has it
            if (propertyType.reputationBonus) {
                property.upgrades.forEach(upgradeId => {
                    const upgrade = this.upgrades[upgradeId];
                    if (upgrade && upgrade.effects.reputationBonus) {
                        CityReputationSystem.addReputation(property.location, upgrade.effects.reputationBonus);
                    }
                });
            }
            
            // Degrade condition slightly (properties need maintenance)
            let conditionLoss = 1;
            
            // Security upgrade reduces condition loss
            if (property.upgrades.includes('security')) {
                conditionLoss *= 0.5;
            }
            
            // High employee skill reduces condition loss
            const skilledEmployees = assignedEmployees.filter(emp =>
                emp.skills && (emp.skills.maintenance || emp.skills.management)
            );
            if (skilledEmployees.length > 0) {
                conditionLoss *= 0.7;
            }
            
            property.condition = Math.max(20, property.condition - conditionLoss);
            
            // Random events for properties
            this.processPropertyEvents(property);
        });
        
        // Apply to player
        game.player.gold += totalIncome;
        game.player.propertyIncome = totalIncome;
        game.player.propertyExpenses = totalExpenses;
        
        if (totalIncome > 0) {
            addMessage(`💰 Property income: +${totalIncome} gold (Maintenance: ${totalMaintenance} gold, Tax: ${totalTax} gold)`);
        }
    },
    
    // Process random property events
    processPropertyEvents(property) {
        const propertyType = this.propertyTypes[property.type];
        
        // Only process events occasionally (5% chance per day)
        if (Math.random() > 0.05) return;
        
        const events = [
            {
                name: 'Minor Damage',
                condition: property.condition > 30,
                effect: () => {
                    property.condition = Math.max(20, property.condition - 5);
                    addMessage(`⚠️ ${propertyType.name} suffered minor damage! Condition: ${property.condition}%`);
                }
            },
            {
                name: 'Vandalism',
                condition: !property.upgrades.includes('security'),
                effect: () => {
                    property.condition = Math.max(20, property.condition - 10);
                    addMessage(`🔨 ${propertyType.name} was vandalized! Condition: ${property.condition}%`);
                }
            },
            {
                name: 'Good Business',
                condition: propertyType.baseIncome > 0,
                effect: () => {
                    const bonus = Math.round(propertyType.baseIncome * 0.5);
                    game.player.gold += bonus;
                    addMessage(`🎉 ${propertyType.name} had excellent business! +${bonus} gold bonus!`);
                }
            },
            {
                name: 'Inspection',
                condition: property.condition < 50,
                effect: () => {
                    const fine = Math.round(propertyType.maintenanceCost * 2);
                    game.player.gold = Math.max(0, game.player.gold - fine);
                    addMessage(`📋 ${propertyType.name} failed inspection! Fine: ${fine} gold`);
                }
            }
        ];
        
        // Select random event
        const validEvents = events.filter(event => event.condition);
        if (validEvents.length > 0) {
            const event = validEvents[Math.floor(Math.random() * validEvents.length)];
            event.effect();
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
        
        // Check upgrade requirements
        const requirements = this.getUpgradeRequirements(propertyId, upgradeId);
        const unmetRequirements = requirements.filter(req => !req.met);
        
        if (unmetRequirements.length > 0) {
            addMessage('Cannot upgrade property. Unmet requirements:');
            unmetRequirements.forEach(req => {
                addMessage(`- ${req.description}`);
            });
            return false;
        }
        
        // Calculate upgrade cost
        const propertyType = this.propertyTypes[property.type];
        const upgradeCost = this.calculateUpgradeCost(propertyId, upgradeId);
        
        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold for this upgrade!`);
            return false;
        }
        
        // Apply upgrade
        game.player.gold -= upgradeCost;
        property.upgrades.push(upgradeId);

        // Apply upgrade effects
        this.applyUpgradeEffects(propertyId, upgradeId);

        addMessage(`Upgraded ${propertyType.name} with ${upgrade.name} for ${upgradeCost} gold!`);
        if (typeof celebrateTrade === 'function') {
            celebrateTrade(`Upgraded ${propertyType.name}`, elements?.locationPanel);
        }

        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Get upgrade requirements
    getUpgradeRequirements(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        if (!property || !upgrade) return [];
        
        const requirements = [];
        
        // Gold requirement
        const upgradeCost = this.calculateUpgradeCost(propertyId, upgradeId);
        requirements.push({
            type: 'gold',
            amount: upgradeCost,
            met: game.player.gold >= upgradeCost,
            description: `${upgradeCost} gold`
        });
        
        // Property level requirements
        if (upgradeId === 'luxury') {
            requirements.push({
                type: 'level',
                amount: 3,
                met: property.level >= 3,
                description: `Property level 3 (current: ${property.level})`
            });
        }
        
        // Prerequisite upgrades
        if (upgradeId === 'efficiency') {
            const hasSecurity = property.upgrades.includes('security');
            requirements.push({
                type: 'prerequisite',
                amount: 'security',
                met: hasSecurity,
                description: 'Security upgrade required'
            });
        }
        
        return requirements;
    },
    
    // Calculate upgrade cost with modifiers
    calculateUpgradeCost(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        if (!property || !upgrade) return 0;
        
        const propertyType = this.propertyTypes[property.type];
        let baseCost = propertyType.basePrice * upgrade.costMultiplier;
        
        // Apply level modifier (upgrades get more expensive for higher level properties)
        baseCost *= (1 + (property.level - 1) * 0.2);
        
        // Apply reputation modifier
        const reputation = CityReputationSystem.getReputation(property.location);
        const reputationModifier = 1 - (reputation * 0.001); // Small discount for good reputation
        baseCost *= Math.max(0.8, reputationModifier);
        
        return Math.round(baseCost);
    },
    
    // Apply upgrade effects to property
    applyUpgradeEffects(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        if (!property || !upgrade) return;
        
        // Apply immediate effects
        if (upgrade.effects.storageBonus) {
            // Recalculate storage capacity
            this.initializePropertyStorage(propertyId);
        }
        
        if (upgrade.effects.incomeBonus) {
            // Income bonus is applied in calculatePropertyIncome
        }
        
        if (upgrade.effects.maintenanceReduction) {
            // Maintenance reduction is applied in calculatePropertyIncome
        }
        
        if (upgrade.effects.productionBonus) {
            // Production bonus is applied in work queue processing
        }
        
        if (upgrade.effects.damageReduction) {
            // Damage reduction affects condition degradation
        }
        
        if (upgrade.effects.reputationBonus) {
            // Reputation bonus is applied daily
        }
        
        // Apply property-specific benefits
        this.applyPropertySpecificBenefits(propertyId);
    },
    
    // Apply property-specific benefits
    applyPropertySpecificBenefits(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        
        // Reset property benefits
        property.benefits = property.benefits || {};
        
        // Storage benefit
        if (propertyType.storageBonus) {
            property.benefits.storageCapacity = this.getStorageCapacity(propertyId);
        }
        
        // Production benefit
        if (propertyType.production) {
            property.benefits.production = { ...propertyType.production };
            
            // Apply upgrade bonuses to production
            if (property.upgrades.includes('efficiency')) {
                for (const [item, amount] of Object.entries(property.benefits.production)) {
                    property.benefits.production[item] = Math.round(amount * 1.3);
                }
            }
        }
        
        // Employee slot benefits
        if (propertyType.workerSlots) {
            property.benefits.workerSlots = propertyType.workerSlots;
        }
        
        if (propertyType.merchantSlots) {
            property.benefits.merchantSlots = propertyType.merchantSlots;
        }
        
        // Special benefits
        if (propertyType.restBonus) {
            property.benefits.restBonus = true;
        }
        
        if (propertyType.reputationBonus) {
            property.benefits.reputationBonus = propertyType.reputationBonus;
        }
        
        // Apply upgrade-based benefits
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade.effects.storageBonus) {
                property.benefits.storageCapacity = Math.round(
                    (property.benefits.storageCapacity || 0) * upgrade.effects.storageBonus
                );
            }
        });
    },
    
    // Get property benefits
    getPropertyBenefits(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return {};
        
        // Ensure benefits are up to date
        this.applyPropertySpecificBenefits(propertyId);
        
        return property.benefits || {};
    },
    
    // Get property production capacity
    getProductionCapacity(propertyId) {
        const benefits = this.getPropertyBenefits(propertyId);
        return benefits.production || {};
    },
    
    // Get property employee capacity
    getEmployeeCapacity(propertyId) {
        const benefits = this.getPropertyBenefits(propertyId);
        const capacity = {
            total: 0,
            workers: benefits.workerSlots || 0,
            merchants: benefits.merchantSlots || 0,
            guards: 0
        };
        
        capacity.total = capacity.workers + capacity.merchants + capacity.guards;
        
        // Security upgrade allows 1 guard
        const property = this.getProperty(propertyId);
        if (property && property.upgrades.includes('security')) {
            capacity.guards = 1;
            capacity.total += 1;
        }
        
        return capacity;
    },
    
    // Check if property can accept more employees
    canAcceptEmployee(propertyId, employeeRole) {
        const capacity = this.getEmployeeCapacity(propertyId);
        const property = this.getProperty(propertyId);
        
        if (!property) return false;
        
        const currentEmployees = property.employees.length;
        
        // Check total capacity
        if (currentEmployees >= capacity.total) return false;
        
        // Check role-specific capacity
        if (employeeRole === 'worker' && property.employees.filter(empId => {
            const emp = EmployeeSystem.getEmployee(empId);
            return emp && emp.role === 'worker';
        }).length >= capacity.workers) {
            return false;
        }
        
        if (employeeRole === 'merchant' && property.employees.filter(empId => {
            const emp = EmployeeSystem.getEmployee(empId);
            return emp && emp.role === 'merchant';
        }).length >= capacity.merchants) {
            return false;
        }
        
        if (employeeRole === 'guard' && property.employees.filter(empId => {
            const emp = EmployeeSystem.getEmployee(empId);
            return emp && emp.role === 'guard';
        }).length >= capacity.guards) {
            return false;
        }
        
        return true;
    },
    
    // Get property special abilities
    getPropertySpecialAbilities(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return [];
        
        const propertyType = this.propertyTypes[property.type];
        const abilities = [];
        
        // Base abilities from property type
        if (propertyType.restBonus) {
            abilities.push({
                name: 'Rest Bonus',
                description: 'Provides rest and recovery benefits when visited',
                icon: '😴'
            });
        }
        
        if (propertyType.reputationBonus) {
            abilities.push({
                name: 'Reputation Bonus',
                description: `+${propertyType.reputationBonus} reputation per day`,
                icon: '⭐'
            });
        }
        
        // Abilities from upgrades
        property.upgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade.effects.productionBonus) {
                abilities.push({
                    name: 'Enhanced Production',
                    description: '+30% production efficiency',
                    icon: '⚡'
                });
            }
            
            if (upgrade.effects.damageReduction) {
                abilities.push({
                    name: 'Damage Reduction',
                    description: '50% less condition degradation',
                    icon: '🛡️'
                });
            }
        });
        
        return abilities;
    },
    
    // Show upgrade interface
    showUpgradeInterface(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        const availableUpgrades = this.getAvailableUpgrades(propertyId);
        
        if (availableUpgrades.length === 0) {
            addMessage('No upgrades available for this property.');
            return;
        }
        
        // Create upgrade interface HTML
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
                                const upgrade = this.upgrades[upgradeId];
                                return `<span class="upgrade-tag">${upgrade.icon} ${upgrade.name}</span>`;
                            }).join(' ') :
                            '<span class="no-upgrades">None</span>'
                        }
                    </div>
                </div>
                <div class="upgrades-grid" id="upgrades-grid">
                    <!-- Upgrades will be populated here -->
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage(`Managing upgrades for ${propertyType.name}...`);
        
        // Populate upgrades grid
        this.populateUpgradesGrid(availableUpgrades, propertyId);
    },
    
    // Get available upgrades for a property
    getAvailableUpgrades(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return [];
        
        const availableUpgrades = [];
        
        for (const [upgradeId, upgrade] of Object.entries(this.upgrades)) {
            // Skip if already upgraded
            if (property.upgrades.includes(upgradeId)) continue;
            
            // Check if upgrade is available for this property type
            const propertyType = this.propertyTypes[property.type];
            if (!this.isUpgradeAvailableForPropertyType(upgradeId, propertyType)) continue;
            
            const upgradeCost = this.calculateUpgradeCost(propertyId, upgradeId);
            const requirements = this.getUpgradeRequirements(propertyId, upgradeId);
            const canAfford = game.player.gold >= upgradeCost;
            const requirementsMet = requirements.every(req => req.met);
            
            availableUpgrades.push({
                ...upgrade,
                cost: upgradeCost,
                affordability: canAfford,
                requirementsMet: requirementsMet,
                requirements: requirements,
                projectedBenefits: this.calculateUpgradeBenefits(propertyId, upgradeId)
            });
        }
        
        return availableUpgrades;
    },
    
    // Check if upgrade is available for property type
    isUpgradeAvailableForPropertyType(upgradeId, propertyType) {
        // Some upgrades are only available for certain property types
        const upgradeRestrictions = {
            efficiency: ['farm', 'mine', 'craftshop', 'tavern'], // Only for production properties
            luxury: ['shop', 'tavern', 'warehouse'], // Only for commercial properties
            expansion: ['house', 'shop', 'warehouse', 'farm', 'mine', 'tavern', 'craftshop'], // Available for all
            security: ['shop', 'warehouse', 'mine', 'tavern'] // Only for valuable properties
        };
        
        const allowedTypes = upgradeRestrictions[upgradeId];
        return !allowedTypes || allowedTypes.includes(propertyType.id);
    },
    
    // Calculate upgrade benefits
    calculateUpgradeBenefits(propertyId, upgradeId) {
        const property = this.getProperty(propertyId);
        const upgrade = this.upgrades[upgradeId];
        if (!property || !upgrade) return {};
        
        const benefits = {};
        const currentIncome = this.calculatePropertyIncome(property);
        
        if (upgrade.effects.incomeBonus) {
            benefits.incomeIncrease = Math.round(currentIncome * (upgrade.effects.incomeBonus - 1));
        }
        
        if (upgrade.effects.maintenanceReduction) {
            const propertyType = this.propertyTypes[property.type];
            const currentMaintenance = propertyType.maintenanceCost;
            benefits.maintenanceSavings = Math.round(currentMaintenance * (1 - upgrade.effects.maintenanceReduction));
        }
        
        if (upgrade.effects.storageBonus) {
            const currentCapacity = this.getStorageCapacity(propertyId);
            benefits.storageIncrease = Math.round(currentCapacity * (upgrade.effects.storageBonus - 1));
        }
        
        if (upgrade.effects.productionBonus) {
            benefits.productionIncrease = Math.round((upgrade.effects.productionBonus - 1) * 100) + '%';
        }
        
        if (upgrade.effects.reputationBonus) {
            benefits.reputationIncrease = upgrade.effects.reputationBonus;
        }
        
        return benefits;
    },
    
    // Populate upgrades grid
    populateUpgradesGrid(upgrades, propertyId) {
        const grid = document.getElementById('upgrades-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        upgrades.forEach(upgrade => {
            const upgradeCard = this.createUpgradeCard(upgrade, propertyId);
            grid.appendChild(upgradeCard);
        });
    },
    
    // Create upgrade card
    createUpgradeCard(upgrade, propertyId) {
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
                        onclick="PropertySystem.upgradeProperty('${propertyId}', '${upgrade.id}')"
                        ${!upgrade.affordability || !upgrade.requirementsMet ? 'disabled' : ''}>
                    ${upgrade.affordability && upgrade.requirementsMet ? 'Purchase Upgrade' : 'Cannot Purchase'}
                </button>
            </div>
        `;
        
        return card;
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
        const repairCost = this.calculateRepairCost(propertyId);
        
        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair this property!`);
            return false;
        }
        
        // Repair property
        game.player.gold -= repairCost;
        property.condition = 100;
        
        // Apply repair benefits
        this.applyRepairBenefits(propertyId);
        
        addMessage(`Repaired ${propertyType.name} to full condition for ${repairCost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updatePropertyDisplay();
        
        return true;
    },
    
    // Calculate repair cost based on condition and property type
    calculateRepairCost(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return 0;
        
        const propertyType = this.propertyTypes[property.type];
        const conditionDeficit = 100 - property.condition;
        
        // Base repair cost is 10% of property price per 100% condition
        let baseCost = propertyType.basePrice * 0.1 * (conditionDeficit / 100);
        
        // Apply modifiers
        // Security upgrade reduces repair costs
        if (property.upgrades.includes('security')) {
            baseCost *= 0.8; // 20% discount
        }
        
        // Player skills affect repair cost
        const craftingSkill = game.player.skills?.crafting || 0;
        const repairDiscount = Math.min(0.3, craftingSkill * 0.05); // Up to 30% discount
        baseCost *= (1 - repairDiscount);
        
        // Location reputation affects repair cost
        const reputation = CityReputationSystem.getReputation(property.location);
        const reputationDiscount = Math.min(0.2, reputation * 0.002); // Up to 20% discount
        baseCost *= (1 - reputationDiscount);
        
        return Math.round(baseCost);
    },
    
    // Apply repair benefits
    applyRepairBenefits(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        // Full repair provides temporary efficiency boost
        property.repairBonus = {
            active: true,
            duration: 7, // 7 days
            efficiency: 1.1 // 10% efficiency boost
        };
        
        // Update property benefits
        this.applyPropertySpecificBenefits(propertyId);
    },
    
    // Process repair bonuses (called daily)
    processRepairBonuses() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;
        
        game.player.ownedProperties.forEach(property => {
            if (property.repairBonus && property.repairBonus.active) {
                property.repairBonus.duration--;
                
                if (property.repairBonus.duration <= 0) {
                    property.repairBonus.active = false;
                    addMessage(`🔧 Repair bonus expired for ${this.propertyTypes[property.type].name}`);
                }
            }
        });
    },
    
    // Get property condition status
    getPropertyConditionStatus(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return 'unknown';
        
        if (property.condition >= 90) return 'excellent';
        if (property.condition >= 75) return 'good';
        if (property.condition >= 50) return 'fair';
        if (property.condition >= 25) return 'poor';
        return 'critical';
    },
    
    // Get property condition color for UI
    getPropertyConditionColor(propertyId) {
        const status = this.getPropertyConditionStatus(propertyId);
        
        const colors = {
            excellent: '#4CAF50', // Green
            good: '#8BC34A', // Light Green
            fair: '#FFC107', // Yellow
            poor: '#FF9800', // Orange
            critical: '#F44336', // Red
            unknown: '#9E9E9E' // Grey
        };
        
        return colors[status] || colors.unknown;
    },
    
    // Check if property needs urgent repair
    needsUrgentRepair(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        return property.condition < 30;
    },
    
    // Get property repair recommendations
    getRepairRecommendations(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return [];
        
        const recommendations = [];
        const conditionStatus = this.getPropertyConditionStatus(propertyId);
        
        if (property.condition < 30) {
            recommendations.push({
                priority: 'urgent',
                message: 'Property is in critical condition and may suffer permanent damage!',
                action: 'repair'
            });
        } else if (property.condition < 50) {
            recommendations.push({
                priority: 'high',
                message: 'Property condition is poor and affecting efficiency.',
                action: 'repair'
            });
        } else if (property.condition < 75) {
            recommendations.push({
                priority: 'medium',
                message: 'Property condition could be improved for better performance.',
                action: 'repair'
            });
        }
        
        // Recommend security upgrade if property is frequently damaged
        if (!property.upgrades.includes('security') && property.condition < 60) {
            recommendations.push({
                priority: 'low',
                message: 'Security upgrade can reduce damage and repair costs.',
                action: 'upgrade_security'
            });
        }
        
        return recommendations;
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
        
        // Initialize storage if not already done
        if (!property.storageCapacity) {
            this.initializePropertyStorage(property.id);
        }
        
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
                    <span class="stat-value">${this.calculatePropertyIncomeById(property.id)} gold/day</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Total Income:</span>
                    <span class="stat-value">${property.totalIncome} gold</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Storage:</span>
                    <span class="stat-value">${this.getStorageUsed(property.id)}/${this.getStorageCapacity(property.id)} lbs</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="property-action-btn" onclick="PropertySystem.showPropertyDetails('${property.id}')">Details</button>
                <button class="property-action-btn" onclick="PropertySystem.showUpgradeInterface('${property.id}')">Upgrades</button>
                <button class="property-action-btn" onclick="PropertySystem.repairProperty('${property.id}')">Repair</button>
                <button class="property-action-btn" onclick="PropertySystem.showStorageManagement('${property.id}')">Storage</button>
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
    
    // Calculate property income by ID (wrapper function)
    calculatePropertyIncomeById(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return 0;
        return this.calculatePropertyIncome(property);
    },
    
    // Show property details
    showPropertyDetails(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        // Initialize storage if not already done
        if (!property.storageCapacity) {
            this.initializePropertyStorage(property.id);
        }
        
        // Get work queue for this property
        const workQueue = this.getWorkQueue(propertyId);
        
        // Create details modal or panel
        const detailsHtml = `
            <div class="property-details">
                <div class="property-details-header">
                    <h3>${propertyType.icon} ${propertyType.name} Details</h3>
                    <div class="mini-actions">
                        <button class="mini-action-btn" onclick="PropertySystem.showUpgradeInterface('${propertyId}')" title="Upgrades">🔧</button>
                        <button class="mini-action-btn" onclick="PropertySystem.repairProperty('${propertyId}')" title="Repair">🔨</button>
                        <button class="mini-action-btn" onclick="PropertySystem.upgradePropertyLevel('${propertyId}')" title="Level Up">⬆️</button>
                        <button class="mini-action-btn" onclick="PropertySystem.showStorageManagement('${propertyId}')" title="Storage">📦</button>
                    </div>
                </div>
                <div class="property-info">
                    <div class="info-row">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${location ? location.name : 'Unknown'}</span>
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
                        <span class="info-value income-positive">${this.calculatePropertyIncome(property)} gold</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Storage:</span>
                        <span class="info-value">${this.getStorageUsed(propertyId)}/${this.getStorageCapacity(propertyId)} lbs</span>
                    </div>
                </div>
                <div class="property-upgrades">
                    <h4>Upgrades:</h4>
                    ${property.upgrades.length > 0 ?
                        property.upgrades.map(upgradeId => {
                            const upgrade = this.upgrades[upgradeId];
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
                                    <button class="cancel-work-btn" onclick="PropertySystem.cancelWorkItem('${propertyId}', '${work.id}')" title="Cancel">✕</button>
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
                                const employee = EmployeeSystem.getEmployee(empId);
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
        `;
        
        // Show in a modal or update a panel
        addMessage(`Viewing details for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);
        
        // Create modal for detailed view
        this.showModal(`
            <div class="property-details-modal">
                <div class="modal-header">
                    <h2>${propertyType.icon} ${propertyType.name}</h2>
                    <button class="close-btn" onclick="PropertySystem.closePropertyDetails()">✕</button>
                </div>
                <div class="modal-content">
                    ${detailsHtml}
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="PropertySystem.showUpgradeInterface('${propertyId}')">Manage Upgrades</button>
                    <button class="secondary-btn" onclick="PropertySystem.showStorageManagement('${propertyId}')">Manage Storage</button>
                    <button class="secondary-btn" onclick="PropertySystem.closePropertyDetails()">Close</button>
                </div>
            </div>
        `);
    },
    
    // Show storage management interface
    showStorageManagement(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = this.propertyTypes[property.type];
        const location = GameWorld.locations[property.location];
        
        // Create storage management modal or panel
        const storageHtml = `
            <div class="storage-management">
                <h3>${propertyType.icon} ${propertyType.name} Storage Management</h3>
                <div class="storage-location">
                    <p><strong>Location:</strong> ${location ? location.name : 'Unknown'}</p>
                    <p><strong>Storage Capacity:</strong> ${this.getStorageUsed(propertyId)}/${this.getStorageCapacity(propertyId)} lbs</p>
                </div>
                <div class="storage-tabs">
                    <button class="storage-tab active" onclick="PropertySystem.switchStorageTab('${propertyId}', 'stored')">Stored Items</button>
                    <button class="storage-tab" onclick="PropertySystem.switchStorageTab('${propertyId}', 'transfer')">Transfer Items</button>
                </div>
                <div class="storage-content">
                    <div id="property-storage-${propertyId}" class="storage-items">
                        <!-- Storage items will be populated here -->
                    </div>
                    <div id="property-transfer-${propertyId}" class="storage-transfer hidden">
                        <!-- Transfer interface will be populated here -->
                    </div>
                </div>
                <div id="property-storage-info-${propertyId}" class="storage-info">
                    <!-- Storage info will be populated here -->
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage(`Managing storage for ${propertyType.name} in ${location ? location.name : 'Unknown'}`);
        
        // Update storage display
        this.updateStorageDisplay(propertyId);
        this.updateTransferDisplay(propertyId);
    },
    
    // Switch storage tab
    switchStorageTab(propertyId, tab) {
        const storedTab = document.querySelector(`#property-storage-${propertyId}`);
        const transferTab = document.querySelector(`#property-transfer-${propertyId}`);
        const tabButtons = document.querySelectorAll(`.storage-tab`);
        
        // Hide all tabs
        if (storedTab) storedTab.classList.add('hidden');
        if (transferTab) transferTab.classList.add('hidden');
        
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        if (tab === 'stored') {
            if (storedTab) storedTab.classList.remove('hidden');
            tabButtons[0].classList.add('active');
        } else if (tab === 'transfer') {
            if (transferTab) transferTab.classList.remove('hidden');
            tabButtons[1].classList.add('active');
            this.updateTransferDisplay(propertyId);
        }
    },
    
    // Update transfer display
    updateTransferDisplay(propertyId) {
        const transferContainer = document.getElementById(`property-transfer-${propertyId}`);
        if (!transferContainer) return;
        
        transferContainer.innerHTML = `
            <div class="transfer-section">
                <h4>Transfer from Player Inventory</h4>
                <div class="transfer-items" id="transfer-from-inventory-${propertyId}">
                    <!-- Player inventory items will be populated here -->
                </div>
            </div>
            <div class="transfer-section">
                <h4>Transfer Between Properties</h4>
                <div class="property-selector">
                    <select id="transfer-property-select-${propertyId}">
                        <option value="">Select destination property...</option>
                    </select>
                </div>
                <div class="transfer-items" id="transfer-between-properties-${propertyId}">
                    <!-- Property items will be populated here -->
                </div>
            </div>
        `;
        
        // Populate player inventory items
        this.populateTransferFromInventory(propertyId);
        
        // Populate property selector
        this.populatePropertySelector(propertyId);
    },
    
    // Populate transfer from inventory
    populateTransferFromInventory(propertyId) {
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
            itemElement.innerHTML = `
                <div class="transfer-item-icon">${itemIcon}</div>
                <div class="transfer-item-name">${itemName}</div>
                <div class="transfer-item-quantity">×${quantity}</div>
                <button class="transfer-btn" onclick="PropertySystem.transferToStorage('${propertyId}', '${itemId}', 1)">Store 1</button>
                <button class="transfer-btn" onclick="PropertySystem.transferToStorage('${propertyId}', '${itemId}', ${Math.min(10, quantity)})">Store 10</button>
                <button class="transfer-btn" onclick="PropertySystem.transferToStorage('${propertyId}', '${itemId}', ${quantity})">Store All</button>
            `;
            
            container.appendChild(itemElement);
        }
    },
    
    // Populate property selector for transfer
    populatePropertySelector(propertyId) {
        const selector = document.getElementById(`transfer-property-select-${propertyId}`);
        if (!selector) return;
        
        // Clear existing options except first one
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Add other properties as options
        game.player.ownedProperties.forEach(property => {
            if (property.id !== propertyId) {
                const propertyType = this.propertyTypes[property.type];
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${propertyType.name} (${property.location})`;
                selector.appendChild(option);
            }
        });
        
        // Add change event listener
        selector.addEventListener('change', () => {
            const selectedPropertyId = selector.value;
            if (selectedPropertyId) {
                this.populateTransferBetweenProperties(propertyId, selectedPropertyId);
            }
        });
    },
    
    // Populate transfer between properties
    populateTransferBetweenProperties(fromPropertyId, toPropertyId) {
        const container = document.getElementById(`transfer-between-properties-${fromPropertyId}`);
        if (!container) return;
        
        const fromProperty = this.getProperty(fromPropertyId);
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
            itemElement.innerHTML = `
                <div class="transfer-item-icon">${itemIcon}</div>
                <div class="transfer-item-name">${itemName}</div>
                <div class="transfer-item-quantity">×${quantity}</div>
                <button class="transfer-btn" onclick="PropertySystem.transferItemsBetweenProperties('${fromPropertyId}', '${toPropertyId}', '${itemId}', 1)">Transfer 1</button>
                <button class="transfer-btn" onclick="PropertySystem.transferItemsBetweenProperties('${fromPropertyId}', '${toPropertyId}', '${itemId}', ${Math.min(10, quantity)})">Transfer 10</button>
                <button class="transfer-btn" onclick="PropertySystem.transferItemsBetweenProperties('${fromPropertyId}', '${toPropertyId}', '${itemId}', ${quantity})">Transfer All</button>
            `;
            
            container.appendChild(itemElement);
        }
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
    },
    
    // Universal Storage System
    // Initialize storage for a property
    initializePropertyStorage(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        if (!property.storage) {
            property.storage = {};
        }
        
        // Get storage capacity based on property type and upgrades
        const propertyType = this.propertyTypes[property.type];
        let capacity = propertyType.storageBonus || 0;
        
        // Apply expansion upgrades
        if (property.upgrades.includes('expansion')) {
            capacity *= 1.5;
        }
        
        property.storageCapacity = capacity;
        property.storageUsed = this.calculateStorageUsed(propertyId);
        
        return true;
    },
    
    // Calculate storage used by a property
    calculateStorageUsed(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property || !property.storage) return 0;
        
        let totalWeight = 0;
        for (const [itemId, quantity] of Object.entries(property.storage)) {
            if (typeof ItemDatabase !== 'undefined') {
                totalWeight += ItemDatabase.calculateWeight(itemId, quantity);
            } else {
                // Fallback weight calculation
                totalWeight += quantity * 1; // Default 1 lb per item
            }
        }
        
        return totalWeight;
    },
    
    // Get storage capacity for a property
    getStorageCapacity(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return 0;
        
        if (property.storageCapacity === undefined) {
            this.initializePropertyStorage(propertyId);
        }
        
        return property.storageCapacity;
    },
    
    // Get storage used by a property
    getStorageUsed(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return 0;
        
        if (property.storageUsed === undefined) {
            property.storageUsed = this.calculateStorageUsed(propertyId);
        }
        
        return property.storageUsed;
    },
    
    // Get available storage space for a property
    getAvailableStorage(propertyId) {
        return this.getStorageCapacity(propertyId) - this.getStorageUsed(propertyId);
    },
    
    // Add items to property storage
    addToPropertyStorage(propertyId, itemId, quantity) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        // Initialize storage if needed
        if (!property.storage) {
            this.initializePropertyStorage(propertyId);
        }
        
        // Check storage capacity
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;
        
        if (this.getStorageUsed(propertyId) + itemWeight > this.getStorageCapacity(propertyId)) {
            addMessage(`Not enough storage space in ${property.name || 'property'}!`);
            return false;
        }
        
        // Add items to storage
        if (!property.storage[itemId]) {
            property.storage[itemId] = 0;
        }
        property.storage[itemId] += quantity;
        
        // Update storage used
        property.storageUsed += itemWeight;
        
        // Remove from player inventory if specified
        if (arguments.length > 3 && arguments[3] === true) {
            if (game.player.inventory[itemId]) {
                game.player.inventory[itemId] -= quantity;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }
            }
            updateCurrentLoad();
        }
        
        return true;
    },
    
    // Remove items from property storage
    removeFromPropertyStorage(propertyId, itemId, quantity) {
        const property = this.getProperty(propertyId);
        if (!property || !property.storage) return false;
        
        // Check if property has enough items
        if (!property.storage[itemId] || property.storage[itemId] < quantity) {
            addMessage(`${property.name || 'Property'} doesn't have enough ${itemId}!`);
            return false;
        }
        
        // Calculate item weight
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;
        
        // Remove items from storage
        property.storage[itemId] -= quantity;
        if (property.storage[itemId] <= 0) {
            delete property.storage[itemId];
        }
        
        // Update storage used
        property.storageUsed -= itemWeight;
        
        // Add to player inventory if specified
        if (arguments.length > 3 && arguments[3] === true) {
            if (!game.player.inventory[itemId]) {
                game.player.inventory[itemId] = 0;
            }
            game.player.inventory[itemId] += quantity;
            updateCurrentLoad();
        }
        
        return true;
    },
    
    // Transfer items between properties
    transferItemsBetweenProperties(fromPropertyId, toPropertyId, itemId, quantity) {
        const fromProperty = this.getProperty(fromPropertyId);
        const toProperty = this.getProperty(toPropertyId);
        
        if (!fromProperty || !toProperty) return false;
        
        // Check if source property has enough items
        if (!fromProperty.storage || !fromProperty.storage[itemId] ||
            fromProperty.storage[itemId] < quantity) {
            addMessage(`${fromProperty.name || 'Source property'} doesn't have enough ${itemId}!`);
            return false;
        }
        
        // Check if destination has enough storage
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;
        
        if (this.getStorageUsed(toPropertyId) + itemWeight > this.getStorageCapacity(toPropertyId)) {
            addMessage(`Not enough storage space in ${toProperty.name || 'destination property'}!`);
            return false;
        }
        
        // Remove from source
        this.removeFromPropertyStorage(fromPropertyId, itemId, quantity);
        
        // Add to destination
        this.addToPropertyStorage(toPropertyId, itemId, quantity);
        
        addMessage(`Transferred ${quantity} ${itemId} from ${fromProperty.name || 'property'} to ${toProperty.name || 'property'}!`);
        
        return true;
    },
    
    // Get all items stored across all properties
    getAllStoredItems() {
        const allItems = {};
        
        game.player.ownedProperties.forEach(property => {
            if (property.storage) {
                for (const [itemId, quantity] of Object.entries(property.storage)) {
                    if (!allItems[itemId]) {
                        allItems[itemId] = 0;
                    }
                    allItems[itemId] += quantity;
                }
            }
        });
        
        return allItems;
    },
    
    // Find properties that contain a specific item
    findPropertiesWithItem(itemId) {
        const properties = [];
        
        game.player.ownedProperties.forEach(property => {
            if (property.storage && property.storage[itemId] && property.storage[itemId] > 0) {
                properties.push({
                    id: property.id,
                    name: this.propertyTypes[property.type].name,
                    location: property.location,
                    quantity: property.storage[itemId]
                });
            }
        });
        
        return properties;
    },
    
    // Auto-store produced items from work queues
    autoStoreProducedItems(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property || !property.totalProduction) return;
        
        for (const [itemId, quantity] of Object.entries(property.totalProduction)) {
            if (quantity > 0) {
                // Try to store in the property first
                if (!this.addToPropertyStorage(propertyId, itemId, quantity)) {
                    // If property is full, try to store in other properties
                    const otherProperties = game.player.ownedProperties.filter(p => p.id !== propertyId);
                    let stored = false;
                    
                    for (const otherProperty of otherProperties) {
                        if (this.addToPropertyStorage(otherProperty.id, itemId, quantity)) {
                            addMessage(`${quantity} ${itemId} auto-stored in ${this.propertyTypes[otherProperty.type].name}!`);
                            stored = true;
                            break;
                        }
                    }
                    
                    // If no storage available, add to player inventory if possible
                    if (!stored) {
                        if (!game.player.inventory[itemId]) {
                            game.player.inventory[itemId] = 0;
                        }
                        game.player.inventory[itemId] += quantity;
                        addMessage(`${quantity} ${itemId} added to your inventory (no storage available)!`);
                    }
                }
                
                // Reset production count
                property.totalProduction[itemId] = 0;
            }
        }
    },
    
    // Update property storage display
    updateStorageDisplay(propertyId) {
        const property = this.getProperty(propertyId);
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
            
            itemElement.innerHTML = `
                <div class="storage-item-icon">${itemIcon}</div>
                <div class="storage-item-name">${itemName}</div>
                <div class="storage-item-quantity">×${quantity}</div>
                <button class="storage-item-btn" onclick="PropertySystem.transferFromStorage('${propertyId}', '${itemId}', 1)">Take 1</button>
                <button class="storage-item-btn" onclick="PropertySystem.transferFromStorage('${propertyId}', '${itemId}', ${Math.min(10, quantity)})">Take 10</button>
                <button class="storage-item-btn" onclick="PropertySystem.transferFromStorage('${propertyId}', '${itemId}', ${quantity})">Take All</button>
            `;
            
            storageContainer.appendChild(itemElement);
        }
        
        // Update storage info
        const storageInfo = document.getElementById(`property-storage-info-${propertyId}`);
        if (storageInfo) {
            storageInfo.innerHTML = `
                <div class="storage-info">
                    <span>Storage: ${this.getStorageUsed(propertyId)}/${this.getStorageCapacity(propertyId)} lbs</span>
                    <div class="storage-bar">
                        <div class="storage-fill" style="width: ${(this.getStorageUsed(propertyId) / this.getStorageCapacity(propertyId)) * 100}%"></div>
                    </div>
                </div>
            `;
        }
    },
    
    // Transfer items from storage to player inventory
    transferFromStorage(propertyId, itemId, quantity) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        // Check if property has enough items
        if (!property.storage || !property.storage[itemId] ||
            property.storage[itemId] < quantity) {
            addMessage(`Not enough ${itemId} in storage!`);
            return false;
        }
        
        // Check player inventory capacity
        const itemWeight = typeof ItemDatabase !== 'undefined' ?
            ItemDatabase.calculateWeight(itemId, quantity) : quantity * 1;
        
        const transport = typeof transportationOptions !== 'undefined' ?
            transportationOptions[game.player.transportation] : { carryCapacity: 100 };
        
        if (calculateCurrentLoad() + itemWeight > transport.carryCapacity) {
            addMessage(`Not enough carrying capacity! Need ${itemWeight} lbs more.`);
            return false;
        }
        
        // Transfer items
        this.removeFromPropertyStorage(propertyId, itemId, quantity, true);
        
        addMessage(`Took ${quantity} ${itemId} from ${property.name || 'property'} storage!`);
        
        // Update displays
        this.updateStorageDisplay(propertyId);
        if (typeof InventorySystem !== 'undefined') {
            InventorySystem.updateInventoryDisplay();
        }
        
        return true;
    },
    
    // Transfer items from player inventory to property storage
    transferToStorage(propertyId, itemId, quantity) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        // Check if player has enough items
        if (!game.player.inventory[itemId] || game.player.inventory[itemId] < quantity) {
            addMessage(`You don't have enough ${itemId}!`);
            return false;
        }
        
        // Transfer items
        if (this.addToPropertyStorage(propertyId, itemId, quantity, true)) {
            addMessage(`Stored ${quantity} ${itemId} in ${property.name || 'property'}!`);
            
            // Update displays
            this.updateStorageDisplay(propertyId);
            if (typeof InventorySystem !== 'undefined') {
                InventorySystem.updateInventoryDisplay();
            }
            
            return true;
        }
        
        return false;
    },
    
    // Work Queue System
    // Get production limits for a property type
    getProductionLimits(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return {};
        
        // Base production limits per property type
        const baseLimits = {
            farm: { food: 20, grain: 15 },
            mine: { stone: 30, iron_ore: 15, coal: 20 },
            craftshop: { tools: 10, weapons: 5 },
            tavern: { ale: 25, food: 15 },
            warehouse: {}, // No production, just storage
            shop: {}, // No production
            house: {}, // No production
            market_stall: {} // No production
        };
        
        return baseLimits[propertyId] || {};
    },
    
    // Add work to property queue
    addWorkToQueue(propertyId, workType, quantity, priority = 1) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        // Initialize work queue if needed
        if (!property.workQueue) {
            property.workQueue = [];
        }
        
        // Check production limits
        const queuedProduction = this.getQueuedProduction(propertyId, workType);
        const limits = this.getProductionLimits(property.type);
        const currentProduction = property.totalProduction[workType] || 0;
        
        if (currentProduction + queuedProduction + quantity > (limits[workType] || Infinity)) {
            addMessage(`Production limit reached for ${workType}! Maximum: ${limits[workType] || 'Unlimited'}`);
            return false;
        }
        
        // Add work to queue
        const work = {
            id: Date.now().toString(),
            type: workType,
            quantity: quantity,
            priority: priority,
            progress: 0,
            startTime: TimeSystem.getTotalMinutes(),
            assignedEmployees: []
        };
        
        property.workQueue.push(work);
        
        // Sort by priority (higher priority first)
        property.workQueue.sort((a, b) => b.priority - a.priority);
        
        addMessage(`Added ${quantity} ${workType} production to queue for ${this.propertyTypes[property.type].name}`);
        
        return true;
    },
    
    // Get queued production for a specific item type
    getQueuedProduction(propertyId, workType) {
        const property = this.getProperty(propertyId);
        if (!property || !property.workQueue) return 0;
        
        return property.workQueue
            .filter(work => work.type === workType)
            .reduce((total, work) => total + work.quantity, 0);
    },
    
    // Process work queues for all properties
    processWorkQueues() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;
        
        game.player.ownedProperties.forEach(property => {
            if (!property.workQueue || property.workQueue.length === 0) return;
            
            // Get assigned employees
            const assignedEmployees = property.employees.map(empId =>
                EmployeeSystem.getEmployee(empId)
            ).filter(emp => emp && emp.assignedProperty === property.id);
            
            // Calculate production rate based on employees
            let productionRate = 1; // Base production rate
            
            assignedEmployees.forEach(employee => {
                if (employee.skills && employee.skills.production) {
                    productionRate += employee.skills.production * 0.1;
                }
            });
            
            // Process each work item in queue
            property.workQueue.forEach(work => {
                if (work.progress >= work.quantity) return; // Already complete
                
                // Calculate production for this time step
                const timeSinceStart = TimeSystem.getTotalMinutes() - work.startTime;
                const productionAmount = Math.floor(timeSinceStart * productionRate * 0.01); // Small amount per minute
                
                // Update progress
                work.progress = Math.min(work.quantity, work.progress + productionAmount);
                
                // Check if work is complete
                if (work.progress >= work.quantity) {
                    // Add to total production
                    if (!property.totalProduction[work.type]) {
                        property.totalProduction[work.type] = 0;
                    }
                    property.totalProduction[work.type] += work.quantity;
                    
                    // Remove from queue
                    property.workQueue = property.workQueue.filter(w => w.id !== work.id);
                    
                    addMessage(`Completed production of ${work.quantity} ${work.type} at ${this.propertyTypes[property.type].name}!`);
                }
            });
        });
    },
    
    // Get work queue for a property
    getWorkQueue(propertyId) {
        const property = this.getProperty(propertyId);
        return property ? property.workQueue || [] : [];
    },
    
    // Clear work queue
    clearWorkQueue(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        property.workQueue = [];
        addMessage(`Cleared work queue for ${this.propertyTypes[property.type].name}`);
        
        return true;
    },
    
    // Cancel specific work item
    cancelWorkItem(propertyId, workId) {
        const property = this.getProperty(propertyId);
        if (!property || !property.workQueue) return false;
        
        const workIndex = property.workQueue.findIndex(work => work.id === workId);
        if (workIndex === -1) return false;
        
        const work = property.workQueue[workIndex];
        property.workQueue.splice(workIndex, 1);
        
        addMessage(`Cancelled production of ${work.quantity} ${work.type} at ${this.propertyTypes[property.type].name}`);
        
        return true;
    },
    
    // Property Purchase Interface
    // Show property purchase interface
    showPropertyPurchaseInterface() {
        const availableProperties = this.getAvailableProperties();
        
        if (availableProperties.length === 0) {
            addMessage('No properties available for purchase in this location.');
            return;
        }
        
        // Create purchase interface HTML
        const purchaseHtml = `
            <div class="property-purchase-interface">
                <h2>🏘️ Available Properties in ${game.currentLocation.name}</h2>
                <div class="properties-grid" id="properties-purchase-grid">
                    <!-- Properties will be populated here -->
                </div>
                <div class="purchase-summary">
                    <div class="player-gold">
                        <span class="gold-icon">💰</span>
                        <span class="gold-amount">${game.player.gold}</span>
                        <span class="gold-label">Gold Available</span>
                    </div>
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage('Browsing available properties...');
        
        // Populate properties grid
        this.populatePropertiesPurchaseGrid(availableProperties);
    },
    
    // Populate properties purchase grid
    populatePropertiesPurchaseGrid(properties) {
        const grid = document.getElementById('properties-purchase-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        properties.forEach(property => {
            const propertyCard = this.createPropertyPurchaseCard(property);
            grid.appendChild(propertyCard);
        });
    },
    
    // Create property purchase card
    createPropertyPurchaseCard(property) {
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
                ${property.workerSlots ? `
                <div class="stat-row">
                    <span class="stat-label">Worker Slots:</span>
                    <span class="stat-value">${property.workerSlots}</span>
                </div>
                ` : ''}
                ${property.merchantSlots ? `
                <div class="stat-row">
                    <span class="stat-label">Merchant Slots:</span>
                    <span class="stat-value">${property.merchantSlots}</span>
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
                        onclick="PropertySystem.attemptPropertyPurchase('${property.id}')"
                        ${!property.affordability || !requirementsMet ? 'disabled' : ''}>
                    ${property.affordability && requirementsMet ? 'Purchase' : 'Cannot Purchase'}
                </button>
                <button class="details-btn" onclick="PropertySystem.showPropertyPurchaseDetails('${property.id}')">
                    View Details
                </button>
            </div>
        `;
        
        return card;
    },
    
    // Attempt to purchase property
    attemptPropertyPurchase(propertyId) {
        const property = this.propertyTypes[propertyId];
        if (!property) {
            addMessage('Invalid property type!');
            return false;
        }
        
        const requirements = this.getPropertyRequirements(propertyId);
        const unmetRequirements = requirements.filter(req => !req.met);
        
        if (unmetRequirements.length > 0) {
            addMessage('Cannot purchase property. Unmet requirements:');
            unmetRequirements.forEach(req => {
                addMessage(`- ${req.description}`);
            });
            return false;
        }
        
        return this.purchaseProperty(propertyId);
    },
    
    // Show detailed property information
    showPropertyPurchaseDetails(propertyId) {
        const propertyType = this.propertyTypes[propertyId];
        if (!propertyType) return;
        
        const calculatedPrice = this.calculatePropertyPrice(propertyId);
        const projectedIncome = this.calculateProjectedIncome(propertyId);
        const roiDays = projectedIncome > 0 ? Math.round(calculatedPrice / projectedIncome) : Infinity;
        const requirements = this.getPropertyRequirements(propertyId);
        
        const detailsHtml = `
            <div class="property-details-modal">
                <div class="modal-header">
                    <h2>${propertyType.icon} ${propertyType.name}</h2>
                    <button class="close-btn" onclick="PropertySystem.closePropertyDetails()">✕</button>
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
                    
                    <div class="property-production" id="property-production-details">
                        <!-- Production details will be populated if applicable -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="purchase-btn ${this.canAffordProperty(propertyId) && requirements.every(req => req.met) ? 'enabled' : 'disabled'}"
                            onclick="PropertySystem.attemptPropertyPurchase('${propertyId}')"
                            ${!this.canAffordProperty(propertyId) || !requirements.every(req => req.met) ? 'disabled' : ''}>
                        Purchase for ${calculatedPrice} gold
                    </button>
                    <button class="cancel-btn" onclick="PropertySystem.closePropertyDetails()">Cancel</button>
                </div>
            </div>
        `;
        
        // Show production details if applicable
        if (propertyType.production) {
            const productionDetails = document.getElementById('property-production-details');
            if (productionDetails) {
                productionDetails.innerHTML = `
                    <h3>Production Details</h3>
                    <div class="production-grid">
                        ${Object.entries(propertyType.production).map(([item, amount]) => `
                            <div class="production-item">
                                <span class="production-icon">${this.getItemIcon(item)}</span>
                                <span class="production-item-name">${this.getItemName(item)}</span>
                                <span class="production-amount">${amount} per day</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        // Display modal
        this.showModal(detailsHtml);
    },
    
    // Get item icon for display
    getItemIcon(itemId) {
        if (typeof ItemDatabase !== 'undefined') {
            const item = ItemDatabase.getItem(itemId);
            return item ? item.icon : '📦';
        }
        
        // Fallback icons
        const iconMap = {
            food: '🍖',
            grain: '🌾',
            stone: '🪨',
            iron_ore: '⛏️',
            coal: '⚫',
            tools: '🔧',
            weapons: '⚔️',
            ale: '🍺',
            wood: '🪵',
            herbs: '🌿',
            fish: '🐟'
        };
        
        return iconMap[itemId] || '📦';
    },
    
    // Get item name for display
    getItemName(itemId) {
        if (typeof ItemDatabase !== 'undefined') {
            const item = ItemDatabase.getItem(itemId);
            return item ? item.name : itemId;
        }
        
        // Fallback names
        const nameMap = {
            food: 'Food',
            grain: 'Grain',
            stone: 'Stone',
            iron_ore: 'Iron Ore',
            coal: 'Coal',
            tools: 'Tools',
            weapons: 'Weapons',
            ale: 'Ale',
            wood: 'Wood',
            herbs: 'Herbs',
            fish: 'Fish'
        };
        
        return nameMap[itemId] || itemId.charAt(0).toUpperCase() + itemId.slice(1);
    },
    
    // Show modal helper function
    showModal(html) {
        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('property-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'property-modal-container';
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';
    },
    
    // Close property details modal
    closePropertyDetails() {
        const modalContainer = document.getElementById('property-modal-container');
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
    }
};