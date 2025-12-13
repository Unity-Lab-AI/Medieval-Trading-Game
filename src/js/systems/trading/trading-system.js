// 
// TRADING SYSTEM - where greed becomes gameplay
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const TradingSystem = {
    // config - how we're gonna hustle today
    tradeMode: 'single', // 'single' or 'bulk' (for the ambitious)
    selectedTradeItems: new Map(),
    tradeHistory: [],
    priceAlerts: [],

    // escape HTML to prevent XSS - sanitize or die 
    _escapeHTML(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    // initialize - let the exploitation begin
    init() {
        this.setupEventListeners();
        this.updateTradeHistoryDisplay();
        this.updatePriceAlertsDisplay();
    },
    
    // setup event listeners - watching for opportunities (and mistakes)
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
    
    // set trade mode - choosing your flavor of capitalism
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
    
    // select all buy items - going full shopaholic
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
    
    // select all sell items - liquidating the hoard
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
    
    // clear selection - buyer's remorse prevention
    clearSelection(type) {
        this.selectedTradeItems.clear();
        
        const selector = type === 'buy' ? '#buy-items .market-item' : '#sell-items .market-item';
        const items = document.querySelectorAll(selector);
        items.forEach(itemElement => {
            itemElement.classList.remove('selected');
        });
        
        this.updateTradeSummary();
    },
    
    // buy selected items - spending money we may not have
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
    
    // sell selected items - parting with our precious belongings
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
    
    // count your coins and cry - this is what you chose
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
    
    // preview your financial death before you commit to it
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
    
    // carve another scar into your ledger - remember what you paid for greed
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
    
    // display your shameful history of financial decisions
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
    
    // set a trap for opportunity - or desperation, hard to tell the difference
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
    
    // kill the alert - some dreams aren't worth chasing anymore
    removePriceAlert(itemId) {
        this.priceAlerts = this.priceAlerts.filter(alert => alert.itemId !== itemId);
        this.updatePriceAlertsDisplay();
    },
    
    // obsessively check if the market's moved - we're addicted to this shit
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
    
    // show our desperate watch list - these prices haunt us
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

    // burn the ledger - pretend the mistakes never happened
    clearTradeHistory() {
        this.tradeHistory = [];
        this.updateTradeHistoryDisplay();
        addMessage('Trade history cleared!');
    },
    
    // download your shame - document every gold piece lost to greed
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