// 
// TRAVEL SYSTEM - wandering from one mistake to another
// 
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 
//
//  LOGGING APPROACH
// This file uses extensive console.log statements for debugging and state tracking.
// Logs distinguish different world states and path discovery events.
// All logs are kept intentionally verbose to track world transitions, path discoveries, and travel state.

const TravelSystem = {
    // world map config - the universe is vast, uncaring, and probably laughing at us
    worldMap: {
        width: 4000,
        height: 3000,
        tileSize: 20,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        minZoom: 0.3,
        maxZoom: 4
    },

    // player position - lost in space, lost in time, lost in general
    playerPosition: {
        x: 1000,
        y: 750,
        currentLocation: null,
        isTraveling: false,
        destination: null,
        travelProgress: 0,
        travelStartTime: null,
        travelDuration: null,
        path: [],
        currentPathIndex: 0
    },

    // map layers - reality has layers, just like my unresolved issues
    layers: {
        terrain: null,
        locations: null,
        paths: null,
        resources: null,
        player: null
    },

    // resource nodes - shiny distractions from the existential dread
    resourceNodes: [],

    // points of interest - allegedly interesting, probably disappointing
    pointsOfInterest: [],

    //  DISCOVERED PATHS - roads you've walked, secrets you've learned
    // Paths are stored as "fromId->toId" keys (sorted alphabetically for consistency)
    // Only discovered paths show travel time, distance, and path type info in tooltips
    discoveredPaths: new Set(),
    DISCOVERED_PATHS_KEY: 'trader-claude-discovered-paths',

    //  DOOM WORLD DISCOVERY - separate tracking for the apocalyptic reality 
    // When you portal to doom world, you start fresh - all paths unexplored except entry point
    doomDiscoveredPaths: new Set(),
    DOOM_DISCOVERED_PATHS_KEY: 'trader-claude-doom-discovered-paths',

    //  CURRENT WORLD - which reality you're trapped in
    // 'normal' = regular game world, 'doom' = apocalyptic alternate reality
    currentWorld: 'normal',
    CURRENT_WORLD_KEY: 'trader-claude-current-world',

    // travel history - everywhere we've been, nowhere we belong
    travelHistory: [],

    //  ENCOUNTER LIMITS - max 2 per game day, only during travel
    _encountersToday: 0,
    _lastEncounterDay: -1,
    MAX_ENCOUNTERS_PER_DAY: 2,

    // favorite routes - the paths i take when running from feelings
    favoriteRoutes: [],

    // map interaction - watch them click and drag like it matters
    mapInteraction: {
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        hoveredLocation: null,
        selectedLocation: null,
        tooltip: { visible: false, x: 0, y: 0, content: '' }
    },

    // boot up this nightmare
    init() {
        this.setupCanvas();
        this.generateWorldMap();
        this.setupEventListeners();
        this.updatePlayerPosition();
        // Load discovered paths from localStorage (both worlds)
        this.loadDiscoveredPaths();
        this.loadDoomDiscoveredPaths();
        this.loadCurrentWorld();
        // center the map before we know where tf we are (relatable)
        this.centerMapOnWorld();
        this.render();
        console.log('🗺️ TravelSystem risen from the void with', Object.keys(this.locations).length, 'places to haunt');
        console.log('🛤️ Discovered paths loaded:', this.discoveredPaths.size);
        console.log('🌑 Doom paths loaded:', this.doomDiscoveredPaths.size);
        console.log('🌍 Current world:', this.currentWorld);
    },

    //  PATH DISCOVERY SYSTEM - only show path info after you've walked the road 
    // 

    // Generate consistent path key (alphabetically sorted for bidirectional paths)
    getPathKey(fromId, toId) {
        return [fromId, toId].sort().join('->');
    },

    // Check if a path has been discovered (uses current world's discovery set)
    isPathDiscovered(fromId, toId) {
        const pathSet = this.currentWorld === 'doom' ? this.doomDiscoveredPaths : this.discoveredPaths;
        return pathSet.has(this.getPathKey(fromId, toId));
    },

    // Mark a path as discovered and save (uses current world's discovery set)
    discoverPath(fromId, toId) {
        const key = this.getPathKey(fromId, toId);
        const pathSet = this.currentWorld === 'doom' ? this.doomDiscoveredPaths : this.discoveredPaths;
        const worldEmoji = this.currentWorld === 'doom' ? '🌑' : '🛤️';

        if (!pathSet.has(key)) {
            pathSet.add(key);
            // Save to appropriate storage
            if (this.currentWorld === 'doom') {
                this.saveDoomDiscoveredPaths();
            } else {
                this.saveDiscoveredPaths();
            }
            const fromLoc = this.locations[fromId];
            const toLoc = this.locations[toId];
            console.log(`${worldEmoji} New path discovered: ${fromLoc?.name || fromId} <-> ${toLoc?.name || toId}`);
            return true; // New discovery
        }
        return false; // Already known
    },

    // Discover all paths in a route
    discoverRouteWalked(route) {
        if (!route || route.length < 2) return [];
        const newlyDiscovered = [];
        for (let i = 0; i < route.length - 1; i++) {
            if (this.discoverPath(route[i], route[i + 1])) {
                newlyDiscovered.push({ from: route[i], to: route[i + 1] });
            }
        }
        return newlyDiscovered;
    },

    // Save discovered paths to localStorage (normal world)
    saveDiscoveredPaths() {
        try {
            const pathsArray = Array.from(this.discoveredPaths);
            localStorage.setItem(this.DISCOVERED_PATHS_KEY, JSON.stringify(pathsArray));
        } catch (e) {
            console.warn('🛤️ Failed to save discovered paths:', e);
        }
    },

    // Load discovered paths from localStorage (normal world)
    loadDiscoveredPaths() {
        try {
            const saved = localStorage.getItem(this.DISCOVERED_PATHS_KEY);
            if (saved) {
                const pathsArray = JSON.parse(saved);
                this.discoveredPaths = new Set(pathsArray);
            }
        } catch (e) {
            console.warn('🛤️ Failed to load discovered paths:', e);
            this.discoveredPaths = new Set();
        }
    },

    //  DOOM WORLD DISCOVERY FUNCTIONS 
    // 

    // Save doom discovered paths to localStorage
    saveDoomDiscoveredPaths() {
        try {
            const pathsArray = Array.from(this.doomDiscoveredPaths);
            localStorage.setItem(this.DOOM_DISCOVERED_PATHS_KEY, JSON.stringify(pathsArray));
        } catch (e) {
            console.warn('🌑 Failed to save doom discovered paths:', e);
        }
    },

    // Load doom discovered paths from localStorage
    loadDoomDiscoveredPaths() {
        try {
            const saved = localStorage.getItem(this.DOOM_DISCOVERED_PATHS_KEY);
            if (saved) {
                const pathsArray = JSON.parse(saved);
                this.doomDiscoveredPaths = new Set(pathsArray);
            }
        } catch (e) {
            console.warn('🌑 Failed to load doom discovered paths:', e);
            this.doomDiscoveredPaths = new Set();
        }
    },

    // Save current world to localStorage
    saveCurrentWorld() {
        try {
            localStorage.setItem(this.CURRENT_WORLD_KEY, this.currentWorld);
        } catch (e) {
            console.warn('🌍 Failed to save current world:', e);
        }
    },

    // Load current world from localStorage
    loadCurrentWorld() {
        try {
            const saved = localStorage.getItem(this.CURRENT_WORLD_KEY);
            if (saved && (saved === 'normal' || saved === 'doom')) {
                this.currentWorld = saved;
            }
        } catch (e) {
            console.warn('🌍 Failed to load current world:', e);
            this.currentWorld = 'normal';
        }
    },

    //  Portal to Doom World - called when player uses portal after defeating boss
    // entryLocationId is the dungeon they defeated the boss in (shadow_dungeon or forest_dungeon)
    portalToDoomWorld(entryLocationId) {
        console.log('🌑 Portaling to Doom World from', entryLocationId);

        // Get the FULL location object from GameWorld
        const entryLocation = GameWorld?.locations?.[entryLocationId];
        if (!entryLocation) {
            console.error('💀 DOOM ERROR: Location', entryLocationId, 'not found in GameWorld!');
            return false;
        }

        // Reset doom world visited locations - start fresh with ONLY entry dungeon explored!
        if (typeof GameWorld !== 'undefined' && GameWorld.resetDoomVisitedLocations) {
            GameWorld.resetDoomVisitedLocations(entryLocationId);
            console.log('💀 GameWorld.doomVisitedLocations reset to:', GameWorld.doomVisitedLocations);
        }

        // Clear doom discovered paths - start fresh, only entry point and its connections known
        this.doomDiscoveredPaths = new Set();
        this.doomDiscoveredPaths.add(entryLocationId);

        // Also discover paths TO adjacent locations (so player can see where to go)
        if (entryLocation?.connections) {
            entryLocation.connections.forEach(connId => {
                this.doomDiscoveredPaths.add(`${entryLocationId}->${connId}`);
                this.doomDiscoveredPaths.add(`${connId}->${entryLocationId}`);
            });
            console.log('💀 Discovered paths from entry:', Array.from(this.doomDiscoveredPaths));
        }

        // Switch to doom world
        this.currentWorld = 'doom';
        this.saveCurrentWorld();
        this.playerPosition.currentLocation = entryLocationId;

        // PROPERLY SET game.currentLocation to FULL location object with doom name
        if (typeof game !== 'undefined') {
            const doomLocName = (typeof DoomWorldNPCs !== 'undefined' && DoomWorldNPCs.locationNames)
                ? DoomWorldNPCs.locationNames[entryLocationId]
                : `Ruined ${entryLocation.name}`;
            const doomLocation = {
                ...entryLocation,
                name: doomLocName,
                originalName: entryLocation.name
            };
            // use WorldStateManager if available
            if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
                WorldStateManager.setCurrentLocation(doomLocation, 'doom_entry');
            } else {
                game.currentLocation = doomLocation;
            }
            game.inDoomWorld = true;
            console.log('💀 game.currentLocation set to:', doomLocation.name, doomLocation.id);
        }

        // Activate DoomWorldConfig (economy changes)
        if (typeof DoomWorldConfig !== 'undefined' && DoomWorldConfig.activate) {
            DoomWorldConfig.activate();
            console.log('💀 DoomWorldConfig activated - economy inverted');
        }

        // Set apocalypse weather
        if (typeof WeatherSystem !== 'undefined') {
            WeatherSystem.changeWeather('apocalypse');
            console.log('💀 Apocalypse weather activated');
        }

        // Activate doom backdrop for map
        if (typeof GameWorldRenderer !== 'undefined') {
            if (GameWorldRenderer.enterDungeonMode) {
                GameWorldRenderer.enterDungeonMode();
            }
            // CRITICAL: Re-render the map to show doom world state!
            if (GameWorldRenderer.render) {
                GameWorldRenderer.render();
            }
            if (GameWorldRenderer.updatePlayerMarker) {
                GameWorldRenderer.updatePlayerMarker();
            }
            // CENTER MAP ON PLAYER LOCATION
            if (GameWorldRenderer.centerOnLocation) {
                GameWorldRenderer.centerOnLocation(entryLocationId);
            } else if (GameWorldRenderer.centerOnPlayer) {
                GameWorldRenderer.centerOnPlayer();
            }
            console.log('💀 Doom backdrop + map re-rendered + centered on player');
        }

        // Emit event for other systems to react
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('world:changed', { world: 'doom', entryLocation: entryLocationId });
            EventBus.emit('doom:entered', { entryLocation: entryLocationId, doomLocation: game?.currentLocation?.name });
        }

        addMessage('🌑 You step through the portal into the Doom World...');
        addMessage('☠️ The air is thick with despair. Everything familiar is twisted and corrupted.');
        addMessage('🗺️ You must explore this dark reality anew - only this portal location is known to you.');
        addMessage('⚠️ Gold is worthless here. Trade survival items to survive.');

        console.log('🌑 Now in Doom World. Doom paths discovered:', this.doomDiscoveredPaths.size);

        // Refresh panels to show doom state
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.refresh) {
            PeoplePanel.refresh();
        }
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
            TravelPanelMap.render();
        }
        this.render();

        // Play doom arrival narration
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.playDoomArrivalVoice) {
            setTimeout(() => DoomWorldSystem.playDoomArrivalVoice(), 1500);
        }

        return true;
    },

    //  Portal back to Normal World - called when player uses boatman portal in doom
    portalToNormalWorld(exitLocationId) {
        console.log('🌍 Portaling back to Normal World from', exitLocationId);

        // Switch to normal world
        this.currentWorld = 'normal';
        this.saveCurrentWorld();

        // Player returns to the same location in normal world
        this.playerPosition.currentLocation = exitLocationId;

        //  Get the FULL normal world location object
        const normalLocation = GameWorld?.locations?.[exitLocationId];
        const normalName = normalLocation?.name || exitLocationId;

        //  MARK EXIT LOCATION AS VISITED in normal world so it shows on map!
        if (typeof GameWorld !== 'undefined') {
            if (!GameWorld.visitedLocations.includes(exitLocationId)) {
                GameWorld.visitedLocations.push(exitLocationId);
                console.log('🌅 Added exit location to normal world visited:', exitLocationId);
            }
            //  Also discover paths to connected locations
            if (normalLocation?.connections) {
                normalLocation.connections.forEach(connId => {
                    this.discoverPath(exitLocationId, connId);
                });
            }
        }

        //  PROPERLY SET game.currentLocation to FULL normal world location object
        if (typeof game !== 'undefined') {
            if (normalLocation) {
                // use WorldStateManager if available
                if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
                    WorldStateManager.setCurrentLocation({ ...normalLocation }, 'doom_exit');
                } else {
                    game.currentLocation = { ...normalLocation };
                }
            }
            game.inDoomWorld = false;
            //  Also sync game.visitedLocations if it exists
            if (game.visitedLocations && !game.visitedLocations.includes(exitLocationId)) {
                game.visitedLocations.push(exitLocationId);
            }
            console.log('🌅 game.currentLocation set to:', game.currentLocation?.name, game.currentLocation?.id);
        }

        //  Remove doom effects
        document.body.classList.remove('doom-world');

        //  Restore normal weather
        if (typeof WeatherSystem !== 'undefined') {
            WeatherSystem.changeWeather('clear');
        }

        //  Restore normal world backdrop/background based on current season
        if (typeof GameWorldRenderer !== 'undefined') {
            //  Force exit dungeon mode flag
            GameWorldRenderer.isInDungeonMode = false;

            //  Get current season and load that backdrop
            let currentSeason = 'summer';
            if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
                currentSeason = TimeSystem.getSeason().toLowerCase();
            }

            //  FORCE clear currentSeason so loadSeasonalBackdrop doesn't skip reload
            GameWorldRenderer.currentSeason = null;

            //  Load seasonal backdrop directly
            if (GameWorldRenderer.loadSeasonalBackdrop) {
                GameWorldRenderer.loadSeasonalBackdrop(currentSeason);
                console.log(`🌅 Normal world ${currentSeason} backdrop restored`);
            }
        }

        // Emit event for other systems to react
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('world:changed', { world: 'normal', exitLocation: exitLocationId });
            EventBus.emit('doom:exited', { exitLocation: exitLocationId });
        }

        addMessage('🌍 You step through the portal back to the normal world...');
        addMessage(`📍 You are now at ${normalName}. The nightmare fades.`);

        console.log('🌍 Back in Normal World. Normal paths discovered:', this.discoveredPaths.size);

        //  Refresh ALL panels to show normal world data
        if (typeof TravelPanelMap !== 'undefined') {
            TravelPanelMap.render();
        }
        if (typeof GameWorldRenderer !== 'undefined') {
            GameWorldRenderer.render?.();
            GameWorldRenderer.updatePlayerMarker?.();
            //  CENTER MAP ON PLAYER LOCATION
            if (GameWorldRenderer.centerOnLocation) {
                GameWorldRenderer.centerOnLocation(exitLocationId);
            } else if (GameWorldRenderer.centerOnPlayer) {
                GameWorldRenderer.centerOnPlayer();
            }
        }
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateQuestLogUI?.();
            QuestSystem.updateQuestTracker?.();
        }
        this.render();

        return true;
    },

    // Check if player is in doom world
    isInDoomWorld() {
        return this.currentWorld === 'doom';
    },

    // Get path info - returns full info if discovered, limited info if not
    getPathInfo(fromId, toId) {
        const discovered = this.isPathDiscovered(fromId, toId);
        const pathData = this.getPathBetween(fromId, toId);

        if (!pathData) {
            return {
                discovered: false,
                type: 'unknown',
                typeDisplay: '???',
                distance: '???',
                safety: '???',
                travelTime: '???'
            };
        }

        if (!discovered) {
            return {
                discovered: false,
                type: 'unknown',
                typeDisplay: 'Unexplored Path',
                distance: '???',
                safety: '???',
                travelTime: '??? (explore to learn)',
                exists: true
            };
        }

        // Full info for discovered paths
        const pathTypeInfo = this.PATH_TYPES[pathData.type] || this.PATH_TYPES.trail;
        return {
            discovered: true,
            type: pathData.type,
            typeDisplay: pathTypeInfo.name,
            distance: `${Math.round(pathData.distance || 5)} miles`,
            safety: `${Math.round((pathData.safety || 0.7) * 100)}%`,
            travelTime: this.estimatePathTravelTime(pathData),
            quality: pathData.quality || 'fair'
        };
    },

    // Estimate travel time for a single path segment
    estimatePathTravelTime(pathData) {
        const transport = game.player?.transportation || 'backpack';
        const transportData = typeof transportationOptions !== 'undefined' ? transportationOptions[transport] : null;
        const baseSpeed = transportData?.speed || this.getTransportSpeed(transport);
        const pathTypeInfo = this.PATH_TYPES[pathData.type] || this.PATH_TYPES.trail;
        const effectiveSpeed = baseSpeed * pathTypeInfo.speedMultiplier;
        const timeHours = (pathData.distance || 5) / effectiveSpeed;
        return this.formatTime(timeHours);
    },

    // tick tock, another moment closer to oblivion
    update() {
        // only run if we're actually going somewhere (rare)
        if (!this.playerPosition.isTraveling) return;

        // drag our sorry ass a little further
        this.updateTravelProgress();

        // wake up the renderer if it's still breathing
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.currentTravel) {
            // let the renderer do its thing while we contemplate the journey
            // (sync the animation so we're all suffering together)
            GameWorldRenderer.runTravelAnimation();
        }
    },

    // center the damn map on something that matters (spoiler: nothing does)
    centerMapOnWorld() {
        if (!this.canvas || Object.keys(this.locations).length === 0) return;

        // calculate the boundaries of this miserable world
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        Object.values(this.locations).forEach(loc => {
            minX = Math.min(minX, loc.x);
            minY = Math.min(minY, loc.y);
            maxX = Math.max(maxX, loc.x);
            maxY = Math.max(maxY, loc.y);
        });

        // give it some breathing room (we all need space)
        const padding = 500;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // math out the zoom to contain all this sadness
        const worldWidth = maxX - minX;
        const worldHeight = maxY - minY;
        const zoomX = this.canvas.width / worldWidth;
        const zoomY = this.canvas.height / worldHeight;
        this.worldMap.zoom = Math.min(zoomX, zoomY, 1); // don't zoom too close, it hurts

        // shift reality to center this whole mess
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.worldMap.offsetX = this.canvas.width / 2 - centerX * this.worldMap.zoom;
        this.worldMap.offsetY = this.canvas.height / 2 - centerY * this.worldMap.zoom;

        console.log(`🎯 Map centered on the void: zoom=${this.worldMap.zoom.toFixed(3)}, reality shifted by (${this.worldMap.offsetX.toFixed(0)}, ${this.worldMap.offsetY.toFixed(0)})`);
    },

    // conjure a canvas from the digital abyss
    // NOTE: Canvas setup is DISABLED - we now use HTML-based rendering via
    // GameWorldRenderer and TravelPanelMap. This function is kept as a no-op.
    setupCanvas() {
        // Canvas-based map rendering is disabled.
        // Map display is now handled by:
        // - GameWorldRenderer (main map - HTML divs)
        // - TravelPanelMap (travel panel map - HTML divs)
        console.log('🗺️ TravelSystem.setupCanvas: Canvas rendering disabled - using HTML-based GameWorldRenderer and TravelPanelMap instead');
        return;
    },

    // birth a world from the void (playing god at 3am hits different)
    generateWorldMap() {
        // borrow from GameWorld if it's there, otherwise we improvise like usual
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
            this.syncWithGameWorld();
            this.generateResourceNodes();
            this.generatePointsOfInterest();
            this.generatePaths();
            return;
        }

        // fallback: hardcoded locations because sometimes you gotta do it yourself
        this.locations = {
            // Major cities
            kings_landing: {
                id: 'kings_landing',
                name: "King's Landing",
                type: 'city',
                x: 2000,
                y: 1500,
                size: 'large',
                population: 500000,
                produces: ['luxury_goods', 'weapons', 'armor'],
                demands: ['food', 'grain', 'wood', 'stone'],
                description: 'The capital city, center of commerce and politics',
                lodging: {
                    available: true,
                    quality: 'luxury',
                    cost: 50,
                    restBonus: 20
                },
                trading: {
                    marketSize: 'large',
                    priceVariation: 0.1,
                    specialItems: ['luxury_goods', 'rare_gems']
                },
                security: 'high',
                services: ['bank', 'guild', 'temple', 'arena']
            },
            
            winterfell: {
                id: 'winterfell',
                name: 'Winterfell',
                type: 'city',
                x: 1900,
                y: 800,
                size: 'medium',
                population: 150000,
                produces: ['furs', 'weapons', 'ale'],
                demands: ['grain', 'tools', 'cloth'],
                description: 'Northern stronghold, known for its resilience',
                lodging: {
                    available: true,
                    quality: 'good',
                    cost: 25,
                    restBonus: 15
                },
                trading: {
                    marketSize: 'medium',
                    priceVariation: 0.15,
                    specialItems: ['furs', 'winter_clothing']
                },
                security: 'medium',
                services: ['forge', 'tavern', 'stables']
            },

            // Towns
            riverport: {
                id: 'riverport',
                name: 'Riverport',
                type: 'town',
                x: 1200,
                y: 800,
                size: 'medium',
                population: 45000,
                produces: ['fish', 'boats', 'trade_goods'],
                demands: ['tools', 'cloth', 'luxury_goods'],
                description: 'Busy river port with constant trade traffic',
                lodging: {
                    available: true,
                    quality: 'standard',
                    cost: 15,
                    restBonus: 10
                },
                trading: {
                    marketSize: 'medium',
                    priceVariation: 0.2,
                    specialItems: ['exotic_fish', 'river_pearls']
                },
                security: 'medium',
                services: ['dock', 'warehouse', 'tavern']
            },

            // Villages
            oakhaven: {
                id: 'oakhaven',
                name: 'Oakhaven',
                type: 'village',
                x: 850,
                y: 700,
                size: 'small',
                population: 8000,
                produces: ['wood', 'planks', 'food'],
                demands: ['tools', 'cloth', 'ale'],
                description: 'Peaceful village surrounded by dense forests',
                lodging: {
                    available: true,
                    quality: 'basic',
                    cost: 8,
                    restBonus: 5
                },
                trading: {
                    marketSize: 'small',
                    priceVariation: 0.25,
                    specialItems: ['herbs', 'honey']
                },
                security: 'low',
                services: ['inn', 'general_store']
            },

            western_watch: {
                id: 'western_watch',
                name: 'Stonebridge',
                type: 'village',
                x: 1100,
                y: 600,
                size: 'small',
                population: 6000,
                produces: ['stone', 'coal', 'iron_ore'],
                demands: ['food', 'tools', 'wood'],
                description: 'Mining village at the foot of the mountains',
                lodging: {
                    available: true,
                    quality: 'basic',
                    cost: 10,
                    restBonus: 5
                },
                trading: {
                    marketSize: 'small',
                    priceVariation: 0.3,
                    specialItems: ['rare_minerals', 'gems']
                },
                security: 'low',
                services: ['inn', 'blacksmith']
            },
            
            // Additional cities
            silverport: {
                id: 'silverport',
                name: 'Silverport',
                type: 'city',
                x: 3000,
                y: 1200,
                size: 'large',
                population: 350000,
                produces: ['silver_ore', 'gems', 'luxury_goods'],
                demands: ['food', 'tools', 'cloth'],
                description: 'Coastal city famous for its silver mines and gem trade',
                lodging: {
                    available: true,
                    quality: 'good',
                    cost: 35,
                    restBonus: 15
                },
                trading: {
                    marketSize: 'large',
                    priceVariation: 0.12,
                    specialItems: ['silver_ore', 'gems', 'jewelry']
                },
                security: 'medium',
                services: ['bank', 'guild', 'temple', 'docks']
            },
            
            goldshire: {
                id: 'goldshire',
                name: 'Goldshire',
                type: 'city',
                x: 2500,
                y: 2200,
                size: 'medium',
                population: 180000,
                produces: ['gold_ore', 'minerals', 'tools'],
                demands: ['food', 'wood', 'cloth'],
                description: 'Mining city in the golden hills',
                lodging: {
                    available: true,
                    quality: 'standard',
                    cost: 20,
                    restBonus: 10
                },
                trading: {
                    marketSize: 'medium',
                    priceVariation: 0.18,
                    specialItems: ['gold_ore', 'rare_minerals']
                },
                security: 'low',
                services: ['bank', 'forge', 'inn']
            },
            
            // Additional towns
            crossroads: {
                id: 'crossroads',
                name: 'Crossroads',
                type: 'town',
                x: 1500,
                y: 1800,
                size: 'medium',
                population: 25000,
                produces: ['trade_goods', 'tools', 'food'],
                demands: ['luxury_goods', 'weapons', 'cloth'],
                description: 'Busy crossroads town at the center of major trade routes',
                lodging: {
                    available: true,
                    quality: 'standard',
                    cost: 15,
                    restBonus: 10
                },
                trading: {
                    marketSize: 'medium',
                    priceVariation: 0.15,
                    specialItems: ['trade_goods', 'exotic_items']
                },
                security: 'medium',
                services: ['inn', 'stables', 'warehouse']
            },
            
            riversend: {
                id: 'riversend',
                name: 'Riversend',
                type: 'town',
                x: 2800,
                y: 1600,
                size: 'medium',
                population: 30000,
                produces: ['fish', 'boats', 'salt'],
                demands: ['tools', 'wood', 'grain'],
                description: 'Port town on the southern coast with abundant fishing',
                lodging: {
                    available: true,
                    quality: 'good',
                    cost: 18,
                    restBonus: 12
                },
                trading: {
                    marketSize: 'medium',
                    priceVariation: 0.2,
                    specialItems: ['exotic_fish', 'sea_salt']
                },
                security: 'medium',
                services: ['docks', 'warehouse', 'tavern']
            },
            
            // Additional villages
            greenhaven: {
                id: 'greenhaven',
                name: 'Greenhaven',
                type: 'village',
                x: 1200,
                y: 2200,
                size: 'small',
                population: 5000,
                produces: ['herbs', 'medicinal_plants', 'food'],
                demands: ['tools', 'cloth', 'ale'],
                description: 'Peaceful village known for its healing herbs',
                lodging: {
                    available: true,
                    quality: 'basic',
                    cost: 8,
                    restBonus: 5
                },
                trading: {
                    marketSize: 'small',
                    priceVariation: 0.25,
                    specialItems: ['herbs', 'medicinal_plants']
                },
                security: 'low',
                services: ['inn', 'herbalist']
            },
            
            mountainpass: {
                id: 'mountainpass',
                name: 'Mountain Pass',
                type: 'village',
                x: 2200,
                y: 1000,
                size: 'small',
                population: 3000,
                produces: ['stone', 'coal', 'iron_ore'],
                demands: ['food', 'tools', 'wood'],
                description: 'High mountain village with rich mineral deposits',
                lodging: {
                    available: true,
                    quality: 'basic',
                    cost: 10,
                    restBonus: 5
                },
                trading: {
                    marketSize: 'small',
                    priceVariation: 0.3,
                    specialItems: ['rare_minerals', 'iron_ore']
                },
                security: 'low',
                services: ['inn', 'blacksmith']
            }
        };

        // scatter some resources around (gotta give them something to do)
        this.generateResourceNodes();

        // add some "interesting" places (allegedly)
        this.generatePointsOfInterest();

        // connect the dots between despair and disappointment
        this.generatePaths();
    },

    // steal location data from GameWorld (why reinvent the misery)
    syncWithGameWorld() {
        this.locations = {};

        // blow up the coordinates so we have room to breathe
        const scaleX = 10; // 0-800 becomes 0-8000 (because bigger is... something)
        const scaleY = 10;

        // translate their types into our types (it's all arbitrary anyway)
        const typeSizeMap = {
            'village': 'small',
            'town': 'medium',
            'city': 'large'
        };

        // transform their locations into ours (same pain, different format)
        Object.entries(GameWorld.locations).forEach(([id, loc]) => {
            const mapPos = loc.mapPosition || { x: 400, y: 300 };

            this.locations[id] = {
                id: id,
                name: loc.name,
                type: loc.type || 'village',
                x: mapPos.x * scaleX,
                y: mapPos.y * scaleY,
                size: typeSizeMap[loc.type] || 'small',
                population: loc.population || 100,
                produces: loc.specialties || [],
                demands: [],
                description: loc.description || 'A location in the world.',
                lodging: {
                    available: true,
                    quality: loc.type === 'city' ? 'good' : 'basic',
                    cost: loc.type === 'city' ? 25 : (loc.type === 'town' ? 15 : 8),
                    restBonus: loc.type === 'city' ? 15 : (loc.type === 'town' ? 10 : 5)
                },
                trading: {
                    marketSize: loc.marketSize || 'small',
                    priceVariation: 0.2,
                    specialItems: loc.specialties || []
                },
                security: loc.type === 'city' ? 'high' : (loc.type === 'town' ? 'medium' : 'low'),
                services: loc.type === 'city' ? ['bank', 'guild', 'temple'] : (loc.type === 'town' ? ['inn', 'tavern'] : ['inn']),
                connections: loc.connections || [],
                region: loc.region || 'starter'
            };
        });

        // expand the map to fit all this existential real estate
        this.worldMap.width = 8000;
        this.worldMap.height = 6000;

        // zoom out so we can see the full scope of our loneliness
        this.worldMap.zoom = 0.15;

        console.log(`🔮 Absorbed ${Object.keys(this.locations).length} locations from GameWorld into my dark consciousness`);
    },

    // scatter resources across the wasteland
    generateResourceNodes() {
        // scale depends on whether we stole from GameWorld or not
        const scale = (typeof GameWorld !== 'undefined' && GameWorld.locations) ? 10 : 1;

        this.resourceNodes = [
            // Forests
            {
                id: 'whispering_woods',
                type: 'forest',
                name: 'Whispering Woods',
                x: 200 * scale,
                y: 400 * scale,
                radius: 80,
                resources: ['wood', 'herbs', 'rare_wood'],
                abundance: {
                    wood: 0.8,
                    herbs: 0.4,
                    rare_wood: 0.1
                },
                danger: 0.2,
                description: 'Ancient forest filled with valuable resources',
                skillRequirements: {
                    wood: 0,
                    herbs: 1,
                    rare_wood: 3
                }
            },
            {
                id: 'dark_forest',
                type: 'forest',
                name: 'Dark Forest',
                x: 450 * scale,
                y: 200 * scale,
                radius: 100,
                resources: ['wood', 'rare_wood', 'mushrooms'],
                abundance: {
                    wood: 0.6,
                    rare_wood: 0.3,
                    mushrooms: 0.5
                },
                danger: 0.5,
                description: 'Dense forest with rare materials but higher risks',
                skillRequirements: {
                    wood: 1,
                    rare_wood: 2,
                    mushrooms: 2
                }
            },

            // Mines
            {
                id: 'iron_mine',
                type: 'mine',
                name: 'Iron Mine',
                x: 320 * scale,
                y: 150 * scale,
                radius: 60,
                resources: ['iron_ore', 'coal', 'stone'],
                abundance: {
                    iron_ore: 0.7,
                    coal: 0.5,
                    stone: 0.9
                },
                danger: 0.3,
                description: 'Productive mine with essential metals',
                skillRequirements: {
                    iron_ore: 1,
                    coal: 1,
                    stone: 0
                }
            },
            {
                id: 'gold_vein',
                type: 'mine',
                name: 'Gold Vein',
                x: 600 * scale,
                y: 500 * scale,
                radius: 40,
                resources: ['gold_ore', 'silver_ore', 'gems'],
                abundance: {
                    gold_ore: 0.4,
                    silver_ore: 0.3,
                    gems: 0.1
                },
                danger: 0.6,
                description: 'Rich vein with precious metals and gems',
                skillRequirements: {
                    gold_ore: 3,
                    silver_ore: 2,
                    gems: 4
                }
            },

            // Other resources
            {
                id: 'herb_garden',
                type: 'herb',
                name: 'Herb Garden',
                x: 400 * scale,
                y: 450 * scale,
                radius: 50,
                resources: ['herbs', 'medicinal_plants', 'rare_herbs'],
                abundance: {
                    herbs: 0.8,
                    medicinal_plants: 0.6,
                    rare_herbs: 0.2
                },
                danger: 0.1,
                description: 'Peaceful area with abundant medicinal plants',
                skillRequirements: {
                    herbs: 0,
                    medicinal_plants: 1,
                    rare_herbs: 2
                }
            }
        ];
    },

    // drop some allegedly interesting spots on the map
    generatePointsOfInterest() {
        // same scaling drama as before
        const scale = (typeof GameWorld !== 'undefined' && GameWorld.locations) ? 10 : 1;

        this.pointsOfInterest = [
            // Inns and taverns
            {
                id: 'restful_inn',
                type: 'inn',
                name: 'The Restful Inn',
                x: 300 * scale,
                y: 320 * scale,
                icon: '🏠',
                description: 'Cozy inn known for excellent food and comfortable beds',
                services: ['lodging', 'food', 'ale', 'stables'],
                quality: 'good',
                cost: {
                    lodging: 12,
                    food: 5,
                    ale: 3
                },
                restBonus: 15,
                reputation: 0.1
            },
            {
                id: 'travelers_tavern',
                type: 'tavern',
                name: "Traveler's Tavern",
                x: 420 * scale,
                y: 380 * scale,
                icon: '🍺',
                description: 'Busy tavern frequented by merchants and adventurers',
                services: ['ale', 'food', 'information', 'rumors'],
                quality: 'standard',
                cost: {
                    food: 4,
                    ale: 2
                },
                restBonus: 5,
                reputation: 0.05
            },

            // Trading posts
            {
                id: 'crossroads_trading',
                type: 'trading_post',
                name: 'Crossroads Trading Post',
                x: 450 * scale,
                y: 350 * scale,
                icon: '🏪',
                description: 'Strategic trading post at major crossroads',
                services: ['trade', 'storage', 'information'],
                fees: {
                    trade: 0.05,
                    storage: 2
                },
                reputation: 0.15
            },

            // Guard posts
            {
                id: 'north_gate',
                type: 'guard_post',
                name: 'North Gate Guard Post',
                x: 280 * scale,
                y: 180 * scale,
                icon: '🛡️',
                description: 'Military outpost providing security for northern routes',
                services: ['protection', 'information', 'bounties'],
                safetyBonus: 0.3,
                reputation: 0.1
            },

            // Infrastructure
            {
                id: 'stone_bridge',
                type: 'bridge',
                name: 'Great Stone Bridge',
                x: 350 * scale,
                y: 400 * scale,
                icon: '🌉',
                description: 'Massive stone bridge spanning the great river',
                services: ['crossing', 'toll_collection'],
                toll: 5,
                timeBonus: 0.2
            },
            {
                id: 'river_ferry',
                type: 'ferry',
                name: 'River Ferry',
                x: 380 * scale,
                y: 420 * scale,
                icon: '⛵',
                description: 'Ferry service for crossing the river',
                services: ['crossing'],
                cost: 3,
                timeBonus: -0.1
            },

            // Hidden locations
            {
                id: 'ancient_ruins',
                type: 'ruins',
                name: 'Ancient Ruins',
                x: 150 * scale,
                y: 500 * scale,
                icon: '🏛️',
                description: 'Mysterious ruins holding ancient treasures',
                hidden: true,
                discoveryChance: 0.1,
                resources: ['ancient_artifacts', 'rare_gems', 'lost_knowledge'],
                danger: 0.7,
                reputation: 0.3
            },
            {
                id: 'hidden_cave',
                type: 'cave',
                name: 'Hidden Cave',
                x: 550 * scale,
                y: 250 * scale,
                icon: '🕳️',
                description: 'Secluded cave with rare minerals',
                hidden: true,
                discoveryChance: 0.15,
                resources: ['rare_minerals', 'crystals', 'underground_herbs'],
                danger: 0.5,
                reputation: 0.2
            }
        ];
    },

    //  FIX: Path types with improved speed multipliers for reasonable travel times
    // Base walking speed is 3 mph, these multipliers adjust effective speed
    // Starting area paths should be ~30min-2hrs, max any path is 6hrs
    PATH_TYPES: {
        city_street: {
            name: 'City Street',
            speedMultiplier: 2.0,    // fast because civilization pretends to care
            staminaDrain: 0.3,       // barely draining, like small talk
            safety: 0.9,
            description: 'well-paved city streets where dreams go to die'
        },
        main_road: {
            name: 'Main Road',
            speedMultiplier: 1.8,    // decent roads for those who still have hope
            staminaDrain: 0.5,
            safety: 0.7,
            description: 'major trade roads connecting pockets of despair'
        },
        road: {
            name: 'Road',
            speedMultiplier: 1.5,    // standard maintained roads
            staminaDrain: 0.7,
            safety: 0.6,
            description: 'maintained road between settlements (barely)'
        },
        path: {
            name: 'Path',
            speedMultiplier: 1.2,    // slower because nature fights back
            staminaDrain: 0.9,
            safety: 0.5,
            description: 'worn path through nowhere special'
        },
        trail: {
            name: 'Trail',
            speedMultiplier: 1.0,    // dragging through the wilderness
            staminaDrain: 1.2,
            safety: 0.4,
            description: 'rough trail where civilization gave up'
        },
        wilderness: {
            name: 'Wilderness',
            speedMultiplier: 0.6,    // no path, just vibes and regret
            staminaDrain: 1.5,
            safety: 0.3,
            description: 'untamed wilderness where you question your choices'
        }
    },

    // figure out what kind of path connects these sad little dots
    determinePathType(fromLocation, toLocation) {
        const fromType = fromLocation?.type || 'unknown';
        const toType = toLocation?.type || 'unknown';
        const fromSize = fromLocation?.size || 'small';
        const toSize = toLocation?.size || 'small';

        // big city to big city - fancy main roads
        if ((fromType === 'city' || fromSize === 'large') &&
            (toType === 'city' || toSize === 'large')) {
            return 'main_road';
        }

        // city to town vibes - decent roads
        if ((fromType === 'city' || fromType === 'town') &&
            (toType === 'city' || toType === 'town')) {
            return 'road';
        }

        // town to village - getting sketchier
        if ((fromType === 'town' || fromType === 'village') &&
            (toType === 'town' || toType === 'village')) {
            return 'path';
        }

        // village to village or resource gathering - rough trails
        if (fromType === 'village' || toType === 'village' ||
            fromType === 'resource' || toType === 'resource') {
            return 'trail';
        }

        // everything else - raw wilderness, good luck
        return 'wilderness';
    },

    // weave paths between locations like threads of fate
    generatePaths() {
        this.paths = [];
        const processedPairs = new Set();

        // carve paths from the connections (if they even exist)
        Object.values(this.locations).forEach(location => {
            if (!location.connections) return;

            location.connections.forEach(connectionId => {
                const targetLocation = this.locations[connectionId];
                if (!targetLocation) return;

                // avoid duplicate paths (one existential crisis per pair is enough)
                const pairId = [location.id, connectionId].sort().join('_');
                if (processedPairs.has(pairId)) return;
                processedPairs.add(pairId);

                // figure out what kind of road this cursed journey needs
                const pathType = this.determinePathType(location, targetLocation);
                const pathInfo = this.PATH_TYPES[pathType] || this.PATH_TYPES.trail;

                // math out how far we need to suffer
                //  FIX: coordinates are 10x scaled, divide by 500 for reasonable mile distances
                const dx = targetLocation.x - location.x;
                const dy = targetLocation.y - location.y;
                const distance = Math.sqrt(dx * dx + dy * dy) / 500; // scaled coords to miles

                // manifest the path into reality
                const path = {
                    id: `${location.id}_to_${connectionId}`,
                    name: `${location.name} to ${targetLocation.name}`,
                    type: pathType,
                    pathInfo: pathInfo,
                    from: location.id,
                    to: connectionId,
                    distance: distance,
                    points: [
                        { x: location.x, y: location.y },
                        { x: targetLocation.x, y: targetLocation.y }
                    ],
                    quality: pathType === 'main_road' ? 'excellent' :
                             pathType === 'road' ? 'good' :
                             pathType === 'path' ? 'fair' : 'poor',
                    safety: pathInfo.safety,
                    speedMultiplier: pathInfo.speedMultiplier,
                    staminaDrain: pathInfo.staminaDrain,
                    travelBonus: pathInfo.speedMultiplier - 1
                };

                this.paths.push(path);
            });
        });

        console.log(`🛤️ Carved ${this.paths.length} paths through the wilderness... each one a potential escape route`);
    },

    // hook up the event listeners so they can interact with my creation
    setupEventListeners() {
        if (!this.canvas) return;

        // mouse events for the desktop dwellers
        EventManager.addEventListener(this.canvas, 'mousedown', (e) => this.handleMouseDown(e));
        EventManager.addEventListener(this.canvas, 'mousemove', (e) => this.handleMouseMove(e));
        EventManager.addEventListener(this.canvas, 'mouseup', (e) => this.handleMouseUp(e));
        EventManager.addEventListener(this.canvas, 'wheel', (e) => this.handleWheel(e));
        EventManager.addEventListener(this.canvas, 'click', (e) => this.handleClick(e));

        // touch events for the phone addicts
        EventManager.addEventListener(this.canvas, 'touchstart', (e) => this.handleTouchStart(e));
        EventManager.addEventListener(this.canvas, 'touchmove', (e) => this.handleTouchMove(e));
        EventManager.addEventListener(this.canvas, 'touchend', (e) => this.handleTouchEnd(e));
    },

    // they clicked, now we care
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.mapInteraction.isDragging = true;
        this.mapInteraction.dragStart = { x: x - this.worldMap.offsetX, y: y - this.worldMap.offsetY };
    },

    // they're moving the mouse, riveting
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.mapInteraction.isDragging) {
            this.worldMap.offsetX = x - this.mapInteraction.dragStart.x;
            this.worldMap.offsetY = y - this.mapInteraction.dragStart.y;
            this.render();
        } else {
            // check if they're hovering over something that matters
            const worldPos = this.screenToWorld(x, y);
            const hoveredLocation = this.getLocationAt(worldPos.x, worldPos.y);
            
            if (hoveredLocation !== this.mapInteraction.hoveredLocation) {
                this.mapInteraction.hoveredLocation = hoveredLocation;
                this.updateTooltip(hoveredLocation, x, y);
                this.render();
            }
        }
    },

    // they let go, time to stop caring
    handleMouseUp(e) {
        this.mapInteraction.isDragging = false;
    },

    // they're scrolling, adjust the zoom accordingly
    handleWheel(e) {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const worldPos = this.screenToWorld(x, y);

        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.worldMap.minZoom, Math.min(this.worldMap.maxZoom, this.worldMap.zoom * zoomDelta));

        this.worldMap.zoom = newZoom;

        // zoom toward their cursor like we actually care where they're looking
        const newWorldPos = this.screenToWorld(x, y);
        this.worldMap.offsetX += (newWorldPos.x - worldPos.x) * this.worldMap.zoom;
        this.worldMap.offsetY += (newWorldPos.y - worldPos.y) * this.worldMap.zoom;
        
        this.render();
    },

    // they clicked something, let's see what they want now
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const clickedLocation = this.getLocationAt(worldPos.x, worldPos.y);
        
        if (clickedLocation) {
            this.selectLocation(clickedLocation);
        }
    },

    // touch handlers for the mobile generation
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.mapInteraction.isDragging = true;
            this.mapInteraction.dragStart = { x: x - this.worldMap.offsetX, y: y - this.worldMap.offsetY };
        }
    },

    handleTouchMove(e) {
        if (e.touches.length === 1 && this.mapInteraction.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.worldMap.offsetX = x - this.mapInteraction.dragStart.x;
            this.worldMap.offsetY = y - this.mapInteraction.dragStart.y;
            this.render();
        }
    },

    handleTouchEnd(e) {
        this.mapInteraction.isDragging = false;
    },

    // translate screen pixels to world coordinates (because nothing is what it seems)
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.worldMap.offsetX) / this.worldMap.zoom,
            y: (screenY - this.worldMap.offsetY) / this.worldMap.zoom
        };
    },

    // convert world coordinates back to screen pixels (reality reversal)
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.worldMap.zoom + this.worldMap.offsetX,
            y: worldY * this.worldMap.zoom + this.worldMap.offsetY
        };
    },

    // find what location exists at these coordinates (if anything even matters)
    getLocationAt(x, y) {
        // check the settlements first
        for (const [id, location] of Object.entries(this.locations)) {
            const distance = Math.sqrt(Math.pow(x - location.x, 2) + Math.pow(y - location.y, 2));
            if (distance < 30) {
                return location;
            }
        }
        
        // check resource nodes (shiny distractions)
        for (const node of this.resourceNodes) {
            const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
            if (distance < node.radius) {
                return node;
            }
        }

        // check points of interest (if they're worth the name)
        for (const poi of this.pointsOfInterest) {
            const distance = Math.sqrt(Math.pow(x - poi.x, 2) + Math.pow(y - poi.y, 2));
            if (distance < 20) {
                return poi;
            }
        }
        
        return null;
    },

    // refresh the tooltip with whatever they're hovering over
    updateTooltip(location, screenX, screenY) {
        if (location) {
            const tooltipContent = this.generateTooltipContent(location);
            this.mapInteraction.tooltip = {
                visible: true,
                x: screenX,
                y: screenY,
                content: tooltipContent
            };
        } else {
            this.mapInteraction.tooltip.visible = false;
        }
    },

    // craft tooltip content that pretends to be helpful
    generateTooltipContent(location) {
        let content = `<div class="map-tooltip">`;
        content += `<h3>${location.name}</h3>`;
        content += `<p class="location-type">${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>`;

        if (location.description) {
            content += `<p class="description">${location.description}</p>`;
        }

        //  Add tracked quest info if this location is a quest target
        if (typeof QuestSystem !== 'undefined' && QuestSystem.getQuestInfoForLocation) {
            const quest = QuestSystem.getQuestInfoForLocation(location.id);
            if (quest) {
                const isDoomQuest = quest.isDoom || quest.questId?.startsWith('doom_');
                const bgColor = isDoomQuest ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 215, 0, 0.2)';
                const borderColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                const textColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                const subTextColor = isDoomQuest ? '#ffb347' : '#ffeb3b';
                content += `
                    <div style="margin: 8px 0; padding: 8px; background: ${bgColor}; border-radius: 6px; border-left: 3px solid ${borderColor};">
                        <p style="color: ${textColor}; font-weight: bold; margin: 0 0 4px 0;">🎯 ${quest.questName}</p>
                        ${quest.objective ? `<p style="color: ${subTextColor}; font-size: 11px; margin: 0;">${quest.objective}</p>` : ''}
                    </div>
                `;
            }
        }
        
        // dump location-specific details (if anyone cares)
        if (location.type === 'city' || location.type === 'town' || location.type === 'village') {
            content += `<div class="location-info">`;
            content += `<p><strong>Population:</strong> ${location.population?.toLocaleString() || 'Unknown'}</p>`;
            
            if (location.produces && location.produces.length > 0) {
                content += `<p><strong>Produces:</strong> ${location.produces.map(item => this.getItemName(item)).join(', ')}</p>`;
            }
            
            if (location.demands && location.demands.length > 0) {
                content += `<p><strong>Demand:</strong> ${location.demands.map(item => this.getItemName(item)).join(', ')}</p>`;
            }
            
            if (location.lodging && location.lodging.available) {
                content += `<p><strong>Lodging:</strong> ${location.lodging.quality} (${location.lodging.cost} gold)</p>`;
            }
            
            content += `</div>`;
        }
        
        // resource node data (for the gatherers and grinders)
        if (location.type === 'forest' || location.type === 'mine' || location.type === 'herb') {
            content += `<div class="resource-info">`;
            content += `<p><strong>Resources:</strong></p><ul>`;
            for (const [resource, abundance] of Object.entries(location.abundance)) {
                content += `<li>${this.getItemName(resource)} (${Math.round(abundance * 100)}% abundance)</li>`;
            }
            content += `</ul>`;
            content += `<p><strong>Danger Level:</strong> ${Math.round(location.danger * 100)}%</p>`;
            content += `</div>`;
        }
        
        // poi service info (if it's actually useful)
        if (location.services) {
            content += `<div class="services-info">`;
            content += `<p><strong>Services:</strong> ${location.services.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>`;
            if (location.cost) {
                content += `<p><strong>Cost:</strong> ${Object.entries(location.cost).map(([service, cost]) => `${service}: ${cost} gold`).join(', ')}</p>`;
            }
            content += `</div>`;
        }
        
        content += `</div>`;
        return content;
    },

    // translate item ids into readable names (because humans need labels)
    getItemName(itemId) {
        const itemNames = {
            food: 'Food',
            grain: 'Grain',
            wood: 'Wood',
            stone: 'Stone',
            iron_ore: 'Iron Ore',
            coal: 'Coal',
            tools: 'Tools',
            weapons: 'Weapons',
            armor: 'Armor',
            cloth: 'Cloth',
            ale: 'Ale',
            furs: 'Furs',
            fish: 'Fish',
            boats: 'Boats',
            trade_goods: 'Trade Goods',
            luxury_goods: 'Luxury Goods',
            planks: 'Planks',
            herbs: 'Herbs',
            rare_wood: 'Rare Wood',
            mushrooms: 'Mushrooms',
            gold_ore: 'Gold Ore',
            silver_ore: 'Silver Ore',
            gems: 'Gems',
            medicinal_plants: 'Medicinal Plants',
            rare_herbs: 'Rare Herbs',
            ancient_artifacts: 'Ancient Artifacts',
            rare_gems: 'Rare Gems',
            lost_knowledge: 'Lost Knowledge',
            rare_minerals: 'Rare Minerals',
            crystals: 'Crystals',
            underground_herbs: 'Underground Herbs'
        };
        return itemNames[itemId] || itemId;
    },

    // they selected a location, guess we're going somewhere
    selectLocation(location) {
        this.mapInteraction.selectedLocation = location;
        this.showLocationDetails(location);
        this.render();
    },

    // dump all the location details into the panel
    showLocationDetails(location) {
        // shove location info into the travel panel
        const detailsPanel = document.getElementById('location-details');
        if (detailsPanel) {
            let html = `<div class="location-details-content">`;
            html += `<h2>${location.name}</h2>`;
            html += `<p class="location-type">${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>`;
            html += `<p class="description">${location.description || 'No description available.'}</p>`;

            // add travel button if we're not already stuck here
            if (location.id !== this.playerPosition.currentLocation) {
                const travelInfo = this.calculateTravelInfo(location);
                html += `<div class="travel-info">`;
                html += `<p><strong>Path Type:</strong> ${travelInfo.pathTypeName || 'Unknown'}</p>`;
                html += `<p class="path-desc" style="font-size:0.85em;color:#888;margin-top:-5px;">${travelInfo.pathDescription || ''}</p>`;
                html += `<p><strong>Travel Time:</strong> ${travelInfo.timeDisplay}</p>`;
                html += `<p><strong>Distance:</strong> ${travelInfo.distance} miles</p>`;
                html += `<p><strong>Safety:</strong> ${travelInfo.safety}%</p>`;
                html += `<p><strong>Stamina Cost:</strong> ${travelInfo.staminaCost}</p>`;
                html += `</div>`;
                html += `<button class="travel-btn" onclick="TravelSystem.startTravel('${location.id}')">Travel to ${location.name}</button>`;
            } else {
                html += `<p class="current-location">You are currently here.</p>`;
            }

            html += `</div>`;
            detailsPanel.innerHTML = html;
            detailsPanel.classList.remove('hidden');
        }
    },

    // calculate how long this journey of suffering will take
    // Now handles multi-hop paths with realistic varied travel times
    calculateTravelInfo(destination) {
        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) {
            return { timeDisplay: 'Unknown', distance: 0, safety: 0, pathType: 'unknown', timeHours: 0, hops: 0 };
        }

        const path = this.findPath(currentLoc, destination);

        // Get base travel speed from transportation
        const transport = game.player?.transportation || 'backpack';
        const transportData = typeof transportationOptions !== 'undefined' ? transportationOptions[transport] : null;
        const baseSpeed = transportData?.speed || this.getTransportSpeed(transport);

        // For multi-hop paths, calculate time for each segment
        let totalTimeHours = 0;
        let totalDistance = 0;
        let totalStaminaCost = 0;
        const segmentTimes = [];

        if (path.segments && path.segments.length > 0) {
            // Multi-hop route - calculate each segment's travel time
            for (const segment of path.segments) {
                const segmentType = segment.type || 'trail';
                const segmentInfo = this.PATH_TYPES[segmentType] || this.PATH_TYPES.trail;
                const segmentDistance = segment.distance || 5; // default 5 miles

                // Calculate effective speed for this segment
                const effectiveSpeed = baseSpeed * segmentInfo.speedMultiplier;

                // Calculate time for this segment (no cap - real journeys take real time)
                const segmentTime = segmentDistance / effectiveSpeed;

                totalTimeHours += segmentTime;
                totalDistance += segmentDistance;
                totalStaminaCost += Math.round(segmentInfo.staminaDrain * segmentTime * 10);

                segmentTimes.push({
                    from: segment.from,
                    to: segment.to,
                    type: segmentType,
                    distance: segmentDistance,
                    time: segmentTime
                });
            }
        } else {
            // Direct path or wilderness - use overall path info
            const pathType = path.type || 'trail';
            const pathInfo = this.PATH_TYPES[pathType] || this.PATH_TYPES.trail;
            const distance = path.totalDistance || this.calculateDistance(currentLoc, destination);

            const effectiveSpeed = baseSpeed * pathInfo.speedMultiplier;
            totalTimeHours = distance / effectiveSpeed;
            totalDistance = distance;
            totalStaminaCost = Math.round(pathInfo.staminaDrain * totalTimeHours * 10);

            // Wilderness paths are slower and more dangerous
            if (path.isWilderness) {
                totalTimeHours *= 1.5; // 50% longer for off-road travel
                totalStaminaCost = Math.round(totalStaminaCost * 1.5);
            }
        }

        //  Apply weather and seasonal speed modifiers from TimeMachine/WeatherSystem 
        // These systems are the source of truth for ALL time calculations
        let weatherSpeedMod = 1.0;
        let seasonalSpeedMod = 1.0;

        // Get weather modifier
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.getTravelSpeedModifier) {
            weatherSpeedMod = WeatherSystem.getTravelSpeedModifier() || 1.0;
        }

        //  Get seasonal modifier from TimeMachine - using getSeasonData() not getCurrentSeason() 
        if (typeof TimeMachine !== 'undefined' && TimeMachine.getSeasonData) {
            const seasonData = TimeMachine.getSeasonData();
            if (seasonData && seasonData.effects && seasonData.effects.travelSpeed) {
                seasonalSpeedMod = seasonData.effects.travelSpeed;
            }
        }

        // Get game event modifier
        const eventSpeedMod = game?.travelSpeedModifier || 1.0;

        // Combined modifier (lower = slower = longer travel time)
        const combinedSpeedMod = weatherSpeedMod * seasonalSpeedMod * eventSpeedMod;

        // Apply modifier to travel time (slower speed = more time)
        if (combinedSpeedMod > 0 && combinedSpeedMod !== 1.0) {
            totalTimeHours = totalTimeHours / combinedSpeedMod;
        }

        //  FIX: Cap max travel time at 6 hours - no path should take longer
        const MAX_TRAVEL_HOURS = 6;
        totalTimeHours = Math.min(totalTimeHours, MAX_TRAVEL_HOURS);

        // Generate route description for multi-hop journeys
        let routeDescription = '';
        if (path.route && path.route.length > 2) {
            const stopNames = path.route.slice(1, -1).map(id => {
                const loc = this.locations[id];
                return loc ? loc.name : id;
            });
            routeDescription = `Via: ${stopNames.join(' → ')}`;
        }

        const pathType = path.type || 'trail';
        const pathInfo = this.PATH_TYPES[pathType] || this.PATH_TYPES.trail;

        return {
            timeDisplay: this.formatTime(totalTimeHours),
            timeHours: totalTimeHours,
            distance: Math.round(totalDistance),
            safety: Math.round((path.safety || pathInfo.safety) * 100),
            pathType: pathType,
            pathTypeName: pathInfo.name,
            pathDescription: pathInfo.description,
            staminaCost: totalStaminaCost,
            speedMultiplier: pathInfo.speedMultiplier,
            hops: path.hops || 1,
            route: path.route || [currentLoc.id, destination.id],
            routeDescription: routeDescription,
            segments: segmentTimes,
            isWilderness: path.isWilderness || false,
            //  Include modifiers for transparency 
            weatherSpeedMod: weatherSpeedMod,
            seasonalSpeedMod: seasonalSpeedMod,
            eventSpeedMod: eventSpeedMod,
            combinedSpeedMod: combinedSpeedMod
        };
    },

    // Calculate distance between locations
    // Note: TravelSystem coordinates are 10x scaled from mapPosition, so we divide by 100
    // to get the same miles value as GameWorldRenderer (which uses mapPosition / 10)
    //  FIX: Distance calculation - coordinates are 10x scaled from GameWorld
    // With 10x scale, adjacent locations are ~1000-2000 units apart
    // Divide by 500 to get reasonable mile distances (2-4 miles between nearby locations)
    // This ensures starting area paths take ~30min-2hrs and max travel is ~6hrs
    calculateDistance(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return Math.sqrt(dx * dx + dy * dy) / 500; // Convert scaled coords to miles
    },

    // Find path between locations using A* pathfinding
    // Returns an object with the full route (array of location IDs), total distance, and path segments
    findPath(from, to) {
        // If same location, no path needed
        if (from.id === to.id) {
            return {
                route: [from.id],
                segments: [],
                totalDistance: 0,
                type: 'none',
                safety: 1.0,
                quality: 'excellent',
                travelBonus: 0,
                hops: 0
            };
        }

        // Check if there's a direct connection first
        const directPath = this.paths.find(path =>
            (path.from === from.id && path.to === to.id) ||
            (path.from === to.id && path.to === from.id)
        );

        if (directPath) {
            return {
                route: [from.id, to.id],
                segments: [directPath],
                totalDistance: directPath.distance || this.calculateDistance(from, to),
                type: directPath.type || 'road',
                safety: directPath.safety || 0.7,
                quality: directPath.quality || 'fair',
                travelBonus: directPath.travelBonus || 0,
                hops: 1
            };
        }

        // A* pathfinding for multi-hop routes
        const route = this.aStarPathfind(from.id, to.id);

        if (!route || route.length === 0) {
            // No path found - return wilderness path (direct but dangerous)
            console.warn(`🗺️ No connected path from ${from.name} to ${to.name}, using wilderness route`);
            return {
                route: [from.id, to.id],
                segments: [],
                totalDistance: this.calculateDistance(from, to),
                type: 'wilderness',
                safety: 0.3,
                quality: 'poor',
                travelBonus: -0.2,
                hops: 1,
                isWilderness: true
            };
        }

        // Build the full path info from the route
        return this.buildPathFromRoute(route);
    },

    // A* pathfinding algorithm - finds shortest path through connected locations
    aStarPathfind(startId, goalId) {
        const locations = this.locations;
        if (!locations[startId] || !locations[goalId]) return null;

        // Priority queue (using array with sorting - not optimal but works)
        const openSet = [startId];
        const closedSet = new Set(); // track visited nodes to prevent infinite loops
        const cameFrom = {};
        const gScore = { [startId]: 0 };
        const fScore = { [startId]: this.heuristicDistance(startId, goalId) };

        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => (fScore[a] || Infinity) - (fScore[b] || Infinity));
            const current = openSet.shift();

            //  Skip if already processed - prevents infinite loop with bidirectional paths 
            if (closedSet.has(current)) continue;
            closedSet.add(current);

            if (current === goalId) {
                // Reconstruct path
                const path = [current];
                let node = current;
                while (cameFrom[node]) {
                    node = cameFrom[node];
                    path.unshift(node);
                }
                return path;
            }

            // Get neighbors (connected locations)
            const currentLoc = locations[current];
            const neighbors = currentLoc?.connections || [];

            for (const neighborId of neighbors) {
                //  Skip already visited nodes and invalid locations 
                if (!locations[neighborId] || closedSet.has(neighborId)) continue;

                // Calculate cost to reach neighbor
                const pathSegment = this.getPathBetween(current, neighborId);
                const moveCost = pathSegment?.distance || this.calculateDistance(
                    locations[current],
                    locations[neighborId]
                );

                // Add terrain/path type penalty
                const pathType = pathSegment?.type || 'trail';
                const pathInfo = this.PATH_TYPES[pathType] || this.PATH_TYPES.trail;
                const terrainPenalty = 1 / (pathInfo.speedMultiplier || 0.5); // Slower paths cost more

                const tentativeG = gScore[current] + (moveCost * terrainPenalty);

                if (tentativeG < (gScore[neighborId] || Infinity)) {
                    cameFrom[neighborId] = current;
                    gScore[neighborId] = tentativeG;
                    fScore[neighborId] = tentativeG + this.heuristicDistance(neighborId, goalId);

                    if (!openSet.includes(neighborId)) {
                        openSet.push(neighborId);
                    }
                }
            }
        }

        // No path found
        return null;
    },

    // Heuristic distance for A* (straight line distance)
    heuristicDistance(fromId, toId) {
        const from = this.locations[fromId];
        const to = this.locations[toId];
        if (!from || !to) return Infinity;
        return this.calculateDistance(from, to);
    },

    // Get the path segment between two directly connected locations
    getPathBetween(fromId, toId) {
        return this.paths.find(path =>
            (path.from === fromId && path.to === toId) ||
            (path.from === toId && path.to === fromId)
        );
    },

    // Build full path info from a route array
    buildPathFromRoute(route) {
        if (!route || route.length < 2) {
            return {
                route: route || [],
                segments: [],
                totalDistance: 0,
                type: 'none',
                safety: 1.0,
                quality: 'excellent',
                travelBonus: 0,
                hops: 0
            };
        }

        const segments = [];
        let totalDistance = 0;
        let worstSafety = 1.0;
        let worstQuality = 'excellent';
        let totalTravelBonus = 0;
        const qualityRank = { excellent: 4, good: 3, fair: 2, poor: 1 };

        for (let i = 0; i < route.length - 1; i++) {
            const fromId = route[i];
            const toId = route[i + 1];
            const from = this.locations[fromId];
            const to = this.locations[toId];

            if (!from || !to) continue;

            const segment = this.getPathBetween(fromId, toId) || {
                from: fromId,
                to: toId,
                type: 'trail',
                distance: this.calculateDistance(from, to),
                safety: 0.5,
                quality: 'fair',
                travelBonus: 0
            };

            // Ensure segment has distance
            if (!segment.distance) {
                segment.distance = this.calculateDistance(from, to);
            }

            segments.push(segment);
            totalDistance += segment.distance;

            // Track worst conditions
            if (segment.safety < worstSafety) {
                worstSafety = segment.safety;
            }
            if (qualityRank[segment.quality] < qualityRank[worstQuality]) {
                worstQuality = segment.quality;
            }
            totalTravelBonus += segment.travelBonus || 0;
        }

        // Determine overall path type (use most common or worst)
        const typeCounts = {};
        segments.forEach(s => {
            typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
        });
        const dominantType = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'trail';

        return {
            route,
            segments,
            totalDistance,
            type: dominantType,
            safety: worstSafety,
            quality: worstQuality,
            travelBonus: totalTravelBonus / segments.length, // Average bonus
            hops: route.length - 1
        };
    },

    // Calculate path safety
    calculatePathSafety(path) {
        let baseSafety = 0.5;
        
        if (path.safety) {
            baseSafety = path.safety;
        }
        
        // Modify based on player equipment and skills
        // This would integrate with the existing game systems
        
        return Math.max(0.1, Math.min(1.0, baseSafety));
    },

    // Get transportation speed
    getTransportSpeed(transport) {
        const speeds = {
            foot: 3,      // 3 mph
            horse: 8,     // 8 mph
            cart: 4,      // 4 mph
            carriage: 6   // 6 mph
        };
        return speeds[transport] || 3;
    },

    // Format time for display
    formatTime(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} minutes`;
        } else if (hours < 24) {
            return `${Math.round(hours)} hours`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            return `${days} days${remainingHours > 0 ? ` ${remainingHours} hours` : ''}`;
        }
    },

    // Start travel to destination - venturing into the unknown (again)
    startTravel(destinationId) {
        console.log('🖤 startTravel invoked for:', destinationId);

        const destination = this.locations[destinationId] ||
                          this.resourceNodes.find(n => n.id === destinationId) ||
                          this.pointsOfInterest.find(p => p.id === destinationId);

        if (!destination) {
            addMessage('🖤 destination does not exist... the void claims another');
            console.warn('🖤 destination not found:', destinationId);
            return;
        }

        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) {
            addMessage('🖤 where even are you? location unknown...');
            console.warn('🖤 current location is undefined');
            return;
        }

        // already traveling? dont start another journey, thats how you lose yourself
        if (this.playerPosition.isTraveling) {
            addMessage('🖤 already wandering... patience, dark soul');
            console.warn('🖤 travel rejected - already traveling');
            return;
        }

        // BOSS GATE CHECK - dungeons are guarded by their bosses, gotta earn entry
        // Map of dungeon -> boss that must be defeated to enter
        const dungeonBossGates = {
            'shadow_dungeon': 'grimfang',      // Shadow beast guards the Shadow Dungeon
            'forest_dungeon': 'scorathax'      // Forest dragon guards the Overgrown Crypt
        };

        const requiredBoss = dungeonBossGates[destinationId];
        if (requiredBoss) {
            const defeatedBosses = game?.player?.defeatedBosses || [];
            if (!defeatedBosses.includes(requiredBoss)) {
                const bossNames = {
                    'grimfang': 'Grimfang the Shadow Beast',
                    'scorathax': 'Scorathax the Forest Dragon'
                };
                const bossName = bossNames[requiredBoss] || requiredBoss;
                addMessage(`⚔️ The path to ${destination.name} is blocked!`);
                addMessage(`💀 You must first defeat ${bossName} to enter this dungeon.`);
                addMessage(`📍 Seek the beast in the surrounding wilderness...`);
                console.warn('🖤 Travel blocked - boss not defeated:', requiredBoss);
                return false;
            }
            console.log('💀 Boss gate passed - player has defeated', requiredBoss);
        }

        const travelInfo = this.calculateTravelInfo(destination);

        // sanity check travel duration
        if (!travelInfo || !travelInfo.timeHours || travelInfo.timeHours <= 0) {
            console.warn('🖤 travel time calculation returned void:', travelInfo);
            // fallback to minimum travel time
            travelInfo.timeHours = 0.5; // 30 min minimum
            travelInfo.timeDisplay = '30 minutes';
        }

        //  CHECK FOR UNEXPLORED LOCATIONS IN PATH - can't travel through the unknown! 
        // Players must explore each location in order - no skipping through unvisited areas
        if (travelInfo.route && travelInfo.route.length > 2) {
            const visitedLocations = typeof GameWorld !== 'undefined' && Array.isArray(GameWorld.visitedLocations)
                ? GameWorld.visitedLocations
                : [];

            // Check intermediate locations (not start or end)
            const intermediateLocations = travelInfo.route.slice(1, -1);
            for (const locId of intermediateLocations) {
                if (!visitedLocations.includes(locId)) {
                    const blockedLoc = this.locations[locId];
                    const blockedName = blockedLoc ? blockedLoc.name : locId;
                    addMessage(`⚠️ Cannot travel through unexplored territory!`);
                    addMessage(`📍 You must first visit "${blockedName}" before passing through.`);
                    console.warn('🖤 Travel blocked - unexplored location in path:', locId);
                    return false;
                }
            }
        }

        // Start travel - embrace the journey, or whatever
        this.playerPosition.isTraveling = true;
        this.playerPosition.destination = destination;
        this.playerPosition.travelProgress = 0;
        this.playerPosition.travelStartTime = TimeSystem.getTotalMinutes();
        this.playerPosition.travelDuration = Math.max(1, travelInfo.timeHours * 60); // Convert to minutes, minimum 1
        this.playerPosition.path = this.findPath(currentLoc, destination);

        // Store route info for multi-hop journeys
        this.playerPosition.route = travelInfo.route;
        this.playerPosition.routeIndex = 0; // Current position in route
        this.playerPosition.hops = travelInfo.hops;

        console.log('🖤 travel initiated:', {
            from: currentLoc.name,
            to: destination.name,
            startTime: this.playerPosition.travelStartTime,
            duration: this.playerPosition.travelDuration,
            estimatedArrival: this.playerPosition.travelStartTime + this.playerPosition.travelDuration,
            hops: travelInfo.hops,
            route: travelInfo.route,
            //  Speed modifiers from TimeMachine/WeatherSystem 
            weatherMod: travelInfo.weatherSpeedMod,
            seasonMod: travelInfo.seasonalSpeedMod,
            eventMod: travelInfo.eventSpeedMod,
            combinedMod: travelInfo.combinedSpeedMod
        });

        // Build travel message based on route complexity
        let travelMessage = `🚶 Starting journey to ${destination.name}...`;
        if (travelInfo.hops > 1) {
            travelMessage += ` (${travelInfo.hops} stops)`;
        }
        if (travelInfo.routeDescription) {
            addMessage(travelMessage);
            addMessage(`📍 ${travelInfo.routeDescription}`);
        } else {
            addMessage(travelMessage);
        }
        addMessage(`⏱️ Estimated travel time: ${travelInfo.timeDisplay} | Distance: ${travelInfo.distance} miles`);

        //  Track journey start for achievements (Start Your Journey!)
        try {
            if (typeof AchievementSystem !== 'undefined' && AchievementSystem.trackJourneyStart) {
                AchievementSystem.trackJourneyStart(destination.id);
            }
        } catch (e) {
            console.warn('🖤 AchievementSystem.trackJourneyStart error (non-fatal):', e.message);
        }

        // Auto-unpause time when starting travel (if auto-time toggle is enabled)
        const autoTimeToggle = document.getElementById('auto-travel-time-toggle');
        const autoTimeEnabled = autoTimeToggle ? autoTimeToggle.checked : true; // Default to enabled

        if (autoTimeEnabled && typeof TimeSystem !== 'undefined' && (TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED')) {
            TimeSystem.setSpeed('NORMAL');
            addMessage('⏱️ Time auto-started - your journey begins!');
        }

        // Hide location details panel
        const detailsPanel = document.getElementById('location-details');
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
        }

        // Record departure from current location and set destination
        // CRITICAL: This triggers the walking emoji animation!
        if (typeof GameWorldRenderer !== 'undefined') {
            try {
                GameWorldRenderer.recordLocationDeparture();
                GameWorldRenderer.setDestination(destination.id);
                // Trigger map marker animation - Pass full route for multi-hop path animation
                if (GameWorldRenderer.onTravelStart) {
                    GameWorldRenderer.onTravelStart(currentLoc.id, destination.id, travelInfo.timeHours * 60, travelInfo.route);
                }
            } catch (e) {
                console.warn('🖤 GameWorldRenderer travel start error (non-fatal):', e.message);
            }
        }

        // Update UI
        this.updateTravelUI();

        //  Update location panel to show we're now traveling 
        if (typeof updateLocationInfo === 'function') {
            updateLocationInfo();
        }
        if (typeof updateLocationPanel === 'function') {
            updateLocationPanel();
        }
    },

    // Update travel progress - dragging ourselves through the endless void
    updateTravelProgress() {
        if (!this.playerPosition.isTraveling) return;

        const currentTime = TimeSystem.getTotalMinutes();
        const startTime = this.playerPosition.travelStartTime;
        const duration = this.playerPosition.travelDuration;

        // sanity check - if something's broken, dont spiral into NaN hell
        if (!startTime || !duration || duration <= 0) {
            console.warn('🖤 travel params are screaming into the void... startTime:', startTime, 'duration:', duration);
            this.completeTravel(); // just end the suffering
            return;
        }

        const elapsed = currentTime - startTime;
        const oldProgress = this.playerPosition.travelProgress;
        this.playerPosition.travelProgress = Math.min(1.0, elapsed / duration);

        // debooger log  every ~10% progress (for the curious and the damned)
        const progressPct = Math.floor(this.playerPosition.travelProgress * 100);
        const oldProgressPct = Math.floor(oldProgress * 100);
        if (progressPct > oldProgressPct && progressPct % 10 === 0) {
            console.log(`🚶 journey progress: ${progressPct}% (${elapsed}/${duration} mins elapsed)`);
        }

        //  game.js processPlayerStatsOverTime() handles ALL vital decay 
        // Travel advances game time, which naturally triggers the unified decay system

        // Update player position along path
        this.updatePlayerPositionAlongPath();

        //  Update location panel to show travel progress 
        if (typeof updateLocationInfo === 'function') {
            updateLocationInfo();
        }
        if (typeof updateLocationPanel === 'function') {
            updateLocationPanel();
        }

        // Check if travel is complete - the light at the end of the tunnel
        if (this.playerPosition.travelProgress >= 1.0) {
            console.log('🖤 destination reached... finally.');
            this.completeTravel();
            return; // exit early, we're done wandering
        }

        //  Check for random encounters - TimeMachine controlled, max 2 per game day 
        if (this.playerPosition.isTraveling &&
            typeof game !== 'undefined' &&
            game.state &&
            game.state === GameState.PLAYING &&
            typeof TimeMachine !== 'undefined') {

            // Get current day from TimeMachine
            const currentDay = TimeMachine.currentTime?.day || 1;

            // Reset counter on new day
            if (currentDay !== this._lastEncounterDay) {
                this._encountersToday = 0;
                this._lastEncounterDay = currentDay;
            }

            // Only trigger if under daily limit (max 2 per day)
            if (this._encountersToday < this.MAX_ENCOUNTERS_PER_DAY && Math.random() < 0.01) {
                this._encountersToday++;
                this.triggerRandomEncounter();
            }
        }

        this.updateTravelUI();
    },
    
    //  Track last travel drain time to prevent multi-frame drain 
    _lastTravelDrainMinute: -1,

    // Apply stat drain during travel
    applyTravelStatDrain(elapsedMinutes) {
        if (!game.player || !game.player.stats) return;

        //  FIX: Prevent multi-frame drain - only drain ONCE per 30-minute mark 
        const drainMark = Math.floor(elapsedMinutes / 30) * 30;
        if (drainMark === 0 || drainMark === this._lastTravelDrainMinute) return;
        this._lastTravelDrainMinute = drainMark;

        // Calculate drain based on travel speed and path type
        const path = this.playerPosition.path;
        let drainMultiplier = 1.0;

        if (path && path.quality) {
            switch (path.quality) {
                case 'excellent':
                    drainMultiplier = 0.5; // Well-maintained roads
                    break;
                case 'good':
                    drainMultiplier = 0.7; // Good roads
                    break;
                case 'fair':
                    drainMultiplier = 1.0; // Fair paths
                    break;
                case 'poor':
                    drainMultiplier = 1.5; // Poor trails
                    break;
            }
        }

        //  FIX: Reduced travel stat drain - these are ADDITIONAL to normal decay
        // Only apply small extra drain during travel, not massive amounts
        // Apply stat drain every 30 minutes of travel (check already done above)
        {
            // Small additional drain during travel (on top of normal game.js decay)
            const hungerDrain = 0.5 * drainMultiplier;  // Was 3, now 0.5
            const thirstDrain = 0.8 * drainMultiplier;  // Was 5, now 0.8
            const fatigueDrain = 1.0 * drainMultiplier; // Was 2, now 1.0
            
            // apply stat changes via PlayerStateManager if available
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.stats.subtract('hunger', hungerDrain, 'travel_drain');
                PlayerStateManager.stats.subtract('thirst', thirstDrain, 'travel_drain');
                PlayerStateManager.stats.subtract('stamina', fatigueDrain, 'travel_drain');
            } else {
                game.player.stats.hunger = Math.max(0, game.player.stats.hunger - hungerDrain);
                game.player.stats.thirst = Math.max(0, game.player.stats.thirst - thirstDrain);
                game.player.stats.stamina = Math.max(0, game.player.stats.stamina - fatigueDrain);
            }

            // Get current stat values for health checks
            const currentHunger = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.stats.get('hunger') : game.player.stats.hunger;
            const currentThirst = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.stats.get('thirst') : game.player.stats.thirst;
            const currentStamina = typeof PlayerStateManager !== 'undefined' ?
                PlayerStateManager.stats.get('stamina') : game.player.stats.stamina;

            // Apply health effects from severe stat drain
            if (currentHunger <= 0) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.subtract('health', 5, 'starvation_travel');
                } else {
                    game.player.stats.health = Math.max(0, game.player.stats.health - 5);
                }
                addMessage("⚠️ You're starving! Health decreasing rapidly.", 'warning');
                if (typeof DeathCauseSystem !== 'undefined') {
                    DeathCauseSystem.recordTravelHazard('starvation', { context: 'while traveling' });
                }
            }

            if (currentThirst <= 0) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.subtract('health', 8, 'dehydration_travel');
                } else {
                    game.player.stats.health = Math.max(0, game.player.stats.health - 8);
                }
                addMessage("⚠️ You're dehydrated! Health decreasing rapidly.", 'warning');
                if (typeof DeathCauseSystem !== 'undefined') {
                    DeathCauseSystem.recordTravelHazard('dehydration', { context: 'while traveling' });
                }
            }

            if (currentStamina <= 0) {
                if (typeof PlayerStateManager !== 'undefined') {
                    PlayerStateManager.stats.subtract('health', 3, 'exhaustion_travel');
                } else {
                    game.player.stats.health = Math.max(0, game.player.stats.health - 3);
                }
                addMessage("⚠️ You're exhausted! Health decreasing.", 'warning');
                if (typeof DeathCauseSystem !== 'undefined') {
                    DeathCauseSystem.recordExhaustion();
                }
            }
            
            // Update UI
            if (typeof updatePlayerStats === 'function') {
                updatePlayerStats();
            }
        }
    },

    // Update player position along travel path
    updatePlayerPositionAlongPath() {
        if (!this.playerPosition.destination) return;
        
        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) return;
        
        const progress = this.playerPosition.travelProgress;
        
        // Linear interpolation between current and destination
        this.playerPosition.x = currentLoc.x + (this.playerPosition.destination.x - currentLoc.x) * progress;
        this.playerPosition.y = currentLoc.y + (this.playerPosition.destination.y - currentLoc.y) * progress;
        
        this.render();
    },

    // Complete travel - finally, the wandering ends (for now)
    completeTravel() {
        const destination = this.playerPosition.destination;
        const currentLoc = this.getCurrentLocation();

        // safety net for the void - sometimes destinations vanish like my will to live
        if (!destination) {
            console.warn('no destination found... did the void eat it?');
            this.playerPosition.isTraveling = false;
            return;
        }

        // Calculate distance traveled for this journey
        let distance = 0;
        if (currentLoc && destination) {
            distance = this.calculateDistance(currentLoc, destination);
        }

        this.playerPosition.isTraveling = false;
        this.playerPosition.currentLocation = destination.id;
        this.playerPosition.destination = null;
        this.playerPosition.travelProgress = 0;
        this.playerPosition.travelStartTime = null;
        this.playerPosition.travelDuration = null;

        // Add to travel history
        this.travelHistory.push({
            from: currentLoc?.name || 'Unknown',
            to: destination.name,
            duration: this.playerPosition.travelDuration,
            timestamp: TimeSystem.getTotalMinutes()
        });

        //  DISCOVER PATHS - mark all paths in the route as discovered 
        // Players now know travel times, distances, and path types for roads they've walked
        const route = this.playerPosition.route;
        if (route && route.length >= 2) {
            const newlyDiscovered = this.discoverRouteWalked(route);
            if (newlyDiscovered.length > 0) {
                addMessage(`🛤️ Discovered ${newlyDiscovered.length} new path${newlyDiscovered.length > 1 ? 's' : ''}! Road information now available.`);
            }
        } else if (currentLoc && currentLoc.id && destination && destination.id) {
            //  Guard against null currentLoc.id - prevents crash 
            // Direct travel - discover single path
            if (this.discoverPath(currentLoc.id, destination.id)) {
                addMessage(`🛤️ Path discovered! You now know the road from ${currentLoc.name} to ${destination.name}.`);
            }
        }

        // Update game state via WorldStateManager (with legacy fallback)
        const locationData = {
            id: destination.id,
            name: destination.name,
            type: destination.type,
            description: destination.description || ''
        };
        if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
            WorldStateManager.setCurrentLocation(locationData, 'travel_arrived');
        } else {
            // legacy fallback
            game.currentLocation = locationData;
        }

        //  CRITICAL: Mark location as VISITED/EXPLORED so tooltips and panels update
        // Uses world-aware helper for doom/normal world separation!
        let wasFirstVisit = false;
        if (typeof GameWorld !== 'undefined') {
            if (typeof GameWorld.markLocationVisited === 'function') {
                // Use world-aware method (adds to doomVisitedLocations or visitedLocations based on current world)
                wasFirstVisit = GameWorld.markLocationVisited(destination.id);
            } else if (Array.isArray(GameWorld.visitedLocations) && !GameWorld.visitedLocations.includes(destination.id)) {
                // Fallback to direct array access
                wasFirstVisit = true;
                GameWorld.visitedLocations.push(destination.id);
            }
        }

        if (wasFirstVisit) {
            addMessage(`📍 First time exploring ${destination.name}!`);
            const activeVisited = GameWorld?.getActiveVisitedLocations?.() || GameWorld?.visitedLocations || [];
            console.log('🖤 Location discovered:', destination.id, '- Total visited:', activeVisited.length);
        }

        // RING THE BELL OF ARRIVAL - let the realm know we survived
        this.showArrivalNotification(destination);

        addMessage(`🔔 Arrived at ${destination.name}!`);

        // Check if we arrived at a gatehouse for the first time - show guard encounter
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.GATEHOUSES) {
            const gatehouse = GatehouseSystem.GATEHOUSES[destination.id];
            if (gatehouse && !GatehouseSystem.isGatehouseUnlocked(destination.id)) {
                const zoneName = GatehouseSystem.ZONES[gatehouse.unlocksZone]?.name || 'the region beyond';
                addMessage(`🏰 You've arrived at ${gatehouse.name}. To enter ${zoneName}, speak with the guard and pay the ${gatehouse.fee} gold passage fee.`);

                // Show the guard encounter after a short delay
                setTimeout(() => {
                    if (GatehouseSystem.showGatehouseArrivalPrompt) {
                        GatehouseSystem.showGatehouseArrivalPrompt(destination.id);
                    }
                }, 500);
            }
        }

        // Update player position to destination coordinates
        if (destination.x !== undefined && destination.y !== undefined) {
            this.playerPosition.x = destination.x;
            this.playerPosition.y = destination.y;
        }

        // Track achievement progress (wrapped in try-catch to prevent blocking travel completion)
        try {
            if (typeof AchievementSystem !== 'undefined') {
                AchievementSystem.trackLocationVisit(destination.id);
                AchievementSystem.trackJourney(distance);
            }
        } catch (e) {
            console.warn('🖤 Achievement tracking error (non-fatal):', e.message);
        }

        //  Wrap arrival sequence in try/catch - arrival MUST complete even if UI fails 
        try {
            // Record arrival in location history and update player marker
            if (typeof GameWorldRenderer !== 'undefined') {
                //  Use wasFirstVisit from earlier check (we already added to visitedLocations) 
                if (GameWorldRenderer.recordLocationVisit) {
                    GameWorldRenderer.recordLocationVisit(destination.id, {
                        isFirstVisit: wasFirstVisit
                    });
                }
                // Mark destination as reached (grayed out) instead of clearing
                // This keeps a log so players can retrace their paths
                if (GameWorldRenderer.markDestinationReached) {
                    GameWorldRenderer.markDestinationReached();
                }
                if (GameWorldRenderer.updateHistoryPanel) {
                    GameWorldRenderer.updateHistoryPanel();
                }

                // Ensure the player marker is positioned exactly at the destination
                // and showing the "arrived" state (hovering above the location)
                if (GameWorldRenderer.completeTravelAnimation) {
                    GameWorldRenderer.completeTravelAnimation();
                }
                //  Re-render map AFTER game.currentLocation is set (lines 2263-2267 above)
                // This ensures new location shows as explored and connected locations as discovered
                if (GameWorldRenderer.render) {
                    GameWorldRenderer.render();
                }
                if (GameWorldRenderer.updatePlayerMarker) {
                    GameWorldRenderer.updatePlayerMarker();
                }
            }
        } catch (err) {
            console.warn('🖤 GameWorldRenderer arrival error (non-fatal):', err.message);
        }

        // Trigger location-specific events (already has try/catch inside)
        this.triggerLocationEvents(destination);

        //  DISPATCH LOCATION CHANGE EVENT - let ALL panels know we've moved 
        // Market, People, Location panel - everyone needs to update their souls
        try {
            this.dispatchLocationChangeEvent(destination);
        } catch (err) {
            console.warn('🖤 dispatchLocationChangeEvent error (non-fatal):', err.message);
        }

        // Update UI
        this.updateTravelUI();
        this.render();

        // Auto-pause after arrival if auto-time toggle is enabled
        const autoTimeToggle = document.getElementById('auto-travel-time-toggle');
        const autoTimeEnabled = autoTimeToggle ? autoTimeToggle.checked : true;

        if (autoTimeEnabled && typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('PAUSED');
            addMessage('⏱️ Time auto-stopped - you have arrived!');
        } else if (typeof TimeSystem !== 'undefined' && game.settings?.pauseOnArrival) {
            // Fallback to old behavior if toggle doesn't exist
            TimeSystem.setSpeed('PAUSED');
        }
    },

    // Cancel ongoing travel - delegate to TravelPanelMap which handles the turn-around logic 
    cancelTravel() {
        //  TravelPanelMap has the full logic for turning around and heading back 
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.cancelTravel) {
            TravelPanelMap.cancelTravel();
            return;
        }

        //  Fallback if TravelPanelMap not available - reverse direction in-place 
        if (this.playerPosition.isTraveling) {
            const currentProgress = this.playerPosition.travelProgress || 0;
            const originalDuration = this.playerPosition.travelDuration || 30;
            const currentDestination = this.playerPosition.destination;
            const startLocId = this.playerPosition.currentLocation;

            //  Calculate return journey - proportional time based on distance traveled 
            const returnDuration = Math.max(1, Math.round(originalDuration * currentProgress));
            const startLoc = this.locations[startLocId];

            if (startLoc && currentDestination) {
                if (typeof addMessage === 'function') {
                    addMessage(`🔙 Turning back to ${startLoc.name}... (${returnDuration} min)`);
                }

                //  REVERSE DIRECTION - swap destination, reset progress 
                this.playerPosition.destination = startLoc;
                this.playerPosition.travelDuration = returnDuration;
                this.playerPosition.travelProgress = 0;
                this.playerPosition.travelStartTime = TimeSystem.getTotalMinutes();
                // Note: isTraveling stays TRUE
            } else {
                // No valid locations to reverse to - just stop
                this.playerPosition.isTraveling = false;
                this.playerPosition.destination = null;
                this.playerPosition.travelProgress = 0;

                if (typeof addMessage === 'function') {
                    addMessage('🛑 Journey cancelled');
                }
            }

            this.updateTravelUI();
        }
    },

    // Instant teleport - no travel time, just snap to location (tutorial, portals, etc.)
    teleportTo(locationId, options = {}) {
        const showNotification = options.showNotification !== false;
        const silent = options.silent || false;

        // Get target location from appropriate source
        let targetLocation = null;

        // Check tutorial world first if in tutorial mode
        if (typeof TutorialWorld !== 'undefined' && TutorialWorld.locations?.[locationId]) {
            targetLocation = TutorialWorld.locations[locationId];
        }
        // Then check GameWorld
        else if (typeof GameWorld !== 'undefined' && GameWorld.locations?.[locationId]) {
            targetLocation = GameWorld.locations[locationId];
        }
        // Then check local locations
        else if (this.locations?.[locationId]) {
            targetLocation = this.locations[locationId];
        }

        if (!targetLocation) {
            console.warn(`teleportTo: Location ${locationId} not found`);
            return false;
        }

        // Cancel any ongoing travel
        if (this.playerPosition.isTraveling) {
            this.playerPosition.isTraveling = false;
            this.playerPosition.destination = null;
            this.playerPosition.travelProgress = 0;
        }

        // Update player position instantly
        this.playerPosition.currentLocation = locationId;
        if (targetLocation.x !== undefined) this.playerPosition.x = targetLocation.x;
        if (targetLocation.y !== undefined) this.playerPosition.y = targetLocation.y;

        // Update game state
        const locationData = {
            id: targetLocation.id || locationId,
            name: targetLocation.name || locationId,
            type: targetLocation.type || 'location',
            description: targetLocation.description || ''
        };

        if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
            WorldStateManager.setCurrentLocation(locationData, 'teleport');
        } else if (typeof game !== 'undefined') {
            game.currentLocation = locationData;
        }

        // Mark as visited
        if (typeof GameWorld !== 'undefined' && GameWorld.markLocationVisited) {
            GameWorld.markLocationVisited(locationId);
        }

        // Emit arrival event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('player:teleported', { locationId, location: targetLocation });
            EventBus.emit('location:changed', { location: locationData, source: 'teleport' });
        }

        // Update map renders
        if (typeof GameWorldRenderer !== 'undefined') {
            GameWorldRenderer.updatePlayerMarker?.();
            GameWorldRenderer.render?.();
        }
        if (typeof TravelPanelMap !== 'undefined') {
            TravelPanelMap.render?.();
        }

        // Show notification unless suppressed
        if (showNotification && !silent) {
            if (typeof addMessage === 'function') {
                addMessage(`📍 Teleported to ${targetLocation.name}`);
            }
        }

        console.log(`teleportTo: Instant travel to ${targetLocation.name} (${locationId})`);
        return true;
    },

    //  Show arrival notification - the bell tolls for thee (in a good way this time)
    showArrivalNotification(destination) {
        // play the sacred bell sound if audio system exists
        if (typeof AudioSystem !== 'undefined' && AudioSystem.playSound) {
            AudioSystem.playSound('notification');
        }

        // create a dramatic notification popup
        const existingNotification = document.getElementById('arrival-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'arrival-notification';
        notification.className = 'arrival-notification';
        notification.innerHTML = `
            <div class="arrival-notification-content">
                <div class="arrival-bell">🔔</div>
                <div class="arrival-text">
                    <div class="arrival-title">Journey Complete</div>
                    <div class="arrival-destination">Welcome to ${destination.name}</div>
                    ${destination.type ? `<div class="arrival-type">${destination.type}</div>` : ''}
                </div>
            </div>
        `;

        // style it inline because we're chaotic like that
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(40, 40, 60, 0.95) 100%);
            border: 2px solid #ffd700;
            border-radius: 12px;
            padding: 1.5rem 2rem;
            z-index: 850; /* Z-INDEX STANDARD: Notifications (arrival) */
            animation: arrivalSlideIn 0.5s ease-out, arrivalFadeOut 0.5s ease-in 3s forwards;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            text-align: center;
            color: #fff;
            font-family: inherit;
        `;

        // add the animation keyframes if they dont exist
        if (!document.getElementById('arrival-notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'arrival-notification-styles';
            styleSheet.textContent = `
                @keyframes arrivalSlideIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-30px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes arrivalFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; visibility: hidden; }
                }
                .arrival-notification .arrival-bell {
                    font-size: 2.5rem;
                    animation: bellRing 0.5s ease-in-out 3;
                    margin-bottom: 0.5rem;
                }
                @keyframes bellRing {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(15deg); }
                    75% { transform: rotate(-15deg); }
                }
                .arrival-notification .arrival-title {
                    font-size: 0.9rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 0.25rem;
                }
                .arrival-notification .arrival-destination {
                    font-size: 1.4rem;
                    font-weight: bold;
                    color: #ffd700;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }
                .arrival-notification .arrival-type {
                    font-size: 0.8rem;
                    color: #aaa;
                    margin-top: 0.25rem;
                    font-style: italic;
                }
            `;
            document.head.appendChild(styleSheet);
        }

        document.body.appendChild(notification);

        // remove after animation completes (4 seconds total)
        setTimeout(() => {
            notification.remove();
        }, 4000);

        console.log('🔔 arrival notification summoned for:', destination.name);
    },

    // Trigger random encounters during travel
    triggerRandomEncounter() {
        // Additional safety check to ensure this is only called during actual gameplay
        if (!game.player || game.state !== GameState.PLAYING || !this.playerPosition.isTraveling) {
            console.warn('⚠️ triggerRandomEncounter summoned at the wrong time... chaos respects no schedule');
            return;
        }

        // Get current location and destination info for context
        const currentLoc = this.getCurrentLocation();
        const region = currentLoc?.region || 'unknown';
        const locationType = currentLoc?.type || 'road';

        const encounters = [
            // --- HOSTILE ENCOUNTERS ---
            {
                type: 'bandits',
                rarity: 'common',
                regions: ['all'],
                message: 'Bandits ambush you from the shadows!',
                effect: () => {
                    const combatSkill = game.player.stats?.combat || 0;
                    const success = Math.random() < (0.3 + combatSkill * 0.05);
                    if (success) {
                        const goldFound = Math.floor(Math.random() * 30) + 10;
                        // use PlayerStateManager if available
                        if (typeof PlayerStateManager !== 'undefined') {
                            PlayerStateManager.gold.add(goldFound, 'bandit_victory');
                        } else {
                            game.player.gold += goldFound;
                        }
                        addMessage(`You fend off the bandits and find ${goldFound} gold they dropped!`);

                        if (typeof AchievementSystem !== 'undefined') {
                            AchievementSystem.trackEncounter('bandits', true);
                        }
                    } else {
                        const goldLost = Math.floor(Math.random() * 80) + 20;
                        // use PlayerStateManager if available
                        if (typeof PlayerStateManager !== 'undefined') {
                            PlayerStateManager.gold.remove(goldLost, 'bandit_robbery');
                        } else {
                            game.player.gold = Math.max(0, game.player.gold - goldLost);
                        }
                        addMessage(`You lose ${goldLost} gold to the bandits!`);

                        if (typeof AchievementSystem !== 'undefined') {
                            AchievementSystem.trackEncounter('bandits', true);
                        }
                    }
                    updatePlayerInfo();
                }
            },
            {
                type: 'highwaymen',
                rarity: 'uncommon',
                regions: ['capital', 'trade'],
                message: 'Armed highwaymen demand a toll for safe passage!',
                effect: () => {
                    const toll = Math.floor(Math.random() * 50) + 25;
                    const currentGold = typeof PlayerStateManager !== 'undefined' ?
                        PlayerStateManager.gold.get() : game.player.gold;
                    if (currentGold >= toll) {
                        const choice = Math.random() > 0.5;
                        if (choice) {
                            // use PlayerStateManager if available
                            if (typeof PlayerStateManager !== 'undefined') {
                                PlayerStateManager.gold.remove(toll, 'highwayman_toll');
                            } else {
                                game.player.gold -= toll;
                            }
                            addMessage(`You pay ${toll} gold and pass safely.`);
                        } else {
                            const goldLost = Math.floor(Math.random() * 100) + 50;
                            // use PlayerStateManager if available
                            if (typeof PlayerStateManager !== 'undefined') {
                                PlayerStateManager.gold.remove(goldLost, 'highwayman_robbery');
                            } else {
                                game.player.gold = Math.max(0, game.player.gold - goldLost);
                            }
                            addMessage(`You refuse to pay! The highwaymen take ${goldLost} gold by force.`);
                        }
                    } else {
                        addMessage(`The highwaymen let you pass, seeing you have little gold.`);
                    }
                    updatePlayerInfo();
                }
            },
            {
                type: 'wolves',
                rarity: 'common',
                regions: ['frontier', 'wilderness'],
                message: 'A pack of hungry wolves blocks your path!',
                effect: () => {
                    const combatSkill = game.player.stats?.combat || 0;
                    const success = Math.random() < (0.4 + combatSkill * 0.04);
                    if (success) {
                        addMessage('You scare off the wolves with your weapons!');
                    } else {
                        const healthLost = Math.floor(Math.random() * 20) + 10;
                        addMessage(`The wolves attack! You lose ${healthLost} health.`);
                        // Could reduce player health if implemented
                    }
                }
            },

            // --- FRIENDLY ENCOUNTERS ---
            {
                type: 'merchant',
                rarity: 'common',
                regions: ['all'],
                message: 'You encounter a traveling merchant with exotic goods!',
                effect: () => {
                    addMessage('The merchant offers various goods for trade.');
                    // Could open special trading interface
                }
            },
            {
                type: 'pilgrim',
                rarity: 'common',
                regions: ['all'],
                message: 'A weary pilgrim shares the road with you.',
                effect: () => {
                    const info = [
                        'The pilgrim warns of bandits ahead.',
                        'The pilgrim shares news of a nearby settlement.',
                        'The pilgrim tells tales of distant lands.',
                        'The pilgrim offers a blessing for safe travels.'
                    ];
                    addMessage(info[Math.floor(Math.random() * info.length)]);
                }
            },
            {
                type: 'guard_patrol',
                rarity: 'common',
                regions: ['capital', 'trade'],
                message: 'You meet a friendly guard patrol.',
                effect: () => {
                    const benefits = [
                        'The guards share useful information about the area ahead.',
                        'The guards warn you about recent bandit activity.',
                        'The guards escort you for a short distance, speeding your travel.',
                        'The guards sell you a map showing nearby points of interest.'
                    ];
                    const benefit = benefits[Math.floor(Math.random() * benefits.length)];
                    addMessage(benefit);

                    // Chance to reduce travel time
                    if (Math.random() < 0.3) {
                        this.playerPosition.travelDuration *= 0.9;
                        addMessage('Travel time reduced by 10%!');
                    }
                }
            },
            {
                type: 'fellow_trader',
                rarity: 'uncommon',
                regions: ['trade', 'capital'],
                message: 'Another trader shares the road with you.',
                effect: () => {
                    const tips = [
                        'The trader shares a tip about profitable trade routes.',
                        'The trader warns about oversupplied markets ahead.',
                        'The trader mentions rare goods in high demand.',
                        'The trader offers to buy some of your goods at a fair price.'
                    ];
                    addMessage(tips[Math.floor(Math.random() * tips.length)]);
                }
            },

            // --- DISCOVERY ENCOUNTERS ---
            {
                type: 'treasure',
                rarity: 'rare',
                regions: ['all'],
                message: 'You discover a hidden cache by the roadside!',
                effect: () => {
                    const goldFound = Math.floor(Math.random() * 100) + 50;
                    // use PlayerStateManager if available
                    if (typeof PlayerStateManager !== 'undefined') {
                        PlayerStateManager.gold.add(goldFound, 'treasure_found');
                    } else {
                        game.player.gold += goldFound;
                    }
                    addMessage(`You find ${goldFound} gold!`);

                    if (typeof AchievementSystem !== 'undefined') {
                        AchievementSystem.trackTreasure();
                    }

                    updatePlayerInfo();
                }
            },
            {
                type: 'abandoned_wagon',
                rarity: 'uncommon',
                regions: ['all'],
                message: 'You find an abandoned wagon with scattered goods.',
                effect: () => {
                    const outcomes = [
                        { msg: 'You salvage some trade goods worth 30 gold.', gold: 30 },
                        { msg: 'You find damaged goods, worth about 15 gold.', gold: 15 },
                        { msg: 'You find a locked chest! Breaking it open reveals 75 gold!', gold: 75 },
                        { msg: 'The wagon is empty, likely already looted.', gold: 0 }
                    ];
                    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                    // use PlayerStateManager if available
                    if (outcome.gold > 0) {
                        if (typeof PlayerStateManager !== 'undefined') {
                            PlayerStateManager.gold.add(outcome.gold, 'abandoned_wagon');
                        } else {
                            game.player.gold += outcome.gold;
                        }
                    }
                    addMessage(outcome.msg);
                    updatePlayerInfo();
                }
            },
            {
                type: 'shortcut',
                rarity: 'uncommon',
                regions: ['all'],
                message: 'You notice a shortcut through the terrain!',
                effect: () => {
                    this.playerPosition.travelDuration *= 0.85;
                    addMessage('Travel time reduced by 15%!');
                }
            },
            {
                type: 'scenic_view',
                rarity: 'common',
                regions: ['all'],
                message: 'You stop to admire a breathtaking view of the landscape.',
                effect: () => {
                    addMessage('The beautiful scenery lifts your spirits.');
                    // Could restore morale/energy if implemented
                }
            },

            // --- WEATHER & ENVIRONMENTAL ---
            //  Weather events now check actual WeatherSystem state! 
            {
                type: 'storm',
                rarity: 'common',
                regions: ['all'],
                message: 'A sudden storm slows your progress.',
                //  Only trigger if weather is actually stormy
                condition: () => {
                    if (typeof WeatherSystem === 'undefined') return true;
                    const stormyWeather = ['storm', 'rain', 'blizzard', 'thundersnow'];
                    return stormyWeather.includes(WeatherSystem.currentWeather);
                },
                effect: () => {
                    this.playerPosition.travelDuration *= 1.25;
                    addMessage('Travel time increased by 25% due to bad weather.');
                }
            },
            {
                type: 'fog',
                rarity: 'common',
                regions: ['all'],
                message: 'Thick fog rolls in, obscuring the path.',
                //  Only trigger if weather is actually foggy/misty
                condition: () => {
                    if (typeof WeatherSystem === 'undefined') return true;
                    const foggyWeather = ['fog', 'rain', 'snow'];
                    return foggyWeather.includes(WeatherSystem.currentWeather);
                },
                effect: () => {
                    this.playerPosition.travelDuration *= 1.15;
                    addMessage('Travel time increased by 15% due to poor visibility.');
                }
            },
            {
                type: 'good_weather',
                rarity: 'common',
                regions: ['all'],
                message: 'Perfect weather makes for excellent traveling conditions!',
                //  Only trigger if weather is actually good! No sunny messages in thunderstorms 
                condition: () => {
                    if (typeof WeatherSystem === 'undefined') return true;
                    const goodWeather = ['clear', 'cloudy', 'windy'];
                    return goodWeather.includes(WeatherSystem.currentWeather);
                },
                effect: () => {
                    this.playerPosition.travelDuration *= 0.9;
                    addMessage('Travel time reduced by 10%!');
                }
            },

            // --- MYSTERIOUS ENCOUNTERS ---
            {
                type: 'mysterious_stranger',
                rarity: 'rare',
                regions: ['all'],
                message: 'A mysterious hooded figure approaches you.',
                effect: () => {
                    const outcomes = [
                        { msg: 'The stranger offers you a lucky charm. You feel fortunate!', effect: 'luck' },
                        { msg: 'The stranger shares a cryptic warning before disappearing.', effect: 'warning' },
                        { msg: 'The stranger gifts you 50 gold and vanishes into thin air!', gold: 50 },
                        { msg: 'The stranger steals 30 gold before you can react!', gold: -30 }
                    ];
                    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                    // use PlayerStateManager if available
                    if (outcome.gold) {
                        if (typeof PlayerStateManager !== 'undefined') {
                            if (outcome.gold > 0) {
                                PlayerStateManager.gold.add(outcome.gold, 'mysterious_stranger');
                            } else {
                                PlayerStateManager.gold.remove(Math.abs(outcome.gold), 'mysterious_stranger');
                            }
                        } else {
                            game.player.gold = Math.max(0, game.player.gold + outcome.gold);
                        }
                        updatePlayerInfo();
                    }
                    addMessage(outcome.msg);
                }
            },
            {
                type: 'ancient_ruins',
                rarity: 'rare',
                regions: ['wilderness', 'frontier'],
                message: 'You stumble upon ancient ruins hidden in the landscape.',
                effect: () => {
                    const explore = Math.random() > 0.5;
                    if (explore) {
                        const outcomes = [
                            { msg: 'You find ancient coins worth 100 gold!', gold: 100 },
                            { msg: 'You trigger a trap! Lose 20 health but find 50 gold.', gold: 50 },
                            { msg: 'The ruins are empty, but you gain historical knowledge.', gold: 0 }
                        ];
                        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                        // use PlayerStateManager if available
                        if (outcome.gold > 0) {
                            if (typeof PlayerStateManager !== 'undefined') {
                                PlayerStateManager.gold.add(outcome.gold, 'ancient_ruins');
                            } else {
                                game.player.gold += outcome.gold;
                            }
                        }
                        addMessage(outcome.msg);
                        updatePlayerInfo();
                    } else {
                        addMessage('You decide not to explore and continue your journey.');
                    }
                }
            },

            // --- HELPFUL ENCOUNTERS ---
            {
                type: 'rest_area',
                rarity: 'uncommon',
                regions: ['all'],
                message: 'You find a well-maintained rest area.',
                effect: () => {
                    addMessage('You take a short rest, recovering your energy.');
                    // Could restore stamina/health if implemented
                }
            },
            {
                type: 'helpful_local',
                rarity: 'common',
                regions: ['all'],
                message: 'A friendly local offers directions and advice.',
                effect: () => {
                    const chance = Math.random();
                    if (chance < 0.5) {
                        this.playerPosition.travelDuration *= 0.92;
                        addMessage('The local shows you a better route, reducing travel time by 8%!');
                    } else {
                        addMessage('The local shares interesting stories about the region.');
                    }
                }
            }
        ];

        // Filter encounters based on region (if specified) and condition
        //  Now also checks the condition function if present (for weather-aware events) 
        let availableEncounters = encounters.filter(enc => {
            // Check region
            const regionMatch = !enc.regions || enc.regions.includes('all') || enc.regions.includes(region);
            if (!regionMatch) return false;

            //  Check condition function if present (e.g., weather checks)
            if (enc.condition && typeof enc.condition === 'function') {
                return enc.condition();
            }
            return true;
        });

        // Weight encounters by rarity
        const weightedEncounters = [];
        availableEncounters.forEach(enc => {
            let weight = 1;
            switch (enc.rarity) {
                case 'common': weight = 10; break;
                case 'uncommon': weight = 5; break;
                case 'rare': weight = 2; break;
                case 'very_rare': weight = 1; break;
            }
            for (let i = 0; i < weight; i++) {
                weightedEncounters.push(enc);
            }
        });

        // Select random encounter
        const encounter = weightedEncounters[Math.floor(Math.random() * weightedEncounters.length)];

        // Trigger the encounter
        addMessage(`--- TRAVEL ENCOUNTER ---`);
        addMessage(encounter.message);
        encounter.effect();
    },

    // Trigger location-specific events
    triggerLocationEvents(location) {
        //  Guard against undefined systems - prevents crash on arrival 
        if (!location || !location.id) return;

        try {
            // Check for property ownership in this location
            if (typeof PropertySystem !== 'undefined' && PropertySystem.getPlayerProperties) {
                const properties = PropertySystem.getPlayerProperties().filter(p => p && p.location === location.id);
                if (properties.length > 0) {
                    addMessage(`You own ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} in this location.`);
                }
            }

            // Check for employees in this location
            if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.getPlayerEmployees &&
                typeof PropertySystem !== 'undefined' && PropertySystem.getProperty) {
                const employees = EmployeeSystem.getPlayerEmployees().filter(e => {
                    if (!e || !e.assignedProperty) return false;
                    const prop = PropertySystem.getProperty(e.assignedProperty);
                    return prop && prop.location === location.id;
                });
                if (employees.length > 0) {
                    addMessage(`${employees.length} employee${employees.length === 1 ? '' : 's'} working in this location.`);
                }
            }
        } catch (err) {
            console.warn('🖤 triggerLocationEvents error (non-fatal):', err.message);
        }
    },

    //  Dispatch location change event to update ALL relevant panels 
    // When you arrive somewhere new, everything must know about it
    dispatchLocationChangeEvent(destination) {
        // Dispatch custom event for any listeners
        document.dispatchEvent(new CustomEvent('player-location-changed', {
            detail: {
                locationId: destination.id,
                locationName: destination.name,
                locationType: destination.type
            }
        }));

        //  Update Market Panel - new location = new prices
        if (typeof MarketSystem !== 'undefined' && MarketSystem.updateMarketDisplay) {
            MarketSystem.updateMarketDisplay();
        }
        // Also try the global function
        if (typeof updateMarketDisplay === 'function') {
            updateMarketDisplay();
        }

        //  Update People Panel - new faces in new places
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.refresh) {
            PeoplePanel.refresh();
        }
        if (typeof NPCSystem !== 'undefined' && NPCSystem.updateNPCsForLocation) {
            NPCSystem.updateNPCsForLocation(destination.id);
        }

        //  Update Location Panel - show the new location info
        //  Call the ACTUAL global functions from game.js that update the location panel 
        if (typeof updateLocationInfo === 'function') {
            updateLocationInfo();
        }
        if (typeof updateLocationPanel === 'function') {
            updateLocationPanel();
        }
        // Also try LocationPanel object if it exists
        if (typeof LocationPanel !== 'undefined' && LocationPanel.update) {
            LocationPanel.update();
        }
        const locationNameEl = document.getElementById('current-location-name');
        if (locationNameEl) {
            locationNameEl.textContent = destination.name;
        }
        const locationTypeEl = document.getElementById('current-location-type');
        if (locationTypeEl && destination.type) {
            locationTypeEl.textContent = destination.type.charAt(0).toUpperCase() + destination.type.slice(1);
        }

        //  Update Travel Panel Map - sync the destination display
        if (typeof TravelPanelMap !== 'undefined') {
            TravelPanelMap.onTravelComplete();
            TravelPanelMap.render();
        }

        //  Update Property Panel if player owns property here
        if (typeof PropertyUI !== 'undefined' && PropertyUI.refresh) {
            PropertyUI.refresh();
        }

        //  Update Quest Tracker if quests are location-specific
        if (typeof QuestSystem !== 'undefined' && QuestSystem.checkLocationQuests) {
            QuestSystem.checkLocationQuests(destination.id);
        }

        console.log(`🖤 Location change event dispatched: ${destination.name}`);
    },

    // Update travel UI
    //  FIX: Don't destroy the entire travel panel - update only the destination display area 
    // This allows the panel tabs and structure to remain intact during travel
    updateTravelUI() {
        //  Prefer TravelPanelMap's display update if available - it's more sophisticated 
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.updateTravelProgressDisplay) {
            TravelPanelMap.updateTravelProgressDisplay();
            return;
        }

        //  Fallback: Update ONLY the destination display, NOT the entire panel 
        const displayEl = document.getElementById('current-destination-display');
        if (!displayEl) return;

        if (this.playerPosition.isTraveling) {
            const dest = this.playerPosition.destination;
            if (!dest) return;

            const progress = Math.round(this.playerPosition.travelProgress * 100);
            const remainingTime = this.formatTime(
                (this.playerPosition.travelDuration * (1 - this.playerPosition.travelProgress)) / 60
            );

            displayEl.innerHTML = `
                <div class="travel-in-progress">
                    <div class="travel-status-header">
                        <span class="travel-icon">🚶</span>
                        <h3>Traveling to ${dest.name}</h3>
                    </div>
                    <div class="travel-progress-container">
                        <div class="travel-progress-bar">
                            <div class="travel-progress-fill" style="width: ${progress}%">
                                <span class="travel-progress-marker">🚶</span>
                            </div>
                        </div>
                        <div class="travel-progress-labels">
                            <span class="progress-start">📍 Start</span>
                            <span class="progress-percent">${progress}%</span>
                            <span class="progress-end">🎯 ${dest.name}</span>
                        </div>
                    </div>
                    <div class="travel-time-info">
                        <span>⏱️ Time Remaining: ${remainingTime}</span>
                    </div>
                    <div class="travel-actions-during">
                        <button class="travel-btn-danger" onclick="TravelSystem.cancelTravel()">✕ Cancel Journey</button>
                    </div>
                </div>
            `;

            //  Switch to the Destination tab to show progress 
            const destTab = document.getElementById('destination-tab');
            const destBtn = document.querySelector('[data-travel-tab="destination"]');
            if (destTab && destBtn) {
                // Activate destination tab
                document.querySelectorAll('.travel-tab-content').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.travel-tab-btn').forEach(b => b.classList.remove('active'));
                destTab.classList.add('active');
                destBtn.classList.add('active');
            }
        } else {
            //  Not traveling - show "No Destination" message 
            displayEl.innerHTML = `
                <div class="no-destination">
                    <span class="no-dest-icon">🎯</span>
                    <h3>No Destination Set</h3>
                    <p>Click on a location in the Locations tab or Map to set a destination.</p>
                </div>
            `;
        }
    },

    // Update destinations list
    updateDestinationsList() {
        const travelPanel = document.getElementById('travel-panel');
        if (!travelPanel) return;
        
        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) return;
        
        let html = '<div class="destinations-list">';
        html += '<h3>Available Destinations</h3>';
        
        // Sort destinations by distance
        const destinations = Object.values(this.locations)
            .filter(loc => loc.id !== currentLoc.id)
            .sort((a, b) => {
                const distA = this.calculateDistance(currentLoc, a);
                const distB = this.calculateDistance(currentLoc, b);
                return distA - distB;
            });
        
        destinations.forEach(dest => {
            const travelInfo = this.calculateTravelInfo(dest);
            html += `
                <div class="destination-item">
                    <h4>${dest.name}</h4>
                    <p class="destination-type">${dest.type}</p>
                    <p class="travel-info">Distance: ${travelInfo.distance} miles | Time: ${travelInfo.timeDisplay}</p>
                    <button class="travel-btn" onclick="TravelSystem.startTravel('${dest.id}')">Travel</button>
                </div>
            `;
        });
        
        html += '</div>';
        travelPanel.innerHTML = html;
    },

    // Get current location
    getCurrentLocation() {
        //  First check TravelSystem's playerPosition.currentLocation
        if (this.playerPosition.currentLocation) {
            const loc = this.locations[this.playerPosition.currentLocation] ||
                   this.resourceNodes.find(n => n.id === this.playerPosition.currentLocation) ||
                   this.pointsOfInterest.find(p => p.id === this.playerPosition.currentLocation);
            if (loc) return loc;
        }

        //  CRITICAL: Also check game.currentLocation - this is often set but playerPosition isn't synced
        if (typeof game !== 'undefined' && game.currentLocation?.id) {
            const loc = this.locations[game.currentLocation.id] ||
                   this.resourceNodes.find(n => n.id === game.currentLocation.id) ||
                   this.pointsOfInterest.find(p => p.id === game.currentLocation.id);
            if (loc) {
                // Sync playerPosition with game.currentLocation
                this.playerPosition.currentLocation = game.currentLocation.id;
                return loc;
            }
        }

        // Find nearest location as fallback
        let nearestLocation = null;
        let minDistance = Infinity;

        for (const [id, location] of Object.entries(this.locations)) {
            const distance = Math.sqrt(
                Math.pow(this.playerPosition.x - location.x, 2) +
                Math.pow(this.playerPosition.y - location.y, 2)
            );
            if (distance < minDistance && distance < 50) {
                minDistance = distance;
                nearestLocation = location;
            }
        }

        //  If no location found, return starting location to prevent null crashes 
        if (!nearestLocation && this.locations) {
            // Try to find starting location or first available location
            nearestLocation = this.locations['driftwood_crossing'] ||
                             this.locations['village_square'] ||
                             Object.values(this.locations)[0] || null;
        }

        return nearestLocation;
    },

    // Update player position
    updatePlayerPosition() {
        // Initialize player position at current location
        if (game.currentLocation && game.currentLocation.id) {
            const location = this.locations[game.currentLocation.id];
            if (location) {
                this.playerPosition.x = location.x;
                this.playerPosition.y = location.y;
                this.playerPosition.currentLocation = location.id;
                
                // Auto-focus on player when position updates
                this.autoFocusOnPlayer();
            }
        }
    },

    // Render the map
    // NOTE: Canvas-based rendering is DISABLED - we now use GameWorldRenderer (HTML-based)
    // and TravelPanelMap (HTML-based) for all map displays. This function is kept as a
    // no-op to prevent errors from existing calls throughout the codebase.
    render() {
        // GameWorldRenderer and TravelPanelMap handle map display
        // To update the travel panel map, use: TravelPanelMap.render()
        // To update the main map, use: GameWorldRenderer.render()
        return;
    },

    // Render terrain background
    renderTerrain() {
        // Simple terrain rendering - in a full implementation, this would be more detailed
        const gradient = this.ctx.createLinearGradient(0, 0, this.worldMap.width, this.worldMap.height);
        gradient.addColorStop(0, '#8B7355'); // Brown
        gradient.addColorStop(0.3, '#90EE90'); // Light green
        gradient.addColorStop(0.6, '#228B22'); // Forest green
        gradient.addColorStop(0.8, '#8B7355'); // Brown
        gradient.addColorStop(1, '#F0E68C'); // Khaki
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.worldMap.width, this.worldMap.height);
    },

    // Render paths between locations
    renderPaths() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        
        this.paths.forEach(path => {
            this.ctx.beginPath();
            path.points.forEach((point, index) => {
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        });
    },

    // Render resource nodes - now scales with zoom like everything else should
    renderResourceNodes() {
        const zoom = this.worldMap.zoom;
        const zoomCompensation = 1 / zoom;
        const bonusFactor = zoom < 1 ? 1.3 : (zoom > 1.5 ? 0.8 : 1.0);
        const scaleFactor = Math.max(0.5, Math.min(2.5, zoomCompensation * bonusFactor));

        this.resourceNodes.forEach(node => {
            // Draw resource area - scales with zoom
            this.ctx.fillStyle = this.getResourceColor(node.type);
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * scaleFactor, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw resource icon - scales with zoom so you can see it from orbit
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillStyle = '#000000';
            const iconSize = Math.floor(20 * scaleFactor);
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.getResourceIcon(node.type), node.x, node.y);
        });
    },

    // Get resource color
    getResourceColor(type) {
        const colors = {
            forest: '#228B22',
            mine: '#696969',
            herb: '#90EE90'
        };
        return colors[type] || '#808080';
    },

    // Get resource icon
    getResourceIcon(type) {
        const icons = {
            forest: '🌲',
            mine: '',
            herb: '🌿'
        };
        return icons[type] || '💎';
    },

    // Render locations - now with zoom-aware scaling so you can actually READ them
    renderLocations() {
        const zoom = this.worldMap.zoom;
        // Scale factor: keeps icons READABLE at all zoom levels
        // When zoomed OUT, icons appear LARGER on screen so they're visible
        const zoomCompensation = 1 / zoom;
        const bonusFactor = zoom < 1 ? 1.3 : (zoom > 1.5 ? 0.8 : 1.0);
        const scaleFactor = Math.max(0.5, Math.min(2.5, zoomCompensation * bonusFactor));

        Object.values(this.locations).forEach(location => {
            const isSelected = this.mapInteraction.selectedLocation === location;
            const isHovered = this.mapInteraction.hoveredLocation === location;

            // Draw location marker - scales with zoom for visibility
            this.ctx.fillStyle = this.getLocationColor(location.type);
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#000000';
            this.ctx.lineWidth = (isSelected ? 3 : 1.5) * scaleFactor;

            const baseSize = this.getLocationSize(location.size);
            const size = baseSize * scaleFactor;

            // Golden glow for selected locations - like a beacon in the darkness
            if (isSelected) {
                this.ctx.beginPath();
                this.ctx.arc(location.x, location.y, size + 8 * scaleFactor, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
                this.ctx.fill();
            }

            this.ctx.beginPath();
            this.ctx.arc(location.x, location.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getLocationColor(location.type);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw location icon emoji in center - scales with zoom
            const icon = this.getLocationIcon(location.type);
            const iconSize = Math.floor(size * 1.3);
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(icon, location.x, location.y);

            // Only draw text labels when zoomed in enough to read them
            if (zoom >= 0.6) {
                // Draw location name with outline for readability
                const fontSize = Math.max(10, Math.floor(14 * scaleFactor));
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3 * scaleFactor;
                this.ctx.font = isHovered ? `bold ${fontSize}px Arial` : `${fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';

                const nameY = location.y + size + 5 * scaleFactor;
                this.ctx.strokeText(location.name, location.x, nameY);
                this.ctx.fillText(location.name, location.x, nameY);
            }
        });
    },

    // Get location icon emoji - for visual flair in the void
    getLocationIcon(type) {
        const icons = {
            city: '🏰',
            town: '🏘️',
            village: '🏠',
            capital: '👑',
            port: '⚓',
            mine: '',
            forest: '🌲',
            farm: '🌾',
            inn: '🍺',
            dungeon: '💀',
            ruins: '🏛️',
            outpost: '🛡️'
        };
        return icons[type] || '📍';
    },

    // Get location color
    getLocationColor(type) {
        const colors = {
            city: '#FF6B6B',
            town: '#4ECDC4',
            village: '#95E77E'
        };
        return colors[type] || '#808080';
    },

    // Get location size
    getLocationSize(size) {
        const sizes = {
            large: 15,
            medium: 12,
            small: 8
        };
        return sizes[size] || 10;
    },

    // Render points of interest - scales with zoom for visibility
    renderPointsOfInterest() {
        const zoom = this.worldMap.zoom;
        const zoomCompensation = 1 / zoom;
        const bonusFactor = zoom < 1 ? 1.3 : (zoom > 1.5 ? 0.8 : 1.0);
        const scaleFactor = Math.max(0.5, Math.min(2.5, zoomCompensation * bonusFactor));

        this.pointsOfInterest.forEach(poi => {
            if (poi.hidden && !poi.discovered) return;

            const isHovered = this.mapInteraction.hoveredLocation === poi;

            // Draw POI marker - scales with zoom
            this.ctx.fillStyle = '#FFA500';
            this.ctx.strokeStyle = isHovered ? '#FFD700' : '#000000';
            this.ctx.lineWidth = (isHovered ? 2 : 1) * scaleFactor;

            const poiSize = 8 * scaleFactor;
            this.ctx.beginPath();
            this.ctx.arc(poi.x, poi.y, poiSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw POI icon - scales with zoom
            const iconSize = Math.floor(16 * scaleFactor);
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(poi.icon, poi.x, poi.y);
        });
    },

    // Render player position - scales with zoom so you can find yourself
    renderPlayer() {
        const zoom = this.worldMap.zoom;
        const zoomCompensation = 1 / zoom;
        const bonusFactor = zoom < 1 ? 1.3 : (zoom > 1.5 ? 0.8 : 1.0);
        const scaleFactor = Math.max(0.5, Math.min(2.5, zoomCompensation * bonusFactor));

        this.ctx.fillStyle = '#FF1493';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2 * scaleFactor;

        // Draw player as a triangle pointing in travel direction - scaled
        const triSize = 10 * scaleFactor;
        const triHalf = 5 * scaleFactor;

        this.ctx.beginPath();
        if (this.playerPosition.isTraveling && this.playerPosition.destination) {
            // Point towards destination
            const angle = Math.atan2(
                this.playerPosition.destination.y - this.playerPosition.y,
                this.playerPosition.destination.x - this.playerPosition.x
            );
            this.ctx.save();
            this.ctx.translate(this.playerPosition.x, this.playerPosition.y);
            this.ctx.rotate(angle);
            this.ctx.moveTo(triSize, 0);
            this.ctx.lineTo(-triHalf, -triHalf);
            this.ctx.lineTo(-triHalf, triHalf);
            this.ctx.closePath();
            this.ctx.restore();
        } else {
            // Static triangle - scales with zoom
            this.ctx.moveTo(this.playerPosition.x + triSize, this.playerPosition.y);
            this.ctx.lineTo(this.playerPosition.x - triHalf, this.playerPosition.y - triHalf);
            this.ctx.lineTo(this.playerPosition.x - triHalf, this.playerPosition.y + triHalf);
            this.ctx.closePath();
        }
        this.ctx.fill();
        this.ctx.stroke();
    },
    
    // Auto-focus camera on player with delayed snap-back
    autoFocusOnPlayer() {
        if (!this.playerPosition.x || !this.playerPosition.y) return;
        
        const targetX = this.playerPosition.x;
        const targetY = this.playerPosition.y;
        
        // Calculate screen position for player
        const screenPos = this.worldToScreen(targetX, targetY);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Calculate offset to center player on screen
        const targetOffsetX = centerX - screenPos.x;
        const targetOffsetY = centerY - screenPos.y;
        
        // Smooth camera movement to player
        this.smoothCameraMove(targetOffsetX, targetOffsetY);
        
        // Set timer to snap back after 10 seconds
        TimerManager.setTimeout(() => {
            this.snapCameraBack();
        }, 10000);
    },
    
    // Smooth camera movement
    smoothCameraMove(targetOffsetX, targetOffsetY) {
        const steps = 30; // Number of steps for smooth movement
        let currentStep = 0;
        
        const moveStep = () => {
            if (currentStep >= steps) {
                return; // Stop when movement complete
            }
            
            const progress = currentStep / steps;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            this.worldMap.offsetX += (targetOffsetX - this.worldMap.offsetX) * easeProgress / steps;
            this.worldMap.offsetY += (targetOffsetY - this.worldMap.offsetY) * easeProgress / steps;
            
            this.render();
            currentStep++;
            
            if (currentStep < steps) {
                requestAnimationFrame(moveStep);
            }
        };
        
        requestAnimationFrame(moveStep);
    },
    
    // Snap camera back to original position
    snapCameraBack() {
        const steps = 20; // Number of steps for smooth snap-back
        let currentStep = 0;
        
        const snapStep = () => {
            if (currentStep >= steps) {
                return; // Stop when movement complete
            }
            
            const progress = currentStep / steps;
            const easeProgress = 1 - Math.pow(1 - progress, 2); // Ease out quadratic
            
            // Gradually return to original position (centered on player but with some offset)
            const targetOffsetX = -this.playerPosition.x * this.worldMap.zoom + this.canvas.width / 2 - 100;
            const targetOffsetY = -this.playerPosition.y * this.worldMap.zoom + this.canvas.height / 2 - 100;
            
            this.worldMap.offsetX += (targetOffsetX - this.worldMap.offsetX) * easeProgress / steps;
            this.worldMap.offsetY += (targetOffsetY - this.worldMap.offsetY) * easeProgress / steps;
            
            this.render();
            currentStep++;
            
            if (currentStep < steps) {
                requestAnimationFrame(snapStep);
            }
        };
        
        requestAnimationFrame(snapStep);
    },

    // Render tooltip with smooth animations
    renderTooltip() {
        let tooltipElement = document.getElementById('map-tooltip');
        
        if (!this.mapInteraction.tooltip.visible) {
            // Hide tooltip with fade out
            if (tooltipElement) {
                tooltipElement.style.opacity = '0';
                TimerManager.setTimeout(() => {
                    if (tooltipElement) {
                        tooltipElement.style.display = 'none';
                    }
                }, 300);
            }
            return;
        }
        
        const tooltip = this.mapInteraction.tooltip;
        
        // Create tooltip element if it doesn't exist
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.id = 'map-tooltip';
            tooltipElement.className = 'map-tooltip-container';
            document.body.appendChild(tooltipElement);
            
            // Add CSS for smooth transitions
            const style = document.createElement('style');
            style.textContent = `
                .map-tooltip-container {
                    position: fixed;
                    background: linear-gradient(135deg, rgba(30, 60, 90, 0.95), rgba(20, 40, 60, 0.95));
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    pointer-events: none;
                    z-index: 800; /* Z-INDEX STANDARD: Tooltips (map) */
                    max-width: 300px;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .map-tooltip-container h3 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #4ECDC4;
                }
                
                .map-tooltip-container .location-type {
                    margin: 0 0 8px 0;
                    font-size: 12px;
                    color: #95E77E;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .map-tooltip-container .description {
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    color: #E0E0E0;
                    line-height: 1.4;
                }
                
                .map-tooltip-container .location-info,
                .map-tooltip-container .resource-info,
                .map-tooltip-container .services-info {
                    margin: 8px 0 0 0;
                    padding: 8px 0 0 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .map-tooltip-container p {
                    margin: 4px 0;
                    font-size: 12px;
                }
                
                .map-tooltip-container strong {
                    color: #FFD700;
                    font-weight: 600;
                }
                
                .map-tooltip-container ul {
                    margin: 4px 0;
                    padding-left: 16px;
                }
                
                .map-tooltip-container li {
                    margin: 2px 0;
                    font-size: 12px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Update tooltip content
        tooltipElement.innerHTML = tooltip.content;
        
        // Get canvas position for accurate tooltip positioning
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Calculate position relative to canvas
        let left = canvasRect.left + tooltip.x + 10;
        let top = canvasRect.top + tooltip.y - 10;
        
        // Apply initial position to get dimensions
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
        tooltipElement.style.display = 'block';
        
        // Get tooltip dimensions after content is set
        const tooltipRect = tooltipElement.getBoundingClientRect();
        
        // Adjust if tooltip would go off screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = canvasRect.left + tooltip.x - tooltipRect.width - 10;
        }
        
        if (top + tooltipRect.height > window.innerHeight) {
            top = canvasRect.top + tooltip.y - tooltipRect.height - 10;
        }
        
        // Apply final position
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
        
        // Show tooltip with fade in
        TimerManager.setTimeout(() => {
            tooltipElement.style.opacity = '1';
        }, 10);
    },

    // Resource gathering system
    gatherResource(resourceNodeId, resourceType) {
        const node = this.resourceNodes.find(n => n.id === resourceNodeId);
        if (!node) {
            addMessage('Resource node not found!');
            return false;
        }
        
        if (!node.resources.includes(resourceType)) {
            addMessage('This resource is not available here!');
            return false;
        }
        
        // Check skill requirements
        const requiredSkill = node.skillRequirements[resourceType] || 0;
        const playerSkill = this.getPlayerGatheringSkill(resourceType);
        
        if (playerSkill < requiredSkill) {
            addMessage(`You need gathering skill level ${requiredSkill} to gather ${this.getItemName(resourceType)}!`);
            return false;
        }
        
        // Calculate yield
        const abundance = node.abundance[resourceType] || 0.5;
        const skillBonus = 1 + (playerSkill * 0.1);
        const yield = Math.floor(abundance * 10 * skillBonus);
        
        // Check inventory capacity
        const itemWeight = this.getResourceWeight(resourceType);
        const totalWeight = yield * itemWeight;
        
        if (game.player.inventory.currentWeight + totalWeight > game.player.inventory.capacity) {
            addMessage('Not enough inventory capacity!');
            return false;
        }
        
        // add resource to inventory via PlayerStateManager if available
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.add(resourceType, yield, 'travel_forage');
        } else {
            if (!game.player.inventory[resourceType]) {
                game.player.inventory[resourceType] = 0;
            }
            game.player.inventory[resourceType] += yield;

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:added', {
                    itemId: resourceType,
                    quantity: yield,
                    newTotal: game.player.inventory[resourceType],
                    reason: 'travel_forage'
                });
            }
        }

        // Emit item-received for quest progress tracking
        document.dispatchEvent(new CustomEvent('item-received', {
            detail: { item: resourceType, quantity: yield, source: 'travel_forage' }
        }));
        game.player.inventory.currentWeight += totalWeight;

        // Reduce resource abundance (depletion)
        node.abundance[resourceType] *= 0.9;
        
        // Gain experience
        this.gainGatheringExperience(resourceType, yield);
        
        addMessage(`Gathered ${yield} ${this.getItemName(resourceType)}!`);
        
        // Update UI
        updateInventoryDisplay();
        
        return true;
    },

    // Get player gathering skill
    getPlayerGatheringSkill(resourceType) {
        // This would integrate with the existing skill system
        // For now, return a basic value based on player level
        return Math.min(5, Math.floor(game.player.level / 2));
    },

    // Get resource weight
    getResourceWeight(resourceType) {
        const weights = {
            wood: 5,
            planks: 3,
            herbs: 0.5,
            rare_wood: 8,
            mushrooms: 0.3,
            iron_ore: 10,
            coal: 8,
            stone: 15,
            gold_ore: 12,
            silver_ore: 10,
            gems: 1,
            medicinal_plants: 0.5,
            rare_herbs: 0.3,
            ancient_artifacts: 5,
            rare_gems: 1,
            lost_knowledge: 0.1,
            rare_minerals: 8,
            crystals: 2,
            underground_herbs: 0.5
        };
        return weights[resourceType] || 5;
    },

    // Gain gathering experience
    gainGatheringExperience(resourceType, amount) {
        const expGain = amount * 2;
        game.player.experience = (game.player.experience || 0) + expGain;
        
        // Check for level up
        const expNeeded = game.player.level * 100;
        if (game.player.experience >= expNeeded) {
            game.player.level++;
            game.player.experience -= expNeeded;
            addMessage(`You reached level ${game.player.level}!`);
        }
        
        updatePlayerInfo();
    },

    // Save travel system state
    saveState() {
        return {
            playerPosition: this.playerPosition,
            travelHistory: this.travelHistory,
            favoriteRoutes: this.favoriteRoutes,
            resourceNodes: this.resourceNodes,
            pointsOfInterest: this.pointsOfInterest,
            //  Doom World state 
            currentWorld: this.currentWorld,
            discoveredPaths: Array.from(this.discoveredPaths),
            doomDiscoveredPaths: Array.from(this.doomDiscoveredPaths),
            //  Encounter daily limits - persist across saves 
            _encountersToday: this._encountersToday,
            _lastEncounterDay: this._lastEncounterDay
        };
    },

    // Load travel system state
    loadState(state) {
        if (state.playerPosition) {
            this.playerPosition = state.playerPosition;
        }
        if (state.travelHistory) {
            this.travelHistory = state.travelHistory;
        }
        if (state.favoriteRoutes) {
            this.favoriteRoutes = state.favoriteRoutes;
        }
        if (state.resourceNodes) {
            this.resourceNodes = state.resourceNodes;
        }
        if (state.pointsOfInterest) {
            this.pointsOfInterest = state.pointsOfInterest;
        }
        //  Load Doom World state 
        if (state.currentWorld) {
            this.currentWorld = state.currentWorld;
            this.saveCurrentWorld(); // Sync to localStorage
        }
        if (state.discoveredPaths) {
            this.discoveredPaths = new Set(state.discoveredPaths);
            this.saveDiscoveredPaths(); // Sync to localStorage
        }
        if (state.doomDiscoveredPaths) {
            this.doomDiscoveredPaths = new Set(state.doomDiscoveredPaths);
            this.saveDoomDiscoveredPaths(); // Sync to localStorage
        }
        //  Load encounter daily limits - no more save/load exploits! 
        if (typeof state._encountersToday === 'number') {
            this._encountersToday = state._encountersToday;
        }
        if (typeof state._lastEncounterDay === 'number') {
            this._lastEncounterDay = state._lastEncounterDay;
        }
    }
};

// register with Bootstrap - dependencies ensure game exists
Bootstrap.register('TravelSystem', () => TravelSystem.init(), {
    dependencies: ['game', 'GameWorld', 'EventBus'],
    priority: 20,
    severity: 'required'
});

// Show travel panel function
TravelSystem.showTravelPanel = function() {
    const travelPanel = document.getElementById('travel-panel');
    if (travelPanel) {
        travelPanel.classList.remove('hidden');

        //  Smart tab selection: show destinations if we have one, otherwise map 
        // The void guides the traveler to choose their fate first
        // Check both TravelPanelMap and GameWorldRenderer for destination (they sync with each other)
        const hasDestinationInPanel = typeof TravelPanelMap !== 'undefined' && TravelPanelMap.currentDestination;
        const hasDestinationInWorld = typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.currentDestination;
        const hasDestination = hasDestinationInPanel || hasDestinationInWorld;
        const defaultTab = hasDestination ? 'destinations' : 'map';

        // Update tab buttons 
        document.querySelectorAll('.travel-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-travel-tab="${defaultTab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update tab content visibility 
        document.querySelectorAll('.travel-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeTab = document.getElementById(`${defaultTab}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Render the mini map (needed for map tab, and keeps it ready)
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
            setTimeout(() => {
                TravelPanelMap.render();
                // Center on player when opening map tab
                if (defaultTab === 'map' && TravelPanelMap.centerOnPlayer) {
                    TravelPanelMap.centerOnPlayer();
                }
            }, 50);
        }

        // Populate the destinations list (Locations tab)
        if (typeof populateDestinations === 'function') {
            populateDestinations();
        }
    }
};

