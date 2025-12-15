// ═══════════════════════════════════════════════════════════════
// KOKORO TTS INSTALLER - Setup prompt for AI voice generation
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.08 | Unity AI Lab
// Shows install/setup prompt for Kokoro TTS (requires local server)
// Pattern matches OllamaInstaller for consistent UX
// ═══════════════════════════════════════════════════════════════

const KokoroInstaller = {
    // Configuration
    config: {
        modelSize: '~94MB',
        modelName: 'Kokoro-82M ONNX',
        voiceCount: 28
    },

    // State
    isInstalling: false,
    installProgress: 0,
    modelCached: false,

    // ═══════════════════════════════════════════════════════════
    // CHECK IF RUNNING FROM LOCAL SERVER
    // ═══════════════════════════════════════════════════════════
    isLocalServer() {
        const protocol = window.location.protocol;
        return protocol === 'http:' || protocol === 'https:';
    },

    // Check if on static hosting (GitHub Pages, etc.)
    isStaticHost() {
        const hostname = window.location.hostname;
        return hostname.includes('github.io') ||
               hostname.includes('pages.dev') ||
               hostname.includes('netlify.app') ||
               hostname.includes('vercel.app') ||
               hostname.includes('surge.sh') ||
               hostname.includes('gitlab.io');
    },

    // ═══════════════════════════════════════════════════════════
    // CHECK IF KOKORO CAN WORK
    // ═══════════════════════════════════════════════════════════
    async checkStatus() {
        // Check if KokoroTTS module exists
        if (typeof KokoroTTS === 'undefined') {
            return { available: false, reason: 'module_missing' };
        }

        // Check if running from file:// protocol
        if (!this.isLocalServer()) {
            return { available: false, reason: 'needs_server' };
        }

        // Check if model is cached
        const isCached = await KokoroTTS.checkModelCached();
        if (isCached) {
            return { available: true, cached: true };
        }

        // Model not cached but CAN download
        return { available: true, cached: false, needsDownload: true };
    },

    // ═══════════════════════════════════════════════════════════
    // SHOW SETUP PROMPT
    // ═══════════════════════════════════════════════════════════
    showSetupPrompt(reason = 'needs_server') {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'kokoro-install-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Segoe UI', Arial, sans-serif;
        `;

        if (reason === 'needs_server') {
            // Show local server requirement
            overlay.innerHTML = this._getServerRequiredHTML();
        } else {
            // Show download prompt
            overlay.innerHTML = this._getDownloadPromptHTML();
        }

        document.body.appendChild(overlay);
    },

    _getServerRequiredHTML() {
        return `
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #4a4a6a;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🎙️</div>
                <h2 style="color: #e0e0e0; margin: 0 0 15px 0; font-size: 28px;">
                    AI Voice Generation
                </h2>
                <p style="color: #a0a0a0; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #4ade80;">Kokoro TTS</strong> provides realistic AI voices for NPCs.
                    <br>It requires running the game from a local server.
                </p>

                <div id="kokoro-install-status" style="
                    background: #0d1117;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 25px;
                ">
                    <div style="color: #4ade80; font-weight: bold; margin-bottom: 10px;">
                        📦 How to Enable AI Voices:
                    </div>
                    <div style="color: #c0c0c0; font-size: 14px; text-align: left;">
                        <div style="margin: 8px 0;">1️⃣ Close the browser tab</div>
                        <div style="margin: 8px 0;">2️⃣ Run <code style="background: #1a1a2e; padding: 2px 8px; border-radius: 4px; color: #4ade80;">START_GAME.bat</code> (Windows) or <code style="background: #1a1a2e; padding: 2px 8px; border-radius: 4px; color: #4ade80;">START_GAME.sh</code> (Mac/Linux)</div>
                        <div style="margin: 8px 0;">3️⃣ The game will open with a local server</div>
                        <div style="margin: 8px 0;">4️⃣ AI voices will download automatically (~${this.config.modelSize})</div>
                    </div>
                </div>

                <div id="kokoro-buttons">
                    <button onclick="KokoroInstaller.skipInstall()" style="
                        background: linear-gradient(135deg, #4a4a6a 0%, #3a3a5a 100%);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                        transition: transform 0.2s, box-shadow 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)';"
                       onmouseout="this.style.transform='scale(1)';">
                        Continue Without AI Voices
                    </button>
                </div>

                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    The game works fine without AI voices - NPCs will use browser text-to-speech or text only.
                </p>
            </div>
        `;
    },

    _getDownloadPromptHTML() {
        return `
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #4a4a6a;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🎙️</div>
                <h2 style="color: #e0e0e0; margin: 0 0 15px 0; font-size: 28px;">
                    Download AI Voice Model?
                </h2>
                <p style="color: #a0a0a0; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #4ade80;">Kokoro TTS</strong> provides ${this.config.voiceCount} realistic AI voices for NPCs.
                    <br>The model needs to be downloaded once (${this.config.modelSize}).
                </p>

                <div id="kokoro-install-status" style="
                    background: #0d1117;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 25px;
                ">
                    <div style="color: #4ade80; font-weight: bold; margin-bottom: 10px;">
                        ✨ Features:
                    </div>
                    <div style="color: #c0c0c0; font-size: 14px; text-align: left;">
                        <div style="margin: 8px 0;">🗣️ ${this.config.voiceCount} unique AI voices (male & female)</div>
                        <div style="margin: 8px 0;">🎭 Different voices for different NPC types</div>
                        <div style="margin: 8px 0;">⚡ Runs locally in your browser (no cloud)</div>
                        <div style="margin: 8px 0;">💾 Cached after first download</div>
                    </div>
                </div>

                <div id="kokoro-progress-container" style="display: none; margin-bottom: 25px;">
                    <div style="color: #a0a0a0; margin-bottom: 10px;">
                        <span id="kokoro-progress-text">Downloading...</span>
                    </div>
                    <div style="
                        background: #0d1117;
                        border-radius: 10px;
                        height: 20px;
                        overflow: hidden;
                    ">
                        <div id="kokoro-progress-bar" style="
                            background: linear-gradient(90deg, #4ade80, #22c55e);
                            height: 100%;
                            width: 0%;
                            transition: width 0.3s ease;
                            border-radius: 10px;
                        "></div>
                    </div>
                    <button id="kokoro-cancel-btn" onclick="KokoroInstaller.cancelDownload()" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-top: 15px;
                    ">Cancel Download</button>
                </div>

                <div id="kokoro-buttons">
                    <button id="kokoro-download-btn" onclick="KokoroInstaller.startDownload()" style="
                        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                        transition: transform 0.2s, box-shadow 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 20px rgba(74,222,128,0.4)';"
                       onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                        ⬇️ Download AI Voices (${this.config.modelSize})
                    </button>
                    <br>
                    <button onclick="KokoroInstaller.skipInstall()" style="
                        background: transparent;
                        color: #888;
                        border: 1px solid #444;
                        padding: 12px 25px;
                        font-size: 14px;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 10px 5px 5px 5px;
                    ">
                        Skip (use browser TTS)
                    </button>
                </div>

                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Model: ${this.config.modelName} | Runs entirely in your browser
                </p>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════
    // START DOWNLOAD
    // ═══════════════════════════════════════════════════════════
    async startDownload() {
        const buttonsDiv = document.getElementById('kokoro-buttons');
        const progressDiv = document.getElementById('kokoro-progress-container');
        const statusDiv = document.getElementById('kokoro-install-status');

        if (buttonsDiv) buttonsDiv.style.display = 'none';
        if (progressDiv) progressDiv.style.display = 'block';

        this.isInstalling = true;

        try {
            // Initialize Kokoro TTS with progress callback
            const success = await KokoroTTS.init((message, progress) => {
                this.installProgress = Math.round(progress * 100);
                const progressBar = document.getElementById('kokoro-progress-bar');
                const progressText = document.getElementById('kokoro-progress-text');

                if (progressBar) progressBar.style.width = `${this.installProgress}%`;
                if (progressText) progressText.textContent = `${message} (${this.installProgress}%)`;
            });

            if (success) {
                this.modelCached = true;
                this.showSuccess();
            } else {
                throw new Error('Initialization failed');
            }

        } catch (error) {
            console.error('🎙️ KokoroInstaller: Download failed:', error);
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="color: #f44336; font-weight: bold; margin-bottom: 10px;">
                        ❌ Download Failed
                    </div>
                    <div style="color: #c0c0c0; font-size: 14px;">
                        ${error.message}
                    </div>
                `;
            }
            if (progressDiv) progressDiv.style.display = 'none';
            if (buttonsDiv) buttonsDiv.style.display = 'block';
        }

        this.isInstalling = false;
    },

    // ═══════════════════════════════════════════════════════════
    // CANCEL DOWNLOAD
    // ═══════════════════════════════════════════════════════════
    cancelDownload() {
        // KokoroTTS doesn't have built-in cancel, but we can destroy it
        if (typeof KokoroTTS !== 'undefined') {
            KokoroTTS.destroy();
        }
        this.isInstalling = false;
        this.closeOverlay();

        // Mark as skipped
        localStorage.setItem('mtg_kokoro_skipped', 'true');

        // Continue loading
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.kokoroStatus = 'skipped';
        }
    },

    // ═══════════════════════════════════════════════════════════
    // SHOW SUCCESS
    // ═══════════════════════════════════════════════════════════
    showSuccess() {
        const overlay = document.getElementById('kokoro-install-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #4ade80;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                ">
                    <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #4ade80; margin: 0 0 15px 0; font-size: 28px;">
                        AI Voices Ready!
                    </h2>
                    <p style="color: #a0a0a0; margin: 0 0 25px 0; font-size: 16px;">
                        ${this.config.voiceCount} neural AI voices are now available for NPCs.
                    </p>
                    <button onclick="KokoroInstaller.closeOverlay(); KokoroInstaller.continueLoading();" style="
                        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                    ">
                        Continue to Game
                    </button>
                </div>
            `;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // SKIP INSTALLATION
    // ═══════════════════════════════════════════════════════════
    skipInstall() {
        console.log('🎙️ User skipped Kokoro TTS - using browser TTS');
        localStorage.setItem('mtg_kokoro_skipped', 'true');
        this.closeOverlay();

        // Continue loading without Kokoro
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.kokoroStatus = 'skipped';
        }
    },

    // ═══════════════════════════════════════════════════════════
    // CLOSE OVERLAY
    // ═══════════════════════════════════════════════════════════
    closeOverlay() {
        const overlay = document.getElementById('kokoro-install-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    },

    // ═══════════════════════════════════════════════════════════
    // CONTINUE LOADING
    // ═══════════════════════════════════════════════════════════
    continueLoading() {
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.kokoroStatus = 'ready';
            // Advance to next system
            const kokoroIndex = LoadingManager.SYSTEMS_TO_CHECK.findIndex(s => s.check === 'KokoroTTS');
            if (kokoroIndex >= 0) {
                LoadingManager.targetProgress = ((kokoroIndex + 1) / LoadingManager.SYSTEMS_TO_CHECK.length) * 95;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════
    // RESET SKIP PREFERENCE (for settings panel)
    // ═══════════════════════════════════════════════════════════
    resetSkipPreference() {
        localStorage.removeItem('mtg_kokoro_skipped');
        console.log('🎙️ Kokoro skip preference reset - will prompt on next load');
    }
};

// Expose globally
window.KokoroInstaller = KokoroInstaller;

console.log('🎙️ KokoroInstaller loaded - ready to setup AI voices');
