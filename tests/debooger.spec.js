// @ts-check
const { test, expect } = require('@playwright/test');

// 🖤 DEBOOGER - check console for errors 💀
test('debooger - check console for errors', async ({ page }) => {
  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });

  await page.goto('/');

  // Wait for loading
  await page.waitForTimeout(5000);

  // Check what's on window
  const windowState = await page.evaluate(() => {
    return {
      startNewGame: typeof window.startNewGame,
      loadGame: typeof window.loadGame,
      LoadingManager: typeof window.LoadingManager,
      LoadingManagerComplete: window.LoadingManager?.isComplete,
      GameConfig: typeof window.GameConfig,
      GameWorld: typeof window.GameWorld,
      ItemDatabase: typeof window.ItemDatabase,
      TradingSystem: typeof window.TradingSystem,
      SaveManager: typeof window.SaveManager,
      KeyBindings: typeof window.KeyBindings
    };
  });

  console.log('Window state:', windowState);
  console.log('Console errors:', consoleErrors);
  console.log('All console messages:', consoleMessages.slice(-50));

  // 🦇 Output for deboogering 💀
  expect(windowState).toBeTruthy();
});
