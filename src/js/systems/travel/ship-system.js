/**
 * ========================================
 * SHIP TRADING SYSTEM - Medieval Trading Game
 * ========================================
 * Sea travel and maritime trade routes
 * ========================================
 */

const ShipSystem = {
    // vessels for navigating the endless waters - your floating coffins
    ships: {
        rowboat: {
            name: 'Rowboat',
            icon: '🚣',
            tier: 'basic',
            price: 100,
            stats: {
                speed: 0.8,           // drifting through liquid despair
                cargoCapacity: 50,    // pitiful hold for your pitiful dreams
                hull: 30,             // how many hits before you sink
                crew: 1,              // minimum souls required to float
                maxCrew: 2
            },
            upkeep: {
                daily: 5,
                dockFee: 2
            },
            canTrade: false,          // too pathetic for commerce
            description: 'A simple rowboat for short coastal trips.'
        },
        fishingBoat: {
            name: 'Fishing Boat',
            icon: '🎣',
            tier: 'basic',
            price: 300,
            stats: {
                speed: 1.0,
                cargoCapacity: 100,
                hull: 50,
                crew: 2,
                maxCrew: 4,
                fishingBonus: 1.5     // better at catching the dying
            },
            upkeep: {
                daily: 10,
                dockFee: 5
            },
            canTrade: true,
            description: 'A sturdy boat for fishing and light cargo.'
        },
        merchantCog: {
            name: 'Merchant Cog',
            icon: '⛵',
            tier: 'standard',
            price: 1500,
            stats: {
                speed: 1.2,
                cargoCapacity: 500,
                hull: 100,
                crew: 8,
                maxCrew: 15
            },
            upkeep: {
                daily: 50,
                dockFee: 20
            },
            canTrade: true,
            description: 'The workhorse of medieval sea trade.'
        },
        tradingCarrack: {
            name: 'Trading Carrack',
            icon: '🚢',
            tier: 'premium',
            price: 5000,
            stats: {
                speed: 1.4,
                cargoCapacity: 1000,
                hull: 150,
                crew: 20,
                maxCrew: 40
            },
            upkeep: {
                daily: 150,
                dockFee: 50
            },
            canTrade: true,
            description: 'A large trading vessel for long voyages.'
        },
        warGalley: {
            name: 'War Galley',
            icon: '',
            tier: 'premium',
            price: 8000,
            stats: {
                speed: 1.6,
                cargoCapacity: 300,
                hull: 200,
                crew: 50,
                maxCrew: 100,
                combatBonus: 30
            },
            upkeep: {
                daily: 200,
                dockFee: 75
            },
            canTrade: true,
            description: 'A fast warship that can also carry cargo.'
        },
        merchantGalleon: {
            name: 'Merchant Galleon',
            icon: '🏴‍☠️',
            tier: 'elite',
            price: 20000,
            stats: {
                speed: 1.3,
                cargoCapacity: 2000,
                hull: 250,
                crew: 60,
                maxCrew: 120,
                combatBonus: 15
            },
            upkeep: {
                daily: 400,
                dockFee: 150
            },
            canTrade: true,
            description: 'The king of merchant vessels.'
        }
    },

    // Port definitions
    ports: {
        haven_port: {
            name: "Merchant's Haven Port",
            icon: '⚓',
            location: 'merchants_haven',
            dockCapacity: 20,
            services: ['repair', 'resupply', 'crew_hire', 'shipyard'],
            tradingGoods: ['fish', 'salt', 'cloth', 'wine'],
            exportBonus: ['cloth'],
            importBonus: ['spices', 'silk']
        },
        crossroads_harbor: {
            name: 'Crossroads Harbor',
            icon: '⚓',
            location: 'crossroads_village',
            dockCapacity: 10,
            services: ['repair', 'resupply'],
            tradingGoods: ['fish', 'grain', 'timber'],
            exportBonus: ['timber'],
            importBonus: ['iron', 'tools']
        },
        ironforge_docks: {
            name: 'Ironforge Docks',
            icon: '⚓',
            location: 'northern_outpost',
            dockCapacity: 15,
            services: ['repair', 'resupply', 'crew_hire', 'shipyard'],
            tradingGoods: ['iron', 'weapons', 'armor', 'coal'],
            exportBonus: ['iron', 'weapons'],
            importBonus: ['food', 'cloth']
        },
        golden_bay: {
            name: 'Golden Bay',
            icon: '⚓',
            location: 'golden_city',
            dockCapacity: 30,
            services: ['repair', 'resupply', 'crew_hire', 'shipyard', 'luxury_goods'],
            tradingGoods: ['gold', 'jewelry', 'spices', 'silk', 'wine'],
            exportBonus: ['gold', 'jewelry'],
            importBonus: ['exotic_goods']
        },
        smugglers_cove: {
            name: "Smuggler's Cove",
            icon: '🏴‍☠️',
            location: 'hidden',
            dockCapacity: 5,
            services: ['repair', 'contraband'],
            tradingGoods: ['contraband', 'stolen_goods', 'rare_items'],
            exportBonus: ['contraband'],
            importBonus: ['contraband'],
            requiresReputation: 'thieves_guild'
        }
    },

    // Sea routes between ports
    seaRoutes: {
        haven_crossroads: {
            ports: ['haven_port', 'crossroads_harbor'],
            distance: 50,
            baseDuration: 4,  // Hours
            danger: 'low',
            weatherSensitive: true
        },
        haven_ironforge: {
            ports: ['haven_port', 'ironforge_docks'],
            distance: 80,
            baseDuration: 6,
            danger: 'medium',
            weatherSensitive: true
        },
        haven_golden: {
            ports: ['haven_port', 'golden_bay'],
            distance: 150,
            baseDuration: 12,
            danger: 'medium',
            weatherSensitive: true
        },
        ironforge_golden: {
            ports: ['ironforge_docks', 'golden_bay'],
            distance: 100,
            baseDuration: 8,
            danger: 'high',
            weatherSensitive: true,
            pirateRisk: 0.15
        },
        any_smugglers: {
            ports: ['any', 'smugglers_cove'],
            distance: 60,
            baseDuration: 5,
            danger: 'high',
            weatherSensitive: true,
            pirateRisk: 0.05,
            hidden: true
        }
    },

    // your fleet of floating regrets
    ownedShips: [],
    activeShip: null,
    shipStats: {},

    // currently adrift between nightmares
    currentVoyage: null,

    // the desperate souls you pay to sail with you
    crew: {
        sailors: 0,
        marines: 0,
        navigator: false,
        captain: false,
        morale: 100,
        wages: 0
    },

    // Initialize the system
    init() {
        this.loadShips();
        this.createStyles();
        this.setupEventListeners();

        console.log('⛵ ShipSystem initialized');
    },

    // load your fleet from the save file
    loadShips() {
        if (typeof game !== 'undefined' && game.player) {
            this.ownedShips = game.player.ships || [];
            this.activeShip = game.player.activeShip || null;
            this.shipStats = game.player.shipStats || {};
            this.crew = game.player.shipCrew || this.crew;
        }
    },

    // Save ships to game state
    saveShips() {
        if (typeof game !== 'undefined' && game.player) {
            game.player.ships = this.ownedShips;
            game.player.activeShip = this.activeShip;
            game.player.shipStats = this.shipStats;
            game.player.shipCrew = this.crew;
        }
    },

    // tune into the frequencies of doom
    setupEventListeners() {
        if (typeof EventBus !== 'undefined') {
            // dawn breaks - time to pay for existence
            EventBus.on('time:newDay', () => {
                this.processDailyUpkeep();
                this.processCrewWages();
            });

            // weather shifts - the sea grows angrier
            EventBus.on('weather:changed', (data) => {
                if (this.currentVoyage) {
                    this.applyWeatherEffects(data.weather);
                }
            });
        }
    },

    // Buy a ship
    buyShip(shipType, portId) {
        const ship = this.ships[shipType];
        if (!ship) {
            this.showNotification('Invalid ship type!', 'error');
            return false;
        }

        const port = this.ports[portId];
        if (!port || !port.services.includes('shipyard')) {
            this.showNotification('This port has no shipyard!', 'error');
            return false;
        }

        // check gold via PlayerStateManager or fallback
        if (typeof game !== 'undefined' && game.player) {
            const currentGold = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.gold.get() : game.player.gold;

            if (currentGold < ship.price) {
                this.showNotification(`Not enough gold! Need ${ship.price}g`, 'error');
                return false;
            }

            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.remove(ship.price, 'ship_purchase');
            } else {
                game.player.gold -= ship.price;
            }

            const shipInstance = {
                id: `${shipType}_${Date.now()}`,
                type: shipType,
                name: ship.name,
                purchaseDate: Date.now(),
                dockedAt: portId
            };

            this.shipStats[shipInstance.id] = {
                hull: ship.stats.hull,
                maxHull: ship.stats.hull,
                supplies: 100,
                cargo: {},
                cargoWeight: 0
            };

            this.ownedShips.push(shipInstance);
            this.saveShips();

            this.showNotification(`Purchased ${ship.name} for ${ship.price} gold!`, 'success');

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('ship:purchased', { shipType, shipInstance });
            }

            return true;
        }

        return false;
    },

    // Sell a ship
    sellShip(instanceId) {
        const shipInstance = this.ownedShips.find(s => s.id === instanceId);
        if (!shipInstance) {
            this.showNotification('Ship not found!', 'error');
            return false;
        }

        if (this.activeShip === instanceId) {
            this.showNotification('Cannot sell your active ship!', 'error');
            return false;
        }

        const ship = this.ships[shipInstance.type];
        const stats = this.shipStats[instanceId];
        const hullPercent = stats.hull / stats.maxHull;
        const sellPrice = Math.floor(ship.price * 0.5 * hullPercent);

        // use PlayerStateManager or fallback
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.add(sellPrice, 'ship_sale');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.gold += sellPrice;
        }

        this.ownedShips = this.ownedShips.filter(s => s.id !== instanceId);
        delete this.shipStats[instanceId];
        this.saveShips();

        this.showNotification(`Sold ${shipInstance.name} for ${sellPrice} gold`, 'success');
        return true;
    },

    // Set active ship
    setActiveShip(instanceId) {
        if (instanceId === null) {
            this.activeShip = null;
            this.saveShips();
            return true;
        }

        const shipInstance = this.ownedShips.find(s => s.id === instanceId);
        if (!shipInstance) {
            this.showNotification('Ship not found!', 'error');
            return false;
        }

        this.activeShip = instanceId;
        this.saveShips();

        this.showNotification(`${shipInstance.name} is now your active ship`, 'success');
        return true;
    },

    // Get active ship data
    getActiveShip() {
        if (!this.activeShip) return null;

        const instance = this.ownedShips.find(s => s.id === this.activeShip);
        if (!instance) return null;

        return {
            instance,
            definition: this.ships[instance.type],
            stats: this.shipStats[this.activeShip]
        };
    },

    // Check if player has enough crew
    hasEnoughCrew() {
        const ship = this.getActiveShip();
        if (!ship) return false;

        const totalCrew = this.crew.sailors + this.crew.marines;
        return totalCrew >= ship.definition.stats.crew;
    },

    // Hire crew
    hireCrew(type, amount, portId) {
        const port = this.ports[portId];
        if (!port || !port.services.includes('crew_hire')) {
            this.showNotification('This port does not offer crew hiring!', 'error');
            return false;
        }

        const costs = {
            sailors: 10,
            marines: 25,
            navigator: 100,
            captain: 200
        };

        const cost = costs[type] * (type === 'navigator' || type === 'captain' ? 1 : amount);

        // check gold via PlayerStateManager or fallback
        const currentGold = typeof PlayerStateManager !== 'undefined' ?
            PlayerStateManager.gold.get() : (game?.player?.gold || 0);

        if (currentGold < cost) {
            this.showNotification(`Need ${cost} gold to hire crew`, 'error');
            return false;
        }

        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.remove(cost, 'crew_hire');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.gold -= cost;
        }

        if (type === 'sailors' || type === 'marines') {
            this.crew[type] += amount;
        } else {
            this.crew[type] = true;
        }

        this.saveShips();
        this.showNotification(`Hired ${type} for ${cost} gold`, 'success');
        return true;
    },

    // Fire crew
    fireCrew(type, amount) {
        if (type === 'sailors' || type === 'marines') {
            this.crew[type] = Math.max(0, this.crew[type] - amount);
        } else {
            this.crew[type] = false;
        }

        this.saveShips();
        this.showNotification(`Released ${type}`, 'info');
        return true;
    },

    // how long until we reach the next hell
    calculateVoyageDuration(routeId) {
        const route = this.seaRoutes[routeId];
        if (!route) return null;

        const ship = this.getActiveShip();
        if (!ship) return route.baseDuration;

        let duration = route.baseDuration / ship.definition.stats.speed;

        // a navigator who actually knows where tf we're going
        if (this.crew.navigator) {
            duration *= 0.85;
        }

        // weather fucks with everything
        if (typeof WeatherSystem !== 'undefined') {
            const weatherMod = WeatherSystem.getWeatherEffects().travelSpeed || 1;
            duration /= weatherMod;
        }

        return Math.ceil(duration);
    },

    // cast off into the uncaring abyss
    startVoyage(routeId, destinationPortId) {
        const route = this.seaRoutes[routeId];
        if (!route) {
            this.showNotification('Invalid route!', 'error');
            return false;
        }

        const ship = this.getActiveShip();
        if (!ship) {
            this.showNotification('No active ship!', 'error');
            return false;
        }

        if (!this.hasEnoughCrew()) {
            this.showNotification('Not enough crew to sail!', 'error');
            return false;
        }

        const stats = this.shipStats[this.activeShip];
        if (stats.supplies < 20) {
            this.showNotification('Not enough supplies! Resupply first.', 'error');
            return false;
        }

        const duration = this.calculateVoyageDuration(routeId);

        this.currentVoyage = {
            routeId,
            destination: destinationPortId,
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            events: []
        };

        // burn through supplies - survival isn't free
        stats.supplies = Math.max(0, stats.supplies - duration * 5);

        this.saveShips();

        this.showNotification(`Setting sail for ${this.ports[destinationPortId].name}!`, 'success');

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('voyage:started', {
                route: routeId,
                destination: destinationPortId,
                duration
            });
        }

        // roll the dice of fate
        this.simulateVoyage();

        return true;
    },

    // let chaos decide your fate on the waves
    simulateVoyage() {
        if (!this.currentVoyage) return;

        const route = this.seaRoutes[this.currentVoyage.routeId];

        // pirates lurking in the darkness
        if (route.pirateRisk && Math.random() < route.pirateRisk) {
            this.currentVoyage.events.push({
                type: 'pirate_attack',
                message: 'Pirates spotted on the horizon!'
            });
            this.handlePirateAttack();
        }

        // the sky turns against us
        if (route.weatherSensitive && typeof WeatherSystem !== 'undefined') {
            const weather = WeatherSystem.currentWeather;
            if (weather === 'storm') {
                this.currentVoyage.events.push({
                    type: 'storm',
                    message: 'Caught in a storm!'
                });
                this.handleStorm();
            }
        }

        // time ticks toward arrival (or oblivion)
        setTimeout(() => {
            this.completeVoyage();
        }, this.currentVoyage.duration * 1000); // sped up for your impatient ass
    },

    // pirates - violence on the high seas
    handlePirateAttack() {
        const ship = this.getActiveShip();
        if (!ship) return;

        const combatStrength = this.crew.marines * 5 +
                              this.crew.sailors * 2 +
                              (ship.definition.stats.combatBonus || 0);

        const pirateStrength = 50 + Math.random() * 50;

        // check if we win or lose
        if (combatStrength > pirateStrength) {
            // victory through bloodshed
            const loot = Math.floor(Math.random() * 200 + 50);
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.add(loot, 'pirate_victory');
            } else if (typeof game !== 'undefined' && game.player) {
                game.player.gold += loot;
            }
            this.showNotification(`Defeated pirates! Found ${loot} gold!`, 'success');
        } else {
            // defeat - they take everything
            const stats = this.shipStats[this.activeShip];
            const lostGold = Math.floor(Math.random() * 100 + 50);

            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.remove(lostGold, 'pirate_defeat');
            } else if (typeof game !== 'undefined' && game.player) {
                game.player.gold = Math.max(0, game.player.gold - lostGold);
            }

            stats.hull = Math.max(10, stats.hull - 20);
            this.showNotification(`Pirates attacked! Lost ${lostGold} gold and took damage!`, 'danger');
        }
    },

    // nature's wrath - the sea wants blood
    handleStorm() {
        const stats = this.shipStats[this.activeShip];

        const damage = Math.floor(Math.random() * 30 + 10);
        stats.hull = Math.max(10, stats.hull - damage);

        // some crew won't make it
        if (Math.random() < 0.2) {
            const lost = Math.floor(Math.random() * 3 + 1);
            this.crew.sailors = Math.max(0, this.crew.sailors - lost);
            this.showNotification(`Storm! ${lost} sailors lost overboard!`, 'danger');
        } else {
            this.showNotification(`Storm! Ship took ${damage} hull damage!`, 'warning');
        }

        this.crew.morale = Math.max(0, this.crew.morale - 15);
    },

    // Complete voyage
    completeVoyage() {
        if (!this.currentVoyage) return;

        const destination = this.currentVoyage.destination;
        const shipInstance = this.ownedShips.find(s => s.id === this.activeShip);

        if (shipInstance) {
            shipInstance.dockedAt = destination;
        }

        this.showNotification(`Arrived at ${this.ports[destination].name}!`, 'success');

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('voyage:completed', {
                destination,
                events: this.currentVoyage.events
            });
        }

        this.currentVoyage = null;
        this.saveShips();
    },

    // Repair ship
    repairShip(instanceId, portId) {
        const port = this.ports[portId];
        if (!port || !port.services.includes('repair')) {
            this.showNotification('This port has no repair facilities!', 'error');
            return false;
        }

        const stats = this.shipStats[instanceId];
        if (!stats) return false;

        const damageToRepair = stats.maxHull - stats.hull;
        if (damageToRepair === 0) {
            this.showNotification('Ship is already at full hull!', 'info');
            return false;
        }

        const repairCost = damageToRepair * 5;

        // check gold for repairs
        const currentGold = typeof PlayerStateManager !== 'undefined' ?
            PlayerStateManager.gold.get() : (game?.player?.gold || 0);

        if (currentGold < repairCost) {
            this.showNotification(`Need ${repairCost} gold for repairs`, 'error');
            return false;
        }

        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.remove(repairCost, 'ship_repair');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.gold -= repairCost;
        }

        stats.hull = stats.maxHull;
        this.saveShips();
        this.showNotification(`Ship repaired for ${repairCost} gold`, 'success');
        return true;
    },

    // Resupply ship
    resupplyShip(instanceId, portId) {
        const port = this.ports[portId];
        if (!port || !port.services.includes('resupply')) {
            this.showNotification('This port has no resupply services!', 'error');
            return false;
        }

        const stats = this.shipStats[instanceId];
        if (!stats) return false;

        const suppliesToBuy = 100 - stats.supplies;
        if (suppliesToBuy <= 0) {
            this.showNotification('Already fully supplied!', 'info');
            return false;
        }

        const cost = suppliesToBuy * 2;

        // check gold for resupply
        const currentGold = typeof PlayerStateManager !== 'undefined' ?
            PlayerStateManager.gold.get() : (game?.player?.gold || 0);

        if (currentGold < cost) {
            this.showNotification(`Need ${cost} gold for supplies`, 'error');
            return false;
        }

        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.remove(cost, 'ship_resupply');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.gold -= cost;
        }

        stats.supplies = 100;
        this.saveShips();
        this.showNotification(`Resupplied for ${cost} gold`, 'success');
        return true;
    },

    // Load cargo onto ship
    loadCargo(instanceId, itemId, quantity) {
        const stats = this.shipStats[instanceId];
        if (!stats) return false;

        const ship = this.ownedShips.find(s => s.id === instanceId);
        const shipDef = this.ships[ship.type];

        // Check capacity
        const itemWeight = 1; // Simplified - should come from ItemDatabase
        const totalWeight = stats.cargoWeight + (quantity * itemWeight);

        if (totalWeight > shipDef.stats.cargoCapacity) {
            this.showNotification('Not enough cargo space!', 'error');
            return false;
        }

        // move from player inventory to ship cargo
        const playerQty = typeof PlayerStateManager !== 'undefined' ?
            PlayerStateManager.inventory.get(itemId) :
            (game?.player?.inventory?.[itemId] || 0);

        if (playerQty < quantity) {
            this.showNotification('Not enough items in inventory!', 'error');
            return false;
        }

        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.remove(itemId, quantity, 'ship_load');
        } else if (typeof game !== 'undefined' && game.player) {
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
                    reason: 'ship_load'
                });
            }
        }

        stats.cargo[itemId] = (stats.cargo[itemId] || 0) + quantity;
        stats.cargoWeight = totalWeight;
        this.saveShips();

        this.showNotification(`Loaded ${quantity}x ${itemId} onto ship`, 'success');
        return true;
    },

    // Unload cargo from ship
    unloadCargo(instanceId, itemId, quantity) {
        const stats = this.shipStats[instanceId];
        if (!stats) return false;

        const shipQty = stats.cargo[itemId] || 0;
        if (shipQty < quantity) {
            this.showNotification('Not enough items in cargo!', 'error');
            return false;
        }

        // move from ship cargo to player inventory
        stats.cargo[itemId] -= quantity;
        if (stats.cargo[itemId] <= 0) {
            delete stats.cargo[itemId];
        }
        stats.cargoWeight -= quantity;

        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(itemId, quantity, 'ship_unload');
        } else if (typeof game !== 'undefined' && game.player) {
            game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: itemId,
                    quantity: quantity,
                    newTotal: game.player.inventory[itemId],
                    reason: 'ship_unload'
                });
            }
        }

        //  Emit item-received for quest progress tracking
        document.dispatchEvent(new CustomEvent('item-received', {
            detail: { item: itemId, quantity: quantity, source: 'ship_unload' }
        }));
        this.saveShips();

        this.showNotification(`Unloaded ${quantity}x ${itemId} from ship`, 'success');
        return true;
    },

    // daily bleeding of your coffers - ships devour gold
    processDailyUpkeep() {
        let totalUpkeep = 0;

        for (const shipInstance of this.ownedShips) {
            const ship = this.ships[shipInstance.type];
            totalUpkeep += ship.upkeep.daily;

            // harbors charge for the privilege of stillness
            if (shipInstance.dockedAt) {
                totalUpkeep += ship.upkeep.dockFee;
            }
        }

        // check if player can afford upkeep
        if (totalUpkeep > 0) {
            const currentGold = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.gold.get() : (game?.player?.gold || 0);

            if (currentGold >= totalUpkeep) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.remove(totalUpkeep, 'ship_upkeep');
                } else if (typeof game !== 'undefined' && game.player) {
                    game.player.gold -= totalUpkeep;
                }
                this.showNotification(`Ship upkeep: ${totalUpkeep} gold`, 'info');
            } else {
                // broke - watch your fleet rot
                for (const shipInstance of this.ownedShips) {
                    const stats = this.shipStats[shipInstance.id];
                    stats.hull = Math.max(0, stats.hull - 5);
                }
                this.showNotification('Cannot pay ship upkeep! Ships deteriorating!', 'danger');
            }
        }
    },

    // pay the crew or face mutiny - every fucking day
    processCrewWages() {
        const sailorWage = 2;
        const marineWage = 5;
        const navigatorWage = 10;
        const captainWage = 20;

        let totalWages = 0;
        totalWages += this.crew.sailors * sailorWage;
        totalWages += this.crew.marines * marineWage;
        if (this.crew.navigator) totalWages += navigatorWage;
        if (this.crew.captain) totalWages += captainWage;

        // check if player can afford crew wages
        if (totalWages > 0) {
            const currentGold = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.gold.get() : (game?.player?.gold || 0);

            if (currentGold >= totalWages) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.gold.remove(totalWages, 'crew_wages');
                } else if (typeof game !== 'undefined' && game.player) {
                    game.player.gold -= totalWages;
                }
                this.crew.morale = Math.min(100, this.crew.morale + 5);
            } else {
                // unpaid crew - morale collapses
                this.crew.morale = Math.max(0, this.crew.morale - 20);
                if (this.crew.morale <= 0) {
                    // MUTINY! They turn on you
                    this.showNotification('MUTINY! Unpaid crew has abandoned ship!', 'danger');
                    this.crew.sailors = Math.floor(this.crew.sailors * 0.3);
                    this.crew.marines = Math.floor(this.crew.marines * 0.3);
                }
            }
        }

        this.crew.wages = totalWages;
        this.saveShips();
    },

    // Apply weather effects
    applyWeatherEffects(weather) {
        if (!this.currentVoyage) return;

        const weatherModifiers = {
            clear: 1.0,
            cloudy: 1.0,
            rain: 0.9,
            storm: 0.5,
            fog: 0.7
        };

        // Already handled in voyage simulation
    },

    // Show ship panel UI
    show() {
        const existingPanel = document.getElementById('ship-panel');
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('div');
        panel.id = 'ship-panel';
        panel.className = 'ship-panel';

        const activeShip = this.getActiveShip();

        panel.innerHTML = `
            <div class="ship-panel-header">
                <h2>⛵ Ships & Sea Trade</h2>
                <button class="ship-panel-close" onclick="ShipSystem.hide()">×</button>
            </div>
            <div class="ship-panel-content">
                ${this.currentVoyage ? `
                    <div class="voyage-status">
                        <h3>🌊 Currently Sailing</h3>
                        <div class="voyage-destination">
                            Destination: ${this.ports[this.currentVoyage.destination].name}
                        </div>
                        <div class="voyage-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.currentVoyage.progress}%"></div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${activeShip ? `
                    <div class="active-ship-display">
                        <span class="ship-icon-large">${this.ships[activeShip.instance.type].icon}</span>
                        <div class="active-ship-info">
                            <h3>${activeShip.instance.name}</h3>
                            <div class="ship-type">${activeShip.definition.name}</div>
                            <div class="ship-docked">Docked at: ${activeShip.instance.dockedAt ? this.ports[activeShip.instance.dockedAt]?.name || 'Unknown' : 'At sea'}</div>
                            <div class="ship-bars">
                                <div class="ship-bar">
                                    <span>Hull</span>
                                    <div class="bar-track">
                                        <div class="bar-fill hull" style="width: ${(activeShip.stats.hull / activeShip.stats.maxHull) * 100}%"></div>
                                    </div>
                                    <span>${activeShip.stats.hull}/${activeShip.stats.maxHull}</span>
                                </div>
                                <div class="ship-bar">
                                    <span>Supplies</span>
                                    <div class="bar-track">
                                        <div class="bar-fill supplies" style="width: ${activeShip.stats.supplies}%"></div>
                                    </div>
                                    <span>${activeShip.stats.supplies}%</span>
                                </div>
                                <div class="ship-bar">
                                    <span>Cargo</span>
                                    <div class="bar-track">
                                        <div class="bar-fill cargo" style="width: ${(activeShip.stats.cargoWeight / activeShip.definition.stats.cargoCapacity) * 100}%"></div>
                                    </div>
                                    <span>${activeShip.stats.cargoWeight}/${activeShip.definition.stats.cargoCapacity}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="no-ship-active">
                        <p>No active ship. Purchase one at a shipyard!</p>
                    </div>
                `}

                <div class="crew-section">
                    <h3>👥 Crew</h3>
                    <div class="crew-stats">
                        <div class="crew-stat">
                            <span>Sailors:</span>
                            <span>${this.crew.sailors}</span>
                        </div>
                        <div class="crew-stat">
                            <span>Marines:</span>
                            <span>${this.crew.marines}</span>
                        </div>
                        <div class="crew-stat">
                            <span>Navigator:</span>
                            <span>${this.crew.navigator ? '✓' : '✗'}</span>
                        </div>
                        <div class="crew-stat">
                            <span>Morale:</span>
                            <span>${this.crew.morale}%</span>
                        </div>
                        <div class="crew-stat">
                            <span>Daily Wages:</span>
                            <span>${this.crew.wages}g</span>
                        </div>
                    </div>
                </div>

                <div class="owned-ships-section">
                    <h3>Your Fleet (${this.ownedShips.length})</h3>
                    <div class="ship-list">
                        ${this.ownedShips.length === 0 ? `
                            <p class="no-ships">No ships owned. Visit a shipyard to purchase one!</p>
                        ` : this.ownedShips.map(s => this.renderShipCard(s)).join('')}
                    </div>
                </div>

                <div class="ports-section">
                    <h3>⚓ Ports</h3>
                    <div class="ports-list">
                        ${Object.entries(this.ports).filter(([id, p]) => !p.hidden).map(([id, port]) => `
                            <div class="port-card">
                                <span class="port-icon">${port.icon}</span>
                                <div class="port-info">
                                    <div class="port-name">${port.name}</div>
                                    <div class="port-services">${port.services.join(', ')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        requestAnimationFrame(() => {
            panel.classList.add('visible');
        });
    },

    // Render ship card
    renderShipCard(shipInstance) {
        const ship = this.ships[shipInstance.type];
        const stats = this.shipStats[shipInstance.id];
        const isActive = this.activeShip === shipInstance.id;

        return `
            <div class="ship-card ${isActive ? 'active' : ''}">
                <span class="ship-card-icon">${ship.icon}</span>
                <div class="ship-card-info">
                    <div class="ship-card-name">${shipInstance.name}</div>
                    <div class="ship-card-type">${ship.name}</div>
                    <div class="ship-card-docked">@ ${shipInstance.dockedAt ? this.ports[shipInstance.dockedAt]?.name || 'Unknown' : 'At sea'}</div>
                </div>
                <div class="ship-card-actions">
                    ${!isActive ? `
                        <button onclick="ShipSystem.setActiveShip('${shipInstance.id}')" class="action-btn select">Select</button>
                    ` : `
                        <span class="active-badge">Active</span>
                    `}
                </div>
            </div>
        `;
    },

    // Hide ship panel
    hide() {
        const panel = document.getElementById('ship-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show(message, type);
        } else {
            console.log(`[Ship] ${message}`);
        }
    },

    // Create CSS styles
    createStyles() {
        if (document.getElementById('ship-styles')) return;

        const style = document.createElement('style');
        style.id = 'ship-styles';
        style.textContent = `
            .ship-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 90%;
                max-width: 700px;
                max-height: 85vh;
                background: linear-gradient(180deg, #1a2a3a 0%, #0d1520 100%);
                border: 2px solid #4a90d9;
                border-radius: 12px;
                z-index: 600; /* Z-INDEX STANDARD: Panel overlays (ship) */
                opacity: 0;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 0 50px rgba(74, 144, 217, 0.3);
            }

            .ship-panel.visible {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .ship-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(74, 144, 217, 0.2);
                border-bottom: 1px solid #4a90d9;
            }

            .ship-panel-header h2 {
                margin: 0;
                color: #7ec8e3;
                font-family: 'Cinzel', serif;
            }

            .ship-panel-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }

            .ship-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .voyage-status {
                background: rgba(74, 144, 217, 0.1);
                border: 1px solid #4a90d9;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }

            .voyage-status h3 {
                margin: 0 0 10px 0;
                color: #7ec8e3;
            }

            .progress-bar {
                height: 10px;
                background: #1a2a3a;
                border-radius: 5px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4a90d9, #7ec8e3);
                transition: width 0.3s;
            }

            .active-ship-display {
                display: flex;
                gap: 15px;
                align-items: flex-start;
                padding: 15px;
                background: rgba(74, 144, 217, 0.1);
                border: 1px solid #4a90d9;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .ship-icon-large {
                font-size: 3em;
            }

            .active-ship-info {
                flex: 1;
            }

            .active-ship-info h3 {
                margin: 0;
                color: #7ec8e3;
                font-family: 'Cinzel', serif;
            }

            .ship-type, .ship-docked {
                color: #888;
                font-size: 0.9em;
            }

            .ship-bars {
                margin-top: 10px;
            }

            .ship-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 5px 0;
                font-size: 0.85em;
            }

            .ship-bar span:first-child {
                width: 60px;
                color: #888;
            }

            .bar-track {
                flex: 1;
                height: 8px;
                background: #1a2a3a;
                border-radius: 4px;
                overflow: hidden;
            }

            .bar-fill {
                height: 100%;
                transition: width 0.3s;
            }

            .bar-fill.hull { background: #dc3545; }
            .bar-fill.supplies { background: #ffc107; }
            .bar-fill.cargo { background: #28a745; }

            .crew-section, .owned-ships-section, .ports-section {
                margin-bottom: 20px;
            }

            .crew-section h3, .owned-ships-section h3, .ports-section h3 {
                color: #7ec8e3;
                font-family: 'Cinzel', serif;
                margin-bottom: 10px;
            }

            .crew-stats {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
                background: rgba(0, 0, 0, 0.2);
                padding: 10px;
                border-radius: 8px;
            }

            .crew-stat {
                display: flex;
                justify-content: space-between;
                padding: 5px;
            }

            .crew-stat span:first-child {
                color: #888;
            }

            .ship-list, .ports-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .ship-card, .port-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                border: 1px solid #2a3a4a;
            }

            .ship-card.active {
                border-color: #4a90d9;
                background: rgba(74, 144, 217, 0.1);
            }

            .ship-card-icon, .port-icon {
                font-size: 2em;
            }

            .ship-card-info, .port-info {
                flex: 1;
            }

            .ship-card-name, .port-name {
                color: #fff;
                font-family: 'Cinzel', serif;
            }

            .ship-card-type, .ship-card-docked, .port-services {
                color: #888;
                font-size: 0.85em;
            }

            .ship-card-actions {
                display: flex;
                gap: 5px;
            }

            .action-btn {
                background: #4a4a6a;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85em;
            }

            .action-btn.select { background: #4a90d9; }

            .active-badge {
                background: #28a745;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.85em;
            }

            .no-ship-active, .no-ships {
                text-align: center;
                padding: 20px;
                color: #888;
            }
        `;
        document.head.appendChild(style);
    },

    // Save state
    getSaveData() {
        return {
            ownedShips: this.ownedShips,
            activeShip: this.activeShip,
            shipStats: this.shipStats,
            crew: this.crew,
            currentVoyage: this.currentVoyage
        };
    },

    // Load state
    loadSaveData(data) {
        if (data) {
            this.ownedShips = data.ownedShips || [];
            this.activeShip = data.activeShip || null;
            this.shipStats = data.shipStats || {};
            this.crew = data.crew || this.crew;
            this.currentVoyage = data.currentVoyage || null;
            this.saveShips();
        }
    }
};

// register with Bootstrap
Bootstrap.register('ShipSystem', () => ShipSystem.init(), {
    dependencies: ['TravelSystem', 'game'],
    priority: 63,
    severity: 'optional'
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShipSystem;
}
