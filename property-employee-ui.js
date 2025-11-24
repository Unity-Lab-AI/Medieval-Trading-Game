// Property and Employee UI Management
const PropertyEmployeeUI = {
    // Initialize UI components
    init() {
        this.setupPropertyEmployeePanel();
    },
    
    // Setup property and employee panel (using existing HTML structure)
    setupPropertyEmployeePanel() {
        // Setup event listeners for existing HTML elements
        this.setupPropertyEmployeeEventListeners();
    },
    
    // Setup event listeners for property and employee panel
    setupPropertyEmployeeEventListeners() {
        // Tab switching for property-employee-panel
        document.querySelectorAll('#property-employee-panel .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPropertyEmployeeTab(e.target.dataset.tab);
            });
        });
        
        // Control buttons
        const buyPropertyBtn = document.getElementById('buy-property-btn');
        const propertyUpgradesBtn = document.getElementById('property-upgrades-btn');
        const repairAllBtn = document.getElementById('repair-all-btn');
        const hireEmployeeBtn = document.getElementById('hire-employee-btn');
        const employeeTrainingBtn = document.getElementById('employee-training-btn');
        const payWagesBtn = document.getElementById('pay-wages-btn');
        const createRouteBtn = document.getElementById('create-route-btn');
        const optimizeRoutesBtn = document.getElementById('optimize-routes-btn');
        const routeHistoryBtn = document.getElementById('route-history-btn');
        const closeBtn = document.getElementById('close-property-employee-btn');
        
        if (buyPropertyBtn) buyPropertyBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('properties'));
        if (propertyUpgradesBtn) propertyUpgradesBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('properties'));
        if (repairAllBtn) repairAllBtn.addEventListener('click', () => PropertySystem.repairAllProperties());
        if (hireEmployeeBtn) hireEmployeeBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('employees'));
        if (employeeTrainingBtn) employeeTrainingBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('employees'));
        if (payWagesBtn) payWagesBtn.addEventListener('click', () => EmployeeSystem.payWeeklyWages());
        if (createRouteBtn) createRouteBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('trade-routes'));
        if (optimizeRoutesBtn) optimizeRoutesBtn.addEventListener('click', () => TradeRouteSystem.optimizeAllRoutes());
        if (routeHistoryBtn) routeHistoryBtn.addEventListener('click', () => this.switchPropertyEmployeeTab('trade-routes'));
        if (closeBtn) closeBtn.addEventListener('click', () => this.closePropertyEmployeePanel());
        
        // Property details modal
        const closePropertyDetailsBtn = document.getElementById('close-property-details');
        const repairPropertyBtn = document.getElementById('repair-property-btn');
        const upgradePropertyBtn = document.getElementById('upgrade-property-btn');
        const sellPropertyBtn = document.getElementById('sell-property-btn');
        
        if (closePropertyDetailsBtn) closePropertyDetailsBtn.addEventListener('click', () => this.closePropertyDetailsModal());
        if (repairPropertyBtn) repairPropertyBtn.addEventListener('click', () => this.repairSelectedProperty());
        if (upgradePropertyBtn) upgradePropertyBtn.addEventListener('click', () => this.upgradeSelectedProperty());
        if (sellPropertyBtn) sellPropertyBtn.addEventListener('click', () => this.sellSelectedProperty());
        
        // Employee details modal
        const closeEmployeeDetailsBtn = document.getElementById('close-employee-details');
        const trainEmployeeBtn = document.getElementById('train-employee-btn');
        const promoteEmployeeBtn = document.getElementById('promote-employee-btn');
        const fireEmployeeBtn = document.getElementById('fire-employee-btn');
        const assignEmployeeBtn = document.getElementById('assign-employee-btn');
        const unassignEmployeeBtn = document.getElementById('unassign-employee-btn');
        
        if (closeEmployeeDetailsBtn) closeEmployeeDetailsBtn.addEventListener('click', () => this.closeEmployeeDetailsModal());
        if (trainEmployeeBtn) trainEmployeeBtn.addEventListener('click', () => this.trainSelectedEmployee());
        if (promoteEmployeeBtn) promoteEmployeeBtn.addEventListener('click', () => this.promoteSelectedEmployee());
        if (fireEmployeeBtn) fireEmployeeBtn.addEventListener('click', () => this.fireSelectedEmployee());
        if (assignEmployeeBtn) assignEmployeeBtn.addEventListener('click', () => this.assignSelectedEmployee());
        if (unassignEmployeeBtn) unassignEmployeeBtn.addEventListener('click', () => this.unassignSelectedEmployee());
    },
    
    // Switch property-employee tab
    switchPropertyEmployeeTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('#property-employee-panel .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('#property-employee-content .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Update content based on tab
        switch (tabName) {
            case 'properties':
                this.updateOwnedProperties();
                this.updateFinancialSummary();
                break;
            case 'employees':
                this.updateHiredEmployees();
                this.updateFinancialSummary();
                break;
            case 'trade-routes':
                this.updateTradeRoutes();
                this.updateFinancialSummary();
                break;
            case 'financial':
                this.updateFinancialOverview();
                break;
        }
    },
    
    // Update financial summary
    updateFinancialSummary() {
        const properties = PropertySystem.getPlayerProperties();
        const employees = EmployeeSystem.getPlayerEmployees();
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalWages = 0;
        
        properties.forEach(property => {
            totalIncome += PropertySystem.calculatePropertyIncome(property);
            const propertyType = PropertySystem.propertyTypes[property.type];
            totalExpenses += propertyType.maintenanceCost;
        });
        
        employees.forEach(employee => {
            totalWages += employee.wage; // Daily wages
        });
        
        const propertyIncomeElement = document.getElementById('property-income');
        const employeeCostsElement = document.getElementById('employee-costs');
        const netProfitElement = document.getElementById('net-profit');
        
        if (propertyIncomeElement) propertyIncomeElement.textContent = `${totalIncome} gold/day`;
        if (employeeCostsElement) employeeCostsElement.textContent = `${totalWages * 7} gold/week`;
        if (netProfitElement) netProfitElement.textContent = `${totalIncome - totalExpenses - (totalWages * 7 / 7)} gold/day`;
    },
    
    // Update owned properties display
    updateOwnedProperties() {
        const container = document.getElementById('owned-properties');
        if (!container) return;
        
        container.innerHTML = '';
        
        const properties = PropertySystem.getPlayerProperties();
        
        if (properties.length === 0) {
            container.innerHTML = '<p class="empty-message">You own no properties.</p>';
            return;
        }
        
        properties.forEach(property => {
            const propertyElement = this.createOwnedPropertyElement(property);
            container.appendChild(propertyElement);
        });
    },
    
    // Create owned property element
    createOwnedPropertyElement(property) {
        const propertyType = PropertySystem.propertyTypes[property.type];
        const element = document.createElement('div');
        element.className = 'property-item owned';
        element.dataset.propertyId = property.id;
        
        element.innerHTML = `
            <div class="property-header">
                <span class="property-icon">${propertyType.icon}</span>
                <span class="property-name">${propertyType.name}</span>
                <span class="property-level">Level ${property.level}</span>
            </div>
            <div class="property-stats">
                <div class="property-stat">
                    <span class="stat-label">Location:</span>
                    <span class="stat-value">${GameWorld.locations[property.location].name}</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Condition:</span>
                    <span class="stat-value">${property.condition}%</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Income:</span>
                    <span class="stat-value">${PropertySystem.calculatePropertyIncome(property)} gold/day</span>
                </div>
                <div class="property-stat">
                    <span class="stat-label">Employees:</span>
                    <span class="stat-value">${property.employees.length}/${propertyType.workerSlots || 0}</span>
                </div>
            </div>
            <div class="property-actions">
                <button class="property-action-btn" onclick="PropertyEmployeeUI.showPropertyDetails('${property.id}')">Manage</button>
            </div>
        `;
        
        return element;
    },
    
    // Update hired employees display
    updateHiredEmployees() {
        const container = document.getElementById('hired-employees');
        if (!container) return;
        
        container.innerHTML = '';
        
        const employees = EmployeeSystem.getPlayerEmployees();
        
        if (employees.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no hired employees.</p>';
            return;
        }
        
        employees.forEach(employee => {
            const employeeElement = this.createHiredEmployeeElement(employee);
            container.appendChild(employeeElement);
        });
    },
    
    // Create hired employee element
    createHiredEmployeeElement(employee) {
        const employeeType = EmployeeSystem.employeeTypes[employee.type];
        const element = document.createElement('div');
        element.className = 'employee-item hired';
        element.dataset.employeeId = employee.id;
        
        element.innerHTML = `
            <div class="employee-header">
                <span class="employee-icon">${employeeType.icon}</span>
                <span class="employee-name">${employee.name}</span>
                <span class="employee-level">Level ${employee.level}</span>
            </div>
            <div class="employee-stats">
                <div class="employee-stat">
                    <span class="stat-label">Type:</span>
                    <span class="stat-value">${employeeType.name}</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Morale:</span>
                    <span class="stat-value">${employee.morale}%</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Productivity:</span>
                    <span class="stat-value">${employee.productivity}x</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Wage:</span>
                    <span class="stat-value">${employee.wage} gold/week</span>
                </div>
                <div class="employee-stat">
                    <span class="stat-label">Assignment:</span>
                    <span class="stat-value">${employee.assignedProperty ? PropertySystem.propertyTypes[PropertySystem.getProperty(employee.assignedProperty).type].name : 'Unassigned'}</span>
                </div>
            </div>
            <div class="employee-actions">
                <button class="employee-action-btn" onclick="PropertyEmployeeUI.showEmployeeDetails('${employee.id}')">Manage</button>
            </div>
        `;
        
        return element;
    },
    
    // Update trade routes display
    updateTradeRoutes() {
        const container = document.getElementById('active-routes');
        if (!container) return;
        
        container.innerHTML = '';
        
        const routes = TradeRouteSystem.getActiveRoutes();
        
        if (routes.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no active trade routes.</p>';
            return;
        }
        
        routes.forEach(route => {
            const routeElement = this.createRouteElement(route);
            container.appendChild(routeElement);
        });
    },
    
    // Create route element
    createRouteElement(route) {
        const element = document.createElement('div');
        element.className = 'route-item';
        element.dataset.routeId = route.id;
        
        const warehouse = PropertySystem.getProperty(route.warehouseId);
        const destination = GameWorld.locations[route.destinationId];
        
        element.innerHTML = `
            <div class="route-header">
                <span class="route-name">${route.name}</span>
                <span class="route-status ${route.isActive ? 'active' : 'inactive'}">${route.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div class="route-details">
                <div class="route-detail">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">${warehouse ? PropertySystem.propertyTypes[warehouse.type].name : 'Unknown'}</span>
                </div>
                <div class="route-detail">
                    <span class="detail-label">To:</span>
                    <span class="detail-value">${destination ? destination.name : 'Unknown'}</span>
                </div>
                <div class="route-detail">
                    <span class="detail-label">Profit:</span>
                    <span class="detail-value profit-${route.totalProfit >= 0 ? 'positive' : 'negative'}">${route.totalProfit >= 0 ? '+' : ''}${route.totalProfit} gold</span>
                </div>
            </div>
            <div class="route-actions">
                <button class="route-action-btn" onclick="TradeRouteSystem.toggleRoute('${route.id}')">${route.isActive ? 'Pause' : 'Resume'}</button>
                <button class="route-action-btn" onclick="TradeRouteSystem.deleteRoute('${route.id}')">Delete</button>
            </div>
        `;
        
        return element;
    },
    
    // Update financial overview
    updateFinancialOverview() {
        const properties = PropertySystem.getPlayerProperties();
        const employees = EmployeeSystem.getPlayerEmployees();
        const routes = TradeRouteSystem.getActiveRoutes();
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalWages = 0;
        let totalPropertyValue = 0;
        let routeProfit = 0;
        
        properties.forEach(property => {
            totalIncome += PropertySystem.calculatePropertyIncome(property);
            const propertyType = PropertySystem.propertyTypes[property.type];
            totalExpenses += propertyType.maintenanceCost;
            totalPropertyValue += PropertySystem.calculatePropertyValue(property);
        });
        
        employees.forEach(employee => {
            totalWages += employee.wage; // Daily wages
        });
        
        routes.forEach(route => {
            routeProfit += route.totalProfit;
        });
        
        const dailyIncomeElement = document.getElementById('daily-income');
        const weeklyExpensesElement = document.getElementById('weekly-expenses');
        const propertyValueElement = document.getElementById('property-value');
        const totalAssetsElement = document.getElementById('total-assets');
        
        if (dailyIncomeElement) dailyIncomeElement.textContent = totalIncome + routeProfit / 7;
        if (weeklyExpensesElement) weeklyExpensesElement.textContent = (totalExpenses + totalWages * 7);
        if (propertyValueElement) propertyValueElement.textContent = totalPropertyValue;
        if (totalAssetsElement) totalAssetsElement.textContent = totalPropertyValue + game.player.gold;
    },
    
    // Show property details modal
    showPropertyDetails(propertyId) {
        const property = PropertySystem.getProperty(propertyId);
        if (!property) return;
        
        const propertyType = PropertySystem.propertyTypes[property.type];
        
        // Update modal content
        document.getElementById('property-details-name').textContent = propertyType.name;
        document.getElementById('property-details-icon').textContent = propertyType.icon;
        document.getElementById('property-details-type').textContent = propertyType.name;
        document.getElementById('property-details-location').textContent = GameWorld.locations[property.location].name;
        document.getElementById('property-details-level').textContent = property.level;
        document.getElementById('property-details-condition').textContent = `${property.condition}%`;
        document.getElementById('property-details-income').textContent = `${PropertySystem.calculatePropertyIncome(property)} gold/day`;
        
        // Update upgrades list with enhanced interface
        const upgradesList = document.getElementById('property-upgrades-list');
        upgradesList.innerHTML = '';
        
        const availableUpgrades = PropertySystem.getAvailableUpgrades(propertyId);
        
        if (availableUpgrades.length > 0) {
            availableUpgrades.forEach(upgrade => {
                const upgradeElement = document.createElement('div');
                upgradeElement.className = `upgrade-item ${upgrade.affordability && upgrade.requirementsMet ? 'available' : 'unavailable'}`;
                upgradeElement.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-icon">${upgrade.icon}</span>
                        <span class="upgrade-name">${upgrade.name}</span>
                        <span class="upgrade-cost">${upgrade.cost} gold</span>
                    </div>
                    <div class="upgrade-description">
                        <p>${upgrade.description}</p>
                    </div>
                    <div class="upgrade-benefits">
                        <h5>Benefits:</h5>
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
                        </div>
                    </div>
                    <div class="upgrade-requirements">
                        <h5>Requirements:</h5>
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
                        <button class="upgrade-action-btn ${upgrade.affordability && upgrade.requirementsMet ? 'enabled' : 'disabled'}"
                                onclick="PropertySystem.upgradeProperty('${propertyId}', '${upgrade.id}')"
                                ${!upgrade.affordability || !upgrade.requirementsMet ? 'disabled' : ''}>
                            ${upgrade.affordability && upgrade.requirementsMet ? 'Purchase Upgrade' : 'Cannot Purchase'}
                        </button>
                    </div>
                `;
                
                upgradesList.appendChild(upgradeElement);
            });
        } else {
            upgradesList.innerHTML = '<p class="no-upgrades">No upgrades available for this property.</p>';
        }
        
        // Update assigned employees list with enhanced interface
        const employeesList = document.getElementById('property-employees-list');
        employeesList.innerHTML = '';
        
        if (property.employees.length > 0) {
            property.employees.forEach(empId => {
                const employee = EmployeeSystem.getEmployee(empId);
                if (employee) {
                    const employeeElement = document.createElement('div');
                    employeeElement.className = 'assigned-employee';
                    employeeElement.innerHTML = `
                        <div class="employee-header">
                            <span class="employee-icon">${EmployeeSystem.employeeTypes[employee.type].icon}</span>
                            <span class="employee-name">${employee.name}</span>
                            <span class="employee-level">Level ${employee.level}</span>
                        </div>
                        <div class="employee-stats">
                            <div class="employee-stat">
                                <span class="stat-label">Type:</span>
                                <span class="stat-value">${EmployeeSystem.employeeTypes[employee.type].name}</span>
                            </div>
                            <div class="employee-stat">
                                <span class="stat-label">Morale:</span>
                                <span class="stat-value morale-${employee.morale > 70 ? 'good' : employee.morale > 40 ? 'fair' : 'poor'}">${employee.morale}%</span>
                            </div>
                            <div class="employee-stat">
                                <span class="stat-label">Productivity:</span>
                                <span class="stat-value">${(employee.productivity * 100).toFixed(0)}%</span>
                            </div>
                            <div class="employee-stat">
                                <span class="stat-label">Performance:</span>
                                <span class="stat-value performance-${employee.performance > 70 ? 'good' : employee.performance > 40 ? 'fair' : 'poor'}">${employee.performance || 50}/100</span>
                            </div>
                        </div>
                        <div class="employee-actions">
                            <button class="employee-action-btn" onclick="EmployeeSystem.showAssignmentInterface('${empId}')">Reassign</button>
                            <button class="employee-action-btn" onclick="EmployeeSystem.showEmployeeDetails('${empId}')">Manage</button>
                        </div>
                    `;
                    employeesList.appendChild(employeeElement);
                }
            });
        } else {
            employeesList.innerHTML = '<p class="no-employees">No employees assigned</p>';
        }
        
        // Update property benefits display
        const benefits = PropertySystem.getPropertyBenefits(propertyId);
        const benefitsList = document.getElementById('property-benefits-list');
        if (benefitsList) {
            benefitsList.innerHTML = `
                <h5>Property Benefits:</h5>
                <div class="benefits-grid">
                    ${benefits.storageCapacity ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">📦</span>
                        <span class="benefit-text">${benefits.storageCapacity} lbs storage capacity</span>
                    </div>
                    ` : ''}
                    ${benefits.workerSlots ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">👷</span>
                        <span class="benefit-text">${benefits.workerSlots} worker slots</span>
                    </div>
                    ` : ''}
                    ${benefits.merchantSlots ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">🧑‍💼</span>
                        <span class="benefit-text">${benefits.merchantSlots} merchant slots</span>
                    </div>
                    ` : ''}
                    ${benefits.restBonus ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">😴</span>
                        <span class="benefit-text">Rest bonus available</span>
                    </div>
                    ` : ''}
                    ${benefits.reputationBonus ? `
                    <div class="benefit-item">
                        <span class="benefit-icon">⭐</span>
                        <span class="benefit-text">+${benefits.reputationBonus} reputation/day</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Update work queue display
        const workQueue = PropertySystem.getWorkQueue(propertyId);
        const workQueueList = document.getElementById('property-work-queue-list');
        if (workQueueList) {
            workQueueList.innerHTML = `
                <h5>Production Queue:</h5>
                ${workQueue.length > 0 ? `
                    <div class="work-queue-items">
                        ${workQueue.map(work => `
                            <div class="work-queue-item">
                                <span class="work-type">${PropertySystem.getItemIcon(work.type)} ${PropertySystem.getItemName(work.type)}</span>
                                <span class="work-quantity">×${work.quantity}</span>
                                <div class="work-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${(work.progress / work.quantity) * 100}%"></div>
                                    </div>
                                    <span class="progress-text">${Math.round((work.progress / work.quantity) * 100)}%</span>
                                </div>
                                <button class="work-cancel-btn" onclick="PropertySystem.cancelWorkItem('${propertyId}', '${work.id}')" title="Cancel">✕</button>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-work">No production in progress.</p>'}
            `;
        }
        
        // Store selected property for modal actions
        this.selectedPropertyId = propertyId;
        
        // Show modal
        document.getElementById('property-details-modal').classList.remove('hidden');
    },
    
    // Close property details modal
    closePropertyDetailsModal() {
        document.getElementById('property-details-modal').classList.add('hidden');
    },
    
    // Repair selected property
    repairSelectedProperty() {
        if (!this.selectedPropertyId) return;
        
        PropertySystem.repairProperty(this.selectedPropertyId);
        this.showPropertyDetails(this.selectedPropertyId); // Refresh display
    },
    
    // Upgrade selected property
    upgradeSelectedProperty() {
        if (!this.selectedPropertyId) return;
        
        // For simplicity, just buy first available upgrade
        const property = PropertySystem.getProperty(this.selectedPropertyId);
        if (!property) return;
        
        const availableUpgrades = Object.keys(PropertySystem.upgrades).filter(upgradeId => 
            !property.upgrades.includes(upgradeId)
        );
        
        if (availableUpgrades.length > 0) {
            PropertySystem.upgradeProperty(this.selectedPropertyId, availableUpgrades[0]);
            this.showPropertyDetails(this.selectedPropertyId); // Refresh display
        }
    },
    
    // Sell selected property
    sellSelectedProperty() {
        if (!this.selectedPropertyId) return;
        
        if (confirm('Are you sure you want to sell this property?')) {
            PropertySystem.sellProperty(this.selectedPropertyId);
            document.getElementById('property-details-modal').classList.add('hidden');
            this.updateOwnedProperties(); // Refresh display
        }
    },
    
    // Show employee details modal
    showEmployeeDetails(employeeId) {
        const employee = EmployeeSystem.getEmployee(employeeId);
        if (!employee) return;
        
        const employeeType = EmployeeSystem.employeeTypes[employee.type];
        
        // Update modal content
        document.getElementById('employee-details-name').textContent = employee.name;
        document.getElementById('employee-details-avatar').textContent = employeeType.icon;
        document.getElementById('employee-details-type').textContent = employeeType.name;
        document.getElementById('employee-details-level').textContent = employee.level;
        document.getElementById('employee-details-experience').textContent = `${employee.experience}/${employee.level * 100}`;
        document.getElementById('employee-details-morale').textContent = this.getMoraleText(employee.morale);
        document.getElementById('employee-details-wage').textContent = `${employee.wage} gold/week`;
        
        // Update skills list with enhanced interface
        const skillsList = document.getElementById('employee-skills-list');
        skillsList.innerHTML = '';
        
        Object.entries(employee.skills).forEach(([skill, level]) => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            skillElement.innerHTML = `
                <div class="skill-header">
                    <span class="skill-name">${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                    <span class="skill-level">Level ${level}/5</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: ${(level / 5) * 100}%"></div>
                </div>
                <div class="skill-description">
                    ${EmployeeSystem.getSkillDescription(skill, level)}
                </div>
            `;
            skillsList.appendChild(skillElement);
        });
        
        // Update assignment info with enhanced interface
        const assignmentInfo = document.getElementById('employee-assignment-info');
        if (employee.assignedProperty) {
            const property = PropertySystem.getProperty(employee.assignedProperty);
            if (property) {
                const propertyType = PropertySystem.propertyTypes[property.type];
                const isOptimal = EmployeeSystem.isOptimalAssignment(employee.type, property.type);
                assignmentInfo.innerHTML = `
                    <div class="assignment-details">
                        <div class="assignment-item">
                            <span class="assignment-label">Property:</span>
                            <span class="assignment-value">${propertyType.icon} ${propertyType.name}</span>
                            <span class="assignment-status ${isOptimal ? 'optimal' : 'standard'}">${isOptimal ? '⭐ Optimal' : 'Standard'}</span>
                        </div>
                        <div class="assignment-item">
                            <span class="assignment-label">Location:</span>
                            <span class="assignment-value">${GameWorld.locations[property.location].name}</span>
                        </div>
                        <div class="assignment-item">
                            <span class="assignment-label">Role:</span>
                            <span class="assignment-value">${employee.role || EmployeeSystem.determineEmployeeRole(employee.type, property.type)}</span>
                        </div>
                        <div class="assignment-item">
                            <span class="assignment-label">Current Task:</span>
                            <span class="assignment-value">${employee.currentTask ? `${PropertySystem.getItemIcon(employee.currentTask)} ${PropertySystem.getItemName(employee.currentTask)}` : 'None'}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            assignmentInfo.innerHTML = '<div class="assignment-details"><p class="unassigned">Unassigned</p></div>';
        }
        
        // Update assignment property select with compatibility info
        const assignmentSelect = document.getElementById('assignment-property-select');
        assignmentSelect.innerHTML = '<option value="">Select Property</option>';
        
        const properties = PropertySystem.getPlayerProperties();
        properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            const propertyType = PropertySystem.propertyTypes[property.type];
            const isCompatible = EmployeeSystem.isEmployeeCompatibleWithProperty(employee.type, property.type);
            const canAccept = PropertySystem.canAcceptEmployee(property.id, employee.type);
            const isOptimal = EmployeeSystem.isOptimalAssignment(employee.type, property.type);
            
            option.textContent = `${propertyType.icon} ${propertyType.name} (${isCompatible ? (canAccept ? (isOptimal ? '⭐ Optimal' : '✓ Compatible') : '🔒 Full') : '✗ Incompatible'})`;
            option.disabled = !isCompatible || !canAccept;
            
            assignmentSelect.appendChild(option);
        });
        
        if (employee.assignedProperty) {
            assignmentSelect.value = employee.assignedProperty;
        }
        
        // Update task assignment interface
        const taskAssignmentList = document.getElementById('employee-task-assignments');
        if (taskAssignmentList && employee.assignedProperty) {
            const property = PropertySystem.getProperty(employee.assignedProperty);
            if (property && PropertySystem.propertyTypes[property.type].production) {
                const productionCapacity = PropertySystem.getProductionCapacity(property.id);
                const workQueue = PropertySystem.getWorkQueue(property.id);
                
                taskAssignmentList.innerHTML = `
                    <h5>Task Assignment:</h5>
                    <div class="task-options">
                        ${Object.entries(productionCapacity).map(([item, amount]) => `
                            <div class="task-option">
                                <span class="task-item">${PropertySystem.getItemIcon(item)} ${PropertySystem.getItemName(item)}</span>
                                <span class="task-capacity">Max: ${amount}/day</span>
                                <button class="task-assign-btn" onclick="EmployeeSystem.assignTaskToEmployee('${employeeId}', '${item}')">Assign</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="current-task">
                        <span class="task-label">Current Task:</span>
                        <span class="task-value">${employee.currentTask ? `${PropertySystem.getItemIcon(employee.currentTask)} ${PropertySystem.getItemName(employee.currentTask)} (${employee.taskProgress || 0}%)` : 'None'}</span>
                    </div>
                    <div class="work-queue-summary">
                        <h6>Property Work Queue:</h6>
                        ${workQueue.length > 0 ? `
                            <div class="queue-items">
                                ${workQueue.map(work => `
                                    <div class="queue-item">
                                        <span class="queue-task">${PropertySystem.getItemIcon(work.type)} ${PropertySystem.getItemName(work.type)}</span>
                                        <span class="queue-progress">${Math.round((work.progress / work.quantity) * 100)}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-queue">No tasks in queue</p>'}
                    </div>
                `;
            } else {
                taskAssignmentList.innerHTML = '<p class="no-tasks">This property type doesn\'t support task assignment.</p>';
            }
        }
        
        // Update performance and recent events
        const performanceSection = document.getElementById('employee-performance-section');
        if (performanceSection) {
            performanceSection.innerHTML = `
                <h5>Performance & Events:</h5>
                <div class="performance-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Performance Score:</span>
                        <span class="metric-value performance-${employee.performance > 70 ? 'good' : employee.performance > 40 ? 'fair' : 'poor'}">${employee.performance || 50}/100</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Productivity:</span>
                        <span class="metric-value">${(employee.productivity * 100).toFixed(0)}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Total Wages Paid:</span>
                        <span class="metric-value">${employee.totalWagesPaid || 0} gold</span>
                    </div>
                </div>
                <div class="recent-events">
                    <h6>Recent Events:</h6>
                    ${employee.recentEvents && employee.recentEvents.length > 0 ? `
                        <div class="events-list">
                            ${employee.recentEvents.slice(-5).map(event => `
                                <div class="event-item ${event.type}">
                                    <span class="event-icon">${event.type === 'achievement' ? '🏆' : event.type === 'mistake' ? '❌' : '📝'}</span>
                                    <span class="event-description">${event.description}</span>
                                    <span class="event-time">${this.formatEventTime(event.timestamp)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-events">No recent events</p>'}
                </div>
            `;
        }
        
        // Store selected employee for modal actions
        this.selectedEmployeeId = employeeId;
        
        // Show modal
        document.getElementById('employee-details-modal').classList.remove('hidden');
    },
    
    // Format event time for display
    formatEventTime(timestamp) {
        const now = TimeSystem.getTotalMinutes();
        const minutesAgo = now - timestamp;
        
        if (minutesAgo < 60) {
            return `${minutesAgo} minutes ago`;
        } else if (minutesAgo < 24 * 60) {
            return `${Math.floor(minutesAgo / 60)} hours ago`;
        } else {
            return `${Math.floor(minutesAgo / (24 * 60))} days ago`;
        }
    },
    
    // Get morale text
    getMoraleText(morale) {
        if (morale >= 80) return 'Excellent';
        if (morale >= 60) return 'Good';
        if (morale >= 40) return 'Normal';
        if (morale >= 20) return 'Poor';
        return 'Terrible';
    },
    
    // Close employee details modal
    closeEmployeeDetailsModal() {
        document.getElementById('employee-details-modal').classList.add('hidden');
    },
    
    // Train selected employee
    trainSelectedEmployee() {
        if (!this.selectedEmployeeId) return;
        
        EmployeeSystem.trainEmployee(this.selectedEmployeeId);
        this.showEmployeeDetails(this.selectedEmployeeId); // Refresh display
    },
    
    // Promote selected employee
    promoteSelectedEmployee() {
        if (!this.selectedEmployeeId) return;
        
        EmployeeSystem.promoteEmployee(this.selectedEmployeeId);
        this.showEmployeeDetails(this.selectedEmployeeId); // Refresh display
    },
    
    // Fire selected employee
    fireSelectedEmployee() {
        if (!this.selectedEmployeeId) return;
        
        if (confirm('Are you sure you want to fire this employee?')) {
            EmployeeSystem.fireEmployee(this.selectedEmployeeId);
            document.getElementById('employee-details-modal').classList.add('hidden');
            this.updateHiredEmployees(); // Refresh display
        }
    },
    
    // Assign selected employee
    assignSelectedEmployee() {
        if (!this.selectedEmployeeId) return;
        
        const assignmentSelect = document.getElementById('assignment-property-select');
        if (!assignmentSelect || !assignmentSelect.value) {
            addMessage('Please select a property to assign this employee to!');
            return;
        }
        
        EmployeeSystem.assignEmployeeToProperty(this.selectedEmployeeId, assignmentSelect.value);
        this.showEmployeeDetails(this.selectedEmployeeId); // Refresh display
    },
    
    // Unassign selected employee
    unassignSelectedEmployee() {
        if (!this.selectedEmployeeId) return;
        
        EmployeeSystem.unassignEmployee(this.selectedEmployeeId);
        this.showEmployeeDetails(this.selectedEmployeeId); // Refresh display
    },
    
    // Open property-employee panel
    openPropertyEmployeePanel() {
        document.getElementById('property-employee-panel').classList.remove('hidden');
        this.switchPropertyEmployeeTab('properties');
    },
    
    // Close property-employee panel
    closePropertyEmployeePanel() {
        document.getElementById('property-employee-panel').classList.add('hidden');
    }
};