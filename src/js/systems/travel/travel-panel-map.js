// 
// TRAVEL PANEL MAP - choosing your next destination
// 
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// 

const TravelPanelMap = {
    //  DOM elements
    container: null,
    mapElement: null,
    tooltipElement: null,

    //  Bound event listeners for cleanup 
    _boundMouseMove: null,
    _boundMouseUp: null,
    _boundTouchMove: null,
    _boundTouchEnd: null,
    _boundLocationChanged: null,

    //  Map state (similar to GameWorldRenderer but scaled for mini view)
    mapState: {
        zoom: 0.6,           // Start more zoomed out for overview
        offsetX: 0,
        offsetY: 0,
        minZoom: 0.3,        // Allow more zoom out for overview
        maxZoom: 2,          // Less max zoom than main map
        defaultZoom: 0.6,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastOffsetX: 0,
        lastOffsetY: 0
    },

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL MODE DETECTION - Are we in baby's first map?
    //  Checks game.inTutorial to switch between main world and tutorial world
    // ═══════════════════════════════════════════════════════════════
    isInTutorialMode() {
        return typeof game !== 'undefined' && game.inTutorial === true;
    },

    // Get the right locations object based on current mode
    // Tutorial mode uses TutorialWorld's isolated pocket dimension
    getActiveLocations() {
        if (this.isInTutorialMode() && typeof TutorialWorld !== 'undefined') {
            return TutorialWorld.locations || {};
        }
        return (typeof GameWorld !== 'undefined' && GameWorld.locations) ? GameWorld.locations : {};
    },

    //  Current destination
    currentDestination: null,

    //  Location styles - delegated to MapRendererBase, with smaller sizes for mini map
    //  Uses shared styles from MapRendererBase.LOCATION_STYLES with 0.8x size multiplier
    get locationStyles() {
        const styles = {};
        const sizeMultiplier = 0.8; // mini map uses smaller icons
        if (typeof MapRendererBase !== 'undefined') {
            Object.entries(MapRendererBase.LOCATION_STYLES).forEach(([type, base]) => {
                styles[type] = {
                    color: base.color,
                    icon: base.icon,
                    size: Math.round(base.baseSize * sizeMultiplier)
                };
            });
        }
        return styles;
    },

    //  Initialize the mini-map
    init() {
        console.log('🗺️ TravelPanelMap: Initializing...');

        this.container = document.getElementById('travel-mini-map-container');
        if (!this.container) {
            console.warn('🗺️ Travel mini-map container not found, will retry later');
            return false;
        }

        // Create the map element
        this.createMapElement();

        // Create tooltip
        this.createTooltip();

        // Setup event listeners
        this.setupEventListeners();

        // Setup tab switching
        this.setupTabSwitching();

        // Setup destination tab functionality
        this.setupDestinationTab();

        console.log('🗺️ TravelPanelMap: Ready!');
        return true;
    },

    //  Create the map container element
    createMapElement() {
        this.mapElement = document.getElementById('travel-mini-map');
        if (!this.mapElement) {
            this.mapElement = document.createElement('div');
            this.mapElement.id = 'travel-mini-map';
            this.mapElement.className = 'travel-mini-map';
            this.container.insertBefore(this.mapElement, this.container.firstChild);
        }

        // ═══════════════════════════════════════════════════════════════
        //  TUTORIAL MAP BACKGROUND - Pretty painted terrain for noobs
        //  When in tutorial mode, we load the tutorial-map-bg.png instead
        //  of the generic dark gradient. Makes the pocket dimension feel real.
        // ═══════════════════════════════════════════════════════════════
        const isTutorial = this.isInTutorialMode();
        const backgroundStyle = isTutorial
            ? `background-image: url('assets/images/tutorial-map-bg.png'); background-size: cover; background-position: center;`
            : `background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);`;

        // Style the map element
        this.mapElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 800px;
            height: 600px;
            ${backgroundStyle}
            transform-origin: 0 0;
            cursor: grab;
            user-select: none;
            border-radius: 8px;
        `;
    },

    //  Create tooltip element
    createTooltip() {
        this.tooltipElement = document.getElementById('travel-map-tooltip');
        if (!this.tooltipElement) {
            this.tooltipElement = document.createElement('div');
            this.tooltipElement.id = 'travel-map-tooltip';
            this.tooltipElement.className = 'travel-map-tooltip';
            document.body.appendChild(this.tooltipElement);
        }

        this.tooltipElement.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid #4fc3f7;
            font-size: 13px;
            max-width: 280px;
            z-index: 800; /* Z-INDEX STANDARD: Tooltips (map hover) */
            pointer-events: none;
            display: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        `;
    },

    //  Setup event listeners
    setupEventListeners() {
        //  Store bound listeners for cleanup 
        this._boundMouseMove = (e) => this.onMouseMove(e);
        this._boundMouseUp = (e) => this.onMouseUp(e);
        this._boundTouchMove = (e) => this.onTouchMove(e);
        this._boundTouchEnd = (e) => this.onTouchEnd(e);
        this._boundLocationChanged = () => {
            console.log('🗺️ TravelPanelMap: Location changed, re-rendering map...');
            this.render();
        };

        // Map dragging
        this.mapElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('mouseup', this._boundMouseUp);

        // Zoom with scroll wheel
        this.container.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Touch support
        this.mapElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', this._boundTouchMove, { passive: false });
        document.addEventListener('touchend', this._boundTouchEnd);

        //  Listen for location changes to update map (tooltips, explored status) 
        document.addEventListener('player-location-changed', this._boundLocationChanged);
        document.addEventListener('location-changed', () => {
            console.log('🗺️ TravelPanelMap: Location changed (legacy event), re-rendering map...');
            this.render();
        });

        //  Listen for quest tracking events to update quest marker on mini map 
        document.addEventListener('quest-tracked', () => {
            console.log('🗺️ TravelPanelMap: Quest tracked, updating quest marker...');
            this.updateQuestMarker();
        });
        document.addEventListener('quest-untracked', () => {
            console.log('🗺️ TravelPanelMap: Quest untracked, removing quest marker...');
            // Clean up mini-map quest markers
            document.querySelectorAll('.floating-quest-marker-mini, .quest-glow-mini, .quest-marker-mini').forEach(el => el.remove());
            document.querySelectorAll('.mini-map-location.quest-target-glow').forEach(el => {
                el.classList.remove('quest-target-glow');
                el.style.boxShadow = '';
                el.style.animation = '';
            });
        });

        console.log('🗺️ TravelPanelMap: Event listeners attached');
    },

    //  Setup tab switching for travel panel
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.travel-tab-btn[data-travel-tab]');
        const tabContents = document.querySelectorAll('.travel-tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.dataset.travelTab;
                if (!tabName) return;

                // Update button states
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content visibility
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                const targetTab = document.getElementById(`${tabName}-tab`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }

                // Render map when map tab is shown
                if (tabName === 'map') {
                    setTimeout(() => {
                        this.render();
                        this.centerOnPlayer();
                        //  Update travel marker if currently traveling 
                        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
                            const progress = TravelSystem.playerPosition.travelProgress || 0;
                            this.updateTravelMarker(progress);
                        }
                    }, 50);
                }

                // Update destination tab when shown
                if (tabName === 'destination') {
                    this.updateDestinationDisplay();
                }

                // Update destinations/locations list when shown
                if (tabName === 'destinations') {
                    if (typeof populateDestinations === 'function') {
                        populateDestinations();
                    }
                }

                // Update history tab when shown
                if (tabName === 'history') {
                    if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.updateHistoryPanel) {
                        GameWorldRenderer.updateHistoryPanel();
                    }
                }
            });
        });
    },

    //  Setup destination tab functionality
    setupDestinationTab() {
        // Travel Now button
        const travelBtn = document.getElementById('travel-to-destination-btn');
        if (travelBtn) {
            travelBtn.addEventListener('click', () => {
                if (this.currentDestination) {
                    this.travelToDestination();
                }
            });
        }

        // Clear button
        const clearBtn = document.getElementById('clear-destination-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearDestination();
            });
        }
    },

    //  Render the map
    render() {
        // ═══════════════════════════════════════════════════════════════
        //  TUTORIAL MODE AWARE RENDERING - Uses the right world data
        //  In tutorial mode we pull from TutorialWorld's pocket dimension
        //  instead of the main GameWorld. Same map, different locations.
        // ═══════════════════════════════════════════════════════════════
        const locations = this.getActiveLocations();
        if (!this.mapElement || Object.keys(locations).length === 0) {
            console.warn('🗺️ TravelPanelMap: Cannot render - map element not ready or no locations');
            return;
        }

        // Refresh the map background in case we switched modes
        this.updateMapBackground();

        // Clear existing locations
        this.mapElement.innerHTML = '';

        // Calculate which locations are visible/explored (use GameWorldRenderer's logic if available)
        const visibilityMap = this.calculateLocationVisibility();

        // Draw connection lines first
        this.drawConnections(visibilityMap);

        // Calculate label offsets
        const visibleLocations = {};
        Object.entries(locations).forEach(([id, loc]) => {
            if (visibilityMap[id] && visibilityMap[id] !== 'hidden') {
                visibleLocations[id] = loc;
            }
        });
        const labelOffsets = this.calculateLabelOffsets(visibleLocations);

        // Draw each location
        Object.values(locations).forEach(location => {
            const visibility = visibilityMap[location.id] || 'hidden';
            if (visibility !== 'hidden') {
                const offset = labelOffsets[location.id] || 0;
                this.createLocationElement(location, offset, visibility);
            }
        });

        // Draw region labels - skip for tutorial mode (simpler map)
        if (!this.isInTutorialMode()) {
            this.drawRegionLabels();
        }

        // Apply current transform
        this.updateTransform();

        // Mark current location and destination
        this.highlightCurrentLocation();
        this.highlightDestination();

        //  Update quest marker on mini map after render
        this.updateQuestMarker();
    },

    // ═══════════════════════════════════════════════════════════════
    //  UPDATE MAP BACKGROUND - Swap between tutorial and main world
    //  Called during render to handle mode switches mid-game
    // ═══════════════════════════════════════════════════════════════
    updateMapBackground() {
        if (!this.mapElement) return;

        const isTutorial = this.isInTutorialMode();
        if (isTutorial) {
            this.mapElement.style.backgroundImage = `url('assets/images/tutorial-map-bg.png')`;
            this.mapElement.style.backgroundSize = 'cover';
            this.mapElement.style.backgroundPosition = 'center';
            this.mapElement.style.background = ''; // Clear gradient
        } else {
            this.mapElement.style.backgroundImage = '';
            this.mapElement.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        }
    },

    //  Draw large region labels on the map 
    drawRegionLabels() {
        if (typeof GameWorld === 'undefined' || !GameWorld.regions) return;

        // Region label positions - calculated center of each region
        const regionPositions = {
            starter: { x: 500, y: 280, name: 'RIVERLANDS' },
            capital: { x: 500, y: 150, name: 'CAPITAL REGION' },
            northern: { x: 500, y: 50, name: 'NORTHERN HIGHLANDS' },
            eastern: { x: 700, y: 300, name: 'EASTERN SHORES' },
            western: { x: 150, y: 300, name: 'WESTERN GRAVES' },
            southern: { x: 500, y: 500, name: 'SOUTHERN PLAINS' },
            doom: { x: 400, y: 400, name: 'THE DOOM' }
        };

        Object.entries(regionPositions).forEach(([regionId, pos]) => {
            const region = GameWorld.regions[regionId];
            if (!region) return;

            const label = document.createElement('div');
            label.className = 'region-label';
            label.textContent = pos.name;
            label.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                transform: translate(-50%, -50%);
                font-size: 24px;
                font-weight: bold;
                color: rgba(255, 255, 255, 0.15);
                text-transform: uppercase;
                letter-spacing: 4px;
                pointer-events: none;
                z-index: 1;
                text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                font-family: 'Cinzel', serif;
                white-space: nowrap;
            `;

            this.mapElement.appendChild(label);
        });
    },

    //  Calculate visibility for all locations (borrowed from GameWorldRenderer)
    calculateLocationVisibility() {
        // ═══════════════════════════════════════════════════════════════
        //  TUTORIAL MODE VISIBILITY - All locations visible in tutorial
        //  We're teaching noobs here, no fog of war bullshit to confuse them
        // ═══════════════════════════════════════════════════════════════
        if (this.isInTutorialMode()) {
            const visibility = {};
            const tutorialLocations = this.getActiveLocations();
            // In tutorial mode, ALL locations are visible - no hiding shit from noobs
            Object.keys(tutorialLocations).forEach(locId => {
                visibility[locId] = 'visible';
            });
            return visibility;
        }

        // If GameWorldRenderer exists and has this method, use it (main world only)
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.calculateLocationVisibility) {
            return GameWorldRenderer.calculateLocationVisibility();
        }

        // Fallback implementation - mirrors GameWorldRenderer logic
        const visibility = {};
        const locations = (typeof GameWorld !== 'undefined' && GameWorld.locations) ? GameWorld.locations : {};

        //  Get visited locations - use world-aware helper for doom/normal world separation!
        let visited = [];
        if (typeof GameWorld !== 'undefined') {
            if (typeof GameWorld.getActiveVisitedLocations === 'function') {
                visited = GameWorld.getActiveVisitedLocations();
            } else if (Array.isArray(GameWorld.visitedLocations)) {
                visited = GameWorld.visitedLocations;
            }
        }

        if (visited.length === 0 && typeof game !== 'undefined' && game.currentLocation && game.currentLocation.id) {
            visited = [game.currentLocation.id];
        }

        // If no visited locations, show all
        if (visited.length === 0) {
            Object.keys(locations).forEach(locId => {
                visibility[locId] = 'visible';
            });
            return visibility;
        }

        // Mark visited as visible
        visited.forEach(locId => {
            visibility[locId] = 'visible';
        });

        // Connected locations are 'discovered' UNLESS in a locked zone
        // Locked zones (north, west) are hidden until fee is paid
        visited.forEach(locId => {
            const location = locations[locId];
            if (location && location.connections) {
                location.connections.forEach(connectedId => {
                    if (!visibility[connectedId]) {
                        // Check if connected location is in a locked zone
                        const isLocked = this.isLocationInLockedZone(connectedId);
                        if (isLocked) {
                            // Locked zone locations stay hidden until fee paid
                            // EXCEPT gatehouses - those are always discoverable
                            if (this.isGatehouse(connectedId)) {
                                visibility[connectedId] = 'discovered';
                            }
                        } else {
                            // Free zone - mark as discovered
                            visibility[connectedId] = 'discovered';
                        }
                    }
                });
            }
        });

        // Also show gatehouses that are 2 hops away from visited locations
        const discoveredLocations = Object.keys(visibility).filter(id => visibility[id] === 'discovered');
        discoveredLocations.forEach(locId => {
            const location = locations[locId];
            if (location && location.connections) {
                location.connections.forEach(connectedId => {
                    if (!visibility[connectedId] || visibility[connectedId] === 'hidden') {
                        if (this.isGatehouse(connectedId)) {
                            visibility[connectedId] = 'discovered';
                        }
                    }
                });
            }
        });

        // ALWAYS show zone gatehouses as discovered - players need to reach them
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.GATEHOUSES) {
            Object.keys(GatehouseSystem.GATEHOUSES).forEach(gatehouseId => {
                if (locations[gatehouseId] && visibility[gatehouseId] !== 'visible') {
                    visibility[gatehouseId] = 'discovered';
                }
            });
        }

        // Royal Capital reveals ALL connected gatehouses
        // Capital is a hub - if you're there, you should see all gates
        if (visited.includes('royal_capital')) {
            const capitalLoc = locations['royal_capital'];
            if (capitalLoc && capitalLoc.connections) {
                capitalLoc.connections.forEach(connId => {
                    if (this.isGatehouse(connId) && visibility[connId] !== 'visible') {
                        visibility[connId] = 'discovered';
                    }
                });
            }
        }

        // All others hidden
        Object.keys(locations).forEach(locId => {
            if (!visibility[locId]) {
                visibility[locId] = 'hidden';
            }
        });

        return visibility;
    },

    // Check if a location is a gatehouse/outpost
    isGatehouse(locationId) {
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.GATEHOUSES) {
            if (GatehouseSystem.GATEHOUSES[locationId]) {
                return true;
            }
        }
        const locations = (typeof GameWorld !== 'undefined' && GameWorld.locations) ? GameWorld.locations : {};
        const location = locations[locationId];
        if (location && location.type === 'outpost') {
            return true;
        }
        return false;
    },

    // Check if a location is in a LOCKED zone that requires payment
    // Locked zones: northern, northern_deep, western, eastern
    // DOOM WORLD: All zones accessible - no gatehouse restrictions
    isLocationInLockedZone(locationId) {
        // DOOM WORLD BYPASS: No zone locks in the apocalypse
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);
        if (inDoom) {
            return false; // All zones accessible in doom world
        }

        if (typeof GatehouseSystem === 'undefined') {
            return false;
        }
        // Get the zone for this location
        const zone = GatehouseSystem.LOCATION_ZONES?.[locationId] ||
                     (GatehouseSystem.getLocationZone ? GatehouseSystem.getLocationZone(locationId) : null);

        // Check if this is a locked zone
        const lockedZones = ['northern', 'northern_deep', 'western', 'eastern'];
        if (!lockedZones.includes(zone)) {
            return false;
        }

        // Check if the gatehouse for this zone has been unlocked
        const gatehouseId = GatehouseSystem.ZONE_GATEHOUSES?.[zone];
        if (gatehouseId && GatehouseSystem.unlockedGates?.has(gatehouseId)) {
            return false;
        }

        // The gatehouse itself is never locked
        if (this.isGatehouse(locationId)) {
            return false;
        }

        return true;
    },

    // Check if location is behind a locked gate
    // DOOM WORLD: No gatehouse restrictions - the apocalypse has no toll booths
    isLocationBehindLockedGate(locationId) {
        // DOOM WORLD BYPASS: No gates in the apocalypse
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);
        if (inDoom) {
            return false; // All gates open in doom world
        }

        if (typeof GatehouseSystem === 'undefined' || !GatehouseSystem.canAccessLocation) {
            return false;
        }
        // Check starting zone
        if (typeof GatehouseSystem.startingZone !== 'undefined') {
            const locZone = GatehouseSystem.LOCATION_ZONES ? GatehouseSystem.LOCATION_ZONES[locationId] : null;
            if (locZone === 'capital' || locZone === GatehouseSystem.startingZone) {
                return false;
            }
        }
        try {
            const access = GatehouseSystem.canAccessLocation(locationId);
            return !access.accessible;
        } catch (e) {
            return false;
        }
    },

    //  Draw connection lines between locations
    drawConnections(visibilityMap = {}) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '800');
        svg.setAttribute('height', '600');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 20; /* ABOVE weather (2-3) - path lines always visible */
        `;

        // ═══════════════════════════════════════════════════════════════
        //  TUTORIAL MODE CONNECTIONS - Use the right location source
        // ═══════════════════════════════════════════════════════════════
        const locations = this.getActiveLocations();

        // Get visited locations based on mode
        let visited = [];
        if (this.isInTutorialMode()) {
            // In tutorial mode, just check game.visitedLocations or assume all visited
            visited = (typeof game !== 'undefined' && Array.isArray(game.visitedLocations))
                ? game.visitedLocations
                : Object.keys(locations); // All connections visible in tutorial
        } else {
            //  Use world-aware visited locations for doom/normal separation!
            visited = (typeof GameWorld !== 'undefined' && typeof GameWorld.getActiveVisitedLocations === 'function')
                ? GameWorld.getActiveVisitedLocations()
                : ((typeof GameWorld !== 'undefined' && GameWorld.visitedLocations) || []);
        }
        const drawnConnections = new Set();

        Object.values(locations).forEach(location => {
            if (!location.connections || !location.mapPosition) return;

            const locVisibility = visibilityMap[location.id];
            if (locVisibility === 'hidden') return;

            location.connections.forEach(targetId => {
                const target = locations[targetId];
                if (!target || !target.mapPosition) return;

                const targetVisibility = visibilityMap[targetId];
                if (targetVisibility === 'hidden') return;

                const connectionKey = [location.id, targetId].sort().join('-');
                if (drawnConnections.has(connectionKey)) return;
                drawnConnections.add(connectionKey);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', location.mapPosition.x);
                line.setAttribute('y1', location.mapPosition.y);
                line.setAttribute('x2', target.mapPosition.x);
                line.setAttribute('y2', target.mapPosition.y);

                const bothExplored = visited.includes(location.id) && visited.includes(targetId);
                const oneExplored = visited.includes(location.id) || visited.includes(targetId);

                if (bothExplored) {
                    line.setAttribute('stroke', 'rgba(255, 215, 0, 0.5)');
                    line.setAttribute('stroke-width', '2');
                } else if (oneExplored) {
                    line.setAttribute('stroke', 'rgba(255, 215, 0, 0.25)');
                    line.setAttribute('stroke-width', '1.5');
                    line.setAttribute('stroke-dasharray', '4,4');
                } else {
                    line.setAttribute('stroke', 'rgba(150, 150, 150, 0.3)');
                    line.setAttribute('stroke-width', '1.5');
                    line.setAttribute('stroke-dasharray', '4,4');
                }

                svg.appendChild(line);
            });
        });

        this.mapElement.appendChild(svg);
    },

    //  Create a location element
    createLocationElement(location, labelOffset = 0, visibility = 'visible') {
        if (!location.mapPosition) return;
        if (visibility === 'hidden') return;

        const style = this.locationStyles[location.type] || this.locationStyles.town;
        const isDiscovered = visibility === 'discovered';
        const el = document.createElement('div');
        el.className = 'mini-map-location' + (isDiscovered ? ' discovered' : '');
        el.dataset.locationId = location.id;
        el.dataset.visibility = visibility;

        //  Check if July 18th Dungeon Bonanza is active AND this is a dungeon type
        const dungeonTypes = ['dungeon', 'cave', 'ruins'];
        const isDungeonType = dungeonTypes.includes(location.type);
        const isBonanzaActive = typeof DungeonBonanzaSystem !== 'undefined' && DungeonBonanzaSystem.isDungeonBonanzaDay();
        const hasBonanzaEffect = isDungeonType && isBonanzaActive && !isDiscovered;

        const bgColor = isDiscovered ? '#555555' : style.color;
        const borderColor = isDiscovered ? '#777777' : (hasBonanzaEffect ? '#a855f7' : this.lightenColor(style.color, 20));
        const opacity = isDiscovered ? '0.6' : '1';
        //  Purple glow for dungeons during bonanza
        const boxShadowStyle = hasBonanzaEffect
            ? '0 0 12px 4px rgba(168, 85, 247, 0.7), 0 0 25px 10px rgba(168, 85, 247, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.5)';

        el.style.cssText = `
            position: absolute;
            left: ${location.mapPosition.x}px;
            top: ${location.mapPosition.y}px;
            transform: translate(-50%, -50%);
            width: ${style.size}px;
            height: ${style.size}px;
            background: radial-gradient(circle, ${bgColor} 0%, ${this.darkenColor(bgColor, 30)} 100%);
            border: 2px solid ${borderColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${style.size * 0.5}px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: ${boxShadowStyle};
            z-index: 25; /* ABOVE weather (2-3) - locations visible in all conditions */
            opacity: ${opacity};
            ${hasBonanzaEffect ? 'animation: bonanza-pulse-mini 1.5s ease-in-out infinite;' : ''}
        `;

        el.innerHTML = isDiscovered ? '❓' : style.icon;

        //  Add "" badge for dungeons during bonanza (smaller version)
        if (hasBonanzaEffect) {
            const bonanzaBadge = document.createElement('div');
            bonanzaBadge.className = 'bonanza-badge-mini';
            bonanzaBadge.innerHTML = '';
            bonanzaBadge.style.cssText = `
                position: absolute;
                top: -4px;
                right: -4px;
                background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
                color: #fff;
                font-size: 8px;
                padding: 1px 3px;
                border-radius: 6px;
                border: 1px solid #c084fc;
                z-index: 30; /* ABOVE locations (25) - badges visible */
                pointer-events: none;
            `;
            el.appendChild(bonanzaBadge);
        }

        // Hover effects
        el.addEventListener('mouseenter', (e) => this.onLocationHover(e, location, isDiscovered));
        el.addEventListener('mouseleave', () => this.hideTooltip());
        el.addEventListener('click', (e) => this.onLocationClick(e, location, isDiscovered));

        // Add label as child of location element (tied together)
        const label = document.createElement('div');
        label.className = 'mini-map-location-label' + (isDiscovered ? ' discovered' : '');

        const isGate = this.isGatehouse(location.id);
        const locationName = location.name || location.id;
        label.textContent = (isDiscovered && !isGate) ? '???' : locationName;

        // position label ABOVE icon for consistency
        label.style.cssText = `
            position: absolute;
            left: 50%;
            bottom: ${style.size + 2}px;
            transform: translateX(-50%);
            color: ${isDiscovered ? '#888' : '#fff'};
            font-size: 10px;
            font-style: ${isDiscovered ? 'italic' : 'normal'};
            text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 0 0 4px #000;
            white-space: nowrap;
            pointer-events: none;
        `;
        el.appendChild(label);

        this.mapElement.appendChild(el);
    },

    //  Calculate label offsets to prevent overlapping
    // SIMPLIFIED: No offsets - labels render directly below their markers
    calculateLabelOffsets(locations) {
        const offsets = {};
        Object.keys(locations).forEach(id => {
            offsets[id] = 0;
        });
        return offsets;
    },

    //  Highlight current player location
    highlightCurrentLocation() {
        if (!game || !game.currentLocation) return;

        const currentEl = this.mapElement.querySelector(`[data-location-id="${game.currentLocation.id}"]`);
        if (currentEl) {
            currentEl.style.boxShadow = '0 0 15px 4px rgba(79, 195, 247, 0.8)';
            currentEl.style.border = '2px solid #4fc3f7';
        }

        // Create player marker
        this.updatePlayerMarker();
    },

    //  Player marker - floating tack above location 
    playerMarker: null,

    updatePlayerMarker() {
        const locationId = game?.currentLocation?.id;
        if (!locationId) return;

        // Use active locations (tutorial or main world)
        const locations = this.getActiveLocations();
        const location = locations[locationId] || null;
        if (!location || !location.mapPosition) return;

        //  Check if currently traveling - show walking person instead of tack
        const isTraveling = typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling;

        //  Check if marker exists AND is still in the DOM - render() clears innerHTML
        if (!this.playerMarker || !this.mapElement.contains(this.playerMarker)) {
            // Reset orphaned reference
            this.playerMarker = null;
            this.playerMarker = document.createElement('div');
            this.playerMarker.id = 'travel-player-marker';
            this.playerMarker.innerHTML = `
                <div class="marker-tack">${isTraveling ? '🚶' : '📌'}</div>
                <div class="marker-shadow"></div>
                <div class="marker-pulse"></div>
            `;
            this.playerMarker.style.cssText = `
                position: absolute;
                z-index: 100;
                pointer-events: none;
                transform: translate(-50%, -100%);
                display: flex;
                flex-direction: column;
                align-items: center;
            `;

            //  Floating tack style
            const tack = this.playerMarker.querySelector('.marker-tack');
            tack.style.cssText = `
                font-size: 32px;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
                animation: tack-float-mini 2.5s ease-in-out infinite;
                z-index: 102;
            `;

            // Shadow below tack
            const shadow = this.playerMarker.querySelector('.marker-shadow');
            shadow.style.cssText = `
                position: absolute;
                bottom: -3px;
                width: 18px;
                height: 6px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 50%;
                animation: shadow-pulse-mini 2.5s ease-in-out infinite;
                z-index: 99;
            `;

            const pulse = this.playerMarker.querySelector('.marker-pulse');
            pulse.style.cssText = `
                position: absolute;
                bottom: 0px;
                width: 12px;
                height: 12px;
                background: rgba(220, 20, 60, 0.5);
                border-radius: 50%;
                animation: marker-pulse 2s ease-out infinite;
                z-index: 100;
            `;

            // Add mini-map specific animations
            this.addMiniMapMarkerStyles();

            this.mapElement.appendChild(this.playerMarker);
        } else {
            // Update tack icon based on travel state
            const tack = this.playerMarker.querySelector('.marker-tack');
            if (tack) {
                tack.textContent = isTraveling ? '🚶' : '📌';
            }
        }

        this.playerMarker.style.left = location.mapPosition.x + 'px';
        this.playerMarker.style.top = location.mapPosition.y + 'px';
    },

    //  Add mini-map marker animation styles
    addMiniMapMarkerStyles() {
        if (document.getElementById('mini-map-marker-styles')) return;
        const styleSheet = document.createElement('style');
        styleSheet.id = 'mini-map-marker-styles';
        styleSheet.textContent = `
            @keyframes tack-float-mini {
                0%, 100% { transform: translateY(0) rotate(-2deg); }
                50% { transform: translateY(-10px) rotate(2deg); }
            }
            @keyframes shadow-pulse-mini {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(0.7); opacity: 0.4; }
            }
            /* July 18th Dungeon Bonanza pulse effect (mini) */
            @keyframes bonanza-pulse-mini {
                0%, 100% {
                    box-shadow: 0 0 12px 4px rgba(168, 85, 247, 0.7), 0 0 25px 10px rgba(168, 85, 247, 0.4);
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    box-shadow: 0 0 18px 6px rgba(168, 85, 247, 0.9), 0 0 35px 15px rgba(168, 85, 247, 0.5);
                    transform: translate(-50%, -50%) scale(1.05);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    },

    //  Destination marker
    destinationMarker: null,

    highlightDestination() {
        if (!this.currentDestination) {
            if (this.destinationMarker) {
                this.destinationMarker.style.display = 'none';
            }
            return;
        }

        //  Guard against missing mapElement - can happen during initialization or cleanup
        if (!this.mapElement) return;

        // Use active locations (tutorial or main world)
        const locations = this.getActiveLocations();
        const location = locations[this.currentDestination.id] || null;
        if (!location || !location.mapPosition) return;

        // Highlight the destination element
        const destEl = this.mapElement.querySelector(`[data-location-id="${this.currentDestination.id}"]`);
        if (destEl) {
            destEl.style.boxShadow = '0 0 15px 4px rgba(255, 152, 0, 0.8)';
            destEl.style.border = '2px solid #ff9800';
        }

        // Create/update destination marker
        if (!this.destinationMarker) {
            this.destinationMarker = document.createElement('div');
            this.destinationMarker.id = 'travel-destination-marker';
            this.destinationMarker.innerHTML = '🎯';
            this.destinationMarker.style.cssText = `
                position: absolute;
                z-index: 99;
                pointer-events: none;
                transform: translate(-50%, -150%);
                font-size: 24px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                animation: dest-pulse 1.5s ease-in-out infinite;
            `;
            this.mapElement.appendChild(this.destinationMarker);
        }

        this.destinationMarker.style.display = 'block';
        this.destinationMarker.style.left = location.mapPosition.x + 'px';
        this.destinationMarker.style.top = location.mapPosition.y + 'px';
    },

    //  Update map transform
    updateTransform() {
        if (!this.mapElement) return;
        this.constrainToBounds();
        const transform = `translate(${this.mapState.offsetX}px, ${this.mapState.offsetY}px) scale(${this.mapState.zoom})`;
        this.mapElement.style.transform = transform;

        //  Update marker/label scaling based on zoom
        this.updateMarkerScaling();
    },

    //  Scale markers inversely to zoom with caps to prevent overlap
    updateMarkerScaling() {
        if (!this.mapElement) return;

        const zoom = this.mapState.zoom;

        //  Calculate inverse scale with CAPS
        const rawInverseScale = 1 / Math.sqrt(zoom);
        const markerScale = Math.max(0.6, Math.min(1.4, rawInverseScale));
        const labelScale = Math.max(0.7, Math.min(1.2, rawInverseScale));
        const labelOpacity = zoom < 0.35 ? Math.max(0, (zoom - 0.2) / 0.15) : 1;

        // Apply to all location markers
        const markers = this.mapElement.querySelectorAll('.mini-map-location');
        markers.forEach(marker => {
            marker.style.transform = `translate(-50%, -50%) scale(${markerScale})`;
        });

        // Apply to labels with opacity fade
        const labels = this.mapElement.querySelectorAll('.mini-map-label');
        labels.forEach(label => {
            label.style.transform = `translateX(-50%) scale(${labelScale})`;
            label.style.opacity = labelOpacity;
        });

        // Player marker always visible
        const playerMarker = this.mapElement.querySelector('.mini-map-player');
        if (playerMarker) {
            playerMarker.style.transform = `translate(-50%, -50%) scale(${markerScale})`;
        }
    },

    //  Constrain map position
    constrainToBounds() {
        if (!this.container) return;

        const containerRect = this.container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const mapWidth = 800 * this.mapState.zoom;
        const mapHeight = 600 * this.mapState.zoom;

        if (mapWidth <= containerWidth) {
            this.mapState.offsetX = (containerWidth - mapWidth) / 2;
        } else {
            const minX = containerWidth - mapWidth;
            const maxX = 0;
            this.mapState.offsetX = Math.max(minX, Math.min(maxX, this.mapState.offsetX));
        }

        if (mapHeight <= containerHeight) {
            this.mapState.offsetY = (containerHeight - mapHeight) / 2;
        } else {
            const minY = containerHeight - mapHeight;
            const maxY = 0;
            this.mapState.offsetY = Math.max(minY, Math.min(maxY, this.mapState.offsetY));
        }
    },

    //  Mouse event handlers
    onMouseDown(e) {
        if (e.target.classList.contains('mini-map-location')) return;

        e.preventDefault();
        this.mapState.isDragging = true;
        this.mapState.dragStartX = e.clientX;
        this.mapState.dragStartY = e.clientY;
        this.mapState.lastOffsetX = this.mapState.offsetX;
        this.mapState.lastOffsetY = this.mapState.offsetY;
        this.mapElement.style.cursor = 'grabbing';
    },

    onMouseMove(e) {
        if (!this.mapState.isDragging) return;

        const dx = e.clientX - this.mapState.dragStartX;
        const dy = e.clientY - this.mapState.dragStartY;

        this.mapState.offsetX = this.mapState.lastOffsetX + dx;
        this.mapState.offsetY = this.mapState.lastOffsetY + dy;

        this.updateTransform();
    },

    onMouseUp(e) {
        this.mapState.isDragging = false;
        if (this.mapElement) {
            this.mapElement.style.cursor = 'grab';
        }
    },

    //  Zoom handlers
    //  Uses MULTIPLICATIVE zoom for smooth, proportional increments at every level
    onWheel(e) {
        e.preventDefault();

        //  10% zoom per scroll tick - multiplicative for smooth scaling
        const zoomFactor = e.deltaY > 0 ? (1 / 1.1) : 1.1;
        const newZoom = Math.max(this.mapState.minZoom, Math.min(this.mapState.maxZoom, this.mapState.zoom * zoomFactor));

        if (Math.abs(newZoom - this.mapState.zoom) < 0.001) return;
        this.mapState.zoom = newZoom;
        this.updateTransform();
    },

    zoomIn() {
        //  15% zoom in - multiplicative
        const newZoom = Math.min(this.mapState.maxZoom, this.mapState.zoom * 1.15);
        if (Math.abs(newZoom - this.mapState.zoom) < 0.001) return;
        this.mapState.zoom = newZoom;
        this.updateTransform();
    },

    zoomOut() {
        //  15% zoom out - multiplicative (divide by 1.15)
        const newZoom = Math.max(this.mapState.minZoom, this.mapState.zoom / 1.15);
        if (Math.abs(newZoom - this.mapState.zoom) < 0.001) return;
        this.mapState.zoom = newZoom;
        this.updateTransform();
    },

    resetView() {
        this.mapState.zoom = this.mapState.defaultZoom;
        this.centerOnPlayer();
    },

    //  Center on player location
    centerOnPlayer() {
        if (!this.container) return;

        let pos = null;

        // Use active locations (tutorial or main world)
        const locations = this.getActiveLocations();
        if (typeof game !== 'undefined' && game.currentLocation && game.currentLocation.id) {
            const location = locations[game.currentLocation.id];
            if (location && location.mapPosition) {
                pos = location.mapPosition;
            }
        }

        if (!pos) {
            pos = { x: 400, y: 300 };
        }

        const containerRect = this.container.getBoundingClientRect();

        this.mapState.offsetX = (containerRect.width / 2) - (pos.x * this.mapState.zoom);
        this.mapState.offsetY = (containerRect.height / 2) - (pos.y * this.mapState.zoom);

        this.updateTransform();
    },

    //  Touch handlers
    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.mapState.isDragging = true;
            this.mapState.dragStartX = touch.clientX;
            this.mapState.dragStartY = touch.clientY;
            this.mapState.lastOffsetX = this.mapState.offsetX;
            this.mapState.lastOffsetY = this.mapState.offsetY;
        }
    },

    onTouchMove(e) {
        if (!this.mapState.isDragging || e.touches.length !== 1) return;

        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - this.mapState.dragStartX;
        const dy = touch.clientY - this.mapState.dragStartY;

        this.mapState.offsetX = this.mapState.lastOffsetX + dx;
        this.mapState.offsetY = this.mapState.lastOffsetY + dy;

        this.updateTransform();
    },

    onTouchEnd(e) {
        this.mapState.isDragging = false;
    },

    //  Tooltip handlers
    onLocationHover(e, location, isDiscovered = false) {
        const style = this.locationStyles[location.type] || this.locationStyles.town;
        const isCurrentLocation = game && game.currentLocation && game.currentLocation.id === location.id;
        const isDestination = this.currentDestination && this.currentDestination.id === location.id;

        //  Get tracked quest info for this location
        let questInfo = '';
        if (typeof QuestSystem !== 'undefined' && QuestSystem.getQuestInfoForLocation) {
            const quest = QuestSystem.getQuestInfoForLocation(location.id);
            if (quest) {
                const isDoomQuest = quest.isDoom || quest.questId?.startsWith('doom_');
                const bgColor = isDoomQuest ? 'rgba(255, 140, 0, 0.15)' : 'rgba(255, 215, 0, 0.15)';
                const borderColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                const textColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                const subTextColor = isDoomQuest ? '#ffb347' : '#ffeb3b';
                questInfo = `
                    <div style="margin-top: 6px; padding: 6px; background: ${bgColor}; border-radius: 4px; border-left: 3px solid ${borderColor};">
                        <div style="color: ${textColor}; font-weight: bold; font-size: 11px;">🎯 ${quest.questName}</div>
                        ${quest.objective ? `<div style="color: ${subTextColor}; font-size: 10px;">${quest.objective}</div>` : ''}
                    </div>
                `;
            }
        }

        if (isDiscovered) {
            this.tooltipElement.innerHTML = `
                <div style="font-size: 15px; font-weight: bold; margin-bottom: 5px; color: #888;">
                    ❓ Unknown Location
                </div>
                <div style="color: #666; font-size: 11px; margin-bottom: 5px;">
                    Unexplored territory
                </div>
                ${questInfo}
                <div style="color: #ff9800; margin-top: 5px; font-size: 12px;">🎯 Click to set as destination</div>
            `;
        } else {
            let statusLine = '';
            if (isCurrentLocation) {
                statusLine = '<div style="color: #4fc3f7; margin-top: 5px;">📍 You are here</div>';
            } else if (isDestination) {
                statusLine = '<div style="color: #ff9800; margin-top: 5px;">🎯 Current destination</div>';
            } else {
                statusLine = '<div style="color: #ff9800; margin-top: 5px;">🎯 Click to set as destination</div>';
            }

            // Get gate info if this is a gatehouse
            const gateInfo = this.getGateInfo(location);

            this.tooltipElement.innerHTML = `
                <div style="font-size: 15px; font-weight: bold; margin-bottom: 5px;">
                    ${style.icon} ${location.name}
                </div>
                <div style="color: #aaa; font-size: 11px; margin-bottom: 5px;">
                    ${location.type.charAt(0).toUpperCase() + location.type.slice(1)} • ${location.region || 'Unknown'}
                </div>
                <div style="font-size: 11px; line-height: 1.4; color: #ccc;">
                    ${location.description || 'No description available.'}
                </div>
                ${gateInfo}
                ${questInfo}
                ${statusLine}
            `;
        }

        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (e.clientX + 15) + 'px';
        this.tooltipElement.style.top = (e.clientY + 15) + 'px';
    },

    //  Get gate/outpost fee information for tooltips
    getGateInfo(location) {
        // Check if GatehouseSystem exists and this location is a gatehouse
        if (typeof GatehouseSystem === 'undefined') return '';

        const gatehouse = GatehouseSystem.GATEHOUSES[location.id];
        if (!gatehouse) return '';

        const isUnlocked = GatehouseSystem.isGatehouseUnlocked(location.id);
        const fee = gatehouse.fee;
        const zoneName = GatehouseSystem.ZONES[gatehouse.unlocksZone]?.name || 'new region';

        if (isUnlocked) {
            return `
                <div style="margin-top: 6px; padding: 6px; background: rgba(76, 175, 80, 0.2); border-radius: 4px; border-left: 3px solid #4caf50;">
                    <div style="color: #4caf50; font-weight: bold; font-size: 11px;">🔓 Passage Unlocked</div>
                    <div style="color: #81c784; font-size: 10px;">Free access to ${zoneName}</div>
                    <div style="color: #aaa; font-size: 9px; margin-top: 2px;">💱 Trading available</div>
                </div>
            `;
        } else {
            return `
                <div style="margin-top: 6px; padding: 6px; background: rgba(255, 152, 0, 0.2); border-radius: 4px; border-left: 3px solid #ff9800;">
                    <div style="color: #ff9800; font-weight: bold; font-size: 11px;">🔒 Passage Fee Required</div>
                    <div style="color: #ffb74d; font-size: 11px;">💰 ${fee} gold (one-time)</div>
                    <div style="color: #aaa; font-size: 10px;">Unlocks: ${zoneName}</div>
                    <div style="color: #81c784; font-size: 9px; margin-top: 2px;">💱 Trading available without fee</div>
                </div>
            `;
        }
    },

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    },

    //  Location click handler - sets destination AND starts travel instantly
    // No more "Begin Travel" button nonsense - click means GO
    // Now supports mid-journey rerouting!
    onLocationClick(e, location, isDiscovered = false) {
        e.stopPropagation();

        // If already traveling - reroute to new destination (even back to start!)
        // Check this FIRST before the "already at" check since game.currentLocation
        // shows the trip START, not current position mid-journey
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            this.rerouteTravel(location.id, isDiscovered);
            return;
        }

        // Only block "already at" when NOT traveling
        const isCurrentLocation = game && game.currentLocation && game.currentLocation.id === location.id;

        if (isCurrentLocation) {
            if (typeof addMessage === 'function') {
                addMessage(`You are already at ${location.name}`);
            }
            return;
        }

        // Set destination AND start travel immediately - no extra clicks needed
        this.setDestinationAndTravel(location.id, isDiscovered);
    },

    // Reroute mid-journey to a new destination
    // Calculates ACTUAL current position on path and starts fresh travel from there
    rerouteTravel(newDestinationId, isDiscovered = false) {
        console.log('Rerouting travel to:', newDestinationId);

        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const newDest = locations[newDestinationId];

        if (!newDest) {
            addMessage('Unknown destination');
            return;
        }

        // Get current travel progress to determine "current position"
        const progress = TravelSystem.playerPosition?.travelProgress || 0;
        const currentDestId = TravelSystem.playerPosition?.destination?.id;
        const startLocId = this.travelState?.startLocation?.id || TravelSystem.playerPosition?.currentLocation;
        const originalDuration = TravelSystem.playerPosition?.travelDuration || 30;

        const newDestName = isDiscovered ? 'Unknown Location' : newDest.name;

        // If clicking the original destination we're already going to, ignore
        if (newDestinationId === currentDestId) {
            addMessage(`Already heading to ${newDestName}`);
            return;
        }

        // Get start and destination locations for position calculation
        const startLoc = locations[startLocId];
        const currentDestLoc = locations[currentDestId];

        // Calculate actual current X,Y position on the path
        let currentX = 0, currentY = 0;
        if (startLoc?.mapPosition && currentDestLoc?.mapPosition) {
            currentX = startLoc.mapPosition.x + (currentDestLoc.mapPosition.x - startLoc.mapPosition.x) * progress;
            currentY = startLoc.mapPosition.y + (currentDestLoc.mapPosition.y - startLoc.mapPosition.y) * progress;
        } else if (startLoc?.mapPosition) {
            currentX = startLoc.mapPosition.x;
            currentY = startLoc.mapPosition.y;
        }

        console.log(`Reroute: Current position at ${Math.round(progress * 100)}% = (${Math.round(currentX)}, ${Math.round(currentY)})`);

        // Special case: clicking start location = go back to start
        const isGoingBackToStart = newDestinationId === startLocId;

        // Stop current travel immediately
        this.travelState.isCancelling = true;

        // Clear the countdown interval
        if (this.travelState.countdownInterval) {
            clearInterval(this.travelState.countdownInterval);
            this.travelState.countdownInterval = null;
        }

        // Stop travel animation
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.onTravelCancel) {
            GameWorldRenderer.onTravelCancel();
        }

        // Reset TravelSystem state
        TravelSystem.playerPosition.isTraveling = false;
        TravelSystem.playerPosition.destination = null;
        TravelSystem.playerPosition.travelProgress = 0;
        TravelSystem.playerPosition.route = null;

        // Hide travel marker
        if (this.travelMarker) {
            this.travelMarker.style.display = 'none';
        }

        // Handle "going back to start" - calculate return time based on actual distance traveled
        if (isGoingBackToStart) {
            // Calculate return time = time already traveled (progress * original duration)
            const returnDuration = Math.max(1, Math.round(originalDuration * progress));

            addMessage(`Turning back to ${startLoc?.name || 'starting location'}... (${returnDuration} min)`);
            console.log(`Reroute back to start: ${Math.round(progress * 100)}% traveled, return in ${returnDuration} min`);

            // Store current path position for the return journey
            TravelSystem.playerPosition._rerouteFromPosition = { x: currentX, y: currentY };
            TravelSystem.playerPosition._rerouteDuration = returnDuration;

            // Reset travel state
            this.travelState = {
                isActive: false,
                startLocation: null,
                destination: null,
                countdownInterval: null,
                isCancelling: false
            };

            // Start travel back to start with calculated duration
            setTimeout(() => {
                this._startRerouteTravelWithDuration(newDestinationId, isDiscovered, returnDuration, currentX, currentY);
            }, 100);
            return;
        }

        // Going to a NEW destination - calculate distance from current position
        if (newDest?.mapPosition) {
            const distToNewDest = Math.sqrt(
                Math.pow(newDest.mapPosition.x - currentX, 2) +
                Math.pow(newDest.mapPosition.y - currentY, 2)
            );

            // Calculate distance from start to original destination for reference
            let totalOriginalDist = 1;
            if (startLoc?.mapPosition && currentDestLoc?.mapPosition) {
                totalOriginalDist = Math.sqrt(
                    Math.pow(currentDestLoc.mapPosition.x - startLoc.mapPosition.x, 2) +
                    Math.pow(currentDestLoc.mapPosition.y - startLoc.mapPosition.y, 2)
                );
            }

            // Scale duration based on distance ratio
            const distanceRatio = distToNewDest / Math.max(totalOriginalDist, 1);
            const newDuration = Math.max(1, Math.round(originalDuration * distanceRatio));

            console.log(`Reroute to new dest: distance ratio ${distanceRatio.toFixed(2)}, duration ${newDuration} min`);

            // Store current position for the new journey
            TravelSystem.playerPosition._rerouteFromPosition = { x: currentX, y: currentY };
            TravelSystem.playerPosition._rerouteDuration = newDuration;
        }

        // Reset travel state
        this.travelState = {
            isActive: false,
            startLocation: null,
            destination: null,
            countdownInterval: null,
            isCancelling: false
        };

        addMessage(`Changing course to ${newDestName}...`);

        // Small delay to let state settle, then start new travel from current position
        setTimeout(() => {
            const rerouteDuration = TravelSystem.playerPosition._rerouteDuration;
            if (rerouteDuration) {
                this._startRerouteTravelWithDuration(newDestinationId, isDiscovered, rerouteDuration, currentX, currentY);
            } else {
                this._startRerouteTravel(newDestinationId, isDiscovered);
            }
        }, 100);
    },

    // Start rerouted travel with a specific duration and from a specific position
    _startRerouteTravelWithDuration(locationId, isDiscovered, duration, fromX, fromY) {
        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const location = locations[locationId];

        if (!location) {
            if (typeof addMessage === 'function') {
                addMessage(`Unknown location`);
            }
            return;
        }

        // Set the destination
        const style = this.locationStyles[location.type] || this.locationStyles.town;
        this.currentDestination = {
            id: locationId,
            name: location.name,
            type: location.type,
            icon: style.icon,
            region: location.region || 'Unknown',
            description: location.description || '',
            reached: false,
            isNewPath: !this.hasVisitedBefore(locationId)
        };

        // Sync with GameWorldRenderer
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.setDestination) {
            GameWorldRenderer.setDestination(locationId);
        }

        // Update display before travel starts
        this.updateDestinationDisplay();
        this.render();

        const destName = isDiscovered ? 'Unknown Location' : location.name;

        // Get the time system
        const timeSystem = typeof TimeSystem !== 'undefined' ? TimeSystem :
                          (typeof TimeMachine !== 'undefined' ? TimeMachine : null);

        // If game is paused, auto-unpause
        if (timeSystem) {
            const isPaused = timeSystem.isPaused || timeSystem.currentSpeed === 'PAUSED';
            if (isPaused) {
                const preferredSpeed = timeSystem.userPreferredSpeed || 'NORMAL';
                timeSystem.setSpeed(preferredSpeed);
            }
        }

        // Start travel with our calculated duration
        this._travelToDestinationWithDuration(duration, fromX, fromY);
    },

    // Travel to destination with a specific duration, starting from a specific position
    _travelToDestinationWithDuration(duration, fromX, fromY) {
        if (!this.currentDestination) return;

        const destId = this.currentDestination.id;
        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const destLoc = locations[destId];

        if (!destLoc) return;

        // Create a virtual "start location" at the reroute position
        const virtualStartLoc = {
            id: '_reroute_position',
            name: 'Current Position',
            type: 'path',
            mapPosition: { x: fromX, y: fromY }
        };

        // Store the virtual start for travel animation
        this.travelState = {
            isActive: true,
            startLocation: virtualStartLoc,
            destination: this.currentDestination,
            countdownInterval: null,
            isCancelling: false,
            rerouteFromPosition: { x: fromX, y: fromY }
        };

        // Set up TravelSystem state
        if (typeof TravelSystem !== 'undefined') {
            TravelSystem.playerPosition.isTraveling = true;
            TravelSystem.playerPosition.destination = { id: destId, ...destLoc };
            TravelSystem.playerPosition.travelProgress = 0;
            TravelSystem.playerPosition.travelDuration = duration;
            TravelSystem.playerPosition.travelStartTime =
                (typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime : Date.now());
            TravelSystem.playerPosition._rerouteFromPosition = { x: fromX, y: fromY };
        }

        // Notify renderer
        if (typeof GameWorldRenderer !== 'undefined') {
            GameWorldRenderer.onTravelStart?.(virtualStartLoc.id, destId);
        }

        // Start countdown
        this.startTravelCountdown(duration);

        console.log(`Rerouted travel started: ${duration} min to ${destLoc.name} from (${Math.round(fromX)}, ${Math.round(fromY)})`);
    },

    // Internal method to start travel after reroute - bypasses "already at" check
    _startRerouteTravel(locationId, isDiscovered = false) {
        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const location = locations[locationId];

        if (!location) {
            if (typeof addMessage === 'function') {
                addMessage(`Unknown location`);
            }
            return;
        }

        // Set the destination
        const style = this.locationStyles[location.type] || this.locationStyles.town;
        this.currentDestination = {
            id: locationId,
            name: location.name,
            type: location.type,
            icon: style.icon,
            region: location.region || 'Unknown',
            description: location.description || '',
            reached: false,
            isNewPath: !this.hasVisitedBefore(locationId)
        };

        // Sync with GameWorldRenderer
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.setDestination) {
            GameWorldRenderer.setDestination(locationId);
        }

        // Update display before travel starts
        this.updateDestinationDisplay();
        this.render();

        const destName = isDiscovered ? 'Unknown Location' : location.name;

        if (typeof addMessage === 'function') {
            addMessage(`Setting off for ${destName}...`);
        }

        // Get the time system
        const timeSystem = typeof TimeSystem !== 'undefined' ? TimeSystem :
                          (typeof TimeMachine !== 'undefined' ? TimeMachine : null);

        // If game is paused, auto-unpause
        if (timeSystem) {
            const isPaused = timeSystem.isPaused || timeSystem.currentSpeed === 'PAUSED';
            if (isPaused) {
                const preferredSpeed = timeSystem.userPreferredSpeed || 'NORMAL';
                timeSystem.setSpeed(preferredSpeed);
            }
        }

        // Start travel immediately
        this.travelToDestination();
    },

    //  Set a destination
    setDestination(locationId) {
        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const location = locations[locationId];

        if (location) {
            const style = this.locationStyles[location.type] || this.locationStyles.town;
            this.currentDestination = {
                id: locationId,
                name: location.name,
                type: location.type,
                icon: style.icon,
                region: location.region || 'Unknown',
                description: location.description || ''
            };

            // Also update GameWorldRenderer's destination if it exists
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.setDestination) {
                GameWorldRenderer.setDestination(locationId);
            }
        } else {
            this.currentDestination = null;
        }

        // Update displays
        this.updateDestinationDisplay();
        this.render();
    },

    //  Set destination AND start travel in one go - the way it should be 
    // Click destination = you're going there, no questions asked
    setDestinationAndTravel(locationId, isDiscovered = false) {
        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const location = locations[locationId];

        if (!location) {
            if (typeof addMessage === 'function') {
                addMessage(`Unknown location`);
            }
            return;
        }

        // Set the destination first
        const style = this.locationStyles[location.type] || this.locationStyles.town;
        this.currentDestination = {
            id: locationId,
            name: location.name,
            type: location.type,
            icon: style.icon,
            region: location.region || 'Unknown',
            description: location.description || '',
            reached: false,
            isNewPath: !this.hasVisitedBefore(locationId)  // Track if this is a new path
        };

        // Sync with GameWorldRenderer
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.setDestination) {
            GameWorldRenderer.setDestination(locationId);
        }

        // Update display before travel starts
        this.updateDestinationDisplay();
        this.render();

        // Auto-unpause and start travel when clicking a destination
        // Uses player's selected speed from dropdown
        const destName = isDiscovered ? 'Unknown Location' : location.name;

        if (typeof addMessage === 'function') {
            addMessage(`🚶 Setting off for ${destName}...`);
        }

        // Get the time system (supports both names)
        const timeSystem = typeof TimeSystem !== 'undefined' ? TimeSystem :
                          (typeof TimeMachine !== 'undefined' ? TimeMachine : null);

        // If game is paused, auto-unpause with user's preferred speed
        if (timeSystem) {
            const isPaused = timeSystem.isPaused || timeSystem.currentSpeed === 'PAUSED';

            if (isPaused) {
                // Get user's preferred speed from dropdown selection
                const preferredSpeed = timeSystem.userPreferredSpeed || 'NORMAL';
                console.log(`Auto-resuming at ${preferredSpeed} speed for travel`);
                timeSystem.setSpeed(preferredSpeed);
            }
        }

        // Start travel immediately
        this.travelToDestination();
    },

    //  Flag to track if we're waiting to start travel when unpaused
    waitingToTravel: false,

    //  Called when game is unpaused - check if we should start travel 
    onGameUnpaused() {
        console.log('🚶 TravelPanelMap.onGameUnpaused called', {
            waitingToTravel: this.waitingToTravel,
            hasDestination: !!this.currentDestination,
            travelActive: this.travelState.isActive
        });

        // Check we're not already traveling
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            console.log('🚶 Already traveling, skipping');
            this.waitingToTravel = false;
            return;
        }

        //  Start travel if we have a destination and aren't already traveling
        // Either waitingToTravel flag is set OR we just have a destination ready
        //  FIX: Also check that destination hasn't already been reached (prevents re-travel bug)
        if (this.currentDestination && !this.travelState.isActive && !this.currentDestination.reached) {
            if (typeof addMessage === 'function') {
                addMessage(`🚶 Setting off for ${this.currentDestination.name}...`);
            }
            console.log('🚶 Starting travel to:', this.currentDestination.id);
            this.travelToDestination();
            this.waitingToTravel = false;
        }
    },

    //  Check if player has visited a location before
    hasVisitedBefore(locationId) {
        // Check TravelSystem history
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.visitedLocations) {
            return TravelSystem.playerPosition.visitedLocations.includes(locationId);
        }
        // Check GameWorldRenderer history
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.visitedLocations) {
            return GameWorldRenderer.visitedLocations.has(locationId);
        }
        return false;
    },

    // Clear the destination
    clearDestination() {
        this.currentDestination = null;

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.clearDestination) {
            GameWorldRenderer.clearDestination();
        }

        this.updateDestinationDisplay();
        this.render();

        if (typeof addMessage === 'function') {
            addMessage('🎯 Destination cleared');
        }
    },

    //  Update the destination tab display
    updateDestinationDisplay() {
        const displayEl = document.getElementById('current-destination-display');
        const actionsEl = document.getElementById('destination-actions');

        if (!displayEl) return;

        if (!this.currentDestination) {
            displayEl.innerHTML = `
                <div class="no-destination">
                    <span class="no-dest-icon">🎯</span>
                    <h3>No Destination Set</h3>
                    <p>Click on a location in the Locations tab or Map to set a destination.</p>
                </div>
            `;
            if (actionsEl) actionsEl.classList.add('hidden');
        } else {
            const dest = this.currentDestination;

            // Get travel info from TravelSystem for accurate multi-hop calculations
            let travelInfoHtml = '';
            let routeInfoHtml = '';
            let travelInfo = null;

            if (typeof TravelSystem !== 'undefined' && TravelSystem.calculateTravelInfo) {
                const destLocation = TravelSystem.locations[dest.id];
                if (destLocation) {
                    travelInfo = TravelSystem.calculateTravelInfo(destLocation);

                            // Check passage status for destination
                    let passageHtml = '';
                    if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.getPassageStatus) {
                        const passageStatus = GatehouseSystem.getPassageStatus(dest.id);
                        if (passageStatus.passageText) {
                            const passageClass = passageStatus.hasFreePassage ? 'passage-unlocked' : 'passage-locked';
                            passageHtml = `
                                <div class="travel-stat passage-status ${passageClass}">
                                    <span class="stat-value">${passageStatus.passageText}</span>
                                </div>
                            `;
                        }
                    }

                    // Build travel summary
                    travelInfoHtml = `
                        <div class="dest-travel-info">
                            ${passageHtml}
                            <div class="travel-stat">
                                <span class="stat-icon">📏</span>
                                <span class="stat-label">Total Distance:</span>
                                <span class="stat-value">${travelInfo.distance} miles</span>
                            </div>
                            <div class="travel-stat">
                                <span class="stat-icon">⏱️</span>
                                <span class="stat-label">Total Time:</span>
                                <span class="stat-value">${travelInfo.timeDisplay}</span>
                            </div>
                            <div class="travel-stat">
                                <span class="stat-icon">⚠️</span>
                                <span class="stat-label">Safety:</span>
                                <span class="stat-value ${travelInfo.safety < 50 ? 'danger' : travelInfo.safety < 75 ? 'warning' : ''}">${travelInfo.safety}%</span>
                            </div>
                        </div>
                    `;

                    //  BUILD MULTI-HOP ROUTE DISPLAY - show each segment of the journey 
                    if (travelInfo.route && travelInfo.route.length > 1) {
                        routeInfoHtml = this.buildRouteDisplayHtml(travelInfo);
                    }

                    // Warning for wilderness travel
                    if (travelInfo.isWilderness) {
                        routeInfoHtml += `
                            <div class="dest-warning">
                                ⚠️ No established path - traveling through wilderness is dangerous and slow!
                            </div>
                        `;
                    }
                }
            }

            // Check if destination was reached (grayed out state)
            const isReached = dest.reached === true;
            const reachedClass = isReached ? 'destination-reached' : '';
            const isNewPath = dest.isNewPath === true && isReached;

            //  Status badge shows arrival + new path discovery
            let statusBadge = '';
            if (isReached) {
                statusBadge = isNewPath
                    ? '<span class="arrived-badge new-discovery">Arrived - New Path Discovered!</span>'
                    : '<span class="arrived-badge">Arrived</span>';
            }

            //  Learned info section - shows travel details after arriving on new path
            let learnedInfoHtml = '';
            if (isReached && dest.learnedInfo) {
                learnedInfoHtml = `
                    <div class="learned-travel-info">
                        <h4>📜 Path Information Learned:</h4>
                        <div class="learned-stats">
                            <div class="learned-stat">
                                <span class="stat-icon">📏</span>
                                <span>Distance: ${dest.learnedInfo.distance} miles</span>
                            </div>
                            <div class="learned-stat">
                                <span class="stat-icon">⏱️</span>
                                <span>Travel Time: ${dest.learnedInfo.timeDisplay}</span>
                            </div>
                            <div class="learned-stat">
                                <span class="stat-icon">🛤️</span>
                                <span>Path Type: ${dest.learnedInfo.pathTypeName || dest.learnedInfo.pathType}</span>
                            </div>
                            <div class="learned-stat">
                                <span class="stat-icon">⚠️</span>
                                <span>Safety: ${dest.learnedInfo.safety}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            //  Check if game is paused - show Begin Journey button only when paused
            const isPaused = typeof TimeSystem !== 'undefined' &&
                            (TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED');
            const pauseStatusHtml = !isReached ? `
                <div class="travel-status-notice ${isPaused ? 'paused' : 'ready'}">
                    ${isPaused
                        ? '⏸️ <strong>Game Paused</strong> - Unpause to begin journey automatically'
                        : '▶️ <strong>Traveling</strong> - Journey in progress...'}
                </div>
            ` : '';

            displayEl.innerHTML = `
                <div class="destination-info ${reachedClass}">
                    <div class="dest-header">
                        <span class="dest-icon">${dest.icon}</span>
                        <div class="dest-name-type">
                            <h3>${dest.name} ${statusBadge}</h3>
                            <span class="dest-type">${dest.type.charAt(0).toUpperCase() + dest.type.slice(1)} • ${dest.region}</span>
                        </div>
                    </div>
                    <div class="dest-description">
                        ${dest.description || 'No description available.'}
                    </div>
                    ${isReached ? learnedInfoHtml : travelInfoHtml}
                    ${isReached ? '' : routeInfoHtml}
                    ${pauseStatusHtml}
                </div>
            `;
            // Hide action buttons if destination already reached
            if (actionsEl) {
                if (isReached) {
                    actionsEl.classList.add('hidden');
                } else {
                    actionsEl.classList.remove('hidden');
                }
            }
        }
    },

    //  Build HTML for multi-hop route display - shows each segment with path info 
    buildRouteDisplayHtml(travelInfo) {
        if (!travelInfo.route || travelInfo.route.length < 2) return '';

        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};
        const currentLocId = typeof game !== 'undefined' && game.currentLocation ? game.currentLocation.id : null;

        let html = '<div class="route-segments">';
        html += '<h4>🗺️ Journey Route</h4>';
        html += '<div class="route-path-visual">';

        for (let i = 0; i < travelInfo.route.length; i++) {
            const locId = travelInfo.route[i];
            const loc = locations[locId] || TravelSystem?.locations?.[locId];
            const locName = loc?.name || locId;
            const locIcon = this.getLocationIcon(loc);
            const isStart = i === 0;
            const isEnd = i === travelInfo.route.length - 1;
            const isCurrent = locId === currentLocId;

            // Location node
            html += `
                <div class="route-node ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${isCurrent ? 'current' : ''}">
                    <span class="node-icon">${locIcon}</span>
                    <span class="node-name">${locName}</span>
                    ${isCurrent ? '<span class="you-are-here">📍 You</span>' : ''}
                </div>
            `;

            // Path segment (if not the last location)
            if (i < travelInfo.route.length - 1) {
                const nextLocId = travelInfo.route[i + 1];
                const segment = travelInfo.segments?.find(s =>
                    (s.from === locId && s.to === nextLocId) ||
                    (s.to === locId && s.from === nextLocId)
                );

                // Check if path is discovered OR if we're currently traveling it
                //  If you're walking the path, you're discovering it! 
                const pathDiscovered = typeof TravelSystem !== 'undefined' &&
                                       TravelSystem.isPathDiscovered?.(locId, nextLocId);
                const isCurrentlyTraveling = typeof TravelSystem !== 'undefined' &&
                                             TravelSystem.playerPosition?.isTraveling &&
                                             travelInfo.route &&
                                             JSON.stringify(TravelSystem.playerPosition.route) === JSON.stringify(travelInfo.route);

                //  Show path info if discovered OR currently being traveled
                const showPathInfo = pathDiscovered || isCurrentlyTraveling;

                const pathType = segment?.type || 'trail';
                const pathTypeInfo = TravelSystem?.PATH_TYPES?.[pathType] || { name: 'Trail', icon: '🛤️' };
                const segmentTime = segment?.time ? TravelSystem.formatTime(segment.time) : '???';
                const segmentDist = segment?.distance ? Math.round(segment.distance) : '???';

                //  Fun discovery messages for paths being walked for the first time 
                const discoveryMessages = {
                    distance: [
                        `~${segmentDist} mi (counting steps...)`,
                        `${segmentDist} mi (feels longer)`,
                        `${segmentDist} mi (give or take)`,
                        `about ${segmentDist} miles`
                    ],
                    time: [
                        `~${segmentTime} (rough guess)`,
                        `${segmentTime} (if lucky)`,
                        `${segmentTime} (estimated)`,
                        `maybe ${segmentTime}`
                    ]
                };

                // Pick consistent random messages based on segment
                const msgIndex = (locId.charCodeAt(0) + nextLocId.charCodeAt(0)) % 4;
                const distDisplay = !pathDiscovered && isCurrentlyTraveling
                    ? discoveryMessages.distance[msgIndex]
                    : `${segmentDist} mi`;
                const timeDisplay = !pathDiscovered && isCurrentlyTraveling
                    ? discoveryMessages.time[msgIndex]
                    : segmentTime;

                html += `
                    <div class="route-segment ${showPathInfo ? 'discovered' : 'undiscovered'} ${isCurrentlyTraveling && !pathDiscovered ? 'discovering' : ''}">
                        <div class="segment-line"></div>
                        <div class="segment-info">
                            ${showPathInfo ? `
                                <span class="segment-type">${pathTypeInfo.name}${isCurrentlyTraveling && !pathDiscovered ? ' 👣' : ''}</span>
                                <span class="segment-details">${distDisplay} • ${timeDisplay}</span>
                            ` : `
                                <span class="segment-type">Unexplored</span>
                                <span class="segment-details">??? mi • ???</span>
                            `}
                        </div>
                    </div>
                `;
            }
        }

        html += '</div></div>';
        return html;
    },

    // Get location icon helper
    getLocationIcon(location) {
        if (!location) return '📍';
        const type = location.type || 'village';
        const icons = {
            'city': '🏰',
            'town': '🏘️',
            'village': '🏠',
            'outpost': '🏕️',
            'dungeon': '💀',
            'ruins': '🏚️',
            'port': '⚓',
            'mine': '',
            'farm': '🌾',
            'forest': '🌲',
            'cave': '🕳️'
        };
        return icons[type] || '📍';
    },

    //  Travel to destination
    travelToDestination() {
        if (!this.currentDestination) {
            console.warn('🖤 travelToDestination called but no destination set');
            return;
        }

        console.log('🚶 TravelPanelMap.travelToDestination() starting travel to:', this.currentDestination.id);

        // Start travel - destination will be cleared when arrival completes
        let travelStarted = false;
        if (typeof TravelSystem !== 'undefined' && TravelSystem.startTravel) {
            TravelSystem.startTravel(this.currentDestination.id);
            // Check if travel actually started (startTravel may reject if already traveling)
            travelStarted = TravelSystem.playerPosition?.isTraveling === true;
            console.log('🚶 TravelSystem.startTravel - isTraveling:', travelStarted);
        } else if (typeof travelTo === 'function') {
            travelTo(this.currentDestination.id);
            travelStarted = true; // Assume legacy function works
        } else {
            console.error('🖤 No travel function available!');
            return;
        }

        // Only start countdown if travel actually began
        if (travelStarted) {
            this.startTravelCountdown();
        } else {
            console.warn('🖤 Travel was not started - not starting countdown');
        }
    },

    //  Travel state tracking
    travelState: {
        isActive: false,
        destination: null,
        startLocation: null,
        startTime: null,
        duration: null,
        countdownInterval: null,
        isCancelling: false // Flag to prevent race condition during cancel
    },

    //  Start the travel countdown display
    startTravelCountdown() {
        if (!this.currentDestination) return;

        // Store travel state
        this.travelState.isActive = true;
        this.travelState.destination = { ...this.currentDestination };

        // Store the starting location for the travel marker
        // IMPORTANT: Ensure we have a valid startLocation with id for cancel/reroute to work
        if (typeof game !== 'undefined' && game.currentLocation) {
            const loc = game.currentLocation;
            // Ensure we have proper location data with id
            if (typeof loc === 'string') {
                // game.currentLocation is just an ID string - look up full data
                const fullLoc = typeof GameWorld !== 'undefined' && GameWorld.locations?.[loc];
                if (fullLoc) {
                    this.travelState.startLocation = { id: loc, name: fullLoc.name, type: fullLoc.type };
                } else {
                    this.travelState.startLocation = { id: loc, name: loc, type: 'unknown' };
                }
            } else if (loc.id) {
                // Proper location object
                this.travelState.startLocation = { ...loc };
            } else {
                // Fallback - try TravelSystem's currentLocation
                const tsLocId = typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.currentLocation;
                if (tsLocId) {
                    const tsLoc = typeof GameWorld !== 'undefined' && GameWorld.locations?.[tsLocId];
                    this.travelState.startLocation = tsLoc
                        ? { id: tsLocId, name: tsLoc.name, type: tsLoc.type }
                        : { id: tsLocId, name: tsLocId, type: 'unknown' };
                }
            }
        }

        console.log('🚶 startTravelCountdown: startLocation =', this.travelState.startLocation);

        // Get travel info from TravelSystem
        //  Null check for playerPosition to prevent crash 
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition) {
            this.travelState.startTime = TravelSystem.playerPosition.travelStartTime;
            this.travelState.duration = TravelSystem.playerPosition.travelDuration;
        }

        //  IMPORTANT: Wait a tick before checking travel state to avoid race condition
        // TravelSystem.startTravel sets isTraveling=true, but we need to ensure it's done
        // before we start polling, otherwise updateTravelProgressDisplay sees isTraveling=false
        // and immediately calls onTravelComplete() - which is the bug that caused instant travel!
        setTimeout(() => {
            // Verify travel actually started
            //  Null check for playerPosition 
            if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition && !TravelSystem.playerPosition.isTraveling) {
                console.warn('🖤 Travel countdown started but TravelSystem.isTraveling is false - aborting');
                this.travelState.isActive = false;
                return;
            }

            // Update the destination display to show travel progress
            this.updateTravelProgressDisplay();

            // Start countdown interval
            if (this.travelState.countdownInterval) {
                clearInterval(this.travelState.countdownInterval);
            }
            this.travelState.countdownInterval = setInterval(() => {
                this.updateTravelProgressDisplay();
            }, 250); // Update 4x per second for smooth countdown
        }, 50);
    },

    //  Update travel progress display in destination tab
    //  Track last update time to throttle when paused 
    _lastTravelDisplayUpdate: 0,

    updateTravelProgressDisplay() {
        const displayEl = document.getElementById('current-destination-display');
        const actionsEl = document.getElementById('destination-actions');
        if (!displayEl) return;

        //  Throttle updates when paused - progress doesn't change anyway 
        const isPaused = typeof TimeSystem !== 'undefined' && (TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED');
        if (isPaused) {
            const now = performance.now();
            if (this._lastTravelDisplayUpdate && (now - this._lastTravelDisplayUpdate) < 1000) {
                return; // Skip update when paused - only update once per second
            }
            this._lastTravelDisplayUpdate = now;
        } else {
            this._lastTravelDisplayUpdate = 0;
        }

        // Check if we're still traveling
        //  Null check for playerPosition to prevent race condition 
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            const dest = this.travelState.destination || this.currentDestination;
            if (!dest) return;

            const progress = TravelSystem.playerPosition.travelProgress || 0;
            //  Cap progress at 99% until actually complete to avoid visual glitch 
            const progressPercent = Math.min(99, Math.round(progress * 100));

            // Calculate remaining time
            const duration = TravelSystem.playerPosition.travelDuration || 1;
            const remainingMinutes = duration * (1 - progress);
            const remainingDisplay = this.formatTravelTime(remainingMinutes);

            // Calculate ETA
            let etaDisplay = '';
            if (typeof TimeSystem !== 'undefined') {
                const currentTime = TimeSystem.getTotalMinutes();
                const arrivalTime = currentTime + remainingMinutes;
                const arrivalHour = Math.floor((arrivalTime % 1440) / 60);
                const arrivalMin = Math.floor(arrivalTime % 60);
                const period = arrivalHour >= 12 ? 'PM' : 'AM';
                const displayHour = arrivalHour % 12 || 12;
                etaDisplay = `${displayHour}:${arrivalMin.toString().padStart(2, '0')} ${period}`;
            }

            displayEl.innerHTML = `
                <div class="travel-in-progress">
                    <div class="travel-status-header">
                        <span class="travel-icon">🚶</span>
                        <h3>Traveling to ${dest.name}</h3>
                    </div>
                    <div class="travel-destination-info">
                        <span class="dest-icon">${dest.icon || '📍'}</span>
                        <div class="dest-details">
                            <span class="dest-name">${dest.name}</span>
                            <span class="dest-type">${dest.type ? dest.type.charAt(0).toUpperCase() + dest.type.slice(1) : ''} • ${dest.region || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="travel-progress-container">
                        <div class="travel-progress-bar">
                            <div class="travel-progress-fill" style="width: ${progressPercent}%">
                                <span class="travel-progress-marker">🚶</span>
                            </div>
                        </div>
                        <div class="travel-progress-labels">
                            <span class="progress-start">📍 Start</span>
                            <span class="progress-percent">${progressPercent}%</span>
                            <span class="progress-end">🎯 ${dest.name}</span>
                        </div>
                    </div>
                    <div class="travel-time-info">
                        <div class="time-stat">
                            <span class="time-label">⏱️ Time Remaining</span>
                            <span class="time-value countdown">${remainingDisplay}</span>
                        </div>
                        ${etaDisplay ? `
                        <div class="time-stat">
                            <span class="time-label">🕐 ETA</span>
                            <span class="time-value">${etaDisplay}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="travel-actions-during">
                        <button class="travel-btn-danger" onclick="TravelPanelMap.cancelTravel()">✕ Cancel Journey</button>
                    </div>
                </div>
            `;

            // Hide normal action buttons during travel
            if (actionsEl) actionsEl.classList.add('hidden');

            // Update the visual travel marker on mini-map
            this.updateTravelMarker(progress);

        } else if (!this.travelState.isCancelling) {
            // Travel completed naturally (not via cancel button)
            // isCancelling flag prevents race condition when cancel is processing
            this.onTravelComplete();
        }
    },

    //  Update visual travel marker on mini-map
    travelMarker: null,

    updateTravelMarker(progress) {
        if (!this.mapElement || !this.travelState.destination) return;

        // Get start and end positions
        // Check for reroute position first (virtual start from path)
        // Use active locations (tutorial or main world)
        const locations = this.getActiveLocations();
        let startPos = null;
        if (this.travelState.rerouteFromPosition) {
            startPos = this.travelState.rerouteFromPosition;
        } else if (this.travelState.startLocation?.mapPosition) {
            startPos = this.travelState.startLocation.mapPosition;
        } else {
            // Fallback to looking up start location
            let startLocId = this.travelState.startLocation?.id;
            if (!startLocId && typeof TravelSystem !== 'undefined') {
                startLocId = TravelSystem.playerPosition?.currentLocation;
            }
            if (!startLocId && typeof game !== 'undefined') {
                startLocId = game.currentLocation?.id;
            }
            const startLoc = startLocId ? locations[startLocId] : null;
            if (startLoc?.mapPosition) {
                startPos = startLoc.mapPosition;
            }
        }

        const endLoc = locations[this.travelState.destination.id] || null;

        if (!startPos || !endLoc?.mapPosition) return;

        // Check if marker exists AND is still in DOM - render() clears innerHTML
        // Same fix as playerMarker - reset orphaned reference before creating new one
        if (!this.travelMarker || !this.mapElement.contains(this.travelMarker)) {
            // Reset orphaned reference
            this.travelMarker = null;
            this.travelMarker = document.createElement('div');
            this.travelMarker.id = 'travel-moving-marker';
            // Use inner span with CSS class for the flip - outer div handles position
            this.travelMarker.innerHTML = '<span class="walk-emoji" style="display: inline-block;">🚶</span>';
            this.travelMarker.style.cssText = `
                position: absolute;
                z-index: 150;
                font-size: 20px;
                transform: translate(-50%, -50%);
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                animation: walk-bounce 0.3s ease-in-out infinite;
                pointer-events: none;
            `;
            this.mapElement.appendChild(this.travelMarker);
        }

        // Interpolate position from start (could be reroute position or location)
        const currentX = startPos.x + (endLoc.mapPosition.x - startPos.x) * progress;
        const currentY = startPos.y + (endLoc.mapPosition.y - startPos.y) * progress;

        this.travelMarker.style.left = currentX + 'px';
        this.travelMarker.style.top = currentY + 'px';
        this.travelMarker.style.display = 'block';

        // use different emoji for direction - walker faces left or right based on travel direction
        const movingRight = endLoc.mapPosition.x > startPos.x;
        const walkEmojiSpan = this.travelMarker.querySelector('.walk-emoji');
        if (walkEmojiSpan) {
            walkEmojiSpan.textContent = movingRight ? '🚶‍➡️' : '🚶';
        }
    },

    // Cancel ongoing travel - calculates actual return journey from current path position
    cancelTravel() {
        console.log('cancelTravel called');

        // Set cancelling flag to prevent race condition with updateTravelProgressDisplay
        this.travelState.isCancelling = true;

        const locations = typeof GameWorld !== 'undefined' ? GameWorld.locations : {};

        // Get current travel state - try multiple sources for start location
        let startLoc = this.travelState?.startLocation;
        const startLocId = startLoc?.id || TravelSystem.playerPosition?.currentLocation;

        // Fallback: try to get from TravelSystem's stored currentLocation
        if ((!startLoc || !startLoc.id) && typeof TravelSystem !== 'undefined') {
            const locId = TravelSystem.playerPosition?.currentLocation;
            if (locId && locations?.[locId]) {
                const loc = locations[locId];
                startLoc = { id: locId, name: loc.name, type: loc.type, mapPosition: loc.mapPosition };
                console.log('Using TravelSystem.currentLocation as start:', startLoc);
            }
        }

        const isTraveling = typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling;

        if (!isTraveling) {
            addMessage('No journey to cancel');
            this.travelState.isCancelling = false;
            return;
        }

        // Clear the countdown interval immediately
        if (this.travelState.countdownInterval) {
            clearInterval(this.travelState.countdownInterval);
            this.travelState.countdownInterval = null;
        }

        // Get current travel progress and calculate actual position
        const currentProgress = TravelSystem.playerPosition.travelProgress || 0;
        const originalDuration = TravelSystem.playerPosition.travelDuration || 30;
        const currentDestId = TravelSystem.playerPosition.destination?.id;
        const currentDestLoc = locations[currentDestId];

        // Calculate actual current X,Y position on the path
        let currentX = 0, currentY = 0;
        const startLocData = locations[startLocId];
        if (startLocData?.mapPosition && currentDestLoc?.mapPosition) {
            currentX = startLocData.mapPosition.x + (currentDestLoc.mapPosition.x - startLocData.mapPosition.x) * currentProgress;
            currentY = startLocData.mapPosition.y + (currentDestLoc.mapPosition.y - startLocData.mapPosition.y) * currentProgress;
        } else if (startLocData?.mapPosition) {
            currentX = startLocData.mapPosition.x;
            currentY = startLocData.mapPosition.y;
        }

        console.log(`Cancel: Current position at ${Math.round(currentProgress * 100)}% = (${Math.round(currentX)}, ${Math.round(currentY)})`);

        if (!startLoc || !startLoc.id) {
            addMessage('Journey cancelled - returning to last known location');
            // Just stop everything
            if (typeof TravelSystem !== 'undefined') {
                TravelSystem.playerPosition.isTraveling = false;
                TravelSystem.playerPosition.destination = null;
                TravelSystem.playerPosition.travelProgress = 0;
            }
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.onTravelCancel) {
                GameWorldRenderer.onTravelCancel();
            }
            this._cleanupCancelledTravel();
            return;
        }

        // Calculate return time based on actual distance traveled (progress * original duration)
        const returnDuration = Math.max(1, Math.round(originalDuration * currentProgress));

        addMessage(`Turning back to ${startLoc.name}... (${returnDuration} min)`);
        console.log(`Cancel: was ${Math.round(currentProgress * 100)}% complete, returning in ${returnDuration} min`);

        // Emit travel:cancelled event for other systems
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('travel:cancelled', {
                cancelledDestination: currentDestId,
                returningTo: startLocId,
                progressWhenCancelled: currentProgress,
                returnDuration: returnDuration
            });
        }

        // Stop current travel in TravelSystem
        TravelSystem.playerPosition.isTraveling = false;
        TravelSystem.playerPosition.destination = null;
        TravelSystem.playerPosition.travelProgress = 0;
        TravelSystem.playerPosition.route = null;

        // Cancel animation
        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.onTravelCancel) {
            GameWorldRenderer.onTravelCancel();
        }

        // If very close to start (< 5% progress), just snap back immediately
        if (currentProgress < 0.05) {
            if (typeof WorldStateManager !== 'undefined' && WorldStateManager.setCurrentLocation) {
                WorldStateManager.setCurrentLocation({ ...startLoc }, 'travel_cancel_snap');
            } else if (typeof game !== 'undefined') {
                game.currentLocation = { ...startLoc };
            }
            TravelSystem.playerPosition.currentLocation = startLoc.id;

            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.updatePlayerMarker) {
                const loc = locations[startLoc.id];
                if (loc?.mapPosition) {
                    GameWorldRenderer.updatePlayerMarker(loc.mapPosition.x, loc.mapPosition.y);
                }
            }

            this._cleanupCancelledTravel();
            addMessage(`Returned to ${startLoc.name}`);
            return;
        }

        // Otherwise, start a return journey from current path position
        this.travelState = {
            isActive: false,
            startLocation: null,
            destination: null,
            countdownInterval: null,
            isCancelling: false
        };

        // Start travel back to origin from current position
        setTimeout(() => {
            this._startRerouteTravelWithDuration(startLoc.id, false, returnDuration, currentX, currentY);
        }, 100);
    },

    // Helper to clean up state after cancel
    _cleanupCancelledTravel() {
        // Clear destination
        this.currentDestination = null;

        // Reset travel state but clear the cancelling flag
        this.travelState = {
            isActive: false,
            startLocation: null,
            destination: null,
            countdownInterval: null,
            isCancelling: false
        };

        // Hide travel marker
        if (this.travelMarker) {
            this.travelMarker.style.display = 'none';
        }

        // Update UI
        this.updateDestinationDisplay();
        if (typeof TravelSystem !== 'undefined' && typeof TravelSystem.updateTravelUI === 'function') {
            TravelSystem.updateTravelUI();
        }
    },

    // Handle travel completion - mark destination as reached with learned info 
    onTravelComplete() {
        // Clear interval
        if (this.travelState.countdownInterval) {
            clearInterval(this.travelState.countdownInterval);
            this.travelState.countdownInterval = null;
        }

        // Hide travel marker
        if (this.travelMarker) {
            this.travelMarker.style.display = 'none';
        }

        //  Save the travel info before resetting - this is what we "learned" 
        let learnedInfo = null;
        if (this.currentDestination && typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
            const destLocation = TravelSystem.locations[this.currentDestination.id];
            if (destLocation && typeof TravelSystem.calculateTravelInfo === 'function') {
                const travelInfo = TravelSystem.calculateTravelInfo(destLocation);
                learnedInfo = {
                    distance: travelInfo.distance,
                    timeDisplay: travelInfo.timeDisplay,
                    pathType: travelInfo.pathType,
                    pathTypeName: travelInfo.pathTypeName,
                    safety: travelInfo.safety,
                    hops: travelInfo.hops
                };
            }
        }

        // Reset travel state
        this.travelState.isActive = false;
        this.travelState.destination = null;
        this.travelState.startLocation = null;
        this.travelState.startTime = null;
        this.travelState.duration = null;

        // Mark destination as reached with learned info (grayed out but informative)
        //  This keeps it visible so players can see what they learned from the journey
        if (this.currentDestination) {
            this.currentDestination.reached = true;
            if (learnedInfo) {
                this.currentDestination.learnedInfo = learnedInfo;
            }
        }

        // Update display back to normal
        this.updateDestinationDisplay();
        this.render();

        // Update player marker position to new location
        this.updatePlayerMarker();
    },

    //  Format travel time nicely
    formatTravelTime(minutes) {
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds}s`;
        } else if (minutes < 60) {
            const mins = Math.floor(minutes);
            const secs = Math.round((minutes - mins) * 60);
            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    },

    //  Color utilities delegated to ColorUtils (src/js/utils/color-utils.js)
    //  The darkness consolidates - no more scattered implementations
    darkenColor(hex, percent) {
        return ColorUtils.darkenColor(hex, percent);
    },

    lightenColor(hex, percent) {
        return ColorUtils.lightenColor(hex, percent);
    },

    //  Update quest marker on mini map - calls QuestSystem's marker logic
    updateQuestMarker() {
        //  Only update if QuestSystem is available and has a tracked quest 
        if (typeof QuestSystem === 'undefined' || !QuestSystem.trackedQuestId) {
            return;
        }

        //  Get the tracked quest's target location
        const targetLocation = QuestSystem.getTrackedQuestLocation ? QuestSystem.getTrackedQuestLocation() : null;
        if (!targetLocation) {
            return;
        }

        //  Add animation styles if not already present 
        if (QuestSystem.addQuestMarkerStyles) {
            QuestSystem.addQuestMarkerStyles();
        }

        //  Clean up existing mini-map markers first
        if (QuestSystem.questMiniMarkerElement && QuestSystem.questMiniMarkerElement.parentNode) {
            QuestSystem.questMiniMarkerElement.remove();
        }
        if (QuestSystem.questMiniGlowElement && QuestSystem.questMiniGlowElement.parentNode) {
            QuestSystem.questMiniGlowElement.remove();
        }
        // Also clean up any orphaned mini-map markers
        document.querySelectorAll('.floating-quest-marker-mini, .quest-glow-mini, .quest-marker-mini').forEach(el => el.remove());

        //  Check if mini map location element exists
        const miniMapLocationEl = document.querySelector(`.mini-map-location[data-location-id="${targetLocation}"]`);

        if (miniMapLocationEl) {
            // Location is visible - add marker directly to element
            if (QuestSystem.addQuestMarkerToElement) {
                QuestSystem.addQuestMarkerToElement(miniMapLocationEl, 'mini');
                console.log(`🎯 Mini map quest marker attached to: ${targetLocation}`);
            }
        } else {
            // Location is hidden - create floating marker
            if (QuestSystem.createFloatingQuestMarker) {
                QuestSystem.createFloatingQuestMarker(targetLocation, 'mini');
            }
        }
    },

    //  Cleanup method - clear intervals to prevent memory leaks 
    cleanup() {
        if (this.travelState.countdownInterval) {
            clearInterval(this.travelState.countdownInterval);
            this.travelState.countdownInterval = null;
        }

        //  Remove document-level event listeners 
        if (this._boundMouseMove) {
            document.removeEventListener('mousemove', this._boundMouseMove);
            this._boundMouseMove = null;
        }
        if (this._boundMouseUp) {
            document.removeEventListener('mouseup', this._boundMouseUp);
            this._boundMouseUp = null;
        }
        if (this._boundTouchMove) {
            document.removeEventListener('touchmove', this._boundTouchMove);
            this._boundTouchMove = null;
        }
        if (this._boundTouchEnd) {
            document.removeEventListener('touchend', this._boundTouchEnd);
            this._boundTouchEnd = null;
        }
        if (this._boundLocationChanged) {
            document.removeEventListener('player-location-changed', this._boundLocationChanged);
            this._boundLocationChanged = null;
        }
    }
};

