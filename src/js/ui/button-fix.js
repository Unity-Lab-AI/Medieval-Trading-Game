// ═══════════════════════════════════════════════════════════════
// BUTTON FIX - event listener repair shop
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('Summoning button repair spirits...');

// Debooger-only logging helper - silent in production
const deboogerWarn = (msg) => {
    if (typeof GameConfig !== 'undefined' && GameConfig.debooger?.enabled) {
        console.warn(msg);
    }
};

// Function to safely add event listeners - prevents duplicate handlers
// Now silently skips missing optional elements instead of spamming console errors
function safeAddEventListener(elementId, eventType, handler, optional = false) {
    const element = document.getElementById(elementId);
    if (element) {
        // Check if we already added a listener to this element
        const listenerKey = `_hasListener_${eventType}`;
        if (element[listenerKey]) {
            // Already has a listener, skip to prevent duplicates
            return true;
        }
        // Mark as having a listener and add it
        element[listenerKey] = true;
        element.addEventListener(eventType, handler);
        console.log(`✓ Added ${eventType} listener to ${elementId}`);
        return true;
    } else {
        // Silently skip optional buttons, only log for required ones
        if (!optional) {
            console.warn(`⚠️ Required element not found: ${elementId}`);
        }
        // Optional buttons get no warning - they just don't exist in this UI config
        return false;
    }
}

// Function to initialize all button event listeners
function initializeButtonListeners() {
    console.log('Initializing button event listeners...');
    
    // Main Menu Buttons - REMOVED: These are now handled by game.js via EventManager
    // The duplicate handlers were causing buttons to fire 3 times!
    // Keeping only the game control buttons below that aren't in game.js
    
    // Game Control Buttons
    safeAddEventListener('visit-market-btn', 'click', function() {
        console.log('Visit Market button clicked');
        if (typeof openMarket === 'function') {
            openMarket();
        } else {
            deboogerWarn('openMarket function not found');
        }
    });
    
    safeAddEventListener('travel-btn', 'click', function() {
        console.log('Travel button clicked');
        if (typeof openTravel === 'function') {
            openTravel();
        } else {
            deboogerWarn('openTravel function not found');
        }
    });
    
    // Optional - transportation-btn was removed from UI, keeping for backwards compat
    safeAddEventListener('transportation-btn', 'click', function() {
        console.log('Transportation button clicked');
        if (typeof openTransportation === 'function') {
            openTransportation();
        } else {
            deboogerWarn('openTransportation function not found');
        }
    }, true); // true = optional, button may not exist

    // Optional button - may not exist in all UI configurations
    safeAddEventListener('transportation-quick-btn', 'click', function() {
        console.log('Quick Transportation button clicked');
        if (typeof openTransportation === 'function') {
            openTransportation();
        } else {
            deboogerWarn('openTransportation function not found');
        }
    }, true); // true = optional
    
    // Optional - UI uses bottom-inventory-btn instead
    safeAddEventListener('inventory-btn', 'click', function() {
        console.log('Inventory button clicked');
        if (typeof openInventory === 'function') {
            openInventory();
        } else {
            deboogerWarn('openInventory function not found');
        }
    }, true); // true = optional
    
    // Optional button - UI uses bottom-save-btn instead
    safeAddEventListener('save-btn', 'click', function() {
        console.log('Save button clicked');
        if (typeof saveGame === 'function') {
            saveGame();
        } else {
            deboogerWarn('saveGame function not found');
        }
    }, true); // true = optional
    
    // Optional - UI uses bottom-menu-btn instead
    safeAddEventListener('menu-btn', 'click', function() {
        console.log('Menu button clicked');
        if (typeof toggleMenu === 'function') {
            toggleMenu();
        } else {
            deboogerWarn('toggleMenu function not found');
        }
    }, true); // true = optional
    
    // Character Creation Buttons - optional, handled by form submit
    safeAddEventListener('create-character-btn', 'click', function(e) {
        console.log('Create Character button clicked');
        e.preventDefault();
        if (typeof createCharacter === 'function') {
            createCharacter(e);
        } else {
            deboogerWarn('createCharacter function not found');
        }
    }, true); // true = optional, form submit handles this

    safeAddEventListener('randomize-character-btn', 'click', function() {
        console.log('Randomize Character button clicked');
        if (typeof randomizeCharacter === 'function') {
            randomizeCharacter();
        } else {
            deboogerWarn('randomizeCharacter function not found');
        }
    });
    
    // Panel Close Buttons
    safeAddEventListener('close-market-btn', 'click', function() {
        console.log('Close Market button clicked');
        if (typeof closeMarket === 'function') {
            closeMarket();
        } else {
            deboogerWarn('closeMarket function not found');
        }
    });
    
    safeAddEventListener('close-inventory-btn', 'click', function() {
        console.log('Close Inventory button clicked');
        if (typeof closeInventory === 'function') {
            closeInventory();
        } else {
            deboogerWarn('closeInventory function not found');
        }
    });
    
    safeAddEventListener('close-travel-btn', 'click', function() {
        console.log('Close Travel button clicked');
        if (typeof closeTravel === 'function') {
            closeTravel();
        } else {
            deboogerWarn('closeTravel function not found');
        }
    });
    
    safeAddEventListener('close-transportation-btn', 'click', function() {
        console.log('Close Transportation button clicked');
        if (typeof closeTransportation === 'function') {
            closeTransportation();
        } else {
            deboogerWarn('closeTransportation function not found');
        }
    });
    
    // Time Control Buttons - pause-btn is handled by time-machine.js setupTimeControls()
    // DO NOT add duplicate handler here - it causes double-toggle bug!
    // The onclick handler in time-machine.js has full toggle logic with userPreferredSpeed support

    safeAddEventListener('normal-speed-btn', 'click', function() {
        console.log('Normal Speed button clicked');
        if (typeof TimeSystem !== 'undefined' && TimeSystem.setSpeed) {
            TimeSystem.setSpeed('NORMAL');
        } else {
            deboogerWarn('TimeSystem.setSpeed not found');
        }
    });

    safeAddEventListener('fast-speed-btn', 'click', function() {
        console.log('Fast Speed button clicked');
        if (typeof TimeSystem !== 'undefined' && TimeSystem.setSpeed) {
            TimeSystem.setSpeed('FAST');
        } else {
            deboogerWarn('TimeSystem.setSpeed not found');
        }
    });

    safeAddEventListener('very-fast-speed-btn', 'click', function() {
        console.log('Very Fast Speed button clicked');
        if (typeof TimeSystem !== 'undefined' && TimeSystem.setSpeed) {
            TimeSystem.setSpeed('VERY_FAST');
        } else {
            deboogerWarn('TimeSystem.setSpeed not found');
        }
    });
    
    // Map Control Buttons - use GameWorldRenderer for center on player
    safeAddEventListener('center-on-player-btn', 'click', function() {
        console.log('Center on Player button clicked');
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.centerOnPlayer) {
            GameWorldRenderer.centerOnPlayer();
        } else {
            deboogerWarn('GameWorldRenderer.centerOnPlayer not found');
        }
    });
    
    console.log('Button event listeners initialized');
}

