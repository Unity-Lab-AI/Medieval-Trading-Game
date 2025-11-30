// ═══════════════════════════════════════════════════════════════
// 🏆 GLOBAL LEADERBOARD SYSTEM - eternal glory for digital merchants
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - Hackall360, Sponge, GFourteen
// ═══════════════════════════════════════════════════════════════
// your shame and glory, broadcast to the world via free JSON storage
// because everyone needs to know you died to starvation on day 3

console.log('🏆 Global Leaderboard System awakening from the void...');

const GlobalLeaderboardSystem = {
    // 🌐 Configuration - reads from GameConfig in config.js
    // Set your JSONBin credentials in config.js, not here!
    // This is THE SINGLE SOURCE OF TRUTH for the Hall of Champions
    // All saves, deaths, and retirements go through here
    config: {
        // These get populated from GameConfig on init
        BIN_ID: null,
        API_KEY: null,
        GIST_ID: null,
        GITHUB_TOKEN: null,
        backend: 'local',
        maxEntries: 100,      // Top 100 champions - the Hall of Champions
        displayEntries: 10,   // Show top 10 in compact view
        minScoreToSubmit: 100,
        cacheTimeout: 300000
    },

    // 📊 Local cache of leaderboard
    leaderboard: [],
    lastFetch: null,
    autoRefreshInterval: null,
    // cacheTimeout now comes from config

    // 🎮 Initialize the system
    init() {
        console.log('🏆 Global Leaderboard initializing...');

        // Load from GameConfig first (the master config)
        this.loadFromGameConfig();

        // Then check for any user overrides in localStorage
        this.loadConfig();

        // Log final config state (show partial key for deboogering 🦇)
        const keyPreview = this.config.API_KEY ?
            this.config.API_KEY.substring(0, 15) + '...' + this.config.API_KEY.substring(this.config.API_KEY.length - 10) :
            'MISSING';
        console.log('🏆 Final config state:', {
            backend: this.config.backend,
            binId: this.config.BIN_ID,
            apiKeyPreview: keyPreview,
            maxEntries: this.config.maxEntries
        });

        // Initial fetch
        this.fetchLeaderboard().then(() => {
            console.log('🏆 Initial fetch complete, entries:', this.leaderboard.length);
            this.renderLeaderboard();
        });

        // Start auto-refresh every 10 minutes
        this.startAutoRefresh();

        console.log(`🏆 Leaderboard backend: ${this.config.backend}`);
    },

    // ⏰ Start auto-refresh interval (every 10 minutes)
    startAutoRefresh() {
        // Clear any existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        // Refresh every 10 minutes (600000ms)
        this.autoRefreshInterval = setInterval(() => {
            console.log('🏆 Auto-refreshing leaderboard...');
            this.lastFetch = null; // Force refresh
            this.fetchLeaderboard().then(() => {
                this.renderLeaderboard();
            });
        }, 600000); // 10 minutes

        console.log('🏆 Auto-refresh started (every 10 minutes)');
    },

    // 🛑 Stop auto-refresh (call when leaving game)
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
            console.log('🏆 Auto-refresh stopped');
        }
    },

    // 📜 Load configuration from GameConfig (config.js)
    loadFromGameConfig() {
        if (typeof GameConfig === 'undefined' || !GameConfig.leaderboard) {
            console.log('🏆 GameConfig.leaderboard not found, using defaults');
            return;
        }

        const lb = GameConfig.leaderboard;

        // Only use GameConfig if leaderboard is enabled
        if (!lb.enabled) {
            console.log('🏆 Global leaderboard disabled in GameConfig');
            this.config.backend = 'local';
            return;
        }

        // Set backend
        this.config.backend = lb.backend || 'local';

        // JSONBin config
        if (lb.jsonbin) {
            this.config.BIN_ID = lb.jsonbin.binId ? lb.jsonbin.binId.trim() : null;
            this.config.API_KEY = lb.jsonbin.apiKey ? lb.jsonbin.apiKey.trim() : null;
        }

        // Gist config
        if (lb.gist) {
            this.config.GIST_ID = lb.gist.gistId || null;
        }

        // Settings
        if (lb.settings) {
            this.config.maxEntries = lb.settings.maxEntries || 100;
            this.config.displayEntries = lb.settings.displayEntries || 10;
            this.config.minScoreToSubmit = lb.settings.minScoreToSubmit || 100;
            this.config.cacheTimeout = lb.settings.cacheTimeout || 300000;
        }

        // Validate - if jsonbin selected but no credentials, fall back to local
        if (this.config.backend === 'jsonbin' && (!this.config.BIN_ID || !this.config.API_KEY)) {
            console.warn('🏆 JSONBin selected but credentials missing in config.js - falling back to local');
            this.config.backend = 'local';
        }

        if (this.config.backend === 'gist' && !this.config.GIST_ID) {
            console.warn('🏆 Gist selected but Gist ID missing in config.js - falling back to local');
            this.config.backend = 'local';
        }

        console.log(`🏆 Loaded config from GameConfig: backend=${this.config.backend}`);
    },

    // 💾 Load config from localStorage (allows user to set their own keys)
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('leaderboard_config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                Object.assign(this.config, parsed);
            }
        } catch (e) {
            console.warn('Failed to load leaderboard config:', e);
        }
    },

    // 💾 Save config to localStorage
    saveConfig() {
        try {
            localStorage.setItem('leaderboard_config', JSON.stringify({
                BIN_ID: this.config.BIN_ID,
                API_KEY: this.config.API_KEY,
                GIST_ID: this.config.GIST_ID,
                backend: this.config.backend
            }));
        } catch (e) {
            console.warn('Failed to save leaderboard config:', e);
        }
    },

    // 🔧 Configure the leaderboard (call this to set up)
    configure(options) {
        Object.assign(this.config, options);
        this.saveConfig();
        console.log('🏆 Leaderboard configured:', this.config.backend);
        this.fetchLeaderboard();
    },

    // 📥 Fetch leaderboard from backend
    async fetchLeaderboard() {
        // Check cache
        if (this.lastFetch && Date.now() - this.lastFetch < this.config.cacheTimeout) {
            return this.leaderboard;
        }

        try {
            switch (this.config.backend) {
                case 'jsonbin':
                    return await this.fetchFromJSONBin();
                case 'gist':
                    return await this.fetchFromGist();
                case 'local':
                default:
                    return this.fetchFromLocal();
            }
        } catch (error) {
            // 🦇 Network issue - silently fall back to local, no console spam
            return this.fetchFromLocal();
        }
    },

    // 📤 Submit score to leaderboard
    async submitScore(scoreData) {
        console.log('🏆 submitScore called:', scoreData);
        console.log('🏆 Current backend:', this.config.backend);

        // Validate score
        if (!scoreData || scoreData.score < this.config.minScoreToSubmit) {
            console.log('🏆 Score too low to submit globally. Score:', scoreData?.score, 'Min:', this.config.minScoreToSubmit);
            return false;
        }

        // Always save locally first
        console.log('🏆 Saving to local first...');
        this.saveToLocal(scoreData);

        try {
            switch (this.config.backend) {
                case 'jsonbin':
                    console.log('🏆 Submitting to JSONBin...');
                    return await this.submitToJSONBin(scoreData);
                case 'gist':
                    console.log('🏆 Submitting to Gist...');
                    return await this.submitToGist(scoreData);
                case 'local':
                default:
                    console.log('🏆 Backend is local, already saved');
                    return true; // Already saved locally
            }
        } catch (error) {
            // 🦇 Global submission failed - user already notified via addMessage
            addMessage?.('score saved locally. global submission failed - the void consumed it.');
            return false;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🗄️ JSONBin.io Backend
    // ═══════════════════════════════════════════════════════════

    async fetchFromJSONBin() {
        if (!this.config.BIN_ID) {
            console.warn('🏆 JSONBin not configured');
            return this.fetchFromLocal();
        }

        try {
            console.log('🏆 Fetching from JSONBin...');
            console.log('🏆 BIN_ID:', this.config.BIN_ID);
            console.log('🏆 API_KEY present:', !!this.config.API_KEY);

            const url = `https://api.jsonbin.io/v3/b/${this.config.BIN_ID}/latest`;
            console.log('🏆 Fetch URL:', url);

            // 🦇 Debooger: log the exact key being used (first/last chars only for security) 💀
            const keyLen = this.config.API_KEY ? this.config.API_KEY.length : 0;
            console.log('🏆 Debooger: 💀 API Key length:', keyLen);
            console.log('🏆 API Key starts with:', this.config.API_KEY ? this.config.API_KEY.substring(0, 5) : 'N/A');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.API_KEY,
                    'X-Bin-Meta': 'false'
                }
            });

            console.log('🏆 Fetch response status:', response.status);

            if (!response.ok) {
                // 🦇 API error - will fall back to local, throw to trigger catch
                throw new Error(`JSONBin fetch failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('🏆 JSONBin raw response:', JSON.stringify(data).substring(0, 500));

            // Handle various response formats
            if (Array.isArray(data)) {
                this.leaderboard = data;
            } else if (data && Array.isArray(data.leaderboard)) {
                this.leaderboard = data.leaderboard;
            } else if (data && typeof data === 'object') {
                // Empty or malformed - start fresh
                this.leaderboard = [];
            } else {
                this.leaderboard = [];
            }

            this.lastFetch = Date.now();

            // Merge with local scores
            this.mergeWithLocal();

            console.log(`🏆 Fetched ${this.leaderboard.length} global scores from JSONBin`);
            return this.leaderboard;
        } catch (error) {
            // 🦇 Network hiccup - silently fall back to local cache
            console.warn('🏆 JSONBin unreachable, using local cache');
            return this.fetchFromLocal();
        }
    },

    async submitToJSONBin(scoreData) {
        if (!this.config.BIN_ID || !this.config.API_KEY) {
            console.warn('🏆 JSONBin not fully configured');
            console.warn('🏆 BIN_ID:', this.config.BIN_ID);
            console.warn('🏆 API_KEY present:', !!this.config.API_KEY);
            return false;
        }

        try {
            console.log('🏆 === SUBMITTING TO JSONBIN ===');
            console.log('🏆 Score data:', JSON.stringify(scoreData));

            // Fetch current leaderboard (force fresh fetch)
            this.lastFetch = null;
            await this.fetchFromJSONBin();

            // Create entry
            const entry = this.createLeaderboardEntry(scoreData);
            console.log('🏆 Created entry with ID:', entry.id);
            console.log('🏆 Character ID:', entry.characterId);

            // 🎭 DEDUPLICATION: Each character can only have ONE entry on the leaderboard
            // Use characterId if available, otherwise fall back to playerName + isAlive check
            let existingIndex = -1;

            if (entry.characterId) {
                // Find existing entry with same characterId
                existingIndex = this.leaderboard.findIndex(e => e.characterId === entry.characterId);
                console.log('🏆 Checking for existing characterId:', entry.characterId, '- Found at index:', existingIndex);
            } else {
                // Fallback for old entries without characterId: use playerName + isAlive
                existingIndex = this.leaderboard.findIndex(e =>
                    e.playerName === entry.playerName && e.isAlive === true && !e.characterId
                );
                console.log('🏆 Fallback check (no characterId): Found at index:', existingIndex);
            }

            if (existingIndex !== -1) {
                // Update existing entry if new score is higher or equal
                if (entry.score >= this.leaderboard[existingIndex].score) {
                    console.log('🏆 Updating existing entry for character', entry.characterId || entry.playerName);
                    this.leaderboard[existingIndex] = entry;
                } else {
                    console.log('🏆 Existing score is higher, keeping old entry');
                    return true; // Still counts as success
                }
            } else {
                // Add new entry (new character)
                console.log('🏆 Adding new entry for character', entry.characterId || entry.playerName);
                this.leaderboard.push(entry);
            }

            // Sort by score (descending) and trim to max entries
            this.leaderboard.sort((a, b) => b.score - a.score);
            this.leaderboard = this.leaderboard.slice(0, this.config.maxEntries);

            console.log('🏆 Updating JSONBin with', this.leaderboard.length, 'entries');

            // Update bin with PUT request
            const url = `https://api.jsonbin.io/v3/b/${this.config.BIN_ID}`;
            const payload = { leaderboard: this.leaderboard };

            console.log('🏆 PUT URL:', url);
            console.log('🏆 Payload entries:', this.leaderboard.length);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.config.API_KEY
                },
                body: JSON.stringify(payload)
            });

            console.log('🏆 PUT response status:', response.status);

            if (!response.ok) {
                // 🦇 API rejected update - throw to trigger user notification
                throw new Error(`JSONBin update failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('🏆 JSONBin update success!');
            console.log('🏆 Response metadata:', result.metadata || 'none');

            // Update local cache
            try {
                localStorage.setItem('global_leaderboard_cache', JSON.stringify(this.leaderboard));
            } catch (e) {
                console.warn('🏆 Failed to update local cache:', e);
            }

            console.log('🏆 === SUBMISSION COMPLETE ===');
            addMessage?.('🏆 your legacy echoes across the realm! score submitted to Hall of Champions.');
            return true;
        } catch (error) {
            // 🦇 Submission failed - user gets notified, no console spam needed
            addMessage?.('⚠️ failed to submit to Hall of Champions - saved locally instead');
            return false;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 📝 GitHub Gist Backend
    // ═══════════════════════════════════════════════════════════

    async fetchFromGist() {
        if (!this.config.GIST_ID) {
            console.warn('🏆 Gist not configured');
            return this.fetchFromLocal();
        }

        const response = await fetch(`https://api.github.com/gists/${this.config.GIST_ID}`);

        if (!response.ok) {
            throw new Error(`Gist fetch failed: ${response.status}`);
        }

        const gist = await response.json();
        const content = gist.files['leaderboard.json']?.content;

        if (content) {
            const data = JSON.parse(content);
            this.leaderboard = data.leaderboard || [];
            this.lastFetch = Date.now();
        }

        this.mergeWithLocal();
        return this.leaderboard;
    },

    async submitToGist(scoreData) {
        if (!this.config.GIST_ID || !this.config.GITHUB_TOKEN) {
            console.warn('🏆 Gist not fully configured for writes');
            return false;
        }

        await this.fetchFromGist();

        const entry = this.createLeaderboardEntry(scoreData);
        this.leaderboard.push(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, this.config.maxEntries);

        const response = await fetch(`https://api.github.com/gists/${this.config.GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.config.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'leaderboard.json': {
                        content: JSON.stringify({ leaderboard: this.leaderboard }, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gist update failed: ${response.status}`);
        }

        console.log('🏆 Score submitted to Gist leaderboard!');
        return true;
    },

    // ═══════════════════════════════════════════════════════════
    // 💾 Local Storage Backend (fallback/offline)
    // ═══════════════════════════════════════════════════════════

    fetchFromLocal() {
        try {
            const saved = localStorage.getItem('global_leaderboard_cache');
            if (saved) {
                this.leaderboard = JSON.parse(saved);
            }
        } catch (e) {
            this.leaderboard = [];
        }
        return this.leaderboard;
    },

    saveToLocal(scoreData) {
        const entry = this.createLeaderboardEntry(scoreData);

        // Load existing
        this.fetchFromLocal();

        // 🎭 DEDUPLICATION: Each character can only have ONE entry
        let existingIndex = -1;

        if (entry.characterId) {
            existingIndex = this.leaderboard.findIndex(e => e.characterId === entry.characterId);
        } else {
            existingIndex = this.leaderboard.findIndex(e =>
                e.playerName === entry.playerName && e.isAlive === true && !e.characterId
            );
        }

        if (existingIndex !== -1) {
            // Update existing entry if new score is higher
            if (entry.score >= this.leaderboard[existingIndex].score) {
                this.leaderboard[existingIndex] = entry;
            }
        } else {
            // Add new entry
            this.leaderboard.push(entry);
        }

        // Sort and trim
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, this.config.maxEntries);

        // Save
        try {
            localStorage.setItem('global_leaderboard_cache', JSON.stringify(this.leaderboard));
        } catch (e) {
            console.warn('Failed to save local leaderboard:', e);
        }
    },

    mergeWithLocal() {
        // Merge global scores with local cache
        const local = [];
        try {
            const saved = localStorage.getItem('global_leaderboard_cache');
            if (saved) {
                local.push(...JSON.parse(saved));
            }
        } catch (e) {}

        // Merge, dedupe by characterId (preferred) or id, sort
        const merged = [...this.leaderboard];
        const existingCharacterIds = new Set(merged.filter(e => e.characterId).map(e => e.characterId));
        const existingIds = new Set(merged.map(e => e.id));

        for (const entry of local) {
            // Skip if same characterId already exists (keep the one from global)
            if (entry.characterId && existingCharacterIds.has(entry.characterId)) {
                continue;
            }
            // Skip if same id already exists
            if (existingIds.has(entry.id)) {
                continue;
            }
            merged.push(entry);
            if (entry.characterId) {
                existingCharacterIds.add(entry.characterId);
            }
        }

        merged.sort((a, b) => b.score - a.score);
        this.leaderboard = merged.slice(0, this.config.maxEntries);

        // Update local cache with merged data
        try {
            localStorage.setItem('global_leaderboard_cache', JSON.stringify(this.leaderboard));
        } catch (e) {}
    },

    // ═══════════════════════════════════════════════════════════
    // 🎯 Score Calculation & Entry Creation
    // ═══════════════════════════════════════════════════════════

    createLeaderboardEntry(scoreData) {
        // get merchant rank info
        let merchantRank = null;
        let merchantRankIcon = '🥺';
        let merchantTitle = 'a Vagrant';
        if (typeof MerchantRankSystem !== 'undefined') {
            const rank = MerchantRankSystem.getCurrentRank();
            merchantRank = rank.id;
            merchantRankIcon = rank.icon;
            merchantTitle = rank.title;
        }

        return {
            id: this.generateId(),
            // 🎭 Character ID - unique per character for deduplication
            // Each character can only have ONE entry on the leaderboard
            characterId: scoreData.characterId || null,
            playerName: scoreData.playerName || 'Anonymous Merchant',
            // 👑 Merchant rank persists to leaderboard
            merchantRank: scoreData.merchantRank || merchantRank || 'vagrant',
            merchantRankIcon: scoreData.merchantRankIcon || merchantRankIcon,
            merchantTitle: scoreData.merchantTitle || merchantTitle,
            score: scoreData.score || 0,
            gold: scoreData.gold || 0,
            daysSurvived: scoreData.daysSurvived || 0,
            causeOfDeath: scoreData.causeOfDeath || 'unknown',
            difficulty: scoreData.difficulty || 'normal',
            timestamp: Date.now(),
            dateString: new Date().toISOString().split('T')[0],
            // Comprehensive ending stats
            propertyCount: scoreData.propertyCount || 0,
            employeeCount: scoreData.employeeCount || 0,
            inventoryValue: scoreData.inventoryValue || 0,
            netWorth: scoreData.netWorth || 0,
            achievements: scoreData.achievements || 0,
            tradesCompleted: scoreData.tradesCompleted || 0,
            locationsVisited: scoreData.locationsVisited || 0,
            itemsCrafted: scoreData.itemsCrafted || 0,
            dungeonsExplored: scoreData.dungeonsExplored || 0,
            // 💚/💀 Status indicator
            isAlive: scoreData.isAlive || false
        };
    },

    generateId() {
        return 'lb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11);
    },

    // Calculate final score from game state
    calculateFinalScore(gameState) {
        const player = gameState?.player || game?.player;
        if (!player) return { score: 0 };

        // Base score from gold
        let score = Math.max(0, player.gold || 0);

        // Bonus for days survived - get starting date from config (single source of truth)
        const startDate = typeof GameConfig !== 'undefined' ? GameConfig.time.startingDate : { year: 1111, month: 4, day: 1 };
        const time = typeof TimeSystem !== 'undefined' ? TimeSystem.currentTime : { day: startDate.day, month: startDate.month, year: startDate.year };
        const startDays = startDate.day + (startDate.month - 1) * 30 + (startDate.year - 1) * 360;
        const currentDays = time.day + (time.month - 1) * 30 + (time.year - 1) * 360;
        const days = Math.max(0, currentDays - startDays);
        score += days * 10;

        // Bonus for properties
        const properties = typeof PropertySystem !== 'undefined' ?
            PropertySystem.getOwnedProperties?.() || [] : [];
        const propertyCount = properties.length;
        score += propertyCount * 500;

        // Calculate inventory value
        let inventoryValue = 0;
        if (player.inventory && typeof ItemDatabase !== 'undefined') {
            for (const [itemId, quantity] of Object.entries(player.inventory)) {
                if (quantity > 0) {
                    const price = ItemDatabase.calculatePrice?.(itemId) || 0;
                    inventoryValue += price * quantity;
                }
            }
        }
        score += Math.floor(inventoryValue * 0.5);

        // Bonus for achievements
        const achievements = typeof AchievementSystem !== 'undefined' ?
            AchievementSystem.unlockedAchievements?.size || 0 : 0;
        score += achievements * 100;

        // Bonus for trades
        const tradesCompleted = typeof TradingSystem !== 'undefined' ?
            TradingSystem.tradeHistory?.length || 0 : 0;
        score += tradesCompleted * 5;

        // Difficulty multiplier
        const difficultyMultipliers = {
            easy: 0.5,
            normal: 1.0,
            hard: 1.5,
            nightmare: 2.0
        };
        const difficulty = player.difficulty || 'normal';
        score = Math.floor(score * (difficultyMultipliers[difficulty] || 1));

        // Calculate net worth
        let propertyValue = 0;
        properties.forEach(p => {
            const type = typeof PropertySystem !== 'undefined' ?
                PropertySystem.propertyTypes?.[p.type] : null;
            if (type) {
                propertyValue += type.basePrice || 0;
            }
        });
        const netWorth = (player.gold || 0) + inventoryValue + propertyValue;

        return {
            score,
            // 🎭 Character ID for leaderboard deduplication
            characterId: player.characterId || null,
            playerName: player.name || 'Anonymous',
            gold: player.gold || 0,
            daysSurvived: days,
            difficulty: difficulty,
            causeOfDeath: gameState?.causeOfDeath || 'retired',
            propertyCount,
            inventoryValue,
            netWorth,
            achievements,
            tradesCompleted,
            locationsVisited: Object.keys(player.visitedLocations || {}).length,
            itemsCrafted: player.itemsCrafted || 0,
            dungeonsExplored: player.dungeonsExplored || 0
        };
    },

    // ═══════════════════════════════════════════════════════════
    // 🖥️ UI Rendering
    // ═══════════════════════════════════════════════════════════

    // Current page for paginated views
    currentPage: 0,
    entriesPerPage: 10,

    renderLeaderboard(containerId = 'global-leaderboard-list', showAll = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.leaderboard.length === 0) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <p>🏆 no champions yet...</p>
                    <p>be the first to leave your mark on this cursed realm.</p>
                </div>
            `;
            return;
        }

        // Show either top entries for compact view or paginated full list
        const entriesToShow = showAll ?
            this.leaderboard.slice(0, this.config.maxEntries) :
            this.leaderboard.slice(0, this.config.displayEntries);

        // 🖤 Build complete HTML string to avoid multiple reflows
        let html = entriesToShow.map((entry, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const difficultyBadge = this.getDifficultyBadge(entry.difficulty);
            // 💚 = still alive, 💀 = dead
            const statusIcon = entry.isAlive ? '💚' : '💀';
            const statusText = entry.isAlive ? 'still playing' : this.escapeHtml(entry.causeOfDeath);

            return `
                <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''} rank-${rank}">
                    <div class="leaderboard-rank">${rankIcon}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${this.escapeHtml(entry.playerName)}</div>
                        <div class="leaderboard-details">
                            <span class="lb-score">💰 ${entry.score.toLocaleString()}</span>
                            <span class="lb-days">📅 ${entry.daysSurvived} days</span>
                            ${difficultyBadge}
                        </div>
                        <div class="leaderboard-status ${entry.isAlive ? 'alive' : 'dead'}">
                            ${statusIcon} ${statusText}
                        </div>
                    </div>
                    <div class="leaderboard-date">${entry.dateString || 'unknown'}</div>
                </div>
            `;
        }).join('');

        // Add total count indicator if showing compact view
        if (!showAll && this.leaderboard.length > this.config.displayEntries) {
            html += `
                <div class="leaderboard-more-indicator">
                    <span>...and ${this.leaderboard.length - this.config.displayEntries} more champions</span>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    // Render full Hall of Champions with all 100 entries
    renderFullHallOfChampions(containerId = 'leaderboard-panel-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.leaderboard.length === 0) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <div class="leaderboard-empty-icon">🏆</div>
                    <p>no champions yet...</p>
                    <p>be the first to leave your mark on this cursed realm.</p>
                </div>
            `;
            return;
        }

        // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
        const getOrdinal = (n) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        // Show all entries up to maxEntries (100)
        const allEntries = this.leaderboard.slice(0, this.config.maxEntries);

        container.innerHTML = `
            <div class="hall-of-champions-header">
                <span class="champion-count">${allEntries.length} champion${allEntries.length !== 1 ? 's' : ''} recorded</span>
            </div>
            <div class="hall-of-champions-list">
                ${allEntries.map((entry, index) => {
                    const rank = index + 1;
                    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
                    const entryClass = rank <= 3 ? `rank-${rank}` : '';

                    // Display: 1st place, 2nd place, 3rd place, then #4, #5, etc.
                    let rankDisplay;
                    if (rank === 1) {
                        rankDisplay = '<span class="rank-icon">👑</span><span class="rank-text">1st</span>';
                    } else if (rank === 2) {
                        rankDisplay = '<span class="rank-icon">🥈</span><span class="rank-text">2nd</span>';
                    } else if (rank === 3) {
                        rankDisplay = '<span class="rank-icon">🥉</span><span class="rank-text">3rd</span>';
                    } else {
                        rankDisplay = `<span class="rank-number">${getOrdinal(rank)}</span>`;
                    }

                    // 💚 = still alive, 💀 = dead
                    const statusIcon = entry.isAlive ? '💚' : '💀';
                    const statusText = entry.isAlive ? 'still playing' : this.escapeHtml(entry.causeOfDeath || 'unknown');
                    const statusClass = entry.isAlive ? 'alive' : 'dead';

                    return `
                        <div class="lb-panel-entry ${entryClass}">
                            <div class="lb-rank ${rankClass}">${rankDisplay}</div>
                            <div class="lb-player-info">
                                <div class="lb-player-name">${this.escapeHtml(entry.playerName || 'Unknown')}</div>
                                <div class="lb-player-stats">
                                    <span class="lb-stat">📅 ${entry.daysSurvived || 0} days</span>
                                    <span class="lb-stat">💰 ${(entry.gold || 0).toLocaleString()}</span>
                                    ${entry.propertyCount ? `<span class="lb-stat">🏠 ${entry.propertyCount}</span>` : ''}
                                    ${entry.achievements ? `<span class="lb-stat">🏆 ${entry.achievements}</span>` : ''}
                                </div>
                                <div class="lb-player-status ${statusClass}">${statusIcon} ${statusText}</div>
                            </div>
                            <div class="lb-score">
                                <div class="lb-score-value">${(entry.score || 0).toLocaleString()}</div>
                                <div class="lb-score-label">score</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getDifficultyBadge(difficulty) {
        const badges = {
            easy: '<span class="difficulty-badge easy">🟢 Easy</span>',
            normal: '<span class="difficulty-badge normal">🟡 Normal</span>',
            hard: '<span class="difficulty-badge hard">🔴 Hard</span>',
            nightmare: '<span class="difficulty-badge nightmare">💀 Nightmare</span>'
        };
        return badges[difficulty] || badges.normal;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ═══════════════════════════════════════════════════════════
    // 🎮 Game Integration Hooks
    // ═══════════════════════════════════════════════════════════

    // Call this when player dies
    async onPlayerDeath(causeOfDeath = 'unknown') {
        const scoreData = this.calculateFinalScore({ causeOfDeath });
        console.log('🏆 Player died, submitting score:', scoreData);

        await this.submitScore(scoreData);
        this.renderLeaderboard();

        return scoreData;
    },

    // Call this when player retires/quits
    async onPlayerRetire() {
        const scoreData = this.calculateFinalScore({ causeOfDeath: 'retired wealthy' });
        console.log('🏆 Player retired, submitting score:', scoreData);

        await this.submitScore(scoreData);
        this.renderLeaderboard();

        return scoreData;
    },

    // Refresh leaderboard display
    async refresh() {
        this.lastFetch = null; // Force refresh
        await this.fetchLeaderboard();
        this.renderLeaderboard();
    }
};

// 🌐 Expose globally
window.GlobalLeaderboardSystem = GlobalLeaderboardSystem;

// 🧪 Test function - run from console: testJSONBin()
window.testJSONBin = async function() {
    // 🔐 SECURE: Get credentials from config (which loads from env/localStorage)
    const binId = GameConfig?.leaderboard?.jsonbin?.binId || localStorage.getItem('jsonbin_id');
    const apiKey = GameConfig?.leaderboard?.jsonbin?.apiKey || localStorage.getItem('jsonbin_key');

    if (!binId || !apiKey) {
        console.warn('❌ JSONBin credentials not configured. Set them in Settings > Leaderboard.');
        return;
    }

    console.log('🧪 Testing JSONBin API...');
    console.log('🧪 Bin ID:', binId);
    console.log('🧪 debooger: 🦇 API Key length:', apiKey.length);

    try {
        // Test READ
        console.log('🧪 Testing READ...');
        const readResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey,
                'X-Bin-Meta': 'false'
            }
        });
        console.log('🧪 READ Status:', readResponse.status);
        const readData = await readResponse.text();
        console.log('🧪 READ Response:', readData);

        if (readResponse.ok) {
            // Test WRITE
            console.log('🧪 Testing WRITE...');
            const testData = { leaderboard: [{ test: true, timestamp: Date.now() }] };
            const writeResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify(testData)
            });
            console.log('🧪 WRITE Status:', writeResponse.status);
            const writeData = await writeResponse.text();
            console.log('🧪 WRITE Response:', writeData);

            if (writeResponse.ok) {
                console.log('✅ JSONBin API is working! Both READ and WRITE succeeded.');
            } else {
                console.log('❌ WRITE failed. Check API key permissions.');
            }
        } else {
            console.log('❌ READ failed. Check bin ID and API key.');
        }
    } catch (error) {
        console.error('🧪 Test error:', error);
    }
};

// 🧹 Reset/Clear leaderboard - run from console: resetLeaderboard()
window.resetLeaderboard = async function() {
    // 🔐 Use GlobalLeaderboardSystem config as single source of truth
    const binId = GlobalLeaderboardSystem?.config?.BIN_ID ||
                  GameConfig?.leaderboard?.jsonbin?.binId ||
                  localStorage.getItem('jsonbin_id');
    const apiKey = GlobalLeaderboardSystem?.config?.API_KEY ||
                   GameConfig?.leaderboard?.jsonbin?.apiKey ||
                   localStorage.getItem('jsonbin_key');

    console.log('🧹 Reset leaderboard debooger: 🦇');
    console.log('  BIN_ID from GlobalLeaderboardSystem:', GlobalLeaderboardSystem?.config?.BIN_ID);
    console.log('  BIN_ID from GameConfig:', GameConfig?.leaderboard?.jsonbin?.binId);
    console.log('  Using BIN_ID:', binId);
    console.log('  API_KEY present:', !!apiKey);

    if (!binId || !apiKey) {
        console.warn('❌ JSONBin credentials not configured.');
        console.warn('  Check GameConfig.leaderboard.jsonbin in config.js');
        return false;
    }

    console.log('🧹 Resetting leaderboard to empty state...');
    console.log('🧹 Step 1: Clearing JSONBin...');

    try {
        const emptyData = { leaderboard: [] };
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(emptyData)
        });

        console.log('🧹 JSONBin response status:', response.status);

        if (response.ok) {
            console.log('✅ JSONBin cleared successfully!');

            // Step 2: Clear local storage cache
            console.log('🧹 Step 2: Clearing local storage cache...');
            localStorage.removeItem('global_leaderboard_cache');
            console.log('✅ Local cache cleared!');

            // Step 3: Clear in-memory cache
            console.log('🧹 Step 3: Clearing in-memory cache...');
            GlobalLeaderboardSystem.leaderboard = [];
            GlobalLeaderboardSystem.lastFetch = null;
            console.log('✅ Memory cache cleared!');

            // Step 4: Force refresh from API
            console.log('🧹 Step 4: Fetching fresh data from API...');
            await GlobalLeaderboardSystem.fetchLeaderboard();
            console.log('✅ Fresh data fetched! Entries:', GlobalLeaderboardSystem.leaderboard.length);

            // Step 5: Refresh the display
            console.log('🧹 Step 5: Refreshing display...');
            GlobalLeaderboardSystem.renderLeaderboard();
            if (typeof SaveUISystem !== 'undefined' && SaveUISystem.updateLeaderboard) {
                SaveUISystem.updateLeaderboard();
            }
            console.log('✅ Display refreshed!');

            console.log('🎉 Leaderboard has been completely reset! The Hall of Champions is now empty.');
            return true;
        } else {
            // 🦇 Reset failed - user running the command will see false return
            console.warn('❌ Failed to reset leaderboard:', response.status);
            return false;
        }
    } catch (error) {
        // 🦇 Network error during reset - report to console for deboogering 💀
        console.warn('❌ Error resetting leaderboard:', error.message);
        return false;
    }
};

// 🚀 Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalLeaderboardSystem.init());
} else {
    GlobalLeaderboardSystem.init();
}

console.log('✅ Global Leaderboard System loaded! Configure with GlobalLeaderboardSystem.configure({...})');
