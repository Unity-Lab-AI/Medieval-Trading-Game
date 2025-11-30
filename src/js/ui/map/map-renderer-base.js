// ═══════════════════════════════════════════════════════════════════════════
// 🗺️ MAP RENDERER BASE - The dark foundation all maps share
// ═══════════════════════════════════════════════════════════════════════════
// File Version: 0.81
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════════════════
// Task 3.1: Merge Map Renderers
// Both GameWorldRenderer and TravelPanelMap had ~1800 lines of duplicate code.
// This base class extracts the common functionality so they can focus on
// their unique behaviors instead of copy-pasting the same void rendering.
// ═══════════════════════════════════════════════════════════════════════════

const MapRendererBase = {
    // ═══════════════════════════════════════════════════════════════════════
    // 🎨 SHARED LOCATION STYLES - The look of the world
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Location type styles (icons, colors, sizes)
     * Override size in child renderers if needed
     */
    LOCATION_STYLES: {
        capital:  { color: '#FFD700', icon: '👑', baseSize: 48 },
        city:     { color: '#FF6B6B', icon: '🏰', baseSize: 40 },
        town:     { color: '#4ECDC4', icon: '🏘️', baseSize: 34 },
        village:  { color: '#95E77E', icon: '🏠', baseSize: 28 },
        mine:     { color: '#8B4513', icon: '⛏️', baseSize: 30 },
        forest:   { color: '#228B22', icon: '🌲', baseSize: 32 },
        farm:     { color: '#F4A460', icon: '🌾', baseSize: 30 },
        dungeon:  { color: '#4B0082', icon: '💀', baseSize: 32 },
        cave:     { color: '#696969', icon: '🕳️', baseSize: 28 },
        inn:      { color: '#DAA520', icon: '🍺', baseSize: 26 },
        ruins:    { color: '#708090', icon: '🏛️', baseSize: 30 },
        port:     { color: '#1E90FF', icon: '⚓', baseSize: 34 },
        outpost:  { color: '#CD853F', icon: '🛡️', baseSize: 28 }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 🗡️ MAP STATE DEFAULTS - How the map behaves
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🦇 Create default map state object
     * @param {Object} overrides - Values to override defaults
     * @returns {Object} Map state object
     */
    createDefaultMapState(overrides = {}) {
        return {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            minZoom: 0.3,
            maxZoom: 3,
            defaultZoom: 1,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastOffsetX: 0,
            lastOffsetY: 0,
            ...overrides
        };
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 💀 TOOLTIP MANAGEMENT - Hover info shared between renderers
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Create or get a tooltip element
     * @param {string} id - Tooltip element ID
     * @returns {HTMLElement} The tooltip element
     */
    createTooltip(id = 'map-tooltip') {
        let tooltip = document.getElementById(id);
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = id;
            tooltip.className = 'map-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 10px 15px;
            border-radius: 8px;
            border: 2px solid #4fc3f7;
            font-size: 14px;
            max-width: 300px;
            z-index: 800; /* Z-INDEX STANDARD: Tooltips (map) */
            pointer-events: none;
            display: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        return tooltip;
    },

    /**
     * 🦇 Show tooltip at position
     * @param {HTMLElement} tooltip - Tooltip element
     * @param {string} content - HTML content
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     */
    showTooltip(tooltip, content, x, y) {
        if (!tooltip) return;

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';

        // 🖤 Position tooltip near cursor but avoid edges
        const rect = tooltip.getBoundingClientRect();
        const padding = 15;

        let left = x + padding;
        let top = y + padding;

        // 🗡️ Keep within viewport
        if (left + rect.width > window.innerWidth) {
            left = x - rect.width - padding;
        }
        if (top + rect.height > window.innerHeight) {
            top = y - rect.height - padding;
        }

        tooltip.style.left = `${Math.max(padding, left)}px`;
        tooltip.style.top = `${Math.max(padding, top)}px`;
    },

    /**
     * ⚰️ Hide tooltip
     * @param {HTMLElement} tooltip - Tooltip element
     */
    hideTooltip(tooltip) {
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 🌙 TRANSFORM & ZOOM - Shared pan/zoom logic
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Update map transform based on state
     * @param {HTMLElement} mapElement - The map element to transform
     * @param {Object} mapState - Current map state
     */
    updateTransform(mapElement, mapState) {
        if (!mapElement) return;

        mapElement.style.transform = `
            translate(${mapState.offsetX}px, ${mapState.offsetY}px)
            scale(${mapState.zoom})
        `;
    },

    /**
     * 🦇 Handle zoom with constraints
     * @param {Object} mapState - Map state to modify
     * @param {number} delta - Zoom delta (positive = zoom in)
     * @param {number} [centerX] - X position to zoom toward
     * @param {number} [centerY] - Y position to zoom toward
     * @returns {Object} Updated map state
     */
    applyZoom(mapState, delta, centerX = null, centerY = null) {
        const oldZoom = mapState.zoom;
        const zoomSpeed = 0.1;
        let newZoom = oldZoom + (delta > 0 ? zoomSpeed : -zoomSpeed);

        // 🗡️ Clamp zoom to bounds
        newZoom = Math.max(mapState.minZoom, Math.min(mapState.maxZoom, newZoom));

        if (newZoom !== oldZoom && centerX !== null && centerY !== null) {
            // ⚰️ Zoom toward cursor position
            const zoomRatio = newZoom / oldZoom;
            mapState.offsetX = centerX - (centerX - mapState.offsetX) * zoomRatio;
            mapState.offsetY = centerY - (centerY - mapState.offsetY) * zoomRatio;
        }

        mapState.zoom = newZoom;
        return mapState;
    },

    /**
     * 🌙 Start drag operation
     * @param {Object} mapState - Map state to modify
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     */
    startDrag(mapState, x, y) {
        mapState.isDragging = true;
        mapState.dragStartX = x;
        mapState.dragStartY = y;
        mapState.lastOffsetX = mapState.offsetX;
        mapState.lastOffsetY = mapState.offsetY;
    },

    /**
     * 💀 Update drag position
     * @param {Object} mapState - Map state to modify
     * @param {number} x - Current X position
     * @param {number} y - Current Y position
     * @returns {boolean} Whether state changed
     */
    updateDrag(mapState, x, y) {
        if (!mapState.isDragging) return false;

        mapState.offsetX = mapState.lastOffsetX + (x - mapState.dragStartX);
        mapState.offsetY = mapState.lastOffsetY + (y - mapState.dragStartY);
        return true;
    },

    /**
     * 🔮 End drag operation
     * @param {Object} mapState - Map state to modify
     */
    endDrag(mapState) {
        mapState.isDragging = false;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 🔮 LOCATION ELEMENT CREATION - Building map markers
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Get style for a location type
     * @param {string} type - Location type
     * @param {number} [sizeMultiplier=1] - Size multiplier
     * @returns {Object} Style object with color, icon, size
     */
    getLocationStyle(type, sizeMultiplier = 1) {
        const style = this.LOCATION_STYLES[type] || this.LOCATION_STYLES.village;
        return {
            ...style,
            size: Math.round(style.baseSize * sizeMultiplier)
        };
    },

    /**
     * 🦇 Create base location element structure
     * @param {Object} location - Location data
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} The location marker element
     */
    createLocationMarker(location, options = {}) {
        const {
            sizeMultiplier = 1,
            opacity = 1,
            clickable = true,
            showLabel = true,
            labelOffset = 0
        } = options;

        const style = this.getLocationStyle(location.type, sizeMultiplier);
        const pos = location.mapPosition || { x: 400, y: 300 };

        // 🗡️ Create marker container
        const marker = document.createElement('div');
        marker.className = 'map-location';
        marker.dataset.locationId = location.id;
        marker.style.cssText = `
            position: absolute;
            left: ${pos.x}px;
            top: ${pos.y}px;
            transform: translate(-50%, -50%);
            cursor: ${clickable ? 'pointer' : 'default'};
            opacity: ${opacity};
            z-index: 10;
            text-align: center;
            transition: transform 0.2s ease, opacity 0.2s ease;
        `;

        // ⚰️ Create icon
        const icon = document.createElement('div');
        icon.className = 'location-icon';
        icon.textContent = style.icon;
        icon.style.cssText = `
            font-size: ${style.size}px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            line-height: 1;
        `;
        marker.appendChild(icon);

        // 🌙 Create label if enabled
        if (showLabel) {
            const label = document.createElement('div');
            label.className = 'location-label';
            label.textContent = location.name;
            label.style.cssText = `
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(${labelOffset}px);
                white-space: nowrap;
                font-size: 11px;
                font-weight: bold;
                color: ${style.color};
                text-shadow:
                    0 0 3px #000,
                    0 0 6px #000,
                    1px 1px 2px #000;
                margin-top: 4px;
                pointer-events: none;
            `;
            marker.appendChild(label);
        }

        return marker;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 💀 CONNECTION LINES - Drawing paths between locations
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Create an SVG line element for connections
     * @param {Object} from - Start position {x, y}
     * @param {Object} to - End position {x, y}
     * @param {Object} options - Line options
     * @returns {SVGElement} SVG line element
     */
    createConnectionLine(from, to, options = {}) {
        const {
            color = 'rgba(79, 195, 247, 0.3)',
            width = 2,
            dashed = false
        } = options;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', width);
        if (dashed) {
            line.setAttribute('stroke-dasharray', '5,5');
        }

        return line;
    },

    /**
     * 🦇 Create SVG container for connection lines
     * @param {number} width - SVG width
     * @param {number} height - SVG height
     * @returns {SVGElement} SVG container
     */
    createConnectionSVG(width = 800, height = 600) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 1;
        `;
        return svg;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 🌙 UTILITY FUNCTIONS - Shared helpers
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🖤 Calculate distance between two points
     * @param {Object} a - Point A {x, y}
     * @param {Object} b - Point B {x, y}
     * @returns {number} Distance
     */
    distance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 🦇 Check if two labels would overlap
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle
     * @returns {boolean} True if overlapping
     */
    labelsOverlap(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect2.x + rect2.width < rect1.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.y + rect2.height < rect1.y
        );
    },

    /**
     * ⚰️ Calculate label offsets to prevent overlap
     * @param {Object} locations - Location objects with mapPosition
     * @returns {Object} Map of locationId to offset value
     */
    calculateLabelOffsets(locations) {
        const offsets = {};
        const labelHeight = 14;
        const processed = [];

        Object.entries(locations).forEach(([id, loc]) => {
            if (!loc.mapPosition) {
                offsets[id] = 0;
                return;
            }

            let offset = 0;
            const myRect = {
                x: loc.mapPosition.x - 50,
                y: loc.mapPosition.y + 30,
                width: 100,
                height: labelHeight
            };

            // 🌙 Check against previously processed labels
            for (const other of processed) {
                const otherRect = {
                    x: other.pos.x - 50,
                    y: other.pos.y + 30 + other.offset,
                    width: 100,
                    height: labelHeight
                };

                if (this.labelsOverlap(myRect, otherRect)) {
                    offset = other.offset + labelHeight + 2;
                    myRect.y += labelHeight + 2;
                }
            }

            offsets[id] = offset;
            processed.push({ id, pos: loc.mapPosition, offset });
        });

        return offsets;
    },

    /**
     * 💀 Format travel info for tooltip
     * @param {Object} location - Destination location
     * @param {Object} currentLocation - Current location
     * @returns {string} Formatted tooltip HTML
     */
    formatTravelTooltip(location, currentLocation) {
        const style = this.getLocationStyle(location.type);
        let html = `
            <div style="margin-bottom: 8px;">
                <span style="font-size: 20px;">${style.icon}</span>
                <strong style="color: ${style.color}; margin-left: 5px;">${location.name}</strong>
            </div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">
                ${location.description || 'A location in the world'}
            </div>
        `;

        // 🔮 Add travel info if we have current location
        if (currentLocation && typeof GameWorld !== 'undefined') {
            const distance = GameWorld.calculateTravelTime?.(currentLocation.id, location.id);
            const cost = GameWorld.calculateTravelCost?.(currentLocation.id, location.id);

            if (distance) {
                html += `<div style="color: #81c784; font-size: 12px;">⏱️ ${distance} hours</div>`;
            }
            if (cost) {
                html += `<div style="color: #ffd700; font-size: 12px;">💰 ${cost} gold</div>`;
            }
        }

        return html;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY - Let all maps share the darkness
// ═══════════════════════════════════════════════════════════════════════════

window.MapRendererBase = MapRendererBase;

console.log('🖤 MapRendererBase loaded - shared map rendering foundation ready');
