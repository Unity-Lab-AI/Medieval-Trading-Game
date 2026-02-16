// ═══════════════════════════════════════════════════════════════
// UI ENHANCEMENTS - polish for your trading empire
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

// keyboard shortcuts - for the power users among us
const KeyboardShortcuts = {
    // Define all keyboard shortcuts
    shortcuts: {
        // Global shortcuts
        'Escape': () => {
            if (game.state === GameState.PLAYING) {
                toggleMenu();
            } else if (game.state !== GameState.MENU) {
                changeState(GameState.PLAYING);
            }
        },
        'F1': () => showHelpOverlay(),
        'F5': () => quickSave(),
        'F9': () => quickLoad(),
        
        // Game control shortcuts
        'Space': () => togglePause(),
        '1': () => TimeSystem.setSpeed('NORMAL'),
        '2': () => TimeSystem.setSpeed('FAST'),
        '3': () => TimeSystem.setSpeed('VERY_FAST'),
        '0': () => TimeSystem.setSpeed('PAUSED'),
        
        // Panel shortcuts
        'i': () => openInventory(),
        'I': () => openInventory(),
        'm': () => openMarket(),
        'M': () => openMarket(),
        't': () => openTravel(),
        'T': () => openTravel(),
        'p': () => openPropertyEmployeePanel(),
        'P': () => openPropertyEmployeePanel(),
        's': () => saveGame(),
        'S': () => saveGame(),
        'l': () => loadGame(),
        'L': () => loadGame(),
        
        // Navigation shortcuts
        'ArrowUp': () => navigateList('up'),
        'ArrowDown': () => navigateList('down'),
        'ArrowLeft': () => navigateList('left'),
        'ArrowRight': () => navigateList('right'),
        'Enter': () => selectCurrentItem(),
        'Tab': () => switchTab(),
        
        // Quick action shortcuts
        'r': () => restAtInn(),
        'R': () => restAtInn(),
        'h': () => buyHouse(),
        'H': () => buyHouse(),
        'g': () => quickSell(),
        'G': () => quickSell(),
        'b': () => quickBuy(),
        'B': () => quickBuy(),
        
        // Settings shortcuts (using Alt+ to avoid conflicts with KeyBindings)
        '+': () => increaseFontSize(),
        '-': () => decreaseFontSize(),
        // Note: 'c' and 'f' are reserved for Character Sheet and Financial Sheet in KeyBindings
        // Use Alt+C and Alt+V for accessibility features instead
        'v': () => toggleColorblindMode(),
        'V': () => toggleColorblindMode(),
        
        // Debooger shortcuts 🦇 (development only)
        'F12': () => toggleDeboogerMode(),
        'F11': () => exportGameData()
    },
    
    // Context-sensitive shortcuts
    contextualShortcuts: {
        'market': {
            '1': () => switchMarketTab('buy'),
            '2': () => switchMarketTab('sell'),
            '3': () => switchMarketTab('compare'),
            '4': () => switchMarketTab('history'),
            '5': () => switchMarketTab('routes'),
            '6': () => switchMarketTab('alerts'),
            '7': () => switchMarketTab('news'),
            'f': () => refreshMarket(),
            'F': () => refreshMarket(),
            'a': () => selectAllItems(),
            'A': () => selectAllItems(),
            'd': () => clearSelection(),
            'D': () => clearSelection(),
            'Enter': () => confirmTrade()
        },
        'inventory': {
            's': () => sortInventory('name'),
            'S': () => sortInventory('name'),
            'w': () => sortInventory('weight'),
            'W': () => sortInventory('weight'),
            'v': () => sortInventory('value'),
            'V': () => sortInventory('value'),
            'q': () => sortInventory('quantity'),
            'Q': () => sortInventory('quantity'),
            'e': () => equipItem(),
            'E': () => equipItem(),
            'u': () => useItem(),
            'U': () => useItem(),
            'd': () => dropItem(),
            'D': () => dropItem(),
            'Enter': () => useItem()
        },
        'travel': {
            '1': () => setTravelFilter('all'),
            '2': () => setTravelFilter('city'),
            '3': () => setTravelFilter('town'),
            '4': () => setTravelFilter('village'),
            'f': () => setTravelSort('distance'),
            'F': () => setTravelSort('distance'),
            'n': () => setTravelSort('name'),
            'N': () => setTravelSort('name'),
            't': () => setTravelSort('type'),
            'T': () => setTravelSort('type'),
            's': () => setTravelSort('safety'),
            'S': () => setTravelSort('safety')
        },
        'properties': {
            'b': () => buyProperty(),
            'B': () => buyProperty(),
            'u': () => upgradeProperty(),
            'U': () => upgradeProperty(),
            'r': () => repairProperty(),
            'R': () => repairProperty(),
            'e': () => manageEmployees(),
            'E': () => manageEmployees(),
            'Enter': () => showPropertyDetails()
        }
    },
    
    // bind every key to its purpose - the interface becomes responsive
    init() {
        this.setupEventListeners();
        this.createHelpOverlay();
        this.createNotificationSystem();
        this.createLoadingIndicators();
        this.createAccessibilityOptions();
        this.createVisualEffects();
        this.createConfirmationDialogs();
    },
    
    // tether the listeners to reality - watching for every click and keystroke
    setupEventListeners() {
        EventManager.addEventListener(document, 'keydown', (e) => this.handleKeyPress(e));
        EventManager.addEventListener(document, 'keyup', (e) => this.handleKeyRelease(e));
        
        // Add context menu prevention
        EventManager.addEventListener(document, 'contextmenu', (e) => {
            if (e.target.closest('.game-canvas, .panel, .modal')) {
                e.preventDefault();
            }
        });
    },
    
    // Handle key press
    handleKeyPress(event) {
        const key = event.key;
        const code = event.code;
        const isShift = event.shiftKey;
        const isCtrl = event.ctrlKey;
        const isAlt = event.altKey;

        // Ignore key presses when typing in input fields
        if (event.target && (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.contentEditable === 'true'
        )) {
            return;
        }

        // Keys that are handled by KeyBindings system - let them pass through
        // These include: i, c, f, m, t, w, p, h, Space, Escape, F5, F9, =, -, a, s, d, w
        const keyBindingsKeys = ['i', 'c', 'f', 'm', 't', 'w', 'p', 'h', ' ', 'Escape', 'F5', 'F9', '=', '-', ','];
        if (keyBindingsKeys.includes(key.toLowerCase()) || keyBindingsKeys.includes(key)) {
            // Let KeyBindings handle these - don't stop propagation
            return;
        }

        // Check for global shortcuts first (only for keys not handled by KeyBindings)
        if (this.shortcuts[key] && !isShift && !isCtrl && !isAlt) {
            event.preventDefault();
            event.stopPropagation();
            this.shortcuts[key]();
            this.announceToScreenReader(`Shortcut activated: ${key}`);
            return;
        }

        // Check for contextual shortcuts based on current game state
        const contextualShortcuts = this.getContextualShortcuts();
        if (contextualShortcuts && contextualShortcuts[key]) {
            event.preventDefault();
            event.stopPropagation();
            contextualShortcuts[key]();
            this.announceToScreenReader(`Contextual shortcut activated: ${key}`);
            return;
        }
        
        // Handle modifier combinations
        if (isCtrl && key === 'z') {
            event.preventDefault();
            event.stopPropagation();
            this.undoAction();
            this.announceToScreenReader('Undo action');
        } else if (isCtrl && key === 'y') {
            event.preventDefault();
            event.stopPropagation();
            this.redoAction();
            this.announceToScreenReader('Redo action');
        }
    },

    // handle key release - placeholder for any keyup actions
    handleKeyRelease(event) {
        // Currently no specific keyup handlers needed
        // This function exists to prevent the error when keyup fires
    },

    // Announce to screen reader
    announceToScreenReader(message) {
        // conjure the announcement void - where messages echo for those who listen
        let liveRegion = document.getElementById('screen-reader-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'screen-reader-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear after announcement
        TimerManager.setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    },
    
    // Get contextual shortcuts based on current game state
    getContextualShortcuts() {
        switch (game.state) {
            case GameState.MARKET:
                return this.contextualShortcuts.market;
            case GameState.INVENTORY:
                return this.contextualShortcuts.inventory;
            case GameState.TRAVEL:
                return this.contextualShortcuts.travel;
            default:
                if (document.getElementById('property-employee-panel') && 
                    !document.getElementById('property-employee-panel').classList.contains('hidden')) {
                    return this.contextualShortcuts.properties;
                }
                return null;
        }
    },
    
    // craft the help mask - instructions wrapped in darkness
    createHelpOverlay() {
        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'help-overlay';
        helpOverlay.className = 'overlay hidden';
        helpOverlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="close-btn" data-close-overlay="help-overlay">×</button>
                </div>
                <div class="overlay-body">
                    <div class="help-sections">
                        <div class="help-section">
                            <h3>Global Shortcuts</h3>
                            <div class="shortcut-list">
                                <div class="shortcut"><kbd>F1</kbd> - Help</div>
                                <div class="shortcut"><kbd>F5</kbd> - Quick Save</div>
                                <div class="shortcut"><kbd>F9</kbd> - Quick Load</div>
                                <div class="shortcut"><kbd>Esc</kbd> - Back/Menu</div>
                                <div class="shortcut"><kbd>Space</kbd> - Pause/Resume</div>
                                <div class="shortcut"><kbd>1-3</kbd> - Time Speed (Normal/Fast/Very Fast)</div>
                                <div class="shortcut"><kbd>0</kbd> - Pause</div>
                            </div>
                        </div>
                        <div class="help-section">
                            <h3>Panel Shortcuts</h3>
                            <div class="shortcut-list">
                                <div class="shortcut"><kbd>I</kbd> - Inventory</div>
                                <div class="shortcut"><kbd>M</kbd> - Market</div>
                                <div class="shortcut"><kbd>T</kbd> - Travel</div>
                                <div class="shortcut"><kbd>P</kbd> - Properties</div>
                                <div class="shortcut"><kbd>S</kbd> - Save Game</div>
                                <div class="shortcut"><kbd>L</kbd> - Load Game</div>
                            </div>
                        </div>
                        <div class="help-section">
                            <h3>Quick Actions</h3>
                            <div class="shortcut-list">
                                <div class="shortcut"><kbd>R</kbd> - Rest at Inn</div>
                                <div class="shortcut"><kbd>H</kbd> - Buy House</div>
                                <div class="shortcut"><kbd>G</kbd> - Quick Sell</div>
                                <div class="shortcut"><kbd>B</kbd> - Quick Buy</div>
                            </div>
                        </div>
                        <div class="help-section">
                            <h3>Accessibility</h3>
                            <div class="shortcut-list">
                                <div class="shortcut"><kbd>+</kbd> - Increase Font Size</div>
                                <div class="shortcut"><kbd>-</kbd> - Decrease Font Size</div>
                                <div class="shortcut"><kbd>C</kbd> - Toggle High Contrast</div>
                                <div class="shortcut"><kbd>V</kbd> - Toggle Colorblind Mode</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="overlay-footer">
                    <button class="btn btn-secondary" data-close-overlay="help-overlay">Close</button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('overlay-container') || document.body;
        container.appendChild(helpOverlay);
    },

    // unveil the guide - let confusion meet clarity
    showHelpOverlay() {
        const helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) {
            helpOverlay.classList.remove('hidden');
        }
    },
    
    // Apply settings
    applySettings(settings) {
        // Apply font size
        document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
        document.body.classList.add(`font-${settings.fontSize}`);
        
        // Apply high contrast mode
        if (settings.highContrastMode) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // Apply colorblind mode
        document.body.classList.remove('colorblind-normal', 'colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
        document.body.classList.add(`colorblind-${settings.colorblindMode}`);
        
        // Store settings for other systems
        this.currentSettings = settings;
    },
    
    // Reset settings
    resetSettings() {
        const defaultSettings = {
            enableTooltips: true,
            enableAnimations: true,
            enableSoundEffects: true,
            fontSize: 'medium',
            highContrastMode: false,
            colorblindMode: 'normal',
            autoSave: true,
            showTutorial: true,
            enableConfirmations: true
        };
        
        this.applySettings(defaultSettings);
        this.saveSettings();
        addMessage('Settings reset to default values!');
    },
    
    // Create quick action buttons - spawning shortcuts into the void
    createQuickActionButtons() {
        // check if the container exists before we hurl buttons into the abyss
        const gameControls = document.getElementById('game-controls');
        if (!gameControls) {
            // the void consumed our container... how very on brand
            console.log('game-controls element not found... quick actions drift into the ether');
            return;
        }

        // dont spawn duplicates - one set of existential shortcuts is enough
        if (document.getElementById('quick-actions')) {
            console.log('quick actions already exist... no need for clones');
            return;
        }

        const quickActions = document.createElement('div');
        quickActions.id = 'quick-actions';
        quickActions.innerHTML = `
            <button id="quick-save-btn" title="Quick Save (F5)" aria-label="Quick Save" aria-keyshortcuts="F5">💾</button>
            <button id="quick-load-btn" title="Quick Load (F9)" aria-label="Quick Load" aria-keyshortcuts="F9">📁</button>
            <button id="quick-rest-btn" title="Quick Rest (R)" aria-label="Quick Rest" aria-keyshortcuts="R">😴</button>
            <button id="quick-sell-btn" title="Quick Sell (G)" aria-label="Quick Sell" aria-keyshortcuts="G">💰</button>
            <button id="quick-buy-btn" title="Quick Buy (B)" aria-label="Quick Buy" aria-keyshortcuts="B">🛒</button>
            <button id="quick-settings-btn" title="Settings (,)" aria-label="Settings" aria-keyshortcuts=",">⚙️</button>
            <button id="quick-help-btn" title="Help (F1)" aria-label="Help" aria-keyshortcuts="F1">❓</button>
        `;

        gameControls.appendChild(quickActions);
        this.setupQuickActionListeners();
    },

    // wire the quick actions - instant gratification at your fingertips
    setupQuickActionListeners() {
        EventManager.addEventListener(document.getElementById('quick-save-btn'), 'click', () => this.quickSave());
        EventManager.addEventListener(document.getElementById('quick-load-btn'), 'click', () => this.quickLoad());
        EventManager.addEventListener(document.getElementById('quick-rest-btn'), 'click', () => this.quickRest());
        EventManager.addEventListener(document.getElementById('quick-sell-btn'), 'click', () => this.quickSell());
        EventManager.addEventListener(document.getElementById('quick-buy-btn'), 'click', () => this.quickBuy());
        EventManager.addEventListener(document.getElementById('quick-settings-btn'), 'click', () => this.showSettings());
        EventManager.addEventListener(document.getElementById('quick-help-btn'), 'click', () => this.showHelpOverlay());
    },
    
    // Quick save
    quickSave() {
        this.showLoadingIndicator('Saving...');
        try {
            const saveData = game.saveState();
            localStorage.setItem('tradingGameQuickSave', JSON.stringify(saveData));
            this.showNotification('Game saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to save game!', 'error');
        } finally {
            this.hideLoadingIndicator();
        }
    },
    
    // Quick load
    quickLoad() {
        this.showLoadingIndicator('Loading...');
        try {
            const saveData = localStorage.getItem('tradingGameQuickSave');
            if (saveData) {
                let parsedData;
                try {
                    parsedData = JSON.parse(saveData);
                    game.loadState(parsedData);
                    this.showNotification('Game loaded successfully!', 'success');
                } catch (parseError) {
                    // corrupt save - nuke it and tell the user
                    localStorage.removeItem('tradingGameQuickSave');
                    this.showNotification('Save data is corrupted!', 'error');
                }
            } else {
                this.showNotification('No quick save found!', 'warning');
            }
        } catch (error) {
            this.showNotification('Failed to load game!', 'error');
        } finally {
            this.hideLoadingIndicator();
        }
    },
    
    // Quick rest
    quickRest() {
        if (game.currentLocation) {
            const location = GameWorld.locations[game.currentLocation.id];
            if (location && (location.type === 'town' || location.type === 'city')) {
                restAtInn();
            } else {
                this.showNotification('You can only rest in towns and cities!', 'warning');
            }
        }
    },
    
    // Quick sell
    quickSell() {
        if (game.state !== GameState.MARKET) {
            openMarket();
            TimerManager.setTimeout(() => {
                // Focus on sell tab and select first item
                const sellTab = document.getElementById('sell-tab');
                if (sellTab) {
                    const firstItem = sellTab.querySelector('.market-item');
                    if (firstItem) {
                        firstItem.click();
                    }
                }
            }, 100);
        } else {
            // Select all items in sell tab
            const selectAllBtn = document.getElementById('select-all-sell-btn');
            if (selectAllBtn) {
                selectAllBtn.click();
            }
        }
    },
    
    // Quick buy
    quickBuy() {
        if (game.state !== GameState.MARKET) {
            openMarket();
            TimerManager.setTimeout(() => {
                // Focus on buy tab and select first item
                const buyTab = document.getElementById('buy-tab');
                if (buyTab) {
                    const firstItem = buyTab.querySelector('.market-item');
                    if (firstItem) {
                        firstItem.click();
                    }
                }
            }, 100);
        } else {
            // Select all items in buy tab
            const selectAllBtn = document.getElementById('select-all-buy-btn');
            if (selectAllBtn) {
                selectAllBtn.click();
            }
        }
    },
    
    // build the notification altar - where messages spawn and die
    createNotificationSystem() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.innerHTML = `
            <div class="notification-list"></div>
        `;
        
        document.body.appendChild(notificationContainer);
    },
    
    // show notification - with null guards
    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return; // container not ready yet
        const notificationList = notificationContainer.querySelector('.notification-list');
        if (!notificationList) return; // list not ready yet

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content" role="alert" aria-live="polite">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Close notification">×</button>
        `;
        
        notificationList.appendChild(notification);
        
        // Auto-remove after 5 seconds
        TimerManager.setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // forge the waiting screen - suspended animation between states
    createLoadingIndicators() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'overlay hidden';
        loadingOverlay.innerHTML = `
            <div class="overlay-content" role="dialog" aria-modal="true" aria-labelledby="overlay-loading-title">
                <div class="loading-content">
                    <div class="loading-spinner" aria-hidden="true"></div>
                    <div id="overlay-loading-title" class="loading-text">Loading...</div>
                    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('overlay-container') || document.body;
        container.appendChild(loadingOverlay);
    },

    // cast the loading veil - obscure reality while we reshape it
    showLoadingIndicator(text = 'Loading...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) return;
        const loadingText = loadingOverlay.querySelector('.loading-text');
        const progressFill = loadingOverlay.querySelector('.progress-fill');
        
        loadingText.textContent = text;
        progressFill.style.width = '0%';
        loadingOverlay.classList.remove('hidden');
    },
    
    // lift the veil - let them see what we've wrought
    hideLoadingIndicator() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.add('hidden');
    },
    
    // track the transformation - watch the bar fill with anticipation
    updateLoadingProgress(percent) {
        // fixed: added null check for loading-overlay element
        const overlay = document.getElementById('loading-overlay');
        if (!overlay) return; // guard against missing overlay
        const progressFill = overlay.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    },
    
    // Create accessibility options
    createAccessibilityOptions() {
        // Accessibility features are handled in the settings panel
        // Additional accessibility improvements can be added here
    },
    
    // infuse animations - breathe false life into static elements
    createVisualEffects() {
        // Add CSS classes for animations and transitions
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced animations and transitions */
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .slide-up {
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* Enhanced hover effects */
            .enhanced-hover {
                transition: all 0.2s ease;
            }
            
            .enhanced-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            /* Button press effects */
            .button-pressed {
                transform: scale(0.95);
                transition: transform 0.1s ease;
            }
            
            /* Micro-interactions */
            .micro-interaction {
                position: relative;
                overflow: hidden;
            }
            
            .micro-interaction::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease;
            }
            
            .micro-interaction:active::after {
                width: 100%;
                height: 100%;
            }
        `;
        
        document.head.appendChild(style);
    },

    // Create game statistics
    createGameStats() {
        // check if container exists before spawning stats into the void
        const gameControls = document.getElementById('game-controls');
        if (!gameControls) {
            console.log('game-controls element not found... stats fade into darkness');
            return;
        }

        // prevent duplicate stats containers
        if (document.getElementById('game-stats-container')) {
            console.log('game stats already exist... no need for duplicates');
            return;
        }

        const statsContainer = document.createElement('div');
        statsContainer.id = 'game-stats-container';
        statsContainer.innerHTML = `
            <div class="stats-header">
                <h3>Game Statistics</h3>
                <button id="toggle-stats-btn" title="Toggle Statistics" aria-label="Toggle Statistics" aria-expanded="true">📊</button>
            </div>
            <div class="stats-content" role="region" aria-label="Game statistics">
                <div class="stat-item">
                    <span class="stat-label">Days Survived:</span>
                    <span id="stat-days" class="stat-value" aria-live="polite">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Gold Earned:</span>
                    <span id="stat-gold" class="stat-value" aria-live="polite">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Items Traded:</span>
                    <span id="stat-items" class="stat-value" aria-live="polite">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Properties Owned:</span>
                    <span id="stat-properties" class="stat-value" aria-live="polite">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Employees Hired:</span>
                    <span id="stat-employees" class="stat-value" aria-live="polite">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Trade Routes:</span>
                    <span id="stat-routes" class="stat-value" aria-live="polite">0</span>
                </div>
            </div>
        `;

        gameControls.appendChild(statsContainer);
        this.setupStatsListeners();
    },
    
    // bind the stat watchers - numbers that define your existence
    setupStatsListeners() {
        const toggleBtn = document.getElementById('toggle-stats-btn');
        const statsContent = document.querySelector('.stats-content');
        
        EventManager.addEventListener(toggleBtn, 'click', () => {
            statsContent.classList.toggle('hidden');
        });
        
        // Update stats periodically
        TimerManager.setInterval(() => this.updateStats(), 5000);
    },

    // refresh the numbers - cold reality distilled to digits
    updateStats() {
        if (game.player) {
            const days = TimeSystem.currentTime.day;
            const gold = game.player.gold || 0;
            const items = Object.values(game.player.inventory || {}).reduce((sum, qty) => sum + qty, 0);
            const properties = game.player.ownedProperties ? game.player.ownedProperties.length : 0;
            const employees = game.player.ownedEmployees ? game.player.ownedEmployees.length : 0;
            const routes = game.player.tradeRoutes ? game.player.tradeRoutes.length : 0;
            
            document.getElementById('stat-days').textContent = days;
            document.getElementById('stat-gold').textContent = gold;
            document.getElementById('stat-items').textContent = items;
            document.getElementById('stat-properties').textContent = properties;
            document.getElementById('stat-employees').textContent = employees;
            document.getElementById('stat-routes').textContent = routes;
        }
    },
    
    // prepare the question box - forcing choice upon the indecisive
    createConfirmationDialogs() {
        const confirmationOverlay = document.createElement('div');
        confirmationOverlay.id = 'confirmation-overlay';
        confirmationOverlay.className = 'overlay hidden';
        confirmationOverlay.innerHTML = `
            <div class="overlay-content" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
                <div class="overlay-header">
                    <h3 id="confirmation-title">Confirm Action</h3>
                </div>
                <div class="overlay-body">
                    <p id="confirmation-message">Are you sure you want to perform this action?</p>
                </div>
                <div class="overlay-footer">
                    <button id="confirm-yes-btn" class="btn btn-primary" aria-label="Confirm action">Yes</button>
                    <button id="confirm-no-btn" class="btn btn-secondary" aria-label="Cancel action">No</button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('overlay-container') || document.body;
        container.appendChild(confirmationOverlay);
    },

    // show confirmation dialog - with null guards
    showConfirmationDialog(title, message, onConfirm, onCancel = null) {
        const overlay = document.getElementById('confirmation-overlay');
        const titleElement = document.getElementById('confirmation-title');
        const messageElement = document.getElementById('confirmation-message');
        const yesBtn = document.getElementById('confirm-yes-btn');
        const noBtn = document.getElementById('confirm-no-btn');

        // guard against missing elements
        if (!overlay || !titleElement || !messageElement || !yesBtn || !noBtn) {
            console.warn('⚠️ Confirmation dialog elements not found');
            return;
        }

        titleElement.textContent = title;
        messageElement.textContent = message;

        // remove existing listeners - with null guards
        const newYesBtn = yesBtn.cloneNode(true);
        const newNoBtn = noBtn.cloneNode(true);

        if (yesBtn.parentNode) yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
        if (noBtn.parentNode) noBtn.parentNode.replaceChild(newNoBtn, noBtn);
        
        // Add new listeners
        newYesBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            if (onConfirm) onConfirm();
        });
        
        newNoBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            if (onCancel) onCancel();
        });
        
        overlay.classList.remove('hidden');
    },
    
    // Navigation helpers
    navigateList(direction) {
        // Handle list navigation for inventory, market, etc.
        const activeElement = document.activeElement;
        if (!activeElement) return;
        
        const items = Array.from(activeElement.querySelectorAll('.item, .market-item, .inventory-item, .property-item, .employee-item'));
        if (items.length === 0) return;
        
        const currentIndex = items.findIndex(item => item === activeElement);
        if (currentIndex === -1) return;
        
        let newIndex;
        switch (direction) {
            case 'up':
                newIndex = currentIndex - 1;
                break;
            case 'down':
                newIndex = currentIndex + 1;
                break;
            case 'left':
                newIndex = currentIndex - 1;
                break;
            case 'right':
                newIndex = currentIndex + 1; // fixed: was using undefined newIndex
                break;
        }
        
        // Wrap around
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
        
        items[newIndex].focus();
    },
    
    // Select current item
    selectCurrentItem() {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.click) {
            activeElement.click();
        }
    },
    
    // Switch tab
    switchTab() {
        const activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab) return;

        // fixed: was using undefined 'activeElement', should be 'activeTab'
        if (!activeTab.parentElement) return; // guard against orphaned tabs
        const allTabs = Array.from(activeTab.parentElement.querySelectorAll('.tab-btn'));
        const currentIndex = allTabs.findIndex(tab => tab === activeTab);

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % allTabs.length;
            allTabs[nextIndex].click();
        }
    },
    
    // Market-specific functions
    switchMarketTab(tabName) {
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) tabBtn.click();
    },
    
    refreshMarket() {
        const refreshBtn = document.getElementById('refresh-market-btn');
        if (refreshBtn) refreshBtn.click();
    },
    
    selectAllItems() {
        const selectAllBtn = document.querySelector('.select-all-btn:not(.hidden)');
        if (selectAllBtn) selectAllBtn.click();
    },
    
    clearSelection() {
        const clearBtn = document.querySelector('.clear-selection-btn:not(.hidden)');
        if (clearBtn) clearBtn.click();
    },
    
    confirmTrade() {
        const confirmBtn = document.getElementById('confirm-trade-btn');
        if (confirmBtn) confirmBtn.click();
    },
    
    // Inventory-specific functions
    sortInventory(criteria) {
        // Implementation depends on inventory system
        if (typeof InventorySystem !== 'undefined' && InventorySystem.sortInventory) {
            InventorySystem.sortInventory(criteria);
        }
    },
    
    equipItem() {
        // Implementation depends on inventory system
        if (typeof InventorySystem !== 'undefined' && InventorySystem.equipItem) {
            InventorySystem.equipItem();
        }
    },
    
    useItem() {
        // Implementation depends on inventory system
        if (typeof InventorySystem !== 'undefined' && InventorySystem.useItem) {
            InventorySystem.useItem();
        }
    },
    
    dropItem() {
        // Implementation depends on inventory system
        if (typeof InventorySystem !== 'undefined' && InventorySystem.dropItem) {
            InventorySystem.dropItem();
        }
    },
    
    // Travel-specific functions
    setTravelFilter(filter) {
        const filterSelect = document.getElementById('destination-filter');
        if (filterSelect) {
            filterSelect.value = filter;
            filterSelect.dispatchEvent(new Event('change'));
        }
    },
    
    setTravelSort(criteria) {
        const sortSelect = document.getElementById('destination-sort');
        if (sortSelect) {
            sortSelect.value = criteria;
            sortSelect.dispatchEvent(new Event('change'));
        }
    },
    
    // Property-specific functions
    buyProperty() {
        // Implementation depends on property system
        if (typeof PropertySystem !== 'undefined' && PropertySystem.showPropertyPurchaseInterface) {
            PropertySystem.showPropertyPurchaseInterface();
        }
    },
    
    upgradeProperty() {
        // Implementation depends on property system
        const activeProperty = document.querySelector('.property-item.active');
        if (activeProperty && typeof PropertySystem !== 'undefined') {
            const propertyId = activeProperty.dataset.propertyId;
            PropertySystem.showUpgradeInterface(propertyId);
        }
    },
    
    repairProperty() {
        // Implementation depends on property system
        const activeProperty = document.querySelector('.property-item.active');
        if (activeProperty && typeof PropertySystem !== 'undefined') {
            const propertyId = activeProperty.dataset.propertyId;
            PropertySystem.repairProperty(propertyId);
        }
    },
    
    manageEmployees() {
        // Switch to employees tab
        const employeesTab = document.querySelector('[data-tab="employees"]');
        if (employeesTab) employeesTab.click();
    },
    
    showPropertyDetails() {
        const activeProperty = document.querySelector('.property-item.active');
        if (activeProperty && typeof PropertySystem !== 'undefined') {
            const propertyId = activeProperty.dataset.propertyId;
            PropertySystem.showPropertyDetails(propertyId);
        }
    },
    
    // Settings functions - redirect to main SettingsPanel
    showSettings() {
        if (typeof SettingsPanel !== 'undefined') {
            if (!SettingsPanel.panelElement) {
                SettingsPanel.init();
            }
            SettingsPanel.show();
        } else {
            // settingsPanel not loaded yet - silent fail, user can try again
            console.warn('⚙️ SettingsPanel not ready yet');
        }
    },
    
    showHelpOverlay() {
        const helpOverlay = document.getElementById('help-overlay');
        if (helpOverlay) {
            helpOverlay.classList.remove('hidden');
        }
    },
    
    // Accessibility functions
    increaseFontSize() {
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        const currentSize = document.body.className.match(/font-(\w+)/)?.[1] || 'medium';
        const currentIndex = sizes.indexOf(currentSize);
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
        document.body.classList.remove(`font-${currentSize}`);
        document.body.classList.add(`font-${sizes[nextIndex]}`);
        
        // Save preference
        this.saveSettings();
    },
    
    decreaseFontSize() {
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        const currentSize = document.body.className.match(/font-(\w+)/)?.[1] || 'medium';
        const currentIndex = sizes.indexOf(currentSize);
        const prevIndex = Math.max(currentIndex - 1, 0);
        document.body.classList.remove(`font-${currentSize}`);
        document.body.classList.add(`font-${sizes[prevIndex]}`);
        
        // Save preference
        this.saveSettings();
    },
    
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        this.saveSettings();
    },
    
    changeColorblindMode(mode) {
        document.body.classList.remove('colorblind-normal', 'colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
        document.body.classList.add(`colorblind-${mode}`);
        this.saveSettings();
    },
    
    // Undo/Redo functions
    undoAction() {
        // Implementation depends on game state
        addMessage('Undo action not yet implemented');
    },
    
    redoAction() {
        // Implementation depends on game state
        addMessage('Redo action not yet implemented');
    },
    
    // debooger functions - Unity's dark diagnostic realm
    toggleDeboogerMode() {
        document.body.classList.toggle('debooger-mode');
        addMessage('Debooger mode ' + (document.body.classList.contains('debooger-mode') ? 'enabled' : 'disabled'));
    },
    
    exportGameData() {
        try {
            const saveData = game.saveState();
            const dataStr = JSON.stringify(saveData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trading-game-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            addMessage('Game data exported successfully!');
        } catch (error) {
            addMessage('Failed to export game data!', 'error');
        }
    },
    
    // Enhanced button interactions
    enhanceButtonInteractions() {
        // Add enhanced hover effects and click feedback to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.add('enhanced-hover');
            
            EventManager.addEventListener(button, 'mousedown', () => {
                button.classList.add('button-pressed');
            });
            
            EventManager.addEventListener(button, 'mouseup', () => {
                button.classList.remove('button-pressed');
            });
            
            EventManager.addEventListener(button, 'mouseleave', () => {
                button.classList.remove('button-pressed');
            });
        });
    },
    
    // summon the entire facade - all illusions at once
    initialize() {
        this.init();
        // loadSettings was moved to SettingsPanel - load via that instead
        if (typeof SettingsPanel !== 'undefined' && SettingsPanel.loadSettings) {
            SettingsPanel.loadSettings();
        }
        this.enhanceButtonInteractions();
        this.createTooltips();
        this.createParticleEffects();
        this.createAutoSaveIndicator();
        this.createTutorialSystem();
    },
    
    // spawn the tooltip system - hover hints that materialize from nothing
    createTooltips() {
        // Add tooltip containers
        const tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'tooltip-container';
        tooltipContainer.setAttribute('role', 'tooltip');
        document.body.appendChild(tooltipContainer);

        // Add screen reader announcements container
        const announcementsContainer = document.createElement('div');
        announcementsContainer.id = 'screen-reader-announcements';
        announcementsContainer.setAttribute('aria-live', 'polite');
        announcementsContainer.setAttribute('aria-atomic', 'true');
        announcementsContainer.className = 'sr-only';
        document.body.appendChild(announcementsContainer);

        // Setup tooltip listeners
        EventManager.addEventListener(document, 'mouseover', (e) => this.showTooltip(e));
        EventManager.addEventListener(document, 'mouseout', () => this.hideTooltip());
        EventManager.addEventListener(document, 'focus', (e) => this.showTooltip(e));
        EventManager.addEventListener(document, 'blur', () => this.hideTooltip());
    },

    // manifest the hint - reveal knowledge on hover
    showTooltip(event) {
        // safety check - some targets (SVG, etc) may not have closest()
        if (!event?.target?.closest) return;
        const element = event.target.closest('[title], [data-tooltip]');
        if (!element || !this.currentSettings?.enableTooltips) return;
        
        const tooltipText = element.getAttribute('title') || element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        // Remove existing tooltip
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.textContent = tooltipText;
        
        const tooltipContainer = document.getElementById('tooltip-container') || document.body;
        tooltipContainer.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Calculate position to avoid viewport edges
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 5;
        
        // Adjust if tooltip would go off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = rect.bottom + 5;
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        TimerManager.setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    },
    
    // hide tooltip - with null guard
    hideTooltip() {
        const tooltipContainer = document.getElementById('tooltip-container');
        if (!tooltipContainer) return; // container doesn't exist yet
        const tooltips = tooltipContainer.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.remove('visible');
            TimerManager.setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.remove();
                }
            }, 200);
        });
    },
    
    // birth the particle realm - ephemeral specks of visual feedback
    createParticleEffects() {
        const particleContainer = document.createElement('div');
        particleContainer.id = 'particle-container';
        document.body.appendChild(particleContainer);
    },
    
    // release a particle - brief spark of animated illusion
    createParticleEffect(x, y, type = 'success') {
        if (!this.currentSettings?.enableAnimations) return;
        
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;
        
        // Set particle appearance based on type
        switch (type) {
            case 'success':
                particle.style.backgroundColor = '#4caf50';
                particle.style.width = '4px';
                particle.style.height = '4px';
                break;
            case 'error':
                particle.style.backgroundColor = '#f44336';
                particle.style.width = '4px';
                particle.style.height = '4px';
                break;
            case 'gold':
                particle.style.backgroundColor = '#ffd700';
                particle.style.width = '6px';
                particle.style.height = '6px';
                break;
            default:
                particle.style.backgroundColor = '#2196f3';
                particle.style.width = '4px';
                particle.style.height = '4px';
        }
        
        particle.style.position = 'fixed';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const particleContainer = document.getElementById('particle-container') || document.body;
        particleContainer.appendChild(particle);
        
        // Animate particle
        const animation = particle.animate([
            { transform: 'translateY(0px) scale(1)', opacity: 1 },
            { transform: 'translateY(-20px) scale(1.5)', opacity: 0.8 },
            { transform: 'translateY(-40px) scale(0.5)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
    },
    
    // Create auto-save indicator
    createAutoSaveIndicator() {
        // check for container before summoning the save icon from the void
        const gameHeader = document.getElementById('game-header') || document.getElementById('top-bar') || document.getElementById('game-container');
        if (!gameHeader) {
            console.warn('No suitable container for auto-save indicator... it fades into nothing');
            return;
        }

        // prevent duplicates
        if (document.getElementById('auto-save-indicator')) {
            return;
        }

        const autoSaveIndicator = document.createElement('div');
        autoSaveIndicator.id = 'auto-save-indicator';
        autoSaveIndicator.className = 'hidden'; // start hidden
        autoSaveIndicator.innerHTML = `
            <div class="auto-save-icon">💾</div>
            <div class="auto-save-text">Auto-saving...</div>
        `;

        gameHeader.appendChild(autoSaveIndicator);
    },
    
    // flash the save icon - brief reassurance in the face of impermanence
    showAutoSaveIndicator() {
        const indicator = document.getElementById('auto-save-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');

            // Hide after 2 seconds
            TimerManager.setTimeout(() => {
                indicator.classList.add('hidden');
            }, 2000);
        }
    },

    // construct the tutorial labyrinth - guide the lost through their first steps
    createTutorialSystem() {
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.id = 'tutorial-overlay';
        tutorialOverlay.className = 'overlay hidden';
        tutorialOverlay.innerHTML = `
            <div class="tutorial-content">
                <div class="tutorial-header">
                    <h3>Tutorial</h3>
                    <button id="skip-tutorial-btn" class="close-btn">Skip Tutorial</button>
                </div>
                <div class="tutorial-steps">
                    <div class="tutorial-step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Welcome to Medieval Trading Game!</h4>
                            <p>In this game, you'll become a successful merchant by buying and selling goods across different locations.</p>
                            <div class="tutorial-highlight">
                                <p>Use <kbd>W</kbd>, <kbd>A</kbd>, <kbd>S</kbd>, <kbd>D</kbd> keys to move around the interface.</p>
                                <p>Press <kbd>I</kbd> to open your inventory and <kbd>M</kbd> to access the market.</p>
                            </div>
                        </div>
                    </div>
                    <div class="tutorial-step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Trading Basics</h4>
                            <p>Buy low and sell high to make profit. Different locations have different specialties.</p>
                            <div class="tutorial-highlight">
                                <p>Use <kbd>1-7</kbd> keys to quickly switch between market tabs.</p>
                                <p>Press <kbd>F5</kbd> to quick save and <kbd>F9</kbd> to quick load.</p>
                            </div>
                        </div>
                    </div>
                    <div class="tutorial-step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Properties & Employees</h4>
                            <p>Buy properties to generate passive income and hire employees to manage them.</p>
                            <div class="tutorial-highlight">
                                <p>Press <kbd>P</kbd> to open the property management panel.</p>
                                <p>Use keyboard shortcuts for faster navigation.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tutorial-navigation">
                    <button id="prev-tutorial-btn" class="nav-btn">← Previous</button>
                    <button id="next-tutorial-btn" class="nav-btn">Next →</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tutorialOverlay);
        this.setupTutorialListeners();
    },
    
    // wire the tutorial controls - bind progression and escape
    setupTutorialListeners() {
        const skipBtn = document.getElementById('skip-tutorial-btn');
        const prevBtn = document.getElementById('prev-tutorial-btn');
        const nextBtn = document.getElementById('next-tutorial-btn');
        
        EventManager.addEventListener(skipBtn, 'click', () => {
            this.completeTutorial();
        });
        
        EventManager.addEventListener(prevBtn, 'click', () => {
            this.navigateTutorial('prev');
        });
        
        EventManager.addEventListener(nextBtn, 'click', () => {
            this.navigateTutorial('next');
        });
    },
    
    // begin the lessons - unveil the guided path
    showTutorial() {
        if (!this.currentSettings?.showTutorial) return;
        
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        tutorialOverlay.classList.remove('hidden');
        this.currentTutorialStep = 1;
        this.updateTutorialStep();
    },
    
    // Navigate tutorial
    navigateTutorial(direction) {
        const steps = document.querySelectorAll('.tutorial-step');
        const currentStep = document.querySelector('.tutorial-step.active');
        
        if (direction === 'next' && currentStep) {
            const nextStep = currentStep.nextElementSibling;
            if (nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                this.currentTutorialStep++;
            }
        } else if (direction === 'prev' && currentStep) {
            const prevStep = currentStep.previousElementSibling;
            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                this.currentTutorialStep--;
            }
        }
        
        this.updateTutorialStep();
    },
    
    // advance the guide - move through the instructional sequence
    updateTutorialStep() {
        const prevBtn = document.getElementById('prev-tutorial-btn');
        const nextBtn = document.getElementById('next-tutorial-btn');
        const steps = document.querySelectorAll('.tutorial-step');

        // Update navigation buttons
        prevBtn.disabled = this.currentTutorialStep <= 1;
        nextBtn.disabled = this.currentTutorialStep >= steps.length;

        // Update step indicators
        steps.forEach((step, index) => {
            const stepNumber = step.querySelector('.step-number');
            if (stepNumber) {
                if (index + 1 < this.currentTutorialStep) {
                    stepNumber.classList.add('completed');
                } else if (index + 1 === this.currentTutorialStep) {
                    stepNumber.classList.add('active');
                } else {
                    stepNumber.classList.remove('completed', 'active');
                }
            }
        });
    },
    
    // Complete tutorial
    completeTutorial() {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        tutorialOverlay.classList.add('hidden');
        
        // Mark tutorial as completed
        localStorage.setItem('tutorialCompleted', 'true');
        
        // announce completion
        this.showNotification('Tutorial completed! You can always access it from the settings menu.', 'success');
    },
    
    // Check if tutorial should be shown
    checkTutorialStatus() {
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        const showTutorial = this.currentSettings?.showTutorial;
        
        if (!tutorialCompleted && showTutorial && game.state === GameState.PLAYING) {
            // Show tutorial after a short delay
            TimerManager.setTimeout(() => this.showTutorial(), 2000);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcuts;
}