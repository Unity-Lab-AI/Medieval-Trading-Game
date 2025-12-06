// ═══════════════════════════════════════════════════════════════
// 👥 UNIFIED PEOPLE PANEL - talk, trade, quest, exist... all in one dark place
// ═══════════════════════════════════════════════════════════════
// File Version: GameConfig.version.file
// conjured by Unity AI Lab - every soul, every transaction, every whisper
// the NPC list + embedded chat + trade + quest items in seamless harmony
// ═══════════════════════════════════════════════════════════════

const PeoplePanel = {
    // 🔧 CONFIG - the bones of this beast
    panelId: 'people-panel',
    isOpen: false,
    currentNPC: null,
    chatHistory: [],
    isWaitingForResponse: false,
    viewMode: 'list', // 'list' or 'chat'

    // 🚀 INITIALIZE - wake the panel from its slumber
    init() {
        this.createPanelHTML();
        this.setupEventListeners();

        // 🖤 Stop voice playback on page unload to prevent memory leaks 💀
        window.addEventListener('beforeunload', () => {
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.stopVoicePlayback) {
                NPCVoiceChatSystem.stopVoicePlayback();
            }
        });

        console.log('👥 PeoplePanel: unified interface ready... talk, trade, quest, all in one place 🖤');
    },

    // 🏗️ CREATE PANEL HTML - the entire unified interface
    createPanelHTML() {
        if (document.getElementById(this.panelId)) {
            return;
        }

        const overlayContainer = document.getElementById('overlay-container');
        if (!overlayContainer) {
            console.warn('👥 PeoplePanel: overlay-container not found');
            return;
        }

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
                <div class="panel-header chat-header">
                    <button class="back-btn" data-action="back-to-list">← Back</button>
                    <div class="npc-header-info">
                        <span id="chat-npc-icon" class="npc-icon">👤</span>
                        <div class="npc-header-text">
                            <h2 id="chat-npc-name">NPC Name</h2>
                            <span id="chat-npc-title" class="npc-title">Title</span>
                        </div>
                    </div>
                    <div class="npc-header-badges" id="chat-npc-badges"></div>
                </div>
                <!-- 📊 NPC Stats Bar - horizontal layout -->
                <div class="npc-stats-bar" id="npc-stats-bar">
                    <div class="npc-stat-item" title="Relationship">
                        <span class="stat-icon" id="npc-relation-icon">😐</span>
                        <span class="stat-label" id="npc-relation-label">Neutral</span>
                    </div>
                    <div class="npc-stat-item" title="Reputation (current / trade requirement)">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value" id="npc-reputation-value">0</span><span class="stat-sep">/</span><span class="stat-value stat-req" id="npc-rep-required">0</span>
                    </div>
                    <div class="npc-stat-item" title="Trades Completed">
                        <span class="stat-icon">🤝</span>
                        <span class="stat-value" id="npc-trades-value">0</span>
                    </div>
                    <div class="npc-stat-item" title="Gold Traded">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value" id="npc-gold-traded-value">0</span>
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
                        <button class="trade-btn" data-action="open-trade">Trade with NPC</button>
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

        overlayContainer.appendChild(panel);
        this.addStyles();
        console.log('👥 PeoplePanel: Unified panel created');
    },

    // 🎨 ADD STYLES - making it not look like garbage
    addStyles() {
        if (document.getElementById('people-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'people-panel-styles';
        styles.textContent = `
            /* 🖤 People Panel Unified Styles */
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

            /* 🖤💀 WOW-STYLE QUEST MARKERS - Exclamation Points & Question Marks 💀 */
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
                gap: 4px;
            }

            .badge {
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.75em;
                font-weight: bold;
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

            /* 🖤 Quest Action Buttons - special styling 💀 */
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

    // 👂 SETUP EVENT LISTENERS
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
            // 🖤💀 Handle panel button actions - no more inline onclick garbage
            if (e.target.matches('[data-action="back-to-list"]')) {
                this.showListView();
            }
            if (e.target.matches('[data-action="open-trade"]')) {
                this.openFullTrade();
            }
            if (e.target.matches('[data-action="send-message"]')) {
                this.sendMessage();
            }
        });

        // 🖤 listen for quest updates
        document.addEventListener('quest-assigned', () => {
            this.updateQuestItems();
            // 🖤💀 CRITICAL: Refresh NPC list to update quest markers (! and ?) on portraits
            if (this.viewMode === 'list') {
                this.showNPCList(); // Rebuild cards with updated markers
            }
        });
        document.addEventListener('quest-completed', () => {
            this.updateQuestItems();
            // 🖤💀 Also refresh stats bar AND trade section to show updated reputation after quest reward
            if (this.currentNPC && this.viewMode === 'chat') {
                this.updateNPCStatsBar(this.currentNPC);
                this.updateTradeSection(this.currentNPC); // 🖤💀 FIXED: Refresh trade section too!
            }
            // 🖤💀 CRITICAL: Refresh NPC list to update quest markers (! and ?) on portraits
            if (this.viewMode === 'list') {
                this.showNPCList(); // Rebuild cards with updated markers
            }
        });

        // 🖤💀 FIXED: Listen for reputation changes to update stats bar AND trade section in real-time 💀
        document.addEventListener('npc-reputation-changed', (e) => {
            if (this.currentNPC && this.viewMode === 'chat') {
                const npcId = this.currentNPC.id || this.currentNPC.type;
                const npcType = this.currentNPC.type;
                // 🦇 Refresh if the changed NPC matches by id, type, or contains the type
                if (e.detail.npcId === npcId || e.detail.npcId === npcType || e.detail.npcId.includes(npcType)) {
                    this.updateNPCStatsBar(this.currentNPC);
                    this.updateTradeSection(this.currentNPC); // 🖤💀 Also refresh trade section to update rep requirement display!
                }
            }
        });
    },

    // 🔓 OPEN PANEL
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
        console.log('👥 PeoplePanel: Opened');
    },

    // 🔒 CLOSE PANEL
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

    // 📋 SHOW LIST VIEW
    showListView() {
        this.viewMode = 'list';
        document.getElementById('people-list-view')?.classList.remove('hidden');
        document.getElementById('people-chat-view')?.classList.add('hidden');
        this.currentNPC = null;
        this.stopVoice();
    },

    // 💬 SHOW CHAT VIEW
    showChatView(npcData) {
        this.viewMode = 'chat';
        this.currentNPC = npcData;
        this.chatHistory = [];

        document.getElementById('people-list-view')?.classList.add('hidden');
        document.getElementById('people-chat-view')?.classList.remove('hidden');

        // 🦇 Record NPC meeting for quest availability
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

        // 🖤 Start conversation with greeting
        this.sendGreeting(npcData);

        // Focus input
        setTimeout(() => {
            document.getElementById('people-chat-input')?.focus();
        }, 100);
    },

    // 🔄 REFRESH NPC LIST
    refresh() {
        const locationContext = document.getElementById('people-location-context');
        const peopleList = document.getElementById('people-list');
        const emptyState = document.getElementById('people-empty');

        if (!peopleList) return;

        peopleList.innerHTML = '';

        const currentLocation = game?.currentLocation;
        const locationId = currentLocation?.id || null;

        // 🖤 Use doom-aware location name if DoomWorldSystem is active 💀
        let locationName = currentLocation?.name || 'Unknown Location';
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive && DoomWorldSystem.getCurrentLocationName && locationId) {
            locationName = DoomWorldSystem.getCurrentLocationName(locationId);
        }

        if (locationContext) {
            locationContext.textContent = `📍 ${locationName}`;
        }

        // 🦇 Get NPCs from GameWorld's spawn system
        let npcs = [];
        if (typeof GameWorld !== 'undefined' && locationId) {
            npcs = GameWorld.getNPCDataForLocation(locationId) || [];
        }

        // 💀 Fallback sources
        if (npcs.length === 0 && typeof NPCManager !== 'undefined' && locationId) {
            npcs = NPCManager.getAvailableNPCs(locationId) || [];
        }

        // 🖤 Add Boatman NPC if available at this location 💀
        if (typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isBoatmanHere(locationId)) {
            const boatman = DoomWorldSystem.getBoatmanNPC();
            // 🦇 Don't add duplicate
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

    // 🎴 CREATE NPC CARD
    createNPCCard(npc) {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npcId = npc.id;

        const icon = this.getNPCIcon(npc.type || npc.id);
        // 🖤💀 Escape NPC data for XSS safety - never trust external data
        const name = this.escapeHtml(npc.name || this.formatNPCName(npc.id));
        const title = this.escapeHtml(npc.title || this.getNPCTitle(npc.type || npc.id));
        const description = this.escapeHtml(npc.description || this.getNPCDescription(npc.type || npc.id));

        // 🖤💀 WOW-STYLE QUEST MARKERS - Check for quest status 💀
        const npcTypeForQuest = npc.type || npc.id;
        console.log(`🎴 createNPCCard: NPC "${name}" (id: ${npc.id}, type: ${npc.type}, using: ${npcTypeForQuest})`);
        const questMarker = this.getQuestMarker(npcTypeForQuest);
        const hasDelivery = this.npcHasDeliveryForThem(npc.type || npc.id);
        // 🖤💀 Also check npc.canTrade for random encounters (smuggler, courier, pilgrim) 💀
        const canTrade = this.npcCanTrade(npc.type || npc.id) || npc.canTrade;

        let badges = '';
        if (questMarker) {
            badges += `<span class="quest-badge ${questMarker.style}">${questMarker.marker}</span>`;
        }
        if (canTrade) badges += '<span class="trade-badge">💰</span>';

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

    // 🗨️ TALK TO NPC - opens chat view
    talkTo(npc) {
        let npcData = npc;

        // 🖤💀 SPECIAL HANDLER: Hooded Stranger - offers initial quest if not accepted yet 💀
        if ((npc.type === 'hooded_stranger' || npc.id?.includes('hooded_stranger')) &&
            typeof InitialEncounterSystem !== 'undefined' &&
            InitialEncounterSystem.needsInitialQuest?.()) {
            console.log('👥 PeoplePanel: Hooded Stranger clicked - showing quest offer!');
            this._showHoodedStrangerQuestOffer(npc);
            return;
        }

        // 🖤 Enrich with persona data if available
        if (typeof NPCPersonaDatabase !== 'undefined') {
            const persona = NPCPersonaDatabase.getPersona(npc.type || npc.id);
            if (persona) {
                npcData = { ...npc, ...persona, id: npc.id, type: npc.type };
            }
        }

        console.log(`👥 PeoplePanel: Starting conversation with ${npcData.name}`);
        this.showChatView(npcData);
    },

    // 🖤💀 Show the Hooded Stranger quest offer (for players who declined initially) 💀
    _showHoodedStrangerQuestOffer(npc) {
        const playerName = typeof game !== 'undefined' ? game.player?.name : 'Traveler';
        const questOffer = InitialEncounterSystem.offerInitialQuestFromStranger?.();

        if (!questOffer?.canAcceptQuest) {
            // Quest already accepted - just show normal chat
            console.log('👥 PeoplePanel: Quest already accepted, showing normal chat');
            this.showChatView(npc);
            return;
        }

        // 🖤 Show special encounter with quest offer
        this.showSpecialEncounter(InitialEncounterSystem.mysteriousStranger, {
            introText: 'The hooded figure turns to face you, ancient eyes gleaming beneath the cowl...',
            greeting: questOffer.dialogue,
            disableChat: true,
            disableBack: false, // 🖤 Can back out this time
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

    // 📝 UPDATE CHAT HEADER
    updateChatHeader(npcData) {
        const icon = this.getNPCIcon(npcData.type || npcData.id);
        const name = npcData.name || this.formatNPCName(npcData.id);
        const title = npcData.title || this.getNPCTitle(npcData.type || npcData.id);

        document.getElementById('chat-npc-icon').textContent = icon;
        document.getElementById('chat-npc-name').textContent = name;
        document.getElementById('chat-npc-title').textContent = title;

        // 🖤 Update badges
        const badges = document.getElementById('chat-npc-badges');
        badges.innerHTML = '';

        // 🖤💀 WOW-STYLE QUEST BADGES 💀
        const questMarker = this.getQuestMarker(npcData.type || npcData.id);
        if (questMarker) {
            if (questMarker.marker === '?') {
                // Quest to turn in or in progress
                const isComplete = questMarker.style.includes('complete');
                const isMain = questMarker.style.includes('main');
                const badgeClass = isComplete ? 'badge-quest-complete' : 'badge-quest-progress';
                const text = isComplete ? '? Turn In' : '? In Progress';
                badges.innerHTML += `<span class="badge ${badgeClass}">${text}</span>`;
            } else {
                // Quest available
                const isMain = questMarker.style.includes('main');
                const badgeClass = isMain ? 'badge-quest-main' : 'badge-quest';
                badges.innerHTML += `<span class="badge ${badgeClass}">! Quest</span>`;
            }
        }
        if (this.npcHasDeliveryForThem(npcData.type || npcData.id)) {
            badges.innerHTML += '<span class="badge badge-delivery">📦 Delivery</span>';
        }
        // 🖤💀 Also check npcData.canTrade for random encounters (smuggler, courier, pilgrim) 💀
        if (this.npcCanTrade(npcData.type || npcData.id) || npcData.canTrade) {
            badges.innerHTML += '<span class="badge badge-trade">💰 Trade</span>';
        }
    },

    // 📊 UPDATE NPC STATS BAR - horizontal relationship/trade stats
    updateNPCStatsBar(npcData) {
        const npcId = npcData.id || npcData.type;

        // 🖤 Get relationship data from NPCRelationshipSystem
        let relationship = { level: 'neutral', reputation: 0 };
        let tradeStats = { timesTraded: 0, totalGoldTraded: 0 };

        if (typeof NPCRelationshipSystem !== 'undefined') {
            const rel = NPCRelationshipSystem.relationships?.[npcId];
            if (rel) {
                // 🖤💀 getRelationshipLevel returns { key, icon, label, min, max } object
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

        // 🦇 Get level info for icon and label - already retrieved from getRelationshipLevel
        const levelInfo = relationship.levelInfo;

        const icon = levelInfo?.icon || '😐';
        const label = levelInfo?.label || 'Neutral';

        // 🖤💀 Get the trade requirement for this NPC type 💀
        const npcType = npcData.type || npcData.id;
        const repRequired = this.getTradeRepRequirement(npcType);
        const canTrade = this.npcCanTrade(npcType) || npcData.canTrade;

        // 🖤 Update UI elements
        const relationIcon = document.getElementById('npc-relation-icon');
        const relationLabel = document.getElementById('npc-relation-label');
        const reputationValue = document.getElementById('npc-reputation-value');
        const repRequiredEl = document.getElementById('npc-rep-required');
        const tradesValue = document.getElementById('npc-trades-value');
        const goldTradedValue = document.getElementById('npc-gold-traded-value');

        if (relationIcon) relationIcon.textContent = icon;
        if (relationLabel) relationLabel.textContent = label;
        if (reputationValue) {
            reputationValue.textContent = relationship.reputation;
            // 🖤💀 Color code: green if trade unlocked, yellow if close, red if far 💀
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
            // 🖤 Show requirement in muted color, or green if already met
            repRequiredEl.style.color = canTrade ? '#4a9' : '#888';
        }
        if (tradesValue) tradesValue.textContent = tradeStats.timesTraded;
        if (goldTradedValue) goldTradedValue.textContent = tradeStats.totalGoldTraded.toLocaleString();
    },

    // 💬 SEND GREETING - 🖤 Now uses NPCInstructionTemplates for NPC-specific greetings 💀
    async sendGreeting(npcData) {
        this.addChatMessage('*Approaching...*', 'system');

        // 🖤 Generate greeting via API with standardized GREETING action 💀
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startConversation(npcData.id, npcData);

            try {
                // 🦇 Use GREETING action type for proper NPC-specific instructions
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

                this.addChatMessage(response.text, 'npc');
                this.chatHistory.push({ role: 'assistant', content: response.text });

                // 🔊 Play TTS with NPC-specific voice from templates
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.getNPCVoice(npcData);
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }
            } catch (e) {
                console.error('🖤 Greeting error:', e);
                const fallback = this.getFallbackGreeting(npcData);
                this.addChatMessage(fallback, 'npc');
                this.chatHistory.push({ role: 'assistant', content: fallback });
            }
        } else {
            const fallback = this.getFallbackGreeting(npcData);
            this.addChatMessage(fallback, 'npc');
        }
    },

    getFallbackGreeting(npcData) {
        const greetings = {
            innkeeper: "Welcome, traveler! Looking for a room or perhaps some ale?",
            blacksmith: "*wipes sweat from brow* What can I forge for you today?",
            merchant: "Ah, a customer! Come see my wares, friend.",
            apothecary: "Greetings. Need potions? Remedies? I have what ails you.",
            guard: "Halt. State your business.",
            farmer: "Good day to you! Fresh produce for sale.",
            default: "Hello there. What brings you here?"
        };
        return greetings[npcData.type] || greetings.default;
    },

    // 💬 SEND MESSAGE
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
                // 🖤💀 INCLUDE QUEST CONTEXT so the AI knows what quests to offer/check/complete!
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
                    options  // 🖤💀 Pass the quest context!
                );

                // 🖤 Remove typing indicator
                const messages = document.getElementById('people-chat-messages');
                const typing = messages?.querySelector('.typing-indicator');
                if (typing) typing.remove();

                this.addChatMessage(response.text, 'npc');
                this.chatHistory.push({ role: 'assistant', content: response.text });

                // 🔊 Play TTS with NPC-specific voice
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.getNPCVoice(this.currentNPC);
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }

                // 🖤 Update quest items in case something changed
                this.updateQuestItems();
                // 🖤💀 Also update quick actions in case quest status changed
                this.updateQuickActions(this.currentNPC);
            }
        } catch (e) {
            // 🖤 API error - NPC gracefully deflects with in-character response
            console.error('🖤 Chat error:', e);
            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();
            this.addChatMessage("*seems distracted*", 'npc');
        }

        this.isWaitingForResponse = false;
    },

    // 💬 ADD CHAT MESSAGE
    addChatMessage(text, type) {
        const container = document.getElementById('people-chat-messages');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `chat-message ${type}`;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    },

    clearChatMessages() {
        const container = document.getElementById('people-chat-messages');
        if (container) container.innerHTML = '';
    },

    // 🎯 UPDATE QUICK ACTIONS
    updateQuickActions(npcData) {
        const container = document.getElementById('people-quick-actions');
        if (!container) return;

        const npcType = npcData.type || npcData.id;
        const npcName = npcData.name || npcType;
        const actions = [];
        const location = game?.currentLocation?.id;

        // 🖤 QUEST ACTIONS - Check what quests are available with this NPC 💀
        if (typeof QuestSystem !== 'undefined') {
            // 🎉 TURN IN QUEST - Player has completed quest objectives, NPC is the giver
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

            // 📦 DELIVERY - Player has delivery FOR this NPC (different from completing AT quest giver)
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

            // 📋 START QUEST - NPC has quests to offer
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

            // ⏳ CHECK PROGRESS - Player has active quests from this NPC
            // 🖤💀 Show INDIVIDUAL buttons for each quest, not one generic button!
            const activeFromNPC = QuestSystem.getActiveQuestsForNPC(npcType, location);
            const inProgress = activeFromNPC.filter(q => {
                const progress = QuestSystem.checkProgress(q.id);
                return progress.status === 'in_progress';
            });
            if (inProgress.length > 0) {
                inProgress.forEach(quest => {
                    actions.push({
                        label: `⏳ Progress: ${quest.name}`,
                        action: () => this.askQuestProgressSpecific(quest),
                        priority: 4,
                        questRelated: true
                    });
                });
            }
        }

        // 🖤 Trade-related actions - vendors and service NPCs
        // 🖤💀 Also check npcData.canTrade for random encounters (smuggler, courier, pilgrim) 💀
        if (this.npcCanTrade(npcType) || npcData.canTrade) {
            actions.push({ label: '💰 Browse wares', action: () => this.askAboutWares(), priority: 10 });

            // 🖤💀 "Open market" button ONLY at Royal Capital with merchant NPC 💀
            // This opens the grand city market, not the NPC's personal inventory
            const currentLocationId = game?.currentLocation?.id;
            if (currentLocationId === 'royal_capital' && npcType === 'merchant') {
                actions.push({ label: '🏛️ Open Grand Market', action: () => this.openGrandMarket(), priority: 11 });
            }
        }

        // 🖤 Rumors - innkeepers, travelers, merchants know gossip
        const gossipNPCs = ['innkeeper', 'merchant', 'traveler', 'drunk', 'sailor', 'informant'];
        if (gossipNPCs.includes(npcType)) {
            actions.push({ label: '🗣️ Ask for rumors', action: () => this.askRumors(), priority: 20 });
        }

        // 🖤 Rest action - innkeeper only
        if (npcType === 'innkeeper') {
            actions.push({ label: '🛏️ I need rest', action: () => this.askForRest(), priority: 21 });
        }

        // 🖤 Heal action - healers only
        if (['healer', 'priest', 'apothecary'].includes(npcType)) {
            actions.push({ label: '💚 I need healing', action: () => this.askForHealing(), priority: 22 });
        }

        // 🖤 BOATMAN PORTAL ACTION - Special case for doom world access 💀
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

        // 🖤💀 ENCOUNTER-SPECIFIC ACTIONS - Give gold, Attack, etc. 💀
        // These show for ALL NPCs as interaction options
        const isEncounter = npcData.isEncounter || this._isSpecialEncounter;

        // 💰 Give Gold - charity or bribery, you decide
        actions.push({
            label: '💰 Give Gold',
            action: () => this.giveGoldToNPC(),
            priority: 30
        });

        // 🎁 Give Item - gift an item from inventory
        actions.push({
            label: '🎁 Give Item',
            action: () => this.giveItemToNPC(),
            priority: 31
        });

        // ⚔️ Attack - violence is always an option (but has consequences)
        // 🖤💀 Boatman is mystical - cannot be attacked. Guards/nobles protected unless encounter. 💀
        const unattackableNPCs = ['guard', 'noble', 'king', 'queen', 'boatman', 'ferryman'];
        if (!unattackableNPCs.includes(npcType) || isEncounter) {
            actions.push({
                label: '⚔️ Attack',
                action: () => this.attackNPC(),
                priority: 80
            });
        }

        // 🗡️ Rob/Pickpocket - for the morally flexible
        if (['merchant', 'traveler', 'noble', 'pilgrim', 'beggar', 'drunk'].includes(npcType)) {
            actions.push({
                label: '🗡️ Pickpocket',
                action: () => this.pickpocketNPC(),
                priority: 81
            });
        }

        // 🏃 Flee - get the fuck out
        if (isEncounter) {
            actions.push({
                label: '🏃 Flee',
                action: () => this.fleeFromEncounter(),
                priority: 90
            });
        }

        // 🖤 Generic actions - always available
        actions.push({ label: '❓ Ask for directions', action: () => this.askDirections(), priority: 50 });
        actions.push({ label: '👋 Say goodbye', action: () => this.sayGoodbye(), priority: 100 });

        // 🖤 Sort by priority (quest actions first) 💀
        actions.sort((a, b) => (a.priority || 50) - (b.priority || 50));

        container.innerHTML = '';
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            if (a.questRelated) btn.classList.add('quest-action-btn');
            btn.textContent = a.label;
            btn.addEventListener('click', a.action);
            container.appendChild(btn);
        });

        container.classList.remove('hidden');
    },

    // 🎉 GET QUESTS READY TO COMPLETE - where this NPC is the quest GIVER or TURN-IN target
    getQuestsReadyToComplete(npcType) {
        if (typeof QuestSystem === 'undefined') return [];

        const location = game?.currentLocation?.id;
        console.log(`  📋 getQuestsReadyToComplete('${npcType}') at '${location}'`);

        // 🖤💀 Get quests where this NPC is the GIVER
        const activeFromNPC = QuestSystem.getActiveQuestsForNPC(npcType, location);
        console.log(`    activeFromNPC:`, activeFromNPC.map(q => `${q.id} (giver:${q.giver})`));

        // 🖤💀 ALSO get quests where this NPC is the TURN-IN target (might be different from giver!)
        const allActive = Object.values(QuestSystem.activeQuests || {});
        console.log(`    allActive:`, allActive.map(q => `${q.id} (turnIn:${q.turnInNpc}, loc:${q.turnInLocation})`))

        const turnInQuests = allActive.filter(q => {
            // 🖤💀 FIX: More precise matching for turn-in NPCs 💀
            // Check if turnInNpc EXACTLY matches (use strict comparison)
            const turnInMatches = q.turnInNpc && q.turnInNpc === npcType;
            // Check if final talk objective EXACTLY targets this NPC type AND location
            const talkObj = q.objectives?.find(o => o.type === 'talk' && !o.completed);
            const talkNpcMatches = talkObj && talkObj.npc === npcType;
            const talkLocationMatches = !talkObj || !talkObj.location || talkObj.location === location || talkObj.location === 'any';
            const talkMatches = talkNpcMatches && talkLocationMatches;
            // 🖤 LOCATION CHECK: Ensure turn-in is at THIS location
            const locationMatches = !location || !q.turnInLocation || q.turnInLocation === location || q.turnInLocation === 'any';

            return (turnInMatches || talkMatches) && locationMatches;
        });
        console.log(`    turnInQuests:`, turnInQuests.map(q => q.id));

        // 🦇 Combine and dedupe
        const combined = [...activeFromNPC, ...turnInQuests];
        const uniqueQuests = [...new Map(combined.map(q => [q.id, q])).values()];
        console.log(`    uniqueQuests (before ready filter):`, uniqueQuests.map(q => q.id));

        const result = uniqueQuests.filter(q => {
            const progress = QuestSystem.checkProgress(q.id);
            console.log(`    ${q.id} progress:`, progress.status, 'objectives:', q.objectives?.map(o => `${o.type}:${o.completed}`));

            // 🖤💀 Standard check - all objectives complete
            if (progress.status === 'ready_to_complete') return true;

            // 🖤💀 SPECIAL CASE: If only the final "talk" objective remains AND we're talking to that NPC
            // Then treat as ready_to_complete (talking IS the completion action!)
            if (progress.status === 'in_progress') {
                const incompleteObjs = q.objectives?.filter(o => {
                    if (o.type === 'collect' || o.type === 'defeat' || o.type === 'buy' || o.type === 'trade') {
                        return (o.current || 0) < o.count;
                    } else if (o.type === 'explore') {
                        return (o.current || 0) < o.rooms;
                    }
                    return !o.completed;
                }) || [];

                // If only 1 incomplete objective AND it's a talk to THIS NPC at THIS location
                if (incompleteObjs.length === 1 && incompleteObjs[0].type === 'talk') {
                    const talkObj = incompleteObjs[0];
                    const talkTarget = talkObj.npc;
                    const talkLocation = talkObj.location;
                    const npcMatches = QuestSystem._npcMatchesObjective?.(npcType, talkTarget);
                    const locationMatches = !talkLocation || talkLocation === location || talkLocation === 'any';
                    if (npcMatches && locationMatches) {
                        return true; // 🖤 Talking to them IS the completion action!
                    }
                }
            }

            return false;
        });
        console.log(`    FINAL result:`, result.map(q => `${q.id} (status: ${QuestSystem.checkProgress(q.id).status})`));
        return result;
    },

    // 📦 GET DELIVERIES FOR NPC - where this NPC is the RECIPIENT (not the giver)
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

    // 📜 ASK ABOUT QUEST - Prompt NPC to offer this quest
    // 🖤💀 FIXED: Directly assign the quest, API is just for flavor text! 💀
    async askAboutQuest(quest) {
        const questId = quest.id || quest.questId;

        // 🖤 Display player message
        const message = `I heard you might have work available? Tell me about "${quest.name}".`;
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // 🖤💀 CRITICAL: DIRECTLY assign the quest - don't wait for API! 💀
        let assignResult = null;
        if (typeof QuestSystem !== 'undefined' && QuestSystem.assignQuest) {
            assignResult = QuestSystem.assignQuest(questId, { name: this.currentNPC?.name || 'NPC' });
            console.log(`🎭 Quest assignment result for ${questId}:`, assignResult);
        }

        // 🖤 Generate NPC response (flavor text only - quest already assigned!)
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

        // 🔊 Play TTS
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // 🖤 Update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // ✅ ASK TO COMPLETE QUEST - Tell NPC we've finished
    // 🖤💀 FIXED: Directly complete the quest, API is just for flavor text! 💀
    async askToCompleteQuest(quest) {
        const questId = quest.id || quest.questId;

        // 🖤 Display player message
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

        // 🖤💀 CRITICAL: DIRECTLY complete the quest - don't wait for API! 💀
        let completionResult = null;
        if (typeof QuestSystem !== 'undefined' && QuestSystem.completeQuest) {
            completionResult = QuestSystem.completeQuest(questId);
            console.log(`🎭 Quest completion result for ${questId}:`, completionResult);
        }

        // 🖤 Generate NPC response (flavor text only - quest already completed!)
        const npcType = this.currentNPC?.type || 'stranger';
        let npcResponse;

        if (completionResult?.success) {
            // Quest completed successfully!
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

        this.addChatMessage(npcResponse, 'npc');
        this.chatHistory.push({ role: 'assistant', content: npcResponse });

        // 🔊 Play TTS
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // 🖤 Update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // 📦 DELIVER QUEST ITEM - Hand over delivery to recipient NPC
    // 🖤💀 FIXED: Directly deliver item and complete quest! 💀
    async deliverQuestItem(quest) {
        const questId = quest.questId || quest.id;
        const itemId = quest.itemId;
        const itemName = quest.itemName || itemId;

        // 🖤 Display player message
        const message = `I have a delivery for you - a ${itemName} from ${quest.giverName || 'someone'}.`;
        this.addChatMessage(message, 'player');
        this.chatHistory.push({ role: 'user', content: message });

        // 🖤💀 CRITICAL: Take the quest item and complete the quest! 💀
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

        // 🔊 Play TTS
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(npcResponse, voice);
        }

        // 🖤 Update UI
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // ⏳ ASK QUEST PROGRESS - Check status of active quests (generic)
    async askQuestProgress() {
        const message = `How am I doing on the tasks you gave me?`;
        await this.sendQuestActionMessage('CHECK_PROGRESS', message, null);
    },

    // 🖤💀 ASK QUEST PROGRESS SPECIFIC - Check status of a SPECIFIC quest
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

    // 🖤💀 NEW: Send quest-specific action message with full quest context 💀
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

            // 🖤 Build quest-specific context for API instructions 💀
            const questContext = quest ? {
                questId: quest.id || quest.questId,
                questName: quest.name || quest.questName,
                questType: quest.type || quest.questType,
                rewards: quest.rewards,
                objectives: quest.objectives,
                itemName: quest.itemName,
                giverName: quest.giverName
            } : null;

            // 🦇 Get progress info if checking progress
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

            // 🖤 Remove typing indicator
            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            if (!response || !response.text) {
                throw new Error('Empty response from API');
            }

            // 🖤💀 CRITICAL: Parse and execute commands from API response! 💀
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

            // 🔊 Play TTS with NPC-specific voice (use clean text without commands)
            if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                const voice = this.getNPCVoice(this.currentNPC);
                NPCVoiceChatSystem.playVoice(cleanText, voice);
            }

            // 🖤 Update quest items and quick actions in case quest state changed
            this.updateQuestItems();
            this.updateQuickActions(this.currentNPC);

        } catch (e) {
            console.error('🖤 Quest action message error:', e);

            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            // 🦇 Use quest-specific fallback responses
            const fallback = this.getQuestActionFallback(actionType, quest);
            this.addChatMessage(fallback, 'npc');
            this.chatHistory.push({ role: 'assistant', content: fallback });

            // 🖤💀 CRITICAL: Actually execute the quest action even in fallback! 💀
            // If API fails but user clicked "Complete Quest", we should still complete it
            this.executeQuestActionFallback(actionType, quest);
        }

        this.isWaitingForResponse = false;
        this._currentQuestAction = null;

        // 🖤 Update UI after quest action
        this.updateQuestItems();
        this.updateQuickActions(this.currentNPC);
    },

    // 🖤💀 Execute quest action when API fails - the fallback must work! 💀
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

    // 🖤 Get fallback response for quest actions 💀
    getQuestActionFallback(actionType, quest) {
        const questName = quest?.name || quest?.questName || 'the task';

        // 🖤💀 CHECK_PROGRESS: Check actual quest status to give accurate fallback 💀
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

    // 📦 UPDATE QUEST ITEMS SECTION
    updateQuestItems() {
        const container = document.getElementById('people-quest-items');
        const list = document.getElementById('quest-items-list');
        if (!container || !list || !this.currentNPC) return;

        list.innerHTML = '';

        // 🖤 Get player's quest items
        const questItems = game?.player?.questItems || {};
        const npcType = this.currentNPC.type || this.currentNPC.id;

        // 🖤 Find deliveries meant for this NPC
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

    // 📦 GIVE QUEST ITEM
    async giveQuestItem(questId, itemId) {
        const message = `Here, I have a delivery for you. *hands over the package*`;
        document.getElementById('people-chat-input').value = message;
        await this.sendMessage();
    },

    // 🛒 UPDATE TRADE SECTION
    updateTradeSection(npcData) {
        const container = document.getElementById('people-trade-section');
        const preview = document.getElementById('trade-preview');
        if (!container || !preview) return;

        const npcType = npcData.type || npcData.id;
        // 🖤💀 Also check npcData.canTrade for random encounters (smuggler, courier, pilgrim) 💀
        const canTrade = this.npcCanTrade(npcType) || npcData.canTrade;
        const repRequired = this.getTradeRepRequirement(npcType);
        const currentRep = this.getNPCReputation(npcType);

        // 🖤 Always show trade section for potential traders, but indicate locked status
        // 🖤💀 Also include NPCs with canTrade flag from encounters 💀
        const potentialTrader = npcData.canTrade || repRequired > 0 || ['merchant', 'innkeeper', 'general_store', 'baker',
            'farmer', 'fisherman', 'ferryman', 'traveler', 'blacksmith', 'apothecary',
            'tailor', 'herbalist', 'miner', 'jeweler', 'banker', 'guild_master', 'noble'].includes(npcType);

        if (potentialTrader) {
            container.classList.remove('hidden');

            if (canTrade) {
                // 💰 Can trade - show ACTUAL NPC inventory, not location config!
                // 🖤💀 FIX: Use NPCTradeWindow.getNPCInventory() to get real items 💀
                let actualItems = [];
                if (typeof NPCTradeWindow !== 'undefined' && this.currentNPC) {
                    const npcInv = NPCTradeWindow.getNPCInventory(this.currentNPC);
                    if (npcInv && typeof npcInv === 'object') {
                        // Get item names, exclude 'gold' from the list
                        actualItems = Object.keys(npcInv).filter(k => k !== 'gold' && npcInv[k] > 0);
                    }
                }

                if (actualItems.length > 0) {
                    // 🖤 Show actual items this NPC has - format nicely 💀
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

                // 🖤 Update button to be active - opens NPC's inventory
                const btn = container.querySelector('.trade-btn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Trade with NPC';
                    btn.style.opacity = '1';
                }
            } else {
                // 🔒 Trade locked - show rep requirement
                const repNeeded = repRequired - currentRep;
                preview.innerHTML = `<span style="color:#c66">🔒 Trade Locked</span><br>Reputation: ${currentRep}/${repRequired} (need ${repNeeded} more)<br><span style="color:#888;font-size:0.85em">Complete quests, trade, or help them to gain rep</span>`;

                // 🖤 Disable button
                const btn = container.querySelector('.trade-btn');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = `Need ${repRequired} Rep`;
                    btn.style.opacity = '0.5';
                }
            }
        } else {
            container.classList.add('hidden');
        }
    },

    // 🎯 QUICK ACTION METHODS - 🖤 Now use NPCInstructionTemplates for proper API instructions 💀
    async askAboutWares() {
        if (!this.currentNPC) return;

        // 🖤💀 "Browse Wares" directly opens NPC's inventory - no API needed! 💀
        // The player clicked "Browse Wares" - they want to SEE the wares, not hear about them
        this.addChatMessage("Show me what you have for sale.", 'player');
        this.chatHistory.push({ role: 'user', content: "Show me what you have for sale." });

        // 🖤 Quick NPC response then open trade
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

        // 🖤 Play TTS for the response
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = this.getNPCVoice(this.currentNPC);
            NPCVoiceChatSystem.playVoice(response, voice);
        }

        // 🖤 Open the NPC's inventory after a short delay for the message to show
        setTimeout(() => this.openFullTrade(), 500);
    },

    async askAboutWork() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized ASK_QUEST instruction to API 💀
        await this.sendActionMessage('ask_quest', "Do you have any work for me?");
    },

    async mentionDelivery() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized TURN_IN_QUEST instruction to API 💀
        await this.sendActionMessage('turn_in_quest', "I have a delivery for you.");
    },

    async askDirections() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized ASK_DIRECTIONS instruction to API 💀
        await this.sendActionMessage('ask_directions', "Can you tell me about nearby places?");
    },

    async sayGoodbye() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized FAREWELL instruction to API 💀
        await this.sendActionMessage('farewell', "I should be going. Farewell.");
        setTimeout(() => this.showListView(), 2000);
    },

    async askRumors() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized ASK_RUMORS instruction to API 💀
        await this.sendActionMessage('ask_rumors', "Heard any interesting rumors lately?");
    },

    async askForRest() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized REST instruction to API 💀
        await this.sendActionMessage('rest', "I need a room to rest.");
    },

    async askForHealing() {
        if (!this.currentNPC) return;

        // 🖤 Send standardized HEAL instruction to API 💀
        await this.sendActionMessage('heal', "I'm injured. Can you help me?");
    },

    // ═══════════════════════════════════════════════════════════════
    // 💀 BOATMAN PORTAL METHODS - Doom World Access 🦇
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Use the boatman's portal to travel between worlds
    async useBoatmanPortal(destination) {
        if (!this.currentNPC || this.currentNPC.type !== 'boatman') {
            console.warn('💀 useBoatmanPortal called without boatman NPC');
            return;
        }

        const currentLocation = game?.currentLocation?.id || 'shadow_dungeon';

        // 🦇 Display atmospheric message in chat
        if (destination === 'doom') {
            this.addChatMessage("*reaches toward the shimmering portal*", 'player');
            this.addChatMessage("*The Boatman's hollow voice echoes* So you choose to witness what could have been... Step through, and may your resolve not falter.", 'npc');

            // 🖤 Small delay for dramatic effect
            await new Promise(r => setTimeout(r, 1500));

            // 🦇 Enter doom world
            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.enterDoomWorld(currentLocation);
            } else if (typeof TravelSystem !== 'undefined') {
                TravelSystem.portalToDoomWorld(currentLocation);
            }

            // 🖤 Close the panel after transition
            this.close();

        } else {
            this.addChatMessage("*prepares to leave this dark realm*", 'player');
            this.addChatMessage("*The Boatman nods slowly* The light calls you back... Return now, but remember what you've seen.", 'npc');

            await new Promise(r => setTimeout(r, 1500));

            // 🦇 Exit doom world
            if (typeof DoomWorldSystem !== 'undefined') {
                DoomWorldSystem.exitDoomWorld(currentLocation);
            } else if (typeof TravelSystem !== 'undefined') {
                TravelSystem.portalToNormalWorld(currentLocation);
            }

            this.close();
        }
    },

    // 🖤 Ask about the doom world
    async askAboutDoomWorld() {
        const inDoom = typeof DoomWorldSystem !== 'undefined' && DoomWorldSystem.isActive;

        if (inDoom) {
            await this.sendActionMessage('doom_info', "What happened to this world?");
        } else {
            await this.sendActionMessage('doom_info', "What lies beyond the portal?");
        }
    },

    // 🖤 Get boatman-specific instruction for API calls
    getBoatmanInstruction(action) {
        if (typeof DoomWorldSystem !== 'undefined') {
            return DoomWorldSystem.getBoatmanInstruction(action);
        }

        const inDoom = typeof TravelSystem !== 'undefined' && TravelSystem.isInDoomWorld();
        return `You are the Boatman, a mysterious ferryman between worlds.
Speak cryptically and briefly. You offer passage to the ${inDoom ? 'normal world' : 'doom world'}.`;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖤💀 ENCOUNTER ACTIONS - Give Gold, Attack, Pickpocket, Flee 💀
    // ═══════════════════════════════════════════════════════════════

    // 💰 Give Gold to NPC - charity, bribery, or appeasement
    // 🖤💀 FIXED: Use modal instead of browser prompt() 💀
    giveGoldToNPC() {
        if (!this.currentNPC) return;

        const playerGold = game?.player?.gold || 0;
        if (playerGold <= 0) {
            this.addChatMessage("*checks pockets* I have no gold to give.", 'player');
            this.addChatMessage("*looks disappointed*", 'npc');
            return;
        }

        // 🖤💀 Build quick amount buttons based on player gold 💀
        const amounts = [10, 50, 100, 500, 1000, 5000, 10000, 50000].filter(a => a <= playerGold);
        const amountButtons = amounts.map(a =>
            `<button class="gold-amount-btn" data-amount="${a}" style="margin:3px;padding:8px 12px;cursor:pointer;background:#2a2a2a;border:1px solid #4a4a4a;color:#ffd700;border-radius:4px;">${a.toLocaleString()}g</button>`
        ).join('');

        // 🖤💀 Create modal content with input and quick buttons 💀
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

        // 🖤💀 Show modal using ModalSystem 💀
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

            // 🦇 Wire up quick amount buttons after modal is shown
            setTimeout(() => {
                document.querySelectorAll('.gold-amount-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const input = document.getElementById('gold-amount-input');
                        if (input) input.value = btn.dataset.amount;
                    });
                });
            }, 50);
        } else {
            // 🖤 Fallback if ModalSystem not available
            this.addChatMessage("*tries to offer gold but something went wrong*", 'player');
        }
    },

    // 🖤💀 Execute the actual gold transfer 💀
    _executeGoldGift(amount, playerGold) {
        if (isNaN(amount) || amount <= 0 || amount > playerGold) {
            this.addChatMessage("*fumbles with coin pouch*", 'player');
            return;
        }

        // 🦇 Transfer gold
        game.player.gold -= amount;
        if (this.currentNPC.gold !== undefined) {
            this.currentNPC.gold += amount;
        }

        // 💰 Increase reputation with this NPC
        if (typeof NPCRelationshipSystem !== 'undefined') {
            NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, Math.floor(amount / 5));
        }

        this.addChatMessage(`*hands over ${amount.toLocaleString()} gold*`, 'player');
        this.addChatMessage(`*accepts the gold gratefully* Many thanks, traveler.`, 'npc');
        if (typeof addMessage === 'function') {
            addMessage(`💰 Gave ${amount.toLocaleString()} gold to ${this.currentNPC.name}`);
        }
        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // 🎁 Give Item to NPC
    // 🖤💀 FIXED: Use modal instead of browser prompt() 💀
    giveItemToNPC() {
        if (!this.currentNPC) return;

        // 🖤💀 Get inventory as object {itemId: quantity} and convert to array 💀
        const inventoryObj = game?.player?.inventory || {};
        const inventoryItems = Object.entries(inventoryObj)
            .filter(([id, qty]) => qty > 0 && id !== 'gold')
            .slice(0, 12);

        if (inventoryItems.length === 0) {
            this.addChatMessage("*checks bag* I have nothing to give.", 'player');
            return;
        }

        // 🖤💀 Build item buttons for modal 💀
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

        // 🖤💀 Show modal 💀
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

            // 🦇 Wire up item buttons
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

    // 🖤💀 Execute the actual item transfer 💀
    _executeItemGift(itemId) {
        if (!itemId || !game?.player?.inventory) return;

        const qty = game.player.inventory[itemId] || 0;
        if (qty <= 0) {
            this.addChatMessage("*hesitates*", 'player');
            return;
        }

        // 🖤 Remove 1 of the item from inventory
        game.player.inventory[itemId]--;
        if (game.player.inventory[itemId] <= 0) {
            delete game.player.inventory[itemId];
        }

        // Get display name
        let name = itemId.replace(/_/g, ' ');
        if (typeof ItemDatabase !== 'undefined' && ItemDatabase.getItem) {
            const item = ItemDatabase.getItem(itemId);
            if (item?.name) name = item.name;
        }

        // 💚 Increase reputation
        if (typeof NPCRelationshipSystem !== 'undefined') {
            NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, 5);
        }

        this.addChatMessage(`*offers ${name}*`, 'player');
        this.addChatMessage(`*takes the gift* How kind of you!`, 'npc');
        if (typeof addMessage === 'function') {
            addMessage(`🎁 Gave ${name} to ${this.currentNPC.name}`);
        }
    },

    // ⚔️ Attack NPC - violence has consequences
    // 🖤💀 FIXED: Use modal instead of window.confirm() 💀
    attackNPC() {
        if (!this.currentNPC) return;

        // 🖤💀 Show confirmation modal 💀
        if (typeof ModalSystem !== 'undefined') {
            ModalSystem.show({
                title: '⚔️ Attack?',
                content: `
                    <div style="text-align:center;padding:15px;">
                        <p style="color:#ff6b6b;font-size:18px;margin-bottom:10px;">Attack ${this.escapeHtml(this.currentNPC.name)}?</p>
                        <p style="color:#888;">This will have serious consequences!</p>
                        <p style="color:#666;font-size:12px;margin-top:10px;">• Reputation loss<br>• Possible injury<br>• Guards may be alerted</p>
                    </div>
                `,
                buttons: [
                    {
                        text: '⚔️ Attack!',
                        className: 'primary',
                        onClick: () => {
                            ModalSystem.hide();
                            this._executeAttack();
                        }
                    },
                    {
                        text: 'Never mind',
                        className: 'secondary',
                        onClick: () => {
                            ModalSystem.hide();
                            this.addChatMessage("*thinks better of it*", 'player');
                        }
                    }
                ]
            });
        } else {
            // Fallback
            this._executeAttack();
        }
    },

    // 🖤💀 Execute the actual attack 💀
    _executeAttack() {
        this.addChatMessage("*draws weapon and attacks!*", 'player');

        // 🦇 Simple combat resolution
        const playerStrength = game?.player?.stats?.strength || 10;
        const npcStrength = this.currentNPC.strength || 10;
        const playerRoll = Math.floor(Math.random() * 20) + playerStrength;
        const npcRoll = Math.floor(Math.random() * 20) + npcStrength;

        if (playerRoll > npcRoll) {
            // 🏆 Player wins
            const loot = this.currentNPC.gold || Math.floor(Math.random() * 50) + 10;
            game.player.gold = (game.player.gold || 0) + loot;

            this.addChatMessage("*falls defeated*", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`⚔️ Defeated ${this.currentNPC.name}! Looted ${loot} gold.`);
            }

            // 🖤 Decrease reputation significantly
            if (typeof NPCRelationshipSystem !== 'undefined') {
                NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, -50);
            }

            // 🦇 End encounter
            setTimeout(() => this.close(), 1500);
        } else {
            // 💀 NPC wins or escapes
            const damage = Math.floor(Math.random() * 20) + 5;
            if (game?.player?.stats?.health !== undefined) {
                game.player.stats.health = Math.max(0, game.player.stats.health - damage);
            }

            this.addChatMessage(`*fights back and wounds you for ${damage} damage!*`, 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`⚔️ ${this.currentNPC.name} fought back! Took ${damage} damage.`);
            }
        }

        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // 🗡️ Pickpocket NPC
    pickpocketNPC() {
        if (!this.currentNPC) return;

        this.addChatMessage("*tries to discreetly reach for their coin pouch*", 'player');

        // 🦇 Skill check
        const dexterity = game?.player?.stats?.dexterity || 10;
        const roll = Math.floor(Math.random() * 20) + 1;
        const success = roll + dexterity > 15;

        if (success) {
            // 🏆 Successful steal
            const stolen = Math.floor(Math.random() * 30) + 5;
            game.player.gold = (game.player.gold || 0) + stolen;

            this.addChatMessage("*doesn't notice anything*", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`🗡️ Stole ${stolen} gold from ${this.currentNPC.name}!`);
            }
        } else {
            // 🚨 Caught!
            this.addChatMessage("*grabs your wrist* THIEF!", 'npc');
            if (typeof addMessage === 'function') {
                addMessage(`🚨 Caught pickpocketing ${this.currentNPC.name}!`);
            }

            // 🖤 Massive reputation loss
            if (typeof NPCRelationshipSystem !== 'undefined') {
                NPCRelationshipSystem.modifyReputation(this.currentNPC.type || this.currentNPC.id, -30);
            }

            // 🦇 Might trigger guards
            if (Math.random() < 0.5 && typeof NPCEncounters !== 'undefined') {
                setTimeout(() => {
                    NPCEncounters.triggerGuardEncounter?.();
                }, 2000);
            }
        }

        if (typeof updateDisplay === 'function') updateDisplay();
    },

    // 🏃 Flee from encounter
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

    // 🖤 NEW: Send message with standardized action type to NPCInstructionTemplates 💀
    async sendActionMessage(actionType, displayMessage) {
        if (this.isWaitingForResponse || !this.currentNPC) return;

        this.addChatMessage(displayMessage, 'player');
        this.chatHistory.push({ role: 'user', content: displayMessage });

        this.isWaitingForResponse = true;
        this.addChatMessage('...', 'npc typing-indicator');

        try {
            // 🖤 Check if NPCVoiceChatSystem is available
            if (typeof NPCVoiceChatSystem === 'undefined') {
                throw new Error('NPCVoiceChatSystem not available');
            }

            // 🦇 Build context for instruction templates
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

            // 🦇 Check if we got a valid response
            if (!response || !response.text) {
                throw new Error('Empty response from API');
            }

            // 🖤💀 CRITICAL: Parse and execute commands from API response! 💀
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

            // 🔊 Play TTS with NPC-specific voice (use clean text without commands)
            if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                const voice = this.getNPCVoice(this.currentNPC);
                NPCVoiceChatSystem.playVoice(cleanText, voice);
            }

            // 🖤 Update quest items in case something changed
            this.updateQuestItems();

        } catch (e) {
            // 🖤💀 Only log as warning for expected fallbacks (like farewell when panel closes)
            // This prevents console spam for normal interactions 💀
            const isExpectedFallback = !this.currentNPC || actionType === 'farewell';
            if (isExpectedFallback) {
                console.log(`🎭 Using fallback for ${actionType} action (NPC context lost or expected)`);
            } else {
                console.warn('🖤 Action message fallback triggered:', e?.message || 'Unknown error');
            }

            const messages = document.getElementById('people-chat-messages');
            const typing = messages?.querySelector('.typing-indicator');
            if (typing) typing.remove();

            // 🖤💀 CRITICAL: Fallback must ALSO execute the action! 💀
            const fallback = this.getActionFallback(actionType, this.currentNPC);
            this.addChatMessage(fallback, 'npc');
            this.chatHistory.push({ role: 'assistant', content: fallback });

            // 🖤 Execute the action even on fallback - the fallback message is just flavor
            this.executeActionFallback(actionType);
        }

        this.isWaitingForResponse = false;
    },

    // 🖤💀 Execute action when API fails - fallback must still work! 💀
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

    // 🖤 Get fallback response based on action type 💀
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

    // 🖤 Get NPC voice from new template system or fallback 💀
    getNPCVoice(npcData) {
        if (typeof NPCInstructionTemplates !== 'undefined' && NPCInstructionTemplates._loaded) {
            return NPCInstructionTemplates.getVoice(npcData.type || npcData.id);
        }
        return npcData.voice || 'nova';
    },

    // 🖤 Get available quests for current NPC 💀
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

    // 🖤 Get active quests that can be turned in to current NPC 💀
    getActiveQuestsForNPC() {
        if (typeof QuestSystem === 'undefined' || !this.currentNPC) return [];

        const npcType = this.currentNPC.type || this.currentNPC.id;
        return Object.values(QuestSystem.activeQuests || {}).filter(q => {
            // 🦇 Quest giver matches OR has a turn-in objective for this NPC
            const giverMatches = q.giver === npcType;
            const hasTurnInObj = q.objectives?.some(o =>
                (o.type === 'talk' || o.type === 'deliver') && o.npc === npcType
            );
            return giverMatches || hasTurnInObj;
        });
    },

    // 🖤 Get rumors from game context 💀
    getRumors() {
        // 🦇 Try to get rumors from various sources
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

    // 🖤💀 Open the Grand Market at Royal Capital 💀
    openGrandMarket() {
        // 🏛️ This opens the city-wide market, not an NPC's personal inventory
        if (game?.currentLocation?.id !== 'royal_capital') {
            if (typeof addMessage === 'function') {
                addMessage('The Grand Market is only available at the Royal Capital.');
            }
            return;
        }

        // 🖤 Add chat messages for flavor
        this.addChatMessage("I'd like to browse the Grand Market.", 'player');
        this.chatHistory.push({ role: 'user', content: "I'd like to browse the Grand Market." });

        this.addChatMessage("*gestures toward the bustling market square* The Grand Market awaits - finest goods in all the realm!", 'npc');
        this.chatHistory.push({ role: 'assistant', content: "*gestures toward the bustling market square* The Grand Market awaits - finest goods in all the realm!" });

        // 🖤 Open the market using the global function
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

    // 🖤 Get nearby locations for directions 💀
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

    // 🖤 Calculate direction to a location (basic) 💀
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
        // 🖤 Open NPC trade window for this specific NPC 💀
        if (!this.currentNPC) {
            console.warn('💱 No NPC selected for trade');
            return;
        }

        // 🛒 Open the NPC trade window
        if (typeof NPCTradeWindow !== 'undefined') {
            NPCTradeWindow.open(this.currentNPC, 'trade');
        } else {
            // 🖤 Fallback to grand market if at capital
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

    // 🔊 STOP VOICE
    stopVoice() {
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.stopVoicePlayback?.();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔍 NPC CHECKS - figuring out what this NPC can do
    // ═══════════════════════════════════════════════════════════════

    // 🖤💀 WOW-STYLE QUEST MARKER SYSTEM 💀
    // Returns object with: { marker: '!' or '?', style: 'quest-available', 'quest-main', etc. }
    getQuestMarker(npcType) {
        if (typeof QuestSystem === 'undefined') return null;

        const location = typeof game !== 'undefined' ? game.currentLocation?.id : null;
        console.log(`🔍 getQuestMarker('${npcType}') at location '${location}'`);

        // 🖤 PRIORITY 1: Quest ready to turn in (? markers)
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

        // 🖤 PRIORITY 2: Quest in progress from this NPC (grey ? markers)
        const activeFromNPC = QuestSystem.getActiveQuestsForNPC?.(npcType, location) || [];
        const inProgress = activeFromNPC.filter(q => {
            const progress = QuestSystem.checkProgress?.(q.id);
            return progress?.status === 'in_progress';
        });

        // 🦇 Also check if this NPC is the turn-in target for any active quest
        const turnInQuests = Object.values(QuestSystem.activeQuests || {}).filter(q => {
            // 🖤 Check if NPC type matches AND location matches (for multiple merchants/NPCs of same type)
            const turnInNpcMatches = q.turnInNpc === npcType;
            const talkObjMatches = q.objectives?.some(o =>
                o.type === 'talk' &&
                !o.completed &&
                o.npc === npcType &&
                (!o.location || o.location === location || o.location === 'any')
            );
            const npcMatches = turnInNpcMatches || talkObjMatches;
            const locationMatches = !location || !q.turnInLocation || q.turnInLocation === location || q.turnInLocation === 'any';
            return npcMatches && locationMatches;
        });

        if (inProgress.length > 0 || turnInQuests.length > 0) {
            return { marker: '?', style: 'quest-progress' }; // Silver/grey ?
        }

        // 🖤 PRIORITY 3: Quest available to pick up (! markers)
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
        // 🖤 TRADE AVAILABILITY - not just merchants anymore, it's a whole economy
        // some NPCs trade freely, others need you to earn their trust first

        // 💀 ALWAYS TRADEABLE - no rep required, these folks just want your gold
        const alwaysTrade = [
            'merchant', 'innkeeper', 'general_store', 'baker', 'farmer',
            'fisherman', 'ferryman', 'traveler'
        ];
        if (alwaysTrade.includes(npcType)) return true;

        // 🦇 TRADE WITH LOW REP (10+) - they need to at least know you
        const lowRepTrade = ['blacksmith', 'apothecary', 'tailor', 'herbalist', 'miner'];
        if (lowRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 10;
        }

        // 💎 TRADE WITH MEDIUM REP (25+) - specialty traders, gotta prove yourself
        const medRepTrade = ['jeweler', 'banker', 'guild_master'];
        if (medRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 25;
        }

        // 👑 TRADE WITH HIGH REP (50+) - elite traders, only for the trusted
        const highRepTrade = ['noble'];
        if (highRepTrade.includes(npcType)) {
            return this.getNPCReputation(npcType) >= 50;
        }

        // 🖤 Everyone else - check if they have decent rep (15+) to unlock barter
        // this way even guards, healers, etc can trade if you're friendly enough
        return this.getNPCReputation(npcType) >= 15;
    },

    // 🔮 GET NPC REPUTATION - how much does this NPC type trust us?
    getNPCReputation(npcType) {
        if (typeof NPCRelationshipSystem === 'undefined') return 0;

        // 🖤 Check specific NPC relationship
        const rel = NPCRelationshipSystem.relationships?.[npcType];
        if (rel) return rel.reputation || 0;

        // 🦇 Check faction/type reputation as fallback
        const factionRep = NPCRelationshipSystem.factionReputation?.[npcType];
        if (factionRep !== undefined) return factionRep;

        return 0;
    },

    // 💰 GET TRADE REP REQUIREMENT - show players what they need
    getTradeRepRequirement(npcType) {
        const alwaysTrade = ['merchant', 'innkeeper', 'general_store', 'baker', 'farmer', 'fisherman', 'ferryman', 'traveler'];
        if (alwaysTrade.includes(npcType)) return 0;

        const lowRepTrade = ['blacksmith', 'apothecary', 'tailor', 'herbalist', 'miner'];
        if (lowRepTrade.includes(npcType)) return 10;

        const medRepTrade = ['jeweler', 'banker', 'guild_master'];
        if (medRepTrade.includes(npcType)) return 25;

        const highRepTrade = ['noble'];
        if (highRepTrade.includes(npcType)) return 50;

        return 15;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎨 HELPER METHODS - the mundane but necessary
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
            default: 'A local going about their business.'
        };
        return descriptions[type] || descriptions.default;
    },

    formatNPCName(id) {
        if (!id) return 'Stranger';
        return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    // 🖤 Escape HTML - sanitize or die 💀
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 SPECIAL ENCOUNTER - for intro/quest-specific NPC popups
    // ═══════════════════════════════════════════════════════════════

    // 🖤 Show a special one-time encounter (like intro Hooded Stranger) 💀
    // This opens the panel directly to chat view with custom actions
    showSpecialEncounter(npcData, options = {}) {
        const {
            greeting = null,           // 🖤 Custom greeting text (overrides API generation)
            customActions = [],        // 🖤 Array of {label, action, priority} for special buttons
            disableChat = false,       // 🖤 If true, hide chat input
            disableBack = false,       // 🖤 If true, hide back button
            onClose = null,            // 🖤 Callback when panel closes
            introText = null,          // 🖤 Narrative text to show before NPC speaks
            playVoice = true           // 🖤 Whether to play TTS for greeting
        } = options;

        console.log(`🎭 PeoplePanel: Opening special encounter with ${npcData.name} 🖤💀`);

        // 🦇 Store callback for later
        this._specialEncounterOnClose = onClose;
        this._isSpecialEncounter = true;
        this._specialEncounterActions = customActions;
        this._disableChat = disableChat;

        // 🖤 Open panel directly to chat view
        this.open();

        // 🦇 Skip list view entirely - go straight to chat
        this.viewMode = 'chat';
        this.currentNPC = npcData;
        this.chatHistory = [];

        document.getElementById('people-list-view')?.classList.add('hidden');
        document.getElementById('people-chat-view')?.classList.remove('hidden');

        // 🖤 Optionally hide back button for forced encounters
        const backBtn = document.querySelector('#people-panel .back-btn');
        if (backBtn) {
            backBtn.style.display = disableBack ? 'none' : '';
        }

        // 🖤 Optionally hide chat input for scripted encounters
        const chatInputArea = document.querySelector('#people-panel .chat-input-area');
        if (chatInputArea) {
            chatInputArea.style.display = disableChat ? 'none' : '';
        }

        this.updateChatHeader(npcData);
        this.clearChatMessages();

        // 🖤 Show intro narrative text first (if provided)
        if (introText) {
            this.addChatMessage(introText, 'system');
        }

        // 🖤 Show NPC greeting
        if (greeting) {
            // 🦇 Use provided greeting
            setTimeout(() => {
                this.addChatMessage(greeting, 'npc');
                this.chatHistory.push({ role: 'assistant', content: greeting });

                // 🔊 Play TTS - pass NPC name as source for indicator 🖤💀
                if (playVoice && typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
                    NPCVoiceChatSystem.playVoice(greeting, npcData.voice || 'onyx', npcData.name || 'Stranger');
                }
            }, 300);
        } else {
            // 🦇 Generate greeting via API (standard flow)
            this.sendGreeting(npcData);
        }

        // 🖤 Update quick actions with custom actions (after a delay for greeting to render)
        setTimeout(() => {
            this.updateSpecialEncounterActions(customActions);
        }, 500);
    },

    // 🖤 Update quick actions with custom actions for special encounters 💀
    updateSpecialEncounterActions(customActions) {
        const container = document.getElementById('people-quick-actions');
        if (!container) return;

        container.innerHTML = '';

        // 🦇 Add custom actions
        customActions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            if (a.questRelated) btn.classList.add('quest-action-btn');
            if (a.primary) btn.classList.add('primary-action-btn');
            btn.textContent = a.label;
            btn.addEventListener('click', () => {
                // 🖤 Execute action and potentially close encounter
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

    // 🖤 Close special encounter and cleanup 💀
    closeSpecialEncounter() {
        console.log('🎭 PeoplePanel: Closing special encounter 🖤💀');

        // 🦇 Restore normal UI
        const backBtn = document.querySelector('#people-panel .back-btn');
        if (backBtn) backBtn.style.display = '';

        const chatInputArea = document.querySelector('#people-panel .chat-input-area');
        if (chatInputArea) chatInputArea.style.display = '';

        // 🖤 Fire callback if provided
        if (typeof this._specialEncounterOnClose === 'function') {
            this._specialEncounterOnClose();
        }

        // 🖤 Reset special encounter state
        this._isSpecialEncounter = false;
        this._specialEncounterOnClose = null;
        this._specialEncounterActions = [];
        this._disableChat = false;

        // 🖤 Close the panel
        this.close();
    },

    // 🖤 Add system message to chat (for narrative intro text) 💀
    addSystemMessage(text) {
        this.addChatMessage(text, 'system');
    }
};

// 🖤 Add CSS for special encounter styling 💀
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
// 🌍 GLOBAL ACCESS
// ═══════════════════════════════════════════════════════════════
window.PeoplePanel = PeoplePanel;
window.openPeoplePanel = function() { PeoplePanel.open(); };
window.closePeoplePanel = function() { PeoplePanel.close(); };
window.togglePeoplePanel = function() { PeoplePanel.toggle(); };

// 🚀 INITIALIZE on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => PeoplePanel.init(), 500);
    });
} else {
    setTimeout(() => PeoplePanel.init(), 500);
}

console.log('👥 Unified People Panel loaded - talk, trade, quest... all in one dark place 🖤');
