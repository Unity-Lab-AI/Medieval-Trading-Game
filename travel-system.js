// Comprehensive Travel System with Interactive World Map
const TravelSystem = {
    // World map configuration
    worldMap: {
        width: 2000,
        height: 1500,
        tileSize: 20,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        minZoom: 0.5,
        maxZoom: 3
    },

    // Player position and travel state
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

    // Map layers
    layers: {
        terrain: null,
        locations: null,
        paths: null,
        resources: null,
        player: null
    },

    // Resource gathering locations
    resourceNodes: [],

    // Points of interest
    pointsOfInterest: [],

    // Travel history
    travelHistory: [],

    // Favorite routes
    favoriteRoutes: [],

    // Map interaction state
    mapInteraction: {
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        hoveredLocation: null,
        selectedLocation: null,
        tooltip: { visible: false, x: 0, y: 0, content: '' }
    },

    // Initialize travel system
    init() {
        this.setupCanvas();
        this.generateWorldMap();
        this.setupEventListeners();
        this.updatePlayerPosition();
        this.render();
    },

    // Setup canvas for map rendering
    setupCanvas() {
        const canvas = document.getElementById('world-map-canvas');
        if (!canvas) {
            // Create canvas if it doesn't exist
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'world-map-canvas';
                newCanvas.width = 800;
                newCanvas.height = 600;
                mapContainer.appendChild(newCanvas);
            }
        }
        
        this.canvas = document.getElementById('world-map-canvas');
        this.ctx = this.canvas.getContext('2d');
    },

    // Generate comprehensive world map data
    generateWorldMap() {
        // Enhanced location data with coordinates and detailed information
        this.locations = {
            // Major cities
            kings_landing: {
                id: 'kings_landing',
                name: "King's Landing",
                type: 'city',
                x: 1000,
                y: 750,
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
                x: 950,
                y: 400,
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

            stonebridge: {
                id: 'stonebridge',
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
            }
        };

        // Generate resource nodes (forests, mines, etc.)
        this.generateResourceNodes();

        // Generate points of interest
        this.generatePointsOfInterest();

        // Generate paths between locations
        this.generatePaths();
    },

    // Generate resource gathering nodes
    generateResourceNodes() {
        this.resourceNodes = [
            // Forests
            {
                id: 'whispering_woods',
                type: 'forest',
                name: 'Whispering Woods',
                x: 800,
                y: 650,
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
                x: 1300,
                y: 500,
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
                x: 1150,
                y: 550,
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
                x: 900,
                y: 900,
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
                x: 1050,
                y: 850,
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

    // Generate points of interest
    generatePointsOfInterest() {
        this.pointsOfInterest = [
            // Inns and taverns
            {
                id: 'restful_inn',
                type: 'inn',
                name: 'The Restful Inn',
                x: 950,
                y: 720,
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
                x: 1150,
                y: 750,
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
                x: 1000,
                y: 650,
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
                x: 950,
                y: 500,
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
                x: 1100,
                y: 700,
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
                x: 1200,
                y: 750,
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
                x: 750,
                y: 800,
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
                x: 1250,
                y: 600,
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

    // Generate paths between locations
    generatePaths() {
        this.paths = [
            // Major roads
            {
                id: 'kings_to_winterfell',
                name: 'Kings Road',
                type: 'road',
                from: 'kings_landing',
                to: 'winterfell',
                points: [
                    { x: 1000, y: 750 },
                    { x: 980, y: 700 },
                    { x: 960, y: 650 },
                    { x: 950, y: 600 },
                    { x: 950, y: 550 },
                    { x: 950, y: 500 },
                    { x: 950, y: 450 },
                    { x: 950, y: 400 }
                ],
                quality: 'excellent',
                safety: 0.8,
                travelBonus: 0.3
            },
            {
                id: 'kings_to_riverport',
                name: 'River Road',
                type: 'road',
                from: 'kings_landing',
                to: 'riverport',
                points: [
                    { x: 1000, y: 750 },
                    { x: 1050, y: 760 },
                    { x: 1100, y: 770 },
                    { x: 1150, y: 780 },
                    { x: 1200, y: 790 },
                    { x: 1200, y: 800 }
                ],
                quality: 'good',
                safety: 0.6,
                travelBonus: 0.2
            },
            {
                id: 'oakhaven_to_kings',
                name: 'Forest Path',
                type: 'path',
                from: 'oakhaven',
                to: 'kings_landing',
                points: [
                    { x: 850, y: 700 },
                    { x: 900, y: 720 },
                    { x: 950, y: 740 },
                    { x: 1000, y: 750 }
                ],
                quality: 'fair',
                safety: 0.4,
                travelBonus: 0.1
            },
            {
                id: 'stonebridge_to_kings',
                name: 'Mountain Trail',
                type: 'trail',
                from: 'stonebridge',
                to: 'kings_landing',
                points: [
                    { x: 1100, y: 600 },
                    { x: 1080, y: 650 },
                    { x: 1050, y: 700 },
                    { x: 1020, y: 725 },
                    { x: 1000, y: 750 }
                ],
                quality: 'poor',
                safety: 0.3,
                travelBonus: -0.1
            }
        ];
    },

    // Setup event listeners for map interaction
    setupEventListeners() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    },

    // Handle mouse down event
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.mapInteraction.isDragging = true;
        this.mapInteraction.dragStart = { x: x - this.worldMap.offsetX, y: y - this.worldMap.offsetY };
    },

    // Handle mouse move event
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.mapInteraction.isDragging) {
            this.worldMap.offsetX = x - this.mapInteraction.dragStart.x;
            this.worldMap.offsetY = y - this.mapInteraction.dragStart.y;
            this.render();
        } else {
            // Check for hover over locations
            const worldPos = this.screenToWorld(x, y);
            const hoveredLocation = this.getLocationAt(worldPos.x, worldPos.y);
            
            if (hoveredLocation !== this.mapInteraction.hoveredLocation) {
                this.mapInteraction.hoveredLocation = hoveredLocation;
                this.updateTooltip(hoveredLocation, x, y);
                this.render();
            }
        }
    },

    // Handle mouse up event
    handleMouseUp(e) {
        this.mapInteraction.isDragging = false;
    },

    // Handle wheel event for zooming
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.worldMap.minZoom, Math.min(this.worldMap.maxZoom, this.worldMap.zoom * zoomDelta));
        
        this.worldMap.zoom = newZoom;
        
        // Adjust offset to zoom towards mouse position
        const newWorldPos = this.screenToWorld(x, y);
        this.worldMap.offsetX += (newWorldPos.x - worldPos.x) * this.worldMap.zoom;
        this.worldMap.offsetY += (newWorldPos.y - worldPos.y) * this.worldMap.zoom;
        
        this.render();
    },

    // Handle click event
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

    // Touch event handlers
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

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.worldMap.offsetX) / this.worldMap.zoom,
            y: (screenY - this.worldMap.offsetY) / this.worldMap.zoom
        };
    },

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.worldMap.zoom + this.worldMap.offsetX,
            y: worldY * this.worldMap.zoom + this.worldMap.offsetY
        };
    },

    // Get location at world coordinates
    getLocationAt(x, y) {
        // Check cities and towns
        for (const [id, location] of Object.entries(this.locations)) {
            const distance = Math.sqrt(Math.pow(x - location.x, 2) + Math.pow(y - location.y, 2));
            if (distance < 30) {
                return location;
            }
        }
        
        // Check resource nodes
        for (const node of this.resourceNodes) {
            const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
            if (distance < node.radius) {
                return node;
            }
        }
        
        // Check points of interest
        for (const poi of this.pointsOfInterest) {
            const distance = Math.sqrt(Math.pow(x - poi.x, 2) + Math.pow(y - poi.y, 2));
            if (distance < 20) {
                return poi;
            }
        }
        
        return null;
    },

    // Update tooltip display
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

    // Generate tooltip content for location
    generateTooltipContent(location) {
        let content = `<div class="map-tooltip">`;
        content += `<h3>${location.name}</h3>`;
        content += `<p class="location-type">${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>`;
        
        if (location.description) {
            content += `<p class="description">${location.description}</p>`;
        }
        
        // Location-specific information
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
        
        // Resource node information
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
        
        // Point of interest information
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

    // Get item display name
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

    // Select location for travel
    selectLocation(location) {
        this.mapInteraction.selectedLocation = location;
        this.showLocationDetails(location);
        this.render();
    },

    // Show detailed location information
    showLocationDetails(location) {
        // Update the travel panel with location details
        const detailsPanel = document.getElementById('location-details');
        if (detailsPanel) {
            let html = `<div class="location-details-content">`;
            html += `<h2>${location.name}</h2>`;
            html += `<p class="location-type">${location.type.charAt(0).toUpperCase() + location.type.slice(1)}</p>`;
            html += `<p class="description">${location.description || 'No description available.'}</p>`;
            
            // Add travel button if not current location
            if (location.id !== this.playerPosition.currentLocation) {
                const travelInfo = this.calculateTravelInfo(location);
                html += `<div class="travel-info">`;
                html += `<p><strong>Travel Time:</strong> ${travelInfo.timeDisplay}</p>`;
                html += `<p><strong>Distance:</strong> ${travelInfo.distance} miles</p>`;
                html += `<p><strong>Safety:</strong> ${travelInfo.safety}%</p>`;
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

    // Calculate travel information
    calculateTravelInfo(destination) {
        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) {
            return { timeDisplay: 'Unknown', distance: 0, safety: 0 };
        }
        
        const distance = this.calculateDistance(currentLoc, destination);
        const path = this.findPath(currentLoc, destination);
        const safety = this.calculatePathSafety(path);
        
        // Calculate travel time based on transportation
        const transport = game.player.currentTransportation || 'foot';
        const speed = this.getTransportSpeed(transport);
        const timeHours = (distance / speed) * (1 - safety * 0.1); // Safety bonus

        return {
            timeDisplay: this.formatTime(timeHours),
            distance: Math.round(distance),
            safety: Math.round(safety * 100),
            transport
        };
    },

    // Calculate distance between locations
    calculateDistance(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return Math.sqrt(dx * dx + dy * dy) / 10; // Convert to miles
    },

    // Find path between locations
    findPath(from, to) {
        // Check if there's a direct path
        const directPath = this.paths.find(path => 
            (path.from === from.id && path.to === to.id) ||
            (path.from === to.id && path.to === from.id)
        );
        
        if (directPath) {
            return directPath;
        }
        
        // For now, return a direct path calculation
        // In a more complex implementation, you'd use pathfinding algorithms
        return {
            type: 'direct',
            safety: 0.5,
            quality: 'fair',
            travelBonus: 0
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

    // Start travel to destination
    startTravel(destinationId) {
        const destination = this.locations[destinationId] || 
                          this.resourceNodes.find(n => n.id === destinationId) ||
                          this.pointsOfInterest.find(p => p.id === destinationId);
        
        if (!destination) {
            addMessage('Invalid destination!');
            return;
        }
        
        const currentLoc = this.getCurrentLocation();
        if (!currentLoc) {
            addMessage('Cannot determine current location!');
            return;
        }
        
        const travelInfo = this.calculateTravelInfo(destination);

        if (typeof UndoRedoManager !== 'undefined') {
            UndoRedoManager.record(`Travel to ${destination.name}`);
        }

        // Start travel
        this.playerPosition.isTraveling = true;
        this.playerPosition.destination = destination;
        this.playerPosition.travelProgress = 0;
        this.playerPosition.travelStartTime = TimeSystem.getTotalMinutes();
        this.playerPosition.travelDuration = travelInfo.timeHours * 60; // Convert to minutes
        this.playerPosition.path = this.findPath(currentLoc, destination);
        
        addMessage(`Starting travel to ${destination.name}... Estimated time: ${travelInfo.timeDisplay}`);

        if (window.AnimationSystem) {
            AnimationSystem.setState('travel', { destination: destination.name, context: travelInfo.transport });
            AnimationSystem.registerBeat(0.25);
        }
        if (window.ControllerSupport) {
            ControllerSupport.tryHaptics?.(0.35, 140);
        }

        // Hide location details panel
        const detailsPanel = document.getElementById('location-details');
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
        }
        
        // Update UI
        this.updateTravelUI();
    },

    // Update travel progress
    updateTravelProgress() {
        if (!this.playerPosition.isTraveling) return;
        
        const currentTime = TimeSystem.getTotalMinutes();
        const elapsed = currentTime - this.playerPosition.travelStartTime;
        this.playerPosition.travelProgress = Math.min(1.0, elapsed / this.playerPosition.travelDuration);
        
        // Update player position along path
        this.updatePlayerPositionAlongPath();
        
        // Check if travel is complete
        if (this.playerPosition.travelProgress >= 1.0) {
            this.completeTravel();
        }
        
        // Check for random encounters
        if (Math.random() < 0.01) { // 1% chance per update
            this.triggerRandomEncounter();
        }
        
        this.updateTravelUI();
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

    // Complete travel
    completeTravel() {
        const destination = this.playerPosition.destination;
        
        this.playerPosition.isTraveling = false;
        this.playerPosition.currentLocation = destination.id;
        this.playerPosition.destination = null;
        this.playerPosition.travelProgress = 0;
        
        // Add to travel history
        this.travelHistory.push({
            from: this.getCurrentLocation()?.name || 'Unknown',
            to: destination.name,
            duration: this.playerPosition.travelDuration,
            timestamp: TimeSystem.getTotalMinutes()
        });
        
        // Update game state
        game.currentLocation = {
            id: destination.id,
            name: destination.name,
            type: destination.type
        };

        addMessage(`Arrived at ${destination.name}!`);

        if (window.AnimationSystem) {
            AnimationSystem.registerBeat(0.35);
            AnimationSystem.setState('idle', { reason: 'Arrival complete' });
        }
        if (window.ControllerSupport) {
            ControllerSupport.tryHaptics?.(0.55, 120);
        }

        ParticleSystem?.spawnBurst('travel', { origin: document.getElementById('map-container') });
        
        // Trigger location-specific events
        this.triggerLocationEvents(destination);
        
        // Update UI
        this.updateTravelUI();
        this.render();
    },

    // Trigger random encounters during travel
    triggerRandomEncounter() {
        const encounters = [
            {
                type: 'merchant',
                message: 'You encounter a traveling merchant!',
                effect: () => {
                    // Could open trading interface
                    addMessage('The merchant offers various goods for trade.');
                }
            },
            {
                type: 'bandits',
                message: 'Bandits ambush you!',
                effect: () => {
                    // Could trigger combat or skill check
                    const success = Math.random() > 0.5;
                    if (success) {
                        addMessage('You successfully fend off the bandits!');
                    } else {
                        const goldLost = Math.floor(Math.random() * 50) + 10;
                        game.player.gold = Math.max(0, game.player.gold - goldLost);
                        addMessage(`You lose ${goldLost} gold to the bandits!`);
                        updatePlayerInfo();
                    }
                }
            },
            {
                type: 'guard_patrol',
                message: 'You meet a friendly guard patrol.',
                effect: () => {
                    addMessage('The guards share useful information about the area ahead.');
                }
            },
            {
                type: 'weather',
                message: 'A sudden storm slows your progress.',
                effect: () => {
                    this.playerPosition.travelDuration *= 1.2;
                    addMessage('Travel time increased by 20% due to bad weather.');
                }
            }
        ];
        
        const encounter = encounters[Math.floor(Math.random() * encounters.length)];
        addMessage(encounter.message);
        encounter.effect();
    },

    // Trigger location-specific events
    triggerLocationEvents(location) {
        // Check for property ownership in this location
        const properties = PropertySystem.getPlayerProperties().filter(p => p.location === location.id);
        if (properties.length > 0) {
            addMessage(`You own ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} in this location.`);
        }
        
        // Check for employees in this location
        const employees = EmployeeSystem.getPlayerEmployees().filter(e => {
            const prop = PropertySystem.getProperty(e.assignedProperty);
            return prop && prop.location === location.id;
        });
        if (employees.length > 0) {
            addMessage(`${employees.length} employee${employees.length === 1 ? '' : 's'} working in this location.`);
        }
    },

    // Update travel UI
    updateTravelUI() {
        const travelPanel = document.getElementById('travel-panel');
        if (!travelPanel) return;
        
        if (this.playerPosition.isTraveling) {
            const progress = Math.round(this.playerPosition.travelProgress * 100);
            const remainingTime = this.formatTime(
                (this.playerPosition.travelDuration * (1 - this.playerPosition.travelProgress)) / 60
            );
            
            travelPanel.innerHTML = `
                <div class="travel-progress">
                    <h3>Traveling to ${this.playerPosition.destination.name}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p>Progress: ${progress}%</p>
                    <p>Time remaining: ${remainingTime}</p>
                </div>
            `;
        } else {
            this.updateDestinationsList();
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
        if (this.playerPosition.currentLocation) {
            return this.locations[this.playerPosition.currentLocation] ||
                   this.resourceNodes.find(n => n.id === this.playerPosition.currentLocation) ||
                   this.pointsOfInterest.find(p => p.id === this.playerPosition.currentLocation);
        }
        
        // Find nearest location
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
            }
        }
    },

    // Render the map
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply zoom and pan
        this.ctx.translate(this.worldMap.offsetX, this.worldMap.offsetY);
        this.ctx.scale(this.worldMap.zoom, this.worldMap.zoom);
        
        // Render terrain background
        this.renderTerrain();
        
        // Render paths
        this.renderPaths();
        
        // Render resource nodes
        this.renderResourceNodes();
        
        // Render locations
        this.renderLocations();
        
        // Render points of interest
        this.renderPointsOfInterest();
        
        // Render player
        this.renderPlayer();
        
        // Restore context state
        this.ctx.restore();
        
        // Render tooltip (not affected by zoom/pan)
        this.renderTooltip();
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

    // Render resource nodes
    renderResourceNodes() {
        this.resourceNodes.forEach(node => {
            // Draw resource area
            this.ctx.fillStyle = this.getResourceColor(node.type);
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw resource icon
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '20px Arial';
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
            mine: '⛏️',
            herb: '🌿'
        };
        return icons[type] || '💎';
    },

    // Render locations
    renderLocations() {
        Object.values(this.locations).forEach(location => {
            const isSelected = this.mapInteraction.selectedLocation === location;
            const isHovered = this.mapInteraction.hoveredLocation === location;
            
            // Draw location marker
            this.ctx.fillStyle = this.getLocationColor(location.type);
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#000000';
            this.ctx.lineWidth = isSelected ? 3 : 1;
            
            const size = this.getLocationSize(location.size);
            
            this.ctx.beginPath();
            this.ctx.arc(location.x, location.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw location name
            this.ctx.fillStyle = '#000000';
            this.ctx.font = isHovered ? 'bold 14px Arial' : '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(location.name, location.x, location.y + size + 5);
        });
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

    // Render points of interest
    renderPointsOfInterest() {
        this.pointsOfInterest.forEach(poi => {
            if (poi.hidden && !poi.discovered) return;
            
            const isHovered = this.mapInteraction.hoveredLocation === poi;
            
            // Draw POI marker
            this.ctx.fillStyle = '#FFA500';
            this.ctx.strokeStyle = isHovered ? '#FFD700' : '#000000';
            this.ctx.lineWidth = isHovered ? 2 : 1;
            
            this.ctx.beginPath();
            this.ctx.arc(poi.x, poi.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw POI icon
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(poi.icon, poi.x, poi.y);
        });
    },

    // Render player position
    renderPlayer() {
        this.ctx.fillStyle = '#FF1493';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        // Draw player as a triangle pointing in travel direction
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
            this.ctx.moveTo(10, 0);
            this.ctx.lineTo(-5, -5);
            this.ctx.lineTo(-5, 5);
            this.ctx.closePath();
            this.ctx.restore();
        } else {
            // Static triangle
            this.ctx.moveTo(this.playerPosition.x + 10, this.playerPosition.y);
            this.ctx.lineTo(this.playerPosition.x - 5, this.playerPosition.y - 5);
            this.ctx.lineTo(this.playerPosition.x - 5, this.playerPosition.y + 5);
            this.ctx.closePath();
        }
        this.ctx.fill();
        this.ctx.stroke();
    },

    // Render tooltip
    renderTooltip() {
        if (!this.mapInteraction.tooltip.visible) return;
        
        const tooltip = this.mapInteraction.tooltip;
        
        // Create tooltip element if it doesn't exist
        let tooltipElement = document.getElementById('map-tooltip');
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.id = 'map-tooltip';
            tooltipElement.className = 'map-tooltip-container';
            document.body.appendChild(tooltipElement);
        }
        
        tooltipElement.innerHTML = tooltip.content;
        tooltipElement.style.left = `${tooltip.x + 10}px`;
        tooltipElement.style.top = `${tooltip.y - 10}px`;
        tooltipElement.style.display = 'block';
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
        
        // Add resource to inventory
        if (!game.player.inventory[resourceType]) {
            game.player.inventory[resourceType] = 0;
        }
        game.player.inventory[resourceType] += yield;
        game.player.inventory.currentWeight += totalWeight;
        
        // Reduce resource abundance (depletion)
        node.abundance[resourceType] *= 0.9;
        
        // Gain experience
        this.gainGatheringExperience(resourceType, yield);

        addMessage(`Gathered ${yield} ${this.getItemName(resourceType)}!`);

        if (typeof ParticleSystem !== 'undefined') {
            ParticleSystem.spawnResource();
        }

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

    // Fast travel system
    fastTravel(destinationId, cost) {
        if (game.player.gold < cost) {
            addMessage(`You need ${cost} gold for fast travel!`);
            return false;
        }
        
        const destination = this.locations[destinationId];
        if (!destination) {
            addMessage('Invalid destination!');
            return false;
        }
        
        // Deduct cost
        game.player.gold -= cost;
        
        // Instant travel
        this.playerPosition.x = destination.x;
        this.playerPosition.y = destination.y;
        this.playerPosition.currentLocation = destination.id;
        
        // Update game state
        game.currentLocation = {
            id: destination.id,
            name: destination.name,
            type: destination.type
        };
        
        // Add to travel history
        this.travelHistory.push({
            from: this.getCurrentLocation()?.name || 'Unknown',
            to: destination.name,
            duration: 0,
            cost: cost,
            fastTravel: true,
            timestamp: TimeSystem.getTotalMinutes()
        });
        
        addMessage(`Fast traveled to ${destination.name} for ${cost} gold!`);
        
        // Update UI
        updatePlayerInfo();
        this.updateTravelUI();
        this.render();
        
        return true;
    },

    // Save travel system state
    saveState() {
        return {
            playerPosition: this.playerPosition,
            travelHistory: this.travelHistory,
            favoriteRoutes: this.favoriteRoutes,
            resourceNodes: this.resourceNodes,
            pointsOfInterest: this.pointsOfInterest
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
    },

    // Persist travel state for saving/undo
    getState() {
        return deepClone({
            playerPosition: this.playerPosition,
            travelHistory: this.travelHistory,
            favoriteRoutes: this.favoriteRoutes,
            resourceNodes: this.resourceNodes,
            pointsOfInterest: this.pointsOfInterest
        });
    }
};

// Initialize travel system when game loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game to be initialized
    setTimeout(() => {
        if (typeof game !== 'undefined') {
            TravelSystem.init();
        }
    }, 100);
});

// Update travel progress in game loop
const originalUpdate = game?.update;
if (originalUpdate) {
    game.update = function(deltaTime) {
        const result = originalUpdate.call(this, deltaTime);
        TravelSystem.updateTravelProgress();
        return result;
    };
}