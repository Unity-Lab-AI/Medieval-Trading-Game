// ═══════════════════════════════════════════════════════════════
// 🖤 DRAGGABLE PANELS - because control freaks need their panels where THEY want them
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════

const DraggablePanels = {
    dragState: null,
    STORAGE_KEY: 'trader-claude-panel-positions',
    eventsSetup: false,
    // Panels that should NOT have a close button (always visible)
    noCloseButtonPanels: ['location-panel', 'side-panel', 'message-log'],

    init() {
        console.log('🖤 DraggablePanels: Initializing...');

        // Setup global drag events FIRST
        this.setupGlobalEvents();

        // Setup draggables
        this.setupAllDraggables();

        // Observe for panel visibility changes
        this.observePanelChanges();

        // Load saved positions
        this.loadPositions();

        // Override showPanel to handle dragged panels
        this.patchShowPanel();

        console.log('🖤 DraggablePanels: Ready');
    },

    setupGlobalEvents() {
        if (this.eventsSetup) return;

        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());

        this.eventsSetup = true;
    },

    setupAllDraggables() {
        // Setup all panels
        document.querySelectorAll('.panel').forEach(panel => {
            this.makeDraggable(panel);
        });

        // Setup side panel
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) this.makeDraggable(sidePanel, 'Player Info');

        // Setup message log with special handling
        this.setupMessageLog();
    },

    setupMessageLog() {
        const messageLog = document.getElementById('message-log');
        if (!messageLog) return;

        // Check if already setup
        if (messageLog.dataset.draggable === 'true') {
            console.log('🖤 Message log already setup for dragging');
            return;
        }

        messageLog.dataset.draggable = 'true';

        // Get or style the h3
        let h3 = messageLog.querySelector('h3');
        if (h3) {
            // Style as drag handle - use cssText to override all
            h3.style.cssText = `
                padding: 8px 12px !important;
                margin: 0 !important;
                background: linear-gradient(180deg, rgba(79, 195, 247, 0.2) 0%, rgba(79, 195, 247, 0.05) 100%) !important;
                border-bottom: 1px solid rgba(79, 195, 247, 0.3) !important;
                cursor: move !important;
                user-select: none !important;
                font-size: 14px !important;
                border-radius: 12px 12px 0 0 !important;
                pointer-events: auto !important;
                position: relative !important;
                z-index: 10 !important;
            `;

            // Add grip if not present
            if (!h3.innerHTML.includes('⋮⋮')) {
                const text = h3.textContent.replace('⋮⋮', '').trim();
                h3.innerHTML = `<span class="drag-grip" style="opacity:0.5;margin-right:8px;pointer-events:none;">⋮⋮</span><span style="pointer-events:none;">${text}</span>`;
            }

            // Remove any existing handlers by cloning
            const newH3 = h3.cloneNode(true);
            h3.parentNode.replaceChild(newH3, h3);
            h3 = newH3;

            // Add drag events to the fresh h3
            const self = this;

            h3.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖤 Message log h3 mousedown');
                self.startDrag(e, messageLog);
            }, true);

            h3.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖤 Message log h3 touchstart');
                self.startDrag(e, messageLog);
            }, { passive: false, capture: true });

            console.log('🖤 Message log drag setup complete');
        } else {
            console.warn('🖤 Message log h3 not found');
        }
    },

    makeDraggable(element, customTitle = null) {
        if (element.dataset.draggable === 'true') return;
        element.dataset.draggable = 'true';

        // Skip if already has a drag handle
        if (element.querySelector('.drag-handle')) return;

        // Get title
        let title = customTitle;
        if (!title) {
            const h2 = element.querySelector('h2');
            const h3 = element.querySelector('h3');
            const headerH2 = element.querySelector('.setup-header h2, .market-header h2, .travel-header h2');
            title = headerH2?.textContent || h2?.textContent || h3?.textContent || 'Panel';
        }

        // Check if this panel should have a close button
        const showCloseButton = !this.noCloseButtonPanels.includes(element.id);

        // Create drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = `
            <span class="drag-grip" style="opacity:0.5;font-size:14px;">⋮⋮</span>
            <span class="drag-title" style="flex:1;font-weight:500;font-size:14px;">${title}</span>
            ${showCloseButton ? `<button class="drag-close" title="Close" style="
                background:rgba(244,67,54,0.8);
                border:none;
                border-radius:50%;
                width:24px;
                height:24px;
                color:white;
                font-size:16px;
                cursor:pointer;
                display:flex;
                align-items:center;
                justify-content:center;
            ">×</button>` : ''}
        `;

        dragHandle.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(180deg, rgba(79, 195, 247, 0.2) 0%, rgba(79, 195, 247, 0.05) 100%);
            border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            cursor: move;
            user-select: none;
            border-radius: 12px 12px 0 0;
        `;

        // Insert drag handle
        element.insertBefore(dragHandle, element.firstChild);

        // Close button - only hide with class, not display:none
        const closeBtn = dragHandle.querySelector('.drag-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                element.classList.add('hidden');
            });
        }

        // Drag events on handle only
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('drag-close')) return;
            e.preventDefault();
            this.startDrag(e, element);
        });

        dragHandle.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('drag-close')) return;
            e.preventDefault();
            this.startDrag(e, element);
        }, { passive: false });
    },

    startDrag(e, element) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = element.getBoundingClientRect();

        // Move to body if in ui-panels (for proper fixed positioning)
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
        element.style.zIndex = '1000';

        this.dragState = {
            element,
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };

        element.classList.add('dragging');
        console.log('🖤 Dragging:', element.id || 'element');
    },

    onDrag(e) {
        if (!this.dragState) return;

        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const { element, offsetX, offsetY } = this.dragState;

        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Keep within viewport
        const rect = element.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));

        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    },

    endDrag() {
        if (!this.dragState) return;

        const { element } = this.dragState;
        element.classList.remove('dragging');
        element.style.zIndex = '100';

        this.savePosition(element);
        console.log('🖤 Drag ended:', element.style.left, element.style.top);

        this.dragState = null;
    },

    // Patch showPanel to handle panels that were moved to body
    patchShowPanel() {
        const originalShowPanel = window.showPanel;
        if (typeof originalShowPanel === 'function') {
            window.showPanel = (panelId) => {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.classList.remove('hidden');
                    panel.style.display = ''; // Clear any inline display:none

                    // If panel was dragged to body, make sure it's visible
                    if (panel.parentElement === document.body) {
                        // Already positioned, just show it
                    } else {
                        // Call original if not moved
                        originalShowPanel(panelId);
                    }
                } else {
                    originalShowPanel(panelId);
                }
            };
            console.log('🖤 Patched showPanel');
        }
    },

    observePanelChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList?.contains('panel')) {
                            setTimeout(() => this.makeDraggable(node), 100);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    },

    savePosition(element) {
        const id = element.id;
        if (!id) return;

        const positions = this.getAllPositions();
        positions[id] = {
            left: element.style.left,
            top: element.style.top
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

    loadPositions() {
        const positions = this.getAllPositions();

        Object.keys(positions).forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            const pos = positions[id];
            if (pos.left && pos.top) {
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
            }
        });
    },

    resetPositions() {
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    }
};

// Initialize after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => DraggablePanels.init(), 300));
} else {
    setTimeout(() => DraggablePanels.init(), 300);
}

window.DraggablePanels = DraggablePanels;
