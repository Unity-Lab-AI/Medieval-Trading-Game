// ═══════════════════════════════════════════════════════════════
// 🎮 DEBUG COMMAND SYSTEM - cheat codes for the morally flexible
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// press ` (backtick) when debug console is open to focus command input
// type commands and press enter to bend reality

console.log('🎮 Debug Command System loading...');

const DebugCommandSystem = {
    // Is the command input currently focused?
    isInputFocused: false,

    // Command history for up/down arrow navigation
    commandHistory: [],
    historyIndex: -1,

    // Available commands
    commands: {},

    // Initialize the system
    init() {
        console.log('🎮 Debug Command System initializing...');

        // Wire up the command input UI (already in HTML)
        this.wireUpCommandInput();

        // Setup keyboard listener for ` key
        this.setupKeyboardListener();

        // Register built-in commands
        this.registerBuiltInCommands();

        console.log('🎮 Debug Command System ready! Press ` to focus command input.');
    },

    // Wire up event listeners for command input (elements are in HTML)
    wireUpCommandInput() {
        const input = document.getElementById('debug-command-input');
        const executeBtn = document.getElementById('debug-command-execute');
        const helpBtn = document.getElementById('debug-command-help');

        if (!input) {
            console.warn('🎮 Command input not found, will retry...');
            setTimeout(() => this.wireUpCommandInput(), 500);
            return;
        }

        // Remove any existing listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Add event listeners to the fresh input
        newInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        newInput.addEventListener('focus', () => { this.isInputFocused = true; });
        newInput.addEventListener('blur', () => { this.isInputFocused = false; });

        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeCurrentCommand());
        }

        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        console.log('🎮 Command input wired up and ready!');
    },

    // Setup keyboard listener for backtick key
    setupKeyboardListener() {
        document.addEventListener('keydown', (e) => {
            // ` (backtick) key to focus command input
            if (e.key === '`' || e.code === 'Backquote') {
                const debugConsole = document.getElementById('debug-console');
                const input = document.getElementById('debug-command-input');

                // Only if debug console is visible
                if (debugConsole && debugConsole.style.display !== 'none') {
                    e.preventDefault();
                    if (input) {
                        input.focus();
                        console.log('🎮 Command input focused');
                    }
                }
            }
        });
    },

    // Handle input keydown events
    handleInputKeydown(e) {
        const input = e.target;

        if (e.key === 'Enter') {
            e.preventDefault();
            this.executeCurrentCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'Escape') {
            input.blur();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocomplete();
        }
    },

    // Navigate command history
    navigateHistory(direction) {
        const input = document.getElementById('debug-command-input');
        if (!input || this.commandHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            input.value = '';
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length - 1;
        }

        if (this.historyIndex >= 0) {
            input.value = this.commandHistory[this.historyIndex];
        }
    },

    // Autocomplete command names
    autocomplete() {
        const input = document.getElementById('debug-command-input');
        if (!input) return;

        const partial = input.value.toLowerCase().trim();
        if (!partial) return;

        const matches = Object.keys(this.commands).filter(cmd =>
            cmd.toLowerCase().startsWith(partial)
        );

        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            console.log('🎮 Matching commands:', matches.join(', '));
        }
    },

    // Execute the current command in the input
    executeCurrentCommand() {
        const input = document.getElementById('debug-command-input');
        if (!input) return;

        const commandText = input.value.trim();
        if (!commandText) return;

        // Add to history
        this.commandHistory.unshift(commandText);
        if (this.commandHistory.length > 50) {
            this.commandHistory.pop();
        }
        this.historyIndex = -1;

        // Clear input
        input.value = '';

        // Execute
        this.execute(commandText);
    },

    // Check if debug commands are enabled
    isDebugEnabled() {
        // First check if debug is unlocked via Super Hacker achievement
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.isDebugUnlockedForSave()) {
            return true;
        }

        // Check GameConfig.debug.enabled
        if (typeof GameConfig !== 'undefined' && GameConfig.debug) {
            return GameConfig.debug.enabled === true;
        }
        // Default to true if config not loaded
        return true;
    },

    // Execute a command string (supports async commands)
    async execute(commandText) {
        console.log(`🎮 > ${commandText}`);

        // Check if debug is locked out
        if (!this.isDebugEnabled()) {
            // Allow only 'help' command when locked out
            const cmdLower = commandText.trim().toLowerCase();
            if (cmdLower !== 'help' && !cmdLower.startsWith('help')) {
                console.warn('🔒 Debug commands are DISABLED. Set GameConfig.debug.enabled = true to unlock.');
                if (typeof GameConfig !== 'undefined' && GameConfig.debug?.showConsoleWarnings) {
                    console.log('🔒 This is a production build - debug commands are locked out.');
                }
                return;
            }
        }

        // Parse command and arguments
        const parts = commandText.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Find and execute command
        const command = this.commands[commandName];
        if (command) {
            try {
                // Await the result in case it's an async command
                const result = await command.handler(args);
                if (result !== undefined) {
                    console.log(`🎮 Result: ${result}`);
                }
            } catch (error) {
                console.error(`🎮 Command error: ${error.message}`);
            }
        } else {
            console.warn(`🎮 Unknown command: ${commandName}. Type 'help' for available commands.`);
        }
    },

    // Register a command
    registerCommand(name, description, handler) {
        this.commands[name.toLowerCase()] = {
            name,
            description,
            handler
        };
        console.log(`🎮 Registered command: ${name}`);
    },

    // Show help
    showHelp() {
        const isEnabled = this.isDebugEnabled();

        console.log('═══════════════════════════════════════════════════');
        console.log('🎮 DEBUG COMMAND SYSTEM - Available Commands:');
        if (!isEnabled) {
            console.log('🔒 STATUS: LOCKED - Debug commands disabled in config.js');
        } else {
            console.log('🔓 STATUS: UNLOCKED - Debug commands active');
        }
        console.log('═══════════════════════════════════════════════════');

        for (const [name, cmd] of Object.entries(this.commands)) {
            console.log(`  ${name} - ${cmd.description}`);
        }

        console.log('═══════════════════════════════════════════════════');
        console.log('💡 Tips:');
        console.log('  - Press ` (backtick) to focus command input');
        console.log('  - Press Enter to execute command');
        console.log('  - Press Up/Down to navigate history');
        console.log('  - Press Tab to autocomplete');
        if (!isEnabled) {
            console.log('🔒 Debug is DISABLED. Set GameConfig.debug.enabled = true');
        }
        console.log('═══════════════════════════════════════════════════');
    },

    // Register built-in commands
    registerBuiltInCommands() {
        // Help command
        this.registerCommand('help', 'Show all available commands', () => {
            this.showHelp();
        });

        // Clear console
        this.registerCommand('clear', 'Clear the debug console', () => {
            const content = document.getElementById('debug-console-content');
            if (content) content.innerHTML = '';
            console.log('🎮 Console cleared');
        });

        // ═══════════════════════════════════════════════════════════════
        // 💰 GOLD/MONEY CHEATS
        // ═══════════════════════════════════════════════════════════════

        // geecashnow - Classic cheat code for 1000 gold
        this.registerCommand('geecashnow', 'Add 1000 gold (respects carry weight)', () => {
            return this.addGoldCheat(1000);
        });

        // givegold <amount> - Add specific amount of gold
        this.registerCommand('givegold', 'Add gold: givegold <amount>', (args) => {
            const amount = parseInt(args[0]) || 100;
            return this.addGoldCheat(amount);
        });

        // setgold <amount> - Set gold to specific amount
        this.registerCommand('setgold', 'Set gold to amount: setgold <amount>', (args) => {
            const amount = parseInt(args[0]) || 1000;
            if (typeof UniversalGoldManager !== 'undefined') {
                UniversalGoldManager.setPersonalGold(amount, 'cheat');
            } else if (typeof GoldManager !== 'undefined') {
                GoldManager.setGold(amount, 'cheat');
            }
            if (typeof game !== 'undefined' && game.player) {
                game.player.gold = amount;
            }
            console.log(`💰 Gold set to ${amount}`);
            return amount;
        });

        // showgold - Show all gold across all sources
        this.registerCommand('showgold', 'Show gold from all sources', () => {
            if (typeof UniversalGoldManager !== 'undefined') {
                return UniversalGoldManager.showAllGold();
            } else {
                const gold = typeof GoldManager !== 'undefined' ? GoldManager.getGold() :
                            (game?.player?.gold || 0);
                console.log(`💰 Personal Gold: ${gold}`);
                return gold;
            }
        });

        // ═══════════════════════════════════════════════════════════════
        // 🎒 INVENTORY CHEATS
        // ═══════════════════════════════════════════════════════════════

        // giveitem <itemId> <quantity> - Add item to inventory
        this.registerCommand('giveitem', 'Add item: giveitem <itemId> [quantity]', (args) => {
            const itemId = args[0];
            const quantity = parseInt(args[1]) || 1;

            if (!itemId) {
                console.warn('🎮 Usage: giveitem <itemId> [quantity]');
                return 'Usage: giveitem <itemId> [quantity]';
            }

            // Always use game.player.inventory directly for reliability
            if (typeof game !== 'undefined' && game.player && game.player.inventory) {
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;
                console.log(`🎒 Added ${quantity}x ${itemId}`);
                // Update display if function exists
                if (typeof InventorySystem !== 'undefined' && InventorySystem.updateInventoryDisplay) {
                    InventorySystem.updateInventoryDisplay();
                }
                return `Added ${quantity}x ${itemId}`;
            }

            console.warn('🎮 No player inventory available');
            return 'No player inventory available';
        });

        // listitems - List all available item IDs
        this.registerCommand('listitems', 'List all item IDs', () => {
            if (typeof ItemDatabase !== 'undefined' && ItemDatabase.items) {
                const items = Object.keys(ItemDatabase.items);
                console.log('📦 Available items:', items.join(', '));
                return `${items.length} items`;
            }
            return 'ItemDatabase not found';
        });

        // clearinventory - Clear player inventory
        this.registerCommand('clearinventory', 'Clear player inventory', () => {
            if (typeof game !== 'undefined' && game.player) {
                game.player.inventory = { gold: game.player.gold || 0 };
                console.log('🎒 Inventory cleared');
                if (typeof updateInventoryDisplay === 'function') {
                    updateInventoryDisplay();
                }
            }
            return 'Inventory cleared';
        });

        // ═══════════════════════════════════════════════════════════════
        // 👤 PLAYER CHEATS
        // ═══════════════════════════════════════════════════════════════

        // heal - Full heal player
        this.registerCommand('heal', 'Fully heal player', () => {
            if (typeof game !== 'undefined' && game.player) {
                game.player.health = game.player.maxHealth || 100;
                game.player.hunger = 100;
                game.player.thirst = 100;
                game.player.fatigue = 0;
                game.player.happiness = 100;
                console.log('❤️ Player fully healed!');
                if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
            }
            return 'Healed!';
        });

        // setstat <stat> <value> - Set player stat
        this.registerCommand('setstat', 'Set stat: setstat <stat> <value>', (args) => {
            const stat = args[0];
            const value = parseInt(args[1]);

            if (!stat || isNaN(value)) {
                console.warn('🎮 Usage: setstat <stat> <value>');
                console.log('  Stats: health, hunger, thirst, fatigue, happiness, strength, charisma, intelligence, luck, endurance');
                return;
            }

            if (typeof game !== 'undefined' && game.player) {
                game.player[stat] = value;
                console.log(`📊 Set ${stat} to ${value}`);
                if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
            }
            return `${stat} = ${value}`;
        });

        // ═══════════════════════════════════════════════════════════════
        // 🗺️ WORLD/TRAVEL CHEATS
        // ═══════════════════════════════════════════════════════════════

        // teleport <locationId> - Teleport to location
        this.registerCommand('teleport', 'Teleport to location: teleport <locationId>', (args) => {
            const locationId = args[0];
            if (!locationId) {
                console.warn('🎮 Usage: teleport <locationId>');
                if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
                    console.log('Available locations:', Object.keys(TravelSystem.locations).join(', '));
                }
                return;
            }

            if (typeof TravelSystem !== 'undefined' && TravelSystem.setPlayerLocation) {
                TravelSystem.setPlayerLocation(locationId);
                console.log(`🗺️ Teleported to ${locationId}`);
            } else if (typeof game !== 'undefined') {
                game.currentLocation = locationId;
                console.log(`🗺️ Location set to ${locationId}`);
            }
            return locationId;
        });

        // listlocations - Show all locations
        this.registerCommand('listlocations', 'List all locations', () => {
            if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
                const locs = Object.keys(TravelSystem.locations);
                console.log('🗺️ Available locations:', locs.join(', '));
                return `${locs.length} locations`;
            }
            return 'TravelSystem not found';
        });

        // ═══════════════════════════════════════════════════════════════
        // ⏰ TIME CHEATS
        // ═══════════════════════════════════════════════════════════════

        // advancetime <hours> - Advance game time
        this.registerCommand('advancetime', 'Advance time: advancetime <hours>', (args) => {
            const hours = parseInt(args[0]) || 1;
            if (typeof game !== 'undefined') {
                game.hour = (game.hour || 0) + hours;
                while (game.hour >= 24) {
                    game.hour -= 24;
                    game.day = (game.day || 1) + 1;
                }
                console.log(`⏰ Time: Day ${game.day}, Hour ${game.hour}`);
                if (typeof updateTimeDisplay === 'function') updateTimeDisplay();
            }
            return `+${hours} hours`;
        });

        // ═══════════════════════════════════════════════════════════════
        // 🏠 PROPERTY CHEATS
        // ═══════════════════════════════════════════════════════════════

        // giveproperty <type> - Give a property
        this.registerCommand('giveproperty', 'Give property: giveproperty <type>', (args) => {
            const type = args[0] || 'house';
            if (typeof PropertySystem !== 'undefined' && PropertySystem.purchaseProperty) {
                const location = game?.currentLocation || 'haven';
                // Try to add property for free
                if (PropertySystem.properties) {
                    const prop = {
                        id: `cheat_${Date.now()}`,
                        type: type,
                        location: location,
                        level: 1,
                        condition: 100,
                        upgrades: [],
                        employees: [],
                        storage: {},
                        storageUsed: 0
                    };
                    PropertySystem.properties.push(prop);
                    console.log(`🏠 Gave property: ${type} at ${location}`);
                    return prop.id;
                }
            }
            return 'PropertySystem not found';
        });

        // ═══════════════════════════════════════════════════════════════
        // 🔧 DEBUG UTILITIES
        // ═══════════════════════════════════════════════════════════════

        // gamestate - Show current game state
        this.registerCommand('gamestate', 'Show current game state', () => {
            if (typeof game !== 'undefined') {
                console.log('🎮 Game State:', JSON.stringify({
                    location: game.currentLocation,
                    day: game.day,
                    hour: game.hour,
                    player: game.player ? {
                        name: game.player.name,
                        gold: game.player.gold,
                        health: game.player.health
                    } : null
                }, null, 2));
            }
            return 'See console';
        });

        // reload - Reload the page
        this.registerCommand('reload', 'Reload the game', () => {
            location.reload();
        });

        // verifyeconomy - Verify circular economy chains
        this.registerCommand('verifyeconomy', 'Verify circular economy chains', () => {
            if (typeof UnifiedItemSystem !== 'undefined') {
                return UnifiedItemSystem.verifyAllChains();
            }
            return 'UnifiedItemSystem not found';
        });

        // ═══════════════════════════════════════════════════════════════
        // 🏆 ACHIEVEMENT CHEATS
        // ═══════════════════════════════════════════════════════════════

        // unlockachievement <id> - Unlock specific achievement
        this.registerCommand('unlockachievement', 'Unlock achievement: unlockachievement <id>', (args) => {
            const achievementId = args[0];
            if (!achievementId) {
                console.warn('🎮 Usage: unlockachievement <achievementId>');
                if (typeof AchievementSystem !== 'undefined') {
                    const locked = Object.keys(AchievementSystem.achievements).filter(id => !AchievementSystem.achievements[id].unlocked);
                    console.log('Locked achievements:', locked.join(', '));
                }
                return;
            }

            if (typeof AchievementSystem !== 'undefined') {
                const achievement = AchievementSystem.achievements[achievementId];
                if (achievement) {
                    if (achievement.unlocked) {
                        console.log(`🏆 Achievement "${achievement.name}" already unlocked`);
                        return 'Already unlocked';
                    }
                    AchievementSystem.unlockAchievement(achievementId);
                    return achievement.name;
                } else {
                    console.warn(`🏆 Achievement not found: ${achievementId}`);
                }
            }
            return 'AchievementSystem not found';
        });

        // testachievement - Test achievement popup with multiple achievements
        this.registerCommand('testachievement', 'Test achievement popup (unlocks 3 random locked achievements)', () => {
            if (typeof AchievementSystem === 'undefined') {
                console.warn('🎮 AchievementSystem not found');
                return;
            }

            // Find 3 locked achievements
            const locked = Object.values(AchievementSystem.achievements).filter(a => !a.unlocked);
            if (locked.length === 0) {
                console.log('🏆 All achievements already unlocked!');
                return 'All unlocked';
            }

            // Pick up to 3 random locked achievements
            const toUnlock = [];
            const shuffled = [...locked].sort(() => Math.random() - 0.5);
            for (let i = 0; i < Math.min(3, shuffled.length); i++) {
                toUnlock.push(shuffled[i]);
            }

            // Mark them as unlocked and queue for popup
            toUnlock.forEach(a => {
                a.unlocked = true;
                a.unlockedAt = Date.now();
            });

            AchievementSystem.saveProgress();
            AchievementSystem.queueAchievementPopups(toUnlock);

            console.log(`🏆 Testing popup with ${toUnlock.length} achievements: ${toUnlock.map(a => a.name).join(', ')}`);
            return `${toUnlock.length} achievements`;
        });

        // listachievements - List all achievements
        this.registerCommand('listachievements', 'List all achievements', () => {
            if (typeof AchievementSystem !== 'undefined') {
                const all = Object.values(AchievementSystem.achievements);
                const unlocked = all.filter(a => a.unlocked);
                const locked = all.filter(a => !a.unlocked);
                console.log(`🏆 Achievements: ${unlocked.length}/${all.length} unlocked`);
                console.log('Unlocked:', unlocked.map(a => a.name).join(', ') || 'None');
                console.log('Locked:', locked.map(a => a.id).join(', ') || 'None');
                return `${unlocked.length}/${all.length}`;
            }
            return 'AchievementSystem not found';
        });

        // resetachievements - Reset all achievements
        this.registerCommand('resetachievements', 'Reset all achievements', () => {
            if (typeof AchievementSystem !== 'undefined') {
                AchievementSystem.reset();
                console.log('🏆 All achievements reset!');
                return 'Reset complete';
            }
            return 'AchievementSystem not found';
        });

        // unlockall - Unlock ALL achievements (including Super Hacker)
        this.registerCommand('unlockall', 'Unlock ALL achievements (triggers Super Hacker!)', () => {
            if (typeof AchievementSystem === 'undefined') {
                console.warn('🎮 AchievementSystem not found');
                return 'AchievementSystem not found';
            }

            console.log('🏆 Unlocking ALL achievements...');
            const allAchievements = Object.values(AchievementSystem.achievements);
            let unlockCount = 0;

            // Unlock all achievements except super_hacker first
            for (const achievement of allAchievements) {
                if (!achievement.unlocked && achievement.id !== 'super_hacker') {
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    AchievementSystem.grantAchievementRewards(achievement);
                    unlockCount++;
                    console.log(`  ✅ ${achievement.name}`);
                }
            }

            // Save progress
            AchievementSystem.saveProgress();

            // Now check for Super Hacker - it should unlock since all others are done
            AchievementSystem.checkAchievements();

            console.log('═══════════════════════════════════════════════════');
            console.log(`🏆 Unlocked ${unlockCount} achievements!`);
            console.log('💻 Super Hacker should now be unlocked!');
            console.log('🔓 Debug commands will remain available on this save!');
            console.log('🗡️ Check your inventory for the Blade of the Hacker!');
            console.log('═══════════════════════════════════════════════════');

            return `${unlockCount} achievements unlocked!`;
        });

        // ═══════════════════════════════════════════════════════════════
        // 🏆 LEADERBOARD CHEATS
        // ═══════════════════════════════════════════════════════════════

        // clearleaderboard - Reset the Hall of Champions to empty
        this.registerCommand('clearleaderboard', 'Clear all entries from the Hall of Champions', async () => {
            console.log('🏆 Clearing Hall of Champions...');

            // Check both global and window scope
            const resetFn = window.resetLeaderboard || (typeof resetLeaderboard === 'function' ? resetLeaderboard : null);

            if (resetFn) {
                console.log('🏆 Found resetLeaderboard function, calling it...');
                try {
                    const result = await resetFn();
                    if (result) {
                        console.log('✅ Hall of Champions has been cleared!');
                        return '🏆 Leaderboard cleared! The Hall of Champions is now empty.';
                    } else {
                        console.error('❌ Failed to clear leaderboard - function returned false');
                        return '❌ Failed to clear leaderboard. Check console for details.';
                    }
                } catch (error) {
                    console.error('❌ Error clearing leaderboard:', error);
                    return '❌ Error: ' + error.message;
                }
            } else {
                console.error('❌ resetLeaderboard function not found on window or global scope');
                console.log('Available on window:', typeof window.resetLeaderboard);
                return '❌ resetLeaderboard function not found';
            }
        });

        // refreshleaderboard - Force refresh the leaderboard display
        this.registerCommand('refreshleaderboard', 'Force refresh the Hall of Champions display', async () => {
            console.log('🏆 Refreshing Hall of Champions...');

            if (typeof GlobalLeaderboardSystem !== 'undefined') {
                await GlobalLeaderboardSystem.refresh();
                console.log('✅ Leaderboard refreshed!');
                return 'Refreshed!';
            }
            return 'GlobalLeaderboardSystem not found';
        });

        // showleaderboard - Show current leaderboard entries in console
        this.registerCommand('showleaderboard', 'Show all leaderboard entries in console', () => {
            if (typeof GlobalLeaderboardSystem !== 'undefined') {
                const entries = GlobalLeaderboardSystem.leaderboard || [];
                console.log(`🏆 Hall of Champions (${entries.length} entries):`);
                entries.forEach((entry, i) => {
                    console.log(`  ${i + 1}. ${entry.playerName || 'Unknown'} - ${entry.score || 0} gold, ${entry.daysSurvived || 0} days ${entry.isAlive ? '💚' : '💀'}`);
                });
                return `${entries.length} entries`;
            }
            return 'GlobalLeaderboardSystem not found';
        });

        // ═══════════════════════════════════════════════════════════════
        // 🎭 NPC ENCOUNTER CHEATS
        // ═══════════════════════════════════════════════════════════════

        // encounter - Spawn random encounter
        this.registerCommand('encounter', 'Spawn random encounter: encounter [type]', (args) => {
            const type = args[0];
            if (typeof NPCEncounterSystem !== 'undefined') {
                const encounter = NPCEncounterSystem.spawnRandomEncounter('road', type || null);
                if (encounter) {
                    console.log(`🎭 Spawned ${encounter.type} encounter`);
                    return encounter.type;
                }
                return 'Failed to spawn';
            }
            return 'NPCEncounterSystem not found';
        });

        // trader - Spawn random trader encounter (traveler with inventory)
        this.registerCommand('trader', 'Spawn random trader encounter', () => {
            if (typeof NPCEncounterSystem !== 'undefined') {
                const encounter = NPCEncounterSystem.spawnRandomEncounter('road', 'traveler');
                if (encounter) {
                    console.log('🎭 Spawned trader encounter');
                    console.log('💰 Time paused for encounter');
                    return 'Trader spawned!';
                }
                return 'Failed to spawn';
            }
            return 'NPCEncounterSystem not found';
        });

        // merchant - Spawn merchant encounter
        this.registerCommand('merchant', 'Spawn merchant encounter', () => {
            if (typeof NPCEncounterSystem !== 'undefined') {
                const encounter = NPCEncounterSystem.spawnRandomEncounter('road', 'merchant');
                if (encounter) {
                    console.log('🎭 Spawned merchant encounter');
                    return 'Merchant spawned!';
                }
                return 'Failed to spawn';
            }
            return 'NPCEncounterSystem not found';
        });

        // smuggler - Spawn smuggler encounter
        this.registerCommand('smuggler', 'Spawn smuggler encounter (rare items)', () => {
            if (typeof NPCEncounterSystem !== 'undefined') {
                const encounter = NPCEncounterSystem.spawnRandomEncounter('road', 'smuggler');
                if (encounter) {
                    console.log('🎭 Spawned smuggler encounter');
                    return 'Smuggler spawned!';
                }
                return 'Failed to spawn';
            }
            return 'NPCEncounterSystem not found';
        });

        // listnpctypes - List all NPC encounter types
        this.registerCommand('listnpctypes', 'List all NPC encounter types', () => {
            if (typeof NPCEncounterSystem !== 'undefined') {
                const types = NPCEncounterSystem.encounterTypes;
                console.log('🎭 Road encounters:');
                console.log('  Friendly:', types.road?.friendly?.map(e => e.type).join(', '));
                console.log('  Neutral:', types.road?.neutral?.map(e => e.type).join(', '));
                console.log('  Hostile:', types.road?.hostile?.map(e => e.type).join(', '));
                return 'See console';
            }
            return 'NPCEncounterSystem not found';
        });

        console.log(`🎮 Registered ${Object.keys(this.commands).length} commands`);
    },

    // Helper: Add gold to personal inventory only
    addGoldCheat(amount) {
        // Use GoldManager as the single source of truth
        // GoldManager.addGold will update game.player.gold automatically

        if (typeof GoldManager !== 'undefined') {
            GoldManager.addGold(amount, 'cheat');
        } else if (typeof game !== 'undefined' && game.player) {
            // Fallback if GoldManager not available
            game.player.gold = (game.player.gold || 0) + amount;
        }

        // Sync game.player.gold with GoldManager (in case they're out of sync)
        if (typeof game !== 'undefined' && game.player && typeof GoldManager !== 'undefined') {
            game.player.gold = GoldManager.getGold();

            // Update inventory gold reference too
            if (game.player.inventory) {
                game.player.inventory.gold = game.player.gold;
            }
        }

        // Update displays
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof updateInventoryDisplay === 'function') updateInventoryDisplay();

        const totalGold = typeof GoldManager !== 'undefined' ? GoldManager.getGold() : (game?.player?.gold || 0);
        console.log(`💰 Added ${amount} gold! Total: ${totalGold}`);
        return totalGold;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 UNIVERSAL GOLD MANAGER - Track gold across all sources