//  Global export so other systems can access TravelPanelMap
window.TravelPanelMap = TravelPanelMap;

//  Cleanup on page unload - no dangling intervals 
window.addEventListener('beforeunload', () => TravelPanelMap.cleanup());

// register with Bootstrap
Bootstrap.register('TravelPanelMap', () => TravelPanelMap.init(), {
    dependencies: ['TravelSystem', 'GameWorld', 'PanelManager'],
    priority: 106,
    severity: 'optional'
});

// Add CSS animations if not already present
(function() {
    if (document.getElementById('travel-panel-map-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'travel-panel-map-styles';
    styles.textContent = `
        /* Travel Mini-Map Container */
        .travel-mini-map-container {
            position: relative;
            width: 100%;
            height: 350px;
            overflow: hidden;
            background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
            border-radius: 8px;
            border: 2px solid rgba(79, 195, 247, 0.3);
        }

        .travel-mini-map {
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
        }

        .travel-mini-map:active {
            cursor: grabbing;
        }

        /* Mini-map Controls */
        .mini-map-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            z-index: 100;
        }

        .mini-map-controls button {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: rgba(30, 30, 50, 0.9);
            color: #4fc3f7;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(79, 195, 247, 0.3);
        }

        .mini-map-controls button:hover {
            background: rgba(79, 195, 247, 0.3);
            transform: scale(1.1);
        }

        /* Map Legend */
        .travel-map-legend {
            margin-top: 10px;
            padding: 12px;
            background: rgba(30, 30, 50, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(79, 195, 247, 0.2);
        }

        .travel-map-legend h4 {
            margin: 0 0 10px 0;
            color: #4fc3f7;
            font-size: 13px;
        }

        .legend-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px 12px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #ccc;
        }

        .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .legend-info {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid rgba(79, 195, 247, 0.2);
            font-size: 10px;
            color: #888;
        }

        .legend-info p {
            margin: 3px 0;
        }

        /* Destination Tab Styles */
        .destination-display {
            min-height: 150px;
        }

        .no-destination {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            text-align: center;
            color: #888;
        }

        .no-dest-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.5;
        }

        .no-destination h3 {
            margin: 0 0 10px 0;
            color: #aaa;
        }

        .no-destination p {
            margin: 0;
            font-size: 12px;
        }

        .destination-info {
            padding: 15px;
            background: rgba(40, 40, 70, 0.6);
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }

        /* 🎯 Reached destination - grayed out */
        .destination-info.destination-reached {
            opacity: 0.6;
            border-left-color: #4caf50;
        }
        .destination-info.destination-reached h3 {
            color: #888;
        }
        .arrived-badge {
            font-size: 14px;
            margin-left: 8px;
        }

        .dest-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .dest-icon {
            font-size: 36px;
        }

        .dest-name-type h3 {
            margin: 0 0 4px 0;
            color: #fff;
            font-size: 18px;
        }

        .dest-type {
            font-size: 12px;
            color: #888;
            text-transform: capitalize;
        }

        .dest-description {
            font-size: 12px;
            color: #ccc;
            line-height: 1.5;
            margin-bottom: 12px;
        }

        .dest-travel-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 11px;
            color: #4fc3f7;
        }

        /* Passage status indicator */
        .passage-status {
            width: 100%;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 4px;
        }

        .passage-status.passage-unlocked {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%);
            border: 1px solid rgba(76, 175, 80, 0.5);
            color: #81c784;
        }

        .passage-status.passage-locked {
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(198, 40, 40, 0.3) 100%);
            border: 1px solid rgba(244, 67, 54, 0.5);
            color: #ef9a9a;
        }

        .destination-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            padding: 10px;
            background: rgba(30, 30, 50, 0.6);
            border-radius: 8px;
        }

        .destination-actions.hidden {
            display: none;
        }

        .travel-btn-primary,
        .travel-btn-secondary,
        .travel-btn-danger {
            flex: 1;
            padding: 10px 15px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .travel-btn-primary {
            background: linear-gradient(180deg, #4caf50 0%, #388e3c 100%);
            color: #fff;
        }

        .travel-btn-primary:hover {
            background: linear-gradient(180deg, #66bb6a 0%, #4caf50 100%);
            transform: translateY(-2px);
        }

        .travel-btn-secondary {
            background: linear-gradient(180deg, #ff9800 0%, #f57c00 100%);
            color: #fff;
        }

        .travel-btn-secondary:hover {
            background: linear-gradient(180deg, #ffb74d 0%, #ff9800 100%);
            transform: translateY(-2px);
        }

        .travel-btn-danger {
            background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%);
            color: #fff;
            flex: 0.3;
        }

        .travel-btn-danger:hover {
            background: linear-gradient(180deg, #ef5350 0%, #f44336 100%);
            transform: translateY(-2px);
        }

        /* Travel Tab Styles */
        .travel-tab-content {
            display: none;
            padding: 10px 0;
        }

        .travel-tab-content.active {
            display: block;
        }

        .travel-tabs {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }

        .travel-tab-btn {
            padding: 8px 12px;
            background: rgba(40, 40, 70, 0.6);
            border: 1px solid rgba(79, 195, 247, 0.2);
            border-radius: 6px;
            color: #888;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .travel-tab-btn:hover {
            background: rgba(79, 195, 247, 0.2);
            color: #4fc3f7;
        }

        .travel-tab-btn.active {
            background: rgba(79, 195, 247, 0.3);
            color: #4fc3f7;
            border-color: #4fc3f7;
        }

        /* Destination marker animation */
        @keyframes dest-pulse {
            0%, 100% { transform: translate(-50%, -150%) scale(1); }
            50% { transform: translate(-50%, -150%) scale(1.2); }
        }

        /* Marker animations (if not already defined) */
        @keyframes marker-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        @keyframes marker-pulse {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.5); opacity: 0; }
        }

        /* Walking animation for travel marker - uses margin-top to not interfere with scaleX */
        @keyframes walk-bounce {
            0%, 100% { margin-top: 0; }
            50% { margin-top: -4px; }
        }
        .emoji-flip-right {
            transform: scaleX(-1) !important;
        }

        /* Travel In Progress Styles */
        .travel-in-progress {
            padding: 15px;
            background: linear-gradient(135deg, rgba(40, 60, 80, 0.8) 0%, rgba(30, 50, 70, 0.9) 100%);
            border-radius: 12px;
            border: 2px solid #ff9800;
            animation: travel-glow 2s ease-in-out infinite;
        }

        @keyframes travel-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(255, 152, 0, 0.3); }
            50% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.5); }
        }

        .travel-status-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }

        .travel-status-header .travel-icon {
            font-size: 28px;
            animation: walk-bounce 0.5s ease-in-out infinite;
        }

        .travel-status-header h3 {
            margin: 0;
            color: #ff9800;
            font-size: 16px;
        }

        .travel-destination-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            /* Prevent overflow - contain text within panel */
            max-width: 100%;
            overflow: hidden;
        }

        .travel-destination-info .dest-icon {
            font-size: 32px;
            flex-shrink: 0; /* Don't shrink the icon */
        }

        .travel-destination-info .dest-details {
            display: flex;
            flex-direction: column;
            /* Allow text to wrap/truncate */
            min-width: 0;
            flex: 1;
            overflow: hidden;
        }

        .travel-destination-info .dest-name {
            font-size: 14px;
            font-weight: bold;
            color: #fff;
            /* Truncate long names */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .travel-destination-info .dest-type {
            font-size: 11px;
            color: #888;
            /* Truncate long type/region info */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .travel-progress-container {
            margin-bottom: 15px;
        }

        .travel-progress-bar {
            position: relative;
            height: 24px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 12px;
            overflow: visible;
            border: 1px solid rgba(255, 152, 0, 0.3);
        }

        .travel-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff9800 0%, #ffb74d 50%, #ff9800 100%);
            background-size: 200% 100%;
            animation: progress-shimmer 2s linear infinite;
            border-radius: 12px;
            position: relative;
            min-width: 30px;
            transition: width 0.25s ease-out;
        }

        @keyframes progress-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .travel-progress-marker {
            position: absolute;
            right: -5px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            animation: walk-bounce 0.4s ease-in-out infinite;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }

        .travel-progress-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
            font-size: 10px;
            color: #888;
        }

        .travel-progress-labels .progress-percent {
            font-weight: bold;
            color: #ff9800;
            font-size: 12px;
        }

        .travel-time-info {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-bottom: 15px;
        }

        .travel-time-info .time-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }

        .travel-time-info .time-label {
            font-size: 10px;
            color: #888;
            margin-bottom: 4px;
        }

        .travel-time-info .time-value {
            font-size: 16px;
            font-weight: bold;
            color: #fff;
        }

        .travel-time-info .time-value.countdown {
            color: #ff9800;
            font-family: monospace;
            font-size: 18px;
        }

        .travel-actions-during {
            display: flex;
            justify-content: center;
        }

        .travel-actions-during .travel-btn-danger {
            padding: 8px 20px;
            font-size: 12px;
            opacity: 0.8;
        }

        .travel-actions-during .travel-btn-danger:hover {
            opacity: 1;
        }
    `;

    document.head.appendChild(styles);
})();

console.log('🗺️ TravelPanelMap loaded');
