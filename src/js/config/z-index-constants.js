// ═══════════════════════════════════════════════════════════════
// Z-INDEX CONSTANTS - JavaScript mirror of z-index-system.css
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════
//
// 🖤 MASTER Z-INDEX HIERARCHY (Gee's Order) 💀
//
// LAYER 0     : Background Image (terrain, map base)
// LAYER 1-5   : Weather Effects (rain, snow, fog - DIRECTLY above background)
// LAYER 10-40 : Game World UI (names, icons, locations, paths)
// LAYER 50-99 : All Panels (side panel, location panel, etc.)
// LAYER 100-199: Floating Panels (setup panel, quest tracker, draggables)
// LAYER 200-499: Tooltips, Dropdowns
// LAYER 500-999: Modal Backdrops
// LAYER 1000-1999: Modals, Overlays
// LAYER 2000+  : Menu, Settings
// LAYER 3000+  : Debooger (always on top)
//
// ═══════════════════════════════════════════════════════════════

const Z_INDEX = Object.freeze({
    // 🖤 LAYER 0: Background Image / Game Map Base
    BACKGROUND_IMAGE: 0,
    GAME_MAP: 0,

    // 🌧️ LAYER 1-5: Weather Effects (DIRECTLY above background, below EVERYTHING else)
    MENU_WEATHER: 1,
    WEATHER_OVERLAY: 2,
    DAY_NIGHT_OVERLAY: 3,

    // 📍 LAYER 10-40: Game World UI Elements (ABOVE weather)
    MAP_CONNECTIONS: 10,      // Path lines between locations
    MAP_LOCATIONS: 15,        // Location icons
    MAP_LABELS: 18,           // Location names
    PLAYER_MARKER: 20,        // "You are here" marker
    QUEST_WAYFINDER: 25,      // Quest objective glow
    TRAVELING_INDICATOR: 28,  // Traveling... animation
    QUEST_TARGET: 35,         // Quest target markers

    // 📦 LAYER 50-99: Core UI Panels (ABOVE game world)
    SIDE_PANEL: 50,
    LOCATION_PANEL: 55,
    MESSAGE_LOG: 60,
    TOP_BAR: 70,
    BOTTOM_BAR: 70,
    VISUAL_EFFECTS: 75,       // Visual effects (particles, fog)

    // 🎛️ LAYER 100-199: Floating/Draggable Panels
    QUEST_TRACKER: 100,
    PEOPLE_PANEL: 110,
    DRAGGABLE_PANEL: 120,
    SETUP_PANEL: 150,

    // 💬 LAYER 200-499: Tooltips & Dropdowns
    TOOLTIP: 200,             // Aliased as 800 in some places for legacy
    DROPDOWN: 250,
    POPOVER: 300,
    CONTEXT_MENU: 350,

    // 🎭 LAYER 500-999: Modal Backdrops & Panel Overlays
    GAME_PANELS: 500,         // Standard game panels
    MODAL_BACKDROP: 500,
    PANEL_OVERLAYS: 600,      // Dropdowns in panels, NPC schedule, etc.
    OVERLAY_CONTAINER: 600,
    SYSTEM_MODALS: 700,       // Save modals, settings, gatehouse, etc.
    TRADE_CART: 750,
    TOOLTIPS_LEGACY: 800,     // Legacy tooltip z-index (some files use this)
    NOTIFICATIONS: 850,       // Toast notifications, skill popups
    UI_ANIMATIONS: 850,       // Particles, impact effects
    LOADING_OVERLAY: 900,     // Loading animations
    CRITICAL_OVERLAYS: 900,   // Combat, achievements

    // 📋 LAYER 1000-1999: Modals
    MODAL: 1000,
    MODAL_CONTENT: 1001,
    PERK_MODAL: 1100,
    NPC_CHAT: 1200,
    QUEST_INFO_PANEL: 1500,

    // ⚠️ LAYER 2000+: Critical/System UI
    LOADING_SCREEN: 2000,
    ERROR_MODAL: 2500,

    // 🖤 LAYER 3000+: Main Menu & Settings
    MAIN_MENU: 3001,
    SETTINGS_PANEL: 3100,

    // 🎮 LAYER 9999: Random Event Panel (on top of game)
    RANDOM_EVENT: 9999,

    // 🦇 LAYER 99999+: Debooger (absolute top)
    SETTINGS_FORCE: 99999,    // Settings when forced above main menu
    DEBOOGER_CONSOLE: 999998,
    DEBOOGER_TOGGLE: 999999,

    // 🔧 Bootstrap loader (temporary during load)
    BOOTSTRAP_LOADER: 999,
});

// 🖤 Helper: Get z-index with optional offset 💀
Z_INDEX.get = function(key, offset = 0) {
    const value = this[key];
    if (typeof value !== 'number') {
        console.warn(`Z_INDEX: Unknown key "${key}", returning 0`);
        return offset;
    }
    return value + offset;
};

// 🖤 Helper: Apply z-index to element 💀
Z_INDEX.apply = function(element, key, offset = 0) {
    if (!element) return;
    element.style.zIndex = this.get(key, offset);
};

// Expose globally
window.Z_INDEX = Z_INDEX;

console.log('🖤 Z_INDEX constants loaded');
