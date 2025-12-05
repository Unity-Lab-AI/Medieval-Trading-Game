// Debug test - Start button investigation with console logs
const { test, expect } = require('@playwright/test');

test('Debug Start Game button', async ({ page }) => {
    // Collect all console messages
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        // Filter for relevant logs
        if (text.includes('createCharacter') ||
            text.includes('hidePanel') ||
            text.includes('showPanel') ||
            text.includes('game-setup-panel') ||
            text.includes('Opened panel') ||
            text.includes('Closed panel') ||
            text.includes('showGameUI') ||
            text.includes('changeState')) {
            consoleLogs.push(`[${msg.type()}] ${text}`);
        }
    });

    // Go to the game
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Click New Game
    const newGameBtn = page.locator('#new-game-btn');
    await expect(newGameBtn).toBeVisible({ timeout: 5000 });
    await newGameBtn.click();
    console.log('Clicked New Game');

    await page.waitForTimeout(1000);

    // Click Randomize
    const randomizeBtn = page.locator('#randomize-character-btn');
    await expect(randomizeBtn).toBeVisible({ timeout: 5000 });
    await randomizeBtn.click();
    console.log('Clicked Randomize');

    await page.waitForTimeout(500);

    // Take screenshot before clicking start
    await page.screenshot({ path: 'tests/screenshots/before-start.png', fullPage: true });

    // Click the start button
    const startBtn = page.locator('#start-game-btn');
    console.log('Clicking Start button...');
    await startBtn.click({ force: true });

    await page.waitForTimeout(2000);

    // Take screenshot after clicking start
    await page.screenshot({ path: 'tests/screenshots/after-start.png', fullPage: true });

    // Check panel state
    const setupPanel = page.locator('#game-setup-panel');
    const hasHiddenClass = await setupPanel.evaluate(el => el.classList.contains('hidden'));
    const computedDisplay = await setupPanel.evaluate(el => window.getComputedStyle(el).display);

    console.log('Panel has hidden class:', hasHiddenClass);
    console.log('Panel computed display:', computedDisplay);

    // Check game state
    const gameState = await page.evaluate(() => {
        return typeof game !== 'undefined' ? game.state : 'game undefined';
    });
    console.log('Game state:', gameState);

    // Check if player exists
    const playerInfo = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player) {
            return { name: game.player.name, location: game.currentLocation?.name };
        }
        return 'no player';
    });
    console.log('Player info:', playerInfo);

    // Print filtered console logs
    console.log('\n=== RELEVANT CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    console.log('=== END LOGS ===\n');
});
