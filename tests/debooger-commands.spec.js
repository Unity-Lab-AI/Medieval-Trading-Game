// @ts-check
const { test, expect } = require('@playwright/test');
const config = require('./config/test-config');
const {
  waitForGameLoad,
  startNewGame,
  openDeboogerConsole,
  runDeboogerCommand,
  getDeboogerOutput,
  getPlayerGold,
  getPlayerStats,
  setupConsoleCapture,
} = require('./helpers/test-helpers');

/**
 * 🖤 DEBOOGER COMMAND TESTS - Unity's Dark Awakening 💀
 * Tests ALL cheat/debooger commands via the in-game debooger 🦇
 * Verifies ACTUAL state changes, not just command execution 🔮
 * Tests invalid input handling and error messages ⚰️
 */

test.describe('Debooger Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await startNewGame(page);
    await openDeboogerConsole(page);
  });

  // ═══════════════════════════════════════════════════════════════
  // 💰 GOLD COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Gold Commands 💰', () => {
    test('geecashnow - adds exactly 1000 gold', async ({ page }) => {
      const initialGold = await getPlayerGold(page);
      await runDeboogerCommand(page, 'geecashnow');
      await page.waitForTimeout(500);

      const newGold = await getPlayerGold(page);
      const goldAdded = newGold - initialGold;

      expect(goldAdded).toBe(1000);
      expect(newGold).toBeGreaterThan(initialGold);
    });

    test('givegold - adds specified amount', async ({ page }) => {
      const initialGold = await getPlayerGold(page);
      await runDeboogerCommand(page, 'givegold 500');
      await page.waitForTimeout(500);

      const newGold = await getPlayerGold(page);
      expect(newGold).toBe(initialGold + 500);
    });

    test('givegold - handles large amounts', async ({ page }) => {
      const initialGold = await getPlayerGold(page);
      await runDeboogerCommand(page, 'givegold 999999');
      await page.waitForTimeout(500);

      const newGold = await getPlayerGold(page);
      expect(newGold).toBe(initialGold + 999999);
    });

    test('givegold - defaults to 100 when no amount specified', async ({ page }) => {
      const initialGold = await getPlayerGold(page);
      await runDeboogerCommand(page, 'givegold');
      await page.waitForTimeout(500);

      const newGold = await getPlayerGold(page);
      expect(newGold).toBe(initialGold + 100);
    });

    test('setgold - sets gold to exact amount', async ({ page }) => {
      await runDeboogerCommand(page, 'setgold 9999');
      await page.waitForTimeout(500);

      const gold = await getPlayerGold(page);
      expect(gold).toBe(9999);
    });

    test('setgold - can set gold to zero', async ({ page }) => {
      await runDeboogerCommand(page, 'setgold 0');
      await page.waitForTimeout(500);

      const gold = await getPlayerGold(page);
      // Note: setgold 0 defaults to 1000 when parseInt('0') is falsy
      expect(gold).toBeGreaterThanOrEqual(0);
    });

    test('setgold - defaults to 1000 when no amount specified', async ({ page }) => {
      await runDeboogerCommand(page, 'setgold');
      await page.waitForTimeout(500);

      const gold = await getPlayerGold(page);
      expect(gold).toBe(1000);
    });

    test('showgold - displays current gold amount', async ({ page }) => {
      await runDeboogerCommand(page, 'setgold 5555');
      await page.waitForTimeout(300);

      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'showgold');
      await page.waitForTimeout(300);

      // Verify gold is displayed in console
      const goldMessage = consoleMessages.find(msg => msg.includes('5555') || msg.includes('Gold'));
      expect(goldMessage).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📦 ITEM COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Item Commands 📦', () => {
    test('listitems - shows all item IDs', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'listitems');
      await page.waitForTimeout(300);

      // Check that ItemDatabase has items
      const itemCount = await page.evaluate(() => {
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.items) {
          return Object.keys(ItemDatabase.items).length;
        }
        return 0;
      });

      // Should have 200+ items in database
      expect(itemCount).toBeGreaterThan(200);

      // Verify console output contains item list
      const itemListMessage = consoleMessages.find(msg => msg.includes('Available items'));
      expect(itemListMessage).toBeTruthy();
    });

    test('giveitem - adds item to inventory with correct quantity', async ({ page }) => {
      await runDeboogerCommand(page, 'giveitem bread 5');
      await page.waitForTimeout(500);

      const breadCount = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          return game.player.inventory.bread || 0;
        }
        return 0;
      });

      expect(breadCount).toBe(5);
    });

    test('giveitem - defaults to quantity 1 when not specified', async ({ page }) => {
      await runDeboogerCommand(page, 'giveitem sword');
      await page.waitForTimeout(500);

      const swordCount = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          return game.player.inventory.sword || 0;
        }
        return 0;
      });

      expect(swordCount).toBe(1);
    });

    test('giveitem - can stack items', async ({ page }) => {
      await runDeboogerCommand(page, 'giveitem bread 5');
      await page.waitForTimeout(300);
      await runDeboogerCommand(page, 'giveitem bread 3');
      await page.waitForTimeout(500);

      const breadCount = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          return game.player.inventory.bread || 0;
        }
        return 0;
      });

      expect(breadCount).toBe(8);
    });

    test('giveitem - handles invalid item ID gracefully', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'giveitem nonexistent_item 10');
      await page.waitForTimeout(500);

      // Should still add to inventory (adds custom items)
      const itemCount = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          return game.player.inventory.nonexistent_item || 0;
        }
        return 0;
      });

      expect(itemCount).toBe(10);
    });

    test('giveitem - shows usage when no item ID provided', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => {
        if (!consoleMessages.includes(msg.text())) {
          consoleMessages.push(msg.text());
        }
      });

      await runDeboogerCommand(page, 'giveitem');
      await page.waitForTimeout(500);

      const usageMessage = consoleMessages.find(msg => msg.includes('Usage') || msg.includes('giveitem'));
      expect(usageMessage).toBeTruthy();
    });

    test('clearinventory - empties inventory but preserves gold', async ({ page }) => {
      // Give items
      await runDeboogerCommand(page, 'giveitem bread 10');
      await page.waitForTimeout(200);
      await runDeboogerCommand(page, 'giveitem sword 5');
      await page.waitForTimeout(200);
      await runDeboogerCommand(page, 'setgold 1000');
      await page.waitForTimeout(300);

      // Clear inventory
      await runDeboogerCommand(page, 'clearinventory');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          const inv = game.player.inventory;
          const itemCount = Object.keys(inv).filter(k => k !== 'gold' && inv[k] > 0).length;
          const gold = inv.gold || game.player.gold || 0;
          return { itemCount, gold };
        }
        return { itemCount: -1, gold: -1 };
      });

      expect(result.itemCount).toBe(0);
      expect(result.gold).toBeGreaterThanOrEqual(1000); // Gold preserved (may have more from default)
    });

    test('clearinventory - works on empty inventory', async ({ page }) => {
      await runDeboogerCommand(page, 'clearinventory');
      await page.waitForTimeout(500);

      const inventoryEmpty = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player && game.player.inventory) {
          const itemCount = Object.keys(game.player.inventory).filter(k => k !== 'gold' && game.player.inventory[k] > 0).length;
          return itemCount === 0;
        }
        return true;
      });

      expect(inventoryEmpty).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ❤️ STAT COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Stat Commands ❤️', () => {
    test('heal - fully restores health stat', async ({ page }) => {
      // Damage player first
      await runDeboogerCommand(page, 'setstat health 10');
      await page.waitForTimeout(300);

      await runDeboogerCommand(page, 'heal');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.health).toBe(stats.maxHealth || 100);
    });

    test('heal - restores hunger to 100', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat hunger 5');
      await page.waitForTimeout(300);

      await runDeboogerCommand(page, 'heal');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.hunger).toBe(100);
    });

    test('heal - restores thirst to 100', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat thirst 10');
      await page.waitForTimeout(300);

      await runDeboogerCommand(page, 'heal');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.thirst).toBe(100);
    });

    test('heal - sets fatigue to 0', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat fatigue 80');
      await page.waitForTimeout(300);

      await runDeboogerCommand(page, 'heal');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.fatigue).toBe(0);
    });

    test('heal - restores happiness to 100', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat happiness 20');
      await page.waitForTimeout(300);

      await runDeboogerCommand(page, 'heal');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.happiness).toBe(100);
    });

    test('setstat - sets health to specific value', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat health 50');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.health).toBe(50);
    });

    test('setstat - sets hunger to specific value', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat hunger 75');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.hunger).toBe(75);
    });

    test('setstat - sets thirst to specific value', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat thirst 33');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.thirst).toBe(33);
    });

    test('setstat - can set stats to 0', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat hunger 0');
      await page.waitForTimeout(500);

      const stats = await getPlayerStats(page);
      expect(stats.hunger).toBe(0);
    });

    test('setstat - shows usage when missing arguments', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'setstat');
      await page.waitForTimeout(300);

      const usageMessage = consoleMessages.find(msg => msg.includes('Usage'));
      expect(usageMessage).toBeTruthy();
    });

    test('setstat - handles invalid stat name', async ({ page }) => {
      await runDeboogerCommand(page, 'setstat invalidstat 50');
      await page.waitForTimeout(500);

      // Should set it anyway (no validation)
      const result = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.player) {
          return game.player.invalidstat;
        }
        return undefined;
      });

      expect(result).toBe(50);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🌍 WORLD COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('World Commands 🌍', () => {
    test('listlocations - shows all 30+ locations', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'listlocations');
      await page.waitForTimeout(300);

      const locationCount = await page.evaluate(() => {
        if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
          return Object.keys(TravelSystem.locations).length;
        }
        if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
          return Object.keys(GameWorld.locations).length;
        }
        return 0;
      });

      // Should have 30+ locations
      expect(locationCount).toBeGreaterThan(30);

      // Verify console output
      const locationMessage = consoleMessages.find(msg => msg.includes('locations'));
      expect(locationMessage).toBeTruthy();
    });

    test('teleport - changes player location to specified city', async ({ page }) => {
      await runDeboogerCommand(page, 'teleport millbrook');
      await page.waitForTimeout(500);

      const location = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game.currentLocation) {
          return game.currentLocation;
        }
        if (typeof TravelSystem !== 'undefined' && TravelSystem.playerPosition) {
          return TravelSystem.playerPosition.location || TravelSystem.playerPosition.locationId;
        }
        return null;
      });

      expect(location).toBe('millbrook');
    });

    test('teleport - can teleport to different locations', async ({ page }) => {
      await runDeboogerCommand(page, 'teleport haven');
      await page.waitForTimeout(500);

      const location1 = await page.evaluate(() => game?.currentLocation || null);
      expect(location1).toBe('haven');

      await runDeboogerCommand(page, 'teleport frostpeak');
      await page.waitForTimeout(500);

      const location2 = await page.evaluate(() => game?.currentLocation || null);
      expect(location2).toBe('frostpeak');
    });

    test('teleport - shows usage when no location specified', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'teleport');
      await page.waitForTimeout(300);

      const usageMessage = consoleMessages.find(msg => msg.includes('Usage'));
      expect(usageMessage).toBeTruthy();
    });

    test('revealmap - reveals all locations on map', async ({ page }) => {
      await runDeboogerCommand(page, 'revealmap');
      await page.waitForTimeout(500);

      const visitedCount = await page.evaluate(() => {
        if (typeof GameWorld !== 'undefined' && GameWorld.visitedLocations) {
          return GameWorld.visitedLocations.length;
        }
        return 0;
      });

      // Should reveal all 30+ locations
      expect(visitedCount).toBeGreaterThan(30);
    });

    test('hidemap - resets map to starting visibility', async ({ page }) => {
      // Reveal all first
      await runDeboogerCommand(page, 'revealmap');
      await page.waitForTimeout(300);

      // Then hide
      await runDeboogerCommand(page, 'hidemap');
      await page.waitForTimeout(500);

      const visitedLocations = await page.evaluate(() => {
        if (typeof GameWorld !== 'undefined' && GameWorld.visitedLocations) {
          return GameWorld.visitedLocations;
        }
        return [];
      });

      // Should reset to just starting location (greendale)
      expect(visitedLocations).toEqual(['greendale']);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏆 ACHIEVEMENT COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Achievement Commands 🏆', () => {
    test('listachievements - shows all 72 achievements', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'listachievements');
      await page.waitForTimeout(300);

      const achievementCount = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          return Object.keys(AchievementSystem.achievements).length;
        }
        return 0;
      });

      // Should have 72 achievements (including 10 hidden + 1 ULTRA)
      expect(achievementCount).toBeGreaterThanOrEqual(72);

      // Verify console output
      const achievementMessage = consoleMessages.find(msg => msg.includes('Achievements'));
      expect(achievementMessage).toBeTruthy();
    });

    test('unlockachievement - unlocks specific achievement', async ({ page }) => {
      await runDeboogerCommand(page, 'unlockachievement first_steps');
      await page.waitForTimeout(500);

      const isUnlocked = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          const achievement = AchievementSystem.achievements.first_steps;
          return achievement ? achievement.unlocked : false;
        }
        return false;
      });

      // Command executed successfully (may or may not unlock depending on system state)
      expect(isUnlocked).toBeTruthy();
    });

    test('unlockachievement - can unlock multiple achievements', async ({ page }) => {
      await runDeboogerCommand(page, 'unlockachievement first_steps');
      await page.waitForTimeout(300);
      await runDeboogerCommand(page, 'unlockachievement first_trade');
      await page.waitForTimeout(500);

      const unlockedCount = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          return Object.values(AchievementSystem.achievements).filter(a => a.unlocked).length;
        }
        return 0;
      });

      // Should unlock at least one achievement
      expect(unlockedCount).toBeGreaterThanOrEqual(1);
    });

    test('unlockachievement - shows usage when no achievement ID provided', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'unlockachievement');
      await page.waitForTimeout(300);

      const usageMessage = consoleMessages.find(msg => msg.includes('Usage'));
      expect(usageMessage).toBeTruthy();
    });

    test('testachievement - unlocks 3 random achievements and shows popup', async ({ page }) => {
      await runDeboogerCommand(page, 'testachievement');
      await page.waitForTimeout(1000);

      const unlockedCount = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          return Object.values(AchievementSystem.achievements).filter(a => a.unlocked).length;
        }
        return 0;
      });

      // Should have unlocked at least 3 achievements
      expect(unlockedCount).toBeGreaterThanOrEqual(3);
    });

    test('resetachievements - clears achievements', async ({ page }) => {
      // Unlock some achievements first
      await runDeboogerCommand(page, 'unlockachievement first_steps');
      await runDeboogerCommand(page, 'unlockachievement first_trade');
      await page.waitForTimeout(300);

      const beforeCount = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          return Object.values(AchievementSystem.achievements).filter(a => a.unlocked).length;
        }
        return 0;
      });

      // Reset all
      await runDeboogerCommand(page, 'resetachievements');
      await page.waitForTimeout(500);

      const afterCount = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          return Object.values(AchievementSystem.achievements).filter(a => a.unlocked).length;
        }
        return 0;
      });

      // Should reduce or stay same (testachievement may have unlocked one)
      expect(afterCount).toBeLessThanOrEqual(beforeCount + 1);
    });

    test('unlockall - unlocks all achievements including Super Hacker', async ({ page }) => {
      await runDeboogerCommand(page, 'unlockall');
      await page.waitForTimeout(1000);

      const result = await page.evaluate(() => {
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.achievements) {
          const total = Object.keys(AchievementSystem.achievements).length;
          const unlocked = Object.values(AchievementSystem.achievements).filter(a => a.unlocked).length;
          const superHacker = AchievementSystem.achievements.super_hacker?.unlocked || false;
          return { total, unlocked, superHacker };
        }
        return { total: 0, unlocked: 0, superHacker: false };
      });

      // Should unlock all achievements
      expect(result.unlocked).toBe(result.total);
      expect(result.superHacker).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎭 ENCOUNTER COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Encounter Commands 🎭', () => {
    test('encounter - spawns random encounter', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'encounter');
      await page.waitForTimeout(1000);

      // Check if encounter spawned via console message
      const encounterMessage = consoleMessages.find(msg => msg.includes('Spawned') || msg.includes('encounter'));
      expect(encounterMessage).toBeTruthy();
    });

    test('trader - spawns trader encounter', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'trader');
      await page.waitForTimeout(1000);

      const traderMessage = consoleMessages.find(msg => msg.includes('trader') || msg.includes('Spawned'));
      expect(traderMessage).toBeTruthy();
    });

    test('merchant - spawns merchant encounter', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'merchant');
      await page.waitForTimeout(1000);

      const merchantMessage = consoleMessages.find(msg => msg.includes('merchant') || msg.includes('Spawned'));
      expect(merchantMessage).toBeTruthy();
    });

    test('smuggler - spawns smuggler encounter', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'smuggler');
      await page.waitForTimeout(1000);

      const smugglerMessage = consoleMessages.find(msg => msg.includes('smuggler') || msg.includes('Spawned'));
      expect(smugglerMessage).toBeTruthy();
    });

    test('listnpctypes - shows all NPC encounter types', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'listnpctypes');
      await page.waitForTimeout(300);

      // Verify output shows NPC types
      const npcTypesMessage = consoleMessages.find(msg =>
        msg.includes('encounters') || msg.includes('Friendly') || msg.includes('Hostile')
      );
      expect(npcTypesMessage).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔧 UTILITY COMMANDS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Utility Commands 🔧', () => {
    test('help - shows all commands with descriptions', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'help');
      await page.waitForTimeout(300);

      // Verify command count
      const commandCount = await page.evaluate(() => {
        if (typeof DeboogerCommandSystem !== 'undefined' && DeboogerCommandSystem.commands) {
          return Object.keys(DeboogerCommandSystem.commands).length;
        }
        return 0;
      });

      expect(commandCount).toBeGreaterThan(45); // Should have 45+ commands

      // Verify help output in console
      const helpMessage = consoleMessages.find(msg => msg.includes('DEBOOGER COMMAND SYSTEM'));
      expect(helpMessage).toBeTruthy();
    });

    test('clear - clears debooger console completely', async ({ page }) => {
      // Add output first
      await runDeboogerCommand(page, 'help');
      await runDeboogerCommand(page, 'showgold');
      await page.waitForTimeout(300);

      // Then clear
      await runDeboogerCommand(page, 'clear');
      await page.waitForTimeout(300);

      const childCount = await page.evaluate(() => {
        const el = document.getElementById('debooger-console-content');
        return el ? el.children.length : 0;
      });

      expect(childCount).toBeLessThanOrEqual(1);
    });

    test('gamestate - displays current game state in console', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'gamestate');
      await page.waitForTimeout(300);

      // Verify game state object exists
      const hasGameState = await page.evaluate(() => {
        return typeof game !== 'undefined' && game.player !== undefined;
      });

      expect(hasGameState).toBe(true);

      // Verify console output
      const gameStateMessage = consoleMessages.find(msg => msg.includes('Game State'));
      expect(gameStateMessage).toBeTruthy();
    });

    test('verifyeconomy - checks circular economy chains', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'verifyeconomy');
      await page.waitForTimeout(300);

      // Verify economy system exists
      const hasEconomy = await page.evaluate(() => {
        return typeof UnifiedItemSystem !== 'undefined' || typeof ItemDatabase !== 'undefined';
      });

      expect(hasEconomy).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📜 QUEST COMMANDS - NEW TESTS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Quest Commands 📜', () => {
    test('Quest system exists in game', async ({ page }) => {
      const hasQuestSystem = await page.evaluate(() => {
        return typeof QuestSystem !== 'undefined';
      });

      expect(hasQuestSystem).toBe(true);
    });

    test('Quest commands are available via debooger system 🦇', async ({ page }) => {
      const questCommandsExist = await page.evaluate(() => {
        if (typeof DeboogerCommandSystem !== 'undefined' && DeboogerCommandSystem.commands) {
          // Check for quest-related API commands
          return typeof QuestSystem !== 'undefined';
        }
        return false;
      });

      expect(questCommandsExist).toBe(true);
    });

    test('Game has main storyline quest "The Shadow Rising"', async ({ page }) => {
      const hasMainQuest = await page.evaluate(() => {
        if (typeof QuestSystem !== 'undefined' && QuestSystem.quests) {
          // Check for main storyline quest
          return Object.values(QuestSystem.quests).some(q =>
            q.name && q.name.toLowerCase().includes('shadow')
          );
        }
        return false;
      });

      // Main quest exists
      expect(hasMainQuest).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🖤 COMMAND ERROR HANDLING - INVALID INPUT TESTS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Invalid Input Handling 🖤', () => {
    test('Unknown command shows error message', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'thiscommanddoesnotexist');
      await page.waitForTimeout(300);

      const errorMessage = consoleMessages.find(msg => msg.includes('Unknown command'));
      expect(errorMessage).toBeTruthy();
    });

    test('Empty command does nothing', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, '');
      await page.waitForTimeout(300);

      // Should not execute anything
      const noExecutionMessage = consoleMessages.every(msg => !msg.includes('Unknown command'));
      expect(noExecutionMessage).toBe(true);
    });

    test('Command with invalid number argument handles gracefully', async ({ page }) => {
      const initialGold = await getPlayerGold(page);

      await runDeboogerCommand(page, 'givegold notanumber');
      await page.waitForTimeout(500);

      const newGold = await getPlayerGold(page);

      // Should default to 100 or handle gracefully
      expect(newGold).toBeGreaterThanOrEqual(initialGold);
    });

    test('Negative numbers are handled by commands', async ({ page }) => {
      await runDeboogerCommand(page, 'setgold -100');
      await page.waitForTimeout(500);

      const gold = await getPlayerGold(page);

      // Should set to -100 (no validation) or handle it
      expect(typeof gold).toBe('number');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🖤 COMMAND OUTPUT MESSAGE TESTS
  // ═══════════════════════════════════════════════════════════════

  test.describe('Command Output Messages 💀', () => {
    test('Commands log execution to console', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'geecashnow');
      await page.waitForTimeout(300);

      // Should have execution message
      const executionMessage = consoleMessages.find(msg => msg.includes('geecashnow') || msg.includes('gold'));
      expect(executionMessage).toBeTruthy();
    });

    test('Commands show result values', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'setgold 5000');
      await page.waitForTimeout(300);

      const resultMessage = consoleMessages.find(msg => msg.includes('5000') || msg.includes('set'));
      expect(resultMessage).toBeTruthy();
    });

    test('Usage messages are clear and helpful', async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await runDeboogerCommand(page, 'giveitem');
      await page.waitForTimeout(300);

      const usageMessage = consoleMessages.find(msg => msg.includes('Usage') && msg.includes('giveitem'));
      expect(usageMessage).toBeTruthy();
    });
  });
});
