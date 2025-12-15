// ═══════════════════════════════════════════════════════════════
// OLLAMA AUTO-INSTALLER - Downloads and installs Ollama automatically
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.08 | Unity AI Lab
// Auto-installs Ollama to game directory and downloads required models
// ═══════════════════════════════════════════════════════════════

const OllamaInstaller = {
    // Configuration
    config: {
        // Ollama download URLs by platform
        downloadUrls: {
            windows: 'https://ollama.ai/download/OllamaSetup.exe',
            mac: 'https://ollama.ai/download/Ollama-darwin.zip',
            linux: 'https://ollama.ai/download/ollama-linux-amd64'
        },
        // Local paths
        gameRoot: window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')),
        ollamaDir: 'ollama',
        modelsDir: 'models',
        // Default model to install
        defaultModel: 'mistral:7b-instruct',
        defaultModelSize: '4.4GB',
        // Ollama API
        apiBase: 'http://localhost:11434',
        checkTimeout: 3000
    },

    // State
    isInstalling: false,
    installProgress: 0,
    ollamaInstalled: false,
    ollamaRunning: false,

    // ═══════════════════════════════════════════════════════════
    // DETECT PLATFORM
    // ═══════════════════════════════════════════════════════════
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'mac';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
    },

    // ═══════════════════════════════════════════════════════════
    // CHECK IF OLLAMA IS INSTALLED AND RUNNING
    // ═══════════════════════════════════════════════════════════
    async checkOllamaStatus() {
        // Try multiple endpoints - localhost and 127.0.0.1
        const endpoints = [
            'http://localhost:11434',
            'http://127.0.0.1:11434'
        ];

        for (const baseUrl of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.checkTimeout);

                console.log('🦙 OllamaInstaller: Checking connection to', baseUrl);

                const response = await fetch(`${baseUrl}/api/tags`, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    this.ollamaRunning = true;
                    this.ollamaInstalled = true;
                    this.config.apiBase = baseUrl; // Remember working endpoint
                    const data = await response.json();
                    console.log('🦙 OllamaInstaller: Connected via', baseUrl, '! Found', data.models?.length || 0, 'models');
                    return {
                        installed: true,
                        running: true,
                        models: data.models || []
                    };
                }
                console.log('🦙 OllamaInstaller: Response not OK from', baseUrl, ':', response.status);
            } catch (error) {
                console.log('🦙 OllamaInstaller: Connection to', baseUrl, 'failed -', error.name);
            }
        }

        // All endpoints failed
        console.log('🦙 OllamaInstaller: Could not connect to Ollama on any endpoint');
        console.log('🦙 OllamaInstaller: Make sure Ollama is running with: ollama serve');
        return { installed: false, running: false, models: [] };
    },

    // ═══════════════════════════════════════════════════════════
    // SHOW INSTALLATION UI
    // ═══════════════════════════════════════════════════════════
    showInstallPrompt() {
        const platform = this.detectPlatform();
        const downloadUrl = this.config.downloadUrls[platform] || this.config.downloadUrls.windows;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'ollama-install-overlay';
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

        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #4a4a6a;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🦙</div>
                <h2 style="color: #e0e0e0; margin: 0 0 15px 0; font-size: 28px;">
                    AI-Powered NPC Dialogue
                </h2>
                <p style="color: #a0a0a0; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                    This game uses <strong style="color: #ff8844;">Ollama</strong> for intelligent NPC conversations.
                    <br>Ollama runs locally on your machine - no cloud, no API keys, 100% private.
                </p>

                <div id="ollama-install-status" style="
                    background: #0d1117;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 25px;
                ">
                    <div style="color: #ff8844; font-weight: bold; margin-bottom: 10px;">
                        📦 Required Setup:
                    </div>
                    <div style="color: #c0c0c0; font-size: 14px; text-align: left;">
                        <div style="margin: 8px 0;">1️⃣ Download Ollama (~100MB installer)</div>
                        <div style="margin: 8px 0;">2️⃣ Install it (auto-starts on system boot)</div>
                        <div style="margin: 8px 0;">3️⃣ Game will download Mistral model (${this.config.defaultModelSize})</div>
                    </div>
                </div>

                <div id="ollama-progress-container" style="display: none; margin-bottom: 25px;">
                    <div style="color: #a0a0a0; margin-bottom: 10px;">
                        <span id="ollama-progress-text">Downloading...</span>
                    </div>
                    <div style="
                        background: #0d1117;
                        border-radius: 10px;
                        height: 20px;
                        overflow: hidden;
                    ">
                        <div id="ollama-progress-bar" style="
                            background: linear-gradient(90deg, #ff8844, #ff6600);
                            height: 100%;
                            width: 0%;
                            transition: width 0.3s ease;
                            border-radius: 10px;
                        "></div>
                    </div>
                </div>

                <div id="ollama-buttons">
                    <button id="ollama-check-btn" onclick="OllamaInstaller.checkAndContinue()" style="
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                        transition: transform 0.2s, box-shadow 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 20px rgba(76,175,80,0.4)';"
                       onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                        ✓ I Have Ollama - Check Connection
                    </button>
                    <button id="ollama-download-btn" onclick="OllamaInstaller.downloadOllama()" style="
                        background: linear-gradient(135deg, #ff8844 0%, #ff6600 100%);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                        transition: transform 0.2s, box-shadow 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 20px rgba(255,136,68,0.4)';"
                       onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                        ⬇️ Download Ollama
                    </button>
                    <br>
                    <button onclick="OllamaInstaller.skipInstall()" style="
                        background: transparent;
                        color: #888;
                        border: 1px solid #444;
                        padding: 12px 25px;
                        font-size: 14px;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 10px 5px 5px 5px;
                    ">
                        Skip (use fallback dialogue)
                    </button>
                </div>

                <div id="ollama-manual-instructions" style="display: none; margin-top: 20px;">
                    <p style="color: #888; font-size: 13px;">
                        After installing Ollama, click the button below:
                    </p>
                    <button onclick="OllamaInstaller.checkAndContinue()" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        font-size: 16px;
                        border-radius: 8px;
                        cursor: pointer;
                    ">
                        ✓ I've Installed Ollama - Continue
                    </button>
                </div>

                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Platform detected: ${platform} |
                    <a href="https://ollama.ai" target="_blank" style="color: #ff8844;">ollama.ai</a>
                </p>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    // ═══════════════════════════════════════════════════════════
    // DOWNLOAD OLLAMA
    // ═══════════════════════════════════════════════════════════
    downloadOllama() {
        const platform = this.detectPlatform();
        const downloadUrl = this.config.downloadUrls[platform] || this.config.downloadUrls.windows;

        // Open download in new tab
        window.open(downloadUrl, '_blank');

        // Update UI
        const statusDiv = document.getElementById('ollama-install-status');
        const buttonsDiv = document.getElementById('ollama-buttons');
        const manualDiv = document.getElementById('ollama-manual-instructions');

        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">
                    ⬇️ Download Started!
                </div>
                <div style="color: #c0c0c0; font-size: 14px; text-align: left;">
                    <div style="margin: 8px 0;">1️⃣ <strong style="color: #4CAF50;">✓</strong> Download started in new tab</div>
                    <div style="margin: 8px 0;">2️⃣ Run the installer (OllamaSetup.exe)</div>
                    <div style="margin: 8px 0;">3️⃣ Wait for installation to complete</div>
                    <div style="margin: 8px 0;">4️⃣ Click "Continue" below</div>
                </div>
            `;
        }

        if (buttonsDiv) buttonsDiv.style.display = 'none';
        if (manualDiv) manualDiv.style.display = 'block';

        // Store that we initiated download
        localStorage.setItem('mtg_ollama_download_initiated', 'true');
    },

    // ═══════════════════════════════════════════════════════════
    // CHECK AND CONTINUE AFTER MANUAL INSTALL
    // ═══════════════════════════════════════════════════════════
    async checkAndContinue() {
        const statusDiv = document.getElementById('ollama-install-status');

        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="color: #ff8844; font-weight: bold;">
                    🔍 Checking for Ollama...
                </div>
            `;
        }

        const status = await this.checkOllamaStatus();

        if (status.running) {
            // Ollama is running! Close overlay and continue
            console.log('🦙 OllamaInstaller: Connection successful!');

            // Check for ANY model (not just mistral/llama)
            const hasModel = status.models && status.models.length > 0;

            if (hasModel) {
                console.log('🦙 OllamaInstaller: Found model:', status.models[0].name);
                // Auto-select first available model
                if (typeof OllamaModelManager !== 'undefined') {
                    OllamaModelManager.selectedModel = status.models[0].name;
                    localStorage.setItem('mtg_ollama_selected_model', status.models[0].name);
                }
            } else {
                // Need to download model - LoadingManager will handle this
                console.log('🦙 OllamaInstaller: Ollama running but no models - will prompt for download');
            }

            this.closeOverlay();

            // Trigger reload or continue loading
            if (typeof LoadingManager !== 'undefined') {
                LoadingManager.ollamaStatus = 'pending';
                LoadingManager.handleOllamaLoading(
                    LoadingManager.SYSTEMS_TO_CHECK.findIndex(s => s.check === 'OllamaModelManager'),
                    LoadingManager.SYSTEMS_TO_CHECK.length
                );
            }
        } else {
            // Still not running
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="color: #f44336; font-weight: bold; margin-bottom: 10px;">
                        ❌ Ollama Not Detected
                    </div>
                    <div style="color: #c0c0c0; font-size: 14px;">
                        Make sure Ollama is installed and running.<br>
                        Try opening a terminal and running: <code style="background: #0d1117; padding: 2px 6px; border-radius: 4px;">ollama serve</code>
                    </div>
                `;
            }

            // Show buttons again
            const manualDiv = document.getElementById('ollama-manual-instructions');
            if (manualDiv) {
                manualDiv.innerHTML = `
                    <button onclick="OllamaInstaller.checkAndContinue()" style="
                        background: #ff8844;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        font-size: 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                    ">
                        🔄 Try Again
                    </button>
                    <button onclick="OllamaInstaller.skipInstall()" style="
                        background: transparent;
                        color: #888;
                        border: 1px solid #444;
                        padding: 12px 30px;
                        font-size: 14px;
                        border-radius: 8px;
                        cursor: pointer;
                        margin: 5px;
                    ">
                        Skip for now
                    </button>
                `;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════
    // SKIP INSTALLATION
    // ═══════════════════════════════════════════════════════════
    skipInstall() {
        console.log('🦙 User skipped Ollama installation - using fallback dialogue');
        localStorage.setItem('mtg_ollama_skipped', 'true');
        this.closeOverlay();

        // Continue loading without Ollama
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.ollamaStatus = 'skipped';
        }
    },

    // ═══════════════════════════════════════════════════════════
    // CLOSE OVERLAY
    // ═══════════════════════════════════════════════════════════
    closeOverlay() {
        const overlay = document.getElementById('ollama-install-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    },

    // ═══════════════════════════════════════════════════════════
    // MAIN INITIALIZATION - Called during game load
    // ═══════════════════════════════════════════════════════════
    async init() {
        console.log('🦙 OllamaInstaller: Checking Ollama status...');

        // Check if user previously skipped
        const skipped = localStorage.getItem('mtg_ollama_skipped');
        if (skipped === 'true') {
            console.log('🦙 User previously skipped Ollama - using fallback');
            return { installed: false, running: false, skipped: true };
        }

        // Check Ollama status
        const status = await this.checkOllamaStatus();

        if (status.running) {
            console.log('🦙 Ollama is running with', status.models.length, 'models');
            return { installed: true, running: true, models: status.models };
        }

        // Ollama not running - show install prompt
        console.log('🦙 Ollama not detected - showing install prompt');
        this.showInstallPrompt();

        return { installed: false, running: false, promptShown: true };
    },

    // ═══════════════════════════════════════════════════════════
    // RESET SKIP PREFERENCE (for settings panel)
    // ═══════════════════════════════════════════════════════════
    resetSkipPreference() {
        localStorage.removeItem('mtg_ollama_skipped');
        console.log('🦙 Ollama skip preference reset - will prompt on next load');
    }
};

// Expose globally
window.OllamaInstaller = OllamaInstaller;

console.log('🦙 OllamaInstaller loaded - ready to setup AI');
