// ═══════════════════════════════════════════════════════════════
// 💰 PROPERTY INCOME - making money while you sleep 🖤
// ═══════════════════════════════════════════════════════════════
// passive income, maintenance, and the harsh reality of taxes 💀
// File Version: GameConfig.version.file | Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const PropertyIncome = {
    // 💵 Calculate income for a single property ⚰️
    calculateIncome(property) {
        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) return 0;

        let income = propertyType.baseIncome;

        // 📈 Level multiplier (20% per level) 🦇
        income *= (1 + (property.level - 1) * 0.2);

        // 🔧 Upgrade bonuses 🗡️
        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade && upgrade.effects.incomeBonus) {
                income *= upgrade.effects.incomeBonus;
            }
        });

        // 🔨 Condition modifier 🌙
        income *= (property.condition / 100);

        // 🛠️ Calculate maintenance 🔮
        let maintenance = propertyType.maintenanceCost;
        property.upgrades.forEach(upgradeId => {
            const upgrade = PropertyTypes.getUpgrade(upgradeId);
            if (upgrade && upgrade.effects.maintenanceReduction) {
                maintenance *= upgrade.effects.maintenanceReduction;
            }
        });

        // 💀 Tax (10% of gross) 🖤
        const tax = Math.round(income * 0.1);
        const netIncome = Math.round(income - maintenance - tax);

        return Math.max(0, netIncome);
    },

    // 📊 Process daily income for all properties ⚰️
    processDailyIncome() {
        if (!game.player.ownedProperties || game.player.ownedProperties.length === 0) return;

        let totalIncome = 0;
        let totalExpenses = 0;
        let totalMaintenance = 0;
        let totalTax = 0;

        game.player.ownedProperties.forEach(property => {
            // skip properties under construction
            if (property.underConstruction) return;

            const propertyType = PropertyTypes.get(property.type);
            if (!propertyType) return;

            // 📦 Initialize storage if needed 🦇
            if (!property.storageCapacity) {
                PropertyStorage.initialize(property.id);
            }

            // 📤 Auto-store produced items 🗡️
            PropertyStorage.autoStoreProducedItems(property.id);

            // 💵 Calculate income 🌙
            let income = propertyType.baseIncome;
            income *= (1 + (property.level - 1) * 0.2);

            // 🔧 Upgrade bonuses 🔮
            property.upgrades.forEach(upgradeId => {
                const upgrade = PropertyTypes.getUpgrade(upgradeId);
                if (upgrade && upgrade.effects.incomeBonus) {
                    income *= upgrade.effects.incomeBonus;
                }
            });

            // 🔨 Condition modifier 💀
            income *= (property.condition / 100);

            // 👥 Employee bonuses 🖤
            const assignedEmployees = property.employees.map(empId =>
                PropertyEmployeeBridge.getEmployee(empId)
            ).filter(emp => emp && emp.assignedProperty === property.id);

            let employeeBonus = 1;
            assignedEmployees.forEach(employee => {
                if (employee.skills && employee.skills.management) {
                    employeeBonus += employee.skills.management * 0.05;
                }
                if (employee.skills && employee.skills.trading) {
                    employeeBonus += employee.skills.trading * 0.03;
                }
            });
            income *= employeeBonus;

            // 🛠️ Calculate maintenance ⚰️
            let maintenance = propertyType.maintenanceCost;
            property.upgrades.forEach(upgradeId => {
                const upgrade = PropertyTypes.getUpgrade(upgradeId);
                if (upgrade && upgrade.effects.maintenanceReduction) {
                    maintenance *= upgrade.effects.maintenanceReduction;
                }
            });

            // 🔨 Poor condition increases maintenance 🦇
            if (property.condition < 50) {
                maintenance *= (2 - property.condition / 50);
            }

            // 💀 Tax 🗡️
            const tax = Math.round(income * 0.1);
            const netIncome = Math.round(income - maintenance - tax);

            totalIncome += Math.max(0, netIncome);
            totalMaintenance += Math.round(maintenance);
            totalTax += tax;
            totalExpenses += Math.round(maintenance) + tax;

            // 📊 Update property stats 🌙
            property.totalIncome += netIncome;
            property.lastIncomeTime = TimeSystem.getTotalMinutes();

            // ⭐ Reputation bonus 🔮
            if (propertyType.reputationBonus && typeof CityReputationSystem !== 'undefined') {
                property.upgrades.forEach(upgradeId => {
                    const upgrade = PropertyTypes.getUpgrade(upgradeId);
                    if (upgrade && upgrade.effects.reputationBonus) {
                        CityReputationSystem.addReputation(property.location, upgrade.effects.reputationBonus);
                    }
                });
            }

            // 🔨 Condition degradation 💀
            let conditionLoss = 1;
            if (property.upgrades.includes('security')) conditionLoss *= 0.5;

            const skilledEmployees = assignedEmployees.filter(emp =>
                emp.skills && (emp.skills.maintenance || emp.skills.management)
            );
            if (skilledEmployees.length > 0) conditionLoss *= 0.7;

            property.condition = Math.max(20, property.condition - conditionLoss);

            // 🎲 Random events 🖤
            this.processPropertyEvents(property);
        });

        // 💰 Apply to player ⚰️
        game.player.gold += totalIncome;
        game.player.propertyIncome = totalIncome;
        game.player.propertyExpenses = totalExpenses;

        if (totalIncome > 0) {
            addMessage(`💰 Property income: +${totalIncome} gold (Maintenance: ${totalMaintenance} gold, Tax: ${totalTax} gold)`);
        }
    },

    // 🎲 Process random property events 🦇
    processPropertyEvents(property) {
        const propertyType = PropertyTypes.get(property.type);
        if (!propertyType) return;

        // 5% chance per day
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

    // 🏗️ Process construction progress 🗡️
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

    // 📝 Process rent payments 🌙
    // 🖤 Fixed race condition - collect properties to remove AFTER iteration 💀
    processRentPayments() {
        if (!game.player.ownedProperties) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const propertiesToRemove = []; // 🦇 Collect IDs first, remove after loop

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
                        propertiesToRemove.push(property.id); // 🖤 Mark for removal, don't modify yet
                    }
                }
            }
        });

        // 💀 Now safely remove all marked properties after iteration complete
        propertiesToRemove.forEach(id => this.loseProperty(id));
    },

    // 💔 Lose a property 🔮
    loseProperty(propertyId) {
        const index = game.player.ownedProperties.findIndex(p => p.id === propertyId);
        if (index !== -1) {
            game.player.ownedProperties.splice(index, 1);
            if (typeof PropertySystem !== 'undefined') {
                PropertySystem.updatePropertyDisplay();
            }
        }
    },

    // 📊 Get construction progress percentage 💀
    getConstructionProgress(property) {
        if (!property.underConstruction) return 100;

        const currentTime = TimeSystem.getTotalMinutes();
        const totalTime = property.constructionEndTime - property.constructionStartTime;
        const elapsed = currentTime - property.constructionStartTime;

        return Math.min(100, Math.round((elapsed / totalTime) * 100));
    },

    // ⚒️ Process work queues for all properties 🖤
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

    // 🔧 Process repair bonuses ⚰️
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

// 🌙 expose to global scope 🦇
window.PropertyIncome = PropertyIncome;
