// ═══════════════════════════════════════════════════════════════
// MUSIC SYSTEM - melodies from the abyss 🖤💀🎵
// ═══════════════════════════════════════════════════════════════
// Version: 0.90.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const MusicSystem = {
    // 🎵 Music tracks by category
    // Volume multipliers now come from GameConfig.settings.audio.trackVolumeMultipliers
    TRACKS: {
        menu: [
            'assets/Music/Start Menu screen(15sec time out before replay creating music loop).mp3'
        ],
        normal: [
            'assets/Music/normal world1.mp3',
            'assets/Music/normal world2.mp3',
            'assets/Music/normal world3.mp3',
            'assets/Music/normal world4.mp3'
        ],
        dungeon: [
            'assets/Music/dungeon1.mp3',
            'assets/Music/dungeon2.mp3',
            'assets/Music/dungeon3.mp3',
            'assets/Music/dungeon4.mp3',
            'assets/Music/dungeon5.mp3'
        ],
        doom: [
            'assets/Music/doom world1.mp3',
            'assets/Music/doom world2.mp3',
            'assets/Music/doom world3.mp3',
            'assets/Music/doom world4.mp3'
        ]
    },

    // 🎚️ Get the volume multiplier for current category from GameConfig
    // 🖤💀 Edit GameConfig.settings.audio.trackVolumeMultipliers to adjust 💀
    getCategoryVolumeMult(category = null) {
        const cat = category || this.currentCategory;
        if (!cat) return 1.0;

        // Try to get from GameConfig first
        if (typeof GameConfig !== 'undefined' && GameConfig.settings?.audio?.trackVolumeMultipliers) {
            return GameConfig.settings.audio.trackVolumeMultipliers[cat] || 1.0;
        }

        // Fallback defaults if GameConfig not loaded
        const defaults = { menu: 0.6, normal: 0.7, dungeon: 0.6, doom: 0.5 };
        return defaults[cat] || 1.0;
    },

    // 🎚️ Get effective volume (master volume * category multiplier)
    getEffectiveVolume(category = null) {
        return this.settings.volume * this.getCategoryVolumeMult(category);
    },

    // 🎧 Current state
    currentAudio: null,
    currentCategory: null,
    currentTrackIndex: 0,
    isPlaying: false,
    isPaused: false,
    gapTimeout: null,

    // ⚙️ Settings - defaults pulled from GameConfig if available
    // 🖤💀 Edit GameConfig.settings.audio for master control 💀
    settings: {
        enabled: true,
        volume: 0.3,  // Will be overwritten by GameConfig on init
        gapBetweenTracks: 15000,
        fadeOutDuration: 1000,
        fadeInDuration: 500
    },

    // 🎚️ Load settings from GameConfig
    loadConfigDefaults() {
        if (typeof GameConfig !== 'undefined' && GameConfig.settings?.audio) {
            const audioConfig = GameConfig.settings.audio;
            this.settings.volume = audioConfig.musicVolume ?? this.settings.volume;
            this.settings.gapBetweenTracks = audioConfig.gapBetweenTracks ?? this.settings.gapBetweenTracks;
            this.settings.fadeOutDuration = audioConfig.fadeOutDuration ?? this.settings.fadeOutDuration;
            this.settings.fadeInDuration = audioConfig.fadeInDuration ?? this.settings.fadeInDuration;
            console.log(`🎵 MusicSystem: Loaded config - volume: ${this.settings.volume}, gap: ${this.settings.gapBetweenTracks}ms`);
        }
    },

    // 🖤 Track if user has interacted (browsers block autoplay until interaction)
    userHasInteracted: false,
    pendingPlayCategory: null,

    // 🎮 Initialize the music system
    init() {
        console.log('🎵 MusicSystem: Awakening from the sonic void...');

        // 🖤💀 Load defaults from GameConfig first, then override with saved settings 💀
        this.loadConfigDefaults();

        // Load saved settings (overrides config defaults if user changed them)
        this.loadSettings();

        // Create audio element
        this.currentAudio = new Audio();
        this.currentAudio.volume = this.settings.volume;

        // Listen for track end
        this.currentAudio.addEventListener('ended', () => this.onTrackEnd());

        // Handle errors gracefully
        this.currentAudio.addEventListener('error', (e) => {
            console.warn('🎵 MusicSystem: Track failed to load:', e);
            // Try next track after gap
            this.scheduleNextTrack();
        });

        // 🖤 Listen for first user interaction to unlock audio
        this.setupUserInteractionListener();

        console.log('🎵 MusicSystem: Ready to haunt your ears 🖤💀');
    },

    // 🖤 Setup listener for first user interaction (unlocks audio autoplay)
    setupUserInteractionListener() {
        const unlockAudio = () => {
            if (this.userHasInteracted) return;

            this.userHasInteracted = true;
            console.log('🎵 MusicSystem: User interaction detected - audio unlocked! 🖤');

            // Remove listeners - we only need one interaction
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);

            // If there's a pending category, play it now
            if (this.pendingPlayCategory) {
                console.log(`🎵 MusicSystem: Playing pending category: ${this.pendingPlayCategory}`);
                const category = this.pendingPlayCategory;
                this.pendingPlayCategory = null;
                this.startCategory(category);
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', unlockAudio, { once: false });
        document.addEventListener('keydown', unlockAudio, { once: false });
        document.addEventListener('touchstart', unlockAudio, { once: false });
    },

    // 💾 Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('musicSystemSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (e) {
            console.warn('🎵 MusicSystem: Could not load settings');
        }
    },

    // 💾 Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('musicSystemSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('🎵 MusicSystem: Could not save settings');
        }
    },

    // 🔊 Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            // 🖤💀 Use effective volume (master * track multiplier) 💀
            this.currentAudio.volume = this.getEffectiveVolume();
        }
        this.saveSettings();
        console.log(`🎵 MusicSystem: Volume set to ${Math.round(this.settings.volume * 100)}% (effective: ${Math.round(this.getEffectiveVolume() * 100)}%)`);
    },

    // 🔇 Toggle music on/off
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.saveSettings();

        if (!enabled) {
            this.stop();
        }
        console.log(`🎵 MusicSystem: Music ${enabled ? 'enabled' : 'disabled'}`);
    },

    // 🎵 Pending category change (wait for current track to finish)
    pendingCategory: null,

    // 🎵 Crossfade audio element for smooth transitions
    crossfadeAudio: null,

    // 🎵 Play music for a category (menu, normal, dungeon, doom)
    // Uses crossfade when changing categories during playback
    playCategory(category, forceCrossfade = false) {
        if (!this.settings.enabled) {
            console.log('🎵 MusicSystem: Music disabled, not playing');
            return;
        }

        const tracks = this.TRACKS[category];
        if (!tracks || tracks.length === 0) {
            console.warn(`🎵 MusicSystem: No tracks found for category: ${category}`);
            return;
        }

        // 🖤 If user hasn't interacted yet, queue this for later (browser autoplay policy)
        if (!this.userHasInteracted) {
            console.log(`🎵 MusicSystem: Queuing ${category} music (waiting for user interaction)`);
            this.pendingPlayCategory = category;
            return;
        }

        // If already playing this category, don't restart
        if (this.currentCategory === category && this.isPlaying) {
            // 🖤💀 Only log once per second to prevent spam 💀
            if (!this._lastAlreadyPlayingLog || Date.now() - this._lastAlreadyPlayingLog > 1000) {
                console.log(`🎵 MusicSystem: Already playing ${category} music`);
                this._lastAlreadyPlayingLog = Date.now();
            }
            this.pendingCategory = null;
            return;
        }

        // 🖤💀 If crossfading TO this category, don't start another crossfade! 💀
        if (this._crossfadingToCategory === category) {
            return; // Silent return - crossfade already in progress
        }

        // Clear any pending gap timeout
        if (this.gapTimeout) {
            clearTimeout(this.gapTimeout);
            this.gapTimeout = null;
        }

        // 🎵 If music is currently playing, do a crossfade transition
        if (this.isPlaying && this.currentAudio && !this.currentAudio.paused) {
            console.log(`🎵 MusicSystem: Crossfading to ${category} music...`);
            this._crossfadingToCategory = category; // 🖤 Track that we're crossfading
            this.crossfadeToCategory(category);
            return;
        }

        // No music playing, start immediately
        this.pendingCategory = null;
        this.startCategory(category);
    },

    // 🎵 Crossfade from current track to new category
    crossfadeToCategory(newCategory) {
        const tracks = this.TRACKS[newCategory];
        if (!tracks || tracks.length === 0) return;

        // Pick a random track from the new category
        const newTrackIndex = newCategory === 'menu' ? 0 : Math.floor(Math.random() * tracks.length);
        const newTrackPath = tracks[newTrackIndex];  // 🖤💀 Tracks are just path strings now 💀

        console.log(`🎵 MusicSystem: Crossfading to ${newTrackPath.split('/').pop()}`);

        // Create new audio element for crossfade
        this.crossfadeAudio = new Audio();
        this.crossfadeAudio.src = newTrackPath;
        this.crossfadeAudio.volume = 0; // Start silent

        // Start playing new track (fade in)
        const playPromise = this.crossfadeAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Fade out old, fade in new simultaneously
                this.performCrossfade(newCategory, newTrackIndex);
            }).catch(() => {
                console.log('🎵 MusicSystem: Crossfade blocked by browser');
            });
        }
    },

    // 🎵 Perform the actual crossfade
    performCrossfade(newCategory, newTrackIndex) {
        const fadeDuration = 2000; // 2 second crossfade
        const stepTime = 50; // Update every 50ms
        const steps = fadeDuration / stepTime;

        // 🖤💀 Get target volume for new category (master * category multiplier from GameConfig) 💀
        const targetVolume = this.getEffectiveVolume(newCategory);
        const volumeStep = targetVolume / steps;

        let currentStep = 0;
        const oldAudio = this.currentAudio;
        const newAudio = this.crossfadeAudio;

        const fadeInterval = setInterval(() => {
            currentStep++;

            // Fade out old track
            if (oldAudio && oldAudio.volume > 0) {
                oldAudio.volume = Math.max(0, oldAudio.volume - volumeStep);
            }

            // Fade in new track to its target volume
            if (newAudio && newAudio.volume < targetVolume) {
                newAudio.volume = Math.min(targetVolume, newAudio.volume + volumeStep);
            }

            // Crossfade complete
            if (currentStep >= steps) {
                clearInterval(fadeInterval);

                // Stop old audio
                if (oldAudio) {
                    oldAudio.pause();
                    oldAudio.src = '';
                }

                // Swap references
                this.currentAudio = newAudio;
                this.crossfadeAudio = null;
                this.currentCategory = newCategory;
                this.currentTrackIndex = newTrackIndex;
                this.isPlaying = true;
                this.pendingCategory = null;

                // Set up ended listener for new track
                this.currentAudio.addEventListener('ended', () => this.onTrackEnd(), { once: true });

                // 🖤💀 Clear crossfade tracking flag 💀
                this._crossfadingToCategory = null;

                console.log(`🎵 MusicSystem: Crossfade complete, now playing ${newCategory}`);
            }
        }, stepTime);
    },

    // 🎵 Internal: Start playing a category
    startCategory(category) {
        this.currentCategory = category;
        this.currentTrackIndex = 0;

        // Shuffle tracks for variety (except menu which only has one)
        if (category !== 'menu') {
            this.shuffleCurrentPlaylist();
        }

        this.playCurrentTrack();
    },

    // 🔀 Shuffle the current category's tracks
    shuffleCurrentPlaylist() {
        // We don't modify TRACKS directly, we just randomize starting index
        const tracks = this.TRACKS[this.currentCategory];
        if (tracks && tracks.length > 1) {
            this.currentTrackIndex = Math.floor(Math.random() * tracks.length);
        }
    },

    // ▶️ Play the current track
    playCurrentTrack() {
        if (!this.settings.enabled || !this.currentCategory) return;

        // 🖤💀 Ensure audio element exists - recreate if null 💀
        if (!this.currentAudio) {
            console.log('🎵 MusicSystem: Audio element was null, recreating...');
            this.currentAudio = new Audio();
            this.currentAudio.addEventListener('ended', () => this.onTrackEnd());
            this.currentAudio.addEventListener('error', (e) => {
                console.warn('🎵 MusicSystem: Track failed to load:', e);
                this.scheduleNextTrack();
            });
        }

        const tracks = this.TRACKS[this.currentCategory];
        if (!tracks || tracks.length === 0) return;

        // 🖤💀 Tracks are just path strings, volume mult comes from GameConfig 💀
        const trackPath = tracks[this.currentTrackIndex];
        const volumeMult = this.getCategoryVolumeMult();
        console.log(`🎵 MusicSystem: Loading ${this.currentCategory} track ${this.currentTrackIndex + 1}/${tracks.length}: ${trackPath.split('/').pop()} (vol mult: ${volumeMult})`);

        // 🖤💀 Wait for audio to be ready before playing - fixes Firefox/slow connection issues 💀
        const audio = this.currentAudio;
        audio.volume = 0; // Start silent for fade in

        // Remove old listeners to prevent stacking
        audio.oncanplaythrough = null;
        audio.onerror = null;

        // Set up one-time listener for when audio is ready
        audio.oncanplaythrough = () => {
            audio.oncanplaythrough = null; // Remove listener after first trigger

            // 🖤💀 Safety check - audio element may have changed during load 💀
            if (audio !== this.currentAudio) {
                console.log('🎵 MusicSystem: Audio element changed during load, aborting play');
                return;
            }

            console.log(`🎵 MusicSystem: Track loaded, playing...`);
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.fadeIn();
                }).catch((error) => {
                    console.log('🎵 MusicSystem: Playback blocked by browser - waiting for user interaction');
                    this.isPlaying = false;
                });
            }
        };

        // Handle load errors
        audio.onerror = (e) => {
            console.warn('🎵 MusicSystem: Failed to load track:', trackPath, e);
            audio.onerror = null;
            this.scheduleNextTrack();
        };

        // Start loading the track
        audio.src = trackPath;
        audio.load(); // Explicitly start loading
    },

    // 🎵 Called when a track ends
    onTrackEnd() {
        console.log('🎵 MusicSystem: Track ended');
        this.isPlaying = false;

        // 🎵 Check if there's a pending category change
        if (this.pendingCategory && this.pendingCategory !== this.currentCategory) {
            console.log(`🎵 MusicSystem: Switching to pending category: ${this.pendingCategory}`);
            const newCategory = this.pendingCategory;
            this.pendingCategory = null;
            // Wait the gap, then start new category
            this.gapTimeout = setTimeout(() => {
                this.gapTimeout = null;
                this.startCategory(newCategory);
            }, this.settings.gapBetweenTracks);
            return;
        }

        // No pending change, schedule next track in same category
        console.log('🎵 MusicSystem: Waiting 15 seconds for next track...');
        this.scheduleNextTrack();
    },

    // ⏰ Schedule the next track after the gap
    scheduleNextTrack() {
        if (this.gapTimeout) {
            clearTimeout(this.gapTimeout);
        }

        this.gapTimeout = setTimeout(() => {
            this.gapTimeout = null;
            this.advanceToNextTrack();
            this.playCurrentTrack();
        }, this.settings.gapBetweenTracks);
    },

    // ➡️ Move to the next track in the playlist
    advanceToNextTrack() {
        const tracks = this.TRACKS[this.currentCategory];
        if (!tracks || tracks.length === 0) return;

        this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    },

    // 📈 Fade in effect
    fadeIn() {
        if (!this.currentAudio) return;

        // 🖤💀 Use effective volume (master * track multiplier) 💀
        const targetVolume = this.getEffectiveVolume();
        const step = targetVolume / (this.settings.fadeInDuration / 50);
        let currentVolume = 0;

        this._fadeInInterval = setInterval(() => {
            // 🖤💀 Safety check - audio may have been nulled 💀
            if (!this.currentAudio) {
                clearInterval(this._fadeInInterval);
                this._fadeInInterval = null;
                return;
            }

            currentVolume += step;
            if (currentVolume >= targetVolume) {
                this.currentAudio.volume = targetVolume;
                clearInterval(this._fadeInInterval);
                this._fadeInInterval = null;
            } else {
                this.currentAudio.volume = currentVolume;
            }
        }, 50);
    },

    // 📉 Fade out effect
    fadeOut(callback) {
        if (!this.currentAudio) {
            if (callback) callback();
            return;
        }

        const startVolume = this.currentAudio.volume;
        const step = startVolume / (this.settings.fadeOutDuration / 50);
        let currentVolume = startVolume;

        // 🖤💀 Track fade interval so we can clear it on cleanup 💀
        this._fadeInterval = setInterval(() => {
            // 🖤💀 Safety check - audio may have been nulled during cleanup 💀
            if (!this.currentAudio) {
                clearInterval(this._fadeInterval);
                this._fadeInterval = null;
                if (callback) callback();
                return;
            }

            currentVolume -= step;
            if (currentVolume <= 0) {
                this.currentAudio.volume = 0;
                this.currentAudio.pause();
                clearInterval(this._fadeInterval);
                this._fadeInterval = null;
                if (callback) callback();
            } else {
                this.currentAudio.volume = currentVolume;
            }
        }, 50);
    },

    // ⏹️ Stop all music
    stop() {
        if (this.gapTimeout) {
            clearTimeout(this.gapTimeout);
            this.gapTimeout = null;
        }

        if (this.currentAudio) {
            this.fadeOut(() => {
                this.currentAudio.src = '';
                this.isPlaying = false;
                this.isPaused = false;
                this.currentCategory = null;
            });
        }
        console.log('🎵 MusicSystem: Music stopped');
    },

    // ⏸️ Pause music
    pause() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.isPaused = true;
            console.log('🎵 MusicSystem: Music paused');
        }
    },

    // ▶️ Resume music
    resume() {
        if (this.currentAudio && this.isPaused) {
            this.currentAudio.play().then(() => {
                this.isPaused = false;
                console.log('🎵 MusicSystem: Music resumed');
            }).catch(() => {
                console.log('🎵 MusicSystem: Could not resume - browser blocked');
            });
        }
    },

    // 🎮 Play menu music (for main menu screen)
    playMenuMusic() {
        this.playCategory('menu');
    },

    // 🌍 Play normal world music
    playNormalMusic() {
        this.playCategory('normal');
    },

    // 🏰 Play dungeon music
    playDungeonMusic() {
        this.playCategory('dungeon');
    },

    // 💀 Play doom world music
    playDoomMusic() {
        this.playCategory('doom');
    },

    // 🎮 Update music based on game state
    updateForGameState(gameState, isDoomWorld = false, inDungeon = false) {
        if (!this.settings.enabled) return;

        // Determine which music to play
        if (gameState === 'MENU' || gameState === GameState?.MENU) {
            this.playMenuMusic();
        } else if (inDungeon) {
            this.playDungeonMusic();
        } else if (isDoomWorld) {
            this.playDoomMusic();
        } else {
            this.playNormalMusic();
        }
    },

    // 🧹 Cleanup
    cleanup() {
        // 🖤💀 Clear any running fade intervals FIRST to prevent null access 💀
        if (this._fadeInterval) {
            clearInterval(this._fadeInterval);
            this._fadeInterval = null;
        }
        if (this._fadeInInterval) {
            clearInterval(this._fadeInInterval);
            this._fadeInInterval = null;
        }
        if (this.gapTimeout) {
            clearTimeout(this.gapTimeout);
            this.gapTimeout = null;
        }

        // 🖤💀 Don't call stop() here - it starts a new fadeOut which causes race condition 💀
        // Just directly clean up the audio element
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.src = '';
            } catch (e) {
                // Ignore errors during cleanup
            }
            this.currentAudio = null;
        }

        this.isPlaying = false;
        this.isPaused = false;
        this.currentCategory = null;
        console.log('🎵 MusicSystem: Cleaned up');
    }
};

// 🎵 Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        MusicSystem.init();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        MusicSystem.cleanup();
    });
}

console.log('🎵 MusicSystem loaded - the soundtrack awaits 🖤💀');
