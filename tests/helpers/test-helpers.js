/**
 * 🖤 TEST HELPERS - Common utilities for Playwright tests
 */

const config = require('../config/test-config');

/**
 * Wait for game to fully load
 */
async function waitForGameLoad(page) {
  // Wait for loading screen to have hidden class (use evaluate since hidden elements aren't visible)
  await page.waitForFunction(() => {
    const loading = document.getElementById('loading-screen');
    return loading && loading.classList.contains('hidden');
  }, { timeout: config.loadTimeout });

  // Wait for main menu to be visible
  await page.waitForSelector('#main-menu:not(.hidden)', { timeout: 5000 });

  // Verify LoadingManager completed
  const isComplete = await page.evaluate(() => {
    return window.LoadingManager && window.LoadingManager.isComplete === true;
  });

  if (!isComplete) {
    throw new Error('LoadingManager did not complete');
  }
}

/**
 * Start a new game and get to gameplay
 * Optimized for speed - uses direct function calls where possible
 */
async function startNewGame(page) {
  await waitForGameLoad(page);

  // Click New Game
  await page.click('#new-game-btn');

  // Wait for setup panel to be visible
  await page.waitForFunction(() => {
    const panel = document.getElementById('game-setup-panel');
    return panel && !panel.classList.contains('hidden');
  }, { timeout: 10000 });

  // Fill name and spend attribute points
  await page.evaluate(() => {
    // Fill character name
    const nameInput = document.getElementById('character-name-input');
    if (nameInput) nameInput.value = 'TestCharacter';

    // Spend all attribute points by clicking increase buttons
    const attrs = ['strength', 'intelligence', 'charisma', 'endurance', 'luck'];
    for (let i = 0; i < 5; i++) {
      const attr = attrs[i % attrs.length];
      const btn = document.querySelector(`button[data-attr="${attr}"].attr-up`);
      if (btn) btn.click();
    }
  });

  await page.waitForTimeout(500);

  // Click start button (should be enabled now)
  await page.click('#start-game-btn');
  await page.waitForTimeout(config.actionDelay);

  await page.waitForTimeout(config.actionDelay);

  // Wait for game to be running (setup panel hidden OR game container visible)
  await page.waitForFunction(() => {
    const setupPanel = document.getElementById('game-setup-panel');
    const gameContainer = document.getElementById('game-container');
    const locationPanel = document.getElementById('location-panel');

    // Game started if setup is hidden OR location panel exists and visible
    const setupHidden = setupPanel && setupPanel.classList.contains('hidden');
    const gameVisible = gameContainer && !gameContainer.classList.contains('hidden');
    const locationVisible = locationPanel && !locationPanel.classList.contains('hidden');

    return setupHidden || gameVisible || locationVisible;
  }, { timeout: 20000 });
}

/**
 * 🖤 Open the Debooger console (button-only, no keyboard shortcut) 💀
 */
async function openDeboogerConsole(page) {
  // 🖤 Click the Debooger button - no keyboard shortcut exists anymore
  const deboogerBtn = page.locator('#toggle-debooger-console, #debooger-toggle-btn, .debooger-toggle, button:has-text("Debooger")');
  if (await deboogerBtn.count() > 0) {
    await deboogerBtn.first().click();
    await page.waitForTimeout(config.actionDelay);
  }

  // Wait for Debooger console to be visible 🕯️
  await page.waitForFunction(() => {
    const console = document.getElementById('debooger-console') ||
                    document.querySelector('.debooger-console');
    return console && !console.classList.contains('hidden');
  }, { timeout: 5000 }).catch(() => {
    // If still not visible, try clicking again
    console.log('Debooger console not visible, trying again...');
  });

  // Give a moment for the input to be ready
  await page.waitForTimeout(200);
}

/**
 * 🖤 Execute a debooger command 🔮
 */
async function runDeboogerCommand(page, command) {
  // Ensure debooger console is open
  const isOpen = await page.evaluate(() => {
    const console = document.getElementById('debooger-console') ||
                    document.querySelector('.debooger-console');
    return console && !console.classList.contains('hidden');
  });

  if (!isOpen) {
    await openDeboogerConsole(page);
  }

  // Focus the debooger input ⚰️
  const input = page.locator('#debooger-command-input, .debooger-input');
  if (await input.count() > 0) {
    await input.first().focus();
    await page.waitForTimeout(100);
  }

  // Clear any existing text and type the command
  await page.fill('#debooger-command-input', command);
  await page.waitForTimeout(100);

  // Press Enter to execute 💀
  await page.keyboard.press('Enter');
  await page.waitForTimeout(config.actionDelay);
}

/**
 * 🖤 Get the last debooger console output 🦇
 */
async function getDeboogerOutput(page) {
  return await page.evaluate(() => {
    const content = document.getElementById('debooger-console-content');
    if (!content) return '';
    const lastEntry = content.lastElementChild;
    return lastEntry ? lastEntry.textContent : '';
  });
}

