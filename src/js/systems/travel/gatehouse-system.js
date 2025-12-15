//
// GATEHOUSE SYSTEM - pay the toll to walk new roads of suffering
//
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
//
// Config-driven: Fees and zones can be adjusted in GameConfig.gatehouses
//

const GatehouseSystem = {
    // gates you've bought passage through (freedom costs gold)
    unlockedGates: new Set(),

    // where this nightmare began
    startingZone: 'starter',

    // Helper to get fee from config (with fallback)
    getGateFee(gatehouseId) {
        // Check GameConfig first
        if (typeof GameConfig !== 'undefined' && GameConfig.gatehouses?.fees?.[gatehouseId]) {
            return GameConfig.gatehouses.fees[gatehouseId];
        }
        // Fallback to hardcoded values
        const fallbackFees = {
            northern_outpost: 10000,
            western_watch: 50000,
            jade_harbor: 100000
        };
        return fallbackFees[gatehouseId] || 0;
    },

    // regions of this dying world - some locked, some free
    // capital always open (even hell needs a throne)
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
            description: 'Cold northern lands with valuable furs and minerals. Pass through Northern Outpost to reach Ironforge City.',
            accessible: false,
            gatehouse: 'northern_outpost', // Northern Outpost is the gate
            fee: 10000 // Mid-game barrier - 10k gold to brave the frozen north
        },
        eastern: {
            name: 'Eastern Reaches',
            description: 'Prosperous trading regions to the east. Pay the fee at Jade Harbor to enter.',
            accessible: false,
            gatehouse: 'jade_harbor',
            fee: 1000 // Early-mid game - 1k gold
        },
        western: {
            name: 'Western Wilds',
            description: 'Untamed western frontier with rare resources. Pass through Western Watch to reach Stonebridge village.',
            accessible: false,
            gatehouse: 'western_watch', // Western Watch is the gate
            fee: 50000 // Late-game barrier - 50k gold for the endgame zone
        },
        southern: {
            name: 'Southern Coast',
            description: 'The Glendale region - a natural expansion from the starter area. Free passage for all traders.',
            accessible: true, // FREE! natural progression from starter
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

    // the guardhouses where you pay for passage deeper into darkness
    // you can reach them, but not pass through without gold
    GATEHOUSES: {
        // Northern zone gate - Northern Outpost - MID GAME 10k
        northern_outpost: {
            id: 'northern_outpost',
            name: 'Northern Outpost',
            type: 'gatehouse',
            icon: '🏰',
            description: 'The Northern Outpost guards access to the Northern Territories. Only seasoned traders with 10,000 gold may pass beyond to Ironforge City.',
            fee: 10000,
            unlocksZone: 'northern',
            guards: 'Northern Guard',
            services: ['passage', 'supplies'],
            visibleAlways: true,
            useGameWorldLocation: true
        },
        // Western zone gate - Western Watch - LATE GAME 50k
        western_watch: {
            id: 'western_watch',
            name: 'Western Watch',
            type: 'gatehouse',
            icon: '🛡️',
            description: 'The Western Watch marks the edge of civilized lands. Only the wealthiest merchants (50,000 gold) may enter the Western Wilds and reach Stonebridge.',
            fee: 50000,
            unlocksZone: 'western',
            guards: 'Western Watch Militia',
            services: ['passage', 'supplies', 'bounties'],
            visibleAlways: true,
            useGameWorldLocation: true
        },
        // Eastern zone gate - Jade Harbor - EARLY-MID GAME 1k
        jade_harbor: {
            id: 'jade_harbor',
            name: 'Jade Harbor',
            type: 'gatehouse',
            icon: '⚓',
            description: 'The gateway to the prosperous Eastern Reaches. Pay 1,000 gold to the Merchant Guild for passage.',
            fee: 1000,
            unlocksZone: 'eastern',
            guards: 'Merchant Guild',
            services: ['passage', 'trade', 'shipping'],
            visibleAlways: true,
            useGameWorldLocation: true
        }
        // Southern/Glendale has NO gatehouse - FREE access from starter!
        // Starter has NO gatehouse - always accessible!
    },

    // which gate controls which region - your roadmap to ruin
    // progression: starter -> south (FREE) -> east (1k) -> north (10k) -> west (50k)
    ZONE_GATEHOUSES: {
        'northern': 'northern_outpost',      // 10,000g - mid game (Northern Outpost gate → Ironforge City)
        'western': 'western_watch',          // 50,000g - late game (Western Watch gate → Stonebridge village)
        'eastern': 'jade_harbor',          // 1,000g - early-mid game (Jade Harbor)
        'southern': null,                  // FREE! No gatehouse - natural expansion
        'capital': null,                   // Capital ALWAYS accessible
        'starter': null                    // Starter always accessible
    },

    // every location mapped to its region of despair
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

        // Northern Outpost is the GATE to northern - in starter zone, controls northern access
        'northern_outpost': 'starter',

        // Northern zone locations (behind the gate)
        'iron_mines': 'northern',
        'ironforge_city': 'northern', // The great forge city
        'silverkeep': 'northern',
        'silver_mine': 'northern',
        'frostholm_village': 'northern',
        'mountain_pass_inn': 'northern',
        'deep_cavern': 'northern',
        'crystal_cave': 'northern',
        'winterwatch_outpost': 'northern',
        'frozen_cave': 'northern',
        'ruins_of_eldoria': 'northern',

        // Western Watch is the GATE to western - in starter zone, controls western access
        'western_watch': 'starter',

        // Western zone locations (behind the gate)
        'stonebridge': 'western', // The mason village
        'darkwood_village': 'western',
        'miners_rest': 'western',
        'ancient_forest': 'western',
        'hermit_grove': 'western',
        'druid_grove': 'western',
        'deep_mine': 'western',
        'stone_quarry': 'western',
        'shadow_dungeon': 'western',
        'forest_dungeon': 'western',

        // Jade Harbor is the GATE to eastern - it's in southern zone but controls eastern access
        'jade_harbor': 'southern',

        // Eastern zone locations (behind the gate)
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
        'coastal_cave': 'southern',
        'hidden_cove': 'southern',

        // quest locations
        'rat_tunnels': 'starter',
        'old_mines': 'northern',
        'bandit_camp': 'western',
        'witch_hut': 'western',
        'thieves_guild': 'capital'
    },

    // Track if all gates have been unlocked (doom mode)
    _allGatesUnlocked: false,

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

    // Check if we're in doom world - comprehensive check
    _isInDoomWorld() {
        // Check TravelSystem
        if (typeof TravelSystem !== 'undefined') {
            if (TravelSystem.currentWorld === 'doom') return true;
            if (typeof TravelSystem.isInDoomWorld === 'function' && TravelSystem.isInDoomWorld()) return true;
        }
        // Check DoomWorldSystem
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) return true;
        // Check game state
        if (typeof game !== 'undefined' && game.inDoomWorld) return true;
        // Check WorldStateManager
        if (typeof WorldStateManager !== 'undefined') {
            if (WorldStateManager._currentWorld === 'doom') return true;
            if (WorldStateManager._isInDoomWorld) return true;
        }
        // Check body class (visual indicator)
        if (document.body.classList.contains('doom-world')) return true;
        return false;
    },

    // Unlock ALL gatehouses at once (for doom world entry or debug)
    unlockAllGates(reason = 'doom_world') {
        console.log(`🏰 UNLOCKING ALL GATEHOUSES: ${reason}`);
        this._allGatesUnlocked = true;

        // Also add each gate to unlocked set for persistence
        Object.keys(this.GATEHOUSES).forEach(gatehouseId => {
            this.unlockedGates.add(gatehouseId);
        });

        // Mark all zones accessible
        Object.keys(this.ZONES).forEach(zone => {
            this.ZONES[zone].accessible = true;
        });

        this.saveUnlockedGates();
        addMessage('🏰 All passage fees have been waived - free travel unlocked!', 'success');
        console.log('🏰 All gates unlocked:', Array.from(this.unlockedGates));
    },

    // Reset gate locks (for new game)
    resetAllGates() {
        console.log('🏰 Resetting all gate locks...');
        this._allGatesUnlocked = false;
        this.unlockedGates.clear();
        this.updateZoneAccessibility();
        this.saveUnlockedGates();
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

    // load unlocked gates from storage
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

    // can you walk this path or is it still locked by greed?
    // gates block you until gold opens the way
    // once paid, roam freely (within that zone of suffering)
    // DOOM WORLD: all zones accessible - the apocalypse has no toll booths
    canAccessLocation(locationId, fromLocationId = null) {
        // DOOM WORLD BYPASS: No gatehouse restrictions in doom world
        // Check ALL possible doom indicators - be thorough!
        const inDoom = this._isInDoomWorld();
        if (inDoom) {
            console.log('🏰 DOOM BYPASS: All gates open in doom world');
            return { accessible: true, reason: null, zoneType: 'doom_world' };
        }

        // Also bypass if all gates are unlocked (doom mode enabled)
        if (this._allGatesUnlocked) {
            console.log('🏰 ALL GATES UNLOCKED: Free passage everywhere');
            return { accessible: true, reason: null, zoneType: 'unlocked_all' };
        }

        // Get destination zone
        const destZone = this.LOCATION_ZONES[locationId] || this.getLocationZone(locationId);

        // Get where we're coming from
        const fromId = fromLocationId || (typeof game !== 'undefined' ? game.currentLocation?.id : null);
        const fromZone = fromId ? (this.LOCATION_ZONES[fromId] || this.getLocationZone(fromId)) : null;

        console.log(`🏰 canAccessLocation check: ${locationId} (zone: ${destZone}) from ${fromId} (zone: ${fromZone})`);

        // FREE ZONES - no toll required (yet)
        // capital, starter, southern - your starting playground
        if (destZone === 'capital') {
            return { accessible: true, reason: null, zoneType: 'capital' };
        }
        if (destZone === 'starter') {
            return { accessible: true, reason: null, zoneType: 'starter' };
        }
        if (destZone === 'southern') {
            return { accessible: true, reason: null, zoneType: 'free' };
        }
        // PAID ZONES - Eastern, Northern, Western demand gold

        // gatehouses themselves are always reachable
        // (you can reach the gate - passing through costs gold)
        const destIsGatehouse = Object.values(this.GATEHOUSES).find(g => g.id === locationId);
        if (destIsGatehouse) {
            return { accessible: true, reason: null, isGatehouse: true };
        }

        // already bought passage? walk free.
        const gatehouseId = this.ZONE_GATEHOUSES[destZone];
        if (gatehouseId && this.unlockedGates.has(gatehouseId)) {
            return { accessible: true, reason: null, zoneType: 'unlocked' };
        }

        // Check zone info
        const zoneInfo = this.ZONES[destZone];
        if (!zoneInfo) {
            return { accessible: true, reason: null, zoneType: 'unknown' };
        }
        if (zoneInfo.accessible) {
            return { accessible: true, reason: null, zoneType: 'accessible' };
        }

        // ALREADY INSIDE - roam freely within your current cage
        // (if you're already in, move around - how you got there doesn't matter now)
        if (fromZone === destZone) {
            return { accessible: true, reason: null, zoneType: 'sameZone' };
        }

        // STANDING AT THE GATE - can you pass through or are you blocked?
        // guards watch, hands outstretched for coin
        const fromIsGatehouse = fromId ? Object.values(this.GATEHOUSES).find(g => g.id === fromId) : null;
        if (fromIsGatehouse) {
            // you're at the gate
            if (fromIsGatehouse.unlocksZone === destZone) {
                // trying to pass through - better have paid the toll
                // no gold? no entry.
                if (!this.unlockedGates.has(fromIsGatehouse.id)) {
                    console.log(`🏰 BLOCKED: At ${fromIsGatehouse.name}, trying to enter ${destZone} without paying`);
                    return {
                        accessible: false,
                        reason: `You must pay the ${fromIsGatehouse.fee} gold passage fee to the guard before entering the ${zoneInfo.name}.`,
                        gatehouse: fromIsGatehouse.id,
                        fee: fromIsGatehouse.fee,
                        atGatehouse: true
                    };
                }
            } else {
                // turning back from the gate - that's allowed
                console.log(`🏰 Leaving ${fromIsGatehouse.name} - going back, allowed`);
                return { accessible: true, reason: null, leavingGate: true };
            }
        }

        // TRYING TO SNEAK AROUND - nice try, asshole
        // can't bypass the gatehouse - go pay your toll like everyone else
        const gateInfo = this.GATEHOUSES[gatehouseId];
        console.log(`🏰 BLOCKED: Trying to enter ${destZone} from ${fromZone} - must go through ${gateInfo?.name || 'gatehouse'}`);
        return {
            accessible: false,
            reason: `You cannot enter the ${zoneInfo.name} from here. You must travel to ${gateInfo?.name || 'the gatehouse'} and pay the passage fee first.`,
            gatehouse: gatehouseId,
            fee: gateInfo?.fee || zoneInfo.fee,
            needsGatehouse: true
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

    // hand over the gold - buy your passage through the gate
    payPassageFee(gatehouseId) {
        const gatehouse = this.GATEHOUSES[gatehouseId];
        if (!gatehouse) {
            addMessage('Invalid gatehouse!', 'error');
            return false;
        }

        // already paid? stop wasting my time.
        if (this.unlockedGates.has(gatehouseId)) {
            addMessage(`${gatehouse.name} is already unlocked!`, 'info');
            return true;
        }

        // can you afford freedom?
        if (typeof game === 'undefined' || !game.player) {
            addMessage('Cannot access player data!', 'error');
            return false;
        }

        if (game.player.gold < gatehouse.fee) {
            addMessage(`Not enough gold! You need ${gatehouse.fee} gold to pay the passage fee.`, 'error');
            return false;
        }

        // watch your wealth drain away for the illusion of progress
        game.player.gold -= gatehouse.fee;
        this.unlockedGates.add(gatehouseId);
        this.saveUnlockedGates();

        // the zone opens - new paths of suffering await
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

    // Get passage status for a location (for tooltips and headers)
    // Returns: { hasFreePassage: bool, passageText: string, zoneInfo: object }
    getPassageStatus(locationId) {
        const zone = this.LOCATION_ZONES[locationId] || this.getLocationZone(locationId);
        const zoneInfo = this.ZONES[zone];
        const gatehouseId = this.ZONE_GATEHOUSES[zone];
        const gatehouse = gatehouseId ? this.GATEHOUSES[gatehouseId] : null;

        // Check if location IS a gatehouse
        const isGatehouse = Object.keys(this.GATEHOUSES).includes(locationId);

        // Doom world - all free
        if (this._isInDoomWorld() || this._allGatesUnlocked) {
            return {
                hasFreePassage: true,
                passageText: '🔓 Free Passage (All Gates Open)',
                zoneInfo: zoneInfo,
                isGatehouse: isGatehouse
            };
        }

        // Free zones (capital, starter, southern)
        if (zone === 'capital' || zone === 'starter' || zone === 'southern' || zone === this.startingZone) {
            return {
                hasFreePassage: true,
                passageText: null, // Don't show anything for naturally free zones
                zoneInfo: zoneInfo,
                isGatehouse: isGatehouse
            };
        }

        // Check if gate is unlocked
        if (gatehouseId && this.unlockedGates.has(gatehouseId)) {
            return {
                hasFreePassage: true,
                passageText: '🔓 Passage Paid',
                zoneInfo: zoneInfo,
                gatehouse: gatehouse,
                isGatehouse: isGatehouse
            };
        }

        // Gate is locked
        if (gatehouse) {
            return {
                hasFreePassage: false,
                passageText: `🔒 Requires ${gatehouse.fee}g at ${gatehouse.name}`,
                zoneInfo: zoneInfo,
                gatehouse: gatehouse,
                fee: gatehouse.fee,
                isGatehouse: isGatehouse
            };
        }

        // Unknown zone - assume free
        return {
            hasFreePassage: true,
            passageText: null,
            zoneInfo: zoneInfo,
            isGatehouse: isGatehouse
        };
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
                // Get current location for zone check
                const fromLocationId = game?.currentLocation?.id || null;

                // Check zone access
                const access = self.canAccessLocation(destinationId, fromLocationId);

                if (!access.accessible) {
                    console.log('🏰 Travel blocked:', access);

                    const gatehouse = self.GATEHOUSES[access.gatehouse];
                    const zoneName = self.ZONES[gatehouse?.unlocksZone]?.name || 'that region';

                    if (access.atGatehouse) {
                        // Player is AT the gatehouse trying to pass through without paying
                        // Tell them to talk to the guard via People Panel
                        addMessage(`🏰 You need to pay the passage fee before entering ${zoneName}.`);
                        addMessage(`💬 Speak with the guard to pay the ${access.fee} gold fee.`);
                    } else {
                        // Player is trying to enter from elsewhere - tell them to go to gatehouse
                        addMessage(`🚫 You cannot enter ${zoneName} from here.`);
                        addMessage(`🏰 Travel to ${gatehouse?.name || 'the gatehouse'} and speak with the guard to pay the passage fee.`);
                    }
                    return;
                }

                // Proceed with travel
                originalStartTravel(destinationId);
            };
            console.log('🏰 Patched TravelSystem.startTravel for zone checking');
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

    // Show NPC guard encounter when player arrives at a gatehouse
    showGatehouseArrivalPrompt(gatehouseId) {
        const gatehouse = this.GATEHOUSES[gatehouseId];
        if (!gatehouse) return;

        // Don't show if already unlocked
        if (this.unlockedGates.has(gatehouseId)) return;

        const playerGold = game?.player?.gold || 0;
        const canAfford = playerGold >= gatehouse.fee;
        const zoneName = this.ZONES[gatehouse.unlocksZone]?.name || 'the region beyond';
        const self = this;

        // Create a guard NPC for this gatehouse
        const guardNPC = {
            id: `gate_guard_${gatehouseId}`,
            name: gatehouse.guards || 'Gate Guard',
            type: 'guard',
            icon: '🛡️',
            description: `A stern guard watching over ${gatehouse.name}.`,
            personality: 'stern',
            speakingStyle: 'formal, authoritative',
            background: `Stationed at ${gatehouse.name} to collect passage fees and maintain order.`,
            traits: ['dutiful', 'stern', 'incorruptible'],
            greetings: [
                `Halt, traveler. This is ${gatehouse.name}. Passage to ${zoneName} requires a fee of ${gatehouse.fee} gold.`,
                `You wish to pass through to ${zoneName}? The toll is ${gatehouse.fee} gold. Pay up or turn back.`,
                `Welcome to ${gatehouse.name}. None pass without paying the ${gatehouse.fee} gold toll.`
            ],
            gatehouseId: gatehouseId,
            fee: gatehouse.fee,
            zoneName: zoneName
        };

        // Use PeoplePanel for the encounter if available
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.showSpecialEncounter) {
            // Pick a random greeting from the guard
            const greeting = guardNPC.greetings[Math.floor(Math.random() * guardNPC.greetings.length)];

            PeoplePanel.showSpecialEncounter(guardNPC, {
                greeting: greeting,
                disableChat: true, // No chat needed, just pay or leave
                customActions: [
                    {
                        label: `💰 Pay ${gatehouse.fee} Gold`,
                        primary: canAfford,
                        action: () => {
                            if (!canAfford) {
                                addMessage(`💸 You don't have enough gold. The guard needs ${gatehouse.fee} gold.`);
                                return;
                            }
                            if (self.payPassageFee(gatehouseId)) {
                                PeoplePanel.closeSpecialEncounter ? PeoplePanel.closeSpecialEncounter() : PeoplePanel.hide();
                                addMessage(`🎉 ${gatehouse.name} passage unlocked! You can now freely travel to ${zoneName}.`);
                            }
                        }
                    },
                    {
                        label: '🚶 Leave',
                        action: () => {
                            PeoplePanel.closeSpecialEncounter ? PeoplePanel.closeSpecialEncounter() : PeoplePanel.hide();
                            addMessage(`The guard watches you leave. "Come back when you have the coin."`);
                        },
                        closeAfter: true
                    }
                ],
                onClose: () => {
                    // Resume time if it was paused
                    if (typeof TimeSystem !== 'undefined' && TimeSystem.resume) {
                        TimeSystem.resume();
                    }
                }
            });
        } else {
            // Fallback to modal if PeoplePanel not available
            this.showGatehouseModal(gatehouseId);
        }
    },

    // Fallback modal for gatehouse (used if PeoplePanel unavailable)
    showGatehouseModal(gatehouseId) {
        const gatehouse = this.GATEHOUSES[gatehouseId];
        if (!gatehouse) return;

        const playerGold = game?.player?.gold || 0;
        const canAfford = playerGold >= gatehouse.fee;
        const zoneName = this.ZONES[gatehouse.unlocksZone]?.name || 'the region beyond';

        const modal = document.createElement('div');
        modal.id = 'gatehouse-arrival-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 700;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(180deg, rgba(50, 40, 30, 0.98) 0%, rgba(35, 28, 20, 0.98) 100%);
                border: 2px solid rgba(255, 180, 0, 0.6);
                border-radius: 12px;
                padding: 28px;
                max-width: 480px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
            ">
                <h2 style="color: #ffb700; margin-bottom: 16px;">🛡️ ${gatehouse.guards || 'Gate Guard'}</h2>
                <p style="color: #e0e0e0; margin-bottom: 16px; line-height: 1.5; font-style: italic;">
                    "Halt, traveler. This is ${gatehouse.name}. Passage to ${zoneName} requires a fee of ${gatehouse.fee} gold."
                </p>

                <div style="
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255, 180, 0, 0.3);
                ">
                    <p style="color: #ffd700; font-size: 1.2em; margin-bottom: 8px;">
                        Passage Fee: <strong>${gatehouse.fee} gold</strong>
                    </p>
                    <p style="color: ${canAfford ? '#4caf50' : '#f44336'}; font-size: 0.95em;">
                        Your Gold: ${playerGold} gold ${canAfford ? '✓' : '(insufficient)'}
                    </p>
                </div>

                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button id="gate-arrival-pay-btn" style="
                        padding: 14px 28px;
                        background: ${canAfford ? 'linear-gradient(180deg, #4caf50 0%, #388e3c 100%)' : '#555'};
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1em;
                        font-weight: bold;
                        cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                        opacity: ${canAfford ? '1' : '0.6'};
                    " ${canAfford ? '' : 'disabled'}>
                        💰 Pay ${gatehouse.fee} Gold
                    </button>
                    <button id="gate-arrival-later-btn" style="
                        padding: 14px 28px;
                        background: linear-gradient(180deg, #666 0%, #444 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1em;
                        cursor: pointer;
                    ">
                        🚶 Leave
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const self = this;

        document.getElementById('gate-arrival-pay-btn').onclick = () => {
            if (self.payPassageFee(gatehouseId)) {
                modal.remove();
                addMessage(`🎉 ${gatehouse.name} passage unlocked! You can now freely travel to ${zoneName}.`);
            }
        };

        document.getElementById('gate-arrival-later-btn').onclick = () => {
            modal.remove();
            addMessage(`The guard watches you leave. "Come back when you have the coin."`);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
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

    //
    // zone-based price modifiers - balanced trade route profits
    //
    // each zone has specialty items that are cheaper to BUY there
    // and items that are in demand (higher SELL price)
    // this creates natural trade routes without one trade = millionaire
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

    // get price modifier for an item at a location
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

    // get trade route suggestion for a zone
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

// Expose globally
window.GatehouseSystem = GatehouseSystem;

// register with Bootstrap
Bootstrap.register('GatehouseSystem', () => GatehouseSystem.init(), {
    dependencies: ['TravelSystem', 'GameWorld'],
    priority: 64,
    severity: 'optional'
});
