// ═══════════════════════════════════════════════════════════════
// SETTINGS PANEL - game configuration interface
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const SettingsPanel = {
    // panel state - are we drowning in options or nah
    isOpen: false,
    panelElement: null,
    settingsTabs: {},

    // default settings - where hope goes to die
    // defaultsettings now sourced from gameconfig.settings
    // one source of truth - change defaults in config.js, not here
    get defaultSettings() {
        // fallback defaults if GameConfig not loaded yet
        const fallback = {
            audio: { masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.7, voiceVolume: 70 },
            visual: { particlesEnabled: true, screenShakeEnabled: true, animationsEnabled: true, weatherEffectsEnabled: true, quality: 'medium', reducedMotion: false, flashWarnings: true },
            animation: { animationsEnabled: true, animationSpeed: 1.0, reducedMotion: false, quality: 'medium' },
            ui: { animationsEnabled: true, hoverEffectsEnabled: true, transitionsEnabled: true, reducedMotion: false, highContrast: false, fontSize: 'medium', theme: 'default', uiScale: 1.0 },
            environmental: { weatherEffectsEnabled: true, lightingEnabled: true, seasonalEffectsEnabled: true, quality: 'medium', reducedEffects: false },
            accessibility: { reducedMotion: false, highContrast: false, screenReaderEnabled: false, flashWarnings: true, colorBlindMode: 'none', fontSize: 'medium', keyboardNavigation: true },
            gameplay: { showTutorialOnStart: true }
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

    // track if we've already initialized
    _initialized: false,

    // initialize settings panel - birth of the preference nightmare
    init() {
        // prevent double initialization that causes duplicate ids
        if (this._initialized) {
            console.log('⚙️ Settings panel already initialized, skipping');
            return;
        }

        this.loadSettings();
        this.createPanel();
        this.setupEventListeners();
        this._initialized = true;

        // Apply saved UI scale on initialization
        if (this.currentSettings.ui?.uiScale && this.currentSettings.ui.uiScale !== 1.0) {
            this.applyUIScale(this.currentSettings.ui.uiScale);
        }

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
                    // silent fallback - corrupt data just means we use defaults
                    this.currentSettings[category] = { ...this.defaultSettings[category] };
                    localStorage.removeItem(`tradingGame${category.charAt(0).toUpperCase() + category.slice(1)}Settings`);
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
        // check if panel already exists - prevent duplicate id nightmare
        const existingPanel = document.getElementById('settings-panel');
        if (existingPanel) {
            this.panelElement = existingPanel;
            console.log('⚙️ Settings panel HTML already exists, reusing element');
            // fixed: don't return early! we still need to setup event listeners!
            // The HTML might exist from a previous session but listeners are lost on page load
            return; // We'll re-attach listeners in openPanel() if needed
        }

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
                            <button class="settings-tab" data-tab="gameplay">🎮 Gameplay</button>
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
                                    <input type="range" id="music-volume" min="0" max="1" step="0.05" value="0.3">
                                    <span class="setting-value">30%</span>
                                </div>
                                <div class="setting-item">
                                    <label for="sfx-volume">Sound Effects Volume</label>
                                    <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="0.7">
                                    <span class="setting-value">70%</span>
                                </div>
                                <div class="setting-item">
                                    <label for="voice-volume">NPC Voice Volume</label>
                                    <input type="range" id="voice-volume" min="0" max="100" step="5" value="70">
                                    <span class="setting-value" id="voice-volume-value">70%</span>
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
                                    <label for="ui-scale">UI Scale</label>
                                    <input type="range" id="ui-scale" min="0.75" max="1.5" step="0.05" value="1">
                                    <span class="setting-value" id="ui-scale-value">100%</span>
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

                        <!-- 🎮 Gameplay Tab - tweak the torture experience -->
                        <div class="settings-tab-content" data-tab="gameplay">
                            <h3>Gameplay Settings</h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="tutorial-on-start" checked>
                                        Show Tutorial Prompt on New Game
                                    </label>
                                </div>
                                <p class="settings-description">When enabled, you'll be asked if you want to see the tutorial each time you start a new game. Turn OFF if you restart often and don't want to be asked every time.</p>
                            </div>
                        </div>

                        <!-- 🎙️ AI Voice Tab - give NPCs souls and voices -->
                        <div class="settings-tab-content" data-tab="aivoice">
                            <h3>🎙️ AI Voice Chat Settings</h3>
                            <p class="settings-description">Configure how NPCs communicate with you. They now have opinions... and voices.</p>

                            <!-- 🦙 OLLAMA CONNECTION STATUS -->
                            <div class="settings-group" id="ollama-status-group">
                                <h4>🦙 Ollama Status</h4>
                                <div class="setting-item" style="display: flex; align-items: center; gap: 10px;">
                                    <span id="ollama-status-indicator" style="
                                        display: inline-block;
                                        width: 12px;
                                        height: 12px;
                                        border-radius: 50%;
                                        background: #888;
                                    "></span>
                                    <span id="ollama-status-text">Checking Ollama...</span>
                                    <button id="ollama-refresh-btn" style="
                                        margin-left: auto;
                                        padding: 5px 10px;
                                        background: #444;
                                        border: 1px solid #666;
                                        border-radius: 4px;
                                        color: #fff;
                                        cursor: pointer;
                                    ">🔄 Refresh</button>
                                </div>
                                <p class="settings-description" id="ollama-status-details">
                                    Run 'ollama serve' in terminal to enable AI-powered NPC dialogue.
                                </p>
                            </div>

                            <div class="settings-group">
                                <h4>🤖 AI Text Model</h4>
                                <div class="setting-item">
                                    <label for="ai-text-model">Text Generation Model</label>
                                    <select id="ai-text-model">
                                        <option value="mistral" selected>Loading Ollama models...</option>
                                    </select>
                                </div>
                                <p class="settings-description">Using Ollama local LLM (localhost:11434). Run 'ollama serve' to enable AI dialogue.</p>

                                <div class="setting-item">
                                    <label for="ai-temperature">Response Creativity</label>
                                    <input type="range" id="ai-temperature" min="0.1" max="1.5" step="0.1" value="0.8">
                                    <span class="setting-value" id="ai-temperature-value">0.8</span>
                                </div>
                                <p class="settings-description">Lower = more predictable, Higher = more creative/chaotic responses.</p>
                            </div>

                            <div class="settings-group">
                                <h4>🎙️ Voice Settings</h4>
                                <div class="setting-item">
                                    <label for="voice-engine">TTS Engine</label>
                                    <select id="voice-engine">
                                        <option value="kokoro" selected>🎙️ Neural AI (Kokoro) - 28 Real Voices</option>
                                        <option value="browser">🔊 Browser TTS (Basic Computer Voice)</option>
                                        <option value="text-only">📝 Text Only (No Voice)</option>
                                    </select>
                                </div>
                                <p class="settings-description" id="voice-engine-description">Neural AI provides realistic British & American voices. Downloads ~160MB on first use.</p>

                                <div id="kokoro-status-container" style="margin-top: 10px;">
                                    <div class="setting-item">
                                        <span id="kokoro-status-text" style="color: #888;">Checking Kokoro TTS...</span>
                                    </div>
                                    <div class="setting-item voice-preview-actions">
                                        <button id="load-kokoro-btn" class="save-load-btn">🎙️ Load Kokoro TTS</button>
                                    </div>
                                    <div id="kokoro-progress" style="display: none; margin-top: 8px;">
                                        <div style="background: #2a2a4a; border-radius: 4px; height: 8px; overflow: hidden;">
                                            <div id="kokoro-progress-bar" style="background: #6b4dff; height: 100%; width: 0%; transition: width 0.3s;"></div>
                                        </div>
                                        <span id="kokoro-progress-text" style="font-size: 12px; color: #888;">Downloading model...</span>
                                    </div>
                                </div>
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
                                <h4>🔄 Fallback Settings</h4>
                                <div class="setting-item">
                                    <label for="allow-text-fallbacks">Text Fallbacks</label>
                                    <select id="allow-text-fallbacks">
                                        <option value="disabled" selected>Disabled (AI Only)</option>
                                        <option value="enabled">Enabled (Use if AI unavailable)</option>
                                    </select>
                                </div>
                                <p class="settings-description">When disabled, NPCs won't respond if Ollama is unavailable. When enabled, uses pre-written responses as backup.</p>
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
                                <h4>🦙 Ollama Status</h4>
                                <div class="api-status-display" id="api-status-display">
                                    <span class="api-status-indicator" id="api-status-indicator">●</span>
                                    <span id="api-status-text">Checking Ollama connection...</span>
                                </div>
                                <p class="settings-description" id="ollama-status-help">
                                    <span id="ollama-help-text">Ollama runs locally at localhost:11434</span>
                                </p>
                                <div class="setting-item voice-preview-actions">
                                    <button id="refresh-models-btn" class="save-load-btn">🔄 Check Ollama</button>
                                    <button id="download-mistral-btn" class="save-load-btn" style="display:none;">📥 Download Mistral</button>
                                </div>
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
                                    <button id="manual-save-btn" class="save-load-btn" onclick="SettingsPanel.handleManualSave();">
                                        💾 Save Game Now
                                    </button>
                                    <button id="quick-save-btn" class="save-load-btn" onclick="SettingsPanel.handleQuickSave();">
                                        ⚡ Quick Save (F5)
                                    </button>
                                </div>
                                <p id="save-status-msg" class="save-status-msg"></p>

                                <h4>⏱️ Auto-Save Interval</h4>
                                <div class="setting-item">
                                    <label for="autosave-interval">Save every:</label>
                                    <select id="autosave-interval" onchange="SettingsPanel.setAutoSaveInterval(this.value)">
                                        <option value="300000">5 minutes</option>
                                        <option value="900000" selected>15 minutes (default)</option>
                                        <option value="1800000">30 minutes</option>
                                        <option value="3600000">1 hour</option>
                                    </select>
                                </div>
                                <p class="settings-description">Real-time interval between automatic saves</p>

                                <h4>📂 Auto-Saves (Rotating - up to 10)</h4>
                                <div id="auto-save-list" class="auto-save-list">
                                    <!-- auto-saves materialize here like ghosts -->
                                    <p class="no-saves">No auto-saves yet...</p>
                                </div>

                                <h4>📁 Manual Saves</h4>
                                <div id="manual-save-list" class="manual-save-list">
                                    <!-- manual saves appear when you actually care -->
                                    <p class="no-saves">No manual saves yet...</p>
                                </div>

                                <h4>🚨 Emergency Recovery</h4>
                                <p class="settings-description">Recover from crashes, corrupted saves, or browser issues</p>
                                <div id="emergency-save-section" class="emergency-section">
                                    <!-- Emergency save info loads here -->
                                    <p class="no-saves">Checking for emergency saves...</p>
                                </div>
                                <div id="corrupted-saves-section" class="corrupted-section">
                                    <!-- Corrupted saves load here -->
                                </div>

                                <h4>💾 Backup & Restore</h4>
                                <p class="settings-description">Export all saves to a file or import from backup</p>
                                <div class="setting-item save-actions">
                                    <button id="export-saves-btn" class="save-load-btn" onclick="SettingsPanel.exportAllSaves();">
                                        📤 Export All Saves
                                    </button>
                                    <button id="import-saves-btn" class="save-load-btn" onclick="document.getElementById('import-file-input').click();">
                                        📥 Import Saves
                                    </button>
                                    <input type="file" id="import-file-input" accept=".json" style="display:none;" onchange="SettingsPanel.importSaves(this);">
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

                        <!-- 🏆 Scores Tab - Hall of Champions Top 100 -->
                        <div class="settings-tab-content" data-tab="leaderboard">
                            <h3>🏆 Hall of Champions</h3>
                            <p class="settings-description">the eternal record of those who dared to trade... and died trying.</p>

                            <div class="settings-group">
                                <div id="settings-leaderboard-full" class="leaderboard-full-list">
                                    <p class="loading-text">summoning the fallen...</p>
                                </div>
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
                        <button class="settings-btn settings-clear-all-btn" onclick="SettingsPanel.clearAllData();" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); margin-left: auto;">🗑️ Clear All Data</button>
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
        // check if styles already exist - prevent duplicate style injection
        if (document.getElementById('settings-panel-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'settings-panel-styles';
        style.textContent = `
            .settings-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 700; /* Z-INDEX STANDARD: System modals (settings) */
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
                background: linear-gradient(135deg, #f44336 0%, #c62828 100%) !important;
            }

            .save-load-btn.danger:hover {
                background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%) !important;
            }

            /* 🖤 Disabled save buttons - can't save when not in game 💀 */
            .save-load-btn:disabled,
            .save-load-btn.disabled {
                background: #555 !important;
                color: #888 !important;
                cursor: not-allowed;
                opacity: 0.6;
                transform: none !important;
            }

            .save-load-btn:disabled:hover,
            .save-load-btn.disabled:hover {
                background: #555 !important;
                transform: none !important;
            }

            /* 🦇 Save status message styles */
            .save-status-msg {
                font-size: 0.85rem;
                padding: 8px 12px;
                border-radius: 6px;
                margin-top: 10px;
                text-align: center;
            }

            .save-status-msg.warning {
                background: rgba(255, 152, 0, 0.2);
                color: #ffb74d;
                border: 1px solid rgba(255, 152, 0, 0.3);
            }

            .save-status-msg.error {
                background: rgba(244, 67, 54, 0.2);
                color: #ef5350;
                border: 1px solid rgba(244, 67, 54, 0.3);
            }

            .save-status-msg:empty {
                display: none;
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

            /* Emergency Recovery Styles */
            .emergency-section, .corrupted-section {
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .emergency-save-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(255, 152, 0, 0.2);
                border: 1px solid rgba(255, 152, 0, 0.5);
                border-radius: 6px;
                margin-bottom: 8px;
            }

            .emergency-save-item .save-slot-name {
                color: #ffb74d;
            }

            .corrupted-save-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(244, 67, 54, 0.2);
                border: 1px solid rgba(244, 67, 54, 0.5);
                border-radius: 6px;
                margin-bottom: 8px;
            }

            .corrupted-save-item .save-slot-name {
                color: #ef5350;
            }

            .save-slot-btn.recover-btn {
                background: #ff9800;
                color: white;
            }

            .save-slot-btn.recover-btn:hover {
                background: #f57c00;
            }

            .no-emergency {
                color: #4CAF50;
                font-style: italic;
                padding: 10px;
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

            /* 🏆 Scores tab styles - Hall of Champions Top 100 💀 */
            .leaderboard-full-list {
                max-height: 500px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px;
            }

            .leaderboard-full-list .empty,
            .leaderboard-full-list .loading-text {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }

            .leaderboard-full-list .leaderboard-entry {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                margin-bottom: 6px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                transition: background 0.2s;
            }

            .leaderboard-full-list .leaderboard-entry:hover {
                background: rgba(0, 0, 0, 0.4);
            }

            .leaderboard-full-list .leaderboard-entry.rank-1 {
                background: rgba(255, 215, 0, 0.2);
                border-left: 3px solid #ffd700;
            }

            .leaderboard-full-list .leaderboard-entry.rank-2 {
                background: rgba(192, 192, 192, 0.15);
                border-left: 3px solid #c0c0c0;
            }

            .leaderboard-full-list .leaderboard-entry.rank-3 {
                background: rgba(205, 127, 50, 0.15);
                border-left: 3px solid #cd7f32;
            }

            .leaderboard-full-list .rank {
                font-size: 1.1rem;
                min-width: 40px;
                text-align: center;
            }

            .leaderboard-full-list .entry-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .leaderboard-full-list .name {
                color: #e0e0e0;
                font-weight: bold;
            }

            .leaderboard-full-list .details {
                color: #888;
                font-size: 0.8rem;
            }

            .leaderboard-full-list .score {
                color: #ffd700;
                font-weight: bold;
                font-size: 0.95rem;
            }

            /* 🦇 Custom scrollbar for the leaderboard */
            .leaderboard-full-list::-webkit-scrollbar {
                width: 8px;
            }

            .leaderboard-full-list::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            .leaderboard-full-list::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.3);
                border-radius: 4px;
            }

            .leaderboard-full-list::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.5);
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

        // clear all data button - the nuclear option
        const clearAllBtn = this.panelElement.querySelector('.settings-clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllData());
        }

        // scores tab - no controls needed, just displays cached leaderboard

        // ai voice tab controls - where npcs get their voices
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
        this.setupVoiceVolumeControl(); // Voice volume with master volume integration

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
        this.setupUIScaleControl(); // UI scale slider with real-time preview

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

        // gameplay settings - tweak the torture experience
        this.setupCheckboxControl('tutorial-on-start', 'gameplay', 'showTutorialOnStart');
    },

    // setup tab scroll buttons - for when you have too many settings (which is always)
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
                        // Also update MusicSystem master volume
                        if (typeof MusicSystem !== 'undefined' && MusicSystem.setMasterVolume) {
                            MusicSystem.setMasterVolume(value);
                        }
                        // Also update NPCVoiceChatSystem master volume
                        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.setMasterVolume) {
                            NPCVoiceChatSystem.setMasterVolume(value);
                        }
                        break;
                    case 'musicVolume':
                        AudioSystem.setMusicVolume(value);
                        // also update musicsystem volume
                        if (typeof MusicSystem !== 'undefined') {
                            MusicSystem.setVolume(value);
                        }
                        break;
                    case 'sfxVolume':
                        AudioSystem.setSfxVolume(value);
                        break;
                }
            }

            // apply music volume to musicsystem even if audiosystem not available
            if (category === 'audio' && settingKey === 'musicVolume' && typeof MusicSystem !== 'undefined') {
                MusicSystem.setVolume(value);
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

    // Apply volumes to all audio systems
    applyAllVolumes(master, music, sfx) {
        if (typeof AudioSystem !== 'undefined') {
            if (AudioSystem.setMasterVolume) AudioSystem.setMasterVolume(master);
            if (AudioSystem.setMusicVolume) AudioSystem.setMusicVolume(music);
            if (AudioSystem.setSfxVolume) AudioSystem.setSfxVolume(sfx);
        }
        if (typeof MusicSystem !== 'undefined' && MusicSystem.setMasterVolume) {
            MusicSystem.setMasterVolume(master);
        }
        if (typeof MusicSystem !== 'undefined' && MusicSystem.setVolume) {
            MusicSystem.setVolume(music);
        }
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.setMasterVolume) {
            NPCVoiceChatSystem.setMasterVolume(master);
        }
    },

    // Setup voice volume control - integrates with master volume
    setupVoiceVolumeControl() {
        const volumeSlider = this.panelElement.querySelector('#voice-volume');
        const volumeValue = this.panelElement.querySelector('#voice-volume-value');
        if (!volumeSlider) return;

        // Load initial value from NPCVoiceChatSystem
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            volumeSlider.value = NPCVoiceChatSystem.settings.voiceVolume ?? 70;
            if (volumeValue) volumeValue.textContent = `${volumeSlider.value}%`;
        }

        // Handle changes
        volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (volumeValue) volumeValue.textContent = `${value}%`;

            // Update NPCVoiceChatSystem
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                NPCVoiceChatSystem.updateSetting('voiceVolume', value);
            }

            // Store in currentSettings for save/load
            if (!this.currentSettings.audio.voiceVolume) {
                this.currentSettings.audio.voiceVolume = value;
            }
            this.currentSettings.audio.voiceVolume = value;
        });
    },

    // Setup UI scale control - resize panels and UI elements
    setupUIScaleControl() {
        const scaleSlider = this.panelElement.querySelector('#ui-scale');
        const scaleValue = this.panelElement.querySelector('#ui-scale-value');
        if (!scaleSlider) return;

        // Load initial value from settings
        const savedScale = this.currentSettings.ui?.uiScale ?? 1.0;
        scaleSlider.value = savedScale;
        if (scaleValue) scaleValue.textContent = `${Math.round(savedScale * 100)}%`;

        // Apply initial scale
        this.applyUIScale(savedScale);

        // Handle changes
        scaleSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (scaleValue) scaleValue.textContent = `${Math.round(value * 100)}%`;

            // Apply scale immediately for preview
            this.applyUIScale(value);

            // Store in currentSettings
            this.currentSettings.ui.uiScale = value;
            this.saveSettings('ui');
        });
    },

    // Apply UI scale to panels and UI elements
    applyUIScale(scale) {
        // Apply CSS custom property for scale
        document.documentElement.style.setProperty('--ui-scale', scale);

        // Apply scale to all panels (except settings panel itself)
        const panels = document.querySelectorAll('.panel:not(.settings-panel)');
        panels.forEach(panel => {
            panel.style.transform = `scale(${scale})`;
            panel.style.transformOrigin = 'top left';
        });

        // Scale the top bar and bottom bar
        const topBar = document.getElementById('top-bar');
        const bottomBar = document.getElementById('bottom-bar');
        if (topBar) {
            topBar.style.transform = `scale(${scale})`;
            topBar.style.transformOrigin = 'top left';
            topBar.style.width = `${100 / scale}%`;
        }
        if (bottomBar) {
            bottomBar.style.transform = `scale(${scale})`;
            bottomBar.style.transformOrigin = 'bottom left';
            bottomBar.style.width = `${100 / scale}%`;
        }

        console.log(`🎨 UI scale set to ${Math.round(scale * 100)}%`);
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
                // Audio settings now controlled via sliders only
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
                // UI scale is handled by SettingsPanel directly (not UIPolishSystem)
                if (settingKey === 'uiScale') {
                    this.applyUIScale(value);
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

    // setup ai voice controls - give npcs their digital souls
    setupAIVoiceControls() {
        // 🦙 OLLAMA STATUS INDICATOR - check if AI is ready
        this.updateOllamaStatus();
        const refreshBtn = this.panelElement.querySelector('#ollama-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateOllamaStatus());
        }

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

        // voice volume slider - use ?? since 0 is valid (muted)
        const volumeSlider = this.panelElement.querySelector('#voice-volume');
        const volumeValue = this.panelElement.querySelector('#voice-volume-value');
        if (volumeSlider) {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                volumeSlider.value = NPCVoiceChatSystem.settings.voiceVolume ?? 70;
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
            // populate voices from browser TTS or NPCVoiceChatSystem
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

        // 🦙 Download Mistral button - triggers game.startMistralDownload()
        const downloadMistralBtn = this.panelElement.querySelector('#download-mistral-btn');
        if (downloadMistralBtn) {
            downloadMistralBtn.addEventListener('click', () => {
                if (typeof game !== 'undefined' && game.startMistralDownload) {
                    game.startMistralDownload();
                } else {
                    alert('Run this command in terminal: ollama pull mistral');
                }
            });
        }

        // 🎙️ Voice Engine selector - switch between Browser TTS and Kokoro
        const voiceEngineSelect = this.panelElement.querySelector('#voice-engine');
        if (voiceEngineSelect) {
            voiceEngineSelect.addEventListener('change', (e) => {
                this.handleVoiceEngineChange(e.target.value);
            });
            // Show/hide Kokoro controls based on initial selection
            this.handleVoiceEngineChange(voiceEngineSelect.value);
        }

        // 🎙️ Load Kokoro TTS button
        const loadKokoroBtn = this.panelElement.querySelector('#load-kokoro-btn');
        if (loadKokoroBtn) {
            loadKokoroBtn.addEventListener('click', () => this.loadKokoroTTS());
        }

        // 🔄 Fallback settings
        const textFallbackSelect = this.panelElement.querySelector('#allow-text-fallbacks');
        if (textFallbackSelect) {
            // Load saved preference
            const savedTextFallback = localStorage.getItem('mtg_text_fallbacks') || 'disabled';
            textFallbackSelect.value = savedTextFallback;

            textFallbackSelect.addEventListener('change', (e) => {
                localStorage.setItem('mtg_text_fallbacks', e.target.value);
                if (typeof NPCVoiceChatSystem !== 'undefined') {
                    NPCVoiceChatSystem.settings.allowTextFallbacks = (e.target.value === 'enabled');
                }
                console.log(`🔄 Text fallbacks: ${e.target.value}`);
            });
        }

        // check initial API status
        this.checkAPIStatus();

        // Check if Kokoro is already loaded
        this.updateKokoroStatus();
    },

    // Handle voice engine selection change
    handleVoiceEngineChange(engine) {
        const kokoroContainer = this.panelElement?.querySelector('#kokoro-status-container');
        const description = this.panelElement?.querySelector('#voice-engine-description');

        // Save preference
        localStorage.setItem('mtg_voice_engine', engine);

        // Update NPCVoiceChatSystem settings
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.settings.voiceEnabled = (engine !== 'text-only');
            NPCVoiceChatSystem.settings.voiceEngine = engine;
        }

        // Update description based on selection
        if (description) {
            switch (engine) {
                case 'kokoro':
                    description.textContent = 'Neural AI provides realistic British & American voices. Downloads ~160MB on first use.';
                    break;
                case 'browser':
                    description.textContent = 'Uses your browser\'s built-in text-to-speech. Robotic but requires no download.';
                    break;
                case 'text-only':
                    description.textContent = 'NPCs will not speak aloud. Text responses only.';
                    break;
            }
        }

        if (!kokoroContainer) return;

        if (engine === 'kokoro') {
            kokoroContainer.style.display = 'block';
            this.updateKokoroStatus();

            // Auto-load Kokoro if not already loaded
            if (typeof KokoroTTS !== 'undefined' && !KokoroTTS._initialized && !KokoroTTS._loading) {
                console.log('🎙️ Auto-loading Kokoro TTS (default engine)...');
                this.loadKokoroTTS();
            }
        } else {
            // browser or text-only - hide Kokoro controls
            kokoroContainer.style.display = 'none';
        }
    },

    // Update Kokoro TTS status display
    updateKokoroStatus() {
        const statusText = this.panelElement?.querySelector('#kokoro-status-text');
        const loadBtn = this.panelElement?.querySelector('#load-kokoro-btn');

        if (!statusText) return;

        if (typeof KokoroTTS !== 'undefined') {
            const isReady = KokoroTTS._initialized || (KokoroTTS.isInitialized && KokoroTTS.isInitialized());
            const isLoading = KokoroTTS._loading || (KokoroTTS.isLoading && KokoroTTS.isLoading());

            if (isReady) {
                statusText.textContent = '✅ Kokoro TTS ready - 28 neural AI voices available';
                statusText.style.color = '#4caf50';
                if (loadBtn) {
                    loadBtn.textContent = '🎙️ Reload Kokoro';
                    loadBtn.disabled = false;
                }
            } else if (isLoading) {
                statusText.textContent = '⏳ Loading Kokoro TTS model...';
                statusText.style.color = '#ff9800';
                if (loadBtn) loadBtn.disabled = true;
            } else {
                statusText.textContent = '⚠️ Kokoro TTS available - click to load (~94MB)';
                statusText.style.color = '#888';
                if (loadBtn) {
                    loadBtn.textContent = '🎙️ Load Kokoro TTS';
                    loadBtn.disabled = false;
                }
            }
        } else {
            statusText.textContent = '❌ Kokoro TTS module not available';
            statusText.style.color = '#f44336';
        }
    },

    // Load Kokoro TTS model
    async loadKokoroTTS() {
        const loadBtn = this.panelElement?.querySelector('#load-kokoro-btn');
        const statusText = this.panelElement?.querySelector('#kokoro-status-text');
        const progressContainer = this.panelElement?.querySelector('#kokoro-progress');
        const progressBar = this.panelElement?.querySelector('#kokoro-progress-bar');
        const progressText = this.panelElement?.querySelector('#kokoro-progress-text');

        if (!loadBtn || typeof KokoroTTS === 'undefined') {
            console.warn('🎙️ KokoroTTS not available');
            return;
        }

        // Disable button and show progress
        loadBtn.disabled = true;
        loadBtn.textContent = '⏳ Loading...';

        if (statusText) {
            statusText.textContent = '⏳ Initializing neural voice AI...';
            statusText.style.color = '#ff9800';
        }

        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        try {
            // Progress callback for real-time updates
            const progressCallback = (message, progress) => {
                const percent = Math.round(progress * 100);
                if (progressBar) progressBar.style.width = `${percent}%`;
                if (progressText) progressText.textContent = message;
                if (statusText) statusText.textContent = `⏳ ${message}`;
            };

            // Actually initialize Kokoro with progress callback
            const success = await KokoroTTS.init(progressCallback);

            if (success) {
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.textContent = 'Neural voices ready!';

                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                    this.updateKokoroStatus();
                }, 1500);
            } else {
                throw new Error('Failed to initialize');
            }

        } catch (error) {
            console.error('🎙️ Failed to load Kokoro TTS:', error);

            if (statusText) {
                statusText.textContent = `❌ Failed: ${error.message}`;
                statusText.style.color = '#f44336';
            }

            if (progressContainer) progressContainer.style.display = 'none';

            loadBtn.disabled = false;
            loadBtn.textContent = '🎙️ Retry Load';
        }
    },

    // test voice preview - hear the digital demons speak
    // uses npcdialoguesystem for unified dialogue generation
    async testVoicePreview() {
        // Prevent spam clicking - disable button while playing
        const testBtn = this.panelElement.querySelector('#test-voice-btn');
        if (testBtn && testBtn.disabled) return; // Already playing
        if (testBtn) testBtn.disabled = true;

        // Get selected NPC personality
        const personality = this.panelElement.querySelector('#test-npc-personality')?.value || 'friendly';
        const voiceVolume = parseFloat(this.panelElement.querySelector('#voice-volume')?.value || 70);
        // Apply master volume (0-1 range) on top of voice volume (0-100 range)
        const masterVolume = parseFloat(this.panelElement.querySelector('#master-volume')?.value || 0.7);
        const effectiveVolume = masterVolume * (voiceVolume / 100);

        this.updateVoicePreviewStatus(`Generating ${this.formatDisplayName(personality)} NPC response...`, 'playing');

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

            // Use browser TTS (Web Speech API) instead of external service
            this.updateVoicePreviewStatus(`Speaking...`, 'playing');

            if (typeof speechSynthesis === 'undefined') {
                throw new Error('Browser TTS not available');
            }

            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.volume = effectiveVolume;
            utterance.rate = 0.9;  // slightly slower for medieval feel
            utterance.pitch = 1.0;

            // Try to get a good voice
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                if (englishVoice) utterance.voice = englishVoice;
            }

            this._previewUtterance = utterance;

            utterance.onend = () => {
                console.log('🎭 TTS playback ended');
                this.updateVoicePreviewStatus('Playback complete!', 'info');
                this._previewUtterance = null;
                const testBtn = this.panelElement.querySelector('#test-voice-btn');
                if (testBtn) testBtn.disabled = false;
            };

            utterance.onerror = (e) => {
                this.updateVoicePreviewStatus(`TTS error: ${e.error}`, 'error');
                this._previewUtterance = null;
                const testBtn = this.panelElement.querySelector('#test-voice-btn');
                if (testBtn) testBtn.disabled = false;
            };

            this.updateVoicePreviewStatus(`[${this.formatDisplayName(personality)}]: "${phrase}"`, 'playing');
            speechSynthesis.speak(utterance);

        } catch (error) {
            // voice preview failed - fallback will handle it
            this.updateVoicePreviewStatus(`Text API failed - using fallback`, 'error');

            // Fallback to old method if NPCDialogueSystem fails
            this.testVoicePreviewFallback(personality, effectiveVolume);
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
            // Use browser TTS for fallback
            if (typeof speechSynthesis === 'undefined') {
                throw new Error('Browser TTS not available');
            }

            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.volume = volume;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                if (englishVoice) utterance.voice = englishVoice;
            }

            utterance.onend = () => {
                this.updateVoicePreviewStatus('Playback complete (fallback)', 'info');
                const testBtn = this.panelElement.querySelector('#test-voice-btn');
                if (testBtn) testBtn.disabled = false;
            };

            utterance.onerror = (e) => {
                this.updateVoicePreviewStatus(`TTS error: ${e.error}`, 'error');
                const testBtn = this.panelElement.querySelector('#test-voice-btn');
                if (testBtn) testBtn.disabled = false;
            };

            this.updateVoicePreviewStatus(`[${this.formatDisplayName(personality)}] (fallback): "${phrase}"`, 'playing');
            speechSynthesis.speak(utterance);
        } catch (e) {
            this.updateVoicePreviewStatus(`Fallback failed: ${e.message}`, 'error');
            const testBtn = this.panelElement.querySelector('#test-voice-btn');
            if (testBtn) testBtn.disabled = false;
        }
    },

    // Stop voice preview
    stopVoicePreview() {
        // Stop browser TTS
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.cancel();
        }
        this._previewUtterance = null;

        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
        }
        this.updateVoicePreviewStatus('Stopped.', 'info');

        // Re-enable test button
        const testBtn = this.panelElement?.querySelector('#test-voice-btn');
        if (testBtn) testBtn.disabled = false;
    },

    // Format snake_case to Title Case for display
    formatDisplayName(id) {
        if (!id) return 'Unknown';
        return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    // update voice preview status
    updateVoicePreviewStatus(message, type) {
        const status = this.panelElement.querySelector('#voice-preview-status');
        if (status) {
            status.textContent = message;
            status.className = `voice-preview-status ${type}`;
        }
    },

    // populate voice dropdown from browser TTS voices
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

        // Browser TTS uses system voices, but we keep the UI voices for display consistency
        // These are just labels now - actual voice comes from browser speechSynthesis
        const voices = ['default'];
        const defaultVoice = 'default';

        // Try to get browser TTS voices
        if (typeof speechSynthesis !== 'undefined') {
            const browserVoices = speechSynthesis.getVoices();
            if (browserVoices.length > 0) {
                voices.length = 0; // clear default
                browserVoices.filter(v => v.lang.startsWith('en')).slice(0, 10).forEach(v => {
                    voices.push(v.name);
                    voiceDescriptions[v.name] = v.lang;
                });
            }
        }

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

    // 🦙 Check Ollama connection status
    async checkAPIStatus() {
        this.updateAPIStatus('checking', 'Checking Ollama connection...');

        const downloadBtn = this.panelElement?.querySelector('#download-mistral-btn');
        const helpText = this.panelElement?.querySelector('#ollama-help-text');

        try {
            // Check if Ollama is running - use OllamaModelManager's discovered baseUrl
            const baseUrl = (typeof OllamaModelManager !== 'undefined' && OllamaModelManager.config?.baseUrl)
                ? OllamaModelManager.config.baseUrl
                : 'http://localhost:11434';
            const response = await fetch(`${baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });

            if (!response.ok) throw new Error('Ollama not responding');

            const data = await response.json();
            const models = data.models || [];
            const hasMistral = models.some(m => m.name?.includes('mistral'));

            if (hasMistral) {
                // 🟢 Connected with Mistral
                this.updateAPIStatus('connected', `🦙 Ollama connected - Mistral ready!`);
                if (downloadBtn) downloadBtn.style.display = 'none';
                if (helpText) helpText.textContent = 'AI-powered NPC dialogue is enabled';
            } else if (models.length > 0) {
                // 🟡 Connected but no Mistral
                this.updateAPIStatus('connected', `🦙 Ollama connected - ${models.length} models (no Mistral)`);
                if (downloadBtn) downloadBtn.style.display = 'inline-block';
                if (helpText) helpText.textContent = 'Click "Download Mistral" to enable AI NPC dialogue';
            } else {
                // 🟡 Connected but empty
                this.updateAPIStatus('disconnected', '🦙 Ollama running but no models installed');
                if (downloadBtn) downloadBtn.style.display = 'inline-block';
                if (helpText) helpText.textContent = 'Click "Download Mistral" to install AI model';
            }
        } catch (error) {
            // 🔴 Not connected
            this.updateAPIStatus('disconnected', '🦙 Ollama not running - using fallback dialogue');
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (helpText) helpText.textContent = 'Run "ollama serve" to enable AI dialogue';
        }
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

    // 🦙 Update Ollama connection status indicator
    async updateOllamaStatus() {
        const indicator = document.getElementById('ollama-status-indicator');
        const statusText = document.getElementById('ollama-status-text');
        const details = document.getElementById('ollama-status-details');

        if (!indicator || !statusText) return;

        // Set checking state
        indicator.style.background = '#888';
        statusText.textContent = 'Checking Ollama...';

        try {
            // Use OllamaModelManager if available
            if (typeof OllamaModelManager !== 'undefined') {
                const status = await OllamaModelManager.getStatus();

                if (status.ollamaRunning && status.hasRequiredModel) {
                    // Green - fully ready
                    indicator.style.background = '#4CAF50';
                    statusText.textContent = '✅ Ollama Ready';
                    if (details) {
                        details.textContent = `Model: ${status.requiredModel} installed. AI-powered NPC dialogue enabled!`;
                    }
                } else if (status.ollamaRunning) {
                    // Yellow - running but no model
                    indicator.style.background = '#FFC107';
                    statusText.textContent = '⚠️ Model Missing';
                    if (details) {
                        details.innerHTML = `Ollama running but ${status.requiredModel} not installed. <button onclick="OllamaModelManager.showModelDownloadPrompt()" style="background:#4CAF50;color:white;border:none;padding:3px 8px;border-radius:3px;cursor:pointer;">Download Now</button>`;
                    }
                } else {
                    // Red - not running
                    indicator.style.background = '#f44336';
                    statusText.textContent = '❌ Ollama Offline';
                    if (details) {
                        details.textContent = "Run 'ollama serve' in terminal, then click Refresh. NPCs use fallback responses.";
                    }
                }
            } else {
                // Fallback - direct check using dynamic baseUrl
                const baseUrl = (typeof OllamaModelManager !== 'undefined' && OllamaModelManager.config?.baseUrl)
                    ? OllamaModelManager.config.baseUrl
                    : 'http://localhost:11434';
                const response = await fetch(`${baseUrl}/api/tags`, {
                    signal: AbortSignal.timeout(2000)
                });
                if (response.ok) {
                    indicator.style.background = '#4CAF50';
                    statusText.textContent = '✅ Ollama Connected';
                } else {
                    throw new Error('Not OK');
                }
            }
        } catch (error) {
            indicator.style.background = '#f44336';
            statusText.textContent = '❌ Ollama Offline';
            if (details) {
                details.textContent = "Run 'ollama serve' in terminal, then click Refresh. NPCs use fallback responses.";
            }
        }
    },

    // fetch models from Ollama and populate dropdown
    async fetchAndPopulateModels(selectElement) {
        if (!selectElement) return;

        const savedModel = (typeof NPCVoiceChatSystem !== 'undefined')
            ? NPCVoiceChatSystem.settings?.textModel || 'mistral'
            : 'mistral';

        try {
            console.log('🦙 Checking Ollama for models...');

            // Try to get models from Ollama using dynamic baseUrl
            const baseUrl = (typeof OllamaModelManager !== 'undefined' && OllamaModelManager.config?.baseUrl)
                ? OllamaModelManager.config.baseUrl
                : 'http://localhost:11434';
            const response = await fetch(`${baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });

            if (!response.ok) throw new Error(`Ollama not responding`);

            const data = await response.json();
            const models = data.models || [];

            if (models.length === 0) {
                throw new Error('No Ollama models found');
            }

            console.log(`🦙 Found ${models.length} Ollama models`);

            // Clear and populate dropdown with Ollama models
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
            // Ollama not available - show message and offer common Ollama models to pull
            console.warn('🦙 Ollama not available - showing pullable models');
            selectElement.innerHTML = '';

            // Show a "not connected" option first
            const notConnected = document.createElement('option');
            notConnected.value = '';
            notConnected.textContent = '⚠️ Ollama not running - start it first';
            notConnected.disabled = true;
            notConnected.selected = true;
            selectElement.appendChild(notConnected);

            // Show commonly available Ollama models that can be pulled
            const ollamaModels = [
                { name: 'mistral:7b-instruct', desc: 'Mistral 7B Instruct (Recommended)' },
                { name: 'mistral:latest', desc: 'Mistral Latest' },
                { name: 'llama3:8b', desc: 'LLaMA 3 8B' },
                { name: 'llama2:7b', desc: 'LLaMA 2 7B' },
                { name: 'phi:latest', desc: 'Microsoft Phi-2 (Lightweight)' },
                { name: 'tinyllama:latest', desc: 'TinyLLaMA (Ultra-light)' },
                { name: 'gemma:2b', desc: 'Google Gemma 2B' }
            ];
            ollamaModels.forEach(m => {
                const option = document.createElement('option');
                option.value = m.name;
                option.textContent = `${m.name} - ${m.desc}`;
                option.disabled = true; // Can't use until Ollama is running
                selectElement.appendChild(option);
            });
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

            // sanitize model data - xss is my enemy
            item.innerHTML = `
                <span class="model-name">${this.escapeHtml(modelName)}</span>
                <span class="model-desc">${this.escapeHtml(modelDesc)}</span>
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

        // scroll the active tab into view - chase that which you seek
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

        // populate leaderboard tab - show the path to eternal glory
        if (tabName === 'leaderboard') {
            this.populateLeaderboardTab();
        }
    },

    // populate leaderboard tab - show the top 100 champions, no config bullshit
    populateLeaderboardTab() {
        const container = document.getElementById('settings-leaderboard-full');
        if (!container) return;

        if (typeof GlobalLeaderboardSystem === 'undefined') {
            container.innerHTML = '<p class="empty">leaderboard system not loaded...</p>';
            return;
        }

        // get cached leaderboard (top 100) - no api call, just use what we have
        const leaderboard = GlobalLeaderboardSystem.leaderboard.slice(0, 100);

        if (leaderboard.length === 0) {
            container.innerHTML = '<p class="empty">no champions have risen yet... be the first to claim eternal glory.</p>';
            return;
        }

        // render the full top 100 list
        container.innerHTML = leaderboard.map((entry, i) => {
            const rank = i + 1;
            const icon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const status = entry.causeOfDeath ? '💀' : '🏃';
            const cause = entry.causeOfDeath ? this.escapeHtml(entry.causeOfDeath) : 'still breathing';

            return `
                <div class="leaderboard-entry ${rankClass}">
                    <span class="rank">${icon}</span>
                    <div class="entry-info">
                        <span class="name">${this.escapeHtml(entry.playerName)}</span>
                        <span class="details">${status} ${cause} • Day ${entry.daysSurvived || '?'}</span>
                    </div>
                    <span class="score">💰 ${entry.score.toLocaleString()}</span>
                </div>
            `;
        }).join('');
    },

    // escape html to prevent xss
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // populate about tab - display who to blame for this mess
    // fix: added error handling and fallback for about section
    populateAboutTab() {
        // use panelelement.queryselector for dynamic panel dom - not document.getelementbyid
        let aboutContent = this.panelElement?.querySelector('#about-content');
        // fallback to document search if panel not available
        if (!aboutContent) {
            aboutContent = document.getElementById('about-content');
        }
        if (!aboutContent) {
            console.warn('🖤 About content container not found');
            return;
        }

        // fix: try gameconfig.getabouthtml with error handling
        if (typeof GameConfig !== 'undefined' && typeof GameConfig.getAboutHTML === 'function') {
            try {
                aboutContent.innerHTML = GameConfig.getAboutHTML();
                return; // Success - exit early
            } catch (err) {
                console.warn('🖤 GameConfig.getAboutHTML failed:', err.message);
                // Fall through to fallback
            }
        }

        // check if gameconfig exists but method is missing
        if (typeof GameConfig !== 'undefined' && typeof GameConfig.getAboutHTML !== 'function') {
            console.warn('🖤 GameConfig exists but getAboutHTML method is missing');
        }

        // fix: show fallback content for any failure case
        // This runs if: GameConfig undefined, getAboutHTML missing, or getAboutHTML threw error
        console.warn('🖤 Using fallback About content');
        aboutContent.innerHTML = `
                <div class="about-section">
                    <div class="about-logo">🏰</div>
                    <h2>Medieval Trading Game</h2>
                    <p class="about-tagline">trade, explore, survive in a medieval world</p>
                    <div class="about-version">Version 0.88</div>
                    <div class="about-studio">
                        <span class="studio-label">Created by</span>
                        <span class="studio-name">Unity AI Lab</span>
                    </div>
                    <div class="about-team">
                        <div class="team-member">
                            <span class="dev-name">Hackall360</span>
                            <span class="dev-name">Sponge</span>
                            <span class="dev-name">GFourteen</span>
                        </div>
                    </div>
                    <div class="about-links">
                        <a href="https://www.unityailab.com" target="_blank" class="about-link-btn">🌐 Website</a>
                        <a href="https://github.com/Unity-Lab-AI/Medieval-Trading-Game" target="_blank" class="about-link-btn">💻 GitHub</a>
                        <a href="mailto:unityailabcontact@gmail.com" class="about-link-btn">📧 Contact</a>
                    </div>
                    <div class="about-copyright">© 2025 Unity AI Lab. All rights reserved.</div>
                </div>
            `;
    },

    // refresh keybindings ui - map your keyboard to your suffering
    refreshKeyBindingsUI() {
        console.log('🖤 refreshKeyBindingsUI called');
        // use panelelement.queryselector for consistency with dynamically created panel
        let listContainer = this.panelElement?.querySelector('#keybindings-list');
        // Fallback to document search if panel not available
        if (!listContainer) {
            listContainer = document.getElementById('keybindings-list');
        }
        if (!listContainer) {
            console.warn('🖤 keybindings-list container not found');
            return;
        }

        // ensure keybindings is initialized
        if (typeof KeyBindings === 'undefined') {
            listContainer.innerHTML = '<p class="no-saves">Keyboard system not available</p>';
            return;
        }

        // Force initialize if not already done
        if (!KeyBindings.current || Object.keys(KeyBindings.current).length === 0) {
            console.log('🖤 KeyBindings not initialized, calling init()');
            KeyBindings.init();
        }

        // get keybindings from gameconfig as fallback source of truth
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

        // setup reset button - return to factory defaults 🖤💀 FIXED: Use modal instead of browser confirm() 💀
        let resetBtn = this.panelElement?.querySelector('#reset-keybindings-btn');
        if (!resetBtn) resetBtn = document.getElementById('reset-keybindings-btn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (typeof ModalSystem !== 'undefined') {
                    ModalSystem.show({
                        title: '⌨️ Reset Keybindings',
                        content: '<p>Reset all keybindings to defaults?</p>',
                        buttons: [
                            { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                            {
                                text: '🔄 Reset',
                                className: 'primary',
                                onClick: () => {
                                    if (typeof KeyBindings !== 'undefined') {
                                        KeyBindings.resetToDefaults();
                                    }
                                    this.refreshKeyBindingsUI();
                                    ModalSystem.hide();
                                }
                            }
                        ]
                    });
                } else {
                    // Fallback
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

        // fixed: use modal instead of browser confirm()
        if (existingAction) {
            const existingDesc = KeyBindings.descriptions[existingAction[0]] || existingAction[0];
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '⚠️ Key Conflict',
                    content: `<p>"<strong>${KeyBindings.formatKey(newKey)}</strong>" is already used for "<strong>${existingDesc}</strong>".</p><p>Do you want to swap the keys?</p>`,
                    buttons: [
                        { text: '❌ Cancel', className: 'secondary', onClick: () => { this.cancelKeyRebind(); ModalSystem.hide(); } },
                        {
                            text: '🔄 Swap Keys',
                            className: 'primary',
                            onClick: () => {
                                // swap the keys - silent but deadly
                                KeyBindings.setKey(existingAction[0], this.rebindContext.originalKey, true);
                                // set the new key - commit to the change
                                KeyBindings.setKey(this.rebindContext.action, newKey, true);
                                // update ui
                                this.rebindContext.button.classList.remove('listening');
                                this.rebindContext.button.textContent = KeyBindings.formatKey(newKey);
                                this.refreshKeyBindingsUI();
                                this.rebindContext = null;
                                ModalSystem.hide();
                            }
                        }
                    ]
                });
                return; // Exit and wait for modal response
            } else {
                // Fallback: just do the swap without asking
                KeyBindings.setKey(existingAction[0], this.rebindContext.originalKey, true);
            }
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
        this.populateEmergencySaveSection();
        this.populateCorruptedSavesSection();
        this.updateSaveButtonStates();
        this.updateStorageInfo();
    },

    // check if we're in a state where saving is allowed
    // FIXED: Allow saving in multiple game states, not just PLAYING
    canSaveNow() {
        if (typeof game === 'undefined' || typeof GameState === 'undefined') return false;
        // allow saving when in-game (any panel open counts as in-game)
        const savableStates = [
            GameState.PLAYING,
            GameState.MARKET,
            GameState.TRAVEL,
            GameState.INVENTORY,
            GameState.TRANSPORTATION,
            GameState.PAUSED
        ];
        return savableStates.includes(game.state);
    },

    // update save button states based on game state
    updateSaveButtonStates() {
        const manualSaveBtn = document.getElementById('manual-save-btn');
        const quickSaveBtn = document.getElementById('quick-save-btn');
        const statusMsg = document.getElementById('save-status-msg');

        const canSave = this.canSaveNow();

        if (manualSaveBtn) {
            manualSaveBtn.disabled = !canSave;
            manualSaveBtn.classList.toggle('disabled', !canSave);
        }
        if (quickSaveBtn) {
            quickSaveBtn.disabled = !canSave;
            quickSaveBtn.classList.toggle('disabled', !canSave);
        }
        if (statusMsg) {
            if (!canSave) {
                statusMsg.textContent = '⚠️ Start or load a game first to enable saving';
                statusMsg.className = 'save-status-msg warning';
            } else {
                statusMsg.textContent = '';
                statusMsg.className = 'save-status-msg';
            }
        }
    },

    // handle manual save button click
    handleManualSave() {
        if (!this.canSaveNow()) {
            const statusMsg = document.getElementById('save-status-msg');
            if (statusMsg) {
                statusMsg.textContent = '❌ Cannot save - no game in progress!';
                statusMsg.className = 'save-status-msg error';
            }
            return;
        }
        if (typeof SaveLoadSystem !== 'undefined') {
            SaveLoadSystem.manualSave();
            // Refresh the save lists after saving
            setTimeout(() => this.refreshSaveLists(), 500);
        }
    },

    // handle quick save button click
    handleQuickSave() {
        if (!this.canSaveNow()) {
            const statusMsg = document.getElementById('save-status-msg');
            if (statusMsg) {
                statusMsg.textContent = '❌ Cannot save - no game in progress!';
                statusMsg.className = 'save-status-msg error';
            }
            return;
        }
        if (typeof SaveLoadSystem !== 'undefined') {
            SaveLoadSystem.quickSave();
            // Refresh the save lists after saving
            setTimeout(() => this.refreshSaveLists(), 500);
        }
    },

    // populate auto-save list - scan localstorage for all auto-saves
    populateAutoSaveList() {
        const listContainer = document.getElementById('auto-save-list');
        if (!listContainer) return;

        // scan localstorage directly for auto-saves (more reliable than metadata)
        const autoSaves = [];
        for (let i = 0; i < 10; i++) {
            const key = `tradingGameAutoSave_${i}`;
            const saveData = localStorage.getItem(key);
            if (saveData) {
                try {
                    // fix: use savemanager's decompression for compressed saves!
                    let parsed;
                    if (typeof SaveManager !== 'undefined' && SaveManager.decompressSaveData) {
                        parsed = SaveManager.decompressSaveData(saveData);
                    } else {
                        // Fallback for uncompressed
                        parsed = JSON.parse(saveData);
                    }
                    if (!parsed) continue; // Decompression failed

                    const gameData = parsed.gameData || parsed;
                    const timeState = gameData.timeState || gameData.time || {};
                    autoSaves.push({
                        index: i,
                        name: `Auto-Save ${i + 1}`,
                        playerName: gameData.player?.name || 'Unknown',
                        gold: gameData.player?.gold || 0,
                        day: timeState.currentTime?.day || timeState.day || 1,
                        location: gameData.currentLocation?.name || gameData.player?.currentLocation || 'Unknown',
                        timestamp: parsed.timestamp || Date.now(),
                        version: parsed.version || '?'
                    });
                } catch (e) {
                    // corrupt save - skip it
                    console.warn(`💀 Auto-save ${i} corrupted:`, e.message);
                }
            }
        }

        // Sort by timestamp (newest first)
        autoSaves.sort((a, b) => b.timestamp - a.timestamp);

        if (autoSaves.length === 0) {
            listContainer.innerHTML = '<p class="no-saves">No auto-saves yet... play the game to create some!</p>';
            return;
        }

        listContainer.innerHTML = autoSaves.map(save => `
            <div class="save-slot-item" data-save-index="${save.index}">
                <div class="save-slot-info">
                    <span class="save-slot-name">💾 ${this.escapeHtml(save.name)}</span>
                    <span class="save-slot-details">
                        ${this.escapeHtml(save.playerName)} | Day ${save.day} | ${save.gold.toLocaleString()}g | ${this.escapeHtml(save.location)}
                    </span>
                    <span class="save-slot-details">${new Date(save.timestamp).toLocaleString()}</span>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn load-btn" onclick="SaveManager.loadAutoSave(${save.index}); SettingsPanel.closePanel();">
                        Load
                    </button>
                    <button class="save-slot-btn delete-btn" onclick="localStorage.removeItem('tradingGameAutoSave_${save.index}'); SettingsPanel.refreshSaveLists();">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    // populate manual save list - scan localstorage for all manual saves
    populateManualSaveList() {
        const listContainer = document.getElementById('manual-save-list');
        if (!listContainer) return;

        // scan localstorage directly for manual saves (more reliable than metadata)
        const manualSaves = [];
        for (let i = 1; i <= 10; i++) {
            const key = `tradingGameSave_${i}`;
            const saveData = localStorage.getItem(key);
            if (saveData) {
                try {
                    // fix: use savemanager's decompression for compressed saves!
                    let parsed;
                    if (typeof SaveManager !== 'undefined' && SaveManager.decompressSaveData) {
                        parsed = SaveManager.decompressSaveData(saveData);
                    } else {
                        // Fallback for uncompressed
                        parsed = JSON.parse(saveData);
                    }
                    if (!parsed) continue; // Decompression failed

                    const gameData = parsed.gameData || parsed;
                    const timeState = gameData.timeState || gameData.time || {};
                    // Also check metadata for the name
                    const metaName = SaveManager?.saveSlots?.[i]?.name;
                    manualSaves.push({
                        slot: i,
                        name: metaName || `Save Slot ${i}`,
                        playerName: gameData.player?.name || 'Unknown',
                        gold: gameData.player?.gold || 0,
                        day: timeState.currentTime?.day || timeState.day || 1,
                        location: gameData.currentLocation?.name || gameData.player?.currentLocation || 'Unknown',
                        timestamp: parsed.timestamp || Date.now(),
                        version: parsed.version || '?'
                    });
                } catch (e) {
                    // corrupt save - skip it
                    console.warn(`💀 Manual save ${i} corrupted:`, e.message);
                }
            }
        }

        // Sort by timestamp (newest first)
        manualSaves.sort((a, b) => b.timestamp - a.timestamp);

        if (manualSaves.length === 0) {
            listContainer.innerHTML = '<p class="no-saves">No manual saves yet... press Save Game to create one!</p>';
            return;
        }

        listContainer.innerHTML = manualSaves.map(save => `
            <div class="save-slot-item" data-save-slot="${save.slot}">
                <div class="save-slot-info">
                    <span class="save-slot-name">📁 ${this.escapeHtml(save.name)}</span>
                    <span class="save-slot-details">
                        ${this.escapeHtml(save.playerName)} | Day ${save.day} | ${save.gold.toLocaleString()}g | ${this.escapeHtml(save.location)}
                    </span>
                    <span class="save-slot-details">${new Date(save.timestamp).toLocaleString()}</span>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn load-btn" onclick="SaveManager.loadFromSlot(${save.slot}); SettingsPanel.closePanel();">
                        Load
                    </button>
                    <button class="save-slot-btn delete-btn" onclick="SaveManager.deleteSave(${save.slot}); SettingsPanel.refreshSaveLists();">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    // populate emergency save section - crash recovery
    populateEmergencySaveSection() {
        const container = document.getElementById('emergency-save-section');
        if (!container) return;

        const emergencyData = localStorage.getItem('tradingGameEmergencySave');
        if (!emergencyData) {
            container.innerHTML = '<p class="no-emergency">✅ No emergency saves - your game is running smoothly!</p>';
            return;
        }

        try {
            const parsed = JSON.parse(emergencyData);
            const gameData = parsed.gameData || parsed;
            const timestamp = parsed.timestamp || Date.now();

            container.innerHTML = `
                <div class="emergency-save-item">
                    <div class="save-slot-info">
                        <span class="save-slot-name">🚨 Emergency Save Found!</span>
                        <span class="save-slot-details">
                            ${this.escapeHtml(gameData.player?.name || 'Unknown')} | Day ${gameData.time?.day || '?'} | ${(gameData.player?.gold || 0).toLocaleString()}g
                        </span>
                        <span class="save-slot-details">Saved: ${new Date(timestamp).toLocaleString()}</span>
                        <span class="save-slot-details" style="color: #ffb74d;">This save was created when your browser closed unexpectedly</span>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn recover-btn" onclick="SettingsPanel.recoverEmergencySave();">
                            🔄 Recover
                        </button>
                        <button class="save-slot-btn delete-btn" onclick="SettingsPanel.deleteEmergencySave();">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        } catch (e) {
            container.innerHTML = `
                <div class="corrupted-save-item">
                    <div class="save-slot-info">
                        <span class="save-slot-name">⚠️ Corrupted Emergency Save</span>
                        <span class="save-slot-details">The emergency save data is corrupted and cannot be recovered</span>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn delete-btn" onclick="SettingsPanel.deleteEmergencySave();">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // populate corrupted saves section - find and display broken saves
    populateCorruptedSavesSection() {
        const container = document.getElementById('corrupted-saves-section');
        if (!container) return;

        const corruptedSaves = [];

        // fix: check saves using proper decompression - compressed saves aren't "corrupted"
        const tryParseSave = (data) => {
            if (!data) return null;
            try {
                // Use SaveManager's decompression if available
                if (typeof SaveManager !== 'undefined' && SaveManager.decompressSaveData) {
                    return SaveManager.decompressSaveData(data);
                }
                // Fallback for uncompressed
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        };

        // Check auto-saves for corruption
        for (let i = 0; i < 10; i++) {
            const key = `tradingGameAutoSave_${i}`;
            const data = localStorage.getItem(key);
            if (data && tryParseSave(data) === null) {
                corruptedSaves.push({ key, type: 'auto', index: i, name: `Auto-Save ${i + 1}` });
            }
        }

        // Check manual saves for corruption
        for (let i = 1; i <= 10; i++) {
            const key = `tradingGameSave_${i}`;
            const data = localStorage.getItem(key);
            if (data && tryParseSave(data) === null) {
                corruptedSaves.push({ key, type: 'manual', slot: i, name: `Save Slot ${i}` });
            }
        }

        if (corruptedSaves.length === 0) {
            container.innerHTML = ''; // Hide section if no corrupted saves
            return;
        }

        container.innerHTML = `
            <p style="color: #ef5350; margin-bottom: 10px;">⚠️ Found ${corruptedSaves.length} corrupted save(s):</p>
            ${corruptedSaves.map(save => `
                <div class="corrupted-save-item">
                    <div class="save-slot-info">
                        <span class="save-slot-name">💀 ${this.escapeHtml(save.name)}</span>
                        <span class="save-slot-details">This save file is corrupted and cannot be loaded</span>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn delete-btn" onclick="localStorage.removeItem('${save.key}'); SettingsPanel.refreshSaveLists();">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    },

    // recover emergency save - load it into the game
    recoverEmergencySave() {
        const emergencyData = localStorage.getItem('tradingGameEmergencySave');
        if (!emergencyData) {
            if (typeof addMessage === 'function') addMessage('No emergency save found!', 'error');
            return;
        }

        try {
            const parsed = JSON.parse(emergencyData);
            if (typeof SaveManager !== 'undefined' && SaveManager.loadGameState) {
                SaveManager.loadGameState(parsed.gameData);
                localStorage.removeItem('tradingGameEmergencySave');
                if (typeof addMessage === 'function') addMessage('🎉 Emergency save recovered successfully!', 'success');
                this.closePanel();
                this.refreshSaveLists();
            }
        } catch (e) {
            console.error('Failed to recover emergency save:', e);
            if (typeof addMessage === 'function') addMessage('Failed to recover emergency save - data corrupted', 'error');
        }
    },

    // delete emergency save
    deleteEmergencySave() {
        localStorage.removeItem('tradingGameEmergencySave');
        this.refreshSaveLists();
        if (typeof addMessage === 'function') addMessage('Emergency save deleted', 'info');
    },

    // export all saves to json file
    exportAllSaves() {
        const exportData = {
            exportVersion: '1.0',
            exportDate: new Date().toISOString(),
            gameVersion: typeof GameConfig !== 'undefined' ? GameConfig.version?.full : 'unknown',
            saves: {
                autoSaves: {},
                manualSaves: {},
                emergencySave: null
            }
        };

        // Collect auto-saves
        for (let i = 0; i < 10; i++) {
            const data = localStorage.getItem(`tradingGameAutoSave_${i}`);
            if (data) {
                exportData.saves.autoSaves[i] = data;
            }
        }

        // Collect manual saves
        for (let i = 1; i <= 10; i++) {
            const data = localStorage.getItem(`tradingGameSave_${i}`);
            if (data) {
                exportData.saves.manualSaves[i] = data;
            }
        }

        // Collect emergency save
        const emergencyData = localStorage.getItem('tradingGameEmergencySave');
        if (emergencyData) {
            exportData.saves.emergencySave = emergencyData;
        }

        // Download as JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MTG_saves_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof addMessage === 'function') addMessage('💾 All saves exported successfully!', 'success');
    },

    // import saves from json file
    importSaves(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                if (!importData.saves) {
                    throw new Error('Invalid save file format');
                }

                let imported = 0;

                // Import auto-saves
                if (importData.saves.autoSaves) {
                    for (const [index, data] of Object.entries(importData.saves.autoSaves)) {
                        localStorage.setItem(`tradingGameAutoSave_${index}`, data);
                        imported++;
                    }
                }

                // Import manual saves
                if (importData.saves.manualSaves) {
                    for (const [slot, data] of Object.entries(importData.saves.manualSaves)) {
                        localStorage.setItem(`tradingGameSave_${slot}`, data);
                        imported++;
                    }
                }

                // Import emergency save
                if (importData.saves.emergencySave) {
                    localStorage.setItem('tradingGameEmergencySave', importData.saves.emergencySave);
                    imported++;
                }

                this.refreshSaveLists();
                if (typeof addMessage === 'function') addMessage(`📥 Imported ${imported} save(s) successfully!`, 'success');

            } catch (err) {
                console.error('Import failed:', err);
                if (typeof addMessage === 'function') addMessage('❌ Failed to import saves - invalid file format', 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input so same file can be selected again
        fileInput.value = '';
    },

    // update storage info display
    updateStorageInfo() {
        const container = document.getElementById('storage-info');
        if (!container) return;

        let totalSize = 0;
        let saveCount = 0;

        // Calculate size of all trading game data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tradingGame')) {
                const value = localStorage.getItem(key);
                totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16 = 2 bytes per char
                if (key.includes('Save')) saveCount++;
            }
        }

        const sizeKB = (totalSize / 1024).toFixed(1);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        const displaySize = totalSize > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

        container.innerHTML = `
            <span>📊 Storage Used: <strong>${displaySize}</strong> (${saveCount} saves)</span>
        `;
    },

    // open settings panel - welcome to configuration hell
    openPanel() {
        // fixed: force full re-init if panel doesn't exist or is broken
        // This fixes the "dead buttons" bug where HTML exists but listeners don't
        if (!this.panelElement || !document.getElementById('settings-panel')) {
            this._initialized = false; // Reset init flag to allow full re-init
            this.init();
        }

        // safety: verify listeners are attached by checking if close button works
        const closeBtn = this.panelElement?.querySelector('.settings-close-btn');
        if (closeBtn && !closeBtn._listenerAttached) {
            console.log('⚙️ Re-attaching settings panel event listeners (were missing)');
            this.setupEventListeners();
            closeBtn._listenerAttached = true; // Mark so we don't re-attach every open
        }

        // ensure keybindings is initialized before showing panel
        if (typeof KeyBindings !== 'undefined' && (!KeyBindings.current || Object.keys(KeyBindings.current).length === 0)) {
            KeyBindings.init();
        }

        this.isOpen = true;
        this.panelElement.style.display = 'block';

        // force high z-index to appear above everything including main-menu
        this.panelElement.style.zIndex = '99999';

        // add entrance animation - fade in like regret
        setTimeout(() => {
            this.panelElement.classList.add('open');
        }, 10);

        // prevent body scroll - trap you in here with us
        document.body.style.overflow = 'hidden';

        // pre-populate keybindings ui in case controls tab is visible or will be clicked
        setTimeout(() => {
            this.refreshKeyBindingsUI();
        }, 50);

        // pre-populate about tab with gameconfig data - the fucking legends need to be shown
        setTimeout(() => {
            this.populateAboutTab();
        }, 50);

        // ⏱️ Load autosave interval from SaveManager
        this.loadAutoSaveIntervalUI();

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
        // just delegate to openpanel() which handles all the init/listener checks now
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

        // fix: only apply settings that use set methods (not toggle)
        // Toggle methods flip the state, which breaks when re-applying unchanged settings
        // Audio and theme settings use SET methods, so those are safe to reapply
        const safeToReapplySettings = {
            audio: ['masterVolume', 'musicVolume', 'sfxVolume', 'ambienceVolume', 'voiceVolume'],
            ui: ['theme', 'fontSize', 'uiScale'],
            environmental: ['quality']
        };

        Object.keys(safeToReapplySettings).forEach(category => {
            if (this.currentSettings[category]) {
                safeToReapplySettings[category].forEach(settingKey => {
                    if (this.currentSettings[category][settingKey] !== undefined) {
                        this.applyImmediateSetting(category, settingKey, this.currentSettings[category][settingKey]);
                    }
                });
            }
        });

        // show notification - pat yourself on the back
        if (typeof UIPolishSystem !== 'undefined') {
            UIPolishSystem.showNotification('Settings applied successfully!', 'success');
        }

        this.closePanel();
    },

    // return to main menu - escape to the beginning 🖤💀 FIXED: Use modal instead of browser confirm() 💀
    returnToMainMenu() {
        const doReturn = () => {
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
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🏠 Return to Main Menu',
                content: '<p>Return to main menu?</p><p style="color: #f44336; font-size: 12px;">Unsaved progress will be lost.</p>',
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🏠 Return', className: 'danger', onClick: () => { ModalSystem.hide(); doReturn(); } }
                ]
            });
        } else {
            doReturn();
        }
    },

    // reset to defaults - undo all your questionable choices 🖤💀 FIXED: Use modal instead of browser confirm() 💀
    resetToDefaults() {
        const doReset = () => {
            // reset all settings - back to square one
            try {
                this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
            } catch (error) {
                // clone failed - shouldn't happen, but handle it
                this.currentSettings = { ...this.defaultSettings };
            }

            // update ui controls - show the defaults in all their glory
            this.updateControlsFromSettings();

            // apply settings - enforce the reset
            this.applySettings();
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🔄 Reset Settings',
                content: '<p>Are you sure you want to reset all settings to their default values?</p>',
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🔄 Reset', className: 'primary', onClick: () => { ModalSystem.hide(); doReset(); } }
                ]
            });
        } else {
            doReset();
        }
    },

    // clear all data - burn it ALL down, squeaky clean, nothing remains 🖤💀 FIXED: Use modal instead of browser confirm() 💀
    clearAllData() {
        const doClear = () => {
            console.log('🗑️ NUCLEAR OPTION: Clearing ALL application data...');
            this._performDataClear();
        };

        const showFinalWarning = () => {
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '🗑️ FINAL WARNING',
                    content: `
                        <p style="color: #f44336; font-weight: bold;">You are about to permanently delete ALL local game data.</p>
                        <p>Your computer will be squeaky clean - nothing remains.</p>
                        <p style="color: #4caf50;">🏆 The global Hall of Champions server data will remain intact.</p>
                    `,
                    buttons: [
                        { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                        { text: '🗑️ DELETE EVERYTHING', className: 'danger', onClick: () => { ModalSystem.hide(); doClear(); } }
                    ]
                });
            } else {
                doClear();
            }
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '⚠️ Delete All Data',
                content: `
                    <p style="color: #f44336; font-weight: bold;">WARNING: This will DELETE ALL your local data including:</p>
                    <ul style="font-size: 12px; margin: 10px 0;">
                        <li>All saved games (manual & auto)</li>
                        <li>All settings & preferences</li>
                        <li>Panel positions & layout</li>
                        <li>Achievement progress</li>
                        <li>High scores & statistics</li>
                        <li>ALL cookies and cached data</li>
                    </ul>
                    <p style="color: #4caf50;">🏆 Note: The global Hall of Champions on the server will NOT be affected.</p>
                    <p style="color: #f44336; font-weight: bold;">This cannot be undone!</p>
                `,
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '⚠️ Continue', className: 'danger', onClick: () => { ModalSystem.hide(); showFinalWarning(); } }
                ]
            });
        } else {
            doClear();
        }
    },

    // extracted clear logic for modal callback
    _performDataClear() {
        try {
            // ═══════════════════════════════════════════════════════════
            // step 1: clear all localstorage - everything goes
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
            // step 2: clear all sessionstorage
            // ═══════════════════════════════════════════════════════════
            sessionStorage.clear();
            console.log('✓ SessionStorage cleared');

            // ═══════════════════════════════════════════════════════════
            // step 3: clear all indexeddb databases
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
            // step 4: clear all cookies for this domain
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
            // step 5: clear cache storage (service worker caches)
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
            // step 6: unregister service workers
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
            // step 7: clear in-memory caches in our systems
            // ═══════════════════════════════════════════════════════════
            if (typeof GlobalLeaderboardSystem !== 'undefined') {
                GlobalLeaderboardSystem.leaderboard = [];
                GlobalLeaderboardSystem.lastFetch = null;
                console.log('✓ Leaderboard memory cache cleared');
            }

            console.log('🧹 ALL DATA OBLITERATED - SQUEAKY CLEAN!');

            // show success message - it's done 🖤💀 FIXED: Use modal instead of browser alert() 💀
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '✅ Data Cleared',
                    content: `
                        <p style="color: #4caf50; font-weight: bold;">ALL DATA HAS BEEN COMPLETELY CLEARED!</p>
                        <p>🧹 Your system is squeaky clean:</p>
                        <ul style="font-size: 12px;">
                            <li>All saves deleted</li>
                            <li>All settings reset</li>
                            <li>All cache cleared</li>
                            <li>All cookies removed</li>
                        </ul>
                        <p style="color: #4caf50;">🏆 Your scores on the global Hall of Champions server remain safe.</p>
                        <p>The page will now reload.</p>
                    `,
                    buttons: [
                        { text: '🔄 Reload', className: 'primary', onClick: () => { ModalSystem.hide(); window.location.reload(true); } }
                    ]
                });
            } else {
                // Fallback: just reload
                window.location.reload(true);
            }

        } catch (error) {
            // clear failed - show error - fixed: use modal instead of browser alert()
            if (typeof ModalSystem !== 'undefined') {
                ModalSystem.show({
                    title: '❌ Error',
                    content: `
                        <p>Error clearing some data. Please try clearing your browser data manually.</p>
                        <p style="color: #f44336; font-size: 12px;">Error: ${error.message}</p>
                    `,
                    buttons: [
                        { text: 'OK', className: 'secondary', onClick: () => ModalSystem.hide() }
                    ]
                });
            } else {
                console.error('Error clearing data:', error);
            }
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
                'sfxVolume': 'sfx-volume'
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
            },
            'gameplay': {
                'showTutorialOnStart': 'tutorial-on-start'
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
            // clone failed - return empty object
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

    // clear all auto-saves to free up space - fixed: use modal instead of browser confirm()
    clearAutoSaves() {
        const doClear = () => {
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
        };

        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🗑️ Clear Auto-Saves',
                content: '<p>This will delete <strong>ALL auto-saves</strong>.</p><p>Your manual saves will be kept.</p><p>Continue?</p>',
                buttons: [
                    { text: '❌ Cancel', className: 'secondary', onClick: () => ModalSystem.hide() },
                    { text: '🗑️ Clear', className: 'danger', onClick: () => { ModalSystem.hide(); doClear(); } }
                ]
            });
        } else {
            doClear();
        }
    },

    // load autosave interval into dropdown
    loadAutoSaveIntervalUI() {
        const dropdown = document.getElementById('autosave-interval');
        if (dropdown && typeof SaveManager !== 'undefined') {
            dropdown.value = SaveManager.autoSaveInterval.toString();
        }
    },

    // set autosave interval
    setAutoSaveInterval(intervalMs) {
        const interval = parseInt(intervalMs, 10);
        if (typeof SaveManager !== 'undefined') {
            if (SaveManager.setAutoSaveInterval(interval)) {
                addMessage(`⏱️ Auto-save interval set to ${interval / 60000} minutes`, 'success');
            }
        }
    },

    // clear cache data (price history, events, etc)
    clearCacheData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('PriceHistory') ||
                key.includes('MarketSaturation') ||
                key.includes('CityEvents') ||
                key.includes('CityReputation') ||
                key.includes('debooger') ||
                key.includes('temp')
            )) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.updateStorageInfo();
        addMessage(`🧹 Cleared ${keysToRemove.length} cache entries!`, 'success');
    },

    // update storage info display
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

// update storage info when settings panel opens
const originalShow = SettingsPanel.show;
SettingsPanel.show = function() {
    originalShow.call(this);
    setTimeout(() => this.updateStorageInfo(), 100);
};

// register with Bootstrap - early priority for main menu access
Bootstrap.register('SettingsPanel', () => SettingsPanel.init(), {
    dependencies: ['game'],
    priority: 88,
    severity: 'optional'
});

// export for use in other modules - share the suffering
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsPanel;
}