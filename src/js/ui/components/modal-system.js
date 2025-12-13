// ═══════════════════════════════════════════════════════════════
// MODAL SYSTEM - popup window management
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const ModalSystem = {
    // active modals registry - tracking every needy popup
    activeModals: new Map(),

    // Store event listener keys for cleanup
    listeners: [],

    // Current modal container ID
    currentModalId: 'system-modal',

    // Drag state for modals
    dragState: null,

    // ═══════════════════════════════════════════════════════════════
    // PRIMARY API - show() and hide() for structured modals
    // ═══════════════════════════════════════════════════════════════

    /**
     * Show a modal with options
     * @param {Object} options
     * @param {string} options.title - Modal title
     * @param {string} options.content - HTML content
     * @param {Array} options.buttons - Array of {text, className, onClick}
     * @param {boolean} options.closeable - Can be closed without action (default: true)
     * @param {boolean} options.draggable - Can be dragged (default: true)
     */
    show(options) {
        const {
            title = 'Notice',
            content = '',
            buttons = [],
            closeable = true,
            draggable = true
        } = options;

        // Build button HTML
        const buttonHTML = buttons.map((btn, idx) => {
            const className = btn.className || (idx === 0 ? 'primary' : 'secondary');
            return `<button class="modal-btn ${className}-btn" data-btn-idx="${idx}">${btn.text}</button>`;
        }).join('');

        // Build close button if closeable
        const closeButtonHTML = closeable
            ? `<button class="modal-close-x" title="Close">×</button>`
            : '';

        // build the modal HTML - darkness in markup form
        const html = `
            <div class="modal-dialog ${draggable ? 'modal-draggable' : ''}">
                <div class="modal-header ${draggable ? 'modal-drag-handle' : ''}">
                    ${draggable ? '<span class="modal-grip">⋮⋮</span>' : ''}
                    <h2>${title}</h2>
                    ${closeButtonHTML}
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                ${buttonHTML ? `<div class="modal-footer">${buttonHTML}</div>` : ''}
            </div>
        `;

        // modal container is REUSED, not recreated every damn time
        // keeps DOM bloat down and z-index layering sane
        let modalContainer = document.getElementById(this.currentModalId);
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = this.currentModalId;
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }

        // track this modal so we can kill it later
        this.activeModals.set(this.currentModalId, modalContainer);

        // inject the HTML and show this bastard
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';
        modalContainer.classList.add('active');

        // Block all input to elements behind the modal
        this._blockBackgroundInput(true);

        // Emit modal opened event for UIStateManager
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('modal:opened', { modalId: this.currentModalId });
        }

        const dialog = modalContainer.querySelector('.modal-dialog');

        // Focus the first button or the dialog itself for accessibility
        const firstButton = dialog.querySelector('button');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 50);
        }

        // clear leftover listeners from previous modal - no ghost handlers
        this._currentModalListeners = this._currentModalListeners || [];
        this._currentModalListeners.forEach(({ el, type, handler }) => {
            el.removeEventListener(type, handler);
        });
        this._currentModalListeners = [];

        // wire up button handlers - your choices have consequences
        buttons.forEach((btn, idx) => {
            const btnEl = modalContainer.querySelector(`[data-btn-idx="${idx}"]`);
            if (btnEl && btn.onClick) {
                const handler = () => btn.onClick();
                btnEl.addEventListener('click', handler);
                this._currentModalListeners.push({ el: btnEl, type: 'click', handler });
            }
        });

        // setup close handlers if this modal can actually be dismissed
        if (closeable) {
            const closeX = modalContainer.querySelector('.modal-close-x');
            if (closeX) {
                const closeHandler = () => this.hide();
                closeX.addEventListener('click', closeHandler);
                this._currentModalListeners.push({ el: closeX, type: 'click', handler: closeHandler });
            }

            // click outside modal to close it
            const backdropHandler = (e) => {
                if (e.target === modalContainer) {
                    this.hide();
                }
            };
            modalContainer.addEventListener('click', backdropHandler);
            this._currentModalListeners.push({ el: modalContainer, type: 'click', handler: backdropHandler });

            // ESC key - the universal "fuck this" button
            // only add once to prevent listener pile-up
            if (!this._escHandlerAttached) {
                this._escHandler = (e) => {
                    if (e.key === 'Escape') {
                        // Stop propagation so other ESC handlers don't also fire
                        // Without this, UIPolishSystem closes ALL panels behind us
                        e.stopPropagation();
                        e.preventDefault();
                        this.hide();
                    }
                };
                // Use capture phase to intercept ESC before other handlers
                document.addEventListener('keydown', this._escHandler, true);
                this._escHandlerAttached = true;
            }
        }

        // make it draggable for control freaks
        if (draggable && dialog) {
            const handle = modalContainer.querySelector('.modal-drag-handle');
            if (handle) {
                const dragHandler = (e) => {
                    if (e.target.classList.contains('modal-close-x')) return;
                    e.preventDefault();
                    const rect = dialog.getBoundingClientRect();
                    this.dragState = {
                        dialog,
                        offsetX: e.clientX - rect.left,
                        offsetY: e.clientY - rect.top
                    };
                    dialog.style.position = 'fixed';
                    dialog.style.margin = '0';
                    dialog.style.left = rect.left + 'px';
                    dialog.style.top = rect.top + 'px';
                };
                handle.addEventListener('mousedown', dragHandler);
                this._currentModalListeners.push({ el: handle, type: 'mousedown', handler: dragHandler });
            }
        }

        return modalContainer;
    },

    /**
     * Hide the current modal
     */
    hide() {
        const modalContainer = document.getElementById(this.currentModalId);
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.classList.remove('active');
            modalContainer.innerHTML = '';
            this.activeModals.delete(this.currentModalId);
        }

        // clean up all tracked listeners - no orphans allowed
        if (this._currentModalListeners) {
            this._currentModalListeners.forEach(({ el, type, handler }) => {
                el.removeEventListener(type, handler);
            });
            this._currentModalListeners = [];
        }

        // Unblock background input
        this._blockBackgroundInput(false);

        // Emit modal closed event for UIStateManager
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('modal:closed', { modalId: this.currentModalId });
        }

        if (this._escHandler) {
            // Must use capture: true to match how we added it
            document.removeEventListener('keydown', this._escHandler, true);
            this._escHandler = null;
            // Reset flag so next modal can add ESC listener
            this._escHandlerAttached = false;
        }
        this.dragState = null;

        // Restore focus to previously focused element if we saved one
        if (this._previouslyFocusedElement) {
            this._previouslyFocusedElement.focus();
            this._previouslyFocusedElement = null;
        }
    },

    /**
     * Block/unblock input to elements behind modal
     */
    _blockBackgroundInput(block) {
        // Save currently focused element before blocking
        if (block && document.activeElement) {
            this._previouslyFocusedElement = document.activeElement;
        }

        // Find all interactive elements outside the modal
        const modal = document.getElementById(this.currentModalId);
        const interactiveSelectors = 'input, textarea, button, select, a[href], [tabindex]:not([tabindex="-1"])';

        document.querySelectorAll(interactiveSelectors).forEach(el => {
            // Skip elements inside the modal
            if (modal && modal.contains(el)) return;

            if (block) {
                // Store original tabindex and disable
                if (!el.hasAttribute('data-original-tabindex')) {
                    el.setAttribute('data-original-tabindex', el.getAttribute('tabindex') || '');
                }
                el.setAttribute('tabindex', '-1');
                // Also blur if this element is focused
                if (document.activeElement === el) {
                    el.blur();
                }
            } else {
                // Restore original tabindex
                const originalTabindex = el.getAttribute('data-original-tabindex');
                if (originalTabindex === '') {
                    el.removeAttribute('tabindex');
                } else if (originalTabindex !== null) {
                    el.setAttribute('tabindex', originalTabindex);
                }
                el.removeAttribute('data-original-tabindex');
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // DRAG HANDLING - global drag events for modal dragging
    // ═══════════════════════════════════════════════════════════════

    // guard flag - only setup drag events once
    _dragEventsInitialized: false,

    setupDragEvents() {
        // prevent duplicate listeners - one set is enough
        if (this._dragEventsInitialized) return;
        this._dragEventsInitialized = true;

        document.addEventListener('mousemove', (e) => {
            if (!this.dragState) return;
            e.preventDefault();
            const { dialog, offsetX, offsetY } = this.dragState;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            // keep modal within screen bounds - no escape
            const rect = dialog.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
            dialog.style.left = newX + 'px';
            dialog.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', () => {
            this.dragState = null;
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // LEGACY API - showModal() for raw HTML modals
    // ═══════════════════════════════════════════════════════════════

    // Show a modal with the given HTML content
    showModal(html, containerId = 'game-modal-container') {
        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById(containerId);
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = containerId;
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }

        // Store reference to this modal
        this.activeModals.set(containerId, modalContainer);

        // initialize per-modal listener tracking to avoid memory leaks
        if (!this._modalListeners) this._modalListeners = {};
        this._modalListeners[containerId] = [];

        // Set content and show
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';

        // Add close functionality to any close buttons
        const closeButtons = modalContainer.querySelectorAll('.close-btn, .cancel-btn');
        closeButtons.forEach(button => {
            const key = EventManager.addListener(button, 'click', () => {
                this.closeModal(containerId);
            });
            this._modalListeners[containerId].push(key);
            this.listeners.push(key);
        });

        // Add click-outside-to-close functionality
        const backdropKey = EventManager.addListener(modalContainer, 'click', (e) => {
            if (e.target === modalContainer) {
                this.closeModal(containerId);
            }
        });
        this._modalListeners[containerId].push(backdropKey);
        this.listeners.push(backdropKey);

        // Add ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(containerId);
            }
        };
        const escKey = EventManager.addListener(document, 'keydown', escHandler);
        this._modalListeners[containerId].push(escKey);
        this.listeners.push(escKey);

        // Store the ESC handler for cleanup (legacy compatibility)
        modalContainer.escHandler = escHandler;

        return modalContainer;
    },
    
    // Close a specific modal
    closeModal(containerId) {
        const modalContainer = this.activeModals.get(containerId);
        if (modalContainer) {
            // per-modal listener tracking for precise cleanup
            const modalListenerKeys = this._modalListeners?.[containerId] || [];

            // Remove all listeners tracked for this specific modal
            modalListenerKeys.forEach(key => {
                EventManager.removeListener(key);
            });

            // Clean up from global tracking array too
            this.listeners = this.listeners.filter(key => !modalListenerKeys.includes(key));

            // Clear per-modal tracking
            if (this._modalListeners) {
                delete this._modalListeners[containerId];
            }

            // Hide and clear modal
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';

            // Remove from active modals
            this.activeModals.delete(containerId);
        }
    },
    
    // Close all active modals
    closeAllModals() {
        // Clear all modal listeners from EventManager
        this.listeners.forEach(key => EventManager.removeListener(key));
        this.listeners = [];

        // also clear per-modal tracking
        if (this._modalListeners) {
            this._modalListeners = {};
        }

        for (const [containerId] of this.activeModals) {
            const modalContainer = this.activeModals.get(containerId);
            if (modalContainer) {
                // Hide and clear modal
                modalContainer.style.display = 'none';
                modalContainer.innerHTML = '';
            }
        }

        // Clear all active modals
        this.activeModals.clear();
    },
    
    // Check if a modal is currently active
    isModalActive(containerId) {
        return this.activeModals.has(containerId);
    },
    
    // Get the number of active modals
    getActiveModalCount() {
        return this.activeModals.size;
    },
    
    // Initialize modal system
    init() {
        // Setup drag events
        this.setupDragEvents();

        // Add global styles for modals if not already present
        if (!document.getElementById('modal-system-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-system-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 100000; /* 🖤💀 MUST be above settings panel (99999) to show confirmation modals */
                    padding: 20px;
                    box-sizing: border-box;
                }

                /* 🖤 UNIFIED MODAL THEME - Matching quest panel's dark purple/gold theme 💀 */
                .modal-overlay > div,
                .modal-dialog {
                    background: linear-gradient(180deg, rgba(40, 40, 70, 0.98) 0%, rgba(25, 25, 45, 0.98) 100%);
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow-y: auto;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                    position: relative;
                    min-width: 300px;
                }

                .modal-dialog.modal-draggable .modal-drag-handle {
                    cursor: move;
                }

                .modal-grip {
                    opacity: 0.5;
                    margin-right: 10px;
                    font-size: 14px;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                    background: linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, transparent 100%);
                    color: #fff;
                    border-radius: 10px 10px 0 0;
                    user-select: none;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.3em;
                    color: #ffd700;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    flex: 1;
                }

                .modal-close-x {
                    background: transparent;
                    color: #888;
                    border: none;
                    border-radius: 4px;
                    width: 28px;
                    height: 28px;
                    font-size: 1.4rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    margin-left: 10px;
                }

                .modal-close-x:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .modal-content {
                    padding: 20px;
                    color: #e0e0e0;
                }

                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid rgba(255, 215, 0, 0.3);
                    background: rgba(0, 0, 0, 0.2);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .close-btn, .cancel-btn {
                    background: rgba(255, 215, 0, 0.2);
                    color: #ffd700;
                    border: 1px solid rgba(255, 215, 0, 0.4);
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1.2em;
                    transition: all 0.3s;
                }

                .close-btn:hover, .cancel-btn:hover {
                    background: rgba(255, 215, 0, 0.3);
                    border-color: #ffd700;
                }

                .modal-btn,
                .primary-btn, .secondary-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }

                .modal-btn.primary-btn,
                .primary-btn {
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%);
                    color: #ffd700;
                    border: 1px solid rgba(255, 215, 0, 0.5);
                }

                .modal-btn.primary-btn:hover:not(:disabled),
                .primary-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 215, 0, 0.3) 100%);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                }

                .modal-btn.secondary-btn,
                .secondary-btn {
                    background: rgba(100, 100, 150, 0.3);
                    color: #a0a0c0;
                    border: 1px solid rgba(150, 150, 200, 0.3);
                }

                .modal-btn.secondary-btn:hover:not(:disabled),
                .secondary-btn:hover:not(:disabled) {
                    background: rgba(100, 100, 150, 0.5);
                    color: #c0c0e0;
                }

                .primary-btn:disabled, .secondary-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
        }

        this.unloadListener = EventManager.addListener(window, 'beforeunload', () => {
            this.closeAllModals();
        });

        console.log('🪟 ModalSystem initialized with draggable modals');
    }
};

// Auto-initialize when script loads
ModalSystem.init();