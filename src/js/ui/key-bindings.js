// ═══════════════════════════════════════════════════════════════
// KEY BINDINGS - global keyboard shortcuts system
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const KeyBindings = {
    // 🎮 Get defaults from GameConfig (or use fallbacks if config not loaded) ⚰️
    get defaults() {
        if (typeof GameConfig !== 'undefined' && GameConfig.keybindings) {
            return GameConfig.keybindings.defaults;
        }
        return {
            pause: ' ', inventory: 'i', character: 'c', financial: 'f',
            market: 'm', travel: 't', map: 'n', escape: 'Escape',
            quickSave: 'F5', quickLoad: 'F9', mapUp: 'w', mapDown: 's',
            mapLeft: 'a', mapRight: 'd', zoomIn: '=', zoomOut: '-',
            properties: 'p', achievements: 'h', settings: ',', quests: 'q',
            people: 'o',
        };
    },

    // 🎮 Current bindings (loaded from localStorage or defaults) 🦇
    current: {},

    // 📝 Get descriptions from GameConfig (or use fallbacks) 🗡️
    get descriptions() {
        if (typeof GameConfig !== 'undefined' && GameConfig.keybindings) {
            return GameConfig.keybindings.descriptions;
        }
        return {
            pause: 'Pause/Resume Time', inventory: 'Open Inventory',
            character: 'Open Character Sheet', financial: 'Open Financial Sheet',
            market: 'Open Market', travel: 'Open Travel Panel', map: 'Open World Map',
            escape: 'Close/Exit', quickSave: 'Quick Save', quickLoad: 'Quick Load',
            mapUp: 'Pan Map Up', mapDown: 'Pan Map Down', mapLeft: 'Pan Map Left',
            mapRight: 'Pan Map Right', zoomIn: 'Zoom In', zoomOut: 'Zoom Out',
            properties: 'Open Properties', achievements: 'Open Achievements',
            settings: 'Open Settings', quests: 'Open Quest Log',
            people: 'Open People Panel',
        };
    },

    // 💾 Get storage key from GameConfig 🌙
    get storageKey() {
        if (typeof GameConfig !== 'undefined' && GameConfig.keybindings) {
            return GameConfig.keybindings.storageKey;
        }
        return 'tradingGame_keyBindings';
    },

    // 🔄 Is the user currently rebinding a key? 🔮
    isRebinding: false,
    rebindingAction: null,

    // 🖤 Initialize - wake up from the keyboard slumber 💀
    init() {
        this.loadBindings();
        this.setupGlobalKeyListener();
        console.log('⌨️ Keyboard bindings initialized - defaults from config.js');
    },

    // 📂 Load bindings from localStorage or use defaults ⚰️
    loadBindings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.current = { ...this.defaults, ...JSON.parse(saved) };
                console.log('⌨️ Loaded custom key bindings from localStorage');
            } else {
                this.current = { ...this.defaults };
                console.log('⌨️ Using default key bindings from config.js');
            }
        } catch (e) {
            this.current = { ...this.defaults };
            console.warn('⌨️ Failed to load key bindings, using defaults from config.js');
        }
    },

    // 💾 Save bindings to localStorage 🦇
    saveBindings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.current));
            console.log('⌨️ Key bindings saved to localStorage');
        } catch (e) {
            console.error('⌨️ Failed to save key bindings:', e);
        }
    },

    // 🔄 Reset to defaults from config.js 🗡️
    resetToDefaults() {
        this.current = { ...this.defaults };
        this.saveBindings();
        console.log('⌨️ Key bindings reset to config.js defaults');
        if (typeof addMessage === 'function') addMessage('🔄 Key bindings reset to defaults');
    },

    // 🔑 Get the key for an action 🌙
    getKey(action) {
        return this.current[action] || this.defaults[action];
    },

    // 🔑 Set a new key for an action 🔮
    setKey(action, key, skipMessage = false) {
        this.current[action] = key;
        this.saveBindings();
        if (!skipMessage && typeof addMessage === 'function') {
            addMessage(`⌨️ "${this.descriptions[action]}" bound to ${this.formatKey(key)}`);
        }
        return true;
    },

    // 🎨 Format key for display 💀
    formatKey(key) {
        const specialKeys = {
            ' ': 'Space', 'Escape': 'Esc', 'ArrowUp': '↑', 'ArrowDown': '↓',
            'ArrowLeft': '←', 'ArrowRight': '→', 'Control': 'Ctrl',
            'Shift': 'Shift', 'Alt': 'Alt',
        };
        return specialKeys[key] || key.toUpperCase();
    },

    // 🔍 Check if a key matches an action ⚰️
    matches(event, action) {
        const key = this.getKey(action);
        if (!key) return false;

        // 🖤💀 IGNORE keybindings if Ctrl/Alt/Meta are pressed (allow native browser shortcuts like Ctrl+C, Ctrl+V) 💀
        // Exception: function keys like F5, F9 should still work
        if (event.ctrlKey || event.altKey || event.metaKey) {
            // Only allow function keys to work with modifiers
            if (!key.startsWith('F')) return false;
        }

        if (key === 'F5' || key === 'F9') return event.key === key;
        return event.key.toLowerCase() === key.toLowerCase() || event.key === key;
    },

    // 👁️ Setup the global key listener - the all-seeing keyboard eye 🦇
    setupGlobalKeyListener() {
        document.addEventListener('keydown', (event) => {
            const target = event.target;
            const isTyping = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable ||
                           target.closest('[contenteditable="true"]');

            if (isTyping) return;

            if (this.isRebinding) {
                event.preventDefault();
                this.completeRebind(event.key);
                return;
            }

            this.processKeyPress(event);
        });
    },

    // ⚡ Process a key press - the moment of truth 🗡️
    processKeyPress(event) {
        // Escape always works
        if (this.matches(event, 'escape')) {
            event.preventDefault();
            this.handleEscape();
            return;
        }

        // Space for pause/resume
        if (this.matches(event, 'pause')) {
            if (game.state === GameState.PLAYING) {
                event.preventDefault();
                this.handlePause();
                return;
            }
        }

        // WASD for map panning - always works during gameplay, no conflict with other keys 🖤
        if (this.matches(event, 'mapUp') || this.matches(event, 'mapDown') ||
            this.matches(event, 'mapLeft') || this.matches(event, 'mapRight')) {
            const mapOverlay = document.getElementById('world-map-overlay');
            const isMapOpen = mapOverlay && mapOverlay.classList.contains('active');

            // 💀 WASD works during PLAYING state OR when map overlay is open
            if (game.state === GameState.PLAYING || isMapOpen) {
                event.preventDefault(); // ⚰️ Prevent default browser behavior
                this.handleMapPan(event);
                return;
            }
        }

        // 🖤💀 FIXED: Allow panel shortcuts in multiple game states, not just PLAYING 💀
        // Panels need to toggle even when another panel is open (MARKET, TRAVEL, INVENTORY, etc.)
        const validStates = [GameState.PLAYING, GameState.MARKET, GameState.TRAVEL, GameState.INVENTORY, GameState.TRANSPORTATION, GameState.PAUSED];
        if (!validStates.includes(game.state)) return;

        // Zoom controls
        if (this.matches(event, 'zoomIn')) {
            event.preventDefault();
            if (typeof GameWorldRenderer !== 'undefined') GameWorldRenderer.zoomIn();
            return;
        }
        if (this.matches(event, 'zoomOut')) {
            event.preventDefault();
            if (typeof GameWorldRenderer !== 'undefined') GameWorldRenderer.zoomOut();
            return;
        }

        // Panel shortcuts
        if (this.matches(event, 'inventory')) {
            event.preventDefault();
            if (typeof openInventory === 'function') openInventory();
            if (typeof addMessage === 'function') addMessage('📦 Inventory opened [I]');
            return;
        }
        if (this.matches(event, 'character')) {
            event.preventDefault();
            this.openCharacterSheet();
            return;
        }
        if (this.matches(event, 'financial')) {
            event.preventDefault();
            this.openFinancialSheet();
            return;
        }
        if (this.matches(event, 'market')) {
            event.preventDefault();
            this.openMarket(); // 🖤 Use toggle-aware method 💀
            return;
        }
        if (this.matches(event, 'travel')) {
            event.preventDefault();
            this.openTravel(); // 🖤 Use toggle-aware method 💀
            return;
        }
        if (this.matches(event, 'map')) {
            event.preventDefault();
            if (typeof game !== 'undefined') game.showOverlay('world-map-overlay');
            if (typeof addMessage === 'function') addMessage('🌍 World map opened [N]');
            return;
        }
        if (this.matches(event, 'properties')) {
            event.preventDefault();
            if (typeof game !== 'undefined') game.showOverlay('property-employee-panel');
            if (typeof addMessage === 'function') addMessage('🏠 Properties opened [P]');
            return;
        }
        if (this.matches(event, 'people')) {
            event.preventDefault();
            if (typeof PeoplePanel !== 'undefined') PeoplePanel.toggle();
            if (typeof addMessage === 'function') addMessage('👥 People panel opened [O]');
            return;
        }
        if (this.matches(event, 'achievements')) {
            event.preventDefault();
            if (typeof openAchievementPanel === 'function') openAchievementPanel();
            if (typeof addMessage === 'function') addMessage('🏆 Achievements opened [H]');
            return;
        }
        if (this.matches(event, 'settings')) {
            event.preventDefault();
            if (typeof SettingsPanel !== 'undefined' && SettingsPanel.show) SettingsPanel.show();
            if (typeof addMessage === 'function') addMessage('⚙️ Settings opened [,]');
            return;
        }
        if (this.matches(event, 'quests')) {
            event.preventDefault();
            if (typeof QuestSystem !== 'undefined') QuestSystem.toggleQuestLog();
            if (typeof addMessage === 'function') addMessage('📜 Quest log opened [Q]');
            return;
        }

        // Quick save/load
        if (this.matches(event, 'quickSave')) {
            event.preventDefault();
            if (typeof SaveLoadSystem !== 'undefined') {
                SaveLoadSystem.quickSave();
                if (typeof addMessage === 'function') addMessage('💾 Quick saved! [F5]');
            }
            return;
        }
        if (this.matches(event, 'quickLoad')) {
            event.preventDefault();
            if (typeof SaveLoadSystem !== 'undefined') {
                SaveLoadSystem.quickLoad();
                if (typeof addMessage === 'function') addMessage('📂 Quick loaded! [F9]');
            }
            return;
        }
    },

    // ⛔ Handle escape key - the great closer 🌙
    handleEscape() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            if (typeof addMessage === 'function') addMessage('🖥️ Exited fullscreen');
            return;
        }

        if (typeof game !== 'undefined' && game.hideAllOverlays) {
            const overlays = document.querySelectorAll('.overlay.active');
            if (overlays.length > 0) {
                game.hideAllOverlays();
                if (typeof addMessage === 'function') addMessage('✖️ Closed overlay');
                return;
            }
        }

        if (game.state === GameState.PLAYING) {
            if (typeof toggleMenu === 'function') toggleMenu();
        } else if (game.state !== GameState.MENU) {
            if (typeof hideAllPanels === 'function') hideAllPanels();
            if (typeof changeState === 'function') changeState(GameState.PLAYING);
        }
    },

    // ⏸️ Handle pause/resume 🔮
    handlePause() {
        if (typeof TimeSystem !== 'undefined') {
            if (TimeSystem.isPaused) {
                TimeSystem.setSpeed('NORMAL');
                if (typeof addMessage === 'function') addMessage('▶️ Time resumed [Space]');
            } else {
                TimeSystem.setSpeed('PAUSED');
                if (typeof addMessage === 'function') addMessage('⏸️ Time paused [Space]');
            }
            if (typeof game !== 'undefined' && game.updateTimeControls) {
                game.updateTimeControls();
            }
        }
    },

    // 🗺️ Handle map panning with WASD 💀
    handleMapPan(event) {
        event.preventDefault();
        const panAmount = 50;
        let dx = 0, dy = 0;

        if (this.matches(event, 'mapUp')) dy = panAmount;
        if (this.matches(event, 'mapDown')) dy = -panAmount;
        if (this.matches(event, 'mapLeft')) dx = panAmount;
        if (this.matches(event, 'mapRight')) dx = -panAmount;

        if (typeof GameWorldRenderer !== 'undefined' && GameWorldRenderer.mapState) {
            GameWorldRenderer.mapState.offsetX += dx;
            GameWorldRenderer.mapState.offsetY += dy;
            GameWorldRenderer.render();
            if (GameWorldRenderer.updateTransform) GameWorldRenderer.updateTransform();
        }
    },

    // 👤 Toggle character sheet ⚰️
    openCharacterSheet() {
        const overlay = document.getElementById('character-sheet-overlay');
        if (overlay && (overlay.classList.contains('active') || overlay.style.display === 'flex')) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            return;
        }
        if (typeof showCharacterSheet === 'function') {
            showCharacterSheet();
        } else {
            this.createCharacterSheetOverlay();
        }
        if (typeof addMessage === 'function') addMessage('👤 Character sheet opened [C]');
    },

    // 🎨 Create character sheet overlay dynamically 🦇
    createCharacterSheetOverlay() {
        let overlay = document.getElementById('character-sheet-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'character-sheet-overlay';
            overlay.className = 'overlay';
            overlay.innerHTML = `
                <div class="overlay-content character-sheet-content">
                    <button class="overlay-close" data-close-overlay="character-sheet-overlay">×</button>
                    <h2>👤 Character Sheet</h2>
                    <div id="character-sheet-body"></div>
                </div>
            `;
            document.getElementById('overlay-container').appendChild(overlay);

            overlay.querySelector('.overlay-close').addEventListener('click', () => {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            });
        }

        this.populateCharacterSheet();
        overlay.style.display = 'flex';
        overlay.classList.add('active');
    },

    // 📊 Populate character sheet with all player info 🗡️
    populateCharacterSheet() {
        const body = document.getElementById('character-sheet-body');
        if (!body || !game.player) return;

        const player = game.player;
        const stats = player.stats || {};
        const attrs = player.attributes || {};

        body.innerHTML = `
            <div class="char-sheet-section current-task-section">
                <h3>🎯 Current Activity</h3>
                <div id="current-task-display" class="current-task-display">
                    ${this.getCurrentTaskHTML()}
                </div>
            </div>

            <div class="char-sheet-section">
                <h3>🏷️ Identity</h3>
                <div class="char-info-row"><span>Name:</span><span class="char-value">${player.name || 'Unknown'}</span></div>
                <div class="char-info-row"><span>Gold:</span><span class="char-value gold">💰 ${(player.gold || 0).toLocaleString()}</span></div>
                <div class="char-info-row"><span>Location:</span><span class="char-value">${game.currentLocation?.name || 'Unknown'}</span></div>
            </div>

            <div class="char-sheet-section">
                <h3>📊 Attributes</h3>
                <div class="char-attrs-grid">
                    <div class="char-attr"><span>💪 Strength</span><span>${attrs.strength || 5}</span></div>
                    <div class="char-attr"><span>🧠 Intelligence</span><span>${attrs.intelligence || 5}</span></div>
                    <div class="char-attr"><span>😊 Charisma</span><span>${attrs.charisma || 5}</span></div>
                    <div class="char-attr"><span>🏃 Endurance</span><span>${attrs.endurance || 5}</span></div>
                    <div class="char-attr"><span>🍀 Luck</span><span>${attrs.luck || 5}</span></div>
                </div>
            </div>

            <div class="char-sheet-section">
                <h3>❤️ Vitals</h3>
                <div class="char-vitals">
                    <div class="char-vital"><span>Health</span><div class="vital-bar-inline"><div style="width: ${(stats.health / stats.maxHealth) * 100}%; background: #e53935;"></div></div><span>${Math.round(stats.health)}/${Math.round(stats.maxHealth)}</span></div>
                    <div class="char-vital"><span>Hunger</span><div class="vital-bar-inline"><div style="width: ${(stats.hunger / stats.maxHunger) * 100}%; background: #ff9800;"></div></div><span>${Math.round(stats.hunger)}/${Math.round(stats.maxHunger)}</span></div>
                    <div class="char-vital"><span>Thirst</span><div class="vital-bar-inline"><div style="width: ${(stats.thirst / stats.maxThirst) * 100}%; background: #2196f3;"></div></div><span>${Math.round(stats.thirst)}/${Math.round(stats.maxThirst)}</span></div>
                    <div class="char-vital"><span>Stamina</span><div class="vital-bar-inline"><div style="width: ${(stats.stamina / stats.maxStamina) * 100}%; background: #9c27b0;"></div></div><span>${Math.round(stats.stamina)}/${Math.round(stats.maxStamina)}</span></div>
                    <div class="char-vital"><span>Happiness</span><div class="vital-bar-inline"><div style="width: ${(stats.happiness / stats.maxHappiness) * 100}%; background: #4caf50;"></div></div><span>${Math.round(stats.happiness)}/${Math.round(stats.maxHappiness)}</span></div>
                </div>
            </div>

            <div class="char-sheet-section">
                <h3>⚡ Active Effects</h3>
                <div class="char-effects" id="char-effects-list">
                    ${this.getActiveEffectsHTML()}
                </div>
            </div>

            <div class="char-sheet-section">
                <h3>🎒 Equipment</h3>
                <div class="char-equipment" id="char-equipment-list">
                    ${this.getEquipmentHTML()}
                </div>
            </div>

            <div class="char-sheet-section">
                <h3>⭐ Perks</h3>
                <div class="char-perks" id="char-perks-list">
                    ${this.getPerksHTML()}
                </div>
            </div>

            <div class="char-sheet-section leaderboard-section">
                <h3>🏆 Leaderboard</h3>
                <div class="leaderboard-actions">
                    <button class="char-action-btn preview-score-btn" onclick="LeaderboardFeatures.showScorePreview()">
                        👁️ Preview Score
                    </button>
                    <button class="char-action-btn active-scores-btn" onclick="LeaderboardFeatures.showActiveHighScores()">
                        📊 Active High Scores
                    </button>
                    <button class="char-action-btn retire-btn" onclick="LeaderboardFeatures.confirmRetire()">
                        🏖️ Retire Character
                    </button>
                </div>
                <p class="leaderboard-hint">Retire to immortalize your run on the Hall of Champions!</p>
            </div>
        `;
    },

    // ⚡ Get active effects HTML 🌙
    getActiveEffectsHTML() {
        if (!game.player || !game.player.temporaryEffects) {
            return '<div class="no-effects">No active effects</div>';
        }
        const effects = Object.entries(game.player.temporaryEffects);
        if (effects.length === 0) {
            return '<div class="no-effects">No active effects</div>';
        }
        return effects.map(([stat, effect]) => `
            <div class="effect-item ${effect.value > 0 ? 'buff' : 'debuff'}">
                <span>${stat}: ${effect.value > 0 ? '+' : ''}${effect.value}</span>
                <span class="effect-duration">${effect.duration}min left</span>
            </div>
        `).join('');
    },

    // 🎒 Get equipment HTML 🔮
    getEquipmentHTML() {
        if (typeof EquipmentSystem !== 'undefined') {
            return EquipmentSystem.createEquipmentHTML();
        }

        if (!game.player || !game.player.equipment) {
            return '<div class="no-equipment">No equipment - visit a merchant to buy gear!</div>';
        }
        const equipment = Object.entries(game.player.equipment).filter(([_, itemId]) => itemId);
        if (equipment.length === 0) {
            return '<div class="no-equipment">No equipment - visit a merchant to buy gear!</div>';
        }
        return equipment.map(([slot, itemId]) => {
            const item = ItemDatabase?.items?.[itemId];
            return `
                <div class="equipment-slot">
                    <span class="slot-icon">${item?.icon || '📦'}</span>
                    <span class="slot-name">${slot}:</span>
                    <span class="item-name">${item?.name || itemId}</span>
                </div>
            `;
        }).join('');
    },

    // ⭐ Get perks HTML 💀
    getPerksHTML() {
        if (!game.player || !game.player.perks || game.player.perks.length === 0) {
            return '<div class="no-perks">no perks selected... a blank slate of mediocrity</div>';
        }

        const perksDB = typeof perks !== 'undefined' ? perks : window.perks;

        return game.player.perks.map(perkIdOrObj => {
            let perkData = null;
            let perkId = null;

            if (typeof perkIdOrObj === 'string') {
                perkId = perkIdOrObj;
                perkData = perksDB ? perksDB[perkIdOrObj] : null;
            } else if (typeof perkIdOrObj === 'object' && perkIdOrObj !== null) {
                perkData = perkIdOrObj;
                perkId = perkIdOrObj.id || 'unknown';
            }

            if (!perkData) {
                return `
                    <div class="perk-item unknown" title="perk data not found for: ${perkIdOrObj}">
                        <span class="perk-name">❓ ${perkIdOrObj || 'Unknown Perk'}</span>
                        <span class="perk-desc">mysterious origins... even we dont know what this does</span>
                    </div>
                `;
            }

            const effectsList = perkData.effects ? Object.entries(perkData.effects)
                .map(([key, val]) => `${key}: ${typeof val === 'number' ? (val > 0 ? '+' : '') + (val * 100).toFixed(0) + '%' : val}`)
                .join(', ') : '';

            const negativesList = perkData.negativeEffects ? Object.entries(perkData.negativeEffects)
                .map(([key, val]) => `${key}: ${typeof val === 'number' ? '-' + (val * 100).toFixed(0) + '%' : val}`)
                .join(', ') : '';

            const tooltip = `${perkData.description || ''}${effectsList ? '\\n\\n✨ Bonuses: ' + effectsList : ''}${negativesList ? '\\n\\n💀 Drawbacks: ' + negativesList : ''}`;

            return `
                <div class="perk-item ${perkData.type || ''}" title="${tooltip.replace(/"/g, '&quot;')}">
                    <span class="perk-icon">${perkData.icon || '⭐'}</span>
                    <div class="perk-info">
                        <span class="perk-name">${perkData.name || perkIdOrObj}</span>
                        <span class="perk-desc">${perkData.description || 'no description available'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // 🎯 Get current task HTML ⚰️
    getCurrentTaskHTML() {
        const task = typeof CurrentTaskSystem !== 'undefined' ? CurrentTaskSystem.getCurrentTask() : { type: 'idle', action: 'Idle', icon: '😐' };
        const taskClass = task.type || 'idle';

        return `
            <div class="current-task ${taskClass}">
                <span class="task-icon">${task.icon}</span>
                <div class="task-details">
                    <span class="task-action">${task.action}</span>
                    ${task.detail ? `<span class="task-detail">${task.detail}</span>` : ''}
                </div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎮 UNIFIED PANEL OPENERS - All action bar buttons use these
    // ═══════════════════════════════════════════════════════════════

    // 📋 Open game menu
    openMenu() {
        if (typeof toggleMenu === 'function') toggleMenu();
        else console.warn('toggleMenu function not found');
    },

    // 🏪 Toggle market panel - 🖤 proper toggle logic 💀
    openMarket() {
        const panel = document.getElementById('market-panel');
        if (panel && !panel.classList.contains('hidden')) {
            // Panel is open - close it
            panel.classList.add('hidden');
            if (typeof PanelManager !== 'undefined') PanelManager.updateToolbarButtons();
            if (typeof addMessage === 'function') addMessage('🏪 Market closed [M]');
        } else {
            // Panel is closed - open it
            if (typeof openMarket === 'function') openMarket();
            else console.warn('openMarket function not found');
            if (typeof addMessage === 'function') addMessage('🏪 Market opened [M]');
        }
    },

    // 🗺️ Toggle travel panel - 🖤 proper toggle logic 💀
    openTravel() {
        const panel = document.getElementById('travel-panel');
        if (panel && !panel.classList.contains('hidden')) {
            // Panel is open - close it
            panel.classList.add('hidden');
            if (typeof PanelManager !== 'undefined') PanelManager.updateToolbarButtons();
            if (typeof addMessage === 'function') addMessage('🗺️ Travel closed [T]');
        } else {
            // Panel is closed - open it
            if (typeof openTravel === 'function') openTravel();
            else console.warn('openTravel function not found');
            if (typeof addMessage === 'function') addMessage('🗺️ Travel opened [T]');
        }
    },

    // 🚗 Toggle transportation panel
    // 🖤💀 FIXED: Was calling openTravel() instead of transportation panel! 💀
    openTransportation() {
        const panel = document.getElementById('transportation-panel');
        if (panel && !panel.classList.contains('hidden')) {
            // Panel is open - close it
            panel.classList.add('hidden');
            if (typeof PanelManager !== 'undefined') PanelManager.updateToolbarButtons();
            if (typeof addMessage === 'function') addMessage('🚗 Transportation closed [W]');
        } else {
            // Panel is closed - open it
            if (panel) {
                panel.classList.remove('hidden');
                if (typeof PanelManager !== 'undefined') PanelManager.updateToolbarButtons();
                if (typeof addMessage === 'function') addMessage('🚗 Transportation opened [W]');
            } else {
                console.warn('transportation-panel not found');
            }
        }
    },

    // 🎒 Toggle inventory panel
    // 🖤💀 FIXED: Proper toggle logic like other panels 💀
    openInventory() {
        const panel = document.getElementById('inventory-panel');
        if (panel && !panel.classList.contains('hidden')) {
            // Panel is open - close it
            panel.classList.add('hidden');
            if (typeof PanelManager !== 'undefined') PanelManager.updateToolbarButtons();
            if (typeof addMessage === 'function') addMessage('🎒 Inventory closed [I]');
        } else {
            // Panel is closed - open it
            if (typeof openInventory === 'function') openInventory();
            else console.warn('openInventory function not found');
            if (typeof addMessage === 'function') addMessage('🎒 Inventory opened [I]');
        }
    },

    // 👥 Open people panel
    openPeople() {
        if (typeof PeoplePanel !== 'undefined' && PeoplePanel.toggle) PeoplePanel.toggle();
        else console.warn('PeoplePanel not found');
    },

    // 📜 Open quests panel
    openQuests() {
        if (typeof QuestSystem !== 'undefined' && QuestSystem.toggleQuestLog) QuestSystem.toggleQuestLog();
        else console.warn('QuestSystem not found');
    },

    // 🏆 Toggle achievements panel
    openAchievements() {
        const overlay = document.getElementById('achievement-overlay');
        if (overlay && overlay.classList.contains('active')) {
            if (typeof closeAchievementPanel === 'function') closeAchievementPanel();
            else overlay.classList.remove('active');
        } else {
            if (typeof openAchievementPanel === 'function') openAchievementPanel();
            else if (typeof AchievementSystem !== 'undefined' && AchievementSystem.showPanel) AchievementSystem.showPanel();
            else console.warn('Achievement panel not found');
        }
    },

    // 💾 Open save dialog
    openSave() {
        if (typeof SaveUISystem !== 'undefined' && SaveUISystem.openSaveAsDialog) SaveUISystem.openSaveAsDialog();
        else if (typeof SaveLoadUI !== 'undefined' && SaveLoadUI.show) SaveLoadUI.show('saves');
        else console.warn('Save system not found');
    },

    // 📂 Open load dialog
    openLoad() {
        if (typeof SaveUISystem !== 'undefined' && SaveUISystem.openLoadGameDialog) SaveUISystem.openLoadGameDialog();
        else if (typeof SaveLoadUI !== 'undefined' && SaveLoadUI.show) SaveLoadUI.show('load');
        else console.warn('Load system not found');
    },

    // ⚙️ Toggle settings panel
    openSettings() {
        if (typeof SettingsPanel === 'undefined') {
            console.warn('SettingsPanel not found');
            return;
        }
        const panel = SettingsPanel.panelElement || document.getElementById('settings-panel');
        if (panel && panel.classList.contains('active')) {
            if (SettingsPanel.hide) SettingsPanel.hide();
        } else {
            if (SettingsPanel.show) SettingsPanel.show();
        }
    },

    // 🏠 Toggle properties panel
    openProperties() {
        const panel = document.getElementById('property-employee-panel');
        if (panel) {
            const isVisible = !panel.classList.contains('hidden') && panel.style.display !== 'none';
            if (isVisible) {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            } else {
                panel.classList.remove('hidden');
                panel.style.display = '';
            }
        } else {
            console.warn('property-employee-panel not found');
        }
    },

    // 💰 Toggle financial sheet
    openFinancialSheet() {
        const overlay = document.getElementById('financial-sheet-overlay');
        if (overlay && (overlay.classList.contains('active') || overlay.style.display === 'flex')) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            return;
        }
        this.createFinancialSheetOverlay();
        if (typeof addMessage === 'function') addMessage('💰 Financial sheet opened [F]');
    },

    // 🎨 Create financial sheet overlay 🗡️
    createFinancialSheetOverlay() {
        let overlay = document.getElementById('financial-sheet-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'financial-sheet-overlay';
            overlay.className = 'overlay';
            overlay.innerHTML = `
                <div class="overlay-content financial-sheet-content">
                    <button class="overlay-close" data-close-overlay="financial-sheet-overlay">×</button>
                    <h2>💰 Financial Report</h2>
                    <div id="financial-sheet-body"></div>
                </div>
            `;
            const container = document.getElementById('overlay-container');
            if (container) {
                container.appendChild(overlay);
            } else {
                document.body.appendChild(overlay);
            }

            overlay.querySelector('.overlay-close').addEventListener('click', () => {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            });
        }

        this.populateFinancialSheet();
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        overlay.classList.remove('hidden');
    },

    // 📊 Populate financial sheet 🌙
    populateFinancialSheet() {
        const body = document.getElementById('financial-sheet-body');
        if (!body) return;

        const gold = game.player?.gold || 0;
        const properties = typeof PropertySystem !== 'undefined' ? PropertySystem.getProperties() : [];
        const employees = typeof EmployeeSystem !== 'undefined' ? EmployeeSystem.getEmployees() : [];
        const tradeRoutes = typeof TradeRouteSystem !== 'undefined' ? TradeRouteSystem.getTradeRoutes() : [];

        let dailyIncome = 0;
        let weeklyWages = 0;
        properties.forEach(p => { dailyIncome += p.income || 0; });
        employees.forEach(e => { weeklyWages += e.wage || 0; });

        body.innerHTML = `
            <div class="fin-section">
                <h3>💎 Current Assets</h3>
                <div class="fin-row main"><span>Gold on Hand:</span><span class="gold-value">💰 ${gold.toLocaleString()}</span></div>
            </div>

            <div class="fin-section">
                <h3>📈 Income</h3>
                <div class="fin-row"><span>Daily Property Income:</span><span class="positive">+${dailyIncome.toLocaleString()}/day</span></div>
                <div class="fin-row"><span>Active Trade Routes:</span><span>${tradeRoutes.length}</span></div>
            </div>

            <div class="fin-section">
                <h3>📉 Expenses</h3>
                <div class="fin-row"><span>Weekly Employee Wages:</span><span class="negative">-${weeklyWages.toLocaleString()}/week</span></div>
            </div>

            <div class="fin-section">
                <h3>🏠 Properties (${properties.length})</h3>
                ${properties.length > 0 ? properties.map(p => `
                    <div class="fin-property">
                        <span>${p.name || 'Property'}</span>
                        <span class="positive">+${(p.income || 0).toLocaleString()}/day</span>
                    </div>
                `).join('') : '<div class="no-data">No properties owned</div>'}
            </div>

            <div class="fin-section">
                <h3>👥 Employees (${employees.length})</h3>
                ${employees.length > 0 ? employees.map(e => `
                    <div class="fin-employee">
                        <span>${e.name || 'Employee'} - ${e.role || 'Worker'}</span>
                        <span class="negative">-${(e.wage || 0).toLocaleString()}/week</span>
                    </div>
                `).join('') : '<div class="no-data">No employees hired</div>'}
            </div>

            <div class="fin-section summary">
                <h3>📊 Summary</h3>
                <div class="fin-row"><span>Est. Daily Profit:</span><span class="${dailyIncome - (weeklyWages / 7) >= 0 ? 'positive' : 'negative'}">${(dailyIncome - (weeklyWages / 7)).toFixed(0)}/day</span></div>
                <div class="fin-row"><span>Est. Weekly Profit:</span><span class="${(dailyIncome * 7) - weeklyWages >= 0 ? 'positive' : 'negative'}">${((dailyIncome * 7) - weeklyWages).toLocaleString()}/week</span></div>
            </div>
        `;
    },

    // 🔄 Start rebinding a key 🔮
    startRebind(action) {
        this.isRebinding = true;
        this.rebindingAction = action;
        if (typeof addMessage === 'function') addMessage(`⌨️ Press any key to bind to "${this.descriptions[action]}"...`);
    },

    // ✅ Complete rebinding 💀
    completeRebind(key) {
        if (this.rebindingAction) {
            this.setKey(this.rebindingAction, key);
        }
        this.isRebinding = false;
        this.rebindingAction = null;

        if (typeof SettingsPanel !== 'undefined' && SettingsPanel.refreshKeyBindingsUI) {
            SettingsPanel.refreshKeyBindingsUI();
        }
    },

    // 📋 Get all bindings for settings UI ⚰️
    getAllBindings() {
        return Object.entries(this.current).map(([action, key]) => ({
            action,
            key,
            description: this.descriptions[action] || action,
            displayKey: this.formatKey(key)
        }));
    }
};

// 🌙 expose to global scope 🦇
window.KeyBindings = KeyBindings;
