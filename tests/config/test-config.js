/**
 * 🖤 PLAYWRIGHT TEST CONFIGURATION
 * Toggle which test suites run with simple true/false flags
 *
 * Set any to false to skip those tests
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════
  // 🎮 CORE GAME TESTS
  // ═══════════════════════════════════════════════════════════════

  // Test the loading screen and initial game boot
  loadingTests: false,

  // Test New Game flow (menu -> setup -> character creation)
  newGameTests: false,

  // Test main menu buttons and navigation
  mainMenuTests: false,

  // ═══════════════════════════════════════════════════════════════
  // 🐛 DEBUG & CHEAT COMMAND TESTS
  // ═══════════════════════════════════════════════════════════════

  // Test all debug/cheat commands via the in-game debugger
  debugCommandTests: false,

  // Test gold manipulation commands (gold, addgold)
  goldCommands: false,

  // Test item commands (give, clearinventory)
  itemCommands: false,

  // Test player stat commands (heal, setstat, maxstats)
  statCommands: false,

  // Test time/world commands (time, weather, teleport)
  worldCommands: false,

  // Test quest commands (quest, completequest)
  questCommands: false,

  // Test encounter commands (encounter, trader)
  encounterCommands: false,

  // Test utility commands (help, clear, gamestate)
  utilityCommands: false,

  // Test achievement commands
  achievementCommands: false,

  // ═══════════════════════════════════════════════════════════════
  // 📋 PANEL TESTS
  // ═══════════════════════════════════════════════════════════════

  // Test all game panels open/close correctly
  panelTests: false,

  // Individual panel toggles - 🖤 All passing as of 2025-11-27
  panels: {
    inventory: false,
    character: false,
    market: false,
    travel: false,
    map: false,
    quests: false,
    achievements: false,
    properties: false,
    financial: false,
    people: false,
    settings: false,
    messageLog: false,
    location: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // ⌨️ KEYBINDING TESTS
  // ═══════════════════════════════════════════════════════════════

  // Test keyboard shortcuts work
  keybindingTests: false,

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FEATURE TESTS
  // ═══════════════════════════════════════════════════════════════

  // Test trading system (buy/sell)
  tradingTests: false,

  // Test travel system (moving between locations)
  travelTests: false,

  // Test quest system (accept, progress, complete)
  questTests: false,

  // Test achievement system
  achievementTests: false,

  // Test save/load functionality
  saveLoadTests: false,

  // Test character creation (attributes, perks)
  characterCreationTests: false,

  // Test time system (pause, speed controls)
  timeSystemTests: false,

  // ═══════════════════════════════════════════════════════════════
  // 🔧 TEST SETTINGS
  // ═══════════════════════════════════════════════════════════════

  // How long to wait for game to load (ms)
  loadTimeout: 30000,  // Increased for CI environments

  // How long to wait between actions (ms)
  actionDelay: 200,  // Reduced for faster tests

  // Take screenshots on test failure
  screenshotOnFailure: true,

  // Verbose console logging during tests
  verboseLogging: true,

  // Skip tests that require starting a full game
  skipFullGameTests: false,
};
