// Employee System
const EmployeeSystem = {
    // Employee types with their characteristics
    employeeTypes: {
        merchant: {
            id: 'merchant',
            name: 'Merchant',
            description: 'Skilled trader who boosts sales and profits.',
            baseWage: 15,
            skills: { trading: 3, negotiation: 2 },
            productivity: 1.2,
            icon: '🧑‍💼'
        },
        guard: {
            id: 'guard',
            name: 'Guard',
            description: 'Protects property from damage and theft.',
            baseWage: 10,
            skills: { combat: 2, perception: 1 },
            productivity: 1.0,
            damageReduction: 0.3,
            icon: '🗡️'
        },
        worker: {
            id: 'worker',
            name: 'Worker',
            description: 'General laborer for production and maintenance.',
            baseWage: 8,
            skills: { labor: 2 },
            productivity: 1.1,
            icon: '👷'
        },
        craftsman: {
            id: 'craftsman',
            name: 'Craftsman',
            description: 'Skilled artisan who produces high-quality goods.',
            baseWage: 18,
            skills: { crafting: 3, quality: 2 },
            productivity: 1.3,
            icon: '🔨'
        },
        farmer: {
            id: 'farmer',
            name: 'Farmer',
            description: 'Agricultural specialist for farms and food production.',
            baseWage: 12,
            skills: { farming: 3, harvesting: 2 },
            productivity: 1.25,
            icon: '🌾'
        },
        miner: {
            id: 'miner',
            name: 'Miner',
            description: 'Experienced miner for resource extraction.',
            baseWage: 20,
            skills: { mining: 3, strength: 2 },
            productivity: 1.2,
            icon: '⛏️'
        },
        manager: {
            id: 'manager',
            name: 'Manager',
            description: 'Improves efficiency and productivity of other employees.',
            baseWage: 25,
            skills: { management: 3, leadership: 2 },
            productivity: 1.0,
            efficiencyBonus: 1.2,
            icon: '👔'
        },
        apprentice: {
            id: 'apprentice',
            name: 'Apprentice',
            description: 'Learning worker with low wages but potential.',
            baseWage: 5,
            skills: { learning: 2 },
            productivity: 0.8,
            experienceGain: 1.5,
            icon: '🧑‍🎓'
        }
    },
    
    // Initialize employee system
    init() {
        if (!game.player.ownedEmployees) {
            game.player.ownedEmployees = [];
        }
        if (!game.player.employeeExpenses) {
            game.player.employeeExpenses = 0;
        }
        
        // Setup wage processing
        this.setupWageProcessing();
    },
    
    // Setup regular wage processing
    setupWageProcessing() {
        // Process wages every week
        let lastWageDay = -1;
        
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Check if a week has passed (every 7 days)
            if (TimeSystem.currentTime.day % 7 === 0 && TimeSystem.currentTime.day !== lastWageDay) {
                lastWageDay = TimeSystem.currentTime.day;
                EmployeeSystem.processWeeklyWages();
            }
            
            return result;
        };
    },
    
    // Get available employees in current location
    getAvailableEmployees() {
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location) return [];
        
        const availableEmployees = [];
        
        // Employee availability based on location type
        const locationEmployees = {
            village: ['worker', 'apprentice', 'farmer'],
            town: ['merchant', 'guard', 'worker', 'craftsman', 'farmer', 'apprentice'],
            city: ['merchant', 'guard', 'worker', 'craftsman', 'farmer', 'miner', 'manager', 'apprentice']
        };
        
        const employeeIds = locationEmployees[location.type] || locationEmployees.village;
        
        employeeIds.forEach(employeeId => {
            const employeeType = this.employeeTypes[employeeId];
            if (employeeType) {
                // Generate random employee variations
                const employee = this.generateEmployee(employeeId);
                availableEmployees.push(employee);
            }
        });
        
        return availableEmployees;
    },
    
    // Generate a random employee of given type
    generateEmployee(employeeId) {
        const employeeType = this.employeeTypes[employeeId];
        if (!employeeType) return null;
        
        const names = {
            male: ['John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher'],
            female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
        };
        
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        const firstName = names[gender][Math.floor(Math.random() * names[gender].length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: employeeId,
            name: `${firstName} ${surname}`,
            level: 1,
            experience: 0,
            morale: 75,
            productivity: employeeType.productivity,
            wage: employeeType.baseWage,
            skills: { ...employeeType.skills },
            assignedProperty: null,
            hireDate: TimeSystem.getTotalMinutes(),
            totalWagesPaid: 0,
            performance: 50
        };
    },
    
    // Hire employee
    hireEmployee(employeeId) {
        const employee = this.getAvailableEmployees().find(emp => emp.id === employeeId);
        if (!employee) {
            addMessage('Employee not available for hire!');
            return false;
        }
        
        if (game.player.gold < employee.wage * 7) { // Need 1 week wages upfront
            addMessage(`You need ${employee.wage * 7} gold to hire ${employee.name}!`);
            return false;
        }
        
        // Hire employee
        game.player.gold -= employee.wage * 7;
        game.player.ownedEmployees.push(employee);
        
        addMessage(`Hired ${employee.name} (${this.employeeTypes[employee.type].name}) for ${employee.wage} gold/week!`);
        
        // Update UI
        updatePlayerInfo();
        this.updateEmployeeDisplay();
        
        return true;
    },
    
    // Get player's employees
    getPlayerEmployees() {
        return game.player.ownedEmployees || [];
    },
    
    // Get employee by ID
    getEmployee(employeeId) {
        return game.player.ownedEmployees.find(emp => emp.id === employeeId);
    },
    
    // Assign employee to property
    assignEmployeeToProperty(employeeId, propertyId) {
        const employee = this.getEmployee(employeeId);
        const property = PropertySystem.getProperty(propertyId);
        
        if (!employee || !property) {
            addMessage('Invalid employee or property!');
            return false;
        }
        
        // Check if property has available slots
        const propertyType = PropertySystem.propertyTypes[property.type];
        const maxSlots = propertyType.workerSlots || 0;
        const currentSlots = property.employees.length;
        
        if (currentSlots >= maxSlots) {
            addMessage('Property has no available employee slots!');
            return false;
        }
        
        // Remove from previous property if assigned
        if (employee.assignedProperty) {
            const prevProperty = PropertySystem.getProperty(employee.assignedProperty);
            if (prevProperty) {
                prevProperty.employees = prevProperty.employees.filter(id => id !== employeeId);
            }
        }
        
        // Assign to new property
        employee.assignedProperty = propertyId;
        property.employees.push(employeeId);
        
        addMessage(`Assigned ${employee.name} to ${propertyType.name}!`);
        
        // Update displays
        this.updateEmployeeDisplay();
        PropertySystem.updatePropertyDisplay();
        
        return true;
    },
    
    // Process weekly wages
    processWeeklyWages() {
        if (!game.player.ownedEmployees || game.player.ownedEmployees.length === 0) return;
        
        let totalWages = 0;
        
        game.player.ownedEmployees.forEach(employee => {
            totalWages += employee.wage * 7; // Weekly wages
            employee.totalWagesPaid += employee.wage * 7;
            
            // Update morale based on wage satisfaction
            const wageSatisfaction = employee.wage / this.employeeTypes[employee.type].baseWage;
            if (wageSatisfaction >= 1.2) {
                employee.morale = Math.min(100, employee.morale + 5);
            } else if (wageSatisfaction < 0.8) {
                employee.morale = Math.max(0, employee.morale - 10);
            }
            
            // Experience gain
            employee.experience += 1;
            if (employee.experience >= employee.level * 100) {
                employee.level++;
                employee.experience = 0;
                addMessage(`${employee.name} has reached level ${employee.level}!`);
            }
        });
        
        // Deduct wages
        if (game.player.gold >= totalWages) {
            game.player.gold -= totalWages;
            game.player.employeeExpenses = totalWages;
            addMessage(`💸 Weekly wages paid: ${totalWages} gold`);
        } else {
            // Not enough gold for wages
            addMessage(`⚠️ Cannot pay wages! Employees may quit soon.`);
            
            // Reduce morale significantly
            game.player.ownedEmployees.forEach(employee => {
                employee.morale = Math.max(0, employee.morale - 20);
            });
        }
        
        // Check for employees quitting due to low morale
        this.checkEmployeeTurnover();
        
        // Update UI
        updatePlayerInfo();
        this.updateEmployeeDisplay();
    },
    
    // Check for employee turnover
    checkEmployeeTurnover() {
        if (!game.player.ownedEmployees) return;
        
        const employeesToKeep = [];
        
        game.player.ownedEmployees.forEach(employee => {
            // Employees with very low morale may quit
            if (employee.morale < 20 && Math.random() < 0.3) {
                addMessage(`${employee.name} has quit due to low morale!`);
                
                // Remove from assigned property
                if (employee.assignedProperty) {
                    const property = PropertySystem.getProperty(employee.assignedProperty);
                    if (property) {
                        property.employees = property.employees.filter(id => id !== employee.id);
                    }
                }
            } else {
                employeesToKeep.push(employee);
            }
        });
        
        game.player.ownedEmployees = employeesToKeep;
    },
    
    // Update employee display
    updateEmployeeDisplay() {
        const container = document.getElementById('employees-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const employees = this.getPlayerEmployees();
        
        if (employees.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no employees yet.</p>';
            return;
        }
        
        employees.forEach(employee => {
            const employeeElement = this.createEmployeeElement(employee);
            container.appendChild(employeeElement);
        });
    },
    
    // Create employee element
    createEmployeeElement(employee) {
        const employeeType = this.employeeTypes[employee.type];
        const assignedProperty = employee.assignedProperty ? 
            PropertySystem.getProperty(employee.assignedProperty) : null;
        
        const element = document.createElement('div');
        element.className = 'employee-item';
        element.dataset.employeeId = employee.id;
        
        element.innerHTML = `
            <div class="employee-header">
                <span class="employee-icon">${employeeType.icon}</span>
                <span class="employee-name">${employee.name}</span>
                <span class="employee-type">${employeeType.name}</span>
            </div>
            <div class="employee-stats">
                <div class="employee-stat">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${employee.level}</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Morale:</span>
                    <span class="stat-value">${employee.morale}%</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Wage:</span>
                    <span class="stat-value">${employee.wage} gold/week</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Assigned:</span>
                    <span class="stat-value">${assignedProperty ? assignedProperty.type : 'None'}</span>
                </div>
            </div>
            <div class="employee-actions">
                <button class="employee-action-btn" onclick="EmployeeSystem.showEmployeeDetails('${employee.id}')">Details</button>
                <button class="employee-action-btn" onclick="EmployeeSystem.adjustWage('${employee.id}')">Adjust Wage</button>
                <button class="employee-action-btn" onclick="EmployeeSystem.fireEmployee('${employee.id}')">Fire</button>
            </div>
        `;
        
        return element;
    },
    
    // Show employee details
    showEmployeeDetails(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        const employeeType = this.employeeTypes[employee.type];
        const assignedProperty = employee.assignedProperty ? 
            PropertySystem.getProperty(employee.assignedProperty) : null;
        
        // Create details display
        addMessage(`Employee: ${employee.name} (${employeeType.name}) - Level ${employee.level}, Morale ${employee.morale}%, Wage ${employee.wage} gold/week`);
    },
    
    // Adjust employee wage
    adjustWage(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        const newWage = prompt(`Enter new weekly wage for ${employee.name} (current: ${employee.wage}):`);
        if (!newWage) return;
        
        const wage = parseInt(newWage);
        if (isNaN(wage) || wage < 1) {
            addMessage('Invalid wage amount!');
            return;
        }
        
        employee.wage = wage;
        addMessage(`Adjusted ${employee.name}'s wage to ${wage} gold/week!`);
        
        // Update morale based on wage change
        const wageChange = wage - this.employeeTypes[employee.type].baseWage;
        if (wageChange > 0) {
            employee.morale = Math.min(100, employee.morale + 10);
        } else if (wageChange < -5) {
            employee.morale = Math.max(0, employee.morale - 15);
        }
        
        // Update UI
        this.updateEmployeeDisplay();
    },
    
    // Fire employee
    fireEmployee(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        if (!confirm(`Are you sure you want to fire ${employee.name}?`)) return;
        
        // Remove from assigned property
        if (employee.assignedProperty) {
            const property = PropertySystem.getProperty(employee.assignedProperty);
            if (property) {
                property.employees = property.employees.filter(id => id !== employee.id);
            }
        }
        
        // Remove from player's employees
        game.player.ownedEmployees = game.player.ownedEmployees.filter(emp => emp.id !== employeeId);
        
        addMessage(`Fired ${employee.name}!`);
        
        // Update UI
        this.updateEmployeeDisplay();
        PropertySystem.updatePropertyDisplay();
    }
};