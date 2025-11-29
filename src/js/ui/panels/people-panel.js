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
                    <button class="back-btn" onclick="PeoplePanel.showListView()">← Back</button>
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
                    <div class="npc-stat-item" title="Reputation">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value" id="npc-reputation-value">0</span>
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
                        <button class="trade-btn" onclick="PeoplePanel.openFullTrade()">Open Market</button>
                    </div>
                </div>

                <!-- ✍️ Chat input area -->
                <div class="chat-input-area">
                    <div class="chat-suggestions" id="chat-suggestions">
                        <!-- Quick reply suggestions -->
                    </div>
                    <div class="chat-input-row">
                        <input type="text" id="people-chat-input" placeholder="Say something..."
                               onkeypress="if(event.key==='Enter')PeoplePanel.sendMessage()">
                        <button class="send-btn" onclick="PeoplePanel.sendMessage()">Send</button>
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

            .quest-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ffd700;
                color: #000;
                font-size: 0.5em;
                font-weight: bold;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

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
            .badge-quest { background: #ffd700; color: #000; }
            .badge-trade { background: #4a9; color: #fff; }
            .badge-delivery { background: #94a; color: #fff; }

            /* 📊 NPC Stats Bar - horizontal layout */
            .npc-stats-bar {
                display: flex;
                justify-content: space-around;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .npc-stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                cursor: help;
            }

            .npc-stat-item .stat-icon {
                font-size: 1em;
            }

            .npc-stat-item .stat-label {
                font-size: 0.8em;
                color: #aaa;
            }

            .npc-stat-item .stat-value {
                font-size: 0.85em;
                color: #ffd700;
                font-weight: bold;
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

            .chat-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 8px;
            }

            .suggestion-btn {
                padding: 4px 10px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.15);
                color: #ccc;
                border-radius: 12px;
                cursor: pointer;
                font-size: 0.8em;
            }
            .suggestion-btn:hover {
                background: rgba(255,215,0,0.15);
                border-color: rgba(255,215,0,0.3);
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
        });

        // 🖤 listen for quest updates
        document.addEventListener('quest-assigned', () => this.updateQuestItems());
        document.addEventListener('quest-completed', () => this.updateQuestItems());
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
        this.updateSuggestions(npcData);

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
        const locationName = currentLocation?.name || 'Unknown Location';
        const locationId = currentLocation?.id || null;

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
        const name = npc.name || this.formatNPCName(npc.id);
        const title = npc.title || this.getNPCTitle(npc.type || npc.id);
        const description = npc.description || this.getNPCDescription(npc.type || npc.id);

        // 🖤 Check for quest availability
        const hasQuest = this.npcHasQuest(npc.type || npc.id);
        const hasDelivery = this.npcHasDeliveryForThem(npc.type || npc.id);
        const canTrade = this.npcCanTrade(npc.type || npc.id);

        let badges = '';
        if (hasQuest) badges += '<span class="quest-badge">!</span>';
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

        if (this.npcHasQuest(npcData.type || npcData.id)) {
            badges.innerHTML += '<span class="badge badge-quest">Quest</span>';
        }
        if (this.npcHasDeliveryForThem(npcData.type || npcData.id)) {
            badges.innerHTML += '<span class="badge badge-delivery">Delivery</span>';
        }
        if (this.npcCanTrade(npcData.type || npcData.id)) {
            badges.innerHTML += '<span class="badge badge-trade">Trade</span>';
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
                relationship = {
                    level: NPCRelationshipSystem.getRelationshipLevel(rel.reputation || 0) || 'neutral',
                    reputation: rel.reputation || 0
                };
                tradeStats = {
                    timesTraded: rel.timesTraded || 0,
                    totalGoldTraded: rel.totalGoldTraded || 0
                };
            }
        }

        // 🦇 Get level info for icon and label
        const levelInfo = typeof NPCRelationshipSystem !== 'undefined'
            ? NPCRelationshipSystem.levels?.[relationship.level]
            : null;

        const icon = levelInfo?.icon || '😐';
        const label = levelInfo?.label || 'Neutral';

        // 🖤 Update UI elements
        const relationIcon = document.getElementById('npc-relation-icon');
        const relationLabel = document.getElementById('npc-relation-label');
        const reputationValue = document.getElementById('npc-reputation-value');
        const tradesValue = document.getElementById('npc-trades-value');
        const goldTradedValue = document.getElementById('npc-gold-traded-value');

        if (relationIcon) relationIcon.textContent = icon;
        if (relationLabel) relationLabel.textContent = label;
        if (reputationValue) reputationValue.textContent = relationship.reputation;
        if (tradesValue) tradesValue.textContent = tradeStats.timesTraded;
        if (goldTradedValue) goldTradedValue.textContent = tradeStats.totalGoldTraded.toLocaleString();
    },

    // 💬 SEND GREETING
    async sendGreeting(npcData) {
        this.addChatMessage('*Approaching...*', 'system');

        // 🖤 Generate greeting via API
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startConversation(npcData.id, npcData);

            try {
                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    npcData,
                    '[GREETING]',
                    []
                );

                this.addChatMessage(response.text, 'npc');

                // 🔊 Play TTS
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = npcData.voice || 'nova';
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }
            } catch (e) {
                const fallback = this.getFallbackGreeting(npcData);
                this.addChatMessage(fallback, 'npc');
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
                const response = await NPCVoiceChatSystem.generateNPCResponse(
                    this.currentNPC,
                    message,
                    this.chatHistory
                );

                // 🖤 Remove typing indicator
                const messages = document.getElementById('people-chat-messages');
                const typing = messages?.querySelector('.typing-indicator');
                if (typing) typing.remove();

                this.addChatMessage(response.text, 'npc');
                this.chatHistory.push({ role: 'assistant', content: response.text });

                // 🔊 Play TTS
                if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                    const voice = this.currentNPC.voice || 'nova';
                    NPCVoiceChatSystem.playVoice(response.text, voice);
                }

                // 🖤 Update quest items in case something changed
                this.updateQuestItems();
            }
        } catch (e) {
            console.error('👥 PeoplePanel: Response error:', e);
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
        const actions = [];

        // 🖤 Trade-related actions
        if (this.npcCanTrade(npcType)) {
            actions.push({ label: '💰 Browse wares', action: () => this.askAboutWares() });
            actions.push({ label: '🛒 Open market', action: () => this.openFullTrade() });
        }

        // 🖤 Quest-related actions
        if (this.npcHasQuest(npcType)) {
            actions.push({ label: '📜 Ask about work', action: () => this.askAboutWork() });
        }

        // 🖤 Delivery actions
        if (this.npcHasDeliveryForThem(npcType)) {
            actions.push({ label: '📦 I have a delivery', action: () => this.mentionDelivery() });
        }

        // 🖤 Generic actions
        actions.push({ label: '❓ Ask for directions', action: () => this.askDirections() });
        actions.push({ label: '👋 Say goodbye', action: () => this.sayGoodbye() });

        container.innerHTML = '';
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.textContent = a.label;
            btn.addEventListener('click', a.action);
            container.appendChild(btn);
        });

        container.classList.remove('hidden');
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
        const canTrade = this.npcCanTrade(npcType);
        const repRequired = this.getTradeRepRequirement(npcType);
        const currentRep = this.getNPCReputation(npcType);

        // 🖤 Always show trade section for potential traders, but indicate locked status
        const potentialTrader = repRequired > 0 || ['merchant', 'innkeeper', 'general_store', 'baker',
            'farmer', 'fisherman', 'ferryman', 'traveler', 'blacksmith', 'apothecary',
            'tailor', 'herbalist', 'miner', 'jeweler', 'banker', 'guild_master', 'noble'].includes(npcType);

        if (potentialTrader) {
            container.classList.remove('hidden');

            if (canTrade) {
                // 💰 Can trade - show what's available
                const locationId = game?.currentLocation?.id;
                const location = typeof GameWorld !== 'undefined' ? GameWorld.locations?.[locationId] : null;
                const sells = location?.sells || [];

                if (sells.length > 0) {
                    preview.innerHTML = `<span style="color:#4a9">✓ Trade Available</span><br>Sells: ${sells.slice(0, 4).join(', ')}${sells.length > 4 ? '...' : ''}`;
                } else {
                    preview.innerHTML = '<span style="color:#4a9">✓ Trade Available</span><br>Various goods for trade';
                }

                // 🖤 Update button to be active
                const btn = container.querySelector('.trade-btn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Open Market';
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

    // 💡 UPDATE SUGGESTIONS
    updateSuggestions(npcData) {
        const container = document.getElementById('chat-suggestions');
        if (!container) return;

        const npcType = npcData.type || npcData.id;
        const suggestions = [];

        // 🖤 Context-specific suggestions
        if (this.npcCanTrade(npcType)) {
            suggestions.push("What's for sale?");
        }
        if (this.npcHasQuest(npcType)) {
            suggestions.push("Need any help?");
        }
        if (this.npcHasDeliveryForThem(npcType)) {
            suggestions.push("I have something for you");
        }
        suggestions.push("Tell me about this place");
        suggestions.push("Any news?");

        container.innerHTML = '';
        suggestions.slice(0, 4).forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = text;
            btn.addEventListener('click', () => {
                document.getElementById('people-chat-input').value = text;
                this.sendMessage();
            });
            container.appendChild(btn);
        });
    },

    // 🎯 QUICK ACTION METHODS
    askAboutWares() {
        document.getElementById('people-chat-input').value = "What do you have for sale?";
        this.sendMessage();
    },

    askAboutWork() {
        document.getElementById('people-chat-input').value = "Do you have any work for me?";
        this.sendMessage();
    },

    mentionDelivery() {
        document.getElementById('people-chat-input').value = "I have a delivery for you.";
        this.sendMessage();
    },

    askDirections() {
        document.getElementById('people-chat-input').value = "Can you tell me about nearby places?";
        this.sendMessage();
    },

    sayGoodbye() {
        document.getElementById('people-chat-input').value = "I should be going. Farewell.";
        this.sendMessage();
        setTimeout(() => this.showListView(), 2000);
    },

    openFullTrade() {
        // 🖤 Open the market panel
        if (typeof openMarket === 'function') {
            openMarket();
        } else if (typeof MarketUI !== 'undefined') {
            MarketUI.show?.();
        } else {
            const btn = document.querySelector('[data-action="market"]');
            if (btn) btn.click();
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
            thief: '🗡️', spy: '👁️', ferryman: '⛵', stablemaster: '🐴',
            guild_master: '📋', drunk: '🍻', scholar: '📚', jeweler: '💎',
            tailor: '🧵', baker: '🍞', farmer: '🌾', fisherman: '🐟',
            miner: '⛏️', woodcutter: '🪓', barkeep: '🍺', general_store: '🏪',
            herbalist: '🌿', hunter: '🏹', druid: '🌳', sailor: '⚓',
            explorer: '🧭', adventurer: '⚔️', banker: '🏦', default: '👤'
        };
        return icons[type] || icons.default;
    },

    getNPCTitle(type) {
        const titles = {
            elder: 'Village Elder', guard: 'Town Guard', blacksmith: 'Master Smith',
            merchant: 'Traveling Merchant', innkeeper: 'Innkeeper', healer: 'Healer',
            priest: 'Temple Priest', apothecary: 'Apothecary', traveler: 'Traveler',
            courier: 'Royal Courier', noble: 'Noble', beggar: 'Beggar',
            thief: 'Shady Character', ferryman: 'Ferryman', stablemaster: 'Stablemaster',
            guild_master: 'Guild Master', drunk: 'Local Drunk', scholar: 'Scholar',
            jeweler: 'Jeweler', tailor: 'Tailor', baker: 'Baker', farmer: 'Farmer',
            fisherman: 'Fisherman', miner: 'Miner', woodcutter: 'Woodcutter',
            barkeep: 'Barkeep', general_store: 'Shopkeeper', herbalist: 'Herbalist',
            hunter: 'Hunter', druid: 'Forest Keeper', sailor: 'Sailor',
            explorer: 'Explorer', adventurer: 'Adventurer', banker: 'Banker',
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
            default: 'A local going about their business.'
        };
        return descriptions[type] || descriptions.default;
    },

    formatNPCName(id) {
        if (!id) return 'Stranger';
        return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
};

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