// Function to fix character name input
function fixCharacterInput() {
    const nameInput = document.getElementById('character-name-input');
    if (nameInput) {
        EventManager.addEventListener(nameInput, 'input', function() {
            console.log('Character name input changed:', this.value);
            if (typeof updateCharacterPreview === 'function') {
                updateCharacterPreview();
            }
        });
        console.log('✓ Fixed character name input');
    }
}

// Function to fix form submissions
function fixFormSubmissions() {
    const characterForm = document.getElementById('character-form');
    if (characterForm) {
        EventManager.addEventListener(characterForm, 'submit', function(e) {
            console.log('Character form submitted');
            e.preventDefault();
            if (typeof createCharacter === 'function') {
                createCharacter(e);
            } else {
                deboogerWarn('createCharacter function not found');
            }
        });
        console.log('✓ Fixed character form submission');
    }
}

// Function to fix tab switching
function fixTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        EventManager.addEventListener(button, 'click', function() {
            const tabName = this.dataset.tab;
            console.log('Tab clicked:', tabName);
            if (typeof switchTab === 'function') {
                switchTab(tabName);
            } else {
                deboogerWarn('switchTab function not found');
            }
        });
    });
    console.log('✓ Fixed tab switching');
}

// Function to fix travel tabs
function fixTravelTabs() {
    const travelTabButtons = document.querySelectorAll('.travel-tab-btn');
    travelTabButtons.forEach(button => {
        EventManager.addEventListener(button, 'click', function() {
            const tabName = this.dataset.travelTab;
            console.log('Travel tab clicked:', tabName);
            // Simple tab switching for travel tabs
            document.querySelectorAll('.travel-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`${tabName}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Update button states
            document.querySelectorAll('.travel-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    console.log('✓ Fixed travel tab switching');
}

// Main fix function
function applyAllFixes() {
    console.log('=== APPLYING ALL BUTTON FIXES ===');

    // Apply all fixes
    initializeButtonListeners();
    fixCharacterInput();
    fixFormSubmissions();
    fixTabSwitching();
    fixTravelTabs();

    console.log('=== ALL BUTTON FIXES APPLIED ===');
}

// register with Bootstrap - no more auto-apply, Bootstrap handles timing
Bootstrap.register('ButtonFixes', () => applyAllFixes(), {
    dependencies: ['game'],
    priority: 91,
    severity: 'optional'
});

// Also make it available globally for manual re-application
window.fixButtons = {
    initializeButtonListeners,
    fixCharacterInput,
    fixFormSubmissions,
    fixTabSwitching,
    fixTravelTabs,
    applyAllFixes
};

console.log('Button fix script loaded');