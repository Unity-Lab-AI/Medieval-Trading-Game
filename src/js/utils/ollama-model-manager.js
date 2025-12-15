// ═══════════════════════════════════════════════════════════════
// OLLAMA MODEL MANAGER - Auto-download & User-selectable Models
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.04 | Unity AI Lab
// Created by: Slave 2
// Model selection by: Slave 1 (IMPROVEMENT-003)
// ═══════════════════════════════════════════════════════════════
// Checks if Ollama is running and has the required model.
// If model is missing, prompts user to download it.
// Users can select from installed models via createModelSelector().
// Selected model is persisted in localStorage.
// Default model: mistral:7b-instruct (~4.4GB)
// ═══════════════════════════════════════════════════════════════

const OllamaModelManager = {
    // Configuration
    config: {
        baseUrl: 'http://localhost:11434',
        requiredModel: 'mistral',
        modelVariant: 'mistral:7b-instruct',
        modelSize: '4.4GB',
        checkTimeout: 2000,
        pullTimeout: 300000  // 5 minutes for download
    },

    // Supported model variants with metadata for UI display
    // Users can select any of these beyond the default mistral:7b-instruct
    SUPPORTED_MODELS: {
        'mistral:7b-instruct': {
            name: 'Mistral 7B Instruct',
            size: '4.4GB',
            description: 'Fast, balanced for NPC dialogue (recommended)',
            category: 'recommended'
        },
        'mistral:latest': {
            name: 'Mistral Latest',
            size: '4.1GB',
            description: 'Latest Mistral base model',
            category: 'recommended'
        },
        'llama2:7b': {
            name: 'LLaMA 2 7B',
            size: '3.8GB',
            description: 'Meta\'s open model, good general performance',
            category: 'general'
        },
        'llama2:13b': {
            name: 'LLaMA 2 13B',
            size: '7.4GB',
            description: 'Larger LLaMA, better quality but slower',
            category: 'general'
        },
        'llama3:8b': {
            name: 'LLaMA 3 8B',
            size: '4.7GB',
            description: 'Latest LLaMA generation, excellent quality',
            category: 'recommended'
        },
        'codellama:7b': {
            name: 'Code LLaMA 7B',
            size: '3.8GB',
            description: 'Code-focused, creative technical dialogue',
            category: 'specialized'
        },
        'neural-chat:7b': {
            name: 'Neural Chat 7B',
            size: '4.1GB',
            description: 'Intel\'s chat-optimized model',
            category: 'general'
        },
        'phi:latest': {
            name: 'Phi-2',
            size: '1.7GB',
            description: 'Microsoft\'s small but capable model',
            category: 'lightweight'
        },
        'tinyllama:latest': {
            name: 'TinyLLaMA',
            size: '637MB',
            description: 'Ultra-light, fast responses, lower quality',
            category: 'lightweight'
        },
        'gemma:2b': {
            name: 'Gemma 2B',
            size: '1.4GB',
            description: 'Google\'s efficient small model',
            category: 'lightweight'
        },
        'gemma:7b': {
            name: 'Gemma 7B',
            size: '5.0GB',
            description: 'Google\'s larger model, high quality',
            category: 'general'
        }
    },

    // State
    isOllamaRunning: false,
    hasRequiredModel: false,
    isPulling: false,
    pullProgress: 0,
    selectedModel: null,  // User's selected model (stored in localStorage)
    availableModels: [],  // List of installed models
    _abortController: null,  // AbortController for cancelling downloads
    _currentModelDownload: null,  // Track which model is being downloaded

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION - Check Ollama status on game start
    // ═══════════════════════════════════════════════════════════

    async init() {
        console.log('🦙 OllamaModelManager: Checking Ollama status...');

        // Load user's selected model from localStorage
        this.selectedModel = localStorage.getItem('mtg_ollama_selected_model') || this.config.requiredModel;

        // Check if Ollama is running
        this.isOllamaRunning = await this.checkOllamaRunning();

        if (!this.isOllamaRunning) {
            console.log('🦙 Ollama not running - NPC voices will use fallback responses');
            this.showOllamaNotRunningMessage();
            return { running: false, hasModel: false };
        }

        // Get all installed models
        this.availableModels = await this.getInstalledModels();
        console.log('🦙 Available models:', this.availableModels.map(m => m.name));

        // Check if required model is installed
        this.hasRequiredModel = await this.checkModelExists(this.config.requiredModel);

        if (!this.hasRequiredModel) {
            console.log(`🦙 Model '${this.config.requiredModel}' not found - prompting download`);
            this.showModelDownloadPrompt();
            return { running: true, hasModel: false };
        }

        // Update GameConfig with selected model (if different from default)
        if (this.selectedModel && typeof GameConfig !== 'undefined') {
            this.setActiveModel(this.selectedModel);
        }

        console.log(`🦙 Ollama ready with ${this.selectedModel || this.config.requiredModel} model!`);
        return { running: true, hasModel: true };
    },

    // ═══════════════════════════════════════════════════════════
    // OLLAMA STATUS CHECK
    // ═══════════════════════════════════════════════════════════

    async checkOllamaRunning() {
        // Try multiple endpoints - localhost and 127.0.0.1
        const endpoints = [
            'http://localhost:11434',
            'http://127.0.0.1:11434'
        ];

        for (const baseUrl of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.checkTimeout);

                console.log('🦙 Attempting to connect to Ollama at:', baseUrl);

                const response = await fetch(`${baseUrl}/api/tags`, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    console.log('🦙 Ollama connected via', baseUrl, '! Models found:', data.models?.map(m => m.name) || []);
                    this.config.baseUrl = baseUrl; // Remember working endpoint
                    return true;
                }
                console.log('🦙 Ollama response not OK from', baseUrl, ':', response.status);
            } catch (error) {
                console.log('🦙 Ollama check failed on', baseUrl, ':', error.name);
            }
        }

        console.log('🦙 Could not connect to Ollama on any endpoint');
        console.log('🦙 Make sure Ollama is running: ollama serve');
        return false;
    },

    // ═══════════════════════════════════════════════════════════
    // MODEL CHECK & DOWNLOAD
    // ═══════════════════════════════════════════════════════════

    async checkModelExists(modelName) {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`);
            if (!response.ok) return false;

            const data = await response.json();
            const models = data.models || [];

            // If looking for a specific model
            if (modelName && modelName !== '*') {
                return models.some(m =>
                    m.name === modelName ||
                    m.name.startsWith(`${modelName}:`)
                );
            }

            // Check if ANY suitable model exists (not just Mistral)
            // Accept any LLM model - the game can work with various models
            const hasAnyModel = models.length > 0;
            if (hasAnyModel) {
                console.log('🦙 Found installed model:', models[0].name);
                // Auto-select the first available model if no model selected
                if (!this.selectedModel || this.selectedModel === this.config.requiredModel) {
                    this.selectedModel = models[0].name;
                    localStorage.setItem('mtg_ollama_selected_model', this.selectedModel);
                    console.log('🦙 Auto-selected model:', this.selectedModel);
                }
            }
            return hasAnyModel;
        } catch (error) {
            console.error('🦙 Model check failed:', error);
            return false;
        }
    },

    async getInstalledModels() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`);
            if (!response.ok) return [];

            const data = await response.json();
            return data.models || [];
        } catch (error) {
            return [];
        }
    },

    async pullModel(modelName = null) {
        const model = modelName || this.config.modelVariant;

        if (this.isPulling) {
            console.log('🦙 Already pulling a model...');
            return false;
        }

        this.isPulling = true;
        this.pullProgress = 0;
        this._currentModelDownload = model;
        this._abortController = new AbortController();

        console.log(`🦙 Starting download of ${model}...`);
        this.showDownloadProgress(0, 'Starting download...');

        try {
            const response = await fetch(`${this.config.baseUrl}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: model,
                    stream: true
                }),
                signal: this._abortController.signal
            });

            if (!response.ok) {
                throw new Error(`Pull failed: ${response.status}`);
            }

            // Read streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let lastStatus = '';

            while (true) {
                // Check if cancelled
                if (this._abortController?.signal.aborted) {
                    reader.cancel();
                    throw new Error('Download cancelled by user');
                }

                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);

                        if (json.total && json.completed) {
                            const progress = Math.round((json.completed / json.total) * 100);
                            this.pullProgress = progress;
                            this.showDownloadProgress(progress, json.status || 'Downloading...');
                        } else if (json.status) {
                            if (json.status !== lastStatus) {
                                lastStatus = json.status;
                                console.log(`🦙 ${json.status}`);
                                this.showDownloadProgress(this.pullProgress, json.status);
                            }
                        }

                        if (json.status === 'success') {
                            this.isPulling = false;
                            this._abortController = null;
                            this._currentModelDownload = null;
                            this.hasRequiredModel = true;
                            this.showDownloadComplete();
                            console.log(`🦙 Model ${model} downloaded successfully!`);
                            return true;
                        }
                    } catch (e) {
                        // Non-JSON line, ignore
                    }
                }
            }

            this.isPulling = false;
            this._abortController = null;
            this._currentModelDownload = null;
            return true;

        } catch (error) {
            const wasCancelled = error.name === 'AbortError' || error.message.includes('cancelled');
            console.error('🦙 Model pull failed:', wasCancelled ? 'Cancelled by user' : error);
            this.isPulling = false;
            this._abortController = null;
            this._currentModelDownload = null;

            if (wasCancelled) {
                this.showDownloadCancelled();
                // Clean up partial download by deleting the incomplete model
                this.cleanupPartialDownload(model);
            } else {
                this.showDownloadError(error.message);
            }
            return false;
        }
    },

    // Cancel an in-progress download
    cancelDownload() {
        if (!this.isPulling || !this._abortController) {
            console.log('🦙 No download in progress to cancel');
            return false;
        }

        console.log('🦙 Cancelling download...');
        this._abortController.abort();
        return true;
    },

    // Clean up partial model download from Ollama
    async cleanupPartialDownload(modelName) {
        try {
            console.log(`🦙 Cleaning up partial download: ${modelName}`);
            // Ollama automatically cleans up incomplete downloads
            // But we can try to delete any partial model that might exist
            const response = await fetch(`${this.config.baseUrl}/api/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: modelName })
            });

            if (response.ok) {
                console.log(`🦙 Cleaned up partial model: ${modelName}`);
            }
        } catch (error) {
            // Ignore errors - partial model may not exist
            console.log('🦙 Cleanup skipped (model may not have been partially created)');
        }
    },

    // Show cancelled download UI
    showDownloadCancelled() {
        const modal = document.getElementById('ollama-download-modal');
        if (modal) {
            modal.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                ">
                    <div style="
                        background: #1a1a2e;
                        border: 2px solid #ff9800;
                        border-radius: 10px;
                        padding: 30px;
                        max-width: 500px;
                        text-align: center;
                        color: #e0e0e0;
                    ">
                        <h2 style="color: #ff9800; margin-bottom: 20px;">⚠️ Download Cancelled</h2>
                        <p style="margin-bottom: 20px;">
                            Model download was cancelled. NPCs will use pre-written responses.
                        </p>
                        <p style="margin-bottom: 20px; font-size: 14px; color: #aaa;">
                            You can download the model later from Settings.
                        </p>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                            background: #ff9800;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">Continue Without AI</button>
                    </div>
                </div>
            `;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // UI MESSAGES
    // ═══════════════════════════════════════════════════════════

    showOllamaNotRunningMessage() {
        // Create notification if game UI is ready
        if (typeof showNotification === 'function') {
            showNotification(
                '🦙 Ollama Not Running',
                'NPC voices will use pre-written responses. For AI-powered dialogue, install Ollama from ollama.ai',
                'info',
                10000
            );
        }
    },

    showModelDownloadPrompt() {
        const model = this.config.modelVariant;
        const size = this.config.modelSize;

        // Create modal dialog
        const modal = document.createElement('div');
        modal.id = 'ollama-download-modal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a2e;
                    border: 2px solid #4a4a6a;
                    border-radius: 10px;
                    padding: 30px;
                    max-width: 500px;
                    text-align: center;
                    color: #e0e0e0;
                ">
                    <h2 style="color: #ffd700; margin-bottom: 20px;">🦙 AI Model Required</h2>
                    <p style="margin-bottom: 15px;">
                        For AI-powered NPC dialogue, the game needs to download the
                        <strong>${model}</strong> model (${size}).
                    </p>
                    <p style="margin-bottom: 20px; font-size: 14px; color: #aaa;">
                        This is a one-time download. Without it, NPCs will use pre-written responses.
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="ollama-download-btn" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">Download Model</button>
                        <button id="ollama-skip-btn" style="
                            background: #666;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">Skip (Use Fallbacks)</button>
                    </div>
                    <div id="ollama-progress" style="display: none; margin-top: 20px;">
                        <div style="
                            background: #333;
                            border-radius: 5px;
                            height: 20px;
                            overflow: hidden;
                        ">
                            <div id="ollama-progress-bar" style="
                                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                                height: 100%;
                                width: 0%;
                                transition: width 0.3s;
                            "></div>
                        </div>
                        <p id="ollama-progress-text" style="margin-top: 10px; font-size: 14px;">
                            Preparing download...
                        </p>
                        <button id="ollama-cancel-btn" style="
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
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Button handlers
        document.getElementById('ollama-download-btn').onclick = async () => {
            document.getElementById('ollama-download-btn').disabled = true;
            document.getElementById('ollama-skip-btn').style.display = 'none';
            document.getElementById('ollama-progress').style.display = 'block';
            await this.pullModel();
        };

        document.getElementById('ollama-skip-btn').onclick = () => {
            modal.remove();
            console.log('🦙 User skipped model download - using fallback responses');
        };

        // Cancel button handler - delegate since button is created later
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'ollama-cancel-btn') {
                this.cancelDownload();
            }
        });
    },

    showDownloadProgress(percent, status) {
        const progressBar = document.getElementById('ollama-progress-bar');
        const progressText = document.getElementById('ollama-progress-text');

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `${status} (${percent}%)`;
        }
    },

    showDownloadComplete() {
        const modal = document.getElementById('ollama-download-modal');
        if (modal) {
            modal.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                ">
                    <div style="
                        background: #1a1a2e;
                        border: 2px solid #4CAF50;
                        border-radius: 10px;
                        padding: 30px;
                        max-width: 500px;
                        text-align: center;
                        color: #e0e0e0;
                    ">
                        <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ Download Complete!</h2>
                        <p style="margin-bottom: 20px;">
                            AI-powered NPC dialogue is now ready!
                        </p>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">Continue to Game</button>
                    </div>
                </div>
            `;
        }
    },

    showDownloadError(errorMsg) {
        const progressText = document.getElementById('ollama-progress-text');
        if (progressText) {
            progressText.innerHTML = `<span style="color: #f44336;">Error: ${errorMsg}</span>`;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // USER MODEL SELECTION - Let users pick from installed models
    // ═══════════════════════════════════════════════════════════

    // Set the active model (updates GameConfig and stores preference)
    setActiveModel(modelName) {
        if (!modelName) return false;

        this.selectedModel = modelName;
        localStorage.setItem('mtg_ollama_selected_model', modelName);

        // Update GameConfig.api.ollama.model
        if (typeof GameConfig !== 'undefined' && GameConfig.api?.ollama) {
            GameConfig.api.ollama.model = modelName;
            console.log(`🦙 Active model changed to: ${modelName}`);
        }

        // Update NPCVoiceChatSystem if it exists
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.config) {
            // NPCVoiceChatSystem uses getters, so it will pick up GameConfig change
            console.log('🦙 NPCVoiceChatSystem will use new model on next request');
        }

        return true;
    },

    // Get current selected model
    getSelectedModel() {
        return this.selectedModel || this.config.requiredModel;
    },

    // Get list of available models for dropdown
    getAvailableModelNames() {
        return this.availableModels.map(m => m.name);
    },

    // Refresh available models list
    async refreshModelList() {
        if (!this.isOllamaRunning) {
            this.isOllamaRunning = await this.checkOllamaRunning();
        }

        if (this.isOllamaRunning) {
            this.availableModels = await this.getInstalledModels();
            return this.availableModels;
        }
        return [];
    },

    // Create model selector dropdown HTML for settings panel
    createModelSelector() {
        const installedModels = this.getAvailableModelNames();
        const selected = this.getSelectedModel();

        if (installedModels.length === 0) {
            return `<span style="color: #888;">No models available (Ollama not running)</span>`;
        }

        // Group models by category for better UX
        const categories = {
            recommended: { label: 'Recommended', models: [] },
            general: { label: 'General Purpose', models: [] },
            lightweight: { label: 'Lightweight (Fast)', models: [] },
            specialized: { label: 'Specialized', models: [] },
            other: { label: 'Other Installed', models: [] }
        };

        // Sort installed models into categories
        installedModels.forEach(modelName => {
            const metadata = this.SUPPORTED_MODELS[modelName];
            if (metadata) {
                categories[metadata.category].models.push({
                    id: modelName,
                    ...metadata
                });
            } else {
                // Model not in our supported list - still show it
                categories.other.models.push({
                    id: modelName,
                    name: modelName,
                    size: 'Unknown',
                    description: 'Custom/unlisted model'
                });
            }
        });

        // Build optgroup HTML
        let optionsHtml = '';
        Object.values(categories).forEach(cat => {
            if (cat.models.length > 0) {
                optionsHtml += `<optgroup label="${cat.label}">`;
                cat.models.forEach(model => {
                    const isSelected = model.id === selected;
                    const displayName = `${model.name} (${model.size})`;
                    optionsHtml += `<option value="${model.id}" ${isSelected ? 'selected' : ''} title="${model.description}">${displayName}</option>`;
                });
                optionsHtml += `</optgroup>`;
            }
        });

        return `
            <select id="ollama-model-selector" style="
                background: #2a2a4a;
                color: #e0e0e0;
                border: 1px solid #4a4a6a;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                min-width: 250px;
            " onchange="OllamaModelManager.setActiveModel(this.value)">
                ${optionsHtml}
            </select>
            <div id="ollama-model-info" style="font-size: 12px; color: #888; margin-top: 4px;">
                ${this.getModelDescription(selected)}
            </div>
        `;
    },

    // Get description for a model
    getModelDescription(modelId) {
        const metadata = this.SUPPORTED_MODELS[modelId];
        return metadata ? metadata.description : 'Custom model';
    },

    // Get model metadata
    getModelMetadata(modelId) {
        return this.SUPPORTED_MODELS[modelId] || null;
    },

    // Check if a model is in our supported list
    isModelSupported(modelId) {
        return modelId in this.SUPPORTED_MODELS;
    },

    // Get all supported model IDs
    getSupportedModelIds() {
        return Object.keys(this.SUPPORTED_MODELS);
    },

    // Filter to only show recommended models for new users
    getRecommendedModels() {
        return Object.entries(this.SUPPORTED_MODELS)
            .filter(([_, meta]) => meta.category === 'recommended')
            .map(([id, meta]) => ({ id, ...meta }));
    },

    // ═══════════════════════════════════════════════════════════
    // STATUS CHECK (for settings panel)
    // ═══════════════════════════════════════════════════════════

    async getStatus() {
        const running = await this.checkOllamaRunning();
        const models = running ? await this.getInstalledModels() : [];
        const hasModel = models.some(m =>
            m.name === this.config.requiredModel ||
            m.name.startsWith(`${this.config.requiredModel}:`)
        );

        return {
            ollamaRunning: running,
            hasRequiredModel: hasModel,
            installedModels: models.map(m => m.name),
            requiredModel: this.config.requiredModel,
            selectedModel: this.selectedModel || this.config.requiredModel,
            isPulling: this.isPulling,
            pullProgress: this.pullProgress
        };
    }
};

// Expose globally
window.OllamaModelManager = OllamaModelManager;

console.log('🦙 OllamaModelManager loaded - ready to check for AI models');
