// ═══════════════════════════════════════════════════════════════
// PANEL MANAGER - window state orchestration
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PanelManager = {
    // custom tooltip element for button hover
    _tooltipElement: null,
    // Stack of currently open panels (most recent last)
    openPanels: [],

    // safe toggle handlers registry - NO EVAL ALLOWED IN THIS REALM
    // Maps customToggle string names to actual functions
    // ALL handlers must be proper TOGGLE actions (open if closed, close if open)
    toggleHandlers: {
        'KeyBindings.openMenu()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openMenu?.(),
        'KeyBindings.openPeople()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openPeople?.(),
        'KeyBindings.openQuests()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openQuests?.(),
        'KeyBindings.openCharacterSheet()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openCharacterSheet?.(),
        'KeyBindings.openFinancialSheet()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openFinancialSheet?.(),
        'KeyBindings.openInventory()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openInventory?.(),
        'KeyBindings.openTravel()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openTravel?.(),
        'KeyBindings.openTransportation()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openTransportation?.(),
        'KeyBindings.openMarket()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openMarket?.(),
        'KeyBindings.openAchievements()': () => typeof KeyBindings !== 'undefined' && KeyBindings.openAchievements?.(),
        'QuestSystem.toggleQuestTracker()': () => typeof QuestSystem !== 'undefined' && QuestSystem.toggleQuestTracker?.(),
        'PartyPanel.togglePanel()': () => typeof PartyPanel !== 'undefined' && PartyPanel.togglePanel?.(),
        'toggleMarket()': () => typeof toggleMarket === 'function' ? toggleMarket() : (typeof KeyBindings !== 'undefined' && KeyBindings.openMarket?.()),
        'FactionSystem.toggleFactionPanel()': () => typeof FactionSystem !== 'undefined' && FactionSystem.toggleFactionPanel?.()
    },

    // All managed panel IDs and their info
    // order should match bottom action bar for consistency
    // ALL panels with customToggle use KeyBindings toggle functions for consistent behavior
    panelInfo: {
        'game-setup-panel': { name: 'New Game', icon: '🎮', shortcut: '' },
        'game-menu-overlay': { name: 'Menu', icon: '⚙️', shortcut: 'Escape', useActiveClass: true, customToggle: 'KeyBindings.openMenu()' },
        'market-panel': { name: 'Market', icon: '🏪', shortcut: 'M', customToggle: 'KeyBindings.openMarket()' },
        'travel-panel': { name: 'Travel', icon: '🗺️', shortcut: 'T', customToggle: 'KeyBindings.openTravel()' },
        'transportation-panel': { name: 'Transport', icon: '🐴', shortcut: 'W', customToggle: 'KeyBindings.openTransportation()' },
        'inventory-panel': { name: 'Inventory', icon: '🧺', shortcut: 'I', customToggle: 'KeyBindings.openInventory()' },
        'character-sheet-overlay': { name: 'Character', icon: '👤', shortcut: 'C', useActiveClass: true, customToggle: 'KeyBindings.openCharacterSheet()' },
        'people-panel': { name: 'People', icon: '👥', shortcut: 'P', customToggle: 'KeyBindings.openPeople()' },
        'party-panel': { name: 'Party', icon: '🤝', shortcut: 'Y', customToggle: 'PartyPanel.togglePanel()' },
        'financial-sheet-overlay': { name: 'Finances', icon: '💰', shortcut: 'F', useActiveClass: true, customToggle: 'KeyBindings.openFinancialSheet()' },
        'quest-overlay': { name: 'Quests', icon: '📜', shortcut: 'Q', customToggle: 'KeyBindings.openQuests()', useActiveClass: true },
        'achievement-overlay': { name: 'Achievements', icon: '🏆', shortcut: 'A', useActiveClass: true, customToggle: 'KeyBindings.openAchievements()' },
        'settings-panel': { name: 'Settings', icon: '⚙️', shortcut: ',' },
        'property-employee-panel': { name: 'Properties', icon: '🏠', shortcut: 'O', useActiveClass: true },
        'location-panel': { name: 'Location', icon: '📍', shortcut: '' },
        'side-panel': { name: 'Player Info', icon: '👤', shortcut: '' },
        'message-log': { name: 'Messages', icon: '💬', shortcut: '' },
        'help-overlay': { name: 'Help', icon: '❓', shortcut: '', useActiveClass: true },
        'quest-tracker': { name: 'Quest Tracker', icon: '📋', shortcut: '', customToggle: 'QuestSystem.toggleQuestTracker()' },
        'faction-panel': { name: 'Factions', icon: '🏛️', shortcut: 'R', customToggle: 'FactionSystem.toggleFactionPanel()' }
    },

    // panels that should NOT get close buttons (they have their own or are special)
    noCloseButtonPanels: [
        'panel-toolbar',      // The Panels panel itself
        'game-setup-panel',   // Has cancel button
        'location-panel',     // Core UI
        'side-panel',         // Core UI - player info
        'message-log',        // Core UI - can minimize
        'people-panel',       // Has its own controls
        'quest-tracker'       // Has its own minimize
    ],

    // wake the window watcher - begin tracking the chaos of panels
    init() {
        console.log('🪟 PanelManager: Initializing...');

        // ensure side-panel (Player Info) is ALWAYS visible - restore if hidden
        this.ensureCoreUIVisible();

        // build the command center for your window chaos
        this.createPanelToolbar();

        // arm the ESC key - your emergency exit from this madness
        this.setupEscHandler();

        // watch the panels like a paranoid fucking hawk
        this.observePanelChanges();

        // hijack the old panel functions - we run this show now
        this.patchPanelFunctions();

        // add close buttons to all appropriate panels
        this.addCloseButtonsToAllPanels();

        // cleanup observer on page unload to prevent memory leaks
        window.addEventListener('beforeunload', () => this.disconnectObserver());

        console.log('🪟 PanelManager: Ready');
    },

    // ensure core UI panels are always visible (side-panel, location-panel)
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

    // add X close button (top-right only) to panels that need it
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

            // add X button (top-right) - only one per panel
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

    // track toolbar orientation state
    isHorizontal: false,

    // create a toolbar with buttons to reopen panels - because you'll fucking close them all
    createPanelToolbar() {
        // don't double-summon this abomination
        if (document.getElementById('panel-toolbar')) return;

        const toolbar = document.createElement('div');
        toolbar.id = 'panel-toolbar';
        toolbar.innerHTML = `
            <div class="panel-toolbar-header">
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
            min-width: 50px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            display: none;
        `;

        // Z-index and dragging handled by makeToolbarDraggable which uses unified DraggablePanels system

        document.body.appendChild(toolbar);

        // paint this header with dark gradients and control-freak vibes
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

        // style collapse button
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

        // toggle horizontal/vertical orientation
        const titleSpan = toolbar.querySelector('.toolbar-title');
        rotateBtn.onclick = () => {
            this.isHorizontal = !this.isHorizontal;
            rotateBtn.style.transform = this.isHorizontal ? 'rotate(90deg)' : 'rotate(0deg)';

            if (this.isHorizontal) {
                // horizontal compact mode - thin bar across screen
                toolbar.style.top = '60px';
                toolbar.style.left = '50%';
                toolbar.style.right = 'auto';
                toolbar.style.transform = 'translateX(-50%)';
                toolbar.style.maxWidth = '95vw';

                header.style.borderRadius = '8px 8px 0 0';
                titleSpan.style.display = 'none'; // hide title in compact

                buttonsContainer.style.flexDirection = 'row';
                buttonsContainer.style.flexWrap = 'wrap';
                buttonsContainer.style.justifyContent = 'center';
                buttonsContainer.style.padding = '4px';
                buttonsContainer.style.gap = '2px';

                // make buttons icon-only in horizontal
                const btns = buttonsContainer.querySelectorAll('.panel-toolbar-btn');
                btns.forEach(btn => {
                    btn.style.padding = '6px 8px';
                    btn.style.minWidth = 'auto';
                    const label = btn.querySelector('.btn-label');
                    if (label) label.style.display = 'none';
                });
            } else {
                // vertical mode - restore normal
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

                // restore button labels
                const btns = buttonsContainer.querySelectorAll('.panel-toolbar-btn');
                btns.forEach(btn => {
                    btn.style.padding = '6px 10px';
                    const label = btn.querySelector('.btn-label');
                    if (label) label.style.display = '';
                });
            }
        };

        // make toolbar draggable using unified DraggablePanels system
        if (typeof DraggablePanels !== 'undefined') {
            DraggablePanels.makeDraggable(toolbar);
        }

        // Style buttons container
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
        `;

        // add buttons for main panels
        // order matches bottom action bar: Menu, Market, Travel, Transport, Inventory, Character, People, Finances, Quests, Achievements
        // Save/Load/Settings removed - access via Menu button
        const mainPanels = [
            'game-menu-overlay',      // ⚙️ Menu [ESC]
            'market-panel',           // 🏪 Market [M]
            'travel-panel',           // 🗺️ Travel [T]
            'transportation-panel',   // 🚗 Transport [W]
            'inventory-panel',        // 🎒 Inventory [I]
            'character-sheet-overlay', // 👤 Character [C]
            'people-panel',           // 👥 People [P]
            'party-panel',            // 🤝 Party [Y]
            'financial-sheet-overlay', // 💰 Finances [F]
            'quest-overlay',          // 📜 Quests [Q]
            'achievement-overlay',    // 🏆 Achievements [A]
            'faction-panel',          // 🏛️ Factions [R]
            'message-log',            // 💬 Messages
            'quest-tracker'           // 📋 Quest Tracker widget
        ];

        mainPanels.forEach(panelId => {
            const info = this.panelInfo[panelId];
            if (!info) return;

            const btn = document.createElement('button');
            btn.className = 'panel-toolbar-btn';
            btn.dataset.panelId = panelId;
            // Don't set title - we use custom tooltip on hover instead
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

            btn.onmouseenter = (e) => {
                btn.style.background = 'rgba(79, 195, 247, 0.3)';
                btn.style.borderColor = 'rgba(79, 195, 247, 0.5)';
                // reveal the hint on hover
                this.showButtonTooltip(btn, info.name, info.shortcut, e);
            };

            btn.onmouseleave = () => {
                const isOpen = this.isPanelOpen(panelId);
                btn.style.background = isOpen ? 'rgba(76, 175, 80, 0.3)' : 'rgba(79, 195, 247, 0.1)';
                btn.style.borderColor = isOpen ? 'rgba(76, 175, 80, 0.5)' : 'rgba(79, 195, 247, 0.2)';
                // dismiss the hint
                this.hideButtonTooltip();
            };

            // handle custom toggle functions (like QuestSystem.toggleQuestTracker)
            // uses safe registry lookup instead of eval() - no code injection here!
            if (info.customToggle && this.toggleHandlers[info.customToggle]) {
                btn.onclick = () => {
                    try {
                        this.toggleHandlers[info.customToggle]();
                    } catch (e) {
                        console.warn('🖤 Custom toggle failed:', e);
                    }
                };
            } else if (info.customToggle) {
                // unknown customToggle - warn but don't crash
                console.warn(`🖤 Unknown customToggle: ${info.customToggle} - add it to toggleHandlers registry`);
                btn.onclick = () => this.togglePanel(panelId);
            } else {
                btn.onclick = () => this.togglePanel(panelId);
            }

            buttonsContainer.appendChild(btn);
        });

        this.updateToolbarButtons();
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
            // check both active class AND display style - overlays use both
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

        // special handling for character/financial sheets - use KeyBindings toggle
        // these panels have their own toggle logic that handles create + open + close
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

    // summon a panel from the hidden depths
    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        const info = this.panelInfo[panelId];

        // settings panel is special - it has its own dark rituals
        if (panelId === 'settings-panel') {
            if (typeof SettingsPanel !== 'undefined' && SettingsPanel.show) {
                SettingsPanel.show();
            }
            return;
        }

        // some panels are built different - they use 'active' instead of hiding
        if (info && info.useActiveClass) {
            // dynamically created overlays need special召唤術
            if (panelId === 'character-sheet-overlay') {
                // invoke the character sheet through KeyBindings
                if (typeof KeyBindings !== 'undefined' && KeyBindings.openCharacterSheet) {
                    KeyBindings.openCharacterSheet();
                    return;
                }
            }
            if (panelId === 'financial-sheet-overlay') {
                // summon your financial shame
                if (typeof KeyBindings !== 'undefined' && KeyBindings.openFinancialSheet) {
                    KeyBindings.openFinancialSheet();
                    return;
                }
            }
            if (panelId === 'achievement-overlay' && typeof openAchievementPanel === 'function') {
                openAchievementPanel();
                return; // let achievements handle their own glory
            }
            // for other active-class panels, just flip the switch
            if (panel) {
                panel.classList.add('active');
            }
        } else {
            // reveal the panel from the shadows
            if (!panel) return;
            panel.classList.remove('hidden');
            panel.style.display = '';
            panel.style.visibility = '';
        }

        if (!panel) return;

        // track this panel in our stack of chaos
        this.openPanels = this.openPanels.filter(id => id !== panelId);
        this.openPanels.push(panelId);

        // Emit panel opened event for UIStateManager
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('panel:opened', { panelId });
        }

        // Also dispatch document event for tutorial ui_action tracking
        document.dispatchEvent(new CustomEvent('panel-opened', {
            detail: { panelId, action: `open_${panelId.replace('-panel', '')}` }
        }));

        // FIX: Also dispatch ui-action for quest system (works even outside tutorial mode)
        document.dispatchEvent(new CustomEvent('ui-action', {
            detail: { action: `open_${panelId.replace('-panel', '')}`, panelId }
        }));

        // delegate z-index to DraggablePanels instead of fighting with it
        if (typeof DraggablePanels !== 'undefined' && DraggablePanels.bringToFront) {
            DraggablePanels.bringToFront(panel);
        } else {
            // Fallback only if DraggablePanels not loaded yet
            panel.style.zIndex = 100 + this.openPanels.length;
        }

        this.updateToolbarButtons();
        console.log(`🪟 Opened panel: ${panelId}, stack:`, this.openPanels);
    },

    // banish a panel back to the void
    closePanel(panelId) {
        // side-panel (Player Info) is ALWAYS visible - never close it
        if (panelId === 'side-panel') {
            console.log('🖤 side-panel is always visible - cannot close');
            return;
        }

        // settings panel gets its own ceremonial closing
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

        // active-class panels need different dark magic
        if (info && info.useActiveClass) {
            panel.classList.remove('active');
            // overlays also need display:none to fully hide
            panel.style.display = 'none';
            // some panels have special close rituals
            if (panelId === 'achievement-overlay' && typeof closeAchievementPanel === 'function') {
                closeAchievementPanel();
            }
        } else {
            // send normal panels into the hidden realm
            panel.classList.add('hidden');
        }

        // erase this panel from our stack of open windows
        this.openPanels = this.openPanels.filter(id => id !== panelId);

        // Emit panel closed event for UIStateManager
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('panel:closed', { panelId });
        }

        this.updateToolbarButtons();
        console.log(`🪟 Closed panel: ${panelId}, stack:`, this.openPanels);
    },

    // kill the top panel in the stack - last in, first to fucking die
    closeTopPanel() {
        if (this.openPanels.length === 0) {
            console.log('🪟 No panels to close');
            return false;
        }

        const topPanelId = this.openPanels[this.openPanels.length - 1];
        this.closePanel(topPanelId);
        return true;
    },

    // refresh the button faces - update visual state to match reality
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

    // update market button visibility in the Panels toolbar
    // only show market button when at Royal Capital
    updateMarketButtonVisibility(hasMarket) {
        const marketBtn = document.querySelector('.panel-toolbar-btn[data-panel-id="market-panel"]');
        if (marketBtn) {
            marketBtn.style.display = hasMarket ? 'flex' : 'none';
        }
    },

    // guard flag for ESC handler - prevent duplicate listeners
    _escHandlerAttached: false,

    // Setup ESC key handler to close panels in order
    setupEscHandler() {
        // prevent duplicate ESC handlers
        if (this._escHandlerAttached) return;
        this._escHandlerAttached = true;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // 🔒 IGNORE Escape when typing in input fields (NPC chat, text inputs, etc.)
                const target = e.target;
                const isTyping = target.tagName === 'INPUT' ||
                                 target.tagName === 'TEXTAREA' ||
                                 target.isContentEditable ||
                                 target.closest('[contenteditable="true"]');
                if (isTyping) {
                    // Blur the input instead of closing panels
                    target.blur();
                    e.preventDefault();
                    return;
                }

                // Use UIStateManager's priority system if available
                if (typeof UIStateManager !== 'undefined') {
                    const action = UIStateManager.getEscAction();
                    if (action === 'modal') {
                        console.log('🪟 ESC: Modal priority, deferring to ModalSystem');
                        return; // Let ModalSystem's handler deal with it
                    }
                    if (action === 'dropdown') {
                        console.log('🪟 ESC: Dropdown open, letting dropdown handler close it');
                        return;
                    }
                    if (action === 'input') {
                        console.log('🪟 ESC: Input focused, blurring input');
                        document.activeElement?.blur?.();
                        e.preventDefault();
                        return;
                    }
                    if (action === 'panel') {
                        e.preventDefault();
                        e.stopPropagation();
                        const closed = this.closeTopPanel();
                        if (closed) {
                            console.log('🪟 ESC: Closed top panel');
                        }
                        return;
                    }
                    // action === 'menu' - let KeyBindings handle it
                    console.log('🪟 ESC: No panels open, letting menu handle it');
                    return;
                }

                // Fallback: original logic if UIStateManager not available
                if (typeof ModalSystem !== 'undefined' && ModalSystem.activeModals && ModalSystem.activeModals.size > 0) {
                    console.log('🪟 ESC: Modal open, deferring to ModalSystem');
                    return;
                }

                if (this.openPanels.length === 0) {
                    console.log('🪟 ESC: No panels open, letting menu handle it');
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                const closed = this.closeTopPanel();
                if (closed) {
                    console.log('🪟 ESC: Closed top panel');
                }
            }
        }, true); // Use capture to handle before other handlers
    },

    // store observer for cleanup
    _panelObserver: null,

    // Observe panel changes to keep track of what's open
    observePanelChanges() {
        // disconnect existing observer before creating new one - no duplicates
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
                // debounce updates with guard - no clearing null timeouts
                if (this._updateTimeout) {
                    clearTimeout(this._updateTimeout);
                    this._updateTimeout = null;
                }
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

    // cleanup observer - call on destroy
    // custom tooltip system for panel buttons
    // shows name + hotkey on hover - more visible than browser title
    showButtonTooltip(btn, name, shortcut, event) {
        if (!this._tooltipElement) {
            this._tooltipElement = document.createElement('div');
            this._tooltipElement.id = 'panel-btn-tooltip';
            this._tooltipElement.style.cssText = `
                position: fixed;
                background: rgba(20, 20, 30, 0.95);
                border: 1px solid rgba(79, 195, 247, 0.5);
                border-radius: 6px;
                padding: 6px 10px;
                color: #fff;
                font-size: 12px;
                font-family: 'Segoe UI', sans-serif;
                pointer-events: none;
                z-index: 100000;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
                opacity: 0;
                transition: opacity 0.15s ease;
            `;
            document.body.appendChild(this._tooltipElement);
        }

        // build tooltip content with name and optional hotkey
        let content = `<span style="color: #4fc3f7;">${name}</span>`;
        if (shortcut) {
            content += `<span style="margin-left: 8px; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 3px; color: #ffd700;">${shortcut.toUpperCase()}</span>`;
        }
        this._tooltipElement.innerHTML = content;

        // position tooltip below the button
        const rect = btn.getBoundingClientRect();
        this._tooltipElement.style.left = rect.left + 'px';
        this._tooltipElement.style.top = (rect.bottom + 8) + 'px';

        // make sure tooltip stays on screen
        requestAnimationFrame(() => {
            const tooltipRect = this._tooltipElement.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth - 10) {
                this._tooltipElement.style.left = (window.innerWidth - tooltipRect.width - 10) + 'px';
            }
            if (tooltipRect.bottom > window.innerHeight - 10) {
                // flip position - appear above instead
                this._tooltipElement.style.top = (rect.top - tooltipRect.height - 8) + 'px';
            }
            this._tooltipElement.style.opacity = '1';
        });
    },

    hideButtonTooltip() {
        if (this._tooltipElement) {
            this._tooltipElement.style.opacity = '0';
        }
    },

    disconnectObserver() {
        if (this._panelObserver) {
            this._panelObserver.disconnect();
            this._panelObserver = null;
        }
        clearTimeout(this._updateTimeout);
        // toolbar drag is now handled by unified DraggablePanels system
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

    // reveal the control strip - make the toolbar visible
    showToolbar() {
        const toolbar = document.getElementById('panel-toolbar');
        if (toolbar) {
            toolbar.style.display = 'block';
            console.log('🪟 PanelManager: Toolbar shown');
        }
    },

    // conceal the controls - hide the toolbar from view
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

// Expose globally
window.PanelManager = PanelManager;

// register with Bootstrap - required, early UI init
Bootstrap.register('PanelManager', () => PanelManager.init(), {
    dependencies: ['game'],
    priority: 90,
    severity: 'required'
});
