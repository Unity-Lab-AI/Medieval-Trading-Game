// ═══════════════════════════════════════════════════════════════
// DYNAMIC MARKET SYSTEM - chaos masquerading as economy
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const DynamicMarketSystem = {
    // ⚙️ Market chaos configuration
    updateInterval: 5, // Update every 5 game minutes
    volatilityFactor: 0.1, // 10% price volatility
    saturationThreshold: 10, // Items bought/sold affect prices

    // Market saturation tracking
    marketSaturation: {},

    // ═══════════════════════════════════════════════════════════════
    // 💰 DAILY MERCHANT GOLD SUPPLY - they aint infinite you know
    // ═══════════════════════════════════════════════════════════════
    // each merchant has a daily gold limit based on market size

    // Base gold supply by market size
    MARKET_GOLD_LIMITS: {
        tiny: 500,
        small: 1500,
        medium: 4000,
        large: 10000,
        grand: 25000
    },

    // Track daily gold spent per merchant
    merchantGold: {},
    lastGoldResetDay: 0,

    // Get merchant's remaining gold for today
    getMerchantGold(locationId) {
        this.checkDailyGoldReset();

        const location = GameWorld.locations[locationId];
        if (!location) return 0;

        // Initialize if not tracked
        if (this.merchantGold[locationId] === undefined) {
            const marketSize = location.marketSize || 'small';
            this.merchantGold[locationId] = this.MARKET_GOLD_LIMITS[marketSize] || 1500;
        }

        return this.merchantGold[locationId];
    },

    // Check if merchant can afford to buy item
    canMerchantAfford(locationId, price) {
        const availableGold = this.getMerchantGold(locationId);
        return availableGold >= price;
    },

    // Deduct gold when merchant buys from player
    deductMerchantGold(locationId, amount) {
        this.checkDailyGoldReset();

        if (this.merchantGold[locationId] === undefined) {
            this.getMerchantGold(locationId); // Initialize
        }

        this.merchantGold[locationId] = Math.max(0, this.merchantGold[locationId] - amount);

        // Warn if merchant is running low
        const remaining = this.merchantGold[locationId];
        const location = GameWorld.locations[locationId];
        const maxGold = this.MARKET_GOLD_LIMITS[location?.marketSize || 'small'];

        if (remaining < maxGold * 0.25 && remaining > 0) {
            addMessage(`💰 ${location?.name || 'Merchant'} is running low on gold (${remaining} remaining today)`, 'warning');
        } else if (remaining <= 0) {
            addMessage(`💸 ${location?.name || 'Merchant'} has no more gold to spend today. come back tomorrow.`, 'warning');
        }
    },

    // Add gold back when player buys from merchant
    addMerchantGold(locationId, amount) {
        this.checkDailyGoldReset();

        if (this.merchantGold[locationId] === undefined) {
            this.getMerchantGold(locationId); // Initialize
        }

        const location = GameWorld.locations[locationId];
        const maxGold = this.MARKET_GOLD_LIMITS[location?.marketSize || 'small'];

        // Gold from sales goes back to merchant pool (up to max)
        this.merchantGold[locationId] = Math.min(maxGold, this.merchantGold[locationId] + amount);
    },

    // Check if day has changed and reset gold
    checkDailyGoldReset() {
        if (typeof TimeSystem === 'undefined') return;

        const currentDay = TimeSystem.currentDay;
        if (currentDay !== this.lastGoldResetDay) {
            this.resetDailyGold();
            this.lastGoldResetDay = currentDay;
        }
    },

    // Reset all merchant gold at start of new day
    resetDailyGold() {
        this.merchantGold = {};
        console.log('💰 DynamicMarketSystem: Daily merchant gold reset');
    },

    // Get merchant gold status for UI - 🖤 with division guard 💀
    getMerchantGoldStatus(locationId) {
        const current = this.getMerchantGold(locationId);
        const location = GameWorld.locations[locationId];
        const max = this.MARKET_GOLD_LIMITS[location?.marketSize || 'small'];
        // 🦇 Prevent division by zero
        const percent = max > 0 ? (current / max) * 100 : 0;

        let status, color;
        if (percent > 75) {
            status = 'Wealthy';
            color = '#4caf50';
        } else if (percent > 50) {
            status = 'Comfortable';
            color = '#8bc34a';
        } else if (percent > 25) {
            status = 'Limited';
            color = '#ff9800';
        } else if (percent > 0) {
            status = 'Nearly broke';
            color = '#f44336';
        } else {
            status = 'Out of gold';
            color = '#9e9e9e';
        }

        return {
            current,
            max,
            percent: Math.round(percent),
            status,
            color
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // 📦 DAILY ITEM DECAY SYSTEM - stock decreases over the day
    // ═══════════════════════════════════════════════════════════════
    // items reduce to 25% by end of day via explicit timer

    // Track original stock levels at day start
    originalStock: {},
    lastStockResetDay: 0,

    // Initialize stock tracking for a location
    initLocationStock(locationId) {
        const location = GameWorld.locations[locationId];
        if (!location?.sells) return;

        this.originalStock[locationId] = this.originalStock[locationId] || {};

        for (const itemId of location.sells) {
            if (this.originalStock[locationId][itemId] === undefined) {
                // 🖤💀 Random initial stock based on market size - BALANCED UP for better availability
                const marketSizes = { tiny: 12, small: 25, medium: 45, large: 65, grand: 90 };
                const baseStock = marketSizes[location.marketSize] || 25;
                const variance = Math.floor(Math.random() * baseStock * 0.5);
                this.originalStock[locationId][itemId] = baseStock + variance;
            }
        }
    },

    // Get current stock level accounting for daily decay
    getItemStock(locationId, itemId) {
        this.checkDailyStockReset();
        this.initLocationStock(locationId);

        const original = this.originalStock[locationId]?.[itemId] || 10;

        // Calculate decay based on time of day
        if (typeof TimeSystem === 'undefined') return original;

        const currentHour = TimeSystem.currentHour || 6; // Default to 6am
        const hoursIntoDay = currentHour - 6; // Day starts at 6am
        const dayLength = 18; // 18 waking hours (6am to midnight)

        // Linear decay: 100% at 6am → 25% at midnight
        const decayProgress = Math.max(0, Math.min(1, hoursIntoDay / dayLength));
        const stockMultiplier = 1 - (decayProgress * 0.75); // Decays to 25%

        return Math.max(1, Math.floor(original * stockMultiplier));
    },

    // Reduce stock when player buys
    reduceStock(locationId, itemId, amount) {
        this.initLocationStock(locationId);

        if (this.originalStock[locationId]?.[itemId] !== undefined) {
            this.originalStock[locationId][itemId] = Math.max(0,
                this.originalStock[locationId][itemId] - amount
            );
        }
    },

    // Add stock when player sells (merchants restock from purchases)
    addStock(locationId, itemId, amount) {
        this.initLocationStock(locationId);

        const location = GameWorld.locations[locationId];
        // 🖤💀 maxStock values - BALANCED UP for better merchant inventory capacity
        const marketSizes = { tiny: 25, small: 40, medium: 70, large: 110, grand: 150 };
        const maxStock = marketSizes[location?.marketSize] || 40;

        if (this.originalStock[locationId]?.[itemId] !== undefined) {
            this.originalStock[locationId][itemId] = Math.min(maxStock,
                this.originalStock[locationId][itemId] + Math.floor(amount * 0.5) // Only half goes to stock
            );
        }
    },

    // Check if day changed and reset stock
    checkDailyStockReset() {
        if (typeof TimeSystem === 'undefined') return;

        const currentDay = TimeSystem.currentDay;
        if (currentDay !== this.lastStockResetDay) {
            this.resetDailyStock();
            this.lastStockResetDay = currentDay;
        }
    },

    // 🖤 Market size lookup table - cached outside loop for performance 💀
    _marketSizes: { tiny: 12, small: 25, medium: 45, large: 65, grand: 90 },

    // Reset all stock at start of new day
    resetDailyStock() {
        // Keep some items from previous day (50% carry over)
        for (const locationId of Object.keys(this.originalStock)) {
            // 🖤 Cache location lookup ONCE per location instead of per-item 💀
            const location = GameWorld.locations[locationId];
            const baseStock = this._marketSizes[location?.marketSize] || 10;

            for (const itemId of Object.keys(this.originalStock[locationId])) {
                const variance = Math.floor(Math.random() * baseStock * 0.3);

                // Fresh restock + some leftover
                const leftover = Math.floor(this.originalStock[locationId][itemId] * 0.25);
                this.originalStock[locationId][itemId] = baseStock + variance + leftover;
            }
        }

        console.log('📦 DynamicMarketSystem: Daily stock reset');
    },

    // Get stock status for UI
    getStockStatus(locationId, itemId) {
        const current = this.getItemStock(locationId, itemId);
        const original = this.originalStock[locationId]?.[itemId] || 10;
        const percent = (current / original) * 100;

        let status, color, emoji;
        if (current <= 0) {
            status = 'Out of stock';
            color = '#9e9e9e';
            emoji = '❌';
        } else if (percent > 75) {
            status = 'Well stocked';
            color = '#4caf50';
            emoji = '📦';
        } else if (percent > 50) {
            status = 'Available';
            color = '#8bc34a';
            emoji = '📦';
        } else if (percent > 25) {
            status = 'Running low';
            color = '#ff9800';
            emoji = '⚠️';
        } else {
            status = 'Almost gone';
            color = '#f44336';
            emoji = '🔥';
        }

        return {
            current,
            original,
            percent: Math.round(percent),
            status,
            color,
            emoji
        };
    },

    // Initialize dynamic market system
    init() {
        // 🖤 Validate ItemDatabase exists before initializing 💀
        if (typeof ItemDatabase === 'undefined') {
            console.warn('⚠️ DynamicMarketSystem: ItemDatabase not loaded, skipping init');
            return;
        }

        this.loadMarketSaturation();
        this.startUpdateTimer();

        // 🦇 FIX: Ensure all locations have survival items on startup
        this.ensureAllLocationsSurvivalItems();

        console.log('💰 DynamicMarketSystem: Initialized with survival items and daily refresh');
    },
    
    // Load market saturation from localStorage
    loadMarketSaturation() {
        const saved = localStorage.getItem('tradingGameMarketSaturation');
        if (saved) {
            try {
                this.marketSaturation = JSON.parse(saved);
            } catch (e) {
                // 🖤 Corrupt data? Nuke it and start fresh 💀
                console.warn('⚠️ DynamicMarketSystem: localStorage data corrupted, clearing and resetting');
                localStorage.removeItem('tradingGameMarketSaturation');
                this.marketSaturation = {};
            }
        }
    },
    
    // Save market saturation to localStorage
    saveMarketSaturation() {
        try {
            localStorage.setItem('tradingGameMarketSaturation', JSON.stringify(this.marketSaturation));
        } catch (e) {
            // 🖤 Storage full or blocked - silent fail, not critical
        }
    },
    
    // Start update timer
    startUpdateTimer() {
        TimerManager.setInterval(() => {
            if (game.state === GameState.PLAYING && !TimeSystem.isPaused) {
                this.updateMarketPrices();
            }
        }, this.updateInterval * 60000); // Convert minutes to milliseconds
    },
    
    // Update market prices based on dynamic factors
    updateMarketPrices() {
        for (const [cityId, cityData] of Object.entries(GameWorld.locations)) {
            if (!cityData.marketPrices) continue;
            
            for (const [itemId, marketData] of Object.entries(cityData.marketPrices)) {
                const item = ItemDatabase.getItem(itemId);
                if (!item) continue;
                
                // Get base price
                const basePrice = ItemDatabase.calculatePrice(itemId);
                
                // Apply market saturation
                const saturation = this.getMarketSaturation(cityId, itemId);
                let saturationModifier = 1.0;
                
                if (saturation > this.saturationThreshold) {
                    // High saturation reduces prices
                    saturationModifier = 1.0 - ((saturation - this.saturationThreshold) / 100) * 0.3;
                }
                
                // Apply random volatility
                const volatility = (Math.random() - 0.5) * this.volatilityFactor;
                const priceModifier = saturationModifier * (1 + volatility);
                
                // Update price with bounds checking
                const newPrice = Math.round(basePrice * priceModifier);
                const minPrice = Math.round(basePrice * 0.5); // Minimum 50% of base price
                const maxPrice = Math.round(basePrice * 2.0); // Maximum 200% of base price
                
                marketData.price = Math.max(minPrice, Math.min(maxPrice, newPrice));
            }
        }
    },
    
    // Update supply and demand based on transactions
    updateSupplyDemand(cityId, itemId, quantity) {
        const saturationKey = `${cityId}_${itemId}`;
        if (!this.marketSaturation[saturationKey]) {
            this.marketSaturation[saturationKey] = {
                buyVolume: 0,
                sellVolume: 0,
                lastUpdate: Date.now()
            };
        }
        
        // Update volumes
        if (quantity > 0) {
            this.marketSaturation[saturationKey].buyVolume += quantity;
        } else {
            this.marketSaturation[saturationKey].sellVolume += Math.abs(quantity);
        }
        
        this.marketSaturation[saturationKey].lastUpdate = Date.now();
        this.saveMarketSaturation();
    },
    
    // Get market saturation for an item
    getMarketSaturation(cityId, itemId) {
        const saturationKey = `${cityId}_${itemId}`;
        const saturation = this.marketSaturation[saturationKey];
        
        if (!saturation) {
            return 0;
        }
        
        // Calculate total volume and decay over time
        const totalVolume = saturation.buyVolume + saturation.sellVolume;
        const timeSinceUpdate = Date.now() - saturation.lastUpdate;
        const daysSinceUpdate = timeSinceUpdate / (24 * 60 * 60 * 1000); // Convert to days
        
        // Decay saturation over time (5% per day)
        const decayFactor = Math.max(0.5, 1 - (daysSinceUpdate * 0.05));
        
        return totalVolume * decayFactor;
    },
    
    // Apply market saturation effects
    applyMarketSaturation(cityId, itemId) {
        const saturation = this.getMarketSaturation(cityId, itemId);
        const location = GameWorld.locations[cityId];
        
        if (!location || !location.marketPrices || !location.marketPrices[itemId]) {
            return;
        }
        
        const item = ItemDatabase.getItem(itemId);
        if (!item) return;
        
        // Apply saturation effects
        if (saturation > this.saturationThreshold) {
            // High saturation reduces stock
            location.marketPrices[itemId].stock = Math.max(1, Math.floor(location.marketPrices[itemId].stock * 0.7));
            
            // High saturation increases prices slightly
            location.marketPrices[itemId].price = Math.round(location.marketPrices[itemId].price * 1.1);
        }
    },
    
    // Generate market news based on current conditions
    generateMarketNews() {
        const news = [];
        const events = CityEventSystem.getAllActiveEvents();
        
        // Add event-based news
        events.forEach(event => {
            const location = GameWorld.locations[event.cityId];
            if (location) {
                news.push(`📢 ${event.name} in ${location.name}: ${event.description}`);
            }
        });
        
        // Add saturation-based news
        for (const [cityId, cityData] of Object.entries(GameWorld.locations)) {
            if (!cityData.marketPrices) continue;
            
            for (const [itemId, marketData] of Object.entries(cityData.marketPrices)) {
                const saturation = this.getMarketSaturation(cityId, itemId);
                const item = ItemDatabase.getItem(itemId);
                
                if (!item) continue;
                
                if (saturation > this.saturationThreshold * 1.5) {
                    news.push(`📉 ${item.name} prices soaring in ${cityData.name} due to shortages!`);
                } else if (saturation < this.saturationThreshold * 0.5) {
                    news.push(`📈 ${item.name} prices plummeting in ${cityData.name} due to oversupply!`);
                }
            }
        }
        
        // Limit news items
        return news.slice(0, 5);
    },
    
    // Get all market trends for save system
    getAllMarketTrends() {
        const trends = {};
        for (const [cityId, cityData] of Object.entries(GameWorld.locations)) {
            if (!cityData.marketPrices) continue;
            
            trends[cityId] = {};
            for (const [itemId, marketData] of Object.entries(cityData.marketPrices)) {
                trends[cityId][itemId] = {
                    currentPrice: marketData.price,
                    basePrice: ItemDatabase.calculatePrice(itemId),
                    saturation: this.getMarketSaturation(cityId, itemId),
                    lastUpdated: Date.now()
                };
            }
        }
        return trends;
    },
    
    // Load market trends from save system
    loadMarketTrends(trends) {
        // This would restore market trends if we stored them separately
        // For now, we'll just log it
        console.log('Loaded market trends:', trends);
    },
    
    // Get all supply/demand data for save system
    getAllSupplyDemandData() {
        return this.marketSaturation;
    },
    
    // Load supply/demand data from save system
    loadSupplyDemandData(data) {
        this.marketSaturation = data || {};
        this.saveMarketSaturation();
    },
    
    // Reset market saturation (for testing or admin)
    resetMarketSaturation() {
        this.marketSaturation = {};
        this.saveMarketSaturation();
        addMessage('Market saturation has been reset!');
    },

    // ═══════════════════════════════════════════════════════════════
    // 🦇 SURVIVAL ITEMS SYSTEM - Essential food/water always available
    // ═══════════════════════════════════════════════════════════════
    // Every market sells basic survival items so players don't die from lack of supplies

    // Essential survival items that EVERY market sells
    ESSENTIAL_ITEMS: ['water', 'bread', 'food', 'meat', 'ale'],

    // Additional survival items for larger markets
    EXPANDED_SURVIVAL_ITEMS: ['cheese', 'fish', 'vegetables', 'military_rations', 'wine'],

    // Ensure all locations have survival items available
    ensureSurvivalItems(locationId) {
        const location = GameWorld.locations[locationId];
        if (!location) return;

        // Initialize sells array if missing
        if (!location.sells) {
            location.sells = [];
        }

        // Add essential items to every market
        for (const itemId of this.ESSENTIAL_ITEMS) {
            if (!location.sells.includes(itemId)) {
                location.sells.push(itemId);
            }
        }

        // Larger markets get expanded items
        const largeMarkets = ['large', 'grand'];
        if (largeMarkets.includes(location.marketSize)) {
            for (const itemId of this.EXPANDED_SURVIVAL_ITEMS) {
                if (!location.sells.includes(itemId)) {
                    location.sells.push(itemId);
                }
            }
        }
    },

    // Ensure ALL locations have survival items (call on init)
    ensureAllLocationsSurvivalItems() {
        if (typeof GameWorld === 'undefined' || !GameWorld.locations) return;

        for (const locationId of Object.keys(GameWorld.locations)) {
            this.ensureSurvivalItems(locationId);
        }
        console.log('🍖 DynamicMarketSystem: Survival items ensured for all locations');
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌅 TIME-OF-DAY PRICE FLUCTUATION - Prices change morning to night
    // ═══════════════════════════════════════════════════════════════
    // Morning (8am): Lowest prices, freshest stock
    // Midday (12pm): Standard prices
    // Evening (6pm): Higher prices, depleted stock
    // Night (10pm+): Premium prices for late shoppers

    TIME_PRICE_MODIFIERS: {
        morning: 0.85,    // 8am-11am: 15% discount (fresh from suppliers)
        midday: 1.0,      // 11am-3pm: standard prices
        afternoon: 1.1,   // 3pm-7pm: 10% markup (supply depleting)
        evening: 1.2,     // 7pm-10pm: 20% markup (scarce)
        night: 1.35       // 10pm-8am: 35% premium (night owl tax)
    },

    // Get current time-of-day price modifier
    getTimeOfDayModifier() {
        if (typeof TimeSystem === 'undefined') return 1.0;

        const hour = TimeSystem.currentHour || 12;

        if (hour >= 8 && hour < 11) return this.TIME_PRICE_MODIFIERS.morning;
        if (hour >= 11 && hour < 15) return this.TIME_PRICE_MODIFIERS.midday;
        if (hour >= 15 && hour < 19) return this.TIME_PRICE_MODIFIERS.afternoon;
        if (hour >= 19 && hour < 22) return this.TIME_PRICE_MODIFIERS.evening;
        return this.TIME_PRICE_MODIFIERS.night; // 10pm-8am
    },

    // Get time period name for UI
    getTimePeriodName() {
        if (typeof TimeSystem === 'undefined') return 'Day';

        const hour = TimeSystem.currentHour || 12;

        if (hour >= 8 && hour < 11) return 'Morning Market';
        if (hour >= 11 && hour < 15) return 'Midday Trade';
        if (hour >= 15 && hour < 19) return 'Afternoon Rush';
        if (hour >= 19 && hour < 22) return 'Evening Trade';
        return 'Night Market';
    },

    // Calculate final price with time modifier
    calculateTimeAdjustedPrice(basePrice, locationId, itemId) {
        const timeModifier = this.getTimeOfDayModifier();

        // Survival items have smaller time variance (essential goods)
        const isSurvivalItem = this.ESSENTIAL_ITEMS.includes(itemId);
        const effectiveModifier = isSurvivalItem
            ? 1 + ((timeModifier - 1) * 0.5)  // Half the modifier for essentials
            : timeModifier;

        return Math.round(basePrice * effectiveModifier);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌅 8AM DAILY REFRESH - Vendors restock at dawn
    // ═══════════════════════════════════════════════════════════════
    // Every morning at 8am:
    // - Stock refreshes to full
    // - Prices reset to base
    // - Merchant gold replenishes
    // - NPCs refresh their inventory

    lastRefreshHour: -1,
    // 🌅 Market refreshes at 8am each day - merchants restock, gold resets, NPCs refresh 💀
    REFRESH_HOUR: 8, // 8am daily refresh

    // Check if it's time for the daily 8am refresh
    checkDailyRefresh() {
        if (typeof TimeSystem === 'undefined') return;

        const currentHour = TimeSystem.currentHour || 0;
        const currentDay = TimeSystem.currentDay || 1;

        // Check if we've crossed into 8am
        if (currentHour === this.REFRESH_HOUR && this.lastRefreshHour !== this.REFRESH_HOUR) {
            this.performDailyRefresh();
            this.lastRefreshHour = currentHour;
            console.log(`🌅 Daily market refresh at 8am on Day ${currentDay}`);
        } else if (currentHour !== this.REFRESH_HOUR) {
            this.lastRefreshHour = currentHour;
        }
    },

    // Perform the daily 8am refresh
    performDailyRefresh() {
        // 1. Reset all merchant gold to full
        this.resetDailyGold();

        // 2. Refresh all stock to fresh levels
        this.refreshAllStock();

        // 3. Ensure survival items exist everywhere
        this.ensureAllLocationsSurvivalItems();

        // 4. Reset NPC merchant inventories
        this.refreshNPCMerchants();

        // 5. Notify player
        if (typeof addMessage === 'function') {
            addMessage('🌅 Morning has come! Merchants have restocked their wares.', 'info');
        }

        // 6. Emit event for other systems
        if (typeof EventBus !== 'undefined' && EventBus.emit) {
            EventBus.emit('market:dailyRefresh', { hour: 8, day: TimeSystem.currentDay });
        }
    },

    // Refresh all location stock to full morning levels
    refreshAllStock() {
        for (const locationId of Object.keys(this.originalStock)) {
            const location = GameWorld.locations[locationId];
            if (!location) continue;

            // 🖤💀 Morning restock values - BALANCED UP for better daily availability
            const marketSizes = { tiny: 15, small: 28, medium: 50, large: 70, grand: 100 };
            const baseStock = marketSizes[location.marketSize] || 28;

            for (const itemId of Object.keys(this.originalStock[locationId])) {
                // Fresh stock each morning with slight variance
                const variance = Math.floor(Math.random() * baseStock * 0.3);
                this.originalStock[locationId][itemId] = baseStock + variance;
            }

            // Also add stock for survival items
            for (const itemId of this.ESSENTIAL_ITEMS) {
                if (!this.originalStock[locationId][itemId]) {
                    this.originalStock[locationId][itemId] = baseStock + Math.floor(Math.random() * 5);
                }
            }
        }
        console.log('📦 DynamicMarketSystem: Morning stock refresh complete');
    },

    // Refresh NPC merchant inventories
    refreshNPCMerchants() {
        // Refresh any active NPC merchants
        if (typeof NPCManager !== 'undefined' && NPCManager.activeMerchants) {
            for (const merchant of Object.values(NPCManager.activeMerchants || {})) {
                if (merchant.inventory) {
                    // Restock NPC inventory with survival items
                    const survivalStock = {};
                    for (const itemId of this.ESSENTIAL_ITEMS) {
                        survivalStock[itemId] = 5 + Math.floor(Math.random() * 10);
                    }
                    merchant.inventory = { ...merchant.inventory, ...survivalStock };
                }
                if (merchant.gold !== undefined) {
                    // Refresh NPC gold based on type
                    merchant.gold = merchant.maxGold || 500;
                }
            }
        }

        // Refresh wandering traders
        if (typeof NPCEncounterSystem !== 'undefined' && NPCEncounterSystem.refreshTraderInventories) {
            NPCEncounterSystem.refreshTraderInventories();
        }

        console.log('🧑‍🌾 DynamicMarketSystem: NPC merchants refreshed');
    },

    // ═══════════════════════════════════════════════════════════════
    // 📊 ECONOMY SUPPLY/DEMAND - Prices react to player actions
    // ═══════════════════════════════════════════════════════════════

    // Track when player buys survival items - increase scarcity
    onPlayerBuySurvivalItem(locationId, itemId, quantity) {
        if (!this.ESSENTIAL_ITEMS.includes(itemId)) return;

        // Increase demand tracking
        this.updateSupplyDemand(locationId, itemId, quantity);

        // If stock gets low, slightly increase prices for that item
        const stock = this.getItemStock(locationId, itemId);
        if (stock < 5) {
            // Scarcity pricing kicks in
            console.log(`⚠️ ${itemId} running low at ${locationId} - scarcity pricing active`);
        }
    },

    // Track when player sells survival items - decrease prices
    onPlayerSellSurvivalItem(locationId, itemId, quantity) {
        if (!this.ESSENTIAL_ITEMS.includes(itemId)) return;

        // Increase supply tracking (negative quantity = selling)
        this.updateSupplyDemand(locationId, itemId, -quantity);

        // Add to location stock
        this.addStock(locationId, itemId, quantity);
    }
};

// Initialize dynamic market system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            DynamicMarketSystem.init();
        }, 100);
    });
} else {
    setTimeout(() => {
        DynamicMarketSystem.init();
    }, 100);
}