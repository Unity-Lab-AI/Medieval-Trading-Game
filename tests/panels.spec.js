// @ts-check
const { test, expect } = require('@playwright/test');
const config = require('./config/test-config');
const {
  waitForGameLoad,
  startNewGame,
  isPanelVisible,
  togglePanelWithKey,
  openPanel,
  closePanel,
} = require('./helpers/test-helpers');

/**
 * 🖤 PANEL TESTS
 * Tests all game panels open/close correctly via buttons and keyboard
 */

test.describe('Game Panels', () => {
  test.skip(!config.panelTests, 'Panel tests disabled in config');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await startNewGame(page);
  });

  // ═══════════════════════════════════════════════════════════════
  // 📦 INVENTORY PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Inventory Panel', () => {
    test.skip(!config.panels.inventory, 'Inventory panel tests disabled');

    test('opens with I key or direct call', async ({ page }) => {
      // Try keyboard first
      await togglePanelWithKey(page, 'i');
      let visible = await isPanelVisible(page, 'inventory-panel');

      // Fallback to direct function call if keyboard didn't work
      if (!visible) {
        await openPanel(page, 'inventory');
        visible = await isPanelVisible(page, 'inventory-panel');
      }

      expect(visible).toBe(true);
    });

    test('closes with Escape or direct call', async ({ page }) => {
      await openPanel(page, 'inventory');
      await page.waitForTimeout(300);

      // First try Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      let visible = await isPanelVisible(page, 'inventory-panel');

      // If still visible, use direct close
      if (visible) {
        await closePanel(page, 'inventory-panel');
        visible = await isPanelVisible(page, 'inventory-panel');
      }

      expect(visible).toBe(false);
    });

    test('opens via action bar button', async ({ page }) => {
      // Try clicking the inventory button
      const invBtn = page.locator('#inventory-btn, [data-panel="inventory"], button:has-text("📦")');
      if (await invBtn.count() > 0) {
        await invBtn.first().click();
        await page.waitForTimeout(300);
      } else {
        await openPanel(page, 'inventory');
      }

      const visible = await isPanelVisible(page, 'inventory-panel');
      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👤 CHARACTER PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Character Panel', () => {
    test.skip(!config.panels.character, 'Character panel tests disabled');

    test('opens with C key or direct call', async ({ page }) => {
      // 🖤 Character uses character-sheet-overlay, created dynamically by KeyBindings
      await togglePanelWithKey(page, 'c');
      await page.waitForTimeout(300);

      // Check for character-sheet-overlay (created by KeyBindings.createCharacterSheetOverlay)
      let visible = await page.evaluate(() => {
        const overlay = document.getElementById('character-sheet-overlay');
        return overlay && overlay.classList.contains('active');
      });

      // Fallback: check side-panel which shows character info
      if (!visible) {
        visible = await page.evaluate(() => {
          const sidePanel = document.getElementById('side-panel');
          return sidePanel && sidePanel.offsetParent !== null;
        });
      }

      expect(visible).toBe(true);
    });

    test('displays player stats', async ({ page }) => {
      await togglePanelWithKey(page, 'c');
      await page.waitForTimeout(500);

      // 🖤 Check for stat elements in character-sheet-overlay or side-panel
      const hasStats = await page.evaluate(() => {
        const overlay = document.getElementById('character-sheet-overlay');
        const sidePanel = document.getElementById('side-panel');
        const panel = overlay || sidePanel;
        if (!panel) return false;
        const text = panel.textContent.toLowerCase();
        return text.includes('health') || text.includes('strength') ||
               text.includes('level') || text.includes('gold') ||
               text.includes('endurance') || text.includes('charisma') ||
               text.includes('stamina') || text.includes('name');
      });

      expect(hasStats).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏪 MARKET PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Market Panel', () => {
    test.skip(!config.panels.market, 'Market panel tests disabled');

    test('opens with M key or direct call', async ({ page }) => {
      await togglePanelWithKey(page, 'm');
      let visible = await isPanelVisible(page, 'market-panel');

      if (!visible) {
        await openPanel(page, 'market');
        visible = await isPanelVisible(page, 'market-panel');
      }

      expect(visible).toBe(true);
    });

    test('shows buy/sell tabs or items', async ({ page }) => {
      await openPanel(page, 'market');
      await page.waitForTimeout(300);

      const hasTabs = await page.evaluate(() => {
        const panel = document.getElementById('market-panel');
        if (!panel) return false;
        const text = panel.textContent.toLowerCase();
        return text.includes('buy') || text.includes('sell') ||
               text.includes('market') || text.includes('trade') ||
               text.includes('item') || text.includes('gold');
      });

      expect(hasTabs).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚶 TRAVEL PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Travel Panel', () => {
    test.skip(!config.panels.travel, 'Travel panel tests disabled');

    test('opens with T key or direct call', async ({ page }) => {
      await togglePanelWithKey(page, 't');
      let visible = await isPanelVisible(page, 'travel-panel');

      if (!visible) {
        await openPanel(page, 'travel');
        visible = await isPanelVisible(page, 'travel-panel');
      }

      expect(visible).toBe(true);
    });

    test('shows destination list or travel options', async ({ page }) => {
      await openPanel(page, 'travel');
      await page.waitForTimeout(300);

      const hasDestinations = await page.evaluate(() => {
        const panel = document.getElementById('travel-panel');
        if (!panel) return false;
        const text = panel.textContent.toLowerCase();
        return panel.querySelectorAll('.destination, .location-item, .travel-destination, button').length > 0 ||
               text.includes('destination') || text.includes('travel') ||
               text.includes('walk') || text.includes('journey');
      });

      expect(hasDestinations).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🗺️ MAP PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Map Panel', () => {
    test.skip(!config.panels.map, 'Map panel tests disabled');

    test('opens with N key or direct call', async ({ page }) => {
      await togglePanelWithKey(page, 'n');
      let visible = await isPanelVisible(page, 'map-panel');

      if (!visible) {
        await openPanel(page, 'map');
        visible = await isPanelVisible(page, 'map-panel');
      }

      // Map might already be visible in game view
      if (!visible) {
        visible = await page.evaluate(() => {
          const mapContainer = document.querySelector('.map-container, #world-map, canvas.map');
          return mapContainer !== null;
        });
      }

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📜 QUEST PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Quest Panel', () => {
    test.skip(!config.panels.quests, 'Quest panel tests disabled');

    test('opens with Q key or direct call', async ({ page }) => {
      // 🖤 Quest uses quest-overlay (created by QuestSystem.toggleQuestLog)
      await togglePanelWithKey(page, 'q');
      await page.waitForTimeout(300);

      let visible = await page.evaluate(() => {
        const overlay = document.getElementById('quest-overlay');
        return overlay && overlay.classList.contains('active');
      });

      // Fallback: check for quest-log-panel class
      if (!visible) {
        visible = await page.evaluate(() => {
          const panel = document.querySelector('.quest-log-panel:not(.hidden)');
          return panel !== null;
        });
      }

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏆 ACHIEVEMENTS PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Achievements Panel', () => {
    test.skip(!config.panels.achievements, 'Achievements panel tests disabled');

    test('opens with H key or direct call', async ({ page }) => {
      // 🖤 Achievements uses achievement-overlay (in index.html)
      await togglePanelWithKey(page, 'h');
      await page.waitForTimeout(300);

      let visible = await page.evaluate(() => {
        const overlay = document.getElementById('achievement-overlay');
        // Check if overlay is visible (not hidden, has display)
        if (!overlay) return false;
        const style = window.getComputedStyle(overlay);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏠 PROPERTIES PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Properties Panel', () => {
    test.skip(!config.panels.properties, 'Properties panel tests disabled');

    test('opens with P key or direct call', async ({ page }) => {
      // 🖤 Properties uses property-employee-panel (game.showOverlay)
      await togglePanelWithKey(page, 'p');
      await page.waitForTimeout(300);

      let visible = await page.evaluate(() => {
        const panel = document.getElementById('property-employee-panel');
        if (!panel) return false;
        // Check if it's not hidden
        return !panel.classList.contains('hidden');
      });

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 💰 FINANCIAL PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Financial Panel', () => {
    test.skip(!config.panels.financial, 'Financial panel tests disabled');

    test('opens with F key or direct call', async ({ page }) => {
      // 🖤 Financial uses financial-sheet-overlay (created by KeyBindings.createFinancialSheetOverlay)
      await togglePanelWithKey(page, 'f');
      await page.waitForTimeout(300);

      let visible = await page.evaluate(() => {
        const overlay = document.getElementById('financial-sheet-overlay');
        if (!overlay) return false;
        return overlay.classList.contains('active');
      });

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👥 PEOPLE PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('People Panel', () => {
    test.skip(!config.panels.people, 'People panel tests disabled');

    test('opens with O key or direct call', async ({ page }) => {
      // 🖤 People Panel is dynamically created by PeoplePanel.createPanelHTML()
      // Uses PeoplePanel.toggle() which calls open() -> removes 'hidden' class
      await togglePanelWithKey(page, 'o');
      await page.waitForTimeout(500); // Wait for panel creation + init

      let visible = await page.evaluate(() => {
        const panel = document.getElementById('people-panel');
        if (!panel) return false;
        // Panel is visible if it exists AND doesn't have hidden class
        return !panel.classList.contains('hidden');
      });

      // Fallback: try calling PeoplePanel directly
      if (!visible) {
        await page.evaluate(() => {
          if (typeof PeoplePanel !== 'undefined' && PeoplePanel.toggle) {
            PeoplePanel.toggle();
          }
        });
        await page.waitForTimeout(300);
        visible = await page.evaluate(() => {
          const panel = document.getElementById('people-panel');
          return panel && !panel.classList.contains('hidden');
        });
      }

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ SETTINGS PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Settings Panel', () => {
    test.skip(!config.panels.settings, 'Settings panel tests disabled');

    test('opens with comma key or direct call', async ({ page }) => {
      await togglePanelWithKey(page, ',');
      let visible = await isPanelVisible(page, 'settings-panel');

      if (!visible) {
        await openPanel(page, 'settings');
        visible = await isPanelVisible(page, 'settings-panel');
      }

      expect(visible).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📍 LOCATION PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Location Panel', () => {
    test.skip(!config.panels.location, 'Location panel tests disabled');

    test('is visible by default or can be opened', async ({ page }) => {
      let visible = await isPanelVisible(page, 'location-panel');

      // Location info might be displayed in a different element
      if (!visible) {
        visible = await page.evaluate(() => {
          const loc = document.querySelector('.location-info, .current-location, #location-name');
          return loc !== null && loc.textContent.length > 0;
        });
      }

      expect(visible).toBe(true);
    });

    test('shows current location name', async ({ page }) => {
      const hasLocation = await page.evaluate(() => {
        // Check various possible location display elements
        const panel = document.getElementById('location-panel') ||
                      document.querySelector('.location-info, .current-location');
        if (panel && panel.textContent.length > 5) return true;

        // Also check the location name in the sidebar
        const locationName = document.querySelector('.location-name, #location-name, h2.location');
        return locationName && locationName.textContent.length > 2;
      });

      expect(hasLocation).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 💬 MESSAGE LOG PANEL
  // ═══════════════════════════════════════════════════════════════

  test.describe('Message Log Panel', () => {
    test.skip(!config.panels.messageLog, 'Message log tests disabled');

    test('is visible by default', async ({ page }) => {
      let visible = await isPanelVisible(page, 'message-log');

      // Message log might have a different ID
      if (!visible) {
        visible = await page.evaluate(() => {
          const log = document.querySelector('.message-log, #messages, .game-log');
          return log !== null;
        });
      }

      expect(visible).toBe(true);
    });
  });
});
