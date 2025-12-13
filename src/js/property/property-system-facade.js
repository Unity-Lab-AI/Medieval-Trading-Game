// ═══════════════════════════════════════════════════════════════
// PROPERTY SYSTEM FACADE - unified interface to modular darkness
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertySystem = {
    // property types - delegate to PropertyTypes
    get propertyTypes() {
        return PropertyTypes.types;
    },

    get upgrades() {
        return PropertyTypes.upgrades;
    },

    get constructionTimes() {
        return PropertyTypes.constructionTimes;
    },

    get buildingMaterials() {
        return PropertyTypes.buildingMaterials;
    },

    // initialize property system
    init() {
        // guard against early initialization when player doesn't exist yet
        if (!game || !game.player) {
            console.log('🖤 PropertySystem.init() called before player exists... waiting in the shadows');
            return;
        }
        if (!game.player.ownedProperties) {
            game.player.ownedProperties = [];
        }
        if (!game.player.propertyIncome) {
            game.player.propertyIncome = 0;
        }
        if (!game.player.propertyExpenses) {
            game.player.propertyExpenses = 0;
        }
    },

    // get available properties at current location
    getAvailableProperties() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return [];

        const availableProperties = [];
        const propertyIds = PropertyTypes.getLocationProperties(location.type);

        propertyIds.forEach(propertyId => {
            const propertyType = PropertyTypes.get(propertyId);
            if (propertyType) {
                const existingProperty = game.player.ownedProperties.find(
                    p => p.type === propertyId && p.location === game.currentLocation.id
                );

                if (!existingProperty) {
                    const calculatedPrice = PropertyPurchase.calculatePrice(propertyId);
                    const dailyIncome = PropertyPurchase.calculateProjectedIncome(propertyId);
                    const roiDays = dailyIncome > 0 ? Math.round(calculatedPrice / dailyIncome) : Infinity;

                    availableProperties.push({
                        ...propertyType,
                        location: game.currentLocation.id,
                        calculatedPrice: calculatedPrice,
                        projectedDailyIncome: dailyIncome,
                        roiDays: roiDays,
                        affordability: PropertyPurchase.canAfford(propertyId),
                        requirements: PropertyPurchase.getRequirements(propertyId)
                    });
                }
            }
        });

        return availableProperties;
    },

    // delegate to PropertyPurchase
    calculatePropertyPrice(propertyId, acquisitionType = 'buy') {
        return PropertyPurchase.calculatePrice(propertyId, acquisitionType);
    },

    calculateProjectedIncome(propertyId) {
        return PropertyPurchase.calculateProjectedIncome(propertyId);
    },

    canAffordProperty(propertyId) {
        return PropertyPurchase.canAfford(propertyId);
    },

    getPropertyRequirements(propertyId) {
        return PropertyPurchase.getRequirements(propertyId);
    },

    getAcquisitionOptions(propertyId) {
        return PropertyPurchase.getAcquisitionOptions(propertyId);
    },

    purchaseProperty(propertyId, acquisitionType = 'buy') {
        return PropertyPurchase.purchase(propertyId, acquisitionType);
    },

    sellProperty(propertyId) {
        return PropertyPurchase.sell(propertyId);
    },

    calculateSellValue(propertyId) {
        return PropertyPurchase.calculateSellValue(propertyId);
    },

    playerHasConstructionTool() {
        return PropertyPurchase.hasConstructionTool();
    },

    checkMaterials(materialsNeeded) {
        return PropertyPurchase.checkMaterials(materialsNeeded);
    },

    consumeMaterials(materialsNeeded) {
        return PropertyPurchase.consumeMaterials(materialsNeeded);
    },

    getConstructionTime(propertyId) {
        return PropertyTypes.getConstructionTime(propertyId);
    },

    getBuildingMaterials(propertyId) {
        return PropertyTypes.getBuildingMaterials(propertyId);
    },

    // player properties
    getPlayerProperties() {
        return game.player.ownedProperties || [];
    },

    getOwnedProperties() {
        return this.getPlayerProperties();
    },

    getProperties() {
        return this.getPlayerProperties();
    },

    getProperty(propertyId) {
        // guard against null ownedProperties - can't find shit in nothing
        return game.player.ownedProperties?.find(p => p.id === propertyId);
    },

    loadProperties(properties) {
        if (!properties || !Array.isArray(properties)) {
            console.log('💾 No properties to load');
            return;
        }

        game.player.ownedProperties = properties;
        console.log(`💾 Loaded ${properties.length} properties from save`);
        this.updatePropertyDisplay();
    },

    // delegate to PropertyIncome
    processDailyIncome() {
        return PropertyIncome.processDailyIncome();
    },

    processConstruction() {
        return PropertyIncome.processConstruction();
    },

    processRentPayments() {
        return PropertyIncome.processRentPayments();
    },

    loseProperty(propertyId) {
        return PropertyIncome.loseProperty(propertyId);
    },

    getConstructionProgress(property) {
        return PropertyIncome.getConstructionProgress(property);
    },

    processWorkQueues() {
        return PropertyIncome.processWorkQueues();
    },

    processRepairBonuses() {
        return PropertyIncome.processRepairBonuses();
    },

    calculatePropertyIncome(property) {
        return PropertyIncome.calculateIncome(property);
    },

    calculatePropertyIncomeById(propertyId) {
        const property = this.getProperty(propertyId);
        return property ? PropertyIncome.calculateIncome(property) : 0;
    },

    processPropertyEvents(property) {
        return PropertyIncome.processPropertyEvents(property);
    },

    // delegate to PropertyUpgrades
    upgradeProperty(propertyId, upgradeId) {
        return PropertyUpgrades.upgrade(propertyId, upgradeId);
    },

    getUpgradeRequirements(propertyId, upgradeId) {
        return PropertyUpgrades.getRequirements(propertyId, upgradeId);
    },

    calculateUpgradeCost(propertyId, upgradeId) {
        return PropertyUpgrades.calculateCost(propertyId, upgradeId);
    },

    applyUpgradeEffects(propertyId, upgradeId) {
        return PropertyUpgrades.applyEffects(propertyId, upgradeId);
    },

    applyPropertySpecificBenefits(propertyId) {
        return PropertyUpgrades.applyPropertyBenefits(propertyId);
    },

    getPropertyBenefits(propertyId) {
        return PropertyUpgrades.getPropertyBenefits(propertyId);
    },

    getProductionCapacity(propertyId) {
        return PropertyUpgrades.getProductionCapacity(propertyId);
    },

    getEmployeeCapacity(propertyId) {
        return PropertyUpgrades.getEmployeeCapacity(propertyId);
    },

    canAcceptEmployee(propertyId, employeeRole) {
        return PropertyUpgrades.canAcceptEmployee(propertyId, employeeRole);
    },

    getPropertySpecialAbilities(propertyId) {
        return PropertyUpgrades.getSpecialAbilities(propertyId);
    },

    getAvailableUpgrades(propertyId) {
        return PropertyUpgrades.getAvailable(propertyId);
    },

    isUpgradeAvailableForPropertyType(upgradeId, propertyType) {
        return PropertyTypes.isUpgradeAvailable(upgradeId, propertyType.id);
    },

    calculateUpgradeBenefits(propertyId, upgradeId) {
        return PropertyUpgrades.calculateBenefits(propertyId, upgradeId);
    },

    repairProperty(propertyId) {
        return PropertyUpgrades.repair(propertyId);
    },

    calculateRepairCost(propertyId) {
        return PropertyUpgrades.calculateRepairCost(propertyId);
    },

    applyRepairBenefits(propertyId) {
        PropertyUpgrades.applyPropertyBenefits(propertyId);
    },

    getPropertyConditionStatus(propertyId) {
        return PropertyUpgrades.getConditionStatus(propertyId);
    },

    getPropertyConditionColor(propertyId) {
        return PropertyUpgrades.getConditionColor(propertyId);
    },

    needsUrgentRepair(propertyId) {
        return PropertyUpgrades.needsUrgentRepair(propertyId);
    },

    getRepairRecommendations(propertyId) {
        return PropertyUpgrades.getRepairRecommendations(propertyId);
    },

    upgradePropertyLevel(propertyId) {
        return PropertyUpgrades.upgradeLevel(propertyId);
    },

    // delegate to PropertyStorage
    initializePropertyStorage(propertyId) {
        return PropertyStorage.initialize(propertyId);
    },

    calculateStorageUsed(propertyId) {
        return PropertyStorage.calculateUsed(propertyId);
    },

    getStorageCapacity(propertyId) {
        return PropertyStorage.getCapacity(propertyId);
    },

    getStorageUsed(propertyId) {
        return PropertyStorage.getUsed(propertyId);
    },

    getAvailableStorage(propertyId) {
        return PropertyStorage.getAvailable(propertyId);
    },

    addToPropertyStorage(propertyId, itemId, quantity) {
        return PropertyStorage.add(propertyId, itemId, quantity);
    },

    removeFromPropertyStorage(propertyId, itemId, quantity) {
        return PropertyStorage.remove(propertyId, itemId, quantity);
    },

    transferItemsBetweenProperties(fromPropertyId, toPropertyId, itemId, quantity) {
        return PropertyStorage.transferBetweenProperties(fromPropertyId, toPropertyId, itemId, quantity);
    },

    getAllStoredItems() {
        return PropertyStorage.getAllStoredItems();
    },

    findPropertiesWithItem(itemId) {
        return PropertyStorage.findPropertiesWithItem(itemId);
    },

    autoStoreProducedItems(propertyId) {
        return PropertyStorage.autoStoreProducedItems(propertyId);
    },

    updateStorageDisplay(propertyId) {
        return PropertyStorage.updateDisplay(propertyId);
    },

    transferFromStorage(propertyId, itemId, quantity) {
        return PropertyStorage.transferToPlayer(propertyId, itemId, quantity);
    },

    transferToStorage(propertyId, itemId, quantity) {
        return PropertyStorage.transferFromPlayer(propertyId, itemId, quantity);
    },

    switchStorageTab(propertyId, tab) {
        return PropertyStorage.switchTab(propertyId, tab);
    },

    updateTransferDisplay(propertyId) {
        return PropertyStorage.updateTransferDisplay(propertyId);
    },

    populateTransferFromInventory(propertyId) {
        return PropertyStorage._populateTransferFromInventory(propertyId);
    },

    populatePropertySelector(propertyId) {
        return PropertyStorage._populatePropertySelector(propertyId);
    },

    populateTransferBetweenProperties(fromPropertyId, toPropertyId) {
        return PropertyStorage._populateTransferBetweenProperties(fromPropertyId, toPropertyId);
    },

    // work queue methods
    getProductionLimits(propertyId) {
        return PropertyTypes.getProductionLimits(propertyId);
    },

    addWorkToQueue(propertyId, workType, quantity, priority = 1) {
        const property = this.getProperty(propertyId);
        if (!property) return false;

        if (!property.workQueue) property.workQueue = [];

        const queuedProduction = this.getQueuedProduction(propertyId, workType);
        const limits = PropertyTypes.getProductionLimits(property.type);
        const currentProduction = property.totalProduction[workType] || 0;

        if (currentProduction + queuedProduction + quantity > (limits[workType] || Infinity)) {
            addMessage(`Production limit reached for ${workType}! Maximum: ${limits[workType] || 'Unlimited'}`);
            return false;
        }

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
        property.workQueue.sort((a, b) => b.priority - a.priority);

        const propertyType = PropertyTypes.get(property.type);
        addMessage(`Added ${quantity} ${workType} production to queue for ${propertyType?.name}`);

        return true;
    },

    getQueuedProduction(propertyId, workType) {
        const property = this.getProperty(propertyId);
        if (!property || !property.workQueue) return 0;

        return property.workQueue
            .filter(work => work.type === workType)
            .reduce((total, work) => total + work.quantity, 0);
    },

    getWorkQueue(propertyId) {
        const property = this.getProperty(propertyId);
        return property ? property.workQueue || [] : [];
    },

    clearWorkQueue(propertyId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;

        property.workQueue = [];
        const propertyType = PropertyTypes.get(property.type);
        addMessage(`Cleared work queue for ${propertyType?.name}`);

        return true;
    },

    cancelWorkItem(propertyId, workId) {
        const property = this.getProperty(propertyId);
        if (!property || !property.workQueue) return false;

        const workIndex = property.workQueue.findIndex(work => work.id === workId);
        if (workIndex === -1) return false;

        const work = property.workQueue[workIndex];
        property.workQueue.splice(workIndex, 1);

        const propertyType = PropertyTypes.get(property.type);
        addMessage(`Cancelled production of ${work.quantity} ${work.type} at ${propertyType?.name}`);

        return true;
    },

    // delegate to PropertyUI
    updatePropertyDisplay() {
        return PropertyUI.updatePropertyDisplay();
    },

    createPropertyElement(property) {
        return PropertyUI.createPropertyElement(property);
    },

    showPropertyDetails(propertyId) {
        return PropertyUI.showPropertyDetails(propertyId);
    },

    showStorageManagement(propertyId) {
        return PropertyUI.showStorageManagement(propertyId);
    },

    showUpgradeInterface(propertyId) {
        return PropertyUI.showUpgradeInterface(propertyId);
    },

    showPropertyPurchaseInterface() {
        return PropertyUI.showPropertyPurchaseInterface();
    },

    showPropertyPurchaseDetails(propertyId) {
        return PropertyUI.showPropertyPurchaseDetails(propertyId);
    },

    attemptPropertyPurchase(propertyId) {
        const requirements = PropertyPurchase.getRequirements(propertyId);
        const unmetRequirements = requirements.filter(req => !req.met);

        if (unmetRequirements.length > 0) {
            addMessage('Cannot purchase property. Unmet requirements:');
            unmetRequirements.forEach(req => addMessage(`- ${req.description}`));
            return false;
        }

        return PropertyPurchase.purchase(propertyId);
    },

    getItemIcon(itemId) {
        return PropertyUI.getItemIcon(itemId);
    },

    getItemName(itemId) {
        return PropertyUI.getItemName(itemId);
    },

    showModal(html) {
        return PropertyUI.showModal(html);
    },

    closePropertyDetails() {
        return PropertyUI.closePropertyDetails();
    },

    populateUpgradesGrid(upgrades, propertyId) {
        return PropertyUI._populateUpgradesGrid(upgrades, propertyId);
    },

    createUpgradeCard(upgrade, propertyId) {
        return PropertyUI._createUpgradeCard(upgrade, propertyId);
    },

    populatePropertiesPurchaseGrid(properties) {
        return PropertyUI._populatePropertiesPurchaseGrid(properties);
    },

    createPropertyPurchaseCard(property) {
        return PropertyUI._createPropertyPurchaseCard(property);
    }
};

// expose to global scope
window.PropertySystem = PropertySystem;
