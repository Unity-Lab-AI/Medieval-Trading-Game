// ═══════════════════════════════════════════════════════════════
// PANEL MANAGER - window state orchestration
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PanelManager = {
    // Stack of currently open panels (most recent last)
    openPanels: [],

    // 🖤 Store toolbar drag handlers for cleanup 💀
    _toolbarDragHandlers: {
        mousedown: null,
        mousemove: null,
        mouseup: null
    },

    // 🖤 Safe toggle handlers registry - NO EVAL ALLOWED IN THIS REALM
    // Maps customToggle string names to actual functions
    toggleHandlers: {
        'KeyBindings.openMenu()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openMenu?.(),
        'QuestSystem.toggleQuestTracker()': () => typeof QuestSystem !== 'undefined' && QuestSystem.toggleQuestTracker?.(),
        'openMarket()': () => typeof openMarket === 'function' && openMarket()
    },

    // All managed panel IDs and their info
    panelInfo: {
        'game-setup-panel': { name: 'New Game', icon: '🎮', shortcut: '' }, // 🖤 Setup panel needs tracking for proper hide
        'market-panel': { name: 'Market', icon: '🏪', shortcut: 'M', customToggle: 'openMarket()' },
        'inventory-panel': { name: 'Inventory', icon: '🎒', shortcut: 'I' },
        'travel-panel': { name: 'Travel', icon: '🗺️', shortcut: 'T' },
        'transportation-panel': { name: 'Transport', icon: '🚗', shortcut: 'W' },
        'character-sheet-overlay': { name: 'Character', icon: '👤', shortcut: 'C', useActiveClass: true },
        'financial-sheet-overlay': { name: 'Finances', icon: '💰', shortcut: 'F', useActiveClass: true },
        'achievement-overlay': { name: 'Achievements', icon: '🏆', shortcut: 'H', useActiveClass: true },
        'settings-panel': { name: 'Settings', icon: '⚙️', shortcut: ',' },
        'property-employee-panel': { name: 'Properties', icon: '🏠', shortcut: 'P', useActiveClass: true },
        'location-panel': { name: 'Location', icon: '📍', shortcut: '' },
        'side-panel': { name: 'Player Info', icon: '👤', shortcut: '' },
        'message-log': { name: 'Messages', icon: '💬', shortcut: '' },
        'game-menu-overlay': { name: 'Menu', icon: '📋', shortcut: 'Escape', useActiveClass: true, customToggle: 'KeyBindings.openMenu()' },
        'help-overlay': { name: 'Help', icon: '❓', shortcut: '', useActiveClass: true },
        'quest-tracker': { name: 'Quest Tracker', icon: '📋', shortcut: '', customToggle: 'QuestSystem.toggleQuestTracker()' }
    },

    // 🖤 Panels that should NOT get close buttons (they have their own or are special)
    noCloseButtonPanels: [
        'panel-toolbar',      // The Panels panel itself
        'game-setup-panel',   // Has cancel button
        'location-panel',     // Core UI
        'side-panel',         // Core UI - player info
        'message-log',        // Core UI - can minimize
        'people-panel',       // Has its own controls
        'quest-tracker'       // Has its own minimize
    ],

    // Initialize panel manager
    init() {
        console.log('🪟 PanelManager: Initializing...');

        // 🖤 Ensure side-panel (Player Info) is ALWAYS visible - restore if hidden
        this.ensureCoreUIVisible();

        // 🎨 Build the command center for your window chaos
        this.createPanelToolbar();

        // 🗡️ Arm the ESC key - your emergency exit from this madness
        this.setupEscHandler();

        // 👁️ Watch the panels like a paranoid fucking hawk
        this.observePanelChanges();

        // 🔮 Hijack the old panel functions - we run this show now
        this.patchPanelFunctions();

        // 🖤 Add close buttons to all appropriate panels
        this.addCloseButtonsToAllPanels();

        // 🖤 Cleanup observer on page unload to prevent memory leaks 💀
        window.addEventListener('beforeunload', () => this.disconnectObserver());

        console.log('🪟 PanelManager: Ready');
    },

    // 🖤 Ensure core UI panels are always visible (side-panel, location-panel)
    ensureCoreUIVisible() {
        const coreUIPanels = ['side-panel', 'location-panel'];
        coreUIPanels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.remove('hidden');
                panel.style.display = '';
                panel.style.visibility = '';
            }
        });
    },

    // 🖤 Add X close button (top-right only) to panels that need it
    addCloseButtonsToAllPanels() {
        // Get all panels and overlays
        const panels = document.querySelectorAll('.panel, .overlay');

        panels.forEach(panel => {
            const panelId = panel.id;

            // Skip panels that shouldn't have close buttons
            if (this.noCloseButtonPanels.includes(panelId)) return;

            // Skip if already has any close button (panel-close-x, overlay-close, etc.)
            if (panel.querySelector('.panel-close-x, .overlay-close')) return;

            // Make panel position relative for absolute positioning of buttons
            const computedStyle = window.getComputedStyle(panel);
            if (computedStyle.position === 'static') {
                panel.style.position = 'relative';
            }

            // 🖤 Add X button (top-right) - only one per panel
            const closeX = document.createElement('button');
            closeX.className = 'panel-close-x';
            closeX.innerHTML = '×';
            closeX.title = 'Close';
            closeX.onclick = (e) => {
                e.stopPropagation();
                this.closePanel(panelId);
            };
            panel.appendChild(closeX);

            console.log('🖤 Added close button to:', panelId);
        });
    },

    // 🖤 Track toolbar orientation state
    isHorizontal: false,

    // 🖤 Create a toolbar with buttons to reopen panels - because you'll fucking close them all
    createPanelToolbar() {
        // 💀 Don't double-summon this abomination
        if (document.getElementById('panel-toolbar')) return;

        const toolbar = document.createElement('div');
        toolbar.id = 'panel-toolbar';
        toolbar.innerHTML = `
            <div class="panel-toolbar-header">
                <span class="toolbar-grip">⋮⋮</span>
                <span class="toolbar-title">Panels</span>
                <button class="toolbar-rotate" title="Toggle Horizontal/Vertical">🔄</button>
                <button class="toolbar-collapse" title="Collapse">−</button>
            </div>
            <div class="panel-toolbar-buttons"></div>
        `;

        toolbar.style.cssText = `
            position: fixed;
            top: 70px;
            right: 10px;
            background: rgba(20, 20, 30, 0.95);
            border: 1px solid rgba(79, 195, 247, 0.3);
            border-radius: 8px;
            z-index: 500; /* Z-INDEX STANDARD: Game panels */
            min-width: 50px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            display: none;
        `;

        document.body.appendChild(toolbar);

        // 🌙 Paint this header with dark gradients and control-freak vibes
        const header = toolbar.querySelector('.panel-toolbar-header');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            background: linear-gradient(180deg, rgba(79, 195, 247, 0.2) 0%, rgba(79, 195, 247, 0.05) 100%);
            border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            border-radius: 8px 8px 0 0;
            cursor: move;
            user-select: none;
        `;

        // Style rotate button 🔄
        const rotateBtn = toolbar.querySelector('.toolbar-rotate');
        rotateBtn.style.cssText = `
            background: none;
            border: none;
            color: #4fc3f7;
            font-size: 14px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
            transition: transform 0.3s ease;
        `;

        // Style collapse button
        const collapseBtn = toolbar.querySelector('.toolbar-collapse');
        collapseBtn.style.cssText = `
            background: none;
            border: none;
            color: #4fc3f7;
            font-size: 18px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
        `;

        // Toggle collapse
        let collapsed = false;
        const buttonsContainer = toolbar.querySelector('.panel-toolbar-buttons');
        collapseBtn.onclick = () => {
            collapsed = !collapsed;
            buttonsContainer.style.display = collapsed ? 'none' : 'flex';
            collapseBtn.textContent = collapsed ? '+' : '−';
        };

        // 🔄 Toggle horizontal/vertical orientation
        const titleSpan = toolbar.querySelector('.toolbar-title');
        rotateBtn.onclick = () => {
            this.isHorizontal = !this.isHorizontal;
            rotateBtn.style.transform = this.isHorizontal ? 'rotate(90deg)' : 'rotate(0deg)';

            if (this.isHorizontal) {
                // 🦇 Horizontal compact mode - thin bar across screen
                toolbar.style.top = '60px';
                toolbar.style.left = '50%';
                toolbar.style.right = 'auto';
                toolbar.style.transform = 'translateX(-50%)';
                toolbar.style.maxWidth = '95vw';

                header.style.borderRadius = '8px 8px 0 0';
                titleSpan.style.display = 'none'; // Hide title in compact

                buttonsContainer.style.flexDirection = 'row';
                buttonsContainer.style.flexWrap = 'wrap';
                buttonsContainer.style.justifyContent = 'center';
                buttonsContainer.style.padding = '4px';
                buttonsContainer.style.gap = '2px';

                // Make buttons icon-only in horizontal
                const btns = buttonsContainer.querySelectorAll('.panel-toolbar-btn');
                btns.forEach(btn => {
                    btn.style.padding = '6px 8px';
                    btn.style.minWidth = 'auto';
                    const label = btn.querySelector('.btn-label');
                    if (label) label.style.display = 'none';
                });
            } else {
                // 💀 Vertical mode - restore normal
                toolbar.style.top = '70px';
                toolbar.style.left = 'auto';
                toolbar.style.right = '10px';
                toolbar.style.transform = 'none';
                toolbar.style.maxWidth = 'none';

                titleSpan.style.display = '';

                buttonsContainer.style.flexDirection = 'column';
                buttonsContainer.style.flexWrap = 'nowrap';
                buttonsContainer.style.justifyContent = 'flex-start';
                buttonsContainer.style.padding = '8px';
                buttonsContainer.style.gap = '4px';

                // Restore button labels
                const btns = buttonsContainer.querySelectorAll('.panel-toolbar-btn');
                btns.forEach(btn => {
                    btn.style.padding = '6px 10px';
                    const label = btn.querySelector('.btn-label');
                    if (label) label.style.display = '';
                });
            }
        };

        // Make toolbar draggable
        this.makeToolbarDraggable(toolbar, header);

        // Style buttons container
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
        `;

        // Add buttons for main panels
        // 🖤 side-panel (Player Info) is ALWAYS visible - no toggle button needed
        const mainPanels = [
            'game-menu-overlay',  // 🖤 Menu button at top - opens fullscreen menu
            'market-panel',
            'inventory-panel',
            'travel-panel',
            'transportation-panel',
            'character-sheet-overlay',
            'financial-sheet-overlay',
            'property-employee-panel',
            'achievement-overlay',
            'settings-panel',
            'message-log',
            'quest-tracker'  // 🖤 Added quest tracker widget toggle
        ];

        mainPanels.forEach(panelId => {
            const info = this.panelInfo[panelId];
            if (!info) return;

            const btn = document.createElement('button');
            btn.className = 'panel-toolbar-btn';
            btn.dataset.panelId = panelId;
            btn.title = info.name + (info.shortcut ? ` [${info.shortcut}]` : '');
            btn.innerHTML = `<span class="btn-icon">${info.icon}</span><span class="btn-label">${info.name}</span>`;

            btn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                background: rgba(79, 195, 247, 0.1);
                border: 1px solid rgba(79, 195, 247, 0.2);
                border-radius: 6px;
                color: #e0e0e0;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
                white-space: nowrap;
            `;

            btn.onmouseenter = () => {
                btn.style.background = 'rgba(79, 195, 247, 0.3)';
                btn.style.borderColor = 'rgba(79, 195, 247, 0.5)';
            };

            btn.onmouseleave = () => {
                const isOpen = this.isPanelOpen(panelId);
                btn.style.background = isOpen ? 'rgba(76, 175, 80, 0.3)' : 'rgba(79, 195, 247, 0.1)';
                btn.style.borderColor = isOpen ? 'rgba(76, 175, 80, 0.5)' : 'rgba(79, 195, 247, 0.2)';
            };

            // 🖤 Handle custom toggle functions (like QuestSystem.toggleQuestTracker)
            // Uses safe registry lookup instead of eval() - no code injection here! 💀
            if (info.customToggle && this.toggleHandlers[info.customToggle]) {
                btn.onclick = () => {
                    try {
                        this.toggleHandlers[info.customToggle]();
                    } catch (e) {
                        console.warn('🖤 Custom toggle failed:', e);
                    }
                };
            } else if (info.customToggle) {
                // Unknown customToggle - warn but don't crash
                console.warn(`🖤 Unknown customToggle: ${info.customToggle} - add it to toggleHandlers registry`);
                btn.onclick = () => this.togglePanel(panelId);
            } else {
                btn.onclick = () => this.togglePanel(panelId);
            }

            buttonsContainer.appendChild(btn);
        });

        this.updateToolbarButtons();
    },

    // Make toolbar draggable
    makeToolbarDraggable(toolbar, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        // 🖤 Store handlers for cleanup 💀
        this._toolbarDragHandlers.mousedown = (e) => {
            if (e.target.classList.contains('toolbar-collapse')) return;
            isDragging = true;
            offsetX = e.clientX - toolbar.getBoundingClientRect().left;
            offsetY = e.clientY - toolbar.getBoundingClientRect().top;
            e.preventDefault();
        };

        this._toolbarDragHandlers.mousemove = (e) => {
            if (!isDragging) return;
            toolbar.style.left = (e.clientX - offsetX) + 'px';
            toolbar.style.top = (e.clientY - offsetY) + 'px';
            toolbar.style.right = 'auto';
        };

        this._toolbarDragHandlers.mouseup = () => {
            isDragging = false;
        };

        handle.addEventListener('mousedown', this._toolbarDragHandlers.mousedown);
        document.addEventListener('mousemove', this._toolbarDragHandlers.mousemove);
        document.addEventListener('mouseup', this._toolbarDragHandlers.mouseup);
    },

    // Check if panel is currently open/visible
    isPanelOpen(panelId) {
        // Special handling for settings-panel - check SettingsPanel.isOpen
        if (panelId === 'settings-panel') {
            return typeof SettingsPanel !== 'undefined' && SettingsPanel.isOpen === true;
        }

        const panel = document.getElementById(panelId);
        if (!panel) return false;

        // Check if this panel uses the 'active' class instead of 'hidden'
        const info = this.panelInfo[panelId];
        if (info && info.useActiveClass) {
            // 🖤 Check both active class AND display style - overlays use both 💀
            const hasActive = panel.classList.contains('active');
            const displayFlex = panel.style.display === 'flex' || window.getComputedStyle(panel).display === 'flex';
            return hasActive || displayFlex;
        }

        // Check various visibility indicators
        const isHidden = panel.classList.contains('hidden');
        const displayNone = window.getComputedStyle(panel).display === 'none';
        const visibilityHidden = window.getComputedStyle(panel).visibility === 'hidden';

        return !isHidden && !displayNone && !visibilityHidden;
    },

    // Toggle panel visibility
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const info = this.panelInfo[panelId];

        // Special handling for settings-panel - use SettingsPanel.show()
        if (panelId === 'settings-panel') {
            if (typeof SettingsPanel !== 'undefined') {
                if (SettingsPanel.isOpen) {
                    SettingsPanel.hide();
                } else {
                    SettingsPanel.show();
                }
            }
            return;
        }

        // 🖤 Special handling for character/financial sheets - use KeyBindings toggle 💀
        // These panels have their own toggle logic that handles create + open + close
        if (panelId === 'character-sheet-overlay') {
            if (typeof KeyBindings !== 'undefined' && KeyBindings.openCharacterSheet) {
                KeyBindings.openCharacterSheet(); // Has built-in toggle logic
            }
            return;
        }
        if (panelId === 'financial-sheet-overlay') {
            if (typeof KeyBindings !== 'undefined' && KeyBindings.openFinancialSheet) {
                KeyBindings.openFinancialSheet(); // Has built-in toggle logic
            }
            return;
        }

        // Special handling for dynamically created panels that may not exist yet
        if (!panel) {
            console.warn(`🪟 Panel not found: ${panelId}`);
            return;
        }

        if (this.isPanelOpen(panelId)) {
            this.closePanel(panelId);
        } else {
            this.openPanel(panelId);
        }
    },

    // 🔮 Summon a panel from the hidden depths
    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        const info = this.panelInfo[panelId];

        // ⚙️ Settings panel is special - it has its own dark rituals
        if (panelId === 'settings-panel') {
            if (typeof SettingsPanel !== 'undefined' && SettingsPanel.show) {
                SettingsPanel.show();
            }
            return;
        }

        // 🖤 Some panels are built different - they use 'active' instead of hiding
        if (info && info.useActiveClass) {
            // 🦇 Dynamically created overlays need special召唤術
            if (panelId === 'character-sheet-overlay') {
                // 👤 Invoke the character sheet through KeyBindings
                if (typeof KeyBindings !== 'undefined' && KeyBindings.openCharacterSheet) {
                    KeyBindings.openCharacterSheet();
                    return;
                }
            }
            if (panelId === 'financial-sheet-overlay') {
                // 💰 Summon your financial shame
                if (typeof KeyBindings !== 'undefined' && KeyBindings.openFinancialSheet) {
                    KeyBindings.openFinancialSheet();
                    return;
                }
            }
            if (panelId === 'achievement-overlay' && typeof openAchievementPanel === 'function') {
                openAchievementPanel();
                return; // 🏆 Let achievements handle their own glory
            }
            // 🌙 For other active-class panels, just flip the switch
            if (panel) {
                panel.classList.add('active');
            }
        } else {
            // 💀 Reveal the panel from the shadows
            if (!panel) return;
            panel.classList.remove('hidden');
            panel.style.display = '';
            panel.style.visibility = '';
        }

        if (!panel) return;

        // 📚 Track this panel in our stack of chaos
        this.openPanels = this.openPanels.filter(id => id !== panelId);
        this.openPanels.push(panelId);

        // 🗡️ Bring this window to the fucking front
        panel.style.zIndex = 100 + this.openPanels.length;

        this.updateToolbarButtons();
        console.log(`🪟 Opened panel: ${panelId}, stack:`, this.openPanels);
    },

    // ⚰️ Banish a panel back to the void
    closePanel(panelId) {
        // 🖤 side-panel (Player Info) is ALWAYS visible - never close it
        if (panelId === 'side-panel') {
            console.log('🖤 side-panel is always visible - cannot close');
            return;
        }

        // ⚙️ Settings panel gets its own ceremonial closing
        if (panelId === 'settings-panel') {
            if (typeof SettingsPanel !== 'undefined' && SettingsPanel.hide) {
                SettingsPanel.hide();
            }
            this.openPanels = this.openPanels.filter(id => id !== panelId);
            this.updateToolbarButtons();
            return;
        }

        const panel = document.getElementById(panelId);
        if (!panel) return;

        const info = this.panelInfo[panelId];

        // 💀 Active-class panels need different dark magic
        if (info && info.useActiveClass) {
            panel.classList.remove('active');
            // 🖤 Overlays also need display:none to fully hide 💀
            panel.style.display = 'none';
            // 🖤 Some panels have special close rituals
            if (panelId === 'achievement-overlay' && typeof closeAchievementPanel === 'function') {
                closeAchievementPanel();
            }
        } else {
            // 🌙 Send normal panels into the hidden realm
            panel.classList.add('hidden');
        }

        // 📚 Erase this panel from our stack of open windows
        this.openPanels = this.openPanels.filter(id => id !== panelId);

        this.updateToolbarButtons();
        console.log(`🪟 Closed panel: ${panelId}, stack:`, this.openPanels);
    },

    // 🗡️ Kill the top panel in the stack - last in, first to fucking die
    closeTopPanel() {
        if (this.openPanels.length === 0) {
            console.log('🪟 No panels to close');
            return false;
        }

        const topPanelId = this.openPanels[this.openPanels.length - 1];
        this.closePanel(topPanelId);
        return true;
    },

    // Update toolbar button states
    updateToolbarButtons() {
        const buttons = document.querySelectorAll('.panel-toolbar-btn');
        buttons.forEach(btn => {
            const panelId = btn.dataset.panelId;
            const isOpen = this.isPanelOpen(panelId);

            if (isOpen) {
                btn.style.background = 'rgba(76, 175, 80, 0.3)';
                btn.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            } else {
                btn.style.background = 'rgba(79, 195, 247, 0.1)';
                btn.style.borderColor = 'rgba(79, 195, 247, 0.2)';
            }
        });
    },

    // 🏪 Update market button visibility in the Panels toolbar 💀
    // Only show market button when at Royal Capital
    updateMarketButtonVisibility(hasMarket) {
        const marketBtn = document.querySelector('.panel-toolbar-btn[data-panel-id="market-panel"]');
        if (marketBtn) {
            marketBtn.style.display = hasMarket ? 'flex' : 'none';
        }
    },

    // 🖤 Guard flag for ESC handler - prevent duplicate listeners 💀
    _escHandlerAttached: false,

    // Setup ESC key handler to close panels in order
    setupEscHandler() {
        // 🖤 Prevent duplicate ESC handlers 💀
        if (this._escHandlerAttached) return;
        this._escHandlerAttached = true;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // 🖤 Check if any panels are open BEFORE deciding to handle
                if (this.openPanels.length === 0) {
                    // No panels open - let the event bubble to open the menu
                    console.log('🪟 ESC: No panels open, letting menu handle it');
                    return; // Don't prevent default - let KeyBindings handle it
                }

                // There are panels open - close the top one
                e.preventDefault();
                e.stopPropagation();

                const closed = this.closeTopPanel();
                if (closed) {
                    console.log('🪟 ESC: Closed top panel');
                }
            }
        }, true); // Use capture to handle before other handlers
    },

    // 🖤 Store observer for cleanup 💀
    _panelObserver: null,

    // Observe panel changes to keep track of what's open
    observePanelChanges() {
        // 🦇 Disconnect existing observer before creating new one - no duplicates
        if (this._panelObserver) {
            this._panelObserver.disconnect();
        }

        this._panelObserver = new MutationObserver((mutations) => {
            let needsUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                     mutation.attributeName === 'style')) {
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                // Debounce updates
                clearTimeout(this._updateTimeout);
                this._updateTimeout = setTimeout(() => {
                    this.syncOpenPanels();
                    this.updateToolbarButtons();
                }, 100);
            }
        });

        // Observe all known panels
        Object.keys(this.panelInfo).forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                this._panelObserver.observe(panel, {
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
        });
    },

    // 🖤 Cleanup observer - call on destroy 💀
    disconnectObserver() {
        if (this._panelObserver) {
            this._panelObserver.disconnect();
            this._panelObserver = null;
        }
        clearTimeout(this._updateTimeout);

        // 🖤 Clean up toolbar drag handlers 💀
        if (this._toolbarDragHandlers.mousemove) {
            document.removeEventListener('mousemove', this._toolbarDragHandlers.mousemove);
        }
        if (this._toolbarDragHandlers.mouseup) {
            document.removeEventListener('mouseup', this._toolbarDragHandlers.mouseup);
        }
        this._toolbarDragHandlers = { mousedown: null, mousemove: null, mouseup: null };
    },

    // Sync openPanels array with actual DOM state
    syncOpenPanels() {
        const actuallyOpen = [];
        Object.keys(this.panelInfo).forEach(panelId => {
            if (this.isPanelOpen(panelId)) {
                // Keep the order from existing stack, or add to end
                if (this.openPanels.includes(panelId)) {
                    actuallyOpen.push(panelId);
                }
            }
        });

        // Add newly opened panels that weren't tracked
        Object.keys(this.panelInfo).forEach(panelId => {
            if (this.isPanelOpen(panelId) && !actuallyOpen.includes(panelId)) {
                actuallyOpen.push(panelId);
            }
        });

        this.openPanels = actuallyOpen;
    },

    // Show the panel toolbar (call when game starts)
    showToolbar() {
        const toolbar = document.getElementById('panel-toolbar');
        if (toolbar) {
            toolbar.style.display = 'block';
            console.log('🪟 PanelManager: Toolbar shown');
        }
    },

    // Hide the panel toolbar (call on start screen / game setup)
    hideToolbar() {
        const toolbar = document.getElementById('panel-toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
            console.log('🪟 PanelManager: Toolbar hidden');
        }
    },

    // Patch existing showPanel/hidePanel functions to work with manager
    patchPanelFunctions() {
        const self = this;

        // Patch global showPanel
        if (typeof window.showPanel === 'function') {
            const originalShow = window.showPanel;
            window.showPanel = function(panelId) {
                originalShow(panelId);
                self.openPanel(panelId);
            };
        }

        // Patch global hidePanel if exists
        if (typeof window.hidePanel === 'function') {
            const originalHide = window.hidePanel;
            window.hidePanel = function(panelId) {
                originalHide(panelId);
                self.closePanel(panelId);
            };
        }

        // Patch game.showOverlay if exists
        if (typeof game !== 'undefined' && game.showOverlay) {
            const originalShowOverlay = game.showOverlay.bind(game);
            game.showOverlay = function(panelId) {
                originalShowOverlay(panelId);
                self.openPanel(panelId);
            };
        }

        // Patch game.hideOverlay if exists
        if (typeof game !== 'undefined' && game.hideOverlay) {
            const originalHideOverlay = game.hideOverlay.bind(game);
            game.hideOverlay = function(panelId) {
                originalHideOverlay(panelId);
                self.closePanel(panelId);
            };
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => PanelManager.init(), 600);
    });
} else {
    setTimeout(() => PanelManager.init(), 600);
}

// Expose globally
window.PanelManager = PanelManager;
