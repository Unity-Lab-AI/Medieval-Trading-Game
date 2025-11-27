// ═══════════════════════════════════════════════════════════════
// 🖤 SETTINGS PANEL - customizing your suffering experience 🖤
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// tweak audio, visuals, accessibility... make the darkness yours
// because one size fits none and we all suffer differently

const SettingsPanel = {
    // panel state - are we drowning in options or nah
    isOpen: false,
    panelElement: null,
    settingsTabs: {},

    // default settings - where hope goes to die
    // 🖤 defaultSettings now sourced from GameConfig.settings
    // one source of truth - change defaults in config.js, not here
    get defaultSettings() {
        // fallback defaults if GameConfig not loaded yet
        const fallback = {
            audio: { masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.7, isMuted: false, isMusicMuted: false, isSfxMuted: false, audioEnabled: true },
            visual: { particlesEnabled: true, screenShakeEnabled: true, animationsEnabled: true, weatherEffectsEnabled: true, quality: 'medium', reducedMotion: false, flashWarnings: true },
            animation: { animationsEnabled: true, animationSpeed: 1.0, reducedMotion: false, quality: 'medium' },
            ui: { animationsEnabled: true, hoverEffectsEnabled: true, transitionsEnabled: true, reducedMotion: false, highContrast: false, fontSize: 'medium', theme: 'default' },
            environmental: { weatherEffectsEnabled: true, lightingEnabled: true, seasonalEffectsEnabled: true, quality: 'medium', reducedEffects: false },
            accessibility: { reducedMotion: false, highContrast: false, screenReaderEnabled: false, flashWarnings: true, colorBlindMode: 'none', fontSize: 'medium', keyboardNavigation: true }
        };

        // use GameConfig.settings if available, otherwise fallback
        if (typeof GameConfig !== 'undefined' && GameConfig.settings) {
            return GameConfig.settings;
        }
        console.warn('⚠️ GameConfig.settings not available, using fallback defaults');
        return fallback;
    },

    // current settings - your personal flavor of chaos
    currentSettings: {},

    // initialize settings panel - birth of the preference nightmare
    init() {
        this.loadSettings();
        this.createPanel();
        this.setupEventListeners();
        console.log('Settings panel initialized');
    },

    // load settings from localStorage - resurrect your preferences
    loadSettings() {
        // load all setting categories - what fresh hell did we save last time
        Object.keys(this.defaultSettings).forEach(category => {
            const savedSettings = localStorage.getItem(`tradingGame${category.charAt(0).toUpperCase() + category.slice(1)}Settings`);
            if (savedSettings) {
                try {
                    this.currentSettings[category] = { ...this.defaultSettings[category], ...JSON.parse(savedSettings) };
                } catch (error) {
                    console.error(`Failed to load ${category} settings:`, error);
                    this.currentSettings[category] = { ...this.defaultSettings[category] };
                }
            } else {
                this.currentSettings[category] = { ...this.defaultSettings[category] };
            }
        });
    },

    // save settings to localStorage - etch your choices into the void
    saveSettings(category = null) {
        if (category) {
            localStorage.setItem(`tradingGame${category.charAt(0).toUpperCase() + category.slice(1)}Settings`,
                               JSON.stringify(this.currentSettings[category]));
        } else {
            // save all categories - commit to the full experience
            Object.keys(this.currentSettings).forEach(cat => {
                localStorage.setItem(`tradingGame${cat.charAt(0).toUpperCase() + cat.slice(1)}Settings`, 
                                   JSON.stringify(this.currentSettings[cat]));
            });
        }
    },

    // create settings panel - build the cathedral of customization
    createPanel() {
        // create main panel container - our temple of options
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'settings-panel';
        this.panelElement.className = 'settings-panel';
        this.panelElement.style.display = 'none';

        // create panel structure - the html monstrosity begins
        this.panelElement.innerHTML = `
            <div class="settings-panel-overlay">
                <div class="settings-panel-container">
                    <div class="settings-panel-header">
                        <h2>Game Settings</h2>
                        <button class="panel-close-x settings-close-btn" aria-label="Close settings">×</button>
                    </div>
                    
                    <div class="settings-tabs-wrapper">
                        <button class="settings-tabs-scroll-btn scroll-left" aria-label="Scroll tabs left">◀</button>
                        <div class="settings-panel-tabs">
                            <button class="settings-tab active" data-tab="audio">🔊 Audio</button>
                            <button class="settings-tab" data-tab="visual">🎨 Visual</button>
                            <button class="settings-tab" data-tab="animation">✨ Animation</button>
                            <button class="settings-tab" data-tab="ui">🖥️ UI</button>
                            <button class="settings-tab" data-tab="environmental">🌍 Environment</button>
                            <button class="settings-tab" data-tab="accessibility">♿ Access</button>
                            <button class="settings-tab" data-tab="aivoice">🎙️ AI Voice</button>
                            <button class="settings-tab" data-tab="controls">⌨️ Controls</button>
                            <button class="settings-tab" data-tab="saveload">💾 Save/Load</button>
                            <button class="settings-tab" data-tab="leaderboard">🏆 Scores</button>
                            <button class="settings-tab" data-tab="about">ℹ️ About</button>
                        </div>
                        <button class="settings-tabs-scroll-btn scroll-right" aria-label="Scroll tabs right">▶</button>
                    </div>
                    
                    <div class="settings-panel-content">
                        <!-- 🎵 Audio Tab - the soundtrack to our despair -->
                        <div class="settings-tab-content active" data-tab="audio">
                            <h3>Audio Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label for="master-volume">Master Volume</label>
                                    <input type="range" id="master-volume" min="0" max="1" step="0.1" value="0.7">
                                    <span class="setting-value">70%</span>
                                </div>
                                <div class="setting-item">
                                    <label for="music-volume">Music Volume</label>
                                    <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.5">
                                    <span class="setting-value">50%</span>
                                </div>
                                <div class="setting-item">
                                    <label for="sfx-volume">Sound Effects Volume</label>
                                    <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="0.7">
                                    <span class="setting-value">70%</span>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="audio-enabled" checked>
                                        Enable Audio
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="master-mute">
                                        Mute All
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="music-mute">
                                        Mute Music
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="sfx-mute">
                                        Mute Sound Effects
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- 👁️ Visual Tab - feast your eyes on this mess -->
                        <div class="settings-tab-content" data-tab="visual">
                            <h3>Visual Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="particles-enabled" checked>
                                        Enable Particle Effects
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="screen-shake-enabled" checked>
                                        Enable Screen Shake
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="visual-animations-enabled" checked>
                                        Enable Animations
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="weather-effects-enabled" checked>
                                        Enable Weather Effects
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="flash-warnings" checked>
                                        Enable Flash Warnings
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="visual-quality">Graphics Quality</label>
                                    <select id="visual-quality">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="reduced-motion">
                                        Reduced Motion
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ✨ Animation Tab - motion sickness optional -->
                        <div class="settings-tab-content" data-tab="animation">
                            <h3>Animation Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="animation-enabled" checked>
                                        Enable Animations
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="animation-speed">Animation Speed</label>
                                    <input type="range" id="animation-speed" min="0.1" max="3" step="0.1" value="1">
                                    <span class="setting-value">1.0x</span>
                                </div>
                                <div class="setting-item">
                                    <label for="animation-quality">Animation Quality</label>
                                    <select id="animation-quality">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="animation-reduced-motion">
                                        Reduced Motion
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- 🎨 UI Tab - aesthetics for the void -->
                        <div class="settings-tab-content" data-tab="ui">
                            <h3>UI Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="ui-animations-enabled" checked>
                                        Enable UI Animations
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="hover-effects-enabled" checked>
                                        Enable Hover Effects
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="transitions-enabled" checked>
                                        Enable Transitions
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="ui-theme">UI Theme</label>
                                    <select id="ui-theme">
                                        <option value="default" selected>Default</option>
                                        <option value="dark">Dark</option>
                                        <option value="high-contrast">High Contrast</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label for="ui-font-size">Font Size</label>
                                    <select id="ui-font-size">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="ui-reduced-motion">
                                        Reduced Motion
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="ui-high-contrast">
                                        High Contrast
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- 🌧️ Environmental Tab - because ambiance matters in hell -->
                        <div class="settings-tab-content" data-tab="environmental">
                            <h3>Environmental Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="env-weather-enabled" checked>
                                        Enable Weather Effects
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="env-lighting-enabled" checked>
                                        Enable Dynamic Lighting
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="env-seasonal-enabled" checked>
                                        Enable Seasonal Effects
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="env-quality">Environmental Quality</label>
                                    <select id="env-quality">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="env-reduced-effects">
                                        Reduced Effects
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ♿ Accessibility Tab - make the suffering accessible to all -->
                        <div class="settings-tab-content" data-tab="accessibility">
                            <h3>Accessibility Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="access-reduced-motion">
                                        Reduced Motion
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="access-high-contrast">
                                        High Contrast
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="access-screen-reader">
                                        Screen Reader Support
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="access-flash-warnings" checked>
                                        Flash Warnings
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="access-colorblind">Color Blind Mode</label>
                                    <select id="access-colorblind">
                                        <option value="none" selected>None</option>
                                        <option value="protanopia">Protanopia (Red-blind)</option>
                                        <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                                        <option value="tritanopia">Tritanopia (Blue-blind)</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label for="access-font-size">Font Size</label>
                                    <select id="access-font-size">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="large">Large</option>
                                        <option value="extra-large">Extra Large</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="access-keyboard-nav" checked>
                                        Enhanced Keyboard Navigation
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- 🎙️ AI Voice Tab - give NPCs souls and voices -->
                        <div class="settings-tab-content" data-tab="aivoice">
                            <h3>🎙️ AI Voice Chat Settings</h3>
                            <p class="settings-description">Configure how NPCs communicate with you. They now have opinions... and voices.</p>

                            <div class="settings-group">
                                <h4>🤖 AI Text Model</h4>
                                <div class="setting-item">
                                    <label for="ai-text-model">Text Generation Model</label>
                                    <select id="ai-text-model">
                                        <option value="openai" selected>Loading models...</option>
                                    </select>
                                </div>
                                <p class="settings-description">Models fetched from text.pollinations.ai - different models have different personalities.</p>

                                <div class="setting-item">
                                    <label for="ai-temperature">Response Creativity</label>
                                    <input type="range" id="ai-temperature" min="0.1" max="1.5" step="0.1" value="0.8">
                                    <span class="setting-value" id="ai-temperature-value">0.8</span>
                                </div>
                                <p class="settings-description">Lower = more predictable, Higher = more creative/chaotic responses.</p>
                            </div>

                            <div class="settings-group">
                                <h4>🔊 Voice & TTS Settings</h4>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="voice-enabled" checked>
                                        Enable Voice Playback (TTS)
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <label for="voice-volume">Voice Volume</label>
                                    <input type="range" id="voice-volume" min="0" max="100" step="5" value="70">
                                    <span class="setting-value" id="voice-volume-value">70%</span>
                                </div>

                                <div class="setting-item">
                                    <label for="default-voice">Default Voice</label>
                                    <select id="default-voice">
                                        <!-- 🖤 Voices populated dynamically from GameConfig.api.pollinations.tts.voices -->
                                    </select>
                                </div>
                                <p class="settings-description">NPCs have their own assigned voices, but this is the fallback.</p>
                            </div>

                            <div class="settings-group">
                                <h4>💬 Conversation Settings</h4>
                                <div class="setting-item">
                                    <label for="max-conversation-turns">Max Conversation Turns</label>
                                    <select id="max-conversation-turns">
                                        <option value="1">1 (Quick chat)</option>
                                        <option value="2" selected>2 (Standard)</option>
                                        <option value="3">3 (Extended)</option>
                                        <option value="5">5 (Long conversation)</option>
                                    </select>
                                </div>
                                <p class="settings-description">How many responses before NPCs politely end the conversation.</p>
                            </div>

                            <div class="settings-group">
                                <h4>🎭 NPC Voice Test</h4>
                                <p class="settings-description">Test NPC personalities and voices:</p>
                                <div class="setting-item">
                                    <label for="test-npc-personality">NPC Personality</label>
                                    <select id="test-npc-personality">
                                        <optgroup label="👹 Dungeon Bosses">
                                            <option value="dark_lord">Dark Lord Malachar</option>
                                            <option value="frost_lord">Frost Lord</option>
                                            <option value="dragon">Ancient Dragon</option>
                                            <option value="alpha_wolf">Alpha Wolf Grimfang</option>
                                            <option value="bandit_chief">Bandit Chief Viktor</option>
                                            <option value="goblin_king">Goblin King Griknak</option>
                                            <option value="smuggler_boss">Captain Blackheart</option>
                                            <option value="rat_queen">Rat Queen</option>
                                            <option value="necromancer">Necromancer</option>
                                            <option value="cultist_leader">Cultist Leader</option>
                                        </optgroup>
                                        <optgroup label="🏪 Merchants">
                                            <option value="friendly">Friendly Merchant</option>
                                            <option value="greedy">Greedy Merchant</option>
                                            <option value="shrewd">Shrewd Merchant</option>
                                            <option value="eccentric">Eccentric Merchant</option>
                                            <option value="mysterious">Mysterious Apothecary</option>
                                            <option value="desperate">Desperate Merchant</option>
                                        </optgroup>
                                        <optgroup label="⚔️ Combat & Encounter NPCs">
                                            <option value="gruff">Gruff Guard</option>
                                            <option value="mercenary">Cold Mercenary</option>
                                            <option value="robber">Threatening Robber</option>
                                            <option value="smuggler">Paranoid Smuggler</option>
                                        </optgroup>
                                        <optgroup label="🔮 Special NPCs">
                                            <option value="priest">Serene Priest</option>
                                            <option value="spy">Cryptic Spy</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div class="setting-item voice-preview-actions">
                                    <button id="test-voice-btn" class="save-load-btn">🔊 Test NPC Voice</button>
                                    <button id="stop-voice-btn" class="save-load-btn danger">⏹️ Stop</button>
                                </div>
                                <div id="voice-preview-status" class="voice-preview-status"></div>
                            </div>

                            <div class="settings-group">
                                <h4>📊 API Status</h4>
                                <div class="api-status-display" id="api-status-display">
                                    <span class="api-status-indicator" id="api-status-indicator">●</span>
                                    <span id="api-status-text">Checking connection...</span>
                                </div>
                                <button id="refresh-models-btn" class="save-load-btn">🔄 Refresh Available Models</button>
                                <div id="available-models-list" class="available-models-list"></div>
                            </div>
                        </div>

                        <!-- ⌨️ Controls Tab - remap your keys, not your fate -->
                        <div class="settings-tab-content" data-tab="controls">
                            <h3>⌨️ Keyboard Controls</h3>
                            <p class="settings-description">Click any key binding to change it. Press Escape to cancel.</p>
                            <div class="settings-group">
                                <div class="keybindings-list" id="keybindings-list">
                                    <!-- keybindings spawned by refreshKeyBindingsUI -->
                                </div>
                                <div class="setting-item keybind-actions">
                                    <button class="save-load-btn" id="reset-keybindings-btn">🔄 Reset to Defaults</button>
                                </div>
                            </div>
                        </div>

                        <!-- 💾 Save/Load Tab - ctrl+z for life itself -->
                        <div class="settings-tab-content" data-tab="saveload">
                            <h3>💾 Save & Load Game</h3>
                            <div class="settings-group">
                                <div class="setting-item save-actions">
                                    <button id="manual-save-btn" class="save-load-btn" onclick="if(typeof SaveLoadSystem !== 'undefined') SaveLoadSystem.manualSave();">
                                        💾 Save Game Now
                                    </button>
                                    <button id="quick-save-btn" class="save-load-btn" onclick="if(typeof SaveLoadSystem !== 'undefined') SaveLoadSystem.quickSave();">
                                        ⚡ Quick Save (F5)
                                    </button>
                                </div>

                                <h4>📂 Auto-Saves (Rotating - up to 10)</h4>
                                <p class="settings-description">Auto-saves happen every 5 minutes during gameplay</p>
                                <div id="auto-save-list" class="auto-save-list">
                                    <!-- auto-saves materialize here like ghosts -->
                                    <p class="no-saves">No auto-saves yet...</p>
                                </div>

                                <h4>📁 Manual Saves</h4>
                                <div id="manual-save-list" class="manual-save-list">
                                    <!-- manual saves appear when you actually care -->
                                    <p class="no-saves">No manual saves yet...</p>
                                </div>

                                <h4>🗑️ Storage Management</h4>
                                <p class="settings-description">Clear old data to free up space if saves are failing</p>
                                <div class="storage-info" id="storage-info">
                                    <span>Storage: calculating...</span>
                                </div>
                                <div class="setting-item save-actions">
                                    <button id="clear-autosaves-btn" class="save-load-btn danger" onclick="SettingsPanel.clearAutoSaves();">
                                        🗑️ Clear All Auto-Saves
                                    </button>
                                    <button id="clear-cache-btn" class="save-load-btn" onclick="SettingsPanel.clearCacheData();">
                                        🧹 Clear Cache Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 🏆 Leaderboard Tab - configure your path to eternal glory -->
                        <div class="settings-tab-content" data-tab="leaderboard">
                            <h3>🏆 Global Leaderboard Configuration</h3>
                            <p class="settings-description">connect to the eternal hall of champions. your legacy, broadcast to all who dare play.</p>

                            <div class="settings-group">
                                <div class="setting-item">
                                    <label for="leaderboard-backend">Backend Service</label>
                                    <select id="leaderboard-backend">
                                        <option value="local">Local Only (offline)</option>
                                        <option value="jsonbin">JSONBin.io (free cloud)</option>
                                        <option value="gist">GitHub Gist</option>
                                    </select>
                                </div>

                                <div id="jsonbin-config" class="leaderboard-config-section" style="display: none;">
                                    <h4>JSONBin.io Configuration</h4>
                                    <p class="config-help">1. Go to <a href="https://jsonbin.io" target="_blank">jsonbin.io</a> and create a free account</p>
                                    <p class="config-help">2. Create a new bin with content: <code>{"leaderboard":[]}</code></p>
                                    <p class="config-help">3. Copy your Bin ID and Master Key below</p>
                                    <div class="setting-item">
                                        <label for="jsonbin-id">Bin ID</label>
                                        <input type="text" id="jsonbin-id" placeholder="e.g., 6756abcd1234ef567890">
                                    </div>
                                    <div class="setting-item">
                                        <label for="jsonbin-key">API Key (Master Key)</label>
                                        <input type="password" id="jsonbin-key" placeholder="$2a$10$...">
                                    </div>
                                </div>

                                <div id="gist-config" class="leaderboard-config-section" style="display: none;">
                                    <h4>GitHub Gist Configuration</h4>
                                    <p class="config-help">1. Create a public Gist at <a href="https://gist.github.com" target="_blank">gist.github.com</a></p>
                                    <p class="config-help">2. Add a file named "leaderboard.json" with: <code>{"leaderboard":[]}</code></p>
                                    <p class="config-help">3. Get your Gist ID from the URL</p>
                                    <div class="setting-item">
                                        <label for="gist-id">Gist ID</label>
                                        <input type="text" id="gist-id" placeholder="e.g., abc123def456...">
                                    </div>
                                    <p class="config-note">Note: Reading is public, but submitting scores requires authentication (coming soon).</p>
                                </div>

                                <div class="setting-item">
                                    <button id="test-leaderboard-btn" class="settings-action-btn">🧪 Test Connection</button>
                                    <button id="save-leaderboard-btn" class="settings-action-btn primary">💾 Save Configuration</button>
                                </div>

                                <div id="leaderboard-status" class="leaderboard-status"></div>
                            </div>

                            <div class="settings-group">
                                <h4>Current Leaderboard</h4>
                                <div id="settings-leaderboard-preview" class="leaderboard-preview">
                                    <p>loading champions...</p>
                                </div>
                                <p class="settings-hint">🔄 auto-refreshes every 10 minutes</p>
                            </div>
                        </div>

                        <!-- ℹ️ About Tab - who to blame for this beautiful disaster -->
                        <div class="settings-tab-content" data-tab="about">
                            <div id="about-content" class="about-tab-content">
                                <!-- content summoned by GameConfig -->
                            </div>
                        </div>
                    </div>

                    <div class="settings-panel-footer">
                        <button class="settings-btn settings-apply-btn">Apply</button>
                        <button class="settings-btn settings-reset-btn">Reset to Defaults</button>
                        <button class="panel-close-btn-footer settings-cancel-btn">Close</button>
                        <button class="settings-btn settings-main-menu-btn" style="background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);">🏠 Main Menu</button>
                        <button class="settings-btn settings-clear-all-btn" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); margin-left: auto;">🗑️ Clear All Data</button>
                    </div>
                </div>
            </div>
        `;

        // add styles - because ugly code deserves pretty css
        this.addStyles();

        // append to body - inject our darkness into the dom
        document.body.appendChild(this.panelElement);
    },

    // add styles for settings panel - css wizardry at 3am
    addStyles() {
        const style = document.createElement('style');
        style.id = 'settings-panel-styles';
        style.textContent = `
            .settings-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                display: none;
            }
            
            .settings-panel-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .settings-panel-container {
                background: var(--panel-bg, #2d2d2d);
                color: var(--panel-text, #e0e0e0);
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            
            .settings-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border-color, #444);
            }
            
            .settings-panel-header h2 {
                margin: 0;
                font-size: 24px;
                color: var(--header-text, #ffffff);
            }
            
            .settings-close-btn {
                background: none;
                border: none;
                color: var(--close-btn-color, #999);
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .settings-close-btn:hover {
                background-color: var(--hover-bg, #444);
                color: var(--close-btn-hover, #fff);
            }
            
            /* tabs wrapper with scroll arrows - navigation for the lost souls */
            .settings-tabs-wrapper {
                display: flex;
                align-items: stretch;
                background: var(--tabs-bg, #1a1a1a);
                border-bottom: 1px solid var(--border-color, #444);
                position: relative;
            }

            .settings-tabs-scroll-btn {
                background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                border: none;
                color: #888;
                padding: 0 10px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .settings-tabs-scroll-btn:hover {
                background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
                color: #fff;
            }

            .settings-tabs-scroll-btn:active {
                background: #4CAF50;
                color: #fff;
            }

            .settings-tabs-scroll-btn.scroll-left {
                border-right: 1px solid #333;
            }

            .settings-tabs-scroll-btn.scroll-right {
                border-left: 1px solid #333;
            }

            .settings-panel-tabs {
                display: flex;
                flex: 1;
                overflow-x: auto;
                overflow-y: hidden;
                scrollbar-width: thin;
                scrollbar-color: #666 #1a1a1a;
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }

            /* fancy scrollbar for the tabs - because even scrollbars deserve to look good */
            .settings-panel-tabs::-webkit-scrollbar {
                height: 4px;
            }

            .settings-panel-tabs::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .settings-panel-tabs::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 2px;
            }

            .settings-panel-tabs::-webkit-scrollbar-thumb:hover {
                background: #777;
            }

            .settings-tab {
                background: none;
                border: none;
                color: var(--tab-text, #999);
                padding: 12px 12px;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
            }

            .settings-tab:hover {
                background-color: var(--tab-hover-bg, #333);
                color: var(--tab-hover-text, #fff);
            }

            .settings-tab.active {
                color: var(--tab-active-text, #4CAF50);
                border-bottom-color: var(--tab-active-border, #4CAF50);
                background-color: var(--tab-active-bg, #2d2d2d);
            }

            /* mobile friendly - stack tabs and hide arrows on smaller screens */
            @media (max-width: 600px) {
                .settings-tabs-scroll-btn {
                    display: none;
                }

                .settings-panel-tabs {
                    flex-wrap: wrap;
                    overflow-x: visible;
                }

                .settings-tab {
                    padding: 8px 10px;
                    font-size: 11px;
                    flex: 1 1 auto;
                    min-width: 70px;
                    text-align: center;
                }
            }
            
            .settings-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .settings-tab-content {
                display: none;
            }
            
            .settings-tab-content.active {
                display: block;
            }
            
            .settings-tab-content h3 {
                margin: 0 0 20px 0;
                font-size: 18px;
                color: var(--section-header, #ffffff);
                border-bottom: 1px solid var(--border-color, #444);
                padding-bottom: 10px;
            }
            
            .settings-group {
                display: grid;
                gap: 15px;
            }
            
            .setting-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid var(--setting-border, #333);
            }
            
            .setting-item:last-child {
                border-bottom: none;
            }
            
            .setting-item label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                color: var(--setting-text, #e0e0e0);
                cursor: pointer;
            }
            
            .setting-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .setting-item input[type="range"] {
                width: 150px;
                cursor: pointer;
            }
            
            .setting-item select {
                background: var(--input-bg, #333);
                color: var(--input-text, #e0e0e0);
                border: 1px solid var(--input-border, #555);
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .setting-value {
                min-width: 40px;
                text-align: right;
                font-size: 14px;
                color: var(--value-text, #999);
            }
            
            .settings-panel-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid var(--border-color, #444);
                background: var(--footer-bg, #1a1a1a);
            }
            
            .settings-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .settings-apply-btn {
                background: var(--apply-btn-bg, #4CAF50);
                color: var(--apply-btn-text, #fff);
            }
            
            .settings-apply-btn:hover {
                background: var(--apply-btn-hover, #45a049);
            }
            
            .settings-reset-btn {
                background: var(--reset-btn-bg, #f44336);
                color: var(--reset-btn-text, #fff);
            }
            
            .settings-reset-btn:hover {
                background: var(--reset-btn-hover, #da190b);
            }
            
            .settings-cancel-btn {
                background: var(--cancel-btn-bg, #666);
                color: var(--cancel-btn-text, #fff);
            }
            
            .settings-cancel-btn:hover {
                background: var(--cancel-btn-hover, #555);
            }
            
            /* Save/Load Tab Styles */
            .save-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }

            .save-load-btn {
                padding: 12px 20px;
                background: var(--btn-bg, #4CAF50);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .save-load-btn:hover {
                background: var(--btn-hover, #45a049);
                transform: translateY(-2px);
            }

            .save-load-btn.danger {
                background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
            }

            .save-load-btn.danger:hover {
                background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
            }

            .storage-info {
                background: rgba(0,0,0,0.3);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .storage-bar {
                height: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                margin-top: 10px;
                overflow: hidden;
            }

            .storage-fill {
                height: 100%;
                transition: width 0.3s ease, background 0.3s ease;
                border-radius: 4px;
            }

            .settings-description {
                color: #888;
                font-size: 12px;
                margin: 5px 0 15px 0;
                font-style: italic;
            }

            .auto-save-list, .manual-save-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 200px;
                overflow-y: auto;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .save-slot-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255,255,255,0.05);
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.2s;
            }

            .save-slot-item:hover {
                background: rgba(255,255,255,0.1);
                border-color: var(--accent-color, #4CAF50);
            }

            .save-slot-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .save-slot-name {
                font-weight: 500;
                color: #fff;
            }

            .save-slot-details {
                font-size: 11px;
                color: #888;
            }

            .save-slot-actions {
                display: flex;
                gap: 8px;
            }

            .save-slot-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .save-slot-btn.load-btn {
                background: #2196F3;
                color: white;
            }

            .save-slot-btn.load-btn:hover {
                background: #1976D2;
            }

            .save-slot-btn.delete-btn {
                background: #f44336;
                color: white;
            }

            .save-slot-btn.delete-btn:hover {
                background: #d32f2f;
            }

            .no-saves {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }

            .settings-tab-content h4 {
                color: #aaa;
                font-size: 14px;
                margin: 15px 0 5px 0;
                border-bottom: 1px solid #333;
                padding-bottom: 5px;
            }

            /* ⌨️ keybindings styles - remap the pain */
            .keybindings-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 400px;
                overflow-y: auto;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }

            .keybind-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.2s;
            }

            .keybind-row:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .keybind-action {
                font-size: 14px;
                color: #e0e0e0;
            }

            .keybind-key {
                display: inline-block;
                min-width: 80px;
                padding: 8px 16px;
                background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
                border: 1px solid #555;
                border-radius: 6px;
                color: #fff;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 13px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .keybind-key:hover {
                background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
                border-color: #4CAF50;
                transform: translateY(-1px);
            }

            .keybind-key.listening {
                background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                border-color: #81C784;
                animation: pulse-key 1s ease-in-out infinite;
            }

            @keyframes pulse-key {
                0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); }
            }

            .keybind-actions {
                margin-top: 15px;
                justify-content: center;
            }

            .keybind-section-header {
                color: #888;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 10px 0 5px 0;
                border-bottom: 1px solid #333;
                margin-top: 10px;
            }

            .keybind-section-header:first-child {
                margin-top: 0;
            }

            /* responsive design - looks bad on all screen sizes equally */
            @media (max-width: 768px) {
                .settings-panel-container {
                    width: 95%;
                    height: 95vh;
                }

                .settings-panel-tabs {
                    flex-wrap: wrap;
                }

                .settings-tab {
                    flex: 1;
                    min-width: 100px;
                    font-size: 12px;
                    padding: 10px 5px;
                }

                .setting-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .settings-panel-footer {
                    flex-direction: column;
                }

                .settings-btn {
                    width: 100%;
                }

                .save-actions {
                    flex-direction: column;
                }

                .save-load-btn {
                    width: 100%;
                }
            }

            /* 🏆 leaderboard tab styles - hall of glory configuration */
            .leaderboard-config-section {
                margin-top: 15px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                border-left: 3px solid #4fc3f7;
            }

            .leaderboard-config-section h4 {
                color: #4fc3f7;
                margin-bottom: 10px;
            }

            .config-help {
                color: #888;
                font-size: 0.85rem;
                margin: 5px 0;
            }

            .config-help a {
                color: #4fc3f7;
            }

            .config-help code {
                background: rgba(0, 0, 0, 0.4);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                color: #81c784;
            }

            .config-note {
                color: #ff9800;
                font-size: 0.8rem;
                font-style: italic;
                margin-top: 10px;
            }

            .leaderboard-status {
                padding: 10px;
                border-radius: 6px;
                margin-top: 10px;
                font-size: 0.9rem;
            }

            .leaderboard-status.success {
                background: rgba(76, 175, 80, 0.2);
                color: #81c784;
                border: 1px solid #4caf50;
            }

            .leaderboard-status.error {
                background: rgba(244, 67, 54, 0.2);
                color: #ef5350;
                border: 1px solid #f44336;
            }

            .leaderboard-status.info {
                background: rgba(79, 195, 247, 0.2);
                color: #4fc3f7;
                border: 1px solid #29b6f6;
            }

            .leaderboard-preview {
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px;
            }

            .leaderboard-preview .empty {
                color: #666;
                font-style: italic;
                text-align: center;
            }

            .preview-entry {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px;
                margin-bottom: 5px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            .preview-entry.rank-1 {
                background: rgba(255, 215, 0, 0.15);
            }

            .preview-entry.rank-2 {
                background: rgba(192, 192, 192, 0.1);
            }

            .preview-entry.rank-3 {
                background: rgba(205, 127, 50, 0.1);
            }

            .preview-entry .rank {
                font-size: 1.2rem;
                min-width: 30px;
            }

            .preview-entry .name {
                flex: 1;
                color: #4fc3f7;
            }

            .preview-entry .score {
                color: #ffd700;
                font-weight: bold;
            }

            .settings-action-btn {
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-right: 10px;
                border: 1px solid #4fc3f7;
                background: rgba(79, 195, 247, 0.1);
                color: #4fc3f7;
                transition: all 0.2s ease;
            }

            .settings-action-btn:hover {
                background: rgba(79, 195, 247, 0.2);
            }

            .settings-action-btn.primary {
                background: rgba(79, 195, 247, 0.3);
                font-weight: bold;
            }

            .settings-description {
                color: #888;
                font-style: italic;
                margin-bottom: 15px;
            }

            /* ℹ️ about tab styles - ego stroking section */
            .about-tab-content {
                text-align: center;
                padding: 20px;
            }

            .about-section {
                max-width: 400px;
                margin: 0 auto;
            }

            .about-logo {
                font-size: 64px;
                margin-bottom: 10px;
            }

            .about-section h2 {
                color: #FFD700;
                font-size: 28px;
                margin: 10px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }

            .about-tagline {
                color: #aaa;
                font-style: italic;
                margin: 5px 0 15px 0;
            }

            .about-version {
                display: inline-block;
                background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
                padding: 5px 15px;
                border-radius: 20px;
                font-family: monospace;
                font-size: 14px;
                color: #4CAF50;
                margin: 10px 0;
            }

            .about-studio {
                margin: 20px 0;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .studio-label {
                display: block;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .studio-name {
                display: block;
                color: #FFD700;
                font-size: 20px;
                font-weight: bold;
                margin-top: 5px;
            }

            .about-developers {
                margin: 20px 0;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .about-developers h4 {
                color: #888;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
                border-bottom: none !important;
            }

            .credit-entry {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .credit-entry:last-child {
                border-bottom: none;
            }

            .dev-name {
                color: #e0e0e0;
                font-weight: bold;
            }

            .dev-role {
                color: #888;
                font-size: 12px;
            }

            .about-copyright {
                color: #666;
                font-size: 11px;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* 🔗 About page link buttons - no more eye-searing blue links */
            .about-social-links {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
            }

            .about-link-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 10px 18px;
                background: linear-gradient(135deg, #3a3a4a 0%, #2a2a3a 100%);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 8px;
                color: #e0e0e0;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            .about-link-btn:hover {
                background: linear-gradient(135deg, #4a4a5a 0%, #3a3a4a 100%);
                border-color: rgba(79, 195, 247, 0.6);
                color: #fff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(79, 195, 247, 0.2);
            }

            .about-link-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            /* 🎙️ AI Voice Tab Styles - where NPCs learn to speak */
            .voice-preview-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .voice-preview-status {
                margin-top: 10px;
                padding: 10px;
                border-radius: 6px;
                font-size: 0.9rem;
                min-height: 40px;
            }

            .voice-preview-status.playing {
                background: rgba(76, 175, 80, 0.2);
                color: #81c784;
                border: 1px solid #4caf50;
            }

            .voice-preview-status.error {
                background: rgba(244, 67, 54, 0.2);
                color: #ef5350;
                border: 1px solid #f44336;
            }

            .api-status-display {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .api-status-indicator {
                font-size: 18px;
                animation: pulse-status 2s ease-in-out infinite;
            }

            .api-status-indicator.connected {
                color: #4CAF50;
            }

            .api-status-indicator.disconnected {
                color: #f44336;
            }

            .api-status-indicator.checking {
                color: #ff9800;
            }

            @keyframes pulse-status {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .available-models-list {
                margin-top: 10px;
                max-height: 150px;
                overflow-y: auto;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                font-size: 0.85rem;
                display: none;
            }

            .available-models-list.visible {
                display: block;
            }

            .model-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .model-item:last-child {
                border-bottom: none;
            }

            .model-name {
                color: #4fc3f7;
                font-weight: 500;
            }

            .model-desc {
                color: #888;
                font-size: 0.8rem;
            }

            .voice-indicator {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 4px 12px;
                background: rgba(76, 175, 80, 0.2);
                border-radius: 20px;
                color: #81c784;
                font-size: 0.85rem;
            }

            .voice-indicator .wave {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 16px;
            }

            .voice-indicator .wave span {
                width: 3px;
                background: #81c784;
                border-radius: 2px;
                animation: wave-animation 0.5s ease-in-out infinite;
            }

            .voice-indicator .wave span:nth-child(1) { animation-delay: 0s; height: 8px; }
            .voice-indicator .wave span:nth-child(2) { animation-delay: 0.1s; height: 12px; }
            .voice-indicator .wave span:nth-child(3) { animation-delay: 0.2s; height: 6px; }
            .voice-indicator .wave span:nth-child(4) { animation-delay: 0.3s; height: 14px; }
            .voice-indicator .wave span:nth-child(5) { animation-delay: 0.4s; height: 10px; }

            @keyframes wave-animation {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.5); }
            }
        `;
        document.head.appendChild(style);
    },

    // setup event listeners - wire up the chaos
    setupEventListeners() {
        // tab switching - swap between tabs like moods at 3am
        const tabs = this.panelElement.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            EventManager.addEventListener(tab, 'click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 🖤 tab scroll buttons - navigate the endless void of settings
        this.setupTabScrollButtons();

        // close button - the escape hatch from our beautiful mess
        const closeBtn = this.panelElement.querySelector('.settings-close-btn');
        closeBtn.addEventListener('click', () => this.closePanel());

        // footer buttons - commit or abandon your choices
        const applyBtn = this.panelElement.querySelector('.settings-apply-btn');
        applyBtn.addEventListener('click', () => this.applySettings());
        
        const resetBtn = this.panelElement.querySelector('.settings-reset-btn');
        resetBtn.addEventListener('click', () => this.resetToDefaults());
        
        const cancelBtn = this.panelElement.querySelector('.settings-cancel-btn');
        cancelBtn.addEventListener('click', () => this.closePanel());

        // main menu button - return to the start screen
        const mainMenuBtn = this.panelElement.querySelector('.settings-main-menu-btn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => this.returnToMainMenu());
        }

        // clear all data button - the nuclear option
        const clearAllBtn = this.panelElement.querySelector('.settings-clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllData());
        }

        // 🏆 Leaderboard tab controls
        const leaderboardBackend = this.panelElement.querySelector('#leaderboard-backend');
        if (leaderboardBackend) {
            leaderboardBackend.addEventListener('change', (e) => this.updateLeaderboardConfigUI(e.target.value));
        }

        const testLeaderboardBtn = this.panelElement.querySelector('#test-leaderboard-btn');
        if (testLeaderboardBtn) {
            testLeaderboardBtn.addEventListener('click', () => this.testLeaderboardConnection());
        }

        const saveLeaderboardBtn = this.panelElement.querySelector('#save-leaderboard-btn');
        if (saveLeaderboardBtn) {
            saveLeaderboardBtn.addEventListener('click', () => this.saveLeaderboardConfig());
        }

        const refreshLeaderboardBtn = this.panelElement.querySelector('#refresh-leaderboard-btn');
        if (refreshLeaderboardBtn) {
            refreshLeaderboardBtn.addEventListener('click', () => {
                if (typeof GlobalLeaderboardSystem !== 'undefined') {
                    GlobalLeaderboardSystem.refresh().then(() => this.refreshLeaderboardPreview());
                }
            });
        }

        // 🎙️ AI Voice tab controls - where NPCs get their voices
        this.setupAIVoiceControls();

        // setting controls - bind the inputs to the void
        this.setupSettingControls();

        // keyboard navigation - escape is always an option
        EventManager.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
    },

    // setup individual setting controls - the tedious part
    setupSettingControls() {
        // audio settings - volume knobs for your ears
        this.setupRangeControl('master-volume', 'audio', 'masterVolume', (value) => `${Math.round(value * 100)}%`);
        this.setupRangeControl('music-volume', 'audio', 'musicVolume', (value) => `${Math.round(value * 100)}%`);
        this.setupRangeControl('sfx-volume', 'audio', 'sfxVolume', (value) => `${Math.round(value * 100)}%`);

        this.setupCheckboxControl('audio-enabled', 'audio', 'audioEnabled');
        this.setupMuteAllControl(); // Special handler for Mute All
        this.setupCheckboxControl('music-mute', 'audio', 'isMusicMuted');
        this.setupCheckboxControl('sfx-mute', 'audio', 'isSfxMuted');

        // visual settings - checkboxes for your eyeballs
        this.setupCheckboxControl('particles-enabled', 'visual', 'particlesEnabled');
        this.setupCheckboxControl('screen-shake-enabled', 'visual', 'screenShakeEnabled');
        this.setupCheckboxControl('visual-animations-enabled', 'visual', 'animationsEnabled');
        this.setupCheckboxControl('weather-effects-enabled', 'visual', 'weatherEffectsEnabled');
        this.setupCheckboxControl('flash-warnings', 'visual', 'flashWarnings');
        this.setupCheckboxControl('reduced-motion', 'visual', 'reducedMotion');
        
        this.setupSelectControl('visual-quality', 'visual', 'quality');

        // animation settings - make things move or don't, whatever
        this.setupCheckboxControl('animation-enabled', 'animation', 'animationsEnabled');
        this.setupCheckboxControl('animation-reduced-motion', 'animation', 'reducedMotion');
        
        this.setupRangeControl('animation-speed', 'animation', 'animationSpeed', (value) => `${value}x`);
        this.setupSelectControl('animation-quality', 'animation', 'quality');

        // ui settings - fiddle with fonts and themes
        this.setupCheckboxControl('ui-animations-enabled', 'ui', 'animationsEnabled');
        this.setupCheckboxControl('hover-effects-enabled', 'ui', 'hoverEffectsEnabled');
        this.setupCheckboxControl('transitions-enabled', 'ui', 'transitionsEnabled');
        this.setupCheckboxControl('ui-reduced-motion', 'ui', 'reducedMotion');
        this.setupCheckboxControl('ui-high-contrast', 'ui', 'highContrast');
        
        this.setupSelectControl('ui-theme', 'ui', 'theme');
        this.setupSelectControl('ui-font-size', 'ui', 'fontSize');

        // environmental settings - control the weather like a god
        this.setupCheckboxControl('env-weather-enabled', 'environmental', 'weatherEffectsEnabled');
        this.setupCheckboxControl('env-lighting-enabled', 'environmental', 'lightingEnabled');
        this.setupCheckboxControl('env-seasonal-enabled', 'environmental', 'seasonalEffectsEnabled');
        this.setupCheckboxControl('env-reduced-effects', 'environmental', 'reducedEffects');
        
        this.setupSelectControl('env-quality', 'environmental', 'quality');

        // accessibility settings - everyone deserves their specific hell
        this.setupCheckboxControl('access-reduced-motion', 'accessibility', 'reducedMotion');
        this.setupCheckboxControl('access-high-contrast', 'accessibility', 'highContrast');
        this.setupCheckboxControl('access-screen-reader', 'accessibility', 'screenReaderEnabled');
        this.setupCheckboxControl('access-flash-warnings', 'accessibility', 'flashWarnings');
        this.setupCheckboxControl('access-keyboard-nav', 'accessibility', 'keyboardNavigation');
        
        this.setupSelectControl('access-colorblind', 'accessibility', 'colorBlindMode');
        this.setupSelectControl('access-font-size', 'accessibility', 'fontSize');
    },

    // 🖤 setup tab scroll buttons - for when you have too many settings (which is always)
    setupTabScrollButtons() {
        const tabsContainer = this.panelElement.querySelector('.settings-panel-tabs');
        const scrollLeftBtn = this.panelElement.querySelector('.settings-tabs-scroll-btn.scroll-left');
        const scrollRightBtn = this.panelElement.querySelector('.settings-tabs-scroll-btn.scroll-right');

        if (!tabsContainer || !scrollLeftBtn || !scrollRightBtn) {
            console.warn('🖤 tab scroll buttons not found... the void consumed them');
            return;
        }

        const scrollAmount = 150; // pixels to scroll per click

        // scroll left - into the past
        scrollLeftBtn.addEventListener('click', () => {
            tabsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        // scroll right - into the unknown
        scrollRightBtn.addEventListener('click', () => {
            tabsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // update button visibility based on scroll position
        const updateScrollButtons = () => {
            const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;
            const canScrollLeft = scrollLeft > 5;
            const canScrollRight = scrollLeft < scrollWidth - clientWidth - 5;

            scrollLeftBtn.style.opacity = canScrollLeft ? '1' : '0.3';
            scrollLeftBtn.style.pointerEvents = canScrollLeft ? 'auto' : 'none';

            scrollRightBtn.style.opacity = canScrollRight ? '1' : '0.3';
            scrollRightBtn.style.pointerEvents = canScrollRight ? 'auto' : 'none';
        };

        // listen for scroll events
        tabsContainer.addEventListener('scroll', updateScrollButtons);

        // also update on resize because life is unpredictable
        window.addEventListener('resize', updateScrollButtons);

        // initial update
        setTimeout(updateScrollButtons, 100);
    },

    // setup range control - sliders are just commitment issues
    setupRangeControl(elementId, category, settingKey, formatter) {
        const element = this.panelElement.querySelector(`#${elementId}`);
        if (!element) return;

        // set initial value from the abyss
        element.value = this.currentSettings[category][settingKey];

        // update value display - show the numbers
        const valueDisplay = element.parentElement.querySelector('.setting-value');
        if (valueDisplay && formatter) {
            valueDisplay.textContent = formatter(element.value);
        }

        // add input listener - react to every twitch
        EventManager.addEventListener(element, 'input', (e) => {
            const value = parseFloat(e.target.value);
            this.currentSettings[category][settingKey] = value;
            
            if (valueDisplay && formatter) {
                valueDisplay.textContent = formatter(value);
            }

            // apply setting immediately for audio controls - instant gratification
            if (category === 'audio' && typeof AudioSystem !== 'undefined') {
                switch (settingKey) {
                    case 'masterVolume':
                        AudioSystem.setMasterVolume(value);
                        break;
                    case 'musicVolume':
                        AudioSystem.setMusicVolume(value);
                        break;
                    case 'sfxVolume':
                        AudioSystem.setSfxVolume(value);
                        break;
                }
            }
        });
    },

    // setup checkbox control - binary decisions for complex feelings
    setupCheckboxControl(elementId, category, settingKey) {
        const element = this.panelElement.querySelector(`#${elementId}`);
        if (!element) return;

        // set initial value - check or uncheck your fate
        element.checked = this.currentSettings[category][settingKey];

        // add change listener - when you flip the switch
        EventManager.addEventListener(element, 'change', (e) => {
            const value = e.target.checked;
            this.currentSettings[category][settingKey] = value;

            // apply setting immediately for certain controls - no patience here
            this.applyImmediateSetting(category, settingKey, value);
        });
    },

    // 🔇 Setup Mute All control - the nuclear option for audio
    setupMuteAllControl() {
        const muteAllCheckbox = this.panelElement.querySelector('#master-mute');
        if (!muteAllCheckbox) return;

        // Set initial value
        muteAllCheckbox.checked = this.currentSettings.audio.isMuted;

        // Store previous values for unmuting (use defaults if not set)
        this.previousAudioSettings = {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.7,
            audioEnabled: true
        };

        muteAllCheckbox.addEventListener('change', (e) => {
            const isMuted = e.target.checked;
            this.currentSettings.audio.isMuted = isMuted;

            const masterVolumeSlider = this.panelElement.querySelector('#master-volume');
            const musicVolumeSlider = this.panelElement.querySelector('#music-volume');
            const sfxVolumeSlider = this.panelElement.querySelector('#sfx-volume');
            const audioEnabledCheckbox = this.panelElement.querySelector('#audio-enabled');

            // Helper to update slider and its value display
            const updateSlider = (slider, value) => {
                if (!slider) return;
                slider.value = value;
                // Find the sibling .setting-value span
                const settingItem = slider.closest('.setting-item');
                if (settingItem) {
                    const valueSpan = settingItem.querySelector('.setting-value');
                    if (valueSpan) {
                        valueSpan.textContent = `${Math.round(value * 100)}%`;
                    }
                }
            };

            if (isMuted) {
                // 🔇 MUTING: Save current values BEFORE zeroing
                this.previousAudioSettings = {
                    masterVolume: parseFloat(masterVolumeSlider?.value) || 0.7,
                    musicVolume: parseFloat(musicVolumeSlider?.value) || 0.5,
                    sfxVolume: parseFloat(sfxVolumeSlider?.value) || 0.7,
                    audioEnabled: audioEnabledCheckbox?.checked !== false
                };

                console.log('🔇 Saving previous settings:', this.previousAudioSettings);

                // Set all volumes to 0
                this.currentSettings.audio.masterVolume = 0;
                this.currentSettings.audio.musicVolume = 0;
                this.currentSettings.audio.sfxVolume = 0;
                this.currentSettings.audio.audioEnabled = false;

                // Update UI sliders to 0
                updateSlider(masterVolumeSlider, 0);
                updateSlider(musicVolumeSlider, 0);
                updateSlider(sfxVolumeSlider, 0);

                if (audioEnabledCheckbox) {
                    audioEnabledCheckbox.checked = false;
                }

            } else {
                // 🔊 UNMUTING: Restore to 50% for all (as requested)
                const restoreVolume = 0.5;

                this.currentSettings.audio.masterVolume = restoreVolume;
                this.currentSettings.audio.musicVolume = restoreVolume;
                this.currentSettings.audio.sfxVolume = restoreVolume;
                this.currentSettings.audio.audioEnabled = true;

                console.log('🔊 Restoring all volumes to 50%');

                // Update UI sliders to 50%
                updateSlider(masterVolumeSlider, restoreVolume);
                updateSlider(musicVolumeSlider, restoreVolume);
                updateSlider(sfxVolumeSlider, restoreVolume);

                if (audioEnabledCheckbox) {
                    audioEnabledCheckbox.checked = true;
                }
            }

            // Apply to AudioSystem if available
            if (typeof AudioSystem !== 'undefined') {
                if (AudioSystem.setMasterVolume) AudioSystem.setMasterVolume(this.currentSettings.audio.masterVolume);
                if (AudioSystem.setMusicVolume) AudioSystem.setMusicVolume(this.currentSettings.audio.musicVolume);
                if (AudioSystem.setSfxVolume) AudioSystem.setSfxVolume(this.currentSettings.audio.sfxVolume);
                if (AudioSystem.setEnabled) AudioSystem.setEnabled(this.currentSettings.audio.audioEnabled);
            }

            console.log(`🔇 Mute All: ${isMuted ? 'MUTED (0%)' : 'UNMUTED (50%)'}`);
        });
    },

    // setup select control - dropdowns for the indecisive
    setupSelectControl(elementId, category, settingKey) {
        const element = this.panelElement.querySelector(`#${elementId}`);
        if (!element) return;

        // set initial value - pick your poison
        element.value = this.currentSettings[category][settingKey];

        // add change listener - commitment via dropdown
        EventManager.addEventListener(element, 'change', (e) => {
            const value = e.target.value;
            this.currentSettings[category][settingKey] = value;

            // apply setting immediately for certain controls - live preview baby
            this.applyImmediateSetting(category, settingKey, value);
        });
    },

    // apply immediate setting changes - no waiting around for this
    applyImmediateSetting(category, settingKey, value) {
        switch (category) {
            case 'audio':
                if (typeof AudioSystem !== 'undefined') {
                    switch (settingKey) {
                        case 'isMuted':
                            AudioSystem.toggleMute();
                            break;
                        case 'isMusicMuted':
                            AudioSystem.toggleMusicMute();
                            break;
                        case 'isSfxMuted':
                            AudioSystem.toggleSfxMute();
                            break;
                    }
                }
                break;
                
            case 'visual':
                if (typeof VisualEffectsSystem !== 'undefined') {
                    switch (settingKey) {
                        case 'quality':
                            VisualEffectsSystem.setQuality(value);
                            break;
                        case 'particlesEnabled':
                            VisualEffectsSystem.toggleParticles();
                            break;
                        case 'screenShakeEnabled':
                            VisualEffectsSystem.toggleScreenShake();
                            break;
                        case 'animationsEnabled':
                            VisualEffectsSystem.toggleAnimations();
                            break;
                        case 'weatherEffectsEnabled':
                            VisualEffectsSystem.toggleWeatherEffects();
                            break;
                        case 'reducedMotion':
                            VisualEffectsSystem.toggleReducedMotion();
                            break;
                        case 'flashWarnings':
                            VisualEffectsSystem.toggleFlashWarnings();
                            break;
                    }
                }
                break;
                
            case 'animation':
                if (typeof AnimationSystem !== 'undefined') {
                    switch (settingKey) {
                        case 'animationSpeed':
                            AnimationSystem.setAnimationSpeed(value);
                            break;
                        case 'quality':
                            AnimationSystem.setQuality(value);
                            break;
                        case 'animationsEnabled':
                            AnimationSystem.toggleAnimations();
                            break;
                        case 'reducedMotion':
                            AnimationSystem.toggleReducedMotion();
                            break;
                    }
                }
                break;
                
            case 'ui':
                if (typeof UIPolishSystem !== 'undefined') {
                    switch (settingKey) {
                        case 'theme':
                            UIPolishSystem.setTheme(value);
                            break;
                        case 'fontSize':
                            UIPolishSystem.setFontSize(value);
                            break;
                        case 'animationsEnabled':
                            UIPolishSystem.toggleAnimations();
                            break;
                        case 'hoverEffectsEnabled':
                            UIPolishSystem.toggleHoverEffects();
                            break;
                        case 'transitionsEnabled':
                            UIPolishSystem.toggleTransitions();
                            break;
                        case 'reducedMotion':
                            UIPolishSystem.toggleReducedMotion();
                            break;
                        case 'highContrast':
                            UIPolishSystem.toggleHighContrast();
                            break;
                    }
                }
                break;
                
            case 'environmental':
                if (typeof EnvironmentalEffectsSystem !== 'undefined') {
                    switch (settingKey) {
                        case 'quality':
                            EnvironmentalEffectsSystem.setQuality(value);
                            break;
                        case 'weatherEffectsEnabled':
                            EnvironmentalEffectsSystem.toggleWeatherEffects();
                            break;
                        case 'lightingEnabled':
                            EnvironmentalEffectsSystem.toggleLighting();
                            break;
                        case 'seasonalEffectsEnabled':
                            EnvironmentalEffectsSystem.toggleSeasonalEffects();
                            break;
                    }
                }
                break;
        }
    },

    // 🎙️ setup AI Voice controls - give NPCs their digital souls
    setupAIVoiceControls() {
        // text model selector - fetch models from API
        const textModelSelect = this.panelElement.querySelector('#ai-text-model');
        if (textModelSelect) {
            // Fetch and populate models from API
            this.fetchAndPopulateModels(textModelSelect);

            textModelSelect.addEventListener('change', (e) => {
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.updateSetting('textModel', e.target.value);
                }
            });
        }

        // temperature slider
        const tempSlider = this.panelElement.querySelector('#ai-temperature');
        const tempValue = this.panelElement.querySelector('#ai-temperature-value');
        if (tempSlider) {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                tempSlider.value = NPCVoiceChatSystem.settings.temperature || 0.8;
                if (tempValue) tempValue.textContent = tempSlider.value;
            }
            tempSlider.addEventListener('input', (e) => {
                if (tempValue) tempValue.textContent = e.target.value;
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.updateSetting('temperature', parseFloat(e.target.value));
                }
            });
        }

        // voice enabled checkbox
        const voiceEnabled = this.panelElement.querySelector('#voice-enabled');
        if (voiceEnabled) {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                voiceEnabled.checked = NPCVoiceChatSystem.settings.voiceEnabled !== false;
            }
            voiceEnabled.addEventListener('change', (e) => {
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.updateSetting('voiceEnabled', e.target.checked);
                }
            });
        }

        // voice volume slider
        const volumeSlider = this.panelElement.querySelector('#voice-volume');
        const volumeValue = this.panelElement.querySelector('#voice-volume-value');
        if (volumeSlider) {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                volumeSlider.value = NPCVoiceChatSystem.settings.voiceVolume || 70;
                if (volumeValue) volumeValue.textContent = `${volumeSlider.value}%`;
            }
            volumeSlider.addEventListener('input', (e) => {
                if (volumeValue) volumeValue.textContent = `${e.target.value}%`;
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.updateSetting('voiceVolume', parseInt(e.target.value));
                }
            });
        }

        // default voice selector - populate from GameConfig
        const voiceSelect = this.panelElement.querySelector('#default-voice');
        if (voiceSelect) {
            // 🖤 Populate voices from GameConfig.api.pollinations.tts.voices
            this.populateVoiceDropdown(voiceSelect);

            if (typeof NPCVoiceChatSystem !== 'undefined') {
                voiceSelect.value = NPCVoiceChatSystem.settings.voice || 'nova';
            }
            voiceSelect.addEventListener('change', (e) => {
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.updateSetting('voice', e.target.value);
                }
            });
        }

        // max conversation turns
        const maxTurnsSelect = this.panelElement.querySelector('#max-conversation-turns');
        if (maxTurnsSelect) {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                maxTurnsSelect.value = NPCVoiceChatSystem.config.defaults.maxConversationTurns || 2;
            }
            maxTurnsSelect.addEventListener('change', (e) => {
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.config.defaults.maxConversationTurns = parseInt(e.target.value);
                    NPCVoiceChatSystem.saveSettings();
                }
            });
        }

        // test voice button
        const testVoiceBtn = this.panelElement.querySelector('#test-voice-btn');
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', () => this.testVoicePreview());
        }

        // stop voice button
        const stopVoiceBtn = this.panelElement.querySelector('#stop-voice-btn');
        if (stopVoiceBtn) {
            stopVoiceBtn.addEventListener('click', () => {
                // Stop preview audio
                this.stopVoicePreview();
                // Also stop NPCVoiceChatSystem if playing
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.stopVoicePlayback();
                }
            });
        }

        // refresh models button
        const refreshModelsBtn = this.panelElement.querySelector('#refresh-models-btn');
        if (refreshModelsBtn) {
            refreshModelsBtn.addEventListener('click', () => this.refreshAIModels());
        }

        // check initial API status
        this.checkAPIStatus();
    },

    // test voice preview - hear the digital demons speak
    // 🖤 uses NPCDialogueSystem for unified dialogue generation
    async testVoicePreview() {
        // Get selected NPC personality
        const personality = this.panelElement.querySelector('#test-npc-personality')?.value || 'friendly';
        const volume = parseFloat(this.panelElement.querySelector('#voice-volume')?.value || 70);

        this.updateVoicePreviewStatus(`Generating ${personality} NPC response...`, 'playing');

        try {
            // Use NPCDialogueSystem for dialogue generation
            if (typeof NPCDialogueSystem === 'undefined') {
                throw new Error('NPCDialogueSystem not loaded');
            }

            // Determine if boss or merchant persona
            const isBoss = NPCDialogueSystem.isBoss(personality);
            let dialogue;

            if (isBoss) {
                dialogue = await NPCDialogueSystem.generateBossDialogue(personality, 'firstMeeting', {});
            } else {
                dialogue = await NPCDialogueSystem.generateDialogue(personality, 'firstMeeting', {
                    playerMessage: 'Hello'
                });
            }

            const phrase = dialogue.text || 'Greetings, traveler!';
            const voice = dialogue.voice || 'nova';

            console.log('🎭 NPC response:', phrase);
            console.log('🎭 Voice:', voice, '| Persona:', personality);

            // Stop any existing preview audio
            if (this.previewAudio) {
                this.previewAudio.pause();
                this.previewAudio = null;
            }

            this.updateVoicePreviewStatus(`Fetching audio...`, 'playing');

            // Get TTS URL with proper instruction prefix
            const url = GameConfig.api.pollinations.getTtsUrl(phrase, voice);

            // Fetch audio as blob to handle CORS/MIME issues
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            console.log('🎭 Audio blob created, size:', audioBlob.size);

            // Create audio element from blob
            this.previewAudio = new Audio(audioUrl);
            this.previewAudio.volume = volume / 100;

            this.previewAudio.onended = () => {
                console.log('🎭 Audio playback ended');
                this.updateVoicePreviewStatus('Playback complete!', 'info');
                URL.revokeObjectURL(audioUrl);
                this.previewAudio = null;
            };

            this.previewAudio.onerror = (e) => {
                console.error('🎭 Audio playback error:', e);
                this.updateVoicePreviewStatus(`Playback error`, 'error');
                URL.revokeObjectURL(audioUrl);
                this.previewAudio = null;
            };

            this.updateVoicePreviewStatus(`[${personality}/${voice}]: "${phrase}"`, 'playing');
            await this.previewAudio.play();

        } catch (error) {
            console.error('🎭 Voice preview error:', error.message, error.stack);
            this.updateVoicePreviewStatus(`Text API failed: ${error.message} - using fallback`, 'error');

            // Fallback to old method if NPCDialogueSystem fails
            this.testVoicePreviewFallback(personality, volume);
        }
    },

    // Fallback voice preview when NPCDialogueSystem is unavailable
    async testVoicePreviewFallback(personality, volume) {
        // Voice mapping for fallback - matches NPCDialogueSystem personas
        const voiceMap = {
            // Dungeon bosses
            dark_lord: 'onyx', frost_lord: 'ash', dragon: 'onyx', alpha_wolf: 'ballad',
            bandit_chief: 'onyx', goblin_king: 'fable', smuggler_boss: 'dan', rat_queen: 'echo',
            necromancer: 'ash', cultist_leader: 'ash',
            // Merchants
            friendly: 'nova', greedy: 'onyx', shrewd: 'sage', eccentric: 'fable',
            mysterious: 'ash', desperate: 'echo',
            // Combat/Encounter NPCs
            gruff: 'onyx', mercenary: 'onyx', robber: 'dan', smuggler: 'dan',
            // Special NPCs
            priest: 'sage', spy: 'ash'
        };
        const voice = voiceMap[personality] || 'nova';

        // Simple fallback phrases - matches NPCDialogueSystem fallbacks
        const fallbackPhrases = {
            // Dungeon bosses
            dark_lord: 'Foolish mortal... you dare address the Dark Lord?',
            frost_lord: 'The cold... eternal... Your warmth fades...',
            dragon: 'Mortal... you dare address ME? I have burned kingdoms.',
            alpha_wolf: 'HOWWWWL! This forest is MINE! Your blood will feed my pack!',
            bandit_chief: 'Your gold or your life! Actually, I\'ll take both!',
            goblin_king: 'HEHEHEHE! Fresh meat for Griknak! Shiny human!',
            smuggler_boss: 'Who let this bilge rat into MY cove?',
            rat_queen: '*SCREEEECH* MY nest! MY children!',
            necromancer: 'The living... disturb my work. You would make a fine corpse.',
            cultist_leader: 'The Dark One watches... Join us, or feed the altar!',
            // Merchants
            friendly: 'Welcome, friend! How can I help you today?',
            greedy: 'Gold... you have gold, yes? Show me your coin.',
            shrewd: 'Let us discuss terms. I know the value of goods.',
            eccentric: 'Ooh! A customer! The stars said you would come!',
            mysterious: 'I have... remedies. What ails you?',
            desperate: 'Please... I can offer good prices. Times are hard.',
            // Combat/Encounter NPCs
            gruff: 'State your business. I\'m watching you.',
            mercenary: 'Coin up front. Nothing personal, just business.',
            robber: 'Your gold or your life! Don\'t be a hero!',
            smuggler: 'You weren\'t followed? Keep your voice down.',
            // Special NPCs
            priest: 'Blessings upon you, child. How may I ease your burdens?',
            spy: 'Information has a price... What do you seek?'
        };
        const phrase = fallbackPhrases[personality] || 'Greetings, traveler.';

        try {
            const url = GameConfig.api.pollinations.getTtsUrl(phrase, voice);
            const response = await fetch(url);
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            this.previewAudio = new Audio(audioUrl);
            this.previewAudio.volume = volume / 100;
            this.previewAudio.onended = () => {
                this.updateVoicePreviewStatus('Playback complete (fallback)', 'info');
                URL.revokeObjectURL(audioUrl);
            };

            this.updateVoicePreviewStatus(`[${personality}/${voice}] (fallback): "${phrase}"`, 'playing');
            await this.previewAudio.play();
        } catch (e) {
            this.updateVoicePreviewStatus(`Fallback failed: ${e.message}`, 'error');
        }
    },

    // Stop voice preview
    stopVoicePreview() {
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
            this.updateVoicePreviewStatus('Stopped.', 'info');
        }
    },

    // update voice preview status
    updateVoicePreviewStatus(message, type) {
        const status = this.panelElement.querySelector('#voice-preview-status');
        if (status) {
            status.textContent = message;
            status.className = `voice-preview-status ${type}`;
        }
    },

    // 🔊 Populate voice dropdown from GameConfig.api.pollinations.tts.voices
    populateVoiceDropdown(selectElement) {
        if (!selectElement) return;

        // Voice descriptions for better UX
        const voiceDescriptions = {
            'nova': 'Warm, Friendly',
            'alloy': 'Neutral, Clear',
            'echo': 'Deep, Measured',
            'fable': 'Expressive, British',
            'onyx': 'Deep, Authoritative',
            'shimmer': 'Soft, Ethereal',
            'coral': 'Gentle, Caring',
            'sage': 'Wise, Refined',
            'verse': 'Dramatic, Theatrical',
            'ballad': 'Rustic, Storyteller',
            'ash': 'Cold, Precise',
            'dan': 'Weathered, Gruff',
            'amuch': 'Unique'
        };

        // 🖤 Pull voices from GameConfig.api.pollinations.tts.voices
        const voices = (typeof GameConfig !== 'undefined' && GameConfig.api?.pollinations?.tts?.voices)
            ? GameConfig.api.pollinations.tts.voices
            : ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'coral', 'verse', 'ballad', 'ash', 'sage', 'amuch', 'dan'];

        const defaultVoice = (typeof GameConfig !== 'undefined' && GameConfig.api?.pollinations?.tts?.defaultVoice)
            ? GameConfig.api.pollinations.tts.defaultVoice
            : 'nova';

        // Clear existing options
        selectElement.innerHTML = '';

        // Populate with voices from config
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice;
            const desc = voiceDescriptions[voice] || 'Voice';
            option.textContent = `${voice.charAt(0).toUpperCase() + voice.slice(1)} (${desc})`;
            if (voice === defaultVoice) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });

        console.log(`🔊 Voice dropdown populated with ${voices.length} voices from config`);
    },

    // refresh AI models from API
    async refreshAIModels() {
        if (typeof NPCVoiceChatSystem === 'undefined') {
            this.updateAPIStatus('disconnected', 'Voice system not loaded');
            return;
        }

        this.updateAPIStatus('checking', 'Fetching models...');

        try {
            await NPCVoiceChatSystem.fetchModels();
            const modelCount = NPCVoiceChatSystem.availableTextModels.length;
            const voiceCount = NPCVoiceChatSystem.availableVoices.length;

            this.updateAPIStatus('connected', `Connected - ${modelCount} models, ${voiceCount} voices available`);
            this.updateModelsDropdown();
            this.displayAvailableModels();
        } catch (error) {
            this.updateAPIStatus('disconnected', `Error: ${error.message}`);
        }
    },

    // check API connection status
    async checkAPIStatus() {
        if (typeof NPCVoiceChatSystem === 'undefined') {
            this.updateAPIStatus('disconnected', 'Voice system not loaded');
            return;
        }

        this.updateAPIStatus('checking', 'Checking connection...');

        // wait for NPCVoiceChatSystem to initialize
        setTimeout(() => {
            if (NPCVoiceChatSystem.availableTextModels.length > 0) {
                const modelCount = NPCVoiceChatSystem.availableTextModels.length;
                const voiceCount = NPCVoiceChatSystem.availableVoices.length;
                this.updateAPIStatus('connected', `Connected - ${modelCount} models, ${voiceCount} voices`);
            } else {
                this.updateAPIStatus('disconnected', 'Could not fetch models - using fallbacks');
            }
        }, 1500);
    },

    // update API status display
    updateAPIStatus(status, message) {
        const indicator = this.panelElement.querySelector('#api-status-indicator');
        const text = this.panelElement.querySelector('#api-status-text');

        if (indicator) {
            indicator.className = `api-status-indicator ${status}`;
        }
        if (text) {
            text.textContent = message;
        }
    },

    // 🤖 Fetch models directly from pollinations API and populate dropdown
    async fetchAndPopulateModels(selectElement) {
        if (!selectElement) return;

        const savedModel = (typeof NPCVoiceChatSystem !== 'undefined')
            ? NPCVoiceChatSystem.settings?.textModel || 'openai'
            : 'openai';

        // Get endpoint from GameConfig
        const modelsEndpoint = (typeof GameConfig !== 'undefined' && GameConfig.api?.pollinations?.modelsEndpoint)
            ? GameConfig.api.pollinations.modelsEndpoint
            : 'https://text.pollinations.ai/models';

        try {
            console.log('🤖 Fetching models from', modelsEndpoint);

            const response = await fetch(modelsEndpoint, {
                method: 'GET',
                mode: 'cors',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const models = await response.json();

            if (!Array.isArray(models) || models.length === 0) {
                throw new Error('No models returned');
            }

            console.log(`🤖 Fetched ${models.length} models from API`);

            // Clear and populate dropdown with ALL fetched models
            selectElement.innerHTML = '';

            models.forEach(model => {
                const option = document.createElement('option');
                const modelName = typeof model === 'string' ? model : model.name;
                const modelDesc = typeof model === 'object' ? (model.description || modelName) : modelName;

                option.value = modelName;
                option.textContent = `${modelName} - ${modelDesc}`;
                selectElement.appendChild(option);
            });

            // Restore saved selection if available
            if (selectElement.querySelector(`option[value="${savedModel}"]`)) {
                selectElement.value = savedModel;
            }

            // Also update NPCVoiceChatSystem if available
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                NPCVoiceChatSystem.availableTextModels = models;
            }

            console.log(`🤖 Dropdown populated with ${models.length} models`);

        } catch (error) {
            console.error('🤖 Failed to fetch models:', error);
            // Use fallback models
            selectElement.innerHTML = '';
            const fallbackModels = [
                { name: 'openai', desc: 'OpenAI GPT-4o Mini' },
                { name: 'openai-fast', desc: 'OpenAI Fast' },
                { name: 'openai-reasoning', desc: 'OpenAI Reasoning' },
                { name: 'gemini', desc: 'Gemini 2.5 Flash' },
                { name: 'deepseek', desc: 'DeepSeek V3' },
                { name: 'mistral', desc: 'Mistral Small' },
                { name: 'qwen-coder', desc: 'Qwen Coder' }
            ];
            fallbackModels.forEach(m => {
                const option = document.createElement('option');
                option.value = m.name;
                option.textContent = `${m.name} - ${m.desc}`;
                selectElement.appendChild(option);
            });
            selectElement.value = savedModel;
        }
    },

    // update models dropdown with fetched models (legacy - uses NPCVoiceChatSystem)
    updateModelsDropdown() {
        if (typeof NPCVoiceChatSystem === 'undefined') return;

        const select = this.panelElement.querySelector('#ai-text-model');
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '';

        NPCVoiceChatSystem.availableTextModels.forEach(model => {
            const option = document.createElement('option');
            const modelName = typeof model === 'string' ? model : model.name;
            const modelDesc = typeof model === 'object' ? (model.description || modelName) : modelName;

            option.value = modelName;
            option.textContent = modelDesc;
            select.appendChild(option);
        });

        // restore previous selection if still available
        if (select.querySelector(`option[value="${currentValue}"]`)) {
            select.value = currentValue;
        }
    },

    // display available models list
    displayAvailableModels() {
        if (typeof NPCVoiceChatSystem === 'undefined') return;

        const list = this.panelElement.querySelector('#available-models-list');
        if (!list) return;

        list.innerHTML = '';
        list.classList.add('visible');

        NPCVoiceChatSystem.availableTextModels.slice(0, 10).forEach(model => {
            const item = document.createElement('div');
            item.className = 'model-item';

            const modelName = typeof model === 'string' ? model : model.name;
            const modelDesc = typeof model === 'object' ? (model.description || '') : '';

            item.innerHTML = `
                <span class="model-name">${modelName}</span>
                <span class="model-desc">${modelDesc}</span>
            `;
            list.appendChild(item);
        });

        if (NPCVoiceChatSystem.availableTextModels.length > 10) {
            const more = document.createElement('div');
            more.className = 'model-item';
            more.innerHTML = `<span class="model-desc">...and ${NPCVoiceChatSystem.availableTextModels.length - 10} more</span>`;
            list.appendChild(more);
        }
    },

    // switch tabs - navigate your preferences like a lost soul
    switchTab(tabName) {
        // update tab buttons - highlight the chosen one
        const tabs = this.panelElement.querySelectorAll('.settings-tab');
        let activeTab = null;
        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            if (isActive) activeTab = tab;
        });

        // 🖤 scroll the active tab into view - chase that which you seek
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }

        // update tab content - show the corresponding mess
        const contents = this.panelElement.querySelectorAll('.settings-tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        // refresh save lists when switching to saveload tab - show all your timelines
        if (tabName === 'saveload') {
            this.refreshSaveLists();
        }

        // refresh keybindings when switching to controls tab - display your key combos
        if (tabName === 'controls') {
            this.refreshKeyBindingsUI();
        }

        // populate about tab with gameconfig data - credits roll at 3am
        if (tabName === 'about') {
            this.populateAboutTab();
        }

        // 🏆 populate leaderboard tab - show the path to eternal glory
        if (tabName === 'leaderboard') {
            this.populateLeaderboardTab();
        }
    },

    // 🏆 Populate leaderboard tab - configure your path to glory
    populateLeaderboardTab() {
        // Load current config
        if (typeof GlobalLeaderboardSystem !== 'undefined') {
            const config = GlobalLeaderboardSystem.config;

            // Check if configured via GameConfig
            const isConfiguredInGameConfig = typeof GameConfig !== 'undefined' &&
                GameConfig.leaderboard &&
                GameConfig.leaderboard.enabled &&
                ((GameConfig.leaderboard.jsonbin?.binId && GameConfig.leaderboard.jsonbin?.apiKey) ||
                 GameConfig.leaderboard.gist?.gistId);

            // Set backend selector
            const backendSelect = document.getElementById('leaderboard-backend');
            if (backendSelect) {
                backendSelect.value = config.backend || 'local';
                this.updateLeaderboardConfigUI(config.backend);

                // Disable if configured in GameConfig
                if (isConfiguredInGameConfig) {
                    backendSelect.disabled = true;
                }
            }

            // Set JSONBin values
            const jsonbinId = document.getElementById('jsonbin-id');
            const jsonbinKey = document.getElementById('jsonbin-key');
            if (jsonbinId) {
                jsonbinId.value = config.BIN_ID || '';
                if (isConfiguredInGameConfig && config.backend === 'jsonbin') {
                    jsonbinId.disabled = true;
                    jsonbinId.placeholder = 'Configured in config.js';
                }
            }
            if (jsonbinKey) {
                jsonbinKey.value = config.API_KEY ? '••••••••••••••••' : '';
                if (isConfiguredInGameConfig && config.backend === 'jsonbin') {
                    jsonbinKey.disabled = true;
                    jsonbinKey.placeholder = 'Configured in config.js';
                }
            }

            // Set Gist values
            const gistId = document.getElementById('gist-id');
            if (gistId) {
                gistId.value = config.GIST_ID || '';
                if (isConfiguredInGameConfig && config.backend === 'gist') {
                    gistId.disabled = true;
                    gistId.placeholder = 'Configured in config.js';
                }
            }

            // Show status if configured via GameConfig
            if (isConfiguredInGameConfig) {
                this.showLeaderboardStatus(`✅ global leaderboard configured in config.js (${config.backend})`, 'success');
            }

            // Refresh leaderboard preview
            this.refreshLeaderboardPreview();
        }
    },

    // Update config UI based on backend selection
    updateLeaderboardConfigUI(backend) {
        const jsonbinConfig = document.getElementById('jsonbin-config');
        const gistConfig = document.getElementById('gist-config');

        if (jsonbinConfig) jsonbinConfig.style.display = backend === 'jsonbin' ? 'block' : 'none';
        if (gistConfig) gistConfig.style.display = backend === 'gist' ? 'block' : 'none';
    },

    // Save leaderboard configuration
    saveLeaderboardConfig() {
        if (typeof GlobalLeaderboardSystem === 'undefined') return;

        const backend = document.getElementById('leaderboard-backend')?.value || 'local';
        const binId = document.getElementById('jsonbin-id')?.value || '';
        const apiKey = document.getElementById('jsonbin-key')?.value || '';
        const gistId = document.getElementById('gist-id')?.value || '';

        GlobalLeaderboardSystem.configure({
            backend: backend,
            BIN_ID: binId,
            API_KEY: apiKey,
            GIST_ID: gistId
        });

        this.showLeaderboardStatus('✅ configuration saved! your legacy awaits.', 'success');
    },

    // Test leaderboard connection
    async testLeaderboardConnection() {
        if (typeof GlobalLeaderboardSystem === 'undefined') {
            this.showLeaderboardStatus('❌ leaderboard system not loaded', 'error');
            return;
        }

        this.showLeaderboardStatus('🔄 testing connection...', 'info');

        try {
            // Save config first
            this.saveLeaderboardConfig();

            // Try to fetch
            await GlobalLeaderboardSystem.refresh();

            const count = GlobalLeaderboardSystem.leaderboard.length;
            this.showLeaderboardStatus(`✅ connected! found ${count} champion${count !== 1 ? 's' : ''} in the hall.`, 'success');
            this.refreshLeaderboardPreview();
        } catch (error) {
            this.showLeaderboardStatus(`❌ connection failed: ${error.message}`, 'error');
        }
    },

    // Show status message
    showLeaderboardStatus(message, type = 'info') {
        const status = document.getElementById('leaderboard-status');
        if (status) {
            status.textContent = message;
            status.className = `leaderboard-status ${type}`;
        }
    },

    // Refresh leaderboard preview in settings
    refreshLeaderboardPreview() {
        const preview = document.getElementById('settings-leaderboard-preview');
        if (!preview || typeof GlobalLeaderboardSystem === 'undefined') return;

        const leaderboard = GlobalLeaderboardSystem.leaderboard.slice(0, 5);

        if (leaderboard.length === 0) {
            preview.innerHTML = '<p class="empty">no champions yet... be the first to claim glory.</p>';
            return;
        }

        preview.innerHTML = leaderboard.map((entry, i) => {
            const rank = i + 1;
            const icon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            return `
                <div class="preview-entry rank-${rank}">
                    <span class="rank">${icon}</span>
                    <span class="name">${this.escapeHtml(entry.playerName)}</span>
                    <span class="score">💰 ${entry.score.toLocaleString()}</span>
                </div>
            `;
        }).join('');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // populate about tab - display who to blame for this mess
    populateAboutTab() {
        const aboutContent = document.getElementById('about-content');
        if (!aboutContent) return;

        if (typeof GameConfig !== 'undefined') {
            aboutContent.innerHTML = GameConfig.getAboutHTML();
        } else {
            // fallback if gameconfig isn't available - this should never happen
            // but if it does, at least show something
            aboutContent.innerHTML = `
                <div class="about-section">
                    <div class="about-logo">🏰</div>
                    <h2>Medieval Trading Game</h2>
                    <p class="about-tagline">where capitalism meets the dark ages... literally</p>
                    <div class="about-version">Version unknown (config not loaded)</div>
                    <div class="about-studio">
                        <span class="studio-label">Created by</span>
                        <span class="studio-name">Unity AI Lab</span>
                    </div>
                    <div class="about-copyright">© 2024 Unity AI Lab. all rights reserved.</div>
                </div>
            `;
        }
    },

    // refresh keybindings ui - map your keyboard to your suffering
    refreshKeyBindingsUI() {
        console.log('🖤 refreshKeyBindingsUI called');
        // 🖤 Use panelElement.querySelector for consistency with dynamically created panel
        let listContainer = this.panelElement?.querySelector('#keybindings-list');
        // Fallback to document search if panel not available
        if (!listContainer) {
            listContainer = document.getElementById('keybindings-list');
        }
        if (!listContainer) {
            console.warn('🖤 keybindings-list container not found');
            return;
        }

        // 🖤 Ensure KeyBindings is initialized
        if (typeof KeyBindings === 'undefined') {
            listContainer.innerHTML = '<p class="no-saves">Keyboard system not available</p>';
            return;
        }

        // Force initialize if not already done
        if (!KeyBindings.current || Object.keys(KeyBindings.current).length === 0) {
            console.log('🖤 KeyBindings not initialized, calling init()');
            KeyBindings.init();
        }

        // 🖤 Get keybindings from GameConfig as fallback source of truth
        const getKeyBinding = (action) => {
            // First try KeyBindings.current
            if (KeyBindings.current && KeyBindings.current[action]) {
                return KeyBindings.current[action];
            }
            // Then try KeyBindings.defaults
            if (KeyBindings.defaults && KeyBindings.defaults[action]) {
                return KeyBindings.defaults[action];
            }
            // Finally try GameConfig directly
            if (typeof GameConfig !== 'undefined' && GameConfig.keybindings?.defaults?.[action]) {
                return GameConfig.keybindings.defaults[action];
            }
            return '?';
        };

        const getDescription = (action) => {
            if (KeyBindings.descriptions && KeyBindings.descriptions[action]) {
                return KeyBindings.descriptions[action];
            }
            if (typeof GameConfig !== 'undefined' && GameConfig.keybindings?.descriptions?.[action]) {
                return GameConfig.keybindings.descriptions[action];
            }
            return action;
        };

        const formatKey = (key) => {
            if (typeof KeyBindings.formatKey === 'function') {
                return KeyBindings.formatKey(key);
            }
            const specialKeys = {
                ' ': 'Space', 'Escape': 'Esc', 'ArrowUp': '↑', 'ArrowDown': '↓',
                'ArrowLeft': '←', 'ArrowRight': '→'
            };
            return specialKeys[key] || (key ? key.toUpperCase() : '?');
        };

        // group keybindings by category - organize the chaos
        const categories = {
            'Game Control': ['pause', 'escape'],
            'Panels': ['inventory', 'character', 'financial', 'market', 'travel', 'properties', 'achievements', 'settings', 'quests', 'map'],
            'Map Navigation': ['mapUp', 'mapDown', 'mapLeft', 'mapRight', 'zoomIn', 'zoomOut'],
            'Quick Actions': ['quickSave', 'quickLoad']
        };

        let html = '';

        Object.entries(categories).forEach(([category, actions]) => {
            html += `<div class="keybind-section-header">${category}</div>`;

            actions.forEach(action => {
                const key = getKeyBinding(action);
                const description = getDescription(action);
                const formattedKey = formatKey(key);

                html += `
                    <div class="keybind-row" data-action="${action}">
                        <span class="keybind-action">${description}</span>
                        <button class="keybind-key" data-action="${action}" onclick="SettingsPanel.startKeyRebind('${action}', this)">
                            ${formattedKey}
                        </button>
                    </div>
                `;
            });
        });

        console.log('🖤 Setting keybindings HTML, length:', html.length);
        listContainer.innerHTML = html;

        // setup reset button - return to factory defaults
        let resetBtn = this.panelElement?.querySelector('#reset-keybindings-btn');
        if (!resetBtn) resetBtn = document.getElementById('reset-keybindings-btn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm('Reset all keybindings to defaults?')) {
                    if (typeof KeyBindings !== 'undefined') {
                        KeyBindings.resetToDefaults();
                    }
                    this.refreshKeyBindingsUI();
                }
            };
        }
    },

    // start rebinding a key - press any key to continue your descent
    startKeyRebind(action, buttonElement) {
        // remove any existing listening state - only one key at a time
        const allKeys = document.querySelectorAll('.keybind-key');
        allKeys.forEach(k => k.classList.remove('listening'));

        // set this button to listening - awaiting your input
        buttonElement.classList.add('listening');
        buttonElement.textContent = 'Press a key...';

        // store the rebind context - remember what we're changing
        this.rebindContext = {
            action: action,
            button: buttonElement,
            originalKey: KeyBindings.getKey(action)
        };

        // listen for keydown - capture your choice
        this.rebindListener = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // cancel on escape - second thoughts are valid
            if (e.key === 'Escape') {
                this.cancelKeyRebind();
                return;
            }

            // complete the rebind - seal the deal
            this.completeKeyRebind(e.key);
        };

        document.addEventListener('keydown', this.rebindListener, { once: true, capture: true });
    },

    // complete rebinding - your choice is locked in
    completeKeyRebind(newKey) {
        if (!this.rebindContext) return;

        const { action, button } = this.rebindContext;

        // check for conflicts - did you steal someone else's key
        const existingAction = Object.entries(KeyBindings.current).find(
            ([act, key]) => key === newKey && act !== action
        );

        if (existingAction) {
            const existingDesc = KeyBindings.descriptions[existingAction[0]] || existingAction[0];
            if (!confirm(`"${KeyBindings.formatKey(newKey)}" is already used for "${existingDesc}". Swap keys?`)) {
                this.cancelKeyRebind();
                return;
            }
            // swap the keys - silent but deadly
            KeyBindings.setKey(existingAction[0], this.rebindContext.originalKey, true);
        }

        // set the new key - commit to the change
        KeyBindings.setKey(action, newKey, true);

        // update ui - make it official
        button.classList.remove('listening');
        button.textContent = KeyBindings.formatKey(newKey);

        // refresh to update any swapped keys - cascade the changes
        this.refreshKeyBindingsUI();

        // cleanup - dispose of the evidence
        this.rebindContext = null;
    },

    // cancel rebinding - nevermind, keep the old key
    cancelKeyRebind() {
        if (!this.rebindContext) return;

        const { button, originalKey } = this.rebindContext;
        button.classList.remove('listening');
        button.textContent = KeyBindings.formatKey(originalKey);

        // remove listener if still attached - cleanup time
        if (this.rebindListener) {
            document.removeEventListener('keydown', this.rebindListener, { capture: true });
        }

        this.rebindContext = null;
    },

    // refresh save lists - display all your saved moments
    refreshSaveLists() {
        this.populateAutoSaveList();
        this.populateManualSaveList();
    },

    // populate auto-save list - the system's attempt at saving you
    populateAutoSaveList() {
        const listContainer = document.getElementById('auto-save-list');
        if (!listContainer) return;

        if (typeof SaveLoadSystem === 'undefined') {
            listContainer.innerHTML = '<p class="no-saves">Save system not available</p>';
            return;
        }

        const autoSaves = SaveLoadSystem.getAutoSaveList();

        if (!autoSaves || autoSaves.length === 0) {
            listContainer.innerHTML = '<p class="no-saves">No auto-saves yet... play the game to create some!</p>';
            return;
        }

        listContainer.innerHTML = autoSaves.map(save => `
            <div class="save-slot-item" data-save-index="${save.index}">
                <div class="save-slot-info">
                    <span class="save-slot-name">💾 ${save.name}</span>
                    <span class="save-slot-details">
                        ${save.playerName} | Day ${save.day} | ${save.gold}g | ${save.location}
                    </span>
                    <span class="save-slot-details">${save.formattedTime}</span>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn load-btn" onclick="SaveLoadSystem.loadAutoSave(${save.index}); SettingsPanel.closePanel();">
                        Load
                    </button>
                </div>
            </div>
        `).join('');
    },

    // populate manual save list - your deliberate checkpoints
    populateManualSaveList() {
        const listContainer = document.getElementById('manual-save-list');
        if (!listContainer) return;

        if (typeof SaveLoadSystem === 'undefined') {
            listContainer.innerHTML = '<p class="no-saves">Save system not available</p>';
            return;
        }

        const manualSaves = Object.entries(SaveLoadSystem.saveSlots)
            .filter(([slot, info]) => info.exists)
            .map(([slot, info]) => ({ slot: parseInt(slot), ...info }));

        if (manualSaves.length === 0) {
            listContainer.innerHTML = '<p class="no-saves">No manual saves yet... press Save Game to create one!</p>';
            return;
        }

        listContainer.innerHTML = manualSaves.map(save => `
            <div class="save-slot-item" data-save-slot="${save.slot}">
                <div class="save-slot-info">
                    <span class="save-slot-name">📁 ${save.name || 'Save Slot ' + save.slot}</span>
                    <span class="save-slot-details">
                        ${save.timestamp ? new Date(save.timestamp).toLocaleString() : 'Unknown date'}
                    </span>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn load-btn" onclick="SaveLoadSystem.loadFromSlot(${save.slot}); SettingsPanel.closePanel();">
                        Load
                    </button>
                    <button class="save-slot-btn delete-btn" onclick="SaveLoadSystem.deleteSlot(${save.slot}); SettingsPanel.refreshSaveLists();">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    // open settings panel - welcome to configuration hell
    openPanel() {
        // ensure panel is initialized before opening
        if (!this.panelElement) {
            this.init();
        }

        // 🖤 Ensure KeyBindings is initialized before showing panel
        if (typeof KeyBindings !== 'undefined' && (!KeyBindings.current || Object.keys(KeyBindings.current).length === 0)) {
            KeyBindings.init();
        }

        this.isOpen = true;
        this.panelElement.style.display = 'block';

        // 🖤 Force high z-index to appear above EVERYTHING including main-menu
        this.panelElement.style.zIndex = '99999';

        // add entrance animation - fade in like regret
        setTimeout(() => {
            this.panelElement.classList.add('open');
        }, 10);

        // prevent body scroll - trap you in here with us
        document.body.style.overflow = 'hidden';

        // 🖤 Pre-populate keybindings UI in case Controls tab is visible or will be clicked
        setTimeout(() => {
            this.refreshKeyBindingsUI();
        }, 50);

        console.log('🖤 SettingsPanel opened, z-index:', this.panelElement.style.zIndex);
    },

    // close settings panel - escape back to reality
    closePanel() {
        this.isOpen = false;
        if (this.panelElement) {
            this.panelElement.classList.remove('open');

            // remove after animation - fade out gracefully
            setTimeout(() => {
                if (this.panelElement) {
                    this.panelElement.style.display = 'none';
                }
            }, 300);
        }

        // restore body scroll - freedom returns
        document.body.style.overflow = '';
    },

    // alias for show - another way in
    show() {
        // ensure panel is initialized before showing
        if (!this.panelElement) {
            this.init();
        }
        // 🖤 Ensure KeyBindings is initialized for controls tab
        if (typeof KeyBindings !== 'undefined' && !KeyBindings.current?.pause) {
            KeyBindings.init();
        }
        this.openPanel();
    },

    // alias for hide - another way out
    hide() {
        this.closePanel();
    },

    // apply settings - commit your choices to the void
    applySettings() {
        // save all settings - persist your decisions
        this.saveSettings();

        // apply all settings to their respective systems - make it real
        Object.keys(this.currentSettings).forEach(category => {
            Object.keys(this.currentSettings[category]).forEach(settingKey => {
                this.applyImmediateSetting(category, settingKey, this.currentSettings[category][settingKey]);
            });
        });

        // show notification - pat yourself on the back
        if (typeof UIPolishSystem !== 'undefined') {
            UIPolishSystem.showNotification('Settings applied successfully!', 'success');
        }
        
        this.closePanel();
    },

    // return to main menu - escape to the beginning
    returnToMainMenu() {
        if (confirm('Return to main menu? Unsaved progress will be lost.')) {
            this.closePanel();

            // Use the global function if available
            if (typeof window.cancelGameSetup === 'function') {
                window.cancelGameSetup();
            } else {
                // Fallback: manually show main menu
                const mainMenu = document.getElementById('main-menu');
                const gameContainer = document.getElementById('game-container');
                const gameSetupPanel = document.getElementById('game-setup-panel');

                if (gameContainer) gameContainer.classList.add('hidden');
                if (gameSetupPanel) gameSetupPanel.classList.add('hidden');
                if (mainMenu) mainMenu.classList.remove('hidden');

                // Reset game state if available
                if (typeof changeState === 'function' && typeof GameState !== 'undefined') {
                    changeState(GameState.MENU);
                }

                console.log('🏠 Returned to main menu via SettingsPanel');
            }
        }
    },

    // reset to defaults - undo all your questionable choices
    resetToDefaults() {
        // confirm reset - are you sure about this
        if (!confirm('Are you sure you want to reset all settings to their default values?')) {
            return;
        }

        // reset all settings - back to square one
        try {
            this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        }

        // update ui controls - show the defaults in all their glory
        this.updateControlsFromSettings();

        // apply settings - enforce the reset
        this.applySettings();
    },

    // clear all data - burn it ALL down, squeaky clean, nothing remains
    clearAllData() {
        // double confirm because this is destructive - we're serious here
        if (!confirm('⚠️ WARNING: This will DELETE ALL your local data including:\n\n• All saved games (manual & auto)\n• All settings & preferences\n• Panel positions & layout\n• Achievement progress\n• High scores & statistics\n• Location history\n• Cached leaderboard data\n• ALL cookies and cached data\n• EVERYTHING stored locally\n\n🏆 Note: The global Hall of Champions on the server will NOT be affected (your scores remain online).\n\nThis cannot be undone!\n\nAre you sure you want to continue?')) {
            return;
        }

        // second confirmation - last chance to bail
        if (!confirm('🗑️ FINAL WARNING!\n\nYou are about to permanently delete ALL local game data.\nYour computer will be squeaky clean - nothing remains.\n\nThe global Hall of Champions server data will remain intact.\n\nClick OK to confirm TOTAL deletion.')) {
            return;
        }

        console.log('🗑️ NUCLEAR OPTION: Clearing ALL application data...');

        try {
            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 1: Clear ALL localStorage - everything goes
            // ═══════════════════════════════════════════════════════════
            const localStorageKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                localStorageKeys.push(localStorage.key(i));
            }
            localStorageKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`✓ localStorage removed: ${key}`);
            });
            localStorage.clear(); // belt and suspenders
            console.log('✓ LocalStorage completely cleared');

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 2: Clear ALL sessionStorage
            // ═══════════════════════════════════════════════════════════
            sessionStorage.clear();
            console.log('✓ SessionStorage cleared');

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 3: Clear ALL IndexedDB databases
            // ═══════════════════════════════════════════════════════════
            if (window.indexedDB) {
                // Known database names
                const knownDatabases = [
                    'TraderClaudeDB',
                    'trader-claude',
                    'game-saves',
                    'medievalTradingGame',
                    'leaderboard-cache'
                ];
                knownDatabases.forEach(dbName => {
                    try {
                        indexedDB.deleteDatabase(dbName);
                        console.log(`✓ IndexedDB "${dbName}" deleted`);
                    } catch (e) {
                        console.log(`⚠ Could not delete IndexedDB "${dbName}":`, e);
                    }
                });

                // Also try to list and delete all databases (if browser supports it)
                if (indexedDB.databases) {
                    indexedDB.databases().then(databases => {
                        databases.forEach(db => {
                            try {
                                indexedDB.deleteDatabase(db.name);
                                console.log(`✓ IndexedDB "${db.name}" deleted (discovered)`);
                            } catch (e) {}
                        });
                    }).catch(() => {});
                }
            }
            console.log('✓ IndexedDB cleared');

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 4: Clear ALL cookies for this domain
            // ═══════════════════════════════════════════════════════════
            const cookies = document.cookie.split(';');
            cookies.forEach(cookie => {
                const name = cookie.split('=')[0].trim();
                if (name) {
                    // Try multiple paths to ensure deletion
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                    console.log(`✓ Cookie "${name}" deleted`);
                }
            });
            console.log('✓ All cookies cleared');

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 5: Clear Cache Storage (Service Worker caches)
            // ═══════════════════════════════════════════════════════════
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        caches.delete(cacheName);
                        console.log(`✓ Cache "${cacheName}" deleted`);
                    });
                }).catch(() => {});
            }
            console.log('✓ Cache Storage cleared');

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 6: Unregister Service Workers
            // ═══════════════════════════════════════════════════════════
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        registration.unregister();
                        console.log('✓ Service Worker unregistered');
                    });
                }).catch(() => {});
            }

            // ═══════════════════════════════════════════════════════════
            // 🧹 STEP 7: Clear in-memory caches in our systems
            // ═══════════════════════════════════════════════════════════
            if (typeof GlobalLeaderboardSystem !== 'undefined') {
                GlobalLeaderboardSystem.leaderboard = [];
                GlobalLeaderboardSystem.lastFetch = null;
                console.log('✓ Leaderboard memory cache cleared');
            }

            console.log('🧹 ALL DATA OBLITERATED - SQUEAKY CLEAN!');

            // show success message - it's done
            alert('✅ ALL DATA HAS BEEN COMPLETELY CLEARED!\n\n🧹 Your system is squeaky clean:\n• All saves deleted\n• All settings reset\n• All cache cleared\n• All cookies removed\n\n🏆 Your scores on the global Hall of Champions server remain safe.\n\nThe page will now reload.');

            // reload the page with cache bypass - rebirth imminent
            window.location.reload(true);

        } catch (error) {
            console.error('Error clearing data:', error);
            alert('❌ Error clearing some data. Please try clearing your browser data manually.\n\nError: ' + error.message);
        }
    },

    // update controls from current settings - sync ui with reality
    updateControlsFromSettings() {
        Object.keys(this.currentSettings).forEach(category => {
            Object.keys(this.currentSettings[category]).forEach(settingKey => {
                const value = this.currentSettings[category][settingKey];
                const element = this.panelElement.querySelector(`#${this.getElementId(category, settingKey)}`);


                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else if (element.type === 'range') {
                        element.value = value;
                        // update value display - show what it's set to
                        const valueDisplay = element.parentElement.querySelector('.setting-value');
                        if (valueDisplay) {
                            if (category === 'audio') {
                                valueDisplay.textContent = `${Math.round(value * 100)}%`;
                            } else if (category === 'animation' && settingKey === 'animationSpeed') {
                                valueDisplay.textContent = `${value}x`;
                            }
                        }
                    } else if (element.tagName === 'SELECT') {
                        element.value = value;
                    }
                }
            });
        });
    },

    // get element id from category and setting key - the mapping ritual
    getElementId(category, settingKey) {
        const idMap = {
            'audio': {
                'masterVolume': 'master-volume',
                'musicVolume': 'music-volume',
                'sfxVolume': 'sfx-volume',
                'audioEnabled': 'audio-enabled',
                'isMuted': 'master-mute',
                'isMusicMuted': 'music-mute',
                'isSfxMuted': 'sfx-mute'
            },
            'visual': {
                'particlesEnabled': 'particles-enabled',
                'screenShakeEnabled': 'screen-shake-enabled',
                'animationsEnabled': 'visual-animations-enabled',
                'weatherEffectsEnabled': 'weather-effects-enabled',
                'flashWarnings': 'flash-warnings',
                'reducedMotion': 'reduced-motion',
                'quality': 'visual-quality'
            },
            'animation': {
                'animationsEnabled': 'animation-enabled',
                'animationSpeed': 'animation-speed',
                'reducedMotion': 'animation-reduced-motion',
                'quality': 'animation-quality'
            },
            'ui': {
                'animationsEnabled': 'ui-animations-enabled',
                'hoverEffectsEnabled': 'hover-effects-enabled',
                'transitionsEnabled': 'transitions-enabled',
                'reducedMotion': 'ui-reduced-motion',
                'highContrast': 'ui-high-contrast',
                'theme': 'ui-theme',
                'fontSize': 'ui-font-size'
            },
            'environmental': {
                'weatherEffectsEnabled': 'env-weather-enabled',
                'lightingEnabled': 'env-lighting-enabled',
                'seasonalEffectsEnabled': 'env-seasonal-enabled',
                'reducedEffects': 'env-reduced-effects',
                'quality': 'env-quality'
            },
            'accessibility': {
                'reducedMotion': 'access-reduced-motion',
                'highContrast': 'access-high-contrast',
                'screenReaderEnabled': 'access-screen-reader',
                'flashWarnings': 'access-flash-warnings',
                'keyboardNavigation': 'access-keyboard-nav',
                'colorBlindMode': 'access-colorblind',
                'fontSize': 'access-font-size'
            }
        };
        
        return idMap[category]?.[settingKey] || null;
    },

    // get current settings - retrieve your configuration
    getSettings(category = null) {
        if (category) {
            return { ...this.currentSettings[category] };
        }
        try {
            return JSON.parse(JSON.stringify(this.currentSettings));
        } catch (error) {
            console.error('Failed to clone settings:', error);
            return {};
        }
    },

    // update specific setting - change just one thing
    updateSetting(category, settingKey, value) {
        if (this.currentSettings[category] && settingKey in this.currentSettings[category]) {
            this.currentSettings[category][settingKey] = value;
            this.saveSettings(category);
            this.applyImmediateSetting(category, settingKey, value);
        }
    },

    // cleanup - destroy the evidence
    cleanup() {
        if (this.panelElement) {
            this.panelElement.remove();
        }

        const styles = document.getElementById('settings-panel-styles');
        if (styles) {
            styles.remove();
        }
    },

    // 🗑️ Clear all auto-saves to free up space
    clearAutoSaves() {
        if (!confirm('This will delete ALL auto-saves. Your manual saves will be kept. Continue?')) {
            return;
        }

        let clearedCount = 0;
        for (let i = 0; i < 10; i++) {
            const key = `tradingGameAutoSave_${i}`;
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                clearedCount++;
            }
        }

        // Clear auto-save slots metadata
        localStorage.removeItem('tradingGameAutoSaveSlots');

        this.updateStorageInfo();
        addMessage(`🗑️ Cleared ${clearedCount} auto-saves!`, 'success');
    },

    // 🧹 Clear cache data (price history, events, etc)
    clearCacheData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('PriceHistory') ||
                key.includes('MarketSaturation') ||
                key.includes('CityEvents') ||
                key.includes('CityReputation') ||
                key.includes('debug') ||
                key.includes('temp')
            )) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.updateStorageInfo();
        addMessage(`🧹 Cleared ${keysToRemove.length} cache entries!`, 'success');
    },

    // 📊 Update storage info display
    updateStorageInfo() {
        const storageInfo = document.getElementById('storage-info');
        if (!storageInfo) return;

        let totalSize = 0;
        let gameSize = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const size = (localStorage.getItem(key) || '').length;
                totalSize += size;
                if (key.includes('tradingGame')) {
                    gameSize += size;
                }
            }
        }

        const usedKB = (gameSize / 1024).toFixed(1);
        const totalKB = (totalSize / 1024).toFixed(1);
        const limitKB = 5120; // 5MB
        const percent = ((gameSize / 1024) / limitKB * 100).toFixed(1);

        storageInfo.innerHTML = `
            <span>Game Data: <strong>${usedKB} KB</strong> (${percent}% of 5MB limit)</span>
            <div class="storage-bar">
                <div class="storage-fill" style="width: ${Math.min(percent, 100)}%; background: ${percent > 80 ? '#f44336' : percent > 50 ? '#ff9800' : '#4caf50'};"></div>
            </div>
        `;
    }
};

// 🖤 Update storage info when settings panel opens
const originalShow = SettingsPanel.show;
SettingsPanel.show = function() {
    originalShow.call(this);
    setTimeout(() => this.updateStorageInfo(), 100);
};

// 🖤 Auto-initialize SettingsPanel when DOM is ready
// This ensures the panel is ready BEFORE user clicks settings on main menu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            SettingsPanel.init();
            console.log('🖤 SettingsPanel auto-initialized on DOMContentLoaded');
        }, 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        SettingsPanel.init();
        console.log('🖤 SettingsPanel auto-initialized (DOM already ready)');
    }, 100);
}

// export for use in other modules - share the suffering
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsPanel;
}