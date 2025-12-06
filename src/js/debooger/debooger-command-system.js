// ═══════════════════════════════════════════════════════════════
// DEBOOGER COMMAND SYSTEM - bending reality with dark commands
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('🎮 Debooger Command System loading...');

const DeboogerCommandSystem = {
    // 🖤 Is the command input currently focused? Reality bends to our will
    isInputFocused: false,

    // 🦇 Command history for up/down arrow navigation - remembering our sins
    commandHistory: [],
    historyIndex: -1,

    // 🔮 Available commands - the keys to breaking reality
    commands: {},

    // 💀 Initialize the system - awaken the chaos engine
    init() {
        console.log('🎮 Debooger Command System initializing...');

        // 🔌 Wire up the command input UI - connecting to the void
        this.wireUpCommandInput();

        // ⌨️ Setup keyboard listener (disabled - button only now, peasants must click)
        this.setupKeyboardListener();

        // 🗡️ Register built-in commands - loading our arsenal of reality-warping cheats
        this.registerBuiltInCommands();

        // 🦇 Show registered command count - behold our weapon collection
        const cmdCount = Object.keys(this.commands).length;
        console.log(`🎮 Debooger Command System ready! ${cmdCount} commands registered.`);
        console.log('🎮 Commands:', Object.keys(this.commands).join(', '));
    },

    // 🖤 Track retry attempts for wiring up command input
    _wireUpRetries: 0,
    _maxWireUpRetries: 10,

    // 🔧 Wire up event listeners for command input - binding reality to our interface
    wireUpCommandInput() {
        const input = document.getElementById('debooger-command-input');
        const executeBtn = document.getElementById('debooger-command-execute');
        const helpBtn = document.getElementById('debooger-command-help');

        if (!input) {
            this._wireUpRetries++;
            if (this._wireUpRetries < this._maxWireUpRetries) {
                console.warn(`🎮 Command input not found, retry ${this._wireUpRetries}/${this._maxWireUpRetries}...`);
                setTimeout(() => this.wireUpCommandInput(), 500);
            } else {
                console.warn('🎮 Command input not found after max retries - debooger console HTML may be missing');
            }
            return;
        }

        // 🧬 Remove any existing listeners by cloning - purge the old, embrace the new
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // 🎯 Add event listeners to the fresh input - wire up our control mechanism
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

    // 💀 Backtick key binding REMOVED - no keyboard shortcut for the Debooger
    // Users must click the button to open/focus the Debooger console
    setupKeyboardListener() {
        // 🖤 Intentionally empty - the Debooger is button-only now
        // No secret keyboard shortcuts for the peasants
    },

    // ⌨️ Handle input keydown events - capturing your keystrokes like souls 🖤
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

    // ⬆️⬇️ Navigate command history - time travel through your cheating past 🦇
    navigateHistory(direction) {
        const input = document.getElementById('debooger-command-input');
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

    // 🔮 Autocomplete command names - lazy typing for the morally flexible
    autocomplete() {
        const input = document.getElementById('debooger-command-input');
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

    // ⚡ Execute the current command in the input - reality bends NOW 💀
    executeCurrentCommand() {
        const input = document.getElementById('debooger-command-input');
        if (!input) return;

        const commandText = input.value.trim();
        if (!commandText) return;

        // 📜 Add to history - never forget what we've done
        this.commandHistory.unshift(commandText);
        if (this.commandHistory.length > 50) {
            this.commandHistory.pop();
        }
        this.historyIndex = -1;

        // 🧹 Clear input - clean slate for the next sin
        input.value = '';

        // 🔥 Execute - LET CHAOS REIGN
        this.execute(commandText);
    },

    // 🔒 Check if debooger commands are enabled - CONFIG IS THE MASTER SWITCH 🖤💀
    isDeboogerEnabled() {
        // ⚙️ GameConfig.debooger.enabled is THE ONLY authority - no fallbacks, no overrides
        // 🖤 Config says yes? Debooger enabled. Config says no? Debooger DEAD. Period. 💀
        if (typeof GameConfig !== 'undefined' && GameConfig.debooger) {
            return GameConfig.debooger.enabled === true;
        }

        // 🔒 If config not loaded, default to FALSE for safety - no sneaky unlocks 🦇
        return false;
    },

    // 🗡️ Execute a command string (supports async commands) - bend reality to your will
    async execute(commandText) {
        console.log(`🎮 > ${commandText}`);

        // 🔐 Check if debooger is locked out - gatekeeping the dark power 🦇
        if (!this.isDeboogerEnabled()) {
            // 📖 Allow only 'help' command when locked out - mortals can read, not act
            const cmdLower = commandText.trim().toLowerCase();
            if (cmdLower !== 'help' && !cmdLower.startsWith('help')) {
                console.warn('🔒 Debooger commands are DISABLED 💀 Set GameConfig.debooger.enabled = true to unlock the darkness.');
                if (typeof GameConfig !== 'undefined' && GameConfig.debooger?.showConsoleWarnings) {
                    console.log('🔒 Production build vibes - debooger is sealed away 🦇');
                }
                return;
            }
        }

        // 📋 Parse command and arguments - deconstructing your intent
        const parts = commandText.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        // 🔍 Find and execute command - seeking the power you crave
        const command = this.commands[commandName];
        if (command) {
            try {
                // ⏳ Await the result in case it's an async command - patience for power
                const result = await command.handler(args);
                if (result !== undefined) {
                    console.log(`🎮 Result: ${result}`);
                }
            } catch (error) {
                // 🦇 Debooger command crashed - even dark lords stumble 💀
                console.warn(`🎮 Command failed: ${error.message}`);
            }
        } else {
            console.warn(`🎮 Unknown command: ${commandName}. Type 'help' for available commands.`);
        }
    },

    // 📝 Register a command - adding weapons to our arsenal
    registerCommand(name, description, handler) {
        this.commands[name.toLowerCase()] = {
            name,
            description,
            handler
        };
        console.log(`🎮 Registered command: ${name}`);
    },

    // 📖 Show help - revealing the forbidden knowledge
    showHelp() {
        const isEnabled = this.isDeboogerEnabled();

        console.log('═══════════════════════════════════════════════════');
        console.log('🎮 DEBOOGER COMMAND SYSTEM - Available Commands:');
        if (!isEnabled) {
            console.log('🔒 STATUS: LOCKED - Debooger commands disabled in config.js');
        } else {
            console.log('🔓 STATUS: UNLOCKED - Debooger commands active');
        }
        console.log('═══════════════════════════════════════════════════');

        for (const [name, cmd] of Object.entries(this.commands)) {
            console.log(`  ${name} - ${cmd.description}`);
        }

        console.log('═══════════════════════════════════════════════════');
        console.log('💡 Tips:');
        console.log('  - Click Debooger button to open console');
        console.log('  - Press Enter to execute command');
        console.log('  - Press Up/Down to navigate history');
        console.log('  - Press Tab to autocomplete');
        if (!isEnabled) {
            console.log('🔒 Debooger is DISABLED. Set GameConfig.debooger.enabled = true');
        }
        console.log('═══════════════════════════════════════════════════');
    },

    // 🗡️ Register built-in commands - loading the reality-breaking toolbox
    registerBuiltInCommands() {
        // 📖 Help command - reveal the dark arts
        this.registerCommand('help', 'Show all available commands - reveal your power', () => {
            this.showHelp();
        });

        // 🧹 Clear console - wipe away the evidence of our sins
        this.registerCommand('clear', 'Clear the Debooger console - fresh slate for chaos', () => {
            const content = document.getElementById('debooger-console-content');
            if (content) content.innerHTML = '';
            console.log('🎮 Debooger console cleared');
        });

        // ═══════════════════════════════════════════════════════════════
        // 💰 GOLD/MONEY CHEATS - summoning wealth from the void 🖤
        // ═══════════════════════════════════════════════════════════════

        // 💸 geecashnow - Classic cheat code to manifest 1000 gold from thin air
        this.registerCommand('geecashnow', '💰 Conjure 1000 gold from the void - because we deserve it 🔮', () => {
            return this.addGoldCheat(1000);
        });

        // 💎 givegold <amount> - Summon specific amounts of filthy lucre
        this.registerCommand('givegold', '💰 Summon gold: givegold <amount> - greed made manifest 🖤', (args) => {
            const amount = parseInt(args[0]) || 100;
            return this.addGoldCheat(amount);
        });

        // 🎯 setgold <amount> - Rewrite reality to set exact gold amount
        this.registerCommand('setgold', '💰 Set gold to exact amount: setgold <amount> - ultimate control 💀', (args) => {
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

        // 💎 showgold - Reveal your entire hoard across all dimensions
        this.registerCommand('showgold', '💰 Reveal ALL your gold sources - count your wealth 🖤', () => {
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
        // 🎒 INVENTORY CHEATS - materialization of desires 💀
        // ═══════════════════════════════════════════════════════════════

        // 📦 giveitem <itemId> <quantity> - Manifest items from nothing
        this.registerCommand('giveitem', '🎒 Manifest items: giveitem <itemId> [quantity] - creation from void 🦇', (args) => {
            const itemId = args[0];
            const quantity = parseInt(args[1]) || 1;

            if (!itemId) {
                console.warn('🎮 Usage: giveitem <itemId> [quantity]');
                return 'Usage: giveitem <itemId> [quantity]';
            }

            // 🎯 Always use game.player.inventory directly for reliability - direct manipulation
            if (typeof game !== 'undefined' && game.player && game.player.inventory) {
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + quantity;
                console.log(`🎒 Added ${quantity}x ${itemId}`);
                // 🔄 Update display if function exists - show off our ill-gotten gains
                if (typeof InventorySystem !== 'undefined' && InventorySystem.updateInventoryDisplay) {
                    InventorySystem.updateInventoryDisplay();
                }
                return `Added ${quantity}x ${itemId}`;
            }

            console.warn('🎮 No player inventory available');
            return 'No player inventory available';
        });

        // 📋 listitems - Catalogue of everything that exists in this world
        this.registerCommand('listitems', '📋 List all item IDs - the complete catalogue of existence 🔮', () => {
            if (typeof ItemDatabase !== 'undefined' && ItemDatabase.items) {
                const items = Object.keys(ItemDatabase.items);
                console.log('📦 Available items:', items.join(', '));
                return `${items.length} items`;
            }
            return 'ItemDatabase not found';
        });

        // 🧹 clearinventory - Purge everything you own into the void
        this.registerCommand('clearinventory', '🎒 PURGE inventory - void everything you own 💀', () => {
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
        // 👤 PLAYER CHEATS - godmode for mortals 🖤
        // ═══════════════════════════════════════════════════════════════

        // ❤️ heal - Instant recovery from death's door
        this.registerCommand('heal', '❤️ Full heal - death retreats before your power 🦇', () => {
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

        // 📊 setstat <stat> <value> - Rewrite your character sheet
        this.registerCommand('setstat', '📊 Set stat: setstat <stat> <value> - rewrite your existence 💀', (args) => {
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
        // 🗺️ WORLD/TRAVEL CHEATS - bending space to our will 🔮
        // ═══════════════════════════════════════════════════════════════

        // 🌀 teleport <locationId> - Instant spatial manipulation
        this.registerCommand('teleport', '🗺️ Teleport: teleport <locationId> - fold space like paper 🖤', (args) => {
            const locationId = args[0];
            if (!locationId) {
                console.warn('🎮 Usage: teleport <locationId>');
                if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
                    console.log('🗺️ Available locations:', Object.keys(TravelSystem.locations).join(', '));
                }
                return;
            }

            // 🌀 Warp reality to place you elsewhere
            if (typeof TravelSystem !== 'undefined' && TravelSystem.setPlayerLocation) {
                TravelSystem.setPlayerLocation(locationId);
                console.log(`🗺️ Teleported to ${locationId}`);
            } else if (typeof game !== 'undefined') {
                game.currentLocation = locationId;
                console.log(`🗺️ Location set to ${locationId}`);
            }
            return locationId;
        });

        // 📍 listlocations - Map of the entire realm
        this.registerCommand('listlocations', '🗺️ List all locations - the complete world map 🦇', () => {
            if (typeof TravelSystem !== 'undefined' && TravelSystem.locations) {
                const locs = Object.keys(TravelSystem.locations);
                console.log('🗺️ Available locations:', locs.join(', '));
                return `${locs.length} locations`;
            }
            return 'TravelSystem not found';
        });

        // 🌍 revealmap - Tear away the fog of war, expose EVERYTHING (world-specific!)
        this.registerCommand('revealmap', '🗺️ Reveal ENTIRE map for CURRENT world - rip away the fog of war 💀', () => {
            // 🖤 Rip away the fog of war - but only for the world you're in!
            let locationCount = 0;
            const inDoom = typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld();
            const worldName = inDoom ? 'DOOM WORLD' : 'NORMAL WORLD';

            // 🔍 Get all location IDs from GameWorld - extracting every secret
            if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
                const allLocationIds = Object.keys(GameWorld.locations);
                locationCount = allLocationIds.length;

                if (inDoom) {
                    // 🖤💀 In doom world - only reveal doom visited locations
                    GameWorld.doomVisitedLocations = [...allLocationIds];
                    console.log(`💀 Revealed ${locationCount} locations in DOOM WORLD`);
                } else {
                    // 🌍 In normal world - reveal normal visited locations
                    GameWorld.visitedLocations = [...allLocationIds];
                    console.log(`🗺️ Revealed ${locationCount} locations in NORMAL WORLD`);
                }
            }

            // 🔄 Also update game.visitedLocations if it exists - complete omniscience
            if (typeof game !== 'undefined' && game.visitedLocations !== undefined && !inDoom) {
                if (typeof GameWorld !== 'undefined' && GameWorld.locations) {
                    game.visitedLocations = Object.keys(GameWorld.locations);
                }
            }

            // 🎨 Re-render the map to show all locations - make it visible
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.render) {
                GameWorldRenderer.render();
                console.log('🗺️ Map re-rendered with all locations visible');
            }

            // 🔄 Also refresh travel panel if open - update all the things
            if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
                TravelPanelMap.render();
            }

            console.log(`🗺️ The fog of war has been lifted in ${worldName}! All locations revealed.`);
            return `${inDoom ? '💀' : '🗺️'} Revealed ${locationCount} locations in ${worldName}`;
        });

        // 🌑 hidemap - Restore the fog of war, bring back the mystery (world-specific!)
        this.registerCommand('hidemap', '🗺️ Hide map for CURRENT world - restore the fog of war, embrace darkness 🖤', () => {
            // 🖤 Bring back the darkness - but only for the world you're in!
            const inDoom = typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld();
            const worldName = inDoom ? 'DOOM WORLD' : 'NORMAL WORLD';
            const currentLoc = game?.currentLocation?.id || (inDoom ? 'shadow_dungeon' : 'greendale');

            if (typeof GameWorld !== 'undefined') {
                if (inDoom) {
                    // 🖤💀 In doom world - reset doom visited to just current location
                    GameWorld.doomVisitedLocations = [currentLoc];
                    console.log(`💀 Doom map reset to: ${currentLoc}`);
                } else {
                    // 🌍 In normal world - reset normal visited locations
                    GameWorld.visitedLocations = [currentLoc];
                    console.log(`🗺️ Normal map reset to: ${currentLoc}`);
                }
            }

            // 🔄 Sync game state with the darkness (normal world only)
            if (typeof game !== 'undefined' && game.visitedLocations !== undefined && !inDoom) {
                game.visitedLocations = [currentLoc];
            }

            // 🎨 Re-render with darkness restored
            if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.render) {
                GameWorldRenderer.render();
            }

            if (typeof TravelPanelMap !== 'undefined' && TravelPanelMap.render) {
                TravelPanelMap.render();
            }

            console.log(`🗺️ The fog of war returns to ${worldName}... only current location visible.`);
            return `${inDoom ? '💀' : '🗺️'} ${worldName} map reset to ${currentLoc}`;
        });

        // ═══════════════════════════════════════════════════════════════
        // ⏰ TIME CHEATS - bend the flow of time itself 🔮
        // ═══════════════════════════════════════════════════════════════

        // ⏩ skipday - Fast-forward through time like a god
        this.registerCommand('skipday', '⏰ Skip 1 day - manipulate time without consequences 🦇', () => {
            if (typeof TimeMachine !== 'undefined' && TimeMachine.skipDays) {
                const result = TimeMachine.skipDays(1, true);
                console.log(`⏩ Skipped to ${result}`);
                return result;
            }
            return 'TimeMachine not found';
        });

        // ⏩ skipdays <n> - Leap through time in giant bounds
        this.registerCommand('skipdays', '⏰ Skip N days: skipdays <days> - time acceleration 💀', (args) => {
            const days = parseInt(args[0]) || 7;
            if (typeof TimeMachine !== 'undefined' && TimeMachine.skipDays) {
                const result = TimeMachine.skipDays(days, true);
                console.log(`⏩ Skipped ${days} days to ${result}`);
                return result;
            }
            return 'TimeMachine not found';
        });

        // 📅 skipmonth - Compress a month into an instant
        this.registerCommand('skipmonth', '⏰ Skip 1 month - seasons shift at your command 🖤', () => {
            if (typeof TimeMachine !== 'undefined' && TimeMachine.skipMonths) {
                const result = TimeMachine.skipMonths(1, true);
                console.log(`⏩ Skipped 1 month to ${result}`);
                return result;
            }
            return 'TimeMachine not found';
        });

        // 📆 skip6months - Half a year in the blink of an eye
        this.registerCommand('skip6months', '⏰ Skip 6 months - watch the seasons fly by 🦇', () => {
            if (typeof TimeMachine !== 'undefined' && TimeMachine.skipMonths) {
                const result = TimeMachine.skipMonths(6, true);
                console.log(`⏩ Skipped 6 months to ${result}`);
                return result;
            }
            return 'TimeMachine not found';
        });

        // 🗓️ skipmonths <n> - Custom time dilation
        this.registerCommand('skipmonths', '⏰ Skip N months: skipmonths <months> - time bends to you 💀', (args) => {
            const months = parseInt(args[0]) || 1;
            if (typeof TimeMachine !== 'undefined' && TimeMachine.skipMonths) {
                const result = TimeMachine.skipMonths(months, true);
                console.log(`⏩ Skipped ${months} month(s) to ${result}`);
                return result;
            }
            return 'TimeMachine not found';
        });

        // 🍂 setseason <season> - Command the seasons themselves
        this.registerCommand('setseason', '⏰ Jump to season: setseason <spring|summer|autumn|winter> 🔮', (args) => {
            const targetSeason = (args[0] || 'summer').toLowerCase();
            const seasonMonths = { spring: 4, summer: 7, autumn: 10, winter: 1 };

            if (!seasonMonths[targetSeason]) {
                console.warn('🎮 Valid seasons: spring, summer, autumn, winter');
                return 'Invalid season';
            }

            if (typeof TimeMachine !== 'undefined') {
                const currentMonth = TimeMachine.currentTime.month;
                const targetMonth = seasonMonths[targetSeason];

                // Calculate months to skip (always forward)
                let monthsToSkip = targetMonth - currentMonth;
                if (monthsToSkip <= 0) monthsToSkip += 12; // Wrap around to next year

                const result = TimeMachine.skipMonths(monthsToSkip, true);

                // Force backdrop reload
                if (typeof GameWorldRenderer !== 'undefined') {
                    GameWorldRenderer.currentSeason = null;
                    GameWorldRenderer.loadSeasonalBackdrop(targetSeason);
                }

                console.log(`🍂 Jumped to ${targetSeason}: ${result}`);
                return `Now in ${targetSeason}`;
            }
            return 'TimeMachine not found';
        });

        // showtime - Show current time and season
        this.registerCommand('showtime', 'Show current time and season info', () => {
            if (typeof TimeMachine !== 'undefined') {
                const info = TimeMachine.getTimeInfo();
                console.log('⏰ Current Time:', info.formatted);
                console.log(`🍂 Season: ${info.seasonData.icon} ${info.seasonData.name}`);
                console.log(`📊 Effects: Hunger ${info.seasonData.effects.hungerDrain}x, Thirst ${info.seasonData.effects.thirstDrain}x`);
                return info.formatted;
            }
            return 'TimeMachine not found';
        });

        // triggerbonanza - Trigger Dungeon Bonanza event (set date to July 18th)
        this.registerCommand('triggerbonanza', 'Set date to July 18th to trigger Dungeon Bonanza', () => {
            if (typeof TimeMachine !== 'undefined') {
                TimeMachine.currentTime.month = 7;
                TimeMachine.currentTime.day = 18;
                if (typeof DungeonBonanzaSystem !== 'undefined') {
                    DungeonBonanzaSystem.hasShownNotificationToday = false;
                    DungeonBonanzaSystem.showEventNotification();
                }
                console.log('💀 Date set to July 18th - The Dark Convergence begins!');
                return 'Dungeon Bonanza activated!';
            }
            return 'TimeMachine not found';
        });

        // bonanzastatus - Check if Dungeon Bonanza is active
        this.registerCommand('bonanzastatus', 'Check Dungeon Bonanza event status', () => {
            if (typeof DungeonBonanzaSystem !== 'undefined') {
                const status = DungeonBonanzaSystem.getEventStatus();
                if (status.active) {
                    console.log('💀 THE DARK CONVERGENCE IS ACTIVE!');
                    console.log(`   ${status.description}`);
                    return 'Event ACTIVE';
                } else {
                    console.log('🌙 Dungeon Bonanza is not active.');
                    console.log('   Next occurrence: July 18th');
                    return 'Event inactive';
                }
            }
            return 'DungeonBonanzaSystem not found';
        });

        // dungeonmode - Toggle dungeon backdrop manually
        this.registerCommand('dungeonmode', 'Toggle dungeon backdrop on/off', (args) => {
            if (typeof GameWorldRenderer !== 'undefined') {
                const mode = args[0] || 'toggle';
                if (mode === 'on' || (mode === 'toggle' && !GameWorldRenderer.isInDungeonMode)) {
                    GameWorldRenderer.enterDungeonMode();
                    return 'Dungeon backdrop enabled';
                } else {
                    GameWorldRenderer.exitDungeonMode();
                    return 'Dungeon backdrop disabled';
                }
            }
            return 'GameWorldRenderer not found';
        });

        // ═══════════════════════════════════════════════════════════════
        // 🌦️ WEATHER & SEASON CHEATS
        // ═══════════════════════════════════════════════════════════════

        // weather <type> - Set weather instantly (works on menu AND in-game)
        this.registerCommand('weather', 'Set weather: weather <storm|winter|thundersnow|autumn|spring|summer|clear|rain|snow|blizzard|fog|apocalypse|etc>', (args) => {
            const type = (args[0] || 'clear').toLowerCase();
            let results = [];

            // Map between game weather types and menu seasons
            const gameToMenuMap = {
                'storm': 'storm',
                'rain': 'storm',
                'snow': 'winter',
                'blizzard': 'winter',
                'thundersnow': 'thundersnow',
                'apocalypse': 'apocalypse',
                'clear': 'summer',
                'fog': 'autumn',
                'cloudy': 'autumn',
                'windy': 'autumn',
                'heatwave': 'summer'
            };

            // Try MenuWeatherSystem first (main menu)
            if (typeof MenuWeatherSystem !== 'undefined' && MenuWeatherSystem.isActive) {
                // Check if it's a direct menu season
                if (MenuWeatherSystem.seasons[type]) {
                    MenuWeatherSystem.changeSeason(type);
                    console.log(`🌦️ Menu weather set to: ${MenuWeatherSystem.seasons[type].name}`);
                    results.push(`Menu: ${MenuWeatherSystem.seasons[type].name}`);
                } else if (gameToMenuMap[type]) {
                    // Map game weather to menu season
                    const menuSeason = gameToMenuMap[type];
                    MenuWeatherSystem.changeSeason(menuSeason);
                    console.log(`🌦️ Menu weather set to: ${MenuWeatherSystem.seasons[menuSeason].name}`);
                    results.push(`Menu: ${MenuWeatherSystem.seasons[menuSeason].name}`);
                }
            }

            // Also try in-game WeatherSystem
            if (typeof WeatherSystem !== 'undefined') {
                // Map menu seasons to game weather
                const menuToGameMap = {
                    'storm': 'storm',
                    'winter': 'snow',
                    'thundersnow': 'thundersnow',
                    'autumn': 'windy',
                    'spring': 'clear',
                    'summer': 'clear'
                };

                let gameType = type;
                // If type is a menu season, map it to game weather
                if (menuToGameMap[type]) {
                    gameType = menuToGameMap[type];
                }

                if (WeatherSystem.weatherTypes[gameType]) {
                    WeatherSystem.changeWeather(gameType);
                    const weather = WeatherSystem.weatherTypes[gameType];
                    console.log(`🌦️ Game weather set to: ${weather.icon} ${weather.name}`);
                    results.push(`Game: ${weather.icon} ${weather.name}`);
                } else if (results.length === 0) {
                    // Only show error if menu also failed
                    console.log('🌦️ Valid types: storm, winter, thundersnow, autumn, spring, summer, clear, rain, snow, blizzard, fog, apocalypse');
                    return 'Invalid weather type';
                }
            }

            if (results.length === 0) {
                return 'No weather system found';
            }
            return results.join(' | ');
        });

        // doom - FULL DOOM WORLD TRANSPORT - Teleport to random dungeon + activate all doom systems
        this.registerCommand('doom', 'Enter DOOM WORLD: transport to random dungeon, full apocalypse mode', () => {
            let results = [];

            // 🖤 Pick random dungeon entry point
            const dungeons = ['shadow_dungeon', 'forest_dungeon'];
            const entryDungeon = dungeons[Math.floor(Math.random() * dungeons.length)];
            const doomName = entryDungeon === 'shadow_dungeon' ? 'The Shadow Throne' : 'Ruins of Malachar';

            console.log(`💀 DOOM COMMAND: Entering doom world at ${doomName}...`);

            // 🖤💀 Step 0: Get the FULL location object from GameWorld
            const entryLocation = GameWorld?.locations?.[entryDungeon];
            if (!entryLocation) {
                console.error(`💀 DOOM ERROR: Location ${entryDungeon} not found in GameWorld!`);
                return `💀 ERROR: Dungeon location ${entryDungeon} not found!`;
            }

            // 🖤💀 Step 0.5: Reset doom world visited locations - start fresh with ONLY entry dungeon explored!
            if (typeof GameWorld !== 'undefined') {
                GameWorld.resetDoomVisitedLocations(entryDungeon);
                results.push('Doom locations reset');
                console.log('💀 GameWorld.doomVisitedLocations reset to:', GameWorld.doomVisitedLocations);
            }

            // 🖤 Step 1: Transport player to dungeon location
            if (typeof TravelSystem !== 'undefined') {
                // 🦇 Clear doom discovered paths - start fresh, only entry point and its connections known
                TravelSystem.doomDiscoveredPaths = new Set();
                TravelSystem.doomDiscoveredPaths.add(entryDungeon);

                // 🖤💀 Also discover paths TO adjacent locations (so player can see where to go)
                if (entryLocation?.connections) {
                    entryLocation.connections.forEach(connId => {
                        // Add path to adjacent locations (but NOT the locations themselves - just paths)
                        TravelSystem.doomDiscoveredPaths.add(`${entryDungeon}->${connId}`);
                        TravelSystem.doomDiscoveredPaths.add(`${connId}->${entryDungeon}`);
                    });
                    console.log('💀 Discovered paths from entry:', Array.from(TravelSystem.doomDiscoveredPaths));
                }

                // 🖤 Switch world mode FIRST
                TravelSystem.currentWorld = 'doom';
                TravelSystem.saveCurrentWorld();
                TravelSystem.playerPosition.currentLocation = entryDungeon;
                results.push(`Transported to: ${doomName}`);
                console.log(`💀 TravelSystem switched to doom world at ${entryDungeon}`);
            }

            // 🖤💀 Step 1.5: PROPERLY SET game.currentLocation to FULL location object with doom name
            if (typeof game !== 'undefined') {
                // 🖤 Create doom version of location with corrupted name
                const doomLocName = DoomWorldNPCs?.locationNames?.[entryDungeon] || doomName;
                game.currentLocation = {
                    ...entryLocation,
                    name: doomLocName,
                    originalName: entryLocation.name
                };
                // 🖤 Also set the inDoomWorld flag
                game.inDoomWorld = true;
                console.log('💀 game.currentLocation set to:', game.currentLocation.name, game.currentLocation.id);
            }

            // 🖤 Step 2: Activate DoomWorldSystem if available
            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.isActive = true;
                DoomWorldSystem.entryDungeon = entryDungeon;
                DoomWorldSystem.hasEverEntered = true;
                // 🦇 Spawn boatman at BOTH dungeons - only way out!
                DoomWorldSystem.boatmanLocations.add('shadow_dungeon');
                DoomWorldSystem.boatmanLocations.add('forest_dungeon');
                DoomWorldSystem._spawnBoatman('shadow_dungeon');
                DoomWorldSystem._spawnBoatman('forest_dungeon');
                DoomWorldSystem._applyDoomEffects();
                DoomWorldSystem._saveState();
                results.push('DoomWorldSystem: active + Boatman spawned');
                console.log('💀 DoomWorldSystem activated, Boatman at both dungeons');
            }

            // 🖤 Step 3: Activate DoomWorldConfig (economy changes)
            if (typeof DoomWorldConfig !== 'undefined') {
                DoomWorldConfig.activate();
                results.push('DoomWorldConfig: active');
                console.log('💀 DoomWorldConfig activated - economy inverted');
            }

            // 🖤 Step 4: Set apocalypse weather
            if (typeof WeatherSystem !== 'undefined') {
                WeatherSystem.changeWeather('apocalypse');
                results.push('Weather: apocalypse');
                console.log('💀 Apocalypse weather activated');
            }

            // 🖤 Step 5: Activate doom backdrop for map
            if (typeof GameWorldRenderer !== 'undefined') {
                if (GameWorldRenderer.enterDungeonMode) {
                    GameWorldRenderer.enterDungeonMode();
                }
                // 🖤💀 CRITICAL: Re-render the map to show doom world state!
                if (GameWorldRenderer.render) {
                    GameWorldRenderer.render();
                }
                if (GameWorldRenderer.updatePlayerMarker) {
                    GameWorldRenderer.updatePlayerMarker();
                }
                // 🖤💀 CENTER MAP ON PLAYER LOCATION
                if (GameWorldRenderer.centerOnLocation) {
                    GameWorldRenderer.centerOnLocation(entryDungeon);
                } else if (GameWorldRenderer.centerOnPlayer) {
                    GameWorldRenderer.centerOnPlayer();
                }
                results.push('Backdrop: doom');
                console.log('💀 Doom backdrop + map re-rendered + centered on player');
            }

            // 🖤 Step 6: Show doom world messages
            if (typeof game !== 'undefined' && game.addMessage) {
                game.addMessage('💀 THE DOOM WORLD - You have crossed into the apocalypse.', 'danger');
                game.addMessage(`📍 You emerged at ${doomName}. All other locations are unexplored.`, 'warning');
                game.addMessage('⚠️ Gold is worthless here. Trade survival items to survive.', 'warning');
                game.addMessage('⛵ The Boatman awaits at both dungeons to ferry you back.', 'info');
            }

            // 🖤 Step 7: Register doom quests and start intro quest
            if (typeof DoomQuestSystem !== 'undefined') {
                DoomQuestSystem.registerDoomQuests();
                DoomQuestSystem.startIntroQuest();
                results.push('Doom quests registered');
            }

            // 🖤 Step 8: Mark doom entry for quest system
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem._hasEnteredDoomWorld = true;
            }
            localStorage.setItem('mtg_hasEnteredDoom', 'true');

            // 🖤 Step 9: Refresh ALL panels to show doom state
            if (typeof PeoplePanel !== 'undefined') {
                PeoplePanel.refresh?.();
            }
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem.updateQuestLogUI?.();
                QuestSystem.updateQuestTracker?.();
            }
            if (typeof TravelPanelMap !== 'undefined') {
                TravelPanelMap.render?.();
            }

            // 🖤💀 Step 10: Play doom arrival narration
            if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.playDoomArrivalVoice) {
                setTimeout(() => DoomWorldSystem.playDoomArrivalVoice(), 1500);
            }

            // 🖤💀 Emit world change event for any listeners
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('worldChanged', { world: 'doom', entryLocation: entryDungeon });
                EventBus.emit('doom:entered', { entryLocation: entryDungeon, doomLocation: doomName });
            }

            if (results.length > 0) {
                return `💀 ENTERED DOOM WORLD at ${doomName}! | ` + results.join(' | ');
            }
            return '💀 Doom world activated, but some systems were missing';
        });

        // 🖤 exitdoom - Return to normal world from doom AT CURRENT LOCATION
        this.registerCommand('exitdoom', 'Exit DOOM WORLD: return to normal world at current location', () => {
            if (typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld()) {
                // 🖤 Get CURRENT location - wherever player is now in doom world
                const currentLocationId = game?.currentLocation?.id ||
                                          TravelSystem?.playerPosition?.currentLocation ||
                                          'greendale';

                // 🦇 Get the FULL normal world location object
                const normalLocation = GameWorld?.locations?.[currentLocationId];
                const normalName = normalLocation?.name || currentLocationId;

                // 🖤 Switch TravelSystem back to normal world
                TravelSystem.currentWorld = 'normal';
                TravelSystem.saveCurrentWorld();
                TravelSystem.playerPosition.currentLocation = currentLocationId;

                // 🖤💀 MARK EXIT LOCATION AS VISITED in normal world so it shows on map!
                if (typeof GameWorld !== 'undefined') {
                    if (!GameWorld.visitedLocations.includes(currentLocationId)) {
                        GameWorld.visitedLocations.push(currentLocationId);
                        console.log('🌅 Added exit location to normal world visited:', currentLocationId);
                    }
                    // 🖤 Also discover paths to connected locations
                    if (normalLocation?.connections) {
                        normalLocation.connections.forEach(connId => {
                            TravelSystem.discoverPath(currentLocationId, connId);
                        });
                    }
                }

                // 🖤💀 PROPERLY SET game.currentLocation to FULL normal world location object
                if (typeof game !== 'undefined' && normalLocation) {
                    game.currentLocation = { ...normalLocation };
                    game.inDoomWorld = false;
                    // 🖤 Also sync game.visitedLocations if it exists
                    if (game.visitedLocations && !game.visitedLocations.includes(currentLocationId)) {
                        game.visitedLocations.push(currentLocationId);
                    }
                    console.log('🌅 game.currentLocation set to:', game.currentLocation.name, game.currentLocation.id);
                }

                if (typeof DoomWorldSystem !== 'undefined') {
                    DoomWorldSystem.isActive = false;
                    DoomWorldSystem._removeDoomEffects();
                    DoomWorldSystem._saveState();
                }

                if (typeof DoomWorldConfig !== 'undefined') {
                    DoomWorldConfig.deactivate();
                }

                document.body.classList.remove('doom-world');

                if (typeof WeatherSystem !== 'undefined') {
                    WeatherSystem.changeWeather('clear');
                }

                // 🖤💀 Restore normal world backdrop/background based on current season
                if (typeof GameWorldRenderer !== 'undefined') {
                    // 🖤 Force exit dungeon mode flag
                    GameWorldRenderer.isInDungeonMode = false;

                    // 🖤 Get current season and load that backdrop
                    let currentSeason = 'summer';
                    if (typeof TimeSystem !== 'undefined' && TimeSystem.getSeason) {
                        currentSeason = TimeSystem.getSeason().toLowerCase();
                    }

                    // 🖤💀 FORCE clear currentSeason so loadSeasonalBackdrop doesn't skip reload
                    GameWorldRenderer.currentSeason = null;

                    // 🖤 Load seasonal backdrop directly
                    if (GameWorldRenderer.loadSeasonalBackdrop) {
                        GameWorldRenderer.loadSeasonalBackdrop(currentSeason);
                        console.log(`🌅 Normal world ${currentSeason} backdrop restored`);
                    }
                }

                if (typeof game !== 'undefined' && game.addMessage) {
                    game.addMessage('🌅 The darkness fades... you have returned to the normal world.', 'success');
                    game.addMessage(`📍 You are now at ${normalName}.`, 'info');
                }

                // 🖤💀 Emit world change event for any listeners
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('worldChanged', { world: 'normal', exitLocation: currentLocationId });
                    EventBus.emit('doom:exited', { exitLocation: currentLocationId });
                }

                // 🦇 Refresh ALL panels to show normal world data
                if (typeof PeoplePanel !== 'undefined') PeoplePanel.refresh?.();
                if (typeof TravelPanelMap !== 'undefined') TravelPanelMap.render?.();
                if (typeof GameWorldRenderer !== 'undefined') {
                    GameWorldRenderer.render?.();
                    GameWorldRenderer.updatePlayerMarker?.();
                    // 🖤💀 CENTER MAP ON PLAYER LOCATION
                    if (GameWorldRenderer.centerOnLocation) {
                        GameWorldRenderer.centerOnLocation(currentLocationId);
                    } else if (GameWorldRenderer.centerOnPlayer) {
                        GameWorldRenderer.centerOnPlayer();
                    }
                }
                if (typeof QuestSystem !== 'undefined') {
                    QuestSystem.updateQuestLogUI?.();
                    QuestSystem.updateQuestTracker?.();
                }

                return `🌅 Returned to normal world at ${normalName}`;
            }
            return '❌ You are not in the doom world';
        });

        // 🖤 spawnboatman - Debug: spawn boatman at current location
        this.registerCommand('spawnboatman', 'Spawn boatman at current location (doom portal)', () => {
            const loc = game?.currentLocation?.id || 'shadow_dungeon';

            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.bossesDefeated.shadow_guardian = true;
                DoomWorldSystem.bossesDefeated.ruins_guardian = true;
                DoomWorldSystem.boatmanLocations.add('shadow_dungeon');
                DoomWorldSystem.boatmanLocations.add('forest_dungeon');
                DoomWorldSystem.boatmanLocations.add(loc);
                DoomWorldSystem._saveState();

                if (typeof PeoplePanel !== 'undefined') {
                    PeoplePanel.refresh();
                }

                return `⛵ Boatman spawned at shadow_dungeon, forest_dungeon, and ${loc}`;
            }
            return 'DoomWorldSystem not found';
        });

        // 🖤 DRY season jump commands - one helper to rule them all 💀
        const seasonData = {
            spring: { month: 3, icon: '🌸', name: 'Spring', start: 'March 1' },
            summer: { month: 6, icon: '☀️', name: 'Summer', start: 'June 1' },
            autumn: { month: 9, icon: '🍂', name: 'Autumn', start: 'September 1' },
            winter: { month: 12, icon: '❄️', name: 'Winter', start: 'December 1' }
        };

        const jumpToSeason = (season) => {
            if (typeof TimeMachine === 'undefined') return 'TimeMachine not found';

            const { month: targetMonth, icon, name, start } = seasonData[season];
            const currentMonth = TimeMachine.currentTime.month;

            // Calculate months to skip (always forward)
            let monthsToSkip = targetMonth - currentMonth;
            if (monthsToSkip <= 0) monthsToSkip += 12; // Wrap to next year

            // Use skipMonths to preserve stats and advance properly
            TimeMachine.skipMonths(monthsToSkip, true);

            // Force backdrop reload
            if (typeof GameWorldRenderer !== 'undefined') {
                GameWorldRenderer.currentSeason = null;
                GameWorldRenderer.loadSeasonalBackdrop(season);
            }
            console.log(`${icon} Jumped to ${name}! ${start}`);
            return `${start} - ${name} begins`;
        };

        // Register all season commands using the DRY helper
        Object.entries(seasonData).forEach(([season, data]) => {
            this.registerCommand(season, `Jump to start of ${data.name} (${data.start})`, () => jumpToSeason(season));
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
        // 🔧 DEBOOGER UTILITIES 🦇
        // ═══════════════════════════════════════════════════════════════

        // gamestate - Show current game state
        this.registerCommand('gamestate', 'Show current game state', () => {
            if (typeof game !== 'undefined') {
                // 🖤 Wrap JSON.stringify in try-catch for circular reference safety 💀
                try {
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
                } catch (e) {
                    console.log('🎮 Game State: [Error serializing - circular reference?]');
                }
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
            console.log(`🏆 Unlocked ${unlockCount} achievements! 💀`);
            console.log('💻 Super Hacker should now be unlocked! 🦇');
            console.log('🔓 Debooger commands will remain available on this save! 🖤');
            console.log('🗡️ Check your inventory for the Blade of the Hacker!');
            console.log('═══════════════════════════════════════════════════');

            return `${unlockCount} achievements unlocked!`;
        });

        // ═══════════════════════════════════════════════════════════════
        // 🏆 LEADERBOARD CHEATS
        // ═══════════════════════════════════════════════════════════════

        // clearleaderboard - Reset the Hall of Champions to empty
        this.registerCommand('clearleaderboard', 'Clear all entries from the Hall of Champions', async () => {
            console.log('🏆 === CLEARLEADERBOARD COMMAND STARTED ===');

            // Check both global and window scope
            const resetFn = window.resetLeaderboard;

            console.log('🏆 window.resetLeaderboard type:', typeof window.resetLeaderboard);
            console.log('🏆 GlobalLeaderboardSystem exists:', typeof GlobalLeaderboardSystem !== 'undefined');

            if (typeof resetFn === 'function') {
                console.log('🏆 Calling window.resetLeaderboard()...');
                try {
                    const result = await resetFn();
                    console.log('🏆 resetLeaderboard returned:', result);
                    if (result) {
                        console.log('✅ Hall of Champions has been cleared!');
                        return '🏆 Leaderboard cleared! The Hall of Champions is now empty.';
                    } else {
                        console.warn('❌ Failed to clear leaderboard - function returned false');
                        return '❌ Failed to clear leaderboard. Check console for details.';
                    }
                } catch (error) {
                    console.warn('❌ Error clearing leaderboard:', error.message);
                    return '❌ Error: ' + error.message;
                }
            } else {
                console.warn('❌ window.resetLeaderboard is not a function');
                // Try direct API call as fallback
                console.log('🏆 Attempting direct API clear...');
                try {
                    const binId = GlobalLeaderboardSystem?.config?.BIN_ID || GameConfig?.leaderboard?.jsonbin?.binId;
                    const apiKey = GlobalLeaderboardSystem?.config?.API_KEY || GameConfig?.leaderboard?.jsonbin?.apiKey;

                    if (binId && apiKey) {
                        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Master-Key': apiKey
                            },
                            body: JSON.stringify({ leaderboard: [] })
                        });

                        if (response.ok) {
                            GlobalLeaderboardSystem.leaderboard = [];
                            GlobalLeaderboardSystem.lastFetch = null;
                            localStorage.removeItem('global_leaderboard_cache');
                            GlobalLeaderboardSystem.renderLeaderboard();
                            console.log('✅ Direct API clear successful!');
                            return '🏆 Leaderboard cleared via direct API!';
                        } else {
                            console.warn('❌ API error:', response.status);
                            return '❌ API error: ' + response.status;
                        }
                    } else {
                        return '❌ No API credentials found';
                    }
                } catch (e) {
                    console.warn('❌ Direct API error:', e.message);
                    return '❌ Error: ' + e.message;
                }
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

        // ═══════════════════════════════════════════════════════════════
        // 🏚️ EXPLORATION CHEATS - dungeon cooldown bypass
        // ═══════════════════════════════════════════════════════════════

        // resetexplore - Reset exploration cooldown for current location
        this.registerCommand('resetexplore', 'Reset exploration cooldown for current location', () => {
            if (typeof DungeonExplorationSystem !== 'undefined') {
                const currentLocationId = game?.currentLocation?.id;
                if (!currentLocationId) {
                    console.warn('🏚️ No current location found');
                    return 'No current location';
                }

                // Clear the cooldown for current location
                if (DungeonExplorationSystem.locationCooldowns) {
                    delete DungeonExplorationSystem.locationCooldowns[currentLocationId];
                    DungeonExplorationSystem.saveCooldowns();
                    console.log(`🏚️ Exploration cooldown reset for ${currentLocationId}`);
                    return `Cooldown reset for ${currentLocationId}`;
                }
            }
            return 'DungeonExplorationSystem not found';
        });

        // resetallexplore - Reset ALL exploration cooldowns
        this.registerCommand('resetallexplore', 'Reset ALL exploration cooldowns', () => {
            if (typeof DungeonExplorationSystem !== 'undefined') {
                DungeonExplorationSystem.locationCooldowns = {};
                DungeonExplorationSystem.saveCooldowns();
                console.log('🏚️ ALL exploration cooldowns reset!');
                return 'All cooldowns cleared!';
            }
            return 'DungeonExplorationSystem not found';
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

    // 🖤💀 Alias for addPersonalGold - used by trade-cart-panel 💀
    addGold(amount, reason = '') {
        return this.addPersonalGold(amount, reason);
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
window.DeboogerCommandSystem = DeboogerCommandSystem;
window.UniversalGoldManager = UniversalGoldManager;

// 🔒 ONLY initialize if debooger is enabled in config
if (typeof GameConfig !== 'undefined' && GameConfig.debooger && GameConfig.debooger.enabled === true) {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => DeboogerCommandSystem.init(), 500);
        });
    } else {
        setTimeout(() => DeboogerCommandSystem.init(), 500);
    }
    console.log('🎮 Debooger Command System loaded!');
} else {
    console.log('🔒 Debooger Command System DISABLED by config');
}