/**
 * Check if a panel is visible
 */
async function isPanelVisible(page, panelId) {
  return await page.evaluate((id) => {
    const panel = document.getElementById(id);
    return panel && !panel.classList.contains('hidden');
  }, panelId);
}

/**
 * Toggle a panel using keyboard shortcut
 */
async function togglePanelWithKey(page, key) {
  // First ensure focus is on the document body
  await page.evaluate(() => document.body.focus());
  await page.waitForTimeout(50);

  // Press the key
  await page.keyboard.press(key);
  await page.waitForTimeout(config.actionDelay);
}

/**
 * Open a panel directly using game functions (more reliable than keys)
 */
async function openPanel(page, panelName) {
  await page.evaluate((name) => {
    // Map panel names to their open functions
    const panelFunctions = {
      'inventory': () => typeof openInventory === 'function' && openInventory(),
      'character': () => typeof openCharacter === 'function' && openCharacter(),
      'market': () => typeof openMarket === 'function' && openMarket(),
      'travel': () => typeof openTravel === 'function' && openTravel(),
      'map': () => typeof openMap === 'function' && openMap(),
      'quest': () => typeof openQuests === 'function' && openQuests(),
      'quests': () => typeof openQuests === 'function' && openQuests(),
      'achievements': () => typeof openAchievements === 'function' && openAchievements(),
      'properties': () => typeof openProperties === 'function' && openProperties(),
      'financial': () => typeof openFinancial === 'function' && openFinancial(),
      'people': () => typeof openPeople === 'function' && openPeople(),
      'settings': () => typeof SettingsPanel !== 'undefined' && SettingsPanel.show && SettingsPanel.show(),
    };

    // Try direct function first
    if (panelFunctions[name.toLowerCase()]) {
      panelFunctions[name.toLowerCase()]();
      return;
    }

    // Fallback to game.showOverlay
    if (typeof game !== 'undefined' && typeof game.showOverlay === 'function') {
      game.showOverlay(name + '-panel');
    }
  }, panelName);
  await page.waitForTimeout(config.actionDelay);
}

/**
 * Close a panel
 */
async function closePanel(page, panelId) {
  await page.evaluate((id) => {
    const panel = document.getElementById(id);
    if (panel) {
      panel.classList.add('hidden');
    }
    // Also try game.hideOverlay
    if (typeof game !== 'undefined' && typeof game.hideOverlay === 'function') {
      game.hideOverlay(id);
    }
  }, panelId);
  await page.waitForTimeout(config.actionDelay);
}

/**
 * Get player gold amount
 */
async function getPlayerGold(page) {
  return await page.evaluate(() => {
    if (typeof GoldManager !== 'undefined') {
      return GoldManager.getGold();
    }
    if (typeof player !== 'undefined') {
      return player.gold || 0;
    }
    return 0;
  });
}

/**
 * Get player stats
 */
async function getPlayerStats(page) {
  return await page.evaluate(() => {
    // Try game.player first (most common path)
    if (typeof game !== 'undefined' && game.player) {
      return {
        health: game.player.health,
        maxHealth: game.player.maxHealth || 100,
        hunger: game.player.hunger,
        thirst: game.player.thirst,
        fatigue: game.player.fatigue,
        happiness: game.player.happiness,
      };
    }
    // Fall back to global player
    if (typeof player !== 'undefined') {
      return {
        health: player.health,
        maxHealth: player.maxHealth || 100,
        hunger: player.hunger,
        thirst: player.thirst,
        fatigue: player.fatigue,
        happiness: player.happiness,
      };
    }
    return null;
  });
}

/**
 * Capture console messages during a test
 */
function setupConsoleCapture(page) {
  const messages = { logs: [], errors: [], warnings: [] };

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') messages.errors.push(text);
    else if (type === 'warning') messages.warnings.push(text);
    else messages.logs.push(text);
  });

  page.on('pageerror', error => {
    messages.errors.push(`PAGE ERROR: ${error.message}`);
  });

  return messages;
}

/**
 * Filter out expected/ignorable errors
 */
function filterCriticalErrors(errors) {
  return errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('404') &&
    !e.includes('CORS') &&
    !e.includes('JSONBin') &&
    !e.includes('Failed to fetch') &&
    !e.includes('net::ERR') &&
    !e.includes('getSavedGames') &&
    !e.includes('NPCScheduleSystem')
  );
}

module.exports = {
  waitForGameLoad,
  startNewGame,
  openDeboogerConsole,
  runDeboogerCommand,
  getDeboogerOutput,
  isPanelVisible,
  togglePanelWithKey,
  openPanel,
  closePanel,
  getPlayerGold,
  getPlayerStats,
  setupConsoleCapture,
  filterCriticalErrors,
  config,
};
