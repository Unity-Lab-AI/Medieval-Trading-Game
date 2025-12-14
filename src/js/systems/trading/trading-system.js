// 
// TRADING SYSTEM - where greed becomes gameplay
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

/**
 * @fileoverview Trading System - Manages player trading, bulk operations, price alerts
 * @module TradingSystem
 */

const TradingSystem = {
    /** @type {'single'|'bulk'} Current trade mode */
    tradeMode: 'single',
    /** @type {Map<string, number>} Selected items for bulk trading (itemId -> quantity) */
    selectedTradeItems: new Map(),
    /** @type {Array<Object>} History of completed trades */
    tradeHistory: [],
    /** @type {Array<Object>} Active price alerts */
    priceAlerts: [],

    /**
     * Escape HTML to prevent XSS injection
     * @private
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for innerHTML
     */
    _escapeHTML(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * Initialize the trading system
     * Sets up event listeners and displays
     * @returns {void}
     */
    init() {
        this.setupEventListeners();
        this.updateTradeHistoryDisplay();
        this.updatePriceAlertsDisplay();
    },

    /**
     * Set up DOM event listeners for trading UI
     * @private
     * @returns {void}
     */
    setupEventListeners() {
        // trade mode toggle - single item or going full hoarder
        const singleBtn = document.getElementById('single-trade-btn');
        const bulkBtn = document.getElementById('bulk-trade-btn');
        
        if (singleBtn) {
            EventManager.addEventListener(singleBtn, 'click', () => this.setTradeMode('single'));
        }
        
        if (bulkBtn) {
            EventManager.addEventListener(bulkBtn, 'click', () => this.setTradeMode('bulk'));
        }
        
        // trade actions - buttons for your financial decisions (regrets)
        const selectAllBuyBtn = document.getElementById('select-all-buy-btn');
        const clearSelectionBuyBtn = document.getElementById('clear-selection-buy-btn');
        const buySelectedBtn = document.getElementById('buy-selected-btn');
        
        if (selectAllBuyBtn) {
            EventManager.addEventListener(selectAllBuyBtn, 'click', () => this.selectAllBuyItems());
        }
        
        if (clearSelectionBuyBtn) {
            EventManager.addEventListener(clearSelectionBuyBtn, 'click', () => this.clearSelection('buy'));
        }
        
        if (buySelectedBtn) {
            EventManager.addEventListener(buySelectedBtn, 'click', () => this.buySelectedItems());
        }
        
        const selectAllSellBtn = document.getElementById('select-all-sell-btn');
        const clearSelectionSellBtn = document.getElementById('clear-selection-sell-btn');
        const sellSelectedBtn = document.getElementById('sell-selected-btn');
        
        if (selectAllSellBtn) {
            EventManager.addEventListener(selectAllSellBtn, 'click', () => this.selectAllSellItems());
        }
        
        if (clearSelectionSellBtn) {
            EventManager.addEventListener(clearSelectionSellBtn, 'click', () => this.clearSelection('sell'));
        }
        
        if (sellSelectedBtn) {
            EventManager.addEventListener(sellSelectedBtn, 'click', () => this.sellSelectedItems());
        }
    },
    
    /**
     * Set the trading mode (single item or bulk)
     * @param {'single'|'bulk'} mode - Trade mode to set
     * @returns {void}
     * @fires updateMarketDisplay
     */
    setTradeMode(mode) {
        this.tradeMode = mode;
        
        // update button states - visual feedback for the anxiety
        const singleBtn = document.getElementById('single-trade-btn');
        const bulkBtn = document.getElementById('bulk-trade-btn');
        
        if (singleBtn && bulkBtn) {
            singleBtn.classList.toggle('active', mode === 'single');
            bulkBtn.classList.toggle('active', mode === 'bulk');
        }
        
        // show/hide bulk controls - for the overachievers
        const buyControls = document.getElementById('bulk-buy-controls');
        const sellControls = document.getElementById('bulk-sell-controls');
        
        if (buyControls) {
            buyControls.classList.toggle('hidden', mode !== 'bulk');
        }
        
        if (sellControls) {
            sellControls.classList.toggle('hidden', mode !== 'bulk');
        }
        
        // clear selection - fresh start, fresh regrets
        this.selectedTradeItems.clear();
        this.updateTradeSummary();
        updateMarketDisplay();
    },
    
    /**
     * Select all available items for purchase in bulk mode
     * @returns {void}
     */
    selectAllBuyItems() {
        const buyItems = document.querySelectorAll('#buy-items .market-item');
        buyItems.forEach(itemElement => {
            const itemId = itemElement.dataset.itemId;
            if (itemId) {
                this.selectedTradeItems.set(itemId, 1);
                itemElement.classList.add('selected');
            }
        });
        this.updateTradeSummary();
    },
    
    /**
     * Select all player inventory items for sale in bulk mode
     * @returns {void}
     */
    selectAllSellItems() {
        const sellItems = document.querySelectorAll('#sell-items .market-item');
        sellItems.forEach(itemElement => {
            const itemId = itemElement.dataset.itemId;
            if (itemId) {
                this.selectedTradeItems.set(itemId, 1);
                itemElement.classList.add('selected');
            }
        });
        this.updateTradeSummary();
    },
    
    /**
     * Clear the current item selection
     * @param {'buy'|'sell'} type - Which selection to clear
     * @returns {void}
     */
    clearSelection(type) {
        this.selectedTradeItems.clear();
        
        const selector = type === 'buy' ? '#buy-items .market-item' : '#sell-items .market-item';
        const items = document.querySelectorAll(selector);
        items.forEach(itemElement => {
            itemElement.classList.remove('selected');
        });
        
        this.updateTradeSummary();
    },
    
    /**
     * Purchase all selected items in bulk mode
     * @returns {void}
     */
    buySelectedItems() {
        if (this.selectedTradeItems.size === 0) {
            addMessage('No items selected for purchase!');
            return;
        }
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            buyItem(itemId, quantity);
        }
        
        this.clearSelection('buy');
    },
    
    /**
     * Sell all selected items in bulk mode
     * @returns {void}
     */
    sellSelectedItems() {
        if (this.selectedTradeItems.size === 0) {
            addMessage('No items selected for sale!');
            return;
        }
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            sellItem(itemId, quantity);
        }
        
        this.clearSelection('sell');
    },
    
    /**
     * Update the trade summary display with total cost and profit
     * @returns {void}
     */
    updateTradeSummary() {
        const totalElement = document.getElementById('trade-total');
        const profitElement = document.getElementById('trade-profit');
        
        if (!totalElement || !profitElement) return;
        
        let totalCost = 0;
        let totalProfit = 0;
        
        for (const [itemId, quantity] of this.selectedTradeItems) {
            const item = ItemDatabase.getItem(itemId);
            if (!item) continue;
            
            const location = GameWorld.locations[game.currentLocation.id];
            if (!location || !location.marketPrices) continue;
            
            const marketData = location.marketPrices[itemId];
            if (!marketData) continue;
            
            const price = marketData.price || ItemDatabase.calculatePrice(itemId);
            totalCost += price * quantity;
            
            // profit - the only reason we're here rotting in this marketplace
            const sellPrice = Math.round(price * 0.7); // Base sell price
            totalProfit += (sellPrice - price) * quantity;
        }
        
        totalElement.textContent = `Total: ${totalCost} gold`;
        profitElement.textContent = `Profit: ${totalProfit} gold`;
    },
    
    /**
     * Update trade preview panel with item details
     * @param {string} itemId - Item to preview
     * @param {number} quantity - Quantity to preview
     * @returns {void}
     */
    updateTradePreview(itemId, quantity) {
        const previewElement = document.getElementById('trade-preview');
        if (!previewElement) return;
        
        const item = ItemDatabase.getItem(itemId);
        if (!item) return;
        
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location || !location.marketPrices) return;
        
        const marketData = location.marketPrices[itemId];
        const price = marketData?.price || ItemDatabase.calculatePrice(itemId);
        const weight = ItemDatabase.calculateWeight(itemId, quantity);
        
        previewElement.classList.remove('hidden');
        
        const itemsContainer = document.getElementById('trade-preview-items');
        const totalCostElement = document.getElementById('preview-total-cost');
        const totalWeightElement = document.getElementById('preview-total-weight');
        
        if (itemsContainer) {
            itemsContainer.innerHTML = `
                <div class="preview-item">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">×${quantity}</div>
                    <div class="item-price">${price} gold each</div>
                </div>
            `;
        }
        
        if (totalCostElement) {
            totalCostElement.textContent = price * quantity;
        }
        
        if (totalWeightElement) {
            totalWeightElement.textContent = weight.toFixed(1);
        }
    },
    
    /**
     * Record a completed trade to history
     * @param {'buy'|'sell'} type - Type of trade
     * @param {Map<string, number>} items - Items traded (itemId -> quantity)
     * @param {number} [price=0] - Total price of the trade
     * @returns {void}
     * @fires trade:completed
     */
    recordTrade(type, items, price) {
        const trade = {
            type: type, // 'buy' or 'sell'
            timestamp: Date.now(),
            location: game.currentLocation.id,
            items: Array.from(items.entries()).map(([id, qty]) => ({
                itemId: id,
                quantity: qty,
                itemName: ItemDatabase.getItemName(id)
            })),
            // track price to remember what we paid/earned
            price: price || 0
        };

        this.tradeHistory.unshift(trade);

        // forget the old wounds - we only remember the last 50 mistakes
        if (this.tradeHistory.length > 50) {
            this.tradeHistory = this.tradeHistory.slice(0, 50);
        }

        this.updateTradeHistoryDisplay();

        // emit trade event for systems that care
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('trade:completed', {
                type: type,
                items: trade.items,
                price: trade.price,
                location: trade.location,
                timestamp: trade.timestamp
            });
        }
    },
    
    /**
     * Update the trade history display in the UI
     * @returns {void}
     */
    updateTradeHistoryDisplay() {
        const historyContainer = document.getElementById('trade-history');
        if (!historyContainer) return;
        
        if (this.tradeHistory.length === 0) {
            historyContainer.innerHTML = '<p>No trade history available.</p>';
            return;
        }
        
        // escape all user-facing data to prevent XSS 
        historyContainer.innerHTML = this.tradeHistory.map(trade => `
            <div class="trade-history-item">
                <div class="trade-type">${this._escapeHTML(trade.type).toUpperCase()}</div>
                <div class="trade-items">${trade.items.map(item => `${this._escapeHTML(item.itemName)} ×${this._escapeHTML(item.quantity)}`).join(', ')}</div>
                <div class="trade-location">${this._escapeHTML(trade.location)}</div>
                <div class="trade-time">${this._escapeHTML(new Date(trade.timestamp).toLocaleString())}</div>
            </div>
        `).join('');
    },
    
    /**
     * Add a price alert for an item
     * @param {string} itemId - Item to monitor
     * @param {number} targetPrice - Target price threshold
     * @param {'below'|'above'|'persistent'} type - Alert trigger type
     * @returns {void}
     */
    addPriceAlert(itemId, targetPrice, type) {
        this.priceAlerts.push({
            itemId: itemId,
            itemName: ItemDatabase.getItemName(itemId),
            targetPrice: targetPrice,
            type: type, // 'below' or 'above'
            active: true
        });
        
        this.updatePriceAlertsDisplay();
    },
    
    /**
     * Remove a price alert for an item
     * @param {string} itemId - Item to stop monitoring
     * @returns {void}
     */
    removePriceAlert(itemId) {
        this.priceAlerts = this.priceAlerts.filter(alert => alert.itemId !== itemId);
        this.updatePriceAlertsDisplay();
    },
    
    /**
     * Check all price alerts against current market prices
     * Triggers notifications when thresholds are met
     * @returns {void}
     */
    checkPriceAlerts() {
        if (game.state !== GameState.PLAYING) return;
        
        const location = GameWorld.locations[game.currentLocation.id];
        if (!location || !location.marketPrices) return;
        
        this.priceAlerts.forEach(alert => {
            if (!alert.active) return;
            
            const marketData = location.marketPrices[alert.itemId];
            if (!marketData) return;
            
            const currentPrice = marketData.price;
            
            if ((alert.type === 'below' && currentPrice <= alert.targetPrice) ||
                (alert.type === 'above' && currentPrice >= alert.targetPrice)) {
                
                addMessage(`Price Alert: ${alert.itemName} is ${alert.type} your target of ${alert.targetPrice} gold! (Current: ${currentPrice} gold)`);
                
                // silence the alert - its screaming is done
                if (alert.type !== 'persistent') {
                    alert.active = false;
                }
            }
        });
    },
    
    /**
     * Update the price alerts display in the UI
     * @returns {void}
     */
    updatePriceAlertsDisplay() {
        const alertsContainer = document.getElementById('price-alerts');
        if (!alertsContainer) return;
        
        if (this.priceAlerts.length === 0) {
            alertsContainer.innerHTML = '<p>No price alerts set.</p>';
            return;
        }
        
        // FIX: Escape all user-facing values to prevent XSS injection
        alertsContainer.innerHTML = this.priceAlerts.map(alert => `
            <div class="price-alert-item ${!alert.active ? 'inactive' : ''}">
                <div class="alert-info">
                    <div class="alert-item">${this._escapeHTML(alert.itemName)}</div>
                    <div class="alert-target">${this._escapeHTML(alert.type)} ${this._escapeHTML(String(alert.targetPrice))} gold</div>
                    <div class="alert-status">${alert.active ? 'Active' : 'Inactive'}</div>
                </div>
                <button class="remove-alert-btn" onclick="TradingSystem.removePriceAlert('${this._escapeHTML(alert.itemId)}')">×</button>
            </div>
        `).join('');
    },

    /**
     * Clear all trade history
     * @returns {void}
     */
    clearTradeHistory() {
        this.tradeHistory = [];
        this.updateTradeHistoryDisplay();
        addMessage('Trade history cleared!');
    },
    
    /**
     * Export trade history to a JSON file download
     * @returns {void}
     */
    exportTradeHistory() {
        if (this.tradeHistory.length === 0) {
            addMessage('No trade history to export!');
            return;
        }
        
        const dataStr = JSON.stringify(this.tradeHistory, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trade_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addMessage('Trade history exported!');
    }
};

// register with Bootstrap
Bootstrap.register('TradingSystem', () => TradingSystem.init(), {
    dependencies: ['game', 'GoldManager', 'ItemDatabase'],
    priority: 45,
    severity: 'required'
});