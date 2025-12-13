// ═══════════════════════════════════════════════════════════════
// PROPERTY INCOME - making money while you sleep in darkness
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyIncome = {
    // Your buildings rot or thrive - these numbers control the decay
    config: {
        levelIncomeMultiplier: 0.2,    // 20% income boost per level
        taxRate: 0.1,                   // 10% tax on gross income
        conditionPenaltyThreshold: 50,  // Below this condition, maintenance increases
        conditionPenaltyMultiplier: 2,  // Max maintenance multiplier at 0 condition
    },

    // Calculate how much gold your crumbling empire generates
    _calculateBaseIncome(property, propertyType) {
        const level = property.level ?? 1;
        const condition = property.condition ?? 100;
        const upgrades = property.upgrades || [];

        // Your empire grows stronger with each level - for now
        let income = propertyType.baseIncome * (1 + (level - 1) * this.config.levelIncomeMultiplier);

        // Upgrades make the gold flow faster
        upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade?.effects?.incomeBonus) {
                income *= upgrade.effects.incomeBonus;
            }
        });

        // Decay takes its toll - broken buildings make less gold
        income *= (condition / 100);

        return { income, level, condition, upgrades };
    },

    // How much it costs to keep your properties from crumbling into dust
    _calculateMaintenance(propertyType, upgrades, condition, includeConditionPenalty = false) {
        let maintenance = propertyType.maintenanceCost;

        // Upgrades slow the rot - slightly
        upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade?.effects?.maintenanceReduction) {
                maintenance *= upgrade.effects.maintenanceReduction;
            }
        });

        // Broken shit costs more to keep standing
        const threshold = this.config.conditionPenaltyThreshold;
        if (includeConditionPenalty && condition < threshold) {
            maintenance *= (this.config.conditionPenaltyMultiplier - condition / threshold);
        }

        return maintenance;
    },

    // See what a single property will earn before time takes it
    calculateIncome(property) {
        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) return 0;

        const { income, upgrades, condition } = this._calculateBaseIncome(property, propertyType);
        const maintenance = this._calculateMaintenance(propertyType, upgrades, condition, false);

        // The crown always takes its cut
        const tax = Math.round(income * this.config.taxRate);
        const netIncome = Math.round(income - maintenance - tax);

        return Math.max(0, netIncome);
    },

    // Each day your empire either grows or withers - let's count the gold
    processDailyIncome() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;

        let totalIncome = 0;
        let totalExpenses = 0;
        let totalMaintenance = 0;
        let totalTax = 0;

        game.player.ownedProperties.forEach(property => {
            // Unfinished buildings don't make gold - shocking, I know
            if (property.underConstruction) return;

            const propertyType = PropertyTypes.get(property.type);
            if (!propertyType) return;

            // Give this property a place to hoard your shit
            if (!property.storageCapacity) {
                PropertyStorage.initialize(property.id);
            }

            // Store what you've produced before it vanishes
            PropertyStorage.autoStoreProducedItems(property.id);

            // Calculate the baseline before workers and other variables corrupt it
            const { income: baseIncome, condition, upgrades: propUpgrades } = this._calculateBaseIncome(property, propertyType);
            let income = baseIncome;

            // Skilled workers make you richer - unskilled ones just cost you
            const propEmployees = property.employees || [];
            const assignedEmployees = propEmployees.map(empId =>
                PropertyEmployeeBridge?.getEmployee?.(empId)
            ).filter(emp => emp && emp.assignedProperty === property.id);

            // Employee bonus stacks from skilled workers but caps at 3x to prevent economic collapse
            let employeeBonus = 1;
            assignedEmployees.forEach(employee => {
                if (employee.skills?.management) {
                    employeeBonus += employee.skills.management * 0.05;
                }
                if (employee.skills?.trading) {
                    employeeBonus += employee.skills.trading * 0.03;
                }
            });
            // Hard cap at 3x - infinite scaling is for cowards
            employeeBonus = Math.min(employeeBonus, 3.0);
            income *= employeeBonus;

            // Now see how much it costs to keep this decaying shit operational
            const maintenance = this._calculateMaintenance(propertyType, propUpgrades, condition, true);

            // The crown always gets 10% - death and taxes, babe
            const tax = Math.round(income * 0.1);
            const netIncome = Math.round(income - maintenance - tax);

            totalIncome += Math.max(0, netIncome);
            totalMaintenance += Math.round(maintenance);
            totalTax += tax;
            totalExpenses += Math.round(maintenance) + tax;

            // Track how much this property has earned over its rotting lifespan
            property.totalIncome += netIncome;
            property.lastIncomeTime = TimeSystem.getTotalMinutes();

            // Fancy properties make people like you more - briefly
            if (propertyType.reputationBonus && typeof CityReputationSystem !== 'undefined') {
                property.upgrades.forEach(upgradeId => {
                    const upgrade = PropertyTypes.getUpgrade(upgradeId);
                    if (upgrade && upgrade.effects.reputationBonus) {
                        CityReputationSystem.addReputation(property.location, upgrade.effects.reputationBonus);
                    }
                });
            }

            // Time rots all things - watch your property crumble
            let conditionLoss = 1;
            if (property.upgrades.includes('security')) conditionLoss *= 0.5;

            const skilledEmployees = assignedEmployees.filter(emp =>
                emp.skills && (emp.skills.maintenance || emp.skills.management)
            );
            if (skilledEmployees.length > 0) conditionLoss *= 0.7;

            property.condition = Math.max(20, property.condition - conditionLoss);

            // Chaos might strike - or fortune might smile
            this.processPropertyEvents(property);
        });

        // Pour the day's gold into your pockets
        game.player.gold += totalIncome;
        game.player.propertyIncome = totalIncome;
        game.player.propertyExpenses = totalExpenses;

        if (totalIncome > 0) {
            addMessage(`💰 Property income: +${totalIncome} gold (Maintenance: ${totalMaintenance} gold, Tax: ${totalTax} gold)`);
        }
    },

    // Roll the dice - maybe vandals, maybe fortune, maybe just another shitty day
    processPropertyEvents(property) {
        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) return;

        // 5% chance the universe decides to fuck with you today
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

        const validEvents = events.filter(event => event.condition);
        if (validEvents.length > 0) {
            const event = validEvents[Math.floor(Math.random() * validEvents.length)];
            event.effect();
        }
    },

    // Check if anything you're building is finally ready
    processConstruction() {
        if (!game.player.ownedProperties) return;

        const currentTime = TimeSystem.getTotalMinutes();

        game.player.ownedProperties.forEach(property => {
            if (property.underConstruction && property.constructionEndTime) {
                if (currentTime >= property.constructionEndTime) {
                    property.underConstruction = false;
                    property.condition = 100;
                    property.constructionStartTime = null;
                    property.constructionEndTime = null;

                    const propertyType = PropertyTypes.get(property.type);
                    if (typeof addMessage === 'function') {
                        addMessage(`🏗️ ${propertyType?.name || property.type} in ${property.locationName} is complete!`, 'success');
                    }

                    document.dispatchEvent(new CustomEvent('construction-complete', { detail: { property } }));
                }
            }
        });
    },

    // Rent is due - pay up or lose your shit
    processRentPayments() {
        if (!game.player.ownedProperties) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const propertiesToRemove = []; // Mark the failures first, purge them after

        game.player.ownedProperties.forEach(property => {
            if (property.isRented && property.rentDueTime) {
                if (currentTime >= property.rentDueTime) {
                    const rentAmount = property.monthlyRent;

                    if (game.player.gold >= rentAmount) {
                        game.player.gold -= rentAmount;
                        property.rentDueTime = currentTime + (7 * 24 * 60);

                        const propertyType = PropertyTypes.get(property.type);
                        if (typeof addMessage === 'function') {
                            addMessage(`📝 Paid ${rentAmount} gold rent for ${propertyType?.name} in ${property.locationName}`, 'info');
                        }
                    } else {
                        const propertyType = PropertyTypes.get(property.type);
                        if (typeof addMessage === 'function') {
                            addMessage(`❌ Couldn't pay rent for ${propertyType?.name}! Property lost.`, 'danger');
                        }
                        propertiesToRemove.push(property.id); // Condemned - execution pending
                    }
                }
            }
        });

        // Purge the condemned properties from existence
        propertiesToRemove.forEach(id => this.loseProperty(id));
    },

    // Watch your investment vanish into the void
    loseProperty(propertyId) {
        const index = game.player.ownedProperties.findIndex(p => p.id === propertyId);
        if (index !== -1) {
            game.player.ownedProperties.splice(index, 1);
            if (typeof PropertySystem !== 'undefined') {
                PropertySystem.updatePropertyDisplay();
            }
        }
    },

    // How close is this building to actually existing
    getConstructionProgress(property) {
        if (!property.underConstruction) return 100;

        const currentTime = TimeSystem.getTotalMinutes();
        const totalTime = property.constructionEndTime - property.constructionStartTime;
        const elapsed = currentTime - property.constructionStartTime;

        return Math.min(100, Math.round((elapsed / totalTime) * 100));
    },

    // Let your workers actually produce the shit you told them to make
    processWorkQueues() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;

        game.player.ownedProperties.forEach(property => {
            if (!property.workQueue || property.workQueue.length === 0) return;
            if (property.underConstruction) return;

            const assignedEmployees = property.employees.map(empId =>
                PropertyEmployeeBridge.getEmployee(empId)
            ).filter(emp => emp && emp.assignedProperty === property.id);

            let productionRate = 1;
            assignedEmployees.forEach(employee => {
                if (employee.skills && employee.skills.production) {
                    productionRate += employee.skills.production * 0.1;
                }
            });

            property.workQueue.forEach(work => {
                if (work.progress >= work.quantity) return;

                const timeSinceStart = TimeSystem.getTotalMinutes() - work.startTime;
                const productionAmount = Math.floor(timeSinceStart * productionRate * 0.01);

                work.progress = Math.min(work.quantity, work.progress + productionAmount);

                if (work.progress >= work.quantity) {
                    if (!property.totalProduction[work.type]) {
                        property.totalProduction[work.type] = 0;
                    }
                    property.totalProduction[work.type] += work.quantity;

                    property.workQueue = property.workQueue.filter(w => w.id !== work.id);

                    const propertyType = PropertyTypes.get(property.type);
                    addMessage(`Completed production of ${work.quantity} ${work.type} at ${propertyType?.name}!`);
                }
            });
        });
    },

    // Repairs don't last forever - countdown to decay
    processRepairBonuses() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;

        game.player.ownedProperties.forEach(property => {
            if (property.repairBonus && property.repairBonus.active) {
                property.repairBonus.duration--;

                if (property.repairBonus.duration <= 0) {
                    property.repairBonus.active = false;
                    const propertyType = PropertyTypes.get(property.type);
                    addMessage(`🔧 Repair bonus expired for ${propertyType?.name}`);
                }
            }
        });
    }
};

// expose to global scope
window.PropertyIncome = PropertyIncome;
