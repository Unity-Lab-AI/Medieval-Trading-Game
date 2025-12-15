// ═══════════════════════════════════════════════════════════════
// GAME WORLD RENDERER - main world map rendering engine
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const GameWorldRenderer = {
 // dom elements - the building blocks of our misery
    container: null,
    mapElement: null,
    tooltipElement: null,

    // ═══════════════════════════════════════════════════════════════
    //  TUTORIAL MODE HELPERS - Check if we're in the training dimension
    // ═══════════════════════════════════════════════════════════════
    isInTutorialMode() {
        return typeof game !== 'undefined' && game.inTutorial === true;
    },

    // Get the right locations object based on current mode
    getActiveLocations() {
        if (this.isInTutorialMode() && typeof TutorialWorld !== 'undefined') {
            return TutorialWorld.locations || {};
        }
        return (typeof GameWorld !== 'undefined' && GameWorld.locations) ? GameWorld.locations : {};
    },

 // map state - where we are in this digital purgatory
 // map is now 2400x1800 - massive infinite scroll vibes
    mapState: {
        zoom: 1,             // Start at 1:1 scale (natural size)
        offsetX: 0,
        offsetY: 0,
        minZoom: 0.5,        // Max zoomed out - shows map with room for stars/moon borders
        maxZoom: 2,          // Max zoomed in - close up detail
        defaultZoom: 2,      // Default zoom for reset (max zoom per Gee's request)
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastOffsetX: 0,
        lastOffsetY: 0
    },

 // map dimensions - the size of our suffering
 // NOTE: These are FIXED dimensions, not responsive to viewport size
 // The map is rendered at this exact pixel size, then scaled/panned via transform
    MAP_WIDTH: 2400,
    MAP_HEIGHT: 1800,

 // original map scale - locations were designed for 800x600
 // We scale them up to fill the larger map with padding
    ORIGINAL_WIDTH: 800,
    ORIGINAL_HEIGHT: 600,
    MAP_PADDING: 200, // padding around edges

 // Scale location position from original 800x600 to new larger map
    scalePosition(pos) {
        if (!pos) return null;
        const scaleX = (this.MAP_WIDTH - this.MAP_PADDING * 2) / this.ORIGINAL_WIDTH;
        const scaleY = (this.MAP_HEIGHT - this.MAP_PADDING * 2) / this.ORIGINAL_HEIGHT;
        return {
            x: pos.x * scaleX + this.MAP_PADDING,
            y: pos.y * scaleY + this.MAP_PADDING
        };
    },

 // get location name - returns doom name if in doom world 
    getLocationName(locationId) {
 // check if we're in doom world
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);

        if (inDoom) {
 // try DoomWorldNPCs for corrupted names
            if (typeof DoomWorldNPCs !== 'undefined' && DoomWorldNPCs.locationNames[locationId]) {
                return DoomWorldNPCs.locationNames[locationId];
            }
 // try DoomQuests for location data
            if (typeof DoomQuests !== 'undefined' && DoomQuests.doomLocations) {
                const doomLoc = DoomQuests.doomLocations['doom_' + locationId];
                if (doomLoc && doomLoc.doomName) return doomLoc.doomName;
            }
 // fallback: add doom prefix to normal name
            const normalLoc = GameWorld?.locations?.[locationId];
            if (normalLoc) return 'Ruined ' + normalLoc.name;
        }

 // normal world - just return the regular name
        const location = GameWorld?.locations?.[locationId];
        return location ? location.name : locationId;
    },

    // Get the travel emoji based on player's transport
    // Returns 🏇 if player owns a horse, otherwise walking emoji
    // movingRight: true = facing right, false = facing left
    getTravelEmoji(movingRight = true) {
        // Check if player owns a horse in transport
        const hasHorse = typeof game !== 'undefined' &&
                         game.player?.ownedTransport?.includes('horse');

        if (hasHorse) {
            // Horse rider emoji - use CSS transform to flip for direction
            // 🏇 naturally faces left, so we flip it for right movement
            return { emoji: '🏇', needsFlip: movingRight };
        } else {
            // Walking emoji - 🚶 faces left, 🚶‍➡️ (ZWJ right arrow) faces right
            return { emoji: movingRight ? '🚶‍➡️' : '🚶', needsFlip: false };
        }
    },

 // location visit history - breadcrumbs of everywhere you've been and regretted
    locationHistory: [],
    currentDestination: null,
    HISTORY_STORAGE_KEY: 'trader-claude-location-history',

 // location styles - delegated to MapRendererBase, with size overrides for main map
 // uses shared styles from MapRendererBase.LOCATION_STYLES
    get locationStyles() {
 // return base styles with size multiplier for main map (1.0x)
        const styles = {};
        if (typeof MapRendererBase !== 'undefined') {
            Object.entries(MapRendererBase.LOCATION_STYLES).forEach(([type, base]) => {
                styles[type] = { color: base.color, icon: base.icon, size: base.baseSize };
            });
        }
        return styles;
    },

 // summon the renderer from the digital abyss
    init() {
        console.log('🗺️ GameWorldRenderer rising from its slumber... time to paint some suffering');

        this.container = document.getElementById('map-container');
        if (!this.container) {
 // map container not in DOM yet - will retry when called again
            console.warn('🗺️ Map container not found - will retry');
            return false;
        }

 // conjure the map element from the digital void
        this.createMapElement();

 // create the tooltip - whisper location secrets on hover
        this.createTooltip();

 // Wire up the event listeners - clicks, drags, the whole chaotic dance
        this.setupEventListeners();

 // resurrect your travel history from localStorage
        this.loadLocationHistory();

 // paint the world onto the canvas
        this.render();

 // center the fucking map after the DOM settles its shit
        setTimeout(() => {
            this.resetView();
        }, 200);

 // center again because async loading is a beautiful disaster
        setTimeout(() => {
            this.resetView();
 // update your travel journal
            this.updateHistoryPanel();
 // mark your starting location if this is a new journey
            if (this.locationHistory.length === 0 && typeof game !== 'undefined' && game.currentLocation) {
                this.recordLocationVisit(game.currentLocation.id, { isFirstVisit: true });
            }
        }, 1000);

        console.log('🗺️ GameWorldRenderer v2: ready to visualize your despair');
        return true;
    },

 // seasonal backdrop images - one for each season, they fade into each other
 // place your AI-generated map images at:
 // assets/images/world-map-spring.png
 // assets/images/world-map-summer.png
 // assets/images/world-map-autumn.png
 // assets/images/world-map-winter.png
 // assets/images/world-map-dungeon.png
    SEASONAL_BACKDROPS: {
        spring: './assets/images/world-map-spring.png',
        summer: './assets/images/world-map-summer.png',
        autumn: './assets/images/world-map-autumn.png',
        fall: './assets/images/world-map-autumn.png', // alias for autumn
        winter: './assets/images/world-map-winter.png'
    },
 // dungeon backdrop - fades in when entering dungeon locations
    DUNGEON_BACKDROP: './assets/images/world-map-dungeon.png',
 // tutorial backdrop - the training dimension has its own look
    TUTORIAL_BACKDROP: './assets/images/tutorial-map-bg.png',
 // track if we're currently in dungeon mode
    isInDungeonMode: false,
 // fallback for legacy single-image setup
    BACKDROP_IMAGE: './assets/images/world-map-backdrop.png',
 // fade transition duration in milliseconds
 // 60 seconds real time = ~2 in-game hours at normal speed for a nice slow crossfade
    SEASON_FADE_DURATION: 60000,
 // current and previous backdrop elements for crossfade
    currentBackdrop: null,
    previousBackdrop: null,
    currentSeason: null,

 // conjure the map container from the html void
    createMapElement() {
 // banish the old canvas to the shadow realm
        const oldCanvas = document.getElementById('world-map-canvas');
        if (oldCanvas) {
            oldCanvas.style.display = 'none';
        }

 // summon the map element or retrieve it from the DOM
        this.mapElement = document.getElementById('world-map-html');
        if (!this.mapElement) {
            this.mapElement = document.createElement('div');
            this.mapElement.id = 'world-map-html';
            this.mapElement.className = 'world-map-html';
            this.container.appendChild(this.mapElement);
        }

 // check if backdrop image exists, use it if available
        const backdropUrl = this.BACKDROP_IMAGE;
        const fallbackGradient = `
            radial-gradient(ellipse at 30% 20%, rgba(22, 33, 62, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(15, 52, 96, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(26, 26, 46, 0.9) 0%, transparent 70%),
            linear-gradient(135deg, #0a0a1a 0%, #0d1117 25%, #161b22 50%, #0d1117 75%, #0a0a1a 100%)
        `;

 // Style the map element - MASSIVE map for infinite scroll feel
 // CRITICAL: isolation: isolate creates a new stacking context so child z-index works! 
        this.mapElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.MAP_WIDTH}px;
            height: ${this.MAP_HEIGHT}px;
            background: ${fallbackGradient};
            background-size: cover;
            background-position: center;
            transform-origin: 0 0;
            cursor: grab;
            user-select: none;
            border-radius: 0;
            isolation: isolate;
        `;

 // try to load the backdrop image - if it exists, use it
        this.loadBackdropImage(backdropUrl);
    },

 // load backdrop image - tries tutorial, seasonal, then falls back to single image
    loadBackdropImage(fallbackUrl) {
 // first, setup backdrop container for seasonal crossfades
        this.setupBackdropContainer();

 // TUTORIAL MODE - use tutorial backdrop if in tutorial
        if (this.isInTutorialMode()) {
            console.log('🎓 Tutorial mode detected - loading tutorial backdrop');
            this.loadTutorialBackdrop();
            return; // Don't setup season listener for tutorial
        }

 // try to detect current season from TimeSystem
        let currentSeason = 'summer'; // default
        if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
            currentSeason = TimeSystem.getSeason().toLowerCase();
        }

 // try seasonal image first
        const seasonalUrl = this.SEASONAL_BACKDROPS[currentSeason];
        if (seasonalUrl) {
            this.loadSeasonalBackdrop(currentSeason);
        } else {
 // fallback to single backdrop image
            this.loadSingleBackdrop(fallbackUrl);
        }

 // listen for season changes
        this.setupSeasonListener();
    },

 // load tutorial-specific backdrop
    loadTutorialBackdrop() {
        const imageUrl = this.TUTORIAL_BACKDROP;
        const img = new Image();
        img.onload = () => {
            console.log('🎓 Tutorial backdrop loaded - painting the training grounds');
            this.transitionToBackdrop(imageUrl, 'tutorial');
        };
        img.onerror = () => {
            console.warn('🎓 Tutorial backdrop not found at ' + imageUrl + ' - using gradient fallback');
            // Use a special tutorial gradient as fallback
            if (this.mapElement) {
                this.mapElement.style.background = `
                    radial-gradient(ellipse at 50% 30%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
                    radial-gradient(ellipse at 30% 70%, rgba(139, 195, 74, 0.2) 0%, transparent 40%),
                    linear-gradient(135deg, #1a2f1a 0%, #0d1f0d 50%, #0a1a0a 100%)
                `;
            }
        };
        img.src = imageUrl;
    },

 // setup the backdrop container for crossfade transitions
    setupBackdropContainer() {
 // create a container for backdrop layers (for crossfade effect)
        let backdropContainer = this.mapElement.querySelector('.backdrop-container');
        if (!backdropContainer) {
            backdropContainer = document.createElement('div');
            backdropContainer.className = 'backdrop-container';
 // use explicit dimensions to match map size - 100% doesn't work with transforms
            backdropContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${this.MAP_WIDTH}px;
                height: ${this.MAP_HEIGHT}px;
                z-index: 0;
                pointer-events: none;
                overflow: hidden;
            `;
            this.mapElement.insertBefore(backdropContainer, this.mapElement.firstChild);
        }
        this.backdropContainer = backdropContainer;
    },

 // load and display a seasonal backdrop with crossfade
    loadSeasonalBackdrop(season) {
        const seasonKey = season.toLowerCase();
        const imageUrl = this.SEASONAL_BACKDROPS[seasonKey];

        if (!imageUrl) {
            console.warn('🗺️ No backdrop for season:', season);
            return;
        }

 // don't reload if same season
        if (this.currentSeason === seasonKey) return;

        console.log(`🗺️ Loading ${seasonKey} backdrop...`);

        const img = new Image();
        img.onload = () => {
            console.log(`🗺️ ${seasonKey} backdrop loaded - transitioning seasons...`);
            this.transitionToBackdrop(imageUrl, seasonKey);
        };
        img.onerror = () => {
            console.log(`🗺️ No ${seasonKey} backdrop found, trying fallback...`);
            this.loadSingleBackdrop(this.BACKDROP_IMAGE);
        };
        img.src = imageUrl;
    },

 // crossfade transition to new backdrop
    transitionToBackdrop(imageUrl, season) {
        if (!this.backdropContainer) {
            this.setupBackdropContainer();
        }

 // move current to previous (if exists)
        if (this.currentBackdrop) {
            this.previousBackdrop = this.currentBackdrop;
            this.previousBackdrop.style.zIndex = '-1'; // behind new backdrop during transition
        }

 // create new backdrop layer
        const newBackdrop = document.createElement('div');
        newBackdrop.className = 'backdrop-layer';
 // use explicit dimensions and separate background-image for reliability
 // z-index: 0 - BACKGROUND LAYER (below weather at z-index 2-3)
        newBackdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.MAP_WIDTH}px;
            height: ${this.MAP_HEIGHT}px;
            background-image: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.1)), url('${imageUrl}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transition: opacity ${this.SEASON_FADE_DURATION}ms ease-in-out;
            z-index: 0;
        `;

        this.backdropContainer.appendChild(newBackdrop);
        this.currentBackdrop = newBackdrop;
        this.currentSeason = season;

 // trigger the fade in
        requestAnimationFrame(() => {
            newBackdrop.style.opacity = '1';
 // remove the gradient background from mapElement so backdrop shows through
            if (this.mapElement) {
                this.mapElement.style.background = 'transparent';
            }
        });

 // remove old backdrop after transition
        if (this.previousBackdrop) {
            const oldBackdrop = this.previousBackdrop;
            setTimeout(() => {
                oldBackdrop.style.opacity = '0';
                setTimeout(() => {
                    if (oldBackdrop.parentNode) {
                        oldBackdrop.remove();
                    }
                }, this.SEASON_FADE_DURATION);
            }, 100);
        }

        console.log(`🗺️ Season transition to ${season} complete`);
    },

 // fallback: load single backdrop image
    loadSingleBackdrop(imageUrl) {
        const img = new Image();
        img.onload = () => {
            console.log('🗺️ Backdrop image loaded - painting the realm with style');
            this.transitionToBackdrop(imageUrl, 'default');
        };
        img.onerror = () => {
            console.log('🗺️ No backdrop image found at ' + imageUrl + ' - using gradient fallback');
            console.log('🗺️ To use seasonal backdrops, place images at: assets/images/world-map-[season].png');
 // keep the gradient fallback - already applied to mapElement
        };
        img.src = imageUrl;
    },

 // force a backdrop refresh based on current mode (tutorial vs normal)
 // call this when switching between tutorial and main game
    forceRefreshBackdrop() {
        console.log('🗺️ Force refreshing backdrop - tutorial mode:', this.isInTutorialMode());
        // Reset current season to force reload
        this.currentSeason = null;
        this.loadBackdropImage(this.BACKDROP_IMAGE);
    },

 // listen for season changes from TimeSystem
    setupSeasonListener() {
 // poll for season changes every minute (in-game time moves fast)
        // FIX: Use TimerManager to prevent memory leaks
        if (this.seasonCheckInterval) {
            TimerManager.clearTimeout(this.seasonCheckInterval);
        }

        this.seasonCheckInterval = TimerManager.setInterval(() => {
            // DON'T override tutorial backdrop with seasonal changes!
            if (this.isInTutorialMode()) {
                return;
            }
            if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
                const newSeason = TimeSystem.getSeason().toLowerCase();
                if (newSeason !== this.currentSeason) {
                    console.log(`🗺️ Season changed: ${this.currentSeason} → ${newSeason}`);
                    this.loadSeasonalBackdrop(newSeason);
                }
            }
        }, 10000); // check every 10 seconds real-time

        console.log('🗺️ Season listener active - watching for seasonal transitions');
    },

 // force a season change (for testing or manual control)
    setSeason(season) {
        console.log(`🗺️ Manually setting season to: ${season}`);
        this.loadSeasonalBackdrop(season);
    },

 // DUNGEON BACKDROP SYSTEM - The darkness calls when you enter the depths
 // ═══════════════════════════════════════════════════════════════════════════

 // check if a location is a dungeon type
    isDungeonLocation(locationId) {
        if (!locationId) return false;
        const locations = this.getActiveLocations();
        if (!locations || Object.keys(locations).length === 0) return false;
        const location = locations[locationId];
        if (!location) return false;
        return ['dungeon', 'cave', 'ruins', 'mine'].includes(location.type);
    },

 // enter dungeon mode - fade to dungeon backdrop + apocalypse weather
    enterDungeonMode() {
        if (this.isInDungeonMode) return;

        console.log('🗺️ Entering the darkness... dungeon backdrop activating');
        this.isInDungeonMode = true;

 // load dungeon backdrop with faster fade (2 seconds for dramatic effect)
        const img = new Image();
        img.onload = () => {
            this.transitionToDungeonBackdrop(this.DUNGEON_BACKDROP);
        };
        img.onerror = () => {
            console.warn('🗺️ Dungeon backdrop not found at:', this.DUNGEON_BACKDROP);
        };
        img.src = this.DUNGEON_BACKDROP;

 // trigger apocalypse weather with meteors!
        if (typeof WeatherSystem !== 'undefined') {
 // Save current weather before dungeon
            this.weatherBeforeDungeon = WeatherSystem.currentWeather;
            WeatherSystem.changeWeather('apocalypse');
            console.log('☄️ Apocalypse weather activated - meteors incoming!');
        }
    },

 // exit dungeon mode - return to seasonal backdrop + normal weather
    exitDungeonMode() {
        if (!this.isInDungeonMode) return;

        console.log('🗺️ Leaving the depths... returning to the surface world');
        this.isInDungeonMode = false;

 // return to current season's backdrop
        let currentSeason = 'summer';
        if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
            currentSeason = TimeSystem.getSeason().toLowerCase();
        }
        this.loadSeasonalBackdrop(currentSeason);

 // restore previous weather or generate seasonal weather
        if (typeof WeatherSystem !== 'undefined') {
            if (this.weatherBeforeDungeon && WeatherSystem.weatherTypes[this.weatherBeforeDungeon]) {
                WeatherSystem.changeWeather(this.weatherBeforeDungeon);
                console.log(`🌤️ Weather restored to: ${this.weatherBeforeDungeon}`);
            } else {
                const seasonalWeather = WeatherSystem.selectWeatherForSeason();
                WeatherSystem.changeWeather(seasonalWeather);
                console.log(`🌤️ Seasonal weather applied: ${seasonalWeather}`);
            }
            this.weatherBeforeDungeon = null;
        }
    },

 // saved weather state before entering dungeon
    weatherBeforeDungeon: null,

 // special dungeon transition - faster than seasonal (2 second fade)
    transitionToDungeonBackdrop(imageUrl) {
        if (!this.backdropContainer) {
            this.setupBackdropContainer();
        }

 // move current to previous
        if (this.currentBackdrop) {
            this.previousBackdrop = this.currentBackdrop;
            this.previousBackdrop.style.zIndex = '-1'; // behind new backdrop during transition
        }

 // create dungeon backdrop with faster fade and darker overlay
 // z-index: 0 - BACKGROUND LAYER (below weather at z-index 2-3)
        const newBackdrop = document.createElement('div');
        newBackdrop.className = 'backdrop-layer dungeon-backdrop';
        newBackdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.MAP_WIDTH}px;
            height: ${this.MAP_HEIGHT}px;
            background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(20, 0, 40, 0.2)), url('${imageUrl}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transition: opacity 2000ms ease-in-out;
            z-index: 0;
        `;

        this.backdropContainer.appendChild(newBackdrop);
        this.currentBackdrop = newBackdrop;

 // trigger the fade in
        requestAnimationFrame(() => {
            newBackdrop.style.opacity = '1';
            if (this.mapElement) {
                this.mapElement.style.background = 'transparent';
            }
        });

 // remove old backdrop after transition
        if (this.previousBackdrop) {
            const oldBackdrop = this.previousBackdrop;
            setTimeout(() => {
                oldBackdrop.style.opacity = '0';
                setTimeout(() => {
                    if (oldBackdrop.parentNode) {
                        oldBackdrop.remove();
                    }
                }, 2000);
            }, 100);
        }

        console.log('🗺️ Dungeon backdrop transition complete - embrace the darkness');
    },

 // update backdrop based on current location (call this when location changes)
    updateBackdropForLocation(locationId) {
        if (this.isDungeonLocation(locationId)) {
            this.enterDungeonMode();
        } else if (this.isInDungeonMode) {
            this.exitDungeonMode();
        }
    },

 // create tooltip - hover over things to learn about your mistakes
    createTooltip() {
        this.tooltipElement = document.getElementById('map-tooltip');
        if (!this.tooltipElement) {
            this.tooltipElement = document.createElement('div');
            this.tooltipElement.id = 'map-tooltip';
            this.tooltipElement.className = 'map-tooltip';
            document.body.appendChild(this.tooltipElement);
        }

        this.tooltipElement.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 10px 15px;
            border-radius: 8px;
            border: 2px solid #4fc3f7;
            font-size: 14px;
            max-width: 300px;
            z-index: 800; /* Z-INDEX STANDARD: Tooltips (world map) */
            pointer-events: none;
            display: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
    },

 // hook up the event listeners so humans can interact with our creation
    setupEventListeners() {
 // Map dragging
        this.mapElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

 // Zoom with scroll wheel
        this.container.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

 // Touch support
        this.mapElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));

        console.log('🗺️ Event listeners attached');
    },

 // paint the world - pixels arranged to simulate meaning
    render() {
        // Check for correct world based on mode
        const hasActiveWorld = this.isInTutorialMode()
            ? (typeof TutorialWorld !== 'undefined')
            : (typeof GameWorld !== 'undefined');

        if (!this.mapElement || !hasActiveWorld) {
            console.warn('🗺️ Cannot render - map element or world not ready (tutorial:', this.isInTutorialMode(), ')');
            return;
        }

 // Check if backdrop needs to switch between tutorial/normal
 // Tutorial uses 'tutorial' season, normal uses actual season
        const expectedSeason = this.isInTutorialMode() ? 'tutorial' : null;
        if (expectedSeason === 'tutorial' && this.currentSeason !== 'tutorial') {
            console.log('🎓 Render: switching to tutorial backdrop');
            this.loadTutorialBackdrop();
        } else if (expectedSeason === null && this.currentSeason === 'tutorial') {
            console.log('🗺️ Render: switching from tutorial to normal backdrop');
            this.forceRefreshBackdrop();
        }

 // clear existing locations BUT preserve the backdrop container!
 // The backdrop is precious - don't destroy it on every render
        const backdrop = this.mapElement.querySelector('.backdrop-container');
        this.mapElement.innerHTML = '';
        if (backdrop) {
            this.mapElement.appendChild(backdrop);
        } else if (this.backdropContainer) {
 // Re-attach saved backdrop container if it exists
            this.mapElement.appendChild(this.backdropContainer);
        }

 // Calculate which locations are visible/explored
        const visibilityMap = this.calculateLocationVisibility();

 // Draw connection lines first (behind locations) - only for visible connections
        this.drawConnections(visibilityMap);

 // Calculate label offsets to prevent overlapping text (only for visible locations)
        const locations = this.getActiveLocations();
        const visibleLocations = {};
        Object.entries(locations).forEach(([id, loc]) => {
            if (visibilityMap[id] && visibilityMap[id] !== 'hidden') {
                visibleLocations[id] = loc;
            }
        });
        const labelOffsets = this.calculateLabelOffsets(visibleLocations);

 // Draw each location with its calculated label offset and visibility state
        let createdCount = 0;
        Object.values(locations).forEach(location => {
            const visibility = visibilityMap[location.id] || 'hidden';
            if (visibility !== 'hidden') {
                const offset = labelOffsets[location.id] || 0;
                this.createLocationElement(location, offset, visibility);
                createdCount++;
            }
        });
        console.log(`🗺️ Created ${createdCount} location elements on map`);

 // Apply current transform
        this.updateTransform();

 // Mark current location
        this.highlightCurrentLocation();

 // Render player-owned property markers
        this.renderPropertyMarkers();

 // reapply quest target marker if a quest is tracked 
        if (typeof QuestSystem !== 'undefined' && QuestSystem.trackedQuestId && QuestSystem.updateQuestMapMarker) {
            QuestSystem.updateQuestMapMarker();
        }
    },

 // render property markers for player-owned properties
    renderPropertyMarkers() {
        if (typeof game === 'undefined' || !game.player || !game.player.ownedProperties) return;
        if (!Array.isArray(game.player.ownedProperties) || game.player.ownedProperties.length === 0) return;

        const locations = this.getActiveLocations();

 // Group properties by location
        const propertiesByLocation = {};
        game.player.ownedProperties.forEach(property => {
            const locId = property.location;
            if (!propertiesByLocation[locId]) {
                propertiesByLocation[locId] = [];
            }
            propertiesByLocation[locId].push(property);
        });

 // Render markers for each location with properties
        Object.entries(propertiesByLocation).forEach(([locationId, properties]) => {
            const location = locations[locationId];
            if (!location || !location.mapPosition) return;

            this.createPropertyMarker(location, properties);
        });
    },

 // create a property marker badge at a location
    createPropertyMarker(location, properties) {
        if (!location.mapPosition) return;

 // scale position for larger map
        const scaledPos = this.scalePosition(location.mapPosition);
        if (!scaledPos) return;

        const style = this.locationStyles[location.type] || this.locationStyles.town;

 // Count different property states
        const underConstruction = properties.filter(p => p.underConstruction).length;
        const rented = properties.filter(p => p.isRented && !p.underConstruction).length;
        const owned = properties.filter(p => !p.isRented && !p.underConstruction).length;
        const total = properties.length;

 // Determine badge color based on majority type
        let badgeColor = '#4CAF50'; // green for owned
        let badgeIcon = '🏠';

        if (underConstruction > 0 && underConstruction >= owned && underConstruction >= rented) {
            badgeColor = '#FF9800'; // orange for construction
            badgeIcon = '🔨';
        } else if (rented > 0 && rented >= owned) {
            badgeColor = '#2196F3'; // blue for rented
            badgeIcon = '📝';
        }

 // Create property marker badge
        const marker = document.createElement('div');
        marker.className = 'property-marker-badge';
        marker.dataset.locationId = location.id;

 // Position relative to the location (offset to bottom-right)
        const offsetX = style.size / 2 + 5;
        const offsetY = -style.size / 2 - 5;

        marker.style.cssText = `
            position: absolute;
            left: ${scaledPos.x + offsetX}px;
            top: ${scaledPos.y + offsetY}px;
            transform: translate(-50%, -50%);
            background: ${badgeColor};
            border: 2px solid ${this.lightenColor(badgeColor, 20)};
            border-radius: 12px;
            padding: 2px 6px;
            min-width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            z-index: 25; /* 🖤 Game world UI layer - above locations (15) 💀 */
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        `;

        marker.innerHTML = `<span style="font-size: 14px;">${badgeIcon}</span><span>${total}</span>`;

 // Hover effect
        marker.addEventListener('mouseenter', () => {
            marker.style.transform = 'translate(-50%, -50%) scale(1.2)';
            marker.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.6)';
            this.showPropertyTooltip(location, properties, marker);
        });

        marker.addEventListener('mouseleave', () => {
            marker.style.transform = 'translate(-50%, -50%) scale(1)';
            marker.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
            this.hideTooltip();
        });

 // Click to open properties panel
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof PropertyEmployeeUI !== 'undefined') {
                PropertyEmployeeUI.openPropertyEmployeePanel();
            }
        });

        this.mapElement.appendChild(marker);
    },

 // show tooltip for property marker
    showPropertyTooltip(location, properties, markerEl) {
        if (!this.tooltipElement) return;

        const rect = markerEl.getBoundingClientRect();

 // Build property list
        let propertyList = properties.map(p => {
            const propType = (typeof PropertySystem !== 'undefined' && PropertySystem.propertyTypes)
                ? PropertySystem.propertyTypes[p.type]
                : { name: p.type, icon: '🏠' };

            let status = '';
            if (p.underConstruction) {
                const progress = (typeof PropertySystem !== 'undefined' && PropertySystem.getConstructionProgress)
                    ? PropertySystem.getConstructionProgress(p)
                    : 0;
                status = `<span style="color: #FF9800;">🔨 ${progress}%</span>`;
            } else if (p.isRented) {
                status = `<span style="color: #2196F3;">📝 Rented</span>`;
            } else {
                status = `<span style="color: #4CAF50;">🏠 Owned</span>`;
            }

            return `<div style="padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span style="font-size: 16px;">${propType?.icon || '🏠'}</span>
                <span style="color: #fff;">${propType?.name || p.type}</span>
                ${status}
            </div>`;
        }).join('');

        this.tooltipElement.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: #4fc3f7; margin-bottom: 8px;">
                🏘️ Your Properties in ${this.getLocationName(location.id)}
            </div>
            ${propertyList}
            <div style="margin-top: 8px; font-size: 11px; color: #aaa;">
                Click to manage properties
            </div>
        `;

        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = `${rect.right + 10}px`;
        this.tooltipElement.style.top = `${rect.top}px`;
    },

 // calculate what you can see vs what lurks in the shadows
 // visible = been there, discovered = spooky fog of war, hidden = pure darkness
    calculateLocationVisibility() {
        const visibility = {};
        const locations = this.getActiveLocations();

 // get visited locations - use world-aware helper for doom/normal/tutorial world separation!
        let visited = [];
        if (this.isInTutorialMode()) {
            // Tutorial mode - use TutorialWorld visited locations
            if (typeof TutorialWorld !== 'undefined') {
                visited = TutorialWorld.visitedLocations || [];
            }
        } else if (typeof GameWorld !== 'undefined') {
 // Use the new helper that returns doomVisitedLocations or visitedLocations based on current world
            if (typeof GameWorld.getActiveVisitedLocations === 'function') {
                visited = GameWorld.getActiveVisitedLocations();
            } else if (Array.isArray(GameWorld.visitedLocations)) {
                visited = GameWorld.visitedLocations;
            }
        }

 // If no visited locations yet, use current location as starting point
        if (visited.length === 0 && typeof game !== 'undefined' && game.currentLocation && game.currentLocation.id) {
            visited = [game.currentLocation.id];
 // Also add to GameWorld using world-aware method if possible
            if (typeof GameWorld !== 'undefined') {
                if (typeof GameWorld.markLocationVisited === 'function') {
                    GameWorld.markLocationVisited(game.currentLocation.id);
                } else {
                    GameWorld.visitedLocations = GameWorld.visitedLocations || [];
                    if (!GameWorld.visitedLocations.includes(game.currentLocation.id)) {
                        GameWorld.visitedLocations.push(game.currentLocation.id);
                    }
                }
            }
        }

        console.log('🗺️ Visibility calc - visited locations:', visited);

 // If still no visited locations, show all as visible (fallback for new game)
        if (visited.length === 0) {
            console.log('🗺️ No visited locations yet - new game, showing all locations');
            Object.keys(locations).forEach(locId => {
                visibility[locId] = 'visible';
            });
            return visibility;
        }

 // First pass: mark all visited locations as visible
        visited.forEach(locId => {
            visibility[locId] = 'visible';
        });

 // Second pass: Connected locations are 'discovered' UNLESS in a locked zone
 // Locked zones (north, west) are hidden until fee is paid at gatehouse
        visited.forEach(locId => {
            const location = locations[locId];
            if (location && location.connections) {
                location.connections.forEach(connectedId => {
 // Only mark as discovered if not already visible
                    if (!visibility[connectedId]) {
 // Check if connected location is in a locked zone
                        const isLocked = this.isLocationInLockedZone(connectedId);
                        if (isLocked) {
 // Locked zone locations stay hidden until fee paid
 // EXCEPT gatehouses themselves - those are always discoverable
                            if (this.isGatehouse(connectedId)) {
                                visibility[connectedId] = 'discovered';
                            }
 // else stays hidden
                        } else {
 // Free zone - mark as discovered
                            visibility[connectedId] = 'discovered';
                        }
                    }
                });
            }
        });

 // Third pass: also show gatehouses that are 2 hops away from visited locations
 // e.g., visited → discovered → gatehouse should show the gatehouse
 // This helps players see outposts they need to reach
        const discoveredLocations = Object.keys(visibility).filter(id => visibility[id] === 'discovered');
        discoveredLocations.forEach(locId => {
            const location = locations[locId];
            if (location && location.connections) {
                location.connections.forEach(connectedId => {
 // Only process if not already visible/discovered
                    if (!visibility[connectedId] || visibility[connectedId] === 'hidden') {
 // If it's a gatehouse, make it discovered so players can see and travel to it
                        if (this.isGatehouse(connectedId)) {
                            visibility[connectedId] = 'discovered';
                        }
                    }
                });
            }
        });

 // Fourth pass: ALWAYS show zone gatehouses as discovered
 // Players need to be able to see and travel to gates to pay fees
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.GATEHOUSES) {
            Object.keys(GatehouseSystem.GATEHOUSES).forEach(gatehouseId => {
 // If gatehouse exists in locations and isn't already visible
                if (locations[gatehouseId] && visibility[gatehouseId] !== 'visible') {
                    visibility[gatehouseId] = 'discovered';
                    console.log(`🏰 Gatehouse ${gatehouseId} forced to discovered`);
                }
            });
        }

 // Fifth pass: Royal Capital reveals ALL connected gatehouses
 // Capital is a hub - if you're there, you should see all gates you can travel to
        if (visited.includes('royal_capital')) {
            const capitalLoc = locations['royal_capital'];
            if (capitalLoc && capitalLoc.connections) {
                capitalLoc.connections.forEach(connId => {
 // If this connection is a gatehouse and not already visible, make it discovered
                    if (this.isGatehouse(connId) && visibility[connId] !== 'visible') {
                        visibility[connId] = 'discovered';
                        console.log(`🏰 Capital connection ${connId} (gate) set to discovered`);
                    }
                });
            }
        }

 // All other locations remain hidden (undefined or 'hidden')
        Object.keys(locations).forEach(locId => {
            if (!visibility[locId]) {
                visibility[locId] = 'hidden';
            }
        });

        return visibility;
    },

 // Check if a location is a gatehouse/outpost (the toll booths of the realm)
    isGatehouse(locationId) {
 // Check GatehouseSystem first
        if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.GATEHOUSES) {
            if (GatehouseSystem.GATEHOUSES[locationId]) {
                return true;
            }
        }
 // Also check location type
        const locations = this.getActiveLocations();
        const location = locations[locationId];
        if (location && location.type === 'outpost') {
            return true;
        }
        return false;
    },

 // Check if a location is in a LOCKED zone that requires payment
 // Returns true if the location is hidden until gatehouse fee is paid
 // Locked zones: northern, northern_deep, western, eastern
 // DOOM WORLD: All zones are unlocked - no gatehouse restrictions apply
    isLocationInLockedZone(locationId) {
        // DOOM WORLD BYPASS: No zone locks in the apocalypse
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);
        if (inDoom) {
            return false; // All zones accessible in doom world
        }

        if (typeof GatehouseSystem === 'undefined') {
            return false; // No gatehouse system, nothing is locked
        }

 // Get the zone for this location
        const zone = GatehouseSystem.LOCATION_ZONES?.[locationId] ||
                     GatehouseSystem.getLocationZone?.(locationId);

 // Check if this is a locked zone (northern, western, eastern)
 // Starter, capital, and southern are always free
        const lockedZones = ['northern', 'northern_deep', 'western', 'eastern'];
        if (!lockedZones.includes(zone)) {
            return false; // Free zone
        }

 // Check if the gatehouse for this zone has been unlocked
        const gatehouseId = GatehouseSystem.ZONE_GATEHOUSES?.[zone];
        if (gatehouseId && GatehouseSystem.unlockedGates?.has(gatehouseId)) {
            return false; // Zone is unlocked, not hidden
        }

 // The gatehouse/outpost itself is never locked (player needs to reach it to pay)
        if (this.isGatehouse(locationId)) {
            return false;
        }

 // Zone is locked and fee not paid - location should be hidden
        return true;
    },

 // check if some gatekeeping mechanism blocks your path (capitalism simulator moment)
 // DOOM WORLD: No gatehouse restrictions - the apocalypse has no toll booths
    isLocationBehindLockedGate(locationId) {
        // DOOM WORLD BYPASS: No gates in the apocalypse
        const inDoom = (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) ||
                       (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive) ||
                       (typeof game !== 'undefined' && game.inDoomWorld);
        if (inDoom) {
            return false; // All gates open in doom world
        }

 // If GatehouseSystem doesn't exist or isn't initialized, don't block anything
        if (typeof GatehouseSystem === 'undefined' || !GatehouseSystem.canAccessLocation) {
            return false;
        }

 // Check if this is the player's starting zone or capital - never block these
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
            console.warn('🗺️ Error checking gatehouse access:', e);
            return false;
        }
    },

 // draw the threads of fate connecting your doom to various destinations
    drawConnections(visibilityMap = {}) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.MAP_WIDTH.toString());
        svg.setAttribute('height', this.MAP_HEIGHT.toString());
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 10; /* 🖤 ABOVE weather (2-3) - matches --z-map-connections 💀 */
        `;

        const locations = this.getActiveLocations();
        // Get visited locations based on current mode (tutorial vs normal)
        // Use world-aware helper for doom/normal world separation
        let visited = [];
        if (this.isInTutorialMode()) {
            visited = (typeof TutorialWorld !== 'undefined' ? TutorialWorld.visitedLocations || [] : []);
        } else if (typeof GameWorld !== 'undefined') {
            visited = (typeof GameWorld.getActiveVisitedLocations === 'function')
                ? GameWorld.getActiveVisitedLocations()
                : (GameWorld.visitedLocations || []);
        }
        const drawnConnections = new Set();

        Object.values(locations).forEach(location => {
            if (!location.connections || !location.mapPosition) return;

 // Only draw connections from visible or discovered locations
            const locVisibility = visibilityMap[location.id];
            if (locVisibility === 'hidden') return;

            location.connections.forEach(targetId => {
                const target = locations[targetId];
                if (!target || !target.mapPosition) return;

 // Only draw connection if target is also visible or discovered
                const targetVisibility = visibilityMap[targetId];
                if (targetVisibility === 'hidden') return;

 // Avoid drawing duplicate lines
                const connectionKey = [location.id, targetId].sort().join('-');
                if (drawnConnections.has(connectionKey)) return;
                drawnConnections.add(connectionKey);

 // scale positions for larger map
                const scaledFrom = this.scalePosition(location.mapPosition);
                const scaledTo = this.scalePosition(target.mapPosition);
                if (!scaledFrom || !scaledTo) return;

 // Create a group for the path (visible line + invisible hitbox)
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.style.cursor = 'help';

 // Calculate path info for tooltip
                const pathInfo = this.getPathInfo(location, target);

 // Invisible wider line for easier hovering
                const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hitbox.setAttribute('x1', scaledFrom.x);
                hitbox.setAttribute('y1', scaledFrom.y);
                hitbox.setAttribute('x2', scaledTo.x);
                hitbox.setAttribute('y2', scaledTo.y);
                hitbox.setAttribute('stroke', 'transparent');
                hitbox.setAttribute('stroke-width', '20');
                hitbox.style.pointerEvents = 'stroke';

 // Visible path line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', scaledFrom.x);
                line.setAttribute('y1', scaledFrom.y);
                line.setAttribute('x2', scaledTo.x);
                line.setAttribute('y2', scaledTo.y);
                line.style.pointerEvents = 'none';

 // Color based on exploration status
                const bothExplored = visited.includes(location.id) && visited.includes(targetId);
                const oneExplored = visited.includes(location.id) || visited.includes(targetId);

                if (bothExplored) {
 // Fully explored path - gold
                    line.setAttribute('stroke', 'rgba(255, 215, 0, 0.5)');
                    line.setAttribute('stroke-width', '3');
                    line.setAttribute('stroke-dasharray', 'none');
                } else if (oneExplored) {
 // Partially explored - faded gold
                    line.setAttribute('stroke', 'rgba(255, 215, 0, 0.25)');
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '5,5');
                } else {
 // Discovered but not explored - grey
                    line.setAttribute('stroke', 'rgba(150, 150, 150, 0.3)');
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '5,5');
                }

 // Add hover events for tooltip
 // FIX: Only show detailed path info if BOTH locations are explored 
                hitbox.addEventListener('mouseenter', (e) => {
                    this.showPathTooltip(e, pathInfo, location, target, bothExplored);
                    line.setAttribute('stroke-width', bothExplored ? '5' : '4');
                    line.style.filter = 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))';
                });
                hitbox.addEventListener('mousemove', (e) => {
                    this.movePathTooltip(e);
                });
                hitbox.addEventListener('mouseleave', () => {
                    this.hidePathTooltip();
                    line.setAttribute('stroke-width', bothExplored ? '3' : '2');
                    line.style.filter = 'none';
                });

                group.appendChild(line);
                group.appendChild(hitbox);
                svg.appendChild(group);
            });
        });

        this.mapElement.appendChild(svg);
    },

 // get path information for tooltip
 // FIX: Calculate path info for the SPECIFIC path being hovered, not from player location! 
 // The tooltip shows info for the path between fromLocation and toLocation
    getPathInfo(fromLocation, toLocation) {
 // try to get path data from TravelSystem.paths for accurate info 
        if (typeof TravelSystem !== 'undefined' && TravelSystem.paths && TravelSystem.paths.length > 0) {
 // Find the direct path between these two locations
            const directPath = TravelSystem.paths.find(p =>
                (p.from === fromLocation.id && p.to === toLocation.id) ||
                (p.from === toLocation.id && p.to === fromLocation.id)
            );

            if (directPath) {
 // Get path type info
                const pathType = directPath.type || 'road';
                const pathData = TravelSystem.PATH_TYPES?.[pathType] || this.PATH_TYPES[pathType] || this.PATH_TYPES.road;

 // Get distance from path data - ensure we have a valid number
 // FIX: directPath.distance can be 0 or very small, use fallback if invalid 
                let distanceMiles = directPath.distance;
                if (!distanceMiles || distanceMiles <= 0 || isNaN(distanceMiles)) {
                    distanceMiles = this.calculateDistanceBetween(fromLocation, toLocation);
                }
 // Ensure reasonable minimum distance (0.5 miles)
                distanceMiles = Math.max(0.5, distanceMiles);

 // Calculate travel time using TravelSystem's logic
                const transport = game?.player?.transportation || 'backpack';
                const transportData = typeof transportationOptions !== 'undefined' ? transportationOptions[transport] : null;
                const baseSpeed = transportData?.speed || 3; // mph
                const effectiveSpeed = baseSpeed * (pathData.speedMultiplier || 1.0);
                let travelTimeHours = distanceMiles / effectiveSpeed;
                travelTimeHours = Math.min(travelTimeHours, 6); // Cap at 6 hours

                const travelTimeMinutes = Math.round(travelTimeHours * 60);
                const staminaDrain = Math.round(distanceMiles * (pathData.staminaDrain || 0.5) * 10) / 10;

                return {
                    type: pathType,
                    typeName: pathData.name || pathType,
                    description: pathData.description || 'A path between locations',
                    distanceMiles: Math.round(distanceMiles * 10) / 10,
                    travelTimeMinutes: travelTimeMinutes,
                    baseTravelTimeMinutes: travelTimeMinutes,
                    staminaDrain: staminaDrain,
                    safety: Math.round((directPath.safety || pathData.safety || 0.7) * 100),
                    speedMultiplier: pathData.speedMultiplier || 1.0,
                    weatherMod: 1.0,
                    seasonMod: 1.0,
                    eventMod: 1.0
                };
            }
        }

 // FALLBACK: Calculate from map positions 
        let distanceMiles = this.calculateDistanceBetween(fromLocation, toLocation);
 // Ensure reasonable minimum distance (0.5 miles)
        distanceMiles = Math.max(0.5, distanceMiles);

        const pathType = this.determinePathType(fromLocation, toLocation);
        const pathData = this.PATH_TYPES[pathType] || this.PATH_TYPES.road;

        const baseSpeed = 3;
        const effectiveSpeed = baseSpeed * pathData.speedMultiplier;
        let travelTimeHours = distanceMiles / effectiveSpeed;
        travelTimeHours = Math.min(travelTimeHours, 6);
        const travelTimeMinutes = Math.round(travelTimeHours * 60);
        const staminaDrain = Math.round(distanceMiles * pathData.staminaDrain * 10) / 10;

        return {
            type: pathType,
            typeName: pathData.name,
            description: pathData.description,
            distanceMiles: Math.round(distanceMiles * 10) / 10,
            travelTimeMinutes: travelTimeMinutes,
            baseTravelTimeMinutes: travelTimeMinutes,
            staminaDrain: staminaDrain,
            safety: Math.round(pathData.safety * 100),
            speedMultiplier: pathData.speedMultiplier,
            weatherMod: 1.0,
            seasonMod: 1.0,
            eventMod: 1.0
        };
    },

 // calculate distance between two specific locations (for path tooltips)
 // using mapPosition coordinates (GameWorld scale, ~100-800 range) 
 // Divide by 50 to convert to approximate miles (2-3 miles between nearby locations)
    calculateDistanceBetween(fromLocation, toLocation) {
        if (!fromLocation?.mapPosition || !toLocation?.mapPosition) {
            console.warn('🖤 calculateDistanceBetween: missing mapPosition for', fromLocation?.id, toLocation?.id);
            return 2; // Default 2 miles if positions missing
        }
        const dx = toLocation.mapPosition.x - fromLocation.mapPosition.x;
        const dy = toLocation.mapPosition.y - fromLocation.mapPosition.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
 // gameWorld coordinates are ~100-800 range, div by 50 gives 2-16 miles for map extremes 
        const miles = pixelDistance / 50;
        return Math.max(0.5, Math.round(miles * 10) / 10); // Min 0.5 miles, rounded to 1 decimal
    },

 // determine path type based on connected locations
    determinePathType(fromLocation, toLocation) {
        const fromType = fromLocation?.type || 'unknown';
        const toType = toLocation?.type || 'unknown';

 // Capital or city connections = main roads
        if (fromType === 'capital' || toType === 'capital') {
            return 'main_road';
        }
        if (fromType === 'city' || toType === 'city') {
            return 'main_road';
        }
 // Town connections = regular roads
        if (fromType === 'town' || toType === 'town') {
            return 'road';
        }
 // Village connections = paths
        if (fromType === 'village' || toType === 'village') {
            return 'path';
        }
 // Outpost/mine/dungeon = trails
        if (['outpost', 'mine', 'dungeon', 'cave', 'ruins'].includes(fromType) ||
            ['outpost', 'mine', 'dungeon', 'cave', 'ruins'].includes(toType)) {
            return 'trail';
        }
 // Forest/farm = paths
        if (['forest', 'farm'].includes(fromType) || ['forest', 'farm'].includes(toType)) {
            return 'path';
        }

        return 'road';
    },

 // path type definitions
 // FIX: PATH_TYPES with updated speed multipliers - must match TravelSystem
    PATH_TYPES: {
        city_street: {
            name: 'City Street',
            speedMultiplier: 2.0,
            staminaDrain: 0.3,
            safety: 0.9,
            description: 'Well-paved city streets'
        },
        main_road: {
            name: 'Main Road',
            speedMultiplier: 1.8,
            staminaDrain: 0.5,
            safety: 0.7,
            description: 'Major trade road'
        },
        road: {
            name: 'Road',
            speedMultiplier: 1.5,
            staminaDrain: 0.7,
            safety: 0.6,
            description: 'Maintained road'
        },
        path: {
            name: 'Path',
            speedMultiplier: 1.2,
            staminaDrain: 0.9,
            safety: 0.5,
            description: 'Worn dirt path'
        },
        trail: {
            name: 'Trail',
            speedMultiplier: 1.0,
            staminaDrain: 1.2,
            safety: 0.4,
            description: 'Rough wilderness trail'
        },
        wilderness: {
            name: 'Wilderness',
            speedMultiplier: 0.6,
            staminaDrain: 1.5,
            safety: 0.3,
            description: 'Untamed wilderness'
        }
    },

 // show path tooltip
 // FIX: Only show detailed stats for paths where BOTH locations are explored 
    showPathTooltip(e, pathInfo, fromLoc, toLoc, bothExplored = false) {
        const formatGameTime = (minutes) => {
            if (minutes < 60) return `${minutes} min`;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        };

 // for unexplored paths, show limited info 
        if (!bothExplored) {
            this.tooltipElement.innerHTML = `
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #888;">
                    🛤️ Unknown Path
                </div>
                <div style="color: #666; font-size: 11px; margin-bottom: 8px; font-style: italic;">
                    Explore both locations to reveal path details
                </div>
                <div style="font-size: 12px; color: #555;">
                    <span>❓ Distance: ???</span><br>
                    <span>❓ Travel Time: ???</span><br>
                    <span>❓ Safety: ???</span>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #555;">
                    ${fromLoc.name} ↔ ${toLoc.name}
                </div>
            `;
            this.tooltipElement.style.display = 'block';
            this.tooltipElement.style.left = (e.clientX + 15) + 'px';
            this.tooltipElement.style.top = (e.clientY + 15) + 'px';
            return;
        }

 // calculate real-time using BASE time (clear skies, normal speed) 
 // This shows ideal conditions - what the trip WOULD take without weather/season penalties
        const gameMinutesPerRealSecond = typeof TimeSystem !== 'undefined' ?
            (TimeSystem.SPEEDS?.NORMAL || 2) : 2;
        const baseTimeMinutes = pathInfo.baseTravelTimeMinutes || pathInfo.travelTimeMinutes;
        const realTimeSeconds = Math.round(baseTimeMinutes / gameMinutesPerRealSecond);
        const realTimeDisplay = realTimeSeconds < 60 ?
            `~${realTimeSeconds}s` :
            `~${Math.round(realTimeSeconds / 60)}m ${realTimeSeconds % 60}s`;

        this.tooltipElement.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #ffd700;">
                🛤️ ${pathInfo.typeName}
            </div>
            <div style="color: #888; font-size: 11px; margin-bottom: 8px; font-style: italic;">
                ${pathInfo.description}
            </div>
            <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px; font-size: 12px;">
                <span style="color: #888;">Distance:</span>
                <span style="color: #4fc3f7;">${pathInfo.distanceMiles} miles</span>

                <span style="color: #888;">Travel Time:</span>
                <span style="color: #81c784;">${formatGameTime(pathInfo.travelTimeMinutes)} game time</span>

                <span style="color: #888;">Real Time:</span>
                <span style="color: #ce93d8;">${realTimeDisplay} (clear skies)</span>

                <span style="color: #888;">Stamina Drain:</span>
                <span style="color: #ffb74d;">${pathInfo.staminaDrain} pts</span>

                <span style="color: #888;">Safety:</span>
                <span style="color: ${pathInfo.safety >= 70 ? '#81c784' : pathInfo.safety >= 50 ? '#ffb74d' : '#f44336'};">
                    ${pathInfo.safety}%
                </span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #666;">
                ${fromLoc.name} ↔ ${toLoc.name}
            </div>
        `;

        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (e.clientX + 15) + 'px';
        this.tooltipElement.style.top = (e.clientY + 15) + 'px';
    },

 // move path tooltip
    movePathTooltip(e) {
        this.tooltipElement.style.left = (e.clientX + 15) + 'px';
        this.tooltipElement.style.top = (e.clientY + 15) + 'px';
    },

 // hide path tooltip
    hidePathTooltip() {
        this.tooltipElement.style.display = 'none';
    },

 // birth a location into existence on the map
 // visible = you've been there, discovered = mysterious fog vibes, hidden = doesn't exist yet
    createLocationElement(location, labelOffset = 0, visibility = 'visible') {
        if (!location.mapPosition) return;
        if (visibility === 'hidden') return;

 // scale position for the larger map
        const scaledPos = this.scalePosition(location.mapPosition);
        if (!scaledPos) return;

        const style = this.locationStyles[location.type] || this.locationStyles.town;
        const isDiscovered = visibility === 'discovered';
        const el = document.createElement('div');
        el.className = 'map-location' + (isDiscovered ? ' discovered' : '');
        el.dataset.locationId = location.id;
        el.dataset.visibility = visibility;

 // check if July 18th Dungeon Bonanza is active AND this is a dungeon type
        const dungeonTypes = ['dungeon', 'cave', 'ruins'];
        const isDungeonType = dungeonTypes.includes(location.type);
        const isBonanzaActive = typeof DungeonBonanzaSystem !== 'undefined' && DungeonBonanzaSystem.isDungeonBonanzaDay();
        const hasBonanzaEffect = isDungeonType && isBonanzaActive && !isDiscovered;

 // For discovered (unexplored) locations - make them VISIBLE but mysterious
 // grey but solid, not translucent - players need to SEE where they can go!
        const bgColor = isDiscovered ? '#4a4a5a' : style.color;
        const borderColor = isDiscovered ? '#8888aa' : (hasBonanzaEffect ? '#a855f7' : this.lightenColor(style.color, 20));
        const opacity = isDiscovered ? '0.9' : '1';
        const iconFilter = isDiscovered ? 'grayscale(80%)' : 'none';
 // purple glow for dungeons during bonanza
        const boxShadowStyle = hasBonanzaEffect
            ? '0 0 20px 8px rgba(168, 85, 247, 0.7), 0 0 40px 15px rgba(168, 85, 247, 0.4)'
            : '0 2px 10px rgba(0, 0, 0, 0.5)';

        el.style.cssText = `
            position: absolute;
            left: ${scaledPos.x}px;
            top: ${scaledPos.y}px;
            transform: translate(-50%, -50%);
            width: ${style.size}px;
            height: ${style.size}px;
            background: radial-gradient(circle, ${bgColor} 0%, ${this.darkenColor(bgColor, 30)} 100%);
            border: 3px solid ${borderColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${style.size * 0.5}px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: ${boxShadowStyle};
            z-index: 15; /* 🖤 ABOVE weather (2-3) - matches --z-map-locations 💀 */
            opacity: ${opacity};
            filter: ${iconFilter};
            ${hasBonanzaEffect ? 'animation: bonanza-pulse 1.5s ease-in-out infinite;' : ''}
        `;

 // Show question mark for undiscovered, icon for explored
        el.innerHTML = isDiscovered ? '❓' : style.icon;
        el.draggable = false; // Prevent browser drag behavior

 // add "30m" badge for dungeons during bonanza
        if (hasBonanzaEffect) {
            const bonanzaBadge = document.createElement('div');
            bonanzaBadge.className = 'bonanza-badge';
            bonanzaBadge.innerHTML = '⚡30m';
            bonanzaBadge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
                color: #fff;
                font-size: 9px;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 8px;
                border: 1px solid #c084fc;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                z-index: 20; /* 🖤 ABOVE locations (15) - badges need to be visible 💀 */
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
        label.className = 'map-location-label' + (isDiscovered ? ' discovered' : '');

        const isGate = this.isGatehouse(location.id);
        // use getLocationName for proper doom world name support
        const locationName = this.getLocationName(location.id);
        label.textContent = (isDiscovered && !isGate) ? '???' : locationName;

 // position label ABOVE icon so YOU ARE HERE marker doesn't cover it 
        label.style.cssText = `
            position: absolute;
            left: 50%;
            bottom: ${style.size + 4}px;
            transform: translateX(-50%);
            color: ${isDiscovered ? '#aabbcc' : '#fff'};
            font-size: 12px;
            font-style: ${isDiscovered ? 'italic' : 'normal'};
            text-shadow: 1px 1px 3px #000, -1px -1px 3px #000, 0 0 6px #000;
            white-space: nowrap;
            pointer-events: none;
        `;
        el.appendChild(label);

        this.mapElement.appendChild(el);
    },

 // calculate label offsets so text doesn't overlap
 // SIMPLIFIED: No offsets for now - just return 0 for all locations
 // This ensures labels render directly below their location markers
    calculateLabelOffsets(locations) {
        const offsets = {};
        Object.keys(locations).forEach(id => {
            offsets[id] = 0;
        });
        return offsets;
    },

 // highlight where you currently exist in this cruel world
    highlightCurrentLocation() {
        if (!game || !game.currentLocation) return;

 // Highlight the location element
        const currentEl = this.mapElement.querySelector(`[data-location-id="${game.currentLocation.id}"]`);
        if (currentEl) {
            currentEl.style.boxShadow = '0 0 20px 5px rgba(79, 195, 247, 0.8)';
            currentEl.style.border = '3px solid #4fc3f7';
        }

 // Create or update player marker
        this.updatePlayerMarker();
    },

 // player marker element reference - proof you exist somewhere
    playerMarker: null,
    travelAnimation: null,

 // create/update the player marker - that little red pin screaming "here i am"
 // x/y can be passed as scaled coords (for animation) or null to use current location
    updatePlayerMarker(x = null, y = null, alreadyScaled = false) {
 // Get position from current location if not provided
        if (x === null || y === null) {
            const locationId = game?.currentLocation?.id;
            if (!locationId) return;

            const locations = this.getActiveLocations();
            const location = locations[locationId];
            if (!location || !location.mapPosition) return;

 // Scale the position for the larger map
            const scaledPos = this.scalePosition(location.mapPosition);
            if (!scaledPos) return;
            x = scaledPos.x;
            y = scaledPos.y;
        } else if (!alreadyScaled) {
 // If x/y provided but not scaled, scale them
            const scaledPos = this.scalePosition({ x, y });
            if (scaledPos) {
                x = scaledPos.x;
                y = scaledPos.y;
            }
        }

 // create marker if it doesn't exist OR if it was removed from DOM (render() clears innerHTML)
 // Check if marker exists AND is still in the DOM - if not, recreate it
 // Guard against null mapElement to prevent crash 
        if (!this.playerMarker || (this.mapElement && !this.mapElement.contains(this.playerMarker))) {
 // Reset the reference if it was orphaned
            this.playerMarker = null;
            this.playerMarker = document.createElement('div');
            this.playerMarker.id = 'player-marker';
            this.playerMarker.className = 'player-marker';
            this.playerMarker.draggable = false; // Prevent browser drag behavior
 // using a tack/pin emoji that floats above the location
            this.playerMarker.innerHTML = `
                <div class="marker-tack">📌</div>
                <div class="marker-shadow"></div>
                <div class="marker-pulse"></div>
                <div class="marker-label">YOU ARE HERE</div>
            `;
            this.playerMarker.style.cssText = `
                position: absolute;
                z-index: 20; /* 🖤 Game world UI - matches --z-player-marker 💀 */
                pointer-events: none;
                transform: translate(-50%, -100%);
                display: flex;
                flex-direction: column;
                align-items: center;
            `;

 // style the tack/pin - floating above with gentle bob (CPU optimized: slower animation)
            const tack = this.playerMarker.querySelector('.marker-tack');
            tack.style.cssText = `
                font-size: 42px;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
                animation: tack-float 5s ease-in-out infinite;
                z-index: 152;
                transform-origin: bottom center;
            `;

 // shadow below the floating tack (CPU optimized: slower animation)
            const shadow = this.playerMarker.querySelector('.marker-shadow');
            shadow.style.cssText = `
                position: absolute;
                bottom: -5px;
                width: 24px;
                height: 8px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 50%;
                animation: shadow-pulse 5s ease-in-out infinite;
                z-index: 99;
            `;

 // Style the pulse effect - ripple from the pin point (CPU optimized: slower animation)
            const pulse = this.playerMarker.querySelector('.marker-pulse');
            pulse.style.cssText = `
                position: absolute;
                bottom: 0px;
                width: 16px;
                height: 16px;
                background: rgba(220, 20, 60, 0.5);
                border-radius: 50%;
                animation: marker-pulse 4s ease-out infinite;
                z-index: 100;
            `;

 // Style the label - sleek banner below
            const label = this.playerMarker.querySelector('.marker-label');
            label.style.cssText = `
                background: linear-gradient(180deg, #dc143c 0%, #8b0000 100%);
                color: white;
                font-size: 9px;
                font-weight: bold;
                padding: 4px 10px;
                border-radius: 12px;
                white-space: nowrap;
                margin-top: 2px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                border: 2px solid rgba(255,255,255,0.8);
                z-index: 151;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            `;

 // add CSS animations for floating tack effect - CPU optimized
            if (!document.getElementById('player-marker-styles')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'player-marker-styles';
                styleSheet.textContent = `
                    /* GPU hints for smooth animations */
                    .marker-tack, .marker-shadow, .marker-pulse {
                        will-change: transform, opacity;
                    }
                    @keyframes tack-float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }
                    @keyframes shadow-pulse {
                        0%, 100% { transform: scale(1); opacity: 0.3; }
                        50% { transform: scale(0.7); opacity: 0.4; }
                    }
                    @keyframes marker-pulse {
                        0% { transform: scale(1); opacity: 0.5; }
                        100% { transform: scale(3); opacity: 0; }
                    }
                    @keyframes marker-travel {
                        0% { transform: translate(-50%, -100%) scale(1); }
                        50% { transform: translate(-50%, -100%) scale(1.05); }
                        100% { transform: translate(-50%, -100%) scale(1); }
                    }
                    .player-marker.traveling {
                        flex-direction: column-reverse !important;
                    }
                    .player-marker.traveling .marker-label {
                        margin-top: 0 !important;
                        margin-bottom: 4px !important;
                    }
                    .player-marker.traveling .marker-tack {
                        animation: tack-walk 0.6s ease-in-out infinite;
                    }
                    @keyframes tack-walk {
                        0%, 100% { margin-top: -2px; }
                        50% { margin-top: -6px; }
                    }
                    .emoji-flip-right {
                        transform: scaleX(-1) !important;
                    }
                    /* 💀 July 18th Dungeon Bonanza pulse effect */
                    @keyframes bonanza-pulse {
                        0%, 100% {
                            box-shadow: 0 0 20px 8px rgba(168, 85, 247, 0.7), 0 0 40px 15px rgba(168, 85, 247, 0.4);
                            transform: translate(-50%, -50%) scale(1);
                        }
                        50% {
                            box-shadow: 0 0 30px 12px rgba(168, 85, 247, 0.9), 0 0 60px 25px rgba(168, 85, 247, 0.5);
                            transform: translate(-50%, -50%) scale(1.05);
                        }
                    }
                `;
                document.head.appendChild(styleSheet);
            }

            this.mapElement.appendChild(this.playerMarker);

 // CRITICAL: If we're currently traveling, apply traveling style to newly created marker
 // This fixes the bug where render() clears the marker and recreates it with "YOU ARE HERE"
 // even though we're mid-travel
            if (this.currentTravel) {
                this.playerMarker.classList.add('traveling');

 // Use column-reverse so first child (tack) renders at bottom, last child (label) at top
                this.playerMarker.style.flexDirection = 'column-reverse';

                const movingRight = this.currentTravel.movingRight;
                // Get travel emoji (horse if owned, otherwise walking)
                const travelData = this.getTravelEmoji(movingRight);
                const flipStyle = travelData.needsFlip ? 'transform: scaleX(-1);' : '';

                this.playerMarker.innerHTML = `
                    <div class="marker-tack" style="font-size: 42px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); animation: tack-walk 0.4s ease-in-out infinite; z-index: 152;"><span class="walk-emoji" style="display: inline-block; ${flipStyle}">${travelData.emoji}</span></div>
                    <div class="marker-shadow" style="position: absolute; bottom: -5px; width: 24px; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 50%; animation: shadow-pulse 3s ease-in-out infinite; z-index: 99;"></div>
                    <div class="marker-pulse" style="position: absolute; bottom: 0px; width: 16px; height: 16px; background: rgba(255, 136, 68, 0.5); border-radius: 50%; animation: marker-pulse 2s ease-out infinite; z-index: 100;"></div>
                    <div class="marker-label" style="background: linear-gradient(180deg, #ff8844 0%, #cc4400 100%); color: white; font-size: 9px; font-weight: bold; padding: 4px 10px; border-radius: 12px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.8); z-index: 151; letter-spacing: 0.5px; text-transform: uppercase;">TRAVELING...</div>
                `;
            }
        }

 // Update position
        this.playerMarker.style.left = x + 'px';
        this.playerMarker.style.top = y + 'px';
    },

 // animate your little marker wandering across the map like it has purpose
 // travelTimeMinutes: how long you'll suffer on this journey
 // FIX: Now accepts optional route array for multi-hop path animation
 // Also supports reroute with direct position via TravelSystem._rerouteFromPosition
    animateTravel(fromLocationId, toLocationId, travelTimeMinutes, route = null) {
        const locations = this.getActiveLocations();
        const locationCount = Object.keys(locations).length;
        console.log('🗺️ animateTravel: locations count:', locationCount, 'from:', fromLocationId, 'to:', toLocationId);

        const toLoc = locations[toLocationId];

 // Check for reroute position first (travel from current path position, not location)
        let fromPosition = null;
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?._rerouteFromPosition) {
            fromPosition = TravelSystem.playerPosition._rerouteFromPosition;
            console.log('AnimateTravel: Using reroute position:', fromPosition);
 // Clear it after use
            delete TravelSystem.playerPosition._rerouteFromPosition;
        } else {
            const fromLoc = locations[fromLocationId];
            if (fromLoc?.mapPosition) {
                fromPosition = fromLoc.mapPosition;
            } else {
                console.warn('🗺️ animateTravel: fromLoc not found or no mapPosition!', fromLocationId, fromLoc);
            }
        }

        if (!fromPosition || !toLoc?.mapPosition) {
            console.warn('Cannot animate travel - missing location positions', {
                fromPosition,
                toLocExists: !!toLoc,
                toLocMapPos: toLoc?.mapPosition,
                inTutorial: this.isInTutorialMode(),
                locationCount
            });
            return;
        }

 // Scale positions for the larger map
        const scaledFrom = this.scalePosition(fromPosition);
        const scaledTo = this.scalePosition(toLoc.mapPosition);
        if (!scaledFrom || !scaledTo) return;

 // Cancel any existing animation
        if (this.travelAnimation) {
            cancelAnimationFrame(this.travelAnimation);
        }

 // FIX: Build waypoints array for multi-hop paths 
 // If route has multiple stops, we follow them in order instead of beelining
        let waypoints = [];
        if (route && route.length > 1) {
 // Build scaled waypoint positions for each stop in the route
            for (const locId of route) {
                const loc = locations[locId];
                if (loc?.mapPosition) {
                    const scaled = this.scalePosition(loc.mapPosition);
                    if (scaled) {
                        waypoints.push({ x: scaled.x, y: scaled.y, id: locId });
                    }
                }
            }
            console.log('🗺️ Multi-hop route with', waypoints.length, 'waypoints:', route);
        }
 // If no valid waypoints, fall back to direct path
        if (waypoints.length < 2) {
            waypoints = [
                { x: scaledFrom.x, y: scaledFrom.y, id: fromLocationId },
                { x: scaledTo.x, y: scaledTo.y, id: toLocationId }
            ];
        }

 // Store travel info for time-synced animation (using scaled positions)
        this.currentTravel = {
            fromId: fromLocationId,
            toId: toLocationId,
            startX: scaledFrom.x,
            startY: scaledFrom.y,
            endX: scaledTo.x,
            endY: scaledTo.y,
            waypoints: waypoints,
            durationMinutes: travelTimeMinutes,
            startGameTime: typeof TimeSystem !== 'undefined' ? TimeSystem.getTotalMinutes() : 0,
            lastX: scaledFrom.x,
            movingRight: scaledTo.x > scaledFrom.x
        };

 // CRITICAL: Ensure marker exists BEFORE applying traveling style
 // Call updatePlayerMarker with start position to create marker if needed
        this.updatePlayerMarker(scaledFrom.x, scaledFrom.y, true);

 // Add traveling class to marker - the tack walks along the path
 // Now marker is guaranteed to exist after updatePlayerMarker call above
        if (this.playerMarker) {
            this.playerMarker.classList.add('traveling');

 // Use column-reverse so first child (tack) renders at bottom, last child (label) at top
            this.playerMarker.style.flexDirection = 'column-reverse';

            const movingRight = this.currentTravel.movingRight;
            // Get travel emoji (horse if owned, otherwise walking)
            const travelData = this.getTravelEmoji(movingRight);
            const flipStyle = travelData.needsFlip ? 'transform: scaleX(-1);' : '';

            this.playerMarker.innerHTML = `
                <div class="marker-tack" style="font-size: 42px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); animation: tack-walk 0.4s ease-in-out infinite; z-index: 152;"><span class="walk-emoji" style="display: inline-block; ${flipStyle}">${travelData.emoji}</span></div>
                <div class="marker-shadow" style="position: absolute; bottom: -5px; width: 24px; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 50%; animation: shadow-pulse 3s ease-in-out infinite; z-index: 99;"></div>
                <div class="marker-pulse" style="position: absolute; bottom: 0px; width: 16px; height: 16px; background: rgba(255, 136, 68, 0.5); border-radius: 50%; animation: marker-pulse 2s ease-out infinite; z-index: 100;"></div>
                <div class="marker-label" style="background: linear-gradient(180deg, #ff8844 0%, #cc4400 100%); color: white; font-size: 9px; font-weight: bold; padding: 4px 10px; border-radius: 12px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.8); z-index: 151; letter-spacing: 0.5px; text-transform: uppercase;">TRAVELING...</div>
            `;
        }

        console.log('🗺️ animateTravel: Starting travel animation', {
            from: fromLocationId,
            to: toLocationId,
            duration: travelTimeMinutes,
            startTime: this.currentTravel.startGameTime,
            markerExists: !!this.playerMarker
        });

 // Start the animation loop
        this.runTravelAnimation();
    },

 // keep the travel animation going - time waits for no one (unless paused)
 // track last logged progress for rate-limited logging
    _lastLoggedProgress: -1,
 // track last paused update time to throttle when paused 
    _lastPausedUpdateTime: 0,

    runTravelAnimation() {
        if (!this.currentTravel) return;

        const travel = this.currentTravel;

 // Get current game time progress
        let progress = 0;
        let isPaused = false;

        if (typeof TimeSystem !== 'undefined') {
            isPaused = TimeSystem.isPaused || TimeSystem.currentSpeed === 'PAUSED';
            const currentGameTime = TimeSystem.getTotalMinutes();
            const elapsed = currentGameTime - travel.startGameTime;
            progress = Math.min(elapsed / travel.durationMinutes, 1);

 // Store progress for UI display
            travel.currentProgress = progress;

 // THROTTLE when paused - skip frames to reduce lag 
 // Only update once per 500ms when paused since nothing is moving
            if (isPaused) {
                const now = performance.now();
                if (this._lastPausedUpdateTime && (now - this._lastPausedUpdateTime) < 500) {
 // Skip this frame, schedule next check
                    if (progress < 1) {
                        this.travelAnimation = requestAnimationFrame(() => this.runTravelAnimation());
                    }
                    return;
                }
                this._lastPausedUpdateTime = now;
            } else {
 // Reset throttle timer when unpaused
                this._lastPausedUpdateTime = 0;
            }

 // rate-limited debooger logging - every 10% progress
            const progressPct = Math.floor(progress * 10);
            if (progressPct > this._lastLoggedProgress) {
                this._lastLoggedProgress = progressPct;
                console.log(`🗺️ Travel progress: ${Math.round(progress * 100)}%`, {
                    currentTime: currentGameTime,
                    startTime: travel.startGameTime,
                    elapsed,
                    duration: travel.durationMinutes,
                    isPaused
                });
            }
        } else {
 // Fallback if TimeSystem not available
            progress = 1;
        }

 // Ease in-out function for smooth movement
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

 // FIX: Calculate current position using WAYPOINTS, not beeline! 
        let currentX, currentY;

        if (travel.waypoints && travel.waypoints.length > 1) {
 // Multi-hop path: interpolate along waypoint segments
            const waypoints = travel.waypoints;
            const numSegments = waypoints.length - 1;

 // Calculate total path length for proper time distribution
            let totalDist = 0;
            const segmentDists = [];
            for (let i = 0; i < numSegments; i++) {
                const dx = waypoints[i + 1].x - waypoints[i].x;
                const dy = waypoints[i + 1].y - waypoints[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                segmentDists.push(dist);
                totalDist += dist;
            }

 // Find which segment we're on based on eased progress
            let targetDist = easeProgress * totalDist;
            let accumDist = 0;
            let segmentIndex = 0;
            let segmentProgress = 0;

            for (let i = 0; i < numSegments; i++) {
                if (accumDist + segmentDists[i] >= targetDist) {
                    segmentIndex = i;
                    segmentProgress = (targetDist - accumDist) / segmentDists[i];
                    break;
                }
                accumDist += segmentDists[i];
                segmentIndex = i;
            }

 // Clamp to last segment
            if (segmentIndex >= numSegments) {
                segmentIndex = numSegments - 1;
                segmentProgress = 1;
            }

 // Interpolate within the current segment
            const from = waypoints[segmentIndex];
            const to = waypoints[segmentIndex + 1] || waypoints[waypoints.length - 1];
            currentX = from.x + (to.x - from.x) * segmentProgress;
            currentY = from.y + (to.y - from.y) * segmentProgress;
        } else {
 // Fallback to direct beeline if no waypoints
            currentX = travel.startX + (travel.endX - travel.startX) * easeProgress;
            currentY = travel.startY + (travel.endY - travel.startY) * easeProgress;
        }

 // Update marker position (pass alreadyScaled=true since travel coords are pre-scaled)
        this.updatePlayerMarker(currentX, currentY, true);

 // CRITICAL: Ensure marker shows walking emoji with correct direction
 // updatePlayerMarker may recreate marker with default content so we must re-apply traveling state
        if (this.playerMarker) {
            // Check if marker has walking emoji - if not, it was recreated and needs traveling state
            const existingWalkEmoji = this.playerMarker.querySelector('.walk-emoji');
            if (!existingWalkEmoji) {
                // Marker was recreated - re-apply traveling state
                this.playerMarker.classList.add('traveling');
                this.playerMarker.style.flexDirection = 'column-reverse';
                // Get travel emoji (horse if owned, otherwise walking)
                const travelData = this.getTravelEmoji(travel.movingRight);
                const flipStyle = travelData.needsFlip ? 'transform: scaleX(-1);' : '';
                this.playerMarker.innerHTML = `
                    <div class="marker-tack" style="font-size: 42px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); animation: tack-walk 0.4s ease-in-out infinite; z-index: 152;"><span class="walk-emoji" style="display: inline-block; ${flipStyle}">${travelData.emoji}</span></div>
                    <div class="marker-shadow" style="position: absolute; bottom: -5px; width: 24px; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 50%; animation: shadow-pulse 3s ease-in-out infinite; z-index: 99;"></div>
                    <div class="marker-pulse" style="position: absolute; bottom: 0px; width: 16px; height: 16px; background: rgba(255, 136, 68, 0.5); border-radius: 50%; animation: marker-pulse 2s ease-out infinite; z-index: 100;"></div>
                    <div class="marker-label" style="background: linear-gradient(180deg, #ff8844 0%, #cc4400 100%); color: white; font-size: 9px; font-weight: bold; padding: 4px 10px; border-radius: 12px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.8); z-index: 151; letter-spacing: 0.5px; text-transform: uppercase;">TRAVELING...</div>
                `;
            }

            // Update direction based on SEGMENT destination, not frame-by-frame movement
            // Frame-by-frame causes flickering when position barely changes between frames
            if (travel.waypoints && travel.waypoints.length > 1) {
                // Find current segment's target waypoint and determine direction from that
                const waypoints = travel.waypoints;
                const numSegments = waypoints.length - 1;

                // Calculate which segment we're on (same logic as position calculation above)
                let totalDist = 0;
                const segmentDists = [];
                for (let i = 0; i < numSegments; i++) {
                    const dx = waypoints[i + 1].x - waypoints[i].x;
                    const dy = waypoints[i + 1].y - waypoints[i].y;
                    segmentDists.push(Math.sqrt(dx * dx + dy * dy));
                    totalDist += segmentDists[i];
                }

                let targetDist = progress * totalDist;
                let accumDist = 0;
                let segmentIndex = 0;
                for (let i = 0; i < numSegments; i++) {
                    if (accumDist + segmentDists[i] >= targetDist) {
                        segmentIndex = i;
                        break;
                    }
                    accumDist += segmentDists[i];
                    segmentIndex = i;
                }
                if (segmentIndex >= numSegments) segmentIndex = numSegments - 1;

                // Get segment direction: is the target waypoint to the right of start waypoint?
                const segmentStart = waypoints[segmentIndex];
                const segmentEnd = waypoints[segmentIndex + 1] || waypoints[waypoints.length - 1];
                const segmentMovingRight = segmentEnd.x > segmentStart.x;

                // Only update emoji if segment direction changed
                if (segmentMovingRight !== travel.movingRight) {
                    travel.movingRight = segmentMovingRight;
                    const span = this.playerMarker.querySelector('.walk-emoji');
                    if (span) {
                        // Get updated travel emoji for new direction
                        const travelData = this.getTravelEmoji(travel.movingRight);
                        span.textContent = travelData.emoji;
                        span.style.transform = travelData.needsFlip ? 'scaleX(-1)' : '';
                    }
                }
            }
            travel.lastX = currentX;
        }

 // Update travel progress display if paused (so player sees where they are)
        if (isPaused && this.playerMarker) {
            const label = this.playerMarker.querySelector('.marker-label');
            if (label) {
                const percentComplete = Math.round(progress * 100);
                label.textContent = `PAUSED (${percentComplete}%)`;
                label.style.background = 'linear-gradient(180deg, #888888 0%, #555555 100%)';
            }
        } else if (!isPaused && this.playerMarker) {
 // Resume traveling label
            const label = this.playerMarker.querySelector('.marker-label');
            if (label && label.textContent.startsWith('PAUSED')) {
                label.textContent = 'TRAVELING...';
                label.style.background = 'linear-gradient(180deg, #ff8844 0%, #cc4400 100%)';
            }
        }

        if (progress < 1) {
 // Continue animation - check every frame
 // time-synced so works whether paused or not
            this.travelAnimation = requestAnimationFrame(() => this.runTravelAnimation());
        } else {
 // Animation complete
            this.completeTravelAnimation();
        }
    },

 // the journey is over... for now 
    completeTravelAnimation() {
        console.log('🗺️ Travel animation complete!');
        this.travelAnimation = null;
        this.currentTravel = null;
        this._lastLoggedProgress = -1; // Reset progress tracking for next travel

        if (this.playerMarker) {
            this.playerMarker.classList.remove('traveling');
            this.playerMarker.classList.add('arrived');

 // Reset flex-direction back to normal column (was column-reverse during travel)
            this.playerMarker.style.flexDirection = 'column';

 // store reference to marker for setTimeout callbacks - prevents stale reference crash 
            const markerRef = this.playerMarker;

 // Rebuild marker with tack on TOP, label BELOW (normal stationary state)
            this.playerMarker.innerHTML = `
                <div class="marker-tack" style="font-size: 42px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); animation: marker-arrive 0.6s ease-out forwards; z-index: 152; transform-origin: bottom center;">📌</div>
                <div class="marker-shadow" style="position: absolute; bottom: -5px; width: 24px; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 50%; animation: shadow-pulse 3s ease-in-out infinite; z-index: 99;"></div>
                <div class="marker-pulse" style="position: absolute; bottom: 0px; width: 16px; height: 16px; background: rgba(220, 20, 60, 0.5); border-radius: 50%; animation: marker-arrival-pulse 0.8s ease-out; z-index: 100;"></div>
                <div class="marker-label" style="background: linear-gradient(180deg, #44ff44 0%, #00cc00 100%); color: white; font-size: 9px; font-weight: bold; padding: 4px 10px; border-radius: 12px; white-space: nowrap; margin-top: 2px; box-shadow: 0 3px 10px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.8); z-index: 151; letter-spacing: 0.5px; text-transform: uppercase;">ARRIVED!</div>
            `;

 // After animations complete, switch to normal idle state
            setTimeout(() => {
                if (markerRef && markerRef.isConnected) {
                    const tack = markerRef.querySelector('.marker-tack');
                    if (tack) tack.style.animation = 'tack-float 3s ease-in-out infinite';
                    const pulse = markerRef.querySelector('.marker-pulse');
                    if (pulse) pulse.style.animation = 'marker-pulse 2s ease-out infinite';
                }
            }, 800);

 // After 2 seconds, show normal "YOU ARE HERE"
            setTimeout(() => {
                if (markerRef && markerRef.isConnected) {
                    const label = markerRef.querySelector('.marker-label');
                    if (label) {
                        label.textContent = 'YOU ARE HERE';
                        label.style.background = 'linear-gradient(180deg, #dc143c 0%, #8b0000 100%)';
                    }
                    markerRef.classList.remove('arrived');
                }
            }, 2000);
        }

 // Add arrival animation styles if not already present
        this.addArrivalStyles();

 // DO NOT call render() here - TravelSystem.completeTravel() handles this AFTER
 // setting game.currentLocation properly. Calling render() here races with TravelSystem
 // and can render with stale location data, causing player to snap back to start.
 // TravelSystem calls: completeTravelAnimation() -> updatePlayerMarker() -> render()
    },

 // css magic for when you finally arrive somewhere (celebrate the small victories)
    addArrivalStyles() {
        if (document.getElementById('player-marker-arrival-styles')) return;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'player-marker-arrival-styles';
        styleSheet.textContent = `
            @keyframes marker-arrive {
                0% { transform: translateY(-20px) scale(1.5); opacity: 0.5; }
                60% { transform: translateY(5px) scale(0.9); }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes marker-hover {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
            }
            @keyframes marker-arrival-pulse {
                0% { transform: scale(1); opacity: 1; background: rgba(0, 255, 0, 0.8); }
                100% { transform: scale(4); opacity: 0; background: rgba(0, 255, 0, 0); }
            }
            .player-marker.arrived .marker-pin {
                filter: drop-shadow(0 4px 8px rgba(0, 255, 0, 0.6));
            }
        `;
        document.head.appendChild(styleSheet);
    },

 // called when you decide to leave your current misery for different misery
 // FIX: Now accepts optional route array for multi-hop path animation 
    onTravelStart(fromId, toId, travelTimeMinutes, route = null) {
        console.log(`🗺️ GameWorldRenderer.onTravelStart: ${fromId} -> ${toId}, duration: ${travelTimeMinutes} game minutes`);
        console.log('🗺️ Map element exists:', !!this.mapElement);
        console.log('🗺️ Player marker exists:', !!this.playerMarker);
        console.log('🗺️ Route:', route);
        console.log('🗺️ In tutorial mode:', this.isInTutorialMode());
        console.log('🗺️ game.inTutorial:', typeof game !== 'undefined' ? game.inTutorial : 'game undefined');
        this.animateTravel(fromId, toId, travelTimeMinutes, route);
        console.log('🗺️ After animateTravel - currentTravel:', !!this.currentTravel);
    },

 // when you chicken out or the universe intervenes
    onTravelCancel() {
        if (this.travelAnimation) {
            cancelAnimationFrame(this.travelAnimation);
            this.travelAnimation = null;
        }
        this.currentTravel = null;
        this.completeTravelAnimation();
    },

 // apply css transforms - math that makes things move
    updateTransform() {
        if (!this.mapElement) return;

 // Apply boundary constraints
        this.constrainToBounds();

        const transform = `translate(${this.mapState.offsetX}px, ${this.mapState.offsetY}px) scale(${this.mapState.zoom})`;
        this.mapElement.style.transform = transform;

 // counter-scale location markers and labels so they stay readable when zoomed out
 // When zoomed out to 0.3, we want markers to be ~2x bigger than they'd naturally be
 // This keeps them visible and clickable even at max zoom out
        this.updateMarkerScaling();
    },

 // scale markers inversely to zoom - bigger when zoomed out, normal when zoomed in
 // with smart collision avoidance and capped sizes to prevent overlap chaos
    updateMarkerScaling() {
        if (!this.mapElement) return;

        const zoom = this.mapState.zoom;

 // calculate inverse scale with CAPS to prevent icons from overwhelming roads
 // At zoom 2.0 = scale 0.6 (smaller, lots of detail visible)
 // At zoom 1.0 = scale 1.0 (normal)
 // At zoom 0.5 = scale 1.3 (slightly bigger)
 // At zoom 0.3 = scale 1.5 (capped - don't go crazy)
        const rawInverseScale = 1 / Math.sqrt(zoom);
        const markerScale = Math.max(0.6, Math.min(1.5, rawInverseScale));

 // labels need slightly different scaling - hide when too zoomed out
 // to prevent text overlap nightmare
        const labelScale = Math.max(0.7, Math.min(1.3, rawInverseScale));
        const labelOpacity = zoom < 0.4 ? Math.max(0, (zoom - 0.25) / 0.15) : 1; // Fade out below 0.4 zoom

 // Apply to all location markers
        const markers = this.mapElement.querySelectorAll('.map-location');
        markers.forEach(marker => {
            marker.style.transform = `translate(-50%, -50%) scale(${markerScale})`;
        });

 // Apply to all location labels with opacity fade for zoom-out
        const labels = this.mapElement.querySelectorAll('.map-location-label');
        labels.forEach(label => {
            label.style.transform = `translateX(-50%) scale(${labelScale})`;
            label.style.opacity = labelOpacity;
        });

 // Apply to player marker too - player always visible!
        const playerMarker = this.mapElement.querySelector('.player-marker');
        if (playerMarker) {
            playerMarker.style.transform = `translate(-50%, -50%) scale(${markerScale})`;
        }

 // Apply to property markers
        const propMarkers = this.mapElement.querySelectorAll('.property-marker');
        propMarkers.forEach(marker => {
            marker.style.transform = `translate(-50%, -50%) scale(${markerScale})`;
        });

 // update label positions based on zoom level to avoid overlaps
        this.updateLabelPositions(zoom, markerScale);
    },

 // labels now positioned ABOVE icons as children, no dynamic repositioning needed 
    updateLabelPositions(zoom, markerScale) {
 // Labels are now children of location elements and positioned with 'bottom'
 // They stay tied to their icons - no collision repositioning needed
    },

 // don't let the map escape the container (we've all wanted to escape)
 // TRUE INFINITE SCROLL - let the user drag freely!
    constrainToBounds() {
        if (!this.container) return;

        const containerRect = this.container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

 // Scaled map dimensions - use our massive map size
        const mapWidth = this.MAP_WIDTH * this.mapState.zoom;
        const mapHeight = this.MAP_HEIGHT * this.mapState.zoom;

 // VERY generous scrolling - keep at least 100px of map visible
 // This lets you center ANY location on screen
        const visibleMin = 100;

 // calculate proper bounds that allow centering any part of the map
 // Can scroll left until right edge is at visibleMin from right of container
 // Can scroll right until left edge is at (containerWidth - visibleMin) from left
        const minX = -(mapWidth - visibleMin);  // Scroll all the way left
        const maxX = containerWidth - visibleMin;  // Scroll all the way right

 // only apply constraints if they make sense (minX < maxX)
        if (minX < maxX) {
            this.mapState.offsetX = Math.max(minX, Math.min(maxX, this.mapState.offsetX));
        }
 // If map is smaller than container, center it instead of constraining
        else {
 // Map fits in container - allow free movement or center it
 // Don't constrain at all - let user place it wherever
        }

 // vertical constraints - same logic
        const minY = -(mapHeight - visibleMin);
        const maxY = containerHeight - visibleMin;

        if (minY < maxY) {
            this.mapState.offsetY = Math.max(minY, Math.min(maxY, this.mapState.offsetY));
        }
    },

 // mouse events - translating human frustration into map movement
    onMouseDown(e) {
        if (e.target.classList.contains('map-location')) return; // Don't drag when clicking locations

        e.preventDefault();
        this.mapState.isDragging = true;
        this.mapState.dragStartX = e.clientX;
        this.mapState.dragStartY = e.clientY;
        this.mapState.lastOffsetX = this.mapState.offsetX;
        this.mapState.lastOffsetY = this.mapState.offsetY;
        this.mapElement.style.cursor = 'grabbing';
 // disable any transitions during drag for instant response 
        this.mapElement.classList.add('dragging');
    },

    onMouseMove(e) {
        if (!this.mapState.isDragging) return;

        const dx = e.clientX - this.mapState.dragStartX;
        const dy = e.clientY - this.mapState.dragStartY;

        this.mapState.offsetX = this.mapState.lastOffsetX + dx;
        this.mapState.offsetY = this.mapState.lastOffsetY + dy;

 // use lightweight transform during drag for smooth panning 
        this.updateTransformFast();
    },

    onMouseUp(e) {
        this.mapState.isDragging = false;
        if (this.mapElement) {
            this.mapElement.style.cursor = 'grab';
 // re-enable transitions after drag 
            this.mapElement.classList.remove('dragging');
        }
 // full update with marker scaling and bounds after drag ends 
        this.updateTransform();
    },

 // lightweight transform for smooth dragging - NO constraints, NO scaling 
 // pure 1:1 mouse movement to map movement - pixel perfect smoothness
    updateTransformFast() {
        if (!this.mapElement) return;

 // NO constrainToBounds() during drag - that causes the snapping/jumping! 
 // NO marker scaling - that causes the stutter! 
 // Just raw, pure CSS transform - exactly what the mouse dictates
        this.mapElement.style.transform = `translate(${this.mapState.offsetX}px, ${this.mapState.offsetY}px) scale(${this.mapState.zoom})`;
    },

 // zoom handlers - for when you need to see your problems closer or further away
 // zoom towards cursor position, not the corner like some amateur hour nonsense
 // FIXED: Adaptive zoom granularity - smaller steps at high zoom, larger at low zoom
    onWheel(e) {
        e.preventDefault();

 // Adaptive zoom speed based on current zoom level
 // At high zoom (2.0), we want smaller steps (~2-3%) for precision
 // At low zoom (0.5), we want larger steps (~5-8%) to move faster
 // Use logarithmic scaling for consistent "feel" across zoom range
        const oldZoom = this.mapState.zoom;

 // Normalize deltaY - trackpad sends small deltas, mouse wheel sends large ones
 // Clamp to reasonable range to prevent massive jumps
        const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);

 // Base zoom sensitivity - adjusted by current zoom level
 // Higher zoom = finer control (smaller factor), lower zoom = coarser control
        const baseSensitivity = 0.0015; // base multiplier
        const zoomAdjust = Math.max(0.5, 2.0 - oldZoom); // More sensitive when zoomed out

 // Calculate zoom change - deltaY is positive for zoom out, negative for zoom in
        const zoomChange = -normalizedDelta * baseSensitivity * zoomAdjust;
        const zoomFactor = 1 + zoomChange;

        const newZoom = Math.max(this.mapState.minZoom, Math.min(this.mapState.maxZoom, oldZoom * zoomFactor));

        if (Math.abs(newZoom - oldZoom) < 0.001) return; // no meaningful change, bail

 // Get cursor position relative to the container
        const containerRect = this.container.getBoundingClientRect();
        const cursorX = e.clientX - containerRect.left;
        const cursorY = e.clientY - containerRect.top;

 // Calculate the map position under the cursor before zoom
 // mapPos = (cursorPos - offset) / zoom
        const mapX = (cursorX - this.mapState.offsetX) / oldZoom;
        const mapY = (cursorY - this.mapState.offsetY) / oldZoom;

 // Apply new zoom
        this.mapState.zoom = newZoom;

 // Adjust offset so the same map position stays under the cursor
 // cursorPos = mapPos * newZoom + newOffset
 // newOffset = cursorPos - mapPos * newZoom
        this.mapState.offsetX = cursorX - mapX * newZoom;
        this.mapState.offsetY = cursorY - mapY * newZoom;

        this.updateTransform();
    },

 // zoom in/out buttons zoom towards center of viewport
 // FIXED: Finer zoom (10% per step instead of 15%)
 // This means each step feels the same regardless of current zoom level
    zoomIn() {
        this.zoomToCenter(1.10); // 10% zoom in
        // FIX: Dispatch ui-action for tutorial quest (zoom_map objective)
        document.dispatchEvent(new CustomEvent('ui-action', {
            detail: { action: 'zoom_map', direction: 'in' }
        }));
    },

    zoomOut() {
        this.zoomToCenter(1 / 1.10); // 10% zoom out (inverse)
        // FIX: Dispatch ui-action for tutorial quest (zoom_map objective)
        document.dispatchEvent(new CustomEvent('ui-action', {
            detail: { action: 'zoom_map', direction: 'out' }
        }));
    },

 // zoomFactor is a multiplier: >1 zooms in, <1 zooms out
    zoomToCenter(zoomFactor) {
        const oldZoom = this.mapState.zoom;
        const newZoom = Math.max(this.mapState.minZoom, Math.min(this.mapState.maxZoom, oldZoom * zoomFactor));

        if (Math.abs(newZoom - oldZoom) < 0.001) return; // prevent micro-adjustments

        const containerRect = this.container.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

 // Same math as onWheel but using center of viewport
        const mapX = (centerX - this.mapState.offsetX) / oldZoom;
        const mapY = (centerY - this.mapState.offsetY) / oldZoom;

        this.mapState.zoom = newZoom;
        this.mapState.offsetX = centerX - mapX * newZoom;
        this.mapState.offsetY = centerY - mapY * newZoom;

        this.updateTransform();
    },

    resetView() {
 // Reset to default zoom (max zoomed in - fills screen)
        this.mapState.zoom = this.mapState.defaultZoom;

 // Center on player's current location
        this.centerOnPlayer();
    },

 // center on player - the universe revolves around you (at least here)
    centerOnPlayer() {
        if (!this.container) return;

 // Try to get player's current location position
        let pos = null;

 // First try game.currentLocation.mapPosition
        if (typeof game !== 'undefined' && game.currentLocation && game.currentLocation.mapPosition) {
            pos = this.scalePosition(game.currentLocation.mapPosition);
        }
 // If not found, look up from active world using location ID
        else if (typeof game !== 'undefined' && game.currentLocation && game.currentLocation.id) {
            const locations = this.getActiveLocations();
            const location = locations[game.currentLocation.id];
            if (location && location.mapPosition) {
                pos = this.scalePosition(location.mapPosition);
            }
        }
 // Fallback: try to find any location from active world
        else {
            const locations = this.getActiveLocations();
            if (Object.keys(locations).length > 0) {
 // Default to tutorial start or capital or first available location
                const defaultLoc = locations['tutorial_village'] || locations['royal_capital'] ||
                                  locations['greendale'] || Object.values(locations)[0];
                if (defaultLoc && defaultLoc.mapPosition) {
                    pos = this.scalePosition(defaultLoc.mapPosition);
                }
            }
        }

 // If still no position, center the map itself
        if (!pos) {
            console.warn('🗺️ No location position found, centering map');
            pos = { x: this.MAP_WIDTH / 2, y: this.MAP_HEIGHT / 2 }; // Default center of map (already scaled)
        }

        const containerRect = this.container.getBoundingClientRect();

 // Calculate offset to center the location in the container
 // The location's position on the scaled map should appear at center of container
        this.mapState.offsetX = (containerRect.width / 2) - (pos.x * this.mapState.zoom);
        this.mapState.offsetY = (containerRect.height / 2) - (pos.y * this.mapState.zoom);

 // Apply constraints and update
        this.updateTransform();
        console.log('🗺️ Centered on location at', pos, 'offset:', this.mapState.offsetX, this.mapState.offsetY);
    },

 // center on a specific location by ID - for quest "Show on Map" button
    centerOnLocation(locationId) {
        if (!this.container || !locationId) {
            console.warn('🗺️ Cannot center - no container or locationId');
            return false;
        }

 // Look up the location from active world (tutorial or normal)
        const locations = this.getActiveLocations();
        if (Object.keys(locations).length === 0) {
            console.warn('🗺️ No locations available');
            return false;
        }

        const location = locations[locationId];
        if (!location || !location.mapPosition) {
            console.warn(`🗺️ Location "${locationId}" not found or has no mapPosition`);
            return false;
        }

 // Scale the position to our map dimensions
        const pos = this.scalePosition(location.mapPosition);

        const containerRect = this.container.getBoundingClientRect();

 // Calculate offset to center this location in the container
        this.mapState.offsetX = (containerRect.width / 2) - (pos.x * this.mapState.zoom);
        this.mapState.offsetY = (containerRect.height / 2) - (pos.y * this.mapState.zoom);

 // Apply constraints and update
        this.updateTransform();
        console.log(`🗺️ Centered on "${this.getLocationName(locationId)}" at`, pos, 'offset:', this.mapState.offsetX, this.mapState.offsetY);
        return true;
    },

 // touch handlers - for those brave souls on mobile
    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.mapState.isDragging = true;
            this.mapState.dragStartX = touch.clientX;
            this.mapState.dragStartY = touch.clientY;
            this.mapState.lastOffsetX = this.mapState.offsetX;
            this.mapState.lastOffsetY = this.mapState.offsetY;
 // disable transitions during touch drag 
            if (this.mapElement) this.mapElement.classList.add('dragging');
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

 // use lightweight transform for smooth touch panning 
        this.updateTransformFast();
    },

    onTouchEnd(e) {
        this.mapState.isDragging = false;
 // re-enable transitions and do full update after touch drag 
        if (this.mapElement) this.mapElement.classList.remove('dragging');
        this.updateTransform();
    },

 // tooltip handlers - whispers of information when you hover over things
    onLocationHover(e, location, isDiscovered = false) {
        const style = this.locationStyles[location.type] || this.locationStyles.town;

        // FIX: Dispatch ui-action for tutorial quest (hover_location objective)
        document.dispatchEvent(new CustomEvent('ui-action', {
            detail: { action: 'hover_location', location: location.id }
        }));

        if (isDiscovered) {
 // Check if this is a gatehouse - show more info including fees so players know where to go
            const isGate = this.isGatehouse(location.id);
            let gateInfo = isGate ? this.getGateInfo(location) : '';

 // check for tracked quest even at undiscovered locations 
            let questInfo = '';
            if (typeof QuestSystem !== 'undefined' && QuestSystem.getQuestInfoForLocation) {
                const quest = QuestSystem.getQuestInfoForLocation(location.id);
                if (quest) {
 // use ORANGE for doom quests, gold for normal
                    const isDoomQuest = quest.isDoom || quest.questId?.startsWith('doom_');
                    const bgColor = isDoomQuest ? 'rgba(255, 140, 0, 0.15)' : 'rgba(255, 215, 0, 0.15)';
                    const borderColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                    const textColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                    const subTextColor = isDoomQuest ? '#ffb347' : '#ffeb3b';
                    questInfo = `
                        <div style="margin-top: 8px; padding: 8px; background: ${bgColor}; border-radius: 6px; border-left: 3px solid ${borderColor};">
                            <div style="color: ${textColor}; font-weight: bold; margin-bottom: 4px;">🎯 ${quest.questName}</div>
                            ${quest.objective ? `<div style="color: ${subTextColor}; font-size: 11px;">${quest.objective}</div>` : ''}
                        </div>
                    `;
                }
            }

            if (isGate) {
 // Gatehouses show their name and fee info even when discovered
 // so players can make informed decisions about where to travel
                this.tooltipElement.innerHTML = `
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #ff9800;">
                        🏰 ${this.getLocationName(location.id)}
                    </div>
                    <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">
                        Outpost • ${location.region} (unexplored)
                    </div>
                    <div style="font-size: 12px; line-height: 1.4; color: #888; font-style: italic;">
                        A frontier outpost guarding passage to new lands...
                    </div>
                    ${gateInfo}
                    ${questInfo}
                    <div style="color: #95E77E; margin-top: 5px;">🖱️ Click to travel here</div>
                `;
            } else {
 // Check if location is behind a locked gate
                let accessInfo = '';
                if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.canAccessLocation) {
                    const currentLoc = game?.currentLocation?.id;
                    const access = GatehouseSystem.canAccessLocation(location.id, currentLoc);
                    if (!access.accessible && access.gatehouse) {
                        const gateInfo = GatehouseSystem.GATEHOUSES[access.gatehouse];
                        accessInfo = `
                            <div style="margin-top: 8px; padding: 8px; background: rgba(244, 67, 54, 0.2); border-radius: 6px; border-left: 3px solid #f44336;">
                                <div style="color: #f44336; font-weight: bold; margin-bottom: 4px;">🚫 Restricted Area</div>
                                <div style="color: #ef9a9a; font-size: 11px;">Requires passage through ${gateInfo?.name || 'a gatehouse'}</div>
                                <div style="color: #ffb74d; font-size: 11px; margin-top: 4px;">💰 Fee: ${access.fee || gateInfo?.fee || '???'} gold</div>
                            </div>
                        `;
                    }
                }

 // Regular undiscovered locations show limited info
                this.tooltipElement.innerHTML = `
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #888;">
                        ❓ Unknown Location
                    </div>
                    <div style="color: #666; font-size: 12px; margin-bottom: 5px;">
                        Unexplored territory
                    </div>
                    <div style="font-size: 12px; line-height: 1.4; color: #888; font-style: italic;">
                        Travel here to discover what lies in this area...
                    </div>
                    ${accessInfo}
                    ${questInfo}
                    <div style="color: #95E77E; margin-top: 5px;">🖱️ Click to explore</div>
                `;
            }
        } else {
 // Check if this is a gate/outpost with passage fees
            let gateInfo = this.getGateInfo(location);

 // check for tracked quest at this location 
            let questInfo = '';
            if (typeof QuestSystem !== 'undefined' && QuestSystem.getQuestInfoForLocation) {
                const quest = QuestSystem.getQuestInfoForLocation(location.id);
                if (quest) {
 // use ORANGE for doom quests, gold for normal
                    const isDoomQuest = quest.isDoom || quest.questId?.startsWith('doom_');
                    const bgColor = isDoomQuest ? 'rgba(255, 140, 0, 0.15)' : 'rgba(255, 215, 0, 0.15)';
                    const borderColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                    const textColor = isDoomQuest ? '#ff8c00' : '#ffd700';
                    const subTextColor = isDoomQuest ? '#ffb347' : '#ffeb3b';
                    questInfo = `
                        <div style="margin-top: 8px; padding: 8px; background: ${bgColor}; border-radius: 6px; border-left: 3px solid ${borderColor};">
                            <div style="color: ${textColor}; font-weight: bold; margin-bottom: 4px;">🎯 ${quest.questName}</div>
                            ${quest.objective ? `<div style="color: ${subTextColor}; font-size: 11px;">${quest.objective}</div>` : ''}
                        </div>
                    `;
                }
            }

            this.tooltipElement.innerHTML = `
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                    ${style.icon} ${this.getLocationName(location.id)}
                </div>
                <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">
                    ${location.type.charAt(0).toUpperCase() + location.type.slice(1)} • ${location.region}
                </div>
                <div style="font-size: 12px; line-height: 1.4;">
                    ${location.description || 'No description available.'}
                </div>
                ${gateInfo}
                ${questInfo}
                ${this.isCurrentLocation(location) ? '<div style="color: #4fc3f7; margin-top: 5px;">📍 You are here</div>' : '<div style="color: #95E77E; margin-top: 5px;">🖱️ Click to travel</div>'}
            `;
        }

        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (e.clientX + 15) + 'px';
        this.tooltipElement.style.top = (e.clientY + 15) + 'px';
    },

 // get gate/outpost fee information for tooltips
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
                <div style="margin-top: 8px; padding: 8px; background: rgba(76, 175, 80, 0.2); border-radius: 6px; border-left: 3px solid #4caf50;">
                    <div style="color: #4caf50; font-weight: bold; margin-bottom: 4px;">🔓 Passage Unlocked</div>
                    <div style="color: #81c784; font-size: 11px;">Free access to ${zoneName}</div>
                    <div style="color: #aaa; font-size: 10px; margin-top: 4px;">💱 Trading available</div>
                </div>
            `;
        } else {
            return `
                <div style="margin-top: 8px; padding: 8px; background: rgba(255, 152, 0, 0.2); border-radius: 6px; border-left: 3px solid #ff9800;">
                    <div style="color: #ff9800; font-weight: bold; margin-bottom: 4px;">🔒 Passage Fee Required</div>
                    <div style="color: #ffb74d; font-size: 12px;">💰 ${fee} gold (one-time)</div>
                    <div style="color: #aaa; font-size: 11px; margin-top: 4px;">Unlocks: ${zoneName}</div>
                    <div style="color: #81c784; font-size: 10px; margin-top: 4px;">💱 Trading available without fee</div>
                </div>
            `;
        }
    },

    hideTooltip() {
        this.tooltipElement.style.display = 'none';
    },

 // location click handler - INSTANT TRAVEL - click and you're going 
 // No more setting destinations and waiting - click means GO, mortal
    onLocationClick(e, location, isDiscovered = false) {
        e.stopPropagation();

        if (this.isCurrentLocation(location)) {
            addMessage(`📍 You are already at ${this.getLocationName(location.id)}. go touch grass or something.`);
            return;
        }

 // If already traveling - reroute to new destination via TravelPanelMap
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition?.isTraveling) {
            if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.rerouteTravel) {
                TravelPanelMap.rerouteTravel(location.id, isDiscovered);
            } else {
                addMessage(`warning: Already traveling! Arrive first or cancel your current journey.`);
            }
            return;
        }

 // Set destination AND start travel immediately via TravelPanelMap
 // This handles all the complexity - we just delegate to the expert
        if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.setDestinationAndTravel) {
            TravelPanelMap.setDestinationAndTravel(location.id, isDiscovered);
        } else {
 // Fallback: just set destination if TravelPanelMap not available
            this.setDestination(location.id);
            const destName = isDiscovered ? 'mysterious unknown location' : location.name;
            addMessage(`🎯 Destination set: ${destName}. Open travel panel to begin.`);
        }

        this.render(); // Re-render to show destination highlight
    },

 // utility functions
    isCurrentLocation(location) {
        return game && game.currentLocation && game.currentLocation.id === location.id;
    },

 // color utilities delegated to ColorUtils (src/js/utils/color-utils.js)
 // rIP duplicate implementations - consolidated into one dark source of truth
    darkenColor(hex, percent) {
        return ColorUtils.darkenColor(hex, percent);
    },

    lightenColor(hex, percent) {
        return ColorUtils.lightenColor(hex, percent);
    },

 // fullscreen toggle
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.warn('Fullscreen failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    },

 // ═══════════════════════════════════════════════════════════════
 // LOCATION HISTORY SYSTEM
 // ═══════════════════════════════════════════════════════════════

 // Load history from localStorage
    loadLocationHistory() {
        try {
            const saved = localStorage.getItem(this.HISTORY_STORAGE_KEY);
            if (saved) {
                this.locationHistory = JSON.parse(saved);
                console.log('📜 Loaded location history:', this.locationHistory.length, 'entries');
            }
        } catch (e) {
            console.warn('📜 Could not load location history:', e);
            this.locationHistory = [];
        }
    },

 // Save history to localStorage
    saveLocationHistory() {
        try {
 // Keep only last 100 entries to prevent storage bloat
            if (this.locationHistory.length > 100) {
                this.locationHistory = this.locationHistory.slice(-100);
            }
            localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(this.locationHistory));
        } catch (e) {
            console.warn('📜 Could not save location history:', e);
        }
    },

 // Record a location visit
    recordLocationVisit(locationId, details = {}) {
        const locations = this.getActiveLocations();
        const location = locations[locationId];
        if (!location) return;

        const style = this.locationStyles[location.type] || this.locationStyles.town;

        const entry = {
            id: locationId,
            name: location.name,
            type: location.type,
            icon: style.icon,
            region: location.region || 'Unknown',
            timestamp: Date.now(),
            gameTime: typeof TimeSystem !== 'undefined' ? TimeSystem.getFormattedTime() : 'Unknown',
            gameDay: typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime.day : 1,
            goldOnArrival: typeof game !== 'undefined' ? game.player?.gold || 0 : 0,
            goldOnDeparture: null,
            profitLoss: null,
            events: details.events || [],
            trades: details.trades || [],
            isFirstVisit: details.isFirstVisit || false
        };

        this.locationHistory.push(entry);
        this.saveLocationHistory();
        console.log('📜 Recorded visit to:', location.name);

        return entry;
    },

 // Update the last visit entry when leaving a location
    recordLocationDeparture() {
        if (this.locationHistory.length === 0) return;

        const lastEntry = this.locationHistory[this.locationHistory.length - 1];
        const currentGold = typeof game !== 'undefined' ? game.player?.gold || 0 : 0;

        lastEntry.goldOnDeparture = currentGold;
        lastEntry.profitLoss = currentGold - lastEntry.goldOnArrival;

        this.saveLocationHistory();
        console.log('📜 Recorded departure, profit/loss:', lastEntry.profitLoss);
    },

 // Add an event to the current location visit
    addEventToCurrentVisit(eventDescription) {
        if (this.locationHistory.length === 0) return;

        const lastEntry = this.locationHistory[this.locationHistory.length - 1];
        lastEntry.events.push({
            time: typeof TimeSystem !== 'undefined' ? TimeSystem.getFormattedTime() : 'Unknown',
            description: eventDescription
        });

        this.saveLocationHistory();
    },

 // destination history - track where the player has traveled
    destinationHistory: [],

 // Set current destination
    setDestination(locationId) {
        const locations = this.getActiveLocations();
        const location = locations[locationId];

        if (location) {
            const style = this.locationStyles[location.type] || this.locationStyles.town;
            this.currentDestination = {
                id: locationId,
                name: location.name,
                type: location.type,
                icon: style.icon,
                reached: false,
                setTime: Date.now()
            };
        } else {
            this.currentDestination = null;
        }

        this.updateHistoryPanel();
    },

 // Mark destination as reached (grayed out) instead of clearing
    markDestinationReached() {
        if (this.currentDestination && !this.currentDestination.reached) {
            this.currentDestination.reached = true;
            this.currentDestination.reachedTime = Date.now();

 // Add to destination history
            this.destinationHistory.push({ ...this.currentDestination });

 // Keep only last 20 destinations in history
            if (this.destinationHistory.length > 20) {
                this.destinationHistory.shift();
            }
        }
        this.updateHistoryPanel();
    },

 // Clear destination (only used for explicit user action)
    clearDestination() {
 // Mark as reached first if not already
        if (this.currentDestination && !this.currentDestination.reached) {
            this.markDestinationReached();
        }
        this.currentDestination = null;
        this.updateHistoryPanel();
    },

 // Get visit history for a specific location
    getLocationVisits(locationId) {
        return this.locationHistory.filter(entry => entry.id === locationId);
    },

 // Get total profit/loss for a location
    getLocationTotalProfit(locationId) {
        const visits = this.getLocationVisits(locationId);
        return visits.reduce((total, visit) => total + (visit.profitLoss || 0), 0);
    },

 // Render the history panel
    updateHistoryPanel() {
        const historyContainer = document.getElementById('travel-history');
        if (!historyContainer) return;

        const locations = this.getActiveLocations();
        const currentLocId = typeof game !== 'undefined' && game.currentLocation ? game.currentLocation.id : null;
        const currentLoc = currentLocId ? locations[currentLocId] : null;
        const currentStyle = currentLoc ? (this.locationStyles[currentLoc.type] || this.locationStyles.town) : null;

        let html = '';

 // Current Location Section
        html += `<div class="history-section current-location-section">
            <h3>📍 Current Location</h3>
            <div class="current-location-card">`;

        if (currentLoc) {
            // Check passage status for current location
            let passageHtml = '';
            if (typeof GatehouseSystem !== 'undefined' && GatehouseSystem.getPassageStatus) {
                const passageStatus = GatehouseSystem.getPassageStatus(currentLoc.id);
                if (passageStatus.passageText) {
                    const passageClass = passageStatus.hasFreePassage ? 'passage-unlocked' : 'passage-locked';
                    passageHtml = `<span class="passage-badge ${passageClass}">${passageStatus.passageText}</span>`;
                }
            }

            html += `
                <div class="location-header">
                    <span class="location-icon">${currentStyle.icon}</span>
                    <span class="location-name">${currentLoc.name}</span>
                    ${passageHtml}
                </div>
                <div class="location-details">
                    <span class="location-type">${currentLoc.type}</span>
                    <span class="location-region">${currentLoc.region || 'Unknown Region'}</span>
                </div>`;
        } else {
            html += `<div class="no-location">Unknown</div>`;
        }

        html += `</div></div>`;

 // Destination Section
        html += `<div class="history-section destination-section">
            <h3>🎯 Destination</h3>
            <div class="destination-card">`;

        if (this.currentDestination) {
            const isReached = this.currentDestination.reached;
            html += `
                <div class="location-header ${isReached ? 'destination-reached' : ''}">
                    <span class="location-icon">${this.currentDestination.icon}</span>
                    <span class="location-name">${this.currentDestination.name}</span>
                </div>
                <div class="traveling-indicator">${isReached ? '✅ Arrived!' : '🚶 Traveling...'}</div>`;
        } else {
            html += `<div class="no-destination">No destination set</div>`;
        }

        html += `</div>`;

 // previous destinations (grayed out history)
        if (this.destinationHistory.length > 0) {
            html += `<div class="destination-history">
                <div class="history-label">Previous Destinations:</div>`;
 // Show last 5 destinations, most recent first
            const recentDests = [...this.destinationHistory].reverse().slice(0, 5);
            recentDests.forEach(dest => {
                html += `
                    <div class="past-destination">
                        <span class="location-icon">${dest.icon}</span>
                        <span class="location-name">${dest.name}</span>
                    </div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;

 // Visit History Section
        html += `<div class="history-section visit-history-section">
            <h3>📜 Travel Journal (${this.locationHistory.length} entries)</h3>
            <div class="history-list">`;

        if (this.locationHistory.length === 0) {
            html += `<div class="no-history">No travel history yet. Start exploring!</div>`;
        } else {
 // Show most recent first
            const recentHistory = [...this.locationHistory].reverse().slice(0, 50);

            recentHistory.forEach((entry, index) => {
                const profitClass = entry.profitLoss > 0 ? 'profit' : (entry.profitLoss < 0 ? 'loss' : 'neutral');
                const profitText = entry.profitLoss !== null
                    ? (entry.profitLoss >= 0 ? `+${entry.profitLoss}` : `${entry.profitLoss}`)
                    : '---';

                html += `
                <div class="history-entry ${entry.isFirstVisit ? 'first-visit' : ''}">
                    <div class="entry-header">
                        <span class="entry-icon">${entry.icon}</span>
                        <span class="entry-name">${entry.name}</span>
                        ${entry.isFirstVisit ? '<span class="first-visit-badge">NEW!</span>' : ''}
                    </div>
                    <div class="entry-details">
                        <span class="entry-time">Day ${entry.gameDay} - ${entry.gameTime}</span>
                        <span class="entry-profit ${profitClass}">${profitText} gold</span>
                    </div>`;

 // Show events if any
                if (entry.events && entry.events.length > 0) {
                    html += `<div class="entry-events">`;
                    entry.events.slice(0, 3).forEach(evt => {
                        html += `<div class="event-item">⚡ ${evt.description}</div>`;
                    });
                    if (entry.events.length > 3) {
                        html += `<div class="event-more">+${entry.events.length - 3} more events</div>`;
                    }
                    html += `</div>`;
                }

                html += `</div>`;
            });
        }

        html += `</div></div>`;

        historyContainer.innerHTML = html;

 // Add styles if not already present
        this.addHistoryStyles();
    },

 // Add CSS styles for the history panel
    addHistoryStyles() {
        if (document.getElementById('location-history-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'location-history-styles';
        styles.textContent = `
            .history-section {
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(30, 30, 50, 0.8);
                border-radius: 8px;
                border: 1px solid rgba(79, 195, 247, 0.2);
            }

            .history-section h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #4fc3f7;
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
                padding-bottom: 5px;
            }

            .current-location-card, .destination-card {
                background: rgba(40, 40, 70, 0.6);
                padding: 10px;
                border-radius: 6px;
            }

            .location-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 5px;
            }

            .location-icon {
                font-size: 24px;
            }

            .location-name {
                font-size: 16px;
                font-weight: bold;
                color: #fff;
            }

            /* Passage status badge */
            .passage-badge {
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: bold;
                margin-left: auto;
            }

            .passage-badge.passage-unlocked {
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(56, 142, 60, 0.4) 100%);
                border: 1px solid rgba(76, 175, 80, 0.6);
                color: #a5d6a7;
            }

            .passage-badge.passage-locked {
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(198, 40, 40, 0.4) 100%);
                border: 1px solid rgba(244, 67, 54, 0.6);
                color: #ef9a9a;
            }

            .location-details {
                display: flex;
                gap: 10px;
                font-size: 12px;
                color: #888;
            }

            .location-type {
                text-transform: capitalize;
            }

            .no-location, .no-destination, .no-history {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 10px;
            }

            .traveling-indicator {
                color: #ff9800;
                font-size: 12px;
                margin-top: 5px;
                animation: pulse 1.5s ease-in-out infinite;
            }

            /* 🎯 Reached destination - grayed out */
            .destination-reached {
                opacity: 0.6;
            }
            .destination-reached .location-name {
                color: #888;
                text-decoration: line-through;
            }

            /* 📜 Previous destinations history */
            .destination-history {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid rgba(79, 195, 247, 0.2);
            }
            .destination-history .history-label {
                font-size: 11px;
                color: #666;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .past-destination {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                margin-bottom: 4px;
                background: rgba(30, 30, 50, 0.5);
                border-radius: 4px;
                opacity: 0.5;
            }
            .past-destination .location-icon {
                font-size: 14px;
            }
            .past-destination .location-name {
                font-size: 12px;
                color: #666;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .history-list {
                max-height: 400px;
                overflow-y: auto;
                padding-right: 5px;
            }

            .history-entry {
                background: rgba(40, 40, 70, 0.6);
                padding: 8px 10px;
                border-radius: 6px;
                margin-bottom: 8px;
                border-left: 3px solid #4fc3f7;
            }

            .history-entry.first-visit {
                border-left-color: #ff9800;
            }

            .entry-header {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 4px;
            }

            .entry-icon {
                font-size: 18px;
            }

            .entry-name {
                font-weight: bold;
                color: #fff;
                font-size: 13px;
            }

            .first-visit-badge {
                background: #ff9800;
                color: #000;
                font-size: 9px;
                padding: 2px 5px;
                border-radius: 3px;
                font-weight: bold;
            }

            .entry-details {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #888;
            }

            .entry-profit {
                font-weight: bold;
            }

            .entry-profit.profit {
                color: #4caf50;
            }

            .entry-profit.loss {
                color: #f44336;
            }

            .entry-profit.neutral {
                color: #888;
            }

            .entry-events {
                margin-top: 5px;
                padding-top: 5px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .event-item {
                font-size: 11px;
                color: #aaa;
                padding: 2px 0;
            }

            .event-more {
                font-size: 10px;
                color: #666;
                font-style: italic;
            }

            /* Scrollbar styling */
            .history-list::-webkit-scrollbar {
                width: 6px;
            }

            .history-list::-webkit-scrollbar-track {
                background: rgba(30, 30, 50, 0.5);
                border-radius: 3px;
            }

            .history-list::-webkit-scrollbar-thumb {
                background: rgba(79, 195, 247, 0.5);
                border-radius: 3px;
            }

            .history-list::-webkit-scrollbar-thumb:hover {
                background: rgba(79, 195, 247, 0.7);
            }
        `;

        document.head.appendChild(styles);
    },

 // Clear all history
    clearHistory() {
        this.locationHistory = [];
        this.saveLocationHistory();
        this.updateHistoryPanel();
        console.log('📜 Location history cleared');
    },

 // cleanup before re-initialization - prevents stale DOM elements 
    cleanup() {
 // Remove tooltip element
        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }

 // Clear map element contents (preserves backdrop container)
        if (this.mapElement) {
            const backdrop = this.mapElement.querySelector('.backdrop-container');
            this.mapElement.innerHTML = '';
            if (backdrop) {
                this.mapElement.appendChild(backdrop);
            }
        }

        console.log('🗺️ GameWorldRenderer cleaned up');
    },

 // full teardown - removes all DOM elements and references 
    destroy() {
        this.cleanup();

 // Remove map element entirely
        if (this.mapElement && this.mapElement.parentNode) {
            this.mapElement.remove();
            this.mapElement = null;
        }

 // Clear backdrop references
        if (this.backdropContainer && this.backdropContainer.parentNode) {
            this.backdropContainer.remove();
        }
        this.backdropContainer = null;
        this.currentBackdrop = null;
        this.previousBackdrop = null;

 // Clear state
        this.container = null;
        this.currentDestination = null;
        this.currentSeason = null;

        console.log('🗺️ GameWorldRenderer destroyed 💀');
    }
};

// register with Bootstrap
Bootstrap.register('GameWorldRenderer', () => GameWorldRenderer.init(), {
    dependencies: ['GameWorld', 'TravelSystem', 'PanelManager'],
    priority: 108,
    severity: 'optional'
});

console.log('🗺️ GameWorldRenderer v2 loaded');
