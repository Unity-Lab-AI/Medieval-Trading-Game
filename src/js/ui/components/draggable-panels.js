// ═══════════════════════════════════════════════════════════════
// DRAGGABLE PANELS - drag and drop system for UI panels
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const DraggablePanels = {
    dragState: null,
    STORAGE_KEY: 'trader-claude-panel-positions',
    eventsSetup: false,
    _questTrackerRetries: 0,

    // Panel focus system - dynamic z-index within gameplay panel range (100-199)
    // Higher values = more recently focused = on top
    Z_INDEX_BASE: 100,      // Minimum z-index for gameplay panels
    Z_INDEX_MAX: 199,       // Maximum z-index for gameplay panels (below tooltips at 200)
    panelStack: [],         // Array of panel IDs in focus order (last = topmost)

    // Panels excluded from dynamic z-index (they have fixed z-index above all gameplay panels)
    // These are modals, settings, and critical overlays that must always be on top
    excludeFromZIndexStack: [
        'settings-panel',
        'npc-chat-modal',
        'combat-modal',
        'main-menu',
        'loading-screen',
        'game-setup-panel',
        'debooger-console',
        'exploration-panel',
        'exploration-overlay'
    ],

    // Map of panel IDs/classes to their drag handle selectors
    // If not listed, will try common header selectors
    panelDragHandles: {
        'market-panel': '.market-header',
        'travel-panel': '.travel-header',
        'game-setup-panel': '.setup-header',
        'inventory-panel': '.inventory-header, h2, h3',
        'side-panel': '.player-section, .player-name-gold-row',
        'message-log': 'h3',
        'quest-tracker': '.tracker-header',
        'panel-toolbar': '.panel-toolbar-header',
        'character-sheet-overlay': '.character-header, h2',
        'quest-overlay': '.quest-header, h2',
        'achievement-overlay': '.achievement-header, h2',
        'financial-sheet-overlay': '.financial-header, h2',
        'property-employee-panel': '.property-header, h2',
        'people-panel': '.people-header, .npc-name-header, h2, h3',
        'transportation-panel': '.transportation-header, h2',
        'settings-panel': '.settings-header, h2',
        'quest-info-panel': '.quest-info-header, .quest-new-header, h3',
        'faction-panel': '.faction-panel-header, h3',
        'exploration-panel': '.exploration-header, .exploration-drag-handle'
    },

    // Overlays that can be closed by clicking outside (non-essential popups)
    // Excludes: settings, NPC chat (response needed), combat, game setup
    clickOutsideCloseableOverlays: [
        'achievement-overlay',
        'character-sheet-overlay',
        'quest-overlay',
        'financial-sheet-overlay',
        'inventory-overlay',
        'market-overlay',
        'world-map-overlay',
        'travel-progress-overlay',
        'people-panel',
        'random-event-panel',
        'leaderboard-overlay',
        'help-overlay'
    ],

    init() {
        console.log('🖤 DraggablePanels: Initializing (drag-only mode)...');

        // Inject CSS to let JS control z-index for all draggable panels
        this.injectZIndexOverrideStyles();

        // Migrate message-log position if it's in the "bad zone" (overlapping action bar)
        this.migrateMessageLogPosition();

        // arm the drag handlers
        this.setupGlobalEvents();

        // enable click-away dismissal for overlays
        this.setupClickOutsideClose();

        // make every panel draggable
        this.setupAllDraggables();

        // Observe for new panels
        this.observePanelChanges();

        // Load saved positions
        this.loadPositions();

        console.log('🖤 DraggablePanels: Ready');
    },

    // Inject CSS - base z-index for panels, JS overrides with inline styles
    injectZIndexOverrideStyles() {
        // No injected CSS needed - we set z-index directly on elements with !important
        // This avoids CSS specificity wars
        console.log('🖤 DraggablePanels: Using inline z-index (no CSS injection)');
    },

    // Setup click-outside-to-close for overlay panels
    setupClickOutsideClose() {
        document.addEventListener('mousedown', (e) => {
            // Find if we clicked on an overlay backdrop (not the content)
            const clickedOverlay = e.target.closest('.overlay, .achievement-overlay, .leaderboard-overlay, .overlay-panel');

            if (!clickedOverlay) return;

            // Check if we clicked directly on the overlay backdrop (not inner content)
            const clickedOnBackdrop = e.target === clickedOverlay ||
                                      e.target.classList.contains('overlay') ||
                                      e.target.classList.contains('achievement-overlay') ||
                                      e.target.classList.contains('leaderboard-overlay');

            if (!clickedOnBackdrop) return;

            // Get overlay ID
            const overlayId = clickedOverlay.id;
            if (!overlayId) return;

            // Check if this overlay should close on outside click
            if (!this.clickOutsideCloseableOverlays.includes(overlayId)) return;

            // Check if overlay is actually visible
            const isVisible = clickedOverlay.classList.contains('active') ||
                             (clickedOverlay.style.display !== 'none' && !clickedOverlay.classList.contains('hidden'));

            if (!isVisible) return;

            // dismiss it back to the void
            this.closeOverlay(overlayId);
        });
    },

    // Close an overlay by ID using appropriate method
    closeOverlay(overlayId) {
        console.log(`🖤 Closing overlay via click-outside: ${overlayId}`);

        // Special close functions for specific overlays
        if (overlayId === 'achievement-overlay' && typeof closeAchievementPanel === 'function') {
            closeAchievementPanel();
            return;
        }
        if (overlayId === 'leaderboard-overlay') {
            if (typeof SaveUISystem !== 'undefined' && SaveUISystem.closeHallOfChampions) {
                SaveUISystem.closeHallOfChampions();
            } else if (typeof closeLeaderboardPanel === 'function') {
                closeLeaderboardPanel();
            }
            return;
        }
        if (overlayId === 'people-panel' && typeof PeoplePanel !== 'undefined') {
            PeoplePanel.hide();
            return;
        }
        if (overlayId === 'random-event-panel' && typeof RandomEventPanel !== 'undefined') {
            RandomEventPanel.hide();
            return;
        }

        // Generic close via PanelManager
        if (typeof PanelManager !== 'undefined' && PanelManager.closePanel) {
            PanelManager.closePanel(overlayId);
            return;
        }

        // Fallback: hide directly
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    },

    // Bring a panel to the front of the stack (highest z-index in gameplay range)
    bringToFront(element) {
        if (!element) return;

        const panelId = element.id || element.className.split(' ')[0];
        if (!panelId) return;

        // Skip excluded panels - they have fixed z-index above all gameplay panels
        if (this.excludeFromZIndexStack.includes(panelId)) {
            return;
        }

        // Remove from current position in stack (if present)
        const existingIndex = this.panelStack.indexOf(panelId);
        if (existingIndex !== -1) {
            this.panelStack.splice(existingIndex, 1);
        }

        // Add to top of stack
        this.panelStack.push(panelId);

        // Reassign z-indices to all tracked panels
        this.updateAllPanelZIndices();
    },

    // reorganize the layers - stack windows by focus order
    // Lower index = lower z-index (buried), higher index = higher z-index (on top)
    updateAllPanelZIndices() {
        const maxPanels = this.Z_INDEX_MAX - this.Z_INDEX_BASE;

        // If we have more panels than our range allows, compress the stack
        if (this.panelStack.length > maxPanels) {
            this.panelStack = this.panelStack.slice(-maxPanels);
        }

        // Assign z-indices based on stack position
        // Index 0 = bottom (lowest z-index), last index = top (highest z-index)
        this.panelStack.forEach((panelId, index) => {
            // Try multiple ways to find the element
            let panel = document.getElementById(panelId);
            if (!panel) panel = document.querySelector(`.${panelId}`);
            if (!panel) panel = document.querySelector(`[class*="${panelId}"]`);

            if (panel) {
                const zIndex = this.Z_INDEX_BASE + index;
                // Force the z-index with both methods
                panel.style.setProperty('--dynamic-z-index', String(zIndex));
                panel.style.setProperty('z-index', String(zIndex), 'important');
            }
        });
    },

    // wire the focus trap - clicking brings window to front
    setupPanelFocus(element) {
        if (!element || element.dataset.focusSetup) return;

        element.dataset.focusSetup = 'true';

        const panelId = element.id || element.className.split(' ')[0];

        // Skip excluded panels - they have fixed z-index above all gameplay panels
        if (this.excludeFromZIndexStack.includes(panelId)) {
            return;
        }

        // Use mousedown for immediate response (before drag starts)
        element.addEventListener('mousedown', (e) => {
            this.bringToFront(element);
        }, true); // Use capture to get event first

        element.addEventListener('touchstart', (e) => {
            this.bringToFront(element);
        }, { passive: true, capture: true });

        // Add to stack if not present
        if (panelId && !this.panelStack.includes(panelId)) {
            this.panelStack.push(panelId);
            const zIndex = this.Z_INDEX_BASE + this.panelStack.length - 1;
            element.style.setProperty('--dynamic-z-index', String(zIndex));
            element.style.setProperty('z-index', String(zIndex), 'important');
        }
    },

    // 🖤💀 Clear message-log position if saved too close to bottom (overlaps action bar) 💀
    migrateMessageLogPosition() {
        try {
            const positions = this.getAllPositions();
            if (positions['message-log']) {
                const pos = positions['message-log'];
                // If saved in bottom 70px zone (overlaps with bottom-action-bar), reset it
                const viewportHeight = window.innerHeight;
                const savedTop = pos.topPercent !== undefined
                    ? (pos.topPercent / 100) * viewportHeight
                    : parseInt(pos.top) || 0;

                // If bottom of message-log would be in the action bar zone, clear it
                // Message-log is ~220px tall, action bar is at bottom 60px
                const estimatedBottom = viewportHeight - savedTop - 220;
                if (estimatedBottom < 70) {
                    delete positions['message-log'];
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(positions));
                    console.log('🖤 Migrated message-log position (was overlapping action bar)');
                }
            }
        } catch (e) {
            // Ignore migration errors
        }
    },

    setupGlobalEvents() {
        // 🖤 No more always-on listeners - we add/remove during drag only 💀
        // This prevents 60fps mousemove events when nobody's dragging
        if (this.eventsSetup) return;

        // 🦇 Store bound handlers so we can remove them later
        this._onDragHandler = (e) => this.onDrag(e);
        this._endDragHandler = () => this.endDrag();

        this.eventsSetup = true;
    },

    // 🖤 Add listeners when drag starts - remove when drag ends 💀
    _addDragListeners() {
        document.addEventListener('mousemove', this._onDragHandler);
        document.addEventListener('mouseup', this._endDragHandler);
        document.addEventListener('touchmove', this._onDragHandler, { passive: false });
        document.addEventListener('touchend', this._endDragHandler);
    },

    _removeDragListeners() {
        document.removeEventListener('mousemove', this._onDragHandler);
        document.removeEventListener('mouseup', this._endDragHandler);
        document.removeEventListener('touchmove', this._onDragHandler);
        document.removeEventListener('touchend', this._endDragHandler);
    },

    setupAllDraggables() {
        // Setup all panels with .panel class
        document.querySelectorAll('.panel').forEach(panel => {
            this.makeDraggable(panel);
        });

        // Setup overlays
        document.querySelectorAll('.overlay').forEach(overlay => {
            this.makeDraggable(overlay);
        });

        // Setup specific elements
        const specificElements = [
            'side-panel',
            'message-log',
            'panel-toolbar'
        ];

        // 🖤💀 Also setup quest tracker if it exists
        const questTracker = document.querySelector('.quest-tracker');
        if (questTracker && !questTracker.dataset.draggableSetup) {
            this.makeDraggable(questTracker);
            questTracker.dataset.draggableSetup = 'true';
        }

        specificElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) this.makeDraggable(el);
        });

        // Setup quest tracker separately (may load late)
        this.setupQuestTracker();
    },

    setupQuestTracker() {
        const questTracker = document.querySelector('.quest-tracker');
        if (!questTracker) {
            // 🖤 Prevent infinite retry loop - max 10 attempts 💀
            this._questTrackerRetries++;
            if (this._questTrackerRetries >= 10) {
                console.warn('🖤 Quest tracker not found after 10 retries - giving up 💀');
                return;
            }
            setTimeout(() => this.setupQuestTracker(), 1000);
            return;
        }

        // 🖤 Reset retry counter on success 💀
        this._questTrackerRetries = 0;

        // FIX: Use full makeDraggable to ensure quest tracker participates in z-index stacking
        // Previously only called attachDragEvents which skipped setupPanelFocus!
        if (questTracker.dataset.draggable === 'true') {
            // Already draggable, but ensure focus is set up too
            if (!questTracker.dataset.focusSetup) {
                this.setupPanelFocus(questTracker);
                console.log('🖤 Quest tracker focus enabled (late setup)');
            }
            return;
        }

        // Use full makeDraggable which includes setupPanelFocus
        this.makeDraggable(questTracker);
        console.log('🖤 Quest tracker fully enabled (drag + focus z-index)');
    },

    // 🖤 Main function - makes a panel draggable by its header
    // NO auto-generated headers or buttons!
    makeDraggable(element) {
        if (!element || element.dataset.draggable === 'true') return;
        element.dataset.draggable = 'true';

        // Setup click-to-focus for panel stacking
        this.setupPanelFocus(element);

        // Find the drag handle (header element)
        const handle = this.findDragHandle(element);
        if (!handle) {
            console.log('🖤 No drag handle found for:', element.id || element.className);
            return;
        }

        // Style the handle as draggable
        handle.style.cursor = 'move';
        handle.style.userSelect = 'none';

        // Attach drag events
        this.attachDragEvents(handle, element);

        console.log('🖤 Drag enabled for:', element.id || element.className);
    },

    // 🦇 Find the appropriate drag handle for a panel
    findDragHandle(element) {
        // 🖤 Check specific mapping first - by ID
        let selectorList = this.panelDragHandles[element.id];

        // 🖤💀 Also check by class name (e.g., 'quest-tracker')
        if (!selectorList && element.classList) {
            for (const className of element.classList) {
                if (this.panelDragHandles[className]) {
                    selectorList = this.panelDragHandles[className];
                    break;
                }
            }
        }

        if (selectorList) {
            const selectors = selectorList.split(',').map(s => s.trim());
            for (const selector of selectors) {
                const handle = element.querySelector(selector);
                if (handle) return handle;
            }
        }

        // Try common header patterns
        const commonSelectors = [
            '.panel-header',
            '.modal-header',
            '.overlay-header',
            '.tracker-header', // 🖤 Quest tracker header
            'header',
            'h2',
            'h3'
        ];

        for (const selector of commonSelectors) {
            const handle = element.querySelector(selector);
            if (handle) return handle;
        }

        return null;
    },

    // 🖤 Attach drag events to a handle
    attachDragEvents(handle, element) {
        const self = this;

        // Skip if already has drag events attached (prevents duplicates without cloning)
        // NOTE: We do NOT clone the handle anymore - cloning destroys onclick handlers
        // set up by other systems (like panel-manager's minimize/rotate buttons)
        if (handle.dataset.dragEventsAttached === 'true') return;
        handle.dataset.dragEventsAttached = 'true';

        handle.addEventListener('mousedown', function(e) {
            // Don't drag if clicking buttons or inputs
            if (e.target.closest('button, input, select, .panel-close-x, .panel-close-btn, .toolbar-collapse, .toolbar-rotate')) return;
            e.preventDefault();
            e.stopPropagation();
            self.startDrag(e, element);
        }, true);

        handle.addEventListener('touchstart', function(e) {
            if (e.target.closest('button, input, select, .panel-close-x, .panel-close-btn, .toolbar-collapse, .toolbar-rotate')) return;
            e.preventDefault();
            e.stopPropagation();
            self.startDrag(e, element);
        }, { passive: false, capture: true });
    },

    startDrag(e, element) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = element.getBoundingClientRect();

        // Move to body if needed for proper fixed positioning
        if (element.parentElement?.id === 'ui-panels') {
            element.dataset.originalParent = 'ui-panels';
            document.body.appendChild(element);
        }

        // Set fixed position at current location
        element.style.position = 'fixed';
        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.transform = 'none';
        element.style.margin = '0';
        // Use temporary high z-index during drag (within safe range, below tooltips)
        element.style.setProperty('--dynamic-z-index', String(this.Z_INDEX_MAX));
        element.style.setProperty('z-index', String(this.Z_INDEX_MAX), 'important');

        // 🖤 Cache width/height here - no getBoundingClientRect() spam in onDrag()
        // This prevents layout thrashing during drag operations 💀
        this.dragState = {
            element,
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top,
            width: rect.width,    // Cached for onDrag()
            height: rect.height,  // Cached for onDrag()
            maxX: window.innerWidth,
            maxY: window.innerHeight
        };

        element.classList.add('dragging');

        // 🦇 NOW we add the listeners - only when actually dragging
        this._addDragListeners();
    },

    onDrag(e) {
        if (!this.dragState) return;

        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // 🖤 Use cached values - no reflow spam in this realm
        const { element, offsetX, offsetY, width, height, maxX, maxY } = this.dragState;

        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Keep within viewport using CACHED dimensions - no getBoundingClientRect() 💀
        newX = Math.max(0, Math.min(newX, maxX - width));
        newY = Math.max(0, Math.min(newY, maxY - height));

        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    },

    endDrag() {
        if (!this.dragState) return;

        const { element } = this.dragState;
        element.classList.remove('dragging');

        // Bring panel to front of stack after drag completes
        this.bringToFront(element);

        // Mark that user has manually dragged this panel - prevents auto-repositioning
        element.dataset.userDragged = 'true';

        this.savePosition(element);
        this.dragState = null;

        // Remove listeners - no more mousemove spam until next drag
        this._removeDragListeners();
    },

    observePanelChanges() {
        // 🖤 Disconnect old observer if it exists - no zombie watchers 💀
        if (this._panelObserver) {
            this._panelObserver.disconnect();
        }

        this._panelObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            // Check for panels, overlays, toolbar, and quest tracker
                            const isPanel = node.classList?.contains('panel') || node.classList?.contains('overlay');
                            const isToolbar = node.id === 'panel-toolbar';
                            const isQuestTracker = node.classList?.contains('quest-tracker');
                            if (isPanel || isToolbar || isQuestTracker) {
                                setTimeout(() => this.makeDraggable(node), 100);
                            }
                        }
                    });
                }
            });
        });

        this._panelObserver.observe(document.body, { childList: true, subtree: true });

        // 🦇 Clean up on page unload - no memory leaks in my realm
        window.addEventListener('beforeunload', () => this.disconnectObserver());
    },

    // 🖤 Call this to stop watching for new panels 💀
    disconnectObserver() {
        if (this._panelObserver) {
            this._panelObserver.disconnect();
            this._panelObserver = null;
        }
    },

    // 🖤 Save position as PERCENTAGE of viewport for responsive behavior 💀
    savePosition(element) {
        const id = element.id;
        if (!id) return;

        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Store as percentages so positions scale with viewport
        const positions = this.getAllPositions();
        positions[id] = {
            leftPercent: (rect.left / viewportWidth) * 100,
            topPercent: (rect.top / viewportHeight) * 100,
            // Also store last known viewport size for migration
            savedViewportWidth: viewportWidth,
            savedViewportHeight: viewportHeight
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(positions));
        } catch (e) {}
    },

    getAllPositions() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    },

    // 🖤 Convert percentage position to constrained pixel position 💀
    getConstrainedPosition(leftPercent, topPercent, elementWidth, elementHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Convert percentage to pixels
        let left = (leftPercent / 100) * viewportWidth;
        let top = (topPercent / 100) * viewportHeight;

        // Constrain to viewport with 20px margin
        const margin = 20;
        const minVisible = 50; // At least 50px of panel must be visible

        // Ensure panel stays within viewport bounds
        left = Math.max(margin, Math.min(left, viewportWidth - minVisible));
        top = Math.max(margin, Math.min(top, viewportHeight - minVisible));

        return { left, top };
    },

    loadPositions() {
        const positions = this.getAllPositions();

        Object.keys(positions).forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            const pos = positions[id];

            // 🖤 Handle both old (pixel) and new (percentage) format 💀
            if (pos.leftPercent !== undefined && pos.topPercent !== undefined) {
                // New percentage-based format
                const rect = element.getBoundingClientRect();
                const constrained = this.getConstrainedPosition(
                    pos.leftPercent,
                    pos.topPercent,
                    rect.width || 300,
                    rect.height || 200
                );

                if (element.parentElement?.id === 'ui-panels') {
                    document.body.appendChild(element);
                }

                element.style.position = 'fixed';
                element.style.left = constrained.left + 'px';
                element.style.top = constrained.top + 'px';
                element.style.right = 'auto';
                element.style.bottom = 'auto';
                element.style.transform = 'none';
                element.style.margin = '0';
            } else if (pos.left && pos.top) {
                // Legacy pixel format - migrate to percentage
                if (element.parentElement?.id === 'ui-panels') {
                    document.body.appendChild(element);
                }

                element.style.position = 'fixed';
                element.style.left = pos.left;
                element.style.top = pos.top;
                element.style.right = 'auto';
                element.style.bottom = 'auto';
                element.style.transform = 'none';
                element.style.margin = '0';

                // Re-save in new format
                this.savePosition(element);
            }
        });

        // 🖤 Setup resize handler to keep panels visible 💀
        this.setupResizeHandler();
    },

    // 🖤 Handle window resize - keep all panels within viewport 💀
    setupResizeHandler() {
        if (this._resizeHandlerSetup) return;
        this._resizeHandlerSetup = true;

        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.constrainAllPanels(), 100);
        });
    },

    // 🖤💀 Ensure ALL panels stay within viewport after resize - not just manually dragged ones 💀
    constrainAllPanels() {
        const positions = this.getAllPositions();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 20;
        const minVisible = 50;

        // 🦇 First, handle manually-dragged panels (from saved positions)
        Object.keys(positions).forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;
            const computedStyle = getComputedStyle(element);
            if (computedStyle.position !== 'fixed') return;

            this._constrainSinglePanel(element, viewportWidth, viewportHeight, margin, minVisible, true);
        });

        // 🖤💀 ALSO check ALL fixed-position panels, even if not manually dragged
        // This prevents CSS-default panels from going off-screen on resize
        const fixedPanels = document.querySelectorAll('.quest-tracker, #message-log, #side-panel, .panel, .overlay');
        fixedPanels.forEach(element => {
            if (!element) return;
            const computedStyle = getComputedStyle(element);
            if (computedStyle.position !== 'fixed') return;
            if (element.classList.contains('hidden') || computedStyle.display === 'none') return;

            this._constrainSinglePanel(element, viewportWidth, viewportHeight, margin, minVisible, false);
        });
    },

    // 🖤 Constrain a single panel to viewport bounds 💀
    _constrainSinglePanel(element, viewportWidth, viewportHeight, margin, minVisible, saveAfter) {
        const rect = element.getBoundingClientRect();

        // Check if panel is outside viewport
        let needsUpdate = false;
        let newLeft = rect.left;
        let newTop = rect.top;

        // Panel too far right - bring it back
        if (rect.left > viewportWidth - minVisible) {
            newLeft = viewportWidth - rect.width - margin;
            needsUpdate = true;
        }
        // Panel too far left
        if (rect.right < minVisible) {
            newLeft = margin;
            needsUpdate = true;
        }
        // Panel too far down
        if (rect.top > viewportHeight - minVisible) {
            newTop = viewportHeight - rect.height - margin;
            needsUpdate = true;
        }
        // Panel too far up
        if (rect.bottom < minVisible) {
            newTop = margin;
            needsUpdate = true;
        }

        if (needsUpdate) {
            // 🖤💀 ALWAYS reposition if panel is outside viewport - no more lost panels! 🦇
            // Even CSS-based panels get repositioned to stay visible on resize
            element.style.position = 'fixed';
            element.style.left = Math.max(margin, newLeft) + 'px';
            element.style.top = Math.max(margin, newTop) + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';

            // Save new position for manually dragged panels or panels we've repositioned
            if (saveAfter || element.dataset.userDragged === 'true') {
                this.savePosition(element);
            }
        }
    },

    resetPositions() {
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    },

    // 🖤 Force refresh all panel z-indices - call when panels get out of sync 💀
    refreshAllZIndices() {
        console.log('🖤 Force refreshing all panel z-indices...');

        // Find all draggable panels that should participate in z-index stacking
        const allPanels = document.querySelectorAll(
            '.quest-tracker, #quest-tracker, #message-log, #side-panel, .panel:not(.hidden), .overlay:not(.hidden)'
        );

        allPanels.forEach(panel => {
            // Skip excluded panels
            const panelId = panel.id || panel.className.split(' ')[0];
            if (this.excludeFromZIndexStack.includes(panelId)) return;
            if (panel.style.display === 'none') return;

            // Ensure panel is in the stack
            if (panelId && !this.panelStack.includes(panelId)) {
                this.panelStack.push(panelId);
            }

            // Ensure focus is set up
            if (!panel.dataset.focusSetup) {
                this.setupPanelFocus(panel);
            }
        });

        // Update all z-indices
        this.updateAllPanelZIndices();
        console.log(`🖤 Refreshed z-indices for ${this.panelStack.length} panels:`, this.panelStack);
    },

    // DEBUG: Force bring a specific panel to front by ID or class
    forceBringToFront(idOrClass) {
        let panel = document.getElementById(idOrClass);
        if (!panel) panel = document.querySelector(`.${idOrClass}`);
        if (!panel) panel = document.querySelector(idOrClass);

        if (!panel) {
            console.log(`🖤 Panel not found: ${idOrClass}`);
            return false;
        }

        console.log(`🖤 Force bringing to front: ${idOrClass}`, panel);
        this.bringToFront(panel);
        return {
            panel: panel,
            panelStack: [...this.panelStack],
            currentZIndex: panel.style.zIndex
        };
    },

    // DEBUG: Show current panel stack state
    debugPanelStack() {
        console.log('🖤 Current panel stack:', this.panelStack);
        this.panelStack.forEach((panelId, index) => {
            let panel = document.getElementById(panelId);
            if (!panel) panel = document.querySelector(`.${panelId}`);
            const zIndex = panel ? panel.style.zIndex : 'N/A';
            console.log(`  [${index}] ${panelId}: z-index=${zIndex}`);
        });
        return this.panelStack;
    }
};

window.DraggablePanels = DraggablePanels;

// 🖤 Refresh z-indices after game starts to catch any late-loaded panels 💀
document.addEventListener('game-started', () => {
    setTimeout(() => {
        if (typeof DraggablePanels !== 'undefined' && DraggablePanels.refreshAllZIndices) {
            DraggablePanels.refreshAllZIndices();
        }
    }, 1000);
});

// register with Bootstrap
Bootstrap.register('DraggablePanels', () => DraggablePanels.init(), {
    dependencies: ['PanelManager'],
    priority: 94,
    severity: 'optional'
});
