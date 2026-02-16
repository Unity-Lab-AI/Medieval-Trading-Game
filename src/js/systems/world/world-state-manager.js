// ═══════════════════════════════════════════════════════════════
// WORLD-STATE-MANAGER - single source of truth for world/location state
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// Unifies scattered location state from:
// - game.currentLocation (171 accesses)
// - TravelSystem.currentWorld
// - TravelSystem.playerPosition.currentLocation
// - DoomWorldSystem.isActive
// - GameWorld.visitedLocations
// ═══════════════════════════════════════════════════════════════

const WorldStateManager = {
    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    _initialized: false,

    // current location - THE source of truth
    _currentLocation: null, // { id, name, description, type, ... }

    // world state
    _currentWorld: 'normal', // 'normal' or 'doom'
    _isInDoomWorld: false,

    // visited locations (both worlds)
    _visitedLocations: new Set(),
    _doomVisitedLocations: new Set(),

    // previous location for back navigation
    _previousLocation: null,

    // travel state
    _isTraveling: false,
    _travelDestination: null,

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this._initialized) {
            console.log('🌍 WorldStateManager already initialized');
            return;
        }

        console.log('🌍 WorldStateManager: Initializing world state controller...');

        // sync from existing systems on init
        this._syncFromExistingSystems();

        // listen for events
        this._setupEventListeners();

        this._initialized = true;
        console.log('🌍 WorldStateManager: Ready. Current location:', this._currentLocation?.id);
        console.log('🌍 WorldStateManager: Current world:', this._currentWorld);
    },

    // sync initial state from scattered sources
    _syncFromExistingSystems() {
        // sync from game.currentLocation
        if (typeof game !== 'undefined' && game.currentLocation) {
            this._currentLocation = { ...game.currentLocation };
        }

        // sync world state from TravelSystem
        if (typeof TravelSystem !== 'undefined') {
            this._currentWorld = TravelSystem.currentWorld || 'normal';
            if (TravelSystem.playerPosition?.currentLocation && !this._currentLocation) {
                const locId = TravelSystem.playerPosition.currentLocation;
                const loc = GameWorld?.locations?.[locId];
                if (loc) {
                    this._currentLocation = { id: locId, ...loc };
                }
            }
        }

        // sync doom state from DoomWorldSystem
        if (typeof DoomWorldSystem !== 'undefined') {
            this._isInDoomWorld = DoomWorldSystem.isActive || false;
            if (this._isInDoomWorld) {
                this._currentWorld = 'doom';
            }
        }

        // sync visited locations from GameWorld
        if (typeof GameWorld !== 'undefined') {
            if (GameWorld.visitedLocations) {
                this._visitedLocations = new Set(GameWorld.visitedLocations);
            }
            if (GameWorld.doomVisitedLocations) {
                this._doomVisitedLocations = new Set(GameWorld.doomVisitedLocations);
            }
        }

        // sync from game.visitedLocations
        if (typeof game !== 'undefined' && game.visitedLocations) {
            game.visitedLocations.forEach(loc => this._visitedLocations.add(loc));
        }
    },

    _setupEventListeners() {
        if (typeof EventBus === 'undefined') return;

        // listen for travel events
        EventBus.on('travel:arrived', (data) => {
            if (data.location) {
                this.setCurrentLocation(data.location, 'travel_arrived');
            }
        });

        // listen for world change events (standardized to world:changed)
        EventBus.on('world:changed', (data) => {
            if (data.world) {
                this._currentWorld = data.world;
                this._isInDoomWorld = data.world === 'doom';
                // don't re-emit since we're receiving the event
            }
        });

        // listen for doom world enter/exit
        EventBus.on('doom:entered', () => {
            this._currentWorld = 'doom';
            this._isInDoomWorld = true;
        });

        EventBus.on('doom:exited', () => {
            this._currentWorld = 'normal';
            this._isInDoomWorld = false;
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // LOCATION GETTERS
    // ═══════════════════════════════════════════════════════════════

    // get current location object
    getCurrentLocation() {
        // always check game.currentLocation as fallback since not all code migrated yet
        if (!this._currentLocation && typeof game !== 'undefined' && game.currentLocation) {
            this._currentLocation = { ...game.currentLocation };
        }
        return this._currentLocation;
    },

    // get current location ID only
    getCurrentLocationId() {
        const loc = this.getCurrentLocation();
        if (!loc) return null;
        return typeof loc === 'string' ? loc : loc.id;
    },

    // get current location name
    getCurrentLocationName() {
        const loc = this.getCurrentLocation();
        return loc?.name || 'Unknown';
    },

    // get full location data from GameWorld
    getFullLocationData(locationId) {
        const id = locationId || this.getCurrentLocationId();
        if (!id) return null;

        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            return GameWorld.locations[id] || null;
        }
        return null;
    },

    // get previous location (for back navigation)
    getPreviousLocation() {
        return this._previousLocation;
    },

    // ═══════════════════════════════════════════════════════════════
    // LOCATION SETTERS
    // ═══════════════════════════════════════════════════════════════

    // set current location - THE central method
    // reason: 'travel_arrived', 'teleport', 'save_load', 'character_creation', 'doom_enter', 'doom_exit'
    setCurrentLocation(location, reason = 'unknown') {
        const oldLocation = this._currentLocation;
        const oldLocationId = this.getCurrentLocationId();

        // normalize location to object format
        let newLocation;
        if (typeof location === 'string') {
            // location ID provided - look up full data
            const fullData = this.getFullLocationData(location);
            if (fullData) {
                newLocation = { id: location, ...fullData };
            } else {
                newLocation = { id: location, name: location };
            }
        } else if (location && typeof location === 'object') {
            newLocation = { ...location };
            // ensure id is set
            if (!newLocation.id && location.id) {
                newLocation.id = location.id;
            }
        } else {
            console.error('🌍 WorldStateManager: Invalid location:', location);
            return false;
        }

        // store previous location
        if (oldLocation) {
            this._previousLocation = oldLocation;
        }

        // update internal state
        this._currentLocation = newLocation;

        // sync to game.currentLocation (backwards compatibility)
        if (typeof game !== 'undefined') {
            game.currentLocation = newLocation;
        }

        // sync to TravelSystem
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition) {
            TravelSystem.playerPosition.currentLocation = newLocation.id;
        }

        // track visited location
        this.markLocationVisited(newLocation.id);

        // emit event
        this._emitLocationChange(newLocation, oldLocation, reason);

        // track state change in SystemRegistry
        if (typeof Sys !== 'undefined' && Sys.trackChange) {
            Sys.trackChange('WorldStateManager', 'currentLocation', oldLocationId, newLocation.id, reason);
        }

        console.log(`🌍 Location changed: ${oldLocationId} → ${newLocation.id} (${reason})`);
        return true;
    },

    // mark a location as visited
    markLocationVisited(locationId) {
        if (!locationId) return;

        const visitedSet = this._isInDoomWorld ? this._doomVisitedLocations : this._visitedLocations;
        visitedSet.add(locationId);

        // sync to GameWorld
        if (typeof GameWorld !== 'undefined') {
            if (this._isInDoomWorld) {
                if (!GameWorld.doomVisitedLocations) {
                    GameWorld.doomVisitedLocations = [];
                }
                if (!GameWorld.doomVisitedLocations.includes(locationId)) {
                    GameWorld.doomVisitedLocations.push(locationId);
                }
            } else {
                if (!GameWorld.visitedLocations) {
                    GameWorld.visitedLocations = [];
                }
                if (!GameWorld.visitedLocations.includes(locationId)) {
                    GameWorld.visitedLocations.push(locationId);
                }
            }
        }

        // sync to game.visitedLocations
        if (typeof game !== 'undefined' && !this._isInDoomWorld) {
            if (!game.visitedLocations) {
                game.visitedLocations = [];
            }
            if (!game.visitedLocations.includes(locationId)) {
                game.visitedLocations.push(locationId);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // WORLD STATE
    // ═══════════════════════════════════════════════════════════════

    // get current world
    getCurrentWorld() {
        return this._currentWorld;
    },

    // check if in doom world
    isInDoomWorld() {
        return this._isInDoomWorld || this._currentWorld === 'doom';
    },

    // set world state
    setCurrentWorld(world, reason = 'unknown') {
        const oldWorld = this._currentWorld;
        this._currentWorld = world;
        this._isInDoomWorld = world === 'doom';

        // sync to TravelSystem
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.currentWorld = world;
        }

        // sync to DoomWorldSystem
        if (typeof DoomWorldSystem !== 'undefined') {
            DoomWorldSystem.isActive = world === 'doom';
        }

        // sync to game
        if (typeof game !== 'undefined') {
            game.inDoomWorld = world === 'doom';
        }

        this._emitWorldChange(world, oldWorld, reason);

        console.log(`🌍 World changed: ${oldWorld} → ${world} (${reason})`);
        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // VISITED LOCATIONS
    // ═══════════════════════════════════════════════════════════════

    // check if location has been visited
    hasVisitedLocation(locationId) {
        const visitedSet = this._isInDoomWorld ? this._doomVisitedLocations : this._visitedLocations;
        return visitedSet.has(locationId);
    },

    // get all visited locations
    getVisitedLocations() {
        const visitedSet = this._isInDoomWorld ? this._doomVisitedLocations : this._visitedLocations;
        return Array.from(visitedSet);
    },

    // get visited location count
    getVisitedLocationCount() {
        const visitedSet = this._isInDoomWorld ? this._doomVisitedLocations : this._visitedLocations;
        return visitedSet.size;
    },

    // ═══════════════════════════════════════════════════════════════
    // TRAVEL STATE
    // ═══════════════════════════════════════════════════════════════

    // check if currently traveling
    isTraveling() {
        // also check TravelSystem for backwards compat
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition) {
            return TravelSystem.playerPosition.isTraveling || this._isTraveling;
        }
        return this._isTraveling;
    },

    // get travel destination
    getTravelDestination() {
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.destination) {
            return TravelSystem.playerPosition.destination;
        }
        return this._travelDestination;
    },

    // set travel state
    setTravelState(isTraveling, destination = null) {
        this._isTraveling = isTraveling;
        this._travelDestination = destination;

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('travel:stateChanged', {
                isTraveling,
                destination,
                currentLocation: this.getCurrentLocationId()
            });
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    _emitLocationChange(newLocation, oldLocation, reason) {
        if (typeof EventBus === 'undefined') return;

        EventBus.emit('location:changed', {
            location: newLocation,
            locationId: newLocation?.id,
            previousLocation: oldLocation,
            previousLocationId: oldLocation?.id,
            reason: reason,
            world: this._currentWorld
        });
    },

    _emitWorldChange(newWorld, oldWorld, reason) {
        if (typeof EventBus === 'undefined') return;

        EventBus.emit('world:changed', {
            world: newWorld,
            previousWorld: oldWorld,
            reason: reason,
            currentLocation: this.getCurrentLocationId()
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE/LOAD SUPPORT
    // ═══════════════════════════════════════════════════════════════

    getSaveData() {
        return {
            currentLocation: this._currentLocation,
            currentWorld: this._currentWorld,
            isInDoomWorld: this._isInDoomWorld,
            visitedLocations: Array.from(this._visitedLocations),
            doomVisitedLocations: Array.from(this._doomVisitedLocations),
            previousLocation: this._previousLocation
        };
    },

    loadSaveData(data) {
        if (!data) return;

        if (data.currentLocation) {
            this._currentLocation = data.currentLocation;
            // sync to game
            if (typeof game !== 'undefined') {
                game.currentLocation = data.currentLocation;
            }
        }

        if (data.currentWorld) {
            this._currentWorld = data.currentWorld;
            this._isInDoomWorld = data.currentWorld === 'doom';
        }

        if (data.visitedLocations) {
            this._visitedLocations = new Set(data.visitedLocations);
        }

        if (data.doomVisitedLocations) {
            this._doomVisitedLocations = new Set(data.doomVisitedLocations);
        }

        if (data.previousLocation) {
            this._previousLocation = data.previousLocation;
        }

        console.log('🌍 WorldStateManager: Loaded save data. Location:', this._currentLocation?.id);
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBUG
    // ═══════════════════════════════════════════════════════════════

    debug() {
        console.log('═══════════════════════════════════════');
        console.log('🌍 WORLD STATE MANAGER DEBUG');
        console.log('═══════════════════════════════════════');
        console.log('Current Location:', this._currentLocation);
        console.log('Current World:', this._currentWorld);
        console.log('In Doom World:', this._isInDoomWorld);
        console.log('Is Traveling:', this.isTraveling());
        console.log('Visited Locations:', this.getVisitedLocationCount());
        console.log('Doom Visited:', this._doomVisitedLocations.size);
        console.log('Previous Location:', this._previousLocation?.id);
        console.log('═══════════════════════════════════════');
    }
};

// global access
window.WorldStateManager = WorldStateManager;

// register with Bootstrap - deps handled properly now, no more polling bullshit
Bootstrap.register('WorldStateManager', () => WorldStateManager.init(), {
    dependencies: ['GameWorld', 'TravelSystem', 'DoomWorldSystem', 'game'],
    priority: 30,
    severity: 'required'
});
