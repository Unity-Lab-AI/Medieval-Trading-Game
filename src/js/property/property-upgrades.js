// ═══════════════════════════════════════════════════════════════
// PROPERTY UPGRADES - improving your dark investments
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyUpgrades = {
    // upgrade property
    upgrade(propertyId, upgradeId) {
        const property = PropertySystem.getProperty(propertyId);
        const upgrade = PropertyTypes.getUpgrade(upgradeId);

        if (!property || !upgrade) {
            addMessage('Invalid property or upgrade!');
            return false;
        }

        // check if already upgraded
        if (property.upgrades.includes(upgradeId)) {
            addMessage('Property already has this upgrade!');
            return false;
        }

        // check requirements
        const requirements = this.getRequirements(propertyId, upgradeId);
        const unmetRequirements = requirements.filter(req => !req.met);

        if (unmetRequirements.length > 0) {
            addMessage('Cannot upgrade property. Unmet requirements:');
            unmetRequirements.forEach(req => addMessage(`- ${req.description}`));
            return false;
        }

        // calculate cost
        const upgradeCost = this.calculateCost(propertyId, upgradeId);

        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold for this upgrade!`);
            return false;
        }

        // apply upgrade
        game.player.gold -= upgradeCost;
        property.upgrades.push(upgradeId);
        this.applyEffects(propertyId, upgradeId);

        const propertyType = PropertyTypes.get(property.type);
        addMessage(`Upgraded ${propertyType.name} with ${upgrade.name} for ${upgradeCost} gold!`);

        // update UI
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();

        return true;
    },

    // get upgrade requirements
    getRequirements(propertyId, upgradeId) {
        const property = PropertySystem.getProperty(propertyId);
        const upgrade = PropertyTypes.getUpgrade(upgradeId);
        if (!property || !upgrade) return [];

        const requirements = [];

        // gold requirement
        const upgradeCost = this.calculateCost(propertyId, upgradeId);
        requirements.push({
            type: 'gold',
            amount: upgradeCost,
            met: game.player.gold >= upgradeCost,
            description: `${upgradeCost} gold`
        });

        // property level requirements
        if (upgradeId === 'luxury') {
            requirements.push({
                type: 'level',
                amount: 3,
                met: property.level >= 3,
                description: `Property level 3 (current: ${property.level})`
            });
        }

        // prerequisite upgrades
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

    // calculate upgrade cost
    calculateCost(propertyId, upgradeId) {
        const property = PropertySystem.getProperty(propertyId);
        const upgrade = PropertyTypes.getUpgrade(upgradeId);
        if (!property || !upgrade) return 0;

        const propertyType = PropertyTypes.get(property.type);
        let baseCost = propertyType.basePrice * upgrade.costMultiplier;

        // level modifier
        baseCost *= (1 + (property.level - 1) * 0.2);

        // reputation modifier
        if (typeof CityReputationSystem !== 'undefined') {
            const reputation = CityReputationSystem.getReputation(property.location);
            const reputationModifier = 1 - (reputation * 0.001);
            baseCost *= Math.max(0.8, reputationModifier);
        }

        return Math.round(baseCost);
    },

    // apply upgrade effects
    applyEffects(propertyId, upgradeId) {
        const property = PropertySystem.getProperty(propertyId);
        const upgrade = PropertyTypes.getUpgrade(upgradeId);
        if (!property || !upgrade) return;

        // storage bonus
        if (upgrade.effects.storageBonus) {
            PropertyStorage.initialize(propertyId);
        }

        // apply property-specific benefits
        this.applyPropertyBenefits(propertyId);
    },

    // apply property-specific benefits
    applyPropertyBenefits(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;

        const propertyType = PropertyTypes.get(property.type);
        property.benefits = property.benefits || {};

        // storage benefit
        if (propertyType.storageBonus) {
            property.benefits.storageCapacity = PropertyStorage.getCapacity(propertyId);
        }

        // production benefit
        if (propertyType.production) {
            property.benefits.production = { ...propertyType.production };

            if (property.upgrades.includes('efficiency')) {
                for (const [item, amount] of Object.entries(property.benefits.production)) {
                    property.benefits.production[item] = Math.round(amount * 1.3);
                }
            }
        }

        // employee slots
        if (propertyType.workerSlots) {
            property.benefits.workerSlots = propertyType.workerSlots;
        }

        if (propertyType.merchantSlots) {
            property.benefits.merchantSlots = propertyType.merchantSlots;
        }

        // special benefits
        if (propertyType.restBonus) property.benefits.restBonus = true;
        if (propertyType.reputationBonus) property.benefits.reputationBonus = propertyType.reputationBonus;

        // upgrade-based benefits
        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade?.effects.storageBonus) {
                property.benefits.storageCapacity = Math.round(
                    (property.benefits.storageCapacity || 0) * upgrade.effects.storageBonus
                );
            }
        });
    },

    // get property benefits
    getPropertyBenefits(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return {};

        this.applyPropertyBenefits(propertyId);
        return property.benefits || {};
    },

    // get production capacity
    getProductionCapacity(propertyId) {
        const benefits = this.getPropertyBenefits(propertyId);
        return benefits.production || {};
    },

    // get employee capacity
    getEmployeeCapacity(propertyId) {
        const benefits = this.getPropertyBenefits(propertyId);
        const capacity = {
            total: 0,
            workers: benefits.workerSlots || 0,
            merchants: benefits.merchantSlots || 0,
            guards: 0
        };

        capacity.total = capacity.workers + capacity.merchants + capacity.guards;

        const property = PropertySystem.getProperty(propertyId);
        if (property && property.upgrades.includes('security')) {
            capacity.guards = 1;
            capacity.total += 1;
        }

        return capacity;
    },

    // check if property can accept more employees
    canAcceptEmployee(propertyId, employeeRole) {
        const capacity = this.getEmployeeCapacity(propertyId);
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        const currentEmployees = property.employees.length;
        if (currentEmployees >= capacity.total) return false;

        const roleCount = property.employees.filter(empId => {
            const emp = PropertyEmployeeBridge.getEmployee(empId);
            return emp && emp.role === employeeRole;
        }).length;

        if (employeeRole === 'worker' && roleCount >= capacity.workers) return false;
        if (employeeRole === 'merchant' && roleCount >= capacity.merchants) return false;
        if (employeeRole === 'guard' && roleCount >= capacity.guards) return false;

        return true;
    },

    // get property special abilities
    getSpecialAbilities(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return [];

        const propertyType = PropertyTypes.get(property.type);
        const abilities = [];

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

        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade?.effects.productionBonus) {
                abilities.push({
                    name: 'Enhanced Production',
                    description: '+30% production efficiency',
                    icon: '⚡'
                });
            }

            if (upgrade?.effects.damageReduction) {
                abilities.push({
                    name: 'Damage Reduction',
                    description: '50% less condition degradation',
                    icon: '🛡️'
                });
            }
        });

        return abilities;
    },

    // get available upgrades for a property
    getAvailable(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return [];

        const availableUpgrades = [];

        for (const [upgradeId, upgrade] of Object.entries(PropertyTypes.upgrades)) {
            if (property.upgrades.includes(upgradeId)) continue;

            const propertyType = PropertyTypes.get(property.type);
            if (!PropertyTypes.isUpgradeAvailable(upgradeId, propertyType.id)) continue;

            const upgradeCost = this.calculateCost(propertyId, upgradeId);
            const requirements = this.getRequirements(propertyId, upgradeId);

            availableUpgrades.push({
                ...upgrade,
                cost: upgradeCost,
                affordability: game.player.gold >= upgradeCost,
                requirementsMet: requirements.every(req => req.met),
                requirements: requirements,
                projectedBenefits: this.calculateBenefits(propertyId, upgradeId)
            });
        }

        return availableUpgrades;
    },

    // calculate upgrade benefits preview
    calculateBenefits(propertyId, upgradeId) {
        const property = PropertySystem.getProperty(propertyId);
        const upgrade = PropertyTypes.getUpgrade(upgradeId);
        if (!property || !upgrade) return {};

        const benefits = {};
        const currentIncome = PropertyIncome.calculateIncome(property);

        if (upgrade.effects.incomeBonus) {
            benefits.incomeIncrease = Math.round(currentIncome * (upgrade.effects.incomeBonus - 1));
        }

        if (upgrade.effects.maintenanceReduction) {
            const propertyType = PropertyTypes.get(property.type);
            benefits.maintenanceSavings = Math.round(
                propertyType.maintenanceCost * (1 - upgrade.effects.maintenanceReduction)
            );
        }

        if (upgrade.effects.storageBonus) {
            const currentCapacity = PropertyStorage.getCapacity(propertyId);
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

    // upgrade property level
    upgradeLevel(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        const propertyType = PropertyTypes.get(property.type);
        const upgradeCost = Math.round(propertyType.basePrice * 0.5 * property.level);

        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold to upgrade this property!`);
            return false;
        }

        game.player.gold -= upgradeCost;
        property.level++;

        addMessage(`Upgraded ${propertyType.name} to level ${property.level} for ${upgradeCost} gold!`);

        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();

        return true;
    },

    // repair property
    repair(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) {
            addMessage('Invalid property!');
            return false;
        }

        if (property.condition >= 100) {
            addMessage('Property is already in excellent condition!');
            return false;
        }

        const repairCost = this.calculateRepairCost(propertyId);

        if (game.player.gold < repairCost) {
            addMessage(`You need ${repairCost} gold to repair this property!`);
            return false;
        }

        game.player.gold -= repairCost;
        property.condition = 100;

        // apply repair bonus
        property.repairBonus = {
            active: true,
            duration: 7,
            efficiency: 1.1
        };

        this.applyPropertyBenefits(propertyId);

        const propertyType = PropertyTypes.get(property.type);
        addMessage(`Repaired ${propertyType.name} to full condition for ${repairCost} gold!`);

        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();

        return true;
    },

    // calculate repair cost
    calculateRepairCost(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 0;

        const propertyType = PropertyTypes.get(property.type);
        const conditionDeficit = 100 - property.condition;

        let baseCost = propertyType.basePrice * 0.1 * (conditionDeficit / 100);

        // security discount
        if (property.upgrades.includes('security')) baseCost *= 0.8;

        // skill discount
        const craftingSkill = game.player.skills?.crafting || 0;
        const repairDiscount = Math.min(0.3, craftingSkill * 0.05);
        baseCost *= (1 - repairDiscount);

        // reputation discount
        if (typeof CityReputationSystem !== 'undefined') {
            const reputation = CityReputationSystem.getReputation(property.location);
            const reputationDiscount = Math.min(0.2, reputation * 0.002);
            baseCost *= (1 - reputationDiscount);
        }

        return Math.round(baseCost);
    },

    // get condition status
    getConditionStatus(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return 'unknown';

        if (property.condition >= 90) return 'excellent';
        if (property.condition >= 75) return 'good';
        if (property.condition >= 50) return 'fair';
        if (property.condition >= 25) return 'poor';
        return 'critical';
    },

    // get condition color
    getConditionColor(propertyId) {
        const status = this.getConditionStatus(propertyId);

        const colors = {
            excellent: '#4CAF50',
            good: '#8BC34A',
            fair: '#FFC107',
            poor: '#FF9800',
            critical: '#F44336',
            unknown: '#9E9E9E'
        };

        return colors[status] || colors.unknown;
    },

    // check if needs urgent repair
    needsUrgentRepair(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        return property && property.condition < 30;
    },

    // get repair recommendations
    getRepairRecommendations(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return [];

        const recommendations = [];

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

        if (!property.upgrades.includes('security') && property.condition < 60) {
            recommendations.push({
                priority: 'low',
                message: 'Security upgrade can reduce damage and repair costs.',
                action: 'upgrade_security'
            });
        }

        return recommendations;
    },

    // upgrade home to next tier
    upgradeHomeTier(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) {
            addMessage('Invalid property!');
            return false;
        }

        const currentType = PropertyTypes.get(property.type);
        if (!currentType || !currentType.upgradeTo) {
            addMessage('This property cannot be upgraded to a higher tier!');
            return false;
        }

        const nextType = PropertyTypes.get(currentType.upgradeTo);
        if (!nextType) {
            addMessage('Invalid upgrade path!');
            return false;
        }

        // calculate upgrade cost (difference + 20% labor)
        const upgradeCost = Math.round((nextType.basePrice - currentType.basePrice) * 1.2);

        if (game.player.gold < upgradeCost) {
            addMessage(`You need ${upgradeCost} gold to upgrade to ${nextType.name}!`);
            return false;
        }

        // check materials
        const materials = PropertyTypes.getBuildingMaterials(nextType.id);
        const missingMaterials = [];

        for (const [material, amount] of Object.entries(materials)) {
            const playerAmount = (typeof PlayerStateManager !== 'undefined')
                ? PlayerStateManager.inventory.getQuantity(material)
                : (game.player?.inventory?.[material] || 0);
            if (playerAmount < amount) {
                missingMaterials.push(`${material}: need ${amount}, have ${playerAmount}`);
            }
        }

        if (missingMaterials.length > 0) {
            addMessage('Missing materials for upgrade:');
            missingMaterials.forEach(m => addMessage(`- ${m}`));
            return false;
        }

        // deduct gold and materials
        game.player.gold -= upgradeCost;

        for (const [material, amount] of Object.entries(materials)) {
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.inventory.remove(material, amount, 'property_upgrade');
            } else if (game.player.inventory) {
                game.player.inventory[material] = (game.player.inventory[material] || 0) - amount;
            }
        }

        // upgrade the property type
        const oldType = property.type;
        property.type = nextType.id;
        property.tier = nextType.tier || 1;

        // preserve upgrades that apply to new tier
        // Keep expansion and security if they were purchased

        // apply new tier benefits
        this.applyPropertyBenefits(propertyId);

        addMessage(`🏠 Upgraded ${currentType.name} to ${nextType.name} for ${upgradeCost} gold!`);

        if (nextType.craftingStation) {
            addMessage('⚒️ Crafting station now available at this property!');
        }

        if (nextType.workerSlots) {
            addMessage(`👥 Can now house ${nextType.workerSlots} workers!`);
        }

        // update UI
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof PropertySystem !== 'undefined') PropertySystem.updatePropertyDisplay();

        return true;
    },

    // get available home tier upgrade
    getHomeTierUpgrade(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return null;

        const currentType = PropertyTypes.get(property.type);
        if (!currentType || !currentType.upgradeTo) return null;

        const nextType = PropertyTypes.get(currentType.upgradeTo);
        if (!nextType) return null;

        const upgradeCost = Math.round((nextType.basePrice - currentType.basePrice) * 1.2);
        const materials = PropertyTypes.getBuildingMaterials(nextType.id);

        // check material availability
        const materialStatus = {};
        let allMaterialsMet = true;

        for (const [material, amount] of Object.entries(materials)) {
            const playerAmount = (typeof PlayerStateManager !== 'undefined')
                ? PlayerStateManager.inventory.getQuantity(material)
                : (game.player?.inventory?.[material] || 0);
            materialStatus[material] = {
                required: amount,
                have: playerAmount,
                met: playerAmount >= amount
            };
            if (!materialStatus[material].met) allMaterialsMet = false;
        }

        return {
            currentTier: currentType.tier || 1,
            nextTier: nextType.tier || 2,
            currentType: currentType,
            nextType: nextType,
            cost: upgradeCost,
            canAfford: game.player.gold >= upgradeCost,
            materials: materialStatus,
            allMaterialsMet: allMaterialsMet,
            constructionTime: PropertyTypes.getConstructionTime(nextType.id),
            benefits: {
                storageIncrease: nextType.storageBonus - currentType.storageBonus,
                incomeIncrease: nextType.baseIncome - currentType.baseIncome,
                craftingStation: nextType.craftingStation && !currentType.craftingStation,
                workerSlots: nextType.workerSlots || 0,
                reputationBonus: nextType.reputationBonus || 0
            }
        };
    },

    // check if property is a home type
    isHomeType(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return false;

        const homeTypes = ['house', 'cottage', 'manor', 'estate'];
        return homeTypes.includes(property.type);
    }
};

// expose to global scope
window.PropertyUpgrades = PropertyUpgrades;
