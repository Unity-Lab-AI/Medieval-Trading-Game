// ═══════════════════════════════════════════════════════════════
// TRANSPORT SYSTEM - horses, carts, and the shit that carries your shit
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
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
    farm: ['horse', 'mule', 'oxen'],  // Farms sell animals
    village: ['hand_cart'],            // Villages have basic carts
    town: ['hand_cart', 'cart'],       // Towns have carts
    city: ['hand_cart', 'cart', 'wagon', 'horse', 'mule'],  // Cities have most
    capital: ['horse', 'mule', 'oxen', 'hand_cart', 'cart', 'wagon'],  // Capital has all at markup
    port: ['mule', 'hand_cart', 'cart']  // Ports have cargo transport
};

// Price multipliers by location type - royalty gets the royal tax
const TRANSPORT_PRICE_MULTIPLIERS = {
    farm: 1.0,      // Base price for animals
    village: 1.0,   // Base price
    town: 1.1,      // Slight markup
    city: 1.25,     // City markup
    capital: 1.75,  // Royal Capital premium
    port: 1.15      // Port markup
};

// The main transport definitions - your fleet of carrying capacity
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
        canSell: false  // Can't sell your only bag
    },
    hand_cart: {
        id: 'hand_cart',
        name: 'Hand Cart',
        category: TRANSPORT_CATEGORY.CARRIER,
        basePrice: 35,
        sellPrice: 20,
        carryCapacity: 150,
        speedModifier: 0.85,
        icon: '🛞',
        description: 'A wooden cart you push by hand. Good early game option.'
    },

    // ANIMALS - Can carry goods AND pull vehicles
    horse: {
        id: 'horse',
        name: 'Horse',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 200,
        sellPrice: 120,
        carryCapacity: 100,
        speedModifier: 1.4,
        icon: '🐴',
        description: 'Fast but carries less. Perfect for quick trading runs.',
        canPullVehicle: true
    },
    mule: {
        id: 'mule',
        name: 'Mule',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 90,
        sellPrice: 50,
        carryCapacity: 180,
        speedModifier: 0.9,
        icon: '🫏',
        description: 'Sturdy and reliable. Great balance of speed and capacity.',
        canPullVehicle: true
    },
    oxen: {
        id: 'oxen',
        name: 'Oxen',
        category: TRANSPORT_CATEGORY.ANIMAL,
        basePrice: 150,
        sellPrice: 85,
        carryCapacity: 250,
        speedModifier: 0.6,
        icon: '🐂',
        description: 'Slow but incredibly strong. Best for heavy loads.',
        canPullVehicle: true
    },

    // VEHICLES - Require an animal to pull them
    cart: {
        id: 'cart',
        name: 'Merchant Cart',
        category: TRANSPORT_CATEGORY.VEHICLE,
        basePrice: 180,
        sellPrice: 100,
        carryCapacity: 350,
        speedModifier: 0.8,  // Reduces animal speed
        icon: '🛞',
        description: 'A sturdy cart. Requires a horse, mule, or oxen to pull.',
        requiresAnimal: true
    },
    wagon: {
        id: 'wagon',
        name: 'Large Wagon',
        category: TRANSPORT_CATEGORY.VEHICLE,
        basePrice: 400,
        sellPrice: 220,
        carryCapacity: 600,
        speedModifier: 0.65,  // Heavier, slower
        icon: '📦',
        description: 'A large wagon for serious hauling. Requires an animal.',
        requiresAnimal: true
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
    }
};

// Make it global
window.TRANSPORT_CATEGORY = TRANSPORT_CATEGORY;
window.TRANSPORT_SELLERS = TRANSPORT_SELLERS;
window.TRANSPORT_PRICE_MULTIPLIERS = TRANSPORT_PRICE_MULTIPLIERS;
window.transportationOptions = transportationOptions;
window.TransportSystem = TransportSystem;

console.log('🚗 TransportSystem loaded - horses, carts, and all that rolls');