// Hide travel panel function
TravelSystem.hideTravelPanel = function() {
    const travelPanel = document.getElementById('travel-panel');
    if (travelPanel) {
        travelPanel.classList.add('hidden');
    }
};

// Setup map in travel tab
TravelSystem.setupMapInTab = function() {
    // Check if map canvas exists in travel panel
    let mapCanvas = document.querySelector('#map-tab canvas');
    if (!mapCanvas) {
        // Create canvas for map in travel tab
        const mapTab = document.getElementById('map-tab');
        if (mapTab) {
            mapCanvas = document.createElement('canvas');
            mapCanvas.width = 600;
            mapCanvas.height = 400;
            mapCanvas.style.width = '100%';
            mapCanvas.style.height = '400px';
            mapCanvas.style.border = '1px solid #ccc';
            mapCanvas.style.cursor = 'grab';
            mapTab.appendChild(mapCanvas);
        }
    }
    
    if (mapCanvas) {
        // Setup event listeners for this canvas
        const originalCanvas = this.canvas;
        const originalCtx = this.ctx;
        
        this.canvas = mapCanvas;
        this.ctx = mapCanvas.getContext('2d');
        
        // Setup event listeners for the new canvas
        this.setupEventListeners();
        
        // Update player position and render
        this.updatePlayerPosition();
        this.render();
        
        // Restore original canvas reference
        this.originalCanvas = originalCanvas;
        this.originalCtx = originalCtx;
    }
};

