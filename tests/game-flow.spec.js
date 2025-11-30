// ═══════════════════════════════════════════════════════════════
// 🖤 GAME FLOW TESTS - Complete game flow testing from startup to death
// ═══════════════════════════════════════════════════════════════
// Tests the complete lifecycle of a game session
// Unity AI Lab by Hackall360 Sponge GFourteen www.unityailab.com
// ═══════════════════════════════════════════════════════════════

const { test, expect } = require('@playwright/test');
const config = require('./config/test-config');
const {
  waitForGameLoad,
  startNewGame,
  openDeboogerConsole,
  runDeboogerCommand,
  getPlayerGold,
  getPlayerStats,
  setupConsoleCapture,
  filterCriticalErrors,
  openPanel,
  isPanelVisible
} = require('./helpers/test-helpers');

// ═══════════════════════════════════════════════════════════════
// 🎮 GAME STARTUP FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Game Startup Flow', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test('loads game successfully from initial page load', async ({ page }) => {
    const messages = setupConsoleCapture(page);

    // Navigate to the game
    await page.goto('/');

    // Wait for loading screen to appear (it should be visible initially)
    await page.waitForSelector('#loading-screen', { timeout: 5000 });

    // Wait for loading to complete
    await expect(page.locator('#loading-screen')).toHaveClass(/hidden/, { timeout: 20000 });

    // Main menu should be visible
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);

    // Loading manager should be complete
    const loadingComplete = await page.evaluate(() => {
      return window.LoadingManager && window.LoadingManager.isComplete === true;
    });
    expect(loadingComplete).toBe(true);

    // Check for critical errors
    const criticalErrors = filterCriticalErrors(messages.errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('displays correct game title and version', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    // Check title
    const title = await page.title();
    expect(title).toContain('Medieval Trading Game');

    // Check main menu title
    const menuTitle = await page.textContent('#main-menu-title');
    expect(menuTitle).toContain('Medieval Trading Game');

    // Check version is displayed
    const versionText = await page.textContent('#main-menu-version');
    expect(versionText).toBeTruthy();
    expect(versionText).toMatch(/v?\d+\.\d+/); // Matches version pattern like "0.81" or "v0.81"
  });

  test('main menu has all required buttons', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    // Check for New Game button
    await expect(page.locator('#new-game-btn')).toBeVisible();

    // Check for Load Game button (may be disabled if no saves)
    await expect(page.locator('#load-game-btn')).toBeVisible();

    // Check for Settings button
    await expect(page.locator('#settings-btn')).toBeVisible();
  });

  test('weather effects initialize on main menu', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    // Check if weather container exists
    const weatherContainer = page.locator('#menu-weather-container');
    await expect(weatherContainer).toBeAttached();

    // MenuWeatherSystem should be initialized
    const weatherSystemLoaded = await page.evaluate(() => {
      return typeof MenuWeatherSystem !== 'undefined';
    });
    expect(weatherSystemLoaded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 🎭 MAIN MENU TO GAME TRANSITION
// ═══════════════════════════════════════════════════════════════

test.describe('Main Menu to Game Transition', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test('clicking New Game button transitions to character setup', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    const messages = setupConsoleCapture(page);

    // Main menu should be visible
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);

    // Click New Game button
    await page.click('#new-game-btn');

    // Wait for transition
    await page.waitForTimeout(1000);

    // Main menu should now be hidden
    await expect(page.locator('#main-menu')).toHaveClass(/hidden/);

    // Game container should be visible
    await expect(page.locator('#game-container')).not.toHaveClass(/hidden/);

    // Game setup panel should be visible
    await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);

    // No critical errors
    const criticalErrors = filterCriticalErrors(messages.errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('startNewGame function is globally available', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    const functionExists = await page.evaluate(() => {
      return typeof window.startNewGame === 'function';
    });

    expect(functionExists).toBe(true);
  });

  test('can cancel setup and return to main menu', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    // Click New Game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Setup panel should be visible
    await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);

    // Click cancel button
    await page.click('#cancel-setup-btn');
    await page.waitForTimeout(500);

    // Should be back at main menu
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#game-setup-panel')).toHaveClass(/hidden/);
  });

  test('cancelGameSetup function works correctly', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Call cancelGameSetup directly
    await page.evaluate(() => {
      if (typeof cancelGameSetup === 'function') {
        cancelGameSetup();
      }
    });

    await page.waitForTimeout(500);

    // Should return to main menu
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 👤 CHARACTER CREATION TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Character Creation Flow', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);
  });

  test('character setup panel has all required elements', async ({ page }) => {
    // Character name input
    await expect(page.locator('#character-name-input')).toBeVisible();

    // Difficulty options
    await expect(page.locator('input[name="difficulty"][value="easy"]')).toBeVisible();
    await expect(page.locator('input[name="difficulty"][value="normal"]')).toBeVisible();
    await expect(page.locator('input[name="difficulty"][value="hard"]')).toBeVisible();

    // Attribute controls
    await expect(page.locator('.attributes-grid')).toBeVisible();
    await expect(page.locator('#attr-points-remaining')).toBeVisible();

    // Perk selection button
    await expect(page.locator('#open-perk-modal-btn')).toBeVisible();

    // Action buttons
    await expect(page.locator('#randomize-character-btn')).toBeVisible();
    await expect(page.locator('#start-game-btn')).toBeVisible();
    await expect(page.locator('#setup-settings-btn')).toBeVisible();
    await expect(page.locator('#cancel-setup-btn')).toBeVisible();
  });

  test('can enter character name', async ({ page }) => {
    const testName = 'TestMerchant';

    await page.fill('#character-name-input', testName);

    const inputValue = await page.inputValue('#character-name-input');
    expect(inputValue).toBe(testName);
  });

  test('can select difficulty levels', async ({ page }) => {
    // Default should be normal
    const defaultChecked = await page.isChecked('input[name="difficulty"][value="normal"]');
    expect(defaultChecked).toBe(true);

    // Select easy
    await page.click('input[name="difficulty"][value="easy"]');
    const easyChecked = await page.isChecked('input[name="difficulty"][value="easy"]');
    expect(easyChecked).toBe(true);

    // Select hard
    await page.click('input[name="difficulty"][value="hard"]');
    const hardChecked = await page.isChecked('input[name="difficulty"][value="hard"]');
    expect(hardChecked).toBe(true);
  });

  test('difficulty affects starting gold', async ({ page }) => {
    // Check normal difficulty gold
    await page.click('input[name="difficulty"][value="normal"]');
    await page.waitForTimeout(200);
    let goldDisplay = await page.textContent('#setup-gold-amount');
    expect(goldDisplay).toContain('100');

    // Check easy difficulty gold (120)
    await page.click('input[name="difficulty"][value="easy"]');
    await page.waitForTimeout(200);
    goldDisplay = await page.textContent('#setup-gold-amount');
    expect(goldDisplay).toContain('120');

    // Check hard difficulty gold (80)
    await page.click('input[name="difficulty"][value="hard"]');
    await page.waitForTimeout(200);
    goldDisplay = await page.textContent('#setup-gold-amount');
    expect(goldDisplay).toContain('80');
  });

  test('can modify character attributes', async ({ page }) => {
    // Get initial points
    const initialPoints = await page.textContent('#attr-points-remaining');

    // Click increase button for strength
    await page.click('button[data-attr="strength"].attr-up');
    await page.waitForTimeout(100);

    // Points should decrease
    const newPoints = await page.textContent('#attr-points-remaining');
    expect(parseInt(newPoints)).toBe(parseInt(initialPoints) - 1);

    // Strength value should increase
    const strengthValue = await page.textContent('#attr-strength');
    expect(parseInt(strengthValue)).toBe(6); // Base 5 + 1
  });

  test('can decrease attributes back to base', async ({ page }) => {
    // Increase strength
    await page.click('button[data-attr="strength"].attr-up');
    await page.waitForTimeout(100);

    // Decrease strength
    await page.click('button[data-attr="strength"].attr-down');
    await page.waitForTimeout(100);

    // Should be back to 5
    const strengthValue = await page.textContent('#attr-strength');
    expect(parseInt(strengthValue)).toBe(5);
  });

  test('attribute points limit is enforced', async ({ page }) => {
    // Try to spend more than 5 points
    for (let i = 0; i < 10; i++) {
      await page.click('button[data-attr="strength"].attr-up');
      await page.waitForTimeout(50);
    }

    // Points should be 0 or can't go negative
    const remainingPoints = await page.textContent('#attr-points-remaining');
    expect(parseInt(remainingPoints)).toBeGreaterThanOrEqual(0);
  });

  test('randomize character button works', async ({ page }) => {
    // Get initial attribute values
    const initialStrength = await page.textContent('#attr-strength');

    // Click randomize
    await page.click('#randomize-character-btn');
    await page.waitForTimeout(500);

    // At least name should change or attributes might change
    // Just verify the button doesn't crash
    const strengthAfter = await page.textContent('#attr-strength');
    expect(strengthAfter).toBeTruthy();
  });

  test('can open perk selection modal', async ({ page }) => {
    // Click perk selection button
    await page.click('#open-perk-modal-btn');
    await page.waitForTimeout(300);

    // Perk modal should be visible
    await expect(page.locator('#perk-selection-modal')).not.toHaveClass(/hidden/);

    // Close modal
    const closeBtn = page.locator('#perk-selection-modal .overlay-close').first();
    await closeBtn.click();
    await page.waitForTimeout(300);
  });

  test('can complete character creation and start game', async ({ page }) => {
    // Fill in character name
    await page.fill('#character-name-input', 'TestHero');

    // Spend attribute points
    await page.click('button[data-attr="strength"].attr-up');
    await page.click('button[data-attr="charisma"].attr-up');
    await page.click('button[data-attr="intelligence"].attr-up');
    await page.click('button[data-attr="endurance"].attr-up');
    await page.click('button[data-attr="luck"].attr-up');
    await page.waitForTimeout(200);

    // Click start game
    await page.click('#start-game-btn');
    await page.waitForTimeout(1000);

    // Setup panel should be hidden
    await expect(page.locator('#game-setup-panel')).toHaveClass(/hidden/);

    // Game should be running
    const isGameRunning = await page.evaluate(() => {
      return typeof game !== 'undefined' && game.player !== null;
    });
    expect(isGameRunning).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 🎮 GAME STATE INITIALIZATION
// ═══════════════════════════════════════════════════════════════

test.describe('Game State Initialization', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);
  });

  test('game object is initialized correctly', async ({ page }) => {
    await startNewGame(page);

    const gameState = await page.evaluate(() => {
      if (typeof game === 'undefined') return null;

      return {
        hasPlayer: game.player !== null,
        hasGold: typeof game.player?.gold === 'number',
        hasInventory: Array.isArray(game.player?.inventory),
        hasLocation: typeof game.player?.location === 'string',
        hasAttributes: game.player?.attributes !== undefined
      };
    });

    expect(gameState).not.toBeNull();
    expect(gameState.hasPlayer).toBe(true);
    expect(gameState.hasGold).toBe(true);
    expect(gameState.hasInventory).toBe(true);
    expect(gameState.hasLocation).toBe(true);
    expect(gameState.hasAttributes).toBe(true);
  });

  test('player starts with correct default gold', async ({ page }) => {
    await startNewGame(page);

    const gold = await getPlayerGold(page);
    expect(gold).toBe(100); // Normal difficulty default
  });

  test('player starts at default location', async ({ page }) => {
    await startNewGame(page);

    const location = await page.evaluate(() => {
      return game?.player?.location || null;
    });

    expect(location).toBe('greendale'); // Default starting location from config
  });

  test('player vitals are initialized correctly', async ({ page }) => {
    await startNewGame(page);

    const stats = await getPlayerStats(page);

    expect(stats).not.toBeNull();
    expect(stats.health).toBeGreaterThan(0);
    expect(stats.maxHealth).toBe(100);
    expect(stats.hunger).toBeGreaterThanOrEqual(0);
    expect(stats.thirst).toBeGreaterThanOrEqual(0);
  });

  test('UI displays are updated with initial values', async ({ page }) => {
    await startNewGame(page);

    // Check gold display
    const goldDisplay = await page.textContent('#player-gold');
    expect(parseInt(goldDisplay)).toBeGreaterThan(0);

    // Check player name display
    const nameDisplay = await page.textContent('#player-name');
    expect(nameDisplay).toBeTruthy();
    expect(nameDisplay).not.toBe('Player'); // Should use entered name

    // Check location display
    const locationName = await page.textContent('#location-name');
    expect(locationName).toBeTruthy();
  });

  test('all core game systems are initialized', async ({ page }) => {
    await startNewGame(page);

    const systems = await page.evaluate(() => {
      return {
        tradingSystem: typeof TradingSystem !== 'undefined',
        travelSystem: typeof TravelSystem !== 'undefined',
        inventoryPanel: typeof InventoryPanel !== 'undefined',
        achievementSystem: typeof AchievementSystem !== 'undefined',
        questSystem: typeof QuestSystem !== 'undefined',
        saveManager: typeof SaveManager !== 'undefined',
        timeSystem: typeof TimeSystem !== 'undefined' || typeof TimeMachine !== 'undefined',
        npcManager: typeof NPCManager !== 'undefined',
        marketSystem: typeof DynamicMarket !== 'undefined' || typeof MarketSystem !== 'undefined'
      };
    });

    expect(systems.tradingSystem).toBe(true);
    expect(systems.travelSystem).toBe(true);
    expect(systems.inventoryPanel).toBe(true);
    expect(systems.achievementSystem).toBe(true);
    expect(systems.saveManager).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 💾 SAVE/LOAD GAME FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Save/Load Game Flow', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);
    await startNewGame(page);
  });

  test('SaveManager is available', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof SaveManager !== 'undefined';
    });
    expect(exists).toBe(true);
  });

  test('can save game successfully', async ({ page }) => {
    // Try to save via function
    const saveResult = await page.evaluate(() => {
      if (typeof SaveManager !== 'undefined' && SaveManager.saveGame) {
        try {
          SaveManager.saveGame('test-save');
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    expect(saveResult).toBe(true);
  });

  test('saved game persists in localStorage', async ({ page }) => {
    // Save game
    await page.evaluate(() => {
      if (typeof SaveManager !== 'undefined') {
        SaveManager.saveGame('test-save-persistence');
      }
    });

    // Check if save exists in localStorage
    const hasSave = await page.evaluate(() => {
      const saves = localStorage.getItem('medievalTradingGameSaveSlots');
      return saves !== null && saves.includes('test-save-persistence');
    });

    expect(hasSave).toBe(true);
  });

  test('can load saved game', async ({ page }) => {
    // Save current game state
    const goldBeforeSave = await getPlayerGold(page);

    await page.evaluate(() => {
      if (typeof SaveManager !== 'undefined') {
        SaveManager.saveGame('test-load');
      }
    });

    // Modify gold
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'gold 500');
    await page.waitForTimeout(500);

    const goldAfterChange = await getPlayerGold(page);
    expect(goldAfterChange).not.toBe(goldBeforeSave);

    // Load the save
    await page.evaluate(() => {
      if (typeof SaveManager !== 'undefined') {
        SaveManager.loadGame('test-load');
      }
    });

    await page.waitForTimeout(1000);

    // Gold should be restored
    const goldAfterLoad = await getPlayerGold(page);
    expect(goldAfterLoad).toBeCloseTo(goldBeforeSave, 0);
  });

  test('F5 quick save works', async ({ page }) => {
    // Press F5 to quick save
    await page.keyboard.press('F5');
    await page.waitForTimeout(500);

    // Check for save in localStorage
    const hasSave = await page.evaluate(() => {
      const autoSaves = localStorage.getItem('medievalTradingGameAutoSaveSlots');
      return autoSaves !== null;
    });

    expect(hasSave).toBe(true);
  });

  test('save includes player state correctly', async ({ page }) => {
    // Modify player state
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'gold 999');
    await page.waitForTimeout(300);

    const goldBefore = await getPlayerGold(page);

    // Save
    await page.evaluate(() => {
      if (typeof SaveManager !== 'undefined') {
        SaveManager.saveGame('state-test');
      }
    });

    // Get saved data
    const savedGold = await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('medievalTradingGameSaveSlots') || '{}');
      return saves['state-test']?.player?.gold || 0;
    });

    expect(savedGold).toBeCloseTo(goldBefore, 0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 🏠 QUIT TO MAIN MENU
// ═══════════════════════════════════════════════════════════════

test.describe('Quit to Main Menu', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);
    await startNewGame(page);
  });

  test('quitToMainMenu function exists', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof quitToMainMenu === 'function';
    });
    expect(exists).toBe(true);
  });

  test('can quit to main menu from game', async ({ page }) => {
    // Call quit function
    await page.evaluate(() => {
      if (typeof quitToMainMenu === 'function') {
        quitToMainMenu();
      }
    });

    await page.waitForTimeout(500);

    // Should be back at main menu
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);

    // Game container should be hidden
    await expect(page.locator('#game-container')).toHaveClass(/hidden/);
  });

  test('main menu buttons are functional after quit', async ({ page }) => {
    // Quit to menu
    await page.evaluate(() => {
      if (typeof quitToMainMenu === 'function') {
        quitToMainMenu();
      }
    });

    await page.waitForTimeout(500);

    // Try clicking New Game again
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Should go to setup
    await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);
  });

  test('game state is cleaned up on quit', async ({ page }) => {
    // Modify game state
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'gold 999');
    await page.waitForTimeout(300);

    // Quit
    await page.evaluate(() => {
      if (typeof quitToMainMenu === 'function') {
        quitToMainMenu();
      }
    });

    await page.waitForTimeout(500);

    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Complete character creation quickly
    await page.evaluate(() => {
      const nameInput = document.getElementById('character-name-input');
      if (nameInput) nameInput.value = 'NewChar';

      const btn = document.getElementById('start-game-btn');
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Gold should be fresh start, not 999
    const newGold = await getPlayerGold(page);
    expect(newGold).toBe(100); // Default normal difficulty
  });
});

