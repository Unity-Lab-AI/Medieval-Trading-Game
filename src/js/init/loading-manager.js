// ═══════════════════════════════════════════════════════════════
// LOADING MANAGER - shows real system names as they load
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const LoadingManager = {
    // Loading tips - helpful hints while you wait
    LOADING_TIPS: [
        "Buy low, sell high. It's not rocket science... but it is economics.",
        "Hunger and thirst decay over time. Don't forget to eat and drink!",
        "Press SPACE to pause time when you need to think.",
        "Talk to NPCs - they might have quests, items, or just sass.",
        "Different cities have different prices. Arbitrage is your friend.",
        "Check the weather - it affects travel time and your mood.",
        "Doom World has 2x stat drain. Pack extra food.",
        "Reputation matters. NPCs remember how you treat them.",
        "Properties generate passive income while you adventure.",
        "The debooger console (if enabled) lets you test features.",
        "Save often. The void claims the unprepared.",
        "Gatehouses control access to new zones. Bring gold.",
        "Companions can join you in combat. Find them in taverns.",
        "Market prices fluctuate with events and time of day.",
        "Your carrying capacity depends on your transport.",
        "Press I for inventory, M for market, T for travel.",
        "Seasonal changes affect prices and NPC behavior.",
        "Night time is dangerous. Some NPCs only appear after dark.",
        "Trade routes can automate your merchant empire.",
        "Achievements unlock bragging rights and nothing else.",
    ],
    _currentTipIndex: 0,
    _tipTimer: null,

    // Final system check - multiple indicators that game is ready
    finalCheck: () => {
        // Audio preloads in background - don't block game start for music
        // Players can start playing immediately, audio fades in when ready

        // Primary: window.startNewGame is set at end of game.js
        if (typeof window.startNewGame === 'function') {
            return true;
        }
        // Secondary: Bootstrap.initialized is set after all systems init
        if (typeof Bootstrap !== 'undefined' && Bootstrap.initialized === true) {
            return true;
        }
        // Tertiary: game object + GameWorld both exist
        if (typeof game !== 'undefined' && typeof GameWorld !== 'undefined') {
            return true;
        }
        return false;
    },

    // Real systems to check - maps display name to window object name
    SYSTEMS_TO_CHECK: [
        { display: 'Game Configuration', check: 'GameConfig' },
        { display: 'Event Bus', check: 'EventBus' },
        { display: 'Event Manager', check: 'EventManager' },
        { display: 'Timer Manager', check: 'TimerManager' },
        { display: 'Item Database', check: 'ItemDatabase' },
        { display: 'Game World', check: 'GameWorld' },
        { display: 'Combat System', check: 'CombatSystem' },
        { display: 'Trading System', check: 'TradingSystem' },
        { display: 'Dynamic Market', check: 'DynamicMarketSystem' },
        { display: 'NPC Manager', check: 'NPCManager' },
        { display: 'NPC Dialogue', check: 'NPCDialogueSystem' },
        { display: 'Quest System', check: 'QuestSystem' },
        { display: 'Achievement System', check: 'AchievementSystem' },
        { display: 'Travel System', check: 'TravelSystem' },
        { display: 'Mount System', check: 'MountSystem' },
        { display: 'Ship System', check: 'ShipSystem' },
        { display: 'Property System', check: 'PropertySystem' },
        { display: 'Crafting System', check: 'CraftingSystem' },
        { display: 'Skill System', check: 'SkillSystem' },
        { display: 'Inventory Panel', check: 'InventoryPanel' },
        { display: 'Equipment Panel', check: 'EquipmentPanel' },
        { display: 'Panel Manager', check: 'PanelManager' },
        { display: 'World Renderer', check: 'GameWorldRenderer' },
        { display: 'Weather System', check: 'WeatherSystem' },
        { display: 'Day/Night Cycle', check: 'DayNightCycle' },
        { display: 'Audio System', check: 'MusicSystem' },
        { display: 'Save System', check: 'SaveLoadSystem' },
        { display: 'Game Engine', check: 'game' },
        { display: 'Ollama AI Model', check: 'OllamaModelManager', async: true },
        { display: 'Kokoro TTS', check: 'KokoroTTS', async: true },
    ],

    // State
    progress: 0,
    targetProgress: 0,
    isComplete: false,
    isReady: false,
    _displayDone: false,
    animationFrame: null,
    startTime: 0,
    maxWaitTime: 20000,
    _currentSystem: 0,
    _displayTimer: null,

    // Ollama state
    ollamaStatus: 'pending', // 'pending', 'checking', 'downloading', 'ready', 'skipped'
    ollamaProgress: 0,
    ollamaDownloadNeeded: false,

    // Kokoro TTS state
    kokoroStatus: 'pending', // 'pending', 'loading', 'ready', 'skipped'
    kokoroProgress: 0,

    // Start the loading display
    init() {
        console.log('🖤 LoadingManager: Starting system checks...');
        this.startTime = Date.now();
        this.progress = 0;
        this.targetProgress = 0;
        this._currentSystem = 0;
        this._displayDone = false;

        // Show first system immediately
        this.showSystem(0);

        // Show first tip and start rotation
        this._currentTipIndex = Math.floor(Math.random() * this.LOADING_TIPS.length);
        this.showTip();
        this._tipTimer = setInterval(() => this.showTip(), 3000);

        // Start smooth animation loop
        this.animate();

        // Move to next system every 100ms
        this._displayTimer = setInterval(() => {
            this._currentSystem++;
            if (this._currentSystem >= this.SYSTEMS_TO_CHECK.length) {
                this._displayDone = true;
                clearInterval(this._displayTimer);
            } else {
                this.showSystem(this._currentSystem);
            }
        }, 100);

        // Check for final game readiness
        this.checkInterval = setInterval(() => this.checkReady(), 100);
    },

    // Show a loading tip
    showTip() {
        const tipEl = document.getElementById('loading-tip');
        if (tipEl) {
            tipEl.style.opacity = '0';
            setTimeout(() => {
                tipEl.textContent = '💡 ' + this.LOADING_TIPS[this._currentTipIndex];
                tipEl.style.opacity = '1';
                this._currentTipIndex = (this._currentTipIndex + 1) % this.LOADING_TIPS.length;
            }, 200);
        }
    },

    // Show a specific system's loading status
    showSystem(index) {
        const total = this.SYSTEMS_TO_CHECK.length;
        const sys = this.SYSTEMS_TO_CHECK[index];

        // Special handling for Ollama AI - async check and download
        if (sys.check === 'OllamaModelManager') {
            this.handleOllamaLoading(index, total);
            return;
        }

        // Special handling for Kokoro TTS - async loading (local/server only)
        if (sys.check === 'KokoroTTS') {
            this.handleKokoroLoading(index, total);
            return;
        }

        const isLoaded = typeof window[sys.check] !== 'undefined';

        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');

        // Update title with system name and status
        if (titleEl) {
            titleEl.textContent = isLoaded ? (sys.display + ' ✓') : ('Loading ' + sys.display + '...');
        }

        // Update counter
        if (statusEl) {
            statusEl.textContent = (index + 1) + ' of ' + total + ' systems';
        }

        // Update progress
        this.targetProgress = ((index + 1) / total) * 95;
    },

    // Check if Ollama can work in current environment
    // Returns true for: local, file://, custom GPU servers, self-hosted
    // Returns false for: static hosting like GitHub Pages (no backend)
    canUseOllama() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // STATIC HOSTING - No backend possible, Ollama cannot work
        // These are pure static file hosts with no server-side capability
        const isStaticHost =
            hostname.includes('github.io') ||      // GitHub Pages
            hostname.includes('pages.dev') ||      // Cloudflare Pages
            hostname.includes('netlify.app') ||    // Netlify (static)
            hostname.includes('vercel.app') ||     // Vercel (static)
            hostname.includes('surge.sh') ||       // Surge.sh
            hostname.includes('gitlab.io');        // GitLab Pages

        if (isStaticHost) {
            console.log('🦙 Static hosting detected - Ollama not available');
            return false;
        }

        // LOCAL DEVELOPMENT - Always allow
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isFileProtocol = protocol === 'file:';

        if (isLocalhost || isFileProtocol) {
            console.log('🦙 Local environment - Ollama available');
            return true;
        }

        // CUSTOM SERVER / GPU SERVER - Allow Ollama
        // If you're self-hosting on a GPU server, Ollama should work
        // The server needs to run Ollama and expose port 11434
        // Check if GameConfig has custom Ollama endpoint configured
        if (typeof GameConfig !== 'undefined' && GameConfig.api?.ollama?.enabled !== false) {
            console.log('🦙 Custom server - Ollama available (will check connection)');
            return true;
        }

        // Private/Local network IPs - Allow Ollama
        const isPrivateIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
        if (isPrivateIP) {
            console.log('🦙 Private network - Ollama available');
            return true;
        }

        // Default: Allow Ollama check (will fail gracefully if not available)
        // This allows GPU servers and custom deployments to work
        console.log('🦙 Unknown environment - will attempt Ollama connection');
        return true;
    },

    // Handle Ollama AI model checking and downloading
    async handleOllamaLoading(index, total) {
        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');

        // Check if running on static hosting (GitHub Pages, etc.) - Ollama won't work
        if (!this.canUseOllama()) {
            console.log('🦙 LoadingManager: Static hosting detected - Ollama not available');
            this.ollamaStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🦙 Ollama AI ✗ (static host)';
            if (statusEl) statusEl.textContent = 'Run locally for AI dialogue';
            this.targetProgress = ((index + 1) / total) * 95;
            return;
        }

        // Check if OllamaModelManager exists
        if (typeof OllamaModelManager === 'undefined') {
            if (titleEl) titleEl.textContent = 'Ollama AI Model ✗ (not found)';
            if (statusEl) statusEl.textContent = (index + 1) + ' of ' + total + ' systems';
            this.ollamaStatus = 'skipped';
            this.targetProgress = ((index + 1) / total) * 95;
            return;
        }

        // Check if user previously skipped Ollama
        const skipped = localStorage.getItem('mtg_ollama_skipped');
        if (skipped === 'true') {
            this.ollamaStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🦙 Ollama AI ✗ (skipped)';
            if (statusEl) statusEl.textContent = 'NPCs will use fallback dialogue';
            this.targetProgress = ((index + 1) / total) * 95;
            console.log('🦙 LoadingManager: Ollama previously skipped by user');
            return;
        }

        // Start checking Ollama
        this.ollamaStatus = 'checking';
        if (titleEl) titleEl.textContent = '🦙 Checking Ollama AI...';
        if (statusEl) statusEl.textContent = 'Connecting to local Ollama server';

        try {
            // Check if Ollama is running
            const isRunning = await OllamaModelManager.checkOllamaRunning();

            if (!isRunning) {
                // Ollama not running - show install prompt via OllamaInstaller
                console.log('🦙 LoadingManager: Ollama not running, showing install prompt');

                if (typeof OllamaInstaller !== 'undefined') {
                    // Pause loading and show installer UI
                    this.ollamaStatus = 'installing';
                    if (titleEl) titleEl.textContent = '🦙 Ollama Not Found';
                    if (statusEl) statusEl.textContent = 'Setup required for AI dialogue';

                    // Show the install prompt - this pauses loading
                    OllamaInstaller.showInstallPrompt();

                    // Don't advance progress - wait for user action
                    // OllamaInstaller.checkAndContinue() will resume loading
                    return;
                }

                // No installer available - skip
                this.ollamaStatus = 'skipped';
                if (titleEl) titleEl.textContent = '🦙 Ollama AI ✗ (not running)';
                if (statusEl) statusEl.textContent = 'NPCs will use fallback dialogue';
                this.targetProgress = ((index + 1) / total) * 95;
                return;
            }

            // Ollama is running - check for ANY installed model
            if (titleEl) titleEl.textContent = '🦙 Checking AI Model...';
            if (statusEl) statusEl.textContent = 'Looking for installed models';

            // Pass '*' to accept ANY installed model, not just Mistral
            const hasModel = await OllamaModelManager.checkModelExists('*');

            if (hasModel) {
                // Model already installed - use whatever is available
                const modelName = OllamaModelManager.selectedModel || 'Ollama';
                this.ollamaStatus = 'ready';
                if (titleEl) titleEl.textContent = '🦙 Ollama AI Model ✓';
                if (statusEl) statusEl.textContent = modelName + ' ready for NPC dialogue';
                this.targetProgress = ((index + 1) / total) * 95;
                console.log('🦙 LoadingManager: Ollama model ready! Using:', modelName);
                OllamaModelManager.isOllamaRunning = true;
                OllamaModelManager.hasRequiredModel = true;
                return;
            }

            // Model not found - start download
            this.ollamaStatus = 'downloading';
            this.ollamaDownloadNeeded = true;
            if (titleEl) titleEl.textContent = '🦙 Downloading AI Model...';
            if (statusEl) statusEl.textContent = 'Pulling ' + OllamaModelManager.config.modelVariant + ' (0%)';

            console.log('🦙 LoadingManager: Starting model download...');

            // Start the download with progress tracking
            await this.downloadOllamaModel(index, total);

        } catch (error) {
            console.warn('🦙 LoadingManager: Ollama check failed:', error.message);
            this.ollamaStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🦙 Ollama AI ✗ (error)';
            if (statusEl) statusEl.textContent = 'NPCs will use fallback dialogue';
            this.targetProgress = ((index + 1) / total) * 95;
        }
    },

    // Download Ollama model with progress tracking
    async downloadOllamaModel(index, total) {
        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');
        const model = OllamaModelManager.config.modelVariant;

        try {
            const response = await fetch(`${OllamaModelManager.config.baseUrl}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: model, stream: true })
            });

            if (!response.ok) {
                throw new Error(`Pull failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);

                        if (json.total && json.completed) {
                            const progress = Math.round((json.completed / json.total) * 100);
                            this.ollamaProgress = progress;

                            // Update display
                            if (titleEl) titleEl.textContent = `🦙 Downloading AI Model... ${progress}%`;
                            if (statusEl) {
                                const downloaded = (json.completed / (1024 * 1024 * 1024)).toFixed(2);
                                const totalSize = (json.total / (1024 * 1024 * 1024)).toFixed(2);
                                statusEl.textContent = `${downloaded}GB / ${totalSize}GB`;
                            }

                            // Update overall progress (weighted for download phase)
                            const baseProgress = (index / total) * 95;
                            const downloadProgress = (progress / 100) * (95 / total);
                            this.targetProgress = baseProgress + downloadProgress;
                        }

                        if (json.status) {
                            if (statusEl && !json.total) {
                                statusEl.textContent = json.status;
                            }
                        }

                    } catch (e) {
                        // Ignore JSON parse errors
                    }
                }
            }

            // Download complete
            this.ollamaStatus = 'ready';
            this.ollamaProgress = 100;
            if (titleEl) titleEl.textContent = '🦙 Ollama AI Model ✓';
            if (statusEl) statusEl.textContent = 'Mistral downloaded and ready!';
            this.targetProgress = ((index + 1) / total) * 95;

            OllamaModelManager.isOllamaRunning = true;
            OllamaModelManager.hasRequiredModel = true;

            console.log('🦙 LoadingManager: Model download complete!');

        } catch (error) {
            console.error('🦙 LoadingManager: Model download failed:', error.message);
            this.ollamaStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🦙 Ollama AI ✗ (download failed)';
            if (statusEl) statusEl.textContent = 'NPCs will use fallback dialogue';
            this.targetProgress = ((index + 1) / total) * 95;
        }
    },

    // 🎙️ Handle Kokoro TTS loading (local/server only - not static hosting)
    async handleKokoroLoading(index, total) {
        const titleEl = document.getElementById('loading-title');
        const statusEl = document.getElementById('loading-status');

        // Check if KokoroTTS module exists
        if (typeof KokoroTTS === 'undefined') {
            console.log('🎙️ LoadingManager: KokoroTTS not found');
            this.kokoroStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (not found)';
            if (statusEl) statusEl.textContent = 'NPCs will use browser TTS';
            this.targetProgress = ((index + 1) / total) * 95;
            return;
        }

        // Check if user previously skipped Kokoro
        const skipped = localStorage.getItem('mtg_kokoro_skipped');
        if (skipped === 'true') {
            this.kokoroStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (skipped)';
            if (statusEl) statusEl.textContent = 'NPCs will use browser TTS';
            this.targetProgress = ((index + 1) / total) * 95;
            console.log('🎙️ LoadingManager: Kokoro previously skipped by user');
            return;
        }

        // Check if user has voice disabled
        const savedEngine = localStorage.getItem('mtg_voice_engine');
        if (savedEngine === 'text-only') {
            console.log('🎙️ LoadingManager: Voice disabled by user');
            this.kokoroStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (disabled)';
            if (statusEl) statusEl.textContent = 'Text-only mode enabled';
            this.targetProgress = ((index + 1) / total) * 95;
            return;
        }

        // Check if running from file:// protocol (needs local server)
        if (!KokoroTTS.isLocalServer()) {
            console.log('🎙️ LoadingManager: Running from file:// - showing server requirement');

            if (typeof KokoroInstaller !== 'undefined') {
                // Pause loading and show installer UI
                this.kokoroStatus = 'installing';
                if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS Setup Required';
                if (statusEl) statusEl.textContent = 'Local server needed for AI voices';

                // Show the setup prompt - this pauses loading
                KokoroInstaller.showSetupPrompt('needs_server');

                // Don't advance progress - wait for user action
                return;
            }

            // No installer available - skip
            this.kokoroStatus = 'skipped';
            if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (needs server)';
            if (statusEl) statusEl.textContent = 'Use START_GAME.bat for AI voices';
            this.targetProgress = ((index + 1) / total) * 95;
            return;
        }

        // Check if Web Worker can be created (verifies server is working properly)
        this.kokoroStatus = 'checking';
        if (titleEl) titleEl.textContent = '🎙️ Checking TTS Server...';
        if (statusEl) statusEl.textContent = 'Verifying Web Worker support';

        if (typeof KokoroInstaller !== 'undefined') {
            const serverCheck = await KokoroInstaller.checkServerRunning();
            if (!serverCheck.running) {
                console.log('🎙️ LoadingManager: Server check failed:', serverCheck);
                this.kokoroStatus = 'installing';
                if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS Server Issue';
                if (statusEl) statusEl.textContent = 'Web Worker failed - check server';

                // Show the setup prompt
                KokoroInstaller.showSetupPrompt('needs_server');
                return;
            }
            console.log('🎙️ LoadingManager: Server check passed!');
        }

        // Check if model is already cached
        if (titleEl) titleEl.textContent = '🎙️ Checking Kokoro TTS...';
        if (statusEl) statusEl.textContent = 'Looking for cached model';

        const isCached = await KokoroTTS.checkModelCached();

        if (isCached) {
            // Model already downloaded - just load it
            this.kokoroStatus = 'loading';
            if (titleEl) titleEl.textContent = '🎙️ Loading Kokoro TTS...';
            if (statusEl) statusEl.textContent = 'Model cached, loading...';
            console.log('🎙️ LoadingManager: Kokoro model cached, loading...');

            try {
                const progressCallback = (message, progress) => {
                    this.kokoroProgress = Math.round(progress * 100);
                    if (titleEl) titleEl.textContent = `🎙️ ${message}`;
                    if (statusEl) statusEl.textContent = `${Math.round(progress * 100)}% complete`;
                };

                const success = await KokoroTTS.init(progressCallback);

                if (success) {
                    this.kokoroStatus = 'ready';
                    this.kokoroProgress = 100;
                    if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✓';
                    if (statusEl) statusEl.textContent = '28 neural AI voices ready!';
                    console.log('🎙️ LoadingManager: Kokoro TTS ready!');
                }
            } catch (error) {
                console.warn('🎙️ LoadingManager: Kokoro TTS load failed:', error.message);
                this.kokoroStatus = 'skipped';
                if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (failed)';
                if (statusEl) statusEl.textContent = 'NPCs will use browser TTS';
            }

            this.targetProgress = ((index + 1) / total) * 95;
        } else {
            // Model not cached - show download prompt (like Ollama does)
            console.log('🎙️ LoadingManager: Kokoro model not cached, showing download prompt');

            if (typeof KokoroInstaller !== 'undefined') {
                this.kokoroStatus = 'installing';
                if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS Download Required';
                if (statusEl) statusEl.textContent = 'AI voice model needs to be downloaded';

                // Show download prompt - pauses loading
                KokoroInstaller.showSetupPrompt('needs_download');

                // Don't advance progress - wait for user action
                return;
            }

            // No installer - auto-download (old behavior)
            this.kokoroStatus = 'downloading';
            if (titleEl) titleEl.textContent = '🎙️ Downloading Kokoro TTS...';
            if (statusEl) statusEl.textContent = 'Downloading ~94MB neural voice model';

            try {
                const progressCallback = (message, progress) => {
                    this.kokoroProgress = Math.round(progress * 100);
                    if (titleEl) titleEl.textContent = `🎙️ ${message}`;
                    if (statusEl) statusEl.textContent = `${Math.round(progress * 100)}% complete`;

                    const baseProgress = (index / total) * 95;
                    const kokoroContribution = (progress * (95 / total));
                    this.targetProgress = baseProgress + kokoroContribution;
                };

                const success = await KokoroTTS.init(progressCallback);

                if (success) {
                    this.kokoroStatus = 'ready';
                    this.kokoroProgress = 100;
                    if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✓';
                    if (statusEl) statusEl.textContent = '28 neural AI voices ready!';
                    console.log('🎙️ LoadingManager: Kokoro TTS ready!');
                }
            } catch (error) {
                console.warn('🎙️ LoadingManager: Kokoro TTS download failed:', error.message);
                this.kokoroStatus = 'skipped';
                if (titleEl) titleEl.textContent = '🎙️ Kokoro TTS ✗ (failed)';
                if (statusEl) statusEl.textContent = 'NPCs will use browser TTS';
            }

            this.targetProgress = ((index + 1) / total) * 95;
        }
    },

    // Smooth animation for progress bar
    animate() {
        if (this.isComplete) return;

        // Only complete when BOTH display is done AND game is ready
        if (this._displayDone && this.isReady) {
            this.targetProgress = 100;
        }

        // Smoothly interpolate current progress toward target
        const diff = this.targetProgress - this.progress;
        this.progress += diff * 0.2;

        // Snap to 100 when close enough
        if (this._displayDone && this.isReady && this.progress > 99) {
            this.progress = 100;
        }

        // Update progress bar
        const fill = document.getElementById('loading-progress-fill');
        if (fill) {
            fill.style.width = Math.round(this.progress) + '%';
        }

        // Complete when we hit 100%
        if (this.progress >= 100 && !this.isComplete) {
            // Show final message
            const titleEl = document.getElementById('loading-title');
            const statusEl = document.getElementById('loading-status');
            if (titleEl) titleEl.textContent = 'Ready to trade!';
            if (statusEl) statusEl.textContent = `All ${this.SYSTEMS_TO_CHECK.length} systems ready`;

            setTimeout(() => this.complete(), 300);
            return;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Check if game is ready (but don't stop display)
    checkReady() {
        if (this.isReady) return;

        try {
            if (this.finalCheck()) {
                console.log('🖤 LoadingManager: Game systems ready!');
                this.isReady = true;
                clearInterval(this.checkInterval);
                // Don't stop display timer - let it finish showing all systems
            }
        } catch (e) {
            console.warn('🖤 LoadingManager: Check error:', e.message);
        }

        // Timeout fallback
        const elapsed = Date.now() - this.startTime;
        if (elapsed > this.maxWaitTime && !this.isReady) {
            console.warn(`🖤 LoadingManager: Timeout after ${elapsed}ms. Force-completing...`);
            this.isReady = true;
            this._displayDone = true;
            clearInterval(this.checkInterval);
            clearInterval(this._displayTimer);
        }
    },

    // Update UI helper (called during init)
    updateUI(progress) {
        const fill = document.getElementById('loading-progress-fill');
        if (fill) {
            fill.style.width = progress + '%';
        }
    },

    // Loading complete - show the menu
    complete() {
        if (this.isComplete) return;
        this.isComplete = true;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        clearInterval(this.checkInterval);
        clearInterval(this._displayTimer);
        clearInterval(this._tipTimer);

        const elapsed = Date.now() - this.startTime;
        console.log(`🖤 LoadingManager: Everything loaded in ${elapsed}ms!`);

        // 🖤 Ensure UI shows 100%
        this.updateUI(100);

        // 🌙 Brief pause at 100%, then transition to menu
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const mainMenu = document.getElementById('main-menu');

            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (mainMenu) mainMenu.classList.remove('hidden');

            // 🌦️ Start menu weather effects
            if (typeof MenuWeatherSystem !== 'undefined' && MenuWeatherSystem.init) {
                MenuWeatherSystem.init();
            }

            // 🎵 Trigger menu music (may need user interaction first)
            if (typeof MusicSystem !== 'undefined') {
                MusicSystem.playMenuMusic();
                console.log('🎵 LoadingManager: Menu music triggered');
            }

            console.log('🖤 LoadingManager: Main menu revealed. Let the games begin.');
        }, 500);
    },

    // 🔧 Debooger helper 💀
    deboogerStatus() {
        console.log('🖤 LoadingManager Debooger 🖤:');
        console.log(`  Progress: ${this.progress.toFixed(1)}%`);
        console.log(`  Target: ${this.targetProgress.toFixed(1)}%`);
        console.log(`  Ready: ${this.isReady}`);
        console.log(`  Elapsed: ${Date.now() - this.startTime}ms`);
        console.log(`  startNewGame: ${typeof startNewGame}`);
        console.log(`  window.startNewGame: ${typeof window.startNewGame}`);
    }
};

// register with Bootstrap (Bootstrap loads first now, so it always exists)
Bootstrap.register('LoadingManager', () => LoadingManager.init(), {
    dependencies: [],
    priority: 1,  // very early, handles loading screen
    severity: 'required'
});

window.LoadingManager = LoadingManager;
console.log('🖤 LoadingManager loaded');
