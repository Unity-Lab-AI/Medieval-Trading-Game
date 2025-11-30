// ═══════════════════════════════════════════════════════════════
// 💰 TRADING SYSTEM - capitalism simulator for the medieval masochist
// ═══════════════════════════════════════════════════════════════
// buy low, sell high, cry always... the trader's way
// File Version: GameConfig.version.file
// Game Version: 0.2
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com

const TradingSystem = {
    // ⚙️ Config - how we're gonna hustle today
    tradeMode: 'single', // 'single' or 'bulk' (for the ambitious)
    selectedTradeItems: new Map(),
    tradeHistory: [],
    priceAlerts: [],
    
    // 🌙 Initialize - let the exploitation begin
    init() {
        this.setupEventListeners();
        this.updateTradeHistoryDisplay();
        this.updatePriceAlertsDisplay();
    },
    
    // 👂 Setup event listeners - watching for opportunities (and mistakes)
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
    
    // 🔀 Set trade mode - choosing your flavor of capitalism
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
    
    // 🛒 Select all buy items - going full shopaholic
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
    
    // 💸 Select all sell items - liquidating the hoard
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
    
    // 🧹 Clear selection - buyer's remorse prevention
    clearSelection(type) {
        this.selectedTradeItems.clear();
        
        const selector = type === 'buy' ? '#buy-items .market-item' : '#sell-items .market-item';
        const items = document.querySelectorAll(selector);
        items.forEach(itemElement => {
            itemElement.classList.remove('selected');
        });
        
        this.updateTradeSummary();
    },
    
    // 🛍️ Buy selected items - spending money we may not have
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
    
    // 💰 Sell selected items - parting with our precious belongings
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
    
    // 📊 Update trade summary - tallying the damage
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
            
            // calculate profit - the whole point of this suffering
            const sellPrice = Math.round(price * 0.7); // Base sell price
            totalProfit += (sellPrice - price) * quantity;
        }
        
        totalElement.textContent = `Total: ${totalCost} gold`;
        profitElement.textContent = `Profit: ${totalProfit} gold`;
    },
    
    // 👁️ Update trade preview - see the pain before committing
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
    
    // 📜 Record trade - documenting our financial journey
    recordTrade(type, items) {
        const trade = {
            type: type, // 'buy' or 'sell'
            timestamp: Date.now(),
            location: game.currentLocation.id,
            items: Array.from(items.entries()).map(([id, qty]) => ({
                itemId: id,
                quantity: qty,
                itemName: ItemDatabase.getItemName(id)
            }))
        };
        
        this.tradeHistory.unshift(trade);
        
        // keep only last 50 trades - can't hoard memories forever
        if (this.tradeHistory.length > 50) {
            this.tradeHistory = this.tradeHistory.slice(0, 50);
        }
        
        this.updateTradeHistoryDisplay();
    },
    
    // 📋 Update trade history - a gallery of past choices
    updateTradeHistoryDisplay() {
        const historyContainer = document.getElementById('trade-history');
        if (!historyContainer) return;
        
        if (this.tradeHistory.length === 0) {
            historyContainer.innerHTML = '<p>No trade history available.</p>';
            return;
        }
        
        historyContainer.innerHTML = this.tradeHistory.map(trade => `
            <div class="trade-history-item">
                <div class="trade-type">${trade.type.toUpperCase()}</div>
                <div class="trade-items">${trade.items.map(item => `${item.itemName} ×${item.quantity}`).join(', ')}</div>
                <div class="trade-location">${trade.location}</div>
                <div class="trade-time">${new Date(trade.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    },
    
    // 🔔 Add price alert - notifying us when the market moves
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
    
    // 🗑️ Remove price alert - giving up on that dream
    removePriceAlert(itemId) {
        this.priceAlerts = this.priceAlerts.filter(alert => alert.itemId !== itemId);
        this.updatePriceAlertsDisplay();
    },
    
    // 👀 Check price alerts - stalking the market like an ex
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
                
                // deactivate one-time alerts - they served their purpose
                if (alert.type !== 'persistent') {
                    alert.active = false;
                }
            }
        });
    },
    
    // 📱 Update price alerts - our market stalker list
    updatePriceAlertsDisplay() {
        const alertsContainer = document.getElementById('price-alerts');
        if (!alertsContainer) return;
        
        if (this.priceAlerts.length === 0) {
            alertsContainer.innerHTML = '<p>No price alerts set.</p>';
            return;
        }
        
        alertsContainer.innerHTML = this.priceAlerts.map(alert => `
            <div class="price-alert-item ${!alert.active ? 'inactive' : ''}">
                <div class="alert-info">
                    <div class="alert-item">${alert.itemName}</div>
                    <div class="alert-target">${alert.type} ${alert.targetPrice} gold</div>
                    <div class="alert-status">${alert.active ? 'Active' : 'Inactive'}</div>
                </div>
                <button class="remove-alert-btn" onclick="TradingSystem.removePriceAlert('${alert.itemId}')">×</button>
            </div>
        `).join('');
    },
    
    // 🖤 DUPLICATE FUNCTIONS REMOVED - they were haunting lines 266-283 and 333-352
    // the originals live on, the clones have been exorcised

    // 🧹 Clear trade history - erasing the evidence
    clearTradeHistory() {
        this.tradeHistory = [];
        this.updateTradeHistoryDisplay();
        addMessage('Trade history cleared!');
    },
    
    // 📤 Export trade history - keeping receipts like a true adult
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

// Initialize trading system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            TradingSystem.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        TradingSystem.init();
    }, 100);
}