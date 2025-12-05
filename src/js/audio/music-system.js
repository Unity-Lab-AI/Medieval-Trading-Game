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

    // 🎧 Current state
    currentAudio: null,
    currentCategory: null,
    currentTrackIndex: 0,
    isPlaying: false,
    isPaused: false,
    gapTimeout: null,

    // ⚙️ Settings
    settings: {
        enabled: true,
        volume: 0.5,  // 0.0 to 1.0
        gapBetweenTracks: 15000,  // 15 seconds in milliseconds
        fadeOutDuration: 1000,    // 1 second fade out
        fadeInDuration: 500       // 0.5 second fade in
    },

    // 🖤 Track if user has interacted (browsers block autoplay until interaction)
    userHasInteracted: false,
    pendingPlayCategory: null,

    // 🎮 Initialize the music system
    init() {
        console.log('🎵 MusicSystem: Awakening from the sonic void...');

        // Load saved settings
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
            this.currentAudio.volume = this.settings.volume;
        }
        this.saveSettings();
        console.log(`🎵 MusicSystem: Volume set to ${Math.round(this.settings.volume * 100)}%`);
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
            console.log(`🎵 MusicSystem: Already playing ${category} music`);
            this.pendingCategory = null;
            return;
        }

        // Clear any pending gap timeout
        if (this.gapTimeout) {
            clearTimeout(this.gapTimeout);
            this.gapTimeout = null;
        }

        // 🎵 If music is currently playing, do a crossfade transition
        if (this.isPlaying && this.currentAudio && !this.currentAudio.paused) {
            console.log(`🎵 MusicSystem: Crossfading to ${category} music...`);
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
        const newTrackPath = tracks[newTrackIndex];

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
        const volumeStep = this.settings.volume / steps;

        let currentStep = 0;
        const oldAudio = this.currentAudio;
        const newAudio = this.crossfadeAudio;

        const fadeInterval = setInterval(() => {
            currentStep++;

            // Fade out old track
            if (oldAudio && oldAudio.volume > 0) {
                oldAudio.volume = Math.max(0, oldAudio.volume - volumeStep);
            }

            // Fade in new track
            if (newAudio && newAudio.volume < this.settings.volume) {
                newAudio.volume = Math.min(this.settings.volume, newAudio.volume + volumeStep);
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

        const tracks = this.TRACKS[this.currentCategory];
        if (!tracks || tracks.length === 0) return;

        const trackPath = tracks[this.currentTrackIndex];
        console.log(`🎵 MusicSystem: Playing ${this.currentCategory} track ${this.currentTrackIndex + 1}/${tracks.length}: ${trackPath.split('/').pop()}`);

        this.currentAudio.src = trackPath;
        this.currentAudio.volume = 0; // Start silent for fade in

        // Try to play (may be blocked by browser)
        const playPromise = this.currentAudio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.isPaused = false;
                this.fadeIn();
            }).catch((error) => {
                console.log('🎵 MusicSystem: Playback blocked by browser - waiting for user interaction');
                this.isPlaying = false;
                // We'll try again when user interacts with the page
            });
        }
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

        const targetVolume = this.settings.volume;
        const step = targetVolume / (this.settings.fadeInDuration / 50);
        let currentVolume = 0;

        const fadeInterval = setInterval(() => {
            currentVolume += step;
            if (currentVolume >= targetVolume) {
                this.currentAudio.volume = targetVolume;
                clearInterval(fadeInterval);
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

        const fadeInterval = setInterval(() => {
            currentVolume -= step;
            if (currentVolume <= 0) {
                this.currentAudio.volume = 0;
                this.currentAudio.pause();
                clearInterval(fadeInterval);
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
        this.stop();
        if (this.currentAudio) {
            this.currentAudio.removeEventListener('ended', () => {});
            this.currentAudio.removeEventListener('error', () => {});
            this.currentAudio = null;
        }
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
