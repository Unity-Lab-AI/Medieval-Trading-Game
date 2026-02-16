// ═══════════════════════════════════════════════════════════════
// TRANSPORT SYSTEM - horses, carts, and the shit that carries your shit
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
// Animals pull vehicles, vehicles need animals - medieval logistics 101
// ═══════════════════════════════════════════════════════════════

// Transport Categories - what kind of moving thing is this?
const TRANSPORT_CATEGORY = {
    CARRIER: 'carrier',    // No animal needed (satchel, hand cart)
    ANIMAL: 'animal',      // Animals that can pull vehicles
    VEHICLE: 'vehicle'     // Requires animal to use
};

// Location types that sell transport - because not every village has horses
const TRANSPORT_SELLERS = {
    farm: ['donkey', 'mule', 'oxen', 'horse'],  // Farms sell animals
    stables: ['donkey', 'mule', 'horse'],      // Stables specialize in riding animals
    village: ['hand_cart', 'donkey'],           // Villages have basic options
    town: ['hand_cart', 'cart', 'donkey', 'mule'],  // Towns have more
    city: ['hand_cart', 'cart', 'wagon', 'horse', 'mule', 'donkey'],  // Cities have most
    capital: ['horse', 'mule', 'oxen', 'donkey', 'hand_cart', 'cart', 'wagon', 'covered_wagon'],  // Capital has all
    port: ['mule', 'donkey', 'hand_cart', 'cart'],  // Ports have cargo transport
    blacksmith: ['hand_cart', 'cart', 'wagon']  // Blacksmiths make vehicles
};

// Price multipliers by location type - royalty gets the royal tax
const TRANSPORT_PRICE_MULTIPLIERS = {
    farm: 0.9,      // Cheaper animals at source
    stables: 1.0,   // Base price
    village: 1.0,   // Base price
    town: 1.1,      // Slight markup
    city: 1.2,      // City markup
    capital: 1.5,   // Royal Capital premium
    port: 1.15,     // Port markup
    blacksmith: 1.0 // Base price for vehicles
};

// Trader level limits - how many transport you can own based on rank
// Level 1=Vagrant, 2=Peddler, 3=Hawker, 4=Trader, 5=Merchant, 6=Magnate, etc.
const TRANSPORT_LIMITS = {
    maxAnimals: [1, 2, 3, 4, 6, 8, 12, 16, 24, 50],   // Per trader level (1-10)
    maxVehicles: [0, 1, 1, 2, 3, 4, 6, 8, 12, 25],    // Per trader level (1-10)
    maxCarriers: [1, 2, 2, 3, 4, 5, 6, 8, 10, 20]     // Per trader level (1-10)
};

