// ═══════════════════════════════════════════════════════════════
// unified people panel - talk, trade, quest, exist... all in one dark place
// ═══════════════════════════════════════════════════════════════
// File Version: 0.91.00
// conjured by Unity AI Lab - every soul, every transaction, every whisper
// the NPC list + embedded chat + trade + quest items in seamless harmony
// ═══════════════════════════════════════════════════════════════

const PeoplePanel = {
    // config - the bones of this beast
    panelId: 'people-panel',
    isOpen: false,
    currentNPC: null,
    chatHistory: [],
    isWaitingForResponse: false,
    viewMode: 'list', // 'list' or 'chat'

    // initialize - wake the panel from its slumber
    init() {
        this.createPanelHTML();
        this.setupEventListeners();

        // stop voice playback on page unload to prevent memory leaks
        window.addEventListener('beforeunload', () => {
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.stopVoicePlayback) {
                NPCVoiceChatSystem.stopVoicePlayback();
            }
        });

        console.log('👥 PeoplePanel: unified interface ready... talk, trade, quest, all in one place 🖤');
    },

    // create panel html - the entire unified interface
    createPanelHTML() {
        if (document.getElementById(this.panelId)) {
            return;
        }

        // append directly to body for better z-index handling
        const panel = document.createElement('section');
        panel.id = this.panelId;
        panel.className = 'panel overlay-panel hidden';
        panel.innerHTML = `
            <button class="panel-close-x" data-close-overlay="${this.panelId}" title="Close">×</button>

            <!-- 📋 LIST VIEW - shows all NPCs at location -->
            <div id="people-list-view" class="people-view">
                <div class="panel-header">
                    <h2>👥 People Here</h2>
                </div>
                <div class="panel-content">
                    <p class="location-context" id="people-location-context">Loading...</p>
                    <div id="people-list" class="people-list">
                        <!-- NPCs rendered here -->
                    </div>
                    <div id="people-empty" class="people-empty hidden">
                        <p>No one interesting seems to be around...</p>
                        <p class="empty-hint">Try visiting during different times or check the tavern!</p>
                    </div>
                </div>
            </div>

            <!-- 💬 CHAT VIEW - conversation with selected NPC -->
            <div id="people-chat-view" class="people-view hidden">
                <!-- NPC Name Header - prominent at very top -->
                <div class="npc-name-header">
                    <button class="back-btn" data-action="back-to-list">←</button>
                    <span id="chat-npc-icon" class="npc-icon-large">👤</span>
                    <h2 id="chat-npc-name" class="npc-name-title">NPC Name</h2>
                </div>
                <!-- NPC Info Row - title + badges -->
                <div class="npc-info-row">
                    <span id="chat-npc-title" class="npc-title-subtitle">Title</span>
                    <div class="npc-header-badges" id="chat-npc-badges"></div>
                </div>
                <!-- NPC Stats Bar - horizontal layout -->
                <div class="npc-stats-bar" id="npc-stats-bar">
                    <div class="npc-stat-item" title="Relationship">
                        <span class="stat-icon" id="npc-relation-icon">😐</span>
                        <span class="stat-label" id="npc-relation-label">Neutral</span>
                    </div>
                    <div class="npc-stat-item" title="Reputation">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value" id="npc-reputation-value">0</span><span class="stat-sep">/</span><span class="stat-value stat-req" id="npc-rep-required">0</span>
                    </div>
                    <div class="npc-stat-item" title="Trades Completed">
                        <span class="stat-icon">🤝</span>
                        <span class="stat-value" id="npc-trades-value">0</span>
                    </div>
                    <div class="npc-stat-item" title="NPC Gold">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value" id="npc-gold-value">0</span>
                    </div>
                </div>

                <div class="panel-content chat-content">
                    <!-- 💬 Chat messages area -->
                    <div id="people-chat-messages" class="chat-messages"></div>

                    <!-- 🎯 Quick action buttons based on NPC type -->
                    <div id="people-quick-actions" class="quick-actions hidden">
                        <!-- Populated dynamically based on NPC -->
                    </div>

                    <!-- 📦 Quest item section (when relevant) -->
                    <div id="people-quest-items" class="quest-items-section hidden">
                        <div class="quest-items-header">📦 Quest Items</div>
                        <div id="quest-items-list" class="quest-items-list"></div>
                    </div>

                    <!-- 🛒 Trade section (for merchants) -->
                    <div id="people-trade-section" class="trade-section hidden">
                        <div class="trade-header">💰 Trade Available</div>
                        <div id="trade-preview" class="trade-preview"></div>
                        <button class="trade-btn" data-action="open-trade" onclick="PeoplePanel.openFullTrade()">Trade with NPC</button>
                    </div>
                </div>

                <!-- ✍️ Chat input area -->
                <div class="chat-input-area">
                    <div class="chat-input-row">
                        <input type="text" id="people-chat-input" placeholder="Say something..."
                               onkeypress="if(event.key==='Enter')PeoplePanel.sendMessage()">
                        <button class="send-btn" data-action="send-message">Send</button>
                    </div>
                </div>
            </div>
        `;

        // append to body directly for reliable z-index stacking
        document.body.appendChild(panel);
        this.addStyles();
        console.log('👥 PeoplePanel: Unified panel created (appended to body)');
    },

    // add styles - making it not look like garbage
    addStyles() {
        if (document.getElementById('people-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'people-panel-styles';
        styles.textContent = `
            /* people panel unified styles */
            #people-panel {
                min-width: 400px;
                max-width: 500px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }

            .people-view { display: flex; flex-direction: column; height: 100%; }
            .people-view.hidden { display: none; }

            /* 📋 List View Styles */
            .people-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 400px;
                overflow-y: auto;
                padding: 8px;
            }

            .npc-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .npc-card:hover {
                background: rgba(100,100,100,0.3);
                border-color: rgba(255,215,0,0.3);
                transform: translateX(4px);
            }

            .npc-card-icon {
                font-size: 2em;
                position: relative;
            }

            /* wow-style quest markers - exclamation points & question marks */
            .quest-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                color: #000;
                font-size: 0.7em;
                font-weight: bold;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-shadow: 0 0 2px rgba(0,0,0,0.5);
                border: 1px solid rgba(0,0,0,0.3);
            }
            /* Gold ! = Available quest (non-repeatable) */
            .quest-badge.quest-available { background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); }
            /* Faded Yellow ! = Low-level/trivial quest */
            .quest-badge.quest-trivial { background: linear-gradient(135deg, #a89940 0%, #8a7830 100%); color: #333; }
            /* Blue ! = Repeatable quest (daily/weekly) */
            .quest-badge.quest-repeatable { background: linear-gradient(135deg, #4a9eff 0%, #2070cc 100%); color: #fff; }
            /* Orange ! = Main story/legendary quest */
            .quest-badge.quest-main { background: linear-gradient(135deg, #ff8c00 0%, #cc5500 100%); color: #fff; }
            /* Brown shield ! = Campaign quest */
            .quest-badge.quest-campaign { background: linear-gradient(135deg, #8b4513 0%, #5c2d0e 100%); color: #ffd700; border: 2px solid #ffd700; }

            /* Gold ? = Quest ready to turn in */
            .quest-badge.quest-complete { background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); }
            /* Silver ? = Quest in progress (not complete) */
            .quest-badge.quest-progress { background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%); color: #333; }
            /* Blue ? = Repeatable quest ready to turn in */
            .quest-badge.quest-repeatable-complete { background: linear-gradient(135deg, #4a9eff 0%, #2070cc 100%); color: #fff; }
            /* Orange ? = Main story quest ready to turn in */
            .quest-badge.quest-main-complete { background: linear-gradient(135deg, #ff8c00 0%, #cc5500 100%); color: #fff; }

            .trade-badge {
                position: absolute;
                bottom: -4px;
                right: -4px;
                background: #4a9;
                color: #fff;
                font-size: 0.4em;
                padding: 2px 4px;
                border-radius: 4px;
            }

            .npc-card-info { flex: 1; }
            .npc-card-name { font-weight: bold; color: #fff; }
            .npc-card-title { font-size: 0.85em; color: #aaa; }
            .npc-card-description { font-size: 0.8em; color: #888; margin-top: 4px; }

            .npc-card-actions { display: flex; gap: 6px; }
            .npc-talk-btn {
                padding: 6px 12px;
                background: linear-gradient(135deg, #3a3a4a, #2a2a3a);
                border: 1px solid rgba(255,215,0,0.3);
                color: #ffd700;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85em;
            }
            .npc-talk-btn:hover { background: linear-gradient(135deg, #4a4a5a, #3a3a4a); }

            /* 💬 Chat View Styles */
            /* NPC Name Header - prominent at very top */
            .npc-name-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 15px;
                background: linear-gradient(90deg, rgba(79, 195, 247, 0.2) 0%, transparent 100%);
                border-bottom: 1px solid rgba(79, 195, 247, 0.3);
            }

            .npc-name-header .back-btn {
                padding: 6px 10px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                color: #fff;
                cursor: pointer;
                font-size: 1.2em;
                line-height: 1;
            }

            .npc-name-header .back-btn:hover {
                background: rgba(255,255,255,0.2);
            }

            .npc-icon-large {
                font-size: 2em;
            }

            .npc-name-title {
                margin: 0;
                font-size: 1.3em;
                color: #ffd700;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* NPC Info Row - title + badges */
            .npc-info-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 8px 15px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                flex-wrap: wrap;
            }

            .npc-title-subtitle {
                font-size: 0.9em;
                color: #aaa;
                font-style: italic;
            }

            .chat-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
            }

            .back-btn {
                padding: 6px 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: #ccc;
                border-radius: 4px;
                cursor: pointer;
            }
            .back-btn:hover { background: rgba(255,255,255,0.2); }

            .npc-header-info {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
            }

            .npc-icon { font-size: 1.8em; }
            .npc-header-text h2 { margin: 0; font-size: 1.1em; }
            .npc-title { font-size: 0.85em; color: #aaa; }

            .npc-header-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                justify-content: flex-end;
            }

            .badge {
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 0.75em;
                font-weight: bold;
                white-space: nowrap;
            }
            /* Quest status badges */
            .badge-quest { background: #ffd700; color: #000; }
            .badge-quest-main { background: #ff8c00; color: #fff; }
            .badge-quest-progress { background: #808080; color: #fff; }
            .badge-quest-complete { background: #ffd700; color: #000; }
            .badge-trade { background: #4a9; color: #fff; }
            .badge-delivery { background: #94a; color: #fff; }

            /* 📊 NPC Stats Bar - horizontal layout */
            .npc-stats-bar {
                display: flex;
                justify-content: space-around;
                align-items: center;
                gap: 4px;
                padding: 6px 8px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                flex-wrap: wrap;
                overflow: hidden;
            }

            .npc-stat-item {
                display: flex;
                align-items: center;
                gap: 3px;
                padding: 3px 6px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                cursor: help;
                min-width: 0;
                flex-shrink: 1;
            }

            .npc-stat-item .stat-icon {
                font-size: 0.9em;
                flex-shrink: 0;
            }

            .npc-stat-item .stat-label {
                font-size: 0.75em;
                color: #aaa;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .npc-stat-item .stat-value {
                font-size: 0.8em;
                color: #ffd700;
                font-weight: bold;
                white-space: nowrap;
            }
            .npc-stat-item .stat-sep {
                font-size: 0.7em;
                color: #666;
                margin: 0 1px;
            }
            .npc-stat-item .stat-req {
                font-size: 0.75em;
                color: #888;
                font-weight: normal;
            }

            .chat-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                padding: 0;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 250px;
                min-height: 150px;
            }

            .chat-message {
                padding: 8px 12px;
                border-radius: 12px;
                max-width: 85%;
                word-wrap: break-word;
            }

            .chat-message.npc {
                background: linear-gradient(135deg, #2a3a4a, #1a2a3a);
                border: 1px solid rgba(100,150,200,0.3);
                align-self: flex-start;
            }

            .chat-message.player {
                background: linear-gradient(135deg, #3a4a3a, #2a3a2a);
                border: 1px solid rgba(100,200,100,0.3);
                align-self: flex-end;
            }

            .chat-message.system {
                background: rgba(255,215,0,0.1);
                border: 1px solid rgba(255,215,0,0.3);
                align-self: center;
                font-style: italic;
                font-size: 0.9em;
            }

            /* 🎯 Quick Actions */
            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                padding: 8px 12px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .quick-action-btn {
                padding: 6px 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: #ddd;
                border-radius: 16px;
                cursor: pointer;
                font-size: 0.85em;
                transition: all 0.2s;
            }
            .quick-action-btn:hover {
                background: rgba(255,215,0,0.2);
                border-color: rgba(255,215,0,0.4);
            }

            /* quest action buttons - special styling */
            .quick-action-btn.quest-action-btn {
                background: rgba(255,215,0,0.15);
                border-color: rgba(255,215,0,0.4);
                color: #ffd700;
            }
            .quick-action-btn.quest-action-btn:hover {
                background: rgba(255,215,0,0.3);
                border-color: rgba(255,215,0,0.6);
                box-shadow: 0 0 8px rgba(255,215,0,0.3);
            }

            /* 📦 Quest Items Section */
            .quest-items-section {
                padding: 8px 12px;
                border-top: 1px solid rgba(255,215,0,0.2);
                background: rgba(255,215,0,0.05);
            }

            .quest-items-header {
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 8px;
            }

            .quest-items-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .quest-item-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 8px;
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
            }

            .quest-item-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .give-item-btn {
                padding: 4px 10px;
                background: linear-gradient(135deg, #4a9, #3a8);
                border: none;
                color: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8em;
            }
            .give-item-btn:hover { background: linear-gradient(135deg, #5ba, #4a9); }

            /* 🛒 Trade Section */
            .trade-section {
                padding: 8px 12px;
                border-top: 1px solid rgba(100,200,100,0.2);
                background: rgba(100,200,100,0.05);
            }

            .trade-header {
                font-weight: bold;
                color: #4a9;
                margin-bottom: 8px;
            }

            .trade-preview {
                font-size: 0.85em;
                color: #aaa;
                margin-bottom: 8px;
            }

            .trade-btn {
                width: 100%;
                padding: 8px;
                background: linear-gradient(135deg, #4a9, #3a8);
                border: none;
                color: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            .trade-btn:hover { background: linear-gradient(135deg, #5ba, #4a9); }

            /* ✍️ Chat Input */
            .chat-input-area {
                border-top: 1px solid rgba(255,255,255,0.1);
                padding: 8px 12px;
            }

            .chat-input-row {
                display: flex;
                gap: 8px;
            }

            #people-chat-input {
                flex: 1;
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                color: #fff;
                border-radius: 4px;
            }
            #people-chat-input:focus {
                outline: none;
                border-color: rgba(255,215,0,0.4);
            }

            .send-btn {
                padding: 8px 16px;
                background: linear-gradient(135deg, #3a3a5a, #2a2a4a);
                border: 1px solid rgba(255,215,0,0.3);
                color: #ffd700;
                border-radius: 4px;
                cursor: pointer;
            }
            .send-btn:hover { background: linear-gradient(135deg, #4a4a6a, #3a3a5a); }

            .typing-indicator {
                color: #888;
                font-style: italic;
            }

            .people-empty {
                text-align: center;
                padding: 40px 20px;
                color: #888;
            }
            .empty-hint { font-size: 0.85em; color: #666; }
        `;
        document.head.appendChild(styles);
    },

    // setup event listeners
    setupEventListeners() {
        document.addEventListener('location-changed', (e) => {
            if (this.isOpen && this.viewMode === 'list') {
                this.refresh();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches(`[data-close-overlay="${this.panelId}"]`)) {
                this.close();
            }
            // handle panel button actions - no more inline onclick garbage
            if (e.target.matches('[data-action="back-to-list"]')) {
                this.showListView();
            }
            if (e.target.matches('[data-action="open-trade"]') || e.target.closest('[data-action="open-trade"]')) {
                console.log('🛒 Trade button clicked, currentNPC:', this.currentNPC);
                this.openFullTrade();
            }
            if (e.target.matches('[data-action="send-message"]')) {
                this.sendMessage();
            }
        });

        // listen for quest updates
        document.addEventListener('quest-assigned', () => {
            this.updateQuestItems();
            // critical: refresh npc list to update quest markers (! and ?) on portraits
            if (this.viewMode === 'list') {
                this.showListView(); // Rebuild cards with updated markers
            }
        });
        document.addEventListener('quest-completed', () => {
            this.updateQuestItems();
            // refresh stats bar and trade section to show updated reputation after quest reward
            if (this.currentNPC && this.viewMode === 'chat') {
                this.updateNPCStatsBar(this.currentNPC);
                this.updateTradeSection(this.currentNPC);
            }
            // critical: refresh npc list to update quest markers (! and ?) on portraits
            if (this.viewMode === 'list') {
                this.showListView(); // Rebuild cards with updated markers
            }
        });

        // FIX: Listen for quest-ready event to refresh quick actions when quest becomes completable
        // This ensures "Complete Quest" button appears immediately when objectives are done
        // Without this, player had to click "Progress" button before "Complete Quest" would appear
        document.addEventListener('quest-ready', (e) => {
            // If we're in chat view with an NPC, refresh the quick action buttons
            if (this.currentNPC && this.viewMode === 'chat') {
                console.log('📋 Quest ready - refreshing quick actions for', this.currentNPC.name || this.currentNPC.type);
                this.updateQuickActions(this.currentNPC);
                // Also update quest items display
                this.updateQuestItems();
            }
            // If in list view, update the NPC cards to show ? marker
            if (this.viewMode === 'list') {
                this.showListView();
            }
        });

        // listen for reputation changes to update stats bar and trade section in real-time
        document.addEventListener('npc-reputation-changed', (e) => {
            if (this.currentNPC && this.viewMode === 'chat') {
                const npcId = this.currentNPC.id || this.currentNPC.type;
                const npcType = this.currentNPC.type;
                // refresh if the changed npc matches by id, type, or contains the type
                if (e.detail.npcId === npcId || e.detail.npcId === npcType || e.detail.npcId.includes(npcType)) {
                    this.updateNPCStatsBar(this.currentNPC);
                    this.updateTradeSection(this.currentNPC);
                }
            }
        });

        // Listen for city reputation changes (from combat, crimes, etc)
        document.addEventListener('city-reputation-changed', (e) => {
            const currentLocationId = game?.currentLocation?.id;
            // Refresh trade section if we're at the affected city
            if (e.detail.cityId === currentLocationId && this.currentNPC && this.viewMode === 'chat') {
                this.updateNPCStatsBar(this.currentNPC);
                this.updateTradeSection(this.currentNPC);
            }
        });
    },

    // open panel
    open() {
        const panel = document.getElementById(this.panelId);
        if (!panel) {
            this.createPanelHTML();
            return this.open();
        }

        panel.classList.remove('hidden');
        this.isOpen = true;
        this.showListView();
        this.refresh();

        // Dispatch event for tutorial tracking
        document.dispatchEvent(new CustomEvent('panel-opened', {
            detail: { panelId: 'people-panel', action: 'open_people' }
        }));

        console.log('👥 PeoplePanel: Opened');
    },

    // close panel
    close() {
        const panel = document.getElementById(this.panelId);
        if (panel) {
            panel.classList.add('hidden');
        }
        this.isOpen = false;
        this.currentNPC = null;
        this.stopVoice();
        console.log('👥 PeoplePanel: Closed');
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    },

    // show list view
    showListView() {
        this.viewMode = 'list';
        document.getElementById('people-list-view')?.classList.remove('hidden');
        document.getElementById('people-chat-view')?.classList.add('hidden');
        this.currentNPC = null;
        this.stopVoice();
    },

    // show chat view
    showChatView(npcData) {
        this.viewMode = 'chat';
        this.currentNPC = npcData;
        this.chatHistory = [];

        document.getElementById('people-list-view')?.classList.add('hidden');
        document.getElementById('people-chat-view')?.classList.remove('hidden');

        // record npc meeting for quest availability
        const npcId = npcData.id || npcData.type;
        if (typeof NPCRelationshipSystem !== 'undefined' && npcId) {
            NPCRelationshipSystem.recordInteraction(npcId, 'conversation', { npcData });
        }

        this.updateChatHeader(npcData);
        this.updateNPCStatsBar(npcData);
        this.clearChatMessages();
        this.updateQuickActions(npcData);
        this.updateQuestItems();
        this.updateTradeSection(npcData);

        // FIX BUG #1 & #5: Scroll chat messages to TOP when opening
        const messagesContainer = document.getElementById('people-chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = 0;
        }

        // start conversation with greeting
        this.sendGreeting(npcData);

        // Focus input
        setTimeout(() => {
            document.getElementById('people-chat-input')?.focus();
        }, 100);
    },

    // refresh npc list
    refresh() {
        const locationContext = document.getElementById('people-location-context');
        const peopleList = document.getElementById('people-list');
        const emptyState = document.getElementById('people-empty');

        if (!peopleList) return;

        peopleList.innerHTML = '';

        const currentLocation = game?.currentLocation;
        const locationId = currentLocation?.id || null;

        // use doom-aware location name if doomworldsystem is active
        let locationName = currentLocation?.name || 'Unknown Location';
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive && DoomWorldSystem.getCurrentLocationName && locationId) {
            locationName = DoomWorldSystem.getCurrentLocationName(locationId);
        }

        if (locationContext) {
            locationContext.textContent = `📍 ${locationName}`;
        }

        // get npcs from gameworld's spawn system
        let npcs = [];
        if (typeof GameWorld !== 'undefined' && locationId) {
            npcs = GameWorld.getNPCDataForLocation(locationId) || [];
        }

        // fallback sources
        if (npcs.length === 0 && typeof NPCManager !== 'undefined' && locationId) {
            npcs = NPCManager.getAvailableNPCs(locationId) || [];
        }

        // add boatman npc if available at this location
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isBoatmanHere(locationId)) {
            const boatman = DoomWorldSystem.getBoatmanNPC();
            // don't add duplicate
            if (!npcs.find(n => n.id === 'boatman' || n.type === 'boatman')) {
                npcs.unshift(boatman); // Add at beginning for visibility
            }
        }

        if (npcs.length > 0) {
            emptyState?.classList.add('hidden');
            npcs.forEach(npc => {
                const card = this.createNPCCard(npc);
                peopleList.appendChild(card);
            });
        } else {
            emptyState?.classList.remove('hidden');
        }

        console.log(`👥 PeoplePanel: Showing ${npcs.length} NPCs at ${locationName}`);
    },

    // create npc card
    createNPCCard(npc) {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npcId = npc.id;

        const icon = this.getNPCIcon(npc.type || npc.id);
        // escape npc data for xss safety - never trust external data
        const name = this.escapeHtml(npc.name || this.formatNPCName(npc.id));
        const title = this.escapeHtml(npc.title || this.getNPCTitle(npc.type || npc.id));
        const description = this.escapeHtml(npc.description || this.getNPCDescription(npc.type || npc.id));

        // wow-style quest markers - check for quest status
        const npcTypeForQuest = npc.type || npc.id;
        console.log(`🎴 createNPCCard: NPC "${name}" (id: ${npc.id}, type: ${npc.type}, using: ${npcTypeForQuest})`);
        const questMarker = this.getQuestMarker(npcTypeForQuest);
        const hasDelivery = this.npcHasDeliveryForThem(npc.type || npc.id);
        // also check npc.canTrade for random encounters (smuggler, courier, pilgrim)
        const canTrade = this.npcCanTrade(npc.type || npc.id) || npc.canTrade;

        let badges = '';
        if (questMarker) {
            badges += `<span class="quest-badge ${questMarker.style}">${questMarker.marker}</span>`;
        }
        // trade badge removed - clutters the UI

        card.innerHTML = `
            <div class="npc-card-icon">${icon}${badges}</div>
            <div class="npc-card-info">
                <div class="npc-card-name">${name}${hasDelivery ? ' 📦' : ''}</div>
                <div class="npc-card-title">${title}</div>
                <div class="npc-card-description">${description}</div>
            </div>
            <div class="npc-card-actions">
                <button class="npc-talk-btn">🗨️ Talk</button>
            </div>
        `;

        card.querySelector('.npc-talk-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.talkTo(npc);
        });

        card.addEventListener('click', () => this.talkTo(npc));

        return card;
    },

    // talk to npc - opens chat view
    talkTo(npc) {
        let npcData = npc;

        // special handler: hooded stranger - offers initial quest if not accepted yet
        if ((npc.type === 'hooded_stranger' || npc.id?.includes('hooded_stranger')) &&
            typeof InitialEncounterSystem !== 'undefined' &&
            InitialEncounterSystem.needsInitialQuest?.()) {
            console.log('👥 PeoplePanel: Hooded Stranger clicked - showing quest offer!');
            this._showHoodedStrangerQuestOffer(npc);
            return;
        }

        // enrich with persona data if available
        if (typeof NPCPersonaDatabase !== 'undefined') {
            const persona = NPCPersonaDatabase.getPersona(npc.type || npc.id);
            if (persona) {
                npcData = { ...npc, ...persona, id: npc.id, type: npc.type };
            }
        }

        console.log(`👥 PeoplePanel: Starting conversation with ${npcData.name}`);
        this.showChatView(npcData);
    },

    // show the hooded stranger quest offer (for players who declined initially)
    _showHoodedStrangerQuestOffer(npc) {
        const playerName = typeof game !== 'undefined' ? game.player?.name : 'Traveler';
        const questOffer = InitialEncounterSystem.offerInitialQuestFromStranger?.();

        if (!questOffer?.canAcceptQuest) {
            // Quest already accepted - just show normal chat
            console.log('👥 PeoplePanel: Quest already accepted, showing normal chat');
            this.showChatView(npc);
            return;
        }

        // show special encounter with quest offer
        this.showSpecialEncounter(InitialEncounterSystem.mysteriousStranger, {
            introText: 'The hooded figure turns to face you, ancient eyes gleaming beneath the cowl...',
            greeting: questOffer.dialogue,
            disableChat: true,
            disableBack: false,
            customActions: [
                {
                    label: '✅ Accept Quest: First Steps',
                    action: () => {
                        console.log('🎭 Player accepted quest from Hooded Stranger (fallback)');
                        if (questOffer.onAccept) questOffer.onAccept();
                    },
                    primary: true,
                    questRelated: true,
                    closeAfter: true
                },
                {
                    label: '❓ Not yet...',
                    action: () => {
                        this.addChatMessage("*The stranger nods slowly* Very well... but do not delay too long. Darkness does not wait.", 'npc');
                    },
                    questRelated: false
                }
            ],
            onClose: () => {
                console.log('🎭 Hooded Stranger quest offer closed');
            }
        });
    },

    // update chat header
    updateChatHeader(npcData) {
        const icon = this.getNPCIcon(npcData.type || npcData.id);
        const name = npcData.name || this.formatNPCName(npcData.id);
        const title = npcData.title || this.getNPCTitle(npcData.type || npcData.id);

        document.getElementById('chat-npc-icon').textContent = icon;
        document.getElementById('chat-npc-name').textContent = name;
        document.getElementById('chat-npc-title').textContent = title;

        // update badges
        const badges = document.getElementById('chat-npc-badges');
        badges.innerHTML = '';

        // wow-style quest badges with proper tooltips
        const questMarker = this.getQuestMarker(npcData.type || npcData.id);
        if (questMarker) {
            if (questMarker.marker === '?') {
                // Quest to turn in or in progress
                const isComplete = questMarker.style.includes('complete');
                const isMain = questMarker.style.includes('main');
                const badgeClass = isComplete ? 'badge-quest-complete' : 'badge-quest-progress';
                const text = isComplete ? '? Turn In' : '? In Progress';
                const tooltip = isComplete
                    ? 'Quest ready to turn in! Talk to complete the quest.'
                    : 'Quest in progress. Check objectives in quest log.';
                badges.innerHTML += `<span class="badge ${badgeClass}" title="${tooltip}">${text}</span>`;
            } else {
                // Quest available
                const isMain = questMarker.style.includes('main');
                const badgeClass = isMain ? 'badge-quest-main' : 'badge-quest';
                const tooltip = isMain
                    ? 'Main story quest available! Talk to accept.'
                    : 'Side quest available. Talk to learn more.';
                badges.innerHTML += `<span class="badge ${badgeClass}" title="${tooltip}">! Quest</span>`;
            }
        }
        if (this.npcHasDeliveryForThem(npcData.type || npcData.id)) {
            badges.innerHTML += '<span class="badge badge-delivery" title="You have a delivery for this NPC. Complete the delivery quest!">📦 Delivery</span>';
        }
        // trade badge removed - clutters the UI, trade section at bottom shows availability
    },

    // update npc stats bar - horizontal relationship/trade stats
    updateNPCStatsBar(npcData) {
        const npcId = npcData.id || npcData.type;

        // get relationship data from npcrelationshipsystem
        let relationship = { level: 'neutral', reputation: 0 };
        let tradeStats = { timesTraded: 0, totalGoldTraded: 0 };

        if (typeof NPCRelationshipSystem !== 'undefined') {
            const rel = NPCRelationshipSystem.relationships?.[npcId];
            if (rel) {
                // getrelationshiplevel returns { key, icon, label, min, max } object
                const levelInfo = NPCRelationshipSystem.getRelationshipLevel(rel.reputation || 0);
                relationship = {
                    levelInfo: levelInfo,
                    reputation: rel.reputation || 0
                };
                tradeStats = {
                    timesTraded: rel.timesTraded || 0,
                    totalGoldTraded: rel.totalGoldTraded || 0
                };
            }
        }

        // get level info for icon and label - already retrieved from getrelationshiplevel
        const levelInfo = relationship.levelInfo;

        const icon = levelInfo?.icon || '😐';
        const label = levelInfo?.label || 'Neutral';

        // get the trade requirement for this npc type
        const npcType = npcData.type || npcData.id;
        const repRequired = this.getTradeRepRequirement(npcType);
        const canTrade = this.npcCanTrade(npcType) || npcData.canTrade;

        // Get NPC's available gold for trading
        // NPCTradeWindow manages NPC inventories and gold in _npcInventoryCache
        let npcGold = 0;
        if (typeof NPCTradeWindow !== 'undefined' && NPCTradeWindow.getNPCGold) {
            npcGold = NPCTradeWindow.getNPCGold(npcData);
        } else if (npcData.gold !== undefined) {
            npcGold = npcData.gold;
        } else if (npcData.inventory?.gold !== undefined) {
            npcGold = npcData.inventory.gold;
        }

        // update ui elements
        const relationIcon = document.getElementById('npc-relation-icon');
        const relationLabel = document.getElementById('npc-relation-label');
        const reputationValue = document.getElementById('npc-reputation-value');
        const repRequiredEl = document.getElementById('npc-rep-required');
        const tradesValue = document.getElementById('npc-trades-value');
        const npcGoldValue = document.getElementById('npc-gold-value');

        if (relationIcon) relationIcon.textContent = icon;
        if (relationLabel) relationLabel.textContent = label;
        if (reputationValue) {
            reputationValue.textContent = relationship.reputation;
            // color code: green if trade unlocked, yellow if close, red if far
            if (canTrade) {
                reputationValue.style.color = '#4a9';
            } else if (relationship.reputation >= repRequired * 0.5) {
                reputationValue.style.color = '#da4';
            } else {
                reputationValue.style.color = '#c66';
            }
        }
        if (repRequiredEl) {
            repRequiredEl.textContent = repRequired;
            // show requirement in muted color, or green if already met
            repRequiredEl.style.color = canTrade ? '#4a9' : '#888';
        }
        if (tradesValue) tradesValue.textContent = tradeStats.timesTraded;
        if (npcGoldValue) npcGoldValue.textContent = npcGold.toLocaleString();

        // Update dynamic tooltips on stat items
        const statsBar = document.getElementById('npc-stats-bar');
        if (statsBar) {
            const statItems = statsBar.querySelectorAll('.npc-stat-item');

            // Relationship tooltip
            if (statItems[0]) {
                const repRange = levelInfo ? `${levelInfo.min} to ${levelInfo.max}` : '0 to 100';
                statItems[0].title = `Relationship: ${label}\nYour standing with this NPC (${repRange} rep range)`;
            }

            // Reputation tooltip
            if (statItems[1]) {
                const repStatus = canTrade ? 'Trade unlocked!' : `Need ${repRequired - relationship.reputation} more rep to trade`;
                statItems[1].title = `Reputation: ${relationship.reputation} / ${repRequired} required\n${repStatus}`;
            }

            // Trades completed tooltip
            if (statItems[2]) {
                statItems[2].title = `Trades Completed: ${tradeStats.timesTraded}\nTotal successful trades with this NPC\nTotal gold traded: ${tradeStats.totalGoldTraded.toLocaleString()}g`;
            }

            // NPC Gold tooltip
            if (statItems[3]) {
                statItems[3].title = `NPC Gold: ${npcGold.toLocaleString()}g\nGold available for this NPC to trade with you`;
            }
        }
    },

    // send greeting - now uses npcinstructiontemplates for npc-specific greetings
    async sendGreeting(npcData) {
        // FIX BUG #1 & #5: Don't scroll for the initial "Approaching..." message
        this.addChatMessage('*Approaching...*', 'system', false);

        // generate greeting via api with standardized greeting action
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startConversation(npcData.id, npcData);

            try {
                // use greeting action type for proper npc-specific instructions
                const options = {
                    action: 'greeting',
                    availableQuests: this.getAvailableQuestsForNPC(),
                    activeQuests: this.getActiveQuestsForNPC(),
                    rumors: this.getRumors(),
                    nearbyLocations: this.getNearbyLocations()
                };

                console.log(`🎭 PeoplePanel: Sending greeting for ${npcData.type || npcData.id}`);

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    npcData,
                    '[GREETING]',
                    [],
                    options
                );

                if (!response || !response.text) {
                    throw new Error('Empty greeting response');
                }

                // FIX BUG #3: Remove "Approaching..." message once greeting arrives
                this.removeApproachingMessage();

                // FIX BUG #1 & #5: Don't scroll for initial greeting - keep at top
                this.addChatMessage(response.text, 'npc', false);
                this.chatHistory.push({ role: 'assistant', content: response.text });

                // play tts with npc-specific voice from templates
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.getNPCVoice(npcData);
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }
            } catch (e) {
                console.error('🖤 Greeting error:', e);
                // FIX BUG #3: Remove "Approaching..." even on error
                this.removeApproachingMessage();
                const fallback = this.getFallbackGreeting(npcData);
                // FIX BUG #1 & #5: Don't scroll for fallback greeting
                this.addChatMessage(fallback, 'npc', false);
                this.chatHistory.push({ role: 'assistant', content: fallback });
            }
        } else {
            // FIX BUG #3: Remove "Approaching..." for fallback greeting too
            this.removeApproachingMessage();
            const fallback = this.getFallbackGreeting(npcData);
            // FIX BUG #1 & #5: Don't scroll for fallback greeting
            this.addChatMessage(fallback, 'npc', false);
        }
    },

    getFallbackGreeting(npcData) {
        // Check for tutorial-specific dialogue first
        if (typeof TutorialNPCs !== 'undefined' && TutorialNPCs.getGreeting) {
            const tutorialGreeting = TutorialNPCs.getGreeting(npcData.id || npcData.type);
            if (tutorialGreeting) return tutorialGreeting;
        }

        // Get player name for personalized greetings
        const playerName = (typeof game !== 'undefined' && game.player?.name) ? game.player.name : 'Traveler';

        const greetings = {
            innkeeper: "Welcome, traveler! Looking for a room or perhaps some ale?",
            blacksmith: "*wipes sweat from brow* What can I forge for you today?",
            merchant: "Ah, a customer! Come see my wares, friend.",
            apothecary: "Greetings. Need potions? Remedies? I have what ails you.",
            guard: "Halt. State your business.",
            farmer: "Good day to you! Fresh produce for sale.",
            // Tutorial NPCs
            tutorial_merchant: "Welcome, new trader! I'm here to help you learn the basics of buying and selling.",
            tutorial_guide: "Greetings! I'm here to guide you through this training area. Ask me anything!",
            tutorial_trainer: "Ready to learn some combat basics? I'll teach you everything you need to survive out there.",
            // 🎭 Hooded Stranger - the mysterious prophet from initial encounter
            hooded_stranger: `So... the prophecy stirs. Another piece moves upon the board. Listen well, ${playerName}... Darkness gathers in the north. The Shadow Tower, long dormant, stirs once more. The wizard Malachar... he has returned. You are more than a simple trader, young one. Fate has brought you here for a reason. Seek out the village Elder here in Greendale. He will guide your first steps on this path.`,
            prophet: `Ah... another soul drawn to this land by fate's cruel hand. The winds spoke of your arrival, ${playerName}. Dark times approach, and you have a part to play in what is to come.`,
            default: "Hello there. What brings you here?"
        };
        return greetings[npcData.type] || greetings.default;
    },

    // send message
    async sendMessage() {
        if (this.isWaitingForResponse || !this.currentNPC) return;

        const input = document.getElementById('people-chat-input');
        const message = input?.value?.trim();
        if (!message) return;

        input.value = '';
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        this.isWaitingForResponse = true;
        this.addChatMessage('...', 'npc typing-indicator');

        try {
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                // include quest context so the ai knows what quests to offer/check/complete!
                const options = {
                    action: 'chat',  // Specify action for template system
                    availableQuests: this.getAvailableQuestsForNPC(),
                    activeQuests: this.getActiveQuestsForNPC(),
                    rumors: this.getRumors(),
                    nearbyLocations: this.getNearbyLocations()
                };

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    this.currentNPC,
                    message,
                    this.chatHistory,
                    options
                );

                // remove typing indicator
                const messages = document.getElementById('people-chat-messages');
                const typing = messages?.querySelector('.typing-indicator');
                if (typing) typing.remove();

                this.addChatMessage(response.text, 'npc');
                this.chatHistory.push({ role: 'assistant', content: response.text });

                // play tts with npc-specific voice
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.getNPCVoice(this.currentNPC);
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }

                // update quest items in case something changed
                this.updateQuestItems();
                // also update quick actions in case quest status changed
                this.updateQuickActions(this.currentNPC);
            }
        } catch (e) {
            // api error - npc gracefully deflects with in-character response
            console.error('🖤 Chat error:', e);
            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();
            this.addChatMessage("*seems distracted*", 'npc');
        }

        this.isWaitingForResponse = false;
    },

    // add chat message
    addChatMessage(text, type, scrollToBottom = true) {
        const container = document.getElementById('people-chat-messages');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `chat-message ${type}`;
        msg.textContent = text;
        container.appendChild(msg);

        // FIX BUG #1 & #5: Only scroll to bottom if explicitly requested
        // For initial greetings, we want to stay at top so users see the start of conversation
        if (scrollToBottom) {
            container.scrollTop = container.scrollHeight;
        }
    },

    clearChatMessages() {
        const container = document.getElementById('people-chat-messages');
        if (container) container.innerHTML = '';
    },

    // FIX BUG #3: Remove the "Approaching..." system message when greeting arrives
    removeApproachingMessage() {
        const container = document.getElementById('people-chat-messages');
        if (!container) return;

        // Find and remove any system message containing "Approaching..."
        const messages = container.querySelectorAll('.chat-message.system');
        messages.forEach(msg => {
            if (msg.textContent.includes('Approaching...')) {
                msg.remove();
            }
        });
    },

    // update quick actions
    updateQuickActions(npcData) {
        const container = document.getElementById('people-quick-actions');
        if (!container) return;

        const npcType = npcData.type || npcData.id;
        const npcName = npcData.name || npcType;
        const actions = [];
        const location = game?.currentLocation?.id;

        // quest actions - check what quests are available with this npc
        if (typeof QuestSystem !== 'undefined') {
            // turn in quest - player has completed quest objectives, npc is the giver
            const readyToComplete = this.getQuestsReadyToComplete(npcType);
            if (readyToComplete.length > 0) {
                readyToComplete.forEach(quest => {
                    const label = quest.type === 'delivery' ? '📦 Complete Delivery' :
                                  quest.type === 'collect' ? '🎒 Turn In Items' :
                                  '✅ Complete Quest';
                    actions.push({
                        label: `${label}: ${quest.name}`,
                        action: () => this.askToCompleteQuest(quest),
                        priority: 1, // High priority - show first
                        questRelated: true
                    });
                });
            }

            // delivery - player has delivery for this npc (different from completing at quest giver)
            const deliveriesForNPC = this.getDeliveriesForNPC(npcType);
            if (deliveriesForNPC.length > 0) {
                deliveriesForNPC.forEach(quest => {
                    actions.push({
                        label: `📦 Deliver: ${quest.itemName || 'Package'}`,
                        action: () => this.deliverQuestItem(quest),
                        priority: 2,
                        questRelated: true
                    });
                });
            }

            // start quest - npc has quests to offer
            const availableQuests = QuestSystem.getQuestsForNPC(npcType, location);
            if (availableQuests.length > 0) {
                availableQuests.forEach(quest => {
                    actions.push({
                        label: `📜 Ask about: ${quest.name}`,
                        action: () => this.askAboutQuest(quest),
                        priority: 3,
                        questRelated: true
                    });
                });
            }

            // complete talk objective - player needs to talk to this npc for quest progress
            // critical: only show if all previous objectives are complete!
            const allActiveQuests = Object.values(QuestSystem.activeQuests || {});
            allActiveQuests.forEach(quest => {
                const talkObjectiveIndex = quest.objectives?.findIndex(o =>
                    o.type === 'talk' &&
                    !o.completed &&
                    o.npc === npcType &&
                    (!o.location || o.location === location || o.location === 'any')
                );

                if (talkObjectiveIndex >= 0) {
                    const talkObjective = quest.objectives[talkObjectiveIndex];

                    // check if all previous objectives are complete
                    let previousObjectivesComplete = true;
                    for (let i = 0; i < talkObjectiveIndex; i++) {
                        const prevObj = quest.objectives[i];
                        // Check completion based on objective type
                        if (prevObj.type === 'collect' || prevObj.type === 'buy' || prevObj.type === 'sell' || prevObj.type === 'trade' || prevObj.type === 'defeat') {
                            if ((prevObj.current || 0) < prevObj.count) {
                                previousObjectivesComplete = false;
                                break;
                            }
                        } else if (prevObj.type === 'visit' || prevObj.type === 'talk' || prevObj.type === 'explore' ||
                                   prevObj.type === 'investigate' || prevObj.type === 'ui_action' ||
                                   prevObj.type === 'combat_action' || prevObj.type === 'consume' || prevObj.type === 'travel') {
                            // Boolean-completed objectives - check .completed flag
                            if (!prevObj.completed) {
                                previousObjectivesComplete = false;
                                break;
                            }
                        } else if (prevObj.type === 'gold') {
                            if (!prevObj.completed) {
                                previousObjectivesComplete = false;
                                break;
                            }
                        } else {
                            // Unknown type - use fallback check (same as completeTalkObjective)
                            const isComplete = prevObj.completed || (prevObj.current !== undefined && prevObj.current >= (prevObj.count || 1));
                            if (!isComplete) {
                                previousObjectivesComplete = false;
                                break;
                            }
                        }
                    }

                    // Show talk button, but disable it if previous objectives aren't done
                    actions.push({
                        label: `💬 ${talkObjective.description || 'Talk about quest'}`,
                        action: previousObjectivesComplete
                            ? () => this.completeTalkObjective(quest, talkObjective)
                            : null, // No action if locked
                        priority: 1.5, // High priority - between turn-in and other actions
                        questRelated: true,
                        disabled: !previousObjectivesComplete,
                        lockedReason: !previousObjectivesComplete ? 'Complete previous objectives first' : null
                    });
                }
            });

            // check progress - player has active quests from this npc
            // show individual buttons for each quest, not one generic button!
            const activeFromNPC = QuestSystem.getActiveQuestsForNPC(npcType, location);
            const inProgress = activeFromNPC.filter(q => {
                const progress = QuestSystem.checkProgress(q.id);
                return progress.status === 'in_progress';
            });
            if (inProgress.length > 0) {
                inProgress.forEach(quest => {
                    // don't show progress button if there's already a talk objective button for this quest
                    const hasTalkButton = actions.some(a =>
                        a.questRelated && a.label.includes(quest.name) && a.label.startsWith('💬')
                    );
                    if (!hasTalkButton) {
                        actions.push({
                            label: `⏳ Progress: ${quest.name}`,
                            action: () => this.askQuestProgressSpecific(quest),
                            priority: 4,
                            questRelated: true
                        });
                    }
                });
            }
        }

        // trade-related actions - vendors and service npcs
        if (this.npcCanTrade(npcType) || npcData.canTrade) {
            actions.push({ label: '💰 Browse wares', action: () => this.askAboutWares(), priority: 10 });

            // "open market" button only at royal capital with merchant npc
            // This opens the grand city market, not the NPC's personal inventory
            const currentLocationId = game?.currentLocation?.id;
            if (currentLocationId === 'royal_capital' && npcType === 'merchant') {
                actions.push({ label: '🏛️ Open Grand Market', action: () => this.openGrandMarket(), priority: 11 });
            }
        }

        // rumors - innkeepers, travelers, merchants know gossip
        const gossipNPCs = ['innkeeper', 'merchant', 'traveler', 'drunk', 'sailor', 'informant'];
        if (gossipNPCs.includes(npcType)) {
            actions.push({ label: '🗣️ Ask for rumors', action: () => this.askRumors(), priority: 20 });
        }

        // rest action - innkeeper only
        if (npcType === 'innkeeper') {
            actions.push({ label: '🛏️ I need rest', action: () => this.askForRest(), priority: 21 });
        }

        // heal action - healers only
        if (['healer', 'priest', 'apothecary'].includes(npcType)) {
            actions.push({ label: '💚 I need healing', action: () => this.askForHealing(), priority: 22 });
        }

        // gatehouse payment - guards at gatehouses can accept passage fees
        if (npcType === 'guard' && typeof GatehouseSystem !== 'undefined') {
            const gatehouse = GatehouseSystem.GATEHOUSES[location];
            if (gatehouse && !GatehouseSystem.isGatehouseUnlocked(location)) {
                const canAfford = (game?.player?.gold || 0) >= gatehouse.fee;
                actions.push({
                    label: `🏰 Pay Passage Fee (${gatehouse.fee}g)`,
                    action: () => this.payGatehouseFee(location, gatehouse),
                    priority: 0, // Highest priority - this is what they're here for
                    questRelated: true,
                    disabled: !canAfford
                });
            }
        }

        // boatman portal action - special case for doom world access
        if (npcType === 'boatman') {
            const inDoom = typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive;
            if (inDoom) {
                actions.push({
                    label: '🌅 Return to Normal World',
                    action: () => this.useBoatmanPortal('normal'),
                    priority: 0, // Highest priority
                    questRelated: true
                });
            } else {
                actions.push({
                    label: '💀 Enter the Doom World',
                    action: () => this.useBoatmanPortal('doom'),
                    priority: 0, // Highest priority
                    questRelated: true
                });
            }
            actions.push({ label: '🔮 Ask about the other world', action: () => this.askAboutDoomWorld(), priority: 1 });
        }

        // encounter-specific actions - give gold, attack, etc.
        // These show for ALL NPCs as interaction options
        const isEncounter = npcData.isEncounter || this._isSpecialEncounter;

        // get npc category for smarter button placement
        const npcCategory = this._getNPCCategory(npcType);

        // category-specific actions - different npcs have different interaction buttons

        // authority npcs - guards, elders, nobles
        if (npcCategory === 'authority') {
            actions.push({ label: '📜 Ask about the law', action: () => this.askAboutLaw(), priority: 25 });
            if (npcType === 'elder' || npcType === 'chieftain') {
                actions.push({ label: '🙏 Ask for blessing', action: () => this.askForBlessing(), priority: 26 });
            }
        }

        // criminal npcs - thieves, bandits, informants
        if (npcCategory === 'criminal') {
            if (npcType === 'informant') {
                actions.push({ label: '👂 Buy information', action: () => this.askBuyInformation(), priority: 25 });
            }
            if (npcType === 'smuggler') {
                actions.push({ label: '📦 Ask about contraband', action: () => this.askAboutContraband(), priority: 25 });
            }
            if (npcType === 'loan_shark') {
                actions.push({ label: '💸 Ask for a loan', action: () => this.askForLoan(), priority: 25 });
            }
            // Criminals appreciate gifts (bribery)
            actions.push({
                label: '💰 Offer Bribe',
                action: () => this.giveGoldToNPC(),
                priority: 30
            });
        } else {
            // give gold - charity for non-criminals
            actions.push({
                label: '💰 Give Gold',
                action: () => this.giveGoldToNPC(),
                priority: 30
            });
        }

        // give item - gift an item from inventory (available to all)
        actions.push({
            label: '🎁 Give Item',
            action: () => this.giveItemToNPC(),
            priority: 31
        });

        // boss npcs - show intimidate option if brave
        if (npcCategory === 'boss') {
            actions.push({
                label: '😤 Intimidate',
                action: () => this.attemptIntimidate(),
                priority: 28
            });
        }

        // traveler npcs - travelers, pilgrims, beggars
        if (npcCategory === 'traveler') {
            if (npcType === 'beggar') {
                actions.push({ label: '🪙 Give alms', action: () => this.giveGoldToNPC(), priority: 25 });
            }
            if (npcType === 'traveler' || npcType === 'pilgrim') {
                actions.push({ label: '🗺️ Ask about travels', action: () => this.askAboutTravels(), priority: 26 });
            }
        }

        // attack - violence is always an option (but has consequences)
        // Protected NPCs: mystical (boatman), authority (guards/nobles) unless encounter
        // Quest NPCs: NEVER attackable unless quest requires defeating them
        const unattackableNPCs = ['noble', 'king', 'queen', 'boatman', 'ferryman'];
        const canAttackResult = this.canAttackNPC(npcType, location);

        if (canAttackResult.allowed) {
            // Attack allowed - show button with quest context if applicable
            const attackLabel = canAttackResult.isQuestTarget
                ? '⚔️ Attack (Quest)'
                : '⚔️ Attack';
            actions.push({
                label: attackLabel,
                action: () => this.attackNPC(canAttackResult),
                priority: 80,
                questRelated: canAttackResult.isQuestTarget
            });
        } else if (canAttackResult.reason === 'protected') {
            // Show disabled attack for protected NPCs (guards in normal context)
            if (isEncounter) {
                // Encounters override protection
                actions.push({
                    label: '⚔️ Attack',
                    action: () => this.attackNPC({ allowed: true, reason: 'encounter' }),
                    priority: 80
                });
            }
        }
        // Quest NPCs with reason 'quest_npc' get NO attack option at all

        // rob/pickpocket - for the morally flexible (not from authority or bosses)
        if (['merchant', 'traveler', 'noble', 'pilgrim', 'beggar', 'drunk'].includes(npcType)) {
            actions.push({
                label: '🗡️ Pickpocket',
                action: () => this.pickpocketNPC(),
                priority: 81
            });
        }

        // flee - get the fuck out (encounters and criminals only)
        if (isEncounter || npcCategory === 'criminal' || npcCategory === 'boss') {
            actions.push({
                label: '🏃 Flee',
                action: () => this.fleeFromEncounter(),
                priority: 90
            });
        }

        // generic actions - always available
        actions.push({ label: '❓ Ask for directions', action: () => this.askDirections(), priority: 50 });
        actions.push({ label: '👋 Say goodbye', action: () => this.sayGoodbye(), priority: 100 });

        // sort by priority (quest actions first)
        actions.sort((a, b) => (a.priority || 50) - (b.priority || 50));

        container.innerHTML = '';
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            if (a.questRelated) btn.classList.add('quest-action-btn');
            if (a.disabled) {
                btn.classList.add('disabled');
                btn.disabled = true;
                if (a.lockedReason) btn.title = a.lockedReason;
            }
            btn.textContent = a.label;
            if (a.action) {
                btn.addEventListener('click', a.action);
            }
            container.appendChild(btn);
        });

        container.classList.remove('hidden');
    },

    // get quests ready to complete - where this npc is the quest giver or turn-in target
    getQuestsReadyToComplete(npcType) {
        if (typeof QuestSystem === 'undefined') return [];

        const location = game?.currentLocation?.id;
        console.log(`  📋 getQuestsReadyToComplete('${npcType}') at '${location}'`);

        // get quests where this npc is the giver
        const activeFromNPC = QuestSystem.getActiveQuestsForNPC(npcType, location);
        console.log(`    activeFromNPC:`, activeFromNPC.map(q => `${q.id} (giver:${q.giver})`));

        // also get quests where this npc is the turn-in target (might be different from giver!)
        const allActive = Object.values(QuestSystem.activeQuests || {});
        console.log(`    allActive:`, allActive.map(q => `${q.id} (turnIn:${q.turnInNpc}, loc:${q.turnInLocation})`))

        const turnInQuests = allActive.filter(q => {
            // fix: more precise matching for turn-in npcs
            // Check if turnInNpc EXACTLY matches (use strict comparison)
            const turnInMatches = q.turnInNpc && q.turnInNpc === npcType;
            // Check if final talk objective EXACTLY targets this NPC type AND location
            const talkObj = q.objectives?.find(o => o.type === 'talk' && !o.completed);
            const talkNpcMatches = talkObj && talkObj.npc === npcType;
            const talkLocationMatches = !talkObj || !talkObj.location || talkObj.location === location || talkObj.location === 'any';
            const talkMatches = talkNpcMatches && talkLocationMatches;
            // location check: ensure turn-in is at this location
            const locationMatches = !location || !q.turnInLocation || q.turnInLocation === location || q.turnInLocation === 'any';

            return (turnInMatches || talkMatches) && locationMatches;
        });
        console.log(`    turnInQuests:`, turnInQuests.map(q => q.id));

        // combine and dedupe
        const combined = [...activeFromNPC, ...turnInQuests];
        const uniqueQuests = [...new Map(combined.map(q => [q.id, q])).values()];
        console.log(`    uniqueQuests (before ready filter):`, uniqueQuests.map(q => q.id));

        const result = uniqueQuests.filter(q => {
            const progress = QuestSystem.checkProgress(q.id);
            console.log(`    ${q.id} progress:`, progress.status, 'objectives:', q.objectives?.map(o => `${o.type}:${o.completed}`));

            // BUG FIX #6: Only show "Complete Quest" button when ALL objectives are done
            // Previously allowed completion if only final "talk" objective remained incomplete
            // This caused quests like "First Steps" to be completable before all objectives done
            // standard check - all objectives complete
            if (progress.status === 'ready_to_complete') return true;

            // REMOVED: Special case for final talk objectives
            // The old logic treated "talk to NPC" as the completion action itself,
            // showing the Complete Quest button before the talk objective was done.
            // This was confusing - players expect ALL objectives to be complete before
            // being able to finish a quest.

            return false;
        });
        console.log(`    FINAL result:`, result.map(q => `${q.id} (status: ${QuestSystem.checkProgress(q.id).status})`));
        return result;
    },

    // get deliveries for npc - where this npc is the recipient (not the giver)
    getDeliveriesForNPC(npcType) {
        if (typeof QuestSystem === 'undefined') return [];
        const deliveries = [];
        Object.values(QuestSystem.activeQuests || {}).forEach(quest => {
            // Find talk objectives targeting this NPC that aren't completed
            const talkObj = quest.objectives?.find(o =>
                o.type === 'talk' &&
                QuestSystem._npcMatchesObjective(npcType, o.npc) &&
                !o.completed
            );
            if (talkObj && quest.givesQuestItem) {
                const itemInfo = QuestSystem.questItems?.[quest.givesQuestItem] || {};
                // Check if player has the quest item
                const hasItem = game?.player?.questItems?.[quest.givesQuestItem];
                if (hasItem) {
                    deliveries.push({
                        ...quest,
                        itemId: quest.givesQuestItem,
                        itemName: itemInfo.name || quest.givesQuestItem,
                        itemIcon: itemInfo.icon || '📦'
                    });
                }
            }
        });
        return deliveries;
    },

    // ask about quest - prompt npc to offer this quest
    // fixed: directly assign the quest, api is just for flavor text!
    async askAboutQuest(quest) {
        const questId = quest.id || quest.questId;

        // display player message
        const message = `I heard you might have work available? Tell me about "${quest.name}".`;
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // critical: directly assign the quest - don't wait for api!
        let assignResult = null;
        if (typeof QuestSystem !== 'undefined' && QuestSystem.assignQuest) {
            assignResult = QuestSystem.assignQuest(questId, { name: this.currentNPC?.name || 'NPC' });
            console.log(`🎭 Quest assignment result for ${questId}:`, assignResult);
        }

        // generate npc response (flavor text only - quest already assigned!)
        let npcResponse;

        if (assignResult?.success) {
            // Quest assigned successfully!
            npcResponse = `*nods thoughtfully* "${quest.name}" - yes, I have need of your help. `;
            npcResponse += quest.description || 'Complete the objectives and return to me.';
            npcResponse += ` The reward is ${quest.rewards?.gold || 0} gold.`;
        } else if (assignResult?.error === 'Quest already active') {
            npcResponse = `*raises eyebrow* You already accepted this task. Focus on completing it first.`;
        } else if (assignResult?.error === 'Quest already completed') {
            npcResponse = `*smiles* You've already done this work. Thank you again for your help.`;
        } else {
            npcResponse = `*shakes head* I don't have that work available right now.`;
        }

        this.addChatMessage(npcResponse, 'npc');
        this.chatHistory.push({ role: 'assistant', content: npcResponse });

        // play tts
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // ask to complete quest - tell npc we've finished the fucking quest
    async askToCompleteQuest(quest) {
        const questId = quest.id || quest.questId;

        // display player message
        let message;
        if (quest.type === 'delivery') {
            message = `I've completed the delivery you asked for. The "${quest.name}" task is done.`;
        } else if (quest.type === 'collect') {
            const collectObj = quest.objectives?.find(o => o.type === 'collect');
            message = `I've gathered everything you asked for. Here's the ${collectObj?.count || ''} ${collectObj?.item || 'items'}.`;
        } else {
            message = `I've completed "${quest.name}" as you requested. The task is done.`;
        }

        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // critical: directly complete the quest - don't wait for api!
        let completionResult = null;
        if (typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
            completionResult = QuestSystem.completeQuest(questId);
            console.log(`🎭 Quest completion result for ${questId}:`, completionResult);
        }

        // generate NPC response - TRY API first for dynamic dialogue, fallback to hardcoded
        const npcType = this.currentNPC?.type || 'stranger';
        let npcResponse;

        // FIX: Try API-generated response for richer dialogue
        if (completionResult?.success && typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.generateNPCResponse) {
            try {
                const rewards = completionResult.rewards || quest.rewards || {};
                const questContext = {
                    questId: questId,
                    questName: quest.name,
                    questType: quest.type,
                    rewards: rewards,
                    completionStatus: 'completed'
                };

                const options = {
                    action: 'COMPLETE_QUEST',
                    questContext: questContext,
                    availableQuests: this.getAvailableQuestsForNPC(),
                    activeQuests: this.getActiveQuestsForNPC()
                };

                // Show typing indicator
                this.showTypingIndicator();

                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    this.currentNPC,
                    `I've completed "${quest.name}" for you.`,
                    this.chatHistory,
                    options
                );

                // Remove typing indicator
                const messages = document.getElementById('people-chat-messages');
                const typing = messages?.querySelector('.typing-indicator');
                if (typing) typing.remove();

                if (response?.text) {
                    // Parse commands from API response
                    let cleanText = response.text;
                    if (typeof NPCWorkflowSystem !== 'undefined' && NPCWorkflowSystem.parseCommands) {
                        const parseResult = NPCWorkflowSystem.parseCommands(response.text);
                        cleanText = parseResult.cleanText;
                    }
                    npcResponse = cleanText;
                    console.log(`🎭 API-generated quest completion response for ${questId}`);
                }
            } catch (e) {
                console.warn(`🎭 API quest completion response failed, using fallback:`, e.message);
                // Fall through to hardcoded response below
            }
        }

        // Fallback: hardcoded responses if API unavailable or failed
        if (!npcResponse) {
            if (completionResult?.success) {
                const rewards = completionResult.rewards || quest.rewards || {};
                npcResponse = `*smiles warmly* Well done! You've completed "${quest.name}". `;
                if (rewards.gold) npcResponse += `Here's ${rewards.gold} gold for your trouble. `;
                if (rewards.experience) npcResponse += `You've gained valuable experience. `;
                npcResponse += `Thank you for your help!`;
            } else if (completionResult?.error === 'Objectives not complete') {
                npcResponse = `*shakes head* You haven't finished all the objectives yet. Check your quest log.`;
            } else if (completionResult?.error === 'missing_collection_items') {
                npcResponse = `*looks at your hands* You don't have the items I need. Come back when you have them.`;
            } else {
                npcResponse = `*looks confused* I'm not sure what you mean. Do you have a quest to turn in?`;
            }
        }

        this.addChatMessage(npcResponse, 'npc');
        this.chatHistory.push({ role: 'assistant', content: npcResponse });

        // play tts
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // complete talk objective - player talks to npc for mid-quest progression
    async completeTalkObjective(quest, talkObjective) {
        const questId = quest.id || quest.questId;
        const npcType = this.currentNPC?.type || 'stranger';

        // validate: check that all previous objectives are complete!
        const talkObjectiveIndex = quest.objectives?.indexOf(talkObjective) || 0;
        for (let i = 0; i < talkObjectiveIndex; i++) {
            const prevObj = quest.objectives[i];
            let isComplete = false;

            // Count-based objectives
            if (prevObj.type === 'collect' || prevObj.type === 'buy' || prevObj.type === 'sell' || prevObj.type === 'trade' || prevObj.type === 'defeat') {
                isComplete = (prevObj.current || 0) >= (prevObj.count || 1);
            }
            // Boolean-completed objectives (including ui_action, combat_action, consume for tutorials!)
            else if (prevObj.type === 'visit' || prevObj.type === 'talk' || prevObj.type === 'explore' ||
                     prevObj.type === 'investigate' || prevObj.type === 'gold' || prevObj.type === 'ui_action' ||
                     prevObj.type === 'combat_action' || prevObj.type === 'consume' || prevObj.type === 'travel') {
                isComplete = prevObj.completed || false;
            }
            // Unknown type - assume completed if marked
            else {
                isComplete = prevObj.completed || (prevObj.current !== undefined && prevObj.current >= (prevObj.count || 1));
            }

            if (!isComplete) {
                // Previous objective not complete - can't proceed!
                const errorMsg = `*shakes head* You haven't completed the previous tasks yet. Come back when you've finished them.`;
                this.addChatMessage(errorMsg, 'npc');
                this.chatHistory.push({ role: 'assistant', content: errorMsg });
                if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.getNPCVoice(this.currentNPC);
                    NPCVoiceChatSystem.playVoice(errorMsg, voice);
                }
                return;
            }
        }

        // display player message
        const message = talkObjective.description || `I need to talk to you about "${quest.name}".`;
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // critical: complete the talk objective using questsystem
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateProgress('talk', { npc: npcType, npcType: npcType });
            console.log(`💬 Completed talk objective for ${questId} with ${npcType}`);
        }

        // generate NPC response
        const questName = quest.name || 'the task';
        const itemName = talkObjective.givesItem
            ? (QuestSystem.questItems?.[talkObjective.givesItem]?.name || talkObjective.givesItem.replace(/_/g, ' '))
            : null;

        let npcResponse = `*nods thoughtfully* Ah, about "${questName}". `;

        if (itemName) {
            npcResponse += `Here, take this - you'll need it. *hands you ${itemName}* `;
        }

        // Use quest dialogue if available
        if (quest.dialogue?.progress) {
            npcResponse += quest.dialogue.progress;
        } else {
            npcResponse += `Continue with your task. You're doing well.`;
        }

        this.addChatMessage(npcResponse, 'npc');
        this.chatHistory.push({ role: 'assistant', content: npcResponse });

        // play tts
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // deliver quest item - hand over delivery and complete the damn quest
    async deliverQuestItem(quest) {
        const questId = quest.questId || quest.id;
        const itemId = quest.itemId;
        const itemName = quest.itemName || itemId;

        // display player message
        const message = `I have a delivery for you - a ${itemName} from ${quest.giverName || 'someone'}.`;
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // critical: take the quest item and complete the quest!
        let deliverySuccess = false;

        // Take the quest item
        if (itemId && game?.player?.questItems?.[itemId]) {
            delete game.player.questItems[itemId];
            deliverySuccess = true;
        }

        // Complete the delivery quest
        let completionResult = null;
        if (deliverySuccess && typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
            completionResult = QuestSystem.completeQuest(questId);
            console.log(`🎭 Delivery quest completion result for ${questId}:`, completionResult);
        }

        // 🖤 Generate NPC response
        let npcResponse;

        if (completionResult?.success) {
            npcResponse = `*accepts the ${itemName}* Ah, this is exactly what I was expecting! Thank you for the delivery. `;
            const rewards = completionResult.rewards || quest.rewards || {};
            if (rewards.gold) npcResponse += `Here's ${rewards.gold} gold for your trouble.`;
        } else if (!deliverySuccess) {
            npcResponse = `*looks confused* You don't seem to have the ${itemName} with you.`;
        } else {
            npcResponse = `*examines the item* Thank you for bringing this.`;
        }

        this.addChatMessage(npcResponse, 'npc');
        this.chatHistory.push({ role: 'assistant', content: npcResponse });

        // play tts
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // ask quest progress - check status of active quests (generic)
    async askQuestProgress() {
        const message = `How am I doing on the tasks you gave me?`;
        await this.sendQuestActionMessage('CHECK_PROGRESS', message, null);
    },

    // ask quest progress specific - check status of a specific quest
    async askQuestProgressSpecific(quest) {
        const message = `What's the status on "${quest.name}"? How am I doing?`;

        this._currentQuestAction = {
            type: 'CHECK_PROGRESS',
            quest: quest,
            questId: quest.id,
            questName: quest.name
        };

        await this.sendQuestActionMessage('CHECK_PROGRESS', message, quest);
    },

    // new: send quest-specific action message with full quest context
    async sendQuestActionMessage(actionType, displayMessage, quest) {
        if (this.isWaitingForResponse || !this.currentNPC) return;

        this.addChatMessage(displayMessage, 'player');
        this.chatHistory.push({ role: 'user', content: displayMessage });

        this.isWaitingForResponse = true;
        this.addChatMessage('...', 'npc typing-indicator');

        try {
            if (typeof NPCVoiceChatSystem === 'undefined') {
                throw new Error('NPCVoiceChatSystem not available');
            }

            // build quest-specific context for api instructions
            const questContext = quest ? {
                questId: quest.id || quest.questId,
                questName: quest.name || quest.questName,
                questType: quest.type || quest.questType,
                rewards: quest.rewards,
                objectives: quest.objectives,
                itemName: quest.itemName,
                giverName: quest.giverName
            } : null;

            // get progress info if checking progress
            let progressInfo = null;
            if (actionType === 'CHECK_PROGRESS' && quest && typeof QuestSystem !== 'undefined') {
                progressInfo = QuestSystem.checkProgress(quest.id);
            }

            const options = {
                action: actionType,
                questAction: this._currentQuestAction,
                questContext: questContext,
                progressInfo: progressInfo,
                availableQuests: this.getAvailableQuestsForNPC(),
                activeQuests: this.getActiveQuestsForNPC()
            };

            console.log(`🎭 PeoplePanel: Sending ${actionType} quest action for ${this.currentNPC.type || this.currentNPC.id}`);
            console.log('🎭 Quest context:', questContext);

            const response = await NPCVoiceChatSystem.generateNPCResponse(
                this.currentNPC,
                displayMessage,
                this.chatHistory,
                options
            );

            // remove typing indicator
            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            if (!response || !response.text) {
                throw new Error('Empty response from API');
            }

            // critical: parse and execute commands from api response!
            // The API returns {completeQuest:questId} etc. that need to be executed
            let cleanText = response.text;
            if (typeof NPCWorkflowSystem !== 'undefined' && NPCWorkflowSystem.parseCommands) {
                const parseResult = NPCWorkflowSystem.parseCommands(response.text);
                cleanText = parseResult.cleanText;
                if (parseResult.commands && parseResult.commands.length > 0) {
                    console.log('🎭 Executing commands from API response:', parseResult.commands.map(c => c.command).join(', '));
                    NPCWorkflowSystem.executeCommands(parseResult.commands, { npc: this.currentNPC });
                }
            }

            this.addChatMessage(cleanText, 'npc');
            this.chatHistory.push({ role: 'assistant', content: cleanText });

            // play tts with NPC-specific voice (use clean text without commands)
            if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                const voice = this.getNPCVoice(this.currentNPC);
                NPCVoiceChatSystem.playVoice(cleanText, voice);
            }

            // update quest items and quick actions in case quest state changed
            this.updateQuestItems();
            this.updateQuickActions(this.currentNPC);

        } catch (e) {
            console.error('🖤 Quest action message error:', e);

            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            // use quest-specific fallback responses
            const fallback = this.getQuestActionFallback(actionType, quest);
            this.addChatMessage(fallback, 'npc');
            this.chatHistory.push({ role: 'assistant', content: fallback });

            // critical: actually execute the quest action even in fallback!
            // If API fails but user clicked "Complete Quest", we should still complete it
            this.executeQuestActionFallback(actionType, quest);
        }

        this.isWaitingForResponse = false;
        this._currentQuestAction = null;

        // update ui after quest action
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // execute quest action when api fails - the fallback must work!
    executeQuestActionFallback(actionType, quest) {
        if (!quest) return;

        const questId = quest.id || quest.questId;
        console.log(`🎭 Executing fallback quest action: ${actionType} for ${questId}`);

        switch (actionType) {
            case 'TURN_IN_QUEST':
                // Complete the quest - give rewards
                if (typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
                    const result = QuestSystem.completeQuest(questId);
                    if (result?.success) {
                        console.log(`✅ Quest ${questId} completed via fallback`);
                        if (typeof addMessage === 'function') {
                            addMessage(`🎉 Quest "${quest.name}" completed! Rewards received.`, 'success');
                        }
                    } else {
                        console.warn(`❌ Failed to complete quest ${questId}:`, result?.error);
                    }
                }
                break;

            case 'OFFER_QUEST':
                // Start the quest
                if (typeof QuestSystem !== 'undefined' && QuestSystem.assignQuest) {
                    const result = QuestSystem.assignQuest(questId, { name: this.currentNPC?.name || 'NPC' });
                    if (result?.success) {
                        console.log(`✅ Quest ${questId} started via fallback`);
                        if (typeof addMessage === 'function') {
                            addMessage(`📜 Quest "${quest.name}" accepted!`, 'success');
                        }
                    }
                }
                break;

            case 'DELIVER_ITEM':
                // Take the quest item and complete
                if (quest.itemId && typeof QuestSystem !== 'undefined') {
                    // Take the quest item
                    if (game?.player?.questItems?.[quest.itemId]) {
                        delete game.player.questItems[quest.itemId];
                    }
                    // Complete the delivery quest
                    if (QuestSystem.completeQuest) {
                        QuestSystem.completeQuest(questId);
                    }
                }
                break;

            case 'CHECK_PROGRESS':
                // Just checking progress - no action needed, fallback message is enough
                break;
        }
    },

    // get fallback response for quest actions
    getQuestActionFallback(actionType, quest) {
        const questName = quest?.name || quest?.questName || 'the task';

        // check_progress: check actual quest status to give accurate fallback
        if (actionType === 'CHECK_PROGRESS' && quest?.id && typeof QuestSystem !== 'undefined') {
            const progress = QuestSystem.checkProgress(quest.id);
            if (progress.status === 'ready_to_complete') {
                return `*eyes widen* "${questName}" is complete! You've done it! Come, let me reward you for your efforts.`;
            } else if (progress.status === 'completed') {
                return `*nods* You already completed "${questName}". Well done, that task is behind you.`;
            } else if (progress.progress) {
                return `*considers* You're at ${progress.progress} on "${questName}". ${progress.progress === '0/1' ? 'Just getting started.' : 'Keep at it!'}`;
            }
        }

        const fallbacks = {
            OFFER_QUEST: `*nods thoughtfully* Yes, I have work for you. "${questName}" - are you interested?`,
            TURN_IN_QUEST: `*examines your work* Well done with "${questName}". You've earned your reward.`,
            DELIVER_ITEM: `*accepts the delivery* Thank you for bringing this. The sender will be pleased.`,
            CHECK_PROGRESS: `*considers* You're making progress on "${questName}". Keep at it.`
        };
        return fallbacks[actionType] || `*nods* I understand.`;
    },

    // update quest items section
    updateQuestItems() {
        const container = document.getElementById('people-quest-items');
        const list = document.getElementById('quest-items-list');
        if (!container || !list || !this.currentNPC) return;

        list.innerHTML = '';

        // get player's quest items
        const questItems = game?.player?.questItems || {};
        const npcType = this.currentNPC.type || this.currentNPC.id;

        // find deliveries meant for this npc
        let relevantItems = [];
        if (typeof QuestSystem !== 'undefined') {
            const activeQuests = Object.values(QuestSystem.activeQuests || {});
            activeQuests.forEach(quest => {
                // Check if this NPC is the delivery target
                const talkObj = quest.objectives?.find(o =>
                    o.type === 'talk' && o.npc === npcType && !o.completed
                );
                if (talkObj && quest.givesQuestItem && questItems[quest.givesQuestItem]) {
                    const itemInfo = QuestSystem.questItems?.[quest.givesQuestItem] || {};
                    relevantItems.push({
                        questId: quest.id,
                        questName: quest.name,
                        itemId: quest.givesQuestItem,
                        itemName: itemInfo.name || quest.givesQuestItem,
                        itemIcon: itemInfo.icon || '📦',
                        quantity: questItems[quest.givesQuestItem]
                    });
                }
            });
        }

        if (relevantItems.length > 0) {
            container.classList.remove('hidden');
            relevantItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'quest-item-row';
                row.innerHTML = `
                    <div class="quest-item-info">
                        <span>${item.itemIcon}</span>
                        <span>${item.itemName}</span>
                        <span style="color:#888">(${item.questName})</span>
                    </div>
                    <button class="give-item-btn" data-quest="${item.questId}" data-item="${item.itemId}">
                        Give Item
                    </button>
                `;
                row.querySelector('.give-item-btn').addEventListener('click', () => {
                    this.giveQuestItem(item.questId, item.itemId);
                });
                list.appendChild(row);
            });
        } else {
            container.classList.add('hidden');
        }
    },

    // give quest item
    async giveQuestItem(questId, itemId) {
        const message = `Here, I have a delivery for you. *hands over the package*`;
        document.getElementById('people-chat-input').value = message;
        await this.sendMessage();
    },

    // update trade section
    updateTradeSection(npcData) {
        const container = document.getElementById('people-trade-section');
        const preview = document.getElementById('trade-preview');
        if (!container || !preview) return;

        const npcType = npcData.type || npcData.id;
        const canTrade = this.npcCanTrade(npcType) || npcData.canTrade;
        const repRequired = this.getTradeRepRequirement(npcType);
        const currentRep = this.getNPCReputation(npcType);

        // ALWAYS show trade section for ALL NPCs - everyone can potentially trade
        // Shows rep requirement notice if trade is locked, or trade preview if unlocked
        {
            container.classList.remove('hidden');

            if (canTrade) {
                // can trade - show actual npc inventory, not location config!
                // fix: use npctradewindow.getnpcinventory() to get real items
                let actualItems = [];
                if (typeof NPCTradeWindow !== 'undefined' && this.currentNPC) {
                    const npcInv = NPCTradeWindow.getNPCInventory(this.currentNPC);
                    if (npcInv && typeof npcInv === 'object') {
                        // Get item names, exclude 'gold' from the list
                        actualItems = Object.keys(npcInv).filter(k => k !== 'gold' && npcInv[k] > 0);
                    }
                }

                if (actualItems.length > 0) {
                    // show actual items this npc has - format nicely
                    const displayItems = actualItems.slice(0, 4).map(itemId => {
                        // Try to get display name from ItemDatabase
                        let name = itemId.replace(/_/g, ' ');
                        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
                            const item = ItemDatabase.getItem(itemId);
                            if (item?.name) name = item.name;
                        }
                        return this.escapeHtml(name);
                    }).join(', ');
                    preview.innerHTML = `<span style="color:#4a9">✓ Trade Available</span><br>Has: ${displayItems}${actualItems.length > 4 ? '...' : ''}`;
                } else {
                    preview.innerHTML = '<span style="color:#4a9">✓ Trade Available</span><br>Various goods for trade';
                }

                // update button to be active - opens npc's inventory
                const btn = container.querySelector('.trade-btn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Trade with NPC';
                    btn.style.opacity = '1';
                }
            } else {
                // trade locked - show rep requirement
                const repNeeded = repRequired - currentRep;
                preview.innerHTML = `<span style="color:#c66">🔒 Trade Locked</span><br>Reputation: ${currentRep}/${repRequired} (need ${repNeeded} more)<br><span style="color:#888;font-size:0.85em">Complete quests, trade, or help them to gain rep</span>`;

                // disable button
                const btn = container.querySelector('.trade-btn');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = `Need ${repRequired} Rep`;
                    btn.style.opacity = '0.5';
                }
            }
        }
    },

    // quick action methods - now use npcinstructiontemplates for proper api instructions
    async askAboutWares() {
        if (!this.currentNPC) return;

        // "browse wares" directly opens npc's inventory - no api needed!
        // The player clicked "Browse Wares" - they want to SEE the wares, not hear about them
        this.addChatMessage("Show me what you have for sale.", 'player');
        this.chatHistory.push({ role: 'user', content: "Show me what you have for sale." });

        // quick npc response then open trade
        const npcType = this.currentNPC.type || this.currentNPC.id;
        const responses = {
            merchant: "*spreads hands over the goods* Take a look at what I've got.",
            innkeeper: "*gestures to the bar* Here's what we have in stock.",
            blacksmith: "*points to the forge and racks* See for yourself - quality work.",
            apothecary: "*waves at the shelves* Browse my remedies and potions.",
            jeweler: "*unlocks the display case* Fine pieces, every one.",
            default: "*shows their wares* Here's what I have available."
        };
        const response = responses[npcType] || responses.default;
        this.addChatMessage(response, 'npc');
        this.chatHistory.push({ role: 'assistant', content: response });

        // play tts for the response
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(response, voice);
        }

        // open the npc's inventory after a short delay for the message to show
        console.log('🛒 askAboutWares: About to call openFullTrade in 500ms');
        setTimeout(() => {
            console.log('🛒 askAboutWares: setTimeout fired, calling openFullTrade now');
            this.openFullTrade();
        }, 500);
    },

    async askAboutWork() {
        if (!this.currentNPC) return;

        // send standardized ask_quest instruction to api
        await this.sendActionMessage('ask_quest', "Do you have any work for me?");
    },

    async mentionDelivery() {
        if (!this.currentNPC) return;

        // send standardized turn_in_quest instruction to api
        await this.sendActionMessage('turn_in_quest', "I have a delivery for you.");
    },

    async askDirections() {
        if (!this.currentNPC) return;

        // send standardized ask_directions instruction to api
        await this.sendActionMessage('ask_directions', "Can you tell me about nearby places?");
    },

    async sayGoodbye() {
        if (!this.currentNPC) return;

        // send standardized farewell instruction to api
        await this.sendActionMessage('farewell', "I should be going. Farewell.");
        setTimeout(() => this.showListView(), 2000);
    },

    async askRumors() {
        if (!this.currentNPC) return;

        // send standardized ask_rumors instruction to api
        await this.sendActionMessage('ask_rumors', "Heard any interesting rumors lately?");
    },

    async askForRest() {
        if (!this.currentNPC) return;

        // send standardized rest instruction to api
        await this.sendActionMessage('rest', "I need a room to rest.");
    },

    async askForHealing() {
        if (!this.currentNPC) return;

        // send standardized heal instruction to api
        await this.sendActionMessage('heal', "I'm injured. Can you help me?");
    },

    // authority npc actions

    async askAboutLaw() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('ask_law', "What are the laws here? What should I know?");
    },

    async askForBlessing() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('ask_blessing', "I seek your wisdom and blessing, elder.");
    },

    // criminal npc actions

    async askBuyInformation() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('buy_info', "I'm looking to buy information. What can you tell me?");
    },

    async askAboutContraband() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('ask_contraband', "I hear you can get... special goods. What do you have?");
    },

    async askForLoan() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('ask_loan', "I need some gold. What are your terms?");
    },

    // boss npc actions

    async attemptIntimidate() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('intimidate', "*steps forward menacingly* You don't scare me.");
    },

    // traveler npc actions

    async askAboutTravels() {
        if (!this.currentNPC) return;
        await this.sendActionMessage('ask_travels', "Where have you traveled from? What have you seen?");
    },

    // ═══════════════════════════════════════════════════════════════
    // gatehouse payment - pay passage fee to guard
    // ═══════════════════════════════════════════════════════════════

    payGatehouseFee(gatehouseId, gatehouse) {
        if (!this.currentNPC) return;

        const playerGold = game?.player?.gold || 0;
        const fee = gatehouse.fee;
        const zoneName = GatehouseSystem.ZONES[gatehouse.unlocksZone]?.name || 'the region beyond';

        if (playerGold < fee) {
            this.addChatMessage(`I'd like to pay the passage fee.`, 'player');
            this.addChatMessage(`*The guard eyes your coin purse* You don't have enough gold. The fee is ${fee} gold, and you only have ${playerGold}. Come back when you can afford it.`, 'npc');
            addMessage(`💸 Not enough gold! You need ${fee}g but only have ${playerGold}g.`);
            return;
        }

        // Show dialogue
        this.addChatMessage(`I'd like to pay the passage fee to enter ${zoneName}.`, 'player');
        this.addChatMessage(`*The guard nods* That'll be ${fee} gold. *counts your coins carefully* ...Very well, you're cleared for passage. Safe travels.`, 'npc');

        // Process payment through GatehouseSystem
        if (GatehouseSystem.payPassageFee(gatehouseId)) {
            addMessage(`🏰 Paid ${fee} gold - ${gatehouse.name} passage unlocked!`);
            addMessage(`🎉 You can now freely travel to ${zoneName}!`);

            // Refresh the quick actions to remove the payment button
            setTimeout(() => {
                this.updateQuickActions(this.currentNPC);
            }, 500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // boatman portal methods - doom world access
    // ═══════════════════════════════════════════════════════════════

    // use the boatman's portal to travel between worlds
    async useBoatmanPortal(destination) {
        if (!this.currentNPC || this.currentNPC.type !== 'boatman') {
            console.warn('💀 useBoatmanPortal called without boatman NPC');
            return;
        }

        const currentLocation = game?.currentLocation?.id || 'shadow_dungeon';

        // display atmospheric message in chat
        if (destination === 'doom') {
            this.addChatMessage("*reaches toward the shimmering portal*", 'player');
            this.addChatMessage("*The Boatman's hollow voice echoes* So you choose to witness what could have been... Step through, and may your resolve not falter.", 'npc');

            // small delay for dramatic effect
            await new Promise(r => setTimeout(r, 1500));

            // enter doom world
            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.enterDoomWorld(currentLocation);
            } else if (typeof TravelSystem !== 'undefined') {
                TravelSystem.portalToDoomWorld(currentLocation);
            }

            // close the panel after transition
            this.close();

        } else {
            this.addChatMessage("*prepares to leave this dark realm*", 'player');
            this.addChatMessage("*The Boatman nods slowly* The light calls you back... Return now, but remember what you've seen.", 'npc');

            await new Promise(r => setTimeout(r, 1500));

            // exit doom world
            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.exitDoomWorld(currentLocation);
            } else if (typeof TravelSystem !== 'undefined') {
                TravelSystem.portalToNormalWorld(currentLocation);
            }

            this.close();
        }
    },

    // ask about the doom world
    async askAboutDoomWorld() {
        const inDoom = typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive;

        if (inDoom) {
            await this.sendActionMessage('doom_info', "What happened to this world?");
        } else {
            await this.sendActionMessage('doom_info', "What lies beyond the portal?");
        }
    },

    // get boatman-specific instruction for api calls
    getBoatmanInstruction(action) {
        if (typeof DoomWorldSystem !== 'undefined') {
            return DoomWorldSystem.getBoatmanInstruction(action);
        }

        const inDoom = typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld();
        return `You are the Boatman, a mysterious ferryman between worlds.
Speak cryptically and briefly. You offer passage to the ${inDoom ? 'normal world' : 'doom world'}.`;
    },

    // ═══════════════════════════════════════════════════════════════
    // encounter actions - give gold, attack, pickpocket, flee
    // ═══════════════════════════════════════════════════════════════

    // give gold to npc - charity, bribery, or appeasement
    // fixed: use modal instead of browser prompt()
    giveGoldToNPC() {
        if (!this.currentNPC) return;

        const playerGold = game?.player?.gold || 0;
        if (playerGold <= 0) {
            this.addChatMessage("*checks pockets* I have no gold to give.", 'player');
            this.addChatMessage("*looks disappointed*", 'npc');
            return;
        }

        // build quick amount buttons based on player gold
        const amounts = [10, 50, 100, 500, 1000, 5000, 10000, 50000].filter(a => a <= playerGold);
        const amountButtons = amounts.map(a =>
            `<button class="gold-amount-btn" data-amount="${a}" style="margin:3px;padding:8px 12px;cursor:pointer;background:#2a2a2a;border:1px solid #4a4a4a;color:#ffd700;border-radius:4px;">${a.toLocaleString()}g</button>`
        ).join('');

        // create modal content with input and quick buttons
        const content = `
            <div style="text-align:center;padding:10px;">
                <p style="color:#ccc;margin-bottom:15px;">You have <strong style="color:#ffd700;">${playerGold.toLocaleString()}</strong> gold</p>
                <div style="margin-bottom:15px;">
                    <input type="number" id="gold-amount-input" min="1" max="${playerGold}"
                           placeholder="Enter amount..."
                           style="width:150px;padding:10px;font-size:16px;text-align:center;background:#1a1a1a;border:1px solid #4a4a4a;color:#ffd700;border-radius:4px;">
                </div>
                <div style="margin-bottom:10px;color:#888;font-size:12px;">Quick amounts:</div>
                <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:5px;">
                    ${amountButtons}
                </div>
            </div>
        `;

        // show modal using modalsystem
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '💰 Give Gold',
                content: content,
                buttons: [
                    {
                        text: 'Give Gold',
                        className: 'primary',
                        onClick: () => {
                            const input = document.getElementById('gold-amount-input');
                            const amount = parseInt(input?.value) || 0;
                            this._executeGoldGift(amount, playerGold);
                            ModalSystem.hide();
                        }
                    },
                    {
                        text: 'Cancel',
                        className: 'secondary',
                        onClick: () => ModalSystem.hide()
                    }
                ]
            });

            // wire up quick amount buttons after modal is shown
            setTimeout(() => {
                document.querySelectorAll('.gold-amount-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const input = document.getElementById('gold-amount-input');
                        if (input) input.value = btn.dataset.amount;
                    });
                });
            }, 50);
        } else {
            // fallback if modalsystem not available
            this.addChatMessage("*tries to offer gold but something went wrong*", 'player');
        }
    },

    // execute the actual gold transfer - throw money at problems
    _executeGoldGift(amount, playerGold) {
        if (isNaN(amount) || amount <= 0 || amount > playerGold) {
            this.addChatMessage("*fumbles with coin pouch*", 'player');
            return;
        }

        // transfer gold via PlayerStateManager if available
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.gold.remove(amount, 'npc_gift');
        } else {
            game.player.gold -= amount;
        }
        if (this.currentNPC.gold !== undefined) {
            this.currentNPC.gold += amount;
        }

        // increase reputation with this npc and their faction/guild
        const npcType = this.currentNPC.type || this.currentNPC.id;
        const repGain = Math.floor(amount / 5);

        if (typeof NPCRelationshipSystem !== 'undefined') {
            // Record interaction which updates both NPC rep and faction rep
            NPCRelationshipSystem.recordInteraction(npcType, 'gift', {
                value: amount,
                itemId: 'gold'
            });

            // Get faction name for display
            const faction = this._getNPCFaction(npcType);
            if (faction) {
                if (typeof addMessage === 'function') {
                    addMessage(`💰 Gave ${amount.toLocaleString()} gold to ${this.currentNPC.name} (+rep with ${faction.name})`);
                }
            } else {
                if (typeof addMessage === 'function') {
                    addMessage(`💰 Gave ${amount.toLocaleString()} gold to ${this.currentNPC.name}`);
                }
            }
        } else {
            if (typeof addMessage === 'function') {
                addMessage(`💰 Gave ${amount.toLocaleString()} gold to ${this.currentNPC.name}`);
            }
        }

        this.addChatMessage(`*hands over ${amount.toLocaleString()} gold*`, 'player');
        this.addChatMessage(`*accepts the gold gratefully* Many thanks, traveler.`, 'npc');
        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // give item to npc
    // fixed: use modal instead of browser prompt()
    giveItemToNPC() {
        if (!this.currentNPC) return;

        // get inventory as object {itemid: quantity} and convert to array
        const inventoryObj = game?.player?.inventory || {};
        const inventoryItems = Object.entries(inventoryObj)
            .filter(([id, qty]) => qty > 0 && id !== 'gold')
            .slice(0, 12);

        if (inventoryItems.length === 0) {
            this.addChatMessage("*checks bag* I have nothing to give.", 'player');
            return;
        }

        // build item buttons for modal
        const itemButtons = inventoryItems.map(([itemId, qty]) => {
            let name = itemId.replace(/_/g, ' ');
            let icon = '📦';
            if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
                const item = ItemDatabase.getItem(itemId);
                if (item?.name) name = item.name;
                if (item?.icon) icon = item.icon;
            }
            return `<button class="give-item-btn" data-item-id="${this.escapeHtml(itemId)}"
                style="display:flex;align-items:center;gap:8px;margin:4px;padding:8px 12px;cursor:pointer;background:#2a2a2a;border:1px solid #4a4a4a;color:#fff;border-radius:4px;width:calc(50% - 12px);">
                <span style="font-size:18px;">${icon}</span>
                <span style="flex:1;text-align:left;">${this.escapeHtml(name)}</span>
                <span style="color:#888;">x${qty}</span>
            </button>`;
        }).join('');

        const content = `
            <div style="padding:10px;">
                <p style="color:#ccc;margin-bottom:15px;text-align:center;">Select an item to give:</p>
                <div style="display:flex;flex-wrap:wrap;justify-content:center;max-height:300px;overflow-y:auto;">
                    ${itemButtons}
                </div>
            </div>
        `;

        // show modal
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '🎁 Give Item',
                content: content,
                buttons: [
                    {
                        text: 'Cancel',
                        className: 'secondary',
                        onClick: () => ModalSystem.hide()
                    }
                ]
            });

            // wire up item buttons
            setTimeout(() => {
                document.querySelectorAll('.give-item-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const itemId = btn.dataset.itemId;
                        this._executeItemGift(itemId);
                        ModalSystem.hide();
                    });
                });
            }, 50);
        }
    },

    // execute the actual item transfer - give them your shit
    _executeItemGift(itemId) {
        if (!itemId) return;

        // Check inventory via PlayerStateManager or fallback
        const qty = typeof PlayerStateManager !== 'undefined' ?
            PlayerStateManager.inventory.get(itemId) :
            (game?.player?.inventory?.[itemId] || 0);

        if (qty <= 0) {
            this.addChatMessage("*hesitates*", 'player');
            return;
        }

        // remove 1 of the item from inventory via PlayerStateManager
        if (typeof PlayerStateManager !== 'undefined') {
            PlayerStateManager.inventory.remove(itemId, 1, 'npc_gift');
        } else if (game?.player?.inventory) {
            game.player.inventory[itemId]--;
            const newTotal = game.player.inventory[itemId] || 0;
            if (game.player.inventory[itemId] <= 0) {
                delete game.player.inventory[itemId];
            }

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('inventory:item:removed', {
                    itemId: itemId,
                    quantity: 1,
                    newTotal: newTotal,
                    reason: 'npc_gift'
                });
            }
        }

        // Get display name and value for rep calculation
        let name = itemId.replace(/_/g, ' ');
        let itemValue = 10; // Default value for rep calculation
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
            const item = ItemDatabase.getItem(itemId);
            if (item?.name) name = item.name;
            if (item?.basePrice) itemValue = item.basePrice;
        }

        // increase reputation with this npc and their faction/guild
        const npcType = this.currentNPC.type || this.currentNPC.id;

        if (typeof NPCRelationshipSystem !== 'undefined') {
            // Record interaction which updates both NPC rep and faction rep
            NPCRelationshipSystem.recordInteraction(npcType, 'gift', {
                value: itemValue,
                itemId: itemId
            });

            // Get faction name for display
            const faction = this._getNPCFaction(npcType);
            if (faction) {
                if (typeof addMessage === 'function') {
                    addMessage(`🎁 Gave ${name} to ${this.currentNPC.name} (+rep with ${faction.name})`);
                }
            } else {
                if (typeof addMessage === 'function') {
                    addMessage(`🎁 Gave ${name} to ${this.currentNPC.name}`);
                }
            }
        } else {
            if (typeof addMessage === 'function') {
                addMessage(`🎁 Gave ${name} to ${this.currentNPC.name}`);
            }
        }

        this.addChatMessage(`*offers ${name}*`, 'player');
        this.addChatMessage(`*takes the gift* How kind of you!`, 'npc');
    },

    // ═══════════════════════════════════════════════════════════════
    // combat system - quest-aware attack logic
    // ═══════════════════════════════════════════════════════════════

    // Check if an NPC can be attacked - considers quest involvement
    canAttackNPC(npcType, location) {
        // Protected NPCs - authority figures and mystical beings
        const protectedNPCs = ['noble', 'king', 'queen', 'boatman', 'ferryman'];
        if (protectedNPCs.includes(npcType)) {
            return { allowed: false, reason: 'protected' };
        }

        // Guards are protected unless in special circumstances
        if (npcType === 'guard') {
            // Check if there's a quest requiring guard defeat
            const guardQuestTarget = this._isQuestDefeatTarget(npcType, location);
            if (guardQuestTarget) {
                return { allowed: true, reason: 'quest_target', isQuestTarget: true, questId: guardQuestTarget.questId };
            }
            return { allowed: false, reason: 'protected' };
        }

        // Check if NPC is involved in active quests (as giver or objective)
        if (typeof QuestSystem !== 'undefined') {
            // Check if this NPC is a quest giver for active quests
            for (const questId in QuestSystem.activeQuests || {}) {
                const quest = QuestSystem.activeQuests[questId];

                // Don't attack quest givers
                if (this._npcMatchesType(npcType, quest.giver)) {
                    return { allowed: false, reason: 'quest_npc', questId };
                }

                // Don't attack NPCs needed for talk/deliver objectives
                const hasNonCombatObjective = quest.objectives?.some(obj =>
                    !obj.completed &&
                    (obj.type === 'talk' || obj.type === 'deliver') &&
                    this._npcMatchesType(npcType, obj.npc)
                );
                if (hasNonCombatObjective) {
                    return { allowed: false, reason: 'quest_npc', questId };
                }

                // Don't attack turn-in NPCs
                if (this._npcMatchesType(npcType, quest.turnInNpc)) {
                    return { allowed: false, reason: 'quest_npc', questId };
                }
            }

            // Check if NPC is a defeat target for any active quest
            const defeatTarget = this._isQuestDefeatTarget(npcType, location);
            if (defeatTarget) {
                return { allowed: true, reason: 'quest_target', isQuestTarget: true, questId: defeatTarget.questId };
            }

            // Check if NPC offers available quests (not yet accepted)
            const availableQuests = QuestSystem.getQuestsForNPC?.(npcType, location) || [];
            if (availableQuests.length > 0) {
                return { allowed: false, reason: 'quest_npc' };
            }
        }

        // No quest involvement - can attack (with consequences)
        return { allowed: true, reason: 'normal' };
    },

    // Check if NPC is a defeat/kill target for any active quest
    _isQuestDefeatTarget(npcType, location) {
        if (typeof QuestSystem === 'undefined') return null;

        for (const questId in QuestSystem.activeQuests || {}) {
            const quest = QuestSystem.activeQuests[questId];
            const defeatObj = quest.objectives?.find(obj =>
                !obj.completed &&
                (obj.type === 'defeat' || obj.type === 'kill') &&
                this._npcMatchesType(npcType, obj.enemy || obj.target)
            );
            if (defeatObj) {
                return { questId, objective: defeatObj };
            }
        }
        return null;
    },

    // Helper to match NPC type (handles arrays)
    _npcMatchesType(npcType, target) {
        if (!target) return false;
        if (Array.isArray(target)) {
            return target.includes(npcType);
        }
        return npcType === target;
    },

    // attack npc - violence has consequences
    // Now uses Combat Modal system for proper stat-based combat
    attackNPC(attackContext = {}) {
        if (!this.currentNPC) return;

        const npcType = this.currentNPC.type || this.currentNPC.id;
        const npcName = this.currentNPC.name;
        const self = this;

        // Show confirmation before starting combat
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '⚔️ Initiate Combat?',
                content: `
                    <div style="text-align:center;padding:15px;">
                        <p style="color:#ff6b6b;font-size:18px;margin-bottom:10px;">Attack ${this.escapeHtml(npcName)}?</p>
                        <p style="color:#888;">This will start turn-based combat!</p>
                        ${attackContext.isQuestTarget ? '<p style="color:#4caf50;">Quest Target</p>' : ''}
                        <p style="color:#666;font-size:12px;margin-top:10px;">
                            ${attackContext.isQuestTarget ? '' : '• Reputation loss<br>'}
                            • Risk of injury or death<br>
                            • Rewards on victory
                        </p>
                    </div>
                `,
                buttons: [
                    {
                        text: '⚔️ Fight!',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            self.close(); // Close people panel

                            // Use new Combat Modal system
                            if (typeof CombatModal !== 'undefined') {
                                CombatModal.open(npcType, npcName, {
                                    isQuestTarget: attackContext.isQuestTarget,
                                    questId: attackContext.questId
                                });
                            } else {
                                // Fallback to old system
                                self._executeAttack();
                            }
                        }
                    },
                    {
                        text: 'Never mind',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            self.addChatMessage("*thinks better of it*", 'player');
                        }
                    }
                ]
            });
        } else if (typeof CombatModal !== 'undefined') {
            // No ModalSystem but have CombatModal - go directly to combat
            this.close();
            CombatModal.open(npcType, npcName, attackContext);
        } else {
            // Fallback to old system
            this._executeAttack();
        }
    },

    // execute the actual attack - violence is always an option
    _executeAttack() {
        this.addChatMessage("*draws weapon and attacks!*", 'player');

        // simple combat resolution
        const playerStrength = game?.player?.stats?.strength || 10;
        const npcStrength = this.currentNPC.strength || 10;
        const playerRoll = Math.floor(Math.random() * 20) + playerStrength;
        const npcRoll = Math.floor(Math.random() * 20) + npcStrength;

        if (playerRoll > npcRoll) {
            // player wins - loot gold via PlayerStateManager
            const loot = this.currentNPC.gold || Math.floor(Math.random() * 50) + 10;
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.add(loot, 'npc_combat_loot');
            } else {
                game.player.gold = (game.player.gold || 0) + loot;
            }

            this.addChatMessage("*falls defeated*", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`⚔️ Defeated ${this.currentNPC.name}! Looted ${loot} gold.`);
            }

            if (typeof NPCRelationshipSystem !== 'undefined') {
                NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, -50);
            }

            setTimeout(() => this.close(), 1500);
        } else {
            // npc wins - take damage via PlayerStateManager
            const damage = Math.floor(Math.random() * 20) + 5;
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.stats.subtract('health', damage, 'npc_combat_damage');
            } else if (game?.player?.stats?.health !== undefined) {
                game.player.stats.health = Math.max(0, game.player.stats.health - damage);
            }

            this.addChatMessage(`*fights back and wounds you for ${damage} damage!*`, 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`⚔️ ${this.currentNPC.name} fought back! Took ${damage} damage.`);
            }
        }

        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // pickpocket npc - thievery for fun and profit
    pickpocketNPC() {
        if (!this.currentNPC) return;

        this.addChatMessage("*tries to discreetly reach for their coin pouch*", 'player');

        // skill check
        const dexterity = game?.player?.stats?.dexterity || 10;
        const roll = Math.floor(Math.random() * 20) + 1;
        const success = roll + dexterity > 15;

        if (success) {
            // successful steal via PlayerStateManager
            const stolen = Math.floor(Math.random() * 30) + 5;
            if (typeof PlayerStateManager !== 'undefined') {
                PlayerStateManager.gold.add(stolen, 'pickpocket');
            } else {
                game.player.gold = (game.player.gold || 0) + stolen;
            }

            this.addChatMessage("*doesn't notice anything*", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`🗡️ Stole ${stolen} gold from ${this.currentNPC.name}!`);
            }
        } else {
            // caught!
            this.addChatMessage("*grabs your wrist* THIEF!", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`🚨 Caught pickpocketing ${this.currentNPC.name}!`);
            }

            // massive reputation loss for being a dumbass thief
            if (typeof NPCRelationshipSystem !== 'undefined') {
                NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, -30);
            }

            // might trigger guards
            if (Math.random() < 0.5 && typeof NPCEncounters !== 'undefined') {
                setTimeout(() => {
                    NPCEncounters.triggerGuardEncounter?.();
                }, 2000);
            }
        }

        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // flee from encounter
    fleeFromEncounter() {
        if (!this.currentNPC) return;

        this.addChatMessage("*turns and runs!*", 'player');
        this.addChatMessage("*shouts after you* Coward!", 'npc');

        if (typeof addMessage === 'function') {
            addMessage(`🏃 Fled from ${this.currentNPC.name}`);
        }

        // 🦇 End encounter
        if (typeof NPCEncounters !== 'undefined') {
            NPCEncounters.endEncounter(this.currentNPC.id);
        }

        setTimeout(() => this.close(), 500);
    },

    // ═══════════════════════════════════════════════════════════════

    // new: send message with standardized action type to npcinstructiontemplates
    async sendActionMessage(actionType, displayMessage) {
        if (this.isWaitingForResponse || !this.currentNPC) return;

        this.addChatMessage(displayMessage, 'player');
        this.chatHistory.push({ role: 'user', content: displayMessage });

        this.isWaitingForResponse = true;
        this.addChatMessage('...', 'npc typing-indicator');

        try {
            // check if npcvoicechatsystem is available
            if (typeof NPCVoiceChatSystem === 'undefined') {
                throw new Error('NPCVoiceChatSystem not available');
            }

            // build context for instruction templates
            const options = {
                action: actionType,
                availableQuests: this.getAvailableQuestsForNPC(),
                activeQuests: this.getActiveQuestsForNPC(),
                rumors: this.getRumors(),
                nearbyLocations: this.getNearbyLocations()
            };

            console.log(`🎭 PeoplePanel: Sending ${actionType} action for ${this.currentNPC.type || this.currentNPC.id}`);
            console.log('🎭 Options:', options);

            const response = await NPCVoiceChatSystem.generateNPCResponse(
                this.currentNPC,
                displayMessage,
                this.chatHistory,
                options
            );

            // 🖤 Remove typing indicator
            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            // check if we got a valid response
            if (!response || !response.text) {
                throw new Error('Empty response from API');
            }

            // critical: parse and execute commands from api response!
            // The API returns {openMarket}, {assignQuest:id}, etc. that need to be executed
            let cleanText = response.text;
            if (typeof NPCWorkflowSystem !== 'undefined' && NPCWorkflowSystem.parseCommands) {
                const parseResult = NPCWorkflowSystem.parseCommands(response.text);
                cleanText = parseResult.cleanText;
                if (parseResult.commands && parseResult.commands.length > 0) {
                    console.log('🎭 Executing commands from API response:', parseResult.commands.map(c => c.command).join(', '));
                    NPCWorkflowSystem.executeCommands(parseResult.commands, { npc: this.currentNPC });
                }
            }

            this.addChatMessage(cleanText, 'npc');
            this.chatHistory.push({ role: 'assistant', content: cleanText });

            // play tts with NPC-specific voice (use clean text without commands)
            if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                const voice = this.getNPCVoice(this.currentNPC);
                NPCVoiceChatSystem.playVoice(cleanText, voice);
            }

            // 🖤 Update quest items in case something changed
            this.updateQuestItems();

        } catch (e) {
            // only log as warning for expected fallbacks (like farewell when panel closes)
            // this prevents console spam for normal interactions
            const isExpectedFallback = !this.currentNPC || actionType === 'farewell';
            if (isExpectedFallback) {
                console.log(`🎭 Using fallback for ${actionType} action (NPC context lost or expected)`);
            } else {
                console.warn('🖤 Action message fallback triggered:', e?.message || 'Unknown error');
            }

            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            // critical: fallback must also execute the action!
            const fallback = this.getActionFallback(actionType, this.currentNPC);
            this.addChatMessage(fallback, 'npc');
            this.chatHistory.push({ role: 'assistant', content: fallback });

            // execute the action even on fallback - the fallback message is just flavor
            this.executeActionFallback(actionType);
        }

        this.isWaitingForResponse = false;
    },

    // execute action when api fails - fallback must still work!
    executeActionFallback(actionType) {
        console.log(`🎭 Executing fallback action: ${actionType}`);

        switch (actionType) {
            case 'browse_goods':
                // Open NPC trade directly
                this.openFullTrade();
                break;

            case 'rest':
                // Open rest if at inn
                if (typeof restAtInn === 'function') {
                    restAtInn();
                }
                break;

            case 'heal':
                // Open healing if healer
                if (typeof NPCTradeWindow !== 'undefined' && this.currentNPC) {
                    NPCTradeWindow.open(this.currentNPC, 'heal');
                }
                break;

            case 'ask_quest':
            case 'ask_rumors':
            case 'ask_directions':
            case 'farewell':
            case 'greeting':
                // These are just informational - fallback message is enough
                break;

            default:
                console.log(`🎭 No fallback action for: ${actionType}`);
        }
    },

    // get fallback response based on action type
    getActionFallback(actionType, npcData) {
        const npcType = npcData?.type || npcData?.id || 'stranger';
        const fallbacks = {
            browse_goods: `*gestures at wares* Take a look around. Let me know if something catches your eye.`,
            ask_quest: `*thinks for a moment* I don't have any work right now, but check back later.`,
            turn_in_quest: `*looks confused* I wasn't expecting any deliveries. Are you sure you have the right person?`,
            ask_rumors: `*leans in* Things have been quiet lately. Nothing worth mentioning.`,
            ask_directions: `*points down the road* Most places are connected by the main roads. Just follow them.`,
            farewell: `Safe travels, friend.`,
            rest: `*nods* A room will cost you. We have beds available.`,
            heal: `*examines you* Let me see what I can do for you.`,
            greeting: `*nods* What brings you here today?`
        };
        return fallbacks[actionType] || `*looks at you expectantly*`;
    },

    // get npc voice from new template system or fallback
    getNPCVoice(npcData) {
        if (typeof NPCInstructionTemplates !== 'undefined' && NPCInstructionTemplates._loaded) {
            return NPCInstructionTemplates.getVoice(npcData.type || npcData.id);
        }
        return npcData.voice || 'nova';
    },

    // get available quests for current npc
    getAvailableQuestsForNPC() {
        if (typeof QuestSystem === 'undefined' || !this.currentNPC) return [];

        const npcType = this.currentNPC.type || this.currentNPC.id;
        return Object.values(QuestSystem.quests || {}).filter(q => {
            const giverMatches = q.giver === npcType;
            const notActive = !QuestSystem.activeQuests?.[q.id];
            const notCompleted = !QuestSystem.completedQuests?.includes(q.id) || q.repeatable;
            const prereqMet = !q.prerequisite || QuestSystem.completedQuests?.includes(q.prerequisite);
            return giverMatches && notActive && notCompleted && prereqMet;
        });
    },

    // get active quests that can be turned in to current npc
    getActiveQuestsForNPC() {
        if (typeof QuestSystem === 'undefined' || !this.currentNPC) return [];

        const npcType = this.currentNPC.type || this.currentNPC.id;
        return Object.values(QuestSystem.activeQuests || {}).filter(q => {
            // quest giver matches or has a turn-in objective for this npc
            const giverMatches = q.giver === npcType;
            const hasTurnInObj = q.objectives?.some(o =>
                (o.type === 'talk' || o.type === 'deliver') && o.npc === npcType
            );
            return giverMatches || hasTurnInObj;
        });
    },

    // get rumors from game context
    getRumors() {
        // try to get rumors from various sources
        const rumors = [];

        // Check QuestSystem for rumors
        if (typeof QuestSystem !== 'undefined' && QuestSystem.getRumors) {
            rumors.push(...(QuestSystem.getRumors() || []));
        }

        // Check game events
        if (typeof game !== 'undefined' && game.recentEvents) {
            rumors.push(...game.recentEvents.slice(-3));
        }

        return rumors.length > 0 ? rumors : ['Things are quiet around here lately.'];
    },

    // open the grand market at royal capital
    openGrandMarket() {
        // this opens the city-wide market, not an npc's personal inventory
        if (game?.currentLocation?.id !== 'royal_capital') {
            if (typeof addMessage === 'function') {
                addMessage('The Grand Market is only available at the Royal Capital.');
            }
            return;
        }

        // add chat messages for flavor
        this.addChatMessage("I'd like to browse the Grand Market.", 'player');
        this.chatHistory.push({ role: 'user', content: "I'd like to browse the Grand Market." });

        this.addChatMessage("*gestures toward the bustling market square* The Grand Market awaits - finest goods in all the realm!", 'npc');
        this.chatHistory.push({ role: 'assistant', content: "*gestures toward the bustling market square* The Grand Market awaits - finest goods in all the realm!" });

        // open the market using the global function
        if (typeof openMarket === 'function') {
            openMarket();
        } else if (typeof updateMarketDisplay === 'function') {
            updateMarketDisplay();
            // Show market panel if it exists
            const marketPanel = document.querySelector('.market-panel, #market-panel');
            if (marketPanel) marketPanel.classList.remove('hidden');
        } else {
            console.warn('🏛️ Grand market function not available');
        }
    },

    // get nearby locations for directions
    getNearbyLocations() {
        if (typeof GameWorld === 'undefined' || !game?.currentLocation?.id) return [];

        const currentId = game.currentLocation.id;
        const currentLoc = GameWorld.locations?.[currentId];

        if (!currentLoc?.connections) return [];

        return currentLoc.connections.map(connId => {
            const connLoc = GameWorld.locations?.[connId];
            return {
                name: connLoc?.name || connId,
                id: connId,
                direction: this.getDirectionTo(currentLoc, connLoc)
            };
        }).slice(0, 5);
    },

    // calculate direction to a location (basic)
    getDirectionTo(from, to) {
        if (!from?.x || !to?.x) return 'nearby';

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'east' : 'west';
        } else {
            return dy > 0 ? 'south' : 'north';
        }
    },

    openFullTrade() {
        // open npc trade window for this specific npc
        console.log('🛒 openFullTrade called, currentNPC:', this.currentNPC);
        console.log('🛒 NPCTradeWindow defined:', typeof NPCTradeWindow !== 'undefined');

        if (!this.currentNPC) {
            console.warn('💱 No NPC selected for trade');
            return;
        }

        // open the npc trade window
        if (typeof NPCTradeWindow !== 'undefined') {
            console.log('🛒 Calling NPCTradeWindow.open with:', this.currentNPC);
            NPCTradeWindow.open(this.currentNPC, 'trade');
        } else {
            // fallback to grand market if at capital
            if (typeof openMarket === 'function' && typeof locationHasMarket === 'function' && locationHasMarket()) {
                openMarket();
            } else {
                console.warn('💱 NPCTradeWindow not available and not at a market location');
                if (typeof addMessage === 'function') {
                    addMessage('💱 Trading system unavailable at this location.');
                }
            }
        }
    },

    // stop voice
    stopVoice() {
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.stopVoicePlayback?.();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // npc checks - figuring out what this npc can do
    // ═══════════════════════════════════════════════════════════════

    // wow-style quest marker system
    // Returns object with: { marker: '!' or '?', style: 'quest-available', 'quest-main', etc. }
    getQuestMarker(npcType) {
        if (typeof QuestSystem === 'undefined') return null;

        const location = typeof game !== 'undefined' ? game.currentLocation?.id : null;
        console.log(`🔍 getQuestMarker('${npcType}') at location '${location}'`);

        // priority 1: quest ready to turn in (? markers)
        const readyToComplete = this.getQuestsReadyToComplete(npcType);
        console.log(`  readyToComplete:`, readyToComplete.map(q => q.id));
        if (readyToComplete.length > 0) {
            // Find the highest priority quest to show
            const mainQuest = readyToComplete.find(q => q.type === 'main');
            const repeatableQuest = readyToComplete.find(q => q.repeatable);

            if (mainQuest) {
                return { marker: '?', style: 'quest-main-complete' }; // Orange ?
            } else if (repeatableQuest) {
                return { marker: '?', style: 'quest-repeatable-complete' }; // Blue ?
            } else {
                return { marker: '?', style: 'quest-complete' }; // Gold ?
            }
        }

        // priority 2: quest in progress from this npc (grey ? markers)
        const activeFromNPC = QuestSystem.getActiveQuestsForNPC?.(npcType, location) || [];
        const inProgress = activeFromNPC.filter(q => {
            const progress = QuestSystem.checkProgress?.(q.id);
            return progress?.status === 'in_progress';
        });

        // also check if this npc is the turn-in target for any active quest
        const turnInQuests = Object.values(QuestSystem.activeQuests || {}).filter(q => {
            // check if npc type matches and location matches (for multiple merchants/npcs of same type)
            const turnInNpcMatches = q.turnInNpc === npcType;

            // check for any talk objectives to this npc (even if locked by previous objectives)
            // This shows the grey ? marker indicating they're involved in an active quest
            const hasTalkObjective = q.objectives?.some(o =>
                o.type === 'talk' &&
                !o.completed &&
                o.npc === npcType &&
                (!o.location || o.location === location || o.location === 'any')
            );

            // if this npc has a talk objective in this quest, show the marker
            if (hasTalkObjective) {
                return true;
            }

            // For turn-in NPCs, check the quest's turn-in location
            if (turnInNpcMatches) {
                const locationMatches = !location || !q.turnInLocation || q.turnInLocation === location || q.turnInLocation === 'any';
                return locationMatches;
            }

            return false;
        });

        if (inProgress.length > 0 || turnInQuests.length > 0) {
            return { marker: '?', style: 'quest-progress' }; // Silver/grey ?
        }

        // priority 3: quest available to pick up (! markers)
        const availableQuests = QuestSystem.getQuestsForNPC?.(npcType, location) || [];
        if (availableQuests.length > 0) {
            // Find the highest priority quest type
            const mainQuest = availableQuests.find(q => q.type === 'main');
            const repeatableQuest = availableQuests.find(q => q.repeatable);

            // Check player level for trivial quests (if applicable)
            // For now, assume no trivial system - all quests are appropriate level

            if (mainQuest) {
                return { marker: '!', style: 'quest-main' }; // Orange !
            } else if (repeatableQuest) {
                return { marker: '!', style: 'quest-repeatable' }; // Blue !
            } else {
                return { marker: '!', style: 'quest-available' }; // Gold !
            }
        }

        return null; // No quest marker for this NPC
    },

    npcHasQuest(npcType) {
        if (typeof QuestSystem === 'undefined') return false;

        return Object.values(QuestSystem.quests || {}).some(q => {
            const giverMatches = q.giver === npcType;
            const notActive = !QuestSystem.activeQuests?.[q.id];
            const notCompleted = !QuestSystem.completedQuests?.includes(q.id) || q.repeatable;
            const prereqMet = !q.prerequisite || QuestSystem.completedQuests?.includes(q.prerequisite);
            return giverMatches && notActive && notCompleted && prereqMet;
        });
    },

    npcHasDeliveryForThem(npcType) {
        if (typeof QuestSystem === 'undefined') return false;

        return Object.values(QuestSystem.activeQuests || {}).some(q => {
            return q.objectives?.some(o =>
                o.type === 'talk' && o.npc === npcType && !o.completed
            );
        });
    },

    npcCanTrade(npcType) {
        // trade availability - not just merchants anymore, it's a whole economy
        // some NPCs trade freely, others need you to earn their trust first

        // always tradeable - no rep required, these folks just want your gold
        // includes common quest givers who don't need reputation to trade
        const alwaysTrade = [
            'merchant', 'innkeeper', 'general_store', 'baker', 'farmer',
            'fisherman', 'ferryman', 'traveler',
            // Quest givers - they give quests, they can trade without rep requirements
            'elder', 'healer', 'guard', 'priest', 'hunter', 'woodcutter',
            'barkeep', 'sailor', 'explorer', 'adventurer', 'druid',
            'royal_advisor', 'chieftain', 'stablemaster', 'courier',
            // Tutorial NPCs - always available during tutorial
            'tutorial_merchant', 'tutorial_guide', 'tutorial_trainer'
        ];
        if (alwaysTrade.includes(npcType)) return true;

        // trade with low rep (10+) - specialty traders, they need to know you a bit
        const lowRepTrade = ['blacksmith', 'apothecary', 'tailor', 'herbalist', 'miner'];
        if (lowRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 10;
        }

        // trade with medium rep (25+) - elite traders, gotta prove yourself
        const medRepTrade = ['jeweler', 'banker', 'guild_master', 'scholar'];
        if (medRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 25;
        }

        // trade with high rep (50+) - nobility, only for the trusted
        const highRepTrade = ['noble'];
        if (highRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 50;
        }

        // shady types - need some trust but not much
        const shadyTrade = ['thief', 'spy', 'smuggler'];
        if (shadyTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 5;
        }

        // everyone else NOT in any list - they don't trade
        // This prevents random NPCs from showing trade badges
        return false;
    },

    // get npc reputation - how much does this npc type trust us?
    // Uses: individual NPC rep > faction rep > default 0
    getNPCReputation(npcTypeOrId) {
        // First check individual NPC relationship
        if (typeof NPCRelationshipSystem !== 'undefined') {
            // Direct lookup by id
            const directRel = NPCRelationshipSystem.relationships?.[npcTypeOrId];
            if (directRel) return directRel.reputation || 0;

            // Search all relationships for matching npctype
            for (const rel of Object.values(NPCRelationshipSystem.relationships || {})) {
                if (rel.npcType === npcTypeOrId) {
                    return rel.reputation || 0;
                }
            }

            // Check faction/type reputation as fallback
            const factionRep = NPCRelationshipSystem.factionReputation?.[npcTypeOrId];
            if (factionRep !== undefined) return factionRep;
        }

        // Check FactionSystem for NPC's faction reputation
        if (typeof FactionSystem !== 'undefined') {
            const npcFactions = FactionSystem.getNPCFactions?.(npcTypeOrId);
            if (npcFactions && npcFactions.length > 0) {
                // Use average of all faction reps, scaled to match individual rep system
                // Faction rep is -100 to +100, we scale to roughly 0-100 for trade
                let totalRep = 0;
                for (const factionId of npcFactions) {
                    const factionRep = FactionSystem.getReputation?.(factionId) || 0;
                    totalRep += factionRep;
                }
                // Average faction rep, then scale: -100 to +100 becomes -50 to +50
                // Add 50 to shift to 0-100 range for trade calculations
                const avgRep = totalRep / npcFactions.length;
                return Math.floor((avgRep + 100) / 2); // Now 0-100 scale
            }
        }

        return 0;
    },

    // get trade rep requirement - show players what they need
    getTradeRepRequirement(npcType) {
        // Always tradeable - no rep required (includes quest givers)
        const alwaysTrade = [
            'merchant', 'innkeeper', 'general_store', 'baker', 'farmer',
            'fisherman', 'ferryman', 'traveler',
            'elder', 'healer', 'guard', 'priest', 'hunter', 'woodcutter',
            'barkeep', 'sailor', 'explorer', 'adventurer', 'druid',
            'royal_advisor', 'chieftain', 'stablemaster', 'courier'
        ];
        if (alwaysTrade.includes(npcType)) return 0;

        // Shady types - minimal trust needed
        const shadyTrade = ['thief', 'spy', 'smuggler'];
        if (shadyTrade.includes(npcType)) return 5;

        // Low rep (10+) - specialty traders
        const lowRepTrade = ['blacksmith', 'apothecary', 'tailor', 'herbalist', 'miner'];
        if (lowRepTrade.includes(npcType)) return 10;

        // Medium rep (25+) - elite traders
        const medRepTrade = ['jeweler', 'banker', 'guild_master', 'scholar'];
        if (medRepTrade.includes(npcType)) return 25;

        // High rep (50+) - nobility
        const highRepTrade = ['noble'];
        if (highRepTrade.includes(npcType)) return 50;

        // Default - basic trust needed
        return 10;
    },

    // ═══════════════════════════════════════════════════════════════
    // helper methods - the mundane but necessary
    // ═══════════════════════════════════════════════════════════════

    getNPCIcon(type) {
        const icons = {
            elder: '👴', guard: '⚔️', blacksmith: '🔨', merchant: '💰',
            innkeeper: '🍺', healer: '💚', priest: '⛪', apothecary: '🧪',
            traveler: '🚶', courier: '📜', noble: '👑', beggar: '🙏',
            thief: '🗡️', spy: '👁️', ferryman: '⛵', boatman: '💀', stablemaster: '🐴',
            guild_master: '📋', drunk: '🍻', scholar: '📚', jeweler: '💎',
            tailor: '🧵', baker: '🍞', farmer: '🌾', fisherman: '🐟',
            miner: '⛏️', woodcutter: '🪓', barkeep: '🍺', general_store: '🏪',
            herbalist: '🌿', hunter: '🏹', druid: '🌳', sailor: '⚓',
            explorer: '🧭', adventurer: '⚔️', banker: '🏦',
            prophet: '🎭', mysterious_stranger_intro: '🎭', hooded_stranger: '🎭', // 🖤 Hooded Stranger intro NPC
            royal_advisor: '📜', // 🖤💀 NEW: Royal Advisor at Royal Capital
            chieftain: '🪓', // 🖤💀 NEW: Chieftain for Frostholm
            // Tutorial NPCs
            tutorial_merchant: '🛒', tutorial_guide: '📖', tutorial_trainer: '🎓',
            default: '👤'
        };
        return icons[type] || icons.default;
    },

    getNPCTitle(type) {
        const titles = {
            elder: 'Village Elder', guard: 'Town Guard', blacksmith: 'Master Smith',
            merchant: 'Traveling Merchant', innkeeper: 'Innkeeper', healer: 'Healer',
            priest: 'Temple Priest', apothecary: 'Apothecary', traveler: 'Traveler',
            courier: 'Royal Courier', noble: 'Noble', beggar: 'Beggar',
            boatman: 'Ferryman of Worlds',
            thief: 'Shady Character', ferryman: 'Ferryman', stablemaster: 'Stablemaster',
            guild_master: 'Guild Master', drunk: 'Local Drunk', scholar: 'Scholar',
            jeweler: 'Jeweler', tailor: 'Tailor', baker: 'Baker', farmer: 'Farmer',
            fisherman: 'Fisherman', miner: 'Miner', woodcutter: 'Woodcutter',
            barkeep: 'Barkeep', general_store: 'Shopkeeper', herbalist: 'Herbalist',
            hunter: 'Hunter', druid: 'Forest Keeper', sailor: 'Sailor',
            explorer: 'Explorer', adventurer: 'Adventurer', banker: 'Banker',
            prophet: 'Mysterious Prophet', mysterious_stranger_intro: 'Mysterious Figure', hooded_stranger: 'Hooded Stranger', // 🖤 Hooded Stranger
            royal_advisor: 'Royal Advisor', // 🖤💀 NEW: Court sage for Royal Capital
            chieftain: 'Village Chieftain', // 🖤💀 NEW: Frostholm leader
            // Tutorial NPCs
            tutorial_merchant: 'Training Merchant', tutorial_guide: 'Tutorial Guide', tutorial_trainer: 'Combat Trainer',
            default: 'Local'
        };
        return titles[type] || titles.default;
    },

    getNPCDescription(type) {
        const descriptions = {
            elder: 'A wise figure who knows the village history.',
            guard: 'Keeps watch over the settlement.',
            blacksmith: 'Forges weapons and armor.',
            merchant: 'Has goods from distant lands.',
            innkeeper: 'Runs the tavern and knows local gossip.',
            apothecary: 'Brews potions and remedies.',
            farmer: 'Tends to crops and livestock.',
            general_store: 'Sells general supplies and necessities.',
            boatman: 'A cloaked figure beside a shimmering portal. Can transport between worlds.',
            hooded_stranger: 'A mysterious cloaked figure watching from the shadows. They seem to have something important to tell you.',
            royal_advisor: 'A learned counselor to the crown. Knows the kingdom\'s secrets and political intrigues.', // 🖤💀 NEW
            chieftain: 'A hardy northern leader who earned their position through strength. Leads their village through harsh winters.', // 🖤💀 NEW
            // Tutorial NPCs
            tutorial_merchant: 'A friendly merchant helping new traders learn the ropes.',
            tutorial_guide: 'A patient guide who explains how things work around here.',
            tutorial_trainer: 'A veteran fighter who trains newcomers in combat basics.',
            default: 'A local going about their business.'
        };
        return descriptions[type] || descriptions.default;
    },

    formatNPCName(id) {
        if (!id) return 'Stranger';
        return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    // escape html - sanitize or die
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    // get the faction/guild an npc belongs to
    _getNPCFaction(npcType) {
        if (typeof NPCRelationshipSystem === 'undefined') return null;

        const factions = NPCRelationshipSystem.factions || {};
        for (const [factionId, faction] of Object.entries(factions)) {
            if (faction.members && faction.members.includes(npcType)) {
                return { id: factionId, name: faction.name, description: faction.description };
            }
        }
        return null;
    },

    // get npc category for button layouts
    _getNPCCategory(npcType) {
        // Check NPC embedded data first
        if (typeof NPC_EMBEDDED_DATA !== 'undefined' && NPC_EMBEDDED_DATA[npcType]) {
            return NPC_EMBEDDED_DATA[npcType].category || 'unknown';
        }

        // Fallback categorization
        const categories = {
            vendor: ['merchant', 'general_store', 'blacksmith', 'apothecary', 'innkeeper', 'jeweler', 'tailor', 'baker', 'farmer', 'fisherman', 'herbalist'],
            service: ['healer', 'banker', 'stablemaster', 'ferryman', 'priest', 'scholar'],
            authority: ['guard', 'elder', 'noble', 'guild_master', 'captain', 'royal_advisor', 'chieftain'],
            criminal: ['thief', 'robber', 'bandit', 'smuggler', 'informant', 'loan_shark'],
            boss: ['dark_lord', 'bandit_chief', 'dragon', 'necromancer'],
            traveler: ['traveler', 'pilgrim', 'courier', 'beggar', 'drunk', 'sailor']
        };

        for (const [category, types] of Object.entries(categories)) {
            if (types.includes(npcType)) return category;
        }
        return 'unknown';
    },

    // ═══════════════════════════════════════════════════════════════
    // special encounter - for intro/quest-specific npc popups
    // ═══════════════════════════════════════════════════════════════

    // show a special one-time encounter (like intro hooded stranger)
    // This opens the panel directly to chat view with custom actions
    showSpecialEncounter(npcData, options = {}) {
        const {
            greeting = null,           // 🖤 Custom greeting text (overrides API generation)
            customActions = [],        // 🖤 Array of {label, action, priority} for special buttons
            disableChat = false,       // 🖤 If true, hide chat input
            disableBack = false,       // 🖤 If true, hide back button
            onClose = null,            // 🖤 Callback when panel closes
            introText = null,          // 🖤 Narrative text to show before NPC speaks
            playVoice = true,          // 🖤 Whether to play TTS for greeting
            customVoiceHandler = null  // 🎭 Custom async function to play pre-cached TTS
        } = options;

        console.log(`🎭 PeoplePanel: Opening special encounter with ${npcData.name} 🖤💀`);

        // store callback for later
        this._specialEncounterOnClose = onClose;
        this._isSpecialEncounter = true;
        this._specialEncounterActions = customActions;
        this._disableChat = disableChat;

        // open panel directly to chat view
        this.open();

        // Center the panel on screen for special encounters (pixel-based for draggability)
        const panel = document.getElementById(this.panelId);
        if (panel) {
            // Get panel dimensions after it's visible
            const rect = panel.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate centered position in pixels (draggable-friendly)
            const centerLeft = Math.max(20, (viewportWidth - rect.width) / 2);
            const centerTop = Math.max(20, (viewportHeight - rect.height) / 2);

            panel.style.left = centerLeft + 'px';
            panel.style.top = centerTop + 'px';
            panel.style.transform = 'none';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';

            // Ensure panel is draggable and bring to front
            // Reset draggable flag to force re-setup (chat view has different header)
            if (typeof DraggablePanels !== 'undefined') {
                panel.dataset.draggable = 'false';
                DraggablePanels.makeDraggable(panel);
                DraggablePanels.bringToFront(panel);
            }
        }

        // skip list view entirely - go straight to chat
        this.viewMode = 'chat';
        this.currentNPC = npcData;
        this.chatHistory = [];

        document.getElementById('people-list-view')?.classList.add('hidden');
        document.getElementById('people-chat-view')?.classList.remove('hidden');

        // optionally hide back button for forced encounters
        const backBtn = document.querySelector('#people-panel .back-btn');
        if (backBtn) {
            backBtn.style.display = disableBack ? 'none' : '';
        }

        // optionally hide chat input for scripted encounters
        const chatInputArea = document.querySelector('#people-panel .chat-input-area');
        if (chatInputArea) {
            chatInputArea.style.display = disableChat ? 'none' : '';
        }

        this.updateChatHeader(npcData);
        this.clearChatMessages();

        // show intro narrative text first (if provided)
        if (introText) {
            // FIX BUG #1: Don't scroll for intro text - keep at top
            this.addChatMessage(introText, 'system', false);
        }

        // show npc greeting
        if (greeting) {
            // use provided greeting
            setTimeout(async () => {
                // FIX BUG #1: Don't scroll for initial greeting - keep at top
                this.addChatMessage(greeting, 'npc', false);
                this.chatHistory.push({ role: 'assistant', content: greeting });

                // 🎭 Use custom voice handler if provided (pre-cached TTS)
                if (customVoiceHandler) {
                    console.log('🎭 Using custom voice handler for pre-cached TTS');
                    try {
                        const played = await customVoiceHandler();
                        if (played) {
                            console.log('🎭 Pre-cached TTS played successfully');
                            return;
                        }
                    } catch (err) {
                        console.warn('🎭 Custom voice handler failed:', err);
                    }
                    // Fall through to normal TTS if custom handler fails
                }

                // play tts - pass NPC name as source for indicator 🖤💀
                if (playVoice && typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                    NPCVoiceChatSystem.playVoice(greeting, npcData.voice || 'onyx', npcData.name || 'Stranger');
                }
            }, 300);
        } else {
            // generate greeting via api (standard flow)
            this.sendGreeting(npcData);
        }

        // update quick actions with custom actions (after a delay for greeting to render)
        setTimeout(() => {
            this.updateSpecialEncounterActions(customActions);
        }, 500);
    },

    // update quick actions with custom actions for special encounters
    updateSpecialEncounterActions(customActions) {
        const container = document.getElementById('people-quick-actions');
        if (!container) return;

        container.innerHTML = '';

        // add custom actions
        customActions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            if (a.questRelated) btn.classList.add('quest-action-btn');
            if (a.primary) btn.classList.add('primary-action-btn');
            btn.textContent = a.label;
            btn.addEventListener('click', () => {
                // execute action and potentially close encounter
                if (typeof a.action === 'function') {
                    a.action();
                }
                if (a.closeAfter) {
                    this.closeSpecialEncounter();
                }
            });
            container.appendChild(btn);
        });

        container.classList.remove('hidden');
    },

    // close special encounter and cleanup
    closeSpecialEncounter() {
        console.log('🎭 PeoplePanel: Closing special encounter 🖤💀');

        // restore normal ui
        const backBtn = document.querySelector('#people-panel .back-btn');
        if (backBtn) backBtn.style.display = '';

        const chatInputArea = document.querySelector('#people-panel .chat-input-area');
        if (chatInputArea) chatInputArea.style.display = '';

        // fire callback if provided
        if (typeof this._specialEncounterOnClose === 'function') {
            this._specialEncounterOnClose();
        }

        // reset special encounter state
        this._isSpecialEncounter = false;
        this._specialEncounterOnClose = null;
        this._specialEncounterActions = [];
        this._disableChat = false;

        // close the panel
        this.close();
    },

    // add system message to chat (for narrative intro text)
    addSystemMessage(text) {
        this.addChatMessage(text, 'system');
    }
};

