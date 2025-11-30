// ═══════════════════════════════════════════════════════════════
// 🏠 PROPERTY PURCHASE - acquiring your empire piece by piece 🖤
// ═══════════════════════════════════════════════════════════════
// buy, rent, or build your way to landlord status 💀
// File Version: GameConfig.version.file | Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const PropertyPurchase = {
    // 💰 Calculate property price with all modifiers ⚰️
    calculatePrice(propertyId, acquisitionType = 'buy') {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return 0;

        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return propertyType.basePrice;

        let price = propertyType.basePrice;

        // 🌙 Location type modifier 🦇
        const locationModifiers = { village: 0.8, town: 1.0, city: 1.3 };
        price *= locationModifiers[location.type] || 1.0;

        // 🔑 Acquisition type modifier 🗡️
        const acquisitionModifiers = {
            buy: 1.0,      // full price to own outright
            rent: 0.2,     // deposit is 20% of value
            build: 0.5     // half price but needs materials
        };
        price *= acquisitionModifiers[acquisitionType] || 1.0;

        // ⭐ Reputation modifier 🔮
        if (typeof CityReputationSystem !== 'undefined') {
            const reputation = CityReputationSystem.getReputation(game.currentLocation.id);
            const reputationModifier = 1 - (reputation * 0.002);
            price *= Math.max(0.7, reputationModifier);
        }

        // 📊 Merchant rank bonus 💀
        if (typeof MerchantRankSystem !== 'undefined') {
            const bonus = MerchantRankSystem.getTradingBonus();
            price *= (1 - bonus);
        }

        return Math.round(price);
    },

    // 📈 Calculate projected income for preview 🖤
    calculateProjectedIncome(propertyId) {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return 0;

        let income = propertyType.baseIncome;
        const maintenance = propertyType.maintenanceCost;
        const tax = Math.round(income * 0.1);

        return Math.max(0, Math.round(income - maintenance - tax));
    },

    // 💵 Check if player can afford property ⚰️
    canAfford(propertyId, acquisitionType = 'buy') {
        const price = this.calculatePrice(propertyId, acquisitionType);
        return game.player.gold >= price;
    },

    // 📋 Get property requirements 🦇
    getRequirements(propertyId) {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return [];

        const requirements = [];
        const price = this.calculatePrice(propertyId);

        // 💰 Gold requirement 🗡️
        requirements.push({
            type: 'gold',
            amount: price,
            met: game.player.gold >= price,
            description: `${price} gold`
        });

        // 🏙️ Location requirement 🌙
        const location = GameWorld.locations[game.currentLocation.id];
        if (location) {
            const allowedInLocation = PropertyTypes.getLocationProperties(location.type).includes(propertyId);
            requirements.push({
                type: 'location',
                amount: location.type,
                met: allowedInLocation,
                description: `Requires ${location.type} location`
            });
        }

        // 🛤️ Road adjacency requirement for building 🖤
        const hasRoadAccess = this.checkRoadAdjacency();
        requirements.push({
            type: 'road_access',
            amount: 1,
            met: hasRoadAccess,
            description: 'Road access required (own property in connected location or at capital)'
        });

        // ⚒️ Skill requirements 🔮
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

    // 🛤️ Check if current location has road adjacency to owned property 🖤
    checkRoadAdjacency() {
        const currentLocationId = game.currentLocation?.id;
        if (!currentLocationId) return false;

        // 🏰 Capital always has road access 💀
        const currentLocation = GameWorld.locations[currentLocationId];
        if (currentLocation?.type === 'capital') return true;

        // 🏠 Already own property here = road established ⚰️
        const ownedHere = game.player.ownedProperties?.some(p => p.location === currentLocationId);
        if (ownedHere) return true;

        // 🛤️ Check if connected to any location where we own property 🦇
        if (!currentLocation?.connections) return false;

        for (const connectedId of currentLocation.connections) {
            const ownsInConnected = game.player.ownedProperties?.some(p => p.location === connectedId);
            if (ownsInConnected) return true;

            // 🏰 Connected to capital also grants access 🗡️
            const connectedLocation = GameWorld.locations[connectedId];
            if (connectedLocation?.type === 'capital') return true;
        }

        return false;
    },

    // 🗺️ Get all locations where player can build (has road access) 🌙
    getBuildableLocations() {
        const buildable = [];

        for (const [locationId, location] of Object.entries(GameWorld.locations)) {
            // 🏰 Capital always buildable 💀
            if (location.type === 'capital') {
                buildable.push(locationId);
                continue;
            }

            // 🏠 Already own here ⚰️
            const ownedHere = game.player.ownedProperties?.some(p => p.location === locationId);
            if (ownedHere) {
                buildable.push(locationId);
                continue;
            }

            // 🛤️ Connected to owned property or capital 🦇
            if (location.connections) {
                for (const connectedId of location.connections) {
                    const ownsInConnected = game.player.ownedProperties?.some(p => p.location === connectedId);
                    const connectedLocation = GameWorld.locations[connectedId];

                    if (ownsInConnected || connectedLocation?.type === 'capital') {
                        buildable.push(locationId);
                        break;
                    }
                }
            }
        }

        return buildable;
    },

    // 🔨 Check if player has construction tool 💀
    hasConstructionTool() {
        // check equipped tool first
        if (typeof EquipmentSystem !== 'undefined') {
            const equippedTool = EquipmentSystem.getEquipped('tool');
            if (equippedTool) {
                const item = ItemDatabase?.items?.[equippedTool];
                if (item && item.toolType === 'construction') return true;
            }
        }

        // legacy check
        if (game.player.equippedTool) {
            const item = ItemDatabase?.items?.[game.player.equippedTool];
            if (item && item.toolType === 'construction') return true;
        }

        // check inventory
        if (game.player.inventory) {
            for (const itemId of Object.keys(game.player.inventory)) {
                const item = ItemDatabase?.items?.[itemId];
                if (item && item.toolType === 'construction') return true;
            }
        }

        return false;
    },

    // 🪵 Check if player has required materials ⚰️
    checkMaterials(materialsNeeded) {
        const missing = [];
        for (const [material, amount] of Object.entries(materialsNeeded)) {
            const playerHas = game.player.inventory?.[material] || 0;
            if (playerHas < amount) {
                missing.push(`${amount - playerHas} more ${material}`);
            }
        }
        return missing;
    },

    // 🔥 Consume materials for building 🦇
    consumeMaterials(materialsNeeded) {
        for (const [material, amount] of Object.entries(materialsNeeded)) {
            if (game.player.inventory?.[material]) {
                game.player.inventory[material] -= amount;
                if (game.player.inventory[material] <= 0) {
                    delete game.player.inventory[material];
                }
            }
        }
    },

    // 🛒 Get acquisition options for a property type 🗡️
    getAcquisitionOptions(propertyId) {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) return [];

        const options = [];

        // 🏠 BUY - always available 🌙
        options.push({
            type: 'buy',
            name: 'Purchase',
            icon: '🏠',
            description: 'Own it outright, instant transfer',
            price: this.calculatePrice(propertyId, 'buy'),
            time: 0,
            materials: null
        });

        // 📝 RENT - cheaper upfront 🔮
        options.push({
            type: 'rent',
            name: 'Rent',
            icon: '📝',
            description: 'Lower deposit, but pay weekly rent',
            price: this.calculatePrice(propertyId, 'rent'),
            weeklyRent: Math.round(propertyType.basePrice * 0.1),
            time: 0,
            materials: null
        });

        // 🔨 BUILD - requires materials and time 💀
        const materials = PropertyTypes.getBuildingMaterials(propertyId);
        const constructionDays = Math.ceil(PropertyTypes.getConstructionTime(propertyId) / (24 * 60));
        options.push({
            type: 'build',
            name: 'Build',
            icon: '🔨',
            description: `Cheaper but needs materials and ${constructionDays} days`,
            price: this.calculatePrice(propertyId, 'build'),
            time: constructionDays,
            materials: materials
        });

        return options;
    },

    // 🏠 Purchase property - the main event 🖤
    purchase(propertyId, acquisitionType = 'buy') {
        const propertyType = PropertyTypes.get(propertyId);
        if (!propertyType) {
            addMessage('Invalid property type!');
            return false;
        }

        // 📊 Check merchant rank limit ⚰️
        if (typeof MerchantRankSystem !== 'undefined') {
            const canPurchase = MerchantRankSystem.canPurchaseProperty();
            if (!canPurchase.allowed) {
                addMessage(`❌ ${canPurchase.reason}`, 'warning');
                addMessage(`💡 ${canPurchase.suggestion}`, 'info');
                return false;
            }
        }

        const price = this.calculatePrice(propertyId, acquisitionType);

        // 💵 Check gold 🦇
        if (game.player.gold < price) {
            addMessage(`You need ${price} gold to ${acquisitionType} a ${propertyType.name}!`);
            return false;
        }

        // 🏘️ Check if already owned at this location 🗡️
        const existingProperty = game.player.ownedProperties.find(
            p => p.type === propertyId && p.location === game.currentLocation.id
        );

        if (existingProperty) {
            addMessage(`You already own a ${propertyType.name} in ${game.currentLocation.name}!`);
            return false;
        }

        // 🔨 For building, check materials and tools 🌙
        if (acquisitionType === 'build') {
            if (!this.hasConstructionTool()) {
                addMessage(`🔨 You need a hammer to build! Equip one or have it in your inventory.`, 'warning');
                return false;
            }

            const materialsNeeded = PropertyTypes.getBuildingMaterials(propertyId);
            const missingMaterials = this.checkMaterials(materialsNeeded);
            if (missingMaterials.length > 0) {
                addMessage(`Missing materials to build: ${missingMaterials.join(', ')}`, 'warning');
                return false;
            }
            this.consumeMaterials(materialsNeeded);
        }

        // 💰 Deduct gold 🔮
        game.player.gold -= price;

        // 🏗️ Construction time 💀
        const constructionTime = acquisitionType === 'build' ? PropertyTypes.getConstructionTime(propertyId) : 0;
        const isUnderConstruction = constructionTime > 0;

        // 🏠 Create new property object 🖤
        const newProperty = {
            id: Date.now().toString(),
            type: propertyId,
            location: game.currentLocation.id,
            locationName: game.currentLocation.name,
            level: 1,
            condition: isUnderConstruction ? 0 : 100,
            upgrades: [],
            employees: [],
            lastIncomeTime: TimeSystem.getTotalMinutes(),
            totalIncome: 0,
            purchasePrice: price,
            acquisitionType: acquisitionType,
            storageUsed: 0,
            storage: {},
            storageCapacity: 0,
            workQueue: [],
            productionLimits: PropertyTypes.getProductionLimits(propertyId),
            lastProductionTime: TimeSystem.getTotalMinutes(),
            totalProduction: {},
            // construction tracking
            underConstruction: isUnderConstruction,
            constructionStartTime: isUnderConstruction ? TimeSystem.getTotalMinutes() : null,
            constructionEndTime: isUnderConstruction ? TimeSystem.getTotalMinutes() + constructionTime : null,
            // rent tracking
            isRented: acquisitionType === 'rent',
            rentDueTime: acquisitionType === 'rent' ? TimeSystem.getTotalMinutes() + (7 * 24 * 60) : null,
            monthlyRent: acquisitionType === 'rent' ? Math.round(price * 0.1) : 0
        };

        // 📦 Initialize storage ⚰️
        PropertyStorage.initialize(newProperty.id);
        game.player.ownedProperties.push(newProperty);

        // 🎉 Fire event 🦇
        document.dispatchEvent(new CustomEvent('property-purchased', { detail: { property: newProperty } }));

        // 📢 Message based on acquisition type 🗡️
        if (acquisitionType === 'build') {
            const days = Math.ceil(constructionTime / (24 * 60));
            addMessage(`🔨 Started building ${propertyType.name} in ${game.currentLocation.name}! Ready in ${days} days.`, 'success');
        } else if (acquisitionType === 'rent') {
            addMessage(`📝 Rented ${propertyType.name} in ${game.currentLocation.name} for ${price} gold deposit + ${newProperty.monthlyRent}/week!`, 'success');
        } else {
            addMessage(`🏠 Purchased ${propertyType.name} in ${game.currentLocation.name} for ${price} gold!`, 'success');
        }

        // 🔄 Update UI 🌙
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();

        return true;
    },

    // 💰 Sell property 🔮
    sell(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) {
            addMessage('Invalid property!');
            return false;
        }

        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) {
            addMessage('Unknown property type!');
            return false;
        }

        // 💵 Calculate sell value: 50% of investment 💀
        let totalInvestment = property.purchasePrice || propertyType.basePrice;

        // Add upgrade costs
        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade) totalInvestment += upgrade.cost || 0;
        });

        // Add level upgrade costs
        if (property.level > 1) {
            for (let i = 1; i < property.level; i++) {
                totalInvestment += Math.round(propertyType.basePrice * 0.5 * i);
            }
        }

        const sellValue = Math.round(totalInvestment * 0.5);

        // 👥 Fire employees 🖤
        if (typeof EmployeeSystem !== 'undefined') {
            const assignedEmployees = EmployeeSystem.getEmployeesAtProperty(propertyId);
            if (assignedEmployees && assignedEmployees.length > 0) {
                assignedEmployees.forEach(emp => EmployeeSystem.unassignEmployee(emp.id));
                addMessage(`${assignedEmployees.length} employee(s) unassigned from property.`);
            }
        }

        // 📦 Return items from storage ⚰️
        if (property.storage && Object.keys(property.storage).length > 0) {
            let itemsReturned = 0;
            for (const [itemId, quantity] of Object.entries(property.storage)) {
                if (quantity > 0) {
                    if (!game.player.inventory) game.player.inventory = {};
                    game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;
                    itemsReturned += quantity;
                }
            }
            if (itemsReturned > 0) {
                addMessage(`${itemsReturned} items returned to your inventory from storage.`);
            }
        }

        // 🗑️ Remove property 🦇
        const propertyIndex = game.player.ownedProperties.findIndex(p => p.id === propertyId);
        if (propertyIndex !== -1) {
            game.player.ownedProperties.splice(propertyIndex, 1);
        }

        // 💰 Give player gold 🗡️
        game.player.gold += sellValue;

        // 🎉 Fire event 🌙
        document.dispatchEvent(new CustomEvent('property-sold', {
            detail: { propertyId, propertyType: property.type, sellValue, location: property.location }
        }));

        addMessage(`🏠 Sold ${propertyType.name} for ${sellValue} gold! (50% of ${totalInvestment} gold investment)`);

        // 🔄 Update UI 🔮
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();
        if (typeof MerchantRankSystem !== 'undefined') MerchantRankSystem.checkForRankUp();

        return { success: true, sellValue, totalInvestment };
    },

    // 💵 Calculate sell value preview 💀
    calculateSellValue(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) return 0;

        let totalInvestment = property.purchasePrice || propertyType.basePrice;

        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade) totalInvestment += upgrade.cost || 0;
        });

        if (property.level > 1) {
            for (let i = 1; i < property.level; i++) {
                totalInvestment += Math.round(propertyType.basePrice * 0.5 * i);
            }
        }

        return Math.round(totalInvestment * 0.5);
    }
};

// 🌙 expose to global scope 🦇
window.PropertyPurchase = PropertyPurchase;
