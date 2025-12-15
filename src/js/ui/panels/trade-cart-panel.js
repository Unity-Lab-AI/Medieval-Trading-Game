// ═══════════════════════════════════════════════════════════════
// TRADE CART PANEL - the shopping cart for medieval capitalism
// ═══════════════════════════════════════════════════════════════
// File Version: 0.91.10
// Click buy → add to cart → set quantity → haggle or pay up
// Like Amazon but with more plague and less Prime shipping
// ═══════════════════════════════════════════════════════════════

const TradeCartPanel = {
    // ═══════════════════════════════════════════════════════════════
    // state - tracking your impulse purchases
    // ═══════════════════════════════════════════════════════════════
    initialized: false,
    isOpen: false,
    mode: 'buy', // 'buy' or 'sell'
    currentMerchant: null,
    cart: [], // { itemId, quantity, unitPrice, totalPrice }
    baseTotal: 0,
    discountPercent: 0,
    finalTotal: 0,
    haggleAttempted: false,

    // ═══════════════════════════════════════════════════════════════
    // initialization
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) {
            console.log('🛒 TradeCartPanel already initialized');
            return this;
        }

        console.log('🛒 TradeCartPanel awakening... time to spend some gold 💀');
        this.createPanelUI();
        this.setupEventListeners();
        this.initialized = true;
        console.log('🛒 TradeCartPanel ready for transactions');
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // ui creation
    // ═══════════════════════════════════════════════════════════════
    createPanelUI() {
        if (document.getElementById('trade-cart-panel')) return;

        const panelHTML = `
            <div id="trade-cart-panel" class="trade-cart-panel hidden">
                <div class="trade-cart-backdrop" onclick="TradeCartPanel.close()"></div>
                <div class="trade-cart-container">
                    <!-- Header -->
                    <div class="trade-cart-header">
                        <div class="cart-header-left">
                            <span class="cart-icon">🛒</span>
                            <h2 id="cart-title">Your Cart</h2>
                            <span class="cart-count-badge" id="cart-count-badge">0</span>
                        </div>
                        <div class="cart-header-right">
                            <span class="merchant-name" id="cart-merchant-name"></span>
                            <button class="cart-close-btn" onclick="TradeCartPanel.close()">×</button>
                        </div>
                    </div>

                    <!-- Cart Items -->
                    <div class="trade-cart-items" id="cart-items-container">
                        <div class="empty-cart">
                            <span class="empty-icon">📭</span>
                            <p>Cart is empty... add items to begin</p>
                        </div>
                    </div>

                    <!-- Summary Section -->
                    <div class="trade-cart-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span id="cart-subtotal">0g</span>
                        </div>
                        <div class="summary-row discount-row hidden" id="discount-row">
                            <span>Discount (<span id="discount-percent">0</span>%):</span>
                            <span id="cart-discount">-0g</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>Total:</strong></span>
                            <span id="cart-total"><strong>0g</strong></span>
                        </div>
                        <div class="summary-row player-gold-row">
                            <span>Your Gold:</span>
                            <span id="cart-player-gold">0g</span>
                        </div>
                        <div class="summary-row remaining-gold-row">
                            <span>After Purchase:</span>
                            <span id="cart-remaining-gold">0g</span>
                        </div>
                    </div>

                    <!-- Validation Messages -->
                    <div class="trade-cart-validation" id="cart-validation">
                        <!-- Dynamic validation messages appear here -->
                    </div>

                    <!-- Action Buttons -->
                    <div class="trade-cart-actions">
                        <div class="trade-cart-actions-row">
                            <button class="cart-btn haggle-btn" id="cart-haggle-btn" onclick="TradeCartPanel.attemptHaggle()">
                                <span class="btn-icon">🗣️</span>
                                <span class="btn-text">Haggle</span>
                            </button>
                            <button class="cart-btn clear-btn" onclick="TradeCartPanel.clearCart()">
                                <span class="btn-icon">🗑️</span>
                                <span class="btn-text">Clear</span>
                            </button>
                        </div>
                        <button class="cart-btn complete-btn" id="cart-complete-btn" onclick="TradeCartPanel.completeTrade()">
                            <span class="btn-icon">✅</span>
                            <span class="btn-text">Complete Trade</span>
                        </button>
                    </div>
                    <p class="cart-hint">💡 Click more items in the market to add them to your cart!</p>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = panelHTML;
        document.body.appendChild(container.firstElementChild);

        this.injectStyles();
    },

    // inject CSS styles for the cart panel
    injectStyles() {
        if (document.getElementById('trade-cart-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'trade-cart-styles';
        styles.textContent = `
            /* 🛒 Trade Cart Panel Styles - NON-BLOCKING side panel! */
            .trade-cart-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                bottom: 80px;
                z-index: 750;
                pointer-events: none; /* Allow clicks to pass through to market */
            }

            .trade-cart-panel.hidden {
                display: none;
            }

            /* 🖤 NO backdrop - let users keep clicking market items! */
            .trade-cart-backdrop {
                display: none; /* Disabled - no blocking overlay */
            }

            .trade-cart-container {
                position: relative;
                pointer-events: auto; /* Cart itself IS clickable */
                background: linear-gradient(180deg, rgba(35, 35, 50, 0.98) 0%, rgba(25, 25, 40, 0.98) 100%);
                border: 2px solid rgba(255, 215, 0, 0.4);
                border-radius: 12px;
                width: 340px;
                max-height: 100%;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
                animation: slideInRight 0.2s ease-out;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .trade-cart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px 10px 0 0;
            }

            .cart-header-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .cart-icon {
                font-size: 24px;
            }

            .cart-header-left h2 {
                margin: 0;
                color: #ffd700;
                font-size: 18px;
            }

            .cart-count-badge {
                background: #ff6b6b;
                color: white;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 8px;
                border-radius: 12px;
                min-width: 20px;
                text-align: center;
                margin-left: 8px;
            }

            .cart-count-badge.empty {
                background: #666;
            }

            .cart-header-right {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .merchant-name {
                color: #aaa;
                font-size: 14px;
            }

            .cart-close-btn {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
                transition: color 0.2s;
            }

            .cart-close-btn:hover {
                color: #ff6b6b;
            }

            /* Cart Items - scrollable for unlimited items! */
            .trade-cart-items {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                min-height: 100px;
                max-height: calc(100vh - 400px); /* Dynamic height based on viewport */
            }

            /* Custom scrollbar for cart */
            .trade-cart-items::-webkit-scrollbar {
                width: 8px;
            }
            .trade-cart-items::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
            }
            .trade-cart-items::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.4);
                border-radius: 4px;
            }
            .trade-cart-items::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.6);
            }

            .empty-cart {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }

            .empty-cart .empty-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 10px;
            }

            .cart-item {
                display: grid;
                grid-template-columns: 24px 1fr auto auto 20px;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                margin-bottom: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .cart-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .cart-item-icon {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .cart-item-info {
                display: flex;
                flex-direction: column;
                gap: 0;
                min-width: 0;
                overflow: hidden;
            }

            .cart-item-name {
                color: #e0e0e0;
                font-weight: 500;
                font-size: 13px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .cart-item-price {
                color: #ffd700;
                font-size: 11px;
            }

            .cart-item-stock {
                color: #888;
                font-size: 10px;
            }

            .cart-item-quantity {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .qty-btn {
                width: 20px;
                height: 20px;
                border: 1px solid rgba(255, 215, 0, 0.3);
                background: rgba(255, 215, 0, 0.1);
                color: #ffd700;
                border-radius: 3px;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
                padding: 0;
                transition: all 0.2s;
            }

            .qty-btn:hover {
                background: rgba(255, 215, 0, 0.2);
            }

            .qty-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .qty-input {
                width: 36px;
                text-align: center;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #fff;
                border-radius: 3px;
                padding: 2px;
                font-size: 12px;
                -moz-appearance: textfield;
            }

            /* Hide spinner arrows in all browsers */
            .qty-input::-webkit-outer-spin-button,
            .qty-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .cart-item-total {
                color: #ffd700;
                font-weight: 600;
                font-size: 12px;
                min-width: 45px;
                text-align: right;
            }

            .cart-item-remove {
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                margin: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.6;
                transition: opacity 0.2s;
            }

            .cart-item-remove:hover {
                opacity: 1;
            }

            /* Summary */
            .trade-cart-summary {
                padding: 15px 20px;
                border-top: 1px solid rgba(255, 215, 0, 0.2);
                background: rgba(0, 0, 0, 0.2);
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                color: #aaa;
                overflow: hidden;
            }

            .summary-row span {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .summary-row span:last-child {
                flex-shrink: 0;
                margin-left: 10px;
            }

            .summary-row.total-row {
                border-top: 1px solid rgba(255, 215, 0, 0.2);
                padding-top: 10px;
                margin-top: 5px;
                color: #ffd700;
                font-size: 16px;
            }

            .summary-row.discount-row {
                color: #4ade80;
            }

            .summary-row.remaining-gold-row span:last-child {
                color: #4ade80;
            }

            .summary-row.remaining-gold-row.negative span:last-child {
                color: #ff6b6b;
            }

            /* Validation */
            .trade-cart-validation {
                padding: 0 20px 10px;
            }

            .validation-msg {
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 5px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .validation-msg.error {
                background: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.3);
            }

            .validation-msg.warning {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
                border: 1px solid rgba(255, 193, 7, 0.3);
            }

            .validation-msg.success {
                background: rgba(74, 222, 128, 0.2);
                color: #4ade80;
                border: 1px solid rgba(74, 222, 128, 0.3);
            }

            /* Actions - two rows: small buttons, then full-width complete */
            .trade-cart-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 15px 20px;
                border-top: 1px solid rgba(255, 215, 0, 0.2);
            }

            .trade-cart-actions-row {
                display: flex;
                gap: 10px;
            }

            .cart-btn {
                flex: 1;
                padding: 12px 15px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .cart-btn .btn-icon {
                font-size: 16px;
            }

            .haggle-btn {
                background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
                color: white;
            }

            .haggle-btn:hover {
                background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
            }

            .haggle-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .cancel-btn, .clear-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #aaa;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cancel-btn:hover, .clear-btn:hover {
                background: rgba(255, 100, 100, 0.2);
                color: #ff6b6b;
                border-color: rgba(255, 100, 100, 0.4);
            }

            .cart-hint {
                text-align: center;
                color: #888;
                font-size: 12px;
                margin: 10px 15px 15px;
                padding: 8px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 6px;
                border: 1px dashed rgba(255, 215, 0, 0.3);
            }

            .complete-btn {
                background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
                color: white;
                width: 100%;
                padding: 14px 20px;
                font-size: 16px;
                font-weight: 600;
            }

            .complete-btn:hover {
                background: linear-gradient(180deg, #4ade80 0%, #22c55e 100%);
            }

            .complete-btn:disabled {
                background: #444;
                color: #666;
                cursor: not-allowed;
            }

            /* Haggle animation */
            @keyframes haggleShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .haggling .trade-cart-container {
                animation: haggleShake 0.3s ease-in-out;
            }
        `;
        document.head.appendChild(styles);
    },

    // ═══════════════════════════════════════════════════════════════
    // event listeners
    // ═══════════════════════════════════════════════════════════════
    setupEventListeners() {
        // Listen for quantity changes via event delegation
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const itemId = e.target.dataset.itemId;
                const newQty = parseInt(e.target.value) || 0;
                this.updateItemQuantity(itemId, newQty);
            }
        });

        // Listen for escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // open / close
    // ═══════════════════════════════════════════════════════════════

    /**
     * Open the cart panel for buying or selling items
     * @param {object} merchant - The NPC/market data
     * @param {string} mode - 'buy' or 'sell'
     */
    open(merchant, mode = 'buy') {
        this.currentMerchant = merchant;
        this.mode = mode;
        this.cart = [];
        this.discountPercent = 0;
        this.haggleAttempted = false;

        // Update UI based on mode
        const title = document.getElementById('cart-title');
        const merchantName = document.getElementById('cart-merchant-name');
        const cartIcon = document.querySelector('.trade-cart-header .cart-icon');
        const completeBtn = document.getElementById('cart-complete-btn');
        const haggleBtn = document.getElementById('cart-haggle-btn');

        if (title) title.textContent = mode === 'buy' ? 'Purchase Items' : 'Sell Items';
        if (merchantName) merchantName.textContent = merchant?.name || 'Market';
        if (cartIcon) cartIcon.textContent = mode === 'buy' ? '🛒' : '💰';
        if (completeBtn) {
            const btnText = completeBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = mode === 'buy' ? 'Complete Purchase' : 'Complete Sale';
        }
        // haggle only available when BUYING
        if (haggleBtn) {
            haggleBtn.style.display = mode === 'buy' ? '' : 'none';
        }

        this.updateDisplay();

        const panel = document.getElementById('trade-cart-panel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.dataset.mode = mode; // Store mode for styling
            this.isOpen = true;
        }
    },

    close() {
        const panel = document.getElementById('trade-cart-panel');
        if (panel) {
            panel.classList.add('hidden');
            this.isOpen = false;
        }
        this.cart = [];
        this.currentMerchant = null;
    },

    // clear all items from cart without closing
    clearCart() {
        this.cart = [];
        this.discountPercent = 0;
        this.haggleAttempted = false;
        this.updateDisplay();
    },

    // ═══════════════════════════════════════════════════════════════
    // cart management
    // ═══════════════════════════════════════════════════════════════

    /**
     * Add an item to the cart
     * @param {string} itemId - The item ID
     * @param {number} unitPrice - Price per unit
     * @param {number} maxStock - Maximum available
     * @param {object} itemData - Optional item data (can include 'quantity' for bulk adds)
     */
    addItem(itemId, unitPrice, maxStock, itemData = {}) {
        // support bulk quantity via itemData.quantity (for Shift/Ctrl+Click)
        const addQty = itemData.quantity || 1;

        // Check if already in cart
        const existing = this.cart.find(i => i.itemId === itemId);
        if (existing) {
            // Increment quantity if possible (clamped to maxStock)
            const newQty = Math.min(existing.quantity + addQty, maxStock);
            if (newQty > existing.quantity) {
                existing.quantity = newQty;
                existing.totalPrice = existing.quantity * existing.unitPrice;
            }
        } else {
            // Add new item (clamped to maxStock)
            const initialQty = Math.min(addQty, maxStock);
            this.cart.push({
                itemId,
                name: itemData.name || this.formatItemName(itemId),
                icon: itemData.icon || this.getItemIcon(itemId),
                unitPrice,
                maxStock,
                quantity: initialQty,
                totalPrice: unitPrice * initialQty,
                weight: itemData.weight || 1
            });
        }

        this.updateDisplay();

        // If panel not open, open it
        if (!this.isOpen && this.currentMerchant) {
            this.open(this.currentMerchant, this.mode);
        }
    },

    /**
     * Remove an item from the cart
     * @param {string} itemId - The item ID to remove
     */
    removeItem(itemId) {
        this.cart = this.cart.filter(i => i.itemId !== itemId);
        this.updateDisplay();
    },

    /**
     * Update item quantity
     * @param {string} itemId - The item ID
     * @param {number} newQty - New quantity
     */
    updateItemQuantity(itemId, newQty) {
        const item = this.cart.find(i => i.itemId === itemId);
        if (!item) return;

        // Clamp to valid range
        newQty = Math.max(0, Math.min(newQty, item.maxStock));

        if (newQty === 0) {
            this.removeItem(itemId);
        } else {
            item.quantity = newQty;
            item.totalPrice = item.quantity * item.unitPrice;
            this.updateDisplay();
        }
    },

    /**
     * Increment item quantity
     * @param {string} itemId - The item ID
     * @param {number} amount - Amount to add (default 1, use 5 for Shift, 25 for Ctrl)
     */
    incrementItem(itemId, amount = 1) {
        const item = this.cart.find(i => i.itemId === itemId);
        if (item && item.quantity < item.maxStock) {
            // clamp to maxStock - no overfilling the cart
            item.quantity = Math.min(item.quantity + amount, item.maxStock);
            item.totalPrice = item.quantity * item.unitPrice;
            this.updateDisplay();
        }
    },

    /**
     * Decrement item quantity
     * @param {string} itemId - The item ID
     * @param {number} amount - Amount to remove (default 1, use 5 for Shift, 25 for Ctrl)
     */
    decrementItem(itemId, amount = 1) {
        const item = this.cart.find(i => i.itemId === itemId);
        if (item) {
            // bulk removal - if amount >= quantity, remove entirely
            if (item.quantity <= amount) {
                this.removeItem(itemId);
            } else {
                item.quantity -= amount;
                item.totalPrice = item.quantity * item.unitPrice;
                this.updateDisplay();
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // bulk trading shortcuts - Shift = 5, Ctrl = 25
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get bulk amount from modifier keys
     * @param {Event} event - The click event
     * @returns {number} - 1 (normal), 5 (shift), or 25 (ctrl)
     */
    getBulkAmount(event) {
        if (event.ctrlKey || event.metaKey) return 25; // Ctrl/Cmd = 25x bulk
        if (event.shiftKey) return 5; // Shift = 5x bulk
        return 1; // normal click = 1x
    },

    /**
     * Handle increment with modifier key support
     * @param {Event} event - The click event
     * @param {string} itemId - The item ID
     */
    handleIncrement(event, itemId) {
        const amount = this.getBulkAmount(event);
        this.incrementItem(itemId, amount);
    },

    /**
     * Handle decrement with modifier key support
     * @param {Event} event - The click event
     * @param {string} itemId - The item ID
     */
    handleDecrement(event, itemId) {
        const amount = this.getBulkAmount(event);
        this.decrementItem(itemId, amount);
    },

    // ═══════════════════════════════════════════════════════════════
    // display update
    // ═══════════════════════════════════════════════════════════════
    updateDisplay() {
        this.renderCartItems();
        this.calculateTotals();
        this.validateCart();
        this.updateButtons();
        this.updateCountBadge();
    },

    // Update the item count badge in header
    updateCountBadge() {
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.classList.toggle('empty', totalItems === 0);
    },

    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <span class="empty-icon">📭</span>
                    <p>Cart is empty... add items to begin</p>
                </div>
            `;
            return;
        }

        // bulk trading shortcuts: Shift+Click = 5, Ctrl+Click = 25
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${this.escapeHtml(item.itemId)}">
                <span class="cart-item-icon">${item.icon}</span>
                <div class="cart-item-info">
                    <span class="cart-item-name">${this.escapeHtml(item.name)}</span>
                    <span class="cart-item-price">${item.unitPrice}g each</span>
                    <span class="cart-item-stock">Stock: ${item.maxStock}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="TradeCartPanel.handleDecrement(event, '${this.escapeHtml(item.itemId)}')"
                            title="−1 (Shift: −5, Ctrl: −25)"
                            ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                    <input type="number" class="qty-input" value="${item.quantity}"
                           min="1" max="${item.maxStock}"
                           data-item-id="${this.escapeHtml(item.itemId)}">
                    <button class="qty-btn" onclick="TradeCartPanel.handleIncrement(event, '${this.escapeHtml(item.itemId)}')"
                            title="+1 (Shift: +5, Ctrl: +25)"
                            ${item.quantity >= item.maxStock ? 'disabled' : ''}>+</button>
                </div>
                <span class="cart-item-total">${item.totalPrice}g</span>
                <button class="cart-item-remove" onclick="TradeCartPanel.removeItem('${this.escapeHtml(item.itemId)}')" title="Remove">🗑️</button>
            </div>
        `).join('');
    },

    calculateTotals() {
        // Calculate base total
        this.baseTotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0);

        // Apply discount (only for buying)
        const discountAmount = this.mode === 'buy' ?
            Math.floor(this.baseTotal * (this.discountPercent / 100)) : 0;
        this.finalTotal = this.baseTotal - discountAmount;

        // Update display
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountRowEl = document.getElementById('discount-row');
        const discountPercentEl = document.getElementById('discount-percent');
        const discountEl = document.getElementById('cart-discount');
        const totalEl = document.getElementById('cart-total');
        const playerGoldEl = document.getElementById('cart-player-gold');
        const remainingGoldEl = document.getElementById('cart-remaining-gold');
        const remainingLabel = document.querySelector('.remaining-gold-row span:first-child');

        const playerGold = game?.player?.gold || 0;

        // for selling, player GAINS gold; for buying, player LOSES gold
        const remaining = this.mode === 'sell' ?
            playerGold + this.finalTotal :
            playerGold - this.finalTotal;

        if (subtotalEl) subtotalEl.textContent = `${this.baseTotal}g`;
        if (discountRowEl) {
            if (this.discountPercent > 0 && this.mode === 'buy') {
                discountRowEl.classList.remove('hidden');
                if (discountPercentEl) discountPercentEl.textContent = this.discountPercent;
                if (discountEl) discountEl.textContent = `-${discountAmount}g`;
            } else {
                discountRowEl.classList.add('hidden');
            }
        }
        if (totalEl) totalEl.innerHTML = `<strong>${this.finalTotal}g</strong>`;
        if (playerGoldEl) playerGoldEl.textContent = `${playerGold}g`;
        if (remainingLabel) {
            remainingLabel.textContent = this.mode === 'sell' ? 'After Sale:' : 'After Purchase:';
        }
        if (remainingGoldEl) {
            remainingGoldEl.textContent = `${remaining}g`;
            const row = remainingGoldEl.closest('.summary-row');
            if (row) {
                // For sell, always positive (green); for buy, red if negative
                row.classList.toggle('negative', this.mode === 'buy' && remaining < 0);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════
    validateCart() {
        const validationEl = document.getElementById('cart-validation');
        if (!validationEl) return;

        const messages = [];
        const playerGold = game?.player?.gold || 0;
        const playerWeight = this.getPlayerCurrentWeight();
        const playerMaxWeight = this.getPlayerMaxWeight();

        // Check if cart is empty
        if (this.cart.length === 0) {
            validationEl.innerHTML = '';
            return { valid: false, reason: 'empty' };
        }

        // buy mode validations
        if (this.mode === 'buy') {
            // Check gold
            if (this.finalTotal > playerGold) {
                messages.push({
                    type: 'error',
                    icon: '💰',
                    text: `Not enough gold! Need ${this.finalTotal - playerGold}g more.`
                });
            }

            // Check carry weight (only for buying - selling reduces weight)
            const totalWeight = this.cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
            const newWeight = playerWeight + totalWeight;
            if (newWeight > playerMaxWeight) {
                messages.push({
                    type: 'error',
                    icon: '🎒',
                    text: `Too heavy! Would exceed carry capacity by ${Math.ceil(newWeight - playerMaxWeight)} lbs.`
                });
            } else if (newWeight > playerMaxWeight * 0.9) {
                messages.push({
                    type: 'warning',
                    icon: '⚖️',
                    text: `Getting heavy! ${Math.ceil(playerMaxWeight - newWeight)} lbs remaining.`
                });
            }
        }

        // sell mode validations
        if (this.mode === 'sell') {
            // Check if player actually has the items
            for (const item of this.cart) {
                const playerQty = game?.player?.inventory?.[item.itemId] || 0;
                if (item.quantity > playerQty) {
                    messages.push({
                        type: 'error',
                        icon: '📦',
                        text: `You only have ${playerQty} ${item.name}!`
                    });
                }
            }

            // Show how much weight will be freed
            const totalWeight = this.cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
            if (totalWeight > 0) {
                messages.push({
                    type: 'success',
                    icon: '🎒',
                    text: `Selling will free up ${totalWeight.toFixed(1)} lbs of carry weight.`
                });
            }
        }

        // Check stock for each item (applies to both modes)
        for (const item of this.cart) {
            if (item.quantity > item.maxStock) {
                messages.push({
                    type: 'error',
                    icon: '📦',
                    text: `Only ${item.maxStock} ${item.name} available!`
                });
            }
        }

        // Render messages
        validationEl.innerHTML = messages.map(msg => `
            <div class="validation-msg ${msg.type}">
                <span>${msg.icon}</span>
                <span>${msg.text}</span>
            </div>
        `).join('');

        const hasErrors = messages.some(m => m.type === 'error');
        return { valid: !hasErrors, messages };
    },

    updateButtons() {
        const haggleBtn = document.getElementById('cart-haggle-btn');
        const completeBtn = document.getElementById('cart-complete-btn');

        const validation = this.validateCart();
        const canComplete = validation.valid && this.cart.length > 0;

        if (haggleBtn) {
            haggleBtn.disabled = this.haggleAttempted || this.cart.length === 0;
            if (this.haggleAttempted) {
                haggleBtn.innerHTML = '<span class="btn-icon">🗣️</span><span class="btn-text">Already Haggled</span>';
            }
        }

        if (completeBtn) {
            completeBtn.disabled = !canComplete;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // haggle system - talk your way to a discount
    // ═══════════════════════════════════════════════════════════════
    async attemptHaggle() {
        if (this.haggleAttempted || this.cart.length === 0) return;

        this.haggleAttempted = true;

        const panel = document.getElementById('trade-cart-panel');
        if (panel) panel.classList.add('haggling');

        // Show haggling in progress
        const haggleBtn = document.getElementById('cart-haggle-btn');
        if (haggleBtn) {
            haggleBtn.disabled = true;
            haggleBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Haggling...</span>';
        }

        // Calculate success chance based on player stats
        const successChance = this.calculateHaggleChance();
        const roll = Math.random() * 100;
        const success = roll < successChance;

        // try to get TTS/API response for haggle dialogue
        let haggleDialogue = '';
        try {
            haggleDialogue = await this.getHaggleDialogue(success);
        } catch (e) {
            console.warn('🗣️ Failed to get haggle dialogue:', e);
        }

        // Simulate a brief delay for drama
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (panel) panel.classList.remove('haggling');

        if (success) {
            // Calculate discount (5-20% based on charisma/rep)
            this.discountPercent = this.calculateDiscount();

            this.showHaggleResult(true, haggleDialogue || `"Fine, fine! ${this.discountPercent}% off, but don't tell anyone!"`);
        } else {
            this.showHaggleResult(false, haggleDialogue || `"Absolutely not! My prices are fair. Take it or leave it."`);
        }

        this.updateDisplay();
    },

    calculateHaggleChance() {
        // Base 30% chance, modified by charisma and reputation
        let chance = 30;

        // Charisma bonus (if exists)
        if (game?.player?.stats?.charisma) {
            chance += game.player.stats.charisma * 2; // +2% per charisma point
        }

        // Reputation bonus
        if (typeof ReputationSystem !== 'undefined') {
            const rep = ReputationSystem.getReputation?.() || 50;
            chance += (rep - 50) * 0.3; // +/- 0.3% per point from neutral
        }

        // Speech skill bonus
        if (typeof SkillSystem !== 'undefined') {
            const speechLevel = SkillSystem.getSkillLevel?.('speech') || 0;
            chance += speechLevel * 3; // +3% per speech level
        }

        // Clamp to 10-90%
        return Math.max(10, Math.min(90, chance));
    },

    calculateDiscount() {
        // Base 5% discount, up to 20%
        let discount = 5;

        // Add based on charisma
        if (game?.player?.stats?.charisma) {
            discount += Math.floor(game.player.stats.charisma / 2);
        }

        // Add based on speech skill
        if (typeof SkillSystem !== 'undefined') {
            const speechLevel = SkillSystem.getSkillLevel?.('speech') || 0;
            discount += Math.floor(speechLevel * 0.5);
        }

        return Math.min(20, discount);
    },

    async getHaggleDialogue(success) {
        // try to get dialogue from NPC voice system
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.generateHaggleResponse) {
            try {
                return await NPCVoiceChatSystem.generateHaggleResponse(
                    this.currentMerchant,
                    success,
                    this.discountPercent
                );
            } catch (e) {
                console.warn('🎭 Voice system unavailable for haggle');
            }
        }

        // try TTS API if available
        if (typeof TextToSpeechAPI !== 'undefined' && TextToSpeechAPI.generateResponse) {
            const prompt = success
                ? `You are a medieval merchant. The customer successfully haggled. Grudgingly agree to give them a ${this.discountPercent}% discount. Be dramatic but brief.`
                : `You are a medieval merchant. The customer tried to haggle but failed. Firmly but politely refuse. Be brief.`;

            try {
                return await TextToSpeechAPI.generateResponse(prompt);
            } catch (e) {
                console.warn('🔮 TTS API unavailable');
            }
        }

        return null;
    },

    showHaggleResult(success, dialogue) {
        const validationEl = document.getElementById('cart-validation');
        if (!validationEl) return;

        const resultHtml = `
            <div class="validation-msg ${success ? 'success' : 'warning'}">
                <span>${success ? '🎉' : '😤'}</span>
                <span>${this.escapeHtml(dialogue)}</span>
            </div>
        `;

        validationEl.innerHTML = resultHtml + validationEl.innerHTML;

        // Play sound if available
        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play?.(success ? 'success' : 'fail');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPLETE TRADE
    // ═══════════════════════════════════════════════════════════════
    completeTrade() {
        const validation = this.validateCart();
        if (!validation.valid || this.cart.length === 0) return;

        // check if this is a market trade or NPC trade
        const isMarketTrade = this.currentMerchant?.type === 'market';

        if (this.mode === 'buy') {
            this.completeBuyTransaction(isMarketTrade);
        } else {
            this.completeSellTransaction(isMarketTrade);
        }

        // update UI
        if (typeof game !== 'undefined' && game.updateUI) {
            game.updateUI();
        }
        // Refresh market display
        if (isMarketTrade) {
            if (typeof updateMarketDisplay === 'function') updateMarketDisplay();
            if (typeof populateMarketItems === 'function') populateMarketItems();
        }

        this.close();
    },

    // buy transaction
    completeBuyTransaction(isMarketTrade) {
        // deduct gold - priority fallback chain for different systems
        const itemNames = this.cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.remove(this.finalTotal, `bought ${itemNames}`);
        } else if (typeof UniversalGoldManager !== 'undefined') {
            UniversalGoldManager.removeGold(this.finalTotal, `bought ${itemNames}`);
            if (game?.player) game.player.gold = UniversalGoldManager.getPersonalGold();
        } else if (game?.player) {
            game.player.gold -= this.finalTotal;
        }

        // add items to inventory
        for (const item of this.cart) {
            this.addToInventory(item.itemId, item.quantity);
        }

        // update merchant/market stock
        if (isMarketTrade && this.currentMerchant?.id) {
            const location = typeof GameWorld !== 'undefined' ?
                GameWorld.locations[this.currentMerchant.id] : null;

            if (location?.marketPrices) {
                for (const item of this.cart) {
                    if (location.marketPrices[item.itemId]) {
                        location.marketPrices[item.itemId].stock =
                            Math.max(0, location.marketPrices[item.itemId].stock - item.quantity);

                        if (typeof DynamicMarketSystem !== 'undefined') {
                            DynamicMarketSystem.updateSupplyDemand?.(this.currentMerchant.id, item.itemId, item.quantity);
                            DynamicMarketSystem.applyMarketSaturation?.(this.currentMerchant.id, item.itemId);
                        }
                    }
                }
                if (typeof NPCMerchantSystem !== 'undefined') {
                    NPCMerchantSystem.addMerchantGold?.(this.currentMerchant.id, this.finalTotal);
                }
            }
        }

        // NPC TRADE - update NPC's persistent inventory
        if (!isMarketTrade && this.currentMerchant && typeof NPCTradeWindow !== 'undefined') {
            // Player bought items FROM NPC - remove items from NPC, add gold to NPC
            for (const item of this.cart) {
                NPCTradeWindow.removeNPCItem(this.currentMerchant, item.itemId, item.quantity);
            }
            NPCTradeWindow.modifyNPCGold(this.currentMerchant, this.finalTotal);
            console.log(`🛒 NPC Trade: ${this.currentMerchant.name || this.currentMerchant.type} received ${this.finalTotal}g for items`);
        }

        // show success message
        const itemCount = this.cart.reduce((sum, i) => sum + i.quantity, 0);
        const message = `Purchased ${itemCount} item(s) for ${this.finalTotal}g`;
        if (typeof addMessage === 'function') addMessage(message);

        // dispatch trade-completed event (for trade objectives)
        document.dispatchEvent(new CustomEvent('trade-completed', {
            detail: { items: [...this.cart], total: this.finalTotal, discount: this.discountPercent, merchant: this.currentMerchant, mode: 'buy' }
        }));

        // dispatch item-purchased for EACH item (for buy objectives)
        for (const item of this.cart) {
            document.dispatchEvent(new CustomEvent('item-purchased', {
                detail: { itemId: item.itemId, quantity: item.quantity, price: item.price * item.quantity, merchant: this.currentMerchant?.id }
            }));
        }
    },

    // sell transaction
    completeSellTransaction(isMarketTrade) {
        // check if NPC can afford to buy items
        if (!isMarketTrade && this.currentMerchant && typeof NPCTradeWindow !== 'undefined') {
            const npcGold = NPCTradeWindow.getNPCGold(this.currentMerchant);
            if (npcGold < this.finalTotal) {
                const message = `${this.currentMerchant.name || 'The NPC'} can't afford this! They only have ${npcGold}g.`;
                if (typeof addMessage === 'function') addMessage(message);
                return;
            }
        }

        // add gold - priority fallback chain for different systems
        const itemNames = this.cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.add(this.finalTotal, `sold ${itemNames}`);
        } else if (typeof UniversalGoldManager !== 'undefined') {
            UniversalGoldManager.addGold(this.finalTotal, `sold ${itemNames}`);
            if (game?.player) game.player.gold = UniversalGoldManager.getPersonalGold();
        } else if (game?.player) {
            game.player.gold += this.finalTotal;
        }

        // remove items from inventory
        for (const item of this.cart) {
            this.removeFromInventory(item.itemId, item.quantity);
        }

        // add items to market stock (player is selling TO the market)
        if (isMarketTrade && this.currentMerchant?.id) {
            const location = typeof GameWorld !== 'undefined' ?
                GameWorld.locations[this.currentMerchant.id] : null;

            if (location?.marketPrices) {
                for (const item of this.cart) {
                    if (location.marketPrices[item.itemId]) {
                        location.marketPrices[item.itemId].stock += item.quantity;
                    } else {
                        // Item didn't exist in market, add it
                        const basePrice = typeof ItemDatabase !== 'undefined' ?
                            ItemDatabase.calculatePrice?.(item.itemId) || item.unitPrice : item.unitPrice;
                        location.marketPrices[item.itemId] = {
                            price: Math.round(basePrice * 1.2), // Mark up for resale
                            stock: item.quantity
                        };
                    }

                    if (typeof DynamicMarketSystem !== 'undefined') {
                        DynamicMarketSystem.updateSupplyDemand?.(this.currentMerchant.id, item.itemId, -item.quantity);
                    }
                }

                // remove gold from merchant's coffers
                if (typeof NPCMerchantSystem !== 'undefined') {
                    NPCMerchantSystem.deductMerchantGold?.(this.currentMerchant.id, this.finalTotal, 'trade cart sale');
                }
            }
        }

        // NPC TRADE - update NPC's persistent inventory
        if (!isMarketTrade && this.currentMerchant && typeof NPCTradeWindow !== 'undefined') {
            // Player sold items TO NPC - add items to NPC, remove gold from NPC
            for (const item of this.cart) {
                NPCTradeWindow.addNPCItem(this.currentMerchant, item.itemId, item.quantity);
            }
            NPCTradeWindow.modifyNPCGold(this.currentMerchant, -this.finalTotal);
            console.log(`🛒 NPC Trade: ${this.currentMerchant.name || this.currentMerchant.type} spent ${this.finalTotal}g on items`);
        }

        // show success message
        const itemCount = this.cart.reduce((sum, i) => sum + i.quantity, 0);
        const message = `Sold ${itemCount} item(s) for ${this.finalTotal}g`;
        if (typeof addMessage === 'function') addMessage(message);

        // dispatch event
        document.dispatchEvent(new CustomEvent('trade-completed', {
            detail: { items: [...this.cart], total: this.finalTotal, merchant: this.currentMerchant, mode: 'sell' }
        }));
    },

    // remove items from inventory
    removeFromInventory(itemId, quantity) {
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.remove(itemId, quantity, 'trade_cart_sell');
        } else if (game?.player?.inventory) {
            if (game.player.inventory[itemId]) {
                game.player.inventory[itemId] -= quantity;
                const newTotal = game.player.inventory[itemId] || 0;
                if (game.player.inventory[itemId] <= 0) {
                    delete game.player.inventory[itemId];
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('inventory:item:removed', {
                        itemId: itemId,
                        quantity: quantity,
                        newTotal: newTotal,
                        reason: 'trade_cart_sell'
                    });
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // helper functions
    // ═══════════════════════════════════════════════════════════════
    addToInventory(itemId, quantity) {
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(itemId, quantity, 'trade_cart_buy');
        } else if (game?.player?.inventory) {
            if (game.player.inventory[itemId]) {
                game.player.inventory[itemId] += quantity;
            } else {
                game.player.inventory[itemId] = quantity;
            }

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: game.player.inventory[itemId],
                    reason: 'trade_cart_buy'
                });
            }
        }
    },

    getPlayerCurrentWeight() {
        if (typeof InventorySystem !== 'undefined' && InventorySystem.getCurrentWeight) {
            return InventorySystem.getCurrentWeight();
        }
        // Fallback calculation
        let weight = 0;
        if (game?.player?.inventory) {
            for (const [itemId, qty] of Object.entries(game.player.inventory)) {
                const itemWeight = ItemDatabase?.getItem?.(itemId)?.weight || 1;
                weight += itemWeight * qty;
            }
        }
        return weight;
    },

    getPlayerMaxWeight() {
        if (typeof InventorySystem !== 'undefined' && InventorySystem.getMaxWeight) {
            return InventorySystem.getMaxWeight();
        }
        // Fallback - base 100 + strength bonus
        const baseWeight = 100;
        const strBonus = (game?.player?.stats?.strength || 10) * 5;
        return baseWeight + strBonus;
    },

    getItemIcon(itemId) {
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
            const item = ItemDatabase.getItem(itemId);
            return item?.icon || '📦';
        }
        return '📦';
    },

    formatItemName(itemId) {
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
            const item = ItemDatabase.getItem(itemId);
            if (item?.name) return item.name;
        }
        // Fallback: convert snake_case to Title Case
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// register with Bootstrap
Bootstrap.register('TradeCartPanel', () => TradeCartPanel.init(), {
    dependencies: ['TradingSystem', 'PanelManager'],
    priority: 100,
    severity: 'optional'
});

// export for the void
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradeCartPanel;
}