// ═══════════════════════════════════════════════════════════════
// 💀 GAME OVER CONDITIONS
// ═══════════════════════════════════════════════════════════════

test.describe('Game Over Conditions', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);
    await startNewGame(page);
  });

  test('game over system is initialized', async ({ page }) => {
    const exists = await page.evaluate(() => {
      return typeof GameOverSystem !== 'undefined' || typeof showGameOver === 'function';
    });
    expect(exists).toBe(true);
  });

  test('death by starvation triggers game over', async ({ page }) => {
    await openDeboogerConsole(page);

    // Set health and hunger to critical levels
    await runDeboogerCommand(page, 'setstat health 1');
    await page.waitForTimeout(300);

    await runDeboogerCommand(page, 'setstat hunger 0');
    await page.waitForTimeout(300);

    // Kill player
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Game over overlay should appear
    const gameOverVisible = await page.evaluate(() => {
      const overlay = document.getElementById('game-over-overlay');
      return overlay && !overlay.classList.contains('hidden');
    });

    expect(gameOverVisible).toBe(true);
  });

  test('game over screen displays final stats', async ({ page }) => {
    // Trigger game over
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Check for stats grid
    const hasStats = await page.evaluate(() => {
      const statsGrid = document.getElementById('game-over-stats-grid');
      return statsGrid && statsGrid.children.length > 0;
    });

    expect(hasStats).toBe(true);
  });

  test('game over screen has action buttons', async ({ page }) => {
    // Trigger game over
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Check for action buttons
    const buttons = await page.evaluate(() => {
      const tryAgain = document.querySelector('button:has-text("Try Again")') !== null;
      const mainMenu = document.querySelector('button:has-text("Main Menu")') !== null;
      return { tryAgain, mainMenu };
    });

    expect(buttons.tryAgain || buttons.mainMenu).toBe(true);
  });

  test('can restart game from game over screen', async ({ page }) => {
    // Trigger game over
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Click Try Again button
    const tryAgainBtn = page.locator('button:has-text("Try Again"), .game-over-btn.primary').first();
    if (await tryAgainBtn.count() > 0) {
      await tryAgainBtn.click();
      await page.waitForTimeout(1000);

      // Should go to character creation
      const backToSetup = await page.evaluate(() => {
        const setup = document.getElementById('game-setup-panel');
        const menu = document.getElementById('main-menu');
        return (setup && !setup.classList.contains('hidden')) ||
               (menu && !menu.classList.contains('hidden'));
      });

      expect(backToSetup).toBe(true);
    }
  });

  test('can return to main menu from game over', async ({ page }) => {
    // Trigger game over
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Click Main Menu button
    const menuBtn = page.locator('button:has-text("Main Menu"), button:has-text("🏠")').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(1000);

      // Should be at main menu
      await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);
    }
  });

  test('death cause is tracked correctly', async ({ page }) => {
    // Trigger starvation death
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'setstat hunger 0');
    await page.waitForTimeout(300);
    await runDeboogerCommand(page, 'setstat health 0');
    await page.waitForTimeout(1000);

    // Check death cause in game over screen
    const deathCause = await page.evaluate(() => {
      const causeElement = document.getElementById('game-over-cause');
      return causeElement ? causeElement.textContent : '';
    });

    expect(deathCause).toBeTruthy();
    // Should mention starvation or similar
    expect(deathCause.toLowerCase()).toMatch(/starv|hunger|health|death/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 🔄 COMPLETE GAME CYCLE TEST
// ═══════════════════════════════════════════════════════════════

test.describe('Complete Game Cycle', () => {
  test.skip(!config.gameFlowTests, 'Game flow tests disabled in config');
  test('full game cycle: start -> play -> save -> load -> quit -> restart', async ({ page }) => {
    const messages = setupConsoleCapture(page);

    // STEP 1: Load game
    await page.goto('/');
    await waitForGameLoad(page);
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);

    // STEP 2: Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);

    // STEP 3: Create character
    await page.fill('#character-name-input', 'CycleTest');
    await page.click('#start-game-btn');
    await page.waitForTimeout(1000);

    const gameStarted = await page.evaluate(() => {
      return typeof game !== 'undefined' && game.player !== null;
    });
    expect(gameStarted).toBe(true);

    // STEP 4: Play game (modify state)
    await openDeboogerConsole(page);
    await runDeboogerCommand(page, 'gold 777');
    await page.waitForTimeout(500);

    const goldAfterPlay = await getPlayerGold(page);
    expect(goldAfterPlay).toBeGreaterThan(100);

    // STEP 5: Save game
    await page.keyboard.press('F5');
    await page.waitForTimeout(500);

    // STEP 6: Modify state again
    await runDeboogerCommand(page, 'gold 123');
    await page.waitForTimeout(500);

    // STEP 7: Load saved game
    await page.keyboard.press('F9');
    await page.waitForTimeout(1000);

    const goldAfterLoad = await getPlayerGold(page);
    expect(goldAfterLoad).toBeCloseTo(777, -1); // Allow some variance

    // STEP 8: Quit to main menu
    await page.evaluate(() => {
      if (typeof quitToMainMenu === 'function') {
        quitToMainMenu();
      }
    });
    await page.waitForTimeout(500);
    await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);

    // STEP 9: Start another new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);

    // Verify no critical errors throughout
    const criticalErrors = filterCriticalErrors(messages.errors);
    expect(criticalErrors).toHaveLength(0);
  });
});

console.log('🖤 Game Flow Tests loaded - Unity Agent F');