// add css for special encounter styling
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* 🎭 Special Encounter Styles */
        #people-panel .chat-message.system {
            background: linear-gradient(135deg, rgba(60, 60, 80, 0.9), rgba(40, 40, 60, 0.9));
            border-left: 3px solid #8080a0;
            font-style: italic;
            color: #c0c0d0;
            padding: 0.75rem 1rem;
            margin: 0.5rem 0;
            border-radius: 4px;
        }

        #people-panel .primary-action-btn {
            background: linear-gradient(135deg, #4a7c59, #3a5a47) !important;
            border: 1px solid #5a9c69 !important;
            font-weight: bold;
        }

        #people-panel .primary-action-btn:hover {
            background: linear-gradient(135deg, #5a9c69, #4a7c59) !important;
            box-shadow: 0 0 10px rgba(90, 156, 105, 0.5);
        }
    `;
    document.head.appendChild(style);
})();

// ═══════════════════════════════════════════════════════════════
// global access
// ═══════════════════════════════════════════════════════════════
window.PeoplePanel = PeoplePanel;
window.openPeoplePanel = function() { PeoplePanel.open(); };
window.closePeoplePanel = function() { PeoplePanel.close(); };
window.togglePeoplePanel = function() { PeoplePanel.toggle(); };

// register with Bootstrap
Bootstrap.register('PeoplePanel', () => PeoplePanel.init(), {
    dependencies: ['NPCManager', 'PanelManager'],
    priority: 105,
    severity: 'optional'
});

console.log('👥 Unified People Panel loaded - talk, trade, quest... all in one dark place 🖤');
