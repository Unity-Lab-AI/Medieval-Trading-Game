// 
// PROPERTY-EMPLOYEE BRIDGE - fixing broken relationships
// 
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const PropertyEmployeeBridge = {
    // Initialize bridge after all systems are loaded
    init() {
        // Wait for both systems to be available
        TimerManager.setTimeout(() => {
            this.establishConnections();
        }, 100);
    },
    
    // Establish connections between systems
    establishConnections() {
        if (typeof PropertySystem !== 'undefined' && typeof EmployeeSystem !== 'undefined') {
            // Set up cross-references
            PropertySystem._employeeSystem = EmployeeSystem;
            EmployeeSystem._propertySystem = PropertySystem;
            
            console.log('🌉 Property-Employee bridge established - connecting landlords to wage slaves 💰');
        }
    },
    
    // Safe method to get employee from PropertySystem
    getEmployee(employeeId) {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.getEmployee) {
            return EmployeeSystem.getEmployee(employeeId);
        }
        return null;
    },
    
    // Safe method to get property from EmployeeSystem
    getProperty(propertyId) {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.getProperty) {
            return PropertySystem.getProperty(propertyId);
        }
        return null;
    },
    
    // Safe method to check if property can accept employee
    canAcceptEmployee(propertyId, employeeRole) {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.canAcceptEmployee) {
            return PropertySystem.canAcceptEmployee(propertyId, employeeRole);
        }
        return false;
    },
    
    // Safe method to get property type
    getPropertyType(propertyTypeId) {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.propertyTypes) {
            return PropertySystem.propertyTypes[propertyTypeId];
        }
        return null;
    },
    
    // Safe method to get employee type
    getEmployeeType(employeeTypeId) {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.employeeTypes) {
            return EmployeeSystem.employeeTypes[employeeTypeId];
        }
        return null;
    },
    
    // Safe method to update property display
    updatePropertyDisplay() {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.updatePropertyDisplay) {
            PropertySystem.updatePropertyDisplay();
        }
    },
    
    // Safe method to update employee display
    updateEmployeeDisplay() {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.updateEmployeeDisplay) {
            EmployeeSystem.updateEmployeeDisplay();
        }
    },
    
    // Safe method to get player properties
    getPlayerProperties() {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.getPlayerProperties) {
            return PropertySystem.getPlayerProperties();
        }
        return [];
    },
    
    // Safe method to get player employees
    getPlayerEmployees() {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.getPlayerEmployees) {
            return EmployeeSystem.getPlayerEmployees();
        }
        return [];
    },
    
    // Safe method to get employee capacity for property
    getEmployeeCapacity(propertyId) {
        if (typeof PropertySystem !== 'undefined' && PropertySystem.getEmployeeCapacity) {
            return PropertySystem.getEmployeeCapacity(propertyId);
        }
        return { total: 0, workers: 0, merchants: 0, guards: 0 };
    },
    
    // Safe method to check employee compatibility with property
    isEmployeeCompatibleWithProperty(employeeType, propertyType) {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.isEmployeeCompatibleWithProperty) {
            return EmployeeSystem.isEmployeeCompatibleWithProperty(employeeType, propertyType);
        }
        return false;
    },
    
    // Safe method to check if assignment is optimal
    isOptimalAssignment(employeeType, propertyType) {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.isOptimalAssignment) {
            return EmployeeSystem.isOptimalAssignment(employeeType, propertyType);
        }
        return false;
    },
    
    // Safe method to determine employee role
    determineEmployeeRole(employeeType, propertyType) {
        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.determineEmployeeRole) {
            return EmployeeSystem.determineEmployeeRole(employeeType, propertyType);
        }
        return 'worker';
    }
};