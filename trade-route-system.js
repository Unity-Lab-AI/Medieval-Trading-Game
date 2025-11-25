// Trade Route System
const TradeRouteSystem = {
    // Initialize trade route system
    init() {
        if (!game.player.tradeRoutes) {
            game.player.tradeRoutes = [];
        }
        if (!game.player.routeHistory) {
            game.player.routeHistory = [];
        }
        
        // Setup route processing
        EventBus.on('time:day', () => this.processDailyRoutes());
    },
    
    // Create a new trade route
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
    
    // Get active routes
    getActiveRoutes() {
        return game.player.tradeRoutes.filter(route => route.isActive);
    },
    
    // Get all routes
    getAllRoutes() {
        return game.player.tradeRoutes || [];
    },
    
    // Get route by ID
    getRoute(routeId) {
        return game.player.tradeRoutes.find(route => route.id === routeId);
    },
    
    // Delete route
    deleteRoute(routeId) {
        game.player.tradeRoutes = game.player.tradeRoutes.filter(route => route.id !== routeId);
        this.saveRouteHistory();
    },
    
    // Toggle route active status
    toggleRoute(routeId) {
        const route = this.getRoute(routeId);
        if (!route) return false;
        
        route.isActive = !route.isActive;
        this.saveRouteHistory();
        
        return route.isActive;
    },
    
    // Process daily trade routes
    processDailyRoutes() {
        const activeRoutes = this.getActiveRoutes();
        
        if (activeRoutes.length === 0) return;
        
        activeRoutes.forEach(route => {
            this.processRoute(route);
        });
        
        this.saveRouteHistory();
    },
    
    // Process individual route
    processRoute(route) {
        const warehouse = PropertySystem.getProperty(route.warehouseId);
        const destination = GameWorld.locations[route.destinationId];
        
        if (!warehouse || !destination) return;
        
        // Check if warehouse has the item
        const item = ItemDatabase.getItem(route.itemId);
        if (!item) return;
        
        // Check if it's time to trade (once per in-game day)
        const currentTime = TimeSystem.getTotalMinutes();
        if (currentTime - route.lastTradeTime < TimeSystem.MINUTES_PER_DAY) {
            return;
        }
        
        // Get warehouse inventory
        const warehouseInventory = this.getWarehouseInventory(warehouse);
        const availableAmount = warehouseInventory[route.itemId] || 0;
        
        if (availableAmount < route.amount) {
            // Not enough items to trade
            addMessage(`⚠️ Route ${route.name}: Insufficient ${item.name} in warehouse!`);
            return;
        }
        
        // Get market prices
        const warehouseLocation = GameWorld.locations[warehouse.location];
        const warehousePrice = warehouseLocation.marketPrices[route.itemId]?.price || ItemDatabase.calculatePrice(route.itemId);
        const destinationPrice = destination.marketPrices[route.itemId]?.price || ItemDatabase.calculatePrice(route.itemId);
        
        // Check if trade is profitable
        const buyPrice = Math.min(warehousePrice, route.buyLimit || warehousePrice);
        const sellPrice = Math.max(destinationPrice, route.sellTarget || destinationPrice);
        const profitPerItem = sellPrice - buyPrice;
        
        if (profitPerItem <= 0) {
            // Not profitable
            addMessage(`⚠️ Route ${route.name}: Not profitable (buy: ${buyPrice}, sell: ${sellPrice})`);
            return;
        }
        
        // Execute trade
        const totalProfit = profitPerItem * route.amount;
        
        // Remove items from warehouse
        this.removeFromWarehouseInventory(warehouse, route.itemId, route.amount);
        
        // Add gold to player
        game.player.gold += totalProfit;
        
        // Update route statistics
        route.totalTrades++;
        route.totalProfit += totalProfit;
        route.lastTradeTime = currentTime;
        
        addMessage(`✅ Route ${route.name}: Traded ${route.amount} ${item.name} for ${totalProfit} gold profit!`);
        
        // Update UI
        updatePlayerInfo();
    },
    
    // Get warehouse inventory (items stored in warehouse)
    getWarehouseInventory(warehouse) {
        // For now, use a simplified inventory system
        // In a full implementation, this would track actual items stored
        const warehouseInventory = warehouse.inventory || {};
        
        // Generate some sample inventory based on warehouse level and upgrades
        if (Object.keys(warehouseInventory).length === 0) {
            const propertyType = PropertySystem.propertyTypes[warehouse.type];
            const baseInventory = {
                food: 50,
                grain: 30,
                wood: 20,
                stone: 15,
                iron_ore: 10,
                tools: 5
            };
            
            // Apply level multiplier
            Object.keys(baseInventory).forEach(itemId => {
                warehouseInventory[itemId] = Math.round(baseInventory[itemId] * (1 + (warehouse.level - 1) * 0.3));
            });
            
            // Apply upgrade bonuses
            warehouse.upgrades.forEach(upgradeId => {
                const upgrade = PropertySystem.upgrades[upgradeId];
                if (upgrade && upgrade.effects.productionBonus) {
                    Object.keys(warehouseInventory).forEach(itemId => {
                        warehouseInventory[itemId] = Math.round(warehouseInventory[itemId] * upgrade.effects.productionBonus);
                    });
                }
            });
        }
        
        return warehouseInventory;
    },
    
    // Remove items from warehouse inventory
    removeFromWarehouseInventory(warehouse, itemId, amount) {
        if (!warehouse.inventory) {
            warehouse.inventory = {};
        }
        
        warehouse.inventory[itemId] = (warehouse.inventory[itemId] || 0) - amount;
        
        if (warehouse.inventory[itemId] <= 0) {
            delete warehouse.inventory[itemId];
        }
    },
    
    // Test route profitability
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
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
    
    // Get route statistics
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
    
    // Optimize routes (find most profitable routes)
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