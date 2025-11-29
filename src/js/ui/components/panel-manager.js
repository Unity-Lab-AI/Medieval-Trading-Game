// ═══════════════════════════════════════════════════════════════
// 🪟 PANEL MANAGER - herding cats but the cats are floating windows
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// handles panel open/close order, ESC key navigation, and reopen buttons
// keeping track of all the chaos you've opened

const PanelManager = {
    // Stack of currently open panels (most recent last)
    openPanels: [],

    // All managed panel IDs and their info
    panelInfo: {
        'market-panel': { name: 'Market', icon: '🏪', shortcut: 'M' },
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

    // Initialize panel manager
    init() {
        console.log('🪟 PanelManager: Initializing...');

        // 🎨 Build the command center for your window chaos
        this.createPanelToolbar();

        // 🗡️ Arm the ESC key - your emergency exit from this madness
        this.setupEscHandler();

        // 👁️ Watch the panels like a paranoid fucking hawk
        this.observePanelChanges();

        // 🔮 Hijack the old panel functions - we run this show now
        this.patchPanelFunctions();

        console.log('🪟 PanelManager: Ready');
    },

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
            'side-panel',
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
            if (info.customToggle) {
                btn.onclick = () => {
                    try {
                        eval(info.customToggle);
                    } catch (e) {
                        console.warn('🖤 Custom toggle failed:', e);
                    }
                };
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

        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('toolbar-collapse')) return;
            isDragging = true;
            offsetX = e.clientX - toolbar.getBoundingClientRect().left;
            offsetY = e.clientY - toolbar.getBoundingClientRect().top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            toolbar.style.left = (e.clientX - offsetX) + 'px';
            toolbar.style.top = (e.clientY - offsetY) + 'px';
            toolbar.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
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
            return panel.classList.contains('active');
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

        // Special handling for dynamically created panels that may not exist yet
        if (!panel) {
            // If it's a dynamically created panel, try to open it (which will create it)
            if (panelId === 'character-sheet-overlay' || panelId === 'financial-sheet-overlay') {
                console.log(`🪟 Panel ${panelId} not found, attempting to create it...`);
                this.openPanel(panelId);
                return;
            }
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

    // Setup ESC key handler to close panels in order
    setupEscHandler() {
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

    // Observe panel changes to keep track of what's open
    observePanelChanges() {
        const observer = new MutationObserver((mutations) => {
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
                observer.observe(panel, {
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
        });
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
