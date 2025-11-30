// ═══════════════════════════════════════════════════════════════
// MARKET PRICE HISTORY - graphs of your failures
// ═══════════════════════════════════════════════════════════════
// Version: 0.88 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const MarketPriceHistory = {
    // 📉 Price history data - memories of better prices
    priceHistory: {},
    
    // Maximum history entries per item per city
    maxHistoryEntries: 50,
    
    // Initialize price history system
    init() {
        this.loadPriceHistory();
    },
    
    // Load price history from localStorage
    loadPriceHistory() {
        const saved = localStorage.getItem('tradingGamePriceHistory');
        if (saved) {
            try {
                this.priceHistory = JSON.parse(saved);
            } catch (e) {
                // 🖤 Corrupt data? Nuke it and start fresh - silent fallback
                localStorage.removeItem('tradingGamePriceHistory');
                this.priceHistory = {};
            }
        }
    },
    
    // Save price history to localStorage
    savePriceHistory() {
        try {
            localStorage.setItem('tradingGamePriceHistory', JSON.stringify(this.priceHistory));
        } catch (e) {
            // 🖤 Storage full or blocked - silent fail, not critical
        }
    },
    
    // Record price for an item in a city
    recordPrice(cityId, itemId, price) {
        if (!this.priceHistory[cityId]) {
            this.priceHistory[cityId] = {};
        }
        
        if (!this.priceHistory[cityId][itemId]) {
            this.priceHistory[cityId][itemId] = [];
        }
        
        const priceEntry = {
            price: price,
            timestamp: TimeSystem.getTotalMinutes(),
            date: new Date().toISOString()
        };
        
        this.priceHistory[cityId][itemId].push(priceEntry);
        
        // Keep only recent entries
        if (this.priceHistory[cityId][itemId].length > this.maxHistoryEntries) {
            this.priceHistory[cityId][itemId] = this.priceHistory[cityId][itemId].slice(-this.maxHistoryEntries);
        }
        
        this.savePriceHistory();
    },
    
    // Get price trend for an item in a city
    getPriceTrend(cityId, itemId, timeRange = 7) {
        const history = this.priceHistory[cityId]?.[itemId];
        if (!history || history.length < 2) {
            return 'stable';
        }
        
        // Get recent prices within time range (in minutes)
        const currentTime = TimeSystem.getTotalMinutes();
        const recentPrices = history.filter(entry => currentTime - entry.timestamp <= timeRange * 24 * 60); // timeRange days in minutes
        
        if (recentPrices.length < 2) {
            return 'stable';
        }
        
        // Calculate trend
        const prices = recentPrices.map(entry => entry.price);
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        // Determine trend
        if (lastPrice > firstPrice * 1.05) { // 5% increase
            return 'rising';
        } else if (lastPrice < firstPrice * 0.95) { // 5% decrease
            return 'falling';
        } else if (Math.abs(lastPrice - avgPrice) < avgPrice * 0.02) { // Within 2% of average
            return 'stable';
        } else if (lastPrice > avgPrice) {
            return 'rising';
        } else {
            return 'falling';
        }
    },
    
    // Get price statistics for an item in a city
    getPriceStats(cityId, itemId) {
        const history = this.priceHistory[cityId]?.[itemId];
        if (!history || history.length === 0) {
            return null;
        }
        
        const prices = history.map(entry => entry.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const currentPrice = prices[prices.length - 1];
        
        return {
            min: minPrice,
            max: maxPrice,
            average: Math.round(avgPrice),
            current: currentPrice,
            volatility: Math.round(((maxPrice - minPrice) / avgPrice) * 100) / 100
        };
    },
    
    // Compare prices across cities
    comparePrices(itemId) {
        const comparisons = [];
        
        for (const [cityId, cityData] of Object.entries(GameWorld.locations)) {
            const history = this.priceHistory[cityId]?.[itemId];
            if (!history || history.length === 0) continue;
            
            const stats = this.getPriceStats(cityId, itemId);
            if (!stats) continue;
            
            const trend = this.getPriceTrend(cityId, itemId);
            
            comparisons.push({
                cityId: cityId,
                cityName: cityData.name,
                currentPrice: stats.current,
                averagePrice: stats.average,
                minPrice: stats.min,
                maxPrice: stats.max,
                trend: trend,
                stock: cityData.marketPrices?.[itemId]?.stock || 0
            });
        }
        
        // Sort by best price (lowest)
        comparisons.sort((a, b) => a.currentPrice - b.currentPrice);
        
        return comparisons;
    },
    
    // Get price history for UI display
    getPriceHistoryDisplay(cityId, itemId, maxEntries = 10) {
        const history = this.priceHistory[cityId]?.[itemId];
        if (!history || history.length === 0) {
            return '<p>No price history available.</p>';
        }
        
        const recentHistory = history.slice(-maxEntries).reverse();
        
        return recentHistory.map(entry => `
            <div class="price-history-entry">
                <div class="price">${entry.price} gold</div>
                <div class="date">${new Date(entry.date).toLocaleString()}</div>
            </div>
        `).join('');
    },
    
    // Get all price history for save system
    getAllPriceHistory() {
        return this.priceHistory;
    },
    
    // Load price history from save system (used when loading a saved game)
    loadPriceHistoryFromSave(history) {
        this.priceHistory = history || {};
        this.savePriceHistory();
    },
    
    // Clear price history
    clearPriceHistory(cityId = null, itemId = null) {
        if (cityId && itemId) {
            // Clear specific item history in specific city
            if (this.priceHistory[cityId]) {
                delete this.priceHistory[cityId][itemId];
            }
        } else if (cityId) {
            // Clear all history for specific city
            delete this.priceHistory[cityId];
        } else {
            // Clear all history
            this.priceHistory = {};
        }
        
        this.savePriceHistory();
        addMessage('Price history cleared!');
    },
    
    // Export price history
    exportPriceHistory() {
        const dataStr = JSON.stringify(this.priceHistory, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `price_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addMessage('Price history exported!');
    }
};

// Initialize price history system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MarketPriceHistory.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        MarketPriceHistory.init();
    }, 100);
}