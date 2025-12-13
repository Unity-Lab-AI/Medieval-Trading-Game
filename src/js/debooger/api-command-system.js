// ═══════════════════════════════════════════════════════════════
// 🤖 API COMMAND SYSTEM - where NPC words become game actions
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// NPCs can embed commands in their responses like {openMarket}
// this system parses them out, strips them from display/TTS,
// and executes the corresponding game actions
// it's like giving NPCs a keyboard shortcut for reality
// ═══════════════════════════════════════════════════════════════

const APICommandSystem = {
    // ═══════════════════════════════════════════════════════════════
    // 📋 STATE - the command system's brain
    // ═══════════════════════════════════════════════════════════════
    initialized: false,
    handlers: {},
    commandQueue: [],
    currentContext: null,
    lastExecutedCommand: null,
    deboogerMode: false,

    // 🖤 Safe param extraction - prevents undefined access and sanitizes input 💀
    safeParam(params, index, defaultValue = null) {
        if (!Array.isArray(params) || index < 0 || index >= params.length) {
            return defaultValue;
        }
        const val = params[index];
        // Return default if undefined, null, or empty string
        if (val === undefined || val === null || val === '') {
            return defaultValue;
        }
        // Basic sanitization - remove any HTML-like tags
        if (typeof val === 'string') {
            return val.replace(/<[^>]*>/g, '').trim();
        }
        return val;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION - wake up the command processor
    // ═══════════════════════════════════════════════════════════════
    init() {
        if (this.initialized) {
            console.log('🤖 APICommandSystem already initialized');
            return this;
        }

        console.log('🤖 APICommandSystem awakening...');
        this.registerAllHandlers();
        this.initialized = true;
        console.log('🤖 APICommandSystem ready to parse NPC commands');
        return this;
    },

    // ═══════════════════════════════════════════════════════════════
    // 📝 PARSING - extract commands from NPC text
    // ═══════════════════════════════════════════════════════════════

    /**
     * Parse text and extract all commands
     * @param {string} text - Raw NPC response text
     * @param {object} context - Context with npcData, conversation, etc.
     * @returns {object} { cleanText: string, commands: array }
     */
    parseCommands(text, context = {}) {
        if (!text || typeof text !== 'string') {
            return { cleanText: text || '', commands: [] };
        }

        const commands = [];
        const pattern = GameConfig?.apiCommands?.pattern || /\{(\w+)(?::([^}]+))?\}/g;

        // Reset the pattern's lastIndex (important for global regex)
        pattern.lastIndex = 0;

        let match;
        while ((match = pattern.exec(text)) !== null) {
            const commandName = match[1];
            const paramString = match[2] || '';
            const params = paramString ? paramString.split(',').map(p => p.trim()) : [];

            commands.push({
                name: commandName,
                params: params,
                rawMatch: match[0],
                index: match.index
            });

            if (this.deboogerMode) {
                console.log(`🔍 Found command: ${commandName}`, params);
            }
        }

        // Strip all commands from the text for display/TTS
        const cleanText = text.replace(pattern, '').replace(/\s+/g, ' ').trim();

        return { cleanText, commands };
    },

    /**
     * Parse and immediately execute commands
     * @param {string} text - Raw NPC response text
     * @param {object} context - Context with npcData, etc.
     * @returns {object} { cleanText: string, commands: array, results: array }
     */
    parseAndExecute(text, context = {}) {
        const { cleanText, commands } = this.parseCommands(text, context);

        if (commands.length > 0) {
            // Execute commands asynchronously so they don't block text display
            this.executeCommands(commands, context);
        }

        return { cleanText, commands };
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚡ EXECUTION - run the commands
    // ═══════════════════════════════════════════════════════════════

    /**
     * Execute an array of parsed commands
     * @param {array} commands - Array of command objects
     * @param {object} context - Execution context
     */
    async executeCommands(commands, context = {}) {
        this.currentContext = context;

        for (const command of commands) {
            await this.executeCommand(command, context);
        }

        this.currentContext = null;
    },

    /**
     * Execute a single command
     * @param {object} command - { name, params, ... }
     * @param {object} context - Execution context
     */
    async executeCommand(command, context = {}) {
        const { name, params } = command;

        // Check if command exists
        const definition = GameConfig?.apiCommands?.definitions?.[name];
        if (!definition) {
            console.warn(`🤖 Unknown command: {${name}}`);
            return { success: false, error: 'Unknown command' };
        }

        // Check permissions
        if (!this.hasPermission(name, context)) {
            console.warn(`🤖 NPC lacks permission for command: {${name}}`);
            return { success: false, error: 'Permission denied' };
        }

        // Get the handler
        const handlerName = definition.handler;
        const handler = this.handlers[handlerName];

        if (!handler) {
            console.warn(`🤖 No handler registered for: ${handlerName}`);
            return { success: false, error: 'Handler not found' };
        }

        // Execute the handler
        try {
            if (this.deboogerMode) {
                console.log(`🤖 Executing: ${name}(${params.join(', ')})`);
            }

            const result = await handler(params, context);
            this.lastExecutedCommand = { name, params, result, timestamp: Date.now() };

            return { success: true, result };
        } catch (error) {
            console.error(`🤖 Command execution error for {${name}}:`, error);
            return { success: false, error: error.message };
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔐 PERMISSIONS - who can do what
    // ═══════════════════════════════════════════════════════════════

    /**
     * Check if NPC has permission to use a command
     * @param {string} commandName - Name of the command
     * @param {object} context - Context with npcData
     * @returns {boolean}
     */
    hasPermission(commandName, context = {}) {
        const definition = GameConfig?.apiCommands?.definitions?.[commandName];
        if (!definition) return false;

        const requiredPermission = definition.permission;
        const npcType = context.npcData?.type || context.npcType || 'villager';

        // Get what permission groups this NPC has
        const npcPermGroups = GameConfig?.apiCommands?.npcPermissions?.[npcType] || ['basic'];

        // Get what commands those permission groups allow
        const allowedCommands = [];
        for (const group of npcPermGroups) {
            const groupCommands = GameConfig?.apiCommands?.permissions?.[group] || [];
            allowedCommands.push(...groupCommands);
        }

        return allowedCommands.includes(commandName);
    },

    /**
     * Get all commands available to an NPC type
     * @param {string} npcType - Type of NPC
     * @returns {array} List of command names
     */
    getAvailableCommands(npcType) {
        const npcPermGroups = GameConfig?.apiCommands?.npcPermissions?.[npcType] || ['basic'];
        const commands = [];

        for (const group of npcPermGroups) {
            const groupCommands = GameConfig?.apiCommands?.permissions?.[group] || [];
            commands.push(...groupCommands);
        }

        return [...new Set(commands)]; // Remove duplicates
    },

    // ═══════════════════════════════════════════════════════════════
    // 📦 HANDLER REGISTRATION - connect commands to game functions
    // ═══════════════════════════════════════════════════════════════

    /**
     * Register a command handler
     * @param {string} name - Handler name (matches definition.handler)
     * @param {function} handler - Handler function(params, context)
     */
    registerHandler(name, handler) {
        if (typeof handler !== 'function') {
            console.error(`🤖 Handler must be a function: ${name}`);
            return;
        }
        this.handlers[name] = handler;
        if (this.deboogerMode) {
            console.log(`🤖 Registered handler: ${name}`);
        }
    },

    /**
     * Register all default handlers
     */
    registerAllHandlers() {
        // ═══════════════════════════════════════════════════════════
        // 🛒 BASIC HANDLERS - UI and navigation
        // ═══════════════════════════════════════════════════════════

        this.registerHandler('openMarket', (params, context) => {
            console.log('🤖 Opening market...');
            // Try various ways to open the market
            if (typeof openMarket === 'function') {
                openMarket();
            } else if (typeof game !== 'undefined' && typeof game.openMarket === 'function') {
                game.openMarket();
            } else if (typeof MarketUI !== 'undefined' && typeof MarketUI.show === 'function') {
                MarketUI.show();
            } else {
                // Fallback: click the market button if it exists
                const marketBtn = document.querySelector('[data-action="market"]') ||
                                  document.querySelector('#market-btn') ||
                                  document.querySelector('.market-button');
                if (marketBtn) marketBtn.click();
            }
            return { opened: true };
        });

        this.registerHandler('openTradeWindow', (params, context) => {
            console.log('🤖 Opening trade window...');
            if (typeof NPCTradeWindow !== 'undefined' && typeof NPCTradeWindow.open === 'function') {
                NPCTradeWindow.open(context.npcData);
            } else {
                console.warn('🤖 NPCTradeWindow not available');
            }
            return { opened: true };
        });

        this.registerHandler('closeNPCChat', (params, context) => {
            console.log('🤖 Closing NPC chat...');
            if (typeof NPCChatUI !== 'undefined' && typeof NPCChatUI.close === 'function') {
                NPCChatUI.close();
            } else if (typeof NPCVoiceChatSystem !== 'undefined' && typeof NPCVoiceChatSystem.closeChat === 'function') {
                NPCVoiceChatSystem.closeChat();
            }
            return { closed: true };
        });

        this.registerHandler('openInventory', (params, context) => {
            console.log('🤖 Opening inventory...');
            if (typeof openInventory === 'function') {
                openInventory();
            } else if (typeof game !== 'undefined' && typeof game.openInventory === 'function') {
                game.openInventory();
            } else {
                const invBtn = document.querySelector('[data-action="inventory"]') ||
                               document.querySelector('#inventory-btn');
                if (invBtn) invBtn.click();
            }
            return { opened: true };
        });

        this.registerHandler('openTravel', (params, context) => {
            console.log('🤖 Opening travel panel...');
            if (typeof openTravel === 'function') {
                openTravel();
            } else if (typeof TravelPanel !== 'undefined' && typeof TravelPanel.show === 'function') {
                TravelPanel.show();
            } else {
                const travelBtn = document.querySelector('[data-action="travel"]') ||
                                  document.querySelector('#travel-btn');
                if (travelBtn) travelBtn.click();
            }
            return { opened: true };
        });

        // 💀 Session #76: Missing doom dialogue callbacks 💀
        this.registerHandler('openHealing', (params, context) => {
            console.log('🤖 Opening healing panel...');
            if (typeof HealingPanel !== 'undefined' && typeof HealingPanel.show === 'function') {
                HealingPanel.show();
            } else if (typeof game !== 'undefined' && typeof game.openHealing === 'function') {
                game.openHealing();
            } else {
                const healBtn = document.querySelector('[data-action="heal"]') ||
                                document.querySelector('#heal-btn') ||
                                document.querySelector('.healing-btn');
                if (healBtn) healBtn.click();
            }
            return { opened: true };
        });

        this.registerHandler('openCrafting', (params, context) => {
            console.log('🤖 Opening crafting panel...');
            if (typeof CraftingPanel !== 'undefined' && typeof CraftingPanel.show === 'function') {
                CraftingPanel.show();
            } else if (typeof game !== 'undefined' && typeof game.openCrafting === 'function') {
                game.openCrafting();
            } else {
                const craftBtn = document.querySelector('[data-action="craft"]') ||
                                 document.querySelector('#craft-btn') ||
                                 document.querySelector('.crafting-btn');
                if (craftBtn) craftBtn.click();
            }
            return { opened: true };
        });

        this.registerHandler('openRest', (params, context) => {
            console.log('🤖 Opening rest/inn panel...');
            if (typeof RestPanel !== 'undefined' && typeof RestPanel.show === 'function') {
                RestPanel.show();
            } else if (typeof game !== 'undefined' && typeof game.openRest === 'function') {
                game.openRest();
            } else if (typeof game !== 'undefined' && typeof game.rest === 'function') {
                game.rest();
            } else {
                const restBtn = document.querySelector('[data-action="rest"]') ||
                                document.querySelector('#rest-btn') ||
                                document.querySelector('.rest-btn');
                if (restBtn) restBtn.click();
            }
            return { opened: true };
        });

        this.registerHandler('playNPCEmote', (params, context) => {
            const [emoteType] = params;
            console.log(`🤖 NPC emote: ${emoteType}`);
            // Fire event for any emote listeners
            const event = new CustomEvent('npc-emote', {
                detail: { emote: emoteType, npc: context.npcData }
            });
            document.dispatchEvent(event);
            return { emote: emoteType };
        });

        // ═══════════════════════════════════════════════════════════
        // 🌦️ WEATHER HANDLERS - dramatic weather for events
        // ═══════════════════════════════════════════════════════════

        this.registerHandler('triggerWeather', (params, context) => {
            const [eventType, duration] = params;
            console.log(`🤖 Triggering weather event: ${eventType}`);
            if (typeof WeatherSystem !== 'undefined' && WeatherSystem.triggerEventWeather) {
                const options = duration ? { duration: parseInt(duration) } : {};
                WeatherSystem.triggerEventWeather(eventType, options);
                return { triggered: true, eventType };
            }
            return { triggered: false, error: 'WeatherSystem not available' };
        });

        this.registerHandler('forceWeather', (params, context) => {
            const [weatherType, message] = params;
            console.log(`🤖 Forcing weather: ${weatherType}`);
            if (typeof WeatherSystem !== 'undefined' && WeatherSystem.forceWeather) {
                WeatherSystem.forceWeather(weatherType, {
                    message: message || null,
                    saveCurrentWeather: true
                });
                return { forced: true, weatherType };
            }
            return { forced: false, error: 'WeatherSystem not available' };
        });

        this.registerHandler('restoreWeather', (params, context) => {
            console.log(`🤖 Restoring weather after event`);
            if (typeof WeatherSystem !== 'undefined' && WeatherSystem.restoreWeatherAfterEvent) {
                WeatherSystem.restoreWeatherAfterEvent();
                return { restored: true };
            }
            return { restored: false, error: 'WeatherSystem not available' };
        });

        // ═══════════════════════════════════════════════════════════
        // 💰 MERCHANT HANDLERS - trading and items
        // ═══════════════════════════════════════════════════════════

        this.registerHandler('givePlayerItem', (params, context) => {
            const [itemId, quantity = 1] = params;
            const qty = parseInt(quantity) || 1;
            console.log(`🤖 Giving player ${qty}x ${itemId}`);

            if (typeof game !== 'undefined' && game.player?.inventory) {
                game.player.inventory[itemId] = (game.player.inventory[itemId] || 0) + qty;

                // Show notification
                if (typeof addMessage === 'function') {
                    addMessage(`Received ${qty}x ${itemId}!`, 'success');
                }

                // Fire event
                const event = new CustomEvent('item-received', {
                    detail: { itemId, quantity: qty, from: context.npcData }
                });
                document.dispatchEvent(event);

                return { itemId, quantity: qty, success: true };
            }
            return { success: false, error: 'No player inventory' };
        });

        this.registerHandler('takePlayerItem', (params, context) => {
            const [itemId, quantity = 1] = params;
            const qty = parseInt(quantity) || 1;
            console.log(`🤖 Taking ${qty}x ${itemId} from player`);

            if (typeof game !== 'undefined' && game.player?.inventory) {
                const currentAmount = game.player.inventory[itemId] || 0;
                if (currentAmount >= qty) {
                    game.player.inventory[itemId] = currentAmount - qty;
                    if (game.player.inventory[itemId] <= 0) {
                        delete game.player.inventory[itemId];
                    }

                    if (typeof addMessage === 'function') {
                        addMessage(`Gave ${qty}x ${itemId}`, 'info');
                    }

                    return { itemId, quantity: qty, success: true };
                }
                return { success: false, error: 'Not enough items' };
            }
            return { success: false, error: 'No player inventory' };
        });

        this.registerHandler('applyMerchantDiscount', (params, context) => {
            const [percent] = params;
            const discountPercent = parseInt(percent) || 0;
            console.log(`🤖 Applying ${discountPercent}% discount`);

            if (context.npcData) {
                context.npcData.currentDiscount = discountPercent;
            }

            // Store in session for market to use
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('merchant_discount', discountPercent);
                sessionStorage.setItem('merchant_discount_npc', context.npcData?.name || 'Unknown');
            }

            if (typeof addMessage === 'function') {
                addMessage(`${context.npcData?.name || 'Merchant'} offers a ${discountPercent}% discount!`, 'success');
            }

            return { discount: discountPercent };
        });

        this.registerHandler('showNPCWares', (params, context) => {
            console.log('🤖 Showing NPC wares preview...');
            // Fire event for UI to handle
            const event = new CustomEvent('show-npc-wares', {
                detail: { npc: context.npcData }
            });
            document.dispatchEvent(event);
            return { shown: true };
        });

        // ═══════════════════════════════════════════════════════════
        // 💕 RELATIONSHIP HANDLERS
        // ═══════════════════════════════════════════════════════════

        this.registerHandler('modifyReputation', (params, context) => {
            const [amount, isNegative] = params;
            let change = parseInt(amount) || 0;
            if (isNegative === 'negative') change = -Math.abs(change);

            console.log(`🤖 Reputation change: ${change}`);

            if (typeof NPCRelationshipSystem !== 'undefined') {
                const npcId = context.npcData?.id || context.npcData?.name;
                NPCRelationshipSystem.modifyReputation(npcId, change);
            }

            // Fire event
            const event = new CustomEvent('reputation-change', {
                detail: { amount: change, npc: context.npcData }
            });
            document.dispatchEvent(event);

            return { change };
        });

        this.registerHandler('storePlayerMemory', (params, context) => {
            const [key, value] = params;
            console.log(`🤖 NPC remembers: ${key} = ${value}`);

            if (typeof NPCRelationshipSystem !== 'undefined') {
                const npcId = context.npcData?.id || context.npcData?.name;
                NPCRelationshipSystem.rememberAboutPlayer(npcId, key, value);
            }

            return { key, value, stored: true };
        });

        // ═══════════════════════════════════════════════════════════
        // 📜 QUEST HANDLERS - the whole damn quest lifecycle
        // ═══════════════════════════════════════════════════════════

        // assign a quest to the player - checks prereqs automatically
        this.registerHandler('assignQuest', (params, context) => {
            const [questId] = params;
            console.log(`🤖 Assigning quest: ${questId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const quest = QuestSystem.quests[questId];
            if (!quest) {
                return { success: false, error: `Quest "${questId}" doesn't exist` };
            }

            // check prerequisite quest
            if (quest.prerequisite && !QuestSystem.completedQuests.includes(quest.prerequisite)) {
                const prereqQuest = QuestSystem.quests[quest.prerequisite];
                return {
                    success: false,
                    error: 'prerequisite_not_met',
                    prerequisite: quest.prerequisite,
                    prerequisiteName: prereqQuest?.name || quest.prerequisite,
                    message: `Player must complete "${prereqQuest?.name || quest.prerequisite}" first`
                };
            }

            const result = QuestSystem.assignQuest(questId, context.npcData);

            // if quest gives a quest item, it's already handled by QuestSystem.assignQuest
            if (result.success && quest.givesQuestItem) {
                if (typeof addMessage === 'function') {
                    const itemInfo = QuestSystem.questItems[quest.givesQuestItem];
                    addMessage(`📦 Received: ${itemInfo?.name || quest.givesQuestItem}`, 'success');
                }
            }

            return result;
        });

        // check quest progress with detailed breakdown
        this.registerHandler('checkQuestProgress', (params, context) => {
            const [questId] = params;
            console.log(`🤖 Checking quest progress: ${questId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const progress = QuestSystem.checkProgress(questId);

            // add readable objective status for AI
            if (progress.objectives) {
                progress.objectiveStatus = progress.objectives.map(obj => {
                    let status = '';
                    if (obj.count !== undefined) {
                        status = `${obj.description || obj.type}: ${obj.current || 0}/${obj.count}`;
                    } else if (obj.rooms !== undefined) {
                        status = `${obj.description || obj.type}: ${obj.current || 0}/${obj.rooms} rooms`;
                    } else {
                        status = `${obj.description || obj.type}: ${obj.completed ? 'DONE' : 'pending'}`;
                    }
                    return status;
                });
            }

            return progress;
        });

        // complete quest - validates all objectives are done first
        this.registerHandler('completeQuest', (params, context) => {
            const [questId] = params;
            console.log(`🤖 Completing quest: ${questId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            // check if quest is actually completable
            const progress = QuestSystem.checkProgress(questId);
            if (progress.status !== 'ready_to_complete') {
                // Provide helpful message for NPC to respond with
                let npcHint = '';
                if (progress.objectives) {
                    const incomplete = progress.objectives.filter(o =>
                        (o.count !== undefined && (o.current || 0) < o.count) ||
                        (o.completed === false)
                    );
                    if (incomplete.length > 0) {
                        const obj = incomplete[0];
                        if (obj.type === 'collect') {
                            npcHint = `Player still needs ${obj.count - (obj.current || 0)} more ${obj.item}`;
                        } else if (obj.type === 'defeat') {
                            npcHint = `Player still needs to defeat ${obj.count - (obj.current || 0)} more ${obj.enemy}`;
                        } else if (obj.type === 'visit') {
                            npcHint = `Player hasn't visited ${obj.location} yet`;
                        } else if (obj.type === 'talk') {
                            npcHint = `Player needs to speak with ${obj.npc}`;
                        }
                    }
                }
                return {
                    success: false,
                    error: 'objectives_incomplete',
                    status: progress.status,
                    progress: progress.progress,
                    npcHint: npcHint,
                    message: `Quest not ready - progress: ${progress.progress}`
                };
            }

            const result = QuestSystem.completeQuest(questId);

            // Handle validation errors from completeQuest
            if (!result.success) {
                // Add NPC-friendly hints for common errors
                if (result.error === 'missing_collection_items') {
                    result.npcHint = `Player claims to have ${result.item} but only has ${result.playerHas}/${result.required}. Ask them to gather more.`;
                    if (typeof addMessage === 'function') {
                        addMessage(`You need ${result.required - result.playerHas} more ${result.item}!`, 'warning');
                    }
                }
                return result;
            }

            // announce next quest in chain if there is one
            if (result.success && result.nextQuest) {
                const nextQuest = QuestSystem.quests[result.nextQuest];
                if (nextQuest && typeof addMessage === 'function') {
                    addMessage(`📜 New quest available: ${nextQuest.name}`, 'info');
                }
            }

            return result;
        });

        // fail a quest
        this.registerHandler('failQuest', (params, context) => {
            const [questId] = params;
            console.log(`🤖 Failing quest: ${questId}`);

            if (typeof QuestSystem !== 'undefined') {
                return QuestSystem.failQuest(questId);
            }

            return { questId, failed: true };
        });

        // give player a quest item specifically (weightless, can't drop)
        this.registerHandler('giveQuestItem', (params, context) => {
            const [questItemId] = params;
            console.log(`🤖 Giving quest item: ${questItemId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const itemInfo = QuestSystem.questItems[questItemId];
            if (!itemInfo) {
                return { success: false, error: `Quest item "${questItemId}" doesn't exist` };
            }

            // quest items are tracked specially - add to player's quest item inventory
            if (typeof game !== 'undefined' && game.player) {
                game.player.questItems = game.player.questItems || {};
                game.player.questItems[questItemId] = (game.player.questItems[questItemId] || 0) + 1;
            }

            if (typeof addMessage === 'function') {
                addMessage(`${itemInfo.icon || '📦'} Received quest item: ${itemInfo.name}`, 'success');
            }

            document.dispatchEvent(new CustomEvent('quest-item-received', {
                detail: { itemId: questItemId, itemInfo, from: context.npcData }
            }));

            return { success: true, itemId: questItemId, itemName: itemInfo.name };
        });

        // take quest item from player (for delivery quests)
        this.registerHandler('takeQuestItem', (params, context) => {
            const [questItemId] = params;
            console.log(`🤖 Taking quest item: ${questItemId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const itemInfo = QuestSystem.questItems[questItemId];
            if (!itemInfo) {
                return { success: false, error: `Quest item "${questItemId}" doesn't exist` };
            }

            // check if player has the quest item
            if (typeof game !== 'undefined' && game.player) {
                const hasItem = game.player.questItems?.[questItemId] > 0;
                if (!hasItem) {
                    return {
                        success: false,
                        error: 'player_missing_item',
                        message: `Player doesn't have ${itemInfo.name}`
                    };
                }

                // remove the quest item
                game.player.questItems[questItemId]--;
                if (game.player.questItems[questItemId] <= 0) {
                    delete game.player.questItems[questItemId];
                }
            }

            if (typeof addMessage === 'function') {
                addMessage(`${itemInfo.icon || '📦'} Delivered: ${itemInfo.name}`, 'info');
            }

            document.dispatchEvent(new CustomEvent('quest-item-delivered', {
                detail: { itemId: questItemId, itemInfo, to: context.npcData }
            }));

            return { success: true, itemId: questItemId, itemName: itemInfo.name, delivered: true };
        });

        // check if player has a specific quest item
        this.registerHandler('checkQuestItem', (params, context) => {
            const [questItemId] = params;
            console.log(`🤖 Checking for quest item: ${questItemId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const itemInfo = QuestSystem.questItems[questItemId];
            if (!itemInfo) {
                return { success: false, error: `Quest item "${questItemId}" doesn't exist` };
            }

            const hasItem = game?.player?.questItems?.[questItemId] > 0;
            const quantity = game?.player?.questItems?.[questItemId] || 0;

            return {
                success: true,
                hasItem,
                quantity,
                itemId: questItemId,
                itemName: itemInfo.name
            };
        });

        // check if player has required regular items for collection quest
        this.registerHandler('checkCollectionItems', (params, context) => {
            const [itemId, requiredCount] = params;
            const count = parseInt(requiredCount) || 1;
            console.log(`🤖 Checking collection: ${count}x ${itemId}`);

            if (typeof game === 'undefined' || !game.player?.inventory) {
                return { success: false, error: 'No player inventory' };
            }

            const currentAmount = game.player.inventory[itemId] || 0;
            const hasEnough = currentAmount >= count;

            return {
                success: true,
                itemId,
                required: count,
                current: currentAmount,
                hasEnough,
                missing: hasEnough ? 0 : count - currentAmount
            };
        });

        // take collection items from player (for "bring me 20 wheat" quests)
        this.registerHandler('takeCollectionItems', (params, context) => {
            const [itemId, quantity] = params;
            const count = parseInt(quantity) || 1;
            console.log(`🤖 Taking collection items: ${count}x ${itemId}`);

            if (typeof game === 'undefined' || !game.player?.inventory) {
                return { success: false, error: 'No player inventory' };
            }

            const currentAmount = game.player.inventory[itemId] || 0;
            if (currentAmount < count) {
                return {
                    success: false,
                    error: 'not_enough_items',
                    required: count,
                    current: currentAmount,
                    message: `Player only has ${currentAmount}/${count} ${itemId}`
                };
            }

            // remove the items
            game.player.inventory[itemId] = currentAmount - count;
            if (game.player.inventory[itemId] <= 0) {
                delete game.player.inventory[itemId];
            }

            if (typeof addMessage === 'function') {
                addMessage(`Gave ${count}x ${itemId}`, 'info');
            }

            // update quest progress
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem.updateProgress('collect', { item: itemId, count: count });
            }

            return { success: true, itemId, quantity: count, taken: true };
        });

        // complete delivery objective - NPC confirms receipt
        this.registerHandler('confirmDelivery', (params, context) => {
            const [questId, questItemId] = params;
            console.log(`🤖 Confirming delivery for quest ${questId}: ${questItemId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            // check if this is the right NPC for the delivery
            const quest = QuestSystem.activeQuests[questId];
            if (!quest) {
                return { success: false, error: 'Quest not active' };
            }

            // find the talk objective for this NPC
            const npcType = context.npcData?.type || context.npcType;
            const talkObjective = quest.objectives.find(obj =>
                obj.type === 'talk' && obj.npc === npcType && !obj.completed
            );

            if (talkObjective) {
                talkObjective.completed = true;
            }

            // take the quest item if specified
            if (questItemId) {
                const takeResult = this.handlers['takeQuestItem']([questItemId], context);
                if (!takeResult.success) {
                    return takeResult;
                }
            }

            // check if quest is now completable
            const progress = QuestSystem.checkProgress(questId);
            QuestSystem.saveQuestProgress();
            QuestSystem.updateQuestLogUI();

            return {
                success: true,
                questId,
                delivered: true,
                questStatus: progress.status,
                canComplete: progress.status === 'ready_to_complete'
            };
        });

        // get available quests for this NPC to offer
        this.registerHandler('getAvailableQuests', (params, context) => {
            const npcType = context.npcData?.type || context.npcType || params[0];
            const location = context.location || game?.player?.location || params[1];
            console.log(`🤖 Getting available quests for ${npcType} at ${location}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const available = QuestSystem.getQuestsForNPC(npcType, location);
            const active = QuestSystem.getActiveQuestsForNPC(npcType);
            const completable = active.filter(q =>
                QuestSystem.checkProgress(q.id).status === 'ready_to_complete'
            );

            return {
                success: true,
                available: available.map(q => ({ id: q.id, name: q.name, difficulty: q.difficulty })),
                active: active.map(q => ({ id: q.id, name: q.name, progress: QuestSystem.checkProgress(q.id).progress })),
                completable: completable.map(q => ({ id: q.id, name: q.name }))
            };
        });

        // check all prerequisites for a quest
        this.registerHandler('checkQuestPrerequisites', (params, context) => {
            const [questId] = params;
            console.log(`🤖 Checking prerequisites for quest: ${questId}`);

            if (typeof QuestSystem === 'undefined') {
                return { success: false, error: 'QuestSystem not loaded' };
            }

            const quest = QuestSystem.quests[questId];
            if (!quest) {
                return { success: false, error: 'Quest not found' };
            }

            const checks = {
                questExists: true,
                notAlreadyActive: !QuestSystem.activeQuests[questId],
                notAlreadyCompleted: !QuestSystem.completedQuests.includes(questId) || quest.repeatable,
                prerequisiteMet: !quest.prerequisite || QuestSystem.completedQuests.includes(quest.prerequisite),
                cooldownPassed: true
            };

            // check cooldown for repeatable quests
            if (quest.repeatable && quest.repeatCooldown) {
                const lastCompletion = QuestSystem.getLastCompletionTime(questId);
                if (lastCompletion) {
                    const cooldownMs = quest.repeatCooldown * 24 * 60 * 60 * 1000;
                    checks.cooldownPassed = (Date.now() - lastCompletion) >= cooldownMs;
                }
            }

            const canAssign = Object.values(checks).every(v => v);

            return {
                success: true,
                questId,
                questName: quest.name,
                canAssign,
                checks,
                prerequisite: quest.prerequisite ? {
                    questId: quest.prerequisite,
                    questName: QuestSystem.quests[quest.prerequisite]?.name,
                    completed: checks.prerequisiteMet
                } : null
            };
        });

        // show quest log UI
        this.registerHandler('showQuestLog', (params, context) => {
            console.log('🤖 Opening quest log...');

            if (typeof QuestSystem !== 'undefined' && typeof QuestSystem.showQuestLog === 'function') {
                QuestSystem.showQuestLog();
            } else {
                const questBtn = document.querySelector('[data-action="quests"]') ||
                                 document.querySelector('#quest-log-btn');
                if (questBtn) questBtn.click();
            }

            return { opened: true };
        });

        // ═══════════════════════════════════════════════════════════
        // 👹 BOSS HANDLERS - dungeon boss powers
        // ═══════════════════════════════════════════════════════════

        this.registerHandler('spawnEnemy', (params, context) => {
            const [enemyType, count = 1] = params;
            const num = parseInt(count) || 1;
            console.log(`🤖 Boss spawning ${num}x ${enemyType}`);

            const event = new CustomEvent('boss-spawn-enemy', {
                detail: { enemyType, count: num, boss: context.npcData }
            });
            document.dispatchEvent(event);

            if (typeof addMessage === 'function') {
                addMessage(`${context.npcData?.name || 'Boss'} summons ${num} ${enemyType}!`, 'danger');
            }

            return { enemyType, count: num };
        });

        this.registerHandler('changeWeather', (params, context) => {
            const [weatherType] = params;
            console.log(`🤖 Boss changes weather to: ${weatherType}`);

            const event = new CustomEvent('weather-change', {
                detail: { weather: weatherType, source: context.npcData }
            });
            document.dispatchEvent(event);

            if (typeof addMessage === 'function') {
                addMessage(`The atmosphere shifts to ${weatherType}...`, 'info');
            }

            return { weather: weatherType };
        });

        this.registerHandler('dealDamageToPlayer', (params, context) => {
            const [amount] = params;
            const damage = parseInt(amount) || 10;
            console.log(`🤖 Boss deals ${damage} damage to player`);

            if (typeof game !== 'undefined' && game.player) {
                game.player.health = Math.max(0, (game.player.health || 100) - damage);

                if (typeof addMessage === 'function') {
                    addMessage(`${context.npcData?.name || 'Boss'} deals ${damage} damage!`, 'danger');
                }

                if (typeof updateStatsDisplay === 'function') {
                    updateStatsDisplay();
                }
            }

            return { damage, dealt: true };
        });

        this.registerHandler('healBoss', (params, context) => {
            const [amount] = params;
            const healing = parseInt(amount) || 50;
            console.log(`🤖 Boss heals for ${healing}`);

            if (typeof BossNPCSystem !== 'undefined' && context.npcData?.id) {
                BossNPCSystem.healBoss(context.npcData.id, healing);
            }

            if (typeof addMessage === 'function') {
                addMessage(`${context.npcData?.name || 'Boss'} regenerates ${healing} health!`, 'warning');
            }

            return { healing };
        });

        this.registerHandler('bossPhaseShift', (params, context) => {
            const [phase] = params;
            const phaseNum = parseInt(phase) || 2;
            console.log(`🤖 Boss shifts to phase ${phaseNum}`);

            if (typeof BossNPCSystem !== 'undefined' && context.npcData?.id) {
                BossNPCSystem.setPhase(context.npcData.id, phaseNum);
            }

            const event = new CustomEvent('boss-phase-shift', {
                detail: { phase: phaseNum, boss: context.npcData }
            });
            document.dispatchEvent(event);

            if (typeof addMessage === 'function') {
                addMessage(`${context.npcData?.name || 'Boss'} enters phase ${phaseNum}!`, 'warning');
            }

            return { phase: phaseNum };
        });

        this.registerHandler('dropBossLoot', (params, context) => {
            const [tier = 'rare'] = params;
            console.log(`🤖 Boss drops ${tier} loot`);

            const event = new CustomEvent('boss-loot-drop', {
                detail: { tier, boss: context.npcData }
            });
            document.dispatchEvent(event);

            return { tier, dropped: true };
        });

        this.registerHandler('teleportPlayer', (params, context) => {
            const [location] = params;
            console.log(`🤖 Boss teleports player to: ${location}`);

            const event = new CustomEvent('player-teleport', {
                detail: { location, source: context.npcData }
            });
            document.dispatchEvent(event);

            if (typeof addMessage === 'function') {
                addMessage(`You are teleported to ${location}!`, 'info');
            }

            return { location };
        });

        console.log(`🤖 Registered ${Object.keys(this.handlers).length} command handlers`);
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎯 UTILITY - helpers and tools
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get command prompt text for NPC system prompts
     * @param {string} npcType - Type of NPC
     * @returns {string} Text to inject into system prompt
     */
    getCommandPromptForNPC(npcType) {
        const availableCommands = this.getAvailableCommands(npcType);
        if (availableCommands.length === 0) return '';

        const definitions = GameConfig?.apiCommands?.definitions || {};

        let prompt = '\n\nYou can use special commands in your responses by including them in curly braces:\n';

        for (const cmdName of availableCommands) {
            const def = definitions[cmdName];
            if (!def) continue;

            if (def.params && def.params.length > 0) {
                prompt += `- {${cmdName}:${def.params.join(',')}} - ${def.description}\n`;
            } else {
                prompt += `- {${cmdName}} - ${def.description}\n`;
            }
        }

        prompt += '\nUse these naturally in conversation. Example: "Let me show you my wares! {openMarket}"\n';
        prompt += 'Commands will be processed automatically and removed from the displayed text.\n';

        return prompt;
    },

    /**
     * Enable debooger mode 🦇
     */
    enableDebooger() {
        this.deboogerMode = true;
        console.log('🤖 APICommandSystem debooger mode 🦇 enabled 🖤💀');
    },

    /**
     * Disable debooger mode 🦇
     */
    disableDebooger() {
        this.deboogerMode = false;
        console.log('🤖 APICommandSystem debooger mode 🦇 disabled 🔮⚰️');
    },

    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            handlersCount: Object.keys(this.handlers).length,
            handlers: Object.keys(this.handlers),
            lastCommand: this.lastExecutedCommand,
            deboogerMode: this.deboogerMode
        };
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL BINDING - make it accessible everywhere
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.APICommandSystem = APICommandSystem;
}

// register with Bootstrap
Bootstrap.register('APICommandSystem', () => APICommandSystem.init(), {
    dependencies: ['DeboogerSystem'],
    priority: 205,
    severity: 'optional'
});

console.log('🤖 APICommandSystem loaded... awaiting initialization');