// The main transport definitions - your fleet of carrying capacity
// Prices: hand_cart=2000, horse=10000, ox=5000, wagon=8000, cart=4000
const transportationOptions = {
    // CARRIERS - No animal required, always available
    satchel: {
        id: 'satchel',
        name: 'Leather Satchel',
        category: TRANSPORT_CATEGORY.CARRIER,
        basePrice: 0,
        sellPrice: 0,
        carryCapacity: 40,
        speedModifier: 1.0,
        icon: '👝',
        description: 'A simple leather satchel. Everyone starts with one.',
        canSell: false,  // Can't sell your only bag
        requiredLevel: 1
    },
    hand_cart: {
        id: 'hand_cart',
        name: 'Hand Cart',
        category: TRANSPORT_CATEGORY.CARRIER,
        basePrice: 2000,
        sellPrice: 1200,
        carryCapacity: 100,
        speedModifier: 0.9,
        icon: '🛒',
        description: 'A sturdy wooden cart you push by hand. Perfect for new merchants.',
        requiredLevel: 1  // Vagrant can buy
    },

    // ANIMALS - Can carry goods AND pull vehicles
    donkey: {
        id: 'donkey',
        name: 'Donkey',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 1500,
        sellPrice: 900,
        carryCapacity: 100,
        speedModifier: 0.75,
        icon: '🫏',
        description: 'A small but reliable pack animal. Cheap and perfect for beginners.',
        canPullVehicle: false,  // Too small
        requiredLevel: 1  // Vagrant can buy
    },
    mule: {
        id: 'mule',
        name: 'Mule',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 3000,
        sellPrice: 1800,
        carryCapacity: 200,
        speedModifier: 0.85,
        icon: '🫏',
        description: 'Hardy and dependable. Good balance of speed and carrying capacity.',
        canPullVehicle: true,
        requiredLevel: 2  // Peddler required
    },
    oxen: {
        id: 'oxen',
        name: 'Oxen',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 5000,
        sellPrice: 3000,
        carryCapacity: 350,
        speedModifier: 0.6,
        icon: '🐂',
        description: 'Slow but incredibly powerful. Essential for serious bulk trading.',
        canPullVehicle: true,
        requiredLevel: 3  // Hawker required
    },
    horse: {
        id: 'horse',
        name: 'Horse',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 10000,
        sellPrice: 6000,
        carryCapacity: 150,
        speedModifier: 1.5,
        icon: '🐴',
        description: 'Swift and noble. Fast travel for merchants who value speed.',
        canPullVehicle: true,
        requiredLevel: 4  // Trader required
    },

    // VEHICLES - Require an animal to pull them
    cart: {
        id: 'cart',
        name: 'Merchant Cart',
        category: TRANSPORT_CATEGORY.VEHICLE,
        basePrice: 4000,
        sellPrice: 2400,
        carryCapacity: 300,
        speedModifier: 0.85,
        icon: '🛞',
        description: 'A sturdy two-wheeled cart. Requires a mule, oxen, or horse to pull.',
        requiresAnimal: true,
        requiredLevel: 3  // Hawker required
    },
    wagon: {
        id: 'wagon',
        name: 'Large Wagon',
        category: TRANSPORT_CATEGORY.VEHICLE,
        basePrice: 8000,
        sellPrice: 4800,
        carryCapacity: 500,
        speedModifier: 0.7,
        icon: '🚛',
        description: 'A large four-wheeled wagon. Massive capacity for serious merchants.',
        requiresAnimal: true,
        requiredLevel: 5  // Merchant required
    },
    covered_wagon: {
        id: 'covered_wagon',
        name: 'Covered Wagon',
        category: TRANSPORT_CATEGORY.VEHICLE,
        basePrice: 15000,
        sellPrice: 9000,
        carryCapacity: 650,
        speedModifier: 0.65,
        icon: '🚐',
        description: 'Premium wagon with protective cover. Keeps goods safe from weather and thieves.',
        requiresAnimal: true,
        requiredLevel: 6,  // Magnate required
        weatherProtection: true,
        theftProtection: 0.3
    }
};

