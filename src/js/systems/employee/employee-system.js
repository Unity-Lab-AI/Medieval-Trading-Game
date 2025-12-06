// 
// EMPLOYEE SYSTEM - medieval wage slavery simulator
// 
// Version: 0.90.01 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const EmployeeSystem = {
    //  Employee types - varieties of exploitable labor
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
            icon: ''
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
        //  Guard against early initialization when player doesn't exist yet 
        if (!game || !game.player) {
            console.log('🖤 EmployeeSystem.init() called before player exists... waiting in the shadows');
            return;
        }
        if (!game.player.ownedEmployees) {
            game.player.ownedEmployees = [];
        }
        if (!game.player.employeeExpenses) {
            game.player.employeeExpenses = 0;
        }
        
        // Note: Wage processing is now handled directly in game.update
        // This prevents game.update wrapping which caused performance issues
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
                // Generate multiple random employee variations
                for (let i = 0; i < 3; i++) { // Generate 3 of each type
                    const employee = this.generateEmployee(employeeId);
                    availableEmployees.push(employee);
                }
            }
        });
        
        return availableEmployees;
    },
    
    // Show employee hiring interface
    showHiringInterface() {
        const availableEmployees = this.getAvailableEmployees();
        
        if (availableEmployees.length === 0) {
            addMessage('No employees available for hire in this location.');
            return;
        }
        
        // Create hiring interface HTML
        const hiringHtml = `
            <div class="employee-hiring-interface">
                <h2>👥 Available Employees in ${game.currentLocation.name}</h2>
                <div class="hiring-filters">
                    <button class="filter-btn active" onclick="EmployeeSystem.filterEmployees('all')">All</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('merchant')">Merchants</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('guard')">Guards</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('worker')">Workers</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('craftsman')">Craftsmen</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('farmer')">Farmers</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('miner')">Miners</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('manager')">Managers</button>
                    <button class="filter-btn" onclick="EmployeeSystem.filterEmployees('apprentice')">Apprentices</button>
                </div>
                <div class="employees-grid" id="employees-hiring-grid">
                    <!-- Employees will be populated here -->
                </div>
                <div class="hiring-summary">
                    <div class="player-gold">
                        <span class="gold-icon">💰</span>
                        <span class="gold-amount">${game.player.gold}</span>
                        <span class="gold-label">Gold Available</span>
                    </div>
                    <div class="employee-count">
                        <span class="count-label">Current Employees:</span>
                        <span class="count-value">${this.getPlayerEmployees().length}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage('Browsing available employees...');
        
        // Populate employees grid
        this.populateHiringGrid(availableEmployees);
    },
    
    // Filter employees by type
    filterEmployees(type) {
        const allEmployees = this.getAvailableEmployees();
        const filteredEmployees = type === 'all' ?
            allEmployees :
            allEmployees.filter(emp => emp.type === type);

        // Update filter buttons - find the active button by matching the type
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            // Check if this button is for the current filter type
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(`'${type}'`)) {
                btn.classList.add('active');
            }
        });

        // Repopulate grid
        this.populateHiringGrid(filteredEmployees);
    },
    
    // Populate hiring grid
    populateHiringGrid(employees) {
        const grid = document.getElementById('employees-hiring-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        employees.forEach(employee => {
            const employeeCard = this.createHiringCard(employee);
            grid.appendChild(employeeCard);
        });
    },
    
    // Create employee hiring card
    createHiringCard(employee) {
        const employeeType = this.employeeTypes[employee.type];
        const canAfford = game.player.gold >= employee.wage * 7;
        
        const card = document.createElement('div');
        card.className = `employee-hiring-card ${canAfford ? 'affordable' : 'unaffordable'}`;
        
        card.innerHTML = `
            <div class="employee-card-header">
                <span class="employee-icon">${employeeType.icon}</span>
                <div class="employee-name-section">
                    <h3 class="employee-name">${employee.name}</h3>
                    <span class="employee-type">${employeeType.name}</span>
                </div>
                <span class="employee-level">Level ${employee.level}</span>
            </div>
            <div class="employee-card-description">
                <p>${employeeType.description}</p>
            </div>
            <div class="employee-card-stats">
                <div class="stat-row">
                    <span class="stat-label">Wage:</span>
                    <span class="stat-value wage">${employee.wage} gold/week</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Morale:</span>
                    <span class="stat-value morale-${employee.morale > 70 ? 'good' : employee.morale > 40 ? 'fair' : 'poor'}">${employee.morale}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Productivity:</span>
                    <span class="stat-value productivity">${(employee.productivity * 100).toFixed(0)}%</span>
                </div>
                <div class="employee-skills">
                    <h4>Skills:</h4>
                    <div class="skills-list">
                        ${Object.entries(employee.skills).map(([skill, level]) => `
                            <div class="skill-item">
                                <span class="skill-name">${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                                <div class="skill-level">
                                    <div class="skill-bar">
                                        <div class="skill-fill" style="width: ${(level / 5) * 100}%"></div>
                                    </div>
                                    <span class="skill-value">${level}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="employee-card-actions">
                <button class="hire-btn ${canAfford ? 'enabled' : 'disabled'}"
                        onclick="EmployeeSystem.attemptHireEmployee('${employee.id}')"
                        ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? `Hire for ${employee.wage * 7} gold` : 'Cannot Afford'}
                </button>
                <button class="details-btn" onclick="EmployeeSystem.showEmployeeHiringDetails('${employee.id}')">
                    View Details
                </button>
            </div>
        `;
        
        return card;
    },
    
    // Attempt to hire employee
    attemptHireEmployee(employeeId) {
        const employee = this.getAvailableEmployees().find(emp => emp.id === employeeId);
        if (!employee) {
            addMessage('Employee no longer available!');
            return false;
        }
        
        return this.hireEmployee(employeeId);
    },
    
    // Show detailed employee information for hiring
    showEmployeeHiringDetails(employeeId) {
        const employee = this.getAvailableEmployees().find(emp => emp.id === employeeId);
        if (!employee) return;
        
        const employeeType = this.employeeTypes[employee.type];
        const hireCost = employee.wage * 7;
        
        const detailsHtml = `
            <div class="employee-details-modal">
                <div class="modal-header">
                    <h2>${employeeType.icon} ${employee.name}</h2>
                    <button class="close-btn" onclick="EmployeeSystem.closeEmployeeHiringDetails()">✕</button>
                </div>
                <div class="modal-content">
                    <div class="employee-overview">
                        <div class="employee-icon-large">${employeeType.icon}</div>
                        <div class="employee-info">
                            <h3>${employee.name}</h3>
                            <p class="employee-type">${employeeType.name} (Level ${employee.level})</p>
                            <p class="employee-description">${employeeType.description}</p>
                        </div>
                    </div>
                    
                    <div class="employee-financials">
                        <h3>Financial Information</h3>
                        <div class="financial-grid">
                            <div class="financial-item">
                                <span class="label">Weekly Wage:</span>
                                <span class="value wage">${employee.wage} gold</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Hiring Cost:</span>
                                <span class="value cost">${hireCost} gold</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Monthly Cost:</span>
                                <span class="value">${employee.wage * 4} gold</span>
                            </div>
                            <div class="financial-item">
                                <span class="label">Yearly Cost:</span>
                                <span class="value">${employee.wage * 52} gold</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="employee-skills-detailed">
                        <h3>Skills & Abilities</h3>
                        <div class="skills-grid">
                            ${Object.entries(employee.skills).map(([skill, level]) => `
                                <div class="skill-detailed">
                                    <div class="skill-header">
                                        <span class="skill-name">${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                                        <span class="skill-level">Level ${level}/5</span>
                                    </div>
                                    <div class="skill-bar-detailed">
                                        <div class="skill-fill-detailed" style="width: ${(level / 5) * 100}%"></div>
                                    </div>
                                    <div class="skill-description">
                                        ${this.getSkillDescription(skill, level)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="employee-traits">
                        <h3>Employee Traits</h3>
                        <div class="traits-list">
                            <div class="trait-item">
                                <span class="trait-icon"></span>
                                <span class="trait-name">Productivity:</span>
                                <span class="trait-value">${(employee.productivity * 100).toFixed(0)}%</span>
                            </div>
                            <div class="trait-item">
                                <span class="trait-icon">😊</span>
                                <span class="trait-name">Morale:</span>
                                <span class="trait-value morale-${employee.morale > 70 ? 'good' : employee.morale > 40 ? 'fair' : 'poor'}">${employee.morale}%</span>
                            </div>
                            <div class="trait-item">
                                <span class="trait-icon">📈</span>
                                <span class="trait-name">Experience:</span>
                                <span class="trait-value">${employee.experience}/${employee.level * 100}</span>
                            </div>
                            ${employeeType.damageReduction ? `
                            <div class="trait-item">
                                <span class="trait-icon">🛡️</span>
                                <span class="trait-name">Damage Reduction:</span>
                                <span class="trait-value">${(employeeType.damageReduction * 100).toFixed(0)}%</span>
                            </div>
                            ` : ''}
                            ${employeeType.efficiencyBonus ? `
                            <div class="trait-item">
                                <span class="trait-icon">📊</span>
                                <span class="trait-name">Efficiency Bonus:</span>
                                <span class="trait-value">${(employeeType.efficiencyBonus * 100).toFixed(0)}%</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="hire-btn ${game.player.gold >= hireCost ? 'enabled' : 'disabled'}"
                            onclick="EmployeeSystem.attemptHireEmployee('${employee.id}')"
                            ${game.player.gold < hireCost ? 'disabled' : ''}>
                        Hire for ${hireCost} gold
                    </button>
                    <button class="cancel-btn" onclick="EmployeeSystem.closeEmployeeHiringDetails()">Cancel</button>
                </div>
            </div>
        `;
        
        // Display modal
        this.showModal(detailsHtml);
    },
    
    // Get skill description
    getSkillDescription(skill, level) {
        const descriptions = {
            trading: [
                'Basic understanding of trade principles',
                'Can negotiate small profits',
                'Skilled in market analysis',
                'Expert trader with excellent instincts',
                'Master negotiator, legendary reputation'
            ],
            negotiation: [
                'Can ask for better prices',
                'Reasonable bargaining skills',
                'Good at finding deals',
                'Excellent negotiator',
                'Master negotiator'
            ],
            combat: [
                'Basic self-defense',
                'Can handle minor threats',
                'Skilled fighter',
                'Expert combatant',
                'Master warrior'
            ],
            perception: [
                'Average awareness',
                'Notices unusual activity',
                'Good attention to detail',
                'Excellent observation skills',
                'Almost nothing escapes notice'
            ],
            labor: [
                'Basic work ability',
                'Reliable worker',
                'Strong and dependable',
                'Exceptional work ethic',
                'Legendary productivity'
            ],
            crafting: [
                'Basic crafting knowledge',
                'Can make simple items',
                'Skilled craftsman',
                'Expert artisan',
                'Master craftsman'
            ],
            quality: [
                'Basic quality control',
                'Attention to detail',
                'High quality standards',
                'Exceptional quality',
                'Legendary craftsmanship'
            ],
            farming: [
                'Basic agricultural knowledge',
                'Knows crop cycles',
                'Skilled farmer',
                'Expert agriculturalist',
                'Master farmer'
            ],
            harvesting: [
                'Basic harvesting skills',
                'Efficient gathering',
                'Skilled harvester',
                'Expert gathering techniques',
                'Master harvester'
            ],
            mining: [
                'Basic mining knowledge',
                'Can identify valuable veins',
                'Skilled miner',
                'Expert prospector',
                'Master miner'
            ],
            strength: [
                'Average strength',
                'Above average strength',
                'Strong worker',
                'Exceptional strength',
                'Legendary strength'
            ],
            management: [
                'Basic leadership',
                'Can organize small teams',
                'Good manager',
                'Excellent leader',
                'Master manager'
            ],
            leadership: [
                'Basic leadership skills',
                'Can motivate others',
                'Good leader',
                'Inspiring leader',
                'Legendary leadership'
            ],
            learning: [
                'Quick learner',
                'Fast progress',
                'Exceptional learning ability',
                'Rapid skill development',
                'Prodigious learner'
            ]
        };
        
        const skillDescriptions = descriptions[skill] || ['Unknown skill'];
        return skillDescriptions[Math.min(level - 1, skillDescriptions.length - 1)];
    },
    
    // Show modal helper function
    showModal(html) {
        // Use shared modal utility if available, otherwise use employee-specific implementation
        if (typeof ModalSystem !== 'undefined' && ModalSystem.showModal) {
            return ModalSystem.showModal(html, 'employee-modal-container');
        }
        
        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('employee-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'employee-modal-container';
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';
    },
    
    // Close employee hiring details modal
    closeEmployeeHiringDetails() {
        const modalContainer = document.getElementById('employee-modal-container');
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
    },
    
    // Assign task to employee
    assignTaskToEmployee(employeeId, taskType) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return false;
        
        const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
        if (!property) {
            addMessage('Employee must be assigned to a property first!');
            return false;
        }
        
        const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
        if (!propertyType.production || !propertyType.production[taskType]) {
            addMessage(`This property cannot produce ${taskType}!`);
            return false;
        }
        
        // Check if employee has required skill
        const requiredSkills = {
            food: ['farming', 'harvesting'],
            grain: ['farming', 'harvesting'],
            stone: ['mining', 'strength'],
            iron_ore: ['mining', 'strength'],
            coal: ['mining', 'strength'],
            tools: ['crafting', 'labor'],
            weapons: ['crafting', 'labor'],
            ale: ['crafting', 'labor']
        };
        
        const taskSkills = requiredSkills[taskType] || [];
        const hasRequiredSkill = taskSkills.some(skill =>
            employee.skills[skill] && employee.skills[skill] >= 2
        );
        
        if (!hasRequiredSkill) {
            addMessage(`${employee.name} lacks required skills for ${taskType} production!`);
            return false;
        }
        
        // Assign task
        employee.currentTask = taskType;
        employee.taskProgress = 0;
        
        addMessage(`Assigned ${taskType} production task to ${employee.name}!`);
        
        // Update UI
        this.updateEmployeeDisplay();
        
        return true;
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
            id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
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

        // Initialize companion stats if CompanionSystem available
        if (typeof CompanionSystem !== 'undefined') {
            if (!employee.mode) employee.mode = 'travel';
            if (!employee.inventory) employee.inventory = {};
            if (!employee.gold) employee.gold = 0;
            if (!employee.carryWeight) employee.carryWeight = 0;
            if (!employee.maxCarryWeight) employee.maxCarryWeight = CompanionSystem.getBaseCarryWeight(employee.type);
            if (!employee.health) employee.health = CompanionSystem.getBaseStat(employee.type, 'health');
            if (!employee.maxHealth) employee.maxHealth = CompanionSystem.getBaseStat(employee.type, 'health');
            if (!employee.attack) employee.attack = CompanionSystem.getBaseStat(employee.type, 'attack');
            if (!employee.defense) employee.defense = CompanionSystem.getBaseStat(employee.type, 'defense');
        }

        game.player.ownedEmployees.push(employee);

        addMessage(`Hired ${employee.name} (${this.employeeTypes[employee.type].name}) for ${employee.wage} gold/week!`);

        // Update UI
        updatePlayerInfo();
        this.updateEmployeeDisplay();

        // Ask where to assign companion
        this.showCompanionAssignmentChoice(employee.id);

        return true;
    },

    // Show choice for newly hired companion
    showCompanionAssignmentChoice(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;

        if (typeof ModalSystem !== 'undefined' && typeof CompanionSystem !== 'undefined') {
            ModalSystem.show({
                title: `${employee.name} - Assignment`,
                content: `
                    <p>Where should ${employee.name} go?</p>
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                        <button class="assignment-choice-btn" onclick="EmployeeSystem.assignNewCompanionToTravel('${employee.id}'); ModalSystem.hide();"
                            style="padding: 15px; background: rgba(79,195,247,0.2); border: 1px solid rgba(79,195,247,0.4); border-radius: 6px; color: #4fc3f7; cursor: pointer;">
                            🤝 <strong>Travel with me</strong><br>
                            <span style="font-size: 0.85em; color: #888;">Join your party, help in combat, carry items</span>
                        </button>
                        <button class="assignment-choice-btn" onclick="EmployeeSystem.assignNewCompanionToProperty('${employee.id}'); ModalSystem.hide();"
                            style="padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #ddd; cursor: pointer;">
                            🏠 <strong>Work at a property</strong><br>
                            <span style="font-size: 0.85em; color: #888;">Assign to one of your properties</span>
                        </button>
                    </div>
                `,
                buttons: []
            });
        } else {
            // Default to travel mode if systems not available
            if (employee.mode) employee.mode = 'travel';
        }
    },

    // Assign newly hired companion to travel mode
    assignNewCompanionToTravel(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;

        employee.mode = 'travel';
        addMessage(`${employee.name} will travel with you!`);

        if (typeof PartyPanel !== 'undefined') {
            PartyPanel.updatePanel();
        }
    },

    // Show property assignment for newly hired companion
    assignNewCompanionToProperty(employeeId) {
        this.showAssignmentInterface(employeeId);
    },
    
    // Get player's employees
    getPlayerEmployees() {
        return game.player.ownedEmployees || [];
    },

    // Get employees (alias for compatibility)
    getEmployees() {
        return this.getPlayerEmployees();
    },

    // Load employees from save data
    loadEmployees(employees) {
        if (!employees || !Array.isArray(employees)) {
            console.log('💾 No employees to load - guess you gotta do everything yourself 💀');
            return;
        }

        game.player.ownedEmployees = employees;
        console.log(`💾 Loaded ${employees.length} employees from save - your workforce awaits exploitation 🖤`);

        // Update display if available
        this.updateEmployeeDisplay();
    },

    // Get employee by ID
    getEmployee(employeeId) {
        return game.player.ownedEmployees.find(emp => emp.id === employeeId);
    },
    
    // Assign employee to property
    assignEmployeeToProperty(employeeId, propertyId) {
        const employee = this.getEmployee(employeeId);
        const property = PropertyEmployeeBridge.getProperty(propertyId);
        
        if (!employee || !property) {
            addMessage('Invalid employee or property!');
            return false;
        }
        
        // Check if property can accept this employee type
        if (!PropertyEmployeeBridge.canAcceptEmployee(propertyId, employee.type)) {
            addMessage('Property cannot accept this employee type or has no available slots!');
            return false;
        }
        
        // Check employee compatibility with property type
        const employeeType = this.employeeTypes[employee.type];
        const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
        
        if (!this.isEmployeeCompatibleWithProperty(employee.type, property.type)) {
            addMessage(`${employeeType.name} is not compatible with ${propertyType.name}!`);
            return false;
        }
        
        // Remove from previous property if assigned
        if (employee.assignedProperty) {
            const prevProperty = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
            if (prevProperty) {
                prevProperty.employees = prevProperty.employees.filter(id => id !== employeeId);
            }
        }
        
        // Assign to new property
        employee.assignedProperty = propertyId;
        property.employees.push(employeeId);
        
        // Apply assignment effects
        this.applyEmployeeAssignmentEffects(employeeId, propertyId);
        
        addMessage(`Assigned ${employee.name} (${employeeType.name}) to ${propertyType.name}!`);
        
        // Update displays
        this.updateEmployeeDisplay();
        PropertyEmployeeBridge.updatePropertyDisplay();
        
        return true;
    },
    
    // Check if employee is compatible with property type
    isEmployeeCompatibleWithProperty(employeeType, propertyType) {
        const compatibility = {
            // Property type: compatible employee types
            house: ['guard', 'manager', 'apprentice'],
            shop: ['merchant', 'guard', 'manager', 'apprentice'],
            warehouse: ['worker', 'guard', 'manager', 'apprentice'],
            farm: ['farmer', 'worker', 'guard', 'manager', 'apprentice'],
            mine: ['miner', 'worker', 'guard', 'manager', 'apprentice'],
            tavern: ['merchant', 'worker', 'guard', 'manager', 'apprentice'],
            market_stall: ['merchant', 'apprentice'],
            craftshop: ['craftsman', 'worker', 'guard', 'manager', 'apprentice']
        };
        
        const compatibleEmployees = compatibility[propertyType] || [];
        return compatibleEmployees.includes(employeeType);
    },
    
    // Apply effects when employee is assigned to property
    applyEmployeeAssignmentEffects(employeeId, propertyId) {
        const employee = this.getEmployee(employeeId);
        const property = PropertyEmployeeBridge.getProperty(propertyId);
        
        if (!employee || !property) return;
        
        // Set employee role based on assignment
        employee.role = this.determineEmployeeRole(employee.type, property.type);
        
        // Apply morale boost for good assignments
        const employeeType = this.employeeTypes[employee.type];
        const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
        
        if (this.isOptimalAssignment(employee.type, property.type)) {
            employee.morale = Math.min(100, employee.morale + 5);
            employee.productivity = Math.min(2.0, employee.productivity * 1.1);
        }
        
        // Initialize task assignment if applicable
        if (propertyType.production) {
            employee.currentTask = null;
            employee.taskProgress = 0;
        }
    },
    
    // Determine employee role based on type and property
    determineEmployeeRole(employeeType, propertyType) {
        const roles = {
            // Employee type: default role
            merchant: 'merchant',
            guard: 'guard',
            worker: 'worker',
            craftsman: 'craftsman',
            farmer: 'farmer',
            miner: 'miner',
            manager: 'manager',
            apprentice: 'apprentice'
        };
        
        // Special cases based on property type
        if (propertyType === 'shop' && employeeType === 'manager') return 'manager';
        if (propertyType === 'tavern' && employeeType === 'merchant') return 'bartender';
        if (propertyType === 'warehouse' && employeeType === 'worker') return 'stockkeeper';
        
        return roles[employeeType] || 'worker';
    },
    
    // Check if this is an optimal assignment
    isOptimalAssignment(employeeType, propertyType) {
        const optimalAssignments = {
            merchant: ['shop', 'tavern', 'market_stall'],
            guard: ['shop', 'warehouse', 'mine', 'tavern'],
            worker: ['warehouse', 'farm', 'mine', 'craftshop'],
            craftsman: ['craftshop'],
            farmer: ['farm'],
            miner: ['mine'],
            manager: ['shop', 'warehouse', 'farm', 'mine', 'tavern', 'craftshop'],
            apprentice: ['farm', 'mine', 'craftshop', 'shop']
        };
        
        return optimalAssignments[employeeType]?.includes(propertyType) || false;
    },
    
    // Show employee assignment interface
    showAssignmentInterface(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;
        
        const properties = PropertyEmployeeBridge.getPlayerProperties();
        const employeeType = this.employeeTypes[employee.type];
        
        // Create assignment interface HTML
        const assignmentHtml = `
            <div class="employee-assignment-interface">
                <h2>📍 Assign ${employee.name} (${employeeType.name})</h2>
                <div class="employee-current-assignment">
                    ${employee.assignedProperty ?
                        `<p>Currently assigned to: ${PropertyEmployeeBridge.getProperty(employee.assignedProperty)?.type || 'Unknown'}</p>` :
                        '<p>Currently unassigned</p>'
                    }
                </div>
                <div class="properties-list" id="assignment-properties-list">
                    <!-- Properties will be populated here -->
                </div>
                <div class="assignment-options">
                    <button class="unassign-btn" onclick="EmployeeSystem.unassignEmployee('${employeeId}')"
                            ${!employee.assignedProperty ? 'disabled' : ''}>
                        Unassign from Current Property
                    </button>
                </div>
            </div>
        `;
        
        // Show in a modal or update a panel
        addMessage(`Managing assignment for ${employee.name}...`);
        
        // Populate properties list
        this.populateAssignmentPropertiesList(properties, employeeId);
    },
    
    // Populate assignment properties list
    populateAssignmentPropertiesList(properties, employeeId) {
        const list = document.getElementById('assignment-properties-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        const employee = this.getEmployee(employeeId);
        
        if (properties.length === 0) {
            list.innerHTML = '<p class="empty-message">You own no properties to assign employees to.</p>';
            return;
        }
        
        properties.forEach(property => {
            const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
            const isCompatible = PropertyEmployeeBridge.isEmployeeCompatibleWithProperty(employee.type, property.type);
            const canAccept = PropertyEmployeeBridge.canAcceptEmployee(property.id, employee.type);
            const isOptimal = this.isOptimalAssignment(employee.type, property.type);
            const isCurrent = employee.assignedProperty === property.id;
            
            const propertyCard = document.createElement('div');
            propertyCard.className = `assignment-property-card ${isCurrent ? 'current' : ''} ${!isCompatible || !canAccept ? 'incompatible' : ''} ${isOptimal ? 'optimal' : ''}`;
            
            propertyCard.innerHTML = `
                <div class="property-header">
                    <span class="property-icon">${propertyType.icon}</span>
                    <span class="property-name">${propertyType.name}</span>
                    <span class="property-location">${GameWorld.locations[property.location]?.name || 'Unknown'}</span>
                </div>
                <div class="property-status">
                    <div class="status-item">
                        <span class="status-label">Compatibility:</span>
                        <span class="status-value ${isCompatible ? 'compatible' : 'incompatible'}">
                            ${isCompatible ? '✓ Compatible' : '✗ Incompatible'}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Available Slots:</span>
                        <span class="status-value ${canAccept ? 'available' : 'full'}">
                            ${canAccept ? 'Available' : 'Full'}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Optimal:</span>
                        <span class="status-value ${isOptimal ? 'optimal' : 'suboptimal'}">
                            ${isOptimal ? 'Optimal' : 'Standard'}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Current Employees:</span>
                        <span class="status-value">${property.employees.length}/${PropertyEmployeeBridge.getEmployeeCapacity(property.id).total}</span>
                    </div>
                </div>
                <div class="property-actions">
                    <button class="assign-btn ${isCompatible && canAccept ? 'enabled' : 'disabled'}"
                            onclick="EmployeeSystem.assignEmployeeToProperty('${employeeId}', '${property.id}')"
                            ${!isCompatible || !canAccept || isCurrent ? 'disabled' : ''}>
                        ${isCurrent ? 'Currently Assigned' : (isCompatible && canAccept ? 'Assign Here' : 'Cannot Assign')}
                    </button>
                </div>
            `;
            
            list.appendChild(propertyCard);
        });
    },
    
    // Unassign employee from property
    unassignEmployee(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee || !employee.assignedProperty) {
            addMessage('Employee is not assigned to any property!');
            return false;
        }
        
        const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
        const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
        
        // Remove from property
        property.employees = property.employees.filter(id => id !== employeeId);
        employee.assignedProperty = null;
        employee.role = null;
        employee.currentTask = null;
        employee.taskProgress = 0;
        
        // Apply morale penalty for unassignment
        employee.morale = Math.max(0, employee.morale - 5);
        
        addMessage(`Unassigned ${employee.name} from ${propertyType.name}!`);
        
        // Update displays
        this.updateEmployeeDisplay();
        PropertyEmployeeBridge.updatePropertyDisplay();
        
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
            
            // Process skill progression and experience
            this.processEmployeeSkillProgression(employee);
            
            // Update performance based on assignment and skills
            this.updateEmployeePerformance(employee);
            
            // Check for special events
            this.processEmployeeEvents(employee);
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
    
    // Process employee skill progression
    processEmployeeSkillProgression(employee) {
        const employeeType = this.employeeTypes[employee.type];
        
        // Base experience gain
        let experienceGain = 10;
        
        // Experience bonus based on assignment
        if (employee.assignedProperty) {
            const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
            if (property) {
                // Optimal assignments give more experience
                if (PropertyEmployeeBridge.isOptimalAssignment(employee.type, property.type)) {
                    experienceGain *= 1.5;
                }
                
                // Working on production properties gives skill-specific experience
                const propertyType = PropertyEmployeeBridge.getPropertyType(property.type);
                if (propertyType.production) {
                    experienceGain *= 1.2;
                }
                
                // Managers get extra experience from managing other employees
                if (employee.type === 'manager') {
                    const managedEmployees = property.employees.length;
                    experienceGain += managedEmployees * 2;
                }
            }
        }
        
        // Apply learning bonus for apprentices
        if (employeeType.experienceGain) {
            experienceGain *= employeeType.experienceGain;
        }
        
        // Add experience
        employee.experience += Math.round(experienceGain);
        
        // Check for level up
        const experienceNeeded = employee.level * 100;
        if (employee.experience >= experienceNeeded) {
            employee.level++;
            employee.experience -= experienceNeeded;
            
            // Apply level up benefits
            this.applyLevelUpBenefits(employee);
            
            addMessage(`🎉 ${employee.name} has reached level ${employee.level}!`);
        }
    },
    
    // Apply benefits when employee levels up
    applyLevelUpBenefits(employee) {
        const employeeType = this.employeeTypes[employee.type];
        
        // Improve skills
        for (const [skill, currentLevel] of Object.entries(employee.skills)) {
            // Chance to improve skill on level up
            if (Math.random() < 0.3) { // 30% chance
                employee.skills[skill] = Math.min(5, currentLevel + 1);
                addMessage(`📈 ${employee.name}'s ${skill} skill improved to level ${employee.skills[skill]}!`);
            }
        }
        
        // Improve base productivity
        employee.productivity = Math.min(2.0, employee.productivity * 1.05);
        
        // Improve morale
        employee.morale = Math.min(100, employee.morale + 10);
        
        // Chance to learn new skill
        if (Math.random() < 0.1) { // 10% chance
            const newSkill = this.getRandomSkillForEmployee(employee.type);
            if (newSkill && !employee.skills[newSkill]) {
                employee.skills[newSkill] = 1;
                addMessage(`🌟 ${employee.name} learned new skill: ${newSkill}!`);
            }
        }
    },
    
    // Get random skill appropriate for employee type
    getRandomSkillForEmployee(employeeType) {
        const possibleSkills = {
            merchant: ['negotiation', 'management', 'perception'],
            guard: ['combat', 'perception', 'leadership'],
            worker: ['labor', 'maintenance', 'crafting'],
            craftsman: ['quality', 'management', 'negotiation'],
            farmer: ['harvesting', 'management', 'labor'],
            miner: ['strength', 'perception', 'maintenance'],
            manager: ['leadership', 'negotiation', 'management'],
            apprentice: ['learning', 'labor', 'crafting']
        };
        
        const skills = possibleSkills[employeeType] || [];
        return skills.length > 0 ? skills[Math.floor(Math.random() * skills.length)] : null;
    },
    
    // Update employee performance
    updateEmployeePerformance(employee) {
        let performanceScore = 50; // Base performance
        
        // Morale affects performance
        performanceScore += (employee.morale - 50) * 0.5;
        
        // Skills affect performance
        const totalSkillLevel = Object.values(employee.skills).reduce((sum, level) => sum + level, 0);
        performanceScore += totalSkillLevel * 3;
        
        // Level affects performance
        performanceScore += employee.level * 2;
        
        // Assignment compatibility affects performance
        if (employee.assignedProperty) {
            const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
            if (property && PropertyEmployeeBridge.isOptimalAssignment(employee.type, property.type)) {
                performanceScore += 15;
            }
        }
        
        // Recent events affect performance
        if (employee.recentEvents) {
            employee.recentEvents.forEach(event => {
                if (event.type === 'achievement') performanceScore += 10;
                if (event.type === 'mistake') performanceScore -= 15;
                if (event.type === 'complaint') performanceScore -= 10;
            });
        }
        
        // Normalize to 0-100 range
        employee.performance = Math.max(0, Math.min(100, Math.round(performanceScore)));
        
        // Clear old events
        if (employee.recentEvents) {
            employee.recentEvents = employee.recentEvents.filter(event =>
                TimeSystem.getTotalMinutes() - event.timestamp < 7 * 24 * 60 // Keep events for 7 days
            );
        } else {
            employee.recentEvents = [];
        }
    },
    
    // Process employee events
    processEmployeeEvents(employee) {
        if (!employee.assignedProperty) return;
        
        const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
        if (!property) return;
        
        // Random events based on employee performance and morale
        const eventChance = Math.random();
        
        if (eventChance < 0.05 && employee.performance > 80) { // 5% chance for high performers
            this.createEmployeeEvent(employee, 'achievement', 'Outstanding performance!');
        } else if (eventChance < 0.08 && employee.performance < 30) { // 8% chance for low performers
            this.createEmployeeEvent(employee, 'mistake', 'Made a costly mistake');
        } else if (eventChance < 0.03 && employee.morale < 30) { // 3% chance for low morale
            this.createEmployeeEvent(employee, 'complaint', 'Filed a complaint about working conditions');
        }
    },
    
    // Create employee event
    createEmployeeEvent(employee, eventType, description) {
        if (!employee.recentEvents) {
            employee.recentEvents = [];
        }
        
        employee.recentEvents.push({
            type: eventType,
            description: description,
            timestamp: TimeSystem.getTotalMinutes()
        });
        
        // Apply immediate effects
        switch (eventType) {
            case 'achievement':
                employee.morale = Math.min(100, employee.morale + 5);
                addMessage(`🏆 ${employee.name}: ${description}`);
                break;
            case 'mistake':
                employee.morale = Math.max(0, employee.morale - 10);
                addMessage(`${employee.name}: ${description}`);
                break;
            case 'complaint':
                employee.morale = Math.max(0, employee.morale - 5);
                addMessage(`📝 ${employee.name}: ${description}`);
                break;
        }
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
                    const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
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
            PropertyEmployeeBridge.getProperty(employee.assignedProperty) : null;
        
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
            PropertyEmployeeBridge.getProperty(employee.assignedProperty) : null;
        
        // Create details display
        addMessage(`Employee: ${employee.name} (${employeeType.name}) - Level ${employee.level}, Morale ${employee.morale}%, Wage ${employee.wage} gold/week`);
    },
    
    // Adjust employee wage  FIXED: Use modal instead of browser prompt() 
    adjustWage(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;

        const applyWage = (newWage) => {
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
        };

        if (typeof ModalSystem !== 'undefined') {
            const baseWage = this.employeeTypes[employee.type].baseWage;
            const content = `
                <p>Enter new weekly wage for <strong>${employee.name}</strong></p>
                <p style="font-size: 12px; color: #888;">Current wage: ${employee.wage} gold/week | Base: ${baseWage} gold</p>
                <input type="number" id="wage-input" value="${employee.wage}" min="1" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(79,195,247,0.3); border-radius: 6px; color: #fff; font-size: 16px; margin-top: 10px;">
                <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                    ${[5, 10, 15, 20, 25, 30].map(w => `<button onclick="document.getElementById('wage-input').value=${w}" style="padding: 5px 10px; background: rgba(79,195,247,0.2); border: 1px solid rgba(79,195,247,0.3); border-radius: 4px; color: #4fc3f7; cursor: pointer;">${w}g</button>`).join('')}
                </div>
            `;
            ModalSystem.show({
                title: '💰 Adjust Wage',
                content: content,
                buttons: [
                    { text: 'Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: 'Apply', className: 'primary', onClick: () => {
                        const input = document.getElementById('wage-input');
                        if (input) applyWage(input.value);
                        ModalSystem.hide();
                    }}
                ]
            });
        } else {
            // Fallback - just skip
            addMessage('Cannot adjust wage - modal system unavailable');
        }
    },
    
    // Fire employee  FIXED: Use modal instead of browser confirm() 
    fireEmployee(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) return;

        const doFire = () => {
            // Remove from assigned property
            if (employee.assignedProperty) {
                const property = PropertyEmployeeBridge.getProperty(employee.assignedProperty);
                if (property) {
                    property.employees = property.employees.filter(id => id !== employee.id);
                }
            }

            // Remove from player's employees
            game.player.ownedEmployees = game.player.ownedEmployees.filter(emp => emp.id !== employeeId);

            addMessage(`Fired ${employee.name}!`);

            // Update UI
            this.updateEmployeeDisplay();
            PropertyEmployeeBridge.updatePropertyDisplay();
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🔥 Fire Employee',
                content: `<p>Are you sure you want to fire <strong>${employee.name}</strong>?</p><p style="color: #f44336; font-size: 12px;">They will be permanently dismissed.</p>`,
                buttons: [
                    { text: 'Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🔥 Fire', className: 'danger', onClick: () => { ModalSystem.hide(); doFire(); } }
                ]
            });
        } else {
            doFire();
        }
    }
};