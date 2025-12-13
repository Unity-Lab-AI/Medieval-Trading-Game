// ═══════════════════════════════════════════════════════════════
// UI-STATE-MANAGER - one ring to rule them all
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// Session #81: Created to consolidate UI state management
// - Single source of truth for panel open/close state
// - Unified ESC key priority system
// - EventBus integration for state change notifications
// - localStorage persistence for UI preferences
// ═══════════════════════════════════════════════════════════════

const UIStateManager = {
    // ═══════════════════════════════════════════════════════════
    // STATE STRUCTURE
    // ═══════════════════════════════════════════════════════════
    state: {
        // Panel tracking - which panels are open, in stack order
        panels: {
            open: [],           // ordered stack of open panel IDs (most recent last)
            focused: null,      // currently focused panel ID
            lastClosed: null    // last closed panel (for undo)
        },
        // View navigation stack (LocationPanelStack integration)
        views: {
            stack: ['main'],    // current view stack
            current: 'main'     // convenience accessor
        },
        // UI preferences (persisted to localStorage)
        preferences: {
            panelToolbarPosition: { x: null, y: null },
            panelToolbarCollapsed: false,
            panelToolbarHorizontal: false,
            locationPanelCollapsed: false,
            questTrackerVisible: true,
            questTrackerPosition: { x: null, y: null }
        },
        // ESC handler priority tracking
        escPriority: {
            activeModal: false,     // modal open = highest priority
            activeDropdown: false,  // dropdown open = second priority
            activeInput: false      // focused input = third priority
        }
    },

    // localStorage key for UI state persistence
    STORAGE_KEY: 'mtg-ui-state',

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════
    init() {
        console.log('🖤 UIStateManager: Awakening from the void...');

        // Load persisted preferences
        this.loadPreferences();

        // Setup event listeners
        this.setupEventListeners();

        // Sync with existing state from PanelManager if present
        this.syncWithPanelManager();

        console.log('🖤 UIStateManager: Ready to control your panels');
    },

    // Load saved preferences from localStorage
    loadPreferences() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults, don't overwrite structure
                if (parsed.preferences) {
                    Object.assign(this.state.preferences, parsed.preferences);
                }
                console.log('🖤 UIStateManager: Loaded preferences from the depths');
            }
        } catch (e) {
            console.warn('🖤 UIStateManager: Failed to load preferences:', e);
        }
    },

    // Save preferences to localStorage
    savePreferences() {
        try {
            const toSave = {
                preferences: this.state.preferences,
                version: 1
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.warn('🖤 UIStateManager: Failed to save preferences:', e);
        }
    },

    // Setup event listeners for state changes
    setupEventListeners() {
        // Listen for panel events via EventBus
        if (typeof EventBus !== 'undefined') {
            EventBus.on('panel:opened', (data) => this.onPanelOpened(data));
            EventBus.on('panel:closed', (data) => this.onPanelClosed(data));
            EventBus.on('panel:focused', (data) => this.onPanelFocused(data));
            EventBus.on('modal:opened', () => this.setEscPriority('modal', true));
            EventBus.on('modal:closed', () => this.setEscPriority('modal', false));
            EventBus.on('dropdown:opened', () => this.setEscPriority('dropdown', true));
            EventBus.on('dropdown:closed', () => this.setEscPriority('dropdown', false));
        }

        // Track input focus for ESC priority
        document.addEventListener('focusin', (e) => {
            const isInput = e.target.matches('input, textarea, select, [contenteditable]');
            this.setEscPriority('input', isInput);
        });

        document.addEventListener('focusout', () => {
            // Small delay to check if we focused another input
            setTimeout(() => {
                const active = document.activeElement;
                const isInput = active && active.matches('input, textarea, select, [contenteditable]');
                this.setEscPriority('input', isInput);
            }, 10);
        });
    },

    // Sync initial state from PanelManager if it exists
    syncWithPanelManager() {
        if (typeof PanelManager !== 'undefined' && PanelManager.openPanels) {
            this.state.panels.open = [...PanelManager.openPanels];
        }
        if (typeof LocationPanelStack !== 'undefined' && LocationPanelStack.viewStack) {
            this.state.views.stack = [...LocationPanelStack.viewStack];
            this.state.views.current = LocationPanelStack.getCurrentView();
        }
    },

    // ═══════════════════════════════════════════════════════════
    // PANEL STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Track panel opening
    onPanelOpened(data) {
        const panelId = data?.panelId || data;
        if (!panelId) return;

        // Remove if already in stack (to re-add at top)
        this.state.panels.open = this.state.panels.open.filter(id => id !== panelId);
        this.state.panels.open.push(panelId);
        this.state.panels.focused = panelId;

        // Emit state change event
        this.emitStateChange('panels', { action: 'opened', panelId });
    },

    // Track panel closing
    onPanelClosed(data) {
        const panelId = data?.panelId || data;
        if (!panelId) return;

        this.state.panels.lastClosed = panelId;
        this.state.panels.open = this.state.panels.open.filter(id => id !== panelId);

        // Update focus to next panel in stack
        if (this.state.panels.focused === panelId) {
            this.state.panels.focused = this.state.panels.open[this.state.panels.open.length - 1] || null;
        }

        // Emit state change event
        this.emitStateChange('panels', { action: 'closed', panelId });
    },

    // Track panel focus
    onPanelFocused(data) {
        const panelId = data?.panelId || data;
        if (!panelId) return;

        this.state.panels.focused = panelId;

        // Move to top of stack
        this.state.panels.open = this.state.panels.open.filter(id => id !== panelId);
        this.state.panels.open.push(panelId);

        // Emit state change event
        this.emitStateChange('panels', { action: 'focused', panelId });
    },

    // Get list of open panels
    getOpenPanels() {
        return [...this.state.panels.open];
    },

    // Check if a specific panel is open
    isPanelOpen(panelId) {
        return this.state.panels.open.includes(panelId);
    },

    // Get the topmost panel
    getTopPanel() {
        return this.state.panels.open[this.state.panels.open.length - 1] || null;
    },

    // Get focused panel
    getFocusedPanel() {
        return this.state.panels.focused;
    },

    // ═══════════════════════════════════════════════════════════
    // VIEW STACK MANAGEMENT (LocationPanelStack integration)
    // ═══════════════════════════════════════════════════════════

    // Push a new view onto the stack
    pushView(viewName) {
        if (this.state.views.stack[this.state.views.stack.length - 1] !== viewName) {
            this.state.views.stack.push(viewName);
            this.state.views.current = viewName;
            this.emitStateChange('views', { action: 'pushed', view: viewName });
        }
    },

    // Pop the current view
    popView() {
        if (this.state.views.stack.length > 1) {
            const popped = this.state.views.stack.pop();
            this.state.views.current = this.state.views.stack[this.state.views.stack.length - 1];
            this.emitStateChange('views', { action: 'popped', view: popped });
        }
    },

    // Reset to main view
    resetViews() {
        this.state.views.stack = ['main'];
        this.state.views.current = 'main';
        this.emitStateChange('views', { action: 'reset' });
    },

    // Get current view
    getCurrentView() {
        return this.state.views.current;
    },

    // ═══════════════════════════════════════════════════════════
    // ESC KEY PRIORITY MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Set ESC priority flag
    setEscPriority(type, active) {
        switch (type) {
            case 'modal':
                this.state.escPriority.activeModal = active;
                break;
            case 'dropdown':
                this.state.escPriority.activeDropdown = active;
                break;
            case 'input':
                this.state.escPriority.activeInput = active;
                break;
        }
    },

    // Determine what ESC should do based on current state
    // Returns: 'modal' | 'dropdown' | 'panel' | 'input' | 'menu' | null
    getEscAction() {
        // Priority order:
        // 1. Modal open = close modal
        // 2. Dropdown open = close dropdown
        // 3. Input focused = blur input
        // 4. Panel open = close top panel
        // 5. Nothing = open menu

        if (this.state.escPriority.activeModal) {
            return 'modal';
        }
        if (this.state.escPriority.activeDropdown) {
            return 'dropdown';
        }
        if (this.state.escPriority.activeInput) {
            return 'input';
        }
        if (this.state.panels.open.length > 0) {
            return 'panel';
        }
        return 'menu';
    },

    // Check if ESC should be handled by panels
    shouldPanelHandleEsc() {
        const action = this.getEscAction();
        return action === 'panel';
    },

    // ═══════════════════════════════════════════════════════════
    // PREFERENCES MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Get a preference value
    getPreference(key) {
        return this.state.preferences[key];
    },

    // Set a preference value
    setPreference(key, value) {
        if (key in this.state.preferences) {
            this.state.preferences[key] = value;
            this.savePreferences();
            this.emitStateChange('preferences', { key, value });
        }
    },

    // Update panel toolbar position
    setPanelToolbarPosition(x, y) {
        this.state.preferences.panelToolbarPosition = { x, y };
        this.savePreferences();
    },

    // Update quest tracker visibility
    setQuestTrackerVisible(visible) {
        this.state.preferences.questTrackerVisible = visible;
        this.savePreferences();
    },

    // Update location panel collapsed state
    setLocationPanelCollapsed(collapsed) {
        this.state.preferences.locationPanelCollapsed = collapsed;
        this.savePreferences();
    },

    // ═══════════════════════════════════════════════════════════
    // EVENT EMISSION
    // ═══════════════════════════════════════════════════════════

    // Emit state change event via EventBus
    emitStateChange(category, data) {
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('ui:state:changed', {
                category,
                ...data,
                timestamp: Date.now()
            });
        }
    },

    // ═══════════════════════════════════════════════════════════
    // DEBUGGING
    // ═══════════════════════════════════════════════════════════

    // Get full state for debugging
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    },

    // Log current state
    logState() {
        console.log('🖤 UIStateManager State:', this.getState());
    }
};

// Expose globally
window.UIStateManager = UIStateManager;

// register with Bootstrap - depends on PanelManager now
Bootstrap.register('UIStateManager', () => UIStateManager.init(), {
    dependencies: ['PanelManager'],
    priority: 92,
    severity: 'optional'
});
