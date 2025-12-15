// ═══════════════════════════════════════════════════════════════
// KOKORO TTS - Real AI voices for NPCs (Web Worker version)
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// RUNS IN WEB WORKER to prevent UI freezing during generation!
// REQUIRES: Local server (use START_GAME.bat or START_GAME.sh)
// ═══════════════════════════════════════════════════════════════

const KokoroTTS = {
    _initialized: false,
    _loading: false,
    _worker: null,
    _currentAudio: null,
    _audioContext: null,
    _messageId: 0,
    _pendingCallbacks: new Map(),
    _workerReady: false,
    _initPromise: null,

    SAMPLE_RATE: 24000,
    MODEL_ID: 'onnx-community/Kokoro-82M-v1.0-ONNX',
    CACHE_KEY: 'kokoro-tts-model-cached',

    // Voice mappings
    VOICES: {
        'af_heart': 'af_heart', 'af_alloy': 'af_alloy', 'af_aoede': 'af_aoede',
        'af_bella': 'af_bella', 'af_jessica': 'af_jessica', 'af_kore': 'af_kore',
        'af_nicole': 'af_nicole', 'af_nova': 'af_nova', 'af_river': 'af_river',
        'af_sarah': 'af_sarah', 'af_sky': 'af_sky',
        'am_adam': 'am_adam', 'am_echo': 'am_echo', 'am_eric': 'am_eric',
        'am_fenrir': 'am_fenrir', 'am_liam': 'am_liam', 'am_michael': 'am_michael',
        'am_onyx': 'am_onyx', 'am_puck': 'am_puck', 'am_santa': 'am_santa',
        'bf_alice': 'bf_alice', 'bf_emma': 'bf_emma', 'bf_isabella': 'bf_isabella', 'bf_lily': 'bf_lily',
        'bm_daniel': 'bm_daniel', 'bm_fable': 'bm_fable', 'bm_george': 'bm_george', 'bm_lewis': 'bm_lewis'
    },

    NPC_VOICE_MAP: {
        'witch': 'bf_isabella', 'healer': 'af_sarah', 'barmaid': 'af_bella',
        'maiden': 'bf_lily', 'queen': 'bf_emma', 'princess': 'bf_alice',
        'priestess': 'bf_emma', 'sorceress': 'bf_isabella', 'herbalist': 'af_river',
        'seamstress': 'af_jessica', 'tavern_wench': 'af_nova', 'noble_lady': 'bf_lily',
        'fortune_teller': 'bf_isabella', 'female_merchant': 'af_nicole',
        'guard': 'am_onyx', 'knight': 'bm_george', 'warrior': 'am_fenrir',
        'blacksmith': 'am_adam', 'bandit': 'am_puck', 'executioner': 'am_onyx',
        'captain': 'bm_daniel', 'soldier': 'am_eric', 'mercenary': 'am_echo',
        'wizard': 'bm_fable', 'sage': 'bm_lewis', 'scholar': 'bm_fable',
        'noble': 'bm_george', 'king': 'bm_daniel', 'prince': 'bm_lewis',
        'high_priest': 'bm_fable', 'monk': 'bm_lewis',
        'merchant': 'am_michael', 'innkeeper': 'am_liam', 'farmer': 'am_adam',
        'hunter': 'am_eric', 'fisherman': 'am_liam', 'baker': 'af_sarah',
        'tailor': 'bf_lily', 'jeweler': 'bm_george',
        'thief': 'am_puck', 'smuggler': 'am_echo', 'assassin': 'am_onyx',
        'spy': 'bf_isabella', 'pirate': 'am_fenrir',
        'prophet': 'am_onyx', 'stranger': 'am_onyx', 'hooded_stranger': 'am_onyx',
        'tutorial_guide': 'bf_emma', 'narrator': 'bm_fable',
        'ghost': 'bf_isabella', 'demon': 'am_onyx', 'angel': 'bf_lily',
        'goblin': 'am_puck', 'orc': 'am_fenrir', 'elf': 'bf_alice',
        'dwarf': 'am_adam', 'dragon': 'bm_daniel',
        '_default_female': 'af_bella', '_default_male': 'am_michael', '_default': 'am_michael'
    },

    settings: {
        enabled: true,
        volume: 0.8,
        speed: 1.0
    },

    // ═══════════════════════════════════════════════════════════
    // CHECK IF RUNNING FROM LOCAL SERVER
    // ═══════════════════════════════════════════════════════════

    isLocalServer() {
        const protocol = window.location.protocol;
        return protocol === 'http:' || protocol === 'https:';
    },

    // ═══════════════════════════════════════════════════════════
    // WORKER CODE - Embedded as string
    // ═══════════════════════════════════════════════════════════

    _getWorkerCode() {
        return `
            let tts = null;
            let isInit = false;
            const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

            self.onmessage = async function(e) {
                const { type, id, data } = e.data;

                if (type === 'init') {
                    if (isInit) {
                        self.postMessage({ type: 'initComplete', id, data: { success: true } });
                        return;
                    }
                    try {
                        self.postMessage({ type: 'progress', id, data: { msg: 'Loading Kokoro library...', pct: 0.1 } });
                        const mod = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm');

                        self.postMessage({ type: 'progress', id, data: { msg: 'Loading neural model...', pct: 0.2 } });
                        tts = await mod.KokoroTTS.from_pretrained(MODEL_ID, {
                            dtype: 'q8',
                            device: 'wasm',
                            progress_callback: (p) => {
                                if (p.status === 'progress') {
                                    self.postMessage({ type: 'progress', id, data: { msg: 'Loading model... ' + Math.round(p.progress) + '%', pct: 0.2 + (p.progress/100)*0.7 } });
                                }
                            }
                        });

                        isInit = true;
                        self.postMessage({ type: 'initComplete', id, data: { success: true } });
                    } catch (err) {
                        self.postMessage({ type: 'error', id, error: err.message });
                    }
                }
                else if (type === 'generate') {
                    if (!isInit || !tts) {
                        self.postMessage({ type: 'error', id, error: 'Not initialized' });
                        return;
                    }
                    try {
                        self.postMessage({ type: 'generating', id });
                        const audio = await tts.generate(data.text, { voice: data.voice, speed: data.speed });

                        if (audio && audio.audio) {
                            const buf = audio.audio.buffer.slice(0);
                            self.postMessage({ type: 'audio', id, data: { buffer: buf, rate: audio.sampling_rate } }, [buf]);
                        } else {
                            self.postMessage({ type: 'error', id, error: 'No audio generated' });
                        }
                    } catch (err) {
                        self.postMessage({ type: 'error', id, error: err.message });
                    }
                }
            };
        `;
    },

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    async checkModelCached() {
        if (localStorage.getItem(this.CACHE_KEY) === 'true') return true;
        try {
            const names = await caches.keys();
            for (const n of names) {
                if (n.includes('transformers') || n.includes('onnx')) {
                    const c = await caches.open(n);
                    const k = await c.keys();
                    if (k.some(r => r.url.includes('Kokoro-82M'))) {
                        localStorage.setItem(this.CACHE_KEY, 'true');
                        return true;
                    }
                }
            }
        } catch (e) {}
        return false;
    },

    async init(progressCallback = null) {
        // Return existing promise if already initializing
        if (this._initPromise) return this._initPromise;
        if (this._initialized) return true;

        this._initPromise = this._doInit(progressCallback);
        return this._initPromise;
    },

    async _doInit(progressCallback = null) {
        this._loading = true;

        // Check if running from file:// protocol
        if (!this.isLocalServer()) {
            console.warn('🎙️ KokoroTTS: Running from file:// - Web Worker requires local server');
            console.warn('🎙️ Use START_GAME.bat (Windows) or START_GAME.sh (Mac/Linux) for AI voices');

            if (progressCallback) {
                progressCallback('⚠️ Requires local server - use START_GAME.bat', 0);
            }

            this._loading = false;
            this._initPromise = null;
            throw new Error('Kokoro TTS requires a local server. Use START_GAME.bat to launch the game with AI voices.');
        }

        console.log('🎙️ KokoroTTS: Initializing Web Worker...');

        try {
            // Create blob-based worker
            const blob = new Blob([this._getWorkerCode()], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            this._worker = new Worker(workerUrl, { type: 'module' });

            // Handle messages
            this._worker.onmessage = (e) => this._onWorkerMessage(e);
            this._worker.onerror = (e) => {
                console.error('🎙️ Worker error:', e);
            };

            // Init audio context
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Send init to worker with timeout
            const result = await Promise.race([
                this._send('init', {}, progressCallback),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Worker init timeout')), 60000))
            ]);

            if (result.success) {
                localStorage.setItem(this.CACHE_KEY, 'true');
                this._initialized = true;
                this._loading = false;
                this._workerReady = true;
                this._initPromise = null;
                console.log('🎙️ KokoroTTS: Web Worker ready! Game stays responsive during TTS.');
                return true;
            }
            throw new Error('Worker init failed');

        } catch (error) {
            console.warn('🎙️ KokoroTTS: Init failed:', error.message);
            this._loading = false;
            this._initPromise = null;
            if (this._worker) { this._worker.terminate(); this._worker = null; }
            throw error;
        }
    },

    _onWorkerMessage(e) {
        const { type, id, data, error } = e.data;
        const cb = this._pendingCallbacks.get(id);

        switch (type) {
            case 'progress':
                if (cb?.onProgress) cb.onProgress(data.msg, data.pct);
                break;
            case 'initComplete':
                if (cb) { cb.resolve(data); this._pendingCallbacks.delete(id); }
                break;
            case 'generating':
                console.log('🎙️ Generating in worker (UI stays responsive)');
                break;
            case 'audio':
                if (cb) {
                    cb.resolve({ audio: new Float32Array(data.buffer), rate: data.rate });
                    this._pendingCallbacks.delete(id);
                }
                break;
            case 'error':
                console.warn('🎙️ Worker error:', error);
                if (cb) { cb.reject(new Error(error)); this._pendingCallbacks.delete(id); }
                break;
        }
    },

    _send(type, data, progressCallback = null) {
        return new Promise((resolve, reject) => {
            const id = ++this._messageId;
            this._pendingCallbacks.set(id, { resolve, reject, onProgress: progressCallback });
            this._worker.postMessage({ type, id, data });
        });
    },

    // ═══════════════════════════════════════════════════════════
    // VOICE SELECTION
    // ═══════════════════════════════════════════════════════════

    getVoiceForNPC(npcType, npcData = {}) {
        if (!npcType) return this.NPC_VOICE_MAP._default;
        const n = npcType.toLowerCase().replace(/\s+/g, '_');
        if (this.NPC_VOICE_MAP[n]) return this.NPC_VOICE_MAP[n];
        if (npcData.gender === 'female' || npcData.isFemale) return this.NPC_VOICE_MAP._default_female;
        if (['woman','lady','girl','maiden','wife','mother','queen','princess','witch'].some(k => n.includes(k)))
            return this.NPC_VOICE_MAP._default_female;
        return this.NPC_VOICE_MAP._default_male;
    },

    // ═══════════════════════════════════════════════════════════
    // SPEECH - NON-BLOCKING via Worker
    // ═══════════════════════════════════════════════════════════

    async speak(text, npcType, npcData = {}) {
        if (!this.settings.enabled || !text?.trim()) return false;
        if (!this._initialized || !this._worker) {
            console.log('🎙️ KokoroTTS: Not initialized');
            return false;
        }

        const clean = this._clean(text);
        if (!clean) return false;
        const voice = npcData.voice || this.getVoiceForNPC(npcType, npcData);

        try {
            console.log(`🎙️ KokoroTTS: "${voice}": "${clean.substring(0, 40)}..."`);
            this._showIndicator(true);

            // Send to worker - NON-BLOCKING!
            const result = await this._send('generate', { text: clean, voice, speed: this.settings.speed });

            this._showIndicator(false);

            if (result?.audio) {
                await this._play(result.audio, result.rate);
                return true;
            }
            return false;

        } catch (error) {
            console.error('🎙️ KokoroTTS failed:', error);
            this._showIndicator(false);
            return false;
        }
    },

    async _play(audioData, sampleRate) {
        this.stop();
        if (!this._audioContext) this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (this._audioContext.state === 'suspended') await this._audioContext.resume();

        const buf = this._audioContext.createBuffer(1, audioData.length, sampleRate || this.SAMPLE_RATE);
        buf.getChannelData(0).set(audioData);

        const src = this._audioContext.createBufferSource();
        src.buffer = buf;

        const gain = this._audioContext.createGain();
        gain.gain.value = this.settings.volume;

        src.connect(gain);
        gain.connect(this._audioContext.destination);
        this._currentAudio = src;

        return new Promise(resolve => {
            src.onended = () => { this._currentAudio = null; resolve(); };
            src.start();
        });
    },

    _clean(text) {
        if (!text) return '';
        return text
            .replace(/\{[\w:,]+\}/g, '')
            .replace(/\*[^*]+\*/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/\s+/g, ' ')
            .trim();
    },

    _showIndicator(show) {
        let el = document.getElementById('kokoro-gen-indicator');
        if (show) {
            if (!el) {
                el = document.createElement('div');
                el.id = 'kokoro-gen-indicator';
                el.textContent = '🎙️ Generating voice...';
                el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.85);color:#4ade80;padding:10px 18px;border-radius:10px;font-size:14px;z-index:99999;animation:kpulse 1.5s infinite;pointer-events:none;';
                if (!document.getElementById('kokoro-style')) {
                    const s = document.createElement('style');
                    s.id = 'kokoro-style';
                    s.textContent = '@keyframes kpulse{0%,100%{opacity:1}50%{opacity:0.5}}';
                    document.head.appendChild(s);
                }
                document.body.appendChild(el);
            }
            el.style.display = 'block';
        } else if (el) {
            el.style.display = 'none';
        }
    },

    stop() {
        if (this._currentAudio) { try { this._currentAudio.stop(); } catch {} this._currentAudio = null; }
        this._showIndicator(false);
    },

    isPlaying() { return this._currentAudio !== null; },
    isInitialized() { return this._initialized; },
    isLoading() { return this._loading; },

    destroy() {
        this.stop();
        if (this._worker) { this._worker.terminate(); this._worker = null; }
        if (this._audioContext) { this._audioContext.close().catch(() => {}); this._audioContext = null; }
        this._initialized = false;
        this._initPromise = null;
        this._pendingCallbacks.clear();
    }
};

window.KokoroTTS = KokoroTTS;
console.log('🎙️ Kokoro TTS module loaded - Web Worker for smooth gameplay');