// Update function to handle switching between canvases
TravelSystem.switchToOverlayCanvas = function() {
    if (this.originalCanvas) {
        this.canvas = this.originalCanvas;
        this.ctx = this.originalCtx;
        this.setupEventListeners();
        this.updatePlayerPosition();
        this.render();
    }
};

TravelSystem.switchToTabCanvas = function() {
    const tabCanvas = document.querySelector('#map-tab canvas');
    if (tabCanvas) {
        this.canvas = tabCanvas;
        this.ctx = tabCanvas.getContext('2d');
        this.setupEventListeners();
        this.updatePlayerPosition();
        this.render();
    }
};

// Zoom in toward player's location
TravelSystem.zoomIn = function() {
    // Try to ensure we have a canvas - check overlay first, then tab canvas
    if (!this.canvas) {
        this.canvas = document.getElementById('world-map-overlay-canvas') ||
                      document.querySelector('#map-tab canvas') ||
                      document.getElementById('world-map-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    if (!this.worldMap || !this.canvas) {
        console.warn('🖤 TravelSystem.zoomIn: No worldMap or canvas... zooming into the void alone');
        return;
    }

    // Get player's position for zoom focus
    let focusX = this.canvas.width / 2;
    let focusY = this.canvas.height / 2;

    if (this.playerPosition && this.playerPosition.x && this.playerPosition.y) {
        // Convert player world coords to screen coords
        focusX = this.playerPosition.x * this.worldMap.zoom + this.worldMap.offsetX;
        focusY = this.playerPosition.y * this.worldMap.zoom + this.worldMap.offsetY;
    }

    const zoomFactor = 1.2;
    const newZoom = Math.min(this.worldMap.maxZoom || 4, this.worldMap.zoom * zoomFactor);

    // Adjust offset to zoom toward the player's location
    const zoomRatio = newZoom / this.worldMap.zoom;
    this.worldMap.offsetX = focusX - (focusX - this.worldMap.offsetX) * zoomRatio;
    this.worldMap.offsetY = focusY - (focusY - this.worldMap.offsetY) * zoomRatio;

    this.worldMap.zoom = newZoom;
    this.render();
    console.log('🔍 Zoomed deeper into the abyss:', (this.worldMap.zoom * 100).toFixed(0) + '%');
};

// Zoom out from player's location
TravelSystem.zoomOut = function() {
    // Try to ensure we have a canvas - check overlay first, then tab canvas
    if (!this.canvas) {
        this.canvas = document.getElementById('world-map-overlay-canvas') ||
                      document.querySelector('#map-tab canvas') ||
                      document.getElementById('world-map-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    if (!this.worldMap || !this.canvas) {
        console.warn('🖤 TravelSystem.zoomOut: No worldMap or canvas... zooming away from nothing');
        return;
    }

    // Get player's position for zoom focus
    let focusX = this.canvas.width / 2;
    let focusY = this.canvas.height / 2;

    if (this.playerPosition && this.playerPosition.x && this.playerPosition.y) {
        // Convert player world coords to screen coords
        focusX = this.playerPosition.x * this.worldMap.zoom + this.worldMap.offsetX;
        focusY = this.playerPosition.y * this.worldMap.zoom + this.worldMap.offsetY;
    }

    const zoomFactor = 0.8;
    const newZoom = Math.max(this.worldMap.minZoom || 0.3, this.worldMap.zoom * zoomFactor);

    // Adjust offset to zoom away from the player's location
    const zoomRatio = newZoom / this.worldMap.zoom;
    this.worldMap.offsetX = focusX - (focusX - this.worldMap.offsetX) * zoomRatio;
    this.worldMap.offsetY = focusY - (focusY - this.worldMap.offsetY) * zoomRatio;

    this.worldMap.zoom = newZoom;
    this.render();
    console.log('🔭 Pulled back from reality:', (this.worldMap.zoom * 100).toFixed(0) + '% - seeing the bigger picture of nothingness');
};

// Reset view and center on player
TravelSystem.resetView = function() {
    if (this.autoFocusOnPlayer) {
        this.autoFocusOnPlayer();
    }
    console.log('🎯 Reality snapped back to focus on you... you\'re welcome');
};

// Note: TravelSystem.update() is now called directly from game.js update loop
// No need for the old game.update patch - the proper update method handles everything