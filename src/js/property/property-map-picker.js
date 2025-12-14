// ═══════════════════════════════════════════════════════════════
// PROPERTY MAP PICKER - choose where to build your empire
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PropertyMapPicker = {
    // DOM elements
    overlay: null,
    mapContainer: null,
    mapElement: null,
    tooltipElement: null,
    infoPanel: null,

    // FIX: Escape HTML to prevent XSS injection
    _escapeHTML(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // State
    isOpen: false,
    selectedLocation: null,
    buildableLocations: [],
    onLocationSelected: null, // callback

    // Map state - using MapRendererBase patterns
    mapState: null,

    // Bound event listeners for cleanup
    _boundMouseMove: null,
    _boundMouseUp: null,
    _boundKeyDown: null,

    // Location styles from base - with property-specific modifications
    get locationStyles() {
        const styles = {};
        if (typeof MapRendererBase !== 'undefined') {
            Object.entries(MapRendererBase.LOCATION_STYLES).forEach(([type, base]) => {
                styles[type] = {
                    color: base.color,
                    icon: base.icon,
                    size: Math.round(base.baseSize * 1.2) // Slightly larger for easier clicking
                };
            });
        }
        return styles;
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION - Setting up the dark portal
    // ═══════════════════════════════════════════════════════════════

    init() {
        console.log('PropertyMapPicker: Initializing...');
        this.mapState = MapRendererBase?.createDefaultMapState({
            zoom: 0.8,
            minZoom: 0.4,
            maxZoom: 2.5,
            defaultZoom: 0.8
        }) || {
            zoom: 0.8, offsetX: 0, offsetY: 0,
            minZoom: 0.4, maxZoom: 2.5, defaultZoom: 0.8,
            isDragging: false, dragStartX: 0, dragStartY: 0,
            lastOffsetX: 0, lastOffsetY: 0
        };
        console.log('PropertyMapPicker: Ready!');
    },

    // ═══════════════════════════════════════════════════════════════
    // OPEN/CLOSE - The dark portal beckons
    // ═══════════════════════════════════════════════════════════════

    /**
     * Open the property map picker overlay
     * @param {Function} onSelect - Callback when location is selected (receives locationId)
     */
    open(onSelect = null) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.onLocationSelected = onSelect;
        this.selectedLocation = null;

        // Get buildable locations
        this.buildableLocations = PropertyPurchase?.getBuildableLocations() || [];
        console.log('PropertyMapPicker: Buildable locations:', this.buildableLocations);

        this.createOverlay();
        this.setupEventListeners();
        this.render();
        this.centerOnCurrentLocation();

        // Pause game time while browsing map
        if (typeof TimeMachine !== 'undefined' && !TimeMachine.isPaused) {
            this._wasTimePaused = false;
            TimeMachine.pause();
        } else {
            this._wasTimePaused = true;
        }

        console.log('PropertyMapPicker: Opened');
    },

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        this.removeEventListeners();
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }

        // Resume time if we paused it
        if (!this._wasTimePaused && typeof TimeMachine !== 'undefined') {
            TimeMachine.resume();
        }

        console.log('PropertyMapPicker: Closed');
    },

    // ═══════════════════════════════════════════════════════════════
    // DOM CREATION - Building the dark interface
    // ═══════════════════════════════════════════════════════════════

    createOverlay() {
        // Create main overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'property-map-picker-overlay';
        this.overlay.className = 'property-map-picker-overlay';
        this.overlay.innerHTML = `
            <div class="property-map-picker-modal">
                <div class="property-map-header">
                    <h2>🏘️ Select Location for Property</h2>
                    <div class="property-map-legend">
                        <span class="legend-item buildable">🟢 Buildable</span>
                        <span class="legend-item owned">🔵 Owned Property</span>
                        <span class="legend-item locked">🔴 No Road Access</span>
                        <span class="legend-item current">⭐ Current Location</span>
                    </div>
                    <button class="property-map-close-btn" data-action="close">✕</button>
                </div>
                <div class="property-map-content">
                    <div class="property-map-container" id="property-map-container">
                        <div class="property-map" id="property-map"></div>
                    </div>
                    <div class="property-map-info" id="property-map-info">
                        <div class="info-placeholder">
                            <p>👆 Click a location to see available properties</p>
                            <p class="info-hint">Green-bordered locations are buildable</p>
                        </div>
                    </div>
                </div>
                <div class="property-map-footer">
                    <div class="footer-gold">
                        <span class="gold-icon">💰</span>
                        <span class="gold-amount">${game?.player?.gold || 0}</span>
                        <span class="gold-label">gold available</span>
                    </div>
                    <div class="footer-actions">
                        <button class="secondary-btn" data-action="close">Cancel</button>
                        <button class="primary-btn" data-action="confirm" id="property-map-confirm-btn" disabled>
                            Select Location
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Get references
        this.mapContainer = document.getElementById('property-map-container');
        this.mapElement = document.getElementById('property-map');
        this.infoPanel = document.getElementById('property-map-info');

        // Create tooltip
        this.tooltipElement = MapRendererBase?.createTooltip('property-map-tooltip') || this._createFallbackTooltip();

        // Attach button handlers
        this.overlay.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'close') this.close();
                if (action === 'confirm') this.confirmSelection();
            });
        });
    },

    _createFallbackTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'property-map-tooltip';
        tooltip.className = 'property-map-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid #4fc3f7;
            font-size: 13px;
            max-width: 280px;
            z-index: 1100;
            pointer-events: none;
            display: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    },

    // ═══════════════════════════════════════════════════════════════
    // EVENT HANDLING - Listening to the darkness
    // ═══════════════════════════════════════════════════════════════

    setupEventListeners() {
        this._boundMouseMove = (e) => this.onMouseMove(e);
        this._boundMouseUp = (e) => this.onMouseUp(e);
        this._boundKeyDown = (e) => {
            if (e.key === 'Escape') this.close();
        };

        // Map dragging
        this.mapElement?.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('mouseup', this._boundMouseUp);

        // Zoom
        this.mapContainer?.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Escape to close
        document.addEventListener('keydown', this._boundKeyDown);
    },

    removeEventListeners() {
        if (this._boundMouseMove) document.removeEventListener('mousemove', this._boundMouseMove);
        if (this._boundMouseUp) document.removeEventListener('mouseup', this._boundMouseUp);
        if (this._boundKeyDown) document.removeEventListener('keydown', this._boundKeyDown);
    },

    onMouseDown(e) {
        if (e.target.classList.contains('property-location-marker')) return; // Don't drag when clicking markers
        e.preventDefault();
        if (MapRendererBase?.startDrag) {
            MapRendererBase.startDrag(this.mapState, e.clientX, e.clientY);
        } else {
            this.mapState.isDragging = true;
            this.mapState.dragStartX = e.clientX;
            this.mapState.dragStartY = e.clientY;
            this.mapState.lastOffsetX = this.mapState.offsetX;
            this.mapState.lastOffsetY = this.mapState.offsetY;
        }
        this.mapElement.style.cursor = 'grabbing';
    },

    onMouseMove(e) {
        if (this.mapState.isDragging) {
            if (MapRendererBase?.updateDrag) {
                MapRendererBase.updateDrag(this.mapState, e.clientX, e.clientY);
            } else {
                this.mapState.offsetX = this.mapState.lastOffsetX + (e.clientX - this.mapState.dragStartX);
                this.mapState.offsetY = this.mapState.lastOffsetY + (e.clientY - this.mapState.dragStartY);
            }
            this.updateTransform();
        }
    },

    onMouseUp(e) {
        if (this.mapState.isDragging) {
            this.mapState.isDragging = false;
            this.mapElement.style.cursor = 'grab';
        }
    },

    onWheel(e) {
        e.preventDefault();
        const rect = this.mapContainer.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;

        if (MapRendererBase?.applyZoom) {
            MapRendererBase.applyZoom(this.mapState, -e.deltaY, centerX, centerY);
        } else {
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.mapState.zoom = Math.max(this.mapState.minZoom, Math.min(this.mapState.maxZoom, this.mapState.zoom + delta));
        }
        this.updateTransform();
    },

    updateTransform() {
        if (MapRendererBase?.updateTransform) {
            MapRendererBase.updateTransform(this.mapElement, this.mapState);
        } else if (this.mapElement) {
            this.mapElement.style.transform = `translate(${this.mapState.offsetX}px, ${this.mapState.offsetY}px) scale(${this.mapState.zoom})`;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // RENDERING - Painting the dark world
    // ═══════════════════════════════════════════════════════════════

    render() {
        if (!this.mapElement) return;

        // Clear existing content
        this.mapElement.innerHTML = '';

        // Render paths first (background)
        this.renderPaths();

        // Render locations on top
        this.renderLocations();

        this.updateTransform();
    },

    renderPaths() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '800');
        svg.setAttribute('height', '600');
        svg.style.cssText = 'position: absolute; top: 0; left: 0; pointer-events: none;';

        if (typeof GameWorld === 'undefined') return;

        // Render all discovered paths
        const discoveredPaths = TravelSystem?.discoveredPaths || new Set();

        Object.entries(GameWorld.locations).forEach(([locId, location]) => {
            if (!location.connections) return;

            location.connections.forEach(connId => {
                const conn = GameWorld.locations[connId];
                if (!conn) return;

                // Check if path is discovered
                const pathKey1 = `${locId}->${connId}`;
                const pathKey2 = `${connId}->${locId}`;
                const isDiscovered = discoveredPaths.has(pathKey1) || discoveredPaths.has(pathKey2);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', location.x);
                line.setAttribute('y1', location.y);
                line.setAttribute('x2', conn.x);
                line.setAttribute('y2', conn.y);
                line.setAttribute('stroke', isDiscovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)');
                line.setAttribute('stroke-width', isDiscovered ? '2' : '1');
                line.setAttribute('stroke-dasharray', isDiscovered ? 'none' : '5,5');

                svg.appendChild(line);
            });
        });

        this.mapElement.appendChild(svg);
    },

    renderLocations() {
        if (typeof GameWorld === 'undefined') return;

        const currentLocationId = game?.currentLocation?.id;
        const ownedLocations = new Set((game?.player?.ownedProperties || []).map(p => p.location));
        const discoveredLocations = TravelSystem?.discoveredLocations || new Set();

        Object.entries(GameWorld.locations).forEach(([locId, location]) => {
            // Only show discovered locations
            if (!discoveredLocations.has(locId) && locId !== currentLocationId) return;

            const isBuildable = this.buildableLocations.includes(locId);
            const isOwned = ownedLocations.has(locId);
            const isCurrent = locId === currentLocationId;
            const isSelected = locId === this.selectedLocation;

            const style = this.locationStyles[location.type] || { color: '#888', icon: '📍', size: 24 };

            const marker = document.createElement('div');
            marker.className = 'property-location-marker';
            marker.dataset.locationId = locId;

            // Add state classes
            if (isBuildable) marker.classList.add('buildable');
            if (isOwned) marker.classList.add('owned');
            if (isCurrent) marker.classList.add('current');
            if (isSelected) marker.classList.add('selected');
            if (!isBuildable && !isOwned) marker.classList.add('locked');

            marker.style.cssText = `
                position: absolute;
                left: ${location.x - style.size/2}px;
                top: ${location.y - style.size/2}px;
                width: ${style.size}px;
                height: ${style.size}px;
                font-size: ${style.size * 0.7}px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: ${isBuildable ? 'pointer' : 'not-allowed'};
                transition: transform 0.2s, box-shadow 0.2s;
                border-radius: 50%;
                background: ${isBuildable ? 'rgba(0,100,0,0.3)' : 'rgba(50,50,50,0.5)'};
                border: 3px solid ${isBuildable ? '#4CAF50' : isOwned ? '#2196F3' : '#666'};
                ${isSelected ? 'box-shadow: 0 0 20px #FFD700, 0 0 40px #FFD700;' : ''}
                ${isCurrent ? 'box-shadow: 0 0 15px #FFD700;' : ''}
            `;

            marker.innerHTML = style.icon;
            marker.title = location.name;

            // Event handlers
            marker.addEventListener('mouseenter', (e) => this.showLocationTooltip(e, locId, location));
            marker.addEventListener('mouseleave', () => this.hideTooltip());
            marker.addEventListener('click', () => {
                if (isBuildable) this.selectLocation(locId);
            });

            // Add label as child of marker (tied together)
            const label = document.createElement('div');
            label.className = 'property-location-label';
            label.textContent = location.name;
            // position label ABOVE icon for consistency
            label.style.cssText = `
                position: absolute;
                left: 50%;
                bottom: ${style.size + 5}px;
                transform: translateX(-50%);
                font-size: 11px;
                color: ${isBuildable ? '#fff' : '#888'};
                text-shadow: 0 0 4px #000, 0 0 8px #000;
                pointer-events: none;
                white-space: nowrap;
                text-align: center;
            `;
            marker.appendChild(label);

            this.mapElement.appendChild(marker);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // TOOLTIPS & INFO - Whispering secrets
    // ═══════════════════════════════════════════════════════════════

    showLocationTooltip(e, locationId, location) {
        const isBuildable = this.buildableLocations.includes(locationId);
        const ownedHere = (game?.player?.ownedProperties || []).filter(p => p.location === locationId);
        const availableProperties = this.getPropertiesForLocation(locationId);

        let content = `<div class="tooltip-header">${this._escapeHTML(location.name)}</div>`;
        content += `<div class="tooltip-type">${this._escapeHTML(location.type.charAt(0).toUpperCase() + location.type.slice(1))}</div>`;

        if (isBuildable) {
            content += `<div class="tooltip-buildable">✅ Road Access Available</div>`;
            content += `<div class="tooltip-properties">${availableProperties.length} property type(s) available</div>`;
        } else {
            content += `<div class="tooltip-locked">❌ No Road Access</div>`;
            content += `<div class="tooltip-hint">Build a property in a connected location first</div>`;
        }

        if (ownedHere.length > 0) {
            content += `<div class="tooltip-owned">🏠 You own ${ownedHere.length} propert${ownedHere.length > 1 ? 'ies' : 'y'} here</div>`;
        }

        if (MapRendererBase?.showTooltip) {
            MapRendererBase.showTooltip(this.tooltipElement, content, e.clientX, e.clientY);
        } else if (this.tooltipElement) {
            this.tooltipElement.innerHTML = content;
            this.tooltipElement.style.display = 'block';
            this.tooltipElement.style.left = (e.clientX + 15) + 'px';
            this.tooltipElement.style.top = (e.clientY + 15) + 'px';
        }
    },

    hideTooltip() {
        if (MapRendererBase?.hideTooltip) {
            MapRendererBase.hideTooltip(this.tooltipElement);
        } else if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SELECTION - Choosing your domain
    // ═══════════════════════════════════════════════════════════════

    selectLocation(locationId) {
        this.selectedLocation = locationId;

        // Update visual selection
        this.mapElement.querySelectorAll('.property-location-marker').forEach(m => {
            m.classList.remove('selected');
            m.style.boxShadow = '';
        });

        const selectedMarker = this.mapElement.querySelector(`[data-location-id="${locationId}"]`);
        if (selectedMarker) {
            selectedMarker.classList.add('selected');
            selectedMarker.style.boxShadow = '0 0 20px #FFD700, 0 0 40px #FFD700';
        }

        // Update info panel
        this.updateInfoPanel(locationId);

        // Enable confirm button
        const confirmBtn = document.getElementById('property-map-confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Select ${GameWorld.locations[locationId]?.name || 'Location'}`;
        }

        console.log('PropertyMapPicker: Selected', locationId);
    },

    updateInfoPanel(locationId) {
        if (!this.infoPanel) return;

        const location = GameWorld.locations[locationId];
        if (!location) return;

        const availableProperties = this.getPropertiesForLocation(locationId);
        const ownedHere = (game?.player?.ownedProperties || []).filter(p => p.location === locationId);

        let html = `
            <div class="info-location">
                <h3>${this._escapeHTML(location.name)}</h3>
                <p class="info-type">${this._escapeHTML(location.type.charAt(0).toUpperCase() + location.type.slice(1))}</p>
            </div>
        `;

        if (ownedHere.length > 0) {
            html += `<div class="info-owned">
                <h4>🏠 Your Properties Here</h4>
                ${ownedHere.map(p => {
                    const pType = PropertyTypes?.get(p.type);
                    return `<div class="owned-property">${this._escapeHTML(pType?.icon || '🏠')} ${this._escapeHTML(pType?.name || p.type)}</div>`;
                }).join('')}
            </div>`;
        }

        html += `<div class="info-available">
            <h4>📋 Available to Build</h4>
            ${availableProperties.length > 0 ?
                availableProperties.map(p => `
                    <div class="available-property">
                        <span class="property-icon">${this._escapeHTML(p.icon)}</span>
                        <span class="property-name">${this._escapeHTML(p.name)}</span>
                        <span class="property-price">💰 ${this._escapeHTML(String(this.calculatePriceForLocation(p.id, locationId)))}</span>
                    </div>
                `).join('') :
                '<p class="no-properties">No properties available here</p>'
            }
        </div>`;

        this.infoPanel.innerHTML = html;
    },

    getPropertiesForLocation(locationId) {
        const location = GameWorld.locations[locationId];
        if (!location) return [];

        const propertyIds = PropertyTypes?.getLocationProperties(location.type) || [];
        const ownedHere = new Set((game?.player?.ownedProperties || [])
            .filter(p => p.location === locationId)
            .map(p => p.type));

        return propertyIds
            .filter(id => !ownedHere.has(id))
            .map(id => PropertyTypes?.get(id))
            .filter(Boolean);
    },

    calculatePriceForLocation(propertyId, locationId) {
        // Calculate price as if we were at that location
        const propertyType = PropertyTypes?.get(propertyId);
        if (!propertyType) return 0;

        const location = GameWorld.locations[locationId];
        if (!location) return propertyType.basePrice;

        let price = propertyType.basePrice;

        // Location modifier
        const locationModifiers = { village: 0.8, town: 1.0, city: 1.3, capital: 1.5, port: 1.2 };
        price *= locationModifiers[location.type] || 1.0;

        // Reputation modifier (use current reputation system)
        if (typeof CityReputationSystem !== 'undefined') {
            const reputation = CityReputationSystem.getReputation(locationId);
            const reputationModifier = 1 - (reputation * 0.002);
            price *= Math.max(0.7, reputationModifier);
        }

        // Merchant rank bonus
        if (typeof MerchantRankSystem !== 'undefined') {
            const bonus = MerchantRankSystem.getTradingBonus();
            price *= (1 - bonus);
        }

        return Math.round(price);
    },

    // ═══════════════════════════════════════════════════════════════
    // CONFIRMATION - Sealing the deal
    // ═══════════════════════════════════════════════════════════════

    confirmSelection() {
        if (!this.selectedLocation) return;

        const locationId = this.selectedLocation;
        console.log('PropertyMapPicker: Confirmed selection:', locationId);

        // Call the callback with selected location
        if (this.onLocationSelected) {
            this.onLocationSelected(locationId);
        }

        this.close();
    },

    // ═══════════════════════════════════════════════════════════════
    // HELPERS - Dark utilities
    // ═══════════════════════════════════════════════════════════════

    centerOnCurrentLocation() {
        const currentId = game?.currentLocation?.id;
        if (!currentId || !this.mapContainer) return;

        const location = GameWorld.locations[currentId];
        if (!location) return;

        const containerRect = this.mapContainer.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        this.mapState.offsetX = centerX - (location.x * this.mapState.zoom);
        this.mapState.offsetY = centerY - (location.y * this.mapState.zoom);

        this.updateTransform();
    }
};

window.PropertyMapPicker = PropertyMapPicker;

// register with Bootstrap
Bootstrap.register('PropertyMapPicker', () => PropertyMapPicker.init(), {
    dependencies: ['GameWorld', 'PanelManager'],
    priority: 72,
    severity: 'optional'
});
