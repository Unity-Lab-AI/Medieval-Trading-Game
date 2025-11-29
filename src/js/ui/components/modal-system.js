// ═══════════════════════════════════════════════════════════════
// 🪟 MODAL SYSTEM - popups that demand your attention
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// centralized modal management for all those "are you sure?" moments
// because one popup is never enough apparently

const ModalSystem = {
    // 📋 Active modals registry - tracking the attention seekers
    activeModals: new Map(),

    // Store event listener keys for cleanup
    listeners: [],

    // Current modal container ID
    currentModalId: 'system-modal',

    // Drag state for modals
    dragState: null,

    // ═══════════════════════════════════════════════════════════════
    // 🎯 PRIMARY API - show() and hide() for structured modals
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

        // 🖤 Conjure the modal's dark structure into being
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

        // 🔮 Summon or retrieve the modal's vessel from the void
        let modalContainer = document.getElementById(this.currentModalId);
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = this.currentModalId;
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }

        // 💀 Keep this soul in our dark registry
        this.activeModals.set(this.currentModalId, modalContainer);

        // ⚡ Breathe life into the vessel and reveal it to the world
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';

        const dialog = modalContainer.querySelector('.modal-dialog');

        // 🗡️ Wire up the choices that shape your fate
        buttons.forEach((btn, idx) => {
            const btnEl = modalContainer.querySelector(`[data-btn-idx="${idx}"]`);
            if (btnEl && btn.onClick) {
                btnEl.addEventListener('click', () => {
                    btn.onClick();
                });
            }
        });

        // 💀 Grant the power to banish this dark window
        if (closeable) {
            const closeX = modalContainer.querySelector('.modal-close-x');
            if (closeX) {
                closeX.addEventListener('click', () => this.hide());
            }

            // 🌙 Click the void to dismiss the vision
            modalContainer.addEventListener('click', (e) => {
                if (e.target === modalContainer) {
                    this.hide();
                }
            });

            // ⚰️ ESC - the universal "fuck this" button
            this._escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                }
            };
            document.addEventListener('keydown', this._escHandler);
        }

        // 🦇 Let control freaks drag this shit around
        if (draggable && dialog) {
            const handle = modalContainer.querySelector('.modal-drag-handle');
            if (handle) {
                handle.addEventListener('mousedown', (e) => {
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
                });
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
            modalContainer.innerHTML = '';
            this.activeModals.delete(this.currentModalId);
        }
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        this.dragState = null;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖱️ DRAG HANDLING - Global drag events for modal dragging
    // ═══════════════════════════════════════════════════════════════

    setupDragEvents() {
        document.addEventListener('mousemove', (e) => {
            if (!this.dragState) return;
            e.preventDefault();
            const { dialog, offsetX, offsetY } = this.dragState;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            // 🔮 Cage this window within the screen's boundaries - no escape
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
    // 🖤 LEGACY API - showModal() for raw HTML modals
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
        
        // Set content and show
        modalContainer.innerHTML = html;
        modalContainer.style.display = 'flex';
        
        // Add close functionality to any close buttons
        const closeButtons = modalContainer.querySelectorAll('.close-btn, .cancel-btn');
        closeButtons.forEach(button => {
            this.listeners.push(
                EventManager.addListener(button, 'click', () => {
                    this.closeModal(containerId);
                })
            );
        });
        
        // Add click-outside-to-close functionality
        this.listeners.push(
            EventManager.addListener(modalContainer, 'click', (e) => {
                if (e.target === modalContainer) {
                    this.closeModal(containerId);
                }
            })
        );

        // Add ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(containerId);
            }
        };
        this.listeners.push(
            EventManager.addListener(document, 'keydown', escHandler)
        );
        
        // Store the ESC handler for cleanup
        modalContainer.escHandler = escHandler;
        
        return modalContainer;
    },
    
    // Close a specific modal
    closeModal(containerId) {
        const modalContainer = this.activeModals.get(containerId);
        if (modalContainer) {
            // Remove all event listeners associated with this modal
            this.listeners = this.listeners.filter(key => {
                const listener = EventManager.listeners.get(key);
                if (listener && listener.element === modalContainer) {
                    EventManager.removeListener(key);
                    return false;
                }
                return true;
            });
            
            // Hide and clear modal
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
            
            // Remove from active modals
            this.activeModals.delete(containerId);
        }
    },
    
    // Close all active modals
    closeAllModals() {
        // Clear all modal listeners
        this.listeners.forEach(key => EventManager.removeListener(key));
        this.listeners = [];
        
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
                    z-index: 700; /* Z-INDEX STANDARD: System modals */
                    padding: 20px;
                    box-sizing: border-box;
                }

                .modal-overlay > div,
                .modal-dialog {
                    background: linear-gradient(135deg, #2a1810 0%, #1a0f08 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
                    border-bottom: 1px solid #8b4513;
                    background: linear-gradient(90deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                    border-radius: 6px 6px 0 0;
                    user-select: none;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.3em;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    flex: 1;
                }

                .modal-close-x {
                    background: rgba(244, 67, 54, 0.8);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    font-size: 18px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    margin-left: 10px;
                }

                .modal-close-x:hover {
                    background: rgba(244, 67, 54, 1);
                    transform: scale(1.1);
                }

                .modal-content {
                    padding: 20px;
                    color: #f4e4c1;
                }

                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid #8b4513;
                    background: rgba(139, 69, 19, 0.2);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .close-btn, .cancel-btn {
                    background: #8b4513;
                    color: #f4e4c1;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1.2em;
                    transition: background-color 0.3s;
                }

                .close-btn:hover, .cancel-btn:hover {
                    background: #a0522d;
                }

                .modal-btn,
                .primary-btn, .secondary-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }

                .modal-btn.primary-btn,
                .primary-btn {
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                }

                .modal-btn.primary-btn:hover:not(:disabled),
                .primary-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #a0522d 0%, #cd853f 100%);
                }

                .modal-btn.secondary-btn,
                .secondary-btn {
                    background: #654321;
                    color: #f4e4c1;
                }

                .modal-btn.secondary-btn:hover:not(:disabled),
                .secondary-btn:hover:not(:disabled) {
                    background: #8b4513;
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