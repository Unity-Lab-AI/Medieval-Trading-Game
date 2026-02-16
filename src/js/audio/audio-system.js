// ═══════════════════════════════════════════════════════════════
// AUDIO SYSTEM - sounds echoing through the darkness
// ═══════════════════════════════════════════════════════════════
// Version: 0.92.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const AudioSystem = {
    // Audio context and nodes
    audioContext: null,
    masterGainNode: null,
    musicGainNode: null,
    sfxGainNode: null,
    
    // Audio settings - NUKED: disabled by default cuz it was making unholy buzzing noises
    settings: {
        masterVolume: 0,  // silence is golden
        musicVolume: 0,  // the void speaks louder
        sfxVolume: 0,   // shhhh
        isMuted: true,
        isMusicMuted: true,
        isSfxMuted: true,
        audioEnabled: false  // audio system disabled - was causing nonstop buzzing hell
    },
    
    // Current audio state
    currentMusic: null,
    musicNodes: [],
    ambientNodes: [],

    // Track active oscillators for cleanup
    _activeOscillators: [],

    // Sound definitions
    sounds: {},
    musicTracks: {},
    ambientSounds: {},

    // Noise buffer cache - avoid regenerating the same buffers
    _noiseBufferCache: {},
    
    // Initialize audio system
    init() {
        // NUKED - audio disabled because it was spawning demons (buzzing noises)
        if (!this.settings.audioEnabled) {
            console.log('AudioSystem disabled - silence reigns supreme');
            return;
        }

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            
            // Connect nodes: master -> music/sfx -> destination
            this.musicGainNode.connect(this.masterGainNode);
            this.sfxGainNode.connect(this.masterGainNode);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            // Create sound definitions
            this.createSoundDefinitions();
            
            // Load saved settings
            this.loadSettings();
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            // Audio init failed - disable audio silently
            this.settings.audioEnabled = false;
        }
    },
    
    // Create programmatically generated sound definitions
    createSoundDefinitions() {
        // UI Sounds
        this.sounds.click = () => this.playClick();
        this.sounds.hover = () => this.playHover();
        this.sounds.openPanel = () => this.playOpenPanel();
        this.sounds.closePanel = () => this.playClosePanel();
        this.sounds.error = () => this.playError();
        this.sounds.success = () => this.playSuccess();
        this.sounds.warning = () => this.playWarning();
        this.sounds.notification = () => this.playNotification();
        
        // Trading Sounds
        this.sounds.buyItem = () => this.playBuyItem();
        this.sounds.sellItem = () => this.playSellItem();
        this.sounds.coinPickup = () => this.playCoinPickup();
        this.sounds.coinDrop = () => this.playCoinDrop();
        this.sounds.tradeComplete = () => this.playTradeComplete();
        
        // Travel Sounds
        this.sounds.travelStart = () => this.playTravelStart();
        this.sounds.travelComplete = () => this.playTravelComplete();
        this.sounds.footstep = () => this.playFootstep();
        this.sounds.horseGallop = () => this.playHorseGallop();
        this.sounds.cartWheel = () => this.playCartWheel();
        
        // Item Sounds
        this.sounds.itemPickup = () => this.playItemPickup();
        this.sounds.itemUse = () => this.playItemUse();
        this.sounds.itemEquip = () => this.playItemEquip();
        this.sounds.toolUse = () => this.playToolUse();
        
        // Combat/Action Sounds
        this.sounds.levelUp = () => this.playLevelUp();
        this.sounds.questComplete = () => this.playQuestComplete();
        this.sounds.propertyPurchase = () => this.playPropertyPurchase();
        this.sounds.employeeHire = () => this.playEmployeeHire();
        
        // Ambient Sounds
        this.ambientSounds.market = () => this.playMarketAmbient();
        this.ambientSounds.tavern = () => this.playTavernAmbient();
        this.ambientSounds.forest = () => this.playForestAmbient();
        this.ambientSounds.mine = () => this.playMineAmbient();
        this.ambientSounds.city = () => this.playCityAmbient();
        this.ambientSounds.rain = () => this.playRainAmbient();
        this.ambientSounds.snow = () => this.playSnowAmbient();
        
        // Music Tracks
        this.musicTracks.menu = () => this.playMenuMusic();
        this.musicTracks.gameplay = () => this.playGameplayMusic();
        this.musicTracks.travel = () => this.playTravelMusic();
        this.musicTracks.market = () => this.playMarketMusic();
        this.musicTracks.night = () => this.playNightMusic();
    },
    
    // Update volume settings
    updateVolumes() {
        if (!this.audioContext) return;
        
        this.masterGainNode.gain.value = this.settings.isMuted ? 0 : this.settings.masterVolume;
        this.musicGainNode.gain.value = this.settings.isMusicMuted ? 0 : this.settings.musicVolume;
        this.sfxGainNode.gain.value = this.settings.isSfxMuted ? 0 : this.settings.sfxVolume;
    },
    
    // Play a sound effect
    playSound(soundName) {
        if (!this.settings.audioEnabled || this.settings.isSfxMuted || !this.sounds[soundName]) {
            return;
        }
        
        try {
            this.sounds[soundName]();
        } catch (error) {
            // Sound playback failed - browser may have blocked it
        }
    },
    
    // Play music track
    playMusic(trackName, loop = true) {
        if (!this.settings.audioEnabled || this.settings.isMusicMuted || !this.musicTracks[trackName]) {
            return;
        }
        
        // Stop current music
        this.stopMusic();
        
        try {
            this.currentMusic = trackName;
            this.musicTracks[trackName](loop);
        } catch (error) {
            // Music playback failed - browser may have blocked it
        }
    },
    
    // Stop current music
    stopMusic() {
        if (this.currentMusic) {
            this.musicNodes.forEach(node => {
                try {
                    node.stop();
                    node.disconnect();
                } catch (e) {
                    // Ignore errors when stopping already stopped nodes
                }
            });
            this.musicNodes = [];
            this.currentMusic = null;
        }
    },
    
    // Play ambient sound
    playAmbient(ambientName, loop = true) {
        if (!this.settings.audioEnabled || !this.ambientSounds[ambientName]) {
            return;
        }
        
        try {
            this.ambientSounds[ambientName](loop);
        } catch (error) {
            // Ambient audio failed - browser may have blocked it
        }
    },
    
    // Stop all ambient sounds
    // Fixed: ambient nodes are objects like { oscillator, gainNode } or { noise, gainNode }
    stopAmbient() {
        this.ambientNodes.forEach(node => {
            try {
                // Stop oscillator if present (mines, cities)
                if (node.oscillator) {
                    node.oscillator.stop();
                    node.oscillator.disconnect();
                }
                // Stop noise source if present (forests)
                if (node.noise) {
                    node.noise.stop();
                    node.noise.disconnect();
                }
                // Disconnect gain node
                if (node.gainNode) {
                    node.gainNode.disconnect();
                }
                // Disconnect filter if present
                if (node.filter) {
                    node.filter.disconnect();
                }
            } catch (e) {
                // Ignore errors when stopping already stopped nodes
            }
        });
        this.ambientNodes = [];

        // Clear ambient interval if running
        if (this.ambientInterval) {
            TimerManager.clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    },
    
    // Sound generation methods
    createOscillator(frequency, type = 'sine', duration = 0.1) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);

        // Track oscillator for cleanup
        this._activeOscillators.push(oscillator);

        // Auto-remove from tracking when oscillator ends
        oscillator.onended = () => {
            const idx = this._activeOscillators.indexOf(oscillator);
            if (idx > -1) this._activeOscillators.splice(idx, 1);
        };

        return { oscillator, gainNode };
    },
    
    createNoiseBuffer(duration = 0.1, type = 'white') {
        // Check cache first - avoid regenerating identical buffers
        const cacheKey = `${type}_${duration}`;
        if (this._noiseBufferCache[cacheKey]) {
            return this._noiseBufferCache[cacheKey];
        }

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            if (type === 'white') {
                output[i] = Math.random() * 2 - 1;
            } else if (type === 'pink') {
                output[i] = (Math.random() * 2 - 1) * 0.5;
            }
        }

        // Cache the buffer
        this._noiseBufferCache[cacheKey] = buffer;
        return buffer;
    },
    
    // UI Sound Effects
    playClick() {
        const { oscillator, gainNode } = this.createOscillator(800, 'square', 0.05);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    },
    
    playHover() {
        const { oscillator, gainNode } = this.createOscillator(600, 'sine', 0.03);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.03);
    },
    
    playOpenPanel() {
        const { oscillator, gainNode } = this.createOscillator(400, 'triangle', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playClosePanel() {
        const { oscillator, gainNode } = this.createOscillator(800, 'triangle', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playError() {
        const { oscillator, gainNode } = this.createOscillator(200, 'sawtooth', 0.3);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },
    
    playSuccess() {
        const osc1 = this.createOscillator(523, 'sine', 0.1);
        const osc2 = this.createOscillator(659, 'sine', 0.1);
        const osc3 = this.createOscillator(784, 'sine', 0.1);
        
        [osc1, osc2, osc3].forEach(({ oscillator, gainNode }) => {
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        });
    },
    
    playWarning() {
        const { oscillator, gainNode } = this.createOscillator(440, 'square', 0.2);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    },
    
    playNotification() {
        const { oscillator, gainNode } = this.createOscillator(880, 'sine', 0.15);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    },
    
    // Trading Sound Effects
    playBuyItem() {
        const { oscillator, gainNode } = this.createOscillator(600, 'sine', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playSellItem() {
        const { oscillator, gainNode } = this.createOscillator(800, 'sine', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playCoinPickup() {
        const osc1 = this.createOscillator(800, 'square', 0.05);
        const osc2 = this.createOscillator(1200, 'square', 0.05);
        
        [osc1, osc2].forEach(({ oscillator, gainNode }) => {
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        });
    },
    
    playCoinDrop() {
        const { oscillator, gainNode } = this.createOscillator(400, 'square', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playTradeComplete() {
        const osc1 = this.createOscillator(523, 'sine', 0.2);
        const osc2 = this.createOscillator(659, 'sine', 0.2);
        const osc3 = this.createOscillator(784, 'sine', 0.2);
        
        [osc1, osc2, osc3].forEach(({ oscillator, gainNode }, index) => {
            const delay = index * 0.1;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + delay + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.3);
            
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 0.3);
        });
    },
    
    // Travel Sound Effects
    playTravelStart() {
        const { oscillator, gainNode } = this.createOscillator(200, 'sawtooth', 0.3);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },
    
    playTravelComplete() {
        const osc1 = this.createOscillator(400, 'sine', 0.1);
        const osc2 = this.createOscillator(600, 'sine', 0.1);
        
        osc1.oscillator.start(this.audioContext.currentTime);
        osc1.oscillator.stop(this.audioContext.currentTime + 0.1);
        
        TimerManager.setTimeout(() => {
            osc2.oscillator.start(this.audioContext.currentTime);
            osc2.oscillator.stop(this.audioContext.currentTime + 0.1);
        }, 100);
    },
    
    playFootstep() {
        const noiseBuffer = this.createNoiseBuffer(0.05, 'pink');
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        noise.buffer = noiseBuffer;
        noise.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        noise.start(this.audioContext.currentTime);
    },
    
    playHorseGallop() {
        const { oscillator, gainNode } = this.createOscillator(150, 'sine', 0.1);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playCartWheel() {
        const noiseBuffer = this.createNoiseBuffer(0.1, 'white');
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.buffer = noiseBuffer;
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        noise.start(this.audioContext.currentTime);
    },
    
    // Item Sound Effects
    playItemPickup() {
        const { oscillator, gainNode } = this.createOscillator(1000, 'sine', 0.05);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    },
    
    playItemUse() {
        const { oscillator, gainNode } = this.createOscillator(600, 'triangle', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },
    
    playItemEquip() {
        const osc1 = this.createOscillator(400, 'square', 0.05);
        const osc2 = this.createOscillator(600, 'square', 0.05);
        
        osc1.oscillator.start(this.audioContext.currentTime);
        osc1.oscillator.stop(this.audioContext.currentTime + 0.05);
        
        setTimeout(() => {
            osc2.oscillator.start(this.audioContext.currentTime);
            osc2.oscillator.stop(this.audioContext.currentTime + 0.05);
        }, 50);
    },
    
    playToolUse() {
        const noiseBuffer = this.createNoiseBuffer(0.1, 'white');
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.buffer = noiseBuffer;
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        noise.start(this.audioContext.currentTime);
    },
    
    // Achievement/Level Up Sounds
    playLevelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((frequency, index) => {
            const { oscillator, gainNode } = this.createOscillator(frequency, 'sine', 0.3);
            const delay = index * 0.15;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + delay + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.5);
            
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 0.5);
        });
    },
    
    playQuestComplete() {
        const osc1 = this.createOscillator(523, 'sine', 0.2);
        const osc2 = this.createOscillator(659, 'sine', 0.2);
        const osc3 = this.createOscillator(784, 'sine', 0.2);
        const osc4 = this.createOscillator(1047, 'sine', 0.2);
        
        [osc1, osc2, osc3, osc4].forEach(({ oscillator, gainNode }, index) => {
            const delay = index * 0.1;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + delay + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.4);
            
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 0.4);
        });
    },
    
    playPropertyPurchase() {
        const osc1 = this.createOscillator(262, 'sine', 0.3);
        const osc2 = this.createOscillator(330, 'sine', 0.3);
        const osc3 = this.createOscillator(392, 'sine', 0.3);
        
        [osc1, osc2, osc3].forEach(({ oscillator, gainNode }, index) => {
            const delay = index * 0.1;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + delay + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.8);
            
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 0.8);
        });
    },
    
    playEmployeeHire() {
        const { oscillator, gainNode } = this.createOscillator(440, 'square', 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    },
    
    // Ambient Sound Methods
    playMarketAmbient(loop = true) {
        const createMarketNoise = () => {
            const noiseBuffer = this.createNoiseBuffer(2, 'pink');
            const noise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.buffer = noiseBuffer;
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 2;
            
            gainNode.gain.value = 0.05;
            
            noise.loop = loop;
            noise.start();
            
            return { noise, gainNode, filter };
        };
        
        const marketNode = createMarketNoise();
        this.ambientNodes.push(marketNode);
        
        // Add periodic crowd sounds
        const playCrowdSound = () => {
            const { oscillator, gainNode } = this.createOscillator(
                200 + Math.random() * 100, 
                'sawtooth', 
                0.1
            );
            gainNode.gain.value = 0.02;
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
        
        if (loop) {
            this.ambientInterval = TimerManager.setInterval(playCrowdSound, 2000 + Math.random() * 3000);
        }
    },
    
    playTavernAmbient(loop = true) {
        // DISABLED - this was causing a loud buzzing noise
        // The oscillator at 110Hz with no stop time was droning forever
        console.log('Tavern ambient disabled (was causing buzz)');
        return;

        // Original code (commented out):
        // const { oscillator, gainNode } = this.createOscillator(110, 'triangle', 10);
        // gainNode.gain.value = 0.03;
        // oscillator.start(this.audioContext.currentTime);
        // const tavernNode = { oscillator, gainNode };
        // this.ambientNodes.push(tavernNode);
    },
    
    playForestAmbient(loop = true) {
        const createWindNoise = () => {
            const noiseBuffer = this.createNoiseBuffer(3, 'pink');
            const noise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.buffer = noiseBuffer;
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filter.Q.value = 1;
            
            gainNode.gain.value = 0.03;
            
            noise.loop = loop;
            noise.start();
            
            return { noise, gainNode, filter };
        };
        
        const forestNode = createWindNoise();
        this.ambientNodes.push(forestNode);
        
        // Add occasional bird sounds
        const playBirdSound = () => {
            const { oscillator, gainNode } = this.createOscillator(
                2000 + Math.random() * 1000, 
                'sine', 
                0.05
            );
            gainNode.gain.value = 0.02;
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        };
        
        if (loop) {
            this.ambientInterval = TimerManager.setInterval(playBirdSound, 5000 + Math.random() * 10000);
        }
    },
    
    playMineAmbient(loop = true) {
        const { oscillator, gainNode } = this.createOscillator(60, 'sine', 10);
        gainNode.gain.value = 0.02;
        
        oscillator.start(this.audioContext.currentTime);
        
        const mineNode = { oscillator, gainNode };
        this.ambientNodes.push(mineNode);
        
        // Add occasional dripping sounds
        const playDripSound = () => {
            const { oscillator, gainNode } = this.createOscillator(800, 'sine', 0.1);
            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
        
        if (loop) {
            this.ambientInterval = TimerManager.setInterval(playDripSound, 3000 + Math.random() * 7000);
        }
    },
    
    playCityAmbient(loop = true) {
        const createCityNoise = () => {
            const noiseBuffer = this.createNoiseBuffer(5, 'pink');
            const noise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.buffer = noiseBuffer;
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            filter.type = 'bandpass';
            filter.frequency.value = 600;
            filter.Q.value = 1;
            
            gainNode.gain.value = 0.04;
            
            noise.loop = loop;
            noise.start();
            
            return { noise, gainNode, filter };
        };
        
        const cityNode = createCityNoise();
        this.ambientNodes.push(cityNode);
    },
    
    playRainAmbient(loop = true) {
        const createRainNoise = () => {
            const noiseBuffer = this.createNoiseBuffer(3, 'white');
            const noise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.buffer = noiseBuffer;
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            
            gainNode.gain.value = 0.06;
            
            noise.loop = loop;
            noise.start();
            
            return { noise, gainNode, filter };
        };
        
        const rainNode = createRainNoise();
        this.ambientNodes.push(rainNode);
    },
    
    playSnowAmbient(loop = true) {
        const createSnowNoise = () => {
            const noiseBuffer = this.createNoiseBuffer(3, 'pink');
            const noise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.buffer = noiseBuffer;
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            filter.type = 'lowpass';
            filter.frequency.value = 300;
            filter.Q.value = 2;
            
            gainNode.gain.value = 0.02;
            
            noise.loop = loop;
            noise.start();
            
            return { noise, gainNode, filter };
        };
        
        const snowNode = createSnowNoise();
        this.ambientNodes.push(snowNode);
    },
    
    // Music Methods
    playMenuMusic(loop = true) {
        // DISABLED - don't auto-play music on startup
        // Browser policies often block auto-play anyway
        console.log('Menu music disabled (requires user interaction)');
        return;
    },

    playGameplayMusic(loop = true) {
        // DISABLED - don't auto-play ambient on gameplay start
        // Can be re-enabled when user explicitly enables audio
        console.log('Gameplay music disabled');
        return;
    },
    
    playTravelMusic(loop = true) {
        // Replace with simple ambient sound instead of repetitive music
        this.playAmbient('forest', loop);
    },
    
    playMarketMusic(loop = true) {
        // Replace with simple ambient sound instead of repetitive music
        this.playAmbient('market', loop);
    },
    
    playNightMusic(loop = true) {
        // Replace with simple ambient sound instead of repetitive music
        this.playAmbient('tavern', loop);
    },
    
    // Settings management
    loadSettings() {
        const savedSettings = localStorage.getItem('tradingGameAudioSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...settings };
                this.updateVolumes();
            } catch (error) {
                // Silent fallback - corrupt data just means we use defaults
                localStorage.removeItem('tradingGameAudioSettings');
            }
        }
    },
    
    saveSettings() {
        localStorage.setItem('tradingGameAudioSettings', JSON.stringify(this.settings));
    },
    
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    },
    
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    },
    
    setSfxVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    },
    
    toggleMute() {
        this.settings.isMuted = !this.settings.isMuted;
        this.updateVolumes();
        this.saveSettings();
    },
    
    toggleMusicMute() {
        this.settings.isMusicMuted = !this.settings.isMusicMuted;
        this.updateVolumes();
        this.saveSettings();
    },
    
    toggleSfxMute() {
        this.settings.isSfxMuted = !this.settings.isSfxMuted;
        this.updateVolumes();
        this.saveSettings();
    },
    
    // Context-aware audio playback
    playContextualSound(context, action) {
        if (!this.settings.audioEnabled) return;
        
        switch (context) {
            case 'market':
                if (action === 'buy') this.playSound('buyItem');
                else if (action === 'sell') this.playSound('sellItem');
                else if (action === 'open') this.playSound('openPanel');
                else if (action === 'close') this.playSound('closePanel');
                break;
                
            case 'travel':
                if (action === 'start') this.playSound('travelStart');
                else if (action === 'complete') this.playSound('travelComplete');
                else if (action === 'footstep') this.playSound('footstep');
                break;
                
            case 'inventory':
                if (action === 'pickup') this.playSound('itemPickup');
                else if (action === 'use') this.playSound('itemUse');
                else if (action === 'equip') this.playSound('itemEquip');
                break;
                
            case 'ui':
                if (action === 'click') this.playSound('click');
                else if (action === 'hover') this.playSound('hover');
                else if (action === 'error') this.playSound('error');
                else if (action === 'success') this.playSound('success');
                else if (action === 'warning') this.playSound('warning');
                break;
                
            case 'achievement':
                if (action === 'levelup') this.playSound('levelUp');
                else if (action === 'quest') this.playSound('questComplete');
                break;
                
            default:
                this.playSound(action);
        }
    },
    
    // Update ambient based on location
    updateAmbientForLocation(locationType) {
        this.stopAmbient();
        
        switch (locationType) {
            case 'city':
                this.playAmbient('city');
                break;
            case 'town':
                this.playAmbient('market');
                break;
            case 'village':
                this.playAmbient('tavern');
                break;
            case 'forest':
                this.playAmbient('forest');
                break;
            case 'mine':
                this.playAmbient('mine');
                break;
        }
    },
    
    // Update music based on game state
    updateMusicForGameState(gameState) {
        switch (gameState) {
            case GameState.MENU:
                this.playMusic('menu');
                break;
            case GameState.PLAYING:
                this.playMusic('gameplay');
                break;
            case GameState.TRAVEL:
                this.playMusic('travel');
                break;
            case GameState.MARKET:
                this.playMusic('market');
                break;
        }
    },
    
    // Update music based on time of day
    updateMusicForTimeOfDay(timeInfo) {
        if (timeInfo.isNight) {
            this.playMusic('night');
        } else {
            this.playMusic('gameplay');
        }
    },
    
    // Stop all active oscillators
    stopAllOscillators() {
        this._activeOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Ignore already stopped oscillators
            }
        });
        this._activeOscillators = [];
    },

    // Cleanup - call this when changing locations or stopping audio
    cleanup() {
        this.stopMusic();
        this.stopAmbient();
        // Stop all tracked oscillators
        this.stopAllOscillators();

        if (this.musicLoopInterval) {
            if (typeof TimerManager !== 'undefined') {
                TimerManager.clearInterval(this.musicLoopInterval);
            } else {
                clearInterval(this.musicLoopInterval);
            }
            this.musicLoopInterval = null;
        }

        if (this.ambientInterval) {
            if (typeof TimerManager !== 'undefined') {
                TimerManager.clearInterval(this.ambientInterval);
            } else {
                clearInterval(this.ambientInterval);
            }
            this.ambientInterval = null;
        }
    },

    // MEMORY LEAK FIX: Full destroy method for cleanup
    // Call this when the game is unloading or audio system needs to be completely reset
    destroy() {
        // Stop all playback first
        this.cleanup();

        // Disconnect and null all gain nodes
        if (this.masterGainNode) {
            try {
                this.masterGainNode.disconnect();
            } catch (e) { /* ignore */ }
            this.masterGainNode = null;
        }

        if (this.musicGainNode) {
            try {
                this.musicGainNode.disconnect();
            } catch (e) { /* ignore */ }
            this.musicGainNode = null;
        }

        if (this.sfxGainNode) {
            try {
                this.sfxGainNode.disconnect();
            } catch (e) { /* ignore */ }
            this.sfxGainNode = null;
        }

        // Close the audio context
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) { /* ignore */ }
            this.audioContext = null;
        }

        // Clear all node arrays
        this.musicNodes = [];
        this.ambientNodes = [];

        // Clear sound definitions
        this.sounds = {};
        this.musicTracks = {};
        this.ambientSounds = {};

        // Reset state
        this.currentMusic = null;
        this.settings.audioEnabled = false;

        console.log('🔊 AudioSystem destroyed - all resources released');
    },

    // Check if audio system is active
    isActive() {
        return this.audioContext !== null && this.settings.audioEnabled;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}