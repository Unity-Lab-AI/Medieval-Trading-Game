// 
// TRADE ROUTE SYSTEM - roads paved with broken dreams
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const TradeRouteSystem = {
    // boot up the trade route machine
    init() {
        // make sure the player exists before we try to drain their soul 
        if (!game || !game.player) {
            console.log('🖤 TradeRouteSystem.init() called before player exists... routes await their merchants');
            return;
        }
        if (!game.player.tradeRoutes) {
            game.player.tradeRoutes = [];
        }
        if (!game.player.routeHistory) {
            game.player.routeHistory = [];
        }

        // Setup route processing
        this.setupRouteProcessing();
    },
    
    // Setup regular route processing
    setupRouteProcessing() {
        // Process routes every game day
        const originalUpdate = game.update.bind(game);
        game.update = function(deltaTime) {
            const result = originalUpdate(deltaTime);
            
            // Check if a day has passed
            if (TimeSystem.currentTime.hour === 0 && TimeSystem.currentTime.minute === 0) {
                TradeRouteSystem.processDailyRoutes();
            }
            
            return result;
        };
    },
    
    // forge a path for automated greed - money while you sleep
    createRoute(routeData) {
        const route = {
            id: Date.now().toString(),
            name: routeData.name,
            warehouseId: routeData.warehouseId,
            destinationId: routeData.destinationId,
            itemId: routeData.itemId,
            buyLimit: routeData.buyLimit || 0,
            sellTarget: routeData.sellTarget || 999999,
            amount: routeData.amount || 1,
            isActive: routeData.isActive !== false,
            totalTrades: 0,
            totalProfit: 0,
            lastTradeTime: 0,
            created: TimeSystem.getTotalMinutes()
        };
        
        game.player.tradeRoutes.push(route);
        this.saveRouteHistory();
        
        return route;
    },
    
    // which money machines are running right now?
    getActiveRoutes() {
        return game.player.tradeRoutes.filter(route => route.isActive);
    },

    // Get all routes
    getAllRoutes() {
        return game.player.tradeRoutes || [];
    },

    // Get trade routes (alias for save system compatibility)
    getTradeRoutes() {
        return this.getAllRoutes();
    },

    // Load trade routes from save data
    loadTradeRoutes(routes) {
        if (!routes || !Array.isArray(routes)) {
            console.log('💾 No trade routes to load');
            return;
        }

        game.player.tradeRoutes = routes;
        console.log(`💾 Loaded ${routes.length} trade routes from save`);
    },
    
    // Get route by ID
    getRoute(routeId) {
        return game.player.tradeRoutes.find(route => route.id === routeId);
    },
    
    // kill the route - it's not profitable anymore
    deleteRoute(routeId) {
        game.player.tradeRoutes = game.player.tradeRoutes.filter(route => route.id !== routeId);
        this.saveRouteHistory();
    },
    
    // pause or resume the cash flow - your choice, capitalist
    toggleRoute(routeId) {
        const route = this.getRoute(routeId);
        if (!route) return false;
        
        route.isActive = !route.isActive;
        this.saveRouteHistory();
        
        return route.isActive;
    },
    
    // watch the gold roll in while you do nothing - passive income is still greed
    processDailyRoutes() {
        const activeRoutes = this.getActiveRoutes();
        
        if (activeRoutes.length === 0) return;
        
        activeRoutes.forEach(route => {
            this.processRoute(route);
        });
        
        this.saveRouteHistory();
    },
    
    // run one route - extract profit from the commerce machine
    processRoute(route) {
        const warehouse = PropertySystem.getProperty(route.warehouseId);
        const destination = GameWorld.locations[route.destinationId];
        
        if (!warehouse || !destination) return;
        
        // do we even have the goods to sell? check the shelves
        const item = ItemDatabase.getItem(route.itemId);
        if (!item) return;
        
        // Check if it's time to trade (once per day)
        // use HOURS_PER_DAY * MINUTES_PER_HOUR (24 * 60 = 1440 minutes per day) 
        const currentTime = TimeSystem.getTotalMinutes();
        const MINUTES_PER_DAY = (TimeSystem.HOURS_PER_DAY || 24) * (TimeSystem.MINUTES_PER_HOUR || 60);
        if (currentTime - route.lastTradeTime < MINUTES_PER_DAY) {
            return;
        }
        
        // Get warehouse inventory
        const warehouseInventory = this.getWarehouseInventory(warehouse);
        const availableAmount = warehouseInventory[route.itemId] || 0;
        
        if (availableAmount < route.amount) {
            // warehouse is empty - can't sell what you don't have
            addMessage(`⚠️ Route ${route.name}: Insufficient ${item.name} in warehouse!`);
            return;
        }
        
        // get market prices (null check warehouseLocation.marketPrices)
        const warehouseLocation = GameWorld.locations[warehouse.location];
        const warehousePrice = warehouseLocation?.marketPrices?.[route.itemId]?.price || ItemDatabase.calculatePrice(route.itemId);
        const destinationPrice = destination?.marketPrices?.[route.itemId]?.price || ItemDatabase.calculatePrice(route.itemId);
        
        // is this trade even worth it? let's do the depressing math
        const buyPrice = Math.min(warehousePrice, route.buyLimit || warehousePrice);
        const sellPrice = Math.max(destinationPrice, route.sellTarget || destinationPrice);
        const profitPerItem = sellPrice - buyPrice;
        
        if (profitPerItem <= 0) {
            // you'd LOSE money on this - abort abort abort
            addMessage(`⚠️ Route ${route.name}: Not profitable (buy: ${buyPrice}, sell: ${sellPrice})`);
            return;
        }
        
        // rake in the gold - but not too much or it breaks reality
        let totalProfit = profitPerItem * route.amount;
        // cap profit because infinite wealth would ruin the illusion of scarcity
        const MAX_DAILY_PROFIT = 10000;
        totalProfit = Math.min(totalProfit, MAX_DAILY_PROFIT);

        // empty the warehouse shelves
        this.removeFromWarehouseInventory(warehouse, route.itemId, route.amount);

        // gold in your pocket - the trade gods smile on you today
        game.player.gold += totalProfit;
        
        // tally another successful exploitation of supply and demand
        route.totalTrades++;
        route.totalProfit += totalProfit;
        route.lastTradeTime = currentTime;
        
        addMessage(`Route ${route.name}: Traded ${route.amount} ${item.name} for ${totalProfit} gold profit!`);
        
        // Update UI
        updatePlayerInfo();
    },
    
    // peek inside the warehouse - what riches do we hoard?
    getWarehouseInventory(warehouse) {
        // simplified system - reality is too complicated for this economy
        // In a full implementation, this would track actual items stored

        // FIX BUG-TRADE-1: Initialize warehouse.inventory if missing
        if (!warehouse.inventory) {
            warehouse.inventory = {};
        }

        // Generate some sample inventory based on warehouse level and upgrades
        if (Object.keys(warehouse.inventory).length === 0) {
            const propertyType = PropertySystem.propertyTypes[warehouse.type];
            const baseInventory = {
                food: 50,
                grain: 30,
                wood: 20,
                stone: 15,
                iron_ore: 10,
                tools: 5
            };

            // Apply level multiplier - PERSIST directly to warehouse.inventory!
            Object.keys(baseInventory).forEach(itemId => {
                warehouse.inventory[itemId] = Math.round(baseInventory[itemId] * (1 + (warehouse.level - 1) * 0.3));
            });

            // Apply upgrade bonuses
            warehouse.upgrades.forEach(upgradeId => {
                const upgrade = PropertySystem.upgrades[upgradeId];
                if (upgrade && upgrade.effects.productionBonus) {
                    Object.keys(warehouse.inventory).forEach(itemId => {
                        warehouse.inventory[itemId] = Math.round(warehouse.inventory[itemId] * upgrade.effects.productionBonus);
                    });
                }
            });

            console.log(`📦 Warehouse inventory initialized: ${JSON.stringify(warehouse.inventory)}`);
        }

        return warehouse.inventory;
    },
    
    // yank items off the shelf - they're sold, gone, profit
    removeFromWarehouseInventory(warehouse, itemId, amount) {
        if (!warehouse.inventory) {
            warehouse.inventory = {};
        }

        // FIX: Validate we have enough items before removing - prevents negative inventory exploit
        const available = warehouse.inventory[itemId] || 0;
        if (available < amount) {
            console.warn(`Cannot remove ${amount} ${itemId} - only ${available} available`);
            return false; // Reject the removal
        }

        warehouse.inventory[itemId] = available - amount;

        if (warehouse.inventory[itemId] <= 0) {
            delete warehouse.inventory[itemId];
        }

        return true; // Success
    },
    
    // calculate if this route would make you richer or just waste time
    testRoute(routeData) {
        const warehouse = PropertySystem.getProperty(routeData.warehouseId);
        const destination = GameWorld.locations[routeData.destinationId];
        
        if (!warehouse || !destination) {
            return { profitable: false, profit: 0 };
        }
        
        const item = ItemDatabase.getItem(routeData.itemId);
        if (!item) {
            return { profitable: false, profit: 0 };
        }
        
        const warehouseLocation = GameWorld.locations[warehouse.location];
        const warehousePrice = warehouseLocation.marketPrices[routeData.itemId]?.price || ItemDatabase.calculatePrice(routeData.itemId);
        const destinationPrice = destination.marketPrices[routeData.itemId]?.price || ItemDatabase.calculatePrice(routeData.itemId);
        
        const buyPrice = Math.min(warehousePrice, routeData.buyLimit || warehousePrice);
        const sellPrice = Math.max(destinationPrice, routeData.sellTarget || destinationPrice);
        const profitPerItem = sellPrice - buyPrice;
        
        return {
            profitable: profitPerItem > 0,
            profit: profitPerItem * routeData.amount,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            profitPerItem: profitPerItem
        };
    },
    
    // Get route history
    getRouteHistory() {
        return game.player.routeHistory || [];
    },
    
    // Save route history
    saveRouteHistory() {
        // Create history entries for completed trades
        const activeRoutes = this.getActiveRoutes();
        
        activeRoutes.forEach(route => {
            if (route.totalTrades > 0) {
                const historyEntry = {
                    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
                    routeId: route.id,
                    name: route.name,
                    totalTrades: route.totalTrades,
                    totalProfit: route.totalProfit,
                    timestamp: route.lastTradeTime
                };
                
                // Check if this entry already exists
                const existingEntry = game.player.routeHistory.find(entry => 
                    entry.routeId === route.id && entry.totalTrades === route.totalTrades
                );
                
                if (!existingEntry) {
                    game.player.routeHistory.push(historyEntry);
                }
            }
        });
        
        // Keep only last 50 history entries
        if (game.player.routeHistory.length > 50) {
            game.player.routeHistory = game.player.routeHistory.slice(-50);
        }
    },
    
    // tally up all the gold your routes have bled from the world
    getRouteStatistics() {
        const allRoutes = this.getAllRoutes();
        
        if (allRoutes.length === 0) {
            return {
                totalRoutes: 0,
                activeRoutes: 0,
                totalTrades: 0,
                totalProfit: 0,
                averageProfit: 0
            };
        }
        
        const activeRoutes = allRoutes.filter(route => route.isActive);
        const totalTrades = allRoutes.reduce((sum, route) => sum + route.totalTrades, 0);
        const totalProfit = allRoutes.reduce((sum, route) => sum + route.totalProfit, 0);
        const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;
        
        return {
            totalRoutes: allRoutes.length,
            activeRoutes: activeRoutes.length,
            totalTrades: totalTrades,
            totalProfit: totalProfit,
            averageProfit: Math.round(averageProfit)
        };
    },
    
    // find the most profitable paths - where greed meets geography
    optimizeRoutes() {
        const warehouses = PropertySystem.getPlayerProperties().filter(p => p.type === 'warehouse');
        if (warehouses.length === 0) {
            addMessage('You need at least one warehouse to create trade routes!');
            return [];
        }
        
        const optimizationResults = [];
        
        warehouses.forEach(warehouse => {
            const warehouseLocation = GameWorld.locations[warehouse.location];
            if (!warehouseLocation) return;
            
            // Get all possible destinations
            const destinations = warehouseLocation.connections.map(destId => GameWorld.locations[destId]).filter(dest => dest);
            
            // Test all items in warehouse inventory
            const warehouseInventory = this.getWarehouseInventory(warehouse);
            
            Object.keys(warehouseInventory).forEach(itemId => {
                if (warehouseInventory[itemId] <= 0) return;
                
                destinations.forEach(destination => {
                    const testResult = this.testRoute({
                        warehouseId: warehouse.id,
                        destinationId: destination.id,
                        itemId: itemId,
                        amount: Math.min(10, warehouseInventory[itemId])
                    });
                    
                    if (testResult.profitable) {
                        optimizationResults.push({
                            warehouseId: warehouse.id,
                            warehouseName: PropertySystem.propertyTypes[warehouse.type].name,
                            destinationId: destination.id,
                            destinationName: destination.name,
                            itemId: itemId,
                            itemName: ItemDatabase.getItem(itemId).name,
                            profit: testResult.profit,
                            profitPerItem: testResult.profitPerItem,
                            availableAmount: warehouseInventory[itemId]
                        });
                    }
                });
            });
        });
        
        // Sort by total profit
        optimizationResults.sort((a, b) => b.profit - a.profit);
        
        // Return top 10 results
        return optimizationResults.slice(0, 10);
    }
};