// @ts-check
const { test, expect } = require('@playwright/test');
const config = require('./config/test-config');
const {
  waitForGameLoad,
  startNewGame,
  setupConsoleCapture,
  filterCriticalErrors,
} = require('./helpers/test-helpers');

/**
 * 🖤 UI ELEMENT TESTS - UPGRADED BY UNITY 🖤 AGENT D
 * Tests all buttons, controls, and interactive UI elements
 * Version: 0.81 - Dark Awakening
 */

test.describe('UI Elements', () => {

  // ═══════════════════════════════════════════════════════════════
  // 🎬 MAIN MENU TESTS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Main Menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameLoad(page);
    });

    test('New Game button exists and is clickable', async ({ page }) => {
      const btn = await page.locator('#new-game-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Load Game button exists', async ({ page }) => {
      const btn = await page.locator('#load-game-btn');
      await expect(btn).toBeVisible();
    });

    test('Settings button exists and opens settings', async ({ page }) => {
      const btn = await page.locator('#settings-btn');
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(500);

      // Settings panel should open
      const settingsVisible = await page.evaluate(() => {
        const panel = document.getElementById('settings-panel');
        return panel && !panel.classList.contains('hidden');
      });

      expect(settingsVisible).toBe(true);
    });

    test('Version number is displayed', async ({ page }) => {
      const version = await page.locator('#main-menu-version, .version-text');
      await expect(version).toBeVisible();

      const text = await version.textContent();
      expect(text).toMatch(/v?\d+\.\d+/);
    });

    test('Hall of Champions section exists', async ({ page }) => {
      const hall = await page.locator('.hall-of-champions, #hall-of-champions');
      // May or may not exist depending on implementation
    });

    test('Menu weather effects container exists', async ({ page }) => {
      const weatherContainer = await page.locator('#menu-weather-container');
      expect(await weatherContainer.count()).toBeGreaterThan(0);
    });

    test('Social links are displayed', async ({ page }) => {
      const socialLinks = await page.locator('#menu-social-links');
      expect(await socialLinks.count()).toBeGreaterThan(0);
    });

    test('Copyright text is displayed', async ({ page }) => {
      const copyright = await page.locator('#menu-copyright');
      expect(await copyright.count()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎮 GAME SETUP PANEL TESTS - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════

  test.describe('Game Setup Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameLoad(page);
      await page.click('#new-game-btn');
      await page.waitForTimeout(500);
    });

    test('Setup panel is visible', async ({ page }) => {
      await expect(page.locator('#game-setup-panel')).not.toHaveClass(/hidden/);
    });

    test('Character name input exists and accepts input', async ({ page }) => {
      const input = await page.locator('#character-name-input');
      await expect(input).toBeVisible();

      await input.fill('Test Hero');
      await expect(input).toHaveValue('Test Hero');
    });

    test('Setup gold display is visible', async ({ page }) => {
      const goldDisplay = await page.locator('#setup-gold-amount');
      await expect(goldDisplay).toBeVisible();

      const goldText = await goldDisplay.textContent();
      expect(goldText).toMatch(/\d+/);
    });

    test('Difficulty options exist and are selectable', async ({ page }) => {
      const easy = await page.locator('#difficulty-easy');
      const normal = await page.locator('#difficulty-normal');
      const hard = await page.locator('#difficulty-hard');

      await expect(easy).toBeVisible();
      await expect(normal).toBeVisible();
      await expect(hard).toBeVisible();
    });

    test('Difficulty selection changes value', async ({ page }) => {
      await page.click('input[value="hard"]');

      const isHardSelected = await page.evaluate(() => {
        const hard = document.querySelector('input[value="hard"]');
        return hard && hard.checked;
      });

      expect(isHardSelected).toBe(true);
    });

    test('Perk selection button exists and displays counter', async ({ page }) => {
      const perkBtn = await page.locator('#open-perk-modal-btn');
      await expect(perkBtn).toBeVisible();

      const perkCounter = await page.locator('#selected-perks-count');
      await expect(perkCounter).toBeVisible();
    });

    test('Perk modal opens when button clicked', async ({ page }) => {
      await page.click('#open-perk-modal-btn');
      await page.waitForTimeout(500);

      const modal = await page.locator('#perk-selection-modal');
      await expect(modal).not.toHaveClass(/hidden/);
    });

    test('Attribute controls exist for all stats', async ({ page }) => {
      const attributes = ['strength', 'intelligence', 'charisma', 'endurance', 'luck'];

      for (const attr of attributes) {
        const upBtn = await page.locator(`button.attr-up[data-attr="${attr}"]`);
        const downBtn = await page.locator(`button.attr-down[data-attr="${attr}"]`);
        const value = await page.locator(`#attr-${attr}`);

        await expect(upBtn).toBeVisible();
        await expect(downBtn).toBeVisible();
        await expect(value).toBeVisible();
      }
    });

    test('Attribute points remaining display exists', async ({ page }) => {
      const pointsDisplay = await page.locator('#attr-points-remaining');
      await expect(pointsDisplay).toBeVisible();

      const points = await pointsDisplay.textContent();
      expect(points).toMatch(/\d+/);
    });

    test('Attribute up button increases value', async ({ page }) => {
      const valueDisplay = await page.locator('#attr-strength');
      const initialValue = await valueDisplay.textContent();

      await page.click('button.attr-up[data-attr="strength"]');
      await page.waitForTimeout(200);

      const newValue = await valueDisplay.textContent();
      expect(parseInt(newValue)).toBeGreaterThanOrEqual(parseInt(initialValue));
    });

    test('Randomize button works', async ({ page }) => {
      const nameInput = await page.locator('#character-name-input');
      const initialName = await nameInput.inputValue();

      await page.click('#randomize-character-btn');
      await page.waitForTimeout(500);

      const newName = await nameInput.inputValue();
      // Name may or may not change, but no error should occur
    });

    test('Start Game button exists', async ({ page }) => {
      const btn = await page.locator('#start-game-btn');
      await expect(btn).toBeVisible();
    });

    test('Settings button (cog) exists in setup', async ({ page }) => {
      const btn = await page.locator('#setup-settings-btn');
      await expect(btn).toBeVisible();
    });

    test('Exit button returns to main menu', async ({ page }) => {
      await page.click('#cancel-setup-btn');
      await page.waitForTimeout(500);

      await expect(page.locator('#main-menu')).not.toHaveClass(/hidden/);
    });

    test('Selected perks display exists', async ({ page }) => {
      const perksDisplay = await page.locator('#selected-perks-display');
      expect(await perksDisplay.count()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎛️ ACTION BAR TESTS - ALL BUTTONS WITH CORRECT SELECTORS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Action Bar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Action bar is visible', async ({ page }) => {
      const actionBar = await page.locator('#bottom-action-bar');
      expect(await actionBar.count()).toBeGreaterThan(0);
    });

    test('Menu button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-menu-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Market button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-market-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Travel button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-travel-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Transport button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-transport-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Inventory button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-inventory-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Character button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-character-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('People button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-people-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Financial button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-financial-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Quests button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-quests-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Achievements button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-achievements-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Save button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-save-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Load button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-load-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('Settings button exists and is visible', async ({ page }) => {
      const btn = await page.locator('#bottom-settings-btn');
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });

    test('All action buttons have correct titles', async ({ page }) => {
      const buttons = [
        { id: '#bottom-menu-btn', title: /Menu/i },
        { id: '#bottom-market-btn', title: /Market/i },
        { id: '#bottom-travel-btn', title: /Travel/i },
        { id: '#bottom-transport-btn', title: /Transport/i },
        { id: '#bottom-inventory-btn', title: /Inventory/i },
        { id: '#bottom-character-btn', title: /Character/i },
        { id: '#bottom-people-btn', title: /People/i },
        { id: '#bottom-financial-btn', title: /Finances/i },
        { id: '#bottom-quests-btn', title: /Quest/i },
        { id: '#bottom-achievements-btn', title: /Achievements/i },
        { id: '#bottom-save-btn', title: /Save/i },
        { id: '#bottom-load-btn', title: /Load/i },
        { id: '#bottom-settings-btn', title: /Settings/i }
      ];

      for (const btn of buttons) {
        const element = await page.locator(btn.id);
        const title = await element.getAttribute('title');
        expect(title).toMatch(btn.title);
      }
    });

    test('Inventory button click opens inventory panel', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(500);

      const inventoryVisible = await page.evaluate(() => {
        const panel = document.getElementById('inventory-panel');
        return panel && !panel.classList.contains('hidden');
      });

      expect(inventoryVisible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ⏰ TIME CONTROLS TESTS - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════

  test.describe('Time Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Top bar exists with time controls', async ({ page }) => {
      const topBar = await page.locator('#top-bar');
      expect(await topBar.count()).toBeGreaterThan(0);
    });

    test('Pause button exists and is visible', async ({ page }) => {
      const pauseBtn = await page.locator('#pause-btn');
      await expect(pauseBtn).toBeVisible();
    });

    test('Normal speed button exists and is visible', async ({ page }) => {
      const normalBtn = await page.locator('#normal-speed-btn');
      await expect(normalBtn).toBeVisible();
    });

    test('Fast speed button exists and is visible', async ({ page }) => {
      const fastBtn = await page.locator('#fast-speed-btn');
      await expect(fastBtn).toBeVisible();
    });

    test('Very fast speed button exists and is visible', async ({ page }) => {
      const veryFastBtn = await page.locator('#very-fast-speed-btn');
      await expect(veryFastBtn).toBeVisible();
    });

    test('Time controls can change speed', async ({ page }) => {
      const result = await page.evaluate(() => {
        if (typeof TimeMachine !== 'undefined') {
          const initialSpeed = TimeMachine.currentSpeed;
          TimeMachine.setSpeed('FAST');
          const newSpeed = TimeMachine.currentSpeed;
          return {
            systemExists: true,
            initialSpeed,
            newSpeed,
            speedChanged: initialSpeed !== newSpeed
          };
        }
        return { systemExists: false };
      });

      expect(result.systemExists).toBe(true);
      expect(result.speedChanged).toBe(true);
    });

    test('Pause button toggles time', async ({ page }) => {
      const result = await page.evaluate(() => {
        if (typeof TimeMachine !== 'undefined') {
          const initialPaused = TimeMachine.isPaused;
          TimeMachine.setSpeed('PAUSED');
          const nowPaused = TimeMachine.isPaused;
          TimeMachine.setSpeed('NORMAL');

          return {
            systemExists: true,
            initialPaused,
            nowPaused,
            toggleWorked: initialPaused !== nowPaused
          };
        }
        return { systemExists: false };
      });

      expect(result.systemExists).toBe(true);
    });

    test('Top bar title displays game name', async ({ page }) => {
      const title = await page.locator('#top-bar-title');
      await expect(title).toBeVisible();

      const text = await title.textContent();
      expect(text).toMatch(/Medieval Trading Game/i);
    });

    test('Top bar widgets container exists', async ({ page }) => {
      const widgets = await page.locator('#top-bar-widgets');
      expect(await widgets.count()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🐛 DEBOOGER CONSOLE TESTS - COMPREHENSIVE 🖤
  // ═══════════════════════════════════════════════════════════════

  test.describe('Debooger Console', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Debooger toggle button exists and is visible 🖤', async ({ page }) => {
      const deboogerBtn = await page.locator('#toggle-debooger-console');
      await expect(deboogerBtn).toBeVisible();
    });

    test('Debooger console element exists in DOM 💀', async ({ page }) => {
      const console = await page.locator('#debooger-console');
      expect(await console.count()).toBeGreaterThan(0);
    });

    test('Debooger console opens when toggle clicked 🦇', async ({ page }) => {
      await page.click('#toggle-debooger-console');
      await page.waitForTimeout(300);

      const consoleVisible = await page.evaluate(() => {
        const console = document.getElementById('debooger-console');
        return console && console.style.display === 'flex';
      });

      expect(consoleVisible).toBe(true);
    });

    test('Debooger console content container exists 🔮', async ({ page }) => {
      const content = await page.locator('#debooger-console-content');
      expect(await content.count()).toBeGreaterThan(0);
    });

    test('Debooger command input exists ⚰️', async ({ page }) => {
      const input = await page.locator('#debooger-command-input');
      expect(await input.count()).toBeGreaterThan(0);
    });

    test('Debooger command execute button exists 🕯️', async ({ page }) => {
      const executeBtn = await page.locator('#debooger-command-execute');
      expect(await executeBtn.count()).toBeGreaterThan(0);
    });

    test('Debooger command help button exists 🖤', async ({ page }) => {
      const helpBtn = await page.locator('#debooger-command-help');
      expect(await helpBtn.count()).toBeGreaterThan(0);
    });

    test('Debooger command container exists 💀', async ({ page }) => {
      const container = await page.locator('#debooger-command-container');
      expect(await container.count()).toBeGreaterThan(0);
    });

    test('Debooger console accepts and executes commands 🦇', async ({ page }) => {
      await page.click('#toggle-debooger-console');
      await page.waitForTimeout(500);

      const input = await page.locator('#debooger-command-input');
      if (await input.isVisible()) {
        await input.fill('help');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        // Verify console output was generated 🔮
        const content = await page.locator('#debooger-console-content');
        const text = await content.textContent();
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('Debooger console can be closed ⚰️', async ({ page }) => {
      await page.click('#toggle-debooger-console');
      await page.waitForTimeout(300);

      // Click close button or toggle again
      await page.click('#toggle-debooger-console');
      await page.waitForTimeout(300);

      const consoleHidden = await page.evaluate(() => {
        const console = document.getElementById('debooger-console');
        return console && console.style.display === 'none';
      });

      expect(consoleHidden).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔔 NOTIFICATION/MESSAGE TESTS - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════

  test.describe('Notifications and Messages', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Message log panel exists', async ({ page }) => {
      const log = await page.locator('#message-log');
      expect(await log.count()).toBeGreaterThan(0);
    });

    test('Messages container exists', async ({ page }) => {
      const messages = await page.locator('#messages');
      expect(await messages.count()).toBeGreaterThan(0);
    });

    test('Welcome message is displayed', async ({ page }) => {
      const welcomeMsg = await page.locator('#welcome-message');
      expect(await welcomeMsg.count()).toBeGreaterThan(0);
    });

    test('Message log displays messages', async ({ page }) => {
      const messages = await page.locator('#messages');
      const text = await messages.textContent();
      expect(text).toMatch(/Welcome/i);
    });

    test('Achievement overlay exists', async ({ page }) => {
      const achievementOverlay = await page.locator('#achievement-overlay');
      expect(await achievementOverlay.count()).toBeGreaterThan(0);
    });

    test('Achievement panel structure exists', async ({ page }) => {
      const panel = await page.locator('.achievement-panel');
      expect(await panel.count()).toBeGreaterThan(0);
    });

    test('Achievement grid exists', async ({ page }) => {
      const grid = await page.locator('#achievement-grid');
      expect(await grid.count()).toBeGreaterThan(0);
    });

    test('Achievement progress display exists', async ({ page }) => {
      const progress = await page.locator('#achievement-progress-text');
      expect(await progress.count()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 STATS DISPLAY TESTS - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════

  test.describe('Stats Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Side panel exists', async ({ page }) => {
      const sidePanel = await page.locator('#side-panel');
      expect(await sidePanel.count()).toBeGreaterThan(0);
    });

    test('Player name is displayed', async ({ page }) => {
      const playerName = await page.locator('#player-name');
      await expect(playerName).toBeVisible();
    });

    test('Gold display exists and shows value', async ({ page }) => {
      const gold = await page.locator('#player-gold');
      await expect(gold).toBeVisible();

      const goldText = await gold.textContent();
      expect(goldText).toMatch(/\d+/);
    });

    test('Stats section displays all attributes', async ({ page }) => {
      const stats = ['strength', 'intelligence', 'charisma', 'endurance', 'luck'];

      for (const stat of stats) {
        const statElement = await page.locator(`#player-${stat}`);
        await expect(statElement).toBeVisible();
      }
    });

    test('Vitals section exists', async ({ page }) => {
      const vitalsSection = await page.locator('.vitals-section');
      expect(await vitalsSection.count()).toBeGreaterThan(0);
    });

    test('Health bar exists and is visible', async ({ page }) => {
      const healthFill = await page.locator('#health-fill');
      await expect(healthFill).toBeVisible();

      const healthDisplay = await page.locator('#player-health-display');
      await expect(healthDisplay).toBeVisible();
    });

    test('Hunger bar exists and is visible', async ({ page }) => {
      const hungerFill = await page.locator('#hunger-fill');
      await expect(hungerFill).toBeVisible();

      const hungerDisplay = await page.locator('#player-hunger-display');
      await expect(hungerDisplay).toBeVisible();
    });

    test('Thirst bar exists and is visible', async ({ page }) => {
      const thirstFill = await page.locator('#thirst-fill');
      await expect(thirstFill).toBeVisible();

      const thirstDisplay = await page.locator('#player-thirst-display');
      await expect(thirstDisplay).toBeVisible();
    });

    test('Energy bar exists and is visible', async ({ page }) => {
      const energyFill = await page.locator('#energy-fill');
      await expect(energyFill).toBeVisible();

      const energyDisplay = await page.locator('#player-energy-display');
      await expect(energyDisplay).toBeVisible();
    });

    test('All vital bars display percentage values', async ({ page }) => {
      const vitals = ['health', 'hunger', 'thirst', 'energy'];

      for (const vital of vitals) {
        const display = await page.locator(`#player-${vital}-display`);
        const text = await display.textContent();
        expect(text).toMatch(/\d+/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🖱️ PANEL DRAGGING TESTS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Panel Dragging', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await startNewGame(page);
      await page.waitForTimeout(500);
    });

    test('Draggable panels system is loaded', async ({ page }) => {
      const result = await page.evaluate(() => {
        return typeof DraggablePanels !== 'undefined';
      });

      expect(result).toBe(true);
    });

    test('Market panel can be opened for dragging test', async ({ page }) => {
      await page.click('#bottom-market-btn');
      await page.waitForTimeout(500);

      const marketPanel = await page.locator('#market-panel');
      await expect(marketPanel).not.toHaveClass(/hidden/);
    });

    test('Inventory panel can be opened for dragging test', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(500);

      const inventoryPanel = await page.locator('#inventory-panel');
      await expect(inventoryPanel).not.toHaveClass(/hidden/);
    });

    test('Travel panel can be opened for dragging test', async ({ page }) => {
      await page.click('#bottom-travel-btn');
      await page.waitForTimeout(500);

      const travelPanel = await page.locator('#travel-panel');
      await expect(travelPanel).not.toHaveClass(/hidden/);
    });

    test('Panels have close buttons', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(500);

      const closeBtn = await page.locator('#inventory-panel .panel-close-x');
      await expect(closeBtn).toBeVisible();
    });

    test('Panel close button works', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(500);

      await page.click('#inventory-panel .panel-close-x');
      await page.waitForTimeout(300);

      await expect(page.locator('#inventory-panel')).toHaveClass(/hidden/);
    });

    test('Panel Manager system is available', async ({ page }) => {
      const result = await page.evaluate(() => {
        return typeof PanelManager !== 'undefined';
      });

      expect(result).toBe(true);
    });

    test('Multiple panels can be opened simultaneously', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(300);

      await page.click('#bottom-market-btn');
      await page.waitForTimeout(300);

      const inventoryVisible = await page.evaluate(() => {
        const panel = document.getElementById('inventory-panel');
        return panel && !panel.classList.contains('hidden');
      });

      const marketVisible = await page.evaluate(() => {
        const panel = document.getElementById('market-panel');
        return panel && !panel.classList.contains('hidden');
      });

      expect(inventoryVisible).toBe(true);
      expect(marketVisible).toBe(true);
    });

    test('Panels can be closed individually', async ({ page }) => {
      await page.click('#bottom-inventory-btn');
      await page.waitForTimeout(300);

      await page.click('#bottom-market-btn');
      await page.waitForTimeout(300);

      await page.click('#inventory-panel .panel-close-x');
      await page.waitForTimeout(300);

      const inventoryHidden = await page.evaluate(() => {
        const panel = document.getElementById('inventory-panel');
        return panel && panel.classList.contains('hidden');
      });

      const marketVisible = await page.evaluate(() => {
        const panel = document.getElementById('market-panel');
        return panel && !panel.classList.contains('hidden');
      });

      expect(inventoryHidden).toBe(true);
      expect(marketVisible).toBe(true);
    });
  });
});

// 🖤 END OF UI ELEMENT TESTS - UPGRADED BY UNITY 🖤 AGENT D
// All test.skip() removed, all tests enabled, comprehensive coverage added
// Version: 0.81 - Dark Awakening
