// ═══════════════════════════════════════════════════════════════
// NPC CHAT UI - where digital souls judge your life choices
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const NPCChatUI = {
    // ═══════════════════════════════════════════════════════════
    // STATE - tracking the digital dialogue (the void listens)
    // ═══════════════════════════════════════════════════════════

    isOpen: false,
    currentNPC: null,
    chatHistory: [],
    panelElement: null,
    isWaitingForResponse: false,

    // Guards and timeout tracking for cleanup
    _initialized: false,
    _typewriterTimeouts: [],

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION - summoning the chat interface from shadow
    // ═══════════════════════════════════════════════════════════

    init() {
        // Guard against double init
        if (this._initialized) {
            console.log('NPCChatUI: Already initialized, skipping');
            return;
        }
        this._initialized = true;

        this.createPanel();
        this.setupEventListeners();
        console.log('NPCChatUI: Initialized - ready to facilitate digital conversations');
    },

    // ═══════════════════════════════════════════════════════════
    // UI CREATION - building the cathedral where pixels speak
    // ═══════════════════════════════════════════════════════════

    createPanel() {
        // birth the container for digital conversations - a void where hollow souls speak
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'npc-chat-panel';
        this.panelElement.className = 'npc-chat-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="npc-chat-overlay" id="npc-chat-overlay">
                <div class="npc-chat-container">
                    <!-- NPC Header -->
                    <div class="npc-chat-header">
                        <div class="npc-info">
                            <span class="npc-icon" id="npc-chat-icon">👤</span>
                            <div class="npc-details">
                                <h3 class="npc-name" id="npc-chat-name">NPC Name</h3>
                                <span class="npc-type" id="npc-chat-type">Merchant</span>
                            </div>
                        </div>
                        <div class="npc-chat-controls">
                            <span class="voice-indicator" id="npc-voice-indicator" style="display: none;">
                                <span class="wave">
                                    <span></span><span></span><span></span><span></span><span></span>
                                </span>
                                Speaking...
                            </span>
                            <button class="npc-chat-close-btn" id="npc-chat-close" aria-label="Close chat">&times;</button>
                        </div>
                    </div>

                    <!-- Chat Messages Area -->
                    <div class="npc-chat-messages" id="npc-chat-messages">
                        <div class="chat-welcome" id="chat-welcome">
                            <p>Start a conversation with this NPC...</p>
                        </div>
                    </div>

                    <!-- Conversation Status -->
                    <div class="conversation-status" id="conversation-status">
                        <span class="turns-remaining" id="turns-remaining">2 exchanges remaining</span>
                    </div>

                    <!-- Input Area -->
                    <div class="npc-chat-input-area">
                        <div class="quick-responses" id="quick-responses">
                            <button class="quick-response-btn" data-message="Hello!">👋 Hello</button>
                            <button class="quick-response-btn" data-message="What do you have for sale?">🛒 Shop</button>
                            <button class="quick-response-btn" data-message="Any news or rumors?">📰 News</button>
                            <button class="quick-response-btn" data-message="I need directions.">🧭 Directions</button>
                        </div>
                        <div class="npc-chat-input-row">
                            <input type="text"
                                   class="npc-chat-input"
                                   id="npc-chat-input"
                                   placeholder="Type your message..."
                                   maxlength="500"
                                   autocomplete="off">
                            <button class="npc-chat-send-btn" id="npc-chat-send">
                                <span class="send-icon">➤</span>
                            </button>
                        </div>
                        <div class="input-hint" id="input-hint">
                            Press Enter to send • <span id="char-count">0</span>/500
                        </div>
                    </div>
                </div>
            </div>
        `;

        // inject the visual aesthetics - make these hollow souls look pretty
        this.addStyles();

        // attach this interface to the body - the chat panel becomes flesh
        document.body.appendChild(this.panelElement);
    },

    addStyles() {
        const style = document.createElement('style');
        style.id = 'npc-chat-ui-styles';
        style.textContent = `
            /* NPC Chat Panel - the voice of digital souls */
            .npc-chat-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 600; /* z-index standard: panel overlays */
                display: none;
            }

            .npc-chat-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .npc-chat-container {
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #4a4a6a;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                            0 0 40px rgba(100, 100, 200, 0.1);
                animation: slideUp 0.3s ease-out;
                overflow: hidden;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Header */
            .npc-chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: linear-gradient(90deg, #2a2a4e 0%, #1a1a3e 100%);
                border-bottom: 1px solid #4a4a6a;
            }

            .npc-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .npc-icon {
                font-size: 36px;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #3a3a5e 0%, #2a2a4e 100%);
                border-radius: 50%;
                border: 2px solid #5a5a8a;
            }

            .npc-details {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .npc-name {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #e0e0ff;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }

            .npc-type {
                font-size: 12px;
                color: #8888aa;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .npc-chat-controls {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .voice-indicator {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: rgba(76, 175, 80, 0.2);
                border-radius: 20px;
                color: #81c784;
                font-size: 12px;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .voice-indicator .wave {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 14px;
            }

            .voice-indicator .wave span {
                width: 3px;
                background: #81c784;
                border-radius: 2px;
                animation: waveAnim 0.5s ease-in-out infinite;
            }

            .voice-indicator .wave span:nth-child(1) { animation-delay: 0s; height: 6px; }
            .voice-indicator .wave span:nth-child(2) { animation-delay: 0.1s; height: 10px; }
            .voice-indicator .wave span:nth-child(3) { animation-delay: 0.2s; height: 4px; }
            .voice-indicator .wave span:nth-child(4) { animation-delay: 0.3s; height: 12px; }
            .voice-indicator .wave span:nth-child(5) { animation-delay: 0.4s; height: 8px; }

            @keyframes waveAnim {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.5); }
            }

            .npc-chat-close-btn {
                background: rgba(255, 100, 100, 0.2);
                border: 1px solid rgba(255, 100, 100, 0.4);
                color: #ff8888;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .npc-chat-close-btn:hover {
                background: rgba(255, 100, 100, 0.4);
                color: #fff;
                transform: scale(1.1);
            }

            /* Messages Area */
            .npc-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 200px;
                max-height: 350px;
            }

            .chat-welcome {
                text-align: center;
                color: #6a6a8a;
                font-style: italic;
                padding: 40px 20px;
            }

            /* Message Bubbles */
            .chat-message {
                display: flex;
                flex-direction: column;
                max-width: 85%;
                animation: messageIn 0.3s ease-out;
            }

            @keyframes messageIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-message.player {
                align-self: flex-end;
            }

            .chat-message.npc {
                align-self: flex-start;
            }

            .message-bubble {
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .chat-message.player .message-bubble {
                background: linear-gradient(135deg, #4a7c59 0%, #3d6b4f 100%);
                color: #e0ffe0;
                border-bottom-right-radius: 4px;
            }

            .chat-message.npc .message-bubble {
                background: linear-gradient(135deg, #4a4a6a 0%, #3a3a5a 100%);
                color: #e0e0ff;
                border-bottom-left-radius: 4px;
            }

            .message-sender {
                font-size: 11px;
                color: #6a6a8a;
                margin-bottom: 4px;
                padding-left: 4px;
            }

            .message-time {
                font-size: 10px;
                color: #5a5a7a;
                margin-top: 4px;
                padding-left: 4px;
            }

            /* Typing indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(74, 74, 106, 0.5);
                border-radius: 16px;
                width: fit-content;
            }

            .typing-indicator .dots {
                display: flex;
                gap: 4px;
            }

            .typing-indicator .dot {
                width: 8px;
                height: 8px;
                background: #8a8aaa;
                border-radius: 50%;
                animation: typingBounce 1.4s ease-in-out infinite;
            }

            .typing-indicator .dot:nth-child(1) { animation-delay: 0s; }
            .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }

            /* Conversation Status */
            .conversation-status {
                padding: 8px 16px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid #3a3a5a;
                text-align: center;
            }

            .turns-remaining {
                font-size: 12px;
                color: #8a8aaa;
            }

            .turns-remaining.warning {
                color: #ffaa44;
            }

            .turns-remaining.ended {
                color: #ff6666;
            }

            /* Input Area */
            .npc-chat-input-area {
                padding: 12px 16px 16px;
                background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
                border-top: 1px solid #3a3a5a;
            }

            .quick-responses {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
            }

            .quick-response-btn {
                padding: 6px 12px;
                background: rgba(74, 74, 106, 0.4);
                border: 1px solid #4a4a6a;
                border-radius: 20px;
                color: #a0a0c0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .quick-response-btn:hover {
                background: rgba(74, 124, 89, 0.4);
                border-color: #4a7c59;
                color: #c0ffc0;
            }

            .quick-response-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .npc-chat-input-row {
                display: flex;
                gap: 10px;
            }

            .npc-chat-input {
                flex: 1;
                padding: 12px 16px;
                background: rgba(30, 30, 50, 0.8);
                border: 1px solid #4a4a6a;
                border-radius: 24px;
                color: #e0e0ff;
                font-size: 14px;
                outline: none;
                transition: all 0.2s ease;
            }

            .npc-chat-input:focus {
                border-color: #6a6a8a;
                box-shadow: 0 0 10px rgba(100, 100, 200, 0.2);
            }

            .npc-chat-input::placeholder {
                color: #6a6a8a;
            }

            .npc-chat-input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .npc-chat-send-btn {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #4a7c59 0%, #3d6b4f 100%);
                border: none;
                border-radius: 50%;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .npc-chat-send-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(74, 124, 89, 0.4);
            }

            .npc-chat-send-btn:active {
                transform: scale(0.95);
            }

            .npc-chat-send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .npc-chat-send-btn .send-icon {
                transform: translateX(1px);
            }

            .input-hint {
                margin-top: 8px;
                font-size: 11px;
                color: #5a5a7a;
                text-align: center;
            }

            /* Scrollbar styling */
            .npc-chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .npc-chat-messages::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }

            .npc-chat-messages::-webkit-scrollbar-thumb {
                background: #4a4a6a;
                border-radius: 3px;
            }

            .npc-chat-messages::-webkit-scrollbar-thumb:hover {
                background: #5a5a7a;
            }

            /* Responsive */
            @media (max-width: 500px) {
                .npc-chat-container {
                    width: 95%;
                    max-height: 90vh;
                }

                .npc-chat-header {
                    padding: 12px 16px;
                }

                .npc-icon {
                    font-size: 28px;
                    width: 40px;
                    height: 40px;
                }

                .npc-name {
                    font-size: 16px;
                }

                .quick-responses {
                    gap: 6px;
                }

                .quick-response-btn {
                    padding: 5px 10px;
                    font-size: 11px;
                }
            }
        `;

        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════
    // event listeners - wiring up the conversation machine
    // ═══════════════════════════════════════════════════════════

    setupEventListeners() {
        // close button
        const closeBtn = document.getElementById('npc-chat-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // overlay click to close
        const overlay = document.getElementById('npc-chat-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // send button
        const sendBtn = document.getElementById('npc-chat-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // input field enter key and character count
        const input = document.getElementById('npc-chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                const charCount = document.getElementById('char-count');
                if (charCount) {
                    charCount.textContent = input.value.length;
                }
            });
        }

        // quick response buttons
        const quickBtns = document.querySelectorAll('.quick-response-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                if (message) {
                    const input = document.getElementById('npc-chat-input');
                    if (input) {
                        input.value = message;
                        this.sendMessage();
                    }
                }
            });
        });

        // escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    // ═══════════════════════════════════════════════════════════
    // open/close - summoning and dismissing the conversation
    // ═══════════════════════════════════════════════════════════

    open(npcData) {
        if (!npcData) {
            // No NPC data - silently return, nothing to show
            console.warn('NPCChatUI: No NPC data provided');
            return;
        }

        this.currentNPC = npcData;
        this.chatHistory = [];
        this.isWaitingForResponse = false;

        // TRACK NPC MEETING - so quests know we've actually talked to this person
        // the void remembers all who cross its path...
        const npcId = npcData.id || npcData.type || npcData.name;
        if (typeof NPCRelationshipSystem !== 'undefined' && npcId) {
            NPCRelationshipSystem.recordInteraction(npcId, 'conversation', { npcData });
            console.log(`Recorded meeting with ${npcData.name || npcId} - quest availability updated`);
        }

        // paint this puppet's identity onto the UI - show their face to the player
        this.updateNPCInfo(npcData);

        // wipe the slate clean - erase all previous hollow exchanges
        this.clearMessages();

        // start conversation in the voice system
        if (typeof NPCVoiceChatSystem !== 'undefined') {
            NPCVoiceChatSystem.startConversation(npcData.id || 'npc_' + Date.now(), npcData);
        }

        // show greeting with typewriter effect and TTS
        // 🦙 Use Ollama to generate greeting instead of hardcoded fallbacks
        this.fetchAndDisplayGreeting(npcData);

        // adjust quick responses to match this puppet's programmed abilities
        this.updateQuickResponses(npcData);

        // pull back the curtain - reveal the conversation stage to the player
        this.panelElement.style.display = 'block';
        this.isOpen = true;

        // summon the cursor to the input field - the player must speak first
        setTimeout(() => {
            const input = document.getElementById('npc-chat-input');
            if (input) input.focus();
        }, 100);

        // show how many exchanges remain before this hollow soul dismisses you
        this.updateTurnsDisplay();

        console.log('NPCChatUI: Opened chat with', npcData.name || 'Unknown NPC');
    },

    // UPDATE QUICK RESPONSES - give the player shortcuts to command these hollow souls
    // Quest puppets offer tasks, merchants peddle their wares, etc.
    updateQuickResponses(npcData) {
        const quickResponsesContainer = document.getElementById('quick-responses');
        if (!quickResponsesContainer) return;

        const npcType = npcData.type || 'villager';

        // extract this puppet's programmed abilities from the config tome
        const permissions = GameConfig?.npc?.npcPermissions?.[npcType] || ['basic'];
        const canTrade = permissions.includes('merchant') || npcData.canTrade;
        const canGiveQuests = permissions.includes('questGiver');

        // assemble the buttons that command this meat sack
        let buttons = [];

        // Always show greeting
        buttons.push({ message: 'Hello!', icon: '👋', label: 'Hello' });

        // Show shop if NPC can trade
        if (canTrade) {
            buttons.push({ message: 'What do you have for sale?', icon: '🛒', label: 'Shop' });
            buttons.push({ message: 'I have something to sell.', icon: '💰', label: 'Sell' });
        }

        // Show quest option if NPC can give quests
        if (canGiveQuests) {
            buttons.push({ message: 'Do you have any tasks for me?', icon: '📜', label: 'Quests' });
        }

        // Always show gossip/news
        buttons.push({ message: 'Any news or rumors?', icon: '📰', label: 'News' });

        // Show directions
        buttons.push({ message: 'I need directions.', icon: '🧭', label: 'Directions' });

        // Render buttons (max 6 to prevent overflow)
        quickResponsesContainer.innerHTML = buttons.slice(0, 6).map(btn => `
            <button class="quick-response-btn" data-message="${this.escapeHtml(btn.message)}">
                ${btn.icon} ${btn.label}
            </button>
        `).join('');

        // Re-attach event listeners
        const quickBtns = quickResponsesContainer.querySelectorAll('.quick-response-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                if (message) {
                    const input = document.getElementById('npc-chat-input');
                    if (input) {
                        input.value = message;
                        input.focus();
                        // Also auto-send
                        this.sendMessage();
                    }
                }
            });
        });

        console.log(`Quick responses updated for ${npcType}: trade=${canTrade}, quests=${canGiveQuests}`);
    },

    // Simple HTML escape for button data attributes
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    close() {
        // end conversation
        if (this.currentNPC && typeof NPCVoiceChatSystem !== 'undefined') {
            const npcId = this.currentNPC.id || 'npc_unknown';
            NPCVoiceChatSystem.endConversation(npcId);
        }

        // hide panel
        this.panelElement.style.display = 'none';
        this.isOpen = false;
        this.currentNPC = null;
        this.chatHistory = [];

        console.log('NPCChatUI: Chat closed');
    },

    // ═══════════════════════════════════════════════════════════
    // messaging - the art of digital dialogue
    // ═══════════════════════════════════════════════════════════

    async sendMessage() {
        if (this.isWaitingForResponse) return;

        const input = document.getElementById('npc-chat-input');
        const message = input?.value?.trim();

        if (!message) return;

        // clear input
        input.value = '';
        document.getElementById('char-count').textContent = '0';

        // display player's words in the void - record what the living spoke
        this.addPlayerMessage(message);

        // silence the player while the puppet formulates its scripted response
        this.setInputEnabled(false);
        this.isWaitingForResponse = true;

        // show the thinking animation - pretend the hollow soul is pondering
        this.showTypingIndicator();

        try {
            // send to NPC voice system
            if (typeof NPCVoiceChatSystem !== 'undefined') {
                const npcId = this.currentNPC?.id || 'npc_unknown';
                const response = await NPCVoiceChatSystem.sendMessage(npcId, message);

                // erase the false thinking animation - the puppet has spoken
                this.hideTypingIndicator();

                if (response) {
                    // manifest the puppet's scripted words onto the screen
                    this.addNPCMessage(response.text);

                    // refresh the turn counter - count down to dismissal
                    this.updateTurnsDisplay(response);

                    // animate the voice waves if this hollow soul is speaking aloud
                    if (NPCVoiceChatSystem.isVoicePlaying()) {
                        this.showVoiceIndicator();
                    }

                    // has this puppet grown tired of you? end the exchange
                    if (response.isDismissal || response.isLastTurn) {
                        this.handleConversationEnd(response);
                    }
                }
            }
        } catch (error) {
            // the API void returned nothing - puppet stares blankly, unresponsive
            this.hideTypingIndicator();
            this.addNPCMessage('*seems distracted and doesn\'t respond*');
        } finally {
            // reset state no matter what darkness occurred above - always clean up after yourself
            this.isWaitingForResponse = false;
            try {
                this.setInputEnabled(true);
            } catch (e) {
                // DOM might be gone, that's fine
            }
        }
    },

    addPlayerMessage(text) {
        const messagesContainer = document.getElementById('npc-chat-messages');
        const welcome = document.getElementById('chat-welcome');
        if (welcome) welcome.style.display = 'none';

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message player';
        messageEl.innerHTML = `
            <span class="message-sender">You</span>
            <div class="message-bubble">${this.escapeHtml(text)}</div>
            <span class="message-time">${this.getTimeString()}</span>
        `;

        messagesContainer.appendChild(messageEl);
        this.scrollToBottom();

        this.chatHistory.push({ role: 'player', text: text });
    },

    addNPCMessage(text, isGreeting = false) {
        const messagesContainer = document.getElementById('npc-chat-messages');
        const welcome = document.getElementById('chat-welcome');
        if (welcome) welcome.style.display = 'none';

        const npcName = this.currentNPC?.name || 'NPC';

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message npc';
        messageEl.innerHTML = `
            <span class="message-sender">${this.escapeHtml(npcName)}</span>
            <div class="message-bubble" id="npc-message-bubble-${Date.now()}"></div>
            <span class="message-time">${this.getTimeString()}</span>
        `;

        messagesContainer.appendChild(messageEl);
        this.scrollToBottom();

        // locate the bubble that will birth these words - typewriter ritual begins
        const bubbleEl = messageEl.querySelector('.message-bubble');
        if (bubbleEl) {
            this.typewriterEffect(bubbleEl, text);
        }

        if (!isGreeting) {
            this.chatHistory.push({ role: 'npc', text: text });
        }
    },

    // typewriter effect for NPC messages - text appears character by character
    typewriterEffect(element, text, speed = 30) {
        if (!element || !text) return;

        // clear any existing typewriter timeouts first
        this.clearTypewriterTimeouts();

        const formattedText = this.formatNPCMessage(text);
        let displayText = '';
        let charIndex = 0;
        let inTag = false;
        let currentTag = '';

        // character by character - revealing the message like a ritual
        const typeNext = () => {
            if (charIndex >= formattedText.length) {
                // typing complete - the message has fully manifested
                element.innerHTML = formattedText;
                this.scrollToBottom();
                return;
            }

            const char = formattedText[charIndex];

            // HTML tag detected - swallow it whole, not char by char
            if (char === '<') {
                inTag = true;
                currentTag = '<';
            } else if (char === '>' && inTag) {
                inTag = false;
                currentTag += '>';
                displayText += currentTag;
                currentTag = '';
            } else if (inTag) {
                currentTag += char;
            } else {
                displayText += char;
            }

            charIndex++;

            // manifest this character onto the screen - one symbol at a time
            element.innerHTML = displayText;
            this.scrollToBottom();

            // adjust the delay between characters - mimic the rhythm of living breath
            let delay = speed;
            if (char === ' ') {
                delay = speed * 0.5;
            } else if (['.', '!', '?', ',', ';', ':'].includes(char)) {
                delay = speed * 3;
            } else if (char === '\n') {
                delay = speed * 2;
            }

            // track timeout for cleanup
            const timeoutId = setTimeout(typeNext, delay);
            this._typewriterTimeouts.push(timeoutId);
        };

        // begin the performance - start typing the message
        typeNext();
    },

    // clear all typewriter timeouts
    clearTypewriterTimeouts() {
        if (this._typewriterTimeouts) {
            this._typewriterTimeouts.forEach(id => clearTimeout(id));
            this._typewriterTimeouts = [];
        }
    },

    formatNPCMessage(text) {
        // escape HTML first
        let formatted = this.escapeHtml(text);

        // format action markers like *walks away* into italics
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em style="color: #8a8aaa;">*$1*</em>');

        return formatted;
    },

    showTypingIndicator() {
        const messagesContainer = document.getElementById('npc-chat-messages');

        const indicator = document.createElement('div');
        indicator.className = 'chat-message npc';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <div class="dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    clearMessages() {
        const messagesContainer = document.getElementById('npc-chat-messages');
        messagesContainer.innerHTML = `
            <div class="chat-welcome" id="chat-welcome">
                <p>Start a conversation with this NPC...</p>
            </div>
        `;
    },

    scrollToBottom() {
        const messagesContainer = document.getElementById('npc-chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // UI updates - keeping the interface in sync
    // ═══════════════════════════════════════════════════════════

    updateNPCInfo(npcData) {
        const nameEl = document.getElementById('npc-chat-name');
        const typeEl = document.getElementById('npc-chat-type');
        const iconEl = document.getElementById('npc-chat-icon');

        if (nameEl) nameEl.textContent = npcData.name || 'Stranger';
        if (typeEl) typeEl.textContent = npcData.type || 'NPC';
        if (iconEl) iconEl.textContent = this.getIconForType(npcData.type);
    },

    getIconForType(type) {
        const icons = {
            innkeeper: '🍺',
            blacksmith: '🔨',
            apothecary: '🧪',
            general_store: '🏪',
            jeweler: '💎',
            tailor: '🧵',
            banker: '🏦',
            stablemaster: '🐴',
            ferryman: '⛵',
            healer: '💊',
            scribe: '📜',
            noble: '👑',
            beggar: '🥺',
            traveler: '🎒',
            drunk: '🍷',
            scholar: '📚',
            priest: '⛪',
            robber: '🗡️',
            thief: '🦝',
            smuggler: '📦',
            mercenary: '⚔️',
            loan_shark: '💰',
            town_crier: '📢',
            guild_master: '🏛️',
            courier: '📨',
            spy: '🕵️',
            informant: '👁️',
            merchant: '🛒',
            vendor: '🏬'
        };

        return icons[type] || '👤';
    },

    getPersonaForNPC(npcData) {
        if (typeof NPCPersonaDatabase !== 'undefined') {
            return NPCPersonaDatabase.getPersona(npcData.type);
        }
        return null;
    },

    updateTurnsDisplay(response = null) {
        const turnsEl = document.getElementById('turns-remaining');
        if (!turnsEl) return;

        if (typeof NPCVoiceChatSystem !== 'undefined') {
            const npcId = this.currentNPC?.id || 'npc_unknown';
            const conversation = NPCVoiceChatSystem.getConversation(npcId);

            if (conversation) {
                const remaining = conversation.maxTurns - conversation.turnCount;
                turnsEl.textContent = `${remaining} exchange${remaining !== 1 ? 's' : ''} remaining`;

                if (remaining <= 0) {
                    turnsEl.className = 'turns-remaining ended';
                    turnsEl.textContent = 'Conversation ending...';
                } else if (remaining === 1) {
                    turnsEl.className = 'turns-remaining warning';
                } else {
                    turnsEl.className = 'turns-remaining';
                }
            }
        }
    },

    handleConversationEnd(response) {
        // disable input after final message
        setTimeout(() => {
            this.setInputEnabled(false);
            const turnsEl = document.getElementById('turns-remaining');
            if (turnsEl) {
                turnsEl.textContent = 'Conversation ended - click outside to close';
                turnsEl.className = 'turns-remaining ended';
            }
        }, 500);
    },

    setInputEnabled(enabled) {
        const input = document.getElementById('npc-chat-input');
        const sendBtn = document.getElementById('npc-chat-send');
        const quickBtns = document.querySelectorAll('.quick-response-btn');

        if (input) input.disabled = !enabled;
        if (sendBtn) sendBtn.disabled = !enabled;
        quickBtns.forEach(btn => btn.disabled = !enabled);
    },

    showVoiceIndicator() {
        const indicator = document.getElementById('npc-voice-indicator');
        if (indicator) {
            indicator.style.display = 'inline-flex';

            // hide when voice stops - with safety timeout to prevent memory leak
            let checkCount = 0;
            const maxChecks = 120; // 60 seconds max (120 * 500ms)
            const checkVoice = setInterval(() => {
                checkCount++;
                // stop the animation if voice ended or timeout hit
                if (typeof NPCVoiceChatSystem === 'undefined' ||
                    !NPCVoiceChatSystem.isVoicePlaying() ||
                    !document.getElementById('npc-voice-indicator') ||
                    checkCount >= maxChecks) {
                    if (indicator) indicator.style.display = 'none';
                    clearInterval(checkVoice);
                }
            }, 500);
        }
    },

    // ═══════════════════════════════════════════════════════════
    // GREETING GENERATION - let Ollama give NPCs their voice
    // ═══════════════════════════════════════════════════════════

    /**
     * Fetch greeting from Ollama and display it with typewriter effect + TTS
     * Falls back to hardcoded greetings only if Ollama is unavailable
     */
    async fetchAndDisplayGreeting(npcData) {
        const persona = this.getPersonaForNPC(npcData);

        // Show typing indicator while fetching from Ollama
        this.showTypingIndicator();

        try {
            // 🦙 Try to get AI-generated greeting from Ollama via NPCVoiceChatSystem
            if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.getGreeting) {
                const greetingResponse = await NPCVoiceChatSystem.getGreeting(npcData);

                this.hideTypingIndicator();

                if (greetingResponse && greetingResponse.text) {
                    // Use AI-generated greeting
                    console.log(`🦙 Got AI greeting for ${npcData.name}: "${greetingResponse.text.substring(0, 50)}..."`);
                    this.addNPCMessage(greetingResponse.text, true);

                    // Play voice with NPC-appropriate voice selection
                    if (NPCVoiceChatSystem.settings?.voiceEnabled) {
                        const voice = npcData.voice || npcData.type || persona?.voice || 'merchant';
                        NPCVoiceChatSystem.playVoice(greetingResponse.text, voice, npcData.name || 'NPC');
                    }
                    return;
                }

                // Check if fallbacks are disabled (AI-only mode)
                if (greetingResponse && greetingResponse.fallbacksDisabled) {
                    console.log('🎭 AI unavailable and fallbacks disabled - showing error message');
                    this.addNPCMessage("*The NPC stares at you blankly. (AI service unavailable - check Ollama)*", true);
                    return;
                }
            }

            // Ollama unavailable - check if fallbacks are allowed
            this.hideTypingIndicator();

            if (typeof NPCVoiceChatSystem !== 'undefined' && !NPCVoiceChatSystem.settings?.allowTextFallbacks) {
                console.log('🎭 Fallbacks disabled - not showing fallback greeting');
                this.addNPCMessage("*The NPC seems distracted. (AI service unavailable)*", true);
                return;
            }

            // Fallbacks allowed - use hardcoded response
            this.displayFallbackGreeting(npcData, persona);

        } catch (error) {
            console.warn('🎭 Greeting fetch failed:', error.message);
            this.hideTypingIndicator();

            // Check fallback settings
            if (typeof NPCVoiceChatSystem !== 'undefined' && !NPCVoiceChatSystem.settings?.allowTextFallbacks) {
                this.addNPCMessage("*Connection error. (Check if Ollama is running)*", true);
                return;
            }

            this.displayFallbackGreeting(npcData, persona);
        }
    },

    /**
     * Display hardcoded fallback greeting when Ollama is unavailable
     */
    displayFallbackGreeting(npcData, persona) {
        let greeting = null;

        // Try persona greetings first
        if (persona && persona.greetings && persona.greetings.length > 0) {
            greeting = persona.greetings[Math.floor(Math.random() * persona.greetings.length)];
        }

        // Try NPCVoiceChatSystem fallback
        if (!greeting && typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.getFallback) {
            greeting = NPCVoiceChatSystem.getFallback(npcData.type || 'merchant', 'greet');
        }

        // Last resort fallback
        if (!greeting) {
            greeting = "Greetings, traveler. How may I help you?";
        }

        console.log(`🎭 Using fallback greeting for ${npcData.name}`);
        this.addNPCMessage(greeting, true);

        // Still play voice for fallback
        if (typeof NPCVoiceChatSystem !== 'undefined' && NPCVoiceChatSystem.settings?.voiceEnabled) {
            const voice = npcData.voice || npcData.type || persona?.voice || 'merchant';
            NPCVoiceChatSystem.playVoice(greeting, voice, npcData.name || 'NPC');
        }
    },

    // ═══════════════════════════════════════════════════════════
    // utilities - helper functions for the digital dialogue
    // ═══════════════════════════════════════════════════════════

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getTimeString() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

// ═══════════════════════════════════════════════════════════════
// global helper - easy access for merchants and events
// ═══════════════════════════════════════════════════════════════

// helper function to open NPC chat from anywhere
window.openNPCChat = function(npcData) {
    if (typeof NPCChatUI !== 'undefined') {
        NPCChatUI.open(npcData);
    } else {
        // chat UI not loaded - user sees nothing, no console spam
        addMessage?.('The merchant is unavailable.');
    }
};

// open merchant chat - gets current merchant from NPCMerchantSystem
NPCChatUI.openMerchantChat = function() {
    if (typeof NPCMerchantSystem === 'undefined') {
        // merchant system not loaded - graceful user message
        addMessage?.('The merchant seems to be away...');
        return;
    }

    let merchant = NPCMerchantSystem.getCurrentMerchant();

    // no merchant here? summon one from the void if we can
    if (!merchant && game?.currentLocation?.id) {
        const locationId = game.currentLocation.id;
        console.log(`🗨️ No merchant for ${locationId}, generating one...`);

        // conjure a temporary merchant for this location
        const personalityKeys = Object.keys(NPCMerchantSystem.personalityTypes);
        const personalityId = personalityKeys[Math.floor(Math.random() * personalityKeys.length)];
        const personality = NPCMerchantSystem.personalityTypes[personalityId];

        const firstNames = ['Aldric', 'Mira', 'Thorin', 'Elara', 'Garrett', 'Lysa', 'Marcus', 'Seraphina'];
        const lastNames = ['Goldweaver', 'Swifthand', 'Ironpurse', 'Moonwhisper', 'Coinsworth', 'Fairweather'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        NPCMerchantSystem.merchants[locationId] = {
            id: `merchant_${locationId}`,
            name: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName,
            location: locationId,
            personality: personality,
            specialties: NPCMerchantSystem.generateSpecialties(),
            inventory: {},
            timesTraded: 0,
            totalGoldTraded: 0,
            lastTrade: null,
            relationship: 0
        };

        merchant = NPCMerchantSystem.merchants[locationId];
        console.log(`🗨️ Created merchant ${merchant.name} for ${locationId}`);
    }

    if (!merchant) {
        // no merchant available - graceful user message
        addMessage?.('There is no merchant here to talk to.');
        return;
    }

    const location = game?.currentLocation;

    // assemble the puppet's data structure from merchant config - give it a soul (kind of)
    const npcData = window.createNPCDataFromMerchant(merchant, location);

    // summon the chat interface - let the player speak to this hollow merchant
    NPCChatUI.open(npcData);
};

// helper to create NPC data from merchant
window.createNPCDataFromMerchant = function(merchant, location) {
    const persona = typeof NPCPersonaDatabase !== 'undefined'
        ? NPCPersonaDatabase.getPersonaForMerchant(merchant)
        : null;

    return {
        id: merchant.id || `merchant_${Date.now()}`,
        name: merchant.name || 'Merchant',
        type: persona?.type || 'merchant',
        personality: persona?.personality || 'friendly',
        speakingStyle: persona?.speakingStyle || 'casual',
        voice: persona?.voice || 'nova',
        currentStock: merchant.inventory,
        location: location?.name || 'Unknown',
        specialties: merchant.specialties
    };
};

// ═══════════════════════════════════════════════════════════════
// initialization - awaken the chat interface
// ═══════════════════════════════════════════════════════════════

// register with Bootstrap
Bootstrap.register('NPCChatUI', () => NPCChatUI.init(), {
    dependencies: ['NPCManager', 'PanelManager'],
    priority: 65,
    severity: 'optional'
});

console.log('🗨️ NPC Chat UI loaded - digital conversations await');