// ═══════════════════════════════════════════════════════════════

const UniversalGoldManager = {
    // Get gold from personal inventory
    getPersonalGold() {
        if (typeof GoldManager !== 'undefined') {
            return GoldManager.getGold();
        }
        return game?.player?.gold || 0;
    },

    // Get gold from all property storage
    getStorageGold() {
        let storageGold = 0;

        if (typeof PropertySystem !== 'undefined' && PropertySystem.properties) {
            for (const property of PropertySystem.properties) {
                if (property.storage && property.storage.gold) {
                    storageGold += property.storage.gold;
                }
            }
        }

        return storageGold;
    },

    // Get gold from employee inventories
    getEmployeeGold() {
        let employeeGold = 0;

        if (typeof EmployeeSystem !== 'undefined' && EmployeeSystem.employees) {
            for (const employee of EmployeeSystem.employees) {
                if (employee.inventory && employee.inventory.gold) {
                    employeeGold += employee.inventory.gold;
                }
            }
        }

        return employeeGold;
    },

    // Get TOTAL gold from all sources
    getTotalGold() {
        return this.getPersonalGold() + this.getStorageGold() + this.getEmployeeGold();
    },

    // Show gold breakdown
    showAllGold() {
        const personal = this.getPersonalGold();
        const storage = this.getStorageGold();
        const employee = this.getEmployeeGold();
        const total = personal + storage + employee;

        console.log('═══════════════════════════════════════════════════');
        console.log('💰 UNIVERSAL GOLD REPORT');
        console.log('═══════════════════════════════════════════════════');
        console.log(`  💼 Personal Inventory: ${personal.toLocaleString()} gold`);
        console.log(`  🏠 Property Storage:   ${storage.toLocaleString()} gold`);
        console.log(`  👥 Employee Holdings:  ${employee.toLocaleString()} gold`);
        console.log('───────────────────────────────────────────────────');
        console.log(`  💎 TOTAL WEALTH:       ${total.toLocaleString()} gold`);
        console.log('═══════════════════════════════════════════════════');

        return total;
    },

    // Set personal gold
    setPersonalGold(amount, reason = '') {
        if (typeof GoldManager !== 'undefined') {
            GoldManager.setGold(amount, reason);
        }
        if (typeof game !== 'undefined' && game.player) {
            game.player.gold = amount;
            if (game.player.inventory) {
                game.player.inventory.gold = amount;
            }
        }
        return amount;
    },

    // Add gold to personal inventory
    addPersonalGold(amount, reason = '') {
        const current = this.getPersonalGold();
        return this.setPersonalGold(current + amount, reason);
    },

    // Remove gold - tries personal first, then storage
    removeGold(amount, reason = '') {
        let remaining = amount;

        // First, try to take from personal inventory
        const personal = this.getPersonalGold();
        if (personal >= remaining) {
            this.setPersonalGold(personal - remaining, reason);
            console.log(`💸 Removed ${amount} gold from personal inventory`);
            return true;
        } else if (personal > 0) {
            remaining -= personal;
            this.setPersonalGold(0, reason);
            console.log(`💸 Removed ${personal} gold from personal inventory`);
        }

        // Then, try to take from property storage
        if (typeof PropertySystem !== 'undefined' && PropertySystem.properties) {
            for (const property of PropertySystem.properties) {
                if (remaining <= 0) break;

                if (property.storage && property.storage.gold > 0) {
                    const storageGold = property.storage.gold;
                    if (storageGold >= remaining) {
                        property.storage.gold -= remaining;
                        console.log(`💸 Removed ${remaining} gold from ${property.type} storage`);
                        remaining = 0;
                    } else {
                        remaining -= storageGold;
                        property.storage.gold = 0;
                        console.log(`💸 Removed ${storageGold} gold from ${property.type} storage`);
                    }
                }
            }
        }

        if (remaining > 0) {
            console.warn(`💸 Could not remove all gold! Still need ${remaining}`);
            return false;
        }

        return true;
    },

    // Can afford check using all sources
    canAfford(amount) {
        return this.getTotalGold() >= amount;
    },

    // Deposit gold to property storage
    depositToStorage(propertyId, amount) {
        const personal = this.getPersonalGold();
        if (personal < amount) {
            console.warn('💰 Not enough personal gold to deposit');
            return false;
        }

        if (typeof PropertySystem !== 'undefined') {
            const property = PropertySystem.properties?.find(p => p.id === propertyId);
            if (property) {
                if (!property.storage) property.storage = {};
                property.storage.gold = (property.storage.gold || 0) + amount;
                this.setPersonalGold(personal - amount, 'deposit to storage');
                console.log(`💰 Deposited ${amount} gold to ${property.type}`);
                return true;
            }
        }
        return false;
    },

    // Withdraw gold from property storage
    withdrawFromStorage(propertyId, amount) {
        if (typeof PropertySystem !== 'undefined') {
            const property = PropertySystem.properties?.find(p => p.id === propertyId);
            if (property && property.storage && property.storage.gold >= amount) {
                property.storage.gold -= amount;
                this.addPersonalGold(amount, 'withdraw from storage');
                console.log(`💰 Withdrew ${amount} gold from ${property.type}`);
                return true;
            }
        }
        return false;
    }
};

// Expose globally
window.DebugCommandSystem = DebugCommandSystem;
window.UniversalGoldManager = UniversalGoldManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => DebugCommandSystem.init(), 500);
    });
} else {
    setTimeout(() => DebugCommandSystem.init(), 500);
}

console.log('🎮 Debug Command System loaded!');
