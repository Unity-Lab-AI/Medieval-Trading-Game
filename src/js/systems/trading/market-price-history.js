// 
// MARKET PRICE HISTORY - graphs of your failures
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const MarketPriceHistory = {
    // price history data - memories of better prices
    priceHistory: {},
    
    // Maximum history entries per item per city
    maxHistoryEntries: 50,
    
    // wake up the price tracker - time to document financial pain
    init() {
        this.loadPriceHistory();
    },
    
    // resurrect old price data from the digital tomb
    loadPriceHistory() {
        const saved = localStorage.getItem('tradingGamePriceHistory');
        if (saved) {
            try {
                this.priceHistory = JSON.parse(saved);
            } catch (e) {
                // corrupt data? Nuke it and start fresh - silent fallback
                localStorage.removeItem('tradingGamePriceHistory');
                this.priceHistory = {};
            }
        }
    },
    
    // bury price memories in localStorage for future torment
    savePriceHistory() {
        try {
            localStorage.setItem('tradingGamePriceHistory', JSON.stringify(this.priceHistory));
        } catch (e) {
            // storage full or blocked - silent fail, not critical
        }
    },
    
    // carve another price into history's flesh - never forget what you paid
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
        
        // forget ancient prices - we only keep fresh wounds
        if (this.priceHistory[cityId][itemId].length > this.maxHistoryEntries) {
            this.priceHistory[cityId][itemId] = this.priceHistory[cityId][itemId].slice(-this.maxHistoryEntries);
        }
        
        this.savePriceHistory();
    },
    
    // watch prices rise or fall like your self-esteem during market hours
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
        
        // crunch the numbers - is this going up or down to hell?
        const prices = recentPrices.map(entry => entry.price);
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        // is it rising (pain) or falling (missed opportunity)?
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
    
    // compile the damage - min, max, avg prices to haunt you
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
    
    // shop around - find which city bleeds you the least
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
        
        // sort by who'll screw you over the least
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
    
    // erase the past - pretend you never paid those prices
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
    
    // download all your financial regrets as a nice JSON file
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

// register with Bootstrap
Bootstrap.register('MarketPriceHistory', () => MarketPriceHistory.init(), {
    dependencies: ['ItemDatabase', 'GameWorld'],
    priority: 44,
    severity: 'optional'
});