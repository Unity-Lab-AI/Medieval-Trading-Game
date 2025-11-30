// ═══════════════════════════════════════════════════════════════
// 🏰 GATEHOUSE & TRAVEL ZONE SYSTEM - capitalism's toll booths
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// controls access to different regions via gatehouses/outposts
// pay the toll or stay stuck forever, your choice

const GatehouseSystem = {
    // Track which gatehouses have been paid for (unlocked)
    unlockedGates: new Set(),

    // Track the player's starting zone (determines which zones are free)
    startingZone: 'starter',

    // Define travel zones and their gatehouses
    // Capital is ALWAYS accessible from any starting location
    ZONES: {
        starter: {
            name: 'Starter Region',
            description: 'The safe starting area around your home village',
            accessible: true, // Default - can change based on starting location
            gatehouse: 'starter_gate',
            fee: 75
        },
        capital: {
            name: 'Capital District',
            description: 'The capital city and immediate surroundings',
            accessible: true, // Capital is ALWAYS accessible from any start
            gatehouse: null
        },
        northern: {
            name: 'Northern Territories',
            description: 'Cold northern lands with valuable furs and minerals. A harsh realm for seasoned traders.',
            accessible: false,
            gatehouse: 'northern_outpost',
            fee: 10000 // 💀 Mid-game barrier - 10k gold to brave the frozen north
        },
        eastern: {
            name: 'Eastern Reaches',
            description: 'Prosperous trading regions to the east. Rich markets await those who can afford entry.',
            accessible: false,
            gatehouse: 'eastern_gate',
            fee: 1000 // 🦇 Early-mid game - 1k gold OR sneak through south
        },
        western: {
            name: 'Western Wilds',
            description: 'Untamed western frontier with rare resources. Only the wealthiest merchants dare enter.',
            accessible: false,
            gatehouse: 'western_outpost',
            fee: 50000 // ⚰️ Late-game barrier - 50k gold for the endgame zone
        },
        southern: {
            name: 'Southern Coast',
            description: 'The Glendale region - a natural expansion from the starter area. Free passage for all traders.',
            accessible: true, // 🖤 FREE! Natural progression from starter
            gatehouse: null, // No gatehouse - always open
            fee: 0
        },
        mountain: {
            name: 'Mountain Kingdom',
            description: 'High mountain passes with precious metals',
            accessible: false,
            gatehouse: 'mountain_gatehouse',
            fee: 250
        }
    },

    // Gatehouse/Outpost definitions - uses existing GameWorld outposts as paywalls
    // These outposts control access to their respective zones
    GATEHOUSES: {
        // Northern zone gatehouse (existing outpost) - MID GAME 10k
        northern_outpost: {
            id: 'northern_outpost',
            name: 'Northern Outpost',
            type: 'gatehouse',
            icon: '🏰',
            description: 'Military outpost controlling access to the Northern Territories. Only seasoned traders with 10,000 gold may pass.',
            fee: 10000, // 💀 Mid-game barrier
            unlocksZone: 'northern',
            guards: 'Northern Guard',
            services: ['passage', 'supplies', 'weapons'],
            visibleAlways: true,
            useGameWorldLocation: true
        },
        // Deep northern zone gatehouse (existing outpost)
        winterwatch_outpost: {
            id: 'winterwatch_outpost',
            name: 'Winterwatch',
            type: 'gatehouse',
            icon: '🏰',
            description: 'The northernmost watchtower. Guards the deep northern wilderness where ruins and frozen caves await.',
            fee: 150,
            unlocksZone: 'northern_deep',
            guards: 'Winterwatch Rangers',
            services: ['passage', 'shelter', 'supplies'],
            visibleAlways: true,
            useGameWorldLocation: true
        },
        // Western zone gatehouse (existing outpost) - LATE GAME 50k
        western_outpost: {
            id: 'western_outpost',
            name: 'Western Watch',
            type: 'gatehouse',
            icon: '🏰',
            description: 'Frontier outpost marking the edge of civilized lands. Only the wealthiest merchants (50,000 gold) may enter the Western Wilds.',
            fee: 50000, // ⚰️ Late-game barrier - endgame zone
            unlocksZone: 'western',
            guards: 'Frontier Rangers',
            services: ['passage', 'supplies', 'bounties'],
            visibleAlways: true,
            useGameWorldLocation: true
        },
        // Starter zone gatehouse (for players starting in harder areas)
        starter_gate: {
            id: 'starter_gate',
            name: 'Riverlands Gate',
            type: 'gatehouse',
            icon: '🏰',
            description: 'The entrance to the peaceful Riverlands. A safe region perfect for beginning traders.',
            fee: 75,
            unlocksZone: 'starter',
            guards: 'Riverlands Militia',
            services: ['passage', 'supplies'],
            visibleAlways: true,
            // Virtual gate - uses Greendale location as the entry point
            virtualGate: true,
            nearLocation: 'greendale'
        },
        // Eastern zone gatehouse - EARLY-MID GAME 1k (or sneak through south)
        eastern_gate: {
            id: 'eastern_gate',
            name: 'Eastern Checkpoint',
            type: 'gatehouse',
            icon: '🏰',
            description: 'The checkpoint to the prosperous Eastern Kingdoms. Pay 1,000 gold for direct access, or find the back path through the south.',
            fee: 1000, // 🦇 Early-mid game - can bypass via south
            unlocksZone: 'eastern',
            guards: 'Eastern Merchants Guild',
            services: ['passage', 'trade_permits'],
            visibleAlways: true,
            virtualGate: true,
            nearLocation: 'jade_harbor'
        }
        // 🖤 Southern/Glendale has NO gatehouse - FREE access from starter!
    },

    // Map zones to their controlling gatehouses
    // 🖤 Progression: starter → south (FREE) → east (1k or back path) → north (10k) → west (50k)
    ZONE_GATEHOUSES: {
        'northern': 'northern_outpost',    // 💀 10,000g - mid game
        'northern_deep': 'winterwatch_outpost',
        'western': 'western_outpost',      // ⚰️ 50,000g - late game
        'eastern': 'eastern_gate',         // 🦇 1,000g - early-mid (bypassable via south)
        'southern': null,                  // 🖤 FREE! No gatehouse - natural expansion
        'capital': null,                   // Capital ALWAYS accessible
        'starter': 'starter_gate'
    },

    // Locations mapped to their zones (for quick lookup)
    LOCATION_ZONES: {
        // Capital zone - ALWAYS accessible
        'royal_capital': 'capital',
        'kings_inn': 'capital',

        // Starter zone locations
        'greendale': 'starter',
        'vineyard_village': 'starter',
        'riverwood': 'starter',
        'hunters_wood': 'starter',
        'wheat_farm': 'starter',
        'orchard_farm': 'starter',
        'riverside_inn': 'starter',
        'hunting_lodge': 'starter',
        'river_cave': 'starter',

        // Northern zone locations
        'iron_mines': 'northern',
        'ironforge_city': 'northern',
        'silverkeep': 'northern',
        'silver_mine': 'northern',
        'frostholm_village': 'northern',
        'mountain_pass_inn': 'northern',
        'deep_cavern': 'northern',
        'crystal_cave': 'northern',
        'northern_outpost': 'northern',
        'winterwatch_outpost': 'northern',
        'frozen_cave': 'northern',
        'ruins_of_eldoria': 'northern',

        // Western zone locations
        'stonebridge': 'western',
        'darkwood_village': 'western',
        'miners_rest': 'western',
        'ancient_forest': 'western',
        'hermit_grove': 'western',
        'druid_grove': 'western',
        'deep_mine': 'western',
        'stone_quarry': 'western',
        'shadow_dungeon': 'western',
        'forest_dungeon': 'western',
        'western_outpost': 'western',

        // Eastern zone locations
        'jade_harbor': 'eastern',
        'hillcrest': 'eastern',
        'whispering_woods': 'eastern',
        'eastern_farm': 'eastern',
        'silk_road_inn': 'eastern',
        'shepherds_inn': 'eastern',
        'fishermans_port': 'eastern',
        'smugglers_cove': 'eastern',
        'fairy_cave': 'eastern',

        // Southern zone locations
        'sunhaven': 'southern',
        'sunny_farm': 'southern',
        'lighthouse_inn': 'southern',
        'coastal_cave': 'southern'
    },

    // Initialize the system
    init() {
        console.log('🏰 GatehouseSystem: Initializing...');

        // Load unlocked gates from save
        this.loadUnlockedGates();

        // Load starting zone from save
        this.loadStartingZone();

        // Add gatehouses to TravelSystem
        this.registerGatehouses();

        // Patch travel system to check zone access
        this.patchTravelSystem();

        console.log('🏰 GatehouseSystem: Ready');
    },

    // Set the player's starting zone based on their starting location
    // Called when a new game starts
    setStartingZone(startingLocationId) {
        // Determine zone from location
        const zone = this.LOCATION_ZONES[startingLocationId] || 'starter';
        this.startingZone = zone;

        // Save for persistence
        try {
            localStorage.setItem('trader-claude-starting-zone', zone);
        } catch (e) {}

        // Update zone accessibility based on starting zone
        this.updateZoneAccessibility();

        console.log(`🏰 Starting zone set to: ${zone} (from ${startingLocationId})`);
    },

    // Load starting zone from localStorage
    loadStartingZone() {
        try {
            const saved = localStorage.getItem('trader-claude-starting-zone');
            if (saved) {
                this.startingZone = saved;
                this.updateZoneAccessibility();
                console.log('🏰 Loaded starting zone:', saved);
            }
        } catch (e) {
            console.warn('🏰 Could not load starting zone:', e);
        }
    },

    // Update which zones are accessible based on starting zone
    // Rules:
    // - Capital is ALWAYS accessible
    // - Your starting zone is ALWAYS accessible
    // - Other zones require paying at their gatehouse
    updateZoneAccessibility() {
        Object.keys(this.ZONES).forEach(zone => {
            if (zone === 'capital') {
                // Capital is ALWAYS accessible
                this.ZONES[zone].accessible = true;
            } else if (zone === this.startingZone) {
                // Your starting zone is always accessible
                this.ZONES[zone].accessible = true;
            } else if (this.unlockedGates.has(this.ZONE_GATEHOUSES[zone])) {
                // Zone is unlocked via payment
                this.ZONES[zone].accessible = true;
            } else {
                // Zone is locked
                this.ZONES[zone].accessible = false;
            }
        });
    },

    // Load unlocked gates from localStorage
    loadUnlockedGates() {
        try {
            const saved = localStorage.getItem('trader-claude-unlocked-gates');
            if (saved) {
                const gates = JSON.parse(saved);
                this.unlockedGates = new Set(gates);
                console.log('🏰 Loaded unlocked gates:', gates);
            }
        } catch (e) {
            console.warn('🏰 Could not load unlocked gates:', e);
        }
    },

    // Save unlocked gates to localStorage
    saveUnlockedGates() {
        try {
            const gates = Array.from(this.unlockedGates);
            localStorage.setItem('trader-claude-unlocked-gates', JSON.stringify(gates));
        } catch (e) {
            console.warn('🏰 Could not save unlocked gates:', e);
        }
    },

    // Register gatehouses with TravelSystem
    registerGatehouses() {
        if (typeof TravelSystem === 'undefined') {
            console.warn('🏰 TravelSystem not found, will retry...');
            setTimeout(() => this.registerGatehouses(), 500);
            return;
        }

        // Add gatehouses to pointsOfInterest
        Object.values(this.GATEHOUSES).forEach(gatehouse => {
            // Check if already exists
            const exists = TravelSystem.pointsOfInterest?.find(p => p.id === gatehouse.id);
            if (!exists) {
                TravelSystem.pointsOfInterest = TravelSystem.pointsOfInterest || [];
                TravelSystem.pointsOfInterest.push({
                    ...gatehouse,
                    isGatehouse: true,
                    unlocked: this.unlockedGates.has(gatehouse.id)
                });
            }
        });

        console.log('🏰 Registered', Object.keys(this.GATEHOUSES).length, 'gatehouses');
    },

    // Check if a location is accessible
    // 🖤 Back path logic: if you can reach a location through connected FREE zones, you can access it
    canAccessLocation(locationId, fromLocationId = null) {
        // Get location zone using our mapping first
        const zone = this.LOCATION_ZONES[locationId] || this.getLocationZone(locationId);

        // Capital is ALWAYS accessible from any starting location
        if (zone === 'capital') {
            return { accessible: true, reason: null };
        }

        // Your starting zone is ALWAYS accessible
        if (zone === this.startingZone) {
            return { accessible: true, reason: null };
        }

        // 🦇 Southern zone is ALWAYS FREE - no gatehouse!
        if (zone === 'southern') {
            return { accessible: true, reason: null };
        }

        // Check if it's a gatehouse (always visible/accessible for interaction)
        const gatehouse = Object.values(this.GATEHOUSES).find(g => g.id === locationId);
        if (gatehouse) {
            return { accessible: true, reason: null, isGatehouse: true };
        }

        // Check zone access
        const zoneInfo = this.ZONES[zone];
        if (!zoneInfo) {
            return { accessible: true, reason: null }; // Unknown zone, allow access
        }

        // Check if zone is accessible (either starting zone or unlocked)
        if (zoneInfo.accessible) {
            return { accessible: true, reason: null };
        }

        // Check if gatehouse is unlocked
        const gatehouseId = this.ZONE_GATEHOUSES[zone];
        if (gatehouseId && this.unlockedGates.has(gatehouseId)) {
            return { accessible: true, reason: null };
        }

        // 💀 BACK PATH CHECK: If traveling from a connected accessible location, allow it!
        // This enables: starter → south (free) → coastal_cave → smugglers_cove (eastern)
        if (fromLocationId) {
            const fromZone = this.LOCATION_ZONES[fromLocationId] || this.getLocationZone(fromLocationId);
            const fromZoneInfo = this.ZONES[fromZone];

            // If coming from an accessible zone and locations are connected, allow passage
            if (fromZoneInfo?.accessible || fromZone === this.startingZone || fromZone === 'capital' || fromZone === 'southern') {
                // Check if locations are actually connected in GameWorld
                if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
                    const fromLoc = GameWorld.locations[fromLocationId];
                    if (fromLoc?.connections?.includes(locationId)) {
                        console.log(`🦇 Back path access granted: ${fromLocationId} → ${locationId}`);
                        return { accessible: true, reason: null, backPath: true };
                    }
                }
            }
        }

        // 🖤 Also check if player is currently IN the zone (already snuck in via back path)
        if (typeof game !== 'undefined' && game.currentLocation) {
            const currentZone = this.LOCATION_ZONES[game.currentLocation.id] || this.getLocationZone(game.currentLocation.id);
            if (currentZone === zone) {
                // Already in this zone - can move freely within it
                return { accessible: true, reason: null, alreadyInZone: true };
            }
        }

        // Zone is locked - need to pay at gatehouse
        const gateInfo = this.GATEHOUSES[gatehouseId];
        return {
            accessible: false,
            reason: `You must pay the passage fee at ${gateInfo?.name || 'the gatehouse'} to access the ${zoneInfo.name}.`,
            gatehouse: gatehouseId,
            fee: gateInfo?.fee || zoneInfo.fee
        };
    },

    // Get the zone for a location
    getLocationZone(locationId) {
        // Check if it's a gatehouse
        const gatehouse = this.GATEHOUSES[locationId];
        if (gatehouse) {
            return 'starter'; // Gatehouses are always accessible
        }

        // Check TravelSystem locations
        if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
            const location = TravelSystem.locations[locationId];
            if (location && location.region) {
                return location.region;
            }
        }

        // Check GameWorld locations
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            const location = GameWorld.locations[locationId];
            if (location && location.region) {
                return location.region;
            }
        }

        // Default to starter zone
        return 'starter';
    },

    // Pay passage fee to unlock a gatehouse
    payPassageFee(gatehouseId) {
        const gatehouse = this.GATEHOUSES[gatehouseId];
        if (!gatehouse) {
            addMessage('Invalid gatehouse!', 'error');
            return false;
        }

        // Check if already unlocked
        if (this.unlockedGates.has(gatehouseId)) {
            addMessage(`${gatehouse.name} is already unlocked!`, 'info');
            return true;
        }

        // Check if player has enough gold
        if (typeof game === 'undefined' || !game.player) {
            addMessage('Cannot access player data!', 'error');
            return false;
        }

        if (game.player.gold < gatehouse.fee) {
            addMessage(`Not enough gold! You need ${gatehouse.fee} gold to pay the passage fee.`, 'error');
            return false;
        }

        // Deduct gold and unlock
        game.player.gold -= gatehouse.fee;
        this.unlockedGates.add(gatehouseId);
        this.saveUnlockedGates();

        // Update zone accessibility
        const zone = gatehouse.unlocksZone;
        if (this.ZONES[zone]) {
            this.ZONES[zone].accessible = true;
        }

        // Update UI
        if (typeof updatePlayerStats === 'function') {
            updatePlayerStats();
        }

        addMessage(`🏰 Passage granted! You paid ${gatehouse.fee} gold to access the ${this.ZONES[zone]?.name || 'new region'}.`, 'success');

        return true;
    },

    // Check if gatehouse is unlocked
    isGatehouseUnlocked(gatehouseId) {
        return this.unlockedGates.has(gatehouseId);
    },

    // Patch TravelSystem to check zone access
    patchTravelSystem() {
        if (typeof TravelSystem === 'undefined') {
            setTimeout(() => this.patchTravelSystem(), 500);
            return;
        }

        const self = this;
        const originalStartTravel = TravelSystem.startTravel?.bind(TravelSystem);

        if (originalStartTravel) {
            TravelSystem.startTravel = function(destinationId) {
                // 🖤 Get current location for back path check
                const fromLocationId = game?.currentLocation?.id || null;

                // Check zone access (with back path support)
                const access = self.canAccessLocation(destinationId, fromLocationId);

                if (!access.accessible) {
                    // Show gatehouse prompt
                    self.showGatehousePrompt(access.gatehouse, destinationId);
                    return;
                }

                // Proceed with travel
                originalStartTravel(destinationId);
            };
            console.log('🏰 Patched TravelSystem.startTravel for zone checking (with back path support)');
        }
    },

    // Show prompt to pay gatehouse fee
    showGatehousePrompt(gatehouseId, destinationId) {
        const gatehouse = this.GATEHOUSES[gatehouseId];
        if (!gatehouse) return;

        const playerGold = game?.player?.gold || 0;
        const canAfford = playerGold >= gatehouse.fee;

        const modal = document.createElement('div');
        modal.id = 'gatehouse-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 700; /* Z-INDEX STANDARD: System modals (gatehouse) */
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(180deg, rgba(40, 40, 60, 0.98) 0%, rgba(30, 30, 50, 0.98) 100%);
                border: 2px solid rgba(255, 215, 0, 0.5);
                border-radius: 12px;
                padding: 24px;
                max-width: 450px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            ">
                <h2 style="color: #ffd700; margin-bottom: 16px;">🏰 ${gatehouse.name}</h2>
                <p style="color: #e0e0e0; margin-bottom: 12px;">${gatehouse.description}</p>
                <p style="color: #aaa; margin-bottom: 16px;">Controlled by: ${gatehouse.guards}</p>

                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                ">
                    <p style="color: #4fc3f7; font-size: 1.1em; margin-bottom: 8px;">
                        Passage Fee: <strong style="color: #ffd700;">${gatehouse.fee} gold</strong>
                    </p>
                    <p style="color: ${canAfford ? '#4caf50' : '#f44336'};">
                        Your Gold: ${playerGold} gold
                        ${canAfford ? '✓' : '✗ (Not enough)'}
                    </p>
                </div>

                <p style="color: #888; font-size: 0.9em; margin-bottom: 20px;">
                    This is a one-time fee. Once paid, you can travel freely through this passage.
                </p>

                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="gatehouse-pay-btn" style="
                        padding: 12px 24px;
                        background: ${canAfford ? 'linear-gradient(180deg, #4caf50 0%, #388e3c 100%)' : '#666'};
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1em;
                        cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                        opacity: ${canAfford ? '1' : '0.6'};
                    " ${canAfford ? '' : 'disabled'}>
                        Pay ${gatehouse.fee} Gold
                    </button>
                    <button id="gatehouse-cancel-btn" style="
                        padding: 12px 24px;
                        background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1em;
                        cursor: pointer;
                    ">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        const self = this;
        document.getElementById('gatehouse-pay-btn').onclick = () => {
            if (self.payPassageFee(gatehouseId)) {
                modal.remove();
                // Now try to travel to original destination
                if (typeof TravelSystem !== 'undefined') {
                    // Get the original startTravel (not the patched one)
                    const destination = TravelSystem.locations?.[destinationId] ||
                                       TravelSystem.resourceNodes?.find(n => n.id === destinationId) ||
                                       TravelSystem.pointsOfInterest?.find(p => p.id === destinationId);
                    if (destination) {
                        addMessage(`Now traveling to ${destination.name}...`);
                        // Call the travel directly
                        TravelSystem.playerPosition.isTraveling = true;
                        TravelSystem.playerPosition.destination = destination;
                        TravelSystem.playerPosition.travelProgress = 0;
                        TravelSystem.playerPosition.travelStartTime = TimeSystem.getTotalMinutes();
                        const travelInfo = TravelSystem.calculateTravelInfo(destination);
                        TravelSystem.playerPosition.travelDuration = travelInfo.timeHours * 60;
                        TravelSystem.updateTravelUI?.();
                    }
                }
            }
        };

        document.getElementById('gatehouse-cancel-btn').onclick = () => {
            modal.remove();
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    // Get all gatehouses for rendering on map
    getGatehousesForMap() {
        return Object.values(this.GATEHOUSES).map(g => ({
            ...g,
            unlocked: this.unlockedGates.has(g.id)
        }));
    },

    // Reset all gates (for new game)
    resetAllGates() {
        this.unlockedGates.clear();
        this.saveUnlockedGates();

        // Reset starting zone to default
        this.startingZone = 'starter';
        try {
            localStorage.removeItem('trader-claude-starting-zone');
        } catch (e) {}

        // Reset zone accessibility
        this.updateZoneAccessibility();

        console.log('🏰 All gates have been reset');
    },

    // Get a summary of accessible zones for UI display
    getAccessibleZones() {
        const accessible = [];
        const locked = [];

        Object.keys(this.ZONES).forEach(zone => {
            const zoneInfo = this.ZONES[zone];
            if (zone === 'capital' || zone === this.startingZone || zoneInfo.accessible) {
                accessible.push({
                    id: zone,
                    name: zoneInfo.name,
                    isStartingZone: zone === this.startingZone,
                    isCapital: zone === 'capital'
                });
            } else {
                const gatehouseId = this.ZONE_GATEHOUSES[zone];
                const gatehouse = this.GATEHOUSES[gatehouseId];
                locked.push({
                    id: zone,
                    name: zoneInfo.name,
                    gatehouse: gatehouseId,
                    gatehouseName: gatehouse?.name || 'Unknown Gatehouse',
                    fee: gatehouse?.fee || zoneInfo.fee
                });
            }
        });

        return { accessible, locked };
    },

    // ═══════════════════════════════════════════════════════════════
    // 💰 ZONE-BASED PRICE MODIFIERS - balanced trade route profits
    // ═══════════════════════════════════════════════════════════════
    // 🖤 Each zone has specialty items that are cheaper to BUY there
    // and items that are in demand (higher SELL price)
    // This creates natural trade routes without one trade = millionaire
    ZONE_TRADE_BONUSES: {
        starter: {
            // Starter zone - basic goods, balanced prices
            cheapItems: ['wheat', 'grain', 'vegetables', 'bread', 'eggs'],
            expensiveItems: ['silk', 'spices', 'gems', 'exotic_goods'],
            buyMultiplier: 0.9,   // 10% cheaper to buy basics here
            sellMultiplier: 1.0,  // Normal sell prices
            description: 'Farming goods are cheap, exotic goods are expensive'
        },
        southern: {
            // Southern zone - fish, wine, coastal goods
            cheapItems: ['fish', 'wine', 'salt', 'rope', 'canvas', 'pearls', 'oil'],
            expensiveItems: ['furs', 'iron_ore', 'coal', 'wool'],
            buyMultiplier: 0.85,  // 15% cheaper for coastal goods
            sellMultiplier: 1.15, // 15% more for northern goods
            description: 'Coastal goods are cheap, cold-weather goods are valuable'
        },
        eastern: {
            // Eastern zone - silk, spices, exotic
            cheapItems: ['silk', 'spices', 'tea', 'exotic_goods', 'porcelain', 'jade'],
            expensiveItems: ['iron_bar', 'steel_bar', 'weapons', 'armor', 'furs'],
            buyMultiplier: 0.8,   // 20% cheaper for exotic goods
            sellMultiplier: 1.25, // 25% more for metal goods
            description: 'Eastern luxuries are cheap, metal goods are valuable'
        },
        northern: {
            // Northern zone - furs, ores, metals
            cheapItems: ['furs', 'iron_ore', 'coal', 'iron_bar', 'steel_bar', 'leather'],
            expensiveItems: ['silk', 'spices', 'wine', 'exotic_goods', 'fruits'],
            buyMultiplier: 0.75,  // 25% cheaper for cold-weather goods
            sellMultiplier: 1.35, // 35% more for warm-weather luxuries
            description: 'Northern resources are cheap, southern luxuries are valuable'
        },
        western: {
            // Western zone - artifacts, rare items, endgame
            cheapItems: ['artifacts', 'rare_gems', 'gems', 'crystals', 'timber', 'stone'],
            expensiveItems: ['food', 'bread', 'ale', 'medical_plants', 'bandages'],
            buyMultiplier: 0.7,   // 30% cheaper for rare items
            sellMultiplier: 1.5,  // 50% more for survival supplies
            description: 'Rare treasures are cheap, survival supplies are gold'
        },
        capital: {
            // Capital - luxury goods, balanced high prices
            cheapItems: ['royal_goods', 'luxury_items', 'jewelry', 'fine_clothes'],
            expensiveItems: ['artifacts', 'rare_gems', 'silk', 'gems', 'gold_bar'],
            buyMultiplier: 1.1,   // 10% MORE expensive (luxury tax)
            sellMultiplier: 1.4,  // 40% more for rare treasures
            description: 'Luxury goods available but taxed, rare items fetch premium'
        }
    },

    // 💀 Get price modifier for an item at a location
    getZonePriceModifier(locationId, itemId, isBuying) {
        const zone = this.LOCATION_ZONES[locationId] || this.getLocationZone(locationId);
        const zoneBonus = this.ZONE_TRADE_BONUSES[zone];

        if (!zoneBonus) return 1.0; // No modifier

        if (isBuying) {
            // Player is BUYING from merchant
            if (zoneBonus.cheapItems?.includes(itemId)) {
                return zoneBonus.buyMultiplier; // Discounted
            }
        } else {
            // Player is SELLING to merchant
            if (zoneBonus.expensiveItems?.includes(itemId)) {
                return zoneBonus.sellMultiplier; // Premium
            }
        }

        return 1.0; // No special modifier
    },

    // 🦇 Get trade route suggestion for a zone
    getTradeRouteSuggestion(fromZone) {
        const routes = {
            starter: { to: 'southern', buy: 'wheat/grain', sell: 'fish/wine', profit: '~20-30%' },
            southern: { to: 'eastern', buy: 'fish/pearls', sell: 'silk/spices', profit: '~30-40%' },
            eastern: { to: 'northern', buy: 'silk/spices', sell: 'furs/ores', profit: '~40-50%' },
            northern: { to: 'western', buy: 'furs/iron_bar', sell: 'artifacts', profit: '~50-60%' },
            western: { to: 'capital', buy: 'artifacts/gems', sell: 'premium', profit: '~60-80%' },
            capital: { to: 'starter', buy: 'luxury_items', sell: 'to nobles', profit: 'prestige' }
        };
        return routes[fromZone] || null;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => GatehouseSystem.init(), 800);
    });
} else {
    setTimeout(() => GatehouseSystem.init(), 800);
}

// Expose globally
window.GatehouseSystem = GatehouseSystem;
