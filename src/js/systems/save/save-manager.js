// ═══════════════════════════════════════════════════════════════
// SAVE MANAGER - preserving your descent into capitalism
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

// 🖤 Custom error types for save/load operations - differentiate error handling 💀
class SaveError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'SaveError';
        this.code = code;
        this.details = details;
    }
}

// 🖤 Error codes for save operations 💀
const SaveErrorCodes = {
    INVALID_SLOT: 'INVALID_SLOT',
    STORAGE_FULL: 'STORAGE_FULL',
    COMPRESSION_FAILED: 'COMPRESSION_FAILED',
    SERIALIZATION_FAILED: 'SERIALIZATION_FAILED',
    SLOT_EMPTY: 'SLOT_EMPTY',
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    DATA_CORRUPTED: 'DATA_CORRUPTED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    DECOMPRESSION_FAILED: 'DECOMPRESSION_FAILED',
    GAME_STATE_ERROR: 'GAME_STATE_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED'
};

const SaveManager = {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    maxSaveSlots: 10,
    maxAutoSaveSlots: 10,
    autoSaveInterval: 900000, // 15 minutes (real time) - configurable in settings
    compressionEnabled: true,

    // 🖤 SAVE FORMAT VERSIONING - for migrations 💀
    // Increment SAVE_FORMAT when save structure changes
    // Add migration handler in MIGRATIONS for backward compatibility
    SAVE_FORMAT: 2,  // Current format version (integer for easy comparison)
    saveVersion: '1.0.0',  // Legacy - kept for backward compat

    // 🖤 Migration handlers: { fromFormat: migrationFunction } 💀
    // Each migration transforms save data from version N to N+1
    MIGRATIONS: {
        // Format 1 → 2: Added questItems, doomVisitedLocations, questMetrics
        1: (saveData) => {
            console.log('💾 Migrating save from format 1 → 2...');
            const gd = saveData.gameData;

            // Add questItems if missing
            if (gd.player && !gd.player.questItems) {
                gd.player.questItems = {};
            }

            // Add doomVisitedLocations if missing
            if (gd.worldState && !gd.worldState.doomVisitedLocations) {
                gd.worldState.doomVisitedLocations = [];
            }

            // Add questMetrics if missing
            if (gd.questState && !gd.questState.questMetrics) {
                gd.questState.questMetrics = {
                    mainQuestsCompleted: 0,
                    sideQuestsCompleted: 0,
                    doomQuestsCompleted: 0,
                    totalQuestsCompleted: gd.questState.completedQuests?.length || 0
                };
            }

            saveData._saveFormat = 2;
            return saveData;
        }
        // Future migrations go here:
        // 2: (saveData) => { /* migrate format 2 → 3 */ }
    },

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    saveSlots: {},

    // 🖤 Escape HTML - sanitize save names or die 💀
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },
    autoSaveSlots: [],
    currentAutoSaveIndex: 0,
    currentSaveSlot: null,
    lastAutoSave: Date.now(),
    isAutoSaving: false,
    _selectedSaveSlot: null,
    _selectedLoadSlot: null,
    _selectedLoadType: 'manual',
    _wasGamePaused: false,

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('💾 SaveManager: Initializing unified save system...');

        this.loadSaveSlotsMetadata();
        this.loadAutoSaveIntervalSetting();
        this.setupAutoSave();
        this.setupKeyboardShortcuts();
        this.setupEventListeners();
        this.createUI();

        // 🏆 Initialize Hall of Champions on main menu
        setTimeout(() => {
            if (typeof SaveUISystem !== 'undefined') {
                SaveUISystem.init();
            }
        }, 100);

        // 🖤 Refresh Load button state now that SaveManager is ready 💀
        if (typeof refreshLoadButtonState === 'function') {
            refreshLoadButtonState();
        }

        console.log('💾 SaveManager: Ready!');
    },

    loadSaveSlotsMetadata() {
        const metadata = localStorage.getItem('tradingGameSaveSlots');
        if (metadata) {
            try {
                this.saveSlots = JSON.parse(metadata);
            } catch (e) {
                // 🦇 Corrupt metadata - silently reset to empty, not worth screaming about
                console.warn('💀 Save slots metadata corrupt, resetting...');
                localStorage.removeItem('tradingGameSaveSlots');
                this.saveSlots = {};
            }
        } else {
            for (let i = 1; i <= this.maxSaveSlots; i++) {
                this.saveSlots[i] = {
                    name: `Save Slot ${i}`,
                    timestamp: null,
                    exists: false,
                    screenshot: null,
                    version: null
                };
            }
            this.saveSaveSlotsMetadata();
        }

        const autoSaveData = localStorage.getItem('tradingGameAutoSaveSlots');
        if (autoSaveData) {
            try {
                const parsed = JSON.parse(autoSaveData);
                this.autoSaveSlots = parsed.slots || [];
                this.currentAutoSaveIndex = parsed.currentIndex || 0;
            } catch (e) {
                this.autoSaveSlots = [];
                this.currentAutoSaveIndex = 0;
            }
        }
    },

    // 🕐 Load autosave interval from localStorage
    loadAutoSaveIntervalSetting() {
        const savedInterval = localStorage.getItem('tradingGameAutoSaveInterval');
        if (savedInterval) {
            const interval = parseInt(savedInterval, 10);
            // Validate it's one of our allowed values
            const validIntervals = [300000, 900000, 1800000, 3600000]; // 5m, 15m, 30m, 1hr
            if (validIntervals.includes(interval)) {
                this.autoSaveInterval = interval;
                console.log(`💾 Autosave interval loaded: ${interval / 60000} minutes`);
            }
        }
    },

    // 🕐 Set and save autosave interval
    setAutoSaveInterval(intervalMs) {
        const validIntervals = [300000, 900000, 1800000, 3600000]; // 5m, 15m, 30m, 1hr
        if (!validIntervals.includes(intervalMs)) {
            console.warn('💀 Invalid autosave interval:', intervalMs);
            return false;
        }

        this.autoSaveInterval = intervalMs;
        localStorage.setItem('tradingGameAutoSaveInterval', intervalMs.toString());

        // Restart autosave timer with new interval
        if (typeof TimerManager !== 'undefined' && this._autoSaveTimerId) {
            TimerManager.clearInterval(this._autoSaveTimerId);
        }
        this.setupAutoSave();

        console.log(`💾 Autosave interval set to: ${intervalMs / 60000} minutes`);
        return true;
    },

    saveSaveSlotsMetadata() {
        try {
            localStorage.setItem('tradingGameSaveSlots', JSON.stringify(this.saveSlots));
            localStorage.setItem('tradingGameAutoSaveSlots', JSON.stringify({
                slots: this.autoSaveSlots,
                currentIndex: this.currentAutoSaveIndex
            }));
        } catch (e) {
            // 🦇 localStorage might be full - warn but don't scream, game still works
            console.warn('💀 Failed to save slots metadata (storage full?):', e.message);
        }
    },

    setupAutoSave() {
        if (typeof TimerManager !== 'undefined') {
            this._autoSaveTimerId = TimerManager.setInterval(() => {
                if (typeof game !== 'undefined' && game.state === GameState.PLAYING && game.settings?.autoSave) {
                    this.autoSave();
                }
            }, this.autoSaveInterval);
        }
    },

    setupKeyboardShortcuts() {
        const handler = (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.quickSave();
            } else if (e.key === 'F9') {
                e.preventDefault();
                this.quickLoad();
            }
        };

        if (typeof EventManager !== 'undefined') {
            EventManager.addEventListener(document, 'keydown', handler);
        } else {
            document.addEventListener('keydown', handler);
        }
    },

    setupEventListeners() {
        // Emergency save on page close
        window.addEventListener('beforeunload', () => {
            if (typeof game !== 'undefined' && game.state === GameState.PLAYING && game.settings?.autoSave) {
                this.performEmergencySave();
            }
        });

        window.addEventListener('pagehide', () => {
            if (typeof game !== 'undefined' && game.state === GameState.PLAYING) {
                this.performEmergencySave();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && typeof game !== 'undefined' && game.state === GameState.PLAYING) {
                this.performEmergencySave();
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // CORE SAVE/LOAD LOGIC
    // ═══════════════════════════════════════════════════════════════

    getCompleteGameState() {
        const safeCall = (fn, fallback = null) => {
            try { return fn(); } catch(e) { return fallback; }
        };

        const safeMapEntries = (map) => {
            try {
                if (map && typeof map.entries === 'function') {
                    return Array.from(map.entries());
                }
                return [];
            } catch(e) { return []; }
        };

        return {
            version: this.saveVersion,
            _saveFormat: this.SAVE_FORMAT,  // 🖤 Track format for migrations 💀
            timestamp: Date.now(),
            gameData: {
                state: game.state,
                gameTick: game.gameTick,
                player: game.player ? {
                    characterId: game.player.characterId, // 🏆 Unique ID for leaderboard deduplication
                    name: game.player.name,
                    class: game.player.class,
                    difficulty: game.player.difficulty,
                    gold: game.player.gold,
                    inventory: game.player.inventory,
                    equipment: game.player.equipment,
                    stats: game.player.stats, // 🖤 Contains health, hunger, thirst, stamina, happiness + max values 💀
                    attributes: game.player.attributes,
                    skills: game.player.skills,
                    perks: game.player.perks,
                    transportation: game.player.transportation,
                    ownedTransportation: game.player.ownedTransportation,
                    currentLoad: game.player.currentLoad,
                    maxLoad: game.player.maxLoad,
                    ownedProperties: game.player.ownedProperties,
                    ownedEmployees: game.player.ownedEmployees,
                    reputation: game.player.reputation,
                    visitedLocations: game.player.visitedLocations,
                    temporaryEffects: game.player.temporaryEffects,
                    level: game.player.level,
                    experience: game.player.experience,
                    tradeRoutes: game.player.tradeRoutes,
                    questItems: game.player.questItems || {}, // 🖤 Quest items for delivery quests 💀
                    // 🖤 Additional player state that was missing 💀
                    ownedTools: game.player.ownedTools || [],
                    toolDurability: game.player.toolDurability || {},
                    ownsHouse: game.player.ownsHouse || false,
                    lastRestTime: game.player.lastRestTime || 0
                } : null,
                currentLocation: game.currentLocation,
                // 🖤 Use TimeMachine's getSaveData for complete time state
                timeState: typeof TimeMachine !== 'undefined' && TimeMachine.getSaveData
                    ? TimeMachine.getSaveData()
                    : (typeof TimeSystem !== 'undefined' ? {
                        currentTime: TimeSystem.currentTime,
                        currentSpeed: TimeSystem.currentSpeed,
                        isPaused: TimeSystem.isPaused
                    } : null),
                eventState: typeof EventSystem !== 'undefined' ? {
                    activeEvents: safeCall(() => EventSystem.getActiveEvents(), []),
                    scheduledEvents: EventSystem.scheduledEvents || []
                } : null,
                worldState: typeof GameWorld !== 'undefined' ? {
                    unlockedRegions: GameWorld.unlockedRegions || ['starter'],
                    visitedLocations: GameWorld.visitedLocations || [],
                    doomVisitedLocations: GameWorld.doomVisitedLocations || [] // 🖤💀 Separate doom world progress!
                } : null,
                questState: typeof QuestSystem !== 'undefined' ? {
                    activeQuests: QuestSystem.activeQuests || {},
                    completedQuests: QuestSystem.completedQuests || [],
                    failedQuests: QuestSystem.failedQuests || [],
                    discoveredQuests: QuestSystem.discoveredQuests || [],
                    questCompletionTimes: QuestSystem.questCompletionTimes || {},
                    trackedQuestId: QuestSystem.trackedQuestId || null,
                    trackerHidden: QuestSystem.trackerHidden || false,
                    // 🖤 v0.90+ Quest metrics for leaderboard
                    questMetrics: {
                        mainQuestsCompleted: QuestSystem.completedQuests?.filter(q => q.startsWith('act'))?.length || 0,
                        sideQuestsCompleted: QuestSystem.completedQuests?.filter(q =>
                            q.includes('_vermin_') || q.includes('_farm_') || q.includes('_pirates_') ||
                            q.includes('_wine_') || q.includes('_wars_') || q.includes('_steel_') ||
                            q.includes('_smugglers_') || q.includes('_silk_') || q.includes('_guard_') ||
                            q.includes('_noble_') || q.includes('_wolves_') || q.includes('_fur_') ||
                            q.includes('_bandits_') || q.includes('_pioneer_'))?.length || 0,
                        doomQuestsCompleted: QuestSystem.completedQuests?.filter(q => q.startsWith('doom_'))?.length || 0,
                        totalQuestsCompleted: QuestSystem.completedQuests?.length || 0
                    }
                } : null,
                // 🖤 Faction reputation - the void remembers who you served 💀
                factionState: typeof FactionSystem !== 'undefined' && FactionSystem.getState
                    ? FactionSystem.getState()
                    : null,
                // 🖤 NPC relationships - per-slot isolation (fixes global localStorage bug) 💀
                npcRelationships: typeof NPCRelationshipSystem !== 'undefined' && NPCRelationshipSystem.getSaveData
                    ? NPCRelationshipSystem.getSaveData()
                    : null,
                marketData: {
                    marketPrices: game.marketPrices || {},
                    marketPriceModifier: game.marketPriceModifier || 1
                },
                settings: game.settings || {},
                // 🖤 Panel positions - save player's custom panel layout
                panelPositions: typeof DraggablePanels !== 'undefined' ? DraggablePanels.getAllPositions() : {},
                // 🖤 Additional systems that need state persistence 💀
                doomWorldState: typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.getSaveData
                    ? DoomWorldSystem.getSaveData()
                    : null,
                weatherState: typeof WeatherSystem !== 'undefined' && WeatherSystem.getState
                    ? WeatherSystem.getState()
                    : null,
                mountState: typeof MountSystem !== 'undefined' && MountSystem.getSaveData
                    ? MountSystem.getSaveData()
                    : null,
                shipState: typeof ShipSystem !== 'undefined' && ShipSystem.getSaveData
                    ? ShipSystem.getSaveData()
                    : null,
                merchantRankState: typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.getSaveData
                    ? MerchantRankSystem.getSaveData()
                    : null,
                reputationState: typeof ReputationSystem !== 'undefined' && ReputationSystem.getSaveData
                    ? ReputationSystem.getSaveData()
                    : null,
                achievementState: typeof AchievementSystem !== 'undefined' && AchievementSystem.getProgress
                    ? AchievementSystem.getProgress()
                    : null,
                // 🖤 Travel system state - includes doom path discovery 💀
                travelState: typeof TravelSystem !== 'undefined' ? {
                    isInDoomWorld: TravelSystem.isInDoomWorld?.() || false,
                    doomDiscoveredPaths: TravelSystem.doomDiscoveredPaths || [],
                    isTraveling: TravelSystem.isTraveling || false,
                    currentTravelRoute: TravelSystem.currentTravelRoute || null
                } : null,
                // 🖤 NPC Merchant economy state - per-slot isolation (no more exploit!) 💀
                merchantEconomyState: typeof NPCMerchantSystem !== 'undefined' && NPCMerchantSystem.getSaveData
                    ? NPCMerchantSystem.getSaveData()
                    : null,
                // 🖤 NPC Schedule state - registered NPC schedules persist 💀
                npcScheduleState: typeof NPCScheduleSystem !== 'undefined' && NPCScheduleSystem.getSaveData
                    ? NPCScheduleSystem.getSaveData()
                    : null
            }
        };
    },

    // 🖤 SAVE DATA SCHEMA - defines expected structure for validation 💀
    SAVE_SCHEMA: {
        version: { type: 'string', required: true },
        _saveFormat: { type: 'number', required: false },
        timestamp: { type: 'number', required: true },
        gameData: {
            type: 'object',
            required: true,
            properties: {
                // 🖤 GameState is a string enum ('menu', 'playing', etc.), not a number 💀
                state: { type: 'string', required: false },
                gameTick: { type: 'number', required: false },
                currentLocation: { type: 'object', required: false },
                player: {
                    type: 'object',
                    required: true,
                    properties: {
                        name: { type: 'string', required: true },
                        gold: { type: 'number', required: true },
                        // 🖤 Inventory is an OBJECT {itemId: count}, not an array 💀
                        inventory: { type: 'object', required: false },
                        stats: { type: 'object', required: false },
                        level: { type: 'number', required: false }
                    }
                },
                timeState: { type: 'object', required: false },
                worldState: { type: 'object', required: false },
                questState: { type: 'object', required: false },
                marketData: { type: 'object', required: false },
                settings: { type: 'object', required: false }
            }
        }
    },

    validateSaveData(saveData) {
        const errors = [];
        const warnings = [];

        // Basic structure check
        if (!saveData || typeof saveData !== 'object') {
            errors.push('Invalid save data structure');
            return { valid: false, errors, warnings };
        }

        // 🖤 Recursive schema validation 💀
        this._validateAgainstSchema(saveData, this.SAVE_SCHEMA, '', errors, warnings);

        // 🖤 Additional semantic validation 💀
        if (saveData.gameData?.player) {
            const player = saveData.gameData.player;

            // Gold should be non-negative
            if (typeof player.gold === 'number' && player.gold < 0) {
                warnings.push('Player gold is negative (will be clamped to 0)');
            }

            // Level should be positive
            if (typeof player.level === 'number' && player.level < 1) {
                warnings.push('Player level is less than 1 (will default to 1)');
            }

            // Name should not be empty
            if (typeof player.name === 'string' && player.name.trim() === '') {
                warnings.push('Player name is empty');
            }
        }

        // Timestamp should be in the past
        if (saveData.timestamp && saveData.timestamp > Date.now() + 60000) {
            warnings.push('Save timestamp is in the future');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    },

    // 🖤 Helper: Validate object against schema recursively 💀
    _validateAgainstSchema(data, schema, path, errors, warnings) {
        for (const [key, rules] of Object.entries(schema)) {
            const fullPath = path ? `${path}.${key}` : key;
            const value = data?.[key];

            // Check required fields
            if (rules.required && (value === undefined || value === null)) {
                errors.push(`Missing required field: ${fullPath}`);
                continue;
            }

            // Skip optional missing fields
            if (value === undefined || value === null) continue;

            // Check type
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push(`Invalid type for ${fullPath}: expected ${rules.type}, got ${actualType}`);
                    continue;
                }
            }

            // Recurse into nested objects
            if (rules.type === 'object' && rules.properties && typeof value === 'object') {
                this._validateAgainstSchema(value, rules.properties, fullPath, errors, warnings);
            }
        }
    },

    // 🖤 Migrate save data from older formats to current 💀
    migrateSaveData(saveData) {
        // Determine format version (old saves without _saveFormat are format 1)
        let currentFormat = saveData._saveFormat || 1;

        // Already at current format - no migration needed
        if (currentFormat >= this.SAVE_FORMAT) {
            return saveData;
        }

        console.log(`💾 Save format ${currentFormat} detected, migrating to ${this.SAVE_FORMAT}...`);

        // Apply migrations sequentially
        while (currentFormat < this.SAVE_FORMAT) {
            const migration = this.MIGRATIONS[currentFormat];
            if (migration) {
                try {
                    saveData = migration(saveData);
                    currentFormat++;
                } catch (e) {
                    console.error(`💀 Migration from format ${currentFormat} failed:`, e);
                    break; // Stop migrating but try to load what we have
                }
            } else {
                console.warn(`💀 No migration found for format ${currentFormat}`);
                break;
            }
        }

        console.log(`💾 Migration complete. Save now at format ${saveData._saveFormat || currentFormat}`);
        return saveData;
    },

    // Unicode compression for localStorage efficiency
    compressSaveData(saveData) {
        try {
            const trimmed = this.trimSaveData(saveData);
            const jsonString = JSON.stringify(trimmed);
            const compressed = this.unicodeCompress(jsonString);
            return 'UC:' + compressed;
        } catch (e) {
            // 🦇 Compression failed - fallback to uncompressed, no big deal
            console.warn('💾 Compression failed, using uncompressed save');
            return JSON.stringify(saveData);
        }
    },

    trimSaveData(saveData) {
        const trimmed = JSON.parse(JSON.stringify(saveData));
        if (trimmed.gameData) {
            // Limit arrays
            if (trimmed.gameData.tradingState?.tradeHistory) {
                trimmed.gameData.tradingState.tradeHistory = trimmed.gameData.tradingState.tradeHistory.slice(-20);
            }
            if (trimmed.gameData.eventState?.scheduledEvents) {
                trimmed.gameData.eventState.scheduledEvents = trimmed.gameData.eventState.scheduledEvents.slice(-20);
            }
        }
        return trimmed;
    },

    decompressSaveData(compressedData) {
        try {
            if (compressedData.startsWith('UC:')) {
                return JSON.parse(this.unicodeDecompress(compressedData.slice(3)));
            }
            if (compressedData.startsWith('LZ:')) {
                try { return JSON.parse(atob(compressedData.slice(3))); } catch(e) {}
            }
            return JSON.parse(compressedData);
        } catch (e) {
            // 🦇 Corrupt save data - return null, caller handles the fallback
            console.warn('💾 Decompression failed - save may be corrupt');
            return null;
        }
    },

    unicodeCompress(str) {
        if (!str) return '';
        let result = '';
        for (let i = 0; i < str.length; i += 2) {
            const c1 = str.charCodeAt(i);
            const c2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
            result += String.fromCharCode((c1 << 8) | c2);
        }
        return str.length + ':' + result;
    },

    unicodeDecompress(compressed) {
        if (!compressed) return '';
        const colonIdx = compressed.indexOf(':');
        if (colonIdx === -1) throw new Error('Invalid format');
        const originalLen = parseInt(compressed.substring(0, colonIdx), 10);
        const data = compressed.substring(colonIdx + 1);
        let result = '';
        for (let i = 0; i < data.length; i++) {
            const code = data.charCodeAt(i);
            result += String.fromCharCode(code >> 8);
            result += String.fromCharCode(code & 0xFF);
        }
        return result.substring(0, originalLen);
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    saveToSlot(slotNumber, customName = null) {
        if (slotNumber < 1 || slotNumber > this.maxSaveSlots) {
            if (typeof addMessage === 'function') addMessage('Invalid save slot!', 'error');
            return false;
        }

        try {
            const gameState = this.getCompleteGameState();
            const validation = this.validateSaveData(gameState);
            if (!validation.valid) {
                if (typeof addMessage === 'function') addMessage('Save validation failed', 'error');
                return false;
            }

            const compressedData = this.compressSaveData(gameState);
            localStorage.setItem(`tradingGameSave_${slotNumber}`, compressedData);

            this.saveSlots[slotNumber] = {
                name: customName || this.saveSlots[slotNumber]?.name || `Save Slot ${slotNumber}`,
                timestamp: Date.now(),
                exists: true,
                version: gameState.version,
                playerInfo: {
                    name: gameState.gameData.player?.name || 'Unknown',
                    level: gameState.gameData.player?.level || 1,
                    gold: gameState.gameData.player?.gold || 0,
                    location: gameState.gameData.currentLocation?.name || 'Unknown',
                    daysSurvived: this.calculateDaysSurvived(gameState)
                }
            };

            this.saveSaveSlotsMetadata();
            this.currentSaveSlot = slotNumber;

            if (typeof addMessage === 'function') {
                addMessage(`Game saved to ${this.saveSlots[slotNumber].name}!`, 'success');
            }

            // Submit to leaderboard
            if (typeof GlobalLeaderboardSystem !== 'undefined') {
                this.submitToLeaderboard(gameState);
            }

            // 🖤 Refresh main menu Load button state after save 💀
            if (typeof refreshLoadButtonState === 'function') {
                refreshLoadButtonState();
            }

            return true;
        } catch (e) {
            console.error('Save failed:', e);
            if (typeof addMessage === 'function') addMessage('Save failed: ' + e.message, 'error');
            return false;
        }
    },

    loadFromSlot(slotNumber) {
        // 🖤 Use typed errors for better error differentiation 💀
        try {
            if (slotNumber < 1 || slotNumber > this.maxSaveSlots) {
                throw new SaveError('Invalid save slot!', SaveErrorCodes.INVALID_SLOT, { slotNumber });
            }

            const slot = this.saveSlots[slotNumber];
            if (!slot?.exists) {
                throw new SaveError('No save in this slot!', SaveErrorCodes.SLOT_EMPTY, { slotNumber });
            }

            const compressedData = localStorage.getItem(`tradingGameSave_${slotNumber}`);
            if (!compressedData) {
                throw new SaveError('Save data not found!', SaveErrorCodes.DATA_NOT_FOUND, { slotNumber });
            }

            let saveData = this.decompressSaveData(compressedData);
            const validation = this.validateSaveData(saveData);
            if (!validation.valid) {
                throw new SaveError('Save data corrupted', SaveErrorCodes.DATA_CORRUPTED, {
                    slotNumber,
                    validationErrors: validation.errors
                });
            }

            // 🖤 Log warnings but continue loading 💀
            if (validation.warnings?.length > 0) {
                console.warn('💾 Save data warnings:', validation.warnings);
            }

            // 🖤 Apply migrations if needed 💀
            saveData = this.migrateSaveData(saveData);

            this.loadGameState(saveData.gameData);
            this.currentSaveSlot = slotNumber;

            if (typeof addMessage === 'function') {
                addMessage(`Game loaded from ${slot.name}!`, 'success');
            }
            return true;
        } catch (e) {
            // 🖤 Log with error code for debugging 💀
            const errorCode = e instanceof SaveError ? e.code : 'UNKNOWN';
            console.error(`Load failed [${errorCode}]:`, e.message, e.details || {});
            if (typeof addMessage === 'function') addMessage(e.message, 'error');
            return false;
        }
    },

    loadGameState(gameData) {
        if (!gameData) throw new Error('No game data provided');

        // Stop current game
        if (game.isRunning) game.stop();

        // Hide setup panels
        ['main-menu', 'game-setup-panel', 'character-panel'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });

        // Restore game state
        game.state = gameData.state === GameState.MENU ? GameState.PLAYING : gameData.state;
        game.gameTick = gameData.gameTick;
        game.currentLocation = gameData.currentLocation;
        game.marketPrices = gameData.marketData?.marketPrices || {};
        game.settings = { ...game.settings, ...gameData.settings };

        if (gameData.player) {
            game.player = { ...game.player, ...gameData.player };
        }

        // 🖤 Use TimeMachine's loadSaveData for complete time restoration
        if (gameData.timeState) {
            if (typeof TimeMachine !== 'undefined' && TimeMachine.loadSaveData) {
                TimeMachine.loadSaveData(gameData.timeState);
            } else if (typeof TimeSystem !== 'undefined') {
                TimeSystem.currentTime = gameData.timeState.currentTime;
                TimeSystem.setSpeed?.(gameData.timeState.currentSpeed);
                TimeSystem.isPaused = gameData.timeState.isPaused;
            }
        }

        if (gameData.worldState && typeof GameWorld !== 'undefined') {
            GameWorld.unlockedRegions = gameData.worldState.unlockedRegions || ['starter'];
            GameWorld.visitedLocations = gameData.worldState.visitedLocations || [];
            GameWorld.doomVisitedLocations = gameData.worldState.doomVisitedLocations || []; // 🖤💀 Separate doom world progress!
        }

        if (gameData.questState && typeof QuestSystem !== 'undefined') {
            QuestSystem.activeQuests = gameData.questState.activeQuests || {};
            QuestSystem.completedQuests = gameData.questState.completedQuests || [];
            // 🖤 Restore failed quests too - the void remembers ALL your failures 💀
            QuestSystem.failedQuests = gameData.questState.failedQuests || [];
            // 🖤 Restore quest completion times for cooldowns 💀
            QuestSystem.questCompletionTimes = gameData.questState.questCompletionTimes || {};
            QuestSystem.discoveredQuests = gameData.questState.discoveredQuests || [];
            QuestSystem.trackedQuestId = gameData.questState.trackedQuestId || null;
            // 🖤 Restore quest tracker visibility state
            QuestSystem.trackerHidden = gameData.questState.trackerHidden || false;
            // 🦇 Restore quest metrics for leaderboard
            if (gameData.questState.questMetrics) {
                QuestSystem.questMetrics = gameData.questState.questMetrics;
            }
        }

        // 🖤 Restore faction reputation - alliances from the darkness 💀
        if (gameData.factionState && typeof FactionSystem !== 'undefined' && FactionSystem.loadState) {
            FactionSystem.loadState(gameData.factionState);
        }

        // 🖤 Restore NPC relationships - per-slot isolation 💀
        if (gameData.npcRelationships && typeof NPCRelationshipSystem !== 'undefined' && NPCRelationshipSystem.loadSaveData) {
            NPCRelationshipSystem.loadSaveData(gameData.npcRelationships);
        }

        // 🖤 Restore EventSystem events - fixes events lost after reload 💀
        if (gameData.eventState && typeof EventSystem !== 'undefined' && EventSystem.loadSaveData) {
            EventSystem.loadSaveData(gameData.eventState);
        }

        // Show game UI (wrap in try-catch for robustness)
        try {
            if (typeof showGameUI === 'function') showGameUI();
        } catch (e) {
            console.warn('showGameUI failed:', e.message);
        }

        try {
            if (typeof changeState === 'function') changeState(GameState.PLAYING);
        } catch (e) {
            console.warn('changeState failed:', e.message);
            // Fallback: just set state directly
            game.state = GameState.PLAYING;
        }

        // Refresh displays (wrap in try-catch - UI elements may not exist)
        try {
            if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        } catch (e) {
            console.warn('updatePlayerInfo failed:', e.message);
        }

        try {
            if (typeof updateLocationInfo === 'function') updateLocationInfo();
        } catch (e) {
            console.warn('updateLocationInfo failed:', e.message);
        }

        // Start game
        try {
            game.start();
        } catch (e) {
            console.warn('game.start failed:', e.message);
        }

        // Deferred map render
        setTimeout(() => {
            if (typeof GameWorldRenderer !== 'undefined') {
                GameWorldRenderer.render?.();
                GameWorldRenderer.resetView?.();
            }
        }, 150);

        // 🖤 Restore panel positions from save
        if (gameData.panelPositions && typeof DraggablePanels !== 'undefined') {
            try {
                // Save to localStorage so DraggablePanels can load them
                localStorage.setItem(DraggablePanels.STORAGE_KEY, JSON.stringify(gameData.panelPositions));
                // Apply positions immediately
                DraggablePanels.loadPositions();
                console.log('🖤 Panel positions restored from save');
            } catch (e) {
                console.warn('🖤 Failed to restore panel positions:', e.message);
            }
        }

        // 🖤 Restore additional system states 💀
        // Doom World
        if (gameData.doomWorldState && typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.loadSaveData) {
            try {
                DoomWorldSystem.loadSaveData(gameData.doomWorldState);
                console.log('🖤 Doom world state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore doom world state:', e.message);
            }
        }

        // Weather System
        if (gameData.weatherState && typeof WeatherSystem !== 'undefined' && WeatherSystem.loadState) {
            try {
                WeatherSystem.loadState(gameData.weatherState);
                console.log('🖤 Weather state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore weather state:', e.message);
            }
        }

        // Mount System
        if (gameData.mountState && typeof MountSystem !== 'undefined' && MountSystem.loadSaveData) {
            try {
                MountSystem.loadSaveData(gameData.mountState);
                console.log('🖤 Mount state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore mount state:', e.message);
            }
        }

        // Ship System
        if (gameData.shipState && typeof ShipSystem !== 'undefined' && ShipSystem.loadSaveData) {
            try {
                ShipSystem.loadSaveData(gameData.shipState);
                console.log('🖤 Ship state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore ship state:', e.message);
            }
        }

        // Merchant Rank System
        if (gameData.merchantRankState && typeof MerchantRankSystem !== 'undefined' && MerchantRankSystem.loadSaveData) {
            try {
                MerchantRankSystem.loadSaveData(gameData.merchantRankState);
                console.log('🖤 Merchant rank restored');
            } catch (e) {
                console.warn('🖤 Failed to restore merchant rank:', e.message);
            }
        }

        // Reputation System (city reputation)
        if (gameData.reputationState && typeof ReputationSystem !== 'undefined' && ReputationSystem.loadSaveData) {
            try {
                ReputationSystem.loadSaveData(gameData.reputationState);
                console.log('🖤 City reputation restored');
            } catch (e) {
                console.warn('🖤 Failed to restore city reputation:', e.message);
            }
        }

        // Achievement System
        if (gameData.achievementState && typeof AchievementSystem !== 'undefined' && AchievementSystem.loadProgress) {
            try {
                AchievementSystem.loadProgress(gameData.achievementState);
                console.log('🖤 Achievement progress restored');
            } catch (e) {
                console.warn('🖤 Failed to restore achievement progress:', e.message);
            }
        }

        // Travel System (doom paths)
        if (gameData.travelState && typeof TravelSystem !== 'undefined') {
            try {
                if (gameData.travelState.doomDiscoveredPaths) {
                    TravelSystem.doomDiscoveredPaths = gameData.travelState.doomDiscoveredPaths;
                }
                if (gameData.travelState.isInDoomWorld && typeof game !== 'undefined') {
                    game.inDoomWorld = true;
                }
                console.log('🖤 Travel state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore travel state:', e.message);
            }
        }

        // 🖤 NPC Merchant economy state - per-slot isolation (no more exploit!) 💀
        if (gameData.merchantEconomyState && typeof NPCMerchantSystem !== 'undefined' && NPCMerchantSystem.loadSaveData) {
            try {
                NPCMerchantSystem.loadSaveData(gameData.merchantEconomyState);
                console.log('🖤 Merchant economy state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore merchant economy state:', e.message);
            }
        }

        // 🖤 NPC Schedule state - registered NPC schedules persist 💀
        if (gameData.npcScheduleState && typeof NPCScheduleSystem !== 'undefined' && NPCScheduleSystem.loadSaveData) {
            try {
                NPCScheduleSystem.loadSaveData(gameData.npcScheduleState);
                console.log('🖤 NPC schedule state restored');
            } catch (e) {
                console.warn('🖤 Failed to restore NPC schedule state:', e.message);
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // AUTO-SAVE & QUICK SAVE
    // ═══════════════════════════════════════════════════════════════

    autoSave(silent = false) {
        const now = Date.now();
        if (now - this.lastAutoSave < 30000 || this.isAutoSaving) return;

        this.isAutoSaving = true;
        try {
            const saveData = this.getCompleteGameState();
            if (!saveData) return;

            const compressedData = this.compressSaveData(saveData);
            const saveKey = `tradingGameAutoSave_${this.currentAutoSaveIndex}`;
            localStorage.setItem(saveKey, compressedData);

            const slotInfo = {
                index: this.currentAutoSaveIndex,
                timestamp: now,
                formattedTime: new Date().toLocaleString(),
                playerName: game.player?.name || 'Unknown',
                gold: game.player?.gold || 0,
                location: game.currentLocation?.name || 'Unknown',
                day: typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime?.day || 1 : 1
            };

            const existingIdx = this.autoSaveSlots.findIndex(s => s.index === this.currentAutoSaveIndex);
            if (existingIdx >= 0) {
                this.autoSaveSlots[existingIdx] = slotInfo;
            } else {
                this.autoSaveSlots.push(slotInfo);
            }

            this.autoSaveSlots.sort((a, b) => b.timestamp - a.timestamp);
            if (this.autoSaveSlots.length > this.maxAutoSaveSlots) {
                const removed = this.autoSaveSlots.pop();
                localStorage.removeItem(`tradingGameAutoSave_${removed.index}`);
            }

            this.currentAutoSaveIndex = (this.currentAutoSaveIndex + 1) % this.maxAutoSaveSlots;
            this.saveSaveSlotsMetadata();
            this.lastAutoSave = now;

            if (!silent && typeof addMessage === 'function') {
                addMessage('💾 Auto-saved!', 'info');
            }
        } finally {
            this.isAutoSaving = false;
        }
    },

    loadAutoSave(slotIndex) {
        const saveData = localStorage.getItem(`tradingGameAutoSave_${slotIndex}`);
        if (!saveData) {
            if (typeof addMessage === 'function') addMessage('Auto-save not found!', 'error');
            return false;
        }

        try {
            let parsed = this.decompressSaveData(saveData);
            // 🖤 Apply migrations if needed 💀
            parsed = this.migrateSaveData(parsed);
            this.loadGameState(parsed.gameData);
            if (typeof addMessage === 'function') addMessage('Auto-save loaded!', 'success');
            return true;
        } catch (e) {
            console.error('Failed to load auto-save:', e);
            return false;
        }
    },

    quickSave() {
        if (typeof game === 'undefined' || game.state !== GameState.PLAYING) {
            if (typeof addMessage === 'function') addMessage('Cannot save now!', 'error');
            return;
        }
        const slot = this.currentSaveSlot || 1;
        this.saveToSlot(slot);
    },

    quickLoad() {
        if (this.currentSaveSlot) {
            this.loadFromSlot(this.currentSaveSlot);
        } else {
            const mostRecent = this.findMostRecentSave();
            if (mostRecent) {
                this.loadFromSlot(mostRecent);
            } else if (typeof addMessage === 'function') {
                addMessage('No save to load!', 'error');
            }
        }
    },

    performEmergencySave() {
        if (typeof game === 'undefined' || !game.player || game.state !== GameState.PLAYING) return;
        try {
            const saveData = {
                version: this.saveVersion,
                timestamp: Date.now(),
                isEmergencySave: true,
                gameData: this.getCompleteGameState()?.gameData
            };
            localStorage.setItem('tradingGameEmergencySave', JSON.stringify(saveData));
        } catch (e) {
            // 🦇 Already in emergency mode - screaming won't help, stay silent
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    deleteSave(slotNumber) {
        if (slotNumber < 1 || slotNumber > this.maxSaveSlots) return false;

        localStorage.removeItem(`tradingGameSave_${slotNumber}`);
        this.saveSlots[slotNumber] = {
            name: `Save Slot ${slotNumber}`,
            timestamp: null,
            exists: false
        };
        this.saveSaveSlotsMetadata();

        if (this.currentSaveSlot === slotNumber) this.currentSaveSlot = null;
        if (typeof addMessage === 'function') addMessage(`Save ${slotNumber} deleted!`, 'success');
        return true;
    },

    findMostRecentSave() {
        let mostRecent = null;
        let mostRecentTime = 0;
        for (let i = 1; i <= this.maxSaveSlots; i++) {
            const slot = this.saveSlots[i];
            if (slot?.exists && slot.timestamp > mostRecentTime) {
                mostRecentTime = slot.timestamp;
                mostRecent = i;
            }
        }
        return mostRecent;
    },

    calculateDaysSurvived(saveData) {
        if (!saveData.gameData?.timeState?.currentTime) return 0;
        const t = saveData.gameData.timeState.currentTime;
        // 🖤 Get starting date from config - the single source of truth
        const startDate = typeof GameConfig !== 'undefined' ? GameConfig.time.startingDate : { year: 1111, month: 4, day: 1 };

        const startDays = startDate.day + (startDate.month - 1) * 30 + (startDate.year - 1) * 360;
        const currentDays = t.day + (t.month - 1) * 30 + (t.year - 1) * 360;

        return Math.max(0, currentDays - startDays);
    },

    getSaveSlotInfo(slotNumber) {
        const slot = this.saveSlots[slotNumber];
        if (!slot?.exists) {
            return { slotNumber, name: `Save Slot ${slotNumber}`, exists: false, isEmpty: true };
        }
        return {
            slotNumber,
            ...slot,
            isEmpty: false,
            formattedDate: new Date(slot.timestamp).toLocaleString(),
            timeSinceSave: this.getTimeSinceSave(slot.timestamp)
        };
    },

    getTimeSinceSave(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    },

    getAutoSaveList() {
        return this.autoSaveSlots.map(slot => ({
            ...slot,
            name: `Auto-Save ${slot.index + 1}`,
            key: `tradingGameAutoSave_${slot.index}`
        }));
    },

    async submitToLeaderboard(gameState) {
        try {
            const player = gameState?.gameData?.player;
            if (!player || typeof GlobalLeaderboardSystem === 'undefined') return false;

            const daysSurvived = this.calculateDaysSurvived(gameState);
            let score = Math.max(0, player.gold || 0) + daysSurvived * 10;

            const scoreData = {
                playerName: player.name || 'Unknown',
                characterId: player.characterId || null, // 🏆 CRITICAL: Prevents duplicate leaderboard entries 💀
                score,
                gold: player.gold || 0,
                daysSurvived,
                difficulty: player.difficulty || 'normal',
                isAlive: true
            };

            return await GlobalLeaderboardSystem.submitScore(scoreData);
        } catch (e) {
            // 🦇 Leaderboard is optional - don't spam console for network issues
            console.warn('🏆 Leaderboard submission failed (network?)');
            return false;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UI CREATION - Consolidated from SaveLoadUI and SaveUISystem
    // ═══════════════════════════════════════════════════════════════

    createUI() {
        this.injectStyles();
        this.createSaveDialog();
        this.createLoadDialog();
    },

    injectStyles() {
        if (document.getElementById('save-manager-styles')) return;

        const style = document.createElement('style');
        style.id = 'save-manager-styles';
        style.textContent = `
            .save-manager-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(5px);
                z-index: 3100; /* Z-INDEX FIX: Above .screen (3000) so LOAD GAME dialog is visible from main menu */
                display: none;
                align-items: center;
                justify-content: center;
            }
            .save-manager-dialog {
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid rgba(79, 195, 247, 0.5);
                border-radius: 12px;
                max-width: 550px;
                width: 90%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 40px rgba(79, 195, 247, 0.3);
            }
            .save-manager-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            }
            .save-manager-header h2 {
                margin: 0;
                color: #4fc3f7;
                font-size: 18px;
            }
            .save-manager-close {
                background: transparent;
                border: none;
                color: #888;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .save-manager-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
            .save-manager-content {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            .save-manager-slots {
                display: grid;
                gap: 8px;
            }
            .save-slot-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(40, 40, 70, 0.4);
                border: 1px solid rgba(79, 195, 247, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .save-slot-item:hover {
                background: rgba(79, 195, 247, 0.1);
                border-color: rgba(79, 195, 247, 0.4);
            }
            .save-slot-item.selected {
                background: rgba(79, 195, 247, 0.2);
                border-color: #4fc3f7;
            }
            .save-slot-item.empty { opacity: 0.6; }
            .slot-num {
                width: 32px;
                height: 32px;
                background: rgba(79, 195, 247, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4fc3f7;
                font-weight: bold;
                font-size: 14px;
            }
            .slot-info { flex: 1; }
            .slot-name { color: #fff; font-size: 14px; font-weight: 500; }
            .slot-meta { color: #888; font-size: 11px; margin-top: 2px; }
            .slot-meta span { margin-right: 10px; }
            .save-manager-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(79, 195, 247, 0.2);
            }
            .save-manager-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }
            .save-manager-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .btn-primary {
                background: linear-gradient(180deg, #4caf50 0%, #388e3c 100%);
                color: #fff;
            }
            .btn-secondary {
                background: rgba(79, 195, 247, 0.2);
                color: #4fc3f7;
                border: 1px solid rgba(79, 195, 247, 0.3);
            }
            .btn-danger {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                border: 1px solid rgba(244, 67, 54, 0.3);
            }
            .save-name-input {
                width: 100%;
                padding: 10px;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 6px;
                color: #fff;
                font-size: 14px;
                margin-bottom: 15px;
                box-sizing: border-box;
            }
            .save-name-input:focus { outline: none; border-color: #4fc3f7; }

            /* 🏆 Hall of Champions on Main Menu */
            .menu-leaderboard {
                margin-top: 30px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            .menu-leaderboard h3 {
                color: #ffd700;
                text-align: center;
                margin: 0 0 15px 0;
                font-size: 18px;
            }
            .leaderboard-entries {
                max-height: 250px;
                overflow-y: auto;
            }
            .leaderboard-empty {
                color: #666;
                text-align: center;
                padding: 20px;
                font-style: italic;
            }
            .leaderboard-entry {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(40, 40, 70, 0.4);
                border-radius: 8px;
                margin-bottom: 8px;
            }
            .leaderboard-entry.gold {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
                border: 1px solid rgba(255, 215, 0, 0.4);
            }
            .leaderboard-entry.silver {
                background: linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%);
                border: 1px solid rgba(192, 192, 192, 0.4);
            }
            .leaderboard-entry.bronze {
                background: linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%);
                border: 1px solid rgba(205, 127, 50, 0.4);
            }
            .entry-rank {
                font-size: 14px;
                min-width: 55px;
                text-align: center;
                font-weight: bold;
            }
            .entry-rank.gold { color: #ffd700; }
            .entry-rank.silver { color: #c0c0c0; }
            .entry-rank.bronze { color: #cd7f32; }
            .entry-info { flex: 1; }
            .entry-name { color: #fff; font-weight: bold; font-size: 14px; }
            .entry-stats {
                display: flex;
                gap: 15px;
                font-size: 11px;
                color: #888;
                margin-top: 3px;
            }
            .entry-status {
                font-size: 10px;
                margin-top: 3px;
                font-style: italic;
            }
            .entry-status.alive { color: #4caf50; }
            .entry-status.dead { color: #f44336; }
            .leaderboard-more {
                color: #888;
                text-align: center;
                padding: 10px;
                font-style: italic;
                font-size: 12px;
                border-top: 1px dashed rgba(255, 215, 0, 0.2);
                margin-top: 10px;
            }
            .view-all-champions-btn {
                width: 100%;
                margin-top: 15px;
                padding: 10px 20px;
                background: linear-gradient(180deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%);
                border: 1px solid rgba(255, 215, 0, 0.5);
                border-radius: 8px;
                color: #ffd700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .view-all-champions-btn:hover {
                background: linear-gradient(180deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 215, 0, 0.2) 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            }
            .leaderboard-loading {
                color: #ffd700;
                text-align: center;
                padding: 40px;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    },

    createSaveDialog() {
        if (document.getElementById('save-manager-save-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'save-manager-save-overlay';
        overlay.className = 'save-manager-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) this.closeSaveDialog(); };
        overlay.innerHTML = `
            <div class="save-manager-dialog">
                <div class="save-manager-header">
                    <h2>💾 Save Game</h2>
                    <button class="save-manager-close" onclick="SaveManager.closeSaveDialog()">✕</button>
                </div>
                <div class="save-manager-content">
                    <input type="text" class="save-name-input" id="save-name-input" placeholder="Enter save name..." maxlength="30">
                    <div class="save-manager-slots" id="save-slots-container"></div>
                </div>
                <div class="save-manager-footer">
                    <button class="save-manager-btn btn-secondary" onclick="SaveManager.closeSaveDialog()">Cancel</button>
                    <button class="save-manager-btn btn-primary" id="confirm-save-btn" onclick="SaveManager.confirmSave()">💾 Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    createLoadDialog() {
        if (document.getElementById('save-manager-load-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'save-manager-load-overlay';
        overlay.className = 'save-manager-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) this.closeLoadDialog(); };
        overlay.innerHTML = `
            <div class="save-manager-dialog">
                <div class="save-manager-header">
                    <h2>📂 Load Game</h2>
                    <button class="save-manager-close" onclick="SaveManager.closeLoadDialog()">✕</button>
                </div>
                <div class="save-manager-content">
                    <div class="save-manager-slots" id="load-slots-container"></div>
                </div>
                <div class="save-manager-footer">
                    <button class="save-manager-btn btn-danger" id="delete-save-btn" onclick="SaveManager.deleteSelectedLoad()" disabled>🗑️ Delete</button>
                    <div style="flex:1"></div>
                    <button class="save-manager-btn btn-secondary" onclick="SaveManager.closeLoadDialog()">Cancel</button>
                    <button class="save-manager-btn btn-primary" id="confirm-load-btn" onclick="SaveManager.confirmLoad()" disabled>📂 Load</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // ═══════════════════════════════════════════════════════════════
    // UI OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    openSaveDialog() {
        if (typeof game === 'undefined' || game.state !== GameState.PLAYING) {
            if (typeof addMessage === 'function') addMessage('Cannot save now!', 'error');
            return;
        }

        this._selectedSaveSlot = null;
        this.renderSaveSlots();

        const nameInput = document.getElementById('save-name-input');
        if (nameInput) {
            const day = typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime?.day || 1 : 1;
            nameInput.value = `${game.player?.name || 'Hero'} - Day ${day}`;
            nameInput.focus();
        }

        document.getElementById('save-manager-save-overlay').style.display = 'flex';

        if (typeof TimeSystem !== 'undefined' && !TimeSystem.isPaused) {
            this._wasGamePaused = false;
            TimeSystem.setSpeed('PAUSED');
        } else {
            this._wasGamePaused = true;
        }
    },

    closeSaveDialog() {
        document.getElementById('save-manager-save-overlay').style.display = 'none';
        if (!this._wasGamePaused && typeof TimeSystem !== 'undefined') {
            TimeSystem.setSpeed('NORMAL');
        }
    },

    openLoadDialog() {
        // 🐛 FIX: Reload metadata from localStorage to show latest saves
        this.loadSaveSlotsMetadata();

        this._selectedLoadSlot = null;
        this._selectedLoadType = 'manual';
        this.renderLoadSlots();

        document.getElementById('confirm-load-btn')?.setAttribute('disabled', 'true');
        document.getElementById('delete-save-btn')?.setAttribute('disabled', 'true');
        document.getElementById('save-manager-load-overlay').style.display = 'flex';
    },

    closeLoadDialog() {
        document.getElementById('save-manager-load-overlay').style.display = 'none';
    },

    renderSaveSlots() {
        const container = document.getElementById('save-slots-container');
        if (!container) return;

        let html = '';
        for (let i = 1; i <= this.maxSaveSlots; i++) {
            const slot = this.saveSlots[i];
            const isEmpty = !slot?.exists;
            const isSelected = this._selectedSaveSlot === i;

            if (isEmpty) {
                html += `
                    <div class="save-slot-item empty ${isSelected ? 'selected' : ''}" data-slot="${i}" onclick="SaveManager.selectSaveSlot(${i})">
                        <div class="slot-num">${i}</div>
                        <div class="slot-info">
                            <div class="slot-name">Empty Slot</div>
                            <div class="slot-meta">Click to save here</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="save-slot-item ${isSelected ? 'selected' : ''}" data-slot="${i}" onclick="SaveManager.selectSaveSlot(${i})">
                        <div class="slot-num">${i}</div>
                        <div class="slot-info">
                            <div class="slot-name">${this.escapeHtml(slot.name)}</div>
                            <div class="slot-meta">
                                <span>💰 ${(slot.playerInfo?.gold || 0).toLocaleString()}</span>
                                <span>📍 ${this.escapeHtml(slot.playerInfo?.location || 'Unknown')}</span>
                                <span>⚠️ Overwrite</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        container.innerHTML = html;

        // Auto-select first empty slot
        if (!this._selectedSaveSlot) {
            for (let i = 1; i <= this.maxSaveSlots; i++) {
                if (!this.saveSlots[i]?.exists) {
                    this.selectSaveSlot(i);
                    break;
                }
            }
            if (!this._selectedSaveSlot) this.selectSaveSlot(1);
        }
    },

    renderLoadSlots() {
        const container = document.getElementById('load-slots-container');
        if (!container) return;

        let html = '';
        let hasSaves = false;

        for (let i = 1; i <= this.maxSaveSlots; i++) {
            const slot = this.saveSlots[i];
            if (!slot?.exists) continue;
            hasSaves = true;

            const isSelected = this._selectedLoadSlot === i && this._selectedLoadType === 'manual';
            html += `
                <div class="save-slot-item ${isSelected ? 'selected' : ''}" data-slot="${i}" data-type="manual" onclick="SaveManager.selectLoadSlot(${i}, 'manual')">
                    <div class="slot-num">${i}</div>
                    <div class="slot-info">
                        <div class="slot-name">${this.escapeHtml(slot.name)}</div>
                        <div class="slot-meta">
                            <span>👤 ${this.escapeHtml(slot.playerInfo?.name || 'Unknown')}</span>
                            <span>💰 ${(slot.playerInfo?.gold || 0).toLocaleString()}</span>
                            <span>📅 ${slot.playerInfo?.daysSurvived || 0} days</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Add auto-saves
        const autoSaves = this.getAutoSaveList();
        autoSaves.forEach(save => {
            hasSaves = true;
            const isSelected = this._selectedLoadSlot === save.index && this._selectedLoadType === 'auto';
            html += `
                <div class="save-slot-item ${isSelected ? 'selected' : ''}" data-slot="${save.index}" data-type="auto" onclick="SaveManager.selectLoadSlot(${save.index}, 'auto')">
                    <div class="slot-num">🔄</div>
                    <div class="slot-info">
                        <div class="slot-name">${this.escapeHtml(save.name)}</div>
                        <div class="slot-meta">
                            <span>👤 ${this.escapeHtml(save.playerName)}</span>
                            <span>💰 ${(save.gold || 0).toLocaleString()}</span>
                            <span>📅 Day ${save.day || 1}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        if (!hasSaves) {
            html = '<div style="text-align:center;color:#666;padding:30px;">No saved games found</div>';
        }

        container.innerHTML = html;
    },

    selectSaveSlot(slotNumber) {
        this._selectedSaveSlot = slotNumber;
        document.querySelectorAll('#save-slots-container .save-slot-item').forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.slot) === slotNumber);
        });
    },

    selectLoadSlot(slotNumber, type) {
        this._selectedLoadSlot = slotNumber;
        this._selectedLoadType = type;

        document.querySelectorAll('#load-slots-container .save-slot-item').forEach(el => {
            const matches = parseInt(el.dataset.slot) === slotNumber && el.dataset.type === type;
            el.classList.toggle('selected', matches);
        });

        document.getElementById('confirm-load-btn')?.removeAttribute('disabled');
        document.getElementById('delete-save-btn')?.removeAttribute('disabled');
    },

    confirmSave() {
        if (!this._selectedSaveSlot) {
            if (typeof addMessage === 'function') addMessage('Select a slot!', 'error');
            return;
        }

        const nameInput = document.getElementById('save-name-input');
        const name = nameInput?.value.trim() || `Save ${this._selectedSaveSlot}`;
        const success = this.saveToSlot(this._selectedSaveSlot, name);

        if (success) {
            setTimeout(() => this.closeSaveDialog(), 500);
        }
    },

    confirmLoad() {
        if (this._selectedLoadSlot === null) return;

        let success = false;
        if (this._selectedLoadType === 'manual') {
            success = this.loadFromSlot(this._selectedLoadSlot);
        } else {
            success = this.loadAutoSave(this._selectedLoadSlot);
        }

        if (success) {
            this.closeLoadDialog();
            // Hide main menu if visible
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.classList.add('hidden');
                mainMenu.style.display = 'none';
            }
        }
    },

    // 🖤💀 FIXED: Use modal instead of browser confirm() 💀
    deleteSelectedLoad() {
        if (this._selectedLoadSlot === null) return;

        const doDelete = () => {
            if (this._selectedLoadType === 'manual') {
                this.deleteSave(this._selectedLoadSlot);
            } else {
                localStorage.removeItem(`tradingGameAutoSave_${this._selectedLoadSlot}`);
                this.autoSaveSlots = this.autoSaveSlots.filter(s => s.index !== this._selectedLoadSlot);
                this.saveSaveSlotsMetadata();
            }

            this._selectedLoadSlot = null;
            this.renderLoadSlots();
            document.getElementById('confirm-load-btn')?.setAttribute('disabled', 'true');
            document.getElementById('delete-save-btn')?.setAttribute('disabled', 'true');
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🗑️ Delete Save',
                content: '<p>Delete this save?</p><p style="color: #f44336; font-size: 12px;">This cannot be undone!</p>',
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🗑️ Delete', className: 'danger', onClick: () => { ModalSystem.hide(); doDelete(); } }
                ]
            });
        } else {
            doDelete();
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY - Aliases for old systems
// ═══════════════════════════════════════════════════════════════

// Map old SaveLoadSystem calls to SaveManager
window.SaveLoadSystem = SaveManager;
window.SaveLoadUI = {
    show: (tab) => tab === 'load' ? SaveManager.openLoadDialog() : SaveManager.openSaveDialog(),
    hide: () => { SaveManager.closeSaveDialog(); SaveManager.closeLoadDialog(); }
};
window.SaveUISystem = {
    openSaveAsDialog: () => SaveManager.openSaveDialog(),
    closeSaveAsDialog: () => SaveManager.closeSaveDialog(),
    openLoadGameDialog: () => SaveManager.openLoadDialog(),
    closeLoadGameDialog: () => SaveManager.closeLoadDialog(),
    init: () => {
        SaveUISystem.createLeaderboardDisplay();
        // 🖤 Initial update - may show empty if JSONBin fetch still in progress 💀
        SaveUISystem.updateLeaderboard();
        // 🦇 Retry after 2 seconds in case initial fetch was slow (deployed version)
        setTimeout(() => SaveUISystem.updateLeaderboard(), 2000);
        // 🦇 And again at 5 seconds for really slow connections
        setTimeout(() => SaveUISystem.updateLeaderboard(), 5000);
    },

    // 🏆 Create Hall of Champions display on main menu
    // 🖤 FIX: Added retry logic for race condition with DOM loading 💀
    createLeaderboardDisplay: (retryCount = 0) => {
        const mainMenu = document.getElementById('main-menu');
        if (!mainMenu) {
            // 🦇 Retry up to 5 times if DOM not ready yet
            if (retryCount < 5) {
                setTimeout(() => SaveUISystem.createLeaderboardDisplay(retryCount + 1), 500);
            }
            return;
        }

        const menuContent = mainMenu.querySelector('.menu-content');
        if (!menuContent) {
            // 🦇 Retry if menu-content not found yet
            if (retryCount < 5) {
                setTimeout(() => SaveUISystem.createLeaderboardDisplay(retryCount + 1), 500);
            }
            return;
        }

        // Don't create duplicates
        if (document.getElementById('main-menu-leaderboard')) return;

        const leaderboard = document.createElement('div');
        leaderboard.id = 'main-menu-leaderboard';
        leaderboard.className = 'menu-leaderboard';
        leaderboard.innerHTML = `
            <h3>🏆 Hall of Champions</h3>
            <div id="leaderboard-entries" class="leaderboard-entries">
                <div class="leaderboard-empty">No champions yet...</div>
            </div>
            <button class="view-all-champions-btn" onclick="SaveUISystem.openHallOfChampions()">View All Champions</button>
        `;

        // Insert before social links
        const socialLinks = document.getElementById('menu-social-links');
        if (socialLinks) {
            menuContent.insertBefore(leaderboard, socialLinks);
        } else {
            const menuFooter = menuContent.querySelector('.menu-footer');
            if (menuFooter) {
                menuContent.insertBefore(leaderboard, menuFooter);
            } else {
                menuContent.appendChild(leaderboard);
            }
        }
    },

    // 🏆 Update leaderboard entries display
    // 🖤 FIX: Added logging for debugging Hall of Champions display issues 💀
    updateLeaderboard: () => {
        const container = document.getElementById('leaderboard-entries');
        if (!container) {
            console.log('🏆 updateLeaderboard: leaderboard-entries container not found, creating it...');
            SaveUISystem.createLeaderboardDisplay();
            return;
        }

        // 🖤 Helper to render scores to the container 💀
        const renderScores = (scores) => {
            if (!scores || scores.length === 0) {
                container.innerHTML = '<div class="leaderboard-empty">No champions have risen yet...</div>';
                return;
            }

            const escapeHtml = (text) => {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = String(text);
                return div.innerHTML;
            };

            let html = '';
            scores.slice(0, 3).forEach((score, index) => {
                const rank = index + 1;
                let rankDisplay, rankClass = '';

                if (rank === 1) { rankDisplay = '👑 1st'; rankClass = 'gold'; }
                else if (rank === 2) { rankDisplay = '🥈 2nd'; rankClass = 'silver'; }
                else if (rank === 3) { rankDisplay = '🥉 3rd'; rankClass = 'bronze'; }

                const statusIcon = score.isAlive ? '💚' : '💀';
                const statusText = score.isAlive ? 'still playing' : (score.causeOfDeath || 'unknown');

                html += `
                    <div class="leaderboard-entry ${rankClass}">
                        <div class="entry-rank ${rankClass}">${rankDisplay}</div>
                        <div class="entry-info">
                            <div class="entry-name">${escapeHtml(score.playerName || 'Unknown')}</div>
                            <div class="entry-stats">
                                <span>💰 ${(score.score || 0).toLocaleString()}</span>
                                <span>📅 ${score.daysSurvived || 0} days</span>
                            </div>
                            <div class="entry-status ${score.isAlive ? 'alive' : 'dead'}">${statusIcon} ${statusText}</div>
                        </div>
                    </div>
                `;
            });

            if (scores.length > 3) {
                html += `<div class="leaderboard-more">+${scores.length - 3} more champions</div>`;
            }

            container.innerHTML = html;
        };

        // 🖤 Check if GlobalLeaderboardSystem is available and has data 💀
        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            // 🦇 First try to use cached data directly (no network call)
            if (GlobalLeaderboardSystem.leaderboard && GlobalLeaderboardSystem.leaderboard.length > 0) {
                renderScores(GlobalLeaderboardSystem.leaderboard);
                return;
            }

            // 🦇 If no cached data, wait for fetch (or trigger one if needed)
            GlobalLeaderboardSystem.fetchLeaderboard().then(scores => {
                renderScores(scores);
            }).catch(err => {
                container.innerHTML = '<div class="leaderboard-empty">Failed to load champions...</div>';
            });
        } else {
            container.innerHTML = '<div class="leaderboard-empty">Leaderboard system unavailable...</div>';
        }
    },

    // 🏆 Open full Hall of Champions overlay
    openHallOfChampions: () => {
        const overlay = document.getElementById('leaderboard-overlay');
        const content = document.getElementById('leaderboard-panel-content');

        if (!overlay) {
            // 🦇 DOM not ready yet - not an error, just skip
            console.warn('🏆 leaderboard-overlay not in DOM yet');
            return;
        }

        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (content) {
            content.innerHTML = '<div class="leaderboard-loading">Loading Hall of Champions...</div>';
        }

        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            GlobalLeaderboardSystem.fetchLeaderboard().then(() => {
                GlobalLeaderboardSystem.renderFullHallOfChampions('leaderboard-panel-content');
            }).catch(err => {
                // 🦇 Network issue - try cached data or show friendly message
                if (content && GlobalLeaderboardSystem.leaderboard?.length > 0) {
                    GlobalLeaderboardSystem.renderFullHallOfChampions('leaderboard-panel-content');
                } else if (content) {
                    content.innerHTML = '<div class="leaderboard-empty"><p>Unable to load champions...</p></div>';
                }
            });
        } else if (content) {
            content.innerHTML = '<div class="leaderboard-empty"><p>Leaderboard system not available.</p></div>';
        }
    },

    // 🏆 Close Hall of Champions overlay
    closeHallOfChampions: () => {
        const overlay = document.getElementById('leaderboard-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
};

// Global exposure
window.SaveManager = SaveManager;

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => SaveManager.init(), 500));
} else {
    setTimeout(() => SaveManager.init(), 500);
}

console.log('💾 SaveManager (unified) loaded');