// ═══════════════════════════════════════════════════════════════
// TRANSPORT SYSTEM - the brains behind the beasts
// ═══════════════════════════════════════════════════════════════
const TransportSystem = {
    // Get available transport at current location
    getAvailableTransport(locationType) {
        const available = TRANSPORT_SELLERS[locationType] || [];
        return available.map(id => transportationOptions[id]).filter(Boolean);
    },

    // Get price at location (with markup)
    getPrice(transportId, locationType, isSelling = false) {
        const transport = transportationOptions[transportId];
        if (!transport) return 0;

        if (isSelling) {
            return transport.sellPrice || Math.floor(transport.basePrice * 0.5);
        }

        const multiplier = TRANSPORT_PRICE_MULTIPLIERS[locationType] || 1.0;
        return Math.floor(transport.basePrice * multiplier);
    },

    // Count owned animals
    countOwnedAnimals(player) {
        if (!player.ownedTransport) return 0;
        return player.ownedTransport.filter(id => {
            const t = transportationOptions[id];
            return t && t.category === TRANSPORT_CATEGORY.ANIMAL;
        }).length;
    },

    // Count owned vehicles (that require animals)
    countOwnedVehicles(player) {
        if (!player.ownedTransport) return 0;
        return player.ownedTransport.filter(id => {
            const t = transportationOptions[id];
            return t && t.category === TRANSPORT_CATEGORY.VEHICLE && t.requiresAnimal;
        }).length;
    },

    // Check if player can buy a vehicle
    canBuyVehicle(player) {
        const animals = this.countOwnedAnimals(player);
        const vehicles = this.countOwnedVehicles(player);
        return animals > vehicles;  // Need more animals than vehicles
    },

    // Check if player can sell an animal
    canSellAnimal(player) {
        const animals = this.countOwnedAnimals(player);
        const vehicles = this.countOwnedVehicles(player);
        return animals > vehicles;  // Can only sell if we'd still have enough for vehicles
    },

    // Calculate total carry capacity from all owned transport
    calculateTotalCapacity(player) {
        if (!player.ownedTransport || player.ownedTransport.length === 0) {
            // Default satchel
            return transportationOptions.satchel.carryCapacity;
        }

        let total = 0;
        const animals = [];
        const vehicles = [];
        const carriers = [];

        // Sort owned transport by category
        player.ownedTransport.forEach(id => {
            const t = transportationOptions[id];
            if (!t) return;

            if (t.category === TRANSPORT_CATEGORY.ANIMAL) {
                animals.push(t);
            } else if (t.category === TRANSPORT_CATEGORY.VEHICLE) {
                vehicles.push(t);
            } else {
                carriers.push(t);
            }
        });

        // Add carrier capacities (satchel, hand cart)
        carriers.forEach(c => total += c.carryCapacity);

        // Pair animals with vehicles for combined capacity
        // Each animal can pull one vehicle
        const pairedAnimals = Math.min(animals.length, vehicles.length);

        // Paired animals contribute their capacity + vehicle capacity
        for (let i = 0; i < pairedAnimals; i++) {
            total += animals[i].carryCapacity + vehicles[i].carryCapacity;
        }

        // Unpaired animals just contribute their own capacity
        for (let i = pairedAnimals; i < animals.length; i++) {
            total += animals[i].carryCapacity;
        }

        // Unpaired vehicles contribute nothing (need animal to use)
        // But we validate this shouldn't happen

        return total;
    },

    // Calculate effective speed modifier
    calculateSpeedModifier(player) {
        if (!player.ownedTransport || player.ownedTransport.length === 0) {
            return 1.0;  // Walking speed
        }

        const animals = [];
        const vehicles = [];

        player.ownedTransport.forEach(id => {
            const t = transportationOptions[id];
            if (!t) return;
            if (t.category === TRANSPORT_CATEGORY.ANIMAL) animals.push(t);
            if (t.category === TRANSPORT_CATEGORY.VEHICLE) vehicles.push(t);
        });

        // No animals? Use base speed (hand cart slows you down)
        if (animals.length === 0) {
            const handCart = player.ownedTransport.includes('hand_cart');
            return handCart ? 0.85 : 1.0;
        }

        // With animals, speed is determined by slowest animal
        // Vehicles further reduce speed
        let baseSpeed = Math.min(...animals.map(a => a.speedModifier));

        if (vehicles.length > 0) {
            // Apply vehicle penalty (average of vehicle modifiers)
            const vehiclePenalty = vehicles.reduce((sum, v) => sum + v.speedModifier, 0) / vehicles.length;
            baseSpeed *= vehiclePenalty;
        }

        return Math.max(0.3, baseSpeed);  // Minimum 0.3x speed
    },

    // Get transport summary for UI
    getTransportSummary(player) {
        const animals = this.countOwnedAnimals(player);
        const vehicles = this.countOwnedVehicles(player);
        const capacity = this.calculateTotalCapacity(player);
        const speed = this.calculateSpeedModifier(player);

        return {
            animals,
            vehicles,
            capacity,
            speed,
            canBuyVehicle: animals > vehicles,
            canSellAnimal: animals > vehicles
        };
    },

    // Get transport option by ID
    getTransportOption(transportId) {
        return transportationOptions[transportId] || null;
    },

    // Get all transport options
    getAllTransportOptions() {
        return { ...transportationOptions };
    },

    // Get transport categories
    getCategories() {
        return { ...TRANSPORT_CATEGORY };
    },

    // Get player's trader level (from MerchantRankSystem)
    getTraderLevel(player) {
        if (typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.getCurrentRank) {
            const rank = MerchantRankSystem.getCurrentRank();
            return rank?.level || 1;
        }
        // Fallback: check player object
        return player?.traderLevel || player?.merchantRank?.level || 1;
    },

    // Check if player can buy a specific transport based on trader level
    canBuyTransport(player, transportId) {
        const transport = transportationOptions[transportId];
        if (!transport) return { canBuy: false, reason: 'Invalid transport' };

        const traderLevel = this.getTraderLevel(player);
        const requiredLevel = transport.requiredLevel || 1;

        // Check trader level requirement
        if (traderLevel < requiredLevel) {
            const rankNames = ['', 'Vagrant', 'Peddler', 'Hawker', 'Trader', 'Merchant', 'Magnate', 'Tycoon', 'Trade Baron', 'Merchant Mogul', 'Royal Merchant'];
            return {
                canBuy: false,
                reason: `Requires ${rankNames[requiredLevel] || 'higher'} rank (level ${requiredLevel})`
            };
        }

        // Check transport limits based on trader level
        const levelIndex = Math.min(traderLevel - 1, 9);  // 0-9 index

        if (transport.category === TRANSPORT_CATEGORY.ANIMAL) {
            const currentAnimals = this.countOwnedAnimals(player);
            const maxAnimals = TRANSPORT_LIMITS.maxAnimals[levelIndex];
            if (currentAnimals >= maxAnimals) {
                return {
                    canBuy: false,
                    reason: `Animal limit reached (${currentAnimals}/${maxAnimals}). Increase trader rank for more.`
                };
            }
        } else if (transport.category === TRANSPORT_CATEGORY.VEHICLE) {
            const currentVehicles = this.countOwnedVehicles(player);
            const maxVehicles = TRANSPORT_LIMITS.maxVehicles[levelIndex];
            if (currentVehicles >= maxVehicles) {
                return {
                    canBuy: false,
                    reason: `Vehicle limit reached (${currentVehicles}/${maxVehicles}). Increase trader rank for more.`
                };
            }
            // Also check if player has unpaired animals for vehicle
            if (transport.requiresAnimal && !this.canBuyVehicle(player)) {
                return {
                    canBuy: false,
                    reason: 'Need an unpaired animal to pull this vehicle'
                };
            }
        } else if (transport.category === TRANSPORT_CATEGORY.CARRIER) {
            const currentCarriers = this.countOwnedCarriers(player);
            const maxCarriers = TRANSPORT_LIMITS.maxCarriers[levelIndex];
            if (currentCarriers >= maxCarriers) {
                return {
                    canBuy: false,
                    reason: `Carrier limit reached (${currentCarriers}/${maxCarriers}). Increase trader rank for more.`
                };
            }
        }

        return { canBuy: true, reason: '' };
    },

    // Count owned carriers (hand carts, satchels)
    countOwnedCarriers(player) {
        if (!player.ownedTransport) return 1;  // Default satchel
        return player.ownedTransport.filter(id => {
            const t = transportationOptions[id];
            return t && t.category === TRANSPORT_CATEGORY.CARRIER;
        }).length || 1;  // At least 1 for satchel
    },

    // Get transport limits for current trader level
    getTransportLimits(player) {
        const traderLevel = this.getTraderLevel(player);
        const levelIndex = Math.min(traderLevel - 1, 9);

        return {
            maxAnimals: TRANSPORT_LIMITS.maxAnimals[levelIndex],
            maxVehicles: TRANSPORT_LIMITS.maxVehicles[levelIndex],
            maxCarriers: TRANSPORT_LIMITS.maxCarriers[levelIndex],
            currentAnimals: this.countOwnedAnimals(player),
            currentVehicles: this.countOwnedVehicles(player),
            currentCarriers: this.countOwnedCarriers(player),
            traderLevel
        };
    },

    // Get enhanced transport summary with limits
    getTransportSummaryWithLimits(player) {
        const limits = this.getTransportLimits(player);
        const summary = this.getTransportSummary(player);

        return {
            ...summary,
            ...limits,
            canBuyMoreAnimals: limits.currentAnimals < limits.maxAnimals,
            canBuyMoreVehicles: limits.currentVehicles < limits.maxVehicles && summary.canBuyVehicle,
            canBuyMoreCarriers: limits.currentCarriers < limits.maxCarriers
        };
    }
};

// Make it global
window.TRANSPORT_CATEGORY = TRANSPORT_CATEGORY;
window.TRANSPORT_SELLERS = TRANSPORT_SELLERS;
window.TRANSPORT_PRICE_MULTIPLIERS = TRANSPORT_PRICE_MULTIPLIERS;
window.TRANSPORT_LIMITS = TRANSPORT_LIMITS;
window.transportationOptions = transportationOptions;
window.TransportSystem = TransportSystem;

console.log('🚗 TransportSystem loaded - horses, carts, wagons, and all that hauls');
